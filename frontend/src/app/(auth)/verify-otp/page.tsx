/**
 * Verify OTP Page - Vardhman Mills Frontend
 * 
 * Page for OTP verification supporting multiple verification types
 * (email, phone, 2FA).
 * 
 * Features:
 * - 6-digit OTP input fields
 * - Auto-focus and auto-submit
 * - Paste functionality
 * - Resend OTP with countdown
 * - Attempts tracking
 * - Multiple verification types support
 * - SEO optimization
 * 
 * @module app/(auth)/verify-otp/page
 * @version 1.0.0
 */

'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { OTPVerification } from '@/components/auth';
import VerifyOTPLoading from './loading';

/**
 * Verify OTP Page Content Component
 */
function VerifyOTPPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get verification parameters from search params
  const type = searchParams?.get('type') as 'email' | 'phone' | '2fa' | 'password-reset' | null;
  const target = searchParams?.get('target') || searchParams?.get('email') || searchParams?.get('phone') || '';
  const message = searchParams?.get('message');

  /**
   * Handle successful OTP verification
   */
  const handleVerified = (otp: string) => {
    console.log('OTP verified:', otp);
    
    // Track success event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'otp_verified', {
        verification_type: type || 'unknown',
      });
    }

    // Redirect based on verification type
    switch (type) {
      case 'email':
        router.push('/dashboard?welcome=true');
        break;
      case 'phone':
        router.push('/dashboard?phone-verified=true');
        break;
      case '2fa':
        router.push('/dashboard');
        break;
      case 'password-reset':
        // Redirect back to reset password page with verified token
        router.push('/auth/reset-password?verified=true');
        break;
      default:
        router.push('/dashboard');
    }
  };

  /**
   * Handle verification error
   */
  const handleError = (error: string) => {
    console.error('OTP verification error:', error);
    
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'otp_verification_failed', {
        verification_type: type || 'unknown',
        error_message: error,
      });
    }
  };

  /**
   * Handle back button click
   */
  const handleBack = () => {
    if (type === 'password-reset') {
      router.push('/auth/forgot-password');
    } else {
      router.push('/auth/login');
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
          {message === 'otp-sent' && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
              <p className="text-sm font-medium">
                OTP sent successfully! Please check your {type === 'phone' ? 'phone' : 'email'}.
              </p>
            </div>
          )}
          {message === 'otp-expired' && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
              <p className="text-sm font-medium">
                Your OTP has expired. Please request a new one.
              </p>
            </div>
          )}
          {message === 'invalid-otp' && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              <p className="text-sm font-medium">
                The OTP you entered is invalid. Please try again.
              </p>
            </div>
          )}
          {message === 'max-attempts' && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              <p className="text-sm font-medium">
                Maximum verification attempts exceeded. Please request a new OTP.
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* OTP Verification Component */}
      <OTPVerification
        type={type || 'email'}
        target={target}
        onVerified={handleVerified}
        onError={handleError}
        onBack={handleBack}
        autoSubmit={true}
        allowPaste={true}
        showBackButton={true}
        resendCooldown={60}
        maxAttempts={5}
      />
    </div>
  );
}

/**
 * Main Verify OTP Page Component
 */
export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<VerifyOTPLoading />}>
      <VerifyOTPPageContent />
    </Suspense>
  );
}

/**
 * Page Metadata
 */
// Metadata removed (cannot be exported from client components)
