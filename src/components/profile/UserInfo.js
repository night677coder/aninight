"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MediaCard from './MediaCard';

function UserInfo({ lists, mangaLists, session }) {
    const [mediaType, setMediaType] = useState('anime'); // 'anime' or 'manga'
    const currentLists = mediaType === 'anime' ? lists : mangaLists;
    const [activeTab, setActiveTab] = useState(currentLists.find(tab => tab?.name === "Watching" || tab?.name === "Reading") || currentLists[0]);

    const handleClick = (e, tab) => {
        e.preventDefault();
        setActiveTab(tab);
    };

    const handleMediaTypeChange = (type) => {
        setMediaType(type);
        const newLists = type === 'anime' ? lists : mangaLists;
        setActiveTab(newLists.find(tab => tab?.name === (type === 'anime' ? "Watching" : "Reading")) || newLists[0]);
    };

    const isSelected = (tab) => activeTab?.name === tab?.name;

    return (
        <div>
            <div className="max-w-[95%] lg:max-w-[90%] xl:max-w-[86%] mx-auto">
                {/* Media Type Toggle */}
                <div className="flex gap-4 mb-6 border-b border-[#333]">
                    <button
                        onClick={() => handleMediaTypeChange('anime')}
                        className={`px-6 py-3 text-lg font-semibold transition-all duration-200 relative ${
                            mediaType === 'anime' 
                                ? 'text-white' 
                                : 'text-[#666] hover:text-[#999]'
                        }`}
                    >
                        Anime
                        {mediaType === 'anime' && (
                            <motion.div 
                                layoutId="mediaTypeIndicator" 
                                className="absolute bottom-0 left-0 right-0 h-[2px] bg-white"
                            />
                        )}
                    </button>
                    <button
                        onClick={() => handleMediaTypeChange('manga')}
                        className={`px-6 py-3 text-lg font-semibold transition-all duration-200 relative ${
                            mediaType === 'manga' 
                                ? 'text-white' 
                                : 'text-[#666] hover:text-[#999]'
                        }`}
                    >
                        Manga
                        {mediaType === 'manga' && (
                            <motion.div 
                                layoutId="mediaTypeIndicator" 
                                className="absolute bottom-0 left-0 right-0 h-[2px] bg-white"
                            />
                        )}
                    </button>
                </div>

                <div className="flex mb-3 flex-nowrap overflow-x-auto scrollbar-hide">
                    {currentLists.map((tab) => (
                        <div
                            key={tab.name}
                            className={[
                                "relative p-1 my-1 mx-3 cursor-pointer text-[#A1A1AA] transition-opacity duration-250 ease-in-out hover:opacity-60 text-lg sm:text-xl font-medium",
                                isSelected(tab) ? "!text-white !opacity-100" : "",
                            ].join(" ")}
                        >
                            <div key={tab.name} onClick={(e) => handleClick(e, tab)} className="flex flex-row items-center">
                                {tab.name} <span className="ml-2 text-base">({tab?.entries?.length})</span>
                            </div>
                            {isSelected(tab) && (
                                <motion.div layoutId="indicator" className="absolute !h-[1px] bottom-0 left-0 right-0 bg-white" />
                            )}
                        </div>
                    ))}
                </div>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab.name || "empty"}
                        initial="initial"
                        animate="enter"
                        exit="exit"
                        transition={{
                            duration: 0.3,
                        }}
                    >
                        <div className="mx-3 my-5 grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-3 lg:gap-4 !gap-y-8">
                            {activeTab &&
                                activeTab.entries
                                    .slice() // Create a copy of the array to avoid mutating the original
                                    .sort((a, b) => b.updatedAt - a.updatedAt) // Sort by updatedate in descending order
                                    .map((anime) => (
                                        <MediaCard key={anime.id} anime={anime} session={session} mediaType={mediaType}/>
                                    ))}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}

export default UserInfo;