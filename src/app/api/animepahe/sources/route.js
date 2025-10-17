import { NextResponse } from 'next/server';

const ANIMEPAHE_BASE_URL = 'https://animepahe-api-iota.vercel.app';
const EXTERNAL_PROXY = 'https://m8u3.thevoidborn001.workers.dev';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const animeSession = searchParams.get('animeSession');
    const episodeSession = searchParams.get('episodeSession');

    if (!animeSession || !episodeSession) {
      return NextResponse.json(
        { error: 'Both animeSession and episodeSession are required' },
        { status: 400 }
      );
    }

    console.log(`[AnimePahe Sources] Fetching for anime: ${animeSession}, episode: ${episodeSession}`);

    // Use faster endpoint with downloads=false
    const response = await fetch(
      `${ANIMEPAHE_BASE_URL}/api/play/${animeSession}?episodeId=${episodeSession}&downloads=false`,
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
    
    // Get the subtype from query params (sub or dub)
    const subtype = searchParams.get('subtype') || 'sub';
    const isDubRequested = subtype.toLowerCase() === 'dub';
    
    console.log(`[AnimePahe Sources] Requested subtype: ${subtype}, isDub: ${isDubRequested}`);
    
    // Transform the response to match our player format
    let sources = [];
    const subtitles = [];

    // Extract streaming URLs from the sources array, filtering by dub/sub
    if (data.sources && Array.isArray(data.sources)) {
      for (const source of data.sources) {
        // Filter based on isDub flag
        if (source.isDub !== isDubRequested) {
          continue;
        }
        
        if (source.url && source.isM3U8) {
          // Extract the path after the domain
          const urlObj = new URL(source.url);
          const proxyPath = urlObj.pathname + urlObj.search;
          
          sources.push({
            url: `${EXTERNAL_PROXY}${proxyPath}`,
            quality: source.resolution || 'default',
            isM3U8: true,
            type: 'hls'
          });
        }
      }
    }

    // Auto-fallback: If dub was requested but no dub sources found, try sub
    if (sources.length === 0 && isDubRequested) {
      console.log(`[AnimePahe Sources] No dub sources found, falling back to sub`);
      
      for (const source of data.sources) {
        // Get sub sources instead
        if (source.isDub === false && source.url && source.isM3U8) {
          const urlObj = new URL(source.url);
          const proxyPath = urlObj.pathname + urlObj.search;
          
          sources.push({
            url: `${EXTERNAL_PROXY}${proxyPath}`,
            quality: source.resolution || 'default',
            isM3U8: true,
            type: 'hls'
          });
        }
      }
    }

    // Add a default/auto quality source if available (use highest quality)
    if (sources.length > 0) {
      // Find 1080p source or use first source
      const highQualitySource = sources.find(s => s.quality === '1080') || sources[0];
      sources.unshift({
        url: highQualitySource.url,
        quality: 'auto',
        isM3U8: true,
        type: 'hls'
      });
    }

    const actualType = sources.length > 0 && isDubRequested && data.sources.some(s => s.isDub === false && sources.some(src => src.url.includes(s.url.split('/').pop()))) ? 'sub (fallback)' : subtype;
    console.log(`[AnimePahe Sources] Found ${sources.length} ${actualType} sources`);

    return NextResponse.json({
      sources,
      subtitles,
      download: data.downloads || null,
      headers: {
        Referer: 'https://animepahe.com/'
      }
    });
  } catch (error) {
    console.error('AnimePahe sources error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sources' },
      { status: 500 }
    );
  }
}
