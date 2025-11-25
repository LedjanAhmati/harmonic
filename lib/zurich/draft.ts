import { InterpretationResult } from "./interpret";
import { ReasoningResult } from "./reason";
import { StrategyResult } from "./strategy";

export interface DraftResult {
  draft: string;
}

export function draftModule(
  prompt: string,
  interpretation: InterpretationResult,
  reasoning: ReasoningResult,
  strategy: StrategyResult
): DraftResult {
  const intro = `Po e marr si pikë nisjeje këtë kërkesë tënde: "${prompt.trim()}".`;

  const part1 = `🔹 Çfarë po kuptoj: ${reasoning.summary}`;

  const part2 =
    interpretation.coreMeanings.length > 0
      ? `🔹 Pikat kryesore që shfaqen: ${interpretation.coreMeanings.join(
          " | "
        )}.`
      : `🔹 Nuk ka shumë fjali të ndara, por ideja kryesore është e qartë.`;

  const part3 =
    interpretation.implicitSignals.length > 0
      ? `🔹 Nga nënteksti duket se: ${interpretation.implicitSignals.join(
          " | "
        )}.`
      : `🔹 Nuk ka sinjale shumë të forta të fshehura në tekst, kështu që përgjigjem direkt.`;

  let closing = "";
  switch (strategy.mode) {
    case "wisdom_tone":
      closing =
        "🔹 Si qasje, është më e dobishme të lëvizësh me hapa të vegjël, me kujdes ndaj vetes dhe me pak më shumë mirëkuptim për ritmin tënd.";
      break;
    case "analytical_breakdown":
      closing =
        "🔹 Hapi tjetër do të ishte të ndash problemin në nën-pjesë dhe t'i trajtosh një nga një, në vend që t'i mbash të gjitha në kokë njëherësh.";
      break;
    case "quick_intuition":
      closing =
        "🔹 Intuitivisht, duket më mirë të zgjedhësh një drejtim, ta testosh shpejt dhe të mësosh nga reagimi, sesa të presësh për momentin 'perfekt'.";
      break;
    case "practical_steps":
      closing =
        "🔹 Praktikisht, mund të fillosh duke caktuar 1–3 veprime konkrete për 24 orët e ardhshme, në vend që të mbingarkohesh me plan afatgjatë.";
      break;
    case "creative_expansion":
      closing =
        "🔹 Ndoshta ia vlen të eksplorosh disa alternativa në mënyrë lozonjare, pa presion, derisa njëra të ndjehet më 'e saktë' për ty.";
      break;
  }

  const draft = [intro, part1, part2, part3, closing].join("\n\n");

  return { draft };
}
