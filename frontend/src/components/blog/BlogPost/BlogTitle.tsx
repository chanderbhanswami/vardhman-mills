'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Edit, Calendar, User, Eye, EyeOff, Type, Check, Link2 as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

// Types
export interface BlogTitleProps {
  title: string;
  className?: string;
  variant?: 'default' | 'hero' | 'minimal' | 'decorative' | 'card' | 'banner';
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  color?: 'default' | 'primary' | 'secondary' | 'accent' | 'muted';
  editable?: boolean;
  showPermalink?: boolean;
  showWordCount?: boolean;
  showReadingTime?: boolean;
  showMeta?: boolean;
  animateOnHover?: boolean;
  truncate?: number;
  slug?: string;
  postId?: string;
  author?: {
    name: string;
    avatar?: string;
  };
  publishedAt?: Date | string;
  estimatedReadTime?: number;
  onTitleChange?: (newTitle: string) => void;
  onPermalinkCopy?: (slug: string) => void;
  children?: React.ReactNode;
}

export const BlogTitle: React.FC<BlogTitleProps> = ({
  title,
  className,
  variant = 'default',
  level = 1,
  size = 'xl',
  color = 'default',
  editable = false,
  showPermalink = false,
  showWordCount = false,
  showReadingTime = false,
  showMeta = false,
  animateOnHover = false,
  truncate,
  slug,
  author,
  publishedAt,
  estimatedReadTime,
  onTitleChange,
  onPermalinkCopy,
  children
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [copiedPermalink, setCopiedPermalink] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [showFullTitle, setShowFullTitle] = useState(false);
  
  const titleRef = useRef<HTMLHeadingElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Calculate word count and reading time
  const wordCount = title.trim().split(/\s+/).length;
  const calculatedReadTime = estimatedReadTime || Math.ceil(wordCount * 10 / 200); // Very rough estimate

  // Generate slug from title if not provided
  const generatedSlug = slug || title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  // Check if title should be truncated
  useEffect(() => {
    if (truncate && title.length > truncate) {
      setIsTruncated(true);
    }
  }, [title, truncate]);

  // Handle title edit
  const handleTitleEdit = () => {
    if (editable) {
      setIsEditing(true);
      setEditedTitle(title);
    }
  };

  // Handle title save
  const handleTitleSave = () => {
    if (editedTitle.trim() && editedTitle !== title) {
      onTitleChange?.(editedTitle.trim());
      toast.success('Title updated successfully');
    }
    setIsEditing(false);
  };

  // Handle title cancel
  const handleTitleCancel = () => {
    setEditedTitle(title);
    setIsEditing(false);
  };

  // Handle permalink copy
  const handlePermalinkCopy = async () => {
    try {
      const permalinkUrl = `${window.location.origin}/blog/${generatedSlug}`;
      await navigator.clipboard.writeText(permalinkUrl);
      setCopiedPermalink(true);
      onPermalinkCopy?.(generatedSlug);
      toast.success('Permalink copied to clipboard');
      setTimeout(() => setCopiedPermalink(false), 2000);
    } catch {
      toast.error('Failed to copy permalink');
    }
  };

  // Handle key press in edit mode
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      handleTitleCancel();
    }
  };

  // Get heading component based on level
  const getHeadingComponent = () => {
    switch (level) {
      case 1: return 'h1';
      case 2: return 'h2';
      case 3: return 'h3';
      case 4: return 'h4';
      case 5: return 'h5';
      case 6: return 'h6';
      default: return 'h1';
    }
  };

  // Get title classes based on variant and size
  const getTitleClasses = () => {
    const baseClasses = 'font-bold tracking-tight transition-all duration-200';
    
    // Size classes
    const sizeClasses = {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl'
    };

    // Color classes
    const colorClasses = {
      default: 'text-gray-900 dark:text-gray-100',
      primary: 'text-blue-600 dark:text-blue-400',
      secondary: 'text-gray-600 dark:text-gray-400',
      accent: 'text-purple-600 dark:text-purple-400',
      muted: 'text-gray-500 dark:text-gray-500'
    };

    // Variant-specific classes
    const variantClasses = {
      default: '',
      hero: 'text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent',
      minimal: 'text-left border-l-4 border-blue-500 pl-4',
      decorative: 'relative before:absolute before:bottom-0 before:left-0 before:w-full before:h-1 before:bg-gradient-to-r before:from-blue-500 before:to-purple-500',
      card: 'p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border',
      banner: 'p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl'
    };

    // Hover effects
    const hoverClasses = animateOnHover 
      ? 'hover:scale-105 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer'
      : '';

    // Editable classes
    const editableClasses = editable 
      ? 'hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-2 py-1 -mx-2 -my-1'
      : '';

    return cn(
      baseClasses,
      sizeClasses[size],
      colorClasses[color],
      variantClasses[variant],
      hoverClasses,
      editableClasses
    );
  };

  // Get display title
  const getDisplayTitle = () => {
    if (isTruncated && !showFullTitle && truncate) {
      return title.length > truncate 
        ? `${title.substring(0, truncate)}...`
        : title;
    }
    return title;
  };

  // Meta information component
  const TitleMeta = () => showMeta ? (
    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-2">
      {author && (
        <div className="flex items-center space-x-1">
          <User className="w-4 h-4" />
          <span>{author.name}</span>
        </div>
      )}
      {publishedAt && (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4" />
          <span>
            {typeof publishedAt === 'string' 
              ? publishedAt 
              : publishedAt.toLocaleDateString()
            }
          </span>
        </div>
      )}
      {showReadingTime && (
        <div className="flex items-center space-x-1">
          <Eye className="w-4 h-4" />
          <span>{calculatedReadTime} min read</span>
        </div>
      )}
      {showWordCount && (
        <div className="flex items-center space-x-1">
          <Type className="w-4 h-4" />
          <span>{wordCount} words</span>
        </div>
      )}
    </div>
  ) : null;

  // Title actions component
  const TitleActions = () => (
    <div className="flex items-center space-x-2 ml-4">
      {editable && (
        <Tooltip content="Edit title">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleTitleEdit}
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit className="w-3 h-3" />
          </Button>
        </Tooltip>
      )}
      
      {showPermalink && (
        <Tooltip content={copiedPermalink ? 'Copied!' : 'Copy permalink'}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePermalinkCopy}
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {copiedPermalink ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <LinkIcon className="w-3 h-3" />
            )}
          </Button>
        </Tooltip>
      )}

      {generatedSlug && (
        <Tooltip content="Permalink anchor">
          <Badge variant="outline" className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
            #{generatedSlug}
          </Badge>
        </Tooltip>
      )}
    </div>
  );

  // Edit mode component
  const EditMode = () => isEditing ? (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-2"
    >
      <Input
        ref={inputRef}
        value={editedTitle}
        onChange={(e) => setEditedTitle(e.target.value)}
        onKeyDown={handleKeyPress}
        className="text-lg font-bold"
        placeholder="Enter title..."
        autoFocus
      />
      <div className="flex space-x-2">
        <Button size="sm" onClick={handleTitleSave}>
          Save
        </Button>
        <Button size="sm" variant="outline" onClick={handleTitleCancel}>
          Cancel
        </Button>
      </div>
    </motion.div>
  ) : null;

  // Truncation toggle
  const TruncationToggle = () => isTruncated ? (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setShowFullTitle(!showFullTitle)}
      className="text-blue-600 hover:text-blue-700 text-sm mt-2"
    >
      {showFullTitle ? (
        <>
          <EyeOff className="w-4 h-4 mr-1" />
          Show less
        </>
      ) : (
        <>
          <Eye className="w-4 h-4 mr-1" />
          Show more
        </>
      )}
    </Button>
  ) : null;

  const HeadingComponent = getHeadingComponent();

  return (
    <div className={cn('group relative', className)}>
      <AnimatePresence mode="wait">
        {isEditing ? (
          <EditMode />
        ) : (
          <motion.div
            key="display"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-start"
          >
            <div className="flex-1">
              <HeadingComponent {...{
                ref: titleRef,
                className: cn(getTitleClasses()),
                onClick: editable ? handleTitleEdit : undefined,
                style: { cursor: editable ? 'pointer' : 'default' }
              }}>
                <motion.span
                  animate={animateOnHover ? { scale: 1 } : {}}
                  whileHover={animateOnHover ? { scale: 1.02 } : {}}
                  transition={{ duration: 0.2 }}
                >
                  {getDisplayTitle()}
                </motion.span>
              </HeadingComponent>
              
              <TruncationToggle />
              <TitleMeta />
              
              {children && (
                <div className="mt-4">
                  {children}
                </div>
              )}
            </div>
            
            <TitleActions />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Title with breadcrumb navigation
export interface BlogTitleWithBreadcrumbProps extends BlogTitleProps {
  breadcrumbs?: Array<{
    label: string;
    href: string;
  }>;
  showHome?: boolean;
}

export const BlogTitleWithBreadcrumb: React.FC<BlogTitleWithBreadcrumbProps> = ({
  breadcrumbs = [],
  showHome = true,
  ...titleProps
}) => {
  const allBreadcrumbs = showHome 
    ? [{ label: 'Home', href: '/' }, ...breadcrumbs]
    : breadcrumbs;

  return (
    <div className="space-y-3">
      {/* Breadcrumb navigation */}
      {allBreadcrumbs.length > 0 && (
        <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          {allBreadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.href}>
              {index > 0 && <span>/</span>}
              <Link
                href={crumb.href}
                className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                {crumb.label}
              </Link>
            </React.Fragment>
          ))}
        </nav>
      )}
      
      {/* Title */}
      <BlogTitle {...titleProps} />
    </div>
  );
};

// Animated title component
export interface AnimatedBlogTitleProps extends BlogTitleProps {
  animationType?: 'fade' | 'slide' | 'bounce' | 'typewriter';
  animationDelay?: number;
  animationDuration?: number;
}

export const AnimatedBlogTitle: React.FC<AnimatedBlogTitleProps> = ({
  animationType = 'fade',
  animationDelay = 0,
  animationDuration = 0.5,
  title,
  ...titleProps
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      
      if (animationType === 'typewriter') {
        let currentIndex = 0;
        const typewriterTimer = setInterval(() => {
          if (currentIndex <= title.length) {
            setDisplayedText(title.substring(0, currentIndex));
            currentIndex++;
          } else {
            clearInterval(typewriterTimer);
          }
        }, 50);
        
        return () => clearInterval(typewriterTimer);
      }
    }, animationDelay * 1000);
    
    return () => clearTimeout(timer);
  }, [title, animationType, animationDelay]);

  const getAnimationProps = () => {
    const baseProps = {
      transition: { duration: animationDuration, delay: animationDelay }
    };

    switch (animationType) {
      case 'slide':
        return {
          initial: { opacity: 0, x: -50 },
          animate: isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 },
          ...baseProps
        };
      case 'bounce':
        return {
          initial: { opacity: 0, scale: 0.5 },
          animate: isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 },
          transition: { 
            ...baseProps.transition, 
            type: 'spring' as const, 
            stiffness: 200, 
            damping: 10 
          }
        };
      case 'typewriter':
        return {
          initial: { opacity: 1 },
          animate: { opacity: 1 },
          ...baseProps
        };
      default: // fade
        return {
          initial: { opacity: 0 },
          animate: isVisible ? { opacity: 1 } : { opacity: 0 },
          ...baseProps
        };
    }
  };

  const displayTitle = animationType === 'typewriter' ? displayedText : title;

  return (
    <motion.div {...getAnimationProps()}>
      <BlogTitle {...titleProps} title={displayTitle} />
      {animationType === 'typewriter' && displayedText === title && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          className="inline-block w-1 h-6 bg-current ml-1"
        />
      )}
    </motion.div>
  );
};

export default BlogTitle;
