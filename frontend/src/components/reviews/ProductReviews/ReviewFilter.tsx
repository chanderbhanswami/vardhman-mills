'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  XMarkIcon,
  FunnelIcon,
  StarIcon,
  CalendarDaysIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  UserIcon,
  PhotoIcon,
  ChatBubbleLeftIcon,
  ShieldCheckIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { 
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Separator } from '@/components/ui/Separator';
import { Checkbox } from '@/components/ui/Checkbox';
import { Label } from '@/components/ui';
import { Slider } from '@/components/ui/Slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import { Calendar } from '@/components/ui/Calendar';
import { Switch } from '@/components/ui/Switch';

import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Types
export interface ReviewFilterCriteria {
  // Rating filters
  minRating?: number;
  maxRating?: number;
  specificRatings?: number[];
  
  // Date filters
  dateRange?: {
    from: Date;
    to: Date;
  };
  timeframe?: 'all' | 'last_week' | 'last_month' | 'last_3_months' | 'last_6_months' | 'last_year';
  
  // Content filters
  searchQuery?: string;
  hasPhotos?: boolean;
  hasVideos?: boolean;
  hasText?: boolean;
  minLength?: number;
  maxLength?: number;
  language?: string;
  
  // Author filters
  verifiedPurchase?: boolean;
  verifiedReviewer?: boolean;
  authorLocation?: string;
  minReviewCount?: number;
  authorTrustScore?: number;
  
  // Interaction filters
  minHelpfulVotes?: number;
  minComments?: number;
  sortBy?: 'newest' | 'oldest' | 'highest_rated' | 'lowest_rated' | 'most_helpful' | 'most_recent' | 'trending';
  
  // Status filters
  isPinned?: boolean;
  isFeatured?: boolean;
  isPromoted?: boolean;
  moderationStatus?: 'approved' | 'pending' | 'flagged' | 'hidden';
  
  // Advanced filters
  sentiment?: 'positive' | 'negative' | 'neutral';
  reviewType?: 'review' | 'question' | 'answer' | 'experience';
  deviceType?: 'mobile' | 'desktop' | 'tablet';
  purchaseType?: 'verified' | 'unverified' | 'gift' | 'sample';
}

export interface ReviewFilterOptions {
  availableLanguages?: string[];
  availableLocations?: string[];
  maxRating?: number;
  showAdvancedFilters?: boolean;
  showDateRange?: boolean;
  showTextFilters?: boolean;
  showAuthorFilters?: boolean;
  showInteractionFilters?: boolean;
  showStatusFilters?: boolean;
  showSentimentFilters?: boolean;
  customFilters?: Array<{
    id: string;
    label: string;
    type: 'select' | 'checkbox' | 'range' | 'text';
    options?: string[];
    range?: [number, number];
  }>;
}

export interface ReviewFilterProps {
  // Data
  criteria: ReviewFilterCriteria;
  options?: ReviewFilterOptions;
  totalReviews?: number;
  filteredCount?: number;
  
  // Configuration
  variant?: 'default' | 'compact' | 'advanced' | 'minimal';
  layout?: 'horizontal' | 'vertical' | 'sidebar' | 'modal';
  collapsible?: boolean;
  defaultExpanded?: boolean;
  showResetButton?: boolean;
  showApplyButton?: boolean;
  showFilterCount?: boolean;
  showPresets?: boolean;
  
  // Styling
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  
  // Event handlers
  onChange: (criteria: ReviewFilterCriteria) => void;
  onReset?: () => void;
  onApply?: (criteria: ReviewFilterCriteria) => void;
  onPresetSelect?: (preset: string) => void;
  onSave?: (name: string, criteria: ReviewFilterCriteria) => void;
  onExport?: (criteria: ReviewFilterCriteria) => void;
  
  // Analytics
  onAnalyticsEvent?: (event: string, data: Record<string, unknown>) => void;
}

// Rating filter component
const RatingFilter: React.FC<{
  value: number[];
  onChange: (ratings: number[]) => void;
  maxRating?: number;
  className?: string;
}> = ({ value, onChange, maxRating = 5, className }) => {
  const handleRatingToggle = useCallback((rating: number) => {
    if (value.includes(rating)) {
      onChange(value.filter(r => r !== rating));
    } else {
      onChange([...value, rating]);
    }
  }, [value, onChange]);

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 flex-wrap">
        {Array.from({ length: maxRating }, (_, i) => {
          const rating = maxRating - i;
          const isSelected = value.includes(rating);
          
          return (
            <Button
              key={rating}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'flex items-center gap-1',
                isSelected && 'bg-yellow-500 text-white hover:bg-yellow-600'
              )}
              onClick={() => handleRatingToggle(rating)}
            >
              {Array.from({ length: rating }, (_, i) => (
                <StarIconSolid key={i} className="w-3 h-3" />
              ))}
              {Array.from({ length: maxRating - rating }, (_, i) => (
                <StarIcon key={i} className="w-3 h-3" />
              ))}
              <span className="text-xs ml-1">{rating}+</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

// Date range picker component
const DateRangeFilter: React.FC<{
  value: { from: Date; to: Date } | undefined;
  onChange: (range: { from: Date; to: Date } | undefined) => void;
  timeframe: string;
  onTimeframeChange: (timeframe: string) => void;
  className?: string;
}> = ({ value, onChange, timeframe, onTimeframeChange, className }) => {
  const [isOpen, setIsOpen] = useState(false);

  const timeframeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'last_week', label: 'Last Week' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'last_3_months', label: 'Last 3 Months' },
    { value: 'last_6_months', label: 'Last 6 Months' },
    { value: 'last_year', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const getDateRangeFromTimeframe = useCallback((tf: string) => {
    const now = new Date();
    switch (tf) {
      case 'last_week':
        return { from: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), to: now };
      case 'last_month':
        return { from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), to: now };
      case 'last_3_months':
        return { from: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), to: now };
      case 'last_6_months':
        return { from: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000), to: now };
      case 'last_year':
        return { from: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000), to: now };
      default:
        return undefined;
    }
  }, []);

  const handleTimeframeChange = useCallback((newTimeframe: string) => {
    onTimeframeChange(newTimeframe);
    if (newTimeframe !== 'custom' && newTimeframe !== 'all') {
      const range = getDateRangeFromTimeframe(newTimeframe);
      onChange(range);
    } else if (newTimeframe === 'all') {
      onChange(undefined);
    }
  }, [onTimeframeChange, onChange, getDateRangeFromTimeframe]);

  return (
    <div className={cn('space-y-3', className)}>
      <Select 
        value={timeframe} 
        onValueChange={(value) => handleTimeframeChange(String(value))}
        options={timeframeOptions.map(opt => ({
          label: opt.label,
          value: opt.value
        }))}
        placeholder="Select time period"
      />

      {timeframe === 'custom' && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !value && 'text-muted-foreground'
              )}
            >
              <CalendarDaysIcon className="mr-2 h-4 w-4" />
              {value?.from ? (
                value.to ? (
                  <>
                    {format(value.from, 'LLL dd, y')} - {format(value.to, 'LLL dd, y')}
                  </>
                ) : (
                  format(value.from, 'LLL dd, y')
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="grid grid-cols-2 gap-2">
              <Calendar
                value={value?.from}
                onChange={(date) => onChange(value ? { ...value, from: date } : { from: date, to: new Date() })}
              />
              <Calendar
                value={value?.to}
                onChange={(date) => onChange(value ? { ...value, to: date } : { from: new Date(), to: date })}
              />
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

// Main ReviewFilter component
const ReviewFilter: React.FC<ReviewFilterProps> = ({
  criteria,
  options = {},
  totalReviews = 0,
  filteredCount = 0,
  variant = 'default',
  layout = 'vertical',
  collapsible = true,
  defaultExpanded = true,
  showResetButton = true,
  showApplyButton = false,
  showFilterCount = true,
  showPresets = false,
  className,
  headerClassName,
  contentClassName,
  footerClassName,
  onChange,
  onReset,
  onApply,
  onPresetSelect,
  onSave,
  onExport,
  onAnalyticsEvent
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState(criteria.searchQuery || '');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Calculate active filters
  const calculateActiveFilters = useCallback(() => {
    const filters: string[] = [];
    
    if (criteria.specificRatings?.length) {
      filters.push(`Rating: ${criteria.specificRatings.join(', ')} stars`);
    }
    if (criteria.dateRange) {
      filters.push(`Date: ${format(criteria.dateRange.from, 'MMM d')} - ${format(criteria.dateRange.to, 'MMM d')}`);
    }
    if (criteria.timeframe && criteria.timeframe !== 'all') {
      filters.push(`Period: ${criteria.timeframe.replace('_', ' ')}`);
    }
    if (criteria.searchQuery) {
      filters.push(`Search: "${criteria.searchQuery}"`);
    }
    if (criteria.hasPhotos) {
      filters.push('Has Photos');
    }
    if (criteria.hasVideos) {
      filters.push('Has Videos');
    }
    if (criteria.verifiedPurchase) {
      filters.push('Verified Purchase');
    }
    if (criteria.verifiedReviewer) {
      filters.push('Verified Reviewer');
    }
    if (criteria.sortBy && criteria.sortBy !== 'newest') {
      filters.push(`Sort: ${criteria.sortBy.replace('_', ' ')}`);
    }
    if (criteria.language) {
      filters.push(`Language: ${criteria.language}`);
    }
    if (criteria.sentiment) {
      filters.push(`Sentiment: ${criteria.sentiment}`);
    }
    if (criteria.isPinned) {
      filters.push('Pinned');
    }
    if (criteria.isFeatured) {
      filters.push('Featured');
    }

    return filters;
  }, [criteria]);

  useEffect(() => {
    setActiveFilters(calculateActiveFilters());
  }, [calculateActiveFilters]);

  // Handle filter changes
  const handleChange = useCallback((updates: Partial<ReviewFilterCriteria>) => {
    const newCriteria = { ...criteria, ...updates };
    onChange(newCriteria);
    onAnalyticsEvent?.('review_filter_change', { 
      filter: Object.keys(updates)[0],
      value: Object.values(updates)[0]
    });
  }, [criteria, onChange, onAnalyticsEvent]);

  // Handle search
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    const timeoutId = setTimeout(() => {
      handleChange({ searchQuery: value || undefined });
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [handleChange]);

  // Handle reset
  const handleReset = useCallback(() => {
    const emptyCriteria: ReviewFilterCriteria = {};
    onChange(emptyCriteria);
    setSearchQuery('');
    onReset?.();
    onAnalyticsEvent?.('review_filter_reset', {});
  }, [onChange, onReset, onAnalyticsEvent]);

  // Preset configurations
  const presets = useMemo(() => [
    {
      id: 'high_rated',
      label: 'High Rated',
      criteria: { specificRatings: [4, 5] }
    },
    {
      id: 'recent',
      label: 'Recent',
      criteria: { timeframe: 'last_month' as const, sortBy: 'newest' as const }
    },
    {
      id: 'verified',
      label: 'Verified Only',
      criteria: { verifiedPurchase: true }
    },
    {
      id: 'with_media',
      label: 'With Photos/Videos',
      criteria: { hasPhotos: true, hasVideos: true }
    },
    {
      id: 'helpful',
      label: 'Most Helpful',
      criteria: { minHelpfulVotes: 5, sortBy: 'most_helpful' as const }
    }
  ], []);

  // Filter sections
  const renderBasicFilters = () => (
    <div className="space-y-4">
      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search" className="text-sm font-medium">Search Reviews</Label>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="search"
            type="text"
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Rating Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Rating</Label>
        <RatingFilter
          value={criteria.specificRatings || []}
          onChange={(ratings) => handleChange({ specificRatings: ratings.length ? ratings : undefined })}
          maxRating={options.maxRating || 5}
        />
      </div>

      {/* Date Range */}
      {options.showDateRange !== false && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Date Range</Label>
          <DateRangeFilter
            value={criteria.dateRange}
            onChange={(range) => handleChange({ dateRange: range })}
            timeframe={criteria.timeframe || 'all'}
            onTimeframeChange={(timeframe) => handleChange({ 
              timeframe: timeframe as ReviewFilterCriteria['timeframe']
            })}
          />
        </div>
      )}

      {/* Sort By */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Sort By</Label>
        <Select 
          value={criteria.sortBy || 'newest'} 
          onValueChange={(value) => handleChange({ 
            sortBy: String(value) as ReviewFilterCriteria['sortBy']
          })}
          options={[
            { label: 'Newest First', value: 'newest' },
            { label: 'Oldest First', value: 'oldest' },
            { label: 'Highest Rated', value: 'highest_rated' },
            { label: 'Lowest Rated', value: 'lowest_rated' },
            { label: 'Most Helpful', value: 'most_helpful' },
            { label: 'Trending', value: 'trending' }
          ]}
        />
      </div>

      {/* Quick Filters */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Quick Filters</Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="verified-purchase"
              checked={criteria.verifiedPurchase || false}
              onChange={(e) => 
                handleChange({ verifiedPurchase: e.target.checked ? true : undefined })
              }
            />
            <Label htmlFor="verified-purchase" className="text-sm">
              <ShieldCheckIcon className="w-4 h-4 mr-1 inline" />
              Verified Purchase
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="has-photos"
              checked={criteria.hasPhotos || false}
              onChange={(e) => 
                handleChange({ hasPhotos: e.target.checked ? true : undefined })
              }
            />
            <Label htmlFor="has-photos" className="text-sm">
              <PhotoIcon className="w-4 h-4 mr-1 inline" />
              Has Photos
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="has-videos"
              checked={criteria.hasVideos || false}
              onChange={(e) => 
                handleChange({ hasVideos: e.target.checked ? true : undefined })
              }
            />
            <Label htmlFor="has-videos" className="text-sm">
              Has Videos
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="verified-reviewer"
              checked={criteria.verifiedReviewer || false}
              onChange={(e) => 
                handleChange({ verifiedReviewer: e.target.checked ? true : undefined })
              }
            />
            <Label htmlFor="verified-reviewer" className="text-sm">
              <UserIcon className="w-4 h-4 mr-1 inline" />
              Verified Reviewer
            </Label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdvancedFilters = () => (
    <div className="space-y-4 pt-4 border-t">
      {/* Advanced Content Filters with Sliders */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center">
          <ChartBarIcon className="w-4 h-4 mr-1" />
          Content Quality Score
        </Label>
        <Slider
          value={[criteria.minHelpfulVotes || 0]}
          onValueChange={([value]) => handleChange({ minHelpfulVotes: value })}
          max={100}
          step={1}
          className="w-full"
        />
        <div className="text-xs text-gray-500">
          Minimum helpful votes: {criteria.minHelpfulVotes || 0}
        </div>
      </div>

      {/* Content Type Filters */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Content Features</Label>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-with-comments" className="text-sm flex items-center">
              <ChatBubbleLeftIcon className="w-4 h-4 mr-1" />
              Show reviews with comments
            </Label>
            <Switch
              id="show-with-comments"
              checked={!!criteria.minComments}
              onCheckedChange={(checked) => 
                handleChange({ minComments: checked ? 1 : undefined })
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="time-filter" className="text-sm flex items-center">
              <ClockIcon className="w-4 h-4 mr-1" />
              Recent activity only
            </Label>
            <Switch
              id="time-filter"
              checked={criteria.timeframe === 'last_month'}
              onCheckedChange={(checked) => 
                handleChange({ timeframe: checked ? 'last_month' : 'all' })
              }
            />
          </div>
        </div>
      </div>

      {/* Content Filters */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Content Filters</Label>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="min-length" className="text-sm">Min Length (chars)</Label>
            <Input
              id="min-length"
              type="number"
              min="0"
              value={criteria.minLength || ''}
              onChange={(e) => handleChange({ 
                minLength: e.target.value ? parseInt(e.target.value) : undefined 
              })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="max-length" className="text-sm">Max Length (chars)</Label>
            <Input
              id="max-length"
              type="number"
              min="0"
              value={criteria.maxLength || ''}
              onChange={(e) => handleChange({ 
                maxLength: e.target.value ? parseInt(e.target.value) : undefined 
              })}
            />
          </div>
        </div>

        {options.availableLanguages && (
          <div className="space-y-2">
            <Label className="text-sm">Language</Label>
            <Select 
              value={criteria.language || ''} 
              onValueChange={(value) => handleChange({ language: String(value) || undefined })}
              options={[
                { label: 'Any Language', value: '' },
                ...(options.availableLanguages?.map(lang => ({
                  label: lang,
                  value: lang
                })) || [])
              ]}
              placeholder="Any Language"
            />
          </div>
        )}
      </div>

      {/* Interaction Filters */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Interaction Filters</Label>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="min-helpful" className="text-sm">Min Helpful Votes</Label>
            <Input
              id="min-helpful"
              type="number"
              min="0"
              value={criteria.minHelpfulVotes || ''}
              onChange={(e) => handleChange({ 
                minHelpfulVotes: e.target.value ? parseInt(e.target.value) : undefined 
              })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="min-comments" className="text-sm">Min Comments</Label>
            <Input
              id="min-comments"
              type="number"
              min="0"
              value={criteria.minComments || ''}
              onChange={(e) => handleChange({ 
                minComments: e.target.value ? parseInt(e.target.value) : undefined 
              })}
            />
          </div>
        </div>
      </div>

      {/* Sentiment Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Sentiment</Label>
        <Select 
          value={criteria.sentiment || ''} 
          onValueChange={(value) => handleChange({ 
            sentiment: String(value) as ReviewFilterCriteria['sentiment'] || undefined 
          })}
          options={[
            { label: 'Any Sentiment', value: '' },
            { label: 'Positive', value: 'positive' },
            { label: 'Neutral', value: 'neutral' },
            { label: 'Negative', value: 'negative' }
          ]}
          placeholder="Any Sentiment"
        />
      </div>

      {/* Status Filters */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Status</Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="pinned"
              checked={criteria.isPinned || false}
              onChange={(e) => 
                handleChange({ isPinned: e.target.checked ? true : undefined })
              }
            />
            <Label htmlFor="pinned" className="text-sm">Pinned</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={criteria.isFeatured || false}
              onChange={(e) => 
                handleChange({ isFeatured: e.target.checked ? true : undefined })
              }
            />
            <Label htmlFor="featured" className="text-sm">Featured</Label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPresets = () => (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Quick Presets</Label>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <Button
            key={preset.id}
            variant="outline"
            size="sm"
            onClick={() => {
              onChange(preset.criteria);
              onPresetSelect?.(preset.id);
              onAnalyticsEvent?.('review_filter_preset', { preset: preset.id });
            }}
            className="text-xs"
          >
            {preset.label}
          </Button>
        ))}
      </div>
    </div>
  );

  const filterCount = activeFilters.length;
  const hasActiveFilters = filterCount > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'w-full',
        variant === 'compact' && 'max-w-md',
        variant === 'advanced' && 'max-w-4xl',
        variant === 'minimal' && 'max-w-sm',
        layout === 'horizontal' && 'flex-row',
        layout === 'sidebar' && 'fixed left-0 top-0 h-full w-80 z-50',
        className
      )}
    >
      <Card className="overflow-hidden">
        {/* Header */}
        <div className={cn(
          'p-4 bg-gray-50 border-b flex items-center justify-between',
          headerClassName
        )}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Filters</h3>
              {showFilterCount && hasActiveFilters && (
                <Badge variant="secondary" className="text-xs">
                  {filterCount}
                </Badge>
              )}
            </div>
            
            {showFilterCount && (
              <div className="text-sm text-gray-600">
                {filteredCount.toLocaleString()} of {totalReviews.toLocaleString()} reviews
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && showResetButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-gray-600 hover:text-gray-900"
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                Reset
              </Button>
            )}
            
            {collapsible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-600 hover:text-gray-900"
              >
                <ChevronDownIcon 
                  className={cn(
                    'h-4 w-4 transition-transform',
                    isExpanded && 'rotate-180'
                  )} 
                />
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters Tags */}
        <AnimatePresence>
          {isExpanded && hasActiveFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-4 bg-blue-50 border-b"
            >
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs bg-blue-100 text-blue-800"
                  >
                    {filter}
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={cn('p-4', contentClassName)}
            >
              {/* Presets */}
              {showPresets && renderPresets()}
              {showPresets && <Separator className="my-4" />}

              {/* Basic Filters */}
              {renderBasicFilters()}

              {/* Advanced Filters Toggle */}
              {options.showAdvancedFilters !== false && (
                <>
                  <div className="pt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                      <AdjustmentsHorizontalIcon className="h-4 w-4" />
                      {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
                      <ChevronDownIcon 
                        className={cn(
                          'h-4 w-4 transition-transform',
                          showAdvanced && 'rotate-180'
                        )} 
                      />
                    </Button>
                  </div>

                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        {renderAdvancedFilters()}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        {isExpanded && showApplyButton && (
          <div className={cn(
            'p-4 bg-gray-50 border-t flex items-center justify-between',
            footerClassName
          )}>
            <div className="text-sm text-gray-600">
              {filteredCount.toLocaleString()} results
            </div>
            
            <div className="flex items-center gap-2">
              {onSave && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSave('My Filter', criteria)}
                >
                  Save Filter
                </Button>
              )}
              
              {onExport && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExport(criteria)}
                  className="flex items-center gap-1"
                >
                  <CheckIcon className="w-4 h-4" />
                  Export
                </Button>
              )}
              
              <Button
                onClick={() => onApply?.(criteria)}
                size="sm"
                disabled={!hasActiveFilters}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default ReviewFilter;
