import type { PulseSignals } from "@/types/match";

export type PulseContribution = {
  key: "territory" | "threat" | "market" | "event";
  label: string;
  value: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function getPulseContributions(
  signals: PulseSignals,
): PulseContribution[] {
  return [
    {
      key: "territory",
      label: "Territory",
      value: (signals.territory - 50) * 0.28,
    },
    {
      key: "threat",
      label: "Attacking threat",
      value: (signals.homeThreat - signals.awayThreat) * 0.22,
    },
    {
      key: "market",
      label: "Market movement",
      value: signals.marketHomeShift * 0.8,
    },
    {
      key: "event",
      label: "Recent event",
      value: signals.eventSwing,
    },
  ];
}

export function calculateHomePulse(signals: PulseSignals): number {
  const raw =
    50 +
    getPulseContributions(signals).reduce(
      (total, contribution) => total + contribution.value,
      0,
    );

  return Math.round(clamp(raw, 8, 92));
}

export function contributionSentence(
  contribution: PulseContribution,
  homeName: string,
  awayName: string,
): string {
  const magnitude = Math.abs(contribution.value);
  const direction = contribution.value >= 0 ? homeName : awayName;

  if (magnitude < 0.75) {
    return `${contribution.label} is currently balanced.`;
  }

  return `${contribution.label} adds ${magnitude.toFixed(1)} points toward ${direction}.`;
}
