'use client';

import React, { useState, useMemo } from 'react';
import { Clock, Eye, ArrowRight, Bookmark, Share2, TrendingUp, Grid, List, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

// Types
export interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  featuredImage?: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    username?: string;
  };
  publishedAt: string;
  readingTime?: number;
  viewCount?: number;
  bookmarkCount?: number;
  shareCount?: number;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  similarity?: number;
  isBookmarked?: boolean;
  isPremium?: boolean;
  status?: 'published' | 'draft' | 'archived';
}

export interface RelatedPostsProps {
  currentPostId: string;
  posts?: RelatedPost[];
  maxPosts?: number;
  variant?: 'default' | 'compact' | 'grid' | 'list' | 'card' | 'minimal';
  layout?: 'horizontal' | 'vertical';
  showAuthor?: boolean;
  showDate?: boolean;
  showReadingTime?: boolean;
  showViewCount?: boolean;
  showBookmark?: boolean;
  showShare?: boolean;
  showTags?: boolean;
  showExcerpt?: boolean;
  showImage?: boolean;
  sortBy?: 'similarity' | 'date' | 'views' | 'bookmarks';
  filterBy?: 'tags' | 'category' | 'author' | 'all';
  className?: string;
  cardClassName?: string;
  onPostClick?: (post: RelatedPost) => void;
  onBookmark?: (post: RelatedPost) => void;
  onShare?: (post: RelatedPost) => void;
  loading?: boolean;
  error?: string | null;
  enableLazyLoad?: boolean;
  customRecommendation?: (currentPost: string, posts: RelatedPost[]) => RelatedPost[];
}

// Recommendation algorithms
const recommendationAlgorithms = {
  similarity: (currentPostId: string, posts: RelatedPost[]) => {
    return posts
      .filter(post => post.id !== currentPostId)
      .sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
  },
  
  tags: (currentPostId: string, posts: RelatedPost[]) => {
    const currentPost = posts.find(p => p.id === currentPostId);
    if (!currentPost) return posts.filter(p => p.id !== currentPostId);
    
    const currentTags = currentPost.tags.map(t => t.id);
    
    return posts
      .filter(post => post.id !== currentPostId)
      .map(post => ({
        ...post,
        tagMatch: post.tags.filter(tag => currentTags.includes(tag.id)).length
      }))
      .sort((a, b) => (b.tagMatch || 0) - (a.tagMatch || 0));
  },
  
  category: (currentPostId: string, posts: RelatedPost[]) => {
    const currentPost = posts.find(p => p.id === currentPostId);
    if (!currentPost) return posts.filter(p => p.id !== currentPostId);
    
    const currentCategories = currentPost.categories.map(c => c.id);
    
    return posts
      .filter(post => post.id !== currentPostId)
      .map(post => ({
        ...post,
        categoryMatch: post.categories.filter(cat => currentCategories.includes(cat.id)).length
      }))
      .sort((a, b) => (b.categoryMatch || 0) - (a.categoryMatch || 0));
  },
  
  author: (currentPostId: string, posts: RelatedPost[]) => {
    const currentPost = posts.find(p => p.id === currentPostId);
    if (!currentPost) return posts.filter(p => p.id !== currentPostId);
    
    return posts
      .filter(post => post.id !== currentPostId)
      .sort((a, b) => {
        if (a.author.id === currentPost.author.id && b.author.id !== currentPost.author.id) return -1;
        if (b.author.id === currentPost.author.id && a.author.id !== currentPost.author.id) return 1;
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });
  },
  
  popular: (currentPostId: string, posts: RelatedPost[]) => {
    return posts
      .filter(post => post.id !== currentPostId)
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
  },
  
  recent: (currentPostId: string, posts: RelatedPost[]) => {
    return posts
      .filter(post => post.id !== currentPostId)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }
};

export const RelatedPosts: React.FC<RelatedPostsProps> = ({
  currentPostId,
  posts = [],
  maxPosts = 6,
  variant = 'default',
  layout = 'vertical',
  showAuthor = true,
  showDate = true,
  showReadingTime = true,
  showViewCount = false,
  showBookmark = true,
  showShare = true,
  showTags = true,
  showExcerpt = true,
  showImage = true,
  sortBy = 'similarity',
  filterBy = 'all',
  className,
  cardClassName,
  onPostClick,
  onBookmark,
  onShare,
  loading = false,
  error = null,
  enableLazyLoad = false,
  customRecommendation
}) => {
  const [displayLayout, setDisplayLayout] = useState<'grid' | 'list'>('grid');
  const [visiblePosts, setVisiblePosts] = useState(4);

  // Get recommended posts
  const recommendedPosts = useMemo(() => {
    if (customRecommendation) {
      return customRecommendation(currentPostId, posts).slice(0, maxPosts);
    }

    let algorithm = recommendationAlgorithms.similarity;
    
    switch (filterBy) {
      case 'tags':
        algorithm = recommendationAlgorithms.tags;
        break;
      case 'category':
        algorithm = recommendationAlgorithms.category;
        break;
      case 'author':
        algorithm = recommendationAlgorithms.author;
        break;
      default:
        switch (sortBy) {
          case 'date':
            algorithm = recommendationAlgorithms.recent;
            break;
          case 'views':
            algorithm = recommendationAlgorithms.popular;
            break;
          case 'similarity':
          default:
            algorithm = recommendationAlgorithms.similarity;
            break;
        }
    }

    return algorithm(currentPostId, posts).slice(0, maxPosts);
  }, [currentPostId, posts, maxPosts, sortBy, filterBy, customRecommendation]);

  const handlePostClick = (post: RelatedPost) => {
    if (onPostClick) {
      onPostClick(post);
    }
  };

  const handleBookmark = (post: RelatedPost, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onBookmark) {
      onBookmark(post);
    }
  };

  const handleShare = (post: RelatedPost, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onShare) {
      onShare(post);
    }
  };

  const loadMorePosts = () => {
    setVisiblePosts(prev => Math.min(prev + 4, recommendedPosts.length));
  };

  // Post card component
  const PostCard: React.FC<{ post: RelatedPost; index: number }> = ({ post, index }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={cn(
          'group cursor-pointer transition-all duration-200',
          cardClassName
        )}
        onClick={() => handlePostClick(post)}
      >
        <Card className="h-full hover:shadow-lg transition-shadow duration-200">
          {showImage && post.featuredImage && (
            <div className="relative aspect-video overflow-hidden rounded-t-lg">
              {!imageLoaded && !imageError && (
                <Skeleton className="absolute inset-0" />
              )}
              
              <Image
                src={post.featuredImage}
                alt={post.title}
                fill
                className={cn(
                  'object-cover transition-all duration-300 group-hover:scale-105',
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                )}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true);
                  setImageLoaded(true);
                }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              
              {imageError && (
                <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <div className="text-gray-400 text-center">
                    <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 dark:bg-gray-700 rounded" />
                    <p className="text-sm">Image not available</p>
                  </div>
                </div>
              )}

              {post.isPremium && (
                <Badge 
                  className="absolute top-2 right-2 bg-yellow-500 text-white"
                  variant="default"
                >
                  Premium
                </Badge>
              )}

              {post.similarity && post.similarity > 0.8 && (
                <div className="absolute top-2 left-2">
                  <TooltipProvider>
                    <Tooltip content="View post details">
                      <TooltipTrigger asChild>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <TrendingUp size={12} className="mr-1" />
                          {Math.round(post.similarity * 100)}%
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Similarity match</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
          )}

          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Title */}
              <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {post.title}
              </h3>

              {/* Excerpt */}
              {showExcerpt && post.excerpt && (
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                  {post.excerpt}
                </p>
              )}

              {/* Tags */}
              {showTags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {post.tags.slice(0, 3).map((tag) => (
                    <Badge 
                      key={tag.id} 
                      variant="secondary" 
                      className="text-xs"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                  {post.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{post.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Meta information */}
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-3">
                  {showAuthor && (
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={post.author.avatar} alt={post.author.name} />
                        <AvatarFallback className="text-xs">
                          {post.author.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{post.author.name}</span>
                    </div>
                  )}

                  {showDate && (
                    <div className="flex items-center space-x-1">
                      <Clock size={14} />
                      <span>{formatDistanceToNow(new Date(post.publishedAt))} ago</span>
                    </div>
                  )}

                  {showReadingTime && post.readingTime && (
                    <span>{post.readingTime} min read</span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {showViewCount && post.viewCount && (
                    <div className="flex items-center space-x-1">
                      <Eye size={14} />
                      <span>{post.viewCount}</span>
                    </div>
                  )}

                  {showBookmark && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={(e) => handleBookmark(post, e)}
                    >
                      <Bookmark 
                        size={14} 
                        className={cn(
                          'transition-colors',
                          post.isBookmarked ? 'fill-current text-blue-600' : 'text-gray-400'
                        )}
                      />
                    </Button>
                  )}

                  {showShare && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={(e) => handleShare(post, e)}
                    >
                      <Share2 size={14} className="text-gray-400" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Compact post component
  const CompactPost: React.FC<{ post: RelatedPost; index: number }> = ({ post, index }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group cursor-pointer"
      onClick={() => handlePostClick(post)}
    >
      <div className="flex space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
        {showImage && post.featuredImage && (
          <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {post.title}
          </h4>
          
          <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            {showAuthor && (
              <span>{post.author.name}</span>
            )}
            {showDate && (
              <span>{formatDistanceToNow(new Date(post.publishedAt))} ago</span>
            )}
            {showReadingTime && post.readingTime && (
              <span>{post.readingTime} min</span>
            )}
          </div>
        </div>

        <div className="flex items-center">
          <ArrowRight size={16} className="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
        </div>
      </div>
    </motion.div>
  );

  // Loading state
  if (loading) {
    return (
      <div className={className}>
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className={cn(
            'grid gap-4',
            variant === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
          )}>
            {Array.from({ length: 3 }, (_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-video" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn('text-center py-8', className)}>
        <div className="text-red-500 dark:text-red-400 mb-2">
          <AlertTriangle size={48} className="mx-auto mb-2" />
          <p className="font-medium">Failed to load related posts</p>
          <p className="text-sm opacity-75">{error}</p>
        </div>
      </div>
    );
  }

  // No posts state
  if (recommendedPosts.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <div className="text-gray-500 dark:text-gray-400">
          <Grid size={48} className="mx-auto mb-4 opacity-50" />
          <p className="font-medium">No related posts found</p>
          <p className="text-sm">Try adjusting your filters or check back later.</p>
        </div>
      </div>
    );
  }

  const postsToDisplay = enableLazyLoad ? recommendedPosts.slice(0, visiblePosts) : recommendedPosts;

  return (
    <div className={className}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={20} />
              Related Posts
              <Badge variant="secondary">{recommendedPosts.length}</Badge>
            </CardTitle>

            {variant === 'default' && (
              <div className="flex items-center space-x-2">
                <Button
                  variant={displayLayout === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDisplayLayout('grid')}
                >
                  <Grid size={16} />
                </Button>
                <Button
                  variant={displayLayout === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDisplayLayout('list')}
                >
                  <List size={16} />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            {variant === 'compact' || displayLayout === 'list' ? (
              <div className="space-y-2">
                {postsToDisplay.map((post, index) => (
                  <CompactPost key={post.id} post={post} index={index} />
                ))}
              </div>
            ) : (
              <div className={cn(
                'grid gap-4',
                layout === 'horizontal' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              )}>
                {postsToDisplay.map((post, index) => (
                  <PostCard key={post.id} post={post} index={index} />
                ))}
              </div>
            )}
          </AnimatePresence>

          {enableLazyLoad && visiblePosts < recommendedPosts.length && (
            <div className="mt-6 text-center">
              <Button onClick={loadMorePosts} variant="outline">
                Load More Posts ({recommendedPosts.length - visiblePosts} remaining)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Utility components
export const SimilarPosts: React.FC<{
  currentPostId: string;
  posts: RelatedPost[];
  maxPosts?: number;
  className?: string;
}> = ({ currentPostId, posts, maxPosts = 4, className }) => (
  <RelatedPosts
    currentPostId={currentPostId}
    posts={posts}
    maxPosts={maxPosts}
    sortBy="similarity"
    variant="compact"
    className={className}
  />
);

export const AuthorPosts: React.FC<{
  currentPostId: string;
  posts: RelatedPost[];
  maxPosts?: number;
  className?: string;
}> = ({ currentPostId, posts, maxPosts = 4, className }) => (
  <RelatedPosts
    currentPostId={currentPostId}
    posts={posts}
    maxPosts={maxPosts}
    filterBy="author"
    showTags={false}
    className={className}
  />
);

export const PopularPosts: React.FC<{
  currentPostId: string;
  posts: RelatedPost[];
  maxPosts?: number;
  className?: string;
}> = ({ currentPostId, posts, maxPosts = 6, className }) => (
  <RelatedPosts
    currentPostId={currentPostId}
    posts={posts}
    maxPosts={maxPosts}
    sortBy="views"
    showViewCount={true}
    className={className}
  />
);

export default RelatedPosts;
