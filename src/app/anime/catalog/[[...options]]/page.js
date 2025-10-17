import React from 'react'
import NetflixStyleCatalog from '@/components/catalogcomponent/NetflixStyleCatalog'
import Navbarcomponent from '@/components/navbar/Navbar'

export async function generateMetadata({ searchParams }) {
  const search = searchParams?.search || '';
  const genre = searchParams?.genre || '';
  
  let title = 'Anime Catalog - Browse All Anime';
  let description = 'Browse and discover thousands of anime series. Filter by genre, year, season, and more. Watch anime online with English subtitles and dubs.';
  
  if (search) {
    title = `Search Results for "${search}" - Anime Catalog`;
    description = `Find anime matching "${search}". Watch anime online with English subtitles and dubs.`;
  } else if (genre) {
    title = `${genre} Anime - Browse ${genre} Genre`;
    description = `Discover the best ${genre} anime series. Watch ${genre} anime online with English subtitles and dubs.`;
  }
  
  return {
    title: title,
    description: description,
    keywords: [
      'anime catalog',
      'browse anime',
      'anime list',
      'anime genres',
      'watch anime',
      'anime search',
      'anime filter',
      search && `${search} anime`,
      genre && `${genre} anime`,
    ].filter(Boolean).join(', '),
    openGraph: {
      title: title,
      description: description,
      type: 'website',
      url: 'https://voidanime.live/anime/catalog',
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
    },
    alternates: {
      canonical: 'https://voidanime.live/anime/catalog',
    },
  }
}

function page({searchParams}) {
  return (
    <div>
      <Navbarcomponent/>
      <div className='mt-[70px]'>
        <NetflixStyleCatalog searchParams={searchParams}/>
      </div>
    </div>
  )
}

export default page
