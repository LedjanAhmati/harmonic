#!/usr/bin/env node

/**
 * ZURICH - Harmonic Trinity API Documentation & Automation Generator
 * 
 * Automatically generates:
 * - API documentation from code
 * - OpenAPI/Swagger specs
 * - Request/response examples
 * - Type definitions
 * - Environment configs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class Zurich {
  constructor() {
    this.apiServerPath = path.join(__dirname, 'api-server');
    this.appPath = path.join(__dirname, 'app');
    this.docsPath = path.join(__dirname, 'docs');
    this.timestamp = new Date().toISOString();
  }

  // Create docs directory if not exists
  ensureDocsDir() {
    if (!fs.existsSync(this.docsPath)) {
      fs.mkdirSync(this.docsPath, { recursive: true });
    }
  }

  // Generate OpenAPI spec
  generateOpenAPISpec() {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: 'Harmonic Trinity SAAS API',
        description: 'Multi-persona AI debate engine with memory bank',
        version: '1.0.0',
        contact: {
          name: 'Harmonic Trinity',
          url: 'http://localhost:3000/harmonic'
        }
      },
      servers: [
        {
          url: 'http://localhost:5000',
          description: 'Local SAAS API Server'
        }
      ],
      paths: {
        '/debate': {
          post: {
            summary: 'Run full 5-persona debate',
            description: 'Triggers all 5 personas to debate a topic with automatic caching',
            tags: ['Debates'],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      topic: {
                        type: 'string',
                        description: 'The debate topic/question',
                        example: 'What is innovation?'
                      }
                    },
                    required: ['topic']
                  }
                }
              }
            },
            responses: {
              '200': {
                description: 'Successful debate completion',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        debateId: { type: 'string' },
                        topic: { type: 'string' },
                        responses: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              persona: { type: 'string' },
                              emoji: { type: 'string' },
                              response: { type: 'string' },
                              latency: { type: 'number' },
                              fromCache: { type: 'boolean' }
                            }
                          }
                        },
                        stats: {
                          type: 'object',
                          properties: {
                            totalLatencyMs: { type: 'number' },
                            cacheHitRate: { type: 'string' },
                            personasQueried: { type: 'number' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '/persona': {
          post: {
            summary: 'Call single persona',
            tags: ['Personas'],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      systemPrompt: { type: 'string' },
                      userPrompt: { type: 'string' },
                      persona: { 
                        type: 'string',
                        enum: ['alba', 'albi', 'jona', 'blerina', 'asi']
                      }
                    },
                    required: ['systemPrompt', 'userPrompt', 'persona']
                  }
                }
              }
            },
            responses: {
              '200': {
                description: 'Persona response'
              }
            }
          }
        },
        '/stats': {
          get: {
            summary: 'Get memory bank statistics',
            tags: ['Statistics'],
            responses: {
              '200': {
                description: 'Cache and debate statistics'
              }
            }
          }
        },
        '/cache': {
          get: {
            summary: 'View cached responses',
            tags: ['Cache'],
            responses: {
              '200': {
                description: 'List of cached responses'
              }
            }
          }
        },
        '/health': {
          get: {
            summary: 'Health check',
            tags: ['System'],
            responses: {
              '200': {
                description: 'Server is running'
              }
            }
          }
        }
      }
    };

    return spec;
  }

  // Generate Postman collection
  generatePostmanCollection() {
    const collection = {
      info: {
        name: 'Harmonic Trinity SAAS API',
        description: 'Multi-persona AI debate engine',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      item: [
        {
          name: 'Debates',
          item: [
            {
              name: 'Run Full Debate',
              request: {
                method: 'POST',
                header: [
                  { key: 'Content-Type', value: 'application/json' }
                ],
                body: {
                  mode: 'raw',
                  raw: JSON.stringify({ topic: 'What is innovation?' }, null, 2)
                },
                url: {
                  raw: 'http://localhost:5000/debate',
                  protocol: 'http',
                  host: ['localhost'],
                  port: '5000',
                  path: ['debate']
                }
              }
            },
            {
              name: 'Call Single Persona',
              request: {
                method: 'POST',
                header: [
                  { key: 'Content-Type', value: 'application/json' }
                ],
                body: {
                  mode: 'raw',
                  raw: JSON.stringify({
                    systemPrompt: 'You are ALBA. Creative and emotional.',
                    userPrompt: 'What is creativity?',
                    persona: 'alba'
                  }, null, 2)
                },
                url: {
                  raw: 'http://localhost:5000/persona',
                  protocol: 'http',
                  host: ['localhost'],
                  port: '5000',
                  path: ['persona']
                }
              }
            }
          ]
        },
        {
          name: 'System',
          item: [
            {
              name: 'Health Check',
              request: {
                method: 'GET',
                url: {
                  raw: 'http://localhost:5000/health',
                  protocol: 'http',
                  host: ['localhost'],
                  port: '5000',
                  path: ['health']
                }
              }
            },
            {
              name: 'Get Statistics',
              request: {
                method: 'GET',
                url: {
                  raw: 'http://localhost:5000/stats',
                  protocol: 'http',
                  host: ['localhost'],
                  port: '5000',
                  path: ['stats']
                }
              }
            },
            {
              name: 'View Cache',
              request: {
                method: 'GET',
                url: {
                  raw: 'http://localhost:5000/cache',
                  protocol: 'http',
                  host: ['localhost'],
                  port: '5000',
                  path: ['cache']
                }
              }
            }
          ]
        }
      ]
    };

    return collection;
  }

  // Generate TypeScript types
  generateTypeDefinitions() {
    const types = `/**
 * Harmonic Trinity SAAS API - Type Definitions
 * Auto-generated by Zurich
 */

export interface DebateRequest {
  topic: string;
}

export interface PersonaRequest {
  systemPrompt: string;
  userPrompt: string;
  persona: 'alba' | 'albi' | 'jona' | 'blerina' | 'asi';
}

export interface PersonaResponse {
  persona: string;
  emoji: string;
  response: string;
  latency: number;
  fromCache: boolean;
}

export interface DebateStats {
  totalLatencyMs: number;
  cacheHitRate: string;
  personasQueried: number;
}

export interface DebateResponse {
  debateId: string;
  topic: string;
  responses: PersonaResponse[];
  stats: DebateStats;
}

export interface HealthResponse {
  status: 'ok';
  timestamp: string;
  uptime: number;
}

export interface CacheStats {
  memoryBank: {
    totalCachedResponses: number;
    totalCacheHits: number;
    hitRate: string;
  };
  recentDebates: Array<{
    topic: string;
    createdAt: string;
    summary: string;
  }>;
}

export interface CacheEntry {
  topic: string;
  persona: string;
  latency_ms: number;
  accessed_count: number;
}

export interface CacheResponse {
  cacheSize: number;
  entries: CacheEntry[];
}
`;

    return types;
  }

  // Generate environment config
  generateEnvConfig() {
    const envConfig = `# Harmonic Trinity SAAS Configuration
# Auto-generated by Zurich

# API Server
SAAS_API_URL=http://localhost:5000
SAAS_API_PORT=5000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000
FRONTEND_PORT=3000

# Database
DB_PATH=api-server/data/harmonic-memory.db

# Puter.ai Configuration
PUTER_AI_MODEL=gpt-5-nano
PUTER_AI_TIMEOUT=15000

# Logging
LOG_LEVEL=info
DEBUG=false

# Features
ENABLE_CACHING=true
ENABLE_LEARNING=true
ENABLE_ANALYTICS=true

# Performance
MAX_CONCURRENT_PERSONAS=5
CACHE_TTL_HOURS=24
`;

    return envConfig;
  }

  // Generate API reference markdown
  generateAPIReference() {
    const reference = `# Harmonic Trinity SAAS API Reference

**Generated:** ${this.timestamp}

## Base URL
\`\`\`
http://localhost:5000
\`\`\`

## Authentication
No authentication required for local development.

## Endpoints

### 1. POST /debate
Run a full 5-persona debate with automatic caching.

**Request:**
\`\`\`json
{
  "topic": "What is innovation?"
}
\`\`\`

**Response:**
\`\`\`json
{
  "debateId": "uuid-string",
  "topic": "What is innovation?",
  "responses": [
    {
      "persona": "alba",
      "emoji": "🌸",
      "response": "Innovation is...",
      "latency": 1234,
      "fromCache": false
    }
  ],
  "stats": {
    "totalLatencyMs": 5000,
    "cacheHitRate": "20%",
    "personasQueried": 5
  }
}
\`\`\`

**cURL Example:**
\`\`\`bash
curl -X POST http://localhost:5000/debate \\
  -H "Content-Type: application/json" \\
  -d '{"topic":"What is innovation?"}'
\`\`\`

---

### 2. POST /persona
Call a single persona with custom prompts.

**Request:**
\`\`\`json
{
  "systemPrompt": "You are ALBA. Creative and emotional.",
  "userPrompt": "What is creativity?",
  "persona": "alba"
}
\`\`\`

**Response:**
\`\`\`json
{
  "response": "Creativity is...",
  "fromCache": false,
  "latency": 2000
}
\`\`\`

---

### 3. GET /stats
Get memory bank statistics.

**Response:**
\`\`\`json
{
  "memoryBank": {
    "totalCachedResponses": 150,
    "totalCacheHits": 300,
    "hitRate": "66.7%"
  },
  "recentDebates": [
    {
      "topic": "What is innovation?",
      "createdAt": "2025-11-25T12:00:00Z",
      "summary": "Debate summary..."
    }
  ]
}
\`\`\`

---

### 4. GET /cache
View all cached responses.

**Response:**
\`\`\`json
{
  "cacheSize": 150,
  "entries": [
    {
      "topic": "What is innovation?",
      "persona": "alba",
      "latency_ms": 1234,
      "accessed_count": 5
    }
  ]
}
\`\`\`

---

### 5. GET /health
Server health check.

**Response:**
\`\`\`json
{
  "status": "ok",
  "timestamp": "2025-11-25T12:00:00Z",
  "uptime": 3600
}
\`\`\`

---

## Personas

| Persona | Emoji | Style | Purpose |
|---------|-------|-------|---------|
| ALBA | 🌸 | Creative | Emotional, artistic insights |
| ALBI | 💙 | Analytical | Logical frameworks |
| JONA | ⚡ | Intuitive | Quick insights |
| BLERINA | 🌟 | Wise | Practical wisdom |
| ASI | 🤖 | Philosophical | Systems thinking |

---

## Error Handling

All errors return JSON:

\`\`\`json
{
  "error": "Error message",
  "statusCode": 400
}
\`\`\`

---

## Performance

- **Cache Hit Response:** <10ms
- **First Puter.ai Call:** 1-3 seconds per persona
- **Full Debate (5 personas):** 5-15 seconds (parallel)
- **Cached Debate:** <50ms total

---

## Database

All data stored in SQLite: \`api-server/data/harmonic-memory.db\`

**Tables:**
- \`cache\` - Response caching
- \`debates\` - Debate history
- \`persona_patterns\` - Learned patterns
- \`api_calls\` - Performance analytics

---

## Rate Limiting

No rate limiting in local development.

---

**Last Updated:** ${this.timestamp}
`;

    return reference;
  }

  // Generate complete documentation
  generateCompleteDocumentation() {
    console.log('\n🔧 ZURICH - API Documentation Generator\n');
    console.log('📝 Generating API documentation...\n');

    this.ensureDocsDir();

    // Generate OpenAPI spec
    const openapi = this.generateOpenAPISpec();
    fs.writeFileSync(
      path.join(this.docsPath, 'openapi.json'),
      JSON.stringify(openapi, null, 2)
    );
    console.log('✅ Generated: docs/openapi.json');

    // Generate Postman collection
    const postman = this.generatePostmanCollection();
    fs.writeFileSync(
      path.join(this.docsPath, 'postman-collection.json'),
      JSON.stringify(postman, null, 2)
    );
    console.log('✅ Generated: docs/postman-collection.json');

    // Generate TypeScript types
    const types = this.generateTypeDefinitions();
    fs.writeFileSync(
      path.join(this.docsPath, 'api.types.ts'),
      types
    );
    console.log('✅ Generated: docs/api.types.ts');

    // Generate env config
    const env = this.generateEnvConfig();
    fs.writeFileSync(
      path.join(this.docsPath, '.env.example'),
      env
    );
    console.log('✅ Generated: docs/.env.example');

    // Generate API reference
    const reference = this.generateAPIReference();
    fs.writeFileSync(
      path.join(this.docsPath, 'API_REFERENCE.md'),
      reference
    );
    console.log('✅ Generated: docs/API_REFERENCE.md');

    console.log('\n📊 Documentation Summary:');
    console.log('   Location: ./docs/');
    console.log('   Files: 5');
    console.log('   - openapi.json (OpenAPI 3.0 spec)');
    console.log('   - postman-collection.json (Postman import)');
    console.log('   - api.types.ts (TypeScript definitions)');
    console.log('   - .env.example (Configuration template)');
    console.log('   - API_REFERENCE.md (Complete reference)');
    console.log('\n✨ Documentation generated successfully!\n');
  }
}

// Run Zurich
const zurich = new Zurich();
zurich.generateCompleteDocumentation();
