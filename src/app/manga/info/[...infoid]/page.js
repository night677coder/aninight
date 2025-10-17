import React from 'react';
import { getMangaInfoAnilist, getMangaChapters } from '@/lib/MangaFunctions';
import Navbarcomponent from '@/components/navbar/Navbar';
import MangaDetailsContainer from './MangaDetailsContainer';
import { getAuthSession } from '@/app/api/auth/[...nextauth]/route';
import { redis } from '@/lib/rediscache';

async function getMangaInfo(id) {
  try {
    let cachedData;
    if (redis) {
      cachedData = await redis.get(`manga:info:${id}`);
      if (cachedData && JSON.parse(cachedData)) {
        return JSON.parse(cachedData);
      }
    }

    const data = await getMangaInfoAnilist(id);
    
    if (redis && data) {
      await redis.set(`manga:info:${id}`, JSON.stringify(data), "EX", 60 * 60 * 24 * 7);
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching manga info:", error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const id = params.infoid[0];
  const data = await getMangaInfo(id);

  const title = data?.title?.english || data?.title?.romaji || 'Manga Details';
  const description = data?.description?.replace(/<[^>]*>/g, '').slice(0, 160) || 'Read manga online on VoidAnime';
  const genres = data?.genres?.join(', ') || '';
  const keywords = [
    title,
    `read ${title}`,
    `${title} manga`,
    `${title} chapters`,
    `${title} online`,
    ...data?.genres || [],
    'manga online',
    'read manga',
    'manga reader'
  ].join(', ');

  return {
    title: `${title} - Read Online`,
    description: description,
    keywords: keywords,
    openGraph: {
      type: 'book',
      title: `${title} - Read Online | VoidAnime`,
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
      url: `https://voidanime.live/manga/info/${id}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} - Read Online`,
      description: description,
      images: [data?.coverImage?.extraLarge || data?.coverImage?.large],
    },
    alternates: {
      canonical: `https://voidanime.live/manga/info/${id}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

async function MangaDetails({ params }) {
  const session = await getAuthSession();
  const id = params.infoid[0];
  const mangaInfo = await getMangaInfoAnilist(id);
  const chaptersData = await getMangaChapters(mangaInfo);

  const title = mangaInfo?.title?.english || mangaInfo?.title?.romaji || mangaInfo?.title?.native;
  const description = mangaInfo?.description?.replace(/<[^>]*>/g, '').slice(0, 200);
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    '@id': `https://voidanime.live/manga/info/${id}`,
    name: title,
    description: description,
    image: mangaInfo?.coverImage?.extraLarge || mangaInfo?.coverImage?.large,
    genre: mangaInfo?.genres || [],
    datePublished: mangaInfo?.startDate ? `${mangaInfo.startDate.year}-${String(mangaInfo.startDate.month || 1).padStart(2, '0')}-${String(mangaInfo.startDate.day || 1).padStart(2, '0')}` : undefined,
    numberOfPages: mangaInfo?.chapters,
    bookFormat: 'GraphicNovel',
    inLanguage: 'ja',
    aggregateRating: mangaInfo?.averageScore ? {
      '@type': 'AggregateRating',
      ratingValue: mangaInfo.averageScore / 10,
      bestRating: 10,
      ratingCount: mangaInfo.popularity
    } : undefined,
    ...(mangaInfo?.staff?.edges?.[0] && {
      author: {
        '@type': 'Person',
        name: mangaInfo.staff.edges[0].node.name.full
      }
    })
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbarcomponent />
      <MangaDetailsContainer 
        data={mangaInfo} 
        chaptersData={chaptersData}
        id={id} 
        session={session}
      />
    </div>
  );
}

export default MangaDetails;
