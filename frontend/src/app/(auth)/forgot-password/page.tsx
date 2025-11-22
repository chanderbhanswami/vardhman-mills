/**
 * Forgot Password Page - Vardhman Mills Frontend
 * 
 * Page for initiating password reset process by sending
 * reset instructions to user's email.
 * 
 * Features:
 * - Email input with validation
 * - Send reset instructions
 * - Resend functionality with cooldown
 * - Success/error states
 * - SEO optimization
 * 
 * @module app/(auth)/forgot-password/page
 * @version 1.0.0
 */

'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ForgotPasswordForm } from '@/components/auth';
import ForgotPasswordLoading from './loading';

/**
 * Forgot Password Page Content Component
 */
function ForgotPasswordPageContent() {
  const searchParams = useSearchParams();

  // Get redirect URL from search params or default to verify OTP
  const redirectTo = searchParams?.get('redirect') || '/auth/verify-otp';
  const message = searchParams?.get('message');

  /**
   * Handle successful email send
   */
  const handleSuccess = (email: string) => {
    // Track success event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'password_reset_requested', {
        method: 'email',
      });
    }
    
    console.log('Reset instructions sent to:', email);
  };

  /**
   * Handle error
   */
  const handleError = (error: string) => {
    // Additional error handling if needed
    console.error('Forgot password error:', error);
    
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'password_reset_failed', {
        error_message: error,
      });
    }
  };

  return (
    <div className="w-full">
      {/* Success/Error Messages from Redirect */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          {message === 'token-expired' && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
              <p className="text-sm font-medium">
                Your reset link has expired. Please request a new one.
              </p>
            </div>
          )}
          {message === 'invalid-token' && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              <p className="text-sm font-medium">
                The reset link is invalid. Please request a new one.
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Forgot Password Form */}
      <ForgotPasswordForm
        onSuccess={handleSuccess}
        onError={handleError}
        redirectTo={redirectTo}
      />
    </div>
  );
}

/**
 * Main Forgot Password Page Component
 */
export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<ForgotPasswordLoading />}>
      <ForgotPasswordPageContent />
    </Suspense>
  );
}

/**
 * Page Metadata
 * Note: Metadata cannot be exported from client components.
 * Metadata should be added to the layout.tsx or moved to a separate Server Component wrapper.
 */
