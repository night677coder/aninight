"use client"
import React from 'react';
import Link from 'next/link';

function NewsCardGrid({ newsItems }) {
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
        <Link href={`/news/${item.id}`} key={item.id}>
          <div className="bg-[#1a1a1a] rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
            <div className="relative h-48 overflow-hidden">
              <img 
                src={item.coverImage?.extraLarge || item.bannerImage || '/placeholder.jpg'} 
                alt={item.title?.english || item.title?.romaji}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <div className="flex gap-2">
                  {item.genres?.slice(0, 2).map((genre, index) => (
                    <span key={index} className="px-2 py-1 bg-[#333] bg-opacity-75 rounded text-xs text-white">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                {item.title?.english || item.title?.romaji}
              </h3>
              
              <p className="text-gray-400 text-sm mb-3 line-clamp-3">
                {truncateDescription(item.description)}
              </p>
              
              <div className="mt-auto flex justify-between items-center text-xs text-gray-500">
                <span>{formatDate(item.startDate)}</span>
                {item.averageScore && (
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {item.averageScore}%
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

export default NewsCardGrid;
