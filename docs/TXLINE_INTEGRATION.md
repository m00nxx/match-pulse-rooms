# TxLINE integration

## Network and authentication

- Environment: Solana devnet / TxLINE devnet.
- API base: `https://txline-dev.txodds.com/api`
- Guest session: `POST https://txline-dev.txodds.com/auth/guest/start`
- Subscription program: `6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J`
- TxL mint: `4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG`
- Tier: World Cup free tier, service level `1`, four weeks, no league selection.

The application obtains a fresh guest JWT on the server, combines it with a long-lived subscription token, and sends neither credential to the browser.

## Endpoints used by the product

- `POST /auth/guest/start` — short-lived guest JWT.
- `GET /api/scores/snapshot/{fixtureId}` — bounded current or historical score snapshot.
- `GET /api/odds/snapshot/{fixtureId}` — available current markets.
- `GET /api/odds/snapshot/{fixtureId}?asOf={timestamp}` — documented historical market snapshot.

The score snapshot is the bounded polling source for both current fixtures and
verified historical replays. If no current five-minute odds snapshot exists for
a completed fixture, the backend requests a documented historical `asOf`
snapshot and labels it in the UI.

The official examples also informed the replay/live design:

- `GET /api/fixtures/snapshot`
- `GET /api/scores/updates/{fixtureId}`
- `GET /api/scores/historical/{fixtureId}`
- `GET /api/scores/stream`
- `GET /api/odds/stream`

The deployed MVP uses bounded polling through a route handler because serverless functions cannot guarantee a durable upstream SSE connection.

## Normalization

The browser receives only:

- fixture ID and fetch timestamp;
- latest game state, minute, score, and event descriptor;
- up to eight markets with names and percentages;
- independent availability flags for scores and odds.

It does not receive TxLINE tokens, raw provider payloads, proof trees, participant IDs, or unrelated market data.

## Product feedback for TxODDS

### What worked well

- The free World Cup tier makes a functional prototype possible without requiring a token purchase.
- Scores and odds share fixture IDs, enabling a coherent second-screen view.
- Historical score access supports reliable judging even outside a live match window.
- The guest-JWT plus API-token model is workable in a server-only backend-for-frontend.
- On-chain subscription state gives the integration a verifiable activation step.

### What would improve developer velocity

- Add a lightweight fixture-discovery endpoint that can return currently live, entitled fixtures without requiring competition and epoch-day inputs.
- Publish one compact JSON example for every response schema, especially score nesting and `Pct` units.
- Clarify in one place which HTTP status distinguishes an unknown fixture from a valid fixture with no current odds.
- Provide a serverless SSE reference or a recommended polling interval for Vercel-style deployments.
- Return participant display names in a fixture-by-ID lookup so consumer clients do not need a separate discovery flow.
- Avoid examples that print long-lived API tokens to stdout; write them to a protected environment file instead.

## Data and brand handling

The public repository contains only synthetic replay data. It does not contain captured TxLINE responses or private credentials. The UI uses original branding and no FIFA or tournament marks.

Public devnet activation and fixture verification evidence is recorded in
[`DEVNET_ACTIVATION.md`](DEVNET_ACTIVATION.md).
