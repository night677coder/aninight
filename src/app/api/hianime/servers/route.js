import { NextResponse } from "next/server";

const HIANIME_API = 'https://aniwatch-api-pi.vercel.app/api/v2/hianime';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const { animeEpisodeId } = searchParams;

  if (!animeEpisodeId) {
    return NextResponse.json(
      { error: 'animeEpisodeId is required' },
      { status: 400 }
    );
  }

  try {
    console.log(`[HiAnime Servers] Fetching servers for episode: ${animeEpisodeId}`);
    
    // Fetch real server list from HiAnime API
    const response = await fetch(
      `${HIANIME_API}/servers?animeEpisodeId=${encodeURIComponent(animeEpisodeId)}`,
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
    console.log(`[HiAnime Servers] ✅ Retrieved servers: ${JSON.stringify(data)}`);
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('[HiAnime Servers] Error:', error.message);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch servers' },
      { status: 500 }
    );
  }
}
