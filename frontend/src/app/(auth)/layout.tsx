/**
 * Auth Layout - Vardhman Mills Frontend
 * 
 * Shared layout for all authentication pages including login, register,
 * forgot password, reset password, and verification pages.
 * 
 * Features:
 * - Uses standard Header and Footer for consistency
 * - Responsive design with centered authentication forms
 * - Background patterns and branding
 * - Session handling
 * - Redirect logic for authenticated users
 * 
 * @module app/(auth)/layout
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/common/Loading/LoadingSpinner';

// Use main layout components for consistency
const Header = dynamic(() => import('@/components/layout/Header'), {
  loading: () => <div className="h-20 bg-background border-b border-border" />,
  ssr: false
});

const Footer = dynamic(() => import('@/components/layout/Footer'), {
  loading: () => <div className="h-64 bg-background" />,
  ssr: false
});

/**
 * Auth Layout Component
 * 
 * Provides a consistent layout for all authentication pages using
 * the main Header and Footer components for standardization.
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <LoadingSpinner size="xl" color="blue" variant="spinner" />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-muted-foreground font-medium"
          >
            Loading...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Standard Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-muted/10">
        <div className="w-full max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* Standard Footer */}
      <Footer />
    </div>
  );
}
