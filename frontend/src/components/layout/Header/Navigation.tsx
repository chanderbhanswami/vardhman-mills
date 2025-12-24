'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDownIcon,
  HomeIcon,
  ShoppingBagIcon,
  Squares2X2Icon,
  TagIcon,
  SparklesIcon,
  InformationCircleIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  ShoppingBagIcon as ShoppingBagIconSolid,
  Squares2X2Icon as Squares2X2IconSolid,
  TagIcon as TagIconSolid,
  SparklesIcon as SparklesIconSolid,
  InformationCircleIcon as InformationCircleIconSolid,
  EnvelopeIcon as EnvelopeIconSolid
} from '@heroicons/react/24/solid';

export interface NavigationItem {
  label: string;
  href?: string;
  children?: NavigationItem[];
  badge?: string;
  isNew?: boolean;
  isHot?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  iconSolid?: React.ComponentType<{ className?: string }>;
}

export interface NavigationProps {
  items?: NavigationItem[];
  className?: string;
}

const defaultNavigationItems: NavigationItem[] = [
  {
    label: 'Home',
    href: '/',
    icon: HomeIcon,
    iconSolid: HomeIconSolid,
  },
  {
    label: 'Products',
    icon: ShoppingBagIcon,
    iconSolid: ShoppingBagIconSolid,
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
    icon: Squares2X2Icon,
    iconSolid: Squares2X2IconSolid,
  },
  {
    label: 'Brands',
    href: '/brands',
    icon: TagIcon,
    iconSolid: TagIconSolid,
  },
  {
    label: 'Deals',
    href: '/sale',
    badge: 'Sale',
    isHot: true,
    icon: SparklesIcon,
    iconSolid: SparklesIconSolid,
  },
  {
    label: 'About',
    icon: InformationCircleIcon,
    iconSolid: InformationCircleIconSolid,
    children: [
      { label: 'Our Story', href: '/about' },
      { label: 'Our Team', href: '/about/our-team' },
      { label: 'Careers', href: '/about/careers' },
    ],
  },
  {
    label: 'Contact',
    href: '/contact',
    icon: EnvelopeIcon,
    iconSolid: EnvelopeIconSolid,
  },
];

const Navigation: React.FC<NavigationProps> = ({
  items = defaultNavigationItems,
  className = '',
}) => {
  const pathname = usePathname();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const isActive = (href: string) => {
    if (!pathname || !href) return false;
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
      },
    },
  };

  const renderNavigationItem = (item: NavigationItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const itemIsActive = isActive(item.href || '') || (hasChildren && item.children?.some(child => isActive(child.href || '')));
    const Icon = itemIsActive && item.iconSolid ? item.iconSolid : item.icon;

    const navItemClasses = `
      group relative flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg
      text-sm font-medium transition-all duration-200
      ${itemIsActive
        ? 'text-black bg-gray-100 font-bold shadow-sm hover:text-black'
        : 'text-gray-800 hover:text-black hover:bg-gray-50'
      }
    `;

    const iconClasses = `w-6 h-6 mb-1 transition-transform duration-200 group-hover:scale-110 ${itemIsActive ? 'text-black group-hover:text-black' : 'text-gray-800 group-hover:text-black'}`;

    return (
      <div
        key={item.label}
        className="relative"
        onMouseEnter={() => hasChildren && handleMouseEnter(item.label)}
        onMouseLeave={handleMouseLeave}
      >
        {hasChildren ? (
          <button
            className={navItemClasses}
            {...(activeDropdown === item.label ? { 'aria-expanded': true } : { 'aria-expanded': false })}
            aria-haspopup="true"
          >
            {Icon && <Icon className={iconClasses} />}
            <span className="relative flex items-center gap-1">
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
              <ChevronDownIcon
                className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === item.label ? 'rotate-180' : ''}`}
              />
            </span>
          </button>
        ) : (
          <Link
            href={item.href || '#'}
            className={navItemClasses}
          >
            {Icon && <Icon className={iconClasses} />}
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
              className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
            >
              <div className="py-2">
                {item.children!.map((child) => (
                  <Link
                    key={child.label}
                    href={child.href || '#'}
                    className={`
                        block px-4 py-2 text-sm transition-colors duration-200
                        ${isActive(child.href || '')
                        ? 'text-black bg-gray-100 font-bold'
                        : 'text-gray-900 hover:text-black hover:bg-gray-50'
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
    <nav className={`flex items-center gap-2 ${className}`}>
      {items.map(renderNavigationItem)}
    </nav>
  );
};

export default Navigation;