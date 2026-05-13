import type { RawStream } from "../parser/types.js";

export interface TorrentioResponse {
  streams: RawStream[];
}
