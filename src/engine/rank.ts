import type { ParsedStream } from "../parser/types.js";
import type { Tiebreaker } from "../config/schema.js";
import { audioScore } from "./audio.js";
import { canonicalLang } from "./language.js";

const RES_RANK: Record<NonNullable<ParsedStream["resolution"]>, number> = {
  "2160p": 4,
  "1080p": 3,
  "720p": 2,
  "480p": 1,
};

type Cmp = (a: ParsedStream, b: ParsedStream) => number;

function resScore(r: ParsedStream["resolution"]): number {
  return r === null ? 0 : RES_RANK[r];
}

function cmpFor(t: Tiebreaker, preferredGroups: string[], preferredLanguages: string[]): Cmp {
  switch (t) {
    case "resolution_desc":
      return (a, b) => resScore(b.resolution) - resScore(a.resolution);
    case "cached_first":
      return (a, b) => Number(b.cached) - Number(a.cached);
    case "hdr_pref":
      return (a, b) => Number(Boolean(b.hdr)) - Number(Boolean(a.hdr));
    case "audio_quality_desc":
      return (a, b) => audioScore(b.audio) - audioScore(a.audio);
    case "size_smaller":
      return (a, b) => (a.sizeGB ?? Infinity) - (b.sizeGB ?? Infinity);
    case "size_larger":
      return (a, b) => (b.sizeGB ?? -Infinity) - (a.sizeGB ?? -Infinity);
    case "seeders_desc":
      return (a, b) => (b.seeders ?? -1) - (a.seeders ?? -1);
    case "group_pref": {
      const idx = (g: string | null): number => {
        if (g === null) return preferredGroups.length;
        const i = preferredGroups.findIndex(p => p.toLowerCase() === g.toLowerCase());
        return i === -1 ? preferredGroups.length : i;
      };
      return (a, b) => idx(a.group) - idx(b.group);
    }
    case "language_pref": {
      const wanted = preferredLanguages.map(l => canonicalLang(l));
      const idx = (langs: string[]): number => {
        if (langs.length === 0) return wanted.length;
        const canon = langs.map(l => canonicalLang(l));
        let best = wanted.length;
        for (const c of canon) {
          const i = wanted.indexOf(c);
          if (i !== -1 && i < best) best = i;
        }
        return best;
      };
      return (a, b) => idx(a.languages) - idx(b.languages);
    }
  }
}

export function rank(
  streams: ParsedStream[],
  tiebreakers: Tiebreaker[],
  preferredGroups: string[],
  preferredLanguages: string[] = [],
): ParsedStream[] {
  const cmps = tiebreakers.map(t => cmpFor(t, preferredGroups, preferredLanguages));
  const indexed = streams.map((s, i) => ({ s, i }));
  indexed.sort((x, y) => {
    for (const c of cmps) {
      const r = c(x.s, y.s);
      if (r !== 0) return r;
    }
    return x.i - y.i;
  });
  return indexed.map(x => x.s);
}
