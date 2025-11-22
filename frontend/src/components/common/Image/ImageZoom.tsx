'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  XMarkIcon,
  ArrowsPointingOutIcon,
} from '@heroicons/react/24/outline';
import OptimizedImage from './OptimizedImage';

export interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
  variant?: 'hover' | 'click' | 'modal' | 'lens';
  zoomLevel?: number;
  maxZoom?: number;
  minZoom?: number;
  disabled?: boolean;
  showControls?: boolean;
  showFullscreen?: boolean;
  onZoomChange?: (zoom: number) => void;
  onFullscreen?: () => void;
}

const ImageZoom: React.FC<ImageZoomProps> = ({
  src,
  alt,
  className = '',
  variant = 'hover',
  zoomLevel = 1,
  maxZoom = 5,
  minZoom = 0.5,
  disabled = false,
  showControls = true,
  showFullscreen = true,
  onZoomChange,
  onFullscreen,
}) => {
  const [currentZoom, setCurrentZoom] = useState(zoomLevel);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showModal, setShowModal] = useState(false);
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);

  // Handle zoom level changes
  useEffect(() => {
    setCurrentZoom(zoomLevel);
  }, [zoomLevel]);

  // Handle zoom change callback
  useEffect(() => {
    onZoomChange?.(currentZoom);
  }, [currentZoom, onZoomChange]);

  const handleMouseEnter = useCallback(() => {
    if (variant === 'hover' && !disabled) {
      setIsZoomed(true);
    }
  }, [variant, disabled]);

  const handleMouseLeave = useCallback(() => {
    if (variant === 'hover' && !disabled) {
      setIsZoomed(false);
      setMousePosition({ x: 0, y: 0 });
      setLensPosition({ x: 0, y: 0 });
    }
  }, [variant, disabled]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!containerRef.current || disabled) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    setMousePosition({ x, y });

    // Update lens position for lens variant
    if (variant === 'lens') {
      const lensSize = 100; // lens size in pixels
      const lensX = event.clientX - rect.left - lensSize / 2;
      const lensY = event.clientY - rect.top - lensSize / 2;
      
      setLensPosition({
        x: Math.max(0, Math.min(lensX, rect.width - lensSize)),
        y: Math.max(0, Math.min(lensY, rect.height - lensSize)),
      });
    }
  }, [variant, disabled]);

  const handleClick = useCallback((event: React.MouseEvent) => {
    if (variant === 'click' && !disabled) {
      setIsZoomed(!isZoomed);
      if (!isZoomed) {
        handleMouseMove(event);
      }
    } else if (variant === 'modal' && !disabled) {
      setShowModal(true);
    }
  }, [variant, disabled, isZoomed, handleMouseMove]);

  const handleWheel = useCallback((event: React.WheelEvent) => {
    if (disabled || !isZoomed) return;
    
    event.preventDefault();
    
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(minZoom, Math.min(maxZoom, currentZoom + delta));
    
    setCurrentZoom(newZoom);
  }, [disabled, isZoomed, currentZoom, minZoom, maxZoom]);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (!isZoomed || disabled) return;
    
    setIsDragging(true);
    setDragStart({
      x: event.clientX - imagePosition.x,
      y: event.clientY - imagePosition.y,
    });
  }, [isZoomed, disabled, imagePosition]);

  const handleMouseMoveGlobal = useCallback((event: MouseEvent) => {
    if (!isDragging) return;
    
    setImagePosition({
      x: event.clientX - dragStart.x,
      y: event.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUpGlobal = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Global mouse events for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMoveGlobal);
      document.addEventListener('mouseup', handleMouseUpGlobal);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMoveGlobal);
        document.removeEventListener('mouseup', handleMouseUpGlobal);
      };
    }
  }, [isDragging, handleMouseMoveGlobal, handleMouseUpGlobal]);

  const zoomIn = useCallback(() => {
    const newZoom = Math.min(maxZoom, currentZoom + 0.2);
    setCurrentZoom(newZoom);
  }, [currentZoom, maxZoom]);

  const zoomOut = useCallback(() => {
    const newZoom = Math.max(minZoom, currentZoom - 0.2);
    setCurrentZoom(newZoom);
  }, [currentZoom, minZoom]);

  const resetZoom = useCallback(() => {
    setCurrentZoom(1);
    setImagePosition({ x: 0, y: 0 });
    setIsZoomed(false);
  }, []);

  const openFullscreen = useCallback(() => {
    onFullscreen?.();
  }, [onFullscreen]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    resetZoom();
  }, [resetZoom]);

  const getImageTransform = () => {
    if (!isZoomed && variant !== 'lens') return 'scale(1)';
    
    const scale = currentZoom;
    const translateX = imagePosition.x;
    const translateY = imagePosition.y;
    
    if (variant === 'hover' || variant === 'click') {
      // Transform origin based on mouse position
      return `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
    }
    
    return `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
  };

  const getLensStyle = () => {
    if (variant !== 'lens' || !isZoomed) return {};
    
    const backgroundSize = `${currentZoom * 100}%`;
    const backgroundPosition = `${-lensPosition.x * currentZoom}px ${-lensPosition.y * currentZoom}px`;
    
    return {
      left: lensPosition.x,
      top: lensPosition.y,
      backgroundImage: `url(${src})`,
      backgroundSize,
      backgroundPosition,
      backgroundRepeat: 'no-repeat',
    };
  };

  const renderControls = () => {
    if (!showControls || variant === 'hover' || variant === 'lens') return null;
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isZoomed ? 1 : 0 }}
        className="absolute top-2 right-2 flex gap-2 z-10"
      >
        <button
          onClick={zoomOut}
          disabled={currentZoom <= minZoom}
          className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Zoom out"
        >
          <MagnifyingGlassMinusIcon className="w-4 h-4" />
        </button>
        
        <button
          onClick={zoomIn}
          disabled={currentZoom >= maxZoom}
          className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Zoom in"
        >
          <MagnifyingGlassPlusIcon className="w-4 h-4" />
        </button>
        
        {showFullscreen && (
          <button
            onClick={openFullscreen}
            className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            aria-label="Open fullscreen"
          >
            <ArrowsPointingOutIcon className="w-4 h-4" />
          </button>
        )}
      </motion.div>
    );
  };

  const renderLens = () => {
    if (variant !== 'lens' || !isZoomed) return null;
    
    return (
      <motion.div
        ref={lensRef}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        className="absolute w-24 h-24 border-2 border-white shadow-lg rounded-full pointer-events-none z-10"
        style={getLensStyle()}
      />
    );
  };

  const renderModal = () => {
    if (variant !== 'modal') return null;
    
    return (
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
              className="relative max-w-screen-lg max-h-screen-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="relative overflow-hidden cursor-grab"
                onMouseDown={handleMouseDown}
                onWheel={handleWheel}
              >
                <OptimizedImage
                  src={src}
                  alt={alt}
                  width={1200}
                  height={800}
                  className="max-w-full max-h-full object-contain"
                />
                <div 
                  className="absolute inset-0 pointer-events-none"
                  data-transform={getImageTransform()}
                />
              </div>
              
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                aria-label="Close modal"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
              
              {renderControls()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <>
      <div
        ref={containerRef}
        className={`relative overflow-hidden ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      >
        <div 
          className="relative overflow-hidden"
          onMouseDown={variant !== 'lens' ? handleMouseDown : undefined}
          onWheel={handleWheel}
        >
          <OptimizedImage
            src={src}
            alt={alt}
            fill
            className={`
              object-cover transition-transform duration-300 ease-out
              ${isZoomed && variant !== 'lens' ? 'cursor-move' : 'cursor-pointer'}
              ${disabled ? 'cursor-default' : ''}
            `}
          />
          <div 
            ref={imageRef}
            className="absolute inset-0 pointer-events-none"
            data-transform={getImageTransform()}
            data-origin={`${mousePosition.x}% ${mousePosition.y}%`}
          />
        </div>
        
        {renderControls()}
        {renderLens()}
        
        {/* Zoom indicator */}
        {isZoomed && variant !== 'lens' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-2 left-2 px-3 py-1 bg-black/50 text-white text-sm rounded-full"
          >
            {Math.round(currentZoom * 100)}%
          </motion.div>
        )}
      </div>
      
      {renderModal()}
    </>
  );
};

export default ImageZoom;