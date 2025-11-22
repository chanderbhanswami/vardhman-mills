import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import {
  Search,
  SortAsc,
  SortDesc,
  RefreshCw,
  Download,
  Eye,
  EyeOff,
  Trash2,
  CheckSquare,
  Filter,
  Star,
  MessageSquare,
  AlertTriangle,
  Clock,
  BarChart3,
  Users,
  ThumbsUp,
  Flag
} from 'lucide-react';

import {
  Button,
  Card,
  Input,
  Checkbox,
  Modal,
  Pagination,
  Skeleton
} from '@/components/ui';
import { CardHeader, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/components/providers';
import { reviewApi } from '@/lib/api';
import { AccountReviewItem } from './AccountReviewItem';

// Interfaces
interface FilterOptions {
  status: string;
  rating: string;
  dateFrom: string;
  dateTo: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  search: string;
  productId: string;
  verified: string;
  withMedia: boolean;
}

interface ApiReview {
  id: string;
  title: string;
  content: string;
  rating: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
  isVerified: boolean;
  isRecommended?: boolean;
  isEdited: boolean;
  authorId: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    location?: string;
    role?: string;
    isVerifiedBuyer?: boolean;
    totalReviews?: number;
    helpfulVotes?: number;
    memberSince?: string;
  };
  product: {
    id: string;
    name: string;
    image?: string;
    slug?: string;
    sku?: string;
    category?: string;
    price?: number;
    brand?: string;
  };
  media: Array<{
    id: string;
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
    alt?: string;
    caption?: string;
  }>;
  metrics: {
    views: number;
    helpfulVotes: number;
    unhelpfulVotes: number;
    replies: number;
    shares: number;
    reports: number;
  };
  moderation: {
    status: string;
    moderatedBy?: string;
    moderatedAt?: string;
    reason?: string;
    flags: string[];
  };
  tags: string[];
  pros: string[];
  cons: string[];
  purchaseVerified: boolean;
  helpfulnessScore: number;
  sentimentScore?: number;
  readingTime: number;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    deviceType?: string;
    source?: string;
    referrer?: string;
  };
}

interface BulkActionType {
  action: 'approve' | 'reject' | 'flag' | 'delete' | 'feature' | 'export';
  selectedIds: string[];
}

interface ReviewStats {
  total: number;
  published: number;
  hidden: number;
  flagged: number;
  pending: number;
  featured: number;
  averageRating: number;
  totalHelpfulVotes: number;
  totalViews: number;
  withMedia: number;
  verified: number;
}

interface AccountReviewListProps {
  userId?: string;
  productId?: string;
  onSelectionChange?: (selectedIds: string[]) => void;
  onReviewUpdate?: () => void;
}

// Custom hook for debouncing
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const AccountReviewList: React.FC<AccountReviewListProps> = ({
  userId,
  productId,
  onSelectionChange,
  onReviewUpdate
}) => {
  const { user } = useAuth();
  
  // Simple notification function
  const addNotification = useCallback((message: string, type: string) => {
    console.log(`${type.toUpperCase()}: ${message}`);
  }, []);

  // State
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    rating: 'all',
    dateFrom: '',
    dateTo: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    search: '',
    productId: productId || '',
    verified: 'all',
    withMedia: false
  });
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [bulkActionDialog, setBulkActionDialog] = useState<BulkActionType | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'compact'>('list');

  // Debounced search
  const debouncedSearch = useDebounce(filters.search, 300);

  // Query params
  const queryParams = useMemo(() => ({
    page: currentPage,
    limit: itemsPerPage,
    userId: userId || user?.id,
    productId: filters.productId || productId,
    status: filters.status !== 'all' ? filters.status : undefined,
    rating: filters.rating !== 'all' ? parseInt(filters.rating) : undefined,
    search: debouncedSearch || undefined,
    sortBy: (filters.sortBy === 'createdAt' ? 'newest' : 
            filters.sortBy === 'rating' ? (filters.sortOrder === 'desc' ? 'rating_high' : 'rating_low') :
            filters.sortBy === 'helpful' ? 'helpful' :
            filters.sortBy === 'views' ? 'newest' : 'newest') as 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful' | 'verified',
    verified: filters.verified !== 'all' ? filters.verified === 'true' : undefined,
    withImages: filters.withMedia || undefined,
    withVideos: filters.withMedia || undefined
  }), [
    currentPage, 
    itemsPerPage, 
    userId, 
    user?.id, 
    productId,
    filters,
    debouncedSearch
  ]);

  // Fetch reviews
  const { 
    data: reviewsResponse, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['reviews', queryParams],
    queryFn: () => reviewApi.getProductReviews(queryParams.productId || '', queryParams),
    enabled: !!(userId || user?.id)
  });

  // Transform function for reviews
  const transformReview = useCallback((review: ApiReview) => ({
    id: review.id,
    title: review.title,
    content: review.content,
    rating: review.rating,
    status: (review.status === 'approved' ? 'published' : 
            review.status === 'rejected' ? 'hidden' :
            review.status === 'flagged' ? 'flagged' :
            'pending') as 'published' | 'hidden' | 'flagged' | 'pending',
    createdAt: review.createdAt,
    updatedAt: review.updatedAt || review.createdAt,
    isVerified: review.isVerified,
    isRecommended: review.isRecommended,
    isEdited: review.isEdited,
    authorId: review.authorId,
    author: {
      id: review.author.id,
      name: review.author.name,
      avatar: review.author.avatar,
      location: review.author.location,
      role: review.author.role,
      isVerifiedBuyer: review.author.isVerifiedBuyer,
      totalReviews: review.author.totalReviews,
      helpfulVotes: review.author.helpfulVotes,
      memberSince: review.author.memberSince
    },
    product: review.product,
    media: review.media,
    metrics: review.metrics,
    moderation: {
      status: review.moderation.status as 'approved' | 'pending' | 'rejected' | 'flagged' | 'spam',
      moderatedBy: review.moderation.moderatedBy,
      moderatedAt: review.moderation.moderatedAt,
      reason: review.moderation.reason,
      flags: review.moderation.flags
    },
    tags: review.tags,
    pros: review.pros,
    cons: review.cons,
    purchaseVerified: review.purchaseVerified,
    helpfulnessScore: review.helpfulnessScore,
    sentimentScore: review.sentimentScore,
    readingTime: review.readingTime,
    metadata: review.metadata
  }), []);

  const transformedReviews = useMemo(() => {
    const reviews = reviewsResponse?.data || [];
    // Cast to ApiReview since the API response contains the full review data
    return (reviews as unknown as ApiReview[]).map((review: ApiReview) => transformReview(review));
  }, [reviewsResponse?.data, transformReview]);

  // Statistics calculation
  const statistics: ReviewStats = useMemo(() => {
    if (!transformedReviews.length) {
      return {
        total: 0,
        published: 0,
        hidden: 0,
        flagged: 0,
        pending: 0,
        featured: 0,
        averageRating: 0,
        totalHelpfulVotes: 0,
        totalViews: 0,
        withMedia: 0,
        verified: 0
      };
    }

    const total = transformedReviews.length;
    const published = transformedReviews.filter(r => r.status === 'published').length;
    const hidden = transformedReviews.filter(r => r.status === 'hidden').length;
    const flagged = transformedReviews.filter(r => r.status === 'flagged').length;
    const pending = transformedReviews.filter(r => r.status === 'pending').length;
    const withMedia = transformedReviews.filter(r => r.media.length > 0).length;
    const verified = transformedReviews.filter(r => r.isVerified).length;
    const totalRating = transformedReviews.reduce((sum, r) => sum + r.rating, 0);
    const totalHelpfulVotes = transformedReviews.reduce((sum, r) => sum + r.metrics.helpfulVotes, 0);
    const totalViews = transformedReviews.reduce((sum, r) => sum + r.metrics.views, 0);

    return {
      total,
      published,
      hidden,
      flagged,
      pending,
      featured: 0, // Would need featured flag in API
      averageRating: total > 0 ? totalRating / total : 0,
      totalHelpfulVotes,
      totalViews,
      withMedia,
      verified
    };
  }, [transformedReviews]);

  // Export functionality
  const handleExport = useCallback(() => {
    if (!transformedReviews.length) return;

    const csvContent = [
      'ID,Title,Content,Rating,Status,Author,Product,Created At,Helpful Votes,Views',
      ...transformedReviews.map(review => [
        review.id,
        `"${review.title.replace(/"/g, '""')}"`,
        `"${review.content.substring(0, 100).replace(/"/g, '""')}..."`,
        review.rating,
        review.status,
        review.author.name,
        review.product.name,
        review.createdAt,
        review.metrics.helpfulVotes,
        review.metrics.views
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reviews-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, [transformedReviews]);

  // Handlers
  const handleFilterChange = useCallback((key: keyof FilterOptions, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const handleSelectAll = useCallback(() => {
    const allIds = transformedReviews.map(r => r.id);
    const newSelection = selectedReviews.length === allIds.length ? [] : allIds;
    setSelectedReviews(newSelection);
    onSelectionChange?.(newSelection);
  }, [transformedReviews, selectedReviews.length, onSelectionChange]);

  const handleSelectReview = useCallback((reviewId: string, checked: boolean) => {
    const newSelection = checked 
      ? [...selectedReviews, reviewId]
      : selectedReviews.filter(id => id !== reviewId);
    setSelectedReviews(newSelection);
    onSelectionChange?.(newSelection);
  }, [selectedReviews, onSelectionChange]);

  const handleBulkAction = useCallback((action: BulkActionType['action']) => {
    if (!selectedReviews.length) return;
    setBulkActionDialog({ action, selectedIds: selectedReviews });
  }, [selectedReviews]);

  const executeBulkAction = useCallback(async () => {
    if (!bulkActionDialog) return;

    try {
      const { action, selectedIds } = bulkActionDialog;
      
      if (action === 'export') {
        handleExport();
      } else {
        // Execute bulk action via API
        for (const id of selectedIds) {
          switch (action) {
            case 'approve':
            case 'reject':
              addNotification(`${action} action not yet implemented`, 'info');
              break;
            case 'flag':
              await reviewApi.reportReview(id, 'Bulk flagged by moderator');
              break;
            case 'delete':
              await reviewApi.deleteReview(id);
              break;
            case 'feature':
              addNotification('Feature action not yet implemented', 'info');
              break;
          }
        }
        
        // Refresh data
        refetch();
      }

      // Reset selection
      setSelectedReviews([]);
      setBulkActionDialog(null);
      addNotification(`Bulk ${bulkActionDialog.action} completed successfully`, 'success');
    } catch (error) {
      console.error('Bulk action failed:', error);
      addNotification(`Bulk ${bulkActionDialog.action} failed`, 'error');
    }
  }, [bulkActionDialog, refetch, handleExport, addNotification]);

  const handleReviewUpdate = useCallback(() => {
    refetch();
    onReviewUpdate?.();
  }, [refetch, onReviewUpdate]);

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load reviews</h3>
          <p className="text-sm text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">Total Reviews</p>
            <p className="text-2xl font-bold text-blue-600">{statistics.total}</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Published</p>
            <p className="text-2xl font-bold text-green-600">{statistics.published}</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <EyeOff className="w-5 h-5 text-gray-600" />
            </div>
            <p className="text-sm text-gray-600">Hidden</p>
            <p className="text-2xl font-bold text-gray-600">{statistics.hidden}</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-sm text-gray-600">Flagged</p>
            <p className="text-2xl font-bold text-orange-600">{statistics.flagged}</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{statistics.pending}</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-sm text-gray-600">Avg Rating</p>
            <p className="text-2xl font-bold text-yellow-600">{statistics.averageRating.toFixed(1)}</p>
          </div>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-3">
          <div className="flex items-center space-x-2">
            <ThumbsUp className="w-4 h-4 text-green-500" />
            <div>
              <p className="text-xs text-gray-600">Helpful Votes</p>
              <p className="text-lg font-semibold">{statistics.totalHelpfulVotes}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-xs text-gray-600">Total Views</p>
              <p className="text-lg font-semibold">{statistics.totalViews}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-primary-500" />
            <div>
              <p className="text-xs text-gray-600">With Media</p>
              <p className="text-lg font-semibold">{statistics.withMedia}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center space-x-2">
            <CheckSquare className="w-4 h-4 text-teal-500" />
            <div>
              <p className="text-xs text-gray-600">Verified</p>
              <p className="text-lg font-semibold">{statistics.verified}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">Account Reviews</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-md">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-r-none border-r-0"
                >
                  List
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none border-r-0"
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'compact' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('compact')}
                  className="rounded-l-none"
                >
                  Compact
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={!transformedReviews.length}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Search and Basic Filters */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search reviews by title, content, or author..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select 
                  value={filters.status} 
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2"
                  aria-label="Filter by status"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="hidden">Hidden</option>
                  <option value="flagged">Flagged</option>
                  <option value="pending">Pending</option>
                </select>

                <select 
                  value={filters.rating} 
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2"
                  aria-label="Filter by rating"
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <select 
                    value={filters.sortBy} 
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    aria-label="Sort by"
                  >
                    <option value="createdAt">Date Created</option>
                    <option value="rating">Rating</option>
                    <option value="helpful">Most Helpful</option>
                    <option value="views">Most Viewed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="w-full justify-center"
                  >
                    {filters.sortOrder === 'asc' ? (
                      <>
                        <SortAsc className="w-4 h-4 mr-2" />
                        Ascending
                      </>
                    ) : (
                      <>
                        <SortDesc className="w-4 h-4 mr-2" />
                        Descending
                      </>
                    )}
                  </Button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Verified Reviews
                  </label>
                  <select 
                    value={filters.verified} 
                    onChange={(e) => handleFilterChange('verified', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    aria-label="Filter by verification"
                  >
                    <option value="all">All Reviews</option>
                    <option value="true">Verified Only</option>
                    <option value="false">Unverified Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Media Filter
                  </label>
                  <label className="flex items-center space-x-2 pt-2">
                    <Checkbox
                      checked={filters.withMedia}
                      onChange={(e) => handleFilterChange('withMedia', e.target.checked)}
                    />
                    <span className="text-sm">With Media Only</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date From
                  </label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date To
                  </label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedReviews.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedReviews.length} reviews selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('approve')}
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('reject')}
              >
                <EyeOff className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('flag')}
              >
                <Flag className="w-4 h-4 mr-2" />
                Flag
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('feature')}
              >
                <Star className="w-4 h-4 mr-2" />
                Feature
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('export')}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleBulkAction('delete')}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Bulk Selection Header */}
      {transformedReviews.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedReviews.length === transformedReviews.length}
                onChange={handleSelectAll}
              />
              <span className="text-sm font-medium">
                Select All ({transformedReviews.length} reviews)
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                Items per page:
              </span>
              <select 
                value={itemsPerPage.toString()} 
                onChange={(e) => {
                  setItemsPerPage(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-md px-3 py-2 w-20"
                aria-label="Items per page"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Reviews List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : 'space-y-4'}>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-32 w-full" />
              </Card>
            ))}
          </div>
        ) : transformedReviews.length === 0 ? (
          <Card className="p-12">
            <div className="text-center text-gray-500">
              <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No reviews found</h3>
              <p className="text-sm">
                {filters.search || filters.status !== 'all' || filters.rating !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'This account has not written any reviews yet.'
                }
              </p>
            </div>
          </Card>
        ) : (
          <AnimatePresence>
            {transformedReviews.map((review) => (
              <AccountReviewItem
                key={review.id}
                review={review}
                isSelected={selectedReviews.includes(review.id)}
                onSelect={(checked) => handleSelectReview(review.id, checked)}
                onUpdate={handleReviewUpdate}
                showProductContext={!productId}
                showMetrics={true}
                compact={viewMode === 'compact'}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Pagination */}
      {transformedReviews.length > 0 && reviewsResponse?.data && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil((reviewsResponse.data.length || 0) / itemsPerPage) || 1}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Bulk Action Confirmation Dialog */}
      {bulkActionDialog && (
        <Modal
          open={!!bulkActionDialog}
          onClose={() => setBulkActionDialog(null)}
          title={`Confirm Bulk ${bulkActionDialog?.action}`}
        >
          <div className="p-6">
            <p className="mb-4">
              Are you sure you want to {bulkActionDialog?.action} {bulkActionDialog?.selectedIds.length} selected reviews? 
              {bulkActionDialog?.action === 'delete' && ' This action cannot be undone.'}
            </p>
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setBulkActionDialog(null)}>
                Cancel
              </Button>
              <Button 
                onClick={executeBulkAction}
                variant={bulkActionDialog?.action === 'delete' ? 'destructive' : 'default'}
              >
                Confirm {bulkActionDialog?.action}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
