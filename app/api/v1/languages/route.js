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
          featured: ['en', 'sq', 'el', 'es', 'fr'],
          featuredLanguages: [
            { code: 'en', name: 'English', flag: '🇺🇸' },
            { code: 'sq', name: 'Albanian', flag: '🇦🇱' },
            { code: 'el', name: 'Greek', flag: '🇬🇷' },
            { code: 'es', name: 'Spanish', flag: '🇪🇸' },
            { code: 'fr', name: 'French', flag: '🇫🇷' }
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
        en: [
          'Hello',
          'Good morning',
          'Thank you',
          'How are you?',
          'My name is',
          'What is this?',
          'Where is',
          'I need help'
        ],
        sq: [
          'Përshëndetje',
          'Mirëmengjes',
          'Faleminderit',
          'Si jeni?',
          'Emri im është',
          'Çfare është kjo?',
          'Ku është',
          'Kam nevojë për ndihmë'
        ],
        el: [
          'Γειά σας',
          'Καλημέρα',
          'Ευχαριστώ',
          'Πώς είστε;',
          'Το όνομά μου είναι',
          'Τι είναι αυτό;',
          'Πού είναι',
          'Χρειάζομαι βοήθεια'
        ],
        es: [
          'Hola',
          'Buenos días',
          'Gracias',
          '¿Cómo estás?',
          'Mi nombre es',
          '¿Qué es esto?',
          'Dónde está',
          'Necesito ayuda'
        ],
        fr: [
          'Bonjour',
          'Bon matin',
          'Merci',
          'Comment allez-vous?',
          'Je m\'appelle',
          'Qu\'est-ce que c\'est?',
          'Où est',
          'J\'ai besoin d\'aide'
        ]
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
        sq: {
          code: 'sq',
          name: 'Albanian',
          nativeName: 'Shqip',
          flag: '🇦🇱',
          speakers: '7.5 million',
          region: 'South Eastern Europe',
          script: 'Latin',
          rtl: false,
          variants: ['Gheg', 'Tosk'],
          resources: {
            wikipedia: 'https://sq.wikipedia.org/',
            wiktionary: 'https://sq.wiktionary.org/',
            learning: 'https://en.wikipedia.org/wiki/Albanian_language'
          }
        },
        el: {
          code: 'el',
          name: 'Greek',
          nativeName: 'Ελληνικά',
          flag: '🇬🇷',
          speakers: '13.3 million',
          region: 'Southern Europe & Eastern Mediterranean',
          script: 'Greek',
          rtl: false,
          variants: ['Modern Greek', 'Cypriot Greek'],
          resources: {
            wikipedia: 'https://el.wikipedia.org/',
            wiktionary: 'https://el.wiktionary.org/',
            learning: 'https://en.wikipedia.org/wiki/Greek_language'
          }
        },
        en: {
          code: 'en',
          name: 'English',
          nativeName: 'English',
          flag: '🇬🇧',
          speakers: '1.5 billion',
          region: 'Worldwide',
          script: 'Latin',
          rtl: false,
          variants: ['British', 'American', 'Australian'],
          resources: {
            wikipedia: 'https://en.wikipedia.org/',
            wiktionary: 'https://en.wiktionary.org/',
            learning: 'https://en.wikipedia.org/wiki/English_language'
          }
        },
        es: {
          code: 'es',
          name: 'Spanish',
          nativeName: 'Español',
          flag: '🇪🇸',
          speakers: '500 million',
          region: 'Spain & Latin America',
          script: 'Latin',
          rtl: false,
          variants: ['Castilian', 'Latin American'],
          resources: {
            wikipedia: 'https://es.wikipedia.org/',
            wiktionary: 'https://es.wiktionary.org/',
            learning: 'https://en.wikipedia.org/wiki/Spanish_language'
          }
        },
        fr: {
          code: 'fr',
          name: 'French',
          nativeName: 'Français',
          flag: '🇫🇷',
          speakers: '280 million',
          region: 'France & International',
          script: 'Latin',
          rtl: false,
          variants: ['Parisian', 'Belgian', 'Swiss'],
          resources: {
            wikipedia: 'https://fr.wikipedia.org/',
            wiktionary: 'https://fr.wiktionary.org/',
            learning: 'https://en.wikipedia.org/wiki/French_language'
          }
        }
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
