import { getDatabase } from './database.js';
import { v4 as uuidv4 } from 'uuid';

export class MemoryBank {
  // Check cache for persona response
  static async getCachedResponse(topic, persona, systemPrompt) {
    try {
      const db = await getDatabase();
      
      return new Promise((resolve, reject) => {
        db.get(
          `SELECT response, latency_ms FROM cache 
           WHERE topic = ? AND persona = ? AND system_prompt = ?
           ORDER BY last_accessed DESC LIMIT 1`,
          [topic, persona, systemPrompt],
          (err, row) => {
            db.close();
            if (err) reject(err);
            else resolve(row || null);
          }
        );
      });
    } catch (err) {
      console.error('Cache retrieval error:', err);
      return null;
    }
  }

  // Store Puter.ai response in cache
  static async cacheResponse(topic, persona, systemPrompt, response, latencyMs, model = 'gpt-5-nano') {
    try {
      const db = await getDatabase();
      const cacheId = uuidv4();

      return new Promise((resolve, reject) => {
        db.run(
          `INSERT OR IGNORE INTO cache (id, topic, persona, system_prompt, response, latency_ms, model)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [cacheId, topic, persona, systemPrompt, response, latencyMs, model],
          (err) => {
            db.close();
            if (err) reject(err);
            else resolve(cacheId);
          }
        );
      });
    } catch (err) {
      console.error('Cache storage error:', err);
      return null;
    }
  }

  // Store entire debate for analysis
  static async storeDebate(topic, userQuery, responses, summary) {
    try {
      const db = await getDatabase();
      const debateId = uuidv4();

      return new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO debates (id, topic, user_query, responses, summary, quality_score)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [debateId, topic, userQuery, JSON.stringify(responses), summary, Math.random() * 100],
          (err) => {
            db.close();
            if (err) reject(err);
            else resolve(debateId);
          }
        );
      });
    } catch (err) {
      console.error('Debate storage error:', err);
      return null;
    }
  }

  // Get cache hit rate
  static async getCacheStats() {
    try {
      const db = await getDatabase();

      return new Promise((resolve, reject) => {
        db.all(
          `SELECT COUNT(*) as total, SUM(accessed_count) as total_hits FROM cache`,
          (err, rows) => {
            db.close();
            if (err) reject(err);
            else resolve(rows[0] || { total: 0, total_hits: 0 });
          }
        );
      });
    } catch (err) {
      console.error('Cache stats error:', err);
      return { total: 0, total_hits: 0 };
    }
  }

  // Get debate analysis for learning
  static async getRecentDebates(limit = 10) {
    try {
      const db = await getDatabase();

      return new Promise((resolve, reject) => {
        db.all(
          `SELECT * FROM debates ORDER BY created_at DESC LIMIT ?`,
          [limit],
          (err, rows) => {
            db.close();
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });
    } catch (err) {
      console.error('Recent debates retrieval error:', err);
      return [];
    }
  }

  // Track API performance
  static async logApiCall(endpoint, method, personasCount, latencyMs, cacheHits, puterCalls, success) {
    try {
      const db = await getDatabase();
      const callId = uuidv4();

      return new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO api_calls (id, endpoint, method, personas_called, total_latency_ms, cache_hits, puter_calls, success)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [callId, endpoint, method, personasCount, latencyMs, cacheHits, puterCalls, success ? 1 : 0],
          (err) => {
            db.close();
            if (err) reject(err);
            else resolve(callId);
          }
        );
      });
    } catch (err) {
      console.error('API logging error:', err);
      return null;
    }
  }
}
