import { orchestrateServer } from "@/lib/trinity/orchestrator-server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const result = await orchestrateServer(prompt);

    return NextResponse.json(result);
  } catch (e) {
    console.error("[API:BRAINSTORM] Error:", e);
    return NextResponse.json(
      {
        success: false,
        error: "orchestration_error",
        details: String(e),
      },
      { status: 500 }
    );
  }
}
