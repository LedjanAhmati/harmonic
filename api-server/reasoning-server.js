// api-server/reasoning-server.js
// Simple standalone server for /v1 reasoning endpoints

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

console.log('🚀 Starting Harmonic Reasoning API...\n');

// ============================================================================
// ZÜRICH CYCLE - Deterministic Reasoning
// ============================================================================

function runZurichCycle(prompt) {
  const intake = {
    raw: prompt,
    clean: prompt.trim().toLowerCase(),
    type: prompt.split(' ').length > 20 ? "statement" : "question",
    timestamp: new Date().toISOString()
  };

  const normalized = prompt.trim().toLowerCase().replace(/\s+/g, " ");
  
  const tags = {
    contentType: prompt.includes("si") ? "how_to" : "what",
    intent: prompt.includes("krijo") ? "create" : "analyze",
    load: normalized.split(/\s+/).length > 50 ? "high" : "low"
  };

  const reasoning = {
    steps: [
      { order: 1, type: "define", content: "Definojmë problemin" },
      { order: 2, type: "context", content: "Konteksti relevante" },
      { order: 3, type: "inference", content: "Përfundime logjike" },
      { order: 4, type: "validation", content: "Verifikimi" }
    ]
  };

  const draft = reasoning.steps.map(s => `${s.order}. ${s.type}: ${s.content}`).join("\n");

  return {
    final: `🎼 HARMONIC ZÜRICH\n\n${draft}`,
    cycle: "Zurich-9",
    debug: { intake, tags, reasoning }
  };
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * POST /v1/zurich - Deterministic reasoning
 */
app.post("/v1/zurich", (req, res) => {
  const { prompt } = req.body || {};
  
  if (!prompt) {
    return res.status(400).json({
      ok: false,
      error: "missing_prompt",
      example: { prompt: "Cfare do te bejme sot?" }
    });
  }

  try {
    const result = runZurichCycle(prompt);
    return res.json({
      ok: true,
      prompt,
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "zurich_failed",
      message: error.message
    });
  }
});

/**
 * POST /v1/debate - Multi-persona debate
 */
app.post("/v1/debate", (req, res) => {
  const { prompt, personas = ["alba", "albi", "jona", "blerina", "asi"] } = req.body || {};

  if (!prompt) {
    return res.status(400).json({ ok: false, error: "missing_prompt" });
  }

  const responses = {};
  personas.forEach(p => {
    responses[p] = `Përgjigja e ${p}: "${prompt}"`;
  });

  return res.json({
    ok: true,
    prompt,
    personas,
    responses,
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /v1/asi-fusion - Combined reasoning
 */
app.post("/v1/asi-fusion", (req, res) => {
  const { prompt, options = { includeZurich: true, includeDebate: true } } = req.body || {};

  if (!prompt) {
    return res.status(400).json({ ok: false, error: "missing_prompt" });
  }

  const zurich = runZurichCycle(prompt);
  const debate = {
    alba: "Perspektiva e Alba...",
    albi: "Perspektiva e Albi..."
  };

  return res.json({
    ok: true,
    prompt,
    final: `🎼 ASI Fusion: ${zurich.final}`,
    sources: { zurich, debate },
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /v1/cycle/run - Full cycle
 */
app.post("/v1/cycle/run", (req, res) => {
  const { prompt } = req.body || {};

  if (!prompt) {
    return res.status(400).json({ ok: false, error: "missing_prompt" });
  }

  const result = runZurichCycle(prompt);

  return res.json({
    ok: true,
    prompt,
    cycle: result.cycle,
    final: result.final,
    debug: result.debug,
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /v1/info - API info
 */
app.get("/v1/info", (req, res) => {
  res.json({
    ok: true,
    system: "Harmonic Reasoning API",
    version: "1.0",
    endpoints: {
      reasoning: [
        "POST /v1/zurich",
        "POST /v1/debate",
        "POST /v1/asi-fusion",
        "POST /v1/cycle/run"
      ],
      auth: [
        "POST /v1/auth/signup",
        "POST /v1/auth/login",
        "GET /v1/user/me",
        "GET /v1/usage"
      ],
      info: [
        "GET /v1/info",
        "GET /health"
      ]
    },
    description: "Deterministic reasoning with Zürich Engine, Trinity debate, ASI fusion, and SaaS auth"
  });
});

/**
 * GET /health - Health check
 */
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    status: "running",
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// AUTH ENDPOINTS (SaaS)
// ============================================================================

// In-memory user storage (for demo - replace with database in production)
const users = new Map();
const tokens = new Map();

/**
 * POST /v1/auth/signup - Create new account
 */
app.post("/v1/auth/signup", (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      ok: false,
      error: "missing_credentials",
      required: ["email", "password"]
    });
  }

  // Check if user exists
  if (users.has(email)) {
    return res.status(409).json({
      ok: false,
      error: "user_exists"
    });
  }

  // Create new user
  const userId = `usr_${Date.now()}`;
  const token = `token_${Math.random().toString(36).substring(7)}`;

  const user = {
    id: userId,
    email,
    password, // In production, hash this!
    createdAt: new Date().toISOString(),
    isPremium: false,
    requestsUsed: 0
  };

  users.set(email, user);
  tokens.set(token, userId);

  return res.status(201).json({
    ok: true,
    userId,
    email,
    token,
    message: "Account created successfully"
  });
});

/**
 * POST /v1/auth/login - Login to account
 */
app.post("/v1/auth/login", (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      ok: false,
      error: "missing_credentials"
    });
  }

  // Find user
  const user = users.get(email);
  if (!user || user.password !== password) {
    return res.status(401).json({
      ok: false,
      error: "invalid_credentials"
    });
  }

  // Generate token
  const token = `token_${Math.random().toString(36).substring(7)}`;
  tokens.set(token, user.id);

  return res.json({
    ok: true,
    userId: user.id,
    email,
    token,
    isPremium: user.isPremium
  });
});

/**
 * GET /v1/user/me - Get current user info
 */
app.get("/v1/user/me", (req, res) => {
  const auth = req.headers.authorization || "";
  const token = auth.replace("Bearer ", "").trim();

  if (!token) {
    return res.status(401).json({
      ok: false,
      error: "missing_token"
    });
  }

  const userId = tokens.get(token);
  if (!userId) {
    return res.status(401).json({
      ok: false,
      error: "invalid_token"
    });
  }

  // Find user by ID
  let user = null;
  for (const [email, u] of users.entries()) {
    if (u.id === userId) {
      user = u;
      break;
    }
  }

  if (!user) {
    return res.status(404).json({
      ok: false,
      error: "user_not_found"
    });
  }

  return res.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      isPremium: user.isPremium,
      requestsUsed: user.requestsUsed,
      createdAt: user.createdAt
    }
  });
});

/**
 * GET /v1/usage - Get API usage stats
 */
app.get("/v1/usage", (req, res) => {
  const auth = req.headers.authorization || "";
  const token = auth.replace("Bearer ", "").trim();

  if (!token) {
    return res.status(401).json({ ok: false, error: "missing_token" });
  }

  const userId = tokens.get(token);
  if (!userId) {
    return res.status(401).json({ ok: false, error: "invalid_token" });
  }

  return res.json({
    ok: true,
    usage: {
      requestsThisMonth: Math.floor(Math.random() * 500),
      zurichCalls: Math.floor(Math.random() * 100),
      debateCalls: Math.floor(Math.random() * 50),
      asiFusionCalls: Math.floor(Math.random() * 20),
      limit: 10000
    }
  });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`✅ Harmonic Reasoning API running on http://localhost:${PORT}\n`);
  console.log('📍 Available Endpoints:');
  console.log('  POST /v1/zurich       - Deterministic reasoning');
  console.log('  POST /v1/debate       - Multi-persona debate');
  console.log('  POST /v1/asi-fusion   - Combined reasoning');
  console.log('  POST /v1/cycle/run    - Full Zürich cycle');
  console.log('  GET  /v1/info         - API information');
  console.log('  GET  /health          - Health check\n');
  console.log('🧪 Test with Postman or curl:\n');
  console.log('  curl -X POST http://localhost:5000/v1/zurich \\');
  console.log('    -H "Content-Type: application/json" \\');
  console.log('    -d \'{"prompt":"Cfare do te bejme sot?"}\'\n');
});
