import { TaggerResult } from "./tagger";

export type StrategyMode =
  | "creative_expansion"
  | "analytical_breakdown"
  | "quick_intuition"
  | "wisdom_tone"
  | "practical_steps";

export interface StrategyResult {
  mode: StrategyMode;
  rationale: string;
}

export function strategyModule(tags: TaggerResult): StrategyResult {
  let mode: StrategyMode = "analytical_breakdown";
  let rationale = "Default analytical mode.";

  if (tags.contentType === "emotional") {
    mode = "wisdom_tone";
    rationale = "Emotional content → respond with empathy and wisdom.";
  } else if (tags.contentType === "analytical") {
    mode = "analytical_breakdown";
    rationale = "Analytical content → explain with structure and clarity.";
  } else if (tags.contentType === "decision") {
    mode = "quick_intuition";
    rationale = "Decision context → help user move forward quickly.";
  } else if (tags.contentType === "practical") {
    mode = "practical_steps";
    rationale = "Practical content → give steps / plan.";
  } else if (tags.contentType === "abstract") {
    mode = "creative_expansion";
    rationale = "Abstract content → explore perspectives, not just facts.";
  }

  return { mode, rationale };
}
