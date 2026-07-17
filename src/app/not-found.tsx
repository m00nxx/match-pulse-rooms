import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <div className="max-w-md text-center">
        <div className="flex justify-center">
          <BrandMark />
        </div>
        <p className="mt-10 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#c8ff3d]">
          404 · Room not found
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-[-0.055em]">
          This match has moved on.
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#92a59d]">
          Return to the showcase room and replay the full story.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-11 items-center rounded-full bg-[#c8ff3d] px-5 text-sm font-bold text-[#07110f]"
        >
          Back to Match Pulse
        </Link>
      </div>
    </main>
  );
}
