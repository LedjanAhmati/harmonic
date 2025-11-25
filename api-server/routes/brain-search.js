// api-server/routes/brain-search.js
// Brain search API endpoint

import express from 'express';
import { searchBrain, getBrainStats } from '../brain-reader.js';
import { searchIndexed, getIndexStats, rebuildIndex, initializeIndex } from '../src/indexer.js';

const router = express.Router();

/**
 * POST /api/brain/search
 * Search across 8TB brain memory (APIs, docs, concepts)
 * First tries indexed search, then falls back to full search
 */
router.post("/api/brain/search", (req, res) => {
  const { query, limits, use_index = true } = req.body || {};

  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return res.status(400).json({ 
      ok: false, 
      error: "missing_query",
      example: { query: "harmonic algorithm" }
    });
  }

  try {
    // Try indexed search first if enabled
    if (use_index) {
      const indexedResults = searchIndexed(query);
      
      if (indexedResults.results.length > 0) {
        res.json({
          ok: true,
          query,
          search_method: "indexed",
          keywords_extracted: indexedResults.keywords,
          indexed_results: indexedResults.results,
          timestamp: new Date().toISOString()
        });
        return;
      }
    }

    // Fall back to full search
    const result = searchBrain(query.trim(), limits || { apis: 20, docs: 20, concepts: 20 });

    res.json({
      ok: true,
      query,
      search_method: "full_scan",
      timestamp: new Date().toISOString(),
      counts: {
        apis: result.apis.length,
        docs: result.docs.length,
        concepts: result.concepts.length,
        total: result.apis.length + result.docs.length + result.concepts.length
      },
      results: {
        apis: result.apis,
        docs: result.docs,
        concepts: result.concepts
      }
    });
  } catch (e) {
    console.error("Brain search error:", e);
    res.status(500).json({ 
      ok: false, 
      error: "search_failed",
      message: e.message 
    });
  }
});

/**
 * GET /api/brain/stats
 * Get brain memory statistics
 */
router.get("/api/brain/stats", (req, res) => {
  try {
    const stats = getBrainStats();

    res.json({
      ok: true,
      timestamp: new Date().toISOString(),
      brain: {
        storage: stats,
        description: "8TB external brain memory with APIs, documentation, and concepts",
        status: Object.values(stats).every(s => s.exists) ? "ready" : "partial"
      }
    });
  } catch (e) {
    console.error("Brain stats error:", e);
    res.status(500).json({ 
      ok: false, 
      error: "stats_failed",
      message: e.message 
    });
  }
});

/**
 * GET /api/brain/index/stats
 * Get indexer statistics
 */
router.get("/api/brain/index/stats", (req, res) => {
  try {
    const indexStats = getIndexStats();

    res.json({
      ok: true,
      timestamp: new Date().toISOString(),
      index: indexStats
    });
  } catch (e) {
    console.error("Index stats error:", e);
    res.status(500).json({
      ok: false,
      error: "index_stats_failed",
      message: e.message
    });
  }
});

/**
 * POST /api/brain/index/rebuild
 * Rebuild the index (use after adding new files)
 */
router.post("/api/brain/index/rebuild", (req, res) => {
  try {
    const result = rebuildIndex();

    res.json({
      ok: true,
      message: "Index rebuilt successfully",
      result,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    console.error("Index rebuild error:", e);
    res.status(500).json({
      ok: false,
      error: "rebuild_failed",
      message: e.message
    });
  }
});

/**
 * POST /api/brain/index/initialize
 * Initialize index (called on server startup)
 */
router.post("/api/brain/index/initialize", (req, res) => {
  try {
    const result = initializeIndex();

    res.json({
      ok: true,
      message: "Index initialized successfully",
      result,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    console.error("Index initialization error:", e);
    res.status(500).json({
      ok: false,
      error: "init_failed",
      message: e.message
    });
  }
});

/**
 * GET /api/brain/info
 * Get brain system information
 */
router.get("/api/brain/info", (req, res) => {
  res.json({
    ok: true,
    system: "Harmonic Brain - 8TB External Memory",
    version: "1.0",
    description: "Persistent knowledge base with CBOR chunks and indexed search",
    capabilities: [
      "Search APIs by name, path, tags",
      "Search documentation by title, keywords",
      "Search concepts by domain, definition",
      "Indexed keyword search (instant)",
      "Full-text fallback search",
      "Batch processing ready",
      "Auto-index refresh"
    ],
    storage_format: ["JSON", "CBOR", "Binary chunks"],
    endpoints: {
      search: "POST /api/brain/search",
      stats: "GET /api/brain/stats",
      index_stats: "GET /api/brain/index/stats",
      index_rebuild: "POST /api/brain/index/rebuild",
      index_init: "POST /api/brain/index/initialize",
      info: "GET /api/brain/info"
    },
    example_search: {
      query: "harmonic",
      limits: { apis: 20, docs: 20, concepts: 20 },
      use_index: true
    }
  });
});

export default router;
