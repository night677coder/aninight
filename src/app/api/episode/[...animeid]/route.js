import { NextResponse } from "next/server";
import { getAnilistData, getHiAnimeId, getHiAnimeEpisodes } from "@/lib/hianime";
import { getAnilistDataForAnimePahe, getAnimePaheSession, getAnimePaheEpisodes } from "@/lib/animepahe";

export const runtime = 'nodejs';
export const maxDuration = 30;

// Fetch episodes from Consumet API with pagination support
async function getConsumetEpisodes(anilistId, retryCount = 0) {
  const maxRetries = 2;

  try {
    console.log(`[Consumet] Attempt ${retryCount + 1}/${maxRetries + 1} for AniList ID: ${anilistId}`);

    // Fetch with provider parameter to get all episodes
    // Try gogoanime provider which typically has complete episode lists
    const response = await fetch(
      `https://consumet-six-alpha.vercel.app/meta/anilist/episodes/${anilistId}?provider=gogoanime&fetchFiller=true`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        signal: AbortSignal.timeout(15000) // 15 second timeout for larger responses
      }
    );

    if (!response.ok) {
      throw new Error(`Consumet API returned ${response.status}`);
    }

    const data = await response.json();

    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('No episodes returned from Consumet');
    }

    console.log(`[Consumet] ✅ Retrieved ${data.length} episodes`);
    return data;

  } catch (error) {
    console.error(`[Consumet] Attempt ${retryCount + 1} failed:`, error.message);

    if (retryCount < maxRetries) {
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return getConsumetEpisodes(anilistId, retryCount + 1);
    }

    return null;
  }
}

export const GET = async (req, { params }) => {
  const anilistId = params.animeid[0];

  try {
    console.log(`\n🎬 Processing AniList ID: ${anilistId}`);

    const providers = [];

    // Special handling for ID 21 - skip Consumet, only use AnimePahe and HiAnime
    const skipConsumet = anilistId === '21';
    if (skipConsumet) {
      console.log(`[Special] ID 21 detected - skipping Consumet, using AnimePahe and HiAnime only`);
    }

    // Fetch HiAnime episodes FIRST (default provider)
    try {
      console.log(`[HiAnime] Processing...`);

      // Skip Consumet for ID 21, otherwise try Consumet first
      let episodes = null;
      if (!skipConsumet) {
        episodes = await getConsumetEpisodes(anilistId);
      }

      if (episodes && episodes.length > 0) {
        // Transform Consumet episodes to our format
        const transformedEpisodes = episodes.map(ep => ({
          id: ep.id,
          number: ep.number,
          title: ep.title || `Episode ${ep.number}`,
          image: ep.image,
          episodeId: ep.id
        }));

        console.log(`[HiAnime] ✅ Using Consumet episodes: ${transformedEpisodes.length}`);
        providers.push({
          consumet: true,
          providerId: "hianime",
          episodes: {
            sub: transformedEpisodes,
            dub: transformedEpisodes,
          },
        });
      } else {
        // Fallback to mapping (or primary method for ID 21)
        console.log(`[HiAnime] ${skipConsumet ? 'Using' : 'Consumet failed, trying'} mapping...`);
        const anilistData = await getAnilistData(anilistId);

        if (anilistData) {
          const hiAnimeId = await getHiAnimeId(anilistData);

          if (hiAnimeId) {
            const mappedEpisodes = await getHiAnimeEpisodes(hiAnimeId);

            if (mappedEpisodes.length > 0) {
              console.log(`[HiAnime] ✅ Using mapped episodes: ${mappedEpisodes.length}`);
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
      console.error("[HiAnime] Error:", error.message);
    }

    // Fetch AnimePahe episodes (secondary provider)
    try {
      console.log(`[AnimePahe] Processing...`);
      const anilistData = await getAnilistDataForAnimePahe(anilistId);

      if (anilistData) {
        const session = await getAnimePaheSession(anilistData);

        if (session) {
          const episodes = await getAnimePaheEpisodes(session);

          if (episodes.length > 0) {
            console.log(`[AnimePahe] ✅ Retrieved ${episodes.length} episodes`);
            providers.push({
              consumet: false,
              providerId: "animepahe",
              episodes: episodes,
            });
          }
        }
      }
    } catch (error) {
      console.error("[AnimePahe] Error:", error.message);
    }

    console.log(`\n✅ Total providers found: ${providers.length}\n`);

    return NextResponse.json(providers, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
      }
    });

  } catch (error) {
    console.error("❌ Error:", error.message);
    return NextResponse.json([], { status: 200 });
  }
};
