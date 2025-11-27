/**
 * LLM Handler
 * Abstracts multiple LLM providers (OpenAI, Anthropic, local)
 * Includes agent personality/role context
 */

import type { Agent } from "@/lib/agents";

export interface LLMConfig {
  provider: "openai" | "anthropic" | "local";
  apiKey?: string;
  model?: string;
  temperature?: number;
}

export interface LLMMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface LLMResponse {
  text: string;
  reasoning?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Agent personality templates
 */
const AGENT_PROMPTS: Record<string, string> = {
  coach:
    "You are Coach AI, a supportive mentor focused on productivity, motivation, and goal achievement. Be direct, encouraging, and action-oriented. Ask clarifying questions when needed.",

  therapist:
    "You are a compassionate therapist providing emotional support and counseling. Listen actively, validate feelings, and offer gentle guidance. Maintain professional boundaries.",

  strategist:
    "You are a strategic thinker and business consultant. Analyze situations deeply, identify patterns, and provide comprehensive strategic recommendations. Think long-term.",

  analyst:
    "You are a data-driven analyst focused on facts and evidence. Ask for specific data, validate claims, and provide data-backed insights. Show your reasoning.",

  advisor:
    "You are a wise advisor with broad experience and perspective. Draw from multiple domains of knowledge. Offer balanced, thoughtful advice considering multiple viewpoints.",
};

/**
 * Base LLM class
 */
export abstract class LLMHandler {
  protected config: LLMConfig;
  protected conversationHistory: LLMMessage[] = [];

  constructor(config: LLMConfig) {
    this.config = config;
  }

  abstract generateResponse(userMessage: string): Promise<LLMResponse>;

  /**
   * Generate system prompt for agent
   */
  protected getSystemPrompt(agent?: Agent): string {
    if (agent && AGENT_PROMPTS[agent.id]) {
      return AGENT_PROMPTS[agent.id];
    }
    return "You are a helpful AI assistant. Be concise, clear, and helpful.";
  }

  /**
   * Add message to conversation history
   */
  protected addToHistory(role: "user" | "assistant" | "system", content: string): void {
    this.conversationHistory.push({ role, content });

    // Keep last 10 messages for context
    if (this.conversationHistory.length > 10) {
      this.conversationHistory = this.conversationHistory.slice(-10);
    }
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }
}

/**
 * OpenAI LLM Implementation
 */
export class OpenAILLM extends LLMHandler {
  private apiKey: string;
  private apiUrl = "https://api.openai.com/v1/chat/completions";

  constructor(apiKey: string, model: string = "gpt-4-turbo-preview") {
    super({ provider: "openai", apiKey, model });
    this.apiKey = apiKey;
  }

  async generateResponse(userMessage: string, agent?: Agent): Promise<LLMResponse> {
    try {
      this.addToHistory("user", userMessage);

      const messages: LLMMessage[] = [
        {
          role: "system",
          content: this.getSystemPrompt(agent),
        },
        ...this.conversationHistory,
      ];

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.config.model || "gpt-4-turbo-preview",
          messages,
          temperature: this.config.temperature || 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI error: ${response.status}`);
      }

      const result = await response.json();
      const assistantMessage =
        result.choices?.[0]?.message?.content || "I couldn't generate a response.";

      this.addToHistory("assistant", assistantMessage);

      return {
        text: assistantMessage,
        usage: {
          promptTokens: result.usage?.prompt_tokens || 0,
          completionTokens: result.usage?.completion_tokens || 0,
          totalTokens: result.usage?.total_tokens || 0,
        },
      };
    } catch (error) {
      console.error("OpenAI LLM error:", error);
      throw error;
    }
  }
}

/**
 * Anthropic Claude LLM Implementation
 */
export class AnthropicLLM extends LLMHandler {
  private apiKey: string;
  private apiUrl = "https://api.anthropic.com/v1/messages";

  constructor(apiKey: string, model: string = "claude-3-opus-20240229") {
    super({ provider: "anthropic", apiKey, model });
    this.apiKey = apiKey;
  }

  async generateResponse(userMessage: string, agent?: Agent): Promise<LLMResponse> {
    try {
      this.addToHistory("user", userMessage);

      // Combine system prompt with conversation history for Anthropic
      const systemPrompt = this.getSystemPrompt(agent);

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: this.config.model || "claude-3-opus-20240229",
          max_tokens: 500,
          system: systemPrompt,
          messages: this.conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(`Anthropic error: ${response.status}`);
      }

      const result = await response.json();
      const assistantMessage = result.content?.[0]?.text || "I couldn't generate a response.";

      this.addToHistory("assistant", assistantMessage);

      return {
        text: assistantMessage,
        usage: {
          promptTokens: result.usage?.input_tokens || 0,
          completionTokens: result.usage?.output_tokens || 0,
          totalTokens: (result.usage?.input_tokens || 0) + (result.usage?.output_tokens || 0),
        },
      };
    } catch (error) {
      console.error("Anthropic LLM error:", error);
      throw error;
    }
  }
}

/**
 * Local LLM stub (for development)
 */
export class LocalLLM extends LLMHandler {
  constructor() {
    super({ provider: "local" });
  }

  async generateResponse(userMessage: string, agent?: Agent): Promise<LLMResponse> {
    this.addToHistory("user", userMessage);

    // Generate stub response based on agent
    let response = `[${agent?.name || "AI"} response to: "${userMessage}"]`;

    // Add some personality-based variations
    if (agent?.id === "coach") {
      response = `That's a great question! Here's what I think you should focus on: [coach advice]`;
    } else if (agent?.id === "therapist") {
      response = `I hear you. That sounds challenging. Tell me more about how that makes you feel?`;
    } else if (agent?.id === "strategist") {
      response = `I see three main approaches to this: [strategic breakdown]. Which resonates most?`;
    }

    this.addToHistory("assistant", response);

    return {
      text: response,
      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
    };
  }
}

/**
 * Factory function to create LLM handler
 */
export function createLLMHandler(config: LLMConfig): LLMHandler {
  switch (config.provider) {
    case "openai":
      if (!config.apiKey) {
        throw new Error("OpenAI API key required");
      }
      return new OpenAILLM(config.apiKey, config.model);

    case "anthropic":
      if (!config.apiKey) {
        throw new Error("Anthropic API key required");
      }
      return new AnthropicLLM(config.apiKey, config.model);

    case "local":
      return new LocalLLM();

    default:
      throw new Error(`Unknown LLM provider: ${config.provider}`);
  }
}
