"use client"
import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { getEpisodes } from "@/lib/getData";
import { ProvidersMap } from "@/utils/EpisodeFunctions";
import { useRouter } from 'next-nprogress-bar';
import { Select, SelectItem, Tooltip, Input, Pagination } from "@nextui-org/react";
import Skeleton from "react-loading-skeleton";
import { useSubtype } from '@/lib/store';
import { useStore } from 'zustand';
import Image from 'next/image';
import Link from 'next/link';

function EnhancedEpisodeList({ id, data, onprovider, setwatchepdata, epnum }) {
  const subtype = useStore(useSubtype, (state) => state.subtype);
  const router = useRouter();

  // Main state variables
  const [loading, setLoading] = useState(true);
  const [providerChanged, setProviderChanged] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [displayMode, setDisplayMode] = useState('grid');
  const [filteredEpisodes, setFilteredEpisodes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewType, setViewType] = useState('all');
  const [sortDirection, setSortDirection] = useState('asc');

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

  // Set default page based on current episode number
  useEffect(() => {
    if (epnum && allEpisodes?.length > 0) {
      const episodeIndex = allEpisodes.findIndex(ep => ep.number === parseInt(epnum));
      if (episodeIndex !== -1) {
        const pageNum = Math.floor(episodeIndex / itemsPerPage) + 1;
        setCurrentPage(pageNum);
      }
    }
  }, [epnum, allEpisodes, itemsPerPage]);

  // Load display mode from local storage
  useEffect(() => {
    const savedDisplayMode = localStorage.getItem('episodeDisplayMode');
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
      try {
        setLoading(true);
        const response = await getEpisodes(id, data?.idMal, data?.status === "RELEASING", false);

        if (!response || response.length === 0) {
          setLoading(false);
          return;
        }

        setEpisodeData(response);
        const { suboptions, dubLength } = ProvidersMap(response);
        setSuboptions(suboptions);
        setDubCount(dubLength);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching episodes:", error);
        setLoading(false);
      }
    };

    fetchEpisodes();
  }, [id, data?.idMal, data?.status]);

  // Handle provider change
  const handleProviderChange = useCallback((provider, subvalue = "sub") => {
    setDefaultProvider(provider);
    useSubtype.setState({ subtype: subvalue });
    setProviderChanged(true);
  }, []);

  // Set initial provider
  useEffect(() => {
    setDefaultProvider(onprovider);
    setProviderChanged(true);
  }, [onprovider]);

  // Update episodes when provider or subtitle option changes
  useEffect(() => {
    if (!episodeData) return;

    const provider = episodeData?.find((i) => i.providerId === defaultProvider);

    if (!provider) {
      setAllEpisodes([]);
      setwatchepdata([]);
      return;
    }

    let filteredEpisodes;

    // Check if episodes is an object with sub/dub properties or a flat array
    const hasSubDubStructure = provider.episodes && typeof provider.episodes === 'object' && 
                                (provider.episodes.sub || provider.episodes.dub);
    
    if (hasSubDubStructure) {
      // Handle sub/dub structure (both consumet and non-consumet providers)
      filteredEpisodes = subtype === 'sub' ? provider.episodes?.sub : provider.episodes?.dub;
    } else {
      // Handle flat array (legacy format)
      filteredEpisodes = subtype === 'dub'
        ? provider.episodes?.slice(0, dubCount)
        : provider.episodes;
    }

    // Handle sorting direction
    if (filteredEpisodes && Array.isArray(filteredEpisodes)) {
      const sortedEpisodes = [...filteredEpisodes];
      if (sortDirection === 'desc') {
        sortedEpisodes.reverse();
      }
      setAllEpisodes(sortedEpisodes);
      setwatchepdata(filteredEpisodes); // Always pass the original order to parent
    }

    if (filteredEpisodes) {
      setProviderChanged(false);
    }
  }, [episodeData, subtype, defaultProvider, dubCount, setwatchepdata, sortDirection]);

  // Navigate to selected episode
  useEffect(() => {
    if (!providerChanged && allEpisodes && epnum) {
      const targetEpisode = allEpisodes.find(ep => ep.number === parseInt(epnum));

      if (targetEpisode) {
        const episodeId = encodeURIComponent(targetEpisode.id || targetEpisode.episodeId);
        let url = `/anime/watch?id=${id}&host=${defaultProvider}&epid=${episodeId}&ep=${epnum}&type=${subtype}`;
        
        // For AnimePahe, add the anime session
        if (defaultProvider === 'animepahe') {
          // First check if the episode has animeSession property
          if (targetEpisode.animeSession) {
            url += `&session=${encodeURIComponent(targetEpisode.animeSession)}`;
            // Also save to localStorage for persistence
            localStorage.setItem(`animepahe_session_${id}`, targetEpisode.animeSession);
          } else {
            // Try to get from localStorage as fallback
            const savedSession = localStorage.getItem(`animepahe_session_${id}`);
            if (savedSession) {
              url += `&session=${encodeURIComponent(savedSession)}`;
            }
          }
        }
        
        router.push(url);
      }
    }
  }, [providerChanged, allEpisodes, epnum, id, defaultProvider, subtype, router]);

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
    } catch (error) {
      console.error("Error refreshing episodes:", error);
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
    localStorage.setItem('episodeDisplayMode', mode);

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

  // Render episode grid items
  const renderGridEpisodes = () => {
    return (
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 mt-4">
        {filteredEpisodes.map((episode) => {
          const isCurrentEp = episode.number === parseInt(epnum);
          let episodeUrl = `/anime/watch?id=${data?.id}&host=${defaultProvider}&epid=${encodeURIComponent(
            episode?.id || episode?.episodeId
          )}&ep=${episode?.number}&type=${subtype}`;
          
          // For AnimePahe, add the anime session
          if (defaultProvider === 'animepahe') {
            if (episode.animeSession) {
              episodeUrl += `&session=${encodeURIComponent(episode.animeSession)}`;
            } else {
              // Try to get from localStorage as fallback
              const savedSession = localStorage.getItem(`animepahe_session_${id}`);
              if (savedSession) {
                episodeUrl += `&session=${encodeURIComponent(savedSession)}`;
              }
            }
          }
          
          return (
            <Link
              href={episodeUrl}
              key={episode?.id || episode?.episodeId}
              className={`flex flex-col relative transition-all duration-300 hover:scale-105 ${isCurrentEp ? 'ring-2 ring-white scale-95 pointer-events-none' : ''
                }`}
            >
              <div className="aspect-video relative overflow-hidden rounded-lg bg-[#18181b]">
                <Image
                  src={episode?.image || episode?.img || data?.coverImage?.extraLarge || data?.bannerImage}
                  alt={`Episode ${episode.number}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
                  <span className="text-white text-sm font-medium">EP {episode.number}</span>
                </div>
                {isCurrentEp && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                )}
                {episode.isFiller && (
                  <div className="absolute top-2 right-2 bg-yellow-600 text-white text-xs px-1.5 py-0.5 rounded">
                    Filler
                  </div>
                )}
              </div>
              <div className="mt-1.5 px-0.5">
                <h4 className="text-xs md:text-sm font-medium truncate">{episode.title || `Episode ${episode.number}`}</h4>
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
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 mt-4">
        {filteredEpisodes.map((episode) => {
          const isCurrentEp = episode.number === parseInt(epnum);
          let episodeUrl = `/anime/watch?id=${data?.id}&host=${defaultProvider}&epid=${encodeURIComponent(
            episode?.id || episode?.episodeId
          )}&ep=${episode?.number}&type=${subtype}`;
          
          // For AnimePahe, add the anime session
          if (defaultProvider === 'animepahe') {
            if (episode.animeSession) {
              episodeUrl += `&session=${encodeURIComponent(episode.animeSession)}`;
            } else {
              // Try to get from localStorage as fallback
              const savedSession = localStorage.getItem(`animepahe_session_${id}`);
              if (savedSession) {
                episodeUrl += `&session=${encodeURIComponent(savedSession)}`;
              }
            }
          }
          
          return (
            <Link
              href={episodeUrl}
              key={episode?.id || episode?.episodeId}
            >
              <div
                className={`flex items-center justify-center h-10 rounded-md ${isCurrentEp
                  ? 'bg-white text-black font-semibold'
                  : episode.isFiller
                    ? 'bg-[#f9a825]/20 hover:bg-[#f9a825]/40 text-white'
                    : 'bg-[#27272a] hover:bg-[#3f3f46] text-gray-300'
                  } transition`}
              >
                {episode.number}
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
          const isCurrentEp = episode.number === parseInt(epnum);
          let episodeUrl = `/anime/watch?id=${data?.id}&host=${defaultProvider}&epid=${encodeURIComponent(
            episode?.id || episode?.episodeId
          )}&ep=${episode?.number}&type=${subtype}`;
          
          // For AnimePahe, add the anime session
          if (defaultProvider === 'animepahe') {
            if (episode.animeSession) {
              episodeUrl += `&session=${encodeURIComponent(episode.animeSession)}`;
            } else {
              // Try to get from localStorage as fallback
              const savedSession = localStorage.getItem(`animepahe_session_${id}`);
              if (savedSession) {
                episodeUrl += `&session=${encodeURIComponent(savedSession)}`;
              }
            }
          }
          
          return (
            <Link
              href={episodeUrl}
              key={episode?.id || episode?.episodeId}
              className={`flex flex-row transition-all duration-300 hover:bg-[#27272a] rounded-xl overflow-hidden ${isCurrentEp ? 'ring-2 ring-white opacity-80 pointer-events-none' : ''
                }`}
            >
              <div className="relative w-[180px] h-[100px]">
                <Image
                  src={episode?.image || episode?.img || data?.coverImage?.extraLarge || data?.bannerImage}
                  alt={`Episode ${episode.number}`}
                  fill
                  className="object-cover"
                  sizes="180px"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  {isCurrentEp && (
                    <div className="rounded-full bg-black/50 p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-sm px-2 py-0.5 rounded-md">
                  EP {episode.number}
                </div>
                {episode.isFiller && (
                  <div className="absolute top-2 right-2 bg-yellow-600 text-white text-xs px-1.5 py-0.5 rounded">
                    Filler
                  </div>
                )}
              </div>
              <div className="flex flex-col p-3 flex-1">
                <h3 className="text-sm md:text-base font-medium">{episode.title || `Episode ${episode.number}`}</h3>
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

  return (
    <div className="bg-[#000000] rounded-xl p-4 shadow-lg">
      {loading ? (
        <>
          <Skeleton className="h-[100px] w-full mb-4" />
          <Skeleton className="h-[50px] w-full" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {Array(12).fill(0).map((_, idx) => (
              <Skeleton key={idx} className="h-[120px]" />
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#000000] rounded-xl p-4 mb-4">
            <div className="mb-3 md:mb-0">
              <h2 className="text-lg font-semibold text-white">Episode Selection</h2>
              <p className="text-sm text-gray-400">Currently watching Episode {epnum}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              {suboptions?.includes('sub') && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-300 flex items-center gap-1">
                    <svg viewBox="0 0 32 32" className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M4.6661 6.66699C4.29791 6.66699 3.99943 6.96547 3.99943 7.33366V24.667C3.99943 25.0352 4.29791 25.3337 4.6661 25.3337H27.3328C27.701 25.3337 27.9994 25.0352 27.9994 24.667V7.33366C27.9994 6.96547 27.701 6.66699 27.3328 6.66699H4.6661Z" fill="currentColor" />
                    </svg>
                    SUB:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {episodeData?.map((item, index) => (
                      <button
                        key={`sub-${item.providerId}`}
                        className={`px-2.5 py-1 text-xs rounded-md transition-colors ${item.providerId === defaultProvider && subtype === 'sub'
                          ? 'bg-white text-black font-semibold'
                          : 'bg-[#27272a] text-gray-300 hover:bg-[#3f3f46]'
                          }`}
                        onClick={() => handleProviderChange(item.providerId, "sub")}
                      >
                        Server {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {suboptions?.includes('dub') && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-300 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3z" />
                    </svg>
                    DUB:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {episodeData?.map((item, index) => (
                      <button
                        key={`dub-${item.providerId}`}
                        className={`px-2.5 py-1 text-xs rounded-md transition-colors ${item.providerId === defaultProvider && subtype === 'dub'
                          ? 'bg-white text-black font-semibold'
                          : 'bg-[#27272a] text-gray-300 hover:bg-[#3f3f46]'
                          }`}
                        onClick={() => handleProviderChange(item.providerId, "dub")}
                      >
                        Server {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <div className="flex flex-col sm:flex-row justify-between gap-3 items-center mb-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <h3 className="font-semibold text-white">Episodes</h3>
                <Tooltip content="Refresh Episodes">
                  <button
                    onClick={refreshEpisodes}
                    className="p-1.5 rounded-full bg-[#27272a] hover:bg-[#3f3f46] transition-colors"
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

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search episodes..."
                  value={searchTerm}
                  onChange={handleSearch}
                  classNames={{
                    base: "max-w-[240px] w-full",
                    inputWrapper: "bg-[#27272a] h-9"
                  }}
                  startContent={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                />

                <div className="flex items-center border border-[#3f3f46] rounded-md">
                  <button
                    className={`p-1.5 ${displayMode === 'grid' ? 'bg-[#27272a]' : ''}`}
                    onClick={() => changeDisplayMode('grid')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    className={`p-1.5 ${displayMode === 'compact' ? 'bg-[#27272a]' : ''}`}
                    onClick={() => changeDisplayMode('compact')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                  <button
                    className={`p-1.5 ${displayMode === 'details' ? 'bg-[#27272a]' : ''}`}
                    onClick={() => changeDisplayMode('details')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                  </button>
                  <button
                    className="p-1.5"
                    onClick={toggleSort}
                    title={sortDirection === 'asc' ? 'Oldest to Newest' : 'Newest to Oldest'}
                  >
                    {sortDirection === 'asc' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Empty state */}
            {(filteredEpisodes?.length === 0 && !loading) && (
              <div className="flex flex-col items-center justify-center h-40 bg-[#000000] rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-400 text-sm">No episodes found</p>
              </div>
            )}

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
                  color="default"
                  variant="bordered"
                  classNames={{
                    cursor: "bg-white text-black font-semibold",
                    item: "text-white bg-[#27272a] hover:bg-[#3f3f46]",
                    prev: "bg-[#27272a] hover:bg-[#3f3f46]",
                    next: "bg-[#27272a] hover:bg-[#3f3f46]"
                  }}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default EnhancedEpisodeList; 
