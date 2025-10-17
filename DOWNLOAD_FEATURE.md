# Download Feature Documentation

## Overview
The download feature allows users to download anime episodes directly from the watch page. It integrates with the AnimePahe API to provide download links in multiple quality options (1080p, 720p, 480p, 360p).

## Features
- **One-click download access**: Download button integrated into the watch page
- **Multiple quality options**: Choose from 1080p, 720p, 480p, or 360p
- **Smart anime matching**: Automatically maps AniList anime to AnimePahe using title matching
- **Session caching**: Download links are cached to improve performance
- **Clean UI**: Modal interface with smooth animations
- **HiAnime streaming preserved**: Streaming continues to use HiAnime source/server

## Architecture

### API Routes
1. **`/api/animepahe/search`** - Search for anime on AnimePahe
   - Query params: `q` (search query), `page` (optional)
   
2. **`/api/animepahe/episodes`** - Get episode list for an anime
   - Query params: `session` (AnimePahe session ID), `sort`, `page`
   
3. **`/api/animepahe/download`** - Get download links for an episode
   - Query params: `animeSession` (anime session ID), `episodeSession` (episode session ID)
   - Uses endpoint: `/api/play/:session?episodeId=example`

### Components
- **`DownloadButton.js`** - Main download button component with modal
- **`DownloadButton.module.css`** - Styling for the download button and modal

### Utilities
- **`animePaheDownload.js`** - Helper functions for AnimePahe integration
  - `searchAnimePahe()` - Search anime by title
  - `getAnimePaheEpisodes()` - Get episodes for a session
  - `getDownloadLinks()` - Get download links for an episode
  - `findDownloadLinks()` - Smart matching and link retrieval

## How It Works

1. **User clicks download button** on the watch page
2. **Title matching**: System searches AnimePahe using AniList titles (English, Romaji, Native)
3. **Episode lookup**: Finds the matching episode number in AnimePahe's database
4. **Link retrieval**: Fetches download links from AnimePahe API
5. **Display modal**: Shows available quality options to the user
6. **Caching**: Links are cached in sessionStorage for faster subsequent access

## AniList to AnimePahe Mapping

The system uses intelligent title matching:
- Tries English, Romaji, and Native titles from AniList
- Performs case-insensitive substring matching
- Falls back to first search result if no exact match
- Matches episode numbers between platforms

## Usage

### For Users
1. Navigate to any anime watch page
2. Click the "Download" button next to the episode title
3. Wait for download links to load
4. Select your preferred quality
5. Download page opens in a new tab

### For Developers
```javascript
import DownloadButton from '@/components/videoplayer/DownloadButton';

<DownloadButton 
  animeData={animeData}  // AniList anime data
  episodeNumber={epNum}   // Current episode number
/>
```

## Caching Strategy
- Download links are cached in `sessionStorage`
- Cache key format: `download_{animeId}_{episodeNumber}`
- Cache persists for the browser session
- Reduces API calls and improves performance

## Error Handling
- Graceful fallback if AnimePahe match not found
- User-friendly error messages via toast notifications
- Loading states during API calls
- Handles missing or unavailable download links

## Future Enhancements
- Add more download sources
- Batch download support
- Download quality preferences
- Download history tracking
- Direct download integration (without external page)

## API Credits
Download links are provided by [AnimePahe API](https://animepahe-api-iota.vercel.app)
