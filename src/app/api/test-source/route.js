import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json();
    console.log('[TEST-SOURCE] Request body:', body);
    
    // Test with a simple response
    return NextResponse.json({
      sources: [{
        url: 'https://test.m3u8',
        quality: 'default',
        type: 'hls'
      }],
      subtitles: [],
      download: null
    });
  } catch (error) {
    console.error('[TEST-SOURCE] Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
