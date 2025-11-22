/**
 * Register Page - Vardhman Mills Frontend
 * 
 * Main registration page component with registration form,
 * social registration options, and email verification flow.
 * 
 * Features:
 * - Complete registration form with validation
 * - Social registration (Google, Facebook)
 * - Password strength checking
 * - Terms and conditions acceptance
 * - Email verification flow
 * - SEO optimization
 * 
 * @module app/(auth)/register/page
 * @version 1.0.0
 */

'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { RegisterForm } from '@/components/auth';
import RegisterLoading from './loading';

/**
 * Register Page Content Component
 * 
 * Wrapped in Suspense boundary to handle search params
 */
function RegisterPageContent() {
  const searchParams = useSearchParams();

  // Get redirect URL from search params or default to verify email
  const redirectTo = searchParams?.get('redirect') || '/auth/verify-email';
  const message = searchParams?.get('message');

  /**
   * Handle successful registration
   */
  const handleRegisterSuccess = () => {
    // Redirect is handled in RegisterForm component
    // This is just for additional tracking or analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'sign_up', {
        method: 'email',
      });
    }
  };

  /**
   * Handle registration error
   */
  const handleRegisterError = (error: string) => {
    // Additional error handling if needed
    console.error('Registration error:', error);
    
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'registration_failed', {
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
          {message === 'verification-required' && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg">
              <p className="text-sm font-medium">
                Please verify your email address to complete registration.
              </p>
            </div>
          )}
          {message === 'email-taken' && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              <p className="text-sm font-medium">
                An account with this email already exists. Please login instead.
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Registration Form */}
      <RegisterForm
        onSuccess={handleRegisterSuccess}
        onError={handleRegisterError}
        redirectTo={redirectTo}
        showSocialLogin={true}
        showCompanyField={false}
        showPhoneField={false}
        title="Create Account"
        subtitle="Sign up for your new account"
      />
    </div>
  );
}

/**
 * Main Register Page Component
 * 
 * Exports the page with Suspense boundary
 */
export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterLoading />}>
      <RegisterPageContent />
    </Suspense>
  );
}

/**
 * Page Metadata
 * 
 * Note: Metadata cannot be exported from client components.
 * SEO optimization should be added to the layout.tsx or moved to a separate Server Component wrapper.
 */
