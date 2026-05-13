import { LRUCache } from "lru-cache";
import { createHash } from "node:crypto";

export interface ResponseCacheOpts {
  max: number;
  ttlMs: number;
}

export class ResponseCache<T extends object> {
  private cache: LRUCache<string, T>;

  constructor(opts: ResponseCacheOpts) {
    this.cache = new LRUCache({ max: opts.max, ttl: opts.ttlMs });
  }

  get(key: string): T | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: T): void {
    this.cache.set(key, value);
  }

  setNegative(key: string, value: T, negativeTtlMs: number): void {
    this.cache.set(key, value, { ttl: negativeTtlMs });
  }

  static makeKey(configEncoded: string, type: string, id: string): string {
    const hash = createHash("sha256").update(configEncoded).digest("hex").slice(0, 16);
    return `${hash}:${type}:${id}`;
  }
}
