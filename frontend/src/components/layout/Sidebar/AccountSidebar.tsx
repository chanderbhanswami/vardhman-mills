'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserIcon,
  CogIcon,
  HeartIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
  CreditCardIcon,
  MapPinIcon,
  BellIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
  XMarkIcon,
  StarIcon,
  ClockIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

export interface AccountSidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
    memberSince?: string;
    orderCount?: number;
  };
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  description?: string;
  color?: string;
}

const menuSections: MenuSection[] = [
  {
    title: 'Account Overview',
    items: [
      {
        id: 'profile',
        label: 'My Profile',
        href: '/account/profile',
        icon: UserIcon,
        description: 'Personal information and preferences'
      },
      {
        id: 'orders',
        label: 'Order History',
        href: '/account/orders',
        icon: ShoppingBagIcon,
        badge: 3,
        description: 'Track and manage your orders'
      },
      {
        id: 'wishlist',
        label: 'Wishlist',
        href: '/account/wishlist',
        icon: HeartIcon,
        badge: 12,
        description: 'Saved items and favorites',
        color: 'text-red-500'
      },
    ]
  },
  {
    title: 'Shopping & Billing',
    items: [
      {
        id: 'payment',
        label: 'Payment Methods',
        href: '/account/payment',
        icon: CreditCardIcon,
        description: 'Manage cards and payment options'
      },
      {
        id: 'addresses',
        label: 'Addresses',
        href: '/account/addresses',
        icon: MapPinIcon,
        description: 'Shipping and billing addresses'
      },
      {
        id: 'invoices',
        label: 'Invoices & Documents',
        href: '/account/invoices',
        icon: DocumentTextIcon,
        description: 'Download receipts and invoices'
      },
    ]
  },
  {
    title: 'Preferences',
    items: [
      {
        id: 'notifications',
        label: 'Notifications',
        href: '/account/notifications',
        icon: BellIcon,
        description: 'Email and SMS preferences'
      },
      {
        id: 'settings',
        label: 'Account Settings',
        href: '/account/settings',
        icon: CogIcon,
        description: 'Privacy and security settings'
      },
      {
        id: 'security',
        label: 'Security',
        href: '/account/security',
        icon: ShieldCheckIcon,
        description: 'Password and two-factor authentication'
      },
    ]
  }
];

const defaultUser = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: undefined,
  memberSince: '2022',
  orderCount: 23,
};

const AccountSidebar: React.FC<AccountSidebarProps> = ({
  className = '',
  isOpen = false,
  onClose,
  user = defaultUser,
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const sidebarVariants = {
    closed: {
      x: '-100%',
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30
      }
    },
    open: {
      x: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.05
      }
    }
  } as const;

  const itemVariants = {
    closed: { opacity: 0, x: -20 },
    open: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  const cardVariants = {
    idle: { scale: 1 },
    hover: { 
      scale: 1.02,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.98 }
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className={`
          fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-900 
          shadow-xl border-r border-gray-200 dark:border-gray-700 z-50
          overflow-y-auto ${className}
        `}
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
      >
        {/* Header */}
        <motion.div 
          className="p-6 border-b border-gray-200 dark:border-gray-700"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              My Account
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              aria-label="Close sidebar"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* User Info Card */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                {user.avatar ? (
                  <Image 
                    src={user.avatar} 
                    alt={user.name}
                    width={48}
                    height={48}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-6 h-6 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {user.name}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {user.email}
                </p>
              </div>
            </div>
            
            {/* User Stats */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="text-center">
                <div className="text-sm font-bold text-green-600 dark:text-green-400">
                  {user.orderCount}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Orders
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-primary-600 dark:text-primary-400">
                  {user.memberSince}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Since
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="p-4 border-b border-gray-200 dark:border-gray-700"
          variants={itemVariants}
        >
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/account/orders"
              className="flex items-center p-3 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors duration-200"
            >
              <TruckIcon className="w-4 h-4 mr-2" />
              <span className="text-xs font-medium">Track Order</span>
            </Link>
            <Link
              href="/account/wishlist"
              className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
            >
              <HeartIcon className="w-4 h-4 mr-2" />
              <span className="text-xs font-medium">Wishlist</span>
            </Link>
          </div>
        </motion.div>

        {/* Menu Sections */}
        <motion.div className="p-4" variants={itemVariants}>
          {menuSections.map((section) => (
            <div key={section.title} className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const IconComponent = item.icon;
                  const isHovered = hoveredItem === item.id;
                  
                  return (
                    <motion.div
                      key={item.id}
                      variants={cardVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Link
                        href={item.href}
                        className={`
                          flex items-center p-3 rounded-lg transition-all duration-200
                          hover:bg-gray-50 dark:hover:bg-gray-800
                          ${isHovered ? 'shadow-md' : ''}
                        `}
                        onMouseEnter={() => setHoveredItem(item.id)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        <IconComponent className={`w-5 h-5 ${item.color || 'text-gray-600 dark:text-gray-400'} mr-3`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.label}
                            </span>
                            <div className="flex items-center">
                              {item.badge && (
                                <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 text-xs font-bold rounded-full mr-2">
                                  {item.badge}
                                </span>
                              )}
                              <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                            </div>
                          </div>
                          {item.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Recent Activity */}
        <motion.div 
          className="p-4 border-t border-gray-200 dark:border-gray-700"
          variants={itemVariants}
        >
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Recent Activity
          </h3>
          <div className="space-y-2">
            <div className="flex items-center p-2 text-xs">
              <ClockIcon className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-gray-600 dark:text-gray-400">
                Order #12345 shipped
              </span>
              <span className="ml-auto text-gray-500">2h ago</span>
            </div>
            <div className="flex items-center p-2 text-xs">
              <StarIcon className="w-4 h-4 text-yellow-500 mr-2" />
              <span className="text-gray-600 dark:text-gray-400">
                Review request for Cotton Fabric
              </span>
              <span className="ml-auto text-gray-500">1d ago</span>
            </div>
            <div className="flex items-center p-2 text-xs">
              <HeartIcon className="w-4 h-4 text-red-500 mr-2" />
              <span className="text-gray-600 dark:text-gray-400">
                Item added to wishlist
              </span>
              <span className="ml-auto text-gray-500">3d ago</span>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto"
          variants={itemVariants}
        >
          <button className="flex items-center w-full p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200">
            <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </motion.div>
      </motion.div>
    </>
  );
};

export default AccountSidebar;