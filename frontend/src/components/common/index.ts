/**
 * Common Components Export Hub
 * 
 * Central export file for all common/shared components used throughout the application.
 * Organized by component categories for easy navigation and imports.
 */

// ============================================================================
// UI Re-exports
// ============================================================================

export { Button } from '../ui/Button';
export type { ButtonProps } from '../ui/Button';

// ============================================================================
// Navigation Components
// ============================================================================

export { default as Breadcrumbs } from './Breadcrumbs';
export type { BreadcrumbsProps, BreadcrumbItem } from './Breadcrumbs';

// ============================================================================
// Error Handling Components
// ============================================================================

export { default as ErrorBoundary } from './Error/ErrorBoundary';
export { default as ErrorMessage } from './Error/ErrorMessage';
export { default as ErrorPage } from './Error/ErrorPage';
export { default as RetryButton } from './Error/RetryButton';

export type {
  ErrorBoundaryProps
} from './Error/ErrorBoundary';
export type { ErrorMessageProps } from './Error/ErrorMessage';
export type { ErrorPageProps } from './Error/ErrorPage';
export type { RetryButtonProps } from './Error/RetryButton';

// ============================================================================
// Image Components
// ============================================================================

export { default as ImageGallery } from './Image/ImageGallery';
export { default as ImageUpload } from './Image/ImageUpload';
export { default as ImageZoom } from './Image/ImageZoom';
export { default as LazyImage } from './Image/LazyImage';
export { default as OptimizedImage } from './Image/OptimizedImage';

export type {
  ImageGalleryProps,
  ImageItem
} from './Image/ImageGallery';
export type {
  ImageUploadProps,
  UploadedFile
} from './Image/ImageUpload';
export type { ImageZoomProps } from './Image/ImageZoom';
export type { LazyImageProps } from './Image/LazyImage';
export type { OptimizedImageProps } from './Image/OptimizedImage';

// ============================================================================
// Loading Components
// ============================================================================

export { default as InfiniteScroll } from './Loading/InfiniteScroll';
export { default as LoadingButton } from './Loading/LoadingButton';
export { default as LoadingScreen } from './Loading/LoadingScreen';
export { default as LoadingSpinner } from './Loading/LoadingSpinner';
export { default as SkeletonLoader } from './Loading/SkeletonLoader';

export type { InfiniteScrollProps } from './Loading/InfiniteScroll';
export type { LoadingButtonProps } from './Loading/LoadingButton';
export type { LoadingScreenProps } from './Loading/LoadingScreen';
export type { LoadingSpinnerProps } from './Loading/LoadingSpinner';
export type { SkeletonLoaderProps } from './Loading/SkeletonLoader';

// ============================================================================
// SEO Components
// ============================================================================

export { default as MetaTags } from './SEO/MetaTags';
export { default as OpenGraph } from './SEO/OpenGraph';
export { default as SEOHead } from './SEO/SEOHead';
export { default as StructuredData } from './SEO/StructuredData';

export type {
  MetaTagsProps,
  MetaTag
} from './SEO/MetaTags';
export type {
  OpenGraphProps,
  OpenGraphImage,
  OpenGraphVideo,
  OpenGraphAudio
} from './SEO/OpenGraph';
export type {
  SEOHeadProps,
  TwitterCardProps
} from './SEO/SEOHead';
export type {
  Person,
  Organization,
  PostalAddress,
  WebSite,
  SearchAction,
  Article,
  Product,
  Offer,
  AggregateRating
} from './SEO/StructuredData';

// ============================================================================
// Social Components
// ============================================================================

export {
  ShareButtons,
  SocialLinks,
  SocialShare
} from './Social';

export type {
  ShareButtonsProps,
  SharePlatform,
  SocialLinksProps,
  SocialLink,
  SocialShareProps
} from './Social';

// ============================================================================
// Standalone Common Components
// ============================================================================

export { default as BackToTop } from './BackToTop';
export { default as ConfirmDialog } from './ConfirmDialog';
export { default as CopyToClipboard } from './CopyToClipboard';
export { default as EmptyState } from './EmptyState';
export { default as Newsletter } from './Newsletter';
export { default as NotFound } from './NotFound';
export { default as QRCode } from './QRCode';
export { default as ScrollToTop } from './ScrollToTop';
export { default as SearchModal } from './SearchModal';
export { NotifyMeDialog } from './NotifyMeDialog';

export type { BackToTopProps } from './BackToTop';
export type { ConfirmDialogProps } from './ConfirmDialog';
export type { CopyToClipboardProps } from './CopyToClipboard';
export type { EmptyStateProps } from './EmptyState';
export type { NewsletterProps } from './Newsletter';
export type { NotFoundProps } from './NotFound';
export type { QRCodeProps } from './QRCode';
export type { ScrollToTopProps } from './ScrollToTop';
export type { SearchModalProps } from './SearchModal';

// ============================================================================
// Announcement Bar (Re-exported from annoucement-bar)
// ============================================================================

export { AnnouncementBar, AnnouncementWrapper, AnnouncementSkeleton } from '../annoucement-bar';
export type { AnnouncementBarProps } from '../annoucement-bar/AnnouncementBar';
