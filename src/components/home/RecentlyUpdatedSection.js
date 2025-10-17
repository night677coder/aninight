"use client";
import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faClock, faSync, faBell } from '@fortawesome/free-solid-svg-icons';

function RecentlyUpdatedSection({ animeList }) {
  if (!animeList || animeList.length === 0) {
    return null;
  }

  // Format time since update
  const formatTimeSinceUpdate = (timestamp) => {
    if (!timestamp) return '';
    
    const now = Math.floor(Date.now() / 1000);
    const seconds = now - timestamp;
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    
    return `${Math.floor(seconds / 604800)}w ago`;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="h-6 md:h-8 rounded-md w-[.35rem] md:w-[.3rem] bg-white"></span>
          <h2 className="text-xl md:text-2xl font-medium">Recently Updated</h2>
          <div className="flex items-center bg-white px-2 py-1 rounded-full ml-2 text-xs text-black">
            <FontAwesomeIcon icon={faSync} className="mr-1" />
            <span>Latest Changes</span>
          </div>
        </div>
        <Link href="/anime/catalog?sort=UPDATED_AT_DESC" className="flex items-center gap-1 text-sm text-white hover:underline">
          <span>View All</span>
          <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {animeList.slice(0, 6).map((anime) => (
          <Link href={`/anime/info/${anime.id}`} key={anime.id} className="group">
            <div className="bg-[#000000] rounded-lg overflow-hidden border border-[#222] hover:border-[#333] transition-all duration-300 h-full flex transform group-hover:scale-[1.01]">
              {/* Cover image */}
              <div className="w-[100px] h-[140px] flex-shrink-0">
                <img 
                  src={anime.coverImage?.large || anime.coverImage?.medium || '/placeholder.jpg'} 
                  alt={anime.title?.english || anime.title?.romaji}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              
              {/* Content */}
              <div className="p-3 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {anime.updatedAt && (
                      <div className="bg-white/20 px-2 py-0.5 rounded text-white text-xs inline-flex items-center">
                        <FontAwesomeIcon icon={faClock} className="mr-1" />
                        {formatTimeSinceUpdate(anime.updatedAt)}
                      </div>
                    )}
                    {anime.status && (
                      <span className="text-xs text-gray-400 capitalize">
                        {anime.status.replace(/_/g, ' ').toLowerCase()}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-gray-300 transition-colors">
                    {anime.title?.english || anime.title?.romaji}
                  </h3>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex flex-wrap gap-1.5">
                    {anime.episodes ? (
                      <span className="px-2 py-0.5 bg-[#111] text-gray-300 rounded-full text-xs">
                        {anime.episodes} Episodes
                      </span>
                    ) : anime.nextAiringEpisode ? (
                      <span className="px-2 py-0.5 bg-[#111] text-gray-300 rounded-full text-xs">
                        EP {anime.nextAiringEpisode.episode} Soon
                      </span>
                    ) : null}
                  </div>
                  
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-colors">
                    <FontAwesomeIcon icon={faBell} size="sm" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default RecentlyUpdatedSection; 