'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUpIcon } from '@heroicons/react/24/outline';

// Import footer components
import CompanyInfo from './CompanyInfo';
import QuickLinks from './QuickLinks';
import CustomerService from './CustomerService';
import NewsletterSignup from './NewsletterSignup';
import SocialLinks from './SocialLinks';
import PaymentMethods from './PaymentMethods';
import LegalLinks from './LegalLinks';
import ContactInfo from './ContactInfo';
import CertificationBadges from './CertificationBadges';
import Copyright from './Copyright';
import Logo from './Logo';

export interface FooterProps {
  className?: string;
  showBackToTop?: boolean;
  variant?: 'default' | 'minimal';
}

const Footer: React.FC<FooterProps> = ({
  className = '',
  showBackToTop = true,
  variant = 'default',
}) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Handle scroll behavior for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowScrollTop(scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection observer for footer animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const footerElement = document.getElementById('main-footer');
    if (footerElement) {
      observer.observe(footerElement);
    }

    return () => {
      if (footerElement) {
        observer.unobserve(footerElement);
      }
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  const backToTopVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 20
      }
    },
    tap: { scale: 0.9 }
  };

  if (variant === 'minimal') {
    return (
      <footer className={`bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <Logo variant="minimal" />
            <SocialLinks size="sm" />
            <Copyright minimal />
          </div>
        </div>
      </footer>
    );
  }

  return (
    <>
      <motion.footer
        id="main-footer"
        className={`
          bg-background border-t border-border
          ${className}
        `}
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
      >
        {/* Newsletter Section */}
        <motion.div
          variants={itemVariants}
          className="bg-muted/30 border-b border-border"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <NewsletterSignup />
          </div>
        </motion.div>

        {/* Main Footer Content */}
        <div className="bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              {/* Company Information */}
              <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6">
                <CompanyInfo />
                <ContactInfo variant="compact" />
              </motion.div>

              {/* Quick Links */}
              <motion.div variants={itemVariants} className="space-y-6">
                <QuickLinks />
              </motion.div>

              {/* Customer Service */}
              <motion.div variants={itemVariants} className="space-y-6">
                <CustomerService />
              </motion.div>

              {/* Social & Certifications */}
              <motion.div variants={itemVariants} className="space-y-8">
                <SocialLinks />
                <CertificationBadges />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <motion.div
          variants={itemVariants}
          className="bg-muted/20 border-t border-border"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Legal Links */}
              <div className="w-full md:w-auto">
                <LegalLinks />
              </div>

              {/* Payment Methods */}
              <div className="w-full md:w-auto flex justify-center md:justify-end">
                <PaymentMethods />
              </div>
            </div>

            {/* Copyright */}
            <div className="mt-8 pt-8 border-t border-border text-center">
              <Copyright />
            </div>
          </div>
        </motion.div>
      </motion.footer>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && showScrollTop && (
          <motion.button
            variants={backToTopVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            whileTap="tap"
            onClick={scrollToTop}
            className="
              fixed bottom-6 right-6 z-50 
              w-12 h-12 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600
              text-white rounded-full shadow-lg hover:shadow-xl
              transition-all duration-200 ease-in-out
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            "
            aria-label="Back to top"
          >
            <ChevronUpIcon className="w-6 h-6 mx-auto" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

export default Footer;
