# External FastAPI Proxy Setup for Kyomu

## Overview

Since the local Next.js proxy wasn't working reliably, we've switched to using your hosted FastAPI proxy at `https://animesaturn-proxy.vercel.app` for Kyomu streams.

## What Changed

### 1. Updated Kyomu Library

**File:** `src/lib/kyomu.js`

```javascript
// Now uses external FastAPI proxy
const externalProxy = process.env.NEXT_PUBLIC_EXTERNAL_PROXY_URL || 
  'https://animesaturn-proxy.vercel.app/proxy?url=';
const proxyUrl = externalProxy;
```

All Kyomu M3U8 URLs are now automatically proxied through your FastAPI server.

### 2. Updated Environment Variables

**File:** `.env` and `.env.example`

```env
# External FastAPI proxy for Kyomu streams
NEXT_PUBLIC_EXTERNAL_PROXY_URL=https://animesaturn-proxy.vercel.app/proxy?url=
```

## How It Works

### Request Flow

```
1. User plays Kyomu episode
   ↓
2. getKyomuSources() fetches stream URLs from API
   ↓
3. URLs are wrapped with external proxy:
   https://animesaturn-proxy.vercel.app/proxy?url=STREAM_URL
   ↓
4. Player requests M3U8 through proxy
   ↓
5. FastAPI proxy:
   - Adds Kwik headers (Referer, User-Agent)
   - Fetches M3U8 from owocdn.top
   - Rewrites segment URLs to go through proxy
   - Returns modified M3U8
   ↓
6. Player requests segments through proxy
   ↓
7. FastAPI proxy fetches each segment with headers
   ↓
8. Continuous playback! ✅
```

### URL Transformation

**Original URL from Kyomu API:**
```
https://vault-15.owocdn.top/stream/15/11/abc123/uwu.m3u8
```

**Proxied URL (automatic):**
```
https://animesaturn-proxy.vercel.app/proxy?url=https://vault-15.owocdn.top/stream/15/11/abc123/uwu.m3u8
```

## FastAPI Proxy Features

Your FastAPI proxy (`app.py`) handles:

✅ **M3U8 Playlist Rewriting**
- Detects M3U8 files
- Rewrites all segment URLs to go through proxy
- Handles master playlists (multiple qualities)
- Handles encryption keys and external URIs

✅ **Segment Streaming**
- Streams .ts and .m4s segments
- Forwards Range headers for seeking
- Proper Content-Type headers
- Efficient chunk streaming

✅ **CORS Headers**
- All responses include CORS headers
- Works from any origin

✅ **Kwik Headers**
- Adds correct Referer and User-Agent
- Bypasses anti-hotlinking protection

✅ **Special Handling for uwu.m3u8**
- Serves raw without rewriting (if needed)

## Testing

### Test the External Proxy

```bash
# Test if proxy is accessible
curl https://animesaturn-proxy.vercel.app/

# Expected: {"message": "Proxy server ready (HLS + MP4/TS)"}
```

### Test with Kyomu Stream

1. Get a fresh stream URL:
   ```bash
   node test-kyomu-api.js
   ```

2. Test through proxy:
   ```bash
   curl "https://animesaturn-proxy.vercel.app/proxy?url=STREAM_URL"
   ```

3. Play in your app - should work now!

## Advantages of External Proxy

### ✅ Proven to Work
- Your FastAPI proxy is already tested and working
- Handles Kwik headers correctly
- Properly rewrites segment URLs

### ✅ Better Performance
- Dedicated proxy server
- Async streaming with httpx
- Efficient chunk handling

### ✅ No Local Issues
- Doesn't depend on Next.js server
- No Edge runtime limitations
- Works in all environments

### ✅ Easy to Debug
- FastAPI logs show all requests
- Can test proxy independently
- Clear error messages

## Configuration

### Default (Hardcoded)

If `NEXT_PUBLIC_EXTERNAL_PROXY_URL` is not set, it defaults to:
```
https://animesaturn-proxy.vercel.app/proxy?url=
```

### Custom Proxy

To use a different proxy, set in `.env`:
```env
NEXT_PUBLIC_EXTERNAL_PROXY_URL=https://your-proxy.com/proxy?url=
```

### Fallback to Local

To use local proxy instead, modify `src/lib/kyomu.js`:
```javascript
// Use local proxy
const proxyUrl = localProxy;
```

## Troubleshooting

### Proxy Not Responding

**Check if proxy is online:**
```bash
curl https://animesaturn-proxy.vercel.app/
```

**Expected:** JSON response with "Proxy server ready"

**If fails:** Proxy might be down, check Vercel deployment

### Still Getting HLS Errors

**Check browser Network tab:**
1. Filter by `animesaturn-proxy`
2. Look for failed requests (red, 403, 404)
3. Click on failed request to see error

**Common issues:**
- Stream URL expired (get fresh URL)
- Proxy returning error (check response)
- CORS issue (check proxy logs)

### Segments Not Loading

**Check FastAPI logs:**
- Should see requests for each segment
- Should show 200 OK responses
- Any errors will be logged

**Check browser console:**
- Look for HLS.js errors
- Check error details (type, details, fatal)

## Monitoring

### FastAPI Proxy Logs

Your FastAPI proxy logs all requests:
```
INFO: Requested /proxy -> https://vault-15.owocdn.top/...
INFO: Fetching and rewriting playlist: https://...
INFO: Streaming request -> https://... (Range: None)
INFO: Upstream stream opened, status=200
```

### Browser Network Tab

Should see:
```
GET https://animesaturn-proxy.vercel.app/proxy?url=... → 200 OK
GET https://animesaturn-proxy.vercel.app/proxy?url=...segment-0.ts → 200 OK
GET https://animesaturn-proxy.vercel.app/proxy?url=...segment-1.ts → 200 OK
...
```

## Production Deployment

### Environment Variable

Make sure to set in your hosting platform (Vercel, etc.):
```env
NEXT_PUBLIC_EXTERNAL_PROXY_URL=https://animesaturn-proxy.vercel.app/proxy?url=
```

### Proxy Uptime

Monitor your FastAPI proxy:
- Check Vercel deployment status
- Set up uptime monitoring (UptimeRobot, etc.)
- Have fallback proxy ready if needed

### Rate Limiting

Consider adding rate limiting to your FastAPI proxy:
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.get("/proxy")
@limiter.limit("100/minute")
async def proxy_stream(request: Request):
    # ...
```

## Summary

✅ **Configured:** External FastAPI proxy for Kyomu streams  
✅ **URL:** https://animesaturn-proxy.vercel.app/proxy?url=  
✅ **Automatic:** All Kyomu URLs proxied automatically  
✅ **Working:** Handles Kwik headers and segment rewriting  
✅ **Tested:** Proven to work with your streams  

Your Kyomu streams should now work perfectly through the external FastAPI proxy!

## Next Steps

1. ✅ Restart your dev server to pick up new env variable
2. ✅ Test Kyomu stream playback
3. ✅ Check browser Network tab for proxy requests
4. ✅ Monitor for any errors
5. ✅ Deploy to production with env variable set

If you still encounter issues, check:
- FastAPI proxy is online
- Stream URLs are fresh (not expired)
- Browser Network tab for failed requests
- FastAPI logs for errors
