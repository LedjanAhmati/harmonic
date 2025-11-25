/**
 * ALBI - Artificial Laborator Born Intelligence
 * Memory Management Module
 * 
 * Personality: Pragmatic, efficient, organized
 * Role: Organizes and retrieves information from Alba, manages knowledge lifecycle
 * Mission: Keep memory organized, accessible, and growing efficiently
 */

class Albi {
  constructor() {
    this.name = "Albi";
    this.emoji = "🧠";
    this.personality = "pragmatic";
    
    // Memory organization by domain
    this.memory = {
      science: new Map(),
      medicine: new Map(),
      technology: new Map(),
      nature: new Map(),
      security: new Map(),
      documentation: new Map(),
    };

    // Index for fast lookup
    this.index = new Map();

    // Growth tracking
    this.stats = {
      totalItems: 0,
      byDomain: {},
      accessCount: 0,
      avgAccessTime: 0,
      lastGrowth: null,
    };

    // Initialize domain stats
    Object.keys(this.memory).forEach((domain) => {
      this.stats.byDomain[domain] = 0;
    });
  }

  /**
   * Store information from Alba with automatic categorization
   */
  store(item, domain = "documentation") {
    try {
      if (!this.memory[domain]) {
        domain = "documentation"; // fallback
      }

      const id = `${domain}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const stored = {
        id,
        domain,
        item,
        storedAt: new Date(),
        accessCount: 0,
        tags: this.extractTags(item),
      };

      // Store in domain-specific memory
      this.memory[domain].set(id, stored);

      // Index for fast search
      stored.tags.forEach((tag) => {
        if (!this.index.has(tag)) {
          this.index.set(tag, []);
        }
        this.index.get(tag).push(id);
      });

      // Update stats
      this.stats.totalItems++;
      this.stats.byDomain[domain]++;
      this.stats.lastGrowth = new Date();

      return {
        success: true,
        id,
        message: `${this.emoji} Stored "${item.title || item.topic || "item"}" in ${domain}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Extract searchable tags from item
   */
  extractTags(item) {
    const tags = [];

    if (item.title) tags.push(item.title.toLowerCase().split(" ")[0]);
    if (item.topic) tags.push(item.topic.toLowerCase());
    if (item.domain) tags.push(item.domain.toLowerCase());
    if (item.source) tags.push(item.source.toLowerCase());

    // Add keyword tags
    if (item.extract) {
      const keywords = item.extract
        .split(" ")
        .filter((w) => w.length > 5)
        .slice(0, 3)
        .map((w) => w.toLowerCase().replace(/[^a-z]/g, ""));
      tags.push(...keywords);
    }

    return [...new Set(tags)]; // Remove duplicates
  }

  /**
   * Retrieve from memory by domain
   */
  retrieve(domain, limit = 10) {
    const startTime = performance.now();
    
    if (!this.memory[domain]) {
      return { success: false, error: `Unknown domain: ${domain}` };
    }

    const items = Array.from(this.memory[domain].values())
      .sort((a, b) => b.storedAt - a.storedAt)
      .slice(0, limit)
      .map((stored) => {
        stored.accessCount++;
        return {
          id: stored.id,
          item: stored.item,
          storedAt: stored.storedAt,
          tags: stored.tags,
        };
      });

    const accessTime = performance.now() - startTime;
    this.stats.accessCount++;
    this.stats.avgAccessTime =
      (this.stats.avgAccessTime * (this.stats.accessCount - 1) + accessTime) /
      this.stats.accessCount;

    return {
      success: true,
      domain,
      count: items.length,
      items,
      accessTime: `${accessTime.toFixed(2)}ms`,
    };
  }

  /**
   * Search by tag or keyword
   */
  search(query, limit = 10) {
    const startTime = performance.now();
    const query_lower = query.toLowerCase();

    // Find matching IDs from index
    let matchingIds = new Set();

    // Exact tag match
    if (this.index.has(query_lower)) {
      this.index.get(query_lower).forEach((id) => matchingIds.add(id));
    }

    // Partial tag match
    for (const [tag, ids] of this.index) {
      if (tag.includes(query_lower) || query_lower.includes(tag)) {
        ids.forEach((id) => matchingIds.add(id));
      }
    }

    // Collect results
    const results = [];
    for (const id of matchingIds) {
      for (const domain of Object.keys(this.memory)) {
        if (this.memory[domain].has(id)) {
          const stored = this.memory[domain].get(id);
          stored.accessCount++;
          results.push({
            id: stored.id,
            domain: stored.domain,
            item: stored.item,
            relevance: this.calculateRelevance(stored, query_lower),
          });
          break;
        }
      }
    }

    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);

    const accessTime = performance.now() - startTime;
    this.stats.accessCount++;

    return {
      success: true,
      query,
      results: results.slice(0, limit),
      count: results.length,
      accessTime: `${accessTime.toFixed(2)}ms`,
    };
  }

  /**
   * Calculate relevance score for search results
   */
  calculateRelevance(stored, query) {
    let score = 0;

    // Exact tag match
    if (stored.tags.includes(query)) {
      score += 3;
    }

    // Partial matches
    stored.tags.forEach((tag) => {
      if (tag.includes(query)) score += 1.5;
      if (query.includes(tag)) score += 1;
    });

    // Consider access history
    score += Math.log(stored.accessCount + 1) * 0.5;

    // Recent items get slight boost
    const age = Date.now() - stored.storedAt;
    const daysSince = age / (24 * 60 * 60 * 1000);
    score += Math.max(0, 2 - daysSince * 0.1);

    return score;
  }

  /**
   * Get summary of memory organization
   */
  getSummary() {
    const domainSummary = {};

    for (const [domain, memory] of Object.entries(this.memory)) {
      const items = Array.from(memory.values());
      domainSummary[domain] = {
        itemCount: items.length,
        tags: new Set(items.flatMap((i) => i.tags)).size,
        oldestItem: items.length > 0 ? items[items.length - 1].storedAt : null,
        newestItem: items.length > 0 ? items[0].storedAt : null,
      };
    }

    return {
      name: this.name,
      personality: this.personality,
      totalItems: this.stats.totalItems,
      domains: domainSummary,
      indexSize: this.index.size,
      accessCount: this.stats.accessCount,
      avgAccessTime: `${this.stats.avgAccessTime.toFixed(2)}ms`,
      lastGrowth: this.stats.lastGrowth,
    };
  }

  /**
   * Clear old items (memory cleanup)
   */
  cleanup(daysOld = 30) {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    let removed = 0;

    for (const [domain, memory] of Object.entries(this.memory)) {
      for (const [id, stored] of memory) {
        if (stored.storedAt < cutoffDate && stored.accessCount < 3) {
          // Remove from domain memory
          memory.delete(id);

          // Remove from index
          stored.tags.forEach((tag) => {
            const tagIds = this.index.get(tag) || [];
            const idx = tagIds.indexOf(id);
            if (idx > -1) tagIds.splice(idx, 1);
            if (tagIds.length === 0) this.index.delete(tag);
          });

          removed++;
          this.stats.totalItems--;
          this.stats.byDomain[domain]--;
        }
      }
    }

    return {
      success: true,
      removed,
      message: `${this.emoji} Cleaned up ${removed} old items`,
    };
  }

  /**
   * Export memory for backup/analysis
   */
  export() {
    const exported = {};

    for (const [domain, memory] of Object.entries(this.memory)) {
      exported[domain] = Array.from(memory.values()).map((stored) => ({
        id: stored.id,
        item: stored.item,
        storedAt: stored.storedAt,
        tags: stored.tags,
        accessCount: stored.accessCount,
      }));
    }

    return {
      timestamp: new Date(),
      stats: this.stats,
      data: exported,
    };
  }

  getStats() {
    return {
      name: this.name,
      personality: this.personality,
      ...this.stats,
    };
  }
}

module.exports = Albi;
