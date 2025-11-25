import { NextResponse } from "next/server";
import { orchestrateServer } from "@/lib/trinity/orchestrator-server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = body.prompt || "untitled";
    const sessionId = body.sessionId || "default";

    // Call Trinity orchestrator for real AI response
    const response = await orchestrateServer(prompt);

    return NextResponse.json({
      success: true,
      sessionId,
      prompt,
      system: "Harmonic Trinity",
      response: response,
    });
  } catch (e) {
    console.error("[API:CHAT] Error:", e);
    return NextResponse.json(
      { success: false, error: "server_error", details: String(e) },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return NextResponse.json({ success: true, message: "Chat endpoint ready" });
}


