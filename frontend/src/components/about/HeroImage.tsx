"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { CompanyInfo } from '@/types/about.types';

// Utility function for class names
function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

interface HeroImageProps {
  companyInfo: CompanyInfo;
  className?: string;
  autoplay?: boolean;
  showControls?: boolean;
  showIndicators?: boolean;
  interval?: number;
}

interface HeroSlide {
  id: string;
  image: string;
  alt: string;
  title?: string;
  subtitle?: string;
  video?: {
    url: string;
    poster: string;
    autoplay: boolean;
  };
}

const HeroImage: React.FC<HeroImageProps> = ({
  companyInfo,
  className,
  autoplay = true,
  showControls = true,
  showIndicators = true,
  interval = 5000
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isLoaded, setIsLoaded] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Create slides from company info
  const slides: HeroSlide[] = [
    {
      id: 'cover',
      image: companyInfo.coverImage.url,
      alt: companyInfo.coverImage.alt || `${companyInfo.companyName} Cover`,
      title: companyInfo.companyName,
      subtitle: companyInfo.tagline
    },
    ...companyInfo.galleryImages.map((img, index) => ({
      id: `gallery-${index}`,
      image: img.url,
      alt: img.alt || `${companyInfo.companyName} Gallery ${index + 1}`,
      title: `Our Legacy`,
      subtitle: `Discover ${companyInfo.companyName}'s Journey`
    }))
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, slides.length, interval]);

  const handlePrevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsPlaying(false);
  }, [slides.length]);

  const handleNextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsPlaying(false);
  }, [slides.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          handlePrevSlide();
          break;
        case 'ArrowRight':
          handleNextSlide();
          break;
        case ' ':
          event.preventDefault();
          setIsPlaying(prev => !prev);
          break;
        case 'Escape':
          setIsPlaying(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevSlide, handleNextSlide]);

  const handleSlideClick = (index: number) => {
    setCurrentSlide(index);
    setIsPlaying(false);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) handleNextSlide();
    if (isRightSwipe) handlePrevSlide();
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8
    })
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0
    }
  };

  return (
    <section 
      className={cn(
        "relative h-screen w-full overflow-hidden bg-gray-900",
        className
      )}
      aria-label={`Hero section showcasing ${companyInfo.companyName}`}
    >
      {/* Main Slideshow */}
      <div 
        className="relative h-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait" custom={1}>
          <motion.div
            key={currentSlide}
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              scale: { duration: 0.4 }
            }}
            className="absolute inset-0"
          >
            {/* Background Image */}
            <div className="relative h-full w-full">
              <Image
                src={slides[currentSlide].image}
                alt={slides[currentSlide].alt}
                fill
                className="object-cover"
                priority={currentSlide === 0}
                quality={90}
                sizes="100vw"
                onLoad={() => setIsLoaded(true)}
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/30" />
            </div>

            {/* Content Overlay */}
            <motion.div 
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              transition={{
                delay: 0.3,
                duration: 0.6,
                ease: "easeOut"
              }}
              className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4 sm:px-6 lg:px-8"
            >
              <div className="max-w-4xl mx-auto space-y-6">
                <motion.h1 
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  {slides[currentSlide].title}
                </motion.h1>
                
                {slides[currentSlide].subtitle && (
                  <motion.p 
                    className="text-xl sm:text-2xl md:text-3xl font-light text-gray-200 max-w-3xl mx-auto"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                  >
                    {slides[currentSlide].subtitle}
                  </motion.p>
                )}

                {/* Company Stats */}
                <motion.div 
                  className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                >
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-blue-400">
                      {companyInfo.stats.yearsInBusiness}+
                    </div>
                    <div className="text-sm md:text-base text-gray-300 mt-1">
                      Years of Excellence
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-green-400">
                      {(companyInfo.stats.totalCustomers / 1000).toFixed(0)}K+
                    </div>
                    <div className="text-sm md:text-base text-gray-300 mt-1">
                      Happy Customers
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-purple-400">
                      {companyInfo.stats.productsOffered}+
                    </div>
                    <div className="text-sm md:text-base text-gray-300 mt-1">
                      Products
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-orange-400">
                      {companyInfo.stats.citiesServed}+
                    </div>
                    <div className="text-sm md:text-base text-gray-300 mt-1">
                      Cities Served
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      {showControls && slides.length > 1 && (
        <>
          {/* Previous/Next Buttons */}
          <button
            onClick={handlePrevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/60 backdrop-blur-sm rounded-full p-3 text-white transition-all duration-300 group"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
          
          <button
            onClick={handleNextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/60 backdrop-blur-sm rounded-full p-3 text-white transition-all duration-300 group"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>

          {/* Play/Pause Button */}
          <div className="absolute top-4 right-4 z-20 flex gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-black/30 hover:bg-black/60 backdrop-blur-sm rounded-full p-3 text-white transition-all duration-300 group"
              aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 group-hover:scale-110 transition-transform" />
              ) : (
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              )}
            </button>
          </div>
        </>
      )}

      {/* Slide Indicators */}
      {showIndicators && slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => handleSlideClick(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                currentSlide === index
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/80"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {isPlaying && (
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <motion.div
            className="h-1 bg-gradient-to-r from-blue-500 to-purple-600"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: interval / 1000,
              ease: "linear",
              repeat: Infinity
            }}
            key={currentSlide}
          />
        </div>
      )}

      {/* Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-30">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-white text-lg">
              Loading {companyInfo.companyName}...
            </p>
          </div>
        </div>
      )}

      {/* Accessibility Enhancement */}
      <div className="sr-only">
        <h2>Company Hero Gallery</h2>
        <p>
          Slide {currentSlide + 1} of {slides.length}: {slides[currentSlide].alt}
        </p>
        <p>Use arrow keys to navigate, space to pause, escape to stop autoplay.</p>
      </div>
    </section>
  );
};

export default HeroImage;
