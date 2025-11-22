'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/Card';
import { Separator } from '@/components/ui/Separator';
import { cn } from '@/lib/utils';

// Dynamic imports to avoid circular dependencies
const BlogAuthor = dynamic(() => import('./BlogAuthor').then(mod => ({ default: mod.BlogAuthor })), { ssr: false });
const BlogAuthorAvatar = dynamic(() => import('./BlogAuthorAvatar').then(mod => ({ default: mod.BlogAuthorAvatar })), { ssr: false });
const BlogBookmark = dynamic(() => import('./BlogBookmark').then(mod => ({ default: mod.BlogBookmark })), { ssr: false });
const BlogContent = dynamic(() => import('./BlogContent').then(mod => ({ default: mod.BlogContent })), { ssr: false });
const BlogLike = dynamic(() => import('./BlogLike').then(mod => ({ default: mod.BlogLike })), { ssr: false });
const BlogShare = dynamic(() => import('./BlogShare').then(mod => ({ default: mod.BlogShare })), { ssr: false });
const BlogTitle = dynamic(() => import('./BlogTitle').then(mod => ({ default: mod.BlogTitle })), { ssr: false });

// Types
export interface Author {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
  bio?: string;
  email?: string;
  website?: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  verified?: boolean;
  role?: string;
  followerCount?: number;
  postCount?: number;
}

export interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author: Author;
  publishedAt: string;
  updatedAt?: string;
  readingTime?: number;
  viewCount?: number;
  likeCount?: number;
  bookmarkCount?: number;
  shareCount?: number;
  commentCount?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  isPublished?: boolean;
  isPremium?: boolean;
  featuredImage?: string;
  tags?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  meta?: {
    description?: string;
    keywords?: string[];
    ogImage?: string;
  };
}

export interface BlogPostProps {
  post: BlogPostData;
  variant?: 'default' | 'card' | 'compact' | 'full' | 'minimal';
  showAuthor?: boolean;
  showAuthorAvatar?: boolean;
  showActions?: boolean;
  showMeta?: boolean;
  showContent?: boolean;
  showExcerpt?: boolean;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
  onLike?: (postId: string, isLiked: boolean) => void;
  onBookmark?: (postId: string, isBookmarked: boolean) => void;
  onShare?: (post: BlogPostData) => void;
  onAuthorClick?: (author: Author) => void;
  enableInteractions?: boolean;
  truncateContent?: number;
  showReadMore?: boolean;
  loading?: boolean;
}

export const BlogPost: React.FC<BlogPostProps> = ({
  post,
  variant = 'default',
  showAuthor = true,
  showAuthorAvatar = true,
  showActions = true,
  showMeta = true,
  showContent = true,
  showExcerpt = false,
  className,
  contentClassName,
  headerClassName,
  footerClassName,
  onLike,
  onBookmark,
  onShare,
  onAuthorClick,
  enableInteractions = true,
  truncateContent,
  showReadMore = false
}) => {
  // Handle interactions
  const handleLike = () => {
    if (onLike && enableInteractions) {
      onLike(post.id, !post.isLiked);
    }
  };

  const handleBookmark = () => {
    if (onBookmark && enableInteractions) {
      onBookmark(post.id, !post.isBookmarked);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(post);
    }
  };

  const handleAuthorClick = () => {
    if (onAuthorClick) {
      onAuthorClick(post.author);
    }
  };

  // Render based on variant
  switch (variant) {
    case 'card':
      return (
        <Card className={cn('overflow-hidden', className)}>
          <CardContent className="p-0">
            {/* Header */}
            <div className={cn('p-6 pb-4', headerClassName)}>
              <BlogTitle
                title={post.title}
                slug={post.slug}
                variant="card"
                className="mb-3"
              />
              
              {showAuthor && (
                <div className="flex items-center justify-between">
                  <BlogAuthor
                    author={post.author}
                    publishedAt={post.publishedAt}
                    readingTime={post.readingTime}
                    showAvatar={showAuthorAvatar}
                    showMeta={showMeta}
                    onAuthorClick={handleAuthorClick}
                    variant="compact"
                  />
                  
                  {showAuthorAvatar && (
                    <BlogAuthorAvatar
                      author={post.author}
                      size="md"
                      showVerified={true}
                      onClick={handleAuthorClick}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Content */}
            {(showContent || showExcerpt) && (
              <div className={cn('px-6 pb-4', contentClassName)}>
                {showExcerpt && post.excerpt ? (
                  <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                    {post.excerpt}
                  </p>
                ) : showContent ? (
                  <BlogContent
                    content={post.content}
                    truncate={truncateContent}
                    showReadMore={showReadMore}
                    className="prose prose-sm dark:prose-invert max-w-none"
                  />
                ) : null}
              </div>
            )}

            {/* Actions */}
            {showActions && (
              <>
                <Separator />
                <div className={cn('p-4 flex items-center justify-between', footerClassName)}>
                  <div className="flex items-center space-x-4">
                    <BlogLike
                      postId={post.id}
                      initialLikes={[{
                        id: 'like',
                        type: 'like',
                        count: post.likeCount || 0,
                        hasUserLiked: post.isLiked || false
                      }]}
                      onLike={handleLike}
                      variant="compact"
                    />
                    
                    <BlogBookmark
                      postId={post.id}
                      isBookmarked={post.isBookmarked}
                      bookmarkCount={post.bookmarkCount}
                      onBookmark={handleBookmark}
                      variant="default"
                    />
                  </div>

                  <BlogShare
                    postId={post.id}
                    shareData={{
                      url: `${window.location.origin}/blog/${post.slug}`,
                      title: post.title,
                      description: post.excerpt
                    }}
                    onShare={handleShare}
                    variant="compact"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      );

    case 'compact':
      return (
        <div className={cn('p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0', className)}>
          <div className="flex items-start space-x-3">
            {showAuthorAvatar && (
              <BlogAuthorAvatar
                author={post.author}
                size="sm"
                onClick={handleAuthorClick}
                className="flex-shrink-0"
              />
            )}
            
            <div className="flex-1 min-w-0">
              <BlogTitle
                title={post.title}
                slug={post.slug}
                variant="minimal"
                className="mb-1"
              />
              
              {showAuthor && (
                <BlogAuthor
                  author={post.author}
                  publishedAt={post.publishedAt}
                  readingTime={post.readingTime}
                  showAvatar={false}
                  showMeta={showMeta}
                  onAuthorClick={handleAuthorClick}
                  variant="minimal"
                  className="mb-2"
                />
              )}

              {showExcerpt && post.excerpt && (
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-2">
                  {post.excerpt}
                </p>
              )}

              {showActions && (
                <div className="flex items-center space-x-4">
                  <BlogLike
                    postId={post.id}
                    initialLikes={[{
                      id: 'like',
                      type: 'like',
                      count: post.likeCount || 0,
                      hasUserLiked: post.isLiked || false
                    }]}
                    onLike={handleLike}
                    variant="minimal"
                    size="sm"
                  />
                  
                  <BlogBookmark
                    postId={post.id}
                    isBookmarked={post.isBookmarked}
                    onBookmark={handleBookmark}
                    disabled={!enableInteractions}
                    variant="minimal"
                    size="sm"
                  />
                  
                  <BlogShare
                    postId={post.id}
                    shareData={{
                      url: `${window.location.origin}/blog/${post.slug}`,
                      title: post.title,
                      description: post.excerpt
                    }}
                    onShare={handleShare}
                    variant="minimal"
                    size="sm"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      );

    case 'minimal':
      return (
        <div className={cn('space-y-2', className)}>
          <BlogTitle
            title={post.title}
            slug={post.slug}
            variant="minimal"
          />
          
          {showAuthor && (
            <BlogAuthor
              author={post.author}
              publishedAt={post.publishedAt}
              showAvatar={false}
              showMeta={false}
              onAuthorClick={handleAuthorClick}
              variant="minimal"
            />
          )}
        </div>
      );

    case 'full':
      return (
        <article className={cn('max-w-4xl mx-auto', className)}>
          {/* Header */}
          <header className={cn('mb-8 text-center', headerClassName)}>
            <BlogTitle
              title={post.title}
              slug={post.slug}
              variant="hero"
              className="mb-6"
            />
            
            {showAuthor && (
              <div className="flex items-center justify-center space-x-4 mb-6">
                {showAuthorAvatar && (
                  <BlogAuthorAvatar
                    author={post.author}
                    size="lg"
                    showVerified={true}
                    onClick={handleAuthorClick}
                  />
                )}
                
                <BlogAuthor
                  author={post.author}
                  publishedAt={post.publishedAt}
                  updatedAt={post.updatedAt}
                  readingTime={post.readingTime}
                  showAvatar={false}
                  showMeta={showMeta}
                  onAuthorClick={handleAuthorClick}
                  variant="detailed"
                />
              </div>
            )}

            {showActions && (
              <div className="flex items-center justify-center space-x-6">
                <BlogLike
                  postId={post.id}
                  initialLikes={[{
                    id: 'like',
                    type: 'like',
                    count: post.likeCount || 0,
                    hasUserLiked: post.isLiked || false
                  }]}
                  onLike={handleLike}
                  variant="detailed"
                />
                
                <BlogBookmark
                  postId={post.id}
                  isBookmarked={post.isBookmarked}
                  bookmarkCount={post.bookmarkCount}
                  onBookmark={handleBookmark}
                  disabled={!enableInteractions}
                  variant="detailed"
                />
                
                <BlogShare
                  postId={post.id}
                  shareData={{
                    url: `${window.location.origin}/blog/${post.slug}`,
                    title: post.title,
                    description: post.excerpt
                  }}
                  onShare={handleShare}
                  variant="detailed"
                />
              </div>
            )}
          </header>

          {/* Content */}
          {showContent && (
            <div className={cn('mb-8', contentClassName)}>
              <BlogContent
                content={post.content}
                className="prose prose-lg dark:prose-invert max-w-none"
              />
            </div>
          )}

          {/* Footer */}
          {showActions && (
            <footer className={cn('pt-8 border-t border-gray-200 dark:border-gray-700', footerClassName)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <BlogLike
                    postId={post.id}
                    initialLikes={[{
                      id: 'like',
                      type: 'like',
                      count: post.likeCount || 0,
                      hasUserLiked: post.isLiked || false
                    }]}
                    onLike={handleLike}
                    variant="detailed"
                    showCounts={true}
                  />
                  
                  <BlogBookmark
                    postId={post.id}
                    isBookmarked={post.isBookmarked}
                    bookmarkCount={post.bookmarkCount}
                    onBookmark={handleBookmark}
                    disabled={!enableInteractions}
                    variant="detailed"
                    showCount={true}
                  />
                </div>

                <BlogShare
                  postId={post.id}
                  shareData={{
                    url: `${window.location.origin}/blog/${post.slug}`,
                    title: post.title,
                    description: post.excerpt
                  }}
                  onShare={handleShare}
                  variant="detailed"
                  showLabels={true}
                />
              </div>
            </footer>
          )}
        </article>
      );

    default:
      return (
        <article className={cn('space-y-6', className)}>
          {/* Header */}
          <header className={cn('space-y-4', headerClassName)}>
            <BlogTitle
              title={post.title}
              slug={post.slug}
              variant="default"
            />
            
            {showAuthor && (
              <BlogAuthor
                author={post.author}
                publishedAt={post.publishedAt}
                updatedAt={post.updatedAt}
                readingTime={post.readingTime}
                showAvatar={showAuthorAvatar}
                showMeta={showMeta}
                onAuthorClick={handleAuthorClick}
              />
            )}
          </header>

          {/* Content */}
          {(showContent || showExcerpt) && (
            <div className={contentClassName}>
              {showExcerpt && post.excerpt ? (
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                  {post.excerpt}
                </p>
              ) : showContent ? (
                <BlogContent
                  content={post.content}
                  truncate={truncateContent}
                  showReadMore={showReadMore}
                  className="prose dark:prose-invert max-w-none"
                />
              ) : null}
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <footer className={cn('flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700', footerClassName)}>
              <div className="flex items-center space-x-4">
                <BlogLike
                  postId={post.id}
                  initialLikes={[{
                    id: 'like',
                    type: 'like',
                    count: post.likeCount || 0,
                    hasUserLiked: post.isLiked || false
                  }]}
                  onLike={handleLike}
                />
                
                <BlogBookmark
                  postId={post.id}
                  isBookmarked={post.isBookmarked}
                  bookmarkCount={post.bookmarkCount}
                  onBookmark={handleBookmark}
                  disabled={!enableInteractions}
                />
              </div>

              <BlogShare
                postId={post.id}
                shareData={{
                  url: `${window.location.origin}/blog/${post.slug}`,
                  title: post.title,
                  description: post.excerpt
                }}
                onShare={handleShare}
              />
            </footer>
          )}
        </article>
      );
  }
};

export default BlogPost;
