'use client';

import React, { useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { HomeIcon } from '@heroicons/react/24/outline';
import BreadcrumbItem, { BreadcrumbItemData } from './BreadcrumbItem';

export interface BreadcrumbsProps {
  items?: BreadcrumbItemData[];
  showHome?: boolean;
  homeLabel?: string;
  homeHref?: string;
  separator?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  maxItems?: number;
  autoGenerate?: boolean;
  customRouteLabels?: Record<string, string>;
}

interface RouteConfig {
  [key: string]: {
    label: string;
    icon?: React.ReactNode;
  };
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  showHome = true,
  homeLabel = 'Home',
  homeHref = '/',
  className = '',
  containerClassName = '',
  maxItems = 4,
  autoGenerate = true,
  customRouteLabels = {},
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Format segment label from URL segment - defined before useMemo
  const formatSegmentLabel = (segment: string): string => {
    return segment
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Auto-generate breadcrumbs from current route
  const generatedItems = useMemo(() => {
    if (!autoGenerate && items) return items;

    // Default route configurations
    const defaultRouteLabels: RouteConfig = {
      '/': { label: 'Home', icon: <HomeIcon className="w-4 h-4 text-black" /> },
      '/products': { label: 'Products' },
      '/categories': { label: 'Categories' },
      '/brands': { label: 'Brands' },
      '/deals': { label: 'Deals' },
      '/account': { label: 'My Account' },
      '/account/profile': { label: 'Profile' },
      '/account/orders': { label: 'Orders' },
      '/account/wishlist': { label: 'Wishlist' },
      '/account/addresses': { label: 'Addresses' },
      '/account/settings': { label: 'Settings' },
      '/cart': { label: 'Shopping Cart' },
      '/checkout': { label: 'Checkout' },
      '/search': { label: 'Search Results' },
      '/blog': { label: 'Blog' },
      '/contact': { label: 'Contact Us' },
      '/about': { label: 'About Us' },
      '/support': { label: 'Support' },
      '/privacy': { label: 'Privacy Policy' },
      '/terms': { label: 'Terms of Service' },
    };

    // Merge custom route labels with defaults
    const routeLabels = { ...defaultRouteLabels, ...customRouteLabels };

    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbItems: BreadcrumbItemData[] = [];

    // Add home if enabled
    if (showHome) {
      breadcrumbItems.push({
        label: homeLabel,
        href: homeHref,
        icon: <HomeIcon className="w-4 h-4 text-black" />,
        isActive: pathname === homeHref,
      });
    }

    // Build breadcrumbs from path segments
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;

      // Get label from route config or format segment
      const routeConfig = routeLabels[currentPath];
      let label: string;
      let icon: React.ReactNode | undefined;

      if (typeof routeConfig === 'string') {
        label = routeConfig;
      } else if (routeConfig) {
        label = routeConfig.label;
        icon = routeConfig.icon;
      } else {
        label = formatSegmentLabel(segment);
      }

      // Handle dynamic routes - check if segment exists in search params
      const queryValue = searchParams.get(segment);
      if (queryValue) {
        label = queryValue;
      }

      breadcrumbItems.push({
        label,
        href: isLast ? undefined : currentPath,
        icon,
        isActive: isLast,
      });
    });

    return breadcrumbItems;
  }, [pathname, items, autoGenerate, showHome, homeLabel, homeHref, customRouteLabels, searchParams]);

  // Truncate breadcrumbs if they exceed maxItems
  const displayItems = useMemo(() => {
    if (generatedItems.length <= maxItems) {
      return generatedItems;
    }

    const firstItem = generatedItems[0];
    const lastItems = generatedItems.slice(-2);
    const middleItems = generatedItems.slice(1, -2);

    if (middleItems.length === 0) {
      return generatedItems;
    }

    return [
      firstItem,
      {
        label: '...',
        isActive: false,
      },
      ...lastItems,
    ];
  }, [generatedItems, maxItems]);

  const containerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
      },
    },
  };

  if (displayItems.length <= 1) {
    return null;
  }

  return (
    <motion.nav
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`py-3 ${containerClassName}`}
      aria-label="Breadcrumb navigation"
    >
      <motion.ol
        className={`flex items-center space-x-1 text-sm ${className}`}
        role="list"
      >
        {displayItems.map((item, index) => (
          <BreadcrumbItem
            key={`${item.href || item.label}-${index}`}
            {...item}
            isLast={index === displayItems.length - 1}
            showSeparator={index < displayItems.length - 1}
          />
        ))}
      </motion.ol>

      {/* Schema.org structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: displayItems
              .filter(item => item.href)
              .map((item, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: item.label,
                item: {
                  '@type': 'WebPage',
                  '@id': `${process.env.NEXT_PUBLIC_SITE_URL || ''}${item.href}`,
                },
              })),
          }),
        }}
      />
    </motion.nav>
  );
};

export default Breadcrumbs;