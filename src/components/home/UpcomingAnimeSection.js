"use client";
import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faClock, faArrowRight } from '@fortawesome/free-solid-svg-icons';

function UpcomingAnimeSection({ animeList }) {
  if (!animeList || animeList.length === 0) {
    return null;
  }

  // Format date
  const formatDate = (dateObj) => {
    if (!dateObj || !dateObj.year) return 'TBA';
    const { year, month, day } = dateObj;
    return `${month}/${day}/${year}`;
  };

  // Format time until airing
  const formatTimeUntil = (timeInSeconds) => {
    if (!timeInSeconds) return 'Coming soon';

    const days = Math.floor(timeInSeconds / 86400);
    const hours = Math.floor((timeInSeconds % 86400) / 3600);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ${hours} hr${hours > 1 ? 's' : ''}`;
    }
    
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    return `${hours} hr${hours > 1 ? 's' : ''} ${minutes} min${minutes > 1 ? 's' : ''}`;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="h-6 md:h-8 rounded-md w-[.35rem] md:w-[.3rem] bg-white"></span>
          <h2 className="text-xl md:text-2xl font-medium">Coming Soon</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {animeList.map((anime) => {
          const timeUntilAiring = anime.nextAiringEpisode?.timeUntilAiring;
          
          return (
            <Link href={`/anime/info/${anime.id}`} key={anime.id} className="group">
              <div className="bg-[#000000] rounded-lg overflow-hidden border border-[#222] hover:border-[#333] transition-all duration-300 h-full flex flex-col transform group-hover:scale-[1.02]">
                <div className="relative h-40 overflow-hidden">
                  <img 
                    src={anime.coverImage?.extraLarge || anime.bannerImage || '/placeholder.jpg'} 
                    alt={anime.title?.english || anime.title?.romaji}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Countdown overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-3">
                    {anime.nextAiringEpisode ? (
                      <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-black text-xs inline-flex items-center self-start">
                        <FontAwesomeIcon icon={faClock} className="mr-1.5" />
                        {formatTimeUntil(timeUntilAiring)}
                      </div>
                    ) : (
                      <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-black text-xs inline-flex items-center self-start">
                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-1.5" />
                        {formatDate(anime.startDate)}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-3 flex flex-col flex-grow">
                  <h3 className="text-base font-medium text-white mb-1.5 line-clamp-2 group-hover:text-gray-300 transition-colors">
                    {anime.title?.english || anime.title?.romaji}
                  </h3>
                  
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {anime.genres?.slice(0, 2).map((genre, index) => (
                      <span key={index} className="px-2 py-0.5 bg-[#111] text-gray-300 rounded-full text-xs">
                        {genre}
                      </span>
                    ))}
                    {anime.format && (
                      <span className="px-2 py-0.5 bg-white/20 text-white rounded-full text-xs">
                        {anime.format.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default UpcomingAnimeSection; 