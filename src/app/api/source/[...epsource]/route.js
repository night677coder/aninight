import axios from 'axios'
import { redis } from '@/lib/rediscache';
import { NextResponse, NextRequest } from "next/server"
import { formatEpisodeId } from '@/utils/EpisodeIdFormatter';

async function consumetEpisode(id, subtype) {
    try {
      // Format episode ID from ?ep= to $episode$ format for streaming API
      const formattedId = formatEpisodeId(id);

      // Use the new URL format with type parameter instead of dub parameter
      const audioType = subtype?.toLowerCase() === 'dub' ? 'dub' : 'sub';

      // Check if API_URI is defined, otherwise use a fallback
      const apiUri = (process.env.API_URI || 'https://api.consumet.org').replace(/\r?\n/g, '').trim();
      if (!process.env.API_URI) {
        console.warn('API_URI environment variable not set, using fallback:', apiUri);
      }

      console.log(`[EPISODE ID FORMATTING]`);
      console.log(`  Original ID: ${id}`);
      console.log(`  Formatted ID: ${formattedId}`);
      console.log(`  Full URL: ${apiUri}/watch?episodeId=${formattedId}&type=${audioType}`);

      const { data } = await axios.get(
        `${apiUri}/watch?episodeId=${formattedId}&type=${audioType}`
      );
      
      console.log(`Received response from Consumet API with ${data?.sources?.length || 0} sources for ${audioType.toUpperCase()} request`);
      
      // Apply m3u8 proxy to sources for CORS handling
      if (data && data.sources) {
        const headers = {};
        if (data.headers?.Referer) {
          headers.Referer = data.headers.Referer;
        }
        if (data.headers?.['User-Agent']) {
          headers['User-Agent'] = data.headers['User-Agent'];
        }
        
        // Use Vercel m3u8 proxy with headers - as used in Player.jsx
        data.sources = data.sources.map(source => {
          if (source.isM3U8 || source.url.includes('.m3u8')) {
            return {
              ...source,
              url: `${process.env.NEXT_PUBLIC_PROXY_URI || 'https://aninight.vercel.app'}/api/m3u8-proxy?url=${encodeURIComponent(source.url)}&headers=${encodeURIComponent(JSON.stringify(headers))}`
            };
          }
          return source;
        });
      }
      
      return data;
    } catch (error) {
      console.error(`Error in consumetEpisode: ${error.message}`);
      return null;
    }
  }

async function zoroEpisode(provider, episodeid, epnum, id, subtype) {
    try {
      const isDub = subtype?.toLowerCase() === 'dub';
      const cleanEpisodeId = episodeid.replace("/watch/", "");
      console.log(`Making Zoro API request for ${isDub ? 'DUB' : 'SUB'} content`);
      
      // For category, pass 'dub' or 'sub' directly based on subtype
      const category = isDub ? 'dub' : 'sub';
      const zoroUri = (process.env.ZORO_URI || 'https://api.zoro.to').replace(/\r?\n/g, '').trim();
      if (!process.env.ZORO_URI) {
        console.warn('ZORO_URI environment variable not set, using fallback:', zoroUri);
      }
      const { data } = await axios.get(`${zoroUri}/anime/episode-srcs?id=${cleanEpisodeId}&server=vidstreaming&category=${category}`);
      
      // Apply m3u8 proxy to sources for CORS handling
      if (data && data.sources) {
        const headers = {};
        if (data.headers?.Referer) {
          headers.Referer = data.headers.Referer;
        }
        
        // Use Vercel m3u8 proxy with headers - as used in Player.jsx
        data.sources = data.sources.map(source => {
          if (source.isM3U8 || source.url.includes('.m3u8')) {
            return {
              ...source,
              url: `${process.env.NEXT_PUBLIC_PROXY_URI || 'https://aninight.vercel.app'}/api/m3u8-proxy?url=${encodeURIComponent(source.url)}&headers=${encodeURIComponent(JSON.stringify(headers))}`
            };
          }
          return source;
        });
      }
      
      return data;
    } catch (error) {
      console.error(`Error in zoroEpisode: ${error.message}`);
      return AnifyEpisode(provider, episodeid, epnum, id, subtype);
    }
  }
  
  async function AnifyEpisode(provider, episodeid, epnum, id, subtype) {
    try {
      const isDub = subtype?.toLowerCase() === 'dub';
      console.log(`Making Anify API request for ${isDub ? 'DUB' : 'SUB'} content, ID: ${id}`);
      
      // Anify API appears to use subType parameter (with capital T)
      const { data } = await axios.get(
        `https://anify.eltik.cc/sources?providerId=${provider}&watchId=${encodeURIComponent(
          episodeid
        )}&episodeNumber=${epnum}&id=${id}&subType=${isDub ? 'dub' : 'sub'}`
      );
      
      // Apply m3u8 proxy to sources for CORS handling
      if (data && data.sources) {
        const headers = {};
        if (data.headers?.Referer) {
          headers.Referer = data.headers.Referer;
        }
        if (data.headers?.['User-Agent']) {
          headers['User-Agent'] = data.headers['User-Agent'];
        }
        
        // Use Vercel m3u8 proxy with headers - as used in Player.jsx
        data.sources = data.sources.map(source => {
          if (source.isM3U8 || source.url.includes('.m3u8')) {
            return {
              ...source,
              url: `${process.env.NEXT_PUBLIC_PROXY_URI || 'https://aninight.vercel.app'}/api/m3u8-proxy?url=${encodeURIComponent(source.url)}&headers=${encodeURIComponent(JSON.stringify(headers))}`
            };
          }
          return source;
        });
      }
      
      return data;
    } catch (error) {
      console.error(`Error in AnifyEpisode: ${error.message}`);
      return null;
    }
  }

async function AnimePaheEpisode(animeSession, episodeSession, subtype) {
  try {
    const ANIMEPAHE_BASE_URL = (process.env.ANIMEPAHE_BASE_URL || 'https://animepahe-api-iota.vercel.app').replace(/\r?\n/g, '').trim();
    if (!process.env.ANIMEPAHE_BASE_URL) {
      console.warn('ANIMEPAHE_BASE_URL environment variable not set, using fallback:', ANIMEPAHE_BASE_URL);
    }
    const EXTERNAL_PROXY = 'https://m8u3.thevoidborn001.workers.dev';
    
    const isDubRequested = subtype?.toLowerCase() === 'dub';
    console.log(`[AnimePahe] Fetching sources for anime: ${animeSession}, episode: ${episodeSession}, subtype: ${subtype}`);
    
    // Use faster endpoint with downloads=false
    const { data } = await axios.get(
      `${ANIMEPAHE_BASE_URL}/api/play/${animeSession}?episodeId=${episodeSession}&downloads=false`
    );
    
    let sources = [];
    const subtitles = [];
    
    // Extract streaming URLs from the sources array, filtering by dub/sub
    if (data.sources && Array.isArray(data.sources)) {
      for (const source of data.sources) {
        // Filter based on isDub flag
        if (source.isDub !== isDubRequested) {
          continue;
        }
        
        if (source.url && source.isM3U8) {
          // Extract the path after the domain
          const urlObj = new URL(source.url);
          const proxyPath = urlObj.pathname + urlObj.search;
          
          sources.push({
            url: `${EXTERNAL_PROXY}${proxyPath}`,
            quality: source.resolution || 'default',
            isM3U8: true,
            type: 'hls'
          });
        }
      }
    }
    
    // Auto-fallback: If dub was requested but no dub sources found, try sub
    if (sources.length === 0 && isDubRequested) {
      console.log(`[AnimePahe] No dub sources found, falling back to sub`);
      
      for (const source of data.sources) {
        // Get sub sources instead
        if (source.isDub === false && source.url && source.isM3U8) {
          const urlObj = new URL(source.url);
          const proxyPath = urlObj.pathname + urlObj.search;
          
          sources.push({
            url: `${EXTERNAL_PROXY}${proxyPath}`,
            quality: source.resolution || 'default',
            isM3U8: true,
            type: 'hls'
          });
        }
      }
    }
    
    // Add a default/auto quality source if available (use highest quality)
    if (sources.length > 0) {
      // Find 1080p source or use first source
      const highQualitySource = sources.find(s => s.quality === '1080') || sources[0];
      sources.unshift({
        url: highQualitySource.url,
        quality: 'auto',
        isM3U8: true,
        type: 'hls'
      });
    }
    
    const actualType = sources.length > 0 && isDubRequested && data.sources.some(s => s.isDub === false && sources.some(src => src.url.includes(s.url.split('/').pop()))) ? 'sub (fallback)' : subtype;
    console.log(`[AnimePahe] Found ${sources.length} ${actualType} sources`);
    
    return {
      sources,
      subtitles,
      download: data.downloads || null,
      headers: {
        Referer: 'https://animepahe.com/'
      }
    };
  } catch (error) {
    console.error(`Error in AnimePaheEpisode: ${error.message}`);
    return null;
  }
}

export const POST = async (req,{params}) => {
  try {
    console.log('[SOURCE API] Request received');
    console.log('[SOURCE API] Params:', params);
    
    const id = params.epsource[0];
    const {source, provider, episodeid, episodenum, subtype, animeSession, episodeSession} = await req.json();
    
    console.log('[SOURCE API] Parsed request data:', {
      id,
      source,
      provider,
      episodeid,
      episodenum,
      subtype,
      animeSession,
      episodeSession
    });
    // let cacheTime = 25 * 60;
    // let cached = await redis.get(`source:${params.epid[0]}`);

    // if (cached) {
    //     const cachedData = JSON.parse(cached);
    //     return NextResponse.json(cachedData);
    //   } else {
    //     const data = await consumetEpisode(params.epid[0]);
    
    //     await redis.setex(`source:${params.epid[0]}`, cacheTime, JSON.stringify(data));
    
    //     return NextResponse.json(data);
    //   }

    const isDub = subtype?.toLowerCase() === 'dub';
    console.log(`\n========== SOURCE API REQUEST ==========`);
    console.log(`Source: ${source}`);
    console.log(`Provider: ${provider}`);
    console.log(`Episode ID: ${episodeid}`);
    console.log(`Episode Number: ${episodenum}`);
    console.log(`AniList ID: ${id}`);
    console.log(`Subtype: ${subtype} (isDub: ${isDub})`);
    console.log(`========================================\n`);
    
    if (provider === "animepahe") {
      try {
        const data = await AnimePaheEpisode(animeSession, episodeSession, subtype);
        if (!data) {
          console.log('[SOURCE API] AnimePahe failed, trying Consumet fallback');
          const fallbackData = await consumetEpisode(episodeid, subtype);
          return NextResponse.json(fallbackData);
        }
        return NextResponse.json(data);
      } catch (error) {
        console.error('[SOURCE API] AnimePahe error:', error.message);
        console.log('[SOURCE API] AnimePahe failed, trying Consumet fallback');
        const fallbackData = await consumetEpisode(episodeid, subtype);
        return NextResponse.json(fallbackData);
      }
    }
    
    if (provider === "hianime") {
      // Use the new HiAnime sources API
      const params = new URLSearchParams({
        animeEpisodeId: episodeid,
        server: server || 'hd-1',
        category: subtype
      });
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aninight.vercel.app'}/api/hianime/sources?${params}`,
        { cache: "no-store" }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch HiAnime sources: ${response.status}`);
      }
      
      const data = await response.json();
      return NextResponse.json(data);
    }
    
    if (source === "consumet") {
      const data = await consumetEpisode(episodeid, subtype);
      if (!data || (!data.sources && !data.download)) {
        console.log('[SOURCE API] Consumet failed, trying Anify fallback');
        const fallbackData = await AnifyEpisode('gogoanime', episodeid, episodenum, id, subtype);
        return NextResponse.json(fallbackData);
      }
      return NextResponse.json(data);
    }

    if (source === "anify" && provider === "zoro") {
      const data = await zoroEpisode(provider, episodeid, episodenum, id, subtype);
      if (!data || (!data.sources && !data.download)) {
        console.log('[SOURCE API] Zoro failed, trying Anify fallback');
        const fallbackData = await AnifyEpisode('zoro', episodeid, episodenum, id, subtype);
        return NextResponse.json(fallbackData);
      }
      return NextResponse.json(data);
    }

    if(source === "anify"){
      const data = await AnifyEpisode(provider, episodeid, episodenum, id, subtype);
      return NextResponse.json(data);
    }

    // Default fallback if no source matches
    console.log('[SOURCE API] No matching source found, trying Consumet as last resort');
    const fallbackData = await consumetEpisode(episodeid, subtype);
    return NextResponse.json(fallbackData);
  } catch (error) {
    console.error('[SOURCE API] POST handler error:', error.message);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
