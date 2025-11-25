// app/api/v1/info/route.js
export async function GET(request) {
  try {
    return Response.json({
      ok: true,
      name: 'Harmonic Reasoning API',
      version: '1.0.0',
      description: 'Deterministic reasoning engine with multi-persona debate',
      endpoints: [
        { method: 'GET', path: '/health', description: 'Health check' },
        { method: 'POST', path: '/v1/zurich', description: 'Deterministic reasoning' },
        { method: 'POST', path: '/v1/debate', description: 'Multi-persona debate' },
        { method: 'POST', path: '/v1/asi-fusion', description: 'Combined reasoning' },
        { method: 'POST', path: '/v1/cycle/run', description: 'Full Zürich cycle' },
        { method: 'POST', path: '/v1/auth/signup', description: 'Create account' },
        { method: 'POST', path: '/v1/auth/login', description: 'Login' },
        { method: 'GET', path: '/v1/user/me', description: 'Get user info' },
        { method: 'GET', path: '/v1/usage', description: 'Usage statistics' },
        { method: 'GET', path: '/v1/info', description: 'API information' }
      ],
      total: 10
    });
  } catch (error) {
    return Response.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
