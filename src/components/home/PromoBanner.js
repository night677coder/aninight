"use client";
import React from 'react';
import styles from './PromoBanner.module.css';

export default function PromoBanner() {
  return (
    <div className={styles.promoBanner}>
      <div className={styles.content}>
        <span className={styles.text}>
          Visit <a href="https://voidstream.space" target="_blank" rel="noopener noreferrer" className={styles.link}>https://voidstream.space</a> to stream free movies, series, anime with multi language
        </span>
      </div>
    </div>
  );
}
