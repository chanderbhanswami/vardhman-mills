/**
 * AccountLayout Component
 * 
 * Main layout wrapper for account pages with sidebar navigation,
 * header, and content area. Provides responsive design and
 * authentication checks.
 * 
 * Features:
 * - Responsive sidebar navigation
 * - Account header integration
 * - Authentication protection
 * - Breadcrumb support
 * - Mobile-friendly design
 * - Loading states
 * - Error boundaries
 * - Theme support
 * 
 * @component
 */

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bars3Icon,
  XMarkIcon,
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import LoadingSpinner from '@/components/common/Loading/LoadingSpinner';
import ErrorBoundary from '@/components/common/Error/ErrorBoundary';
import { AccountHeader } from './AccountHeader';
import { AccountSidebar } from './AccountSidebar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers';
import { useMediaQuery } from '@/hooks/common/useMediaQuery';
import { useLocalStorage } from '@/hooks/localStorage/useLocalStorage';
import toast from 'react-hot-toast';

// Types
export interface AccountLayoutProps {
  /** Page content */
  children: React.ReactNode;
  /** Page title for header */
  title?: string;
  /** Breadcrumb items */
  breadcrumbs?: Array<{
    label: string;
    href?: string;
    icon?: React.ComponentType<{ className?: string }>;
  }>;
  /** Show search in header */
  showSearch?: boolean;
  /** Header variant */
  headerVariant?: 'default' | 'compact' | 'minimal';
  /** Layout variant */
  variant?: 'default' | 'wide' | 'narrow';
  /** Hide sidebar */
  hideSidebar?: boolean;
  /** Custom header actions */
  headerActions?: React.ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: string | null;
  /** Additional CSS classes */
  className?: string;
  /** Custom sidebar content */
  sidebarContent?: React.ReactNode;
  /** Disable authentication check */
  noAuth?: boolean;
}

interface PageConfig {
  title: string;
  description?: string;
  requiresVerification?: boolean;
  securityLevel?: 'basic' | 'medium' | 'high';
}

// Page configurations
const PAGE_CONFIGS: Record<string, PageConfig> = {
  '/account': {
    title: 'Dashboard',
    description: 'Overview of your account activity and quick actions',
  },
  '/account/profile': {
    title: 'Profile',
    description: 'Manage your personal information and preferences',
  },
  '/account/security': {
    title: 'Security',
    description: 'Password, two-factor authentication, and security settings',
    securityLevel: 'high',
    requiresVerification: true,
  },
  '/account/addresses': {
    title: 'Addresses',
    description: 'Manage your delivery and billing addresses',
  },
  '/account/orders': {
    title: 'Orders',
    description: 'Track your orders and view order history',
  },
  '/account/wishlist': {
    title: 'Wishlist',
    description: 'Items you have saved for later',
  },
  '/account/preferences': {
    title: 'Preferences',
    description: 'Customize your shopping experience',
  },
};

// Loading component
const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600 dark:text-gray-400">Loading account...</p>
    </div>
  </div>
);

// Error component
interface PageErrorProps {
  error: string;
  onRetry?: () => void;
}

const PageError: React.FC<PageErrorProps> = ({ error, onRetry }) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center max-w-md mx-auto px-4">
      <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Something went wrong
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try again
        </Button>
      )}
    </div>
  </div>
);

// Verification prompt component
const VerificationPrompt: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4 mb-6"
  >
    <div className="flex items-start gap-3">
      <ShieldExclamationIcon className="w-5 h-5 text-amber-600 mt-0.5" />
      <div className="flex-1">
        <h4 className="font-medium text-amber-800 dark:text-amber-200">
          Verification Required
        </h4>
        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
          This page requires additional verification. Please verify your identity to continue.
        </p>
        <div className="flex items-center gap-2 mt-3">
          <Button size="sm" variant="outline">
            Verify Now
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose}>
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  </motion.div>
);

export const AccountLayout: React.FC<AccountLayoutProps> = ({
  children,
  title,
  breadcrumbs,
  showSearch = true,
  headerVariant = 'default',
  variant = 'default',
  hideSidebar = false,
  headerActions,
  loading = false,
  error = null,
  className,
  sidebarContent,
  noAuth = false,
}) => {
  // Hooks
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const sidebarStorage = useLocalStorage('account-sidebar-collapsed', { defaultValue: false });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(sidebarStorage.value);
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);

  // Mobile sidebar state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Update localStorage when sidebarCollapsed changes
  useEffect(() => {
    sidebarStorage.setValue(sidebarCollapsed);
  }, [sidebarCollapsed, sidebarStorage]);

  // Body scroll lock for mobile menu
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Get page configuration
  const pageConfig = PAGE_CONFIGS[pathname || '/account'] || { title: title || 'Account' };
  const actualTitle = title || pageConfig.title;

  // Authentication check
  useEffect(() => {
    if (!noAuth && !isLoading && !isAuthenticated && pathname) {
      toast.error('Please sign in to access your account');
      router.push(`/auth/signin?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, noAuth, pathname, router]);

  // Verification check
  useEffect(() => {
    if (pageConfig.requiresVerification && user && !user.isEmailVerified) {
      setShowVerificationPrompt(true);
    }
  }, [pageConfig.requiresVerification, user]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  // Handle retry
  const handleRetry = () => {
    window.location.reload();
  };

  // Loading state
  if (!noAuth && isLoading) {
    return <PageLoader />;
  }

  // Authentication required
  if (!noAuth && !isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  // Layout classes
  const layoutClasses = cn(
    'min-h-screen bg-gray-50 dark:bg-gray-900',
    className
  );

  const containerClasses = cn(
    'flex h-screen overflow-hidden',
    {
      'max-w-7xl mx-auto': variant === 'default',
      'max-w-full': variant === 'wide',
      'max-w-4xl mx-auto': variant === 'narrow',
    }
  );

  const mainClasses = cn(
    'flex-1 flex flex-col overflow-hidden',
    {
      'lg:ml-64': !hideSidebar && !sidebarCollapsed && !isMobile,
      'lg:ml-16': !hideSidebar && sidebarCollapsed && !isMobile,
    }
  );

  const contentClasses = cn(
    'flex-1 overflow-auto',
    {
      'p-4 lg:p-6': variant === 'default',
      'p-2 lg:p-4': variant === 'narrow',
      'p-6 lg:p-8': variant === 'wide',
    }
  );

  return (
    <ErrorBoundary>
      <div className={layoutClasses}>
        <div className={containerClasses}>
          {/* Sidebar */}
          {!hideSidebar && (
            <>
              {/* Desktop Sidebar */}
              <div
                className={cn(
                  'hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:overflow-y-auto lg:bg-white lg:dark:bg-gray-800 lg:border-r lg:border-gray-200 lg:dark:border-gray-700 transition-all duration-300',
                  {
                    'lg:w-64': !sidebarCollapsed,
                    'lg:w-16': sidebarCollapsed,
                  }
                )}
              >
                <AccountSidebar
                  collapsed={sidebarCollapsed}
                  onToggle={handleSidebarToggle}
                  variant="desktop"
                  content={sidebarContent}
                />
              </div>

              {/* Mobile Sidebar */}
              <AnimatePresence>
                {mobileMenuOpen && (
                  <>
                    {/* Backdrop */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                      onClick={() => setMobileMenuOpen(false)}
                    />

                    {/* Sidebar */}
                    <motion.div
                      initial={{ x: '-100%' }}
                      animate={{ x: 0 }}
                      exit={{ x: '-100%' }}
                      transition={{ type: 'tween', duration: 0.3 }}
                      className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 lg:hidden overflow-y-auto"
                    >
                      <AccountSidebar
                        collapsed={false}
                        onToggle={() => setMobileMenuOpen(false)}
                        variant="mobile"
                        content={sidebarContent}
                      />
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </>
          )}

          {/* Main Content */}
          <div className={mainClasses}>
            {/* Header */}
            <AccountHeader
              title={actualTitle}
              breadcrumbs={breadcrumbs}
              showSearch={showSearch}
              variant={headerVariant}
              actions={
                <div className="flex items-center gap-2">
                  {/* Mobile Menu Toggle */}
                  {!hideSidebar && isMobile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSidebarToggle}
                      className="lg:hidden p-2"
                      aria-label="Toggle menu"
                    >
                      {mobileMenuOpen ? (
                        <XMarkIcon className="w-5 h-5" />
                      ) : (
                        <Bars3Icon className="w-5 h-5" />
                      )}
                    </Button>
                  )}

                  {/* Desktop Sidebar Toggle */}
                  {!hideSidebar && !isMobile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSidebarToggle}
                      className="hidden lg:flex p-2"
                      aria-label="Toggle sidebar"
                    >
                      <Bars3Icon className="w-5 h-5" />
                    </Button>
                  )}

                  {headerActions}
                </div>
              }
            />

            {/* Content Area */}
            <main className={contentClasses}>
              <div className="mx-auto">
                {/* Page Description */}
                {pageConfig.description && (
                  <div className="mb-6">
                    <p className="text-gray-600 dark:text-gray-400">
                      {pageConfig.description}
                    </p>
                  </div>
                )}

                {/* Verification Prompt */}
                <AnimatePresence>
                  {showVerificationPrompt && (
                    <VerificationPrompt
                      onClose={() => setShowVerificationPrompt(false)}
                    />
                  )}
                </AnimatePresence>

                {/* Content */}
                <Suspense fallback={<PageLoader />}>
                  {loading && <PageLoader />}
                  {error && <PageError error={error} onRetry={handleRetry} />}
                  {!loading && !error && children}
                </Suspense>
              </div>
            </main>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default AccountLayout;
