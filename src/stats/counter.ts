import { request } from "undici";
import { setDefaultResultOrder } from "node:dns";

// Beamup's CherryServers host has flaky IPv6 egress; abacus's AAAA records
// resolve but TCP connect to the v6 address hangs until the timeout fires.
// Prefer IPv4 results from DNS process-wide so undici hits v4 first.
setDefaultResultOrder("ipv4first");

/**
 * Free public counter service (no signup, no auth).
 * Namespace + key combos are global; we use a long random namespace to avoid collisions.
 *
 * API:
 *   GET /hit/{ns}/{key}    increment by 1, return { value }
 *   GET /get/{ns}/{key}    read-only, return { value }
 *   POST /create/{ns}/{key}?value=0  initialize
 */
const ABACUS_BASE = "https://abacus.jasoncameron.dev";

// IMPORTANT: change this if forking. Random unguessable string scoped to this deploy.
const NAMESPACE = process.env.COUNTER_NAMESPACE ?? "torrentio-stream-curator-3f8a1d2b";

const COUNTER_TIMEOUT_MS = 2500;

interface AbacusValue { value?: number }

async function callAbacus(path: string): Promise<number | null> {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), COUNTER_TIMEOUT_MS);
  try {
    const res = await request(`${ABACUS_BASE}${path}`, {
      method: "GET",
      signal: ac.signal,
      headersTimeout: COUNTER_TIMEOUT_MS,
      bodyTimeout: COUNTER_TIMEOUT_MS,
    });
    if (res.statusCode >= 400) {
      const txt = await res.body.text().catch(() => "");
      console.warn(`abacus ${path} status=${res.statusCode} body=${txt.slice(0, 200)}`);
      return null;
    }
    const text = await res.body.text();
    let body: AbacusValue;
    try { body = JSON.parse(text) as AbacusValue; }
    catch {
      console.warn(`abacus ${path} parse failed; body=${text.slice(0, 200)}`);
      return null;
    }
    return typeof body.value === "number" ? body.value : null;
  } catch (e) {
    const err = e as (Error & { code?: string; cause?: { code?: string; message?: string } });
    console.warn(`abacus ${path} error: name=${err.name} code=${err.code ?? "-"} msg=${err.message || "(empty)"} cause=${err.cause?.code ?? "-"}/${err.cause?.message ?? "-"}`);
    return null;
  } finally {
    clearTimeout(t);
  }
}

export function recordPick(): Promise<number | null> {
  return callAbacus(`/hit/${NAMESPACE}/picks`);
}

export function recordInstall(): Promise<number | null> {
  return callAbacus(`/hit/${NAMESPACE}/installs`);
}

export async function readStats(): Promise<{ picks: number; installs: number }> {
  const [picks, installs] = await Promise.all([
    callAbacus(`/get/${NAMESPACE}/picks`),
    callAbacus(`/get/${NAMESPACE}/installs`),
  ]);
  return { picks: picks ?? 0, installs: installs ?? 0 };
}

export function getNamespace(): string {
  return NAMESPACE;
}
