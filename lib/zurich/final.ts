import { DraftResult } from "./draft";
import { StrategyResult } from "./strategy";

export interface FinalResult {
  final: string;
}

export function finalModule(
  draft: DraftResult,
  strategy: StrategyResult
): FinalResult {
  const header = `🎼 Harmonic Zürich Response (${strategy.mode})\n`;

  return {
    final: `${header}\n${draft.draft}`,
  };
}
