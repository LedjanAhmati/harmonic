// app/api/v1/auth/login/route.js
export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json(
        { ok: false, error: 'missing_credentials' },
        { status: 400 }
      );
    }

    const token = `tok_${Date.now()}_${Buffer.from(email).toString('base64').substring(0, 8)}`;

    return Response.json({
      ok: true,
      token,
      email,
      message: 'Login successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
