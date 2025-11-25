/**
 * Cache Manager for Trinity & ASI calls
 * 
 * ⚡ OPTIMIZATION: From 0.0% cache hit rate → real, measurable caching
 * 
 * Features:
 * - In-memory with TTL (Time To Live)
 * - Automatic expiration
 * - Cache statistics
 * - Per-endpoint caching
 */

interface CacheEntry {
  value: any;
  timestamp: number;
  ttl: number;
  hits: number;
  key: string;
}

interface CacheStats {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
  entriesStored: number;
  totalSize: number;
}

class CacheManager {
  private store: Map<string, CacheEntry> = new Map();
  private stats = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
  };
  private defaultTTL: number = 1000 * 60 * 10; // 10 minutes

  /**
   * Get value from cache
   * Returns null if not found or expired
   */
  get(key: string): any {
    this.stats.totalRequests++;

    const entry = this.store.get(key);
    if (!entry) {
      this.stats.cacheMisses++;
      return null;
    }

    // Check if expired
    const age = Date.now() - entry.timestamp;
    if (age > entry.ttl) {
      this.store.delete(key);
      this.stats.cacheMisses++;
      return null;
    }

    // Cache hit
    entry.hits++;
    this.stats.cacheHits++;
    return entry.value;
  }

  /**
   * Set value in cache with optional TTL
   */
  set(key: string, value: any, ttl?: number): void {
    this.store.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      hits: 0,
      key,
    });
  }

  /**
   * Clear specific key
   */
  delete(key: string): boolean {
    return this.store.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.store.clear();
    this.stats = { totalRequests: 0, cacheHits: 0, cacheMisses: 0 };
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    let totalSize = 0;
    for (const entry of this.store.values()) {
      totalSize += JSON.stringify(entry.value).length;
    }

    const hitRate =
      this.stats.totalRequests > 0
        ? (this.stats.cacheHits / this.stats.totalRequests) * 100
        : 0;

    return {
      totalRequests: this.stats.totalRequests,
      cacheHits: this.stats.cacheHits,
      cacheMisses: this.stats.cacheMisses,
      hitRate: Math.round(hitRate * 100) / 100,
      entriesStored: this.store.size,
      totalSize,
    };
  }

  /**
   * Get cache size in bytes (approximate)
   */
  getSize(): number {
    let size = 0;
    for (const entry of this.store.values()) {
      size += JSON.stringify(entry.value).length;
    }
    return size;
  }

  /**
   * List all cache entries (for debugging)
   */
  listEntries(): Array<{
    key: string;
    age_ms: number;
    ttl_ms: number;
    hits: number;
    value_preview: string;
  }> {
    const entries = [];
    for (const [key, entry] of this.store.entries()) {
      entries.push({
        key,
        age_ms: Date.now() - entry.timestamp,
        ttl_ms: entry.ttl,
        hits: entry.hits,
        value_preview: JSON.stringify(entry.value).substring(0, 100),
      });
    }
    return entries;
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): number {
    let removed = 0;
    for (const [key, entry] of this.store.entries()) {
      const age = Date.now() - entry.timestamp;
      if (age > entry.ttl) {
        this.store.delete(key);
        removed++;
      }
    }
    return removed;
  }

  /**
   * Set default TTL
   */
  setDefaultTTL(ttl: number): void {
    this.defaultTTL = ttl;
  }
}

/**
 * Generate cache key from request parameters
 */
export function generateCacheKey(
  endpoint: string,
  params: Record<string, any>
): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}:${String(params[k]).substring(0, 50)}`)
    .join("|");

  return `${endpoint}:${sorted}`;
}

/**
 * Create cache key from prompt (for Trinity/ASI calls)
 */
export function generatePromptCacheKey(
  personas: string[],
  prompt: string,
  mode?: string
): string {
  const persona_str = personas.sort().join(",");
  const prompt_hash = prompt.substring(0, 50);
  const mode_str = mode || "default";
  return `trinity:${persona_str}:${mode_str}:${prompt_hash}`;
}

// Global cache instance
export const cache = new CacheManager();

// Export types
export type { CacheEntry, CacheStats, CacheManager };
