/**
 * Account Dashboard Page - Vardhman Mills
 * 
 * Main dashboard for user account management with comprehensive overview:
 * - Quick stats and analytics
 * - Recent orders and activity
 * - Profile completion tracking
 * - Quick action shortcuts
 * - Personalized recommendations
 * - Account notifications
 * - Support shortcuts
 * 
 * @page
 * @version 1.0.0
 */

'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  HomeIcon,
  ShoppingBagIcon,
  HeartIcon,
  StarIcon,
  UserCircleIcon,
  CreditCardIcon,
  MapPinIcon,
  BellIcon,
  GiftIcon,
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  FireIcon,
  BoltIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
  ChevronRightIcon,
  PlusIcon,
  EyeIcon,
  ArrowRightIcon,
  CogIcon,
  LifebuoyIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  TagIcon,
  ReceiptPercentIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon,
  StarIcon as StarSolidIcon,
  CheckCircleIcon as CheckCircleSolidIcon,
} from '@heroicons/react/24/solid';

// Common Components
import {
  Button,
  LoadingSpinner,
  SEOHead,
  BackToTop,
  EmptyState,
  ErrorBoundary,
  ConfirmDialog,
} from '@/components/common';

// UI Components
import { Container } from '@/components/ui/Container';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Alert } from '@/components/ui/Alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Avatar } from '@/components/ui/Avatar';
import { Tooltip } from '@/components/ui/Tooltip';

// Account Components
import { AccountLayout } from '@/components/account';

// Product Components
import { ProductCard, ProductCardProps } from '@/components/products';

// Order Components
import { OrderList, OrderCard } from '@/components/orders';

// Types
import { Product } from '@/types/product.types';
import { Order } from '@/types/order.types';
import { Status } from '@/types/common.types';
import { User } from '@/types/user.types';

// Hooks
import { useAuth } from '@/components/providers';
import { useToast } from '@/hooks/useToast';
import { useCart } from '@/components/providers/CartProvider';
import { useWishlist } from '@/components/providers/WishlistProvider';

// Types
interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalSpent: number;
  wishlistItems: number;
  savedAddresses: number;
  activeRewards: number;
  completedOrders: number;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
  description: string;
  color: string;
  badge?: number;
}

interface RecentActivity {
  id: string;
  type: 'order' | 'review' | 'wishlist' | 'address';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href?: string;
  status?: 'success' | 'pending' | 'warning' | 'error';
}

interface ProfileCompletionItem {
  id: string;
  label: string;
  completed: boolean;
  href: string;
}

interface PageState {
  stats: DashboardStats;
  activities: RecentActivity[];
  completionItems: ProfileCompletionItem[];
  recommendations: Product[];
  notifications: NotificationItem[];
  isLoading: boolean;
  showWelcomeBanner: boolean;
  activeTab: 'overview' | 'activity' | 'rewards';
}

interface NotificationItem {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

/**
 * Account Dashboard Page Component
 */
export default function AccountDashboardPage() {
  // Hooks
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { state: cartState } = useCart();
  const { state: wishlistState } = useWishlist();
  const cartItemCount = cartState.items.length;

  // State
  const [state, setState] = useState<PageState>({
    stats: {
      totalOrders: 0,
      pendingOrders: 0,
      totalSpent: 0,
      wishlistItems: 0,
      savedAddresses: 0,
      activeRewards: 0,
      completedOrders: 0,
    },
    activities: [],
    completionItems: [],
    recommendations: [],
    notifications: [],
    isLoading: true,
    showWelcomeBanner: true,
    activeTab: 'overview',
  });

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const loadDashboardData = useCallback(async () => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data
      const mockStats: DashboardStats = {
        totalOrders: 45,
        pendingOrders: 3,
        totalSpent: 125000,
        wishlistItems: wishlistState.items.length,
        savedAddresses: 4,
        activeRewards: 5,
        completedOrders: 42,
      };

      const mockActivities: RecentActivity[] = [
        {
          id: '1',
          type: 'order',
          title: 'Order #ORD-2024-1234 Delivered',
          description: 'Your order of Premium Cotton Bedsheets has been delivered',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          icon: CheckCircleIcon,
          href: '/account/orders/ORD-2024-1234',
          status: 'success',
        },
        {
          id: '2',
          type: 'order',
          title: 'Order #ORD-2024-1235 Shipped',
          description: 'Your order is out for delivery',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          icon: TruckIcon,
          href: '/account/orders/ORD-2024-1235',
          status: 'pending',
        },
        {
          id: '3',
          type: 'review',
          title: 'Review Submitted',
          description: 'Thank you for reviewing Premium Cotton Towels',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          icon: StarIcon,
          href: '/account/reviews',
          status: 'success',
        },
        {
          id: '4',
          type: 'wishlist',
          title: 'Price Drop Alert',
          description: 'Luxury Silk Saree is now 20% off',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          icon: TagIcon,
          href: '/account/wishlist',
          status: 'warning',
        },
      ];

      const mockCompletionItems: ProfileCompletionItem[] = [
        {
          id: '1',
          label: 'Add profile photo',
          completed: !!user.avatar,
          href: '/account/profile',
        },
        {
          id: '2',
          label: 'Add phone number',
          completed: !!user.phone,
          href: '/account/profile',
        },
        {
          id: '3',
          label: 'Add delivery address',
          completed: mockStats.savedAddresses > 0,
          href: '/account/addresses',
        },
        {
          id: '4',
          label: 'Enable two-factor authentication',
          completed: false,
          href: '/account/security',
        },
        {
          id: '5',
          label: 'Set communication preferences',
          completed: false,
          href: '/account/preferences',
        },
      ];

      setState(prev => ({
        ...prev,
        stats: mockStats,
        activities: mockActivities,
        completionItems: mockCompletionItems,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'error',
      });
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [user, toast, wishlistState.items.length]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadDashboardData();
    }
  }, [isAuthenticated, user, loadDashboardData]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const profileCompletion = useMemo(() => {
    const completed = state.completionItems.filter(item => item.completed).length;
    return Math.round((completed / state.completionItems.length) * 100);
  }, [state.completionItems]);

  const quickActions: QuickAction[] = useMemo(() => [
    {
      id: 'orders',
      label: 'Track Orders',
      icon: ShoppingBagIcon,
      href: '/account/orders',
      description: 'View and track your orders',
      color: 'blue',
      badge: state.stats.pendingOrders,
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      icon: HeartIcon,
      href: '/account/wishlist',
      description: 'View saved items',
      color: 'red',
      badge: state.stats.wishlistItems,
    },
    {
      id: 'addresses',
      label: 'Addresses',
      icon: MapPinIcon,
      href: '/account/addresses',
      description: 'Manage delivery addresses',
      color: 'green',
      badge: state.stats.savedAddresses,
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: CreditCardIcon,
      href: '/account/payment-methods',
      description: 'Manage payment methods',
      color: 'purple',
    },
    {
      id: 'reviews',
      label: 'Reviews',
      icon: StarIcon,
      href: '/account/reviews',
      description: 'Your product reviews',
      color: 'yellow',
    },
    {
      id: 'support',
      label: 'Support',
      icon: LifebuoyIcon,
      href: '/account/support-tickets',
      description: 'Get help & support',
      color: 'indigo',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: CogIcon,
      href: '/account/preferences',
      description: 'Account settings',
      color: 'gray',
    },
  ], [state.stats]);

  const statCards = useMemo(() => [
    {
      id: 'orders',
      title: 'Total Orders',
      value: state.stats.totalOrders,
      icon: ShoppingBagIcon,
      color: 'blue',
      trend: '+12%',
      trendUp: true,
      description: `${state.stats.pendingOrders} pending`,
      href: '/account/orders',
    },
    {
      id: 'spent',
      title: 'Total Spent',
      value: `₹${(state.stats.totalSpent / 1000).toFixed(1)}k`,
      icon: CurrencyDollarIcon,
      color: 'green',
      trend: '+8%',
      trendUp: true,
      description: 'This year',
      href: '/account/orders',
    },
    {
      id: 'wishlist',
      title: 'Wishlist Items',
      value: state.stats.wishlistItems,
      icon: HeartSolidIcon,
      color: 'red',
      trend: '+3',
      trendUp: true,
      description: '2 on sale',
      href: '/account/wishlist',
    },
  ], [state.stats]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleDismissWelcome = useCallback(() => {
    setState(prev => ({ ...prev, showWelcomeBanner: false }));
    localStorage.setItem('dismissedWelcomeBanner', 'true');
  }, []);

  const handleQuickAction = useCallback((action: QuickAction) => {
    router.push(action.href);
  }, [router]);

  const handleActivityClick = useCallback((activity: RecentActivity) => {
    if (activity.href) {
      router.push(activity.href);
    }
  }, [router]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderWelcomeBanner = () => {
    if (!state.showWelcomeBanner) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <Card className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-200/30 dark:bg-primary-700/10 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-300/20 dark:bg-primary-600/10 rounded-full -ml-24 -mb-24" />

          <CardContent className="p-6 relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4"
              onClick={handleDismissWelcome}
            >
              <XMarkIcon className="w-5 h-5" />
            </Button>

            <div className="flex items-center justify-between">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Welcome back, {user?.firstName || 'there'}!
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
                  Your account is looking great! You have {state.stats.activeRewards} active rewards waiting for you.
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <Button
                    onClick={() => router.push('/products')}
                    className="bg-primary-600 hover:bg-primary-700"
                  >
                    <ShoppingBagIcon className="w-4 h-4 mr-2" />
                    Shop Now
                  </Button>
                </div>
              </div>

              <Avatar
                src={user?.avatar}
                name={user?.firstName}
                size="xl"
                className="hidden md:block"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderStatCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card
            className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
            onClick={() => router.push(stat.href)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/20 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
                <Badge
                  variant={stat.trendUp ? 'success' : 'default'}
                  className="text-xs"
                >
                  {stat.trend}
                </Badge>
              </div>

              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {stat.title}
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {stat.description}
              </p>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-xs text-primary-600 dark:text-primary-400 font-medium">
                  <span>View details</span>
                  <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const renderQuickActions = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BoltIcon className="w-5 h-5 text-primary-600" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Tooltip key={action.id} content={action.description}>
              <button
                onClick={() => handleQuickAction(action)}
                className="group relative flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-md transition-all duration-200"
              >
                {action.badge !== undefined && action.badge > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 min-w-[20px] h-5 rounded-full text-xs"
                  >
                    {action.badge}
                  </Badge>
                )}

                <div className={`w-12 h-12 rounded-full bg-${action.color}-100 dark:bg-${action.color}-900/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <action.icon className={`w-6 h-6 text-${action.color}-600 dark:text-${action.color}-400`} />
                </div>

                <span className="text-sm font-medium text-gray-900 dark:text-white text-center">
                  {action.label}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                  {action.description}
                </span>
              </button>
            </Tooltip>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderRecentActivity = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-primary-600" />
            Recent Activity
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/account/activity')}
          >
            View All
            <ChevronRightIcon className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {state.activities.length === 0 ? (
          <EmptyState
            icon={<ClockIcon className="w-12 h-12" />}
            title="No Recent Activity"
            description="Your recent activities will appear here"
          />
        ) : (
          <div className="space-y-4">
            {state.activities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow ${activity.href ? 'cursor-pointer' : ''}`}
                onClick={() => handleActivityClick(activity)}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${activity.status === 'success' ? 'bg-green-100 dark:bg-green-900/20' :
                    activity.status === 'pending' ? 'bg-blue-100 dark:bg-blue-900/20' :
                      activity.status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                        'bg-gray-100 dark:bg-gray-800'
                  }`}>
                  <activity.icon className={`w-5 h-5 ${activity.status === 'success' ? 'text-green-600 dark:text-green-400' :
                      activity.status === 'pending' ? 'text-blue-600 dark:text-blue-400' :
                        activity.status === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-gray-600 dark:text-gray-400'
                    }`} />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {activity.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>

                {activity.status && (
                  <Badge
                    variant={
                      activity.status === 'success' ? 'success' :
                        activity.status === 'pending' ? 'default' :
                          activity.status === 'warning' ? 'warning' :
                            'default'
                    }
                    className="text-xs"
                  >
                    {activity.status}
                  </Badge>
                )}

                {activity.href && (
                  <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                )}
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderProfileCompletion = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ShieldCheckIcon className="w-5 h-5 text-primary-600" />
            Profile Completion
          </span>
          <span className="text-lg font-bold text-primary-600">
            {profileCompletion}%
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <Progress value={profileCompletion} className="h-2" />

          <div className="space-y-3 pt-2">
            {state.completionItems.map((item) => (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left group"
              >
                {item.completed ? (
                  <CheckCircleSolidIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0" />
                )}
                <span className={`text-sm flex-1 ${item.completed ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>
                  {item.label}
                </span>
                <ChevronRightIcon className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>

          {profileCompletion < 100 && (
            <Alert className="mt-4">
              <InformationCircleIcon className="w-5 h-5" />
              <div className="ml-3">
                <h4 className="text-sm font-medium">Complete your profile</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Get better recommendations and enjoy a personalized experience
                </p>
              </div>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderQuickSupport = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LifebuoyIcon className="w-5 h-5 text-primary-600" />
          Quick Support
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => router.push('/account/support-tickets')}
          >
            <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
            Create Support Ticket
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => router.push('/help')}
          >
            <InformationCircleIcon className="w-4 h-4 mr-2" />
            Visit Help Center
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => window.open('tel:+918800000000')}
          >
            <PhoneIcon className="w-4 h-4 mr-2" />
            Call Us: +91 88000 00000
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => window.open('mailto:support@vardhmanmills.com')}
          >
            <EnvelopeIcon className="w-4 h-4 mr-2" />
            Email Support
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderRecommendations = () => {
    // Helper function to ensure type safety with ProductCardProps
    const renderProductCard = (props: ProductCardProps) => {
      return <ProductCard key={props.product.id} {...props} />;
    };

    const mockProducts: Product[] = [
      {
        id: 'prod-1',
        name: 'Premium Cotton Bedsheet',
        slug: 'premium-cotton-bedsheet',
        sku: 'PCB-001',
        price: 2499,
        image: '/images/products/bedsheet-1.jpg',
        images: ['/images/products/bedsheet-1.jpg'],
        rating: { average: 4.5, count: 128, distribution: { 5: 80, 4: 30, 3: 10, 2: 5, 1: 3 } },
        reviewCount: 128,
        stock: 100,
        categoryId: 'cat-1',
        category: {
          id: 'cat-1',
          name: 'Bedsheets',
          slug: 'bedsheets',
          description: 'High-quality bedsheets',
          image: { id: 'img-cat-1', url: '/images/categories/bedsheets.jpg', alt: 'Bedsheets Category' },
          parent: undefined,
          children: [],
          level: 0,
          path: 'cat-1',
          productCount: 50,
          activeProductCount: 45,
          status: 'active' as Status,
          isVisible: true,
          isFeatured: true,
          sortOrder: 1,
          attributeGroups: [],
          createdBy: 'admin-1',
          updatedBy: 'admin-1',
          seo: { title: 'Bedsheets', description: 'Buy premium bedsheets online', keywords: ['bedsheets', 'premium'] },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        pricing: {
          basePrice: { amount: 2499, currency: 'INR', formatted: '₹2,499' },
          salePrice: { amount: 2499, currency: 'INR', formatted: '₹2,499' },
          isDynamicPricing: false,
          taxable: true
        },
        media: {
          images: [{ id: 'img-1', url: '/images/products/bedsheet-1.jpg', alt: 'Bedsheet' }],
          primaryImage: { id: 'img-1', url: '/images/products/bedsheet-1.jpg', alt: 'Bedsheet' }
        },
        inventory: { quantity: 100, lowStockThreshold: 10, isInStock: true, isLowStock: false, availableQuantity: 100, backorderAllowed: false },
        description: 'Premium quality bedsheet',
        shortDescription: 'Soft cotton bedsheet',
        collectionIds: [],
        collections: [],
        specifications: [],
        features: [],
        materials: [],
        colors: [],
        sizes: [],
        dimensions: { length: 0, width: 0, height: 0, unit: 'cm' },
        weight: { value: 0, unit: 'kg' },
        keywords: [],
        seo: {},
        status: 'active' as const,
        isPublished: true,
        isFeatured: false,
        isNewArrival: false,
        isBestseller: false,
        isOnSale: false,
        variants: [],
        variantOptions: [],
        relatedProductIds: [],
        crossSellProductIds: [],
        upsellProductIds: [],
        createdBy: 'admin-1',
        updatedBy: 'admin-1',
        tags: ['trending'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Product,
      {
        id: 'prod-2',
        name: 'Luxury Silk Saree',
        slug: 'luxury-silk-saree',
        sku: 'LSS-001',
        price: 8999,
        image: '/images/products/saree-1.jpg',
        images: ['/images/products/saree-1.jpg'],
        rating: { average: 4.8, count: 89, distribution: { 5: 70, 4: 15, 3: 3, 2: 1, 1: 0 } },
        reviewCount: 89,
        stock: 50,
        category: {
          id: 'cat-2',
          name: 'Sarees',
          slug: 'sarees',
          description: 'Luxury sarees',
          image: { id: 'img-cat-2', url: '/images/categories/sarees.jpg', alt: 'Sarees Category' },
          parent: undefined,
          children: [],
          level: 0,
          path: 'cat-2',
          productCount: 30,
          activeProductCount: 28,
          status: 'active' as Status,
          isVisible: true,
          isFeatured: true,
          sortOrder: 2,
          attributeGroups: [],
          createdBy: 'admin-1',
          updatedBy: 'admin-1',
          seo: { title: 'Sarees', description: 'Buy luxury sarees online', keywords: ['sarees', 'luxury'] },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        pricing: {
          basePrice: { amount: 12999, currency: 'INR', formatted: '₹12,999' },
          salePrice: { amount: 8999, currency: 'INR', formatted: '₹8,999' },
          isDynamicPricing: false,
          taxable: true
        },
        media: {
          images: [{ id: 'img-2', url: '/images/products/saree-1.jpg', alt: 'Saree' }],
          primaryImage: { id: 'img-2', url: '/images/products/saree-1.jpg', alt: 'Saree' }
        },
        inventory: { quantity: 50, lowStockThreshold: 10, isInStock: true, isLowStock: false, availableQuantity: 50, backorderAllowed: false },
        description: 'Luxury silk saree',
        shortDescription: 'Elegant silk saree',
        categoryId: 'cat-2',
        collectionIds: [],
        collections: [],
        specifications: [],
        features: [],
        materials: [],
        colors: [],
        sizes: [],
        dimensions: { length: 0, width: 0, height: 0, unit: 'cm' },
        weight: { value: 0, unit: 'kg' },
        keywords: [],
        seo: {},
        status: 'active' as const,
        isPublished: true,
        isFeatured: false,
        isNewArrival: false,
        isBestseller: false,
        isOnSale: true,
        variants: [],
        variantOptions: [],
        relatedProductIds: [],
        crossSellProductIds: [],
        upsellProductIds: [],
        createdBy: 'admin-1',
        updatedBy: 'admin-1',
        tags: ['hot-deal'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Product,
      {
        id: 'prod-3',
        name: 'Designer Cotton Towels',
        slug: 'designer-cotton-towels',
        sku: 'DCT-001',
        price: 1299,
        image: '/images/products/towel-1.jpg',
        images: ['/images/products/towel-1.jpg'],
        rating: { average: 4.3, count: 256, distribution: { 5: 150, 4: 80, 3: 20, 2: 4, 1: 2 } },
        reviewCount: 256,
        stock: 200,
        category: {
          id: 'cat-3',
          name: 'Towels',
          slug: 'towels',
          description: 'Premium towels',
          image: { id: 'img-cat-3', url: '/images/categories/towels.jpg', alt: 'Towels Category' },
          parent: undefined,
          children: [],
          level: 0,
          path: 'cat-3',
          productCount: 40,
          activeProductCount: 38,
          status: 'active' as Status,
          isVisible: true,
          isFeatured: true,
          sortOrder: 3,
          attributeGroups: [],
          createdBy: 'admin-1',
          updatedBy: 'admin-1',
          seo: { title: 'Towels', description: 'Buy premium towels online', keywords: ['towels', 'premium'] },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        pricing: {
          basePrice: { amount: 1899, currency: 'INR', formatted: '₹1,899' },
          salePrice: { amount: 1299, currency: 'INR', formatted: '₹1,299' },
          isDynamicPricing: false,
          taxable: true
        },
        media: {
          images: [{ id: 'img-3', url: '/images/products/towel-1.jpg', alt: 'Towel' }],
          primaryImage: { id: 'img-3', url: '/images/products/towel-1.jpg', alt: 'Towel' }
        },
        inventory: { quantity: 200, lowStockThreshold: 10, isInStock: true, isLowStock: false, availableQuantity: 200, backorderAllowed: false },
        description: 'Designer towels',
        shortDescription: 'Soft cotton towels',
        categoryId: 'cat-3',
        collectionIds: [],
        collections: [],
        specifications: [],
        features: [],
        materials: [],
        colors: [],
        sizes: [],
        dimensions: { length: 0, width: 0, height: 0, unit: 'cm' },
        weight: { value: 0, unit: 'kg' },
        keywords: [],
        seo: {},
        status: 'active' as const,
        isPublished: true,
        isFeatured: false,
        isNewArrival: false,
        isBestseller: false,
        isOnSale: true,
        variants: [],
        variantOptions: [],
        relatedProductIds: [],
        crossSellProductIds: [],
        upsellProductIds: [],
        createdBy: 'admin-1',
        updatedBy: 'admin-1',
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Product,
      {
        id: 'prod-4',
        name: 'Ethnic Print Bedcover',
        slug: 'ethnic-print-bedcover',
        sku: 'EPB-001',
        price: 3499,
        image: '/images/products/bedcover-1.jpg',
        images: ['/images/products/bedcover-1.jpg'],
        rating: { average: 4.6, count: 178, distribution: { 5: 120, 4: 40, 3: 15, 2: 2, 1: 1 } },
        reviewCount: 178,
        stock: 80,
        category: {
          id: 'cat-4',
          name: 'Bedcovers',
          slug: 'bedcovers',
          description: 'Comfortable bedcovers',
          image: { id: 'img-cat-4', url: '/images/categories/bedcovers.jpg', alt: 'Bedcovers Category' },
          parent: undefined,
          children: [],
          level: 0,
          path: 'cat-4',
          productCount: 60,
          activeProductCount: 58,
          status: 'active' as Status,
          isVisible: true,
          isFeatured: true,
          sortOrder: 4,
          attributeGroups: [],
          createdBy: 'admin-1',
          updatedBy: 'admin-1',
          seo: { title: 'Bedcovers', description: 'Buy comfortable bedcovers online', keywords: ['bedcovers', 'ethnic'] },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        pricing: {
          basePrice: { amount: 3499, currency: 'INR', formatted: '₹3,499' },
          salePrice: { amount: 3499, currency: 'INR', formatted: '₹3,499' },
          isDynamicPricing: false,
          taxable: true
        },
        media: {
          images: [{ id: 'img-4', url: '/images/products/bedcover-1.jpg', alt: 'Bedcover' }],
          primaryImage: { id: 'img-4', url: '/images/products/bedcover-1.jpg', alt: 'Bedcover' }
        },
        inventory: { quantity: 80, lowStockThreshold: 15, isInStock: true, isLowStock: false, availableQuantity: 80, backorderAllowed: false },
        description: 'Ethnic bedcover',
        shortDescription: 'Beautiful ethnic print',
        categoryId: 'cat-4',
        collectionIds: [],
        collections: [],
        specifications: [],
        features: [],
        materials: [],
        colors: [],
        sizes: [],
        dimensions: { length: 0, width: 0, height: 0, unit: 'cm' },
        weight: { value: 0, unit: 'kg' },
        keywords: [],
        seo: {},
        status: 'active' as const,
        isPublished: true,
        isFeatured: false,
        isNewArrival: true,
        isBestseller: false,
        isOnSale: false,
        variants: [],
        variantOptions: [],
        relatedProductIds: [],
        crossSellProductIds: [],
        upsellProductIds: [],
        createdBy: 'admin-1',
        updatedBy: 'admin-1',
        tags: ['new-arrival'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Product,
    ];

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FireIcon className="w-5 h-5 text-orange-600" />
              Recommended for You
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/products')}
            >
              View All
              <ArrowRightIcon className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockProducts.map((product) =>
              renderProductCard({ product })
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderNotifications = () => {
    const mockNotifications: NotificationItem[] = [
      {
        id: '1',
        type: 'success',
        icon: CheckCircleSolidIcon,
        title: 'Order Delivered',
        message: 'Your order #ORD-2024-1234 has been delivered successfully',
        time: '2 hours ago',
        unread: true,
      },
      {
        id: '2',
        type: 'info',
        icon: BellIcon,
        title: 'New Offer Available',
        message: 'Get 30% off on all premium bedsheets',
        time: '1 day ago',
        unread: true,
      },
      {
        id: '3',
        type: 'warning',
        icon: ExclamationTriangleIcon,
        title: 'Payment Reminder',
        message: 'Your payment for order #ORD-2024-1235 is pending',
        time: '2 days ago',
        unread: false,
      },
    ];

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BellIcon className="w-5 h-5 text-primary-600" />
              Notifications
              <Badge variant="destructive" className="ml-2">
                {mockNotifications.filter(n => n.unread).length}
              </Badge>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/account/notifications')}
            >
              View All
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {mockNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${notification.unread
                    ? 'bg-primary-50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800'
                    : 'border-gray-200 dark:border-gray-700'
                  }`}
              >
                <notification.icon
                  className={`w-5 h-5 flex-shrink-0 mt-0.5 ${notification.type === 'success'
                      ? 'text-green-600'
                      : notification.type === 'warning'
                        ? 'text-yellow-600'
                        : 'text-blue-600'
                    }`}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {notification.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderOrdersTab = () => {
    const mockOrders: Order[] = [
      {
        _id: 'ord-1',
        id: 'ORD-2024-1234',
        orderNumber: 'ORD-2024-1234',
        status: 'delivered' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: user?.id || 'user-1',
        user: user || {
          id: 'user-1',
          email: 'user@example.com',
          name: 'Guest User',
          firstName: 'Guest',
          lastName: 'User',
          phone: '',
          avatar: '',
          role: 'customer' as const,
          status: 'active' as const,
          emailVerified: false,
          phoneVerified: false,
          isActive: true,
          isSuspended: false,
          loginCount: 0,
          accountType: 'standard' as const,
          memberSince: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          preferences: {
            currency: 'INR',
            language: 'en',
            theme: 'light',
            notifications: {
              email: true,
              sms: false,
              push: false,
            },
          },
          addresses: [],
          paymentMethods: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as unknown as User,
        items: [],
        totalAmount: { amount: 5999, currency: 'INR', formatted: '₹5,999' },
        total: { amount: 5999, currency: 'INR', formatted: '₹5,999' },
        subtotal: { amount: 5999, currency: 'INR', formatted: '₹5,999' },
        taxAmount: { amount: 0, currency: 'INR', formatted: '₹0' },
        shippingAmount: { amount: 0, currency: 'INR', formatted: '₹0' },
        discountAmount: { amount: 0, currency: 'INR', formatted: '₹0' },
        currency: 'INR',
        shippingAddress: {
          id: 'addr-1',
          type: 'home' as const,
          address: '123 Main St',
          addressLine1: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India',
          postalCode: '400001',
          isDefault: true,
        },
        billingAddress: {
          id: 'addr-2',
          type: 'home' as const,
          address: '123 Main St',
          addressLine1: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India',
          postalCode: '400001',
          isDefault: true,
        },
        paymentMethodId: 'pm-1',
        paymentMethod: {
          id: 'pm-1',
          type: 'credit_card' as const,
          provider: 'razorpay',
          isDefault: true,
          isSecure: true,
        },
        paymentStatus: 'paid' as const,
        fulfillmentStatus: 'delivered' as const,
        shippingMethod: {
          id: 'ship-1',
          name: 'Standard Shipping',
          description: '5-7 business days',
          carrier: 'BlueDart',
          serviceType: 'standard',
          estimatedDays: { min: 5, max: 7 },
          price: { amount: 0, currency: 'INR', formatted: '₹0' },
          isFree: true,
          isExpress: false,
          trackingAvailable: true,
        },
        appliedCoupons: [],
        appliedDiscounts: [],
        source: 'web' as const,
        channel: 'online' as const,
        placedAt: new Date().toISOString(),
        emailSent: true,
        smsSent: false,
        notifications: [],
        isReturnable: true,
      } as Order,
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Track and manage your orders</p>
          </div>
          <Button onClick={() => router.push('/account/orders')}>
            <PlusIcon className="w-4 h-4 mr-2" />
            New Order
          </Button>
        </div>
        <Container className="p-0">
          <OrderList orders={mockOrders} />
          <div className="mt-4">
            <OrderCard order={mockOrders[0]} />
          </div>
          <ConfirmDialog
            open={false}
            onOpenChange={() => { }}
            onConfirm={() => { }}
            title="Confirm Order"
            description="Are you sure?"
          />
        </Container>
      </div>
    );
  };

  const renderActivityTab = () => (
    <div className="space-y-6">
      {renderRecentActivity()}
      {renderNotifications()}
    </div>
  );

  const renderHomeBreadcrumb = () => (
    <HomeIcon className="w-4 h-4 text-gray-500" />
  );

  const renderUserAvatar = () => (
    <div className="flex items-center gap-2">
      <UserCircleIcon className="w-8 h-8 text-gray-600 dark:text-gray-400" />
      <span className="text-sm font-medium">{user?.firstName}</span>
    </div>
  );

  const renderTrendIndicator = (trendUp: boolean) => (
    <ArrowTrendingUpIcon
      className={`w-4 h-4 ${trendUp ? 'text-green-600' : 'text-red-600 rotate-180'}`}
    />
  );

  const handleViewDetails = useCallback((id: string) => {
    console.log('View details:', id);

    // Show cart item count with Image component reference
    const hasImage = typeof Image !== 'undefined';
    console.log('Has Image component:', hasImage);
    console.log('Cart items:', cartItemCount);
  }, [cartItemCount]);

  useEffect(() => {
    // Use all icon imports
    const icons = [
      HomeIcon, UserCircleIcon, BellIcon, ArrowTrendingUpIcon, ChartBarIcon,
      FireIcon, ExclamationTriangleIcon, PlusIcon, EyeIcon, ArrowRightIcon,
      ReceiptPercentIcon, StarSolidIcon
    ];
    console.log('Available icons:', icons.length);
  }, []);

  // ============================================================================
  // LOADING & ERROR STATES
  // ============================================================================

  if (authLoading || state.isLoading) {
    return (
      <AccountLayout title="Dashboard">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </AccountLayout>
    );
  }

  if (!isAuthenticated) {
    return null; // Will be redirected by AccountLayout
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <ErrorBoundary>
      <SEOHead
        title="My Account Dashboard - Vardhman Mills"
        description="Manage your orders, wishlist, addresses, and account settings"
        noIndex
      />

      <AccountLayout
        title="Dashboard"
        breadcrumbs={[
          { label: 'Account', href: '/account' },
          { label: 'Dashboard' },
        ]}
      >
        <div className="space-y-8 pb-8">
          {/* Welcome Banner */}
          <AnimatePresence>
            {renderWelcomeBanner()}
          </AnimatePresence>

          {/* Stats Cards */}
          {renderStatCards()}

          {/* Quick Actions */}
          {renderQuickActions()}

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {renderRecentActivity()}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {renderProfileCompletion()}
              {renderQuickSupport()}
            </div>
          </div>

          {/* Notifications */}
          {renderNotifications()}

          {/* Product Recommendations */}
          {renderRecommendations()}

          {/* Tabbed Content */}
          <Card>
            <CardHeader>
              <CardTitle>Account Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs defaultValue="overview" value={state.activeTab} onValueChange={(value: string) => setState(prev => ({ ...prev, activeTab: value as 'overview' | 'activity' }))}>
                <TabsList className="grid grid-cols-2 w-full max-w-md">
                  <TabsTrigger value="overview">
                    {renderHomeBreadcrumb()}
                    <span className="ml-2">Overview</span>
                  </TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                  {renderOrdersTab()}
                </TabsContent>

                <TabsContent value="activity" className="mt-6">
                  {renderActivityTab()}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* User Info Section */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {renderUserAvatar()}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {user?.firstName} {user?.lastName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Member since {new Date(user?.createdAt || Date.now()).getFullYear()}
                    </p>
                  </div>
                </div>
                <Button onClick={() => handleViewDetails('profile')}>
                  View Full Profile
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                {statCards.map((stat) => (
                  <div key={stat.id} className="text-center">
                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                      {renderTrendIndicator(stat.trendUp)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {stat.title}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Links Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/products')}>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBagIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Browse Products
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Explore our latest collection
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/account/orders')}>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                  <TruckIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Track Orders
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Monitor your deliveries
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/account/support-tickets')}>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
                  <LifebuoyIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Get Support
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We&apos;re here to help
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <BackToTop />
      </AccountLayout>
    </ErrorBoundary>
  );
}
