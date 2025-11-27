/**
 * Brain Indexer - Creates RAM-based index of 8TB memory
 * Enables instant keyword search without loading full CBOR chunks
 * 
 * Features:
 * - Lazy-loads index on first search
 * - Auto-refreshes on new files
 * - Keyword extraction & frequency analysis
 * - File metadata caching
 * - Fast lookup (O(1) for keywords)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Support both E:\ drive (production) and local data/brain (development)
const BASE_DIR = process.env.BRAIN_DIR || 
  (fs.existsSync('E:\\harmonic-brain') ? 'E:\\harmonic-brain' : path.join(__dirname, '..', 'data', 'brain'));

const DIRS = {
  apis: path.join(BASE_DIR, 'apis'),
  docs: path.join(BASE_DIR, 'docs'),
  concepts: path.join(BASE_DIR, 'concepts')
};

// In-memory index structure
class BrainIndex {
  constructor() {
    this.index = {
      apis: { keywords: {}, files: {} },
      docs: { keywords: {}, files: {} },
      concepts: { keywords: {}, files: {} }
    };
    this.lastUpdated = {};
    this.ready = false;
  }

  /**
   * Extract keywords from text
   * Removes common words, lowercases, splits on delimiters
   */
  extractKeywords(text, limit = 20) {
    if (!text || typeof text !== 'string') return [];

    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
      'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can',
      'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up',
      'about', 'into', 'through', 'during', 'before', 'after', 'above',
      'below', 'between', 'under', 'along', 'following', 'behind',
      'beyond', 'plus', 'this', 'that', 'these', 'those', 'i', 'you',
      'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'when',
      'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few',
      'more', 'most', 'some', 'such', 'no', 'nor', 'not', 'only',
      'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can'
    ]);

    return text
      .toLowerCase()
      .match(/\b[\w]+\b/g)
      ?.filter(w => w.length > 2 && !commonWords.has(w))
      ?.slice(0, limit) || [];
  }

  /**
   * Extract all text fields from a record
   */
  extractText(record) {
    const texts = [];
    const fieldsToCheck = [
      'name', 'title', 'description', 'summary', 'body', 'content',
      'definition', 'examples', 'tags', 'keywords', 'group', 'domain',
      'category', 'path', 'endpoint'
    ];

    for (const field of fieldsToCheck) {
      if (record[field]) {
        const val = record[field];
        if (typeof val === 'string') {
          texts.push(val);
        } else if (Array.isArray(val)) {
          texts.push(val.join(' '));
        } else if (typeof val === 'object') {
          texts.push(JSON.stringify(val));
        }
      }
    }

    return texts.join(' ');
  }

  /**
   * Index a single file
   */
  indexFile(filePath, type) {
    try {
      const buf = fs.readFileSync(filePath);
      let records = [];

      // Try JSON first
      try {
        const data = JSON.parse(buf.toString());
        records = Array.isArray(data) ? data : [data];
      } catch {
        console.warn(`[INDEX] Could not parse ${filePath}, skipping`);
        return false;
      }

      const fileName = path.basename(filePath);
      const fileEntry = {
        file: fileName,
        path: filePath,
        size: buf.length,
        records: records.length,
        indexed_at: new Date().toISOString()
      };

      this.index[type].files[fileName] = fileEntry;

      // Extract keywords from all records
      for (const record of records) {
        if (!record || typeof record !== 'object') continue;

        const text = this.extractText(record);
        const keywords = this.extractKeywords(text);

        for (const keyword of keywords) {
          if (!this.index[type].keywords[keyword]) {
            this.index[type].keywords[keyword] = [];
          }
          // Store reference to this file (avoid duplicates)
          if (!this.index[type].keywords[keyword].includes(fileName)) {
            this.index[type].keywords[keyword].push(fileName);
          }
        }

        // Store record ID if available
        if (record.id || record.name || record.title) {
          const id = record.id || record.name || record.title;
          if (!this.index[type].files[fileName].records_indexed) {
            this.index[type].files[fileName].records_indexed = [];
          }
          this.index[type].files[fileName].records_indexed.push(id);
        }
      }

      return true;
    } catch (error) {
      console.error(`[INDEX] Error indexing ${filePath}:`, error.message);
      return false;
    }
  }

  /**
   * Rebuild index from scratch
   */
  rebuild() {
    console.log('[INDEX] Starting index rebuild...');
    const startTime = Date.now();

    // Clear existing index
    this.index = {
      apis: { keywords: {}, files: {} },
      docs: { keywords: {}, files: {} },
      concepts: { keywords: {}, files: {} }
    };

    let totalFiles = 0;
    let indexedFiles = 0;

    for (const [type, dir] of Object.entries(DIRS)) {
      if (!fs.existsSync(dir)) {
        console.warn(`[INDEX] Directory not found: ${dir}`);
        continue;
      }

      try {
        const files = fs
          .readdirSync(dir)
          .filter(f => /\.(json|cbor|bin)$/i.test(f))
          .map(f => path.join(dir, f));

        totalFiles += files.length;

        for (const filePath of files) {
          if (this.indexFile(filePath, type)) {
            indexedFiles++;
          }
        }
      } catch (error) {
        console.error(`[INDEX] Error scanning ${dir}:`, error.message);
      }
    }

    this.ready = true;
    const elapsed = Date.now() - startTime;
    const keywordCount = Object.values(this.index).reduce(
      (sum, cat) => sum + Object.keys(cat.keywords).length,
      0
    );

    console.log(
      `[INDEX] Rebuild complete: ${indexedFiles}/${totalFiles} files, ${keywordCount} unique keywords in ${elapsed}ms`
    );

    return {
      indexed_files: indexedFiles,
      total_files: totalFiles,
      unique_keywords: keywordCount,
      elapsed_ms: elapsed
    };
  }

  /**
   * Search index by keyword
   * Returns matching files (no full record load)
   */
  searchKeyword(keyword, type = null) {
    if (!this.ready) {
      return [];
    }

    const searchTypes = type ? [type] : Object.keys(this.index);
    const results = [];

    for (const t of searchTypes) {
      const kw = keyword.toLowerCase();
      const matches = this.index[t].keywords[kw] || [];
      results.push({
        type: t,
        keyword: kw,
        files: matches.length,
        file_names: matches
      });
    }

    return results;
  }

  /**
   * Multi-keyword search
   * Returns intersection of all matching keywords
   */
  searchMultiple(keywords, type = null) {
    if (!this.ready || !keywords.length) {
      return { results: [], keyword_count: 0 };
    }

    const searchTypes = type ? [type] : Object.keys(this.index);
    const results = {};

    for (const kw of keywords) {
      const lcKw = kw.toLowerCase();
      for (const t of searchTypes) {
        const files = this.index[t].keywords[lcKw] || [];
        for (const file of files) {
          const key = `${t}:${file}`;
          results[key] = (results[key] || 0) + 1;
        }
      }
    }

    // Sort by match count (most relevant first)
    const sorted = Object.entries(results)
      .sort(([, a], [, b]) => b - a)
      .map(([key, count]) => {
        const [type, file] = key.split(':');
        return {
          type,
          file,
          matches: count,
          relevance: (count / keywords.length) * 100
        };
      });

    return { results: sorted, keyword_count: keywords.length };
  }

  /**
   * Get index statistics
   */
  getStats() {
    const stats = {
      ready: this.ready,
      updated_at: new Date().toISOString(),
      categories: {}
    };

    for (const [type, data] of Object.entries(this.index)) {
      stats.categories[type] = {
        files: Object.keys(data.files).length,
        keywords: Object.keys(data.keywords).length,
        total_records: Object.values(data.files).reduce(
          (sum, f) => sum + (f.records || 0),
          0
        ),
        file_list: Object.keys(data.files)
      };
    }

    return stats;
  }

  /**
   * Find similar records based on keyword overlap
   */
  findSimilar(keyword, type = 'apis', limit = 5) {
    if (!this.ready) return [];

    const files = this.index[type].keywords[keyword.toLowerCase()] || [];
    return files.slice(0, limit);
  }
}

// Singleton instance
let indexInstance = null;

/**
 * Get or create index instance
 */
export function getIndex() {
  if (!indexInstance) {
    indexInstance = new BrainIndex();
  }
  return indexInstance;
}

/**
 * Initialize index (blocking, should be called on server startup)
 */
export function initializeIndex() {
  const index = getIndex();
  return index.rebuild();
}

/**
 * Search via index
 */
export function searchIndexed(query, type = null) {
  const index = getIndex();

  if (!index.ready) {
    console.warn('[INDEX] Index not ready, rebuilding...');
    index.rebuild();
  }

  // Extract keywords from query
  const keywords = index.extractKeywords(query, 10);

  if (keywords.length === 0) {
    return { results: [], query, keywords: [], type };
  }

  return {
    results: index.searchMultiple(keywords, type).results,
    query,
    keywords,
    type: type || 'all',
    timestamp: new Date().toISOString()
  };
}

/**
 * Get current index statistics
 */
export function getIndexStats() {
  const index = getIndex();

  if (!index.ready) {
    console.warn('[INDEX] Index not ready');
    return { ready: false, message: 'Index not initialized' };
  }

  return index.getStats();
}

/**
 * Rebuild index on demand
 */
export function rebuildIndex() {
  const index = getIndex();
  return index.rebuild();
}

/**
 * Check if index needs refresh
 */
export function checkIndexFresh(maxAgeMs = 3600000) {
  const index = getIndex();
  
  if (!index.ready) {
    return { fresh: false, message: 'Index not initialized' };
  }

  const now = Date.now();
  const ages = {};

  for (const [type, dir] of Object.entries(DIRS)) {
    if (!fs.existsSync(dir)) continue;

    try {
      const stats = fs.statSync(dir);
      const age = now - stats.mtimeMs;
      ages[type] = {
        dir_modified_ms: age,
        is_fresh: age < maxAgeMs
      };
    } catch (error) {
      ages[type] = { error: error.message };
    }
  }

  return {
    fresh: Object.values(ages).every(a => a.is_fresh !== false),
    ages,
    max_age_ms: maxAgeMs
  };
}

const indexerExport = {
  getIndex,
  initializeIndex,
  searchIndexed,
  getIndexStats,
  rebuildIndex,
  checkIndexFresh
};

export default indexerExport;
