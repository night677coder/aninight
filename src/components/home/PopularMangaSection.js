"use client"
import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faBook } from '@fortawesome/free-solid-svg-icons';
import MangaCard from '@/components/CardComponent/MangaCard';

function PopularMangaSection({ mangaList }) {
  if (!mangaList || mangaList.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-2">
          <span className="h-6 rounded-md w-[5px] bg-white"></span>
          <h2 className="text-xl md:text-2xl font-medium text-white">Popular Manga</h2>
          <div className="flex items-center bg-white px-2 py-1 rounded-full ml-2 text-xs text-black">
            <FontAwesomeIcon icon={faBook} className="mr-1" />
            <span>Trending</span>
          </div>
        </div>
        <Link href="/manga/catalog" className="flex items-center gap-1 text-sm text-white hover:opacity-70 transition-opacity">
          <span>View All</span>
          <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
        </Link>
      </div>

      <div className="overflow-x-auto overflow-y-hidden scrollbar-none px-2">
        <div className="flex gap-3 pb-2">
          {mangaList.slice(0, 20).map((manga) => (
            <div key={manga.id} className="flex-shrink-0 w-[120px]">
              <MangaCard manga={manga} compact={true} />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

export default PopularMangaSection;
