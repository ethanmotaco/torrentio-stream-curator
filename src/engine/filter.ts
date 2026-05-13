import type { ParsedStream } from "../parser/types.js";
import type { Audio, HardFilters, Resolution } from "../config/schema.js";
import { langMatches } from "./language.js";

const RES_RANK: Record<NonNullable<ParsedStream["resolution"]>, number> = {
  "2160p": 4,
  "1080p": 3,
  "720p": 2,
  "480p": 1,
};

function resRank(r: ParsedStream["resolution"]): number | null {
  return r === null ? null : RES_RANK[r];
}

function filterRes(res: Resolution): number | null {
  if (res === "any") return null;
  return RES_RANK[res];
}

export function applyFilters(streams: ParsedStream[], f: HardFilters): ParsedStream[] {
  return streams.filter(s => keep(s, f));
}

function keep(s: ParsedStream, f: HardFilters): boolean {
  if (f.requireCached && !s.cached) return false;

  const sRank = resRank(s.resolution);
  const maxRank = filterRes(f.maxResolution);
  if (maxRank !== null && sRank !== null && sRank > maxRank) return false;

  const minRank = filterRes(f.minResolution);
  if (minRank !== null) {
    if (sRank === null) return false;
    if (sRank < minRank) return false;
  }

  if (f.maxSizeGB !== null && s.sizeGB !== null && s.sizeGB > f.maxSizeGB) return false;

  if (f.minSeeders !== null && !s.cached) {
    if (s.seeders === null || s.seeders < f.minSeeders) return false;
  }

  if (f.requireHDR && !s.hdr) return false;
  if (f.excludeHDR && s.hdr) return false;

  if (f.requireAudio !== null && f.requireAudio.length > 0) {
    if (!s.audio || !f.requireAudio.includes(s.audio as Audio)) return false;
  }

  if (f.languages !== null && f.languages.length > 0 && s.languages.length > 0) {
    const has = s.languages.some(sl => f.languages!.some(wl => langMatches(wl, sl)));
    if (!has) return false;
  }

  if (f.excludeRdBlocked && s.rdBlocked) return false;

  return true;
}
