"use client"
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faSpinner, faExternalLinkAlt, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { findDownloadLinks } from '@/lib/animePaheDownload';
import { toast } from 'sonner';
import styles from './DownloadButton.module.css';

function DownloadButton({ animeData, episodeNumber }) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [downloadLinks, setDownloadLinks] = useState(null);
  const [cachedLinks, setCachedLinks] = useState(null);

  // Check cache on mount
  useEffect(() => {
    const cacheKey = `download_${animeData?.id}_${episodeNumber}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        setCachedLinks(JSON.parse(cached));
      } catch (e) {
        sessionStorage.removeItem(cacheKey);
      }
    }
  }, [animeData?.id, episodeNumber]);

  const handleDownload = async () => {
    // Use cached links if available
    if (cachedLinks) {
      setDownloadLinks(cachedLinks);
      setShowModal(true);
      return;
    }

    setLoading(true);
    try {
      const links = await findDownloadLinks(animeData, episodeNumber);
      
      if (!links || !links.downloads) {
        toast.error('Download links not available for this episode');
        setLoading(false);
        return;
      }
      
      // Cache the links
      const cacheKey = `download_${animeData?.id}_${episodeNumber}`;
      sessionStorage.setItem(cacheKey, JSON.stringify(links.downloads));
      
      setDownloadLinks(links.downloads);
      setCachedLinks(links.downloads);
      setShowModal(true);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to fetch download links');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setDownloadLinks(null);
  };

  const qualities = ['1080p', '720p', '360p'];

  return (
    <>
      <button
        onClick={handleDownload}
        disabled={loading}
        className={styles.downloadButton}
        title="Download Episode"
      >
        <FontAwesomeIcon 
          icon={loading ? faSpinner : faDownload} 
          className={loading ? 'animate-spin' : ''} 
        />
        <span>
          {loading ? 'Loading...' : 'Download'}
        </span>
      </button>

      {showModal && (
        <div 
          className={styles.modal}
          onClick={closeModal}
        >
          <div 
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Download Episode {episodeNumber}</h3>
              <button
                onClick={closeModal}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>

            {downloadLinks ? (
              <div className={styles.linksList}>
                {qualities.map((quality) => {
                  const linkData = downloadLinks[quality];
                  
                  if (!linkData) return null;
                  
                  const url = typeof linkData === 'string' ? linkData : linkData.url;
                  const filesize = linkData.filesize || '';
                  
                  return (
                    <a
                      key={quality}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.downloadLink}
                    >
                      <div>
                        <span className={styles.qualityLabel}>{quality}</span>
                        {filesize && <span className="text-xs text-gray-400 ml-2">({filesize})</span>}
                      </div>
                      <FontAwesomeIcon 
                        icon={faExternalLinkAlt} 
                        className={styles.linkIcon} 
                      />
                    </a>
                  );
                })}
                
                {!qualities.some(q => downloadLinks[q]) && (
                  <p className={styles.noLinks}>
                    No download links available
                  </p>
                )}
              </div>
            ) : (
              <div className={styles.loading}>
                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-2xl text-white" />
              </div>
            )}

            <div className={styles.modalFooter}>
              <div className={styles.footerInfo}>
                <FontAwesomeIcon icon={faInfoCircle} className={styles.infoIcon} />
                <p>
                  Download links are provided by AnimePahe. Click on a quality to start downloading.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DownloadButton;
