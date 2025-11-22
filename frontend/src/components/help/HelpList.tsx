'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  EyeIcon,
  StarIcon,
  HeartIcon,
  BookmarkIcon,
  ShareIcon,
  ChevronRightIcon,
  XMarkIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  NewspaperIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartIconSolid,
  BookmarkIcon as BookmarkIconSolid,
  FireIcon as FireIconSolid
} from '@heroicons/react/24/solid';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Types and Interfaces
export interface HelpArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  category: {
    id: string;
    name: string;
    color: string;
  };
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  tags: string[];
  status: 'published' | 'draft' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedReadTime: number;
  stats: {
    views: number;
    likes: number;
    bookmarks: number;
    shares: number;
    rating: number;
    totalRatings: number;
    helpful: number;
    notHelpful: number;
  };
  featured: boolean;
  trending: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface FilterOptions {
  categories: string[];
  tags: string[];
  difficulty: string[];
  priority: string[];
  status: string[];
  dateRange: {
    from?: string;
    to?: string;
  };
  readTime: {
    min?: number;
    max?: number;
  };
  rating: {
    min?: number;
  };
}

export interface SortOption {
  value: string;
  label: string;
  field: keyof HelpArticle | 'stats.views' | 'stats.rating' | 'stats.likes';
  direction: 'asc' | 'desc';
}

export interface HelpListProps {
  articles: HelpArticle[];
  onArticleClick?: (article: HelpArticle) => void;
  onArticleLike?: (articleId: string) => void;
  onArticleBookmark?: (articleId: string) => void;
  onArticleShare?: (articleId: string) => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  filters?: Partial<FilterOptions>;
  onFiltersChange?: (filters: Partial<FilterOptions>) => void;
  sortBy?: string;
  onSortChange?: (sort: string) => void;
  viewMode?: 'grid' | 'list' | 'compact';
  onViewModeChange?: (mode: 'grid' | 'list' | 'compact') => void;
  userInteractions?: Record<string, {
    liked: boolean;
    bookmarked: boolean;
    viewed: boolean;
  }>;
  showFilters?: boolean;
  showSearch?: boolean;
  showSorting?: boolean;
  showViewToggle?: boolean;
  showStats?: boolean;
  showFeatured?: boolean;
  itemsPerPage?: number;
  enablePagination?: boolean;
  className?: string;
  enableAnimations?: boolean;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.05
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
    y: -2,
    transition: { duration: 0.2 }
  }
};

const filterVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { 
    opacity: 1, 
    height: 'auto',
    transition: { duration: 0.3 }
  }
};

// Sort options
const sortOptions: SortOption[] = [
  { value: 'relevance', label: 'Relevance', field: 'updatedAt', direction: 'desc' },
  { value: 'newest', label: 'Newest', field: 'publishedAt', direction: 'desc' },
  { value: 'oldest', label: 'Oldest', field: 'publishedAt', direction: 'asc' },
  { value: 'title', label: 'Title A-Z', field: 'title', direction: 'asc' },
  { value: 'title_desc', label: 'Title Z-A', field: 'title', direction: 'desc' },
  { value: 'views', label: 'Most Viewed', field: 'stats.views', direction: 'desc' },
  { value: 'rating', label: 'Highest Rated', field: 'stats.rating', direction: 'desc' },
  { value: 'likes', label: 'Most Liked', field: 'stats.likes', direction: 'desc' },
  { value: 'updated', label: 'Recently Updated', field: 'updatedAt', direction: 'desc' }
];

// Default articles data for Vardhman Mills Home Furnishing
const defaultArticles: HelpArticle[] = [
  {
    id: '1',
    title: 'Getting Started with Your First Order',
    excerpt: 'Complete guide to placing your first order, from browsing products to checkout.',
    content: 'This comprehensive guide will walk you through...',
    slug: 'getting-started-first-order',
    category: { id: 'getting-started', name: 'Getting Started', color: 'blue' },
    author: { id: 'author1', name: 'Sarah Johnson', avatar: '/avatars/sarah.jpg', role: 'Customer Success' },
    tags: ['orders', 'checkout', 'beginner'],
    status: 'published',
    priority: 'high',
    difficulty: 'beginner',
    estimatedReadTime: 5,
    stats: { views: 2450, likes: 89, bookmarks: 45, shares: 12, rating: 4.8, totalRatings: 156, helpful: 142, notHelpful: 8 },
    featured: true,
    trending: true,
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    publishedAt: '2024-01-15T12:00:00Z'
  },
  {
    id: '2',
    title: 'Choosing the Right Bed Sheets for Your Home',
    excerpt: 'Complete guide to selecting perfect bed sheets based on thread count, material, and bed size.',
    content: 'Learn about different fabric types, thread counts, and how to choose the best bed sheets...',
    slug: 'choosing-right-bed-sheets',
    category: { id: 'bedding', name: 'Bedding & Linens', color: 'green' },
    author: { id: 'author5', name: 'Priya Sharma', avatar: '/avatars/priya.jpg', role: 'Home Textile Expert' },
    tags: ['bedding', 'sheets', 'cotton', 'thread-count', 'sizing'],
    status: 'published',
    priority: 'high',
    difficulty: 'beginner',
    estimatedReadTime: 8,
    stats: { views: 3850, likes: 145, bookmarks: 89, shares: 23, rating: 4.9, totalRatings: 267, helpful: 251, notHelpful: 12 },
    featured: true,
    trending: true,
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-01-28T14:30:00Z',
    publishedAt: '2024-01-20T12:00:00Z'
  },
  {
    id: '3',
    title: 'Curtain Sizing Guide: Perfect Window Treatments',
    excerpt: 'Step-by-step guide to measuring windows and selecting the right curtain size for any room.',
    content: 'Master the art of curtain selection with our comprehensive sizing guide...',
    slug: 'curtain-sizing-guide',
    category: { id: 'curtains', name: 'Curtains & Drapes', color: 'purple' },
    author: { id: 'author6', name: 'Rajesh Kumar', avatar: '/avatars/rajesh.jpg', role: 'Interior Design Consultant' },
    tags: ['curtains', 'window-treatments', 'measuring', 'home-decor'],
    status: 'published',
    priority: 'high',
    difficulty: 'intermediate',
    estimatedReadTime: 12,
    stats: { views: 2890, likes: 98, bookmarks: 67, shares: 18, rating: 4.7, totalRatings: 189, helpful: 174, notHelpful: 9 },
    featured: true,
    trending: false,
    createdAt: '2024-01-22T10:15:00Z',
    updatedAt: '2024-01-30T16:45:00Z',
    publishedAt: '2024-01-22T14:00:00Z'
  },
  {
    id: '4',
    title: 'Care Instructions for Premium Cotton Linens',
    excerpt: 'Essential care tips to maintain the quality and longevity of your cotton bed linens and towels.',
    content: 'Proper care ensures your cotton products last longer and stay beautiful...',
    slug: 'care-instructions-cotton-linens',
    category: { id: 'care-maintenance', name: 'Care & Maintenance', color: 'orange' },
    author: { id: 'author7', name: 'Meera Gupta', avatar: '/avatars/meera.jpg', role: 'Textile Care Specialist' },
    tags: ['care-instructions', 'cotton', 'washing', 'maintenance', 'longevity'],
    status: 'published',
    priority: 'medium',
    difficulty: 'beginner',
    estimatedReadTime: 6,
    stats: { views: 2340, likes: 76, bookmarks: 54, shares: 11, rating: 4.6, totalRatings: 134, helpful: 122, notHelpful: 7 },
    featured: false,
    trending: true,
    createdAt: '2024-01-25T11:00:00Z',
    updatedAt: '2024-02-02T13:20:00Z',
    publishedAt: '2024-01-25T15:30:00Z'
  },
  {
    id: '5',
    title: 'Area Rug Placement Guide for Every Room',
    excerpt: 'Professional tips for choosing and placing area rugs to enhance your room\'s aesthetics and functionality.',
    content: 'Transform your living spaces with proper rug placement and sizing...',
    slug: 'area-rug-placement-guide',
    category: { id: 'rugs-carpets', name: 'Rugs & Carpets', color: 'red' },
    author: { id: 'author6', name: 'Rajesh Kumar', avatar: '/avatars/rajesh.jpg', role: 'Interior Design Consultant' },
    tags: ['rugs', 'placement', 'room-design', 'sizing', 'decor'],
    status: 'published',
    priority: 'medium',
    difficulty: 'intermediate',
    estimatedReadTime: 9,
    stats: { views: 1980, likes: 65, bookmarks: 43, shares: 14, rating: 4.5, totalRatings: 98, helpful: 87, notHelpful: 6 },
    featured: false,
    trending: false,
    createdAt: '2024-01-28T14:20:00Z',
    updatedAt: '2024-02-05T10:15:00Z',
    publishedAt: '2024-01-28T17:00:00Z'
  },
  {
    id: '6',
    title: 'Understanding Thread Count and Fabric Quality',
    excerpt: 'Demystify thread count numbers and learn how to identify high-quality fabrics for your home.',
    content: 'Thread count is just one factor in determining fabric quality. Learn what really matters...',
    slug: 'understanding-thread-count-fabric-quality',
    category: { id: 'product-knowledge', name: 'Product Knowledge', color: 'indigo' },
    author: { id: 'author5', name: 'Priya Sharma', avatar: '/avatars/priya.jpg', role: 'Home Textile Expert' },
    tags: ['thread-count', 'fabric-quality', 'cotton', 'materials', 'education'],
    status: 'published',
    priority: 'medium',
    difficulty: 'intermediate',
    estimatedReadTime: 7,
    stats: { views: 2650, likes: 88, bookmarks: 62, shares: 16, rating: 4.8, totalRatings: 145, helpful: 138, notHelpful: 4 },
    featured: false,
    trending: true,
    createdAt: '2024-02-01T09:30:00Z',
    updatedAt: '2024-02-08T12:45:00Z',
    publishedAt: '2024-02-01T13:15:00Z'
  },
  {
    id: '7',
    title: 'Table Linen Selection for Special Occasions',
    excerpt: 'Choose the perfect tablecloths, runners, and placemats for festivals, parties, and dining experiences.',
    content: 'Elevate your dining experience with the right table linens for every occasion...',
    slug: 'table-linen-selection-special-occasions',
    category: { id: 'table-linens', name: 'Table Linens', color: 'pink' },
    author: { id: 'author8', name: 'Kavita Patel', avatar: '/avatars/kavita.jpg', role: 'Event Styling Expert' },
    tags: ['table-linens', 'occasions', 'dining', 'festivals', 'entertaining'],
    status: 'published',
    priority: 'low',
    difficulty: 'beginner',
    estimatedReadTime: 5,
    stats: { views: 1456, likes: 52, bookmarks: 31, shares: 9, rating: 4.4, totalRatings: 78, helpful: 69, notHelpful: 5 },
    featured: false,
    trending: false,
    createdAt: '2024-02-03T16:00:00Z',
    updatedAt: '2024-02-10T14:30:00Z',
    publishedAt: '2024-02-03T18:45:00Z'
  },
  {
    id: '8',
    title: 'Bathroom Towel Selection: GSM and Absorbency Guide',
    excerpt: 'Learn about GSM ratings, fabric types, and how to choose towels that offer the best comfort and durability.',
    content: 'Understanding GSM and fabric construction will help you choose perfect bathroom towels...',
    slug: 'bathroom-towel-selection-gsm-guide',
    category: { id: 'towels', name: 'Bath Towels', color: 'cyan' },
    author: { id: 'author7', name: 'Meera Gupta', avatar: '/avatars/meera.jpg', role: 'Textile Care Specialist' },
    tags: ['towels', 'gsm', 'absorbency', 'bathroom', 'comfort'],
    status: 'published',
    priority: 'medium',
    difficulty: 'beginner',
    estimatedReadTime: 6,
    stats: { views: 1789, likes: 61, bookmarks: 38, shares: 7, rating: 4.6, totalRatings: 92, helpful: 84, notHelpful: 3 },
    featured: false,
    trending: false,
    createdAt: '2024-02-05T11:15:00Z',
    updatedAt: '2024-02-12T15:20:00Z',
    publishedAt: '2024-02-05T14:00:00Z'
  },
  {
    id: '9',
    title: 'Returns and Exchange Policy Guide',
    excerpt: 'Complete overview of our return policy, exchange process, and warranty coverage for all products.',
    content: 'We want you to be completely satisfied with your purchase. Here\'s our return policy...',
    slug: 'returns-exchange-policy-guide',
    category: { id: 'policies', name: 'Policies', color: 'yellow' },
    author: { id: 'author1', name: 'Sarah Johnson', avatar: '/avatars/sarah.jpg', role: 'Customer Success' },
    tags: ['returns', 'exchange', 'policy', 'warranty', 'customer-service'],
    status: 'published',
    priority: 'high',
    difficulty: 'beginner',
    estimatedReadTime: 4,
    stats: { views: 3420, likes: 89, bookmarks: 56, shares: 12, rating: 4.5, totalRatings: 167, helpful: 152, notHelpful: 11 },
    featured: false,
    trending: true,
    createdAt: '2024-02-08T10:00:00Z',
    updatedAt: '2024-02-15T16:30:00Z',
    publishedAt: '2024-02-08T12:30:00Z'
  },
  {
    id: '10',
    title: 'Seasonal Home Decor: Transforming Spaces with Textiles',
    excerpt: 'Refresh your home for different seasons using strategic textile changes and color coordination.',
    content: 'Learn how to transform your home\'s look and feel with seasonal textile changes...',
    slug: 'seasonal-home-decor-textiles',
    category: { id: 'home-decor', name: 'Home Decor', color: 'teal' },
    author: { id: 'author6', name: 'Rajesh Kumar', avatar: '/avatars/rajesh.jpg', role: 'Interior Design Consultant' },
    tags: ['seasonal-decor', 'home-styling', 'color-coordination', 'textiles', 'interior-design'],
    status: 'published',
    priority: 'low',
    difficulty: 'intermediate',
    estimatedReadTime: 11,
    stats: { views: 2156, likes: 78, bookmarks: 49, shares: 15, rating: 4.7, totalRatings: 123, helpful: 114, notHelpful: 6 },
    featured: false,
    trending: false,
    createdAt: '2024-02-10T09:45:00Z',
    updatedAt: '2024-02-17T13:15:00Z',
    publishedAt: '2024-02-10T15:30:00Z'
  },
  {
    id: '11',
    title: 'Custom Orders and Bulk Purchase Options',
    excerpt: 'Information about custom sizing, bulk orders for businesses, and special requirements processing.',
    content: 'We offer custom solutions for unique requirements and bulk orders for businesses...',
    slug: 'custom-orders-bulk-purchase',
    category: { id: 'custom-orders', name: 'Custom Orders', color: 'violet' },
    author: { id: 'author9', name: 'Amit Singh', avatar: '/avatars/amit.jpg', role: 'Sales Manager' },
    tags: ['custom-orders', 'bulk-purchase', 'business', 'wholesale', 'special-requirements'],
    status: 'published',
    priority: 'medium',
    difficulty: 'advanced',
    estimatedReadTime: 8,
    stats: { views: 1345, likes: 45, bookmarks: 28, shares: 8, rating: 4.3, totalRatings: 67, helpful: 59, notHelpful: 4 },
    featured: false,
    trending: false,
    createdAt: '2024-02-12T14:20:00Z',
    updatedAt: '2024-02-19T11:40:00Z',
    publishedAt: '2024-02-12T16:00:00Z'
  },
  {
    id: '12',
    title: 'Eco-Friendly and Sustainable Textile Options',
    excerpt: 'Discover our range of organic, sustainable, and eco-friendly home textile products.',
    content: 'Learn about our commitment to sustainability and eco-friendly textile options...',
    slug: 'eco-friendly-sustainable-textiles',
    category: { id: 'sustainability', name: 'Sustainability', color: 'emerald' },
    author: { id: 'author10', name: 'Dr. Sunita Rao', avatar: '/avatars/sunita.jpg', role: 'Sustainability Officer' },
    tags: ['eco-friendly', 'sustainable', 'organic', 'environment', 'green-living'],
    status: 'published',
    priority: 'medium',
    difficulty: 'beginner',
    estimatedReadTime: 7,
    stats: { views: 1876, likes: 67, bookmarks: 42, shares: 13, rating: 4.6, totalRatings: 98, helpful: 89, notHelpful: 5 },
    featured: false,
    trending: true,
    createdAt: '2024-02-14T12:30:00Z',
    updatedAt: '2024-02-21T09:15:00Z',
    publishedAt: '2024-02-14T15:45:00Z'
  },
  {
    id: '13',
    title: 'Troubleshooting Common Fabric Issues',
    excerpt: 'Solutions for common problems like shrinking, fading, pilling, and staining of home textiles.',
    content: 'Learn how to prevent and fix common fabric issues to extend product life...',
    slug: 'troubleshooting-fabric-issues',
    category: { id: 'technical', name: 'Technical', color: 'red' },
    author: { id: 'author7', name: 'Meera Gupta', avatar: '/avatars/meera.jpg', role: 'Textile Care Specialist' },
    tags: ['troubleshooting', 'fabric-care', 'maintenance', 'problems', 'solutions'],
    status: 'published',
    priority: 'urgent',
    difficulty: 'advanced',
    estimatedReadTime: 10,
    stats: { views: 2567, likes: 94, bookmarks: 71, shares: 19, rating: 4.5, totalRatings: 178, helpful: 164, notHelpful: 9 },
    featured: false,
    trending: true,
    createdAt: '2024-02-16T08:45:00Z',
    updatedAt: '2024-02-23T14:20:00Z',
    publishedAt: '2024-02-16T11:30:00Z'
  },
  {
    id: '14',
    title: 'Gift Wrapping and Corporate Gifting Solutions',
    excerpt: 'Explore our gift wrapping services and corporate gifting options for festivals and special occasions.',
    content: 'Make your gifts special with our professional wrapping and corporate solutions...',
    slug: 'gift-wrapping-corporate-gifting',
    category: { id: 'gifting', name: 'Gifting', color: 'rose' },
    author: { id: 'author8', name: 'Kavita Patel', avatar: '/avatars/kavita.jpg', role: 'Event Styling Expert' },
    tags: ['gift-wrapping', 'corporate-gifts', 'festivals', 'occasions', 'services'],
    status: 'published',
    priority: 'low',
    difficulty: 'beginner',
    estimatedReadTime: 5,
    stats: { views: 1234, likes: 41, bookmarks: 25, shares: 6, rating: 4.4, totalRatings: 56, helpful: 48, notHelpful: 4 },
    featured: false,
    trending: false,
    createdAt: '2024-02-18T13:15:00Z',
    updatedAt: '2024-02-25T10:30:00Z',
    publishedAt: '2024-02-18T16:20:00Z'
  },
  {
    id: '15',
    title: 'Understanding Shipping and Delivery Options',
    excerpt: 'Learn about different shipping methods, delivery times, and tracking your home textile orders.',
    content: 'We offer several shipping options to ensure your products reach you safely...',
    slug: 'understanding-shipping-delivery',
    category: { id: 'shipping', name: 'Shipping', color: 'green' },
    author: { id: 'author2', name: 'Mike Chen', avatar: '/avatars/mike.jpg', role: 'Logistics Manager' },
    tags: ['shipping', 'delivery', 'tracking', 'logistics'],
    status: 'published',
    priority: 'medium',
    difficulty: 'beginner',
    estimatedReadTime: 3,
    stats: { views: 1890, likes: 67, bookmarks: 34, shares: 8, rating: 4.6, totalRatings: 98, helpful: 89, notHelpful: 5 },
    featured: false,
    trending: true,
    createdAt: '2024-01-18T10:15:00Z',
    updatedAt: '2024-01-22T16:45:00Z',
    publishedAt: '2024-01-18T14:00:00Z'
  },
  {
    id: '16',
    title: 'Payment Methods and Billing Information',
    excerpt: 'Complete overview of accepted payment methods, billing cycles, and invoice management.',
    content: 'We accept various payment methods to make your shopping experience convenient...',
    slug: 'payment-methods-billing',
    category: { id: 'billing', name: 'Billing', color: 'purple' },
    author: { id: 'author3', name: 'Emma Davis', avatar: '/avatars/emma.jpg', role: 'Finance Team' },
    tags: ['payment', 'billing', 'invoice'],
    status: 'published',
    priority: 'high',
    difficulty: 'intermediate',
    estimatedReadTime: 7,
    stats: { views: 3200, likes: 112, bookmarks: 78, shares: 15, rating: 4.7, totalRatings: 203, helpful: 185, notHelpful: 12 },
    featured: true,
    trending: false,
    createdAt: '2024-01-10T08:30:00Z',
    updatedAt: '2024-01-25T11:20:00Z',
    publishedAt: '2024-01-10T15:00:00Z'
  },
  {
    id: '17',
    title: 'Account Settings and Privacy Management',
    excerpt: 'Manage your account preferences, privacy settings, and security options for a personalized experience.',
    content: 'Your account settings allow you to customize your shopping experience...',
    slug: 'account-settings-privacy',
    category: { id: 'account', name: 'Account', color: 'indigo' },
    author: { id: 'author1', name: 'Sarah Johnson', avatar: '/avatars/sarah.jpg', role: 'Customer Success' },
    tags: ['account', 'privacy', 'security'],
    status: 'published',
    priority: 'medium',
    difficulty: 'beginner',
    estimatedReadTime: 4,
    stats: { views: 1650, likes: 54, bookmarks: 29, shares: 6, rating: 4.4, totalRatings: 78, helpful: 65, notHelpful: 8 },
    featured: false,
    trending: false,
    createdAt: '2024-01-20T11:00:00Z',
    updatedAt: '2024-01-24T13:50:00Z',
    publishedAt: '2024-01-20T14:15:00Z'
  },
  {
    id: '18',
    title: 'Size Guide for All Home Textile Products',
    excerpt: 'Comprehensive sizing guide for bed sheets, curtains, rugs, towels, and all home furnishing products.',
    content: 'Get the perfect fit every time with our detailed size guide for all products...',
    slug: 'size-guide-home-textiles',
    category: { id: 'sizing', name: 'Sizing Guide', color: 'amber' },
    author: { id: 'author5', name: 'Priya Sharma', avatar: '/avatars/priya.jpg', role: 'Home Textile Expert' },
    tags: ['sizing', 'measurements', 'fit', 'guide', 'products'],
    status: 'published',
    priority: 'high',
    difficulty: 'beginner',
    estimatedReadTime: 9,
    stats: { views: 4567, likes: 167, bookmarks: 123, shares: 34, rating: 4.9, totalRatings: 289, helpful: 276, notHelpful: 8 },
    featured: true,
    trending: true,
    createdAt: '2024-02-20T10:00:00Z',
    updatedAt: '2024-02-27T15:45:00Z',
    publishedAt: '2024-02-20T13:30:00Z'
  },
  {
    id: '19',
    title: 'Loyalty Program Benefits and Rewards',
    excerpt: 'Learn about our customer loyalty program, reward points, exclusive discounts, and member benefits.',
    content: 'Join our loyalty program to earn rewards and enjoy exclusive benefits...',
    slug: 'loyalty-program-benefits-rewards',
    category: { id: 'rewards', name: 'Rewards & Loyalty', color: 'gold' },
    author: { id: 'author9', name: 'Amit Singh', avatar: '/avatars/amit.jpg', role: 'Sales Manager' },
    tags: ['loyalty-program', 'rewards', 'benefits', 'discounts', 'membership'],
    status: 'published',
    priority: 'medium',
    difficulty: 'beginner',
    estimatedReadTime: 6,
    stats: { views: 2134, likes: 81, bookmarks: 47, shares: 12, rating: 4.5, totalRatings: 127, helpful: 116, notHelpful: 7 },
    featured: false,
    trending: false,
    createdAt: '2024-02-22T09:30:00Z',
    updatedAt: '2024-03-01T12:15:00Z',
    publishedAt: '2024-02-22T14:45:00Z'
  },
  {
    id: '20',
    title: 'Festival Collection and Seasonal Offers',
    excerpt: 'Stay updated with our special festival collections, seasonal discounts, and limited-time offers.',
    content: 'Celebrate every festival and season with our special collections and offers...',
    slug: 'festival-collection-seasonal-offers',
    category: { id: 'offers', name: 'Offers & Sales', color: 'lime' },
    author: { id: 'author8', name: 'Kavita Patel', avatar: '/avatars/kavita.jpg', role: 'Event Styling Expert' },
    tags: ['festivals', 'seasonal-offers', 'discounts', 'collections', 'limited-time'],
    status: 'published',
    priority: 'low',
    difficulty: 'beginner',
    estimatedReadTime: 4,
    stats: { views: 1789, likes: 63, bookmarks: 35, shares: 9, rating: 4.3, totalRatings: 89, helpful: 78, notHelpful: 6 },
    featured: false,
    trending: true,
    createdAt: '2024-02-24T11:20:00Z',
    updatedAt: '2024-03-03T16:00:00Z',
    publishedAt: '2024-02-24T15:15:00Z'
  },
  // Shopping & Browsing Articles
  {
    id: '21',
    title: 'How to Browse and Search Products Effectively',
    excerpt: 'Master our website navigation, search filters, and product discovery features to find exactly what you need.',
    content: 'Learn how to use our advanced search filters, category navigation, and product comparison tools...',
    slug: 'browse-search-products-effectively',
    category: { id: 'shopping-browsing', name: 'Shopping & Browsing', color: 'blue' },
    author: { id: 'author11', name: 'Ravi Krishnan', avatar: '/avatars/ravi.jpg', role: 'UX Designer' },
    tags: ['browsing', 'search', 'filters', 'navigation', 'product-discovery'],
    status: 'published',
    priority: 'high',
    difficulty: 'beginner',
    estimatedReadTime: 6,
    stats: { views: 3456, likes: 128, bookmarks: 89, shares: 22, rating: 4.7, totalRatings: 198, helpful: 184, notHelpful: 9 },
    featured: true,
    trending: true,
    createdAt: '2024-03-01T09:00:00Z',
    updatedAt: '2024-03-08T14:30:00Z',
    publishedAt: '2024-03-01T12:00:00Z'
  },
  {
    id: '22',
    title: 'Understanding Product Categories and Collections',
    excerpt: 'Navigate through our extensive product categories, seasonal collections, and curated home decor sets.',
    content: 'Discover how our products are organized and find the perfect items for your home...',
    slug: 'understanding-product-categories-collections',
    category: { id: 'shopping-browsing', name: 'Shopping & Browsing', color: 'blue' },
    author: { id: 'author8', name: 'Kavita Patel', avatar: '/avatars/kavita.jpg', role: 'Event Styling Expert' },
    tags: ['categories', 'collections', 'organization', 'product-types', 'navigation'],
    status: 'published',
    priority: 'medium',
    difficulty: 'beginner',
    estimatedReadTime: 5,
    stats: { views: 2234, likes: 87, bookmarks: 56, shares: 14, rating: 4.5, totalRatings: 143, helpful: 131, notHelpful: 8 },
    featured: false,
    trending: true,
    createdAt: '2024-03-03T10:15:00Z',
    updatedAt: '2024-03-10T16:45:00Z',
    publishedAt: '2024-03-03T14:00:00Z'
  },
  {
    id: '23',
    title: 'Using Wishlist and Product Comparison Features',
    excerpt: 'Save your favorite items, compare products side-by-side, and create personalized collections.',
    content: 'Make the most of our wishlist and comparison tools to make informed purchasing decisions...',
    slug: 'wishlist-product-comparison-features',
    category: { id: 'shopping-browsing', name: 'Shopping & Browsing', color: 'blue' },
    author: { id: 'author11', name: 'Ravi Krishnan', avatar: '/avatars/ravi.jpg', role: 'UX Designer' },
    tags: ['wishlist', 'comparison', 'favorites', 'features', 'shopping-tools'],
    status: 'published',
    priority: 'medium',
    difficulty: 'beginner',
    estimatedReadTime: 4,
    stats: { views: 1876, likes: 72, bookmarks: 45, shares: 11, rating: 4.4, totalRatings: 109, helpful: 98, notHelpful: 6 },
    featured: false,
    trending: false,
    createdAt: '2024-03-05T11:30:00Z',
    updatedAt: '2024-03-12T13:20:00Z',
    publishedAt: '2024-03-05T15:45:00Z'
  },
  {
    id: '24',
    title: 'Mobile App Shopping Guide',
    excerpt: 'Download and use our mobile app for convenient shopping, exclusive app-only deals, and on-the-go browsing.',
    content: 'Experience seamless mobile shopping with our feature-rich mobile application...',
    slug: 'mobile-app-shopping-guide',
    category: { id: 'shopping-browsing', name: 'Shopping & Browsing', color: 'blue' },
    author: { id: 'author12', name: 'Neha Agarwal', avatar: '/avatars/neha.jpg', role: 'Mobile App Developer' },
    tags: ['mobile-app', 'shopping', 'features', 'convenience', 'exclusive-deals'],
    status: 'published',
    priority: 'medium',
    difficulty: 'beginner',
    estimatedReadTime: 7,
    stats: { views: 2567, likes: 94, bookmarks: 61, shares: 18, rating: 4.6, totalRatings: 156, helpful: 142, notHelpful: 9 },
    featured: false,
    trending: true,
    createdAt: '2024-03-07T12:45:00Z',
    updatedAt: '2024-03-14T09:15:00Z',
    publishedAt: '2024-03-07T16:30:00Z'
  },
  // Orders & Payments Articles
  {
    id: '25',
    title: 'Complete Order Placement Guide',
    excerpt: 'Step-by-step instructions for placing orders, selecting quantities, choosing delivery options, and completing checkout.',
    content: 'Follow our comprehensive guide to place your order smoothly from cart to confirmation...',
    slug: 'complete-order-placement-guide',
    category: { id: 'orders-payments', name: 'Orders & Payments', color: 'green' },
    author: { id: 'author1', name: 'Sarah Johnson', avatar: '/avatars/sarah.jpg', role: 'Customer Success' },
    tags: ['order-placement', 'checkout', 'cart', 'delivery-options', 'confirmation'],
    status: 'published',
    priority: 'high',
    difficulty: 'beginner',
    estimatedReadTime: 8,
    stats: { views: 4123, likes: 152, bookmarks: 98, shares: 28, rating: 4.8, totalRatings: 234, helpful: 218, notHelpful: 11 },
    featured: true,
    trending: true,
    createdAt: '2024-03-09T08:30:00Z',
    updatedAt: '2024-03-16T11:20:00Z',
    publishedAt: '2024-03-09T12:00:00Z'
  },
  {
    id: '26',
    title: 'Payment Options and Security Features',
    excerpt: 'Explore all available payment methods, security measures, and tips for safe online transactions.',
    content: 'Learn about our secure payment gateway, various payment options, and transaction safety...',
    slug: 'payment-options-security-features',
    category: { id: 'orders-payments', name: 'Orders & Payments', color: 'green' },
    author: { id: 'author3', name: 'Emma Davis', avatar: '/avatars/emma.jpg', role: 'Finance Team' },
    tags: ['payment-methods', 'security', 'transactions', 'gateway', 'safety'],
    status: 'published',
    priority: 'high',
    difficulty: 'intermediate',
    estimatedReadTime: 9,
    stats: { views: 3789, likes: 134, bookmarks: 87, shares: 24, rating: 4.7, totalRatings: 201, helpful: 187, notHelpful: 8 },
    featured: true,
    trending: false,
    createdAt: '2024-03-11T10:00:00Z',
    updatedAt: '2024-03-18T15:30:00Z',
    publishedAt: '2024-03-11T14:15:00Z'
  },
  {
    id: '27',
    title: 'Order Modification and Cancellation Policy',
    excerpt: 'Learn how to modify, cancel, or make changes to your orders before and after confirmation.',
    content: 'Understand our policies and procedures for order changes, cancellations, and modifications...',
    slug: 'order-modification-cancellation-policy',
    category: { id: 'orders-payments', name: 'Orders & Payments', color: 'green' },
    author: { id: 'author1', name: 'Sarah Johnson', avatar: '/avatars/sarah.jpg', role: 'Customer Success' },
    tags: ['order-modification', 'cancellation', 'changes', 'policy', 'procedures'],
    status: 'published',
    priority: 'medium',
    difficulty: 'beginner',
    estimatedReadTime: 6,
    stats: { views: 2456, likes: 89, bookmarks: 54, shares: 16, rating: 4.5, totalRatings: 132, helpful: 121, notHelpful: 7 },
    featured: false,
    trending: true,
    createdAt: '2024-03-13T09:45:00Z',
    updatedAt: '2024-03-20T12:30:00Z',
    publishedAt: '2024-03-13T13:00:00Z'
  },
  {
    id: '28',
    title: 'EMI and Installment Payment Options',
    excerpt: 'Flexible payment plans, EMI options, and installment schemes for expensive home furnishing purchases.',
    content: 'Make your dream home affordable with our flexible payment and EMI options...',
    slug: 'emi-installment-payment-options',
    category: { id: 'orders-payments', name: 'Orders & Payments', color: 'green' },
    author: { id: 'author3', name: 'Emma Davis', avatar: '/avatars/emma.jpg', role: 'Finance Team' },
    tags: ['emi', 'installments', 'flexible-payment', 'financing', 'affordability'],
    status: 'published',
    priority: 'medium',
    difficulty: 'intermediate',
    estimatedReadTime: 7,
    stats: { views: 1998, likes: 76, bookmarks: 48, shares: 13, rating: 4.4, totalRatings: 118, helpful: 106, notHelpful: 8 },
    featured: false,
    trending: false,
    createdAt: '2024-03-15T11:15:00Z',
    updatedAt: '2024-03-22T14:45:00Z',
    publishedAt: '2024-03-15T16:00:00Z'
  },
  // Shipping & Delivery Articles
  {
    id: '29',
    title: 'Comprehensive Shipping and Delivery Guide',
    excerpt: 'Everything about shipping zones, delivery times, packaging, and tracking your home textile orders.',
    content: 'Get detailed information about our shipping process, delivery options, and tracking system...',
    slug: 'comprehensive-shipping-delivery-guide',
    category: { id: 'shipping-delivery', name: 'Shipping & Delivery', color: 'purple' },
    author: { id: 'author2', name: 'Mike Chen', avatar: '/avatars/mike.jpg', role: 'Logistics Manager' },
    tags: ['shipping', 'delivery', 'tracking', 'packaging', 'logistics'],
    status: 'published',
    priority: 'high',
    difficulty: 'beginner',
    estimatedReadTime: 10,
    stats: { views: 4567, likes: 167, bookmarks: 112, shares: 31, rating: 4.8, totalRatings: 278, helpful: 259, notHelpful: 13 },
    featured: true,
    trending: true,
    createdAt: '2024-03-17T08:00:00Z',
    updatedAt: '2024-03-24T12:15:00Z',
    publishedAt: '2024-03-17T11:30:00Z'
  },
  {
    id: '30',
    title: 'Express and Same-Day Delivery Options',
    excerpt: 'Fast delivery services, same-day delivery availability, and express shipping for urgent orders.',
    content: 'When you need your home textiles quickly, explore our express delivery options...',
    slug: 'express-same-day-delivery-options',
    category: { id: 'shipping-delivery', name: 'Shipping & Delivery', color: 'purple' },
    author: { id: 'author2', name: 'Mike Chen', avatar: '/avatars/mike.jpg', role: 'Logistics Manager' },
    tags: ['express-delivery', 'same-day', 'fast-shipping', 'urgent-orders', 'quick-delivery'],
    status: 'published',
    priority: 'medium',
    difficulty: 'beginner',
    estimatedReadTime: 5,
    stats: { views: 2789, likes: 102, bookmarks: 67, shares: 19, rating: 4.6, totalRatings: 158, helpful: 144, notHelpful: 9 },
    featured: false,
    trending: true,
    createdAt: '2024-03-19T10:30:00Z',
    updatedAt: '2024-03-26T15:45:00Z',
    publishedAt: '2024-03-19T14:00:00Z'
  },
  {
    id: '31',
    title: 'International Shipping and Global Delivery',
    excerpt: 'Ship Vardhman Mills products worldwide with our international delivery service and customs information.',
    content: 'Bring the comfort of Indian home textiles to your doorstep anywhere in the world...',
    slug: 'international-shipping-global-delivery',
    category: { id: 'shipping-delivery', name: 'Shipping & Delivery', color: 'purple' },
    author: { id: 'author13', name: 'Vikram Singh', avatar: '/avatars/vikram.jpg', role: 'International Logistics' },
    tags: ['international-shipping', 'global-delivery', 'customs', 'worldwide', 'export'],
    status: 'published',
    priority: 'medium',
    difficulty: 'intermediate',
    estimatedReadTime: 8,
    stats: { views: 1654, likes: 58, bookmarks: 39, shares: 12, rating: 4.3, totalRatings: 87, helpful: 78, notHelpful: 6 },
    featured: false,
    trending: false,
    createdAt: '2024-03-21T12:00:00Z',
    updatedAt: '2024-03-28T09:30:00Z',
    publishedAt: '2024-03-21T16:15:00Z'
  },
  {
    id: '32',
    title: 'Delivery Issues and Problem Resolution',
    excerpt: 'Handle delivery delays, damaged packages, wrong deliveries, and other shipping-related problems.',
    content: 'Quick solutions for common delivery issues and how to get immediate assistance...',
    slug: 'delivery-issues-problem-resolution',
    category: { id: 'shipping-delivery', name: 'Shipping & Delivery', color: 'purple' },
    author: { id: 'author2', name: 'Mike Chen', avatar: '/avatars/mike.jpg', role: 'Logistics Manager' },
    tags: ['delivery-issues', 'problems', 'resolution', 'delays', 'damage'],
    status: 'published',
    priority: 'urgent',
    difficulty: 'beginner',
    estimatedReadTime: 6,
    stats: { views: 3234, likes: 118, bookmarks: 78, shares: 22, rating: 4.5, totalRatings: 189, helpful: 173, notHelpful: 11 },
    featured: false,
    trending: true,
    createdAt: '2024-03-23T13:45:00Z',
    updatedAt: '2024-03-30T11:20:00Z',
    publishedAt: '2024-03-23T17:30:00Z'
  },
  // Returns & Refunds Articles
  {
    id: '33',
    title: 'Easy Returns Process and Guidelines',
    excerpt: 'Simple step-by-step process for returning products, return window, and what items are eligible for return.',
    content: 'Our hassle-free return process ensures complete customer satisfaction...',
    slug: 'easy-returns-process-guidelines',
    category: { id: 'returns-refunds', name: 'Returns & Refunds', color: 'red' },
    author: { id: 'author1', name: 'Sarah Johnson', avatar: '/avatars/sarah.jpg', role: 'Customer Success' },
    tags: ['returns', 'process', 'guidelines', 'eligibility', 'satisfaction'],
    status: 'published',
    priority: 'high',
    difficulty: 'beginner',
    estimatedReadTime: 7,
    stats: { views: 3890, likes: 142, bookmarks: 95, shares: 26, rating: 4.7, totalRatings: 223, helpful: 207, notHelpful: 12 },
    featured: true,
    trending: true,
    createdAt: '2024-03-25T09:15:00Z',
    updatedAt: '2024-04-01T14:00:00Z',
    publishedAt: '2024-03-25T12:45:00Z'
  },
  {
    id: '34',
    title: 'Refund Methods and Processing Times',
    excerpt: 'Understanding refund options, processing timelines, and how refunds are credited back to your account.',
    content: 'Get clarity on our refund process, timelines, and various refund methods available...',
    slug: 'refund-methods-processing-times',
    category: { id: 'returns-refunds', name: 'Returns & Refunds', color: 'red' },
    author: { id: 'author3', name: 'Emma Davis', avatar: '/avatars/emma.jpg', role: 'Finance Team' },
    tags: ['refunds', 'processing', 'timeline', 'methods', 'credit'],
    status: 'published',
    priority: 'high',
    difficulty: 'beginner',
    estimatedReadTime: 5,
    stats: { views: 2976, likes: 108, bookmarks: 71, shares: 18, rating: 4.6, totalRatings: 167, helpful: 154, notHelpful: 8 },
    featured: false,
    trending: true,
    createdAt: '2024-03-27T10:30:00Z',
    updatedAt: '2024-04-03T15:45:00Z',
    publishedAt: '2024-03-27T14:15:00Z'
  },
  {
    id: '35',
    title: 'Exchange and Replacement Services',
    excerpt: 'Exchange products for different sizes, colors, or styles, and replacement options for defective items.',
    content: 'Convenient exchange options to ensure you get exactly what you want for your home...',
    slug: 'exchange-replacement-services',
    category: { id: 'returns-refunds', name: 'Returns & Refunds', color: 'red' },
    author: { id: 'author1', name: 'Sarah Johnson', avatar: '/avatars/sarah.jpg', role: 'Customer Success' },
    tags: ['exchange', 'replacement', 'size-change', 'color-change', 'defective'],
    status: 'published',
    priority: 'medium',
    difficulty: 'beginner',
    estimatedReadTime: 6,
    stats: { views: 2345, likes: 84, bookmarks: 52, shares: 14, rating: 4.4, totalRatings: 128, helpful: 117, notHelpful: 7 },
    featured: false,
    trending: false,
    createdAt: '2024-03-29T11:45:00Z',
    updatedAt: '2024-04-05T13:30:00Z',
    publishedAt: '2024-03-29T16:00:00Z'
  },
  {
    id: '36',
    title: 'Quality Guarantee and Warranty Claims',
    excerpt: 'Our quality promise, warranty coverage, and how to claim warranty for manufacturing defects.',
    content: 'Understand our quality guarantee and warranty policies for all home textile products...',
    slug: 'quality-guarantee-warranty-claims',
    category: { id: 'returns-refunds', name: 'Returns & Refunds', color: 'red' },
    author: { id: 'author14', name: 'Dr. Arjun Mehta', avatar: '/avatars/arjun.jpg', role: 'Quality Assurance Manager' },
    tags: ['quality-guarantee', 'warranty', 'claims', 'defects', 'coverage'],
    status: 'published',
    priority: 'medium',
    difficulty: 'intermediate',
    estimatedReadTime: 8,
    stats: { views: 1876, likes: 67, bookmarks: 43, shares: 11, rating: 4.5, totalRatings: 94, helpful: 86, notHelpful: 5 },
    featured: false,
    trending: false,
    createdAt: '2024-03-31T14:20:00Z',
    updatedAt: '2024-04-07T10:15:00Z',
    publishedAt: '2024-03-31T17:45:00Z'
  },
  // Account & Security Articles
  {
    id: '37',
    title: 'Creating and Managing Your Account',
    excerpt: 'Complete guide to account creation, profile management, and personalizing your shopping experience.',
    content: 'Set up your Vardhman Mills account and customize it for the best shopping experience...',
    slug: 'creating-managing-your-account',
    category: { id: 'account-security', name: 'Account & Security', color: 'indigo' },
    author: { id: 'author15', name: 'Anita Sharma', avatar: '/avatars/anita.jpg', role: 'Account Manager' },
    tags: ['account-creation', 'profile-management', 'personalization', 'setup', 'customization'],
    status: 'published',
    priority: 'high',
    difficulty: 'beginner',
    estimatedReadTime: 6,
    stats: { views: 3456, likes: 126, bookmarks: 82, shares: 21, rating: 4.6, totalRatings: 187, helpful: 171, notHelpful: 10 },
    featured: false,
    trending: true,
    createdAt: '2024-04-02T09:00:00Z',
    updatedAt: '2024-04-09T14:30:00Z',
    publishedAt: '2024-04-02T12:15:00Z'
  },
  {
    id: '38',
    title: 'Password Security and Two-Factor Authentication',
    excerpt: 'Protect your account with strong passwords, enable 2FA, and learn about our security measures.',
    content: 'Keep your account secure with our comprehensive security features and best practices...',
    slug: 'password-security-two-factor-authentication',
    category: { id: 'account-security', name: 'Account & Security', color: 'indigo' },
    author: { id: 'author16', name: 'Cybersecurity Team', avatar: '/avatars/security.jpg', role: 'Security Specialist' },
    tags: ['password-security', 'two-factor-auth', '2fa', 'account-protection', 'security'],
    status: 'published',
    priority: 'high',
    difficulty: 'intermediate',
    estimatedReadTime: 7,
    stats: { views: 2789, likes: 98, bookmarks: 64, shares: 17, rating: 4.7, totalRatings: 156, helpful: 144, notHelpful: 8 },
    featured: false,
    trending: false,
    createdAt: '2024-04-04T10:45:00Z',
    updatedAt: '2024-04-11T16:20:00Z',
    publishedAt: '2024-04-04T15:00:00Z'
  },
  {
    id: '39',
    title: 'Privacy Settings and Data Management',
    excerpt: 'Control your privacy settings, manage personal data, and understand how we protect your information.',
    content: 'Take control of your privacy with our comprehensive data management tools...',
    slug: 'privacy-settings-data-management',
    category: { id: 'account-security', name: 'Account & Security', color: 'indigo' },
    author: { id: 'author16', name: 'Cybersecurity Team', avatar: '/avatars/security.jpg', role: 'Security Specialist' },
    tags: ['privacy-settings', 'data-management', 'personal-data', 'privacy-control', 'information-protection'],
    status: 'published',
    priority: 'medium',
    difficulty: 'intermediate',
    estimatedReadTime: 8,
    stats: { views: 2134, likes: 76, bookmarks: 49, shares: 13, rating: 4.4, totalRatings: 118, helpful: 107, notHelpful: 7 },
    featured: false,
    trending: false,
    createdAt: '2024-04-06T12:30:00Z',
    updatedAt: '2024-04-13T09:45:00Z',
    publishedAt: '2024-04-06T16:45:00Z'
  },
  {
    id: '40',
    title: 'Account Recovery and Troubleshooting',
    excerpt: 'Recover forgotten passwords, unlock accounts, and resolve common account access issues.',
    content: 'Quick solutions for account access problems and recovery procedures...',
    slug: 'account-recovery-troubleshooting',
    category: { id: 'account-security', name: 'Account & Security', color: 'indigo' },
    author: { id: 'author15', name: 'Anita Sharma', avatar: '/avatars/anita.jpg', role: 'Account Manager' },
    tags: ['account-recovery', 'password-reset', 'account-unlock', 'troubleshooting', 'access-issues'],
    status: 'published',
    priority: 'urgent',
    difficulty: 'beginner',
    estimatedReadTime: 5,
    stats: { views: 2987, likes: 109, bookmarks: 68, shares: 19, rating: 4.5, totalRatings: 164, helpful: 151, notHelpful: 9 },
    featured: false,
    trending: true,
    createdAt: '2024-04-08T11:15:00Z',
    updatedAt: '2024-04-15T14:00:00Z',
    publishedAt: '2024-04-08T15:30:00Z'
  },
  // Product Care & Maintenance Articles
  {
    id: '41',
    title: 'Complete Fabric Care Encyclopedia',
    excerpt: 'Comprehensive care instructions for cotton, silk, linen, synthetic blends, and specialty fabrics.',
    content: 'Master the art of fabric care with our detailed guide for every type of home textile...',
    slug: 'complete-fabric-care-encyclopedia',
    category: { id: 'product-care', name: 'Product Care & Maintenance', color: 'orange' },
    author: { id: 'author7', name: 'Meera Gupta', avatar: '/avatars/meera.jpg', role: 'Textile Care Specialist' },
    tags: ['fabric-care', 'maintenance', 'washing', 'care-instructions', 'textile-care'],
    status: 'published',
    priority: 'high',
    difficulty: 'intermediate',
    estimatedReadTime: 12,
    stats: { views: 4234, likes: 158, bookmarks: 106, shares: 29, rating: 4.8, totalRatings: 267, helpful: 248, notHelpful: 14 },
    featured: true,
    trending: true,
    createdAt: '2024-04-10T08:30:00Z',
    updatedAt: '2024-04-17T12:45:00Z',
    publishedAt: '2024-04-10T11:15:00Z'
  },
  {
    id: '42',
    title: 'Stain Removal Guide for Home Textiles',
    excerpt: 'Expert techniques for removing common stains from bed sheets, curtains, upholstery, and carpets.',
    content: 'Professional stain removal techniques to keep your home textiles looking pristine...',
    slug: 'stain-removal-guide-home-textiles',
    category: { id: 'product-care', name: 'Product Care & Maintenance', color: 'orange' },
    author: { id: 'author7', name: 'Meera Gupta', avatar: '/avatars/meera.jpg', role: 'Textile Care Specialist' },
    tags: ['stain-removal', 'cleaning', 'maintenance', 'techniques', 'fabric-care'],
    status: 'published',
    priority: 'medium',
    difficulty: 'intermediate',
    estimatedReadTime: 9,
    stats: { views: 3567, likes: 132, bookmarks: 89, shares: 24, rating: 4.7, totalRatings: 198, helpful: 184, notHelpful: 10 },
    featured: false,
    trending: true,
    createdAt: '2024-04-12T10:00:00Z',
    updatedAt: '2024-04-19T15:30:00Z',
    publishedAt: '2024-04-12T14:15:00Z'
  },
  {
    id: '43',
    title: 'Seasonal Storage and Protection Tips',
    excerpt: 'Proper storage techniques for seasonal items, protection from moths, moisture, and maintaining quality.',
    content: 'Learn how to properly store your home textiles during off-seasons to maintain their quality...',
    slug: 'seasonal-storage-protection-tips',
    category: { id: 'product-care', name: 'Product Care & Maintenance', color: 'orange' },
    author: { id: 'author7', name: 'Meera Gupta', avatar: '/avatars/meera.jpg', role: 'Textile Care Specialist' },
    tags: ['storage', 'seasonal-care', 'protection', 'moth-prevention', 'quality-maintenance'],
    status: 'published',
    priority: 'low',
    difficulty: 'beginner',
    estimatedReadTime: 6,
    stats: { views: 1987, likes: 71, bookmarks: 46, shares: 12, rating: 4.4, totalRatings: 112, helpful: 102, notHelpful: 6 },
    featured: false,
    trending: false,
    createdAt: '2024-04-14T13:20:00Z',
    updatedAt: '2024-04-21T10:45:00Z',
    publishedAt: '2024-04-14T17:00:00Z'
  },
  {
    id: '44',
    title: 'Professional Cleaning Services and When to Use Them',
    excerpt: 'When to choose professional cleaning, dry cleaning options, and our recommended cleaning partners.',
    content: 'Know when to seek professional cleaning services for your valuable home textiles...',
    slug: 'professional-cleaning-services-guide',
    category: { id: 'product-care', name: 'Product Care & Maintenance', color: 'orange' },
    author: { id: 'author17', name: 'Cleaning Services Team', avatar: '/avatars/cleaning.jpg', role: 'Professional Cleaner' },
    tags: ['professional-cleaning', 'dry-cleaning', 'services', 'recommendations', 'expert-care'],
    status: 'published',
    priority: 'medium',
    difficulty: 'advanced',
    estimatedReadTime: 7,
    stats: { views: 2456, likes: 87, bookmarks: 58, shares: 15, rating: 4.5, totalRatings: 143, helpful: 131, notHelpful: 8 },
    featured: false,
    trending: false,
    createdAt: '2024-04-16T09:45:00Z',
    updatedAt: '2024-04-23T14:20:00Z',
    publishedAt: '2024-04-16T13:30:00Z'
  },
  // Customer Support Articles
  {
    id: '45',
    title: 'How to Contact Customer Support',
    excerpt: 'Multiple ways to reach our support team: phone, email, chat, and social media channels.',
    content: 'Get the help you need through various convenient support channels available 24/7...',
    slug: 'how-to-contact-customer-support',
    category: { id: 'customer-support', name: 'Customer Support', color: 'teal' },
    author: { id: 'author1', name: 'Sarah Johnson', avatar: '/avatars/sarah.jpg', role: 'Customer Success' },
    tags: ['customer-support', 'contact', 'help', 'support-channels', 'assistance'],
    status: 'published',
    priority: 'high',
    difficulty: 'beginner',
    estimatedReadTime: 4,
    stats: { views: 3789, likes: 138, bookmarks: 91, shares: 23, rating: 4.6, totalRatings: 212, helpful: 196, notHelpful: 12 },
    featured: false,
    trending: true,
    createdAt: '2024-04-18T08:00:00Z',
    updatedAt: '2024-04-25T12:30:00Z',
    publishedAt: '2024-04-18T11:45:00Z'
  },
  {
    id: '46',
    title: 'Live Chat and Instant Support Features',
    excerpt: 'Use our live chat system, AI assistant, and instant support features for quick problem resolution.',
    content: 'Get immediate assistance with our advanced live chat and AI-powered support tools...',
    slug: 'live-chat-instant-support-features',
    category: { id: 'customer-support', name: 'Customer Support', color: 'teal' },
    author: { id: 'author18', name: 'Tech Support Team', avatar: '/avatars/tech.jpg', role: 'Technical Support Lead' },
    tags: ['live-chat', 'instant-support', 'ai-assistant', 'quick-help', 'real-time'],
    status: 'published',
    priority: 'medium',
    difficulty: 'beginner',
    estimatedReadTime: 5,
    stats: { views: 2567, likes: 94, bookmarks: 61, shares: 16, rating: 4.5, totalRatings: 147, helpful: 134, notHelpful: 9 },
    featured: false,
    trending: true,
    createdAt: '2024-04-20T10:30:00Z',
    updatedAt: '2024-04-27T15:15:00Z',
    publishedAt: '2024-04-20T14:45:00Z'
  },
  {
    id: '47',
    title: 'Escalation Process and Complaint Resolution',
    excerpt: 'When standard support isn\'t enough: escalation procedures, complaint handling, and resolution timelines.',
    content: 'Understand our escalation process for complex issues and complaint resolution procedures...',
    slug: 'escalation-process-complaint-resolution',
    category: { id: 'customer-support', name: 'Customer Support', color: 'teal' },
    author: { id: 'author19', name: 'Customer Relations Manager', avatar: '/avatars/relations.jpg', role: 'Customer Relations' },
    tags: ['escalation', 'complaints', 'resolution', 'procedures', 'complex-issues'],
    status: 'published',
    priority: 'medium',
    difficulty: 'intermediate',
    estimatedReadTime: 8,
    stats: { views: 1876, likes: 67, bookmarks: 44, shares: 11, rating: 4.4, totalRatings: 98, helpful: 89, notHelpful: 6 },
    featured: false,
    trending: false,
    createdAt: '2024-04-22T12:15:00Z',
    updatedAt: '2024-04-29T09:00:00Z',
    publishedAt: '2024-04-22T16:30:00Z'
  },
  {
    id: '48',
    title: 'Self-Service Support and FAQ Resources',
    excerpt: 'Find answers quickly with our comprehensive FAQ, video tutorials, and self-service support tools.',
    content: 'Empower yourself with our extensive self-service resources and knowledge base...',
    slug: 'self-service-support-faq-resources',
    category: { id: 'customer-support', name: 'Customer Support', color: 'teal' },
    author: { id: 'author11', name: 'Ravi Krishnan', avatar: '/avatars/ravi.jpg', role: 'UX Designer' },
    tags: ['self-service', 'faq', 'tutorials', 'knowledge-base', 'resources'],
    status: 'published',
    priority: 'low',
    difficulty: 'beginner',
    estimatedReadTime: 6,
    stats: { views: 2234, likes: 81, bookmarks: 53, shares: 14, rating: 4.3, totalRatings: 124, helpful: 113, notHelpful: 7 },
    featured: false,
    trending: false,
    createdAt: '2024-04-24T11:00:00Z',
    updatedAt: '2024-05-01T13:45:00Z',
    publishedAt: '2024-04-24T15:20:00Z'
  }
];

// Utility functions
const formatNumber = (num: number) => {
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}k`;
  return `${(num / 1000000).toFixed(1)}m`;
};

const getDifficultyColor = (difficulty: string) => {
  const colors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  };
  return colors[difficulty as keyof typeof colors] || colors.beginner;
};

const getPriorityColor = (priority: string) => {
  const colors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };
  return colors[priority as keyof typeof colors] || colors.medium;
};

const filterArticles = (articles: HelpArticle[], searchTerm: string, filters: Partial<FilterOptions>) => {
  let filtered = articles;

  // Search filter
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(article =>
      article.title.toLowerCase().includes(term) ||
      article.excerpt.toLowerCase().includes(term) ||
      article.tags.some(tag => tag.toLowerCase().includes(term)) ||
      article.category.name.toLowerCase().includes(term) ||
      article.author.name.toLowerCase().includes(term)
    );
  }

  // Category filter
  if (filters.categories && filters.categories.length > 0) {
    filtered = filtered.filter(article => 
      filters.categories!.includes(article.category.id)
    );
  }

  // Tags filter
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter(article =>
      article.tags.some(tag => filters.tags!.includes(tag))
    );
  }

  // Difficulty filter
  if (filters.difficulty && filters.difficulty.length > 0) {
    filtered = filtered.filter(article => 
      filters.difficulty!.includes(article.difficulty)
    );
  }

  // Priority filter
  if (filters.priority && filters.priority.length > 0) {
    filtered = filtered.filter(article => 
      filters.priority!.includes(article.priority)
    );
  }

  // Status filter
  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter(article => 
      filters.status!.includes(article.status)
    );
  }

  // Rating filter
  if (filters.rating?.min !== undefined) {
    filtered = filtered.filter(article => 
      article.stats.rating >= filters.rating!.min!
    );
  }

  // Read time filter
  if (filters.readTime?.min !== undefined || filters.readTime?.max !== undefined) {
    filtered = filtered.filter(article => {
      const time = article.estimatedReadTime;
      const min = filters.readTime?.min ?? 0;
      const max = filters.readTime?.max ?? Infinity;
      return time >= min && time <= max;
    });
  }

  return filtered;
};

const sortArticles = (articles: HelpArticle[], sortBy: string) => {
  const sortOption = sortOptions.find(option => option.value === sortBy);
  if (!sortOption) return articles;

  return [...articles].sort((a, b) => {
    let aValue: unknown;
    let bValue: unknown;

    // Handle nested properties
    if (sortOption.field.includes('.')) {
      const [obj, prop] = sortOption.field.split('.');
      aValue = (a as unknown as Record<string, Record<string, unknown>>)[obj as string]?.[prop as string];
      bValue = (b as unknown as Record<string, Record<string, unknown>>)[obj as string]?.[prop as string];
    } else {
      aValue = a[sortOption.field as keyof HelpArticle];
      bValue = b[sortOption.field as keyof HelpArticle];
    }

    // Handle different data types
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      if (sortOption.direction === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      if (sortOption.direction === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    } else {
      // Handle dates and other types
      const aTime = new Date(aValue as string).getTime();
      const bTime = new Date(bValue as string).getTime();
      if (sortOption.direction === 'asc') {
        return aTime - bTime;
      } else {
        return bTime - aTime;
      }
    }
  });
};

// Main Component
const HelpList: React.FC<HelpListProps> = ({
  articles = defaultArticles,
  onArticleClick,
  onArticleLike,
  onArticleBookmark,
  onArticleShare,
  searchTerm = '',
  onSearchChange,
  filters = {},
  onFiltersChange,
  sortBy = 'relevance',
  onSortChange,
  viewMode = 'grid',
  onViewModeChange,
  userInteractions = {},
  showFilters = true,
  showSearch = true,
  showSorting = true,
  showViewToggle = true,
  showStats = true,
  showFeatured = true,
  itemsPerPage = 12,
  enablePagination = true,
  className,
  enableAnimations = true
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Process articles
  const processedArticles = useMemo(() => {
    const filtered = filterArticles(articles, localSearchTerm, filters);
    return sortArticles(filtered, sortBy);
  }, [articles, localSearchTerm, filters, sortBy]);

  const featuredArticles = useMemo(() => {
    return processedArticles.filter(article => article.featured);
  }, [processedArticles]);

  const regularArticles = useMemo(() => {
    return processedArticles.filter(article => !article.featured);
  }, [processedArticles]);

  // Pagination
  const totalPages = Math.ceil(regularArticles.length / itemsPerPage);
  const paginatedArticles = enablePagination 
    ? regularArticles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : regularArticles;

  // Handle search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    onSearchChange?.(value);
    setCurrentPage(1);
  };

  // Handle article click
  const handleArticleClick = (article: HelpArticle) => {
    onArticleClick?.(article);
  };

  // Handle interactions
  const handleLike = (articleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onArticleLike?.(articleId);
  };

  const handleBookmark = (articleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onArticleBookmark?.(articleId);
  };

  const handleShare = (articleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onArticleShare?.(articleId);
  };

  // Render article card
  const renderArticleCard = (article: HelpArticle, featured = false) => {
    const interactions = userInteractions[article.id] || { liked: false, bookmarked: false, viewed: false };

    if (viewMode === 'list') {
      return (
        <motion.div
          key={article.id}
          variants={enableAnimations ? itemVariants : undefined}
          whileHover={enableAnimations ? "hover" : undefined}
          onClick={() => handleArticleClick(article)}
        >
          <Card className="p-4 cursor-pointer transition-all duration-200 hover:shadow-md">
            <div className="flex items-start gap-4">
              {/* Indicators */}
              <div className="flex flex-col gap-2">
                {article.trending && (
                  <Badge variant="outline" size="sm" className="bg-orange-100 text-orange-800">
                    <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                    Trending
                  </Badge>
                )}
                {featured && (
                  <Badge variant="outline" size="sm" className="bg-purple-100 text-purple-800">
                    <FireIconSolid className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {article.title}
                  </h3>
                  <div className="flex items-center gap-1 ml-4">
                    {showStats && (
                      <>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <EyeIcon className="h-3 w-3" />
                          {formatNumber(article.stats.views)}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 ml-2">
                          <StarIcon className="h-3 w-3" />
                          {article.stats.rating.toFixed(1)}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {article.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={getDifficultyColor(article.difficulty)} size="sm">
                      {article.difficulty}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {article.estimatedReadTime} min read
                    </span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(article.publishedAt), 'MMM dd, yyyy')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleLike(article.id, e)}
                      className="p-1"
                    >
                      {interactions.liked ? (
                        <HeartIconSolid className="h-4 w-4 text-red-500" />
                      ) : (
                        <HeartIcon className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleBookmark(article.id, e)}
                      className="p-1"
                    >
                      {interactions.bookmarked ? (
                        <BookmarkIconSolid className="h-4 w-4 text-blue-500" />
                      ) : (
                        <BookmarkIcon className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleShare(article.id, e)}
                      className="p-1"
                    >
                      <ShareIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      );
    }

    // Grid view
    return (
      <motion.div
        key={article.id}
        variants={enableAnimations ? itemVariants : undefined}
        whileHover={enableAnimations ? "hover" : undefined}
        onClick={() => handleArticleClick(article)}
      >
        <Card className={cn(
          'p-6 cursor-pointer transition-all duration-200 hover:shadow-lg',
          featured && 'border-2 border-purple-200 bg-purple-50'
        )}>
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                size="sm"
                style={{ backgroundColor: `var(--${article.category.color}-100)`, color: `var(--${article.category.color}-800)` }}
              >
                {article.category.name}
              </Badge>
              {article.trending && (
                <Badge variant="outline" size="sm" className="bg-orange-100 text-orange-800">
                  <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                  Hot
                </Badge>
              )}
              {featured && (
                <Badge variant="outline" size="sm" className="bg-purple-100 text-purple-800">
                  <FireIconSolid className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            <Badge className={getPriorityColor(article.priority)} size="sm">
              {article.priority}
            </Badge>
          </div>

          {/* Content */}
          <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
            {article.title}
          </h3>
          <p className="text-gray-600 mb-4 line-clamp-3">
            {article.excerpt}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-4">
            {article.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" size="sm" className="text-xs">
                {tag}
              </Badge>
            ))}
            {article.tags.length > 3 && (
              <Badge variant="outline" size="sm" className="text-xs">
                +{article.tags.length - 3}
              </Badge>
            )}
          </div>

          {/* Stats */}
          {showStats && (
            <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {formatNumber(article.stats.views)}
                </div>
                <div className="text-xs text-gray-500">Views</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {article.stats.rating.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {formatNumber(article.stats.likes)}
                </div>
                <div className="text-xs text-gray-500">Likes</div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar
                src={article.author.avatar}
                alt={article.author.name}
                size="sm"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {article.author.name}
                </div>
                <div className="text-xs text-gray-500">
                  {article.estimatedReadTime} min read • {format(new Date(article.publishedAt), 'MMM dd')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleLike(article.id, e)}
                className="p-1"
              >
                {interactions.liked ? (
                  <HeartIconSolid className="h-4 w-4 text-red-500" />
                ) : (
                  <HeartIcon className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleBookmark(article.id, e)}
                className="p-1"
              >
                {interactions.bookmarked ? (
                  <BookmarkIconSolid className="h-4 w-4 text-blue-500" />
                ) : (
                  <BookmarkIcon className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleShare(article.id, e)}
                className="p-1"
              >
                <ShareIcon className="h-4 w-4" />
              </Button>
              <ChevronRightIcon className="h-4 w-4 text-gray-400 ml-2" />
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Help Articles</h2>
          <p className="text-gray-600 mt-1">
            {processedArticles.length} article{processedArticles.length !== 1 ? 's' : ''} found
          </p>
        </div>
        
        {/* View Controls */}
        {showViewToggle && (
          <div className="flex items-center gap-2">
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

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        {showSearch && (
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={localSearchTerm}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
        )}

        {/* Sort and Filter Controls */}
        <div className="flex items-center gap-2">
          {showSorting && (
            <Select
              options={sortOptions.map(option => ({ value: option.value, label: option.label }))}
              value={sortBy}
              onValueChange={(value) => onSortChange?.(String(value))}
              placeholder="Sort by..."
            />
          )}

          {showFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filters
            </Button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFiltersPanel && (
          <motion.div
            variants={enableAnimations ? filterVariants : undefined}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFiltersPanel(false)}
                >
                  <XMarkIcon className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Difficulty Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <div className="space-y-2">
                    {['beginner', 'intermediate', 'advanced'].map((difficulty) => (
                      <label key={difficulty} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.difficulty?.includes(difficulty) || false}
                          onChange={(e) => {
                            const newDifficulty = e.target.checked
                              ? [...(filters.difficulty || []), difficulty]
                              : (filters.difficulty || []).filter(d => d !== difficulty);
                            onFiltersChange?.({ ...filters, difficulty: newDifficulty });
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 capitalize">{difficulty}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <div className="space-y-2">
                    {['low', 'medium', 'high', 'urgent'].map((priority) => (
                      <label key={priority} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.priority?.includes(priority) || false}
                          onChange={(e) => {
                            const newPriority = e.target.checked
                              ? [...(filters.priority || []), priority]
                              : (filters.priority || []).filter(p => p !== priority);
                            onFiltersChange?.({ ...filters, priority: newPriority });
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 capitalize">{priority}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Rating
                  </label>
                  <Select
                    options={[
                      { value: '', label: 'Any rating' },
                      { value: '4', label: '4+ stars' },
                      { value: '4.5', label: '4.5+ stars' },
                      { value: '5', label: '5 stars' }
                    ]}
                    value={filters.rating?.min?.toString() || ''}
                    onValueChange={(value) => {
                      const min = value ? parseFloat(String(value)) : undefined;
                      onFiltersChange?.({ ...filters, rating: { min } });
                    }}
                    placeholder="Select rating..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onFiltersChange?.({})}
                >
                  Clear All
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowFiltersPanel(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Featured Articles */}
      {showFeatured && featuredArticles.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FireIcon className="h-5 w-5 text-orange-500" />
            Featured Articles
          </h3>
          <motion.div
            className={cn(
              'grid gap-6',
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            )}
            variants={enableAnimations ? containerVariants : undefined}
            initial="hidden"
            animate="visible"
          >
            {featuredArticles.map((article) => renderArticleCard(article, true))}
          </motion.div>
        </div>
      )}

      {/* Regular Articles */}
      {paginatedArticles.length > 0 && (
        <div>
          {featuredArticles.length > 0 && (
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <NewspaperIcon className="h-5 w-5 text-gray-500" />
              All Articles
            </h3>
          )}
          <motion.div
            className={cn(
              'grid gap-6',
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            )}
            variants={enableAnimations ? containerVariants : undefined}
            initial="hidden"
            animate="visible"
          >
            {paginatedArticles.map((article) => renderArticleCard(article))}
          </motion.div>
        </div>
      )}

      {/* Pagination */}
      {enablePagination && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
              if (pageNum > totalPages) return null;
              
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Empty State */}
      {processedArticles.length === 0 && (
        <div className="text-center py-12">
          <NewspaperIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No articles found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search or filters to find what you&apos;re looking for.
          </p>
          {(localSearchTerm || Object.keys(filters).length > 0) && (
            <Button
              variant="outline"
              onClick={() => {
                setLocalSearchTerm('');
                onSearchChange?.('');
                onFiltersChange?.({});
              }}
            >
              Clear all filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default HelpList;
