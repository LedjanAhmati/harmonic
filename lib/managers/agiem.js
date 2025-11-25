/**
 * AGIEM - Artificial General Intelligence Manager
 * Orchestration & Coordination Module
 * 
 * Personality: Strategic, diplomatic, system-thinking
 * Role: Task coordination, persona scheduling, strategic planning
 * Mission: Coordinate all personas to work in harmony toward world benefit
 */

import Alba from "./alba.js";
import Albi from "./albi.js";
import Jona from "./jona.js";
import Blerina from "./blerina.js";

class AGIEM {
  constructor() {
    this.name = "AGIEM";
    this.emoji = "🎯";
    this.personality = "strategic-diplomatic";

    // Initialize all personas
    this.personas = {
      alba: new Alba(), // Data gatherer
      albi: new Albi(), // Memory manager
      jona: new Jona(), // Security guardian
      blerina: new Blerina(), // Document generator
    };

    // Task queue
    this.taskQueue = [];
    this.executingTasks = new Map();

    // Scheduling
    this.schedule = {
      alba: { frequency: "hourly", lastRun: null },
      albi: { frequency: "continuous", lastRun: null },
      jona: { frequency: "on-demand", lastRun: null },
      blerina: { frequency: "on-request", lastRun: null },
    };

    // Strategic priorities
    this.priorities = {
      high: ["human-benefit", "animal-protection", "planet-restoration"],
      medium: ["education", "research", "documentation"],
      low: ["optimization", "maintenance", "logging"],
    };

    // Stats
    this.stats = {
      tasksQueued: 0,
      tasksExecuted: 0,
      tasksSucceeded: 0,
      tasksFailed: 0,
      uptime: Date.now(),
    };
  }

  /**
   * Main orchestration entry point - process a request
   */
  async orchestrate(request) {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const task = {
      id: taskId,
      type: request.type || "generic",
      theme: request.theme || "general",
      query: request.query || "",
      priority: this.determinePriority(request.theme),
      status: "queued",
      createdAt: new Date(),
      startedAt: null,
      completedAt: null,
      result: null,
      error: null,
    };

    // Queue the task
    this.taskQueue.push(task);
    this.stats.tasksQueued++;

    try {
      // Route to appropriate persona(s)
      const personaRoute = this.routeTask(task);

      task.status = "routing";
      this.executingTasks.set(taskId, task);

      // Execute through personas
      const result = await this.executeWithPersonas(task, personaRoute);

      task.result = result;
      task.status = "completed";
      task.completedAt = new Date();
      this.stats.tasksSucceeded++;

      return {
        success: true,
        taskId,
        result,
        message: `${this.emoji} Task completed by ${personaRoute.personas.join(", ")}`,
      };
    } catch (error) {
      task.error = error.message;
      task.status = "failed";
      task.completedAt = new Date();
      this.stats.tasksFailed++;

      return {
        success: false,
        taskId,
        error: error.message,
        message: `${this.emoji} Task failed: ${error.message}`,
      };
    } finally {
      this.stats.tasksExecuted++;
      this.executingTasks.delete(taskId);
    }
  }

  /**
   * Determine priority based on theme
   */
  determinePriority(theme) {
    const theme_lower = theme.toLowerCase();

    for (const [priority, themes] of Object.entries(this.priorities)) {
      if (themes.some((t) => theme_lower.includes(t))) {
        return priority;
      }
    }

    return "medium";
  }

  /**
   * Route task to appropriate persona(s)
   */
  routeTask(task) {
    const routing = {
      personas: [],
      sequence: [],
    };

    const type_lower = task.type.toLowerCase();
    const theme_lower = task.theme.toLowerCase();

    // Determine which personas to involve
    if (
      type_lower.includes("gather") ||
      type_lower.includes("search") ||
      theme_lower.includes("science") ||
      theme_lower.includes("research")
    ) {
      routing.personas.push("alba");
    }

    if (
      type_lower.includes("store") ||
      type_lower.includes("retrieve") ||
      type_lower.includes("organize")
    ) {
      routing.personas.push("albi");
    }

    if (
      type_lower.includes("security") ||
      type_lower.includes("check") ||
      type_lower.includes("verify") ||
      theme_lower.includes("protection")
    ) {
      routing.personas.push("jona");
    }

    if (
      type_lower.includes("document") ||
      type_lower.includes("generate") ||
      type_lower.includes("api") ||
      type_lower.includes("code")
    ) {
      routing.personas.push("blerina");
    }

    // Default: involve all if general task
    if (routing.personas.length === 0) {
      routing.personas = ["alba", "albi", "jona", "blerina"];
    }

    // Build execution sequence
    // Alba -> Albi -> Jona -> Blerina is typical flow
    const order = ["alba", "albi", "jona", "blerina"];
    routing.sequence = order.filter((p) => routing.personas.includes(p));

    return routing;
  }

  /**
   * Execute task through selected personas in sequence
   */
  async executeWithPersonas(task, routing) {
    const results = {};
    let data = { query: task.query, theme: task.theme };

    for (const personaName of routing.sequence) {
      const persona = this.personas[personaName];

      if (!persona) continue;

      try {
        // Alba: Gather information
        if (personaName === "alba") {
          const result = await persona.gatherMultiple(data.query);
          results.alba = result;
          data.gathered = result;
        }

        // Albi: Store and organize
        if (personaName === "albi") {
          if (data.gathered && data.gathered.sources) {
            for (const source of data.gathered.sources) {
              persona.store(source, data.theme);
            }
          }
          results.albi = persona.getSummary();
        }

        // Jona: Verify security and ethics
        if (personaName === "jona") {
          const checkResult = await persona.checkAction(
            task.type,
            data.theme
          );
          results.jona = checkResult;

          // If denied, stop here
          if (checkResult.decision === "denied") {
            throw new Error(`Security check failed: ${checkResult.reason}`);
          }
        }

        // Blerina: Generate documentation if needed
        if (personaName === "blerina") {
          const docResult = persona.generateMarkdown({
            title: `${data.theme} Report`,
            description: `Generated report for ${data.query}`,
            content: JSON.stringify(data.gathered || {}, null, 2),
            usage: "Use this report for reference and learning",
            related: "Related topics: science, research, knowledge",
          });
          results.blerina = docResult;
        }
      } catch (error) {
        console.error(
          `AGIEM: Error executing ${personaName}:`,
          error.message
        );
        // Continue with next persona despite error
        results[personaName] = { error: error.message };
      }
    }

    return results;
  }

  /**
   * Coordinate a complete workflow
   */
  async workflow(config) {
    const {
      name = "Unnamed Workflow",
      steps = [],
      onStep = null,
    } = config;

    const results = {
      workflow: name,
      startedAt: new Date(),
      steps: [],
      success: true,
    };

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      try {
        const stepResult = await this.orchestrate(step);

        results.steps.push({
          stepIndex: i,
          stepType: step.type,
          success: stepResult.success,
          result: stepResult.result || stepResult.error,
          timestamp: new Date(),
        });

        // Callback hook
        if (onStep) {
          await onStep(i, stepResult);
        }

        // If step fails and critical, stop
        if (!stepResult.success && step.critical) {
          results.success = false;
          break;
        }
      } catch (error) {
        results.steps.push({
          stepIndex: i,
          stepType: step.type,
          success: false,
          error: error.message,
        });

        if (step.critical) {
          results.success = false;
          break;
        }
      }
    }

    results.completedAt = new Date();
    results.duration =
      results.completedAt - results.startedAt;

    return results;
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    const uptime = Date.now() - this.stats.uptime;
    const successRate =
      this.stats.tasksExecuted > 0
        ? ((this.stats.tasksSucceeded / this.stats.tasksExecuted) * 100).toFixed(
            2
          )
        : 0;

    return {
      name: this.name,
      uptime: `${(uptime / 1000).toFixed(2)}s`,
      stats: this.stats,
      successRate: `${successRate}%`,
      queueSize: this.taskQueue.length,
      executingCount: this.executingTasks.size,
      personaStats: {
        alba: this.personas.alba.getStats(),
        albi: this.personas.albi.getStats(),
        jona: this.personas.jona.getStats(),
        blerina: this.personas.blerina.getStats(),
      },
    };
  }

  /**
   * Get task status
   */
  getTaskStatus(taskId) {
    const task = this.taskQueue.find((t) => t.id === taskId);
    if (task) return task;

    const executing = this.executingTasks.get(taskId);
    return executing || { error: "Task not found" };
  }

  /**
   * Get system overview
   */
  getSystemOverview() {
    return {
      name: this.name,
      emoji: this.emoji,
      personality: this.personality,
      personas: Object.keys(this.personas),
      taskStats: this.stats,
      schedule: this.schedule,
      priorities: this.priorities,
      uptime: new Date(this.stats.uptime),
      currentTime: new Date(),
      health: this.calculateHealth(),
    };
  }

  /**
   * Calculate system health
   */
  calculateHealth() {
    const successRate =
      this.stats.tasksExecuted > 0
        ? this.stats.tasksSucceeded / this.stats.tasksExecuted
        : 1;

    const queueHealth = this.taskQueue.length < 100 ? 1 : 0.8;

    const health = (successRate * 0.7 + queueHealth * 0.3) * 100;

    return {
      percentage: health.toFixed(2),
      status: health > 90 ? "excellent" : health > 70 ? "good" : "needs-attention",
      successRate: `${(successRate * 100).toFixed(2)}%`,
      queueHealth,
    };
  }

  getStats() {
    return {
      name: this.name,
      personality: this.personality,
      ...this.stats,
      systemHealth: this.calculateHealth(),
    };
  }
}

export default AGIEM;
