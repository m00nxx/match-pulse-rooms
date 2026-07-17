import { describe, expect, it } from "vitest";

import {
  calculateHomePulse,
  contributionSentence,
  getPulseContributions,
} from "@/lib/pulse";

describe("calculateHomePulse", () => {
  it("starts at a neutral 50 for balanced signals", () => {
    expect(
      calculateHomePulse({
        territory: 50,
        homeThreat: 0,
        awayThreat: 0,
        marketHomeShift: 0,
        eventSwing: 0,
      }),
    ).toBe(50);
  });

  it("moves toward the team supported by aligned signals", () => {
    const homePulse = calculateHomePulse({
      territory: 70,
      homeThreat: 78,
      awayThreat: 36,
      marketHomeShift: 7,
      eventSwing: 10,
    });
    const awayPulse = calculateHomePulse({
      territory: 34,
      homeThreat: 28,
      awayThreat: 74,
      marketHomeShift: -8,
      eventSwing: -11,
    });

    expect(homePulse).toBeGreaterThan(70);
    expect(awayPulse).toBeLessThan(30);
  });

  it("applies the safety caps", () => {
    expect(
      calculateHomePulse({
        territory: 100,
        homeThreat: 100,
        awayThreat: 0,
        marketHomeShift: 100,
        eventSwing: 100,
      }),
    ).toBe(92);

    expect(
      calculateHomePulse({
        territory: 0,
        homeThreat: 0,
        awayThreat: 100,
        marketHomeShift: -100,
        eventSwing: -100,
      }),
    ).toBe(8);
  });
});

describe("Pulse explanations", () => {
  it("exposes all four signal contributions", () => {
    const contributions = getPulseContributions({
      territory: 60,
      homeThreat: 50,
      awayThreat: 40,
      marketHomeShift: 2,
      eventSwing: -4,
    });

    expect(contributions.map((item) => item.key)).toEqual([
      "territory",
      "threat",
      "market",
      "event",
    ]);
    expect(contributions.reduce((sum, item) => sum + item.value, 0)).toBeCloseTo(
      2.6,
    );
  });

  it("describes direction without claiming probability", () => {
    expect(
      contributionSentence(
        { key: "event", label: "Recent event", value: -4 },
        "Brazil",
        "France",
      ),
    ).toBe("Recent event adds 4.0 points toward France.");
  });
});
