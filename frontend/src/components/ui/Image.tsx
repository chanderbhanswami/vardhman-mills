'use client';

import React, { forwardRef, useState, useCallback, useRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import NextImage from 'next/image';

// Image variants
const imageVariants = cva(
  'relative overflow-hidden',
  {
    variants: {
      variant: {
        default: '',
        rounded: 'rounded-lg',
        circle: 'rounded-full',
        bordered: 'border border-gray-200',
        shadow: 'shadow-lg',
        none: '',
      },
      fit: {
        cover: 'object-cover',
        contain: 'object-contain',
        fill: 'object-fill',
        none: 'object-none',
        scaleDown: 'object-scale-down',
      },
      aspectRatio: {
        square: 'aspect-square',
        video: 'aspect-video',
        portrait: 'aspect-[3/4]',
        landscape: 'aspect-[4/3]',
        cinema: 'aspect-[21/9]',
        auto: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      fit: 'cover',
      aspectRatio: 'auto',
    },
  }
);

// Image Props
export interface ImageProps extends VariantProps<typeof imageVariants> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  placeholder?: string;
  fallback?: React.ReactNode;
  lazy?: boolean;
  blur?: boolean;
  grayscale?: boolean;
  sepia?: boolean;
  invert?: boolean;
  brightness?: number;
  contrast?: number;
  saturate?: number;
  hueRotate?: number;
  zoomOnHover?: boolean;
  fadeIn?: boolean;
  onClick?: () => void;
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  className?: string;
  imageClassName?: string;
  children?: React.ReactNode;
}

// Main Image Component
export const Image = forwardRef<HTMLDivElement, ImageProps>(
  ({
    src,
    alt,
    width,
    height,
    placeholder,
    fallback,
    lazy = true,
    blur = false,
    grayscale = false,
    sepia = false,
    invert = false,
    brightness = 1,
    contrast = 1,
    saturate = 1,
    hueRotate = 0,
    zoomOnHover = false,
    fadeIn = true,
    variant = 'default',
    fit = 'cover',
    aspectRatio = 'auto',
    onClick,
    onLoad,
    onError,
    className,
    imageClassName,
    children,
    ...props
  }, ref) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [isIntersecting, setIsIntersecting] = useState(!lazy);
    const imgRef = useRef<HTMLImageElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    
    // Intersection Observer for lazy loading
    const setImageRef = useCallback((node: HTMLImageElement) => {
      if (imgRef.current) {
        observerRef.current?.disconnect();
      }
      
      imgRef.current = node;
      
      if (node && lazy) {
        observerRef.current = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setIsIntersecting(true);
              observerRef.current?.disconnect();
            }
          },
          { threshold: 0.1 }
        );
        
        observerRef.current.observe(node);
      }
    }, [lazy]);
    
    const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
      setIsLoaded(true);
      onLoad?.(event);
    };
    
    const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
      setHasError(true);
      onError?.(event);
    };
    
    // Build filter styles
    const filterStyles = [];
    if (blur) filterStyles.push('blur(4px)');
    if (grayscale) filterStyles.push('grayscale(1)');
    if (sepia) filterStyles.push('sepia(1)');
    if (invert) filterStyles.push('invert(1)');
    if (brightness !== 1) filterStyles.push(`brightness(${brightness})`);
    if (contrast !== 1) filterStyles.push(`contrast(${contrast})`);
    if (saturate !== 1) filterStyles.push(`saturate(${saturate})`);
    if (hueRotate !== 0) filterStyles.push(`hue-rotate(${hueRotate}deg)`);
    
    const filterString = filterStyles.length > 0 ? filterStyles.join(' ') : undefined;
    
    return (
      <div
        ref={ref}
        className={cn(
          imageVariants({ variant, aspectRatio }),
          zoomOnHover && 'group cursor-pointer',
          onClick && 'cursor-pointer',
          className
        )}
        onClick={onClick}
        {...props}
      >
        {/* Placeholder */}
        {(!isIntersecting || (!isLoaded && !hasError)) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            {placeholder ? (
              <NextImage
                className="w-full h-full object-cover object-center"
                src={placeholder}
                alt=""
                fill
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <svg
                  className="w-12 h-12 mb-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm">Loading...</span>
              </div>
            )}
          </div>
        )}
        
        {/* Error Fallback */}
        {hasError && fallback && (
          <div className="absolute inset-0 flex items-center justify-center">
            {fallback}
          </div>
        )}
        
        {/* Default Error State */}
        {hasError && !fallback && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
            <div className="text-center">
              <svg
                className="w-12 h-12 mx-auto mb-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zM9 8a1 1 0 000 2v4a1 1 0 001 1h1a1 1 0 100-2v-4a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm">Failed to load</span>
            </div>
          </div>
        )}
        
        {/* Main Image */}
        {isIntersecting && !hasError && (
          <motion.img
            ref={setImageRef}
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={cn(
              'w-full h-full',
              imageVariants({ fit }),
              zoomOnHover && 'transition-transform duration-300 group-hover:scale-110',
              fadeIn && 'transition-opacity duration-300',
              fadeIn && !isLoaded && 'opacity-0',
              fadeIn && isLoaded && 'opacity-100',
              imageClassName
            )}
            data-filter={filterString}
            data-width={width}
            data-height={height}
            onLoad={handleLoad}
            onError={handleError}
            initial={fadeIn ? { opacity: 0 } : undefined}
            animate={fadeIn ? { opacity: isLoaded ? 1 : 0 } : undefined}
            transition={{ duration: 0.3 }}
          />
        )}
        
        {/* Overlay Content */}
        {children && (
          <div className="absolute inset-0 flex items-end">
            <div className="w-full p-4 bg-gradient-to-t from-black/60 to-transparent text-white">
              {children}
            </div>
          </div>
        )}
      </div>
    );
  }
);

Image.displayName = 'Image';

// Avatar Component
export interface AvatarProps extends Omit<ImageProps, 'aspectRatio' | 'fit'> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  status?: 'online' | 'offline' | 'away' | 'busy';
  showStatus?: boolean;
  initials?: string;
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({
    size = 'md',
    status,
    showStatus = false,
    initials,
    variant = 'circle',
    alt = "Avatar",
    src = "",
    ...props
  }, ref) => {
    const sizeClasses = {
      xs: 'w-6 h-6',
      sm: 'w-8 h-8',
      md: 'w-12 h-12',
      lg: 'w-16 h-16',
      xl: 'w-20 h-20',
      '2xl': 'w-24 h-24',
    };
    
    const statusClasses = {
      online: 'bg-green-500',
      offline: 'bg-gray-400',
      away: 'bg-yellow-500',
      busy: 'bg-red-500',
    };
    
    const initialsComponent = initials && (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-600 font-medium">
        {initials}
      </div>
    );
    
    return (
      <div className="relative inline-block">
        <Image
          ref={ref}
          variant={variant}
          aspectRatio="square"
          fit="cover"
          className={sizeClasses[size]}
          fallback={initialsComponent}
          src={src}
          alt={alt}
          {...props}
        />
        
        {/* Status Indicator */}
        {showStatus && status && (
          <div
            className={cn(
              'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white',
              statusClasses[status]
            )}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

// Image Gallery Grid
export interface ImageGridProps {
  images: {
    id: string;
    src: string;
    alt: string;
    title?: string;
    description?: string;
  }[];
  columns?: number;
  gap?: number;
  onImageClick?: (image: string | object, index: number) => void;
  className?: string;
  imageProps?: Partial<ImageProps>;
}

export const ImageGrid = forwardRef<HTMLDivElement, ImageGridProps>(
  ({
    images,
    columns = 3,
    gap = 4,
    onImageClick,
    className,
    imageProps,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          {
            'grid-cols-1': columns === 1,
            'grid-cols-2': columns === 2,
            'grid-cols-3': columns === 3,
            'grid-cols-4': columns === 4,
            'grid-cols-5': columns === 5,
            'grid-cols-6': columns === 6,
          },
          `gap-${gap}`,
          className
        )}
        {...props}
      >
        {images.map((image, index) => (
          <Image
            key={image.id}
            src={image.src}
            alt={image.alt}
            aspectRatio="square"
            zoomOnHover
            onClick={() => onImageClick?.(image, index)}
            className="cursor-pointer"
            {...imageProps}
          >
            {(image.title || image.description) && (
              <div>
                {image.title && (
                  <h4 className="font-medium mb-1">{image.title}</h4>
                )}
                {image.description && (
                  <p className="text-sm opacity-90">{image.description}</p>
                )}
              </div>
            )}
          </Image>
        ))}
      </div>
    );
  }
);

ImageGrid.displayName = 'ImageGrid';

// Image Comparison Component
export interface ImageCompareProps {
  beforeImage: string;
  afterImage: string;
  beforeAlt?: string;
  afterAlt?: string;
  className?: string;
}

export const ImageCompare = forwardRef<HTMLDivElement, ImageCompareProps>(
  ({
    beforeImage,
    afterImage,
    beforeAlt = 'Before',
    afterAlt = 'After',
    className,
    ...props
  }, ref) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);
    
    const handleMouseMove = (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      setSliderPosition(Math.max(0, Math.min(100, percentage)));
    };
    
    return (
      <div
        ref={ref}
        className={cn('relative aspect-video overflow-hidden rounded-lg', className)}
        onMouseMove={handleMouseMove}
        {...props}
      >
        <div ref={containerRef} className="relative w-full h-full">
          {/* Before Image */}
          <Image
            src={beforeImage}
            alt={beforeAlt}
            className="absolute inset-0 w-full h-full"
            fit="cover"
          />
          
          {/* After Image */}
          {/* After Image - Dynamic width for slider interaction */}
          <div
            className="absolute inset-0 overflow-hidden [width:var(--slider-width)]"
            data-slider-width={sliderPosition}
          >
            <Image
              src={afterImage}
              alt={afterAlt}
              className="w-full h-full"
              fit="cover"
            />
          </div>
          
          {/* Slider */}
          {/* Slider handle - Dynamic position for interactive control */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize [left:var(--slider-left)]"
            data-slider-left={sliderPosition}
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 5l3 3-3 3V5z" />
                <path d="M12 5l-3 3 3 3V5z" />
              </svg>
            </div>
          </div>
          
          {/* Labels */}
          <div className="absolute top-4 left-4 px-2 py-1 bg-black/60 text-white text-sm rounded">
            Before
          </div>
          <div className="absolute top-4 right-4 px-2 py-1 bg-black/60 text-white text-sm rounded">
            After
          </div>
        </div>
      </div>
    );
  }
);

ImageCompare.displayName = 'ImageCompare';

export default Image;
