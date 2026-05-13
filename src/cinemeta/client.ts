import { request } from "undici";
import { assertPublicHttpUrl, UnsafeUrlError } from "../util/safe-url.js";

export interface CinemetaMeta {
  name: string;
  year: number | null;
}

const CINEMETA_BASE = "https://v3-cinemeta.strem.io";
const MAX_RESPONSE_BYTES = 1 * 1024 * 1024;
const USER_AGENT = "torrentio-stream-curator/1.0 (+https://github.com/ethanmotaco/torrentio-stream-curator)";

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

export async function fetchCinemeta(type: string, id: string): Promise<CinemetaMeta | null> {
  if (type !== "movie" && type !== "series") return null;
  const imdb = id.split(":")[0];
  if (!/^tt\d+$/.test(imdb)) return null;
  const url = `${CINEMETA_BASE}/meta/${type}/${imdb}.json`;
  try {
    await assertPublicHttpUrl(url);
  } catch (e) {
    if (e instanceof UnsafeUrlError) console.warn(`  cinemeta refused: ${e.message}`);
    return null;
  }
  try {
    const res = await request(url, {
      method: "GET",
      headers: { "user-agent": USER_AGENT, accept: "application/json" },
      headersTimeout: 3000,
      bodyTimeout: 5000,
    });
    if (res.statusCode !== 200) {
      try { await res.body.dump(); } catch { /* ignore */ }
      return null;
    }
    const text = await readBodyCapped(res.body);
    if (text === null) return null;
    let body: { meta?: { name?: string; year?: string | number; releaseInfo?: string } };
    try { body = JSON.parse(text); } catch { return null; }
    const meta = body?.meta;
    if (!meta?.name) return null;
    let year: number | null = null;
    if (typeof meta.year === "number") year = meta.year;
    else if (typeof meta.year === "string") {
      const m = meta.year.match(/\d{4}/);
      if (m) year = parseInt(m[0], 10);
    }
    if (year === null && typeof meta.releaseInfo === "string") {
      const m = meta.releaseInfo.match(/\d{4}/);
      if (m) year = parseInt(m[0], 10);
    }
    return { name: meta.name, year };
  } catch {
    return null;
  }
}
