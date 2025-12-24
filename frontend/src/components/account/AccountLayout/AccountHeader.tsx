/**
 * AccountHeader Component
 * 
 * Header component for account pages with user information,
 * quick actions, and navigation breadcrumbs.
 * 
 * Features:
 * - User profile display
 * - Quick actions menu
 * - Notification indicators
 * - Breadcrumb navigation
 * - Search functionality
 * - Mobile responsive design
 * - Settings dropdown
 * - Logout functionality
 * 
 * @component
 */

'use client';

import React, { useState, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserProfile } from '@/types/user.types';
import type { Notification } from '@/types/notification.types';
import {
  BellIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  UserIcon,
  HeartIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  MapPinIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  BellIcon as BellSolidIcon,
} from '@heroicons/react/24/solid';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { SearchModal } from '@/components/common/SearchModal';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';
import { useClickOutside } from '@/hooks/common/useClickOutside';
import { useMediaQuery } from '@/hooks/common/useMediaQuery';
import { useLocalStorage } from '@/hooks/localStorage/useLocalStorage';
import { ACCOUNT_ROUTES } from '@/constants/routes.constants';
import { useAuth } from '@/components/providers';
import { useCart } from '@/components/providers/CartProvider';
import { useWishlist } from '@/components/providers/WishlistProvider';
import { useNotification } from '@/hooks/notification/useNotification';
import { selectUserProfile } from '@/store/slices/userSlice';
import { clearUser } from '@/store/slices/userSlice';
import { clearCart } from '@/store/slices/cartSlice';
import toast from 'react-hot-toast';

// Types
export interface AccountHeaderProps {
  /** Page title for breadcrumb */
  title?: string;
  /** Additional breadcrumb items */
  breadcrumbs?: Array<{
    label: string;
    href?: string;
    icon?: React.ComponentType<{ className?: string }>;
  }>;
  /** Show search functionality */
  showSearch?: boolean;
  /** Custom actions */
  actions?: React.ReactNode;
  /** Header variant */
  variant?: 'default' | 'compact' | 'minimal';
  /** Additional CSS classes */
  className?: string;
}

interface QuickAction {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  isActive?: boolean;
}

interface UserMenuAction {
  id: string;
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: () => void;
  variant?: 'default' | 'danger';
  divider?: boolean;
}

export const AccountHeader: React.FC<AccountHeaderProps> = ({
  title,
  breadcrumbs = [],
  showSearch = true,
  actions,
  variant = 'default',
  className,
}) => {
  // Hooks
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const cartContext = useCart();
  const wishlistContext = useWishlist();
  const notificationHook = useNotification({
    enableBadge: true,
    persistToStorage: true,
    enableBrowserNotifications: false,
    position: 'top-right',
  });
  const {
    notifications: allNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = notificationHook;

  // Filter notifications to show only relevant ones (not toast notifications)
  const notifications = useMemo(() =>
    allNotifications
      .filter(n => n.category !== 'toast')
      .slice(0, 10),
    [allNotifications]
  );

  // Convert StoredNotification to Notification type for NotificationPanel
  const displayNotifications: Notification[] = useMemo(() =>
    notifications.map(notif => ({
      id: notif.id,
      title: notif.title || 'Notification',
      message: notif.message,
      type: (notif.type === 'success' ? 'order_update' :
        notif.type === 'error' ? 'system_alert' :
          notif.type === 'warning' ? 'account_security' :
            notif.type === 'info' ? 'announcement' : 'system_alert'),
      category: 'transactional',
      priority: notif.priority || 'normal',
      channels: ['in_app'],
      content: {
        title: notif.title || 'Notification',
        body: notif.message,
        actions: notif.actions?.map(a => ({
          id: a.label,
          label: a.label,
          type: 'navigate',
          url: '',
          style: a.style || 'primary',
        })) || [],
      },
      tracking: {
        readAt: notif.readAt?.toISOString(),
        opened: notif.isRead,
        clicked: false,
        actionsPerformed: [],
        engagement: {
          views: 0,
          clicks: 0,
          shares: 0,
          timeSpent: 0,
        },
      },
      status: 'sent',
      deliveryStatus: {
        overall: 'delivered',
        channels: [],
        attempts: 1,
      },
      deliveryConfig: {
        channels: [{
          channel: 'in_app',
          enabled: true,
          priority: 1,
        }],
        fallbackChannels: [],
        timing: { immediate: true },
        retryPolicy: {
          enabled: false,
          maxAttempts: 1,
          initialDelay: 0,
          backoffMultiplier: 1,
          maxDelay: 0,
        },
        rateLimiting: {
          enabled: false,
          globalLimits: [],
          userLimits: [],
          channelLimits: {
            push: [],
            email: [],
            sms: [],
            in_app: [],
            whatsapp: [],
            slack: [],
            webhook: [],
            browser: [],
            voice: [],
            telegram: [],
          },
        },
        deduplication: {
          enabled: false,
          window: 0,
          keyFields: [],
          strategy: 'skip',
        },
      },
      source: 'system',
      tags: [],
      personalized: false,
      createdAt: notif.createdAt.toISOString(),
      updatedAt: notif.createdAt.toISOString(),
    } as Notification)),
    [notifications]
  );

  const userProfile = useSelector(selectUserProfile);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const recentSearchesStorage = useLocalStorage<string[]>('account-recent-searches', { defaultValue: [] });
  const recentSearches = useMemo(() => recentSearchesStorage.value || [], [recentSearchesStorage.value]);

  // State
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Refs with click outside handlers
  const userMenuRef = useClickOutside<HTMLDivElement>(() => setShowUserMenu(false));
  const notificationRef = useClickOutside<HTMLDivElement>(() => setShowNotifications(false));
  const quickActionsRef = useClickOutside<HTMLDivElement>(() => setShowQuickActions(false));

  // Quick actions configuration
  const cartItems = cartContext.state.items?.length || 0;
  const wishlistItems = wishlistContext.state.items?.length || 0;

  // Handlers - Define handleLogout early since it's used in userMenuActions
  const handleLogout = useCallback(async () => {
    try {
      setShowUserMenu(false);
      await logout();
      dispatch(clearUser());
      dispatch(clearCart());
      toast.success('Logged out successfully');
      router.push('/');
    } catch {
      toast.error('Failed to logout');
    }
  }, [logout, dispatch, router]);

  const quickActions: QuickAction[] = [
    {
      id: 'orders',
      label: 'Orders',
      href: ACCOUNT_ROUTES.ORDERS,
      icon: ClipboardDocumentListIcon,
      isActive: pathname?.includes('/orders') || false,
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      href: ACCOUNT_ROUTES.WISHLIST,
      icon: HeartIcon,
      badge: wishlistItems,
      isActive: pathname?.includes('/wishlist') || false,
    },
    {
      id: 'addresses',
      label: 'Addresses',
      href: ACCOUNT_ROUTES.ADDRESSES,
      icon: MapPinIcon,
      badge: userProfile?.addresses?.length || 0,
      isActive: pathname?.includes('/addresses') || false,
    },
    {
      id: 'cart',
      label: 'Cart',
      href: '/cart',
      icon: ShoppingBagIcon,
      badge: cartItems,
      isActive: pathname?.includes('/cart') || false,
    },
  ];

  // User menu actions
  const userMenuActions: UserMenuAction[] = [
    {
      id: 'profile',
      label: 'Profile Settings',
      href: ACCOUNT_ROUTES.PROFILE,
      icon: UserIcon,
    },
    {
      id: 'security',
      label: 'Security',
      href: ACCOUNT_ROUTES.SECURITY,
      icon: ShieldCheckIcon,
    },
    {
      id: 'preferences',
      label: 'Preferences',
      href: ACCOUNT_ROUTES.PREFERENCES,
      icon: Cog6ToothIcon,
    },
    {
      id: 'payment',
      label: 'Payment Methods',
      href: '/account/payment-methods',
      icon: CreditCardIcon,
    },
    {
      id: 'divider1',
      label: '',
      divider: true,
    },
    {
      id: 'help',
      label: 'Help & Support',
      href: '/support',
      icon: QuestionMarkCircleIcon,
    },
    {
      id: 'divider2',
      label: '',
      divider: true,
    },
    {
      id: 'logout',
      label: 'Sign Out',
      icon: ArrowRightOnRectangleIcon,
      variant: 'danger',
      action: handleLogout,
    },
  ];

  // Theme actions
  const themeActions = [
    { id: 'light', label: 'Light', icon: SunIcon },
    { id: 'dark', label: 'Dark', icon: MoonIcon },
    { id: 'system', label: 'System', icon: ComputerDesktopIcon },
  ];

  // Generate breadcrumb items
  const generateBreadcrumbs = () => {
    const items: Array<{
      label: string;
      href?: string;
      icon?: React.ComponentType<{ className?: string }>;
    }> = [
        { label: 'Account', href: ACCOUNT_ROUTES.DASHBOARD, icon: UserIcon },
      ];

    if (title && title !== 'Dashboard') {
      items.push({ label: title, href: undefined, icon: undefined });
    }

    return [...items, ...breadcrumbs];
  };

  // Additional Handlers
  const handleSearch = useCallback((query: string) => {
    if (query.trim()) {
      // Add to recent searches
      const updated = [query, ...recentSearches.filter((s: string) => s !== query)].slice(0, 5);
      recentSearchesStorage.setValue(updated);

      // Navigate to search results
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setShowSearchModal(false);
      setSearchQuery('');
    }
  }, [recentSearches, recentSearchesStorage, router]);

  const handleNotificationClick = useCallback((notificationId: string) => {
    markAsRead(notificationId);
    // Handle notification action based on type
  }, [markAsRead]);

  const handleThemeChange = useCallback((newTheme: string) => {
    setTheme(newTheme);
    toast.success(`Theme changed to ${newTheme}`);
  }, [setTheme]);

  // Store previous notification count for badge animation
  const prevNotificationCountRef = useRef(unreadCount);
  if (prevNotificationCountRef.current !== unreadCount) {
    prevNotificationCountRef.current = unreadCount;
  }

  // Calculate user stats
  const userStats = {
    totalOrders: (userProfile as Partial<UserProfile>)?.orderCount || 0,
    totalSpent: (userProfile as Partial<UserProfile>)?.totalSpent || 0,
  };

  // Get avatar URL helper
  const getAvatarUrl = useCallback(() => {
    if (!user?.avatar) return undefined;
    if (typeof user.avatar === 'string') return user.avatar;
    if (typeof user.avatar === 'object' && user.avatar && 'url' in user.avatar) {
      return (user.avatar as { url: string }).url;
    }
    return undefined;
  }, [user?.avatar]);

  const avatarUrl = getAvatarUrl();

  return (
    <header
      className={cn(
        'sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200',
        'dark:bg-gray-900/95 dark:border-gray-700',
        {
          'py-2': variant === 'compact',
          'py-1': variant === 'minimal',
          'py-4': variant === 'default',
        },
        className
      )}
    >
      <div className="container mx-auto px-4">
        {/* Main Header */}
        <div className="flex items-center justify-between gap-4">
          {/* Left Section - Breadcrumbs */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {variant !== 'minimal' && (
              <nav className="flex items-center gap-1 text-sm">
                {generateBreadcrumbs().map((item, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && (
                      <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-1" />
                    )}
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="flex items-center gap-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                      >
                        {item.icon && <item.icon className="w-4 h-4" />}
                        <span className="truncate">{item.label}</span>
                      </Link>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-900 dark:text-gray-100 font-medium">
                        {item.icon && <item.icon className="w-4 h-4" />}
                        <span className="truncate">{item.label}</span>
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </nav>
            )}
          </div>

          {/* Center Section - Search */}
          {showSearch && !isMobile && variant !== 'minimal' && (
            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search account..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch(searchQuery);
                    }
                  }}
                  className="pl-10 pr-4 py-2 w-full"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Clear search"
                    aria-label="Clear search"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Right Section - Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search */}
            {showSearch && isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSearchModal(true)}
                className="p-2"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </Button>
            )}

            {/* Quick Actions */}
            {!isMobile && variant === 'default' && (
              <div className="relative" ref={quickActionsRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  className="flex items-center gap-1 px-3"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Quick Actions</span>
                  <ChevronDownIcon className="w-3 h-3" />
                </Button>

                <AnimatePresence>
                  {showQuickActions && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
                    >
                      {quickActions.map((action) => (
                        <Link
                          key={action.id}
                          href={action.href}
                          onClick={() => setShowQuickActions(false)}
                          className={cn(
                            'flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
                            action.isActive && 'bg-primary-50 text-primary-600 dark:bg-primary-900/20'
                          )}
                        >
                          <action.icon className="w-4 h-4" />
                          <span className="flex-1">{action.label}</span>
                          {action.badge && action.badge > 0 && (
                            <Badge variant="secondary" size="sm">
                              {action.badge}
                            </Badge>
                          )}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2"
              >
                {unreadCount > 0 ? (
                  <BellSolidIcon className="w-5 h-5 text-primary-600" />
                ) : (
                  <BellIcon className="w-5 h-5" />
                )}
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    size="sm"
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-xs flex items-center justify-center"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </Button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                  >
                    <NotificationPanel
                      notifications={displayNotifications}
                      onNotificationClick={handleNotificationClick}
                      onMarkAllAsRead={markAllAsRead}
                      onClose={() => setShowNotifications(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-2"
              >
                <Avatar
                  src={avatarUrl}
                  alt={user?.firstName || 'User'}
                  fallback={user?.firstName?.[0] || 'U'}
                  size="sm"
                />
                {!isMobile && (
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium truncate max-w-[100px]">
                      {user?.firstName}
                    </span>
                    <ChevronDownIcon className="w-3 h-3" />
                  </div>
                )}
              </Button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                  >
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={avatarUrl}
                          alt={user?.firstName || 'User'}
                          fallback={user?.firstName?.[0] || 'U'}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {user?.firstName} {user?.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {user?.email}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* User Stats */}
                    {variant === 'default' && (
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-2 gap-3 text-center">
                          <div>
                            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {userStats.totalOrders}
                            </div>
                            <div className="text-xs text-gray-500">Orders</div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {formatCurrency(userStats.totalSpent, 'INR')}
                            </div>
                            <div className="text-xs text-gray-500">Spent</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Theme Selector */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Theme
                      </div>
                      <div className="flex gap-1">
                        {themeActions.map((themeAction) => (
                          <Button
                            key={themeAction.id}
                            variant={theme === themeAction.id ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => handleThemeChange(themeAction.id)}
                            className="flex-1"
                          >
                            <themeAction.icon className="w-4 h-4 mr-1" />
                            {themeAction.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Menu Actions */}
                    <div className="py-2">
                      {userMenuActions.map((action) => {
                        if (action.divider) {
                          return (
                            <div
                              key={action.id}
                              className="mx-4 my-1 border-t border-gray-200 dark:border-gray-700"
                            />
                          );
                        }

                        const content = (
                          <div
                            className={cn(
                              'flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer',
                              action.variant === 'danger' && 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                            )}
                            onClick={() => {
                              setShowUserMenu(false);
                              if (action.action) {
                                action.action();
                              }
                            }}
                          >
                            {action.icon && <action.icon className="w-4 h-4" />}
                            <span>{action.label}</span>
                          </div>
                        );

                        return action.href ? (
                          <Link key={action.id} href={action.href}>
                            {content}
                          </Link>
                        ) : (
                          <div key={action.id}>{content}</div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Custom Actions */}
            {actions}
          </div>
        </div>

        {/* Mobile Quick Actions */}
        {isMobile && variant === 'default' && (
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-2">
            {quickActions.map((action) => (
              <Link
                key={action.id}
                href={action.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 text-xs rounded-full border whitespace-nowrap transition-colors',
                  action.isActive
                    ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/20 dark:border-primary-700'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
                )}
              >
                <action.icon className="w-3 h-3" />
                <span>{action.label}</span>
                {action.badge && action.badge > 0 && (
                  <Badge variant="secondary" size="sm">
                    {action.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Search Modal */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSearch={handleSearch}
        recentSearches={recentSearches}
        placeholder="Search account, orders, addresses..."
      />
    </header>
  );
};

export default AccountHeader;
