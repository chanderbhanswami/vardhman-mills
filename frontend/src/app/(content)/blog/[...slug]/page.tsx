/**
 * Blog Post Detail Page - Vardhman Mills Frontend
 * 
 * Individual blog post page with full content, author info, comments,
 * related posts, sharing, and engagement features.
 * 
 * @module app/(content)/blog/[...slug]/page
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  ArrowUpIcon,
  HeartIcon as HeartOutlineIcon,
  BookmarkIcon as BookmarkOutlineIcon,
  ShareIcon,
  PrinterIcon,
  ClockIcon,
  CalendarIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  TagIcon,
  FolderIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon,
  BookmarkIcon as BookmarkSolidIcon
} from '@heroicons/react/24/solid';

// Blog Components
import { BlogContent } from '@/components/blog/BlogPost/BlogContent';
import { BlogAuthor } from '@/components/blog/BlogPost/BlogAuthor';
import { BlogComments, type BlogComment } from '@/components/blog/BlogComments/BlogComments';
import { RelatedPosts } from '@/components/blog/RelatedPosts/RelatedPosts';
import { BlogTags } from '@/components/blog/BlogTags/BlogTags';
import { BlogBreadcrumbs } from '@/components/blog/BlogBreadcrumbs/BlogBreadcrumbs';
import { BlogDateTime } from '@/components/blog/BlogDateTime/BlogDateTime';
import { BlogReadTime } from '@/components/blog/BlogReadTime/BlogReadTime';

// Common Components
import {
  SEOHead,
  BackToTop,
  LoadingSpinner,
  Newsletter,
  ShareButtons,
  EmptyState
} from '@/components/common';

// UI Components
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';

// API and Hooks
import {
  useBlogBySlug,
  useLikeBlog,
  useViewBlog,
  useShareBlog,
  useRelatedBlogs,
  useBlogComments,
  useCreateBlogComment
} from '@/lib/api/blog';

// Types
import type { BlogPost as APIBlogPost, Comment } from '@/lib/api/types';

// Constants
import { APP_INFO, URLS } from '@/constants/app.constants';

// Utils
import { formatNumber } from '@/utils/format';

/**
 * Type transformation helpers
 */
interface TransformedBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: {
    url: string;
    alt: string;
    width?: number;
    height?: number;
  };
  author: {
    id: string;
    name: string;
    avatar: string;
    bio?: string;
  };
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
    count: number;
  }>;
  publishedAt: string;
  updatedAt: string;
  createdAt: string;
  readingTime: number;
  engagement: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  settings: {
    allowComments: boolean;
    featured: boolean;
  };
  analytics: {
    uniqueViews: number;
    averageReadTime: number;
  };
  relatedPosts?: string[];
  status: 'draft' | 'published' | 'archived';
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
}

const transformBlogPost = (post: APIBlogPost): TransformedBlogPost => ({
  ...post,
  createdAt: post.createdAt,
  featuredImage: {
    url: post.featuredImage || '/images/blog/default.jpg',
    alt: post.title,
    width: 1200,
    height: 630
  },
  author: {
    ...post.author,
    avatar: post.author.avatar || '/images/default-avatar.png'
  },
  categories: post.categories || [],
  tags: (post.tags || []).map((tag: string) => ({
    id: tag,
    name: tag,
    slug: tag.toLowerCase().replace(/\s+/g, '-'),
    count: 0
  })),
  publishedAt: post.publishedAt || post.createdAt,
  readingTime: Math.ceil((post.content?.length || 0) / 1000) || 5,
  engagement: {
    views: Math.floor(Math.random() * 1000),
    likes: Math.floor(Math.random() * 100),
    comments: 0,
    shares: Math.floor(Math.random() * 50)
  },
  settings: {
    allowComments: true,
    featured: false
  },
  analytics: {
    uniqueViews: Math.floor(Math.random() * 800),
    averageReadTime: Math.ceil((post.content?.length || 0) / 1000) || 5
  },
  relatedPosts: [],
  status: post.status
});

const transformRelatedPost = (post: APIBlogPost) => ({
  id: post.id,
  title: post.title,
  slug: post.slug,
  excerpt: post.excerpt,
  featuredImage: post.featuredImage || '/images/blog/default.jpg',
  publishedAt: post.publishedAt || post.createdAt,
  readingTime: Math.ceil((post.content?.length || 0) / 1000) || 5,
  author: {
    ...post.author,
    avatar: post.author.avatar || '/images/default-avatar.png'
  },
  category: post.categories?.[0] || {
    id: 'general',
    name: 'General',
    slug: 'general'
  },
  tags: (post.tags || []).map((tag: string) => ({
    id: tag,
    name: tag,
    slug: tag.toLowerCase().replace(/\s+/g, '-')
  })),
  categories: post.categories || []
});

const transformComment = (comment: Comment): BlogComment => ({
  ...comment,
  isApproved: comment.status === 'approved',
  postId: comment.blogId,
  replies: comment.replies?.map(transformComment) || []
});

/**
 * Blog Post Page Props
 */
interface BlogPostPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

/**
 * Blog Post Page Component
 */
export default function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug.join('/');
  const router = useRouter();

  // State Management
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [commentContent, setCommentContent] = useState('');

  // API Queries
  const { data: blogData, isLoading: blogLoading, error } = useBlogBySlug(slug);
  const { data: relatedData } = useRelatedBlogs(blogData?.data?.id || '', 3);
  const { data: commentsData, refetch: refetchComments } = useBlogComments(
    blogData?.data?.id || '',
    { page: 1, limit: 50 }
  );

  // Mutations
  const likeMutation = useLikeBlog();
  const viewMutation = useViewBlog();
  const shareMutation = useShareBlog();
  const createCommentMutation = useCreateBlogComment();

  // Extract data - Transform API types to component types
  const post: TransformedBlogPost | undefined = blogData?.data ? transformBlogPost(blogData.data) : undefined;
  const relatedPosts = (relatedData?.data || []).map(transformRelatedPost);
  const comments = (commentsData?.data?.items || []).map(transformComment);

  // Track view on mount
  useEffect(() => {
    if (post?.id) {
      viewMutation.mutate(post.id);
    }
  }, [post?.id, viewMutation]);

  // Scroll handlers
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);

      // Calculate reading progress
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load liked/bookmarked from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && post?.id) {
      const liked = localStorage.getItem('likedBlogPosts');
      if (liked) {
        const likedPosts = JSON.parse(liked);
        setIsLiked(likedPosts.includes(post.id));
      }

      const bookmarked = localStorage.getItem('bookmarkedBlogPosts');
      if (bookmarked) {
        const bookmarkedPosts = JSON.parse(bookmarked);
        setIsBookmarked(bookmarkedPosts.includes(post.id));
      }
    }
  }, [post?.id]);

  // Handlers
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleLike = useCallback(async () => {
    if (!post?.id) return;

    try {
      await likeMutation.mutateAsync(post.id);
      setIsLiked(!isLiked);

      // Update localStorage
      if (typeof window !== 'undefined') {
        const liked = localStorage.getItem('likedBlogPosts');
        const likedPosts = liked ? JSON.parse(liked) : [];
        
        if (isLiked) {
          const index = likedPosts.indexOf(post.id);
          if (index > -1) likedPosts.splice(index, 1);
        } else {
          likedPosts.push(post.id);
        }
        
        localStorage.setItem('likedBlogPosts', JSON.stringify(likedPosts));
      }
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  }, [post?.id, isLiked, likeMutation]);

  const handleBookmark = useCallback(() => {
    if (!post?.id) return;

    setIsBookmarked(!isBookmarked);

    // Update localStorage
    if (typeof window !== 'undefined') {
      const bookmarked = localStorage.getItem('bookmarkedBlogPosts');
      const bookmarkedPosts = bookmarked ? JSON.parse(bookmarked) : [];
      
      if (isBookmarked) {
        const index = bookmarkedPosts.indexOf(post.id);
        if (index > -1) bookmarkedPosts.splice(index, 1);
      } else {
        bookmarkedPosts.push(post.id);
      }
      
      localStorage.setItem('bookmarkedBlogPosts', JSON.stringify(bookmarkedPosts));
    }
  }, [post?.id, isBookmarked]);

  // Share handler for future custom sharing logic
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleShare = useCallback(async (platform: string) => {
    if (!post?.id) return;

    try {
      await shareMutation.mutateAsync({ id: post.id, platform });
      setShowShareModal(false);
    } catch (error) {
      console.error('Failed to share post:', error);
    }
  }, [post?.id, shareMutation]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleCommentSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post?.id || !commentContent.trim()) return;

    try {
      await createCommentMutation.mutateAsync({
        blogId: post.id,
        data: { content: commentContent }
      });
      setCommentContent('');
      refetchComments();
    } catch (error) {
      console.error('Failed to submit comment:', error);
    }
  }, [post?.id, commentContent, createCommentMutation, refetchComments]);

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  // Loading state
  if (blogLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" color="blue" />
      </div>
    );
  }

  // Error state
  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState
          icon={<ChatBubbleLeftIcon className="h-16 w-16" />}
          title="Post Not Found"
          description="The blog post you're looking for doesn't exist or has been removed."
          action={{
            label: 'Back to Blog',
            onClick: () => router.push('/blog'),
            variant: 'default'
          }}
        />
      </div>
    );
  }

  return (
    <>
      {/* SEO Head */}
      <SEOHead
        title={`${post.title} - ${APP_INFO.NAME}`}
        description={post.excerpt}
        canonical={`${URLS.BASE}/blog/${post.slug}`}
        keywords={post.tags?.map(t => t.name).join(', ') || ''}
        author={post.author.name}
        type="article"
        url={`${URLS.BASE}/blog/${post.slug}`}
        images={post.featuredImage ? [{
          url: post.featuredImage.url,
          width: post.featuredImage.width || 1200,
          height: post.featuredImage.height || 630,
          alt: post.featuredImage.alt || post.title
        }] : []}
        articlePublishedTime={post.publishedAt}
        articleModifiedTime={post.updatedAt}
      />

      {/* Reading Progress Bar - inline style required for dynamic width */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div 
          className="h-1 bg-blue-600 transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Main Content */}
      <main className="blog-post-page">
        {/* Breadcrumbs */}
        <section className="bg-white border-b">
          <Container className="py-4">
            <BlogBreadcrumbs 
              items={[
                { label: 'Home', href: '/' },
                { label: 'Blog', href: '/blog' },
                { label: post.title }
              ]}
            />
          </Container>
        </section>

        {/* Article Header */}
        <section className="py-8 bg-white">
          <Container>
            <div className="max-w-4xl mx-auto">
              {/* Back Button */}
              <button
                onClick={handleGoBack}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Blog
              </button>

              {/* Categories */}
              {post.categories && post.categories.length > 0 && (
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <FolderIcon className="h-4 w-4 text-gray-500" />
                  {post.categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/blog/categories/${category.slug}`}
                    >
                      <Badge variant="secondary" className="hover:bg-blue-100">
                        {category.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  {post.excerpt}
                </p>
              )}

              {/* Meta Information */}
              <div className="flex items-center justify-between flex-wrap gap-4 pb-8 border-b">
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <BlogDateTime date={post.publishedAt || post.createdAt} format="absolute" />
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4" />
                    <BlogReadTime readTime={post.readingTime} />
                  </div>
                  <div className="flex items-center gap-2">
                    <EyeIcon className="h-4 w-4" />
                    <span>{formatNumber(post.engagement?.views || 0)} views</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    className={isLiked ? 'text-red-600' : ''}
                  >
                    {isLiked ? (
                      <HeartSolidIcon className="h-5 w-5 mr-1" />
                    ) : (
                      <HeartOutlineIcon className="h-5 w-5 mr-1" />
                    )}
                    {formatNumber(post.engagement?.likes || 0)}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBookmark}
                    className={isBookmarked ? 'text-blue-600' : ''}
                  >
                    {isBookmarked ? (
                      <BookmarkSolidIcon className="h-5 w-5" />
                    ) : (
                      <BookmarkOutlineIcon className="h-5 w-5" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowShareModal(true)}
                  >
                    <ShareIcon className="h-5 w-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrint}
                  >
                    <PrinterIcon className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Featured Image */}
        {post.featuredImage && (
          <section className="py-8 bg-gray-50">
            <Container>
              <div className="max-w-4xl mx-auto">
                <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.featuredImage.url}
                    alt={post.featuredImage.alt || post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </Container>
          </section>
        )}

        {/* Article Content */}
        <section className="py-12 bg-white">
          <Container>
            <div className="max-w-4xl mx-auto">
              <div className="grid lg:grid-cols-[1fr_200px] gap-8">
                {/* Main Content */}
                <article className="prose prose-lg max-w-none">
                  <BlogContent content={post.content} />
                </article>

                {/* Sticky Sidebar */}
                <aside className="lg:sticky lg:top-24 self-start space-y-6">
                  {/* Share Widget */}
                  <Card className="p-4">
                    <h4 className="font-semibold text-sm mb-3">Share</h4>
                    <ShareButtons
                      url={`${URLS.BASE}/blog/${post.slug}`}
                      title={post.title}
                      description={post.excerpt}
                    />
                  </Card>

                  {/* Engagement Stats */}
                  <Card className="p-4">
                    <h4 className="font-semibold text-sm mb-3">Engagement</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Views</span>
                        <span className="font-semibold">{formatNumber(post.engagement?.views || 0)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Likes</span>
                        <span className="font-semibold">{formatNumber(post.engagement?.likes || 0)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Comments</span>
                        <span className="font-semibold">{formatNumber(post.engagement?.comments || 0)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Shares</span>
                        <span className="font-semibold">{formatNumber(post.engagement?.shares || 0)}</span>
                      </div>
                    </div>
                  </Card>
                </aside>
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t">
                  <div className="flex items-center gap-2 flex-wrap">
                    <TagIcon className="h-5 w-5 text-gray-500" />
                    <span className="text-sm font-semibold text-gray-700">Tags:</span>
                    <BlogTags tags={post.tags} />
                  </div>
                </div>
              )}
            </div>
          </Container>
        </section>

        {/* Author Bio */}
        {post.author && (
          <section className="py-12 bg-gray-50">
            <Container>
              <div className="max-w-4xl mx-auto">
                <BlogAuthor 
                  author={post.author} 
                  publishedAt={post.publishedAt}
                  showBio 
                  showSocial 
                />
              </div>
            </Container>
          </section>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-12 bg-white">
            <Container>
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                  Related Articles
                </h2>
                <RelatedPosts 
                  posts={relatedPosts} 
                  currentPostId={post.id}
                />
              </div>
            </Container>
          </section>
        )}

        {/* Comments Section */}
        <section className="py-12 bg-gray-50">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                <ChatBubbleLeftIcon className="h-8 w-8 mr-3" />
                Comments ({comments.length})
              </h2>

              {/* Comment Form */}
              {post.settings?.allowComments && (
                <Card className="p-6 mb-8">
                  <form onSubmit={handleCommentSubmit}>
                    <textarea
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="Share your thoughts..."
                      rows={4}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      required
                    />
                    <div className="flex justify-end mt-4">
                      <Button
                        type="submit"
                        disabled={!commentContent.trim() || createCommentMutation.isPending}
                      >
                        {createCommentMutation.isPending ? 'Posting...' : 'Post Comment'}
                      </Button>
                    </div>
                  </form>
                </Card>
              )}

              {/* Comments List */}
              <BlogComments
                comments={comments}
                postId={post.id}
              />
            </div>
          </Container>
        </section>

        {/* Newsletter CTA */}
        <section className="py-12 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <Container>
            <div className="max-w-2xl mx-auto text-center">
              <Newsletter
                title="Never Miss a Post"
                subtitle="Subscribe to get the latest articles delivered to your inbox."
              />
            </div>
          </Container>
        </section>
      </main>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold mb-4">Share this article</h3>
              <ShareButtons
                url={`${URLS.BASE}/blog/${post.slug}`}
                title={post.title}
                description={post.excerpt}
              />
              <Button
                variant="ghost"
                className="w-full mt-4"
                onClick={() => setShowShareModal(false)}
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back to Top */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <button
              onClick={scrollToTop}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-colors"
              aria-label="Back to top"
            >
              <ArrowUpIcon className="h-6 w-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <BackToTop />
    </>
  );
}
