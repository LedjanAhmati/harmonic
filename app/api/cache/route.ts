/**
 * Cache Statistics & Management Endpoint
 * 
 * GET  /api/cache/stats           → Cache statistics
 * GET  /api/cache/entries         → List cached entries
 * POST /api/cache/clear           → Clear all cache
 * POST /api/cache/cleanup         → Remove expired entries
 */

import { NextResponse } from "next/server";
import { cache } from "@/lib/cache/cache-manager";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action") || "stats";

  try {
    switch (action) {
      case "stats": {
        const stats = cache.getStats();
        return NextResponse.json(
          {
            ok: true,
            action: "stats",
            cache: stats,
            size_bytes: cache.getSize(),
            size_kb: Math.round(cache.getSize() / 1024 * 100) / 100,
          },
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
            },
          }
        );
      }

      case "entries": {
        const entries = cache.listEntries();
        const stats = cache.getStats();
        return NextResponse.json(
          {
            ok: true,
            action: "entries",
            entries,
            summary: stats,
          },
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
            },
          }
        );
      }

      default:
        return NextResponse.json(
          {
            ok: false,
            error: "unknown_action",
            available: ["stats", "entries"],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action") || "clear";
  const body = await req.json().catch(() => ({}));

  try {
    switch (action) {
      case "clear": {
        cache.clear();
        return NextResponse.json(
          {
            ok: true,
            action: "clear",
            message: "Cache cleared",
          },
          { status: 200 }
        );
      }

      case "cleanup": {
        const removed = cache.cleanup();
        const stats = cache.getStats();
        return NextResponse.json(
          {
            ok: true,
            action: "cleanup",
            removed,
            message: `${removed} expired entries removed`,
            cache: stats,
          },
          { status: 200 }
        );
      }

      case "set_ttl": {
        const ttl = body.ttl || 1000 * 60 * 10;
        cache.setDefaultTTL(ttl);
        return NextResponse.json(
          {
            ok: true,
            action: "set_ttl",
            ttl_ms: ttl,
            message: `Default TTL set to ${ttl}ms`,
          },
          { status: 200 }
        );
      }

      default:
        return NextResponse.json(
          {
            ok: false,
            error: "unknown_action",
            available: ["clear", "cleanup", "set_ttl"],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}

export function OPTIONS(req: Request) {
  return NextResponse.json(
    {
      api: "Cache Manager",
      description: "View and manage Trinity/ASI response cache",
      endpoints: {
        GET: {
          "/api/cache/stats?action=stats": "View cache statistics (hit rate, size, entries)",
          "/api/cache/stats?action=entries": "List all cached entries with details",
        },
        POST: {
          "/api/cache/stats?action=clear": "Clear all cache",
          "/api/cache/stats?action=cleanup": "Remove expired entries",
          "/api/cache/stats?action=set_ttl": "Set default TTL (body: {ttl: ms})",
        },
      },
      cache_stats: {
        totalRequests: "Total number of cache lookups",
        cacheHits: "Number of successful cache hits",
        cacheMisses: "Number of cache misses",
        hitRate: "Percentage of successful hits (0-100)",
        entriesStored: "Number of entries in cache",
        totalSize: "Total cache size in bytes",
      },
      example_response: {
        ok: true,
        action: "stats",
        cache: {
          totalRequests: 100,
          cacheHits: 87,
          cacheMisses: 13,
          hitRate: 87.0,
          entriesStored: 12,
          totalSize: 45000,
        },
        size_kb: 43.95,
      },
    },
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
      },
    }
  );
}
