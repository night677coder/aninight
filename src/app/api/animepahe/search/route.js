import { NextResponse } from 'next/server';

const ANIMEPAHE_BASE_URL = process.env.ANIMEPAHE_BASE_URL || 'https://animepahe-api-iota.vercel.app';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const page = searchParams.get('page') || '1';

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${ANIMEPAHE_BASE_URL}/api/search?q=${encodeURIComponent(query)}&page=${page}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`AnimePahe API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('AnimePahe search error:', error);
    return NextResponse.json(
      { error: 'Failed to search anime' },
      { status: 500 }
    );
  }
}
