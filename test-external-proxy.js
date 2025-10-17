// Test script for external M3U8 proxy with Kyomu streams
// Run with: node test-external-proxy.js

const testExternalProxy = async () => {
  console.log('🧪 Testing External M3U8 Proxy with Kyomu\n');

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
    
    // Step 2: Test external proxy
    const testSource = data.sources[0];
    const externalProxyUrl = 'https://gogoanime-and-hianime-proxy-pi.vercel.app/m3u8-proxy?url=';
    const proxiedUrl = `${externalProxyUrl}${encodeURIComponent(testSource.url)}`;
    
    console.log('Step 2: Testing external proxy...');
    console.log(`Original URL: ${testSource.url.substring(0, 80)}...`);
    console.log(`Proxied URL: ${proxiedUrl.substring(0, 120)}...\n`);
    
    try {
      const proxyResponse = await fetch(proxiedUrl);
      console.log(`Status: ${proxyResponse.status} ${proxyResponse.statusText}`);
      
      if (proxyResponse.ok) {
        const text = await proxyResponse.text();
        
        // Check if it's valid M3U8
        if (text.startsWith('#EXTM3U')) {
          console.log('✅ Success! Valid M3U8 content received');
          console.log(`Content preview:\n${text.substring(0, 200)}...\n`);
          
          // Check if URLs are properly proxied
          if (text.includes(externalProxyUrl)) {
            console.log('✓ URLs in playlist are properly proxied');
          } else {
            console.log('⚠️  URLs in playlist may not be proxied (check if needed)');
          }
          
          console.log('\n✅ External proxy is working correctly!');
          console.log('Your Kyomu streams should now work in the app.');
        } else {
          console.log('⚠️  Response is not valid M3U8 format');
          console.log(`Content: ${text.substring(0, 200)}`);
        }
      } else {
        console.log('❌ Proxy returned error');
        const errorText = await proxyResponse.text();
        console.log(`Response: ${errorText.substring(0, 300)}`);
      }
    } catch (err) {
      console.log(`✗ Error: ${err.message}`);
      console.log('⚠️  The external proxy may be down or unreachable');
    }
    
    // Step 3: Test all qualities
    console.log('\nStep 3: Testing all available qualities...');
    for (const source of data.sources.slice(0, 3)) { // Test first 3
      const quality = source.resolution || 'unknown';
      const isDub = source.isDub ? '(DUB)' : '(SUB)';
      console.log(`\nTesting ${quality}p ${isDub}...`);
      
      const testUrl = `${externalProxyUrl}${encodeURIComponent(source.url)}`;
      try {
        const testResponse = await fetch(testUrl, { method: 'HEAD' });
        console.log(`  ${testResponse.ok ? '✓' : '✗'} ${testResponse.status} ${testResponse.statusText}`);
      } catch (err) {
        console.log(`  ✗ ${err.message}`);
      }
    }
    
    console.log('\n✅ Test complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testExternalProxy();
