import "server-only";

import type { LiveOddsMarket, LiveRoomPayload } from "@/types/match";

const DEFAULT_API_BASE = "https://txline-dev.txodds.com/api";
const DEFAULT_AUTH_BASE = "https://txline-dev.txodds.com";
const REQUEST_TIMEOUT_MS = 8_000;

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readField(record: UnknownRecord, ...keys: string[]): unknown {
  for (const key of keys) {
    if (key in record) return record[key];
  }

  const normalizedKeys = new Set(keys.map((key) => key.toLowerCase()));
  const matched = Object.keys(record).find((key) =>
    normalizedKeys.has(key.toLowerCase()),
  );
  return matched ? record[matched] : undefined;
}

function asRecords(value: unknown): UnknownRecord[] {
  if (Array.isArray(value)) {
    return value.filter(isRecord);
  }

  if (!isRecord(value)) {
    return [];
  }

  for (const key of ["data", "items", "updates", "scores", "odds", "result"]) {
    const nested = readField(value, key);
    if (Array.isArray(nested)) {
      return nested.filter(isRecord);
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
    current = readField(current, key);
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

function humanizeMarketLabel(value: unknown) {
  if (typeof value !== "string" || value.trim() === "") {
    return "Match market";
  }

  const knownLabels: Record<string, string> = {
    "1X2_PARTICIPANT_RESULT": "Match result",
    ASIANHANDICAP_PARTICIPANT_GOALS: "Asian handicap",
    TOTAL_PARTICIPANT_GOALS: "Total goals",
  };

  return (
    knownLabels[value] ??
    value
      .toLowerCase()
      .replaceAll("_", " ")
      .replace(/^\w/, (character) => character.toUpperCase())
  );
}

function humanizePeriod(value: unknown) {
  if (typeof value !== "string" || value.trim() === "") {
    return "Match";
  }

  return value
    .split(",")
    .map((part) => {
      const normalized = part.trim().toLowerCase();
      if (normalized === "half=1") return "First half";
      if (normalized === "half=2") return "Second half";
      if (normalized === "et") return "Extra time";
      if (normalized === "penalties") return "Penalties";
      return part.trim();
    })
    .join(" · ");
}

function humanizeOutcome(value: string) {
  const knownOutcomes: Record<string, string> = {
    part1: "Participant 1",
    part2: "Participant 2",
    draw: "Draw",
    yes: "Yes",
    no: "No",
  };

  return (
    knownOutcomes[value.toLowerCase()] ??
    value.replace(/^\w/, (character) => character.toUpperCase())
  );
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
      const rawNames = readField(market, "PriceNames", "priceNames");
      const rawPct = readField(market, "Pct", "pct");
      const names = Array.isArray(rawNames)
        ? rawNames.filter((item): item is string => typeof item === "string")
        : [];
      const pct = Array.isArray(rawPct) ? rawPct : [];

      if (names.length === 0 || pct.length === 0) {
        return null;
      }

      const label = readField(market, "SuperOddsType", "superOddsType");
      const period = readField(market, "MarketPeriod", "marketPeriod");
      const bookmaker = readField(market, "Bookmaker", "bookmaker");
      const inRunning = readField(market, "InRunning", "inRunning");
      const outcomes = names.slice(0, 6).map((name, index) => ({
        name: humanizeOutcome(name),
        probability: readProbability(pct[index]),
      }));

      if (outcomes.every((outcome) => outcome.probability === null)) {
        return null;
      }

      return {
        label: humanizeMarketLabel(label),
        period: humanizePeriod(period),
        bookmaker:
          typeof bookmaker === "string" && bookmaker.startsWith("TXLine")
            ? "TxLINE consensus"
            : typeof bookmaker === "string"
              ? bookmaker
              : "TxLINE",
        inRunning: inRunning === true || inRunning === 1,
        outcomes,
      };
    })
    .filter((market): market is LiveOddsMarket => market !== null)
    .slice(0, 8);
}

function normalizeScores(raw: unknown) {
  const scores = asRecords(raw).sort(
    (a, b) =>
      (asNumber(readField(b, "ts", "Ts")) ?? 0) -
      (asNumber(readField(a, "ts", "Ts")) ?? 0),
  );

  const latest = scores[0] ?? null;
  const scored =
    scores.find((item) =>
      isRecord(readField(item, "scoreSoccer", "ScoreSoccer", "score", "Score")),
    ) ?? null;
  const actionFor = (item: UnknownRecord) => {
    const dataAction = readField(getNestedRecord(item, "data") ?? {}, "Action");
    const rootAction = readField(item, "action", "Action");
    return typeof dataAction === "string"
      ? dataAction
      : typeof rootAction === "string"
        ? rootAction
        : "Score update";
  };
  const technicalActions = new Set([
    "comment",
    "connected",
    "connection",
    "coverage_update",
    "disconnected",
  ]);
  const meaningful =
    scores.find((item) => !technicalActions.has(actionFor(item))) ?? latest;
  const isFinal = scores.some((item) =>
    ["game_finalised", "game_finalized"].includes(actionFor(item)),
  );
  const scoreRoot = scored
    ? getNestedRecord(scored, "scoreSoccer") ??
      getNestedRecord(scored, "score")
    : null;

  const participant1 = scoreRoot
    ? asNumber(
        readField(
          getNestedRecord(scoreRoot, "Participant1", "Total") ?? {},
          "Goals",
        ),
      )
    : null;
  const participant2 = scoreRoot
    ? asNumber(
        readField(
          getNestedRecord(scoreRoot, "Participant2", "Total") ?? {},
          "Goals",
        ),
      )
    : null;
  const clockSeconds = scores.reduce<number | null>((maximum, item) => {
    const seconds = asNumber(
      readField(getNestedRecord(item, "clock") ?? {}, "Seconds"),
    );
    if (seconds === null) return maximum;
    return maximum === null ? seconds : Math.max(maximum, seconds);
  }, null);

  return {
    gameState: isFinal
      ? "final"
      : latest
        ? String(readField(latest, "gameState", "GameState") ?? "") || null
        : null,
    minute:
      clockSeconds !== null ? Math.max(0, Math.floor(clockSeconds / 60)) : null,
    score:
      participant1 !== null && participant2 !== null
        ? { participant1, participant2 }
        : null,
    lastEvent: meaningful
      ? {
          action: actionFor(meaningful),
          participant: asNumber(
            readField(meaningful, "participant", "Participant"),
          ),
          timestamp:
            asNumber(readField(meaningful, "ts", "Ts")) ?? Date.now(),
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
    const [scoreResult, currentOddsResult] = await Promise.allSettled([
      fetchTxline(
        apiBase,
        `/scores/snapshot/${fixtureId}`,
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

    const scoreRecords =
      scoreResult.status === "fulfilled"
        ? asRecords(scoreResult.value)
        : [];
    const normalizedScores = normalizeScores(scoreRecords);
    const startTime =
      scoreRecords
        .map((record) => asNumber(readField(record, "StartTime")))
        .find((value) => value !== null) ?? null;
    let markets =
      currentOddsResult.status === "fulfilled"
        ? normalizeMarkets(currentOddsResult.value)
        : [];
    let oddsAsOf: string | null = null;

    if (markets.length === 0 && startTime !== null && startTime < Date.now()) {
      const historicalTimestamp = Math.min(
        Date.now() - 5 * 60_000,
        startTime + 90 * 60_000,
      );
      const historicalOddsResult = await Promise.allSettled([
        fetchTxline(
          apiBase,
          `/odds/snapshot/${fixtureId}?asOf=${historicalTimestamp}`,
          jwt,
          apiToken,
          controller.signal,
        ),
      ]);
      const historicalOdds = historicalOddsResult[0];

      if (historicalOdds.status === "fulfilled") {
        markets = normalizeMarkets(historicalOdds.value);
        if (markets.length > 0) {
          oddsAsOf = new Date(historicalTimestamp).toISOString();
        }
      }
    }

    if (scoreRecords.length === 0 && markets.length === 0) {
      throw new Error("TXLINE_FIXTURE_UNAVAILABLE");
    }

    return {
      source: "txline",
      mode:
        normalizedScores.gameState === "final" ||
        (startTime !== null && startTime < Date.now() - 6 * 60 * 60_000)
          ? "historical"
          : "live",
      fixtureId,
      fetchedAt: new Date().toISOString(),
      oddsAsOf,
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
