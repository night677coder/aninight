"use server"
import { newsQuery, newsArticleQuery } from "./anilistNewsQuery";
import { redis } from "./rediscache";

// Define category types and sort options
const CATEGORIES = {
    LATEST: {
        type: 'ANIME',
        sort: ['TRENDING_DESC', 'POPULARITY_DESC'],
        cacheKey: 'latest'
    },
    ANIME: {
        type: 'ANIME',
        sort: ['UPDATED_AT_DESC'],
        cacheKey: 'anime'
    },
    MANGA: {
        type: 'MANGA',
        sort: ['TRENDING_DESC', 'UPDATED_AT_DESC'],
        cacheKey: 'manga'
    },
    INDUSTRY: {
        type: 'ANIME',
        sort: ['START_DATE_DESC', 'POPULARITY_DESC'],
        cacheKey: 'industry'
    }
};

// Function to check if news needs to be refreshed (daily)
const shouldRefreshNews = async (category) => {
    if (!redis) return true;
    
    const lastFetchKey = `news:last_fetch:${category}`;
    const lastFetch = await redis.get(lastFetchKey);
    
    if (!lastFetch) return true;
    
    const lastFetchDate = new Date(parseInt(lastFetch));
    const currentDate = new Date();
    
    // Check if it's a new day (compare date parts only)
    return lastFetchDate.toDateString() !== currentDate.toDateString();
};

// Function to update last fetch timestamp
const updateLastFetchTime = async (category) => {
    if (!redis) return;
    
    const lastFetchKey = `news:last_fetch:${category}`;
    await redis.set(lastFetchKey, Date.now().toString());
};

// Function to fetch a small set of latest news for the home page
export const fetchHomePageNews = async (limit = 6) => {
    try {
        const cacheKey = 'news:homepage';
        
        // Try to get from cache
        let cachedData;
        if (redis) {
            cachedData = await redis.get(cacheKey);
            if (cachedData) {
                return JSON.parse(cachedData);
            }
        }

        // Fetch fresh data using the LATEST category settings
        const { type, sort } = CATEGORIES.LATEST;
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                query: newsQuery,
                variables: {
                    page: 1,
                    perPage: limit,
                    type,
                    sort
                },
            }),
        });

        const data = await response.json();
        
        if (redis && data.data) {
            // Cache for 6 hours
            await redis.set(cacheKey, JSON.stringify(data.data.Page), "EX", 60 * 60 * 6);
        }
        
        return data.data.Page;
    } catch (error) {
        console.error('Error fetching homepage news:', error);
        return null;
    }
};

export const fetchNewsAnilist = async (page = 1, perPage = 10, category = 'LATEST') => {
    try {
        // Ensure category is valid
        if (!CATEGORIES[category]) {
            category = 'LATEST';
        }
        
        const { type, sort, cacheKey } = CATEGORIES[category];
        const cacheKeyFull = `news:${cacheKey}:page:${page}`;
        
        // Check if we need to refresh the data (daily)
        const needsRefresh = await shouldRefreshNews(cacheKey);
        
        // Try to get from cache if not needing refresh
        let cachedData;
        if (!needsRefresh && redis) {
            cachedData = await redis.get(cacheKeyFull);
            if (cachedData) {
                return JSON.parse(cachedData);
            }
        }

        // Fetch fresh data
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                query: newsQuery,
                variables: {
                    page,
                    perPage,
                    type,
                    sort
                },
            }),
        });

        const data = await response.json();
        
        if (redis && data.data) {
            // Cache for 24 hours
            await redis.set(cacheKeyFull, JSON.stringify(data.data.Page), "EX", 60 * 60 * 24);
            // Update last fetch time
            await updateLastFetchTime(cacheKey);
        }
        
        return data.data.Page;
    } catch (error) {
        console.error('Error fetching news from AniList:', error);
        return null;
    }
};

export const fetchNewsArticle = async (id) => {
    try {
        let cachedData;
        if (redis) {
            cachedData = await redis.get(`news:article:${id}`);
            if (cachedData) {
                return JSON.parse(cachedData);
            }
        }

        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                query: newsArticleQuery,
                variables: {
                    id,
                },
            }),
        }, { next: { revalidate: 3600 } });

        const data = await response.json();
        
        if (redis && data.data) {
            await redis.set(`news:article:${id}`, JSON.stringify(data.data.Media), "EX", 60 * 60 * 24); // Cache for 24 hours
        }
        
        return data.data.Media;
    } catch (error) {
        console.error('Error fetching news article from AniList:', error);
        return null;
    }
};
