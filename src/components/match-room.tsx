"use client";

import {
  Activity,
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  Database,
  Eye,
  Gauge,
  Pause,
  Play,
  Radio,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Timer,
  Users,
  Wifi,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { BrandMark } from "@/components/brand-mark";
import { PulseChart } from "@/components/pulse-chart";
import {
  calculateHomePulse,
  contributionSentence,
  getPulseContributions,
} from "@/lib/pulse";
import type {
  DemoMatch,
  LiveOddsMarket,
  LiveRoomPayload,
  MatchSplit,
} from "@/types/match";

type Mode = "replay" | "live";
type Vote = "home" | "draw" | "away";

const VOTE_STORAGE_KEY = "match-pulse-showcase-vote";

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function outcomeLabel(
  outcome: Vote,
  match: DemoMatch,
): string {
  if (outcome === "draw") return "Draw";
  return outcome === "home" ? match.home.name : match.away.name;
}

function SplitBars({
  split,
  match,
  color = "acid",
}: {
  split: MatchSplit;
  match: DemoMatch;
  color?: "acid" | "blue";
}) {
  const values: Array<{ key: Vote; value: number }> = [
    { key: "home", value: split.home },
    { key: "draw", value: split.draw },
    { key: "away", value: split.away },
  ];
  const barColor = color === "acid" ? "bg-[#c8ff3d]" : "bg-[#65a7ff]";

  return (
    <div className="space-y-3">
      {values.map(({ key, value }) => (
        <div key={key}>
          <div className="mb-1.5 flex justify-between text-xs">
            <span className="text-[#b8c8c0]">{outcomeLabel(key, match)}</span>
            <span className="font-mono font-semibold text-[#eff7f0]">
              {formatPercent(value)}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
            <div
              className={`h-full rounded-full ${barColor} transition-[width] duration-500`}
              style={{ width: `${value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function PulseGauge({
  value,
  homeCode,
  awayCode,
}: {
  value: number;
  homeCode: string;
  awayCode: string;
}) {
  return (
    <div
      className="relative mx-auto grid size-[11.5rem] place-items-center rounded-full p-3 pulse-glow sm:size-[13rem]"
      style={{
        background: `conic-gradient(#c8ff3d 0 ${value}%, rgba(239,247,240,.08) ${value}% 100%)`,
      }}
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-label={`${homeCode} momentum Pulse ${value} out of 100`}
    >
      <div className="grid size-full place-items-center rounded-full border border-white/[0.08] bg-[#091512] shadow-[inset_0_0_45px_rgba(200,255,61,0.06)]">
        <div className="text-center">
          <span className="block text-[0.62rem] font-bold uppercase tracking-[0.22em] text-[#92a59d]">
            {homeCode} Pulse
          </span>
          <span className="mt-1 block text-5xl font-black tracking-[-0.08em] text-[#eff7f0] sm:text-6xl">
            {value}
          </span>
          <span className="mt-1 block font-mono text-[0.64rem] text-[#92a59d]">
            {100 - value} {awayCode}
          </span>
        </div>
      </div>
    </div>
  );
}

function LivePanel({
  onBack,
}: {
  onBack: () => void;
}) {
  const [fixtureId, setFixtureId] = useState("");
  const [homeName, setHomeName] = useState("Participant 1");
  const [awayName, setAwayName] = useState("Participant 2");
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [payload, setPayload] = useState<LiveRoomPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    void fetch("/api/txline/room", { cache: "no-store" })
      .then(async (response) => {
        const data: unknown = await response.json();
        if (!active || typeof data !== "object" || data === null) return;

        const status = data as {
          configured?: boolean;
          featured?: {
            fixtureId?: number | null;
            home?: string | null;
            away?: string | null;
          };
        };
        setConfigured(Boolean(status.configured));
        if (status.featured?.fixtureId) {
          setFixtureId(String(status.featured.fixtureId));
        }
        if (status.featured?.home) setHomeName(status.featured.home);
        if (status.featured?.away) setAwayName(status.featured.away);
      })
      .catch(() => {
        if (active) setConfigured(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!payload?.fixtureId) return;

    const activeFixtureId = payload.fixtureId;
    const interval = window.setInterval(() => {
      void fetch(`/api/txline/room?fixtureId=${activeFixtureId}`, {
        cache: "no-store",
      })
        .then(async (response) => {
          if (!response.ok) return null;
          return (await response.json()) as LiveRoomPayload;
        })
        .then((nextPayload) => {
          if (nextPayload) setPayload(nextPayload);
        })
        .catch(() => {
          // Keep the last good live snapshot on a transient refresh failure.
        });
    }, 15_000);

    return () => window.clearInterval(interval);
  }, [payload?.fixtureId]);

  async function loadFixture() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/txline/room?fixtureId=${encodeURIComponent(fixtureId)}`,
        { cache: "no-store" },
      );
      const data: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof data.error === "string"
            ? data.error
            : "The fixture could not be loaded.";
        throw new Error(message);
      }

      setPayload(data as LiveRoomPayload);
    } catch (reason) {
      setPayload(null);
      setError(
        reason instanceof Error
          ? reason.message
          : "The fixture could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }

  const primaryMarket: LiveOddsMarket | null =
    payload?.markets.find((market) => market.outcomes.length >= 2) ??
    payload?.markets[0] ??
    null;

  return (
    <main className="mx-auto w-full max-w-[1180px] px-4 pb-16 pt-5 sm:px-6 sm:pt-9">
      <section className="glass-panel overflow-hidden rounded-[1.75rem]">
        <div className="border-b border-white/[0.08] px-5 py-5 sm:px-8">
          <button
            type="button"
            onClick={onBack}
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#b8c8c0] transition hover:text-[#eff7f0]"
          >
            <RotateCcw size={15} aria-hidden="true" />
            Back to showcase replay
          </button>

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="live-dot size-2 rounded-full bg-[#c8ff3d]" />
                <span className="text-[0.67rem] font-bold uppercase tracking-[0.2em] text-[#c8ff3d]">
                  TxLINE live connector
                </span>
              </div>
              <h1 className="max-w-2xl text-3xl font-bold tracking-[-0.055em] text-[#eff7f0] sm:text-5xl">
                Bring your own live fixture.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#92a59d] sm:text-base">
                Scores and odds are fetched on the server, reduced to the fields
                this room needs, and never expose the TxLINE API token.
              </p>
            </div>
            <span
              className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${
                configured
                  ? "border-[#c8ff3d]/25 bg-[#c8ff3d]/10 text-[#dfff86]"
                  : "border-white/10 bg-white/[0.04] text-[#92a59d]"
              }`}
            >
              {configured ? <ShieldCheck size={14} /> : <Database size={14} />}
              {configured === null
                ? "Checking connector…"
                : configured
                  ? "Server credentials ready"
                  : "Replay-only deployment"}
            </span>
          </div>
        </div>

        <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[0.86fr_1.14fr]">
          <div>
            <div className="rounded-2xl border border-white/[0.08] bg-black/10 p-4 sm:p-5">
              <label
                htmlFor="fixture-id"
                className="text-xs font-bold uppercase tracking-[0.17em] text-[#92a59d]"
              >
                TxLINE fixture ID
              </label>
              <div className="mt-3 flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#92a59d]"
                    aria-hidden="true"
                  />
                  <input
                    id="fixture-id"
                    inputMode="numeric"
                    value={fixtureId}
                    onChange={(event) =>
                      setFixtureId(event.currentTarget.value.replace(/\D/g, ""))
                    }
                    placeholder="e.g. 123456"
                    className="h-12 w-full rounded-xl border border-white/[0.1] bg-[#07110f] pl-10 pr-3 font-mono text-sm text-[#eff7f0] placeholder:text-[#596b63]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void loadFixture()}
                  disabled={loading || !fixtureId}
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#c8ff3d] px-4 text-sm font-bold text-[#07110f] transition hover:bg-[#dcff80] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <RefreshCw
                    size={15}
                    className={loading ? "animate-spin" : ""}
                    aria-hidden="true"
                  />
                  {loading ? "Loading" : "Load"}
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <label className="text-xs text-[#92a59d]">
                  Participant 1
                  <input
                    value={homeName}
                    onChange={(event) => setHomeName(event.currentTarget.value)}
                    className="mt-2 h-10 w-full rounded-lg border border-white/[0.08] bg-[#07110f] px-3 text-sm text-[#eff7f0]"
                  />
                </label>
                <label className="text-xs text-[#92a59d]">
                  Participant 2
                  <input
                    value={awayName}
                    onChange={(event) => setAwayName(event.currentTarget.value)}
                    className="mt-2 h-10 w-full rounded-lg border border-white/[0.08] bg-[#07110f] px-3 text-sm text-[#eff7f0]"
                  />
                </label>
              </div>

              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-xl border border-[#ff7f66]/20 bg-[#ff7f66]/10 p-3 text-sm leading-5 text-[#ffb5a7]"
                >
                  {error}
                </p>
              )}

              <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[#71857c]">
                <CircleHelp size={14} className="mt-0.5 shrink-0" />
                Use a football fixture available to your TxLINE devnet
                subscription. No raw feed is stored by this app.
              </p>
            </div>
          </div>

          <div
            className="relative min-h-[22rem] overflow-hidden rounded-3xl border border-white/[0.08] bg-[#091512] p-5 score-grid sm:p-7"
            aria-live="polite"
          >
            {!payload ? (
              <div className="flex h-full min-h-[19rem] flex-col items-center justify-center text-center">
                <span className="grid size-16 place-items-center rounded-full border border-[#c8ff3d]/20 bg-[#c8ff3d]/10 text-[#c8ff3d]">
                  <Radio size={27} aria-hidden="true" />
                </span>
                <h2 className="mt-5 text-xl font-bold tracking-[-0.03em]">
                  Waiting for a fixture
                </h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-[#92a59d]">
                  Load an ID to see the latest score event and available
                  in-running markets.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#c8ff3d]/10 px-3 py-1.5 text-[0.66rem] font-bold uppercase tracking-[0.15em] text-[#c8ff3d]">
                    <Wifi size={12} />
                    TxLINE ·{" "}
                    {payload.mode === "historical"
                      ? "verified replay"
                      : "auto-refresh 15s"}
                  </span>
                  <span className="font-mono text-xs text-[#71857c]">
                    #{payload.fixtureId}
                  </span>
                </div>

                <div className="mt-10 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                  <div className="text-center">
                    <div className="mx-auto grid size-12 place-items-center rounded-full border border-[#f5d547]/30 bg-[#f5d547]/10 font-mono text-xs font-bold text-[#f5d547]">
                      P1
                    </div>
                    <p className="mt-3 truncate text-sm font-bold">{homeName}</p>
                  </div>
                  <div className="text-center">
                    <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-[#92a59d]">
                      {payload.gameState || "Latest"}
                      {payload.minute !== null ? ` · ${payload.minute}'` : ""}
                    </p>
                    <p className="mt-2 text-5xl font-black tracking-[-0.08em]">
                      {payload.score
                        ? `${payload.score.participant1}–${payload.score.participant2}`
                        : "—"}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="mx-auto grid size-12 place-items-center rounded-full border border-[#65a7ff]/30 bg-[#65a7ff]/10 font-mono text-xs font-bold text-[#65a7ff]">
                      P2
                    </div>
                    <p className="mt-3 truncate text-sm font-bold">{awayName}</p>
                  </div>
                </div>

                <div className="mt-9 rounded-2xl border border-white/[0.08] bg-black/15 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#92a59d]">
                      {primaryMarket?.label || "Live availability"}
                    </span>
                    <span className="text-[0.65rem] text-[#71857c]">
                      {payload.oddsAsOf ? "Historical snapshot · " : ""}
                      {primaryMarket?.bookmaker || "TxLINE"}
                    </span>
                  </div>
                  {primaryMarket ? (
                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                      {primaryMarket.outcomes.slice(0, 3).map((outcome) => (
                        <div
                          key={outcome.name}
                          className="rounded-xl border border-white/[0.07] bg-white/[0.035] p-3"
                        >
                          <p className="truncate text-xs text-[#92a59d]">
                            {outcome.name}
                          </p>
                          <p className="mt-1 font-mono text-lg font-bold text-[#eff7f0]">
                            {outcome.probability === null
                              ? "—"
                              : `${outcome.probability}%`}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-[#92a59d]">
                      Score data is available; this fixture returned no odds
                      market.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export function MatchRoom({ match }: { match: DemoMatch }) {
  const [mode, setMode] = useState<Mode>("replay");
  const [activeIndex, setActiveIndex] = useState(6);
  const [isPlaying, setIsPlaying] = useState(false);
  const [explanationOpen, setExplanationOpen] = useState(true);
  const [vote, setVote] = useState<Vote | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frame = match.frames[activeIndex];
  const pulse = calculateHomePulse(frame.signals);
  const contributions = useMemo(
    () =>
      getPulseContributions(frame.signals).sort(
        (a, b) => Math.abs(b.value) - Math.abs(a.value),
      ),
    [frame.signals],
  );

  useEffect(() => {
    let timeout: number | null = null;

    try {
      const saved = window.localStorage.getItem(VOTE_STORAGE_KEY);
      if (saved === "home" || saved === "draw" || saved === "away") {
        timeout = window.setTimeout(() => setVote(saved), 0);
      }
    } catch {
      // Local persistence is an enhancement; the prediction still works.
    }

    return () => {
      if (timeout !== null) window.clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    timerRef.current = setInterval(() => {
      setActiveIndex((current) => {
        if (current >= match.frames.length - 1) {
          setIsPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, 1650);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, match.frames.length]);

  function selectVote(nextVote: Vote) {
    setVote(nextVote);
    try {
      window.localStorage.setItem(VOTE_STORAGE_KEY, nextVote);
    } catch {
      // Keep the in-memory vote when storage is unavailable.
    }
  }

  function replayFromStart() {
    setActiveIndex(0);
    setIsPlaying(true);
  }

  if (mode === "live") {
    return (
      <div className="room-shell min-h-screen">
        <SiteHeader mode={mode} setMode={setMode} />
        <LivePanel onBack={() => setMode("replay")} />
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="room-shell min-h-screen">
      <SiteHeader mode={mode} setMode={setMode} />

      <main className="mx-auto w-full max-w-[1180px] px-4 pb-16 pt-5 sm:px-6 sm:pt-9">
        <section className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#c8ff3d]/20 bg-[#c8ff3d]/10 px-3 py-1.5 text-[0.66rem] font-bold uppercase tracking-[0.17em] text-[#dfff86]">
                <Sparkles size={12} aria-hidden="true" />
                Interactive showcase
              </span>
              <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-[0.66rem] font-semibold text-[#92a59d]">
                Simulated · no wagering
              </span>
            </div>
            <h1 className="mt-5 max-w-3xl text-[2.55rem] font-bold leading-[0.94] tracking-[-0.07em] text-[#eff7f0] sm:text-6xl lg:text-[4.7rem]">
              Feel the match.
              <span className="block text-[#92a59d]">See the reason.</span>
            </h1>
          </div>
          <p className="max-w-sm text-sm leading-6 text-[#92a59d] sm:text-right">
            Live scores and markets become a story fans can read, challenge,
            and replay together.
          </p>
        </section>

        <div className="grid gap-5 lg:grid-cols-12">
          <section className="glass-panel overflow-hidden rounded-[1.75rem] lg:col-span-8">
            <div className="relative overflow-hidden border-b border-white/[0.08] p-5 score-grid sm:p-7">
              <div className="absolute inset-x-0 top-0 h-px shimmer-line opacity-70" />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[0.66rem] font-bold uppercase tracking-[0.18em] text-[#92a59d]">
                    {match.competition}
                  </p>
                  <p className="mt-1 text-xs text-[#71857c]">
                    {match.venue} · {match.label}
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-[#07110f]/75 px-3 py-1.5 font-mono text-xs text-[#d1ded7]">
                  <Clock3 size={13} className="text-[#c8ff3d]" />
                  {frame.minute === 90 ? "FT" : `${frame.minute}'`} ·{" "}
                  {frame.clock}
                </span>
              </div>

              <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-7">
                <div className="text-center">
                  <div
                    className="mx-auto grid size-14 place-items-center rounded-full border text-xs font-black sm:size-16"
                    style={{
                      borderColor: `${match.home.accent}55`,
                      backgroundColor: `${match.home.accent}12`,
                      color: match.home.accent,
                    }}
                  >
                    {match.home.code}
                  </div>
                  <p className="mt-3 text-sm font-bold sm:text-base">
                    {match.home.name}
                  </p>
                </div>

                <div className="min-w-[7.6rem] text-center">
                  <p className="text-5xl font-black tracking-[-0.09em] text-[#eff7f0] sm:text-7xl">
                    {frame.score.home}
                    <span className="mx-2 text-[#53665d]">–</span>
                    {frame.score.away}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.13em] text-[#92a59d]">
                    <span className="live-dot size-1.5 rounded-full bg-[#c8ff3d]" />
                    Replay live
                  </span>
                </div>

                <div className="text-center">
                  <div
                    className="mx-auto grid size-14 place-items-center rounded-full border text-xs font-black sm:size-16"
                    style={{
                      borderColor: `${match.away.accent}55`,
                      backgroundColor: `${match.away.accent}12`,
                      color: match.away.accent,
                    }}
                  >
                    {match.away.code}
                  </div>
                  <p className="mt-3 text-sm font-bold sm:text-base">
                    {match.away.name}
                  </p>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-white/[0.08] bg-[#07110f]/80 p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (activeIndex >= match.frames.length - 1) {
                        replayFromStart();
                      } else {
                        setIsPlaying((current) => !current);
                      }
                    }}
                    className="grid size-11 shrink-0 place-items-center rounded-full bg-[#c8ff3d] text-[#07110f] transition hover:scale-105 hover:bg-[#dcff80]"
                    aria-label={
                      activeIndex >= match.frames.length - 1
                        ? "Replay from start"
                        : isPlaying
                          ? "Pause replay"
                          : "Play replay"
                    }
                  >
                    {activeIndex >= match.frames.length - 1 ? (
                      <RotateCcw size={18} />
                    ) : isPlaying ? (
                      <Pause size={18} fill="currentColor" />
                    ) : (
                      <Play size={18} fill="currentColor" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center justify-between gap-2 text-[0.65rem] font-semibold text-[#71857c]">
                      <span>Kick-off</span>
                      <span className="font-mono text-[#b8c8c0]">
                        {activeIndex + 1}/{match.frames.length}
                      </span>
                      <span>Full time</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={match.frames.length - 1}
                      value={activeIndex}
                      onChange={(event) => {
                        setIsPlaying(false);
                        setActiveIndex(Number(event.currentTarget.value));
                      }}
                      className="block h-2 w-full cursor-pointer"
                      aria-label="Replay position"
                      aria-valuetext={`${frame.minute} minutes, ${frame.score.home} to ${frame.score.away}`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-8 p-5 sm:p-7 md:grid-cols-[0.72fr_1.28fr] md:items-center">
              <div>
                <PulseGauge
                  value={pulse}
                  homeCode={match.home.code}
                  awayCode={match.away.code}
                />
                <p className="mt-4 text-center text-[0.68rem] font-semibold uppercase tracking-[0.15em] text-[#71857c]">
                  Momentum index · not win probability
                </p>
              </div>
              <div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-[#c8ff3d]/10 text-[#c8ff3d]">
                    <Zap size={17} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[0.66rem] font-bold uppercase tracking-[0.18em] text-[#c8ff3d]">
                      What the room feels
                    </p>
                    <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em]">
                      {frame.headline}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[#92a59d]">
                      {frame.explanation}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setExplanationOpen((current) => !current)}
                  className="mt-5 flex w-full items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-left text-sm font-semibold text-[#d1ded7] transition hover:border-white/[0.16] hover:bg-white/[0.045]"
                  aria-expanded={explanationOpen}
                >
                  <span className="flex items-center gap-2">
                    <CircleHelp size={15} className="text-[#c8ff3d]" />
                    Why this Pulse?
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${explanationOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {explanationOpen && (
                  <div className="mt-3 space-y-2">
                    {contributions.map((contribution) => (
                      <div
                        key={contribution.key}
                        className="flex items-center justify-between gap-3 rounded-xl bg-black/10 px-3 py-2.5"
                      >
                        <p className="text-xs leading-5 text-[#92a59d]">
                          {contributionSentence(
                            contribution,
                            match.home.name,
                            match.away.name,
                          )}
                        </p>
                        <span
                          className={`shrink-0 font-mono text-xs font-bold ${
                            contribution.value >= 0
                              ? "text-[#c8ff3d]"
                              : "text-[#65a7ff]"
                          }`}
                        >
                          {contribution.value >= 0 ? "+" : ""}
                          {contribution.value.toFixed(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="grid gap-5 lg:col-span-4">
            <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-xl bg-[#c8ff3d]/10 text-[#c8ff3d]">
                  <Users size={19} aria-hidden="true" />
                </span>
                <span className="rounded-full border border-white/[0.08] px-2.5 py-1 font-mono text-[0.62rem] text-[#92a59d]">
                  18.4K calls
                </span>
              </div>
              <p className="mt-5 text-[0.66rem] font-bold uppercase tracking-[0.18em] text-[#92a59d]">
                Fan call
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em]">
                How does it finish?
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#92a59d]">
                Pick on instinct. No stakes, prizes, or wallet.
              </p>

              <div className="mt-5 grid gap-2" role="radiogroup" aria-label="Full-time prediction">
                {(["home", "draw", "away"] as Vote[]).map((option) => {
                  const selected = vote === option;
                  return (
                    <button
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      key={option}
                      onClick={() => selectVote(option)}
                      className={`group flex min-h-12 items-center justify-between rounded-xl border px-4 text-left text-sm font-semibold transition ${
                        selected
                          ? "border-[#c8ff3d]/50 bg-[#c8ff3d]/12 text-[#eff7f0]"
                          : "border-white/[0.08] bg-white/[0.025] text-[#b8c8c0] hover:border-white/[0.17] hover:bg-white/[0.05]"
                      }`}
                    >
                      <span>{outcomeLabel(option, match)}</span>
                      {selected ? (
                        <span className="grid size-6 place-items-center rounded-full bg-[#c8ff3d] text-[#07110f]">
                          <Check size={14} strokeWidth={3} />
                        </span>
                      ) : (
                        <ChevronRight
                          size={15}
                          className="text-[#53665d] transition-transform group-hover:translate-x-0.5"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {vote && (
                <div className="mt-4 rounded-xl border border-[#c8ff3d]/15 bg-[#c8ff3d]/[0.07] p-3">
                  <p className="flex items-center gap-2 text-xs font-semibold text-[#dfff86]">
                    <Check size={14} />
                    Call saved on this device
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#8da06f]">
                    You picked {outcomeLabel(vote, match)}. Scrub the replay to
                    test your read.
                  </p>
                </div>
              )}
            </section>

            <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gauge size={17} className="text-[#65a7ff]" />
                  <h2 className="text-sm font-bold">Tension</h2>
                </div>
                <span className="font-mono text-2xl font-black tracking-[-0.06em]">
                  {frame.tension}
                </span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.07]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#65a7ff] via-[#c8ff3d] to-[#ff7f66] transition-[width] duration-500"
                  style={{ width: `${frame.tension}%` }}
                />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[0.62rem] font-semibold uppercase tracking-[0.11em] text-[#71857c]">
                <span>Calm</span>
                <span>Alive</span>
                <span>Edge</span>
              </div>
            </section>
          </aside>

          <section className="glass-panel rounded-[1.75rem] p-5 sm:p-7 lg:col-span-8">
            <PulseChart frames={match.frames} activeIndex={activeIndex} />
          </section>

          <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6 lg:col-span-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.66rem] font-bold uppercase tracking-[0.18em] text-[#92a59d]">
                  Crowd vs market
                </p>
                <h2 className="mt-2 text-xl font-bold tracking-[-0.04em]">
                  Same match, different read.
                </h2>
              </div>
              <BarChart3 size={19} className="mt-1 text-[#c8ff3d]" />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-5">
              <div>
                <p className="mb-4 flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.13em] text-[#c8ff3d]">
                  <Users size={13} />
                  Fans
                </p>
                <SplitBars split={frame.fan} match={match} />
              </div>
              <div>
                <p className="mb-4 flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.13em] text-[#65a7ff]">
                  <Activity size={13} />
                  Market
                </p>
                <SplitBars split={frame.market} match={match} color="blue" />
              </div>
            </div>

            <p className="mt-5 rounded-xl bg-white/[0.025] p-3 text-xs leading-5 text-[#71857c]">
              Fan calls are a free social signal. Market percentages are shown
              as context, never as advice.
            </p>
          </section>

          <section className="glass-panel overflow-hidden rounded-[1.75rem] lg:col-span-12">
            <div className="flex flex-col justify-between gap-3 border-b border-white/[0.08] px-5 py-5 sm:flex-row sm:items-center sm:px-7">
              <div>
                <p className="text-[0.66rem] font-bold uppercase tracking-[0.18em] text-[#92a59d]">
                  Room timeline
                </p>
                <h2 className="mt-1 text-xl font-bold tracking-[-0.035em]">
                  Every swing has a moment.
                </h2>
              </div>
              <button
                type="button"
                onClick={replayFromStart}
                className="inline-flex w-fit items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.035] px-4 py-2 text-xs font-bold text-[#d1ded7] transition hover:border-[#c8ff3d]/30 hover:text-[#eff7f0]"
              >
                <Play size={13} fill="currentColor" />
                Watch the full story
              </button>
            </div>

            <div className="no-scrollbar overflow-x-auto">
              <ol className="flex min-w-max gap-0 p-5 sm:p-7">
                {match.moments.map((moment, index) => {
                  const reached = moment.minute <= frame.minute;
                  const momentFrameIndex = match.frames.findIndex(
                    (item) => item.minute >= moment.minute,
                  );
                  return (
                    <li
                      key={moment.id}
                      className="relative w-[10.5rem] shrink-0 pr-4 sm:w-[12rem]"
                    >
                      {index < match.moments.length - 1 && (
                        <span
                          className={`absolute left-3 top-3 h-px w-full ${
                            reached ? "bg-[#c8ff3d]/40" : "bg-white/[0.08]"
                          }`}
                          aria-hidden="true"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setIsPlaying(false);
                          setActiveIndex(
                            momentFrameIndex === -1
                              ? match.frames.length - 1
                              : momentFrameIndex,
                          );
                        }}
                        className="group relative z-10 block w-full text-left"
                        aria-label={`Jump to ${moment.minute} minutes: ${moment.title}`}
                      >
                        <span
                          className={`grid size-6 place-items-center rounded-full border transition ${
                            reached
                              ? "border-[#c8ff3d] bg-[#c8ff3d] text-[#07110f]"
                              : "border-white/[0.14] bg-[#10201c] text-[#71857c]"
                          }`}
                        >
                          {moment.type === "goal" ? (
                            <Zap size={11} />
                          ) : reached ? (
                            <Check size={11} strokeWidth={3} />
                          ) : (
                            <span className="size-1 rounded-full bg-current" />
                          )}
                        </span>
                        <span className="mt-3 block font-mono text-[0.65rem] text-[#71857c]">
                          {moment.minute}&apos;
                        </span>
                        <span
                          className={`mt-1 block text-sm font-bold transition ${
                            reached
                              ? "text-[#eff7f0]"
                              : "text-[#71857c] group-hover:text-[#b8c8c0]"
                          }`}
                        >
                          {moment.title}
                        </span>
                        <span className="mt-1 block max-w-[9.5rem] text-xs leading-5 text-[#71857c]">
                          {moment.detail}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-[1.75rem] border border-[#c8ff3d]/20 bg-[#c8ff3d] p-6 text-[#07110f] sm:p-8 lg:col-span-12">
            <div className="absolute -right-12 -top-16 size-64 rounded-full border-[32px] border-[#07110f]/5" />
            <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-center">
              <div>
                <p className="flex items-center gap-2 text-[0.68rem] font-black uppercase tracking-[0.17em]">
                  <Database size={14} />
                  Powered by TxLINE
                </p>
                <h2 className="mt-3 max-w-2xl text-3xl font-black leading-[1.02] tracking-[-0.055em] sm:text-4xl">
                  The room works in replay.
                  <span className="block text-[#31410b]/60">
                    The connector works live.
                  </span>
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[#26320b]/75">
                  Switch to a TxLINE fixture ID for server-normalized score
                  events and markets. Credentials never enter the browser.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMode("live")}
                className="inline-flex min-h-12 w-fit items-center gap-2 rounded-full bg-[#07110f] px-5 text-sm font-bold text-[#eff7f0] transition hover:scale-[1.02] hover:bg-[#11211d]"
              >
                Open TxLINE Live
                <ArrowRight size={16} />
              </button>
            </div>
          </section>

          <section className="glass-panel rounded-[1.75rem] p-5 sm:p-8 lg:col-span-12">
            <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
              <div>
                <p className="text-[0.66rem] font-bold uppercase tracking-[0.18em] text-[#c8ff3d]">
                  Commercial path
                </p>
                <h2 className="mt-3 text-3xl font-bold leading-[1.02] tracking-[-0.055em] sm:text-4xl">
                  One signal engine.
                  <span className="block text-[#92a59d]">
                    Many rooms to own.
                  </span>
                </h2>
                <p className="mt-3 max-w-lg text-sm leading-6 text-[#92a59d]">
                  Match Pulse can ship as a white-label fan layer for clubs,
                  publishers, stadium screens, and creator communities.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  {
                    icon: Database,
                    title: "Media SDK",
                    copy: "Per-event API and embeddable room licensing.",
                  },
                  {
                    icon: Eye,
                    title: "Sponsor moments",
                    copy: "Brand-safe activations around peaks, never wagers.",
                  },
                  {
                    icon: Users,
                    title: "Club rooms",
                    copy: "Season subscriptions with identity and community.",
                  },
                ].map(({ icon: Icon, title, copy }) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4"
                  >
                    <Icon size={17} className="text-[#c8ff3d]" />
                    <h3 className="mt-4 text-sm font-bold">{title}</h3>
                    <p className="mt-2 text-xs leading-5 text-[#71857c]">
                      {copy}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function SiteHeader({
  mode,
  setMode,
}: {
  mode: Mode;
  setMode: (mode: Mode) => void;
}) {
  return (
    <header className="border-b border-white/[0.07] bg-[#07110f]/75 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-[1180px] items-center justify-between gap-4 px-4 sm:px-6">
        <BrandMark />
        <nav
          className="flex items-center rounded-full border border-white/[0.09] bg-white/[0.035] p-1"
          aria-label="Data mode"
        >
          <button
            type="button"
            onClick={() => setMode("replay")}
            className={`inline-flex h-8 items-center gap-2 rounded-full px-3 text-xs font-bold transition sm:px-4 ${
              mode === "replay"
                ? "bg-[#eff7f0] text-[#07110f]"
                : "text-[#92a59d] hover:text-[#eff7f0]"
            }`}
            aria-pressed={mode === "replay"}
          >
            <Timer size={13} />
            Replay
          </button>
          <button
            type="button"
            onClick={() => setMode("live")}
            className={`inline-flex h-8 items-center gap-2 rounded-full px-3 text-xs font-bold transition sm:px-4 ${
              mode === "live"
                ? "bg-[#c8ff3d] text-[#07110f]"
                : "text-[#92a59d] hover:text-[#eff7f0]"
            }`}
            aria-pressed={mode === "live"}
          >
            <Radio size={13} />
            Live
          </button>
        </nav>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.07]">
      <div className="mx-auto flex max-w-[1180px] flex-col justify-between gap-5 px-4 py-8 text-xs text-[#71857c] sm:flex-row sm:items-center sm:px-6">
        <div className="flex items-center gap-3">
          <BrandMark compact />
          <p>
            Built for the Solana World Cup Hackathon · Consumer & Fan
            Experiences
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="inline-flex items-center gap-1.5">
            <Eye size={13} />
            Explainable by design
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={13} />
            No wagering
          </span>
        </div>
      </div>
    </footer>
  );
}
