"use client"
import React from 'react';
import Characters from '@/components/details/Characters';
import Animecards from '@/components/CardComponent/Animecards';

function NewsDetailsContainer({ data, id, session }) {
  // Format date
  const formatDate = (dateObj) => {
    if (!dateObj || !dateObj.year) return 'Unknown date';
    const { year, month, day } = dateObj;
    return `${month}/${day}/${year}`;
  };

  // Create markup for dangerouslySetInnerHTML
  const createMarkup = (html) => {
    return { __html: html };
  };

  return (
    <>
      {/* Hero Section */}
      <div className="relative">
        {/* Banner Image */}
        <div className="w-full h-[300px] sm:h-[400px] relative">
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent z-10"></div>
          {data.bannerImage ? (
            <img
              src={data.bannerImage}
              alt={data.title?.english || data.title?.romaji}
              className="w-full h-full object-cover"
            />
          ) : data.coverImage?.extraLarge ? (
            <div className="w-full h-full bg-cover bg-center" style={{ 
              backgroundImage: `url(${data.coverImage.extraLarge})`,
              filter: 'blur(8px)',
              transform: 'scale(1.1)'
            }}></div>
          ) : (
            <div className="w-full h-full bg-gray-800"></div>
          )}
        </div>

        {/* Content Overlay */}
        <div className="container mx-auto px-4 sm:px-8 md:px-12 relative z-20 -mt-32 sm:-mt-40">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Cover Image */}
            <div className="w-32 sm:w-48 flex-shrink-0">
              <img
                src={data.coverImage?.extraLarge || '/placeholder.jpg'}
                alt={data.title?.english || data.title?.romaji}
                className="w-full rounded-md shadow-lg"
              />
            </div>

            {/* Title and Info */}
            <div className="flex flex-col justify-end text-white">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                {data.title?.english || data.title?.romaji}
              </h1>
              <div className="flex flex-wrap gap-2 mb-3">
                {data.genres?.map((genre, index) => (
                  <span key={index} className="px-2 py-1 bg-[#1a1a1a] rounded-md text-xs">
                    {genre}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                {data.startDate && (
                  <div>
                    <span className="font-medium">Released:</span> {formatDate(data.startDate)}
                  </div>
                )}
                {data.format && (
                  <div>
                    <span className="font-medium">Format:</span> {data.format.replace(/_/g, ' ')}
                  </div>
                )}
                {data.averageScore && (
                  <div>
                    <span className="font-medium">Score:</span> {data.averageScore}%
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="container mx-auto px-4 sm:px-8 md:px-12 py-8">
        <div className="bg-[#1a1a1a] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Overview</h2>
          {data.description ? (
            <div 
              className="text-gray-300 leading-relaxed prose prose-invert max-w-none"
              dangerouslySetInnerHTML={createMarkup(data.description)}
            ></div>
          ) : (
            <p className="text-gray-400">No description available.</p>
          )}
        </div>
      </div>

      {/* Trailer Section */}
      {data.trailer && data.trailer.site === "youtube" && (
        <div className="container mx-auto px-4 sm:px-8 md:px-12 py-6 border-b border-[#333]">
          <h2 className="text-lg sm:text-xl font-medium text-white mb-4 sm:mb-6">Trailer</h2>
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src={`https://www.youtube.com/embed/${data.trailer.id}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-[300px] sm:h-[400px] md:h-[500px] rounded-lg"
            ></iframe>
          </div>
        </div>
      )}
      
      {/* Characters Section */}
      {data?.characters?.edges?.length > 0 && (
        <div className="container mx-auto px-4 sm:px-8 md:px-12 py-6 sm:py-8 border-b border-[#333]">
          <h2 className="text-lg sm:text-xl font-medium text-white mb-4 sm:mb-6">Cast</h2>
          <Characters data={data?.characters?.edges} />
        </div>
      )}
      
      {/* Recommendations Section */}
      {data?.recommendations?.nodes?.length > 0 && (
        <div className="container mx-auto px-4 sm:px-8 md:px-12 py-6 sm:py-8">
          <h2 className="text-lg sm:text-xl font-medium text-white mb-4 sm:mb-6">More Like This</h2>
          <div className="relative">
            <Animecards 
              data={data.recommendations.nodes} 
              cardid="Recommendations" 
              show={false}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default NewsDetailsContainer;
