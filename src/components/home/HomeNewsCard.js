"use client";
import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faCalendarAlt, faNewspaper, faArrowRight } from '@fortawesome/free-solid-svg-icons';

function HomeNewsCard({ newsItems }) {
  // Format date
  const formatDate = (dateObj) => {
    if (!dateObj || !dateObj.year) return 'Unknown date';
    const { year, month, day } = dateObj;
    return `${month}/${day}/${year}`;
  };

  // Clean and truncate HTML description
  const truncateDescription = (html, maxLength = 120) => {
    if (!html) return '';
    
    // Simple regex to strip HTML tags
    const text = html.replace(/<[^>]*>/g, '');
    
    // Truncate text
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (!newsItems || newsItems.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="h-6 md:h-8 rounded-md w-[.35rem] md:w-[.3rem] bg-white"></span>
          <h2 className="text-xl md:text-2xl font-medium">Latest News</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {newsItems.map((item) => (
          <Link href={`/news/${item.id}`} key={item.id} className="group">
            <div className="bg-[#000000] rounded-lg overflow-hidden border border-[#222] hover:border-[#333] transition-all duration-300 h-full flex flex-col transform group-hover:scale-[1.02]">
              <div className="relative h-40 overflow-hidden">
                <img 
                  src={item.coverImage?.extraLarge || item.bannerImage || '/placeholder.jpg'} 
                  alt={item.title?.english || item.title?.romaji}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Bottom gradient and genres */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                  <div className="flex gap-2">
                    {item.genres?.slice(0, 2).map((genre, index) => (
                      <span key={index} className="px-2 py-0.5 bg-black/70 backdrop-blur-sm border border-[#333] rounded text-xs text-white">
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-3 flex flex-col flex-grow">
                <h3 className="text-base font-medium text-white mb-1 line-clamp-2 group-hover:text-gray-300 transition-colors">
                  {item.title?.english || item.title?.romaji}
                </h3>
                
                <p className="text-gray-400 text-xs mb-2 line-clamp-2">
                  {truncateDescription(item.description)}
                </p>
                
                <div className="mt-auto flex justify-between items-center text-xs text-gray-500">
                  <span className="flex items-center">
                    <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                    {formatDate(item.startDate)}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default HomeNewsCard; 