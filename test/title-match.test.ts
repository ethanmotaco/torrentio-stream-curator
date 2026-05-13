import { describe, it, expect } from "vitest";
import { titleMatches } from "../src/engine/title-match.js";

describe("titleMatches", () => {
  it("exact match passes", () => {
    expect(titleMatches("Swapped", null, "Swapped", null).matches).toBe(true);
  });

  it("rejects wrong-movie title", () => {
    expect(titleMatches("Swapped", null, "Good Luck Have Fun Don't Die", null).matches).toBe(false);
  });

  it("ignores stopwords and stylization", () => {
    expect(titleMatches("The Lord of the Rings", null, "Lord.Of.The.Rings.2001.1080p.BluRay", null).matches).toBe(true);
  });

  it("multi-language stream title with primary token matches", () => {
    expect(titleMatches("Swapped", null, "Swapped Al Tuo Posto 2026", null).matches).toBe(true);
  });

  it("year mismatch rejects when both known", () => {
    expect(titleMatches("Movie", 2024, "Movie 2010 1080p", 2010).matches).toBe(false);
  });

  it("year off-by-one passes", () => {
    expect(titleMatches("Movie", 2024, "Movie 2023 1080p", 2023).matches).toBe(true);
  });

  it("null streamTitle is permissive", () => {
    expect(titleMatches("Movie", 2024, null, null).matches).toBe(true);
  });

  it("60% threshold for long titles", () => {
    // "Good Luck Have Fun Don't Die" → meaningful: good, luck, have, fun, don, die (apostrophe stripped)
    // Stream with 4/6 matches passes
    const r = titleMatches("Good Luck Have Fun Don Die", null, "Good Luck Have Fun 2025", null);
    expect(r.matchedWords).toBe(4);
    expect(r.matches).toBe(true);
  });

  it("60% threshold blocks 1/6 match", () => {
    const r = titleMatches("Good Luck Have Fun Don Die", null, "Good Movie", null);
    expect(r.matchedWords).toBe(1);
    expect(r.matches).toBe(false);
  });

  it("accented characters normalize", () => {
    expect(titleMatches("Pokémon", null, "Pokemon Movie 2024", null).matches).toBe(true);
  });
});
