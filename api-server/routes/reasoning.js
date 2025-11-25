// api-server/routes/reasoning.js
// Harmonic Reasoning API - Zürich, Debate, ASI Fusion

import express from 'express';

const router = express.Router();

/**
 * POST /v1/zurich
 * Deterministic reasoning engine (Zürich Cycle)
 * No AI - pure logic-based analysis
 * 
 * Request:
 * {
 *   "prompt": "Cfare do te bejme sot?"
 * }
 */
router.post("/v1/zurich", async (req, res) => {
  const { prompt } = req.body || {};

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return res.status(400).json({
      ok: false,
      error: "missing_prompt",
      example: { prompt: "Cfare do te bejme sot?" }
    });
  }

  try {
    // Import Zürich cycle dynamically
    const { runZurichCycle } = await import('../src/zurich-cycle.js');
    
    const result = runZurichCycle(prompt.trim());

    return res.json({
      ok: true,
      prompt,
      cycle: result.cycle,
      final: result.final,
      debug: result.debug,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Zürich error:", error);
    return res.status(500).json({
      ok: false,
      error: "zurich_failed",
      message: error.message
    });
  }
});

/**
 * POST /v1/debate
 * Multi-persona debate (Trinity system)
 * 
 * Request:
 * {
 *   "prompt": "A ia vlen te ndertoj nje startup?",
 *   "personas": ["alba", "albi", "jona"]
 * }
 */
router.post("/v1/debate", async (req, res) => {
  const { prompt, personas = ["alba", "albi", "jona", "blerina", "asi"] } = req.body || {};

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({
      ok: false,
      error: "missing_prompt"
    });
  }

  try {
    // For now, return mock debate responses
    // Will be implemented with Trinity orchestrator
    const responses = {};
    
    for (const persona of personas) {
      responses[persona] = `Përgjigja e ${persona} për: "${prompt}"`;
    }

    return res.json({
      ok: true,
      prompt,
      personas,
      responses,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Debate error:", error);
    return res.status(500).json({
      ok: false,
      error: "debate_failed",
      message: error.message
    });
  }
});

/**
 * POST /v1/asi-fusion
 * ASI meta-reasoning: combines Zürich + Trinity + Brain
 * 
 * Request:
 * {
 *   "prompt": "Jam i lodhur...",
 *   "options": {
 *     "includeZurich": true,
 *     "includeDebate": true,
 *     "includeBrain": false
 *   }
 * }
 */
router.post("/v1/asi-fusion", async (req, res) => {
  const { 
    prompt, 
    options = { 
      includeZurich: true, 
      includeDebate: true, 
      includeBrain: false 
    } 
  } = req.body || {};

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({
      ok: false,
      error: "missing_prompt"
    });
  }

  try {
    const { runZurichCycle } = await import('../src/zurich-cycle.js');
    
    const sources = {};

    // Include Zürich if requested
    if (options.includeZurich) {
      sources.zurich = runZurichCycle(prompt);
    }

    // Include debate if requested
    if (options.includeDebate) {
      sources.trinity = {
        alba: "Perspektiva e Alba...",
        albi: "Perspektiva e Albi...",
        jona: "Perspektiva e Jona..."
      };
    }

    // Synthesize final response
    const final = `🎼 Harmonic ASI Fusion Response:\n\n${prompt}\n\nAnalize e kombinuar nga ${Object.keys(sources).join(" + ")}...`;

    return res.json({
      ok: true,
      prompt,
      options,
      final,
      sources,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("ASI Fusion error:", error);
    return res.status(500).json({
      ok: false,
      error: "asi_fusion_failed",
      message: error.message
    });
  }
});

/**
 * POST /v1/cycle/run
 * Full Zürich cycle with all stages
 * 
 * Request:
 * {
 *   "prompt": "Si mund ta shes produktin tim?",
 *   "mode": "full"
 * }
 */
router.post("/v1/cycle/run", async (req, res) => {
  const { prompt, mode = "full" } = req.body || {};

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({
      ok: false,
      error: "missing_prompt"
    });
  }

  try {
    const { runZurichCycle } = await import('../src/zurich-cycle.js');
    
    const result = runZurichCycle(prompt.trim());

    return res.json({
      ok: true,
      prompt,
      mode,
      cycle: result.cycle,
      ...result.debug,
      final: result.final,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Cycle error:", error);
    return res.status(500).json({
      ok: false,
      error: "cycle_failed",
      message: error.message
    });
  }
});

/**
 * GET /v1/info
 * Reasoning API info
 */
router.get("/v1/info", (req, res) => {
  res.json({
    ok: true,
    system: "Harmonic Reasoning API",
    version: "1.0",
    description: "Multi-layer reasoning engine with Zürich deterministic logic, Trinity debate, and ASI fusion",
    endpoints: {
      zurich: "POST /v1/zurich",
      debate: "POST /v1/debate",
      asi_fusion: "POST /v1/asi-fusion",
      cycle_run: "POST /v1/cycle/run",
      info: "GET /v1/info"
    },
    modes: ["zurich", "debate", "asi-fusion", "cycle"]
  });
});

export default router;
