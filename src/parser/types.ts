export interface RawStream {
  name: string;
  title: string;
  infoHash?: string;
  fileIdx?: number;
  url?: string;
  behaviorHints?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ParsedStream {
  raw: RawStream;
  resolution: "2160p" | "1080p" | "720p" | "480p" | null;
  codec: string | null;
  hdr: string | null;
  audio: string | null;
  sizeGB: number | null;
  group: string | null;
  cached: boolean;
  seeders: number | null;
  languages: string[];
  bitDepth: string | null;
  rdBlocked: boolean;
  rdBlockReason: string | null;
  parsedTitle: string | null;
  year: number | null;
}
