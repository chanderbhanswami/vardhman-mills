'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HandThumbUpIcon, 
  HandThumbDownIcon,
  BookmarkIcon,
  ShareIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon,
  CalendarIcon,
  TagIcon,
  LinkIcon,
  ClipboardDocumentIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import {
  HandThumbUpIcon as HandThumbUpSolidIcon,
  HandThumbDownIcon as HandThumbDownSolidIcon,
  BookmarkIcon as BookmarkSolidIcon
} from '@heroicons/react/24/solid';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/Separator';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// Import types from FAQCategory
import type { FAQ } from './FAQCategory';

export interface FAQItemProps {
  faq: FAQ;
  onVote?: (faqId: string, voteType: 'up' | 'down') => void;
  onBookmark?: (faqId: string) => void;
  onShare?: (faqId: string) => void;
  searchTerm?: string;
  compact?: boolean;
  showMetadata?: boolean;
  showActions?: boolean;
  isExpanded?: boolean;
  onToggle?: (faqId: string) => void;
  className?: string;
  enableAnimations?: boolean;
  showRelated?: boolean;
  maxAnswerLength?: number;
}

// Animation variants
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

const contentVariants = {
  collapsed: { 
    height: 0,
    opacity: 0,
    transition: { duration: 0.2 }
  },
  expanded: { 
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.3 }
  }
};

const actionVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.2, delay: 0.1 }
  }
};

const voteVariants = {
  idle: { scale: 1 },
  voted: { 
    scale: [1, 1.2, 1],
    transition: { duration: 0.3 }
  }
};

// Utility functions
const getStatusBadgeProps = (status: FAQ['status']) => {
  switch (status) {
    case 'answered':
      return { variant: 'success' as const, children: 'Answered' };
    case 'pending':
      return { variant: 'warning' as const, children: 'Pending' };
    case 'draft':
      return { variant: 'secondary' as const, children: 'Draft' };
    default:
      return { variant: 'secondary' as const, children: 'Unknown' };
  }
};

const getDifficultyBadgeProps = (difficulty: FAQ['difficulty']) => {
  switch (difficulty) {
    case 'beginner':
      return { variant: 'success' as const, children: 'Beginner' };
    case 'intermediate':
      return { variant: 'default' as const, children: 'Intermediate' };
    case 'advanced':
      return { variant: 'destructive' as const, children: 'Advanced' };
    default:
      return { variant: 'secondary' as const, children: 'Unknown' };
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

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  } catch {
    // Fallback for browsers that don't support clipboard API
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    toast.success('Copied to clipboard!');
  }
};

// Main Component
const FAQItem: React.FC<FAQItemProps> = ({
  faq,
  onVote,
  onBookmark,
  onShare,
  searchTerm,
  compact = false,
  showMetadata = true,
  showActions = true,
  isExpanded: controlledExpanded,
  onToggle,
  className,
  enableAnimations = true,
  showRelated = true,
  maxAnswerLength = 200
}) => {
  const [localExpanded, setLocalExpanded] = useState(false);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(faq.isBookmarked || false);
  const [voteAnimation, setVoteAnimation] = useState<'up' | 'down' | null>(null);
  
  const contentRef = useRef<HTMLDivElement>(null);
  
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : localExpanded;
  
  // Load user's previous interactions from localStorage
  useEffect(() => {
    const storedVote = localStorage.getItem(`faq-vote-${faq.id}`);
    const storedBookmark = localStorage.getItem(`faq-bookmark-${faq.id}`);
    
    if (storedVote && ['up', 'down'].includes(storedVote)) {
      setUserVote(storedVote as 'up' | 'down');
    }
    
    if (storedBookmark === 'true') {
      setIsBookmarked(true);
    }
  }, [faq.id]);

  // Calculate vote scores
  const voteScore = useMemo(() => {
    let upvotes = faq.votes.upvotes;
    let downvotes = faq.votes.downvotes;
    
    // Adjust based on user's vote
    if (userVote === 'up') upvotes += 1;
    if (userVote === 'down') downvotes += 1;
    
    return upvotes - downvotes;
  }, [faq.votes, userVote]);

  // Handle toggle
  const handleToggle = () => {
    if (onToggle) {
      onToggle(faq.id);
    } else {
      setLocalExpanded(!localExpanded);
    }
  };

  // Handle voting
  const handleVote = (voteType: 'up' | 'down') => {
    const newVote = userVote === voteType ? null : voteType;
    setUserVote(newVote);
    setVoteAnimation(voteType);
    
    // Store in localStorage
    if (newVote) {
      localStorage.setItem(`faq-vote-${faq.id}`, newVote);
    } else {
      localStorage.removeItem(`faq-vote-${faq.id}`);
    }
    
    // Call parent handler
    onVote?.(faq.id, voteType);
    
    // Reset animation after delay
    setTimeout(() => setVoteAnimation(null), 300);
    
    // Show feedback
    toast.success(
      newVote === 'up' ? 'Thanks for your upvote!' :
      newVote === 'down' ? 'Thanks for your feedback!' :
      'Vote removed'
    );
  };

  // Handle bookmark
  const handleBookmark = () => {
    const newBookmarked = !isBookmarked;
    setIsBookmarked(newBookmarked);
    
    // Store in localStorage
    if (newBookmarked) {
      localStorage.setItem(`faq-bookmark-${faq.id}`, 'true');
    } else {
      localStorage.removeItem(`faq-bookmark-${faq.id}`);
    }
    
    // Call parent handler
    onBookmark?.(faq.id);
    
    // Show feedback
    toast.success(newBookmarked ? 'Added to bookmarks!' : 'Removed from bookmarks!');
  };

  // Handle share
  const handleShare = async () => {
    const shareData = {
      title: faq.question,
      text: faq.answer,
      url: `${window.location.origin}/faq/${faq.id}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await copyToClipboard(shareData.url);
      }
      onShare?.(faq.id);
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  // Handle copy question
  const handleCopyQuestion = () => {
    copyToClipboard(faq.question);
  };

  // Handle copy answer
  const handleCopyAnswer = () => {
    copyToClipboard(faq.answer);
  };

  // Truncated answer for compact view
  const displayAnswer = useMemo(() => {
    if (isExpanded || compact === false) return faq.answer;
    return truncateText(faq.answer, maxAnswerLength);
  }, [faq.answer, isExpanded, compact, maxAnswerLength]);

  const shouldShowReadMore = !isExpanded && faq.answer.length > maxAnswerLength;

  return (
    <motion.div
      className={cn('w-full', className)}
      variants={enableAnimations ? itemVariants : undefined}
      initial="hidden"
      animate="visible"
      whileHover={enableAnimations ? "hover" : undefined}
    >
      <Card className={cn(
        'overflow-hidden transition-all duration-200',
        isExpanded ? 'shadow-lg' : 'hover:shadow-md',
        compact ? 'p-4' : 'p-6'
      )}>
        
        {/* Question Section */}
        <div className="space-y-4">
          {/* Question Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className={cn(
                'font-semibold text-gray-900 leading-relaxed',
                compact ? 'text-base' : 'text-lg'
              )}>
                {highlightSearchTerm(faq.question, searchTerm)}
              </h4>
              
              {/* Metadata Row */}
              {showMetadata && (
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  {faq.author && (
                    <div className="flex items-center gap-2">
                      <Avatar
                        src={faq.author.avatar}
                        alt={faq.author.name}
                        size="sm"
                        fallback={faq.author.name.charAt(0)}
                      />
                      <span>{faq.author.name}</span>
                      <Badge variant="outline" size="sm">
                        {faq.author.role}
                      </Badge>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{format(new Date(faq.lastUpdated), 'MMM dd, yyyy')}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <EyeIcon className="h-4 w-4" />
                    <span>{faq.views.toLocaleString()} views</span>
                  </div>
                </div>
              )}
            </div>

            {/* Status and Difficulty Badges */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge {...getStatusBadgeProps(faq.status)} />
              <Badge {...getDifficultyBadgeProps(faq.difficulty)} />
            </div>
          </div>

          {/* Tags */}
          {faq.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <TagIcon className="h-4 w-4 text-gray-400" />
              {faq.tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  size="sm"
                  className="text-xs"
                >
                  {highlightSearchTerm(tag, searchTerm)}
                </Badge>
              ))}
            </div>
          )}

          {/* Answer Section */}
          <div className="space-y-3">
            {!compact && <Separator />}
            
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {highlightSearchTerm(displayAnswer, searchTerm)}
              </p>
              
              {shouldShowReadMore && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={handleToggle}
                  className="p-0 h-auto text-blue-600 hover:text-blue-800"
                >
                  Read more
                </Button>
              )}
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  ref={contentRef}
                  variants={enableAnimations ? contentVariants : undefined}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  style={{ overflow: 'hidden' }}
                >
                  {/* Related FAQs */}
                  {showRelated && faq.relatedFAQs && faq.relatedFAQs.length > 0 && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-3">Related Questions</h5>
                      <div className="space-y-2">
                        {faq.relatedFAQs.slice(0, 3).map((relatedId) => (
                          <div key={relatedId} className="flex items-center gap-2 text-sm">
                            <LinkIcon className="h-3 w-3 text-gray-400" />
                            <button className="text-blue-600 hover:text-blue-800 text-left">
                              Related FAQ #{relatedId}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions Section */}
          {showActions && (
            <motion.div
              className="flex items-center justify-between pt-4 border-t border-gray-100"
              variants={enableAnimations ? actionVariants : undefined}
              initial="hidden"
              animate="visible"
            >
              {/* Left Actions - Voting */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <motion.button
                    onClick={() => handleVote('up')}
                    className={cn(
                      'p-2 rounded-full transition-colors duration-200',
                      userVote === 'up' 
                        ? 'text-green-600 bg-green-50 hover:bg-green-100' 
                        : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                    )}
                    variants={voteAnimation === 'up' ? voteVariants : undefined}
                    animate={voteAnimation === 'up' ? "voted" : "idle"}
                  >
                    {userVote === 'up' ? (
                      <HandThumbUpSolidIcon className="h-4 w-4" />
                    ) : (
                      <HandThumbUpIcon className="h-4 w-4" />
                    )}
                  </motion.button>
                  
                  <span className={cn(
                    'text-sm font-medium px-2',
                    voteScore > 0 ? 'text-green-600' : 
                    voteScore < 0 ? 'text-red-600' : 'text-gray-500'
                  )}>
                    {voteScore > 0 ? '+' : ''}{voteScore}
                  </span>
                  
                  <motion.button
                    onClick={() => handleVote('down')}
                    className={cn(
                      'p-2 rounded-full transition-colors duration-200',
                      userVote === 'down' 
                        ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                        : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                    )}
                    variants={voteAnimation === 'down' ? voteVariants : undefined}
                    animate={voteAnimation === 'down' ? "voted" : "idle"}
                  >
                    {userVote === 'down' ? (
                      <HandThumbDownSolidIcon className="h-4 w-4" />
                    ) : (
                      <HandThumbDownIcon className="h-4 w-4" />
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-2">
                {/* Copy Actions */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyQuestion}
                  className="gap-2 text-gray-500 hover:text-gray-700"
                >
                  <ClipboardDocumentIcon className="h-4 w-4" />
                  Copy Q
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyAnswer}
                  className="gap-2 text-gray-500 hover:text-gray-700"
                >
                  <DocumentDuplicateIcon className="h-4 w-4" />
                  Copy A
                </Button>

                {/* Bookmark */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmark}
                  className={cn(
                    'gap-2 transition-colors duration-200',
                    isBookmarked 
                      ? 'text-blue-600 hover:text-blue-700' 
                      : 'text-gray-500 hover:text-blue-600'
                  )}
                >
                  {isBookmarked ? (
                    <BookmarkSolidIcon className="h-4 w-4" />
                  ) : (
                    <BookmarkIcon className="h-4 w-4" />
                  )}
                  {isBookmarked ? 'Saved' : 'Save'}
                </Button>

                {/* Share */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="gap-2 text-gray-500 hover:text-gray-700"
                >
                  <ShareIcon className="h-4 w-4" />
                  Share
                </Button>

                {/* Expand/Collapse */}
                {!compact && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggle}
                    className="gap-2 text-gray-500 hover:text-gray-700"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUpIcon className="h-4 w-4" />
                        Collapse
                      </>
                    ) : (
                      <>
                        <ChevronDownIcon className="h-4 w-4" />
                        Expand
                      </>
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default FAQItem;
