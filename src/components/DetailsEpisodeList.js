"use client"
import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { getEpisodes } from "@/lib/getData";
import { ProvidersMap } from "@/utils/EpisodeFunctions";
import { Select, SelectItem, Tooltip, Input, Pagination } from "@nextui-org/react";
import { toast } from "sonner";
import { useSubtype, useSettings } from '@/lib/store';
import { useStore } from 'zustand';
import Image from 'next/image';
import Link from 'next/link';

function DetailsEpisodeList({ data, id, progress, setUrl }) {
  const subtype = useStore(useSubtype, (state) => state.subtype);
  
  // Main state variables
  const [loading, setLoading] = useState(true);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [displayMode, setDisplayMode] = useState('grid');
  const [filteredEpisodes, setFilteredEpisodes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24);
  
  // Episode data state
  const [defaultProvider, setDefaultProvider] = useState("");
  const [suboptions, setSuboptions] = useState(null);
  const [episodeData, setEpisodeData] = useState(null);
  const [dubCount, setDubCount] = useState(0);
  const [allEpisodes, setAllEpisodes] = useState(null);
  
  // References
  const episodeListRef = useRef(null);
  const searchInputRef = useRef(null);
  
  // Handle pagination
  useEffect(() => {
    if (allEpisodes?.length > 0) {
      let filtered = [...allEpisodes];
      
      // Apply search filter if search term exists
      if (searchTerm) {
        filtered = filtered.filter(ep => 
          ep.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
          ep.number.toString().includes(searchTerm)
        );
      }
      
      // Create paginated view
      const startIdx = (currentPage - 1) * itemsPerPage;
      const endIdx = startIdx + itemsPerPage;
      setFilteredEpisodes(filtered.slice(startIdx, endIdx));
      
      // Auto-scroll to top of episode list when page changes
      if (episodeListRef.current) {
        episodeListRef.current.scrollTop = 0;
      }
    }
  }, [allEpisodes, currentPage, itemsPerPage, searchTerm]);
  
  // Calculate total pages for pagination
  const totalPages = useMemo(() => {
    if (!allEpisodes) return 0;
    
    let count = allEpisodes.length;
    if (searchTerm) {
      count = allEpisodes.filter(ep => 
        ep.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        ep.number.toString().includes(searchTerm)
      ).length;
    }
    
    return Math.ceil(count / itemsPerPage);
  }, [allEpisodes, itemsPerPage, searchTerm]);
  
  // Load display mode from local storage
  useEffect(() => {
    const savedDisplayMode = localStorage.getItem('detailsEpisodeDisplayMode');
    if (savedDisplayMode) {
      setDisplayMode(savedDisplayMode);
    }
    
    // Set items per page based on display mode
    if (savedDisplayMode === 'compact') {
      setItemsPerPage(50);
    } else if (savedDisplayMode === 'details') {
      setItemsPerPage(15);
    } else {
      setItemsPerPage(24);
    }
  }, []);
  
  // Fetch episode data on component mount
  useEffect(() => {
    const fetchEpisodes = async () => {
      if (data?.type === 'MANGA' || data?.status === 'NOT_YET_RELEASED') {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        // Get default provider from settings
        const savedSettings = useSettings.getState().settings;
        const preferredProvider = savedSettings?.defaultProvider || 'animepahe';
        
        const response = await getEpisodes(id, data?.idMal, data?.status, false, 0, preferredProvider);
        
        if (!response || response.length === 0) {
          setLoading(false);
          return;
        }
        
        setEpisodeData(response);
        const { suboptions, dubLength } = ProvidersMap(response);
        setSuboptions(suboptions);
        setDubCount(dubLength);
        
        if (response.length > 0) {
          // Set the provider that was used
          setDefaultProvider(preferredProvider);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching episodes:", error);
        setLoading(false);
      }
    };
    
    fetchEpisodes();
  }, [id, data?.idMal, data?.status, data?.type]);
  
  // Handle provider change
  const handleProviderChange = (e) => {
    setDefaultProvider(e.target.value);
  };
  
  // Handle sub/dub change
  const handleSubDub = (e) => {
    useSubtype.setState({ subtype: e.target.value });
  };
  
  // Update episodes when provider or subtitle option changes
  useEffect(() => {
    if (!episodeData) return;
    
    const provider = episodeData?.find((i) => i.providerId === defaultProvider);
    
    if (!provider) {
      setAllEpisodes([]);
      return;
    }
    
    let filteredEpisodes;
    
    if (provider.consumet === true) {
      filteredEpisodes = subtype === 'sub' ? provider.episodes?.sub : provider.episodes?.dub;
    } else {
      filteredEpisodes = subtype === 'dub'
        ? provider.episodes?.slice(0, dubCount) 
        : provider.episodes;
    }
    
    // Handle sorting direction
    if (filteredEpisodes) {
      const sortedEpisodes = [...filteredEpisodes];
      if (sortDirection === 'desc') {
        sortedEpisodes.reverse();
      }
      setAllEpisodes(sortedEpisodes);
    }
  }, [episodeData, subtype, defaultProvider, dubCount, sortDirection]);
  
  // Set watch URL for the "Watch Now" button
  useEffect(() => {
    if (allEpisodes && allEpisodes.length > 0) {
      const nextEpisodeToWatch = progress > 0
        ? allEpisodes.find(ep => ep.number === progress + 1) || allEpisodes[0]
        : allEpisodes[0];
      
      if (nextEpisodeToWatch) {
        const watchUrl = `/anime/watch?id=${data?.id}&host=${defaultProvider}&epid=${encodeURIComponent(nextEpisodeToWatch?.id || nextEpisodeToWatch?.episodeId)}&ep=${nextEpisodeToWatch?.number}&type=${subtype}`;
        setUrl(watchUrl);
      }
    }
  }, [allEpisodes, progress, defaultProvider, data?.id, subtype, setUrl]);
  
  // Refresh episodes
  const refreshEpisodes = async () => {
    setRefreshLoading(true);
    try {
      const response = await getEpisodes(id, data?.idMal, data?.status === "RELEASING", true);
      
      if (!response || response.length === 0) {
        setRefreshLoading(false);
        return;
      }
      
      setEpisodeData(response);
      const { suboptions, dubLength } = ProvidersMap(response);
      setSuboptions(suboptions);
      setDubCount(dubLength);
      toast.success("Episodes refreshed successfully!");
    } catch (error) {
      console.error("Error refreshing episodes:", error);
      toast.error("Failed to refresh episodes. Please try again.");
    } finally {
      setRefreshLoading(false);
    }
  };
  
  // Toggle sort direction
  const toggleSort = () => {
    setSortDirection(prevSort => prevSort === 'asc' ? 'desc' : 'asc');
  };
  
  // Handle display mode change
  const changeDisplayMode = (mode) => {
    setDisplayMode(mode);
    localStorage.setItem('detailsEpisodeDisplayMode', mode);
    
    // Adjust items per page based on display mode
    if (mode === 'compact') {
      setItemsPerPage(50);
    } else if (mode === 'details') {
      setItemsPerPage(15);
    } else {
      setItemsPerPage(24);
    }
  };
  
  // Handle search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };
  
  // Toggle mobile filters
  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };
  
  // Check if an episode is the next one to watch
  const isNextEpisode = (episodeNumber) => {
    return episodeNumber === progress + 1;
  };
  
  // Check if an episode has been watched
  const isWatched = (episodeNumber) => {
    return episodeNumber <= progress;
  };
  
  // Render episode grid items
  const renderGridEpisodes = () => {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 mt-4">
        {filteredEpisodes.map((episode) => {
          const isNext = isNextEpisode(episode.number);
          const watched = isWatched(episode.number);
          
          return (
            <Link
              href={`/anime/watch?id=${data?.id}&host=${defaultProvider}&epid=${encodeURIComponent(
                episode?.id || episode?.episodeId
              )}&ep=${episode?.number}&type=${subtype}`}
              key={episode?.id || episode?.episodeId}
              className={`group flex flex-col relative transition-all duration-300 hover:scale-105 ${
                isNext ? 'ring-2 ring-white' : ''
              }`}
            >
              <div className="aspect-video relative overflow-hidden rounded-md bg-black">
                <Image 
                  src={episode?.image || episode?.img || data?.coverImage?.extraLarge || data?.bannerImage || ''} 
                  alt={`Episode ${episode.number}`}
                  fill
                  className={`object-cover ${watched ? 'opacity-60' : ''}`}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
                  <span className="text-white text-sm font-medium">EP {episode.number}</span>
                </div>
                {isNext && (
                  <div className="absolute right-2 top-2 bg-white text-black text-xs px-2 py-0.5 rounded-full font-semibold">
                    Next
                  </div>
                )}
                {watched && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="relative h-12 w-12 flex items-center justify-center rounded-full bg-white/20">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                      </svg>
                    </div>
                  </div>
                )}
                {episode.isFiller && (
                  <div className="absolute bottom-2 right-2 bg-yellow-600 text-white text-xs px-1.5 py-0.5 rounded">
                    Filler
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#121212]">
                  <div 
                    className={`h-full ${watched ? 'bg-white' : 'bg-transparent'}`}
                    style={{ width: watched ? '100%' : '0%' }}
                  ></div>
                </div>
              </div>
              <div className="mt-1.5 px-0.5">
                <h4 className="text-xs sm:text-sm font-medium truncate text-gray-200">
                  {episode.title || `Episode ${episode.number}`}
                </h4>
              </div>
            </Link>
          );
        })}
      </div>
    );
  };
  
  // Render compact episode list
  const renderCompactEpisodes = () => {
    return (
      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2 mt-4">
        {filteredEpisodes.map((episode) => {
          const isNext = isNextEpisode(episode.number);
          const watched = isWatched(episode.number);
          
          return (
            <Link
              href={`/anime/watch?id=${data?.id}&host=${defaultProvider}&epid=${encodeURIComponent(
                episode?.id || episode?.episodeId
              )}&ep=${episode?.number}&type=${subtype}`}
              key={episode?.id || episode?.episodeId}
            >
              <div 
                className={`relative flex items-center justify-center h-10 rounded-md transition ${
                  isNext 
                    ? 'bg-white text-black font-semibold' 
                    : watched
                      ? 'bg-[#333] text-gray-300'
                      : episode.isFiller 
                        ? 'bg-yellow-800/30 hover:bg-yellow-800/50 text-gray-200' 
                        : 'bg-[#121212] hover:bg-[#1a1a1a] text-gray-300'
                }`}
              >
                <span>{episode.number}</span>
                {watched && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    );
  };
  
  // Render detailed episode list
  const renderDetailedEpisodes = () => {
    return (
      <div className="flex flex-col gap-3 mt-4">
        {filteredEpisodes.map((episode) => {
          const isNext = isNextEpisode(episode.number);
          const watched = isWatched(episode.number);
          
          return (
            <Link
              href={`/anime/watch?id=${data?.id}&host=${defaultProvider}&epid=${encodeURIComponent(
                episode?.id || episode?.episodeId
              )}&ep=${episode?.number}&type=${subtype}`}
              key={episode?.id || episode?.episodeId}
              className={`group flex flex-row transition-all duration-300 hover:bg-[#121212] rounded-xl overflow-hidden ${
                isNext ? 'ring-1 ring-white' : ''
              }`}
            >
              <div className="relative w-[180px] h-[100px]">
                <Image 
                  src={episode?.image || episode?.img || data?.coverImage?.extraLarge || data?.bannerImage || ''} 
                  alt={`Episode ${episode.number}`}
                  fill
                  className={`object-cover ${watched ? 'opacity-70' : ''}`}
                  sizes="180px"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  {watched && (
                    <div className="rounded-full bg-black/50 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                      </svg>
                    </div>
                  )}
                  {!watched && (
                    <div className="rounded-full bg-black/50 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-sm px-2 py-0.5 rounded-md">
                  EP {episode.number}
                </div>
                {isNext && (
                  <div className="absolute top-2 right-2 bg-white text-black text-xs px-2 py-0.5 rounded-full font-semibold">
                    Next
                  </div>
                )}
                {episode.isFiller && (
                  <div className="absolute top-2 right-2 bg-yellow-600 text-white text-xs px-1.5 py-0.5 rounded">
                    Filler
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#121212]">
                  <div 
                    className={`h-full ${watched ? 'bg-white' : 'bg-transparent'}`}
                    style={{ width: watched ? '100%' : '0%' }}
                  ></div>
                </div>
              </div>
              <div className="flex flex-col p-3 flex-1">
                <h3 className="text-sm md:text-base font-medium text-gray-200">{episode.title || `Episode ${episode.number}`}</h3>
                {episode.description && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                    {episode.description}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    );
  };
  
  // Show empty state or loading indicators
  if (loading) {
    return (
      <div className="p-4 bg-black rounded-xl text-center">
        <div className="animate-pulse">
          <div className="h-10 bg-[#121212] rounded-md w-3/4 mx-auto mb-4"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, idx) => (
              <div key={idx} className="space-y-2">
                <div className="h-28 bg-[#121212] rounded-md"></div>
                <div className="h-4 bg-[#121212] rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (data?.type === 'MANGA') {
    return (
      <div className="p-6 bg-black rounded-xl text-center">
        <p className="text-lg font-semibold text-gray-200">Coming Soon!</p>
        <p className="text-gray-400">Cannot Fetch Manga, Feature Coming Soon.</p>
      </div>
    );
  }
  
  if (data?.status === 'NOT_YET_RELEASED') {
    return (
      <div className="p-6 bg-black rounded-xl text-center">
        <p className="text-lg font-semibold text-gray-200">Coming Soon!</p>
        <p className="text-gray-400">Sorry, this anime isn't out yet. Keep an eye out for updates!</p>
      </div>
    );
  }
  
  if (!allEpisodes || allEpisodes.length === 0) {
    return (
      <div className="p-6 bg-black rounded-xl text-center">
        <p className="text-lg font-semibold text-gray-200">No Episodes Available</p>
        <p className="text-gray-400">This anime is currently unavailable. Check back later for updates!</p>
      </div>
    );
  }
  
  return (
    <div className="bg-black rounded-xl p-4 shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-lg text-gray-100">Episodes</h3>
          <Tooltip content="Refresh Episodes">
            <button 
              onClick={refreshEpisodes} 
              className="p-1.5 rounded-full bg-[#121212] hover:bg-[#1a1a1a] transition-colors"
              disabled={refreshLoading}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth="2" 
                stroke="currentColor" 
                className={`w-4 h-4 ${refreshLoading ? "animate-spin" : ""}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
          </Tooltip>
          <span className="text-gray-400 text-sm">{allEpisodes?.length || 0} episodes</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center sm:hidden">
            <button 
              onClick={toggleMobileFilters}
              className="p-1.5 rounded-full bg-[#121212] hover:bg-[#1a1a1a] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </button>
          </div>
          
          <div className={`${showMobileFilters ? 'flex' : 'hidden'} sm:flex flex-wrap items-center gap-2`}>
            <Select
              aria-label="Provider"
              selectedKeys={[defaultProvider]}
              className="w-32 min-w-[8rem]"
              size="sm"
              variant="bordered"
              onChange={handleProviderChange}
              classNames={{
                trigger: "bg-[#121212] data-[hover=true]:bg-[#1a1a1a]",
                popover: "bg-[#121212]"
              }}
            >
              {episodeData?.map((item) => (
                <SelectItem key={item.providerId} value={item.providerId}>
                  {item.providerId}
                </SelectItem>
              ))}
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearch}
              className="max-w-[200px] hidden sm:flex"
              size="sm"
              variant="bordered"
              classNames={{
                inputWrapper: "bg-[#121212] data-[hover=true]:bg-[#1a1a1a]"
              }}
              startContent={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>
        </div>
      </div>
      
      {/* Mobile search bar */}
      {showMobileFilters && (
        <div className="mb-4 sm:hidden">
          <Input
            type="text"
            placeholder="Search episodes..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full"
            size="sm"
            variant="bordered"
            classNames={{
              inputWrapper: "bg-[#121212] data-[hover=true]:bg-[#1a1a1a]"
            }}
            startContent={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>
      )}
      
      {/* Progress indicator */}
      {progress > 0 && (
        <div className="mb-4 bg-[#121212] rounded-lg p-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-300">Progress</span>
            <span className="text-sm text-gray-300">{progress} / {data?.episodes || '?'} episodes</span>
          </div>
          <div className="w-full bg-[#1a1a1a] rounded-full h-2.5">
            <div 
              className="bg-white h-2.5 rounded-full" 
              style={{ width: `${data?.episodes ? (progress / data.episodes) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-white rounded-full"></div>
          <span>Next episode</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#333] rounded-full"></div>
          <span>Watched</span>
        </div>
        {filteredEpisodes.some(ep => ep.isFiller) && (
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-800/30 rounded-full"></div>
            <span>Filler</span>
          </div>
        )}
      </div>
      
      {/* Episode lists by display mode */}
      <div ref={episodeListRef} className="overflow-auto" style={{ maxHeight: '70vh', backgroundColor: '#000000' }}>
        {displayMode === 'grid' && renderGridEpisodes()}
        {displayMode === 'compact' && renderCompactEpisodes()}
        {displayMode === 'details' && renderDetailedEpisodes()}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination
            total={totalPages}
            initialPage={currentPage}
            onChange={setCurrentPage}
            size="sm"
            showControls
            color="secondary"
            variant="bordered"
            classNames={{
              cursor: "bg-white text-black",
              item: "text-white bg-[#121212] hover:bg-[#1a1a1a]",
              prev: "bg-[#121212] hover:bg-[#1a1a1a]",
              next: "bg-[#121212] hover:bg-[#1a1a1a]"
            }}
          />
        </div>
      )}
    </div>
  );
}

export default DetailsEpisodeList; 
