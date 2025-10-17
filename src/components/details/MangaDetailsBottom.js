"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Input } from '@nextui-org/react';

function MangaDetailsBottom({ data, chaptersData, availableProviders, selectedProvider, onProviderChange, isLoadingProvider, isLoadingProviders }) {
  const [showAllChapters, setShowAllChapters] = useState(false);
  const [chapterSearch, setChapterSearch] = useState('');
  
  const filteredChapters = chaptersData?.chapters?.filter(chapter => {
    if (!chapterSearch) return true;
    const searchLower = chapterSearch.toLowerCase();
    return chapter.title.toLowerCase().includes(searchLower) ||
           `chapter ${chapter.title}`.toLowerCase().includes(searchLower);
  }) || [];

  const displayedChapters = showAllChapters 
    ? filteredChapters 
    : filteredChapters.slice(0, 50);

  return (
    <div className="bg-black">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 space-y-8 sm:space-y-10 md:space-y-12">
        {/* Chapters Section */}
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-2xl md:text-3xl font-bold text-white">Chapters</h2>
              {chaptersData?.chapters && chaptersData.chapters.length > 0 && (
                <div className="text-sm sm:text-base text-gray-400">
                  {filteredChapters.length} chapters
                </div>
              )}
            </div>
            
            {/* Provider Selector */}
            {!isLoadingProviders && availableProviders && availableProviders.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-400">Source:</span>
                <div className="flex gap-2">
                  {availableProviders.map((provider) => (
                    <button
                      key={provider.name}
                      onClick={() => onProviderChange(provider.name)}
                      disabled={isLoadingProvider}
                      className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                        selectedProvider === provider.name
                          ? 'bg-white text-black'
                          : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                      } ${isLoadingProvider ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {provider.label}
                      <span className="ml-1.5 text-[0.65rem] opacity-70">
                        ({provider.chapterCount})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {isLoadingProvider ? (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8 sm:p-10 md:p-12 text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white/40 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-base sm:text-lg text-white mb-1 sm:mb-2">Switching provider...</p>
              <p className="text-xs sm:text-sm text-gray-400">
                Loading chapters from selected source
              </p>
            </div>
          ) : chaptersData?.chapters && chaptersData.chapters.length > 0 ? (
            <>
              {/* Chapter Search */}
              {chaptersData.chapters.length > 10 && (
                <div className="mb-4 sm:mb-5 md:mb-6">
                  <Input
                    placeholder="Search chapters..."
                    value={chapterSearch}
                    onChange={(e) => setChapterSearch(e.target.value)}
                    size="lg"
                    classNames={{
                      input: "bg-transparent text-white placeholder:text-gray-500 text-sm sm:text-base",
                      inputWrapper: "bg-white/5 border border-white/10 hover:border-white/20 h-12 sm:h-auto"
                    }}
                    startContent={
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    }
                  />
                </div>
              )}

              {/* Chapters Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-2.5 md:gap-3">
                {displayedChapters.map((chapter) => (
                  <Link
                    key={chapter.id}
                    href={`/manga/read?id=${data.id}&chapterId=${chapter.id}&chapter=${chapter.title}&provider=${selectedProvider || chaptersData?.provider || 'mangapill'}`}
                  >
                    <div className="group relative bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/30 rounded-lg p-3 sm:p-3.5 md:p-4 transition-all duration-300 hover:bg-white/10 cursor-pointer min-h-[70px] sm:min-h-[80px] flex items-center active:scale-95">
                      <div className="flex flex-col w-full">
                        <span className="text-white font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1">
                          Ch. {chapter.title}
                        </span>
                        {chapter.releaseDate && (
                          <span className="text-[0.65rem] sm:text-xs text-gray-400 truncate">
                            {chapter.releaseDate}
                          </span>
                        )}
                      </div>
                      <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/20 rounded-lg transition-all duration-300 pointer-events-none" />
                    </div>
                  </Link>
                ))}
              </div>

              {/* Show More Button */}
              {chaptersData.chapters.length > 50 && !showAllChapters && (
                <div className="text-center mt-6 sm:mt-7 md:mt-8">
                  <Button
                    onClick={() => setShowAllChapters(true)}
                    size="lg"
                    className="w-full sm:w-auto bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-xl h-12 sm:h-auto text-sm sm:text-base"
                  >
                    Show All {chaptersData.chapters.length} Chapters
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8 sm:p-10 md:p-12 text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-base sm:text-lg text-white mb-1 sm:mb-2">No chapters available</p>
              <p className="text-xs sm:text-sm text-gray-400">
                Chapters for this manga could not be found
              </p>
            </div>
          )}
        </div>

        {/* Characters */}
        {data?.characters?.edges && data.characters.edges.length > 0 && (
          <div>
            <h2 className="text-2xl sm:text-2xl md:text-3xl font-bold text-white mb-4 sm:mb-5 md:mb-6">Characters</h2>
            <div className="overflow-x-auto overflow-y-hidden scrollbar-hide pb-2">
              <div className="flex gap-2.5 sm:gap-3">
                {data.characters.edges.slice(0, 20).map((edge) => (
                  <div key={edge.id} className="flex-shrink-0 w-[110px] sm:w-[125px] md:w-[140px]">
                    <div className="group relative bg-black border border-white/10 hover:border-white/20 rounded-lg overflow-hidden transition-all duration-300 cursor-pointer h-[165px] sm:h-[185px] md:h-[210px]">
                      <img
                        src={edge.node.image.large}
                        alt={edge.node.name.full}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-white text-xs font-semibold line-clamp-2 leading-tight mb-0.5">
                          {edge.node.name.full}
                        </p>
                        <p className="text-gray-400 text-[0.65rem]">{edge.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {data?.recommendations?.nodes && data.recommendations.nodes.length > 0 && (
          <div>
            <h2 className="text-2xl sm:text-2xl md:text-3xl font-bold text-white mb-4 sm:mb-5 md:mb-6">Recommended Manga</h2>
            <div className="overflow-x-auto overflow-y-hidden scrollbar-hide pb-2">
              <div className="flex gap-2.5 sm:gap-3">
                {data.recommendations.nodes.slice(0, 20).map((item) => {
                  const manga = item.mediaRecommendation;
                  if (!manga) return null;
                  return (
                    <Link key={manga.id} href={`/manga/info/${manga.id}`} className="flex-shrink-0 w-[110px] sm:w-[125px] md:w-[140px]">
                      <div className="group relative overflow-hidden rounded-lg bg-black border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer h-[165px] sm:h-[185px] md:h-[210px]">
                        <img
                          src={manga.coverImage?.extraLarge || manga.coverImage?.large}
                          alt={manga.title?.english || manga.title?.romaji}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-2">
                          <h3 className="text-white font-semibold text-xs line-clamp-2 leading-tight">
                            {manga.title?.english || manga.title?.romaji}
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

        {/* Relations */}
        {data?.relations?.edges && data.relations.edges.length > 0 && (
          <div>
            <h2 className="text-2xl sm:text-2xl md:text-3xl font-bold text-white mb-4 sm:mb-5 md:mb-6">Related</h2>
            <div className="overflow-x-auto overflow-y-hidden scrollbar-hide pb-2">
              <div className="flex gap-2.5 sm:gap-3">
                {data.relations.edges.slice(0, 20).map((item) => {
                  const related = item.node;
                  if (!related || related.type !== 'MANGA') return null;
                  return (
                    <Link key={related.id} href={`/manga/info/${related.id}`} className="flex-shrink-0 w-[110px] sm:w-[125px] md:w-[140px]">
                      <div className="group relative overflow-hidden rounded-lg bg-black border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer h-[165px] sm:h-[185px] md:h-[210px]">
                        <img
                          src={related.coverImage?.extraLarge || related.coverImage?.large}
                          alt={related.title?.english || related.title?.romaji}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                        <div className="absolute top-1.5 left-1.5 bg-black/80 backdrop-blur-sm border border-white/20 px-1.5 py-0.5 rounded">
                          <span className="text-white text-[0.6rem] font-semibold uppercase">
                            {item.relationType}
                          </span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-2">
                          <h3 className="text-white font-semibold text-xs line-clamp-2 leading-tight">
                            {related.title?.english || related.title?.romaji}
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
    </div>
  );
}

export default MangaDetailsBottom;
