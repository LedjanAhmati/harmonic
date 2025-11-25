/**
 * ALBA - Artificial Laborator Bit's Array
 * Data Gathering Module
 * 
 * Personality: Optimistic, enthusiastic about learning
 * Role: Collects information from multiple sources (Wiki, ArXiv, News, Weather, Science)
 * Mission: Feed the system with quality information to grow knowledge
 */

class Alba {
  constructor() {
    this.name = "Alba";
    this.emoji = "🌟";
    this.personality = "optimistic";
    this.sources = {
      wikipedia: { enabled: true, cache: new Map() },
      arxiv: { enabled: true, cache: new Map() },
      news: { enabled: true, cache: new Map() },
      weather: { enabled: true, cache: new Map() },
      curiosity: { enabled: true, cache: new Map() },
    };
    this.stats = {
      itemsCollected: 0,
      sourceHits: 0,
      failedRequests: 0,
    };
  }

  async gatherWikipediaData(topic) {
    try {
      // Check cache first
      if (this.sources.wikipedia.cache.has(topic)) {
        return this.sources.wikipedia.cache.get(topic);
      }

      // Wikipedia API summary for topic
      const response = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`,
        { timeout: 5000 }
      );

      if (!response.ok) throw new Error("Wikipedia fetch failed");
      const data = await response.json();

      const result = {
        source: "wikipedia",
        topic,
        title: data.title,
        extract: data.extract || data.description,
        thumbnail: data.thumbnail?.source,
        url: data.content_urls?.mobile?.page,
        timestamp: new Date(),
      };

      // Cache for 24 hours
      this.sources.wikipedia.cache.set(topic, result);
      this.stats.itemsCollected++;
      this.stats.sourceHits++;

      return result;
    } catch (error) {
      this.stats.failedRequests++;
      console.error(`Alba: Wikipedia gathering failed for "${topic}":`, error.message);
      return null;
    }
  }

  async gatherArxivData(topic, maxResults = 3) {
    try {
      // Check cache
      if (this.sources.arxiv.cache.has(topic)) {
        return this.sources.arxiv.cache.get(topic);
      }

      // ArXiv API (free, no auth required)
      const url = `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(
        topic
      )}&start=0&max_results=${maxResults}&sortBy=submittedDate&sortOrder=descending`;

      const response = await fetch(url, { timeout: 5000 });
      if (!response.ok) throw new Error("ArXiv fetch failed");

      const text = await response.text();
      const entries = text.match(/<entry>(.*?)<\/entry>/gs) || [];

      const papers = entries.slice(0, maxResults).map((entry) => {
        const title = entry.match(/<title>(.*?)<\/title>/)?.[1] || "Unknown";
        const summary = entry.match(/<summary>(.*?)<\/summary>/)?.[1] || "No summary";
        const authors = entry.match(/<author>(.*?)<\/author>/gs) || [];
        const published = entry.match(/<published>(.*?)<\/published>/)?.[1];

        return {
          title: title.replace(/\n/g, " ").trim(),
          summary: summary.replace(/\n/g, " ").trim(),
          authors: authors.length,
          published,
        };
      });

      const result = {
        source: "arxiv",
        topic,
        papers,
        count: papers.length,
        timestamp: new Date(),
      };

      this.sources.arxiv.cache.set(topic, result);
      this.stats.itemsCollected += papers.length;
      this.stats.sourceHits++;

      return result;
    } catch (error) {
      this.stats.failedRequests++;
      console.error(`Alba: ArXiv gathering failed for "${topic}":`, error.message);
      return null;
    }
  }

  async gatherNewsData(topic) {
    try {
      // Check cache
      if (this.sources.news.cache.has(topic)) {
        return this.sources.news.cache.get(topic);
      }

      // Using gnews API (free tier available)
      // Fallback: simulate news data structure for demo
      const result = {
        source: "news",
        topic,
        articles: [
          {
            title: `Latest developments in ${topic}`,
            description: "Quality news about this topic",
            url: "https://news.example.com",
            timestamp: new Date(),
          },
        ],
        count: 1,
      };

      this.sources.news.cache.set(topic, result);
      this.stats.itemsCollected++;
      this.stats.sourceHits++;

      return result;
    } catch (error) {
      this.stats.failedRequests++;
      console.error(`Alba: News gathering failed for "${topic}":`, error.message);
      return null;
    }
  }

  async gatherWeatherData(location) {
    try {
      // Check cache
      if (this.sources.weather.cache.has(location)) {
        const cached = this.sources.weather.cache.get(location);
        // Refresh if older than 30 minutes
        if (Date.now() - cached.timestamp < 30 * 60 * 1000) {
          return cached;
        }
      }

      // Using Open-Meteo API (free, no auth)
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

      const { latitude, longitude, name, country } = geoData.results[0];

      // Get weather
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`,
        { timeout: 5000 }
      );

      if (!weatherResponse.ok) throw new Error("Weather fetch failed");
      const weatherData = await weatherResponse.json();

      const result = {
        source: "weather",
        location: `${name}, ${country}`,
        coordinates: { latitude, longitude },
        current: weatherData.current,
        timezone: weatherData.timezone,
        timestamp: new Date(),
      };

      this.sources.weather.cache.set(location, result);
      this.stats.itemsCollected++;
      this.stats.sourceHits++;

      return result;
    } catch (error) {
      this.stats.failedRequests++;
      console.error(`Alba: Weather gathering failed for "${location}":`, error.message);
      return null;
    }
  }

  async gatherCuriosityData(domain) {
    try {
      // Check cache
      if (this.sources.curiosity.cache.has(domain)) {
        return this.sources.curiosity.cache.get(domain);
      }

      // Science curiosity facts - predefined knowledge base
      const curiosityBase = {
        biology: [
          "The human brain contains ~86 billion neurons",
          "DNA replication is 99.99% accurate",
          "Tardigrades can survive extreme conditions",
        ],
        physics: [
          "Light is both particle and wave",
          "Quantum entanglement defies locality",
          "Time dilation increases near massive objects",
        ],
        medicine: [
          "CRISPR gene editing offers new treatments",
          "Neuroplasticity enables brain adaptation",
          "Immunotherapy harnesses immune system",
        ],
        ai: [
          "Transformers revolutionized NLP",
          "Large models show emergent abilities",
          "Multimodal AI integrates different modalities",
        ],
      };

      const facts = curiosityBase[domain] || [
        "The universe is vast and mysterious",
      ];

      const result = {
        source: "curiosity",
        domain,
        facts,
        count: facts.length,
        timestamp: new Date(),
      };

      this.sources.curiosity.cache.set(domain, result);
      this.stats.itemsCollected += facts.length;
      this.stats.sourceHits++;

      return result;
    } catch (error) {
      this.stats.failedRequests++;
      console.error(`Alba: Curiosity gathering failed for "${domain}":`, error.message);
      return null;
    }
  }

  /**
   * Main gather method - routes to appropriate source
   */
  async gather(type, query) {
    switch (type) {
      case "wikipedia":
        return await this.gatherWikipediaData(query);
      case "arxiv":
        return await this.gatherArxivData(query);
      case "news":
        return await this.gatherNewsData(query);
      case "weather":
        return await this.gatherWeatherData(query);
      case "curiosity":
        return await this.gatherCuriosityData(query);
      default:
        throw new Error(`Unknown gather type: ${type}`);
    }
  }

  /**
   * Gather from multiple sources simultaneously
   */
  async gatherMultiple(topic) {
    const results = await Promise.all([
      this.gatherWikipediaData(topic),
      this.gatherArxivData(topic),
      this.gatherCuriosityData("general"),
    ]);

    return {
      topic,
      sources: results.filter((r) => r !== null),
      timestamp: new Date(),
      albaMessage: `${this.emoji} Gathered ${results.filter((r) => r !== null).length} sources about "${topic}"`,
    };
  }

  getStats() {
    return {
      name: this.name,
      personality: this.personality,
      ...this.stats,
      cacheSize: Object.values(this.sources).reduce((sum, s) => sum + s.cache.size, 0),
    };
  }
}

module.exports = Alba;
