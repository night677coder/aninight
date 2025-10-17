"use client"
import React, { useEffect, useState, useRef } from 'react'
import Image from 'next/image';
import Link from 'next/link';
import { useDraggable } from 'react-use-draggable-scroll';
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/react";
import { useRouter } from 'next-nprogress-bar';
import { toast } from 'sonner'
import Skeleton from "react-loading-skeleton";
import { deleteMangaRead, getMangaReadHistory } from '@/lib/MangaReadHistoryFunctions';

function ContinueReading({ session }) {
    const containerRef = useRef();
    const { events } = useDraggable(containerRef);
    const [storedData, setStoredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    function filterHistory(history) {
        const sortedData = history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const filteredHistory = sortedData.reduce((acc, curr) => {
            if (curr.chapterId !== null && !acc.find(item => item.mangaId === curr.mangaId)) {
                acc.push(curr);
            }
            return acc;
        }, []);
        return filteredHistory;
    }

    function removeFromLocalStorage(id) {
        const history = JSON.parse(localStorage.getItem('manga_reading_settings')) || {};
        if (history[id]) {
            delete history[id];
            localStorage.setItem('manga_reading_settings', JSON.stringify(history));
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            if (typeof window !== 'undefined') {
                if (session?.user?.name) {
                    const history = await getMangaReadHistory();

                    if (history?.length > 0) {
                        const data = filterHistory(history);
                        setStoredData(data);
                    }
                    setLoading(false);
                }
                else {
                    const data = JSON.parse(localStorage.getItem('manga_reading_settings'));
                    if (data) {
                        const mappedValues = Object.keys(data).map((key) => data[key]);
                        const sortedData = mappedValues.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                        setStoredData(sortedData);
                    }
                    setLoading(false)
                }
            }
        };

        fetchData();
    }, [session]);

    async function RemoveFromHistory(id, mangaTitle) {
        try {
            const data = {};
            if (id) {
                data.mangaId = id;
            }
            if (session?.user?.name) {
                const response = await deleteMangaRead(data);
                if (response) {
                    const { remainingData, deletedData } = response;
                    toast.success(`${mangaTitle}`, {
                        description: `Successfully removed ${deletedData?.deletedCount || 0} chapter${deletedData?.deletedCount > 1 ? 's' : ''}`,
                    });
                    if (remainingData?.length > 0) {
                        const data = filterHistory(remainingData);
                        setStoredData(data);
                    } else {
                        setStoredData([]);
                    }
                    removeFromLocalStorage(id);
                } else {
                    toast.error('Failed to remove manga from history. Please try again later.');
                }
            }
            else {
                removeFromLocalStorage(id);
                toast.success(`${mangaTitle}`, {
                    description: `Removed manga from reading history.`,
                });
                setStoredData((prevData) => prevData.filter(item => item.mangaId !== id));
            }
        } catch (error) {
            toast.error('Failed to remove manga from history');
        }
    };

    if (!loading && storedData.length === 0) {
        return <div {...events} ref={containerRef}></div>;
    }

    return (
        <div className='flex flex-col mb-6 md:mb-5'>
            <div className="flex items-center gap-2 px-3 xl:px-0">
                <span className="w-[0.35rem] h-6 md:w-[0.3rem] md:h-8 rounded-md bg-white"></span>
                <h1 className="text-[19px] sm:text-[21px] my-4 font-medium xl:text-2xl">Continue Reading</h1>
            </div>
            <div className="flex items-center flex-nowrap scrollbar-hide overflow-x-auto gap-4 pl-3 xl:pl-0" {...events} ref={containerRef}>
                {!loading && storedData?.map((manga) => (
                    <div key={manga?.mangaId || manga?.id} className="flex flex-col gap-2 shrink-0 cursor-pointer relative group/item">
                        <Popover placement="bottom-end" offset={10} radius={"sm"}>
                            <PopoverTrigger>
                                <button className="absolute bg-white py-1 rounded-md flex flex-col gap-1 z-20 top-2 right-2 transition-all duration-200 ease-out md:opacity-0 group-hover/item:opacity-100 scale-90 group-hover/item:scale-100 group-hover/item:visible visible opacity-100 md:invisible shadow-md shadow-black/50 outline-none border-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="black" className="w-[17px] h-[17px]">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                                    </svg>
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="px-2 py-2 w-[170px]">
                                {(titleProps) => (
                                    <div className="flex flex-col w-full">
                                        <span className='w-full hover:bg-[#403c44] rounded-md text-sm'>
                                            <button className='py-2 px-2 w-full text-left outline-none border-none' onClick={() => RemoveFromHistory(manga.mangaId || manga.id, manga.mangaTitle)}>Remove Tracking</button>
                                        </span>
                                    </div>
                                )}
                            </PopoverContent>
                        </Popover>
                        <Link className="relative w-60 sm:w-64 md:w-80 aspect-video group"
                            href={`/manga/read?id=${manga?.mangaId || manga?.id}&chapterId=${manga?.chapterId}&chapter=${manga?.chapterNum}`}>
                            <div className="overflow-hidden w-full aspect-video rounded-lg">
                                <Image src={manga?.image || ''} alt={manga?.mangaTitle} width={155} height={230} className="w-full aspect-video object-cover rounded-lg group-hover/item:scale-[1.03] duration-300 ease-out" />
                            </div>
                            <div className="top-0 w-full h-full bg-gradient-to-t from-black/80 from-25% to-transparent to-60% transition-all duration-300 ease-out absolute z-5" />
                            <div className="absolute bottom-0 left-0 px-3 py-2 text-white flex gap-2 items-center z-10">
                                <div className="flex flex-col">
                                    <span className="text-[0.8rem] sm:text-[0.9rem] font-medium line-clamp-1">{manga?.mangaTitle}</span>
                                    <span className="text-[0.7rem] text-[#D1D7E0]">
                                        Chapter {manga?.chapterNum}
                                        {manga?.pageNum && manga?.totalPages && ` - Page ${manga.pageNum}/${manga.totalPages}`}
                                    </span>
                                </div>
                            </div>
                            {manga?.pageNum && manga?.totalPages && (
                                <span
                                    className={`absolute bottom-0 left-2 right-2 h-[1px] rounded-xl bg-red-600 z-10 `}
                                    style={{
                                        width: `${(manga.pageNum / manga.totalPages) * 95}%`,
                                    }}
                                />
                            )}
                        </Link>
                    </div>
                ))}
                {loading && (
                    [1, 2].map((item) => (
                        <div
                            key={item}
                            className="relative w-60 sm:w-64 md:w-80 aspect-video transition-opacity duration-300 ease-in-out"
                        >
                            <div className="w-full">
                                <Skeleton className="w-fit aspect-video" />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default ContinueReading
