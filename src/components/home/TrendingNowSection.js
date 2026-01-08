"use client";
import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFire, faArrowRight, faStar } from '@fortawesome/free-solid-svg-icons';
import styles from './TrendingNowSection.module.css';

function TrendingNowSection({ animeList }) {
  if (!animeList || animeList.length === 0) {
    return null;
  }

  const truncateDescription = (html, maxLength = 100) => {
    if (!html) return '';
    const text = html.replace(/<[^>]*>/g, '');
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className={styles.trendingSection}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.accentBar}></span>
          <h2 className={styles.title}>Trending Now</h2>
          <div className={styles.badge}>
            <FontAwesomeIcon icon={faFire} />
            <span>Hot</span>
          </div>
        </div>
      </div>

      <div className={styles.scrollContainer}>
        <div className={styles.scrollWrapper}>
          <div className={styles.cardsGrid}>
            {animeList.map((anime, index) => (
              <Link href={`/anime/info/${anime.id}`} key={anime.id} className={styles.card}>
                <div className={styles.cardInner}>
                  <div className={styles.imageContainer}>
                    <img 
                      src={anime.coverImage?.extraLarge || anime.coverImage?.large || '/placeholder.jpg'} 
                      alt={anime.title?.english || anime.title?.romaji}
                      className={styles.image}
                    />
                    
                    {anime.averageScore && (
                      <div className={styles.scoreBadge}>
                        <FontAwesomeIcon icon={faStar} style={{ color: '#fbbf24' }} />
                        {(anime.averageScore / 10).toFixed(1)}
                      </div>
                    )}
                    
                    {index < 5 && (
                      <div className={styles.trendingBadge}>
                        <FontAwesomeIcon icon={faFire} />
                        #{index + 1}
                      </div>
                    )}
                    
                    <div className={styles.overlay}>
                      <p className={styles.description}>
                        {truncateDescription(anime.description)}
                      </p>
                    </div>
                  </div>
                  
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>
                      {anime.title?.english || anime.title?.romaji}
                    </h3>
                    
                    <div className={styles.tags}>
                      {anime.genres?.slice(0, 1).map((genre, idx) => (
                        <span key={idx} className={`${styles.tag} ${styles.genreTag}`}>
                          {genre}
                        </span>
                      ))}
                      {anime.format && (
                        <span className={`${styles.tag} ${styles.formatTag}`}>
                          {anime.format.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrendingNowSection;
