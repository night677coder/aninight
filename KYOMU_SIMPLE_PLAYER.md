# Kyomu Simple Player Solution

## Problem

The main video player keeps trying to proxy Kyomu URLs through the local `/api/m3u8-proxy`, which causes issues.

## Solution

Created a dedicated simple player for Kyomu sources that embeds hlsplayer.org directly in an iframe.

## Files Created

### `src/components/videoplayer/KyomuPlayer.js`

A simple React component that:
- Takes a Kyomu source URL
- Embeds it in hlsplayer.org iframe
- No complex proxy logic
- Just works!

## How to Use

### In Your Player Component

Check if the source is from Kyomu and use the simple player:

```javascript
import KyomuPlayer from '@/components/videoplayer/KyomuPlayer';

// In your player component
if (currentSource?.server === 'kyomu') {
  return <KyomuPlayer source={currentSource} />;
}

// Otherwise use your normal player
return <YourNormalPlayer source={currentSource} />;
```

### Source Detection

Kyomu sources are marked with `server: 'kyomu'`:

```javascript
{
  url: "https://vault-15.owocdn.top/.../uwu.m3u8",
  quality: "1080",
  isM3U8: true,
  type: "hls",
  server: "kyomu", // <-- This marks it as Kyomu
}
```

## How It Works

```
1. User selects Kyomu source
   ↓
2. Player detects server === 'kyomu'
   ↓
3. Renders KyomuPlayer component
   ↓
4. KyomuPlayer embeds hlsplayer.org iframe
   ↓
5. hlsplayer.org handles everything:
   - Kwik headers
   - Segment loading
   - Playback
   ↓
6. Video plays! ✅
```

## Benefits

✅ **Simple** - Just an iframe embed  
✅ **No Proxy Issues** - Bypasses local proxy completely  
✅ **Works** - hlsplayer.org handles all Kwik complexity  
✅ **No Configuration** - No environment variables needed  
✅ **Reliable** - Third-party service handles everything  

## Integration Example

### Option 1: Conditional Rendering

```javascript
// src/components/videoplayer/PlayerComponent.js
import KyomuPlayer from './KyomuPlayer';
import VidstackPlayer from './VidstackPlayer';

export default function PlayerComponent({ sources, currentSource }) {
  // Use simple player for Kyomu
  if (currentSource?.server === 'kyomu') {
    return (
      <div className="player-container">
        <KyomuPlayer source={currentSource} />
      </div>
    );
  }

  // Use normal player for other sources
  return (
    <div className="player-container">
      <VidstackPlayer sources={sources} />
    </div>
  );
}
```

### Option 2: Server Selector

```javascript
// Let user choose between Kyomu and other servers
const servers = [
  { name: 'HiAnime', sources: hiAnimeSources },
  { name: 'GogoAnime', sources: gogoSources },
  { name: 'Kyomu', sources: kyomuSources }, // Will use simple player
];

// Render appropriate player based on selected server
{selectedServer === 'Kyomu' ? (
  <KyomuPlayer source={kyomuSources[0]} />
) : (
  <VidstackPlayer sources={otherSources} />
)}
```

## Customization

### Add Controls

```javascript
<KyomuPlayer 
  source={source}
  onEnded={() => console.log('Video ended')}
  onTimeUpdate={(time) => console.log('Current time:', time)}
/>
```

### Styling

```javascript
<div className="relative w-full aspect-video">
  <KyomuPlayer source={source} />
</div>
```

### Fullscreen

The iframe already supports fullscreen via the `allowFullScreen` attribute.

## Troubleshooting

### Iframe Not Loading

**Check:**
- Source URL is valid
- hlsplayer.org is accessible
- No ad blockers blocking iframe

### Video Not Playing

**Check:**
- Stream URL is fresh (not expired)
- Browser console for errors
- Try opening hlsplayer.org URL directly

### Want to Use Different Player

Replace hlsplayer.org with another embed player:

```javascript
const embedUrl = `https://your-player.com/embed?url=${encodeURIComponent(m3u8Url)}`;
```

## Alternative: Direct Embed

If you want even simpler, just use an iframe directly in your JSX:

```javascript
<iframe
  src={`https://www.hlsplayer.org/play?url=${encodeURIComponent(source.url)}`}
  className="w-full h-full"
  allowFullScreen
/>
```

## Summary

✅ **Created**: Simple Kyomu player component  
✅ **Marked**: Kyomu sources with `server: 'kyomu'`  
✅ **Solution**: Embed hlsplayer.org directly  
✅ **Result**: No more proxy issues!  

Just integrate the KyomuPlayer component into your player logic and Kyomu streams will work perfectly!
