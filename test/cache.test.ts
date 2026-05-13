import { describe, it, expect, beforeEach } from "vitest";
import { ResponseCache } from "../src/cache/response.js";

describe("ResponseCache", () => {
  let cache: ResponseCache<{ ok: boolean }>;

  beforeEach(() => {
    cache = new ResponseCache({ max: 10, ttlMs: 1000 });
  });

  it("returns undefined on miss", () => {
    expect(cache.get("k1")).toBeUndefined();
  });

  it("stores and retrieves value", () => {
    cache.set("k1", { ok: true });
    expect(cache.get("k1")).toEqual({ ok: true });
  });

  it("evicts when over max size", () => {
    const small = new ResponseCache<number>({ max: 2, ttlMs: 1000 });
    small.set("a", 1);
    small.set("b", 2);
    small.set("c", 3);
    expect(small.get("a")).toBeUndefined();
    expect(small.get("c")).toBe(3);
  });

  it("makeKey produces stable hash for same config + ids", () => {
    const k1 = ResponseCache.makeKey("base64cfg", "movie", "tt1");
    const k2 = ResponseCache.makeKey("base64cfg", "movie", "tt1");
    expect(k1).toBe(k2);
  });

  it("makeKey differs across types", () => {
    const k1 = ResponseCache.makeKey("base64cfg", "movie", "tt1");
    const k2 = ResponseCache.makeKey("base64cfg", "series", "tt1");
    expect(k1).not.toBe(k2);
  });
});
