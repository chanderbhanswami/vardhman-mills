'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Separator } from '@/components/ui/Separator';

import ReplyHeader from './Header';
import ReplyBody from './Body';
import ActionFooter from './ActionFooter';

import { cn } from '@/lib/utils';
import { ReviewUser } from '@/types/review.types';
import { Timestamp } from '@/types/common.types';

// Types
export interface ReviewReplyItemProps {
  // Core data
  id: string;
  user: ReviewUser;
  content: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  
  // Reply metadata
  isEdited?: boolean;
  isAuthor?: boolean;
  isPinned?: boolean;
  isHighlighted?: boolean;
  isOp?: boolean; // Original poster
  isModerator?: boolean;
  isDeleted?: boolean;
  isHidden?: boolean;
  
  // Interaction data
  likes?: number;
  dislikes?: number;
  userReaction?: 'like' | 'dislike' | null;
  replies?: ReviewReplyItemProps[];
  replyCount?: number;
  viewCount?: number;
  
  // Content metadata
  attachments?: Array<{
    id: string;
    type: 'image' | 'video' | 'document' | 'link';
    url: string;
    name: string;
    size?: number;
    mimeType?: string;
    thumbnail?: string;
  }>;
  mentions?: Array<{
    id: string;
    displayName: string;
    position: [number, number]; // [start, end] in content
  }>;
  hashtags?: string[];
  links?: Array<{
    url: string;
    title?: string;
    description?: string;
    image?: string;
    position: [number, number];
  }>;
  
  // Translation
  originalLanguage?: string;
  translatedContent?: string;
  isTranslated?: boolean;
  
  // Privacy & moderation
  isReported?: boolean;
  reportCount?: number;
  moderationFlags?: string[];
  
  // Display options
  showHeader?: boolean;
  showTimestamp?: boolean;
  showLocation?: boolean;
  showVerification?: boolean;
  showEditHistory?: boolean;
  showMoreMenu?: boolean;
  showActions?: boolean;
  showReplies?: boolean;
  showReplyButton?: boolean;
  showLikes?: boolean;
  showDislikes?: boolean;
  showShare?: boolean;
  showReport?: boolean;
  showTranslation?: boolean;
  
  // Layout options
  variant?: 'default' | 'compact' | 'minimal' | 'detailed' | 'nested';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  depth?: number;
  maxDepth?: number;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  interactive?: boolean;
  
  // Styling
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  
  // Event handlers
  onLike?: (replyId: string) => void;
  onDislike?: (replyId: string) => void;
  onReply?: (replyId: string, content: string) => void;
  onEdit?: (replyId: string, content: string) => void;
  onDelete?: (replyId: string) => void;
  onReport?: (replyId: string, reason: string) => void;
  onShare?: (replyId: string) => void;
  onUserClick?: (user: ReviewUser) => void;
  onMentionClick?: (userId: string) => void;
  onHashtagClick?: (hashtag: string) => void;
  onLinkClick?: (url: string) => void;
  onTranslate?: (replyId: string, targetLanguage: string) => void;
  onCopyLink?: (replyId: string) => void;
  onViewEditHistory?: (replyId: string) => void;
  onBlock?: (userId: string) => void;
  onFollow?: (userId: string) => void;
  onCollapse?: (replyId: string, collapsed: boolean) => void;
  
  // Analytics
  onAnalyticsEvent?: (event: string, data: Record<string, unknown>) => void;
}

const SIZE_CONFIGS = {
  xs: {
    card: 'p-2',
    spacing: 'space-y-1',
    text: 'text-xs'
  },
  sm: {
    card: 'p-3',
    spacing: 'space-y-2',
    text: 'text-sm'
  },
  md: {
    card: 'p-4',
    spacing: 'space-y-3',
    text: 'text-sm'
  },
  lg: {
    card: 'p-6',
    spacing: 'space-y-4',
    text: 'text-base'
  }
} as const;

const ReviewReplyItem: React.FC<ReviewReplyItemProps> = ({
  id,
  user,
  content,
  createdAt,
  updatedAt,
  isEdited = false,
  isAuthor = false,
  isPinned = false,
  isHighlighted = false,
  isOp = false,
  isModerator = false,
  isDeleted = false,
  isHidden = false,
  likes = 0,
  dislikes = 0,
  userReaction = null,
  replies = [],
  replyCount,
  viewCount,
  mentions = [],
  hashtags = [],
  links = [],
  originalLanguage,
  translatedContent,
  isTranslated = false,
  isReported = false,
  showHeader = true,
  showTimestamp = true,
  showLocation = true,
  showVerification = true,
  showEditHistory = false,
  showMoreMenu = true,
  showActions = true,
  showReplies = true,
  showTranslation = true,
  variant = 'default',
  size = 'md',
  depth = 0,
  maxDepth = 3,
  collapsible = false,
  defaultCollapsed = false,
  interactive = true,
  className,
  headerClassName,
  bodyClassName,
  footerClassName,
  onLike,
  onDislike,
  onReply,
  onEdit,
  onDelete,
  onReport,
  onShare,
  onUserClick,
  onMentionClick,
  onHashtagClick,
  onLinkClick,
  onTranslate,
  onCopyLink,
  onViewEditHistory,
  onBlock,
  onFollow,
  onCollapse,
  onAnalyticsEvent
}) => {
  // State
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // Refs
  const replyRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  // Configuration
  const sizeConfig = SIZE_CONFIGS[size];
  const actualReplyCount = replyCount ?? replies.length;
  
  // Determine layout variant
  const isCompact = useMemo(() => {
    return variant === 'compact' || variant === 'minimal' || depth > 2;
  }, [variant, depth]);
  
  const isNested = useMemo(() => {
    return variant === 'nested' || depth > 0;
  }, [variant, depth]);
  
  // Setup intersection observer for lazy loading
  useEffect(() => {
    if (!replyRef.current) return;
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observerRef.current?.disconnect();
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );
    
    observerRef.current.observe(replyRef.current);
    
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);
  
  // Handle collapse toggle
  const handleCollapseToggle = useCallback(() => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapse?.(id, newCollapsed);
    onAnalyticsEvent?.('reply_collapse_toggle', {
      replyId: id,
      collapsed: newCollapsed,
      depth
    });
  }, [isCollapsed, id, onCollapse, onAnalyticsEvent, depth]);
  
  // Handle reply submission
  const handleReplySubmit = useCallback((content: string) => {
    if (onReply) {
      onReply(id, content);
      setIsReplying(false);
      onAnalyticsEvent?.('reply_submit', {
        replyId: id,
        contentLength: content.length
      });
    }
  }, [onReply, id, onAnalyticsEvent]);
  
  // Handle edit submission
  const handleEditSubmit = useCallback((newContent: string) => {
    if (onEdit) {
      onEdit(id, newContent);
      setIsEditing(false);
      onAnalyticsEvent?.('reply_edit_submit', {
        replyId: id,
        contentLength: newContent.length
      });
    }
  }, [onEdit, id, onAnalyticsEvent]);
  
  // Handle show more replies
  const handleShowMoreReplies = useCallback(() => {
    setShowAllReplies(true);
    onAnalyticsEvent?.('reply_show_more', {
      replyId: id,
      totalReplies: actualReplyCount
    });
  }, [id, actualReplyCount, onAnalyticsEvent]);
  
  // Handle action events with proper async signatures
  const handleLike = useCallback(async () => {
    onLike?.(id);
    onAnalyticsEvent?.('reply_like', { replyId: id, userId: user.id });
  }, [onLike, id, user.id, onAnalyticsEvent]);
  
  const handleDislike = useCallback(async () => {
    onDislike?.(id);
    onAnalyticsEvent?.('reply_dislike', { replyId: id, userId: user.id });
  }, [onDislike, id, user.id, onAnalyticsEvent]);
  
  const handleShare = useCallback(async () => {
    onShare?.(id);
    onAnalyticsEvent?.('reply_share', { replyId: id, userId: user.id });
  }, [onShare, id, user.id, onAnalyticsEvent]);
  
  const handleReport = useCallback(async (reason: string) => {
    onReport?.(id, reason);
    onAnalyticsEvent?.('reply_report', { replyId: id, reason, userId: user.id });
  }, [onReport, id, user.id, onAnalyticsEvent]);
  
  // Render collapsed state
  const renderCollapsed = useCallback(() => {
    if (!isCollapsed) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="py-2"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCollapseToggle}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
        >
          <ChevronDownIcon className="w-4 h-4" />
          <span className="text-sm">
            Show reply from {user.displayName}
            {actualReplyCount > 0 && ` (+${actualReplyCount} ${actualReplyCount === 1 ? 'reply' : 'replies'})`}
          </span>
        </Button>
      </motion.div>
    );
  }, [isCollapsed, handleCollapseToggle, user.displayName, actualReplyCount]);
  
  // Render replies
  const renderReplies = useCallback(() => {
    if (!showReplies || !replies.length || depth >= maxDepth) return null;
    
    const visibleReplies = showAllReplies ? replies : replies.slice(0, 3);
    const hiddenCount = replies.length - visibleReplies.length;
    
    return (
      <div className="space-y-2 mt-3">
        <AnimatePresence>
          {visibleReplies.map((reply, index) => (
            <motion.div
              key={reply.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.05 }}
            >
              <ReviewReplyItem
                {...reply}
                depth={depth + 1}
                maxDepth={maxDepth}
                size={size}
                variant={isCompact ? 'compact' : variant}
                onLike={onLike}
                onDislike={onDislike}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                onReport={onReport}
                onShare={onShare}
                onUserClick={onUserClick}
                onMentionClick={onMentionClick}
                onHashtagClick={onHashtagClick}
                onLinkClick={onLinkClick}
                onTranslate={onTranslate}
                onCopyLink={onCopyLink}
                onViewEditHistory={onViewEditHistory}
                onBlock={onBlock}
                onFollow={onFollow}
                onCollapse={onCollapse}
                onAnalyticsEvent={onAnalyticsEvent}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        
        {hiddenCount > 0 && !showAllReplies && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShowMoreReplies}
            className="text-blue-600 hover:text-blue-800"
          >
            Show {hiddenCount} more {hiddenCount === 1 ? 'reply' : 'replies'}
          </Button>
        )}
      </div>
    );
  }, [
    showReplies, replies, depth, maxDepth, showAllReplies, handleShowMoreReplies,
    size, isCompact, variant, onLike, onDislike, onReply, onEdit, onDelete,
    onReport, onShare, onUserClick, onMentionClick, onHashtagClick, onLinkClick,
    onTranslate, onCopyLink, onViewEditHistory, onBlock, onFollow, onCollapse,
    onAnalyticsEvent
  ]);
  
  // Don't render if deleted and not visible
  if (isDeleted && !isVisible) {
    return null;
  }
  
  // Don't render if hidden by moderation
  if (isHidden && !isModerator) {
    return null;
  }
  
  return (
    <div
      ref={replyRef}
      className={cn(
        'relative transition-all duration-200',
        isNested && 'ml-4 border-l-2 border-gray-200 pl-4',
        depth === 2 && 'ml-8',
        depth === 3 && 'ml-12 pl-3',
        depth >= 4 && 'ml-16 pl-2 border-l border-gray-300',
        isHighlighted && 'bg-yellow-50',
        className
      )}
    >
      <AnimatePresence mode="wait">
        {isCollapsed ? (
          renderCollapsed()
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className={cn(
                'relative group',
                sizeConfig.card,
                isCompact && 'shadow-sm',
                !isCompact && 'shadow-md hover:shadow-lg transition-shadow',
                isDeleted && 'opacity-50',
                isReported && 'border-red-200',
                isPinned && 'border-yellow-200 bg-yellow-50/30'
              )}
            >
              {/* Collapse button for collapsible replies */}
              {collapsible && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCollapseToggle}
                  className="absolute -left-2 top-2 w-4 h-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronUpIcon className="w-3 h-3" />
                </Button>
              )}
              
              <div className={cn('space-y-3', sizeConfig.spacing)}>
                {/* Header */}
                {showHeader && (
                  <ReplyHeader
                    user={user}
                    createdAt={createdAt}
                    updatedAt={updatedAt}
                    isEdited={isEdited}
                    isAuthor={isAuthor}
                    isPinned={isPinned}
                    isHighlighted={isHighlighted}
                    isOp={isOp}
                    replyCount={actualReplyCount}
                    viewCount={viewCount}
                    showTimestamp={showTimestamp}
                    showLocation={showLocation}
                    showVerification={showVerification}
                    showEditHistory={showEditHistory}
                    showMoreMenu={showMoreMenu}
                    compact={isCompact}
                    size={size}
                    interactive={interactive}
                    className={headerClassName}
                    onUserClick={onUserClick}
                    onReport={() => handleReport('inappropriate')}
                    onBlock={() => onBlock?.(user.id)}
                    onShare={handleShare}
                    onCopyLink={() => onCopyLink?.(id)}
                    onViewProfile={() => onUserClick?.(user)}
                    onViewEditHistory={() => onViewEditHistory?.(id)}
                    onAnalyticsEvent={onAnalyticsEvent}
                  />
                )}
                
                {showHeader && showActions && <Separator className="my-2" />}
                
                {/* Body */}
                <ReplyBody
                  content={{
                    id: id,
                    type: 'text' as const,
                    content: isEditing ? '' : content,
                    formattedContent: content,
                    plainTextContent: content,
                    wordCount: content.split(/\s+/).filter(Boolean).length,
                    characterCount: content.length,
                    readingTime: Math.ceil(content.split(/\s+/).filter(Boolean).length / 200),
                    language: originalLanguage || 'en',
                    mentionedUsers: mentions?.map(m => ({
                      id: m.id,
                      displayName: m.displayName,
                      username: m.displayName.toLowerCase().replace(/\s+/g, ''),
                      startIndex: m.position[0],
                      endIndex: m.position[1]
                    })) || [],
                    hashtags: hashtags || [],
                    links: links?.map(l => ({
                      id: `link-${l.url}`,
                      url: l.url,
                      title: l.title,
                      description: l.description,
                      domain: new URL(l.url).hostname,
                      isInternal: l.url.startsWith('/'),
                      isSafe: true,
                      previewImage: l.image,
                      startIndex: l.position[0],
                      endIndex: l.position[1]
                    })) || [],
                    isTranslated,
                    originalLanguage
                  }}
                  showReadMore={!isCompact}
                  showTranslation={showTranslation}
                  showAttachments={true}
                  showMentions={true}
                  showHashtags={true}
                  showLinks={true}
                  allowTextSelection={interactive}
                  allowCopy={interactive}
                  highlightMentions={true}
                  highlightHashtags={true}
                  highlightLinks={true}
                  expandable={!isCompact}
                  size={size}
                  className={bodyClassName}
                  onMentionClick={(user) => onMentionClick?.(user.id)}
                  onHashtagClick={onHashtagClick}
                  onLinkClick={(link) => onLinkClick?.(link.url)}
                  onTranslate={async (targetLang) => {
                    onTranslate?.(id, targetLang);
                    return translatedContent || content;
                  }}
                  onAnalyticsEvent={onAnalyticsEvent}
                />
                
                {/* Actions Footer */}
                {showActions && !isEditing && (
                  <>
                    <Separator className="my-2" />
                    <ActionFooter
                      replyId={id}
                      userId={user.id}
                      user={{
                        id: user.id,
                        displayName: user.displayName,
                        avatar: user.avatar?.url,
                        isVerified: user.badges?.some(b => b.name === 'verified') || false,
                        badges: user.badges?.map(b => b.name) || [],
                        role: 'user' as const,
                        level: 'member',
                        reputation: user.reputationScore || 0,
                        trustScore: user.trustScore || 0
                      }}
                      stats={{
                        likes,
                        dislikes,
                        replies: actualReplyCount,
                        shares: 0,
                        bookmarks: 0,
                        reports: 0,
                        views: viewCount || 0,
                        helpfulVotes: 0,
                        unhelpfulVotes: 0,
                        isLiked: userReaction === 'like',
                        isDisliked: userReaction === 'dislike'
                      }}
                      metadata={{
                        id: id,
                        reviewId: 'review-' + id,
                        content: content,
                        createdAt,
                        updatedAt,
                        isEdited,
                        editHistory: [],
                        isPinned,
                        isHighlighted,
                        isLocked: false,
                        moderationStatus: 'approved' as const,
                        language: originalLanguage || 'en',
                        sentiment: 'neutral' as const,
                        qualityScore: 85,
                        spamScore: 0
                      }}
                      isOwner={user.id === 'current-user'} // Replace with actual logic
                      canEdit={user.id === 'current-user'} // Replace with actual logic
                      canDelete={user.id === 'current-user'} // Replace with actual logic
                      showStats={!isCompact}
                      showActions={showActions}
                      showAdvancedActions={!isCompact}
                      compact={isCompact}
                      size={size}
                      className={cn(footerClassName, isReplying && 'border-t border-gray-200 pt-2')}
                      onLike={async (replyId, isLiked) => {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const _ = { replyId, isLiked };
                        await handleLike();
                      }}
                      onDislike={async (replyId, isDisliked) => {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const _ = { replyId, isDisliked };
                        await handleDislike();
                      }}
                      onReply={async (replyId, content) => {
                        handleReplySubmit(content);
                      }}
                      onEdit={async (replyId, newContent) => {
                        handleEditSubmit(newContent);
                      }}
                      onDelete={async (replyId, reason) => {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const _ = { replyId, reason };
                        onDelete?.(id);
                      }}
                      onShare={async (replyId, platform) => {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const _ = { replyId, platform };
                        await handleShare();
                      }}
                      onReport={async (replyId, reason, details) => {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const _ = { replyId, details };
                        await handleReport(reason);
                      }}
                      onAnalyticsEvent={onAnalyticsEvent}
                    />
                  </>
                )}
              </div>
            </Card>
            
            {/* Nested Replies */}
            {renderReplies()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReviewReplyItem;
