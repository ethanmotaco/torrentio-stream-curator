import { describe, it, expect, beforeEach } from "vitest";
import { StickyStore } from "../src/engine/sticky.js";

describe("StickyStore", () => {
  let store: StickyStore;
  beforeEach(() => { store = new StickyStore(); });

  it("returns null on miss", () => {
    expect(store.get("series", "tt0001", 1)).toBeNull();
  });

  it("set then get returns value (season scope)", () => {
    store.set({ enabled: true, scope: "season" }, "series", "tt0001", 1, "QxR");
    expect(store.get("series", "tt0001", 1)).toBe("QxR");
  });

  it("season scope: different season is independent", () => {
    store.set({ enabled: true, scope: "season" }, "series", "tt0001", 1, "QxR");
    expect(store.get("series", "tt0001", 2)).toBeNull();
  });

  it("series scope: any season returns same value", () => {
    store.set({ enabled: true, scope: "series" }, "series", "tt0001", 1, "QxR");
    expect(store.get("series", "tt0001", 99)).toBe("QxR");
  });

  it("does not persist movies", () => {
    store.set({ enabled: true, scope: "season" }, "movie", "tt0001", null, "QxR");
    expect(store.get("movie", "tt0001", null)).toBeNull();
  });

  it("does not persist when disabled", () => {
    store.set({ enabled: false, scope: "season" }, "series", "tt0001", 1, "QxR");
    expect(store.get("series", "tt0001", 1)).toBeNull();
  });

  it("does not persist null group", () => {
    store.set({ enabled: true, scope: "season" }, "series", "tt0001", 1, null);
    expect(store.get("series", "tt0001", 1)).toBeNull();
  });
});
