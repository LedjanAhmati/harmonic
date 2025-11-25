import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '../data/harmonic-memory.db');

export function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Database connection error:', err);
        reject(err);
        return;
      }

      // Create tables for memory bank
      db.serialize(() => {
        // Cache table for Puter.ai responses
        db.run(`
          CREATE TABLE IF NOT EXISTS cache (
            id TEXT PRIMARY KEY,
            topic TEXT NOT NULL,
            persona TEXT NOT NULL,
            system_prompt TEXT,
            response TEXT NOT NULL,
            model TEXT DEFAULT 'gpt-5-nano',
            tokens_used INTEGER,
            latency_ms INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            accessed_count INTEGER DEFAULT 1,
            last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(topic, persona, system_prompt)
          )
        `, (err) => {
          if (err) console.error('Cache table error:', err);
        });

        // Debate history for learning
        db.run(`
          CREATE TABLE IF NOT EXISTS debates (
            id TEXT PRIMARY KEY,
            topic TEXT NOT NULL,
            user_query TEXT,
            responses JSON NOT NULL,
            summary TEXT,
            quality_score REAL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            learned BOOLEAN DEFAULT 0
          )
        `, (err) => {
          if (err) console.error('Debates table error:', err);
        });

        // Persona patterns - learned from debates
        db.run(`
          CREATE TABLE IF NOT EXISTS persona_patterns (
            id TEXT PRIMARY KEY,
            persona TEXT NOT NULL,
            pattern TEXT NOT NULL,
            frequency INTEGER DEFAULT 1,
            success_rate REAL DEFAULT 0.5,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) console.error('Persona patterns table error:', err);
        });

        // API usage analytics
        db.run(`
          CREATE TABLE IF NOT EXISTS api_calls (
            id TEXT PRIMARY KEY,
            endpoint TEXT NOT NULL,
            method TEXT NOT NULL,
            personas_called INTEGER,
            total_latency_ms INTEGER,
            cache_hits INTEGER,
            puter_calls INTEGER,
            success BOOLEAN,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) console.error('API calls table error:', err);
          else {
            console.log('✅ Database initialized successfully');
            db.close();
            resolve(true);
          }
        });
      });
    });
  });
}

export function getDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) reject(err);
      else resolve(db);
    });
  });
}
