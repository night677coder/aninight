# AnimePahe Quick Start Guide

## How to Use AnimePahe

### 1. Navigate to an Anime
Go to any anime details page on your site (e.g., `/anime/info/154587` for Frieren).

### 2. Select AnimePahe Server
When you click "Watch" or select an episode, you'll see server options:
- **Server 1**: HiAnime
- **Server 2**: AnimePahe (or higher number depending on available providers)

Click on the AnimePahe server button to switch to it.

### 3. Watch Episodes
Once AnimePahe is selected:
- All episodes from AnimePahe will be displayed
- Click any episode to start streaming
- The player will automatically use the external proxy for streaming

## Features

### Multiple Quality Options
AnimePahe provides multiple quality options:
- 360p
- 720p
- 1080p

The player automatically selects the best quality (1080p if available).

### Sub and Dub Support
AnimePahe provides both:
- **SUB**: Japanese audio with English subtitles
- **DUB**: English audio

Use the SUB/DUB toggle in the episode list to switch between them.

### Download Support
AnimePahe episodes can also be downloaded:
- Click the download button on the player
- Select your preferred quality
- Download will start automatically

## Technical Details

### External Proxy
AnimePahe uses an external Cloudflare Worker proxy:
```
https://m8u3.thevoidborn001.workers.dev
```

This proxy:
- Handles CORS issues
- Bypasses authentication requirements
- Provides reliable streaming

### URL Format
AnimePahe episode URLs include a session parameter:
```
/anime/watch?id=154587&host=animepahe&epid={episodeSession}&ep=1&type=sub&session={animeSession}
```

## Troubleshooting

### No Episodes Showing
- **Issue**: AnimePahe server shows 0 episodes
- **Solution**: The anime might not be available on AnimePahe. Try HiAnime instead.

### Playback Fails
- **Issue**: Video won't load or shows error
- **Solution**: 
  1. Check your internet connection
  2. Try refreshing the page
  3. Switch to a different quality (if available)
  4. Try HiAnime server instead

### Server Not Appearing
- **Issue**: AnimePahe server option doesn't show
- **Solution**: The anime might not be found on AnimePahe. The system only shows servers that have episodes available.

## Comparison: HiAnime vs AnimePahe

| Feature | HiAnime | AnimePahe |
|---------|---------|-----------|
| Quality | Up to 1080p | Up to 1080p |
| Speed | Fast | Fast |
| Availability | High | Medium |
| Sub/Dub | Both | Both |
| Downloads | Yes | Yes |
| Proxy | Local | External |

## Best Practices

1. **Try HiAnime First**: It usually has better availability
2. **Use AnimePahe as Backup**: If HiAnime doesn't work or doesn't have the anime
3. **Check Both Servers**: Sometimes one server has better quality or more episodes
4. **Report Issues**: If neither server works, the anime might not be available yet

## API Endpoints

For developers:

### Search Anime
```
GET /api/animepahe/search?q={query}
```

### Get Episodes
```
GET /api/animepahe/episodes?session={animeSession}&page=1
```

### Get Sources
```
GET /api/animepahe/sources?animeSession={animeSession}&episodeSession={episodeSession}
```

## Testing

Run the integration test:
```bash
node test-animepahe-integration.js
```

This will verify:
- Search functionality
- Episode fetching
- Source extraction
- Proxy URL generation
