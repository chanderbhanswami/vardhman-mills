'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  QuestionMarkCircleIcon,
  Cog8ToothIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  TruckIcon,
  UserIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronRightIcon,
  ClockIcon,
  EyeIcon,
  StarIcon,
  ArrowRightIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/utils';

// Types and Interfaces
export interface HelpCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  slug: string;
  parentId?: string;
  children?: HelpCategory[];
  stats: {
    totalArticles: number;
    popularArticles: number;
    recentArticles: number;
    avgRating: number;
    totalViews: number;
  };
  featured: boolean;
  lastUpdated: string;
  tags: string[];
}

export interface HelpCategoryListProps {
  categories: HelpCategory[];
  selectedCategory?: string;
  onCategorySelect?: (category: HelpCategory) => void;
  onCategoryCreate?: () => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  sortBy?: 'name' | 'articles' | 'popularity' | 'updated';
  onSortChange?: (sort: 'name' | 'articles' | 'popularity' | 'updated') => void;
  showSearch?: boolean;
  showFilters?: boolean;
  showStats?: boolean;
  showCreateButton?: boolean;
  className?: string;
  enableAnimations?: boolean;
  maxColumns?: number;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  },
  hover: {
    y: -4,
    transition: { duration: 0.2 }
  }
};

const statsVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.2 }
  }
};

// Default categories data
const defaultCategories: HelpCategory[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Learn the basics and set up your account',
    icon: UserIcon,
    color: 'blue',
    slug: 'getting-started',
    stats: {
      totalArticles: 25,
      popularArticles: 8,
      recentArticles: 3,
      avgRating: 4.5,
      totalViews: 15420
    },
    featured: true,
    lastUpdated: '2024-01-15',
    tags: ['basics', 'setup', 'account']
  },
  {
    id: 'orders',
    name: 'Orders & Shopping',
    description: 'Everything about placing and managing orders',
    icon: ShoppingBagIcon,
    color: 'green',
    slug: 'orders',
    stats: {
      totalArticles: 32,
      popularArticles: 12,
      recentArticles: 5,
      avgRating: 4.3,
      totalViews: 28750
    },
    featured: true,
    lastUpdated: '2024-01-20',
    tags: ['orders', 'cart', 'checkout']
  },
  {
    id: 'payments',
    name: 'Payments & Billing',
    description: 'Payment methods, invoices, and billing support',
    icon: CreditCardIcon,
    color: 'purple',
    slug: 'payments',
    stats: {
      totalArticles: 18,
      popularArticles: 6,
      recentArticles: 2,
      avgRating: 4.7,
      totalViews: 12340
    },
    featured: false,
    lastUpdated: '2024-01-18',
    tags: ['payment', 'billing', 'invoice']
  },
  {
    id: 'shipping',
    name: 'Shipping & Delivery',
    description: 'Shipping options, tracking, and delivery information',
    icon: TruckIcon,
    color: 'orange',
    slug: 'shipping',
    stats: {
      totalArticles: 22,
      popularArticles: 9,
      recentArticles: 4,
      avgRating: 4.4,
      totalViews: 19680
    },
    featured: true,
    lastUpdated: '2024-01-22',
    tags: ['shipping', 'delivery', 'tracking']
  },
  {
    id: 'technical',
    name: 'Technical Support',
    description: 'Technical issues, troubleshooting, and system requirements',
    icon: Cog8ToothIcon,
    color: 'red',
    slug: 'technical',
    stats: {
      totalArticles: 45,
      popularArticles: 15,
      recentArticles: 8,
      avgRating: 4.2,
      totalViews: 34560
    },
    featured: false,
    lastUpdated: '2024-01-25',
    tags: ['technical', 'troubleshooting', 'bugs']
  },
  {
    id: 'mobile-app',
    name: 'Mobile App',
    description: 'Mobile app features, settings, and support',
    icon: DevicePhoneMobileIcon,
    color: 'indigo',
    slug: 'mobile-app',
    stats: {
      totalArticles: 28,
      popularArticles: 10,
      recentArticles: 6,
      avgRating: 4.6,
      totalViews: 21450
    },
    featured: false,
    lastUpdated: '2024-01-21',
    tags: ['mobile', 'app', 'ios', 'android']
  },
  {
    id: 'security',
    name: 'Security & Privacy',
    description: 'Account security, privacy settings, and data protection',
    icon: ShieldCheckIcon,
    color: 'green',
    slug: 'security',
    stats: {
      totalArticles: 15,
      popularArticles: 5,
      recentArticles: 2,
      avgRating: 4.8,
      totalViews: 9870
    },
    featured: false,
    lastUpdated: '2024-01-19',
    tags: ['security', 'privacy', 'password']
  },
  {
    id: 'contact',
    name: 'Contact & Support',
    description: 'How to reach us and get personalized help',
    icon: ChatBubbleLeftRightIcon,
    color: 'yellow',
    slug: 'contact',
    stats: {
      totalArticles: 12,
      popularArticles: 4,
      recentArticles: 1,
      avgRating: 4.9,
      totalViews: 7320
    },
    featured: false,
    lastUpdated: '2024-01-17',
    tags: ['contact', 'support', 'chat']
  }
];

// Utility functions
const getColorClasses = (color: string) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50 hover:bg-blue-100',
      text: 'text-blue-600',
      border: 'border-blue-200',
      icon: 'text-blue-500'
    },
    green: {
      bg: 'bg-green-50 hover:bg-green-100',
      text: 'text-green-600',
      border: 'border-green-200',
      icon: 'text-green-500'
    },
    purple: {
      bg: 'bg-purple-50 hover:bg-purple-100',
      text: 'text-purple-600',
      border: 'border-purple-200',
      icon: 'text-purple-500'
    },
    orange: {
      bg: 'bg-orange-50 hover:bg-orange-100',
      text: 'text-orange-600',
      border: 'border-orange-200',
      icon: 'text-orange-500'
    },
    red: {
      bg: 'bg-red-50 hover:bg-red-100',
      text: 'text-red-600',
      border: 'border-red-200',
      icon: 'text-red-500'
    },
    indigo: {
      bg: 'bg-indigo-50 hover:bg-indigo-100',
      text: 'text-indigo-600',
      border: 'border-indigo-200',
      icon: 'text-indigo-500'
    },
    yellow: {
      bg: 'bg-yellow-50 hover:bg-yellow-100',
      text: 'text-yellow-600',
      border: 'border-yellow-200',
      icon: 'text-yellow-500'
    }
  };
  return colorMap[color as keyof typeof colorMap] || colorMap.blue;
};

const formatNumber = (num: number) => {
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}k`;
  return `${(num / 1000000).toFixed(1)}m`;
};

const filterCategories = (categories: HelpCategory[], searchTerm: string) => {
  if (!searchTerm.trim()) return categories;
  
  const term = searchTerm.toLowerCase();
  return categories.filter(category =>
    category.name.toLowerCase().includes(term) ||
    category.description.toLowerCase().includes(term) ||
    category.tags.some(tag => tag.toLowerCase().includes(term))
  );
};

const sortCategories = (categories: HelpCategory[], sortBy: string) => {
  return [...categories].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'articles':
        return b.stats.totalArticles - a.stats.totalArticles;
      case 'popularity':
        return b.stats.totalViews - a.stats.totalViews;
      case 'updated':
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      default:
        return 0;
    }
  });
};

// Main Component
const HelpCategoryList: React.FC<HelpCategoryListProps> = ({
  categories = defaultCategories,
  selectedCategory,
  onCategorySelect,
  onCategoryCreate,
  searchTerm = '',
  onSearchChange,
  viewMode = 'grid',
  onViewModeChange,
  sortBy = 'name',
  onSortChange,
  showSearch = true,
  showFilters = true,
  showStats = true,
  showCreateButton = false,
  className,
  enableAnimations = true,
  maxColumns = 3
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Process categories
  const processedCategories = useMemo(() => {
    const filtered = filterCategories(categories, localSearchTerm);
    return sortCategories(filtered, sortBy);
  }, [categories, localSearchTerm, sortBy]);

  const featuredCategories = useMemo(() => {
    return processedCategories.filter(cat => cat.featured);
  }, [processedCategories]);

  const regularCategories = useMemo(() => {
    return processedCategories.filter(cat => !cat.featured);
  }, [processedCategories]);

  // Handle search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    onSearchChange?.(value);
  };

  // Handle category click
  const handleCategoryClick = (category: HelpCategory) => {
    onCategorySelect?.(category);
  };

  // Render category card
  const renderCategoryCard = (category: HelpCategory, featured = false) => {
    const Icon = category.icon;
    const colors = getColorClasses(category.color);

    return (
      <motion.div
        key={category.id}
        variants={enableAnimations ? itemVariants : undefined}
        whileHover={enableAnimations ? "hover" : undefined}
        onClick={() => handleCategoryClick(category)}
      >
        <Card className={cn(
          'cursor-pointer transition-all duration-200 hover:shadow-lg',
          featured ? 'border-2' : 'border',
          colors.border,
          colors.bg,
          selectedCategory === category.id && 'ring-2 ring-blue-500'
        )}>
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className={cn('p-3 rounded-lg', colors.bg.replace('hover:', ''))}>
                <Icon className={cn('h-6 w-6', colors.icon)} />
              </div>
              {featured && (
                <Badge variant="default" size="sm">
                  Featured
                </Badge>
              )}
            </div>

            {/* Content */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {category.name}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {category.description}
              </p>
            </div>

            {/* Tags */}
            {category.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {category.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" size="sm" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {category.tags.length > 3 && (
                  <Badge variant="outline" size="sm" className="text-xs">
                    +{category.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Stats */}
            {showStats && (
              <motion.div
                variants={enableAnimations ? statsVariants : undefined}
                className="grid grid-cols-2 gap-4 mb-4"
              >
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">
                    {category.stats.totalArticles}
                  </div>
                  <div className="text-xs text-gray-500">Articles</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">
                    {formatNumber(category.stats.totalViews)}
                  </div>
                  <div className="text-xs text-gray-500">Views</div>
                </div>
              </motion.div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <StarIcon className="h-3 w-3" />
                <span>{category.stats.avgRating.toFixed(1)}</span>
                <span>•</span>
                <ClockIcon className="h-3 w-3" />
                <span>{category.stats.recentArticles} recent</span>
              </div>
              <ChevronRightIcon className={cn('h-4 w-4', colors.text)} />
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  // Get grid columns class
  const getGridColumnsClass = () => {
    switch (maxColumns) {
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Help Categories</h2>
          <p className="text-gray-600 mt-1">
            Browse help articles by category ({processedCategories.length} categories)
          </p>
        </div>
        {showCreateButton && (
          <Button onClick={onCategoryCreate} size="sm">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          {showSearch && (
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search categories..."
                value={localSearchTerm}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
          )}

          {/* Filters */}
          {showFilters && (
            <div className="flex items-center gap-2">
              {/* Filter Toggle Button */}
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                title="Filter options"
              >
                <FunnelIcon className="h-4 w-4" />
                Filter
              </Button>
              
              {/* Sort */}
              <Select
                options={[
                  { value: 'name', label: 'Name' },
                  { value: 'articles', label: 'Articles' },
                  { value: 'popularity', label: 'Popularity' },
                  { value: 'updated', label: 'Updated' }
                ]}
                value={sortBy}
                onValueChange={(value) => onSortChange?.(value as typeof sortBy)}
                placeholder="Sort by..."
              />

              {/* View Mode */}
              <div className="flex items-center border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange?.('grid')}
                  className="rounded-none rounded-l-lg"
                >
                  <Squares2X2Icon className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange?.('list')}
                  className="rounded-none rounded-r-lg"
                >
                  <ListBulletIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Featured Categories */}
      {featuredCategories.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Featured Categories
          </h3>
          <motion.div
            className={cn('grid gap-6', getGridColumnsClass())}
            variants={enableAnimations ? containerVariants : undefined}
            initial="hidden"
            animate="visible"
          >
            {featuredCategories.map((category) => 
              renderCategoryCard(category, true)
            )}
          </motion.div>
        </div>
      )}

      {/* All Categories */}
      {regularCategories.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            All Categories
          </h3>
          <motion.div
            className={cn(
              viewMode === 'grid' 
                ? cn('grid gap-6', getGridColumnsClass())
                : 'space-y-4'
            )}
            variants={enableAnimations ? containerVariants : undefined}
            initial="hidden"
            animate="visible"
          >
            {regularCategories.map((category) => 
              viewMode === 'grid' 
                ? renderCategoryCard(category)
                : (
                  <motion.div
                    key={category.id}
                    variants={enableAnimations ? itemVariants : undefined}
                    onClick={() => handleCategoryClick(category)}
                  >
                    <Card className={cn(
                      'cursor-pointer transition-all duration-200 hover:shadow-md p-4',
                      selectedCategory === category.id && 'ring-2 ring-blue-500'
                    )}>
                      <div className="flex items-center gap-4">
                        <div className={cn('p-2 rounded-lg', getColorClasses(category.color).bg.replace('hover:', ''))}>
                          <category.icon className={cn('h-5 w-5', getColorClasses(category.color).icon)} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{category.name}</h4>
                          <p className="text-sm text-gray-600">{category.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {category.stats.totalArticles} articles
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatNumber(category.stats.totalViews)} views
                          </div>
                        </div>
                        <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                      </div>
                    </Card>
                  </motion.div>
                )
            )}
          </motion.div>
        </div>
      )}

      {/* Empty State */}
      {processedCategories.length === 0 && (
        <div className="text-center py-12">
          <QuestionMarkCircleIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No categories found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search or filters to find what you&apos;re looking for.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
            <ComputerDesktopIcon className="h-4 w-4" />
            <span>Browse</span>
            <DocumentTextIcon className="h-4 w-4" />
            <span>articles</span>
            <VideoCameraIcon className="h-4 w-4" />
            <span>videos</span>
            <ArrowRightIcon className="h-4 w-4" />
          </div>
          {localSearchTerm && (
            <Button
              variant="outline"
              onClick={() => {
                setLocalSearchTerm('');
                onSearchChange?.('');
              }}
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              Clear Search
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default HelpCategoryList;
