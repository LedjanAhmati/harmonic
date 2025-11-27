#!/usr/bin/env node

/**
 * Generate Harmonic API Documentation PDF
 * Creates a compressed PDF with all API endpoints documentation
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, '..', 'Harmonic-API-Documentation.pdf');

// Create PDF document
const doc = new PDFDocument({
  bufferPages: true,
  compress: true, // Enable compression
  size: 'A4',
  margin: 40,
});

// Pipe to file
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// Title Page
doc.fontSize(28).font('Helvetica-Bold').text('HARMONIC API', 100, 150);
doc.fontSize(16).font('Helvetica').text('Complete Documentation', 100, 200);
doc.fontSize(12).text('v1.0.0', 100, 230);
doc.fontSize(10).fillColor('#666').text(`Generated: ${new Date().toISOString()}`, 100, 260);

doc.addPage();

// Table of Contents
doc.fontSize(16).font('Helvetica-Bold').fillColor('#000').text('Table of Contents', 50, 50);
doc.fontSize(11).font('Helvetica');
const toc = [
  '1. Overview',
  '2. Authentication',
  '3. Core Endpoints (v1)',
  '4. Managers Endpoints',
  '5. Translation & Language',
  '6. Science & Knowledge',
  '7. Advanced Features',
  '8. Error Handling',
  '9. Rate Limiting',
  '10. Examples',
];

let tocY = 80;
toc.forEach(item => {
  doc.text(item, 70, tocY);
  tocY += 20;
});

// Section: Overview
doc.addPage();
doc.fontSize(14).font('Helvetica-Bold').text('1. OVERVIEW', 50, 50);
doc.fontSize(11).font('Helvetica').text(`
Harmonic is a multi-layer reasoning API that combines:
• Trinity: 5-persona AI debate system
• Zürich: Deterministic logic engine
• Brain: 8TB knowledge memory
• ASI: Meta-layer fusion system

Base URLs:
• Frontend: http://localhost:3000
• API (Dev): http://localhost:5000
• Next.js API: http://localhost:3000/api

Total Endpoints: 34
Response Format: JSON
`, 50, 90, { align: 'left', width: 500 });

// Section: Authentication
doc.addPage();
doc.fontSize(14).font('Helvetica-Bold').text('2. AUTHENTICATION', 50, 50);
doc.fontSize(11).font('Helvetica').text(`
POST /api/v1/auth/signup
Create a new account

Body:
{
  "email": "user@example.com",
  "password": "secure_password",
  "username": "username"
}

Response:
{
  "ok": true,
  "userId": "user_id",
  "token": "jwt_token",
  "tier": "free"
}

POST /api/v1/auth/login
Login to existing account

GET /api/v1/user/me
Get current user info (requires auth)
`, 50, 90, { align: 'left', width: 500 });

// Section: Core Endpoints
doc.addPage();
doc.fontSize(14).font('Helvetica-Bold').text('3. CORE ENDPOINTS (v1)', 50, 50);
doc.fontSize(10).font('Helvetica-Bold').text('POST /api/v1/zurich', 50, 90);
doc.fontSize(10).font('Helvetica').text('Deterministic reasoning (Zürich cycle)', 50, 105);
doc.text('Body: { "prompt": "your question" }', 50, 120);

doc.fontSize(10).font('Helvetica-Bold').text('POST /api/v1/debate', 50, 150);
doc.fontSize(10).font('Helvetica').text('Multi-persona debate', 50, 165);
doc.text('Body: { "topic": "debate topic" }', 50, 180);

doc.fontSize(10).font('Helvetica-Bold').text('POST /api/v1/asi-fusion', 50, 210);
doc.fontSize(10).font('Helvetica').text('Combined Trinity + Zürich + Brain reasoning', 50, 225);
doc.text('Body: { "query": "your question" }', 50, 240);

doc.fontSize(10).font('Helvetica-Bold').text('POST /api/v1/cycle/run', 50, 270);
doc.fontSize(10).font('Helvetica').text('Full 8-stage Zürich reasoning cycle', 50, 285);
doc.text('Body: { "input": "topic", "config": {} }', 50, 300);

doc.fontSize(10).font('Helvetica-Bold').text('GET /api/v1/info', 50, 330);
doc.fontSize(10).font('Helvetica').text('API information & endpoint listing', 50, 345);

// Section: Data Managers
doc.addPage();
doc.fontSize(14).font('Helvetica-Bold').text('4. DATA MANAGERS', 50, 50);
doc.fontSize(11).font('Helvetica').text(`
POST /api/v1/data
Fetch from 5 data sources (Wiki, ArXiv, News, Weather, Curiosity)

Query Parameters:
- query: Search query (required)
- mode: "single" or "comprehensive"
- sources: ["wiki", "arxiv", "news", "weather", "curiosity"]

GET /api/v1/data?action=stats
Get data pipeline statistics

POST /api/v1/managers
Orchestrate persona managers (Alba, Albi, Jona, Blerina, ASI)

Actions:
- "alba-gather": Collect information
- "albi-store": Store in memory
- "jona-check": Security verification
- "blerina-generate": Generate documentation
- "asi-verify": Quality verification
`, 50, 90, { align: 'left', width: 500 });

// Section: Translation & Language
doc.addPage();
doc.fontSize(14).font('Helvetica-Bold').text('5. TRANSLATION & LANGUAGE', 50, 50);
doc.fontSize(11).font('Helvetica').text(`
POST /api/v1/translate
Translate text to 24 languages

Body: {
  "text": "Hello world",
  "targetLang": "sq",
  "sourceLang": "en"
}

POST /api/v1/detect-language
Auto-detect text language

Body: { "text": "Përshëndetje" }

GET /api/v1/languages
List all 24 supported languages

Supported Languages: English, Albanian, Greek, German, Spanish,
Turkish, Russian, Mandarin Chinese, Hindi, Arabic, Hebrew,
Italian, Bulgarian, Swedish, Norwegian, Dutch, French,
Portuguese, Japanese, Korean, Polish, Vietnamese, Thai, Indonesian
`, 50, 90, { align: 'left', width: 500 });

// Section: Science & Knowledge
doc.addPage();
doc.fontSize(14).font('Helvetica-Bold').text('6. SCIENCE & KNOWLEDGE', 50, 50);
doc.fontSize(11).font('Helvetica').text(`
GET /api/v1/science
Get science facts and curiosity database

Query Parameters:
- domain: "biology", "physics", "medicine", "ai", "environment"
- count: Number of facts (default: 5)

Response:
{
  "facts": ["fact 1", "fact 2", ...],
  "domain": "biology",
  "count": 5
}

GET /api/v1/dot?type=harmonic
Generate Graphviz DOT diagrams

Available types:
- "harmonic": System architecture
- "zurich": 9-stage reasoning cycle
- "trinity": 5-persona debate flow
- "brain": Memory indexer structure
- "reasoning": Full reasoning pipeline
`, 50, 90, { align: 'left', width: 500 });

// Section: Usage & Metrics
doc.addPage();
doc.fontSize(14).font('Helvetica-Bold').text('7. USAGE & METRICS', 50, 50);
doc.fontSize(11).font('Helvetica').text(`
GET /api/v1/usage
Get current API usage statistics

Response:
{
  "userId": "user_id",
  "tier": "free|pro|enterprise",
  "requests": 45,
  "limit": 1000,
  "resetDate": "2025-12-27T00:00:00Z"
}

GET /api/health
Basic health check

GET /api/v1/managers?action=health
Detailed manager health status

GET /api/v1/managers?action=metrics
Performance metrics for all personas
`, 50, 90, { align: 'left', width: 500 });

// Section: Error Handling
doc.addPage();
doc.fontSize(14).font('Helvetica-Bold').text('8. ERROR HANDLING', 50, 50);
doc.fontSize(11).font('Helvetica').text(`
All errors return JSON with status codes:

400 Bad Request
{
  "ok": false,
  "error": "validation_error",
  "message": "Description"
}

401 Unauthorized
{
  "ok": false,
  "error": "auth_required",
  "message": "Invalid or missing API key"
}

429 Too Many Requests
{
  "ok": false,
  "error": "rate_limited",
  "resetIn": 3600
}

500 Internal Server Error
{
  "ok": false,
  "error": "server_error",
  "message": "Something went wrong"
}
`, 50, 90, { align: 'left', width: 500 });

// Section: Examples
doc.addPage();
doc.fontSize(14).font('Helvetica-Bold').text('9. QUICK EXAMPLES', 50, 50);
doc.fontSize(10).font('Helvetica-Bold').text('Example 1: Ask Harmonic a question', 50, 90);
doc.fontSize(9).font('Courier').text(`
curl -X POST http://localhost:3000/api/v1/asi-fusion \\
  -H "Content-Type: application/json" \\
  -d '{"query": "What is machine learning?"}'
`, 50, 105, { width: 500 });

doc.fontSize(10).font('Helvetica-Bold').text('Example 2: Translate text', 50, 180);
doc.fontSize(9).font('Courier').text(`
curl -X POST http://localhost:3000/api/v1/translate \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Hello",
    "targetLang": "sq"
  }'
`, 50, 195, { width: 500 });

doc.fontSize(10).font('Helvetica-Bold').text('Example 3: Get science facts', 50, 270);
doc.fontSize(9).font('Courier').text(`
curl http://localhost:3000/api/v1/science?domain=biology
`, 50, 285, { width: 500 });

// Final page: Footer
doc.addPage();
doc.fontSize(12).font('Helvetica-Bold').text('HARMONIC API REFERENCE', 50, 50);
doc.fontSize(10).font('Helvetica').text(`
For more information:
• GitHub: https://github.com/LedjanAhmati/harmonic
• Website: http://localhost:3000
• API Base: http://localhost:3000/api

Support:
• Email: support@harmonic-ai.com
• Issues: GitHub Issues

Documentation Last Updated: ${new Date().toLocaleDateString()}
`, 50, 100);

// Finalize PDF
doc.end();

// Wait for stream to finish
stream.on('finish', () => {
  const stats = fs.statSync(outputPath);
  const sizeKB = (stats.size / 1024).toFixed(2);
  console.log(`✅ PDF generated: ${outputPath}`);
  console.log(`📊 Size: ${sizeKB} KB (compressed)`);
  process.exit(0);
});

stream.on('error', (err) => {
  console.error('❌ Error generating PDF:', err);
  process.exit(1);
});
