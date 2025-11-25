export type IntakeType = "question" | "topic" | "argument" | "other";

export interface IntakeResult {
  type: IntakeType;
  raw: string;
  clean: string;
}

export function intakeModule(prompt: string): IntakeResult {
  const raw = prompt ?? "";
  const clean = raw.trim();

  let type: IntakeType = "other";

  if (clean.endsWith("?")) {
    type = "question";
  } else if (clean.split(" ").length <= 4) {
    type = "topic";
  } else if (/\b(should|must|need to|duhet|duam)\b/i.test(clean)) {
    type = "argument";
  }

  return { type, raw, clean };
}
