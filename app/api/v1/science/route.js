// app/api/v1/science/route.js - Open Source Science & Curiosity Data
import scienceCuriosity from '@/lib/science-curiosity';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'random';
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const count = parseInt(searchParams.get('count') || '5');
    const date = searchParams.get('date');

    let data;

    switch (action) {
      case 'random':
        data = scienceCuriosity.getRandomFact();
        break;

      case 'daily':
        data = scienceCuriosity.getDailyFact(date ? new Date(date) : undefined);
        break;

      case 'category':
        if (!category) {
          return Response.json(
            { error: 'Category parameter required for category action' },
            { status: 400 }
          );
        }
        data = scienceCuriosity.getFactsByCategory(category);
        break;

      case 'search':
        if (!search) {
          return Response.json(
            { error: 'Search parameter required for search action' },
            { status: 400 }
          );
        }
        data = scienceCuriosity.searchFacts(search);
        break;

      case 'trivia':
        data = scienceCuriosity.getTrivia(count);
        break;

      case 'categories':
        data = scienceCuriosity.getCategories();
        break;

      case 'stats':
        data = scienceCuriosity.getStats();
        break;

      default:
        return Response.json(
          { error: 'Invalid action. Use: random, daily, category, search, trivia, categories, stats' },
          { status: 400 }
        );
    }

    return Response.json({
      ok: true,
      action,
      data,
      source: 'Open Source Science Database',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Science API error:', error);
    return Response.json(
      { error: 'Science API failed', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { fact, category, source, verified } = body;

    if (!fact || !category) {
      return Response.json(
        { error: 'Missing required fields: fact, category' },
        { status: 400 }
      );
    }

    const result = scienceCuriosity.addFact(fact, category, source || 'User Submitted', verified || false);

    return Response.json({
      ok: true,
      message: 'Fact added successfully',
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Science API POST error:', error);
    return Response.json(
      { error: 'Failed to add fact', details: error.message },
      { status: 500 }
    );
  }
}
