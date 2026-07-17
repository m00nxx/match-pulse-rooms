# Match Pulse Rooms — product specification

## One-line product

Match Pulse Rooms turns live TxLINE scores and odds into an explainable, non-wagering second-screen experience where fans can understand momentum, make free micro-predictions, and compare the crowd with the market.

## Track and judging thesis

- Track: Consumer & Fan Experiences.
- Primary input: TxLINE scores and odds.
- Differentiator: odds are treated as a collective information signal, not as a betting call to action.
- Consumer value: the room explains *why* a match feels tense and makes passive viewing participatory.
- Demo reliability: the curated replay is always available; a server-only connector supports real TxLINE fixture IDs.

## Core user journey

1. Open a room and understand score, match state, momentum, and tension in under five seconds.
2. Scrub or play the replay and see every signal update together.
3. Open “Why this pulse?” to inspect the signal contributions.
4. Answer a free micro-prediction and compare the fan crowd with the market.
5. Switch to TxLINE Live, enter a fixture ID, and load server-normalized scores and odds.

## MVP acceptance criteria

- Mobile-first at 360 px and polished at desktop widths.
- Keyboard-accessible controls and visible focus states.
- Replay is deterministic, interactive, and clearly labeled as simulated.
- Pulse is derived from a documented, deterministic formula.
- User predictions persist locally without accounts, wallets, or money.
- TxLINE secrets remain server-only and raw provider responses are not republished.
- Live errors degrade to a useful status without breaking replay.
- Reduced-motion preferences are respected.

## Explicit non-goals

- No deposits, wagers, token purchases, wallet connection, or real prizes.
- No claim that Pulse predicts the final result.
- No FIFA marks, tournament logos, player likenesses, or copied broadcast assets.
- No persistence of raw TxLINE feeds in the public repository.

## Success metrics

- A new visitor can explain Pulse after one interaction.
- A judge can complete the replay and prediction loop in under 90 seconds.
- Replay remains fully usable when TxLINE has no active fixture.
- Live credentials are absent from client bundles and git history.

## Commercial path

- License the normalized signal engine and embeddable room to sports publishers.
- Offer season-based club and creator rooms with community identity.
- Sell sponsor-safe branded moments at tension peaks without wagering mechanics.
- Reuse the room view model for stadium screens and watch-party displays.
