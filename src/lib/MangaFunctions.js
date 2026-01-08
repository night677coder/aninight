"use server"

import { TRENDING_DESC, SCORE_DESC, POPULARITY_DESC, UPDATED_AT_DESC, ANIME, MANGA, SEARCH_MATCH } from './anilistqueries';

const MANGAPILL_BASE_URL = "https://consumet-six-alpha.vercel.app/manga/mangapill";
const MANGAHERE_BASE_URL = "https://consumet-six-alpha.vercel.app/manga/mangahere";

// Helper function to search MangaPill and find best match
async function findMangaPillId(anilistTitle) {
  try {
    const searchQuery = anilistTitle.english || anilistTitle.romaji || anilistTitle.native;
    const response = await fetch(`${MANGAPILL_BASE_URL}/${encodeURIComponent(searchQuery)}`);
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      // Return the first result's ID (best match)
      return data.results[0].id;
    }
    return null;
  } catch (error) {
    console.error('Error searching MangaPill:', error);
    return null;
  }
}

// Helper function to search MangaHere and find best match
async function findMangaHereId(anilistTitle) {
  try {
    const searchQuery = anilistTitle.english || anilistTitle.romaji || anilistTitle.native;
    // MangaHere uses lowercase with underscores, so we need to format the title
    const formattedQuery = searchQuery.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    
    // Try to get manga info directly with formatted title
    const response = await fetch(`${MANGAHERE_BASE_URL}/info?id=${encodeURIComponent(formattedQuery)}`);
    const data = await response.json();
    
    if (data && data.id && data.chapters && data.chapters.length > 0) {
      return data.id;
    }
    return null;
  } catch (error) {
    console.error('Error searching MangaHere:', error);
    return null;
  }
}

// Get manga info from AniList
export async function getMangaInfoAnilist(mangaId) {
  try {
    const query = `
      query ($id: Int) {
        Media (id: $id, type: MANGA) {
          id
          idMal
          title {
            romaji
            english
            native
            userPreferred
          }
          coverImage {
            large
            extraLarge
            color
          }
          description
          bannerImage
          chapters
          volumes
          status
          genres
          source
          type
          startDate {
            year
            month
            day
          }
          endDate {
            year
            month
            day
          }
          averageScore
          popularity
          countryOfOrigin
          format
          staff {
            edges {
              role
              node {
                id
                name {
                  full
                }
              }
            }
          }
          relations {
            edges {
              relationType(version: 2)
              node {
                id
                title {
                  romaji
                  native
                  english
                }
                format
                type
                coverImage {
                  large
                  extraLarge
                }
                chapters
                volumes
                status
              }
            }
          }
          recommendations {
            nodes {
              mediaRecommendation {
                id
                title {
                  romaji
                  english
                }
                coverImage {
                  extraLarge
                  large
                }
                chapters
                volumes
                status
                format
                type
              }
            }
          }
          characters {
            edges { 
              id
              role
              node {
                name {
                  first
                  last
                  full
                  native
                  userPreferred
                }
                image {
                  large
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query: query,
        variables: { id: mangaId },
      }),
    }, { next: { revalidate: 3600 } });

    const data = await response.json();
    return data.data.Media;
  } catch (error) {
    console.error('Error fetching manga info from AniList:', error);
    return null;
  }
}

// Get manga chapters from specific provider or with fallback
export async function getMangaChapters(anilistMangaInfo, preferredProvider = null) {
  try {
    // If a specific provider is requested, try that first
    if (preferredProvider === 'mangahere') {
      const mangaHereId = await findMangaHereId(anilistMangaInfo.title);
      if (mangaHereId) {
        const response = await fetch(`${MANGAHERE_BASE_URL}/info?id=${encodeURIComponent(mangaHereId)}`);
        const data = await response.json();
        
        if (data && data.chapters && data.chapters.length > 0) {
          return {
            chapters: data.chapters || [],
            provider: 'mangahere',
            providerId: mangaHereId,
            title: data.title,
            image: data.image
          };
        }
      }
      // If MangaHere was requested but failed, fall back to MangaPill
      console.log('MangaHere not available, trying MangaPill for:', anilistMangaInfo.title);
    }

    // Try MangaPill (default provider)
    const mangaPillId = await findMangaPillId(anilistMangaInfo.title);
    
    if (mangaPillId) {
      const response = await fetch(`${MANGAPILL_BASE_URL}/info?id=${encodeURIComponent(mangaPillId)}`);
      const data = await response.json();
      
      if (data && data.chapters && data.chapters.length > 0) {
        return {
          chapters: data.chapters || [],
          provider: 'mangapill',
          providerId: mangaPillId,
          title: data.title,
          image: data.image
        };
      }
    }

    // Fallback to MangaHere if MangaPill doesn't have the manga
    if (preferredProvider !== 'mangahere') {
      console.log('MangaPill not available, trying MangaHere for:', anilistMangaInfo.title);
      const mangaHereId = await findMangaHereId(anilistMangaInfo.title);
      
      if (mangaHereId) {
        const response = await fetch(`${MANGAHERE_BASE_URL}/info?id=${encodeURIComponent(mangaHereId)}`);
        const data = await response.json();
        
        if (data && data.chapters && data.chapters.length > 0) {
          return {
            chapters: data.chapters || [],
            provider: 'mangahere',
            providerId: mangaHereId,
            title: data.title,
            image: data.image
          };
        }
      }
    }

    console.error('Could not find manga in any provider for:', anilistMangaInfo.title);
    return { chapters: [], provider: null, providerId: null };
  } catch (error) {
    console.error('Error fetching manga chapters:', error);
    return { chapters: [], provider: null, providerId: null };
  }
}

// Get available providers for a manga
export async function getAvailableProviders(anilistMangaInfo) {
  const providers = [];
  
  try {
    // Check MangaPill
    const mangaPillId = await findMangaPillId(anilistMangaInfo.title);
    if (mangaPillId) {
      const response = await fetch(`${MANGAPILL_BASE_URL}/info?id=${encodeURIComponent(mangaPillId)}`);
      const data = await response.json();
      if (data && data.chapters && data.chapters.length > 0) {
        providers.push({
          name: 'mangapill',
          label: 'MangaPill',
          chapterCount: data.chapters.length
        });
      }
    }

    // Check MangaHere
    const mangaHereId = await findMangaHereId(anilistMangaInfo.title);
    if (mangaHereId) {
      const response = await fetch(`${MANGAHERE_BASE_URL}/info?id=${encodeURIComponent(mangaHereId)}`);
      const data = await response.json();
      if (data && data.chapters && data.chapters.length > 0) {
        providers.push({
          name: 'mangahere',
          label: 'MangaHere',
          chapterCount: data.chapters.length
        });
      }
    }
  } catch (error) {
    console.error('Error checking available providers:', error);
  }

  return providers;
}

// Get chapter pages for reading
export async function getChapterPages(chapterId, provider = 'mangapill') {
  try {
    const baseUrl = provider === 'mangahere' ? MANGAHERE_BASE_URL : MANGAPILL_BASE_URL;
    const response = await fetch(`${baseUrl}/read?chapterId=${encodeURIComponent(chapterId)}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching chapter pages:', error);
    return [];
  }
}

// Search manga on AniList
export async function searchMangaAnilist(searchQuery, page = 1) {
  try {
    const query = `
      query ($page: Int, $search: String, $type: MediaType) {
        Page(page: $page, perPage: 20) {
          pageInfo {
            total
            perPage
            currentPage
            lastPage
            hasNextPage
          }
          media(search: $search, type: $type, sort: SEARCH_MATCH) {
            id
            title {
              romaji
              english
              native
              userPreferred
            }
            coverImage {
              large
              extraLarge
              color
            }
            description
            chapters
            volumes
            status
            genres
            averageScore
            popularity
            format
            startDate {
              year
              month
              day
            }
          }
        }
      }
    `;

    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query: query,
        variables: {
          search: searchQuery,
          type: "MANGA",
          page: page
        },
      }),
    });

    const data = await response.json();
    return data.data.Page;
  } catch (error) {
    console.error('Error searching manga:', error);
    return null;
  }
}

// Get trending manga
export async function getTrendingManga() {
  try {
    const query = `
      query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          media(type: MANGA, sort: TRENDING_DESC) {
            id
            title {
              romaji
              english
              native
              userPreferred
            }
            coverImage {
              large
              extraLarge
              color
            }
            description
            chapters
            volumes
            status
            genres
            averageScore
            popularity
            format
          }
        }
      }
    `;

    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query: query,
        variables: {
          page: 1,
          perPage: 15
        },
      }),
    }, { next: { revalidate: 3600 } });

    const data = await response.json();
    return data.data.Page.media;
  } catch (error) {
    console.error('Error fetching trending manga:', error);
    return [];
  }
}

// Get popular manga
export async function getPopularManga() {
  try {
    const query = `
      query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          media(type: MANGA, sort: POPULARITY_DESC) {
            id
            title {
              romaji
              english
              native
              userPreferred
            }
            coverImage {
              large
              extraLarge
              color
            }
            description
            chapters
            volumes
            status
            genres
            averageScore
            popularity
            format
          }
        }
      }
    `;

    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query: query,
        variables: {
          page: 1,
          perPage: 20
        },
      }),
    }, { next: { revalidate: 3600 } });

    const data = await response.json();
    return data.data.Page.media;
  } catch (error) {
    console.error('Error fetching popular manga:', error);
    return [];
  }
}

// Advanced manga search with filters
export async function advancedMangaSearch(searchValue, selectedYear = null, formatValue = null, genreValue = [], sortByValue = null, currentPage = 1) {
  const types = {};

  for (const item of genreValue) {
    const { type, value } = item;
    if (types[type]) {
      types[type].push(value);
    } else {
      types[type] = [value];
    }
  }

  try {
    const query = `
      query ($page: Int = 1, $type: MediaType, $search: String, $format: [MediaFormat], $seasonYear: Int, $genres: [String], $tags: [String], $sort: [MediaSort]) {
        Page(page: $page, perPage: 20) {
          pageInfo {
            total
            perPage
            currentPage
            lastPage
            hasNextPage
          }
          media(type: $type, search: $search, format_in: $format, startDate_like: $seasonYear, genre_in: $genres, tag_in: $tags, sort: $sort) {
            id
            title {
              english
              romaji
              userPreferred
            }
            coverImage {
              extraLarge
              large
              color
            }
            startDate {
              year
              month
              day
            }
            description
            type
            format
            status
            chapters
            volumes
            genres
            averageScore
            popularity
          }
        }
      }
    `;

    const variables = {
      type: "MANGA",
      ...(searchValue && {
        search: searchValue,
        ...(!sortByValue && { sort: "SEARCH_MATCH" }),
      }),
      ...(selectedYear && { seasonYear: selectedYear }),
      ...(formatValue && { format: formatValue }),
      ...(sortByValue && { sort: sortByValue }),
      ...(types && { ...types }),
      page: currentPage || 1,
    };

    console.log('Advanced manga search variables:', variables);

    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query: query,
        variables: variables,
      }),
    });

    const data = await response.json();
    
    console.log('Advanced manga search response:', {
      hasErrors: !!data.errors,
      mediaCount: data.data?.Page?.media?.length || 0,
      errors: data.errors
    });
    
    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      return {
        media: [],
        pageInfo: {
          currentPage: 1,
          hasNextPage: false,
          lastPage: 1,
          total: 0
        }
      };
    }
    
    return data.data.Page;
  } catch (error) {
    console.error('Error fetching advanced manga search:', error);
    return {
      media: [],
      pageInfo: {
        currentPage: 1,
        hasNextPage: false,
        lastPage: 1,
        total: 0
      }
    };
  }
}
