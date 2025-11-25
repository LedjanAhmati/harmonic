/**
 * Trinity Orchestrator Minimal
 * Lightweight version for single thoughts/ideas
 */

import type { PersonaKey } from "./persona/personas";
import { PERSONAS } from "./persona/personas";

export interface Thought {
  content: string;
  persona: PersonaKey;
  timestamp: Date;
  mood?: string;
}

/**
 * Generate a single thought from a persona
 */
export async function orchestrateThought(
  prompt: string,
  personaKey: PersonaKey
): Promise<Thought> {
  const persona = PERSONAS[personaKey];
  if (!persona) {
    throw new Error(`Persona "${personaKey}" not found`);
  }

  // In production, call Puter AI with persona system prompt
  const thought: Thought = {
    content: `${persona.name} thinking about "${prompt}": ...`,
    persona: personaKey,
    timestamp: new Date(),
    mood: persona.tone || "thoughtful",
  };

  return thought;
}

/**
 * Generate thoughts from multiple personas in parallel
 */
export async function orchestrateThoughts(
  prompt: string,
  personaKeys: PersonaKey[] = ["alba", "albi", "asi"]
): Promise<Thought[]> {
  const thoughts = await Promise.all(
    personaKeys.map((key) => orchestrateThought(prompt, key))
  );
  return thoughts;
}
