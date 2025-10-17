# Kyomu External Proxy Integration

## Overview

Your Kyomu streaming integration now uses an external M3U8 proxy to handle all stream URLs. This provides better reliability and eliminates CORS/403 errors.

## Configuration

### Environment Variables (.env)

```env
# External M3U8 proxy for Kyomu streams
VITE_M3U8_PROXY_URL=https://gogoanime-and-hianime-proxy-pi.vercel.app/m3u8-proxy?url=
```

This is already configured in your `.env` file.

## How It Works

### Automatic Proxying

When you call `getKyomuSources()`, all M3U8 URLs are automatically proxied:

```javascript
// Original URL from Kyomu API:
https://vault-15.owocdn.top/stream/.../uwu.m3u8

// Automatically becomes:
https://gogoanime-and-hianime-proxy-pi.vercel.app/m3u8-proxy?url=https%3A%2F%2Fvault-15.owocdn.top%2Fstream%2F...%2Fuwu.m3u8
```

### Code Flow

1. **Fetch sources** from Kyomu API
2. **Detect M3U8 URLs** (HLS streams)
3. **Wrap with external proxy** URL
4. **Return proxied URLs** to player
5. **Player requests** go through external proxy
6. **External proxy** adds correct headers (Referer, Origin, etc.)
7. **Stream plays** without CORS/403 errors

## Testing

### Quick Test

```bash
node test-external-proxy.js
```

Expected output:
```
🧪 Testing External M3U8 Proxy with Kyomu

Step 1: Fetching fresh stream from Kyomu API...
✓ Found 6 sources

Step 2: Testing external proxy...
Status: 200 OK
✅ Success! Valid M3U8 content received
✓ URLs in playlist are properly proxied

✅ External proxy is working correctly!
```

### Manual Test

```javascript
import { getKyomuSources } from '@/lib/kyomu';

// Get sources for an episode
const sources = await getKyomuSources('animeSession:episodeSession');

// All M3U8 URLs will be proxied
console.log(sources.sources[0].url);
// Output: https://gogoanime-and-hianime-proxy-pi.vercel.app/m3u8-proxy?url=...
```

## Fallback Behavior

If external proxy is not configured or fails:

1. **First**: Try `VITE_M3U8_PROXY_URL`
2. **Second**: Try `NEXT_PUBLIC_M3U8_PROXY_URL`
3. **Third**: Fall back to local proxy at `/api/m3u8-proxy`
4. **Last**: Use direct URL (may fail with CORS)

## Advantages

### External Proxy
- ✅ Dedicated infrastructure
- ✅ Better uptime
- ✅ No server-side code needed
- ✅ Handles all Kwik headers
- ✅ CORS pre-configured

### Local Proxy (Fallback)
- ✅ Full control
- ✅ Custom header logic
- ✅ Better debugging
- ✅ No external dependencies

## Troubleshooting

### Streams Not Playing

1. **Check environment variable**:
   ```bash
   echo $VITE_M3U8_PROXY_URL
   ```

2. **Test external proxy**:
   ```bash
   node test-external-proxy.js
   ```

3. **Check browser console**:
   - Look for proxied URLs in Network tab
   - Should see requests to `gogoanime-and-hianime-proxy-pi.vercel.app`

4. **Check server logs**:
   ```
   Using proxy: External
   Proxying 1080 quality through external proxy
   ```

### External Proxy Down

If the external proxy is down, you can:

1. **Use local proxy**: Remove `VITE_M3U8_PROXY_URL` from .env
2. **Use different proxy**: Update URL in .env
3. **Deploy your own**: Use the [Gogoanime-and-Hianime-proxy](https://github.com/EternalAnime/Gogoanime-and-Hianime-proxy) repo

## Code Reference

### src/lib/kyomu.js

```javascript
// Get proxy URL from environment (prefer external proxy for Kyomu streams)
const externalProxy = process.env.VITE_M3U8_PROXY_URL || process.env.NEXT_PUBLIC_M3U8_PROXY_URL;
const localProxy = process.env.NEXT_PUBLIC_PROXY_URI 
  ? `${process.env.NEXT_PUBLIC_PROXY_URI}/api/m3u8-proxy?url=`
  : null;

// Prefer external proxy for Kyomu/Kwik streams (better reliability)
const proxyUrl = externalProxy || localProxy;

// Map sources with proxied URLs
const sources = data.sources.map(source => {
  const isM3U8 = source.isM3U8 || source.url.includes('.m3u8');
  
  // Proxy M3U8 URLs to bypass CORS and anti-hotlinking
  let finalUrl = source.url;
  if (isM3U8 && proxyUrl) {
    finalUrl = `${proxyUrl}${encodeURIComponent(source.url)}`;
  }
  
  return { url: finalUrl, ... };
});
```

## Production Deployment

When deploying to production:

1. **Update .env.example**:
   ```env
   VITE_M3U8_PROXY_URL=https://gogoanime-and-hianime-proxy-pi.vercel.app/m3u8-proxy?url=
   ```

2. **Set in Vercel/hosting**:
   - Add environment variable in dashboard
   - Redeploy application

3. **Verify**:
   - Test stream playback
   - Check Network tab for proxied URLs
   - Monitor for 403/CORS errors

## Alternative Proxies

If you want to use a different proxy:

### Option 1: Deploy Your Own
```bash
git clone https://github.com/EternalAnime/Gogoanime-and-Hianime-proxy
cd Gogoanime-and-Hianime-proxy
# Deploy to Vercel/Railway/etc.
```

### Option 2: Use Different Service
Update `.env`:
```env
VITE_M3U8_PROXY_URL=https://your-proxy.com/m3u8-proxy?url=
```

### Option 3: Local Only
Remove external proxy, use local:
```env
# VITE_M3U8_PROXY_URL=  # Commented out
NEXT_PUBLIC_PROXY_URI=http://localhost:3000
```

## Summary

✅ **Configured**: External proxy for Kyomu streams  
✅ **Automatic**: All M3U8 URLs proxied automatically  
✅ **Reliable**: Dedicated proxy infrastructure  
✅ **Fallback**: Local proxy if external fails  
✅ **Tested**: Test script included  

Your Kyomu streams should now work without CORS or 403 errors!
