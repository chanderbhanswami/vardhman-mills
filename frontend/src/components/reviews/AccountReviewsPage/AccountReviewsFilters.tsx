import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  X,
  Search,
  Calendar,
  Star,
  Flag,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Save,
  Settings,
  Sliders,
  ChevronDown,
  ChevronUp,
  Tag,
  User,
  Camera,
  Heart,
  MessageSquare,
  TrendingDown,
  BarChart3
} from 'lucide-react';

import {
  Button,
  Card,
  Input,
  Checkbox,
  Badge,
  Modal,
  Tooltip,
  Progress,
  Slider,
  TextArea
} from '@/components/ui';
import { CardHeader, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/components/providers';

// Interfaces
interface FilterValue {
  key: string;
  value: string | number | boolean | string[] | [number, number];
  operator?: 'equals' | 'contains' | 'greater' | 'less' | 'between' | 'in' | 'not_in';
}

interface FilterPreset {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  filters: FilterValue[];
  isDefault?: boolean;
  isCustom?: boolean;
  createdBy?: string;
  createdAt?: string;
  usageCount?: number;
  category: 'status' | 'quality' | 'engagement' | 'content' | 'temporal' | 'custom';
}

interface FilterGroup {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  filters: FilterOption[];
  collapsible: boolean;
  defaultExpanded: boolean;
}

interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'multiSelect' | 'range' | 'date' | 'dateRange' | 'boolean' | 'rating' | 'slider';
  options?: Array<{ value: string | number; label: string; count?: number }>;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  validation?: {
    required?: boolean;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
  dependsOn?: string;
  tooltip?: string;
}

interface FilterState {
  [key: string]: string | number | boolean | string[] | [number, number];
}

interface FilterStats {
  totalFilters: number;
  activeFilters: number;
  resultsCount: number;
  lastApplied?: Date;
  performance: {
    queryTime: number;
    cacheHit: boolean;
  };
}

interface AccountReviewsFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
  onApply: () => void;
  isLoading?: boolean;
  resultsCount?: number;
  showAdvanced?: boolean;
  enablePresets?: boolean;
  enableSave?: boolean;
  customPresets?: FilterPreset[];
  onPresetSave?: (preset: Omit<FilterPreset, 'id' | 'createdAt' | 'usageCount'>) => void;
  onPresetLoad?: (preset: FilterPreset) => void;
  onPresetDelete?: (presetId: string) => void;
}

// Filter Presets Configuration
const DEFAULT_PRESETS: FilterPreset[] = [
  {
    id: 'all-reviews',
    name: 'All Reviews',
    description: 'Show all reviews without any filters',
    icon: BarChart3,
    filters: [],
    isDefault: true,
    category: 'status'
  },
  {
    id: 'pending-approval',
    name: 'Pending Approval',
    description: 'Reviews waiting for moderation approval',
    icon: Clock,
    filters: [
      { key: 'status', value: 'pending', operator: 'equals' }
    ],
    category: 'status'
  },
  {
    id: 'flagged-reviews',
    name: 'Flagged Reviews',
    description: 'Reviews that have been flagged for attention',
    icon: Flag,
    filters: [
      { key: 'status', value: 'flagged', operator: 'equals' }
    ],
    category: 'status'
  },
  {
    id: 'high-rating',
    name: 'High Rating (4-5 Stars)',
    description: 'Reviews with 4 or 5 star ratings',
    icon: Star,
    filters: [
      { key: 'rating', value: [4, 5], operator: 'between' }
    ],
    category: 'quality'
  },
  {
    id: 'low-rating',
    name: 'Low Rating (1-2 Stars)',
    description: 'Reviews with 1 or 2 star ratings',
    icon: TrendingDown,
    filters: [
      { key: 'rating', value: [1, 2], operator: 'between' }
    ],
    category: 'quality'
  },
  {
    id: 'with-media',
    name: 'With Media',
    description: 'Reviews that include photos or videos',
    icon: Camera,
    filters: [
      { key: 'hasMedia', value: true, operator: 'equals' }
    ],
    category: 'content'
  },
  {
    id: 'verified-purchases',
    name: 'Verified Purchases',
    description: 'Reviews from verified purchasers only',
    icon: CheckCircle,
    filters: [
      { key: 'verifiedPurchase', value: true, operator: 'equals' }
    ],
    category: 'quality'
  },
  {
    id: 'recent-reviews',
    name: 'Recent (Last 30 Days)',
    description: 'Reviews from the last 30 days',
    icon: Calendar,
    filters: [
      { key: 'dateRange', value: 'last_30_days', operator: 'equals' }
    ],
    category: 'temporal'
  },
  {
    id: 'popular-reviews',
    name: 'Popular Reviews',
    description: 'Reviews with high engagement (likes, replies)',
    icon: Heart,
    filters: [
      { key: 'helpfulVotes', value: 10, operator: 'greater' }
    ],
    category: 'engagement'
  },
  {
    id: 'detailed-reviews',
    name: 'Detailed Reviews',
    description: 'Reviews with substantial content (200+ characters)',
    icon: MessageSquare,
    filters: [
      { key: 'contentLength', value: 200, operator: 'greater' }
    ],
    category: 'content'
  }
];

// Filter Groups Configuration
const FILTER_GROUPS: FilterGroup[] = [
  {
    id: 'search',
    label: 'Search & Text',
    icon: Search,
    description: 'Search by keywords, content, or author',
    collapsible: false,
    defaultExpanded: true,
    filters: [
      {
        key: 'search',
        label: 'Search Reviews',
        type: 'text',
        placeholder: 'Search by title, content, or author...',
        tooltip: 'Search across review title, content, and author name'
      },
      {
        key: 'authorName',
        label: 'Author Name',
        type: 'text',
        placeholder: 'Filter by author name...',
        tooltip: 'Search for reviews by specific author names'
      }
    ]
  },
  {
    id: 'status',
    label: 'Review Status',
    icon: CheckCircle,
    description: 'Filter by review approval and visibility status',
    collapsible: true,
    defaultExpanded: true,
    filters: [
      {
        key: 'status',
        label: 'Status',
        type: 'multiSelect',
        options: [
          { value: 'published', label: 'Published', count: 1245 },
          { value: 'pending', label: 'Pending', count: 87 },
          { value: 'flagged', label: 'Flagged', count: 23 },
          { value: 'rejected', label: 'Rejected', count: 45 },
          { value: 'hidden', label: 'Hidden', count: 12 }
        ],
        tooltip: 'Filter by review moderation status'
      },
      {
        key: 'visibility',
        label: 'Visibility',
        type: 'select',
        options: [
          { value: 'all', label: 'All Reviews' },
          { value: 'public', label: 'Public Only' },
          { value: 'private', label: 'Private Only' },
          { value: 'featured', label: 'Featured Only' }
        ],
        tooltip: 'Filter by review visibility settings'
      }
    ]
  },
  {
    id: 'rating',
    label: 'Rating & Quality',
    icon: Star,
    description: 'Filter by star ratings and quality metrics',
    collapsible: true,
    defaultExpanded: true,
    filters: [
      {
        key: 'rating',
        label: 'Star Rating',
        type: 'range',
        min: 1,
        max: 5,
        step: 1,
        tooltip: 'Filter by star rating range (1-5 stars)'
      },
      {
        key: 'verifiedPurchase',
        label: 'Verified Purchase Only',
        type: 'boolean',
        tooltip: 'Show only reviews from verified purchasers'
      },
      {
        key: 'hasProsCons',
        label: 'Has Pros/Cons',
        type: 'boolean',
        tooltip: 'Reviews that include pros and cons sections'
      }
    ]
  },
  {
    id: 'content',
    label: 'Content & Media',
    icon: Camera,
    description: 'Filter by content type and media attachments',
    collapsible: true,
    defaultExpanded: false,
    filters: [
      {
        key: 'hasMedia',
        label: 'Has Media',
        type: 'boolean',
        tooltip: 'Reviews that include photos or videos'
      },
      {
        key: 'mediaType',
        label: 'Media Type',
        type: 'multiSelect',
        options: [
          { value: 'image', label: 'Images', count: 234 },
          { value: 'video', label: 'Videos', count: 67 }
        ],
        dependsOn: 'hasMedia',
        tooltip: 'Filter by type of media content'
      },
      {
        key: 'contentLength',
        label: 'Content Length',
        type: 'slider',
        min: 0,
        max: 1000,
        step: 50,
        tooltip: 'Filter by review content length (characters)'
      },
      {
        key: 'hasTitle',
        label: 'Has Custom Title',
        type: 'boolean',
        tooltip: 'Reviews with custom titles (not auto-generated)'
      }
    ]
  },
  {
    id: 'engagement',
    label: 'Engagement & Social',
    icon: Heart,
    description: 'Filter by user engagement and social metrics',
    collapsible: true,
    defaultExpanded: false,
    filters: [
      {
        key: 'helpfulVotes',
        label: 'Helpful Votes',
        type: 'slider',
        min: 0,
        max: 100,
        step: 5,
        tooltip: 'Filter by number of helpful votes received'
      },
      {
        key: 'replyCount',
        label: 'Reply Count',
        type: 'slider',
        min: 0,
        max: 20,
        step: 1,
        tooltip: 'Filter by number of replies to the review'
      },
      {
        key: 'viewCount',
        label: 'View Count',
        type: 'slider',
        min: 0,
        max: 1000,
        step: 50,
        tooltip: 'Filter by number of views the review has received'
      }
    ]
  },
  {
    id: 'temporal',
    label: 'Date & Time',
    icon: Calendar,
    description: 'Filter by creation and modification dates',
    collapsible: true,
    defaultExpanded: false,
    filters: [
      {
        key: 'dateRange',
        label: 'Date Range',
        type: 'select',
        options: [
          { value: 'all', label: 'All Time' },
          { value: 'today', label: 'Today' },
          { value: 'yesterday', label: 'Yesterday' },
          { value: 'last_7_days', label: 'Last 7 Days' },
          { value: 'last_30_days', label: 'Last 30 Days' },
          { value: 'last_90_days', label: 'Last 90 Days' },
          { value: 'this_year', label: 'This Year' },
          { value: 'custom', label: 'Custom Range' }
        ],
        tooltip: 'Filter by review creation date'
      },
      {
        key: 'customDateRange',
        label: 'Custom Date Range',
        type: 'dateRange',
        dependsOn: 'dateRange',
        tooltip: 'Specify custom start and end dates'
      },
      {
        key: 'lastModified',
        label: 'Last Modified',
        type: 'select',
        options: [
          { value: 'any', label: 'Any Time' },
          { value: 'today', label: 'Today' },
          { value: 'last_7_days', label: 'Last 7 Days' },
          { value: 'last_30_days', label: 'Last 30 Days' }
        ],
        tooltip: 'Filter by when the review was last modified'
      }
    ]
  },
  {
    id: 'author',
    label: 'Author Details',
    icon: User,
    description: 'Filter by author characteristics and history',
    collapsible: true,
    defaultExpanded: false,
    filters: [
      {
        key: 'authorType',
        label: 'Author Type',
        type: 'multiSelect',
        options: [
          { value: 'regular', label: 'Regular Customer', count: 890 },
          { value: 'verified', label: 'Verified Buyer', count: 567 },
          { value: 'reviewer', label: 'Top Reviewer', count: 45 },
          { value: 'influencer', label: 'Influencer', count: 12 }
        ],
        tooltip: 'Filter by author type and status'
      },
      {
        key: 'authorLocation',
        label: 'Author Location',
        type: 'text',
        placeholder: 'Filter by location...',
        tooltip: 'Search by author location or region'
      },
      {
        key: 'reviewerLevel',
        label: 'Reviewer Level',
        type: 'range',
        min: 1,
        max: 10,
        step: 1,
        tooltip: 'Filter by author reviewer level (1-10)'
      }
    ]
  },
  {
    id: 'product',
    label: 'Product Context',
    icon: Tag,
    description: 'Filter by product-specific attributes',
    collapsible: true,
    defaultExpanded: false,
    filters: [
      {
        key: 'productCategory',
        label: 'Product Category',
        type: 'multiSelect',
        options: [
          { value: 'electronics', label: 'Electronics', count: 234 },
          { value: 'clothing', label: 'Clothing', count: 456 },
          { value: 'home', label: 'Home & Garden', count: 123 },
          { value: 'books', label: 'Books', count: 78 },
          { value: 'sports', label: 'Sports', count: 91 }
        ],
        tooltip: 'Filter by product category'
      },
      {
        key: 'priceRange',
        label: 'Product Price Range',
        type: 'select',
        options: [
          { value: 'all', label: 'All Prices' },
          { value: 'under_25', label: 'Under $25' },
          { value: '25_50', label: '$25 - $50' },
          { value: '50_100', label: '$50 - $100' },
          { value: '100_250', label: '$100 - $250' },
          { value: 'over_250', label: 'Over $250' }
        ],
        tooltip: 'Filter by product price range'
      },
      {
        key: 'brand',
        label: 'Brand',
        type: 'text',
        placeholder: 'Filter by brand name...',
        tooltip: 'Search by product brand name'
      }
    ]
  }
];

export const AccountReviewsFilters: React.FC<AccountReviewsFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  onApply,
  isLoading = false,
  resultsCount = 0,
  showAdvanced = false,
  enablePresets = true,
  enableSave = true,
  customPresets = [],
  onPresetSave,
  onPresetLoad,
  onPresetDelete
}) => {
  const { user } = useAuth();

  // State
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    FILTER_GROUPS.filter(group => group.defaultExpanded).map(group => group.id)
  );
  const [activePreset, setActivePreset] = useState<string>('all-reviews');
  const [showPresetDialog, setShowPresetDialog] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDescription, setNewPresetDescription] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(showAdvanced);
  const [filterStats, setFilterStats] = useState<FilterStats>({
    totalFilters: FILTER_GROUPS.reduce((acc, group) => acc + group.filters.length, 0),
    activeFilters: 0,
    resultsCount,
    performance: { queryTime: 0, cacheHit: false }
  });
  const [tempFilters, setTempFilters] = useState<FilterState>(filters);

  // All available presets
  const allPresets = useMemo(() => {
    return [...DEFAULT_PRESETS, ...customPresets];
  }, [customPresets]);

  // Grouped presets
  const groupedPresets = useMemo(() => {
    const groups: Record<string, FilterPreset[]> = {};
    allPresets.forEach(preset => {
      if (!groups[preset.category]) {
        groups[preset.category] = [];
      }
      groups[preset.category].push(preset);
    });
    return groups;
  }, [allPresets]);

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(value => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value !== '' && value !== 'all';
      if (typeof value === 'boolean') return value;
      if (typeof value === 'number') return value > 0;
      return false;
    }).length;
  }, [filters]);

  // Update filter stats
  useEffect(() => {
    setFilterStats(prev => ({
      ...prev,
      activeFilters: activeFiltersCount,
      resultsCount,
      lastApplied: activeFiltersCount > 0 ? new Date() : undefined
    }));
  }, [activeFiltersCount, resultsCount]);

  // Handlers
  const handleGroupToggle = useCallback((groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  }, []);

  const handleFilterChange = useCallback((key: string, value: string | number | boolean | string[] | [number, number]) => {
    const newFilters = { ...tempFilters, [key]: value };
    setTempFilters(newFilters);
    
    // Auto-apply for immediate feedback (optional)
    if (typeof value === 'string' && key === 'search') {
      onFiltersChange(newFilters);
    }
  }, [tempFilters, onFiltersChange]);

  const handleApplyFilters = useCallback(() => {
    const startTime = Date.now();
    onFiltersChange(tempFilters);
    onApply();
    
    // Simulate performance tracking
    setTimeout(() => {
      const queryTime = Date.now() - startTime;
      setFilterStats(prev => ({
        ...prev,
        performance: { queryTime, cacheHit: Math.random() > 0.7 }
      }));
    }, 100);
  }, [tempFilters, onFiltersChange, onApply]);

  const handleResetFilters = useCallback(() => {
    setTempFilters({});
    onFiltersChange({});
    onReset();
    setActivePreset('all-reviews');
  }, [onFiltersChange, onReset]);

  const handlePresetLoad = useCallback((preset: FilterPreset) => {
    const presetFilters: FilterState = {};
    preset.filters.forEach(filter => {
      presetFilters[filter.key] = filter.value;
    });
    
    setTempFilters(presetFilters);
    onFiltersChange(presetFilters);
    setActivePreset(preset.id);
    onPresetLoad?.(preset);
  }, [onFiltersChange, onPresetLoad]);

  const handlePresetSave = useCallback(() => {
    if (!newPresetName.trim() || !onPresetSave) return;

    const filterValues: FilterValue[] = Object.entries(tempFilters)
      .filter(([, value]) => value !== '' && value !== 'all' && value !== false)
      .map(([key, value]) => ({
        key,
        value,
        operator: 'equals' // Default operator
      }));

    const newPreset: Omit<FilterPreset, 'id' | 'createdAt' | 'usageCount'> = {
      name: newPresetName,
      description: newPresetDescription || `Custom filter preset with ${filterValues.length} filters`,
      icon: Settings,
      filters: filterValues,
      isCustom: true,
      createdBy: user?.email || 'Unknown',
      category: 'custom'
    };

    onPresetSave(newPreset);
    setShowPresetDialog(false);
    setNewPresetName('');
    setNewPresetDescription('');
  }, [newPresetName, newPresetDescription, tempFilters, onPresetSave, user?.email]);

  const renderFilterInput = useCallback((filter: FilterOption) => {
    const value = tempFilters[filter.key];
    const isDependent = !!(filter.dependsOn && !tempFilters[filter.dependsOn]);

    switch (filter.type) {
      case 'text':
        return (
          <Input
            value={(value as string) || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            placeholder={filter.placeholder}
            disabled={isDependent}
            className="w-full"
          />
        );

      case 'select':
        return (
          <select
            value={(value as string) || filter.options?.[0]?.value || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            disabled={isDependent}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            aria-label={filter.label}
          >
            {filter.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
                {option.count !== undefined && ` (${option.count})`}
              </option>
            ))}
          </select>
        );

      case 'multiSelect':
        const selectedValues = (value as string[]) || [];
        return (
          <div className="space-y-2">
            {filter.options?.map(option => (
              <label key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedValues.includes(option.value as string)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, option.value as string]
                      : selectedValues.filter(v => v !== option.value);
                    handleFilterChange(filter.key, newValues);
                  }}
                  disabled={isDependent}
                />
                <span className="text-sm">
                  {option.label}
                  {option.count !== undefined && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {option.count}
                    </Badge>
                  )}
                </span>
              </label>
            ))}
          </div>
        );

      case 'boolean':
        return (
          <label className="flex items-center space-x-2">
            <Checkbox
              checked={(value as boolean) || false}
              onChange={(e) => handleFilterChange(filter.key, e.target.checked)}
              disabled={isDependent}
            />
            <span className="text-sm">Enable this filter</span>
          </label>
        );

      case 'range':
        const rangeValue = (value as [number, number]) || [filter.min || 0, filter.max || 100];
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {filter.min || 0} - {filter.max || 100}
              </span>
              <span className="text-sm font-medium">
                {rangeValue[0]} - {rangeValue[1]}
              </span>
            </div>
            <Slider
              value={rangeValue}
              onValueChange={(newValue) => handleFilterChange(filter.key, newValue as [number, number])}
              min={filter.min || 0}
              max={filter.max || 100}
              step={filter.step || 1}
              disabled={isDependent}
              className="w-full"
            />
          </div>
        );

      case 'slider':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {filter.min || 0} - {filter.max || 100}
              </span>
              <span className="text-sm font-medium">
                {(value as number) || filter.min || 0}
              </span>
            </div>
            <Slider
              value={[(value as number) || filter.min || 0]}
              onValueChange={(newValue) => handleFilterChange(filter.key, newValue[0])}
              min={filter.min || 0}
              max={filter.max || 100}
              step={filter.step || 1}
              disabled={isDependent}
              className="w-full"
            />
          </div>
        );

      case 'dateRange':
        return (
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={((value as [string, string])?.[0]) || ''}
              onChange={(e) => {
                const currentRange = (value as [string, string]) || ['', ''];
                handleFilterChange(filter.key, [e.target.value, currentRange[1]]);
              }}
              disabled={isDependent}
            />
            <Input
              type="date"
              value={((value as [string, string])?.[1]) || ''}
              onChange={(e) => {
                const currentRange = (value as [string, string]) || ['', ''];
                handleFilterChange(filter.key, [currentRange[0], e.target.value]);
              }}
              disabled={isDependent}
            />
          </div>
        );

      case 'rating':
        return (
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map(rating => (
              <button
                key={rating}
                onClick={() => handleFilterChange(filter.key, rating)}
                disabled={isDependent}
                className={`p-1 ${
                  (value as number) >= rating 
                    ? 'text-yellow-400' 
                    : 'text-gray-300'
                } hover:text-yellow-400 transition-colors`}
                aria-label={`Set rating to ${rating} stars`}
              >
                <Star className="w-5 h-5 fill-current" />
              </button>
            ))}
          </div>
        );

      default:
        return null;
    }
  }, [tempFilters, handleFilterChange]);

  return (
    <div className="space-y-6">
      {/* Filter Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Filter className="w-5 h-5" />
              <div>
                <h3 className="text-lg font-semibold">Review Filters</h3>
                <p className="text-sm text-gray-600">
                  {activeFiltersCount} active filter{activeFiltersCount !== 1 ? 's' : ''} • {resultsCount} results
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {filterStats.performance.queryTime > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {filterStats.performance.queryTime}ms
                  {filterStats.performance.cacheHit && ' (cached)'}
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <Sliders className="w-4 h-4 mr-2" />
                {showAdvancedFilters ? 'Hide' : 'Show'} Advanced
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Quick Actions */}
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Button
              onClick={handleApplyFilters}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Apply Filters
            </Button>
            <Button
              variant="outline"
              onClick={handleResetFilters}
              disabled={activeFiltersCount === 0}
            >
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
            {enableSave && activeFiltersCount > 0 && (
              <Button
                variant="outline"
                onClick={() => setShowPresetDialog(true)}
              >
                <Save className="w-4 h-4 mr-2" />
                Save as Preset
              </Button>
            )}
            <div className="ml-auto">
              <Progress 
                value={isLoading ? 0 : 100} 
                className="w-20 h-2"
              />
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.entries(filters).map(([key, value]) => {
                if (!value || value === '' || value === 'all' || (typeof value === 'boolean' && !value)) return null;
                
                let displayValue = String(value);
                if (Array.isArray(value)) {
                  displayValue = value.join(', ');
                }
                
                return (
                  <Badge key={key} variant="secondary" className="flex items-center gap-1">
                    {key}: {displayValue}
                    <button
                      onClick={() => handleFilterChange(key, '')}
                      className="ml-1 hover:text-red-600"
                      aria-label={`Remove ${key} filter`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filter Presets */}
      {enablePresets && (
        <Card>
          <CardHeader>
            <h4 className="font-medium">Filter Presets</h4>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(groupedPresets).map(([category, presets]) => (
                <div key={category}>
                  <h5 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                    {category} Presets
                  </h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {presets.map(preset => (
                      <motion.div
                        key={preset.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          className={`p-3 cursor-pointer transition-all border-2 ${
                            activePreset === preset.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handlePresetLoad(preset)}
                        >
                          <div className="flex items-center space-x-2">
                            <preset.icon className="w-4 h-4 text-gray-600" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {preset.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {preset.filters.length} filter{preset.filters.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                            {preset.isCustom && onPresetDelete && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onPresetDelete(preset.id);
                                }}
                                className="text-gray-400 hover:text-red-600"
                                aria-label={`Delete preset ${preset.name}`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Groups */}
      <div className="space-y-4">
        {FILTER_GROUPS.map(group => {
          const isExpanded = expandedGroups.includes(group.id);
          const shouldShow = !group.collapsible || isExpanded || showAdvancedFilters;

          return (
            <Card key={group.id}>
              <CardHeader>
                <button
                  onClick={() => group.collapsible && handleGroupToggle(group.id)}
                  className="flex items-center justify-between w-full text-left"
                  disabled={!group.collapsible}
                >
                  <div className="flex items-center space-x-3">
                    <group.icon className="w-5 h-5" />
                    <div>
                      <h4 className="font-medium">{group.label}</h4>
                      <p className="text-sm text-gray-600">{group.description}</p>
                    </div>
                  </div>
                  {group.collapsible && (
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {group.filters.filter(f => tempFilters[f.key]).length}/{group.filters.length}
                      </Badge>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  )}
                </button>
              </CardHeader>

              <AnimatePresence>
                {shouldShow && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {group.filters.map(filter => (
                          <div key={filter.key} className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <label className="text-sm font-medium">
                                {filter.label}
                                {filter.validation?.required && (
                                  <span className="text-red-500 ml-1">*</span>
                                )}
                              </label>
                              {filter.tooltip && (
                                <Tooltip content={filter.tooltip}>
                                  <AlertTriangle className="w-3 h-3 text-gray-400" />
                                </Tooltip>
                              )}
                            </div>
                            {renderFilterInput(filter)}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
      </div>

      {/* Save Preset Dialog */}
      {showPresetDialog && (
        <Modal
          open={showPresetDialog}
          onClose={() => setShowPresetDialog(false)}
          title="Save Filter Preset"
        >
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preset Name *
              </label>
              <Input
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder="Enter preset name..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <TextArea
                value={newPresetDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewPresetDescription(e.target.value)}
                placeholder="Optional description..."
                rows={3}
              />
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Current Filters:</p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(tempFilters).map(([key, value]) => {
                  if (!value || value === '' || value === 'all' || (typeof value === 'boolean' && !value)) return null;
                  return (
                    <Badge key={key} variant="secondary" className="text-xs">
                      {key}
                    </Badge>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setShowPresetDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handlePresetSave}
                disabled={!newPresetName.trim()}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Preset
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
