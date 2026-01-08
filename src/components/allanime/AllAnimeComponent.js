"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faPlay, faCalendarAlt, faFilm, faSpinner, faSearch, faSortAmountDown } from '@fortawesome/free-solid-svg-icons';

function AllAnimeComponent() {
  const [allAnime, setAllAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('POPULARITY_DESC');
  const [error, setError] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState('');

  // Popular anime genres (matching Anilist API)
  const genres = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 
    'Horror', 'Mecha', 'Music', 'Mystery', 'Romance', 
    'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller'
  ];

  const fetchAllAnime = async (pageNum = 1, search = '', sort = 'POPULARITY_DESC', genre = '') => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/anime/all?page=${pageNum}&search=${encodeURIComponent(search)}&sort=${sort}&genre=${encodeURIComponent(genre)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (pageNum === 1) {
        setAllAnime(data.results || []);
      } else {
        setAllAnime(prev => [...prev, ...(data.results || [])]);
      }
      
      setHasMore(data.hasNextPage || false);
    } catch (error) {
      console.error('Error fetching all anime:', error);
      setError(error.message);
      setAllAnime([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchAllAnime(1, searchTerm, sortBy, selectedGenre);
  }, [searchTerm, sortBy, selectedGenre]);

  const handleGenreChange = (genre) => {
    setSelectedGenre(genre === selectedGenre ? '' : genre);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchAllAnime(nextPage, searchTerm, sortBy, selectedGenre);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
  };

  const handleSort = (e) => {
    const sort = e.target.value;
    setSortBy(sort);
  };

  const truncateDescription = (html, maxLength = 100) => {
    if (!html) return '';
    const text = html.replace(/<[^>]*>/g, '');
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black"></div>
        <div className="relative z-10 px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">All Anime</h1>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Browse our complete collection of anime series. Discover your next favorite show from thousands of titles.
          </p>
          
          {/* Search and Sort Controls */}
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 px-4">
            <div className="flex-1 relative">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search anime..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full px-4 py-3 pr-10 bg-[#1a1a1a] border border-[#333] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#444] focus:bg-[#252525] transition-all appearance-none"
                />
                <FontAwesomeIcon 
                  icon={faSearch} 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:text-white transition-colors"
                />
              </div>
            </div>
            <div className="relative group">
              <select
                value={sortBy}
                onChange={handleSort}
                className="appearance-none px-4 py-3 pr-10 bg-[#1a1a1a] border border-[#333] rounded-lg text-white focus:outline-none focus:border-[#444] focus:bg-[#252525] transition-all cursor-pointer hover:bg-[#2a2a2a] hover:border-[#555] shadow-lg"
              >
                <option value="POPULARITY_DESC">🔥 Most Popular</option>
                <option value="SCORE_DESC">⭐ Highest Rated</option>
                <option value="TITLE_ROMAJI">🔤 Title (A-Z)</option>
                <option value="TITLE_ROMAJI_DESC">🔁 Title (Z-A)</option>
                <option value="START_DATE_DESC">🆕 Newest</option>
                <option value="START_DATE">📅 Oldest</option>
              </select>
              <FontAwesomeIcon 
                icon={faSortAmountDown} 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:text-white transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Genre Filter Section */}
      <div className="border-b border-[#222]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-white font-semibold text-sm">Genres:</span>
            <button
              onClick={() => setSelectedGenre('')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedGenre === '' 
                  ? 'bg-white text-black' 
                  : 'bg-[#333] text-gray-300 hover:bg-[#444]'
              }`}
            >
              All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => handleGenreChange(genre)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedGenre === genre 
                    ? 'bg-white text-black' 
                    : 'bg-[#333] text-gray-300 hover:bg-[#444]'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Anime Grid */}
      <div className="px-4 py-8">
        {error ? (
          <div className="text-center py-20">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 max-w-md mx-auto">
              <FontAwesomeIcon icon={faFilm} className="text-4xl text-red-400 mb-4" />
              <h2 className="text-xl font-semibold text-red-400 mb-2">Oops! Something went wrong!</h2>
              <p className="text-gray-300 mb-4">{error}</p>
              <button
                onClick={() => fetchAllAnime(1, searchTerm, sortBy)}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : loading && allAnime.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <FontAwesomeIcon icon={faSpinner} className="text-4xl animate-spin" />
          </div>
        ) : allAnime.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No anime found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
              {allAnime.map((anime) => (
                <Link href={`/anime/info/${anime.id}`} key={anime.id} className="group">
                  <div className="bg-[#111] rounded-lg overflow-hidden border border-[#222] hover:border-white transition-all duration-300 h-full flex flex-col transform group-hover:scale-[1.02]">
                    {/* Cover Image */}
                    <div className="relative pt-[140%] overflow-hidden">
                      <img 
                        src={anime.coverImage?.extraLarge || anime.coverImage?.large || '/placeholder.jpg'} 
                        alt={anime.title?.english || anime.title?.romaji}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                      
                      {/* Rating Badge */}
                      {anime.averageScore && (
                        <div className="absolute top-2 right-2">
                          <div className="bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-white text-xs inline-flex items-center">
                            <FontAwesomeIcon icon={faStar} className="text-yellow-400 mr-1" />
                            {(anime.averageScore / 10).toFixed(1)}
                          </div>
                        </div>
                      )}
                      
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                          <FontAwesomeIcon icon={faPlay} className="text-black ml-1" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-3 flex flex-col flex-grow">
                      <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-gray-300 transition-colors mb-2">
                        {anime.title?.english || anime.title?.romaji}
                      </h3>
                      
                      <div className="flex flex-wrap gap-1.5 mt-auto">
                        {anime.format && (
                          <span className="px-2 py-0.5 bg-white/20 text-white rounded-full text-xs">
                            {anime.format.replace(/_/g, ' ')}
                          </span>
                        )}
                        {anime.season && anime.startDate?.year && (
                          <span className="px-2 py-0.5 bg-[#222] text-gray-300 rounded-full text-xs capitalize">
                            {anime.season.toLowerCase()} {anime.startDate.year}
                          </span>
                        )}
                        {anime.episodes && (
                          <span className="px-2 py-0.5 bg-[#222] text-gray-300 rounded-full text-xs">
                            {anime.episodes} EP
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                  ) : null}
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AllAnimeComponent;
