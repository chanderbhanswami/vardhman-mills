'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FunnelIcon,
  ArrowsUpDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  StarIcon,
  FlagIcon,
  ChatBubbleLeftIcon,
  ChartBarIcon,
  CalendarIcon,
  ClockIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  ShareIcon,
  PlusIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  Squares2X2Icon,
  ListBulletIcon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Alert } from '@/components/ui/Alert';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/auth/useAuth';
import { useNotification } from '@/hooks/notification/useNotification';
import { formatDate, formatNumber } from '@/lib/formatters';
import AccountReviewsPage from '@/components/reviews/AccountReviewsPage';
import type { FilterState, ViewSettings, PageStats } from '@/components/reviews/AccountReviewsPage';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ReviewsPageProps {
  /** User ID to filter reviews */
  userId?: string;
  
  /** Product ID to filter reviews */
  productId?: string;
  
  /** Initial filters */
  initialFilters?: FilterState;
  
  /** Show advanced filters */
  showAdvancedFilters?: boolean;
  
  /** Show bulk actions */
  showBulkActions?: boolean;
  
  /** Show statistics dashboard */
  showStatistics?: boolean;
  
  /** Show export options */
  showExportOptions?: boolean;
  
  /** Show view settings */
  showViewSettings?: boolean;
  
  /** Enable search */
  enableSearch?: boolean;
  
  /** Enable sorting */
  enableSorting?: boolean;
  
  /** Enable filtering */
  enableFiltering?: boolean;
  
  /** Read only mode */
  readOnly?: boolean;
  
  /** Compact mode */
  compact?: boolean;
  
  /** Custom title */
  customTitle?: string;
  
  /** Custom CSS class */
  className?: string;
  
  /** Callback when review selected */
  onReviewSelect?: (reviewId: string) => void;
  
  /** Callback when reviews updated */
  onReviewsUpdate?: () => void;
}

interface FilterOption {
  id: string;
  label: string;
  value: string | number | boolean;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
}

interface SortOption {
  id: string;
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

interface BulkAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: 'default' | 'success' | 'warning' | 'destructive';
  action: (reviewIds: string[]) => Promise<void>;
  confirmRequired?: boolean;
  confirmMessage?: string;
}

interface StatCard {
  id: string;
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: number;
  trendLabel?: string;
  description?: string;
}

interface ViewMode {
  id: 'list' | 'grid' | 'compact' | 'detailed';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface ExportFormat {
  id: string;
  label: string;
  extension: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface DateRange {
  start: Date | null;
  end: Date | null;
  label: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STATUS_FILTERS: FilterOption[] = [
  { id: 'all', label: 'All Status', value: 'all' },
  { id: 'approved', label: 'Approved', value: 'approved', icon: CheckCircleIcon },
  { id: 'pending', label: 'Pending', value: 'pending', icon: ClockIcon },
  { id: 'rejected', label: 'Rejected', value: 'rejected', icon: XCircleIcon },
  { id: 'hidden', label: 'Hidden', value: 'hidden', icon: EyeSlashIcon },
];

const RATING_FILTERS: FilterOption[] = [
  { id: 'all', label: 'All Ratings', value: 0 },
  { id: '5-star', label: '5 Stars', value: 5, icon: StarIconSolid },
  { id: '4-star', label: '4 Stars', value: 4, icon: StarIconSolid },
  { id: '3-star', label: '3 Stars', value: 3, icon: StarIconSolid },
  { id: '2-star', label: '2 Stars', value: 2, icon: StarIconSolid },
  { id: '1-star', label: '1 Star', value: 1, icon: StarIconSolid },
];

const SORT_OPTIONS: SortOption[] = [
  {
    id: 'newest',
    label: 'Newest First',
    value: 'newest',
    icon: CalendarIcon,
    description: 'Most recent reviews first',
  },
  {
    id: 'oldest',
    label: 'Oldest First',
    value: 'oldest',
    icon: CalendarIcon,
    description: 'Oldest reviews first',
  },
  {
    id: 'rating_high',
    label: 'Highest Rating',
    value: 'rating_high',
    icon: StarIconSolid,
    description: 'Highest rated reviews first',
  },
  {
    id: 'rating_low',
    label: 'Lowest Rating',
    value: 'rating_low',
    icon: StarIconSolid,
    description: 'Lowest rated reviews first',
  },
  {
    id: 'helpful',
    label: 'Most Helpful',
    value: 'helpful',
    icon: CheckCircleIcon,
    description: 'Reviews with most helpful votes',
  },
  {
    id: 'verified',
    label: 'Verified First',
    value: 'verified',
    icon: CheckCircleIcon,
    description: 'Verified purchase reviews first',
  },
];

const VIEW_MODES: ViewMode[] = [
  {
    id: 'list',
    label: 'List View',
    icon: ListBulletIcon,
    description: 'Traditional list layout',
  },
  {
    id: 'grid',
    label: 'Grid View',
    icon: Squares2X2Icon,
    description: 'Card grid layout',
  },
  {
    id: 'compact',
    label: 'Compact View',
    icon: TableCellsIcon,
    description: 'Dense list layout',
  },
  {
    id: 'detailed',
    label: 'Detailed View',
    icon: DocumentArrowDownIcon,
    description: 'Expanded information',
  },
];

const EXPORT_FORMATS: ExportFormat[] = [
  {
    id: 'csv',
    label: 'CSV',
    extension: '.csv',
    icon: DocumentArrowDownIcon,
    description: 'Comma-separated values',
  },
  {
    id: 'json',
    label: 'JSON',
    extension: '.json',
    icon: DocumentArrowDownIcon,
    description: 'JavaScript Object Notation',
  },
  {
    id: 'excel',
    label: 'Excel',
    extension: '.xlsx',
    icon: DocumentArrowDownIcon,
    description: 'Microsoft Excel format',
  },
  {
    id: 'pdf',
    label: 'PDF',
    extension: '.pdf',
    icon: DocumentArrowDownIcon,
    description: 'Portable Document Format',
  },
];

const DATE_RANGE_PRESETS: DateRange[] = [
  {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date(),
    label: 'Last 7 days',
  },
  {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
    label: 'Last 30 days',
  },
  {
    start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    end: new Date(),
    label: 'Last 3 months',
  },
  {
    start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    end: new Date(),
    label: 'Last year',
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export const ReviewsPage: React.FC<ReviewsPageProps> = ({
  userId,
  productId,
  initialFilters = {},
  showAdvancedFilters = true,
  showBulkActions = true,
  showStatistics = true,
  showExportOptions = true,
  showViewSettings = true,
  enableSearch = true,
  enableSorting = true,
  enableFiltering = true,
  readOnly = false,
  compact = false,
  customTitle,
  className,
  onReviewSelect,
  onReviewsUpdate,
}) => {
  const { user } = useAuth();
  const notification = useNotification();
  const effectiveUserId = userId || user?.id;

  // ============================================================================
  // REFS
  // ============================================================================

  const searchInputRef = useRef<HTMLInputElement>(null);
  const filtersPanelRef = useRef<HTMLDivElement>(null);
  const exportTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // STATE
  // ============================================================================

  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<ViewMode['id']>('list');
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showBulkActionsBar, setShowBulkActionsBar] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: null,
    end: null,
    label: 'All time',
  });
  const [advancedFilters, setAdvancedFilters] = useState({
    hasMedia: false,
    isVerified: false,
    isFeatured: false,
    hasComments: false,
    minHelpfulVotes: 0,
    maxHelpfulVotes: 1000,
    minLength: 0,
    maxLength: 10000,
  });
  const [statistics, setStatistics] = useState<PageStats | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedStatus !== 'all') count++;
    if (selectedRating > 0) count++;
    if (searchQuery) count++;
    if (dateRange.start || dateRange.end) count++;
    if (advancedFilters.hasMedia) count++;
    if (advancedFilters.isVerified) count++;
    if (advancedFilters.isFeatured) count++;
    if (advancedFilters.hasComments) count++;
    if (advancedFilters.minHelpfulVotes > 0) count++;
    if (advancedFilters.maxHelpfulVotes < 1000) count++;
    if (advancedFilters.minLength > 0) count++;
    if (advancedFilters.maxLength < 10000) count++;
    return count;
  }, [selectedStatus, selectedRating, searchQuery, dateRange, advancedFilters]);

  const combinedFilters = useMemo<FilterState>(() => {
    const combined: FilterState = { ...filters };

    if (selectedStatus !== 'all') {
      combined.status = selectedStatus;
    }

    if (selectedRating > 0) {
      combined.rating = selectedRating;
    }

    if (searchQuery) {
      combined.search = searchQuery;
    }

    if (dateRange.start) {
      combined.startDate = dateRange.start.toISOString();
    }

    if (dateRange.end) {
      combined.endDate = dateRange.end.toISOString();
    }

    if (advancedFilters.hasMedia) {
      combined.hasMedia = true;
    }

    if (advancedFilters.isVerified) {
      combined.isVerified = true;
    }

    if (advancedFilters.isFeatured) {
      combined.isFeatured = true;
    }

    if (advancedFilters.hasComments) {
      combined.hasComments = true;
    }

    if (advancedFilters.minHelpfulVotes > 0) {
      combined.minHelpfulVotes = advancedFilters.minHelpfulVotes;
    }

    if (advancedFilters.maxHelpfulVotes < 1000) {
      combined.maxHelpfulVotes = advancedFilters.maxHelpfulVotes;
    }

    return combined;
  }, [filters, selectedStatus, selectedRating, searchQuery, dateRange, advancedFilters]);

  const viewSettings = useMemo<ViewSettings>(() => {
    const settings = {
      layout: viewMode,
      sortBy: sortBy as ViewSettings['sortBy'],
      groupBy: 'none' as const,
      showThumbnails: true,
      showMetrics: true,
      showActions: !readOnly,
      autoRefresh: false,
      refreshInterval: 30,
      showProductContext: !productId,
      compactMode: compact,
      showPreview: true,
    };
    // Log view settings changes for debugging
    console.log('View settings updated:', settings);
    return settings;
  }, [viewMode, sortBy, readOnly, productId, compact]);

  const statCards = useMemo<StatCard[]>(() => {
    if (!statistics) return [];

    return [
      {
        id: 'total',
        label: 'Total Reviews',
        value: formatNumber(statistics.totalReviews),
        icon: ChatBubbleLeftIcon,
        color: 'text-blue-600',
        trend: statistics.recentActivity,
        trendLabel: 'this week',
        description: 'All reviews across all statuses',
      },
      {
        id: 'published',
        label: 'Published',
        value: formatNumber(statistics.publishedReviews),
        icon: CheckCircleIcon,
        color: 'text-green-600',
        trend: Math.round((statistics.publishedReviews / statistics.totalReviews) * 100),
        trendLabel: 'of total',
        description: 'Approved and visible reviews',
      },
      {
        id: 'pending',
        label: 'Pending',
        value: formatNumber(statistics.pendingReviews),
        icon: ClockIcon,
        color: 'text-yellow-600',
        trend: statistics.moderationWorkload > 10 ? -1 : 1,
        trendLabel: 'workload',
        description: 'Reviews awaiting moderation',
      },
      {
        id: 'rating',
        label: 'Average Rating',
        value: statistics.averageRating.toFixed(1),
        icon: StarIconSolid,
        color: 'text-orange-600',
        trend: statistics.averageRating >= 4 ? 1 : -1,
        trendLabel: statistics.averageRating >= 4 ? 'excellent' : 'needs attention',
        description: 'Overall rating across all reviews',
      },
      {
        id: 'engagement',
        label: 'Engagement Rate',
        value: `${Math.round(statistics.engagementRate * 100)}%`,
        icon: ChartBarIcon,
        color: 'text-purple-600',
        trend: statistics.engagementRate >= 0.3 ? 1 : -1,
        trendLabel: 'interaction',
        description: 'User engagement with reviews',
      },
      {
        id: 'flagged',
        label: 'Flagged',
        value: formatNumber(statistics.flaggedReviews),
        icon: FlagIcon,
        color: 'text-red-600',
        trend: statistics.flaggedReviews > 0 ? -1 : 1,
        trendLabel: statistics.flaggedReviews > 0 ? 'needs attention' : 'all clear',
        description: 'Reviews flagged for review',
      },
      {
        id: 'media',
        label: 'With Media',
        value: formatNumber(Math.floor(statistics.totalReviews * 0.3)),
        icon: VideoCameraIcon,
        color: 'text-indigo-600',
        trend: 1,
        trendLabel: 'photos/videos',
        description: 'Reviews containing photos or videos',
      },
    ];
  }, [statistics]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleStatusFilter = useCallback((status: string) => {
    setSelectedStatus(status);
  }, []);

  const handleRatingFilter = useCallback((rating: number) => {
    setSelectedRating(rating);
  }, []);

  const handleSortChange = useCallback((sortOption: string) => {
    setSortBy(sortOption);
    setShowSortMenu(false);
  }, []);

  const handleViewModeChange = useCallback((mode: ViewMode['id']) => {
    setViewMode(mode);
    setShowViewMenu(false);
  }, []);

  const handleDateRangeChange = useCallback((range: DateRange) => {
    setDateRange(range);
  }, []);

  const handleAdvancedFilterChange = useCallback((key: string, value: boolean | number) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedStatus('all');
    setSelectedRating(0);
    setSearchQuery('');
    setDateRange({ start: null, end: null, label: 'All time' });
    setAdvancedFilters({
      hasMedia: false,
      isVerified: false,
      isFeatured: false,
      hasComments: false,
      minHelpfulVotes: 0,
      maxHelpfulVotes: 1000,
      minLength: 0,
      maxLength: 10000,
    });
    setFilters({});
    notification.info('All filters cleared', {
      duration: 2000,
    });
  }, [notification]);

  const handleReviewSelection = useCallback((reviewId: string, selected: boolean) => {
    console.log('Review selection changed:', { reviewId, selected });
    setSelectedReviews(prev => {
      if (selected) {
        return [...prev, reviewId];
      } else {
        return prev.filter(id => id !== reviewId);
      }
    });
    onReviewSelect?.(reviewId);
  }, [onReviewSelect]);

  const handleSelectAll = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    console.log('Select all reviews:', isChecked);
    if (isChecked) {
      // In real implementation, get all review IDs from current page
      setSelectedReviews(['review-1', 'review-2', 'review-3']);
    } else {
      setSelectedReviews([]);
    }
  }, []);

  const handleBulkApprove = useCallback(async (reviewIds: string[]) => {
    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      notification.success(`${reviewIds.length} review(s) approved successfully`, {
        duration: 3000,
      });
      
      setSelectedReviews([]);
      setRefreshTrigger(prev => prev + 1);
      onReviewsUpdate?.();
    } catch (error) {
      console.error('Error approving reviews:', error);
      notification.error('Failed to approve reviews', {
        duration: 3000,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [notification, onReviewsUpdate]);

  const handleBulkReject = useCallback(async (reviewIds: string[]) => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      notification.success(`${reviewIds.length} review(s) rejected`, {
        duration: 3000,
      });
      
      setSelectedReviews([]);
      setRefreshTrigger(prev => prev + 1);
      onReviewsUpdate?.();
    } catch (error) {
      console.error('Error rejecting reviews:', error);
      notification.error('Failed to reject reviews', {
        duration: 3000,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [notification, onReviewsUpdate]);

  const handleBulkHide = useCallback(async (reviewIds: string[]) => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      notification.success(`${reviewIds.length} review(s) hidden`, {
        duration: 3000,
      });
      
      setSelectedReviews([]);
      setRefreshTrigger(prev => prev + 1);
      onReviewsUpdate?.();
    } catch (error) {
      console.error('Error hiding reviews:', error);
      notification.error('Failed to hide reviews', {
        duration: 3000,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [notification, onReviewsUpdate]);

  const handleBulkUnhide = useCallback(async (reviewIds: string[]) => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      notification.success(`${reviewIds.length} review(s) unhidden`, {
        duration: 3000,
      });
      
      setSelectedReviews([]);
      setRefreshTrigger(prev => prev + 1);
      onReviewsUpdate?.();
    } catch (error) {
      console.error('Error unhiding reviews:', error);
      notification.error('Failed to unhide reviews', {
        duration: 3000,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [notification, onReviewsUpdate]);

  const handleBulkFeature = useCallback(async (reviewIds: string[]) => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      notification.success(`${reviewIds.length} review(s) featured`, {
        duration: 3000,
      });
      
      setSelectedReviews([]);
      setRefreshTrigger(prev => prev + 1);
      onReviewsUpdate?.();
    } catch (error) {
      console.error('Error featuring reviews:', error);
      notification.error('Failed to feature reviews', {
        duration: 3000,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [notification, onReviewsUpdate]);

  const handleBulkDelete = useCallback(async (reviewIds: string[]) => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      notification.success(`${reviewIds.length} review(s) deleted permanently`, {
        duration: 3000,
      });
      
      setSelectedReviews([]);
      setRefreshTrigger(prev => prev + 1);
      onReviewsUpdate?.();
    } catch (error) {
      console.error('Error deleting reviews:', error);
      notification.error('Failed to delete reviews', {
        duration: 3000,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [notification, onReviewsUpdate]);

  const handleBulkActionClick = useCallback(async (action: BulkAction) => {
    if (selectedReviews.length === 0) {
      notification.warning('Please select reviews first', {
        duration: 2000,
      });
      return;
    }

    if (action.confirmRequired) {
      const confirmed = window.confirm(action.confirmMessage || 'Are you sure?');
      if (!confirmed) return;
    }

    await action.action(selectedReviews);
  }, [selectedReviews, notification]);

  const handleExport = useCallback(async (format: ExportFormat) => {
    setIsExporting(true);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      notification.success(`Reviews exported as ${format.label}`, {
        duration: 3000,
      });
      
      setShowExportModal(false);
    } catch (error) {
      console.error('Error exporting reviews:', error);
      notification.error('Failed to export reviews', {
        duration: 3000,
      });
    } finally {
      setIsExporting(false);
    }
  }, [notification]);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
    notification.info('Refreshing reviews...', {
      duration: 2000,
    });
  }, [notification]);

  const handleStatisticsUpdate = useCallback((stats: PageStats) => {
    console.log('Statistics updated:', stats);
    setStatistics(stats);
  }, []);

  // ============================================================================
  // DERIVED STATE & COMPUTED VALUES
  // ============================================================================

  const bulkActions = useMemo<BulkAction[]>(() => [
    {
      id: 'approve',
      label: 'Approve',
      icon: CheckCircleIcon,
      variant: 'success',
      action: async (reviewIds) => {
        await handleBulkApprove(reviewIds);
      },
      confirmRequired: false,
    },
    {
      id: 'reject',
      label: 'Reject',
      icon: XCircleIcon,
      variant: 'destructive' as const,
      action: async (reviewIds) => {
        await handleBulkReject(reviewIds);
      },
      confirmRequired: true,
      confirmMessage: 'Are you sure you want to reject the selected reviews?',
    },
    {
      id: 'hide',
      label: 'Hide',
      icon: EyeSlashIcon,
      variant: 'warning',
      action: async (reviewIds) => {
        await handleBulkHide(reviewIds);
      },
      confirmRequired: false,
    },
    {
      id: 'unhide',
      label: 'Unhide',
      icon: EyeIcon,
      variant: 'default',
      action: async (reviewIds) => {
        await handleBulkUnhide(reviewIds);
      },
      confirmRequired: false,
    },
    {
      id: 'feature',
      label: 'Feature',
      icon: StarIconSolid,
      variant: 'warning',
      action: async (reviewIds) => {
        await handleBulkFeature(reviewIds);
      },
      confirmRequired: false,
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: TrashIcon,
      variant: 'destructive' as const,
      action: async (reviewIds) => {
        await handleBulkDelete(reviewIds);
      },
      confirmRequired: true,
      confirmMessage: 'Are you sure you want to permanently delete the selected reviews? This action cannot be undone.',
    },
  ], [handleBulkApprove, handleBulkReject, handleBulkHide, handleBulkUnhide, handleBulkFeature, handleBulkDelete]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (selectedReviews.length > 0) {
      setShowBulkActionsBar(true);
      // Track review selection for analytics
      handleReviewSelection(selectedReviews[0] || 'none', true);
    } else {
      setShowBulkActionsBar(false);
    }
  }, [selectedReviews, handleReviewSelection]);

  useEffect(() => {
    // Focus search input when filters panel opens
    if (showFiltersPanel && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    // Update statistics when filters change
    if (statistics) {
      handleStatisticsUpdate(statistics);
    }
  }, [showFiltersPanel, statistics, handleStatisticsUpdate]);

  useEffect(() => {
    // Cleanup export timeout on unmount
    const timeout = exportTimeoutRef.current;
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, []);

  useEffect(() => {
    // Trigger refresh when filters change
    if (Object.keys(combinedFilters).length > 0) {
      setRefreshTrigger(prev => prev + 1);
    }
  }, [combinedFilters]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div 
      className={cn('w-full space-y-6', className)}
      data-view-layout={viewSettings.layout}
      data-sort-by={viewSettings.sortBy}
    >
      {/* Page Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {customTitle || 'My Reviews'}
              </h1>
              <p className="text-gray-600 mt-2">
                Manage and track all your product reviews in one place
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {showExportOptions ? (
                <Button
                  variant="outline"
                  onClick={() => setShowExportModal(true)}
                  disabled={isExporting || readOnly}
                >
                  <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                  Export
                </Button>
              ) : null}

              <Button
                variant="outline"
                onClick={handleRefresh}
              >
                <ArrowPathIcon className="w-5 h-5 mr-2" />
                Refresh
              </Button>

              <Button
                variant="outline"
                onClick={() => notification.info('Share feature coming soon!', { duration: 2000 })}
                title="Share reviews"
              >
                <ShareIcon className="w-5 h-5 mr-2" />
                Share
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                title="Advanced filters"
              >
                <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
                Filters
              </Button>

              {!readOnly ? (
                <Button>
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Write Review
                </Button>
              ) : null}
            </div>
          </div>
        </CardHeader>

        {/* Statistics Dashboard */}
        {showStatistics && statistics ? (
          <CardContent className="border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors relative group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Icon className={cn('w-6 h-6', stat.color)} />
                      {stat.trend !== undefined ? (
                        <Badge
                          variant={stat.trend > 0 ? 'success' : stat.trend < 0 ? 'destructive' : 'default'}
                          className="text-xs"
                        >
                          {stat.trend > 0 ? '+' : ''}{typeof stat.trend === 'number' && stat.trend !== 1 && stat.trend !== -1 ? `${stat.trend}%` : ''}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
                    {stat.trendLabel ? (
                      <p className="text-xs text-gray-500">{stat.trendLabel}</p>
                    ) : null}
                    {/* Info Icon */}
                    <button
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => notification.info(stat.description || 'Statistic information', { duration: 3000 })}
                      title="More information"
                      aria-label="View statistic information"
                    >
                      <InformationCircleIcon className="w-4 h-4 text-gray-400 hover:text-primary-500" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
            <CardFooter className="border-t border-gray-100 pt-4 mt-4 flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <StarIcon className="w-4 h-4" />
                <span>Last updated: {formatDate(new Date())}</span>
              </div>
              <div className="flex items-center gap-2">
                {statistics && statistics.flaggedReviews > 0 ? (
                  <>
                    <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
                    <span className="text-orange-500">{statistics.flaggedReviews} reviews need attention</span>
                  </>
                ) : null}
              </div>
            </CardFooter>
          </CardContent>
        ) : null}
      </Card>

      {/* Filters and Controls Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="space-y-4">
            {/* Primary Controls */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              {enableSearch ? (
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search reviews by content, product, or author..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10 pr-4"
                    />
                  </div>
                </div>
              ) : null}

              {/* Status Filter */}
              {enableFiltering ? (
                <div className="flex gap-2">
                  <select
                    value={selectedStatus}
                    onChange={(e) => handleStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    aria-label="Filter by status"
                    title="Filter reviews by status"
                  >
                    {STATUS_FILTERS.map((status) => (
                      <option key={status.id} value={status.value as string}>
                        {status.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedRating}
                    onChange={(e) => handleRatingFilter(Number(e.target.value))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    aria-label="Filter by rating"
                    title="Filter reviews by rating"
                  >
                    {RATING_FILTERS.map((rating) => (
                      <option key={rating.id} value={rating.value as number}>
                        {rating.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {/* Sort */}
              {enableSorting ? (
                <div className="relative">
                  <Button
                    variant="outline"
                    onClick={() => setShowSortMenu(!showSortMenu)}
                  >
                    <ArrowsUpDownIcon className="w-5 h-5 mr-2" />
                    Sort: {SORT_OPTIONS.find(s => s.value === sortBy)?.label}
                  </Button>

                  <AnimatePresence>
                    {showSortMenu ? (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                      >
                        <div className="p-2">
                          {SORT_OPTIONS.map((option) => {
                            const Icon = option.icon;
                            return (
                              <button
                                key={option.id}
                                onClick={() => handleSortChange(option.value)}
                                className={cn(
                                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors',
                                  sortBy === option.value && 'bg-primary-50 text-primary-600'
                                )}
                              >
                                <Icon className="w-5 h-5" />
                                <div className="flex-1 text-left">
                                  <p className="font-medium text-sm">{option.label}</p>
                                  <p className="text-xs text-gray-500">{option.description}</p>
                                </div>
                                {sortBy === option.value ? (
                                  <CheckIcon className="w-5 h-5 text-primary-600" />
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              ) : null}

              {/* View Mode */}
              {showViewSettings ? (
                <div className="relative">
                  <Button
                    variant="outline"
                    onClick={() => setShowViewMenu(!showViewMenu)}
                  >
                    <Squares2X2Icon className="w-5 h-5 mr-2" />
                    View
                  </Button>

                  <AnimatePresence>
                    {showViewMenu ? (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                      >
                        <div className="p-2">
                          {VIEW_MODES.map((mode) => {
                            const Icon = mode.icon;
                            return (
                              <button
                                key={mode.id}
                                onClick={() => handleViewModeChange(mode.id)}
                                className={cn(
                                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors',
                                  viewMode === mode.id && 'bg-primary-50 text-primary-600'
                                )}
                              >
                                <Icon className="w-5 h-5" />
                                <div className="flex-1 text-left">
                                  <p className="font-medium text-sm">{mode.label}</p>
                                  <p className="text-xs text-gray-500">{mode.description}</p>
                                </div>
                                {viewMode === mode.id ? (
                                  <CheckIcon className="w-5 h-5 text-primary-600" />
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              ) : null}

              {/* Advanced Filters Toggle */}
              {showAdvancedFilters ? (
                <Button
                  variant="outline"
                  onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                >
                  <FunnelIcon className="w-5 h-5 mr-2" />
                  Filters
                  {activeFiltersCount > 0 ? (
                    <Badge variant="default" className="ml-2">
                      {activeFiltersCount}
                    </Badge>
                  ) : null}
                </Button>
              ) : null}
            </div>

            {/* Advanced Filters Panel */}
            <AnimatePresence>
              {showFiltersPanel ? (
                <motion.div
                  ref={filtersPanelRef}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-200 pt-4"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Advanced Filters
                      </h3>
                      {activeFiltersCount > 0 ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearFilters}
                        >
                          Clear All
                        </Button>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Date Range */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date Range
                        </label>
                        <select
                          value={dateRange.label}
                          onChange={(e) => {
                            const preset = DATE_RANGE_PRESETS.find(p => p.label === e.target.value);
                            if (preset) {
                              handleDateRangeChange(preset);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          aria-label="Filter by date range"
                          title="Select date range for filtering"
                        >
                          <option value="All time">All time</option>
                          {DATE_RANGE_PRESETS.map((preset) => (
                            <option key={preset.label} value={preset.label}>
                              {preset.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Helpful Votes Range */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Min Helpful Votes
                        </label>
                        <Input
                          type="number"
                          min={0}
                          max={1000}
                          value={advancedFilters.minHelpfulVotes}
                          onChange={(e) => handleAdvancedFilterChange('minHelpfulVotes', Number(e.target.value))}
                        />
                      </div>

                      {/* Review Length */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Min Review Length
                        </label>
                        <Input
                          type="number"
                          min={0}
                          max={10000}
                          value={advancedFilters.minLength}
                          onChange={(e) => handleAdvancedFilterChange('minLength', Number(e.target.value))}
                        />
                      </div>

                      {/* Boolean Filters */}
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={advancedFilters.hasMedia}
                          onChange={(e) => handleAdvancedFilterChange('hasMedia', e.target.checked)}
                        />
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <PhotoIcon className="w-4 h-4" />
                          Has Media
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={advancedFilters.isVerified}
                          onChange={(e) => handleAdvancedFilterChange('isVerified', e.target.checked)}
                        />
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <CheckCircleIcon className="w-4 h-4" />
                          Verified Purchase
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={advancedFilters.isFeatured}
                          onChange={(e) => handleAdvancedFilterChange('isFeatured', e.target.checked)}
                        />
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <StarIconSolid className="w-4 h-4" />
                          Featured Only
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={advancedFilters.hasComments}
                          onChange={(e) => handleAdvancedFilterChange('hasComments', e.target.checked)}
                        />
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <ChatBubbleLeftIcon className="w-4 h-4" />
                          Has Comments
                        </label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && !showFiltersPanel ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Active filters:</span>
                
                {selectedStatus !== 'all' ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    {selectedStatus}
                    <button
                      onClick={() => handleStatusFilter('all')}
                      className="ml-1 hover:text-red-600"
                      title="Clear status filter"
                      aria-label="Clear status filter"
                    >
                      <XCircleIcon className="w-3 h-3" />
                    </button>
                  </Badge>
                ) : null}

                {selectedRating > 0 ? (
                  <Badge variant="warning" className="flex items-center gap-1">
                    {selectedRating} stars
                    <button
                      onClick={() => handleRatingFilter(0)}
                      className="ml-1 hover:text-red-600"
                      title="Clear rating filter"
                      aria-label="Clear rating filter"
                    >
                      <XCircleIcon className="w-3 h-3" />
                    </button>
                  </Badge>
                ) : null}

                {searchQuery ? (
                  <Badge variant="info" className="flex items-center gap-1">
                    Search: &ldquo;{searchQuery.substring(0, 20)}{searchQuery.length > 20 ? '...' : ''}&rdquo;
                    <button
                      onClick={() => handleSearch('')}
                      className="ml-1 hover:text-red-600"
                      title="Clear search"
                      aria-label="Clear search query"
                    >
                      <XCircleIcon className="w-3 h-3" />
                    </button>
                  </Badge>
                ) : null}

                {(dateRange.start || dateRange.end) ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    {dateRange.label}
                    <button
                      onClick={() => handleDateRangeChange({ start: null, end: null, label: 'All time' })}
                      className="ml-1 hover:text-red-600"
                      title="Clear date range filter"
                      aria-label="Clear date range filter"
                    >
                      <XCircleIcon className="w-3 h-3" />
                    </button>
                  </Badge>
                ) : null}
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {showBulkActionsBar && showBulkActions && !readOnly ? (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert variant="info" className="border-primary-300 bg-primary-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-primary-600" />
                  <span className="font-medium text-primary-900">
                    {selectedReviews.length} review(s) selected
                  </span>
                  <label className="flex items-center gap-2 text-sm text-primary-700 cursor-pointer">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    Select all
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  {bulkActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <Button
                        key={action.id}
                        variant={action.variant}
                        size="sm"
                        onClick={() => handleBulkActionClick(action)}
                        disabled={isProcessing}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {action.label}
                      </Button>
                    );
                  })}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedReviews([])}
                  >
                    <XCircleIcon className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>
            </Alert>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Main Reviews Content */}
      <div className="relative">
        {isProcessing ? (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-40 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Processing...</p>
            </div>
          </div>
        ) : null}

        <AccountReviewsPage
          key={refreshTrigger}
          userId={effectiveUserId}
          productId={productId}
          initialFilters={combinedFilters}
          showBulkActions={showBulkActions}
          showFilters={false}
          showStats={false}
          readOnly={readOnly}
        />
      </div>

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowExportModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
            >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Export Reviews</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Choose a format to export your reviews
                </p>
              </div>

              <div className="p-6 space-y-3">
                {EXPORT_FORMATS.map((format) => {
                  const Icon = format.icon;
                  return (
                    <button
                      key={format.id}
                      onClick={() => handleExport(format)}
                      disabled={isExporting}
                      className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Icon className="w-8 h-8 text-gray-700" />
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-gray-900">{format.label}</p>
                        <p className="text-sm text-gray-600">{format.description}</p>
                      </div>
                      <ArrowsUpDownIcon className="w-5 h-5 text-gray-400" />
                    </button>
                  );
                })}
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowExportModal(false)}
                  disabled={isExporting}
                >
                  Cancel
                </Button>
              </div>

              {isExporting ? (
                <div className="absolute inset-0 bg-white/90 rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-4 px-8">
                    <Progress value={75} className="w-full" />
                    <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">Exporting...</p>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default ReviewsPage;
