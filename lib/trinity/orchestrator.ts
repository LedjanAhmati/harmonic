"use client";
// @ts-nocheck

/**
 * Trinity Orchestrator – Real Multi-Agent AI
 * Uses Puter.ai to generate real responses for each persona
 */

// Puter is a browser-global API, only available in client-side code
// @ts-ignore
declare const puter: any;

// Strip echo pattern from response
function cleanEcho(response: string, userPrompt: string): string {
  // Remove "As [Name]," pattern at start
  let cleaned = response.replace(/^As\s+\w+,\s*/i, "");
  
  // Remove "I see" / "I hear" / "analyzing" patterns at start
  cleaned = cleaned.replace(/^(I see|I hear|analyzing|my intuition says|I've seen)\s+/i, "");
  
  // Remove the user's prompt if it appears quoted in the response
  cleaned = cleaned.replace(new RegExp(`"${userPrompt}".*?:`, "i"), "");
  
  // Clean up any leading punctuation/spaces
  cleaned = cleaned.trim().replace(/^[\s\-–—:,]+/, "").trim();
  
  return cleaned || response; // Return original if cleanup removed everything
}

// @ts-ignore
async function aiCall(systemPrompt: string, userPrompt: string) {
  try {
    // Puter.ai expects a unified prompt string, not OpenAI-style message array
    const fullPrompt = `${systemPrompt}

Respond to the user's message with your authentic perspective. Be direct and genuine.

User message:
"${userPrompt}"`;

    const response = await puter.ai.chat(fullPrompt, {
      model: "gpt-5-nano"
    });

    // Clean the echo pattern from the response
    const cleaned = cleanEcho(response, userPrompt);
    return cleaned;
  } catch (err) {
    console.error("AI error:", err);
    return "Error generating response.";
  }
}

export async function orchestrate(prompt: string) {
  const personas = [
    {
      id: "alba",
      system:
        "You are ALBA. Creative, emotional, expressive. Respond using imaginative language, feelings, metaphors. Very artistic.",
    },
    {
      id: "albi",
      system:
        "You are ALBI. Analytical, logical, structured. Break down the concept into frameworks, logic, cause-effect.",
    },
    {
      id: "jona",
      system:
        "You are JONA. Intuitive, fast, sharp. Give instinct-based insights and quick conclusions.",
    },
    {
      id: "blerina",
      system:
        "You are BLERINA. Wise, balanced, practical. Give grounded guidance, life wisdom, balanced thinking.",
    },
    {
      id: "asi",
      system:
        "You are ASI. Meta-philosophical, abstract, systems thinker. Talk about patterns, higher-order meaning.",
    },
  ];

  // Run all agents in parallel
  const results = await Promise.all(
    personas.map((agent) => aiCall(agent.system, prompt))
  );

  // Map persona → reply
  const output: Record<string, string> = {};
  personas.forEach((p, i) => {
    output[p.id] = results[i];
  });

  return output;
}

