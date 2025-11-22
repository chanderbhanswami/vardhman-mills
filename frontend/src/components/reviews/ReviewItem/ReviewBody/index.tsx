'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Maximize2, 
  Minimize2, 
  Layout, 
  Grid, 
  List, 
  Image, 
  Type, 
  MoreHorizontal,
  Share2,
  Bookmark,
  RefreshCw,
  Monitor,
  Moon,
  Sun,
  RotateCcw,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { Switch } from '@/components/ui/Switch';
import { Separator } from '@/components/ui/Separator';

import { useToastHelpers } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '@/hooks/localStorage/useLocalStorage';
import { useMediaQuery } from '@/hooks/common/useMediaQuery';
import MediaCarousel, { MediaItem } from './MediaCarousel';
import ReviewText, { ReviewTextContent } from './ReviewText';

// Types
export interface ReviewBodyContent {
  id: string;
  type: 'text' | 'media' | 'mixed';
  priority: 'high' | 'medium' | 'low';
  
  // Text content
  text?: ReviewTextContent;
  
  // Media content
  media?: {
    items: MediaItem[];
    layout: 'carousel' | 'grid' | 'masonry' | 'timeline';
    aspectRatio?: '1:1' | '4:3' | '16:9' | 'auto';
    maxItems?: number;
    showThumbnails?: boolean;
    autoPlay?: boolean;
    enableFullscreen?: boolean;
  };
  
  // Layout and presentation
  layout?: {
    direction: 'vertical' | 'horizontal' | 'stacked';
    mediaPosition: 'top' | 'bottom' | 'left' | 'right' | 'background';
    spacing: 'tight' | 'normal' | 'loose';
    alignment: 'start' | 'center' | 'end' | 'stretch';
    responsiveBreakpoints?: {
      mobile: 'stack' | 'side-by-side';
      tablet: 'stack' | 'side-by-side';
      desktop: 'stack' | 'side-by-side';
    };
  };
  
  // Interaction settings
  interactions?: {
    enableTextSelection?: boolean;
    enableMediaInteraction?: boolean;
    enableContextMenu?: boolean;
    enableKeyboardNavigation?: boolean;
    enableTouchGestures?: boolean;
    enableVoiceControl?: boolean;
  };
  
  // Display preferences
  preferences?: {
    theme: 'light' | 'dark' | 'auto' | 'sepia' | 'high-contrast';
    density: 'compact' | 'comfortable' | 'spacious';
    animations: 'none' | 'reduced' | 'full';
    fontSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
    contrast: 'low' | 'normal' | 'high';
    reduceMotion?: boolean;
    highContrast?: boolean;
    largeText?: boolean;
    screenReader?: boolean;
  };
  
  // Content metadata
  metadata?: {
    createdAt: string;
    updatedAt?: string;
    version: number;
    wordCount?: number;
    mediaCount?: number;
    estimatedReadTime?: number;
    contentRating?: 'g' | 'pg' | 'pg13' | 'r';
    language?: string;
    tags?: string[];
    categories?: string[];
    sentiment?: 'positive' | 'negative' | 'neutral';
    complexity?: 'simple' | 'moderate' | 'complex';
  };
  
  // Analytics and engagement
  analytics?: {
    views: number;
    timeSpent: number;
    scrollDepth: number;
    mediaViews: number;
    textCompletionRate: number;
    interactionRate: number;
    shareCount: number;
    bookmarkCount: number;
    engagementScore: number;
    bounceRate: number;
    returnVisitorRate: number;
  };
  
  // Accessibility features
  accessibility?: {
    altText?: string;
    audioDescription?: string;
    transcripts?: Array<{
      mediaId: string;
      transcript: string;
      language: string;
    }>;
    captions?: Array<{
      mediaId: string;
      captions: string;
      language: string;
    }>;
    keyboardShortcuts?: Array<{
      key: string;
      action: string;
      description: string;
    }>;
    screenReaderInstructions?: string;
  };
}

export interface ReviewBodyProps {
  content: ReviewBodyContent;
  className?: string;
  
  // Layout control
  forceLayout?: 'vertical' | 'horizontal' | 'stacked';
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: string;
  
  // Feature toggles
  showMedia?: boolean;
  showText?: boolean;
  showMetadata?: boolean;
  showAnalytics?: boolean;
  enableFullscreen?: boolean;
  enablePictureInPicture?: boolean;
  enableVirtualScrolling?: boolean;
  enableLazyLoading?: boolean;
  
  // Interaction controls
  allowTextSelection?: boolean;
  allowMediaDownload?: boolean;
  allowContentSharing?: boolean;
  allowBookmarking?: boolean;
  allowPrinting?: boolean;
  allowZoom?: boolean;
  allowRotation?: boolean;
  allowCropping?: boolean;
  
  // Customization
  customTheme?: Record<string, string>;
  customLayout?: React.ComponentType<{ children: React.ReactNode }>;
  customControls?: Array<{
    id: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    action: () => void;
  }>;
  
  // Event handlers
  onContentLoad?: (content: ReviewBodyContent) => void;
  onContentError?: (error: string) => void;
  onLayoutChange?: (layout: string) => void;
  onThemeChange?: (theme: string) => void;
  onInteraction?: (type: string, data?: unknown) => void;
  onAnalyticsEvent?: (event: string, data?: unknown) => void;
  onAccessibilityToggle?: (feature: string, enabled: boolean) => void;
  
  // Media event handlers
  onMediaPlay?: (mediaId: string) => void;
  onMediaPause?: (mediaId: string) => void;
  onMediaEnd?: (mediaId: string) => void;
  onMediaError?: (mediaId: string, error: string) => void;
  onMediaInteraction?: (mediaId: string, action: string) => void;
  
  // Text event handlers
  onTextSelect?: (selection: string) => void;
  onTextHighlight?: (text: string, position: { start: number; end: number }) => void;
  onTextCopy?: (text: string) => void;
  onTextShare?: (text: string, method?: string) => void;
  onTextTranslate?: (text: string, targetLanguage: string) => void;
  
  // Navigation handlers
  onNavigate?: (direction: 'prev' | 'next' | 'up' | 'down') => void;
  onZoom?: (level: number) => void;
  onRotate?: (degrees: number) => void;
  onMove?: (x: number, y: number) => void;
  
  // Permissions
  userId?: string;
  isOwner?: boolean;
  isAdmin?: boolean;
  isModerator?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canModerate?: boolean;
  canDownload?: boolean;
  canShare?: boolean;
}

const ReviewBody: React.FC<ReviewBodyProps> = ({
  content,
  className,
  forceLayout,
  maxWidth,
  maxHeight,
  aspectRatio,
  showMedia = true,
  showText = true,
  showMetadata = false,
  showAnalytics = false,
  enableFullscreen = true,
  enablePictureInPicture = false,
  // Unused props for future features
  // enableVirtualScrolling = false, // Future feature
  // enableLazyLoading = true, // Future feature
  allowTextSelection = true,
  allowMediaDownload = true,
  allowContentSharing = true,
  allowBookmarking = true,
  // allowPrinting = false, // Future feature
  allowZoom = true,
  allowRotation = false,
  // allowCropping = false, // Future feature
  customTheme,
  customLayout: CustomLayout,
  customControls = [],
  onContentLoad,
  // onContentError, // Future use
  onLayoutChange,
  onThemeChange,
  // onInteraction, // Future use
  onAnalyticsEvent,
  onAccessibilityToggle,
  // Media event handlers (for future use)
  // onMediaPlay,
  // onMediaPause,
  // onMediaEnd,
  // onMediaError,
  // onMediaInteraction,
  // onTextSelect, // Future use
  onTextHighlight,
  onTextCopy,
  onTextShare,
  onTextTranslate,
  onNavigate,
  onZoom,
  onRotate,
  onMove,
  userId,
  isOwner = false,
  isAdmin = false,
  isModerator = false,
  canEdit = false,
  canDelete = false,
  // canModerate = false, // Future use
  canDownload = true,
  canShare = true
}) => {
  // State
  const [currentLayout, setCurrentLayout] = useState(
    forceLayout || content.layout?.direction || 'vertical'
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPictureInPicture, setIsPictureInPicture] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showControls, setShowControls] = useState(true);
  const [activeSection, setActiveSection] = useState<'media' | 'text' | 'both'>('both');
  const [viewMode] = useState<'normal' | 'focus' | 'minimal'>('normal');
  const [,] = useState<'playing' | 'paused' | 'stopped'>('stopped');
  const [currentTheme, setCurrentTheme] = useState(
    content.preferences?.theme || 'light'
  );
  const [density, setDensity] = useState(
    content.preferences?.density || 'comfortable'
  );
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);
  const [accessibilityFeatures, setAccessibilityFeatures] = useState({
    reduceMotion: false,
    highContrast: false,
    largeText: false,
    screenReader: false,
    audioDescription: false,
    captions: false
  });

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  // Hooks
  const isMobile = useMediaQuery('(max-width: 768px)');
  useMediaQuery('(max-width: 1024px)'); // isTablet unused
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const prefersHighContrast = useMediaQuery('(prefers-contrast: high)');
  const { success, error } = useToastHelpers();

  type ReviewBodyPreferences = {
    layout: typeof currentLayout;
    theme: typeof currentTheme;
    density: typeof density;
    zoomLevel: number;
    showControls: boolean;
    accessibilityFeatures: typeof accessibilityFeatures;
  };

  const { setValue: setPreferences } = useLocalStorage<ReviewBodyPreferences>('review-body-prefs', {
    defaultValue: {
      layout: currentLayout,
      theme: currentTheme,
      density,
      zoomLevel: 1,
      showControls: true,
      accessibilityFeatures
    }
  });

  // Computed values
  const hasMedia = useMemo(() => {
    return showMedia && content.media && content.media.items.length > 0;
  }, [showMedia, content.media]);

  const hasText = useMemo(() => {
    return showText && content.text && content.text.content;
  }, [showText, content.text]);

  const effectiveLayout = useMemo(() => {
    if (forceLayout) return forceLayout;
    if (isMobile) return 'vertical';
    if (currentLayout === 'horizontal' && (!hasMedia || !hasText)) return 'vertical';
    return currentLayout;
  }, [forceLayout, isMobile, currentLayout, hasMedia, hasText]);

  const containerStyles = useMemo(() => {
    const styles: React.CSSProperties = {
      transform: `scale(${zoomLevel}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
      ...(maxWidth && { maxWidth: `${maxWidth}px` }),
      ...(maxHeight && { maxHeight: `${maxHeight}px` }),
      ...(aspectRatio && { aspectRatio }),
      ...customTheme
    };
    return styles;
  }, [zoomLevel, rotation, position, maxWidth, maxHeight, aspectRatio, customTheme]);

  const animationSettings = useMemo(() => {
    const motionLevel = content.preferences?.animations || 'full';
    const shouldReduce = prefersReducedMotion || accessibilityFeatures.reduceMotion;
    
    if (shouldReduce || motionLevel === 'none') {
      return { duration: 0, ease: [0.4, 0.0, 0.2, 1] as const };
    } else if (motionLevel === 'reduced') {
      return { duration: 0.2, ease: [0.4, 0.0, 0.2, 1] as const };
    } else {
      return { duration: 0.4, ease: [0.4, 0.0, 0.2, 1] as const };
    }
  }, [content.preferences?.animations, prefersReducedMotion, accessibilityFeatures.reduceMotion]);

  // Effects
  useEffect(() => {
    onContentLoad?.(content);
    onAnalyticsEvent?.('content_load', { 
      contentId: content.id, 
      type: content.type,
      hasMedia,
      hasText
    });
  }, [content, hasMedia, hasText, onContentLoad, onAnalyticsEvent]);

  useEffect(() => {
    // Update accessibility features based on system preferences
    setAccessibilityFeatures(prev => ({
      ...prev,
      reduceMotion: prefersReducedMotion,
      highContrast: prefersHighContrast
    }));
  }, [prefersReducedMotion, prefersHighContrast]);

  // Handlers
  const handleLayoutChange = useCallback((newLayout: string) => {
    const validLayout = newLayout as 'vertical' | 'horizontal' | 'stacked';
    setCurrentLayout(validLayout);
    setPreferences((prev: ReviewBodyPreferences) => ({ ...prev, layout: validLayout }));
    onLayoutChange?.(newLayout);
    onAnalyticsEvent?.('layout_change', { from: currentLayout, to: newLayout });
  }, [currentLayout, setPreferences, onLayoutChange, onAnalyticsEvent]);

  const handleThemeChange = useCallback((newTheme: string) => {
    const validTheme = newTheme as 'auto' | 'light' | 'dark' | 'sepia' | 'high-contrast';
    setCurrentTheme(validTheme);
    setPreferences((prev: ReviewBodyPreferences) => ({ ...prev, theme: validTheme }));
    onThemeChange?.(newTheme);
    onAnalyticsEvent?.('theme_change', { from: currentTheme, to: newTheme });
  }, [currentTheme, setPreferences, onThemeChange, onAnalyticsEvent]);

  const toggleFullscreen = useCallback(() => {
    if (!enableFullscreen) return;

    setIsFullscreen(prev => {
      const newState = !prev;
      
      if (newState) {
        containerRef.current?.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
      
      onAnalyticsEvent?.('fullscreen_toggle', { enabled: newState });
      return newState;
    });
  }, [enableFullscreen, onAnalyticsEvent]);

  const handleZoom = useCallback((level: number) => {
    if (!allowZoom) return;

    setZoomLevel(level);
    setPreferences((prev: ReviewBodyPreferences) => ({ ...prev, zoomLevel: level }));
    onZoom?.(level);
    onAnalyticsEvent?.('zoom', { level });
  }, [allowZoom, setPreferences, onZoom, onAnalyticsEvent]);

  const handleRotate = useCallback((degrees: number) => {
    if (!allowRotation) return;

    const normalizedDegrees = degrees % 360;
    setRotation(normalizedDegrees);
    onRotate?.(normalizedDegrees);
    onAnalyticsEvent?.('rotate', { degrees: normalizedDegrees });
  }, [allowRotation, onRotate, onAnalyticsEvent]);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (!content.interactions?.enableKeyboardNavigation) return;

      switch (e.key) {
        case 'ArrowLeft':
          if (e.ctrlKey || e.metaKey) {
            onNavigate?.('prev');
          }
          break;
        case 'ArrowRight':
          if (e.ctrlKey || e.metaKey) {
            onNavigate?.('next');
          }
          break;
        case 'ArrowUp':
          if (e.ctrlKey || e.metaKey) {
            onNavigate?.('up');
          }
          break;
        case 'ArrowDown':
          if (e.ctrlKey || e.metaKey) {
            onNavigate?.('down');
          }
          break;
        case 'f':
        case 'F':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
        case '=':
        case '+':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleZoom(Math.min(zoomLevel + 0.1, 3));
          }
          break;
        case '-':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleZoom(Math.max(zoomLevel - 0.1, 0.5));
          }
          break;
        case '0':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleZoom(1);
          }
          break;
        case 'r':
        case 'R':
          if (e.ctrlKey || e.metaKey && allowRotation) {
            e.preventDefault();
            handleRotate(rotation + 90);
          }
          break;
        case 'Escape':
          if (isFullscreen) {
            toggleFullscreen();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [
    content.interactions?.enableKeyboardNavigation,
    zoomLevel,
    rotation,
    isFullscreen,
    allowRotation,
    allowZoom,
    enableFullscreen,
    onNavigate,
    handleRotate,
    handleZoom,
    toggleFullscreen
  ]);

  useEffect(() => {
    // Update accessibility features based on system preferences
    setAccessibilityFeatures(prev => ({
      ...prev,
      reduceMotion: prefersReducedMotion,
      highContrast: prefersHighContrast
    }));
  }, [prefersReducedMotion, prefersHighContrast]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const togglePictureInPicture = useCallback(async () => {
    if (!enablePictureInPicture) return;

    try {
      if (isPictureInPicture) {
        await document.exitPictureInPicture();
        setIsPictureInPicture(false);
      } else {
        const videoElement = mediaRef.current?.querySelector('video');
        if (videoElement) {
          await videoElement.requestPictureInPicture();
          setIsPictureInPicture(true);
        }
      }
      onAnalyticsEvent?.('pip_toggle', { enabled: !isPictureInPicture });
    } catch (err) {
      console.error('Picture-in-picture failed:', err);
      error('Picture-in-picture not supported');
    }
  }, [enablePictureInPicture, isPictureInPicture, onAnalyticsEvent, error]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleMove = useCallback((deltaX: number, deltaY: number) => {
    setPosition(prev => {
      const newPosition = { x: prev.x + deltaX, y: prev.y + deltaY };
      onMove?.(newPosition.x, newPosition.y);
      return newPosition;
    });
  }, [onMove]);

  // Update accessibility features based on system preferences
  useEffect(() => {
    setAccessibilityFeatures(prev => ({
      ...prev,
      reduceMotion: prefersReducedMotion,
      highContrast: prefersHighContrast
    }));
  }, [prefersReducedMotion, prefersHighContrast]);

  const resetTransforms = useCallback(() => {
    setZoomLevel(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    onAnalyticsEvent?.('transform_reset');
  }, [onAnalyticsEvent]);

  const toggleBookmark = useCallback(() => {
    if (!allowBookmarking) return;

    setIsBookmarked(prev => {
      const newState = !prev;
      onAnalyticsEvent?.('bookmark_toggle', { bookmarked: newState });
      success(newState ? 'Bookmarked' : 'Bookmark removed');
      return newState;
    });
  }, [allowBookmarking, onAnalyticsEvent, success]);

  const handleShare = useCallback(async () => {
    if (!allowContentSharing || !canShare) return;

    try {
      const shareData = {
        title: 'Review Content',
        text: content.text?.content.substring(0, 100) || 'Check out this review',
        url: window.location.href
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        success('Link copied to clipboard');
      }

      onAnalyticsEvent?.('content_share', { method: 'share' in navigator ? 'native' : 'clipboard' });
    } catch (error) {
      console.error('Share failed:', error);
    }
  }, [allowContentSharing, canShare, content.text, onAnalyticsEvent, success]);

  const toggleAccessibilityFeature = useCallback((feature: string) => {
    setAccessibilityFeatures(prev => {
      const newFeatures = { ...prev, [feature]: !prev[feature as keyof typeof prev] };
      setPreferences((prevPrefs: ReviewBodyPreferences) => ({ ...prevPrefs, accessibilityFeatures: newFeatures }));
      onAccessibilityToggle?.(feature, newFeatures[feature as keyof typeof newFeatures]);
      return newFeatures;
    });
  }, [setPreferences, onAccessibilityToggle]);

  // Render functions
  const renderControls = useCallback(() => {
    if (!showControls || viewMode === 'minimal') return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={animationSettings}
        className="flex items-center justify-between gap-2 p-2 bg-white/90 backdrop-blur-sm border rounded-lg shadow-sm"
      >
        {/* Layout controls */}
        <div className="flex items-center gap-1">
          <Tooltip content="Vertical layout">
            <Button
              variant={effectiveLayout === 'vertical' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleLayoutChange('vertical')}
              className="h-8 w-8 p-0"
            >
              <Layout className="w-4 h-4 rotate-90" />
            </Button>
          </Tooltip>

          <Tooltip content="Horizontal layout">
            <Button
              variant={effectiveLayout === 'horizontal' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleLayoutChange('horizontal')}
              className="h-8 w-8 p-0"
            >
              <Layout className="w-4 h-4" />
            </Button>
          </Tooltip>

          <Tooltip content="Stacked layout">
            <Button
              variant={effectiveLayout === 'stacked' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleLayoutChange('stacked')}
              className="h-8 w-8 p-0"
            >
              <Grid className="w-4 h-4" />
            </Button>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* View controls */}
        <div className="flex items-center gap-1">
          {hasMedia && (
            <Tooltip content="Focus on media">
              <Button
                variant={activeSection === 'media' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveSection('media')}
                className="h-8 w-8 p-0"
              >
                <Image className="w-4 h-4" aria-label="Media" />
              </Button>
            </Tooltip>
          )}

          {hasText && (
            <Tooltip content="Focus on text">
              <Button
                variant={activeSection === 'text' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveSection('text')}
                className="h-8 w-8 p-0"
              >
                <Type className="w-4 h-4" />
              </Button>
            </Tooltip>
          )}

          {hasMedia && hasText && (
            <Tooltip content="Show both">
              <Button
                variant={activeSection === 'both' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveSection('both')}
                className="h-8 w-8 p-0"
              >
                <List className="w-4 h-4" />
              </Button>
            </Tooltip>
          )}
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Transform controls */}
        {allowZoom && (
          <div className="flex items-center gap-1">
            <Tooltip content="Zoom out">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleZoom(Math.max(zoomLevel - 0.1, 0.5))}
                disabled={zoomLevel <= 0.5}
                className="h-8 w-8 p-0"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
            </Tooltip>

            <span className="text-xs text-gray-600 min-w-[3rem] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>

            <Tooltip content="Zoom in">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleZoom(Math.min(zoomLevel + 0.1, 3))}
                disabled={zoomLevel >= 3}
                className="h-8 w-8 p-0"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        )}

        {allowRotation && (
          <Tooltip content="Rotate">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRotate(rotation + 90)}
              className="h-8 w-8 p-0"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </Tooltip>
        )}

        <Tooltip content="Reset transforms">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetTransforms}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </Tooltip>

        <Separator orientation="vertical" className="h-6" />

        {/* Action controls */}
        <div className="flex items-center gap-1">
          {enableFullscreen && (
            <Tooltip content={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="h-8 w-8 p-0"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </Tooltip>
          )}

          {allowBookmarking && (
            <Tooltip content={isBookmarked ? "Remove bookmark" : "Bookmark"}>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleBookmark}
                className="h-8 w-8 p-0"
              >
                <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current")} />
              </Button>
            </Tooltip>
          )}

          {allowContentSharing && canShare && (
            <Tooltip content="Share">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="h-8 w-8 p-0"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </Tooltip>
          )}
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Settings and more */}
        <div className="flex items-center gap-1">
          <Tooltip content="Accessibility">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAccessibilityPanel(true)}
              className="h-8 w-8 p-0"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </Tooltip>

          <DropdownMenu
            trigger={
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            }
            items={[
              {
                key: 'theme-light',
                label: 'Light Theme',
                icon: Sun,
                onClick: () => handleThemeChange('light')
              },
              {
                key: 'theme-dark', 
                label: 'Dark Theme',
                icon: Moon,
                onClick: () => handleThemeChange('dark')
              },
              {
                key: 'theme-auto',
                label: 'Auto Theme',
                icon: Monitor,
                onClick: () => handleThemeChange('auto')
              },
              {
                key: 'density-compact',
                label: 'Compact Density',
                onClick: () => setDensity('compact')
              },
              {
                key: 'density-comfortable',
                label: 'Comfortable Density',
                onClick: () => setDensity('comfortable')
              },
              {
                key: 'density-spacious',
                label: 'Spacious Density',
                onClick: () => setDensity('spacious')
              },
              ...(customControls.map(control => ({
                key: control.id,
                label: control.label,
                icon: control.icon,
                onClick: control.action
              }))),
              {
                key: 'controls',
                label: showControls ? 'Hide controls' : 'Show controls',
                icon: showControls ? EyeOff : Eye,
                onClick: () => setShowControls(prev => !prev)
              }
            ]}
            align="end"
          />
        </div>
      </motion.div>
    );
  }, [
    showControls, viewMode, animationSettings, effectiveLayout, handleLayoutChange,
    hasMedia, hasText, activeSection, allowZoom, zoomLevel, handleZoom, allowRotation,
    rotation, handleRotate, resetTransforms, enableFullscreen, isFullscreen,
    toggleFullscreen, allowBookmarking, isBookmarked, toggleBookmark,
    allowContentSharing, canShare, handleShare, handleThemeChange, setDensity,
    customControls
  ]);

  const renderContent = useCallback(() => {
    const mediaComponent = hasMedia && (activeSection === 'media' || activeSection === 'both') && (
      <motion.div
        ref={mediaRef}
        layout
        transition={animationSettings}
        className={cn(
          'w-full',
          effectiveLayout === 'horizontal' && hasText && 'flex-1',
          density === 'compact' && 'space-y-2',
          density === 'comfortable' && 'space-y-4',
          density === 'spacious' && 'space-y-6'
        )}
      >
        <MediaCarousel
          items={content.media!.items}
          layout={content.media!.layout === 'carousel' ? 'slideshow' : content.media!.layout as 'grid' | 'masonry' | 'standard'}
          aspectRatio={content.media!.aspectRatio}
          showThumbnails={content.media!.showThumbnails}
          autoPlay={content.media!.autoPlay}
          allowDownload={allowMediaDownload && canDownload}
          allowShare={allowContentSharing && canShare}
          userId={userId}
          isOwner={isOwner}
          isAdmin={isAdmin}
          isModerator={isModerator}
        />
      </motion.div>
    );

    const textComponent = hasText && (activeSection === 'text' || activeSection === 'both') && (
      <motion.div
        ref={textRef}
        layout
        transition={animationSettings}
        className={cn(
          'w-full',
          effectiveLayout === 'horizontal' && hasMedia && 'flex-1',
          density === 'compact' && 'space-y-2',
          density === 'comfortable' && 'space-y-4',
          density === 'spacious' && 'space-y-6'
        )}
      >
        <ReviewText
          content={content.text!}
          fontSize={content.preferences?.fontSize}
          theme={currentTheme === 'auto' ? 'light' : currentTheme}
          dyslexiaMode={accessibilityFeatures.largeText}
          enableSelection={allowTextSelection}
          allowCopy={allowContentSharing}
          allowShare={allowContentSharing && canShare}
          allowHighlight={allowTextSelection}
          onCopy={onTextCopy}
          onShare={onTextShare}
          onHighlight={onTextHighlight}
          onTranslate={(targetLanguage) => onTextTranslate?.(content.text!.content, targetLanguage)}
          userId={userId}
          canEdit={canEdit}
          canDelete={canDelete}
          isOwner={isOwner}
          isAdmin={isAdmin}
          isModerator={isModerator}
        />
      </motion.div>
    );

    if (effectiveLayout === 'horizontal') {
      return (
        <div className={cn(
          'flex gap-4',
          content.layout?.spacing === 'tight' && 'gap-2',
          content.layout?.spacing === 'loose' && 'gap-6',
          content.layout?.alignment === 'start' && 'items-start',
          content.layout?.alignment === 'center' && 'items-center',
          content.layout?.alignment === 'end' && 'items-end',
          content.layout?.alignment === 'stretch' && 'items-stretch'
        )}>
          {content.layout?.mediaPosition === 'left' ? (
            <>
              {mediaComponent}
              {textComponent}
            </>
          ) : (
            <>
              {textComponent}
              {mediaComponent}
            </>
          )}
        </div>
      );
    }

    return (
      <div className={cn(
        'space-y-4',
        content.layout?.spacing === 'tight' && 'space-y-2',
        content.layout?.spacing === 'loose' && 'space-y-6'
      )}>
        {content.layout?.mediaPosition === 'top' ? (
          <>
            {mediaComponent}
            {textComponent}
          </>
        ) : (
          <>
            {textComponent}
            {mediaComponent}
          </>
        )}
      </div>
    );
  }, [
    hasMedia, hasText, activeSection, animationSettings, effectiveLayout, density,
    content, allowMediaDownload, canDownload, allowContentSharing, canShare,
    userId, isOwner, isAdmin, isModerator, currentTheme, accessibilityFeatures,
    allowTextSelection, onTextCopy, onTextShare, onTextHighlight, onTextTranslate,
    canEdit, canDelete
  ]);

  const renderMetadata = useCallback(() => {
    if (!showMetadata || !content.metadata) return null;

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        transition={animationSettings}
        className="border-t pt-4"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {content.metadata.wordCount && (
            <div>
              <div className="font-medium">{content.metadata.wordCount}</div>
              <div className="text-gray-600">Words</div>
            </div>
          )}
          
          {content.metadata.mediaCount && (
            <div>
              <div className="font-medium">{content.metadata.mediaCount}</div>
              <div className="text-gray-600">Media</div>
            </div>
          )}
          
          {content.metadata.estimatedReadTime && (
            <div>
              <div className="font-medium">{content.metadata.estimatedReadTime}m</div>
              <div className="text-gray-600">Read time</div>
            </div>
          )}
          
          {content.metadata.sentiment && (
            <div>
              <Badge variant={
                content.metadata.sentiment === 'positive' ? 'success' :
                content.metadata.sentiment === 'negative' ? 'destructive' : 'secondary'
              }>
                {content.metadata.sentiment}
              </Badge>
            </div>
          )}
        </div>
        
        {content.metadata.tags && content.metadata.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {content.metadata.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </motion.div>
    );
  }, [showMetadata, content.metadata, animationSettings]);

  const renderAnalytics = useCallback(() => {
    if (!showAnalytics || !content.analytics) return null;

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        transition={animationSettings}
        className="border-t pt-4"
      >
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium">{content.analytics.views}</div>
            <div className="text-gray-600">Views</div>
          </div>
          
          <div className="text-center">
            <div className="font-medium">{Math.round(content.analytics.timeSpent / 60)}m</div>
            <div className="text-gray-600">Time spent</div>
          </div>
          
          <div className="text-center">
            <div className="font-medium">{Math.round(content.analytics.scrollDepth)}%</div>
            <div className="text-gray-600">Scroll depth</div>
          </div>
          
          <div className="text-center">
            <div className="font-medium">{Math.round(content.analytics.textCompletionRate)}%</div>
            <div className="text-gray-600">Read completion</div>
          </div>
          
          <div className="text-center">
            <div className="font-medium">{Math.round(content.analytics.engagementScore)}</div>
            <div className="text-gray-600">Engagement</div>
          </div>
        </div>
      </motion.div>
    );
  }, [showAnalytics, content.analytics, animationSettings]);

  // Accessibility panel
  const renderAccessibilityPanel = useCallback(() => {
    if (!showAccessibilityPanel) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={animationSettings}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={() => setShowAccessibilityPanel(false)}
      >
        <Card 
          className="w-full max-w-md mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <CardHeader>
            <h3 className="font-semibold">Accessibility Settings</h3>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm">Reduce motion</label>
              <Switch
                checked={accessibilityFeatures.reduceMotion}
                onCheckedChange={() => toggleAccessibilityFeature('reduceMotion')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm">High contrast</label>
              <Switch
                checked={accessibilityFeatures.highContrast}
                onCheckedChange={() => toggleAccessibilityFeature('highContrast')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm">Large text</label>
              <Switch
                checked={accessibilityFeatures.largeText}
                onCheckedChange={() => toggleAccessibilityFeature('largeText')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm">Screen reader mode</label>
              <Switch
                checked={accessibilityFeatures.screenReader}
                onCheckedChange={() => toggleAccessibilityFeature('screenReader')}
              />
            </div>
            
            {hasMedia && (
              <>
                <div className="flex items-center justify-between">
                  <label className="text-sm">Audio descriptions</label>
                  <Switch
                    checked={accessibilityFeatures.audioDescription}
                    onCheckedChange={() => toggleAccessibilityFeature('audioDescription')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm">Captions</label>
                  <Switch
                    checked={accessibilityFeatures.captions}
                    onCheckedChange={() => toggleAccessibilityFeature('captions')}
                  />
                </div>
              </>
            )}
            
            <div className="pt-4 border-t">
              <Button
                onClick={() => setShowAccessibilityPanel(false)}
                className="w-full"
              >
                Done
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }, [
    showAccessibilityPanel, animationSettings, accessibilityFeatures,
    toggleAccessibilityFeature, hasMedia
  ]);

  // Main render
  const ContentWrapper = CustomLayout || 'div';

  return (
    <div className={cn('relative', className)}>
      <ContentWrapper>
        <motion.div
          ref={containerRef}
          layout
          transition={animationSettings}
          className={cn(
            'relative overflow-hidden',
            currentTheme === 'dark' && 'dark',
            currentTheme === 'sepia' && 'sepia',
            currentTheme === 'high-contrast' && 'high-contrast',
            accessibilityFeatures.highContrast && 'contrast-more',
            accessibilityFeatures.largeText && 'text-lg',
            density === 'compact' && 'space-y-2',
            density === 'comfortable' && 'space-y-4',
            density === 'spacious' && 'space-y-6',
            isFullscreen && 'fixed inset-0 z-50 bg-white p-4'
          )}
          style={containerStyles}
        >
          {/* Controls */}
          <AnimatePresence>
            {renderControls()}
          </AnimatePresence>

          {/* Main content */}
          <div className={cn(
            'transition-all duration-300',
            viewMode === 'focus' && 'filter blur-sm',
            viewMode === 'minimal' && 'opacity-90'
          )}>
            {renderContent()}
          </div>

          {/* Metadata */}
          <AnimatePresence>
            {renderMetadata()}
          </AnimatePresence>

          {/* Analytics */}
          <AnimatePresence>
            {renderAnalytics()}
          </AnimatePresence>
        </motion.div>
      </ContentWrapper>

      {/* Accessibility panel */}
      <AnimatePresence>
        {renderAccessibilityPanel()}
      </AnimatePresence>
    </div>
  );
};

export default ReviewBody;
