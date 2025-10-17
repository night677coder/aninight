"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { Button, useDisclosure } from '@nextui-org/react';
import Image from 'next/image';
import MangaAddToList from './MangaAddToList';
import { toast } from 'sonner';

function MangaDetailsTop({ data, chaptersData, id, session, list, setList }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const title = data?.title?.english || data?.title?.romaji || data?.title?.native;
  const latestChapter = chaptersData?.chapters?.[0];

  const handleAddToListClick = () => {
    if (!session) {
      toast.error('Please login to add to list');
      return;
    }
    onOpen();
  };

  return (
    <div className="relative min-h-screen bg-black">
      {/* Background Banner with Overlay */}
      {data?.bannerImage && (
        <div className="absolute inset-0 h-[50vh] md:h-[60vh]">
          <Image
            src={data.bannerImage}
            alt={title}
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
        </div>
      )}

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 pt-20 sm:pt-28 md:pt-32 pb-8 sm:pb-12 md:pb-16">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8">
          {/* Cover Image */}
          <div className="flex-shrink-0 mx-auto lg:mx-0">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-lg md:rounded-xl blur-xl md:blur-2xl group-hover:blur-2xl md:group-hover:blur-3xl transition-all duration-500" />
              <div className="relative w-[160px] h-[240px] sm:w-[200px] sm:h-[300px] md:w-[240px] md:h-[360px] rounded-lg md:rounded-xl overflow-hidden border border-white/20 md:border-2 shadow-2xl">
                <Image
                  src={data?.coverImage?.extraLarge || data?.coverImage?.large}
                  alt={title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4 sm:space-y-5 md:space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 tracking-tight leading-tight">
                {title}
              </h1>
              {data?.title?.native && data?.title?.native !== title && (
                <p className="text-base sm:text-lg md:text-xl text-gray-400">{data.title.native}</p>
              )}
            </div>

            {/* Genres */}
            {data?.genres && data.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {data.genres.slice(0, 6).map((genre) => (
                  <span
                    key={genre}
                    className="px-2.5 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-xs sm:text-sm text-white hover:bg-white/20 transition-colors"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 sm:p-4">
                <p className="text-gray-400 text-xs sm:text-sm mb-0.5 sm:mb-1">Score</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                  {data?.averageScore ? `${data.averageScore}%` : 'N/A'}
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 sm:p-4">
                <p className="text-gray-400 text-xs sm:text-sm mb-0.5 sm:mb-1">Status</p>
                <p className="text-sm sm:text-base md:text-lg font-semibold text-white truncate">{data?.status || 'N/A'}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 sm:p-4">
                <p className="text-gray-400 text-xs sm:text-sm mb-0.5 sm:mb-1">Chapters</p>
                <p className="text-sm sm:text-base md:text-lg font-semibold text-white">{data?.chapters || '?'}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 sm:p-4">
                <p className="text-gray-400 text-xs sm:text-sm mb-0.5 sm:mb-1">Volumes</p>
                <p className="text-sm sm:text-base md:text-lg font-semibold text-white">{data?.volumes || '?'}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
              {latestChapter && (
                <Link href={`/manga/read?id=${id}&chapterId=${latestChapter.id}&chapter=${latestChapter.title}`} className="flex-1 sm:flex-initial">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-white text-black font-bold hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-white/20 h-12 sm:h-auto text-sm sm:text-base"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                    </svg>
                    <span className="truncate">Start Reading - Ch. {latestChapter.title}</span>
                  </Button>
                </Link>
              )}
              
              <Button
                size="lg"
                onClick={handleAddToListClick}
                className={`w-full sm:w-auto font-bold transition-all duration-300 h-12 sm:h-auto text-sm sm:text-base ${
                  list 
                    ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20' 
                    : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                }`}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {list ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  )}
                </svg>
                {list ? 'In Your List' : 'Add to List'}
              </Button>
            </div>

            {/* Add to List Modal */}
            {session && (
              <MangaAddToList
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                list={list}
                setList={setList}
                session={session}
                id={id}
                chaptersLength={data?.chapters}
              />
            )}

            {/* Description */}
            {data?.description && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 sm:p-5 md:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Synopsis</h2>
                <div
                  className="text-sm sm:text-base text-gray-300 leading-relaxed prose prose-invert prose-sm sm:prose-base max-w-none"
                  dangerouslySetInnerHTML={{ __html: data.description }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MangaDetailsTop;
