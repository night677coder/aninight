import Episodesection from '@/components/Episodesection'
import { AnimeInfoAnilist } from '@/lib/Anilistfunctions'
import React from 'react'
import AnimeDetailsTop from '@/components/details/AnimeDetailsTop'
import AnimeDetailsBottom from '@/components/details/AnimeDetailsBottom'
import Navbarcomponent from '@/components/navbar/Navbar'
import Animecards from '@/components/CardComponent/Animecards'
import { getAuthSession } from '@/app/api/auth/[...nextauth]/route'
import { redis } from '@/lib/rediscache'
import DetailsContainer from './DetailsContainer'

async function getInfo(id) {
  try {
    let cachedData;
    if (redis) {
      cachedData = await redis.get(`info:${id}`); 
      if (!JSON.parse(cachedData)) {
        await redis.del(`info:${id}`);
        cachedData = null;
      }
    }
    if (cachedData) {
      // console.log("using cached info")
      return JSON.parse(cachedData);
    } else {
      const data = await AnimeInfoAnilist(id);
      const cacheTime = data?.nextAiringEpisode?.episode ? 60 * 60 * 2 : 60 * 60 * 24 * 45;
      if (redis && data !== null && data) {
        await redis.set(`info:${id}`, JSON.stringify(data), "EX", cacheTime);
      }
      return data;
    }
  } catch (error) {
    console.error("Error fetching info: ", error);
  } 
}

export async function generateMetadata({ params }) {
  const id = params.infoid[0];
  const data = await getInfo(id);

  const title = data?.title?.english || data?.title?.romaji || 'Anime Details';
  const description = data?.description?.replace(/<[^>]*>/g, '').slice(0, 160) || 'Watch anime online on VoidAnime';
  const genres = data?.genres?.join(', ') || '';
  const keywords = [
    title,
    `watch ${title}`,
    `${title} anime`,
    `${title} episodes`,
    `stream ${title}`,
    ...data?.genres || [],
    'anime online',
    'watch anime',
    'anime streaming'
  ].join(', ');

  return {
    title: `${title} - Watch Online`,
    description: description,
    keywords: keywords,
    openGraph: {
      type: 'video.tv_show',
      title: `${title} - Watch Online | VoidAnime`,
      description: description,
      images: [
        {
          url: data?.coverImage?.extraLarge || data?.coverImage?.large,
          width: 460,
          height: 650,
          alt: title,
        }
      ],
      siteName: 'VoidAnime',
      url: `https://voidanime.live/anime/info/${id}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} - Watch Online`,
      description: description,
      images: [data?.coverImage?.extraLarge || data?.coverImage?.large],
    },
    alternates: {
      canonical: `https://voidanime.live/anime/info/${id}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

async function AnimeDetails({ params }) {
  const session = await getAuthSession();
  const id = params.infoid[0];
  // const data = await getInfo(id);
  const data = await AnimeInfoAnilist(id);

  const title = data?.title?.english || data?.title?.romaji || data?.title?.native;
  const description = data?.description?.replace(/<[^>]*>/g, '').slice(0, 200);
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    name: title,
    description: description,
    image: data?.coverImage?.extraLarge || data?.coverImage?.large,
    genre: data?.genres || [],
    datePublished: data?.startDate ? `${data.startDate.year}-${String(data.startDate.month || 1).padStart(2, '0')}-${String(data.startDate.day || 1).padStart(2, '0')}` : undefined,
    numberOfEpisodes: data?.episodes,
    aggregateRating: data?.averageScore ? {
      '@type': 'AggregateRating',
      ratingValue: data.averageScore / 10,
      bestRating: 10,
      ratingCount: data.popularity
    } : undefined,
    contentRating: data?.isAdult ? 'R' : 'PG-13',
    inLanguage: 'ja',
    countryOfOrigin: {
      '@type': 'Country',
      name: 'Japan'
    },
    ...(data?.studios?.nodes?.[0] && {
      productionCompany: {
        '@type': 'Organization',
        name: data.studios.nodes[0].name
      }
    })
  };

  return (
    <div className="">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbarcomponent />
     <DetailsContainer data={data} id={id} session={session}/>
    </div>
  )
}

export default AnimeDetails