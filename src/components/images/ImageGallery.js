"use client"
import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import ImageModal from './ImageModal';
import styles from './ImageGallery.module.css';

const ImageGallery = ({ images, loading, hasMore, loadMore }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  
  const handleImageClick = (image) => {
    setSelectedImage(image);
  };
  
  const closeModal = () => {
    setSelectedImage(null);
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className={styles.container}>
      <motion.div 
        className={styles.grid}
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {images.map((image) => (
          <motion.div 
            key={image.id} 
            className={styles.imageCard}
            variants={itemVariants}
            onClick={() => handleImageClick(image)}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <div className={styles.imageWrapper}>
              <Image
                src={image.preview_url || image.sample_url}
                alt={image.tags}
                fill
                className={styles.image}
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                unoptimized={true}
              />
              <div className={styles.overlay}></div>
              <div className={styles.imageInfo}>
                <div className={styles.tags}>
                  {image.tags.split(' ').slice(0, 3).join(', ')}
                </div>
                <div className={styles.resolution}>
                  {image.width}x{image.height}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      {loading && (
        <div className={styles.loadingGrid}>
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={`skeleton-${index}`} className={styles.skeleton}>
              <div className={styles.skeletonInner}></div>
            </div>
          ))}
        </div>
      )}
      
      {!loading && images.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className={styles.emptyTitle}>No images found</p>
          <p className={styles.emptyDescription}>Try adjusting your search or filters</p>
        </div>
      )}
      
      {!loading && hasMore && images.length > 0 && (
        <div className={styles.loadMoreContainer}>
          <button onClick={loadMore} className={styles.loadMoreButton}>
            <span>Load More</span>
            <span className={styles.buttonGlow}></span>
          </button>
        </div>
      )}
      
      {selectedImage && (
        <ImageModal image={selectedImage} onClose={closeModal} />
      )}
    </div>
  );
};

export default ImageGallery;
