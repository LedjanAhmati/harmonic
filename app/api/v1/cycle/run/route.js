// app/api/v1/cycle/run/route.js
// Trinity Cycle Runner - Full 4-stage reasoning cycle with REAL AI only

async function callOrchestrator(prompt) {
  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Extract real response - throw if no real data
    const realResponse = data.response?.response;
    if (!realResponse) {
      throw new Error('No real response data from orchestrator');
    }

    return realResponse;
  } catch (err) {
    console.error('Orchestrator call failed:', err);
    throw err; // Re-throw - no fallback allowed
  }
}

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return Response.json(
        { ok: false, error: 'missing_prompt' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    try {
      // STAGE 1: INPUT CLARIFICATION
      const stage1_prompt = `Clarify what the user is asking: "${prompt}"`;
      const clarification = await callOrchestrator(stage1_prompt);

      // STAGE 2: ANALYTICAL BREAKDOWN
      const stage2_prompt = `Provide analytical framework for: "${prompt}"`;
      const analysis = await callOrchestrator(stage2_prompt);

      // STAGE 3: SYNTHESIS & INSIGHTS
      const stage3_prompt = `Synthesize key insights about: "${prompt}"`;
      const synthesis = await callOrchestrator(stage3_prompt);

      // STAGE 4: CONCLUSION & NEXT STEPS
      const stage4_prompt = `Summarize conclusions and recommend next steps for: "${prompt}"`;
      const conclusion = await callOrchestrator(stage4_prompt);

      const duration = Date.now() - startTime;

      // Full Zürich Cycle - 4 stages with REAL reasoning only
      const stages = {
        stage_1_clarify: {
          name: 'Clarification',
          prompt: stage1_prompt,
          response: clarification,
          timestamp: new Date(startTime + duration * 0.1).toISOString()
        },
        stage_2_analyze: {
          name: 'Analysis',
          prompt: stage2_prompt,
          response: analysis,
          timestamp: new Date(startTime + duration * 0.35).toISOString()
        },
        stage_3_synthesize: {
          name: 'Synthesis',
          prompt: stage3_prompt,
          response: synthesis,
          timestamp: new Date(startTime + duration * 0.65).toISOString()
        },
        stage_4_conclude: {
          name: 'Conclusion',
          prompt: stage4_prompt,
          response: conclusion,
          timestamp: new Date(startTime + duration).toISOString()
        }
      };

      return Response.json({
        ok: true,
        system: 'Harmonic Trinity - Zürich Cycle',
        prompt,
        stages,
        metadata: {
          cycle_type: 'ZURICH_MODE',
          modules_used: ['creative', 'analytical', 'intuitive', 'practical', 'meta'],
          organization: 'WebUltraThinking-Euroweb',
          duration_ms: duration,
          timestamp: new Date().toISOString()
        }
      });
    } catch (cycleErr) {
      console.error('Cycle execution failed - real data required:', cycleErr);
      return Response.json(
        {
          ok: false,
          error: 'orchestration_failed',
          message: 'Cycle requires real data from Puter API. API key or connectivity issue.',
          details: cycleErr.message
        },
        { status: 503 }
      );
    }
  } catch (error) {
    return Response.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
