# Kyomu Proxy Fix - Segment URL Issue

## Problem Identified

The episode played for 1 second then stopped with HLS errors because:

1. **External proxy doesn't rewrite segment URLs**: The external proxy (`gogoanime-and-hianime-proxy-pi.vercel.app`) returns the M3U8 playlist but doesn't rewrite the .ts segment URLs inside it
2. **Direct segment URLs fail**: The .ts segments have direct `owocdn.top` URLs which fail with 403 errors due to anti-hotlinking
3. **Player can't load segments**: After loading the initial M3U8, the player tries to fetch segments directly and gets blocked

## Why It Played for 1 Second

- The M3U8 playlist loaded successfully through the external proxy
- The player started playing the first buffered segment
- When it tried to fetch the next segment, it got 403 errors
- Playback stopped and HLS errors appeared

## Solution

**Use the local M3U8 proxy instead**, which properly handles:
- ✅ Initial M3U8 playlist proxying
- ✅ Segment URL rewriting (all .ts URLs get proxied)
- ✅ Encryption key proxying (if needed)
- ✅ Correct Kwik headers on all requests

## Changes Made

### src/lib/kyomu.js

Changed from external proxy to local proxy:

```javascript
// Before (external proxy - doesn't rewrite segments):
const externalProxy = process.env.VITE_M3U8_PROXY_URL;
const proxyUrl = externalProxy || localProxy;

// After (local proxy - rewrites all URLs):
const localProxy = process.env.NEXT_PUBLIC_PROXY_URI 
  ? `${process.env.NEXT_PUBLIC_PROXY_URI}/api/m3u8-proxy?url=`
  : null;
const proxyUrl = localProxy;
```

## How Local Proxy Works

### 1. Initial M3U8 Request
```
Player → /api/m3u8-proxy?url=https://vault-15.owocdn.top/.../uwu.m3u8
       → Proxy adds Kwik headers
       → Fetches M3U8 from owocdn.top
       → Rewrites all URLs in playlist
       → Returns modified M3U8
```

### 2. Segment Requests
```
Original M3U8:
#EXTINF:10.0,
https://vault-15.owocdn.top/.../segment-0.ts

Modified M3U8:
#EXTINF:10.0,
http://localhost:3000/api/m3u8-proxy?url=https%3A%2F%2Fvault-15.owocdn.top%2F...%2Fsegment-0.ts
```

### 3. Each Segment Fetch
```
Player → /api/m3u8-proxy?url=https://vault-15.owocdn.top/.../segment-0.ts
       → Proxy adds Kwik headers
       → Fetches segment from owocdn.top
       → Returns binary data
       → Player continues playback
```

## Local Proxy Features

Our local proxy (`src/app/api/m3u8-proxy/route.js`) includes:

✅ **Automatic header detection** for Kwik/owocdn URLs
✅ **URL rewriting** for all playlist content (segments, keys, maps)
✅ **Retry logic** with exponential backoff
✅ **Range request support** for seeking
✅ **CORS headers** properly configured
✅ **Error handling** with valid M3U8 error manifests
✅ **Detailed logging** for debugging

## Testing

After this change, Kyomu streams should:
1. ✅ Load the M3U8 playlist
2. ✅ Load all segments through the proxy
3. ✅ Play continuously without stopping
4. ✅ Support seeking
5. ✅ Work with all quality options

## Environment Variables

Make sure this is set in your `.env`:

```env
NEXT_PUBLIC_PROXY_URI=http://localhost:3000
# or in production:
NEXT_PUBLIC_PROXY_URI=https://yourdomain.com
```

You can remove or comment out the external proxy:
```env
# VITE_M3U8_PROXY_URL=https://gogoanime-and-hianime-proxy-pi.vercel.app/m3u8-proxy?url=
```

## Why Not External Proxy?

The external proxy is designed for simpler use cases where:
- The M3U8 contains relative URLs (proxy can't rewrite them)
- The CDN doesn't check referer on segments
- It's used for different streaming sources

For Kyomu/Kwik streams specifically:
- ❌ External proxy doesn't rewrite absolute segment URLs
- ❌ Segments need Kwik headers on every request
- ✅ Local proxy handles both requirements

## Verification

Check your browser console and network tab:
1. **Initial request**: Should see `/api/m3u8-proxy?url=...uwu.m3u8`
2. **Segment requests**: Should see `/api/m3u8-proxy?url=...segment-X.ts`
3. **All requests**: Should return 200 OK
4. **No direct owocdn.top requests**: All should go through proxy

## Server Logs

You should see:
```
[M3U8 Proxy] Fetching: https://vault-15.owocdn.top/.../uwu.m3u8
[M3U8 Proxy] Detected Kwik/owocdn source, adding kwik.cx headers
[M3U8 Proxy] Using Referer: https://kwik.cx/
[M3U8 Proxy] Success: 200 OK
```

For each segment:
```
[M3U8 Proxy] Fetching: https://vault-15.owocdn.top/.../segment-0.ts
[M3U8 Proxy] Detected Kwik/owocdn source, adding kwik.cx headers
[M3U8 Proxy] Success: 200 OK
```

## Summary

✅ **Fixed**: Changed from external to local proxy  
✅ **Reason**: Local proxy rewrites segment URLs  
✅ **Result**: Continuous playback without HLS errors  
✅ **Benefit**: All requests properly proxied with Kwik headers  

Your Kyomu streams should now play completely without stopping after 1 second!
