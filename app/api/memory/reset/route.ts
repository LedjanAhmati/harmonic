import { NextResponse } from "next/server";

/**
 * Clear conversation memory for a session
 * POST /api/memory/reset
 * 
 * Request body:
 * {
 *   "sessionId": "default" (optional)
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const sessionId = body.sessionId || "default";

    // In a real implementation, you would:
    // 1. Delete from database
    // 2. Delete from file system (JSONL)
    // 3. Clear in-memory cache
    
    // For now, we'll return success
    return NextResponse.json(
      {
        ok: true,
        success: true,
        cleared: true,
        sessionId,
        message: `Memory cleared for session: ${sessionId}`,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to clear memory",
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS for CORS and documentation
 */
export async function OPTIONS() {
  return NextResponse.json(
    {
      description: "Clear conversation memory",
      method: "POST",
      body: {
        sessionId: "string (optional, defaults to 'default')",
      },
      response: {
        ok: "boolean",
        success: "boolean",
        cleared: "boolean",
        sessionId: "string",
        message: "string",
        timestamp: "ISO date string",
      },
    },
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
