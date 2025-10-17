"use client"
import React, { useState, useEffect } from 'react';
import { Input, Button } from '@nextui-org/react';
import MangaCard from '@/components/CardComponent/MangaCard';
import { searchMangaAnilist, getTrendingManga } from '@/lib/MangaFunctions';

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
  'Mystery', 'Psychological', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports'
];

const SECTIONS = [
  { id: 'popular', label: 'Popular', icon: '🔥' },
  { id: 'trending', label: 'Trending', icon: '📈' },
  { id: 'top-rated', label: 'Top Rated', icon: '⭐' },
];

function MangaCatalog({ initialData, searchParams }) {
  const [manga, setManga] = useState(initialData || []);
  const [searchQuery, setSearchQuery] = useState(searchParams?.search || '');
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedSection, setSelectedSection] = useState('popular');
  const [trendingManga, setTrendingManga] = useState([]);

  // Fetch trending manga
  useEffect(() => {
    const fetchTrending = async () => {
      const trending = await getTrendingManga();
      setTrendingManga(trending || []);
    };
    fetchTrending();
  }, []);

  // Handle search with debounce
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        setManga(initialData || []);
        setCurrentPage(1);
        setHasMore(false);
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const performSearch = async (query) => {
    setIsSearching(true);
    setSelectedGenre(null);
    try {
      const results = await searchMangaAnilist(query, 1);
      if (results && results.media) {
        setManga(results.media);
        setCurrentPage(1);
        setHasMore(results.pageInfo?.hasNextPage || false);
      } else {
        setManga([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Search error:', error);
      setManga([]);
    } finally {
      setIsSearching(false);
    }
  };

  const loadMore = async () => {
    if (!searchQuery.trim() || !hasMore) return;

    setIsSearching(true);
    try {
      const results = await searchMangaAnilist(searchQuery, currentPage + 1);
      if (results && results.media) {
        setManga(prev => [...prev, ...results.media]);
        setCurrentPage(prev => prev + 1);
        setHasMore(results.pageInfo?.hasNextPage || false);
      }
    } catch (error) {
      console.error('Load more error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setManga(initialData || []);
    setCurrentPage(1);
    setHasMore(false);
    setSelectedGenre(null);
  };

  const handleGenreClick = (genre) => {
    setSelectedGenre(genre);
    setSearchQuery('');
    const filtered = initialData.filter(m => m.genres?.includes(genre));
    setManga(filtered);
  };

  const handleSectionClick = (section) => {
    setSelectedSection(section);
    setSearchQuery('');
    setSelectedGenre(null);
    
    if (section === 'trending') {
      setManga(trendingManga);
    } else if (section === 'top-rated') {
      const sorted = [...initialData].sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0));
      setManga(sorted);
    } else {
      setManga(initialData);
    }
  };

  const displayManga = searchQuery ? manga : (selectedGenre ? manga : manga);

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-4 tracking-tight">
              Manga Catalog
            </h1>
            <p className="text-gray-400 text-lg">
              Discover thousands of manga across all genres
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative flex gap-3 bg-black/50 backdrop-blur-xl border border-white/20 rounded-xl p-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search manga as you type..."
                  className="flex-1"
                  classNames={{
                    input: "bg-transparent text-white placeholder:text-gray-500 text-lg",
                    inputWrapper: "bg-transparent border-none shadow-none"
                  }}
                  size="lg"
                  autoComplete="off"
                  startContent={
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                />
                {isSearching && (
                  <div className="flex items-center px-3">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  </div>
                )}
                {searchQuery && !isSearching && (
                  <Button
                    onClick={clearSearch}
                    variant="flat"
                    className="bg-white/10 text-white hover:bg-white/20"
                    size="lg"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Sections */}
          {!searchQuery && (
            <div className="flex justify-center gap-3 mb-6">
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleSectionClick(section.id)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    selectedSection === section.id
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                  }`}
                >
                  <span className="mr-2">{section.icon}</span>
                  {section.label}
                </button>
              ))}
            </div>
          )}

          {/* Genres */}
          {!searchQuery && (
            <div className="flex flex-wrap justify-center gap-2">
              {GENRES.map((genre) => (
                <button
                  key={genre}
                  onClick={() => handleGenreClick(genre)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedGenre === genre
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          )}

          {/* Search Info */}
          {searchQuery && (
            <div className="text-center mt-6">
              <p className="text-gray-400">
                {isSearching ? 'Searching...' : `Found ${displayManga.length} results for "${searchQuery}"`}
              </p>
            </div>
          )}

          {selectedGenre && !searchQuery && (
            <div className="text-center mt-6">
              <p className="text-gray-400">
                Showing {displayManga.length} {selectedGenre} manga
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Results Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {displayManga && displayManga.length > 0 ? (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 md:gap-4">
              {displayManga.map((item) => (
                <MangaCard key={item.id} manga={item} compact={true} />
              ))}
            </div>

            {/* Load More */}
            {hasMore && searchQuery && (
              <div className="flex justify-center mt-12">
                <Button
                  onClick={loadMore}
                  isLoading={isSearching}
                  size="lg"
                  className="bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-xl"
                >
                  Load More
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No manga found</h3>
            <p className="text-gray-400 mb-6">Try a different search term or genre</p>
            {(searchQuery || selectedGenre) && (
              <Button
                onClick={clearSearch}
                className="bg-white text-black hover:bg-white/90"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MangaCatalog;
