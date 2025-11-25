/**
 * HARMONIC SAAS Configuration
 * Production environment setup
 */

module.exports = {
  // SAAS Tier Configuration
  tiers: {
    free: {
      name: "Community",
      maxRequests: 1000,
      maxDataSources: 2,
      cacheExpiry: 3600, // 1 hour
      rateLimitPerMinute: 10,
      features: [
        "Wikipedia access",
        "Public curiosity facts",
        "Basic health checks",
      ],
      price: 0,
      currency: "USD",
    },
    pro: {
      name: "Professional",
      maxRequests: 10000,
      maxDataSources: 4,
      cacheExpiry: 7200, // 2 hours
      rateLimitPerMinute: 100,
      features: [
        "All free features",
        "ArXiv research papers",
        "News aggregation",
        "Advanced analytics",
        "API statistics",
      ],
      price: 29,
      currency: "USD",
      billingCycle: "monthly",
    },
    enterprise: {
      name: "Enterprise",
      maxRequests: 1000000,
      maxDataSources: 5,
      cacheExpiry: 14400, // 4 hours
      rateLimitPerMinute: 5000,
      features: [
        "All Pro features",
        "Weather data",
        "Custom integrations",
        "Dedicated support",
        "SLA guarantee",
        "Custom rate limits",
        "White-label options",
      ],
      price: "custom",
      currency: "USD",
      billingCycle: "annual",
    },
  },

  // API Rate Limiting
  rateLimiting: {
    enabled: true,
    strategy: "sliding-window",
    defaultLimit: {
      requests: 100,
      window: 60, // seconds
    },
    headers: {
      limit: "X-RateLimit-Limit",
      remaining: "X-RateLimit-Remaining",
      reset: "X-RateLimit-Reset",
    },
  },

  // Cache Configuration
  cache: {
    enabled: true,
    strategy: "per-source",
    ttl: {
      wikipedia: 86400, // 24 hours
      arxiv: 604800, // 7 days
      news: 21600, // 6 hours
      weather: 1800, // 30 minutes
      curiosity: 86400, // 24 hours
    },
    headers: {
      maxAge: 3600,
      public: true,
      staleWhileRevalidate: 86400,
    },
  },

  // Data Source Configuration
  dataSources: {
    wikipedia: {
      enabled: true,
      name: "Wikipedia REST API",
      url: "https://en.wikipedia.org/api/rest_v1/",
      timeout: 5000,
      retryAttempts: 3,
      authentication: "none",
      rateLimit: {
        requestsPerSecond: 10,
      },
    },
    arxiv: {
      enabled: true,
      name: "ArXiv API",
      url: "http://export.arxiv.org/api/",
      timeout: 5000,
      retryAttempts: 3,
      authentication: "none",
      rateLimit: {
        requestsPerSecond: 5,
      },
    },
    news: {
      enabled: true,
      name: "News Aggregator",
      url: "https://api.gnewsapi.com/",
      timeout: 5000,
      retryAttempts: 3,
      authentication: "api_key",
      apiKeyRequired: process.env.GNEWS_API_KEY || null,
      rateLimit: {
        requestsPerDay: 100,
      },
    },
    weather: {
      enabled: true,
      name: "Open-Meteo API",
      url: "https://api.open-meteo.com/",
      timeout: 5000,
      retryAttempts: 3,
      authentication: "none",
      rateLimit: {
        requestsPerSecond: 100,
      },
    },
    curiosity: {
      enabled: true,
      name: "Internal Knowledge Base",
      url: "internal",
      timeout: 100,
      retryAttempts: 1,
      authentication: "none",
      rateLimit: {
        requestsPerSecond: 1000,
      },
    },
  },

  // CORS Configuration
  cors: {
    enabled: true,
    origins: [
      process.env.VERCEL_URL || "http://localhost:3000",
      process.env.FRONTEND_URL || "http://localhost:3000",
      "https://harmonic-ai.vercel.app",
      "https://api.harmonic-ai.com",
    ],
    methods: ["GET", "POST", "OPTIONS", "DELETE"],
    headers: [
      "Content-Type",
      "Authorization",
      "X-API-Key",
      "X-Request-ID",
    ],
    credentials: true,
    maxAge: 86400,
  },

  // Authentication
  authentication: {
    enabled: true,
    methods: ["api_key", "oauth2"],
    apiKey: {
      header: "X-API-Key",
      prefix: "hm_",
      length: 32,
    },
    oauth2: {
      providers: ["github", "google"],
      scopes: ["read:api", "write:api"],
    },
  },

  // Monitoring & Logging
  monitoring: {
    enabled: true,
    logLevel: process.env.LOG_LEVEL || "info",
    metrics: {
      enabled: true,
      trackingInterval: 60, // seconds
    },
    healthCheck: {
      enabled: true,
      interval: 300, // seconds
      timeout: 5000,
    },
    errorReporting: {
      enabled: true,
      sentry: {
        enabled: process.env.SENTRY_DSN ? true : false,
        dsn: process.env.SENTRY_DSN,
      },
    },
  },

  // Performance
  performance: {
    enableCompression: true,
    enableGzip: true,
    maxPayloadSize: "10mb",
    enableStreaming: true,
    targetResponseTime: 200, // milliseconds
  },

  // Security
  security: {
    enableTLS: true,
    enableCSP: true,
    enableHSTS: true,
    enableXFrame: true,
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },

  // Database (optional)
  database: {
    enabled: process.env.DATABASE_URL ? true : false,
    type: "postgresql",
    url: process.env.DATABASE_URL,
    poolSize: 20,
    idleTimeout: 30000,
  },

  // Environment
  environment: {
    name: process.env.NODE_ENV || "development",
    isProduction: process.env.NODE_ENV === "production",
    isDevelopment: process.env.NODE_ENV === "development",
    isStaging: process.env.NODE_ENV === "staging",
  },

  // Deployment
  deployment: {
    platform: "vercel",
    regions: [
      "iad1", // US East Virginia
      "cdg1", // EU Central Paris
      "sin1", // Asia Singapore
      "syd1", // Asia Sydney
    ],
    autoScale: true,
    maxInstances: 100,
    minInstances: 1,
  },

  // Feature Flags
  features: {
    enableDataManagers: true,
    enableReasoningEngine: true,
    enableBrainIndexer: true,
    enableDocumentGeneration: true,
    enableLanguageDetection: true,
    enableVisualization: true,
    enableComprehensiveMode: true,
    enableAdvancedAnalytics: true,
  },

  // Endpoints
  endpoints: {
    base: process.env.API_BASE_URL || "https://api.harmonic-ai.com/api/v1",
    managers: "/managers",
    data: "/data",
    zurich: "/zurich",
    languages: "/languages",
    health: "/health",
  },
};
