export const newsQuery = `
query ($page: Int, $perPage: Int, $type: MediaType, $sort: [MediaSort]) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      perPage
      currentPage
      lastPage
      hasNextPage
    }
    news: media(type: $type, sort: $sort) {
      id
      title {
        romaji
        english
        userPreferred
      }
      coverImage {
        large
        extraLarge
        color
      }
      description
      bannerImage
      status
      genres
      format
      averageScore
      popularity
      seasonYear
      season
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
      trailer {
        id
        site
        thumbnail
      }
      siteUrl
      updatedAt
    }
  }
}`;

export const newsArticleQuery = `
query ($id: Int) {
  Media(id: $id) {
    id
    title {
      romaji
      english
      userPreferred
    }
    coverImage {
      large
      extraLarge
      color
    }
    description
    bannerImage
    status
    genres
    format
    averageScore
    popularity
    seasonYear
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
    trailer {
      id
      site
      thumbnail
    }
    siteUrl
    updatedAt
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
        voiceActorRoles {
          voiceActor {
            id
            name {
              first
              middle
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
          }
          episodes
          status
          format
          nextAiringEpisode {
            airingAt
            timeUntilAiring
            episode
          }
        }
      }
    }
  }
}`;
