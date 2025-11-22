/**
 * BlogCategories Component - Vardhman Mills Frontend
 * 
 * Comprehensive blog categories management component with filtering,
 * search, and interactive category selection features.
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Grid, 
  List, 
  Search, 
  Hash,
  Archive,
  BookOpen
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Container } from '@/components/ui/Container';
import { Skeleton } from '@/components/ui/Skeleton';

// Types
export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  icon?: string;
  postCount: number;
  isActive: boolean;
  parentId?: string;
  children?: BlogCategory[];
  createdAt: string;
  updatedAt: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
}

export interface BlogCategoriesProps {
  categories: BlogCategory[];
  selectedCategory?: string;
  onCategorySelect?: (categoryId: string | null) => void;
  showSearch?: boolean;
  showFilter?: boolean;
  showStats?: boolean;
  showHierarchy?: boolean;
  viewMode?: 'grid' | 'list';
  variant?: 'default' | 'compact' | 'minimal';
  loading?: boolean;
  className?: string;
}

/**
 * BlogCategories Component
 * 
 * Feature-rich categories component with filtering,
 * search, and multiple view modes.
 */
export const BlogCategories: React.FC<BlogCategoriesProps> = ({
  categories = [],
  selectedCategory,
  onCategorySelect,
  showSearch = true,
  showFilter = true,
  showStats = true,
  showHierarchy = false,
  viewMode = 'grid',
  variant = 'default',
  loading = false,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'active' | 'popular'>('all');
  const [sortBy] = useState<'name' | 'posts' | 'recent'>('name');
  const [currentViewMode, setCurrentViewMode] = useState(viewMode);

  /**
   * Filter and sort categories
   */
  const filteredCategories = React.useMemo(() => {
    const filtered = categories.filter(category => {
      const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           category.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterBy === 'all' || 
                           (filterBy === 'active' && category.isActive) ||
                           (filterBy === 'popular' && category.postCount > 5);

      return matchesSearch && matchesFilter;
    });

    // Sort categories
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'posts':
          return b.postCount - a.postCount;
        case 'recent':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [categories, searchTerm, filterBy, sortBy]);

  /**
   * Get hierarchical categories
   */
  const hierarchicalCategories = React.useMemo(() => {
    if (!showHierarchy) return filteredCategories;

    const parentCategories = filteredCategories.filter(cat => !cat.parentId);
    return parentCategories.map(parent => ({
      ...parent,
      children: filteredCategories.filter(cat => cat.parentId === parent.id)
    }));
  }, [filteredCategories, showHierarchy]);

  /**
   * Handle category selection
   */
  const handleCategorySelect = (categoryId: string | null) => {
    onCategorySelect?.(categoryId);
  };

  /**
   * Get category statistics
   */
  const getCategoryStats = () => {
    const totalPosts = categories.reduce((sum, cat) => sum + cat.postCount, 0);
    const activeCategories = categories.filter(cat => cat.isActive).length;
    const avgPostsPerCategory = Math.round(totalPosts / categories.length) || 0;

    return {
      total: categories.length,
      active: activeCategories,
      totalPosts,
      avgPosts: avgPostsPerCategory
    };
  };

  const stats = getCategoryStats();

  /**
   * Render category item
   */
  const renderCategoryItem = (category: BlogCategory, isChild = false) => {
    const isSelected = selectedCategory === category.id;

    if (variant === 'minimal') {
      return (
        <motion.button
          key={category.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleCategorySelect(isSelected ? null : category.id)}
          className={`
            inline-flex items-center px-3 py-2 rounded-full text-sm font-medium transition-all
            ${isSelected 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
            ${isChild ? 'ml-4' : ''}
          `}
        >
          {category.icon && <span className="mr-2">{category.icon}</span>}
          {category.name}
          {showStats && (
            <Badge 
              variant="secondary" 
              className={`ml-2 ${isSelected ? 'bg-blue-500' : 'bg-gray-300'}`}
            >
              {category.postCount}
            </Badge>
          )}
        </motion.button>
      );
    }

    if (variant === 'compact') {
      return (
        <motion.div
          key={category.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`
            flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all
            ${isSelected 
              ? 'bg-blue-50 border-l-4 border-blue-600' 
              : 'hover:bg-gray-50'
            }
            ${isChild ? 'ml-6 border-l-2 border-gray-200' : ''}
          `}
          onClick={() => handleCategorySelect(isSelected ? null : category.id)}
        >
          <div className="flex items-center space-x-3">
            <div 
              className={`w-3 h-3 rounded-full bg-${category.color.replace('#', '')}`}
            />
            <span className={`font-medium ${isSelected ? 'text-blue-600' : 'text-gray-900'}`}>
              {category.name}
            </span>
          </div>
          {showStats && (
            <Badge variant="outline">{category.postCount}</Badge>
          )}
        </motion.div>
      );
    }

    return (
      <motion.div
        key={category.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        className={isChild ? 'ml-6' : ''}
      >
        <Card 
          className={`
            p-6 cursor-pointer transition-all duration-300 hover:shadow-lg
            ${isSelected 
              ? 'ring-2 ring-blue-500 bg-blue-50' 
              : 'hover:shadow-md'
            }
          `}
          onClick={() => handleCategorySelect(isSelected ? null : category.id)}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className={`w-4 h-4 rounded-full bg-${category.color.replace('#', '')}`}
                />
                <h3 className={`text-lg font-semibold ${isSelected ? 'text-blue-600' : 'text-gray-900'}`}>
                  {category.name}
                </h3>
              </div>
              {showStats && (
                <Badge 
                  variant={isSelected ? 'default' : 'secondary'}
                  className="flex items-center space-x-1"
                >
                  <BookOpen className="w-3 h-3" />
                  <span>{category.postCount}</span>
                </Badge>
              )}
            </div>

            {category.description && (
              <p className="text-gray-600 text-sm line-clamp-2">
                {category.description}
              </p>
            )}

            <div className="flex items-center justify-between text-sm text-gray-500">
              <span className={`px-2 py-1 rounded ${category.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100'}`}>
                {category.isActive ? 'Active' : 'Inactive'}
              </span>
              {category.children && category.children.length > 0 && (
                <span className="flex items-center">
                  <Hash className="w-3 h-3 mr-1" />
                  {category.children.length} subcategories
                </span>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  /**
   * Render loading skeleton
   */
  const renderSkeleton = () => {
    return (
      <div className={`grid gap-4 ${currentViewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-4 h-4 rounded-full" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-6 w-8" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex justify-between">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Container className={className}>
        {renderSkeleton()}
      </Container>
    );
  }

  return (
    <Container className={className}>
      <div className="space-y-6">
        {/* Header with Statistics */}
        {showStats && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-500">Total Categories</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-gray-500">Active</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.totalPosts}</div>
              <div className="text-sm text-gray-500">Total Posts</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.avgPosts}</div>
              <div className="text-sm text-gray-500">Avg per Category</div>
            </Card>
          </motion.div>
        )}

        {/* Search and Filter Controls */}
        {(showSearch || showFilter) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row gap-4 items-center justify-between"
          >
            <div className="flex-1 max-w-md">
              {showSearch && (
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              )}
            </div>

            <div className="flex items-center space-x-4">
              {showFilter && (
                <div className="flex space-x-2">
                  <Button
                    variant={filterBy === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterBy('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={filterBy === 'active' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterBy('active')}
                  >
                    Active
                  </Button>
                  <Button
                    variant={filterBy === 'popular' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterBy('popular')}
                  >
                    Popular
                  </Button>
                </div>
              )}

              <div className="flex items-center border rounded-lg">
                <Button
                  variant={currentViewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={currentViewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Clear Selection Button */}
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Button
              variant="outline"
              onClick={() => handleCategorySelect(null)}
              className="flex items-center space-x-2"
            >
              <Archive className="w-4 h-4" />
              <span>Show All Categories</span>
            </Button>
          </motion.div>
        )}

        {/* Categories Grid/List */}
        <AnimatePresence mode="wait">
          {filteredCategories.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </motion.div>
          ) : variant === 'minimal' ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-wrap gap-3"
            >
              {hierarchicalCategories.map(category => (
                <div key={category.id}>
                  {renderCategoryItem(category)}
                  {category.children?.map(child => renderCategoryItem(child, true))}
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`
                grid gap-4
                ${variant === 'compact' || currentViewMode === 'list' 
                  ? 'grid-cols-1' 
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                }
              `}
            >
              {hierarchicalCategories.map(category => (
                <div key={category.id} className="space-y-4">
                  {renderCategoryItem(category)}
                  {category.children?.map(child => renderCategoryItem(child, true))}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count */}
        {filteredCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-gray-500"
          >
            Showing {filteredCategories.length} of {categories.length} categories
          </motion.div>
        )}
      </div>
    </Container>
  );
};

export default BlogCategories;
