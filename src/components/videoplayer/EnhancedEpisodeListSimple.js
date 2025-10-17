"use client"
import React, { useEffect, useState } from "react";
import { getEpisodes } from "@/lib/getData";
import { ProvidersMap } from "@/utils/EpisodeFunctions";
import { useSubtype } from '@/lib/store';
import { useStore } from 'zustand';

function EnhancedEpisodeListSimple({ id, data, onprovider, setwatchepdata, epnum }) {
  const subtype = useStore(useSubtype, (state) => state.subtype);
  const [loading, setLoading] = useState(true);
  const [episodeData, setEpisodeData] = useState(null);
  const [allEpisodes, setAllEpisodes] = useState([]);

  // Fetch episode data on component mount
  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        setLoading(true);
        const response = await getEpisodes(id, data?.idMal, data?.status === "RELEASING", false);
        
        if (!response || !Array.isArray(response) || response.length === 0) {
          setLoading(false);
          return;
        }
        
        setEpisodeData(response);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching episodes:", error);
        setLoading(false);
      }
    };
    
    if (id && data) {
      fetchEpisodes();
    }
  }, [id, data?.idMal, data?.status]);

  // Update episodes when provider changes
  useEffect(() => {
    if (!episodeData || !Array.isArray(episodeData)) return;
    
    const provider = episodeData.find((i) => i?.providerId === onprovider);
    
    if (!provider) {
      setAllEpisodes([]);
      setwatchepdata([]);
      return;
    }
    
    let filteredEpisodes = provider.episodes || [];
    
    if (!Array.isArray(filteredEpisodes)) {
      setAllEpisodes([]);
      setwatchepdata([]);
      return;
    }
    
    setAllEpisodes(filteredEpisodes);
    setwatchepdata(filteredEpisodes);
  }, [episodeData, onprovider, setwatchepdata]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-black via-gray-900 to-black rounded-2xl p-6 shadow-2xl border border-white/10">
        <div className="animate-pulse">
          <div className="h-24 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl mb-6"></div>
          <div className="h-12 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-black rounded-2xl p-6 shadow-2xl border border-white/10">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white mb-2">Episode Selection</h2>
        <p className="text-sm text-gray-300">Currently watching Episode {epnum}</p>
      </div>
      
      <div className="mb-4">
        <h3 className="font-bold text-white text-lg mb-4">Episodes</h3>
        <span className="text-white text-sm">{allEpisodes?.length || 0} episodes</span>
      </div>
      
      {allEpisodes && allEpisodes.length > 0 ? (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 mt-4">
          {allEpisodes.slice(0, 50).map((episode) => {
            const isCurrentEp = episode?.number === parseInt(epnum);
            return (
              <div
                key={episode?.id || episode?.episodeId || episode?.number}
                className={`flex items-center justify-center h-10 rounded-md font-semibold text-sm transition-all ${
                  isCurrentEp 
                    ? 'bg-white text-black' 
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                }`}
              >
                {episode?.number || 'N/A'}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-4 text-center text-white/60">No episodes available</div>
      )}
    </div>
  );
}

export default EnhancedEpisodeListSimple;