# HiAnime Enhanced Mapping - Quick Start

## What Changed?

Your HiAnime integration now has **much better accuracy** for matching AniList anime to HiAnime episodes.

## Key Improvements

✅ **5 matching strategies** instead of 2
✅ **Fuzzy title matching** with similarity scoring
✅ **70% confidence threshold** to prevent false matches
✅ **Synonym support** for alternative titles
✅ **Episode count validation** for better accuracy
✅ **Comprehensive logging** for debugging

## How to Use

### Nothing changes for users!

The improvement is automatic. Your existing code continues to work:

```javascript
// This still works exactly the same
const episodes = await getEpisodes(anilistId, idMal, status);
```

### For Developers

If you want to use the new library directly:

```javascript
import { getAnilistData, getHiAnimeId, getHiAnimeEpisodes } from "@/lib/hianime";

// Get AniList data
const anilistData = await getAnilistData(123456);

// Find HiAnime ID (uses 5 strategies automatically)
const hiAnimeId = await getHiAnimeId(anilistData);

// Get episodes
const episodes = await getHiAnimeEpisodes(hiAnimeId);
```

## Testing

### Quick Test

```bash
# Start your dev server
npm run dev

# In another terminal, run the test
node test-hianime-mapping.js
```

### Manual Test

Visit any anime page and check if episodes load correctly:
- http://localhost:3000/anime/info/21 (One Piece)
- http://localhost:3000/anime/info/154587 (Frieren)
- http://localhost:3000/anime/info/16498 (Attack on Titan)

## Debugging

### Check Server Logs

Look for `[HiAnime]` prefixed logs:

```
[HiAnime] Mapping AniList ID 154587
[HiAnime] Titles: EN="Frieren: Beyond Journey's End" | ROM="Sousou no Frieren"
[HiAnime] Strategy 1: English title with filters
[HiAnime] Best match: "Frieren: Beyond Journey's End" (score: 150.0)
[HiAnime] ✓ Matched to HiAnime ID: frieren-beyond-journeys-end-18413
```

### Understanding Scores

- **150+**: Excellent match (exact title + metadata)
- **100-149**: Good match (similar title + some metadata)
- **70-99**: Acceptable match (fuzzy title match)
- **< 70**: No match (too uncertain)

## Common Issues

### "No match found"

**Possible reasons:**
1. Anime not available on HiAnime
2. Title too different between AniList and HiAnime
3. Metadata mismatch (wrong type, year, etc.)

**Solution:** Check HiAnime directly to verify availability

### "Wrong anime matched"

**Very rare** with the new system (70% threshold), but if it happens:
- Check the similarity score in logs
- Verify episode counts match
- Report the issue with AniList ID

## Files Changed

- ✅ `src/lib/hianime.js` - New library (created)
- ✅ `src/app/api/episode/[...animeid]/route.js` - Updated to use new library
- ✅ `test-hianime-mapping.js` - Test suite (created)
- ✅ `HIANIME_MAPPING_IMPROVED.md` - Full documentation (created)

## Performance

- Same caching as before (1 hour)
- Slightly slower on first match (tries multiple strategies)
- Much faster on subsequent requests (cached)
- Stops at first confident match (doesn't try all 5 strategies if not needed)

## Rollback

If you need to rollback, the old code is still in git history:

```bash
git log src/app/api/episode/[...animeid]/route.js
git checkout <commit-hash> src/app/api/episode/[...animeid]/route.js
```

## Next Steps

1. ✅ Test with your most-watched anime
2. ✅ Monitor server logs for any issues
3. ✅ Report any false matches or misses
4. ✅ Enjoy better accuracy!

## Questions?

Check the full documentation: `HIANIME_MAPPING_IMPROVED.md`
