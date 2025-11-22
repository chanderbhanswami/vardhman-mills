'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Maximize2, ZoomIn, ZoomOut, X } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface ProductImageZoomProps {
  src: string;
  alt: string;
  className?: string;
  zoomScale?: number;
  showControls?: boolean;
  enableFullscreen?: boolean;
}

const ProductImageZoom: React.FC<ProductImageZoomProps> = ({
  src,
  alt,
  className,
  zoomScale = 2,
  showControls = true,
  enableFullscreen = true,
}) => {
  const [isZooming, setIsZooming] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZooming) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPosition({ x, y });
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.5, 1));
  };

  const handleFullscreen = () => {
    setIsFullscreen(true);
    setScale(1);
  };

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
    setScale(1);
    setIsZooming(false);
  };

  return (
    <>
      {/* Main Image Container */}
      <div
        className={cn('relative overflow-hidden rounded-lg bg-gray-100', className)}
        onMouseEnter={() => setIsZooming(true)}
        onMouseLeave={() => {
          setIsZooming(false);
          setScale(1);
        }}
        onMouseMove={handleMouseMove}
      >
        <div className="relative w-full h-full">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain transition-transform duration-200"
            style={{
              transform: isZooming ? `scale(${scale * zoomScale})` : 'scale(1)',
              transformOrigin: `${position.x}% ${position.y}%`,
            }}
            priority
          />
        </div>

        {/* Zoom Controls */}
        {showControls && (
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              onClick={handleZoomOut}
              disabled={scale <= 1}
              className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              onClick={handleZoomIn}
              disabled={scale >= 4}
              className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            {enableFullscreen && (
              <button
                onClick={handleFullscreen}
                className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-lg transition-all"
                aria-label="Fullscreen"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Zoom Indicator */}
        {isZooming && scale > 1 && (
          <div className="absolute top-4 left-4 px-3 py-1 bg-black/70 text-white text-xs rounded-full">
            {Math.round(scale * zoomScale * 100)}%
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={handleCloseFullscreen}
        >
          <button
            onClick={handleCloseFullscreen}
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close fullscreen"
          >
            <X className="h-6 w-6 text-white" />
          </button>

          <div
            className="relative w-full h-full max-w-6xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
            onMouseMove={handleMouseMove}
          >
            <Image
              src={src}
              alt={alt}
              fill
              className="object-contain"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: `${position.x}% ${position.y}%`,
              }}
            />

            {/* Fullscreen Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 rounded-lg p-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomOut();
                }}
                disabled={scale <= 1}
                className="p-2 bg-white/10 hover:bg-white/20 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                aria-label="Zoom out"
              >
                <ZoomOut className="h-5 w-5 text-white" />
              </button>
              <div className="px-4 py-2 text-white text-sm flex items-center">
                {Math.round(scale * 100)}%
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomIn();
                }}
                disabled={scale >= 4}
                className="p-2 bg-white/10 hover:bg-white/20 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                aria-label="Zoom in"
              >
                <ZoomIn className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default ProductImageZoom;
