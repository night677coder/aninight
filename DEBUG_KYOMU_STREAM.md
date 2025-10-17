# Debugging Kyomu Stream Issues

## Current Problem

Getting repeated HLS errors: `ERROR MediaPlayer [vidstack] HLS error 'hlsError'`

## Possible Causes

### 1. Stream URL Expired
Kyomu/Kwik streams expire frequently (usually within minutes/hours).

**Check:**
- Get a fresh stream URL from the Kyomu API
- The URL you're testing might be from an old session

**Solution:**
```bash
# Get fresh stream URL
node test-kyomu-api.js
```

### 2. Segments Are Images (.jpg)
Your logs show only `.jpg` files being rewritten, which are thumbnail images, not video segments.

**Check:**
- Look at the M3U8 response in browser Network tab
- Real video segments should be `.ts` or `.m4s` files

**Possible issue:**
- The M3U8 might be a thumbnail/preview track
- The actual video track might be in a different quality variant

### 3. Segments Failing to Load (403/404)
Even though M3U8 loads, individual segments might fail.

**Check in Browser Network Tab:**
1. Filter by `m3u8-proxy`
2. Look for failed requests (red, 403, 404, 500)
3. Click on a failed request
4. Check the response/error

### 4. CORS or Network Issues
The proxy might not be forwarding requests correctly.

**Check:**
- Browser console for CORS errors
- Network tab for failed requests
- Server logs for error messages

## Debugging Steps

### Step 1: Check Server Logs

Look for these patterns:

**Good:**
```
[M3U8 Proxy] Fetching: https://vault-15.owocdn.top/...
[M3U8 Proxy] Detected Kwik/owocdn source
[M3U8 Proxy] Success: 200 OK
[M3U8 Proxy] Content-Type: application/vnd.apple.mpegurl
```

**Bad:**
```
[M3U8 Proxy] Error: { message: 'fetch failed', ... }
Retry 1/3 for https://... : Connection refused
```

### Step 2: Check Browser Network Tab

1. Open DevTools → Network
2. Play the video
3. Filter by `m3u8` or `m3u8-proxy`
4. Look for:
   - Initial M3U8 request (should be 200 OK)
   - Segment requests (should be 200 OK)
   - Any red/failed requests

### Step 3: Inspect M3U8 Content

1. Find the M3U8 request in Network tab
2. Click on it → Response tab
3. Check what it contains:

**Good (video segments):**
```m3u8
#EXTM3U
#EXT-X-VERSION:3
#EXTINF:10.0,
segment-0.ts
#EXTINF:10.0,
segment-1.ts
```

**Bad (only images):**
```m3u8
#EXTM3U
#EXTINF:10.0,
segment-0.jpg
#EXTINF:10.0,
segment-1.jpg
```

### Step 4: Test Direct URL

Test if the upstream URL works at all:

```bash
# Test with curl (replace with your actual URL)
curl -H "Referer: https://kwik.cx/" \
     -H "Origin: https://kwik.cx" \
     -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
     "https://vault-15.owocdn.top/stream/.../uwu.m3u8"
```

**Expected:** M3U8 text content  
**If fails:** Stream URL is expired/invalid

### Step 5: Check Segment Requests

After M3U8 loads, check if segments are being requested:

1. Network tab should show requests like:
   ```
   /api/m3u8-proxy?url=https%3A%2F%2Fvault-15.owocdn.top%2F...%2Fsegment-0.ts
   ```

2. Click on a segment request
3. Check status code and response

**If 403:** Headers not being applied correctly  
**If 404:** Segment doesn't exist  
**If 500:** Proxy error (check server logs)

## Common Solutions

### Solution 1: Get Fresh Stream URL

```javascript
// In your app, always fetch fresh URLs before playing
const sources = await getKyomuSources(episodeId);
// Don't cache these URLs - they expire quickly!
```

### Solution 2: Check Quality Variant

The M3U8 might be a master playlist with multiple quality options:

```m3u8
#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=2000000,RESOLUTION=1920x1080
1080p/playlist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1000000,RESOLUTION=1280x720
720p/playlist.m3u8
```

The player should automatically select a variant and request it.

### Solution 3: Disable HLS.js Debug Mode

If you have HLS.js debug mode enabled, it might be logging non-critical errors:

```javascript
const hls = new Hls({
  debug: false, // Set to false in production
  enableWorker: true,
});
```

### Solution 4: Check for Infinite Loops

Make sure the proxy isn't proxying already-proxied URLs:

**Check server logs for:**
```
[M3U8 Proxy] Fetching: http://localhost:3000/api/m3u8-proxy?url=...
```

This means the proxy is calling itself (infinite loop).

## Quick Diagnostic Commands

### Test Kyomu API
```bash
node test-kyomu-api.js
```

### Test Proxy
```bash
node test-m3u8-proxy.js
```

### Test Universal Proxy
```bash
node test-universal-proxy.js
```

## What to Share for Help

If still not working, share:

1. **Server logs** (last 50 lines when playing video)
2. **Browser Network tab screenshot** (filtered by m3u8)
3. **M3U8 response content** (from Network tab)
4. **Any error messages** from browser console
5. **Stream URL** (if not expired)

## Expected Behavior

When working correctly:

1. ✅ M3U8 request returns 200 OK
2. ✅ M3U8 contains `.ts` or `.m4s` segments (not just `.jpg`)
3. ✅ All segment URLs are proxied
4. ✅ Segment requests return 200 OK
5. ✅ Video plays continuously
6. ✅ Seeking works
7. ✅ No HLS errors in console

## Next Steps

1. Get a fresh stream URL from Kyomu API
2. Check browser Network tab for failed requests
3. Inspect M3U8 content to see what segments it contains
4. Check server logs for errors
5. Test with curl to verify upstream works

If the M3U8 only contains `.jpg` files, that's a thumbnail track - you need to find the actual video track (usually in a different quality variant or different source).
