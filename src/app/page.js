"use server"
import Herosection from '@/components/home/Herosection'
import Navbarcomponent from '@/components/navbar/Navbar'
import { 
  TrendingAnilist,
  Top100Anilist, 
  SeasonalAnilist, 
  UpcomingAnilist, 
  CurrentlyAiringAnilist,
  TopRatedAnilist,
  GenreSpecificAnilist,
  RecentlyUpdatedAnilist,
  RandomRecommendationsAnilist
} from '@/lib/Anilistfunctions'
import React from 'react'
import { getAuthSession } from './api/auth/[...nextauth]/route'
import { redis } from '@/lib/rediscache'
import { fetchHomePageNews } from '@/lib/AnilistNewsFunctions'
import { getPopularManga } from '@/lib/MangaFunctions'
import HomeSectionRenderer from '@/components/home/HomeSectionRenderer'
// import { getWatchHistory } from '@/lib/EpHistoryfunctions'

async function getHomePage() {
  try {
    let cachedData;
    if (redis) {
      cachedData = await redis.get(`homepage`);
      if (!JSON.parse(cachedData)) {
        await redis.del(`homepage`);
        cachedData = null;
      }
    }
    if (cachedData) {
      const { 
        herodata, 
        top100data, 
        seasonaldata, 
        upcomingData, 
        airingData, 
        topRatedData,
        actionAnimeData,
        recentlyUpdatedData,
        randomRecsData,
        popularMangaData
      } = JSON.parse(cachedData);
      return { 
        herodata, 
        top100data, 
        seasonaldata, 
        upcomingData, 
        airingData, 
        topRatedData,
        actionAnimeData,
        recentlyUpdatedData,
        randomRecsData,
        popularMangaData
      };
    } else {
      const [
        herodata, 
        top100data, 
        seasonaldata, 
        upcomingData, 
        airingData, 
        topRatedData,
        actionAnimeData,
        recentlyUpdatedData,
        randomRecsData,
        popularMangaData
      ] = await Promise.all([
        TrendingAnilist(),
        Top100Anilist(),
        SeasonalAnilist(),
        UpcomingAnilist(),
        CurrentlyAiringAnilist(),
        TopRatedAnilist(),
        GenreSpecificAnilist("Action"),
        RecentlyUpdatedAnilist(),
        RandomRecommendationsAnilist(),
        getPopularManga()
      ]);
      const cacheTime = 60 * 60 * 2;
      if (redis) {
        await redis.set(`homepage`, JSON.stringify({ 
          herodata, 
          top100data, 
          seasonaldata, 
          upcomingData, 
          airingData, 
          topRatedData,
          actionAnimeData,
          recentlyUpdatedData,
          randomRecsData,
          popularMangaData
        }), "EX", cacheTime);
      }
      return { 
        herodata, 
        top100data, 
        seasonaldata, 
        upcomingData, 
        airingData, 
        topRatedData,
        actionAnimeData,
        recentlyUpdatedData,
        randomRecsData,
        popularMangaData
      };
    }
  } catch (error) {
    console.error("Error fetching homepage from anilist: ", error);
    return null;
  }
}

async function Home() {
  const session = await getAuthSession();
  const { 
    herodata = [], 
    top100data = [], 
    seasonaldata = [], 
    upcomingData = [], 
    airingData = [],
    topRatedData = [],
    actionAnimeData = [],
    recentlyUpdatedData = [],
    randomRecsData = [],
    popularMangaData = []
  } = await getHomePage();
  const newsData = await fetchHomePageNews(6);
  // const history = await getWatchHistory();
  // console.log(history)

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'VoidAnime',
    alternateName: 'Void Anime',
    url: 'https://voidanime.live',
    description: 'Watch anime online and read manga free. Stream the latest anime episodes with English subtitles and dubs. Discover trending anime, popular manga, and seasonal releases.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://voidanime.live/anime/catalog?search={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: 'VoidAnime',
      logo: {
        '@type': 'ImageObject',
        url: 'https://voidanime.live/android-chrome-512x512.png'
      }
    }
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <Navbarcomponent home={true} />
      <Herosection data={herodata} />
      <div className='sm:max-w-[97%] md:max-w-[95%] lg:max-w-[90%] xl:max-w-[85%] mx-auto flex flex-col md:gap-11 sm:gap-7 gap-5 mt-8'>
        <HomeSectionRenderer 
          session={session}
          herodata={herodata}
          seasonaldata={seasonaldata}
          top100data={top100data}
          upcomingData={upcomingData}
          airingData={airingData}
          topRatedData={topRatedData}
          actionAnimeData={actionAnimeData}
          recentlyUpdatedData={recentlyUpdatedData}
          randomRecsData={randomRecsData}
          popularMangaData={popularMangaData}
          newsData={newsData}
        />
      </div>
    </div>
  )
}

export default Home
