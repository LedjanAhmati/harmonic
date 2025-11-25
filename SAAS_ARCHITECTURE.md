# Harmonic Trinity SAAS Architecture

Your custom local SAAS API is now live! Here's what's running:

## 🚀 System Overview

```
┌─────────────────────────────────────────────────────┐
│           Harmonic Trinity Frontend                  │
│        (Next.js on port 3000)                       │
│       /harmonic page with debate UI                  │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ POST /debate
                   │ {topic: "..."}
                   ▼
┌─────────────────────────────────────────────────────┐
│      Harmonic SAAS API Server                        │
│     (Express.js on port 5000)                       │
│                                                     │
│  ├─ Puter.ai Proxy Layer                           │
│  ├─ Memory Bank (SQLite)                           │
│  │  ├─ Response Cache                              │
│  │  ├─ Debate History                              │
│  │  ├─ Persona Patterns                            │
│  │  └─ API Analytics                               │
│  └─ Learning Engine                                │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ Puter.ai Chat API
                   │ (browser-based, called from client)
                   ▼
        🌐 Puter.ai Cloud Service
```

## 📊 Running Services

### Main App (Next.js)
- **URL**: http://localhost:3000
- **Port**: 3000
- **Location**: `c:\Users\Admin\Desktop\harmonic`
- **Command**: `npm run dev`

### SAAS API Server
- **URL**: http://localhost:5000
- **Port**: 5000
- **Location**: `c:\Users\Admin\Desktop\harmonic\api-server`
- **Command**: `npm run dev` or `node server.js`
- **Database**: `api-server/data/harmonic-memory.db` (SQLite)

## 🔄 API Cycle Flow

### 1. User Debate Request
```
User enters: "What makes a great leader?"
↓
Frontend sends to SAAS API: POST /debate
```

### 2. SAAS API Processing
```
1. Check cache for identical topics
   ├─ IF FOUND: Return cached responses (instant ⚡)
   └─ IF NOT FOUND: Call Puter.ai for each persona

2. Call 5 personas in parallel:
   ├─ ALBA (🌸 Creative)
   ├─ ALBI (💙 Analytical)
   ├─ JONA (⚡ Intuitive)
   ├─ BLERINA (🌟 Wise)
   └─ ASI (🤖 Philosophical)

3. Store responses in memory bank cache

4. Log performance metrics
```

### 3. Response to Frontend
```
{
  "debateId": "uuid",
  "topic": "What makes a great leader?",
  "responses": [
    {
      "persona": "alba",
      "emoji": "🌸",
      "response": "...",
      "latency": 1234,
      "fromCache": false
    },
    ...
  ],
  "stats": {
    "totalLatencyMs": 5000,
    "cacheHitRate": "20%",
    "personasQueried": 5
  }
}
```

## 💾 Memory Bank Database

Location: `api-server/data/harmonic-memory.db`

### Tables

#### `cache`
Stores Puter.ai responses by topic/persona
```
- id (uuid)
- topic
- persona
- system_prompt
- response (full text)
- latency_ms
- accessed_count
- last_accessed
```

#### `debates`
Complete debate history for learning and analysis
```
- id (uuid)
- topic
- user_query
- responses (JSON)
- summary
- quality_score
- created_at
- learned (flag for analysis)
```

#### `persona_patterns`
Learned patterns from analyzed debates
```
- id (uuid)
- persona
- pattern (JSON)
- frequency
- success_rate
- updated_at
```

#### `api_calls`
Performance analytics
```
- id (uuid)
- endpoint
- method
- personas_called
- total_latency_ms
- cache_hits
- puter_calls
- success
- created_at
```

## 🧠 Learning Engine

**Location**: `api-server/src/learning-engine.js`

The learning engine analyzes past debates to:
- ✅ Track persona performance metrics
- ✅ Identify effective response patterns
- ✅ Measure cache hit rates
- ✅ Generate performance dashboards

### Usage (from API endpoints)

```bash
# Analyze recent debates
POST http://localhost:5000/admin/analyze

# Get persona metrics
GET http://localhost:5000/metrics/alba

# Get top patterns
GET http://localhost:5000/patterns/top

# Get dashboard
GET http://localhost:5000/dashboard
```

## 📡 API Endpoints

### Core Debate Endpoint
```bash
POST http://localhost:5000/debate
Body: {"topic": "Your question"}
Response: Full debate with all 5 personas + stats
```

### Single Persona Call
```bash
POST http://localhost:5000/persona
Body: {
  "systemPrompt": "You are ALBA...",
  "userPrompt": "Question",
  "persona": "alba"
}
```

### Statistics
```bash
GET http://localhost:5000/stats
# Returns cache stats and recent debates
```

### View Cache
```bash
GET http://localhost:5000/cache
# Shows cached responses
```

### Health Check
```bash
GET http://localhost:5000/health
# Returns server status and uptime
```

### Admin: Clear Cache
```bash
POST http://localhost:5000/admin/clear-cache
# Wipes all cached responses
```

## ⚙️ Configuration

### Customize Personas
Edit `api-server/src/puter-proxy.js` → `callAllPersonas()` function

### Adjust Timeouts
Edit `api-server/src/puter-proxy.js` → `callPuterAI()` method

### Change API Port
Edit `api-server/server.js` → `const PORT = 5000`

## 📈 Storage Usage

With your **8TB local drive**, storage is virtually unlimited:
- 1 debate ≈ 5-10 KB
- **1 million debates** ≈ 10 GB
- Your 8TB can store **800+ million debates**

Perfect for long-term learning and analysis!

## 🚀 Next Steps

### 1. Test the System
```bash
# In browser: http://localhost:3000/harmonic
# Type a question and submit
# Watch all 5 personas respond via SAAS API
```

### 2. Monitor Performance
```bash
# Check cache hit rate
curl http://localhost:5000/stats

# View cached debates
curl http://localhost:5000/cache
```

### 3. Analyze Learning
```bash
# Get analytics
curl http://localhost:5000/dashboard
```

### 4. Scale Features (Optional)
- Add WebSocket for real-time debate streaming
- Implement debate branching/threading
- Add user authentication
- Create multi-user debate rooms
- Build analytics dashboard UI

## 🔧 Troubleshooting

### API not responding?
```bash
# Check if running
curl http://localhost:5000/health

# Restart
cd api-server
node server.js
```

### Cache not working?
```bash
# View cache
curl http://localhost:5000/cache

# Clear cache
curl -X POST http://localhost:5000/admin/clear-cache
```

### Database locked?
```bash
# The database handles concurrent access
# If stuck, you can safely delete:
rm api-server/data/harmonic-memory.db
npm run db:init  # Recreate empty DB
```

## 📝 Files Created

```
api-server/
  ├── server.js                # Express API server
  ├── package.json              # Dependencies
  ├── README.md                 # API documentation
  ├── data/
  │   └── harmonic-memory.db   # SQLite database
  ├── scripts/
  │   └── init-db.js            # Database initialization
  └── src/
      ├── database.js           # Database management
      ├── memory-bank.js        # Caching layer
      ├── puter-proxy.js        # Puter.ai proxy
      └── learning-engine.js    # Analysis engine

Updated files:
  └── app/harmonic/page.tsx    # Frontend now calls SAAS API
```

## 🎯 Your SAAS is Ready!

✅ Custom API server running on port 5000
✅ SQLite memory bank with persistent storage
✅ Automatic response caching
✅ Learning engine for analysis
✅ Frontend integrated with SAAS API
✅ 8TB storage capacity ready

**Start debating with real AI!** 🎼

Go to http://localhost:3000/harmonic and try it now.
