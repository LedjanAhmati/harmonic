import { NextResponse } from "next/server";
import { orchestrateServer } from "@/lib/trinity/orchestrator-server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = body.prompt || "untitled";
    const sessionId = body.sessionId || "default";

    // Call Trinity orchestrator for real AI response (no fallbacks)
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
    const errorMsg = String(e);

    // Return appropriate status codes based on error type
    const isConfigError = errorMsg.includes("PUTER_API_KEY") || errorMsg.includes("not configured");
    const statusCode = isConfigError ? 503 : 500;

    return NextResponse.json(
      {
        success: false,
        error: isConfigError ? "service_unavailable" : "orchestration_failed",
        message: isConfigError ? "Puter API not configured - real data required" : "Failed to generate response",
        details: errorMsg
      },
      { status: statusCode }
    );
  }
}

export async function GET(req: Request) {
  return NextResponse.json({ success: true, message: "Chat endpoint ready" });
}
