"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main className="grid min-h-screen place-items-center bg-[#07110f] px-5 text-[#eff7f0]">
          <div className="max-w-md text-center">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#c8ff3d]">
              Signal interrupted
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-[-0.055em]">
              The room lost its feed.
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#92a59d]">
              Your fan call is safe on this device. Retry to restore the room.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-6 min-h-11 rounded-full bg-[#c8ff3d] px-5 text-sm font-bold text-[#07110f]"
            >
              Retry room
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
