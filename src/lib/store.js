import { create } from "zustand";
import { persist } from 'zustand/middleware'

export const useSettings = create(
    persist(
        (set) => ({
            settings: {
                autoplay: false,
                autoskip: false,
                autonext: false,
                load: 'idle',
                audio: false,
                herotrailer: true,
                bannertrailer: true,
                preferredPlayer: 'artplayer',
                customBgColor: '#000000',
                customAccentColor: '#ffffff',
                bgImage: '',
                bgImageOpacity: 0.3,
                smoothScroll: false,
                compactMode: false,
                blurEffects: false,
                animations: true,
                cardHover: true,
                hwAccel: true,
                preloadImages: true,
                debugMode: false,
                analytics: true,
                defaultProvider: 'animepahe',
                homeSections: [
                    { id: 'promoBanner', label: 'Promo Banner', enabled: true },
                    { id: 'greeting', label: 'Greeting', enabled: true },
                    { id: 'continueWatching', label: 'Continue Watching', enabled: true },
                    { id: 'continueReading', label: 'Continue Reading', enabled: true },
                    { id: 'trendingNow', label: 'Trending Now', enabled: true },
                    { id: 'top10', label: 'Top 10 Anime', enabled: true },
                    { id: 'currentlyAiring', label: 'Currently Airing', enabled: true },
                    { id: 'premiumShowcase', label: 'Premium Collection', enabled: true },
                    { id: 'topRated', label: 'Top Rated', enabled: true },
                    { id: 'randomRecs', label: 'Random Recommendations', enabled: true },
                    { id: 'popularManga', label: 'Popular Manga', enabled: true },
                    { id: 'news', label: 'Latest News', enabled: true },
                    { id: 'upcoming', label: 'Upcoming Anime', enabled: true },
                    { id: 'genre', label: 'Genre Section', enabled: true },
                    { id: 'recentlyUpdated', label: 'Recently Updated', enabled: true }
                ],
            },
            setSettings: (settings) => set({ settings }),
        }),
        {
            name: "settings",
        }
    )
);

export const useTitle = create(
    persist(
        (set) => ({
            animetitle: 'english',
            setAnimeTitle: (animetitle) => set({ animetitle }),
        }),
        {
            name: "selectedLanguage",
        }
    )
);

export const useSubtype = create(
    persist(
        (set) => ({
            subtype: 'sub',
            setSubType: (subtype) => set({ subtype }),
        }),
        {
            name: "selectedType",
        }
    )
);

export const useSearchbar = create(
    (set) => ({
        Isopen: false,
        setSubType: (Isopen) => set({ Isopen }),
    }),
);

export const useNowPlaying = create(
    (set) => ({
        nowPlaying: {},
        setNowPlaying: (nowPlaying) => set({ nowPlaying }),
    }),
);

export const useDataInfo = create(
    (set) => ({
        dataInfo: {},
        setDataInfo: (dataInfo) => set({ dataInfo }),
    }),
);
