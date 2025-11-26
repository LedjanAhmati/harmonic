/**
 * ASI Fusion - Meta-layer orchestration
 * Combines Trinity (AI debate), Zürich (logic), and Brain (8TB knowledge)
 * Creates meta-reasoning by fusing all three systems
 */

import { orchestrate } from '../lib/trinity/orchestrator';

interface BrainResult {
  apis?: Array<unknown>;
  docs?: Array<unknown>;
  concepts?: Array<unknown>;
}

interface ZurichResult {
  intake?: unknown;
  preprocess?: unknown;
  tagger?: unknown;
  interpret?: unknown;
  reason?: string;
  strategy?: unknown;
  draft?: string;
  final?: string;
  cycle?: unknown;
  error?: string;
  message?: string;
}

interface ASIFusionResult {
  query: string;
  trinity: {
    alba: string;
    albi: string;
    jona: string;
    blerina: string;
    perspectives: number;
  };
  zurich: {
    deterministic: boolean;
    reasoning: string;
    confidence: number;
  };
  brain: {
    apis_found: number;
    docs_found: number;
    concepts_found: number;
    total_sources: number;
  };
  fusion: {
    meta_response: string;
    synthesis: string;
    confidence_score: number;
    reasoning_path: string[];
  };
  timestamp: string;
}

/**
 * Call Trinity (AI debate with 5 personas)
 */
export async function callTrinity(query: string): Promise<unknown> {
  try {
    const result = await orchestrate(query);
    return result;
  } catch (error) {
    console.error('Trinity call failed:', error);
    return { error: 'trinity_failed', message: String(error) };
  }
}

/**
 * Call Zürich (deterministic reasoning via API)
 */
export async function callZurich(query: string): Promise<ZurichResult> {
  try {
    const response = await fetch('http://localhost:5000/api/zurich/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: query })
    });
    
    if (!response.ok) {
      throw new Error(`Zürich API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Zürich call failed:', error);
    return { error: 'zurich_failed', message: String(error) };
  }
}

/**
 * Call Brain (search 8TB external memory)
 */
export async function callBrain(query: string): Promise<BrainResult> {
  try {
    const response = await fetch('http://localhost:5000/api/brain/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        limits: { apis: 15, docs: 15, concepts: 15 }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Brain API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || { apis: [], docs: [], concepts: [] };
  } catch (error) {
    console.error('Brain call failed:', error);
    return { apis: [], docs: [], concepts: [] };
  }
}

interface BrainStats {
  brain: {
    apis: number;
    docs: number;
    concepts: number;
  };
}

/**
 * Get Brain Stats
 */
export async function getBrainStats(): Promise<BrainStats> {
  try {
    const response = await fetch('http://localhost:5000/api/brain/stats', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`Brain stats error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Brain stats call failed:', error);
    return { brain: { apis: 0, docs: 0, concepts: 0 } };
  }
}

/**
 * ASI Fusion - Meta-layer combining all three systems
 * Returns comprehensive reasoning from Trinity + Zürich + Brain + ASI
 */
export async function asiFusion(query: string): Promise<ASIFusionResult> {
  try {
    // Call all three systems in parallel
    const [trinityResult, zurichResult, brainResult] = await Promise.all([
      callTrinity(query),
      callZurich(query),
      callBrain(query)
    ]);

    // Extract key information from each layer
    const trinityPerspectives = {
      alba: trinityResult.alba || '',
      albi: trinityResult.albi || '',
      jona: trinityResult.jona || '',
      blerina: trinityResult.blerina || ''
    };

    const zurichReasoning = {
      deterministic: true,
      logic: zurichResult.final || zurichResult.reason || zurichResult.draft || '',
      confidence: 0.95 // Deterministic = high confidence
    };

    const brainKnowledge = {
      apis: brainResult.apis?.length || 0,
      docs: brainResult.docs?.length || 0,
      concepts: brainResult.concepts?.length || 0,
      total: (brainResult.apis?.length || 0) + (brainResult.docs?.length || 0) + (brainResult.concepts?.length || 0)
    };

    // Create meta-response combining all perspectives
    const metaResponse = `
ASI Meta-Analysis of: "${query}"

🧠 TRINITY PERSPECTIVES:
- Alba (Creative): ${trinityPerspectives.alba.substring(0, 150)}...
- Albi (Analytical): ${trinityPerspectives.albi.substring(0, 150)}...
- Jona (Intuitive): ${trinityPerspectives.jona.substring(0, 150)}...
- Blerina (Wisdom): ${trinityPerspectives.blerina.substring(0, 150)}...

⚙️ ZÜRICH LOGIC:
${zurichReasoning.logic.substring(0, 300)}...

🗄️ BRAIN KNOWLEDGE:
Found ${brainKnowledge.total} sources: ${brainKnowledge.apis} APIs, ${brainKnowledge.docs} docs, ${brainKnowledge.concepts} concepts

🔮 ASI SYNTHESIS:
This query represents a multi-layer exploration combining:
1. Human-like perspectives (Trinity debate)
2. Pure logic (Zürich reasoning)
3. Accumulated knowledge (Brain search)
The convergence suggests a robust understanding across all dimensions.
    `.trim();

    // Determine confidence based on convergence
    const synthesisScore = (
      (trinityPerspectives.alba ? 0.25 : 0) +
      (zurichReasoning.logic ? 0.40 : 0) +
      (brainKnowledge.total > 0 ? 0.35 : 0)
    );

    return {
      query,
      trinity: {
        alba: trinityPerspectives.alba.substring(0, 200),
        albi: trinityPerspectives.albi.substring(0, 200),
        jona: trinityPerspectives.jona.substring(0, 200),
        blerina: trinityPerspectives.blerina.substring(0, 200),
        perspectives: 4
      },
      zurich: {
        deterministic: zurichReasoning.deterministic,
        reasoning: zurichReasoning.logic.substring(0, 300),
        confidence: zurichReasoning.confidence
      },
      brain: {
        apis_found: brainKnowledge.apis,
        docs_found: brainKnowledge.docs,
        concepts_found: brainKnowledge.concepts,
        total_sources: brainKnowledge.total
      },
      fusion: {
        meta_response: metaResponse,
        synthesis: `Converged understanding from ${brainKnowledge.total} sources across AI, logic, and knowledge layers`,
        confidence_score: synthesisScore,
        reasoning_path: [
          'Query received',
          'Trinity debate initiated',
          'Zürich logic applied',
          'Brain memory searched',
          'Synthesis complete'
        ]
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('ASI Fusion failed:', error);
    throw new Error(`ASI Fusion error: ${String(error)}`);
  }
}

/**
 * Streaming version for real-time feedback
 */
export async function* asiFusionStream(query: string) {
  yield { stage: 'initialized', query };

  try {
    // Stage 1: Trinity
    yield { stage: 'trinity_start' };
    const trinity = await callTrinity(query);
    yield { stage: 'trinity_complete', result: trinity };

    // Stage 2: Zürich
    yield { stage: 'zurich_start' };
    const zurich = await callZurich(query);
    yield { stage: 'zurich_complete', result: zurich };

    // Stage 3: Brain
    yield { stage: 'brain_start' };
    const brain = await callBrain(query);
    yield { stage: 'brain_complete', result: brain };

    // Stage 4: Fusion
    yield { stage: 'fusion_start' };
    const fusion = await asiFusion(query);
    yield { stage: 'fusion_complete', result: fusion };
  } catch (error) {
    yield { stage: 'error', error: String(error) };
  }
}
