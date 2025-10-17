import { 
  TrendingAnilist, 
  Top100Anilist, 
  SeasonalAnilist,
  CurrentlyAiringAnilist,
  TopRatedAnilist,
  UpcomingAnilist
} from '@/lib/Anilistfunctions';
import { getPopularManga, getTrendingManga } from '@/lib/MangaFunctions';

const BASE_URL = 'https://voidanime.live';

export default async function sitemap() {
  try {
    // Fetch all anime data in parallel
    const [
      trendingAnime,
      top100Anime,
      seasonalAnime,
      airingAnime,
      topRatedAnime,
      upcomingAnime,
      popularManga,
      trendingManga
    ] = await Promise.all([
      TrendingAnilist(),
      Top100Anilist(),
      SeasonalAnilist(),
      CurrentlyAiringAnilist(),
      TopRatedAnilist(),
      UpcomingAnilist(),
      getPopularManga(),
      getTrendingManga()
    ]);

    // Create unique anime entries (avoid duplicates)
    const animeMap = new Map();
    
    [...(trendingAnime || []), ...(top100Anime || []), ...(seasonalAnime || []), 
     ...(airingAnime || []), ...(topRatedAnime || []), ...(upcomingAnime || [])]
      .forEach(anime => {
        if (anime?.id && !animeMap.has(anime.id)) {
          animeMap.set(anime.id, {
            url: `${BASE_URL}/anime/info/${anime.id}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
          });
        }
      });

    // Create unique manga entries
    const mangaMap = new Map();
    
    [...(popularManga || []), ...(trendingManga || [])]
      .forEach(manga => {
        if (manga?.id && !mangaMap.has(manga.id)) {
          mangaMap.set(manga.id, {
            url: `${BASE_URL}/manga/info/${manga.id}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
      });

    // Static pages with priorities
    const staticPages = [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: 'hourly',
        priority: 1.0,
      },
      {
        url: `${BASE_URL}/anime/catalog`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${BASE_URL}/anime/popular`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${BASE_URL}/manga/catalog`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${BASE_URL}/manga/popular`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${BASE_URL}/news`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${BASE_URL}/dmca`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.3,
      },
    ];

    return [
      ...staticPages,
      ...Array.from(animeMap.values()),
      ...Array.from(mangaMap.values()),
    ];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return at least the homepage if there's an error
    return [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
    ];
  }
}
