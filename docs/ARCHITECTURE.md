# Architecture

## Runtime shape

```text
Browser
  ├─ deterministic showcase replay
  ├─ local-only fan prediction state
  └─ GET /api/txline/room?fixtureId=...
          │
          ▼
      Next.js route handler
        ├─ obtains a short-lived guest JWT
        ├─ adds the server-only TxLINE API token
        ├─ fetches scores + odds in parallel
        └─ returns a narrow normalized view model
          │
          ▼
      TxLINE devnet API
```

## Security boundaries

- `TXLINE_API_TOKEN` is read only from a module marked `server-only`.
- No secret uses the `NEXT_PUBLIC_` prefix.
- The route validates fixture IDs, uses an upstream timeout, disables caching, and returns generic errors.
- Only the fields required by the room are normalized; raw TxLINE payloads are neither stored nor relayed.
- The showcase dataset is synthetic and carries an in-product disclosure.

## Pulse model

Pulse is a transparent momentum index, not a win probability. It starts at 50 and applies four bounded contributions:

```text
50
+ (territory - 50) × 0.28
+ (home threat - away threat) × 0.22
+ market home shift × 0.8
+ event swing
```

The result is rounded and clamped to `[8, 92]`. The UI exposes each contribution in plain language.

## Graceful degradation

- Replay mode has no external runtime dependency.
- If live credentials or a fixture ID are missing, the API returns an actionable status.
- If either scores or odds is unavailable, the other source can still be rendered.
- User prediction state is optional; storage failures do not block the room.
