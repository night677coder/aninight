"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Input, Tooltip } from '@nextui-org/react';
import MangaCard from '@/components/CardComponent/MangaCard';
import { searchMangaAnilist } from '@/lib/MangaFunctions';
import ContinueReading from '@/components/home/ContinueReading';
import { motion } from 'framer-motion';

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
  'Mystery', 'Psychological', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports',
  'Supernatural', 'Thriller'
];

const SORT_OPTIONS = [
  { id: 'popularity', label: 'Popular' },
  { id: 'score', label: 'Top Rated' },
  { id: 'trending', label: 'Trending' },
  { id: 'newest', label: 'Newest' }
];

function MangaCatalogModern({ popularManga, trendingManga, searchParams, session }) {
  // State variables
  const [searchQuery, setSearchQuery] = useState(searchParams?.search || '');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [genreResults, setGenreResults] = useState([]);
  const [sortOption, setSortOption] = useState('popularity');
  const [isGridView, setIsGridView] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs
  const searchInputRef = useRef(null);
  const contentRef = useRef(null);
  
  // Handle search input with debounce
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
  
  // Handle scroll events for showing scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Search function
  const performSearch = async (query) => {
    setIsSearching(true);
    setSelectedGenre(null);
    setIsLoading(true);
    
    try {
      const results = await searchMangaAnilist(query, 1);
      setSearchResults(results?.media || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
      setIsLoading(false);
    }
  };

  // Genre filter function
  const handleGenreClick = (genre) => {
    setIsLoading(true);
    setSelectedGenre(genre);
    setSearchQuery('');
    const filtered = (popularManga || []).filter(m => m.genres?.includes(genre));
    setGenreResults(filtered);
    setIsLoading(false);
  };

  // Sort function
  const sortManga = (mangaList) => {
    if (!mangaList) return [];
    
    const list = [...mangaList];
    
    switch (sortOption) {
      case 'score':
        return list.sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0));
      case 'newest':
        return list.sort((a, b) => {
          const dateA = a.startDate ? new Date(a.startDate.year, a.startDate.month || 1, a.startDate.day || 1) : new Date(0);
          const dateB = b.startDate ? new Date(b.startDate.year, b.startDate.month || 1, b.startDate.day || 1) : new Date(0);
          return dateB - dateA;
        });
      case 'trending':
        return list.sort((a, b) => (b.trending || 0) - (a.trending || 0));
      case 'popularity':
      default:
        return list.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Get the appropriate manga list based on current state
  const getMangaList = () => {
    if (searchQuery && searchResults.length > 0) {
      return sortManga(searchResults);
    } else if (selectedGenre && genreResults.length > 0) {
      return sortManga(genreResults);
    } else {
      return sortManga(popularManga);
    }
  };

  // Animation variants for framer-motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Fixed background grid pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {/* Hero section */}
        <section className="relative pt-16 pb-20 overflow-hidden">
          <div className="absolute top-0 left-1/2 w-[600px] h-[600px] -translate-x-1/2 bg-white/[0.01] rounded-full blur-[100px]" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h1 className="text-[80px] sm:text-[120px] font-black text-white tracking-tight leading-none mb-4">
                <span className="inline-block relative">
                  <span className="relative z-10">MANGA</span>
                  <span className="absolute inset-0 z-0 text-white/5 blur-lg">MANGA</span>
                </span>
              </h1>
              
              <div className="h-[1px] w-40 bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto mb-6" />
              
              <p className="text-white/60 text-sm tracking-[0.3em] uppercase font-light">
                Discover • Read • Collect
              </p>
            </motion.div>

            {/* Search bar */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-3xl mx-auto mb-12"
            >
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-white/10 via-white/5 to-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-black border border-white/10 rounded-full overflow-hidden backdrop-blur-xl">
                  <Input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search manga by title..."
                    size="lg"
                    classNames={{
                      input: "bg-transparent text-white text-lg placeholder:text-gray-500 font-light",
                      inputWrapper: "bg-transparent border-none shadow-none h-16 px-8"
                    }}
                    startContent={
                      <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    }
                    endContent={
                      isSearching ? (
                        <div className="w-5 h-5 border border-white/20 border-t-white rounded-full animate-spin" />
                      ) : searchQuery ? (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="text-gray-500 hover:text-white transition-colors duration-300"
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
            </motion.div>

            {/* Genre filters */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-12"
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-white/20" />
                <p className="text-white/40 text-xs tracking-[0.3em] uppercase font-light whitespace-nowrap">
                  Browse by Genre
                </p>
                <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-white/20" />
              </div>
              
              <div className="flex flex-wrap justify-center gap-2 max-w-5xl mx-auto">
                {GENRES.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => handleGenreClick(genre)}
                    className={`relative px-6 py-2.5 text-xs font-light tracking-wider transition-all duration-300 ${
                      selectedGenre === genre 
                        ? 'text-black bg-white' 
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    <div className={`absolute inset-0 border ${
                      selectedGenre === genre 
                        ? 'border-white' 
                        : 'border-white/10 hover:border-white/30'
                    } rounded-full`} />
                    <span className="relative z-10">{genre}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Content section */}
        <section ref={contentRef} className="relative pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Continue Reading Section */}
            {!searchQuery && !selectedGenre && (
              <div className="mb-16">
                <ContinueReading session={session} />
              </div>
            )}
            
            {/* Results header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-medium mb-2">
                  {searchQuery 
                    ? `Search Results for "${searchQuery}"` 
                    : selectedGenre 
                      ? `${selectedGenre} Manga` 
                      : 'All Manga'}
                </h2>
                <p className="text-white/50 text-sm">
                  {isLoading ? (
                    <span className="flex items-center">
                      <span className="w-4 h-4 border border-white/20 border-t-white rounded-full animate-spin mr-2" />
                      Loading...
                    </span>
                  ) : getMangaList().length > 0 ? (
                    `Showing ${getMangaList().length} titles`
                  ) : (
                    'No results found'
                  )}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Sort options */}
                <div className="flex items-center gap-2 border border-white/10 rounded-full p-1">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSortOption(option.id)}
                      className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                        sortOption === option.id 
                          ? 'bg-white text-black' 
                          : 'text-white/70 hover:text-white'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                
                {/* View toggle */}
                <div className="flex items-center border border-white/10 rounded-full p-1">
                  <Tooltip content="Grid View">
                    <button
                      onClick={() => setIsGridView(true)}
                      className={`p-2 rounded-full ${isGridView ? 'bg-white text-black' : 'text-white/70 hover:text-white'}`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                  </Tooltip>
                  <Tooltip content="List View">
                    <button
                      onClick={() => setIsGridView(false)}
                      className={`p-2 rounded-full ${!isGridView ? 'bg-white text-black' : 'text-white/70 hover:text-white'}`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                  </Tooltip>
                </div>
                
                {/* Clear filters button */}
                {(searchQuery || selectedGenre) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedGenre(null);
                    }}
                    className="flex items-center gap-1 text-sm text-white/60 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
            
            {/* Results content */}
            {getMangaList().length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={isGridView 
                  ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
                  : "flex flex-col gap-4"
                }
              >
                {getMangaList().map((manga) => (
                  <motion.div key={manga.id} variants={itemVariants}>
                    {isGridView ? (
                      <MangaCard manga={manga} compact={true} />
                    ) : (
                      <div className="flex border border-white/10 rounded-xl overflow-hidden hover:border-white/30 transition-all duration-300 bg-black/50 backdrop-blur-sm">
                        <div className="w-[100px] h-[150px] relative flex-shrink-0">
                          <img 
                            src={manga.coverImage?.extraLarge || manga.coverImage?.large} 
                            alt={manga.title?.english || manga.title?.romaji}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4 flex flex-col">
                          <h3 className="text-lg font-medium mb-1">{manga.title?.english || manga.title?.romaji}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            {manga.averageScore && (
                              <span className="flex items-center gap-1 text-xs text-white/70">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                {(manga.averageScore / 10).toFixed(1)}
                              </span>
                            )}
                            {manga.format && (
                              <span className="text-xs text-white/70 border border-white/10 px-2 py-0.5 rounded-full">
                                {manga.format}
                              </span>
                            )}
                            {manga.status && (
                              <span className="text-xs text-white/70 border border-white/10 px-2 py-0.5 rounded-full">
                                {manga.status.replace(/_/g, ' ')}
                              </span>
                            )}
                          </div>
                          {manga.genres && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {manga.genres.slice(0, 3).map(genre => (
                                <span key={genre} className="text-xs text-white/60">
                                  {genre}
                                  {manga.genres.indexOf(genre) < Math.min(2, manga.genres.length - 1) && ','}
                                </span>
                              ))}
                              {manga.genres.length > 3 && (
                                <span className="text-xs text-white/60">+{manga.genres.length - 3}</span>
                              )}
                            </div>
                          )}
                          {manga.description && (
                            <p className="text-xs text-white/70 line-clamp-2 mt-auto">
                              {manga.description.replace(/<[^>]*>/g, '')}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            ) : !isLoading && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-white/50 text-sm mb-2">No manga found</p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedGenre(null);
                  }}
                  className="text-white border border-white/20 hover:border-white px-4 py-2 rounded-full text-sm transition-all"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Scroll to top button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: showScrollTop ? 1 : 0,
          scale: showScrollTop ? 1 : 0.8,
          pointerEvents: showScrollTop ? 'auto' : 'none'
        }}
        transition={{ duration: 0.3 }}
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 z-50 bg-white text-black w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-200 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </motion.button>
    </div>
  );
}

export default MangaCatalogModern;
