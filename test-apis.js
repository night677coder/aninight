// Test script to verify video streaming APIs
const testUrls = [
  'https://aninight.vercel.app/api/debug',
  'https://aninight.vercel.app/api/source/test?provider=gogoanime&source=consumet&episodeid=test&episodenum=1&subtype=sub'
];

console.log('Testing video streaming APIs...\n');

testUrls.forEach(async (url, index) => {
  try {
    console.log(`Test ${index + 1}: ${url}`);
    const response = await fetch(url);
    const data = await response.json();
    console.log('✅ Success:', JSON.stringify(data, null, 2));
    console.log('---');
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('---');
  }
});
