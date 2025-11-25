# Harmonic SAAS API Server

Local API server for Harmonic Trinity with memory bank and caching.

## Quick Start

```bash
# Install dependencies
npm install

# Initialize database
npm run db:init

# Start server
npm run dev  # Watch mode
npm start    # Production
```

Server runs on `http://localhost:5000`

## Endpoints

### POST /debate
Call all 5 personas with automatic caching

```bash
curl -X POST http://localhost:5000/debate \
  -H "Content-Type: application/json" \
  -d '{"topic":"What is the meaning of life?"}'
```

**Response:**
```json
{
  "debateId": "uuid",
  "topic": "What is the meaning of life?",
  "responses": [
    {
      "persona": "alba",
      "emoji": "🌸",
      "response": "...",
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
```

### POST /persona
Call single persona

```bash
curl -X POST http://localhost:5000/persona \
  -H "Content-Type: application/json" \
  -d '{
    "systemPrompt": "You are ALBA...",
    "userPrompt": "What do you think?",
    "persona": "alba"
  }'
```

### GET /stats
Memory bank statistics

```bash
curl http://localhost:5000/stats
```

### GET /cache
View cached responses

```bash
curl http://localhost:5000/cache
```

### GET /health
Health check

```bash
curl http://localhost:5000/health
```

### POST /admin/clear-cache
Clear all cached responses

```bash
curl -X POST http://localhost:5000/admin/clear-cache
```

## Memory Bank

Automatically stores:
- **Cache table**: Puter.ai responses by topic/persona
- **Debates table**: Full debate history for learning
- **Persona patterns**: Learned response patterns
- **API calls table**: Performance analytics

Location: `data/harmonic-memory.db` (SQLite)

## Features

✅ **Response Caching** - Identical topics return cached results instantly
✅ **Performance Analytics** - Track latency and cache hit rates
✅ **Debate History** - Store all debates for analysis
✅ **Learning Engine** - Foundation for persona improvement
✅ **8TB Storage Ready** - All data stored locally on your machine
