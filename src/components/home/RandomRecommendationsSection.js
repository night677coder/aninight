"use client";
import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faStar, faDice, faRandom } from '@fortawesome/free-solid-svg-icons';

function RandomRecommendationsSection({ animeList }) {
  if (!animeList || animeList.length === 0) {
    return null;
  }

  // Clean and truncate HTML description
  const truncateDescription = (html, maxLength = 120) => {
    if (!html) return '';
    
    // Simple regex to strip HTML tags
    const text = html.replace(/<[^>]*>/g, '');
    
    // Truncate text
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="h-6 md:h-8 rounded-md w-[.35rem] md:w-[.3rem] bg-white"></span>
          <h2 className="text-xl md:text-2xl font-medium">Discover Something New</h2>
          <div className="flex items-center bg-white px-2 py-1 rounded-full ml-2 text-xs text-black">
            <FontAwesomeIcon icon={faDice} className="mr-1" />
            <span>Random Picks</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {animeList.slice(0, 6).map((anime) => (
          <Link href={`/anime/info/${anime.id}`} key={anime.id} className="group">
            <div className="bg-[#000000] rounded-lg overflow-hidden border border-[#222] hover:border-[#444] transition-all duration-300 h-full flex flex-col transform group-hover:scale-[1.02]">
              {/* Cover image with gradient overlay */}
              <div className="relative pt-[140%] overflow-hidden">
                <img 
                  src={anime.coverImage?.extraLarge || anime.coverImage?.large || '/placeholder.jpg'} 
                  alt={anime.title?.english || anime.title?.romaji}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                
                {/* Studio badge */}
                {anime.studios?.nodes?.[0] && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-white text-xs">
                      {anime.studios.nodes[0].name}
                    </div>
                  </div>
                )}
                
                {/* Random icon */}
                <div className="absolute top-2 left-2">
                  <div className="bg-white w-7 h-7 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faRandom} className="text-black text-xs" />
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-3 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-gray-300 transition-colors">
                    {anime.title?.english || anime.title?.romaji}
                  </h3>
                  {anime.averageScore && (
                    <div className="flex items-center gap-1 ml-1 flex-shrink-0">
                      <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-xs" />
                      <span className="text-xs text-gray-300">{(anime.averageScore / 10).toFixed(1)}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {anime.genres?.slice(0, 1).map((genre, index) => (
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
        ))}
      </div>
    </div>
  );
}

export default RandomRecommendationsSection; 