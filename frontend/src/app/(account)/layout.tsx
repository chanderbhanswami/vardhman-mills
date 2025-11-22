/**
 * Account Section Layout - Vardhman Mills
 * 
 * Root layout for all account-related pages with:
 * - Authentication protection
 * - Sidebar navigation
 * - Mobile responsiveness
 * - Error boundary
 * - Loading states
 * - SEO metadata
 * - Breadcrumb management
 * 
 * @layout
 * @version 1.0.0
 */

'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bars3Icon,
  XMarkIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

// Common Components
import { LoadingSpinner, SEOHead, ErrorBoundary } from '@/components/common';

// UI Components
import { Button } from '@/components/ui';

// Layout Components
import { AccountLayout } from '@/components/account';

// Hooks
import { useAuth } from '@/components/providers';
import { useToast } from '@/hooks/useToast';

/**
 * Loading fallback component
 */
const AccountLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Loading your account...
      </p>
    </div>
  </div>
);

/**
 * Account Section Layout Component
 */
export default function AccountSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Hooks
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // ============================================================================
  // AUTHENTICATION CHECK
  // ============================================================================

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Skip authentication check during loading
    if (authLoading || !isClient) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      const redirectUrl = encodeURIComponent(pathname || '/account');
      
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to access your account',
        variant: 'warning',
      });

      router.push(`/login?redirect=${redirectUrl}`);
    }
  }, [isAuthenticated, authLoading, pathname, router, toast, isClient]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSidebarToggle = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleGoBack = () => {
    router.back();
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (!isClient || authLoading) {
    return <AccountLoadingFallback />;
  }

  // ============================================================================
  // UNAUTHENTICATED STATE
  // ============================================================================

  if (!isAuthenticated) {
    return <AccountLoadingFallback />;
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <ErrorBoundary>
      <SEOHead
        title="My Account - Vardhman Mills"
        description="Manage your orders, addresses, wishlist, and account settings"
        noIndex
      />

      {/* Mobile Navigation Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back</span>
          </Button>

          <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate flex-1 mx-4 text-center">
            My Account
          </h1>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSidebarToggle}
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseSidebar}
              className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-80 bg-white dark:bg-gray-900 z-50 overflow-y-auto shadow-2xl"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Menu
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCloseSidebar}
                    aria-label="Close menu"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </Button>
                </div>

                {/* User Info */}
                {user && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile navigation content will be handled by AccountLayout */}
              <div className="p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  Use the sidebar navigation to access different sections
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content with AccountLayout */}
      <div className="min-h-screen pt-16 lg:pt-0">
        <Suspense fallback={<AccountLoadingFallback />}>
          <AccountLayout>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AccountLayout>
        </Suspense>
      </div>

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white text-xs p-3 rounded-lg space-y-1">
          <div>Path: {pathname}</div>
          <div>User: {user?.email || 'Not logged in'}</div>
          <div>Auth: {isAuthenticated ? 'Yes' : 'No'}</div>
        </div>
      )}
    </ErrorBoundary>
  );
}
