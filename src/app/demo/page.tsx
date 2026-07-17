import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Code2, ExternalLink, Play } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";

export const metadata: Metadata = {
  title: "Product demo",
  description:
    "Watch the 90-second Match Pulse Rooms demo: explainable momentum, free fan calls, and a protected TxLINE live connector.",
  openGraph: {
    title: "Match Pulse Rooms · Product demo",
    description:
      "A 90-second walkthrough of the explainable football second screen.",
    type: "video.other",
  },
};

export default function DemoPage() {
  return (
    <div className="room-shell min-h-screen">
      <header className="border-b border-white/[0.08] bg-[#07110f]/80 backdrop-blur-xl">
        <div className="mx-auto flex min-h-20 w-full max-w-[1180px] items-center justify-between gap-4 px-4 sm:px-6">
          <BrandMark />
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.035] px-4 py-2 text-xs font-bold text-[#d1ded7] transition hover:border-[#c8ff3d]/30 hover:text-[#eff7f0]"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Open product
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 sm:py-16">
        <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#c8ff3d]">
              <Play size={13} fill="currentColor" aria-hidden="true" />
              90-second product demo
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[0.96] tracking-[-0.065em] sm:text-6xl">
              Feel the match.
              <span className="block text-[#92a59d]">See the reason.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#92a59d] sm:text-base">
              A concise walkthrough of the replay, explainable Pulse, fan
              calls, commercial path, and server-protected TxLINE connector.
            </p>
          </div>

          <a
            href="https://github.com/m00nxx/match-pulse-rooms"
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#b8c8c0] transition hover:text-[#eff7f0]"
          >
            <Code2 size={16} aria-hidden="true" />
            Public repository
            <ExternalLink size={13} aria-hidden="true" />
          </a>
        </div>

        <section className="glass-panel overflow-hidden rounded-[1.75rem] p-2 sm:p-3">
          <video
            className="aspect-video w-full rounded-[1.25rem] bg-black object-contain"
            controls
            playsInline
            preload="metadata"
            poster="/opengraph-image"
            aria-label="Match Pulse Rooms product demo"
          >
            <source src="/demo/match-pulse-demo.mp4" type="video/mp4" />
            <track
              default
              kind="captions"
              src="/demo/match-pulse-demo.en.vtt"
              srcLang="en"
              label="English"
            />
            Your browser does not support HTML video.
          </video>
        </section>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-[#71857c]">
          <p>H.264 / AAC · 1600×900 · under two minutes</p>
          <p>No wagering · Synthetic replay clearly labeled</p>
        </div>
      </main>
    </div>
  );
}
