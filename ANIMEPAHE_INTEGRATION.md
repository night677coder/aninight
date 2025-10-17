# AnimePahe Integration Guide

## Overview
AnimePahe has been successfully integrated as a streaming source alongside HiAnime. Users can now select AnimePahe as a server and stream episodes directly.

## Key Features
- ✅ AnimePahe search and episode fetching
- ✅ External proxy for m3u8 streaming (`https://m8u3.thevoidborn001.workers.dev`)
- ✅ Server selection UI (Server 1, Server 2, etc.)
- ✅ Automatic episode listing
- ✅ Seamless playback with existing video players

## Architecture

### 1. AnimePahe Library (`src/lib/animepahe.js`)
Core functions for AnimePahe integration:
- `getAnilistDataForAnimePahe()` - Fetches AniList data for matching
- `searchAnimePahe()` - Searches AnimePahe API
- `getAnimePaheSession()` - Matches AniList anime to AnimePahe session
- `getAnimePaheEpisodes()` - Fetches all episodes for an anime

### 2. API Routes

#### Episodes API (`src/app/api/episode/[...animeid]/route.js`)
- Fetches episodes from both HiAnime and AnimePahe
- Returns unified format with multiple providers
- Each provider has a `providerId` field

#### Sources API (`src/app/api/animepahe/sources/route.js`)
- Fetches streaming sources for a specific episode
- Requires `animeSession` and `episodeSession` parameters
- Proxies m3u8 URLs through external proxy

#### Source Handler (`src/app/api/source/[...epsource]/route.js`)
- Updated to handle AnimePahe provider
- Extracts m3u8 URLs and applies external proxy
- Returns sources in standard format

### 3. Frontend Components

#### PlayerComponent (`src/components/videoplayer/PlayerComponent.js`)
- Updated to handle AnimePahe sessions
- Passes `animeSession` and `episodeSession` to source API
- Works with existing video players (Vidstack & ArtPlayer)

#### EnhancedEpisodeList (`src/components/videoplayer/EnhancedEpisodeList.js`)
- Displays AnimePahe as a server option
- Generates proper URLs with session parameters
- Handles episode navigation

#### Watch Page (`src/app/anime/watch/[[...watchid]]/page.js`)
- Extracts `session` parameter from URL
- Passes session to PlayerComponent

## URL Structure

### AnimePahe Episode URL
```
/anime/watch?id={anilistId}&host=animepahe&epid={episodeSession}&ep={episodeNumber}&type=sub&session={animeSession}
```

**Parameters:**
- `id` - AniList anime ID
- `host` - Provider (animepahe)
- `epid` - AnimePahe episode session ID
- `ep` - Episode number
- `type` - Sub or dub
- `session` - AnimePahe anime session ID

## Proxy Configuration

### External Proxy
AnimePahe uses an external Cloudflare Worker proxy:
```
https://m8u3.thevoidborn001.workers.dev
```

### URL Transformation
Original URL:
```
https://vault-15.owocdn.top/stream/15/11/acc0383142e3e31febfda281aaa9c1e9d7b2b488427c5e0c124f30fb2995aaeb/uwu.m3u8
```

Proxied URL:
```
https://m8u3.thevoidborn001.workers.dev/stream/15/11/acc0383142e3e31febfda281aaa9c1e9d7b2b488427c5e0c124f30fb2995aaeb/uwu.m3u8
```

**Note:** The local m3u8 proxy (`/api/m3u8-proxy`) is NOT used for AnimePahe. Only the external proxy is used.

## Data Flow

1. **Episode Fetching:**
   ```
   User visits anime page
   → API fetches episodes from HiAnime & AnimePahe
   → Episodes displayed with server selection
   ```

2. **Server Selection:**
   ```
   User selects AnimePahe server
   → Episode list updates
   → URL includes session parameter
   ```

3. **Video Playback:**
   ```
   User clicks episode
   → PlayerComponent extracts sessions
   → Fetches sources from AnimePahe API
   → Applies external proxy to m3u8 URLs
   → Player loads proxied stream
   ```

## Episode Format

### AnimePahe Episode Object
```javascript
{
  id: "episode_session_id",
  number: 1,
  title: "Episode 1",
  episodeId: "episode_session_id",
  session: "episode_session_id",
  animeSession: "anime_session_id"
}
```

### Provider Object
```javascript
{
  consumet: false,
  providerId: "animepahe",
  episodes: [/* episode objects */]
}
```

## Testing

Run the integration test:
```bash
node test-animepahe-integration.js
```

This will:
1. Search for an anime
2. Fetch episodes
3. Get streaming sources
4. Test proxied URLs

## Important Notes

1. **Session Management:**
   - AnimePahe requires TWO session IDs: anime session and episode session
   - Both must be passed through the URL and API calls

2. **Proxy Usage:**
   - ALWAYS use external proxy for AnimePahe
   - Do NOT use local m3u8 proxy
   - External proxy handles CORS and authentication

3. **Quality Options:**
   - AnimePahe provides multiple quality options (720p, 1080p, etc.)
   - All are m3u8 streams
   - Player automatically selects best quality

4. **Server Display:**
   - AnimePahe appears as "Server 2" (or higher) in the UI
   - HiAnime is typically "Server 1"
   - Server numbers are assigned based on provider order

## Troubleshooting

### No Episodes Found
- Check if anime exists on AnimePahe
- Verify AniList title matches AnimePahe title
- Try alternative titles/synonyms

### Playback Issues
- Verify external proxy is accessible
- Check browser console for CORS errors
- Ensure m3u8 URL is properly formatted

### Session Errors
- Confirm both anime and episode sessions are passed
- Check URL parameters are properly encoded
- Verify session IDs are valid

## Future Enhancements

- [ ] Add quality selector for AnimePahe
- [ ] Cache AnimePahe sessions
- [ ] Improve title matching algorithm
- [ ] Add AnimePahe-specific error handling
- [ ] Support for batch episode loading
