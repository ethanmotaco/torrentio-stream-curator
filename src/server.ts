import express, { type Request, type Response } from "express";
import { LRUCache } from "lru-cache";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { decodeConfig } from "./config/codec.js";
import { fetchStreams } from "./torrentio/client.js";
import { parseAll } from "./parser/index.js";
import { pickStream, type PickResult } from "./engine/pick.js";
import { probeUrl } from "./engine/probe.js";
import { titleMatches } from "./engine/title-match.js";
import { consensusFilter } from "./engine/consensus.js";
import { StickyStore } from "./engine/sticky.js";
import { ResponseCache } from "./cache/response.js";
import { renderConfigPage } from "./config-page/handler.js";
import { fetchCinemeta } from "./cinemeta/client.js";
import { recordPick, recordInstall, readStats } from "./stats/counter.js";
import type { ParsedStream, RawStream } from "./parser/types.js";

const MANIFEST_BASE = {
  id: "community.torrentiostreamcurator",
  version: "1.0.0",
  name: "Torrentio Stream Curator",
  description: "Curates Torrentio + Real Debrid streams: picks one best match per title, validates playback, falls back if blocked.",
  resources: ["stream"],
  types: ["movie", "series"],
  catalogs: [],
};

function buildManifest(configured: boolean, baseUrl: string) {
  return {
    ...MANIFEST_BASE,
    logo: `${baseUrl}/icon.svg`,
    background: `${baseUrl}/icon.svg`,
    behaviorHints: { configurable: true, configurationRequired: !configured },
  };
}

function originOf(req: Request): string {
  // Manual override wins for self-hosters behind their own reverse proxy.
  const override = process.env.PUBLIC_URL;
  if (override) return override.replace(/\/+$/, "");
  const proto = (req.headers["x-forwarded-proto"] as string | undefined)?.split(",")[0].trim() ?? req.protocol;
  let host = (req.headers["x-forwarded-host"] as string | undefined) ?? req.get("host") ?? "localhost";
  // Beamup's wrapped dokku rewrites Host to the internal container slug
  // ("<hash>-<projectname>") with no domain suffix. Env-var injection into
  // the swarm container is broken on the platform, so detect the pattern at
  // request time and synthesize the public origin.
  if (host && !host.includes(".") && host !== "localhost") {
    host = `${host}.baby-beamup.club`;
  }
  return `${proto}://${host}`;
}

interface CachedPick {
  streams: Array<Record<string, unknown>>;
}

function parseSeriesId(id: string): { imdb: string; season: number | null } {
  const parts = id.split(":");
  if (parts.length >= 2) {
    const season = parseInt(parts[1], 10);
    return { imdb: parts[0], season: Number.isFinite(season) ? season : null };
  }
  return { imdb: id, season: null };
}

const PROBE_PARALLEL = 10;
const PROBE_TIMEOUT_MS = 3000;

// Only these keys cross from upstream Torrentio JSON into our response.
// Drops anything attacker-controlled that isn't in the Stremio stream spec.
const STREAM_PROP_WHITELIST = [
  "url",
  "infoHash",
  "fileIdx",
  "title",
  "behaviorHints",
  "sources",
  "externalUrl",
  "ytId",
] as const;

function sanitizeRaw(raw: RawStream): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of STREAM_PROP_WHITELIST) {
    if (raw[k] !== undefined) out[k] = raw[k];
  }
  return out;
}

function safeTitleLine(title: unknown): string {
  return String(title ?? "").split("\n")[0].slice(0, 80);
}

function describePick(p: ParsedStream): string {
  const bits: string[] = [];
  if (p.resolution) bits.push(p.resolution);
  if (p.hdr) bits.push(p.hdr.toUpperCase().includes("DV") || /dolby/i.test(p.hdr) ? "DV" : "HDR");
  if (p.audio) bits.push(p.audio);
  if (p.sizeGB) bits.push(`${p.sizeGB} GB`);
  return bits.join(" | ");
}

function buildStreamPayload(chosen: ParsedStream | null, droppedFilters: PickResult["droppedFilters"]): CachedPick {
  if (chosen === null) return { streams: [] };
  const tag = droppedFilters.length > 0
    ? ` (relaxed: ${droppedFilters.join(", ")})`
    : "";
  const summary = describePick(chosen);
  const name = summary ? `▶ Curator${tag}\n${summary}` : `▶ Curator${tag}`;
  const out = { ...sanitizeRaw(chosen.raw), name };
  return { streams: [out] };
}

async function probeUntilOk(candidates: ParsedStream[]): Promise<ParsedStream | null> {
  const batch = candidates.slice(0, PROBE_PARALLEL);
  if (batch.length === 0) return null;
  const probes = await Promise.all(batch.map(async (c) => {
    const url = typeof c.raw.url === "string" ? c.raw.url : null;
    if (!url) return { c, ok: true, status: null as number | null, reason: "no-url-skip-probe" };
    const r = await probeUrl(url, PROBE_TIMEOUT_MS);
    return { c, ok: r.ok, status: r.status, reason: r.reason };
  }));
  for (const p of probes) {
    console.log(`  probe ${p.ok ? "OK " : "FAIL"} [${p.status ?? "-"}] ${safeTitleLine(p.c.raw.title)}`);
  }
  return probes.find(p => p.ok)?.c ?? null;
}

export function createApp(): express.Express {
  const app = express();
  app.disable("x-powered-by");
  // Behind Beamup / reverse proxies: trust X-Forwarded-* one hop deep so
  // express-rate-limit can key on the real client IP.
  app.set("trust proxy", 1);

  const sticky = new StickyStore();
  const cache = new ResponseCache<CachedPick>({ max: 5000, ttlMs: 60 * 60 * 1000 });
  // Bounded recent-config set so install-deduplication doesn't grow forever
  // on a long-running Beamup process.
  const seenConfigs = new LRUCache<string, true>({ max: 10_000, ttl: 24 * 60 * 60 * 1000 });

  // Hot-path rate limit on the only outbound-fetch endpoint. Keyed by IP.
  // 120 req/min/IP leaves room for catalog binges while bounding abuse.
  const streamLimiter = simpleRateLimit({ windowMs: 60_000, max: 120 });

  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    // Scrub the base64 config segment from request logs so debrid tokens stay
    // out of stdout (and out of whatever log retention the host uses).
    const safeUrl = req.url.replace(/^\/[A-Za-z0-9_-]{40,}/, "/<cfg>");
    console.log(`[${new Date().toISOString()}] ${req.method} ${safeUrl}`);
    next();
  });

  app.options(/.*/, (_req, res) => { res.sendStatus(204); });

  // Lightweight healthcheck for Beamup / uptime monitors / Docker HEALTHCHECK.
  app.get(["/health", "/healthz"], (_req, res) => {
    res.json({ ok: true, uptimeSec: Math.round(process.uptime()) });
  });

  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const assetsDir = path.resolve(moduleDir, "..", "assets");
  app.use("/assets", express.static(assetsDir, { maxAge: "1h" }));
  app.get("/icon.svg", (_req, res) => res.sendFile(path.join(assetsDir, "icon.svg")));
  app.get("/logo.svg", (_req, res) => res.sendFile(path.join(assetsDir, "logo.svg")));
  app.get("/favicon.ico", (_req, res) => {
    res.type("image/svg+xml").sendFile(path.join(assetsDir, "icon.svg"));
  });
  app.get("/favicon.svg", (_req, res) => res.sendFile(path.join(assetsDir, "icon.svg")));

  app.get("/", (_req, res) => res.redirect("/configure"));

  app.get("/configure", (_req, res) => {
    res.type("html").send(renderConfigPage());
  });

  app.get("/:config/configure", (_req, res) => {
    res.type("html").send(renderConfigPage());
  });

  app.get("/manifest.json", (req: Request, res) => {
    res.json(buildManifest(false, originOf(req)));
  });

  app.get("/:config/manifest.json", (req: Request, res: Response) => {
    const config = String(req.params.config);
    try {
      decodeConfig(config);
    } catch {
      res.status(400).json({ error: "invalid config" });
      return;
    }
    if (!seenConfigs.has(config)) {
      seenConfigs.set(config, true);
      recordInstall().catch(() => { /* counter is best-effort */ });
    }
    res.json(buildManifest(true, originOf(req)));
  });

  app.get("/stats.json", async (_req, res) => {
    const stats = await readStats();
    res.json(stats);
  });

  app.get("/:config/stream/:type/:id.json", streamLimiter, async (req: Request, res: Response) => {
    const encoded = String(req.params.config);
    const type = String(req.params.type);
    const id = String(req.params.id);
    let cfg;
    try {
      cfg = decodeConfig(encoded);
    } catch {
      res.status(400).json({ error: "invalid config" });
      return;
    }
    if (type !== "movie" && type !== "series") {
      res.status(400).json({ error: "unsupported type" });
      return;
    }
    const cleanId = id.replace(/\.json$/, "");
    const cacheKey = ResponseCache.makeKey(encoded, type, cleanId);
    const cached = cache.get(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }
    const [raws, meta] = await Promise.all([
      fetchStreams(cfg.torrentioUrl, type, cleanId),
      fetchCinemeta(type, cleanId),
    ]);
    console.log(`  torrentio returned ${raws.length} streams for ${type}/${cleanId}`);
    if (meta) console.log(`  cinemeta: ${meta.name}${meta.year ? ` (${meta.year})` : ""}`);
    else console.log(`  cinemeta: no metadata`);
    if (raws.length === 0) {
      const empty: CachedPick = { streams: [] };
      cache.setNegative(cacheKey, empty, 60 * 1000);
      res.json(empty);
      return;
    }
    const parsedAll = parseAll(raws);
    let parsed = parsedAll;

    // Stage 1: cinemeta title match (drops cross-IMDB-mislabeled streams)
    if (meta) {
      const filtered: ParsedStream[] = [];
      const rejected: ParsedStream[] = [];
      for (const p of parsedAll) {
        const m = titleMatches(meta.name, meta.year, p.parsedTitle, p.year);
        if (m.matches) filtered.push(p);
        else rejected.push(p);
      }
      if (filtered.length > 0) {
        parsed = filtered;
        if (rejected.length > 0) {
          console.log(`  cinemeta-filter dropped ${rejected.length}/${parsedAll.length}:`);
          for (const r of rejected.slice(0, 5)) {
            console.log(`    [parsedTitle="${r.parsedTitle ?? "?"}"|year=${r.year ?? "?"}] ${safeTitleLine(r.raw.title)}`);
          }
        }
      } else if (parsedAll.length > 0) {
        console.log(`  cinemeta-filter would drop all ${parsedAll.length}; skipping (cinemeta likely wrong)`);
      }
    }

    // Stage 2: consensus filter (catches mislabeled streams when cinemeta unreliable)
    {
      const before = parsed.length;
      const cons = consensusFilter(parsed);
      if (cons.dropped.length > 0) {
        console.log(`  consensus-filter dropped ${cons.dropped.length}/${before} (consensus={${[...cons.consensusTokens].slice(0, 8).join(", ")}}):`);
        for (const r of cons.dropped.slice(0, 5)) {
          console.log(`    [parsedTitle="${r.parsedTitle ?? "?"}"] ${safeTitleLine(r.raw.title)}`);
        }
        parsed = cons.kept;
      }
    }
    const seriesInfo = type === "series" ? parseSeriesId(cleanId) : { imdb: cleanId, season: null };
    const result = pickStream(parsed, cfg, sticky, type, seriesInfo.imdb, seriesInfo.season);
    if (parsed.length > 0 && (!result || result.ranked.length < 3)) {
      console.log(`  all parsed (${parsed.length}):`);
      for (const p of parsed) {
        const rd = p.rdBlocked ? `RDBLOCK:${p.rdBlockReason}` : "ok";
        console.log(`    [${p.resolution ?? "?"}|${p.cached ? "cached" : "uncached"}|${p.sizeGB ?? "?"}GB|${p.languages.join(",") || "-"}|${rd}] ${safeTitleLine(p.raw.title)}`);
      }
    }
    // Build probe chain: (1) filtered+ranked, then (2) anything else parsed (fallback if all ranked fail)
    const chain: ParsedStream[] = [];
    const inChain = new Set<ParsedStream>();
    const append = (s: ParsedStream) => { if (!inChain.has(s)) { inChain.add(s); chain.push(s); } };
    if (result) {
      for (const s of result.ranked) append(s);
      console.log(`  ranked=${result.ranked.length} dropped=${result.droppedFilters.join(",") || "none"}; top ${Math.min(PROBE_PARALLEL, result.ranked.length)}:`);
      for (const c of result.ranked.slice(0, PROBE_PARALLEL)) {
        console.log(`    [${c.resolution ?? "?"}|${c.audio ?? "?"}|${c.cached ? "cached" : "uncached"}|${c.sizeGB ?? "?"}GB|${c.group ?? "?"}] ${safeTitleLine(c.raw.title)}`);
      }
    } else {
      console.log(`  no filter+relax survivors; will probe ALL parsed as fallback`);
    }
    for (const s of parsed) append(s);

    if (chain.length === 0) {
      const empty: CachedPick = { streams: [] };
      cache.setNegative(cacheKey, empty, 60 * 1000);
      res.json(empty);
      return;
    }

    let chosen = await probeUntilOk(chain);
    const droppedFilters = result?.droppedFilters ?? ([] as Array<keyof import("./config/schema.js").HardFilters>);

    if (chosen === null) {
      // Nothing probed OK across all candidates. Serve top-ranked anyway — better to attempt
      // than return empty. RD may still reject at play time but the user sees the diagnostic.
      chosen = chain[0];
      console.log(`  all ${Math.min(chain.length, PROBE_PARALLEL)} probes failed; serving top candidate as last resort: ${safeTitleLine(chosen.raw.title)}`);
    }

    sticky.set(cfg.sticky, type, seriesInfo.imdb, seriesInfo.season, chosen.group);
    console.log(`  winner: ${safeTitleLine(chosen.raw.title)}`);
    recordPick().catch(() => { /* counter is best-effort */ });
    const payload = buildStreamPayload(chosen, droppedFilters);
    cache.set(cacheKey, payload);
    res.json(payload);
  });

  return app;
}

// Minimal in-memory rate limiter. Stays in-process (Beamup is single-instance
// per addon) and avoids a heavyweight dep. Keyed by req.ip (which respects
// trust-proxy above). Fixed window, sliding-on-expiry.
function simpleRateLimit(opts: { windowMs: number; max: number }) {
  const hits = new LRUCache<string, { count: number; resetAt: number }>({ max: 10_000, ttl: opts.windowMs });
  return (req: Request, res: Response, next: () => void): void => {
    const key = req.ip ?? req.socket.remoteAddress ?? "unknown";
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry || entry.resetAt < now) {
      hits.set(key, { count: 1, resetAt: now + opts.windowMs });
      next();
      return;
    }
    entry.count += 1;
    if (entry.count > opts.max) {
      const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
      res.setHeader("Retry-After", String(retryAfter));
      res.status(429).json({ error: "rate limited" });
      return;
    }
    next();
  };
}
