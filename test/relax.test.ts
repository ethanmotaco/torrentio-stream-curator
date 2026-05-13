import { describe, it, expect } from "vitest";
import { relaxAndFilter } from "../src/engine/relax.js";
import type { ParsedStream } from "../src/parser/types.js";
import type { HardFilters, Tiebreaker } from "../src/config/schema.js";

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

const f = (over: Partial<HardFilters> = {}): HardFilters => ({
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
  ...over,
});

describe("relaxAndFilter", () => {
  it("returns survivors with empty droppedFilters when filters already match", () => {
    const streams = [s({ hdr: "HDR10" })];
    const filters = f({ requireHDR: true });
    const tiebreakers: Tiebreaker[] = ["hdr_pref"];
    const result = relaxAndFilter(streams, filters, tiebreakers);
    expect(result.streams).toHaveLength(1);
    expect(result.droppedFilters).toEqual([]);
  });

  it("drops least-important tiebreaker's filter first", () => {
    const streams = [s({ hdr: null, cached: true })];
    const filters = f({ requireHDR: true, requireCached: true });
    const tiebreakers: Tiebreaker[] = ["cached_first", "hdr_pref"];
    const result = relaxAndFilter(streams, filters, tiebreakers);
    expect(result.streams).toHaveLength(1);
    expect(result.droppedFilters).toEqual(["requireHDR"]);
  });

  it("drops multiple filters until match", () => {
    const streams = [s({ hdr: null, cached: false })];
    const filters = f({ requireHDR: true, requireCached: true });
    const tiebreakers: Tiebreaker[] = ["cached_first", "hdr_pref"];
    const result = relaxAndFilter(streams, filters, tiebreakers);
    expect(result.streams).toHaveLength(1);
    expect(result.droppedFilters).toEqual(["requireHDR", "requireCached"]);
  });

  it("never drops languages filter", () => {
    const streams = [s({ languages: ["french"] })];
    const filters = f({ languages: ["english"], requireHDR: true });
    const tiebreakers: Tiebreaker[] = ["hdr_pref"];
    const result = relaxAndFilter(streams, filters, tiebreakers);
    expect(result.streams).toHaveLength(0);
  });

  it("returns empty when all relaxable filters dropped and still no match", () => {
    const streams = [s({ languages: ["french"] })];
    const filters = f({ languages: ["english"] });
    const tiebreakers: Tiebreaker[] = ["cached_first"];
    const result = relaxAndFilter(streams, filters, tiebreakers);
    expect(result.streams).toHaveLength(0);
  });

  it("size_smaller and size_larger both relax maxSizeGB", () => {
    const streams = [s({ sizeGB: 20 })];
    const filters = f({ maxSizeGB: 5 });
    const tiebreakers: Tiebreaker[] = ["size_smaller"];
    const result = relaxAndFilter(streams, filters, tiebreakers);
    expect(result.droppedFilters).toEqual(["maxSizeGB"]);
  });
});
