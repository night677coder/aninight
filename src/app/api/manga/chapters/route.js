import { NextResponse } from 'next/server';
import { getMangaInfoAnilist, getMangaChapters } from '@/lib/MangaFunctions';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const provider = searchParams.get('provider');

    if (!id) {
      return NextResponse.json({ error: 'Manga ID is required' }, { status: 400 });
    }

    const mangaInfo = await getMangaInfoAnilist(id);
    if (!mangaInfo) {
      return NextResponse.json({ error: 'Manga not found' }, { status: 404 });
    }

    const chaptersData = await getMangaChapters(mangaInfo, provider);
    
    return NextResponse.json(chaptersData);
  } catch (error) {
    console.error('Error fetching manga chapters:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
