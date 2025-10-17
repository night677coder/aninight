# M3U8 Proxy Debugging Guide

## Recent Updates

### Fixed Headers for Kyomu/Kwik Streams
- **Referer**: Changed to `https://kwik.cx/` (was `animepahe.com`)
- **Origin**: Changed to `https://kwik.cx` (was `animepahe.com`)
- **User-Agent**: Updated to Chrome 120.0.0.0
- **Support for episodeId**: Can pass `?episodeId=xxx` for more specific referer

### Improved Error Handling
- M3U8 errors now return valid HLS manifest with error message (prevents HLS.js parse errors)
- Better logging for debugging connection issues
- Added Range header support for seeking

## Testing Steps

### 1. Check if Stream URL is Valid
```bash
curl -H "Referer: https://kwik.cx/" \
     -H "Origin: https://kwik.cx" \
     -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
     "https://vault-15.owocdn.top/stream/.../uwu.m3u8"
```

**Expected Results:**
- ✅ 200 OK + M3U8 text starting with `#EXTM3U` = Stream is valid
- ❌ 403 Forbidden = Headers issue (check referer)
- ❌ Connection refused/timeout = Stream expired or CDN down

### 2. Test Your Proxy Locally
```bash
# Get a fresh URL from Kyomu API first
node test-m3u8-proxy.js

# Then test the proxy endpoint
curl "http://localhost:3000/api/m3u8-proxy?url=ENCODED_M3U8_URL"
```

### 3. Browser Network Tab Debugging
1. Open DevTools → Network tab
2. Filter by `.m3u8` and `.ts`
3. Look for requests to `/api/m3u8-proxy`
4. Check:
   - Status codes (200 = good, 403 = headers issue, 500 = upstream error)
   - Response content (should be valid M3U8 text, not JSON)
   - Response headers (check `X-Proxy-Error` for error details)

### 4. Check Server Logs
Look for these log messages:
```
[M3U8 Proxy] Detected Kwik/owocdn source, adding kwik.cx headers
[M3U8 Proxy] Using Referer: https://kwik.cx/
[M3U8 Proxy] Request headers: { Referer: '...', Origin: '...', ... }
[M3U8 Proxy] Success: 200 OK
```

Or error messages:
```
Retry 1/3 for https://... : <error message>
[M3U8 Proxy] Error: { message: '...', name: '...', ... }
```

## Common Issues

### Issue: HLS.js throws `hlsError` repeatedly
**Cause**: Proxy returning JSON error instead of valid M3U8
**Fix**: ✅ Already fixed - now returns error manifest for M3U8 requests

### Issue: 403 Forbidden on all requests
**Cause**: Wrong referer header
**Fix**: ✅ Already fixed - now uses `kwik.cx` for owocdn.top URLs

### Issue: Connection refused / ECONNREFUSED
**Cause**: Stream URL expired or CDN down
**Fix**: Get fresh URL from Kyomu API (streams rotate frequently)

### Issue: Works for M3U8 but fails on .ts segments
**Cause**: Headers not applied to segment requests
**Fix**: ✅ Already handled - proxy applies same headers to all requests

### Issue: Seeking doesn't work
**Cause**: Range requests not supported
**Fix**: ✅ Already fixed - added Range header support

## Environment Variables

Make sure these are set:
```env
NEXT_PUBLIC_PROXY_URI=https://yourdomain.com
# or for local testing:
NEXT_PUBLIC_PROXY_URI=http://localhost:3000
```

## Proxy URL Format

### Basic usage:
```
/api/m3u8-proxy?url=ENCODED_M3U8_URL
```

### With episode ID (for more specific referer):
```
/api/m3u8-proxy?url=ENCODED_M3U8_URL&episodeId=abc123
```

### With custom headers (advanced):
```
/api/m3u8-proxy?url=ENCODED_M3U8_URL&headers=ENCODED_JSON
```

## Getting Fresh Stream URLs

Kyomu streams expire/rotate frequently. Always fetch fresh URLs:

```javascript
// 1. Search anime
const searchResult = await fetch(
  `https://animepahe-api-iota.vercel.app/api/search?q=${encodeURIComponent(title)}`
);

// 2. Get episodes
const episodes = await fetch(
  `https://animepahe-api-iota.vercel.app/api/${animeSession}/releases?sort=episode_desc&page=1`
);

// 3. Get stream sources
const sources = await fetch(
  `https://animepahe-api-iota.vercel.app/api/play/${animeSession}?episodeId=${episodeSession}`
);
```

## HLS.js Debug Mode

Enable detailed HLS.js logs in your player:

```javascript
import Hls from 'hls.js';

if (Hls.isSupported()) {
  const hls = new Hls({
    debug: true, // Enable debug logs
    enableWorker: true,
    lowLatencyMode: false,
  });
  
  hls.on(Hls.Events.ERROR, (event, data) => {
    console.error('HLS Error:', {
      type: data.type,
      details: data.details,
      fatal: data.fatal,
      response: data.response,
      url: data.url
    });
  });
}
```

## Quick Test Command

Run the test script to verify everything works:
```bash
node test-m3u8-proxy.js
```

This will:
1. Fetch a fresh stream from Kyomu API
2. Test direct access (should fail with 403)
3. Test with correct headers (should succeed)
4. Show you the proxy URL format
