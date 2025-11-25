# 🇨🇭 ZURICH - API Documentation & Automation Engine

## What is ZURICH?

**ZURICH** is an automated documentation generator for Harmonic Trinity's SAAS API. It creates professional API documentation from your code with a single command.

### Why "Zurich"?
- **Z** - Zero-config automation
- **U** - Universal documentation
- **R** - Reference generation
- **I** - Integration ready
- **C** - Command-driven
- **H** - Harmonic Trinity

## ⚡ Quick Start

### Generate Documentation (One Command)
```bash
npm run docs
```

This creates 5 professional documentation files in `docs/` folder:
```
docs/
├─ openapi.json                (OpenAPI 3.0 specification)
├─ postman-collection.json     (Postman import file)
├─ api.types.ts                (TypeScript type definitions)
├─ .env.example                (Configuration template)
└─ API_REFERENCE.md            (Complete API reference)
```

## 📋 Generated Files Explained

### 1. openapi.json
**OpenAPI 3.0 Specification**
- Used by: Swagger UI, API documentation tools, code generators
- Import into: https://editor.swagger.io/
- Use for: Automatic SDK generation, API mocking

### 2. postman-collection.json
**Postman Collection**
- Import into Postman app (Collection → Import → Paste)
- Pre-configured requests ready to test
- All 5 debate personas
- System endpoints included

### 3. api.types.ts
**TypeScript Definitions**
- Copy into your frontend project
- Full type safety for API calls
- IntelliSense in VS Code
- Request/response validation

### 4. .env.example
**Environment Configuration**
- Copy to `.env.local` to customize
- Database path
- Port numbers
- Logging levels
- Feature toggles

### 5. API_REFERENCE.md
**Complete API Documentation**
- Markdown format (human-readable)
- All endpoints documented
- cURL examples
- Performance notes

## 🔄 API Documentation Cycle

```
Code Change
    ↓
npm run docs (ZURICH generates)
    ↓
docs/ folder updated
    ↓
Import to Postman/Swagger
    ↓
Share with team
    ↓
Test API against docs
```

## 📚 Using the Generated Docs

### With Postman
1. Open Postman Desktop
2. Click "Import" → "Raw text"
3. Paste contents of `docs/postman-collection.json`
4. Click "Import"
5. Test all endpoints immediately

### With Swagger UI
1. Go to https://editor.swagger.io/
2. File → Import File → Select `docs/openapi.json`
3. Beautiful interactive documentation appears
4. Try out requests directly in browser

### With Frontend Code
```typescript
// Copy types from docs/api.types.ts
import type { DebateResponse, DebateRequest } from './docs/api.types';

// Now fully typed API calls
const response: DebateResponse = await fetch('/debate', {
  method: 'POST',
  body: JSON.stringify({ topic: 'question' } satisfies DebateRequest)
});
```

### With Environment Config
```bash
# Copy template
cp docs/.env.example .env.local

# Customize as needed
cat .env.local
# SAAS_API_URL=http://localhost:5000
# PUTER_AI_MODEL=gpt-5-nano
# etc.
```

## 🎯 Common Workflows

### Scenario 1: You Add a New Endpoint
```bash
# 1. Add endpoint to api-server/server.js
# 2. Run Zurich to regenerate docs
npm run docs

# 3. New endpoint automatically in:
# - docs/openapi.json
# - docs/postman-collection.json
# - docs/API_REFERENCE.md
```

### Scenario 2: Share API with Team
```bash
# 1. Generate docs
npm run docs

# 2. Share files:
# - Send docs/openapi.json to API documentation service
# - Send docs/postman-collection.json to Postman workspace
# - Send docs/API_REFERENCE.md to Slack/Wiki

# Team can now test without knowing implementation details
```

### Scenario 3: Generate Client SDKs
```bash
# Tools like OpenAPI Generator can use docs/openapi.json
# to automatically create SDKs in any language:

# Python
openapi-generator generate -i docs/openapi.json -g python

# JavaScript
openapi-generator generate -i docs/openapi.json -g typescript-axios

# Go
openapi-generator generate -i docs/openapi.json -g go-client
```

## 🛠️ Extending ZURICH

### Add Custom Documentation
Edit `zurich.js` to add:
```javascript
// In Zurich class:
generateCustomDocs() {
  const custom = `...your documentation...`;
  fs.writeFileSync(path.join(this.docsPath, 'custom.md'), custom);
}

// In generateCompleteDocumentation():
this.generateCustomDocs();
console.log('✅ Generated: docs/custom.md');
```

### Generate HTML Documentation
```javascript
// Add to zurich.js
generateHTMLDocs() {
  const html = `
    <!DOCTYPE html>
    <html>
    <body>
    <h1>API Docs</h1>
    <!-- Use docs content -->
    </body>
    </html>
  `;
  fs.writeFileSync(path.join(this.docsPath, 'index.html'), html);
}
```

## 📊 What ZURICH Does Behind the Scenes

```javascript
Zurich Class
├─ generateOpenAPISpec()     → OpenAPI 3.0 JSON
├─ generatePostmanCollection() → Postman requests
├─ generateTypeDefinitions()   → TypeScript types
├─ generateEnvConfig()         → .env template
└─ generateAPIReference()      → Markdown reference
    ↓
All saved to docs/ folder
```

## 🔐 Documentation Best Practices

1. **Version your docs** - Save docs alongside code versions
2. **Update after API changes** - Run `npm run docs` immediately
3. **Share early** - Docs help validate API design with team
4. **Test docs** - Verify examples actually work
5. **Keep DRY** - Use ZURICH to avoid duplicating docs

## ⚙️ Advanced: Continuous Documentation

```bash
# Auto-generate docs on every commit (git hook)
#!/bin/bash
# .git/hooks/pre-push
npm run docs
git add docs/
git commit -m "docs: auto-generated by Zurich" --no-verify
```

## 🚀 Integration Examples

### GitHub Actions
```yaml
name: Generate API Docs
on: [push]
jobs:
  docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm run docs
      - uses: EndBug/add-and-commit@v9
        with:
          message: 'docs: auto-generated by Zurich'
```

### Development Workflow
```bash
# Terminal 1: Start servers
npm run both

# Terminal 2: Make code changes
# Edit api-server/server.js

# Terminal 3: Regenerate docs
npm run docs

# Docs instantly updated, ready to test
```

## 📞 Support

- **Docs not generating?** Check if `docs/` folder exists
- **Postman import fails?** Use raw JSON import instead
- **TypeScript errors?** Copy full `api.types.ts` file

## 🎓 Next Steps

1. **Generate docs**: `npm run docs`
2. **Import to Postman**: Copy `postman-collection.json`
3. **Share with team**: Send documentation files
4. **Iterate**: Update code → `npm run docs` → test

---

**ZURICH makes API documentation automatic, accurate, and always in sync with your code.**

`npm run docs` 🚀
