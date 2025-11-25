/**
 * API Route: /api/v1/managers
 * Main orchestration endpoint for all 6-persona autonomous system
 * 
 * GET    - List system status and metrics
 * POST   - Orchestrate a task across personas
 * DELETE - Clear task queue (admin only)
 * OPTIONS - API documentation
 */

import AGIEM from "@/lib/managers/agiem";

// Global instance
let agiem = null;

function getAgiem() {
  if (!agiem) {
    agiem = new AGIEM();
  }
  return agiem;
}

export async function GET(request) {
  try {
    const agiem = getAgiem();
    const url = new URL(request.url);
    const action = url.searchParams.get("action") || "status";

    switch (action) {
      case "status":
        // System status
        return Response.json({
          success: true,
          system: agiem.getSystemOverview(),
          timestamp: new Date().toISOString(),
        });

      case "metrics":
        // Performance metrics
        return Response.json({
          success: true,
          metrics: agiem.getMetrics(),
          timestamp: new Date().toISOString(),
        });

      case "health":
        // System health check
        return Response.json({
          success: true,
          health: agiem.calculateHealth(),
          timestamp: new Date().toISOString(),
        });

      case "task":
        // Get specific task status
        const taskId = url.searchParams.get("id");
        if (!taskId) {
          return Response.json(
            { success: false, error: "Task ID required" },
            { status: 400 }
          );
        }
        return Response.json({
          success: true,
          task: agiem.getTaskStatus(taskId),
          timestamp: new Date().toISOString(),
        });

      case "personas":
        // List all personas
        return Response.json({
          success: true,
          personas: [
            {
              name: "Alba",
              emoji: "🌟",
              role: "Data Gatherer",
              description:
                "Collects information from Wikipedia, ArXiv, News, Weather, Science",
              sources: [
                "wikipedia",
                "arxiv",
                "news",
                "weather",
                "curiosity",
              ],
            },
            {
              name: "Albi",
              emoji: "🧠",
              role: "Memory Manager",
              description:
                "Organizes and retrieves information, manages knowledge lifecycle",
              capabilities: [
                "store",
                "retrieve",
                "search",
                "cleanup",
                "export",
              ],
            },
            {
              name: "Jona",
              emoji: "🛡️",
              role: "Security Guardian",
              description:
                "Access control, data protection, ethics enforcement",
              protectedDomains: ["human", "animal", "planet", "ai"],
            },
            {
              name: "Blerina",
              emoji: "📚",
              role: "Document Generator",
              description:
                "Generates API documentation, routes, schemas, and auto-code",
              canGenerate: [
                "routes",
                "documentation",
                "schemas",
                "openapi",
              ],
            },
            {
              name: "AGIEM",
              emoji: "🎯",
              role: "Orchestrator",
              description: "Coordinates all personas to work in harmony",
              capabilities: [
                "orchestrate",
                "workflow",
                "scheduling",
                "routing",
              ],
            },
            {
              name: "ASI",
              emoji: "✨",
              role: "World Improver",
              description:
                "Verifies quality, measures impact, ensures world benefit",
              domains: ["human", "animal", "planet"],
            },
          ],
          timestamp: new Date().toISOString(),
        });

      default:
        return Response.json(
          { success: false, error: "Unknown action" },
          { status: 400 }
        );
    }
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const agiem = getAgiem();
    const body = await request.json();

    const {
      action = "orchestrate",
      type,
      theme = "general",
      query = "",
      workflow,
    } = body;

    switch (action) {
      case "orchestrate":
        // Route task to personas
        if (!type) {
          return Response.json(
            { success: false, error: "Task type required" },
            { status: 400 }
          );
        }

        const result = await agiem.orchestrate({
          type,
          theme,
          query,
        });

        return Response.json(
          {
            success: result.success,
            taskId: result.taskId,
            result: result.result,
            message: result.message,
            error: result.error,
            timestamp: new Date().toISOString(),
          },
          { status: result.success ? 200 : 400 }
        );

      case "workflow":
        // Execute multi-step workflow
        if (!workflow || !Array.isArray(workflow.steps)) {
          return Response.json(
            { success: false, error: "Workflow with steps required" },
            { status: 400 }
          );
        }

        const workflowResult = await agiem.workflow(workflow);

        return Response.json({
          success: workflowResult.success,
          workflow: workflowResult,
          timestamp: new Date().toISOString(),
        });

      case "alba-gather":
        // Direct Alba call - gather information
        if (!query) {
          return Response.json(
            { success: false, error: "Query required" },
            { status: 400 }
          );
        }

        const albaResult = await agiem.personas.alba.gatherMultiple(query);
        return Response.json({
          success: true,
          data: albaResult,
          timestamp: new Date().toISOString(),
        });

      case "albi-store":
        // Direct Albi call - store information
        if (!body.item) {
          return Response.json(
            { success: false, error: "Item required" },
            { status: 400 }
          );
        }

        const storageResult = agiem.personas.albi.store(body.item, theme);
        return Response.json({
          success: storageResult.success,
          result: storageResult,
          timestamp: new Date().toISOString(),
        });

      case "blerina-generate":
        // Direct Blerina call - generate documentation
        if (!body.config) {
          return Response.json(
            { success: false, error: "Config required" },
            { status: 400 }
          );
        }

        const generateResult = agiem.personas.blerina.generateMarkdown(
          body.config
        );
        return Response.json({
          success: generateResult.success,
          result: generateResult,
          timestamp: new Date().toISOString(),
        });

      case "jona-check":
        // Direct Jona call - security check
        if (!body.action) {
          return Response.json(
            { success: false, error: "Action required" },
            { status: 400 }
          );
        }

        const checkResult = await agiem.personas.jona.checkAction(
          body.action,
          theme
        );
        return Response.json({
          success: true,
          result: checkResult,
          timestamp: new Date().toISOString(),
        });

      case "asi-verify":
        // Direct ASI call - verify quality
        if (!body.content) {
          return Response.json(
            { success: false, error: "Content required" },
            { status: 400 }
          );
        }

        const verifyResult = agiem.personas.asi.verifyQuality(
          body.content,
          theme
        );
        return Response.json({
          success: true,
          result: verifyResult,
          timestamp: new Date().toISOString(),
        });

      default:
        return Response.json(
          { success: false, error: "Unknown action" },
          { status: 400 }
        );
    }
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const agiem = getAgiem();
    const url = new URL(request.url);
    const action = url.searchParams.get("action");

    if (action === "clear-queue") {
      const clearedCount = agiem.taskQueue.length;
      agiem.taskQueue = [];

      return Response.json({
        success: true,
        message: `Cleared ${clearedCount} tasks from queue`,
        timestamp: new Date().toISOString(),
      });
    }

    return Response.json(
      { success: false, error: "Unknown action" },
      { status: 400 }
    );
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request) {
  return Response.json({
    success: true,
    endpoint: "/api/v1/managers",
    methods: {
      GET: {
        description: "Get system status and information",
        parameters: {
          action: {
            type: "string",
            enum: ["status", "metrics", "health", "task", "personas"],
            default: "status",
          },
          id: {
            type: "string",
            description: "Task ID (required for 'task' action)",
          },
        },
      },
      POST: {
        description: "Execute tasks through persona system",
        parameters: {
          action: {
            type: "string",
            enum: [
              "orchestrate",
              "workflow",
              "alba-gather",
              "albi-store",
              "blerina-generate",
              "jona-check",
              "asi-verify",
            ],
            default: "orchestrate",
          },
          type: {
            type: "string",
            description: "Task type (required for orchestrate)",
          },
          theme: {
            type: "string",
            enum: [
              "science",
              "medicine",
              "nature",
              "security",
              "documentation",
              "general",
            ],
            default: "general",
          },
          query: {
            type: "string",
            description: "Query or search term",
          },
          workflow: {
            type: "object",
            description: "Multi-step workflow definition",
          },
        },
      },
      DELETE: {
        description: "Admin operations",
        parameters: {
          action: {
            type: "string",
            enum: ["clear-queue"],
            description: "Action to perform",
          },
        },
      },
    },
    timestamp: new Date().toISOString(),
  }, {
    headers: {
      "Cache-Control": "no-cache",
      "Content-Type": "application/json",
    },
  });
}
