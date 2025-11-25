/**
 * HARMONIC Data Pipeline API
 * Unified endpoint for all 5 data managers
 * Production SAAS-ready implementation
 * 
 * Endpoints:
 * ├── GET /api/v1/data - Status & sources
 * ├── POST /api/v1/data - Fetch from sources
 * ├── GET /api/v1/data/health - Health check
 * └── GET /api/v1/data/stats - Statistics
 */

import DataManagers from "@/lib/managers/data-managers";

// Global instance
let dataManagers = null;

function getDataManagers() {
  if (!dataManagers) {
    dataManagers = new DataManagers();
  }
  return dataManagers;
}

/**
 * GET /api/v1/data
 * Returns available sources and system status
 */
async function handleGET(req) {
  const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
  const managers = getDataManagers();

  const action = searchParams.get("action") || "status";

  switch (action) {
    case "sources":
      return new Response(JSON.stringify(managers.getAvailableSources()), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=3600",
        },
      });

    case "health":
      return new Response(JSON.stringify(managers.healthCheck()), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300",
        },
      });

    case "stats":
      return new Response(JSON.stringify(managers.getStatus()), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300",
        },
      });

    case "status":
    default:
      return new Response(
        JSON.stringify({
          status: "operational",
          component: "DataPipeline",
          emoji: "📊",
          timestamp: new Date().toISOString(),
          endpoints: {
            sources: "/api/v1/data?action=sources",
            health: "/api/v1/data?action=health",
            stats: "/api/v1/data?action=stats",
            fetch: "POST /api/v1/data with query body",
          },
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=300",
          },
        }
      );
  }
}

/**
 * POST /api/v1/data
 * Fetch data from specified sources
 */
async function handlePOST(req) {
  try {
    const body = await req.json();
    const { query, sources, mode = "single" } = body;

    if (!query) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required 'query' parameter",
          example: {
            query: "quantum computing",
            sources: ["wiki", "arxiv", "curiosity"],
            mode: "comprehensive",
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const managers = getDataManagers();

    let result;

    if (mode === "comprehensive") {
      // Fetch all sources for comprehensive results
      result = await managers.fetchComprehensive(query);
    } else if (Array.isArray(sources) && sources.length > 0) {
      // Fetch multiple specific sources
      result = await managers.fetchMultiple(query, sources);
    } else if (sources && typeof sources === "string") {
      // Fetch single source
      result = await managers.fetch(sources, query);
    } else {
      // Default: fetch from all sources
      result = await managers.fetchMultiple(query);
    }

    const cacheTime = mode === "comprehensive" ? 3600 : 1800;

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, max-age=${cacheTime}`,
        "X-Data-Sources": Array.isArray(sources)
          ? sources.join(", ")
          : sources || "all",
        "X-Query-Mode": mode,
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * DELETE /api/v1/data
 * Clear caches or reset managers
 */
async function handleDELETE(req) {
  const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
  const action = searchParams.get("action") || "cache";

  const managers = getDataManagers();

  if (action === "cache") {
    // Clear all caches
    Object.values(managers.managers).forEach((manager) => {
      manager.cache.clear();
      manager.stats = {
        requests: 0,
        ...(manager.stats.errors !== undefined && { errors: 0 }),
        ...(manager.stats.hits !== undefined && { hits: 0 }),
        ...(manager.stats.misses !== undefined && { misses: 0 }),
      };
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "All caches cleared",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return new Response(
    JSON.stringify({
      success: false,
      error: `Unknown action: ${action}`,
      availableActions: ["cache"],
    }),
    {
      status: 400,
      headers: { "Content-Type": "application/json" },
    }
  );
}

/**
 * OPTIONS /api/v1/data
 * API documentation
 */
function handleOPTIONS(req) {
  return new Response(
    JSON.stringify({
      api: "HARMONIC Data Pipeline",
      version: "1.0",
      component: "Data Managers Layer",
      description:
        "Unified interface for Wikipedia, ArXiv, News, Weather, and Curiosity data",
      methods: {
        GET: {
          description: "Get status, sources, health, or statistics",
          queryParams: {
            action: "status|sources|health|stats (default: status)",
          },
          examples: [
            "/api/v1/data",
            "/api/v1/data?action=sources",
            "/api/v1/data?action=health",
            "/api/v1/data?action=stats",
          ],
        },
        POST: {
          description: "Fetch data from one or multiple sources",
          bodyParams: {
            query: "string (required) - Search query",
            sources: "string|string[] - Data source(s) to query",
            mode: "single|comprehensive (default: single)",
          },
          examples: [
            {
              query: "quantum computing",
              sources: "wiki",
              mode: "single",
            },
            {
              query: "climate change",
              sources: ["arxiv", "news", "weather"],
              mode: "single",
            },
            {
              query: "artificial intelligence",
              mode: "comprehensive",
            },
          ],
        },
        DELETE: {
          description: "Clear caches or reset system",
          queryParams: {
            action: "cache (clear all caches)",
          },
          examples: ["/api/v1/data?action=cache"],
        },
      },
      availableSources: {
        wiki: "Wikipedia articles and summaries",
        arxiv: "Research papers and preprints (2.4M+)",
        news: "Current events and news articles",
        weather: "Climate data via Open-Meteo API",
        curiosity: "Science facts and knowledge base",
      },
      performance: {
        responseTimes: {
          wiki: "<1s (cached 24h)",
          arxiv: "<2s (cached 7d)",
          news: "<1s (cached 6h)",
          weather: "<1s (cached 30m)",
          curiosity: "<100ms (cached 24h)",
        },
        caching: {
          strategy: "Per-source TTL with HTTP headers",
          maxCacheSize: "Unlimited",
          hitRate: "Track via GET?action=stats",
        },
      },
      rateLimit: {
        perMinute: "No limit (free APIs)",
        perDay: "No limit (free APIs)",
        note: "Uses free, open-source APIs with no authentication",
      },
      production: {
        status: "SAAS-ready",
        deployment: "Vercel-optimized",
        monitoring: "Built-in health checks",
        scaling: "Horizontal via serverless functions",
      },
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
      },
    }
  );
}

/**
 * Main handler
 */
export async function GET(req) {
  try {
    return await handleGET(req);
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function POST(req) {
  try {
    return await handlePOST(req);
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function DELETE(req) {
  try {
    return await handleDELETE(req);
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export function OPTIONS(req) {
  return handleOPTIONS(req);
}

// Configuration for Edge/Serverless runtime
export const maxDuration = 60;
