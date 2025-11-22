'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Clock,
  Gift,
  RefreshCw,
  X,
  Calendar,
  Tag,
  Users,
  Percent,
  AlertCircle
} from 'lucide-react';
import { 
  Card, 
  Badge, 
  Button, 
  Input, 
  Flex,
  Separator,
  Checkbox
} from '@/components/ui';
import { RadioGroup, RadioGroupItem, Label } from '@/components/ui/RadioExtended';
import DropdownMenu, { 
  DropdownTrigger,
  DropdownContent,
  DropdownItem
} from '@/components/ui/DropdownExtended';
import CouponCard from './CouponCard';
import CouponSkeleton from './CouponSkeleton';
import type { Coupon } from '@/hooks/coupons/useCoupons';
import { cn } from '@/lib/utils';

export interface CouponFilters {
  search?: string;
  type?: string[];
  status?: 'all' | 'active' | 'expired' | 'upcoming';
  category?: string[];
  minValue?: number;
  maxValue?: number;
  sortBy?: 'created' | 'expires' | 'value' | 'usage' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface CouponListProps {
  /**
   * Array of coupons to display
   */
  coupons: Coupon[];
  
  /**
   * Loading state
   */
  isLoading?: boolean;
  
  /**
   * Error state
   */
  error?: string | null;
  
  /**
   * Callback when coupon is applied
   */
  onApplyCoupon?: (coupon: Coupon) => void;
  
  /**
   * Callback when coupon details are viewed
   */
  onViewDetails?: (coupon: Coupon) => void;
  
  /**
   * Callback when coupon is copied
   */
  onCopyCoupon?: (coupon: Coupon) => void;
  
  /**
   * Callback when filters change
   */
  onFiltersChange?: (filters: CouponFilters) => void;
  
  /**
   * Callback when refresh is requested
   */
  onRefresh?: () => void;
  
  /**
   * Current cart total for eligibility checks
   */
  cartTotal?: number;
  
  /**
   * Applied coupon codes
   */
  appliedCoupons?: string[];
  
  /**
   * Show search functionality
   */
  showSearch?: boolean;
  
  /**
   * Show filter functionality
   */
  showFilters?: boolean;
  
  /**
   * Show sort functionality
   */
  showSort?: boolean;
  
  /**
   * Show view toggle (grid/list)
   */
  showViewToggle?: boolean;
  
  /**
   * Show statistics
   */
  showStats?: boolean;
  
  /**
   * Default view mode
   */
  defaultView?: 'grid' | 'list';
  
  /**
   * Items per page for pagination
   */
  itemsPerPage?: number;
  
  /**
   * Show pagination
   */
  showPagination?: boolean;
  
  /**
   * Empty state configuration
   */
  emptyState?: {
    title?: string;
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  
  /**
   * Card size
   */
  cardSize?: 'sm' | 'md' | 'lg';
  
  /**
   * Layout density
   */
  density?: 'compact' | 'comfortable' | 'spacious';
  
  /**
   * Animation preset
   */
  animation?: 'stagger' | 'fade' | 'none';
  
  /**
   * Featured coupons (shown first)
   */
  featuredCoupons?: string[];
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Test ID for testing
   */
  testId?: string;
}

const CouponList: React.FC<CouponListProps> = ({
  coupons = [],
  isLoading = false,
  error = null,
  onApplyCoupon,
  onViewDetails,
  onCopyCoupon,
  onFiltersChange,
  onRefresh,
  cartTotal = 0,
  appliedCoupons = [],
  showSearch = true,
  showFilters = true,
  showSort = true,
  showViewToggle = true,
  showStats = true,
  defaultView = 'grid',
  itemsPerPage = 12,
  showPagination = true,
  emptyState,
  cardSize = 'md',
  density = 'comfortable',
  featuredCoupons = [],
  className,
  testId = 'coupon-list'
}) => {
  // State
  const [filters, setFilters] = useState<CouponFilters>({
    search: '',
    type: [],
    status: 'all',
    category: [],
    sortBy: 'created',
    sortOrder: 'desc'
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(defaultView);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  
  // Filter and sort coupons
  const filteredCoupons = useMemo(() => {
    let result = [...coupons];
    
    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(coupon => 
        coupon.code.toLowerCase().includes(searchTerm) ||
        coupon.title.toLowerCase().includes(searchTerm) ||
        coupon.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply type filter
    if (filters.type && filters.type.length > 0) {
      result = result.filter(coupon => filters.type!.includes(coupon.type));
    }
    
    // Apply status filter
    if (filters.status !== 'all') {
      const now = new Date();
      result = result.filter(coupon => {
        const validFrom = new Date(coupon.validFrom);
        const validUntil = new Date(coupon.validUntil);
        
        switch (filters.status) {
          case 'active':
            return now >= validFrom && now <= validUntil && coupon.isActive;
          case 'expired':
            return now > validUntil;
          case 'upcoming':
            return now < validFrom;
          default:
            return true;
        }
      });
    }
    
    // Apply value filters
    if (filters.minValue !== undefined) {
      result = result.filter(coupon => coupon.value >= filters.minValue!);
    }
    if (filters.maxValue !== undefined) {
      result = result.filter(coupon => coupon.value <= filters.maxValue!);
    }
    
    // Sort results
    result.sort((a, b) => {
      let aValue: string | number | Date, bValue: string | number | Date;
      
      switch (filters.sortBy) {
        case 'expires':
          aValue = new Date(a.validUntil);
          bValue = new Date(b.validUntil);
          break;
        case 'value':
          aValue = a.value;
          bValue = b.value;
          break;
        case 'usage':
          aValue = a.usageCount;
          bValue = b.usageCount;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        default: // created
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }
      
      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    // Move featured coupons to the top
    if (featuredCoupons.length > 0) {
      const featured = result.filter(coupon => featuredCoupons.includes(coupon.id));
      const regular = result.filter(coupon => !featuredCoupons.includes(coupon.id));
      result = [...featured, ...regular];
    }
    
    return result;
  }, [coupons, filters, featuredCoupons]);
  
  // Pagination
  const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);
  const paginatedCoupons = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCoupons.slice(start, start + itemsPerPage);
  }, [filteredCoupons, currentPage, itemsPerPage]);
  
  // Statistics
  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: coupons.length,
      active: coupons.filter(c => {
        const validFrom = new Date(c.validFrom);
        const validUntil = new Date(c.validUntil);
        return now >= validFrom && now <= validUntil && c.isActive;
      }).length,
      expired: coupons.filter(c => now > new Date(c.validUntil)).length,
      featured: coupons.filter(c => featuredCoupons.includes(c.id)).length
    };
  }, [coupons, featuredCoupons]);
  
  // Handlers
  const updateFilters = useCallback((newFilters: Partial<CouponFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    setCurrentPage(1); // Reset to first page
    onFiltersChange?.(updatedFilters);
  }, [filters, onFiltersChange]);
  
  const handleSearch = useCallback((search: string) => {
    updateFilters({ search });
  }, [updateFilters]);
  
  const handleSort = useCallback((sortBy: string) => {
    const sortOrder = filters.sortBy === sortBy && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    updateFilters({ sortBy: sortBy as CouponFilters['sortBy'], sortOrder });
  }, [filters.sortBy, filters.sortOrder, updateFilters]);
  
  const clearFilters = useCallback(() => {
    const clearedFilters = {
      search: '',
      type: [],
      status: 'all' as const,
      category: [],
      minValue: undefined,
      maxValue: undefined,
      sortBy: 'created' as const,
      sortOrder: 'desc' as const
    };
    setFilters(clearedFilters);
    setCurrentPage(1);
    onFiltersChange?.(clearedFilters);
  }, [onFiltersChange]);
  
  // Get grid classes based on density
  const getGridClasses = () => {
    const base = 'grid gap-4';
    const cols = {
      sm: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      md: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      lg: 'grid-cols-1 sm:grid-cols-2'
    };
    
    const spacing = {
      compact: 'gap-2',
      comfortable: 'gap-4',
      spacious: 'gap-6'
    };
    
    return cn(base, cols[cardSize], spacing[density]);
  };
  
  return (
    <div className={cn('space-y-4', className)} data-testid={testId}>
      {/* Header with Stats */}
      {showStats && (
        <Card className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Coupons</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
              <div className="text-sm text-gray-600">Expired</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{stats.featured}</div>
              <div className="text-sm text-gray-600">Featured</div>
            </div>
          </div>
        </Card>
      )}
      
      {/* Controls */}
      <Card className="p-4">
        <Flex align="center" justify="between" gap={4} className="flex-wrap">
          {/* Search */}
          {showSearch && (
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search coupons by code, title, or description..."
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}
          
          {/* Controls */}
          <Flex align="center" gap={2}>
            {/* Filter Toggle */}
            {showFilters && (
              <Button
                variant={showFiltersPanel ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              >
                <Filter className="w-4 h-4 mr-1" />
                Filters
                {(filters.type && filters.type.length > 0) || 
                 filters.status !== 'all' || 
                 filters.minValue !== undefined || 
                 filters.maxValue !== undefined ? (
                  <Badge variant="secondary" size="sm" className="ml-1">
                    {[
                      ...(filters.type || []),
                      filters.status !== 'all' ? [filters.status] : [],
                      filters.minValue !== undefined ? ['min'] : [],
                      filters.maxValue !== undefined ? ['max'] : []
                    ].flat().length}
                  </Badge>
                ) : null}
              </Button>
            )}
            
            {/* Sort */}
            {showSort && (
              <DropdownMenu>
                <DropdownTrigger asChild>
                  <Button variant="outline" size="sm">
                    {filters.sortOrder === 'asc' ? <SortAsc className="w-4 h-4 mr-1" /> : <SortDesc className="w-4 h-4 mr-1" />}
                    Sort
                  </Button>
                </DropdownTrigger>
                <DropdownContent>
                  <DropdownItem onClick={() => handleSort('created')}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Date Created
                  </DropdownItem>
                  <DropdownItem onClick={() => handleSort('expires')}>
                    <Clock className="w-4 h-4 mr-2" />
                    Expiry Date
                  </DropdownItem>
                  <DropdownItem onClick={() => handleSort('value')}>
                    <Percent className="w-4 h-4 mr-2" />
                    Discount Value
                  </DropdownItem>
                  <DropdownItem onClick={() => handleSort('usage')}>
                    <Users className="w-4 h-4 mr-2" />
                    Usage Count
                  </DropdownItem>
                  <DropdownItem onClick={() => handleSort('title')}>
                    <Tag className="w-4 h-4 mr-2" />
                    Title
                  </DropdownItem>
                </DropdownContent>
              </DropdownMenu>
            )}
            
            {/* View Toggle */}
            {showViewToggle && (
              <div className="flex border rounded">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            )}
            
            {/* Refresh */}
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
              </Button>
            )}
          </Flex>
        </Flex>
        
        {/* Filters Panel */}
        <AnimatePresence>
          {showFiltersPanel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <Separator className="my-4" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Type Filter */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Type</Label>
                  <div className="space-y-2">
                    {['percentage', 'fixed', 'shipping', 'buy_x_get_y'].map(type => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type}`}
                          checked={filters.type?.includes(type) || false}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const newTypes = checked
                              ? [...(filters.type || []), type]
                              : (filters.type || []).filter(t => t !== type);
                            updateFilters({ type: newTypes });
                          }}
                        />
                        <Label htmlFor={`type-${type}`} className="text-sm capitalize">
                          {type.replace('_', ' ')}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Status Filter */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Status</Label>
                  <RadioGroup
                    value={filters.status}
                    onValueChange={(value: string) => updateFilters({ status: value as CouponFilters['status'] })}
                  >
                    {[
                      { value: 'all', label: 'All' },
                      { value: 'active', label: 'Active' },
                      { value: 'expired', label: 'Expired' },
                      { value: 'upcoming', label: 'Upcoming' }
                    ].map(option => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`status-${option.value}`} />
                        <Label htmlFor={`status-${option.value}`} className="text-sm">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                
                {/* Value Range */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Value Range</Label>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      placeholder="Min value"
                      value={filters.minValue || ''}
                      onChange={(e) => updateFilters({ 
                        minValue: e.target.value ? Number(e.target.value) : undefined 
                      })}
                    />
                    <Input
                      type="number"
                      placeholder="Max value"
                      value={filters.maxValue || ''}
                      onChange={(e) => updateFilters({ 
                        maxValue: e.target.value ? Number(e.target.value) : undefined 
                      })}
                    />
                  </div>
                </div>
                
                {/* Actions */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Actions</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
      
      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {paginatedCoupons.length} of {filteredCoupons.length} coupons
        </span>
        {filteredCoupons.length !== coupons.length && (
          <span>
            (filtered from {coupons.length} total)
          </span>
        )}
      </div>
      
      {/* Content */}
      {error ? (
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Coupons</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          {onRefresh && (
            <Button onClick={onRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
        </Card>
      ) : isLoading ? (
        <div className={getGridClasses()}>
          {Array.from({ length: itemsPerPage }).map((_, index) => (
            <CouponSkeleton key={index} size={cardSize} />
          ))}
        </div>
      ) : filteredCoupons.length === 0 ? (
        <Card className="p-8 text-center">
          <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {emptyState?.title || 'No Coupons Found'}
          </h3>
          <p className="text-gray-600 mb-4">
            {emptyState?.description || 'Try adjusting your filters or search terms.'}
          </p>
          {emptyState?.action && (
            <Button onClick={emptyState.action.onClick}>
              {emptyState.action.label}
            </Button>
          )}
        </Card>
      ) : (
        <motion.div
          className={viewMode === 'grid' ? getGridClasses() : 'space-y-4'}
          initial="initial"
          animate="animate"
        >
          <AnimatePresence mode="popLayout">
            {paginatedCoupons.map((coupon) => (
              <motion.div
                key={coupon.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                layout
                className={viewMode === 'list' ? 'w-full' : ''}
              >
                <CouponCard
                  coupon={coupon}
                  onApply={onApplyCoupon}
                  onViewDetails={onViewDetails}
                  onCopy={onCopyCoupon}
                  cartTotal={cartTotal}
                  appliedCoupons={appliedCoupons}
                  size={cardSize}
                  featured={featuredCoupons.includes(coupon.id)}
                  layout={viewMode === 'list' ? 'compact' : 'card'}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
      
      {/* Pagination */}
      {showPagination && totalPages > 1 && !isLoading && (
        <Card className="p-4">
          <Flex align="center" justify="center" gap={2}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                const offset = Math.max(0, currentPage - 3);
                const actualPage = page + offset;
                
                if (actualPage > totalPages) return null;
                
                return (
                  <Button
                    key={actualPage}
                    variant={currentPage === actualPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(actualPage)}
                  >
                    {actualPage}
                  </Button>
                );
              })}
              
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="px-2">...</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </Flex>
          
          <div className="text-center text-sm text-gray-600 mt-2">
            Page {currentPage} of {totalPages}
          </div>
        </Card>
      )}
    </div>
  );
};

export default CouponList;
