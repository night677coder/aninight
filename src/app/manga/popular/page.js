import React from 'react';
import { getPopularManga } from '@/lib/MangaFunctions';
import Navbarcomponent from '@/components/navbar/Navbar';
import MangaCard from '@/components/CardComponent/MangaCard';

export const metadata = {
  title: 'Popular Manga - Top Rated Manga Series',
  description: 'Browse the most popular and top-rated manga titles. Read trending manga online free with high-quality images.',
  keywords: 'popular manga, top manga, best manga, trending manga, top rated manga, manga rankings, read manga online',
  openGraph: {
    title: 'Popular Manga - Top Rated Manga Series | VoidAnime',
    description: 'Browse the most popular and top-rated manga titles. Read trending manga online free.',
    type: 'website',
    url: 'https://voidanime.live/manga/popular',
  },
  twitter: {
    card: "summary_large_image",
    title: 'Popular Manga - Top Rated Manga Series',
    description: 'Browse the most popular and top-rated manga titles.',
  },
  alternates: {
    canonical: 'https://voidanime.live/manga/popular',
  },
};

async function PopularMangaPage() {
  const mangaList = await getPopularManga();

  return (
    <div className="min-h-screen bg-black">
      <Navbarcomponent />
      <div className="pt-[90px] max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
          Popular Manga
        </h1>

        {mangaList && mangaList.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {mangaList.map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>
        ) : (
          <div className="text-white text-center py-20">
            <p className="text-xl">No manga found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PopularMangaPage;
