# HiAnime Enhanced AniList ID Mapping

## Overview

Improved HiAnime integration with **multi-strategy matching** and **intelligent similarity scoring** for accurate anime identification from AniList IDs.

## What's New

### 🎯 Enhanced Accuracy
- **Multi-strategy matching**: 5 different strategies to find the correct anime
- **Fuzzy title matching**: Levenshtein distance algorithm for similarity scoring
- **Confidence scoring**: Only returns matches with >= 70% confidence
- **Multiple title sources**: English, Romaji, and synonyms
- **Metadata validation**: Episode count, type, and year matching

### 🔍 Matching Strategies

The system tries these strategies in order until a confident match is found:

1. **English Title + Filters** (Most accurate)
   - Uses English title with type, status, and year filters
   - Best for internationally popular anime

2. **Romaji Title + Filters**
   - Uses Japanese romanized title with filters
   - Good for anime without English titles

3. **Synonyms + Filters**
   - Tries alternative titles from AniList
   - Catches edge cases and regional variations

4. **English Title (Broad)**
   - Searches without filters for flexibility
   - Fallback for anime with unusual metadata

5. **Romaji Title (Broad)**
   - Final attempt without filters
   - Last resort for difficult matches

### 📊 Scoring System

Each potential match is scored based on:

| Criteria | Weight | Description |
|----------|--------|-------------|
| Title Similarity | 100 pts | Levenshtein distance between titles |
| Exact Match Bonus | +50 pts | Normalized titles match exactly |
| Episode Count | +20 pts | Episode counts match (±2 tolerance) |
| Type Match | +15 pts | Format matches (TV, Movie, OVA, etc.) |
| Year Match | +10 pts | Release year matches |

**Minimum confidence threshold: 70 points**

## Implementation

### New Library: `src/lib/hianime.js`

```javascript
import { getAnilistData, getHiAnimeId, getHiAnimeEpisodes } from "@/lib/hianime";

// Get AniList data with enhanced fields
const anilistData = await getAnilistData(anilistId);

// Find HiAnime ID using multi-strategy matching
const hiAnimeId = await getHiAnimeId(anilistData);

// Fetch episodes
const episodes = await getHiAnimeEpisodes(hiAnimeId);
```

### Updated API: `src/app/api/episode/[...animeid]/route.js`

Now uses the enhanced library for better accuracy and cleaner code.

## Features

### ✅ Title Normalization
- Removes special characters
- Normalizes whitespace
- Handles season/part suffixes
- Case-insensitive matching

### ✅ Fuzzy Matching
- Levenshtein distance algorithm
- Handles typos and variations
- Substring matching
- Similarity percentage calculation

### ✅ Metadata Validation
- Episode count comparison
- Format/type matching
- Release year validation
- Status filtering

### ✅ Comprehensive Logging
All matching attempts are logged with:
- Strategy being used
- Search parameters
- Similarity scores
- Best match details
- Confidence levels

## Testing

### Run Test Suite

```bash
node test-hianime-mapping.js
```

The test suite includes:
- Popular anime with English titles
- Anime with different English/Romaji names
- Recent seasonal anime
- Movies and OVAs
- Anime with special characters
- Sequels with season numbers
- Anime with multiple synonyms

### Example Test Output

```
🧪 Testing Enhanced HiAnime AniList ID Mapping

📝 Test: Popular anime with English title
   AniList ID: 21
   Expected: One Piece
   ------------------------------------------------------------------
   ✅ SUCCESS
   📺 Sub Episodes: 1000+
   🎙️  Dub Episodes: 1000+
   🔗 First Episode ID: one-piece-100?ep=1

📊 Test Summary:
   ✅ Passed: 8/8
   ❌ Failed: 0/8
   📈 Success Rate: 100.0%
```

### Server Console Logs

Look for detailed logs prefixed with `[HiAnime]`:

```
[HiAnime] Mapping AniList ID 154587
[HiAnime] Titles: EN="Frieren: Beyond Journey's End" | ROM="Sousou no Frieren"
[HiAnime] Strategy 1: English title with filters
[HiAnime] Best match: "Frieren: Beyond Journey's End" (score: 150.0)
[HiAnime] ✓ Matched to HiAnime ID: frieren-beyond-journeys-end-18413
[HiAnime] ✅ Retrieved 28 episodes
```

## Advantages Over Previous Implementation

| Feature | Old | New |
|---------|-----|-----|
| Matching Strategies | 2 | 5 |
| Title Sources | 2 | 3+ (includes synonyms) |
| Similarity Algorithm | None | Levenshtein distance |
| Confidence Scoring | No | Yes (70% threshold) |
| Metadata Validation | Basic | Comprehensive |
| Episode Count Check | No | Yes |
| Year Validation | No | Yes |
| Logging Detail | Basic | Comprehensive |
| Code Organization | Inline | Separate library |

## Edge Cases Handled

### ✅ Different Title Formats
- "Attack on Titan" vs "Shingeki no Kyojin"
- "Your Name" vs "Kimi no Na wa"

### ✅ Season Variations
- "Spy x Family Season 2" matches "Spy x Family"
- Normalized to ignore season suffixes

### ✅ Special Characters
- Handles "Jujutsu Kaisen" with special characters
- Normalizes punctuation differences

### ✅ Multiple Synonyms
- Tries all available alternative titles
- Increases match probability

### ✅ Type Mismatches
- Validates format (TV, Movie, OVA, etc.)
- Prevents false positives

## Configuration

No additional configuration needed! The system works out of the box with your existing setup.

### Environment Variables (Existing)
```env
# HiAnime API is hardcoded in the library
# No additional env vars required
```

## Performance

- **Caching**: Results cached for 1 hour (3600s)
- **Stale-while-revalidate**: 2 hours (7200s)
- **Timeout**: 30 seconds max duration
- **Strategies**: Stops at first confident match (>= 70%)

## Troubleshooting

### No Match Found

If an anime isn't matched:

1. **Check AniList data**: Verify the anime exists on AniList
2. **Check HiAnime availability**: Not all anime are on HiAnime
3. **Review logs**: Look for similarity scores in server console
4. **Try manual search**: Search HiAnime directly to verify availability

### Low Confidence Scores

If scores are below 70%:

- Title might be significantly different
- Metadata might not match (episodes, year, type)
- Anime might not be in HiAnime database
- Consider adding to synonyms on AniList

### False Positives

The 70% threshold prevents most false positives, but if you encounter one:

- Check if episode counts match
- Verify release year
- Compare anime types
- Review similarity score in logs

## Future Enhancements

Potential improvements:

- [ ] MAL ID fallback mapping
- [ ] User-submitted mapping corrections
- [ ] Machine learning for better scoring
- [ ] Caching of successful mappings
- [ ] A/B testing different thresholds
- [ ] Integration with other anime databases

## API Reference

### `getAnilistData(anilistId)`
Fetches comprehensive anime data from AniList.

**Returns**: AniList media object with titles, synonyms, format, status, episodes, year

### `getHiAnimeId(anilistData)`
Finds HiAnime ID using multi-strategy matching.

**Returns**: HiAnime anime ID string or null

### `getHiAnimeEpisodes(hiAnimeId)`
Fetches episode list from HiAnime.

**Returns**: Array of episode objects

### `getHiAnimeInfo(hiAnimeId)`
Fetches detailed anime info from HiAnime.

**Returns**: HiAnime anime info object

## Contributing

To improve the mapping algorithm:

1. Add test cases to `test-hianime-mapping.js`
2. Adjust scoring weights in `src/lib/hianime.js`
3. Add new matching strategies
4. Tune the confidence threshold (currently 70)

## Credits

- **AniList API**: Anime metadata
- **HiAnime API**: Episode data and streaming
- **Levenshtein Distance**: Fuzzy string matching algorithm

---

**Status**: ✅ Production Ready

**Last Updated**: 2025-10-16

**Compatibility**: Next.js 13+, Node.js 18+
