// Test script to verify Kyomu API endpoints
const KYOMU_API = 'https://animepahe-api-iota.vercel.app/api';

async function testKyomuAPI() {
  console.log('Testing Kyomu API...\n');

  // Test 1: Search for Solo Leveling
  console.log('1. Testing Search API...');
  try {
    const searchResponse = await fetch(`${KYOMU_API}/search?q=Solo Leveling`);
    const searchData = await searchResponse.json();
    console.log('Search Response:', JSON.stringify(searchData, null, 2));
    
    if (searchData?.data && searchData.data.length > 0) {
      const anime = searchData.data[0];
      console.log(`\nFound: ${anime.title}`);
      console.log(`Anime Session: ${anime.session}\n`);

      // Test 2: Get episodes
      console.log('2. Testing Episodes API...');
      const episodesResponse = await fetch(`${KYOMU_API}/${anime.session}/releases?sort=episode_desc&page=1`);
      const episodesData = await episodesResponse.json();
      console.log('Episodes Response:', JSON.stringify(episodesData, null, 2));

      if (episodesData?.data && episodesData.data.length > 0) {
        const episode = episodesData.data[0];
        console.log(`\nFirst Episode: ${episode.episode}`);
        console.log(`Episode Session: ${episode.session}\n`);

        // Test 3: Get streaming sources (CORRECT FORMAT)
        console.log('3. Testing Play API with correct format...');
        const correctUrl = `${KYOMU_API}/play/${anime.session}?episodeId=${episode.session}`;
        console.log(`Correct URL: ${correctUrl}`);
        const playResponse = await fetch(correctUrl);
        console.log(`Play API Status: ${playResponse.status}`);
        
        if (playResponse.ok) {
          const playData = await playResponse.json();
          console.log('\n✅ SUCCESS! Play Response:');
          console.log(`- Found ${playData.sources?.length || 0} sources`);
          console.log(`- Found ${playData.downloads?.length || 0} downloads`);
          if (playData.sources && playData.sources.length > 0) {
            console.log(`- First source: ${playData.sources[0].resolution} (${playData.sources[0].isDub ? 'DUB' : 'SUB'})`);
          }
        } else {
          const errorText = await playResponse.text();
          console.log('Play API Error:', errorText);
        }
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testKyomuAPI();
