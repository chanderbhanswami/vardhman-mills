'use client';

import React, { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SparklesIcon,
  BookmarkIcon,
  ShareIcon,
  HandThumbUpIcon,
  PrinterIcon,
  FlagIcon,
  ArrowLeftIcon,
  HomeIcon,
  ChevronRightIcon,
  ClockIcon,
  EyeIcon,
  UserIcon,
  TagIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  HandThumbDownIcon,
  LinkIcon,
  XMarkIcon,
  CheckIcon,
  HeartIcon,
  ArrowDownTrayIcon,
  Cog6ToothIcon,
  ArrowTopRightOnSquareIcon,
  ChartBarIcon,
  PhotoIcon,
  VideoCameraIcon,
  ArrowPathIcon,
  ChevronUpIcon,
  FireIcon,
  TrophyIcon,
  LightBulbIcon,
  StarIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline';
import {
  BookmarkIcon as BookmarkIconSolid,
  HandThumbUpIcon as HandThumbUpIconSolid,
  HandThumbDownIcon as HandThumbDownIconSolid,
  StarIcon as StarIconSolid,
  FireIcon as FireIconSolid
} from '@heroicons/react/24/solid';
import dynamic from 'next/dynamic';

// Dynamic imports
const HelpDetails = dynamic(() => import('@/components/help/HelpDetails'), {
  loading: () => <div className="h-screen bg-gray-50 animate-pulse" />
});

const HelpSidebar = dynamic(() => import('@/components/help/HelpSidebar'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
});

const HelpFeedback = dynamic(() => import('@/components/help/HelpFeedback'), {
  loading: () => <div className="h-48 bg-gray-100 animate-pulse rounded-lg" />
});

const HelpCard = dynamic(() => import('@/components/help/HelpCard'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
});

// UI Components
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Breadcrumb component inline
const Breadcrumb = ({ items }: { items: Array<{ label: string; href: string; icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>; current?: boolean }> }) => (
  <nav className="flex" aria-label="Breadcrumb">
    <ol className="flex items-center space-x-2">
      {items.map((item, index) => (
        <li key={index} className="flex items-center">
          {index > 0 && <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-2" />}
          {item.current ? (
            <span className="text-sm font-medium text-gray-900">{item.label}</span>
          ) : (
            <a href={item.href} className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1">
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.label}
            </a>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

// Types
interface RelatedArticle {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    avatar?: string;
    role?: string;
  };
  publishedAt: string;
  updatedAt: string;
  views: number;
  rating: {
    average: number;
    count: number;
  };
  isBookmarked?: boolean;
  estimatedReadTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'article' | 'video' | 'guide' | 'faq';
  status: 'published' | 'draft' | 'archived';
  helpfulness: {
    helpful: number;
    notHelpful: number;
  };
}

interface ArticleStats {
  views: number;
  likes: number;
  bookmarks: number;
  shares: number;
  helpful: number;
  notHelpful: number;
}

interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
  children?: TableOfContentsItem[];
}

// Animation variants
const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 }
  }
};

const sidebarVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.4, delay: 0.2 }
  }
};

const statsVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3 }
  }
};

// Mock data for demonstration
const mockArticle = {
  id: '1',
  title: 'Complete Guide to Bed Sheet Selection and Care',
  content: `
    <p>Welcome to our comprehensive guide on selecting and caring for bed sheets. This guide will help you understand thread count, fabric types, sizing, and proper maintenance techniques to extend the life of your bedding.</p>
    
    <h2>Understanding Thread Count</h2>
    <p>Thread count refers to the number of threads woven into one square inch of fabric. While higher thread counts often indicate softer, more durable sheets, the quality of the thread matters just as much as the count.</p>
    
    <ul>
      <li><strong>200-400 thread count:</strong> Good quality, suitable for everyday use</li>
      <li><strong>400-600 thread count:</strong> Premium quality, luxuriously soft</li>
      <li><strong>600+ thread count:</strong> Ultra-premium, hotel-quality sheets</li>
    </ul>
    
    <h2>Popular Fabric Types</h2>
    <p>Different fabrics offer unique benefits and characteristics:</p>
    
    <h3>Cotton</h3>
    <p>The most popular choice for bed sheets, cotton is breathable, soft, and durable. Egyptian cotton and Pima cotton are premium varieties known for their extra-long fibers.</p>
    
    <h3>Linen</h3>
    <p>Made from flax fibers, linen sheets are highly breathable and perfect for hot climates. They become softer with each wash and have a relaxed, textured appearance.</p>
    
    <h3>Microfiber</h3>
    <p>A synthetic option that's wrinkle-resistant, affordable, and easy to care for. Great for those with allergies as microfiber is hypoallergenic.</p>
    
    <h2>Proper Care Instructions</h2>
    <p>Follow these guidelines to keep your sheets fresh and extend their lifespan:</p>
    
    <ol>
      <li>Wash sheets every 1-2 weeks in warm or cold water</li>
      <li>Use a gentle, color-safe detergent</li>
      <li>Avoid fabric softeners as they can reduce absorbency</li>
      <li>Tumble dry on low heat or line dry to prevent shrinkage</li>
      <li>Remove from dryer promptly to minimize wrinkles</li>
      <li>Store clean sheets in a cool, dry place</li>
    </ol>
    
    <h2>Sizing Guide</h2>
    <p>Ensure proper fit by measuring your mattress height and selecting the appropriate sheet size. Most sheets fit mattresses up to 15 inches deep, but deep pocket sheets accommodate thicker mattresses up to 22 inches.</p>
    
    <h2>Common Issues and Solutions</h2>
    
    <h3>Pilling</h3>
    <p>Pilling occurs when loose fibers tangle together. To prevent pilling, wash sheets inside out and avoid washing with rough fabrics like denim.</p>
    
    <h3>Stains</h3>
    <p>Treat stains immediately by blotting (not rubbing) and pre-treating with a stain remover before washing. For tough stains, soak in cold water with oxygen bleach.</p>
    
    <h3>Shrinkage</h3>
    <p>Pre-washed sheets minimize shrinkage, but always follow care instructions. When in doubt, use cold water and low heat to dry.</p>
  `,
  excerpt: 'Learn everything about selecting the perfect bed sheets, understanding thread counts, fabric types, and proper care techniques to maintain quality and comfort.',
  category: {
    id: 'bedding',
    name: 'Bedding & Linens',
    slug: 'bedding'
  },
  author: {
    id: 'author-1',
    name: 'Priya Sharma',
    avatar: '/images/avatars/avatar-1.jpg',
    role: 'Home Textile Expert',
    verified: true
  },
  tags: ['bed sheets', 'bedding', 'care instructions', 'thread count', 'fabric guide', 'cotton', 'linen'],
  status: 'published' as const,
  priority: 'high' as const,
  difficulty: 'beginner' as const,
  estimatedReadTime: 12,
  sections: [
    {
      id: 'section-1',
      title: 'Understanding Thread Count',
      content: 'Thread count refers to the number of threads woven into one square inch of fabric...',
      order: 1,
      type: 'text' as const
    },
    {
      id: 'section-2',
      title: 'Popular Fabric Types',
      content: 'Different fabrics offer unique benefits and characteristics...',
      order: 2,
      type: 'text' as const
    },
    {
      id: 'section-3',
      title: 'Proper Care Instructions',
      content: 'Follow these guidelines to keep your sheets fresh...',
      order: 3,
      type: 'list' as const
    }
  ],
  attachments: [
    {
      id: 'att-1',
      name: 'Thread Count Comparison Chart',
      type: 'image' as const,
      url: '/images/help/thread-count-chart.jpg',
      size: '245 KB',
      thumbnail: '/images/help/thread-count-chart-thumb.jpg'
    },
    {
      id: 'att-2',
      name: 'Fabric Care Guide PDF',
      type: 'document' as const,
      url: '/downloads/fabric-care-guide.pdf',
      size: '1.2 MB'
    }
  ],
  comments: [],
  stats: {
    views: 25840,
    likes: 1820,
    dislikes: 42,
    bookmarks: 980,
    shares: 345,
    helpful: 2145,
    notHelpful: 89,
    rating: 4.8,
    totalRatings: 1205
  },
  createdAt: new Date('2024-01-15').toISOString(),
  updatedAt: new Date('2024-10-10').toISOString(),
  publishedAt: new Date('2024-01-20').toISOString(),
  lastModified: new Date('2024-10-10').toISOString()
};

const relatedArticles: RelatedArticle[] = [
  {
    id: 'related-1',
    title: 'Choosing the Right Pillow for Better Sleep',
    excerpt: 'Discover how to select the perfect pillow based on your sleeping position and preferences',
    category: 'Bedding & Linens',
    tags: ['pillows', 'sleep', 'comfort'],
    author: { name: 'Rajesh Kumar', role: 'Sleep Expert' },
    publishedAt: new Date('2024-09-15').toISOString(),
    updatedAt: new Date('2024-10-05').toISOString(),
    views: 18500,
    rating: { average: 4.7, count: 892 },
    estimatedReadTime: 8,
    difficulty: 'beginner',
    type: 'guide',
    status: 'published',
    helpfulness: { helpful: 1650, notHelpful: 45 }
  },
  {
    id: 'related-2',
    title: 'Duvet vs Comforter: What\'s the Difference?',
    excerpt: 'Learn the key differences between duvets and comforters to make the right choice',
    category: 'Bedding & Linens',
    tags: ['duvet', 'comforter', 'bedding'],
    author: { name: 'Anita Desai', role: 'Product Specialist' },
    publishedAt: new Date('2024-08-20').toISOString(),
    updatedAt: new Date('2024-09-25').toISOString(),
    views: 22300,
    rating: { average: 4.6, count: 1045 },
    estimatedReadTime: 6,
    difficulty: 'beginner',
    type: 'article',
    status: 'published',
    helpfulness: { helpful: 1890, notHelpful: 67 }
  },
  {
    id: 'related-3',
    title: 'How to Remove Common Stains from Bedding',
    excerpt: 'Expert tips and techniques for treating and removing various stains from your bed linens',
    category: 'Care Instructions',
    tags: ['stain removal', 'care', 'cleaning'],
    author: { name: 'Meera Patel', role: 'Care Specialist' },
    publishedAt: new Date('2024-07-10').toISOString(),
    updatedAt: new Date('2024-09-15').toISOString(),
    views: 31200,
    rating: { average: 4.9, count: 1520 },
    estimatedReadTime: 10,
    difficulty: 'intermediate',
    type: 'guide',
    status: 'published',
    helpfulness: { helpful: 2840, notHelpful: 58 }
  }
];

// Main Component
function ArticlePageContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;
  
  // State
  const [article, setArticle] = useState(mockArticle);
  const [articleStats, setArticleStats] = useState<ArticleStats>({
    views: mockArticle.stats.views,
    likes: mockArticle.stats.likes,
    bookmarks: mockArticle.stats.bookmarks,
    shares: mockArticle.stats.shares,
    helpful: mockArticle.stats.helpful,
    notHelpful: mockArticle.stats.notHelpful
  });
  const [userInteractions, setUserInteractions] = useState({
    liked: false,
    disliked: false,
    bookmarked: false,
    rated: undefined as number | undefined
  });
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [tableOfContents, setTableOfContents] = useState<TableOfContentsItem[]>([]);
  const [activeSection, setActiveSection] = useState('');
  const [searchInArticle, setSearchInArticle] = useState('');
  const [searchResults, setSearchResults] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Track article metadata usage
  const articleMeta = useMemo(() => ({
    slug,
    fromQuery: searchParams?.get('ref') || 'direct',
    lastUpdated: format(new Date(article.updatedAt), 'PPP')
  }), [slug, searchParams, article.updatedAt]);

  // Load article data
  useEffect(() => {
    const timer = setTimeout(() => {
      // Simulate article loading with slug parameter
      console.log('Loading article:', articleMeta.slug);
      setIsLoading(false);
      
      // Update article stats view count
      setArticleStats(prev => ({ ...prev, views: prev.views + 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [params?.slug, articleMeta.slug]);

  // Generate table of contents from article content
  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(article.content, 'text/html');
    const headings = doc.querySelectorAll('h2, h3');
    
    const toc: TableOfContentsItem[] = [];
    headings.forEach((heading, index) => {
      toc.push({
        id: `section-${index}`,
        title: heading.textContent || '',
        level: parseInt(heading.tagName.charAt(1))
      });
    });
    
    setTableOfContents(toc);
  }, [article.content]);

  // Handle interactions
  const handleLike = useCallback(() => {
    setUserInteractions(prev => ({
      ...prev,
      liked: !prev.liked,
      disliked: false
    }));
    setArticleStats(prev => ({
      ...prev,
      likes: prev.likes + (userInteractions.liked ? -1 : 1)
    }));
  }, [userInteractions.liked]);

  const handleDislike = useCallback(() => {
    setUserInteractions(prev => ({
      ...prev,
      disliked: !prev.disliked,
      liked: false
    }));
    setArticleStats(prev => ({
      ...prev,
      notHelpful: prev.notHelpful + (userInteractions.disliked ? -1 : 1)
    }));
  }, [userInteractions.disliked]);

  const handleBookmark = useCallback(() => {
    setUserInteractions(prev => ({
      ...prev,
      bookmarked: !prev.bookmarked
    }));
    setArticleStats(prev => ({
      ...prev,
      bookmarks: prev.bookmarks + (userInteractions.bookmarked ? -1 : 1)
    }));
  }, [userInteractions.bookmarked]);

  const handleShare = useCallback((method: string) => {
    const url = window.location.href;
    const title = article.title;

    switch (method) {
      case 'copy':
        navigator.clipboard.writeText(url);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
    }
    
    setShowShareMenu(false);
    setArticleStats(prev => ({ ...prev, shares: prev.shares + 1 }));
  }, [article.title]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleReport = useCallback(() => {
    // Update article with report action
    setArticle(prev => ({ ...prev, lastModified: new Date().toISOString() }));
    router.push(`/help-&-guide/form?type=report&articleId=${article.id}`);
  }, [router, article.id]);

  const handleSearchInArticle = useCallback((query: string) => {
    setSearchInArticle(query);
    if (query) {
      const content = article.content.toLowerCase();
      const matches = (content.match(new RegExp(query.toLowerCase(), 'g')) || []).length;
      setSearchResults(matches);
    } else {
      setSearchResults(0);
    }
  }, [article.content]);

  // Breadcrumb items
  const breadcrumbItems = useMemo(() => [
    { label: 'Home', href: '/', icon: HomeIcon },
    { label: 'Help Center', href: '/help-&-guide' },
    { label: article.category.name, href: `/help-&-guide/categories/${article.category.slug}` },
    { label: article.title, href: '#', current: true }
  ], [article]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen bg-gray-50"
    >
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </Button>

            <div className="flex items-center gap-2">
              {/* Search in article */}
              <div className="relative hidden md:block">
                <Input
                  type="text"
                  placeholder="Search in article..."
                  value={searchInArticle}
                  onChange={(e) => handleSearchInArticle(e.target.value)}
                  className="pl-10 pr-4 w-64"
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                {searchResults > 0 && (
                  <Badge variant="secondary" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2">
                    {searchResults}
                  </Badge>
                )}
              </div>

              {/* Actions */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={cn(userInteractions.liked && 'text-blue-600')}
              >
                {userInteractions.liked ? (
                  <HandThumbUpIconSolid className="h-5 w-5" />
                ) : (
                  <HandThumbUpIcon className="h-5 w-5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                className={cn(userInteractions.bookmarked && 'text-amber-600')}
              >
                {userInteractions.bookmarked ? (
                  <BookmarkIconSolid className="h-5 w-5" />
                ) : (
                  <BookmarkIcon className="h-5 w-5" />
                )}
              </Button>

              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                >
                  {copySuccess ? (
                    <CheckIcon className="h-5 w-5 text-green-600" />
                  ) : (
                    <ShareIcon className="h-5 w-5" />
                  )}
                </Button>

                <AnimatePresence>
                  {showShareMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                    >
                      <button
                        onClick={() => handleShare('copy')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                      >
                        <ClipboardDocumentIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-sm">Copy Link</span>
                      </button>
                      <button
                        onClick={() => handleShare('email')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                      >
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-sm">Email</span>
                      </button>
                      <button
                        onClick={() => handleShare('whatsapp')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                      >
                        <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-sm">WhatsApp</span>
                      </button>
                      <button
                        onClick={() => handleShare('twitter')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                      >
                        <LinkIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-sm">Twitter</span>
                      </button>
                      <button
                        onClick={() => handleShare('facebook')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                      >
                        <LinkIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-sm">Facebook</span>
                      </button>
                      <button
                        onClick={() => handleShare('linkedin')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                      >
                        <LinkIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-sm">LinkedIn</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Button variant="ghost" size="sm" onClick={handlePrint}>
                <PrinterIcon className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleReport}
                className="text-red-600 hover:text-red-700"
              >
                <FlagIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Article Content */}
          <div className="lg:col-span-8">
            <Suspense fallback={<div className="h-screen bg-white animate-pulse rounded-lg" />}>
              <HelpDetails
                article={article}
                onBack={() => router.back()}
                onLike={handleLike}
                onDislike={handleDislike}
                onBookmark={handleBookmark}
                onShare={() => setShowShareMenu(true)}
                onPrint={handlePrint}
                onReport={handleReport}
                userInteractions={userInteractions}
                showComments={true}
                showRating={true}
                showStats={true}
                showTableOfContents={true}
                enableSearch={true}
                enableAnimations={true}
              />
            </Suspense>

            {/* Feedback Section */}
            <div className="mt-8">
              <Card className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Was this article helpful?
                </h3>
                <Suspense fallback={<div className="h-32 bg-gray-100 animate-pulse rounded" />}>
                  <HelpFeedback
                    articleId={article.id}
                    onSubmit={(feedback) => console.log('Feedback:', feedback)}
                    showQuickFeedback={true}
                    showDetailedForm={true}
                    enableAnimations={true}
                  />
                </Suspense>
              </Card>
            </div>

            {/* Related Articles */}
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-6">
                <SparklesIcon className="h-6 w-6 text-blue-600" />
                <h3 className="text-2xl font-bold text-gray-900">
                  Related Articles
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedArticles.map((relatedArticle) => (
                  <Suspense key={relatedArticle.id} fallback={<div className="h-64 bg-gray-100 animate-pulse rounded-lg" />}>
                    <HelpCard
                      article={relatedArticle}
                      variant="compact"
                      onClick={() => router.push(`/help-&-guide/${relatedArticle.id}`)}
                      showRating={true}
                      showActions={true}
                      enableAnimations={true}
                    />
                  </Suspense>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <motion.div
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-4"
          >
            <div className="sticky top-24 space-y-6">
              <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-lg" />}>
                <HelpSidebar
                  items={[
                    ...tableOfContents.map(item => ({
                      id: item.id,
                      title: item.title,
                      type: 'article' as const,
                      url: `#${item.id}`,
                      isActive: item.id === activeSection,
                      icon: DocumentTextIcon,
                      onClick: () => {
                        setActiveSection(item.id);
                        document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                      }
                    })),
                    {
                      id: 'contact-widget',
                      title: 'Need Help',
                      type: 'widget' as const,
                      icon: ChatBubbleLeftRightIcon,
                      onClick: () => router.push('/help-&-guide/form')
                    }
                  ]}
                  activeItemId={activeSection}
                  onItemClick={(item: { id: string; title: string; type: string; url?: string; icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>; onClick?: () => void }) => {
                    if (item.onClick) {
                      item.onClick();
                    }
                  }}
                  showSearch={false}
                  showPopular={true}
                  showRecent={false}
                  showContact={true}
                  enableAnimations={true}
                />
              </Suspense>

              {/* Quick Stats */}
              <motion.div variants={statsVariants}>
                <Card className="p-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <ChartBarIcon className="h-5 w-5 text-blue-600" />
                    Article Statistics
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <EyeIcon className="h-4 w-4" />
                        <span>Views</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {articleStats.views.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <HandThumbUpIcon className="h-4 w-4 text-green-600" />
                        <span>Likes</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {articleStats.likes.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <HandThumbDownIcon className="h-4 w-4 text-red-600" />
                        <HandThumbDownIconSolid className="h-3 w-3 text-red-400" />
                        <span>Dislikes</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {articleStats.notHelpful.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BookmarkIcon className="h-4 w-4" />
                        <span>Bookmarks</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {articleStats.bookmarks.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <ShareIcon className="h-4 w-4" />
                        <span>Shares</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {articleStats.shares.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <StarIcon className="h-4 w-4 text-yellow-500" />
                        <StarIconSolid className="h-3 w-3 text-yellow-400" />
                        <span>Rating</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-gray-900">
                          {article.stats.rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({article.stats.totalRatings})
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Article Metadata */}
              <motion.div variants={statsVariants}>
                <Card className="p-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Cog6ToothIcon className="h-5 w-5 text-indigo-600" />
                    Article Metadata
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <ClockIcon className="h-4 w-4" />
                        <span>Read Time</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{article.estimatedReadTime} min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <UserIcon className="h-4 w-4" />
                        <span>Author</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Avatar src={article.author.avatar} alt={article.author.name} className="h-6 w-6" />
                        <span className="text-sm font-medium text-gray-900">{article.author.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <TagIcon className="h-4 w-4" />
                        <span>Tags</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{article.tags.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <ArrowPathIcon className="h-4 w-4" />
                        <span>Last Updated</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 text-right">
                        {format(new Date(article.updatedAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <PhotoIcon className="h-4 w-4 text-green-600" />
                        <VideoCameraIcon className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-gray-600">Media Types</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <PhotoIcon className="h-3 w-3" />
                          Images
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <ArrowDownTrayIcon className="h-3 w-3" />
                          Downloads
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div variants={statsVariants}>
                <Card className="p-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <LightBulbIcon className="h-5 w-5 text-amber-600" />
                    Quick Actions
                  </h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-2" />
                      Open in New Tab
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <ClipboardDocumentIcon className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <HeartIcon className="h-4 w-4 mr-2 text-pink-600" />
                      Add to Favorites
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <XMarkIcon className="h-4 w-4 mr-2" />
                      Report Issue
                    </Button>
                  </div>
                </Card>
              </motion.div>

              {/* Trending Badge */}
              <motion.div variants={statsVariants}>
                <Card className="p-4 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <FireIcon className="h-5 w-5 text-orange-600" />
                      <FireIconSolid className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <TrophyIcon className="h-4 w-4 text-yellow-600" />
                        Trending Article
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        <ChevronUpIcon className="h-3 w-3 inline mr-1 text-green-600" />
                        Top viewed this week
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Need More Help */}
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                    <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Need More Help?
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Our support team is here to assist you
                  </p>
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full"
                    onClick={() => router.push('/help-&-guide/form')}
                  >
                    Contact Support
                  </Button>
                </div>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => router.push('/help-&-guide')}
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Help Center
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Share this article:</span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShare('twitter')}
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShare('facebook')}
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShare('linkedin')}
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Wrapper with Suspense
export default function HelpArticlePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    }>
      <ArticlePageContent />
    </Suspense>
  );
}
