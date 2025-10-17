// Test the external proxy with a regular GogoAnime URL
const testUrl = 'https://gogocdn.net/videos/test.m3u8'; // Example URL
const EXTERNAL_PROXY = 'https://final-prox.vercel.app/m3u8-proxy?url=';

async function testProxy() {
    console.log('Testing external proxy with GogoAnime URL...\n');
    
    const proxiedUrl = `${EXTERNAL_PROXY}${encodeURIComponent(testUrl)}`;
    console.log('Proxied URL:', proxiedUrl);
    
    try {
        const response = await fetch(proxiedUrl);
        console.log('Status:', response.status);
        console.log('Content-Type:', response.headers.get('content-type'));
        
        if (response.ok) {
            const text = await response.text();
            console.log('Response preview:', text.substring(0, 300));
        } else {
            const error = await response.text();
            console.log('Error response:', error);
        }
    } catch (error) {
        console.log('Fetch error:', error.message);
    }
}

testProxy();
