'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export interface NavigationItem {
  label: string;
  href?: string;
  children?: NavigationItem[];
  badge?: string;
  isNew?: boolean;
  isHot?: boolean;
}

export interface NavigationProps {
  items?: NavigationItem[];
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
      { label: 'Shop All', href: '/products' },
      { label: 'Best Sellers', href: '/best-sellers' },
      { label: 'New Arrivals', href: '/new-arrivals' },
      { label: 'Collections', href: '/collections' },
      { label: 'Search Products', href: '/products/search' },
    ],
  },
  {
    label: 'Categories',
    href: '/categories',
  },
  {
    label: 'Brands',
    href: '/brands',
  },
  {
    label: 'Deals',
    href: '/sale',
    badge: 'Sale',
    isHot: true,
  },
  {
    label: 'About',
    children: [
      { label: 'Our Story', href: '/about' },
      { label: 'Our Team', href: '/about/our-team' },
      { label: 'Careers', href: '/about/careers' },
    ],
  },
  {
    label: 'Contact',
    href: '/contact',
  },
];

const Navigation: React.FC<NavigationProps> = ({
  items = defaultNavigationItems,
  className = '',
}) => {
  const pathname = usePathname();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const handleMouseEnter = (label: string) => {
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.15,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  const renderNavigationItem = (item: NavigationItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const itemIsActive = item.href ? isActive(item.href) : false;

    return (
      <div
        key={item.label}
        className="relative"
        onMouseEnter={() => hasChildren && handleMouseEnter(item.label)}
        onMouseLeave={handleMouseLeave}
      >
        {hasChildren ? (
          <button
            className={`
              flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
              ${itemIsActive
                ? 'text-primary bg-primary/10'
                : 'text-foreground hover:text-primary hover:bg-accent'
              }
            `}
            {...(activeDropdown === item.label ? { 'aria-expanded': true } : { 'aria-expanded': false })}
            aria-haspopup="true"
          >
            <span className="relative">
              {item.label}
              {item.badge && (
                <span
                  className={`
                    absolute -top-2 -right-6 px-1.5 py-0.5 text-xs font-bold rounded-full
                    ${item.isHot
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-primary text-primary-foreground'
                    }
                  `}
                >
                  {item.badge}
                </span>
              )}
            </span>
            <ChevronDownIcon
              className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === item.label ? 'rotate-180' : ''
                }`}
            />
          </button>
        ) : (
          <Link
            href={item.href || '#'}
            className={`
              flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
              ${itemIsActive
                ? 'text-primary bg-primary/10'
                : 'text-foreground hover:text-primary hover:bg-accent'
              }
            `}
          >
            <span className="relative">
              {item.label}
              {item.badge && (
                <span
                  className={`
                    absolute -top-2 -right-6 px-1.5 py-0.5 text-xs font-bold rounded-full
                    ${item.isHot
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-primary text-primary-foreground'
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
          </Link>
        )}

        {/* Dropdown Menu */}
        <AnimatePresence>
          {hasChildren && activeDropdown === item.label && (
            <motion.div
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute top-full left-0 mt-1 w-56 bg-background rounded-lg shadow-lg border border-border z-50"
            >
              <div className="py-2">
                {item.children!.map((child) => (
                  <Link
                    key={child.label}
                    href={child.href || '#'}
                    className={`
                      block px-4 py-2 text-sm transition-colors duration-200
                      ${isActive(child.href || '')
                        ? 'text-primary bg-primary/10'
                        : 'text-foreground hover:text-primary hover:bg-accent'
                      }
                    `}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <nav className={`flex items-center space-x-1 ${className}`} role="navigation">
      {items.map(renderNavigationItem)}
    </nav>
  );
};

export default Navigation;