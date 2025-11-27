// app/api/v1/translate/route.js - Multilingual Translation Endpoint
import translator from '@/lib/translator';

export async function POST(request) {
  try {
    const body = await request.json();
    const { text, targetLang, sourceLang = 'auto' } = body;

    if (!text || !targetLang) {
      return Response.json(
        { error: 'Missing required fields: text, targetLang' },
        { status: 400 }
      );
    }

    // Detect source language if auto
    let detectedLang = sourceLang;
    if (sourceLang === 'auto') {
      detectedLang = translator.detectLanguage(text);
    }

    // Translate
    const translatedText = await translator.translate(
      text,
      targetLang,
      detectedLang
    );

    return Response.json({
      ok: true,
      originalText: text,
      translatedText,
      sourceLang: detectedLang,
      targetLang,
      provider: 'MyMemory (Open Source)',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Translation error:', error);
    return Response.json(
      { error: 'Translation failed', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const languages = translator.getSupportedLanguages();
    return Response.json({
      ok: true,
      endpoint: '/api/v1/translate',
      method: 'POST',
      supportedLanguages: languages,
      example: {
        method: 'POST',
        body: {
          text: 'Hello world',
          targetLang: 'es',
          sourceLang: 'auto'
        },
        response: {
          translatedText: 'Hola mundo',
          sourceLang: 'en',
          targetLang: 'es'
        }
      }
    });
  } catch {
    return Response.json(
      { error: 'Failed to get languages' },
      { status: 500 }
    );
  }
}
