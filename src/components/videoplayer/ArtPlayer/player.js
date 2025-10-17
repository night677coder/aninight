"use client"
import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";
import Artplayer from "artplayer";
import { useRouter } from "next/navigation";
import VideoProgressSave from '@/utils/VideoProgressSave';
import { updateEp } from "@/lib/EpHistoryfunctions";
import { saveProgress } from "@/lib/AnilistUser";
import { useSettings, useTitle, useNowPlaying } from '@/lib/store';
import { useStore } from "zustand";
import { toast } from 'sonner';
import "./ArtPlayer.css";

const KEY_CODES = {
  M: "m",
  I: "i",
  F: "f",
  V: "v",
  SPACE: " ",
  ARROW_UP: "arrowup",
  ARROW_DOWN: "arrowdown",
  ARROW_RIGHT: "arrowright",
  ARROW_LEFT: "arrowleft",
};

Artplayer.LOG_VERSION = false;
Artplayer.CONTEXTMENU = false;

function Player({ dataInfo, id, groupedEp, src, session, savedep, subtitles, thumbnails, skiptimes }) {
  const settings = useStore(useSettings, (state) => state.settings);
  const animetitle = useStore(useTitle, (state) => state.animetitle);
  const nowPlaying = useStore(useNowPlaying, (state) => state.nowPlaying);
  const { epId, provider, epNum, subtype } = nowPlaying;
  const { previousep, currentep, nextep } = groupedEp || {};
  const [getVideoProgress, UpdateVideoProgress] = VideoProgressSave();
  const router = useRouter();
  const artRef = useRef(null);
  const [art, setArt] = useState(null);
  const [progressSaved, setProgressSaved] = useState(false);
  let interval;

  // Check if this is an AnimePahe external proxy URL
  const isAnimePaheProxy = typeof src === 'string' && src.includes('m8u3.thevoidborn001.workers.dev');
  
  // Prepare clean source URL for player
  // Don't clean AnimePahe external proxy URLs
  const cleanSrc = isAnimePaheProxy ? src : (typeof src === 'string' ? src.replace('https://cors-anywhere-livid-six.vercel.app/', '')
                                                .replace('https://m3u8-proxy.xdsystemspotify.workers.dev/?url=', '')
                                                .replace('https://newproxy-chi.vercel.app/m3u8-proxy?url=', '')
                                           : src);
  
  // Extract actual m3u8 URL for Chromecast (remove any local proxy)
  const getActualM3u8Url = (url) => {
    if (typeof url !== 'string') return url;
    
    // If it's AnimePahe external proxy, use it directly for Chromecast
    if (url.includes('m8u3.thevoidborn001.workers.dev')) {
      return url;
    }
    
    // Check if URL is a local proxy URL
    const localProxyMatch = url.match(/\/api\/m3u8-proxy\?url=(.+)/);
    if (localProxyMatch) {
      // Extract and decode the actual m3u8 URL
      return decodeURIComponent(localProxyMatch[1].split('&')[0]);
    }
    
    return url;
  };
  
  const actualM3u8Url = getActualM3u8Url(cleanSrc);
  
  // Prepare proxied URL for Chromecast
  // If already using AnimePahe proxy, use it directly; otherwise use m8u3.vercel.app
  const chromecastSrc = isAnimePaheProxy ? actualM3u8Url : `https://m8u3.vercel.app/m3u8-proxy?url=${encodeURIComponent(actualM3u8Url)}`;
  
  // Debug logging
  console.log('[ArtPlayer] Original src:', src);
  console.log('[ArtPlayer] Is AnimePahe proxy:', isAnimePaheProxy);
  console.log('[ArtPlayer] Clean src:', cleanSrc);
  console.log('[ArtPlayer] Chromecast URL:', chromecastSrc);

  const createChapters = () => {
    const chapters = [];
    if (skiptimes && skiptimes.length > 0) {
      const opSkip = skiptimes.find(skip => skip.text === "Opening");
      const edSkip = skiptimes.find(skip => skip.text === "Ending");
      
      if (opSkip) {
        chapters.push({ 
          start: opSkip.startTime, 
          end: opSkip.endTime, 
          title: "intro" 
        });
      }
      
      if (edSkip) {
        chapters.push({ 
          start: edSkip.startTime, 
          end: edSkip.endTime, 
          title: "outro" 
        });
      }
    }
    return chapters;
  };

  const handleKeydown = (event) => {
    if (!art) return;
    
    const tagName = event.target.tagName.toLowerCase();
    if (tagName === "input" || tagName === "textarea") return;

    switch (event.key.toLowerCase()) {
      case KEY_CODES.M:
        art.muted = !art.muted;
        break;
      case KEY_CODES.I:
        art.pip = !art.pip;
        break;
      case KEY_CODES.F:
        event.preventDefault();
        event.stopPropagation();
        art.fullscreen = !art.fullscreen;
        break;
      case KEY_CODES.V:
        event.preventDefault();
        event.stopPropagation();
        art.subtitle.show = !art.subtitle.show;
        break;
      case KEY_CODES.SPACE:
        event.preventDefault();
        event.stopPropagation();
        art.playing ? art.pause() : art.play();
        break;
      case KEY_CODES.ARROW_UP:
        event.preventDefault();
        event.stopPropagation();
        art.volume = Math.min(art.volume + 0.1, 1);
        break;
      case KEY_CODES.ARROW_DOWN:
        event.preventDefault();
        event.stopPropagation();
        art.volume = Math.max(art.volume - 0.1, 0);
        break;
      case KEY_CODES.ARROW_RIGHT:
        event.preventDefault();
        event.stopPropagation();
        art.currentTime = Math.min(art.currentTime + 10, art.duration);
        break;
      case KEY_CODES.ARROW_LEFT:
        event.preventDefault();
        event.stopPropagation();
        art.currentTime = Math.max(art.currentTime - 10, 0);
        break;
      default:
        break;
    }
  };

  const playM3u8 = (video, url, art) => {
    if (Hls.isSupported()) {
      if (art.hls) art.hls.destroy();
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      art.hls = hls;

      art.on("destroy", () => hls.destroy());

      video.addEventListener("timeupdate", () => {
        const currentTime = Math.round(video.currentTime);
        const duration = Math.round(video.duration);
        
        // Auto skip intro/outro if enabled
        if (settings?.autoskip && skiptimes && skiptimes.length > 0) {
          const opSkip = skiptimes.find(skip => skip.text === "Opening");
          const edSkip = skiptimes.find(skip => skip.text === "Ending");
          
          if (opSkip && currentTime > opSkip.startTime && currentTime < opSkip.endTime) {
            art.currentTime = opSkip.endTime;
          }
          
          if (edSkip && currentTime > edSkip.startTime && currentTime < edSkip.endTime) {
            art.currentTime = edSkip.endTime;
          }
        }
        
        // Auto next episode
        if (duration > 0) {
          if (currentTime >= duration - 1) {
            art.pause();
            if (nextep?.id && settings?.autonext) {
              router.push(
                `/anime/watch?id=${dataInfo?.id}&host=${provider}&epid=${nextep?.id || nextep?.episodeId}&ep=${nextep?.number}&type=${subtype}`
              );
            }
          }
          
          // Show next episode button
          const timeToShowButton = duration - 8;
          if (duration !== 0 && (currentTime > timeToShowButton && nextep?.id)) {
            const nextButton = document.querySelector(".art-next-button");
            if (nextButton) nextButton.style.display = "flex";
          }
        }
        
        // Save progress to Anilist
        const percentage = currentTime / duration;
        if (session && !progressSaved && percentage >= 0.9) {
          try {
            setProgressSaved(true);
            saveProgress(session.user.token, dataInfo?.id || id, Number(epNum) || Number(currentep?.number));
          } catch (error) {
            console.error("Error saving progress:", error);
            toast.error("Error saving progress due to high traffic.");
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      // Same event listener for native HLS support
      video.addEventListener("timeupdate", () => {
        // Same logic as above
      });
    } else {
      console.log("Unsupported playback format: m3u8");
    }
  };

  useEffect(() => {
    if (!cleanSrc || !artRef.current) return;
    
    const iframeUrl = null; // Add streaming source info if needed
    const headers = { Referer: "https://megacloud.club/" };
    
    // Check if Cast API is ready
    const isCastReady = () => {
      return window.chrome && 
             window.chrome.cast && 
             window.chrome.cast.isAvailable &&
             window.cast &&
             window.cast.framework;
    };
    
    const options = {
      container: artRef.current,
      url: cleanSrc,
      type: "m3u8",
      title: currentep?.title || `EP ${epNum}` || 'Loading...',
      poster: dataInfo?.coverImage?.extraLarge || dataInfo?.bannerImage || '',
      volume: 1,
      autoplay: settings?.autoplay || false,
      muted: settings?.audio || false,
      pip: true,
      autoSize: true,
      autoMini: true,
      screenshot: true,
      setting: true,
      loop: false,
      flip: true,
      playbackRate: true,
      aspectRatio: true,
      fullscreen: true,
      fullscreenWeb: false,
      subtitleOffset: true,
      miniProgressBar: true,
      mutex: true,
      backdrop: true,
      playsInline: true,
      autoPlayback: true,
      airplay: true,
      theme: '#1a365d',
      lang: 'en',
      moreVideoAttr: {
        crossOrigin: 'anonymous',
      },
      customType: {
        m3u8: playM3u8,
      },
    };
    
    const player = new Artplayer(options);
    setArt(player);
    
    // Add custom Chromecast button
    const addChromecastButton = () => {
      if (!isCastReady()) return;
      
      try {
        const castContext = window.cast.framework.CastContext.getInstance();
        
        player.controls.add({
          name: 'chromecast',
          position: 'right',
          html: `<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path d="M1 18v3h3c0-1.66-1.34-3-3-3zm0-4v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7zm0-4v2c4.97 0 9 4.03 9 9h2c0-6.08-4.93-11-11-11zm20-7H3c-1.1 0-2 .9-2 2v3h2V5h18v14h-7v2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
          </svg>`,
          tooltip: 'Cast to TV',
          click: function() {
            const session = castContext.getCurrentSession();
            
            if (session) {
              // Disconnect
              castContext.endCurrentSession(true);
              const button = player.template.$player.querySelector('.art-control-chromecast');
              if (button) button.style.color = '';
              toast.info('Disconnected from Chromecast');
            } else {
              // Connect and cast
              castContext.requestSession().then(() => {
                const newSession = castContext.getCurrentSession();
                if (newSession) {
                  console.log('Cast session established, loading media...');
                  console.log('Chromecast URL:', chromecastSrc);
                  
                  const mediaInfo = new window.chrome.cast.media.MediaInfo(chromecastSrc, 'application/x-mpegurl');
                  
                  // Set streaming protocol type
                  mediaInfo.streamType = window.chrome.cast.media.StreamType.BUFFERED;
                  mediaInfo.contentType = 'application/x-mpegurl';
                  
                  // Add metadata
                  mediaInfo.metadata = new window.chrome.cast.media.GenericMediaMetadata();
                  mediaInfo.metadata.title = currentep?.title || `EP ${epNum}` || 'Loading...';
                  mediaInfo.metadata.subtitle = dataInfo?.title?.romaji || dataInfo?.title?.english || '';
                  
                  if (dataInfo?.coverImage?.extraLarge || dataInfo?.bannerImage) {
                    mediaInfo.metadata.images = [{
                      url: dataInfo?.coverImage?.extraLarge || dataInfo?.bannerImage
                    }];
                  }
                  
                  // Add subtitles if available
                  let defaultSubtitleIndex = -1;
                  if (subtitles && subtitles.length > 0) {
                    console.log('Adding subtitles to Chromecast:', subtitles);
                    
                    mediaInfo.tracks = subtitles.map((sub, index) => {
                      const track = new window.chrome.cast.media.Track(index, window.chrome.cast.media.TrackType.TEXT);
                      track.trackContentId = sub.src;
                      track.trackContentType = 'text/vtt';
                      track.subtype = window.chrome.cast.media.TextTrackType.SUBTITLES;
                      track.name = sub.label;
                      track.language = sub.lang || 'en';
                      track.customData = null;
                      
                      // Find default English subtitle
                      if ((sub.label.toLowerCase().includes('english') || sub.lang === 'en') && defaultSubtitleIndex === -1) {
                        defaultSubtitleIndex = index;
                      }
                      
                      return track;
                    });
                    
                    console.log('Default subtitle index:', defaultSubtitleIndex);
                  }
                  
                  const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
                  
                  // Start from beginning to avoid timing issues
                  request.currentTime = 0;
                  request.autoplay = true;
                  
                  // Enable default subtitle track
                  if (defaultSubtitleIndex >= 0) {
                    request.activeTrackIds = [defaultSubtitleIndex];
                    console.log('Activating subtitle track:', defaultSubtitleIndex);
                  }
                  
                  // Add text track style for better subtitle display
                  request.textTrackStyle = new window.chrome.cast.media.TextTrackStyle();
                  request.textTrackStyle.backgroundColor = '#00000080';
                  request.textTrackStyle.edgeType = window.chrome.cast.media.TextTrackEdgeType.DROP_SHADOW;
                  request.textTrackStyle.fontFamily = 'SANS_SERIF';
                  request.textTrackStyle.fontScale = 1.0;
                  
                  // Add error listener to session
                  newSession.addMessageListener('urn:x-cast:com.google.cast.media', (namespace, message) => {
                    console.log('Cast message:', namespace, message);
                  });
                  
                  newSession.loadMedia(request).then((mediaSession) => {
                    console.log('Media loaded successfully on Chromecast');
                    const button = player.template.$player.querySelector('.art-control-chromecast');
                    if (button) button.style.color = '#1a365d';
                    toast.success('Casting to TV');
                    player.pause();
                    
                    // Listen for media status updates
                    if (mediaSession) {
                      mediaSession.addUpdateListener((isAlive) => {
                        if (!isAlive) {
                          console.log('Media session ended');
                          const btn = player.template.$player.querySelector('.art-control-chromecast');
                          if (btn) btn.style.color = '';
                        }
                      });
                    }
                  }).catch((error) => {
                    console.error('Cast load error:', error);
                    console.error('Error code:', error.code);
                    console.error('Error description:', error.description);
                    toast.error(`Failed to cast: ${error.description || 'Unknown error'}`);
                    castContext.endCurrentSession(true);
                  });
                }
              }).catch((error) => {
                if (error !== 'cancel') {
                  console.error('Cast session error:', error);
                  toast.error('Failed to connect to Chromecast');
                }
              });
            }
          },
        });
        
        // Update button state based on session
        castContext.addEventListener(
          window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
          (event) => {
            const button = player.template.$player.querySelector('.art-control-chromecast');
            if (button) {
              if (event.sessionState === 'SESSION_STARTED' || event.sessionState === 'SESSION_RESUMED') {
                button.style.color = '#1a365d';
              } else {
                button.style.color = '';
              }
            }
          }
        );
      } catch (error) {
        console.log('Chromecast button error:', error.message);
      }
    };
    
    // Add Chromecast button when ready
    if (isCastReady()) {
      addChromecastButton();
    } else {
      const checkCastAndAddButton = setInterval(() => {
        if (isCastReady() && player) {
          addChromecastButton();
          clearInterval(checkCastAndAddButton);
        }
      }, 500);
      
      setTimeout(() => clearInterval(checkCastAndAddButton), 10000);
    }
    
    // Set up subtitle tracks
    if (subtitles && subtitles.length > 0) {
      const defaultSubtitle = subtitles.find(
        (sub) => sub.label.toLowerCase() === "english" && sub.default
      ) || subtitles.find((sub) => sub.label.toLowerCase() === "english");
      
      if (defaultSubtitle) {
        player.subtitle.switch(defaultSubtitle.src, {
          name: defaultSubtitle.label,
        });
      }
      
      // Add subtitle options
      player.setting.add({
        name: 'Subtitles',
        selector: [
          {
            html: 'Display',
            switch: true,
            onSwitch: function (item) {
              player.subtitle.show = !item.switch;
              return !item.switch;
            },
          },
          ...subtitles.map((sub) => ({
            default: sub.label.toLowerCase() === "english" && sub === defaultSubtitle,
            html: sub.label,
            url: sub.src,
          })),
        ],
        onSelect: function (item) {
          player.subtitle.switch(item.url, { name: item.html });
          return item.html;
        },
      });
    }
    
    // Add skip buttons for intro/outro
    if (skiptimes && skiptimes.length > 0) {
      const opSkip = skiptimes.find(skip => skip.text === "Opening");
      const edSkip = skiptimes.find(skip => skip.text === "Ending");
      
      player.on('video:timeupdate', () => {
        const currentTime = player.currentTime;
        
        if (opSkip && currentTime > opSkip.startTime && currentTime < opSkip.endTime) {
          const skipIntroButton = document.querySelector('.art-skip-intro');
          if (!skipIntroButton) {
            const button = document.createElement('div');
            button.className = 'art-skip-intro';
            button.textContent = 'Skip Opening';
            button.onclick = () => {
              player.seek = opSkip.endTime;
            };
            player.template.$player.appendChild(button);
          }
        } else {
          const skipIntroButton = document.querySelector('.art-skip-intro');
          if (skipIntroButton) skipIntroButton.remove();
        }
        
        if (edSkip && currentTime > edSkip.startTime && currentTime < edSkip.endTime) {
          const skipOutroButton = document.querySelector('.art-skip-outro');
          if (!skipOutroButton) {
            const button = document.createElement('div');
            button.className = 'art-skip-outro';
            button.textContent = 'Skip Ending';
            button.onclick = () => {
              player.seek = edSkip.endTime;
            };
            player.template.$player.appendChild(button);
          }
        } else {
          const skipOutroButton = document.querySelector('.art-skip-outro');
          if (skipOutroButton) skipOutroButton.remove();
        }
      });
    }
    
    // Add next episode button
    if (nextep?.id) {
      const nextButton = document.createElement('div');
      nextButton.className = 'art-next-button';
      nextButton.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7"></path>
        </svg>
        <span>Next Episode</span>
      `;
      nextButton.style.display = 'none';
      nextButton.onclick = () => {
        router.push(
          `/anime/watch?id=${dataInfo?.id}&host=${provider}&epid=${nextep?.id || nextep?.episodeId}&ep=${nextep?.number}&type=${subtype}`
        );
      };
      player.template.$player.appendChild(nextButton);
    }
    
    // Load saved progress
    player.on('ready', () => {
      if (savedep && savedep[0]) {
        const seekTime = savedep[0]?.timeWatched;
        if (seekTime) {
          player.seek = seekTime - 3;
        }
      } else {
        const seek = getVideoProgress(dataInfo?.id);
        if (seek?.epNum === Number(epNum)) {
          const seekTime = seek?.timeWatched;
          const percentage = player.duration !== 0 ? seekTime / Math.round(player.duration) : 0;

          if (percentage >= 0.95) {
            player.seek = 0;
          } else {
            player.seek = seekTime - 3;
          }
        }
      }
    });
    
    // Set up progress saving
    player.on('play', () => {
      interval = setInterval(async () => {
        const currentTime = Math.round(player.currentTime);
        const duration = Math.round(player.duration);

        await updateEp({
          userName: session?.user?.name,
          aniId: String(dataInfo?.id) || String(id),
          aniTitle: dataInfo?.title?.[animetitle] || dataInfo?.title?.romaji,
          epTitle: currentep?.title || `EP ${epNum}`,
          image: currentep?.img || currentep?.image ||
            dataInfo?.bannerImage || dataInfo?.coverImage?.extraLarge || '',
          epId: epId,
          epNum: Number(epNum) || Number(currentep?.number),
          timeWatched: currentTime,
          duration: duration,
          provider: provider,
          nextepId: nextep?.id || null,
          nextepNum: nextep?.number || null,
          subtype: subtype
        });

        UpdateVideoProgress(dataInfo?.id || id, {
          aniId: String(dataInfo?.id) || String(id),
          aniTitle: dataInfo?.title?.[animetitle] || dataInfo?.title?.romaji,
          epTitle: currentep?.title || `EP ${epNum}`,
          image: currentep?.img || currentep?.image ||
            dataInfo?.bannerImage || dataInfo?.coverImage?.extraLarge || '',
          epId: epId,
          epNum: Number(epNum) || Number(currentep?.number),
          timeWatched: currentTime,
          duration: duration,
          provider: provider,
          nextepId: nextep?.id || nextep?.episodeId || null,
          nextepNum: nextep?.number || null,
          subtype: subtype,
          createdAt: new Date().toISOString(),
        });
      }, 5000);
    });
    
    player.on('pause', () => {
      clearInterval(interval);
    });
    
    // Add keyboard shortcuts
    document.addEventListener("keydown", handleKeydown);
    
    return () => {
      if (player && player.destroy) {
        player.destroy(false);
      }
      document.removeEventListener("keydown", handleKeydown);
      clearInterval(interval);
    };
  }, [cleanSrc, subtitles, skiptimes]);

  return <div ref={artRef} className="art-player-container"></div>;
}

export default Player; 
