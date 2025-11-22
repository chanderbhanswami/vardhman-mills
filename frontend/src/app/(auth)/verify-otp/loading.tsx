/**
 * Verify OTP Page Loading Component - Vardhman Mills Frontend
 * 
 * Loading skeleton for the OTP verification page with animated placeholders.
 * 
 * @module app/(auth)/verify-otp/loading
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import LoadingSpinner from '@/components/common/Loading/LoadingSpinner';

/**
 * Verify OTP Loading Component
 */
export default function VerifyOTPLoading() {
  return (
    <Container size="md" centered className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card variant="elevated" size="lg" className="shadow-xl">
          <CardHeader className="text-center">
            {/* Logo/Icon Skeleton */}
            <div className="flex justify-center mb-6">
              <LoadingSpinner size="xl" color="blue" variant="spinner" />
            </div>

            {/* Title Skeleton */}
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="h-8 bg-gray-200 rounded-lg w-56 mx-auto mb-3"
            />

            {/* Subtitle Skeleton */}
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
              className="h-4 bg-gray-200 rounded-lg w-80 mx-auto"
            />
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Email/Phone Display Skeleton */}
            <div className="flex items-center justify-center gap-2 p-4 bg-blue-50 rounded-lg">
              <motion.div
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="h-5 w-5 bg-blue-200 rounded"
              />
              <motion.div
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
                className="h-4 bg-blue-200 rounded w-56"
              />
            </div>

            {/* OTP Input Fields Skeleton (6 digits) */}
            <div className="space-y-2">
              <motion.div
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                className="h-4 bg-gray-200 rounded w-32 mx-auto"
              />
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5, 6].map((item, index) => (
                  <motion.div
                    key={item}
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.3 + index * 0.1,
                    }}
                    className="h-14 w-12 bg-gray-200 rounded-lg"
                  />
                ))}
              </div>
            </div>

            {/* Countdown Timer Skeleton */}
            <div className="text-center">
              <motion.div
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
                className="h-4 bg-gray-200 rounded w-48 mx-auto"
              />
            </div>

            {/* Submit Button Skeleton */}
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="h-11 bg-gray-300 rounded-lg"
            />

            {/* Resend Button Skeleton */}
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 1.1 }}
              className="h-11 bg-gray-200 rounded-lg"
            />
          </CardContent>

          <CardFooter className="space-y-4">
            {/* Help Text Skeleton */}
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
              className="h-4 bg-gray-200 rounded w-64 mx-auto"
            />

            {/* Back Link Skeleton */}
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 1.3 }}
              className="h-4 bg-gray-200 rounded w-32 mx-auto"
            />
          </CardFooter>
        </Card>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <p className="text-sm text-gray-600">Loading verification form...</p>
        </motion.div>
      </motion.div>
    </Container>
  );
}
