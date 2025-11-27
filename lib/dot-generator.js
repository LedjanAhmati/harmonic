// lib/dot-generator.js - Generate Graphviz DOT diagrams for Puter Lab
// Fast in-memory generation with caching

export class DotGenerator {
  constructor() {
    this.cache = new Map();
    this.templates = {
      harmonic: this.generateHarmonicArchitecture(),
      zurich: this.generateZurichCycle(),
      trinity: this.generateTrinityDebate(),
      brain: this.generateBrainIndexer(),
      reasoning: this.generateReasoningFlow()
    };
  }

  /**
   * Generate Harmonic Architecture diagram
   */
  generateHarmonicArchitecture() {
    return `digraph HarmonicArchitecture {
  rankdir=TB;
  bgcolor="#1a1a2e";
  fontcolor="white";
  node [shape=box, style=filled, fillcolor="#16213e", fontcolor="white", fontname="monospace"];
  edge [color="#0f3460", fontcolor="white"];

  // Frontend Layer
  Frontend [label="Frontend\n(Next.js 16)", fillcolor="#0f3460"];
  
  // API Layer
  API [label="API Gateway\n(/api/v1/)", fillcolor="#0f3460"];
  
  // Core Services
  Zurich [label="Zürich Cycle\n(4-stage)", fillcolor="#16213e"];
  Trinity [label="Trinity Debate\n(5 personas)", fillcolor="#16213e"];
  ASI [label="ASI Fusion\n(Meta-reasoning)", fillcolor="#16213e"];
  
  // Data Layer
  Brain [label="Brain Indexer\n(8TB memory)", fillcolor="#0a0e27"];
  Cache [label="Cache Layer\n(Redis-like)", fillcolor="#0a0e27"];
  
  // External
  OpenAI [label="OpenAI API", fillcolor="#1a1a2e", color="gold"];
  
  // Connections
  Frontend -> API;
  API -> Zurich;
  API -> Trinity;
  API -> ASI;
  Zurich -> Brain;
  Trinity -> Brain;
  ASI -> Zurich;
  ASI -> Trinity;
  Cache -> Zurich;
  Cache -> Trinity;
  Trinity -> OpenAI;
  Zurich -> Cache;
}`;
  }

  /**
   * Generate Zürich Cycle flow
   */
  generateZurichCycle() {
    return `digraph ZurichCycle {
  rankdir=LR;
  bgcolor="#1a1a2e";
  fontcolor="white";
  node [shape=ellipse, style=filled, fillcolor="#16213e", fontcolor="white"];
  edge [color="#0f3460", label="", fontcolor="white"];

  Input [label="Input\nTopic/Query", fillcolor="#e94560"];
  Analysis [label="1. Analyze\n(Keywords, Tags)"];
  Synthesis [label="2. Synthesize\n(Patterns)"];
  Output [label="Output\n(Reasoning)", fillcolor="#00d4ff"];
  Interpretation [label="3. Interpret\n(Context)"];
  Reasoning [label="4. Reason\n(Logic)"];

  Input -> Analysis;
  Analysis -> Interpretation;
  Interpretation -> Reasoning;
  Reasoning -> Synthesis;
  Synthesis -> Output;
}`;
  }

  /**
   * Generate Trinity Debate structure
   */
  generateTrinityDebate() {
    return `digraph TrinityDebate {
  rankdir=TB;
  bgcolor="#1a1a2e";
  fontcolor="white";
  node [shape=box, style=filled, fontcolor="white"];
  edge [color="#0f3460", fontcolor="white"];

  Input [label="Debate Topic", fillcolor="#e94560"];
  
  Alba [label="✨ Alba\n(Optimist)", fillcolor="#2dd4bf"];
  Albi [label="⚙️ Albi\n(Pragmatist)", fillcolor="#60a5fa"];
  Jona [label="⚠️ Jona\n(Skeptic)", fillcolor="#fbbf24"];
  Blerina [label="📊 Blerina\n(Analyst)", fillcolor="#a78bfa"];
  ASI [label="🧠 ASI\n(Synthesizer)", fillcolor="#f472b6"];

  Input -> Alba;
  Input -> Albi;
  Input -> Jona;
  Input -> Blerina;
  
  Alba -> ASI;
  Albi -> ASI;
  Jona -> ASI;
  Blerina -> ASI;
  
  ASI [label="🧠 ASI\n(Synthesis)", fillcolor="#10b981"];
}`;
  }

  /**
   * Generate Brain Indexer structure
   */
  generateBrainIndexer() {
    return `digraph BrainIndexer {
  rankdir=TB;
  bgcolor="#1a1a2e";
  fontcolor="white";
  node [shape=cylinder, style=filled, fillcolor="#16213e", fontcolor="white"];
  edge [color="#0f3460", fontcolor="white"];

  Input [label="Query", shape=box, fillcolor="#e94560"];
  
  IndexLayer [label="Index Layer\n(8TB Memory)"];
  KeywordIndex [label="Keyword Index"];
  ConceptIndex [label="Concept Index"];
  DocIndex [label="Document Index"];
  
  Cache [label="Cache\n(Hot data)"];
  Results [label="Results", shape=box, fillcolor="#00d4ff"];

  Input -> KeywordIndex;
  Input -> ConceptIndex;
  Input -> DocIndex;
  
  KeywordIndex -> Cache;
  ConceptIndex -> Cache;
  DocIndex -> Cache;
  
  Cache -> Results;
}`;
  }

  /**
   * Generate Reasoning Flow
   */
  generateReasoningFlow() {
    return `digraph ReasoningFlow {
  rankdir=LR;
  bgcolor="#1a1a2e";
  fontcolor="white";
  node [shape=box, style=filled, fillcolor="#16213e", fontcolor="white"];
  edge [color="#0f3460", fontcolor="white"];

  Input [label="Input", fillcolor="#e94560"];
  
  Preprocess [label="Preprocess"];
  Embed [label="Embed"];
  Retrieve [label="Retrieve"];
  Rank [label="Rank"];
  Generate [label="Generate"];
  Synthesize [label="Synthesize"];
  
  Output [label="Output", fillcolor="#00d4ff"];

  Input -> Preprocess -> Embed -> Retrieve -> Rank -> Generate -> Synthesize -> Output;
}`;
  }

  /**
   * Get cached or generated DOT diagram
   */
  getDot(type) {
    if (this.cache.has(type)) {
      return this.cache.get(type);
    }

    const dot = this.templates[type];
    if (dot) {
      this.cache.set(type, dot);
    }

    return dot || null;
  }

  /**
   * Get all available diagrams
   */
  getAvailable() {
    return Object.keys(this.templates);
  }

  /**
   * Generate custom diagram from description
   */
  generateCustom(name, nodes, edges, colors = {}) {
    const defaultColor = '#16213e';
    const defaultEdgeColor = '#0f3460';

    let dot = `digraph ${name} {
  rankdir=TB;
  bgcolor="#1a1a2e";
  fontcolor="white";
  node [shape=box, style=filled, fillcolor="${colors.nodeFill || defaultColor}", fontcolor="white"];
  edge [color="${colors.edge || defaultEdgeColor}", fontcolor="white"];\n\n`;

    // Add nodes
    nodes.forEach(node => {
      const color = colors[node.id] || defaultColor;
      dot += `  ${node.id} [label="${node.label}", fillcolor="${color}"];\n`;
    });

    dot += '\n';

    // Add edges
    edges.forEach(edge => {
      dot += `  ${edge.from} -> ${edge.to};\n`;
    });

    dot += '}';

    this.cache.set(name, dot);
    return dot;
  }

  /**
   * Convert DOT to other formats (metadata)
   */
  getConversionCommand(dotFile, format = 'png') {
    return `dot -T${format} ${dotFile} -o ${dotFile.replace('.dot', '')}.${format}`;
  }

  /**
   * Get stats
   */
  getStats() {
    return {
      cachedDiagrams: this.cache.size,
      availableTemplates: Object.keys(this.templates).length,
      cacheMemory: this.cache.size * 1024, // Approximate
      lastUpdated: new Date().toISOString()
    };
  }
}

const dotGenerator = new DotGenerator();
export default dotGenerator;
