// app/api/v1/languages/route.js - Multilingual language support
import translator from '@/lib/translator';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list';
    const lang = searchParams.get('lang');

    if (action === 'list') {
      const languages = translator.getSupportedLanguages();
      return Response.json(
        {
          ok: true,
          action: 'list',
          totalLanguages: languages.length,
          languages,
              featured: ['en', 'sq', 'el', 'de', 'es', 'tr', 'ru', 'zh', 'hi', 'ar', 'he', 'it', 'bg', 'sv', 'no', 'nl', 'fr', 'pt', 'ja', 'ko', 'pl'],
          featuredLanguages: [
            { code: 'en', name: 'English', flag: '🇺🇸' },
            { code: 'sq', name: 'Albanian', flag: '🇦🇱' },
            { code: 'el', name: 'Greek', flag: '🇬🇷' },
              { code: 'de', name: 'German', flag: '🇩🇪' },
            { code: 'es', name: 'Spanish', flag: '🇪🇸' },
              { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
              { code: 'ru', name: 'Russian', flag: '🇷🇺' },
              { code: 'zh', name: 'Mandarin Chinese', flag: '🇨🇳' },
              { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
              { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
              { code: 'he', name: 'Hebrew', flag: '🇮🇱' },
              { code: 'it', name: 'Italian', flag: '🇮🇹' },
              { code: 'bg', name: 'Bulgarian', flag: '🇧🇬' },
              { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
              { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
              { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
              { code: 'fr', name: 'French', flag: '🇫🇷' },
              { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
              { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
              { code: 'ko', name: 'Korean', flag: '🇰🇷' },
              { code: 'pl', name: 'Polish', flag: '🇵🇱' }
          ],
          timestamp: new Date().toISOString()
        },
        {
          headers: {
            'Cache-Control': 'public, max-age=86400'
          }
        }
      );
    }

    if (action === 'dictionary') {
      if (!lang) {
        return Response.json(
          { error: 'Language parameter required' },
          { status: 400 }
        );
      }

      // Get common phrases in requested language
      const phrases = {
          en: ['Hello', 'Good morning', 'Thank you', 'How are you?', 'My name is', 'What is this?', 'Where is', 'I need help'],
          sq: ['Përshëndetje', 'Mirëmengjes', 'Faleminderit', 'Si jeni?', 'Emri im është', 'Çfare është kjo?', 'Ku është', 'Kam nevojë për ndihmë'],
          el: ['Γειά σας', 'Καλημέρα', 'Ευχαριστώ', 'Πώς είστε;', 'Το όνομά μου είναι', 'Τι είναι αυτό;', 'Πού είναι', 'Χρειάζομαι βοήθεια'],
          de: ['Hallo', 'Guten Morgen', 'Danke', 'Wie geht es dir?', 'Mein Name ist', 'Was ist das?', 'Wo ist', 'Ich brauche Hilfe'],
          es: ['Hola', 'Buenos días', 'Gracias', '¿Cómo estás?', 'Mi nombre es', '¿Qué es esto?', 'Dónde está', 'Necesito ayuda'],
          tr: ['Merhaba', 'Günaydın', 'Teşekkür ederim', 'Nasılsın?', 'Benim adım', 'Bu nedir?', 'Nerede', 'Yardıma ihtiyacım var'],
          ru: ['Привет', 'Доброе утро', 'Спасибо', 'Как дела?', 'Меня зовут', 'Что это?', 'Где', 'Мне нужна помощь'],
          zh: ['你好', '早上好', '谢谢', '你好吗?', '我叫', '这是什么?', '在哪里', '我需要帮助'],
          hi: ['नमस्ते', 'सुप्रभात', 'धन्यवाद', 'आप कैसे हैं?', 'मेरा नाम है', 'यह क्या है?', 'कहाँ है', 'मुझे सहायता चाहिए'],
          ar: ['مرحبا', 'صباح الخير', 'شكراً', 'كيف حالك?', 'اسمي', 'ما هذا؟', 'أين', 'أحتاج إلى مساعدة'],
          he: ['שלום', 'בוקר טוב', 'תודה', 'מה שלומך?', 'שמי הוא', 'מה זה?', 'איפה', 'אני צריך עזרה'],
          it: ['Ciao', 'Buongiorno', 'Grazie', 'Come stai?', 'Mi chiamo', 'Cos\'è questo?', 'Dov\'è', 'Ho bisogno di aiuto'],
          fr: ['Bonjour', 'Bon matin', 'Merci', 'Comment allez-vous?', 'Je m\'appelle', 'Qu\'est-ce que c\'est?', 'Où est', 'J\'ai besoin d\'aide'],
          nl: ['Hallo', 'Goedemorgen', 'Dank je', 'Hoe gaat het?', 'Mijn naam is', 'Wat is dit?', 'Waar is', 'Ik heb hulp nodig'],
          sv: ['Hej', 'God morgon', 'Tack', 'Hur mår du?', 'Mitt namn är', 'Vad är det här?', 'Var är', 'Jag behöver hjälp'],
          no: ['Hallo', 'God morgen', 'Takk', 'Hvordan går det?', 'Mitt navn er', 'Hva er dette?', 'Hvor er', 'Jeg trenger hjelp'],
          bg: ['Здравей', 'Добро утро', 'Благодаря', 'Как си?', 'Казвам се', 'Какво е това?', 'Къде е', 'Трябва ми помощ'],
          pt: ['Olá', 'Bom dia', 'Obrigado', 'Como vai?', 'Meu nome é', 'O que é isso?', 'Onde fica', 'Preciso de ajuda'],
          ja: ['こんにちは', 'おはようございます', 'ありがとう', 'お元気ですか?', '私の名前は', 'これは何ですか?', 'どこですか', 'ヘルプが必要です'],
          ko: ['안녕하세요', '좋은 아침', '감사합니다', '어떻게 지내세요?', '제 이름은', '이게 뭔가요?', '어디', '도움이 필요합니다'],
          pl: ['Cześć', 'Dzień dobry', 'Dziękuję', 'Jak się masz?', 'Mam na imię', 'Co to jest?', 'Gdzie jest', 'Potrzebuję pomocy']
      };

      const dictionary = phrases[lang] || phrases['en'];

      return Response.json(
        {
          ok: true,
          action: 'dictionary',
          language: lang,
          commonPhrases: dictionary,
          count: dictionary.length,
          timestamp: new Date().toISOString()
        },
        {
          headers: {
            'Cache-Control': 'public, max-age=86400'
          }
        }
      );
    }

    if (action === 'details') {
      if (!lang) {
        return Response.json(
          { error: 'Language parameter required' },
          { status: 400 }
        );
      }

      const langDetails = {
          en: { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', speakers: '1.5 billion', region: 'Worldwide', script: 'Latin', rtl: false },
          sq: { code: 'sq', name: 'Albanian', nativeName: 'Shqip', flag: '🇦🇱', speakers: '7.5 million', region: 'South Eastern Europe', script: 'Latin', rtl: false },
          el: { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷', speakers: '13.3 million', region: 'Southern Europe', script: 'Greek', rtl: false },
          de: { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', speakers: '130 million', region: 'Central Europe', script: 'Latin', rtl: false },
          es: { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', speakers: '500 million', region: 'Spain & Latin America', script: 'Latin', rtl: false },
          tr: { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', speakers: '88 million', region: 'Turkey & Central Asia', script: 'Latin', rtl: false },
          ru: { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', speakers: '258 million', region: 'Russia & Eastern Europe', script: 'Cyrillic', rtl: false },
          zh: { code: 'zh', name: 'Mandarin Chinese', nativeName: '普通话', flag: '🇨🇳', speakers: '1.1 billion', region: 'China & Taiwan', script: 'Chinese', rtl: false },
          hi: { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', speakers: '602 million', region: 'India', script: 'Devanagari', rtl: false },
          ar: { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', speakers: '422 million', region: 'Middle East & North Africa', script: 'Arabic', rtl: true },
          he: { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', speakers: '9 million', region: 'Israel', script: 'Hebrew', rtl: true },
          it: { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', speakers: '67 million', region: 'Italy & Switzerland', script: 'Latin', rtl: false },
          bg: { code: 'bg', name: 'Bulgarian', nativeName: 'Български', flag: '🇧🇬', speakers: '8 million', region: 'Bulgaria', script: 'Cyrillic', rtl: false },
          sv: { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', speakers: '13 million', region: 'Sweden & Finland', script: 'Latin', rtl: false },
          no: { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴', speakers: '5 million', region: 'Norway', script: 'Latin', rtl: false },
          nl: { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', speakers: '25 million', region: 'Netherlands & Belgium', script: 'Latin', rtl: false },
          fr: { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', speakers: '280 million', region: 'France & International', script: 'Latin', rtl: false },
          pt: { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', speakers: '252 million', region: 'Portugal & Brazil', script: 'Latin', rtl: false },
          ja: { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', speakers: '125 million', region: 'Japan', script: 'Japanese', rtl: false },
          ko: { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', speakers: '81 million', region: 'South Korea & North Korea', script: 'Hangul', rtl: false },
          pl: { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', speakers: '38 million', region: 'Poland', script: 'Latin', rtl: false }
      };

      const details = langDetails[lang] || langDetails['en'];

      return Response.json(
        {
          ok: true,
          action: 'details',
          language: details,
          timestamp: new Date().toISOString()
        },
        {
          headers: {
            'Cache-Control': 'public, max-age=86400'
          }
        }
      );
    }

    return Response.json(
      {
        ok: false,
        error: 'Invalid action',
        availableActions: ['list', 'dictionary', 'details'],
        hint: 'Use ?action=list|dictionary|details&lang=sq|el|en|es|fr'
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Language API error:', error);
    return Response.json(
      { error: 'Language API failed', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { text, lang } = body;

    if (!text || !lang) {
      return Response.json(
        { error: 'Missing required fields: text, lang' },
        { status: 400 }
      );
    }

    const languages = translator.getSupportedLanguages();
    const isSupported = languages.some(l => l.code === lang);

    if (!isSupported) {
      return Response.json(
        {
          error: 'Language not supported',
          supported: languages.map(l => l.code)
        },
        { status: 400 }
      );
    }

    // Return language info with the provided text
    return Response.json(
      {
        ok: true,
        text,
        language: lang,
        isSupported: true,
        timestamp: new Date().toISOString()
      }
    );
  } catch (error) {
    console.error('Language POST error:', error);
    return Response.json(
      { error: 'Language processing failed', details: error.message },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return Response.json(
    {
      ok: true,
      endpoint: '/api/v1/languages',
      methods: {
        GET: {
          actions: [
            { name: 'list', description: 'List all supported languages' },
            { name: 'dictionary', description: 'Get common phrases for a language' },
            { name: 'details', description: 'Get detailed language information' }
          ],
          parameters: ['action', 'lang'],
          examples: [
            '/api/v1/languages?action=list',
            '/api/v1/languages?action=dictionary&lang=sq',
            '/api/v1/languages?action=details&lang=el'
          ]
        },
        POST: {
          description: 'Validate text in language',
          body: { text: 'string', lang: 'string' }
        }
      },
      featuredLanguages: ['en', 'sq', 'el', 'es', 'fr'],
      totalLanguages: 17,
      features: ['Translation', 'Language Detection', 'Common Phrases', 'Language Details']
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=86400'
      }
    }
  );
}
