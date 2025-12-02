/**
 * Content Layout - Vardhman Mills Frontend
 * 
 * Shared layout for all public content pages including newsletter pages,
 * legal pages, blog, about, contact, and other informational pages.
 * 
 * Features:
 * - Full header and footer navigation (using main components)
 * - Breadcrumb support
 * - SEO optimization
 * - Responsive design
 * - Dark mode support
 * - Smooth scroll behavior
 * - Back to top button
 * 
 * @module app/(content)/layout
 * @version 2.0.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

// Use main layout components for consistency
const Header = dynamic(() => import('@/components/layout/Header'), {
  loading: () => <div className="h-20 bg-background border-b border-border" />,
  ssr: false
});

const Footer = dynamic(() => import('@/components/layout/Footer'), {
  loading: () => <div className="h-64 bg-background" />,
  ssr: false
});

const Breadcrumbs = dynamic(() => import('@/components/layout/Breadcrumbs'), {
  loading: () => <div className="h-10" />,
  ssr: false
});

/**
 * Content Layout Component
 * 
 * Provides a consistent layout for all public content pages using
 * the main Header and Footer components for standardization.
 */
export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if breadcrumbs should be shown
  const showBreadcrumbs = pathname !== '/';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header - Using main component */}
      <Header isScrolled={scrolled} />

      {/* Main Content with top padding for fixed header */}
      <main className="flex-1 pt-20">
        {/* Breadcrumbs */}
        {showBreadcrumbs && (
          <div className="bg-muted/30 border-b border-border sticky top-20 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <Breadcrumbs />
            </div>
          </div>
        )}

        {/* Page Content with Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          {children}
        </motion.div>
      </main>

      {/* Footer - Using main component */}
      <Footer />
    </div>
  );
}
