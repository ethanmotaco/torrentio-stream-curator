import { ConfigSchema, type Config } from "./schema.js";

export function encodeConfig(config: Config): string {
  const json = JSON.stringify(config);
  return Buffer.from(json, "utf-8").toString("base64url");
}

export function decodeConfig(encoded: string): Config {
  let json: string;
  try {
    json = Buffer.from(encoded, "base64url").toString("utf-8");
  } catch {
    throw new Error("invalid base64url config");
  }
  let obj: unknown;
  try {
    obj = JSON.parse(json);
  } catch {
    throw new Error("config is not valid JSON");
  }
  return ConfigSchema.parse(obj);
}
