// app/api/v1/user/me/route.js
export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return Response.json(
        { ok: false, error: 'missing_token' },
        { status: 401 }
      );
    }

    return Response.json({
      ok: true,
      userId: `user_${Date.now()}`,
      email: 'user@harmonic.ai',
      createdAt: new Date().toISOString(),
      plan: 'free',
      apiCalls: 42
    });
  } catch (error) {
    return Response.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
