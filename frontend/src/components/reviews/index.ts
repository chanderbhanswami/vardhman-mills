// Main review components
export { default as EmailFollowUpReminder } from './EmailFollowUpReminder';
export { default as InCartPostPurchaseReviewReminder } from './InCartPostPurchaseReviewReminder';
export { default as OrderHistoryRatingReview } from './OrderHistoryRatingReview';
export { default as ReviewMediaCarousel } from './ReviewMediaCarousel';
export { default as ReviewSkeleton } from './ReviewSkeleton';

// Additional review system components (now available)
export { default as AccountReviewsPage } from './AccountReviewsPage';
export { default as ProductReviews } from './ProductReviews';
export { default as ReviewItem } from './ReviewItem';
export { default as ReviewReplyItem } from './ReviewReplyItem';

// Shared utilities and components
export { default as MediaUploader } from './Shared/MediaUploader';
export { default as ReplyForm } from './Shared/ReplyForm';
export { default as ReplyList } from './Shared/ReplyList';

// Additional skeleton components
export { ReviewFormSkeleton, ReviewStatsSkeleton } from './ReviewSkeleton';

// Type exports for external usage
export type { EmailFollowUpReminderProps } from './EmailFollowUpReminder';
export type { InCartPostPurchaseReviewReminderProps } from './InCartPostPurchaseReviewReminder';
export type { OrderHistoryRatingReviewProps } from './OrderHistoryRatingReview';
export type { ReviewMediaCarouselProps } from './ReviewMediaCarousel';
export type { ReviewSkeletonProps } from './ReviewSkeleton';

// Import types for local use
import type { EmailFollowUpReminderProps } from './EmailFollowUpReminder';
import type { InCartPostPurchaseReviewReminderProps } from './InCartPostPurchaseReviewReminder';
import type { OrderHistoryRatingReviewProps } from './OrderHistoryRatingReview';
import type { ReviewMediaCarouselProps } from './ReviewMediaCarousel';
import type { ReviewSkeletonProps } from './ReviewSkeleton';

// Re-export common types that might be useful for consumers
// TODO: Export these types from their respective components
// export type {
//   EmailReminderData,
//   ReminderStatus,
//   ReminderFilters,
//   ReminderSort
// } from './EmailFollowUpReminder';

// export type {
//   CartItem,
//   ReviewReward,
//   ReviewProgress
// } from './InCartPostPurchaseReviewReminder';

// export type {
//   OrderItem,
//   Order,
//   ReviewFormData,
//   FilterOptions,
//   SortOptions
// } from './OrderHistoryRatingReview';

// export type {
//   MediaItem,
//   CarouselSettings,
//   ZoomState
// } from './ReviewMediaCarousel';

// Utility constants and helpers
export const REVIEW_COMPONENT_VARIANTS = {
  EMAIL_REMINDER: ['default', 'compact', 'card', 'modal'] as const,
  IN_CART_REMINDER: ['cart', 'post_purchase', 'dashboard', 'compact', 'floating'] as const,
  ORDER_HISTORY: ['full', 'compact', 'card', 'list'] as const,
  MEDIA_CAROUSEL: ['gallery', 'carousel', 'grid', 'masonry', 'slideshow'] as const,
  SKELETON: ['default', 'compact', 'detailed', 'list', 'grid', 'card'] as const
} as const;

export const REVIEW_COMPONENT_SIZES = {
  SMALL: 'sm',
  MEDIUM: 'md',
  LARGE: 'lg',
  EXTRA_LARGE: 'xl',
  FULL: 'full'
} as const;

export const ASPECT_RATIOS = {
  AUTO: 'auto',
  SQUARE: '1:1',
  STANDARD: '4:3',
  WIDESCREEN: '16:9',
  ULTRAWIDE: '21:9'
} as const;

export const NAVIGATION_TYPES = {
  ARROWS: 'arrows',
  DOTS: 'dots',
  BOTH: 'both',
  NONE: 'none'
} as const;

// Helper functions for component integration
export const createEmailReminderConfig = (overrides: Partial<EmailFollowUpReminderProps> = {}) => ({
  variant: 'default' as const,
  showMetrics: true,
  showFilters: true,
  showBulkActions: true,
  enableAutoRefresh: true,
  refreshInterval: 30000,
  itemsPerPage: 10,
  ...overrides
});

export const createInCartReminderConfig = (overrides: Partial<InCartPostPurchaseReviewReminderProps> = {}) => ({
  variant: 'cart' as const,
  showInCart: true,
  showPostPurchase: true,
  showRewards: true,
  showProgress: true,
  showIncentives: true,
  showSocialProof: true,
  showQuickReview: true,
  autoShow: false,
  persistentReminder: false,
  ...overrides
});

export const createOrderHistoryConfig = (overrides: Partial<OrderHistoryRatingReviewProps> = {}) => ({
  variant: 'full' as const,
  showFilters: true,
  showSearch: true,
  showSorting: true,
  showOrderDetails: true,
  showItemDetails: true,
  showReviewForm: true,
  showReviewStats: true,
  enableQuickReview: true,
  enableInlineEdit: true,
  itemsPerPage: 10,
  maxReviewLength: 1000,
  allowMedia: true,
  allowAnonymous: true,
  ...overrides
});

export const createMediaCarouselConfig = (overrides: Partial<ReviewMediaCarouselProps> = {}) => ({
  variant: 'carousel' as const,
  size: 'lg' as const,
  aspectRatio: 'auto' as const,
  navigation: 'both' as const,
  thumbnailPosition: 'bottom' as const,
  enableSwipe: true,
  enableKeyboard: true,
  enableMouseWheel: false,
  enableTouch: true,
  dragThreshold: 50,
  settings: {
    autoPlay: false,
    autoPlayInterval: 5000,
    showThumbnails: true,
    showProgress: true,
    showControls: true,
    showInfo: true,
    showActions: true,
    allowFullscreen: true,
    allowDownload: true,
    allowShare: true,
    allowZoom: true,
    loop: true,
    muted: false,
    volume: 1,
    playbackSpeed: 1,
    quality: 'auto' as const
  },
  ...overrides
});

export const createSkeletonConfig = (overrides: Partial<ReviewSkeletonProps> = {}) => ({
  variant: 'default' as const,
  count: 1,
  showAvatar: true,
  showRating: true,
  showDate: true,
  showImages: true,
  showVerification: true,
  showHelpful: true,
  showReply: false,
  showActions: true,
  showProduct: false,
  showTags: true,
  imageCount: 3,
  tagCount: 2,
  textLines: 3,
  animated: true,
  staggerDelay: 100,
  ...overrides
});

// Analytics event helpers
export const createAnalyticsEvent = (component: string, action: string, data: Record<string, unknown> = {}) => ({
  event: `review_${component}_${action}`,
  timestamp: new Date().toISOString(),
  component,
  action,
  data
});

// Common validation helpers
export const validateEmailReminderData = (data: unknown): boolean => {
  return !!(
    data &&
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'type' in data &&
    'status' in data &&
    'recipientEmail' in data &&
    'scheduledDate' in data
  );
};

export const validateMediaItem = (item: unknown): boolean => {
  return !!(
    item &&
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    'type' in item &&
    'url' in item &&
    'type' in item &&
    typeof (item as { type: string }).type === 'string' &&
    ['image', 'video', 'audio', 'document'].includes((item as { type: string }).type) &&
    'status' in item &&
    (item as { status: string }).status === 'ready'
  );
};

export const validateOrderData = (order: unknown): boolean => {
  return !!(
    order &&
    typeof order === 'object' &&
    order !== null &&
    'id' in order &&
    'orderNumber' in order &&
    'placedAt' in order &&
    'status' in order &&
    'items' in order &&
    Array.isArray((order as { items: unknown[] }).items) &&
    (order as { items: unknown[] }).items.length > 0
  );
};

// Component composition helpers
export const createReviewSystemConfig = () => ({
  emailReminder: createEmailReminderConfig(),
  inCartReminder: createInCartReminderConfig(),
  orderHistory: createOrderHistoryConfig(),
  mediaCarousel: createMediaCarouselConfig(),
  skeleton: createSkeletonConfig()
});

// Default themes and styling presets
export const REVIEW_THEMES = {
  default: {
    colors: {
      primary: '#3B82F6',
      secondary: '#6B7280',
      accent: '#10B981',
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626'
    },
    spacing: {
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem'
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem'
    }
  },
  minimal: {
    colors: {
      primary: '#000000',
      secondary: '#6B7280',
      accent: '#374151',
      success: '#065F46',
      warning: '#92400E',
      error: '#991B1B'
    },
    spacing: {
      sm: '0.25rem',
      md: '0.75rem',
      lg: '1.25rem',
      xl: '1.75rem'
    },
    borderRadius: {
      sm: '0.125rem',
      md: '0.25rem',
      lg: '0.375rem',
      xl: '0.5rem'
    }
  },
  vibrant: {
    colors: {
      primary: '#8B5CF6',
      secondary: '#EC4899',
      accent: '#06B6D4',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444'
    },
    spacing: {
      sm: '0.75rem',
      md: '1.25rem',
      lg: '1.75rem',
      xl: '2.5rem'
    },
    borderRadius: {
      sm: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.25rem'
    }
  }
} as const;

// Responsive breakpoint helpers
export const RESPONSIVE_BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;

export const createResponsiveConfig = <T>(config: {
  base: T;
  sm?: Partial<T>;
  md?: Partial<T>;
  lg?: Partial<T>;
  xl?: Partial<T>;
}) => config;

// Error boundaries and fallback components
export const FALLBACK_CONFIGS = {
  emailReminder: {
    showError: true,
    errorMessage: 'Unable to load email reminders',
    retryable: true
  },
  inCartReminder: {
    showError: false,
    fallbackToCompact: true
  },
  orderHistory: {
    showError: true,
    errorMessage: 'Unable to load order history',
    showEmptyState: true
  },
  mediaCarousel: {
    showError: true,
    errorMessage: 'Unable to load media',
    fallbackToPlaceholder: true
  }
} as const;

// Performance optimization helpers
export const PERFORMANCE_CONFIGS = {
  lazyLoading: {
    enabled: true,
    threshold: 0.1,
    rootMargin: '50px'
  },
  virtualization: {
    enabled: false,
    itemHeight: 200,
    overscan: 5
  },
  debouncing: {
    search: 300,
    filters: 500,
    resize: 100
  }
} as const;

// Accessibility helpers
export const A11Y_CONFIGS = {
  announcements: {
    enabled: true,
    polite: true
  },
  keyboard: {
    enabled: true,
    trapFocus: true,
    autoFocus: false
  },
  screenReader: {
    enabled: true,
    verboseLabels: true
  }
} as const;

// Integration helpers for common use cases
export const createFullReviewSystem = (config: {
  enableEmailReminders?: boolean;
  enableInCartReminders?: boolean;
  enableOrderHistory?: boolean;
  enableMediaCarousel?: boolean;
  theme?: keyof typeof REVIEW_THEMES;
  responsive?: boolean;
  analytics?: boolean;
}) => {
  const {
    enableEmailReminders = true,
    enableInCartReminders = true,
    enableOrderHistory = true,
    enableMediaCarousel = true,
    theme = 'default',
    responsive = true,
    analytics = true
  } = config;

  return {
    components: {
      ...(enableEmailReminders && { emailReminder: createEmailReminderConfig() }),
      ...(enableInCartReminders && { inCartReminder: createInCartReminderConfig() }),
      ...(enableOrderHistory && { orderHistory: createOrderHistoryConfig() }),
      ...(enableMediaCarousel && { mediaCarousel: createMediaCarouselConfig() })
    },
    theme: REVIEW_THEMES[theme],
    features: {
      responsive,
      analytics,
      accessibility: true,
      performance: true
    },
    fallbacks: FALLBACK_CONFIGS
  };
};