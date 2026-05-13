import { request } from "undici";
import { assertPublicHttpUrl, UnsafeUrlError } from "../util/safe-url.js";

export interface ProbeResult {
  ok: boolean;
  status: number | null;
  reason: string | null;
}

const USER_AGENT = "torrentio-stream-curator/1.0 (+https://github.com/ethanmotaco/torrentio-stream-curator)";

export async function probeUrl(url: string, timeoutMs = 6000): Promise<ProbeResult> {
  // Defense-in-depth: the URL comes from upstream Torrentio JSON, which itself
  // can be attacker-controlled if the user supplies a malicious torrentioUrl.
  try {
    await assertPublicHttpUrl(url);
  } catch (e) {
    const reason = e instanceof UnsafeUrlError ? e.message : "unsafe-url";
    return { ok: false, status: null, reason };
  }
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await request(url, {
      method: "HEAD",
      signal: ac.signal,
      headers: { "user-agent": USER_AGENT },
      headersTimeout: timeoutMs,
      bodyTimeout: timeoutMs,
    });
    const status = res.statusCode;
    try { await res.body.dump(); } catch { /* HEAD has no body but dump is safe */ }
    if (status >= 200 && status < 400) {
      return { ok: true, status, reason: null };
    }
    return { ok: false, status, reason: `http ${status}` };
  } catch (e) {
    return { ok: false, status: null, reason: (e as Error).name || "error" };
  } finally {
    clearTimeout(timer);
  }
}
