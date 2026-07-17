import "server-only";

import type { LiveOddsMarket, LiveRoomPayload } from "@/types/match";

const DEFAULT_API_BASE = "https://txline-dev.txodds.com/api";
const DEFAULT_AUTH_BASE = "https://txline-dev.txodds.com";
const REQUEST_TIMEOUT_MS = 8_000;

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asRecords(value: unknown): UnknownRecord[] {
  if (Array.isArray(value)) {
    return value.filter(isRecord);
  }

  if (!isRecord(value)) {
    return [];
  }

  for (const key of ["data", "items", "updates", "scores", "odds", "result"]) {
    if (Array.isArray(value[key])) {
      return (value[key] as unknown[]).filter(isRecord);
    }
  }

  return [];
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function getNestedRecord(
  record: UnknownRecord,
  ...path: string[]
): UnknownRecord | null {
  let current: unknown = record;

  for (const key of path) {
    if (!isRecord(current)) {
      return null;
    }
    current = current[key];
  }

  return isRecord(current) ? current : null;
}

function readProbability(value: unknown): number | null {
  if (value === "NA") {
    return null;
  }

  const numeric = asNumber(value);
  if (numeric === null) {
    return null;
  }

  return Math.round((numeric <= 1 ? numeric * 100 : numeric) * 10) / 10;
}

async function getGuestJwt(authBase: string, signal: AbortSignal) {
  const response = await fetch(`${authBase}/auth/guest/start`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error("TxLINE guest session unavailable");
  }

  const body: unknown = await response.json();
  if (!isRecord(body) || typeof body.token !== "string") {
    throw new Error("TxLINE guest session was malformed");
  }

  return body.token;
}

async function fetchTxline(
  apiBase: string,
  path: string,
  jwt: string,
  apiToken: string,
  signal: AbortSignal,
): Promise<unknown> {
  const response = await fetch(`${apiBase}${path}`, {
    headers: {
      authorization: `Bearer ${jwt}`,
      "x-api-token": apiToken,
      accept: "application/json",
    },
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(`TxLINE upstream returned ${response.status}`);
  }

  return response.json();
}

function normalizeMarkets(raw: unknown): LiveOddsMarket[] {
  const markets = asRecords(raw);

  return markets
    .map((market): LiveOddsMarket | null => {
      const names = Array.isArray(market.PriceNames)
        ? market.PriceNames.filter((item): item is string => typeof item === "string")
        : [];
      const pct = Array.isArray(market.Pct) ? market.Pct : [];

      if (names.length === 0 || pct.length === 0) {
        return null;
      }

      return {
        label:
          typeof market.SuperOddsType === "string"
            ? market.SuperOddsType
            : "Match market",
        period:
          typeof market.MarketPeriod === "string"
            ? market.MarketPeriod
            : "Match",
        bookmaker:
          typeof market.Bookmaker === "string" ? market.Bookmaker : "TxLINE",
        inRunning: market.InRunning === true,
        outcomes: names.slice(0, 6).map((name, index) => ({
          name,
          probability: readProbability(pct[index]),
        })),
      };
    })
    .filter((market): market is LiveOddsMarket => market !== null)
    .slice(0, 8);
}

function normalizeScores(raw: unknown) {
  const scores = asRecords(raw).sort(
    (a, b) => (asNumber(b.ts) ?? 0) - (asNumber(a.ts) ?? 0),
  );

  const latest = scores[0] ?? null;
  const scored = scores.find((item) => isRecord(item.scoreSoccer)) ?? null;
  const timed =
    scores.find((item) => asNumber(getNestedRecord(item, "dataSoccer")?.Minutes) !== null) ??
    null;

  const participant1 = scored
    ? asNumber(
        getNestedRecord(
          scored,
          "scoreSoccer",
          "Participant1",
          "Total",
        )?.Goals,
      )
    : null;
  const participant2 = scored
    ? asNumber(
        getNestedRecord(
          scored,
          "scoreSoccer",
          "Participant2",
          "Total",
        )?.Goals,
      )
    : null;

  return {
    gameState:
      latest && typeof latest.gameState === "string" ? latest.gameState : null,
    minute: timed
      ? asNumber(getNestedRecord(timed, "dataSoccer")?.Minutes)
      : null,
    score:
      participant1 !== null && participant2 !== null
        ? { participant1, participant2 }
        : null,
    lastEvent: latest
      ? {
          action:
            typeof latest.action === "string" ? latest.action : "Score update",
          participant: asNumber(latest.participant),
          timestamp: asNumber(latest.ts) ?? Date.now(),
        }
      : null,
  };
}

export function isTxlineConfigured() {
  return Boolean(process.env.TXLINE_API_TOKEN);
}

export function getFeaturedFixture() {
  const fixtureId = asNumber(process.env.TXLINE_FEATURED_FIXTURE_ID);

  return {
    fixtureId:
      fixtureId !== null && Number.isSafeInteger(fixtureId) ? fixtureId : null,
    home: process.env.TXLINE_FEATURED_HOME?.trim() || null,
    away: process.env.TXLINE_FEATURED_AWAY?.trim() || null,
  };
}

export async function getLiveRoom(fixtureId: number): Promise<LiveRoomPayload> {
  const apiToken = process.env.TXLINE_API_TOKEN;
  if (!apiToken) {
    throw new Error("TXLINE_NOT_CONFIGURED");
  }

  const apiBase = process.env.TXLINE_API_BASE || DEFAULT_API_BASE;
  const authBase = process.env.TXLINE_AUTH_BASE || DEFAULT_AUTH_BASE;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const jwt = await getGuestJwt(authBase, controller.signal);
    const [scoreResult, historicalResult, oddsResult] =
      await Promise.allSettled([
        fetchTxline(
          apiBase,
          `/scores/updates/${fixtureId}`,
          jwt,
          apiToken,
          controller.signal,
        ),
        fetchTxline(
          apiBase,
          `/scores/historical/${fixtureId}`,
          jwt,
          apiToken,
          controller.signal,
        ),
        fetchTxline(
          apiBase,
          `/odds/snapshot/${fixtureId}`,
          jwt,
          apiToken,
          controller.signal,
        ),
      ]);

    const currentScores =
      scoreResult.status === "fulfilled" ? scoreResult.value : [];
    const historicalScores =
      historicalResult.status === "fulfilled" ? historicalResult.value : [];
    const scoreRecords = [
      ...asRecords(currentScores),
      ...asRecords(historicalScores),
    ];
    const normalizedScores = normalizeScores(scoreRecords);
    const markets =
      oddsResult.status === "fulfilled"
        ? normalizeMarkets(oddsResult.value)
        : [];

    if (scoreRecords.length === 0 && markets.length === 0) {
      throw new Error("TXLINE_FIXTURE_UNAVAILABLE");
    }

    return {
      source: "txline",
      fixtureId,
      fetchedAt: new Date().toISOString(),
      ...normalizedScores,
      markets,
      availability: {
        scores: scoreRecords.length > 0,
        odds: markets.length > 0,
      },
    };
  } finally {
    clearTimeout(timeout);
  }
}
