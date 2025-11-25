// app/api/v1/auth/signup/route.js
// POST /api/v1/auth/signup

const users = new Map();

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json({
        ok: false,
        error: "missing_credentials"
      }, { status: 400 });
    }

    if (users.has(email)) {
      return Response.json({
        ok: false,
        error: "user_exists"
      }, { status: 409 });
    }

    const userId = `usr_${Date.now()}`;
    const token = `token_${Math.random().toString(36).substring(7)}`;

    users.set(email, {
      id: userId,
      email,
      password,
      createdAt: new Date().toISOString(),
      isPremium: false,
      requestsUsed: 0,
      token
    });

    return Response.json({
      ok: true,
      userId,
      email,
      token,
      message: "Account created successfully"
    }, { status: 201 });
  } catch (error) {
    return Response.json({
      ok: false,
      error: "signup_failed",
      message: error.message
    }, { status: 500 });
  }
}
