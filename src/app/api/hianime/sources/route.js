import { NextResponse } from "next/server";

const HIANIME_API = 'https://aniwatch-api-pi.vercel.app/api/v2/hianime';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const { animeEpisodeId, server = 'hd-1', category = 'sub' } = searchParams;

  if (!animeEpisodeId) {
    return NextResponse.json(
      { error: 'animeEpisodeId is required' },
      { status: 400 }
    );
  }

  try {
    console.log(`[HiAnime Sources] Fetching sources for episode: ${animeEpisodeId}, server: ${server}, category: ${category}`);
    
    // Fetch real data from HiAnime API
    const response = await fetch(
      `${HIANIME_API}/sources?animeEpisodeId=${encodeURIComponent(animeEpisodeId)}&server=${server}&category=${category}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        signal: AbortSignal.timeout(15000)
      }
    );

    if (!response.ok) {
      throw new Error(`HiAnime API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[HiAnime Sources] ✅ Retrieved sources from server ${server}`);
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('[HiAnime Sources] Error:', error.message);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sources', details: error.message },
      { status: 500 }
    );
  }
}
