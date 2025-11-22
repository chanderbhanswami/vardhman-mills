'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  ClockIcon, 
  FireIcon, 
  TagIcon, 
  SparklesIcon,
  ArrowRightIcon,
  XMarkIcon,
  ShareIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';
import type { Sale } from '../../types/sale.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SaleBannerProps {
  sale: Sale;
  variant?: 'hero' | 'compact' | 'card' | 'minimal' | 'fullwidth';
  showCountdown?: boolean;
  showDiscount?: boolean;
  showProducts?: boolean;
  closable?: boolean;
  onClose?: () => void;
  onSaveToggle?: (saved: boolean) => void;
  onShare?: () => void;
  onClick?: () => void;
  priority?: boolean;
  animated?: boolean;
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const calculateTimeRemaining = (endDate: string | Date) => {
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const now = new Date();
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
};

const getSaleTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    flash_sale: 'Flash Sale',
    seasonal_sale: 'Seasonal Sale',
    clearance_sale: 'Clearance',
    end_of_season: 'End of Season',
    festival_sale: 'Festival Sale',
    mega_sale: 'Mega Sale',
    weekend_sale: 'Weekend Sale',
    daily_deals: 'Daily Deals',
    member_sale: 'Members Only',
    brand_sale: 'Brand Sale',
    category_sale: 'Category Sale',
    new_arrival_sale: 'New Arrivals',
    bundle_sale: 'Bundle Deal',
    buy_one_get_one: 'BOGO',
    pre_order_sale: 'Pre-Order',
    warehouse_sale: 'Warehouse Sale',
    liquidation_sale: 'Final Sale',
  };
  return labels[type] || 'Sale';
};

const getDiscountLabel = (sale: Sale): string => {
  if (!sale.discountRules || sale.discountRules.length === 0) return 'Special Offer';
  
  const rule = sale.discountRules[0];
  const discount = rule.discount;
  
  if (rule.type === 'percentage' && discount.value) {
    return `Up to ${discount.value}% OFF`;
  }
  if (rule.type === 'fixed_amount' && discount.value) {
    return `Save ${discount.value}`;
  }
  if (rule.type === 'buy_x_get_y' && discount.buyQuantity && discount.getQuantity) {
    return `Buy ${discount.buyQuantity} Get ${discount.getQuantity} Free`;
  }
  return 'Special Discount';
};

// ============================================================================
// COUNTDOWN COMPONENT
// ============================================================================

const CountdownTimer: React.FC<{ endDate: string | Date; variant?: 'inline' | 'card' }> = ({ 
  endDate, 
  variant = 'inline' 
}) => {
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(endDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(endDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (timeRemaining.expired) {
    return (
      <div className="text-red-600 font-semibold flex items-center gap-2">
        <ClockIcon className="h-5 w-5" />
        <span>Sale Ended</span>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="grid grid-cols-4 gap-2">
        {[
          { value: timeRemaining.days, label: 'Days' },
          { value: timeRemaining.hours, label: 'Hours' },
          { value: timeRemaining.minutes, label: 'Mins' },
          { value: timeRemaining.seconds, label: 'Secs' },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-900 text-white rounded-lg p-2 text-center"
          >
            <div className="text-2xl font-bold">{String(item.value).padStart(2, '0')}</div>
            <div className="text-xs opacity-75">{item.label}</div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm font-semibold">
      <ClockIcon className="h-5 w-5 text-red-500" />
      <span>
        {timeRemaining.days > 0 && `${timeRemaining.days}d `}
        {String(timeRemaining.hours).padStart(2, '0')}:
        {String(timeRemaining.minutes).padStart(2, '0')}:
        {String(timeRemaining.seconds).padStart(2, '0')}
      </span>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const SaleBanner: React.FC<SaleBannerProps> = ({
  sale,
  variant = 'hero',
  showCountdown = true,
  showDiscount = true,
  showProducts = false,
  closable = false,
  onClose,
  onSaveToggle,
  onShare,
  onClick,
  priority = false,
  animated = true,
  className,
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const handleSaveToggle = () => {
    const newState = !isSaved;
    setIsSaved(newState);
    onSaveToggle?.(newState);
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  const bannerContent = (
    <>
      {/* Minimal Variant */}
      {variant === 'minimal' && (
        <div className={cn(
          'flex items-center justify-between p-4 bg-gradient-to-r from-red-500 to-pink-500 text-white',
          className
        )}>
          <div className="flex items-center gap-4 flex-1">
            <FireIcon className="h-6 w-6 animate-pulse" />
            <div>
              <h3 className="font-bold text-lg">{sale.name}</h3>
              {showDiscount && (
                <p className="text-sm opacity-90">{getDiscountLabel(sale)}</p>
              )}
            </div>
          </div>
          
          {showCountdown && (
            <div className="flex items-center gap-4">
              <CountdownTimer endDate={sale.schedule.endDate} />
              <Button
                variant="secondary"
                size="sm"
                onClick={onClick}
                rightIcon={<ArrowRightIcon className="h-4 w-4" />}
              >
                Shop Now
              </Button>
            </div>
          )}

          {closable && (
            <button
              onClick={handleClose}
              className="ml-4 p-1 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close banner"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      )}

      {/* Compact Variant */}
      {variant === 'compact' && (
        <Card className={cn('overflow-hidden', className)}>
          <div className="relative h-48">
            <Image
              src={sale.thumbnailImage.url}
              alt={sale.name}
              fill
              className="object-cover"
              priority={priority}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge variant="destructive" className="backdrop-blur-sm">
                <FireIcon className="h-3 w-3 mr-1" />
                {getSaleTypeLabel(sale.type)}
              </Badge>
              {showDiscount && (
                <Badge variant="warning" className="backdrop-blur-sm">
                  {getDiscountLabel(sale)}
                </Badge>
              )}
            </div>

            {/* Actions */}
            <div className="absolute top-4 right-4 flex gap-2">
              {onSaveToggle && (
                <button
                  onClick={handleSaveToggle}
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                  aria-label={isSaved ? 'Unsave' : 'Save'}
                >
                  {isSaved ? (
                    <BookmarkSolidIcon className="h-5 w-5 text-red-500" />
                  ) : (
                    <BookmarkIcon className="h-5 w-5 text-gray-700" />
                  )}
                </button>
              )}
              {onShare && (
                <button
                  onClick={onShare}
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                  aria-label="Share"
                >
                  <ShareIcon className="h-5 w-5 text-gray-700" />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-white font-bold text-xl mb-2">{sale.name}</h3>
              {showCountdown && (
                <div className="flex items-center justify-between">
                  <CountdownTimer endDate={sale.schedule.endDate} variant="inline" />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onClick}
                  >
                    Shop Now
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Card Variant */}
      {variant === 'card' && (
        <Card className={cn('overflow-hidden hover:shadow-xl transition-shadow', className)}>
          <div className="relative h-64">
            <Image
              src={sale.bannerImage.url}
              alt={sale.name}
              fill
              className="object-cover"
              priority={priority}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/30 to-transparent" />
            
            {/* Top Badges */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
              <div className="flex flex-wrap gap-2">
                <Badge variant="destructive" size="lg" className="backdrop-blur-md">
                  <FireIcon className="h-4 w-4 mr-1 animate-pulse" />
                  {getSaleTypeLabel(sale.type)}
                </Badge>
                {sale.featured && (
                  <Badge variant="warning" size="lg" className="backdrop-blur-md">
                    <SparklesIcon className="h-4 w-4 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                {onSaveToggle && (
                  <button
                    onClick={handleSaveToggle}
                    className="p-2.5 bg-white/95 backdrop-blur-sm rounded-full hover:bg-white transition-all hover:scale-110"
                    aria-label={isSaved ? 'Remove from saved' : 'Save sale'}
                    title={isSaved ? 'Remove from saved' : 'Save sale'}
                  >
                    {isSaved ? (
                      <BookmarkSolidIcon className="h-5 w-5 text-red-500" />
                    ) : (
                      <BookmarkIcon className="h-5 w-5 text-gray-700" />
                    )}
                  </button>
                )}
                {onShare && (
                  <button
                    onClick={onShare}
                    className="p-2.5 bg-white/95 backdrop-blur-sm rounded-full hover:bg-white transition-all hover:scale-110"
                    aria-label="Share sale"
                    title="Share sale"
                  >
                    <ShareIcon className="h-5 w-5 text-gray-700" />
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
              <div className="text-white space-y-3">
                <h2 className="text-3xl font-bold">{sale.name}</h2>
                {sale.shortDescription && (
                  <p className="text-white/90 line-clamp-2">{sale.shortDescription}</p>
                )}
                {showDiscount && (
                  <div className="inline-flex items-center gap-2 bg-yellow-400 text-gray-900 px-4 py-2 rounded-full font-bold text-lg">
                    <TagIcon className="h-5 w-5" />
                    {getDiscountLabel(sale)}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {showCountdown && (
              <div>
                <p className="text-sm text-gray-600 mb-3 font-medium">Sale Ends In:</p>
                <CountdownTimer endDate={sale.schedule.endDate} variant="card" />
              </div>
            )}

            {showProducts && (
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{sale.productCount} Products</span>
                <span>{sale.soldInventory} Sold</span>
              </div>
            )}

            <Button
              variant="default"
              size="lg"
              fullWidth
              onClick={onClick}
              rightIcon={<ArrowRightIcon className="h-5 w-5" />}
            >
              Shop {sale.name}
            </Button>
          </div>
        </Card>
      )}

      {/* Hero Variant */}
      {variant === 'hero' && (
        <div className={cn('relative overflow-hidden rounded-2xl', className)}>
          <div className="relative h-[500px] md:h-[600px]">
            <Image
              src={sale.bannerImage.url}
              alt={sale.name}
              fill
              className="object-cover"
              priority={priority}
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-6 md:px-12">
                <div className="max-w-2xl space-y-6">
                  {/* Badges */}
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="destructive" size="xl" className="backdrop-blur-md">
                      <FireIcon className="h-5 w-5 mr-2 animate-pulse" />
                      {getSaleTypeLabel(sale.type)}
                    </Badge>
                    {sale.featured && (
                      <Badge variant="warning" size="xl" className="backdrop-blur-md">
                        <SparklesIcon className="h-5 w-5 mr-2" />
                        Featured Event
                      </Badge>
                    )}
                  </div>

                  {/* Title */}
                  <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                    {sale.name}
                  </h1>

                  {/* Description */}
                  {sale.description && (
                    <p className="text-xl text-white/90 max-w-xl">
                      {sale.description}
                    </p>
                  )}

                  {/* Discount Badge */}
                  {showDiscount && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.2 }}
                      className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-8 py-4 rounded-full font-bold text-2xl shadow-xl"
                    >
                      <TagIcon className="h-7 w-7" />
                      {getDiscountLabel(sale)}
                    </motion.div>
                  )}

                  {/* Countdown */}
                  {showCountdown && (
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 space-y-3">
                      <p className="text-white/90 font-medium text-lg">Sale Ends In:</p>
                      <CountdownTimer endDate={sale.schedule.endDate} variant="card" />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-4 pt-4">
                    <Button
                      variant="gradient"
                      size="xl"
                      onClick={onClick}
                      rightIcon={<ArrowRightIcon className="h-6 w-6" />}
                      className="shadow-xl"
                    >
                      Shop Now
                    </Button>
                    {onShare && (
                      <Button
                        variant="outline"
                        size="xl"
                        onClick={onShare}
                        leftIcon={<ShareIcon className="h-5 w-5" />}
                        className="bg-white/90 backdrop-blur-sm hover:bg-white"
                      >
                        Share
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Close button */}
            {closable && (
              <button
                onClick={handleClose}
                className="absolute top-6 right-6 p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all hover:scale-110"
                aria-label="Close"
              >
                <XMarkIcon className="h-6 w-6 text-gray-700" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Fullwidth Variant */}
      {variant === 'fullwidth' && (
        <div className={cn('relative overflow-hidden', className)}>
          <div className="relative h-64 md:h-80">
            <Image
              src={sale.bannerImage.url}
              alt={sale.name}
              fill
              className="object-cover"
              priority={priority}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
            
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex gap-2">
                      <Badge variant="destructive" className="backdrop-blur-sm">
                        <FireIcon className="h-4 w-4 mr-1" />
                        {getSaleTypeLabel(sale.type)}
                      </Badge>
                      {showDiscount && (
                        <Badge variant="warning" className="backdrop-blur-sm">
                          {getDiscountLabel(sale)}
                        </Badge>
                      )}
                    </div>
                    
                    <h2 className="text-4xl font-bold text-white">{sale.name}</h2>
                    
                    {sale.shortDescription && (
                      <p className="text-white/90 text-lg max-w-2xl">
                        {sale.shortDescription}
                      </p>
                    )}
                  </div>

                  <div className="flex-shrink-0 space-y-4">
                    {showCountdown && (
                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
                        <CountdownTimer endDate={sale.schedule.endDate} variant="card" />
                      </div>
                    )}
                    <Button
                      variant="gradient"
                      size="lg"
                      onClick={onClick}
                      rightIcon={<ArrowRightIcon className="h-5 w-5" />}
                      className="w-full md:w-auto"
                    >
                      Shop Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {closable && (
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all"
                aria-label="Close"
              >
                <XMarkIcon className="h-5 w-5 text-gray-700" />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );

  if (animated) {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: variant === 'minimal' ? -20 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: variant === 'minimal' ? -20 : 20 }}
            transition={{ duration: 0.3 }}
          >
            {bannerContent}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return isVisible ? bannerContent : null;
};

export default SaleBanner;
