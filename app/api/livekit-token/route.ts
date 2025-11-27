import { NextRequest, NextResponse } from "next/server";
import { createRoomToken, NEXT_PUBLIC_LIVEKIT_URL } from "@/lib/livekit";

export async function POST(req: NextRequest) {
  try {
    const { roomName, identity, metadata } = await req.json();

    if (!roomName || !identity) {
      return NextResponse.json(
        { error: "roomName dhe identity janë të detyrueshme" },
        { status: 400 }
      );
    }

    const token = await createRoomToken({
      roomName,
      identity,
      metadata,
    });

    return NextResponse.json({
      token,
      serverUrl: NEXT_PUBLIC_LIVEKIT_URL,
    });
  } catch (err) {
    console.error("[livekit-token]", err);
    return NextResponse.json(
      { error: "Token generation failed" },
      { status: 500 }
    );
  }
}
