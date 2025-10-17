// Test AnimePahe pagination fix
const ANIMEPAHE_BASE_URL = 'https://animepahe-api-iota.vercel.app';

async function testAnimePahePagination() {
  try {
    console.log('Testing AnimePahe Pagination Fix...\n');
    
    // Test with One Piece
    const searchQuery = 'One Piece';
    console.log(`1. Searching for "${searchQuery}"...`);
    
    const searchResponse = await fetch(
      `${ANIMEPAHE_BASE_URL}/api/search?q=${encodeURIComponent(searchQuery)}`
    );
    const searchData = await searchResponse.json();
    
    if (!searchData.data || searchData.data.length === 0) {
      console.log('No results found');
      return;
    }
    
    const anime = searchData.data[0];
    console.log(`Found: ${anime.title}`);
    console.log(`Total episodes from search: ${anime.episodes}`);
    console.log(`Session: ${anime.session}\n`);
    
    // Test episodes endpoint
    console.log('2. Fetching first page of episodes...');
    const episodesResponse = await fetch(
      `${ANIMEPAHE_BASE_URL}/api/${anime.session}/releases?sort=episode_asc&page=1`
    );
    const episodesData = await episodesResponse.json();
    
    const paginationInfo = episodesData.paginationInfo || {};
    console.log('Pagination Info:', JSON.stringify(paginationInfo, null, 2));
    
    // Calculate pages
    const perPage = paginationInfo.perPage || 30;
    const totalFromSearch = anime.episodes;
    const totalFromAPI = paginationInfo.total;
    
    console.log(`\n3. Pagination calculation:`);
    console.log(`   Episodes from search: ${totalFromSearch}`);
    console.log(`   Episodes from API: ${totalFromAPI}`);
    console.log(`   Per page: ${perPage}`);
    
    const totalToUse = totalFromAPI || totalFromSearch || 0;
    const calculatedPages = Math.ceil(totalToUse / perPage);
    const apiLastPage = paginationInfo.lastPage;
    
    console.log(`   Calculated pages: ${calculatedPages}`);
    console.log(`   API last_page: ${apiLastPage}`);
    console.log(`   Pages to fetch: ${Math.max(calculatedPages, apiLastPage)}`);
    
    // Test fetching a few more pages
    console.log(`\n4. Testing page 2...`);
    const page2Response = await fetch(
      `${ANIMEPAHE_BASE_URL}/api/${anime.session}/releases?sort=episode_asc&page=2`
    );
    const page2Data = await page2Response.json();
    console.log(`   Page 2 episodes: ${page2Data.data?.length || 0}`);
    
    if (calculatedPages > 2) {
      console.log(`\n5. Testing last page (${calculatedPages})...`);
      const lastPageResponse = await fetch(
        `${ANIMEPAHE_BASE_URL}/api/${anime.session}/releases?sort=episode_asc&page=${calculatedPages}`
      );
      const lastPageData = await lastPageResponse.json();
      console.log(`   Last page episodes: ${lastPageData.data?.length || 0}`);
      console.log(`   Last page structure:`, JSON.stringify({
        total: lastPageData.total,
        current_page: lastPageData.current_page,
        last_page: lastPageData.last_page,
        data_length: lastPageData.data?.length
      }, null, 2));
    }
    
    console.log('\n✅ Test complete!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testAnimePahePagination();
