"use server"
import { trending, animeinfo, advancedsearch, top100anime, seasonal } from "./anilistqueries";

export const TrendingAnilist = async () => {
    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                query: trending,
                variables: {
                    page: 1,
                    perPage: 15,
                },
            }),
        // }, { cache: "no-store" });
    }, { next: { revalidate: 3600 } });

        const data = await response.json();
        return data.data.Page.media;
    } catch (error) {
        console.error('Error fetching data from AniList:', error);
    }
}

export const Top100Anilist = async () => {
    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                query: top100anime,
                variables: {
                    page: 1,
                    perPage: 10,
                },
            }),
        }, { next: { revalidate: 3600 } });

        const data = await response.json();
        return data.data.Page.media;
    } catch (error) {
        console.error('Error fetching data from AniList:', error);
    }
}

export const SeasonalAnilist = async () => {
    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                query: seasonal,
                variables: {
                    page: 1,
                    perPage: 10,
                },
            }),
        }, { next: { revalidate: 3600 } });

        const data = await response.json();
        return data.data.Page.media;
    } catch (error) {
        console.error('Error fetching data from AniList:', error);
    }
}

export const AnimeInfoAnilist = async (animeid) => {
    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                query: animeinfo,
                variables: {
                    id: animeid,
                },
            }),
        // }, { cache: "no-store" });
    }, { next: { revalidate: 3600 } });

        const data = await response.json();
        return data.data.Media;
    } catch (error) {
        console.error('Error fetching data from AniList:', error);
    }
}

export const AdvancedSearch = async (searchvalue, selectedYear=null, seasonvalue=null, formatvalue=null, genrevalue=[], sortbyvalue=null, currentPage=1) => {
    const types = {};

    for (const item of genrevalue) {
        const { type, value } = item;

        if (types[type]) {
            types[type].push(value);
        } else {
            types[type] = [value];
        }
    }

    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                query: advancedsearch,
                variables: {
                    ...(searchvalue && {
                        search: searchvalue,
                        ...(!sortbyvalue && { sort: "SEARCH_MATCH" }),
                    }),
                    type: "ANIME",
                    ...(selectedYear && { seasonYear: selectedYear }),
                    ...(seasonvalue && { season: seasonvalue }),
                    ...(formatvalue && { format: formatvalue }),
                    ...(sortbyvalue && { sort: sortbyvalue }),
                    ...(types && { ...types }),
                    ...(currentPage && { page: currentPage }),
                },
            }),
        });

        const data = await response.json();
        return data.data.Page;
    } catch (error) {
        console.error('Error fetching search data from AniList:', error);
    }
};

// Function to fetch upcoming anime
export const UpcomingAnilist = async () => {
  try {
    const variables = {
      page: 1,
      perPage: 12,
      status: "NOT_YET_RELEASED",
      sort: ["POPULARITY_DESC", "TRENDING_DESC"]
    };

    const query = `
      query ($page: Int, $perPage: Int, $status: MediaStatus, $sort: [MediaSort]) {
        Page(page: $page, perPage: $perPage) {
          media(type: ANIME, status: $status, sort: $sort) {
            id
            title {
              romaji
              english
              native
            }
            coverImage {
              extraLarge
              large
              medium
            }
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
            status
            season
            format
            genres
            studios {
              nodes {
                id
                name
              }
            }
            nextAiringEpisode {
              airingAt
              timeUntilAiring
              episode
            }
            description
            bannerImage
            episodes
            averageScore
          }
        }
      }
    `;

    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        variables: variables
      })
    });

    const data = await response.json();
    return data?.data?.Page?.media;
  } catch (error) {
    console.error("Error fetching upcoming anime from Anilist:", error);
    return [];
  }
};

// Function to fetch currently airing anime
export const CurrentlyAiringAnilist = async () => {
  try {
    const variables = {
      page: 1,
      perPage: 12,
      status: "RELEASING",
      sort: ["POPULARITY_DESC", "TRENDING_DESC"]
    };

    const query = `
      query ($page: Int, $perPage: Int, $status: MediaStatus, $sort: [MediaSort]) {
        Page(page: $page, perPage: $perPage) {
          media(type: ANIME, status: $status, sort: $sort) {
            id
            title {
              romaji
              english
              native
            }
            coverImage {
              extraLarge
              large
              medium
            }
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
            status
            season
            format
            genres
            studios {
              nodes {
                id
                name
              }
            }
            nextAiringEpisode {
              airingAt
              timeUntilAiring
              episode
            }
            description
            bannerImage
            episodes
            averageScore
          }
        }
      }
    `;

    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        variables: variables
      })
    });

    const data = await response.json();
    return data?.data?.Page?.media;
  } catch (error) {
    console.error("Error fetching currently airing anime from Anilist:", error);
    return [];
  }
};

// Function to fetch popular manga
export const PopularMangaAnilist = async () => {
  try {
    const variables = {
      page: 1,
      perPage: 12,
      type: "MANGA",
      sort: ["POPULARITY_DESC", "SCORE_DESC"]
    };

    const query = `
      query ($page: Int, $perPage: Int, $type: MediaType, $sort: [MediaSort]) {
        Page(page: $page, perPage: $perPage) {
          media(type: $type, sort: $sort) {
            id
            title {
              romaji
              english
              native
            }
            coverImage {
              extraLarge
              large
              medium
            }
            startDate {
              year
              month
              day
            }
            status
            format
            genres
            description
            chapters
            volumes
            averageScore
          }
        }
      }
    `;

    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        variables: variables
      })
    });

    const data = await response.json();
    return data?.data?.Page?.media;
  } catch (error) {
    console.error("Error fetching popular manga from Anilist:", error);
    return [];
  }
};

// Function to fetch top rated anime
export const TopRatedAnilist = async () => {
  try {
    const variables = {
      page: 1,
      perPage: 12,
      type: "ANIME",
      sort: ["SCORE_DESC"]
    };

    const query = `
      query ($page: Int, $perPage: Int, $type: MediaType, $sort: [MediaSort]) {
        Page(page: $page, perPage: $perPage) {
          media(type: $type, sort: $sort) {
            id
            title {
              romaji
              english
              native
            }
            coverImage {
              extraLarge
              large
              medium
            }
            startDate {
              year
              month
              day
            }
            status
            season
            format
            genres
            studios {
              nodes {
                id
                name
              }
            }
            description
            bannerImage
            episodes
            averageScore
          }
        }
      }
    `;

    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        variables: variables
      })
    });

    const data = await response.json();
    return data?.data?.Page?.media;
  } catch (error) {
    console.error("Error fetching top rated anime from Anilist:", error);
    return [];
  }
};

// Function to fetch anime by genre
export const GenreSpecificAnilist = async (genre = "Action") => {
  try {
    const variables = {
      page: 1,
      perPage: 12,
      type: "ANIME",
      genre: genre,
      sort: ["POPULARITY_DESC", "SCORE_DESC"]
    };

    const query = `
      query ($page: Int, $perPage: Int, $type: MediaType, $genre: String, $sort: [MediaSort]) {
        Page(page: $page, perPage: $perPage) {
          media(type: $type, genre: $genre, sort: $sort) {
            id
            title {
              romaji
              english
              native
            }
            coverImage {
              extraLarge
              large
              medium
            }
            startDate {
              year
              month
              day
            }
            status
            season
            format
            genres
            studios {
              nodes {
                id
                name
              }
            }
            description
            bannerImage
            episodes
            averageScore
          }
        }
      }
    `;

    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        variables: variables
      })
    });

    const data = await response.json();
    return data?.data?.Page?.media;
  } catch (error) {
    console.error(`Error fetching ${genre} anime from Anilist:`, error);
    return [];
  }
};

// Function to fetch recently updated anime
export const RecentlyUpdatedAnilist = async () => {
  try {
    const variables = {
      page: 1,
      perPage: 12,
      type: "ANIME",
      sort: ["UPDATED_AT_DESC"]
    };

    const query = `
      query ($page: Int, $perPage: Int, $type: MediaType, $sort: [MediaSort]) {
        Page(page: $page, perPage: $perPage) {
          media(type: $type, sort: $sort) {
            id
            title {
              romaji
              english
              native
            }
            coverImage {
              extraLarge
              large
              medium
            }
            startDate {
              year
              month
              day
            }
            status
            season
            format
            genres
            studios {
              nodes {
                id
                name
              }
            }
            description
            bannerImage
            episodes
            averageScore
            updatedAt
          }
        }
      }
    `;

    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        variables: variables
      })
    });

    const data = await response.json();
    return data?.data?.Page?.media;
  } catch (error) {
    console.error("Error fetching recently updated anime from Anilist:", error);
    return [];
  }
};

// Function to fetch random recommendations
export const RandomRecommendationsAnilist = async () => {
  try {
    // Instead of using RANDOM sort which might not work properly,
    // we'll get a larger set of popular anime and then randomly select from it
    const variables = {
      page: 1,
      perPage: 50,
      type: "ANIME",
      sort: ["POPULARITY_DESC"]
    };

    const query = `
      query ($page: Int, $perPage: Int, $type: MediaType, $sort: [MediaSort]) {
        Page(page: $page, perPage: $perPage) {
          media(type: $type, sort: $sort) {
            id
            title {
              romaji
              english
              native
            }
            coverImage {
              extraLarge
              large
              medium
            }
            startDate {
              year
              month
              day
            }
            status
            season
            format
            genres
            studios {
              nodes {
                id
                name
              }
            }
            description
            bannerImage
            episodes
            averageScore
          }
        }
      }
    `;

    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        variables: variables
      })
    });

    const data = await response.json();
    const allAnime = data?.data?.Page?.media || [];
    
    if (allAnime.length === 0) return [];
    
    // Randomly select 12 unique anime
    const randomAnime = [];
    const used = new Set();
    const max = Math.min(12, allAnime.length);
    
    while (randomAnime.length < max) {
      const randomIndex = Math.floor(Math.random() * allAnime.length);
      const anime = allAnime[randomIndex];
      
      if (!used.has(anime.id)) {
        randomAnime.push(anime);
        used.add(anime.id);
      }
    }
    
    return randomAnime;
  } catch (error) {
    console.error("Error fetching random recommendations from Anilist:", error);
    return [];
  }
};
