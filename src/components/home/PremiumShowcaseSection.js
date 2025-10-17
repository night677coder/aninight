"use client"
import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './PremiumShowcaseSection.module.css';
import { MotionDiv } from '@/utils/MotionDiv';

export default function PremiumShowcaseSection({ animeList = [], title = "Featured Collection" }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const scrollContainerRef = useRef(null);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = direction === 'left' ? -400 : 400;
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (!animeList || animeList.length === 0) return null;

    return (
        <section className={styles.premiumSection}>
            <div className={styles.header}>
                <div className={styles.titleWrapper}>
                    <div className={styles.accentLine}></div>
                    <h2 className={styles.title}>{title}</h2>
                </div>
                <div className={styles.controls}>
                    <button 
                        className={styles.scrollBtn} 
                        onClick={() => scroll('left')}
                        aria-label="Scroll left"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <button 
                        className={styles.scrollBtn} 
                        onClick={() => scroll('right')}
                        aria-label="Scroll right"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>

            <div className={styles.scrollContainer} ref={scrollContainerRef}>
                <div className={styles.grid}>
                    {animeList.slice(0, 20).map((anime, index) => (
                        <MotionDiv
                            key={anime.id || index}
                            className={styles.card}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            viewport={{ once: true }}
                        >
                            <Link href={`/anime/info/${anime.id}`} className={styles.cardLink}>
                                <div className={styles.imageWrapper}>
                                    <Image
                                        src={anime.image || anime.coverImage?.large || '/placeholder.jpg'}
                                        alt={anime.title?.english || anime.title?.romaji || 'Anime'}
                                        fill
                                        sizes="(max-width: 640px) 150px, (max-width: 1024px) 180px, 200px"
                                        className={styles.image}
                                    />
                                    <div className={styles.overlay}>
                                        <div className={styles.overlayContent}>
                                            <div className={styles.playIcon}>
                                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                                    <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    {anime.averageScore && (
                                        <div className={styles.rating}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                                            </svg>
                                            <span>{(anime.averageScore / 10).toFixed(1)}</span>
                                        </div>
                                    )}
                                    {anime.episodes && (
                                        <div className={styles.episodes}>
                                            {anime.episodes} EP
                                        </div>
                                    )}
                                </div>
                                <div className={styles.info}>
                                    <h3 className={styles.animeTitle}>
                                        {anime.title?.english || anime.title?.romaji || 'Unknown Title'}
                                    </h3>
                                    {anime.genres && anime.genres.length > 0 && (
                                        <div className={styles.genres}>
                                            {anime.genres.slice(0, 2).map((genre, i) => (
                                                <span key={i} className={styles.genre}>{genre}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        </MotionDiv>
                    ))}
                </div>
            </div>
        </section>
    );
}
