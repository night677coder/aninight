# Final Provider Setup

## Provider Priority

### Current Order (Default)
1. **HiAnime** (Server 1) - Default Provider
   - First tries Consumet API (2 attempts)
   - Falls back to HiAnime mapping if Consumet fails
   
2. **AnimePahe** (Server 2) - Secondary Provider
   - Direct AnimePahe API
   - Auto-fallback from dub to sub if dub not available

## Features Summary

### HiAnime Provider
✅ **Consumet API First**
- Endpoint: `https://consumet-six-alpha.vercel.app/meta/anilist/episodes/{id}`
- Retries: 2 attempts with timeout
- Faster and more reliable

✅ **Mapping Fallback**
- Uses HiAnime search and mapping
- Only when Consumet fails
- Ensures episodes are always available

✅ **Sub/Dub Support**
- Both sub and dub episodes
- Separate episode lists for each

### AnimePahe Provider
✅ **Fast Endpoint**
- Uses `downloads=false` parameter
- Significantly faster response times
- Only fetches streaming sources

✅ **Auto Dub-to-Sub Fallback**
- If dub requested but not available
- Automatically switches to sub
- Seamless user experience

✅ **External Proxy**
- Uses `https://m8u3.thevoidborn001.workers.dev`
- Handles CORS and authentication
- Works with Chromecast

## User Experience

### When User Visits Anime Page
1. System fetches episodes from both providers
2. HiAnime appears as "Server 1" (default)
3. AnimePahe appears as "Server 2"
4. User can switch between servers

### When User Selects HiAnime
1. Tries Consumet API first
2. If successful, uses Consumet episodes
3. If fails, uses mapped episodes
4. Episodes load quickly

### When User Selects AnimePahe
1. Fetches episodes from AnimePahe API
2. Uses fast endpoint (downloads=false)
3. If dub requested but not available, plays sub
4. Smooth playback with external proxy

## Console Logs

### HiAnime (Consumet Success)
```
🎬 Processing AniList ID: 154587
[HiAnime] Processing...
[Consumet] Attempt 1/3 for AniList ID: 154587
[Consumet] ✅ Retrieved 28 episodes
[HiAnime] ✅ Using Consumet episodes: 28
[AnimePahe] Processing...
[AnimePahe] ✅ Retrieved 28 episodes
✅ Total providers found: 2
```

### HiAnime (Mapping Fallback)
```
🎬 Processing AniList ID: 154587
[HiAnime] Processing...
[Consumet] Attempt 1/3 for AniList ID: 154587
[Consumet] Attempt 1 failed: No episodes returned
[Consumet] Attempt 2/3 for AniList ID: 154587
[Consumet] Attempt 2 failed: No episodes returned
[HiAnime] Consumet failed, trying mapping...
[HiAnime] ✓ Matched to HiAnime ID: frieren-18542
[HiAnime] ✅ Using mapped episodes: 28
[AnimePahe] Processing...
[AnimePahe] ✅ Retrieved 28 episodes
✅ Total providers found: 2
```

### AnimePahe (Dub Fallback)
```
[AnimePahe] Fetching sources for episode: xxx, subtype: dub
[AnimePahe] No dub sources found, falling back to sub
[AnimePahe] Found 3 sub (fallback) sources
```

## Technical Details

### Episode Fetching Flow
```
User visits anime page
    ↓
Fetch HiAnime episodes
    ↓
Try Consumet API (2 attempts)
    ↓
Success? → Use Consumet episodes
    ↓
Failed? → Try HiAnime mapping
    ↓
Fetch AnimePahe episodes
    ↓
Display both providers
```

### Source Fetching Flow (AnimePahe)
```
User clicks episode
    ↓
Request sources with subtype (sub/dub)
    ↓
Use fast endpoint (downloads=false)
    ↓
Filter sources by isDub flag
    ↓
Found sources? → Return sources
    ↓
No sources & dub requested? → Fallback to sub
    ↓
Apply external proxy to URLs
    ↓
Return to player
```

## Benefits

### 1. Better Reliability
- HiAnime as default (more reliable)
- Consumet API faster than mapping
- AnimePahe as backup option

### 2. Improved Performance
- Fast AnimePahe endpoint
- Reduced API response times
- Better user experience

### 3. Seamless Fallbacks
- Consumet → Mapping (HiAnime)
- Dub → Sub (AnimePahe)
- No failed playback

### 4. Flexibility
- Users can choose provider
- Both providers always available
- Easy to switch between servers

## Testing

### Test HiAnime Default
1. Navigate to any anime
2. Verify HiAnime is Server 1
3. Check console for Consumet/mapping logs
4. Test episode playback

### Test AnimePahe Fallback
1. Select AnimePahe (Server 2)
2. Try playing dub episode
3. If no dub, verify sub plays
4. Check console for fallback log

### Test Provider Switching
1. Start with HiAnime
2. Switch to AnimePahe
3. Verify episodes reload
4. Test playback on both

## Files Modified

1. `src/app/api/episode/[...animeid]/route.js`
   - Reordered providers (HiAnime first)
   - HiAnime now default

2. `src/app/api/animepahe/sources/route.js`
   - Added `downloads=false` parameter
   - Added dub-to-sub fallback logic

3. `src/app/api/source/[...epsource]/route.js`
   - Updated AnimePaheEpisode function
   - Added faster endpoint
   - Added fallback logic

## Summary

✅ HiAnime is now the default provider (Server 1)
✅ AnimePahe is secondary provider (Server 2)
✅ Consumet API tried first for HiAnime
✅ Mapping fallback for HiAnime
✅ Fast endpoint for AnimePahe
✅ Auto dub-to-sub fallback for AnimePahe
✅ Both providers work seamlessly
✅ ArtPlayer only (Vidstack removed)
✅ Chromecast works with both providers
