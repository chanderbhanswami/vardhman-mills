'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bars3Icon,
  XMarkIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  HomeIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  StarIcon,
  EyeIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  InformationCircleIcon,
  CreditCardIcon,
  TruckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { 
  StarIcon as StarIconSolid,
  FireIcon as FireIconSolid
} from '@heroicons/react/24/solid';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

// Types and Interfaces
export interface SidebarItem {
  id: string;
  title: string;
  type: 'category' | 'article' | 'link' | 'divider' | 'widget';
  url?: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: {
    text: string;
    color: string;
    variant?: 'default' | 'outline' | 'solid';
  };
  children?: SidebarItem[];
  isExpanded?: boolean;
  isActive?: boolean;
  onClick?: () => void;
  metadata?: {
    views?: number;
    rating?: number;
    lastUpdated?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime?: number;
    author?: string;
  };
  featured?: boolean;
  trending?: boolean;
  disabled?: boolean;
}

export interface SidebarWidget {
  id: string;
  type: 'popular' | 'recent' | 'contact' | 'search' | 'stats' | 'custom';
  title: string;
  content?: React.ReactNode;
  data?: unknown;
  collapsible?: boolean;
  isExpanded?: boolean;
}

export interface HelpSidebarProps {
  items: SidebarItem[];
  widgets?: SidebarWidget[];
  isOpen?: boolean;
  onToggle?: () => void;
  onItemClick?: (item: SidebarItem) => void;
  activeItemId?: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  showSearch?: boolean;
  showPopular?: boolean;
  showRecent?: boolean;
  showContact?: boolean;
  showStats?: boolean;
  className?: string;
  width?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'minimal' | 'detailed';
  position?: 'left' | 'right';
  collapsible?: boolean;
  enableAnimations?: boolean;
  mobileBreakpoint?: 'sm' | 'md' | 'lg';
}

// Animation variants
const sidebarVariants = {
  open: {
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30
    }
  },
  closed: {
    x: "-100%",
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30
    }
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.2 }
  },
  hover: {
    x: 4,
    transition: { duration: 0.15 }
  }
};

const widgetVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  }
};

// Default data
const defaultItems: SidebarItem[] = [
  {
    id: 'home',
    title: 'Help Center',
    type: 'link',
    url: '/help',
    icon: HomeIcon,
    isActive: true
  },
  {
    id: 'divider-1',
    title: '',
    type: 'divider'
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    type: 'category',
    icon: InformationCircleIcon,
    badge: { text: '5', color: 'blue' },
    children: [
      {
        id: 'first-order',
        title: 'How to Place Your First Order',
        type: 'article',
        url: '/help/first-order',
        featured: true,
        metadata: {
          views: 2450,
          rating: 4.8,
          difficulty: 'beginner',
          estimatedTime: 5
        }
      },
      {
        id: 'account-setup',
        title: 'Setting Up Your Account',
        type: 'article',
        url: '/help/account-setup',
        trending: true,
        metadata: {
          views: 1890,
          rating: 4.6,
          difficulty: 'beginner',
          estimatedTime: 3
        }
      },
      {
        id: 'navigation',
        title: 'Navigating the Platform',
        type: 'article',
        url: '/help/navigation',
        metadata: {
          views: 1234,
          rating: 4.5,
          difficulty: 'beginner',
          estimatedTime: 4
        }
      }
    ]
  },
  {
    id: 'orders',
    title: 'Orders & Shopping',
    type: 'category',
    icon: CreditCardIcon,
    badge: { text: '8', color: 'green' },
    children: [
      {
        id: 'placing-orders',
        title: 'Placing Orders',
        type: 'article',
        url: '/help/placing-orders',
        metadata: {
          views: 3200,
          rating: 4.7,
          difficulty: 'beginner',
          estimatedTime: 6
        }
      },
      {
        id: 'order-tracking',
        title: 'Order Tracking',
        type: 'article',
        url: '/help/order-tracking',
        featured: true,
        metadata: {
          views: 2800,
          rating: 4.9,
          difficulty: 'beginner',
          estimatedTime: 4
        }
      },
      {
        id: 'order-changes',
        title: 'Modifying Orders',
        type: 'article',
        url: '/help/order-changes',
        metadata: {
          views: 1560,
          rating: 4.4,
          difficulty: 'intermediate',
          estimatedTime: 7
        }
      }
    ]
  },
  {
    id: 'shipping',
    title: 'Shipping & Delivery',
    type: 'category',
    icon: TruckIcon,
    badge: { text: '6', color: 'purple' },
    children: [
      {
        id: 'shipping-options',
        title: 'Shipping Options',
        type: 'article',
        url: '/help/shipping-options',
        trending: true,
        metadata: {
          views: 2100,
          rating: 4.6,
          difficulty: 'beginner',
          estimatedTime: 5
        }
      },
      {
        id: 'delivery-times',
        title: 'Delivery Timeframes',
        type: 'article',
        url: '/help/delivery-times',
        metadata: {
          views: 1800,
          rating: 4.5,
          difficulty: 'beginner',
          estimatedTime: 3
        }
      }
    ]
  },
  {
    id: 'returns',
    title: 'Returns & Refunds',
    type: 'category',
    icon: ArrowPathIcon,
    badge: { text: '4', color: 'orange' },
    children: [
      {
        id: 'return-policy',
        title: 'Return Policy',
        type: 'article',
        url: '/help/return-policy',
        featured: true,
        metadata: {
          views: 4100,
          rating: 4.8,
          difficulty: 'beginner',
          estimatedTime: 8
        }
      },
      {
        id: 'return-process',
        title: 'How to Return Items',
        type: 'article',
        url: '/help/return-process',
        metadata: {
          views: 2900,
          rating: 4.7,
          difficulty: 'intermediate',
          estimatedTime: 10
        }
      }
    ]
  },
  {
    id: 'account',
    title: 'Account & Settings',
    type: 'category',
    icon: Cog6ToothIcon,
    badge: { text: '7', color: 'indigo' },
    children: [
      {
        id: 'profile-settings',
        title: 'Profile Settings',
        type: 'article',
        url: '/help/profile-settings',
        metadata: {
          views: 1650,
          rating: 4.4,
          difficulty: 'beginner',
          estimatedTime: 5
        }
      },
      {
        id: 'privacy-security',
        title: 'Privacy & Security',
        type: 'article',
        url: '/help/privacy-security',
        metadata: {
          views: 1200,
          rating: 4.6,
          difficulty: 'intermediate',
          estimatedTime: 12
        }
      }
    ]
  },
  {
    id: 'divider-2',
    title: '',
    type: 'divider'
  },
  {
    id: 'faq',
    title: 'Frequently Asked Questions',
    type: 'link',
    url: '/help/faq',
    icon: QuestionMarkCircleIcon,
    badge: { text: 'Popular', color: 'yellow', variant: 'outline' }
  },
  {
    id: 'contact',
    title: 'Contact Support',
    type: 'link',
    url: '/help/contact',
    icon: ChatBubbleLeftRightIcon,
    badge: { text: '24/7', color: 'green', variant: 'solid' }
  }
];

const defaultWidgets: SidebarWidget[] = [
  {
    id: 'popular',
    type: 'popular',
    title: 'Most Popular',
    collapsible: true,
    isExpanded: true
  },
  {
    id: 'contact',
    type: 'contact',
    title: 'Need Help?',
    collapsible: false
  },
  {
    id: 'stats',
    type: 'stats',
    title: 'Help Stats',
    collapsible: true,
    isExpanded: false
  }
];

// Utility functions
const formatNumber = (num: number) => {
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}k`;
  return `${(num / 1000000).toFixed(1)}m`;
};

const getDifficultyColor = (difficulty: string) => {
  const colors = {
    beginner: 'text-green-600',
    intermediate: 'text-yellow-600',
    advanced: 'text-red-600'
  };
  return colors[difficulty as keyof typeof colors] || colors.beginner;
};

// Widget Components
const PopularWidget: React.FC<{ data?: unknown }> = () => {
  const popularItems = [
    {
      id: '1',
      title: 'How to place an order',
      views: 2450,
      rating: 4.8,
      trending: true
    },
    {
      id: '2',
      title: 'Shipping information',
      views: 1890,
      rating: 4.6,
      featured: true
    },
    {
      id: '3',
      title: 'Return policy',
      views: 4100,
      rating: 4.8,
      trending: false
    },
    {
      id: '4',
      title: 'Payment methods',
      views: 1650,
      rating: 4.4,
      featured: false
    }
  ];

  return (
    <div className="space-y-2">
      {popularItems.map((item, index) => (
        <div key={item.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
          <div className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded text-xs font-medium flex items-center justify-center mt-0.5">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
              {item.title}
            </h4>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <EyeIcon className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">{formatNumber(item.views)}</span>
              </div>
              <div className="flex items-center gap-1">
                <StarIcon className="h-3 w-3 text-yellow-400" />
                <span className="text-xs text-gray-500">{item.rating}</span>
              </div>
              {item.trending && (
                <Badge variant="outline" size="sm" className="text-xs bg-orange-100 text-orange-600">
                  <ArrowTrendingUpIcon className="h-2 w-2 mr-1" />
                  Hot
                </Badge>
              )}
              {item.featured && (
                <Badge variant="outline" size="sm" className="text-xs bg-purple-100 text-purple-600">
                  <FireIcon className="h-2 w-2 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const ContactWidget: React.FC<{ data?: unknown }> = () => {
  const contactOptions = [
    {
      id: 'chat',
      label: 'Live Chat',
      description: 'Get instant help',
      icon: ChatBubbleLeftRightIcon,
      available: true,
      action: 'chat'
    },
    {
      id: 'email',
      label: 'Email Support',
      description: 'support@company.com',
      icon: EnvelopeIcon,
      available: true,
      action: 'email'
    },
    {
      id: 'phone',
      label: 'Phone Support',
      description: '1-800-123-4567',
      icon: PhoneIcon,
      available: true,
      action: 'phone'
    }
  ];

  return (
    <div className="space-y-3">
      {contactOptions.map((option) => {
        const Icon = option.icon;
        return (
          <button
            key={option.id}
            className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
          >
            <Icon className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 text-sm">
                {option.label}
              </div>
              <div className="text-xs text-gray-600">
                {option.description}
              </div>
            </div>
            <ChevronRightIcon className="h-4 w-4 text-gray-400" />
          </button>
        );
      })}
    </div>
  );
};

const StatsWidget: React.FC<{ data?: unknown }> = () => {
  const stats = [
    { label: 'Total Articles', value: '247', icon: DocumentTextIcon },
    { label: 'FAQs', value: '89', icon: QuestionMarkCircleIcon },
    { label: 'Avg. Rating', value: '4.7', icon: StarIconSolid },
    { label: 'Monthly Views', value: '125k', icon: EyeIcon }
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="text-center p-3 bg-gray-50 rounded-lg">
            <Icon className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-600">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
};

// Main Component
const HelpSidebar: React.FC<HelpSidebarProps> = ({
  items = defaultItems,
  widgets = defaultWidgets,
  isOpen = true,
  onToggle,
  onItemClick,
  activeItemId,
  searchPlaceholder = "Search help articles...",
  onSearch,
  showSearch = true,
  showPopular = true,
  showContact = true,
  showStats = false,
  className,
  width = 'md',
  variant = 'default',
  position = 'left',
  collapsible = true,
  enableAnimations = true,
  mobileBreakpoint = 'md'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [expandedWidgets, setExpandedWidgets] = useState<Set<string>>(
    new Set(widgets.filter(w => w.isExpanded).map(w => w.id))
  );

  // Width classes
  const widthClasses = {
    sm: 'w-64',
    md: 'w-72',
    lg: 'w-80',
    xl: 'w-96'
  };

  // Process items to set initial expanded state
  const processedItems = useMemo(() => {
    return items.map(item => ({
      ...item,
      isExpanded: item.children ? expandedItems.has(item.id) : false,
      isActive: item.id === activeItemId
    }));
  }, [items, expandedItems, activeItemId]);

  // Handle item click
  const handleItemClick = (item: SidebarItem) => {
    if (item.disabled) return;

    if (item.children) {
      setExpandedItems(prev => {
        const newSet = new Set(prev);
        if (newSet.has(item.id)) {
          newSet.delete(item.id);
        } else {
          newSet.add(item.id);
        }
        return newSet;
      });
    }

    item.onClick?.();
    onItemClick?.(item);
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  };

  // Toggle widget expansion
  const toggleWidget = (widgetId: string) => {
    setExpandedWidgets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(widgetId)) {
        newSet.delete(widgetId);
      } else {
        newSet.add(widgetId);
      }
      return newSet;
    });
  };

  // Render sidebar item
  const renderItem = (item: SidebarItem, level = 0) => {
    if (item.type === 'divider') {
      return <div key={item.id} className="my-2 border-t border-gray-200" />;
    }

    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = item.isExpanded;
    const isActive = item.isActive;

    return (
      <div key={item.id}>
        <motion.div
          variants={enableAnimations ? itemVariants : undefined}
          whileHover={enableAnimations ? "hover" : undefined}
          onClick={() => handleItemClick(item)}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200',
            level > 0 && 'ml-6 pl-3',
            isActive 
              ? 'bg-blue-100 text-blue-900 border border-blue-200' 
              : 'hover:bg-gray-50 text-gray-700',
            item.disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {/* Icon */}
          {Icon && (
            <Icon className={cn(
              'h-5 w-5 flex-shrink-0',
              isActive ? 'text-blue-600' : 'text-gray-500'
            )} />
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className={cn(
                'font-medium truncate',
                variant === 'minimal' ? 'text-sm' : 'text-sm',
                isActive ? 'text-blue-900' : 'text-gray-900'
              )}>
                {item.title}
              </span>
              
              {/* Indicators */}
              <div className="flex items-center gap-1 ml-2">
                {item.featured && (
                  <FireIconSolid className="h-3 w-3 text-orange-500" />
                )}
                {item.trending && (
                  <ArrowTrendingUpIcon className="h-3 w-3 text-green-500" />
                )}
                {item.badge && (
                  <Badge 
                    variant={item.badge.variant === 'solid' ? 'default' : item.badge.variant || 'default'} 
                    size="sm"
                    className="text-xs"
                  >
                    {item.badge.text}
                  </Badge>
                )}
                {hasChildren && (
                  <ChevronRightIcon 
                    className={cn(
                      'h-4 w-4 text-gray-400 transition-transform',
                      isExpanded && 'rotate-90'
                    )} 
                  />
                )}
              </div>
            </div>

            {/* Metadata */}
            {variant === 'detailed' && item.metadata && level > 0 && (
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                {item.metadata.views && (
                  <div className="flex items-center gap-1">
                    <EyeIcon className="h-3 w-3" />
                    {formatNumber(item.metadata.views)}
                  </div>
                )}
                {item.metadata.rating && (
                  <div className="flex items-center gap-1">
                    <StarIcon className="h-3 w-3 text-yellow-400" />
                    {item.metadata.rating}
                  </div>
                )}
                {item.metadata.difficulty && (
                  <span className={getDifficultyColor(item.metadata.difficulty)}>
                    {item.metadata.difficulty}
                  </span>
                )}
                {item.metadata.estimatedTime && (
                  <div className="flex items-center gap-1">
                    <ClockIcon className="h-3 w-3" />
                    {item.metadata.estimatedTime}m
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Children */}
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-1 space-y-1">
                {item.children!.map(child => renderItem(child, level + 1))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Render widget
  const renderWidget = (widget: SidebarWidget) => {
    const isExpanded = expandedWidgets.has(widget.id);

    let content = widget.content;
    if (!content) {
      switch (widget.type) {
        case 'popular':
          content = <PopularWidget data={widget.data} />;
          break;
        case 'contact':
          content = <ContactWidget data={widget.data} />;
          break;
        case 'stats':
          content = <StatsWidget data={widget.data} />;
          break;
        default:
          content = <div>Widget content</div>;
      }
    }

    return (
      <motion.div
        key={widget.id}
        variants={enableAnimations ? widgetVariants : undefined}
        initial="hidden"
        animate="visible"
      >
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 text-sm">
              {widget.title}
            </h3>
            {widget.collapsible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleWidget(widget.id)}
                className="p-1 h-6 w-6"
              >
                <ChevronDownIcon 
                  className={cn(
                    'h-4 w-4 transition-transform',
                    !isExpanded && '-rotate-90'
                  )} 
                />
              </Button>
            )}
          </div>
          
          <AnimatePresence>
            {(!widget.collapsible || isExpanded) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {content}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    );
  };

  const sidebarContent = (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Help Center</h2>
        {collapsible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="p-1 h-8 w-8"
          >
            <XMarkIcon className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Search */}
      {showSearch && (
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10 text-sm"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-4 space-y-1">
          <motion.div
            variants={enableAnimations ? containerVariants : undefined}
            initial="hidden"
            animate="visible"
          >
            {processedItems.map(item => renderItem(item))}
          </motion.div>
        </nav>

        {/* Widgets */}
        {widgets.length > 0 && (
          <div className="p-4 space-y-4 border-t border-gray-200">
            {widgets.map(widget => {
              if (widget.type === 'popular' && !showPopular) return null;
              if (widget.type === 'contact' && !showContact) return null;
              if (widget.type === 'stats' && !showStats) return null;
              return renderWidget(widget);
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      {collapsible && (
        <Button
          variant="outline"
          size="sm"
          onClick={onToggle}
          className={cn(
            'fixed top-4 z-50 p-2',
            position === 'left' ? 'left-4' : 'right-4',
            `${mobileBreakpoint}:hidden`
          )}
        >
          <Bars3Icon className="h-5 w-5" />
        </Button>
      )}

      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          'hidden bg-white border-r border-gray-200',
          widthClasses[width],
          `${mobileBreakpoint}:block`,
          className
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onToggle}
              className={cn(
                'fixed inset-0 bg-black bg-opacity-50 z-40',
                `${mobileBreakpoint}:hidden`
              )}
            />
            
            {/* Sidebar */}
            <motion.aside
              variants={enableAnimations ? sidebarVariants : undefined}
              initial="closed"
              animate="open"
              exit="closed"
              className={cn(
                'fixed inset-y-0 z-50 bg-white shadow-xl',
                widthClasses[width],
                position === 'left' ? 'left-0' : 'right-0',
                `${mobileBreakpoint}:hidden`
              )}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default HelpSidebar;
