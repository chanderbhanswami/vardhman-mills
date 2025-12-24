/**
 * Main Layout - Vardhman Mills Frontend
 * 
 * Comprehensive layout wrapper for main application pages with:
 * - Complete context providers integration
 * - Redux store provider
 * - Theme management
 * - Layout components (Header, Footer, Sidebar, Breadcrumbs)
 * - Notification system
 * - Toast notifications
 * - Modal management
 * - Responsive design
 * - Animation and transitions
 * - SEO optimization
 * - Accessibility features
 * 
 * @module app/(main)/layout
 */

'use client';

import React, { ReactNode, useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Toaster } from 'react-hot-toast';

// Common Components
import {
  ErrorBoundary,
  LoadingScreen,
  BackToTop,
  ScrollToTop,
  SEOHead,
} from '@/components/common';

// Announcement Bar from correct location
import { AnnouncementBar } from '@/components/annoucement-bar';

// Types
// Dynamic layout imports for better performance
const Header = dynamic(() => import('@/components/layout/Header'), {
  loading: () => <div className="h-20 bg-background border-b border-border" />,
  ssr: false
});

const Footer = dynamic(() => import('@/components/layout/Footer'), {
  loading: () => <div className="h-64 bg-muted" />,
  ssr: false
});

const Breadcrumbs = dynamic(() => import('@/components/layout/Breadcrumbs'), {
  loading: () => <div className="h-10" />,
  ssr: false
});

const Sidebar = dynamic(() => import('@/components/layout/Sidebar'), {
  loading: () => <div className="w-80 bg-background" />,
  ssr: false
});

// Layout Props Interface
interface MainLayoutProps {
  children: ReactNode;
}

// Layout State Interface
interface LayoutState {
  isLoading: boolean;
  isMounted: boolean;
  isScrolled: boolean;
  scrollProgress: number;
  isSidebarOpen: boolean;
  windowWidth: number;
  windowHeight: number;
}

/**
 * Main Layout Component
 * Wraps all main application pages with necessary providers and layout components
 */
export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();

  // Component State
  const [state, setState] = useState<LayoutState>({
    isLoading: true,
    isMounted: false,
    isScrolled: false,
    scrollProgress: 0,
    isSidebarOpen: false,
    windowWidth: 1024,
    windowHeight: 768,
  });

  // Responsive breakpoints
  const { isMobile, isDesktop } = useMemo(() => ({
    isMobile: state.windowWidth < 768,
    isDesktop: state.windowWidth >= 1024,
  }), [state.windowWidth]);

  // Check if sidebar should be shown based on route
  const showSidebar = useMemo(() => {
    const sidebarRoutes = ['/account', '/products', '/categories', '/orders'];
    return sidebarRoutes.some(route => pathname?.startsWith(route));
  }, [pathname]);

  // Check if breadcrumbs should be shown
  const showBreadcrumbs = useMemo(() => {
    const noBreadcrumbRoutes = ['/', '/checkout', '/auth'];
    return !noBreadcrumbRoutes.some(route => pathname === route);
  }, [pathname]);

  // Component mounting
  useEffect(() => {
    setState(prev => ({ ...prev, isMounted: true, isLoading: false }));
  }, []);

  // Window size detection
  useEffect(() => {
    const handleResize = () => {
      setState(prev => ({
        ...prev,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
      }));
    };

    if (typeof window !== 'undefined') {
      setState(prev => ({
        ...prev,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
      }));
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Scroll detection and progress
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollProgress = (winScroll / height) * 100;

      setState(prev => ({
        ...prev,
        isScrolled: scrolled,
        scrollProgress: scrollProgress || 0,
      }));
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Handler Functions
  const handleToggleSidebar = useCallback(() => {
    setState(prev => ({ ...prev, isSidebarOpen: !prev.isSidebarOpen }));
  }, []);

  // Error handler
  const handleError = useCallback((error: Error) => {
    console.error('Layout Error:', error);
  }, []);

  // Animation variants
  const layoutVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number]
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3
      }
    }
  };

  const drawerVariants = {
    hidden: {
      x: isMobile ? '-100%' : -320,
      opacity: 0
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30
      }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.2 }
    }
  };

  // Show loading screen on initial load
  if (!state.isMounted || state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingScreen />
      </div>
    );
  }

  // Render main layout
  return (
    <ErrorBoundary onError={handleError}>
      <div className="min-h-screen bg-background transition-colors duration-300">
        {/* SEO Head */}
        <SEOHead
          title="Vardhman Mills - Premium Fabrics & Textiles"
          description="Shop premium quality fabrics and textiles from Vardhman Mills."
          canonical={pathname || '/'}
        />

        {/* Skip to Content Link for Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[9999] bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium shadow-lg"
        >
          Skip to main content
        </a>

        {/* Scroll Progress Bar */}
        {state.isScrolled && (
          <div
            className="fixed top-0 left-0 right-0 h-1 z-[9999] bg-muted"
            role="progressbar"
            aria-label={`Page scroll progress: ${Math.round(state.scrollProgress)}%`}
          >
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${state.scrollProgress}%` } as React.CSSProperties}
            />
          </div>
        )}

        {/* Announcement Bar */}
        <Suspense fallback={<div className="h-10 bg-primary" />}>
          <AnnouncementBar announcements={[]} />
        </Suspense>

        {/* Header */}
        <Header
          isScrolled={state.isScrolled}
        />

        {/* Mobile Sidebar Toggle Button */}
        {showSidebar && !state.isSidebarOpen && isMobile && (
          <button
            onClick={handleToggleSidebar}
            className="fixed bottom-4 left-4 z-50 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors"
            aria-label="Open sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Main Content Area */}
        <div className="relative flex min-h-[calc(100vh-theme(spacing.64))]">
          {/* Sidebar */}
          <AnimatePresence>
            {showSidebar && (state.isSidebarOpen || isDesktop) && (
              <>
                {/* Sidebar Overlay for Mobile */}
                {isMobile && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={overlayVariants}
                    onClick={() => setState(prev => ({ ...prev, isSidebarOpen: false }))}
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                    aria-hidden="true"
                  />
                )}

                {/* Sidebar Component */}
                <motion.aside
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={drawerVariants}
                  className={`
                          ${isMobile ? 'fixed inset-y-0 left-0 z-50 w-80' : 'sticky top-20 h-[calc(100vh-5rem)]'}
                          bg-background shadow-lg overflow-y-auto border-r border-border
                        `}
                >
                  <Sidebar
                    type="account"
                    isOpen={state.isSidebarOpen}
                    onClose={() => setState(prev => ({ ...prev, isSidebarOpen: false }))}
                    isMobile={isMobile}
                  />
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <main
            className="flex-1 w-full"
            id="main-content"
            role="main"
          >
            {/* Breadcrumbs */}
            {showBreadcrumbs && (
              <div className="bg-white border-b border-border sticky top-24 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                  <Breadcrumbs />
                </div>
              </div>
            )}

            {/* Page Content with Animation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={layoutVariants}
                className="relative min-h-[calc(100vh-theme(spacing.40))]"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Footer */}
        <Footer />

        {/* Back to Top Button */}
        {state.isScrolled && <BackToTop />}

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'hsl(var(--popover))',
              color: 'hsl(var(--popover-foreground))',
              border: '1px solid hsl(var(--border))',
            },
          }}
        />

        {/* Scroll to Top Component */}
        <ScrollToTop />
      </div>
    </ErrorBoundary>
  );
}

// Export metadata for SEO
// Metadata removed (cannot be exported from client components)
