/**
 * List of AI agents/personas available in video rooms
 * Each agent can be spawned as a participant with audio/video capabilities
 */
export interface Agent {
  id: string;
  name: string;
  emoji: string;
  description: string;
  role: "coach" | "therapist" | "strategist" | "analyst" | "advisor";
}

export const AGENTS: Agent[] = [
  {
    id: "coach",
    name: "Coach AI",
    emoji: "🏆",
    description: "Mentor produktiviteti & fokus. Të ndihmon të arrish qëllimet.",
    role: "coach",
  },
  {
    id: "therapist",
    name: "Calm Therapist",
    emoji: "🧠",
    description: "Mbështetje emocionale e butë. I dëgjon & të qetëson.",
    role: "therapist",
  },
  {
    id: "strategist",
    name: "Strategist",
    emoji: "🎯",
    description: "Planifikim & vendimmarrje. Analizon situatën thellësisht.",
    role: "strategist",
  },
  {
    id: "analyst",
    name: "Data Analyst",
    emoji: "📊",
    description: "Analiza të thella bazuar në fakte. Prova & statistika.",
    role: "analyst",
  },
  {
    id: "advisor",
    name: "Wise Advisor",
    emoji: "🧙",
    description: "Këshilla të zgjuar nga përvoja. Perspektiva holistike.",
    role: "advisor",
  },
];

export function getAgent(agentId: string): Agent | undefined {
  return AGENTS.find((a) => a.id === agentId);
}

export function getAllAgents(): Agent[] {
  return AGENTS;
}
