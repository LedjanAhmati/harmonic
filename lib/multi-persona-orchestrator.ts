/**
 * Multi-Persona Orchestrator
 * 
 * Orchestrates concurrent responses from multiple personas.
 * When user sends a message, ALL active personas respond simultaneously.
 * Responses stream in real-time as they arrive.
 */

export interface PersonaResponse {
  personaId: string;
  personaName: string;
  emoji: string;
  response: string;
  latency: number;
  timestamp: number;
  status: "loading" | "complete" | "error";
  error?: string;
}

export interface OrchestratorResult {
  messageId: string;
  userMessage: string;
  personasRequested: string[];
  responses: PersonaResponse[];
  totalLatency: number;
  completedAt: number;
  conversationId: string;
}

/**
 * Call a single persona API and get response
 */
async function callPersona(
  personaId: string,
  personaName: string,
  emoji: string,
  userMessage: string,
  conversationId: string
): Promise<PersonaResponse> {
  const startTime = Date.now();

  try {
    const response = await fetch("/api/think", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: userMessage,
        persona: personaId,
        conversationId,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const latency = Date.now() - startTime;

    return {
      personaId,
      personaName,
      emoji,
      response: data.text || data.response || "",
      latency,
      timestamp: Date.now(),
      status: "complete",
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    return {
      personaId,
      personaName,
      emoji,
      response: "",
      latency,
      timestamp: Date.now(),
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Main orchestrator function
 * Calls multiple personas in parallel and returns all responses
 */
export async function orchestrateMultiPersona(
  userMessage: string,
  activePersonas: string[],
  personaMetadata: Record<string, { name: string; emoji: string }>,
  conversationId: string = "default",
  onProgressUpdate?: (response: PersonaResponse) => void
): Promise<OrchestratorResult> {
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();

  // Create persona call promises
  const personaPromises = activePersonas.map((personaId) => {
    const metadata = personaMetadata[personaId] || {
      name: personaId,
      emoji: "🤖",
    };

    return callPersona(
      personaId,
      metadata.name,
      metadata.emoji,
      userMessage,
      conversationId
    );
  });

  // Race conditions - as each persona responds, call the progress callback
  const responses: PersonaResponse[] = [];
  const allPromises = personaPromises.map((promise) =>
    promise.then((response) => {
      responses.push(response);
      if (onProgressUpdate) {
        onProgressUpdate(response);
      }
      return response;
    })
  );

  // Wait for all personas to respond
  await Promise.all(allPromises);

  const totalLatency = Date.now() - startTime;

  return {
    messageId,
    userMessage,
    personasRequested: activePersonas,
    responses: responses.sort((a, b) => a.timestamp - b.timestamp), // Sort by response time
    totalLatency,
    completedAt: Date.now(),
    conversationId,
  };
}

/**
 * Stream version - useful for real-time UI updates
 * Yields responses as they arrive
 */
export async function* orchestrateMultiPersonaStream(
  userMessage: string,
  activePersonas: string[],
  personaMetadata: Record<string, { name: string; emoji: string }>,
  conversationId: string = "default"
) {
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();

  // Create persona call promises
  const personaPromises = activePersonas.map((personaId) => {
    const metadata = personaMetadata[personaId] || {
      name: personaId,
      emoji: "🤖",
    };

    return callPersona(
      personaId,
      metadata.name,
      metadata.emoji,
      userMessage,
      conversationId
    ).then((response) => ({
      ...response,
      messageId,
    }));
  });

  // Yield responses as they complete (race condition)
  const promises = personaPromises.map((p, i) =>
    p.then((result) => ({ result, index: i }))
  );

  let completed = 0;
  while (completed < promises.length) {
    const { result } = await Promise.race(
      promises.splice(0, 1).map((p) =>
        p.catch(() => ({ result: null, index: -1 }))
      )
    );

    if (result) {
      yield result;
      completed++;
    }
  }

  yield {
    type: "complete",
    messageId,
    totalLatency: Date.now() - startTime,
    conversationId,
  };
}

/**
 * Helper to format persona metadata from active participants
 */
export function buildPersonaMetadata(
  activePersonas: string[],
  allPersonasData: Array<{ id: string; name: string; emoji: string }>
): Record<string, { name: string; emoji: string }> {
  const metadata: Record<string, { name: string; emoji: string }> = {};

  activePersonas.forEach((id) => {
    const persona = allPersonasData.find((p) => p.id === id);
    if (persona) {
      metadata[id] = {
        name: persona.name,
        emoji: persona.emoji,
      };
    }
  });

  return metadata;
}

/**
 * Format results for display
 */
export function formatOrchestratorResults(
  result: OrchestratorResult
): {
  summary: string;
  responses: Array<{
    persona: string;
    response: string;
    latency: string;
    status: string;
  }>;
  stats: {
    totalResponses: number;
    successCount: number;
    errorCount: number;
    averageLatency: number;
    totalLatency: number;
  };
} {
  const successCount = result.responses.filter(
    (r) => r.status === "complete"
  ).length;
  const errorCount = result.responses.filter((r) => r.status === "error").length;
  const avgLatency =
    result.responses.length > 0
      ? Math.round(
          result.responses.reduce((sum, r) => sum + r.latency, 0) /
            result.responses.length
        )
      : 0;

  return {
    summary: `${successCount}/${result.responses.length} personas responded in ${result.totalLatency}ms`,
    responses: result.responses.map((r) => ({
      persona: `${r.emoji} ${r.personaName}`,
      response: r.response,
      latency: `${r.latency}ms`,
      status: r.status === "error" ? `Error: ${r.error}` : "✓",
    })),
    stats: {
      totalResponses: result.responses.length,
      successCount,
      errorCount,
      averageLatency: avgLatency,
      totalLatency: result.totalLatency,
    },
  };
}
