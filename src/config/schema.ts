import { z } from "zod";
import { parseSafeHttpUrl } from "../util/safe-url.js";

export const ResolutionEnum = z.enum(["2160p", "1080p", "720p", "480p", "any"]);
export const AudioEnum = z.enum(["Atmos", "DTS-HD", "DTS", "TrueHD", "AC3", "AAC"]);
export const TiebreakerEnum = z.enum([
  "resolution_desc",
  "cached_first",
  "hdr_pref",
  "audio_quality_desc",
  "size_smaller",
  "size_larger",
  "seeders_desc",
  "group_pref",
  "language_pref",
]);
export const ProfileEnum = z.enum([
  "4k-hdr",
  "1080p-balanced",
  "smallest-cached",
  "best-audio",
  "custom",
]);
export const StickyScopeEnum = z.enum(["season", "series"]);

export const HardFiltersSchema = z.object({
  maxResolution: ResolutionEnum,
  minResolution: ResolutionEnum,
  requireCached: z.boolean(),
  maxSizeGB: z.number().positive().nullable(),
  minSeeders: z.number().int().nonnegative().nullable(),
  requireHDR: z.boolean(),
  excludeHDR: z.boolean(),
  requireAudio: z.array(AudioEnum).nullable(),
  languages: z.array(z.string()).nullable(),
  excludeRdBlocked: z.boolean().default(true),
});

// Reject http(s)-only URLs that don't point at an obviously-private IP
// literal. Full DNS resolution happens later at fetch time.
const SafeHttpUrl = z.string().url().min(1).refine(
  (s) => {
    try { parseSafeHttpUrl(s); return true; } catch { return false; }
  },
  { message: "torrentioUrl must be an http(s) URL pointing at a public host" },
);

export const ConfigSchema = z.object({
  torrentioUrl: SafeHttpUrl,
  profile: ProfileEnum,
  hardFilters: HardFiltersSchema,
  tiebreakers: z.array(TiebreakerEnum),
  preferredGroups: z.array(z.string()),
  sticky: z.object({
    enabled: z.boolean(),
    scope: StickyScopeEnum,
  }),
});

export type Config = z.infer<typeof ConfigSchema>;
export type HardFilters = z.infer<typeof HardFiltersSchema>;
export type Tiebreaker = z.infer<typeof TiebreakerEnum>;
export type Resolution = z.infer<typeof ResolutionEnum>;
export type Audio = z.infer<typeof AudioEnum>;
