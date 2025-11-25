// Minimal working server for testing
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: Date.now() });
});

// Zürich
app.post('/v1/zurich', (req, res) => {
  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'missing_prompt' });
  
  res.json({
    ok: true,
    prompt,
    stages: {
      input: prompt,
      analysis: `Analyzed: ${prompt.length} chars`,
      synthesis: 'Generated insights',
      output: 'Final result'
    }
  });
});

// Debate
app.post('/v1/debate', (req, res) => {
  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'missing_prompt' });
  
  res.json({
    ok: true,
    prompt,
    personas: {
      alba: 'Optimistic view: ' + prompt,
      albi: 'Pragmatic view: ' + prompt,
      jona: 'Skeptical view: ' + prompt,
      blerina: 'Analytical view: ' + prompt,
      asi: 'Meta view: ' + prompt
    }
  });
});

// Info
app.get('/v1/info', (req, res) => {
  res.json({
    ok: true,
    name: 'Harmonic Reasoning API',
    version: '1.0.0',
    endpoints: [
      'GET /health',
      'POST /v1/zurich',
      'POST /v1/debate',
      'GET /v1/info'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🎼 Harmonic API running on http://localhost:${PORT}`);
  console.log('Available endpoints: /health, /v1/zurich, /v1/debate, /v1/info');
});
