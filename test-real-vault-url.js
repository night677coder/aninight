// Test the external proxy with real vault URL
const testUrl = 'https://vault-15.owocdn.top/stream/15/11/c0abb7b3048282a3016a810f74ac140582e5c643ff490f510c4795edca932f6e/uwu.m3u8';
const EXTERNAL_PROXY = 'https://final-prox.vercel.app/m3u8-proxy?url=';

async function testProxy() {
    console.log('Testing external proxy with real vault URL...\n');
    
    const proxiedUrl = `${EXTERNAL_PROXY}${encodeURIComponent(testUrl)}`;
    console.log('Original URL:', testUrl);
    console.log('Proxied URL:', proxiedUrl);
    console.log('');
    
    try {
        const response = await fetch(proxiedUrl);
        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);
        console.log('Content-Type:', response.headers.get('content-type'));
        console.log('');
        
        if (response.ok) {
            const text = await response.text();
            console.log('SUCCESS! Response length:', text.length);
            console.log('Response preview:');
            console.log(text.substring(0, 500));
        } else {
            const error = await response.text();
            console.log('ERROR Response:');
            console.log(error);
        }
    } catch (error) {
        console.log('Fetch error:', error.message);
        console.log('Stack:', error.stack);
    }
}

testProxy();
