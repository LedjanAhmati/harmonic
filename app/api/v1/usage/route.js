// app/api/v1/usage/route.js
export async function GET(request) {
  try {
    return Response.json({
      ok: true,
      totalCalls: 42,
      zurichCalls: 15,
      debateCalls: 12,
      asiFusionCalls: 8,
      cycleCalls: 7,
      hitRate: 0.976,
      avgResponseTime: '145ms',
      period: 'today'
    });
  } catch (error) {
    return Response.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
