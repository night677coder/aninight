import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="relative group cursor-pointer overflow-hidden rounded-lg border border-[#333] bg-black transition-all duration-300 hover:border-white/30">
      {/* Image skeleton */}
      <div className="relative w-full h-[280px] sm:h-[320px] bg-[#1a1a1a] animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>
      
      {/* Content skeleton */}
      <div className="p-3 sm:p-4">
        {/* Title skeleton */}
        <div className="h-4 sm:h-5 bg-[#2a2a2a] rounded animate-pulse mb-2"></div>
        <div className="h-3 sm:h-4 bg-[#2a2a2a] rounded animate-pulse mb-1 w-3/4"></div>
        
        {/* Meta skeleton */}
        <div className="flex items-center gap-2 mt-2">
          <div className="h-3 w-12 bg-[#2a2a2a] rounded animate-pulse"></div>
          <div className="h-3 w-16 bg-[#2a2a2a] rounded animate-pulse"></div>
          <div className="h-3 w-20 bg-[#2a2a2a] rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
