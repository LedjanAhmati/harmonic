/**
 * Theme-based Task Router
 * Routes tasks to specialized agents based on theme and domain
 */

class ThemeRouter {
  constructor() {
    this.name = "ThemeRouter";
    this.emoji = "🔀";

    // Theme to agent mapping
    this.themeAgents = {
      science: {
        primary: "alba",
        secondary: ["albi", "asi"],
        description: "Scientific research, discovery, curiosity",
        datasources: ["arxiv", "wikipedia"],
      },
      medicine: {
        primary: "alba",
        secondary: ["albi", "jona", "asi"],
        description: "Medical research, healthcare, treatment",
        datasources: ["arxiv", "wikipedia"],
        securityLevel: "high",
      },
      nature: {
        primary: "alba",
        secondary: ["albi", "asi"],
        description: "Biology, ecology, environment, animals",
        datasources: ["wikipedia"],
      },
      technology: {
        primary: "blerina",
        secondary: ["albi", "jona"],
        description: "Tech documentation, APIs, code generation",
        datasources: [],
      },
      security: {
        primary: "jona",
        secondary: ["albi"],
        description: "Security checks, access control, ethics",
        datasources: [],
        securityLevel: "critical",
      },
      documentation: {
        primary: "blerina",
        secondary: ["albi", "asi"],
        description: "Create documentation, guides, references",
        datasources: [],
      },
      knowledge: {
        primary: "albi",
        secondary: ["alba"],
        description: "Store and retrieve knowledge",
        datasources: [],
      },
      quality: {
        primary: "asi",
        secondary: ["jona"],
        description: "Quality assurance, impact measurement",
        datasources: [],
      },
      general: {
        primary: "alba",
        secondary: ["albi"],
        description: "General information gathering",
        datasources: ["wikipedia"],
      },
    };

    // Intent recognition patterns
    this.intentPatterns = {
      gather: [
        "find",
        "search",
        "look",
        "research",
        "investigate",
        "get",
        "fetch",
      ],
      store: ["save", "store", "remember", "keep", "archive"],
      retrieve: ["retrieve", "recall", "find", "search", "lookup"],
      generate: ["generate", "create", "write", "make", "build", "code"],
      check: [
        "check",
        "verify",
        "validate",
        "secure",
        "protect",
        "audit",
      ],
      measure: ["measure", "evaluate", "assess", "score", "rate", "impact"],
    };

    // Statistics
    this.stats = {
      routesProcessed: 0,
      byTheme: {},
      byIntent: {},
      avgConfidence: 0,
    };

    // Initialize stats
    Object.keys(this.themeAgents).forEach((theme) => {
      this.stats.byTheme[theme] = 0;
    });
    Object.keys(this.intentPatterns).forEach((intent) => {
      this.stats.byIntent[intent] = 0;
    });
  }

  /**
   * Route a task based on theme and query
   */
  route(query, theme = "general") {
    const routing = {
      query,
      theme: theme.toLowerCase(),
      intent: null,
      confidence: 0,
      agents: [],
      datasources: [],
      recommendation: "",
      timestamp: new Date(),
    };

    // Validate theme
    if (!this.themeAgents[routing.theme]) {
      routing.theme = "general";
    }

    // Detect intent from query
    routing.intent = this.detectIntent(query);
    this.stats.byIntent[routing.intent]++;

    // Get theme configuration
    const themeConfig = this.themeAgents[routing.theme];

    // Build agent routing
    routing.agents = [
      themeConfig.primary,
      ...themeConfig.secondary,
    ];

    // Deduplicate agents
    routing.agents = [...new Set(routing.agents)];

    // Add datasources
    routing.datasources = themeConfig.datasources;

    // Calculate confidence
    routing.confidence = this.calculateConfidence(query, routing.theme);

    // Generate recommendation
    routing.recommendation = this.generateRecommendation(routing);

    // Update statistics
    this.stats.routesProcessed++;
    this.stats.byTheme[routing.theme]++;
    this.stats.avgConfidence =
      (this.stats.avgConfidence * (this.stats.routesProcessed - 1) +
        routing.confidence) /
      this.stats.routesProcessed;

    return routing;
  }

  /**
   * Detect intent from query
   */
  detectIntent(query) {
    const queryLower = query.toLowerCase();
    let bestMatch = "general";
    let bestScore = 0;

    for (const [intent, patterns] of Object.entries(this.intentPatterns)) {
      const matches = patterns.filter((p) =>
        queryLower.includes(p)
      ).length;

      if (matches > bestScore) {
        bestScore = matches;
        bestMatch = intent;
      }
    }

    return bestMatch;
  }

  /**
   * Calculate routing confidence
   */
  calculateConfidence(query, theme) {
    let confidence = 0.5; // Base confidence

    // Query length confidence boost
    const queryLength = query.split(" ").length;
    if (queryLength >= 5) confidence += 0.2;
    if (queryLength >= 10) confidence += 0.15;

    // Theme specificity
    if (theme !== "general") confidence += 0.15;

    // Query has keywords from theme
    const themeConfig = this.themeAgents[theme];
    const keywordMatches = themeConfig.description
      .split(" ")
      .filter((kw) => query.toLowerCase().includes(kw)).length;

    confidence += keywordMatches * 0.05;

    // Cap at 0.95
    return Math.min(confidence, 0.95);
  }

  /**
   * Generate routing recommendation
   */
  generateRecommendation(routing) {
    const { agents, theme, confidence, intent, datasources } = routing;

    let rec = `${this.emoji} Route to ${agents.join(" → ")}`;

    if (confidence < 0.6) {
      rec += " (low confidence - may need clarification)";
    } else if (confidence > 0.85) {
      rec += " (high confidence)";
    }

    if (datasources.length > 0) {
      rec += ` | Use: ${datasources.join(", ")}`;
    }

    return rec;
  }

  /**
   * Get recommended workflow for task
   */
  getWorkflow(query, theme = "general") {
    const routing = this.route(query, theme);

    const workflow = {
      id: `workflow_${Date.now()}`,
      routing,
      steps: this.generateSteps(routing),
      estimatedDuration: this.estimateDuration(routing),
      priority: this.calculatePriority(routing),
    };

    return workflow;
  }

  /**
   * Generate workflow steps
   */
  generateSteps(routing) {
    const steps = [];

    // Step 1: Gather (if Alba involved)
    if (routing.agents.includes("alba")) {
      steps.push({
        order: 1,
        persona: "alba",
        action: "gather",
        config: {
          query: routing.query,
          datasources: routing.datasources,
        },
      });
    }

    // Step 2: Store (if Albi involved)
    if (routing.agents.includes("albi")) {
      steps.push({
        order: 2,
        persona: "albi",
        action: "store",
        config: {
          domain: routing.theme,
        },
      });
    }

    // Step 3: Check (if Jona involved)
    if (routing.agents.includes("jona")) {
      steps.push({
        order: 3,
        persona: "jona",
        action: "verify",
        config: {
          domain: routing.theme,
        },
      });
    }

    // Step 4: Generate (if Blerina involved)
    if (routing.agents.includes("blerina")) {
      steps.push({
        order: 4,
        persona: "blerina",
        action: "generate",
        config: {
          type: routing.intent,
        },
      });
    }

    // Step 5: Verify (if ASI involved)
    if (routing.agents.includes("asi")) {
      steps.push({
        order: 5,
        persona: "asi",
        action: "verify",
        config: {
          domain: routing.theme,
        },
      });
    }

    return steps;
  }

  /**
   * Estimate workflow duration
   */
  estimateDuration(routing) {
    let duration = 0;

    // Base time per agent
    const baseTime = {
      alba: 2000, // 2s for gathering
      albi: 500, // 0.5s for storage
      jona: 300, // 0.3s for checking
      blerina: 1000, // 1s for generation
      asi: 800, // 0.8s for verification
    };

    for (const agent of routing.agents) {
      duration += baseTime[agent] || 1000;
    }

    return {
      estimatedMs: duration,
      estimatedSeconds: (duration / 1000).toFixed(1),
      human: duration < 1000 ? "< 1 second" : `${(duration / 1000).toFixed(1)}s`,
    };
  }

  /**
   * Calculate task priority
   */
  calculatePriority(routing) {
    const highPriorityThemes = ["security", "medicine"];
    const mediumPriorityThemes = ["science", "nature"];

    if (highPriorityThemes.includes(routing.theme)) {
      return "high";
    }
    if (mediumPriorityThemes.includes(routing.theme)) {
      return "medium";
    }
    return "normal";
  }

  /**
   * Get routing statistics
   */
  getStats() {
    return {
      name: this.name,
      emoji: this.emoji,
      routesProcessed: this.stats.routesProcessed,
      byTheme: this.stats.byTheme,
      byIntent: this.stats.byIntent,
      avgConfidence: this.stats.avgConfidence.toFixed(3),
      themeCount: Object.keys(this.themeAgents).length,
      intentCount: Object.keys(this.intentPatterns).length,
    };
  }
}

module.exports = ThemeRouter;
