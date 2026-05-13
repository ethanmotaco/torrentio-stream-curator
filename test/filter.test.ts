import { describe, it, expect } from "vitest";
import { applyFilters } from "../src/engine/filter.js";
import type { ParsedStream } from "../src/parser/types.js";
import type { HardFilters } from "../src/config/schema.js";

const baseStream = (overrides: Partial<ParsedStream> = {}): ParsedStream => ({
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
  ...overrides,
});

const baseFilters = (overrides: Partial<HardFilters> = {}): HardFilters => ({
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
  ...overrides,
});

describe("applyFilters", () => {
  it("keeps everything when filters are permissive", () => {
    const streams = [baseStream(), baseStream({ resolution: "720p" })];
    expect(applyFilters(streams, baseFilters())).toHaveLength(2);
  });

  it("requireCached removes uncached", () => {
    const streams = [baseStream({ cached: true }), baseStream({ cached: false })];
    const out = applyFilters(streams, baseFilters({ requireCached: true }));
    expect(out).toHaveLength(1);
    expect(out[0].cached).toBe(true);
  });

  it("maxResolution caps", () => {
    const streams = [
      baseStream({ resolution: "2160p" }),
      baseStream({ resolution: "1080p" }),
      baseStream({ resolution: "720p" }),
    ];
    const out = applyFilters(streams, baseFilters({ maxResolution: "1080p" }));
    expect(out.map(s => s.resolution).sort()).toEqual(["1080p", "720p"]);
  });

  it("minResolution floors", () => {
    const streams = [
      baseStream({ resolution: "1080p" }),
      baseStream({ resolution: "720p" }),
      baseStream({ resolution: "480p" }),
    ];
    const out = applyFilters(streams, baseFilters({ minResolution: "1080p" }));
    expect(out.map(s => s.resolution)).toEqual(["1080p"]);
  });

  it("maxSizeGB caps", () => {
    const streams = [baseStream({ sizeGB: 2 }), baseStream({ sizeGB: 10 })];
    const out = applyFilters(streams, baseFilters({ maxSizeGB: 5 }));
    expect(out).toHaveLength(1);
    expect(out[0].sizeGB).toBe(2);
  });

  it("minSeeders only applied to uncached streams", () => {
    const streams = [
      baseStream({ cached: false, seeders: 5 }),
      baseStream({ cached: false, seeders: 100 }),
      baseStream({ cached: true, seeders: 0 }),
    ];
    const out = applyFilters(streams, baseFilters({ minSeeders: 50 }));
    expect(out).toHaveLength(2);
    expect(out.find(s => !s.cached)?.seeders).toBe(100);
  });

  it("requireHDR keeps only HDR", () => {
    const streams = [baseStream({ hdr: "HDR10" }), baseStream({ hdr: null })];
    const out = applyFilters(streams, baseFilters({ requireHDR: true }));
    expect(out).toHaveLength(1);
  });

  it("excludeHDR removes HDR", () => {
    const streams = [baseStream({ hdr: "HDR10" }), baseStream({ hdr: null })];
    const out = applyFilters(streams, baseFilters({ excludeHDR: true }));
    expect(out).toHaveLength(1);
    expect(out[0].hdr).toBeNull();
  });

  it("requireAudio keeps streams matching any listed", () => {
    const streams = [baseStream({ audio: "Atmos" }), baseStream({ audio: "AAC" })];
    const out = applyFilters(streams, baseFilters({ requireAudio: ["Atmos", "DTS-HD"] }));
    expect(out).toHaveLength(1);
    expect(out[0].audio).toBe("Atmos");
  });

  it("languages keeps streams with any matching language", () => {
    const streams = [
      baseStream({ languages: ["english"] }),
      baseStream({ languages: ["french"] }),
      baseStream({ languages: [] }),
    ];
    const out = applyFilters(streams, baseFilters({ languages: ["english"] }));
    expect(out.map(s => s.languages)).toEqual([["english"], []]);
  });

  it("languages matches ISO codes (eng/ita) against names (english/italian)", () => {
    const streams = [
      baseStream({ languages: ["eng", "ita"] }),
      baseStream({ languages: ["fre"] }),
      baseStream({ languages: ["dual"] }),
    ];
    const out = applyFilters(streams, baseFilters({ languages: ["english"] }));
    expect(out).toHaveLength(2);
    expect(out[0].languages).toEqual(["eng", "ita"]);
    expect(out[1].languages).toEqual(["dual"]);
  });

  it("null fields treated as 'no info, do not exclude unless filter requires'", () => {
    const streams = [baseStream({ resolution: null })];
    expect(applyFilters(streams, baseFilters({ maxResolution: "1080p" }))).toHaveLength(1);
    expect(applyFilters(streams, baseFilters({ minResolution: "1080p" }))).toHaveLength(0);
  });

  it("excludeRdBlocked removes streams flagged as RD-blocked", () => {
    const streams = [
      baseStream({ rdBlocked: false }),
      baseStream({ rdBlocked: true, rdBlockReason: "YTS" }),
    ];
    const out = applyFilters(streams, baseFilters({ excludeRdBlocked: true }));
    expect(out).toHaveLength(1);
    expect(out[0].rdBlocked).toBe(false);
  });

  it("excludeRdBlocked=false keeps blocked streams", () => {
    const streams = [baseStream({ rdBlocked: true })];
    const out = applyFilters(streams, baseFilters({ excludeRdBlocked: false }));
    expect(out).toHaveLength(1);
  });
});
