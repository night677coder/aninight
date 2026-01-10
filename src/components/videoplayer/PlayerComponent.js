"use client"
import React, { useEffect, useState } from 'react'
import { getSources, getEpisodes } from '@/lib/getData';
import { ProvidersMap } from '@/utils/EpisodeFunctions';
import PlayerEpisodeList from './PlayerEpisodeList';
import ArtPlayer from './ArtPlayer';
import ServerSelector from './ServerSelector';
import { toast } from 'sonner';
import { useTitle, useNowPlaying, useDataInfo, useSettings, useSubtype } from '../../lib/store';
import { useStore } from "zustand";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import EnhancedEpisodeList from './EnhancedEpisodeList';
import DownloadButton from './DownloadButton';
import { useRouter } from 'next-nprogress-bar';

function PlayerComponent({ id, epId, provider, epNum, subdub, server, data, session, savedep }) {
    const animetitle = useStore(useTitle, (state) => state.animetitle);
    const settings = useStore(useSettings, (state) => state.settings);
    const subtype = useStore(useSubtype, (state) => state.subtype);
    const router = useRouter();
    
    const [episodeData, setepisodeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [groupedEp, setGroupedEp] = useState(null);
    const [src, setSrc] = useState(null);
    const [subtitles, setSubtitles] = useState(null);
    const [thumbnails, setThumbnails] = useState(null);
    const [skiptimes, setSkipTimes] = useState(null);
    const [error, setError] = useState(false);
    const [availableProviders, setAvailableProviders] = useState([]);
    const [currentProvider, setCurrentProvider] = useState(provider);
    const [currentSubdub, setCurrentSubdub] = useState(subdub);
    const [currentServer, setCurrentServer] = useState(server || 'hd-1');

    // Fetch available providers on mount
    useEffect(() => {
        const fetchProviders = async () => {
            try {
                const response = await getEpisodes(id, data?.idMal, data?.status === "RELEASING", false);
                if (response && response.length > 0) {
                    setAvailableProviders(response);
                }
            } catch (error) {
                console.error("Error fetching providers:", error);
            }
        };
        fetchProviders();
    }, [id, data?.idMal, data?.status]);

    // Handle server switch
    const handleServerSwitch = (newProvider, newSubdub) => {
        // Find the episode in the current provider's episodes
        const providerData = availableProviders.find(p => p.providerId === newProvider);
        if (!providerData) return;

        let episodes;
        if (providerData.consumet) {
            episodes = newSubdub === 'sub' ? providerData.episodes?.sub : providerData.episodes?.dub;
        } else {
            episodes = providerData.episodes;
        }

        const targetEpisode = episodes?.find(ep => ep.number === parseInt(epNum));
        if (!targetEpisode) {
            toast.error("Episode not available on this server");
            return;
        }

        const episodeId = encodeURIComponent(targetEpisode.id || targetEpisode.episodeId);
        let url = `/anime/watch?id=${id}&host=${newProvider}&epid=${episodeId}&ep=${epNum}&type=${newSubdub}`;
        
        // For AnimePahe, add the anime session
        if (newProvider === 'animepahe') {
            if (targetEpisode.animeSession) {
                url += `&session=${encodeURIComponent(targetEpisode.animeSession)}`;
                localStorage.setItem(`animepahe_session_${id}`, targetEpisode.animeSession);
            } else {
                const savedSession = localStorage.getItem(`animepahe_session_${id}`);
                if (savedSession) {
                    url += `&session=${encodeURIComponent(savedSession)}`;
                }
            }
        }
        
        router.push(url);
    };

    useEffect(() => {
        useDataInfo.setState({ dataInfo: data });
        setCurrentProvider(provider);
        setCurrentSubdub(subdub);

        // Reset states when provider changes to prevent stale data
        setSrc(null);
        setSubtitles(null);
        setThumbnails(null);
        setSkipTimes(null);
        setError(false);

        // Create a function to fetch sources that we can call multiple times if needed
        const fetchSources = async (retryCount = 0) => {
            setLoading(true);
            try {
                console.log(`Fetching sources with subdub=${subdub}, provider=${provider}, retry=${retryCount}`);
                
                // For AnimePahe, we need to extract session info from epId
                let animeSession = null;
                let episodeSession = null;
                
                if (provider === 'animepahe') {
                    // epId should contain the episode session
                    episodeSession = epId;
                    // session should contain the anime session
                    animeSession = session;
                    console.log(`[AnimePahe] Using sessions - anime: ${animeSession}, episode: ${episodeSession}`);
                    
                    // If we don't have anime session from URL params but it's in localStorage, use that
                    if (!animeSession) {
                        const savedSession = localStorage.getItem(`animepahe_session_${id}`);
                        if (savedSession) {
                            animeSession = savedSession;
                            console.log(`[AnimePahe] Using saved anime session from localStorage: ${animeSession}`);
                        }
                    } else {
                        // Save the anime session for future use
                        localStorage.setItem(`animepahe_session_${id}`, animeSession);
                    }
                }
                
                const response = await getSources(id, provider, epId, epNum, subdub, server, animeSession, episodeSession);

                if (!response || (!response.sources && !response.download)) {
                    // Special handling for AnimePahe
                    if (provider === 'animepahe') {
                        // Try to get anime session from localStorage if not already provided
                        if (!animeSession && retryCount === 0) {
                            const savedSession = localStorage.getItem(`animepahe_session_${id}`);
                            if (savedSession) {
                                console.log(`[AnimePahe] Retrying with saved anime session: ${savedSession}`);
                                animeSession = savedSession;
                                setTimeout(() => fetchSources(retryCount + 1), 500);
                                return;
                            }
                        }
                    }
                    
                    // If this is the first attempt and we're coming from a direct link, try again
                    if (retryCount === 0 && window.performance?.navigation?.type !== 1) { // type 1 is reload
                        console.log("No sources found on first attempt, retrying...");
                        setTimeout(() => fetchSources(retryCount + 1), 1000); // Retry after 1 second
                        return;
                    }
                    
                    toast.error("Failed to load episode. Please try again later.");
                    setError(true);
                    setLoading(false);
                    return;
                }

                const sources = response?.sources?.find(i => i.quality === "default" || i.quality === "auto")?.url || 
                              response?.sources?.find(i => i.quality === "1080p")?.url || 
                              response?.sources?.find(i => i.type === "hls")?.url ||
                              response?.download; // Fallback to download URL if no sources
                console.log(`Found source URL for ${subdub} episode`);
                setSrc(sources);
                const download = response?.download;

                let subtitlesArray = response.tracks || response.subtitles;
                const reFormSubtitles = subtitlesArray?.map((i) => ({
                    src: i?.file || i?.url,
                    label: i?.label || i?.lang,
                    kind: i?.kind || (i?.lang === "Thumbnails" ? "thumbnails" : "subtitles"),
                    default: i?.default || (i?.lang === "English"),
                }));
                

                setSubtitles(reFormSubtitles?.filter((s) => s.kind !== 'thumbnails'));
                setThumbnails(reFormSubtitles?.filter((s) => s.kind === 'thumbnails'));

                const skipResponse = await fetch(
                    `https://api.aniskip.com/v2/skip-times/${data?.idMal}/${parseInt(epNum)}?types[]=ed&types[]=mixed-ed&types[]=mixed-op&types[]=op&types[]=recap&episodeLength=`
                );

                const skipData = await skipResponse.json();
                const op = skipData?.results?.find((item) => item.skipType === 'op') || null;
                const ed = skipData?.results?.find((item) => item.skipType === 'ed') || null;
                const episodeLength = skipData?.results?.find((item) => item.episodeLength)?.episodeLength || 0;

                const skiptime = [];

                if (op?.interval) {
                    skiptime.push({
                        startTime: op.interval.startTime ?? 0,
                        endTime: op.interval.endTime ?? 0,
                        text: 'Opening',
                    });
                }
                if (ed?.interval) {
                    skiptime.push({
                        startTime: ed.interval.startTime ?? 0,
                        endTime: ed.interval.endTime ?? 0,
                        text: 'Ending',
                    });
                } else {
                    skiptime.push({
                        startTime: op?.interval?.endTime ?? 0,
                        endTime: episodeLength,
                        text: '',
                    });
                }

                const episode = {
                    download: download || null,
                    skiptimes: skiptime || [],
                    epId: epId || null,
                    provider: provider || null,
                    epNum: epNum || null,
                    subtype: subdub || null,
                };

                useNowPlaying.setState({ nowPlaying: episode });
                setSkipTimes(skiptime);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                
                // If this is first attempt and we're coming from a direct link, try again
                if (retryCount === 0 && window.performance?.navigation?.type !== 1) { // type 1 is reload
                    console.log("Error on first attempt, retrying...");
                    setTimeout(() => fetchSources(retryCount + 1), 1000); // Retry after 1 second
                    return;
                }
                
                toast.error("Failed to load episode. Please try again later.");
                const episode = {
                    download: null,
                    skiptimes: [],
                    epId: epId || null,
                    provider: provider || null,
                    epNum: epNum || null,
                    subtype: subdub || null,
                };

                useNowPlaying.setState({ nowPlaying: episode });
                setLoading(false);
            }
        };
        
        // Start the source fetching process
        fetchSources();
    }, [id, provider, epId, epNum, subdub]);

    useEffect(() => {
        if (episodeData) {
            const previousep = episodeData?.find(
                (i) => i.number === parseInt(epNum) - 1
            );
            const nextep = episodeData?.find(
                (i) => i.number === parseInt(epNum) + 1
            );
            const currentep = episodeData?.find(
                (i) => i.number === parseInt(epNum)
            );
            const epdata = {
                previousep,
                currentep,
                nextep,
            }
            setGroupedEp(epdata);
        }
    }, [episodeData, epId, provider, epNum, subdub]);

    return (
        <div className='xl:w-[99%] max-w-[1800px] mx-auto'>
            <div className='mb-8'>
                <div className='mb-4 relative'>
                    {!loading && !error ? (
                        <div className='h-full w-full aspect-video overflow-hidden rounded-md shadow-lg relative'>
                            {provider === 'hianime' && (
                                <div className='absolute top-4 right-4 z-10'>
                                    <ServerSelector 
                                        episodeId={epId}
                                        currentServer={currentServer}
                                        onServerChange={handleServerSwitch}
                                        category={subdub}
                                    />
                                </div>
                            )}
                            <ArtPlayer dataInfo={data} id={id} groupedEp={groupedEp} session={session} savedep={savedep} src={src} subtitles={subtitles} thumbnails={thumbnails} skiptimes={skiptimes} />
                        </div>
                    ) : (
                        <div className="h-full w-full rounded-md relative flex items-center text-xl justify-center aspect-video border border-solid border-[#333] bg-[#141414] shadow-lg">
                            {!loading && error ? (
                                <div className='text-sm sm:text-base px-2 flex flex-col items-center text-center'>
                                    <FontAwesomeIcon icon={faCircleExclamation} className="text-white text-4xl mb-4" />
                                    <p className='mb-3 text-xl font-medium'>Failed to load episode</p>
                                    <p className='text-[#999] mb-2'>Please try again later or choose a different server.</p>
                                    <p className='text-[#999] text-sm'>If the problem persists, consider changing servers.</p>
                                </div>) : (
                                <div className="pointer-events-none absolute inset-0 z-50 flex h-full w-full items-center justify-center">
                                    <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-white"></div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className='mt-4 mb-2 mx-2 sm:mx-1 px-1 lg:px-0'>
                    <div className='flex items-start justify-between gap-4'>
                        <div className='flex-1'>
                            <h1 className='text-2xl md:text-3xl font-medium mb-1'>{data?.title?.[animetitle] || data?.title?.romaji}</h1>
                            <h2 className='text-lg text-[#999] font-medium'>{`Episode ${epNum}`}</h2>
                        </div>
                        <div className='flex-shrink-0 mt-1'>
                            <DownloadButton animeData={data} episodeNumber={epNum} />
                        </div>
                    </div>
                </div>
            </div>
            <div className='w-[98%] mx-auto lg:w-full' style={{ backgroundColor: '#000000' }}>
                <EnhancedEpisodeList id={id} data={data} setwatchepdata={setepisodeData} onprovider={provider} epnum={epNum} />
            </div>
        </div>
    )
}

export default PlayerComponent
