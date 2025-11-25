export interface InterpretationResult {
  coreMeanings: string[];
  implicitSignals: string[];
  conceptVars: string[];
}

export function interpretationModule(text: string): InterpretationResult {
  // naive split into sentences
  const sentences = text
    .split(/[.!?]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const coreMeanings = sentences.slice(0, 3);

  const implicitSignals: string[] = [];
  if (/\bfrik|ankth|stress\b/i.test(text)) {
    implicitSignals.push("Anxiety / stress present");
  }
  if (/\bduhet|must|need to\b/i.test(text)) {
    implicitSignals.push("Sense of obligation / pressure");
  }
  if (/\bnuk di|s' di|confus(e|ion)\b/i.test(text)) {
    implicitSignals.push("Perception of uncertainty / confusion");
  }

  const conceptVars: string[] = [];
  const words = Array.from(
    new Set(
      text
        .toLowerCase()
        .replace(/[^a-zA-ZëçËÇ0-9 ]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 4)
    )
  );
  conceptVars.push(...words.slice(0, 8));

  return { coreMeanings, implicitSignals, conceptVars };
}
