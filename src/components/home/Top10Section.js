"use client";
import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown, faArrowRight, faStar, faMedal } from '@fortawesome/free-solid-svg-icons';
import styles from './Top10Section.module.css';

function Top10Section({ animeList }) {
  if (!animeList || animeList.length === 0) {
    return null;
  }

  const top10 = animeList.slice(0, 10);

  const truncateDescription = (html, maxLength = 100) => {
    if (!html) return '';
    const text = html.replace(/<[^>]*>/g, '');
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getRankColor = (index) => {
    if (index === 0) return '#FFD700'; // Gold
    if (index === 1) return '#C0C0C0'; // Silver
    if (index === 2) return '#CD7F32'; // Bronze
    return '#ffffff';
  };

  return (
    <div className={styles.top10Section}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.accentBar}></span>
          <h2 className={styles.title}>Top 10 Anime</h2>
          <div className={styles.badge}>
            <FontAwesomeIcon icon={faCrown} />
            <span>Best of the Best</span>
          </div>
        </div>
        <Link href="/anime/catalog?sort=SCORE_DESC" className={styles.viewAll}>
          <span>View All</span>
          <FontAwesomeIcon icon={faArrowRight} />
        </Link>
      </div>

      <div className={styles.scrollContainer}>
        <div className={styles.scrollWrapper}>
          <div className={styles.cardsGrid}>
            {top10.map((anime, index) => (
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
                    
                    <div className={styles.rankBadge} style={{ background: index < 3 ? getRankColor(index) : 'rgba(0, 0, 0, 0.8)' }}>
                      {index < 3 && <FontAwesomeIcon icon={faMedal} />}
                      <span style={{ color: index < 3 ? '#000' : '#fff' }}>#{index + 1}</span>
                    </div>
                    
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

export default Top10Section;
