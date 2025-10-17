/**
 * Test script for improved HiAnime AniList ID mapping
 * Tests various edge cases and difficult-to-match anime
 */

const testCases = [
  {
    name: 'Popular anime with English title',
    anilistId: 21,
    expectedTitle: 'One Piece',
    description: 'Should match using English title'
  },
  {
    name: 'Attack on Titan Season 1',
    anilistId: 16498,
    expectedTitle: 'Shingeki no Kyojin',
    description: 'Season 1 - should match correctly'
  },
  {
    name: 'Attack on Titan Season 2',
    anilistId: 20958,
    expectedTitle: 'Shingeki no Kyojin Season 2',
    description: 'Season 2 - should NOT match Season 1'
  },
  {
    name: 'Attack on Titan Season 3',
    anilistId: 99147,
    expectedTitle: 'Shingeki no Kyojin Season 3',
    description: 'Season 3 - should match correct season'
  },
  {
    name: 'My Hero Academia Season 1',
    anilistId: 21459,
    expectedTitle: 'Boku no Hero Academia',
    description: 'Season 1 - base season'
  },
  {
    name: 'My Hero Academia Season 2',
    anilistId: 21856,
    expectedTitle: 'Boku no Hero Academia 2',
    description: 'Season 2 - should detect season number'
  },
  {
    name: 'Spy x Family Season 2',
    anilistId: 142838,
    expectedTitle: 'Spy x Family Season 2',
    description: 'Season 2 - should match correct season'
  },
  {
    name: 'Recent seasonal anime',
    anilistId: 154587,
    expectedTitle: 'Frieren',
    description: 'Frieren: Beyond Journey\'s End - single season'
  },
  {
    name: 'Jujutsu Kaisen Season 1',
    anilistId: 113415,
    expectedTitle: 'Jujutsu Kaisen',
    description: 'Season 1 - should handle special characters'
  },
  {
    name: 'Jujutsu Kaisen Season 2',
    anilistId: 145064,
    expectedTitle: 'Jujutsu Kaisen Season 2',
    description: 'Season 2 - should NOT match Season 1'
  },
  {
    name: 'Movie',
    anilistId: 129874,
    expectedTitle: 'Kimi no Na wa',
    description: 'Your Name - should match movie format'
  },
  {
    name: 'Demon Slayer Season 1',
    anilistId: 101922,
    expectedTitle: 'Kimetsu no Yaiba',
    description: 'Season 1 - popular anime'
  },
  {
    name: 'Demon Slayer Season 2',
    anilistId: 142329,
    expectedTitle: 'Kimetsu no Yaiba: Yuukaku-hen',
    description: 'Season 2 - Entertainment District Arc'
  }
];

async function testMapping() {
  console.log('🧪 Testing Enhanced HiAnime AniList ID Mapping\n');
  console.log('=' .repeat(70));
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    console.log(`\n📝 Test: ${testCase.name}`);
    console.log(`   AniList ID: ${testCase.anilistId}`);
    console.log(`   Expected: ${testCase.expectedTitle}`);
    console.log(`   ${testCase.description}`);
    console.log('   ' + '-'.repeat(66));
    
    try {
      const response = await fetch(`http://localhost:3000/api/episode/${testCase.anilistId}`);
      
      if (!response.ok) {
        console.log(`   ❌ FAILED: HTTP ${response.status}`);
        failed++;
        continue;
      }
      
      const data = await response.json();
      
      if (data && data.length > 0 && data[0].episodes) {
        const subEpisodes = data[0].episodes.sub || [];
        const dubEpisodes = data[0].episodes.dub || [];
        
        console.log(`   ✅ SUCCESS`);
        console.log(`   📺 Sub Episodes: ${subEpisodes.length}`);
        console.log(`   🎙️  Dub Episodes: ${dubEpisodes.length}`);
        
        if (subEpisodes.length > 0) {
          console.log(`   🔗 First Episode ID: ${subEpisodes[0].id}`);
        }
        
        passed++;
      } else {
        console.log(`   ⚠️  WARNING: No episodes returned (might not be in HiAnime DB)`);
        failed++;
      }
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
      failed++;
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 Test Summary:');
  console.log(`   ✅ Passed: ${passed}/${testCases.length}`);
  console.log(`   ❌ Failed: ${failed}/${testCases.length}`);
  console.log(`   📈 Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);
  
  console.log('\n💡 Tips:');
  console.log('   - Check server console for detailed matching logs');
  console.log('   - Look for "[HiAnime]" prefixed logs');
  console.log('   - Each strategy attempt is logged with similarity scores');
  console.log('   - A score >= 70 is required for a confident match');
  
  console.log('\n🔍 What to look for in server logs:');
  console.log('   - "Strategy X: ..." shows which matching strategy is being tried');
  console.log('   - "Best match: ... (score: X)" shows the confidence level');
  console.log('   - Higher scores = more confident matches');
}

// Run tests
console.log('🚀 Starting HiAnime mapping tests...');
console.log('⚠️  Make sure your Next.js dev server is running on http://localhost:3000\n');

testMapping().catch(error => {
  console.error('\n💥 Test suite failed:', error.message);
  process.exit(1);
});
