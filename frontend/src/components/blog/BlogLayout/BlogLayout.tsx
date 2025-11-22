/**
 * BlogLayout Component - Vardhman Mills Frontend
 * 
 * Comprehensive layout wrapper for blog pages with
 * sidebar, navigation, breadcrumbs, and SEO features.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Menu,
  X,
  ChevronRight,
  Home,
  BookOpen,
  Search,
  Star,
  TrendingUp,
  Clock,
  Eye,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Container } from '@/components/ui/Container';
import { Skeleton } from '@/components/ui/Skeleton';
import Link from 'next/link';
import Image from 'next/image';
import { BlogCategories } from '../BlogCategories/BlogCategories';

// Types
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  featuredImage?: string;
  publishedAt: string;
  views: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  count: number;
  postCount: number;
  color: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TagItem {
  id: string;
  name: string;
  slug: string;
  count: number;
}

// Types
export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

export interface SidebarSection {
  id: string;
  title: string;
  type: 'recent' | 'popular' | 'featured' | 'categories' | 'tags' | 'custom';
  items?: BlogPost[] | Category[] | TagItem[];
  component?: React.ReactNode;
  loading?: boolean;
}

export interface BlogLayoutProps {
  /** Page title */
  title?: string;
  /** Page description */
  description?: string;
  /** Breadcrumb navigation */
  breadcrumbs?: BreadcrumbItem[];
  /** Main content */
  children: React.ReactNode;
  /** Sidebar sections */
  sidebar?: SidebarSection[];
  /** Show sidebar */
  showSidebar?: boolean;
  /** Sidebar position */
  sidebarPosition?: 'left' | 'right';
  /** Layout variant */
  variant?: 'default' | 'wide' | 'narrow' | 'fullwidth';
  /** Show header */
  showHeader?: boolean;
  /** Show footer */
  showFooter?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Custom header content */
  headerContent?: React.ReactNode;
  /** Custom footer content */
  footerContent?: React.ReactNode;
  /** SEO metadata */
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    image?: string;
    canonical?: string;
  };
  /** Additional CSS classes */
  className?: string;
  /** Mobile sidebar state */
  mobileSidebarOpen?: boolean;
  /** Callback when mobile sidebar toggles */
  onMobileSidebarToggle?: (open: boolean) => void;
}

/**
 * BlogLayout Component
 * 
 * Complete layout wrapper with responsive sidebar,
 * navigation, and SEO optimization.
 */
export const BlogLayout: React.FC<BlogLayoutProps> = ({
  title,
  description,
  breadcrumbs = [],
  children,
  sidebar = [],
  showSidebar = true,
  sidebarPosition = 'right',
  variant = 'default',
  showHeader = true,
  showFooter = true,
  loading = false,
  headerContent,
  footerContent,
  seo, // eslint-disable-line @typescript-eslint/no-unused-vars
  className = '',
  mobileSidebarOpen = false,
  onMobileSidebarToggle
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(mobileSidebarOpen);

  // Update mobile sidebar state
  useEffect(() => {
    setIsMobileSidebarOpen(mobileSidebarOpen);
  }, [mobileSidebarOpen]);

  /**
   * Toggle mobile sidebar
   */
  const toggleMobileSidebar = () => {
    const newState = !isMobileSidebarOpen;
    setIsMobileSidebarOpen(newState);
    onMobileSidebarToggle?.(newState);
  };

  /**
   * Get container classes based on variant
   */
  const getContainerClasses = () => {
    switch (variant) {
      case 'wide':
        return 'max-w-screen-2xl';
      case 'narrow':
        return 'max-w-4xl';
      case 'fullwidth':
        return 'max-w-full px-4';
      default:
        return 'max-w-7xl';
    }
  };

  /**
   * Get main content classes
   */
  const getMainContentClasses = () => {
    if (!showSidebar) return 'w-full';
    
    const baseClasses = sidebarPosition === 'left' 
      ? 'order-2 lg:order-1' 
      : 'order-1 lg:order-2';
    
    return `${baseClasses} w-full lg:w-2/3 xl:w-3/4`;
  };

  /**
   * Get sidebar classes
   */
  const getSidebarClasses = () => {
    const baseClasses = sidebarPosition === 'left' 
      ? 'order-1 lg:order-2' 
      : 'order-2 lg:order-1';
    
    return `${baseClasses} w-full lg:w-1/3 xl:w-1/4`;
  };

  /**
   * Render breadcrumbs
   */
  const renderBreadcrumbs = () => {
    if (breadcrumbs.length === 0) return null;

    return (
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <Link href="/" className="hover:text-gray-700 transition-colors">
              <Home className="w-4 h-4" />
            </Link>
          </li>
          {breadcrumbs.map((item, index) => (
            <li key={index} className="flex items-center space-x-2">
              <ChevronRight className="w-4 h-4" />
              {item.href && !item.active ? (
                <Link 
                  href={item.href} 
                  className="hover:text-gray-700 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={item.active ? 'text-gray-900 font-medium' : ''}>
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    );
  };

  /**
   * Render page header
   */
  const renderHeader = () => {
    if (!showHeader && !title && !description && !headerContent) return null;

    return (
      <header className="mb-8">
        {headerContent || (
          <div>
            {title && (
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-lg text-gray-600 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}
      </header>
    );
  };

  /**
   * Render sidebar section
   */
  const renderSidebarSection = (section: SidebarSection) => {
    if (section.component) {
      return (
        <div key={section.id} className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {section.title}
          </h3>
          {section.component}
        </div>
      );
    }

    if (section.loading) {
      return (
        <div key={section.id} className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {section.title}
          </h3>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex space-x-3">
                <Skeleton className="w-12 h-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    switch (section.type) {
      case 'recent':
      case 'popular':
      case 'featured':
        return (
          <div key={section.id} className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              {section.type === 'recent' && <Clock className="w-5 h-5 mr-2" />}
              {section.type === 'popular' && <Star className="w-5 h-5 mr-2" />}
              {section.type === 'featured' && <TrendingUp className="w-5 h-5 mr-2" />}
              {section.title}
            </h3>
            <div className="space-y-4">
              {(section.items as BlogPost[])?.slice(0, 5).map((post) => (
                <div key={post.id} className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <Image
                      src={post.featuredImage || '/placeholder-image.jpg'}
                      alt={post.title}
                      width={64}
                      height={64}
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="block group"
                    >
                      <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                        {post.title}
                      </h4>
                      <div className="flex items-center text-xs text-gray-500 space-x-2">
                        <span>{post.publishedAt}</span>
                        <span>•</span>
                        <span className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {post.views}
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'categories':
        return (
          <div key={section.id} className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              {section.title}
            </h3>
            <BlogCategories
              categories={section.items as Category[]}
              variant="compact"
              showStats={true}
            />
          </div>
        );

      case 'tags':
        return (
          <div key={section.id} className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Tag className="w-5 h-5 mr-2" />
              {section.title}
            </h3>
            <div className="flex flex-wrap gap-2">
              {(section.items as TagItem[])?.map((tag) => (
                <Link key={tag.id} href={`/blog/tag/${tag.slug}`}>
                  <Badge 
                    variant="outline" 
                    className="hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-pointer"
                  >
                    {tag.name}
                    {tag.count && (
                      <span className="ml-1 text-xs">({tag.count})</span>
                    )}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  /**
   * Render sidebar
   */
  const renderSidebar = () => {
    if (!showSidebar) return null;

    const sidebarContent = (
      <div className="space-y-8">
        {/* Search */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Search
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search blog posts..."
              className="pl-10"
            />
          </div>
        </Card>

        {/* Sidebar Sections */}
        {sidebar.map(renderSidebarSection)}

        {/* Newsletter Signup */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Stay Updated
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Get the latest blog posts and company updates delivered to your inbox.
          </p>
          <div className="space-y-3">
            <Input placeholder="Enter your email" type="email" />
            <Button className="w-full" size="sm">
              Subscribe
            </Button>
          </div>
        </Card>
      </div>
    );

    return (
      <>
        {/* Desktop Sidebar */}
        <aside className={`hidden lg:block ${getSidebarClasses()}`}>
          <div className="sticky top-8">
            {sidebarContent}
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={toggleMobileSidebar} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Menu</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMobileSidebar}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                {sidebarContent}
              </div>
            </motion.div>
          </div>
        )}
      </>
    );
  };

  /**
   * Render loading state
   */
  const renderLoadingState = () => {
    return (
      <Container className={getContainerClasses()}>
        <div className="py-8">
          {breadcrumbs.length > 0 && (
            <div className="mb-6">
              <Skeleton className="h-4 w-64" />
            </div>
          )}
          
          <div className="mb-8">
            <Skeleton className="h-8 w-96 mb-4" />
            <Skeleton className="h-5 w-full max-w-2xl" />
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className={getMainContentClasses()}>
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </Card>
                ))}
              </div>
            </div>
            
            {showSidebar && (
              <div className={getSidebarClasses()}>
                <div className="space-y-6">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Card key={index} className="p-4">
                      <Skeleton className="h-5 w-32 mb-3" />
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, itemIndex) => (
                          <div key={itemIndex} className="flex space-x-3">
                            <Skeleton className="w-12 h-12 rounded" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-3 w-2/3" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    );
  };

  // Show loading state
  if (loading) {
    return renderLoadingState();
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <Container className={getContainerClasses()}>
        <div className="py-8">
          {/* Mobile Sidebar Toggle */}
          {showSidebar && (
            <div className="lg:hidden mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMobileSidebar}
                className="ml-auto flex items-center space-x-2"
              >
                <Menu className="w-4 h-4" />
                <span>Menu</span>
              </Button>
            </div>
          )}

          {/* Breadcrumbs */}
          {renderBreadcrumbs()}

          {/* Page Header */}
          {renderHeader()}

          {/* Main Layout */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <main className={getMainContentClasses()}>
              {children}
            </main>

            {/* Sidebar */}
            {renderSidebar()}
          </div>

          {/* Footer */}
          {showFooter && footerContent && (
            <footer className="mt-12 pt-8 border-t border-gray-200">
              {footerContent}
            </footer>
          )}
        </div>
      </Container>
    </div>
  );
};

/**
 * Specialized layout components
 */

/**
 * Blog post layout
 */
export const BlogPostLayout: React.FC<Omit<BlogLayoutProps, 'variant'>> = (props) => (
  <BlogLayout {...props} variant="narrow" />
);

/**
 * Blog listing layout
 */
export const BlogListingLayout: React.FC<Omit<BlogLayoutProps, 'variant'>> = (props) => (
  <BlogLayout {...props} variant="wide" />
);

/**
 * Blog category layout
 */
export const BlogCategoryLayout: React.FC<Omit<BlogLayoutProps, 'variant'>> = (props) => (
  <BlogLayout {...props} variant="default" />
);

export default BlogLayout;
