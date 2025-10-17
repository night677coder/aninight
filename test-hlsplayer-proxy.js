// Test hlsplayer.org proxy endpoints
const testUrl = 'https://vault.kyomu.cc/hls/test.m3u8';

async function testProxyEndpoints() {
    console.log('Testing hlsplayer.org proxy endpoints...\n');

    // Test 1: /proxy endpoint
    console.log('1. Testing /proxy endpoint:');
    try {
        const proxyUrl = `https://www.hlsplayer.org/proxy?url=${encodeURIComponent(testUrl)}`;
        console.log('   URL:', proxyUrl);
        const response = await fetch(proxyUrl);
        console.log('   Status:', response.status);
        console.log('   Content-Type:', response.headers.get('content-type'));
        const text = await response.text();
        console.log('   Response preview:', text.substring(0, 200));
    } catch (error) {
        console.log('   Error:', error.message);
    }

    console.log('\n2. Testing /api/proxy endpoint:');
    try {
        const apiProxyUrl = `https://www.hlsplayer.org/api/proxy?url=${encodeURIComponent(testUrl)}`;
        console.log('   URL:', apiProxyUrl);
        const response = await fetch(apiProxyUrl);
        console.log('   Status:', response.status);
        console.log('   Content-Type:', response.headers.get('content-type'));
        const text = await response.text();
        console.log('   Response preview:', text.substring(0, 200));
    } catch (error) {
        console.log('   Error:', error.message);
    }

    console.log('\n3. Testing /play page (for reference):');
    try {
        const playUrl = `https://www.hlsplayer.org/play?url=${encodeURIComponent(testUrl)}`;
        console.log('   URL:', playUrl);
        const response = await fetch(playUrl);
        console.log('   Status:', response.status);
        console.log('   Content-Type:', response.headers.get('content-type'));
        const text = await response.text();
        console.log('   Response preview:', text.substring(0, 200));
    } catch (error) {
        console.log('   Error:', error.message);
    }

    console.log('\n4. Direct fetch (for comparison):');
    try {
        console.log('   URL:', testUrl);
        const response = await fetch(testUrl);
        console.log('   Status:', response.status);
        console.log('   Content-Type:', response.headers.get('content-type'));
        const text = await response.text();
        console.log('   Response preview:', text.substring(0, 200));
    } catch (error) {
        console.log('   Error:', error.message);
    }
}

testProxyEndpoints();
