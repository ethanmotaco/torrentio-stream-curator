import { describe, it, expect, beforeEach } from "vitest";
import { pickStream } from "../src/engine/pick.js";
import { StickyStore } from "../src/engine/sticky.js";
import type { ParsedStream } from "../src/parser/types.js";
import type { Config } from "../src/config/schema.js";

const s = (over: Partial<ParsedStream> = {}): ParsedStream => ({
  raw: { name: "x", title: "y" },
  resolution: "1080p",
  codec: "x264",
  hdr: null,
  audio: "AC3",
  sizeGB: 4,
  group: "RARBG",
  cached: true,
  seeders: 100,
  languages: ["english"],
  bitDepth: null,
  rdBlocked: false,
  rdBlockReason: null,
  parsedTitle: null,
  year: null,
  ...over,
});

const cfg = (over: Partial<Config> = {}): Config => ({
  torrentioUrl: "https://torrentio.strem.fun/x/manifest.json",
  profile: "custom",
  hardFilters: {
    maxResolution: "any",
    minResolution: "any",
    requireCached: false,
    maxSizeGB: null,
    minSeeders: null,
    requireHDR: false,
    excludeHDR: false,
    requireAudio: null,
    languages: null,
    excludeRdBlocked: false,
  },
  tiebreakers: ["resolution_desc"],
  preferredGroups: [],
  sticky: { enabled: true, scope: "season" },
  ...over,
});

describe("pickStream", () => {
  let sticky: StickyStore;
  beforeEach(() => { sticky = new StickyStore(); });

  it("returns null when input empty", () => {
    expect(pickStream([], cfg(), sticky, "movie", "tt1", null)).toBeNull();
  });

  it("returns top-ranked first when no sticky entry", () => {
    const streams = [s({ resolution: "720p" }), s({ resolution: "2160p" })];
    const result = pickStream(streams, cfg(), sticky, "movie", "tt1", null);
    expect(result?.ranked[0].resolution).toBe("2160p");
    expect(result?.droppedFilters).toEqual([]);
  });

  it("series with sticky group reorders sticky matches to front", () => {
    sticky.set({ enabled: true, scope: "season" }, "series", "tt1", 1, "QxR");
    const streams = [
      s({ resolution: "2160p", group: "RARBG" }),
      s({ resolution: "1080p", group: "QxR" }),
    ];
    const result = pickStream(streams, cfg(), sticky, "series", "tt1", 1);
    expect(result?.ranked[0].group).toBe("QxR");
    expect(result?.ranked[1].group).toBe("RARBG");
  });

  it("series with sticky group falls through to top-ranked when group missing", () => {
    sticky.set({ enabled: true, scope: "season" }, "series", "tt1", 1, "Missing");
    const streams = [s({ resolution: "2160p", group: "RARBG" })];
    const result = pickStream(streams, cfg(), sticky, "series", "tt1", 1);
    expect(result?.ranked[0].group).toBe("RARBG");
  });

  it("does not write sticky from pickStream (caller does after probe)", () => {
    const streams = [s({ resolution: "2160p", group: "QxR" })];
    pickStream(streams, cfg(), sticky, "series", "tt1", 2);
    expect(sticky.get("series", "tt1", 2)).toBeNull();
  });

  it("relaxes filters when no match and reports dropped", () => {
    const streams = [s({ hdr: null })];
    const c = cfg({
      hardFilters: { ...cfg().hardFilters, requireHDR: true },
      tiebreakers: ["hdr_pref"],
    });
    const result = pickStream(streams, c, sticky, "movie", "tt1", null);
    expect(result?.ranked).toBeDefined();
    expect(result?.droppedFilters).toContain("requireHDR");
  });
});
