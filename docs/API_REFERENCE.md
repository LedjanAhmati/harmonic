# Harmonic Trinity SAAS API Reference

**Generated:** 2025-11-25T12:23:20.345Z

## Base URL
```
http://localhost:5000
```

## Authentication
No authentication required for local development.

## Endpoints

### 1. POST /debate
Run a full 5-persona debate with automatic caching.

**Request:**
```json
{
  "topic": "What is innovation?"
}
```

**Response:**
```json
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
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/debate \
  -H "Content-Type: application/json" \
  -d '{"topic":"What is innovation?"}'
```

---

### 2. POST /persona
Call a single persona with custom prompts.

**Request:**
```json
{
  "systemPrompt": "You are ALBA. Creative and emotional.",
  "userPrompt": "What is creativity?",
  "persona": "alba"
}
```

**Response:**
```json
{
  "response": "Creativity is...",
  "fromCache": false,
  "latency": 2000
}
```

---

### 3. GET /stats
Get memory bank statistics.

**Response:**
```json
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
```

---

### 4. GET /cache
View all cached responses.

**Response:**
```json
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
```

---

### 5. GET /health
Server health check.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-25T12:00:00Z",
  "uptime": 3600
}
```

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

```json
{
  "error": "Error message",
  "statusCode": 400
}
```

---

## Performance

- **Cache Hit Response:** <10ms
- **First Puter.ai Call:** 1-3 seconds per persona
- **Full Debate (5 personas):** 5-15 seconds (parallel)
- **Cached Debate:** <50ms total

---

## Database

All data stored in SQLite: `api-server/data/harmonic-memory.db`

**Tables:**
- `cache` - Response caching
- `debates` - Debate history
- `persona_patterns` - Learned patterns
- `api_calls` - Performance analytics

---

## Rate Limiting

No rate limiting in local development.

---

**Last Updated:** 2025-11-25T12:23:20.345Z
