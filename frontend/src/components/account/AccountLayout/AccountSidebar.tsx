/**
 * AccountSidebar Component
 * 
 * Sidebar navigation for account pages with collapsible menu,
 * user profile summary, and navigation items.
 * 
 * Features:
 * - Collapsible navigation
 * - User profile display
 * - Active state management
 * - Badge notifications
 * - Mobile responsive design
 * - Quick stats display
 * - Logout functionality
 * - Theme integration
 * 
 * @component
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HomeIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  GiftIcon,
  TagIcon,
  TruckIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import {
  UserIcon as UserSolidIcon,
  HeartIcon as HeartSolidIcon,
  ShoppingBagIcon as ShoppingBagSolidIcon,
  ClipboardDocumentListIcon as ClipboardSolidIcon,
} from '@heroicons/react/24/solid';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Separator } from '@/components/ui/Separator';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';
import { useAuth } from '@/components/providers';
import { useCart } from '@/components/providers/CartProvider';
import { useWishlist } from '@/components/providers/WishlistProvider';
import { selectUserProfile } from '@/store/slices/userSlice';

// Types
export interface AccountSidebarProps {
  /** Collapsed state */
  collapsed?: boolean;
  /** Toggle handler */
  onToggle?: () => void;
  /** Sidebar variant */
  variant?: 'desktop' | 'mobile';
  /** Custom content */
  content?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  activeIcon?: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  isActive?: boolean;
  isNew?: boolean;
  description?: string;
  shortcut?: string;
}

interface NavigationSection {
  id: string;
  title: string;
  items: NavigationItem[];
  collapsed?: boolean;
}

export const AccountSidebar: React.FC<AccountSidebarProps> = ({
  collapsed = false,
  onToggle,
  variant = 'desktop',
  content,
  className,
}) => {
  // Hooks
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { getTotalQuantity: getCartItems, state: cartState } = useCart();
  const { state: wishlistState } = useWishlist();

  // Calculate totals (using cartState for consistency check)
  const cartItems = getCartItems();
  const cartItemsFromState = cartState?.items?.length || 0;
  const wishlistItems = wishlistState.items.length;
  const userProfile = useSelector(selectUserProfile);

  // Log cart consistency for debugging
  if (cartItems !== cartItemsFromState) {
    console.debug('Cart count mismatch:', { cartItems, cartItemsFromState });
  }

  // State
  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);

  // Navigation configuration
  const navigationSections: NavigationSection[] = [
    {
      id: 'overview',
      title: 'Overview',
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
          label: 'Profile',
          href: '/account/profile',
          icon: UserIcon,
          activeIcon: UserSolidIcon,
          description: 'Personal information',
          isActive: pathname?.includes('/account/profile') || false,
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
          label: 'Orders',
          href: '/account/orders',
          icon: ClipboardDocumentListIcon,
          activeIcon: ClipboardSolidIcon,
          badge: 0, // Will be updated with actual order count
          description: 'Order history',
          isActive: pathname?.includes('/account/orders') || false,
        },
        {
          id: 'cart',
          label: 'Shopping Cart',
          href: '/cart',
          icon: ShoppingBagIcon,
          activeIcon: ShoppingBagSolidIcon,
          badge: cartItems,
          description: 'Items in cart',
          isActive: pathname?.includes('/cart') || false,
        },
        {
          id: 'wishlist',
          label: 'Wishlist',
          href: '/account/wishlist',
          icon: HeartIcon,
          activeIcon: HeartSolidIcon,
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
      id: 'account',
      title: 'Account Management',
      items: [
        {
          id: 'addresses',
          label: 'Addresses',
          href: '/account/addresses',
          icon: MapPinIcon,
          badge: userProfile?.addresses?.length || 0,
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
          id: 'security',
          label: 'Security',
          href: '/account/security',
          icon: ShieldCheckIcon,
          description: 'Password & security',
          isActive: pathname?.includes('/account/security') || false,
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
          description: 'Get help',
          isActive: pathname?.includes('/help') || false,
        },
        {
          id: 'contact',
          label: 'Contact Us',
          href: '/contact',
          icon: ChatBubbleLeftRightIcon,
          description: 'Customer support',
          isActive: pathname?.includes('/contact') || false,
        },
        {
          id: 'track',
          label: 'Track Order',
          href: '/track-order',
          icon: TruckIcon,
          description: 'Track your orders',
          isActive: pathname?.includes('/track') || false,
        },
      ],
    },
  ];

  // Handlers
  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch {
      // Error handled in context
    }
  };

  // User stats
  const userStats = {
    orders: 0, // Will be updated with actual order count
    spent: 0, // Will be updated with actual spending
    points: 0, // Will be updated with loyalty points
    tier: 'Bronze', // Will be updated with actual tier
    savedItems: wishlistItems,
  };

  // Sidebar classes
  const sidebarClasses = cn(
    'flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700',
    {
      'w-64': (!collapsed && variant === 'desktop') || variant === 'mobile',
      'w-16': collapsed && variant === 'desktop',
    },
    className
  );

  return (
    <div className={sidebarClasses}>
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700',
          {
            'px-2': collapsed && variant === 'desktop',
          }
        )}
      >
        {(!collapsed || variant === 'mobile') && (
          <div className="flex items-center gap-3">
            <Avatar
              src={user?.avatar as string}
              alt={user?.firstName || 'User'}
              fallback={user?.firstName?.[0] || 'U'}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {userStats.tier} Member
              </div>
            </div>
          </div>
        )}

        {collapsed && variant === 'desktop' && (
          <Avatar
            src={user?.avatar as string}
            alt={user?.firstName || 'User'}
            fallback={user?.firstName?.[0] || 'U'}
            size="sm"
          />
        )}

        {onToggle && variant === 'desktop' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="p-1.5"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRightIcon className="w-4 h-4" />
            ) : (
              <ChevronLeftIcon className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>

      {/* User Stats */}
      {(!collapsed || variant === 'mobile') && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {userStats.orders}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Orders
              </div>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {userStats.points}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Points
              </div>
            </div>
          </div>
          {userStats.spent > 0 && (
            <div className="mt-3 text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total spent: <span className="font-medium">{formatCurrency(userStats.spent, 'INR')}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {navigationSections.map((section, sectionIndex) => {
          const isSectionCollapsed = collapsedSections.includes(section.id);
          const showSection = !collapsed || variant === 'mobile';

          return (
            <div key={section.id}>
              {/* Add separator between sections except first */}
              {sectionIndex > 0 && showSection && <Separator className="my-4" />}

              {showSection && (
                <div
                  className="flex items-center justify-between mb-3 cursor-pointer"
                  onClick={() => toggleSection(section.id)}
                >
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {section.title}
                  </h3>
                  <ChevronRightIcon
                    className={cn(
                      'w-3 h-3 text-gray-400 transition-transform',
                      !isSectionCollapsed && 'rotate-90'
                    )}
                  />
                </div>
              )}

              <AnimatePresence initial={false}>
                {(!isSectionCollapsed || collapsed) && (
                  <motion.div
                    initial={showSection ? { height: 0, opacity: 0 } : false}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1 overflow-hidden"
                  >
                    {section.items.map((item) => {
                      const Icon = item.isActive && item.activeIcon ? item.activeIcon : item.icon;
                      const showTooltip = collapsed && variant === 'desktop';

                      const linkContent = (
                        <div
                          className={cn(
                            'group relative flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200',
                            'hover:bg-gray-100 dark:hover:bg-gray-700',
                            {
                              'bg-primary-50 text-primary-700 border border-primary-200 dark:bg-primary-900/20 dark:text-primary-300 dark:border-primary-700':
                                item.isActive,
                              'text-gray-700 dark:text-gray-300': !item.isActive,
                              'justify-center px-2': collapsed && variant === 'desktop',
                            }
                          )}
                        >
                          <Icon
                            className={cn(
                              'w-5 h-5 flex-shrink-0',
                              {
                                'text-primary-600 dark:text-primary-400': item.isActive,
                                'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200':
                                  !item.isActive,
                              }
                            )}
                          />

                          {(!collapsed || variant === 'mobile') && (
                            <>
                              <span className="flex-1 truncate">{item.label}</span>

                              <div className="flex items-center gap-1">
                                {item.isNew && (
                                  <Badge variant="secondary" size="sm">
                                    New
                                  </Badge>
                                )}

                                {item.badge && (
                                  <Badge
                                    variant={item.isActive ? 'default' : 'secondary'}
                                    size="sm"
                                  >
                                    {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
                                  </Badge>
                                )}

                                {item.shortcut && (
                                  <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                                    {item.shortcut}
                                  </kbd>
                                )}
                              </div>
                            </>
                          )}

                          {showTooltip && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                              {item.label}
                              {item.description && (
                                <div className="text-gray-300 dark:text-gray-400">
                                  {item.description}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );

                      return (
                        <Link key={item.id} href={item.href}>
                          {linkContent}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Custom Content */}
      {content && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          {content}
        </div>
      )}

      {/* Footer Actions */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-2">
        {(!collapsed || variant === 'mobile') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        )}

        {collapsed && variant === 'desktop' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-center p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
            aria-label="Sign out"
            title="Sign Out"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default AccountSidebar;
