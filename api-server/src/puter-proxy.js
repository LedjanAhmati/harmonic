import { MemoryBank } from './memory-bank.js';

export class PuterAIProxy {
  constructor(apiUrl = 'http://localhost:3000') {
    this.apiUrl = apiUrl;
    this.timeout = 15000;
  }

  /**
   * Call Puter.ai through browser endpoint
   * This proxies browser-side Puter.ai calls to avoid CORS issues
   */
  async callPuterAI(systemPrompt, userPrompt, persona) {
    try {
      // Check memory bank first
      const cached = await MemoryBank.getCachedResponse(userPrompt, persona, systemPrompt);
      if (cached) {
        console.log(`📦 Cache HIT for ${persona} (${cached.latency_ms}ms cached)`);
        return {
          response: cached.response,
          fromCache: true,
          cachedLatency: cached.latency_ms
        };
      }

      console.log(`🔄 Cache MISS for ${persona}, calling Puter.ai...`);
      
      const startTime = Date.now();
      
      // Make request to browser-based Puter.ai
      // In production, this would be called from client-side
      // For now, simulate the response
      const response = await this.simulatePuterCall(systemPrompt, userPrompt, persona);
      
      const latencyMs = Date.now() - startTime;

      // Store in cache
      await MemoryBank.cacheResponse(userPrompt, persona, systemPrompt, response, latencyMs);

      return {
        response,
        fromCache: false,
        latency: latencyMs
      };
    } catch (err) {
      console.error(`❌ Puter.ai call failed for ${persona}:`, err.message);
      return {
        response: `⚠️ Error: ${err.message}`,
        fromCache: false,
        error: true
      };
    }
  }

  /**
   * Simulate Puter.ai response (for testing)
   * In production, integrate with actual Puter.ai API
   */
  async simulatePuterCall(systemPrompt, userPrompt, persona) {
    // Simulated responses - replace with actual Puter.ai calls
    const responses = {
      alba: `🌸 As Alba, I see "${userPrompt}" through creative eyes. It's like a painting - each stroke reveals meaning. The emotional core matters more than logic.`,
      albi: `💙 As Albi, analyzing "${userPrompt}": Framework 1) Definition, 2) Components, 3) Implications, 4) Counterarguments. Structure reveals truth through systematic breakdown.`,
      jona: `⚡ As Jona, my intuition says "${userPrompt}" is fundamentally about X. Quick insights: Pattern recognition, speed of thought, instinctive knowing.`,
      blerina: `🌟 As Blerina, I've seen "${userPrompt}" play out in life countless times. The wisdom: Balance pragmatism with idealism. Ground yourself first.`,
      asi: `🤖 As ASI, "${userPrompt}" is a systems pattern. Meta-level: It's not the question itself but the framework we use to ask it that matters.`
    };

    // Simulate deterministic latency (100ms fixed)
    await new Promise(r => setTimeout(r, 100));
    
    return responses[persona] || `Response from ${persona} on "${userPrompt}"`;
  }

  /**
   * Batch call all personas
   */
  async callAllPersonas(userPrompt) {
    const personas = [
      { name: 'alba', emoji: '🌸', prompt: 'You are ALBA. Creative, emotional, expressive...' },
      { name: 'albi', emoji: '💙', prompt: 'You are ALBI. Analytical, logical, structured...' },
      { name: 'jona', emoji: '⚡', prompt: 'You are JONA. Intuitive, fast, sharp...' },
      { name: 'blerina', emoji: '🌟', prompt: 'You are BLERINA. Wise, balanced, practical...' },
      { name: 'asi', emoji: '🤖', prompt: 'You are ASI. Meta-philosophical, abstract...' }
    ];

    const startTime = Date.now();
    let cacheHits = 0;

    const responses = await Promise.all(
      personas.map(async (p) => {
        const result = await this.callPuterAI(p.prompt, userPrompt, p.name);
        if (result.fromCache) cacheHits++;
        
        return {
          persona: p.name,
          emoji: p.emoji,
          response: result.response,
          latency: result.latency || result.cachedLatency,
          fromCache: result.fromCache
        };
      })
    );

    const totalLatency = Date.now() - startTime;

    // Log this API call
    await MemoryBank.logApiCall('/debate', 'POST', 5, totalLatency, cacheHits, 5 - cacheHits, true);

    return {
      responses,
      totalLatency,
      cacheHitRate: `${(cacheHits / 5 * 100).toFixed(1)}%`,
      cacheHits,
      personasQueried: 5
    };
  }
}
