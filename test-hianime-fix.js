// Test script to verify HiAnime episode ID formatting
const axios = require('axios');

async function testHiAnimeEpisode() {
  console.log('🧪 Testing HiAnime Episode ID Formatting\n');
  
  const testCases = [
    {
      name: 'Dragon Ball Episode',
      episodeId: 'dragon-ball-509?ep=10218',
      expected: 'dragon-ball-509$episode$10218'
    },
    {
      name: 'Frieren Episode',
      episodeId: 'frieren-beyond-journeys-end-18413?ep=88838',
      expected: 'frieren-beyond-journeys-end-18413$episode$88838'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📝 Test: ${testCase.name}`);
    console.log(`   Input:    ${testCase.episodeId}`);
    console.log(`   Expected: ${testCase.expected}`);
    
    try {
      const response = await axios.post('http://localhost:3000/api/source/test', {
        source: 'consumet',
        provider: 'hianime',
        episodeid: testCase.episodeId,
        episodenum: '1',
        subtype: 'sub'
      });

      if (response.data && response.data.sources && response.data.sources.length > 0) {
        console.log(`   ✅ SUCCESS: Got ${response.data.sources.length} source(s)`);
        console.log(`   📺 Quality: ${response.data.sources[0].quality}`);
        console.log(`   🔗 Has URL: ${!!response.data.sources[0].url}`);
      } else {
        console.log(`   ❌ FAILED: No sources returned`);
      }
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
    }
  }

  console.log('\n\n📊 Summary:');
  console.log('If you see ✅ SUCCESS for all tests, the fix is working!');
  console.log('\nCheck your server console for these logs:');
  console.log('  - [EPISODE ID FORMATTING]');
  console.log('  - Original ID: ...');
  console.log('  - Formatted ID: ...');
  console.log('\nThe formatted ID should use $episode$ instead of ?ep=');
}

testHiAnimeEpisode().catch(console.error);
