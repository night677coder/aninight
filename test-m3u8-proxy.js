// Test script for M3U8 proxy with Kyomu streams
// Run with: node test-m3u8-proxy.js

const testKyomuProxy = async () => {
  console.log('🧪 Testing Kyomu M3U8 Proxy\n');

  // Step 1: Get a fresh stream URL from Kyomu API
  console.log('Step 1: Fetching fresh stream from Kyomu API...');
  
  try {
    // Example: Solo Leveling S2 Episode 1
    const animeSession = '7696aea0afd47e95382e0e7a8f8e3c5ab0674c09af70b0bf797f93990505d7b6';
    const episodeSession = 'c0abb7b3048282a3016a810f74ac140582e5c643ff490f510c4795edca932f6e';
    
    const apiUrl = `https://animepahe-api-iota.vercel.app/api/play/${animeSession}?episodeId=${episodeSession}`;
    console.log(`API URL: ${apiUrl}\n`);
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (!data.sources || data.sources.length === 0) {
      console.error('❌ No sources found in API response');
      return;
    }
    
    console.log(`✓ Found ${data.sources.length} sources\n`);
    
    // Step 2: Test direct access to M3U8 (should fail without headers)
    const testSource = data.sources[0];
    console.log('Step 2: Testing direct M3U8 access (without headers)...');
    console.log(`URL: ${testSource.url.substring(0, 80)}...`);
    
    try {
      const directResponse = await fetch(testSource.url);
      console.log(`Status: ${directResponse.status} ${directResponse.statusText}`);
      if (directResponse.status === 403) {
        console.log('✓ Expected 403 - anti-hotlinking is active\n');
      }
    } catch (err) {
      console.log(`✗ Connection error: ${err.message}\n`);
    }
    
    // Step 3: Test with correct headers
    console.log('Step 3: Testing with Kwik headers...');
    const headers = {
      'Referer': 'https://kwik.cx/',
      'Origin': 'https://kwik.cx',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': '*/*'
    };
    
    try {
      const headerResponse = await fetch(testSource.url, { headers });
      console.log(`Status: ${headerResponse.status} ${headerResponse.statusText}`);
      
      if (headerResponse.ok) {
        const text = await headerResponse.text();
        console.log('✓ Success! M3U8 content received');
        console.log(`Content preview: ${text.substring(0, 100)}...\n`);
        
        // Step 4: Show proxy URL format
        console.log('Step 4: Proxy URL format for your app:');
        const proxyUrl = `http://localhost:3000/api/m3u8-proxy?url=${encodeURIComponent(testSource.url)}`;
        console.log(proxyUrl);
        console.log('\n✅ Test complete! Your proxy should work with this URL.');
      } else {
        console.log('❌ Still getting error with headers');
        const errorText = await headerResponse.text();
        console.log(`Response: ${errorText.substring(0, 200)}`);
      }
    } catch (err) {
      console.log(`✗ Error: ${err.message}`);
      console.log('⚠️  The stream URL may be expired or the CDN is unreachable');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testKyomuProxy();
