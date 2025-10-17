import React from 'react';
import { fetchNewsArticle } from '@/lib/AnilistNewsFunctions';
import Navbarcomponent from '@/components/navbar/Navbar';
import { getAuthSession } from '@/app/api/auth/[...nextauth]/route';
import NetflixStyleNewsDetails from './NetflixStyleNewsDetails';

export async function generateMetadata({ params }) {
  const id = params.id;
  const data = await fetchNewsArticle(id);

  return {
    title: data?.title?.english || data?.title?.romaji || 'News Article - SkyAnime',
    description: data?.description?.slice(0, 180) || 'Anime news article',
    openGraph: {
      title: data?.title?.english || data?.title?.romaji,
      images: [data?.coverImage?.extraLarge],
      description: data?.description,
    },
    twitter: {
      card: "summary",
      title: data?.title?.english || data?.title?.romaji,
      description: data?.description?.slice(0, 180),
    },
  };
}

async function NewsArticlePage({ params }) {
  const session = await getAuthSession();
  const id = params.id;
  const data = await fetchNewsArticle(id);

  return (
    <div className="min-h-screen bg-black">
      <Navbarcomponent />
      <div className="mt-[70px]">
        {data ? (
          <NetflixStyleNewsDetails data={data} id={id} session={session} />
        ) : (
          <div className="flex justify-center items-center h-64 bg-[#0a0a0a] rounded-lg border border-[#222] mx-4 sm:mx-8 md:mx-12">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-4 border-t-[#1a365d] border-r-[#1a365d] border-b-transparent border-l-transparent animate-spin mb-4"></div>
              <p className="text-white text-lg">Article not found</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NewsArticlePage;
