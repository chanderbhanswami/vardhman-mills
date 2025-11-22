/**
 * Auth Layout - Vardhman Mills Frontend
 * 
 * Shared layout for all authentication pages including login, register,
 * forgot password, reset password, and verification pages.
 * 
 * Features:
 * - Responsive design with centered authentication forms
 * - Background patterns and branding
 * - SEO optimization
 * - Session handling
 * - Redirect logic for authenticated users
 * 
 * @module app/(auth)/layout
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ShieldCheckIcon, 
  LockClosedIcon, 
  UserIcon,
  ArrowLeftIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/common/Loading/LoadingSpinner';

/**
 * Auth Layout Component
 * 
 * Provides a consistent layout for all authentication pages with:
 * - Branded header
 * - Background design
 * - Loading states
 * - Navigation
 * - Session management
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect authenticated users from login/register pages
  React.useEffect(() => {
    if (status === 'authenticated' && session) {
      // Don't redirect from verification pages
      const isVerificationPage = pathname?.includes('verify') || 
                                  pathname?.includes('reset-password');
      
      if (!isVerificationPage) {
        // Check if user's email is verified
        const isEmailVerified = (session.user as { isEmailVerified?: boolean })?.isEmailVerified;
        
        if (!isEmailVerified) {
          router.push('/verify-email');
        } else {
          router.push('/dashboard');
        }
      }
    }
  }, [status, session, pathname, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <LoadingSpinner size="xl" color="blue" variant="spinner" />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-gray-600 font-medium"
          >
            Loading...
          </motion.p>
        </div>
      </div>
    );
  }

  /**
   * Background Pattern Component
   */
  const BackgroundPattern = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-400 to-pink-500 rounded-full opacity-20 blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, -90, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-5" />
    </div>
  );

  /**
   * Feature Cards Component
   */
  const FeatureCards = () => {
    const features = [
      {
        icon: ShieldCheckIcon,
        title: 'Secure',
        description: 'Enterprise-grade security for your data'
      },
      {
        icon: LockClosedIcon,
        title: 'Private',
        description: 'Your information stays confidential'
      },
      {
        icon: SparklesIcon,
        title: 'Premium',
        description: 'Exclusive home furnishing collection'
      }
    ];

    return (
      <div className="hidden lg:flex flex-col space-y-6 absolute bottom-12 left-12 max-w-sm">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 + 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  /**
   * Branding Header Component
   */
  const BrandingHeader = () => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="absolute top-8 left-8 z-10"
    >
      <Link href="/" className="flex items-center space-x-3 group">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
          <UserIcon className="w-7 h-7 text-white" />
        </div>
        <div className="hidden sm:block">
          <h1 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            Vardhman Mills
          </h1>
          <p className="text-xs text-gray-600">Premium Home Furnishings</p>
        </div>
      </Link>
    </motion.div>
  );

  /**
   * Back to Home Button
   */
  const BackToHomeButton = () => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="absolute top-8 right-8 z-10"
    >
      <Link
        href="/"
        className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group"
      >
        <ArrowLeftIcon className="w-4 h-4 text-gray-600 group-hover:text-gray-900 transition-colors" />
        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
          Back to Home
        </span>
      </Link>
    </motion.div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background Elements */}
      <BackgroundPattern />

      {/* Branding and Navigation */}
      <BrandingHeader />
      <BackToHomeButton />

      {/* Feature Cards (Desktop Only) */}
      <FeatureCards />

      {/* Main Content Area */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full"
          >
            {/* Authentication Form Container */}
            <div className="w-full max-w-md mx-auto">
              {children}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-0 left-0 right-0 py-6 text-center text-sm text-gray-600 z-10"
      >
        <div className="flex items-center justify-center space-x-6">
          <Link href="/privacy" className="hover:text-gray-900 transition-colors">
            Privacy Policy
          </Link>
          <span className="text-gray-400">•</span>
          <Link href="/terms" className="hover:text-gray-900 transition-colors">
            Terms of Service
          </Link>
          <span className="text-gray-400">•</span>
          <Link href="/contact" className="hover:text-gray-900 transition-colors">
            Contact Support
          </Link>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          © {new Date().getFullYear()} Vardhman Mills. All rights reserved.
        </p>
      </motion.footer>
    </div>
  );
}
