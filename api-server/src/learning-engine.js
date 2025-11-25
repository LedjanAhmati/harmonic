import { getDatabase } from './database.js';
import { v4 as uuidv4 } from 'uuid';

export class LearningEngine {
  /**
   * Analyze debates to learn patterns
   */
  static async analyzeBehavior(limit = 50) {
    try {
      const db = await getDatabase();

      return new Promise((resolve, reject) => {
        db.all(
          `SELECT * FROM debates WHERE learned = 0 ORDER BY created_at DESC LIMIT ?`,
          [limit],
          async (err, debates) => {
            if (err) {
              db.close();
              reject(err);
              return;
            }

            const patterns = {};

            for (const debate of debates) {
              const responses = JSON.parse(debate.responses);
              
              for (const r of responses) {
                const persona = r.persona;
                if (!patterns[persona]) {
                  patterns[persona] = {
                    avgLatency: 0,
                    responseLength: 0,
                    cacheHits: 0,
                    count: 0
                  };
                }

                patterns[persona].avgLatency += r.latency || 0;
                patterns[persona].responseLength += r.response.length;
                if (r.fromCache) patterns[persona].cacheHits++;
                patterns[persona].count++;
              }
            }

            // Calculate averages and store patterns
            for (const [persona, stats] of Object.entries(patterns)) {
              const patternId = uuidv4();
              const successRate = stats.cacheHits / stats.count;
              
              db.run(
                `INSERT INTO persona_patterns (id, persona, pattern, success_rate)
                 VALUES (?, ?, ?, ?)`,
                [patternId, persona, JSON.stringify(stats), successRate],
                (err) => {
                  if (err) console.error('Pattern insert error:', err);
                }
              );
            }

            // Mark debates as learned
            if (debates.length > 0) {
              const ids = debates.map(d => d.id);
              db.run(
                `UPDATE debates SET learned = 1 WHERE id IN (${ids.map(() => '?').join(',')})`,
                ids,
                (err) => {
                  db.close();
                  if (err) reject(err);
                  else resolve({
                    analyzed: debates.length,
                    patterns: Object.keys(patterns)
                  });
                }
              );
            } else {
              db.close();
              resolve({ analyzed: 0, patterns: [] });
            }
          }
        );
      });
    } catch (err) {
      console.error('Analysis error:', err);
      return { analyzed: 0, patterns: [] };
    }
  }

  /**
   * Get persona performance metrics
   */
  static async getPersonaMetrics(persona) {
    try {
      const db = await getDatabase();

      return new Promise((resolve, reject) => {
        db.all(
          `SELECT * FROM persona_patterns WHERE persona = ? ORDER BY updated_at DESC LIMIT 10`,
          [persona],
          (err, rows) => {
            db.close();
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });
    } catch (err) {
      console.error('Metrics error:', err);
      return [];
    }
  }

  /**
   * Get top performing cache patterns
   */
  static async getTopPatterns(limit = 10) {
    try {
      const db = await getDatabase();

      return new Promise((resolve, reject) => {
        db.all(
          `SELECT persona, pattern, success_rate FROM persona_patterns 
           ORDER BY success_rate DESC LIMIT ?`,
          [limit],
          (err, rows) => {
            db.close();
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });
    } catch (err) {
      console.error('Top patterns error:', err);
      return [];
    }
  }

  /**
   * Get debate analytics dashboard
   */
  static async getDashboard() {
    try {
      const db = await getDatabase();

      return new Promise((resolve, reject) => {
        db.all(
          `SELECT 
            COUNT(DISTINCT id) as total_debates,
            AVG((SELECT AVG(CAST(json_extract(responses, '$[*].latency') AS INTEGER)) FROM json_each(responses))) as avg_latency,
            COUNT(CASE WHEN quality_score > 75 THEN 1 END) as high_quality,
            DATE(created_at) as date
          FROM debates
          GROUP BY DATE(created_at)
          ORDER BY date DESC
          LIMIT 30`,
          (err, rows) => {
            db.close();
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });
    } catch (err) {
      console.error('Dashboard error:', err);
      return [];
    }
  }
}
