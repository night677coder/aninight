/**
 * HiAnime API Integration with Enhanced AniList ID Mapping
 * Provides accurate anime matching using multiple strategies
 */

const HIANIME_API = 'https://aniwatch-api-pi.vercel.app/api/v2/hianime';

/**
 * Normalize title for better matching
 */
const normalizeTitle = (title) => {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .trim()
    // Remove special characters but keep spaces and hyphens
    .replace(/[^\w\s-]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Remove common suffixes that might differ
    .replace(/\s+(season\s+\d+|part\s+\d+|cour\s+\d+)$/i, '');
};

/**
 * Calculate similarity score between two titles (0-1)
 */
const calculateSimilarity = (title1, title2) => {
  const norm1 = normalizeTitle(title1);
  const norm2 = normalizeTitle(title2);
  
  // Exact match
  if (norm1 === norm2) return 1.0;
  
  // Check if one contains the other
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    const longer = Math.max(norm1.length, norm2.length);
    const shorter = Math.min(norm1.length, norm2.length);
    return shorter / longer;
  }
  
  // Levenshtein distance for fuzzy matching
  const matrix = Array(norm2.length + 1).fill(null).map(() => 
    Array(norm1.length + 1).fill(null)
  );
  
  for (let i = 0; i <= norm1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= norm2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= norm2.length; j++) {
    for (let i = 1; i <= norm1.length; i++) {
      const indicator = norm1[i - 1] === norm2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  const distance = matrix[norm2.length][norm1.length];
  const maxLength = Math.max(norm1.length, norm2.length);
  return 1 - (distance / maxLength);
};

/**
 * Get anime data from AniList with relations for season detection
 */
export const getAnilistData = async (anilistId) => {
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
          status
          season
          seasonYear
          episodes
          startDate {
            year
            month
            day
          }
          relations {
            edges {
              relationType
              node {
                id
                type
                format
                title {
                  romaji
                  english
                }
                startDate {
                  year
                  month
                  day
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { id: parseInt(anilistId) } })
    });

    if (!response.ok) {
      console.error(`[HiAnime] AniList API returned ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (data?.errors) {
      console.error('[HiAnime] AniList errors:', data.errors);
      return null;
    }

    return data?.data?.Media || null;
  } catch (error) {
    console.error('[HiAnime] AniList fetch error:', error.message);
    return null;
  }
};

/**
 * Map AniList format to HiAnime type
 */
const mapFormat = (format) => {
  const formatMap = {
    "TV": "tv",
    "TV_SHORT": "tv",
    "MOVIE": "movie",
    "SPECIAL": "special",
    "OVA": "ova",
    "ONA": "ona",
    "MUSIC": "music"
  };
  return format ? formatMap[format] || null : null;
};

/**
 * Map AniList status to HiAnime status
 */
const mapStatus = (status) => {
  const statusMap = {
    'FINISHED': 'finished-airing',
    'RELEASING': 'currently-airing',
    'NOT_YET_RELEASED': 'not-yet-aired'
  };
  return status ? statusMap[status] || null : null;
};

/**
 * Search HiAnime with a query
 */
const searchHiAnime = async (query, filters = {}) => {
  try {
    const params = new URLSearchParams({ q: query, page: '1' });
    
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.season) params.append('season', filters.season);
    if (filters.year) params.append('start_date', filters.year);

    const url = `${HIANIME_API}/search?${params}`;
    
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      console.error(`[HiAnime] Search API returned ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    
    if ((data?.success || data?.status === 200) && data?.data?.animes?.length > 0) {
      return data.data.animes;
    }
    
    return [];
  } catch (error) {
    console.error('[HiAnime] Search error:', error.message);
    return [];
  }
};

/**
 * Detect season number from title or relations
 */
const detectSeasonNumber = (anilistData) => {
  // Check title for season indicators
  const titles = [
    anilistData.title.english,
    anilistData.title.romaji,
    ...(anilistData.synonyms || [])
  ].filter(Boolean);
  
  for (const title of titles) {
    // Match patterns like "Season 2", "S2", "2nd Season", "Part 2", "Cour 2"
    const seasonMatch = title.match(/(?:season|s|part|cour)\s*(\d+)/i);
    if (seasonMatch) {
      return parseInt(seasonMatch[1]);
    }
    
    // Match patterns like "II", "III", "2nd", "3rd"
    const romanMatch = title.match(/\s+(II|III|IV|V|VI|VII|VIII|IX|X)(?:\s|$)/i);
    if (romanMatch) {
      const romanToNum = { 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10 };
      return romanToNum[romanMatch[1].toUpperCase()] || 1;
    }
    
    const ordinalMatch = title.match(/(\d+)(?:st|nd|rd|th)\s+season/i);
    if (ordinalMatch) {
      return parseInt(ordinalMatch[1]);
    }
  }
  
  // Count prequels to determine season number
  if (anilistData.relations?.edges) {
    const prequels = anilistData.relations.edges.filter(edge => 
      edge.relationType === 'PREQUEL' && 
      edge.node.type === 'ANIME' &&
      edge.node.format !== 'MOVIE' &&
      edge.node.format !== 'SPECIAL' &&
      edge.node.format !== 'OVA'
    );
    
    if (prequels.length > 0) {
      return prequels.length + 1;
    }
  }
  
  return 1; // Default to season 1
};

/**
 * Extract base title without season indicators
 */
const extractBaseTitle = (title) => {
  if (!title) return '';
  
  return title
    // Remove season indicators
    .replace(/\s*(?:season|s|part|cour)\s*\d+/gi, '')
    .replace(/\s*(?:II|III|IV|V|VI|VII|VIII|IX|X)(?:\s|$)/gi, '')
    .replace(/\s*\d+(?:st|nd|rd|th)\s+season/gi, '')
    .replace(/\s*:\s*(?:season|part|cour)\s*\d+/gi, '')
    // Clean up
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Find best match from search results using multiple criteria including season detection
 */
const findBestMatch = (anilistData, searchResults) => {
  if (!searchResults || searchResults.length === 0) return null;
  
  const titles = [
    anilistData.title.english,
    anilistData.title.romaji,
    ...(anilistData.synonyms || [])
  ].filter(Boolean);
  
  const seasonNumber = detectSeasonNumber(anilistData);
  const baseTitles = titles.map(extractBaseTitle).filter(Boolean);
  
  console.log(`[HiAnime] Detected season: ${seasonNumber}`);
  if (baseTitles.length > 0) {
    console.log(`[HiAnime] Base title: "${baseTitles[0]}"`);
  }
  
  let bestMatch = null;
  let bestScore = 0;
  
  for (const result of searchResults) {
    let score = 0;
    
    // Detect season in result
    const resultSeasonNumber = detectSeasonNumber({ 
      title: { english: result.name, romaji: result.name },
      synonyms: []
    });
    
    // Calculate title similarity (most important)
    const titleScores = titles.map(title => 
      calculateSimilarity(title, result.name)
    );
    const maxTitleScore = Math.max(...titleScores);
    score += maxTitleScore * 100; // Weight: 100 points
    
    // Also check base title similarity (without season indicators)
    const baseResultTitle = extractBaseTitle(result.name);
    const baseTitleScores = baseTitles.map(baseTitle =>
      calculateSimilarity(baseTitle, baseResultTitle)
    );
    const maxBaseTitleScore = Math.max(...baseTitleScores, 0);
    
    // If base titles match well, add bonus
    if (maxBaseTitleScore > 0.8) {
      score += 30; // Bonus for matching base title
    }
    
    // Season number match (CRITICAL for multi-season anime)
    if (seasonNumber === resultSeasonNumber) {
      score += 40; // Major bonus for correct season
      console.log(`[HiAnime]   "${result.name}" - Season match! (${seasonNumber})`);
    } else if (seasonNumber !== 1 || resultSeasonNumber !== 1) {
      // Penalize season mismatch heavily (unless both are season 1)
      score -= 30;
      console.log(`[HiAnime]   "${result.name}" - Season mismatch (want: ${seasonNumber}, got: ${resultSeasonNumber})`);
    }
    
    // Bonus for exact normalized match
    const normalizedAnilistTitles = titles.map(normalizeTitle);
    const normalizedResultName = normalizeTitle(result.name);
    if (normalizedAnilistTitles.some(t => t === normalizedResultName)) {
      score += 50; // Bonus: 50 points
    }
    
    // Episode count match (if available)
    if (anilistData.episodes && result.episodes?.sub) {
      const episodeDiff = Math.abs(anilistData.episodes - result.episodes.sub);
      if (episodeDiff === 0) {
        score += 20; // Bonus: 20 points
      } else if (episodeDiff <= 2) {
        score += 10; // Partial bonus
      } else if (episodeDiff > 10) {
        score -= 10; // Penalty for large difference
      }
    }
    
    // Type match
    const anilistType = mapFormat(anilistData.format);
    if (anilistType && result.type === anilistType) {
      score += 15; // Bonus: 15 points
    }
    
    // Year match (if available)
    if (anilistData.startDate?.year && result.releaseDate) {
      const resultYear = parseInt(result.releaseDate);
      const yearDiff = Math.abs(resultYear - anilistData.startDate.year);
      
      if (yearDiff === 0) {
        score += 15; // Bonus: 15 points for exact year
      } else if (yearDiff === 1) {
        score += 5; // Small bonus for adjacent year
      } else if (yearDiff > 2) {
        score -= 10; // Penalty for year mismatch
      }
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = result;
    }
  }
  
  // Only return if confidence is high enough (>= 70%)
  if (bestScore >= 70) {
    console.log(`[HiAnime] Best match: "${bestMatch.name}" (score: ${bestScore.toFixed(1)})`);
    return bestMatch;
  }
  
  console.log(`[HiAnime] No confident match found (best score: ${bestScore.toFixed(1)})`);
  return null;
};

/**
 * Get HiAnime ID using enhanced multi-strategy matching with season awareness
 */
export const getHiAnimeId = async (anilistData) => {
  if (!anilistData) return null;
  
  console.log(`[HiAnime] Mapping AniList ID ${anilistData.id}`);
  
  const titles = [
    anilistData.title.english,
    anilistData.title.romaji,
  ].filter(Boolean);
  
  const baseTitles = titles.map(extractBaseTitle).filter(Boolean);
  const seasonNumber = detectSeasonNumber(anilistData);
  
  // Strategy 1: Search with full title (includes season) + filters
  if (anilistData.title.english) {
    console.log(`[HiAnime] Strategy 1: Full English title with filters`);
    const results = await searchHiAnime(anilistData.title.english, {
      type: mapFormat(anilistData.format),
      status: mapStatus(anilistData.status),
      year: anilistData.startDate?.year
    });
    
    const match = findBestMatch(anilistData, results);
    if (match) return match.id;
  }
  
  // Strategy 2: Search with base title (no season) + filters
  // This helps find the correct season from all results
  if (baseTitles[0] && baseTitles[0] !== anilistData.title.english) {
    console.log(`[HiAnime] Strategy 2: Base English title with filters`);
    const results = await searchHiAnime(baseTitles[0], {
      type: mapFormat(anilistData.format),
      status: mapStatus(anilistData.status),
      year: anilistData.startDate?.year
    });
    
    const match = findBestMatch(anilistData, results);
    if (match) return match.id;
  }
  
  // Strategy 3: Search with Romaji title + filters
  if (anilistData.title.romaji) {
    console.log(`[HiAnime] Strategy 3: Romaji title with filters`);
    const results = await searchHiAnime(anilistData.title.romaji, {
      type: mapFormat(anilistData.format),
      status: mapStatus(anilistData.status),
      year: anilistData.startDate?.year
    });
    
    const match = findBestMatch(anilistData, results);
    if (match) return match.id;
  }
  
  // Strategy 4: Search with base Romaji title
  const baseRomaji = extractBaseTitle(anilistData.title.romaji);
  if (baseRomaji && baseRomaji !== anilistData.title.romaji) {
    console.log(`[HiAnime] Strategy 4: Base Romaji title with filters`);
    const results = await searchHiAnime(baseRomaji, {
      type: mapFormat(anilistData.format),
      status: mapStatus(anilistData.status),
      year: anilistData.startDate?.year
    });
    
    const match = findBestMatch(anilistData, results);
    if (match) return match.id;
  }
  
  // Strategy 5: Try synonyms with filters
  if (anilistData.synonyms && anilistData.synonyms.length > 0) {
    console.log(`[HiAnime] Strategy 5: Synonyms with filters`);
    for (const synonym of anilistData.synonyms.slice(0, 3)) {
      const results = await searchHiAnime(synonym, {
        type: mapFormat(anilistData.format),
        status: mapStatus(anilistData.status)
      });
      
      const match = findBestMatch(anilistData, results);
      if (match) return match.id;
    }
  }
  
  // Strategy 6: Broad search without year filter (English)
  if (anilistData.title.english) {
    console.log(`[HiAnime] Strategy 6: English title without year filter`);
    const results = await searchHiAnime(anilistData.title.english, {
      type: mapFormat(anilistData.format),
      status: mapStatus(anilistData.status)
    });
    const match = findBestMatch(anilistData, results);
    if (match) return match.id;
  }
  
  // Strategy 7: Broad search with base title (no filters)
  if (baseTitles[0]) {
    console.log(`[HiAnime] Strategy 7: Base title without filters`);
    const results = await searchHiAnime(baseTitles[0]);
    const match = findBestMatch(anilistData, results);
    if (match) return match.id;
  }
  
  console.log(`[HiAnime] ✗ No match found for AniList ID ${anilistData.id}`);
  return null;
};

/**
 * Fetch episodes from HiAnime
 */
export const getHiAnimeEpisodes = async (hiAnimeId) => {
  try {
    const url = `${HIANIME_API}/anime/${hiAnimeId}/episodes`;
    
    const response = await fetch(url);
    const data = await response.json();

    if ((!data?.success && data?.status !== 200) || !data?.data?.episodes) {
      console.error('[HiAnime] No episodes in response');
      return [];
    }

    return data.data.episodes.map(ep => ({
      id: ep.episodeId,
      number: ep.number,
      title: ep.title || `Episode ${ep.number}`,
      isFiller: ep.isFiller || false,
    }));
  } catch (error) {
    console.error('[HiAnime] Episodes fetch error:', error.message);
    return [];
  }
};

/**
 * Get HiAnime info by ID
 */
export const getHiAnimeInfo = async (hiAnimeId) => {
  try {
    const url = `${HIANIME_API}/anime/${hiAnimeId}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if ((!data?.success && data?.status !== 200) || !data?.data?.anime) {
      return null;
    }

    return data.data.anime;
  } catch (error) {
    console.error('[HiAnime] Info fetch error:', error.message);
    return null;
  }
};
