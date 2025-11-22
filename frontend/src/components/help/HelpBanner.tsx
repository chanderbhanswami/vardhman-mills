'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  ClockIcon,
  XMarkIcon,
  ChevronRightIcon,
  StarIcon,
  UserGroupIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

// Animation variants
const bannerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
  }
} as const;

// Types and Interfaces
export interface HelpBannerProps {
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  showQuickActions?: boolean;
  showStats?: boolean;
  showContactInfo?: boolean;
  className?: string;
  variant?: 'default' | 'gradient' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  enableAnimations?: boolean;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href?: string;
  onClick?: () => void;
  badge?: string;
  color: string;
}

export interface HelpStat {
  id: string;
  label: string;
  value: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
}

// Animation variants for search section
const searchContainerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
  }
} as const;

const actionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  },
  hover: {
    y: -4,
    transition: { duration: 0.2 }
  }
};

const statsVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      delay: 0.4,
      staggerChildren: 0.1
    }
  }
};

const statItemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3 }
  }
};

// Default data
const defaultQuickActions: QuickAction[] = [
  {
    id: 'faq',
    title: 'Frequently Asked Questions',
    description: 'Find quick answers to common questions',
    icon: QuestionMarkCircleIcon,
    href: '/help/faq',
    badge: 'Popular',
    color: 'blue'
  },
  {
    id: 'chat',
    title: 'Live Chat Support',
    description: 'Chat with our support team',
    icon: ChatBubbleLeftRightIcon,
    href: '/help/chat',
    badge: 'Online',
    color: 'green'
  },
  {
    id: 'phone',
    title: 'Phone Support',
    description: 'Call us for immediate assistance',
    icon: PhoneIcon,
    href: 'tel:+1-800-123-4567',
    color: 'purple'
  },
  {
    id: 'guides',
    title: 'User Guides',
    description: 'Step-by-step tutorials and guides',
    icon: CheckCircleIcon,
    href: '/help/guides',
    color: 'orange'
  }
];

const defaultStats: HelpStat[] = [
  {
    id: 'articles',
    label: 'Help Articles',
    value: '250+',
    icon: QuestionMarkCircleIcon,
    color: 'blue'
  },
  {
    id: 'response',
    label: 'Avg Response Time',
    value: '< 2 min',
    icon: ClockIcon,
    color: 'green'
  },
  {
    id: 'satisfaction',
    label: 'Customer Satisfaction',
    value: '98%',
    icon: StarIcon,
    color: 'yellow'
  },
  {
    id: 'agents',
    label: 'Support Agents',
    value: '24/7',
    icon: UserGroupIcon,
    color: 'purple'
  }
];

// Utility functions
const getColorClasses = (color: string, type: 'bg' | 'text' | 'border' = 'bg') => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50 hover:bg-blue-100',
      text: 'text-blue-600',
      border: 'border-blue-200'
    },
    green: {
      bg: 'bg-green-50 hover:bg-green-100',
      text: 'text-green-600',
      border: 'border-green-200'
    },
    purple: {
      bg: 'bg-purple-50 hover:bg-purple-100',
      text: 'text-purple-600',
      border: 'border-purple-200'
    },
    orange: {
      bg: 'bg-orange-50 hover:bg-orange-100',
      text: 'text-orange-600',
      border: 'border-orange-200'
    },
    yellow: {
      bg: 'bg-yellow-50 hover:bg-yellow-100',
      text: 'text-yellow-600',
      border: 'border-yellow-200'
    }
  };
  return colorMap[color as keyof typeof colorMap]?.[type] || colorMap.blue[type];
};

// Main Component
const HelpBanner: React.FC<HelpBannerProps> = ({
  title = "How can we help you?",
  subtitle = "Search our knowledge base or get in touch with our support team",
  searchPlaceholder = "Search for help articles, guides, or FAQs...",
  onSearch,
  showQuickActions = true,
  showStats = true,
  showContactInfo = true,
  className,
  variant = 'default',
  size = 'lg',
  enableAnimations = true
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [quickActions] = useState<QuickAction[]>(defaultQuickActions);
  const [stats] = useState<HelpStat[]>(defaultStats);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Get variant classes
  const getVariantClasses = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-0';
      case 'minimal':
        return 'bg-white border border-gray-200';
      default:
        return 'bg-gray-50 border border-gray-200';
    }
  };

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'py-8 px-6';
      case 'md':
        return 'py-12 px-8';
      case 'lg':
        return 'py-16 px-8';
      default:
        return 'py-12 px-8';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-xl',
        getVariantClasses(),
        getSizeClasses(),
        className
      )}
      variants={enableAnimations ? bannerVariants : undefined}
      initial="hidden"
      animate="visible"
    >
      {/* Background Pattern */}
      {variant === 'gradient' && (
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100" />
        </div>
      )}

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Search Bar */}
        <motion.div
          className="mb-8"
          variants={enableAnimations ? searchContainerVariants : undefined}
          initial="hidden"
          animate="visible"
        >
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={handleInputChange}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={cn(
                  'w-full pl-12 pr-12 py-4 text-lg bg-white border-2 transition-all duration-200',
                  isSearchFocused ? 'border-blue-500 shadow-lg' : 'border-gray-300 shadow-md'
                )}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
            <Button
              type="submit"
              size="lg"
              className="mt-4 px-8"
              disabled={!searchQuery.trim()}
            >
              Search Help Center
              <ChevronRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </motion.div>

        {/* Quick Actions */}
        {showQuickActions && (
          <motion.div
            className="mb-8"
            variants={enableAnimations ? { 
              hidden: { opacity: 0 },
              visible: { 
                opacity: 1,
                transition: { delay: 0.3, staggerChildren: 0.1 }
              }
            } : undefined}
            initial="hidden"
            animate="visible"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <motion.div
                    key={action.id}
                    variants={enableAnimations ? actionVariants : undefined}
                    whileHover={enableAnimations ? "hover" : undefined}
                  >
                    <Card 
                      className={cn(
                        'p-4 cursor-pointer transition-all duration-200 hover:shadow-lg border-2',
                        getColorClasses(action.color, 'bg'),
                        getColorClasses(action.color, 'border')
                      )}
                      onClick={action.onClick}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className={cn(
                          'p-3 rounded-full mb-3',
                          getColorClasses(action.color, 'bg').replace('hover:', '')
                        )}>
                          <Icon className={cn('h-6 w-6', getColorClasses(action.color, 'text'))} />
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {action.title}
                          </h4>
                          {action.badge && (
                            <Badge 
                              variant="secondary" 
                              size="sm"
                              className={cn(
                                'text-xs',
                                getColorClasses(action.color, 'text'),
                                getColorClasses(action.color, 'bg').replace('hover:', '')
                              )}
                            >
                              {action.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">
                          {action.description}
                        </p>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Stats */}
        {showStats && (
          <motion.div
            className="mb-8"
            variants={enableAnimations ? statsVariants : undefined}
            initial="hidden"
            animate="visible"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.id}
                    variants={enableAnimations ? statItemVariants : undefined}
                    className="text-center"
                  >
                    <div className={cn(
                      'inline-flex p-2 rounded-lg mb-2',
                      getColorClasses(stat.color, 'bg').replace('hover:', '')
                    )}>
                      <Icon className={cn('h-5 w-5', getColorClasses(stat.color, 'text'))} />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600">
                      {stat.label}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Contact Info */}
        {showContactInfo && (
          <motion.div
            className="text-center"
            variants={enableAnimations ? {
              hidden: { opacity: 0, y: 20 },
              visible: { 
                opacity: 1, 
                y: 0,
                transition: { delay: 0.5, duration: 0.3 }
              }
            } : undefined}
            initial="hidden"
            animate="visible"
          >
            <div className="inline-flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <ClockIcon className="h-4 w-4" />
                <span>Support available 24/7</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-gray-300" />
              <div className="flex items-center gap-1">
                <span>Current time: {formatTime(currentTime)}</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default HelpBanner;
