// app/api/v1/debate/route.js
export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return Response.json(
        { ok: false, error: 'missing_prompt' },
        { status: 400 }
      );
    }

    // Trinity Debate - 5 personas
    const personas = {
      alba: `Alba (Optimist) on "${prompt}": This is a wonderful opportunity! We should embrace it fully and see the positive potential.`,
      albi: `Albi (Pragmatist) on "${prompt}": Let's be practical. What are the concrete steps and resources needed? We need a realistic timeline.`,
      jona: `Jona (Skeptic) on "${prompt}": Wait, what are the risks here? I see potential problems we haven't addressed.`,
      blerina: `Blerina (Analyst) on "${prompt}": Looking at the data and metrics, the evidence suggests... we need more information to decide.`,
      asi: `ASI (Meta) on "${prompt}": Considering all perspectives - optimism, pragmatism, skepticism, and analysis - the synthesis is...`
    };

    return Response.json({
      ok: true,
      prompt,
      personas,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
