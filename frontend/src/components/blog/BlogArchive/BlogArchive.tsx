'use client';

import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Archive, 
  ChevronRight, 
  Filter,
  Search,
  TrendingUp,
  Eye,
  Grid,
  List,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tooltip, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, isSameMonth, isSameYear } from 'date-fns';
import Link from 'next/link';

// Types
export interface ArchivePost {
  id: string;
  title: string;
  slug: string;
  publishedAt: string;
  viewCount?: number;
  commentCount?: number;
  isPopular?: boolean;
  isFeatured?: boolean;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  author?: {
    id: string;
    name: string;
  };
}

export interface ArchiveGroup {
  year: number;
  month: number;
  monthName: string;
  posts: ArchivePost[];
  count: number;
}

export interface BlogArchiveProps {
  posts?: ArchivePost[];
  variant?: 'default' | 'compact' | 'timeline' | 'calendar' | 'stats';
  groupBy?: 'month' | 'year' | 'quarter';
  layout?: 'accordion' | 'list' | 'grid' | 'timeline';
  showCounts?: boolean;
  showSearch?: boolean;
  showFilter?: boolean;
  showPopular?: boolean;
  showStats?: boolean;
  maxItems?: number;
  className?: string;
  onPostClick?: (post: ArchivePost) => void;
  onPeriodClick?: (year: number, month?: number) => void;
  loading?: boolean;
  error?: string | null;
  enableCollapse?: boolean;
  defaultExpanded?: boolean;
  sortOrder?: 'asc' | 'desc';
  showYearSummary?: boolean;
  highlightCurrent?: boolean;
}

// Month names
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const BlogArchive: React.FC<BlogArchiveProps> = ({
  posts = [],
  groupBy = 'month',
  layout = 'accordion',
  showCounts = true,
  showSearch = false,
  showFilter = false,
  showPopular = false,
  showStats = false,
  maxItems,
  className,
  onPostClick,
  onPeriodClick,
  loading = false,
  error = null,
  enableCollapse = true,
  defaultExpanded = true,
  sortOrder = 'desc',
  highlightCurrent = true
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Group posts by time period
  const groupedPosts = useMemo(() => {
    let filteredPosts = posts;

    // Apply search filter
    if (searchQuery) {
      filteredPosts = filteredPosts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filteredPosts = filteredPosts.filter(post =>
        post.category?.slug === selectedCategory
      );
    }

    // Group by time period
    const groups: ArchiveGroup[] = [];
    const groupMap = new Map<string, ArchivePost[]>();

    filteredPosts.forEach(post => {
      const date = parseISO(post.publishedAt);
      let key: string;

      switch (groupBy) {
        case 'year':
          key = date.getFullYear().toString();
          break;
        case 'quarter':
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          key = `${date.getFullYear()}-Q${quarter}`;
          break;
        case 'month':
        default:
          key = `${date.getFullYear()}-${date.getMonth()}`;
          break;
      }

      if (!groupMap.has(key)) {
        groupMap.set(key, []);
      }
      groupMap.get(key)!.push(post);
    });

    // Convert to groups array
    groupMap.forEach((groupPosts, key) => {
      if (groupBy === 'year') {
        const year = parseInt(key, 10);
        groups.push({
          year,
          month: 0,
          monthName: `${year}`,
          posts: groupPosts,
          count: groupPosts.length
        });
      } else if (groupBy === 'quarter') {
        const [year, quarter] = key.split('-');
        groups.push({
          year: parseInt(year, 10),
          month: 0,
          monthName: `${year} ${quarter}`,
          posts: groupPosts,
          count: groupPosts.length
        });
      } else {
        const [year, month] = key.split('-').map(Number);
        groups.push({
          year,
          month,
          monthName: monthNames[month],
          posts: groupPosts,
          count: groupPosts.length
        });
      }
    });

    // Sort groups
    groups.sort((a, b) => {
      const aValue = groupBy === 'month' ? a.year * 100 + a.month : a.year;
      const bValue = groupBy === 'month' ? b.year * 100 + b.month : b.year;
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });

    // Sort posts within groups
    groups.forEach(group => {
      group.posts.sort((a, b) => {
        const aDate = new Date(a.publishedAt).getTime();
        const bDate = new Date(b.publishedAt).getTime();
        return sortOrder === 'desc' ? bDate - aDate : aDate - bDate;
      });
    });

    return maxItems ? groups.slice(0, maxItems) : groups;
  }, [posts, searchQuery, selectedCategory, groupBy, sortOrder, maxItems]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    posts.forEach(post => {
      if (post.category) {
        cats.add(post.category.slug);
      }
    });
    return Array.from(cats);
  }, [posts]);

  // Statistics
  const stats = useMemo(() => {
    const totalPosts = posts.length;
    const totalViews = posts.reduce((sum, post) => sum + (post.viewCount || 0), 0);
    const popularPosts = posts.filter(post => post.isPopular).length;
    const featuredPosts = posts.filter(post => post.isFeatured).length;

    return {
      totalPosts,
      totalViews,
      popularPosts,
      featuredPosts,
      averageViews: totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0
    };
  }, [posts]);

  // Initialize expanded groups
  React.useEffect(() => {
    if (defaultExpanded && groupedPosts.length > 0) {
      const firstGroup = groupedPosts[0];
      const key = groupBy === 'month' 
        ? `${firstGroup.year}-${firstGroup.month}`
        : firstGroup.year.toString();
      setExpandedGroups(new Set([key]));
    }
  }, [groupedPosts, defaultExpanded, groupBy]);

  const toggleGroup = (year: number, month?: number) => {
    const key = groupBy === 'month' ? `${year}-${month}` : year.toString();
    const newExpanded = new Set(expandedGroups);
    
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    
    setExpandedGroups(newExpanded);

    if (onPeriodClick) {
      onPeriodClick(year, month);
    }
  };

  const handlePostClick = (post: ArchivePost) => {
    if (onPostClick) {
      onPostClick(post);
    }
  };

  // Post item component
  const PostItem: React.FC<{ post: ArchivePost; index: number }> = ({ post, index }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group"
    >
      <Link
        href={`/blog/${post.slug}`}
        className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
        onClick={() => handlePostClick(post)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {post.title}
            </h4>
            
            <div className="mt-1 flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
              <span>{format(parseISO(post.publishedAt), 'MMM d')}</span>
              
              {post.viewCount && (
                <div className="flex items-center space-x-1">
                  <Eye size={12} />
                  <span>{post.viewCount}</span>
                </div>
              )}
              
              {post.category && (
                <Badge variant="secondary" className="text-xs">
                  {post.category.name}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1 ml-2">
            {post.isPopular && (
              <TooltipProvider>
                <Tooltip content="Popular post">
                  <TooltipTrigger asChild>
                    <TrendingUp size={14} className="text-orange-500" />
                  </TooltipTrigger>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {post.isFeatured && (
              <TooltipProvider>
                <Tooltip content="Featured post">
                  <TooltipTrigger asChild>
                    <Badge variant="default" className="text-xs">
                      Featured
                    </Badge>
                  </TooltipTrigger>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );

  // Group header component
  const GroupHeader: React.FC<{ group: ArchiveGroup }> = ({ group }) => {
    const key = groupBy === 'month' ? `${group.year}-${group.month}` : group.year.toString();
    const isExpanded = expandedGroups.has(key);
    const isCurrent = highlightCurrent && (
      groupBy === 'month' 
        ? isSameMonth(new Date(), new Date(group.year, group.month))
        : isSameYear(new Date(), new Date(group.year, 0))
    );

    return (
      <Button
        variant="ghost"
        className={cn(
          'w-full justify-between p-3 h-auto',
          isCurrent && 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
        )}
        onClick={() => toggleGroup(group.year, group.month)}
        disabled={!enableCollapse}
      >
        <div className="flex items-center space-x-2">
          <Calendar size={16} className="text-gray-500" />
          <span className="font-medium">
            {groupBy === 'month' ? `${group.monthName} ${group.year}` : group.monthName}
          </span>
          {isCurrent && (
            <Badge variant="secondary" className="text-xs">
              Current
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {showCounts && (
            <Badge variant="outline" className="text-xs">
              {group.count} {group.count === 1 ? 'post' : 'posts'}
            </Badge>
          )}
          {enableCollapse && (
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight size={16} />
            </motion.div>
          )}
        </div>
      </Button>
    );
  };

  // Loading state
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <div className="pl-4 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Archive size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-red-500 dark:text-red-400 font-medium">
            Failed to load archive
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {error}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (groupedPosts.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Archive size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="font-medium text-gray-600 dark:text-gray-400">
            No posts found
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Try adjusting your search or filter criteria.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Archive size={20} />
            Archive
            {showCounts && (
              <Badge variant="secondary">{posts.length}</Badge>
            )}
          </CardTitle>

          {(layout === 'grid' || layout === 'list') && (
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List size={16} />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid size={16} />
              </Button>
            </div>
          )}
        </div>

        {/* Search and filters */}
        {(showSearch || showFilter) && (
          <div className="space-y-2">
            {showSearch && (
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}

            {showFilter && categories.length > 0 && (
              <div className="flex items-center space-x-2">
                <Filter size={16} className="text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                  aria-label="Filter by category"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* Statistics */}
        {showStats && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <BarChart3 size={16} />
              Statistics
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-lg">{stats.totalPosts}</div>
                <div className="text-gray-600 dark:text-gray-400">Total Posts</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{stats.totalViews.toLocaleString()}</div>
                <div className="text-gray-600 dark:text-gray-400">Total Views</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{stats.popularPosts}</div>
                <div className="text-gray-600 dark:text-gray-400">Popular</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{stats.featuredPosts}</div>
                <div className="text-gray-600 dark:text-gray-400">Featured</div>
              </div>
            </div>
          </div>
        )}

        {/* Archive groups */}
        <div className="space-y-2">
          {groupedPosts.map((group) => {
            const key = groupBy === 'month' ? `${group.year}-${group.month}` : group.year.toString();
            const isExpanded = expandedGroups.has(key);

            return (
              <div key={key} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <GroupHeader group={group} />
                
                <AnimatePresence>
                  {(isExpanded || !enableCollapse) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-gray-200 dark:border-gray-700">
                        {viewMode === 'grid' ? (
                          <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                            {group.posts.map((post, index) => (
                              <PostItem key={post.id} post={post} index={index} />
                            ))}
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {group.posts.map((post, index) => (
                              <PostItem key={post.id} post={post} index={index} />
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Show popular posts */}
        {showPopular && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <TrendingUp size={16} />
              Popular This Month
            </h4>
            <div className="space-y-2">
              {posts
                .filter(post => post.isPopular)
                .slice(0, 5)
                .map((post, index) => (
                  <PostItem key={post.id} post={post} index={index} />
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Utility components
export const CompactArchive: React.FC<{
  posts: ArchivePost[];
  className?: string;
}> = ({ posts, className }) => (
  <BlogArchive
    posts={posts}
    variant="compact"
    groupBy="month"
    showSearch={false}
    showFilter={false}
    showStats={false}
    maxItems={6}
    className={className}
  />
);

export const TimelineArchive: React.FC<{
  posts: ArchivePost[];
  className?: string;
}> = ({ posts, className }) => (
  <BlogArchive
    posts={posts}
    variant="timeline"
    layout="timeline"
    groupBy="month"
    showYearSummary={true}
    highlightCurrent={true}
    className={className}
  />
);

export const YearlyArchive: React.FC<{
  posts: ArchivePost[];
  className?: string;
}> = ({ posts, className }) => (
  <BlogArchive
    posts={posts}
    groupBy="year"
    showStats={true}
    showYearSummary={true}
    defaultExpanded={true}
    className={className}
  />
);

export default BlogArchive;
