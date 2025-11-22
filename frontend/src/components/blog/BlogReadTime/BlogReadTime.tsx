'use client';

import React from 'react';
import { Clock, Book, BookOpen, Timer, Eye, Users } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';

// Types
export interface BlogReadTimeProps {
  content?: string;
  wordCount?: number;
  readTime?: number; // in minutes
  variant?: 'default' | 'compact' | 'detailed' | 'minimal' | 'badge' | 'icon-only';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showWordCount?: boolean;
  showEstimate?: boolean;
  showDifficulty?: boolean;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  tooltipContent?: string;
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  averageViewTime?: number; // in minutes
  completionRate?: number; // percentage
  estimationMethod?: 'simple' | 'advanced' | 'content-based';
  readingSpeed?: number; // words per minute (default: 200)
}

export interface ReadingStats {
  wordCount: number;
  readTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedComprehension: number;
  technicalTerms: number;
  averageSentenceLength: number;
}

// Reading time calculation utility
const calculateReadTime = (
  content: string,
  method: 'simple' | 'advanced' | 'content-based' = 'simple',
  readingSpeed: number = 200
): ReadingStats => {
  const words = content.trim().split(/\s+/);
  const wordCount = words.length;
  
  if (method === 'simple') {
    return {
      wordCount,
      readTime: Math.ceil(wordCount / readingSpeed),
      difficulty: 'intermediate',
      estimatedComprehension: 85,
      technicalTerms: 0,
      averageSentenceLength: 15
    };
  }

  // Advanced calculation
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const averageSentenceLength = wordCount / sentences.length;
  
  // Calculate technical terms (words > 6 characters or containing technical patterns)
  const technicalTerms = words.filter(word => 
    word.length > 6 || 
    /[A-Z]{2,}/.test(word) || 
    word.includes('_') || 
    word.includes('-')
  ).length;
  
  // Difficulty assessment
  let difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert' = 'beginner';
  const technicalRatio = technicalTerms / wordCount;
  
  if (technicalRatio > 0.15 || averageSentenceLength > 25) {
    difficulty = 'expert';
  } else if (technicalRatio > 0.1 || averageSentenceLength > 20) {
    difficulty = 'advanced';
  } else if (technicalRatio > 0.05 || averageSentenceLength > 15) {
    difficulty = 'intermediate';
  }
  
  // Adjust reading speed based on difficulty
  const adjustedSpeed = readingSpeed * (
    difficulty === 'expert' ? 0.7 :
    difficulty === 'advanced' ? 0.8 :
    difficulty === 'intermediate' ? 0.9 : 1.0
  );
  
  const estimatedComprehension = Math.max(60, 100 - (technicalRatio * 200) - (averageSentenceLength * 0.5));
  
  return {
    wordCount,
    readTime: Math.ceil(wordCount / adjustedSpeed),
    difficulty,
    estimatedComprehension: Math.round(estimatedComprehension),
    technicalTerms,
    averageSentenceLength: Math.round(averageSentenceLength)
  };
};

// Difficulty color mapping
const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner':
      return 'text-green-600 dark:text-green-400';
    case 'intermediate':
      return 'text-blue-600 dark:text-blue-400';
    case 'advanced':
      return 'text-orange-600 dark:text-orange-400';
    case 'expert':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
};

// Main component
export const BlogReadTime: React.FC<BlogReadTimeProps> = ({
  content = '',
  wordCount: providedWordCount,
  readTime: providedReadTime,
  variant = 'default',
  size = 'md',
  showIcon = true,
  showWordCount = false,
  showEstimate = true,
  showDifficulty = false,
  className,
  iconClassName,
  textClassName,
  tooltipContent,
  color = 'default',
  difficulty,
  averageViewTime,
  completionRate,
  estimationMethod = 'simple',
  readingSpeed = 200,
}) => {
  const stats = React.useMemo(() => {
    if (providedReadTime && providedWordCount) {
      return {
        wordCount: providedWordCount,
        readTime: providedReadTime,
        difficulty: difficulty || 'intermediate',
        estimatedComprehension: 85,
        technicalTerms: 0,
        averageSentenceLength: 15
      } as ReadingStats;
    }
    
    if (content) {
      return calculateReadTime(content, estimationMethod, readingSpeed);
    }
    
    return {
      wordCount: providedWordCount || 0,
      readTime: providedReadTime || 0,
      difficulty: difficulty || 'intermediate',
      estimatedComprehension: 85,
      technicalTerms: 0,
      averageSentenceLength: 15
    } as ReadingStats;
  }, [content, providedWordCount, providedReadTime, difficulty, estimationMethod, readingSpeed]);

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const colorClasses = {
    default: 'text-gray-600 dark:text-gray-400',
    primary: 'text-blue-600 dark:text-blue-400',
    secondary: 'text-purple-600 dark:text-purple-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-orange-600 dark:text-orange-400',
    danger: 'text-red-600 dark:text-red-400'
  };

  const iconSize = size === 'sm' ? 12 : size === 'md' ? 14 : 16;

  const formatReadTime = (minutes: number) => {
    if (minutes < 1) return '< 1 min read';
    if (minutes === 1) return '1 min read';
    return `${minutes} min read`;
  };

  const getIcon = () => {
    switch (variant) {
      case 'detailed':
        return <BookOpen size={iconSize} />;
      case 'compact':
        return <Timer size={iconSize} />;
      default:
        return <Clock size={iconSize} />;
    }
  };

  const renderContent = () => {
    const baseContent = (
      <div className={cn(
        'flex items-center gap-1.5',
        sizeClasses[size],
        colorClasses[color],
        className
      )}>
        {showIcon && (
          <span className={cn('flex-shrink-0', iconClassName)}>
            {getIcon()}
          </span>
        )}
        
        <span className={cn('whitespace-nowrap', textClassName)}>
          {showEstimate && formatReadTime(stats.readTime)}
          {showWordCount && (
            <span className="ml-1 opacity-75">
              ({stats.wordCount.toLocaleString()} words)
            </span>
          )}
        </span>

        {showDifficulty && (
          <Badge 
            variant="secondary" 
            className={cn(
              'ml-1 text-xs',
              getDifficultyColor(stats.difficulty)
            )}
          >
            {stats.difficulty}
          </Badge>
        )}
      </div>
    );

    if (tooltipContent || variant === 'detailed') {
      const detailedTooltip = (
        <div className="space-y-2 text-sm">
          <div className="font-medium">Reading Statistics</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Word Count: {stats.wordCount.toLocaleString()}</div>
            <div>Read Time: {stats.readTime} min</div>
            <div>Difficulty: {stats.difficulty}</div>
            <div>Technical Terms: {stats.technicalTerms}</div>
            <div>Avg Sentence: {stats.averageSentenceLength} words</div>
            <div>Comprehension: {stats.estimatedComprehension}%</div>
          </div>
          {averageViewTime && (
            <div className="pt-1 border-t text-xs">
              Avg View Time: {averageViewTime} min
            </div>
          )}
          {completionRate && (
            <div className="text-xs">
              Completion Rate: {completionRate}%
            </div>
          )}
        </div>
      );

      return (
        <TooltipProvider>
          <Tooltip content={tooltipContent || ''}>
            <TooltipTrigger asChild>
              <div className="cursor-help">
                {baseContent}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {tooltipContent || detailedTooltip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return baseContent;
  };

  // Variant-specific rendering
  switch (variant) {
    case 'minimal':
      return (
        <span className={cn(
          sizeClasses[size],
          colorClasses[color],
          className
        )}>
          {stats.readTime}m
        </span>
      );

    case 'badge':
      return (
        <Badge 
          variant="secondary" 
          className={cn(
            'gap-1',
            sizeClasses[size],
            className
          )}
        >
          {showIcon && <Clock size={iconSize} />}
          {formatReadTime(stats.readTime)}
        </Badge>
      );

    case 'icon-only':
      return (
        <TooltipProvider>
          <Tooltip content={formatReadTime(stats.readTime)}>
            <TooltipTrigger asChild>
              <div className={cn(
                'flex items-center justify-center w-6 h-6 rounded cursor-help',
                colorClasses[color],
                className
              )}>
                <Clock size={iconSize} />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {formatReadTime(stats.readTime)}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

    case 'detailed':
      return (
        <div className={cn('space-y-1', className)}>
          {renderContent()}
          <div className="flex items-center gap-3 text-xs opacity-75">
            <span className="flex items-center gap-1">
              <Book size={12} />
              {stats.wordCount.toLocaleString()} words
            </span>
            <span className="flex items-center gap-1">
              <Eye size={12} />
              {stats.difficulty}
            </span>
            {averageViewTime && (
              <span className="flex items-center gap-1">
                <Users size={12} />
                {averageViewTime}m avg
              </span>
            )}
          </div>
        </div>
      );

    case 'compact':
      return (
        <div className={cn(
          'inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800',
          sizeClasses[size],
          colorClasses[color],
          className
        )}>
          {showIcon && <Timer size={iconSize} />}
          <span>{stats.readTime}m</span>
          {showWordCount && (
            <span className="opacity-75">
              • {stats.wordCount}w
            </span>
          )}
        </div>
      );

    default:
      return renderContent();
  }
};

// Additional utility components
export const QuickReadTime: React.FC<{ content: string; className?: string }> = ({ 
  content, 
  className 
}) => (
  <BlogReadTime 
    content={content}
    variant="minimal"
    size="sm"
    className={className}
  />
);

export const DetailedReadTime: React.FC<BlogReadTimeProps> = (props) => (
  <BlogReadTime 
    {...props}
    variant="detailed"
    showWordCount
    showDifficulty
  />
);

export const CompactReadTime: React.FC<BlogReadTimeProps> = (props) => (
  <BlogReadTime 
    {...props}
    variant="compact"
    size="sm"
  />
);

// Hook for calculating read time
export const useReadTime = (
  content: string, 
  options?: {
    method?: 'simple' | 'advanced' | 'content-based';
    readingSpeed?: number;
  }
) => {
  return React.useMemo(() => {
    if (!content) return null;
    return calculateReadTime(
      content, 
      options?.method || 'simple', 
      options?.readingSpeed || 200
    );
  }, [content, options?.method, options?.readingSpeed]);
};

export default BlogReadTime;
