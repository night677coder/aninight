import React from "react";
import { AnimeInfoAnilist } from '@/lib/Anilistfunctions'
import Navbarcomponent from "@/components/navbar/Navbar";
import { createWatchEp, getEpisode } from "@/lib/EpHistoryfunctions";
import { getAuthSession } from "../../../api/auth/[...nextauth]/route";
import { redis } from '@/lib/rediscache';

// Dynamic imports to avoid chunk loading issues
import dynamic from 'next/dynamic';

const NextAiringDate = dynamic(() => import("@/components/videoplayer/NextAiringDate"), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

const PlayerAnimeCard = dynamic(() => import("@/components/videoplayer/PlayerAnimeCard"), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

const PlayerComponent = dynamic(() => import("@/components/videoplayer/PlayerComponent"), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

const HorizontalRecommendations = dynamic(() => import("@/components/videoplayer/HorizontalRecommendations"), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

async function getInfo(id) {
  try {
    let cachedData;
    if (redis) {
      cachedData = await redis.get(`info:${id}`);
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          if (!parsed) {
            await redis.del(`info:${id}`);
            cachedData = null;
          } else {
            return parsed;
          }
        } catch (e) {
          await redis.del(`info:${id}`);
          cachedData = null;
        }
      }
    }
    
    const data = await AnimeInfoAnilist(id);
    if (data) {
      const cacheTime = data?.nextAiringEpisode?.episode ? 60 * 60 * 2 : 60 * 60 * 24 * 45;
      if (redis) {
        try {
          await redis.set(`info:${id}`, JSON.stringify(data), "EX", cacheTime);
        } catch (e) {
          console.error("Redis set error:", e);
        }
      }
    }
    return data;
  } catch (error) {
    console.error("Error fetching info:", error);
    return null;
  }
}

export async function generateMetadata({ params, searchParams }) {
  try {
    const id = searchParams?.id;
    const epnum = searchParams?.ep;
    
    if (!id) {
      return {
        title: 'Watch Anime',
        description: 'Watch anime episodes online'
      };
    }
    
    const data = await getInfo(id);
    
    if (!data) {
      return {
        title: `Episode ${epnum || ''} - Watch Anime`,
        description: 'Watch anime episodes online'
      };
    }
    
    const title = data?.title?.english || data?.title?.romaji || 'Anime';
    const description = data?.description?.slice(0, 180) || 'Watch anime online';
    
    return {
      title: `Episode ${epnum || ''} - ${title}`,
      description: description,
      openGraph: {
        title: `Episode ${epnum || ''} - ${title}`,
        images: data?.coverImage?.extraLarge ? [data.coverImage.extraLarge] : [],
        description: description,
      },
      twitter: {
        card: "summary",
        title: `Episode ${epnum || ''} - ${title}`,
        description: description,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: 'Watch Anime',
      description: 'Watch anime episodes online'
    };
  }
}

export async function Ephistory(session, aniId, epNum) {
  try {
    if (session && aniId && epNum) {
      await createWatchEp(aniId, epNum);
      const savedep = await getEpisode(aniId, epNum);
      return savedep;
    }
    return null;
  } catch (error) {
    console.error("Ephistory error:", error);
    return null;
  }
}

async function AnimeWatch({ params, searchParams }) {
  try {
    const authSession = await getAuthSession();
    const id = searchParams?.id;
    const provider = searchParams?.host;
    const epNum = searchParams?.ep;
    const epId = searchParams?.epid;
    const subdub = searchParams?.type;
    const animeSession = searchParams?.session; // For AnimePahe
    
    if (!id) {
      return (
        <>
          <Navbarcomponent />
          <div className="bg-black w-full min-h-screen flex items-center justify-center">
            <div className="text-white text-center">
              <h1 className="text-2xl font-bold mb-4">Invalid Anime ID</h1>
              <p>Please select an anime to watch.</p>
            </div>
          </div>
        </>
      );
    }
    
    const data = await getInfo(id);
    const savedep = await Ephistory(authSession, id, epNum);
    
    if (!data) {
      return (
        <>
          <Navbarcomponent />
          <div className="bg-black w-full min-h-screen flex items-center justify-center">
            <div className="text-white text-center">
              <h1 className="text-2xl font-bold mb-4">Anime Not Found</h1>
              <p>Unable to load anime information.</p>
            </div>
          </div>
        </>
      );
    }

    return (
      <>
        <Navbarcomponent />
        <div className="bg-black w-full flex flex-col lg:max-w-[98%] mx-auto xl:max-w-[94%] mt-[70px] min-h-screen pb-10">
          <div className="flex-grow w-full h-full">
            <PlayerComponent 
              id={id} 
              epId={epId} 
              provider={provider} 
              epNum={epNum} 
              data={data} 
              subdub={subdub} 
              session={animeSession} 
              savedep={savedep}
            />
            {data?.status === 'RELEASING' && data?.nextAiringEpisode && (
              <NextAiringDate nextAiringEpisode={data.nextAiringEpisode} />
            )}
          </div>
          
          {data?.recommendations?.nodes && data.recommendations.nodes.length > 0 && (
            <div className="mt-8 w-full">
              <HorizontalRecommendations data={data.recommendations.nodes} />
            </div>
          )}
        </div>
      </>
    );
  } catch (error) {
    console.error("AnimeWatch error:", error);
    return (
      <>
        <Navbarcomponent />
        <div className="bg-black w-full min-h-screen flex items-center justify-center">
          <div className="text-white text-center">
            <h1 className="text-2xl font-bold mb-4">Error Loading Page</h1>
            <p>An error occurred while loading the watch page.</p>
            <p className="text-sm text-gray-400 mt-2">{error.message}</p>
          </div>
        </div>
      </>
    );
  }
}

export default AnimeWatch;
