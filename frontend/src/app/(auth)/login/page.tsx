/**
 * Login Page - Vardhman Mills Frontend
 * 
 * Main login page component with authentication form,
 * social login options, and redirect handling.
 * 
 * Features:
 * - Email/password authentication
 * - Social login (Google, Facebook)
 * - Remember me functionality
 * - Forgot password link
 * - Register link
 * - Session management
 * - SEO optimization
 * 
 * @module app/(auth)/login/page
 * @version 1.0.0
 */

'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { LoginForm } from '@/components/auth';
import LoginLoading from './loading';

/**
 * Login Page Content Component
 * 
 * Wrapped in Suspense boundary to handle search params
 */
function LoginPageContent() {
  const searchParams = useSearchParams();

  // Get redirect URL from search params or default to dashboard
  const redirectTo = searchParams?.get('redirect') || '/dashboard';
  const message = searchParams?.get('message');

  /**
   * Handle successful login
   */
  const handleLoginSuccess = () => {
    // Redirect is handled in LoginForm component
    // This is just for additional tracking or analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'login', {
        method: 'email',
      });
    }
  };

  /**
   * Handle login error
   */
  const handleLoginError = (error: string) => {
    // Additional error handling if needed
    console.error('Login error:', error);
    
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'login_failed', {
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
          {message === 'password-reset' && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
              <p className="text-sm font-medium">
                Your password has been reset successfully. Please log in with your new password.
              </p>
            </div>
          )}
          {message === 'email-verified' && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
              <p className="text-sm font-medium">
                Your email has been verified successfully. You can now log in.
              </p>
            </div>
          )}
          {message === 'registration-success' && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg">
              <p className="text-sm font-medium">
                Registration successful! Please check your email to verify your account.
              </p>
            </div>
          )}
          {message === 'session-expired' && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
              <p className="text-sm font-medium">
                Your session has expired. Please log in again.
              </p>
            </div>
          )}
          {message === 'unauthorized' && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              <p className="text-sm font-medium">
                You need to log in to access that page.
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Login Form */}
      <LoginForm
        onSuccess={handleLoginSuccess}
        onError={handleLoginError}
        redirectTo={redirectTo}
        showSocialLogin={true}
        showRememberMe={true}
        showForgotPassword={true}
        showRegisterLink={true}
        title="Welcome Back"
        subtitle="Sign in to your account to continue"
      />
    </div>
  );
}

/**
 * Main Login Page Component
 * 
 * Exports the page with Suspense boundary
 */
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginPageContent />
    </Suspense>
  );
}

/**
 * Page Metadata
 * 
 * Note: Metadata cannot be exported from client components.
 * SEO optimization should be added to the layout.tsx or moved to a separate Server Component wrapper.
 */
