import { NextResponse } from "next/server";

// Helper function to retry fetch with exponential backoff
async function fetchWithRetry(url, options, maxRetries = 3) {
  let retries = 0;
  let lastError;

  while (retries < maxRetries) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const fetchOptions = {
        ...options,
        signal: controller.signal
      };

      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      lastError = error;
      retries++;
      console.warn(`Retry ${retries}/${maxRetries} for ${url}: ${error.message}`);
      
      if (retries < maxRetries) {
        // Exponential backoff: wait longer between each retry
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries - 1)));
      }
    }
  }
  
  throw lastError;
}

// Process m3u8 content to properly handle all types of HLS manifests
function processM3u8Content(text, baseUrl, headersParam, proxyUri) {
  // Fix for master playlists (variant streams)
  let modifiedContent = text.replace(
    /(#EXT-X-STREAM-INF:.*[\r\n]+)(.*$)/gm,
    (match, header, tsUrl) => {
      if (!tsUrl || tsUrl.trim().startsWith('#')) return match;
      
      // Handle absolute and relative URLs
      const fullUrl = tsUrl.trim().startsWith('http') 
        ? tsUrl.trim() 
        : new URL(tsUrl.trim(), baseUrl).toString();
        
      return `${header}${proxyUri}/api/m3u8-proxy?url=${encodeURIComponent(fullUrl)}&headers=${headersParam || ''}`;
    }
  );
  
  // Fix for segment playlists (ts files)
  modifiedContent = modifiedContent.replace(
    /(#EXTINF:.*[\r\n]+)((?!#).*$)/gm,
    (match, info, tsUrl) => {
      if (!tsUrl || tsUrl.trim().startsWith('#')) return match;
      
      // Handle absolute and relative URLs
      const fullUrl = tsUrl.trim().startsWith('http') 
        ? tsUrl.trim() 
        : new URL(tsUrl.trim(), baseUrl).toString();
        
      return `${info}${proxyUri}/api/m3u8-proxy?url=${encodeURIComponent(fullUrl)}&headers=${headersParam || ''}`;
    }
  );
  
  // Fix for key files (encryption)
  modifiedContent = modifiedContent.replace(
    /(#EXT-X-KEY:.*URI=")([^"]*)(".*)/g,
    (match, prefix, keyUri, suffix) => {
      if (!keyUri) return match;
      
      // Handle absolute and relative URLs for encryption keys
      const fullUrl = keyUri.trim().startsWith('http') 
        ? keyUri.trim() 
        : new URL(keyUri.trim(), baseUrl).toString();
        
      return `${prefix}${proxyUri}/api/m3u8-proxy?url=${encodeURIComponent(fullUrl)}&headers=${headersParam || ''}${suffix}`;
    }
  );
  
  // Fix for map files (initialization segments)
  modifiedContent = modifiedContent.replace(
    /(#EXT-X-MAP:.*URI=")([^"]*)(".*)/g,
    (match, prefix, mapUri, suffix) => {
      if (!mapUri) return match;
      
      // Handle absolute and relative URLs for map segments
      const fullUrl = mapUri.trim().startsWith('http') 
        ? mapUri.trim() 
        : new URL(mapUri.trim(), baseUrl).toString();
        
      return `${prefix}${proxyUri}/api/m3u8-proxy?url=${encodeURIComponent(fullUrl)}&headers=${headersParam || ''}${suffix}`;
    }
  );
  
  return modifiedContent;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const headersParam = searchParams.get("headers");
  
  if (!url) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 }
    );
  }

  try {
    // Parse custom headers if provided
    const customHeaders = headersParam ? JSON.parse(decodeURIComponent(headersParam)) : {};
    
    // Add robust headers that help with various sources
    const fetchHeaders = {
      ...customHeaders,
      'User-Agent': customHeaders['User-Agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Connection': 'keep-alive',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'cross-site',
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache',
    };
    
    // Use retry logic for better reliability
    const response = await fetchWithRetry(url, {
      headers: fetchHeaders
    });
    
    const contentType = response.headers.get("content-type");
    
    // Handle m3u8 playlists
    if (contentType?.includes('application/vnd.apple.mpegurl') || 
        contentType?.includes('application/x-mpegurl') || 
        url.endsWith('.m3u8')) {
      const text = await response.text();
      const baseUrl = new URL(url);
      baseUrl.pathname = baseUrl.pathname.substring(0, baseUrl.pathname.lastIndexOf('/') + 1);
      
      // Use the improved m3u8 content processor
      const modifiedContent = processM3u8Content(
        text, 
        baseUrl, 
        headersParam, 
        process.env.NEXT_PUBLIC_PROXY_URI
      );
      
      return new NextResponse(modifiedContent, {
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Cache-Control": "public, max-age=5", // Short caching to improve performance
        },
      });
    }
    
    // For ts segments and other binary files
    const buffer = await response.arrayBuffer();
    const headers = new Headers();
    
    // Copy important headers from original response
    const headersToForward = [
      'Content-Type',
      'Content-Length',
      'Content-Range',
      'Accept-Ranges',
      'Content-Encoding',
      'Content-Language',
      'Cache-Control',
      'Expires',
      'Last-Modified',
      'ETag',
    ];
    
    // Set CORS and copy original headers
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    
    for (const header of headersToForward) {
      const value = response.headers.get(header);
      if (value) {
        headers.set(header, value);
      }
    }
    
    // Ensure content type is set
    if (!headers.has('Content-Type')) {
      headers.set("Content-Type", contentType || "application/octet-stream");
    }
    
    // Add cache control for binary segments to improve playback
    if (!headers.has('Cache-Control')) {
      headers.set("Cache-Control", "public, max-age=300"); // 5 minute cache for segments
    }
    
    return new Response(buffer, { 
      status: 200,
      headers: headers
    });
  } catch (error) {
    console.error("Proxy error:", error);
    
    // Detailed error response for easier debugging
    return NextResponse.json(
      { 
        error: "Failed to proxy request",
        message: error.message,
        url: url,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { 
        status: error.name === 'AbortError' ? 504 : 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        }
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
} 