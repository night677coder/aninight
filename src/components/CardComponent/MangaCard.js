"use client"
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

function MangaCard({ manga, compact = false }) {
  const title = manga?.title?.english || manga?.title?.romaji || manga?.title?.userPreferred;
  const coverImage = manga?.coverImage?.extraLarge || manga?.coverImage?.large;

  return (
    <Link href={`/manga/info/${manga.id}`}>
      <div className="group relative overflow-hidden rounded-lg bg-black border border-white/5 hover:border-white/20 transition-all duration-300 cursor-pointer hover:scale-[1.02]">
        <div className="relative aspect-[2/3] overflow-hidden">
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes={compact ? "(max-width: 640px) 80px, (max-width: 768px) 100px, 120px" : "(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300" />
          
          {manga.averageScore && (
            <div className="absolute top-1.5 right-1.5 bg-black/90 backdrop-blur-md border border-white/10 px-1.5 py-0.5 rounded-md">
              <span className="text-white text-[0.65rem] font-bold">
                {manga.averageScore}%
              </span>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-2">
            <h3 className="text-white font-semibold text-xs line-clamp-2 mb-0.5 leading-tight">
              {title}
            </h3>
            {manga.chapters && (
              <div className="flex items-center gap-1 text-[0.65rem] text-gray-300">
                <span>{manga.chapters} Ch</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default MangaCard;
