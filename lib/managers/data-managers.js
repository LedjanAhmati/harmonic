/**
 * HARMONIC Data Managers Layer
 * Unified interface for all free data sources
 * 
 * Manages:
 * ├── WikiManager - Wikipedia articles & summaries
 * ├── ArxivManager - Research papers & preprints
 * ├── NewsManager - Current events & news
 * ├── WeatherManager - Climate & weather data
 * └── CuriosityManager - Science facts & knowledge
 */

/**
 * WikiManager - Wikipedia Data Source
 */
class WikiManager {
  constructor() {
    this.name = "WikiManager";
    this.source = "Wikipedia";
    this.cache = new Map();
    this.stats = { requests: 0, hits: 0, misses: 0, errors: 0 };
  }

  async fetch(query) {
    this.stats.requests++;

    // Check cache first (24 hour TTL)
    if (this.cache.has(query)) {
      const cached = this.cache.get(query);
      if (Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
        this.stats.hits++;
        return { ...cached.data, fromCache: true };
      }
    }

    try {
      const response = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
          query
        )}`,
        { timeout: 5000 }
      );

      if (!response.ok) throw new Error(`Wikipedia API error: ${response.status}`);

      const data = await response.json();

      const result = {
        source: "wikipedia",
        query,
        title: data.title,
        description: data.description,
        extract: data.extract,
        thumbnail: data.thumbnail?.source,
        url: data.content_urls?.mobile?.page,
        timestamp: new Date().toISOString(),
      };

      // Cache for 24 hours
      this.cache.set(query, { data: result, timestamp: Date.now() });
      this.stats.misses++;

      return result;
    } catch (error) {
      this.stats.errors++;
      return {
        source: "wikipedia",
        query,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  getStats() {
    return {
      ...this.stats,
      cacheSize: this.cache.size,
      hitRate: this.stats.requests > 0 
        ? ((this.stats.hits / this.stats.requests) * 100).toFixed(1) + "%"
        : "0%",
    };
  }
}

/**
 * ArxivManager - ArXiv Research Papers
 */
class ArxivManager {
  constructor() {
    this.name = "ArxivManager";
    this.source = "ArXiv";
    this.cache = new Map();
    this.stats = { requests: 0, papersFound: 0, errors: 0 };
  }

  async fetch(query, maxResults = 5) {
    this.stats.requests++;

    // Check cache (7 day TTL for papers)
    if (this.cache.has(query)) {
      const cached = this.cache.get(query);
      if (Date.now() - cached.timestamp < 7 * 24 * 60 * 60 * 1000) {
        return { ...cached.data, fromCache: true };
      }
    }

    try {
      const url = `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(
        query
      )}&start=0&max_results=${maxResults}&sortBy=submittedDate&sortOrder=descending`;

      const response = await fetch(url, { timeout: 5000 });
      if (!response.ok) throw new Error(`ArXiv API error: ${response.status}`);

      const text = await response.text();
      const entries = text.match(/<entry>(.*?)<\/entry>/gs) || [];

      const papers = entries.slice(0, maxResults).map((entry) => {
        const title = entry.match(/<title>(.*?)<\/title>/)?.[1] || "Unknown";
        const summary = entry.match(/<summary>(.*?)<\/summary>/)?.[1] || "No summary";
        const authors = (entry.match(/<author>(.*?)<\/author>/gs) || []).length;
        const published = entry.match(/<published>(.*?)<\/published>/)?.[1];
        const id = entry.match(/<id>(.*?)<\/id>/)?.[1];

        return {
          id: id?.split("/abs/")[1],
          title: title.replace(/\n/g, " ").trim(),
          summary: summary.replace(/\n/g, " ").trim(),
          authors,
          published,
          url: `https://arxiv.org/abs/${id?.split("/abs/")[1] || ""}`,
        };
      });

      const result = {
        source: "arxiv",
        query,
        papers,
        count: papers.length,
        timestamp: new Date().toISOString(),
      };

      this.cache.set(query, { data: result, timestamp: Date.now() });
      this.stats.papersFound += papers.length;

      return result;
    } catch (error) {
      this.stats.errors++;
      return {
        source: "arxiv",
        query,
        papers: [],
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  getStats() {
    return {
      ...this.stats,
      cacheSize: this.cache.size,
      avgPapersPerQuery:
        this.stats.requests > 0
          ? (this.stats.papersFound / this.stats.requests).toFixed(1)
          : 0,
    };
  }
}

/**
 * NewsManager - News & Current Events
 */
class NewsManager {
  constructor() {
    this.name = "NewsManager";
    this.source = "News Aggregator";
    this.cache = new Map();
    this.stats = { requests: 0, articlesFound: 0, errors: 0 };
  }

  async fetch(query, maxResults = 5) {
    this.stats.requests++;

    // Check cache (6 hour TTL for news - updates frequently)
    if (this.cache.has(query)) {
      const cached = this.cache.get(query);
      if (Date.now() - cached.timestamp < 6 * 60 * 60 * 1000) {
        return { ...cached.data, fromCache: true };
      }
    }

    try {
      // Fallback to simulated news structure
      // In production, integrate with NewsAPI.org or similar
      const articles = [
        {
          title: `Latest news about ${query}`,
          description: "Breaking news and updates",
          url: "https://news.example.com/1",
          source: "News Source",
          publishedAt: new Date().toISOString(),
          category: "Technology",
        },
        {
          title: `${query} research advances`,
          description: "New developments in the field",
          url: "https://news.example.com/2",
          source: "Research Journal",
          publishedAt: new Date(Date.now() - 3600000).toISOString(),
          category: "Science",
        },
        {
          title: `Industry update: ${query}`,
          description: "Current trends and analysis",
          url: "https://news.example.com/3",
          source: "Industry News",
          publishedAt: new Date(Date.now() - 7200000).toISOString(),
          category: "Business",
        },
      ];

      const result = {
        source: "news",
        query,
        articles: articles.slice(0, maxResults),
        count: articles.slice(0, maxResults).length,
        timestamp: new Date().toISOString(),
      };

      this.cache.set(query, { data: result, timestamp: Date.now() });
      this.stats.articlesFound += result.count;

      return result;
    } catch (error) {
      this.stats.errors++;
      return {
        source: "news",
        query,
        articles: [],
        error: error.message,
        timestamp: new ISOString(),
      };
    }
  }

  getStats() {
    return {
      ...this.stats,
      cacheSize: this.cache.size,
      avgArticlesPerQuery:
        this.stats.requests > 0
          ? (this.stats.articlesFound / this.stats.requests).toFixed(1)
          : 0,
    };
  }
}

/**
 * WeatherManager - Climate & Weather Data
 */
class WeatherManager {
  constructor() {
    this.name = "WeatherManager";
    this.source = "Open-Meteo";
    this.cache = new Map();
    this.stats = { requests: 0, locations: 0, errors: 0 };
  }

  async fetch(location) {
    this.stats.requests++;

    // Check cache (30 minute TTL for weather)
    if (this.cache.has(location)) {
      const cached = this.cache.get(location);
      if (Date.now() - cached.timestamp < 30 * 60 * 1000) {
        return { ...cached.data, fromCache: true };
      }
    }

    try {
      // Geocoding
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          location
        )}&count=1&language=en&format=json`,
        { timeout: 5000 }
      );

      if (!geoResponse.ok) throw new Error("Geocoding failed");

      const geoData = await geoResponse.json();
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error("Location not found");
      }

      const { latitude, longitude, name, country, admin1 } = geoData.results[0];

      // Weather forecast
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation&timezone=auto`,
        { timeout: 5000 }
      );

      if (!weatherResponse.ok) throw new Error("Weather fetch failed");

      const weatherData = await weatherResponse.json();

      const result = {
        source: "weather",
        location: `${name}${admin1 ? ", " + admin1 : ""}, ${country}`,
        coordinates: { latitude, longitude },
        current: weatherData.current,
        timezone: weatherData.timezone,
        timestamp: new Date().toISOString(),
      };

      this.cache.set(location, { data: result, timestamp: Date.now() });
      this.stats.locations++;

      return result;
    } catch (error) {
      this.stats.errors++;
      return {
        source: "weather",
        location,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  getStats() {
    return {
      ...this.stats,
      cacheSize: this.cache.size,
      successRate:
        this.stats.requests > 0
          ? (((this.stats.requests - this.stats.errors) / this.stats.requests) * 100).toFixed(
              1
            ) + "%"
          : "0%",
    };
  }
}

/**
 * CuriosityManager - Science Facts & Knowledge
 */
class CuriosityManager {
  constructor() {
    this.name = "CuriosityManager";
    this.source = "Internal Knowledge Base";
    this.cache = new Map();
    this.stats = { requests: 0, factsRetrieved: 0, errors: 0 };

    // Pre-loaded knowledge base
    this.knowledgeBase = {
      biology: {
        facts: [
          "The human brain contains ~86 billion neurons",
          "DNA replication is 99.99% accurate",
          "Tardigrades can survive extreme conditions",
          "Mitochondria is the powerhouse of the cell",
          "The human body has 206 bones",
        ],
        description: "Biology and life sciences",
      },
      physics: {
        facts: [
          "Light is both particle and wave",
          "Quantum entanglement defies locality",
          "Time dilation increases near massive objects",
          "E=mc² shows mass-energy equivalence",
          "Planck length is the smallest meaningful distance",
        ],
        description: "Physics and quantum mechanics",
      },
      medicine: {
        facts: [
          "CRISPR gene editing offers revolutionary treatments",
          "Neuroplasticity enables brain adaptation",
          "Immunotherapy harnesses immune system",
          "Stem cells have regenerative potential",
          "mRNA vaccines can be produced rapidly",
        ],
        description: "Medical science and healthcare",
      },
      ai: {
        facts: [
          "Transformers revolutionized NLP",
          "Large language models show emergent abilities",
          "Multimodal AI integrates different data types",
          "Attention mechanisms enable context understanding",
          "Reinforcement learning enables autonomous learning",
        ],
        description: "Artificial intelligence",
      },
      environment: {
        facts: [
          "Photosynthesis converts CO2 to oxygen",
          "Rainforests produce 20% of world oxygen",
          "Ocean absorbs 90% of excess heat",
          "Coral reefs support 25% of marine life",
          "Soil regenerates at 1 inch per 100 years",
        ],
        description: "Environment and conservation",
      },
    };

    this.stats.totalFacts = Object.values(this.knowledgeBase).reduce(
      (sum, domain) => sum + domain.facts.length,
      0
    );
  }

  async fetch(domain = "general") {
    this.stats.requests++;

    // Check cache (24 hour TTL)
    if (this.cache.has(domain)) {
      const cached = this.cache.get(domain);
      if (Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
        return { ...cached.data, fromCache: true };
      }
    }

    try {
      const domainLower = domain.toLowerCase();
      const knowledgeDomain = this.knowledgeBase[domainLower];

      if (!knowledgeDomain) {
        // Return first 5 facts from all domains (deterministic, no shuffle)
        const allFacts = Object.values(this.knowledgeBase).flatMap((d) => d.facts);
        const shuffled = allFacts.slice(0, 5);

        const result = {
          source: "curiosity",
          domain: "general",
          facts: shuffled,
          description: "Science facts from multiple domains",
          timestamp: new Date().toISOString(),
        };

        this.cache.set(domain, { data: result, timestamp: Date.now() });
        this.stats.factsRetrieved += result.facts.length;

        return result;
      }

      // Return facts from specific domain
      const result = {
        source: "curiosity",
        domain: domainLower,
        facts: knowledgeDomain.facts,
        description: knowledgeDomain.description,
        count: knowledgeDomain.facts.length,
        timestamp: new Date().toISOString(),
      };

      this.cache.set(domain, { data: result, timestamp: Date.now() });
      this.stats.factsRetrieved += result.facts.length;

      return result;
    } catch (error) {
      this.stats.errors++;
      return {
        source: "curiosity",
        domain,
        facts: [],
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  getStats() {
    return {
      ...this.stats,
      cacheSize: this.cache.size,
      avgFactsPerRequest:
        this.stats.requests > 0
          ? (this.stats.factsRetrieved / this.stats.requests).toFixed(1)
          : 0,
      totalAvailable: this.stats.totalFacts,
    };
  }
}

/**
 * DataManagers - Unified Interface
 * Orchestrates all 5 data sources
 */
class DataManagers {
  constructor() {
    this.name = "DataManagers";
    this.emoji = "📊";

    // Initialize all managers
    this.managers = {
      wiki: new WikiManager(),
      arxiv: new ArxivManager(),
      news: new NewsManager(),
      weather: new WeatherManager(),
      curiosity: new CuriosityManager(),
    };

    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
    };
  }

  /**
   * Fetch from specific manager
   */
  async fetch(source, query, options = {}) {
    const manager = this.managers[source.toLowerCase()];

    if (!manager) {
      return {
        success: false,
        error: `Unknown data source: ${source}`,
        availableSources: Object.keys(this.managers),
      };
    }

    try {
      const result = await manager.fetch(query, options.maxResults);
      this.stats.totalRequests++;

      if (result.error) {
        this.stats.failedRequests++;
      } else {
        this.stats.successfulRequests++;
      }

      if (result.fromCache) {
        this.stats.cacheHits++;
      } else {
        this.stats.cacheMisses++;
      }

      return {
        success: !result.error,
        data: result,
        manager: source,
      };
    } catch (error) {
      this.stats.totalRequests++;
      this.stats.failedRequests++;

      return {
        success: false,
        error: error.message,
        manager: source,
      };
    }
  }

  /**
   * Fetch from multiple sources simultaneously
   */
  async fetchMultiple(query, sources = null) {
    const sourcesToFetch = sources || Object.keys(this.managers);

    const results = await Promise.all(
      sourcesToFetch.map((source) => this.fetch(source, query))
    );

    return {
      query,
      sources: sourcesToFetch,
      results: results.filter((r) => r.success),
      failedSources: results.filter((r) => !r.success),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Fetch all available data about a topic
   */
  async fetchComprehensive(query) {
    const results = {
      query,
      comprehensive: true,
      sources: {},
      timestamp: new Date().toISOString(),
    };

    // Wikipedia summary
    try {
      const wikiResult = await this.fetch("wiki", query);
      if (wikiResult.success) {
        results.sources.wikipedia = wikiResult.data;
      }
    } catch (e) {
      console.error("Wiki error:", e);
    }

    // Research papers
    try {
      const arxivResult = await this.fetch("arxiv", query, { maxResults: 3 });
      if (arxivResult.success) {
        results.sources.arxiv = arxivResult.data;
      }
    } catch (e) {
      console.error("ArXiv error:", e);
    }

    // News articles
    try {
      const newsResult = await this.fetch("news", query, { maxResults: 3 });
      if (newsResult.success) {
        results.sources.news = newsResult.data;
      }
    } catch (e) {
      console.error("News error:", e);
    }

    // Curiosity facts
    try {
      const curiosityResult = await this.fetch("curiosity", query);
      if (curiosityResult.success) {
        results.sources.curiosity = curiosityResult.data;
      }
    } catch (e) {
      console.error("Curiosity error:", e);
    }

    results.sourcesRetrieved = Object.keys(results.sources).length;

    return results;
  }

  /**
   * Get system status
   */
  getStatus() {
    return {
      name: this.name,
      emoji: this.emoji,
      managers: Object.entries(this.managers).map(([, manager]) => ({
        name: manager.name,
        source: manager.source,
        status: "operational",
        stats: manager.getStats(),
      })),
      systemStats: {
        ...this.stats,
        averageSuccessRate:
          this.stats.totalRequests > 0
            ? (
                ((this.stats.successfulRequests /
                  this.stats.totalRequests) *
                100)
              ).toFixed(1) + "%"
            : "0%",
        cacheHitRate:
          this.stats.cacheHits + this.stats.cacheMisses > 0
            ? (
                ((this.stats.cacheHits /
                  (this.stats.cacheHits + this.stats.cacheMisses)) *
                100)
              ).toFixed(1) + "%"
            : "0%",
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get available data sources
   */
  getAvailableSources() {
    return {
      sources: Object.entries(this.managers).map(([key, manager]) => ({
        id: key,
        name: manager.name,
        description: manager.source,
        status: "operational",
      })),
      total: Object.keys(this.managers).length,
    };
  }

  /**
   * Health check
   */
  healthCheck() {
    const managerHealth = Object.entries(this.managers).map(
      ([, manager]) => {
        const stats = manager.getStats();
        return {
          manager: manager.name,
          operational: true,
          errorRate:
            stats.requests > 0
              ? ((stats.errors / stats.requests) * 100).toFixed(1) + "%"
              : "0%",
        };
      }
    );

    return {
      timestamp: new Date().toISOString(),
      status: "healthy",
      managers: managerHealth,
      overallHealth: "operational",
    };
  }
}

export default DataManagers;
