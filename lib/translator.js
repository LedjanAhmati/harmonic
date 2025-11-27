// lib/translator.js - Open Source Translation Module
// Uses free translation APIs and open-source data

export class Translator {
  constructor() {
    this.languages = {
      en: 'English',
      sq: 'Albanian',
        el: 'Greek',
        de: 'German',
      es: 'Spanish',
        tr: 'Turkish',
        ru: 'Russian',
        zh: 'Mandarin Chinese',
        hi: 'Hindi',
        ar: 'Arabic',
        he: 'Hebrew',
      it: 'Italian',
        bg: 'Bulgarian',
        sv: 'Swedish',
        no: 'Norwegian',
        nl: 'Dutch',
        fr: 'French',
        pt: 'Portuguese',
        ja: 'Japanese',
        ko: 'Korean',
        pl: 'Polish',
        vi: 'Vietnamese',
        th: 'Thai',
        id: 'Indonesian'
    };

    // Free translation API endpoints
    this.apis = [
      'https://api.mymemory.translated.net/get', // MyMemory (free, no key needed)
      'https://libretranslate.de/translate'       // LibreTranslate (open source)
    ];

      // Open source translation cache - 24 languages
    this.cache = {
        // English greetings to all languages
      'hello-sq': 'Përshëndetje',
        'hello-el': 'Γειά σας',
      'hello-de': 'Hallo',
        'hello-es': 'Hola',
        'hello-tr': 'Merhaba',
        'hello-ru': 'Привет',
        'hello-zh': '你好',
        'hello-hi': 'नमस्ते',
        'hello-ar': 'مرحبا',
        'hello-he': 'שלום',
      'hello-it': 'Ciao',
        'hello-bg': 'Здравей',
        'hello-sv': 'Hej',
        'hello-no': 'Hallo',
        'hello-nl': 'Hallo',
        'hello-fr': 'Bonjour',
      'hello-pt': 'Olá',
        'hello-ja': 'こんにちは',
        'hello-ko': '안녕하세요',
        'hello-pl': 'Cześć',

        // Thank you in all languages
        'thank you-sq': 'Faleminderit',
        'thank you-el': 'Ευχαριστώ',
        'thank you-de': 'Danke',
        'thank you-es': 'Gracias',
        'thank you-tr': 'Teşekkür ederim',
        'thank you-ru': 'Спасибо',
        'thank you-zh': '谢谢',
        'thank you-hi': 'धन्यवाद',
        'thank you-ar': 'شكراً',
        'thank you-he': 'תודה',
        'thank you-it': 'Grazie',
        'thank you-bg': 'Благодаря',
        'thank you-sv': 'Tack',
        'thank you-no': 'Takk',
        'thank you-nl': 'Dank je',
        'thank you-fr': 'Merci',
        'thank you-pt': 'Obrigado',
        'thank you-ja': 'ありがとう',
        'thank you-ko': '감사합니다',
        'thank you-pl': 'Dziękuję',

        // Science in all languages
      'science-sq': 'Shkencë',
        'science-el': 'Επιστήμη',
        'science-de': 'Wissenschaft',
      'science-es': 'Ciencia',
        'science-tr': 'Bilim',
        'science-ru': 'Наука',
        'science-zh': '科学',
        'science-hi': 'विज्ञान',
        'science-ar': 'العلم',
        'science-he': 'מדע',
        'science-it': 'Scienza',
        'science-bg': 'Наука',
        'science-sv': 'Vetenskap',
        'science-no': 'Vitenskap',
        'science-nl': 'Wetenschap',
        'science-fr': 'Science',
        'science-pt': 'Ciência',
        'science-ja': '科学',
        'science-ko': '과학',
        'science-pl': 'Nauka',

        // AI in all languages
        'artificial intelligence-sq': 'Inteligjencë artificiale',
        'artificial intelligence-el': 'Τεχνητή νοημοσύνη',
        'artificial intelligence-de': 'Künstliche Intelligenz',
        'artificial intelligence-es': 'Inteligencia artificial',
        'artificial intelligence-tr': 'Yapay Zeka',
        'artificial intelligence-ru': 'Искусственный интеллект',
        'artificial intelligence-zh': '人工智能',
        'artificial intelligence-hi': 'कृत्रिम बुद्धिमत्ता',
        'artificial intelligence-ar': 'الذكاء الاصطناعي',
        'artificial intelligence-he': 'בינה מלאכותית',
        'artificial intelligence-it': 'Intelligenza artificiale',
        'artificial intelligence-bg': 'Изкуствен интелект',
        'artificial intelligence-sv': 'Artificiell intelligens',
        'artificial intelligence-no': 'Kunstig intelligens',
        'artificial intelligence-nl': 'Kunstmatige intelligentie',
        'artificial intelligence-fr': 'Intelligence artificielle',
        'artificial intelligence-pt': 'Inteligência artificial',
        'artificial intelligence-ja': '人工知能',
        'artificial intelligence-ko': '인공 지능',
        'artificial intelligence-pl': 'Sztuczna inteligencja',

        // Harmonic in all languages
        'harmonic-sq': 'Harmonik',
        'harmonic-el': 'Αρμονικός',
        'harmonic-de': 'Harmonisch',
        'harmonic-es': 'Armónico',
        'harmonic-tr': 'Harmonik',
        'harmonic-ru': 'Гармонический',
        'harmonic-zh': '和谐的',
        'harmonic-hi': 'सामंजस्यपूर्ण',
        'harmonic-ar': 'متناسق',
        'harmonic-he': 'הרמוני',
        'harmonic-it': 'Armonico',
        'harmonic-bg': 'Хармоничен',
        'harmonic-sv': 'Harmonisk',
        'harmonic-no': 'Harmonisk',
        'harmonic-nl': 'Harmonisch',
        'harmonic-fr': 'Harmonique',
        'harmonic-pt': 'Harmônico',
        'harmonic-ja': 'ハーモニック',
        'harmonic-ko': '조화로운',
        'harmonic-pl': 'Harmoniczny'
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
        de: /\b(hallo|was|ist|german|danke|bitte)\b/i,
        es: /\b(hola|buenos|qué|es|español|gracias)\b/i,
        tr: /\b(merhaba|teşekkür|ederim|ne|var)\b/i,
        ru: /\b(привет|спасибо|что|это|русский)\b/i,
        zh: /[\u4E00-\u9FFF]+/,  // Chinese characters
        hi: /[\u0900-\u097F]+/,  // Devanagari script
        ar: /[\u0600-\u06FF]+/,  // Arabic script
        he: /[\u0590-\u05FF]+/,  // Hebrew script
        fr: /\b(bonjour|quoi|français|merci|c'est)\b/i,
        pt: /\b(olá|obrigado|português|o|que)\b/i,
        it: /\b(ciao|grazie|italiano|è|che)\b/i,
        nl: /\b(hallo|dank|nederlands|wat|is)\b/i,
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

const translator = new Translator();
export default translator;
