"use client"
import React, { useEffect, useState, useRef } from 'react';
import styles from '../../styles/Herosection.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { useSettings, useTitle } from '@/lib/store';
import { useStore } from 'zustand';
import { Button, Tooltip } from '@nextui-org/react';

function Herosection({ data }) {
  const settings = useStore(useSettings, (state) => state.settings);
  const [populardata, setpopulardata] = useState(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [muted, setMuted] = useState(!settings?.audio);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isAutoSliding, setIsAutoSliding] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const animetitle = useStore(useTitle, (state) => state.animetitle);
  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const carouselRef = useRef(null);
  const autoSlideRef = useRef(null);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const getPopular = () => {
      if (data && Array.isArray(data) && data.length > 0) {
        const filteredData = data.filter(item => item.id !== 21 && item.bannerImage !== null && item.status !== 'NOT_YET_RELEASED');
        setpopulardata(filteredData[currentIndex]);
      }
    };
    getPopular();
  }, [data, currentIndex]);

  // Auto-slide functionality - triggered by video end or timer for images
  useEffect(() => {
    // Remove any existing timer
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
    }

    // Set up timer for image-only slides or when video is not available
    if (isAutoSliding && data && data.length > 1) {
      const hasVideo = populardata?.trailer?.id && settings.herotrailer === true;
      
      if (!hasVideo) {
        // For image-only slides, use a timer
        autoSlideRef.current = setInterval(() => {
          setCurrentIndex(prev => (prev + 1) % data.length);
          setVideoEnded(false);
          setMuted(!settings?.audio);
        }, 8000); // 8 seconds for image slides
      }
    }

    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
    };
  }, [isAutoSliding, data, currentIndex, populardata, settings?.herotrailer]);

  // Handle video end to trigger next slide
  useEffect(() => {
    if (videoEnded && isAutoSliding && data && data.length > 1) {
      // Clear any existing timer when video ends
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
      
      // Wait a moment after video ends, then slide to next
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % data.length);
        setVideoEnded(false); // Reset video state for next anime
        setMuted(!settings?.audio);
      }, 1000); // 1 second delay after video ends
    }
  }, [videoEnded, isAutoSliding, data, settings?.audio]);

  // Load YouTube IFrame API
  useEffect(() => {
    console.log('HeroSection: Checking video conditions', {
      hasTrailer: !!populardata?.trailer?.id,
      trailerId: populardata?.trailer?.id,
      herotrailerSetting: settings?.herotrailer,
      settings: settings
    });

    if (populardata?.trailer?.id && settings?.herotrailer === true) {
      console.log('HeroSection: Loading YouTube player for trailer:', populardata.trailer.id);
      if (window.YT) {
        loadPlayer();
      } else {
        console.log('HeroSection: Loading YouTube API script');
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        window.onYouTubeIframeAPIReady = loadPlayer;
      }
    } else {
      console.log('HeroSection: Video conditions not met, showing image');
    }
  }, [populardata, settings?.herotrailer]);

  function loadPlayer() {
    if (populardata?.trailer?.id && playerContainerRef.current && settings?.herotrailer === true) {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      
      // Create a div element that will contain the actual YouTube iframe
      const playerElement = document.createElement('div');
      playerElement.id = 'youtube-player-' + Date.now();
      playerContainerRef.current.innerHTML = ''; // Clear any existing content
      playerContainerRef.current.appendChild(playerElement);
      
      // Use a much larger size to ensure full coverage with no blank spaces
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Make the player slightly larger than viewport to ensure coverage while maintaining clarity
      const playerWidth = viewportWidth * 1.5; // 1.5x viewport width
      const playerHeight = viewportHeight * 1.5; // 1.5x viewport height
      

      playerRef.current = new window.YT.Player(playerElement.id, {
        videoId: populardata.trailer.id,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          loop: 1,
          playlist: populardata.trailer.id,
          disablekb: 1, // Disable keyboard controls
          fs: 0, // Disable fullscreen button
        },
        events: {
          onReady: (event) => {
            if (muted) {
              event.target.mute();
            } else {
              event.target.unMute();
            }
            
            // Apply CSS to the iframe to ensure it covers the entire container
            const iframe = playerContainerRef.current.querySelector('iframe');
            if (iframe) {
              iframe.style.position = 'absolute';
              iframe.style.top = '50%';
              iframe.style.left = '50%';
              iframe.style.width = playerWidth + 'px';
              iframe.style.height = playerHeight + 'px';
              iframe.style.transform = 'translate(-50%, -50%)';
              iframe.style.pointerEvents = 'none';
              iframe.style.minWidth = '100%';
              iframe.style.minHeight = '100%';
            }
          },
          onStateChange: (event) => {
            // When video ends (state = 0), set videoEnded to true
            if (event.data === 0) {
              setVideoEnded(true);
            }
          },
          onError: (error) => {
            console.error('YouTube Player Error:', error);
            setVideoEnded(true); // Fallback to image if video fails
          }
        },
      });
    } else {
      console.warn('Cannot load player: Missing trailer data, container ref, or hero trailer setting');
      setVideoEnded(true); // Fallback to image if video cannot load
    }
  }

  const handleToggleMute = () => {
    setMuted(prev => {
      const newMuted = !prev;
      if (playerRef.current) {
        if (newMuted) {
          playerRef.current.mute();
        } else {
          playerRef.current.unMute();
        }
      }
      return newMuted;
    });
  };

  const navigateCarousel = (direction) => {
    setIsNavigating(true);
    if (direction === 'next') {
      setCurrentIndex(prev => (prev + 1) % (data?.length || 1));
    } else {
      setCurrentIndex(prev => (prev - 1 + (data?.length || 1)) % (data?.length || 1));
    }
    
    // Reset video state when changing anime
    setVideoEnded(false);
    setMuted(!settings?.audio);
    
    // Add a small delay to show transition
    setTimeout(() => {
      setIsNavigating(false);
    }, 500);
  };
  
  // Get maturity rating based on genres or tags
  const getMaturityRating = () => {
    if (!populardata?.genres) return 'PG-13';
    
    const adultGenres = ['Horror', 'Gore', 'Ecchi', 'Adult', 'Hentai'];
    const hasAdultContent = populardata.genres.some(genre => 
      adultGenres.includes(genre)
    );
    
    return hasAdultContent ? 'R' : 'PG-13';
  };

  const Month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sep", "Oct", "Nov", "Dec"]

  return (
    <div 
      ref={carouselRef}
      className={`relative w-full h-screen overflow-hidden bg-black transition-opacity duration-500 ${isNavigating ? 'opacity-70' : 'opacity-100'} mt-0 sm:mt-0 md:mt-0`}
    >
      {/* Background image */}
      <div className="absolute inset-0 w-full h-full">
        {populardata &&
          <Image
            src={populardata?.bannerImage}
            alt={populardata?.title?.[animetitle] || populardata?.title?.romaji}
            fill
            priority={true}
            className="object-cover transition-transform duration-700 ease-out"
          />
        }
      </div>
      
      {/* YouTube video container */}
      {populardata?.trailer?.id && settings?.herotrailer === true && !videoEnded && (
        <div 
          ref={playerContainerRef}
          className="absolute inset-0 w-full h-full z-0"
          style={{ pointerEvents: 'none' }}
        />
      )}
      
      {/* Netflix-style gradient overlays - reduced opacity for clearer background */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/30 to-transparent z-10"></div>
      <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-black/40 via-black/20 to-transparent z-10"></div>
      <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-black/40 to-transparent z-10"></div>
      <div className="absolute inset-y-0 right-0 w-1/8 bg-gradient-to-l from-black/20 to-transparent z-10"></div>
      
      {/* Content container */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 sm:p-6 md:p-8 lg:p-12 xl:p-20 pb-8 md:w-3/4 lg:w-2/3 xl:w-1/2">
        {/* Netflix-style navigation indicator dots - Centered at Bottom */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-1">
          {data && Array.from({ length: Math.min(data.length, 5) }, (_, i) => (
            <button 
              key={i} 
              onClick={() => {
                setCurrentIndex(i);
                setIsAutoSliding(false); // Pause auto-slide when manually navigating
                setTimeout(() => setIsAutoSliding(true), 10000); // Resume after 10 seconds
              }}
              className={`w-2 h-2 sm:w-2 sm:h-2 md:w-2 md:h-2 lg:w-2 lg:h-2 xl:w-2 xl:h-2 max-[640px]:w-1.5 max-[640px]:h-1.5 rounded-full transition-all ${currentIndex === i ? 'bg-white scale-125 max-[640px]:scale-110' : 'bg-white/40'}`}
              aria-label={`Show anime ${i + 1}`}
            />
          ))}
        </div>
        
        {/* Trending badge and maturity rating */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="bg-white text-black text-xs font-bold px-2 py-1 rounded mr-3" style={{ fontSize: '10px' }}>
              TOP {currentIndex + 1}
            </div>
            <span className="text-white text-sm font-medium" style={{ fontSize: '10px' }}>TRENDING NOW</span>
          </div>
          
          {/* Netflix-style maturity rating - show on mobile too */}
          <div className="flex items-center">
            <div className="border border-white/50 text-white text-xs font-bold px-2 py-1" style={{ fontSize: '10px' }}>
              {getMaturityRating()}
            </div>
          </div>
        </div>
        
        {/* Enhanced title with animated underline - smaller font */}
        <div className="relative mb-4 sm:mb-6">
          <h1 className="text-white text-2xl sm:text-2xl md:text-2xl lg:text-3xl font-bold leading-tight drop-shadow-lg" style={{ fontSize: '14px' }}>
            {populardata?.title?.[animetitle] || populardata?.title?.romaji}
          </h1>
          <div className="absolute -bottom-2 left-0 w-12 sm:w-16 h-1 bg-white rounded"></div>
        </div>
        
        {/* Enhanced metadata row with better visual hierarchy */}
        <div className="flex flex-wrap items-center text-sm text-white/90 mb-4 gap-x-4 gap-y-2 backdrop-blur-sm bg-black/10 p-2 rounded" style={{ fontSize: '10px' }}>
          <span className="flex items-center bg-green-500/20 text-green-400 font-medium px-2 py-1 rounded text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 sm:w-4 sm:h-4 mr-1">
              <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
            </svg>
            {populardata?.averageScore ? `${populardata.averageScore / 10}/10` : 'N/A'}
          </span>
          <span className="flex items-center text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-white/70">
              <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
              <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
            </svg>
            {populardata?.startDate?.year}
          </span>
          <span className="border border-white/40 px-2 py-0.5 text-xs rounded bg-white/10">{populardata?.format || 'TV'}</span>
          <span className="flex items-center text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-white/70">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm14.024-.983a1.125 1.125 0 010 1.966l-5.603 3.113A1.125 1.125 0 019 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113z" clipRule="evenodd" />
            </svg>
            {populardata?.nextAiringEpisode?.episode - 1 || populardata?.episodes || 'Unknown'} Episodes
          </span>
          <span className={`flex items-center text-xs ${populardata?.status === 'RELEASING' ? 'text-green-400 bg-green-500/10 px-2 py-0.5 rounded' : 'text-white/80'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 sm:w-4 sm:h-4 mr-1">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
            </svg>
            {populardata?.status}
          </span>
        </div>
        
        {/* Enhanced description with better styling - smaller font */}
        <div className="backdrop-blur-sm bg-black/20 p-2 rounded mb-4 border-l-2 border-white">
          <p className="text-white/90 text-sm md:text-base line-clamp-2 italic" style={{ fontSize: '10px' }}>
            {populardata?.description?.replace(/<.*?>/g, '')}
          </p>
        </div>
        
        {/* Enhanced Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link href={`/anime/info/${populardata?.id}`}>
            <Button 
              className="bg-white text-black hover:bg-gray-200 font-medium rounded-md px-4 py-2 flex items-center gap-1 shadow-md transition-transform hover:scale-105 text-sm"
              startContent={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 sm:w-4 sm:h-4">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                </svg>
              }
            >
              Play
            </Button>
          </Link>
          
          <Link href={`/anime/info/${populardata?.id}`}>
            <Button 
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/30 rounded-md px-3 py-2 font-medium flex items-center gap-1 shadow-md transition-transform hover:scale-105 text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 sm:w-4 sm:h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              Info
            </Button>
          </Link>
          

          
          {populardata?.trailer?.id && settings.herotrailer === true && !videoEnded && (
            <Tooltip content={muted ? "Unmute" : "Mute"}>
              <Button 
                isIconOnly
                onClick={handleToggleMute} 
                className="bg-gray-800/60 text-white hover:bg-gray-700/80 rounded-full w-10 h-10 flex items-center justify-center border border-white/30"
              >
                {muted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.531V19.94a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.395C2.806 8.757 3.63 8.25 4.51 8.25H6.75z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                  </svg>
                )}
              </Button>
            </Tooltip>
          )}
        </div>
        
        {/* Enhanced Genres and additional metadata */}
        <div className="mt-6 flex flex-col space-y-3">
          {/* Enhanced Genres row - filtered to remove specific genres */}
          {populardata?.genres && populardata.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {populardata.genres
                .filter(genre => !['Action', 'Comedy', 'Drama', 'Fantasy'].includes(genre))
                .slice(0, 4)
                .map((genre, index) => (
                <Link key={index} href={`/genre/${genre.toLowerCase()}`}>
                  <span className="text-xs bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-white/90 hover:text-white hover:bg-white/20 transition-colors duration-300 border border-white/10">
                    {genre}
                  </span>
                </Link>
              ))}
            </div>
          )}
          
          {/* Enhanced Studios display */}
          {populardata?.studios?.nodes && populardata.studios.nodes.length > 0 && (
            <div className="flex items-center text-xs text-white/80 bg-black/20 backdrop-blur-sm px-3 py-2 rounded border-r-2 border-white">
              <span className="mr-2 font-semibold">Studios:</span>
              <div className="flex flex-wrap gap-1">
                {populardata.studios.nodes.map((studio, index) => (
                  <Link key={index} href={`/studio/${studio.id}`}>
                    <span className="hover:text-white hover:underline transition-all duration-300">
                      {studio.name}{index < populardata.studios.nodes.length - 1 ? ', ' : ''}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Herosection;
