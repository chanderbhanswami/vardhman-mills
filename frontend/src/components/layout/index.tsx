'use client';

import React, { ReactNode, useEffect, useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Loading } from '../ui';

// Dynamic imports to avoid circular dependencies
const Header = dynamic(() => import('./Header'), { 
  loading: () => <div className="h-16 bg-white border-b" />,
  ssr: false 
});

const Footer = dynamic(() => import('./Footer'), { 
  loading: () => <div className="h-32 bg-gray-100" />,
  ssr: false 
});

const Breadcrumbs = dynamic(() => import('./Breadcrumbs'), { 
  loading: () => <div className="h-8" />,
  ssr: false 
});

const Sidebar = dynamic(() => import('./Sidebar'), { 
  loading: () => <div className="w-80 bg-white" />,
  ssr: false 
});

interface LayoutProps {
  children: ReactNode;
  showBreadcrumbs?: boolean;
  showSidebar?: boolean;
  sidebarType?: 'category' | 'filter' | 'account';
  sidebarTitle?: string;
  className?: string;
  containerClassName?: string;
  requireAuth?: boolean;
  allowGuestAccess?: boolean;
  loadingComponent?: ReactNode;
}

interface LayoutState {
  isSidebarOpen: boolean;
  isMobileMenuOpen: boolean;
  isScrolled: boolean;
  isLoading: boolean;
  windowWidth: number;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  showBreadcrumbs = true,
  showSidebar = false,
  sidebarType = 'category',
  sidebarTitle,
  className = '',
  containerClassName = '',
  // requireAuth = false, // TODO: Implement auth checking
  // allowGuestAccess = true, // TODO: Implement guest access control
  loadingComponent,
}) => {
  const pathname = usePathname();
  
  // Component state
  const [state, setState] = useState<LayoutState>({
    isSidebarOpen: false,
    isMobileMenuOpen: false,
    isScrolled: false,
    isLoading: false,
    windowWidth: 1024,
  });

  // Window size detection
  useEffect(() => {
    const handleResize = () => {
      setState(prev => ({ ...prev, windowWidth: window.innerWidth }));
    };

    if (typeof window !== 'undefined') {
      setState(prev => ({ ...prev, windowWidth: window.innerWidth }));
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Responsive breakpoints
  const { isMobile, isDesktop } = useMemo(() => ({
    isMobile: state.windowWidth < 768,
    isDesktop: state.windowWidth >= 1024,
  }), [state.windowWidth]);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10;
      setState(prev => ({ ...prev, isScrolled: scrolled }));
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Sidebar management
  const toggleSidebar = () => {
    setState(prev => ({ ...prev, isSidebarOpen: !prev.isSidebarOpen }));
  };

  const closeSidebar = () => {
    setState(prev => ({ ...prev, isSidebarOpen: false }));
  };

  // Mobile menu management
  const toggleMobileMenu = () => {
    setState(prev => ({ ...prev, isMobileMenuOpen: !prev.isMobileMenuOpen }));
  };

  const closeMobileMenu = () => {
    setState(prev => ({ ...prev, isMobileMenuOpen: false }));
  };

  // Close mobile menu on route change (pathname changes)
  useEffect(() => {
    closeMobileMenu();
    closeSidebar();
  }, [pathname]);

  // Layout animations
  const layoutVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1] as const
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { 
        duration: 0.2
      }
    }
  };

  const sidebarVariants = {
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

  // Render loading component
  if (state.isLoading && loadingComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {loadingComponent}
      </div>
    );
  }

  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${className}`}
      lang="en"
    >
      {/* Header */}
      <Header
        isMobileMenuOpen={state.isMobileMenuOpen}
        isScrolled={state.isScrolled}
        onToggleMobileMenu={toggleMobileMenu}
        onCloseMobileMenu={closeMobileMenu}
      />

      {/* Main Content Area */}
      <div className="relative flex">
        {/* Sidebar */}
        <AnimatePresence>
          {showSidebar && (state.isSidebarOpen || isDesktop) && (
            <motion.aside
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={sidebarVariants}
              className={`
                fixed inset-y-0 left-0 z-40 w-80 bg-white dark:bg-gray-800 shadow-lg
                ${isMobile ? 'top-16' : 'top-20'}
                ${isDesktop ? 'relative z-auto' : ''}
              `}
            >
              <Sidebar
                type={sidebarType}
                title={sidebarTitle}
                isOpen={state.isSidebarOpen}
                onClose={closeSidebar}
                isMobile={isMobile}
              />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Sidebar Overlay for Mobile */}
        <AnimatePresence>
          {showSidebar && state.isSidebarOpen && isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSidebar}
              className="fixed inset-0 z-30 bg-black bg-opacity-50 backdrop-blur-sm"
            />
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main 
          className={`
            flex-1 min-h-screen
            ${showSidebar && isDesktop ? 'ml-0' : ''}
            ${containerClassName}
          `}
          id="main-content"
        >
          <motion.div
            key={pathname}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={layoutVariants}
            className="relative"
          >
            {/* Breadcrumbs */}
            {showBreadcrumbs && (
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <Breadcrumbs />
                </div>
              </div>
            )}

            {/* Page Content */}
            <div className="relative">
              {children}
            </div>
          </motion.div>
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* Sidebar Toggle Button for Mobile */}
      {showSidebar && isMobile && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleSidebar}
          className={`
            fixed bottom-4 right-4 z-50 w-12 h-12 bg-primary-600 text-white rounded-full shadow-lg
            flex items-center justify-center transition-colors duration-200
            hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
          `}
          aria-label="Toggle sidebar"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </motion.button>
      )}

      {/* Back to Top Button */}
      <AnimatePresence>
        {state.isScrolled && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`
              fixed bottom-4 left-4 z-50 w-12 h-12 bg-gray-800 dark:bg-gray-700 text-white rounded-full shadow-lg
              flex items-center justify-center transition-colors duration-200
              hover:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
              ${showSidebar && isMobile ? 'bottom-20' : ''}
            `}
            aria-label="Back to top"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Skip to Content Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary-600 text-white px-4 py-2 rounded-md font-medium"
      >
        Skip to main content
      </a>
    </div>
  );
};

export default Layout;