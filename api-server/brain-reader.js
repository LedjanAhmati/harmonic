// brain-reader.js
// Lexon CBOR chunks nga external disk dhe bën kërkime të thjeshta

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// NDRYSHO KËTË SIPAS DISKUT TËND:
const BASE_DIR = process.env.BRAIN_DIR || "E:\\harmonic-brain";

const DIRS = {
  apis: path.join(BASE_DIR, "apis"),
  docs: path.join(BASE_DIR, "docs"),
  concepts: path.join(BASE_DIR, "concepts"),
};

// Lexon të gjithë emrat e file-ve .json/.cbor/.bin në një folder
function listBrainFiles(dir) {
  if (!fs.existsSync(dir)) {
    console.warn(`Brain directory not found: ${dir}`);
    return [];
  }
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => {
        const ext = path.extname(f).toLowerCase();
        return [".cbor", ".json", ".bin"].includes(ext);
      })
      .map((f) => path.join(dir, f));
  } catch (e) {
    console.warn(`Error reading brain directory: ${dir}`, e.message);
    return [];
  }
}

// Lexon një file (JSON fallback për demo, CBOR për production)
function readBrainFile(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    
    // Provo JSON first
    try {
      return JSON.parse(buf.toString());
    } catch {
      // Fallback: treat as raw buffer with text search
      return { raw: buf.toString(), path: filePath };
    }
  } catch (e) {
    console.warn(`Error reading brain file: ${filePath}`, e.message);
    return null;
  }
}

// Naive search: filtron records duke parë në disa fusha tekstuale
function filterRecords(records, query, fields) {
  if (!Array.isArray(records)) {
    records = [records];
  }

  const q = query.toLowerCase();
  return records.filter((r) => {
    if (!r) return false;
    
    return fields.some((f) => {
      const v = r[f];
      if (!v) return false;
      const s = Array.isArray(v) 
        ? v.join(" ").toLowerCase() 
        : String(v).toLowerCase();
      return s.includes(q);
    });
  });
}

function searchInDir(type, query, limit = 50) {
  const dir = DIRS[type];
  if (!dir) {
    console.warn(`Unknown brain type: ${type}`);
    return [];
  }

  const files = listBrainFiles(dir);
  if (files.length === 0) {
    console.info(`No brain files found for type: ${type} in ${dir}`);
    return [];
  }

  const results = [];
  for (const file of files) {
    try {
      const data = readBrainFile(file);
      if (!data) continue;

      let records = Array.isArray(data) ? data : [data];
      let fields = [];

      if (type === "apis") {
        fields = ["name", "description", "group", "tags", "path", "endpoint"];
      }
      if (type === "docs") {
        fields = ["title", "summary", "body", "category", "keywords", "content"];
      }
      if (type === "concepts") {
        fields = ["name", "definition", "domain", "examples", "description"];
      }

      const matches = filterRecords(records, query, fields);
      for (const m of matches) {
        results.push({ ...m, _source: file });
        if (results.length >= limit) return results;
      }
    } catch (e) {
      console.warn(`Error processing brain file: ${file}`, e.message);
    }
  }

  return results;
}

function searchBrain(query, limits = { apis: 20, docs: 20, concepts: 20 }) {
  if (!query || query.trim().length === 0) {
    return {
      apis: [],
      docs: [],
      concepts: [],
      error: "empty_query"
    };
  }

  return {
    apis: searchInDir("apis", query, limits.apis || 20),
    docs: searchInDir("docs", query, limits.docs || 20),
    concepts: searchInDir("concepts", query, limits.concepts || 20),
  };
}

// Get brain stats
function getBrainStats() {
  const stats = {};
  
  for (const [type, dir] of Object.entries(DIRS)) {
    const files = listBrainFiles(dir);
    stats[type] = {
      files: files.length,
      directory: dir,
      exists: fs.existsSync(dir)
    };
  }

  return stats;
}

export {
  searchBrain,
  getBrainStats,
  listBrainFiles,
  readBrainFile,
};
