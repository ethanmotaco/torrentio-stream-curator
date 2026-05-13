import ptt from "parse-torrent-title";

const SIZE_RE = /(\d+(?:\.\d+)?)\s*(TB|GB|MB)\b/i;
const SEEDERS_RE = /👤\s*(\d+)/;
const CACHED_RE = /\[RD\+\]/;
const HDR_RE = /HDR10\+?|HDR|DV|Dolby\s?Vision/i;

const AUDIO_PRIORITY: Array<[RegExp, string]> = [
  [/atmos/i, "Atmos"],
  [/truehd/i, "TrueHD"],
  [/dts[\s.\-]?hd|dts[\s.\-]?ma/i, "DTS-HD"],
  [/dts/i, "DTS"],
  [/eac3|e-?ac3|ddp|dolby\s?digital\s?plus/i, "AC3"],
  [/ac3|dolby\s?digital/i, "AC3"],
  [/aac/i, "AAC"],
];

const RES_MAP: Record<string, "2160p" | "1080p" | "720p" | "480p"> = {
  "2160p": "2160p",
  "4k": "2160p",
  "uhd": "2160p",
  "1080p": "1080p",
  "720p": "720p",
  "480p": "480p",
};

export function extractResolution(
  title: string,
  pttRes?: string | undefined,
): "2160p" | "1080p" | "720p" | "480p" | null {
  const candidates = [
    pttRes,
    title.match(/2160p|1080p|720p|480p/i)?.[0],
    title.match(/\b4k\b|UHD/i)?.[0],
  ];
  for (const c of candidates) {
    if (!c) continue;
    const norm = c.toLowerCase();
    if (RES_MAP[norm]) return RES_MAP[norm];
  }
  return null;
}

export function extractAudio(title: string, pttAudio?: string | undefined): string | null {
  const haystack = `${title} ${pttAudio ?? ""}`;
  for (const [re, label] of AUDIO_PRIORITY) {
    if (re.test(haystack)) return label;
  }
  return null;
}

export function extractSizeGB(title: string): number | null {
  const m = title.match(SIZE_RE);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (!Number.isFinite(n)) return null;
  const unit = m[2].toUpperCase();
  if (unit === "TB") return n * 1024;
  if (unit === "MB") return n / 1024;
  return n;
}

export function extractSeeders(title: string): number | null {
  const m = title.match(SEEDERS_RE);
  return m ? parseInt(m[1], 10) : null;
}

export function extractCached(name: string): boolean {
  return CACHED_RE.test(name);
}

export function extractHDR(title: string): string | null {
  const m = title.match(HDR_RE);
  return m ? m[0] : null;
}

const RD_BLOCKED_PATTERNS: Array<[RegExp, string]> = [
  [/\[rartv\]/i, "[rartv]"],
  [/\[rarbg\]/i, "[rarbg]"],
  [/\[eztv\]/i, "[eztv]"],
  [/\[TGx\]/i, "[TGx]"],
  [/-TORRENTGALAXY\b/i, "-TORRENTGALAXY"],
  [/-GalaxyTV\b/i, "-GalaxyTV"],
  [/-FGT\b/i, "-FGT"],
  [/-LOL\b/i, "-LOL"],
  [/-KILLERS\b/i, "-KILLERS"],
  [/-EPSiLON\b/i, "-EPSiLON"],
  [/-DIMENSION\b/i, "-DIMENSION"],
  [/-BATV\b/i, "-BATV"],
  [/-GECKOS\b/i, "-GECKOS"],
  [/\bYTS(?:\.(?:MX|AM|AG|LT))?\b/i, "YTS"],
  [/AMZN[. ]?WEBRip|WEBRip[. ]?AMZN/i, "AMZN WEBRip"],
];

export function extractRdBlocked(title: string, name: string): { blocked: boolean; reason: string | null } {
  const haystack = `${name}\n${title}`;
  for (const [re, label] of RD_BLOCKED_PATTERNS) {
    if (re.test(haystack)) return { blocked: true, reason: label };
  }
  return { blocked: false, reason: null };
}

export function pttParse(title: string): Record<string, unknown> {
  // PTT loses fields when title has newlines + emoji metadata; parse first line only.
  const firstLine = title.split(/\r?\n/)[0] ?? title;
  try {
    return ptt.parse(firstLine) as unknown as Record<string, unknown>;
  } catch {
    return {};
  }
}
