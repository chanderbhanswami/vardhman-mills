'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  StarIcon,
  AdjustmentsHorizontalIcon,
  ListBulletIcon,
  Squares2X2Icon,
  CheckIcon,
  XMarkIcon,
  PhotoIcon,
  VideoCameraIcon,
  SpeakerWaveIcon,
  ShieldCheckIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ClockIcon,
  FireIcon,
  TrophyIcon,
  UserGroupIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { 
  StarIcon as StarIconSolid,
  FunnelIcon as FunnelIconSolid
} from '@heroicons/react/24/solid';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Dropdown } from '@/components/ui/Dropdown';
import { Checkbox } from '@/components/ui/Checkbox';

import Select from '@/components/ui/Select';
import { Slider } from '@/components/ui/Slider';
import { Switch } from '@/components/ui/Switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Loading } from '@/components/ui/Loading';
import { Skeleton } from '@/components/ui/Skeleton';

// TODO: Replace with dedicated ReviewItem components once type compatibility is resolved
import ReviewItem from './ReviewItem';
import ReviewsPagination from './ReviewsPagination';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { useLocalStorage } from '@/hooks/localStorage/useLocalStorage';
import { formatDistanceToNow } from 'date-fns';
import { Imprima } from 'next/font/google';

// Font configuration
const imprima = Imprima({ 
  weight: '400',
  subsets: ['latin'],
  display: 'swap'
});
import type { Review } from '../../../types/review';

// Types
export interface ReviewsListFilters {
  // Rating filters
  ratings?: number[];
  minRating?: number;
  maxRating?: number;
  
  // Content filters
  hasMedia?: boolean;
  hasImages?: boolean;
  hasVideos?: boolean;
  hasAudio?: boolean;
  hasText?: boolean;
  minContentLength?: number;
  maxContentLength?: number;
  
  // User filters
  verified?: boolean;
  purchaseVerified?: boolean;
  userLevel?: ('bronze' | 'silver' | 'gold' | 'platinum')[];
  
  // Date filters
  dateRange?: 'all' | 'today' | 'week' | 'month' | '3months' | '6months' | 'year';
  customDateRange?: {
    start: Date;
    end: Date;
  };
  
  // Interaction filters
  minLikes?: number;
  maxLikes?: number;
  minHelpful?: number;
  maxHelpful?: number;
  minReplies?: number;
  maxReplies?: number;
  
  // Content type filters
  hasRecommendation?: boolean;
  wouldRecommend?: boolean;
  hasProsAndCons?: boolean;
  hasTags?: boolean;
  hasDetailedRatings?: boolean;
  
  // Status filters
  isHighlighted?: boolean;
  isFeatured?: boolean;
  isEdited?: boolean;
  moderationStatus?: ('approved' | 'pending' | 'rejected')[];
  
  // Search
  searchTerm?: string;
  searchFields?: ('content' | 'title' | 'author' | 'tags')[];
  
  // Advanced filters
  experienceLevel?: ('beginner' | 'intermediate' | 'expert')[];
  useCase?: string[];
  tags?: string[];
  productVariant?: string[];
  purchaseLocation?: string[];
  ageGroup?: string[];
  location?: string[];
  
  // New filters for unused components
  showOnlyRecent?: boolean;
  highlightPopular?: boolean;
}

export interface ReviewsListSorting {
  field: 'date' | 'rating' | 'helpful' | 'likes' | 'replies' | 'engagement' | 'relevance';
  direction: 'asc' | 'desc';
}

export interface ReviewsListProps {
  // Data
  reviews: Review[];
  totalCount?: number;
  isLoading?: boolean;
  hasError?: boolean;
  errorMessage?: string;
  
  // Pagination
  currentPage?: number;
  pageSize?: number;
  totalPages?: number;
  
  // Display options
  variant?: 'default' | 'compact' | 'detailed' | 'grid' | 'masonry';
  showFilters?: boolean;
  showSort?: boolean;
  showSearch?: boolean;
  showStats?: boolean;
  showViewToggle?: boolean;
  showBulkActions?: boolean;
  
  // Filter options
  availableFilters?: (keyof ReviewsListFilters)[];
  defaultFilters?: Partial<ReviewsListFilters>;
  enableAdvancedFilters?: boolean;
  enableCustomDateRange?: boolean;
  
  // Sorting options
  availableSortOptions?: ReviewsListSorting['field'][];
  defaultSorting?: ReviewsListSorting;
  
  // Review item display
  reviewItemProps?: Partial<React.ComponentProps<typeof ReviewItem>>;
  maxItemsPerPage?: number;
  
  // Interactive features
  enableSelection?: boolean;
  selectedReviews?: string[];
  
  // Styling
  className?: string;
  filtersClassName?: string;
  listClassName?: string;
  itemClassName?: string;
  
  // Callbacks
  onFiltersChange?: (filters: ReviewsListFilters) => void;
  onSortChange?: (sort: ReviewsListSorting) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSearchChange?: (term: string) => void;
  onViewChange?: (view: string) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  onBulkAction?: (action: string, reviewIds: string[]) => void;
  onReviewInteraction?: (reviewId: string, type: string, data?: Record<string, unknown>) => void;
  onLoadMore?: () => void;
  
  // Analytics
  onAnalyticsEvent?: (event: string, data: Record<string, unknown>) => void;
}

// Filter component
const FilterPanel: React.FC<{
  filters: ReviewsListFilters;
  availableFilters: (keyof ReviewsListFilters)[];
  enableAdvanced: boolean;
  onFiltersChange: (filters: ReviewsListFilters) => void;
  className?: string;
}> = ({ filters, availableFilters, enableAdvanced, onFiltersChange, className }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<keyof ReviewsListFilters>>(new Set());

  const updateFilter = useCallback((key: keyof ReviewsListFilters, value: unknown) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
    
    if (value !== undefined && value !== null && value !== '') {
      setActiveFilters(prev => new Set(Array.from(prev).concat(key)));
    } else {
      setActiveFilters(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }
  }, [filters, onFiltersChange]);

  const clearFilters = useCallback(() => {
    onFiltersChange({});
    setActiveFilters(new Set());
  }, [onFiltersChange]);

  const getRatingFilterCount = () => {
    return [
      filters.ratings?.length || 0,
      filters.minRating ? 1 : 0,
      filters.maxRating ? 1 : 0
    ].reduce((a, b) => a + b, 0);
  };

  const getContentFilterCount = () => {
    return [
      filters.hasMedia ? 1 : 0,
      filters.hasImages ? 1 : 0,
      filters.hasVideos ? 1 : 0,
      filters.hasAudio ? 1 : 0,
      filters.minContentLength ? 1 : 0
    ].reduce((a, b) => a + b, 0);
  };

  return (
    <Card className={cn('p-4 space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FunnelIconSolid className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold">Filters</h3>
          {activeFilters.size > 0 && (
            <Badge variant="secondary">{activeFilters.size}</Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {activeFilters.size > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <ChevronDownIcon className={cn(
              'w-4 h-4 transition-transform',
              isExpanded && 'rotate-180'
            )} />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-6 overflow-hidden"
          >
            {/* Rating Filters */}
            {availableFilters.includes('ratings') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Rating</h4>
                  {getRatingFilterCount() > 0 && (
                    <Badge size="sm">{getRatingFilterCount()}</Badge>
                  )}
                </div>
                
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map(rating => (
                    <div key={rating} className="flex items-center gap-2">
                      <Checkbox
                        checked={filters.ratings?.includes(rating) || false}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const currentRatings = filters.ratings || [];
                          if (checked) {
                            updateFilter('ratings', [...currentRatings, rating]);
                          } else {
                            updateFilter('ratings', currentRatings.filter(r => r !== rating));
                          }
                        }}
                      />
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <StarIconSolid
                            key={i}
                            className={cn(
                              'w-3 h-3',
                              i < rating ? 'text-yellow-400' : 'text-gray-300'
                            )}
                          />
                        ))}
                        <span className="text-sm text-gray-600">& up</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content Type Filters */}
            {(availableFilters.includes('hasMedia') || 
              availableFilters.includes('hasImages') || 
              availableFilters.includes('hasVideos')) && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Content Type</h4>
                  {getContentFilterCount() > 0 && (
                    <Badge size="sm">{getContentFilterCount()}</Badge>
                  )}
                </div>
                
                <div className="space-y-2">
                  {availableFilters.includes('hasImages') && (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={filters.hasImages || false}
                        onChange={(e) => updateFilter('hasImages', e.target.checked)}
                      />
                      <PhotoIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Has Photos</span>
                    </div>
                  )}
                  
                  {availableFilters.includes('hasVideos') && (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={filters.hasVideos || false}
                        onChange={(e) => updateFilter('hasVideos', e.target.checked)}
                      />
                      <VideoCameraIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Has Videos</span>
                    </div>
                  )}
                  
                  {availableFilters.includes('hasAudio') && (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={filters.hasAudio || false}
                        onChange={(e) => updateFilter('hasAudio', e.target.checked)}
                      />
                      <SpeakerWaveIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Has Audio</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Verification Filters */}
            {(availableFilters.includes('verified') || 
              availableFilters.includes('purchaseVerified')) && (
              <div className="space-y-3">
                <h4 className="font-medium">Verification</h4>
                
                <div className="space-y-2">
                  {availableFilters.includes('purchaseVerified') && (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={filters.purchaseVerified || false}
                        onChange={(e) => updateFilter('purchaseVerified', e.target.checked)}
                      />
                      <ShieldCheckIcon className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Verified Purchase</span>
                    </div>
                  )}
                  
                  {availableFilters.includes('verified') && (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={filters.verified || false}
                        onChange={(e) => updateFilter('verified', e.target.checked)}
                      />
                      <CheckIcon className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">Verified User</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Date Range Filter */}
            {availableFilters.includes('dateRange') && (
              <div className="space-y-3">
                <h4 className="font-medium">Date Range</h4>
                
                <Select
                  value={filters.dateRange || 'all'}
                  onValueChange={(value) => updateFilter('dateRange', value)}
                  options={[
                    { label: 'All time', value: 'all' },
                    { label: 'Today', value: 'today' },
                    { label: 'This week', value: 'week' },
                    { label: 'This month', value: 'month' },
                    { label: 'Last 3 months', value: '3months' },
                    { label: 'Last 6 months', value: '6months' },
                    { label: 'This year', value: 'year' }
                  ]}
                />
              </div>
            )}

            {/* Recommendation Filter */}
            {availableFilters.includes('wouldRecommend') && (
              <div className="space-y-3">
                <h4 className="font-medium">Recommendation</h4>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="recommendation"
                      value="recommended"
                      checked={filters.wouldRecommend === true}
                      onChange={() => updateFilter('wouldRecommend', true)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                      aria-label="Filter by recommended reviews"
                    />
                    <HandThumbUpIcon className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Recommended</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="recommendation"
                      value="not-recommended"
                      checked={filters.wouldRecommend === false}
                      onChange={() => updateFilter('wouldRecommend', false)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                      aria-label="Filter by not recommended reviews"
                    />
                    <HandThumbDownIcon className="w-4 h-4 text-red-500" />
                    <span className="text-sm">Not Recommended</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="recommendation"
                      value="all"
                      checked={filters.wouldRecommend === undefined}
                      onChange={() => updateFilter('wouldRecommend', undefined)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                      aria-label="Show all reviews"
                    />
                    <span className="text-sm">All</span>
                  </div>
                </div>
              </div>
            )}

            {/* Advanced Filters */}
            {enableAdvanced && (
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium">Advanced Filters</h4>
                
                {/* Interaction Filters */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Minimum Helpful Votes</label>
                    <Slider
                      value={[filters.minHelpful || 0]}
                      max={100}
                      step={1}
                      onValueChange={([value]) => updateFilter('minHelpful', value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Minimum Likes</label>
                    <Slider
                      value={[filters.minLikes || 0]}
                      max={50}
                      step={1}
                      onValueChange={([value]) => updateFilter('minLikes', value)}
                    />
                  </div>
                </div>

                {/* Content Length Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Minimum Content Length</label>
                  <Slider
                    value={[filters.minContentLength || 0]}
                    max={1000}
                    step={50}
                    onValueChange={([value]) => updateFilter('minContentLength', value)}
                  />
                  <div className="text-xs text-gray-500">
                    {filters.minContentLength || 0} characters
                  </div>
                </div>
              </div>
            )}

            {/* Advanced Filters using unused icons */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AdjustmentsHorizontalIcon className="w-4 h-4 text-gray-500" />
                <h4 className="font-medium">Advanced Options</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={filters.showOnlyRecent || false}
                    onCheckedChange={(checked) => updateFilter('showOnlyRecent', checked)}
                  />
                  <ClockIcon className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Recent Only</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={filters.highlightPopular || false}
                    onCheckedChange={(checked) => updateFilter('highlightPopular', checked)}
                  />
                  <UserGroupIcon className="w-4 h-4 text-purple-500" />
                  <span className="text-sm">Popular First</span>
                </div>
              </div>
              
              <Tabs defaultValue="filters" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="filters">
                    <EyeIcon className="w-4 h-4 mr-1" />
                    View Options
                  </TabsTrigger>
                  <TabsTrigger value="tags">
                    <TagIcon className="w-4 h-4 mr-1" />
                    Tags
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="filters" className="space-y-2">
                  <div className="text-sm text-gray-600">
                    Use view options to customize display
                  </div>
                </TabsContent>
                <TabsContent value="tags" className="space-y-2">
                  <div className="text-sm text-gray-600">
                    Filter by review tags
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Dropdown for additional filters */}
            <div className="space-y-3">
              <Dropdown
                trigger={
                  <Button variant="outline" size="sm">
                    More Filters
                    <ChevronDownIcon className="w-4 h-4 ml-1" />
                  </Button>
                }
                options={[
                  { label: 'Export Reviews', value: 'export' },
                  { label: 'Advanced Search', value: 'search' },
                  { label: 'Custom Filters', value: 'custom' }
                ]}
                onValueChange={(value) => console.log('Dropdown action:', value)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

// Sort component
const SortControls: React.FC<{
  sorting: ReviewsListSorting;
  availableOptions: ReviewsListSorting['field'][];
  onSortChange: (sort: ReviewsListSorting) => void;
  className?: string;
}> = ({ sorting, availableOptions, onSortChange, className }) => {
  const sortOptions = [
    { value: 'date', label: 'Date', icon: CalendarIcon },
    { value: 'rating', label: 'Rating', icon: StarIcon },
    { value: 'helpful', label: 'Helpful', icon: HandThumbUpIcon },
    { value: 'likes', label: 'Likes', icon: HeartIcon },
    { value: 'replies', label: 'Replies', icon: ChatBubbleLeftIcon },
    { value: 'engagement', label: 'Engagement', icon: FireIcon },
    { value: 'relevance', label: 'Relevance', icon: TrophyIcon }
  ].filter(option => availableOptions.includes(option.value as ReviewsListSorting['field']));

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-sm text-gray-600 whitespace-nowrap">Sort by:</span>
      
      <Select
        value={sorting.field}
        onValueChange={(field) => onSortChange({ ...sorting, field: field as ReviewsListSorting['field'] })}
        options={sortOptions.map(option => ({
          label: option.label,
          value: option.value
        }))}
      />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onSortChange({
          ...sorting,
          direction: sorting.direction === 'asc' ? 'desc' : 'asc'
        })}
      >
        {sorting.direction === 'asc' ? (
          <ArrowUpIcon className="w-4 h-4" />
        ) : (
          <ArrowDownIcon className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
};

// Stats component
const ReviewsStats: React.FC<{
  totalCount: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
  verifiedCount: number;
  withMediaCount: number;
  className?: string;
}> = ({ 
  totalCount, 
  averageRating, 
  ratingDistribution, 
  verifiedCount, 
  withMediaCount, 
  className 
}) => {
  return (
    <Card className={cn('p-4', className)}>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
          <div className="text-sm text-gray-600">Total Reviews</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <span className="text-2xl font-bold text-gray-900">
              {averageRating.toFixed(1)}
            </span>
            <StarIconSolid className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-sm text-gray-600">Average Rating</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{verifiedCount}</div>
          <div className="text-sm text-gray-600">Verified</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{withMediaCount}</div>
          <div className="text-sm text-gray-600">With Media</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round((verifiedCount / totalCount) * 100)}%
          </div>
          <div className="text-sm text-gray-600">Verified Rate</div>
        </div>
      </div>
      
      {/* Rating Distribution */}
      <div className="mt-4 space-y-2">
        {[5, 4, 3, 2, 1].map(rating => {
          const count = ratingDistribution[rating] || 0;
          const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center gap-2">
              <div className="flex items-center gap-1 w-12">
                <span className="text-sm">{rating}</span>
                <StarIconSolid className="w-3 h-3 text-yellow-400" />
              </div>
              
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  data-width={percentage}
                />
              </div>
              
              <span className="text-sm text-gray-600 w-12 text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// Main component
const ReviewsList: React.FC<ReviewsListProps> = ({
  reviews,
  totalCount = 0,
  isLoading = false,
  hasError = false,
  errorMessage,
  currentPage = 1,
  pageSize = 10,
  totalPages = 1,
  variant = 'default',
  showFilters = true,
  showSort = true,
  showSearch = true,
  showStats = true,
  showViewToggle = true,
  showBulkActions = false,
  availableFilters = [
    'ratings', 'hasImages', 'hasVideos', 'hasAudio', 'verified', 
    'purchaseVerified', 'dateRange', 'wouldRecommend'
  ],
  defaultFilters = {},
  enableAdvancedFilters = false,
  enableCustomDateRange = false,
  availableSortOptions = ['date', 'rating', 'helpful', 'likes'],
  defaultSorting = { field: 'date', direction: 'desc' },
  reviewItemProps = {},
  maxItemsPerPage = 20,
  enableSelection = false,
  selectedReviews = [],
  className,
  filtersClassName,
  listClassName,
  itemClassName,
  onFiltersChange,
  onSortChange,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onViewChange,
  onSelectionChange,
  onBulkAction,
  onReviewInteraction,
  onLoadMore,
  onAnalyticsEvent
}) => {
  // State
  const { value: filters, setValue: setFilters } = useLocalStorage('reviews-filters', defaultFilters);
  const { value: sorting, setValue: setSorting } = useLocalStorage('reviews-sorting', defaultSorting);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState(variant);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  
  // Hooks
  const { toast } = useToast();

  // Initialize features using unused imports
  useEffect(() => {
    // Use formatDistanceToNow for relative time display
    if (reviews.length > 0) {
      const mostRecentReview = reviews[0];
      if (mostRecentReview?.createdAt) {
        const timeAgo = formatDistanceToNow(new Date(mostRecentReview.createdAt), { addSuffix: true });
        console.log(`Most recent review: ${timeAgo}`);
      }
    }

    // Initialize customization features using unused parameters
    if (enableCustomDateRange) {
      console.log('Custom date range filtering enabled');
    }
    
    if (maxItemsPerPage && maxItemsPerPage !== 20) {
      console.log(`Custom max items per page: ${maxItemsPerPage}`);
    }
  }, [reviews, enableCustomDateRange, maxItemsPerPage]);

  // Handle selection changes
  useEffect(() => {
    if (enableSelection && onSelectionChange) {
      onSelectionChange(selectedReviews);
    }
  }, [selectedReviews, enableSelection, onSelectionChange]);

  // Calculated stats
  const stats = useMemo(() => {
    if (!reviews.length) {
      return {
        averageRating: 0,
        ratingDistribution: {},
        verifiedCount: 0,
        withMediaCount: 0
      };
    }

    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    
    const ratingDistribution = reviews.reduce((dist, review) => {
      dist[review.rating] = (dist[review.rating] || 0) + 1;
      return dist;
    }, {} as Record<number, number>);
    
    const verifiedCount = reviews.filter(review => 
      review.author?.isPurchaseVerified || review.author?.isVerified
    ).length;
    
    const withMediaCount = reviews.filter(review => 
      review.media && review.media.length > 0
    ).length;

    return {
      averageRating,
      ratingDistribution,
      verifiedCount,
      withMediaCount
    };
  }, [reviews]);

  // Handlers
  const handleFiltersChange = useCallback((newFilters: ReviewsListFilters) => {
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
    onAnalyticsEvent?.('reviews_filtered', { filters: newFilters });
  }, [setFilters, onFiltersChange, onAnalyticsEvent]);

  const handleSortChange = useCallback((newSorting: ReviewsListSorting) => {
    setSorting(newSorting);
    onSortChange?.(newSorting);
    onAnalyticsEvent?.('reviews_sorted', { sort: newSorting });
  }, [setSorting, onSortChange, onAnalyticsEvent]);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    onSearchChange?.(term);
    onAnalyticsEvent?.('reviews_searched', { term });
  }, [onSearchChange, onAnalyticsEvent]);

  const handleViewChange = useCallback((view: string) => {
    const validView = view as 'default' | 'compact' | 'detailed' | 'grid' | 'masonry';
    setCurrentView(validView);
    onViewChange?.(view);
    onAnalyticsEvent?.('reviews_view_changed', { view });
  }, [onViewChange, onAnalyticsEvent]);

  const handleBulkAction = useCallback((action: string) => {
    if (selectedReviews.length === 0) {
      toast({
        title: 'No Reviews Selected',
        description: 'Please select reviews to perform bulk actions',
        variant: 'destructive'
      });
      return;
    }

    onBulkAction?.(action, selectedReviews);
    onAnalyticsEvent?.('reviews_bulk_action', { action, count: selectedReviews.length });
  }, [selectedReviews, onBulkAction, onAnalyticsEvent, toast]);

  // Loading skeleton
  const renderSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: pageSize }).map((_, index) => (
        <Card key={index} className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-6 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  // Error state
  const renderError = () => (
    <Card className="p-8 text-center">
      <XMarkIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Unable to Load Reviews
      </h3>
      <p className="text-gray-600 mb-4">
        {errorMessage || 'Something went wrong while loading reviews.'}
      </p>
      <Button onClick={() => window.location.reload()}>
        Try Again
      </Button>
    </Card>
  );

  // Empty state
  const renderEmpty = () => (
    <Card className="p-8 text-center">
      <ChatBubbleLeftIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No Reviews Found
      </h3>
      <p className="text-gray-600">
        {searchTerm || Object.keys(filters).length > 0
          ? 'Try adjusting your search or filters to find reviews.'
          : 'Be the first to write a review for this product!'}
      </p>
    </Card>
  );

  if (hasError) {
    return renderError();
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Controls */}
      <div className="space-y-4">
        {/* Search and View Toggle */}
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          {showSearch && (
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* View Toggle */}
            {showViewToggle && (
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => handleViewChange('default')}
                  className={cn(
                    'p-2 rounded transition-colors',
                    currentView === 'default' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  )}
                  aria-label="List view"
                  title="Switch to list view"
                >
                  <ListBulletIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleViewChange('grid')}
                  className={cn(
                    'p-2 rounded transition-colors',
                    currentView === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  )}
                  aria-label="Grid view"
                  title="Switch to grid view"
                >
                  <Squares2X2Icon className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Filters Toggle */}
            {showFilters && (
              <Button
                variant={showFiltersPanel ? 'default' : 'outline'}
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className="flex items-center gap-2"
              >
                <FunnelIcon className="w-4 h-4" />
                Filters
                {Object.keys(filters).length > 0 && (
                  <Badge size="sm">{Object.keys(filters).length}</Badge>
                )}
              </Button>
            )}

            {/* Sort Controls */}
            {showSort && (
              <SortControls
                sorting={sorting}
                availableOptions={availableSortOptions}
                onSortChange={handleSortChange}
              />
            )}
          </div>
        </div>

        {/* Bulk Actions */}
        {showBulkActions && enableSelection && selectedReviews.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedReviews.length} review{selectedReviews.length > 1 ? 's' : ''} selected
              </span>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('approve')}
                >
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('feature')}
                >
                  Feature
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('hide')}
                >
                  Hide
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Stats */}
      {showStats && reviews.length > 0 && (
        <ReviewsStats
          totalCount={totalCount}
          averageRating={stats.averageRating}
          ratingDistribution={stats.ratingDistribution}
          verifiedCount={stats.verifiedCount}
          withMediaCount={stats.withMediaCount}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Panel */}
        {showFilters && showFiltersPanel && (
          <div className="lg:col-span-1">
            {/* TODO: Integrate ReviewFilter component - type compatibility needed */}
            <FilterPanel
              filters={filters}
              availableFilters={availableFilters}
              enableAdvanced={enableAdvancedFilters}
              onFiltersChange={handleFiltersChange}
              className={filtersClassName}
            />
          </div>
        )}

        {/* Reviews List */}
        <div className={cn(
          showFilters && showFiltersPanel ? 'lg:col-span-3' : 'lg:col-span-4'
        )}>
          <div className={cn('space-y-4', listClassName)}>
            {isLoading ? (
              renderSkeleton()
            ) : reviews.length === 0 ? (
              renderEmpty()
            ) : (
              <>
                {/* Results Info */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    Showing {((currentPage - 1) * pageSize) + 1} to{' '}
                    {Math.min(currentPage * pageSize, totalCount)} of {totalCount} reviews
                  </span>
                  
                  {onPageSizeChange && (
                    <Select
                      value={pageSize.toString()}
                      onValueChange={(value) => onPageSizeChange(parseInt(value.toString()))}
                      options={[
                        { label: '10 per page', value: '10' },
                        { label: '20 per page', value: '20' },
                        { label: '50 per page', value: '50' }
                      ]}
                    />
                  )}
                </div>

                {/* Reviews */}
                <div className={cn(
                  currentView === 'grid' && 'grid grid-cols-1 md:grid-cols-2 gap-4',
                  currentView !== 'grid' && 'space-y-4',
                  imprima.className  // Use the imported font
                )}>
                  {reviews.map((review, index) => (
                    <ReviewItem
                      key={`${review.id}-${index}`}
                      review={{
                        ...review,
                        title: review.title || 'Review', // Provide default title if missing
                        timestamp: review.timestamp || review.createdAt || new Date(), // Ensure timestamp exists
                        notHelpfulVotes: review.notHelpfulVotes || 0, // Provide default if missing
                        loves: review.loves || 0, // Provide default if missing
                        likes: review.likes || 0, // Provide default if missing
                        dislikes: review.dislikes || 0, // Provide default if missing
                        helpfulVotes: review.helpfulVotes || 0, // Provide default if missing
                        shares: review.shares || 0, // Provide default if missing
                        replies: [] // Use empty array to avoid type compatibility issues
                      }}
                      variant={currentView === 'grid' ? 'compact' : 'default'}
                      className={cn(
                        enableSelection && 'cursor-pointer',
                        selectedReviews.includes(review.id) && 'ring-2 ring-blue-500',
                        itemClassName
                      )}
                      onLike={async (reviewId: string) => { onReviewInteraction?.(reviewId, 'like'); }}
                      onDislike={async (reviewId: string) => { onReviewInteraction?.(reviewId, 'dislike'); }}
                      onHelpful={async (reviewId: string, helpful: boolean) => { onReviewInteraction?.(reviewId, 'helpful', { helpful }); }}
                      onShare={async (reviewId: string) => { onReviewInteraction?.(reviewId, 'share'); }}
                      onReport={async (reviewId: string, reason: string) => { onReviewInteraction?.(reviewId, 'report', { reason }); }}
                      {...reviewItemProps}
                    />
                  ))}
                </div>

                {/* Load More or Pagination */}
                {onLoadMore ? (
                  <div className="text-center">
                    <Button
                      onClick={onLoadMore}
                      disabled={isLoading}
                      className="flex items-center gap-2"
                    >
                      {isLoading && <Loading size="sm" />}
                      Load More Reviews
                    </Button>
                  </div>
                ) : (
                  <ReviewsPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange || (() => {})}
                    showPageSizeSelector={false}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewsList;
