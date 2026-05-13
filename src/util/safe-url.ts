import { lookup } from "node:dns/promises";
import net from "node:net";

// IPv4 ranges that must never be reachable from a public addon:
// loopback, link-local, private, CGNAT, multicast, reserved, broadcast.
const PRIVATE_V4_RANGES: ReadonlyArray<readonly [number, number]> = (() => {
  const ranges: Array<[string, string]> = [
    ["0.0.0.0", "0.255.255.255"],
    ["10.0.0.0", "10.255.255.255"],
    ["100.64.0.0", "100.127.255.255"],
    ["127.0.0.0", "127.255.255.255"],
    ["169.254.0.0", "169.254.255.255"],
    ["172.16.0.0", "172.31.255.255"],
    ["192.0.0.0", "192.0.0.255"],
    ["192.168.0.0", "192.168.255.255"],
    ["198.18.0.0", "198.19.255.255"],
    ["224.0.0.0", "239.255.255.255"],
    ["240.0.0.0", "255.255.255.255"],
  ];
  return ranges.map(([a, b]) => [ipv4ToInt(a)!, ipv4ToInt(b)!] as const);
})();

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    const x = Number(p);
    if (!Number.isInteger(x) || x < 0 || x > 255) return null;
    n = (n * 256) + x;
  }
  return n;
}

function isPrivateV4(ip: string): boolean {
  const n = ipv4ToInt(ip);
  if (n === null) return true;
  return PRIVATE_V4_RANGES.some(([lo, hi]) => n >= lo && n <= hi);
}

function isPrivateV6(ip: string): boolean {
  const low = ip.toLowerCase();
  if (low === "::" || low === "::1") return true;
  // unique local fc00::/7
  if (/^f[cd][0-9a-f]{2}:/.test(low)) return true;
  // link-local fe80::/10
  if (/^fe[89ab][0-9a-f]:/.test(low)) return true;
  // multicast ff00::/8
  if (/^ff[0-9a-f]{2}:/.test(low)) return true;
  // IPv4-mapped ::ffff:a.b.c.d (dotted form)
  const dotted = low.match(/^::ffff:([\d.]+)$/);
  if (dotted) return isPrivateV4(dotted[1]);
  // IPv4-mapped ::ffff:HHHH:HHHH (Node's URL parser normalizes to this form)
  const hex = low.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (hex) {
    const hi = parseInt(hex[1], 16);
    const lo = parseInt(hex[2], 16);
    const a = (hi >> 8) & 0xff;
    const b = hi & 0xff;
    const c = (lo >> 8) & 0xff;
    const d = lo & 0xff;
    return isPrivateV4(`${a}.${b}.${c}.${d}`);
  }
  return false;
}

function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) return isPrivateV4(ip);
  if (net.isIPv6(ip)) return isPrivateV6(ip);
  return true;
}

export class UnsafeUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsafeUrlError";
  }
}

// Sync guard: protocol allowlist + reject literal private/reserved IPs +
// reject embedded credentials. Used at config-decode time and as the first
// check at fetch time before paying the DNS round trip.
export function parseSafeHttpUrl(input: string): URL {
  let u: URL;
  try {
    u = new URL(input);
  } catch {
    throw new UnsafeUrlError("invalid URL");
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new UnsafeUrlError(`disallowed scheme: ${u.protocol}`);
  }
  if (u.username || u.password) {
    throw new UnsafeUrlError("credentials in URL not allowed");
  }
  const host = u.hostname;
  // URL parser preserves brackets on bare IPv6 literals — strip for net.isIP.
  const bare = host.startsWith("[") && host.endsWith("]") ? host.slice(1, -1) : host;
  if (net.isIP(bare) && isPrivateIp(bare)) {
    throw new UnsafeUrlError(`private/reserved IP not allowed: ${bare}`);
  }
  return u;
}

// Async guard: parseSafeHttpUrl + DNS resolution. Use immediately before
// undici.request. NOTE: not bulletproof against DNS rebinding — the resolved
// IP is not pinned to the actual TCP connect — but raises the bar materially.
export async function assertPublicHttpUrl(input: string): Promise<URL> {
  const u = parseSafeHttpUrl(input);
  const host = u.hostname;
  const bare = host.startsWith("[") && host.endsWith("]") ? host.slice(1, -1) : host;
  if (net.isIP(bare)) return u;
  let addrs;
  try {
    addrs = await lookup(host, { all: true });
  } catch {
    throw new UnsafeUrlError(`DNS lookup failed for ${host}`);
  }
  if (addrs.length === 0) throw new UnsafeUrlError(`no DNS records for ${host}`);
  for (const a of addrs) {
    if (isPrivateIp(a.address)) {
      throw new UnsafeUrlError(`${host} resolves to private/reserved IP: ${a.address}`);
    }
  }
  return u;
}
