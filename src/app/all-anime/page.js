import React from 'react'
import AllAnimeComponent from '@/components/allanime/AllAnimeComponent'
import Navbarcomponent from '@/components/navbar/Navbar'

export async function generateMetadata() {
  return {
    title: 'All Anime - Complete Anime Collection',
    description: 'Browse our complete collection of anime series. Watch thousands of anime episodes online with English subtitles and dubs.',
    keywords: [
      'all anime',
      'complete anime collection',
      'anime list',
      'browse all anime',
      'watch anime online',
      'anime streaming',
      'anime database'
    ],
    openGraph: {
      title: 'All Anime - Complete Anime Collection',
      description: 'Browse our complete collection of anime series. Watch thousands of anime episodes online with English subtitles and dubs.',
      type: 'website',
      url: 'https://voidanime.live/all-anime',
    },
    twitter: {
      card: "summary_large_image",
      title: 'All Anime - Complete Anime Collection',
      description: 'Browse our complete collection of anime series. Watch thousands of anime episodes online with English subtitles and dubs.',
    },
    alternates: {
      canonical: 'https://voidanime.live/all-anime',
    },
  }
}

function page() {
  return (
    <div>
      <Navbarcomponent />
      <div>
        <AllAnimeComponent />
      </div>
    </div>
  )
}

export default page
