// app/api/health/route.js
export async function GET(request) {
  try {
    return Response.json({
      status: 'ok',
      time: Date.now(),
      uptime: '24h'
    });
  } catch (error) {
    return Response.json(
      { status: 'error', error: error.message },
      { status: 500 }
    );
  }
}
