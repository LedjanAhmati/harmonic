import { orchestrateServer } from "@/lib/trinity/orchestrator-server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const result = await orchestrateServer(prompt);

    return NextResponse.json(result);
  } catch (e) {
    console.error("[API:BRAINSTORM] Error:", e);
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
