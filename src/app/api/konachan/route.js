export async function GET(request) {
  try {
    // Get the URL parameters from the request
    const { searchParams } = new URL(request.url);
    
    // Extract the parameters we need
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';
    const tags = searchParams.get('tags') || '';
    const rating = searchParams.get('rating') || 'safe';
    const order = searchParams.get('order') || '';
    
    // Build the tag query
    let tagQuery = tags;
    if (rating) {
      tagQuery += ` rating:${rating}`;
    }
    
    // Determine sort order parameter
    let orderParam = '';
    if (order) {
      orderParam = `&order=${order}`;
    }
    
    // Build the API URL
    const apiUrl = `https://konachan.net/post.json?page=${page}&limit=${limit}&tags=${encodeURIComponent(tagQuery.trim())}${orderParam}`;
    
    // Fetch data from Konachan API
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Return the data with proper headers
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=60, s-maxage=60'
      }
    });
  } catch (error) {
    console.error('Error fetching from Konachan API:', error);
    
    // Return an error response
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch data from Konachan API',
        message: error.message 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
