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

interface CacheEntry<T = unknown> {
  value: T;
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
  private cache = new Map<string, { data: unknown; expiry: number; key: string; hits: number }>();
  private stats = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
  };
  private defaultTTL = 1000 * 60 * 10; // 10 minutes

  // The set method uses a generic type <T>
  set<T>(key: string, value: T, ttl?: number): void {
    const actualTTL = ttl || this.defaultTTL;
    const expiry = Date.now() + actualTTL;
    this.cache.set(key, { data: value, expiry, key, hits: 0 });
  }

  // The get method also uses a generic type <T>
  get<T>(key: string): T | undefined {
    this.stats.totalRequests++;
    const item = this.cache.get(key);

    if (!item) {
      this.stats.cacheMisses++;
      return undefined;
    }

    // Check for expiry
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      this.stats.cacheMisses++;
      return undefined;
    }

    // Cache hit
    this.stats.cacheHits++;
    item.hits++;
    return item.data as T;
  }

  // Get cache statistics
  getStats(): CacheStats {
    const totalRequests = this.stats.totalRequests || 1;
    const hitRate = (this.stats.cacheHits / totalRequests) * 100;

    return {
      totalRequests: this.stats.totalRequests,
      cacheHits: this.stats.cacheHits,
      cacheMisses: this.stats.cacheMisses,
      hitRate: Math.round(hitRate * 100) / 100,
      entriesStored: this.cache.size,
      totalSize: this.getSize(),
    };
  }

  // Get total cache size in bytes
  getSize(): number {
    let totalSize = 0;
    for (const entry of this.cache.values()) {
      totalSize += entry.key.length;
      try {
        totalSize += JSON.stringify(entry.data).length;
      } catch {
        totalSize += String(entry.data).length;
      }
    }
    return totalSize;
  }

  // List all cache entries
  listEntries(): Array<{ key: string; hits: number; age_ms: number; ttl_remaining_ms: number; size_bytes: number }> {
    const now = Date.now();
    const entries: Array<{ key: string; hits: number; age_ms: number; ttl_remaining_ms: number; size_bytes: number }> = [];

    for (const entry of this.cache.values()) {
      const ttlRemaining = entry.expiry - now;
      if (ttlRemaining < 0) continue;

      let size = entry.key.length;
      try {
        size += JSON.stringify(entry.data).length;
      } catch {
        size += String(entry.data).length;
      }

      entries.push({
        key: entry.key,
        hits: entry.hits,
        age_ms: now - (entry.expiry - this.defaultTTL),
        ttl_remaining_ms: ttlRemaining,
        size_bytes: size,
      });
    }

    return entries;
  }

  // Remove expired entries
  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
        removed++;
      }
    }

    return removed;
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
  }

  // Set default TTL
  setDefaultTTL(ttl: number): void {
    if (ttl > 0) {
      this.defaultTTL = ttl;
    }
  }
}

/**
 * Generate cache key from request parameters
 */
export function generateCacheKey(
  endpoint: string,
  params: Record<string, unknown>
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
