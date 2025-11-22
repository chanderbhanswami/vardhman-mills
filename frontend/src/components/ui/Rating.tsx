'use client';

import React, { useState, useCallback, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { StarIcon, HeartIcon, HandThumbUpIcon } from '@heroicons/react/24/outline';
import { 
  StarIcon as StarIconSolid, 
  HeartIcon as HeartIconSolid,
  HandThumbUpIcon as HandThumbUpIconSolid 
} from '@heroicons/react/24/solid';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Rating variants
const ratingVariants = cva(
  'inline-flex items-center gap-1',
  {
    variants: {
      variant: {
        default: '',
        success: 'text-green-500',
        warning: 'text-yellow-500',
        destructive: 'text-red-500'
      },
      size: {
        sm: 'text-sm',
        default: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

// Rating icon variants
const iconVariants = cva(
  'transition-all duration-200 cursor-pointer',
  {
    variants: {
      size: {
        sm: 'w-4 h-4',
        default: 'w-5 h-5',
        lg: 'w-6 h-6',
        xl: 'w-8 h-8'
      },
      state: {
        empty: 'text-muted-foreground/40 hover:text-muted-foreground/60',
        filled: 'text-current',
        hover: 'text-current/80 scale-110'
      }
    },
    defaultVariants: {
      size: 'default',
      state: 'empty'
    }
  }
);

// Base Rating Props
export interface RatingProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
    VariantProps<typeof ratingVariants> {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  max?: number;
  precision?: number;
  readOnly?: boolean;
  disabled?: boolean;
  allowHalf?: boolean;
  allowClear?: boolean;
  icon?: 'star' | 'heart' | 'thumbs' | React.ComponentType<React.SVGProps<SVGSVGElement>>;
  emptyIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  filledIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  showValue?: boolean;
  showCount?: boolean;
  count?: number;
  labels?: string[];
  color?: string;
  emptyColor?: string;
  hoverable?: boolean;
  animate?: boolean;
}

// Get icon components based on type
const getIconComponents = (iconType: RatingProps['icon']) => {
  switch (iconType) {
    case 'heart':
      return { empty: HeartIcon, filled: HeartIconSolid };
    case 'thumbs':
      return { empty: HandThumbUpIcon, filled: HandThumbUpIconSolid };
    case 'star':
    default:
      return { empty: StarIcon, filled: StarIconSolid };
  }
};

// Rating Component
export const Rating = forwardRef<HTMLDivElement, RatingProps>(
  ({
    className,
    value,
    defaultValue = 0,
    onChange,
    max = 5,
    precision = 1,
    readOnly = false,
    disabled = false,
    allowHalf = false,
    allowClear = false,
    icon = 'star',
    emptyIcon,
    filledIcon,
    showValue = false,
    showCount = false,
    count,
    labels = [],
    emptyColor,
    hoverable = true,
    animate = true,
    variant,
    size,
    onMouseEnter,
    onMouseLeave,
    onKeyDown,
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [hoverValue, setHoverValue] = useState<number | null>(null);
    
    const currentValue = value !== undefined ? value : internalValue;
    const displayValue = hoverValue !== null ? hoverValue : currentValue;
    
    const handleChange = useCallback((newValue: number) => {
      if (readOnly || disabled) return;
      
      // Allow clearing if same value is clicked and allowClear is true
      if (allowClear && newValue === currentValue) {
        newValue = 0;
      }
      
      if (value === undefined) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    }, [value, onChange, readOnly, disabled, allowClear, currentValue]);

    const handleMouseEnter = useCallback((index: number, half?: boolean) => {
      if (!hoverable || readOnly || disabled) return;
      
      const newValue = allowHalf && half ? index + 0.5 : index + 1;
      setHoverValue(newValue);
    }, [hoverable, readOnly, disabled, allowHalf]);

    const handleMouseLeave = useCallback(() => {
      if (!hoverable || readOnly || disabled) return;
      setHoverValue(null);
    }, [hoverable, readOnly, disabled]);

    const handleClick = useCallback((index: number, half?: boolean) => {
      if (readOnly || disabled) return;
      
      const newValue = allowHalf && half ? index + 0.5 : index + 1;
      handleChange(newValue);
    }, [readOnly, disabled, allowHalf, handleChange]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
      if (readOnly || disabled) return;
      
      let newValue = currentValue;
      
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          event.preventDefault();
          newValue = Math.min(max, currentValue + (allowHalf ? 0.5 : 1));
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          event.preventDefault();
          newValue = Math.max(0, currentValue - (allowHalf ? 0.5 : 1));
          break;
        case 'Home':
          event.preventDefault();
          newValue = 0;
          break;
        case 'End':
          event.preventDefault();
          newValue = max;
          break;
        case ' ':
        case 'Enter':
          event.preventDefault();
          return;
        default:
          onKeyDown?.(event as React.KeyboardEvent<HTMLDivElement>);
          return;
      }
      
      handleChange(newValue);
      onKeyDown?.(event as React.KeyboardEvent<HTMLDivElement>);
    }, [readOnly, disabled, currentValue, max, allowHalf, handleChange, onKeyDown]);

    // Get icon components
    const { empty: EmptyIcon, filled: FilledIcon } = typeof icon === 'string' 
      ? getIconComponents(icon) 
      : { empty: emptyIcon || StarIcon, filled: filledIcon || StarIconSolid };

    // Calculate if icon should be filled
    const isIconFilled = (index: number) => {
      const threshold = index + 1;
      const halfThreshold = index + 0.5;
      
      if (displayValue >= threshold) return 'full';
      if (allowHalf && displayValue >= halfThreshold) return 'half';
      return 'empty';
    };

    return (
      <div
        ref={ref}
        className={cn(ratingVariants({ variant, size }), className)}
        role="radiogroup"
        aria-label="Rating"
        tabIndex={readOnly || disabled ? -1 : 0}
        onMouseLeave={(e) => {
          handleMouseLeave();
          onMouseLeave?.(e);
        }}
        onMouseEnter={onMouseEnter}
        onKeyDown={handleKeyDown}
        {...props}
      >
        <div className="flex items-center gap-0.5">
          {Array.from({ length: max }, (_, index) => {
            const fillState = isIconFilled(index);
            
            return (
              <div
                key={index}
                className="relative cursor-pointer"
                onMouseEnter={() => handleMouseEnter(index)}
                onClick={() => handleClick(index)}
              >
                {allowHalf ? (
                  <div className="relative">
                    {/* Empty icon (background) */}
                    <EmptyIcon
                      className={cn(
                        iconVariants({ size, state: 'empty' }),
                        disabled && 'cursor-not-allowed opacity-50'
                      )}
                      data-empty-color={emptyColor}
                    />
                    
                    {/* Half fill */}
                    {fillState === 'half' && (
                      <div className="absolute inset-0 overflow-hidden w-1/2">
                        <FilledIcon
                          className={cn(iconVariants({ size, state: 'filled' }))}
                        />
                      </div>
                    )}
                    
                    {/* Full fill */}
                    {fillState === 'full' && (
                      <div className="absolute inset-0">
                        <FilledIcon
                          className={cn(iconVariants({ size, state: 'filled' }))}
                        />
                      </div>
                    )}
                    
                    {/* Half hover area */}
                    <div 
                      className="absolute inset-0 w-1/2"
                      onMouseEnter={() => handleMouseEnter(index, true)}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClick(index, true);
                      }}
                    />
                  </div>
                ) : (
                  <motion.div
                    whileHover={animate && !disabled && !readOnly ? { scale: 1.1 } : {}}
                    whileTap={animate && !disabled && !readOnly ? { scale: 0.95 } : {}}
                  >
                    {fillState !== 'empty' ? (
                      <FilledIcon
                        className={cn(
                          iconVariants({ size, state: 'filled' }),
                          disabled && 'cursor-not-allowed opacity-50'
                        )}
                      />
                    ) : (
                      <EmptyIcon
                        className={cn(
                          iconVariants({ size, state: 'empty' }),
                          disabled && 'cursor-not-allowed opacity-50'
                        )}
                        data-empty-color={emptyColor}
                      />
                    )}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {/* Value display */}
        {showValue && (
          <span className="ml-2 text-sm font-medium">
            {displayValue.toFixed(precision === 0.5 ? 1 : 0)}
          </span>
        )}

        {/* Count display */}
        {showCount && count !== undefined && (
          <span className="ml-1 text-sm text-muted-foreground">
            ({count.toLocaleString()})
          </span>
        )}

        {/* Label display */}
        {labels.length > 0 && (
          <span className="ml-2 text-sm text-muted-foreground">
            {labels[Math.floor(displayValue) - 1] || labels[0]}
          </span>
        )}
      </div>
    );
  }
);

Rating.displayName = 'Rating';

// Read-only Rating Display
export interface RatingDisplayProps extends Omit<RatingProps, 'onChange'> {
  precision?: number;
}

export const RatingDisplay = forwardRef<HTMLDivElement, RatingDisplayProps>(
  ({ precision = 0.1, ...props }, ref) => {
    return (
      <Rating
        ref={ref}
        readOnly
        hoverable={false}
        precision={precision}
        {...props}
      />
    );
  }
);

RatingDisplay.displayName = 'RatingDisplay';

// Star Rating (preset)
export const StarRating = forwardRef<HTMLDivElement, RatingProps>(
  (props, ref) => {
    return <Rating ref={ref} icon="star" {...props} />;
  }
);

StarRating.displayName = 'StarRating';

// Heart Rating (preset)
export const HeartRating = forwardRef<HTMLDivElement, RatingProps>(
  (props, ref) => {
    return <Rating ref={ref} icon="heart" variant="destructive" {...props} />;
  }
);

HeartRating.displayName = 'HeartRating';

// Thumbs Rating (preset)
export const ThumbsRating = forwardRef<HTMLDivElement, RatingProps>(
  (props, ref) => {
    return <Rating ref={ref} icon="thumbs" variant="success" {...props} />;
  }
);

ThumbsRating.displayName = 'ThumbsRating';

// Rating with Reviews
export interface RatingWithReviewsProps extends RatingProps {
  reviews?: {
    rating: number;
    count: number;
  }[];
  showDistribution?: boolean;
  averageRating?: number;
  totalReviews?: number;
}

export const RatingWithReviews = forwardRef<HTMLDivElement, RatingWithReviewsProps>(
  ({
    reviews = [],
    showDistribution = true,
    averageRating,
    totalReviews,
    className,
    ...props
  }, ref) => {
    const maxCount = Math.max(...reviews.map(r => r.count));

    return (
      <div ref={ref} className={cn('space-y-4', className)}>
        {/* Main rating display */}
        <div className="flex items-center gap-4">
          <Rating {...props} value={averageRating} readOnly />
          {averageRating && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">{averageRating.toFixed(1)}</span>
              {totalReviews && (
                <span className="ml-1">({totalReviews.toLocaleString()} reviews)</span>
              )}
            </div>
          )}
        </div>

        {/* Rating distribution */}
        {showDistribution && reviews.length > 0 && (
          <div className="space-y-2">
            {reviews.map((review, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <span className="w-8">{review.rating}</span>
                <StarIcon className="w-4 h-4 text-yellow-500" />
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-yellow-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(review.count / maxCount) * 100}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  />
                </div>
                <span className="w-12 text-right text-muted-foreground">
                  {review.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

RatingWithReviews.displayName = 'RatingWithReviews';

// Animated Rating
export const AnimatedRating = forwardRef<HTMLDivElement, RatingProps>(
  ({ animate = true, ...props }, ref) => {
    return <Rating ref={ref} animate={animate} {...props} />;
  }
);

AnimatedRating.displayName = 'AnimatedRating';

export default Rating;

