# Match Pulse Rooms

> Feel the match. See the reason.

Match Pulse Rooms is an explainable, non-wagering second screen for football. It turns TxLINE scores and odds into a momentum story, lets fans make free micro-predictions, and compares crowd instinct with the market.

Built for the **Solana World Cup Hackathon — Consumer & Fan Experiences** track.

## Why it exists

Live-score products tell fans *what* happened. Betting products tell users *what the price is*. Match Pulse Rooms connects those signals into an answer to a more human question: **why does this match feel alive right now?**

The experience is deliberately consumer-first:

- Pulse is a transparent momentum index, not a prediction or betting tip.
- Fan calls use no money, wallet, token, or prize.
- Every Pulse movement can be opened and explained.
- A deterministic replay works even when there is no active fixture.
- TxLINE Live accepts a fixture ID and normalizes current scores and odds on the server.

## Product tour

1. Read score, clock, Pulse, and Tension at a glance.
2. Play or scrub a curated comeback replay.
3. Inspect the contribution of territory, attacking threat, market movement, and recent events.
4. Make a free full-time call and compare the fan crowd with the market.
5. Switch to **TxLINE Live** and load a devnet fixture without exposing credentials.

## Commercial path

The same signal engine can be licensed as a white-label fan layer:

- media SDK and embeddable match rooms;
- club or creator subscriptions across a season;
- sponsor-safe activations around high-tension moments, without wagering;
- stadium and watch-party displays driven by the same normalized room model.

## Architecture

```text
Browser
  ├─ synthetic showcase replay
  ├─ local-only fan call
  └─ /api/txline/room
          ├─ short-lived guest JWT
          ├─ server-only API token
          ├─ score snapshot + current/historical odds
          └─ narrow normalized response
                    │
                    ▼
              TxLINE devnet
```

The replay contains synthetic data and is labeled in the interface. Raw TxLINE feeds are not stored or republished.

## Pulse model

Pulse starts at 50 and applies bounded, inspectable contributions:

```text
50
+ (territory - 50) × 0.28
+ (home threat - away threat) × 0.22
+ market home shift × 0.8
+ recent event swing
```

The result is clamped to `[8, 92]` so the room never presents momentum as certainty.

## Run locally

Requirements: Node.js 20+ and pnpm 10+.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`. Replay works with no configuration.

### Enable TxLINE Live

Set these server-only values in `.env.local`:

```dotenv
TXLINE_API_BASE=https://txline-dev.txodds.com/api
TXLINE_AUTH_BASE=https://txline-dev.txodds.com
TXLINE_API_TOKEN=your_devnet_api_token
```

Optional featured fixture metadata:

```dotenv
TXLINE_FEATURED_FIXTURE_ID=
TXLINE_FEATURED_HOME=
TXLINE_FEATURED_AWAY=
```

Never prefix the API token with `NEXT_PUBLIC_`.

## Validation

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

The end-to-end suite covers desktop and 390 px mobile layouts, replay controls, fan calls, the live connector, horizontal overflow, and serious/critical accessibility violations.

## Documentation

- [Product specification](docs/PRODUCT_SPEC.md)
- [Architecture and security](docs/ARCHITECTURE.md)
- [TxLINE integration notes](docs/TXLINE_INTEGRATION.md)
- [Devnet activation evidence](docs/DEVNET_ACTIVATION.md)
- [Human decisions](docs/HUMAN_DECISIONS.md)
- [AI assistance disclosure](docs/AI_DISCLOSURE.md)
- [Demo narration and shot list](docs/VIDEO_SCRIPT.md)
- [Submission draft](docs/SUBMISSION_DRAFT.md)
- [Submission checklist](docs/SUBMISSION_CHECKLIST.md)

## AI disclosure

Codex was used materially for research synthesis, product design, implementation, testing, documentation, deployment preparation, and demo production. The human entrant approved the track, concept, and primary product decisions, retains responsibility for the submission, tests the finished product, and performs required account, legal, and final-submission actions.

## License

MIT. TxLINE is a third-party data service; its data and marks remain subject to its own terms. No FIFA or tournament branding is included.
