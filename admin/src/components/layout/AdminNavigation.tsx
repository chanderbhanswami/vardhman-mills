'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  CubeIcon,
  TagIcon,
  ShoppingBagIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

interface NavigationItem {
  name: string;
  href?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children?: NavigationItem[];
  badge?: string;
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
  },
  {
    name: 'Products',
    icon: CubeIcon,
    children: [
      { name: 'All Products', href: '/dashboard/products', icon: CubeIcon },
      { name: 'Add Product', href: '/dashboard/products/new', icon: CubeIcon },
      { name: 'Categories', href: '/dashboard/categories', icon: TagIcon },
      { name: 'Reviews', href: '/dashboard/reviews', icon: ChartBarIcon },
    ],
  },
  {
    name: 'Orders',
    icon: ShoppingBagIcon,
    children: [
      { name: 'All Orders', href: '/dashboard/orders', icon: ShoppingBagIcon },
      { name: 'Pending Orders', href: '/dashboard/orders?status=pending', icon: ShoppingBagIcon, badge: '5' },
      { name: 'Shipped Orders', href: '/dashboard/orders?status=shipped', icon: ShoppingBagIcon },
      { name: 'Delivered Orders', href: '/dashboard/orders?status=delivered', icon: ShoppingBagIcon },
    ],
  },
  {
    name: 'Customers',
    icon: UsersIcon,
    children: [
      { name: 'All Customers', href: '/dashboard/customers', icon: UsersIcon },
      { name: 'Add Customer', href: '/dashboard/customers/new', icon: UsersIcon },
      { name: 'Customer Groups', href: '/dashboard/customer-groups', icon: UsersIcon },
    ],
  },
  {
    name: 'Analytics',
    icon: ChartBarIcon,
    children: [
      { name: 'Sales Report', href: '/dashboard/analytics/sales', icon: ChartBarIcon },
      { name: 'Product Analytics', href: '/dashboard/analytics/products', icon: ChartBarIcon },
      { name: 'Customer Analytics', href: '/dashboard/analytics/customers', icon: ChartBarIcon },
      { name: 'Traffic Analytics', href: '/dashboard/analytics/traffic', icon: ChartBarIcon },
    ],
  },
  {
    name: 'Settings',
    icon: CogIcon,
    children: [
      { name: 'General Settings', href: '/dashboard/settings/general', icon: CogIcon },
      { name: 'Payment Settings', href: '/dashboard/settings/payments', icon: CogIcon },
      { name: 'Shipping Settings', href: '/dashboard/settings/shipping', icon: CogIcon },
      { name: 'Email Settings', href: '/dashboard/settings/email', icon: CogIcon },
      { name: 'SEO Settings', href: '/dashboard/settings/seo', icon: CogIcon },
    ],
  },
];

interface AdminNavigationProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export default function AdminNavigation({ isMobileMenuOpen, setIsMobileMenuOpen }: AdminNavigationProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isActive = (href: string) => {
    if (!pathname) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const isParentActive = (children: NavigationItem[]) => {
    return children.some(child => child.href && isActive(child.href));
  };

  const NavigationItems = ({ items, mobile = false }: { items: NavigationItem[]; mobile?: boolean }) => (
    <ul className="space-y-1">
      {items.map((item) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems.includes(item.name);
        const parentActive = hasChildren ? isParentActive(item.children!) : false;

        if (hasChildren) {
          return (
            <li key={item.name}>
              <button
                onClick={() => toggleExpanded(item.name)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  parentActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center">
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </div>
                {isExpanded ? (
                  <ChevronDownIcon className="h-4 w-4" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4" />
                )}
              </button>
              
              {isExpanded && (
                <ul className="mt-1 ml-6 space-y-1">
                  {item.children!.map((child) => (
                    <li key={child.name}>
                      <Link
                        href={child.href!}
                        onClick={() => mobile && setIsMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                          isActive(child.href!)
                            ? 'bg-blue-100 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <span>{child.name}</span>
                        {child.badge && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {child.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        }

        return (
          <li key={item.name}>
            <Link
              href={item.href!}
              onClick={() => mobile && setIsMobileMenuOpen(false)}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                isActive(item.href!)
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4">
            <Link href="/dashboard" className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900">
                Vardhman Mills
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="mt-8 flex-1 px-4">
            <NavigationItems items={navigation} />
          </nav>

          {/* User Info */}
          <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                <UsersIcon className="h-5 w-5 text-gray-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">Admin User</p>
                <p className="text-xs text-gray-500">admin@vardhmanmills.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 flex z-40">
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Sidebar */}
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <XMarkIcon className="h-6 w-6 text-white" />
                </button>
              </div>

              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                {/* Logo */}
                <div className="flex-shrink-0 flex items-center px-4">
                  <Link href="/dashboard" className="flex items-center">
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">V</span>
                    </div>
                    <span className="ml-2 text-xl font-semibold text-gray-900">
                      Vardhman Mills
                    </span>
                  </Link>
                </div>

                {/* Navigation */}
                <nav className="mt-8 px-4">
                  <NavigationItems items={navigation} mobile />
                </nav>
              </div>

              {/* User Info */}
              <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <UsersIcon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">Admin User</p>
                    <p className="text-xs text-gray-500">admin@vardhmanmills.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 z-30 p-4">
        <button
          type="button"
          className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>
    </>
  );
}
