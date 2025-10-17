"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@nextui-org/react';
import { updateMangaRead } from '@/lib/MangaReadHistoryFunctions';
import { useSession } from 'next-auth/react';

function MangaReader({ pages, mangaInfo, chaptersData, currentChapterId, currentChapterNum, mangaId }) {
  const [readingMode, setReadingMode] = useState('vertical');
  const [currentPage, setCurrentPage] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const { data: session } = useSession();

  const currentChapterIndex = chaptersData?.chapters?.findIndex(
    ch => ch.id === currentChapterId
  );

  const nextChapter = currentChapterIndex > 0 ? chaptersData.chapters[currentChapterIndex - 1] : null;
  const prevChapter = currentChapterIndex < chaptersData.chapters.length - 1
    ? chaptersData.chapters[currentChapterIndex + 1]
    : null;

  const handleNextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Track reading progress
  useEffect(() => {
    const saveProgress = async () => {
      const mangaTitle = mangaInfo?.title?.english || mangaInfo?.title?.romaji;
      const image = mangaInfo?.coverImage?.extraLarge || mangaInfo?.coverImage?.large;

      if (session?.user?.name) {
        await updateMangaRead({
          mangaId,
          mangaTitle,
          image,
          chapterId: currentChapterId,
          chapterNum: currentChapterNum,
          pageNum: currentPage + 1,
          totalPages: pages.length
        });
      } else {
        // Save to localStorage for non-logged-in users
        const history = JSON.parse(localStorage.getItem('manga_reading_settings')) || {};
        history[mangaId] = {
          mangaId,
          mangaTitle,
          image,
          chapterId: currentChapterId,
          chapterNum: currentChapterNum,
          pageNum: currentPage + 1,
          totalPages: pages.length,
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('manga_reading_settings', JSON.stringify(history));
      }
    };

    const debounceTimer = setTimeout(() => {
      saveProgress();
    }, 2000);

    return () => clearTimeout(debounceTimer);
  }, [currentPage, mangaId, currentChapterId, currentChapterNum, pages.length, mangaInfo, session]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (readingMode === 'horizontal') {
        if (e.key === 'ArrowRight') handleNextPage();
        if (e.key === 'ArrowLeft') handlePrevPage();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, readingMode, pages.length]);

  // Auto-hide controls
  useEffect(() => {
    let timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  if (!pages || pages.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-white text-xl">No pages available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header Controls */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${showControls ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="bg-black/90 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Back Button & Info */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <Link href={`/manga/info/${mangaId}`}>
                  <Button
                    size="sm"
                    className="bg-white/10 text-white border border-white/20 hover:bg-white/20"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </Button>
                </Link>
                <div className="min-w-0">
                  <h2 className="font-bold text-white truncate text-sm md:text-base">
                    {mangaInfo?.title?.english || mangaInfo?.title?.romaji}
                  </h2>
                  <p className="text-xs text-gray-400">Chapter {currentChapterNum}</p>
                </div>
              </div>

              {/* Reading Mode Toggle */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => setReadingMode('vertical')}
                  className={readingMode === 'vertical'
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                  }
                >
                  Vertical
                </Button>
                <Button
                  size="sm"
                  onClick={() => setReadingMode('horizontal')}
                  className={readingMode === 'horizontal'
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                  }
                >
                  Horizontal
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reader Content */}
      <div className="pt-20">
        {readingMode === 'vertical' ? (
          <div className="flex flex-col items-center">
            {pages.map((page, index) => (
              <div key={index} className="w-full max-w-5xl">
                <img
                  src={`/api/proxy/manga-image?url=${encodeURIComponent(page.img)}`}
                  alt={`Page ${page.page}`}
                  className="w-full h-auto"
                  loading={index < 3 ? 'eager' : 'lazy'}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
            <div className="relative w-full max-w-5xl">
              <img
                src={`/api/proxy/manga-image?url=${encodeURIComponent(pages[currentPage].img)}`}
                alt={`Page ${pages[currentPage].page}`}
                className="w-full h-auto"
              />

              {/* Navigation Arrows */}
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/80 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 ${currentPage === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/20 hover:scale-110'
                  }`}
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage === pages.length - 1}
                className={`absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/80 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 ${currentPage === pages.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/20 hover:scale-110'
                  }`}
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Page Counter */}
            <div className="mt-6 bg-black/80 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2">
              <span className="text-white font-semibold">
                {currentPage + 1} / {pages.length}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Chapter Navigation */}
      <div className="bg-black/90 backdrop-blur-xl border-t border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            {prevChapter ? (
              <Link href={`/manga/read?id=${mangaId}&chapterId=${prevChapter.id}&chapter=${prevChapter.title}&provider=${chaptersData?.provider || 'mangapill'}`}>
                <Button className="bg-white/10 text-white border border-white/20 hover:bg-white/20">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous Chapter
                </Button>
              </Link>
            ) : <div />}

            {nextChapter ? (
              <Link href={`/manga/read?id=${mangaId}&chapterId=${nextChapter.id}&chapter=${nextChapter.title}&provider=${chaptersData?.provider || 'mangapill'}`}>
                <Button className="bg-white text-black hover:bg-white/90">
                  Next Chapter
                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </Link>
            ) : <div />}
          </div>

          {/* Chapter Grid */}
          <div>
            <h3 className="text-white font-bold mb-4">All Chapters</h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-64 overflow-y-auto">
              {chaptersData?.chapters?.map((chapter) => (
                <Link
                  key={chapter.id}
                  href={`/manga/read?id=${mangaId}&chapterId=${chapter.id}&chapter=${chapter.title}&provider=${chaptersData?.provider || 'mangapill'}`}
                >
                  <Button
                    size="sm"
                    className={chapter.id === currentChapterId
                      ? 'bg-white text-black w-full'
                      : 'bg-white/10 text-white border border-white/20 hover:bg-white/20 w-full'
                    }
                  >
                    {chapter.title}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MangaReader;
