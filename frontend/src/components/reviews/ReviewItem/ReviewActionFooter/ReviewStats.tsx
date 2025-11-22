'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp,
  Eye,
  MessageCircle,
  Heart,
  Share2,
  Star,
  Clock,
  Calendar,
  BarChart3,
  Activity,
  Target,
  Zap,
  Award,
  Bookmark,
  Download,
  Percent
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { Progress } from '@/components/ui/Progress';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';

// Types
export interface StatsData {
  views: number;
  likes: number;
  dislikes: number;
  replies: number;
  shares: number;
  bookmarks: number;
  downloads: number;
  rating: number;
  maxRating: number;
  helpfulVotes: number;
  totalVotes: number;
  viewDuration: number; // in seconds
  engagementRate: number; // percentage
  createdAt: string;
  lastActivity: string;
  trending?: boolean;
  featured?: boolean;
  verified?: boolean;
}

export interface ReviewStatsProps {
  reviewId: string;
  stats: StatsData;
  
  // Appearance
  layout?: 'horizontal' | 'vertical' | 'grid' | 'compact';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'detailed' | 'card';
  showIcons?: boolean;
  showLabels?: boolean;
  showTooltips?: boolean;
  showTrending?: boolean;
  showBadges?: boolean;
  className?: string;
  
  // Behavior
  interactive?: boolean;
  enableAnimation?: boolean;
  enableHover?: boolean;
  clickableStats?: string[];
  
  // Display options
  visibleStats?: string[];
  priorityStats?: string[];
  compactThreshold?: number;
  abbreviateNumbers?: boolean;
  showPercentages?: boolean;
  showComparisons?: boolean;
  
  // Real-time updates
  enableRealTime?: boolean;
  updateInterval?: number;
  
  // Callbacks
  onStatClick?: (statType: string, value: number) => void;
  onStatsUpdate?: (stats: StatsData) => void;
  onTrendingClick?: () => void;
  onDetailsClick?: () => void;
  
  // Modal settings
  enableModal?: boolean;
  modalTitle?: string;
  modalSize?: 'sm' | 'md' | 'lg' | 'xl';
  
  // API
  apiEndpoint?: string;
  
  // Customization
  customStats?: Array<{
    key: string;
    label: string;
    value: number;
    icon: React.ReactNode;
    color?: string;
    format?: (value: number) => string;
  }>;
  
  // Comparison data
  previousStats?: Partial<StatsData>;
  averageStats?: Partial<StatsData>;
  industryStats?: Partial<StatsData>;
}

// Format numbers for display
const formatNumber = (num: number, abbreviate: boolean = true): string => {
  if (!abbreviate) return num.toLocaleString();
  
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

// Calculate percentage change
const calculateChange = (current: number, previous: number): { value: number; isPositive: boolean } => {
  if (previous === 0) return { value: 0, isPositive: true };
  const change = ((current - previous) / previous) * 100;
  return { value: Math.abs(change), isPositive: change >= 0 };
};

// Format duration
const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h`;
};

// Get time ago
const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

const ReviewStats: React.FC<ReviewStatsProps> = ({
  reviewId,
  stats,
  layout = 'horizontal',
  size = 'md',
  variant = 'default',
  showIcons = true,
  showLabels = true,
  showTooltips = true,
  showTrending = true,
  showBadges = true,
  className,
  interactive = true,
  enableAnimation = true,
  enableHover = true,
  clickableStats = ['views', 'likes', 'replies'],
  visibleStats = ['views', 'likes', 'replies', 'shares', 'rating'],
  compactThreshold = 5,
  abbreviateNumbers = true,
  showPercentages = false,
  showComparisons = false,
  enableRealTime = false,
  updateInterval = 30000,
  onStatClick,
  onStatsUpdate,
  onTrendingClick,
  enableModal = false,
  modalTitle = 'Review Statistics',
  modalSize = 'lg',
  apiEndpoint = '/api/reviews/stats',
  customStats = [],
  previousStats
}) => {
  const [showModal, setShowModal] = useState(false);
  const [realtimeStats, setRealtimeStats] = useState(stats);
  const [isUpdating, setIsUpdating] = useState(false);

  // Real-time updates
  React.useEffect(() => {
    if (!enableRealTime) return;

    const interval = setInterval(async () => {
      try {
        setIsUpdating(true);
        const response = await fetch(`${apiEndpoint}/${reviewId}`);
        if (response.ok) {
          const newStats = await response.json();
          setRealtimeStats(newStats);
          onStatsUpdate?.(newStats);
        }
      } catch (error) {
        console.error('Failed to update stats:', error);
      } finally {
        setIsUpdating(false);
      }
    }, updateInterval);

    return () => clearInterval(interval);
  }, [reviewId, enableRealTime, updateInterval, apiEndpoint, onStatsUpdate]);

  const currentStats = enableRealTime ? realtimeStats : stats;

  // Define stat configurations
  const statConfigs = {
    views: {
      label: 'Views',
      icon: <Eye className="w-4 h-4" />,
      color: 'text-blue-600',
      tooltip: 'Total number of views'
    },
    likes: {
      label: 'Likes',
      icon: <Heart className="w-4 h-4" />,
      color: 'text-red-500',
      tooltip: 'Number of likes received'
    },
    replies: {
      label: 'Replies',
      icon: <MessageCircle className="w-4 h-4" />,
      color: 'text-green-600',
      tooltip: 'Number of replies'
    },
    shares: {
      label: 'Shares',
      icon: <Share2 className="w-4 h-4" />,
      color: 'text-purple-600',
      tooltip: 'Times shared'
    },
    bookmarks: {
      label: 'Bookmarks',
      icon: <Bookmark className="w-4 h-4" />,
      color: 'text-yellow-600',
      tooltip: 'Times bookmarked'
    },
    downloads: {
      label: 'Downloads',
      icon: <Download className="w-4 h-4" />,
      color: 'text-gray-600',
      tooltip: 'Number of downloads'
    },
    rating: {
      label: 'Rating',
      icon: <Star className="w-4 h-4" />,
      color: 'text-yellow-500',
      tooltip: `${currentStats.rating}/${currentStats.maxRating} stars`,
      format: (value: number) => `${value.toFixed(1)}★`
    },
    helpfulVotes: {
      label: 'Helpful',
      icon: <Target className="w-4 h-4" />,
      color: 'text-green-500',
      tooltip: `${currentStats.helpfulVotes}/${currentStats.totalVotes} found helpful`,
      format: (value: number) => showPercentages && currentStats.totalVotes > 0 
        ? `${Math.round((value / currentStats.totalVotes) * 100)}%`
        : formatNumber(value, abbreviateNumbers)
    },
    engagementRate: {
      label: 'Engagement',
      icon: <Activity className="w-4 h-4" />,
      color: 'text-blue-500',
      tooltip: 'Engagement rate percentage',
      format: (value: number) => `${value.toFixed(1)}%`
    },
    viewDuration: {
      label: 'Avg. Time',
      icon: <Clock className="w-4 h-4" />,
      color: 'text-gray-500',
      tooltip: 'Average viewing duration',
      format: (value: number) => formatDuration(value)
    }
  };

  // Handle stat click
  const handleStatClick = (statType: string, value: number) => {
    if (!interactive || !clickableStats.includes(statType)) return;
    onStatClick?.(statType, value);
  };

  // Get stat value
  const getStatValue = (statType: string): number => {
    return currentStats[statType as keyof StatsData] as number ?? 0;
  };

  // Render individual stat
  const renderStat = (statType: string, config: {
    label: string;
    icon: React.ReactNode;
    color: string;
    tooltip: string;
    format?: (value: number) => string;
  }) => {
    const value = getStatValue(statType);
    const formattedValue = config.format ? config.format(value) : formatNumber(value, abbreviateNumbers);
    const isClickable = interactive && clickableStats.includes(statType);
    const change = previousStats ? calculateChange(value, Number(previousStats[statType as keyof StatsData]) ?? 0) : null;

    const statElement = (
      <motion.div
        whileHover={enableHover && isClickable ? { scale: 1.05 } : {}}
        whileTap={isClickable ? { scale: 0.95 } : {}}
        className={cn(
          "flex items-center gap-2 p-2 rounded-lg transition-all duration-200",
          isClickable && "cursor-pointer hover:bg-gray-50",
          layout === 'vertical' && "flex-col text-center",
          size === 'sm' && "p-1 gap-1",
          size === 'lg' && "p-3 gap-3"
        )}
        onClick={() => isClickable && handleStatClick(statType, value)}
      >
        {showIcons && (
          <span className={cn(config.color, size === 'sm' && "text-sm")}>
            {config.icon}
          </span>
        )}
        
        <div className={cn(
          "flex flex-col",
          layout === 'horizontal' && "items-start",
          layout === 'vertical' && "items-center"
        )}>
          <span className={cn(
            "font-semibold",
            size === 'sm' && "text-sm",
            size === 'lg' && "text-lg"
          )}>
            {formattedValue}
          </span>
          
          {showLabels && (
            <span className={cn(
              "text-gray-600",
              size === 'sm' && "text-xs",
              size === 'lg' && "text-sm"
            )}>
              {config.label}
            </span>
          )}
          
          {showComparisons && change && (
            <span className={cn(
              "text-xs flex items-center gap-1",
              change.isPositive ? "text-green-600" : "text-red-600"
            )}>
              <TrendingUp className={cn(
                "w-3 h-3",
                !change.isPositive && "rotate-180"
              )} />
              {change.value.toFixed(1)}%
            </span>
          )}
        </div>
      </motion.div>
    );

    return showTooltips ? (
      <Tooltip key={statType} content={config.tooltip}>
        {statElement}
      </Tooltip>
    ) : (
      <div key={statType}>{statElement}</div>
    );
  };

  // Render stats container
  const renderStats = () => {
    const statsToShow = visibleStats.filter(stat => stat in statConfigs);
    const isCompact = statsToShow.length > compactThreshold;

    return (
      <div className={cn(
        "flex gap-2",
        layout === 'horizontal' && "flex-row flex-wrap",
        layout === 'vertical' && "flex-col",
        layout === 'grid' && "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3",
        layout === 'compact' && "flex-row space-x-1",
        isCompact && layout === 'horizontal' && "space-x-1"
      )}>
        {statsToShow.map(statType => {
          const config = statConfigs[statType as keyof typeof statConfigs];
          return config ? renderStat(statType, config) : null;
        })}
        
        {customStats.map(customStat => (
          <div key={customStat.key} className="flex items-center gap-2 p-2">
            <span className={customStat.color || 'text-gray-600'}>
              {customStat.icon}
            </span>
            <div>
              <span className="font-semibold">
                {customStat.format ? customStat.format(customStat.value) : formatNumber(customStat.value, abbreviateNumbers)}
              </span>
              {showLabels && (
                <span className="text-gray-600 text-sm ml-1">{customStat.label}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render badges
  const renderBadges = () => {
    if (!showBadges) return null;

    return (
      <div className="flex gap-2 flex-wrap">
        {currentStats.trending && showTrending && (
          <Badge 
            variant="destructive" 
            className="cursor-pointer"
            onClick={onTrendingClick}
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            Trending
          </Badge>
        )}
        
        {currentStats.featured && (
          <Badge variant="secondary">
            <Award className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        )}
        
        {currentStats.verified && (
          <Badge variant="success">
            <Zap className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        )}
        
        {currentStats.engagementRate > 75 && (
          <Badge variant="warning">
            <Percent className="w-3 h-3 mr-1" />
            High Engagement
          </Badge>
        )}
      </div>
    );
  };

  // Render detailed modal
  const renderModal = () => {
    if (!enableModal || !showModal) return null;

    return (
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        className={cn(
          modalSize === 'sm' && 'max-w-md',
          modalSize === 'md' && 'max-w-lg',
          modalSize === 'lg' && 'max-w-2xl',
          modalSize === 'xl' && 'max-w-4xl'
        )}
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">{modalTitle}</h2>
          
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(statConfigs).map(([statType, config]) => (
                <Card key={statType} className="p-4 text-center">
                  <div className={cn("mb-2", config.color)}>
                    {config.icon}
                  </div>
                  <div className="text-2xl font-bold">
                    {'format' in config && config.format
                      ? config.format(getStatValue(statType))
                      : formatNumber(getStatValue(statType), false)
                    }
                  </div>
                  <div className="text-sm text-gray-600">{config.label}</div>
                </Card>
              ))}
            </div>

            {/* Engagement Metrics */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Engagement Metrics</h3>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Helpfulness Rating</span>
                    <span>{Math.round((currentStats.helpfulVotes / currentStats.totalVotes) * 100)}%</span>
                  </div>
                  <Progress 
                    value={(currentStats.helpfulVotes / currentStats.totalVotes) * 100} 
                    className="h-2"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Overall Engagement</span>
                    <span>{currentStats.engagementRate}%</span>
                  </div>
                  <Progress value={currentStats.engagementRate} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Star Rating</span>
                    <span>{((currentStats.rating / currentStats.maxRating) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={(currentStats.rating / currentStats.maxRating) * 100} 
                    className="h-2"
                  />
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Timeline</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Created: {getTimeAgo(currentStats.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>Last Activity: {getTimeAgo(currentStats.lastActivity)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Avg. View Duration: {formatDuration(currentStats.viewDuration)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  };

  const containerClass = cn(
    "relative",
    variant === 'card' && "p-4 bg-white rounded-lg border",
    variant === 'minimal' && "p-2",
    variant === 'detailed' && "p-4 space-y-3",
    enableAnimation && isUpdating && "opacity-75 transition-opacity",
    className
  );

  return (
    <>
      <div className={containerClass}>
        {/* Badges */}
        {renderBadges()}
        
        {/* Stats */}
        <div className={cn(showBadges && "mt-3")}>
          {renderStats()}
        </div>
        
        {/* Details Button */}
        {enableModal && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowModal(true)}
            className="mt-2"
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            View Details
          </Button>
        )}
        
        {/* Real-time indicator */}
        {enableRealTime && isUpdating && (
          <div className="absolute top-2 right-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Activity className="w-4 h-4 text-blue-500" />
            </motion.div>
          </div>
        )}
      </div>
      
      {renderModal()}
    </>
  );
};

export default ReviewStats;