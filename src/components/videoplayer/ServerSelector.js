"use client"
import React, { useState, useEffect } from 'react';
import { getHiAnimeServers } from '@/lib/getData';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faServer } from '@fortawesome/free-solid-svg-icons';
import styles from './ServerSelector.module.css';

function ServerSelector({ episodeId, currentServer, onServerChange, category = 'sub' }) {
  const [servers, setServers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchServers = async () => {
      if (!episodeId) return;
      
      setLoading(true);
      try {
        const response = await getHiAnimeServers(episodeId);
        if (response?.success && response?.data) {
          setServers(response.data);
        }
      } catch (error) {
        console.error('Error fetching servers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServers();
  }, [episodeId]);

  if (loading || !servers) return null;

  const availableServers = servers[category] || [];
  
  if (availableServers.length === 0) return null;

  const handleServerSelect = (serverName) => {
    onServerChange(serverName);
    setIsOpen(false);
  };

  return (
    <div className={styles.serverSelector}>
      <button 
        className={styles.serverButton}
        onClick={() => setIsOpen(!isOpen)}
        title="Select Server"
      >
        <FontAwesomeIcon icon={faServer} />
        <span className={styles.serverLabel}>
          {currentServer || 'hd-1'}
        </span>
      </button>

      {isOpen && (
        <div className={styles.serverDropdown}>
          <div className={styles.serverList}>
            {availableServers.map((server) => (
              <button
                key={server.serverId}
                className={`${styles.serverItem} ${currentServer === server.serverName ? styles.active : ''}`}
                onClick={() => handleServerSelect(server.serverName)}
              >
                {server.serverName}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ServerSelector;
