"use client"

/**
 * Utility functions for interacting with the Konachan API
 * Konachan is an image board focused on anime wallpapers and artwork
 */

/**
 * Fetch images from the Konachan API
 * @param {Object} options - Options for the API request
 * @param {number} options.page - Page number to fetch (default: 1)
 * @param {string} options.tags - Space-separated tags to search for
 * @param {number} options.limit - Number of images to fetch per page (default: 20)
 * @param {string} options.rating - Image rating filter (safe, questionable, explicit)
 * @param {string} options.order - Sort order (date, popularity, random)
 * @param {string} options.resolution - Specific resolution to filter by (e.g., '1920x1080')
 * @returns {Promise<Array>} - Array of image objects
 */
export const fetchImages = async ({
  page = 1,
  tags = '',
  limit = 20,
  rating = 'safe',
  order = 'date',
  resolution = ''
}) => {
  try {
    // Build tag query
    let tagQuery = tags || '';
    
    // Add rating filter
    if (rating) {
      tagQuery += ` rating:${rating}`;
    }
    
    // Add resolution filter if specified
    if (resolution) {
      const [width, height] = resolution.split('x');
      tagQuery += ` width:${width} height:${height}`;
    }
    
    // Determine sort order parameter
    let orderParam = '';
    switch (order) {
      case 'popularity':
        orderParam = '&order=popularity';
        break;
      case 'random':
        orderParam = '&order=random';
        break;
      default:
        orderParam = ''; // Default is date
    }
    
    // Build the API URL to our own proxy endpoint
    const apiUrl = `/api/konachan?page=${page}&limit=${limit}&tags=${encodeURIComponent(tagQuery.trim())}&rating=${rating}${orderParam}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Process the data to ensure we have all required fields
    return data.map(image => ({
      id: image.id,
      tags: image.tags,
      preview_url: image.preview_url,
      sample_url: image.sample_url,
      file_url: image.file_url,
      width: image.width,
      height: image.height,
      sample_width: image.sample_width,
      sample_height: image.sample_height,
      file_size: image.file_size,
      rating: image.rating,
      score: image.score,
      created_at: image.created_at
    }));
  } catch (error) {
    console.error('Error fetching images from Konachan:', error);
    return [];
  }
};

/**
 * Get image details by ID
 * @param {number} id - Image ID
 * @returns {Promise<Object|null>} - Image details or null if not found
 */
export const getImageById = async (id) => {
  try {
    const apiUrl = `/api/konachan?tags=id:${id}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error fetching image details:', error);
    return null;
  }
};

/**
 * Get popular tags from Konachan
 * @param {number} limit - Number of tags to fetch (default: 20)
 * @returns {Promise<Array>} - Array of tag objects
 */
export const getPopularTags = async (limit = 20) => {
  try {
    const apiUrl = `https://konachan.net/tag.json?order=count&limit=${limit}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching popular tags:', error);
    return [];
  }
};
