"use client"
import { Fragment, useEffect, useRef, useState } from "react";
import { Combobox, Dialog, Transition, Tab } from "@headlessui/react";
import Link from 'next/link'
import UseDebounce from "@/utils/UseDebounce";
import { AdvancedSearch } from "@/lib/Anilistfunctions";
import { searchMangaAnilist } from "@/lib/MangaFunctions";
import { useRouter } from 'next/navigation';
import { useTitle, useSearchbar } from '@/lib/store';
import { useStore } from 'zustand';

function Search() {
    const router = useRouter();
    const animetitle = useStore(useTitle, (state) => state.animetitle);
    const Isopen = useStore(useSearchbar, (state) => state.Isopen);
    const [query, setQuery] = useState("");
    const [animeData, setAnimeData] = useState(null);
    const [mangaData, setMangaData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState(0); // 0 = Anime, 1 = Manga
    const debouncedSearch = UseDebounce(query, 500);

    let focusInput = useRef(null);

    async function searchdata() {
        setLoading(true);
        try {
            const [animeRes, mangaRes] = await Promise.all([
                AdvancedSearch(debouncedSearch),
                searchMangaAnilist(debouncedSearch, 1)
            ]);
            setAnimeData(animeRes);
            setMangaData(mangaRes);
        } catch (error) {
            console.error('Search error:', error);
        }
        setLoading(false);
    }

    useEffect(() => {
        if (debouncedSearch) {
            searchdata();
        } else {
            setAnimeData(null);
            setMangaData(null);
        }
    }, [debouncedSearch]);

    function closeModal() {
        useSearchbar.setState({ Isopen: false });
    }

    const currentData = selectedTab === 0 ? animeData?.media : mangaData?.media;
    const catalogPath = selectedTab === 0 ? '/anime/catalog' : '/manga/catalog';
    const infoPath = selectedTab === 0 ? '/anime/info' : '/manga/info';

    return (
        <Transition appear show={Isopen} as={Fragment}>
            <Dialog
                as="div"
                className="relative z-[99999]"
                initialFocus={focusInput}
                onClose={closeModal}
            >
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-100"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-3xl max-h-[80dvh] transform text-left transition-all">
                                <Combobox
                                    as="div"
                                    className="mx-auto rounded-xl shadow-2xl relative flex flex-col bg-black/90 backdrop-blur-xl border border-white/20"
                                    onChange={(e) => {
                                        useSearchbar.setState({ Isopen: false });
                                        setAnimeData(null);
                                        setMangaData(null);
                                        setQuery("");
                                    }}
                                >
                                    {/* Header */}
                                    <div className="flex justify-between items-center py-3 px-4 border-b border-white/10">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400 text-sm">Quick access:</span>
                                            <kbd className="bg-white/10 text-white text-xs font-medium px-2 py-1 rounded border border-white/20">CTRL</kbd>
                                            <span className="text-gray-400">+</span>
                                            <kbd className="bg-white/10 text-white text-xs font-medium px-2 py-1 rounded border border-white/20">K</kbd>
                                        </div>
                                        <button
                                            type="button"
                                            className="bg-white/10 text-white px-3 py-1 text-sm font-medium rounded border border-white/20 hover:bg-white/20 transition-colors"
                                            onClick={closeModal}
                                        >
                                            ESC
                                        </button>
                                    </div>

                                    {/* Search Input */}
                                    <div className="flex items-center border-b border-white/10 p-2">
                                        <div className="bg-white/10 rounded-full p-2 ml-2 mr-3">
                                            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <Combobox.Input
                                            ref={focusInput}
                                            className="p-4 text-white w-full bg-transparent border-0 outline-none text-lg placeholder:text-gray-500"
                                            placeholder="Search anime or manga..."
                                            onChange={(event) => setQuery(event.target.value)}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter") {
                                                    useSearchbar.setState({ Isopen: false });
                                                    router.push(`${catalogPath}?search=${encodeURIComponent(event.target.value)}`);
                                                    setAnimeData(null);
                                                    setMangaData(null);
                                                    setQuery("");
                                                }
                                            }}
                                            autoComplete="off"
                                        />
                                    </div>

                                    {/* Tabs */}
                                    <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
                                        <Tab.List className="flex border-b border-white/10 px-4">
                                            <Tab className={({ selected }) =>
                                                `px-6 py-3 text-sm font-medium transition-all ${
                                                    selected
                                                        ? 'text-white border-b-2 border-white'
                                                        : 'text-gray-400 hover:text-white'
                                                }`
                                            }>
                                                Anime {animeData?.media && `(${animeData.media.length})`}
                                            </Tab>
                                            <Tab className={({ selected }) =>
                                                `px-6 py-3 text-sm font-medium transition-all ${
                                                    selected
                                                        ? 'text-white border-b-2 border-white'
                                                        : 'text-gray-400 hover:text-white'
                                                }`
                                            }>
                                                Manga {mangaData?.media && `(${mangaData.media.length})`}
                                            </Tab>
                                        </Tab.List>

                                        {/* Results */}
                                        <Tab.Panels>
                                            <Tab.Panel>
                                                <Combobox.Options
                                                    static
                                                    className="max-h-[50dvh] overflow-y-auto flex flex-col scrollbar-thin scrollbar-thumb-white/20 scrollbar-thumb-rounded"
                                                >
                                                    {!loading ? (
                                                        <Fragment>
                                                            {animeData?.media?.length > 0 ? (
                                                                animeData.media.map((item) => (
                                                                    <Combobox.Option
                                                                        key={item.id}
                                                                        className={({ active }) =>
                                                                            `relative cursor-pointer select-none py-3 px-4 border-b border-white/5 ${
                                                                                active ? "bg-white/10" : "bg-transparent"
                                                                            }`
                                                                        }
                                                                    >
                                                                        <Link 
                                                                            href={`/anime/info/${item.id}`} 
                                                                            className="flex gap-3 items-center group"
                                                                            onClick={() => {
                                                                                useSearchbar.setState({ Isopen: false });
                                                                                setAnimeData(null);
                                                                                setMangaData(null);
                                                                                setQuery("");
                                                                            }}
                                                                        >
                                                                            <div className="w-[55px] h-[80px] relative overflow-hidden rounded-lg">
                                                                                <img
                                                                                    src={item.coverImage.large || item.coverImage.medium}
                                                                                    alt="cover"
                                                                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                                                />
                                                                            </div>
                                                                            <div className="flex flex-col flex-1">
                                                                                <div className="text-base font-semibold text-white group-hover:text-gray-300 transition-colors">
                                                                                    {item.title[animetitle] || item.title.romaji || item.title.english}
                                                                                </div>
                                                                                <div className="text-xs flex items-center text-gray-400 mt-1 flex-wrap gap-2">
                                                                                    {item.averageScore && (
                                                                                        <span className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded">
                                                                                            ⭐ {item.averageScore / 10}
                                                                                        </span>
                                                                                    )}
                                                                                    {item.format && (
                                                                                        <span className="bg-white/10 px-2 py-0.5 rounded">{item.format}</span>
                                                                                    )}
                                                                                    {item.startDate?.year && (
                                                                                        <span className="bg-white/10 px-2 py-0.5 rounded">{item.startDate.year}</span>
                                                                                    )}
                                                                                    {item.status && (
                                                                                        <span className="bg-white/10 px-2 py-0.5 rounded">{item.status}</span>
                                                                                    )}
                                                                                </div>
                                                                                {item.genres && (
                                                                                    <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                                                                                        {item.genres.slice(0, 3).join(', ')}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </Link>
                                                                    </Combobox.Option>
                                                                ))
                                                            ) : (
                                                                query !== '' && (
                                                                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
                                                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                                                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                            </svg>
                                                                        </div>
                                                                        <p className="text-white">No anime found</p>
                                                                        <p className="text-sm">Try different keywords</p>
                                                                    </div>
                                                                )
                                                            )}
                                                        </Fragment>
                                                    ) : (
                                                        query !== "" && (
                                                            <div className="flex items-center justify-center py-8">
                                                                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                            </div>
                                                        )
                                                    )}
                                                </Combobox.Options>
                                            </Tab.Panel>
                                            <Tab.Panel>
                                                <Combobox.Options
                                                    static
                                                    className="max-h-[50dvh] overflow-y-auto flex flex-col scrollbar-thin scrollbar-thumb-white/20 scrollbar-thumb-rounded"
                                                >
                                                    {!loading ? (
                                                        <Fragment>
                                                            {mangaData?.media?.length > 0 ? (
                                                                mangaData.media.map((item) => (
                                                                    <Combobox.Option
                                                                        key={item.id}
                                                                        className={({ active }) =>
                                                                            `relative cursor-pointer select-none py-3 px-4 border-b border-white/5 ${
                                                                                active ? "bg-white/10" : "bg-transparent"
                                                                            }`
                                                                        }
                                                                    >
                                                                        <Link 
                                                                            href={`/manga/info/${item.id}`} 
                                                                            className="flex gap-3 items-center group"
                                                                            onClick={() => {
                                                                                useSearchbar.setState({ Isopen: false });
                                                                                setAnimeData(null);
                                                                                setMangaData(null);
                                                                                setQuery("");
                                                                            }}
                                                                        >
                                                                            <div className="w-[55px] h-[80px] relative overflow-hidden rounded-lg">
                                                                                <img
                                                                                    src={item.coverImage.large || item.coverImage.medium}
                                                                                    alt="cover"
                                                                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                                                />
                                                                            </div>
                                                                            <div className="flex flex-col flex-1">
                                                                                <div className="text-base font-semibold text-white group-hover:text-gray-300 transition-colors">
                                                                                    {item.title[animetitle] || item.title.romaji || item.title.english}
                                                                                </div>
                                                                                <div className="text-xs flex items-center text-gray-400 mt-1 flex-wrap gap-2">
                                                                                    {item.averageScore && (
                                                                                        <span className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded">
                                                                                            ⭐ {item.averageScore / 10}
                                                                                        </span>
                                                                                    )}
                                                                                    {item.format && (
                                                                                        <span className="bg-white/10 px-2 py-0.5 rounded">{item.format}</span>
                                                                                    )}
                                                                                    {item.startDate?.year && (
                                                                                        <span className="bg-white/10 px-2 py-0.5 rounded">{item.startDate.year}</span>
                                                                                    )}
                                                                                    {item.status && (
                                                                                        <span className="bg-white/10 px-2 py-0.5 rounded">{item.status}</span>
                                                                                    )}
                                                                                </div>
                                                                                {item.genres && (
                                                                                    <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                                                                                        {item.genres.slice(0, 3).join(', ')}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </Link>
                                                                    </Combobox.Option>
                                                                ))
                                                            ) : (
                                                                query !== '' && (
                                                                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
                                                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                                                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                            </svg>
                                                                        </div>
                                                                        <p className="text-white">No manga found</p>
                                                                        <p className="text-sm">Try different keywords</p>
                                                                    </div>
                                                                )
                                                            )}
                                                        </Fragment>
                                                    ) : (
                                                        query !== "" && (
                                                            <div className="flex items-center justify-center py-8">
                                                                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                            </div>
                                                        )
                                                    )}
                                                </Combobox.Options>
                                            </Tab.Panel>
                                        </Tab.Panels>
                                    </Tab.Group>
                                </Combobox>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

export default Search;
