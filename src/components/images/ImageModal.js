"use client"
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const ImageModal = ({ image, onClose }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Handle keyboard events (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  
  // Prevent scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);
  
  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      
      // Use the file URL directly for download
      const fileUrl = image.file_url || image.sample_url;
      const fileName = `konachan_${image.id}.jpg`;
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsDownloading(false);
    } catch (error) {
      console.error('Download error:', error);
      setIsDownloading(false);
    }
  };
  
  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          className="relative max-w-6xl w-full bg-gray-900 rounded-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Image container */}
          <div className="relative flex justify-center bg-black/30" style={{ height: '80vh' }}>
            <Image
              src={image.sample_url || image.preview_url}
              alt={image.tags}
              width={image.sample_width || 800}
              height={image.sample_height || 600}
              className="object-contain max-h-[80vh] max-w-full"
              unoptimized={true}
              style={{ margin: 'auto' }}
            />
          </div>
          
          {/* Image details */}
          <div className="p-4 bg-gray-900">
            <div className="flex flex-wrap justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-medium">Image #{image.id}</h3>
                <p className="text-gray-400 text-sm">
                  {image.width}x{image.height} • {formatFileSize(image.file_size)}
                </p>
              </div>
              
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                  isDownloading 
                    ? 'bg-gray-700 text-gray-300' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                } transition-colors`}
              >
                {isDownloading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Download</span>
                  </>
                )}
              </button>
            </div>
            
            {/* Tags */}
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {image.tags.split(' ').map((tag, index) => (
                  <span key={index} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageModal;
