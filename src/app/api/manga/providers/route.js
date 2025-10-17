import { NextResponse } from 'next/server';
import { getMangaInfoAnilist, getAvailableProviders } from '@/lib/MangaFunctions';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Manga ID is required' }, { status: 400 });
    }

    const mangaInfo = await getMangaInfoAnilist(id);
    if (!mangaInfo) {
      return NextResponse.json({ error: 'Manga not found' }, { status: 404 });
    }

    const providers = await getAvailableProviders(mangaInfo);
    
    return NextResponse.json(providers);
  } catch (error) {
    console.error('Error fetching available providers:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
