"use client"
import React, { useState, useRef } from 'react';
import Image from 'next/image'
import styles from '../../styles/Animecard.module.css'
import { useTitle } from '@/lib/store';
import { useStore } from 'zustand';

function ItemContent({ anime, cardid }) {
    const animetitle = useStore(useTitle, (state) => state.animetitle);
    const [showTrailer, setShowTrailer] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const hoverTimeoutRef = useRef(null);

    function containsEngChar(text) {
        const englishRegex = /[a-zA-Z!@#$%^&*()_+{}\[\]:;<>,.?~\\/-] /;
        return englishRegex.test(text);
    }

    // Handle hover with delay
    const handleMouseEnter = () => {
        setIsHovering(true);
        // Only show trailer if anime has one and after 1 second delay
        if (anime?.trailer?.id) {
            hoverTimeoutRef.current = setTimeout(() => {
                setShowTrailer(true);
            }, 1000); // 1 second delay
        }
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
        setShowTrailer(false);
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
    };

    return (
        <div 
            className={styles.carditem}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {cardid === 'Recent Episodes' && (
                <div className="flex-shrink-0 absolute top-0 right-0 flex items-center justify-center gap-[.4rem] bg-black/60 backdrop-blur font-light xl:font-normal text-white !text-xs  line-clamp-1 px-2 p-1 rounded-bl-lg tracking-wider">
                    <span className='hidden md:flex'>Episode</span><span className='md:hidden'>Ep</span> <span className='font-medium'>{anime?.currentEpisode || '?'}</span></div>
            )}
             {cardid === 'Related Anime' && (
                <div className="flex-shrink-0 absolute top-0 right-0 flex items-center justify-center gap-[.4rem] bg-black/60 backdrop-blur font-light xl:font-normal text-white !text-xs  line-clamp-1 px-2 p-1 rounded-bl-lg tracking-wider">
                    <span className=''>{anime?.relationType}</span></div>
            )}
            <div className={`${styles.cardimgcontainer} relative overflow-hidden`}>
                {/* Always show image as base */}
                <Image
                    src={anime?.coverImage || anime?.image}
                    alt={anime?.title[animetitle] || anime?.title?.romaji}
                    width={155}
                    height={230}
                    placeholder="blur"
                    loading='eager'
                    blurDataURL={'https://wallpapercave.com/wp/wp11913677.jpg' || anime.coverImage || anime.image}
                    className={`${styles.cardimage} opacity-0 transition-all duration-500`}
                    onLoad={(e) => e.target.classList.remove('opacity-0')}
                />
                
                {/* Show trailer overlay if hovering and trailer exists */}
                {showTrailer && anime?.trailer?.id && (
                    <div className="absolute inset-0 z-20 bg-black animate-fadeIn">
                        <iframe
                            src={`https://www.youtube-nocookie.com/embed/${anime.trailer.id}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&loop=1&playlist=${anime.trailer.id}&disablekb=1&fs=0&iv_load_policy=3&cc_load_policy=0&playsinline=1`}
                            title={`${anime?.title[animetitle] || anime?.title?.romaji} Trailer`}
                            className="w-full h-full pointer-events-none"
                            allow="autoplay; encrypted-media"
                            loading="lazy"
                            style={{ border: 'none', objectFit: 'cover' }}
                        />
                        {/* Trailer indicator */}
                        <div className="absolute top-2 left-2 bg-red-600/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-white flex items-center gap-1 z-30 font-medium">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                            TRAILER
                        </div>
                    </div>
                )}
                
                {/* Loading indicator when hovering and waiting for trailer */}
                {isHovering && anime?.trailer?.id && !showTrailer && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs text-white font-medium">Loading trailer...</span>
                        </div>
                    </div>
                )}
                
                {/* Trailer available indicator */}
                {anime?.trailer?.id && !isHovering && (
                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-white/80 flex items-center gap-1 z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                        Hover
                    </div>
                )}
            </div>
            <div className="hidden xl:flex h-[85%] w-[100%] rounded absolute hover:bg-gradient-to-t from-black/90 to-transparent z-7 opacity-0 hover:opacity-100 transition-all duration-300 ease  justify-center">
                <div className="bottom-4 absolute text-xs font-light flex flex-wrap items-center justify-center gap-[.3rem] z-10">
                    <span className="uppercase">{anime.format || "?"}</span> <span className='text-[10px]'>&#8226;</span>
                    <span className={anime.status === 'RELEASING' ? 'text-green-400 font-normal' : anime.status === 'NOT_YET_RELEASED' ? 'text-red-600 font-normal' : 'text-white font-normal'}>
                        {anime.status}
                    </span>
                    <span className='text-[10px]'>&#8226;</span>
                    {cardid === 'Recent Episodes' ? (
                        <span>Ep {anime?.totalEpisodes || anime?.currentEpisode || '?'}</span>
                    ) : (
                        <span>Ep {anime?.episodes || anime?.nextAiringEpisode?.episode - 1 || '?'}</span>
                    )}
                </div>
            </div>
            <span className={styles.cardtitle}>
                <span className={`aspect-square w-2 h-2 inline-block mr-1 rounded-full ${anime.status === "NOT_YET_RELEASED" ? 'bg-red-500' : anime.status === 'RELEASING' ? 'bg-green-500' : 'hidden'} xl:hidden`}>
                </span>
                {containsEngChar(anime.title[animetitle]) ? anime.title[animetitle] : anime.title.romaji}
            </span>
        </div>
    )
}

export default ItemContent
