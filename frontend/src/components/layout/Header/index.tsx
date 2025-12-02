'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

// Static imports for better performance
import TopBar from './TopBar';
import Logo from './Logo';
import Navigation from './Navigation';
import SearchBar from './SearchBar';
import MobileMenu from './MobileMenu';
import HomeIcon from './HomeIcon';
import ShopIcon from './ShopIcon';

// Dynamic imports for components that might not be immediately needed
const UserMenu = dynamic(() => import('./UserMenu'), { ssr: false });
const CartIcon = dynamic(() => import('./CartIcon'), { ssr: false });
const WishlistIcon = dynamic(() => import('./WishlistIcon'), { ssr: false });
const LanguageSelector = dynamic(() => import('./LanguageSelector'), { ssr: false });
const Notification = dynamic(() => import('./Notification'), { ssr: false });

import { ThemeToggle } from '@/components/common/ThemeToggle';

export interface HeaderProps {
  isMobileMenuOpen?: boolean;
  isScrolled?: boolean;
  onToggleMobileMenu?: () => void;
  onCloseMobileMenu?: () => void;
  className?: string;
  showTopBar?: boolean;
  showSearch?: boolean;
  compact?: boolean;
}

interface HeaderState {
  isSticky: boolean;
  searchVisible: boolean;
  lastScrollY: number;
  headerHeight: number;
}

const Header: React.FC<HeaderProps> = ({
  isMobileMenuOpen = false,
  isScrolled = false,
  onToggleMobileMenu,
  onCloseMobileMenu,
  className = '',
  showTopBar = true,
  showSearch = true,
  compact = false,
}) => {
  const [state, setState] = useState<HeaderState>({
    isSticky: false,
    searchVisible: false,
    lastScrollY: 0,
    headerHeight: 0,
  });

  // Scroll behavior for sticky header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > state.lastScrollY;
      const scrollingUp = currentScrollY < state.lastScrollY;

      setState(prev => ({
        ...prev,
        isSticky: currentScrollY > 100,
        lastScrollY: currentScrollY,
      }));

      // Hide header when scrolling down, show when scrolling up
      if (scrollingDown && currentScrollY > 200) {
        setState(prev => ({ ...prev, isSticky: false }));
      } else if (scrollingUp || currentScrollY < 100) {
        setState(prev => ({ ...prev, isSticky: true }));
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [state.lastScrollY]);

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isMobileMenuOpen) {
        onCloseMobileMenu?.();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isMobileMenuOpen, onCloseMobileMenu]);

  const toggleSearch = () => {
    setState(prev => ({ ...prev, searchVisible: !prev.searchVisible }));
  };

  const headerVariants = {
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
    hidden: {
      y: -100,
      opacity: 0.8,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  const searchBarVariants = {
    visible: {
      opacity: 1,
      scaleX: 1,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
    hidden: {
      opacity: 0,
      scaleX: 0.95,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  return (
    <>
      {/* Top Bar */}
      {showTopBar && !compact && (
        <TopBar className={isScrolled ? 'hidden' : ''} />
      )}

      {/* Main Header */}
      <motion.header
        variants={headerVariants}
        animate={state.isSticky ? 'visible' : 'visible'}
        className={`
          sticky top-0 z-50 bg-background/80 backdrop-blur-md transition-all duration-300
          ${isScrolled ? 'shadow-sm border-b border-border' : 'border-b border-transparent'}
          ${compact ? 'py-2' : 'py-3 lg:py-4'}
          ${className}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu Button */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={onToggleMobileMenu}
                className="p-2 rounded-md text-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Toggle mobile menu"
              >
                <motion.div
                  animate={isMobileMenuOpen ? 'open' : 'closed'}
                  className="w-6 h-6 flex flex-col justify-center items-center"
                >
                  <motion.span
                    variants={{
                      closed: { rotate: 0, y: 0 },
                      open: { rotate: 45, y: 6 },
                    }}
                    className="block w-6 h-0.5 bg-current transform transition-transform"
                  />
                  <motion.span
                    variants={{
                      closed: { opacity: 1 },
                      open: { opacity: 0 },
                    }}
                    className="block w-6 h-0.5 bg-current mt-1.5 transition-opacity"
                  />
                  <motion.span
                    variants={{
                      closed: { rotate: 0, y: 0 },
                      open: { rotate: -45, y: -6 },
                    }}
                    className="block w-6 h-0.5 bg-current mt-1.5 transform transition-transform"
                  />
                </motion.div>
              </button>
            </div>

            {/* Logo */}
            <div className="flex-shrink-0">
              <Logo compact={compact} />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:space-x-8">
              <div className="flex items-center space-x-2 text-foreground">
                <HomeIcon size="sm" />
                <ShopIcon size="sm" />
              </div>
              <Navigation />
            </div>

            {/* Search Bar - Desktop */}
            {showSearch && (
              <div className="hidden md:flex flex-1 max-w-lg mx-8">
                <SearchBar />
              </div>
            )}

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Search Toggle - Mobile */}
              {showSearch && (
                <button
                  onClick={toggleSearch}
                  className="md:hidden p-2 rounded-md text-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Toggle search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              )}

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Language Selector */}
              <div className="hidden sm:block">
                <LanguageSelector />
              </div>

              {/* Notifications */}
              <Notification />

              {/* Wishlist */}
              <WishlistIcon />

              {/* Cart */}
              <CartIcon />

              {/* User Menu */}
              <UserMenu />
            </div>
          </div>

          {/* Mobile Search Bar */}
          <AnimatePresence>
            {showSearch && state.searchVisible && (
              <motion.div
                variants={searchBarVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="md:hidden py-3 border-t border-gray-100 dark:border-gray-800"
              >
                <SearchBar
                  onClose={() => setState(prev => ({ ...prev, searchVisible: false }))}
                  autoFocus
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={onCloseMobileMenu}
      />

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseMobileMenu}
            className="fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;