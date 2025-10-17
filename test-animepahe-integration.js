// Test script for AnimePahe integration
const ANIMEPAHE_BASE_URL = 'https://animepahe-api-iota.vercel.app';
const EXTERNAL_PROXY = 'https://m8u3.thevoidborn001.workers.dev';

async function testAnimePaheIntegration() {
  try {
    console.log('🧪 Testing AnimePahe Integration...\n');
    
    // Test 1: Search for an anime
    console.log('1️⃣ Searching for "Frieren"...');
    const searchResponse = await fetch(
      `${ANIMEPAHE_BASE_URL}/api/search?q=Frieren`
    );
    const searchData = await searchResponse.json();
    
    if (!searchData.data || searchData.data.length === 0) {
      console.log('❌ No results found');
      return;
    }
    
    const anime = searchData.data[0];
    console.log(`✅ Found: ${anime.title}`);
    console.log(`   Anime Session: ${anime.session}\n`);
    
    // Test 2: Get episodes
    console.log('2️⃣ Getting episodes...');
    const episodesResponse = await fetch(
      `${ANIMEPAHE_BASE_URL}/api/${anime.session}/releases?sort=episode_asc&page=1`
    );
    const episodesData = await episodesResponse.json();
    
    if (!episodesData.data || episodesData.data.length === 0) {
      console.log('❌ No episodes found');
      return;
    }
    
    const episode = episodesData.data[0];
    console.log(`✅ Found ${episodesData.data.length} episodes`);
    console.log(`   First Episode: ${episode.episode}`);
    console.log(`   Episode Session: ${episode.session}\n`);
    
    // Test 3: Get streaming sources
    console.log('3️⃣ Getting streaming sources...');
    const sourcesResponse = await fetch(
      `${ANIMEPAHE_BASE_URL}/api/play/${anime.session}?episodeId=${episode.session}`
    );
    
    if (!sourcesResponse.ok) {
      console.log(`❌ Failed to get sources: ${sourcesResponse.status}`);
      return;
    }
    
    const sourcesData = await sourcesResponse.json();
    console.log('✅ Got sources response');
    console.log('   Response structure:', JSON.stringify(sourcesData, null, 2));
    
    // Test 4: Extract and proxy m3u8 URLs
    console.log('\n4️⃣ Processing streaming URLs...');
    const sources = [];
    
    if (sourcesData.sources && Array.isArray(sourcesData.sources)) {
      for (const source of sourcesData.sources) {
        if (source.url && source.isM3U8) {
          const urlObj = new URL(source.url);
          const proxyPath = urlObj.pathname + urlObj.search;
          const proxiedUrl = `${EXTERNAL_PROXY}${proxyPath}`;
          
          sources.push({
            quality: source.resolution,
            originalUrl: source.url,
            proxiedUrl
          });
          
          console.log(`   ${source.resolution}p: ${proxiedUrl.substring(0, 80)}...`);
        }
      }
    }
    
    if (sources.length === 0) {
      console.log('❌ No m3u8 sources found');
      return;
    }
    
    console.log(`\n✅ Found ${sources.length} streaming sources`);
    
    // Test 5: Test proxied URL (just check if it's accessible)
    console.log('\n5️⃣ Testing proxied URL...');
    const testUrl = sources[0].proxiedUrl;
    console.log(`   Testing: ${testUrl.substring(0, 80)}...`);
    
    const testResponse = await fetch(testUrl, {
      method: 'HEAD',
      headers: {
        'Referer': 'https://animepahe.com/'
      }
    });
    
    if (testResponse.ok) {
      console.log('✅ Proxied URL is accessible');
    } else {
      console.log(`⚠️  Proxied URL returned status: ${testResponse.status}`);
    }
    
    console.log('\n🎉 AnimePahe integration test completed!');
    console.log('\n📋 Summary:');
    console.log(`   Anime: ${anime.title}`);
    console.log(`   Anime Session: ${anime.session}`);
    console.log(`   Episode: ${episode.episode}`);
    console.log(`   Episode Session: ${episode.session}`);
    console.log(`   Sources: ${sources.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAnimePaheIntegration();
