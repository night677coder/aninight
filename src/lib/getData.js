import { checkEnvironment } from "./checkEnvironment";

export const getRecentEpisodes = async () => {
  try {
    const response = await fetch(
      `${checkEnvironment()}/api/recent`, { cache: "no-store" }
    );
    if (!response.ok) {
      throw new Error('Failed to fetch recent episodes')
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Anify Recent Episodes:", error);
  }
}

export const getEpisodes = async (id, idMal, status, refresh = false, retryCount = 0) => {
  const maxRetries = 2;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(
      `${checkEnvironment()}/api/episode/${id}?idMal=${idMal}&releasing=${status === "RELEASING" ? "true" : "false"}&refresh=${refresh}`,
      {
        next: { revalidate: status === "FINISHED" ? false : 3600 },
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch episodes: ${response.status} ${response.statusText}`)
    }

    const data = await response.json();

    if ((!data || data.length === 0) && retryCount < maxRetries) {
      console.log(`Retrying episode fetch for ${id}, attempt ${retryCount + 1}`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return getEpisodes(id, idMal, status, refresh, retryCount + 1);
    }

    return data;
  } catch (error) {
    console.error("Error fetching Consumet Episodes:", error.message || error);

    if (retryCount < maxRetries && (error.name === 'AbortError' || error.message.includes('fetch'))) {
      console.log(`Retrying episode fetch for ${id} after error, attempt ${retryCount + 1}`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return getEpisodes(id, idMal, status, refresh, retryCount + 1);
    }

    return [];
  }
}

export const getSources = async (id, provider, epid, epnum, subdub, server = null, animeSession = null, episodeSession = null) => {
  try {
    const requestBody = {
      source: provider === 'gogoanime' || provider === 'gogobackup' || provider === 'hianime' ? 'consumet' : 'anify',
      provider: `${provider === "gogobackup" ? 'gogoanime' : provider}`,
      episodeid: epid,
      episodenum: epnum,
      subtype: subdub
    };

    if (provider === 'hianime' && server) {
      requestBody.server = server;
    }

    if (provider === 'animepahe' && animeSession && episodeSession) {
      requestBody.animeSession = animeSession;
      requestBody.episodeSession = episodeSession;
    }

    console.log(`[getSources] Provider: ${provider}, Source: ${requestBody.source}, Episode ID: ${epid}`);

    const response = await fetch(`${checkEnvironment()}/api/source/${id}`, {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (!response.ok) {
      throw new Error('Failed to fetch episodes')
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Episode sources:", error);
  }
}

export const getHiAnimeServers = async (animeEpisodeId) => {
  try {
    const response = await fetch(
      `${checkEnvironment()}/api/hianime/servers?animeEpisodeId=${encodeURIComponent(animeEpisodeId)}`,
      { cache: "no-store" }
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch HiAnime servers: ${response.status}`)
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching HiAnime servers:", error);
    return null;
  }
}

export const getHiAnimeSources = async (animeEpisodeId, server = 'hd-1', category = 'sub') => {
  try {
    const params = new URLSearchParams({
      animeEpisodeId,
      server,
      category
    });
    
    const response = await fetch(
      `${checkEnvironment()}/api/hianime/sources?${params}`,
      { cache: "no-store" }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch HiAnime sources: ${response.status}`)
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching HiAnime sources:", error);
    return null;
  }
}

export const getAnimePaheSources = async (animeSession, episodeSession, subtype = 'sub') => {
  try {
    const params = new URLSearchParams({
      animeSession,
      episodeSession,
      subtype
    });
    
    const response = await fetch(
      `${checkEnvironment()}/api/animepahe/sources?${params}`,
      { cache: "no-store" }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch AnimePahe sources: ${response.status}`)
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching AnimePahe sources:", error);
    return null;
  }
}
