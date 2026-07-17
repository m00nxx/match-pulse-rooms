import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  getFeaturedFixture,
  getLiveRoom,
  isTxlineConfigured,
} from "@/lib/txline/server";

export const dynamic = "force-dynamic";

const fixtureSchema = z.coerce.number().int().positive().safe();

export async function GET(request: NextRequest) {
  const featured = getFeaturedFixture();
  const requested = request.nextUrl.searchParams.get("fixtureId");

  if (!requested) {
    return NextResponse.json(
      {
        configured: isTxlineConfigured(),
        featured,
      },
      {
        headers: { "cache-control": "no-store" },
      },
    );
  }

  const parsed = fixtureSchema.safeParse(requested);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid positive TxLINE fixture ID." },
      { status: 400 },
    );
  }

  try {
    const room = await getLiveRoom(parsed.data);
    return NextResponse.json(room, {
      headers: { "cache-control": "no-store" },
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";

    if (code === "TXLINE_NOT_CONFIGURED") {
      return NextResponse.json(
        {
          error:
            "Live TxLINE is not configured on this deployment. Replay remains available.",
        },
        { status: 503 },
      );
    }

    if (code === "TXLINE_FIXTURE_UNAVAILABLE") {
      return NextResponse.json(
        {
          error:
            "No score or odds data was returned for this fixture. Check the ID or try an active fixture.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "TxLINE is temporarily unavailable. Replay remains available." },
      { status: 502 },
    );
  }
}
