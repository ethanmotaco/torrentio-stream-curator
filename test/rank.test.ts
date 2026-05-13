import { describe, it, expect } from "vitest";
import { rank } from "../src/engine/rank.js";
import type { ParsedStream } from "../src/parser/types.js";

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

describe("rank", () => {
  it("resolution_desc puts 2160p first", () => {
    const a = s({ resolution: "1080p" });
    const b = s({ resolution: "2160p" });
    const out = rank([a, b], ["resolution_desc"], []);
    expect(out[0].resolution).toBe("2160p");
  });

  it("cached_first puts cached first", () => {
    const a = s({ cached: false });
    const b = s({ cached: true });
    const out = rank([a, b], ["cached_first"], []);
    expect(out[0].cached).toBe(true);
  });

  it("audio_quality_desc puts Atmos before AAC", () => {
    const a = s({ audio: "AAC" });
    const b = s({ audio: "Atmos" });
    const out = rank([a, b], ["audio_quality_desc"], []);
    expect(out[0].audio).toBe("Atmos");
  });

  it("size_smaller puts smaller first", () => {
    const a = s({ sizeGB: 12 });
    const b = s({ sizeGB: 4 });
    const out = rank([a, b], ["size_smaller"], []);
    expect(out[0].sizeGB).toBe(4);
  });

  it("size_larger puts larger first", () => {
    const a = s({ sizeGB: 4 });
    const b = s({ sizeGB: 12 });
    const out = rank([a, b], ["size_larger"], []);
    expect(out[0].sizeGB).toBe(12);
  });

  it("seeders_desc puts higher seeders first", () => {
    const a = s({ seeders: 10 });
    const b = s({ seeders: 500 });
    const out = rank([a, b], ["seeders_desc"], []);
    expect(out[0].seeders).toBe(500);
  });

  it("hdr_pref puts hdr first", () => {
    const a = s({ hdr: null });
    const b = s({ hdr: "HDR10" });
    const out = rank([a, b], ["hdr_pref"], []);
    expect(out[0].hdr).toBe("HDR10");
  });

  it("group_pref puts preferred groups first in given order", () => {
    const a = s({ group: "RARBG" });
    const b = s({ group: "QxR" });
    const c = s({ group: "Other" });
    const out = rank([a, b, c], ["group_pref"], ["QxR", "RARBG"]);
    expect(out.map(x => x.group)).toEqual(["QxR", "RARBG", "Other"]);
  });

  it("uses second tiebreaker when first ties", () => {
    const a = s({ resolution: "1080p", sizeGB: 12 });
    const b = s({ resolution: "1080p", sizeGB: 4 });
    const out = rank([a, b], ["resolution_desc", "size_smaller"], []);
    expect(out[0].sizeGB).toBe(4);
  });

  it("input order is stable when all tiebreakers tie", () => {
    const a = s({ resolution: "1080p", group: "A" });
    const b = s({ resolution: "1080p", group: "B" });
    const out = rank([a, b], ["resolution_desc"], []);
    expect(out[0].group).toBe("A");
  });
});
