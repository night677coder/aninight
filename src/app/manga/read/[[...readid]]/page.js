import React from 'react';
import { getMangaInfoAnilist, getChapterPages, getMangaChapters } from '@/lib/MangaFunctions';
import Navbarcomponent from '@/components/navbar/Navbar';
import MangaReader from '@/components/manga/MangaReader';
import { getAuthSession } from '@/app/api/auth/[...nextauth]/route';

export async function generateMetadata({ searchParams }) {
  const mangaId = searchParams?.id;
  const chapterNum = searchParams?.chapter;
  
  if (!mangaId) {
    return {
      title: 'Read Manga',
      description: 'Read manga online'
    };
  }

  const data = await getMangaInfoAnilist(mangaId);
  
  return {
    title: `Chapter ${chapterNum} - ${data?.title?.english || data?.title?.romaji || 'Manga'}`,
    description: data?.description?.slice(0, 180) || 'Read manga online',
    openGraph: {
      title: `Chapter ${chapterNum} - ${data?.title?.english || data?.title?.romaji}`,
      images: [data?.coverImage?.extraLarge],
      description: data?.description,
    },
    twitter: {
      card: "summary",
      title: `Chapter ${chapterNum} - ${data?.title?.english || data?.title?.romaji}`,
      description: data?.description?.slice(0, 180),
    },
  };
}

async function MangaReadPage({ searchParams }) {
  const session = await getAuthSession();
  const mangaId = searchParams?.id;
  const chapterId = searchParams?.chapterId;
  const chapterNum = searchParams?.chapter;
  const provider = searchParams?.provider || null;

  if (!mangaId || !chapterId) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Invalid manga or chapter ID</p>
      </div>
    );
  }

  const mangaInfo = await getMangaInfoAnilist(mangaId);
  const chaptersData = await getMangaChapters(mangaInfo, provider);
  const pages = await getChapterPages(chapterId, chaptersData.provider || provider || 'mangapill');

  return (
    <>
      <Navbarcomponent />
      <div className="bg-black min-h-screen pt-[70px]">
        <MangaReader 
          pages={pages}
          mangaInfo={mangaInfo}
          chaptersData={chaptersData}
          currentChapterId={chapterId}
          currentChapterNum={chapterNum}
          mangaId={mangaId}
          session={session}
        />
      </div>
    </>
  );
}

export default MangaReadPage;
