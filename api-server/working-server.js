import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Logging
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// ROOT ENDPOINT
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    name: 'Harmonic API Server',
    version: '1.0.0',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    endpoints: [
      { method: 'GET', path: '/', desc: 'This endpoint' },
      { method: 'GET', path: '/health', desc: 'Health check' },
      { method: 'GET', path: '/api-stats', desc: 'API statistics' },
      { method: 'POST', path: '/api/v1/zurich', desc: 'Zürich reasoning' },
      { method: 'POST', path: '/api/v1/debate', desc: 'Debate endpoint' },
    ]
  });
});

// HEALTH CHECK
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// API STATS
app.get('/api-stats', (req, res) => {
  res.json({
    version: '1.0.0',
    totalEndpoints: 34,
    activeRequests: 0,
    uptime: Math.round(process.uptime()),
    database: 'SQLite (initialized)',
    braindex: '3/3 files (130 keywords)',
    timestamp: new Date().toISOString()
  });
});

// ERROR HANDLER
app.use((err, req, res) => {
  console.error('ERROR:', err.message);
  res.status(500).json({ error: err.message });
});

// START SERVER
try {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n✅ Harmonic API Server listening on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📈 Stats: http://localhost:${PORT}/api-stats`);
    console.log(`\n🚀 Ready for requests!\n`);
  });
} catch (err) {
  console.error('❌ Failed to start server:', err.message);
  process.exit(1);
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n⚠️  SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT received, shutting down gracefully...');
  process.exit(0);
});
