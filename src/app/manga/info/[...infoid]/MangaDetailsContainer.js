"use client"
import React, { useState, useEffect } from 'react';
import MangaDetailsTop from '@/components/details/MangaDetailsTop';
import MangaDetailsBottom from '@/components/details/MangaDetailsBottom';

function MangaDetailsContainer({ data, chaptersData: initialChaptersData, id, session }) {
  const [list, setList] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(initialChaptersData?.provider || 'mangapill');
  const [chaptersData, setChaptersData] = useState(initialChaptersData);
  const [isLoadingProvider, setIsLoadingProvider] = useState(false);
  const [availableProviders, setAvailableProviders] = useState([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);

  useEffect(() => {
    const fetchList = async () => {
      if (session?.user?.token) {
        try {
          const response = await fetch(`/api/anilist/user-lists?id=${id}`);
          if (response.ok) {
            const data = await response.json();
            setList(data);
          }
        } catch (error) {
          console.error('Error fetching manga list:', error);
        }
      }
    };
    fetchList();
  }, [session, id]);

  useEffect(() => {
    const fetchAvailableProviders = async () => {
      try {
        const response = await fetch(`/api/manga/providers?id=${id}`);
        if (response.ok) {
          const providers = await response.json();
          setAvailableProviders(providers);
        }
      } catch (error) {
        console.error('Error fetching available providers:', error);
      } finally {
        setIsLoadingProviders(false);
      }
    };
    fetchAvailableProviders();
  }, [id]);

  const handleProviderChange = async (provider) => {
    if (provider === selectedProvider || isLoadingProvider) return;
    
    setIsLoadingProvider(true);
    setSelectedProvider(provider);
    
    try {
      const response = await fetch(`/api/manga/chapters?id=${id}&provider=${provider}`);
      if (response.ok) {
        const newChaptersData = await response.json();
        setChaptersData(newChaptersData);
      }
    } catch (error) {
      console.error('Error switching provider:', error);
    } finally {
      setIsLoadingProvider(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <MangaDetailsTop 
        data={data} 
        chaptersData={chaptersData} 
        id={id} 
        session={session}
        list={list}
        setList={setList}
      />
      <MangaDetailsBottom 
        data={data} 
        chaptersData={chaptersData}
        availableProviders={availableProviders}
        selectedProvider={selectedProvider}
        onProviderChange={handleProviderChange}
        isLoadingProvider={isLoadingProvider}
        isLoadingProviders={isLoadingProviders}
      />
    </div>
  );
}

export default MangaDetailsContainer;
