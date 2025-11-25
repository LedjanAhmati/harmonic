# 🚀 Harmonic Trinity API Documentation

## Overview

Harmonic Trinity provides a comprehensive SAAS API infrastructure with **13,508 auto-generated endpoints** for multi-persona AI debate, analysis, and reasoning.

**Base URL:** `http://localhost:5000`

---

## Core Endpoints

### 1. Debate Endpoint

Generate multi-persona debates on any topic.

**POST** `/debate`

```bash
curl -X POST http://localhost:5000/debate \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "What is the future of AI?"
  }'
```

**Request Body:**
```json
{
  "topic": "string (required) - The debate topic"
}
```

**Response:**
```json
{
  "debateId": "uuid",
  "topic": "What is the future of AI?",
  "responses": [
    {
      "persona": "alba",
      "response": "string",
      "latency": 1234,
      "fromCache": false
    }
  ],
  "stats": {
    "totalLatencyMs": 5000,
    "cacheHitRate": "80%",
    "personasQueried": 5
  }
}
```

**Personas:**
- 🌸 **ALBA** - Creative, emotional, expressive
- 💙 **ALBI** - Analytical, logical, structured
- ⚡ **JONA** - Intuitive, fast, sharp
- 🌟 **BLERINA** - Wise, balanced, practical
- 🤖 **ASI** - Meta-philosophical, abstract

---

### 2. Single Persona Endpoint

Call a specific persona.

**POST** `/persona`

```bash
curl -X POST http://localhost:5000/persona \
  -H "Content-Type: application/json" \
  -d '{
    "persona": "alba",
    "systemPrompt": "You are ALBA...",
    "userPrompt": "What is leadership?"
  }'
```

**Request Body:**
```json
{
  "persona": "string (alba|albi|jona|blerina|asi)",
  "systemPrompt": "string - Persona system instructions",
  "userPrompt": "string - User question/topic"
}
```

---

### 3. Statistics Endpoint

Get cache and performance statistics.

**GET** `/stats`

```bash
curl http://localhost:5000/stats
```

**Response:**
```json
{
  "memoryBank": {
    "totalCachedResponses": 250,
    "totalCacheHits": 150,
    "hitRate": "60%"
  },
  "recentDebates": [
    {
      "topic": "AI Ethics",
      "createdAt": "2025-11-25T12:34:56Z",
      "summary": "Debate summary"
    }
  ]
}
```

---

### 4. Cache Endpoint

View cached responses.

**GET** `/cache`

```bash
curl http://localhost:5000/cache
```

**Response:**
```json
{
  "cacheSize": 50,
  "entries": [
    {
      "topic": "Leadership",
      "persona": "alba",
      "latency_ms": 1200,
      "accessed_count": 5
    }
  ]
}
```

---

### 5. API Statistics Endpoint

Real-time dashboard statistics.

**GET** `/api-stats`

```bash
curl http://localhost:5000/api-stats
```

**Response:**
```json
{
  "totalEndpoints": 13508,
  "debateRoutes": 13200,
  "personaRoutes": 220,
  "analysisRoutes": 88,
  "cacheHits": 1500,
  "cacheMisses": 300,
  "averageResponseTime": 850,
  "totalRequests": 1800,
  "uptime": "2.5h",
  "recentLogs": [
    {
      "timestamp": "12:34:56",
      "process": "API Generation",
      "status": "completed",
      "details": "Generated 50 new endpoints"
    }
  ]
}
```

---

### 6. Generate API Endpoint

Trigger programmatic API generation.

**POST** `/generate-api`

```bash
curl -X POST http://localhost:5000/generate-api \
  -H "Content-Type: application/json" \
  -d '{
    "topics": ["AI", "Leadership", "Innovation"],
    "perspectives": 5,
    "questions": 10
  }'
```

**Request Body:**
```json
{
  "topics": ["string"],
  "perspectives": "number - Number of perspectives",
  "questions": "number - Questions per topic"
}
```

---

### 7. Health Endpoint

Server health check.

**GET** `/health`

```bash
curl http://localhost:5000/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-25T12:34:56.123Z",
  "uptime": 12345.67
}
```

---

## Auto-Generated Routes

### Debate Routes (13,200 endpoints)

Pattern: `/api/debate/{topic}/{perspective}/{question}`

Examples:
- `POST /api/debate/leadership/creative/101`
- `POST /api/debate/innovation/analytical/205`
- `POST /api/debate/ethics/philosophical/340`

### Persona Routes (220 endpoints)

Pattern: `/api/persona/{personaId}/{topic}`

Examples:
- `POST /api/persona/alba/leadership`
- `POST /api/persona/albi/innovation`
- `POST /api/persona/jona/ethics`

### Analysis Routes (88 endpoints)

Pattern: `/api/analysis/{type}/{theme}`

Examples:
- `GET /api/analysis/comparative/debate-results`
- `GET /api/analysis/insights/persona-patterns`
- `POST /api/analysis/consensus/5-persona-debate`

---

## Database Schema

### Cache Table
```sql
CREATE TABLE cache (
  id INTEGER PRIMARY KEY,
  topic TEXT,
  persona TEXT,
  response TEXT,
  latency_ms INTEGER,
  accessed_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Debates Table
```sql
CREATE TABLE debates (
  id INTEGER PRIMARY KEY,
  debate_id TEXT UNIQUE,
  topic TEXT,
  responses JSON,
  summary TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Persona Patterns Table
```sql
CREATE TABLE persona_patterns (
  id INTEGER PRIMARY KEY,
  persona TEXT,
  topic TEXT,
  pattern TEXT,
  frequency INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### API Calls Table
```sql
CREATE TABLE api_calls (
  id INTEGER PRIMARY KEY,
  endpoint TEXT,
  method TEXT,
  status INTEGER,
  latency_ms INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Performance Optimization

### Caching Strategy
- **L1 Cache:** In-memory response cache (fastest)
- **L2 Cache:** SQLite persistent cache
- **TTL:** 24 hours per response
- **Hit Rate Target:** 80%+

### Response Times
- **Cached Response:** ~50-100ms
- **Fresh Generation:** ~1000-2000ms per persona
- **5-Persona Debate:** ~5000-10000ms (parallel)

---

## Error Handling

All errors return a JSON response:

```json
{
  "error": "Error message",
  "status": 400,
  "timestamp": "2025-11-25T12:34:56Z"
}
```

**Common Error Codes:**
- `400` - Bad Request (missing parameters)
- `404` - Not Found (invalid endpoint)
- `500` - Server Error (processing failed)

---

## Admin Endpoints

### Clear Cache
**POST** `/admin/clear-cache`

```bash
curl -X POST http://localhost:5000/admin/clear-cache
```

---

## Integration Examples

### JavaScript/TypeScript

```typescript
// Debate endpoint
const response = await fetch('http://localhost:5000/debate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ topic: 'What is innovation?' })
});

const data = await response.json();
console.log(data.responses);
```

### Python

```python
import requests

response = requests.post('http://localhost:5000/debate', json={
  'topic': 'What is leadership?'
})

print(response.json())
```

### cURL

```bash
curl -X POST http://localhost:5000/debate \
  -H "Content-Type: application/json" \
  -d '{"topic":"AI Ethics"}'
```

---

## Rate Limiting

- No strict rate limits implemented (local development)
- Production: Recommended 100 req/s per IP
- Cache hits bypass rate limiting

---

## WebSocket Support (Planned)

Real-time debate streaming via WebSocket:

```typescript
const ws = new WebSocket('ws://localhost:5000/debate-stream');
ws.send(JSON.stringify({ topic: 'Innovation' }));
ws.onmessage = (event) => console.log(event.data);
```

---

## Version History

- **v1.0** - Initial release with 13,508 endpoints
- **v1.1** - Added real-time statistics dashboard
- **v1.2** - Echo-cleaning in responses
- **v2.0** (planned) - WebSocket support, advanced analytics

---

## Support

For issues or feature requests, contact the development team.

**API Server:** http://localhost:5000
**Frontend:** http://localhost:3000
**Dashboard:** http://localhost:3000/lab/api-dashboard
