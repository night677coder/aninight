"use client";
import React from 'react';
import Link from 'next/link';
import styles from './PromoBanner.module.css';

export default function PromoBanner() {
  return (
    <Link 
      href="https://night677coder.github.io/vortex/"
      className={styles.promoBanner}
    >
      <div className={styles.promoContent}>
        <h1 className={styles.promoTitle}>
          CLICK - WATCH ALL LATEST MOVIE'S AND TV SHOWS POPULAR - CLICK
        </h1>
      </div>
    </Link>
  );
}
