import { NextResponse } from 'next/server';

const ANIMEPAHE_BASE_URL = 'https://animepahe-api-iota.vercel.app';

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

    // Use the correct endpoint format: /api/play/:session?episodeId=example
    const response = await fetch(
      `${ANIMEPAHE_BASE_URL}/api/play/${animeSession}?episodeId=${episodeSession}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AnimePahe API error:', response.status, errorText);
      throw new Error(`AnimePahe API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract only download links from the downloads array
    const downloadLinks = {};
    
    if (data.downloads && Array.isArray(data.downloads)) {
      // Map downloads array to quality-based object
      data.downloads.forEach(item => {
        // Extract quality (360p, 720p, 1080p)
        const qualityMatch = item.quality?.match(/(\d+p)/);
        if (qualityMatch && item.download) {
          const quality = qualityMatch[1];
          downloadLinks[quality] = {
            url: item.download,
            quality: item.quality,
            filesize: item.filesize,
            fansub: item.fansub
          };
        }
      });
    }
    
    return NextResponse.json({ downloads: downloadLinks });
  } catch (error) {
    console.error('AnimePahe download error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch download links', details: error.message },
      { status: 500 }
    );
  }
}
