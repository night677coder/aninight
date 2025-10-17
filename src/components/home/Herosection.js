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
  const animetitle = useStore(useTitle, (state) => state.animetitle);
  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const carouselRef = useRef(null);

  useEffect(() => {
    const getPopular = () => {
      if (data && Array.isArray(data) && data.length > 0) {
        const filteredData = data.filter(item => item.id !== 21 && item.bannerImage !== null && item.status !== 'NOT_YET_RELEASED');
        setpopulardata(filteredData[currentIndex]);
      }
    };
    getPopular();
  }, [data, currentIndex]);

  // Load YouTube IFrame API
  useEffect(() => {
    if (populardata?.trailer?.id && settings.herotrailer === true) {
      if (window.YT) {
        loadPlayer();
      } else {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        window.onYouTubeIframeAPIReady = loadPlayer;
      }
    }
  }, [populardata, settings.herotrailer]);

  function loadPlayer() {
    if (populardata?.trailer?.id && playerContainerRef.current && settings.herotrailer === true) {
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
      
      // Make the player slightly larger than the viewport to ensure coverage while maintaining clarity
      const playerWidth = viewportWidth * 1.2; // 1.2x the viewport width
      const playerHeight = viewportHeight * 1.2; // 1.2x the viewport height
      
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
            }
          },
          onStateChange: (event) => {
            // When video ends (state = 0), set videoEnded to true
            if (event.data === 0) {
              setVideoEnded(true);
            }
          },
          onError: () => {
            setVideoEnded(true);
          }
        },
      });
      
      // Handle window resize to maintain full coverage
      const handleResize = () => {
        const iframe = playerContainerRef.current?.querySelector('iframe');
        if (iframe) {
          const newViewportWidth = window.innerWidth;
          const newViewportHeight = window.innerHeight;
          
          // Update iframe dimensions to ensure full coverage while maintaining clarity
          iframe.style.width = (newViewportWidth * 1.2) + 'px';
          iframe.style.height = (newViewportHeight * 1.2) + 'px';
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      // Clean up event listener when component unmounts or video changes
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }

  const handleToggleMute = () => {
    setMuted((prev) => {
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
      className={`relative w-full h-[80vh] overflow-hidden bg-black transition-opacity duration-500 ${isNavigating ? 'opacity-70' : 'opacity-100'}`}
    >
      {/* Background video or image with gradient overlays */}
      {populardata?.trailer?.id && settings.herotrailer === true && !videoEnded ? (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div ref={playerContainerRef} className={styles.herovideo}></div>
        </div>
      ) : (
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
      )}
      
      {/* Fixed Carousel Navigation Buttons for all devices */}
      <div className="absolute inset-y-0 left-0 z-30 flex items-center pl-2 sm:pl-4">
        <button 
          onClick={() => navigateCarousel('prev')} 
          className="bg-black/60 hover:bg-white/20 text-white w-10 h-14 sm:w-12 sm:h-16 flex items-center justify-center transition-all duration-300 rounded-md focus:outline-none border border-white/20 touch-manipulation"
          disabled={isNavigating}
          aria-label="Previous anime"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
      </div>
      
      <div className="absolute inset-y-0 right-0 z-30 flex items-center pr-2 sm:pr-4">
        <button 
          onClick={() => navigateCarousel('next')} 
          className="bg-black/60 hover:bg-white/20 text-white w-10 h-14 sm:w-12 sm:h-16 flex items-center justify-center transition-all duration-300 rounded-md focus:outline-none border border-white/20 touch-manipulation"
          disabled={isNavigating}
          aria-label="Next anime"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
      
      {/* Netflix-style gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent z-10"></div>
      <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10"></div>
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-black/70 to-transparent z-10"></div>
      <div className="absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-black/40 to-transparent z-10"></div>
      
      {/* Content container */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-8 md:p-16 pb-12 md:w-2/3 lg:w-1/2">
        {/* Netflix-style navigation indicator dots */}
        <div className="absolute top-8 right-8 hidden md:flex items-center space-x-1">
          {data && Array.from({ length: Math.min(data.length, 5) }, (_, i) => (
            <button 
              key={i} 
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${currentIndex === i ? 'bg-white scale-125' : 'bg-white/40'}`}
              aria-label={`Show anime ${i + 1}`}
            />
          ))}
        </div>
        
        {/* Trending badge and maturity rating */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="bg-white text-black text-xs font-bold px-2 py-1 rounded mr-2">
              TOP {currentIndex + 1}
            </div>
            <span className="text-white text-sm font-medium">TRENDING NOW</span>
          </div>
          
          {/* Netflix-style maturity rating */}
          <div className="hidden md:flex items-center">
            <div className="border border-white/50 text-white text-xs font-bold px-2 py-1 mr-2">
              {getMaturityRating()}
            </div>
          </div>
        </div>
        
        {/* Enhanced title with animated underline - reduced size */}
        <div className="relative mb-4">
          <h1 className="text-white text-2xl md:text-4xl font-bold leading-tight drop-shadow-lg">
            {populardata?.title?.[animetitle] || populardata?.title?.romaji}
          </h1>
          <div className="absolute -bottom-2 left-0 w-16 h-1 bg-white rounded"></div>
        </div>
        
        {/* Enhanced metadata row with better visual hierarchy */}
        <div className="flex flex-wrap items-center text-sm text-white/90 mb-5 gap-x-4 gap-y-2 backdrop-blur-sm bg-black/10 p-2 rounded">
          <span className="flex items-center bg-green-500/20 text-green-400 font-medium px-2 py-1 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
              <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
            </svg>
            {populardata?.averageScore ? `${populardata.averageScore / 10}/10` : 'N/A'}
          </span>
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1 text-white/70">
              <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
              <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
            </svg>
            {populardata?.startDate?.year}
          </span>
          <span className="border border-white/40 px-2 py-0.5 text-xs rounded-sm bg-white/10">{populardata?.format || 'TV'}</span>
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1 text-white/70">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm14.024-.983a1.125 1.125 0 010 1.966l-5.603 3.113A1.125 1.125 0 019 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113z" clipRule="evenodd" />
            </svg>
            {populardata?.nextAiringEpisode?.episode - 1 || populardata?.episodes || 'Unknown'} Episodes
          </span>
          <span className={`flex items-center ${populardata?.status === 'RELEASING' ? 'text-green-400 bg-green-500/10 px-2 py-0.5 rounded' : 'text-white/80'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
            </svg>
            {populardata?.status}
          </span>
        </div>
        
        {/* Enhanced description with better styling - reduced size */}
        <div className="backdrop-blur-sm bg-black/20 p-2 rounded mb-4 border-l-2 border-white">
          <p className="text-white/90 text-xs md:text-sm line-clamp-2 italic">
            {populardata?.description?.replace(/<.*?>/g, '')}
          </p>
        </div>
        
        {/* Compact Action Buttons */}
        <div className="flex items-center gap-2">
          <Link href={`/anime/info/${populardata?.id}`}>
            <Button 
              className="bg-white text-black hover:bg-gray-200 font-medium rounded-md px-4 py-2 flex items-center gap-1 shadow-md transition-transform hover:scale-105 text-sm"
              startContent={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
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
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
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
          {/* Enhanced Genres row */}
          {populardata?.genres && populardata.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {populardata.genres.slice(0, 4).map((genre, index) => (
                <Link key={index} href={`/genre/${genre.toLowerCase()}`}>
                  <span className="text-xs bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-white/90 hover:text-white hover:bg-white/20 transition-colors duration-300 border border-white/10">
                    {genre}
                  </span>
                </Link>
              ))}
            </div>
          )}
          
          {/* Enhanced episode count or status indicator */}
          {populardata?.nextAiringEpisode && (
            <div className="flex items-center">
              <div className="bg-white text-black text-xs px-2 py-1 mr-2 rounded-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 mr-1">
                  <path d="M5.85 3.5a.75.75 0 00-1.117-1 9.719 9.719 0 00-2.348 4.876.75.75 0 001.479.248A8.219 8.219 0 015.85 3.5zM19.267 2.5a.75.75 0 10-1.118 1 8.22 8.22 0 011.987 4.124.75.75 0 001.48-.248A9.72 9.72 0 0019.266 2.5z" />
                  <path fillRule="evenodd" d="M12 2.25A6.75 6.75 0 005.25 9v.75a8.217 8.217 0 01-2.119 5.52.75.75 0 00.298 1.206c1.544.57 3.16.99 4.831 1.243a3.75 3.75 0 107.48 0 24.583 24.583 0 004.83-1.244.75.75 0 00.298-1.205 8.217 8.217 0 01-2.118-5.52V9A6.75 6.75 0 0012 2.25zM9.75 18c0-.034 0-.067.002-.1a25.05 25.05 0 004.496 0l.002.1a2.25 2.25 0 11-4.5 0z" clipRule="evenodd" />
                </svg>
                NEW
              </div>
              <span className="text-white text-xs backdrop-blur-sm bg-black/20 px-2 py-1 rounded-sm">
                Episode {populardata.nextAiringEpisode.episode} coming soon
              </span>
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
