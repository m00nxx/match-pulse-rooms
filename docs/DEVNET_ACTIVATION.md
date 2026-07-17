# Devnet activation evidence

## Subscription

- Network: Solana devnet.
- Wallet: [`nSLuKkA8p5V6McRt5g21XyQjwn6eL2bqjyuAQqhoHTw`](https://explorer.solana.com/address/nSLuKkA8p5V6McRt5g21XyQjwn6eL2bqjyuAQqhoHTw?cluster=devnet).
- TxLINE program: `6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J`.
- Service level: World Cup free tier, level `1`, four weeks.
- TxLINE token cost: `0`.
- Mainnet funds used: none.

Public transactions:

- TxLINE devnet funding:
  [`2TpptyDcyk6pRXWYs7gsjVptxTYWoQTTujwS2k1hMfbFSS5ejL3dRjgxPACYGdsTgN4DjTpPot2hDerqRi4RP1ku`](https://explorer.solana.com/tx/2TpptyDcyk6pRXWYs7gsjVptxTYWoQTTujwS2k1hMfbFSS5ejL3dRjgxPACYGdsTgN4DjTpPot2hDerqRi4RP1ku?cluster=devnet).
- Token-2022 associated account:
  [`NvcYN3FacyRVGbanDjZkPfMhzoN8aLQtGg4fpKY7arX1HKokWjQK1gGF7DPKgJiCfUeuyWboGUtvwkh65jFd3eS`](https://explorer.solana.com/tx/NvcYN3FacyRVGbanDjZkPfMhzoN8aLQtGg4fpKY7arX1HKokWjQK1gGF7DPKgJiCfUeuyWboGUtvwkh65jFd3eS?cluster=devnet).
- Active free-tier subscription:
  [`4eR32hWnd76QCJWZZQUPm2RPvwv3pKA9Yx7Wc4NHac4hQQcgGG8aYyLjAH85zdWK5YVgerComaTjuCPBQ2z7wMTW`](https://explorer.solana.com/tx/4eR32hWnd76QCJWZZQUPm2RPvwv3pKA9Yx7Wc4NHac4hQQcgGG8aYyLjAH85zdWK5YVgerComaTjuCPBQ2z7wMTW?cluster=devnet).

## Live connector verification

Verified on July 17, 2026 against fixture `18241006`:

- competition: World Cup;
- participants: England vs Argentina;
- game state: final;
- score: England 1–2 Argentina;
- clock: 101 minutes;
- last normalized event: `game_finalised`;
- score source: `GET /api/scores/snapshot/18241006`;
- market source: documented historical `GET /api/odds/snapshot/18241006?asOf=...`;
- market snapshot time used by the demo: July 15, 2026 at 20:30 UTC.

The application returns only its narrow room model. Raw provider payloads,
guest JWTs, the long-lived API token, wallet signatures, and private key
material are not committed or sent to the browser.
