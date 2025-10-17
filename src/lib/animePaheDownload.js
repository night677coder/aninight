// Utility functions for AnimePahe download integration

/**
 * Search for anime on AnimePahe using title
 * @param {string} title - Anime title to search
 * @returns {Promise<Object>} Search results
 */
export async function searchAnimePahe(title) {
  try {
    const response = await fetch(
      `/api/animepahe/search?q=${encodeURIComponent(title)}`
    );

    if (!response.ok) {
      throw new Error('Failed to search AnimePahe');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('AnimePahe search error:', error);
    return null;
  }
}

/**
 * Get episodes for an anime session
 * @param {string} session - AnimePahe session ID
 * @param {number} page - Page number
 * @returns {Promise<Object>} Episodes data
 */
export async function getAnimePaheEpisodes(session, page = 1) {
  try {
    const response = await fetch(
      `/api/animepahe/episodes?session=${session}&page=${page}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch episodes');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('AnimePahe episodes error:', error);
    return null;
  }
}

/**
 * Get download links for a specific episode
 * @param {string} animeSession - AnimePahe anime session ID
 * @param {string} episodeSession - AnimePahe episode session ID
 * @returns {Promise<Object>} Download links
 */
export async function getDownloadLinks(animeSession, episodeSession) {
  try {
    const response = await fetch(
      `/api/animepahe/download?animeSession=${encodeURIComponent(animeSession)}&episodeSession=${encodeURIComponent(episodeSession)}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Download API error:', errorData);
      throw new Error(errorData.error || 'Failed to fetch download links');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('AnimePahe download error:', error);
    return null;
  }
}

/**
 * Find matching AnimePahe anime and episode
 * @param {Object} animeData - AniList anime data
 * @param {number} episodeNumber - Episode number
 * @returns {Promise<Object>} Download links or null
 */
export async function findDownloadLinks(animeData, episodeNumber) {
  try {
    // Try different title variations
    const titles = [
      animeData?.title?.english,
      animeData?.title?.romaji,
      animeData?.title?.native,
    ].filter(Boolean);

    let bestMatch = null;

    // Search with each title variation
    for (const title of titles) {
      const searchResults = await searchAnimePahe(title);

      if (searchResults?.data && searchResults.data.length > 0) {
        // Find best match based on title similarity
        const match = searchResults.data.find(anime => {
          const animeTitles = [
            anime.title?.toLowerCase(),
            anime.title_english?.toLowerCase(),
            anime.title_romaji?.toLowerCase(),
          ].filter(Boolean);

          return animeTitles.some(t =>
            titles.some(at => at?.toLowerCase().includes(t) || t.includes(at?.toLowerCase()))
          );
        });

        if (match) {
          bestMatch = match;
          break;
        }

        // If no exact match, use first result
        if (!bestMatch && searchResults.data[0]) {
          bestMatch = searchResults.data[0];
        }
      }
    }

    if (!bestMatch?.session) {
      console.log('No AnimePahe match found');
      return null;
    }

    // Get episodes for the matched anime
    const episodesData = await getAnimePaheEpisodes(bestMatch.session);

    if (!episodesData?.data) {
      console.log('No episodes found');
      return null;
    }

    console.log('Episodes data sample:', episodesData.data[0]);

    // Find the specific episode
    const episode = episodesData.data.find(ep =>
      parseInt(ep.episode) === parseInt(episodeNumber)
    );

    if (!episode) {
      console.log(`Episode ${episodeNumber} not found`);
      return null;
    }

    // The episode object should have a session field
    const episodeSession = episode.session;

    if (!episodeSession) {
      console.error('Episode session not found:', episode);
      return null;
    }

    // Get download links for the episode using both anime and episode sessions
    const downloadData = await getDownloadLinks(bestMatch.session, episodeSession);

    if (!downloadData || !downloadData.downloads) {
      console.error('Failed to get download data');
      return null;
    }

    return {
      episode: episode,
      downloads: downloadData.downloads,
      animeSession: bestMatch.session,
    };
  } catch (error) {
    console.error('Error finding download links:', error);
    return null;
  }
}
