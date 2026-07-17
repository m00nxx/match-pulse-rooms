export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className="flex items-center gap-3"
      role={compact ? "img" : undefined}
      aria-label={compact ? "Match Pulse Rooms" : undefined}
    >
      <span
        className="relative grid size-9 place-items-center overflow-hidden rounded-full border border-[#c8ff3d]/50 bg-[#c8ff3d]/10"
        aria-hidden="true"
      >
        <span className="absolute h-[2px] w-6 -rotate-12 bg-[#c8ff3d]" />
        <span className="absolute h-[2px] w-4 translate-y-1 rotate-12 bg-[#c8ff3d]/80" />
        <span className="size-1.5 rounded-full bg-[#eff7f0] shadow-[0_0_12px_#c8ff3d]" />
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#92a59d]">
            Match
          </span>
          <span className="mt-1 block text-base font-bold tracking-[-0.03em] text-[#eff7f0]">
            Pulse Rooms
          </span>
        </span>
      )}
    </div>
  );
}
