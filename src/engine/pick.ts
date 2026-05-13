import type { ParsedStream } from "../parser/types.js";
import type { Config, HardFilters } from "../config/schema.js";
import { rank } from "./rank.js";
import { relaxAndFilter } from "./relax.js";
import type { StickyStore } from "./sticky.js";

export interface PickResult {
  ranked: ParsedStream[];
  droppedFilters: Array<keyof HardFilters>;
}

export function pickStream(
  streams: ParsedStream[],
  cfg: Config,
  sticky: StickyStore,
  type: string,
  id: string,
  season: number | null,
): PickResult | null {
  if (streams.length === 0) return null;

  const { streams: survivors, droppedFilters } = relaxAndFilter(
    streams,
    cfg.hardFilters,
    cfg.tiebreakers,
  );
  if (survivors.length === 0) return null;

  let ranked = rank(survivors, cfg.tiebreakers, cfg.preferredGroups, cfg.hardFilters.languages ?? []);

  if (type === "series" && cfg.sticky.enabled) {
    const stickyGroup = sticky.get(type, id, season);
    if (stickyGroup) {
      const lc = stickyGroup.toLowerCase();
      const matches: ParsedStream[] = [];
      const others: ParsedStream[] = [];
      for (const s of ranked) {
        if (s.group?.toLowerCase() === lc) matches.push(s);
        else others.push(s);
      }
      if (matches.length > 0) ranked = [...matches, ...others];
    }
  }

  return { ranked, droppedFilters };
}
