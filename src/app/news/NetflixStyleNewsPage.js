"use client";
import React, { useState, useEffect } from 'react';
import NetflixStyleNewsGrid from '@/components/news/NetflixStyleNewsGrid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNewspaper, faRss, faFilm, faBook, faIndustry, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { fetchNewsAnilist } from '@/lib/AnilistNewsFunctions';

function NetflixStyleNewsPage({ newsData: initialNewsData }) {
  // Banner images for different categories
  const bannerImages = {
    LATEST: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21087-sHIJgP5SfvHb.jpg",
    ANIME: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-8Yo9fEGBT7Ns.jpg",
    MANGA: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-8jpFCOcDmneX.jpg",
    INDUSTRY: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/145064-vVXNAWbym1XS.jpg"
  };

  // State for category and news data
  const [activeCategory, setActiveCategory] = useState('LATEST');
  const [newsData, setNewsData] = useState(initialNewsData);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Function to fetch news by category
  const fetchNewsByCategory = async (category) => {
    setLoading(true);
    try {
      const data = await fetchNewsAnilist(1, 20, category);
      setNewsData(data);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching news for category:', category, error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch latest news on component mount if no initial data is available
  useEffect(() => {
    if (!initialNewsData || !initialNewsData.news || initialNewsData.news.length === 0) {
      fetchNewsByCategory('LATEST');
    }
  }, [initialNewsData]);

  // Handle category change
  const handleCategoryChange = (category) => {
    if (category === activeCategory) return;
    setActiveCategory(category);
    fetchNewsByCategory(category);
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    switch(category) {
      case 'LATEST': return faRss;
      case 'ANIME': return faFilm;
      case 'MANGA': return faBook;
      case 'INDUSTRY': return faIndustry;
      default: return faRss;
    }
  };

  // Get category title
  const getCategoryTitle = (category) => {
    switch(category) {
      case 'LATEST': return 'Latest Updates';
      case 'ANIME': return 'Anime News';
      case 'MANGA': return 'Manga News';
      case 'INDUSTRY': return 'Industry News';
      default: return 'Latest Updates';
    }
  };

  return (
    <div className="w-full bg-black">
      {/* Netflix-style Hero Banner Section */}
      <div className="relative w-full h-[60vh] overflow-hidden">
        {/* Background image with gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/70 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent z-10"></div>
        <img
          src={bannerImages[activeCategory]}
          alt="Anime News Banner"
          className="absolute inset-0 w-full h-full object-cover opacity-70 transition-opacity duration-500"
        />

        {/* Content positioned at bottom left */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-20 flex flex-col items-start">
          {/* Title and metadata */}
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 flex items-center">
              <FontAwesomeIcon icon={faNewspaper} className="mr-4 text-white" />
              {getCategoryTitle(activeCategory)}
            </h1>

            {/* Description */}
            <p className="text-[#ddd] text-base mb-6 max-w-2xl leading-relaxed">
              Stay updated with the latest anime news, announcements, and updates from the world of anime and manga.
            </p>

            {/* Netflix-style metadata row - Category filters */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-[#ddd] mb-4">
              <button 
                onClick={() => handleCategoryChange('LATEST')}
                className={`flex items-center px-3 py-1.5 rounded transition-colors ${activeCategory === 'LATEST' ? 'bg-white text-black font-medium' : 'border border-[#555] hover:border-white'}`}
              >
                <FontAwesomeIcon icon={faRss} className="mr-2" />
                Latest Updates
              </button>
              
              <button 
                onClick={() => handleCategoryChange('ANIME')}
                className={`flex items-center px-3 py-1.5 rounded transition-colors ${activeCategory === 'ANIME' ? 'bg-white text-black font-medium' : 'border border-[#555] hover:border-white'}`}
              >
                <FontAwesomeIcon icon={faFilm} className="mr-2" />
                ANIME
              </button>
              
              <button 
                onClick={() => handleCategoryChange('MANGA')}
                className={`flex items-center px-3 py-1.5 rounded transition-colors ${activeCategory === 'MANGA' ? 'bg-white text-black font-medium' : 'border border-[#555] hover:border-white'}`}
              >
                <FontAwesomeIcon icon={faBook} className="mr-2" />
                MANGA
              </button>
              
              <button 
                onClick={() => handleCategoryChange('INDUSTRY')}
                className={`flex items-center px-3 py-1.5 rounded transition-colors ${activeCategory === 'INDUSTRY' ? 'bg-white text-black font-medium' : 'border border-[#555] hover:border-white'}`}
              >
                <FontAwesomeIcon icon={faIndustry} className="mr-2" />
                INDUSTRY
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* News Content Section - Netflix style */}
      <div className="px-4 sm:px-8 md:px-12 py-8 bg-black">
        <h2 className="text-xl sm:text-2xl font-medium text-white mb-6 sm:mb-8 border-l-4 border-white pl-4 flex items-center">
          <FontAwesomeIcon icon={getCategoryIcon(activeCategory)} className="mr-3 text-white" />
          {getCategoryTitle(activeCategory)}
          {loading && <FontAwesomeIcon icon={faSpinner} className="ml-3 animate-spin text-white" />}
        </h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-64 bg-[#0a0a0a] rounded-lg border border-[#222]">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-4 border-t-white border-r-white border-b-transparent border-l-transparent animate-spin mb-4"></div>
              <p className="text-white text-lg">Loading {activeCategory.toLowerCase()} news...</p>
            </div>
          </div>
        ) : newsData && newsData.news ? (
          <NetflixStyleNewsGrid newsItems={newsData.news} />
        ) : (
          <div className="flex justify-center items-center h-64 bg-[#0a0a0a] rounded-lg border border-[#222]">
            <div className="flex flex-col items-center">
              <FontAwesomeIcon icon={faNewspaper} className="text-white text-4xl mb-4" />
              <p className="text-white text-lg">No news available</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NetflixStyleNewsPage;
