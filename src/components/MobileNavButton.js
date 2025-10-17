"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@nextui-org/react';

function MobileNavButton() {
  return (
    <Dropdown>
      <DropdownTrigger>
        <button 
          className="z-10 aria-expanded:scale-[0.97] aria-expanded:opacity-70 subpixel-antialiased fixed bottom-5 left-4 w-[50px] h-[50px] text-white rounded-full flex items-center justify-center box-border outline-none bg-[#1a365d] shadow-[0_4px_20px_rgba(26,54,93,0.5)] hover:bg-[#14294d] transition-all duration-300 md:hidden"
          type="button"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="icon icon-tabler icon-tabler-category" 
            width="26" 
            height="26" 
            viewBox="0 0 24 24" 
            strokeWidth="1.5" 
            stroke="#ffffff" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <path d="M4 4h6v6h-6z"></path>
            <path d="M14 4h6v6h-6z"></path>
            <path d="M4 14h6v6h-6z"></path>
            <path d="M17 17m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path>
          </svg>
        </button>
      </DropdownTrigger>
      <DropdownMenu 
        aria-label="Navigation Options"
        className="bg-black/95 backdrop-blur-md border border-[#1a365d]/30 rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.8)] text-white p-1"
        itemClasses={{
          base: "rounded-md data-[hover=true]:bg-[#1a365d]/20 data-[hover=true]:text-white"
        }}
      >
        <DropdownItem key="browse" textValue="Browse">
          <Link href="/anime/catalog" className="text-white no-underline block py-2 font-medium flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 4H3C1.89543 4 1 4.89543 1 6V18C1 19.1046 1.89543 20 3 20H21C22.1046 20 23 19.1046 23 18V6C23 4.89543 22.1046 4 21 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 10H23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Browse
          </Link>
        </DropdownItem>
        <DropdownItem key="trending" textValue="Trending">
          <Link href="/anime/catalog?sortby=TRENDING_DESC" className="text-white no-underline block py-2 font-medium flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 7L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 7L9 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 17L15 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 17L11 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 4L9 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15 14L15 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Trending
          </Link>
        </DropdownItem>
        <DropdownItem key="movies" textValue="Movies">
          <Link href="/anime/catalog?format=MOVIE" className="text-white no-underline block py-2 font-medium flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 8V16M20 8V16M1 3L23 3V21L1 21L1 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 3L7 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 3L17 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Movies
          </Link>
        </DropdownItem>
        <DropdownItem key="tvshows" textValue="TV Shows">
          <Link href="/anime/catalog?format=TV" className="text-white no-underline block py-2 font-medium flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="5" width="20" height="15" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 2L16 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            TV Shows
          </Link>
        </DropdownItem>
        <DropdownItem key="news" textValue="News">
          <Link href="/news" className="text-white no-underline block py-2 font-medium flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 7H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 12H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 17H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            News
          </Link>
        </DropdownItem>
        <DropdownItem key="images" textValue="Images">
          <Link href="/images" className="text-white no-underline block py-2 font-medium flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 3H3C1.89543 3 1 3.89543 1 5V19C1 20.1046 1.89543 21 3 21H21C22.1046 21 23 20.1046 23 19V5C23 3.89543 22.1046 3 21 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 10C10.1046 10 11 9.10457 11 8C11 6.89543 10.1046 6 9 6C7.89543 6 7 6.89543 7 8C7 9.10457 7.89543 10 9 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M23 15L18 10L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 15L8 8L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Images
          </Link>
        </DropdownItem>
        <DropdownItem key="about" textValue="About">
          <Link href="/about" className="text-white no-underline block py-2 font-medium flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            About
          </Link>
        </DropdownItem>
        <DropdownItem key="settings" textValue="Settings">
          <Link href="/settings" className="text-white no-underline block py-2 font-medium flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19.4 15C19.1277 15.8031 19.2583 16.6718 19.7611 17.37C20.2639 17.9281 21.0781 18.2548 21.9 18.24C21.9 19.86 21.9 21.48 21.9 23.1C20.9 23.1 19.9 23.1 18.9 23.1C18.9 22.2 18.9 21.3 18.9 20.4C18.0781 20.4148 17.2639 20.0881 16.7611 19.53C16.2583 18.9718 16.1277 18.1031 16.4 17.3L19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19.4 9C19.1277 8.19691 19.2583 7.32818 19.7611 6.7C20.2639 6.07183 21.0781 5.74516 21.9 5.76C21.9 4.14 21.9 2.52 21.9 0.9C20.9 0.9 19.9 0.9 18.9 0.9C18.9 1.8 18.9 2.7 18.9 3.6C18.0781 3.58516 17.2639 3.91183 16.7611 4.53C16.2583 5.14818 16.1277 6.01691 16.4 6.82L19.4 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4.6 9C4.87229 8.19691 4.7417 7.32818 4.23891 6.7C3.73613 6.07183 2.92194 5.74516 2.1 5.76C2.1 4.14 2.1 2.52 2.1 0.9C3.1 0.9 4.1 0.9 5.1 0.9C5.1 1.8 5.1 2.7 5.1 3.6C5.92194 3.58516 6.73613 3.91183 7.23891 4.53C7.7417 5.14818 7.87229 6.01691 7.6 6.82L4.6 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4.6 15C4.87229 15.8031 4.7417 16.6718 4.23891 17.3C3.73613 17.9282 2.92194 18.2548 2.1 18.24C2.1 19.86 2.1 21.48 2.1 23.1C3.1 23.1 4.1 23.1 5.1 23.1C5.1 22.2 5.1 21.3 5.1 20.4C5.92194 20.4148 6.73613 20.0882 7.23891 19.53C7.7417 18.9718 7.87229 18.1031 7.6 17.3L4.6 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Settings
          </Link>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

export default MobileNavButton;
