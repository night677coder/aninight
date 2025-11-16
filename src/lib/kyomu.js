// Kyomu API Integration
const KYOMU_API = `${process.env.ANIMEPAHE_BASE_URL || 'https://animepahe-api-iota.vercel.app'}/api`;

/**
 * Search anime on Kyomu using AniList title
 */
export const searchKyomuAnime = async (title) => {
  try {
    const response = await fetch(`${KYOMU_API}/search?q=${encodeURIComponent(title)}`);

    if (!response.ok) {
      console.error(`Kyomu search failed: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (!data?.data || data.data.length === 0) {
      console.log('No results found on Kyomu');
      return null;
    }

    // Return the first match (best match)
    return data.data[0];
  } catch (error) {
    console.error('Kyomu search error:', error.message);
    return null;
  }
};

/**
 * Get anime details and episodes from Kyomu
 */
export const getKyomuEpisodes = async (animeSession) => {
  try {
    console.log(`Fetching Kyomu episodes from: ${KYOMU_API}/${animeSession}/releases?sort=episode_desc&page=1`);
    const response = await fetch(`${KYOMU_API}/${animeSession}/releases?sort=episode_desc&page=1`);

    if (!response.ok) {
      console.error(`Kyomu episodes fetch failed: ${response.status}`);
      return [];
    }

    const data = await response.json();

    if (!data?.data || data.data.length === 0) {
      console.log('No episodes found in Kyomu response');
      return [];
    }

    // Map episodes to our format
    // Store both anime session and episode session for streaming
    const episodes = data.data.map(ep => ({
      id: `${animeSession}:${ep.session}`, // Combined ID for uniqueness
      episodeId: `${animeSession}:${ep.session}`, // Combined for streaming
      number: ep.episode,
      title: `Episode ${ep.episode}`,
      animeSession: animeSession, // Anime session ID
      episodeSession: ep.session, // Episode session ID
    }));

    console.log(`Mapped ${episodes.length} episodes from Kyomu`);
    return episodes;
  } catch (error) {
    console.error('Kyomu episodes fetch error:', error.message);
    return [];
  }
};

/**
 * Get streaming sources for a specific episode
 * @param {string} episodeId - Format: "animeSession:episodeSession" or just "episodeSession" (legacy)
 * @param {string} anilistId - AniList ID (optional, used for legacy format)
 */
export const getKyomuSources = async (episodeId, anilistId = null) => {
  try {
    let animeSession, episodeSession;

    // Check if it's the new combined format
    if (episodeId.includes(':')) {
      [animeSession, episodeSession] = episodeId.split(':');
    } else {
      // Legacy format - just episode session
      // Need to fetch anime session from AniList
      console.log('Legacy episode ID format detected, fetching anime session...');

      if (!anilistId) {
        console.error('AniList ID required for legacy episode format');
        return null;
      }

      // Fetch AniList data to get anime session
      const anilistResponse = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query ($id: Int) {
              Media(id: $id, type: ANIME) {
                title {
                  romaji
                  english
                }
              }
            }
          `,
          variables: { id: parseInt(anilistId) }
        })
      });

      const anilistData = await anilistResponse.json();
      const title = anilistData?.data?.Media?.title?.english || anilistData?.data?.Media?.title?.romaji;

      if (!title) {
        console.error('Could not get anime title from AniList');
        return null;
      }

      // Search Kyomu to get anime session
      const searchResult = await searchKyomuAnime(title);
      if (!searchResult) {
        console.error('Could not find anime on Kyomu');
        return null;
      }

      animeSession = searchResult.session;
      episodeSession = episodeId;
      console.log(`Resolved anime session: ${animeSession}`);
    }

    if (!animeSession || !episodeSession) {
      console.error('Could not resolve anime and episode sessions');
      return null;
    }

    // The API requires both id (anime session) and episodeId (episode session) as query params
    const url = `${KYOMU_API}/play/${animeSession}?episodeId=${episodeSession}`;
    console.log(`Fetching Kyomu sources from: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Kyomu sources fetch failed: ${response.status}`);
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      return null;
    }

    const data = await response.json();

    if (!data?.sources || !Array.isArray(data.sources)) {
      console.error('No sources in Kyomu response');
      return null;
    }

    // Use hlsplayer.org directly
    const proxyUrl = 'https://www.hlsplayer.org/play?url=';
    
    console.log(`Using hlsplayer.org proxy`);

    // Map Kyomu sources to our format
    const sources = data.sources.map(source => {
      const isM3U8 = source.isM3U8 || source.url.includes('.m3u8');
      
      // Return direct URL and mark as Kyomu source
      return {
        url: source.url, // Direct vault URL
        quality: source.resolution || 'auto',
        isM3U8: isM3U8,
        type: isM3U8 ? 'hls' : 'mp4',
        isDub: source.isDub || false,
        fanSub: source.fanSub || null,
        server: 'kyomu', // Mark as Kyomu source for special handling
      };
    });

    // Add a default/auto quality source (prefer 1080p, then 720p, then first available)
    const autoSource = sources.find(s => s.quality === '1080' && !s.isDub) ||
      sources.find(s => s.quality === '720' && !s.isDub) ||
      sources.find(s => !s.isDub) ||
      sources[0];

    if (autoSource) {
      sources.unshift({
        ...autoSource,
        quality: 'auto'
      });
    }

    console.log(`Mapped ${sources.length} sources from Kyomu`);

    return {
      sources: sources,
      downloads: data.downloads || [],
      subtitles: [],
      tracks: []
    };
  } catch (error) {
    console.error('Kyomu sources fetch error:', error.message);
    return null;
  }
};

/**
 * Map AniList ID to Kyomu session
 * This function searches Kyomu and stores the mapping
 */
export const mapAniListToKyomu = async (anilistData) => {
  try {
    // Get title - prefer English, fallback to Romaji
    const title = anilistData?.title?.english || anilistData?.title?.romaji || '';

    if (!title) {
      console.error('No title found in AniList data');
      return null;
    }

    console.log(`🔍 Searching Kyomu for: "${title}"`);

    // Search on Kyomu
    const searchResult = await searchKyomuAnime(title);

    if (!searchResult) {
      console.log('✗ No Kyomu match found');
      return null;
    }

    console.log(`✓ Found on Kyomu: ${searchResult.title} (${searchResult.session})`);

    return searchResult.session;
  } catch (error) {
    console.error('Kyomu mapping error:', error.message);
    return null;
  }
};
