# Universal M3U8 Proxy

## Overview

A comprehensive M3U8 proxy that automatically detects and handles streaming sources from multiple CDNs and providers. It intelligently applies the correct headers, bypasses anti-hotlinking protection, and ensures smooth playback across all anime streaming sources.

## Supported Sources

### ✅ Fully Supported

| Source | CDN/Domain | Auto-Detection | Headers Applied |
|--------|------------|----------------|-----------------|
| **Kyomu/AnimePahe** | owocdn.top, kwik.cx | ✅ | Referer: kwik.cx, Origin: kwik.cx |
| **AnimePahe Direct** | animepahe.si | ✅ | Referer: animepahe.si |
| **GogoAnime** | gogocdn, gogo-stream, gogohd | ✅ | Referer: gogoanimehd.io |
| **Vidstreaming** | vidstreaming, vidcdn | ✅ | Referer: gogoanimehd.io |
| **HiAnime/AniWatch** | hianime, aniwatch, megacloud | ✅ | Referer: hianime.to |
| **Streamtape** | streamtape.com | ✅ | Referer: streamtape.com |
| **Mp4upload** | mp4upload.com | ✅ | Referer: mp4upload.com |
| **Doodstream** | dood.to, dood.* | ✅ | Referer: dood.to |
| **Filemoon** | filemoon.sx | ✅ | Referer: filemoon.sx |
| **Generic CDN** | cloudflare, amazonaws, cdn.* | ✅ | Standard headers |
| **Unknown** | Any other domain | ✅ | Generic browser headers |

## Features

### 🎯 Intelligent Source Detection
- Automatically identifies streaming source from URL
- Applies appropriate headers for each CDN
- No manual configuration needed

### 🔄 Complete URL Rewriting
- Master playlists (multiple quality options)
- Segment playlists (.ts files)
- Encryption keys (#EXT-X-KEY)
- Initialization segments (#EXT-X-MAP)
- Relative and absolute URLs

### 🛡️ Anti-Hotlinking Bypass
- Correct Referer headers for each source
- Origin headers for CORS validation
- User-Agent spoofing
- Cookie forwarding (if needed)

### ⚡ Performance Optimizations
- Retry logic with exponential backoff (3 attempts)
- 10-second timeout per request
- Caching headers (5s for playlists, 5min for segments)
- Range request support for seeking

### 🔍 Debugging & Monitoring
- Detailed console logging
- Source type identification
- Request/response tracking
- Error manifests for failed streams

## How It Works

### 1. Request Flow

```
Player → /api/m3u8-proxy?url=STREAM_URL
       ↓
   Detect Source Type (kwik, gogoanime, hianime, etc.)
       ↓
   Apply Appropriate Headers
       ↓
   Fetch from Upstream CDN
       ↓
   Rewrite All URLs in Playlist
       ↓
   Return Modified Content
       ↓
   Player Requests Segments → Loop back to proxy
```

### 2. URL Rewriting Example

**Original M3U8:**
```m3u8
#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=2000000,RESOLUTION=1920x1080
https://vault-15.owocdn.top/stream/1080p/playlist.m3u8
```

**Proxied M3U8:**
```m3u8
#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=2000000,RESOLUTION=1920x1080
http://localhost:3000/api/m3u8-proxy?url=https%3A%2F%2Fvault-15.owocdn.top%2Fstream%2F1080p%2Fplaylist.m3u8
```

### 3. Segment Handling

**Original Segment Playlist:**
```m3u8
#EXTINF:10.0,
segment-0.ts
#EXTINF:10.0,
segment-1.ts
```

**Proxied Segment Playlist:**
```m3u8
#EXTINF:10.0,
http://localhost:3000/api/m3u8-proxy?url=https%3A%2F%2Fvault-15.owocdn.top%2Fstream%2Fsegment-0.ts
#EXTINF:10.0,
http://localhost:3000/api/m3u8-proxy?url=https%3A%2F%2Fvault-15.owocdn.top%2Fstream%2Fsegment-1.ts
```

## Usage

### Basic Usage

```javascript
// Automatic proxying (recommended)
const proxyUrl = `${process.env.NEXT_PUBLIC_PROXY_URI}/api/m3u8-proxy?url=${encodeURIComponent(streamUrl)}`;
```

### With Episode ID (for Kwik)

```javascript
// More specific referer for Kwik streams
const proxyUrl = `${process.env.NEXT_PUBLIC_PROXY_URI}/api/m3u8-proxy?url=${encodeURIComponent(streamUrl)}&episodeId=${episodeId}`;
```

### With Custom Headers

```javascript
// Override default headers
const customHeaders = {
  Referer: 'https://custom-site.com/',
  Origin: 'https://custom-site.com'
};
const proxyUrl = `${process.env.NEXT_PUBLIC_PROXY_URI}/api/m3u8-proxy?url=${encodeURIComponent(streamUrl)}&headers=${encodeURIComponent(JSON.stringify(customHeaders))}`;
```

## Configuration

### Environment Variables

```env
# Required: Your application's public URL
NEXT_PUBLIC_PROXY_URI=http://localhost:3000
# or in production:
NEXT_PUBLIC_PROXY_URI=https://yourdomain.com
```

### No Additional Setup Needed!

The proxy automatically:
- Detects source type from URL
- Applies correct headers
- Handles all URL rewriting
- Manages CORS headers

## Source-Specific Details

### Kwik/owocdn (AnimePahe/Kyomu)

**Detection:** `owocdn.top`, `kwik.cx`

**Headers:**
```javascript
Referer: https://kwik.cx/
Origin: https://kwik.cx
User-Agent: Chrome 120.0.0.0
```

**Notes:**
- Requires exact referer to bypass anti-hotlinking
- Episode ID can be passed for more specific referer
- All segments must go through proxy

### GogoAnime CDN

**Detection:** `gogocdn`, `gogo-stream`, `gogohd`

**Headers:**
```javascript
Referer: https://gogoanimehd.io/
Origin: https://gogoanimehd.io
```

**Notes:**
- Works with multiple GogoAnime mirrors
- Handles both HLS and MP4 sources

### HiAnime/MegaCloud

**Detection:** `hianime`, `aniwatch`, `megacloud`

**Headers:**
```javascript
Referer: https://hianime.to/
Origin: https://hianime.to
```

**Notes:**
- Supports encrypted streams
- Handles multiple quality variants

### Generic CDN

**Detection:** `cloudflare`, `amazonaws`, `cdn.*`

**Headers:**
```javascript
User-Agent: Chrome 120.0.0.0
Accept: */*
```

**Notes:**
- Most CDNs don't require specific referer
- Standard browser headers usually sufficient

## Debugging

### Enable Detailed Logging

The proxy automatically logs:
```
[M3U8 Proxy] Fetching: https://vault-15.owocdn.top/...
[M3U8 Proxy] Detected Kwik/owocdn source
[M3U8 Proxy] Source type: kwik
[M3U8 Proxy] Request headers: { Referer: 'https://kwik.cx/', ... }
[M3U8 Proxy] Success: 200 OK
[M3U8 Proxy] Rewrote EXTINF URI: segment-0.ts -> https://...
```

### Check Browser Network Tab

1. Open DevTools → Network
2. Filter by `.m3u8` or `m3u8-proxy`
3. Check status codes (should be 200)
4. Inspect response content (should be valid M3U8)
5. Verify all URLs go through proxy

### Common Issues

**Issue: 403 Forbidden**
- Cause: Wrong referer for source
- Fix: Check source detection logs, may need to add new pattern

**Issue: Playback stops after 1 second**
- Cause: Segments not being proxied
- Fix: Check that segment URLs are rewritten in M3U8

**Issue: CORS errors**
- Cause: Missing CORS headers
- Fix: Already handled by proxy, check browser console

**Issue: Slow loading**
- Cause: Upstream CDN slow or retry logic kicking in
- Fix: Check retry logs, may need to increase timeout

## Testing

### Test Script

```bash
# Test with a known working URL
curl "http://localhost:3000/api/m3u8-proxy?url=https://vault-15.owocdn.top/stream/.../uwu.m3u8"
```

### Expected Response

```m3u8
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=...
http://localhost:3000/api/m3u8-proxy?url=https%3A%2F%2F...
```

## Adding New Sources

To add support for a new streaming source:

1. **Identify the CDN domain pattern**
   ```javascript
   else if (urlLower.includes('newcdn.com')) {
   ```

2. **Set source type**
   ```javascript
   sourceType = 'newcdn';
   console.log('[M3U8 Proxy] Detected NewCDN source');
   ```

3. **Apply appropriate headers**
   ```javascript
   customHeaders.Referer = customHeaders.Referer || 'https://newcdn.com/';
   customHeaders.Origin = customHeaders.Origin || 'https://newcdn.com';
   ```

4. **Test with actual stream URL**

## Performance

### Caching Strategy

- **M3U8 Playlists:** 5 seconds cache
  - Short cache for dynamic playlists
  - Allows quality switching
  
- **TS Segments:** 5 minutes cache
  - Longer cache for static content
  - Reduces upstream requests
  - Improves playback performance

### Retry Logic

- **Max Retries:** 3 attempts
- **Backoff:** Exponential (1s, 2s, 4s)
- **Timeout:** 10 seconds per attempt
- **Total Max Time:** ~17 seconds

## Security

### Headers Sanitization

- User-provided headers are parsed safely
- Invalid JSON is caught and ignored
- Default headers always applied

### URL Validation

- URL parameter is required
- Malformed URLs are caught
- Error responses include CORS headers

### Rate Limiting

Consider adding rate limiting in production:
```javascript
// Example with next-rate-limit
import rateLimit from 'next-rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});
```

## Production Deployment

### Checklist

- ✅ Set `NEXT_PUBLIC_PROXY_URI` to production domain
- ✅ Enable caching at CDN level (Vercel, Cloudflare)
- ✅ Monitor error rates and retry patterns
- ✅ Consider rate limiting for abuse prevention
- ✅ Set up logging/monitoring (Sentry, LogRocket)

### Vercel Configuration

```json
{
  "headers": [
    {
      "source": "/api/m3u8-proxy",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=300"
        }
      ]
    }
  ]
}
```

## Summary

✅ **Universal:** Works with 10+ streaming sources  
✅ **Automatic:** Detects source and applies correct headers  
✅ **Complete:** Rewrites all URLs (playlists, segments, keys)  
✅ **Reliable:** Retry logic and error handling  
✅ **Fast:** Caching and performance optimizations  
✅ **Debuggable:** Detailed logging and error messages  
✅ **Extensible:** Easy to add new sources  

Your anime streaming app now has a production-ready, universal M3U8 proxy that handles all major sources automatically!
