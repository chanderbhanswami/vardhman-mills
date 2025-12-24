/**
 * AccountMenu Component
 * 
 * Mobile-friendly account navigation menu with quick actions,
 * user profile summary, and navigation shortcuts.
 * 
 * Features:
 * - Mobile-optimized design
 * - Quick action buttons
 * - User profile display
 * - Navigation shortcuts
 * - Stats overview
 * - Theme switching
 * - Logout functionality
 * - Search integration
 * 
 * @component
 */

'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserIcon,
  Cog6ToothIcon,
  ShoppingBagIcon,
  HeartIcon,
  ClipboardDocumentListIcon,
  MapPinIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  ChevronRightIcon,
  HomeIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  GiftIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';
import { useAuth } from '@/components/providers';
import { useCart } from '@/components/providers/CartProvider';
import { useWishlist } from '@/components/providers/WishlistProvider';
import toast from 'react-hot-toast';

// Types
export interface AccountMenuProps {
  /** Menu visibility state */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Search functionality */
  onSearch?: (query: string) => void;
  /** Additional CSS classes */
  className?: string;
}

interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  isActive?: boolean;
  description?: string;
  isNew?: boolean;
}

interface MenuSection {
  id: string;
  title: string;
  items: MenuItem[];
}

export const AccountMenu: React.FC<AccountMenuProps> = ({
  isOpen,
  onClose,
  onSearch,
  className,
}) => {
  // Hooks
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { getTotalQuantity: getCartItems } = useCart();
  const { state: wishlistState } = useWishlist();

  // State
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate totals
  const cartItems = getCartItems();
  const wishlistItems = wishlistState.items.length;

  // Menu sections
  const menuSections: MenuSection[] = [
    {
      id: 'main',
      title: 'Account',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          href: '/account',
          icon: HomeIcon,
          description: 'Account overview',
          isActive: pathname === '/account',
        },
        {
          id: 'profile',
          label: 'Profile Settings',
          href: '/account/profile',
          icon: UserIcon,
          description: 'Personal information',
          isActive: pathname?.includes('/account/profile') || false,
        },
        {
          id: 'security',
          label: 'Security',
          href: '/account/security',
          icon: ShieldCheckIcon,
          description: 'Password & security',
          isActive: pathname?.includes('/account/security') || false,
        },
        {
          id: 'preferences',
          label: 'Preferences',
          href: '/account/preferences',
          icon: Cog6ToothIcon,
          description: 'Account settings',
          isActive: pathname?.includes('/account/preferences') || false,
        },
      ],
    },
    {
      id: 'shopping',
      title: 'Shopping',
      items: [
        {
          id: 'orders',
          label: 'My Orders',
          href: '/account/orders',
          icon: ClipboardDocumentListIcon,
          badge: 0, // Will be updated with actual count
          description: 'Order history & tracking',
          isActive: pathname?.includes('/account/orders') || false,
        },
        {
          id: 'cart',
          label: 'Shopping Cart',
          href: '/cart',
          icon: ShoppingBagIcon,
          badge: cartItems,
          description: 'Items in your cart',
          isActive: pathname?.includes('/cart') || false,
        },
        {
          id: 'wishlist',
          label: 'Wishlist',
          href: '/account/wishlist',
          icon: HeartIcon,
          badge: wishlistItems,
          description: 'Saved items',
          isActive: pathname?.includes('/account/wishlist') || false,
        },
        {
          id: 'reviews',
          label: 'Reviews',
          href: '/account/reviews',
          icon: StarIcon,
          description: 'Product reviews',
          isActive: pathname?.includes('/account/reviews') || false,
        },
      ],
    },
    {
      id: 'management',
      title: 'Management',
      items: [
        {
          id: 'addresses',
          label: 'Addresses',
          href: '/account/addresses',
          icon: MapPinIcon,
          badge: 0, // Will be updated with address count
          description: 'Delivery addresses',
          isActive: pathname?.includes('/account/addresses') || false,
        },
        {
          id: 'payment',
          label: 'Payment Methods',
          href: '/account/payment-methods',
          icon: CreditCardIcon,
          description: 'Saved payment methods',
          isActive: pathname?.includes('/account/payment') || false,
        },
        {
          id: 'notifications',
          label: 'Notifications',
          href: '/account/notifications',
          icon: BellIcon,
          description: 'Notification settings',
          isActive: pathname?.includes('/account/notifications') || false,
        },
      ],
    },
    {
      id: 'support',
      title: 'Help & Support',
      items: [
        {
          id: 'help',
          label: 'Help Center',
          href: '/help',
          icon: QuestionMarkCircleIcon,
          description: 'Get help & FAQs',
          isActive: pathname?.includes('/help') || false,
        },
        {
          id: 'contact',
          label: 'Contact Support',
          href: '/contact',
          icon: ChatBubbleLeftRightIcon,
          description: 'Customer support',
          isActive: pathname?.includes('/contact') || false,
        },
      ],
    },
  ];

  // Theme options (placeholder for future implementation)
  const themeOptions = [
    { id: 'light', label: 'Light', icon: SunIcon },
    { id: 'dark', label: 'Dark', icon: MoonIcon },
    { id: 'system', label: 'System', icon: ComputerDesktopIcon },
  ];
  const currentTheme = 'light'; // Default theme

  // Handlers
  const handleSearch = (query: string) => {
    if (query.trim() && onSearch) {
      onSearch(query);
      onClose();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
      router.push('/');
      toast.success('Logged out successfully');
    } catch {
      toast.error('Failed to logout');
    }
  };

  const handleThemeChange = (newTheme: string) => {
    // Theme functionality will be implemented when theme system is available
    toast.success(`Theme will be changed to ${newTheme} (feature coming soon)`);
  };

  const handleNavigation = (href: string) => {
    onClose();
    router.push(href);
  };

  // User stats
  const userStats = {
    orders: 0, // Will be updated with actual order count
    points: 0, // Will be updated with loyalty points
    tier: 'Bronze', // Will be updated with actual tier
    spent: 0, // Will be updated with actual spending
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={onClose}
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className={cn(
              'fixed top-0 right-0 bottom-0 z-50 w-80 max-w-[90vw] bg-white dark:bg-gray-900 shadow-xl overflow-y-auto',
              className
            )}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Account Menu
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="p-2"
                  aria-label="Close menu"
                >
                  <XMarkIcon className="w-5 h-5" />
                </Button>
              </div>

              {/* User Info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Avatar
                  src={user?.avatar as string}
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
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" size="sm">
                      {userStats.tier} Member
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {userStats.points} points
                    </span>
                  </div>
                </div>
              </div>

              {/* Search */}
              {onSearch && (
                <div className="mt-4">
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
                      className="pl-10"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Stats Cards */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg text-white">
                  <div className="text-2xl font-bold">{userStats.orders}</div>
                  <div className="text-sm text-primary-100">Total Orders</div>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white">
                  <div className="text-2xl font-bold">{userStats.points}</div>
                  <div className="text-sm text-green-100">Loyalty Points</div>
                </div>
              </div>
              {userStats.spent > 0 && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(userStats.spent, 'INR')}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Total Spent
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Sections */}
            <div className="p-4 space-y-6">
              {menuSections.map((section) => (
                <div key={section.id}>
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleNavigation(item.href)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-3 text-sm rounded-lg transition-colors text-left',
                          'hover:bg-gray-100 dark:hover:bg-gray-800',
                          {
                            'bg-primary-50 text-primary-700 border border-primary-200 dark:bg-primary-900/20 dark:text-primary-300 dark:border-primary-700':
                              item.isActive,
                            'text-gray-700 dark:text-gray-300': !item.isActive,
                          }
                        )}
                      >
                        <item.icon
                          className={cn(
                            'w-5 h-5 flex-shrink-0',
                            {
                              'text-primary-600 dark:text-primary-400': item.isActive,
                              'text-gray-500 dark:text-gray-400': !item.isActive,
                            }
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{item.label}</span>
                            {item.isNew && (
                              <Badge variant="secondary" size="sm">
                                New
                              </Badge>
                            )}
                          </div>
                          {item.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {item.description}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {item.badge && (
                            <Badge
                              variant={item.isActive ? 'default' : 'secondary'}
                              size="sm"
                            >
                              {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
                            </Badge>
                          )}
                          <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Theme Selector */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Theme
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {themeOptions.map((option) => (
                  <Button
                    key={option.id}
                    variant={currentTheme === option.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleThemeChange(option.id)}
                    className="flex flex-col items-center gap-1 h-auto py-3"
                  >
                    <option.icon className="w-4 h-4" />
                    <span className="text-xs">{option.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-center text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AccountMenu;
