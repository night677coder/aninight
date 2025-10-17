"use client"
import React, { useRef } from 'react';
import styles from './HorizontalRecommendations.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { useTitle } from '@/lib/store';
import { useStore } from 'zustand';

function HorizontalRecommendations({ data }) {
  const containerRef = useRef();
  const animetitle = useStore(useTitle, (state) => state.animetitle);

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  function containsEngChar(text) {
    const englishRegex = /[a-zA-Z!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/;
    return englishRegex.test(text);
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.bar}></span>
        <h2 className={styles.title}>Recommendations</h2>
      </div>
      
      <div className={styles.scrollWrapper}>
        <button 
          className={`${styles.scrollButton} ${styles.scrollLeft}`}
          onClick={scrollLeft}
          aria-label="Scroll left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"></path>
          </svg>
        </button>
        
        <div className={styles.cardsContainer} ref={containerRef}>
          {data?.map((item) => {
            const anime = {
              id: item?.mediaRecommendation?.id || '',
              coverImage: item?.mediaRecommendation?.coverImage?.extraLarge || '',
              title: item?.mediaRecommendation?.title || '',
              status: item?.mediaRecommendation?.status || '',
              format: item?.mediaRecommendation?.format || '',
              episodes: item?.mediaRecommendation?.episodes || '',
            };
            
            const displayTitle = containsEngChar(anime.title[animetitle]) 
              ? anime.title[animetitle] 
              : anime.title.romaji;

            return (
              <Link href={`/anime/info/${anime.id}`} key={anime.id} className={styles.card}>
                <div className={styles.imageWrapper}>
                  <Image
                    src={anime.coverImage}
                    alt={displayTitle}
                    width={150}
                    height={200}
                    className={styles.image}
                    loading="lazy"
                  />
                  <div className={styles.overlay}>
                    <div className={styles.info}>
                      <span className={styles.format}>{anime.format || "?"}</span>
                      <span className={styles.dot}>•</span>
                      <span className={`${styles.status} ${
                        anime.status === 'RELEASING' ? styles.releasing : 
                        anime.status === 'NOT_YET_RELEASED' ? styles.notReleased : ''
                      }`}>
                        {anime.status}
                      </span>
                      <span className={styles.dot}>•</span>
                      <span>Ep {anime.episodes || '?'}</span>
                    </div>
                  </div>
                </div>
                <p className={styles.cardTitle}>
                  <span className={`${styles.statusDot} ${
                    anime.status === 'RELEASING' ? styles.releasing : 
                    anime.status === 'NOT_YET_RELEASED' ? styles.notReleased : styles.hidden
                  }`}></span>
                  {displayTitle}
                </p>
              </Link>
            );
          })}
        </div>
        
        <button 
          className={`${styles.scrollButton} ${styles.scrollRight}`}
          onClick={scrollRight}
          aria-label="Scroll right"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default HorizontalRecommendations;
