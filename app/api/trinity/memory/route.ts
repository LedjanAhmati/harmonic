import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/trinity/memory:
 *   get:
 *     summary: Retrieve memory for a Trinity session
 *     description: Fetches the memory entries associated with a specific Trinity session ID.
 *     tags: [Trinity]
 *     parameters:
 *       - in: query
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the session to retrieve memory for.
 *     responses:
 *       200:
 *         description: Successful response with session memory.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionId:
 *                   type: string
 *                 memory:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: "user_prompt"
 *                       content:
 *                         type: string
 *                         example: "What is innovation?"
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Missing sessionId query parameter.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json(
      { error: "Missing sessionId query parameter" },
      { status: 400 }
    );
  }

  // In a real implementation, you would fetch memory from a database
  // using the sessionId. For now, we'll return mock data.
  const mockMemory = [
    {
      type: "user_prompt",
      content: "What is the capital of Albania?",
      timestamp: new Date(Date.now() - 10000).toISOString(),
    },
    {
      type: "model_response",
      content: "The capital of Albania is Tirana.",
      timestamp: new Date(Date.now() - 8000).toISOString(),
    },
    {
      type: "user_prompt",
      content: "Tell me more about it.",
      timestamp: new Date(Date.now() - 5000).toISOString(),
    },
  ];

  return NextResponse.json({
    sessionId,
    memory: mockMemory,
  });
}
