"use client";
import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faStar, faTag } from '@fortawesome/free-solid-svg-icons';

function GenreSection({ animeList, genre = "Action" }) {
  if (!animeList || animeList.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="h-6 md:h-8 rounded-md w-[.35rem] md:w-[.3rem] bg-white"></span>
          <h2 className="text-xl md:text-2xl font-medium">{genre} Anime</h2>
          <div className="flex items-center bg-white px-2 py-1 rounded-full ml-2 text-xs text-black">
            <FontAwesomeIcon icon={faTag} className="mr-1" />
            <span>Popular Genre</span>
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Gradient edges for scroll effect */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>
        
        {/* Horizontal scrolling container */}
        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide scroll-smooth snap-x">
          {animeList.map((anime) => (
            <Link 
              href={`/anime/info/${anime.id}`} 
              key={anime.id} 
              className="flex-shrink-0 w-[220px] snap-start group"
            >
              <div className="bg-[#000000] rounded-lg overflow-hidden border border-[#222] hover:border-white transition-all duration-300 h-full flex flex-col transform group-hover:scale-[1.02]">
                {/* Image with gradient overlay */}
                <div className="relative w-full h-[300px]">
                  <img 
                    src={anime.coverImage?.extraLarge || anime.coverImage?.large || '/placeholder.jpg'} 
                    alt={anime.title?.english || anime.title?.romaji}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent"></div>
                  
                  {/* Rating badge */}
                  {anime.averageScore && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-white text-xs inline-flex items-center">
                        <FontAwesomeIcon icon={faStar} className="text-yellow-500 mr-1" />
                        {(anime.averageScore / 10).toFixed(1)}
                      </div>
                    </div>
                  )}
                  
                  {/* Studio */}
                  {anime.studios?.nodes?.[0] && (
                    <div className="absolute bottom-2 left-2">
                      <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-black text-xs">
                        {anime.studios.nodes[0].name}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-3 flex flex-col">
                  <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-gray-300 transition-colors">
                    {anime.title?.english || anime.title?.romaji}
                  </h3>
                  
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {anime.format && (
                      <span className="px-2 py-0.5 bg-white/20 text-white rounded-full text-xs">
                        {anime.format.replace(/_/g, ' ')}
                      </span>
                    )}
                    {anime.season && anime.startDate?.year && (
                      <span className="px-2 py-0.5 bg-[#111] text-gray-300 rounded-full text-xs capitalize">
                        {anime.season.toLowerCase()} {anime.startDate.year}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GenreSection; 