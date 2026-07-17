import { calculateHomePulse } from "@/lib/pulse";
import type { MatchFrame } from "@/types/match";

type PulseChartProps = {
  frames: MatchFrame[];
  activeIndex: number;
};

const WIDTH = 680;
const HEIGHT = 210;
const PAD_X = 18;
const PAD_Y = 20;

function makePoints(values: number[]) {
  const usableWidth = WIDTH - PAD_X * 2;
  const usableHeight = HEIGHT - PAD_Y * 2;
  const denominator = Math.max(values.length - 1, 1);

  return values.map((value, index) => ({
    x: PAD_X + (index / denominator) * usableWidth,
    y: PAD_Y + ((100 - value) / 100) * usableHeight,
  }));
}

function pointsAttribute(points: Array<{ x: number; y: number }>) {
  return points.map(({ x, y }) => `${x},${y}`).join(" ");
}

export function PulseChart({ frames, activeIndex }: PulseChartProps) {
  const activeFrames = frames.slice(0, activeIndex + 1);
  const pulsePoints = makePoints(activeFrames.map((frame) => calculateHomePulse(frame.signals)));
  const marketPoints = makePoints(activeFrames.map((frame) => frame.market.home));
  const lastPulse = pulsePoints.at(-1);
  const lastMarket = marketPoints.at(-1);
  const areaPoints = lastPulse
    ? `${PAD_X},${HEIGHT - PAD_Y} ${pointsAttribute(pulsePoints)} ${lastPulse.x},${HEIGHT - PAD_Y}`
    : "";

  return (
    <figure aria-labelledby="pulse-chart-title">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p
            id="pulse-chart-title"
            className="text-sm font-semibold text-[#eff7f0]"
          >
            Match signal
          </p>
          <p className="mt-1 text-xs text-[#92a59d]">
            Pulse momentum vs. market home probability
          </p>
        </div>
        <div className="flex items-center gap-4 text-[0.67rem] font-semibold uppercase tracking-[0.13em] text-[#92a59d]">
          <span className="flex items-center gap-2">
            <i className="block h-0.5 w-5 bg-[#c8ff3d]" />
            Pulse
          </span>
          <span className="flex items-center gap-2">
            <i className="block h-px w-5 border-t border-dashed border-[#65a7ff]" />
            Market
          </span>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#081411]">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="block h-auto w-full"
          role="img"
          aria-label={`Brazil Pulse ${lastPulse ? Math.round(100 - ((lastPulse.y - PAD_Y) / (HEIGHT - PAD_Y * 2)) * 100) : 50} out of 100`}
        >
          <defs>
            <linearGradient id="pulse-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c8ff3d" stopOpacity="0.23" />
              <stop offset="100%" stopColor="#c8ff3d" stopOpacity="0" />
            </linearGradient>
            <filter id="pulse-line-glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {[25, 50, 75].map((value) => {
            const y = PAD_Y + ((100 - value) / 100) * (HEIGHT - PAD_Y * 2);
            return (
              <g key={value}>
                <line
                  x1={PAD_X}
                  x2={WIDTH - PAD_X}
                  y1={y}
                  y2={y}
                  stroke="rgba(239,247,240,0.08)"
                  strokeDasharray="4 7"
                />
                <text
                  x={PAD_X + 4}
                  y={y - 6}
                  fill="rgba(239,247,240,0.35)"
                  fontSize="10"
                >
                  {value}
                </text>
              </g>
            );
          })}

          {areaPoints && (
            <polygon points={areaPoints} fill="url(#pulse-area)" />
          )}
          <polyline
            points={pointsAttribute(marketPoints)}
            fill="none"
            stroke="#65a7ff"
            strokeOpacity="0.8"
            strokeWidth="2"
            strokeDasharray="5 7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points={pointsAttribute(pulsePoints)}
            fill="none"
            stroke="#c8ff3d"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#pulse-line-glow)"
          />

          {lastMarket && (
            <circle
              cx={lastMarket.x}
              cy={lastMarket.y}
              r="3.5"
              fill="#65a7ff"
            />
          )}
          {lastPulse && (
            <>
              <circle
                cx={lastPulse.x}
                cy={lastPulse.y}
                r="8"
                fill="#c8ff3d"
                fillOpacity="0.18"
              />
              <circle
                cx={lastPulse.x}
                cy={lastPulse.y}
                r="4"
                fill="#c8ff3d"
              />
            </>
          )}
        </svg>
        <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-between px-5 font-mono text-[0.62rem] text-[#92a59d]">
          <span>0&apos;</span>
          <span>HT</span>
          <span>90&apos;</span>
        </div>
      </div>
    </figure>
  );
}
