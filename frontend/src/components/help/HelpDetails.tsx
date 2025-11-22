'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HandThumbUpIcon,
  HandThumbDownIcon,
  ShareIcon,
  BookmarkIcon,
  PrinterIcon,
  ArrowLeftIcon,
  EyeIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  PhotoIcon,
  LinkIcon,
  ArrowTopRightOnSquareIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  StarIcon,
  FlagIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { 
  HandThumbUpIcon as HandThumbUpIconSolid,
  HandThumbDownIcon as HandThumbDownIconSolid,
  BookmarkIcon as BookmarkIconSolid,
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Types and Interfaces
export interface HelpArticleAuthor {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  verified: boolean;
}

export interface HelpArticleAttachment {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document' | 'link';
  url: string;
  size?: string;
  thumbnail?: string;
}

export interface HelpArticleSection {
  id: string;
  title: string;
  content: string;
  order: number;
  type: 'text' | 'code' | 'quote' | 'list' | 'warning' | 'info';
  attachments?: HelpArticleAttachment[];
}

export interface HelpArticleComment {
  id: string;
  author: HelpArticleAuthor;
  content: string;
  timestamp: string;
  helpful: number;
  replies?: HelpArticleComment[];
}

export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  author: HelpArticleAuthor;
  tags: string[];
  status: 'published' | 'draft' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedReadTime: number;
  sections: HelpArticleSection[];
  attachments: HelpArticleAttachment[];
  comments: HelpArticleComment[];
  stats: {
    views: number;
    likes: number;
    dislikes: number;
    bookmarks: number;
    shares: number;
    helpful: number;
    notHelpful: number;
    rating: number;
    totalRatings: number;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  lastModified: string;
}

export interface HelpDetailsProps {
  article: HelpArticle;
  onBack?: () => void;
  onLike?: (articleId: string) => void;
  onDislike?: (articleId: string) => void;
  onBookmark?: (articleId: string) => void;
  onShare?: (articleId: string) => void;
  onPrint?: (articleId: string) => void;
  onReport?: (articleId: string) => void;
  onComment?: (articleId: string, comment: string) => void;
  onRate?: (articleId: string, rating: number) => void;
  userInteractions?: {
    liked: boolean;
    disliked: boolean;
    bookmarked: boolean;
    rated?: number;
  };
  showComments?: boolean;
  showRating?: boolean;
  showStats?: boolean;
  showTableOfContents?: boolean;
  enableSearch?: boolean;
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
  }
};

const sectionVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.4 }
  }
};

// Utility functions
const getDifficultyColor = (difficulty: HelpArticle['difficulty']) => {
  const colors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  };
  return colors[difficulty];
};

const getPriorityColor = (priority: HelpArticle['priority']) => {
  const colors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };
  return colors[priority];
};

const formatNumber = (num: number) => {
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}k`;
  return `${(num / 1000000).toFixed(1)}m`;
};

const getSectionIcon = (type: HelpArticleSection['type']) => {
  const icons = {
    text: DocumentTextIcon,
    code: ClipboardDocumentIcon,
    quote: ChatBubbleLeftRightIcon,
    list: DocumentTextIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon
  };
  return icons[type];
};

const getSectionStyles = (type: HelpArticleSection['type']) => {
  const styles = {
    text: 'bg-white border-gray-200',
    code: 'bg-gray-50 border-gray-300 font-mono',
    quote: 'bg-blue-50 border-blue-300 border-l-4 pl-4',
    list: 'bg-white border-gray-200',
    warning: 'bg-yellow-50 border-yellow-300 border-l-4 pl-4',
    info: 'bg-blue-50 border-blue-300 border-l-4 pl-4'
  };
  return styles[type];
};

// Comprehensive articles database for Vardhman Mills Home Furnishing
const articlesDatabase: Record<string, HelpArticle> = {
  // Bedding & Linens Articles
  '1': {
    id: '1',
    title: 'Complete Bedding Size Guide for Indian Homes',
    content: 'Master the art of choosing perfect bedding sizes for your home with our comprehensive guide covering all Indian standard and custom sizes.',
    excerpt: 'Understand bed dimensions, sheet sizes, and how to choose the perfect bedding for Indian bedrooms.',
    category: { id: 'bedding-linens', name: 'Bedding & Linens', slug: 'bedding-linens' },
    author: { id: 'author1', name: 'Priya Sharma', avatar: '/avatars/priya.jpg', role: 'Home Textile Expert', verified: true },
    tags: ['bedding', 'sizes', 'measurements', 'indian-standards', 'bed-sheets'],
    status: 'published',
    priority: 'high',
    difficulty: 'beginner',
    estimatedReadTime: 8,
    sections: [
      {
        id: 'section-1',
        title: 'Indian Standard Bed Sizes',
        content: 'In India, bed sizes differ from international standards. Single beds are typically 36"×72", Double beds are 48"×72", Queen size is 60"×78", and King size is 72"×84". Understanding these dimensions is crucial for selecting the right bedding.',
        order: 1,
        type: 'info'
      },
      {
        id: 'section-2',
        title: 'Sheet Size Selection',
        content: 'Always add 8-12 inches to your mattress length and width for proper tucking. For fitted sheets, measure mattress depth and add 6 inches for elastic hem accommodation.',
        order: 2,
        type: 'text'
      },
      {
        id: 'section-3',
        title: 'Common Sizing Mistakes',
        content: 'Never assume bed sizes without measuring. Even beds labeled as "Queen" can vary by manufacturer. Always measure your actual bed before purchasing.',
        order: 3,
        type: 'warning'
      }
    ],
    attachments: [
      { id: 'att-1', name: 'Indian Bed Size Chart', type: 'image', url: '/images/bed-size-chart.jpg', thumbnail: '/images/thumbs/bed-chart.jpg' },
      { id: 'att-2', name: 'Measuring Your Bed Video', type: 'video', url: '/videos/measuring-bed.mp4', thumbnail: '/images/thumbs/measure-video.jpg' }
    ],
    comments: [
      {
        id: 'comment-1',
        author: { id: 'user-001', name: 'Anjali Patel', avatar: '/avatars/anjali.jpg', role: 'Customer', verified: false },
        content: 'This guide saved me from ordering wrong size sheets! The Indian sizing chart is so helpful.',
        timestamp: '2024-02-15T10:30:00Z',
        helpful: 12,
        replies: []
      }
    ],
    stats: { views: 5234, likes: 187, dislikes: 8, bookmarks: 234, shares: 45, helpful: 198, notHelpful: 12, rating: 4.8, totalRatings: 156 },
    createdAt: '2024-02-10T09:00:00Z',
    updatedAt: '2024-02-20T14:30:00Z',
    publishedAt: '2024-02-10T12:00:00Z',
    lastModified: '2024-02-20T14:30:00Z'
  },

  '2': {
    id: '2',
    title: 'Thread Count vs Quality: What Really Matters',
    content: 'Discover the truth about thread count and learn what truly determines bedding quality beyond marketing numbers.',
    excerpt: 'Learn why thread count isn\'t everything and what factors actually determine sheet quality.',
    category: { id: 'bedding-linens', name: 'Bedding & Linens', slug: 'bedding-linens' },
    author: { id: 'author1', name: 'Priya Sharma', avatar: '/avatars/priya.jpg', role: 'Home Textile Expert', verified: true },
    tags: ['thread-count', 'quality', 'fabric', 'cotton', 'bedding-selection'],
    status: 'published',
    priority: 'medium',
    difficulty: 'intermediate',
    estimatedReadTime: 10,
    sections: [
      {
        id: 'section-1',
        title: 'Understanding Thread Count',
        content: 'Thread count refers to the number of threads woven into one square inch of fabric. While higher isn\'t always better, optimal ranges are 200-400 for cotton percale and 300-600 for cotton sateen.',
        order: 1,
        type: 'info'
      },
      {
        id: 'section-2',
        title: 'Quality Factors Beyond Thread Count',
        content: 'Fiber quality, weave type, finishing processes, and yarn construction matter more than thread count alone. Egyptian cotton with 300 thread count often outperforms regular cotton at 800.',
        order: 2,
        type: 'text'
      },
      {
        id: 'section-3',
        title: 'Marketing Misconceptions',
        content: 'Beware of extremely high thread counts (1000+) as they often use multi-ply yarns that can make fabric feel heavy and less breathable.',
        order: 3,
        type: 'warning'
      }
    ],
    attachments: [
      { id: 'att-1', name: 'Thread Count Comparison Chart', type: 'document', url: '/docs/thread-count-guide.pdf' },
      { id: 'att-2', name: 'Fabric Weave Types', type: 'image', url: '/images/weave-types.jpg', thumbnail: '/images/thumbs/weave.jpg' }
    ],
    comments: [
      {
        id: 'comment-1',
        author: { id: 'user-002', name: 'Rajesh Kumar', avatar: '/avatars/rajesh.jpg', role: 'Customer', verified: false },
        content: 'I always thought higher thread count meant better quality. This article opened my eyes!',
        timestamp: '2024-02-18T14:20:00Z',
        helpful: 8,
        replies: []
      }
    ],
    stats: { views: 3456, likes: 142, dislikes: 6, bookmarks: 167, shares: 23, helpful: 134, notHelpful: 9, rating: 4.7, totalRatings: 89 },
    createdAt: '2024-02-12T10:15:00Z',
    updatedAt: '2024-02-22T16:45:00Z',
    publishedAt: '2024-02-12T14:00:00Z',
    lastModified: '2024-02-22T16:45:00Z'
  },

  // Curtains & Drapes Articles
  '3': {
    id: '3',
    title: 'Measuring Windows for Perfect Curtain Fit',
    content: 'Learn professional techniques for measuring windows and calculating curtain dimensions for a perfect fit every time.',
    excerpt: 'Master the art of window measurement and curtain sizing with our step-by-step guide.',
    category: { id: 'curtains-drapes', name: 'Curtains & Drapes', slug: 'curtains-drapes' },
    author: { id: 'author2', name: 'Rajesh Kumar', avatar: '/avatars/rajesh.jpg', role: 'Interior Design Consultant', verified: true },
    tags: ['curtains', 'measuring', 'windows', 'installation', 'sizing'],
    status: 'published',
    priority: 'high',
    difficulty: 'beginner',
    estimatedReadTime: 12,
    sections: [
      {
        id: 'section-1',
        title: 'Essential Measuring Tools',
        content: 'You\'ll need a steel measuring tape, level, pencil, and notepad. Avoid cloth tapes as they can stretch and give inaccurate measurements.',
        order: 1,
        type: 'text'
      },
      {
        id: 'section-2',
        title: 'Width Measurements',
        content: 'Measure the window width, then add 4-8 inches on each side for proper coverage and light blocking. For rod-to-rod installation, measure the full rod width.',
        order: 2,
        type: 'info'
      },
      {
        id: 'section-3',
        title: 'Length Calculations',
        content: 'Measure from rod to desired length: sill length (1/2 inch above sill), apron length (4 inches below sill), or floor length (1/2 inch above floor).',
        order: 3,
        type: 'text'
      },
      {
        id: 'section-4',
        title: 'Common Measurement Errors',
        content: 'Never measure inside the window frame for standard curtains. Always account for rod projection from wall when measuring length.',
        order: 4,
        type: 'warning'
      }
    ],
    attachments: [
      { id: 'att-1', name: 'Window Measurement Guide', type: 'image', url: '/images/window-measuring.jpg', thumbnail: '/images/thumbs/window-measure.jpg' },
      { id: 'att-2', name: 'Curtain Length Options', type: 'image', url: '/images/curtain-lengths.jpg', thumbnail: '/images/thumbs/curtain-length.jpg' },
      { id: 'att-3', name: 'Measuring Tutorial Video', type: 'video', url: '/videos/measuring-windows.mp4', thumbnail: '/images/thumbs/measure-tutorial.jpg' }
    ],
    comments: [
      {
        id: 'comment-1',
        author: { id: 'user-003', name: 'Sunita Rao', avatar: '/avatars/sunita.jpg', role: 'Customer', verified: false },
        content: 'The video tutorial made it so easy! My curtains fit perfectly thanks to this guide.',
        timestamp: '2024-02-20T11:45:00Z',
        helpful: 15,
        replies: []
      }
    ],
    stats: { views: 4567, likes: 198, dislikes: 7, bookmarks: 245, shares: 56, helpful: 189, notHelpful: 11, rating: 4.9, totalRatings: 234 },
    createdAt: '2024-02-14T08:30:00Z',
    updatedAt: '2024-02-24T12:15:00Z',
    publishedAt: '2024-02-14T11:00:00Z',
    lastModified: '2024-02-24T12:15:00Z'
  },

  // Custom Orders Articles
  '20': {
    id: '20',
    title: 'Custom Home Textile Orders: Design Your Dream',
    content: 'Create personalized home textiles with our custom order service. From unique designs to specific measurements, bring your vision to life.',
    excerpt: 'Learn how to place custom orders for personalized home textiles that match your exact requirements.',
    category: { id: 'custom-orders', name: 'Custom Orders', slug: 'custom-orders' },
    author: { id: 'author8', name: 'Kavita Patel', avatar: '/avatars/kavita.jpg', role: 'Event Styling Expert', verified: true },
    tags: ['custom-orders', 'personalization', 'design', 'bespoke', 'made-to-order'],
    status: 'published',
    priority: 'medium',
    difficulty: 'advanced',
    estimatedReadTime: 15,
    sections: [
      {
        id: 'section-1',
        title: 'Custom Order Process',
        content: 'Our custom order process begins with a consultation to understand your vision. We then create design mockups, source materials, and craft your unique pieces with attention to every detail.',
        order: 1,
        type: 'info'
      },
      {
        id: 'section-2',
        title: 'Design Consultation',
        content: 'Schedule a free consultation with our design team. Bring inspiration photos, color swatches, and room measurements. We\'ll help refine your ideas into achievable designs.',
        order: 2,
        type: 'text'
      },
      {
        id: 'section-3',
        title: 'Material Selection',
        content: 'Choose from premium fabrics, exclusive prints, and luxury finishes. We source the finest materials including organic cottons, silk blends, and eco-friendly options.',
        order: 3,
        type: 'text'
      },
      {
        id: 'section-4',
        title: 'Timeline and Pricing',
        content: 'Custom orders typically take 3-6 weeks depending on complexity. Pricing varies based on materials, size, and design intricacy. We provide detailed quotes before starting.',
        order: 4,
        type: 'info'
      },
      {
        id: 'section-5',
        title: 'Important Considerations',
        content: 'Custom orders are non-returnable unless there are manufacturing defects. Ensure all measurements and specifications are confirmed before production begins.',
        order: 5,
        type: 'warning'
      }
    ],
    attachments: [
      { id: 'att-1', name: 'Custom Order Catalog', type: 'document', url: '/docs/custom-catalog.pdf' },
      { id: 'att-2', name: 'Design Process Video', type: 'video', url: '/videos/custom-process.mp4', thumbnail: '/images/thumbs/custom-video.jpg' },
      { id: 'att-3', name: 'Fabric Samples Gallery', type: 'image', url: '/images/fabric-samples.jpg', thumbnail: '/images/thumbs/fabrics.jpg' }
    ],
    comments: [
      {
        id: 'comment-1',
        author: { id: 'user-020', name: 'Arjun Mehta', avatar: '/avatars/arjun.jpg', role: 'Customer', verified: false },
        content: 'The custom curtains exceeded my expectations! The design team understood my vision perfectly.',
        timestamp: '2024-02-24T16:30:00Z',
        helpful: 18,
        replies: []
      }
    ],
    stats: { views: 2876, likes: 134, dislikes: 4, bookmarks: 198, shares: 43, helpful: 127, notHelpful: 6, rating: 4.8, totalRatings: 167 },
    createdAt: '2024-02-24T11:20:00Z',
    updatedAt: '2024-03-03T16:00:00Z',
    publishedAt: '2024-02-24T15:15:00Z',
    lastModified: '2024-03-03T16:00:00Z'
  },

  // Shopping & Browsing Articles
  '21': {
    id: '21',
    title: 'How to Browse and Search Products Effectively',
    content: 'Master our website navigation, search filters, and product discovery features to find exactly what you need for your home.',
    excerpt: 'Learn how to use our advanced search filters, category navigation, and product comparison tools efficiently.',
    category: { id: 'shopping-browsing', name: 'Shopping & Browsing', slug: 'shopping-browsing' },
    author: { id: 'author11', name: 'Ravi Krishnan', avatar: '/avatars/ravi.jpg', role: 'UX Designer', verified: true },
    tags: ['browsing', 'search', 'filters', 'navigation', 'product-discovery'],
    status: 'published',
    priority: 'high',
    difficulty: 'beginner',
    estimatedReadTime: 6,
    sections: [
      {
        id: 'section-1',
        title: 'Using the Search Bar',
        content: 'Start with specific terms like "cotton bed sheets" or "blackout curtains". Use quotes for exact phrases. The search includes product names, descriptions, and even color names.',
        order: 1,
        type: 'text'
      },
      {
        id: 'section-2',
        title: 'Advanced Filtering Options',
        content: 'Use filters to narrow down results by price range, material, color, size, brand, and customer ratings. Combine multiple filters for precise results.',
        order: 2,
        type: 'info'
      },
      {
        id: 'section-3',
        title: 'Category Navigation',
        content: 'Browse by room (bedroom, living room, kitchen) or product type (bedding, curtains, rugs). Each category has specialized filters relevant to that product type.',
        order: 3,
        type: 'text'
      },
      {
        id: 'section-4',
        title: 'Product Comparison',
        content: 'Select up to 4 products to compare side-by-side. Compare specifications, prices, customer reviews, and features to make informed decisions.',
        order: 4,
        type: 'text'
      }
    ],
    attachments: [
      { id: 'att-1', name: 'Search Tips Infographic', type: 'image', url: '/images/search-tips.jpg', thumbnail: '/images/thumbs/search.jpg' },
      { id: 'att-2', name: 'Website Navigation Tour', type: 'video', url: '/videos/site-tour.mp4', thumbnail: '/images/thumbs/tour.jpg' }
    ],
    comments: [
      {
        id: 'comment-1',
        author: { id: 'user-021', name: 'Meera Gupta', avatar: '/avatars/meera.jpg', role: 'Customer', verified: false },
        content: 'The filter system is intuitive! Found exactly what I needed in minutes.',
        timestamp: '2024-03-01T14:45:00Z',
        helpful: 9,
        replies: []
      }
    ],
    stats: { views: 3456, likes: 128, dislikes: 5, bookmarks: 89, shares: 22, rating: 4.7, totalRatings: 198, helpful: 184, notHelpful: 9 },
    createdAt: '2024-03-01T09:00:00Z',
    updatedAt: '2024-03-08T14:30:00Z',
    publishedAt: '2024-03-01T12:00:00Z',
    lastModified: '2024-03-08T14:30:00Z'
  },

  // Rugs & Carpets Articles  
  '4': {
    id: '4',
    title: 'Rug Size Calculator for Every Room',
    content: 'Find the perfect rug size for your space with our room-by-room guide and professional sizing tips.',
    excerpt: 'Calculate ideal rug dimensions for living rooms, bedrooms, dining rooms, and more.',
    category: { id: 'rugs-carpets', name: 'Rugs & Carpets', slug: 'rugs-carpets' },
    author: { id: 'author2', name: 'Rajesh Kumar', avatar: '/avatars/rajesh.jpg', role: 'Interior Design Consultant', verified: true },
    tags: ['rugs', 'sizing', 'room-design', 'interior-design', 'space-planning'],
    status: 'published',
    priority: 'high',
    difficulty: 'intermediate',
    estimatedReadTime: 9,
    sections: [
      {
        id: 'section-1',
        title: 'Living Room Rug Sizing',
        content: 'For living rooms, the rug should be large enough for all front furniture legs to sit on it. Common sizes: 5x8 feet for small rooms, 8x10 feet for medium, 9x12 feet for large spaces.',
        order: 1,
        type: 'info'
      },
      {
        id: 'section-2',
        title: 'Bedroom Rug Placement',
        content: 'In bedrooms, place a rug that extends 18-24 inches beyond the foot of the bed and 12-18 inches on each side. Consider runner rugs for narrow spaces.',
        order: 2,
        type: 'text'
      },
      {
        id: 'section-3',
        title: 'Dining Room Guidelines',
        content: 'Dining room rugs should extend 24-30 inches beyond the table on all sides to accommodate chairs when pulled out. This ensures chairs remain on the rug.',
        order: 3,
        type: 'text'
      }
    ],
    attachments: [
      { id: 'att-1', name: 'Rug Size Chart', type: 'image', url: '/images/rug-sizes.jpg', thumbnail: '/images/thumbs/rug-chart.jpg' },
      { id: 'att-2', name: 'Room Layout Examples', type: 'document', url: '/docs/rug-layouts.pdf' }
    ],
    comments: [
      {
        id: 'comment-1',
        author: { id: 'user-004', name: 'Kavita Patel', avatar: '/avatars/kavita.jpg', role: 'Customer', verified: false },
        content: 'The dining room guidelines were spot on! My rug fits perfectly now.',
        timestamp: '2024-02-16T09:15:00Z',
        helpful: 11,
        replies: []
      }
    ],
    stats: { views: 3789, likes: 156, dislikes: 9, bookmarks: 201, shares: 34, helpful: 147, notHelpful: 12, rating: 4.6, totalRatings: 178 },
    createdAt: '2024-02-16T07:45:00Z',
    updatedAt: '2024-02-26T13:20:00Z',
    publishedAt: '2024-02-16T10:30:00Z',
    lastModified: '2024-02-26T13:20:00Z'
  },

  // Orders & Payments Articles  
  '25': {
    id: '25',
    title: 'Complete Order Placement Guide',
    content: 'Step-by-step instructions for placing orders, selecting quantities, choosing delivery options, and completing checkout.',
    excerpt: 'Follow our comprehensive guide to place your order smoothly from cart to confirmation.',
    category: { id: 'orders-payments', name: 'Orders & Payments', slug: 'orders-payments' },
    author: { id: 'author1', name: 'Sarah Johnson', avatar: '/avatars/sarah.jpg', role: 'Customer Success', verified: true },
    tags: ['order-placement', 'checkout', 'cart', 'delivery-options', 'confirmation'],
    status: 'published',
    priority: 'high',
    difficulty: 'beginner',
    estimatedReadTime: 8,
    sections: [
      {
        id: 'section-1',
        title: 'Adding Items to Cart',
        content: 'Browse products and click "Add to Cart". Verify size, color, and quantity before adding. You can modify quantities in the cart before checkout.',
        order: 1,
        type: 'text'
      },
      {
        id: 'section-2',
        title: 'Checkout Process',
        content: 'Review cart contents, enter shipping address, select delivery speed, and choose payment method. Double-check all details before confirming.',
        order: 2,
        type: 'info'
      },
      {
        id: 'section-3',
        title: 'Order Confirmation',
        content: 'After successful payment, you\'ll receive an order confirmation email with tracking details. Save this for your records and future reference.',
        order: 3,
        type: 'text'
      }
    ],
    attachments: [
      { id: 'att-1', name: 'Checkout Process Video', type: 'video', url: '/videos/checkout-guide.mp4', thumbnail: '/images/thumbs/checkout.jpg' },
      { id: 'att-2', name: 'Order Confirmation Sample', type: 'image', url: '/images/order-confirmation.jpg', thumbnail: '/images/thumbs/confirmation.jpg' }
    ],
    comments: [
      {
        id: 'comment-1',
        author: { id: 'user-025', name: 'Ravi Kumar', avatar: '/avatars/ravi-k.jpg', role: 'Customer', verified: false },
        content: 'The step-by-step process made my first order so easy!',
        timestamp: '2024-03-09T16:20:00Z',
        helpful: 13,
        replies: []
      }
    ],
    stats: { views: 4123, likes: 152, dislikes: 7, bookmarks: 98, shares: 28, rating: 4.8, totalRatings: 234, helpful: 218, notHelpful: 11 },
    createdAt: '2024-03-09T08:30:00Z',
    updatedAt: '2024-03-16T11:20:00Z',
    publishedAt: '2024-03-09T12:00:00Z',
    lastModified: '2024-03-16T11:20:00Z'
  },

  // Shipping & Delivery Articles
  '29': {
    id: '29',
    title: 'Comprehensive Shipping and Delivery Guide',
    content: 'Everything about shipping zones, delivery times, packaging, and tracking your home textile orders.',
    excerpt: 'Get detailed information about our shipping process, delivery options, and tracking system.',
    category: { id: 'shipping-delivery', name: 'Shipping & Delivery', slug: 'shipping-delivery' },
    author: { id: 'author2', name: 'Mike Chen', avatar: '/avatars/mike.jpg', role: 'Logistics Manager', verified: true },
    tags: ['shipping', 'delivery', 'tracking', 'packaging', 'logistics'],
    status: 'published',
    priority: 'high',
    difficulty: 'beginner',
    estimatedReadTime: 10,
    sections: [
      {
        id: 'section-1',
        title: 'Shipping Zones and Times',
        content: 'India is divided into Zone 1 (metro cities, 1-2 days), Zone 2 (tier-2 cities, 2-4 days), and Zone 3 (rural areas, 4-7 days). International shipping takes 7-14 days.',
        order: 1,
        type: 'info'
      },
      {
        id: 'section-2',
        title: 'Order Tracking',
        content: 'Track your order using the tracking number sent via email and SMS. Real-time updates show pickup, transit, and delivery status. Updates every 4-6 hours.',
        order: 2,
        type: 'text'
      },
      {
        id: 'section-3',
        title: 'Packaging Standards',
        content: 'All items are carefully packed in moisture-resistant bags and sturdy boxes. Fragile items get extra protection. We use eco-friendly packaging materials.',
        order: 3,
        type: 'text'
      },
      {
        id: 'section-4',
        title: 'Delivery Instructions',
        content: 'Be available during delivery window. Provide accurate address with landmark. For apartments, mention floor and wing details clearly.',
        order: 4,
        type: 'warning'
      }
    ],
    attachments: [
      { id: 'att-1', name: 'Shipping Zones Map', type: 'image', url: '/images/shipping-zones.jpg', thumbnail: '/images/thumbs/zones.jpg' },
      { id: 'att-2', name: 'Tracking Guide Video', type: 'video', url: '/videos/tracking-guide.mp4', thumbnail: '/images/thumbs/tracking.jpg' },
      { id: 'att-3', name: 'Packaging Standards', type: 'document', url: '/docs/packaging-info.pdf' }
    ],
    comments: [
      {
        id: 'comment-1',
        author: { id: 'user-029', name: 'Neha Agarwal', avatar: '/avatars/neha.jpg', role: 'Customer', verified: false },
        content: 'The tracking system is excellent! I could follow my order every step of the way.',
        timestamp: '2024-03-17T19:45:00Z',
        helpful: 22,
        replies: []
      }
    ],
    stats: { views: 4567, likes: 167, dislikes: 8, bookmarks: 112, shares: 31, rating: 4.8, totalRatings: 278, helpful: 259, notHelpful: 13 },
    createdAt: '2024-03-17T08:00:00Z',
    updatedAt: '2024-03-24T12:15:00Z',
    publishedAt: '2024-03-17T11:30:00Z',
    lastModified: '2024-03-24T12:15:00Z'
  },

  // Returns & Refunds Articles
  '33': {
    id: '33',
    title: 'Easy Returns Process and Guidelines',
    content: 'Simple step-by-step process for returning products, return window, and what items are eligible for return.',
    excerpt: 'Our hassle-free return process ensures complete customer satisfaction with easy procedures.',
    category: { id: 'returns-refunds', name: 'Returns & Refunds', slug: 'returns-refunds' },
    author: { id: 'author1', name: 'Sarah Johnson', avatar: '/avatars/sarah.jpg', role: 'Customer Success', verified: true },
    tags: ['returns', 'process', 'guidelines', 'eligibility', 'satisfaction'],
    status: 'published',
    priority: 'high',
    difficulty: 'beginner',
    estimatedReadTime: 7,
    sections: [
      {
        id: 'section-1',
        title: 'Return Eligibility',
        content: 'Items can be returned within 30 days of delivery if unused, unwashed, and in original packaging. Custom orders and intimate items are not returnable.',
        order: 1,
        type: 'info'
      },
      {
        id: 'section-2',
        title: 'Return Process',
        content: 'Initiate return through your account or call customer service. We arrange free pickup within 2-3 business days. Pack items securely in original packaging.',
        order: 2,
        type: 'text'
      },
      {
        id: 'section-3',
        title: 'Quality Check',
        content: 'Returned items undergo quality inspection. Refunds are processed within 5-7 business days after successful quality check completion.',
        order: 3,
        type: 'text'
      },
      {
        id: 'section-4',
        title: 'Important Guidelines',
        content: 'Remove all tags carefully without damaging them. Do not wash or use items before returning. Include all accessories and packaging.',
        order: 4,
        type: 'warning'
      }
    ],
    attachments: [
      { id: 'att-1', name: 'Return Process Flowchart', type: 'image', url: '/images/return-process.jpg', thumbnail: '/images/thumbs/returns.jpg' },
      { id: 'att-2', name: 'Return Form Template', type: 'document', url: '/docs/return-form.pdf' },
      { id: 'att-3', name: 'Return Instructions Video', type: 'video', url: '/videos/return-guide.mp4', thumbnail: '/images/thumbs/return-video.jpg' }
    ],
    comments: [
      {
        id: 'comment-1',
        author: { id: 'user-033', name: 'Vikram Singh', avatar: '/avatars/vikram.jpg', role: 'Customer', verified: false },
        content: 'The return process was so smooth! Got my refund in just 5 days.',
        timestamp: '2024-03-25T18:20:00Z',
        helpful: 19,
        replies: []
      }
    ],
    stats: { views: 3890, likes: 142, dislikes: 6, bookmarks: 95, shares: 26, rating: 4.7, totalRatings: 223, helpful: 207, notHelpful: 12 },
    createdAt: '2024-03-25T09:15:00Z',
    updatedAt: '2024-04-01T14:00:00Z',
    publishedAt: '2024-03-25T12:45:00Z',
    lastModified: '2024-04-01T14:00:00Z'
  },

  // Account & Security Articles
  '37': {
    id: '37',
    title: 'Creating and Managing Your Account',
    content: 'Complete guide to account creation, profile management, and personalizing your shopping experience.',
    excerpt: 'Set up your Vardhman Mills account and customize it for the best shopping experience.',
    category: { id: 'account-security', name: 'Account & Security', slug: 'account-security' },
    author: { id: 'author15', name: 'Anita Sharma', avatar: '/avatars/anita.jpg', role: 'Account Manager', verified: true },
    tags: ['account-creation', 'profile-management', 'personalization', 'setup', 'customization'],
    status: 'published',
    priority: 'high',
    difficulty: 'beginner',
    estimatedReadTime: 6,
    sections: [
      {
        id: 'section-1',
        title: 'Account Registration',
        content: 'Sign up using email or mobile number. Verify your email/phone with OTP. Complete profile with name, address, and preferences for personalized experience.',
        order: 1,
        type: 'text'
      },
      {
        id: 'section-2',
        title: 'Profile Customization',
        content: 'Add multiple addresses for different delivery locations. Set preferences for room types, color themes, and fabric preferences for better recommendations.',
        order: 2,
        type: 'info'
      },
      {
        id: 'section-3',
        title: 'Privacy Settings',
        content: 'Control email notifications, SMS alerts, and promotional communications. Manage data sharing preferences and account visibility settings.',
        order: 3,
        type: 'text'
      },
      {
        id: 'section-4',
        title: 'Account Benefits',
        content: 'Enjoy faster checkout, order tracking, wishlist management, and exclusive member discounts. Earn loyalty points with every purchase.',
        order: 4,
        type: 'info'
      }
    ],
    attachments: [
      { id: 'att-1', name: 'Account Setup Guide', type: 'image', url: '/images/account-setup.jpg', thumbnail: '/images/thumbs/account.jpg' },
      { id: 'att-2', name: 'Profile Management Video', type: 'video', url: '/videos/profile-guide.mp4', thumbnail: '/images/thumbs/profile.jpg' }
    ],
    comments: [
      {
        id: 'comment-1',
        author: { id: 'user-037', name: 'Deepika Rao', avatar: '/avatars/deepika.jpg', role: 'Customer', verified: false },
        content: 'The personalized recommendations based on my preferences are spot on!',
        timestamp: '2024-04-02T20:15:00Z',
        helpful: 14,
        replies: []
      }
    ],
    stats: { views: 3456, likes: 126, dislikes: 5, bookmarks: 82, shares: 21, rating: 4.6, totalRatings: 187, helpful: 171, notHelpful: 10 },
    createdAt: '2024-04-02T09:00:00Z',
    updatedAt: '2024-04-09T14:30:00Z',
    publishedAt: '2024-04-02T12:15:00Z',
    lastModified: '2024-04-09T14:30:00Z'
  },

  // Product Care & Maintenance Articles
  '41': {
    id: '41',
    title: 'Complete Fabric Care Encyclopedia',
    content: 'Comprehensive care instructions for cotton, silk, linen, synthetic blends, and specialty fabrics.',
    excerpt: 'Master the art of fabric care with our detailed guide for every type of home textile.',
    category: { id: 'product-care', name: 'Product Care & Maintenance', slug: 'product-care' },
    author: { id: 'author7', name: 'Meera Gupta', avatar: '/avatars/meera.jpg', role: 'Textile Care Specialist', verified: true },
    tags: ['fabric-care', 'maintenance', 'washing', 'care-instructions', 'textile-care'],
    status: 'published',
    priority: 'high',
    difficulty: 'intermediate',
    estimatedReadTime: 12,
    sections: [
      {
        id: 'section-1',
        title: 'Cotton Care Guidelines',
        content: 'Wash cotton in warm water (30-40°C). Use mild detergent. Avoid bleach on colored items. Tumble dry on medium heat or air dry. Iron while damp for best results.',
        order: 1,
        type: 'info'
      },
      {
        id: 'section-2',
        title: 'Silk Maintenance',
        content: 'Hand wash silk in cold water with gentle detergent. Never wring or twist. Roll in towel to remove excess water. Air dry away from direct sunlight. Iron on low heat.',
        order: 2,
        type: 'text'
      },
      {
        id: 'section-3',
        title: 'Linen Care Tips',
        content: 'Wash linen in lukewarm water. Linen improves with washing. Air dry for natural texture or tumble dry for softer feel. Iron while damp for crisp finish.',
        order: 3,
        type: 'text'
      },
      {
        id: 'section-4',
        title: 'Synthetic Blends',
        content: 'Follow care label instructions carefully. Generally machine washable in cool water. Use fabric softener sparingly. Low heat drying prevents shrinkage.',
        order: 4,
        type: 'text'
      },
      {
        id: 'section-5',
        title: 'Special Fabrics Warning',
        content: 'Always check care labels first. When in doubt, dry clean. Never use hot water on wool blends. Delicate fabrics need gentle cycle or hand washing.',
        order: 5,
        type: 'warning'
      }
    ],
    attachments: [
      { id: 'att-1', name: 'Fabric Care Chart', type: 'image', url: '/images/fabric-care-chart.jpg', thumbnail: '/images/thumbs/care-chart.jpg' },
      { id: 'att-2', name: 'Washing Symbols Guide', type: 'document', url: '/docs/washing-symbols.pdf' },
      { id: 'att-3', name: 'Fabric Care Video Series', type: 'video', url: '/videos/fabric-care.mp4', thumbnail: '/images/thumbs/care-video.jpg' }
    ],
    comments: [
      {
        id: 'comment-1',
        author: { id: 'user-041', name: 'Lavanya Reddy', avatar: '/avatars/lavanya.jpg', role: 'Customer', verified: false },
        content: 'This guide saved my expensive silk curtains! The care instructions are so detailed.',
        timestamp: '2024-04-10T17:30:00Z',
        helpful: 26,
        replies: []
      }
    ],
    stats: { views: 4234, likes: 158, dislikes: 7, bookmarks: 106, shares: 29, rating: 4.8, totalRatings: 267, helpful: 248, notHelpful: 14 },
    createdAt: '2024-04-10T08:30:00Z',
    updatedAt: '2024-04-17T12:45:00Z',
    publishedAt: '2024-04-10T11:15:00Z',
    lastModified: '2024-04-17T12:45:00Z'
  },

  // Customer Support Articles
  '45': {
    id: '45',
    title: 'How to Contact Customer Support',
    content: 'Multiple ways to reach our support team: phone, email, chat, and social media channels available 24/7.',
    excerpt: 'Get the help you need through various convenient support channels available around the clock.',
    category: { id: 'customer-support', name: 'Customer Support', slug: 'customer-support' },
    author: { id: 'author1', name: 'Sarah Johnson', avatar: '/avatars/sarah.jpg', role: 'Customer Success', verified: true },
    tags: ['customer-support', 'contact', 'help', 'support-channels', 'assistance'],
    status: 'published',
    priority: 'high',
    difficulty: 'beginner',
    estimatedReadTime: 4,
    sections: [
      {
        id: 'section-1',
        title: 'Phone Support',
        content: 'Call our toll-free number 1800-VARDHMAN (1800-827-3462) for immediate assistance. Available 24/7 with multilingual support in Hindi, English, and regional languages.',
        order: 1,
        type: 'info'
      },
      {
        id: 'section-2',
        title: 'Live Chat & Email',
        content: 'Use our live chat feature on the website for instant help, or email support@vardhmanmills.com. Response time is typically under 2 hours during business hours.',
        order: 2,
        type: 'text'
      },
      {
        id: 'section-3',
        title: 'Social Media Support',
        content: 'Reach us on Facebook, Instagram, or Twitter for quick responses. Our social media team is active during business hours for immediate assistance.',
        order: 3,
        type: 'text'
      }
    ],
    attachments: [
      { id: 'att-1', name: 'Contact Information Card', type: 'image', url: '/images/contact-info.jpg', thumbnail: '/images/thumbs/contact.jpg' },
      { id: 'att-2', name: 'Support Hours Guide', type: 'document', url: '/docs/support-hours.pdf' }
    ],
    comments: [
      {
        id: 'comment-1',
        author: { id: 'user-045', name: 'Priya Sharma', avatar: '/avatars/priya-s.jpg', role: 'Customer', verified: false },
        content: 'The phone support was excellent! Solved my issue in just 5 minutes.',
        timestamp: '2024-04-18T15:30:00Z',
        helpful: 16,
        replies: []
      }
    ],
    stats: { views: 3789, likes: 138, dislikes: 4, bookmarks: 91, shares: 23, rating: 4.6, totalRatings: 212, helpful: 196, notHelpful: 12 },
    createdAt: '2024-04-18T08:00:00Z',
    updatedAt: '2024-04-25T12:30:00Z',
    publishedAt: '2024-04-18T11:45:00Z',
    lastModified: '2024-04-25T12:30:00Z'
  },

  // Article 5: Pillow Size Guide
  '5': {
    id: '5',
    title: 'Complete Pillow Size Guide for Every Bed',
    content: 'Choose the perfect pillow sizes to complement your bedding ensemble. Our comprehensive guide covers standard, queen, king, and specialty pillow dimensions for optimal comfort and aesthetics.',
    excerpt: 'Master pillow sizing and arrangement with our complete guide to standard, queen, king, and specialty pillow dimensions.',
    category: { id: 'bedding-linens', name: 'Bedding & Linens', slug: 'bedding-linens' },
    author: { id: 'author5', name: 'Interior Design Team', avatar: '/avatars/design-team.jpg', role: 'Design Expert', verified: true },
    tags: ['pillows', 'sizing', 'bedding', 'arrangement', 'bedroom-design'],
    status: 'published',
    priority: 'medium',
    difficulty: 'beginner',
    estimatedReadTime: 5,
    sections: [
      {
        id: 'section-1',
        title: 'Standard Pillow Sizes',
        content: 'Understanding standard pillow dimensions helps you create the perfect bed setup. Standard: 20" x 26", Queen: 20" x 30", King: 20" x 36", Euro: 26" x 26".',
        order: 1,
        type: 'info'
      },
      {
        id: 'section-2',
        title: 'Pillow Arrangement Tips',
        content: 'Learn professional techniques for arranging pillows to create luxurious, hotel-style bedding displays with two-pillow arrangements, four-pillow luxury setups, and decorative integration.',
        order: 2,
        type: 'text'
      },
      {
        id: 'section-3',
        title: 'Specialty Pillow Options',
        content: 'Explore additional pillow types: Body pillows (20" x 54"), Travel pillows (12" x 16"), Lumbar pillows (12" x 18"), and cervical support pillows.',
        order: 3,
        type: 'info'
      }
    ],
    attachments: [
      { id: 'att-1', name: 'Pillow Size Reference Chart', type: 'image', url: '/downloads/pillow-size-chart.jpg', thumbnail: '/images/thumbs/pillow-chart.jpg' },
      { id: 'att-2', name: 'Pillow Arrangement Tutorial', type: 'video', url: '/downloads/pillow-arrangement-guide.mp4' }
    ],
    comments: [
      {
        id: 'comment-1',
        author: { id: 'user-006', name: 'Lisa M.', avatar: '/avatars/lisa-m.jpg', role: 'Customer', verified: false },
        content: 'Never knew there were so many pillow sizes! This helped me understand what I needed for my king bed.',
        timestamp: '2024-01-12T11:30:00Z',
        helpful: 18,
        replies: []
      },
      {
        id: 'comment-2',
        author: { id: 'user-007', name: 'James T.', avatar: '/avatars/james-t.jpg', role: 'Customer', verified: false },
        content: 'The arrangement tips transformed our bedroom. Looks like a luxury hotel now!',
        timestamp: '2024-01-14T13:15:00Z',
        helpful: 22,
        replies: []
      }
    ],
    stats: { views: 1876, likes: 76, dislikes: 2, bookmarks: 54, shares: 12, rating: 4.4, totalRatings: 134, helpful: 125, notHelpful: 6 },
    createdAt: '2024-01-08T10:00:00Z',
    updatedAt: '2024-01-18T15:30:00Z',
    publishedAt: '2024-01-08T11:00:00Z',
    lastModified: '2024-01-18T15:30:00Z'
  },

  // Article 6: Curtain Length Guidelines
  '6': {
    id: '6',
    title: 'Professional Curtain Length Guidelines',
    content: 'Master the art of curtain hanging with our professional length guidelines. Proper curtain length can dramatically transform your room\'s appearance and perceived height.',
    excerpt: 'Transform your rooms with professional curtain length guidelines covering sill, apron, floor, and puddle lengths.',
    category: { id: 'curtains-drapes', name: 'Curtains & Drapes', slug: 'curtains-drapes' },
    author: { id: 'author6', name: 'Window Treatment Specialist', avatar: '/avatars/window-expert.jpg', role: 'Installation Expert', verified: true },
    tags: ['curtains', 'length', 'window-treatment', 'installation', 'measuring'],
    status: 'published',
    priority: 'high',
    difficulty: 'intermediate',
    estimatedReadTime: 8,
    sections: [
      {
        id: 'section-1',
        title: 'Curtain Length Options',
        content: 'Choose from various curtain lengths: Sill length (ends at window sill), Apron length (4-6 inches below sill), Floor length (just touches floor), Puddle length (2-8 inches on floor).',
        order: 1,
        type: 'info'
      },
      {
        id: 'section-2',
        title: 'Professional Measuring Techniques',
        content: 'Learn industry-standard measuring techniques including measuring from rod to desired length, accounting for hem adjustments, and handling multiple windows.',
        order: 2,
        type: 'text'
      },
      {
        id: 'section-3',
        title: 'Style and Functionality Considerations',
        content: 'Balance aesthetics with functionality for different rooms: living room elegance, bedroom privacy, kitchen practicality, and bathroom moisture concerns.',
        order: 3,
        type: 'text'
      }
    ],
    attachments: [
      { id: 'att-1', name: 'Curtain Length Visual Guide', type: 'document', url: '/downloads/curtain-length-guide.pdf', thumbnail: '/images/thumbs/curtain-guide.jpg' },
      { id: 'att-2', name: 'Curtain Measuring Worksheet', type: 'document', url: '/downloads/curtain-measuring-worksheet.pdf' }
    ],
    comments: [
      {
        id: 'comment-1',
        author: { id: 'user-008', name: 'Emma S.', avatar: '/avatars/emma-s.jpg', role: 'Customer', verified: false },
        content: 'The measuring techniques saved me from ordering wrong sizes. Very detailed and helpful!',
        timestamp: '2024-01-16T09:45:00Z',
        helpful: 25,
        replies: []
      },
      {
        id: 'comment-2',
        author: { id: 'user-009', name: 'David L.', avatar: '/avatars/david-l.jpg', role: 'Customer', verified: false },
        content: 'Used the floor length guidelines for our living room. The results are stunning!',
        timestamp: '2024-01-18T14:20:00Z',
        helpful: 19,
        replies: []
      }
    ],
    stats: { views: 2134, likes: 93, dislikes: 4, bookmarks: 71, shares: 18, rating: 4.6, totalRatings: 187, helpful: 173, notHelpful: 9 },
    createdAt: '2024-01-10T08:30:00Z',
    updatedAt: '2024-01-20T16:45:00Z',
    publishedAt: '2024-01-10T10:00:00Z',
    lastModified: '2024-01-20T16:45:00Z'
  },

  // Article 7: Rug Placement Guide
  '7': {
    id: '7',
    title: 'Expert Rug Placement Guide for Every Room',
    content: 'Transform your space with proper rug placement. Our expert guide covers sizing, positioning, and styling tips for living rooms, bedrooms, dining rooms, and more.',
    excerpt: 'Master rug placement with expert tips for sizing, positioning, and styling in every room of your home.',
    category: { id: 'rugs-carpets', name: 'Rugs & Carpets', slug: 'rugs-carpets' },
    author: { id: 'author7', name: 'Interior Design Expert', avatar: '/avatars/interior-expert.jpg', role: 'Design Consultant', verified: true },
    tags: ['rugs', 'placement', 'room-design', 'interior-design', 'home-styling'],
    status: 'published',
    priority: 'high',
    difficulty: 'intermediate',
    estimatedReadTime: 10,
    sections: [
      {
        id: 'section-1',
        title: 'Living Room Rug Placement',
        content: 'Create a cohesive living space with proper rug sizing and placement that anchors your furniture arrangement. Consider all furniture on rug vs front legs only approaches.',
        order: 1,
        type: 'text'
      },
      {
        id: 'section-2',
        title: 'Bedroom Rug Styling',
        content: 'Add warmth and comfort to your bedroom with strategic rug placement that complements your bed and furniture while maintaining proper walk-around space.',
        order: 2,
        type: 'text'
      },
      {
        id: 'section-3',
        title: 'Dining Room Guidelines',
        content: 'Ensure your dining room rug accommodates chairs when pulled out while maintaining visual balance and optimizing traffic flow.',
        order: 3,
        type: 'info'
      }
    ],
    attachments: [
      { id: 'att-1', name: 'Room Layout Templates', type: 'document', url: '/downloads/rug-placement-templates.pdf', thumbnail: '/images/thumbs/layout-templates.jpg' },
      { id: 'att-2', name: 'Rug Size Calculator Tool', type: 'link', url: '/tools/rug-size-calculator' }
    ],
    comments: [
      {
        id: 'comment-1',
        author: { id: 'user-010', name: 'Rachel P.', avatar: '/avatars/rachel-p.jpg', role: 'Customer', verified: false },
        content: 'The living room placement tips helped me choose the perfect 8x10 rug. Room looks complete now!',
        timestamp: '2024-01-20T12:30:00Z',
        helpful: 31,
        replies: []
      },
      {
        id: 'comment-2',
        author: { id: 'user-011', name: 'Tom W.', avatar: '/avatars/tom-w.jpg', role: 'Customer', verified: false },
        content: 'Dining room guidelines were spot on. Chair clearance is perfect and the room feels balanced.',
        timestamp: '2024-01-22T15:45:00Z',
        helpful: 27,
        replies: []
      }
    ],
    stats: { views: 2567, likes: 112, dislikes: 3, bookmarks: 89, shares: 22, rating: 4.7, totalRatings: 198, helpful: 185, notHelpful: 7 },
    createdAt: '2024-01-12T09:15:00Z',
    updatedAt: '2024-01-25T13:20:00Z',
    publishedAt: '2024-01-12T10:30:00Z',
    lastModified: '2024-01-25T13:20:00Z'
  },

  // Article 8: Color Coordination Tips
  '8': {
    id: '8',
    title: 'Home Textile Color Coordination Mastery',
    content: 'Master the art of color coordination in home textiles. Learn professional techniques for creating cohesive, visually appealing spaces with complementary colors and patterns.',
    excerpt: 'Learn professional color coordination techniques for home textiles to create cohesive, visually stunning living spaces.',
    category: { id: 'shopping-browsing', name: 'Shopping & Browsing', slug: 'shopping-browsing' },
    author: { id: 'author8', name: 'Color Consultant', avatar: '/avatars/color-expert.jpg', role: 'Design Specialist', verified: true },
    tags: ['color', 'coordination', 'design', 'patterns', 'home-styling'],
    status: 'published',
    priority: 'medium',
    difficulty: 'advanced',
    estimatedReadTime: 12,
    sections: [
      {
        id: 'section-1',
        title: 'Color Theory Fundamentals',
        content: 'Understand the basics of color theory including primary, secondary, and tertiary colors, warm vs cool families, and complementary schemes.',
        order: 1,
        type: 'text'
      },
      {
        id: 'section-2',
        title: 'Pattern Mixing Techniques',
        content: 'Learn professional strategies for successfully combining different patterns in textiles including scale variation principles and texture integration.',
        order: 2,
        type: 'text'
      },
      {
        id: 'section-3',
        title: 'Room-Specific Color Tips',
        content: 'Apply color coordination principles to different rooms considering lighting, function, and mood requirements for bedroom, living room, kitchen, and bathroom.',
        order: 3,
        type: 'text'
      }
    ],
    attachments: [
      { id: 'att-1', name: 'Interactive Color Wheel Guide', type: 'link', url: '/tools/color-coordination-wheel', thumbnail: '/images/thumbs/color-wheel.jpg' },
      { id: 'att-2', name: 'Pattern Mixing Examples', type: 'image', url: '/downloads/pattern-mixing-examples.jpg' }
    ],
    comments: [
      {
        id: 'comment-1',
        author: { id: 'user-012', name: 'Maria G.', avatar: '/avatars/maria-g.jpg', role: 'Customer', verified: false },
        content: 'The color theory section opened my eyes! Finally understand why some combinations work and others don\'t.',
        timestamp: '2024-01-24T10:15:00Z',
        helpful: 34,
        replies: []
      },
      {
        id: 'comment-2',
        author: { id: 'user-013', name: 'Kevin H.', avatar: '/avatars/kevin-h.jpg', role: 'Customer', verified: false },
        content: 'Pattern mixing was always intimidating, but these techniques made it approachable. Great results!',
        timestamp: '2024-01-26T14:30:00Z',
        helpful: 29,
        replies: []
      }
    ],
    stats: { views: 3142, likes: 125, dislikes: 5, bookmarks: 98, shares: 28, rating: 4.8, totalRatings: 221, helpful: 205, notHelpful: 11 },
    createdAt: '2024-01-15T11:00:00Z',
    updatedAt: '2024-01-28T16:15:00Z',
    publishedAt: '2024-01-15T12:00:00Z',
    lastModified: '2024-01-28T16:15:00Z'
  },

  // Article 9: Seasonal Decor Updates
  '9': {
    id: '9',
    title: 'Seasonal Home Textile Updates Made Easy',
    content: 'Refresh your home for every season with strategic textile updates. Learn cost-effective ways to transform your space throughout the year using pillows, throws, and accessories.',
    excerpt: 'Transform your home seasonally with strategic textile updates using pillows, throws, and accessories for year-round freshness.',
    category: { id: 'shopping-browsing', name: 'Shopping & Browsing', slug: 'shopping-browsing' },
    author: { id: 'author9', name: 'Seasonal Styling Expert', avatar: '/avatars/seasonal-expert.jpg', role: 'Style Consultant', verified: true },
    tags: ['seasonal', 'decor', 'updates', 'styling', 'home-refresh'],
    status: 'published',
    priority: 'medium',
    difficulty: 'beginner',
    estimatedReadTime: 9,
    sections: [
      {
        id: 'section-1',
        title: 'Spring Refresh Strategies',
        content: 'Welcome spring with light, airy textiles that bring freshness and renewal to your living spaces through light fabric transitions and fresh color introductions.',
        order: 1,
        type: 'text'
      },
      {
        id: 'section-2',
        title: 'Summer Cooling Solutions',
        content: 'Keep your home cool and comfortable with breathable fabrics and cooling color schemes, emphasizing linen and cotton with minimal layering approaches.',
        order: 2,
        type: 'text'
      },
      {
        id: 'section-3',
        title: 'Autumn & Winter Transformations',
        content: 'Create cozy, welcoming spaces with warm textiles and rich colors for autumn, transitioning to luxurious winter layering for maximum coziness.',
        order: 3,
        type: 'text'
      }
    ],
    attachments: [
      { id: 'att-1', name: 'Seasonal Update Checklist', type: 'document', url: '/downloads/seasonal-update-checklist.pdf', thumbnail: '/images/thumbs/seasonal-checklist.jpg' },
      { id: 'att-2', name: 'Seasonal Color Guide', type: 'image', url: '/downloads/seasonal-color-guide.jpg' }
    ],
    comments: [
      {
        id: 'comment-1',
        author: { id: 'user-014', name: 'Jennifer L.', avatar: '/avatars/jennifer-l.jpg', role: 'Customer', verified: false },
        content: 'Love how simple changes make such a big difference! Used the spring tips to refresh our living room.',
        timestamp: '2024-01-28T13:45:00Z',
        helpful: 28,
        replies: []
      },
      {
        id: 'comment-2',
        author: { id: 'user-015', name: 'Robert M.', avatar: '/avatars/robert-m.jpg', role: 'Customer', verified: false },
        content: 'The winter coziness section helped create the perfect atmosphere. Family loves the new layered look.',
        timestamp: '2024-01-30T16:20:00Z',
        helpful: 24,
        replies: []
      }
    ],
    stats: { views: 1923, likes: 87, dislikes: 2, bookmarks: 65, shares: 16, rating: 4.5, totalRatings: 143, helpful: 132, notHelpful: 6 },
    createdAt: '2024-01-18T10:30:00Z',
    updatedAt: '2024-02-01T14:45:00Z',
    publishedAt: '2024-01-18T11:15:00Z',
    lastModified: '2024-02-01T14:45:00Z'
  },

  // Article 10: Fabric Care Basics
  '10': {
    id: '10',
    title: 'Essential Fabric Care for Home Textiles',
    content: 'Extend the life of your home textiles with proper care techniques. Learn washing, drying, and storage methods for different fabric types to maintain their beauty and functionality.',
    excerpt: 'Master fabric care techniques for home textiles with washing, drying, and storage methods to extend their lifespan.',
    category: { id: 'product-care', name: 'Product Care & Maintenance', slug: 'product-care' },
    author: { id: 'author10', name: 'Textile Care Specialist', avatar: '/avatars/care-expert.jpg', role: 'Care Expert', verified: true },
    tags: ['fabric-care', 'maintenance', 'washing', 'storage', 'textile-life'],
    status: 'published',
    priority: 'high',
    difficulty: 'intermediate',
    estimatedReadTime: 11,
    sections: [
      {
        id: 'section-1',
        title: 'Washing Guidelines by Fabric',
        content: 'Master washing different textile materials: cotton (hot water considerations), linen (pre-shrinking and care), silk (gentle handling), synthetic blends (temperature guidelines).',
        order: 1,
        type: 'text'
      },
      {
        id: 'section-2',
        title: 'Proper Drying Techniques',
        content: 'Learn safe drying methods including air drying benefits, machine drying temperature settings, flat drying for delicate items, and preventing wrinkle formation.',
        order: 2,
        type: 'text'
      },
      {
        id: 'section-3',
        title: 'Stain Removal & Storage',
        content: 'Address common stains with immediate response protocols and natural removal methods, plus long-term storage solutions with breathable containers and climate control.',
        order: 3,
        type: 'text'
      }
    ],
    attachments: [
      { id: 'att-1', name: 'Care Label Symbol Decoder', type: 'document', url: '/downloads/care-label-decoder.pdf', thumbnail: '/images/thumbs/care-labels.jpg' },
      { id: 'att-2', name: 'Quick Stain Removal Chart', type: 'image', url: '/downloads/stain-removal-chart.jpg' }
    ],
    comments: [
      {
        id: 'comment-1',
        author: { id: 'user-016', name: 'Sandra K.', avatar: '/avatars/sandra-k.jpg', role: 'Customer', verified: false },
        content: 'The stain removal section saved my favorite linen tablecloth! Wine stain came right out.',
        timestamp: '2024-02-02T11:30:00Z',
        helpful: 32,
        replies: []
      },
      {
        id: 'comment-2',
        author: { id: 'user-017', name: 'Paul D.', avatar: '/avatars/paul-d.jpg', role: 'Customer', verified: false },
        content: 'Storage tips are fantastic. My winter comforters stayed fresh and pest-free all summer.',
        timestamp: '2024-02-04T15:15:00Z',
        helpful: 26,
        replies: []
      }
    ],
    stats: { views: 2789, likes: 104, dislikes: 3, bookmarks: 82, shares: 19, rating: 4.6, totalRatings: 176, helpful: 163, notHelpful: 8 },
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-02-05T13:30:00Z',
    publishedAt: '2024-01-20T10:15:00Z',
    lastModified: '2024-02-05T13:30:00Z'
  },

  // Article 11: Thread Count Explained
  '11': {
    id: '11',
    title: 'Thread Count Demystified: Quality vs Marketing',
    content: 'Understand what thread count really means and how it affects your bedding quality. Learn to distinguish between marketing claims and actual textile quality indicators.',
    excerpt: 'Decode thread count marketing and understand real quality indicators for better bedding purchasing decisions.',
    category: { id: 'bedding-linens', name: 'Bedding & Linens', slug: 'bedding-linens' },
    author: { id: 'author11', name: 'Textile Quality Expert', avatar: '/avatars/quality-expert.jpg', role: 'Quality Specialist', verified: true },
    tags: ['thread-count', 'quality', 'bedding', 'textile-education', 'buying-guide'],
    status: 'published',
    priority: 'high',
    difficulty: 'intermediate',
    estimatedReadTime: 8,
    sections: [
      {
        id: 'section-1',
        title: 'Thread Count Fundamentals',
        content: 'Learn the true definition of thread count, how it\'s calculated (threads per square inch), warp vs weft counting, and industry standard measurements.',
        order: 1,
        type: 'text'
      },
      {
        id: 'section-2',
        title: 'Real Quality Indicators',
        content: 'Discover factors that truly determine bedding quality: fiber quality importance, weave construction impact, finishing process effects, and fabric weight considerations.',
        order: 2,
        type: 'info'
      },
      {
        id: 'section-3',
        title: 'Optimal Thread Count Ranges',
        content: 'Find the sweet spot for different fabric types: Percale (200-400), Sateen (300-600), Jersey knit (different metrics), and bamboo/microfiber variations.',
        order: 3,
        type: 'text'
      }
    ],
    attachments: [
      { id: 'att-1', name: 'Thread Count vs Quality Analysis', type: 'document', url: '/downloads/thread-count-analysis.pdf', thumbnail: '/images/thumbs/thread-analysis.jpg' },
      { id: 'att-2', name: 'Weave Type Comparison', type: 'image', url: '/downloads/weave-comparison.jpg' }
    ],
    comments: [
      {
        id: 'comment-1',
        author: { id: 'user-018', name: 'Helen R.', avatar: '/avatars/helen-r.jpg', role: 'Customer', verified: false },
        content: 'Finally understand why my 1000 thread count sheets felt worse than my 400 count ones! Eye-opening.',
        timestamp: '2024-02-06T14:20:00Z',
        helpful: 42,
        replies: []
      },
      {
        id: 'comment-2',
        author: { id: 'user-019', name: 'Mark T.', avatar: '/avatars/mark-t.jpg', role: 'Customer', verified: false },
        content: 'This guide saved me from overpaying for marketing gimmicks. Great practical information.',
        timestamp: '2024-02-08T16:45:00Z',
        helpful: 35,
        replies: []
      }
    ],
    stats: { views: 3456, likes: 118, dislikes: 4, bookmarks: 94, shares: 24, rating: 4.7, totalRatings: 203, helpful: 189, notHelpful: 9 },
    createdAt: '2024-01-22T08:45:00Z',
    updatedAt: '2024-02-10T12:15:00Z',
    publishedAt: '2024-01-22T10:00:00Z',
    lastModified: '2024-02-10T12:15:00Z'
  },

  // Article 12: Window Treatment Hardware
  '12': {
    id: '12',
    title: 'Complete Window Treatment Hardware Guide',
    content: 'Master window treatment installation with our comprehensive hardware guide. Learn about rods, brackets, rings, and mounting options for professional-looking results.',
    excerpt: 'Complete guide to window treatment hardware covering rods, brackets, rings, and mounting for professional installation.',
    category: { id: 'curtains-drapes', name: 'Curtains & Drapes', slug: 'curtains-drapes' },
    author: { id: 'author12', name: 'Window Treatment Installer', avatar: '/avatars/installer-expert.jpg', role: 'Installation Expert', verified: true },
    tags: ['hardware', 'installation', 'window-treatment', 'curtain-rods', 'mounting'],
    status: 'published',
    priority: 'medium',
    difficulty: 'advanced',
    estimatedReadTime: 10,
    sections: [
      {
        id: 'section-1',
        title: 'Curtain Rod Types and Selection',
        content: 'Choose the right curtain rod: standard vs decorative rods, tension vs mounted options, adjustable vs fixed length, and material considerations (metal, wood, plastic).',
        order: 1,
        type: 'text'
      },
      {
        id: 'section-2',
        title: 'Professional Mounting Techniques',
        content: 'Learn proper mounting: wall mount vs ceiling mount, bracket spacing requirements, drywall vs masonry mounting, and support considerations for heavy fabrics.',
        order: 2,
        type: 'text'
      },
      {
        id: 'section-3',
        title: 'Essential Hardware Accessories',
        content: 'Complete your window treatment: rings vs grommets vs tabs, tiebacks and holdbacks, finials and end caps, and cord and pulley systems.',
        order: 3,
        type: 'info'
      }
    ],
    attachments: [
      { id: 'att-1', name: 'Step-by-Step Installation Guide', type: 'document', url: '/downloads/curtain-installation-guide.pdf', thumbnail: '/images/thumbs/installation-guide.jpg' },
      { id: 'att-2', name: 'Hardware Sizing Chart', type: 'document', url: '/downloads/hardware-sizing-chart.pdf' }
    ],
    comments: [
      {
        id: 'comment-1',
        author: { id: 'user-020', name: 'Carol B.', avatar: '/avatars/carol-b.jpg', role: 'Customer', verified: false },
        content: 'The mounting tips were perfect! Installed curtains in our entire house following this guide.',
        timestamp: '2024-02-10T10:30:00Z',
        helpful: 38,
        replies: []
      },
      {
        id: 'comment-2',
        author: { id: 'user-021', name: 'Steve M.', avatar: '/avatars/steve-m.jpg', role: 'Customer', verified: false },
        content: 'Hardware selection was overwhelming until I read this. Now I know exactly what I need.',
        timestamp: '2024-02-12T13:15:00Z',
        helpful: 33,
        replies: []
      }
    ],
    stats: { views: 2234, likes: 95, dislikes: 3, bookmarks: 78, shares: 17, rating: 4.5, totalRatings: 167, helpful: 154, notHelpful: 7 },
    createdAt: '2024-01-25T09:30:00Z',
    updatedAt: '2024-02-15T14:45:00Z',
    publishedAt: '2024-01-25T11:00:00Z',
    lastModified: '2024-02-15T14:45:00Z'
  },

  // Article 13: Custom Drape Design
  '13': {
    id: '13',
    title: 'Custom Drape Design and Ordering Process',
    content: 'Design perfect custom drapes with our expert guidance. Learn about fabric selection, measurement requirements, style options, and the ordering process for bespoke window treatments.',
    excerpt: 'Create stunning custom drapes with professional guidance on design, measurement, and ordering for perfect window treatments.',
    category: { id: 'curtains-drapes', name: 'Curtains & Drapes', slug: 'curtains-drapes' },
    author: { id: 'author13', name: 'Custom Design Specialist', avatar: '/avatars/custom-expert.jpg', role: 'Design Consultant', verified: true },
    tags: ['custom-drapes', 'design', 'ordering', 'measurements', 'bespoke'],
    status: 'published',
    priority: 'medium',
    difficulty: 'advanced',
    estimatedReadTime: 12,
    sections: [
      {
        id: 'section-1',
        title: 'Design Consultation Process',
        content: 'Start your custom drape journey with our comprehensive design consultation, covering style preferences, functional requirements, and aesthetic goals.',
        order: 1,
        type: 'text'
      },
      {
        id: 'section-2',
        title: 'Fabric Selection & Samples',
        content: 'Choose from our extensive fabric library with free samples, considering factors like light filtration, privacy, durability, and maintenance requirements.',
        order: 2,
        type: 'info'
      },
      {
        id: 'section-3',
        title: 'Professional Measurement Service',
        content: 'Ensure perfect fit with our professional measurement service, including site visits, precise calculations, and installation planning.',
        order: 3,
        type: 'text'
      }
    ],
    attachments: [
      { id: 'att-1', name: 'Custom Design Portfolio', type: 'document', url: '/downloads/custom-design-portfolio.pdf', thumbnail: '/images/thumbs/portfolio.jpg' },
      { id: 'att-2', name: 'Fabric Selection Guide', type: 'document', url: '/downloads/fabric-selection-guide.pdf' }
    ],
    comments: [
      {
        id: 'comment-1',
        author: { id: 'user-022', name: 'Monica R.', avatar: '/avatars/monica-r.jpg', role: 'Customer', verified: false },
        content: 'The design process was seamless! Our custom drapes exceeded expectations. Worth every penny.',
        timestamp: '2024-02-18T11:20:00Z',
        helpful: 28,
        replies: []
      }
    ],
    stats: { views: 1687, likes: 72, dislikes: 2, bookmarks: 56, shares: 14, rating: 4.8, totalRatings: 145, helpful: 138, notHelpful: 4 },
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-02-20T15:30:00Z',
    publishedAt: '2024-02-15T11:30:00Z',
    lastModified: '2024-02-20T15:30:00Z'
  },

  // Article 14: Area Rug Maintenance
  '14': {
    id: '14',
    title: 'Complete Area Rug Maintenance Guide',
    content: 'Keep your area rugs looking pristine with professional maintenance techniques. Learn proper cleaning, storage, and preservation methods for different rug materials.',
    excerpt: 'Maintain your area rugs with professional cleaning, storage, and preservation techniques for long-lasting beauty.',
    category: { id: 'rugs-carpets', name: 'Rugs & Carpets', slug: 'rugs-carpets' },
    author: { id: 'author14', name: 'Rug Care Professional', avatar: '/avatars/rug-care.jpg', role: 'Maintenance Expert', verified: true },
    tags: ['rug-maintenance', 'cleaning', 'preservation', 'storage', 'care-tips'],
    status: 'published',
    priority: 'high',
    difficulty: 'intermediate',
    estimatedReadTime: 9,
    sections: [
      {
        id: 'section-1',
        title: 'Daily Care & Prevention',
        content: 'Implement daily care routines including proper vacuuming techniques, rotation schedules, and protective measures to prevent wear and damage.',
        order: 1,
        type: 'text'
      },
      {
        id: 'section-2',
        title: 'Deep Cleaning Methods',
        content: 'Learn professional deep cleaning techniques for different rug materials, including water-based and dry cleaning approaches.',
        order: 2,
        type: 'text'
      },
      {
        id: 'section-3',
        title: 'Storage & Seasonal Care',
        content: 'Properly store seasonal rugs and manage climate considerations to prevent moth damage, mildew, and structural deterioration.',
        order: 3,
        type: 'info'
      }
    ],
    attachments: [
      { id: 'att-1', name: 'Rug Care Calendar', type: 'document', url: '/downloads/rug-care-calendar.pdf', thumbnail: '/images/thumbs/care-calendar.jpg' },
      { id: 'att-2', name: 'Cleaning Product Guide', type: 'document', url: '/downloads/cleaning-products.pdf' }
    ],
    comments: [
      {
        id: 'comment-1',
        author: { id: 'user-023', name: 'Hassan A.', avatar: '/avatars/hassan-a.jpg', role: 'Customer', verified: false },
        content: 'These maintenance tips restored my Persian rug to its original beauty. Amazing results!',
        timestamp: '2024-02-22T14:15:00Z',
        helpful: 35,
        replies: []
      }
    ],
    stats: { views: 2134, likes: 89, dislikes: 3, bookmarks: 67, shares: 16, rating: 4.6, totalRatings: 167, helpful: 154, notHelpful: 8 },
    createdAt: '2024-02-18T09:30:00Z',
    updatedAt: '2024-02-25T16:45:00Z',
    publishedAt: '2024-02-18T11:00:00Z',
    lastModified: '2024-02-25T16:45:00Z'
  },

  // Article 15: Home Textile Trends 2024
  '15': {
    id: '15',
    title: '2024 Home Textile Trends & Design Forecast',
    content: 'Stay ahead of the curve with 2024\'s hottest home textile trends. Discover emerging colors, patterns, textures, and sustainable materials shaping interior design.',
    excerpt: 'Explore 2024\'s leading home textile trends including colors, patterns, sustainable materials, and design innovations.',
    category: { id: 'shopping-browsing', name: 'Shopping & Browsing', slug: 'shopping-browsing' },
    author: { id: 'author15', name: 'Trend Forecaster', avatar: '/avatars/trend-expert.jpg', role: 'Design Analyst', verified: true },
    tags: ['trends-2024', 'design-forecast', 'colors', 'patterns', 'sustainability'],
    status: 'published',
    priority: 'medium',
    difficulty: 'beginner',
    estimatedReadTime: 8,
    sections: [
      {
        id: 'section-1',
        title: 'Color Palette Trends',
        content: 'Discover 2024\'s trending color palettes including earth tones, digital blues, and warm neutrals that create calming, sophisticated spaces.',
        order: 1,
        type: 'text'
      },
      {
        id: 'section-2',
        title: 'Pattern & Texture Evolution',
        content: 'Explore emerging patterns from geometric abstracts to organic botanicals, plus texture trends emphasizing tactile experiences.',
        order: 2,
        type: 'info'
      },
      {
        id: 'section-3',
        title: 'Sustainable Material Innovation',
        content: 'Learn about eco-friendly materials leading the industry, including recycled fibers, organic cottons, and innovative plant-based textiles.',
        order: 3,
        type: 'text'
      }
    ],
    attachments: [
      { id: 'att-1', name: '2024 Trend Forecast Report', type: 'document', url: '/downloads/trend-forecast-2024.pdf', thumbnail: '/images/thumbs/trends.jpg' },
      { id: 'att-2', name: 'Color Palette Collection', type: 'image', url: '/downloads/color-palettes-2024.jpg' }
    ],
    comments: [
      {
        id: 'comment-1',
        author: { id: 'user-024', name: 'Designer_Sarah', avatar: '/avatars/designer-sarah.jpg', role: 'Interior Designer', verified: true },
        content: 'Excellent trend analysis! Already implementing several of these in client projects with great success.',
        timestamp: '2024-02-26T10:30:00Z',
        helpful: 41,
        replies: []
      }
    ],
    stats: { views: 3267, likes: 156, dislikes: 5, bookmarks: 123, shares: 34, rating: 4.7, totalRatings: 289, helpful: 267, notHelpful: 15 },
    createdAt: '2024-02-20T08:15:00Z',
    updatedAt: '2024-03-01T13:20:00Z',
    publishedAt: '2024-02-20T10:00:00Z',
    lastModified: '2024-03-01T13:20:00Z'
  },

  // Article 16: Bedroom Styling Guide
  '16': {
    id: '16',
    title: 'Master Bedroom Styling with Home Textiles',
    content: 'Transform your bedroom into a luxurious retreat with expert styling techniques. Learn layering strategies, color coordination, and textile selection for maximum comfort and style.',
    excerpt: 'Create a luxurious bedroom retreat with expert textile styling, layering techniques, and coordinated design approaches.',
    category: { id: 'shopping-browsing', name: 'Shopping & Browsing', slug: 'shopping-browsing' },
    author: { id: 'author16', name: 'Bedroom Styling Expert', avatar: '/avatars/bedroom-expert.jpg', role: 'Interior Specialist', verified: true },
    tags: ['bedroom-styling', 'layering', 'luxury', 'coordination', 'design-tips'],
    status: 'published',
    priority: 'high',
    difficulty: 'intermediate',
    estimatedReadTime: 11,
    sections: [
      {
        id: 'section-1',
        title: 'Foundation Layer Strategy',
        content: 'Build your bedroom design from the foundation up, starting with quality mattress protection, fitted sheets, and base layer textiles.',
        order: 1,
        type: 'text'
      },
      {
        id: 'section-2',
        title: 'Luxury Layering Techniques',
        content: 'Master the art of layering with duvets, coverlets, throws, and decorative pillows to create depth, texture, and visual interest.',
        order: 2,
        type: 'text'
      },
      {
        id: 'section-3',
        title: 'Window & Floor Coordination',
        content: 'Coordinate window treatments and area rugs with bedding for a cohesive, professionally designed appearance.',
        order: 3,
        type: 'info'
      }
    ],
    attachments: [
      { id: 'att-1', name: 'Bedroom Styling Checklist', type: 'document', url: '/downloads/bedroom-styling-checklist.pdf', thumbnail: '/images/thumbs/bedroom-styling.jpg' },
      { id: 'att-2', name: 'Layering Video Tutorial', type: 'video', url: '/downloads/layering-tutorial.mp4' }
    ],
    comments: [
      {
        id: 'comment-1',
        author: { id: 'user-025', name: 'Elena P.', avatar: '/avatars/elena-p.jpg', role: 'Customer', verified: false },
        content: 'Followed this guide completely and our bedroom now looks like a 5-star hotel suite!',
        timestamp: '2024-03-02T15:45:00Z',
        helpful: 39,
        replies: []
      }
    ],
    stats: { views: 2845, likes: 128, dislikes: 4, bookmarks: 98, shares: 27, rating: 4.8, totalRatings: 234, helpful: 218, notHelpful: 12 },
    createdAt: '2024-02-22T11:30:00Z',
    updatedAt: '2024-03-05T14:15:00Z',
    publishedAt: '2024-02-22T12:45:00Z',
    lastModified: '2024-03-05T14:15:00Z'
  },

  // Article 17: Living Room Textile Coordination
  '17': {
    id: '17',
    title: 'Living Room Textile Coordination Masterclass',
    content: 'Create a harmonious living space with expert textile coordination. Learn to balance patterns, textures, and colors across curtains, cushions, throws, and rugs.',
    excerpt: 'Master living room textile coordination with expert techniques for balancing patterns, textures, and colors seamlessly.',
    category: { id: 'shopping-browsing', name: 'Shopping & Browsing', slug: 'shopping-browsing' },
    author: { id: 'author17', name: 'Living Space Designer', avatar: '/avatars/living-designer.jpg', role: 'Coordination Expert', verified: true },
    tags: ['living-room', 'coordination', 'patterns', 'textures', 'color-balance'],
    status: 'published',
    priority: 'high',
    difficulty: 'intermediate',
    estimatedReadTime: 10,
    sections: [
      {
        id: 'section-1',
        title: 'Pattern Mixing Mastery',
        content: 'Learn advanced pattern mixing techniques including scale variation, color bridging, and pattern family coordination for sophisticated results.',
        order: 1,
        type: 'text'
      },
      {
        id: 'section-2',
        title: 'Texture Layering Strategy',
        content: 'Build visual and tactile interest through strategic texture layering, combining smooth and rough, matte and shiny surfaces.',
        order: 2,
        type: 'info'
      },
      {
        id: 'section-3',
        title: 'Focal Point Creation',
        content: 'Use textiles to create compelling focal points and guide visual flow throughout your living space.',
        order: 3,
        type: 'text'
      }
    ],
    attachments: [
      { id: 'att-1', name: 'Pattern Coordination Guide', type: 'document', url: '/downloads/pattern-coordination.pdf', thumbnail: '/images/thumbs/patterns.jpg' },
      { id: 'att-2', name: 'Living Room Gallery', type: 'image', url: '/downloads/living-room-gallery.jpg' }
    ],
    comments: [
      {
        id: 'comment-1',
        author: { id: 'user-026', name: 'Michael Chen', avatar: '/avatars/michael-c.jpg', role: 'Customer', verified: false },
        content: 'The pattern mixing tips were game-changing! Finally achieved the sophisticated look I wanted.',
        timestamp: '2024-03-08T12:20:00Z',
        helpful: 33,
        replies: []
      }
    ],
    stats: { views: 2456, likes: 112, dislikes: 3, bookmarks: 89, shares: 22, rating: 4.6, totalRatings: 198, helpful: 184, notHelpful: 9 },
    createdAt: '2024-02-25T10:15:00Z',
    updatedAt: '2024-03-10T16:30:00Z',
    publishedAt: '2024-02-25T11:30:00Z',
    lastModified: '2024-03-10T16:30:00Z'
  },

  // Article 18: Budget-Friendly Decorating
  '18': {
    id: '18',
    title: 'Budget-Friendly Home Textile Decorating Ideas',
    content: 'Transform your home without breaking the bank. Discover cost-effective decorating strategies using affordable textiles, DIY projects, and smart shopping techniques.',
    excerpt: 'Achieve stunning home transformations on a budget with smart textile choices, DIY projects, and strategic decorating tips.',
    category: { id: 'shopping-browsing', name: 'Shopping & Browsing', slug: 'shopping-browsing' },
    author: { id: 'author18', name: 'Budget Decor Expert', avatar: '/avatars/budget-expert.jpg', role: 'Savings Specialist', verified: true },
    tags: ['budget-decorating', 'affordable', 'diy-projects', 'smart-shopping', 'cost-effective'],
    status: 'published',
    priority: 'medium',
    difficulty: 'beginner',
    estimatedReadTime: 9,
    sections: [
      {
        id: 'section-1',
        title: 'Smart Shopping Strategies',
        content: 'Maximize your decorating budget with strategic shopping including sales timing, bulk purchasing, and mix-and-match approaches.',
        order: 1,
        type: 'text'
      },
      {
        id: 'section-2',
        title: 'DIY Textile Projects',
        content: 'Create custom looks with simple DIY projects including pillow covers, curtain customization, and throw transformations.',
        order: 2,
        type: 'text'
      },
      {
        id: 'section-3',
        title: 'High-Impact, Low-Cost Updates',
        content: 'Identify key areas where small textile changes create maximum visual impact for minimal investment.',
        order: 3,
        type: 'info'
      }
    ],
    attachments: [
      { id: 'att-1', name: 'Budget Decorating Worksheet', type: 'document', url: '/downloads/budget-worksheet.pdf', thumbnail: '/images/thumbs/budget.jpg' },
      { id: 'att-2', name: 'DIY Project Instructions', type: 'document', url: '/downloads/diy-instructions.pdf' }
    ],
    comments: [
      {
        id: 'comment-1',
        author: { id: 'user-027', name: 'College_Student_Amy', avatar: '/avatars/amy-s.jpg', role: 'Customer', verified: false },
        content: 'Perfect for my apartment makeover! Achieved a designer look for under $200. Thank you!',
        timestamp: '2024-03-12T14:30:00Z',
        helpful: 45,
        replies: []
      }
    ],
    stats: { views: 3789, likes: 187, dislikes: 6, bookmarks: 142, shares: 38, rating: 4.7, totalRatings: 312, helpful: 289, notHelpful: 18 },
    createdAt: '2024-02-28T09:45:00Z',
    updatedAt: '2024-03-15T13:20:00Z',
    publishedAt: '2024-02-28T11:00:00Z',
    lastModified: '2024-03-15T13:20:00Z'
  },

  // Article 19: Luxury Hotel Look Guide
  '19': {
    id: '19',
    title: 'Creating the Luxury Hotel Look at Home',
    content: 'Recreate the sophisticated elegance of luxury hotels in your own home. Learn professional techniques for achieving that crisp, polished, five-star aesthetic.',
    excerpt: 'Achieve luxury hotel elegance at home with professional styling techniques and sophisticated textile choices.',
    category: { id: 'shopping-browsing', name: 'Shopping & Browsing', slug: 'shopping-browsing' },
    author: { id: 'author19', name: 'Hospitality Designer', avatar: '/avatars/hotel-expert.jpg', role: 'Luxury Specialist', verified: true },
    tags: ['luxury-hotel', 'sophisticated', 'professional-styling', 'elegance', 'five-star'],
    status: 'published',
    priority: 'high',
    difficulty: 'advanced',
    estimatedReadTime: 13,
    sections: [
      {
        id: 'section-1',
        title: 'Color Palette Selection',
        content: 'Master the neutral, sophisticated color palettes that luxury hotels use to create timeless, calming environments.',
        order: 1,
        type: 'text'
      },
      {
        id: 'section-2',
        title: 'Quality and Texture Focus',
        content: 'Understand the importance of premium fabrics, precise tailoring, and luxurious textures in achieving the hotel aesthetic.',
        order: 2,
        type: 'info'
      },
      {
        id: 'section-3',
        title: 'Professional Finishing Touches',
        content: 'Learn the subtle details that elevate a room from nice to extraordinary, including precise measurements and immaculate presentation.',
        order: 3,
        type: 'text'
      }
    ],
    attachments: [
      { id: 'att-1', name: 'Luxury Hotel Style Guide', type: 'document', url: '/downloads/luxury-hotel-guide.pdf', thumbnail: '/images/thumbs/luxury.jpg' },
      { id: 'att-2', name: 'Five-Star Room Gallery', type: 'image', url: '/downloads/five-star-gallery.jpg' }
    ],
    comments: [
      {
        id: 'comment-1',
        author: { id: 'user-028', name: 'Luxury_Lover_Linda', avatar: '/avatars/linda-l.jpg', role: 'Customer', verified: false },
        content: 'Guests now ask if we hired a professional designer! This guide delivers exactly what it promises.',
        timestamp: '2024-03-16T16:45:00Z',
        helpful: 52,
        replies: []
      }
    ],
    stats: { views: 2967, likes: 145, dislikes: 3, bookmarks: 118, shares: 31, rating: 4.9, totalRatings: 267, helpful: 251, notHelpful: 11 },
    createdAt: '2024-03-01T11:20:00Z',
    updatedAt: '2024-03-18T15:40:00Z',
    publishedAt: '2024-03-01T12:30:00Z',
    lastModified: '2024-03-18T15:40:00Z'
  },

  // Article 50: Small Space Solutions
  '50': {
    id: '50',
    title: 'Small Space Home Textile Solutions',
    content: 'Maximize style and functionality in small spaces with clever textile choices. Learn space-enhancing techniques, multi-functional options, and optical illusion strategies.',
    excerpt: 'Optimize small spaces with smart textile solutions that enhance functionality while maintaining style and comfort.',
    category: { id: 'shopping-browsing', name: 'Shopping & Browsing', slug: 'shopping-browsing' },
    author: { id: 'author20', name: 'Small Space Specialist', avatar: '/avatars/small-space.jpg', role: 'Space Optimizer', verified: true },
    tags: ['small-spaces', 'space-saving', 'multi-functional', 'optical-illusions', 'maximizing'],
    status: 'published',
    priority: 'medium',
    difficulty: 'intermediate',
    estimatedReadTime: 8,
    sections: [
      {
        id: 'section-1',
        title: 'Color and Light Strategies',
        content: 'Use light colors and strategic patterns to create the illusion of space and maximize natural light reflection.',
        order: 1,
        type: 'text'
      },
      {
        id: 'section-2',
        title: 'Multi-Functional Textiles',
        content: 'Choose textiles that serve multiple purposes, such as storage ottomans, convertible cushions, and dual-purpose throws.',
        order: 2,
        type: 'info'
      },
      {
        id: 'section-3',
        title: 'Vertical Space Utilization',
        content: 'Maximize vertical space with floor-to-ceiling curtains, wall-mounted textile elements, and strategic hanging solutions.',
        order: 3,
        type: 'text'
      }
    ],
    attachments: [
      { id: 'att-1', name: 'Small Space Layout Guide', type: 'document', url: '/downloads/small-space-layout.pdf', thumbnail: '/images/thumbs/small-space.jpg' },
      { id: 'att-2', name: 'Space-Saving Product List', type: 'document', url: '/downloads/space-saving-products.pdf' }
    ],
    comments: [
      {
        id: 'comment-1',
        author: { id: 'user-029', name: 'Studio_Dweller', avatar: '/avatars/studio-dweller.jpg', role: 'Customer', verified: false },
        content: 'These tips transformed my tiny studio! It feels twice as big now. Brilliant solutions!',
        timestamp: '2024-03-20T11:15:00Z',
        helpful: 37,
        replies: []
      }
    ],
    stats: { views: 2234, likes: 98, dislikes: 2, bookmarks: 76, shares: 19, rating: 4.5, totalRatings: 189, helpful: 173, notHelpful: 8 },
    createdAt: '2024-03-05T10:30:00Z',
    updatedAt: '2024-03-22T14:20:00Z',
    publishedAt: '2024-03-05T12:00:00Z',
    lastModified: '2024-03-22T14:20:00Z'
  },

  // Article 51: Room-by-Room Decorating Guide
  '51': {
    id: '51',
    title: 'Room-by-Room Home Textile Decorating Guide',
    content: 'Master the art of decorating each room with purpose-specific textile choices. From dining rooms to home offices, learn what works best for every space in your home.',
    excerpt: 'Discover the perfect textile solutions for every room in your home with our comprehensive room-by-room decorating guide.',
    category: { id: 'shopping-browsing', name: 'Shopping & Browsing', slug: 'shopping-browsing' },
    author: { id: 'author13', name: 'Room Design Specialist', avatar: '/avatars/room-specialist.jpg', role: 'Interior Expert', verified: true },
    tags: ['room-design', 'decorating', 'space-specific', 'home-styling', 'interior-design'],
    status: 'published',
    priority: 'high',
    difficulty: 'intermediate',
    estimatedReadTime: 14,
    sections: [
      {
        id: 'section-1',
        title: 'Dining Room Elegance',
        content: 'Create sophisticated dining experiences with elegant table linens, coordinated chair cushions, and window treatments that enhance natural light during meals.',
        order: 1,
        type: 'text'
      },
      {
        id: 'section-2',
        title: 'Home Office Comfort & Productivity',
        content: 'Design a productive workspace with sound-absorbing textiles, ergonomic cushions, and window treatments that control glare while maintaining natural light.',
        order: 2,
        type: 'info'
      },
      {
        id: 'section-3',
        title: 'Guest Room Hospitality',
        content: 'Welcome guests with luxurious bedding, blackout curtains for quality sleep, and thoughtful textile touches that create a hotel-like experience.',
        order: 3,
        type: 'text'
      }
    ],
    attachments: [
      { id: 'att-1', name: 'Room-by-Room Checklist', type: 'document', url: '/downloads/room-checklist.pdf', thumbnail: '/images/thumbs/room-guide.jpg' },
      { id: 'att-2', name: 'Space Planning Templates', type: 'document', url: '/downloads/space-templates.pdf' }
    ],
    comments: [
      {
        id: 'comment-1',
        author: { id: 'user-030', name: 'HomeDesign_Pro', avatar: '/avatars/design-pro.jpg', role: 'Interior Designer', verified: true },
        content: 'Excellent comprehensive guide! I reference this for client consultations. Very thorough and practical.',
        timestamp: '2024-03-25T10:15:00Z',
        helpful: 48,
        replies: []
      }
    ],
    stats: { views: 3456, likes: 162, dislikes: 4, bookmarks: 128, shares: 35, rating: 4.8, totalRatings: 298, helpful: 276, notHelpful: 16 },
    createdAt: '2024-03-20T09:30:00Z',
    updatedAt: '2024-03-28T15:45:00Z',
    publishedAt: '2024-03-20T11:00:00Z',
    lastModified: '2024-03-28T15:45:00Z'
  },

  // Article 52: Sustainable Home Textiles
  '52': {
    id: '52',
    title: 'Guide to Sustainable and Eco-Friendly Home Textiles',
    content: 'Make environmentally conscious choices with our comprehensive guide to sustainable home textiles. Learn about eco-friendly materials, ethical production, and green care practices.',
    excerpt: 'Discover sustainable textile options that are better for your health and the environment without compromising on style or quality.',
    category: { id: 'shopping-browsing', name: 'Shopping & Browsing', slug: 'shopping-browsing' },
    author: { id: 'author14', name: 'Sustainability Expert', avatar: '/avatars/eco-expert.jpg', role: 'Environmental Specialist', verified: true },
    tags: ['sustainable', 'eco-friendly', 'organic', 'environmental', 'green-living'],
    status: 'published',
    priority: 'medium',
    difficulty: 'beginner',
    estimatedReadTime: 11,
    sections: [
      {
        id: 'section-1',
        title: 'Organic & Natural Materials',
        content: 'Explore organic cotton, linen, hemp, and bamboo textiles that are grown without harmful chemicals and processed using eco-friendly methods.',
        order: 1,
        type: 'info'
      },
      {
        id: 'section-2',
        title: 'Recycled & Upcycled Options',
        content: 'Discover innovative textiles made from recycled materials including plastic bottles, textile waste, and upcycled fabrics that reduce environmental impact.',
        order: 2,
        type: 'text'
      },
      {
        id: 'section-3',
        title: 'Sustainable Care Practices',
        content: 'Learn eco-friendly cleaning and maintenance practices that extend textile life while minimizing environmental impact through green care routines.',
        order: 3,
        type: 'text'
      }
    ],
    attachments: [
      { id: 'att-1', name: 'Sustainable Materials Guide', type: 'document', url: '/downloads/sustainable-materials.pdf', thumbnail: '/images/thumbs/sustainable.jpg' },
      { id: 'att-2', name: 'Eco-Care Instructions', type: 'document', url: '/downloads/eco-care.pdf' }
    ],
    comments: [
      {
        id: 'comment-1',
        author: { id: 'user-031', name: 'EcoWarrior_Maya', avatar: '/avatars/maya-eco.jpg', role: 'Customer', verified: false },
        content: 'Finally found reliable information about sustainable textiles! Made the switch and couldn\'t be happier.',
        timestamp: '2024-03-30T13:20:00Z',
        helpful: 42,
        replies: []
      }
    ],
    stats: { views: 2789, likes: 134, dislikes: 3, bookmarks: 98, shares: 29, rating: 4.7, totalRatings: 245, helpful: 228, notHelpful: 12 },
    createdAt: '2024-03-25T08:45:00Z',
    updatedAt: '2024-04-02T14:30:00Z',
    publishedAt: '2024-03-25T10:15:00Z',
    lastModified: '2024-04-02T14:30:00Z'
  },

  // Article 53: Textile Safety & Health
  '53': {
    id: '53',
    title: 'Home Textile Safety and Health Considerations',
    content: 'Ensure your family\'s health and safety with proper textile choices. Learn about allergen-free options, chemical-free treatments, and health-conscious home decorating.',
    excerpt: 'Protect your family\'s health with safe textile choices and learn about allergen-free, chemical-free home decorating options.',
    category: { id: 'product-care', name: 'Product Care & Maintenance', slug: 'product-care' },
    author: { id: 'author15', name: 'Health & Safety Specialist', avatar: '/avatars/health-expert.jpg', role: 'Wellness Expert', verified: true },
    tags: ['health', 'safety', 'allergen-free', 'chemical-free', 'family-wellness'],
    status: 'published',
    priority: 'high',
    difficulty: 'intermediate',
    estimatedReadTime: 10,
    sections: [
      {
        id: 'section-1',
        title: 'Allergen-Free Textile Selection',
        content: 'Choose textiles that minimize allergens including dust mites, pet dander, and pollen with hypoallergenic materials and proper construction.',
        order: 1,
        type: 'info'
      },
      {
        id: 'section-2',
        title: 'Chemical-Free & Non-Toxic Options',
        content: 'Identify and select textiles free from harmful chemicals, flame retardants, and toxic dyes that can impact indoor air quality and health.',
        order: 2,
        type: 'warning'
      },
      {
        id: 'section-3',
        title: 'Baby & Child Safety Guidelines',
        content: 'Special considerations for nurseries and children\'s rooms including safety standards, non-toxic materials, and age-appropriate textile choices.',
        order: 3,
        type: 'text'
      }
    ],
    attachments: [
      { id: 'att-1', name: 'Health & Safety Checklist', type: 'document', url: '/downloads/health-safety-checklist.pdf', thumbnail: '/images/thumbs/safety.jpg' },
      { id: 'att-2', name: 'Certification Guide', type: 'document', url: '/downloads/certification-guide.pdf' }
    ],
    comments: [
      {
        id: 'comment-1',
        author: { id: 'user-032', name: 'New_Mom_Sarah', avatar: '/avatars/mom-sarah.jpg', role: 'Customer', verified: false },
        content: 'Essential reading for new parents! Helped me create a safe, healthy nursery for my baby.',
        timestamp: '2024-04-05T11:45:00Z',
        helpful: 56,
        replies: []
      }
    ],
    stats: { views: 3123, likes: 148, dislikes: 2, bookmarks: 112, shares: 31, rating: 4.9, totalRatings: 278, helpful: 265, notHelpful: 8 },
    createdAt: '2024-03-28T10:20:00Z',
    updatedAt: '2024-04-08T16:15:00Z',
    publishedAt: '2024-03-28T12:00:00Z',
    lastModified: '2024-04-08T16:15:00Z'
  },

  // Article 54: International Shipping Guide
  '54': {
    id: '54',
    title: 'International Shipping for Home Textiles',
    content: 'Complete guide to international shipping including customs, duties, delivery times, and country-specific requirements for home textile orders.',
    excerpt: 'Navigate international shipping with confidence using our comprehensive guide to customs, duties, and global delivery.',
    category: { id: 'shipping-delivery', name: 'Shipping & Delivery', slug: 'shipping-delivery' },
    author: { id: 'author16', name: 'Shipping Specialist', avatar: '/avatars/shipping-expert.jpg', role: 'Logistics Expert', verified: true },
    tags: ['international-shipping', 'customs', 'duties', 'global-delivery', 'import-regulations'],
    status: 'published',
    priority: 'medium',
    difficulty: 'advanced',
    estimatedReadTime: 13,
    sections: [
      {
        id: 'section-1',
        title: 'Shipping Zones & Delivery Times',
        content: 'Understand our international shipping zones, expected delivery timeframes, and factors that may affect transit times for different regions.',
        order: 1,
        type: 'info'
      },
      {
        id: 'section-2',
        title: 'Customs & Duties Information',
        content: 'Learn about customs declarations, duty calculations, and import requirements that may apply to your home textile orders.',
        order: 2,
        type: 'text'
      },
      {
        id: 'section-3',
        title: 'Country-Specific Guidelines',
        content: 'Special requirements and restrictions for major shipping destinations including documentation, prohibited items, and delivery procedures.',
        order: 3,
        type: 'text'
      }
    ],
    attachments: [
      { id: 'att-1', name: 'International Shipping Chart', type: 'document', url: '/downloads/international-shipping.pdf', thumbnail: '/images/thumbs/international.jpg' },
      { id: 'att-2', name: 'Customs Forms Guide', type: 'document', url: '/downloads/customs-forms.pdf' }
    ],
    comments: [
      {
        id: 'comment-1',
        author: { id: 'user-033', name: 'Global_Customer', avatar: '/avatars/global-customer.jpg', role: 'Customer', verified: false },
        content: 'Shipping to Australia was seamless thanks to this guide. No surprises with customs or duties!',
        timestamp: '2024-04-10T14:30:00Z',
        helpful: 39,
        replies: []
      }
    ],
    stats: { views: 1987, likes: 87, dislikes: 4, bookmarks: 63, shares: 18, rating: 4.4, totalRatings: 156, helpful: 142, notHelpful: 9 },
    createdAt: '2024-04-01T09:15:00Z',
    updatedAt: '2024-04-12T13:45:00Z',
    publishedAt: '2024-04-01T11:00:00Z',
    lastModified: '2024-04-12T13:45:00Z'
  },

  // Article 55: Bulk Order Benefits
  '55': {
    id: '55',
    title: 'Bulk Orders: Benefits, Discounts & Process',
    content: 'Discover the advantages of bulk ordering for home textiles including volume discounts, customization options, and streamlined ordering process for large quantities.',
    excerpt: 'Save more with bulk orders while enjoying volume discounts, priority service, and custom options for large textile purchases.',
    category: { id: 'orders-payments', name: 'Orders & Payments', slug: 'orders-payments' },
    author: { id: 'author17', name: 'Bulk Sales Specialist', avatar: '/avatars/bulk-expert.jpg', role: 'Sales Expert', verified: true },
    tags: ['bulk-orders', 'volume-discounts', 'wholesale', 'commercial', 'large-quantities'],
    status: 'published',
    priority: 'medium',
    difficulty: 'beginner',
    estimatedReadTime: 8,
    sections: [
      {
        id: 'section-1',
        title: 'Volume Discount Structure',
        content: 'Understand our tiered discount system based on order quantities, with increasing savings for larger purchases and repeat customers.',
        order: 1,
        type: 'info'
      },
      {
        id: 'section-2',
        title: 'Bulk Order Process',
        content: 'Step-by-step guide to placing bulk orders including quote requests, approval process, and dedicated account management support.',
        order: 2,
        type: 'text'
      },
      {
        id: 'section-3',
        title: 'Customization Options',
        content: 'Explore additional services available for bulk orders including custom sizing, packaging, branding, and delivery scheduling.',
        order: 3,
        type: 'text'
      }
    ],
    attachments: [
      { id: 'att-1', name: 'Bulk Order Form', type: 'document', url: '/downloads/bulk-order-form.pdf', thumbnail: '/images/thumbs/bulk-form.jpg' },
      { id: 'att-2', name: 'Volume Pricing Guide', type: 'document', url: '/downloads/volume-pricing.pdf' }
    ],
    comments: [
      {
        id: 'comment-1',
        author: { id: 'user-034', name: 'Hotel_Manager_Alex', avatar: '/avatars/hotel-alex.jpg', role: 'Business Customer', verified: true },
        content: 'Excellent service for our hotel renovation! The bulk discounts and custom options saved us thousands.',
        timestamp: '2024-04-15T16:20:00Z',
        helpful: 43,
        replies: []
      }
    ],
    stats: { views: 2341, likes: 98, dislikes: 2, bookmarks: 74, shares: 21, rating: 4.6, totalRatings: 189, helpful: 173, notHelpful: 7 },
    createdAt: '2024-04-05T11:30:00Z',
    updatedAt: '2024-04-18T15:15:00Z',
    publishedAt: '2024-04-05T13:00:00Z',
    lastModified: '2024-04-18T15:15:00Z'
  },

  // Article 56: Gift Cards & Vouchers
  '56': {
    id: '56',
    title: 'Gift Cards and Vouchers: Perfect for Every Occasion',
    content: 'Give the gift of beautiful home textiles with our flexible gift cards and vouchers. Learn about options, redemption process, and special occasion packages.',
    excerpt: 'Discover our gift card options perfect for housewarmings, weddings, and special occasions with flexible amounts and easy redemption.',
    category: { id: 'orders-payments', name: 'Orders & Payments', slug: 'orders-payments' },
    author: { id: 'author18', name: 'Gift Services Coordinator', avatar: '/avatars/gift-expert.jpg', role: 'Customer Service', verified: true },
    tags: ['gift-cards', 'vouchers', 'gifts', 'occasions', 'redemption'],
    status: 'published',
    priority: 'low',
    difficulty: 'beginner',
    estimatedReadTime: 6,
    sections: [
      {
        id: 'section-1',
        title: 'Gift Card Options',
        content: 'Choose from various denominations, digital or physical delivery, and custom message options for the perfect gift presentation.',
        order: 1,
        type: 'info'
      },
      {
        id: 'section-2',
        title: 'Redemption Process',
        content: 'Simple steps to redeem gift cards online or in-store, check balances, and combine with other offers for maximum value.',
        order: 2,
        type: 'text'
      },
      {
        id: 'section-3',
        title: 'Special Occasion Packages',
        content: 'Explore curated gift packages for weddings, housewarmings, and holidays with coordinated textile sets and gift presentation.',
        order: 3,
        type: 'text'
      }
    ],
    attachments: [
      { id: 'att-1', name: 'Gift Card Terms', type: 'document', url: '/downloads/gift-card-terms.pdf', thumbnail: '/images/thumbs/gift-card.jpg' },
      { id: 'att-2', name: 'Occasion Gift Guide', type: 'document', url: '/downloads/occasion-gifts.pdf' }
    ],
    comments: [
      {
        id: 'comment-1',
        author: { id: 'user-035', name: 'Gift_Giver_Jenny', avatar: '/avatars/jenny-g.jpg', role: 'Customer', verified: false },
        content: 'Perfect housewarming gift! The recipients loved being able to choose exactly what they needed.',
        timestamp: '2024-04-20T12:45:00Z',
        helpful: 27,
        replies: []
      }
    ],
    stats: { views: 1456, likes: 62, dislikes: 1, bookmarks: 38, shares: 12, rating: 4.3, totalRatings: 98, helpful: 89, notHelpful: 4 },
    createdAt: '2024-04-10T10:45:00Z',
    updatedAt: '2024-04-22T14:30:00Z',
    publishedAt: '2024-04-10T12:15:00Z',
    lastModified: '2024-04-22T14:30:00Z'
  },

  // Article 57: Loyalty Program Benefits
  '57': {
    id: '57',
    title: 'VIP Loyalty Program: Exclusive Benefits & Rewards',
    content: 'Join our VIP loyalty program to enjoy exclusive benefits including early access to sales, special discounts, free shipping, and personalized recommendations.',
    excerpt: 'Unlock exclusive benefits with our VIP loyalty program featuring special discounts, early access, and personalized service.',
    category: { id: 'account-security', name: 'Account & Security', slug: 'account-security' },
    author: { id: 'author19', name: 'Loyalty Program Manager', avatar: '/avatars/loyalty-manager.jpg', role: 'Customer Relations', verified: true },
    tags: ['loyalty-program', 'vip-benefits', 'rewards', 'exclusive-access', 'member-perks'],
    status: 'published',
    priority: 'medium',
    difficulty: 'beginner',
    estimatedReadTime: 7,
    sections: [
      {
        id: 'section-1',
        title: 'Membership Tiers & Benefits',
        content: 'Discover our three membership tiers - Silver, Gold, and Platinum - with increasing benefits based on your annual purchase volume.',
        order: 1,
        type: 'info'
      },
      {
        id: 'section-2',
        title: 'Earning & Redeeming Points',
        content: 'Learn how to earn points on purchases, referrals, and reviews, plus how to redeem them for discounts and exclusive products.',
        order: 2,
        type: 'text'
      },
      {
        id: 'section-3',
        title: 'Exclusive Member Perks',
        content: 'Enjoy early access to sales, free shipping, birthday discounts, and personalized styling consultations available only to VIP members.',
        order: 3,
        type: 'text'
      }
    ],
    attachments: [
      { id: 'att-1', name: 'VIP Program Guide', type: 'document', url: '/downloads/vip-program.pdf', thumbnail: '/images/thumbs/vip.jpg' },
      { id: 'att-2', name: 'Points Redemption Chart', type: 'document', url: '/downloads/points-chart.pdf' }
    ],
    comments: [
      {
        id: 'comment-1',
        author: { id: 'user-036', name: 'Platinum_Member_Raj', avatar: '/avatars/raj-p.jpg', role: 'VIP Customer', verified: true },
        content: 'Love the VIP benefits! Early access to sales and free shipping make it totally worth it.',
        timestamp: '2024-04-25T09:30:00Z',
        helpful: 38,
        replies: []
      }
    ],
    stats: { views: 2134, likes: 95, dislikes: 2, bookmarks: 67, shares: 19, rating: 4.5, totalRatings: 167, helpful: 154, notHelpful: 6 },
    createdAt: '2024-04-15T08:20:00Z',
    updatedAt: '2024-04-28T11:45:00Z',
    publishedAt: '2024-04-15T10:00:00Z',
    lastModified: '2024-04-28T11:45:00Z'
  }
};

// Helper function to get article by ID
export const getArticleById = (id: string): HelpArticle => {
  return articlesDatabase[id] || defaultArticle;
};

// Helper function to get all articles
export const getAllArticles = (): HelpArticle[] => {
  return Object.values(articlesDatabase);
};

// Default article fallback
const defaultArticle: HelpArticle = {
  id: 'help-001',
  title: 'How to Place Your First Order',
  content: 'This comprehensive guide will walk you through the process of placing your first order on our platform.',
  excerpt: 'Learn how to browse products, add items to cart, and complete your purchase successfully.',
  category: {
    id: 'getting-started',
    name: 'Getting Started',
    slug: 'getting-started'
  },
  author: {
    id: 'author-001',
    name: 'Sarah Johnson',
    avatar: '/images/avatars/sarah.jpg',
    role: 'Customer Success Manager',
    verified: true
  },
  tags: ['orders', 'getting-started', 'shopping', 'checkout'],
  status: 'published',
  priority: 'high',
  difficulty: 'beginner',
  estimatedReadTime: 5,
  sections: [
    {
      id: 'section-1',
      title: 'Browse Products',
      content: 'Start by exploring our product catalog. Use the search bar or browse by categories to find what you need.',
      order: 1,
      type: 'text'
    },
    {
      id: 'section-2',
      title: 'Add to Cart',
      content: 'Click the "Add to Cart" button on any product page. You can adjust quantities and options before adding.',
      order: 2,
      type: 'text'
    },
    {
      id: 'section-3',
      title: 'Important Note',
      content: 'Make sure to review your cart before proceeding to checkout. Check quantities, sizes, and colors.',
      order: 3,
      type: 'warning'
    }
  ],
  attachments: [
    {
      id: 'att-1',
      name: 'Order Process Video',
      type: 'video',
      url: '/videos/order-process.mp4',
      thumbnail: '/images/thumbnails/order-video.jpg'
    }
  ],
  comments: [
    {
      id: 'comment-1',
      author: {
        id: 'user-001',
        name: 'John Doe',
        avatar: '/images/avatars/john.jpg',
        role: 'Customer',
        verified: false
      },
      content: 'This guide was really helpful! The step-by-step instructions made it easy to understand.',
      timestamp: '2024-01-20T10:30:00Z',
      helpful: 5,
      replies: []
    }
  ],
  stats: {
    views: 1245,
    likes: 89,
    dislikes: 3,
    bookmarks: 45,
    shares: 12,
    helpful: 156,
    notHelpful: 8,
    rating: 4.6,
    totalRatings: 78
  },
  createdAt: '2024-01-15T09:00:00Z',
  updatedAt: '2024-01-20T14:30:00Z',
  publishedAt: '2024-01-15T12:00:00Z',
  lastModified: '2024-01-20T14:30:00Z'
};

// Main Component
const HelpDetails: React.FC<HelpDetailsProps> = ({
  article,
  onBack,
  onLike,
  onDislike,
  onBookmark,
  onShare,
  onPrint,
  onReport,
  onComment,
  onRate,
  userInteractions = {
    liked: false,
    disliked: false,
    bookmarked: false
  },
  showComments = true,
  showRating = true,
  showStats = true,
  showTableOfContents = true,
  enableSearch = true,
  className,
  enableAnimations = true
}) => {
  // Use provided article or get from database, fallback to default
  const currentArticle = article || defaultArticle;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showAllComments, setShowAllComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [userRating, setUserRating] = useState(userInteractions.rated || 0);
  const [tocVisible, setTocVisible] = useState(showTableOfContents);

  // Handle section expansion
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // Handle comment submission
  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      onComment?.(currentArticle.id, newComment);
      setNewComment('');
    }
  };

  // Handle rating
  const handleRating = (rating: number) => {
    setUserRating(rating);
    onRate?.(currentArticle.id, rating);
  };

  // Filter sections based on search
  const filteredSections = currentArticle.sections.filter(section =>
    !searchTerm || 
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get visible comments
  const visibleComments = showAllComments 
    ? currentArticle.comments 
    : currentArticle.comments.slice(0, 3);

  return (
    <motion.div
      className={cn('max-w-4xl mx-auto', className)}
      variants={enableAnimations ? containerVariants : undefined}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        variants={enableAnimations ? itemVariants : undefined}
        className="mb-6"
      >
        <div className="flex items-center gap-4 mb-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div className="text-sm text-gray-500">
            <span>{currentArticle.category.name}</span>
            <span className="mx-2">•</span>
            <div className="inline-flex items-center gap-1">
              <ClockIcon className="h-4 w-4 text-gray-400" />
              <span>{currentArticle.estimatedReadTime} min read</span>
            </div>
            <span className="mx-2">•</span>
            <div className="inline-flex items-center gap-1">
              <UserIcon className="h-4 w-4 text-gray-400" />
              <span>{formatNumber(currentArticle.stats.views)} views</span>
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {currentArticle.title}
        </h1>

        <p className="text-lg text-gray-600 mb-6">
          {currentArticle.excerpt}
        </p>

        {/* Meta information */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Avatar
              src={currentArticle.author.avatar}
              alt={currentArticle.author.name}
              size="sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {currentArticle.author.name}
                </span>
                {currentArticle.author.verified && (
                  <CheckIcon className="h-4 w-4 text-blue-500" />
                )}
              </div>
              <span className="text-xs text-gray-500">
                {currentArticle.author.role}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={getDifficultyColor(currentArticle.difficulty)} size="sm">
              {currentArticle.difficulty}
            </Badge>
            <Badge className={getPriorityColor(currentArticle.priority)} size="sm">
              {currentArticle.priority}
            </Badge>
          </div>

          <div className="text-sm text-gray-500">
            Updated {format(new Date(currentArticle.updatedAt), 'MMM dd, yyyy')}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {currentArticle.tags.map((tag) => (
            <Badge key={tag} variant="outline" size="sm">
              <TagIcon className="h-3 w-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant={userInteractions.liked ? 'default' : 'outline'}
            size="sm"
            onClick={() => onLike?.(currentArticle.id)}
          >
            {userInteractions.liked ? (
              <HandThumbUpIconSolid className="h-4 w-4 mr-2" />
            ) : (
              <HandThumbUpIcon className="h-4 w-4 mr-2" />
            )}
            {formatNumber(currentArticle.stats.likes)}
          </Button>

          <Button
            variant={userInteractions.disliked ? 'default' : 'outline'}
            size="sm"
            onClick={() => onDislike?.(currentArticle.id)}
          >
            {userInteractions.disliked ? (
              <HandThumbDownIconSolid className="h-4 w-4 mr-2" />
            ) : (
              <HandThumbDownIcon className="h-4 w-4 mr-2" />
            )}
            {formatNumber(currentArticle.stats.dislikes)}
          </Button>

          <Button
            variant={userInteractions.bookmarked ? 'default' : 'outline'}
            size="sm"
            onClick={() => onBookmark?.(currentArticle.id)}
          >
            {userInteractions.bookmarked ? (
              <BookmarkIconSolid className="h-4 w-4 mr-2" />
            ) : (
              <BookmarkIcon className="h-4 w-4 mr-2" />
            )}
            Bookmark
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onShare?.(currentArticle.id)}
          >
            <ShareIcon className="h-4 w-4 mr-2" />
            Share
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPrint?.(currentArticle.id)}
          >
            <PrinterIcon className="h-4 w-4 mr-2" />
            Print
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReport?.(currentArticle.id)}
          >
            <FlagIcon className="h-4 w-4 mr-2" />
            Report
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Table of Contents - Sidebar */}
        {tocVisible && (
          <motion.div
            variants={enableAnimations ? itemVariants : undefined}
            className="lg:col-span-1"
          >
            <Card className="p-4 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Contents</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTocVisible(false)}
                  className="lg:hidden"
                >
                  <ChevronUpIcon className="h-4 w-4" />
                </Button>
              </div>
              
              {enableSearch && (
                <div className="mb-4">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search sections..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 py-2 text-sm"
                      size="sm"
                    />
                  </div>
                </div>
              )}

              <nav className="space-y-2">
                {filteredSections.map((section) => (
                  <a
                    key={section.id}
                    href={`#section-${section.id}`}
                    className="block text-sm text-gray-600 hover:text-gray-900 py-1 px-2 rounded hover:bg-gray-50 transition-colors"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </Card>
          </motion.div>
        )}

        {/* Main Content */}
        <motion.div
          variants={enableAnimations ? itemVariants : undefined}
          className={cn(
            tocVisible ? 'lg:col-span-3' : 'lg:col-span-4'
          )}
        >
          {/* Show ToC button on mobile */}
          {!tocVisible && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTocVisible(true)}
              className="mb-4 lg:hidden"
            >
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              Table of Contents
            </Button>
          )}

          {/* Article sections */}
          <div className="space-y-6">
            {filteredSections.map((section) => {
              const SectionIcon = getSectionIcon(section.type);
              return (
                <motion.div
                  key={section.id}
                  id={`section-${section.id}`}
                  variants={enableAnimations ? sectionVariants : undefined}
                >
                  <Card className={cn('p-6', getSectionStyles(section.type))}>
                    <div className="flex items-start gap-3 mb-4">
                      <SectionIcon className="h-5 w-5 text-gray-500 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <h2 className="text-xl font-semibold text-gray-900">
                            {section.title}
                          </h2>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSection(section.id)}
                            className="p-1"
                          >
                            {expandedSections.has(section.id) ? (
                              <ChevronUpIcon className="h-4 w-4" />
                            ) : (
                              <ChevronDownIcon className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <div className="prose prose-gray max-w-none">
                          <p className="text-gray-700 leading-relaxed">
                            {section.content}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Section attachments */}
                    {section.attachments && section.attachments.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Attachments
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {section.attachments.map((attachment) => (
                            <div
                              key={attachment.id}
                              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                            >
                              {attachment.type === 'video' && (
                                <VideoCameraIcon className="h-5 w-5 text-blue-500" />
                              )}
                              {attachment.type === 'image' && (
                                <PhotoIcon className="h-5 w-5 text-green-500" />
                              )}
                              {attachment.type === 'document' && (
                                <DocumentTextIcon className="h-5 w-5 text-red-500" />
                              )}
                              {attachment.type === 'link' && (
                                <LinkIcon className="h-5 w-5 text-purple-500" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {attachment.name}
                                </p>
                                {attachment.size && (
                                  <p className="text-xs text-gray-500">
                                    {attachment.size}
                                  </p>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(attachment.url, '_blank')}
                              >
                                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Article attachments */}
          {currentArticle.attachments.length > 0 && (
            <motion.div
              variants={enableAnimations ? itemVariants : undefined}
              className="mt-8"
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Additional Resources
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentArticle.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => window.open(attachment.url, '_blank')}
                    >
                      {attachment.type === 'video' && (
                        <VideoCameraIcon className="h-6 w-6 text-blue-500" />
                      )}
                      {attachment.type === 'image' && (
                        <PhotoIcon className="h-6 w-6 text-green-500" />
                      )}
                      {attachment.type === 'document' && (
                        <DocumentTextIcon className="h-6 w-6 text-red-500" />
                      )}
                      {attachment.type === 'link' && (
                        <LinkIcon className="h-6 w-6 text-purple-500" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {attachment.name}
                        </p>
                        <p className="text-sm text-gray-500 capitalize">
                          {attachment.type}
                          {attachment.size && ` • ${attachment.size}`}
                        </p>
                      </div>
                      <ArrowTopRightOnSquareIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Rating Section */}
          {showRating && (
            <motion.div
              variants={enableAnimations ? itemVariants : undefined}
              className="mt-8"
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Rate this Article
                </h3>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-sm text-gray-600">How helpful was this article?</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRating(star)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        {star <= userRating ? (
                          <StarIconSolid className="h-6 w-6 text-yellow-400" />
                        ) : (
                          <StarIcon className="h-6 w-6 text-gray-300" />
                        )}
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    ({formatNumber(currentArticle.stats.totalRatings)} ratings)
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Overall rating: {currentArticle.stats.rating.toFixed(1)}/5</span>
                  <span>•</span>
                  <span>{formatNumber(currentArticle.stats.helpful)} found this helpful</span>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Comments Section */}
          {showComments && (
            <motion.div
              variants={enableAnimations ? itemVariants : undefined}
              className="mt-8"
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Comments ({currentArticle.comments.length})
                </h3>

                {/* Add comment */}
                <div className="mb-6">
                  <div className="flex gap-3">
                    <Avatar size="sm" />
                    <div className="flex-1">
                      <Input
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="mb-2"
                      />
                      <Button
                        size="sm"
                        onClick={handleCommentSubmit}
                        disabled={!newComment.trim()}
                      >
                        Post Comment
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Comments list */}
                <div className="space-y-4">
                  {visibleComments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar
                        src={comment.author.avatar}
                        alt={comment.author.name}
                        size="sm"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {comment.author.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            {format(new Date(comment.timestamp), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{comment.content}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <button className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
                            <HandThumbUpIcon className="h-4 w-4" />
                            {comment.helpful}
                          </button>
                          <button className="text-gray-500 hover:text-gray-700">
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Show more comments */}
                {currentArticle.comments.length > 3 && !showAllComments && (
                  <div className="mt-4 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllComments(true)}
                    >
                      Show {currentArticle.comments.length - 3} more comments
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {/* Stats */}
          {showStats && (
            <motion.div
              variants={enableAnimations ? itemVariants : undefined}
              className="mt-8"
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Article Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatNumber(currentArticle.stats.views)}
                    </div>
                    <div className="text-sm text-gray-500">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <HandThumbUpIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatNumber(currentArticle.stats.likes)}
                    </div>
                    <div className="text-sm text-gray-500">Likes</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <BookmarkIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatNumber(currentArticle.stats.bookmarks)}
                    </div>
                    <div className="text-sm text-gray-500">Bookmarks</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <ShareIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatNumber(currentArticle.stats.shares)}
                    </div>
                    <div className="text-sm text-gray-500">Shares</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HelpDetails;
