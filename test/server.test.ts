import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { MockAgent, setGlobalDispatcher, getGlobalDispatcher, type Dispatcher } from "undici";
import http from "node:http";
import { createApp } from "../src/server.js";
import { encodeConfig } from "../src/config/codec.js";
import type { Config } from "../src/config/schema.js";
import movieFixture from "./fixtures/torrentio-movie.json" with { type: "json" };
import seriesFixture from "./fixtures/torrentio-series.json" with { type: "json" };

const cfg: Config = {
  torrentioUrl: "https://torrentio.strem.fun/abc/manifest.json",
  profile: "1080p-balanced",
  hardFilters: {
    maxResolution: "1080p",
    minResolution: "any",
    requireCached: true,
    maxSizeGB: null,
    minSeeders: null,
    requireHDR: false,
    excludeHDR: false,
    requireAudio: null,
    languages: null,
    excludeRdBlocked: true,
  },
  tiebreakers: ["resolution_desc", "size_smaller"],
  preferredGroups: [],
  sticky: { enabled: true, scope: "season" },
};

let agent: MockAgent;
let prev: Dispatcher;
let server: { httpServer: http.Server; port: number };

function startServer() {
  const app = createApp();
  const httpServer = app.listen(0);
  const addr = httpServer.address();
  if (typeof addr !== "object" || addr === null) throw new Error("no address");
  return { httpServer, port: addr.port };
}

async function get(port: number, path: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    http.get({ host: "127.0.0.1", port, path }, (res) => {
      let body = "";
      res.on("data", c => body += c);
      res.on("end", () => resolve({ status: res.statusCode ?? 0, body }));
      res.on("error", reject);
    }).on("error", reject);
  });
}

beforeEach(() => {
  prev = getGlobalDispatcher();
  agent = new MockAgent();
  agent.disableNetConnect();
  setGlobalDispatcher(agent);
  server = startServer();
});

afterEach(async () => {
  server.httpServer.close();
  await agent.close();
  setGlobalDispatcher(prev);
});

describe("server", () => {
  it("GET /:config/manifest.json returns manifest with stream resource", async () => {
    const enc = encodeConfig(cfg);
    const res = await get(server.port, `/${enc}/manifest.json`);
    expect(res.status).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.id).toBe("community.torrentiostreamcurator");
    expect(body.name).toBe("Torrentio Stream Curator");
    expect(body.resources).toContain("stream");
    expect(body.types).toEqual(["movie", "series"]);
    expect(body.logo).toMatch(/icon\.svg$/);
  });

  it("GET /:config/manifest.json has configurationRequired=false", async () => {
    const enc = encodeConfig(cfg);
    const res = await get(server.port, `/${enc}/manifest.json`);
    const body = JSON.parse(res.body);
    expect(body.behaviorHints.configurationRequired).toBe(false);
    expect(body.behaviorHints.configurable).toBe(true);
  });

  it("GET /manifest.json (no config) has configurationRequired=true", async () => {
    const res = await get(server.port, `/manifest.json`);
    expect(res.status).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.behaviorHints.configurationRequired).toBe(true);
  });

  it("GET /:config/stream/movie/:id.json returns single picked stream", async () => {
    const pool = agent.get("https://torrentio.strem.fun");
    pool.intercept({ path: "/abc/stream/movie/tt0816692.json", method: "GET" })
      .reply(200, movieFixture);
    const enc = encodeConfig(cfg);
    const res = await get(server.port, `/${enc}/stream/movie/tt0816692.json`);
    expect(res.status).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.streams).toHaveLength(1);
    expect(body.streams[0].name).toMatch(/Curator/);
    expect(body.streams[0].infoHash).toBe("bbbb");
  });

  it("GET stream with bad config returns 400", async () => {
    const res = await get(server.port, `/notbase64/stream/movie/tt0816692.json`);
    expect(res.status).toBe(400);
  });

  it("GET stream with no Torrentio results returns empty array", async () => {
    const pool = agent.get("https://torrentio.strem.fun");
    pool.intercept({ path: "/abc/stream/movie/ttZZZ.json", method: "GET" })
      .reply(200, { streams: [] });
    const enc = encodeConfig(cfg);
    const res = await get(server.port, `/${enc}/stream/movie/ttZZZ.json`);
    expect(res.status).toBe(200);
    expect(JSON.parse(res.body).streams).toEqual([]);
  });

  it("GET series stream parses IMDB:season:episode id", async () => {
    const pool = agent.get("https://torrentio.strem.fun");
    pool.intercept({ path: "/abc/stream/series/tt1%3A1%3A1.json", method: "GET" })
      .reply(200, seriesFixture);
    const enc = encodeConfig(cfg);
    const res = await get(server.port, `/${enc}/stream/series/tt1:1:1.json`);
    expect(res.status).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.streams).toHaveLength(1);
  });

  it("GET /configure returns HTML", async () => {
    const res = await get(server.port, "/configure/");
    expect(res.status).toBe(200);
    expect(res.body).toMatch(/<html/i);
  });
});

describe("configure page integration", () => {
  it("page contains form fields and install URL builder script", async () => {
    const res = await get(server.port, "/configure/");
    expect(res.body).toMatch(/torrentioUrl/);
    expect(res.body).toMatch(/profile/);
    expect(res.body).toMatch(/Install/i);
    expect(res.body).toMatch(/manifest\.json/);
  });

  it("inline configure-page scripts parse as valid JavaScript", async () => {
    // Regression guard: the template lives inside a TS template literal, so
    // any backslash needed in the emitted JS (e.g. regex \/) must be doubled
    // in the source. A missed double-escape produces a SyntaxError at script
    // parse time and silently breaks the entire page.
    const res = await get(server.port, "/configure/");
    const scripts = [...res.body.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
    expect(scripts.length).toBeGreaterThanOrEqual(1);
    for (const body of scripts) {
      expect(() => new Function(body)).not.toThrow();
    }
  });
});

describe("security hardening", () => {
  it("GET /health returns ok JSON", async () => {
    const res = await get(server.port, "/health");
    expect(res.status).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.ok).toBe(true);
    expect(typeof body.uptimeSec).toBe("number");
  });

  it("GET /healthz returns ok JSON", async () => {
    const res = await get(server.port, "/healthz");
    expect(res.status).toBe(200);
    expect(JSON.parse(res.body).ok).toBe(true);
  });

  it("does not expose x-powered-by header", async () => {
    const res = await new Promise<http.IncomingHttpHeaders>((resolve, reject) => {
      http.get({ host: "127.0.0.1", port: server.port, path: "/health" }, (r) => {
        r.resume();
        resolve(r.headers);
      }).on("error", reject);
    });
    expect(res["x-powered-by"]).toBeUndefined();
  });

  it("rejects config with private-IP torrentioUrl at decode time", async () => {
    const malicious: Config = { ...cfg, torrentioUrl: "http://169.254.169.254/manifest.json" };
    // encodeConfig is a pure JSON encode — it doesn't validate. Server-side decode does.
    const enc = encodeConfig(malicious);
    const res = await get(server.port, `/${enc}/stream/movie/tt0816692.json`);
    expect(res.status).toBe(400);
  });

  it("rejects config with file:// torrentioUrl at decode time", async () => {
    const malicious: Config = { ...cfg, torrentioUrl: "file:///etc/passwd" };
    const enc = encodeConfig(malicious);
    const res = await get(server.port, `/${enc}/manifest.json`);
    expect(res.status).toBe(400);
  });

  it("response stream payload only contains whitelisted keys plus name", async () => {
    const pool = agent.get("https://torrentio.strem.fun");
    pool.intercept({ path: "/abc/stream/movie/tt0816692.json", method: "GET" }).reply(200, {
      streams: [{
        name: "Torrentio\n1080p\n[RD+] 4.1 GB",
        title: "Movie.2024.1080p.BluRay.x264.AC3-RARBG\n👤 200 💾 4.1 GB",
        infoHash: "bbbb",
        // attacker-injected fields:
        __proto__attack: { evil: true },
        evilKey: "should not appear",
        someInternal: 42,
      }],
    });
    const enc = encodeConfig(cfg);
    const res = await get(server.port, `/${enc}/stream/movie/tt0816692.json`);
    const body = JSON.parse(res.body);
    expect(body.streams).toHaveLength(1);
    const s = body.streams[0];
    expect(s).not.toHaveProperty("evilKey");
    expect(s).not.toHaveProperty("someInternal");
    expect(s).not.toHaveProperty("__proto__attack");
    expect(s.infoHash).toBe("bbbb");
    expect(s.name).toMatch(/Curator/);
  });

  it("400 on invalid config does not leak Zod issue details", async () => {
    const malicious: Config = { ...cfg, torrentioUrl: "http://10.0.0.1/" };
    const enc = encodeConfig(malicious);
    const res = await get(server.port, `/${enc}/stream/movie/tt0816692.json`);
    expect(res.status).toBe(400);
    const body = JSON.parse(res.body);
    // Generic message only — no Zod paths, no offending values.
    expect(body.error).toBe("invalid config");
    expect(body).not.toHaveProperty("issues");
  });
});
