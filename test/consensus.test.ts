import { describe, it, expect } from "vitest";
import { consensusFilter } from "../src/engine/consensus.js";
import type { ParsedStream } from "../src/parser/types.js";

const s = (parsedTitle: string | null): ParsedStream => ({
  raw: { name: "x", title: "y" },
  resolution: "1080p",
  codec: null,
  hdr: null,
  audio: null,
  sizeGB: null,
  group: null,
  cached: true,
  seeders: null,
  languages: [],
  bitDepth: null,
  rdBlocked: false,
  rdBlockReason: null,
  parsedTitle,
  year: null,
});

describe("consensusFilter", () => {
  it("drops singleton mislabeled stream when majority shares tokens", () => {
    const streams = [
      s("Good Luck Have Fun Dont Die"),
      s("Swapped"),
      s("Swapped Al Tuo Posto"),
      s("Swapped Al Tuo Posto"),
    ];
    const r = consensusFilter(streams);
    expect(r.kept).toHaveLength(3);
    expect(r.dropped).toHaveLength(1);
    expect(r.dropped[0].parsedTitle).toBe("Good Luck Have Fun Dont Die");
  });

  it("keeps all when no consensus emerges", () => {
    const streams = [s("Alpha"), s("Beta"), s("Gamma")];
    const r = consensusFilter(streams);
    expect(r.kept).toHaveLength(3);
    expect(r.dropped).toHaveLength(0);
  });

  it("no-op for fewer than 3 streams", () => {
    const streams = [s("Foo"), s("Bar")];
    const r = consensusFilter(streams);
    expect(r.kept).toHaveLength(2);
    expect(r.dropped).toHaveLength(0);
  });

  it("keeps all when filter would drop all", () => {
    const streams = [s(null), s(null), s(null)];
    const r = consensusFilter(streams);
    expect(r.kept).toHaveLength(3);
  });

  it("series episodes with shared title pattern keep together", () => {
    const streams = [
      s("Margos Got Money Troubles"),
      s("Margos Got Money Troubles"),
      s("Margos Got Money Troubles"),
      s("Wrong Show"),
    ];
    const r = consensusFilter(streams);
    expect(r.kept).toHaveLength(3);
    expect(r.dropped).toHaveLength(1);
  });
});
