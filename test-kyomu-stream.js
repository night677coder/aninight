// Test Kyomu streaming URL with different headers
const testUrl = 'https://vault-15.owocdn.top/stream/15/11/c0abb7b3048282a3016a810f74ac140582e5c643ff490f510c4795edca932f6e/uwu.m3u8';

async function testHeaders() {
  console.log('Testing Kyomu stream URL with different headers...\n');
  
  // Test 1: No special headers
  console.log('1. Testing with basic headers...');
  try {
    const response1 = await fetch(testUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    console.log(`Status: ${response1.status}`);
    if (response1.ok) {
      const text = await response1.text();
      console.log(`Content length: ${text.length}`);
      console.log(`First 200 chars: ${text.substring(0, 200)}\n`);
    }
  } catch (e) {
    console.log(`Error: ${e.message}\n`);
  }
  
  // Test 2: With Referer
  console.log('2. Testing with Referer: https://animepahe.com/...');
  try {
    const response2 = await fetch(testUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://animepahe.com/'
      }
    });
    console.log(`Status: ${response2.status}`);
    if (response2.ok) {
      const text = await response2.text();
      console.log(`Content length: ${text.length}`);
      console.log(`First 200 chars: ${text.substring(0, 200)}\n`);
    }
  } catch (e) {
    console.log(`Error: ${e.message}\n`);
  }
  
  // Test 3: With Origin
  console.log('3. Testing with Origin: https://animepahe.com...');
  try {
    const response3 = await fetch(testUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Origin': 'https://animepahe.com'
      }
    });
    console.log(`Status: ${response3.status}`);
    if (response3.ok) {
      const text = await response3.text();
      console.log(`Content length: ${text.length}`);
      console.log(`First 200 chars: ${text.substring(0, 200)}\n`);
    }
  } catch (e) {
    console.log(`Error: ${e.message}\n`);
  }
  
  // Test 4: With both Referer and Origin
  console.log('4. Testing with both Referer and Origin...');
  try {
    const response4 = await fetch(testUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://animepahe.com/',
        'Origin': 'https://animepahe.com'
      }
    });
    console.log(`Status: ${response4.status}`);
    if (response4.ok) {
      const text = await response4.text();
      console.log(`Content length: ${text.length}`);
      console.log(`First 200 chars: ${text.substring(0, 200)}\n`);
    }
  } catch (e) {
    console.log(`Error: ${e.message}\n`);
  }
}

testHeaders();
