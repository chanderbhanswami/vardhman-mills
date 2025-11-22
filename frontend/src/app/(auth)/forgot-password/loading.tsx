/**
 * Forgot Password Page Loading Component - Vardhman Mills Frontend
 * 
 * Loading skeleton for the forgot password page with animated placeholders.
 * 
 * @module app/(auth)/forgot-password/loading
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import LoadingSpinner from '@/components/common/Loading/LoadingSpinner';

/**
 * Forgot Password Loading Component
 */
export default function ForgotPasswordLoading() {
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
              className="h-4 bg-gray-200 rounded-lg w-72 mx-auto"
            />
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Email Field Skeleton */}
            <div className="space-y-2">
              <motion.div
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="h-4 bg-gray-200 rounded w-32"
              />
              <motion.div
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
                className="h-10 bg-gray-200 rounded-lg"
              />
            </div>

            {/* Submit Button Skeleton */}
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
              className="h-11 bg-gray-300 rounded-lg"
            />
          </CardContent>

          <CardFooter className="space-y-4">
            {/* Back Button Skeleton */}
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              className="h-11 bg-gray-200 rounded-lg w-full"
            />

            {/* Help Text Skeleton */}
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
              className="h-4 bg-gray-200 rounded w-56 mx-auto"
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
          <p className="text-sm text-gray-600">Loading form...</p>
        </motion.div>
      </motion.div>
    </Container>
  );
}
