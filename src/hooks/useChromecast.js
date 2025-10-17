"use client"
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export const useChromecast = () => {
  const [castAvailable, setCastAvailable] = useState(false);
  const [castConnected, setCastConnected] = useState(false);
  const [castSession, setCastSession] = useState(null);
  const [castDevice, setCastDevice] = useState(null);
  const [mediaSession, setMediaSession] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let scriptLoaded = false;
    let initAttempts = 0;
    const maxAttempts = 10;

    const loadCastScript = () => {
      // Check if Cast API is already available
      if (window.chrome?.cast?.framework) {
        initializeCastApi();
        return;
      }

      // Check if script is already loading/loaded
      const existingScript = document.querySelector('script[src*="cast_sender.js"]');
      if (existingScript && !scriptLoaded) {
        // Script exists but not loaded yet, wait for it
        waitForCastApi();
        return;
      }

      if (scriptLoaded) {
        waitForCastApi();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
      script.async = true;
      
      script.onload = () => {
        scriptLoaded = true;
        waitForCastApi();
      };

      script.onerror = () => {
        console.warn('Failed to load Google Cast SDK');
        setCastAvailable(false);
      };
      
      document.head.appendChild(script);
    };

    const waitForCastApi = () => {
      const checkCastApi = () => {
        initAttempts++;
        
        if (window.chrome?.cast?.framework) {
          initializeCastApi();
        } else if (initAttempts < maxAttempts) {
          setTimeout(checkCastApi, 200);
        } else {
          console.warn('Google Cast API not available after maximum attempts');
          setCastAvailable(false);
        }
      };

      // Set up the global callback
      window['__onGCastApiAvailable'] = (isAvailable) => {
        if (isAvailable && window.chrome?.cast?.framework) {
          initializeCastApi();
        } else {
          setCastAvailable(false);
        }
      };

      checkCastApi();
    };

    // Only load if we're in a browser environment
    if (typeof window !== 'undefined') {
      loadCastScript();
    }

    return () => {
      // Cleanup
      if (window['__onGCastApiAvailable']) {
        delete window['__onGCastApiAvailable'];
      }
    };
  }, []);

  const initializeCastApi = useCallback(() => {
    const cast = window.chrome?.cast;
    if (!cast?.framework) {
      console.warn('Cast framework not available');
      return;
    }

    try {
      // Check if context is already initialized
      let context;
      try {
        context = cast.framework.CastContext.getInstance();
      } catch (e) {
        // Context not initialized yet, this is normal
        console.log('Initializing Cast context...');
      }

      if (!context) {
        // Initialize the context
        cast.framework.CastContext.getInstance().setOptions({
          receiverApplicationId: cast.framework.CastContext.DEFAULT_CHROME_RECEIVER_APP_ID,
          autoJoinPolicy: cast.framework.AutoJoinPolicy.ORIGIN_SCOPED
        });
        context = cast.framework.CastContext.getInstance();
      }

      // Listen for cast state changes
      context.addEventListener(
        cast.framework.CastContextEventType.CAST_STATE_CHANGED,
        handleCastStateChanged
      );

      // Listen for session state changes
      context.addEventListener(
        cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
        handleSessionStateChanged
      );

      // Initial state check
      const initialState = context.getCastState();
      updateCastState(initialState);
      
      if (initialState === cast.framework.CastState.CONNECTED) {
        const session = context.getCurrentSession();
        setCastSession(session);
        setCastDevice(session?.getCastDevice());
        
        // Listen for media session updates
        const remotePlayer = new cast.framework.RemotePlayer();
        const remotePlayerController = new cast.framework.RemotePlayerController(remotePlayer);
        setMediaSession({ player: remotePlayer, controller: remotePlayerController });
      }

      console.log('Cast API initialized successfully');
    } catch (error) {
      console.error('Error initializing Cast API:', error);
      setCastAvailable(false);
    }
  }, []);

  const handleCastStateChanged = useCallback((event) => {
    updateCastState(event.castState);
  }, []);

  const handleSessionStateChanged = useCallback((event) => {
    const cast = window.chrome?.cast;
    if (!cast) return;

    const session = event.session;
    
    switch (event.sessionState) {
      case cast.framework.SessionState.SESSION_STARTED:
      case cast.framework.SessionState.SESSION_RESUMED:
        setCastSession(session);
        setCastDevice(session?.getCastDevice());
        
        // Set up remote player
        const remotePlayer = new cast.framework.RemotePlayer();
        const remotePlayerController = new cast.framework.RemotePlayerController(remotePlayer);
        setMediaSession({ player: remotePlayer, controller: remotePlayerController });
        break;
        
      case cast.framework.SessionState.SESSION_ENDED:
        setCastSession(null);
        setCastDevice(null);
        setMediaSession(null);
        break;
    }
  }, []);

  const updateCastState = useCallback((castState) => {
    const cast = window.chrome?.cast;
    if (!cast) return;

    setCastAvailable(castState !== cast.framework.CastState.NO_DEVICES_AVAILABLE);
    setCastConnected(castState === cast.framework.CastState.CONNECTED);
  }, []);

  const startCasting = useCallback(async (mediaInfo) => {
    const cast = window.chrome?.cast;
    if (!cast || !mediaInfo.src) return false;

    setIsLoading(true);

    try {
      const context = cast.framework.CastContext.getInstance();
      
      if (!castConnected) {
        // Request new session
        await context.requestSession();
      }

      const session = context.getCurrentSession();
      if (!session) {
        throw new Error('No cast session available');
      }

      // Create media info
      const castMediaInfo = new cast.framework.messages.MediaInformation(
        mediaInfo.src, 
        'application/x-mpegurl'
      );
      
      // Set metadata
      const metadata = new cast.framework.messages.GenericMediaMetadata();
      metadata.title = mediaInfo.title || 'Anime Episode';
      metadata.subtitle = mediaInfo.subtitle || 'Streaming from Anime App';
      
      if (mediaInfo.poster) {
        metadata.images = [new cast.framework.messages.Image(mediaInfo.poster)];
      }
      
      castMediaInfo.metadata = metadata;

      // Add subtitles if available
      if (mediaInfo.subtitles && mediaInfo.subtitles.length > 0) {
        castMediaInfo.tracks = mediaInfo.subtitles.map((sub, index) => {
          const track = new cast.framework.messages.Track(
            index,
            cast.framework.messages.TrackType.TEXT
          );
          track.trackContentId = sub.src;
          track.trackContentType = 'text/vtt';
          track.subtype = cast.framework.messages.TextTrackType.SUBTITLES;
          track.name = sub.label || 'Subtitles';
          track.language = sub.language || 'en';
          return track;
        });
      }

      const request = new cast.framework.messages.LoadRequest();
      request.media = castMediaInfo;
      request.currentTime = mediaInfo.currentTime || 0;
      request.autoplay = true;

      await session.loadMedia(request);
      
      toast.success(`Started casting to ${session.getCastDevice().friendlyName}`);
      return true;
    } catch (error) {
      console.error('Error starting cast:', error);
      toast.error('Failed to start casting');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [castConnected]);

  const stopCasting = useCallback(async () => {
    if (!castSession) return;

    try {
      await castSession.endSession(true);
      toast.info('Stopped casting');
    } catch (error) {
      console.error('Error stopping cast:', error);
      toast.error('Failed to stop casting');
    }
  }, [castSession]);

  const seekTo = useCallback((time) => {
    if (!mediaSession?.controller) return;

    mediaSession.controller.seek();
    mediaSession.player.currentTime = time;
  }, [mediaSession]);

  const playPause = useCallback(() => {
    if (!mediaSession?.controller) return;

    mediaSession.controller.playOrPause();
  }, [mediaSession]);

  const setVolume = useCallback((volume) => {
    if (!mediaSession?.controller) return;

    mediaSession.player.volumeLevel = Math.max(0, Math.min(1, volume));
    mediaSession.controller.setVolumeLevel();
  }, [mediaSession]);

  return {
    castAvailable,
    castConnected,
    castDevice,
    isLoading,
    mediaSession,
    startCasting,
    stopCasting,
    seekTo,
    playPause,
    setVolume
  };
};