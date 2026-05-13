<div align="center">
  <img src="assets/logo.svg" alt="Torrentio Stream Curator" width="460">
  <p>A <a href="https://www.stremio.com/">Stremio</a> addon that turns Torrentio + Real Debrid into a single-click experience.</p>

  <p>
    <a href="https://github.com/ethanmotaco/torrentio-stream-curator/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/ethanmotaco/torrentio-stream-curator/actions/workflows/ci.yml/badge.svg?branch=main"></a>
    <img alt="Streams curated" src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fabacus.jasoncameron.dev%2Fget%2Ftorrentio-stream-curator-3f8a1d2b%2Fpicks&query=value&label=streams%20curated&color=5eead4&style=flat-square">
    <img alt="Active configs" src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fabacus.jasoncameron.dev%2Fget%2Ftorrentio-stream-curator-3f8a1d2b%2Finstalls&query=value&label=active%20configs&color=a78bfa&style=flat-square">
    <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-fbbf24?style=flat-square"></a>
    <img alt="Node 20+" src="https://img.shields.io/badge/node-20%2B-5eead4?style=flat-square">
    <img alt="TypeScript" src="https://img.shields.io/badge/typescript-strict-a78bfa?style=flat-square">
  </p>
</div>

---

## What it does

Stremio with the Torrentio addon + Real Debrid surfaces 30 nearly-identical results per title and forces you to read tracker tags to pick one. Torrentio Stream Curator replaces that wall of options with **one curated stream per title**:

1. Fetches Torrentio's stream list using your existing install URL
2. Cross-checks each release against Stremio's Cinemeta metadata to drop mislabeled torrents
3. Applies a consensus filter that catches mislabeled streams even when Cinemeta itself is wrong
4. Filters by your quality preferences (resolution, HDR, audio, language, size)
5. Ranks by ordered tiebreakers
6. **Probes the top 5 candidates in parallel** via HTTP HEAD - first one that responds wins
7. Sticks to the same release group across episodes for visual consistency
8. Returns one stream labeled with what it picked: `▶ Best · 2160p · DV · Atmos · 19.7 GB`

The result: open Stremio, click play, watch.

## Highlights

- **Cinemeta + consensus title matching** - Torrentio sometimes mislabels torrents under the wrong IMDB id. Torrentio Stream Curator detects this with two complementary filters: (1) compare each release against Cinemeta's canonical title, (2) reject singleton streams whose token bag doesn't overlap with the majority. Either filter alone catches the common cases; together they handle adversarial upstream data.
- **HEAD probe with parallel fallback** - RD revokes URLs after the fact for filename-based DMCA. Pre-filtering on known-bad patterns is unreliable. Instead, every pick is HEAD-probed in parallel; the top-ranked URL that returns 2xx-3xx wins.
- **Graceful filter relaxation** - when strict filters yield zero matches, the engine drops filters in reverse-tiebreaker order until something matches, then tells you what was relaxed (`Torrentio Stream Curator (relaxed: requireHDR)`).
- **Sticky release groups** - once an episode's group is picked, subsequent episodes prefer the same group for consistent audio mix, intros, and encode characteristics. Falls through if the group is missing for that episode.
- **Stateless deploy** - sticky map and response cache are in-memory; the addon is safe to run on Beamup or any ephemeral host.
- **Language alias normalization** - `eng`, `english`, `dual` all match.

## Architecture

```
              ┌───────────────────────────────────────────┐
              │ Stremio client                            │
              └───────────────────────────────────────────┘
                            │ GET /{config}/stream/movie/{id}.json
                            ▼
              ┌───────────────────────────────────────────┐
              │ Express server                            │
              │  decode config (zod) ── cache hit?         │
              │           │                                │
              │           ├──► Torrentio.fetch(streams)    │── parallel
              │           └──► Cinemeta.fetch(metadata)    │
              │                       │                    │
              │           parse all + ptt extraction       │
              │                       │                    │
              │           cinemeta title filter            │
              │                       │                    │
              │           consensus filter (majority vote) │
              │                       │                    │
              │           hard filters → relax loop        │
              │                       │                    │
              │           rank by tiebreakers              │
              │                       │                    │
              │           probe top 5 (parallel HEAD)      │
              │                       │                    │
              │           winner → sticky write → cache    │
              └───────────────────────────────────────────┘
                            │
                            ▼
              ┌───────────────────────────────────────────┐
              │ { streams: [ one curated pick ] }         │
              └───────────────────────────────────────────┘
```

| Module | Responsibility |
|--------|----------------|
| [`src/config/`](src/config) | Zod schema, base64url codec, profile presets |
| [`src/torrentio/`](src/torrentio) | HTTP client with retry, response normalization |
| [`src/cinemeta/`](src/cinemeta) | Stremio metadata lookup for canonical title |
| [`src/parser/`](src/parser) | parse-torrent-title + RD-block detection + custom regex |
| [`src/engine/`](src/engine) | Pure filter/rank/relax/sticky/consensus/title-match/probe logic |
| [`src/cache/`](src/cache) | LRU response cache |
| [`src/config-page/`](src/config-page) | Static HTML form, client-side install URL builder |
| [`src/server.ts`](src/server.ts) | Express routing, manifest, CORS, glue |

All engine logic is pure — filter, rank, relax, sticky, consensus, title-match are independently testable. The full picking pipeline is covered end-to-end by the vitest suite under `test/`.

## Install

The addon is hosted on Beamup. Configure once, get a personal install URL:

1. Open the [Torrentio Stream Curator configure page](https://aa0452deda14-torrentio-stream-curator-docker.baby-beamup.club/configure/)
2. Paste your Torrentio install URL (get it from <https://torrentio.strem.fun/configure>)
3. Pick a profile (4K HDR by default) — tweak in *Advanced* if needed
4. Click **Build install URL** → **Open in Stremio**
5. *(Recommended)* In Stremio Settings → Addons, drag Torrentio Stream Curator above Torrentio so the curated stream shows first

## Self-host

The public deploy strips debrid tokens from logs and runs no database, but the only way to be sure of what the server does is to run it yourself. Two paths:

### Docker (recommended)

```bash
git clone https://github.com/ethanmotaco/torrentio-stream-curator.git
cd torrentio-stream-curator
docker build -t stream-curator .
docker run -d --name stream-curator -p 7000:7000 stream-curator
```

Healthcheck endpoint: `GET /health`.

### Node (Node 20+)

```bash
git clone https://github.com/ethanmotaco/torrentio-stream-curator.git
cd torrentio-stream-curator
npm install
npm run build
PORT=7000 node dist/index.js
```

Local: <http://localhost:7000/configure>

### Exposing your local instance to Stremio

Stremio requires HTTPS for addon manifests. For self-hosting on a home server, easiest options:

- **[Tailscale Funnel](https://tailscale.com/kb/1223/funnel)** — free, no DNS setup, works on any tailnet. `tailscale funnel --bg 7000`.
- **[cloudflared tunnel](https://github.com/cloudflare/cloudflared)** — free public HTTPS URL, no port forwarding. `cloudflared tunnel --url http://localhost:7000`.
- **Reverse proxy + your own domain** (Caddy / nginx + Let's Encrypt).

## Develop

```bash
npm install
npm run dev          # tsx watch on port 7000
npm test             # vitest
npm run typecheck    # tsc strict
npm run build        # → dist/
```

## Public deploy (Beamup)

```bash
npm install -g beamup-cli
beamup
```

Beamup returns a public HTTPS URL. The manifest at `/manifest.json` and configure page at `/configure` are immediately reachable.

## Disclaimer

This is an unofficial, third-party project. It is **not affiliated with, endorsed by, or associated with** Stremio, the Torrentio addon, or Real Debrid. It does not host, distribute, or transcode any media. It is a thin curation layer over data and URLs returned by upstream services that the user has independently chosen to install. Users are solely responsible for the content they access and for complying with the laws of their jurisdiction.

The project name references Torrentio because it consumes Torrentio's public addon interface; no trademark, sponsorship, or partnership is implied.

## Security

Found a security issue? Please report privately — see [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) — © 2026 Ethan Motaco
