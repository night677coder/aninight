import React from 'react'
import NetflixStyleCatalog from '@/components/catalogcomponent/NetflixStyleCatalog'
import Navbarcomponent from '@/components/navbar/Navbar'

export async function generateMetadata({ searchParams }) {
  const search = searchParams?.q || '';
  
  let title = 'Search';
  let description = '';
  
  if (search) {
    title = `Search Results for "${search}" - AniNight`;
    description = `Find anime and manga matching "${search}".`;
  }
  
  return {
    title: title,
    description: description,
    keywords: [
      'search anime',
      'anime search',
      'find anime',
      'anime lookup',
      'manga search',
      'find manga',
      search && `${search} anime`,
      search && `${search} manga`,
    ].filter(Boolean).join(', '),
    openGraph: {
      title: title,
      description: description,
      type: 'website',
      url: 'https://night677coder.github.io/aninight/search',
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
    },
    alternates: {
      canonical: 'https://night677coder.github.io/aninight/search',
    },
  }
}

function page({searchParams}) {
  // Convert search query to catalog format
  const catalogSearchParams = searchParams?.q ? { search: searchParams.q } : {};
  
  return (
    <div onContextMenu="return false">
      <Navbarcomponent/>
      <div className='mt-[70px]'>
        {/* Search Results */}
        <NetflixStyleCatalog searchParams={catalogSearchParams}/>
      </div>
    </div>
  )
}

export default page
