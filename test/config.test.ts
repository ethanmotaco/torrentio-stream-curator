import { describe, it, expect } from "vitest";
import { ConfigSchema, type Config } from "../src/config/schema.js";
import { encodeConfig, decodeConfig } from "../src/config/codec.js";
import { PROFILES, applyProfile } from "../src/config/profiles.js";

describe("ConfigSchema", () => {
  const valid: Config = {
    torrentioUrl: "https://torrentio.strem.fun/abc/manifest.json",
    profile: "1080p-balanced",
    hardFilters: {
      maxResolution: "1080p",
      minResolution: "any",
      requireCached: true,
      maxSizeGB: null,
      minSeeders: null,
      requireHDR: false,
      excludeHDR: false,
      requireAudio: null,
      languages: ["english"],
      excludeRdBlocked: true,
    },
    tiebreakers: ["resolution_desc", "audio_quality_desc", "size_smaller"],
    preferredGroups: [],
    sticky: { enabled: true, scope: "season" },
  };

  it("parses valid config", () => {
    const result = ConfigSchema.parse(valid);
    expect(result).toEqual(valid);
  });

  it("rejects missing torrentioUrl", () => {
    const bad = { ...valid, torrentioUrl: undefined };
    expect(() => ConfigSchema.parse(bad)).toThrow();
  });

  it("rejects unknown tiebreaker", () => {
    const bad = { ...valid, tiebreakers: ["bogus"] as never };
    expect(() => ConfigSchema.parse(bad)).toThrow();
  });

  it("rejects empty torrentioUrl", () => {
    const bad = { ...valid, torrentioUrl: "" };
    expect(() => ConfigSchema.parse(bad)).toThrow();
  });
});

describe("config codec", () => {
  const valid: Config = {
    torrentioUrl: "https://torrentio.strem.fun/abc/manifest.json",
    profile: "1080p-balanced",
    hardFilters: {
      maxResolution: "1080p",
      minResolution: "any",
      requireCached: true,
      maxSizeGB: null,
      minSeeders: null,
      requireHDR: false,
      excludeHDR: false,
      requireAudio: null,
      languages: ["english"],
      excludeRdBlocked: true,
    },
    tiebreakers: ["resolution_desc", "audio_quality_desc", "size_smaller"],
    preferredGroups: [],
    sticky: { enabled: true, scope: "season" },
  };

  it("roundtrips encode then decode", () => {
    const encoded = encodeConfig(valid);
    expect(typeof encoded).toBe("string");
    expect(encoded).not.toContain("+");
    expect(encoded).not.toContain("/");
    expect(encoded).not.toContain("=");
    const decoded = decodeConfig(encoded);
    expect(decoded).toEqual(valid);
  });

  it("decode throws on malformed base64", () => {
    expect(() => decodeConfig("!!!not_base64!!!")).toThrow();
  });

  it("decode throws on valid base64 but invalid schema", () => {
    const badJson = Buffer.from(JSON.stringify({ foo: "bar" })).toString("base64url");
    expect(() => decodeConfig(badJson)).toThrow();
  });
});

describe("profiles", () => {
  it("exports all 5 profile keys", () => {
    expect(Object.keys(PROFILES).sort()).toEqual([
      "1080p-balanced",
      "4k-hdr",
      "best-audio",
      "custom",
      "smallest-cached",
    ]);
  });

  it("4k-hdr requires HDR and 2160p ceiling", () => {
    const cfg = applyProfile("4k-hdr", "https://torrentio.strem.fun/x/manifest.json");
    expect(cfg.hardFilters.maxResolution).toBe("2160p");
    expect(cfg.hardFilters.requireHDR).toBe(true);
    expect(cfg.hardFilters.requireCached).toBe(true);
  });

  it("smallest-cached enforces 4 GB cap", () => {
    const cfg = applyProfile("smallest-cached", "https://torrentio.strem.fun/x/manifest.json");
    expect(cfg.hardFilters.maxSizeGB).toBe(4);
  });

  it("custom returns sane defaults", () => {
    const cfg = applyProfile("custom", "https://torrentio.strem.fun/x/manifest.json");
    expect(cfg.profile).toBe("custom");
    expect(cfg.tiebreakers.length).toBeGreaterThan(0);
  });

  it("all profiles produce schema-valid configs", () => {
    for (const name of Object.keys(PROFILES) as Array<keyof typeof PROFILES>) {
      const cfg = applyProfile(name, "https://torrentio.strem.fun/x/manifest.json");
      expect(() => ConfigSchema.parse(cfg)).not.toThrow();
    }
  });
});
