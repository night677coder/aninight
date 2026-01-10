import { AdvancedSearch } from '@/lib/Anilistfunctions';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'POPULARITY_DESC';
    const genre = searchParams.get('genre') || '';

    // Use AdvancedSearch to get all anime with pagination
    const result = await AdvancedSearch(
      search, // search term
      null, // year
      null, // season
      null, // format
      genre ? [{ type: 'genres', value: genre }] : [], // genres as array of objects with correct type
      sort, // sort by
      page // page
    );

    if (!result) {
      return Response.json(
        { error: 'Failed to fetch anime data' },
        { status: 500 }
      );
    }

    // AdvancedSearch returns data.data.Page which has media array and pageInfo
    const animeList = result.media || [];
    const hasNextPage = result.pageInfo?.hasNextPage || false;

    // Return the results with pagination info
    return Response.json({
      results: animeList,
      currentPage: page,
      hasNextPage: hasNextPage,
      totalResults: animeList.length
    });

  } catch (error) {
    console.error('Error in all anime API:', error);
    return Response.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
