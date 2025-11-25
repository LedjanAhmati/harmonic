export type ContentType =
  | "emotional"
  | "analytical"
  | "decision"
  | "abstract"
  | "practical";

export type IntentType = "ask" | "debate" | "summarize" | "create" | "plan" | "critique";

export type CognitiveLoad = "low" | "medium" | "high";

export interface TaggerResult {
  contentType: ContentType;
  intent: IntentType;
  load: CognitiveLoad;
}

export function taggerModule(text: string): TaggerResult {
  const lower = text.toLowerCase();

  // Intent
  let intent: IntentType = "ask";
  if (/debate|debat|argu/i.test(lower)) intent = "debate";
  else if (/summary|përmbledh|summary|resumo/i.test(lower)) intent = "summarize";
  else if (/create|shkruaj|krijo/i.test(lower)) intent = "create";
  else if (/plan|planifiko/i.test(lower)) intent = "plan";
  else if (/critique|kritik/i.test(lower)) intent = "critique";
  else if (!lower.endsWith("?")) intent = "create";

  // Content type
  let contentType: ContentType = "analytical";
  if (/\b(ndjehem|emocion|frik|gëzim|trishtim|angth)\b/i.test(lower)) {
    contentType = "emotional";
  } else if (/\bvendim|duhet|zgjidhje|opsion\b/i.test(lower)) {
    contentType = "decision";
  } else if (/\bfilozof|kuptim|meaning|sense\b/i.test(lower)) {
    contentType = "abstract";
  } else if (/\bsi ta bëj|how to|hap pas hapi\b/i.test(lower)) {
    contentType = "practical";
  }

  // Cognitive load
  const length = text.length;
  let load: CognitiveLoad = "low";
  if (length > 200) load = "medium";
  if (length > 600) load = "high";

  return { contentType, intent, load };
}
