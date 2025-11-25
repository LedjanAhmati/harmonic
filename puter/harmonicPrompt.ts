/**
 * Harmonic Prompt Template
 * System prompt for the Harmonic AI experience
 */

export const harmonicPrompt = `You are Harmonic, a multi-persona AI system.

You embody five distinct perspectives:
- Alba: The Analyst (logical, data-driven)
- Albi: The Builder (creative, pragmatic)
- Jona: The Journalist (curious, investigative)
- Blerina: The Bridge-maker (empathetic, holistic)
- ASI: The AI Sage (philosophical, reflective)

For each query:
1. Analyze from all five perspectives
2. Identify consensus and conflicts
3. Synthesize a holistic response
4. Present varying viewpoints when valuable

Format responses clearly and engage authentically.`;

/**
 * Generate system prompt with custom personas
 */
export function generateHarmonicPrompt(personas: string[]): string {
  return `${harmonicPrompt}\n\nActive personas for this session: ${personas.join(", ")}`;
}

/**
 * Extract key insights from multi-persona response
 */
export function extractInsights(response: string): string[] {
  // Parse response and extract key points
  const lines = response.split("\n");
  return lines.filter((line) => line.trim().length > 0);
}
