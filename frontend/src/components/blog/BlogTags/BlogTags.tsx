'use client';

import React, { useState, useMemo } from 'react';
import { Tag, X, Plus, Search, TrendingUp, Hash, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Types
export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  count: number;
  isPopular?: boolean;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogTagsProps {
  tags?: BlogTag[];
  selectedTags?: string[];
  variant?: 'default' | 'compact' | 'minimal' | 'cloud' | 'list' | 'grid' | 'card';
  size?: 'sm' | 'md' | 'lg';
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  clickable?: boolean;
  removable?: boolean;
  searchable?: boolean;
  sortable?: boolean;
  showCount?: boolean;
  showDescription?: boolean;
  showPopular?: boolean;
  showTrending?: boolean;
  maxTags?: number;
  className?: string;
  tagClassName?: string;
  onTagClick?: (tag: BlogTag) => void;
  onTagRemove?: (tag: BlogTag) => void;
  onTagAdd?: (tagName: string) => void;
  enableAdd?: boolean;
  enableFilter?: boolean;
  placeholder?: string;
  emptyMessage?: string;
  loading?: boolean;
  categoryFilter?: string;
  popularityThreshold?: number;
}

// Color schemes for tags
const tagColorSchemes = {
  default: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-700 dark:text-gray-300',
    hover: 'hover:bg-gray-200 dark:hover:bg-gray-700',
    border: 'border-gray-200 dark:border-gray-700'
  },
  primary: {
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-300',
    hover: 'hover:bg-blue-200 dark:hover:bg-blue-900/30',
    border: 'border-blue-200 dark:border-blue-700'
  },
  secondary: {
    bg: 'bg-purple-100 dark:bg-purple-900/20',
    text: 'text-purple-700 dark:text-purple-300',
    hover: 'hover:bg-purple-200 dark:hover:bg-purple-900/30',
    border: 'border-purple-200 dark:border-purple-700'
  },
  success: {
    bg: 'bg-green-100 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-300',
    hover: 'hover:bg-green-200 dark:hover:bg-green-900/30',
    border: 'border-green-200 dark:border-green-700'
  },
  warning: {
    bg: 'bg-orange-100 dark:bg-orange-900/20',
    text: 'text-orange-700 dark:text-orange-300',
    hover: 'hover:bg-orange-200 dark:hover:bg-orange-900/30',
    border: 'border-orange-200 dark:border-orange-700'
  },
  danger: {
    bg: 'bg-red-100 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-300',
    hover: 'hover:bg-red-200 dark:hover:bg-red-900/30',
    border: 'border-red-200 dark:border-red-700'
  }
};

// Size configurations
const sizeConfig = {
  sm: {
    tag: 'text-xs px-2 py-1',
    icon: 12,
    gap: 'gap-1'
  },
  md: {
    tag: 'text-sm px-3 py-1.5',
    icon: 14,
    gap: 'gap-2'
  },
  lg: {
    tag: 'text-base px-4 py-2',
    icon: 16,
    gap: 'gap-3'
  }
};

export const BlogTags: React.FC<BlogTagsProps> = ({
  tags = [],
  selectedTags = [],
  variant = 'default',
  size = 'md',
  color = 'default',
  clickable = true,
  removable = false,
  searchable = false,
  sortable = true,
  showCount = true,
  showDescription = false,
  showPopular = false,
  showTrending = false,
  maxTags,
  className,
  tagClassName,
  onTagClick,
  onTagRemove,
  onTagAdd,
  enableAdd = false,
  enableFilter = false,
  placeholder = 'Search tags...',
  emptyMessage = 'No tags found',
  loading = false,
  categoryFilter,
  popularityThreshold = 10
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'count' | 'popular'>('name');
  const [showAll, setShowAll] = useState(false);
  const [isAddingTag, setIsAddingTag] = useState(false);

  // Filter and sort tags
  const filteredAndSortedTags = useMemo(() => {
    let result = [...tags];

    // Apply search filter
    if (searchQuery) {
      result = result.filter(tag =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tag.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter) {
      result = result.filter(tag => tag.category === categoryFilter);
    }

    // Sort tags
    if (sortable) {
      switch (sortBy) {
        case 'name':
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'count':
          result.sort((a, b) => b.count - a.count);
          break;
        case 'popular':
          result.sort((a, b) => {
            const aPopular = a.count >= popularityThreshold ? 1 : 0;
            const bPopular = b.count >= popularityThreshold ? 1 : 0;
            if (aPopular !== bPopular) return bPopular - aPopular;
            return b.count - a.count;
          });
          break;
      }
    }

    // Apply max tags limit
    if (maxTags && !showAll) {
      result = result.slice(0, maxTags);
    }

    return result;
  }, [tags, searchQuery, categoryFilter, sortBy, maxTags, showAll, popularityThreshold, sortable]);

  // Popular tags
  const popularTags = useMemo(() => {
    return tags
      .filter(tag => tag.count >= popularityThreshold)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [tags, popularityThreshold]);

  // Trending tags (simulate with recent high-count tags)
  const trendingTags = useMemo(() => {
    return tags
      .filter(tag => tag.count >= 5)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [tags]);

  const handleTagClick = (tag: BlogTag) => {
    if (clickable && onTagClick) {
      onTagClick(tag);
    }
  };

  const handleTagRemove = (tag: BlogTag, e: React.MouseEvent) => {
    e.stopPropagation();
    if (removable && onTagRemove) {
      onTagRemove(tag);
    }
  };

  const handleAddTag = () => {
    if (newTagName.trim() && onTagAdd) {
      onTagAdd(newTagName.trim());
      setNewTagName('');
      setIsAddingTag(false);
    }
  };

  const getTagColor = (tag: BlogTag) => {
    if (tag.color && tagColorSchemes[tag.color as keyof typeof tagColorSchemes]) {
      return tagColorSchemes[tag.color as keyof typeof tagColorSchemes];
    }
    return tagColorSchemes[color];
  };

  const formatCount = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  // Tag component
  const TagComponent: React.FC<{ tag: BlogTag; index?: number }> = ({ tag, index = 0 }) => {
    const colorScheme = getTagColor(tag);
    const isSelected = selectedTags.includes(tag.id);
    const isPopular = tag.count >= popularityThreshold;

    const tagContent = (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.05 }}
        className={cn(
          'inline-flex items-center rounded-full border transition-all duration-200',
          sizeConfig[size].tag,
          sizeConfig[size].gap,
          colorScheme.bg,
          colorScheme.text,
          colorScheme.border,
          clickable && colorScheme.hover,
          clickable && 'cursor-pointer',
          isSelected && 'ring-2 ring-blue-500 ring-offset-2',
          tagClassName
        )}
        onClick={() => handleTagClick(tag)}
        whileHover={clickable ? { scale: 1.05 } : undefined}
        whileTap={clickable ? { scale: 0.95 } : undefined}
      >
        <Hash size={sizeConfig[size].icon} className="opacity-60" />
        
        <span className="font-medium">{tag.name}</span>
        
        {showCount && (
          <Badge
            variant="secondary"
            className="ml-1 text-xs bg-white/50 dark:bg-black/20 text-inherit border-0"
          >
            {formatCount(tag.count)}
          </Badge>
        )}

        {isPopular && showPopular && (
          <TrendingUp 
            size={sizeConfig[size].icon - 2} 
            className="text-orange-500 ml-1" 
          />
        )}

        {removable && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-1 h-4 w-4 p-0 hover:bg-white/20"
            onClick={(e) => handleTagRemove(tag, e)}
          >
            <X size={sizeConfig[size].icon - 2} />
          </Button>
        )}
      </motion.div>
    );

    if (showDescription && tag.description) {
      return (
        <TooltipProvider>
          <Tooltip content="Clear all tags">
            <TooltipTrigger asChild>
              {tagContent}
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{tag.description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return tagContent;
  };

  // Render search and filters
  const renderControls = () => {
    if (!searchable && !enableFilter && !enableAdd) return null;

    return (
      <div className="mb-4 space-y-2">
        {(searchable || enableAdd) && (
          <div className="flex gap-2">
            {searchable && (
              <div className="relative flex-1">
                <Search 
                  size={16} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                />
                <Input
                  type="text"
                  placeholder={placeholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
            
            {enableAdd && (
              <div className="flex gap-2">
                {isAddingTag ? (
                  <>
                    <Input
                      type="text"
                      placeholder="Tag name"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddTag();
                        if (e.key === 'Escape') setIsAddingTag(false);
                      }}
                      className="w-32"
                      autoFocus
                    />
                    <Button size="sm" onClick={handleAddTag}>
                      Add
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setIsAddingTag(false)}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAddingTag(true)}
                  >
                    <Plus size={16} className="mr-1" />
                    Add Tag
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {enableFilter && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600 dark:text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'count' | 'popular')}
              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
              aria-label="Sort tags by"
            >
              <option value="name">Name</option>
              <option value="count">Usage Count</option>
              <option value="popular">Popularity</option>
            </select>
          </div>
        )}
      </div>
    );
  };

  // Render loading state
  if (loading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className={cn('flex flex-wrap', sizeConfig[size].gap)}>
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className={cn(
                'h-6 bg-gray-200 dark:bg-gray-700 rounded-full',
                i % 3 === 0 ? 'w-16' : i % 3 === 1 ? 'w-20' : 'w-12'
              )}
            />
          ))}
        </div>
      </div>
    );
  }

  // Render based on variant
  switch (variant) {
    case 'cloud':
      return (
        <div className={className}>
          {renderControls()}
          <div className="flex flex-wrap gap-2 justify-center">
            {filteredAndSortedTags.map((tag, index) => (
              <TagComponent key={tag.id} tag={tag} index={index} />
            ))}
          </div>
          {filteredAndSortedTags.length === 0 && (
            <p className="text-center text-gray-500 py-8">{emptyMessage}</p>
          )}
        </div>
      );

    case 'list':
      return (
        <div className={className}>
          {renderControls()}
          <div className="space-y-2">
            {filteredAndSortedTags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
              >
                <TagComponent tag={tag} />
                {showDescription && tag.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 ml-4 flex-1">
                    {tag.description}
                  </p>
                )}
              </div>
            ))}
          </div>
          {filteredAndSortedTags.length === 0 && (
            <p className="text-center text-gray-500 py-8">{emptyMessage}</p>
          )}
        </div>
      );

    case 'grid':
      return (
        <div className={className}>
          {renderControls()}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredAndSortedTags.map((tag) => (
              <div key={tag.id} className="flex justify-center">
                <TagComponent tag={tag} />
              </div>
            ))}
          </div>
          {filteredAndSortedTags.length === 0 && (
            <p className="text-center text-gray-500 py-8">{emptyMessage}</p>
          )}
        </div>
      );

    case 'card':
      return (
        <Card className={className}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Tag size={20} />
              Tags
              {tags.length > 0 && (
                <Badge variant="secondary">{tags.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderControls()}
            
            {showPopular && popularTags.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <TrendingUp size={14} />
                  Popular Tags
                </h4>
                <div className={cn('flex flex-wrap', sizeConfig[size].gap)}>
                  {popularTags.slice(0, 5).map((tag, index) => (
                    <TagComponent key={tag.id} tag={tag} index={index} />
                  ))}
                </div>
              </div>
            )}

            {showTrending && trendingTags.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <TrendingUp size={14} />
                  Trending
                </h4>
                <div className={cn('flex flex-wrap', sizeConfig[size].gap)}>
                  {trendingTags.map((tag, index) => (
                    <TagComponent key={tag.id} tag={tag} index={index} />
                  ))}
                </div>
              </div>
            )}

            <div className={cn('flex flex-wrap', sizeConfig[size].gap)}>
              <AnimatePresence>
                {filteredAndSortedTags.map((tag, index) => (
                  <TagComponent key={tag.id} tag={tag} index={index} />
                ))}
              </AnimatePresence>
            </div>

            {maxTags && tags.length > maxTags && (
              <div className="mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAll(!showAll)}
                  className="text-sm"
                >
                  {showAll ? (
                    <>
                      <ChevronUp size={16} className="mr-1" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown size={16} className="mr-1" />
                      Show All ({tags.length - maxTags} more)
                    </>
                  )}
                </Button>
              </div>
            )}

            {filteredAndSortedTags.length === 0 && (
              <p className="text-center text-gray-500 py-4">{emptyMessage}</p>
            )}
          </CardContent>
        </Card>
      );

    case 'minimal':
      return (
        <div className={cn('flex flex-wrap', sizeConfig[size].gap, className)}>
          {filteredAndSortedTags.map((tag) => (
            <span
              key={tag.id}
              className={cn(
                'inline-flex items-center gap-1 px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded',
                clickable && 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
              onClick={() => handleTagClick(tag)}
            >
              #{tag.name}
              {showCount && (
                <span className="text-xs opacity-60">({tag.count})</span>
              )}
            </span>
          ))}
        </div>
      );

    case 'compact':
      return (
        <div className={cn('space-y-1', className)}>
          {renderControls()}
          <div className={cn('flex flex-wrap', sizeConfig[size].gap)}>
            {filteredAndSortedTags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className={cn(
                  'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700',
                  tagClassName
                )}
                onClick={() => handleTagClick(tag)}
              >
                #{tag.name}
                {showCount && ` (${tag.count})`}
              </Badge>
            ))}
          </div>
        </div>
      );

    default:
      return (
        <div className={className}>
          {renderControls()}
          <div className={cn('flex flex-wrap', sizeConfig[size].gap)}>
            {filteredAndSortedTags.map((tag, index) => (
              <TagComponent key={tag.id} tag={tag} index={index} />
            ))}
          </div>
          {maxTags && tags.length > maxTags && !showAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(true)}
              className="mt-2"
            >
              <ChevronDown size={16} className="mr-1" />
              Show {tags.length - maxTags} more tags
            </Button>
          )}
          {filteredAndSortedTags.length === 0 && (
            <p className="text-center text-gray-500 py-8">{emptyMessage}</p>
          )}
        </div>
      );
  }
};

// Utility components
export const PopularTags: React.FC<{ 
  tags: BlogTag[]; 
  onTagClick?: (tag: BlogTag) => void; 
  className?: string 
}> = ({ tags, onTagClick, className }) => (
  <BlogTags
    tags={tags}
    variant="card"
    showPopular={true}
    onTagClick={onTagClick}
    className={className}
  />
);

export const TagCloud: React.FC<{ 
  tags: BlogTag[]; 
  onTagClick?: (tag: BlogTag) => void; 
  className?: string 
}> = ({ tags, onTagClick, className }) => (
  <BlogTags
    tags={tags}
    variant="cloud"
    size="md"
    showCount={true}
    onTagClick={onTagClick}
    className={className}
  />
);

export const TagSelector: React.FC<{
  tags: BlogTag[];
  selectedTags: string[];
  onTagClick: (tag: BlogTag) => void;
  onTagRemove: (tag: BlogTag) => void;
  className?: string;
}> = ({ tags, selectedTags, onTagClick, onTagRemove, className }) => (
  <BlogTags
    tags={tags}
    selectedTags={selectedTags}
    variant="default"
    clickable={true}
    removable={true}
    searchable={true}
    enableFilter={true}
    onTagClick={onTagClick}
    onTagRemove={onTagRemove}
    className={className}
  />
);

export const CompactTags: React.FC<{ 
  tags: BlogTag[]; 
  maxTags?: number;
  onTagClick?: (tag: BlogTag) => void; 
  className?: string 
}> = ({ tags, maxTags = 5, onTagClick, className }) => (
  <BlogTags
    tags={tags}
    variant="compact"
    size="sm"
    maxTags={maxTags}
    showCount={false}
    onTagClick={onTagClick}
    className={className}
  />
);

export default BlogTags;