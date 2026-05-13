import type { ParsedStream } from "../parser/types.js";
import type { HardFilters, Tiebreaker } from "../config/schema.js";
import { applyFilters } from "./filter.js";

const TIEBREAKER_TO_FILTERS: Record<Tiebreaker, Array<keyof HardFilters>> = {
  cached_first: ["requireCached"],
  resolution_desc: ["minResolution", "maxResolution"],
  hdr_pref: ["requireHDR", "excludeHDR"],
  audio_quality_desc: ["requireAudio"],
  size_smaller: ["maxSizeGB"],
  size_larger: ["maxSizeGB"],
  seeders_desc: ["minSeeders"],
  group_pref: [],
  language_pref: ["languages"],
};

const NEUTRAL: Record<keyof HardFilters, unknown> = {
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
};

export interface RelaxResult {
  streams: ParsedStream[];
  droppedFilters: Array<keyof HardFilters>;
}

export function relaxAndFilter(
  streams: ParsedStream[],
  filters: HardFilters,
  tiebreakers: Tiebreaker[],
): RelaxResult {
  let current: HardFilters = { ...filters };
  let survivors = applyFilters(streams, current);
  if (survivors.length > 0) return { streams: survivors, droppedFilters: [] };

  const dropped: Array<keyof HardFilters> = [];
  const reversed = [...tiebreakers].reverse();
  const seen = new Set<keyof HardFilters>();

  for (const tb of reversed) {
    const fields = TIEBREAKER_TO_FILTERS[tb];
    for (const field of fields) {
      if (seen.has(field)) continue;
      seen.add(field);
      // Skip if already neutral — no behavior change to record
      if (isNeutral(current[field], NEUTRAL[field])) continue;
      current = { ...current, [field]: NEUTRAL[field] } as HardFilters;
      dropped.push(field);
      survivors = applyFilters(streams, current);
      if (survivors.length > 0) return { streams: survivors, droppedFilters: dropped };
    }
  }

  // Last-resort: drop excludeRdBlocked so probe can decide
  if (!seen.has("excludeRdBlocked") && !isNeutral(current.excludeRdBlocked, NEUTRAL.excludeRdBlocked)) {
    seen.add("excludeRdBlocked");
    current = { ...current, excludeRdBlocked: NEUTRAL.excludeRdBlocked } as HardFilters;
    dropped.push("excludeRdBlocked");
    survivors = applyFilters(streams, current);
    if (survivors.length > 0) return { streams: survivors, droppedFilters: dropped };
  }

  return { streams: [], droppedFilters: dropped };
}

function isNeutral(current: unknown, neutral: unknown): boolean {
  if (current === neutral) return true;
  if (Array.isArray(current) && Array.isArray(neutral)) {
    return current.length === 0 && neutral.length === 0;
  }
  // An empty filter array (no constraint) is operationally equivalent to a
  // null neutral — treat both as neutral so we don't record a spurious drop.
  if (Array.isArray(current) && current.length === 0 && neutral === null) return true;
  return false;
}
