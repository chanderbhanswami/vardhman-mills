'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Heart, ThumbsUp, Star, Bookmark, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

// Types
export interface LikeData {
  id: string;
  type: 'like' | 'love' | 'star' | 'bookmark';
  count: number;
  hasUserLiked: boolean;
  recentUsers?: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
}

export interface BlogLikeProps {
  postId: string;
  initialLikes?: LikeData[];
  className?: string;
  variant?: 'default' | 'compact' | 'detailed' | 'floating' | 'minimal' | 'social';
  showLabels?: boolean;
  showCounts?: boolean;
  showRecentUsers?: boolean;
  showTrending?: boolean;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  onLike?: (postId: string, type: string, isLiked: boolean) => void;
  onShowLikers?: (postId: string, type: string) => void;
  maxRecentUsers?: number;
  requireAuth?: boolean;
  customTypes?: Array<{
    type: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    color: string;
  }>;
}

export const BlogLike: React.FC<BlogLikeProps> = ({
  postId,
  initialLikes = [],
  className,
  variant = 'default',
  showLabels = true,
  showCounts = true,
  showRecentUsers = false,
  showTrending = false,
  animated = true,
  size = 'md',
  orientation = 'horizontal',
  onLike,
  onShowLikers,
  maxRecentUsers = 3,
  requireAuth = true,
  customTypes
}) => {
  const [likes, setLikes] = useState<LikeData[]>(initialLikes);
  const [isAnimating, setIsAnimating] = useState<{ [key: string]: boolean }>({});
  const [hoveredType, setHoveredType] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Default like types
  const defaultTypes = [
    { type: 'like', icon: ThumbsUp, label: 'Like', color: 'text-blue-500' },
    { type: 'love', icon: Heart, label: 'Love', color: 'text-red-500' },
    { type: 'star', icon: Star, label: 'Star', color: 'text-yellow-500' },
    { type: 'bookmark', icon: Bookmark, label: 'Save', color: 'text-green-500' }
  ];

  const likeTypes = customTypes || defaultTypes;

  // Initialize likes with default types if not provided
  useEffect(() => {
    if (initialLikes.length === 0) {
      const defaultLikes = likeTypes.map(type => ({
        id: `${postId}-${type.type}`,
        type: type.type as 'like' | 'love' | 'star' | 'bookmark',
        count: 0,
        hasUserLiked: false,
        recentUsers: []
      }));
      setLikes(defaultLikes);
    }
  }, [postId, likeTypes, initialLikes]);

  // Handle like toggle
  const handleLike = async (type: string) => {
    if (requireAuth) {
      // Check authentication here
      const isAuthenticated = true; // Replace with actual auth check
      if (!isAuthenticated) {
        toast.error('Please sign in to like this post');
        return;
      }
    }

    const likeData = likes.find(l => l.type === type);
    if (!likeData) return;

    const wasLiked = likeData.hasUserLiked;
    const newCount = wasLiked ? likeData.count - 1 : likeData.count + 1;

    // Optimistic update
    setLikes(prev => prev.map(like => 
      like.type === type 
        ? { 
            ...like, 
            hasUserLiked: !wasLiked, 
            count: newCount,
            recentUsers: !wasLiked && showRecentUsers 
              ? [{ id: 'current-user', name: 'You', avatar: '' }, ...(like.recentUsers || []).slice(0, maxRecentUsers - 1)]
              : (like.recentUsers || []).filter(u => u.id !== 'current-user')
          }
        : like
    ));

    // Animation
    if (animated) {
      setIsAnimating(prev => ({ ...prev, [type]: true }));
      setTimeout(() => {
        setIsAnimating(prev => ({ ...prev, [type]: false }));
      }, 300);
    }

    // Callback
    onLike?.(postId, type, !wasLiked);

    // Show feedback
    if (!wasLiked) {
      const typeConfig = likeTypes.find(t => t.type === type);
      toast.success(`${typeConfig?.label || 'Reaction'} added!`, {
        icon: React.createElement(typeConfig?.icon || Heart, { className: 'w-4 h-4' }),
        duration: 1500
      });
    }
  };

  // Handle show likers
  const handleShowLikers = (type: string) => {
    onShowLikers?.(postId, type);
  };

  // Get total likes count
  const totalLikes = likes.reduce((sum, like) => sum + like.count, 0);

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          button: 'h-8 px-2 text-xs',
          icon: 'w-3 h-3',
          avatar: 'w-5 h-5'
        };
      case 'lg':
        return {
          button: 'h-12 px-4 text-base',
          icon: 'w-6 h-6',
          avatar: 'w-8 h-8'
        };
      default:
        return {
          button: 'h-10 px-3 text-sm',
          icon: 'w-4 h-4',
          avatar: 'w-6 h-6'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  // Like button component
  const LikeButton = ({ type, config }: { 
    type: string; 
    config: {
      type: string;
      icon: React.ComponentType<{ className?: string }>;
      label: string;
      color: string;
    };
  }) => {
    const likeData = likes.find(l => l.type === type);
    if (!likeData) return null;

    const Icon = config.icon;
    const isLiked = likeData.hasUserLiked;
    const count = likeData.count;

    return (
      <Tooltip 
        content={
          <div className="text-center">
            <p className="font-medium">{config.label}</p>
            {count > 0 && (
              <p className="text-xs text-gray-400">
                {count} {count === 1 ? 'person' : 'people'}
              </p>
            )}
          </div>
        }
      >
        <Button
          variant={isLiked ? 'default' : 'ghost'}
          size={size}
          onClick={() => handleLike(type)}
          onMouseEnter={() => setHoveredType(type)}
          onMouseLeave={() => setHoveredType(null)}
          className={cn(
            sizeClasses.button,
            'relative overflow-hidden transition-all duration-200',
            isLiked && config.color,
            hoveredType === type && 'scale-105'
          )}
        >
          <motion.div
            className="flex items-center space-x-1"
            animate={isAnimating[type] ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Icon 
              className={cn(
                sizeClasses.icon,
                isLiked ? config.color : 'text-gray-600 dark:text-gray-400',
                isLiked && animated && 'drop-shadow-sm'
              )}
            />
            {showLabels && variant !== 'minimal' && (
              <span className={cn(
                isLiked ? 'font-medium' : 'font-normal'
              )}>
                {config.label}
              </span>
            )}
            {showCounts && count > 0 && (
              <Badge 
                variant="outline" 
                className={cn(
                  'text-xs ml-1',
                  isLiked && 'border-current'
                )}
              >
                {count > 999 ? `${Math.floor(count / 1000)}k` : count}
              </Badge>
            )}
          </motion.div>

          {/* Animation overlay */}
          <AnimatePresence>
            {isAnimating[type] && (
              <motion.div
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className={cn(
                  'absolute inset-0 rounded-full',
                  config.color.replace('text-', 'bg-').replace('-500', '-100')
                )}
              />
            )}
          </AnimatePresence>
        </Button>
      </Tooltip>
    );
  };

  // Recent users component
  const RecentUsers = ({ type }: { type: string }) => {
    const likeData = likes.find(l => l.type === type);
    if (!likeData || !showRecentUsers || !likeData.recentUsers?.length) return null;

    return (
      <div className="flex items-center space-x-1 ml-2">
        <div className="flex -space-x-1">
          {likeData.recentUsers.slice(0, maxRecentUsers).map((user, index) => (
            <Tooltip key={user.id} content={user.name}>
              <Avatar
                src={user.avatar}
                alt={user.name}
                className={cn(
                  sizeClasses.avatar,
                  'border-2 border-white dark:border-gray-800',
                  'hover:z-10 transition-transform hover:scale-110'
                )}
                style={{ zIndex: maxRecentUsers - index }}
              >
                {user.name.charAt(0)}
              </Avatar>
            </Tooltip>
          ))}
        </div>
        {likeData.recentUsers.length > maxRecentUsers && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleShowLikers(type)}
            className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            +{likeData.recentUsers.length - maxRecentUsers} more
          </Button>
        )}
      </div>
    );
  };

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center space-x-1', className)} ref={containerRef}>
        {likeTypes.slice(0, 2).map((config) => (
          <LikeButton key={config.type} type={config.type} config={config} />
        ))}
        {totalLikes > 0 && (
          <Badge variant="outline" className="text-xs">
            {totalLikes}
          </Badge>
        )}
      </div>
    );
  }

  // Minimal variant
  if (variant === 'minimal') {
    const primaryLike = likes.find(l => l.type === 'like') || likes[0];
    const primaryConfig = likeTypes.find(t => t.type === primaryLike?.type);
    
    if (!primaryLike || !primaryConfig) return null;

    return (
      <div className={cn('flex items-center', className)} ref={containerRef}>
        <LikeButton type={primaryLike.type} config={primaryConfig} />
      </div>
    );
  }

  // Floating variant
  if (variant === 'floating') {
    return (
      <motion.div
        ref={containerRef}
        className={cn(
          'fixed right-4 top-1/2 transform -translate-y-1/2 z-40',
          'bg-white dark:bg-gray-800 rounded-full shadow-lg border',
          'p-2 space-y-2',
          className
        )}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        {likeTypes.map((config) => {
          const likeData = likes.find(l => l.type === config.type);
          if (!likeData) return null;

          return (
            <div key={config.type} className="flex flex-col items-center">
              <LikeButton type={config.type} config={config} />
              {likeData.count > 0 && (
                <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {likeData.count}
                </span>
              )}
            </div>
          );
        })}
      </motion.div>
    );
  }

  // Social variant
  if (variant === 'social') {
    return (
      <div className={cn('space-y-4', className)} ref={containerRef}>
        {/* Summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {totalLikes > 0 && (
              <>
                <div className="flex -space-x-1">
                  {likeTypes.filter(t => {
                    const like = likes.find(l => l.type === t.type);
                    return like && like.count > 0;
                  }).slice(0, 3).map((config) => {
                    const Icon = config.icon;
                    return (
                      <div
                        key={config.type}
                        className={cn(
                          'w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-xs relative',
                          config.color.replace('text-', 'bg-'),
                          'z-20'
                        )}
                      >
                        <Icon className="w-3 h-3" />
                      </div>
                    );
                  })}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {totalLikes} {totalLikes === 1 ? 'reaction' : 'reactions'}
                </span>
              </>
            )}
          </div>
          {showTrending && totalLikes > 10 && (
            <Badge variant="outline" className="text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              Trending
            </Badge>
          )}
        </div>

        {/* Action buttons */}
        <div className={cn(
          'flex gap-2',
          orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'
        )}>
          {likeTypes.map((config) => (
            <div key={config.type} className={cn(
              'flex items-center',
              orientation === 'vertical' ? 'justify-between' : 'flex-1'
            )}>
              <LikeButton type={config.type} config={config} />
              <RecentUsers type={config.type} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Detailed variant
  if (variant === 'detailed') {
    return (
      <div className={cn('space-y-4', className)} ref={containerRef}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            Reactions {totalLikes > 0 && `(${totalLikes})`}
          </h3>
          {showTrending && totalLikes > 50 && (
            <Badge variant="outline">
              <TrendingUp className="w-3 h-3 mr-1" />
              Popular
            </Badge>
          )}
        </div>

        {/* Reaction breakdown */}
        <div className="grid grid-cols-2 gap-3">
          {likeTypes.map((config) => {
            const likeData = likes.find(l => l.type === config.type);
            if (!likeData) return null;

            const Icon = config.icon;
            return (
              <div
                key={config.type}
                className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Icon className={cn('w-5 h-5', config.color)} />
                    <span className="font-medium">{config.label}</span>
                  </div>
                  <Badge variant="outline">{likeData.count}</Badge>
                </div>
                
                <Button
                  variant={likeData.hasUserLiked ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleLike(config.type)}
                  className="w-full"
                >
                  {likeData.hasUserLiked ? `Remove ${config.label}` : `Add ${config.label}`}
                </Button>
                
                <RecentUsers type={config.type} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div 
      className={cn(
        'flex items-center gap-2',
        orientation === 'vertical' && 'flex-col items-start',
        className
      )} 
      ref={containerRef}
    >
      {likeTypes.map((config) => (
        <div 
          key={config.type}
          className={cn(
            'flex items-center',
            orientation === 'vertical' && 'w-full justify-between'
          )}
        >
          <LikeButton type={config.type} config={config} />
          <RecentUsers type={config.type} />
        </div>
      ))}
    </div>
  );
};

// Like Summary Component
export interface BlogLikeSummaryProps {
  likes: LikeData[];
  className?: string;
  variant?: 'simple' | 'detailed' | 'chart';
  showPercentages?: boolean;
  onTypeClick?: (type: string) => void;
}

export const BlogLikeSummary: React.FC<BlogLikeSummaryProps> = ({
  likes,
  className,
  variant = 'simple',
  showPercentages = false,
  onTypeClick
}) => {
  const totalLikes = likes.reduce((sum, like) => sum + like.count, 0);
  const sortedLikes = [...likes].sort((a, b) => b.count - a.count);

  const likeTypes = [
    { type: 'like', icon: ThumbsUp, label: 'Like', color: 'text-blue-500' },
    { type: 'love', icon: Heart, label: 'Love', color: 'text-red-500' },
    { type: 'star', icon: Star, label: 'Star', color: 'text-yellow-500' },
    { type: 'bookmark', icon: Bookmark, label: 'Save', color: 'text-green-500' }
  ];

  if (variant === 'simple') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        {sortedLikes.filter(like => like.count > 0).slice(0, 3).map((like) => {
          const config = likeTypes.find(t => t.type === like.type);
          if (!config) return null;

          const Icon = config.icon;
          const percentage = totalLikes > 0 ? Math.round((like.count / totalLikes) * 100) : 0;

          return (
            <Tooltip
              key={like.type}
              content={`${like.count} ${config.label}${showPercentages ? ` (${percentage}%)` : ''}`}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTypeClick?.(like.type)}
                className="flex items-center space-x-1 h-6 px-2"
              >
                <Icon className={cn('w-3 h-3', config.color)} />
                <span className="text-xs">{like.count}</span>
              </Button>
            </Tooltip>
          );
        })}
        {totalLikes > 0 && (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            · {totalLikes} total
          </span>
        )}
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div className={cn('space-y-3', className)}>
        <h4 className="font-medium text-gray-900 dark:text-gray-100">
          Reaction Summary
        </h4>
        {sortedLikes.filter(like => like.count > 0).map((like) => {
          const config = likeTypes.find(t => t.type === like.type);
          if (!config) return null;

          const Icon = config.icon;
          const percentage = totalLikes > 0 ? (like.count / totalLikes) * 100 : 0;

          return (
            <div key={like.type} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon className={cn('w-4 h-4', config.color)} />
                  <span className="text-sm font-medium">{config.label}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>{like.count}</span>
                  {showPercentages && <span>({Math.round(percentage)}%)</span>}
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  className={cn('h-2 rounded-full', config.color.replace('text-', 'bg-'))}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Detailed variant
  return (
    <div className={cn('grid grid-cols-2 gap-4', className)}>
      {sortedLikes.map((like) => {
        const config = likeTypes.find(t => t.type === like.type);
        if (!config) return null;

        const Icon = config.icon;
        const percentage = totalLikes > 0 ? Math.round((like.count / totalLikes) * 100) : 0;

        return (
          <Button
            key={like.type}
            variant="ghost"
            onClick={() => onTypeClick?.(like.type)}
            className="p-3 h-auto flex flex-col items-center space-y-2 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Icon className={cn('w-6 h-6', config.color)} />
            <div className="text-center">
              <p className="font-medium">{like.count}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {config.label}
                {showPercentages && percentage > 0 && ` (${percentage}%)`}
              </p>
            </div>
          </Button>
        );
      })}
    </div>
  );
};

export default BlogLike;
