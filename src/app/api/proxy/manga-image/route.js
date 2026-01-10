import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    console.log('Proxying manga image:', url);

    // Set headers to mimic a real browser request and bypass Cloudflare
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'image',
      'Sec-Fetch-Mode': 'no-cors',
      'Sec-Fetch-Site': 'cross-site',
      'Referer': 'https://mangapill.com/',
      'Origin': 'https://mangapill.com'
    };

    // Add specific headers for manga sites
    if (url.includes('mangapill') || url.includes('cdnpill')) {
      headers['Referer'] = 'https://mangapill.com/';
      headers['Origin'] = 'https://mangapill.com';
    } else if (url.includes('mangahere') || url.includes('mhcdn')) {
      headers['Referer'] = 'https://www.mangahere.cc/';
      headers['Origin'] = 'https://www.mangahere.cc';
    }

    const response = await fetch(url, {
      headers,
      // Add timeout
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    // Get the content type
    const contentType = response.headers.get('content-type');

    // Verify it's an image
    if (!contentType || !contentType.startsWith('image/')) {
      console.error('Response is not an image:', contentType);
      return NextResponse.json(
        { error: 'URL does not point to a valid image' },
        { status: 400 }
      );
    }

    // Get the image buffer
    const imageBuffer = await response.arrayBuffer();

    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('Proxy error:', error);

    // Handle timeout errors specifically
    if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
      return NextResponse.json(
        { error: 'Request timeout', message: 'Image took too long to load' },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
