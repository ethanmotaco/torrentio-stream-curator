# Contributing

Thanks for considering a contribution.

## Quick start

```bash
npm install
npm run dev          # tsx watch on :7000
npm run test:watch   # vitest watch mode
```

Local server: <http://localhost:7000/configure>

To test changes in Stremio you need HTTPS. Easiest: `cloudflared tunnel --url http://localhost:7000` or `tailscale funnel 7000`.

## Code conventions

- TypeScript strict mode, no `any` outside narrow casts at module boundaries
- Engine modules (`src/engine/`) are pure functions — keep them that way; side effects belong in `server.ts`
- Each module has a single responsibility; if a file exceeds ~200 lines, consider splitting
- Comments explain *why*, not *what*

## Testing

```bash
npm test
```

Tests in `test/` mirror `src/` layout. Engine logic should be unit-testable in isolation (filter, rank, relax, sticky, consensus, title-match). For HTTP code, use `undici` `MockAgent` (see `test/torrentio.test.ts`).

New features should ship with tests covering both happy path and one realistic edge case.

## Adding RD-blocked patterns

If you find filenames that RD consistently blocks but aren't in `RD_BLOCKED_PATTERNS`, open a PR adding the regex with a comment citing the block rate. See `src/parser/fields.ts`.

## Commit messages

Conventional Commits: `feat(scope): ...`, `fix(scope): ...`, `chore: ...`, `docs: ...`.

## Submitting changes

1. Fork + branch from `main`
2. Make changes + add tests
3. `npm test && npm run typecheck` must pass
4. Open PR — CI will run on Node 20 and 22
