"use client";
import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faCalendarAlt, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

function NetflixStyleNewsGrid({ newsItems }) {
  // Format date
  const formatDate = (dateObj) => {
    if (!dateObj || !dateObj.year) return 'Unknown date';
    const { year, month, day } = dateObj;
    return `${month}/${day}/${year}`;
  };

  // Clean and truncate HTML description
  const truncateDescription = (html, maxLength = 150) => {
    if (!html) return '';
    
    // Simple regex to strip HTML tags
    const text = html.replace(/<[^>]*>/g, '');
    
    // Truncate text
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {newsItems.map((item) => (
        <Link href={`/news/${item.id}`} key={item.id} className="group">
          <div className="bg-[#0a0a0a] rounded-lg overflow-hidden border border-[#222] hover:border-[#333] transition-all duration-300 h-full flex flex-col transform group-hover:scale-[1.02] group-hover:shadow-xl">
            <div className="relative h-48 overflow-hidden">
              <img 
                src={item.coverImage?.extraLarge || item.bannerImage || '/placeholder.jpg'} 
                alt={item.title?.english || item.title?.romaji}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center border border-white text-black">
                      <FontAwesomeIcon icon={faInfoCircle} />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bottom gradient and genres */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <div className="flex gap-2">
                  {item.genres?.slice(0, 2).map((genre, index) => (
                    <span key={index} className="px-2 py-1 bg-black/70 backdrop-blur-sm border border-[#333] rounded text-xs text-white">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-gray-300 transition-colors">
                {item.title?.english || item.title?.romaji}
              </h3>
              
              <p className="text-gray-400 text-sm mb-3 line-clamp-3">
                {truncateDescription(item.description)}
              </p>
              
              <div className="mt-auto flex justify-between items-center text-xs text-gray-500">
                <span className="flex items-center">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                  {formatDate(item.startDate)}
                </span>
                {item.averageScore && (
                  <span className="flex items-center">
                    <FontAwesomeIcon icon={faStar} className="h-4 w-4 text-yellow-500 mr-1" />
                    {(item.averageScore / 10).toFixed(1)}/10
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default NetflixStyleNewsGrid;
