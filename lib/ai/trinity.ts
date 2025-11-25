/**
 * Trinity AI Module
 * Main export for AI functionality
 */

export { orchestrate } from "../trinity/orchestrator";

export {
  orchestrateThought,
  orchestrateThoughts,
} from "../trinity/orchestrator-minimal";
export type { Thought } from "../trinity/orchestrator-minimal";

export {
  createSession,
  pushMessage,
  getSession,
  updateSession,
  listSessions,
  clearSession,
} from "../trinity/memory-db";

/**
 * AI class - main entry point
 */
export class AI {
  static async brainstorm(topic: string) {
    return {
      topic,
      ideas: ["Idea 1", "Idea 2", "Idea 3"],
      timestamp: new Date(),
    };
  }

  static async debate(topic: string, personas: string[] = []) {
    return {
      topic,
      personas,
      message: "Debate initialized",
    };
  }

  static async think(prompt: string) {
    return {
      prompt,
      thought: "Thought generated",
    };
  }
}
