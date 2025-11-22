'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronDownIcon,
  ChevronUpIcon,
  PhotoIcon,
  PlayIcon,
  DocumentTextIcon,
  LinkIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { useToast } from '@/hooks/useToast';

import { cn } from '@/lib/utils';
import { Timestamp } from '@/types/common.types';

// Types
export interface ReplyContent {
  id: string;
  type: 'text' | 'rich_text' | 'markdown' | 'html';
  content: string;
  formattedContent?: string;
  plainTextContent?: string;
  wordCount: number;
  characterCount: number;
  readingTime: number; // in seconds
  language: string;
  mentionedUsers?: MentionedUser[];
  hashtags?: string[];
  links?: ContentLink[];
  attachments?: Attachment[];
  sentiment?: 'positive' | 'neutral' | 'negative';
  toxicityScore?: number;
  qualityScore?: number;
  isTranslated?: boolean;
  originalLanguage?: string;
  translatedFrom?: string;
}

export interface MentionedUser {
  id: string;
  displayName: string;
  username: string;
  startIndex: number;
  endIndex: number;
}

export interface ContentLink {
  id: string;
  url: string;
  title?: string;
  description?: string;
  domain: string;
  isInternal: boolean;
  isSafe: boolean;
  previewImage?: string;
  startIndex: number;
  endIndex: number;
}

export interface Attachment {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'link';
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  thumbnailUrl?: string;
  duration?: number; // for audio/video
  width?: number;
  height?: number;
  uploadedAt: Timestamp;
  isProcessed: boolean;
  isPublic: boolean;
  description?: string;
  altText?: string;
}

export interface ReplyBodyProps {
  content: ReplyContent;
  maxHeight?: number;
  maxLines?: number;
  showReadMore?: boolean;
  showWordCount?: boolean;
  showReadingTime?: boolean;
  showTranslation?: boolean;
  showAttachments?: boolean;
  showMentions?: boolean;
  showHashtags?: boolean;
  showLinks?: boolean;
  allowTextSelection?: boolean;
  allowCopy?: boolean;
  highlightMentions?: boolean;
  highlightHashtags?: boolean;
  highlightLinks?: boolean;
  expandable?: boolean;
  collapsible?: boolean;
  autoExpand?: boolean;
  lazyLoad?: boolean;
  trackViews?: boolean;
  enableSearch?: boolean;
  searchQuery?: string;
  variant?: 'default' | 'compact' | 'minimal' | 'detailed';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;

  // Event handlers
  onExpand?: (expanded: boolean) => void;
  onMentionClick?: (user: MentionedUser) => void;
  onHashtagClick?: (hashtag: string) => void;
  onLinkClick?: (link: ContentLink) => void;
  onAttachmentClick?: (attachment: Attachment) => void;
  onTranslate?: (targetLanguage: string) => Promise<string>;
  onCopy?: (content: string) => void;
  onView?: () => void;

  // Analytics
  onAnalyticsEvent?: (event: string, data: Record<string, unknown>) => void;
}

const TEXT_SIZES = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-sm',
  lg: 'text-base'
} as const;

const MAX_LINES = {
  xs: 2,
  sm: 3,
  md: 4,
  lg: 6
} as const;

const ReplyBody: React.FC<ReplyBodyProps> = ({
  content,
  maxHeight,
  maxLines,
  showReadMore = true,
  showWordCount = false,
  showReadingTime = false,
  showTranslation = true,
  showAttachments = true,
  showMentions = true,
  showHashtags = true,
  showLinks = true,
  allowTextSelection = true,
  allowCopy = true,
  highlightMentions = true,
  highlightHashtags = true,
  highlightLinks = true,
  expandable = true,

  autoExpand = false,
  lazyLoad = true,
  trackViews = true,
  enableSearch = false,
  searchQuery,
  variant = 'default',
  size = 'md',
  className,
  onExpand,
  onMentionClick,
  onHashtagClick,
  onLinkClick,
  onAttachmentClick,
  onTranslate,
  onCopy,
  onView,
  onAnalyticsEvent
}) => {
  // Refs
  const contentRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  // State
  const [isExpanded, setIsExpanded] = useState(autoExpand);
  const [isTranslated, setIsTranslated] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);


  // Hooks
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  
  // Simple intersection observer effect
  useEffect(() => {
    if (!contentRef.current || !lazyLoad) {
      setIsVisible(true);
      return;
    }
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (lazyLoad) {
            observer.disconnect();
          }
        }
      },
      { threshold: 0.5 }
    );
    
    observer.observe(contentRef.current);
    
    return () => observer.disconnect();
  }, [lazyLoad]);

  // Track view when visible
  useEffect(() => {
    if (isVisible && trackViews && onView) {
      onView();
      onAnalyticsEvent?.('reply_view', {
        replyId: content.id,
        contentLength: content.characterCount,
        wordCount: content.wordCount
      });
    }
  }, [isVisible, trackViews, onView, content.id, content.characterCount, content.wordCount, onAnalyticsEvent]);

  // Measure content height
  useEffect(() => {
    if (!textRef.current) return;

    const measureHeight = () => {
      const element = textRef.current;
      if (!element) return;

      // Temporarily expand to measure full height
      const originalMaxHeight = element.style.maxHeight;
      const originalOverflow = element.style.overflow;
      
      element.style.maxHeight = 'none';
      element.style.overflow = 'visible';
      
      const fullHeight = element.scrollHeight;
      
      // Restore original styles
      element.style.maxHeight = originalMaxHeight;
      element.style.overflow = originalOverflow;
      
      // Check if content overflows
      const defaultMaxLines = maxLines || MAX_LINES[size];
      const lineHeight = parseInt(getComputedStyle(element).lineHeight) || 20;
      const maxAllowedHeight = maxHeight || (defaultMaxLines * lineHeight);
      
      setIsOverflowing(fullHeight > maxAllowedHeight);
    };

    measureHeight();
    
    // Re-measure on window resize
    window.addEventListener('resize', measureHeight);
    return () => window.removeEventListener('resize', measureHeight);
  }, [content.content, maxHeight, maxLines, size]);

  // Determine display content
  const displayContent = useMemo(() => {
    if (isTranslated && translatedContent) {
      return translatedContent;
    }
    
    return content.formattedContent || content.content;
  }, [isTranslated, translatedContent, content.formattedContent, content.content]);

  // Process content for display based on flags
  // Process content for highlighting
  const processedContent = useMemo(() => {
    const shouldShowHashtags = showHashtags && content.hashtags && content.hashtags.length > 0;
    const shouldShowLinks = showLinks && content.links && content.links.length > 0;
    
    let processed = displayContent;
    
    // Highlight search query
    if (enableSearch && searchQuery && searchQuery.length > 2) {
      const regex = new RegExp(`(${searchQuery})`, 'gi');
      processed = processed.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
    }
    
    // Highlight mentions
    if (highlightMentions && showMentions && content.mentionedUsers && content.mentionedUsers.length > 0) {
      content.mentionedUsers.forEach((mention) => {
        const regex = new RegExp(`(@${mention.username})`, 'g');
        processed = processed.replace(
          regex, 
          `<span class="text-blue-600 hover:text-blue-800 cursor-pointer font-medium" data-mention-id="${mention.id}">$1</span>`
        );
      });
    }
    
    // Highlight hashtags
    if (highlightHashtags && shouldShowHashtags) {
      content.hashtags?.forEach((hashtag) => {
        const regex = new RegExp(`(#${hashtag})`, 'g');
        processed = processed.replace(
          regex,
          `<span class="text-blue-600 hover:text-blue-800 cursor-pointer font-medium" data-hashtag="${hashtag}">$1</span>`
        );
      });
    }
    
    // Highlight links
    if (highlightLinks && shouldShowLinks) {
      content.links?.forEach((link) => {
        const regex = new RegExp(`(${link.url})`, 'g');
        processed = processed.replace(
          regex,
          `<a href="${link.url}" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer" data-link-id="${link.id}">$1</a>`
        );
      });
    }
    
    return processed;
  }, [
    displayContent, enableSearch, searchQuery, highlightMentions, 
    highlightHashtags, highlightLinks, content.mentionedUsers, 
    content.hashtags, content.links, showMentions, showHashtags, showLinks
  ]);

  // Handle expand/collapse
  const handleToggleExpand = useCallback(() => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onExpand?.(newExpanded);
    
    onAnalyticsEvent?.('reply_expand_toggle', {
      replyId: content.id,
      expanded: newExpanded
    });
  }, [isExpanded, onExpand, content.id, onAnalyticsEvent]);

  // Handle translation
  const handleTranslate = useCallback(async () => {
    if (!onTranslate || isTranslating) return;

    setIsTranslating(true);
    
    try {
      const targetLanguage = navigator.language.split('-')[0] || 'en';
      const translated = await onTranslate(targetLanguage);
      
      setTranslatedContent(translated);
      setIsTranslated(true);
      
      onAnalyticsEvent?.('reply_translate', {
        replyId: content.id,
        fromLanguage: content.language,
        toLanguage: targetLanguage
      });
      
      toast({
        title: 'Content translated',
        description: `Translated from ${content.language} to ${targetLanguage}`,
      });
      
    } catch (error) {
      console.error('Translation failed:', error);
      toast({
        title: 'Translation failed',
        description: 'Unable to translate content',
        variant: 'destructive'
      });
    } finally {
      setIsTranslating(false);
    }
  }, [onTranslate, isTranslating, content.id, content.language, onAnalyticsEvent, toast]);

  // Handle copy
  const handleCopy = useCallback(async () => {
    if (!allowCopy) return;

    try {
      const textToCopy = content.plainTextContent || content.content;
      await navigator.clipboard.writeText(textToCopy);
      
      setShowCopyTooltip(true);
      setTimeout(() => setShowCopyTooltip(false), 2000);
      
      onCopy?.(textToCopy);
      onAnalyticsEvent?.('reply_copy', {
        replyId: content.id,
        contentLength: textToCopy.length
      });
      
      toast({
        title: 'Copied to clipboard',
        duration: 2000
      });
      
    } catch (error) {
      console.error('Copy failed:', error);
      toast({
        title: 'Copy failed',
        description: 'Unable to copy content',
        variant: 'destructive'
      });
    }
  }, [allowCopy, content.plainTextContent, content.content, content.id, onCopy, onAnalyticsEvent, toast]);

  // Handle content clicks (mentions, hashtags, links)
  const handleContentClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    
    // Handle mention clicks
    if (target.dataset.mentionId && onMentionClick) {
      event.preventDefault();
      const mention = content.mentionedUsers?.find(m => m.id === target.dataset.mentionId);
      if (mention) {
        onMentionClick(mention);
        onAnalyticsEvent?.('reply_mention_click', {
          replyId: content.id,
          mentionedUserId: mention.id
        });
      }
    }
    
    // Handle hashtag clicks
    if (target.dataset.hashtag && onHashtagClick) {
      event.preventDefault();
      onHashtagClick(target.dataset.hashtag);
      onAnalyticsEvent?.('reply_hashtag_click', {
        replyId: content.id,
        hashtag: target.dataset.hashtag
      });
    }
    
    // Handle link clicks
    if (target.dataset.linkId && onLinkClick) {
      const link = content.links?.find(l => l.id === target.dataset.linkId);
      if (link) {
        onLinkClick(link);
        onAnalyticsEvent?.('reply_link_click', {
          replyId: content.id,
          linkUrl: link.url
        });
      }
    }
  }, [content, onMentionClick, onHashtagClick, onLinkClick, onAnalyticsEvent]);

  // Render metadata
  const renderMetadata = useCallback(() => {
    const items = [];
    
    if (showWordCount && content.wordCount > 0) {
      items.push(
        <span key="words" className="text-xs text-gray-500">
          {content.wordCount} word{content.wordCount !== 1 ? 's' : ''}
        </span>
      );
    }
    
    if (showReadingTime && content.readingTime > 0) {
      const minutes = Math.ceil(content.readingTime / 60);
      items.push(
        <span key="reading-time" className="text-xs text-gray-500">
          {minutes} min read
        </span>
      );
    }
    
    if (content.isTranslated) {
      items.push(
        <Badge key="translated" variant="outline" className="text-xs">
          Translated from {content.originalLanguage}
        </Badge>
      );
    }
    
    if (content.sentiment && variant === 'detailed') {
      const sentimentColors = {
        positive: 'text-green-600',
        neutral: 'text-gray-600',
        negative: 'text-red-600'
      };
      
      items.push(
        <span key="sentiment" className={cn('text-xs capitalize', sentimentColors[content.sentiment])}>
          {content.sentiment}
        </span>
      );
    }
    
    return items.length > 0 ? (
      <div className="flex items-center gap-3 mt-2">
        {items}
      </div>
    ) : null;
  }, [
    showWordCount, showReadingTime, content.wordCount, content.readingTime, 
    content.isTranslated, content.originalLanguage, content.sentiment, variant
  ]);

  // Render attachments
  const renderAttachments = useCallback(() => {
    if (!showAttachments || !content.attachments || content.attachments.length === 0) {
      return null;
    }

    return (
      <div className="mt-3 space-y-2">
        <div className="text-xs font-medium text-gray-700">
          Attachments ({content.attachments.length})
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {content.attachments.map((attachment) => (
            <div
              key={attachment.id}
              onClick={() => onAttachmentClick?.(attachment)}
              className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex-shrink-0">
                {attachment.type === 'image' && <PhotoIcon className="w-4 h-4 text-gray-500" />}
                {attachment.type === 'video' && <PlayIcon className="w-4 h-4 text-gray-500" />}
                {attachment.type === 'document' && <DocumentTextIcon className="w-4 h-4 text-gray-500" />}
                {attachment.type === 'link' && <LinkIcon className="w-4 h-4 text-gray-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-900 truncate">
                  {attachment.filename}
                </div>
                <div className="text-xs text-gray-500">
                  {(attachment.size / 1024).toFixed(1)} KB
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }, [showAttachments, content.attachments, onAttachmentClick]);

  // Render action buttons
  const renderActions = useCallback(() => {
    const actions = [];
    
    if (allowCopy) {
      actions.push(
        <Tooltip key="copy" content={showCopyTooltip ? 'Copied!' : 'Copy text'}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
          >
            <ClipboardDocumentIcon className="w-3 h-3" />
          </Button>
        </Tooltip>
      );
    }
    
    if (showTranslation && onTranslate && content.language !== 'en') {
      actions.push(
        <Button
          key="translate"
          variant="ghost"
          size="sm"
          onClick={isTranslated ? () => setIsTranslated(false) : handleTranslate}
          disabled={isTranslating}
          className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
        >
          {isTranslating ? (
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            isTranslated ? 'Show original' : 'Translate'
          )}
        </Button>
      );
    }
    
    return actions.length > 0 ? (
      <div className="flex items-center gap-1 mt-2">
        {actions}
      </div>
    ) : null;
  }, [
    allowCopy, showCopyTooltip, handleCopy, showTranslation, onTranslate, 
    content.language, isTranslated, isTranslating, handleTranslate
  ]);

  // Calculate display classes
  const contentClasses = useMemo(() => {
    const classes = [];
    
    if (!isExpanded && (maxHeight || maxLines)) {
      classes.push('overflow-hidden');
      if (!maxHeight && maxLines) {
        classes.push('line-clamp-' + (maxLines || MAX_LINES[size]));
      }
    }
    
    return classes.join(' ');
  }, [isExpanded, maxHeight, maxLines, size]);
  
  // Calculate inline styles only for maxHeight
  const contentStyles = useMemo(() => {
    if (!isExpanded && maxHeight) {
      return { maxHeight: `${maxHeight}px` };
    }
    return {};
  }, [isExpanded, maxHeight]);

  return (
    <motion.div
      ref={contentRef}
      initial={lazyLoad ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'space-y-2',
        variant === 'compact' && 'space-y-1',
        variant === 'minimal' && 'space-y-1',
        className
      )}
    >
      {/* Main Content */}
      <div className="relative">
        <div
          ref={textRef}
          {...(Object.keys(contentStyles).length > 0 && { style: contentStyles })}
          className={cn(
            'prose prose-sm max-w-none',
            TEXT_SIZES[size],
            'leading-relaxed text-gray-900',
            !allowTextSelection && 'select-none',
            'transition-all duration-300',
            contentClasses
          )}
          onClick={handleContentClick}
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />
        
        {/* Fade overlay for collapsed content */}
        {!isExpanded && isOverflowing && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        )}
      </div>
      
      {/* Read More/Less Button */}
      {expandable && isOverflowing && showReadMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleExpand}
          className="h-6 px-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          {isExpanded ? (
            <>
              <ChevronUpIcon className="w-3 h-3 mr-1" />
              Show less
            </>
          ) : (
            <>
              <ChevronDownIcon className="w-3 h-3 mr-1" />
              Read more
            </>
          )}
        </Button>
      )}
      
      {/* Attachments */}
      {renderAttachments()}
      
      {/* Metadata */}
      {renderMetadata()}
      
      {/* Actions */}
      {renderActions()}
    </motion.div>
  );
};

export default ReplyBody;
