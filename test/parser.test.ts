import { describe, it, expect } from "vitest";
import { parseStream, parseAll } from "../src/parser/index.js";
import type { RawStream } from "../src/parser/types.js";

const sample: RawStream = {
  name: "Torrentio\n4k HDR\n[RD+] 12.3 GB",
  title: "Movie.Name.2024.2160p.UHD.BluRay.x265.HDR.Atmos-QxR\n👤 234 💾 12.3 GB ⚙ ThePirateBay",
  infoHash: "abcdef0123456789",
};

describe("parseStream", () => {
  it("extracts 2160p resolution", () => {
    expect(parseStream(sample).resolution).toBe("2160p");
  });

  it("extracts x265 codec", () => {
    expect(parseStream(sample).codec).toMatch(/265|hevc/i);
  });

  it("detects HDR", () => {
    expect(parseStream(sample).hdr).toBeTruthy();
  });

  it("extracts Atmos audio", () => {
    expect(parseStream(sample).audio).toBe("Atmos");
  });

  it("extracts 12.3 GB size", () => {
    expect(parseStream(sample).sizeGB).toBeCloseTo(12.3, 1);
  });

  it("extracts QxR group", () => {
    expect(parseStream(sample).group).toBe("QxR");
  });

  it("detects RD cached marker", () => {
    expect(parseStream(sample).cached).toBe(true);
  });

  it("extracts 234 seeders", () => {
    expect(parseStream(sample).seeders).toBe(234);
  });

  it("treats absent RD+ as uncached", () => {
    const uncached = { ...sample, name: "Torrentio\n4k HDR\n[RD download] 12.3 GB" };
    expect(parseStream(uncached).cached).toBe(false);
  });

  it("returns null fields on garbage input without throwing", () => {
    const garbage: RawStream = { name: "x", title: "" };
    const r = parseStream(garbage);
    expect(r.sizeGB).toBeNull();
    expect(r.seeders).toBeNull();
  });
});

describe("parseAll", () => {
  it("parses array, skipping individual failures", () => {
    const arr = [sample, sample];
    expect(parseAll(arr)).toHaveLength(2);
  });
});

describe("rdBlocked detection", () => {
  const cases: Array<[string, string, boolean]> = [
    ["YTS", "Movie.2024.1080p.WEBRip.x264-YTS.MX", true],
    ["YTS in name", "[YTS] Movie.2024", true],
    ["[rartv]", "Movie.2024.1080p.WEB-DL.x264-NTb[rartv]", true],
    ["[rarbg]", "Movie.2024.1080p.x264[rarbg]", true],
    ["-TORRENTGALAXY", "Movie.2024.1080p.WEB.x264-TORRENTGALAXY", true],
    ["-GalaxyTV", "Movie.2024.720p.HDTV-GalaxyTV", true],
    ["-FGT", "Movie.2024.1080p.WEB-DL.x264-FGT", true],
    ["AMZN WEBRip", "Movie.2024.1080p.AMZN.WEBRip.DDP5.1.x264-XXXX", true],
    ["clean BluRay", "Movie.2024.1080p.BluRay.x264-SPARKS", false],
    ["REMUX", "Movie.2024.2160p.UHD.BluRay.REMUX.HEVC.HDR-FraMeSToR", false],
    ["SubsPlease", "[SubsPlease] Show - 01 (1080p)", false],
  ];
  for (const [label, title, expected] of cases) {
    it(`${label} → rdBlocked=${expected}`, () => {
      const r = parseStream({ name: "Torrentio\n[RD+]", title });
      expect(r.rdBlocked).toBe(expected);
    });
  }
});
