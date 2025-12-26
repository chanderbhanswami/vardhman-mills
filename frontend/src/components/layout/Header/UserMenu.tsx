'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserIcon,
  ChevronDownIcon,
  CogIcon,
  ShoppingBagIcon,
  HeartIcon,
  CreditCardIcon,
  MapPinIcon,
  BellIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  GiftIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { UserIcon as UserSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/hooks/auth/useAuth';
import { Button } from '@/components/ui/Button';

export interface UserMenuProps {
  className?: string;
  showAvatar?: boolean;
  variant?: 'dropdown' | 'modal';
  onProfileClick?: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  description?: string;
  badge?: string | number;
  isNew?: boolean;
  divider?: boolean;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    title: 'Account',
    items: [
      {
        id: 'profile',
        label: 'My Profile',
        href: '/account/profile',
        icon: UserCircleIcon,
        description: 'Manage your personal information',
      },
      {
        id: 'orders',
        label: 'Orders',
        href: '/account/orders',
        icon: ShoppingBagIcon,
        description: 'Track and manage your orders',
        badge: 2,
      },
      {
        id: 'wishlist',
        label: 'Wishlist',
        href: '/wishlist',
        icon: HeartIcon,
        description: 'Saved items',
        badge: 5,
      },
    ],
  },
  {
    title: 'Settings',
    items: [
      {
        id: 'addresses',
        label: 'Addresses',
        href: '/account/addresses',
        icon: MapPinIcon,
        description: 'Manage shipping addresses',
      },
      {
        id: 'payment',
        label: 'Payment Methods',
        href: '/account/payment-methods',
        icon: CreditCardIcon,
        description: 'Cards and payment options',
      },
      {
        id: 'notifications',
        label: 'Notifications',
        href: '/account/notifications',
        icon: BellIcon,
        description: 'Email and SMS preferences',
      },
      {
        id: 'settings',
        label: 'Account Settings',
        href: '/account/preferences',
        icon: CogIcon,
        description: 'Privacy and security',
      },
    ],
  },
  {
    title: 'Support',
    items: [
      {
        id: 'help',
        label: 'Help Center',
        href: '/faq',
        icon: QuestionMarkCircleIcon,
        description: 'FAQs and support',
      },
      {
        id: 'contact',
        label: 'Contact Us',
        href: '/contact',
        icon: DocumentTextIcon,
        description: 'Get in touch with support',
      },
      {
        id: 'feedback',
        label: 'Feedback',
        href: '/contact',
        icon: GiftIcon,
        description: 'Share your thoughts',
        isNew: true,
      },
    ],
  },
];

const UserMenu: React.FC<UserMenuProps> = ({
  className = '',
  showAvatar = true,
  variant = 'dropdown', // eslint-disable-line @typescript-eslint/no-unused-vars
  onProfileClick,
}) => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-user-menu]')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className={`flex items-center ${className}`}>
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={`flex items-center gap-1 sm:gap-2 ${className}`}>
        {/* Mobile: Just show user icon that links to login */}
        <Link href="/login" className="sm:hidden p-2 rounded-md hover:bg-gray-100">
          <UserIcon className="w-5 h-5 text-gray-600" />
        </Link>

        {/* Tablet and up: Show Sign In button */}
        <Link href="/login" className="hidden sm:block">
          <Button variant="ghost" size="sm">
            Sign In
          </Button>
        </Link>

        {/* Desktop: Also show Sign Up button */}
        <Link href="/register" className="hidden md:block">
          <Button size="sm">
            Sign Up
          </Button>
        </Link>
      </div>
    );
  }

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: { duration: 0.15 }
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.2, staggerChildren: 0.02 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2 } }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };
  return (
    <div className={`relative ${className}`} data-user-menu>
      {/* User Menu Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 text-gray-900 hover:text-primary transition-colors duration-200 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label="User Menu"
        aria-expanded={isOpen}
      >
        {/* User Avatar */}
        <div className="relative">
          {showAvatar && user?.avatar ? (
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200">
              <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-gray-600" />
            </div>
          )}

          {/* Verification Badge */}
          {(user as unknown as { isVerified?: boolean })?.isVerified && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <ShieldCheckIcon className="w-2 h-2 text-white" />
            </div>
          )}
        </div>

        {/* User Info (Desktop) */}
        <div className="hidden lg:block text-left">
          <div className="text-sm font-medium text-gray-900">
            {user?.name || 'User'}
          </div>
        </div>

        <ChevronDownIcon
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </motion.button>

      {/* User Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden"
          >
            {/* User Profile Header */}
            <motion.div
              variants={sectionVariants}
              className="p-4 bg-gradient-to-r from-primary-50 to-primary-100 border-b border-gray-200"
            >
              <div className="flex items-start space-x-3">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white">
                    {user?.avatar ? (
                      <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                        <span className="text-lg font-bold text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                        <UserSolidIcon className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                  {(user as unknown as { isVerified?: boolean })?.isVerified && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <ShieldCheckIcon className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>

                {/* User Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {user?.name || 'Guest User'}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600 truncate">
                    {user?.email}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>{(user as unknown as { orderCount?: number })?.orderCount || 0} orders</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-3">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onProfileClick?.();
                  }}
                  className="w-full px-3 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  View Profile
                </button>
              </div>
            </motion.div>

            {/* Menu Sections */}
            <div className="max-h-96 overflow-y-auto">
              {menuSections.map((section) => (
                <motion.div
                  key={section.title}
                  variants={sectionVariants}
                  className="p-2"
                >
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                    {section.title}
                  </h4>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <motion.div
                          key={item.id}
                          variants={itemVariants}
                        >
                          <Link
                            href={item.href}
                            className={`
                              flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200
                              hover:bg-gray-100 group
                              ${hoveredItem === item.id ? 'bg-primary-50' : ''}
                            `}
                            onMouseEnter={() => setHoveredItem(item.id)}
                            onMouseLeave={() => setHoveredItem(null)}
                            onClick={() => setIsOpen(false)}
                          >
                            <IconComponent className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors">
                                  {item.label}
                                </span>
                                <div className="flex items-center space-x-2">
                                  {item.isNew && (
                                    <span className="px-1.5 py-0.5 bg-green-100 text-green-600 text-xs font-medium rounded">
                                      NEW
                                    </span>
                                  )}
                                  {item.badge && (
                                    <span className="px-2 py-0.5 bg-primary-100 text-primary text-xs font-semibold rounded-full">
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {item.description && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Logout Section */}
            <motion.div
              variants={sectionVariants}
              className="p-2 border-t border-gray-200 bg-gray-50"
            >
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-3 py-2.5 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </motion.div>

            {/* Member Since */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
              <div className="text-center text-xs text-gray-500">
                Member since {new Date((user as unknown as { memberSince?: string })?.memberSince || new Date().toISOString()).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long'
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;