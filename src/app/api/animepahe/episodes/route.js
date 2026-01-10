import { NextResponse } from 'next/server';

const ANIMEPAHE_BASE_URL = process.env.ANIMEPAHE_BASE_URL || 'https://animepahe-api-iota.vercel.app';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const session = searchParams.get('session');
    const sort = searchParams.get('sort') || 'episode_desc';
    const page = searchParams.get('page') || '1';

    if (!session) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${ANIMEPAHE_BASE_URL}/api/${session}/releases?sort=${sort}&page=${page}`,
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
    console.error('AnimePahe episodes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch episodes' },
      { status: 500 }
    );
  }
}
