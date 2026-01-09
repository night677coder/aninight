import { NextResponse } from "next/server";
import { getAnilistData, getHiAnimeId, getHiAnimeEpisodes } from "@/lib/hianime";
import { getAnilistDataForAnimePahe, getAnimePaheSession, getAnimePaheEpisodes } from "@/lib/animepahe";

export const runtime = 'nodejs';
export const maxDuration = 60; // Longer timeout for bulk operations

// Fetch episodes from Consumet API with pagination support
async function getConsumetEpisodes(anilistId, retryCount = 0) {
  const maxRetries = 2;

  try {
    console.log(`[Consumet] Attempt ${retryCount + 1}/${maxRetries + 1} for AniList ID: ${anilistId}`);

    // Fetch with provider parameter to get all episodes
    const response = await fetch(
      `https://consumet-six-alpha.vercel.app/meta/anilist/episodes/${anilistId}?provider=gogoanime&fetchFiller=true`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Consumet API returned ${response.status}`);
    }

    const data = await response.json();

    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('No episodes returned from Consumet');
    }

    console.log(`[Consumet] ✅ Retrieved ${data.length} episodes for ${anilistId}`);
    return data;

  } catch (error) {
    console.error(`[Consumet] Attempt ${retryCount + 1} failed for ${anilistId}:`, error.message);

    if (retryCount < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return getConsumetEpisodes(anilistId, retryCount + 1);
    }

    return null;
  }
}

// Process a single anime ID
async function processAnimeId(anilistId) {
  console.log(`\n🎬 Processing AniList ID: ${anilistId}`);

  const providers = [];

  // Special handling for ID 21 - skip Consumet
  const skipConsumet = anilistId === '21';
  if (skipConsumet) {
    console.log(`[Special] ID 21 detected - skipping Consumet`);
  }

  // Fetch HiAnime episodes FIRST
  try {
    console.log(`[HiAnime] Processing for ${anilistId}...`);

    let episodes = null;
    if (!skipConsumet) {
      episodes = await getConsumetEpisodes(anilistId);
    }

    if (episodes && episodes.length > 0) {
      const transformedEpisodes = episodes.map(ep => ({
        id: ep.id,
        number: ep.number,
        title: ep.title || `Episode ${ep.number}`,
        image: ep.image,
        episodeId: ep.id
      }));

      console.log(`[HiAnime] ✅ Using Consumet episodes: ${transformedEpisodes.length} for ${anilistId}`);
      providers.push({
        consumet: true,
        providerId: "hianime",
        episodes: {
          sub: transformedEpisodes,
          dub: transformedEpisodes,
        },
      });
    } else {
      console.log(`[HiAnime] ${skipConsumet ? 'Using' : 'Consumet failed, trying'} mapping for ${anilistId}...`);
      const anilistData = await getAnilistData(anilistId);

      if (anilistData) {
        const hiAnimeId = await getHiAnimeId(anilistData);

        if (hiAnimeId) {
          const mappedEpisodes = await getHiAnimeEpisodes(hiAnimeId);

          if (mappedEpisodes.length > 0) {
            console.log(`[HiAnime] ✅ Using mapped episodes: ${mappedEpisodes.length} for ${anilistId}`);
            providers.push({
              consumet: true,
              providerId: "hianime",
              episodes: {
                sub: mappedEpisodes,
                dub: mappedEpisodes,
              },
            });
          }
        }
      }
    }
  } catch (error) {
    console.error(`[HiAnime] Error for ${anilistId}:`, error.message);
  }

  // Fetch AnimePahe episodes
  try {
    console.log(`[AnimePahe] Processing for ${anilistId}...`);
    const anilistData = await getAnilistDataForAnimePahe(anilistId);

    if (anilistData) {
      const session = await getAnimePaheSession(anilistData);

      if (session) {
        const episodes = await getAnimePaheEpisodes(session);

        if (episodes.length > 0) {
          console.log(`[AnimePahe] ✅ Retrieved ${episodes.length} episodes for ${anilistId}`);
          providers.push({
            consumet: false,
            providerId: "animepahe",
            episodes: {
              sub: episodes,
              dub: [],
            },
          });
        }
      }
    }
  } catch (error) {
    console.error(`[AnimePahe] Error for ${anilistId}:`, error.message);
  }

  console.log(`✅ Total providers found for ${anilistId}: ${providers.length}`);
  return {
    animeId: anilistId,
    providers: providers,
    providerDetails: providers.map(p => ({
      providerId: p.providerId,
      consumet: p.consumet,
      episodeCount: p.episodes?.sub?.length || p.episodes?.dub?.length || 0
    }))
  };
}

export const POST = async (req) => {
  try {
    const body = await req.json();
    const { animeIds } = body;

    if (!animeIds || !Array.isArray(animeIds) || animeIds.length === 0) {
      return NextResponse.json(
        { error: 'animeIds array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (animeIds.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 anime IDs allowed per request' },
        { status: 400 }
      );
    }

    console.log(`\n🚀 Starting bulk episode fetch for ${animeIds.length} anime IDs:`, animeIds);

    const results = [];
    const errors = [];

    // Process anime IDs sequentially to avoid overwhelming the APIs
    for (const animeId of animeIds) {
      try {
        const result = await processAnimeId(animeId);
        results.push(result);
      } catch (error) {
        console.error(`❌ Error processing anime ID ${animeId}:`, error.message);
        errors.push({
          animeId: animeId,
          error: error.message
        });
      }

      // Small delay between requests to be respectful to APIs
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n✅ Bulk fetch completed. Processed: ${results.length}, Errors: ${errors.length}`);

    return NextResponse.json({
      success: true,
      results: results,
      errors: errors,
      summary: {
        totalRequested: animeIds.length,
        successful: results.length,
        failed: errors.length
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
      }
    });

  } catch (error) {
    console.error("❌ Bulk episode fetch error:", error.message);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
};

// Also support GET for simple cases with query params
export const GET = async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get('ids');

    if (!idsParam) {
      return NextResponse.json(
        { error: 'ids query parameter is required (comma-separated anime IDs)' },
        { status: 400 }
      );
    }

    const animeIds = idsParam.split(',').map(id => id.trim()).filter(id => id);

    if (animeIds.length === 0) {
      return NextResponse.json(
        { error: 'No valid anime IDs provided' },
        { status: 400 }
      );
    }

    if (animeIds.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 anime IDs allowed for GET requests' },
        { status: 400 }
      );
    }

    console.log(`\n🚀 Starting bulk episode fetch (GET) for ${animeIds.length} anime IDs:`, animeIds);

    const results = [];
    const errors = [];

    for (const animeId of animeIds) {
      try {
        const result = await processAnimeId(animeId);
        results.push(result);
      } catch (error) {
        console.error(`❌ Error processing anime ID ${animeId}:`, error.message);
        errors.push({
          animeId: animeId,
          error: error.message
        });
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n✅ Bulk fetch completed. Processed: ${results.length}, Errors: ${errors.length}`);

    return NextResponse.json({
      success: true,
      results: results,
      errors: errors,
      summary: {
        totalRequested: animeIds.length,
        successful: results.length,
        failed: errors.length
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
      }
    });

  } catch (error) {
    console.error("❌ Bulk episode fetch error:", error.message);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
};
