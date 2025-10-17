const ANIMEPAHE_BASE_URL = 'https://animepahe-api-iota.vercel.app';

/**
 * Get AniList data for matching
 */
export async function getAnilistDataForAnimePahe(anilistId) {
  try {
    const query = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          idMal
          title {
            romaji
            english
            native
          }
          synonyms
          format
          episodes
          season
          seasonYear
        }
      }
    `;

    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { id: parseInt(anilistId) }
      })
    });

    const data = await response.json();
    return data?.data?.Media || null;
  } catch (error) {
    console.error('[AnimePahe] Error fetching AniList data:', error);
    return null;
  }
}

/**
 * Search AnimePahe for anime
 */
export async function searchAnimePahe(searchQuery) {
  try {
    const response = await fetch(
      `${ANIMEPAHE_BASE_URL}/api/search?q=${encodeURIComponent(searchQuery)}`
    );
    
    if (!response.ok) {
      throw new Error(`AnimePahe search failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data?.data || [];
  } catch (error) {
    console.error('[AnimePahe] Search error:', error);
    return [];
  }
}

/**
 * Get AnimePahe session ID by matching with AniList data
 * Returns both session and total episode count from search results
 */
export async function getAnimePaheSession(anilistData) {
  try {
    const searchTerms = [
      anilistData.title.english,
      anilistData.title.romaji,
      ...(anilistData.synonyms || [])
    ].filter(Boolean);

    console.log(`[AnimePahe] Searching with terms:`, searchTerms.slice(0, 3));

    for (const term of searchTerms) {
      const results = await searchAnimePahe(term);
      
      if (results.length > 0) {
        // Try to find best match
        const exactMatch = results.find(r => 
          r.title?.toLowerCase() === term.toLowerCase()
        );
        
        if (exactMatch) {
          console.log(`[AnimePahe] ✓ Exact match found: ${exactMatch.title}`);
          console.log(`[AnimePahe] Total episodes from search: ${exactMatch.episodes || 'unknown'}`);
          return { session: exactMatch.session, totalEpisodes: exactMatch.episodes };
        }
        
        // Return first result if no exact match
        console.log(`[AnimePahe] ✓ Using first result: ${results[0].title}`);
        console.log(`[AnimePahe] Total episodes from search: ${results[0].episodes || 'unknown'}`);
        return { session: results[0].session, totalEpisodes: results[0].episodes };
      }
    }

    console.log('[AnimePahe] ✗ No matches found');
    return null;
  } catch (error) {
    console.error('[AnimePahe] Error getting session:', error);
    return null;
  }
}

/**
 * Get episodes for an AnimePahe session
 * @param {string|object} sessionData - Either session string or object with session and totalEpisodes
 */
export async function getAnimePaheEpisodes(sessionData) {
  // Handle both old (string) and new (object) format
  const session = typeof sessionData === 'string' ? sessionData : sessionData.session;
  const knownTotalEpisodes = typeof sessionData === 'object' ? sessionData.totalEpisodes : null;
  try {
    const allEpisodes = [];
    let totalPages = 1;
    
    // First, fetch page 1 to get total pages and total episodes
    const initialResponse = await fetch(
      `${ANIMEPAHE_BASE_URL}/api/${session}/releases?sort=episode_asc&page=1`
    );

    if (!initialResponse.ok) {
      throw new Error(`AnimePahe episodes failed: ${initialResponse.status}`);
    }

    const initialData = await initialResponse.json();
    
    // Debug: Log the full response structure
    const paginationInfo = initialData.paginationInfo || {};
    console.log(`[AnimePahe] API Response structure:`, JSON.stringify({
      total: paginationInfo.total,
      perPage: paginationInfo.perPage,
      currentPage: paginationInfo.currentPage,
      lastPage: paginationInfo.lastPage,
      from: paginationInfo.from,
      to: paginationInfo.to,
      data_length: initialData.data?.length
    }));
    
    if (!initialData?.data || initialData.data.length === 0) {
      return [];
    }
    
    // Transform episodes from first page
    const firstPageEpisodes = initialData.data.map(ep => ({
      id: ep.session,
      number: ep.episode,
      title: `Episode ${ep.episode}`,
      episodeId: ep.session,
      session: ep.session,
      animeSession: session
    }));
    
    allEpisodes.push(...firstPageEpisodes);
    
    // Calculate total pages from response metadata
    // AnimePahe API returns paginationInfo with camelCase properties
    const perPage = paginationInfo.perPage || 30;
    
    // Use known total from search if available, otherwise use API response
    let total = paginationInfo.total || initialData.data.length;
    if (knownTotalEpisodes && knownTotalEpisodes > total) {
      console.log(`[AnimePahe] Using known total from search: ${knownTotalEpisodes}`);
      total = knownTotalEpisodes;
    }
    
    // Calculate actual total pages
    totalPages = paginationInfo.lastPage || Math.ceil(total / perPage);
    
    console.log(`[AnimePahe] Total episodes: ${total}, Per page: ${perPage}, Total pages: ${totalPages}`);
    
    // If more than one page, fetch remaining pages in parallel (with batching to avoid overwhelming the API)
    if (totalPages > 1) {
      const batchSize = 5; // Fetch 5 pages at a time
      
      for (let batchStart = 2; batchStart <= totalPages; batchStart += batchSize) {
        const batchEnd = Math.min(batchStart + batchSize - 1, totalPages);
        const pagePromises = [];
        
        for (let page = batchStart; page <= batchEnd; page++) {
          pagePromises.push(
            fetch(`${ANIMEPAHE_BASE_URL}/api/${session}/releases?sort=episode_asc&page=${page}`)
              .then(res => {
                if (!res.ok) throw new Error(`AnimePahe episodes page ${page} failed: ${res.status}`);
                return res.json();
              })
              .then(data => {
                if (!data?.data) return [];
                
                return data.data.map(ep => ({
                  id: ep.session,
                  number: ep.episode,
                  title: `Episode ${ep.episode}`,
                  episodeId: ep.session,
                  session: ep.session,
                  animeSession: session
                }));
              })
              .catch(err => {
                console.error(`[AnimePahe] Error fetching page ${page}:`, err);
                return [];
              })
          );
        }
        
        // Wait for current batch to complete
        const batchResults = await Promise.all(pagePromises);
        
        // Add episodes from batch to our collection
        batchResults.forEach(episodes => {
          allEpisodes.push(...episodes);
        });
        
        console.log(`[AnimePahe] Fetched pages ${batchStart}-${batchEnd}, total episodes so far: ${allEpisodes.length}`);
      }
    }

    // Sort episodes by number to ensure correct order
    allEpisodes.sort((a, b) => a.number - b.number);
    
    console.log(`[AnimePahe] Retrieved ${allEpisodes.length} episodes from ${totalPages} pages`);
    return allEpisodes;
  } catch (error) {
    console.error('[AnimePahe] Error fetching episodes:', error);
    return [];
  }
}
