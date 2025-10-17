"use client"

// Utility to initialize Google Cast SDK with proper error handling
export const initializeChromecastSDK = () => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.chrome?.cast?.framework) {
      resolve(true);
      return;
    }

    // Check if script is already loading
    const existingScript = document.querySelector('script[src*="cast_sender.js"]');
    if (existingScript) {
      // Wait for existing script to load
      const checkInterval = setInterval(() => {
        if (window.chrome?.cast?.framework) {
          clearInterval(checkInterval);
          resolve(true);
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('Cast SDK load timeout'));
      }, 10000);
      return;
    }

    // Load the script
    const script = document.createElement('script');
    script.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
    script.async = true;

    let resolved = false;

    script.onload = () => {
      // Set up the callback
      window['__onGCastApiAvailable'] = (isAvailable) => {
        if (!resolved) {
          resolved = true;
          if (isAvailable && window.chrome?.cast?.framework) {
            resolve(true);
          } else {
            reject(new Error('Cast API not available'));
          }
        }
      };

      // Also check periodically in case callback doesn't fire
      let attempts = 0;
      const checkInterval = setInterval(() => {
        attempts++;
        if (window.chrome?.cast?.framework && !resolved) {
          resolved = true;
          clearInterval(checkInterval);
          resolve(true);
        } else if (attempts > 50) { // 5 seconds
          clearInterval(checkInterval);
          if (!resolved) {
            resolved = true;
            reject(new Error('Cast API initialization timeout'));
          }
        }
      }, 100);
    };

    script.onerror = () => {
      if (!resolved) {
        resolved = true;
        reject(new Error('Failed to load Cast SDK'));
      }
    };

    document.head.appendChild(script);

    // Overall timeout
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        reject(new Error('Cast SDK load timeout'));
      }
    }, 15000);
  });
};

// Simple cast function that can be used directly
export const simpleCast = async (mediaInfo) => {
  try {
    await initializeChromecastSDK();
    
    const cast = window.chrome.cast.framework;
    const context = cast.CastContext.getInstance();

    // Set options if not already set
    try {
      context.setOptions({
        receiverApplicationId: cast.CastContext.DEFAULT_CHROME_RECEIVER_APP_ID,
        autoJoinPolicy: cast.AutoJoinPolicy.ORIGIN_SCOPED
      });
    } catch (e) {
      // Options might already be set
    }

    // Request session if not connected
    const currentState = context.getCastState();
    if (currentState !== cast.CastState.CONNECTED) {
      await context.requestSession();
    }

    const session = context.getCurrentSession();
    if (!session) {
      throw new Error('No cast session available');
    }

    // Clean the source URL
    const cleanSrc = mediaInfo.src
      .replace('https://cors-anywhere-livid-six.vercel.app/', '')
      .replace('https://m3u8-proxy.xdsystemspotify.workers.dev/?url=', '')
      .replace('https://newproxy-chi.vercel.app/m3u8-proxy?url=', '');

    // Create media info
    const castMediaInfo = new cast.messages.MediaInformation(cleanSrc, 'application/x-mpegurl');
    
    // Set metadata
    const metadata = new cast.messages.GenericMediaMetadata();
    metadata.title = mediaInfo.title || 'Anime Episode';
    metadata.subtitle = mediaInfo.subtitle || 'Streaming from Anime App';
    
    if (mediaInfo.poster) {
      metadata.images = [new cast.messages.Image(mediaInfo.poster)];
    }
    
    castMediaInfo.metadata = metadata;

    // Add subtitles if available
    if (mediaInfo.subtitles && mediaInfo.subtitles.length > 0) {
      castMediaInfo.tracks = mediaInfo.subtitles.map((sub, index) => {
        const track = new cast.messages.Track(index, cast.messages.TrackType.TEXT);
        track.trackContentId = sub.src;
        track.trackContentType = 'text/vtt';
        track.subtype = cast.messages.TextTrackType.SUBTITLES;
        track.name = sub.label || 'Subtitles';
        track.language = sub.language || 'en';
        return track;
      });
    }

    const request = new cast.messages.LoadRequest();
    request.media = castMediaInfo;
    request.currentTime = mediaInfo.currentTime || 0;
    request.autoplay = true;

    await session.loadMedia(request);
    
    return {
      success: true,
      deviceName: session.getCastDevice().friendlyName
    };
  } catch (error) {
    console.error('Cast error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Check if casting is available
export const isCastAvailable = async () => {
  try {
    await initializeChromecastSDK();
    const cast = window.chrome.cast.framework;
    const context = cast.CastContext.getInstance();
    const castState = context.getCastState();
    return castState !== cast.CastState.NO_DEVICES_AVAILABLE;
  } catch (error) {
    return false;
  }
};