import { AI } from "@/lib/ai/trinity";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = await AI.brainstorm(prompt);

  return NextResponse.json(result);
}
