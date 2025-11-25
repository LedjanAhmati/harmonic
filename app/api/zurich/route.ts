import { NextResponse } from "next/server";
import { runZurichCycle } from "@/lib/zurich/cycle";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { ok: false, error: "missing_prompt" },
        { status: 400 }
      );
    }

    const result = runZurichCycle(prompt);

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (err) {
    console.error("Zurich API error:", err);
    return NextResponse.json(
      { ok: false, error: "internal_error" },
      { status: 500 }
    );
  }
}
