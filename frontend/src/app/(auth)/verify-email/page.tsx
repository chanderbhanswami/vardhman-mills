/**
 * Verify Email Page - Vardhman Mills Frontend
 * 
 * Page for email verification with auto-verification from URL token
 * and manual verification options.
 * 
 * Features:
 * - Auto-verification from URL token
 * - Send verification email button
 * - Resend functionality with cooldown
 * - Session update after verification
 * - Redirect to dashboard on success
 * - SEO optimization
 * 
 * @module app/(auth)/verify-email/page
 * @version 1.0.0
 */

'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { EmailVerification } from '@/components/auth';
import VerifyEmailLoading from './loading';

/**
 * Verify Email Page Content Component
 */
function VerifyEmailPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { update: updateSession } = useSession();

  // Get message from search params
  const message = searchParams?.get('message');

  /**
   * Handle successful verification
   */
  const handleSuccess = async () => {
    // Track success event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'email_verified', {
        method: 'email',
      });
    }

    // Update session to reflect verified status
    await updateSession();

    // Redirect to dashboard after short delay
    setTimeout(() => {
      router.push('/dashboard?welcome=true');
    }, 2000);
  };

  /**
   * Handle verification error
   */
  const handleError = (error: string) => {
    console.error('Email verification error:', error);
    
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'email_verification_failed', {
        error_message: error,
      });
    }
  };

  return (
    <div className="w-full">
      {/* Messages from Redirect */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          {message === 'verification-required' && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
              <p className="text-sm font-medium">
                Please verify your email address to access your account.
              </p>
            </div>
          )}
          {message === 'email-sent' && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
              <p className="text-sm font-medium">
                Verification email sent! Please check your inbox.
              </p>
            </div>
          )}
          {message === 'token-expired' && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
              <p className="text-sm font-medium">
                Your verification link has expired. Please request a new one.
              </p>
            </div>
          )}
          {message === 'invalid-token' && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              <p className="text-sm font-medium">
                The verification link is invalid. Please request a new one.
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Email Verification Component - Gets token and email from searchParams internally */}
      <EmailVerification
        onSuccess={handleSuccess}
        onError={handleError}
        redirectTo="/dashboard?welcome=true"
      />
    </div>
  );
}

/**
 * Main Verify Email Page Component
 */
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailPageContent />
    </Suspense>
  );
}

/**
 * Page Metadata
 * 
 * Note: Metadata cannot be exported from client components.
 * SEO optimization should be added to the layout.tsx or moved to a separate Server Component wrapper.
 */
