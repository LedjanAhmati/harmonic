/**
 * AGEIM - Advanced Group Emotional Intelligence Model
 * Multi-persona reasoning engine with emotional and logical synthesis
 * 
 * Personas:
 * - Alba (Emotional/Creative)
 * - Albi (Logical/Analytical)
 * - Jona (Fast/Intuitive)
 * - Blerina (Wise/Balanced)
 * - ASI (Philosophical/Meta)
 */

export type PersonaStyle = 'emotional' | 'logical' | 'intuitive' | 'wise' | 'philosophical';

export interface PersonaThought {
  persona: string;
  style: PersonaStyle;
  content: string;
  confidence: number;
  reasoning: string;
  emotionalWeight?: number;
}

export interface DebateRound {
  round: number;
  topic: string;
  thoughts: PersonaThought[];
  consensus?: string;
  tensions?: string[];
}

export interface AgencyState {
  sessionId: string;
  topic: string;
  rounds: DebateRound[];
  currentRound: number;
  consensus: string;
  meta: {
    startTime: number;
    thoughtCount: number;
    synthesisAttempts: number;
  };
}

/**
 * Generate persona-specific thought process
 */
export function generatePersonaThought(
  persona: string,
  style: PersonaStyle,
  topic: string,
  context: string[]
): PersonaThought {
  const baseReasonings: Record<PersonaStyle, (topic: string, ctx: string[]) => string> = {
    emotional: (t, ctx) => `I feel this relates to human values and creative potential. ${ctx.join(', ')} suggest we should consider the emotional impact.`,
    logical: (t, ctx) => `Logically, we can break this down into components. Given ${ctx.join(', ')}, the analysis shows clear patterns.`,
    intuitive: (t, ctx) => `Quickly sensing the core issue: ${ctx.join(', ')} all point to the same fundamental challenge.`,
    wise: (t, ctx) => `Through experience and reflection, I observe that ${ctx.join(', ')} integrate into a larger wisdom about ${t}.`,
    philosophical: (t, ctx) => `Philosophically, this touches on questions of being and becoming. ${ctx.join(', ')} reveal deeper truths.`,
  };

  const reasoning = baseReasonings[style](topic, context);
  const content = generatePersonaContent(persona, topic, reasoning);
  
  return {
    persona,
    style,
    content,
    confidence: 0.7 + Math.random() * 0.3,
    reasoning,
    emotionalWeight: style === 'emotional' ? 0.8 : style === 'wise' ? 0.6 : 0.4,
  };
}

/**
 * Generate persona-specific response content
 */
function generatePersonaContent(persona: string, topic: string, reasoning: string): string {
  const personas: Record<string, string> = {
    alba: `🌸 Alba: ${reasoning} I imagine possibilities in "${topic}" that transcend the obvious.`,
    albi: `💙 Albi: ${reasoning} The facts about "${topic}" lead to these conclusions.`,
    jona: `⚡ Jona: ${reasoning} Bottom line on "${topic}": focus on what matters most.`,
    blerina: `🌟 Blerina: ${reasoning} Regarding "${topic}", wisdom suggests balance between all perspectives.`,
    asi: `🤖 ASI: ${reasoning} Meta-analysis of "${topic}" reveals structural patterns worth exploring.`,
  };

  return personas[persona.toLowerCase()] || `${persona}: ${reasoning}`;
}

/**
 * Synthesize multiple persona thoughts into consensus
 */
export function synthesizeConsensus(thoughts: PersonaThought[]): string {
  if (thoughts.length === 0) return "No thoughts to synthesize.";

  const emotionalWeight = thoughts
    .filter(t => t.style === 'emotional')
    .reduce((sum, t) => sum + (t.emotionalWeight || 0), 0);

  const logicalWeight = thoughts
    .filter(t => t.style === 'logical')
    .reduce((sum, t) => sum + t.confidence, 0);

  const wisdomWeight = thoughts
    .filter(t => t.style === 'wise')
    .reduce((sum, t) => sum + t.confidence, 0);

  const dominantStyle = [
    { style: 'emotional', weight: emotionalWeight },
    { style: 'logical', weight: logicalWeight },
    { style: 'wise', weight: wisdomWeight },
  ].sort((a, b) => b.weight - a.weight)[0];

  const consensusTemplates: Record<string, string> = {
    emotional: "The collective wisdom emphasizes the human and creative dimensions...",
    logical: "The analytical consensus focuses on measurable and systematic approaches...",
    wise: "Balancing all perspectives, the integrated view suggests...",
  };

  return consensusTemplates[dominantStyle.style] || "A multifaceted perspective emerges...";
}

/**
 * Identify tensions between personas
 */
export function identifyTensions(thoughts: PersonaThought[]): string[] {
  const tensions: string[] = [];

  const emotional = thoughts.find(t => t.style === 'emotional');
  const logical = thoughts.find(t => t.style === 'logical');

  if (emotional && logical) {
    tensions.push(
      `Tension: ${emotional.persona} emphasizes human values, while ${logical.persona} focuses on systematic analysis.`
    );
  }

  const intuitive = thoughts.find(t => t.style === 'intuitive');
  if (intuitive && logical) {
    tensions.push(
      `Tension: ${intuitive.persona} seeks rapid insight, while ${logical.persona} demands thorough examination.`
    );
  }

  return tensions;
}

/**
 * Run a complete debate round
 */
export async function runDebateRound(
  sessionId: string,
  topic: string,
  personas: string[],
  round: number
): Promise<DebateRound> {
  const thoughts: PersonaThought[] = [];
  const personaStyles: Record<string, PersonaStyle> = {
    alba: 'emotional',
    albi: 'logical',
    jona: 'intuitive',
    blerina: 'wise',
    asi: 'philosophical',
  };

  const context = [
    'multiple perspectives matter',
    'synthesis is key',
    'tension drives growth',
  ];

  for (const persona of personas) {
    const style = personaStyles[persona.toLowerCase()] || 'logical';
    const thought = generatePersonaThought(persona, style, topic, context);
    thoughts.push(thought);
  }

  const consensus = synthesizeConsensus(thoughts);
  const tensions = identifyTensions(thoughts);

  return {
    round,
    topic,
    thoughts,
    consensus,
    tensions,
  };
}

/**
 * Create new agency session
 */
export function createAgencySession(
  sessionId: string,
  topic: string
): AgencyState {
  return {
    sessionId,
    topic,
    rounds: [],
    currentRound: 0,
    consensus: '',
    meta: {
      startTime: Date.now(),
      thoughtCount: 0,
      synthesisAttempts: 0,
    },
  };
}
