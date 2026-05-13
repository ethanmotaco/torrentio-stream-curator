import { describe, it, expect } from "vitest";
import { parseSafeHttpUrl, assertPublicHttpUrl, UnsafeUrlError } from "../src/util/safe-url.js";

describe("parseSafeHttpUrl", () => {
  it("accepts public http(s) URLs", () => {
    expect(() => parseSafeHttpUrl("https://torrentio.strem.fun/abc")).not.toThrow();
    expect(() => parseSafeHttpUrl("http://example.com/")).not.toThrow();
  });

  it("rejects non-http(s) schemes", () => {
    for (const u of ["file:///etc/passwd", "ftp://example.com", "gopher://x", "javascript:alert(1)", "data:text/plain,hi"]) {
      expect(() => parseSafeHttpUrl(u)).toThrow(UnsafeUrlError);
    }
  });

  it("rejects literal loopback / private / link-local IPv4", () => {
    for (const u of [
      "http://127.0.0.1/",
      "http://127.255.255.254/",
      "http://10.0.0.1/",
      "http://10.255.255.255/",
      "http://172.16.0.1/",
      "http://172.31.255.255/",
      "http://192.168.0.1/",
      "http://169.254.169.254/latest/meta-data/",
      "http://100.64.0.1/",
      "http://0.0.0.0/",
      "http://224.0.0.1/",
    ]) {
      expect(() => parseSafeHttpUrl(u), u).toThrow(UnsafeUrlError);
    }
  });

  it("accepts public IPv4 literals", () => {
    expect(() => parseSafeHttpUrl("http://8.8.8.8/")).not.toThrow();
    expect(() => parseSafeHttpUrl("http://1.1.1.1/")).not.toThrow();
  });

  it("rejects loopback / link-local IPv6", () => {
    for (const u of ["http://[::1]/", "http://[fe80::1]/", "http://[fc00::1]/", "http://[fd00::1]/", "http://[ff00::1]/"]) {
      expect(() => parseSafeHttpUrl(u), u).toThrow(UnsafeUrlError);
    }
  });

  it("rejects IPv4-mapped IPv6 pointing at loopback", () => {
    expect(() => parseSafeHttpUrl("http://[::ffff:127.0.0.1]/")).toThrow(UnsafeUrlError);
  });

  it("rejects URLs with embedded credentials", () => {
    expect(() => parseSafeHttpUrl("https://user:pass@example.com/")).toThrow(UnsafeUrlError);
  });

  it("rejects malformed URLs", () => {
    expect(() => parseSafeHttpUrl("not a url")).toThrow(UnsafeUrlError);
    expect(() => parseSafeHttpUrl("")).toThrow(UnsafeUrlError);
  });
});

describe("assertPublicHttpUrl", () => {
  it("passes through public IP literals without doing DNS", async () => {
    await expect(assertPublicHttpUrl("http://8.8.8.8/")).resolves.toBeInstanceOf(URL);
  });

  it("rejects private IP literals at the sync stage", async () => {
    await expect(assertPublicHttpUrl("http://127.0.0.1/")).rejects.toBeInstanceOf(UnsafeUrlError);
  });

  it("rejects non-http(s) schemes at the sync stage", async () => {
    await expect(assertPublicHttpUrl("file:///etc/passwd")).rejects.toBeInstanceOf(UnsafeUrlError);
  });

  it("rejects hostnames that fail DNS lookup", async () => {
    await expect(
      assertPublicHttpUrl("http://this-host-definitely-does-not-exist-1234567890abcd.invalid/"),
    ).rejects.toBeInstanceOf(UnsafeUrlError);
  });
});
