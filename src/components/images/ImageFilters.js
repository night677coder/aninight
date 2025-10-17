"use client"
import React from 'react';
import styles from './ImageFilters.module.css';

const ImageFilters = ({ filters, onFilterChange }) => {
  const handleRatingChange = (e) => {
    onFilterChange({ rating: e.target.value });
  };
  
  const handleOrderChange = (e) => {
    onFilterChange({ order: e.target.value });
  };
  
  const handleResolutionChange = (resolution) => {
    onFilterChange({ resolution });
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Filters</h3>
      
      <div className={styles.grid}>
        {/* Rating Filter */}
        <div className={styles.filterGroup}>
          <label className={styles.label}>Rating</label>
          <select
            value={filters.rating}
            onChange={handleRatingChange}
            className={styles.select}
          >
            <option value="safe">Safe</option>
            <option value="questionable">Questionable</option>
            <option value="explicit">Explicit</option>
          </select>
        </div>
        
        {/* Order Filter */}
        <div className={styles.filterGroup}>
          <label className={styles.label}>Sort By</label>
          <select
            value={filters.order}
            onChange={handleOrderChange}
            className={styles.select}
          >
            <option value="date">Date (Newest)</option>
            <option value="popularity">Popularity</option>
            <option value="random">Random</option>
          </select>
        </div>
        
        {/* Resolution Filter */}
        <div className={styles.filterGroup}>
          <label className={styles.label}>Resolution</label>
          <div className={styles.resolutionButtons}>
            <button
              onClick={() => handleResolutionChange('')}
              className={`${styles.resolutionButton} ${filters.resolution === '' ? styles.active : ''}`}
            >
              All
            </button>
            <button
              onClick={() => handleResolutionChange('1920x1080')}
              className={`${styles.resolutionButton} ${filters.resolution === '1920x1080' ? styles.active : ''}`}
            >
              1920x1080
            </button>
            <button
              onClick={() => handleResolutionChange('2560x1440')}
              className={`${styles.resolutionButton} ${filters.resolution === '2560x1440' ? styles.active : ''}`}
            >
              2560x1440
            </button>
            <button
              onClick={() => handleResolutionChange('3840x2160')}
              className={`${styles.resolutionButton} ${filters.resolution === '3840x2160' ? styles.active : ''}`}
            >
              4K
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageFilters;
