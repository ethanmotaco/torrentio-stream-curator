import type { Config, HardFilters, Tiebreaker } from "./schema.js";

type ProfileKey = "4k-hdr" | "1080p-balanced" | "smallest-cached" | "best-audio" | "custom";

interface ProfileBody {
  hardFilters: HardFilters;
  tiebreakers: Tiebreaker[];
}

const baseFilters: HardFilters = {
  maxResolution: "any",
  minResolution: "any",
  requireCached: false,
  maxSizeGB: null,
  minSeeders: null,
  requireHDR: false,
  excludeHDR: false,
  requireAudio: null,
  languages: ["english"],
  excludeRdBlocked: true,
};

export const PROFILES: Record<ProfileKey, ProfileBody> = {
  "4k-hdr": {
    hardFilters: {
      ...baseFilters,
      maxResolution: "2160p",
      minResolution: "2160p",
      requireCached: true,
      requireHDR: true,
    },
    tiebreakers: ["resolution_desc", "hdr_pref", "audio_quality_desc", "size_smaller", "cached_first"],
  },
  "1080p-balanced": {
    hardFilters: {
      ...baseFilters,
      maxResolution: "1080p",
      minResolution: "1080p",
      requireCached: true,
    },
    tiebreakers: ["audio_quality_desc", "size_smaller", "group_pref", "cached_first"],
  },
  "smallest-cached": {
    hardFilters: {
      ...baseFilters,
      requireCached: true,
      maxSizeGB: 4,
    },
    tiebreakers: ["size_smaller", "resolution_desc", "audio_quality_desc"],
  },
  "best-audio": {
    hardFilters: {
      ...baseFilters,
      requireCached: true,
    },
    tiebreakers: ["audio_quality_desc", "resolution_desc", "size_larger"],
  },
  custom: {
    hardFilters: { ...baseFilters, requireCached: true },
    tiebreakers: ["cached_first", "resolution_desc", "audio_quality_desc", "size_smaller"],
  },
};

export function applyProfile(name: ProfileKey, torrentioUrl: string): Config {
  const body = PROFILES[name];
  return {
    torrentioUrl,
    profile: name,
    hardFilters: { ...body.hardFilters },
    tiebreakers: [...body.tiebreakers],
    preferredGroups: [],
    sticky: { enabled: true, scope: "season" },
  };
}
