/**
 * Announcement Bar Components - Vardhman Mills Frontend
 * 
 * Centralized exports for all announcement bar components.
 * These components handle displaying promotional messages, alerts,
 * and notifications at the top/bottom of pages.
 * 
 * @module components/announcement-bar
 * @version 1.0.0
 */

// Main announcement components
export { default as AnnouncementBar } from './AnnouncementBar';
export { default as AnnouncementWrapper } from './AnnouncementWrapper';

// Skeleton loading components
export { default as AnnouncementSkeleton } from './AnnouncementSkeleton';
export { 
  CompactAnnouncementSkeleton,
  StandardAnnouncementSkeleton,
  DetailedAnnouncementSkeleton,
  MultipleAnnouncementSkeletons
} from './AnnouncementSkeleton';

// Hooks and utilities
export { useAnnouncementRefresh } from './AnnouncementWrapper';

// Note: Component prop types are defined internally within each component file
// They are not exported separately but can be inferred from component usage
