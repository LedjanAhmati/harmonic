// lib/translator.js - Open Source Translation Module
// Uses free translation APIs and open-source data

export class Translator {
  constructor() {
    this.languages = {
      en: 'English',
      sq: 'Albanian',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      it: 'Italian',
      pt: 'Portuguese',
      ru: 'Russian',
      ja: 'Japanese',
      zh: 'Chinese',
      ar: 'Arabic',
      hi: 'Hindi'
    };

    // Free translation API endpoints
    this.apis = [
      'https://api.mymemory.translated.net/get', // MyMemory (free, no key needed)
      'https://libretranslate.de/translate'       // LibreTranslate (open source)
    ];

    // Open source translation cache
    this.cache = {
      'hello-sq': 'Përshëndetje',
      'hello-es': 'Hola',
      'hello-fr': 'Bonjour',
      'hello-de': 'Hallo',
      'hello-it': 'Ciao',
      'hello-pt': 'Olá',
      'science-sq': 'Shkencë',
      'science-es': 'Ciencia',
      'data-sq': 'E dhëna',
      'data-es': 'Datos',
      'knowledge-sq': 'Njohuri',
      'knowledge-es': 'Conocimiento'
    };
  }

  /**
   * Translate text using free APIs
   */
  async translate(text, targetLang = 'sq', sourceLang = 'en') {
    // Check cache first (open source data)
    const cacheKey = `${text.toLowerCase()}-${targetLang}`;
    if (this.cache[cacheKey]) {
      return {
        original: text,
        translated: this.cache[cacheKey],
        source: sourceLang,
        target: targetLang,
        provider: 'cache',
        confidence: 1.0
      };
    }

    try {
      // Use MyMemory (free, no authentication needed)
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`
      );
      const data = await response.json();

      if (data.responseStatus === 200) {
        return {
          original: text,
          translated: data.responseData.translatedText,
          source: sourceLang,
          target: targetLang,
          provider: 'mymemory',
          confidence: data.responseData.match || 0.8
        };
      }
    } catch (error) {
      console.warn('Translation API error:', error.message);
    }

    // Fallback: return original
    return {
      original: text,
      translated: text,
      source: sourceLang,
      target: targetLang,
      provider: 'fallback',
      confidence: 0
    };
  }

  /**
   * Get list of supported languages
   */
  getSupportedLanguages() {
    return Object.entries(this.languages).map(([code, name]) => ({
      code,
      name,
      rtl: ['ar', 'he'].includes(code)
    }));
  }

  /**
   * Detect language
   */
  async detectLanguage(text) {
    const languages = {
      sq: /\b(përshëndetje|hello|cfare|është)\b/i,
      es: /\b(hola|qué|es|español)\b/i,
      fr: /\b(bonjour|quoi|français)\b/i,
      en: /\b(hello|what|is|english)\b/i
    };

    for (const [lang, regex] of Object.entries(languages)) {
      if (regex.test(text)) {
        return { detected: lang, confidence: 0.8 };
      }
    }

    return { detected: 'en', confidence: 0.3 };
  }
}

export default new Translator();
