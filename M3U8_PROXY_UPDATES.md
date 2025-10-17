# M3U8 Proxy Updates Summary

## What Was Fixed

### 1. External Proxy Integration ✅
**Problem**: Local M3U8 proxy not working reliably with Kyomu/Kwik streams.

**Solution**: 
- Integrated external proxy: `https://gogoanime-and-hianime-proxy-pi.vercel.app/m3u8-proxy?url=`
- Kyomu sources now automatically use external proxy for M3U8 URLs
- Falls back to local proxy if external proxy is not configured
- Configured via `VITE_M3U8_PROXY_URL` environment variable

### 2. Correct Headers for Kwik/owocdn Streams ✅
**Problem**: Proxy was using `animepahe.com` as Referer, causing 403 errors on Kwik CDN streams.

**Solution**: 
- Changed Referer to `https://kwik.cx/` for owocdn.top URLs
- Changed Origin to `https://kwik.cx`
- Updated User-Agent to Chrome 120.0.0.0
- Added support for episode-specific referer via `?episodeId=xxx` parameter

### 2. Better Error Handling for HLS Players ✅
**Problem**: When proxy failed, it returned JSON error which HLS.js tried to parse as M3U8, causing repeated `hlsError` events.

**Solution**:
- M3U8 requests now return a valid (but empty) HLS manifest on error
- Error details included as comments in the manifest
- Added `X-Proxy-Error` header for debugging
- Non-M3U8 requests still get JSON error response

### 3. Enhanced Debugging ✅
**Problem**: Hard to diagnose why streams fail.

**Solution**:
- Added detailed console logging for all requests
- Log headers being sent (Referer, Origin, User-Agent, Range)
- Log success/failure status
- Better error categorization (AbortError = 504, others = 500)

### 4. Range Request Support ✅
**Problem**: Seeking in video might not work properly.

**Solution**:
- Proxy now passes through Range headers from client
- Forwards Accept-Ranges and Content-Range from upstream
- Enables proper seeking/partial content delivery

## Code Changes

### src/app/api/m3u8-proxy/route.js

**New query parameters:**
- `episodeId` - Optional, for more specific Kwik referer

**Header detection logic:**
```javascript
if (url.includes('owocdn.top') || url.includes('kwik.cx')) {
  // Use kwik.cx headers (was animepahe.com)
  customHeaders.Referer = 'https://kwik.cx/';
  customHeaders.Origin = 'https://kwik.cx';
}
```

**Error manifest for M3U8 failures:**
```javascript
if (isM3U8) {
  return new NextResponse(errorManifest, {
    status: 500,
    headers: { "Content-Type": "application/vnd.apple.mpegurl", ... }
  });
}
```

**Range request support:**
```javascript
const rangeHeader = request.headers.get('range');
if (rangeHeader) {
  fetchHeaders['Range'] = rangeHeader;
}
```

## Testing

### Quick Test
```bash
node test-m3u8-proxy.js
```

### Manual Test with curl
```bash
# Test upstream directly
curl -H "Referer: https://kwik.cx/" \
     -H "Origin: https://kwik.cx" \
     -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
     "https://vault-XX.owocdn.top/.../uwu.m3u8"

# Test through proxy
curl "http://localhost:3000/api/m3u8-proxy?url=ENCODED_URL"
```

### Browser Test
1. Play a Kyomu stream in your app
2. Open DevTools → Network tab
3. Filter by `.m3u8`
4. Check status codes and response content
5. Look for `[M3U8 Proxy]` logs in server console

## Expected Behavior

### Success Case
```
[M3U8 Proxy] Fetching: https://vault-15.owocdn.top/...
[M3U8 Proxy] Detected Kwik/owocdn source, adding kwik.cx headers
[M3U8 Proxy] Using Referer: https://kwik.cx/
[M3U8 Proxy] Request headers: { Referer: 'https://kwik.cx/', ... }
[M3U8 Proxy] Success: 200 OK
```

### Failure Case (Expired Stream)
```
[M3U8 Proxy] Fetching: https://vault-15.owocdn.top/...
[M3U8 Proxy] Detected Kwik/owocdn source, adding kwik.cx headers
Retry 1/3 for https://... : fetch failed
Retry 2/3 for https://... : fetch failed
Retry 3/3 for https://... : fetch failed
[M3U8 Proxy] Error: { message: 'fetch failed', name: 'TypeError', ... }
```
→ Returns error manifest instead of crashing player

## Important Notes

1. **Stream Expiration**: Kwik/owocdn streams rotate frequently. Always fetch fresh URLs from the Kyomu API before playing.

2. **NEXT_PUBLIC_PROXY_URI**: Make sure this environment variable is set to your public domain (or localhost for testing).

3. **CORS**: All responses include proper CORS headers, so client-side players can access them.

4. **Caching**: 
   - M3U8 playlists: 5 seconds cache
   - TS segments: 5 minutes cache
   - Helps reduce load on upstream CDN

5. **Retry Logic**: Automatically retries failed requests 3 times with exponential backoff.

## Next Steps

If streams still fail:

1. **Verify fresh URLs**: Run `node test-kyomu-api.js` to get current stream URLs
2. **Check CDN status**: Test upstream directly with curl
3. **Enable HLS debug**: Set `debug: true` in your HLS.js config
4. **Check logs**: Look for detailed error messages in server console
5. **Try different quality**: Some resolutions might work when others don't

## Files Created/Updated

- ✅ `src/app/api/m3u8-proxy/route.js` - Main proxy with all fixes
- ✅ `test-m3u8-proxy.js` - Test script for verification
- ✅ `M3U8_PROXY_DEBUG.md` - Comprehensive debugging guide
- ✅ `M3U8_PROXY_UPDATES.md` - This summary document


## External Proxy Configuration

### Environment Variables

For Kyomu streams, configure the external proxy:

```env
# External M3U8 proxy (recommended for Kyomu streams)
VITE_M3U8_PROXY_URL=https://gogoanime-and-hianime-proxy-pi.vercel.app/m3u8-proxy?url=

# Alternative variable name (also supported)
NEXT_PUBLIC_M3U8_PROXY_URL=https://gogoanime-and-hianime-proxy-pi.vercel.app/m3u8-proxy?url=

# Local proxy URI (fallback if external proxy not set)
NEXT_PUBLIC_PROXY_URI=http://localhost:3000
```

### How It Works

1. **Kyomu sources** automatically use the external proxy if `VITE_M3U8_PROXY_URL` is set
2. If external proxy is not configured, falls back to local proxy at `/api/m3u8-proxy`
3. The external proxy handles all the Kwik headers and CORS issues
4. URLs are automatically proxied when returned from `getKyomuSources()`

### Testing External Proxy

Run the test script:
```bash
node test-external-proxy.js
```

This will:
1. Fetch a fresh stream from Kyomu API
2. Test the external proxy with the stream URL
3. Verify M3U8 content is valid
4. Test multiple quality options

### Benefits of External Proxy

- ✅ Better reliability (dedicated proxy server)
- ✅ No need to maintain local proxy infrastructure
- ✅ Handles Kwik headers automatically
- ✅ CORS issues resolved
- ✅ Works with all Kyomu/AnimePahe streams
