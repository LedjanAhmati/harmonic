// lib/translator.js - Open Source Translation Module
// Uses free translation APIs and open-source data

export class Translator {
  constructor() {
    this.languages = {
      en: 'English',
      sq: 'Albanian',
        el: 'Greek',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      it: 'Italian',
      pt: 'Portuguese',
      ru: 'Russian',
      ja: 'Japanese',
      zh: 'Chinese',
      ar: 'Arabic',
        hi: 'Hindi',
        ko: 'Korean',
        tr: 'Turkish',
        nl: 'Dutch',
        pl: 'Polish'
    };

    // Free translation API endpoints
    this.apis = [
      'https://api.mymemory.translated.net/get', // MyMemory (free, no key needed)
      'https://libretranslate.de/translate'       // LibreTranslate (open source)
    ];

    // Open source translation cache
    this.cache = {
        // English to Albanian
      'hello-sq': 'Përshëndetje',
        'hello-el': 'Γειά σας',
      'hello-es': 'Hola',
      'hello-fr': 'Bonjour',
      'hello-de': 'Hallo',
      'hello-it': 'Ciao',
      'hello-pt': 'Olá',

        'good morning-sq': 'Mirëmengjes',
        'good morning-el': 'Καλημέρα',
        'good morning-es': 'Buenos días',
        'good morning-fr': 'Bonjour',

        'thank you-sq': 'Faleminderit',
        'thank you-el': 'Ευχαριστώ',
        'thank you-es': 'Gracias',
        'thank you-fr': 'Merci',

      'science-sq': 'Shkencë',
        'science-el': 'Επιστήμη',
      'science-es': 'Ciencia',
        'science-fr': 'Science',

      'data-sq': 'E dhëna',
        'data-el': 'Δεδομένα',
      'data-es': 'Datos',
        'data-fr': 'Données',

      'knowledge-sq': 'Njohuri',
        'knowledge-el': 'Γνώση',
        'knowledge-es': 'Conocimiento',
        'knowledge-fr': 'Connaissance',

        'artificial intelligence-sq': 'Inteligjencë artificiale',
        'artificial intelligence-el': 'Τεχνητή νοημοσύνη',
        'artificial intelligence-es': 'Inteligencia artificial',
        'artificial intelligence-fr': 'Intelligence artificielle',

        'reasoning-sq': 'Arsyetim',
        'reasoning-el': 'Συλλογισμός',
        'reasoning-es': 'Razonamiento',
        'reasoning-fr': 'Raisonnement',

        'debate-sq': 'Debat',
        'debate-el': 'Συζήτηση',
        'debate-es': 'Debate',
        'debate-fr': 'Débat',

        'harmonic-sq': 'Harmonik',
        'harmonic-el': 'Αρμονικός',
        'harmonic-es': 'Armónico',
        'harmonic-fr': 'Harmonique',

        'api-sq': 'API',
        'api-el': 'API',
        'api-es': 'API',
        'api-fr': 'API'
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
        sq: /\b(përshëndetje|mirëmengjes|faleminderit|çfare|është|shqip)\b/i,
        el: /\b(γεια|καλημέρα|ευχαριστώ|τι|είναι|ελληνικά|συζήτηση)\b/i,
        es: /\b(hola|buenos|qué|es|español|gracias)\b/i,
        fr: /\b(bonjour|quoi|français|merci|c'est)\b/i,
        de: /\b(hallo|was|ist|german|danke)\b/i,
        en: /\b(hello|what|is|english|thank|you)\b/i
    };

    for (const [lang, regex] of Object.entries(languages)) {
      if (regex.test(text)) {
          return { detected: lang, confidence: 0.9, language: this.languages[lang] };
      }
    }

      return { detected: 'en', confidence: 0.3, language: 'English' };
  }
}

export default new Translator();
