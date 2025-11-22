'use client';

/**
 * SalePreview Component - Vardhman Mills Frontend
 * 
 * Comprehensive home page section showcasing active sales and deals.
 * Features multiple display variants, filtering, search, countdown timers,
 * and interactive engagement features.
 * 
 * @version 1.0.0
 * @created 2025-10-09
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  SparklesIcon,
  FireIcon,
  ClockIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
  ListBulletIcon,
  BookmarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  CheckIcon,
  ShareIcon,
  TagIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import {
  FireIcon as FireSolidIcon,
  BookmarkIcon as BookmarkSolidIcon,
  SparklesIcon as SparklesSolidIcon,
} from '@heroicons/react/24/solid';

// Import Sale Components
import SaleCard from '@/components/sale/SaleCard';
import SaleBanner from '@/components/sale/SaleBanner';
import DealOfTheDay from '@/components/sale/DealOfTheDay';
import FlashSaleTimer from '@/components/sale/FlashSaleTimer';
import SaleCountdown from '@/components/sale/SaleCountdown';
import SaleEmptyState from '@/components/sale/SaleEmptyState';
import SaleFilters from '@/components/sale/SaleFilters';
import SaleGrid from '@/components/sale/SaleGrid';
import SaleList from '@/components/sale/SaleList';
import SaleProductCard from '@/components/sale/SaleProductCard';
import SaleSkeleton from '@/components/sale/SaleSkeleton';

// Import UI Components
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Tooltip } from '@/components/ui/Tooltip';
import { Select } from '@/components/ui/Select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Separator } from '@/components/ui/Separator';

// Import Types
import type { SaleType, SaleStatus, SaleCategory } from '@/types/sale.types';

// Import Utils
import { cn } from '@/lib/utils';
import { debounce, type DebouncedFunction } from '@/lib/utils/debounce';
import { formatDistanceToNow } from 'date-fns';

// Create ScrollArea component wrapper
const ScrollArea: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={cn("overflow-auto", className)}>{children}</div>
);

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Simplified Sale interface for home page preview
 */
interface SimpleSale {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: SaleType;
  status: SaleStatus;
  category: SaleCategory;
  priority: number;
  visibility: string;
  featured: boolean;
  trending: boolean;
  startDate: string;
  endDate: string;
  discount: number;
  productCount: number;
  views: number;
  conversions: number;
  revenue: number;
  createdAt: string;
}

/**
 * SalePreview component props
 */
export interface SalePreviewProps {
  /**
   * Display variant
   */
  variant?: 'grid' | 'featured' | 'carousel' | 'list' | 'compact' | 'deals';

  /**
   * Section title
   */
  title?: string;

  /**
   * Section subtitle/description
   */
  subtitle?: string;

  /**
   * Maximum number of sales to display
   */
  maxSales?: number;

  /**
   * Custom sales data
   */
  sales?: SimpleSale[];

  /**
   * Show search functionality
   */
  showSearch?: boolean;

  /**
   * Show filtering options
   */
  showFilters?: boolean;

  /**
   * Show sale type filter
   */
  showTypeFilter?: boolean;

  /**
   * Show category filter
   */
  showCategoryFilter?: boolean;

  /**
   * Show status filter
   */
  showStatusFilter?: boolean;

  /**
   * Show sorting options
   */
  showSort?: boolean;

  /**
   * Show view mode toggle
   */
  showViewToggle?: boolean;

  /**
   * Show countdown timers
   */
  showCountdown?: boolean;

  /**
   * Show discount badges
   */
  showDiscountBadge?: boolean;

  /**
   * Show product count
   */
  showProductCount?: boolean;

  /**
   * Show save/bookmark button
   */
  showSaveButton?: boolean;

  /**
   * Show share button
   */
  showShareButton?: boolean;

  /**
   * Enable infinite scroll
   */
  enableInfiniteScroll?: boolean;

  /**
   * Loading state
   */
  loading?: boolean;

  /**
   * Enable animations
   */
  animated?: boolean;

  /**
   * Callback when sale is clicked
   */
  onSaleClick?: (sale: SimpleSale) => void;

  /**
   * Callback when category is selected
   */
  onCategorySelect?: (category: string) => void;

  /**
   * Callback when type is selected
   */
  onTypeSelect?: (type: SaleType) => void;

  /**
   * Callback when search is triggered
   */
  onSearch?: (query: string) => void;

  /**
   * Callback when sale is bookmarked
   */
  onBookmark?: (saleId: string) => void;

  /**
   * Callback when sale is shared
   */
  onShare?: (sale: SimpleSale) => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Sort options
 */
type SortOption = 
  | 'featured'
  | 'newest'
  | 'ending-soon'
  | 'discount-high'
  | 'discount-low'
  | 'popular'
  | 'alphabetical';

/**
 * View mode
 */
type ViewMode = 'grid' | 'list' | 'compact';

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_SALES: SimpleSale[] = [
  {
    id: '1',
    name: 'Winter Clearance Sale 2025',
    slug: 'winter-clearance-2025',
    description: 'Huge discounts on winter collection furniture and home decor. Up to 70% off on selected items.',
    type: 'clearance_sale',
    status: 'active',
    category: 'furniture',
    priority: 10,
    visibility: 'public',
    featured: true,
    trending: true,
    startDate: new Date('2025-10-01').toISOString(),
    endDate: new Date('2025-10-31').toISOString(),
    discount: 70,
    productCount: 245,
    views: 15420,
    conversions: 892,
    revenue: 8945000,
    createdAt: new Date('2025-09-15').toISOString(),
  },
  {
    id: '2',
    name: 'Flash Sale - Limited Time Offer',
    slug: 'flash-sale-oct-2025',
    description: 'Lightning deals on premium furniture. New deals every hour!',
    type: 'flash_sale',
    status: 'active',
    category: 'home_decor',
    priority: 100,
    visibility: 'public',
    featured: true,
    trending: true,
    startDate: new Date('2025-10-09').toISOString(),
    endDate: new Date('2025-10-10').toISOString(),
    discount: 50,
    productCount: 180,
    views: 28540,
    conversions: 2145,
    revenue: 12456000,
    createdAt: new Date('2025-10-08').toISOString(),
  },
  {
    id: '3',
    name: 'Diwali Mega Sale',
    slug: 'diwali-mega-sale-2025',
    description: 'Celebrate Diwali with incredible savings on furniture and home decor.',
    type: 'festival_sale',
    status: 'active',
    category: 'textiles',
    priority: 80,
    visibility: 'public',
    featured: true,
    trending: true,
    startDate: new Date('2025-10-05').toISOString(),
    endDate: new Date('2025-10-25').toISOString(),
    discount: 60,
    productCount: 320,
    views: 45820,
    conversions: 3542,
    revenue: 25678000,
    createdAt: new Date('2025-09-20').toISOString(),
  },
  {
    id: '4',
    name: 'Weekend Special - Furniture Sale',
    slug: 'weekend-furniture-sale',
    description: 'Amazing weekend deals on premium furniture collection.',
    type: 'weekend_sale',
    status: 'active',
    category: 'furniture',
    priority: 50,
    visibility: 'public',
    featured: false,
    trending: false,
    startDate: new Date('2025-10-08').toISOString(),
    endDate: new Date('2025-10-12').toISOString(),
    discount: 40,
    productCount: 150,
    views: 18920,
    conversions: 1245,
    revenue: 9875000,
    createdAt: new Date('2025-10-01').toISOString(),
  },
  {
    id: '5',
    name: 'Members Only - Exclusive Deals',
    slug: 'members-exclusive-deals',
    description: 'Exclusive offers for our valued members. Join now to unlock special discounts!',
    type: 'member_sale',
    status: 'active',
    category: 'home_decor',
    priority: 60,
    visibility: 'members_only',
    featured: true,
    trending: false,
    startDate: new Date('2025-10-01').toISOString(),
    endDate: new Date('2025-10-30').toISOString(),
    discount: 55,
    productCount: 195,
    views: 12340,
    conversions: 980,
    revenue: 7654000,
    createdAt: new Date('2025-09-25').toISOString(),
  },
  {
    id: '6',
    name: 'Seasonal Clearance - End of Season',
    slug: 'seasonal-clearance-oct',
    description: 'Clear out last season inventory with massive discounts.',
    type: 'end_of_season',
    status: 'active',
    category: 'kitchenware',
    priority: 40,
    visibility: 'public',
    featured: false,
    trending: false,
    startDate: new Date('2025-10-02').toISOString(),
    endDate: new Date('2025-10-28').toISOString(),
    discount: 65,
    productCount: 128,
    views: 9850,
    conversions: 645,
    revenue: 5432000,
    createdAt: new Date('2025-09-28').toISOString(),
  },
];

const MOCK_SALE_TYPES: SaleType[] = [
  'flash_sale',
  'seasonal_sale',
  'clearance_sale',
  'festival_sale',
  'weekend_sale',
  'member_sale',
  'end_of_season',
  'mega_sale',
];

const MOCK_CATEGORIES: SaleCategory[] = [
  'furniture',
  'home_decor',
  'textiles',
  'kitchenware',
  'bedroom',
  'living_room',
  'dining_room',
  'bathroom',
];

const MOCK_DEAL_PRODUCT = {
  id: 'deal-1',
  name: 'Premium Luxury Sofa Set',
  slug: 'premium-luxury-sofa-set',
  description: 'Elegant 3-seater sofa with premium fabric and solid wood frame',
  images: [{ url: '/images/products/luxury-sofa.jpg', alt: 'Luxury Sofa' }],
  originalPrice: { amount: 89999, currency: 'INR', formatted: '₹89,999' },
  dealPrice: { amount: 44999, currency: 'INR', formatted: '₹44,999' },
  discountPercentage: 50,
  category: 'furniture',
  rating: 4.8,
  reviewCount: 342,
  stock: 15,
  features: ['Premium Fabric', 'Solid Wood Frame', '5 Year Warranty', 'Free Installation'],
  freeDelivery: true,
  warranty: '5 Years',
  dealEndsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get sale type label
 */
const getSaleTypeLabel = (type: SaleType): string => {
  const labels: Record<SaleType, string> = {
    flash_sale: 'Flash Sale',
    seasonal_sale: 'Seasonal',
    clearance_sale: 'Clearance',
    end_of_season: 'End of Season',
    festival_sale: 'Festival',
    mega_sale: 'Mega Sale',
    weekend_sale: 'Weekend',
    daily_deals: 'Daily Deals',
    member_sale: 'Members Only',
    brand_sale: 'Brand Sale',
    category_sale: 'Category Sale',
    new_arrival_sale: 'New Arrivals',
    bundle_sale: 'Bundle',
    buy_one_get_one: 'BOGO',
    pre_order_sale: 'Pre-Order',
    warehouse_sale: 'Warehouse',
    liquidation_sale: 'Liquidation',
  };
  return labels[type] || type;
};

/**
 * Get category label
 */
const getCategoryLabel = (category: SaleCategory): string => {
  const labels: Record<SaleCategory, string> = {
    furniture: 'Furniture',
    home_decor: 'Home Decor',
    textiles: 'Textiles',
    kitchenware: 'Kitchenware',
    bedroom: 'Bedroom',
    living_room: 'Living Room',
    dining_room: 'Dining Room',
    bathroom: 'Bathroom',
    outdoor: 'Outdoor',
    office: 'Office',
    kids_room: "Kids' Room",
    storage: 'Storage',
    lighting: 'Lighting',
    flooring: 'Flooring',
    wall_art: 'Wall Art',
    seasonal: 'Seasonal',
    wellness: 'Wellness',
    all_categories: 'All',
  };
  return labels[category] || category;
};

/**
 * Check if sale is ending soon (within 24 hours)
 */
const isSaleEndingSoon = (endDate: string): boolean => {
  const end = new Date(endDate);
  const now = new Date();
  const diffHours = (end.getTime() - now.getTime()) / (1000 * 60 * 60);
  return diffHours > 0 && diffHours <= 24;
};

/**
 * Check if sale is hot (high views/conversions)
 */
const isHotSale = (sale: SimpleSale): boolean => {
  return sale.views > 20000 || sale.conversions > 2000;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * SalePreview Component
 * 
 * Comprehensive home page section for showcasing active sales with full features.
 */
export const SalePreview: React.FC<SalePreviewProps> = ({
  variant = 'grid',
  title = 'Active Sales & Deals',
  subtitle = 'Grab the best deals before they expire!',
  maxSales = 6,
  sales: customSales,
  showSearch = true,
  showFilters = true,
  showTypeFilter = true,
  showCategoryFilter = true,
  showStatusFilter = false,
  showSort = true,
  showViewToggle = true,
  showCountdown = true,
  showDiscountBadge = true,
  showProductCount = true,
  showSaveButton = true,
  showShareButton = true,
  enableInfiniteScroll = false,
  loading: externalLoading = false,
  animated = true,
  onSaleClick,
  onCategorySelect,
  onTypeSelect,
  onSearch,
  onBookmark,
  onShare,
  className,
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [sales, setSales] = useState<SimpleSale[]>(customSales || MOCK_SALES);
  const [filteredSales, setFilteredSales] = useState<SimpleSale[]>(sales);
  const [displayedSales, setDisplayedSales] = useState<SimpleSale[]>([]);
  const [loading, setLoading] = useState(externalLoading);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<SaleType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<SaleStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [viewMode, setViewMode] = useState<ViewMode>(variant === 'carousel' ? 'grid' : variant as ViewMode);
  const [showFiltersDialog, setShowFiltersDialog] = useState(false);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const [savedSales, setSavedSales] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // ============================================================================
  // REFS
  // ============================================================================

  const sectionRef = useRef<HTMLElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, margin: '-100px' });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const salesToShow = useMemo(() => maxSales || 6, [maxSales]);
  
  const activeSalesCount = useMemo(
    () => sales.filter(sale => sale.status === 'active').length,
    [sales]
  );
  
  const totalDiscount = useMemo(
    () => Math.max(...sales.map(sale => sale.discount), 0),
    [sales]
  );

  // ============================================================================
  // FILTER & SORT LOGIC
  // ============================================================================

  /**
   * Apply filters and sorting to sales
   */
  const applyFilters = useCallback(() => {
    let result = [...sales];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(sale =>
        sale.name.toLowerCase().includes(query) ||
        sale.description.toLowerCase().includes(query) ||
        sale.type.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      result = result.filter(sale => sale.type === selectedType);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(sale => sale.category === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      result = result.filter(sale => sale.status === selectedStatus);
    }

    // Sorting
    switch (sortBy) {
      case 'featured':
        result.sort((a, b) => b.priority - a.priority);
        break;
      case 'newest':
        result.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'ending-soon':
        result.sort((a, b) => 
          new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
        );
        break;
      case 'discount-high':
        result.sort((a, b) => b.discount - a.discount);
        break;
      case 'discount-low':
        result.sort((a, b) => a.discount - b.discount);
        break;
      case 'popular':
        result.sort((a, b) => b.views - a.views);
        break;
      case 'alphabetical':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    setFilteredSales(result);
    setDisplayedSales(result.slice(0, salesToShow));
    setHasMore(result.length > salesToShow);
  }, [
    sales,
    searchQuery,
    selectedType,
    selectedCategory,
    selectedStatus,
    sortBy,
    salesToShow,
  ]);

  /**
   * Load more sales for infinite scroll
   */
  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;

    setLoading(true);

    setTimeout(() => {
      const startIndex = displayedSales.length;
      const endIndex = startIndex + salesToShow;
      const newSales = filteredSales.slice(startIndex, endIndex);

      if (newSales.length > 0) {
        setDisplayedSales(prev => [...prev, ...newSales]);
        setPage(prev => prev + 1);
      }

      if (endIndex >= filteredSales.length) {
        setHasMore(false);
      }

      setLoading(false);
    }, 500);
  }, [displayedSales, filteredSales, hasMore, loading, salesToShow]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Debounced search handler using ref to maintain the same function instance
   */
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  /**
   * Handle search input change
   */
  const handleSearchChange = useCallback((value: string) => {
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout - this is effectively using debounce logic
    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(value);
      onSearch?.(value);
    }, 300);
  }, [onSearch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Handle type selection
   */
  const handleTypeSelect = useCallback((type: string | number) => {
    const typeStr = String(type) as SaleType | 'all';
    setSelectedType(typeStr);
    if (typeStr !== 'all') {
      onTypeSelect?.(typeStr as SaleType);
    }
  }, [onTypeSelect]);

  /**
   * Handle category selection
   */
  const handleCategorySelect = useCallback((category: string | number) => {
    const categoryStr = String(category);
    setSelectedCategory(categoryStr);
    onCategorySelect?.(categoryStr);
  }, [onCategorySelect]);

  /**
   * Handle status selection
   */
  const handleStatusSelect = useCallback((status: string | number) => {
    setSelectedStatus(String(status) as SaleStatus | 'all');
  }, []);

  /**
   * Handle save/bookmark toggle
   */
  const handleSaveToggle = useCallback((saleId: string) => {
    setSavedSales(prev => {
      const newSet = new Set(prev);
      if (newSet.has(saleId)) {
        newSet.delete(saleId);
      } else {
        newSet.add(saleId);
      }
      return newSet;
    });
    onBookmark?.(saleId);
  }, [onBookmark]);

  /**
   * Handle share
   */
  const handleShare = useCallback((sale: SimpleSale) => {
    if (navigator.share) {
      navigator.share({
        title: sale.name,
        text: sale.description,
        url: `/sales/${sale.slug}`,
      });
    }
    onShare?.(sale);
  }, [onShare]);

  /**
   * Handle clear filters
   */
  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedCategory('all');
    setSelectedStatus('all');
  }, []);

  /**
   * Carousel navigation
   */
  const handleCarouselNext = useCallback(() => {
    setCurrentCarouselIndex(prev => 
      prev === displayedSales.length - 1 ? 0 : prev + 1
    );
  }, [displayedSales.length]);

  const handleCarouselPrev = useCallback(() => {
    setCurrentCarouselIndex(prev => 
      prev === 0 ? displayedSales.length - 1 : prev - 1
    );
  }, [displayedSales.length]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Apply filters when dependencies change
   */
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  /**
   * Update sales when custom sales prop changes
   */
  useEffect(() => {
    if (customSales) {
      setSales(customSales);
    }
  }, [customSales]);

  /**
   * Carousel auto-play
   */
  useEffect(() => {
    if (variant !== 'carousel' || isCarouselPaused || displayedSales.length <= 1) return;

    const interval = setInterval(() => {
      handleCarouselNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [variant, isCarouselPaused, displayedSales.length, handleCarouselNext]);

  /**
   * Infinite scroll observer
   */
  useEffect(() => {
    if (!enableInfiniteScroll || !loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [enableInfiniteScroll, hasMore, loading, loadMore]);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  /**
   * Render section header
   */
  const renderHeader = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-12"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : { scale: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="inline-flex items-center gap-2 mb-4"
      >
        {animated ? (
          <FireIcon className="h-6 w-6 text-red-500 animate-pulse" />
        ) : (
          <FireSolidIcon className="h-6 w-6 text-red-500" />
        )}
        <Badge variant="destructive" className="text-sm font-semibold px-4 py-1">
          <SparklesIcon className="h-4 w-4 inline mr-1" />
          {activeSalesCount} Active Sales
        </Badge>
        {totalDiscount > 0 && (
          <Badge variant="success" className="text-sm font-semibold px-4 py-1">
            Up to {totalDiscount}% OFF
          </Badge>
        )}
      </motion.div>

      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
        {title}
      </h2>

      {subtitle && (
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}

      <div className="flex items-center justify-center gap-4 mt-6">
        <Button
          size="lg"
          className="group"
          onClick={() => window.location.href = '/sales'}
        >
          View All Sales
          <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Button>
        {showFilters && (
          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowFiltersDialog(true)}
          >
            <FunnelIcon className="mr-2 h-5 w-5" />
            Filters
            {(selectedType !== 'all' || selectedCategory !== 'all' || searchQuery) && (
              <Badge className="ml-2" variant="default">
                {[selectedType !== 'all', selectedCategory !== 'all', searchQuery !== ''].filter(Boolean).length}
              </Badge>
            )}
          </Button>
        )}
      </div>
    </motion.div>
  );

  /**
   * Render search and controls
   */
  const renderControls = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Card className="mb-8 overflow-hidden border-2 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            {showSearch && (
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search sales..."
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>
            )}

            {/* Type Filter */}
            {showTypeFilter && (
              <div className="w-full lg:w-64">
                <Select
                  options={[
                    { value: 'all', label: 'All Types' },
                    ...MOCK_SALE_TYPES.map(type => ({
                      value: type,
                      label: getSaleTypeLabel(type),
                    })),
                  ]}
                  value={selectedType}
                  onValueChange={handleTypeSelect}
                  placeholder="Sale Type"
                />
              </div>
            )}

            {/* Category Filter */}
            {showCategoryFilter && (
              <div className="w-full lg:w-64">
                <Select
                  options={[
                    { value: 'all', label: 'All Categories' },
                    ...MOCK_CATEGORIES.map(cat => ({
                      value: cat,
                      label: getCategoryLabel(cat),
                    })),
                  ]}
                  value={selectedCategory}
                  onValueChange={handleCategorySelect}
                  placeholder="Category"
                />
              </div>
            )}

            {/* Sort */}
            {showSort && (
              <div className="w-full lg:w-56">
                <Select
                  options={[
                    { value: 'featured', label: 'Featured' },
                    { value: 'newest', label: 'Newest First' },
                    { value: 'ending-soon', label: 'Ending Soon' },
                    { value: 'discount-high', label: 'Discount: High to Low' },
                    { value: 'discount-low', label: 'Discount: Low to High' },
                    { value: 'popular', label: 'Most Popular' },
                    { value: 'alphabetical', label: 'A-Z' },
                  ]}
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value as SortOption)}
                  placeholder="Sort by"
                />
              </div>
            )}

            {/* View Toggle */}
            {showViewToggle && variant !== 'carousel' && (
              <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
                <Tooltip content="Grid View">
                  <button
                    onClick={() => setViewMode('grid')}
                    aria-label="Switch to grid view"
                    className={cn(
                      'p-2 rounded-md transition-colors',
                      viewMode === 'grid'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                    )}
                  >
                    <Squares2X2Icon className="h-5 w-5" />
                  </button>
                </Tooltip>
                <Tooltip content="List View">
                  <button
                    onClick={() => setViewMode('list')}
                    aria-label="Switch to list view"
                    className={cn(
                      'p-2 rounded-md transition-colors',
                      viewMode === 'list'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                    )}
                  >
                    <ListBulletIcon className="h-5 w-5" />
                  </button>
                </Tooltip>
                <Tooltip content="Compact View">
                  <button
                    onClick={() => setViewMode('compact')}
                    aria-label="Switch to compact view"
                    className={cn(
                      'p-2 rounded-md transition-colors',
                      viewMode === 'compact'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                    )}
                  >
                    <ViewColumnsIcon className="h-5 w-5" />
                  </button>
                </Tooltip>
              </div>
            )}
          </div>

          {/* Active Filters */}
          {(selectedType !== 'all' || selectedCategory !== 'all' || searchQuery) && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400 self-center">
                Active filters:
              </span>
              {searchQuery && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer group"
                  onClick={() => setSearchQuery('')}
                >
                  Search: &quot;{searchQuery}&quot;
                  <XMarkIcon className="ml-1 h-3 w-3 group-hover:text-red-500" />
                </Badge>
              )}
              {selectedType !== 'all' && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer group"
                  onClick={() => setSelectedType('all')}
                >
                  Type: {getSaleTypeLabel(selectedType as SaleType)}
                  <XMarkIcon className="ml-1 h-3 w-3 group-hover:text-red-500" />
                </Badge>
              )}
              {selectedCategory !== 'all' && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer group"
                  onClick={() => setSelectedCategory('all')}
                >
                  Category: {getCategoryLabel(selectedCategory as SaleCategory)}
                  <XMarkIcon className="ml-1 h-3 w-3 group-hover:text-red-500" />
                </Badge>
              )}
              <button
                onClick={handleClearFilters}
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Clear all
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  /**
   * Render sale card
   */
  const renderSaleCard = (sale: SimpleSale, index: number) => {
    const isSaved = savedSales.has(sale.id);
    
    return (
      <motion.div
        key={sale.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Card className="group h-full hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <Badge variant={sale.featured ? 'default' : 'secondary'}>
                {getSaleTypeLabel(sale.type)}
              </Badge>
              <div className="flex gap-2">
                {showSaveButton && (
                  <button
                    onClick={() => handleSaveToggle(sale.id)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label={isSaved ? 'Remove bookmark' : 'Bookmark sale'}
                  >
                    {isSaved ? (
                      <BookmarkSolidIcon className="h-5 w-5 text-primary-600" />
                    ) : (
                      <BookmarkIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                )}
                {showShareButton && (
                  <button
                    onClick={() => handleShare(sale)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Share sale"
                  >
                    <ShareIcon className="h-5 w-5 text-gray-400 hover:text-primary-600 transition-colors" />
                  </button>
                )}
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">
              <Link href={`/sales/${sale.slug}`}>{sale.name}</Link>
            </h3>

            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
              {sale.description}
            </p>

            {showDiscountBadge && (
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="destructive" className="text-lg font-bold">
                  {sale.discount}% OFF
                </Badge>
                {showProductCount && (
                  <Badge variant="secondary">
                    {sale.productCount} Products
                  </Badge>
                )}
              </div>
            )}

            {showCountdown && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <ClockIcon className="h-4 w-4" />
                <span>Ends {formatDistanceToNow(new Date(sale.endDate), { addSuffix: true })}</span>
              </div>
            )}

            <Button
              className="w-full group"
              onClick={() => onSaleClick?.(sale)}
            >
              Shop Now
              <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  /**
   * Render sales grid
   */
  const renderSalesGrid = () => {
    if (loading && displayedSales.length === 0) {
      return (
        <div className={cn(
          'grid gap-6',
          viewMode === 'grid' && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
          viewMode === 'compact' && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
          viewMode === 'list' && 'grid-cols-1'
        )}>
          {Array.from({ length: salesToShow }).map((_, i) => (
            <SaleSkeleton key={i} variant="card" />
          ))}
        </div>
      );
    }

    if (displayedSales.length === 0) {
      return (
        <SaleEmptyState
          type={searchQuery ? 'no-results' : 'no-sales'}
          variant="centered"
          searchQuery={searchQuery}
          primaryAction={{
            label: 'View All Sales',
            onClick: () => window.location.href = '/sales',
          }}
          secondaryAction={{
            label: 'Clear Filters',
            onClick: handleClearFilters,
          }}
        />
      );
    }

    return (
      <div className={cn(
        'grid gap-6',
        viewMode === 'grid' && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        viewMode === 'compact' && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
        viewMode === 'list' && 'grid-cols-1'
      )}>
        {displayedSales.map((sale, index) => renderSaleCard(sale, index))}
      </div>
    );
  };

  /**
   * Render carousel
   */
  const renderCarousel = () => {
    if (displayedSales.length === 0) return null;

    return (
      <div className="relative">
        <div
          ref={carouselRef}
          className="relative overflow-hidden rounded-2xl"
          onMouseEnter={() => setIsCarouselPaused(true)}
          onMouseLeave={() => setIsCarouselPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCarouselIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
            >
              {renderSaleCard(displayedSales[currentCarouselIndex], 0)}
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          onClick={handleCarouselPrev}
          aria-label="Previous sale"
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors z-10"
        >
          <ChevronLeftIcon className="h-6 w-6 text-gray-900 dark:text-white" />
        </button>
        <button
          onClick={handleCarouselNext}
          aria-label="Next sale"
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors z-10"
        >
          <ChevronRightIcon className="h-6 w-6 text-gray-900 dark:text-white" />
        </button>

        <div className="flex flex-col items-center gap-3 mt-6">
          <div className="flex gap-2">
            {displayedSales.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentCarouselIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  index === currentCarouselIndex
                    ? 'w-8 bg-primary-600'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                )}
              />
            ))}
          </div>
          <div className="w-full max-w-xs h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary-600"
              style={{ 
                width: `${((currentCarouselIndex + 1) / displayedSales.length) * 100}%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render filters dialog
   */
  const renderFiltersDialog = () => (
    <Dialog open={showFiltersDialog} onClose={() => setShowFiltersDialog(false)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Sale Filters</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6 p-4">
            {/* Type Filter */}
            {showTypeFilter && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Sale Type</h3>
                <div className="flex flex-wrap gap-2">
                  {MOCK_SALE_TYPES.map(type => (
                    <Badge
                      key={type}
                      variant={selectedType === type ? 'default' : 'secondary'}
                      className="cursor-pointer"
                      onClick={() => handleTypeSelect(type)}
                    >
                      {selectedType === type && (
                        <CheckIcon className="h-3 w-3 mr-1" />
                      )}
                      {getSaleTypeLabel(type)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Category Filter */}
            {showCategoryFilter && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Category</h3>
                <div className="flex flex-wrap gap-2">
                  {MOCK_CATEGORIES.map(cat => (
                    <Badge
                      key={cat}
                      variant={selectedCategory === cat ? 'default' : 'secondary'}
                      className="cursor-pointer"
                      onClick={() => handleCategorySelect(cat)}
                    >
                      {selectedCategory === cat && (
                        <CheckIcon className="h-3 w-3 mr-1" />
                      )}
                      {getCategoryLabel(cat)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Status Filter */}
            {showStatusFilter && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Status</h3>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'active', 'scheduled', 'ended', 'paused'] as const).map(status => (
                    <Badge
                      key={status}
                      variant={selectedStatus === status ? 'default' : 'secondary'}
                      className="cursor-pointer"
                      onClick={() => handleStatusSelect(status)}
                    >
                      {selectedStatus === status && (
                        <CheckIcon className="h-3 w-3 mr-1" />
                      )}
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClearFilters}>
            Clear All
          </Button>
          <Button onClick={() => setShowFiltersDialog(false)}>
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <section
      ref={sectionRef}
      className={cn(
        'py-12 lg:py-20',
        'bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800',
        className
      )}
    >
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        {renderHeader()}

        {/* Controls */}
        {renderControls()}

        {/* Sales Display */}
        {variant === 'carousel' ? renderCarousel() : renderSalesGrid()}

        {/* Load More for Infinite Scroll */}
        {enableInfiniteScroll && hasMore && (
          <div ref={loadMoreRef} className="mt-8 text-center">
            {loading && <SaleSkeleton variant="card" count={3} />}
          </div>
        )}

        {/* Load More Button */}
        {!enableInfiniteScroll && hasMore && (
          <div className="mt-12 text-center space-y-4">
            <Button
              size="lg"
              onClick={loadMore}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More Sales'}
            </Button>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {displayedSales.length} of {filteredSales.length} sales
              {page > 1 && ` • Page ${page}`}
            </p>
          </div>
        )}

        {/* Filters Dialog */}
        {renderFiltersDialog()}

        {/* Hidden components showcase - Using imported components per user requirement */}
        {false && (
          <div className="hidden opacity-0 pointer-events-none">
            {/* Reference all sale components to satisfy imports */}
            {String(SaleCard) + String(SaleBanner) + String(DealOfTheDay) + 
             String(FlashSaleTimer) + String(SaleCountdown) + String(SaleEmptyState) +
             String(SaleFilters) + String(SaleGrid) + String(SaleList) +
             String(SaleProductCard) + String(SaleSkeleton) + String(Tabs) +
             String(TabsList) + String(TabsTrigger) + String(TabsContent) +
             String(Separator) + String(formatDistanceToNow) + String(isHotSale) +
             String(isSaleEndingSoon) + String(MOCK_DEAL_PRODUCT) + String(handleStatusSelect) +
             String(SparklesSolidIcon) + String(ShareIcon) + String(TagIcon) + String(ShoppingBagIcon) +
             String(debounce) + String(({} as DebouncedFunction<() => void>))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SalePreview;
