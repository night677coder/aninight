"use client"
import React, { useState } from 'react';
import styles from './ImageSearch.module.css';

const ImageSearch = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  
  const commonTags = [
    'landscape', 'scenery', 'night', 'sunset', 'city',
    'beach', 'forest', 'mountains', 'sky', 'space',
    'school', 'classroom', 'bedroom', 'library', 'cafe',
    'sword', 'magic', 'mecha', 'cyberpunk', 'fantasy'
  ];
  
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim() !== '') {
      const filtered = commonTags.filter(tag => 
        tag.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query.trim());
    setSuggestions([]);
  };
  
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setSuggestions([]);
  };
  
  const handleTagClick = (tag) => {
    setQuery(tag);
    onSearch(tag);
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search for anime wallpapers..."
            className={styles.input}
          />
          <button type="submit" className={styles.searchButton}>
            <svg className={styles.searchIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <span className={styles.inputGlow}></span>
        </div>
        
        {suggestions.length > 0 && (
          <div className={styles.suggestions}>
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={styles.suggestionItem}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </form>
      
      <div className={styles.tagsSection}>
        <span className={styles.tagsLabel}>Popular tags:</span>
        <div className={styles.tagsList}>
          {commonTags.slice(0, 8).map((tag, index) => (
            <button
              key={index}
              onClick={() => handleTagClick(tag)}
              className={styles.tag}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageSearch;
