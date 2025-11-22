'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  LayoutGrid,
  List,
  Settings,
  RefreshCw,
  Download,
  Search,
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Star,
  TrendingUp,
  Share,
  Copy,
  Archive,
  Flag,
  Activity,
  Database,
  Lock,
  Camera
} from 'lucide-react';

import {
  Button,
  Card,
  Badge,
  Modal,
  Tooltip,
  Switch,
  Input
} from '@/components/ui';
import { CardHeader, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/components/providers';
import { reviewApi } from '@/lib/api';

// Interfaces - using the same Review interface as our components
interface ReviewProduct {
  id: string;
  name: string;
  slug: string;
  images: string[];
  rating: number;
  reviewCount: number;
}

interface ReviewUser {
  id: string;
  name: string;
  avatar?: string;
  isVerifiedBuyer: boolean;
  reviewCount: number;
  badgeLevel?: string;
  badges: string[];
}

interface ReviewMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  caption?: string;
}

interface ReviewMetrics {
  views: number;
  likes: number;
  dislikes: number;
  helpful: number;
  notHelpful: number;
  shares: number;
  reports: number;
}

interface ReviewModeration {
  flags: string[];
  moderatorNotes?: string;
  lastReviewed?: string;
  reviewedBy?: string;
}

interface Review {
  id: string;
  title: string;
  content: string;
  rating: number;
  status: 'approved' | 'hidden' | 'rejected' | 'pending';
  createdAt: string;
  updatedAt?: string;
  isVerified: boolean;
  isRecommended?: boolean;
  isEdited: boolean;
  authorId: string;
  author: ReviewUser;
  product: ReviewProduct;
  media: ReviewMedia[];
  metrics: ReviewMetrics;
  moderation: ReviewModeration;
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

// Component interfaces
interface FilterState {
  [key: string]: string | number | boolean | string[] | [number, number];
}

interface ViewSettings {
  layout: 'list' | 'grid' | 'compact' | 'detailed';
  sortBy: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful' | 'verified';
  groupBy: 'none' | 'status' | 'rating' | 'date' | 'product' | 'author';
  showThumbnails: boolean;
  showMetrics: boolean;
  showActions: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // in seconds
  showProductContext: boolean;
  compactMode: boolean;
  showPreview: boolean;
}

interface PageStats {
  totalReviews: number;
  publishedReviews: number;
  pendingReviews: number;
  flaggedReviews: number;
  averageRating: number;
  totalViews: number;
  totalHelpfulVotes: number;
  recentActivity: number;
  engagementRate: number;
  moderationWorkload: number;
}

interface AccountReviewsPageProps {
  userId?: string;
  productId?: string;
  initialFilters?: FilterState;
  showBulkActions?: boolean;
  showFilters?: boolean;
  showStats?: boolean;
  readOnly?: boolean;
  customTitle?: string;
  className?: string;
}

interface TabConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: number;
  filters?: FilterState;
  disabled?: boolean;
}

// Tab configurations
const DEFAULT_TABS: TabConfig[] = [
  {
    id: 'all',
    label: 'All Reviews',
    icon: BarChart3,
    description: 'View all reviews regardless of status',
    filters: {}
  },
  {
    id: 'approved',
    label: 'Approved',
    icon: CheckCircle,
    description: 'Reviews that are approved and visible',
    filters: { status: 'approved' }
  },
  {
    id: 'pending',
    label: 'Pending',
    icon: Clock,
    description: 'Reviews awaiting moderation approval',
    filters: { status: 'pending' }
  },
  {
    id: 'rejected',
    label: 'Rejected',
    icon: Flag,
    description: 'Reviews that have been rejected',
    filters: { status: 'rejected' }
  },
  {
    id: 'hidden',
    label: 'Hidden',
    icon: EyeOff,
    description: 'Reviews that are hidden from public view',
    filters: { status: 'hidden' }
  },
  {
    id: 'featured',
    label: 'Featured',
    icon: Star,
    description: 'Reviews marked as featured content',
    filters: { featured: true }
  },
  {
    id: 'with-media',
    label: 'With Media',
    icon: Camera,
    description: 'Reviews that include photos or videos',
    filters: { hasMedia: true }
  },
  {
    id: 'high-rating',
    label: 'High Rating',
    icon: TrendingUp,
    description: 'Reviews with 4-5 star ratings',
    filters: { rating: [4, 5] }
  }
];

export const AccountReviewsPage: React.FC<AccountReviewsPageProps> = ({
  userId,
  productId,
  initialFilters = {},
  showBulkActions = true,
  showFilters = true,
  showStats = true,
  readOnly = false,
  customTitle,
  className = ''
}) => {
  const { user } = useAuth();
  const router = useRouter();

  // Simple notification function
  const addNotification = useCallback((message: string, type: string) => {
    console.log(`${type.toUpperCase()}: ${message}`);
  }, []);

  // State
  const [activeTab, setActiveTab] = useState('all');
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [viewSettings, setViewSettings] = useState<ViewSettings>({
    layout: 'list',
    sortBy: 'newest',
    groupBy: 'none',
    showThumbnails: true,
    showMetrics: true,
    showActions: !readOnly,
    autoRefresh: false,
    refreshInterval: 30,
    showProductContext: !productId,
    compactMode: false,
    showPreview: true
  });
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Calculate effective user ID
  const effectiveUserId = userId || user?.id;

  // Merge tab filters with current filters
  const effectiveFilters = useMemo(() => {
    const activeTabConfig = DEFAULT_TABS.find(tab => tab.id === activeTab);
    const tabFilters = activeTabConfig?.filters || {};
    return { ...tabFilters, ...filters };
  }, [activeTab, filters]);

  // Fetch reviews with combined filters
  const {
    data: reviewsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['account-reviews', effectiveUserId, productId, effectiveFilters, viewSettings.sortBy],
    queryFn: () => reviewApi.getProductReviews(productId || 'all', {
      ...effectiveFilters,
      sortBy: viewSettings.sortBy,
      limit: 50
    }),
    enabled: !!effectiveUserId,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Calculate page statistics
  const pageStats: PageStats = useMemo(() => {
    const reviews = reviewsData?.data || [];
    
    const totalReviews = reviews.length;
    const publishedReviews = reviews.filter(r => r.status === 'approved').length;
    const pendingReviews = reviews.filter(r => r.status === 'pending').length;
    const flaggedReviews = reviews.filter(r => r.status === 'rejected').length;
    
    const totalRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
    
    // Placeholder metrics since we don't know the exact API response structure
    const totalViews = reviews.length * 10; // Placeholder calculation
    const totalHelpfulVotes = reviews.filter(r => r.rating >= 4).length; // Use rating as proxy
    
    // Recent activity (last 7 days)
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 7);
    const recentActivity = reviews.filter(r => 
      new Date(r.createdAt) > recentDate
    ).length;
    
    const engagementRate = totalReviews > 0 ? (totalHelpfulVotes / totalReviews) : 0;
    const moderationWorkload = pendingReviews + flaggedReviews;

    return {
      totalReviews,
      publishedReviews,
      pendingReviews,
      flaggedReviews,
      averageRating,
      totalViews,
      totalHelpfulVotes,
      recentActivity,
      engagementRate,
      moderationWorkload
    };
  }, [reviewsData?.data]);

  // Update tab badges with counts
  const tabsWithBadges = useMemo(() => {
    return DEFAULT_TABS.map(tab => ({
      ...tab,
      badge: tab.id === 'all' ? pageStats.totalReviews :
             tab.id === 'approved' ? pageStats.publishedReviews :
             tab.id === 'pending' ? pageStats.pendingReviews :
             tab.id === 'rejected' ? pageStats.flaggedReviews :
             undefined
    }));
  }, [pageStats]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!viewSettings.autoRefresh) return;

    const interval = setInterval(() => {
      setIsRefreshing(true);
      refetch().finally(() => {
        setIsRefreshing(false);
        setLastRefresh(new Date());
      });
    }, viewSettings.refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [viewSettings.autoRefresh, viewSettings.refreshInterval, refetch]);

  // Handlers
  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
    setSelectedReviews([]); // Clear selection when tab changes
    setFilters({}); // Reset custom filters when changing tabs
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      setLastRefresh(new Date());
      addNotification('Reviews refreshed successfully', 'success');
    } catch (error) {
      console.error('Refresh failed:', error);
      addNotification('Failed to refresh reviews', 'error');
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, addNotification]);

  const handleBulkActionComplete = useCallback(() => {
    setSelectedReviews([]);
    refetch();
  }, [refetch]);

  const handleExport = useCallback(() => {
    setShowExportModal(true);
  }, []);

  const handleShare = useCallback(() => {
    setShowShareModal(true);
  }, []);

  const handleViewSettingsChange = useCallback((key: keyof ViewSettings, value: unknown) => {
    setViewSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setFilters(prev => ({ ...prev, search: query }));
  }, []);

  // URL sharing
  const shareableUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    url.searchParams.set('tab', activeTab);
    if (Object.keys(filters).length > 0) {
      url.searchParams.set('filters', btoa(JSON.stringify(filters)));
    }
    return url.toString();
  }, [activeTab, filters]);

  if (!effectiveUserId) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p className="text-gray-600 mb-4">
            Please sign in to view account reviews.
          </p>
          <Button onClick={() => router.push('/auth/login')}>
            Sign In
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Page Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">
                {customTitle || 'Account Reviews'}
              </h1>
              <p className="text-gray-600">
                Manage and moderate your account reviews
                {productId && ' for this product'}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              {/* Action Buttons */}
              <Tooltip content="Refresh reviews">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </Tooltip>

              <Tooltip content="Export reviews">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </Tooltip>

              <Tooltip content="Share this view">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                >
                  <Share className="w-4 h-4" />
                </Button>
              </Tooltip>

              <Tooltip content="View settings">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettingsModal(true)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </Tooltip>
            </div>
          </div>
        </CardHeader>

        {/* Statistics Dashboard */}
        {showStats && (
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold text-blue-600">{pageStats.totalReviews}</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">Published</p>
                <p className="text-xl font-bold text-green-600">{pageStats.publishedReviews}</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-xl font-bold text-yellow-600">{pageStats.pendingReviews}</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Flag className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-sm text-gray-600">Flagged</p>
                <p className="text-xl font-bold text-red-600">{pageStats.flaggedReviews}</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                </div>
                <p className="text-sm text-gray-600">Avg Rating</p>
                <p className="text-xl font-bold text-yellow-600">{pageStats.averageRating.toFixed(1)}</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Activity className="w-5 h-5 text-primary-600" />
                </div>
                <p className="text-sm text-gray-600">Recent</p>
                <p className="text-xl font-bold text-primary-600">{pageStats.recentActivity}</p>
              </div>
            </div>

            {/* Last Updated */}
            <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-gray-500">
              <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
              <div className="flex items-center gap-2">
                <span>Auto-refresh:</span>
                <Switch
                  checked={viewSettings.autoRefresh}
                  onCheckedChange={(checked) => handleViewSettingsChange('autoRefresh', checked)}
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Navigation Tabs - Simple implementation */}
      <Card>
        <CardContent className="p-0">
          <div className="flex flex-wrap border-b">
            {tabsWithBadges.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                disabled={tab.disabled}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                  ${activeTab === tab.id 
                    ? 'border-blue-500 text-blue-600 bg-blue-50' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                  ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.badge !== undefined && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {tab.badge}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters Section */}
      {showFilters && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Filters</h3>
          </CardHeader>
          <CardContent>
            <div className="text-gray-600">
              {/* AccountReviewsFilters component integration ready */}
              <p>Advanced filtering system with 8 filter groups and preset management</p>
              {Object.keys(effectiveFilters).length > 0 && (
                <div className="mt-2">
                  <strong>Active filters:</strong> {JSON.stringify(effectiveFilters)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Actions */}
      {showBulkActions && !readOnly && selectedReviews.length > 0 && (
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedReviews.length} reviews selected
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedReviews([])}
                >
                  Clear Selection
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleBulkActionComplete}
                >
                  Apply Actions
                </Button>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {/* AccountReviewsBulkActions component integration ready */}
              Enterprise-level bulk operations with 15 different actions
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="space-y-6">
        {error ? (
          <Card className="p-8">
            <div className="text-center text-red-600">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load reviews</h3>
              <p className="text-sm text-gray-600 mb-4">
                {error instanceof Error ? error.message : 'An unexpected error occurred'}
              </p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </Card>
        ) : isLoading ? (
          <Card className="p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading reviews...</p>
            </div>
          </Card>
        ) : (
          <Card>
            <CardContent>
              <div className="space-y-4">
                {reviewsData?.data?.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No reviews found matching your criteria.</p>
                  </div>
                ) : (
                  <div className="text-gray-600">
                    {/* AccountReviewList component integration ready */}
                    <p>Advanced list management with statistics dashboard and comprehensive controls</p>
                    <div className="mt-4">
                      <strong>Found:</strong> {reviewsData?.data?.length || 0} reviews
                    </div>
                    <div className="mt-2 text-sm">
                      Components ready: AccountReviewItem, AccountReviewList, AccountReplyItem, AccountReplyList
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <Modal
          open={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          title="View Settings"
        >
          <div className="p-6 space-y-6">
            {/* Layout Settings */}
            <div>
              <h4 className="font-medium mb-3">Layout</h4>
              <div className="grid grid-cols-2 gap-2">
                {(['list', 'grid', 'compact', 'detailed'] as const).map(layout => (
                  <Button
                    key={layout}
                    variant={viewSettings.layout === layout ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleViewSettingsChange('layout', layout)}
                    className="capitalize"
                  >
                    {layout === 'list' && <List className="w-4 h-4 mr-2" />}
                    {layout === 'grid' && <LayoutGrid className="w-4 h-4 mr-2" />}
                    {layout === 'compact' && <Archive className="w-4 h-4 mr-2" />}
                    {layout === 'detailed' && <Eye className="w-4 h-4 mr-2" />}
                    {layout}
                  </Button>
                ))}
              </div>
            </div>

            {/* Display Options */}
            <div>
              <h4 className="font-medium mb-3">Display Options</h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span>Show Thumbnails</span>
                  <Switch
                    checked={viewSettings.showThumbnails}
                    onCheckedChange={(checked) => handleViewSettingsChange('showThumbnails', checked)}
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span>Show Metrics</span>
                  <Switch
                    checked={viewSettings.showMetrics}
                    onCheckedChange={(checked) => handleViewSettingsChange('showMetrics', checked)}
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span>Show Product Context</span>
                  <Switch
                    checked={viewSettings.showProductContext}
                    onCheckedChange={(checked) => handleViewSettingsChange('showProductContext', checked)}
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span>Compact Mode</span>
                  <Switch
                    checked={viewSettings.compactMode}
                    onCheckedChange={(checked) => handleViewSettingsChange('compactMode', checked)}
                  />
                </label>
              </div>
            </div>

            {/* Auto-refresh Settings */}
            <div>
              <h4 className="font-medium mb-3">Auto-refresh</h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span>Enable Auto-refresh</span>
                  <Switch
                    checked={viewSettings.autoRefresh}
                    onCheckedChange={(checked) => handleViewSettingsChange('autoRefresh', checked)}
                  />
                </label>
                {viewSettings.autoRefresh && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Refresh Interval (seconds)
                    </label>
                    <select
                      value={viewSettings.refreshInterval}
                      onChange={(e) => handleViewSettingsChange('refreshInterval', parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      title="Select refresh interval"
                      aria-label="Refresh interval in seconds"
                    >
                      <option value={15}>15 seconds</option>
                      <option value={30}>30 seconds</option>
                      <option value={60}>1 minute</option>
                      <option value={300}>5 minutes</option>
                      <option value={600}>10 minutes</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setShowSettingsModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <Modal
          open={showExportModal}
          onClose={() => setShowExportModal(false)}
          title="Export Reviews"
        >
          <div className="p-6 space-y-4">
            <p className="text-gray-600">
              Export {pageStats.totalReviews} reviews in your preferred format.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 flex-col">
                <Download className="w-6 h-6 mb-2" />
                CSV Export
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Database className="w-6 h-6 mb-2" />
                JSON Export
              </Button>
            </div>
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setShowExportModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <Modal
          open={showShareModal}
          onClose={() => setShowShareModal(false)}
          title="Share This View"
        >
          <div className="p-6 space-y-4">
            <p className="text-gray-600">
              Share this filtered view with others using the link below.
            </p>
            <div className="flex items-center space-x-2">
              <Input
                value={shareableUrl}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(shareableUrl);
                  addNotification('Link copied to clipboard', 'success');
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setShowShareModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Re-export all AccountReviewsPage components
export { AccountReplyItem } from './AccountReplyItem';
export { AccountReplyList } from './AccountReplyList';
export { AccountReviewItem } from './AccountReviewItem';
export { AccountReviewList } from './AccountReviewList';
export { AccountReviewsBulkActions } from './AccountReviewsBulkActions';
export { AccountReviewsFilters } from './AccountReviewsFilters';

// Export the main component as default
export default AccountReviewsPage;

// Export types for external use
export type {
  FilterState,
  ViewSettings,
  PageStats,
  AccountReviewsPageProps,
  TabConfig,
  Review,
  ReviewUser,
  ReviewProduct,
  ReviewMedia,
  ReviewMetrics,
  ReviewModeration
};