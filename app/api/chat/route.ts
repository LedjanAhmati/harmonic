import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = body.prompt || "untitled";
    const sessionId = body.sessionId || "default";

    // Return instruction to frontend to call Puter.ai directly
    return NextResponse.json({
      success: true,
      sessionId,
      prompt,
      instruction: "call_puter_ai",
      summary: `🎼 Trinity Real AI Debate on "${prompt}"`,
    });
  } catch (e) {
    console.error("[API:CHAT] Error:", e);
    return NextResponse.json(
      { success: false, error: "server_error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return NextResponse.json({ success: true, message: "Chat endpoint ready" });
}


