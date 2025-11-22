'use client';

import React, { forwardRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { UserIcon } from '@heroicons/react/24/outline';
import { cva, type VariantProps } from 'class-variance-authority';
import Image from 'next/image';
import { cn } from '../../lib/utils';

// Avatar variants using class-variance-authority
const avatarVariants = cva(
  'relative inline-flex items-center justify-center font-medium text-white select-none shrink-0',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-xs',
        sm: 'h-8 w-8 text-sm',
        md: 'h-10 w-10 text-base',
        lg: 'h-12 w-12 text-lg',
        xl: 'h-16 w-16 text-xl',
        '2xl': 'h-20 w-20 text-2xl',
        '3xl': 'h-24 w-24 text-3xl',
      },
      shape: {
        circle: 'rounded-full',
        square: 'rounded-md',
        rounded: 'rounded-lg',
      },
      variant: {
        solid: '',
        outline: 'border-2 bg-transparent',
        soft: 'bg-opacity-20',
      },
    },
    defaultVariants: {
      size: 'md',
      shape: 'circle',
      variant: 'solid',
    },
  }
);

const badgeVariants = cva(
  'absolute border-2 border-white rounded-full',
  {
    variants: {
      size: {
        xs: 'h-2 w-2 -top-0.5 -right-0.5',
        sm: 'h-2.5 w-2.5 -top-0.5 -right-0.5',
        md: 'h-3 w-3 -top-1 -right-1',
        lg: 'h-3.5 w-3.5 -top-1 -right-1',
        xl: 'h-4 w-4 -top-1.5 -right-1.5',
        '2xl': 'h-5 w-5 -top-2 -right-2',
        '3xl': 'h-6 w-6 -top-2 -right-2',
      },
      status: {
        online: 'bg-green-500',
        offline: 'bg-gray-500',
        away: 'bg-yellow-500',
        busy: 'bg-red-500',
      },
    },
  }
);

// Types
export interface AvatarProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  name?: string;
  fallback?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  badge?: React.ReactNode;
  borderColor?: string;
  backgroundColor?: string;
  textColor?: string;
  loading?: boolean;
  clickable?: boolean;
  onImageError?: () => void;
  onImageLoad?: () => void;
}

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  max?: number;
  size?: AvatarProps['size'];
  spacing?: 'tight' | 'normal' | 'loose';
  showTotal?: boolean;
  totalProps?: Partial<AvatarProps>;
}

// Color generation utilities
const generateColorFromName = (name: string): string => {
  const colors = [
    'bg-red-500',
    'bg-blue-500', 
    'bg-green-500',
    'bg-yellow-500',
    'bg-primary-500',
    'bg-pink-500',
    'bg-primary-600',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500',
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

// Avatar Image Component
const AvatarImage = forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement> & {
    onError?: () => void;
    onLoad?: () => void;
  }
>(({ className, onError, onLoad, src, alt, style }, ref) => {
  if (!src || typeof src !== 'string') return null;
  
  return (
    <Image
      ref={ref}
      src={src}
      alt={alt || ''}
      className={cn('h-full w-full object-cover', className)}
      onError={onError}
      onLoad={onLoad}
      fill
      style={style}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
});
AvatarImage.displayName = 'AvatarImage';

// Avatar Fallback Component
const AvatarFallback = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center bg-gray-100 text-gray-600',
      className
    )}
    {...props}
  >
    {children}
  </div>
));
AvatarFallback.displayName = 'AvatarFallback';

// Main Avatar Component
export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      className,
      size = 'md',
      shape = 'circle',
      variant = 'solid',
      src,
      alt,
      name,
      fallback,
      status,
      badge,
      borderColor,
      backgroundColor,
      textColor,
      loading = false,
      clickable = false,
      onImageError,
      onImageLoad,
      onClick,
      ...props
    },
    ref
  ) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handleImageLoad = useCallback(() => {
      setImageLoaded(true);
      setImageError(false);
      onImageLoad?.();
    }, [onImageLoad]);

    const handleImageError = useCallback(() => {
      setImageError(true);
      setImageLoaded(false);
      onImageError?.();
    }, [onImageError]);

    // Determine background color
    const bgColor = backgroundColor || (name ? generateColorFromName(name) : 'bg-gray-500');
    
    // Determine what to show as fallback
    const displayFallback = fallback || (name ? getInitials(name) : null);

    // Show image if src exists, loaded, and no error
    const showImage = src && imageLoaded && !imageError;
    
    // Show fallback if no src, image error, or custom fallback provided
    const showFallback = !src || imageError || (!imageLoaded && !loading);

    return (
      <div
        ref={ref}
        className={cn(
          avatarVariants({ size, shape, variant }),
          bgColor,
          clickable && 'cursor-pointer hover:opacity-80 transition-opacity',
          borderColor && `border-${borderColor}`,
          textColor && `text-${textColor}`,
          className
        )}
        onClick={clickable ? onClick : undefined}
        {...(clickable && { role: 'button' })}
        tabIndex={clickable ? 0 : undefined}
        {...props}
      >
        {/* Loading State */}
        {loading && (
          <motion.div
            className="absolute inset-0 bg-gray-200 rounded-inherit"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        )}

        {/* Image */}
        {src && (
          <AvatarImage
            src={src}
            alt={alt || name || 'Avatar'}
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={cn(
              'transition-opacity duration-200',
              showImage ? 'opacity-100' : 'opacity-0',
              shape === 'circle' && 'rounded-full',
              shape === 'square' && 'rounded-md',
              shape === 'rounded' && 'rounded-lg'
            )}
          />
        )}

        {/* Fallback */}
        {showFallback && (
          <AvatarFallback>
            {displayFallback || <UserIcon className={cn(
              size === 'xs' && 'h-3 w-3',
              size === 'sm' && 'h-4 w-4', 
              size === 'md' && 'h-5 w-5',
              size === 'lg' && 'h-6 w-6',
              size === 'xl' && 'h-8 w-8',
              size === '2xl' && 'h-10 w-10',
              size === '3xl' && 'h-12 w-12'
            )} />}
          </AvatarFallback>
        )}

        {/* Status Badge */}
        {status && (
          <div
            className={cn(
              badgeVariants({ size, status }),
              'z-10'
            )}
            aria-label={`Status: ${status}`}
          />
        )}

        {/* Custom Badge */}
        {badge && (
          <div className="absolute -top-1 -right-1 z-10">
            {badge}
          </div>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

// Avatar Group Component
export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  (
    {
      className,
      children,
      max = 3,
      size = 'md',
      spacing = 'normal',
      showTotal = true,
      totalProps,
      ...props
    },
    ref
  ) => {
    const childrenArray = React.Children.toArray(children);
    const visibleChildren = childrenArray.slice(0, max);
    const remainingCount = childrenArray.length - max;

    const spacingMap = {
      tight: '-space-x-1',
      normal: '-space-x-2',
      loose: '-space-x-3',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center',
          spacingMap[spacing],
          className
        )}
        {...props}
      >
        {visibleChildren.map((child, index) => (
          <div key={index} className="relative border-2 border-white rounded-full">
            {React.isValidElement(child) 
              ? React.cloneElement(child, { size } as { size: string })
              : child
            }
          </div>
        ))}
        
        {remainingCount > 0 && showTotal && (
          <Avatar
            size={size}
            fallback={`+${remainingCount}`}
            className="border-2 border-white bg-gray-500 text-white font-semibold"
            {...totalProps}
          />
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';

// Preset avatar components
export const UserAvatar: React.FC<AvatarProps> = (props) => (
  <Avatar {...props} />
);

export const GroupAvatar: React.FC<Omit<AvatarProps, 'fallback'>> = (props) => (
  <Avatar
    fallback="👥"
    backgroundColor="bg-blue-500"
    {...props}
  />
);

// Avatar with tooltip (requires tooltip component)
export interface AvatarWithTooltipProps extends AvatarProps {
  tooltip?: string;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
}

export const AvatarWithTooltip: React.FC<AvatarWithTooltipProps> = ({
  tooltip,
  tooltipPosition = 'top',
  ...avatarProps
}) => {
  // This would integrate with your tooltip component
  return (
    <div className="relative group">
      <Avatar {...avatarProps} />
      {tooltip && (
        <div className={cn(
          'absolute invisible group-hover:visible bg-gray-900 text-white text-xs rounded py-1 px-2 z-50',
          'transition-opacity duration-200 opacity-0 group-hover:opacity-100 whitespace-nowrap',
          tooltipPosition === 'top' && 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
          tooltipPosition === 'bottom' && 'top-full left-1/2 transform -translate-x-1/2 mt-2',
          tooltipPosition === 'left' && 'right-full top-1/2 transform -translate-y-1/2 mr-2',
          tooltipPosition === 'right' && 'left-full top-1/2 transform -translate-y-1/2 ml-2'
        )}>
          {tooltip}
        </div>
      )}
    </div>
  );
};

// Export sub-components
export { AvatarImage, AvatarFallback };

// Default export
export default Avatar;
