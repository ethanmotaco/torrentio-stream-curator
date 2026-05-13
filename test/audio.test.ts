import { describe, it, expect } from "vitest";
import { audioScore } from "../src/engine/audio.js";

describe("audioScore", () => {
  it("ranks Atmos above DTS-HD above DTS above AC3 above AAC", () => {
    expect(audioScore("Atmos")).toBeGreaterThan(audioScore("TrueHD"));
    expect(audioScore("TrueHD")).toBeGreaterThan(audioScore("DTS-HD"));
    expect(audioScore("DTS-HD")).toBeGreaterThan(audioScore("DTS"));
    expect(audioScore("DTS")).toBeGreaterThan(audioScore("AC3"));
    expect(audioScore("AC3")).toBeGreaterThan(audioScore("AAC"));
  });

  it("returns 0 for null", () => {
    expect(audioScore(null)).toBe(0);
  });

  it("returns 0 for unknown", () => {
    expect(audioScore("Foo")).toBe(0);
  });
});
