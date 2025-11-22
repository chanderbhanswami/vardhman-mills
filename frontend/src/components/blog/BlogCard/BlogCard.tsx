/**
 * BlogCard Component - Vardhman Mills Frontend
 * 
 * Feature-rich blog card component for displaying blog posts
 * with comprehensive interactive features and responsive design.
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Eye,
  Clock,
  ArrowRight,
  MoreVertical
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Image } from '@/components/ui/Image';
import { Tooltip } from '@/components/ui/Tooltip';
import toast from 'react-hot-toast';

// Types
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  featuredImageAlt?: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    bio?: string;
    role?: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
    color?: string;
  };
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  publishedAt: string;
  updatedAt: string;
  readingTime: number;
  views: number;
  likes: number;
  comments: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  isFeatured?: boolean;
  isPremium?: boolean;
  status: 'draft' | 'published' | 'archived';
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
}

export interface BlogCardProps {
  post: BlogPost;
  variant?: 'default' | 'compact' | 'featured' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showAuthor?: boolean;
  showCategory?: boolean;
  showTags?: boolean;
  showStats?: boolean;
  showActions?: boolean;
  showProgress?: boolean;
  className?: string;
  onLike?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  onShare?: (post: BlogPost) => void;
  onClick?: (post: BlogPost) => void;
}

/**
 * BlogCard Component
 * 
 * Comprehensive blog card with multiple variants,
 * interactive features, and responsive design.
 */
export const BlogCard: React.FC<BlogCardProps> = ({
  post,
  variant = 'default',
  size = 'md',
  showAuthor = true,
  showCategory = true,
  showTags = true,
  showStats = true,
  showActions = true,
  className = '',
  onLike,
  onBookmark,
  onShare,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);

  /**
   * Handle like action
   */
  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      onLike?.(post.id);
      toast.success(post.isLiked ? 'Removed from likes' : 'Added to likes');
    } catch {
      toast.error('Failed to update like status');
    }
  };

  /**
   * Handle bookmark action
   */
  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      onBookmark?.(post.id);
      toast.success(post.isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
    } catch {
      toast.error('Failed to update bookmark status');
    }
  };

  /**
   * Handle share action
   */
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: `/blog/${post.slug}`
        });
      } catch {
        // User cancelled sharing
      }
    } else {
      onShare?.(post);
    }
  };

  /**
   * Handle card click
   */
  const handleCardClick = () => {
    onClick?.(post);
  };

  /**
   * Get card size classes
   */
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-sm';
      case 'lg':
        return 'max-w-2xl';
      default:
        return 'max-w-md';
    }
  };

  /**
   * Get variant-specific layout
   */
  const getVariantLayout = () => {
    switch (variant) {
      case 'compact':
        return (
          <div className="flex space-x-4">
            <div className="flex-shrink-0">
              <div className="relative w-20 h-20 overflow-hidden rounded-lg">
                <Image
                  src={post.featuredImage}
                  alt={post.featuredImageAlt || post.title}
                  width={80}
                  height={80}
                  className="object-cover transition-transform duration-300 group-hover:scale-105 w-full h-full"
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="space-y-2">
                {showCategory && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs"
                    style={{ backgroundColor: post.category.color }}
                  >
                    {post.category.name}
                  </Badge>
                )}
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center text-xs text-gray-500 space-x-3">
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {post.readingTime} min
                  </span>
                  <span>{format(new Date(post.publishedAt), 'MMM d')}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'featured':
        return (
          <div className="space-y-6">
            <div className="relative h-64 overflow-hidden rounded-lg">
              <Image
                src={post.featuredImage}
                alt={post.featuredImageAlt || post.title}
                width={800}
                height={256}
                className="object-cover transition-transform duration-500 group-hover:scale-105 w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                {showCategory && (
                  <Badge 
                    variant="default" 
                    className="mb-3"
                    style={{ backgroundColor: post.category.color }}
                  >
                    {post.category.name}
                  </Badge>
                )}
                <h2 className="text-2xl font-bold text-white line-clamp-2 mb-2">
                  {post.title}
                </h2>
                <p className="text-gray-200 line-clamp-2 text-sm">
                  {post.excerpt}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              {showAuthor && (
                <div className="flex items-center space-x-3">
                  <Avatar
                    src={post.author.avatar}
                    alt={post.author.name}
                    size="sm"
                    fallback={post.author.name.charAt(0)}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{post.author.name}</p>
                    <p className="text-xs text-gray-500">{post.author.role}</p>
                  </div>
                </div>
              )}

              {showStats && (
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {post.views.toLocaleString()}
                  </span>
                  <span className="flex items-center">
                    <Heart className="w-4 h-4 mr-1" />
                    {post.likes.toLocaleString()}
                  </span>
                  <span className="flex items-center">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {post.comments.toLocaleString()}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {post.readingTime} min read
                  </span>
                </div>
              )}
            </div>
          </div>
        );

      case 'minimal':
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              {showCategory && (
                <Badge 
                  variant="outline" 
                  className="text-xs"
                >
                  {post.category.name}
                </Badge>
              )}
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {post.title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-3">
                {post.excerpt}
              </p>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}</span>
              <span>{post.readingTime} min read</span>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div className="relative h-48 overflow-hidden rounded-lg">
              <Image
                src={post.featuredImage}
                alt={post.featuredImageAlt || post.title}
                width={400}
                height={192}
                className="object-cover transition-transform duration-300 group-hover:scale-105 w-full h-full"
              />
              {post.isFeatured && (
                <div className="absolute top-3 left-3">
                  <Badge variant="default" className="bg-yellow-500 text-white">
                    Featured
                  </Badge>
                </div>
              )}
              {post.isPremium && (
                <div className="absolute top-3 right-3">
                  <Badge variant="default" className="bg-purple-600 text-white">
                    Premium
                  </Badge>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {showCategory && (
                <Badge 
                  variant="secondary"
                  style={{ backgroundColor: post.category.color }}
                >
                  {post.category.name}
                </Badge>
              )}

              <h3 className="text-xl font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {post.title}
              </h3>

              <p className="text-gray-600 line-clamp-3">
                {post.excerpt}
              </p>

              {showAuthor && (
                <div className="flex items-center space-x-3">
                  <Avatar
                    src={post.author.avatar}
                    alt={post.author.name}
                    size="sm"
                    fallback={post.author.name.charAt(0)}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{post.author.name}</p>
                    <div className="flex items-center text-xs text-gray-500 space-x-2">
                      <span>{formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}</span>
                      <span>•</span>
                      <span>{post.readingTime} min read</span>
                    </div>
                  </div>
                </div>
              )}

              {showTags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag.id} variant="outline" className="text-xs">
                      #{tag.name}
                    </Badge>
                  ))}
                  {post.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{post.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              {showStats && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {post.views.toLocaleString()}
                    </span>
                    <span className="flex items-center">
                      <Heart className="w-4 h-4 mr-1" />
                      {post.likes.toLocaleString()}
                    </span>
                    <span className="flex items-center">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {post.comments.toLocaleString()}
                    </span>
                  </div>

                  {showActions && (
                    <div className="flex items-center space-x-2">
                      <Tooltip content={post.isLiked ? 'Unlike' : 'Like'}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleLike}
                          className={`p-2 ${post.isLiked ? 'text-red-500' : 'text-gray-500'}`}
                        >
                          <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                        </Button>
                      </Tooltip>

                      <Tooltip content={post.isBookmarked ? 'Remove bookmark' : 'Bookmark'}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleBookmark}
                          className={`p-2 ${post.isBookmarked ? 'text-blue-500' : 'text-gray-500'}`}
                        >
                          <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
                        </Button>
                      </Tooltip>

                      <Tooltip content="Share">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleShare}
                          className="p-2 text-gray-500"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </Tooltip>

                      <Tooltip content="More options">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-2 text-gray-500"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigator.clipboard.writeText(`${window.location.origin}/blog/${post.slug}`);
                            toast.success('Link copied to clipboard');
                          }}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                    </div>
                  )}
                </div>
              )}


            </div>
          </div>
        );
    }
  };

  return (
    <Link href={`/blog/${post.slug}`} className="block">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -2 }}
        className={`${getSizeClasses()} ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        <Card className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
          <div className="p-6">
            {getVariantLayout()}

            <AnimatePresence>
              {isHovered && variant === 'default' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-4 pt-4 border-t border-gray-100"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full group-hover:bg-blue-50 group-hover:border-blue-200"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </motion.div>
    </Link>
  );
};

export default BlogCard;
