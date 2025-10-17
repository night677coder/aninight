# Player and Provider Updates

## Summary of Changes

### 1. Video Player Changes
- ✅ **Removed Vidstack Player** - Completely removed from the codebase
- ✅ **ArtPlayer Only** - Now using ArtPlayer as the sole video player
- ✅ **Removed Player Toggle** - No more player switching functionality
- ✅ **Simplified UI** - Cleaner player interface without toggle button

### 2. ArtPlayer Chromecast Updates
- ✅ **AnimePahe Support** - Chromecast now works with AnimePahe episodes
- ✅ **External Proxy Detection** - Automatically detects AnimePahe external proxy URLs
- ✅ **Direct Casting** - AnimePahe URLs are cast directly without re-proxying
- ✅ **Improved Logging** - Better debug information for troubleshooting

### 3. Provider Priority Changes
- ✅ **AnimePahe as Default** - AnimePahe is now fetched and displayed first
- ✅ **Server Order** - AnimePahe appears as "Server 1", HiAnime as "Server 2"

### 4. HiAnime Fallback Strategy
- ✅ **Consumet API First** - Tries Consumet API endpoint twice before mapping
- ✅ **Automatic Retry** - Retries failed Consumet requests with backoff
- ✅ **Mapping Fallback** - Falls back to HiAnime mapping if Consumet fails
- ✅ **Better Logging** - Clear indication of which method is being used

## Technical Details

### ArtPlayer Chromecast Logic

```javascript
// Detects AnimePahe external proxy
const isAnimePaheProxy = src.includes('m8u3.thevoidborn001.workers.dev');

// Uses appropriate URL for Chromecast
const chromecastSrc = isAnimePaheProxy 
  ? actualM3u8Url  // Use AnimePahe proxy directly
  : `https://m8u3.vercel.app/m3u8-proxy?url=${encodeURIComponent(actualM3u8Url)}`;
```

### Episode Fetching Order

1. **AnimePahe** (Primary)
   - Searches AnimePahe API
   - Fetches all episodes
   - Added as first provider

2. **HiAnime** (Secondary)
   - **Step 1**: Try Consumet API
     - Endpoint: `https://consumet-six-alpha.vercel.app/meta/anilist/episodes/{id}`
     - Retries: 2 attempts with 1-2 second delays
     - Timeout: 10 seconds per attempt
   
   - **Step 2**: Fallback to Mapping
     - Only if Consumet fails after 2 attempts
     - Uses HiAnime search and mapping
     - Same as previous implementation

### Consumet API Integration

```javascript
async function getConsumetEpisodes(anilistId, retryCount = 0) {
  const maxRetries = 2;
  
  try {
    const response = await fetch(
      `https://consumet-six-alpha.vercel.app/meta/anilist/episodes/${anilistId}`,
      {
        signal: AbortSignal.timeout(10000) // 10 second timeout
      }
    );
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return data; // Success
    }
    
    throw new Error('No episodes');
  } catch (error) {
    if (retryCount < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return getConsumetEpisodes(anilistId, retryCount + 1);
    }
    return null; // Failed after retries
  }
}
```

## User Experience Changes

### Before
- Two players (Vidstack and ArtPlayer)
- Player toggle button
- HiAnime as default provider
- HiAnime always used mapping

### After
- Single player (ArtPlayer only)
- No player toggle
- AnimePahe as default provider
- HiAnime tries Consumet first, then mapping
- Better Chromecast support for AnimePahe

## Benefits

### 1. Simplified Codebase
- Removed Vidstack dependencies
- Less code to maintain
- Fewer potential bugs

### 2. Better Performance
- AnimePahe typically faster than HiAnime
- Consumet API faster than mapping
- Reduced API calls for HiAnime

### 3. Improved Reliability
- Retry logic for Consumet
- Fallback to mapping if needed
- Better error handling

### 4. Enhanced Chromecast
- Works with all providers
- Proper proxy handling
- Better subtitle support

## Testing

### Test AnimePahe Playback
1. Navigate to any anime
2. Select AnimePahe server (Server 1)
3. Play episode
4. Verify playback works
5. Test Chromecast casting

### Test HiAnime Consumet
1. Navigate to any anime
2. Select HiAnime server (Server 2)
3. Check console logs for "Using Consumet episodes"
4. Verify episode list loads
5. Test playback

### Test HiAnime Mapping Fallback
1. Find anime not on Consumet
2. Select HiAnime server
3. Check console logs for "Consumet failed, trying mapping"
4. Verify mapping episodes load
5. Test playback

## Console Log Examples

### AnimePahe (Success)
```
🎬 Processing AniList ID: 154587
[AnimePahe] Processing...
[AnimePahe] ✓ Exact match found: Frieren: Beyond Journey's End
[AnimePahe] Retrieved 28 episodes
[AnimePahe] ✅ Retrieved 28 episodes
```

### HiAnime (Consumet Success)
```
[HiAnime] Processing...
[Consumet] Attempt 1/3 for AniList ID: 154587
[Consumet] ✅ Retrieved 28 episodes
[HiAnime] ✅ Using Consumet episodes: 28
```

### HiAnime (Mapping Fallback)
```
[HiAnime] Processing...
[Consumet] Attempt 1/3 for AniList ID: 154587
[Consumet] Attempt 1 failed: No episodes returned from Consumet
[Consumet] Attempt 2/3 for AniList ID: 154587
[Consumet] Attempt 2 failed: No episodes returned from Consumet
[HiAnime] Consumet failed, trying mapping...
[HiAnime] ✓ Matched to HiAnime ID: frieren-beyond-journeys-end-18542
[HiAnime] ✅ Using mapped episodes: 28
```

## Troubleshooting

### AnimePahe Not Playing
- Check if external proxy is accessible
- Verify URL includes `m8u3.thevoidborn001.workers.dev`
- Check browser console for errors

### HiAnime Not Loading
- Check if Consumet API is accessible
- Verify mapping fallback is working
- Check console logs for error messages

### Chromecast Not Working
- Verify Cast API is loaded
- Check if proxy URLs are correct
- Ensure subtitles are in VTT format

## Files Modified

1. `src/components/videoplayer/PlayerComponent.js`
   - Removed Vidstack imports
   - Removed player toggle functionality
   - Simplified player rendering

2. `src/components/videoplayer/ArtPlayer/player.js`
   - Added AnimePahe proxy detection
   - Updated Chromecast URL logic
   - Improved logging

3. `src/app/api/episode/[...animeid]/route.js`
   - Reordered providers (AnimePahe first)
   - Added Consumet API integration
   - Added retry logic
   - Added fallback to mapping

## Next Steps

1. Monitor Consumet API reliability
2. Adjust retry count if needed
3. Consider caching Consumet responses
4. Add more providers if needed
