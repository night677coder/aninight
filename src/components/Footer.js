"use client"
import React from 'react'
import Link from 'next/link'
import { useTitle } from '@/lib/store';
import { useStore } from 'zustand';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faFilm, faTv, faCalendarAlt, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

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
        <div>
            <footer className="bg-black mt-10 border-t border-[#222]">
                <div className="mx-auto w-full lg:max-w-[85%] p-4 py-8 lg:pt-10 lg:pb-6">
                    <div className="lg:flex lg:justify-between">
                        <div className="mb-8 lg:mb-0">
                            <Link href="/" className="flex items-center w-fit mb-4">
                                <p className={`self-center text-4xl font-medium whitespace-nowrap dark:text-white font-['Bebas_Neue'] tracking-wider`}>VOID<span className="text-white text-shadow">ANIME</span></p>
                            </Link>
                            <p className="font-sans text-sm text-[#999] lg:w-[520px] leading-relaxed mb-6">
                                The ultimate destination for anime streaming. VoidAnime does not store any files on our server, we are linked
                                to media which is hosted on 3rd party services.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-16">
                            <div>
                                <h3 className="text-white font-medium text-base mb-4">Browse</h3>
                                <ul className="flex flex-col gap-3">
                                    <li>
                                        <Link href="/anime/catalog" className="text-[#999] hover:text-white text-sm flex items-center gap-2 transition-colors">
                                            <FontAwesomeIcon icon={faGlobe} className="w-3 h-3" /> Browse All
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/anime/catalog?format=MOVIE" className="text-[#999] hover:text-white text-sm flex items-center gap-2 transition-colors">
                                            <FontAwesomeIcon icon={faFilm} className="w-3 h-3" /> Movies
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/anime/catalog?format=TV" className="text-[#999] hover:text-white text-sm flex items-center gap-2 transition-colors">
                                            <FontAwesomeIcon icon={faTv} className="w-3 h-3" /> TV Shows
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-white font-medium text-base mb-4">Seasons</h3>
                                <ul className="flex flex-col gap-3">
                                    <li>
                                        <Link href={`/anime/catalog?season=${getSeason(month + 1)}&year=2024`} className="text-[#999] hover:text-white text-sm flex items-center gap-2 transition-colors">
                                            <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3" /> This Season
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={`/anime/catalog?season=${nextSeason(getSeason(month + 1))}&year=2024`} className="text-[#999] hover:text-white text-sm flex items-center gap-2 transition-colors">
                                            <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3" /> Upcoming Season
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-white font-medium text-base mb-4">About</h3>
                                <ul className="flex flex-col gap-3">
                                    <li>
                                        <Link href="/dmca" className="text-[#999] hover:text-white text-sm flex items-center gap-2 transition-colors">
                                            <FontAwesomeIcon icon={faInfoCircle} className="w-3 h-3" /> DMCA
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="https://skyanime.site/about" target='_blank' className="text-[#999] hover:text-white text-sm flex items-center gap-2 transition-colors">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z" /></svg> About
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='border-t border-[#222] mt-6'></div>
                <div className="mx-auto w-full lg:max-w-[85%] flex flex-col lg:flex-row lg:items-center lg:justify-between text-sm text-[#999] py-6">
                    <div className="flex items-center gap-4 mb-4 lg:mb-0">
                        <div className="flex items-center">
                            <label className="relative cursor-pointer flex items-center gap-3">
                                <span className="text-xs font-medium">Language:</span>
                                {animetitle && (
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={animetitle === 'english'}
                                        onChange={handleToggle}
                                    />
                                )}
                                <div className="w-[50px] h-6 flex items-center bg-[#333] rounded-full peer-checked:bg-[#ffffff] transition-colors after:flex after:items-center after:justify-center peer after:content-['JP'] peer-checked:after:content-['EN'] peer-checked:after:translate-x-full after:absolute after:bg-white after:rounded-full after:h-5 after:w-5 after:mx-0.5 after:transition-all after:text-[10px] after:font-bold after:text-black">
                                </div>
                            </label>
                        </div>
                    </div>
                    <div className="text-center lg:text-right">
                        <p>© {year} <Link href="/" className="text-white hover:text-gray-300 transition-colors">VOIDANIME™</Link> | Made with ❤️ by <span className="font-medium text-white">VoidBorn</span></p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Footer