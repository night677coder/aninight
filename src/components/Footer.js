"use client"
import React from 'react'
import Link from 'next/link'
import { useTitle } from '@/lib/store';
import { useStore } from 'zustand';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faFilm, faTv, faCalendarAlt, faInfoCircle, faList, faBook } from '@fortawesome/free-solid-svg-icons';

function Footer() {
    const animetitle = useStore(useTitle, (state) => state.animetitle);
    const year = new Date().getFullYear();
    const month = new Date().getMonth();

    const handleToggle = () => {
        if (animetitle === 'english') {
            useTitle.setState({ animetitle: 'romaji' })
        } else {
            useTitle.setState({ animetitle: 'english' })
        }
    };

    function getSeason(month) {
        if (month === 12 || month === 1 || month === 2) {
            return 'WINTER';
        } else if (month === 3 || month === 4 || month === 5) {
            return 'SPRING';
        } else if (month === 6 || month === 7 || month === 8) {
            return 'SUMMER';
        } else {
            return 'FALL';
        }
    }

    const format = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];

    function nextSeason(currentSeason) {
        const currentSeasonIndex = format.indexOf(currentSeason);
        const nextSeasonIndex = (currentSeasonIndex + 1) % format.length;
        return format[nextSeasonIndex];
    }

    return (
        <footer className="bg-black mt-10 border-t border-[#222] relative z-40">
            <div className="mx-auto w-full lg:max-w-[85%] p-1 py-2 sm:p-2 sm:py-4 lg:pt-10 lg:pb-6">
                <div className="lg:flex lg:justify-between">
                    {/* Left Side - Branding */}
                    <div className="mb-6 lg:mb-0">
                        <Link href="/" className="flex items-center w-fit mb-3 sm:mb-6">
                            <p className={`self-center text-2xl sm:text-3xl lg:text-4xl font-medium whitespace-nowrap dark:text-white font-['Bebas_Neue'] tracking-wider`}>ANI<span className="text-white text-shadow">NIGHT</span></p>
                        </Link>
                        <p className="font-sans text-xs sm:text-sm text-[#999] lg:w-[520px] leading-relaxed">
                            The ultimate destination for anime streaming. 
                        </p>
                    </div>
                    
                    {/* Right Side - Quick Links */}
                    <div className="flex flex-col lg:flex-row items-end lg:items-center gap-2 sm:gap-4 lg:gap-8">
                        {/* Quick Links - Horizontal on Mobile */}
                        <div className="flex flex-row items-center gap-1 sm:gap-2 lg:hidden mb-2 sm:mb-4">
                            {/* Anime Section */}
                            <div>
                                <Link href="/all-anime" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                                    <FontAwesomeIcon icon={faFilm} className="text-xs sm:text-sm" />
                                    All Anime
                                </Link>
                            </div>
                            
                            {/* Manga Section */}
                            <div>
                                <Link href="/manga/catalog" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                                    <FontAwesomeIcon icon={faBook} className="text-xs sm:text-sm" />
                                    Manga
                                </Link>
                            </div>
                        </div>
                        
                        {/* Desktop Layout - Vertical */}
                        <div className="hidden lg:flex lg:flex-col lg:gap-6">
                            {/* Anime Section */}
                            <div className="mb-6 lg:mb-0">
                                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faFilm} className="text-sm" />
                                    <Link href="/all-anime" className="text-gray-300 hover:text-white transition-colors text-sm">
                                        All Anime
                                    </Link>
                                </h3>
                            </div>
                            
                            {/* Manga Section */}
                            <div className="mb-6 lg:mb-0">
                                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faBook} className="text-sm" />
                                    <Link href="/manga/catalog" className="text-gray-300 hover:text-white transition-colors text-sm">
                                        Manga
                                    </Link>
                                </h3>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
            <div className='border-t border-[#222] mt-3 sm:mt-6'></div>
            <div className="mx-auto w-full lg:max-w-[85%] flex flex-col lg:flex-row lg:items-center lg:justify-between text-xs sm:text-sm text-[#999] py-3 sm:py-6">
                <div className="text-center lg:text-center w-full">
                    <p className="text-xs sm:text-sm"> &copy;{year} <Link href="/" className="text-white hover:text-gray-300 transition-colors">ANINIGHT</Link> | All Rights Reserved</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer