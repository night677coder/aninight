// Test script for Consumet API with fallback to mapping
const CONSUMET_BASE = 'https://consumet-six-alpha.vercel.app';

async function testConsumetWithFallback(anilistId) {
  console.log(`\n🧪 Testing Consumet API with Fallback for AniList ID: ${anilistId}\n`);
  
  // Test 1: Try Consumet API
  console.log('1️⃣ Testing Consumet API...');
  let consumetSuccess = false;
  let consumetEpisodes = [];
  
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      console.log(`   Attempt ${attempt}/2...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(
        `${CONSUMET_BASE}/meta/anilist/episodes/${anilistId}`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error('No episodes returned');
      }
      
      consumetEpisodes = data;
      consumetSuccess = true;
      console.log(`   ✅ Success! Retrieved ${data.length} episodes`);
      console.log(`   First episode:`, data[0]);
      break;
      
    } catch (error) {
      console.log(`   ❌ Attempt ${attempt} failed: ${error.message}`);
      
      if (attempt < 2) {
        const delay = 1000 * attempt;
        console.log(`   ⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  if (consumetSuccess) {
    console.log('\n✅ Consumet API Test: PASSED');
    console.log(`   Total episodes: ${consumetEpisodes.length}`);
    console.log(`   Episode format:`, {
      id: consumetEpisodes[0]?.id,
      number: consumetEpisodes[0]?.number,
      title: consumetEpisodes[0]?.title,
      image: consumetEpisodes[0]?.image
    });
    return { success: true, source: 'consumet', episodes: consumetEpisodes };
  }
  
  console.log('\n⚠️  Consumet API Test: FAILED (would fallback to mapping)');
  return { success: false, source: 'mapping', episodes: [] };
}

// Test with different anime IDs
async function runTests() {
  console.log('🎬 Testing Consumet API Integration\n');
  console.log('=' .repeat(60));
  
  // Test 1: Popular anime (should work)
  console.log('\n📺 Test 1: Frieren (Popular anime)');
  const test1 = await testConsumetWithFallback(154587);
  
  // Test 2: Another popular anime
  console.log('\n📺 Test 2: Jujutsu Kaisen');
  const test2 = await testConsumetWithFallback(113415);
  
  // Test 3: Older anime (might fail)
  console.log('\n📺 Test 3: One Piece');
  const test3 = await testConsumetWithFallback(21);
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Summary:');
  console.log(`   Test 1 (Frieren): ${test1.success ? '✅ PASSED' : '❌ FAILED'} - ${test1.source}`);
  console.log(`   Test 2 (JJK): ${test2.success ? '✅ PASSED' : '❌ FAILED'} - ${test2.source}`);
  console.log(`   Test 3 (One Piece): ${test3.success ? '✅ PASSED' : '❌ FAILED'} - ${test3.source}`);
  
  const passedTests = [test1, test2, test3].filter(t => t.success).length;
  console.log(`\n   Overall: ${passedTests}/3 tests passed`);
  
  if (passedTests > 0) {
    console.log('\n✅ Consumet API is working! Mapping will be used as fallback when needed.');
  } else {
    console.log('\n⚠️  Consumet API is not responding. All requests will use mapping fallback.');
  }
}

runTests();
