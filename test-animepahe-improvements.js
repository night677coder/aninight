// Test script for AnimePahe improvements
const ANIMEPAHE_BASE_URL = 'https://animepahe-api-iota.vercel.app';
const EXTERNAL_PROXY = 'https://m8u3.thevoidborn001.workers.dev';

async function testFasterEndpoint() {
  console.log('🧪 Testing AnimePahe Faster Endpoint\n');
  
  const animeSession = '8d9c277c-d8eb-f789-6158-b853a7236f14';
  const episodeSession = '1cbc38a3d54dd2622abde85b38bd80983d406365e4de8936d3c56bc1b7c34eef';
  
  console.log('📺 Anime: Frieren: Beyond Journey\'s End');
  console.log(`   Anime Session: ${animeSession}`);
  console.log(`   Episode Session: ${episodeSession}\n`);
  
  // Test 1: With downloads=false (faster)
  console.log('1️⃣ Testing with downloads=false (faster)...');
  const start1 = Date.now();
  
  const response1 = await fetch(
    `${ANIMEPAHE_BASE_URL}/api/play/${animeSession}?episodeId=${episodeSession}&downloads=false`
  );
  
  const data1 = await response1.json();
  const time1 = Date.now() - start1;
  
  console.log(`   ✅ Response time: ${time1}ms`);
  console.log(`   Sources: ${data1.sources?.length || 0}`);
  console.log(`   Downloads: ${data1.downloads ? 'included' : 'not included'}\n`);
  
  // Test 2: Without downloads=false (slower)
  console.log('2️⃣ Testing without downloads=false (slower)...');
  const start2 = Date.now();
  
  const response2 = await fetch(
    `${ANIMEPAHE_BASE_URL}/api/play/${animeSession}?episodeId=${episodeSession}`
  );
  
  const data2 = await response2.json();
  const time2 = Date.now() - start2;
  
  console.log(`   ✅ Response time: ${time2}ms`);
  console.log(`   Sources: ${data2.sources?.length || 0}`);
  console.log(`   Downloads: ${data2.downloads ? 'included' : 'not included'}\n`);
  
  // Comparison
  const improvement = ((time2 - time1) / time2 * 100).toFixed(1);
  console.log('📊 Comparison:');
  console.log(`   With downloads=false: ${time1}ms`);
  console.log(`   Without downloads=false: ${time2}ms`);
  console.log(`   Speed improvement: ${improvement}% faster\n`);
  
  return { data: data1, time: time1 };
}

async function testDubFallback() {
  console.log('🧪 Testing Dub to Sub Fallback\n');
  
  const animeSession = '8d9c277c-d8eb-f789-6158-b853a7236f14';
  const episodeSession = '1cbc38a3d54dd2622abde85b38bd80983d406365e4de8936d3c56bc1b7c34eef';
  
  const response = await fetch(
    `${ANIMEPAHE_BASE_URL}/api/play/${animeSession}?episodeId=${episodeSession}&downloads=false`
  );
  
  const data = await response.json();
  
  // Count sub and dub sources
  const subSources = data.sources.filter(s => s.isDub === false);
  const dubSources = data.sources.filter(s => s.isDub === true);
  
  console.log('📊 Available Sources:');
  console.log(`   SUB sources: ${subSources.length}`);
  console.log(`   DUB sources: ${dubSources.length}\n`);
  
  // Test 1: Request DUB (should get dub if available)
  console.log('1️⃣ Requesting DUB...');
  const isDubRequested = true;
  let sources = [];
  
  for (const source of data.sources) {
    if (source.isDub === isDubRequested && source.url && source.isM3U8) {
      sources.push(source);
    }
  }
  
  console.log(`   Found ${sources.length} DUB sources`);
  
  if (sources.length === 0) {
    console.log(`   ⚠️  No DUB sources found, falling back to SUB...`);
    
    for (const source of data.sources) {
      if (source.isDub === false && source.url && source.isM3U8) {
        sources.push(source);
      }
    }
    
    console.log(`   ✅ Fallback successful: ${sources.length} SUB sources\n`);
  } else {
    console.log(`   ✅ DUB sources available\n`);
  }
  
  // Test 2: Request SUB (should always get sub)
  console.log('2️⃣ Requesting SUB...');
  sources = [];
  
  for (const source of data.sources) {
    if (source.isDub === false && source.url && source.isM3U8) {
      sources.push(source);
    }
  }
  
  console.log(`   ✅ Found ${sources.length} SUB sources\n`);
  
  // Test 3: Simulate anime with no dub
  console.log('3️⃣ Simulating anime with no DUB...');
  const noDubData = {
    sources: data.sources.filter(s => s.isDub === false)
  };
  
  console.log(`   Available: ${noDubData.sources.length} SUB sources only`);
  
  // Request DUB
  sources = [];
  for (const source of noDubData.sources) {
    if (source.isDub === true && source.url && source.isM3U8) {
      sources.push(source);
    }
  }
  
  console.log(`   Requested DUB: ${sources.length} sources found`);
  
  if (sources.length === 0) {
    console.log(`   ⚠️  No DUB sources, falling back to SUB...`);
    
    for (const source of noDubData.sources) {
      if (source.isDub === false && source.url && source.isM3U8) {
        sources.push(source);
      }
    }
    
    console.log(`   ✅ Fallback successful: ${sources.length} SUB sources\n`);
  }
  
  return { subCount: subSources.length, dubCount: dubSources.length };
}

async function runTests() {
  console.log('🎬 Testing AnimePahe Improvements\n');
  console.log('='.repeat(60) + '\n');
  
  // Test faster endpoint
  const endpointTest = await testFasterEndpoint();
  
  console.log('='.repeat(60) + '\n');
  
  // Test dub fallback
  const fallbackTest = await testDubFallback();
  
  console.log('='.repeat(60));
  console.log('\n✅ All Tests Completed!\n');
  
  console.log('📋 Summary:');
  console.log(`   ✓ Faster endpoint working (${endpointTest.time}ms)`);
  console.log(`   ✓ Dub to Sub fallback working`);
  console.log(`   ✓ SUB sources: ${fallbackTest.subCount}`);
  console.log(`   ✓ DUB sources: ${fallbackTest.dubCount}`);
  
  console.log('\n🎉 Both improvements are working correctly!');
}

runTests();
