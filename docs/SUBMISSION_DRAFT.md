# Submission draft

## Project

**Name:** Match Pulse Rooms

**Track:** Consumer & Fan Experiences

**Tagline:** Feel the match. See the reason.

## Short description

Match Pulse Rooms is an explainable, non-wagering second screen for football. It turns TxLINE scores and odds into a momentum story, lets fans make free micro-predictions, and shows where crowd instinct diverges from the market.

## What was built

- A polished mobile-first match room.
- A deterministic interactive comeback replay.
- An explainable Pulse momentum engine with visible signal contributions.
- A Tension index and event timeline.
- Free, local-only fan calls with crowd/market comparison.
- A server-only TxLINE devnet connector for fixture scores and odds.
- Security headers, graceful failure states, metadata, OG image, and PWA manifest.
- Unit, end-to-end, responsive, and automated accessibility checks.

## TxLINE usage

Primary endpoints:

- `POST /auth/guest/start`
- `GET /api/scores/snapshot/{fixtureId}`
- `GET /api/odds/snapshot/{fixtureId}`
- `GET /api/odds/snapshot/{fixtureId}?asOf={timestamp}`

The app obtains a fresh guest JWT and adds the subscription token only on the server. Raw feeds and credentials are never returned to the client.

The deployed connector includes a verified historical replay of fixture
`18241006` (England 1–2 Argentina) with a final score snapshot and an explicitly
labelled historical TxLINE market snapshot.

## Why it fits the track

Odds are used as an information signal rather than a wagering call to action. This creates a consumer experience that makes a match easier to understand and more social without requiring deposits, wallets, prizes, or financial risk.

## Links

- Application: https://match-pulse-rooms.vercel.app
- Public repository: https://github.com/m00nxx/match-pulse-rooms
- Technical documentation: https://github.com/m00nxx/match-pulse-rooms#architecture
- Devnet activation evidence: https://github.com/m00nxx/match-pulse-rooms/blob/main/docs/DEVNET_ACTIVATION.md
- Demo video: https://match-pulse-rooms.vercel.app/demo

## Superteam form-ready answers

**Project Title**

Match Pulse Rooms

**Briefly explain your Project**

Match Pulse Rooms is an explainable, non-wagering football second screen. It transforms TxLINE scores and odds into a transparent momentum story, lets fans make free local micro-predictions, and reveals where crowd instinct diverges from the market. A deterministic replay keeps the experience judgeable outside live match windows, while the server-only live connector demonstrates real TxLINE devnet data without exposing credentials.

**Link to live & working MVP**

https://match-pulse-rooms.vercel.app

**Public repository link**

https://github.com/m00nxx/match-pulse-rooms

**Technical documentation link**

https://github.com/m00nxx/match-pulse-rooms#architecture

**TxLINE feedback**

TxLINE’s free World Cup tier, shared fixture IDs, historical scores, and on-chain activation made a credible prototype possible. The highest-impact improvements would be a lightweight entitled-fixture discovery endpoint, one compact JSON example per response schema, a fixture-by-ID participant lookup, explicit empty-vs-unknown fixture status codes, and serverless SSE or recommended-polling guidance. Activation examples should also store long-lived tokens in protected environment files rather than printing them.

## TxODDS feedback

The free tier, shared fixture IDs, historical scores, and on-chain activation made a credible prototype possible. The most valuable improvements would be a live entitled-fixture discovery endpoint, compact response examples, a fixture-by-ID metadata lookup, and serverless SSE guidance. Full feedback is in `docs/TXLINE_INTEGRATION.md`.

## AI assistance disclosure

Codex was used materially for research synthesis, product design, implementation, testing, documentation, deployment preparation, and demo-video production. The human entrant approved the track, concept, and primary decisions, retains ownership and responsibility, tests the finished product, and performs required account, legal, and final-submission actions.
