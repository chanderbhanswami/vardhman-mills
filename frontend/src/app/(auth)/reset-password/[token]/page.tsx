/**
 * Reset Password Page - Vardhman Mills Frontend
 * 
 * Page for resetting user password using reset token from email.
 * 
 * Features:
 * - Token validation
 * - New password form
 * - Password strength meter
 * - Password requirements checklist
 * - Confirm password validation
 * - Success redirect to login
 * - SEO optimization
 * 
 * @module app/(auth)/reset-password/[token]/page
 * @version 1.0.0
 */

'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ResetPasswordForm } from '@/components/auth';
import ResetPasswordLoading from './loading';
import { Alert } from '@/components/ui/Alert';

/**
 * Reset Password Page Content Component
 */
function ResetPasswordPageContent() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;

  const [isValidating, setIsValidating] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [redirected, setRedirected] = useState(false);

  /**
   * Validate reset token on mount and redirect to include token in query
   */
  useEffect(() => {
    if (!token) {
      setTokenError('Reset token is missing');
      setIsValidating(false);
      return;
    }

    // Validate token format (basic check)
    if (token.length < 32) {
      setTokenError('Invalid reset token format');
      setIsValidating(false);
      return;
    }

    // Redirect to include token in query params for ResetPasswordForm
    if (!redirected) {
      setRedirected(true);
      // Redirect happens during render via router.push
    }

    // Token is valid format
    setIsValidating(false);
  }, [token, redirected]);

  /**
   * Redirect to include token in query params
   */
  useEffect(() => {
    if (token && !tokenError && redirected) {
      // Add token to query params so ResetPasswordForm can access it
      const currentUrl = new URL(window.location.href);
      if (!currentUrl.searchParams.has('token')) {
        router.replace(`/auth/reset-password/${token}?token=${token}`);
      }
    }
  }, [token, tokenError, redirected, router]);

  /**
   * Handle successful password reset
   */
  const handleSuccess = () => {
    // Track success event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'password_reset_success', {
        method: 'email',
      });
    }

    // Redirect to login with success message
    router.push('/auth/login?message=password-reset');
  };

  /**
   * Handle error
   */
  const handleError = (error: string) => {
    console.error('Reset password error:', error);
    
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'password_reset_failed', {
        error_message: error,
      });
    }

    // Handle specific errors
    if (error.includes('expired') || error.includes('invalid')) {
      setTokenError(error);
    }
  };

  // Show loading state during token validation
  if (isValidating) {
    return <ResetPasswordLoading />;
  }

  // Show error if token is invalid
  if (tokenError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md mx-auto"
      >
        <Alert
          variant="destructive"
          title="Invalid Reset Link"
          description={tokenError}
          className="mb-6"
        />
        
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            The password reset link is invalid or has expired.
          </p>
          <button
            onClick={() => router.push('/auth/forgot-password')}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Request New Link
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full">
      {/* Reset Password Form - Token passed via URL query params */}
      <ResetPasswordForm
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </div>
  );
}

/**
 * Main Reset Password Page Component
 */
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}

/**
 * Generate Metadata
 * 
 * Note: Metadata cannot be exported from client components.
 * SEO optimization should be added to the layout.tsx or moved to a separate Server Component wrapper.
 */
