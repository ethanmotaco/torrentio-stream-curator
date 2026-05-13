export function tokens(s: string): string[] {
  return s.toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .replace(/[^a-z0-9 ]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

const STOP = new Set([
  "a", "an", "the", "of", "to", "in", "on", "and", "or", "for", "with",
  "is", "it", "its",
]);

export function meaningful(toks: string[]): string[] {
  return toks.filter(t => !STOP.has(t) && t.length > 1);
}

export interface TitleMatchResult {
  matches: boolean;
  matchedWords: number;
  expectedCount: number;
  yearOk: boolean;
}

export function titleMatches(
  expectedName: string,
  expectedYear: number | null,
  streamTitle: string | null,
  streamYear: number | null,
): TitleMatchResult {
  if (!streamTitle) {
    // No parsed title to compare — be permissive (don't drop)
    return { matches: true, matchedWords: 0, expectedCount: 0, yearOk: true };
  }
  const exp = meaningful(tokens(expectedName));
  const stm = meaningful(tokens(streamTitle));
  if (exp.length === 0) return { matches: true, matchedWords: 0, expectedCount: 0, yearOk: true };

  const expSet = new Set(exp);
  const matched = new Set(stm.filter(t => expSet.has(t))).size;
  // require >=60% of expected meaningful words; min 1
  const threshold = Math.max(1, Math.ceil(exp.length * 0.6));
  const wordOk = matched >= threshold;

  // Year check: if both known, must match within 1 (parser sometimes off-by-one)
  let yearOk = true;
  if (expectedYear !== null && streamYear !== null) {
    yearOk = Math.abs(expectedYear - streamYear) <= 1;
  }

  return { matches: wordOk && yearOk, matchedWords: matched, expectedCount: exp.length, yearOk };
}
