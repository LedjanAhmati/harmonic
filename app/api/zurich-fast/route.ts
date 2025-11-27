/**
 * Zürich Fast API Endpoint
 * ⚡ Instant responses without Puter/Trinity/ASI calls
 * 
 * GET  /api/zurich-fast?prompt=... → instant JSON response
 * POST /api/zurich-fast with body {prompt: string} → instant JSON response
 * 
 * Response time: <10ms (pure local computation)
 */

import { NextResponse } from "next/server";
import { runZurichCycle, runZurichFast } from "@/lib/zurich/fast-engine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const prompt = searchParams.get("prompt") || searchParams.get("q");

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        {
          ok: false,
          error: "missing_prompt",
          message: "Provide ?prompt=... or ?q=...",
        },
        { status: 400 }
      );
    }

    // Use fast path (minimal output)
    const result = runZurichFast(prompt);

    return NextResponse.json(
      {
        ok: true,
        mode: "zurich-fast",
        prompt,
        answer: result.answer,
        latency_ms: result.ms,
        cached: false,
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=3600",
          "X-Response-Time": `${result.ms}ms`,
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "server_error",
        message: String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = body.prompt || body.input || body.q;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        {
          ok: false,
          error: "missing_prompt",
          message: "Provide {prompt: string} in request body",
        },
        { status: 400 }
      );
    }

    // Option: full cycle or fast?
    const fullCycle = body.full === true || body.cycle === true;
    const startTime = performance.now();

    let result;
    if (fullCycle) {
      // Return full 4-stage cycle
      result = runZurichCycle(prompt);
      return NextResponse.json(
        {
          ok: true,
          mode: "zurich-cycle-full",
          prompt,
          cycle: result.cycle,
          final: result.final,
          latency_ms: Math.round(performance.now() - startTime),
          cached: false,
        },
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "X-Response-Time": `${Math.round(performance.now() - startTime)}ms`,
          },
        }
      );
    } else {
      // Fast path: just the answer
      const fastResult = runZurichFast(prompt);
      return NextResponse.json(
        {
          ok: true,
          mode: "zurich-fast",
          prompt,
          answer: fastResult.answer,
          latency_ms: fastResult.ms,
          cached: false,
        },
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "X-Response-Time": `${fastResult.ms}ms`,
          },
        }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "server_error",
        message: String(error),
      },
      { status: 500 }
    );
  }
}

export function OPTIONS() {
  return NextResponse.json(
    {
      api: "Zürich Fast Engine",
      description: "Instant local reasoning without external AI calls",
      endpoints: {
        GET: {
          url: "/api/zurich-fast?prompt=...",
          params: {
            prompt: "Your question or statement",
            q: "Alias for prompt",
          },
        },
        POST: {
          url: "/api/zurich-fast",
          body: {
            prompt: "Your question (required)",
            full: "Include full 4-stage cycle? (default: false)",
          },
        },
      },
      performance: {
        latency: "<10ms",
        method: "Synchronous local computation",
        stages: ["Clarify", "Analyze", "Synthesize", "Conclude"],
      },
      examples: {
        fast_get: "GET /api/zurich-fast?prompt=What%20is%20innovation",
        fast_post: "POST /api/zurich-fast with {prompt: 'What is innovation?'}",
        full_cycle: "POST /api/zurich-fast with {prompt: '...', full: true}",
      },
    },
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
      },
    }
  );
}
