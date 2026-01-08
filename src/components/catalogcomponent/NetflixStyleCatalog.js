"use client";
import React, { useState, useEffect } from 'react';
import { Input, Select, SelectItem } from "@nextui-org/react";
import { seasonOptions, genreOptions, tagsOptions, formatOptions, yearOptions, sortbyOptions } from './options';
import { Combobox, Transition } from '@headlessui/react';
import NetflixStyleSearchcard from './NetflixStyleSearchcard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faFilter,
  faSortAmountDown,
  faCalendarAlt,
  faFilm,
  faSnowflake,
  faTrash,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner from '@/components/LoadingSpinner';
import GoogleAdSense from '@/components/ads/GoogleAdSense';

function NetflixStyleCatalog({ searchParams }) {
  const { year, season, format, genre, search, sortby } = searchParams;
  const [selectedYear, setSelectedYear] = useState(null);
  const [seasonvalue, setSeasonvalue] = useState(null);
  const [formatvalue, setFormatvalue] = useState(null);
  const [genrevalue, setGenrevalue] = useState([]);
  const [query, setQuery] = useState('');
  const [sortbyvalue, setSortbyvalue] = useState(null);
  const [searchvalue, setSearchvalue] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Banner image for the catalog page
  const bannerImage = "https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-8jpFCOcDmneX.jpg";

  useEffect(() => {
    setSelectedYear(year || null);
    setSeasonvalue(season || null);
    setFormatvalue(format || null);
    setGenrevalue(genre || []);
    setSortbyvalue(sortby || null);
    setSearchvalue(search || "");
  }, [year, season, format, genre, search, sortby]);

  const handleSearch = () => {
    setIsLoading(true);
    // Simulate fast search with minimal delay
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  const resetValues = () => {
    setIsLoading(true);
    setSelectedYear(null);
    setSeasonvalue(null);
    setFormatvalue(null);
    setGenrevalue([]);
    setQuery('');
    setSortbyvalue(null);
    setSearchvalue("");
    setTimeout(() => {
      setIsLoading(false);
    }, 200);
  };

  const handleYearClick = (yearId) => {
    setSelectedYear(yearId);
  };

  const filteredGenre =
    query === ""
      ? genreOptions
      : genreOptions.filter((item) =>
        item.name
          .toLowerCase()
          .replace(/\s+/g, "")
          .includes(query.toLowerCase().replace(/\s+/g, ""))
      );

  const filteredTags =
    query === ""
      ? tagsOptions
      : tagsOptions.filter((item) =>
        item.name
          .toLowerCase()
          .replace(/\s+/g, "")
          .includes(query.toLowerCase().replace(/\s+/g, ""))
      );

  const isFormEmpty = !selectedYear && !seasonvalue && !formatvalue && genrevalue.length === 0 && !query && !sortbyvalue && !searchvalue;

  return (
    <div className="w-full bg-black">
      {/* Netflix-style Hero Banner Section */}
      <div className="relative w-full h-[60vh] overflow-hidden">
        {/* Background image with gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/70 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent z-10"></div>
        <img
          src={bannerImage}
          alt="Anime Catalog Banner"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />

        {/* Content positioned at bottom left */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-20 flex flex-col items-start">
          {/* Title and metadata */}
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Anime Catalog
            </h1>

            {/* Description */}
            <p className="text-[#ddd] text-base mb-6 max-w-2xl leading-relaxed">
              Discover your next favorite anime. Browse through our extensive collection and filter by genre, year, season, and more.
            </p>

            {/* Search bar - Netflix style */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
              <div className="relative w-full md:w-96">
                <Input
                  type="text"
                  aria-label="Search"
                  placeholder="Search Anime"
                  value={searchvalue}
                  onValueChange={setSearchvalue}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  isClearable
                  autoComplete="off"
                  classNames={{
                    base: "bg-[#333] border-none",
                    input: "text-white",
                  }}
                  startContent={
                    <FontAwesomeIcon icon={faSearch} className="text-[#999]" />
                  }
                  endContent={
                    isLoading && (
                      <div className="animate-spin">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0112 20c5.159 0 9.829-2.084 9.829-5.291V12c0-3.207-4.67-5.291-9.829-5.291z"/>
                        </svg>
                      </div>
                    )
                  }
                />
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-200 text-black rounded-md transition-colors border border-white"
              >
                <FontAwesomeIcon icon={faFilter} className="text-black" />
                Filters
                <FontAwesomeIcon icon={faChevronDown} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              {!isFormEmpty && (
                <button 
                  onClick={resetValues}
                  className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-200 text-black rounded-md transition-colors border border-white"
                >
                  <FontAwesomeIcon icon={faTrash} className="text-white" />
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AdSense Banner */}
      <GoogleAdSense 
        adSlot="1234567890"
        adFormat="banner"
        className="my-4"
      />

      {/* Filter Section - Netflix style */}
      {showFilters && (
        <div className="px-4 sm:px-8 md:px-12 py-8 bg-black border-b border-[#222]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Genres Filter */}
            <div>
              <h3 className="text-white text-sm font-medium mb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faFilter} className="text-[#999]" />
                Genres
              </h3>
              <Combobox value={genrevalue} onChange={setGenrevalue} multiple>
                <div className="relative w-full cursor-default overflow-hidden rounded-md text-left shadow-md focus:outline-none sm:text-sm">
                  <Combobox.Input
                    className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 bg-[#181818] border border-[#333] text-[#b2b2b2] focus:ring-0 outline-none rounded-md"
                    displayValue={(item) => item?.map((item) => item?.name).join(", ")}
                    placeholder="Select Genres"
                    onChange={(event) => setQuery(event.target.value)}
                    autoComplete="off"
                  />
                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon" className="h-5 w-5 text-gray-400"><path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd"></path></svg>
                  </Combobox.Button>
                </div>
                <Transition
                  enter="transition duration-100 ease-out"
                  enterFrom="transform scale-95 opacity-0"
                  enterTo="transform scale-100 opacity-100"
                  leave="transition duration-75 ease-out"
                  leaveFrom="transform scale-100 opacity-100"
                  leaveTo="transform scale-95 opacity-0"
                  afterLeave={() => setQuery("")}
                >
                  <Combobox.Options className="absolute z-50 mt-1 max-h-[220px] w-full overflow-auto rounded-md bg-[#0a0a0a] py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm border border-[#333]">
                    {filteredGenre.length === 0 && filteredTags.length === 0 && query !== '' ? (
                      <div className="relative cursor-default select-none px-4 py-2 text-white">
                        No Such Genre.
                      </div>
                    ) : (
                      <>
                        {filteredGenre.map((item) => (
                          <Combobox.Option
                            key={item.value}
                            className={({ active }) =>
                              `relative cursor-pointer select-none py-2 pl-4 pr-4 ${active ? 'bg-[#27272a] text-white' : 'text-[#b2b2b2]'}`
                            }
                            value={item}
                          >
                            {({ selected, active }) => (
                              <>
                                <span
                                  className={`block truncate ${selected ? 'font-medium text-white' : 'font-normal'}`}
                                >
                                  {item.name}
                                </span>
                                {selected ? (
                                  <span
                                    className={`absolute inset-y-0 right-4 flex items-center pl-3 ${active ? 'text-white' : ''}`}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon" className="h-5 w-5"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd"></path></svg>
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Combobox.Option>
                        ))}
                        {filteredTags.map((item) => (
                          <Combobox.Option
                            key={item.value}
                            className={({ active }) =>
                              `relative cursor-pointer select-none py-2 pl-4 pr-4 ${active ? 'bg-[#27272a] text-white' : 'text-[#b2b2b2]'}`
                            }
                            value={item}
                          >
                            {({ selected, active }) => (
                              <>
                                <span
                                  className={`block truncate ${selected ? 'font-medium text-white' : 'font-normal'}`}
                                >
                                  {item.name}
                                </span>
                                {selected ? (
                                  <span
                                    className={`absolute inset-y-0 right-4 flex items-center pl-3 ${active ? 'text-white' : ''}`}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon" className="h-5 w-5"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd"></path></svg>
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Combobox.Option>
                        ))}
                      </>
                    )}
                  </Combobox.Options>
                </Transition>
              </Combobox>
            </div>

            {/* Year Filter */}
            <div>
              <h3 className="text-white text-sm font-medium mb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-[#999]" />
                Year
              </h3>
              <Select
                aria-label='year'
                placeholder="Select Year"
                selectedKeys={selectedYear ? [selectedYear] : []}
                onChange={(e) => handleYearClick(e.target.value)}
                classNames={{
                  base: "max-w-full",
                  trigger: "bg-[#27272a] border-none text-[#b2b2b2] rounded-md",
                }}
              >
                {yearOptions.map((year) => (
                  <SelectItem key={year.value} value={year.value}>
                    {year.name}
                  </SelectItem>
                ))}
              </Select>
            </div>

            {/* Format Filter */}
            <div>
              <h3 className="text-white text-sm font-medium mb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faFilm} className="text-[#999]" />
                Format
              </h3>
              <Select
                aria-label='format'
                placeholder="Select Format"
                selectedKeys={formatvalue ? [formatvalue] : []}
                onSelectionChange={setFormatvalue}
                classNames={{
                  base: "max-w-full",
                  trigger: "bg-[#27272a] border-none text-[#b2b2b2] rounded-md",
                }}
              >
                {formatOptions.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.name}
                  </SelectItem>
                ))}
              </Select>
            </div>

            {/* Season Filter */}
            <div>
              <h3 className="text-white text-sm font-medium mb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faSnowflake} className="text-[#999]" />
                Season
              </h3>
              <Select
                aria-label='season'
                placeholder="Select Season"
                selectedKeys={seasonvalue ? [seasonvalue] : []}
                onSelectionChange={setSeasonvalue}
                classNames={{
                  base: "max-w-full",
                  trigger: "bg-[#27272a] border-none text-[#b2b2b2] rounded-md",
                }}
              >
                {seasonOptions.map((season) => (
                  <SelectItem key={season.value} value={season.value}>
                    {season.name}
                  </SelectItem>
                ))}
              </Select>
            </div>

            {/* Sort By Filter */}
            <div>
              <h3 className="text-white text-sm font-medium mb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faSortAmountDown} className="text-[#999]" />
                Sort By
              </h3>
              <Select
                aria-label="Sort by"
                placeholder="Sort by"
                selectedKeys={sortbyvalue ? [sortbyvalue] : []}
                onSelectionChange={setSortbyvalue}
                classNames={{
                  base: "max-w-full",
                  trigger: "bg-[#27272a] border-none text-[#b2b2b2] rounded-md",
                }}
              >
                {sortbyOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.name}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Results Section - Netflix style */}
      <div className="px-4 sm:px-8 md:px-12 py-8 bg-black relative">
        {isLoading && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* AdSense Sidebar */}
          <div className="hidden lg:block">
            <GoogleAdSense 
              adSlot="2345678901"
              adFormat="vertical"
              className="sticky top-4"
            />
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            <h2 className="text-xl sm:text-2xl font-medium text-white mb-6 sm:mb-8 border-l-4 border-white pl-4">
              {searchvalue ? `Search Results for "${searchvalue}"` : "Browse Anime"}
            </h2>
            <NetflixStyleSearchcard 
              searchvalue={searchvalue} 
              seasonvalue={seasonvalue}
              selectedYear={selectedYear} 
              formatvalue={formatvalue}
              sortbyvalue={sortbyvalue} 
              genrevalue={genrevalue} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default NetflixStyleCatalog;
