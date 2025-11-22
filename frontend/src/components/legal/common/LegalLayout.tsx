'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpIcon,
  PrinterIcon,
  ShareIcon,
  BookmarkIcon,
  ClockIcon,
  TagIcon,
  ChevronRightIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { LegalLayoutProps, formatDate } from './index';

const LegalLayout: React.FC<LegalLayoutProps> = ({
  children,
  title,
  description,
  breadcrumbs = [],
  lastUpdated,
  version,
  className = ''
}) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      
      setReadingProgress(progress);
      setShowScrollTop(scrollTop > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    }
  };

  // Toggle bookmark
  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // Save to localStorage or send to backend
    const bookmarks = JSON.parse(localStorage.getItem('legalBookmarks') || '[]');
    const currentUrl = window.location.pathname;
    
    if (isBookmarked) {
      const filtered = bookmarks.filter((bookmark: string) => bookmark !== currentUrl);
      localStorage.setItem('legalBookmarks', JSON.stringify(filtered));
    } else {
      bookmarks.push(currentUrl);
      localStorage.setItem('legalBookmarks', JSON.stringify(bookmarks));
    }
  };

  // Check if page is bookmarked on mount
  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem('legalBookmarks') || '[]');
    setIsBookmarked(bookmarks.includes(window.location.pathname));
  }, []);

  // Using inline animations instead of variants to avoid TypeScript type conflicts

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className={`min-h-screen bg-gray-50 ${className}`}
    >
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div 
          className="h-1 bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
          data-progress={readingProgress}
        />
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <nav className="flex py-4" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <Link 
                    href="/" 
                    className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <HomeIcon className="h-4 w-4 mr-2" />
                    Home
                  </Link>
                </li>
                
                {breadcrumbs.map((breadcrumb, index) => (
                  <li key={index}>
                    <div className="flex items-center">
                      <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-1" />
                      {breadcrumb.href ? (
                        <Link 
                          href={breadcrumb.href}
                          className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                        >
                          {breadcrumb.label}
                        </Link>
                      ) : (
                        <span className="text-sm font-medium text-gray-500">
                          {breadcrumb.label}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* Page Header */}
          <div className="py-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
                  {title}
                </h1>
                
                {description && (
                  <p className="text-lg text-gray-600 max-w-3xl leading-relaxed">
                    {description}
                  </p>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-6 mt-6 text-sm text-gray-500">
                  {lastUpdated && (
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      <span>Last updated: {formatDate(lastUpdated)}</span>
                    </div>
                  )}
                  
                  {version && (
                    <div className="flex items-center">
                      <TagIcon className="h-4 w-4 mr-2" />
                      <span>Version {version}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 ml-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleBookmark}
                  className={`
                    p-3 rounded-lg border transition-all duration-200
                    ${isBookmarked 
                      ? 'bg-blue-50 border-blue-200 text-blue-600' 
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }
                  `}
                  title={isBookmarked ? 'Remove bookmark' : 'Bookmark this page'}
                >
                  {isBookmarked ? (
                    <BookmarkSolidIcon className="h-5 w-5" />
                  ) : (
                    <BookmarkIcon className="h-5 w-5" />
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  className="p-3 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-all duration-200"
                  title="Share this page"
                >
                  <ShareIcon className="h-5 w-5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrint}
                  className="p-3 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-all duration-200"
                  title="Print this page"
                >
                  <PrinterIcon className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8 lg:p-12">
            {children}
          </div>
        </div>
      </main>

      {/* Floating Toolbar */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 z-40"
          >
            <div className="flex flex-col space-y-3">
              {/* Scroll to Top */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={scrollToTop}
                className="p-3 bg-white border border-gray-200 rounded-full shadow-lg text-gray-600 hover:text-blue-600 hover:border-blue-200 transition-all duration-200"
                title="Scroll to top"
              >
                <ArrowUpIcon className="h-5 w-5" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Print Styles */}
      <style jsx>{`
        [data-progress] {
          width: var(--progress-width, 0%);
        }
        
        @media print {
          .no-print {
            display: none !important;
          }
          
          .print-break-inside-avoid {
            break-inside: avoid;
          }
          
          .print-break-before {
            break-before: page;
          }
        }
      `}</style>
      
      <style jsx>{`
        [data-progress="${readingProgress}"] {
          --progress-width: ${readingProgress}%;
        }
      `}</style>
    </motion.div>
  );
};

export default LegalLayout;
