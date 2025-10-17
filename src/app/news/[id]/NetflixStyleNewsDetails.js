"use client"
import React from 'react';
import Characters from '@/components/details/Characters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faPlayCircle, faUsers, faPlay } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import Image from 'next/image';

function NetflixStyleNewsDetails({ data, id, session }) {
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
    <div className="w-full bg-black min-h-screen">
      {/* Hero Banner Section */}
      <div className="relative w-full h-[70vh] sm:h-[80vh] overflow-hidden">
        {/* Background image with gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/60 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent z-10"></div>
        <img 
          src={data.bannerImage || data.coverImage?.extraLarge || '/placeholder.jpg'} 
          alt={data.title?.english || data.title?.romaji}
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        
        {/* Content positioned at bottom left */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 md:px-12 pb-8 sm:pb-12 z-20">
          <div className="max-w-4xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 leading-tight">
              {data.title?.english || data.title?.romaji}
            </h1>
            
            {/* Metadata row */}
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-300 mb-4 sm:mb-6 flex-wrap">
              {data.format && (
                <span className="px-2 sm:px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full font-medium">
                  {data.format.replace(/_/g, ' ')}
                </span>
              )}
              {data.startDate?.year && (
                <span className="px-2 sm:px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full">
                  {data.startDate.year}
                </span>
              )}
              {data.averageScore && (
                <span className="px-2 sm:px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center gap-1">
                  <FontAwesomeIcon icon={faStar} className="text-white" />
                  {(data.averageScore / 10).toFixed(1)}
                </span>
              )}
              {data.episodes && (
                <span className="px-2 sm:px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full">
                  {data.episodes} Episodes
                </span>
              )}
            </div>
            
            {/* Description */}
            {data.description && (
              <div 
                className="text-gray-300 text-sm sm:text-base mb-4 sm:mb-6 max-w-3xl leading-relaxed prose prose-invert prose-p:text-gray-300 prose-a:text-white prose-headings:text-white line-clamp-3 sm:line-clamp-4"
                dangerouslySetInnerHTML={createMarkup(data.description)}
              ></div>
            )}
            
            {/* Genres */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
              {data.genres?.slice(0, 5).map((genre, index) => (
                <Link 
                  href={`/genre/${genre.replace(/[&'"^%$#@!()+=<>:;,.?\/\\|{}[\]`~*_]/g, "").split(" ").join("-").toLowerCase()}`}
                  key={index} 
                  className="px-2 sm:px-3 py-1 bg-black/60 backdrop-blur-sm border border-white/20 hover:border-white/40 rounded-full text-xs text-white transition-all"
                >
                  {genre}
                </Link>
              ))}
            </div>
            
            {/* Action Buttons */}
            {data.trailer && data.trailer.site === "youtube" && (
              <div className="flex items-center gap-3">
                <a 
                  href={`https://www.youtube.com/watch?v=${data.trailer.id}`}
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white hover:bg-gray-200 text-black font-semibold rounded-lg transition-all shadow-lg hover:shadow-white/20 text-sm sm:text-base"
                >
                  <FontAwesomeIcon icon={faPlayCircle} />
                  <span className="hidden sm:inline">Watch Trailer</span>
                  <span className="sm:hidden">Trailer</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Content Sections */}
      <div className="w-full bg-black">
        {/* Trailer Section */}
        {data.trailer && data.trailer.site === "youtube" && (
          <div className="px-4 sm:px-6 md:px-12 py-8 sm:py-10 md:py-12 border-b border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-8 rounded-md w-[.3rem] bg-white"></span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Trailer</h2>
            </div>
            <div className="aspect-w-16 aspect-h-9 bg-black/50 rounded-xl overflow-hidden border border-white/10">
              <iframe
                src={`https://www.youtube.com/embed/${data.trailer.id}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[550px]"
              ></iframe>
            </div>
          </div>
        )}
        
        {/* About Section */}
        <div className="px-4 sm:px-6 md:px-12 py-8 sm:py-10 md:py-12 border-b border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-8 rounded-md w-[.3rem] bg-white"></span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">About</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2">
              {data.description ? (
                <div 
                  className="text-gray-400 text-sm sm:text-base leading-relaxed mb-8 prose prose-invert prose-p:text-gray-400 prose-a:text-white prose-headings:text-white max-w-none"
                  dangerouslySetInnerHTML={createMarkup(data.description)}
                ></div>
              ) : (
                <p className="text-gray-400 mb-8">No description available.</p>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {data.genres?.length > 0 && (
                  <div>
                    <p className="text-gray-500 text-sm mb-2 uppercase tracking-wider">Genres</p>
                    <div className="flex flex-wrap gap-2">
                      {data.genres.map((genre, index) => (
                        <Link
                          key={index}
                          href={`/genre/${genre.replace(/[&'"^%$#@!()+=<>:;,.?\/\\|{}[\]`~*_]/g, "").split(" ").join("-").toLowerCase()}`}
                          className="text-white hover:text-gray-300 transition-colors text-sm"
                        >
                          {genre}{index < data.genres.length - 1 && ", "}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                
                {data.studios?.nodes?.length > 0 && (
                  <div>
                    <p className="text-gray-500 text-sm mb-2 uppercase tracking-wider">Studios</p>
                    <div className="flex flex-wrap gap-2">
                      {data.studios.nodes.map((studio, index) => (
                        <Link
                          key={index}
                          href={`/producer/${studio.name.replace(/[&'"^%$#@!()+=<>:;,.?\/\\|{}[\]`~*_]/g, "").split(" ").join("-").replace(/-+/g, "-")}`}
                          className="text-white hover:text-gray-300 transition-colors text-sm"
                        >
                          {studio.name}{index < data.studios.nodes.length - 1 && ", "}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-4">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Type</p>
                  <p className="text-white font-medium">{data.format?.replace(/_/g, ' ') || "Unknown"}</p>
                </div>
                
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Status</p>
                  <p className="text-white font-medium">{data.status?.replace(/_/g, ' ') || "Unknown"}</p>
                </div>
                
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Released</p>
                  <p className="text-white font-medium">{formatDate(data.startDate) || "Unknown"}</p>
                </div>
                
                {data.season && (
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Season</p>
                    <p className="text-white font-medium">
                      {data.season.charAt(0) + data.season.slice(1).toLowerCase()} {data.startDate?.year}
                    </p>
                  </div>
                )}
                
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Episodes</p>
                  <p className="text-white font-medium">{data.episodes || "Unknown"}</p>
                </div>
                
                {data.averageScore && (
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Score</p>
                    <p className="text-white font-medium flex items-center gap-2">
                      <FontAwesomeIcon icon={faStar} className="text-white" />
                      {(data.averageScore / 10).toFixed(1)}/10
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Characters Section */}
        {data?.characters?.edges?.length > 0 && (
          <div className="px-4 sm:px-6 md:px-12 py-8 sm:py-10 md:py-12 border-b border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-8 rounded-md w-[.3rem] bg-white"></span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Cast</h2>
            </div>
            <Characters data={data?.characters?.edges} />
          </div>
        )}
        
        {/* Recommendations Section - New Modern UI */}
        {data?.recommendations?.nodes?.length > 0 && (
          <div className="px-4 sm:px-6 md:px-12 py-8 sm:py-10 md:py-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-8 rounded-md w-[.3rem] bg-white"></span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">More Like This</h2>
            </div>
            
            <div className="overflow-x-auto overflow-y-hidden scrollbar-hide pb-2">
              <div className="flex gap-3 sm:gap-4">
                {data.recommendations.nodes.slice(0, 20).map((item) => {
                  const anime = item.mediaRecommendation;
                  if (!anime) return null;
                  
                  return (
                    <Link 
                      key={anime.id} 
                      href={`/anime/info/${anime.id}`}
                      className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px] group"
                    >
                      <div className="relative bg-black border border-white/10 hover:border-white/30 rounded-lg overflow-hidden transition-all duration-300 h-[210px] sm:h-[240px] md:h-[270px]">
                        <img
                          src={anime.coverImage?.extraLarge || anime.coverImage?.large}
                          alt={anime.title?.english || anime.title?.romaji}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                        
                        {/* Play icon on hover */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                            <FontAwesomeIcon icon={faPlay} className="text-black ml-1" />
                          </div>
                        </div>
                        
                        {/* Score badge */}
                        {anime.averageScore && (
                          <div className="absolute top-2 right-2 bg-black/90 backdrop-blur-sm border border-white/20 px-2 py-1 rounded-md">
                            <span className="text-white text-xs font-bold flex items-center gap-1">
                              <FontAwesomeIcon icon={faStar} className="text-white" />
                              {(anime.averageScore / 10).toFixed(1)}
                            </span>
                          </div>
                        )}
                        
                        {/* Title */}
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <h3 className="text-white font-semibold text-xs sm:text-sm line-clamp-2 leading-tight">
                            {anime.title?.english || anime.title?.romaji}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
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

export default NetflixStyleNewsDetails;
