"use client"
import React, { useState, useEffect } from 'react';
import { Input } from '@nextui-org/react';
import MangaCard from '@/components/CardComponent/MangaCard';
import { searchMangaAnilist } from '@/lib/MangaFunctions';
import ContinueReading from '@/components/home/ContinueReading';

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
  'Mystery', 'Psychological', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports',
  'Supernatural', 'Thriller'
];

function MangaCatalogNew({ popularManga, trendingManga, searchParams, session }) {
  const [searchQuery, setSearchQuery] = useState(searchParams?.search || '');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [genreResults, setGenreResults] = useState([]);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const performSearch = async (query) => {
    setIsSearching(true);
    setSelectedGenre(null);
    try {
      const results = await searchMangaAnilist(query, 1);
      setSearchResults(results?.media || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleGenreClick = (genre) => {
    setSelectedGenre(genre);
    setSearchQuery('');
    const filtered = (popularManga || []).filter(m => m.genres?.includes(genre));
    setGenreResults(filtered);
  };

  const topRatedManga = [...(popularManga || [])].sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0));

  return (
    <div className="min-h-screen bg-black overflow-x-hidden w-full">
      {/* Futuristic Grid Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-black/50 to-black" />
      </div>

      {/* Hero Section */}
      <div className="relative">
        {/* Animated Glow Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[100px] animate-pulse" />
          <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-white/[0.03] rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12 sm:pb-16 overflow-x-hidden">
          {/* Title Section */}
          <div className="text-center mb-12 sm:mb-16 overflow-x-hidden">
            <div className="inline-block mb-6 overflow-x-hidden max-w-full">
              <div className="relative overflow-x-hidden">
                <h1 className="text-[60px] sm:text-[120px] md:text-[160px] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 leading-none tracking-[-0.05em] px-4">
                  MANGA
                </h1>
                <div className="absolute inset-0 text-[60px] sm:text-[120px] md:text-[160px] font-black text-white/5 blur-2xl leading-none tracking-[-0.05em] px-4">
                  MANGA
                </div>
              </div>
            </div>
            <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto mb-6" />
            <p className="text-gray-500 text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.3em] uppercase font-light px-4">
              Discover • Explore • Read
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-12 sm:mb-16 px-2 sm:px-0">
            <div className="relative group">
              <div className="absolute -inset-[1px] bg-gradient-to-r from-white/20 via-white/5 to-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search manga..."
                  size="lg"
                  classNames={{
                    input: "bg-transparent text-white text-lg placeholder:text-gray-600 font-light",
                    inputWrapper: "bg-transparent border-none shadow-none h-[70px] px-8"
                  }}
                  startContent={
                    <svg className="w-5 h-5 text-gray-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                  endContent={
                    isSearching ? (
                      <div className="w-5 h-5 border border-white/20 border-t-white rounded-full animate-spin" />
                    ) : searchQuery ? (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-gray-600 hover:text-white transition-colors duration-300"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    ) : null
                  }
                />
              </div>
            </div>
          </div>

          {/* Genres */}
          {!searchQuery && !selectedGenre && (
            <div className="space-y-6 overflow-x-hidden px-2 sm:px-0">
              <div className="flex items-center justify-center gap-2 sm:gap-4">
                <div className="h-[1px] w-8 sm:w-12 bg-gradient-to-r from-transparent to-white/20" />
                <p className="text-white/40 text-xs tracking-[0.2em] sm:tracking-[0.3em] uppercase font-light whitespace-nowrap">
                  Browse by Genre
                </p>
                <div className="h-[1px] w-8 sm:w-12 bg-gradient-to-l from-transparent to-white/20" />
              </div>
              <div className="flex flex-wrap justify-center gap-2 max-w-full">
                {GENRES.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => handleGenreClick(genre)}
                    className="relative px-6 py-2.5 text-xs font-light tracking-wider transition-all duration-300 text-white/50 hover:text-white"
                  >
                    <div className="absolute inset-0 border border-white/10 rounded-full hover:border-white/30" />
                    <span className="relative z-10">{genre}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Sections */}
      <div className="relative sm:max-w-[97%] md:max-w-[95%] lg:max-w-[90%] xl:max-w-[85%] mx-auto px-4 py-12 space-y-16">
        {/* Continue Reading Section */}
        {!searchQuery && !selectedGenre && (
          <div className="mb-8">
            <ContinueReading session={session} />
          </div>
        )}

        {/* Search Results */}
        {searchQuery && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="h-8 rounded-md w-[.3rem] bg-white"></span>
                <h2 className="text-2xl font-medium">Search Results</h2>
                <div className="flex items-center bg-white px-3 py-1 rounded-full text-xs text-black">
                  {isSearching ? (
                    <>
                      <div className="w-3 h-3 border border-black/20 border-t-black rounded-full animate-spin mr-2" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <span>{searchResults.length} results for "{searchQuery}"</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSearchQuery('')}
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Clear Search
              </button>
            </div>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 md:gap-4">
                {searchResults.map((manga) => (
                  <MangaCard key={manga.id} manga={manga} compact={true} />
                ))}
              </div>
            ) : !isSearching && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">No manga found</p>
              </div>
            )}
          </div>
        )}

        {/* Genre Results */}
        {selectedGenre && !searchQuery && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="h-8 rounded-md w-[.3rem] bg-white"></span>
                <h2 className="text-2xl font-medium">{selectedGenre} Manga</h2>
                <div className="flex items-center bg-white px-3 py-1 rounded-full text-xs text-black">
                  <span>{genreResults.length} titles</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedGenre(null)}
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Clear Filter
              </button>
            </div>
            {genreResults.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 md:gap-4">
                {genreResults.map((manga) => (
                  <MangaCard key={manga.id} manga={manga} compact={true} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">No {selectedGenre} manga found</p>
              </div>
            )}
          </div>
        )}

        {/* Default Sections */}
        {!searchQuery && !selectedGenre && (
          <>
            {/* Trending Manga */}
            {trendingManga && trendingManga.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="h-8 rounded-md w-[.3rem] bg-white"></span>
                    <h2 className="text-2xl font-medium">Trending Manga</h2>
                    <div className="flex items-center bg-white px-3 py-1 rounded-full text-xs text-black">
                      <span>📈</span>
                      <span className="ml-1">Hot Right Now</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 md:gap-4">
                  {trendingManga.slice(0, 18).map((manga) => (
                    <MangaCard key={manga.id} manga={manga} compact={true} />
                  ))}
                </div>
              </div>
            )}

            {/* Popular Manga */}
            {popularManga && popularManga.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="h-8 rounded-md w-[.3rem] bg-white"></span>
                    <h2 className="text-2xl font-medium">Popular Manga</h2>
                    <div className="flex items-center bg-white px-3 py-1 rounded-full text-xs text-black">
                      <span>🔥</span>
                      <span className="ml-1">Most Popular</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 md:gap-4">
                  {popularManga.slice(0, 18).map((manga) => (
                    <MangaCard key={manga.id} manga={manga} compact={true} />
                  ))}
                </div>
              </div>
            )}

            {/* Top Rated Manga */}
            {topRatedManga && topRatedManga.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="h-8 rounded-md w-[.3rem] bg-white"></span>
                    <h2 className="text-2xl font-medium">Top Rated Manga</h2>
                    <div className="flex items-center bg-white px-3 py-1 rounded-full text-xs text-black">
                      <span>⭐</span>
                      <span className="ml-1">Highest Scores</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 md:gap-4">
                  {topRatedManga.slice(0, 18).map((manga) => (
                    <MangaCard key={manga.id} manga={manga} compact={true} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MangaCatalogNew;
