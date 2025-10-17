"use client"
import React, { useEffect, useRef, useState } from "react";
import "@vidstack/react/player/styles/base.css";
import styles from "./player.module.css";
import {
  MediaPlayer,
  MediaProvider,
  useMediaStore,
  useMediaRemote,
  Track,
  TextTrack,
} from "@vidstack/react";
import { useRouter } from "next/navigation";
import VideoProgressSave from '../../../utils/VideoProgressSave';
import { VideoLayout } from "./components/layouts/video-layout";
// import { DefaultVideoKeyboardActionDisplay } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/keyboard.css';
import { updateEp } from "@/lib/EpHistoryfunctions";
import { saveProgress } from "@/lib/AnilistUser";
import { FastForwardIcon, FastBackwardIcon } from '@vidstack/react/icons';
import { useSettings, useTitle, useNowPlaying } from '@/lib/store';
import { useStore } from "zustand";
import { toast } from 'sonner';

function Player({ dataInfo, id, groupedEp, src, session, savedep, subtitles, thumbnails, skiptimes }) {
  const settings = useStore(useSettings, (state) => state.settings);
  const animetitle = useStore(useTitle, (state) => state.animetitle);
  const nowPlaying = useStore(useNowPlaying, (state) => state.nowPlaying);
  const { epId, provider, epNum, subtype } = nowPlaying;
  const { previousep, currentep, nextep } = groupedEp || {};
  const [getVideoProgress, UpdateVideoProgress] = VideoProgressSave();
  const router = useRouter();

  // Prepare clean source URL for casting
  // Don't clean AnimePahe external proxy URLs
  const isAnimePaheProxy = typeof src === 'string' && src.includes('m8u3.thevoidborn001.workers.dev');
  const cleanSrc = isAnimePaheProxy ? src : (typeof src === 'string' ? src.replace('https://cors-anywhere-livid-six.vercel.app/', '')
    .replace('https://m3u8-proxy.xdsystemspotify.workers.dev/?url=', '')
    .replace('https://newproxy-chi.vercel.app/m3u8-proxy?url=', '')
    : src);

  // Extract actual m3u8 URL for Chromecast
  const getActualM3u8Url = (url) => {
    if (typeof url !== 'string') return url;
    const localProxyMatch = url.match(/\/api\/m3u8-proxy\?url=(.+)/);
    if (localProxyMatch) {
      return decodeURIComponent(localProxyMatch[1].split('&')[0]);
    }
    return url;
  };

  const actualM3u8Url = getActualM3u8Url(cleanSrc);
  const chromecastSrc = `https://m8u3.vercel.app/m3u8-proxy?url=${encodeURIComponent(actualM3u8Url)}`;

  const playerRef = useRef(null);
  const { duration, fullscreen } = useMediaStore(playerRef);
  const remote = useMediaRemote(playerRef);

  const [opbutton, setopbutton] = useState(false);
  const [edbutton, setedbutton] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progressSaved, setprogressSaved] = useState(false);
  const [castButtonAdded, setCastButtonAdded] = useState(false);
  let interval;

  // Check if Cast API is ready
  const isCastReady = () => {
    return window.chrome &&
      window.chrome.cast &&
      window.chrome.cast.isAvailable &&
      window.cast &&
      window.cast.framework;
  };

  useEffect(() => {
    playerRef.current?.subscribe(({ currentTime, duration }) => {

      if (skiptimes && skiptimes.length > 0) {
        const opStart = skiptimes[0]?.startTime ?? 0;
        const opEnd = skiptimes[0]?.endTime ?? 0;

        const epStart = skiptimes[1]?.startTime ?? 0;
        const epEnd = skiptimes[1]?.endTime ?? 0;

        const opButtonText = skiptimes[0]?.text || "";
        const edButtonText = skiptimes[1]?.text || "";

        setopbutton(opButtonText === "Opening" && (currentTime > opStart && currentTime < opEnd));
        setedbutton(edButtonText === "Ending" && (currentTime > epStart && currentTime < epEnd));

        if (settings?.autoskip) {
          if (opButtonText === "Opening" && currentTime > opStart && currentTime < opEnd) {
            Object.assign(playerRef.current ?? {}, { currentTime: opEnd });
            return null;
          }
          if (edButtonText === "Ending" && currentTime > epStart && currentTime < epEnd) {
            Object.assign(playerRef.current ?? {}, { currentTime: epEnd });
            return null;
          }
        }
      }
    })

  }, [settings]);

  function onCanPlay() {
    if (skiptimes && skiptimes.length > 0) {
      const track = new TextTrack({
        kind: 'chapters',
        default: true,
        label: 'English',
        language: 'en-US',
        type: 'json'
      });
      for (const cue of skiptimes) {
        track.addCue(new window.VTTCue(Number(cue.startTime), Number(cue.endTime), cue.text))
      }
      playerRef.current.textTracks.add(track);
    }
  }

  function onEnd() {
    // console.log("End")
    setIsPlaying(false);
  }

  function onEnded() {
    if (!nextep?.id) return;
    if (settings?.autonext) {
      router.push(
        `/anime/watch?id=${dataInfo?.id}&host=${provider}&epid=${nextep?.id || nextep?.episodeId}&ep=${nextep?.number}&type=${subtype}`
      );
    }
  }

  function onPlay() {
    // console.log("play")
    setIsPlaying(true);
  }

  function onPause() {
    // console.log("pause")
    setIsPlaying(false);
  }

  useEffect(() => {
    if (isPlaying) {
      interval = setInterval(async () => {
        const currentTime = playerRef.current?.currentTime
          ? Math.round(playerRef.current?.currentTime)
          : 0;

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
        })

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
    } else {
      clearInterval(interval);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isPlaying, duration]);

  function onLoadedMetadata() {
    if (savedep && savedep[0]) {
      const seekTime = savedep[0]?.timeWatched;
      if (seekTime) {
        remote.seek(seekTime - 3);
      }
    }
    else {
      const seek = getVideoProgress(dataInfo?.id);
      if (seek?.epNum === Number(epNum)) {
        const seekTime = seek?.timeWatched;
        const percentage = duration !== 0 ? seekTime / Math.round(duration) : 0;

        if (percentage >= 0.95) {
          remote.seek(0);
        } else {
          remote.seek(seekTime - 3);
        }
      }
    }
  }

  function onTimeUpdate() {
    const currentTime = playerRef.current?.currentTime;
    const timeToShowButton = duration - 8;
    const percentage = currentTime / duration;

    if (session && !progressSaved && percentage >= 0.9) {
      try {
        setprogressSaved(true); // Mark progress as saved
        saveProgress(session.user.token, dataInfo?.id || id, Number(epNum) || Number(currentep?.number));
      } catch (error) {
        console.error("Error saving progress:", error);
        toast.error("Error saving progress due to high traffic.");
      }
    }

    const nextButton = document.querySelector(".nextbtn");

    if (nextButton) {
      if (duration !== 0 && (currentTime > timeToShowButton && nextep?.id)) {
        nextButton.classList.remove("hidden");
      } else {
        nextButton.classList.add("hidden");
      }
    }
  }

  function onSourceChange() {
    if (fullscreen) {
      console.log("true")
    } else {
      console.log("false")
    }
  }

  function handleop() {
    console.log("Skipping Intro");
    Object.assign(playerRef.current ?? {}, { currentTime: skiptimes[0]?.endTime ?? 0 });
  }

  function handleed() {
    console.log("Skipping Outro");
    Object.assign(playerRef.current ?? {}, { currentTime: skiptimes[1]?.endTime ?? 0 });
  }

  // Handle custom cast button click
  useEffect(() => {
    const handleCastRequest = () => {
      if (!isCastReady()) {
        toast.error('Chromecast not available');
        return;
      }

      try {
        const castContext = window.cast.framework.CastContext.getInstance();
        const session = castContext.getCurrentSession();

        if (session) {
          castContext.endCurrentSession(true);
          toast.info('Disconnected from Chromecast');
        } else {
          castContext.requestSession().then(() => {
            const newSession = castContext.getCurrentSession();
            if (newSession) {
              console.log('Casting with proxy URL:', chromecastSrc);

              const mediaInfo = new window.chrome.cast.media.MediaInfo(chromecastSrc, 'application/x-mpegurl');
              mediaInfo.streamType = window.chrome.cast.media.StreamType.BUFFERED;
              mediaInfo.contentType = 'application/x-mpegurl';

              mediaInfo.metadata = new window.chrome.cast.media.GenericMediaMetadata();
              mediaInfo.metadata.title = currentep?.title || `EP ${epNum}` || 'Loading...';
              mediaInfo.metadata.subtitle = dataInfo?.title?.romaji || dataInfo?.title?.english || '';

              if (dataInfo?.coverImage?.extraLarge || dataInfo?.bannerImage) {
                mediaInfo.metadata.images = [{ url: dataInfo?.coverImage?.extraLarge || dataInfo?.bannerImage }];
              }

              let defaultSubtitleIndex = -1;
              if (subtitles && subtitles.length > 0) {
                mediaInfo.tracks = subtitles.map((sub, index) => {
                  const track = new window.chrome.cast.media.Track(index, window.chrome.cast.media.TrackType.TEXT);
                  track.trackContentId = sub.src;
                  track.trackContentType = 'text/vtt';
                  track.subtype = window.chrome.cast.media.TextTrackType.SUBTITLES;
                  track.name = sub.label;
                  track.language = sub.lang || 'en';

                  if ((sub.label.toLowerCase().includes('english') || sub.lang === 'en') && defaultSubtitleIndex === -1) {
                    defaultSubtitleIndex = index;
                  }

                  return track;
                });
              }

              const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
              request.currentTime = 0;
              request.autoplay = true;

              if (defaultSubtitleIndex >= 0) {
                request.activeTrackIds = [defaultSubtitleIndex];
              }

              request.textTrackStyle = new window.chrome.cast.media.TextTrackStyle();
              request.textTrackStyle.backgroundColor = '#00000080';
              request.textTrackStyle.edgeType = window.chrome.cast.media.TextTrackEdgeType.DROP_SHADOW;
              request.textTrackStyle.fontFamily = 'SANS_SERIF';
              request.textTrackStyle.fontScale = 1.0;

              newSession.loadMedia(request).then(() => {
                console.log('Media loaded on Chromecast');
                toast.success('Casting to TV');
                playerRef.current?.pause();
              }).catch((error) => {
                console.error('Cast error:', error);
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
      } catch (error) {
        console.error('Cast error:', error);
        toast.error('Chromecast error');
      }
    };

    window.addEventListener('customCastRequest', handleCastRequest);

    return () => {
      window.removeEventListener('customCastRequest', handleCastRequest);
    };
  }, [chromecastSrc, subtitles, currentep, epNum, dataInfo, playerRef]);


  return (
    <MediaPlayer
      key={cleanSrc}
      ref={playerRef}
      playsInline
      aspectRatio={16 / 9}
      load={settings?.load || 'idle'}
      muted={settings?.audio || false}
      autoPlay={settings?.autoplay || false}
      title={currentep?.title || `EP ${epNum}` || 'Loading...'}
      className={`${styles.player} player relative`}
      crossOrigin={"anonymous"}
      streamType="on-demand"
      onEnd={onEnd}
      onEnded={onEnded}
      onCanPlay={onCanPlay}
      src={{
        src: cleanSrc,
        type: "application/x-mpegurl",
        // Add poster image for cast devices
        poster: dataInfo?.coverImage?.extraLarge || dataInfo?.bannerImage || '',
      }}
      onPlay={onPlay}
      onPause={onPause}
      onLoadedMetadata={onLoadedMetadata}
      onTimeUpdate={onTimeUpdate}
      onSourceChange={onSourceChange}
    >
      <MediaProvider>
        {subtitles && subtitles?.map((track) => (
          <Track {...track} key={track.src} />
        ))}
      </MediaProvider>
      {opbutton && <button onClick={handleop} className='absolute bottom-[70px] sm:bottom-[83px] right-4 z-[40] bg-white text-black py-2 px-3 rounded-[6px] font-medium text-[15px]'>Skip Opening</button>}
      {edbutton && <button onClick={handleed} className='absolute bottom-[70px] sm:bottom-[83px] right-4 z-[40] bg-white text-black py-2 px-3 rounded-[6px] font-medium text-[15px]'>Skip Ending</button>}
      <VideoLayout
        subtitles={subtitles}
        thumbnails={thumbnails ? process.env.NEXT_PUBLIC_PROXY_URI + '/' + thumbnails[0]?.src : ""}
        groupedEp={groupedEp}
      />
      {/* <DefaultVideoKeyboardActionDisplay
        icons={{
          Play: null,
          Pause: null,
          Mute: null,
          VolumeUp: null,
          VolumeDown: null,
          EnterFullscreen: null,
          ExitFullscreen: null,
          EnterPiP: null,
          ExitPiP: null,
          CaptionsOn: null,
          CaptionsOff: null,
          SeekForward: FastForwardIcon,
          SeekBackward: FastBackwardIcon,
        }}
      /> */}
    </MediaPlayer>
  )
}

export default Player
