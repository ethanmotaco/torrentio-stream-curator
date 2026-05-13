import type { Config } from "../config/schema.js";

type Scope = Config["sticky"]["scope"];

export class StickyStore {
  private map = new Map<string, string>();

  private key(scope: Scope, id: string, season: number | null): string {
    if (scope === "series") return `series:${id}`;
    return `season:${id}:${season ?? "0"}`;
  }

  get(type: string, id: string, season: number | null): string | null {
    if (type !== "series") return null;
    const seasonKey = this.key("season", id, season);
    const seriesKey = this.key("series", id, season);
    return this.map.get(seasonKey) ?? this.map.get(seriesKey) ?? null;
  }

  set(
    cfg: Config["sticky"],
    type: string,
    id: string,
    season: number | null,
    group: string | null,
  ): void {
    if (!cfg.enabled) return;
    if (type !== "series") return;
    if (group === null) return;
    this.map.set(this.key(cfg.scope, id, season), group);
  }

  clear(): void {
    this.map.clear();
  }
}
