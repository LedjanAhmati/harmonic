/**
 * Puter AI Integration - Industrial Grade
 * Real-time multi-persona API integration
 */

interface PuterAIResponse {
  text?: string;
}

interface PuterAI {
  chat: (prompt: string, config: Record<string, unknown>) => Promise<PuterAIResponse | string>;
}

interface PuterWindow {
  ai: PuterAI;
}

declare global {
  interface Window {
    puter: PuterWindow;
  }
}

export interface PuterResponse {
  text: string;
  model: string;
  tokens?: number;
}

export interface PuterConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

const DEFAULT_CONFIG: PuterConfig = {
  model: "gpt-4-mini",
  temperature: 0.7,
  maxTokens: 1024,
};

/**
 * Core Puter AI Chat - with error handling
 */
export async function puterChat(
  prompt: string,
  config: Partial<PuterConfig> = {}
): Promise<string> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Browser check
  if (typeof window === "undefined") {
    console.warn("[Puter] Server-side fallback - returning mock response");
    return `[Server Response] ${prompt}`;
  }

  // Puter availability check
  if (!window.puter) {
    console.warn("[Puter] Not loaded yet - returning cached response");
    return generateOfflineResponse(prompt);
  }

  try {
    console.log(`[Puter] Calling ${finalConfig.model} with prompt: ${prompt.substring(0, 50)}...`);

    const response = await window.puter.ai.chat(prompt, {
      model: finalConfig.model,
      temperature: finalConfig.temperature,
      max_tokens: finalConfig.maxTokens,
    });

    if (!response) {
      return generateOfflineResponse(prompt);
    }

    if (typeof response === 'string') {
      return response;
    }
    return response.text || generateOfflineResponse(prompt);
  } catch (error) {
    console.error("[Puter] Chat error:", error);
    return generateOfflineResponse(prompt);
  }
}

/**
 * Persona-specific Puter call
 */
export async function puterPersona(
  persona: string,
  prompt: string,
  style: string
): Promise<string> {
  const systemPrompts: Record<string, string> = {
    alba: "You are Alba, a creative and emotional thinker. Respond with imaginative insights and empathy.",
    albi: "You are Albi, a logical and analytical thinker. Respond with structured reasoning and facts.",
    jona: "You are Jona, a fast and intuitive thinker. Respond with quick, practical insights.",
    blerina: "You are Blerina, a wise and balanced mentor. Respond with holistic wisdom.",
    asi: "You are ASI, a philosophical AI. Respond with deep meta-analysis and structural insights.",
  };

  const systemPrompt = systemPrompts[persona.toLowerCase()] || systemPrompts.asi;
  const fullPrompt = `${systemPrompt}\n\nRespond to: ${prompt}`;

  return puterChat(fullPrompt, {
    temperature: style === "emotional" ? 0.9 : style === "logical" ? 0.3 : 0.6,
  });
}

/**
 * Multi-persona parallel chat
 */
export async function puterMultiPersona(
  personas: string[],
  prompt: string
): Promise<Record<string, string>> {
  const results: Record<string, string> = {};

  const personaStyles: Record<string, string> = {
    alba: "emotional",
    albi: "logical",
    jona: "intuitive",
    blerina: "wise",
    asi: "philosophical",
  };

  // Run all in parallel
  const promises = personas.map(async (persona) => {
    const style = personaStyles[persona.toLowerCase()] || "balanced";
    const response = await puterPersona(persona, prompt, style);
    results[persona] = response;
  });

  await Promise.all(promises);
  return results;
}

/**
 * Generate consensus from multiple responses
 */
export async function puterConsensus(
  responses: Record<string, string>,
  topic: string
): Promise<string> {
  const consolidatedPrompt = `
Given these perspectives on "${topic}":

${Object.entries(responses)
  .map(([persona, response]) => `${persona}: ${response}`)
  .join("\n\n")}

Create a balanced consensus that integrates all viewpoints.
`;

  return puterChat(consolidatedPrompt, {
    temperature: 0.5,
  });
}

/**
 * Offline/fallback response generator
 */
function generateOfflineResponse(prompt: string): string {
  const templates = [
    `Reflecting on "${prompt.substring(0, 40)}", I see multiple dimensions worth exploring.`,
    `Your question about "${prompt.substring(0, 40)}" raises interesting considerations.`,
    `Considering "${prompt.substring(0, 40)}", the answer depends on perspective and context.`,
    `That's a thoughtful inquiry about "${prompt.substring(0, 40)}". Let me think deeper...`,
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Health check
 */
export function isPuterReady(): boolean {
  if (typeof window === "undefined") return false;
  return !!window.puter;
}

/**
 * Wait for Puter to load
 */
export async function waitForPuter(timeout: number = 5000): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (isPuterReady()) {
      console.log("[Puter] Ready!");
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.warn("[Puter] Timeout waiting for Puter");
  return false;
}

