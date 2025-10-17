/**
 * Format provider ID to display name
 */
export const formatProviderName = (providerId) => {
  const providerNames = {
    'hianime': 'HiAnime',
    'kyomu': 'Kyomu',
    'gogoanime': 'GogoAnime',
    'gogobackup': 'GogoAnime (Backup)',
    'zoro': 'Zoro',
    '9anime': '9Anime',
    'animepahe': 'AnimePahe',
  };

  return providerNames[providerId?.toLowerCase()] || providerId;
};
