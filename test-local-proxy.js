// Test local proxy with vault URL
const testUrl = 'https://vault-15.owocdn.top/stream/15/11/c0abb7b3048282a3016a810f74ac140582e5c643ff490f510c4795edca932f6e/uwu.m3u8';

async function testLocalProxy() {
    console.log('Testing local proxy...\n');
    
    const proxiedUrl = `http://localhost:3000/api/m3u8-proxy?url=${encodeURIComponent(testUrl)}`;
    console.log('Proxied URL:', proxiedUrl);
    console.log('');
    
    try {
        const response = await fetch(proxiedUrl);
        console.log('Status:', response.status);
        console.log('Content-Type:', response.headers.get('content-type'));
        console.log('');
        
        if (response.ok) {
            const text = await response.text();
            console.log('Response length:', text.length);
            console.log('');
            console.log('First 1000 characters:');
            console.log(text.substring(0, 1000));
            console.log('');
            
            // Check for segment URLs
            const lines = text.split('\n');
            const segmentLines = lines.filter(line => 
                !line.startsWith('#') && line.trim() && !line.includes('EXTM3U')
            );
            console.log('Sample segment URLs:');
            segmentLines.slice(0, 3).forEach(url => console.log(url));
        } else {
            const error = await response.text();
            console.log('Error:', error);
        }
    } catch (error) {
        console.log('Fetch error:', error.message);
    }
}

testLocalProxy();
