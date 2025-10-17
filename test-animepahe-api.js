// Test script for AnimePahe API
const ANIMEPAHE_BASE_URL = 'https://animepahe-api-iota.vercel.app';

async function testAnimePaheAPI() {
  try {
    console.log('Testing AnimePahe API...\n');
    
    // Test 1: Search for an anime
    console.log('1. Searching for "One Piece"...');
    const searchResponse = await fetch(
      `${ANIMEPAHE_BASE_URL}/api/search?q=One Piece`
    );
    const searchData = await searchResponse.json();
    console.log('Search results:', JSON.stringify(searchData, null, 2));
    
    if (!searchData.data || searchData.data.length === 0) {
      console.log('No results found');
      return;
    }
    
    const firstAnime = searchData.data[0];
    console.log('\nFirst anime:', firstAnime);
    console.log('Session:', firstAnime.session);
    
    // Test 2: Get episodes
    console.log('\n2. Getting episodes...');
    const episodesResponse = await fetch(
      `${ANIMEPAHE_BASE_URL}/api/${firstAnime.session}/releases?sort=episode_desc&page=1`
    );
    const episodesData = await episodesResponse.json();
    console.log('Episodes response:', JSON.stringify(episodesData, null, 2));
    
    if (!episodesData.data || episodesData.data.length === 0) {
      console.log('No episodes found');
      return;
    }
    
    const firstEpisode = episodesData.data[0];
    console.log('\nFirst episode:', firstEpisode);
    console.log('Episode fields:', Object.keys(firstEpisode));
    
    // Test 3: Get download links using correct endpoint
    console.log('\n3. Getting download links...');
    console.log(`Using anime session: ${firstAnime.session}`);
    console.log(`Using episode session: ${firstEpisode.session}`);
    
    const downloadResponse = await fetch(
      `${ANIMEPAHE_BASE_URL}/api/play/${firstAnime.session}?episodeId=${firstEpisode.session}`
    );
    
    if (downloadResponse.ok) {
      const downloadData = await downloadResponse.json();
      console.log('\nFull response:', JSON.stringify(downloadData, null, 2));
      
      // Extract download links (non-m3u8)
      console.log('\n=== DOWNLOAD LINKS ===');
      if (downloadData.downloads) {
        console.log('Downloads object:', downloadData.downloads);
      }
      if (downloadData.data) {
        console.log('\nData object keys:', Object.keys(downloadData.data));
        for (const [key, value] of Object.entries(downloadData.data)) {
          if (typeof value === 'string' && !value.includes('.m3u8')) {
            console.log(`${key}: ${value}`);
          }
        }
      }
    } else {
      console.log('Failed to get download links:', downloadResponse.status);
      const errorText = await downloadResponse.text();
      console.log('Error:', errorText);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testAnimePaheAPI();
