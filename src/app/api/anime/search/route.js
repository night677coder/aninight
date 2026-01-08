import { NextRequest, NextResponse } from 'next/server';
import { AdvancedSearch } from '@/lib/Anilistfunctions';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const search = searchParams.get('search') || '';
    const year = searchParams.get('year') || null;
    const season = searchParams.get('season') || null;
    const format = searchParams.get('format') || null;
    const sortby = searchParams.get('sortby') || null;
    const page = parseInt(searchParams.get('page') || '1');
    
    // Parse genre parameter
    const genreParam = searchParams.get('genre');
    let genrevalue = [];
    if (genreParam) {
      try {
        genrevalue = JSON.parse(genreParam);
      } catch (e) {
        // If it's not JSON, treat it as a single genre string
        genrevalue = [{ name: genreParam, value: genreParam, type: 'genres' }];
      }
    }

    const result = await AdvancedSearch(search, year, season, format, genrevalue, sortby, page);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search results', message: error.message },
      { status: 500 }
    );
  }
}
