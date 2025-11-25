import { intakeModule } from "./intake";
import { preprocessModule } from "./preprocess";
import { taggerModule } from "./tagger";
import { interpretationModule } from "./interpret";
import { reasoningModule } from "./reason";
import { strategyModule } from "./strategy";
import { draftModule } from "./draft";
import { finalModule } from "./final";

export interface ZurichCycleResult {
  final: string;
  debug: Record<string, any>;
  cycle: string;
}

export function runZurichCycle(prompt: string): ZurichCycleResult {
  const intake = intakeModule(prompt);
  const pre = preprocessModule(intake.clean);
  const tags = taggerModule(pre.normalized);
  const interpretation = interpretationModule(pre.normalized);
  const reasoning = reasoningModule(interpretation, tags);
  const strategy = strategyModule(tags);
  const draft = draftModule(pre.normalized, interpretation, reasoning, strategy);
  const final = finalModule(draft, strategy);

  return {
    final: final.final,
    cycle: "Zurich-9",
    debug: {
      intake,
      pre,
      tags,
      interpretation,
      reasoning,
      strategy,
      draft,
    },
  };
}
