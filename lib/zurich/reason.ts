import { InterpretationResult } from "./interpret";
import { TaggerResult } from "./tagger";

export interface ReasoningStep {
  name: string;
  note: string;
}

export interface ReasoningResult {
  steps: ReasoningStep[];
  summary: string;
}

export function reasoningModule(
  interpretation: InterpretationResult,
  tags: TaggerResult
): ReasoningResult {
  const steps: ReasoningStep[] = [];

  steps.push({
    name: "Frame",
    note: `The request seems to be of type "${tags.contentType}" with intent "${tags.intent}".`,
  });

  steps.push({
    name: "Decompose",
    note: `Core meanings identified: ${interpretation.coreMeanings.join(" | ") || "none"}.`,
  });

  steps.push({
    name: "Connect",
    note:
      interpretation.implicitSignals.length > 0
        ? `Implicit signals: ${interpretation.implicitSignals.join(" | ")}.`
        : "No strong implicit signals detected.",
  });

  const complexityNote =
    tags.load === "high"
      ? "The problem seems complex and may require stepwise explanation."
      : tags.load === "medium"
      ? "Medium complexity, explanation should be structured but concise."
      : "Low complexity, short and direct answer is enough.";

  steps.push({
    name: "Evaluate",
    note: complexityNote,
  });

  const summary = `The prompt is an ${tags.contentType} input with intent "${tags.intent}", focusing on ${interpretation.conceptVars
    .slice(0, 3)
    .join(", ") || "general ideas"}.`;

  steps.push({
    name: "Synthesize",
    note: summary,
  });

  return { steps, summary };
}
