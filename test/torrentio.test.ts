import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { MockAgent, setGlobalDispatcher, getGlobalDispatcher, type Dispatcher } from "undici";
import { fetchStreams, normalizeBaseUrl } from "../src/torrentio/client.js";
import fixture from "./fixtures/torrentio-movie.json" with { type: "json" };

let agent: MockAgent;
let prev: Dispatcher;

beforeEach(() => {
  prev = getGlobalDispatcher();
  agent = new MockAgent();
  agent.disableNetConnect();
  setGlobalDispatcher(agent);
});

afterEach(async () => {
  await agent.close();
  setGlobalDispatcher(prev);
});

describe("normalizeBaseUrl", () => {
  it("strips /manifest.json", () => {
    expect(normalizeBaseUrl("https://torrentio.strem.fun/abc/manifest.json"))
      .toBe("https://torrentio.strem.fun/abc");
  });

  it("strips trailing slash", () => {
    expect(normalizeBaseUrl("https://torrentio.strem.fun/abc/"))
      .toBe("https://torrentio.strem.fun/abc");
  });

  it("leaves clean base alone", () => {
    expect(normalizeBaseUrl("https://torrentio.strem.fun/abc"))
      .toBe("https://torrentio.strem.fun/abc");
  });

  it("strips /configure", () => {
    expect(normalizeBaseUrl("https://torrentio.strem.fun/abc/configure"))
      .toBe("https://torrentio.strem.fun/abc");
  });

  it("strips /configure with trailing slash", () => {
    expect(normalizeBaseUrl("https://torrentio.strem.fun/abc/configure/"))
      .toBe("https://torrentio.strem.fun/abc");
  });
});

describe("fetchStreams", () => {
  it("returns streams on 200", async () => {
    const pool = agent.get("https://torrentio.strem.fun");
    pool.intercept({ path: "/abc/stream/movie/tt0816692.json", method: "GET" })
      .reply(200, fixture);
    const streams = await fetchStreams("https://torrentio.strem.fun/abc", "movie", "tt0816692");
    expect(streams).toHaveLength(2);
  });

  it("retries once on 5xx then succeeds", async () => {
    const pool = agent.get("https://torrentio.strem.fun");
    pool.intercept({ path: "/abc/stream/movie/tt0816692.json", method: "GET" }).reply(503, "");
    pool.intercept({ path: "/abc/stream/movie/tt0816692.json", method: "GET" }).reply(200, fixture);
    const streams = await fetchStreams("https://torrentio.strem.fun/abc", "movie", "tt0816692");
    expect(streams).toHaveLength(2);
  });

  it("returns empty array after retry exhaustion on 5xx", async () => {
    const pool = agent.get("https://torrentio.strem.fun");
    pool.intercept({ path: "/abc/stream/movie/tt0816692.json", method: "GET" }).reply(500, "").times(2);
    const streams = await fetchStreams("https://torrentio.strem.fun/abc", "movie", "tt0816692");
    expect(streams).toEqual([]);
  });

  it("returns empty array on malformed JSON", async () => {
    const pool = agent.get("https://torrentio.strem.fun");
    pool.intercept({ path: "/abc/stream/movie/tt0816692.json", method: "GET" })
      .reply(200, "<html>not json</html>");
    const streams = await fetchStreams("https://torrentio.strem.fun/abc", "movie", "tt0816692");
    expect(streams).toEqual([]);
  });
});
