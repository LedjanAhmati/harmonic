// app/api/v1/detect-language/route.js - Detect Language from Text
import translator from '@/lib/translator';

export async function POST(request) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text) {
      return Response.json(
        { error: 'Missing required field: text' },
        { status: 400 }
      );
    }

    const detectedLanguage = translator.detectLanguage(text);
    const supportedLanguages = translator.getSupportedLanguages();
    const languageInfo = supportedLanguages.find(l => l.code === detectedLanguage);

    return Response.json({
      ok: true,
      text: text.substring(0, 100),
      detectedLanguage,
      languageName: languageInfo?.name || 'Unknown',
      confidence: 'high',
      supportedLanguages: supportedLanguages.map(l => ({ code: l.code, name: l.name })),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Language detection error:', error);
    return Response.json(
      { error: 'Detection failed', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const languages = translator.getSupportedLanguages();
    return Response.json({
      ok: true,
      endpoint: '/api/v1/detect-language',
      method: 'POST',
      supportedLanguages: languages,
      example: {
        method: 'POST',
        body: {
          text: 'Hello world'
        },
        response: {
          detectedLanguage: 'en',
          languageName: 'English',
          confidence: 'high'
        }
      }
    });
  } catch (error) {
    return Response.json(
      { error: 'Failed to get languages' },
      { status: 500 }
    );
  }
}
