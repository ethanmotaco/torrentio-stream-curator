import { request } from "undici";
import type { RawStream } from "../parser/types.js";
import type { TorrentioResponse } from "./types.js";
import { assertPublicHttpUrl, UnsafeUrlError } from "../util/safe-url.js";

export function normalizeBaseUrl(url: string): string {
  let u = url.trim();
  u = u.replace(/\/manifest\.json$/, "");
  u = u.replace(/\/configure\/?$/, "");
  u = u.replace(/\/$/, "");
  return u;
}

const RETRY_DELAY_MS = 500;
// Torrentio responses are JSON lists of streams; 5MB is a generous cap that
// still bounds memory if upstream (or an attacker-controlled URL) returns junk.
const MAX_RESPONSE_BYTES = 5 * 1024 * 1024;
const USER_AGENT = "torrentio-stream-curator/1.0 (+https://github.com/ethanmotaco/torrentio-stream-curator)";

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function readBodyCapped(body: AsyncIterable<Uint8Array>): Promise<string | null> {
  let total = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of body) {
    total += chunk.byteLength;
    if (total > MAX_RESPONSE_BYTES) return null;
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
}

// Returns null on transient failure (retry candidate), [] on permanent
// failure (don't retry — no streams to serve).
async function fetchOnce(url: string): Promise<RawStream[] | null> {
  try {
    await assertPublicHttpUrl(url);
  } catch (e) {
    if (e instanceof UnsafeUrlError) console.warn(`  torrentio refused: ${e.message}`);
    return [];
  }
  try {
    const res = await request(url, {
      method: "GET",
      headers: { "user-agent": USER_AGENT, accept: "application/json" },
      headersTimeout: 5000,
      bodyTimeout: 10000,
    });
    // Transient: retry. 429/503 are explicit rate-limit / overload signals.
    if (res.statusCode >= 500 || res.statusCode === 429) {
      try { await res.body.dump(); } catch { /* ignore */ }
      return null;
    }
    if (res.statusCode >= 400) {
      try { await res.body.dump(); } catch { /* ignore */ }
      return [];
    }
    const text = await readBodyCapped(res.body);
    if (text === null) return [];
    let parsed: TorrentioResponse;
    try {
      parsed = JSON.parse(text) as TorrentioResponse;
    } catch {
      return [];
    }
    if (!parsed || !Array.isArray(parsed.streams)) return [];
    return parsed.streams;
  } catch {
    return null;
  }
}

export async function fetchStreams(
  baseUrl: string,
  type: string,
  id: string,
): Promise<RawStream[]> {
  const url = `${normalizeBaseUrl(baseUrl)}/stream/${type}/${encodeURIComponent(id)}.json`;
  const first = await fetchOnce(url);
  if (first !== null) return first;
  await sleep(RETRY_DELAY_MS);
  const second = await fetchOnce(url);
  return second ?? [];
}
