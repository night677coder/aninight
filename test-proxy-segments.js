// Test if external proxy properly handles segment URLs
// Run with: node test-proxy-segments.js

const testProxySegments = async () => {
  console.log('🧪 Testing Proxy Segment Handling\n');

  try {
    // Get a fresh stream URL
    const animeSession = '7696aea0afd47e95382e0e7a8f8e3c5ab0674c09af70b0bf797f93990505d7b6';
    const episodeSession = 'c0abb7b3048282a3016a810f74ac140582e5c643ff490f510c4795edca932f6e';
    
    const apiUrl = `https://animepahe-api-iota.vercel.app/api/play/${animeSession}?episodeId=${episodeSession}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (!data.sources || data.sources.length === 0) {
      console.error('❌ No sources found');
      return;
    }
    
    const testSource = data.sources[0];
    console.log(`Testing with: ${testSource.resolution || 'unknown'}p quality\n`);
    
    // Test external proxy
    const externalProxy = 'https://gogoanime-and-hianime-proxy-pi.vercel.app/m3u8-proxy?url=';
    const proxiedUrl = `${externalProxy}${encodeURIComponent(testSource.url)}`;
    
    console.log('Step 1: Fetching M3U8 through external proxy...');
    const proxyResponse = await fetch(proxiedUrl);
    
    if (!proxyResponse.ok) {
      console.error(`❌ Proxy failed: ${proxyResponse.status}`);
      return;
    }
    
    const m3u8Content = await proxyResponse.text();
    console.log('✓ M3U8 fetched successfully\n');
    
    // Check if it's a master playlist or segment playlist
    const isMaster = m3u8Content.includes('#EXT-X-STREAM-INF');
    const hasSegments = m3u8Content.includes('#EXTINF');
    
    console.log(`Playlist type: ${isMaster ? 'Master (multiple qualities)' : 'Segment (single quality)'}`);
    console.log(`Has segments: ${hasSegments}\n`);
    
    // Extract URLs from the playlist
    const lines = m3u8Content.split('\n');
    const urls = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && !line.startsWith('#')) {
        urls.push(line);
      }
    }
    
    console.log(`Found ${urls.length} URLs in playlist\n`);
    
    if (urls.length === 0) {
      console.error('❌ No URLs found in playlist');
      return;
    }
    
    // Check first few URLs
    console.log('Checking URL format:');
    for (let i = 0; i < Math.min(3, urls.length); i++) {
      const url = urls[i];
      const isProxied = url.includes('gogoanime-and-hianime-proxy') || url.includes('m3u8-proxy');
      const isDirect = url.startsWith('http') && !isProxied;
      const isRelative = !url.startsWith('http');
      
      console.log(`\nURL ${i + 1}:`);
      console.log(`  ${url.substring(0, 80)}...`);
      console.log(`  Type: ${isProxied ? '✓ Proxied' : isDirect ? '✗ Direct (will fail)' : '? Relative'}`);
      
      // If it's a direct URL to owocdn, it will fail
      if (isDirect && url.includes('owocdn.top')) {
        console.log('  ⚠️  WARNING: Direct owocdn URL will cause 403 errors!');
      }
    }
    
    // Test fetching a segment if available
    if (hasSegments && urls.length > 0) {
      const segmentUrl = urls.find(u => u.includes('.ts') || (!u.includes('.m3u8') && u.startsWith('http')));
      
      if (segmentUrl) {
        console.log('\n\nStep 2: Testing segment fetch...');
        console.log(`Segment URL: ${segmentUrl.substring(0, 80)}...`);
        
        try {
          const segmentResponse = await fetch(segmentUrl, { method: 'HEAD' });
          console.log(`Status: ${segmentResponse.status} ${segmentResponse.statusText}`);
          
          if (segmentResponse.ok) {
            console.log('✅ Segment fetch successful!');
          } else {
            console.log('❌ Segment fetch failed - this is why playback stops!');
          }
        } catch (err) {
          console.log(`❌ Segment fetch error: ${err.message}`);
        }
      }
    }
    
    // Conclusion
    console.log('\n\n=== DIAGNOSIS ===');
    if (urls.some(u => u.includes('owocdn.top') && !u.includes('m3u8-proxy'))) {
      console.log('❌ PROBLEM FOUND: External proxy is NOT rewriting segment URLs');
      console.log('   The M3U8 contains direct owocdn.top URLs which will fail with 403');
      console.log('\n💡 SOLUTION: Use local proxy instead, which properly rewrites all URLs');
      console.log('   Remove VITE_M3U8_PROXY_URL from .env to use local proxy');
    } else if (urls.some(u => u.includes('m3u8-proxy'))) {
      console.log('✅ External proxy IS rewriting URLs correctly');
      console.log('   Issue might be elsewhere (check browser console for details)');
    } else {
      console.log('⚠️  URLs are relative - need to check how player resolves them');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testProxySegments();
