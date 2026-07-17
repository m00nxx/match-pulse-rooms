export type TeamSide = "home" | "away";

export type MatchSplit = {
  home: number;
  draw: number;
  away: number;
};

export type PulseSignals = {
  territory: number;
  homeThreat: number;
  awayThreat: number;
  marketHomeShift: number;
  eventSwing: number;
};

export type MatchFrame = {
  minute: number;
  clock: string;
  score: {
    home: number;
    away: number;
  };
  signals: PulseSignals;
  tension: number;
  market: MatchSplit;
  fan: MatchSplit;
  headline: string;
  explanation: string;
  leader: TeamSide | "level";
};

export type MatchMoment = {
  id: string;
  minute: number;
  side: TeamSide | "neutral";
  type: "kickoff" | "chance" | "goal" | "card" | "save" | "full-time";
  title: string;
  detail: string;
};

export type DemoMatch = {
  id: string;
  competition: string;
  label: string;
  venue: string;
  home: {
    name: string;
    code: string;
    accent: string;
  };
  away: {
    name: string;
    code: string;
    accent: string;
  };
  frames: MatchFrame[];
  moments: MatchMoment[];
};

export type LiveOddsMarket = {
  label: string;
  period: string;
  bookmaker: string;
  inRunning: boolean;
  outcomes: Array<{
    name: string;
    probability: number | null;
  }>;
};

export type LiveRoomPayload = {
  source: "txline";
  fixtureId: number;
  fetchedAt: string;
  gameState: string | null;
  minute: number | null;
  score: {
    participant1: number;
    participant2: number;
  } | null;
  lastEvent: {
    action: string;
    participant: number | null;
    timestamp: number;
  } | null;
  markets: LiveOddsMarket[];
  availability: {
    scores: boolean;
    odds: boolean;
  };
};
