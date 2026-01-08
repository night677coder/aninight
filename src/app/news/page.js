import React from 'react';
import { fetchNewsAnilist } from '@/lib/AnilistNewsFunctions';

import { getAuthSession } from '@/app/api/auth/[...nextauth]/route';
import NetflixStyleNewsPage from './NetflixStyleNewsPage';
import axios from 'axios';
import { headers } from 'next/headers'

export async function generateMetadata() {
  let title = 'Anime News - AniNight';
  let description = 'Get the latest anime news about your favorite series';
  
  return {
    title: 'Anime News - AniNight',
    description: description,
    openGraph: {
      title: 'Anime News - AniNight',
      description: description,
    },
  }
}

export default async function NewsPage() {
  //get header info for determining caching behavior
  const headersList = headers();
  const UA = headersList.get("user-agent");
  const botUA = ['Googlebot', 'Bingbot', 'Slurp', 'DuckDuckBot', 'Baiduspider', 'YandexBot', 'Sogou', 'Exabot'];
  const isBot = botUA.some((bot) => UA.includes(bot));
  //adjust cache behavior based on user agent
  const dynamicCache = isBot ? { revalidate: 86400 } : { revalidate: 600 }; //24 hours or 10 minutes

  let newsData = {};
  try {
    const response = await axios.get('https://anify-api.fly.dev/news', {
      next: dynamicCache
    });
    if (response?.data) {
      newsData = response.data;
    }
  } catch (error) {
    console.error("Error fetching news data:", error);
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <NetflixStyleNewsPage initialData={newsData} />
      </div>
    </div>
  );
}
