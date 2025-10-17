/**
 * Formats HiAnime episode IDs from ?ep= format to $episode$ format
 * Example: "dan-da-dan-season-2-19793?ep=141568" -> "dan-da-dan-season-2-19793$episode$141568"
 * 
 * @param {string} episodeId - The episode ID from HiAnime API
 * @returns {string} - The formatted episode ID for streaming API
 */
export function formatEpisodeId(episodeId) {
  if (!episodeId) {
    console.warn('[formatEpisodeId] Received null/undefined episodeId');
    return episodeId;
  }
  
  // Check if the episodeId contains ?ep=
  if (episodeId.includes('?ep=')) {
    const formatted = episodeId.replace('?ep=', '$episode$');
    console.log(`[formatEpisodeId] Converted: ${episodeId} -> ${formatted}`);
    return formatted;
  }
  
  console.log(`[formatEpisodeId] No conversion needed for: ${episodeId}`);
  return episodeId;
}

/**
 * Reverses the formatting from $episode$ back to ?ep= format
 * Example: "dan-da-dan-season-2-19793$episode$141568" -> "dan-da-dan-season-2-19793?ep=141568"
 * 
 * @param {string} episodeId - The formatted episode ID
 * @returns {string} - The original HiAnime episode ID format
 */
export function unformatEpisodeId(episodeId) {
  if (!episodeId) return episodeId;
  
  // Check if the episodeId contains $episode$
  if (episodeId.includes('$episode$')) {
    return episodeId.replace('$episode$', '?ep=');
  }
  
  return episodeId;
}
