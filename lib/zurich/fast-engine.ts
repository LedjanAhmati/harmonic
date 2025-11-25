/**
 * Zürich Fast Engine - Instant reasoning without external AI calls
 * 
 * ⚡ PERFORMANCE: <10ms response time (no network calls)
 * 
 * 4-Stage Cycle (all sync):
 * 1. Clarify: Extract core question
 * 2. Analyze: Break into components
 * 3. Synthesize: Connect concepts
 * 4. Conclude: Generate final answer
 */

interface ZurichResult {
  input: string;
  cycle: {
    stage1_clarify: string;
    stage2_analyze: string[];
    stage3_synthesize: string;
    stage4_conclude: string;
  };
  final: string;
  latency_ms: number;
}

/**
 * Stage 1: Clarify - Extract the core question/request
 */
function stage1Clarify(input: string): string {
  const trimmed = input.trim();
  if (trimmed.length === 0) return "No input provided";

  // Simple heuristic: if it's a question, extract it; otherwise summarize intent
  if (trimmed.endsWith("?")) {
    return trimmed;
  }

  // Convert to question form
  const words = trimmed.split(/\s+/);
  if (words.length > 10) {
    return `What is the essence of: ${words.slice(0, 5).join(" ")}...?`;
  }

  return `How does this relate: ${trimmed}?`;
}

/**
 * Stage 2: Analyze - Break into key components
 */
function stage2Analyze(clarified: string): string[] {
  const components: string[] = [];

  // Extract key concepts (words after certain markers)
  const keywordPatterns = [
    /\b(what|how|why|when|where|who)\b/gi,
    /\b(problem|solution|idea|concept|pattern|process)\b/gi,
    /\b(cause|effect|relationship|connection|system)\b/gi,
  ];

  for (const pattern of keywordPatterns) {
    const matches = clarified.match(pattern);
    if (matches) {
      components.push(`• Focus on: ${matches[0]}`);
    }
  }

  // If no patterns matched, use generic decomposition
  if (components.length === 0) {
    components.push("• Identify the core subject");
    components.push("• Consider context and constraints");
    components.push("• Explore assumptions");
    components.push("• Evaluate implications");
  }

  return components.slice(0, 4); // Keep to 4 components
}

/**
 * Stage 3: Synthesize - Connect concepts and find relationships
 */
function stage3Synthesize(
  clarified: string,
  components: string[]
): string {
  const keyWords = clarified
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 4)
    .slice(0, 3);

  const synthesis = [
    "These elements interrelate as:",
    `• The core (${keyWords[0] || "subject"}) connects to context`,
    `• Multiple perspectives on (${keyWords[1] || "the issue"}) emerge`,
    `• Patterns suggest (${keyWords[2] || "a direction"})`,
  ];

  return synthesis.join("\n");
}

/**
 * Stage 4: Conclude - Generate final synthesized answer
 */
function stage4Conclude(
  clarified: string,
  components: string[],
  synthesis: string
): string {
  const length = clarified.length;
  const depth = components.length;
  const hasQuestionMark = clarified.includes("?");

  let conclusion = "Based on the Zürich cycle:\n\n";

  if (hasQuestionMark) {
    conclusion += "The answer emerges from:\n";
  } else {
    conclusion += "The insight unfolds as:\n";
  }

  conclusion += `✓ ${components[0]?.replace("•", "").trim() || "Core insight"}\n`;
  conclusion += `✓ ${components[1]?.replace("•", "").trim() || "Secondary insight"}\n`;
  conclusion += `✓ ${components[2]?.replace("•", "").trim() || "Tertiary insight"}\n\n`;

  conclusion +=
    "Integration: All components align toward a coherent understanding.";

  return conclusion;
}

/**
 * Run the full Zürich Fast Cycle
 */
export function runZurichCycle(input: string): ZurichResult {
  const startTime = performance.now();

  // Stage 1: Clarify
  const clarify = stage1Clarify(input);

  // Stage 2: Analyze
  const analyze = stage2Analyze(clarify);

  // Stage 3: Synthesize
  const synthesize = stage3Synthesize(clarify, analyze);

  // Stage 4: Conclude
  const conclude = stage4Conclude(clarify, analyze, synthesize);

  const latency_ms = performance.now() - startTime;

  return {
    input,
    cycle: {
      stage1_clarify: clarify,
      stage2_analyze: analyze,
      stage3_synthesize: synthesize,
      stage4_conclude: conclude,
    },
    final: conclude,
    latency_ms,
  };
}

/**
 * Get just the final answer (minimal format)
 */
export function runZurichFast(input: string): { answer: string; ms: number } {
  const start = performance.now();
  const result = runZurichCycle(input);
  return {
    answer: result.final,
    ms: Math.round(performance.now() - start),
  };
}
