'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Search, 
  BookOpen, 
  Type, 
  Eye,
  Maximize2, 
  Minimize2,
  Download,
  Share2,
  ZoomIn,
  ZoomOut,
  Settings,
  X,
  Hash,
  Clock,
  FileText,
  List
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

// Types
export interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
  anchor: string;
  children?: TableOfContentsItem[];
}

export interface ContentHighlight {
  start: number;
  end: number;
  text: string;
  type: 'search' | 'selection' | 'annotation';
  id: string;
}

export interface ReadingProgress {
  percentage: number;
  currentSection?: string;
  estimatedTimeRemaining?: number;
  wordsRead?: number;
}

export interface BlogContentProps {
  content: string;
  className?: string;
  truncate?: number;
  showReadMore?: boolean;
  showTableOfContents?: boolean;
  showWordCount?: boolean;
  showReadingTime?: boolean;
  showCharacterCount?: boolean;
  showCopyButton?: boolean;
  showSearchHighlight?: boolean;
  showPrintButton?: boolean;
  showDownloadButton?: boolean;
  showShareButton?: boolean;
  enableFullscreen?: boolean;
  enableZoom?: boolean;
  enableAnnotations?: boolean;
  enableHighlighting?: boolean;
  enableReadingProgress?: boolean;
  variant?: 'default' | 'prose' | 'minimal' | 'reader' | 'article' | 'documentation' | 'interactive';
  fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  lineHeight?: 'tight' | 'normal' | 'relaxed' | 'loose';
  fontFamily?: 'sans' | 'serif' | 'mono';
  theme?: 'light' | 'dark' | 'auto' | 'sepia' | 'high-contrast';
  onHeadingClick?: (heading: TableOfContentsItem) => void;
  onSearchMatch?: (matches: number) => void;
  onReadingProgress?: (progress: ReadingProgress) => void;
  onShare?: (content: string) => void;
  readingProgress?: number;
  showProgress?: boolean;
  enableReadingMode?: boolean;
  enableFocusMode?: boolean;
  enableDyslexiaMode?: boolean;
  customCSS?: string;
  language?: string;
  autoSave?: boolean;
  spellCheck?: boolean;
  wordWrap?: boolean;
  showLineNumbers?: boolean;
}

export const BlogContent: React.FC<BlogContentProps> = ({
  content,
  className,
  truncate,
  showReadMore = false,
  showTableOfContents = false,
  showCopyButton = false,
  showSearchHighlight = false,
  showPrintButton = false,
  showDownloadButton = false,
  showShareButton = false,
  enableFullscreen = false,
  enableZoom = false,
  enableReadingProgress = false,
  variant = 'default',
  fontSize = 'base',
  lineHeight = 'normal',
  fontFamily = 'sans',
  theme = 'auto',
  onHeadingClick,
  onSearchMatch,
  onReadingProgress,
  onShare,
  showProgress = false,
  enableReadingMode = false,
  enableFocusMode = false,
  enableDyslexiaMode = false
}) => {
  // Enhanced state management
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isReadingMode, setIsReadingMode] = useState(enableReadingMode);
  const [isFocusMode, setIsFocusMode] = useState(enableFocusMode);
  const [isDyslexiaMode, setIsDyslexiaMode] = useState(enableDyslexiaMode);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ContentHighlight[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [highlightedContent, setHighlightedContent] = useState(content);
  const [copiedContent, setCopiedContent] = useState(false);
  const [tableOfContents, setTableOfContents] = useState<TableOfContentsItem[]>([]);
  const [activeHeading, setActiveHeading] = useState<string>('');
  const [showTOC, setShowTOC] = useState(false);
  const [currentFontSize, setCurrentFontSize] = useState(fontSize);
  const [currentLineHeight, setCurrentLineHeight] = useState(lineHeight);
  const [currentFontFamily, setCurrentFontFamily] = useState(fontFamily);
  const [currentTheme, setCurrentTheme] = useState(theme);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentProgress, setCurrentProgress] = useState<ReadingProgress>({ percentage: 0 });
  const [showSettings, setShowSettings] = useState(false);

  // Enhanced refs
  const contentRef = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Enhanced content statistics
  const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
  const characterCount = content.length;
  const paragraphCount = content.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
  const sentenceCount = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed: 200 words per minute
  const speakingTime = Math.ceil(wordCount / 130); // Average speaking speed: 130 words per minute

  // Enhanced table of contents generation
  useEffect(() => {
    if (showTableOfContents && content) {
      const headingRegex = /<h([1-6])[^>]*(?:id="([^"]*)")?[^>]*>([^<]*)<\/h[1-6]>/gi;
      const toc: TableOfContentsItem[] = [];
      let match;
      let headingIndex = 0;

      while ((match = headingRegex.exec(content)) !== null) {
        const level = parseInt(match[1]);
        const id = match[2] || `heading-${headingIndex}`;
        const title = match[3].trim();
        const anchor = id || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        toc.push({
          id,
          title,
          level,
          anchor
        });
        headingIndex++;
      }

      // Build hierarchical structure
      const buildHierarchy = (items: TableOfContentsItem[]): TableOfContentsItem[] => {
        const result: TableOfContentsItem[] = [];
        const stack: TableOfContentsItem[] = [];

        items.forEach(item => {
          while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
            stack.pop();
          }

          if (stack.length === 0) {
            result.push(item);
          } else {
            const parent = stack[stack.length - 1];
            if (!parent.children) parent.children = [];
            parent.children.push(item);
          }

          stack.push(item);
        });

        return result;
      };

      setTableOfContents(buildHierarchy(toc));
    }
  }, [content, showTableOfContents]);

  // Enhanced search highlighting
  useEffect(() => {
    if (searchTerm && showSearchHighlight) {
      const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const matches: ContentHighlight[] = [];
      let match;
      let index = 0;

      while ((match = regex.exec(content)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[0],
          type: 'search',
          id: `search-${index++}`
        });
      }

      setSearchResults(matches);
      setCurrentSearchIndex(0);
      
      if (onSearchMatch) {
        onSearchMatch(matches.length);
      }

      // Highlight content with enhanced styling
      let highlightedText = content;
      matches.reverse().forEach((highlight, index) => {
        const beforeText = highlightedText.slice(0, highlight.start);
        const matchText = highlightedText.slice(highlight.start, highlight.end);
        const afterText = highlightedText.slice(highlight.end);
        
        highlightedText = beforeText + 
          `<mark class="search-highlight ${index === currentSearchIndex ? 'active' : ''}" data-highlight-id="${highlight.id}">${matchText}</mark>` + 
          afterText;
      });

      setHighlightedContent(highlightedText);
    } else {
      setHighlightedContent(content);
      setSearchResults([]);
    }
  }, [searchTerm, content, showSearchHighlight, currentSearchIndex, onSearchMatch]);

  // Enhanced reading progress tracking
  useEffect(() => {
    if (!enableReadingProgress || !contentRef.current) return;

    const updateProgress = () => {
      const element = contentRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const documentHeight = element.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      const progress = Math.min(100, Math.max(0, 
        ((scrollTop + windowHeight - rect.top) / documentHeight) * 100
      ));

      const currentSection = getCurrentSection();
      const wordsRead = Math.floor((progress / 100) * wordCount);
      const estimatedTimeRemaining = Math.ceil(((100 - progress) / 100) * readingTime);

      const progressData: ReadingProgress = {
        percentage: progress,
        currentSection,
        estimatedTimeRemaining,
        wordsRead
      };

      setCurrentProgress(progressData);
      
      if (onReadingProgress) {
        onReadingProgress(progressData);
      }
    };

    const getCurrentSection = (): string | undefined => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      for (let i = headings.length - 1; i >= 0; i--) {
        const heading = headings[i];
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 100) {
          return heading.textContent || undefined;
        }
      }
      return undefined;
    };

    const throttledUpdate = throttle(updateProgress, 100);
    window.addEventListener('scroll', throttledUpdate);
    window.addEventListener('resize', throttledUpdate);
    
    updateProgress();

    return () => {
      window.removeEventListener('scroll', throttledUpdate);
      window.removeEventListener('resize', throttledUpdate);
    };
  }, [enableReadingProgress, content, wordCount, readingTime, onReadingProgress]);



  // Utility functions
  const throttle = (func: (...args: unknown[]) => void, limit: number) => {
    let inThrottle: boolean;
    return function(this: unknown, ...args: unknown[]) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  // Enhanced event handlers
  const handleCopyContent = useCallback(async () => {
    try {
      const textContent = content.replace(/<[^>]*>/g, '');
      await navigator.clipboard.writeText(textContent);
      setCopiedContent(true);
      toast.success('Content copied to clipboard');
      setTimeout(() => setCopiedContent(false), 2000);
    } catch (error) {
      console.error('Failed to copy content:', error);
      toast.error('Failed to copy content');
    }
  }, [content]);

  const handleDownloadContent = useCallback(() => {
    const textContent = content.replace(/<[^>]*>/g, '');
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blog-content.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Content downloaded');
  }, [content]);

  const handlePrintContent = useCallback(() => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Blog Content</title>
            <style>
              body { font-family: ${currentFontFamily}; font-size: ${currentFontSize}; line-height: ${currentLineHeight}; }
              .print-content { max-width: 100%; }
              @media print { 
                body { margin: 0; padding: 20px; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="print-content">${content}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }, [content, currentFontFamily, currentFontSize, currentLineHeight]);

  const handleShareContent = useCallback(() => {
    if (onShare) {
      onShare(content);
    } else if (navigator.share) {
      navigator.share({
        title: 'Blog Content',
        text: content.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
        url: window.location.href
      }).then(() => {
        toast.success('Content shared successfully');
      }).catch(() => {
        toast.error('Failed to share content');
      });
    } else {
      handleCopyContent();
    }
  }, [content, onShare, handleCopyContent]);

  const handleHeadingClick = useCallback((heading: TableOfContentsItem) => {
    const element = document.getElementById(heading.anchor);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveHeading(heading.id);
    }
    if (onHeadingClick) {
      onHeadingClick(heading);
    }
  }, [onHeadingClick]);

  const handleSearchNavigation = useCallback((direction: 'next' | 'prev') => {
    if (searchResults.length === 0) return;

    let newIndex = currentSearchIndex;
    if (direction === 'next') {
      newIndex = (currentSearchIndex + 1) % searchResults.length;
    } else {
      newIndex = currentSearchIndex === 0 ? searchResults.length - 1 : currentSearchIndex - 1;
    }

    setCurrentSearchIndex(newIndex);

    const highlight = document.querySelector(`[data-highlight-id="${searchResults[newIndex].id}"]`);
    if (highlight) {
      highlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [searchResults, currentSearchIndex]);

  const handleZoom = useCallback((delta: number) => {
    if (!enableZoom) return;
    const newZoom = Math.max(50, Math.min(200, zoomLevel + delta));
    setZoomLevel(newZoom);
  }, [enableZoom, zoomLevel]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen && fullscreenRef.current) {
      fullscreenRef.current.requestFullscreen?.();
    } else if (document.fullscreenElement) {
      document.exitFullscreen?.();
    }
  }, [isFullscreen]);

  const getDisplayContent = useCallback(() => {
    if (!truncate || isExpanded) {
      return highlightedContent;
    }
    
    const words = highlightedContent.split(' ');
    if (words.length <= truncate) {
      return highlightedContent;
    }
    
    return words.slice(0, truncate).join(' ') + '...';
  }, [highlightedContent, truncate, isExpanded]);

  // Enhanced table of contents renderer
  const renderTableOfContents = (items: TableOfContentsItem[], level = 0) => (
    <ul className={cn('space-y-1', level > 0 && 'ml-4 mt-2')}>
      {items.map((item) => (
        <li key={item.id}>
          <button
            onClick={() => handleHeadingClick(item)}
            className={cn(
              'text-left w-full text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors',
              `ml-${item.level * 2}`,
              activeHeading === item.id && 'text-blue-600 dark:text-blue-400 font-medium'
            )}
          >
            {item.title}
          </button>
          {item.children && item.children.length > 0 && renderTableOfContents(item.children, level + 1)}
        </li>
      ))}
    </ul>
  );

  // Enhanced content classes
  const getContentClasses = () => {
    const classes = [];
    
    classes.push('blog-content-inner');
    
    switch (variant) {
      case 'prose':
        classes.push('prose dark:prose-invert max-w-none');
        break;
      case 'minimal':
        classes.push('prose prose-sm dark:prose-invert');
        break;
      case 'reader':
        classes.push('prose prose-lg dark:prose-invert max-w-3xl mx-auto');
        break;
      case 'article':
        classes.push('prose prose-xl dark:prose-invert');
        break;
      case 'documentation':
        classes.push('prose prose-slate dark:prose-invert max-w-none');
        break;
      case 'interactive':
        classes.push('prose dark:prose-invert max-w-none interactive-content');
        break;
      default:
        classes.push('prose dark:prose-invert max-w-none');
    }

    classes.push(`prose-${currentFontSize}`);
    classes.push(`leading-${currentLineHeight}`);

    switch (currentFontFamily) {
      case 'serif':
        classes.push('font-serif');
        break;
      case 'mono':
        classes.push('font-mono');
        break;
      default:
        classes.push('font-sans');
    }

    switch (currentTheme) {
      case 'sepia':
        classes.push('sepia-theme');
        break;
      case 'high-contrast':
        classes.push('high-contrast-theme');
        break;
    }

    if (isReadingMode) classes.push('reading-mode');
    if (isFocusMode) classes.push('focus-mode');
    if (isDyslexiaMode) classes.push('dyslexia-mode');

    return classes.join(' ');
  };

  return (
    <div 
      ref={fullscreenRef}
      className={cn(
        'blog-content relative',
        isFullscreen && 'fixed inset-0 z-50 bg-white dark:bg-gray-900 p-8 overflow-auto',
        enableZoom && `zoom-${Math.round(zoomLevel)}`,
        className
      )}
    >
      {/* Enhanced Reading Progress Bar */}
      {showProgress && enableReadingProgress && (
        <div className="fixed top-0 left-0 right-0 z-40 h-1 bg-gray-200 dark:bg-gray-700">
          <AnimatePresence>
            <motion.div
              className="h-full bg-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${currentProgress.percentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </AnimatePresence>
        </div>
      )}

      {/* Enhanced Controls Bar */}
      {(showCopyButton || showSearchHighlight || enableFullscreen || showPrintButton || showDownloadButton || showShareButton || enableZoom) && (
        <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
          <div className="flex items-center space-x-3">
            {/* Enhanced Search */}
            {showSearchHighlight && (
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-gray-500" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search in content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8 w-48 text-sm"
                />
                {searchResults.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <Badge variant="outline" className="text-xs">
                      {currentSearchIndex + 1} / {searchResults.length}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSearchNavigation('prev')}
                      className="h-6 w-6 p-0"
                      title="Previous match"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSearchNavigation('next')}
                      className="h-6 w-6 p-0"
                      title="Next match"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Table of Contents Toggle */}
            {showTableOfContents && tableOfContents.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTOC(!showTOC)}
                className={cn('h-8', showTOC && 'bg-blue-100 dark:bg-blue-900')}
                title="Table of Contents"
              >
                <List className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Enhanced Zoom Controls */}
            {enableZoom && (
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleZoom(-10)}
                  className="h-8 w-8 p-0"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                
                <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[3rem] text-center">
                  {zoomLevel}%
                </span>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleZoom(10)}
                  className="h-8 w-8 p-0"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Enhanced Action Buttons */}
            {showCopyButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyContent}
                className="h-8"
                title="Copy Content"
              >
                {copiedContent ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            )}

            {showPrintButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrintContent}
                className="h-8"
                title="Print Content"
              >
                <FileText className="w-4 h-4" />
              </Button>
            )}

            {showDownloadButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownloadContent}
                className="h-8"
                title="Download Content"
              >
                <Download className="w-4 h-4" />
              </Button>
            )}

            {showShareButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShareContent}
                className="h-8"
                title="Share Content"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            )}

            {/* Settings Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className={cn('h-8', showSettings && 'bg-gray-200 dark:bg-gray-700')}
              title="Content Settings"
            >
              <Settings className="w-4 h-4" />
            </Button>

            {/* Enhanced Fullscreen */}
            {enableFullscreen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="h-8"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-white dark:bg-gray-800 border rounded-lg shadow-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Typography Settings */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium flex items-center">
                  <Type className="w-4 h-4 mr-2" />
                  Typography
                </h4>
                
                <div className="space-y-2">
                  <label className="text-xs text-gray-600 dark:text-gray-400">Font Size</label>
                  <select 
                    value={currentFontSize} 
                    onChange={(e) => setCurrentFontSize(e.target.value as 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl')}
                    className="w-full h-8 px-2 text-sm border rounded"
                    aria-label="Font Size"
                    title="Select font size"
                  >
                    <option value="xs">Extra Small</option>
                    <option value="sm">Small</option>
                    <option value="base">Base</option>
                    <option value="lg">Large</option>
                    <option value="xl">Extra Large</option>
                    <option value="2xl">2X Large</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-gray-600 dark:text-gray-400">Line Height</label>
                  <select 
                    value={currentLineHeight} 
                    onChange={(e) => setCurrentLineHeight(e.target.value as 'tight' | 'normal' | 'relaxed' | 'loose')}
                    className="w-full h-8 px-2 text-sm border rounded"
                    aria-label="Line Height"
                    title="Select line height"
                  >
                    <option value="tight">Tight</option>
                    <option value="normal">Normal</option>
                    <option value="relaxed">Relaxed</option>
                    <option value="loose">Loose</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-gray-600 dark:text-gray-400">Font Family</label>
                  <select 
                    value={currentFontFamily} 
                    onChange={(e) => setCurrentFontFamily(e.target.value as 'sans' | 'serif' | 'mono')}
                    className="w-full h-8 px-2 text-sm border rounded"
                    aria-label="Font Family"
                    title="Select font family"
                  >
                    <option value="sans">Sans Serif</option>
                    <option value="serif">Serif</option>
                    <option value="mono">Monospace</option>
                  </select>
                </div>
              </div>

              {/* Display Settings */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  Display
                </h4>
                
                <div className="space-y-2">
                  <label className="text-xs text-gray-600 dark:text-gray-400">Theme</label>
                  <select 
                    value={currentTheme} 
                    onChange={(e) => setCurrentTheme(e.target.value as 'light' | 'dark' | 'auto' | 'sepia' | 'high-contrast')}
                    className="w-full h-8 px-2 text-sm border rounded"
                    aria-label="Theme"
                    title="Select theme"
                  >
                    <option value="auto">Auto</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="sepia">Sepia</option>
                    <option value="high-contrast">High Contrast</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-600 dark:text-gray-400">Reading Mode</label>
                  <input 
                    type="checkbox" 
                    checked={isReadingMode} 
                    onChange={(e) => setIsReadingMode(e.target.checked)}
                    className="rounded"
                    aria-label="Enable reading mode"
                    title="Toggle reading mode"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-600 dark:text-gray-400">Focus Mode</label>
                  <input 
                    type="checkbox" 
                    checked={isFocusMode} 
                    onChange={(e) => setIsFocusMode(e.target.checked)}
                    className="rounded"
                    aria-label="Enable focus mode"
                    title="Toggle focus mode"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-600 dark:text-gray-400">Dyslexia Mode</label>
                  <input 
                    type="checkbox" 
                    checked={isDyslexiaMode} 
                    onChange={(e) => setIsDyslexiaMode(e.target.checked)}
                    className="rounded"
                    aria-label="Enable dyslexia mode"
                    title="Toggle dyslexia-friendly mode"
                  />
                </div>
              </div>

              {/* Enhanced Statistics */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium flex items-center">
                  <Hash className="w-4 h-4 mr-2" />
                  Statistics
                </h4>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">Words</div>
                    <div className="font-medium">{wordCount.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">Characters</div>
                    <div className="font-medium">{characterCount.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">Paragraphs</div>
                    <div className="font-medium">{paragraphCount}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">Sentences</div>
                    <div className="font-medium">{sentenceCount}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">Read Time</div>
                    <div className="font-medium">{readingTime}m</div>
                  </div>
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">Speak Time</div>
                    <div className="font-medium">{speakingTime}m</div>
                  </div>
                </div>

                {enableReadingProgress && (
                  <div className="space-y-2">
                    <div className="text-xs text-gray-600 dark:text-gray-400">Progress</div>
                    <div className="text-sm font-medium">{Math.round(currentProgress.percentage)}%</div>
                    {currentProgress.estimatedTimeRemaining && (
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {currentProgress.estimatedTimeRemaining}m remaining
                      </div>
                    )}
                    {currentProgress.currentSection && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        Current: {currentProgress.currentSection}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-6">
        {/* Enhanced Table of Contents Sidebar */}
        <AnimatePresence>
          {showTOC && showTableOfContents && tableOfContents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-64 flex-shrink-0"
            >
              <div className="sticky top-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium">Table of Contents</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTOC(false)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  {renderTableOfContents(tableOfContents)}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Main Content */}
        <div className="flex-1 min-w-0">
          <div
            ref={contentRef}
            className={cn(getContentClasses())}
            dangerouslySetInnerHTML={{ __html: getDisplayContent() }}
          />

          {/* Enhanced Read More Button */}
          {truncate && !isExpanded && content.split(' ').length > truncate && showReadMore && (
            <div className="mt-6">
              <Button
                variant="ghost"
                onClick={() => setIsExpanded(true)}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Read More <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

// Content Statistics Component
export interface BlogContentStatsProps {
  content: string;
  className?: string;
  showWordCount?: boolean;
  showCharacterCount?: boolean;
  showReadingTime?: boolean;
  showParagraphCount?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

export const BlogContentStats: React.FC<BlogContentStatsProps> = ({
  content,
  className,
  showWordCount = true,
  showCharacterCount = false,
  showReadingTime = true,
  showParagraphCount = false,
  variant = 'default'
}) => {
  const wordCount = content.trim().split(/\s+/).length;
  const characterCount = content.length;
  const paragraphCount = content.split(/\n\n/).length;
  const readingTime = Math.ceil(wordCount / 200);

  const stats = [
    showWordCount && { label: 'Words', value: wordCount.toLocaleString(), icon: Type },
    showCharacterCount && { label: 'Characters', value: characterCount.toLocaleString(), icon: Type },
    showReadingTime && { label: 'Reading Time', value: `${readingTime} min`, icon: BookOpen },
    showParagraphCount && { label: 'Paragraphs', value: paragraphCount.toString(), icon: Type }
  ].filter(Boolean) as Array<{ label: string; value: string; icon: typeof Type }>;

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center space-x-3', className)}>
        {stats.map((stat, index) => (
          <Badge key={index} variant="outline" className="text-xs">
            {stat.value} {stat.label.toLowerCase()}
          </Badge>
        ))}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={cn('grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg', className)}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {stat.value}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center space-x-4', className)}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="flex items-center space-x-2">
            <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span>{stat.value} {stat.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default BlogContent;