"use client";
import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faStar } from '@fortawesome/free-solid-svg-icons';

function Seasons({ relations }) {
  if (!relations?.edges || relations.edges.length === 0) {
    return null;
  }

  // Filter for sequels, prequels, and side stories
  const seasonTypes = ['PREQUEL', 'SEQUEL', 'SIDE_STORY', 'ALTERNATIVE', 'PARENT', 'ADAPTATION'];
  const seasons = relations.edges.filter(edge => 
    seasonTypes.includes(edge.relationType) && 
    edge.node.format !== 'MANGA' &&
    edge.node.format !== 'NOVEL' &&
    edge.node.format !== 'ONE_SHOT'
  );

  if (seasons.length === 0) {
    return null;
  }

  // Group by relation type
  const groupedSeasons = {
    PREQUEL: [],
    SEQUEL: [],
    SIDE_STORY: [],
    ALTERNATIVE: [],
    PARENT: [],
    ADAPTATION: []
  };

  seasons.forEach(season => {
    if (groupedSeasons[season.relationType]) {
      groupedSeasons[season.relationType].push(season);
    }
  });

  const getRelationLabel = (type) => {
    const labels = {
      PREQUEL: 'Prequel',
      SEQUEL: 'Sequel',
      SIDE_STORY: 'Side Story',
      ALTERNATIVE: 'Alternative Version',
      PARENT: 'Parent Story',
      ADAPTATION: 'Adaptation'
    };
    return labels[type] || type;
  };

  return (
    <div className="overflow-x-auto overflow-y-hidden scrollbar-hide pb-2">
      <div className="flex flex-col gap-6">
        {Object.entries(groupedSeasons).map(([type, items]) => {
          if (items.length === 0) return null;
          
          return (
            <div key={type}>
              <h3 className="text-sm font-medium text-[#999] mb-3 uppercase tracking-wider">
                {getRelationLabel(type)}
              </h3>
              <div className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide">
                {items.map((item) => {
                  const anime = item.node;
                  const title = anime.title?.english || anime.title?.romaji || anime.title?.native;
                  
                  return (
                    <Link 
                      key={anime.id} 
                      href={`/anime/info/${anime.id}`}
                      className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px] group"
                    >
                      <div className="relative bg-black border border-white/10 hover:border-white/30 rounded-lg overflow-hidden transition-all duration-300 h-[210px] sm:h-[240px] md:h-[270px]">
                        <img
                          src={anime.coverImage?.extraLarge || anime.coverImage?.large}
                          alt={title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                        
                        {/* Play icon on hover */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                            <FontAwesomeIcon icon={faPlay} className="w-5 h-5 text-black ml-1" />
                          </div>
                        </div>
                        
                        {/* Format badge */}
                        {anime.format && (
                          <div className="absolute top-2 left-2 bg-black/90 backdrop-blur-sm border border-white/20 px-2 py-1 rounded-md">
                            <span className="text-white text-xs font-medium">
                              {anime.format}
                            </span>
                          </div>
                        )}
                        
                        {/* Episodes badge */}
                        {anime.episodes && (
                          <div className="absolute top-2 right-2 bg-black/90 backdrop-blur-sm border border-white/20 px-2 py-1 rounded-md">
                            <span className="text-white text-xs font-medium">
                              {anime.episodes} EP
                            </span>
                          </div>
                        )}
                        
                        {/* Status badge */}
                        {anime.status && (
                          <div className="absolute bottom-12 left-2 right-2">
                            <span className={`text-xs font-medium px-2 py-1 rounded ${
                              anime.status === 'RELEASING' ? 'bg-green-600/90' :
                              anime.status === 'FINISHED' ? 'bg-blue-600/90' :
                              anime.status === 'NOT_YET_RELEASED' ? 'bg-yellow-600/90' :
                              'bg-gray-600/90'
                            }`}>
                              {anime.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                        )}
                        
                        {/* Title */}
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <h3 className="text-white font-semibold text-xs sm:text-sm line-clamp-2 leading-tight">
                            {title}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

export default Seasons;
