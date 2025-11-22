'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import Image from 'next/image';
import { format } from 'date-fns';
import {
  CreditCardIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  TagIcon,
  DocumentDuplicateIcon,
  QrCodeIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  LinkIcon,
  EllipsisHorizontalIcon,
  InformationCircleIcon,
  SparklesIcon,
  TrophyIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon,
  FireIcon as FireSolidIcon
} from '@heroicons/react/24/solid';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tooltip } from '../ui/Tooltip';
import { toast } from 'react-hot-toast';

// Types
import {
  GiftCard
} from '../../types/giftCard.types';

export interface GiftCardCardProps {
  giftCard: GiftCard;
  variant?: 'default' | 'compact' | 'detailed' | 'preview' | 'interactive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  orientation?: 'portrait' | 'landscape' | 'auto';
  showBalance?: boolean;
  showCode?: boolean;
  showActions?: boolean;
  showStatus?: boolean;
  showDetailsPanel?: boolean;
  showCustomization?: boolean;
  showAnimation?: boolean;
  interactive?: boolean;
  selectable?: boolean;
  selected?: boolean;
  disabled?: boolean;
  loading?: boolean;
  preview?: boolean;
  editable?: boolean;
  favorite?: boolean;
  trending?: boolean;
  featured?: boolean;
  onSelect?: (giftCard: GiftCard) => void;
  onFavorite?: (giftCard: GiftCard, isFavorite: boolean) => void;
  onShare?: (giftCard: GiftCard) => void;
  onView?: (giftCard: GiftCard) => void;
  onEdit?: (giftCard: GiftCard) => void;
  onRedeem?: (giftCard: GiftCard) => void;
  onReload?: (giftCard: GiftCard) => void;
  onTransfer?: (giftCard: GiftCard) => void;
  onCopyCode?: (code: string) => void;
  onDownload?: (giftCard: GiftCard) => void;
  onPrint?: (giftCard: GiftCard) => void;
  onDelete?: (giftCard: GiftCard) => void;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

// Status configurations
const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'yellow',
    icon: ClockIcon,
    description: 'Awaiting activation'
  },
  active: {
    label: 'Active',
    color: 'green',
    icon: CheckCircleIcon,
    description: 'Ready to use'
  },
  inactive: {
    label: 'Inactive',
    color: 'gray',
    icon: ExclamationTriangleIcon,
    description: 'Not available'
  },
  expired: {
    label: 'Expired',
    color: 'red',
    icon: ExclamationTriangleIcon,
    description: 'No longer valid'
  },
  used: {
    label: 'Used',
    color: 'blue',
    icon: CheckCircleIcon,
    description: 'Fully redeemed'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'red',
    icon: ExclamationTriangleIcon,
    description: 'Cancelled'
  },
  fraudulent: {
    label: 'Fraudulent',
    color: 'red',
    icon: ShieldCheckIcon,
    description: 'Suspicious activity'
  },
  locked: {
    label: 'Locked',
    color: 'orange',
    icon: ExclamationTriangleIcon,
    description: 'Temporarily locked'
  }
};

// Type configurations
const typeConfig = {
  digital: {
    label: 'Digital',
    icon: DevicePhoneMobileIcon,
    description: 'Digital gift card'
  },
  physical: {
    label: 'Physical',
    icon: CreditCardIcon,
    description: 'Physical gift card'
  },
  hybrid: {
    label: 'Hybrid',
    icon: QrCodeIcon,
    description: 'Digital & Physical'
  },
  corporate: {
    label: 'Corporate',
    icon: TrophyIcon,
    description: 'Corporate gift card'
  },
  promotional: {
    label: 'Promotional',
    icon: TagIcon,
    description: 'Promotional offer'
  },
  reward: {
    label: 'Reward',
    icon: StarIcon,
    description: 'Reward gift card'
  },
  loyalty: {
    label: 'Loyalty',
    icon: HeartIcon,
    description: 'Loyalty program'
  }
};

// Delivery method configurations
const deliveryConfig = {
  email: {
    label: 'Email',
    icon: EnvelopeIcon,
    description: 'Delivered via email'
  },
  sms: {
    label: 'SMS',
    icon: DevicePhoneMobileIcon,
    description: 'Delivered via SMS'
  },
  physical_mail: {
    label: 'Mail',
    icon: CreditCardIcon,
    description: 'Physical mail delivery'
  },
  in_store_pickup: {
    label: 'Pickup',
    icon: UserIcon,
    description: 'In-store pickup'
  },
  digital_download: {
    label: 'Download',
    icon: LinkIcon,
    description: 'Digital download'
  },
  mobile_app: {
    label: 'App',
    icon: DevicePhoneMobileIcon,
    description: 'Mobile app delivery'
  },
  social_media: {
    label: 'Social',
    icon: ShareIcon,
    description: 'Social media sharing'
  }
};

// Animation variants
const cardVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      duration: 0.3
    }
  },
  exit: { 
    opacity: 0, 
    y: -20, 
    scale: 0.95,
    transition: {
      duration: 0.2
    }
  },
  hover: {
    y: -4,
    scale: 1.02,
    transition: {
      duration: 0.2
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1
    }
  }
};

const shimmerVariants = {
  initial: { x: '-100%' },
  animate: {
    x: '100%',
    transition: {
      repeat: Infinity,
      duration: 1.5
    }
  }
};

// Helper functions
const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

const formatDate = (date: Date | string): string => {
  return format(new Date(date), 'MMM dd, yyyy');
};

const getBalancePercentage = (balance: number, original: number): number => {
  if (original === 0) return 0;
  return Math.round((balance / original) * 100);
};

// Main component
const GiftCardCard: React.FC<GiftCardCardProps> = ({
  giftCard,
  variant = 'default',
  size = 'md',
  orientation = 'auto',
  showBalance = true,
  showCode = false,
  showActions = true,
  showStatus = true,
  showCustomization = true,
  showAnimation = true,
  interactive = true,
  selectable = false,
  selected = false,
  disabled = false,
  loading = false,
  favorite = false,
  trending = false,
  featured = false,
  onSelect,
  onFavorite,
  onShare,
  onView,
  onEdit,
  onRedeem,
  onReload,
  onCopyCode,
  onDownload,
  onDelete,
  className,
  style,
  children
}) => {
  const [isFavorited, setIsFavorited] = useState(favorite);
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Handle favorite toggle
  const handleFavorite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavoriteState = !isFavorited;
    setIsFavorited(newFavoriteState);
    onFavorite?.(giftCard, newFavoriteState);
    
    toast.success(
      newFavoriteState ? 'Added to favorites' : 'Removed from favorites'
    );
  }, [isFavorited, onFavorite, giftCard]);

  // Handle card click
  const handleCardClick = useCallback(() => {
    if (disabled || loading) return;
    
    if (selectable) {
      onSelect?.(giftCard);
    } else {
      onView?.(giftCard);
    }
  }, [disabled, loading, selectable, onSelect, onView, giftCard]);

  // Handle copy code
  const handleCopyCode = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(giftCard.code);
      onCopyCode?.(giftCard.code);
      toast.success('Gift card code copied!');
    } catch {
      toast.error('Failed to copy code');
    }
  }, [giftCard.code, onCopyCode]);

  // Handle share
  const handleShare = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: giftCard.title,
          text: giftCard.description,
          url: window.location.href
        });
      } catch {
        // User cancelled sharing
      }
    } else {
      // Fallback to copy link
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      } catch {
        toast.error('Failed to share');
      }
    }
    
    onShare?.(giftCard);
  }, [giftCard, onShare]);

  // Calculate derived values
  const status = statusConfig[giftCard.status];
  const type = typeConfig[giftCard.type];
  const delivery = deliveryConfig[giftCard.deliveryMethod];
  const balancePercentage = getBalancePercentage(giftCard.balance, giftCard.originalAmount);
  const isExpiringSoon = giftCard.expiresAt && 
    new Date(giftCard.expiresAt).getTime() - new Date().getTime() < 30 * 24 * 60 * 60 * 1000; // 30 days
  const isLowBalance = balancePercentage < 25;
  const hasCustomization = giftCard.customization && (
    giftCard.customization.hasPersonalMessage || 
    giftCard.customization.recipientName ||
    giftCard.customization.customBackground
  );

  // Get card dimensions based on size and orientation
  const getCardDimensions = () => {
    const orientationClass = orientation === 'auto' 
      ? (size === 'sm' ? 'portrait' : 'landscape')
      : orientation;

    const sizeClasses = {
      sm: orientationClass === 'portrait' 
        ? 'w-48 h-32' 
        : 'w-64 h-40',
      md: orientationClass === 'portrait' 
        ? 'w-56 h-36' 
        : 'w-80 h-48',
      lg: orientationClass === 'portrait' 
        ? 'w-64 h-40' 
        : 'w-96 h-56',
      xl: orientationClass === 'portrait' 
        ? 'w-72 h-48' 
        : 'w-[28rem] h-64'
    };

    return sizeClasses[size];
  };

  // Get variant classes
  const getVariantClasses = () => {
    const base = 'relative overflow-hidden border-2 transition-all duration-300';
    
    switch (variant) {
      case 'compact':
        return `${base} rounded-lg bg-white shadow-sm hover:shadow-md border-gray-200`;
      case 'detailed':
        return `${base} rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-lg hover:shadow-xl border-gray-300`;
      case 'preview':
        return `${base} rounded-lg bg-white shadow-md border-gray-300`;
      case 'interactive':
        return `${base} rounded-xl bg-white shadow-lg hover:shadow-2xl transform hover:-translate-y-1 border-gray-200 cursor-pointer`;
      default:
        return `${base} rounded-lg bg-white shadow-sm hover:shadow-lg border-gray-200`;
    }
  };

  // Render background design
  const renderBackground = () => {
    if (giftCard.design?.backgroundImage?.url) {
      return (
        <div className="absolute inset-0 z-0">
          <Image
            src={giftCard.design.backgroundImage.url}
            alt={giftCard.design.backgroundImage.alt || 'Gift card background'}
            fill
            className="object-cover"
            onLoad={() => setIsImageLoading(false)}
            onError={() => setIsImageLoading(false)}
          />
          {isImageLoading && (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50">
              <motion.div
                variants={shimmerVariants}
                initial="initial"
                animate="animate"
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
            </div>
          )}
        </div>
      );
    }

    // Default gradient background
    const gradients = [
      'from-blue-400 to-purple-500',
      'from-green-400 to-blue-500',
      'from-pink-400 to-red-500',
      'from-yellow-400 to-orange-500',
      'from-purple-400 to-pink-500',
      'from-indigo-400 to-purple-500'
    ];
    
    const gradientClass = gradients[Math.abs(giftCard.id.toString().charCodeAt(0)) % gradients.length];
    
    return (
      <div className={`absolute inset-0 z-0 bg-gradient-to-br ${gradientClass} opacity-90`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/20 rounded-full -translate-x-16 -translate-y-16" />
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-12 translate-y-12" />
      </div>
    );
  };

  // Render status indicators
  const renderStatusIndicators = () => (
    <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
      {/* Main status */}
      {showStatus && (
        <Badge
          variant={status.color === 'green' ? 'success' : status.color === 'red' ? 'destructive' : status.color === 'yellow' ? 'warning' : 'secondary'}
          size="sm"
          className="text-xs font-medium shadow-sm"
        >
          <status.icon className="w-3 h-3 mr-1" />
          {status.label}
        </Badge>
      )}

      {/* Special indicators */}
      {featured && (
        <Badge variant="gradient" size="sm" className="text-xs font-medium">
          <SparklesIcon className="w-3 h-3 mr-1" />
          Featured
        </Badge>
      )}

      {trending && (
        <Badge variant="warning" size="sm" className="text-xs font-medium">
          <FireSolidIcon className="w-3 h-3 mr-1" />
          Trending
        </Badge>
      )}

      {isExpiringSoon && giftCard.status === 'active' && (
        <Badge variant="warning" size="sm" className="text-xs font-medium">
          <ClockIcon className="w-3 h-3 mr-1" />
          Expires Soon
        </Badge>
      )}

      {isLowBalance && giftCard.status === 'active' && showBalance && (
        <Badge variant="warning" size="sm" className="text-xs font-medium">
          <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
          Low Balance
        </Badge>
      )}
    </div>
  );

  // Render corner actions
  const renderCornerActions = () => (
    <div className="absolute top-3 right-3 z-20 flex gap-2">
      {/* Favorite button */}
      <Tooltip content={isFavorited ? 'Remove from favorites' : 'Add to favorites'}>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleFavorite}
          className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
        >
          {isFavorited ? (
            <HeartSolidIcon className="w-4 h-4 text-red-500" />
          ) : (
            <HeartIcon className="w-4 h-4 text-gray-600" />
          )}
        </motion.button>
      </Tooltip>

      {/* Share button */}
      <Tooltip content="Share gift card">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleShare}
          className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
        >
          <ShareIcon className="w-4 h-4 text-gray-600" />
        </motion.button>
      </Tooltip>

      {/* More actions */}
      {(onEdit || onDelete) && (
        <Tooltip content="More actions">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              setShowActionsMenu(!showActionsMenu);
            }}
            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
          >
            <EllipsisHorizontalIcon className="w-4 h-4 text-gray-600" />
          </motion.button>
        </Tooltip>
      )}
    </div>
  );

  // Render card content
  const renderCardContent = () => (
    <div className="relative z-10 h-full flex flex-col justify-between p-4 text-white">
      {/* Header content */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate mb-1 text-shadow">
            {giftCard.title}
          </h3>
          
          {variant === 'detailed' && giftCard.description && (
            <p className="text-sm text-white/90 line-clamp-2 text-shadow-sm">
              {giftCard.description}
            </p>
          )}

          {showCustomization && hasCustomization && (
            <div className="mt-2 flex items-center text-xs text-white/80">
              <SparklesIcon className="w-3 h-3 mr-1" />
              Personalized
            </div>
          )}
        </div>

        <div className="ml-4 text-right">
          <div className="text-xs text-white/80 uppercase tracking-wide mb-1">
            {type.label}
          </div>
          <type.icon className="w-5 h-5 text-white/90" />
        </div>
      </div>

      {/* Middle content - balance and code */}
      <div className="flex-1 flex flex-col justify-center my-4">
        {showBalance && (
          <div className="text-center">
            <div className="text-3xl font-bold text-shadow mb-1">
              {formatCurrency(giftCard.balance, giftCard.currency)}
            </div>
            <div className="text-sm text-white/80">
              Balance • {balancePercentage}% remaining
            </div>
            
            {/* Balance bar */}
            <div className="mt-2 w-full bg-white/20 rounded-full h-1.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${balancePercentage}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className={clsx(
                  'h-full rounded-full',
                  balancePercentage > 50 ? 'bg-green-400' :
                  balancePercentage > 25 ? 'bg-yellow-400' : 'bg-red-400'
                )}
              />
            </div>
          </div>
        )}

        {showCode && (
          <div className="mt-4 text-center">
            <div className="text-xs text-white/80 mb-1">Gift Card Code</div>
            <button
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-mono hover:bg-white/30 transition-colors"
            >
              <span className="tracking-wider">{giftCard.code}</span>
              <DocumentDuplicateIcon className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Footer content */}
      <div className="flex items-end justify-between text-xs text-white/80">
        <div>
          {giftCard.expiresAt && !giftCard.neverExpires ? (
            <div className="flex items-center gap-1">
              <CalendarIcon className="w-3 h-3" />
              Expires {formatDate(giftCard.expiresAt)}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <InformationCircleIcon className="w-3 h-3" />
              Never expires
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <delivery.icon className="w-3 h-3" />
          {delivery.label}
        </div>
      </div>
    </div>
  );

  // Render action buttons
  const renderActionButtons = () => {
    if (!showActions || variant === 'compact') return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
        className="absolute bottom-4 left-4 right-4 z-20 flex gap-2"
      >
        {giftCard.status === 'active' && giftCard.balance > 0 && onRedeem && (
          <Button
            size="sm"
            variant="default"
            onClick={(e) => {
              e.stopPropagation();
              onRedeem(giftCard);
            }}
            className="flex-1 text-xs"
          >
            <ShoppingCartIcon className="w-3 h-3 mr-1" />
            Redeem
          </Button>
        )}

        {giftCard.status === 'active' && onReload && (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onReload(giftCard);
            }}
            className="flex-1 text-xs bg-white/90 backdrop-blur-sm"
          >
            <CurrencyDollarIcon className="w-3 h-3 mr-1" />
            Reload
          </Button>
        )}

        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onView?.(giftCard);
          }}
          className="text-xs bg-white/90 backdrop-blur-sm"
        >
          <EyeIcon className="w-3 h-3" />
        </Button>
      </motion.div>
    );
  };

  // Render loading state
  if (loading) {
    return (
      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        className={clsx(
          getVariantClasses(),
          getCardDimensions(),
          'bg-gray-100',
          className
        )}
        style={style}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300">
          <motion.div
            variants={shimmerVariants}
            initial="initial"
            animate="animate"
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
          />
        </div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={cardRef}
      variants={showAnimation ? cardVariants : undefined}
      initial={showAnimation ? "initial" : undefined}
      animate={showAnimation ? "animate" : undefined}
      exit={showAnimation ? "exit" : undefined}
      whileHover={interactive && showAnimation ? "hover" : undefined}
      whileTap={interactive && showAnimation ? "tap" : undefined}
      className={clsx(
        getVariantClasses(),
        getCardDimensions(),
        {
          'ring-2 ring-blue-500 ring-offset-2': selected,
          'opacity-50 cursor-not-allowed': disabled,
          'cursor-pointer': interactive && !disabled,
          'cursor-default': !interactive
        },
        className
      )}
      style={style}
      onClick={interactive ? handleCardClick : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role={selectable ? 'button' : 'article'}
      aria-label={`Gift card: ${giftCard.title}`}
      aria-selected={selected}
      tabIndex={interactive ? 0 : -1}
    >
      {/* Background */}
      {renderBackground()}

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 z-5 bg-gradient-to-t from-black/30 via-transparent to-black/10" />

      {/* Status indicators */}
      {renderStatusIndicators()}

      {/* Corner actions */}
      {renderCornerActions()}

      {/* Main content */}
      {renderCardContent()}

      {/* Action buttons */}
      {renderActionButtons()}

      {/* Actions dropdown */}
      <AnimatePresence>
        {showActionsMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute top-12 right-3 z-30 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[120px]"
            onClick={(e) => e.stopPropagation()}
          >
            {onEdit && (
              <button
                onClick={() => {
                  onEdit(giftCard);
                  setShowActionsMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <DocumentDuplicateIcon className="w-4 h-4" />
                Edit
              </button>
            )}
            
            {onDownload && (
              <button
                onClick={() => {
                  onDownload(giftCard);
                  setShowActionsMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <LinkIcon className="w-4 h-4" />
                Download
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => {
                  onDelete(giftCard);
                  setShowActionsMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <ExclamationTriangleIcon className="w-4 h-4" />
                Delete
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selection overlay */}
      {selectable && selected && (
        <div className="absolute inset-0 z-20 bg-blue-500/20 border-2 border-blue-500 rounded-lg flex items-center justify-center">
          <div className="bg-blue-500 text-white rounded-full p-2">
            <CheckCircleIcon className="w-6 h-6" />
          </div>
        </div>
      )}

      {children}
    </motion.div>
  );
};

export default GiftCardCard;
