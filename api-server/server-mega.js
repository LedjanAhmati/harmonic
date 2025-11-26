import express from 'express';
import cors from 'cors';
import { PuterAIProxy } from './src/puter-proxy.js';
import { MemoryBank } from './src/memory-bank.js';
import { initializeDatabase } from './src/database.js';

const app = express();
const PORT = 5000;
const puterProxy = new PuterAIProxy();

app.use(cors());
app.use(express.json());

/**
 * AUTO-GENERATED API ROUTES
 * Thousands of endpoints created dynamically
 */

const TOPICS = [
  'innovation', 'leadership', 'creativity', 'technology', 'business',
  'philosophy', 'art', 'science', 'nature', 'society', 'future',
  'education', 'health', 'culture', 'politics', 'ethics', 'psychology',
  'mathematics', 'physics', 'biology', 'history', 'literature', 'music',
  'architecture', 'design', 'sports', 'food', 'travel', 'relationships',
  'money', 'success', 'happiness', 'meaning', 'consciousness', 'evolution',
  'artificial intelligence', 'quantum computing', 'climate change', 'space',
  'neuroscience', 'economics', 'sociology', 'anthropology', 'linguistics'
];

const PERSPECTIVES = [
  'creative', 'analytical', 'intuitive', 'practical', 'philosophical',
  'scientific', 'artistic', 'historical', 'futuristic', 'spiritual',
  'logical', 'emotional', 'pragmatic', 'idealistic', 'critical',
  'optimistic', 'skeptical', 'humorous', 'serious', 'poetic'
];

const QUESTIONS = [
  'What is?', 'Why is?', 'How does?', 'When will?', 'Where is?',
  'Who decides?', 'Is it possible?', 'What if?', 'Should we?',
  'Can we improve?', 'What are the implications?', 'What is the essence?',
  'How does it work?', 'What is the opposite?', 'What is missing?'
];

/**
 * Generate thousands of debate endpoints
 */
function generateDebateRoutes() {
  const routes = [];
  
  // Generate route for each topic-perspective-question combination
  TOPICS.forEach(topic => {
    PERSPECTIVES.forEach(perspective => {
      QUESTIONS.forEach(question => {
        const routeName = `/debate/${topic.replace(/\s+/g, '-')}/${perspective}/${question.replace(/\s+/g, '-')}`;
        
        app.post(routeName, async (req, res) => {
          try {
            const fullPrompt = `${question} ${topic} (from ${perspective} perspective)?`;
            const result = await puterProxy.callAllPersonas(fullPrompt);
            
            await MemoryBank.storeDebate(topic, fullPrompt, result.responses, `${perspective} view on ${topic}`);
            
            res.json({
              route: routeName,
              topic,
              perspective,
              question,
              ...result
            });
          } catch (err) {
            res.status(500).json({ error: err.message });
          }
        });
        
        routes.push(routeName);
      });
    });
  });
  
  return routes;
}

/**
 * Generate persona-specific endpoints (thousands more)
 */
function generatePersonaRoutes() {
  const personas = ['alba', 'albi', 'jona', 'blerina', 'asi'];
  const routes = [];
  
  TOPICS.forEach(topic => {
    personas.forEach(persona => {
      const routeName = `/persona/${persona}/${topic.replace(/\s+/g, '-')}`;
      
      app.post(routeName, async (req, res) => {
        try {
          const { userPrompt = `Tell me about ${topic}` } = req.body;
          
          const systemPrompts = {
            alba: 'You are ALBA. Creative, emotional, expressive.',
            albi: 'You are ALBI. Analytical, logical, structured.',
            jona: 'You are JONA. Intuitive, fast, sharp.',
            blerina: 'You are BLERINA. Wise, balanced, practical.',
            asi: 'You are ASI. Meta-philosophical, abstract, systems thinker.'
          };
          
          const result = await puterProxy.callPuterAI(
            systemPrompts[persona],
            userPrompt,
            persona
          );
          
          res.json({
            persona,
            topic,
            response: result.response,
            latency: result.latency,
            fromCache: result.fromCache
          });
        } catch (err) {
          res.status(500).json({ error: err.message });
        }
      });
      
      routes.push(routeName);
    });
  });
  
  return routes;
}

/**
 * Generate analysis endpoints (thousands more)
 */
function generateAnalysisRoutes() {
  const routes = [];
  
  TOPICS.forEach(topic => {
    // Comparative analysis
    app.get(`/analyze/compare/${topic.replace(/\s+/g, '-')}`, async (req, res) => {
      try {
        const debates = await MemoryBank.getRecentDebates(20);
        const filtered = debates.filter(d => d.topic.includes(topic));
        
        res.json({
          topic,
          debatesAnalyzed: filtered.length,
          summary: `Analysis of ${filtered.length} debates on ${topic}`
        });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
    
    // Topic insights
    app.get(`/insights/${topic.replace(/\s+/g, '-')}`, async (req, res) => {
      try {
        const stats = await MemoryBank.getCacheStats();
        res.json({
          topic,
          cached: stats.total,
          insights: `Comprehensive insights on ${topic}`
        });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
    
    routes.push(`/analyze/compare/${topic.replace(/\s+/g, '-')}`);
    routes.push(`/insights/${topic.replace(/\s+/g, '-')}`);
  });
  
  return routes;
}

/**
 * Initialize and start
 */
async function start() {
  try {
    await initializeDatabase();
    
    console.log('\n🚀 Generating thousands of API endpoints...\n');
    
    const debateRoutes = generateDebateRoutes();
    const personaRoutes = generatePersonaRoutes();
    const analysisRoutes = generateAnalysisRoutes();
    
    const totalRoutes = debateRoutes.length + personaRoutes.length + analysisRoutes.length;
    
    console.log(`✅ Generated ${totalRoutes} API endpoints!\n`);
    console.log(`   📊 Debate routes: ${debateRoutes.length}`);
    console.log(`   👤 Persona routes: ${personaRoutes.length}`);
    console.log(`   🔍 Analysis routes: ${analysisRoutes.length}\n`);
    
    // Core endpoints (still available)
    app.post('/debate', async (req, res) => {
      const { topic } = req.body;
      if (!topic) return res.status(400).json({ error: 'Topic required' });
      
      try {
        const result = await puterProxy.callAllPersonas(topic);
        await MemoryBank.storeDebate(topic, topic, result.responses, 'Main debate');
        res.json(result);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
    
    app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok',
        totalEndpoints: totalRoutes,
        timestamp: new Date().toISOString()
      });
    });
    
    app.get('/routes', (req, res) => {
      res.json({
        totalEndpoints: totalRoutes,
        debateRoutes: debateRoutes.slice(0, 10),
        personaRoutes: personaRoutes.slice(0, 10),
        analysisRoutes: analysisRoutes.slice(0, 10),
        message: `Showing first 30 of ${totalRoutes} endpoints`
      });
    });
    
    app.listen(PORT, () => {
      console.log(`🌐 API running on http://localhost:${PORT}`);
      console.log(`📚 View all routes: http://localhost:${PORT}/routes\n`);
    });
    
  } catch (err) {
    console.error('❌ Failed to start:', err);
    process.exit(1);
  }
}

start();
