import type { ParsedStream } from "../parser/types.js";
import { meaningful, tokens } from "./title-match.js";

export interface ConsensusResult {
  kept: ParsedStream[];
  dropped: ParsedStream[];
  consensusTokens: Set<string>;
}

/**
 * Detect majority-content streams by token-bag consensus.
 * Tokens appearing in ≥half of streams form the consensus set.
 * Streams sharing ≥1 consensus token are kept; others dropped as likely mislabeled.
 *
 * No-op (returns all) when:
 *   - fewer than 3 streams (not enough signal)
 *   - no token appears in ≥half
 *   - filter would drop everything
 */
export function consensusFilter(parsed: ParsedStream[]): ConsensusResult {
  if (parsed.length < 3) {
    return { kept: parsed, dropped: [], consensusTokens: new Set() };
  }

  const streamTokens: Array<Set<string>> = [];
  const freq = new Map<string, number>();
  for (const p of parsed) {
    const t = new Set(meaningful(tokens(p.parsedTitle ?? "")));
    streamTokens.push(t);
    for (const tok of t) freq.set(tok, (freq.get(tok) ?? 0) + 1);
  }

  const threshold = Math.ceil(parsed.length / 2);
  const consensus = new Set<string>();
  for (const [tok, n] of freq) {
    if (n >= threshold) consensus.add(tok);
  }
  if (consensus.size === 0) {
    return { kept: parsed, dropped: [], consensusTokens: consensus };
  }

  const kept: ParsedStream[] = [];
  const dropped: ParsedStream[] = [];
  parsed.forEach((p, i) => {
    const t = streamTokens[i];
    let match = false;
    for (const c of consensus) {
      if (t.has(c)) { match = true; break; }
    }
    if (match) kept.push(p);
    else dropped.push(p);
  });

  if (kept.length === 0) {
    return { kept: parsed, dropped: [], consensusTokens: consensus };
  }
  return { kept, dropped, consensusTokens: consensus };
}
