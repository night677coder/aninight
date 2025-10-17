# Kyomu Streaming Provider Integration

## Overview
Successfully integrated Kyomu (AnimePahe API) as an additional streaming provider alongside HiAnime.

## What Was Added

### 1. Kyomu Library (`src/lib/kyomu.js`)
Created a new library file with the following functions:
- `searchKyomuAnime(title)` - Search anime on Kyomu using AniList title
- `getKyomuEpisodes(session)` - Get episode list from Kyomu
- `getKyomuSources(session, episodeId)` - Get streaming/download URLs for episodes
- `mapAniListToKyomu(anilistData)` - Map AniList anime to Kyomu session

### 2. Updated Episode API (`src/app/api/episode/[...animeid]/route.js`)
- Added Kyomu episode fetching alongside HiAnime
- Returns both providers in the response array
- Kyomu episodes are fetched using AniList title mapping

### 3. Updated Source API (`src/app/api/source/[...epsource]/route.js`)
- Added `kyomuEpisode()` function to fetch streaming sources
- Handles Kyomu provider in the POST endpoint
- Applies m3u8 proxy for CORS handling (compatible with your local proxy)

### 4. Updated getData Library (`src/lib/getData.js`)
- Modified `getSources()` to recognize Kyomu provider
- Sets correct source type for Kyomu requests

### 5. Provider Name Formatter (`src/utils/ProviderFormatter.js`)
- Created utility to format provider IDs to display names
- Maps: `kyomu` → `Kyomu`, `hianime` → `HiAnime`, etc.

### 6. Updated UI Components
- **DetailsEpisodeList.js**: Updated provider dropdown to show formatted names
- **EnhancedEpisodeList.js**: Updated server buttons to show provider names instead of "Server 1", "Server 2"

## How It Works

### Episode Fetching Flow
1. User visits anime info page
2. System fetches AniList data for the anime
3. For HiAnime:
   - Maps AniList title to HiAnime ID
   - Fetches episodes from HiAnime API
4. For Kyomu:
   - Searches Kyomu using AniList title
   - Gets Kyomu session ID
   - Fetches episodes from Kyomu API
5. Both providers are returned and displayed in the UI

### Streaming Flow
1. User selects Kyomu provider and episode
2. System calls source API with Kyomu provider
3. Kyomu API returns streaming URL (m3u8) and download links
4. URLs are proxied through your local m3u8 proxy for CORS handling
5. Video player loads the proxied stream

## API Endpoints Used

### Kyomu API Base URL
```
https://animepahe-api-iota.vercel.app/api
```

### Endpoints
- **Search**: `/search?q={query}&page={page}`
- **Episodes**: `/{animeSession}/releases?sort=episode_desc&page=1`
- **Streaming**: `/play/{animeSession}?episodeId={episodeSession}`
  - Requires both anime session ID and episode session ID

## Features

### ✅ Implemented
- Dual provider support (HiAnime + Kyomu)
- Automatic AniList to Kyomu mapping
- M3U8 proxy integration for CORS
- Provider name formatting in UI
- Episode fetching from both providers
- Streaming source fetching

### 🔄 How Users Switch Providers
1. On anime info page: Select provider from dropdown
2. On watch page: Click provider buttons under SUB/DUB sections
3. Provider names are clearly displayed (e.g., "HiAnime", "Kyomu")

## Technical Details

### M3U8 Proxy Compatibility
Kyomu streaming URLs are automatically proxied through your existing m3u8 proxy:
```javascript
`${process.env.NEXT_PUBLIC_PROXY_URI}/api/m3u8-proxy?url=${encodeURIComponent(source.url)}&headers=${encodeURIComponent(JSON.stringify(headers))}`
```

### Headers for Kyomu
```javascript
{
  'Referer': 'https://animepahe.com/',
  'Origin': 'https://animepahe.com'
}
```

### Episode Format
Kyomu episodes are mapped to your standard format:
```javascript
{
  id: `${animeSession}:${episodeSession}`,  // Combined ID for uniqueness
  episodeId: `${animeSession}:${episodeSession}`, // Combined for streaming
  number: episode_number,                    // Episode number (1, 2, 3, etc.)
  title: `Episode ${episode_number}`,
  animeSession: animeSession,                // Anime session ID
  episodeSession: episodeSession             // Episode session ID
}
```

The combined ID format (`animeSession:episodeSession`) is used because the Kyomu API requires both IDs to fetch streaming sources.

### Source Response Format
Kyomu returns sources in this structure:
```javascript
{
  sources: [
    {
      url: "https://vault-15.owocdn.top/stream/.../uwu.m3u8",
      isM3U8: true,
      resolution: "1080", // or "720", "360"
      isDub: false,       // true for dubbed versions
      fanSub: "WAP"       // Fansub group name
    }
  ],
  downloads: [
    {
      fansub: "WAP",
      quality: "WAP · 1080p (179MB) BD",
      isDub: false,
      download: "https://vault-15.kwik.cx/mp4/..."
    }
  ]
}
```

## Testing

To test the integration:
1. Visit any anime info page
2. Look for "Kyomu" in the provider dropdown
3. Select Kyomu provider
4. Click on an episode to watch
5. Video should load through the Kyomu provider

## Notes

- Kyomu uses AniList data for anime details (not Kyomu's own metadata)
- Only episode streaming URLs come from Kyomu
- The integration maintains compatibility with your existing HiAnime setup
- Both providers can coexist and users can switch between them seamlessly
