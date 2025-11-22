'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { NavigationItem } from './Navigation';

export interface MobileMenuProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

const defaultNavigationItems: NavigationItem[] = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'Products',
    children: [
      { label: 'Fabrics', href: '/products/fabrics' },
      { label: 'Yarns', href: '/products/yarns' },
      { label: 'Ready-to-Wear', href: '/products/ready-to-wear' },
      { label: 'Home Textiles', href: '/products/home-textiles' },
      { label: 'Industrial Textiles', href: '/products/industrial-textiles' },
    ],
  },
  {
    label: 'Categories',
    children: [
      { label: 'Cotton', href: '/categories/cotton' },
      { label: 'Polyester', href: '/categories/polyester' },
      { label: 'Wool', href: '/categories/wool' },
      { label: 'Silk', href: '/categories/silk' },
      { label: 'Blends', href: '/categories/blends' },
    ],
  },
  {
    label: 'Brands',
    href: '/brands',
  },
  {
    label: 'Deals',
    href: '/deals',
    badge: 'Sale',
    isHot: true,
  },
  {
    label: 'About',
    children: [
      { label: 'Our Story', href: '/about/story' },
      { label: 'Sustainability', href: '/about/sustainability' },
      { label: 'Quality', href: '/about/quality' },
      { label: 'Careers', href: '/about/careers' },
    ],
  },
  {
    label: 'Contact',
    href: '/contact',
  },
];

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen = false,
  onClose,
  className = '',
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [currentLevel, setCurrentLevel] = useState<NavigationItem[]>(defaultNavigationItems);
  const [breadcrumb, setBreadcrumb] = useState<string[]>([]);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const handleItemClick = (item: NavigationItem) => {
    if (item.children && item.children.length > 0) {
      // Navigate to submenu
      setCurrentLevel(item.children);
      setBreadcrumb([...breadcrumb, item.label]);
    } else if (item.href) {
      // Navigate to page
      router.push(item.href);
      onClose?.();
    }
  };

  const handleBackClick = () => {
    if (breadcrumb.length > 0) {
      // Navigate back to parent level
      const newBreadcrumb = breadcrumb.slice(0, -1);
      setBreadcrumb(newBreadcrumb);
      
      // Rebuild current level based on breadcrumb
      let newLevel = defaultNavigationItems;
      newBreadcrumb.forEach(crumb => {
        const parent = newLevel.find(item => item.label === crumb);
        if (parent && parent.children) {
          newLevel = parent.children;
        }
      });
      setCurrentLevel(newLevel);
    }
  };

  const resetMenu = () => {
    setCurrentLevel(defaultNavigationItems);
    setBreadcrumb([]);
  };

  const menuVariants = {
    closed: {
      x: '-100%',
      transition: {
        type: 'tween' as const,
        duration: 0.3,
      },
    },
    open: {
      x: 0,
      transition: {
        type: 'tween' as const,
        duration: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (index: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: index * 0.05,
        duration: 0.2,
      },
    }),
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm lg:hidden"
          />

          {/* Mobile Menu */}
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className={`fixed top-0 left-0 z-50 w-80 h-full bg-white dark:bg-gray-900 shadow-xl lg:hidden ${className}`}
            onAnimationComplete={(definition) => {
              if (definition === 'closed') {
                resetMenu();
              }
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              {breadcrumb.length > 0 ? (
                <button
                  onClick={handleBackClick}
                  className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <ChevronLeftIcon className="w-5 h-5 mr-2" />
                  <span>{breadcrumb[breadcrumb.length - 1]}</span>
                </button>
              ) : (
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Menu
                </h2>
              )}
              
              <button
                onClick={onClose}
                className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close menu"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto">
              <nav className="p-4">
                <div className="space-y-2">
                  {currentLevel.map((item, index) => (
                    <motion.div
                      key={item.label}
                      custom={index}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      className="w-full"
                    >
                      <button
                        onClick={() => handleItemClick(item)}
                        className={`
                          w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors duration-200
                          ${isActive(item.href || '')
                            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                            : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                          }
                        `}
                      >
                        <div className="flex items-center">
                          <span className="font-medium relative">
                            {item.label}
                            {item.badge && (
                              <span
                                className={`
                                  absolute -top-2 -right-8 px-1.5 py-0.5 text-xs font-bold rounded-full
                                  ${item.isHot 
                                    ? 'bg-red-500 text-white animate-pulse' 
                                    : 'bg-blue-500 text-white'
                                  }
                                `}
                              >
                                {item.badge}
                              </span>
                            )}
                            {item.isNew && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                            )}
                          </span>
                        </div>
                        
                        {item.children && item.children.length > 0 && (
                          <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </motion.div>
                  ))}
                </div>
              </nav>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-3">
                <Link
                  href="/account"
                  onClick={onClose}
                  className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Account
                </Link>
                
                <Link
                  href="/contact"
                  onClick={onClose}
                  className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Help & Support
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;