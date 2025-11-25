import { NextRequest, NextResponse } from "next/server";
import { orchestrateThought } from "@/lib/trinity/orchestrator-minimal";
import type { PersonaKey } from "@/lib/trinity/persona/personas";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { text, persona } = await req.json();

  // Use provided persona or default
  const selectedPersona = (persona || "alba") as PersonaKey;

  const result = await orchestrateThought(text, selectedPersona);

  return NextResponse.json(result);
}
