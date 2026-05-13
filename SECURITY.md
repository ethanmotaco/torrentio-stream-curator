# Security Policy

## Reporting a Vulnerability

If you believe you have found a security vulnerability in Torrentio Stream Curator, please **do not** open a public GitHub issue.

Instead, open a [private security advisory](https://github.com/ethanmotaco/torrentio-stream-curator/security/advisories/new) on GitHub. This routes the report only to project maintainers and creates a tracked, confidential disclosure thread.

Please include:

- A description of the issue and its impact
- Steps to reproduce (proof-of-concept code, request samples, or screenshots)
- Affected version / commit SHA
- Any suggested remediation, if you have one

I aim to acknowledge reports within **72 hours** and to ship a fix or mitigation within **14 days** for confirmed issues, depending on severity and complexity.

## Scope

This project handles user-supplied configuration containing a Torrentio install URL (which itself embeds a Real Debrid API key for many users). The addon performs server-side HTTP requests to upstream services on behalf of users. Consequently, the in-scope concern areas include:

- Server-Side Request Forgery (SSRF) via user-supplied URLs
- Token / credential leakage through logs, error responses, or cross-origin responses
- Resource exhaustion (memory, sockets, CPU) on the addon host
- Cache poisoning across configurations
- Input validation / injection in route parameters or the configure-page form
- Supply-chain concerns in `package.json` dependencies

Out of scope:

- Issues in upstream Torrentio, Real Debrid, Cinemeta, or Stremio itself — please report those to the respective projects
- Self-inflicted issues that require an attacker to already control the victim's Stremio install or addon URL

## Threat Model Notes

The user-supplied addon URL embeds the user's Real Debrid token. Anyone with the URL has the equivalent of a bearer token to that user's Torrentio + RD setup. Do not share your addon install URL publicly.

The public deploy strips configuration tokens from logs but cannot eliminate the fact that the addon receives them. If this is unacceptable for your threat model, self-host (see [README](README.md#self-host)).
