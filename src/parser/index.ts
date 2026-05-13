import {
  extractAudio,
  extractCached,
  extractHDR,
  extractRdBlocked,
  extractResolution,
  extractSeeders,
  extractSizeGB,
  pttParse,
} from "./fields.js";
import type { ParsedStream, RawStream } from "./types.js";

export function parseStream(raw: RawStream): ParsedStream {
  const ptt = pttParse(raw.title);
  const langList = ptt.languagelist;
  const langSingle = ptt.language;
  let languages: string[] = [];
  if (Array.isArray(langList)) languages = langList as string[];
  else if (typeof langSingle === "string") languages = [langSingle];

  const bitdepth = ptt.bitdepth;
  const bitDepth = typeof bitdepth === "number" ? `${bitdepth}bit` : null;
  const rd = extractRdBlocked(raw.title, raw.name);

  return {
    raw,
    resolution: extractResolution(raw.title, ptt.resolution as string | undefined),
    codec: (ptt.codec as string | undefined) ?? null,
    hdr: extractHDR(raw.title),
    audio: extractAudio(raw.title, ptt.audio as string | undefined),
    sizeGB: extractSizeGB(raw.title),
    group: (ptt.group as string | undefined) ?? null,
    cached: extractCached(raw.name),
    seeders: extractSeeders(raw.title),
    languages,
    bitDepth,
    rdBlocked: rd.blocked,
    rdBlockReason: rd.reason,
    parsedTitle: (ptt.title as string | undefined) ?? null,
    year: typeof ptt.year === "number" ? ptt.year : null,
  };
}

export function parseAll(raws: RawStream[]): ParsedStream[] {
  const out: ParsedStream[] = [];
  for (const r of raws) {
    try {
      out.push(parseStream(r));
    } catch {
      // skip
    }
  }
  return out;
}

export type { ParsedStream } from "./types.js";
