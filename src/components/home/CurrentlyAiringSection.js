"use client";
import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faCalendarWeek, faStar, faArrowRight, faTv } from '@fortawesome/free-solid-svg-icons';

function CurrentlyAiringSection({ animeList }) {
  if (!animeList || animeList.length === 0) {
    return null;
  }

  // Format time until next episode
  const formatTimeUntil = (timeInSeconds) => {
    if (!timeInSeconds) return 'Coming soon';

    const days = Math.floor(timeInSeconds / 86400);
    const hours = Math.floor((timeInSeconds % 86400) / 3600);

    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="h-6 md:h-8 rounded-md w-[.35rem] md:w-[.3rem] bg-white"></span>
          <h2 className="text-xl md:text-2xl font-medium">On Air Now</h2>
          <div className="flex items-center bg-white px-2 py-1 rounded-full ml-2 text-xs text-black">
            <FontAwesomeIcon icon={faTv} className="mr-1" />
            <span>Weekly Updates</span>
          </div>
        </div>
        <Link href="/anime/catalog?status=RELEASING" className="flex items-center gap-1 text-sm text-white hover:underline">
          <span>View All</span>
          <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {animeList.map((anime) => (
          <Link href={`/anime/info/${anime.id}`} key={anime.id}>
            <div className="group relative bg-[#000000] rounded-xl overflow-hidden border border-[#333] hover:border-[#444] transition-all duration-300 flex transform hover:scale-[1.02] cursor-pointer">
              {/* Background image with gradient */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/70 z-10"></div>
                <img 
                  src={anime.bannerImage || anime.coverImage?.extraLarge || '/placeholder.jpg'} 
                  alt={anime.title?.english || anime.title?.romaji} 
                  className="w-full h-full object-cover opacity-40"
                />
              </div>
              
              {/* Content */}
              <div className="flex-1 p-4 md:p-5 relative z-20 flex">
                {/* Cover image */}
                <div className="w-24 h-32 md:w-28 md:h-40 flex-shrink-0 rounded-md overflow-hidden shadow-lg mr-4">
                  <img 
                    src={anime.coverImage?.extraLarge || anime.coverImage?.large || '/placeholder.jpg'}
                    alt={anime.title?.english || anime.title?.romaji}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                
                {/* Info */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1.5">
                    {anime.averageScore && (
                      <div className="bg-white/90 px-2 py-0.5 rounded text-black text-xs inline-flex items-center">
                        <FontAwesomeIcon icon={faStar} className="text-yellow-500 mr-1" />
                        {anime.averageScore / 10}
                      </div>
                    )}
                    <span className="text-xs text-gray-400">{anime.format?.replace(/_/g, ' ') || 'TV'}</span>
                  </div>
                  
                  <h3 className="text-base md:text-lg font-medium text-white mb-1.5 line-clamp-2 group-hover:text-gray-300 transition-colors">
                    {anime.title?.english || anime.title?.romaji}
                  </h3>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {anime.genres?.slice(0, 2).map((genre, index) => (
                      <span key={index} className="px-2 py-0.5 bg-[#111] text-gray-300 rounded-full text-xs">
                        {genre}
                      </span>
                    ))}
                  </div>
                  
                  {anime.nextAiringEpisode && (
                    <div className="flex items-center mt-auto">
                      <div className="mr-2">
                        <div className="text-xs text-gray-400">Next episode</div>
                        <div className="text-sm font-medium text-white flex items-center">
                          <FontAwesomeIcon icon={faCalendarWeek} className="text-white mr-1.5" />
                          EP {anime.nextAiringEpisode.episode} in {formatTimeUntil(anime.nextAiringEpisode.timeUntilAiring)}
                        </div>
                      </div>
                      <div className="ml-auto">
                        <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-black group-hover:bg-white transition-colors">
                          <FontAwesomeIcon icon={faPlay} size="sm" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default CurrentlyAiringSection; 