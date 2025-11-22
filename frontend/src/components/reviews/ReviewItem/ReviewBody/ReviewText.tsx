'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Search, 
  Eye, 
  Hash, 
  Share2, 
  Flag, 
  Edit3, 
  Trash2, 
  MoreHorizontal,
  PaintBucket,
  Languages,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { Input } from '@/components/ui/Input';

import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { truncateText } from '@/lib/format';
import { useLocalStorage } from '@/hooks/localStorage/useLocalStorage';
import { useDebounce } from '@/hooks/common/useDebounce';

// Types
export interface ReviewTextContent {
  id: string;
  title?: string;
  content: string;
  summary?: string;
  excerpt?: string;
  wordCount: number;
  characterCount: number;
  readingTime: number; // in minutes
  language?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  tone?: 'formal' | 'casual' | 'professional' | 'humorous' | 'critical';
  topics?: string[];
  keywords?: string[];
  mentions?: Array<{
    type: 'user' | 'product' | 'location' | 'hashtag';
    text: string;
    url?: string;
  }>;
  formatting?: {
    hasFormatting: boolean;
    bold: string[];
    italic: string[];
    underline: string[];
    highlight: string[];
    links: Array<{
      text: string;
      url: string;
      position: { start: number; end: number };
    }>;
    quotes: Array<{
      text: string;
      author?: string;
      position: { start: number; end: number };
    }>;
    lists: Array<{
      type: 'ordered' | 'unordered';
      items: string[];
      position: { start: number; end: number };
    }>;
  };
  metadata?: {
    createdAt: string;
    updatedAt?: string;
    version: number;
    editHistory?: Array<{
      timestamp: string;
      action: 'create' | 'edit' | 'format';
      userId: string;
      changes?: string;
    }>;
    translations?: Array<{
      language: string;
      content: string;
      translator?: string;
      confidence: number;
    }>;
  };
  analytics?: {
    views: number;
    copies: number;
    shares: number;
    highlights: number;
    timeSpent: number; // in seconds
    readCompletionRate: number; // percentage
    engagementScore: number;
  };
  accessibility?: {
    readability: {
      score: number;
      level: 'elementary' | 'middle' | 'high' | 'college' | 'graduate';
      suggestions?: string[];
    };
    screenReader: {
      friendly: boolean;
      alternativeText?: string;
    };
    dyslexiaFriendly: {
      score: number;
      suggestions?: string[];
    };
  };
}

export interface ReviewTextProps {
  content: ReviewTextContent;
  className?: string;
  maxHeight?: number;
  showTitle?: boolean;
  showSummary?: boolean;
  showStats?: boolean;
  showFormatting?: boolean;
  showMentions?: boolean;
  showTopics?: boolean;
  showReadingTime?: boolean;
  showLanguage?: boolean;
  showSentiment?: boolean;
  allowExpansion?: boolean;
  allowCopy?: boolean;
  allowShare?: boolean;
  allowHighlight?: boolean;
  allowTranslation?: boolean;
  allowTextToSpeech?: boolean;
  allowSearch?: boolean;
  allowFormatting?: boolean;
  expandThreshold?: number;
  autoExpand?: boolean;
  
  // Reading preferences
  fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  fontFamily?: 'sans' | 'serif' | 'mono';
  lineHeight?: 'tight' | 'normal' | 'relaxed' | 'loose';
  letterSpacing?: 'tight' | 'normal' | 'wide';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  theme?: 'light' | 'dark' | 'sepia' | 'high-contrast';
  dyslexiaMode?: boolean;
  
  // Interactive features
  enableSelection?: boolean;
  enableContextMenu?: boolean;
  enableReadingProgress?: boolean;
  enableVoiceNotes?: boolean;
  enableCollaboration?: boolean;
  
  // Event handlers
  onExpand?: (expanded: boolean) => void;
  onCopy?: (text: string, selection?: string) => void;
  onShare?: (text: string, method?: string) => void;
  onHighlight?: (text: string, position: { start: number; end: number }) => void;
  onMentionClick?: (mention: { type: string; text: string; url?: string }) => void;
  onTopicClick?: (topic: string) => void;
  onLinkClick?: (url: string) => void;
  onQuoteClick?: (quote: { text: string; author?: string }) => void;
  onTranslate?: (targetLanguage: string) => void;
  onTextToSpeech?: (text: string, voice?: string) => void;
  onSearch?: (query: string) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onReport?: (reason: string) => void;
  onAnalytics?: (event: string, data?: unknown) => void;
  
  // Permissions
  userId?: string;
  isOwner?: boolean;
  isAdmin?: boolean;
  isModerator?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canModerate?: boolean;
  
  // Customization
  customFormatters?: Array<{
    name: string;
    pattern: RegExp;
    component: React.ComponentType<{ match: string; children: React.ReactNode }>;
  }>;
  customActions?: Array<{
    id: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (content: ReviewTextContent) => void;
  }>;
}

const ReviewText: React.FC<ReviewTextProps> = ({
  content,
  className,
  maxHeight = 300,
  showTitle = true,
  showSummary = false,
  showStats = true,
  showFormatting = true,
  showMentions = true,
  showTopics = true,
  showReadingTime = true,
  showLanguage = false,
  showSentiment = false,
  allowExpansion = true,
  allowCopy = true,
  allowShare = true,
  allowHighlight = true,
  allowTranslation = false,
  allowTextToSpeech = false,
  allowSearch = true,
  expandThreshold = 200,
  autoExpand = false,
  fontSize = 'base',
  fontFamily = 'sans',
  lineHeight = 'normal',
  letterSpacing = 'normal',
  textAlign = 'left',
  theme = 'light',
  dyslexiaMode = false,
  enableSelection = true,
  enableContextMenu = true,
  enableReadingProgress = true,
  onExpand,
  onCopy,
  onShare,
  onHighlight,
  onMentionClick,
  onTopicClick,
  onTranslate,
  onTextToSpeech,
  onSearch,
  onEdit,
  onDelete,
  onReport,
  onAnalytics,
  canEdit = false,
  canDelete = false,
  customFormatters = [],
  customActions = []
}) => {
  // State
  const [isExpanded, setIsExpanded] = useState(autoExpand);
  const [selectedText, setSelectedText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ start: number; end: number }>>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [, setIsSearching] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [speechRate] = useState(1);
  const [speechVoice] = useState('');
  const [highlights, setHighlights] = useState<Array<{ start: number; end: number; color: string }>>([]);
  const [showFormatToolbar, setShowFormatToolbar] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [,] = useState(Date.now());
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Refs
  const textRef = useRef<HTMLDivElement>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const selectionRef = useRef<Selection | null>(null);

  // Hooks
  const [,] = useLocalStorage('review-text-prefs', {
    fontSize,
    fontFamily,
    lineHeight,
    theme,
    dyslexiaMode,
    autoExpand: false
  });

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Computed values
  const shouldTruncate = useMemo(() => {
    return !isExpanded && allowExpansion && content.content.length > expandThreshold;
  }, [isExpanded, allowExpansion, content.content.length, expandThreshold]);

  const displayContent = useMemo(() => {
    if (translatedContent) return translatedContent;
    return shouldTruncate ? truncateText(content.content, expandThreshold) : content.content;
  }, [translatedContent, shouldTruncate, content.content, expandThreshold]);

  const formattedContent = useMemo(() => {
    let formatted = displayContent;

    // Apply custom formatters
    customFormatters.forEach(formatter => {
      formatted = formatted.replace(formatter.pattern, (match) => {
        return `<span data-formatter="${formatter.name}">${match}</span>`;
      });
    });

    // Apply built-in formatting
    if (showFormatting && content.formatting?.hasFormatting) {
      // Bold text
      content.formatting.bold?.forEach(text => {
        formatted = formatted.replace(new RegExp(text, 'gi'), `<strong>${text}</strong>`);
      });

      // Italic text
      content.formatting.italic?.forEach(text => {
        formatted = formatted.replace(new RegExp(text, 'gi'), `<em>${text}</em>`);
      });

      // Underlined text
      content.formatting.underline?.forEach(text => {
        formatted = formatted.replace(new RegExp(text, 'gi'), `<u>${text}</u>`);
      });

      // Highlighted text
      content.formatting.highlight?.forEach(text => {
        formatted = formatted.replace(new RegExp(text, 'gi'), `<mark>${text}</mark>`);
      });

      // Links
      content.formatting.links?.forEach(link => {
        formatted = formatted.replace(
          link.text,
          `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">${link.text}</a>`
        );
      });
    }

    // Apply mentions formatting
    if (showMentions && content.mentions) {
      content.mentions.forEach(mention => {
        const className = cn(
          'inline-flex items-center px-1 rounded text-sm font-medium cursor-pointer transition-colors',
          mention.type === 'user' && 'bg-blue-100 text-blue-800 hover:bg-blue-200',
          mention.type === 'product' && 'bg-green-100 text-green-800 hover:bg-green-200',
          mention.type === 'location' && 'bg-purple-100 text-purple-800 hover:bg-purple-200',
          mention.type === 'hashtag' && 'bg-orange-100 text-orange-800 hover:bg-orange-200'
        );
        
        formatted = formatted.replace(
          mention.text,
          `<span class="${className}" data-mention="${mention.type}" data-url="${mention.url || ''}">${mention.text}</span>`
        );
      });
    }

    // Apply search highlighting
    if (searchResults.length > 0 && searchQuery) {
      searchResults.forEach((result, index) => {
        const isActive = index === currentSearchIndex;
        const beforeText = formatted.substring(0, result.start);
        const searchText = formatted.substring(result.start, result.end);
        const afterText = formatted.substring(result.end);
        
        formatted = beforeText + 
          `<span class="bg-yellow-200 ${isActive ? 'bg-yellow-400' : ''} px-1 rounded">${searchText}</span>` + 
          afterText;
      });
    }

    // Apply user highlights
    highlights.forEach(highlight => {
      const beforeText = formatted.substring(0, highlight.start);
      const highlightText = formatted.substring(highlight.start, highlight.end);
      const afterText = formatted.substring(highlight.end);
      
      formatted = beforeText + 
        `<span class="px-1 rounded" style="background-color: ${highlight.color}">${highlightText}</span>` + 
        afterText;
    });

    return formatted;
  }, [
    displayContent, customFormatters, showFormatting, content.formatting, showMentions, 
    content.mentions, searchResults, searchQuery, currentSearchIndex, highlights
  ]);

  // Track reading progress
  useEffect(() => {
    if (!enableReadingProgress || !textRef.current) return;

    const handleScroll = () => {
      const element = textRef.current;
      if (!element) return;

      const { scrollTop, scrollHeight, clientHeight } = element;
      const progress = Math.min((scrollTop + clientHeight) / scrollHeight * 100, 100);
      setReadingProgress(progress);
    };

    const element = textRef.current;
    element.addEventListener('scroll', handleScroll);
    
    return () => element.removeEventListener('scroll', handleScroll);
  }, [enableReadingProgress]);

  // Search functionality
  useEffect(() => {
    if (!debouncedSearch || !allowSearch) {
      setSearchResults([]);
      setCurrentSearchIndex(0);
      return;
    }

    const results: Array<{ start: number; end: number }> = [];
    const regex = new RegExp(debouncedSearch, 'gi');
    let match;

    while ((match = regex.exec(content.content)) !== null) {
      results.push({
        start: match.index,
        end: match.index + match[0].length
      });
    }

    setSearchResults(results);
    setCurrentSearchIndex(0);
    onSearch?.(debouncedSearch);
  }, [debouncedSearch, content.content, allowSearch, onSearch]);

  // Text-to-speech functionality
  useEffect(() => {
    return () => {
      if (speechRef.current) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  // Analytics tracking
  useEffect(() => {
    const startTime = Date.now();
    
    return () => {
      const timeSpent = (Date.now() - startTime) / 1000;
      onAnalytics?.('reading_time', { 
        contentId: content.id, 
        timeSpent, 
        readingProgress,
        wordCount: content.wordCount 
      });
    };
  }, [content.id, content.wordCount, readingProgress, onAnalytics]);

  // Handlers
  const handleExpand = useCallback(() => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onExpand?.(newExpanded);
    onAnalytics?.('expand', { contentId: content.id, expanded: newExpanded });
  }, [isExpanded, onExpand, onAnalytics, content.id]);

  const handleCopy = useCallback(async (text?: string) => {
    const textToCopy = text || selectedText || content.content;
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success('Text copied to clipboard');
      onCopy?.(textToCopy, selectedText);
      onAnalytics?.('copy', { contentId: content.id, length: textToCopy.length });
    } catch {
      toast.error('Failed to copy text');
    }
  }, [selectedText, content.content, content.id, onCopy, onAnalytics]);

  const handleShare = useCallback(async (method?: string) => {
    const shareText = selectedText || content.title || content.excerpt || content.content.substring(0, 100);
    
    try {
      if (navigator.share && !method) {
        await navigator.share({
          title: content.title || 'Review Text',
          text: shareText,
          url: window.location.href
        });
      } else {
        await handleCopy(shareText);
      }
      
      onShare?.(shareText, method);
      onAnalytics?.('share', { contentId: content.id, method: method || 'native' });
    } catch (error) {
      console.error('Share failed:', error);
    }
  }, [selectedText, content, handleCopy, onShare, onAnalytics]);

  const handleHighlight = useCallback((color: string = '#ffeb3b') => {
    const selection = window.getSelection();
    if (!selection || selection.toString().length === 0) {
      toast.error('Please select text to highlight');
      return;
    }

    const range = selection.getRangeAt(0);
    const start = range.startOffset;
    const end = range.endOffset;
    const text = selection.toString();

    const newHighlight = { start, end, color };
    setHighlights(prev => [...prev, newHighlight]);
    
    onHighlight?.(text, { start, end });
    onAnalytics?.('highlight', { contentId: content.id, text, color });
    
    selection.removeAllRanges();
    toast.success('Text highlighted');
  }, [content.id, onHighlight, onAnalytics]);

  const handleTextToSpeech = useCallback((text?: string, voice?: string) => {
    if (!allowTextToSpeech) return;

    const textToSpeak = text || selectedText || content.content;
    
    if (isReading) {
      speechSynthesis.cancel();
      setIsReading(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = speechRate;
    
    if (voice || speechVoice) {
      const voices = speechSynthesis.getVoices();
      const selectedVoice = voices.find(v => v.name === (voice || speechVoice));
      if (selectedVoice) utterance.voice = selectedVoice;
    }

    utterance.onstart = () => setIsReading(true);
    utterance.onend = () => setIsReading(false);
    utterance.onerror = () => {
      setIsReading(false);
      toast.error('Text-to-speech failed');
    };

    speechRef.current = utterance;
    speechSynthesis.speak(utterance);
    
    onTextToSpeech?.(textToSpeak, voice);
    onAnalytics?.('text_to_speech', { contentId: content.id, length: textToSpeak.length });
  }, [
    allowTextToSpeech, selectedText, content.content, content.id, isReading, 
    speechRate, speechVoice, onTextToSpeech, onAnalytics
  ]);

  const handleTranslate = useCallback(async (language: string) => {
    if (!allowTranslation) return;

    try {
      setIsSearching(true);
      // This would typically call a translation API
      // For now, we'll simulate the translation
      const translated = `[Translated to ${language}] ${content.content}`;
      setTranslatedContent(translated);
      setTargetLanguage(language);
      
      onTranslate?.(language);
      onAnalytics?.('translate', { contentId: content.id, targetLanguage: language });
      toast.success(`Translated to ${language}`);
    } catch {
      toast.error('Translation failed');
    } finally {
      setIsSearching(false);
    }
  }, [allowTranslation, content.content, content.id, onTranslate, onAnalytics]);

  const handleSelectionChange = useCallback(() => {
    if (!enableSelection) return;

    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      setSelectedText(selection.toString());
      setShowFormatToolbar(true);
      selectionRef.current = selection;
    } else {
      setSelectedText('');
      setShowFormatToolbar(false);
      selectionRef.current = null;
    }
  }, [enableSelection]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (!enableContextMenu) return;
    
    e.preventDefault();
    // Custom context menu logic would go here
  }, [enableContextMenu]);

  const handleMentionClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const mentionElement = target.closest('[data-mention]');
    
    if (mentionElement) {
      const type = mentionElement.getAttribute('data-mention') as string;
      const text = mentionElement.textContent || '';
      const url = mentionElement.getAttribute('data-url') || undefined;
      
      onMentionClick?.({ type, text, url });
      onAnalytics?.('mention_click', { contentId: content.id, type, text });
    }
  }, [content.id, onMentionClick, onAnalytics]);

  const toggleBookmark = useCallback(() => {
    setIsBookmarked(prev => !prev);
    onAnalytics?.('bookmark', { contentId: content.id, bookmarked: !isBookmarked });
    toast.success(isBookmarked ? 'Bookmark removed' : 'Bookmarked');
  }, [content.id, isBookmarked, onAnalytics]);

  // Navigation through search results
  const navigateSearchResults = useCallback((direction: 'next' | 'prev') => {
    if (searchResults.length === 0) return;

    setCurrentSearchIndex(prev => {
      if (direction === 'next') {
        return prev < searchResults.length - 1 ? prev + 1 : 0;
      } else {
        return prev > 0 ? prev - 1 : searchResults.length - 1;
      }
    });
  }, [searchResults.length]);

  // Render content stats
  const renderStats = useCallback(() => {
    if (!showStats) return null;

    return (
      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
        {showReadingTime && (
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {content.readingTime} min read
          </span>
        )}
        
        <span>{content.wordCount} words</span>
        <span>{content.characterCount} characters</span>
        
        {showLanguage && content.language && (
          <Badge variant="outline" className="text-xs">
            <Languages className="w-3 h-3 mr-1" />
            {content.language.toUpperCase()}
          </Badge>
        )}
        
        {showSentiment && content.sentiment && (
          <Badge 
            variant={content.sentiment === 'positive' ? 'success' : content.sentiment === 'negative' ? 'destructive' : 'secondary'}
            className="text-xs"
          >
            {content.sentiment}
          </Badge>
        )}

        {enableReadingProgress && (
          <span className="flex items-center gap-1">
            <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-blue-500 transition-all duration-300 w-[${Math.round(readingProgress)}%]`}
              />
            </div>
            <span className="text-xs">{Math.round(readingProgress)}%</span>
          </span>
        )}
      </div>
    );
  }, [
    showStats, showReadingTime, content.readingTime, content.wordCount, 
    content.characterCount, showLanguage, content.language, showSentiment, 
    content.sentiment, enableReadingProgress, readingProgress
  ]);

  // Render topics
  const renderTopics = useCallback(() => {
    if (!showTopics || !content.topics || content.topics.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2">
        {content.topics.map((topic, index) => (
          <Badge
            key={index}
            variant="outline"
            className="text-xs cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => {
              onTopicClick?.(topic);
              onAnalytics?.('topic_click', { contentId: content.id, topic });
            }}
          >
            <Hash className="w-3 h-3 mr-1" />
            {topic}
          </Badge>
        ))}
      </div>
    );
  }, [showTopics, content.topics, content.id, onTopicClick, onAnalytics]);

  // Render toolbar
  const renderToolbar = useCallback(() => {
    return (
      <div className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-lg">
        {/* Search */}
        {allowSearch && (
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search in text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
            
            {searchResults.length > 0 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateSearchResults('prev')}
                  className="h-6 w-6 p-0"
                >
                  <ChevronUp className="w-3 h-3" />
                </Button>
                
                <span className="text-xs text-gray-600">
                  {currentSearchIndex + 1}/{searchResults.length}
                </span>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateSearchResults('next')}
                  className="h-6 w-6 p-0"
                >
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {allowCopy && (
            <Tooltip content="Copy text">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy()}
                className="h-8 w-8 p-0"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </Tooltip>
          )}

          {allowShare && (
            <Tooltip content="Share">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleShare()}
                className="h-8 w-8 p-0"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </Tooltip>
          )}

          {allowTextToSpeech && (
            <Tooltip content={isReading ? "Stop reading" : "Read aloud"}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTextToSpeech()}
                className="h-8 w-8 p-0"
              >
                {isReading ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
            </Tooltip>
          )}

          <Tooltip content={isBookmarked ? "Remove bookmark" : "Bookmark"}>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleBookmark}
              className="h-8 w-8 p-0"
            >
              {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </Button>
          </Tooltip>

          {/* More actions */}
          <DropdownMenu
            trigger={
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            }
            items={[
              ...(allowTranslation ? [{
                key: 'translate',
                label: 'Translate',
                icon: Languages,
                onClick: () => handleTranslate('es') // Example: translate to Spanish
              }] : []),
              ...(allowHighlight ? [{
                key: 'highlight',
                label: 'Highlight',
                icon: PaintBucket,
                onClick: () => handleHighlight()
              }] : []),
              {
                key: 'analytics',
                label: 'View Analytics',
                icon: Eye,
                onClick: () => setShowAnalytics(true)
              },
              ...(canEdit ? [{
                key: 'edit',
                label: 'Edit',
                icon: Edit3,
                onClick: () => onEdit?.()
              }] : []),
              ...(canDelete ? [{
                key: 'delete',
                label: 'Delete',
                icon: Trash2,
                destructive: true,
                onClick: () => onDelete?.()
              }] : []),
              {
                key: 'report',
                label: 'Report',
                icon: Flag,
                destructive: true,
                onClick: () => onReport?.('inappropriate')
              },
              ...customActions.map(action => ({
                key: action.id,
                label: action.label,
                icon: action.icon || MoreHorizontal,
                onClick: () => action.onClick(content)
              }))
            ]}
            align="end"
          />
        </div>
      </div>
    );
  }, [
    allowSearch, searchQuery, searchResults.length, currentSearchIndex, navigateSearchResults,
    allowCopy, handleCopy, allowShare, handleShare, allowTextToSpeech, handleTextToSpeech, 
    isReading, isBookmarked, toggleBookmark, allowTranslation, handleTranslate, 
    allowHighlight, handleHighlight, canEdit, onEdit, canDelete, onDelete, onReport, 
    customActions, content
  ]);

  // Render selection toolbar
  const renderSelectionToolbar = useCallback(() => {
    if (!showFormatToolbar || !selectedText) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute z-10 bg-white shadow-lg border rounded-lg p-2 flex items-center gap-1"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleCopy(selectedText)}
          className="h-8 w-8 p-0"
        >
          <Copy className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleShare()}
          className="h-8 w-8 p-0"
        >
          <Share2 className="w-4 h-4" />
        </Button>
        
        {allowHighlight && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleHighlight()}
            className="h-8 w-8 p-0"
          >
            <PaintBucket className="w-4 h-4" />
          </Button>
        )}
        
        {allowTextToSpeech && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleTextToSpeech(selectedText)}
            className="h-8 w-8 p-0"
          >
            <Volume2 className="w-4 h-4" />
          </Button>
        )}
      </motion.div>
    );
  }, [showFormatToolbar, selectedText, handleCopy, handleShare, allowHighlight, handleHighlight, allowTextToSpeech, handleTextToSpeech]);

  // Main render
  return (
    <Card className={cn('relative', className)}>
      {/* Header */}
      {(showTitle && content.title) && (
        <CardHeader className="pb-3">
          <h3 className="text-lg font-semibold leading-tight">
            {content.title}
          </h3>
          {showSummary && content.summary && (
            <p className="text-sm text-gray-600 mt-1">
              {content.summary}
            </p>
          )}
        </CardHeader>
      )}

      <CardContent className="space-y-4">
        {/* Stats */}
        {renderStats()}

        {/* Topics */}
        {renderTopics()}

        {/* Toolbar */}
        {renderToolbar()}

        {/* Content */}
        <div className="relative">
          <div
            ref={textRef}
            className={cn(
              'prose max-w-none transition-all duration-300',
              `text-${fontSize}`,
              fontFamily === 'serif' && 'font-serif',
              fontFamily === 'mono' && 'font-mono',
              lineHeight === 'tight' && 'leading-tight',
              lineHeight === 'relaxed' && 'leading-relaxed',
              lineHeight === 'loose' && 'leading-loose',
              letterSpacing === 'tight' && 'tracking-tight',
              letterSpacing === 'wide' && 'tracking-wide',
              textAlign === 'center' && 'text-center',
              textAlign === 'right' && 'text-right',
              textAlign === 'justify' && 'text-justify',
              theme === 'dark' && 'text-white bg-gray-900',
              theme === 'sepia' && 'text-amber-900 bg-amber-50',
              theme === 'high-contrast' && 'text-black bg-white font-bold',
              dyslexiaMode && 'font-mono tracking-wide leading-relaxed',
              !enableSelection && 'select-none',
              shouldTruncate && 'overflow-hidden',
              shouldTruncate && maxHeight <= 200 && 'max-h-48',
              shouldTruncate && maxHeight > 200 && maxHeight <= 400 && 'max-h-96',
              shouldTruncate && maxHeight > 400 && 'max-h-screen'
            )}
            dangerouslySetInnerHTML={{ __html: formattedContent }}
            onMouseUp={handleSelectionChange}
            onTouchEnd={handleSelectionChange}
            onContextMenu={handleContextMenu}
            onClick={handleMentionClick}
          />

          {/* Expansion toggle */}
          {allowExpansion && content.content.length > expandThreshold && (
            <div className="mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExpand}
                className="text-blue-600 hover:text-blue-800"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    Show more
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Selection toolbar */}
          <AnimatePresence>
            {renderSelectionToolbar()}
          </AnimatePresence>

          {/* Gradient overlay for truncated content */}
          {shouldTruncate && (
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          )}
        </div>

        {/* Analytics panel */}
        {showAnalytics && content.analytics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t pt-4"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium">{content.analytics.views}</div>
                <div className="text-gray-600">Views</div>
              </div>
              <div className="text-center">
                <div className="font-medium">{content.analytics.copies}</div>
                <div className="text-gray-600">Copies</div>
              </div>
              <div className="text-center">
                <div className="font-medium">{content.analytics.shares}</div>
                <div className="text-gray-600">Shares</div>
              </div>
              <div className="text-center">
                <div className="font-medium">{Math.round(content.analytics.engagementScore)}</div>
                <div className="text-gray-600">Engagement</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Translation notice */}
        {translatedContent && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-sm text-blue-800">
              Translated to {targetLanguage.toUpperCase()}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTranslatedContent(null);
                setTargetLanguage('');
              }}
              className="h-6 text-blue-600 hover:text-blue-800"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Original
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewText;
