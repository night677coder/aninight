import React from 'react';
import { getPopularManga, getTrendingManga } from '@/lib/MangaFunctions';
import Navbarcomponent from '@/components/navbar/Navbar';
import MangaCatalogModern from '@/components/catalogcomponent/MangaCatalogModern';
import { getAuthSession } from '@/app/api/auth/[...nextauth]/route';

export async function generateMetadata({ searchParams }) {
  const search = searchParams?.search || '';
  const genre = searchParams?.genre || '';
  
  let title = 'Manga Catalog - Browse All Manga';
  let description = 'Browse and discover thousands of manga series. Filter by genre, year, format, and more. Read manga online free.';
  
  if (search) {
    title = `Search Results for "${search}" - Manga Catalog`;
    description = `Find manga matching "${search}". Read manga online free with high-quality images.`;
  } else if (genre) {
    title = `${genre} Manga - Browse ${genre} Genre`;
    description = `Discover the best ${genre} manga series. Read ${genre} manga online free.`;
  }
  
  return {
    title: title,
    description: description,
    keywords: [
      'manga catalog',
      'browse manga',
      'manga list',
      'manga genres',
      'read manga',
      'manga search',
      'manga filter',
      search && `${search} manga`,
      genre && `${genre} manga`,
    ].filter(Boolean).join(', '),
    openGraph: {
      title: title,
      description: description,
      type: 'website',
      url: 'https://voidanime.live/manga/catalog',
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
    },
    alternates: {
      canonical: 'https://voidanime.live/manga/catalog',
    },
  };
}

async function MangaCatalogPage({ searchParams }) {
  // Fetch both popular and trending manga, and session
  const [popularManga, trendingManga, session] = await Promise.all([
    getPopularManga(),
    getTrendingManga(),
    getAuthSession()
  ]);

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      <Navbarcomponent />
      <div className="pt-[70px] overflow-x-hidden">
        <MangaCatalogModern 
          popularManga={popularManga}
          trendingManga={trendingManga}
          searchParams={searchParams}
          session={session}
        />
      </div>
    </div>
  );
}

export default MangaCatalogPage;
