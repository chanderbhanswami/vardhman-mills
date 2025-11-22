/**
 * Content Layout - Vardhman Mills Frontend
 * 
 * Shared layout for all public content pages including newsletter pages,
 * legal pages, blog, about, contact, and other informational pages.
 * 
 * Features:
 * - Full header and footer navigation
 * - Breadcrumb support
 * - SEO optimization
 * - Responsive design
 * - Dark mode support
 * - Smooth scroll behavior
 * - Back to top button
 * 
 * @module app/(content)/layout
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { 
  ArrowUpIcon,
  Bars3Icon,
  XMarkIcon,
  MoonIcon,
  SunIcon,
  ShoppingCartIcon,
  HeartIcon,
  UserIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useTheme } from 'next-themes';

/**
 * Content Layout Component
 * 
 * Provides a consistent layout for all public content pages with:
 * - Persistent header navigation
 * - Footer with links and information
 * - Mobile-responsive menu
 * - Scroll to top functionality
 * - Theme toggle
 * - Shopping cart and wishlist indicators
 */
export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  // Handle component mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrolled(scrollPosition > 50);
      setShowScrollTop(scrollPosition > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigation links
  const navigationLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/categories', label: 'Categories' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
    { href: '/blog', label: 'Blog' },
  ];

  // Quick links for footer
  const quickLinks = [
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact Us' },
    { href: '/careers', label: 'Careers' },
    { href: '/blog', label: 'Blog' },
    { href: '/newsletter/subscribe', label: 'Newsletter' },
  ];

  // Customer service links
  const customerServiceLinks = [
    { href: '/faq', label: 'FAQ' },
    { href: '/shipping-policy', label: 'Shipping Policy' },
    { href: '/return-policy', label: 'Return Policy' },
    { href: '/track-order', label: 'Track Order' },
    { href: '/size-guide', label: 'Size Guide' },
  ];

  // Legal links
  const legalLinks = [
    { href: '/privacy-policy', label: 'Privacy Policy' },
    { href: '/terms-conditions', label: 'Terms & Conditions' },
    { href: '/cookie-policy', label: 'Cookie Policy' },
    { href: '/legal-info', label: 'Legal Information' },
  ];

  /**
   * Header Component
   */
  const Header = () => (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-md'
          : 'bg-white dark:bg-gray-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="border-b border-gray-200 dark:border-gray-800 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 dark:text-gray-400">
                📞 +91-1839-266266
              </span>
              <span className="hidden md:inline text-gray-600 dark:text-gray-400">
                ✉️ info@vardhmanmills.com
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/newsletter/subscribe"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Subscribe to Newsletter
              </Link>
              <span className="text-gray-400">|</span>
              <Link
                href="/track-order"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Track Order
              </Link>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <span className="text-white font-bold text-xl">V</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Vardhman Mills
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Premium Home Furnishings
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <button
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label="Search"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>

              {/* Theme Toggle */}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <SunIcon className="w-5 h-5" />
                  ) : (
                    <MoonIcon className="w-5 h-5" />
                  )}
                </button>
              )}

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors relative"
                aria-label="Wishlist"
              >
                <HeartIcon className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  0
                </span>
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors relative"
                aria-label="Shopping cart"
              >
                <ShoppingCartIcon className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                  0
                </span>
              </Link>

              {/* User Account */}
              <Link
                href="/auth/login"
                className="hidden md:flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Sign In</span>
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
          >
            <nav className="px-4 py-6 space-y-4">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block py-2 text-base font-medium transition-colors ${
                    pathname === link.href
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/auth/login"
                className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );

  /**
   * Footer Component
   */
  const Footer = () => (
    <footer className="bg-gray-900 dark:bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <Link href="/" className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">V</span>
              </div>
              <div>
                <h2 className="text-lg font-bold">Vardhman Mills</h2>
                <p className="text-xs text-gray-400">Premium Home Furnishings</p>
              </div>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              Leading manufacturer of premium home textiles and furnishings since 1965.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                aria-label="Facebook"
              >
                <span className="text-sm">f</span>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors"
                aria-label="Twitter"
              >
                <span className="text-sm">𝕏</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors"
                aria-label="Instagram"
              >
                <span className="text-sm">📷</span>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                aria-label="LinkedIn"
              >
                <span className="text-sm">in</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase mb-4 text-gray-300">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-sm font-bold uppercase mb-4 text-gray-300">
              Customer Service
            </h3>
            <ul className="space-y-2">
              {customerServiceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h3 className="text-sm font-bold uppercase mb-4 text-gray-300">
              Stay Connected
            </h3>
            <div className="space-y-3 text-sm text-gray-400 mb-4">
              <p>📍 Vardhman Mills, Ludhiana, Punjab, India</p>
              <p>📞 +91-1839-266266</p>
              <p>✉️ info@vardhmanmills.com</p>
            </div>
            <Link
              href="/newsletter/subscribe"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Subscribe to Newsletter
            </Link>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Vardhman Mills. All rights reserved.
            </p>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              {legalLinks.map((link, index) => (
                <React.Fragment key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                  {index < legalLinks.length - 1 && (
                    <span className="text-gray-700">|</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mt-6 flex items-center justify-center space-x-4">
            <span className="text-xs text-gray-500">We accept:</span>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-6 bg-white rounded flex items-center justify-center text-xs font-bold text-gray-800">
                VISA
              </div>
              <div className="w-10 h-6 bg-white rounded flex items-center justify-center text-xs font-bold text-gray-800">
                MC
              </div>
              <div className="w-10 h-6 bg-white rounded flex items-center justify-center text-xs font-bold text-blue-600">
                UPI
              </div>
              <div className="w-10 h-6 bg-white rounded flex items-center justify-center text-xs font-bold text-gray-800">
                COD
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );

  /**
   * Scroll to Top Button
   */
  const ScrollToTopButton = () => (
    <AnimatePresence>
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-40 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
          aria-label="Scroll to top"
        >
          <ArrowUpIcon className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <Header />

      {/* Main Content with top padding for fixed header */}
      <main className="flex-1 pt-28">
        {children}
      </main>

      {/* Footer */}
      <Footer />

      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  );
}
