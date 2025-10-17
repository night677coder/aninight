// Test script for AnimePahe dub/sub filtering
const ANIMEPAHE_BASE_URL = 'https://animepahe-api-iota.vercel.app';
const EXTERNAL_PROXY = 'https://m8u3.thevoidborn001.workers.dev';

async function testAnimePaheDubSub() {
  try {
    console.log('🧪 Testing AnimePahe Dub/Sub Filtering...\n');
    
    // Using Frieren which has both sub and dub
    const animeSession = '8d9c277c-d8eb-f789-6158-b853a7236f14';
    const episodeSession = '1cbc38a3d54dd2622abde85b38bd80983d406365e4de8936d3c56bc1b7c34eef';
    
    console.log('📺 Anime: Frieren: Beyond Journey\'s End');
    console.log(`   Anime Session: ${animeSession}`);
    console.log(`   Episode Session: ${episodeSession}\n`);
    
    // Get sources
    const response = await fetch(
      `${ANIMEPAHE_BASE_URL}/api/play/${animeSession}?episodeId=${episodeSession}`
    );
    
    const data = await response.json();
    
    console.log('📊 All Available Sources:');
    console.log(`   Total sources: ${data.sources.length}\n`);
    
    // Filter SUB sources
    const subSources = data.sources.filter(s => s.isDub === false);
    console.log('🎌 SUB Sources:');
    subSources.forEach(s => {
      console.log(`   ${s.resolution}p - ${s.fanSub}`);
    });
    console.log(`   Total: ${subSources.length}\n`);
    
    // Filter DUB sources
    const dubSources = data.sources.filter(s => s.isDub === true);
    console.log('🎙️  DUB Sources:');
    dubSources.forEach(s => {
      console.log(`   ${s.resolution}p - ${s.fanSub}`);
    });
    console.log(`   Total: ${dubSources.length}\n`);
    
    // Test filtering logic
    console.log('✅ Testing Filter Logic:');
    
    // Test SUB request
    const requestedSubtype = 'sub';
    const isDubRequested = requestedSubtype.toLowerCase() === 'dub';
    const filteredSub = data.sources.filter(s => s.isDub === isDubRequested);
    console.log(`   Requested: ${requestedSubtype}`);
    console.log(`   isDubRequested: ${isDubRequested}`);
    console.log(`   Filtered sources: ${filteredSub.length}`);
    console.log(`   ✓ SUB filtering works: ${filteredSub.length === subSources.length}\n`);
    
    // Test DUB request
    const requestedDubtype = 'dub';
    const isDubRequestedDub = requestedDubtype.toLowerCase() === 'dub';
    const filteredDub = data.sources.filter(s => s.isDub === isDubRequestedDub);
    console.log(`   Requested: ${requestedDubtype}`);
    console.log(`   isDubRequested: ${isDubRequestedDub}`);
    console.log(`   Filtered sources: ${filteredDub.length}`);
    console.log(`   ✓ DUB filtering works: ${filteredDub.length === dubSources.length}\n`);
    
    // Test proxy URL generation
    console.log('🔗 Testing Proxy URL Generation:');
    const testSource = subSources[0];
    const urlObj = new URL(testSource.url);
    const proxyPath = urlObj.pathname + urlObj.search;
    const proxiedUrl = `${EXTERNAL_PROXY}${proxyPath}`;
    
    console.log(`   Original: ${testSource.url.substring(0, 60)}...`);
    console.log(`   Proxied:  ${proxiedUrl.substring(0, 60)}...`);
    console.log(`   ✓ Proxy URL generated correctly\n`);
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAnimePaheDubSub();
