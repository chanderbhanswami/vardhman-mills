'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  StarIcon,
  ClockIcon,
  UserIcon,
  EyeIcon,
  TagIcon,
  ChevronRightIcon,
  BookmarkIcon,
  ShareIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChatBubbleLeftIcon,
  CalendarIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  PhotoIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import { 
  StarIcon as StarIconSolid,
  BookmarkIcon as BookmarkIconSolid,
  HandThumbUpIcon as HandThumbUpIconSolid,
  HandThumbDownIcon as HandThumbDownIconSolid
} from '@heroicons/react/24/solid';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

// Types and Interfaces
export interface HelpArticle {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
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
  attachments?: {
    id: string;
    name: string;
    type: 'image' | 'video' | 'document' | 'link';
    url: string;
  }[];
}

export interface HelpCardProps {
  article: HelpArticle;
  variant?: 'default' | 'compact' | 'detailed' | 'featured';
  showAuthor?: boolean;
  showMetadata?: boolean;
  showActions?: boolean;
  showRating?: boolean;
  showTags?: boolean;
  showExcerpt?: boolean;
  onClick?: (article: HelpArticle) => void;
  onBookmark?: (articleId: string) => void;
  onRate?: (articleId: string, rating: number) => void;
  onHelpful?: (articleId: string, helpful: boolean) => void;
  onShare?: (article: HelpArticle) => void;
  className?: string;
  enableAnimations?: boolean;
  searchTerm?: string;
}

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  },
  hover: {
    y: -4,
    transition: { duration: 0.2 }
  }
};

const contentVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { delay: 0.1, duration: 0.3 }
  }
};

// Utility functions
const getDifficultyColor = (difficulty: HelpArticle['difficulty']) => {
  switch (difficulty) {
    case 'beginner':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'advanced':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getTypeIcon = (type: HelpArticle['type']) => {
  switch (type) {
    case 'video':
      return VideoCameraIcon;
    case 'guide':
      return BookmarkIcon;
    case 'faq':
      return ChatBubbleLeftIcon;
    default:
      return DocumentTextIcon;
  }
};

const getTypeColor = (type: HelpArticle['type']) => {
  switch (type) {
    case 'video':
      return 'bg-red-100 text-red-600';
    case 'guide':
      return 'bg-blue-100 text-blue-600';
    case 'faq':
      return 'bg-purple-100 text-purple-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

const highlightSearchTerm = (text: string, searchTerm?: string) => {
  if (!searchTerm || !searchTerm.trim()) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => 
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-200 px-1 rounded">
        {part}
      </mark>
    ) : part
  );
};

const formatReadTime = (minutes: number) => {
  if (minutes < 1) return '< 1 min read';
  return `${minutes} min read`;
};

const formatViews = (views: number) => {
  if (views < 1000) return views.toString();
  if (views < 1000000) return `${(views / 1000).toFixed(1)}k`;
  return `${(views / 1000000).toFixed(1)}m`;
};

// Main Component
const HelpCard: React.FC<HelpCardProps> = ({
  article,
  variant = 'default',
  showAuthor = true,
  showMetadata = true,
  showActions = true,
  showRating = true,
  showTags = true,
  showExcerpt = true,
  onClick,
  onBookmark,
  onRate,
  onHelpful,
  onShare,
  className,
  enableAnimations = true,
  searchTerm
}) => {
  const [userRating, setUserRating] = useState<number>(0);
  const [isBookmarked, setIsBookmarked] = useState(article.isBookmarked || false);
  const [helpfulVotes, setHelpfulVotes] = useState(article.helpfulness);
  const [userHelpfulVote, setUserHelpfulVote] = useState<boolean | null>(null);

  const TypeIcon = getTypeIcon(article.type);

  // Handle card click
  const handleCardClick = () => {
    if (onClick) {
      onClick(article);
    }
  };

  // Handle bookmark
  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newBookmarked = !isBookmarked;
    setIsBookmarked(newBookmarked);
    onBookmark?.(article.id);
  };

  // Handle rating
  const handleRating = (rating: number) => {
    setUserRating(rating);
    onRate?.(article.id, rating);
  };

  // Handle helpful votes
  const handleHelpful = (helpful: boolean) => {
    if (userHelpfulVote === helpful) {
      // Remove vote
      setUserHelpfulVote(null);
      setHelpfulVotes(prev => ({
        helpful: helpful ? prev.helpful - 1 : prev.helpful,
        notHelpful: helpful ? prev.notHelpful : prev.notHelpful - 1
      }));
    } else {
      // Add or change vote
      const prevVote = userHelpfulVote;
      setUserHelpfulVote(helpful);
      setHelpfulVotes(prev => ({
        helpful: helpful 
          ? (prevVote === false ? prev.helpful + 1 : prev.helpful + 1)
          : (prevVote === true ? prev.helpful - 1 : prev.helpful),
        notHelpful: !helpful
          ? (prevVote === true ? prev.notHelpful + 1 : prev.notHelpful + 1)
          : (prevVote === false ? prev.notHelpful - 1 : prev.notHelpful)
      }));
    }
    onHelpful?.(article.id, helpful);
  };

  // Handle share
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.(article);
  };

  // Get card classes based on variant
  const getCardClasses = () => {
    const baseClasses = 'cursor-pointer transition-all duration-200 hover:shadow-lg';
    
    switch (variant) {
      case 'compact':
        return cn(baseClasses, 'p-4');
      case 'detailed':
        return cn(baseClasses, 'p-6');
      case 'featured':
        return cn(baseClasses, 'p-6 border-2 border-blue-200 bg-blue-50');
      default:
        return cn(baseClasses, 'p-5');
    }
  };

  // Render star rating
  const renderStarRating = (rating: number, interactive = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && handleRating(star)}
            disabled={!interactive}
            className={cn(
              'transition-colors',
              interactive ? 'hover:text-yellow-400 cursor-pointer' : 'cursor-default'
            )}
          >
            {star <= rating ? (
              <StarIconSolid className="h-4 w-4 text-yellow-400" />
            ) : (
              <StarIcon className="h-4 w-4 text-gray-300" />
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      variants={enableAnimations ? cardVariants : undefined}
      initial="hidden"
      animate="visible"
      whileHover={enableAnimations ? "hover" : undefined}
      onClick={handleCardClick}
    >
      <Card className={cn(getCardClasses(), className)}>
        <motion.div
          variants={enableAnimations ? contentVariants : undefined}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={cn('p-1.5 rounded', getTypeColor(article.type))}>
                <TypeIcon className="h-4 w-4" />
              </div>
              <Badge variant="outline" className={getDifficultyColor(article.difficulty)}>
                {article.difficulty}
              </Badge>
              <Badge variant="secondary">
                {article.category}
              </Badge>
            </div>
            {showActions && (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleBookmark}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                  aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                >
                  {isBookmarked ? (
                    <BookmarkIconSolid className="h-4 w-4 text-blue-600" />
                  ) : (
                    <BookmarkIcon className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={handleShare}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Share article"
                  aria-label="Share article"
                >
                  <ShareIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {highlightSearchTerm(article.title, searchTerm)}
          </h3>

          {/* Excerpt */}
          {showExcerpt && variant !== 'compact' && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-3">
              {highlightSearchTerm(article.excerpt, searchTerm)}
            </p>
          )}

          {/* Author & Metadata */}
          {showAuthor && showMetadata && (
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {article.author.avatar ? (
                  <Avatar
                    src={article.author.avatar}
                    alt={article.author.name}
                    size="sm"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {article.author.name}
                  </div>
                  {article.author.role && (
                    <div className="text-xs text-gray-500">
                      {article.author.role}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          {showTags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              <TagIcon className="h-3 w-3 text-gray-400 mt-0.5" />
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
          )}

          {/* Attachments */}
          {article.attachments && article.attachments.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              {article.attachments.slice(0, 3).map((attachment) => {
                const AttachmentIcon = attachment.type === 'image' ? PhotoIcon :
                  attachment.type === 'video' ? VideoCameraIcon :
                  attachment.type === 'document' ? DocumentTextIcon : LinkIcon;
                
                return (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-600"
                  >
                    <AttachmentIcon className="h-3 w-3" />
                    <span className="max-w-[60px] truncate">{attachment.name}</span>
                  </div>
                );
              })}
              {article.attachments.length > 3 && (
                <div className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                  +{article.attachments.length - 3}
                </div>
              )}
            </div>
          )}

          {/* Stats & Rating */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <EyeIcon className="h-3 w-3" />
                <span>{formatViews(article.views)}</span>
              </div>
              <div className="flex items-center gap-1">
                <ClockIcon className="h-3 w-3" />
                <span>{formatReadTime(article.estimatedReadTime)}</span>
              </div>
              {showRating && (
                <div className="flex items-center gap-2">
                  {renderStarRating(userRating || article.rating.average, true)}
                  <span className="text-xs">
                    {(userRating || article.rating.average).toFixed(1)} ({article.rating.count})
                  </span>
                </div>
              )}
            </div>

            {/* Helpful votes */}
            {showActions && (
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleHelpful(true);
                  }}
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors',
                    userHelpfulVote === true
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                  )}
                  title="Mark as helpful"
                  aria-label="Mark as helpful"
                >
                  {userHelpfulVote === true ? (
                    <HandThumbUpIconSolid className="h-3 w-3" />
                  ) : (
                    <HandThumbUpIcon className="h-3 w-3" />
                  )}
                  <span>{helpfulVotes.helpful}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleHelpful(false);
                  }}
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors',
                    userHelpfulVote === false
                      ? 'bg-red-100 text-red-700'
                      : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                  )}
                  title="Mark as not helpful"
                  aria-label="Mark as not helpful"
                >
                  {userHelpfulVote === false ? (
                    <HandThumbDownIconSolid className="h-3 w-3" />
                  ) : (
                    <HandThumbDownIcon className="h-3 w-3" />
                  )}
                  <span>{helpfulVotes.notHelpful}</span>
                </button>
              </div>
            )}
          </div>

          {/* Action Button for Featured Variant */}
          {variant === 'featured' && (
            <div className="mt-4 pt-4 border-t border-blue-200">
              <Button
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick();
                }}
              >
                Read Full Article
                <ChevronRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default HelpCard;
