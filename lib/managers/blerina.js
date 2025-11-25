/**
 * BLERINA - Born Laborator Enhanced Creativity Intelligence New Array
 * Document & API Generation Module
 * 
 * Personality: Creative, detail-oriented, documentation artist
 * Role: Generates API documentation, routes, schemas, and auto-code
 * Mission: Transform information into beautiful, useful documentation
 */

class Blerina {
  constructor() {
    this.name = "Blerina";
    this.emoji = "📚";
    this.personality = "creative";

    this.templates = {
      apiRoute: `/**
 * API Route Handler
 * {title}
 * 
 * Endpoint: {method} {path}
 * Description: {description}
 * Authentication: {auth}
 */

export async function {method}(request) {{
  try {{
    // Request validation
    {validation}

    // Processing logic
    {logic}

    // Response
    return Response.json({{
      success: true,
      data: {{}},
      timestamp: new Date().toISOString(),
    }}, {{ status: 200 }});
  }} catch (error) {{
    return Response.json(
      {{ success: false, error: error.message }},
      {{ status: 500 }}
    );
  }}
}}`
      ,
      markdown: `# {title}

## Overview
{description}

## Details
- **Created**: {date}
- **Version**: 1.0.0
- **Status**: Active

## Content
{content}

## Usage
{usage}

## Related
{related}
`,
      openapi: `openapi: 3.0.0
info:
  title: {title}
  version: 1.0.0
  description: {description}
servers:
  - url: /api/v1
paths:
  {path}:
    {method}:
      summary: {summary}
      description: {description}
      operationId: {operationId}
      tags:
        - {tag}
      responses:
        200:
          description: Success
        400:
          description: Bad Request
        500:
          description: Internal Server Error
`,
    };

    this.generated = [];
    this.stats = {
      routesGenerated: 0,
      documentsGenerated: 0,
      schemasGenerated: 0,
      totalLines: 0,
    };
  }

  /**
   * Generate API route handler
   */
  generateRoute(config) {
    const {
      method = "GET",
      path = "/api/v1/example",
      title = "Example Endpoint",
      description = "Example API endpoint",
      auth = "none",
      validation = '// Validate request parameters',
      logic = '// Your logic here',
    } = config;

    let template = this.templates.apiRoute;

    template = template
      .replace(/{title}/g, title)
      .replace(/{method}/g, method)
      .replace(/{path}/g, path)
      .replace(/{description}/g, description)
      .replace(/{auth}/g, auth)
      .replace(/{validation}/g, validation)
      .replace(/{logic}/g, logic)
      .replace(/{method}/g, method.toLowerCase());

    this.generated.push({
      type: "route",
      path,
      method,
      timestamp: new Date(),
      code: template,
    });

    this.stats.routesGenerated++;
    this.stats.totalLines += template.split("\n").length;

    return {
      success: true,
      type: "route",
      path,
      method,
      code: template,
      filename: `app/api/v1${path}/route.js`,
      message: `${this.emoji} Generated ${method} ${path} route`,
    };
  }

  /**
   * Generate OpenAPI specification
   */
  generateOpenAPI(config) {
    const {
      title = "API Specification",
      description = "Auto-generated API specification",
      path = "/example",
      method = "get",
      summary = "Example operation",
      operationId = "exampleOperation",
      tag = "Example",
    } = config;

    let spec = this.templates.openapi;

    spec = spec
      .replace(/{title}/g, title)
      .replace(/{description}/g, description)
      .replace(/{path}/g, path)
      .replace(/{method}/g, method)
      .replace(/{summary}/g, summary)
      .replace(/{operationId}/g, operationId)
      .replace(/{tag}/g, tag);

    this.generated.push({
      type: "openapi",
      title,
      timestamp: new Date(),
      spec,
    });

    this.stats.schemasGenerated++;
    this.stats.totalLines += spec.split("\n").length;

    return {
      success: true,
      type: "openapi",
      title,
      spec,
      filename: "docs/openapi.yaml",
      message: `${this.emoji} Generated OpenAPI specification`,
    };
  }

  /**
   * Generate Markdown documentation
   */
  generateMarkdown(config) {
    const {
      title = "Documentation",
      description = "Auto-generated documentation",
      content = "## Content\n\nWell organized content here.",
      usage = "## How to use\n\nClear usage instructions.",
      related = "## See Also\n\n- Related items",
    } = config;

    const date = new Date().toISOString().split("T")[0];

    let markdown = this.templates.markdown;

    markdown = markdown
      .replace(/{title}/g, title)
      .replace(/{description}/g, description)
      .replace(/{date}/g, date)
      .replace(/{content}/g, content)
      .replace(/{usage}/g, usage)
      .replace(/{related}/g, related);

    this.generated.push({
      type: "markdown",
      title,
      timestamp: new Date(),
      content: markdown,
    });

    this.stats.documentsGenerated++;
    this.stats.totalLines += markdown.split("\n").length;

    return {
      success: true,
      type: "markdown",
      title,
      content: markdown,
      filename: `docs/${title.toLowerCase().replace(/\s/g, "_")}.md`,
      message: `${this.emoji} Generated Markdown documentation: ${title}`,
    };
  }

  /**
   * Generate TypeScript interface/schema
   */
  generateSchema(config) {
    const {
      name = "ExampleSchema",
      fields = {},
      description = "Auto-generated schema",
    } = config;

    let schema = `/**
 * ${name} Schema
 * ${description}
 */

export interface ${name} {\n`;

    for (const [fieldName, fieldType] of Object.entries(fields)) {
      const type = fieldType.type || "string";
      const optional = fieldType.optional ? "?" : "";
      const docComment = fieldType.description
        ? `  /** ${fieldType.description} */\n`
        : "";

      schema += `${docComment}  ${fieldName}${optional}: ${type};\n`;
    }

    schema += "}\n";

    this.generated.push({
      type: "schema",
      name,
      timestamp: new Date(),
      schema,
    });

    this.stats.schemasGenerated++;
    this.stats.totalLines += schema.split("\n").length;

    return {
      success: true,
      type: "schema",
      name,
      schema,
      filename: `app/api/types/${name.toLowerCase()}.ts`,
      message: `${this.emoji} Generated TypeScript schema: ${name}`,
    };
  }

  /**
   * Generate comprehensive API documentation
   */
  generateAPIDocumentation(endpoints) {
    let doc = `# API Documentation

Auto-generated on ${new Date().toISOString()}

## Endpoints

`;

    for (const endpoint of endpoints) {
      const {
        method = "GET",
        path = "/api/example",
        description = "Endpoint",
        auth = "none",
        parameters = [],
        responses = {},
      } = endpoint;

      doc += `### ${method} ${path}

**Description**: ${description}

**Authentication**: ${auth}

`;

      if (parameters.length > 0) {
        doc += `**Parameters**:\n`;
        parameters.forEach((param) => {
          doc += `- \`${param.name}\` (${param.type}): ${param.description}\n`;
        });
        doc += "\n";
      }

      doc += `**Responses**:\n`;
      for (const [status, response] of Object.entries(responses)) {
        doc += `- \`${status}\`: ${response}\n`;
      }

      doc += "\n---\n\n";
    }

    this.generated.push({
      type: "api_documentation",
      title: "Full API Documentation",
      timestamp: new Date(),
      content: doc,
    });

    this.stats.documentsGenerated++;
    this.stats.totalLines += doc.split("\n").length;

    return {
      success: true,
      type: "api_documentation",
      content: doc,
      filename: "docs/API_DOCUMENTATION.md",
      message: `${this.emoji} Generated comprehensive API documentation`,
    };
  }

  /**
   * Generate batch routes from manifest
   */
  async generateBatch(manifest) {
    const results = {
      routes: [],
      documentation: [],
      schemas: [],
      stats: { total: 0, success: 0, failed: 0 },
    };

    for (const item of manifest) {
      try {
        if (item.type === "route") {
          const route = this.generateRoute(item);
          results.routes.push(route);
          results.stats.success++;
        } else if (item.type === "documentation") {
          const doc = this.generateMarkdown(item);
          results.documentation.push(doc);
          results.stats.success++;
        } else if (item.type === "schema") {
          const schema = this.generateSchema(item);
          results.schemas.push(schema);
          results.stats.success++;
        }
      } catch (error) {
        results.stats.failed++;
        console.error(`Blerina: Generation failed for ${item}:`, error);
      }

      results.stats.total++;
    }

    return {
      success: results.stats.failed === 0,
      results,
      message: `${this.emoji} Batch generation: ${results.stats.success}/${results.stats.total} successful`,
    };
  }

  /**
   * Get generation history
   */
  getHistory(limit = 20) {
    return {
      generated: this.generated.slice(-limit),
      totalGenerated: this.generated.length,
      stats: this.stats,
    };
  }

  /**
   * Export all generated artifacts
   */
  exportAll() {
    const byType = {
      routes: this.generated.filter((g) => g.type === "route"),
      documentation: this.generated.filter((g) =>
        ["markdown", "api_documentation"].includes(g.type)
      ),
      schemas: this.generated.filter((g) => g.type === "schema"),
      openapi: this.generated.filter((g) => g.type === "openapi"),
    };

    return {
      timestamp: new Date(),
      stats: this.stats,
      generated: byType,
      totalArtifacts: this.generated.length,
    };
  }

  getStats() {
    return {
      name: this.name,
      personality: this.personality,
      ...this.stats,
      generatedCount: this.generated.length,
    };
  }
}

module.exports = Blerina;
