/**
 * Login Page Loading Component - Vardhman Mills Frontend
 * 
 * Loading skeleton for the login page with animated placeholders
 * matching the actual form structure for better user experience.
 * 
 * @module app/(auth)/login/loading
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import LoadingSpinner from '@/components/common/Loading/LoadingSpinner';

/**
 * Login Loading Component
 * 
 * Displays a loading skeleton that matches the login form layout
 * with smooth animations for better perceived performance.
 */
export default function LoginLoading() {
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
              className="h-8 bg-gray-200 rounded-lg w-48 mx-auto mb-3"
            />

            {/* Subtitle Skeleton */}
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
              className="h-4 bg-gray-200 rounded-lg w-64 mx-auto"
            />
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Social Login Buttons Skeleton */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[1, 2].map((index) => (
                  <motion.div
                    key={index}
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: index * 0.1 }}
                    className="h-10 bg-gray-200 rounded-lg"
                  />
                ))}
              </div>

              {/* Divider Skeleton */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center">
                  <motion.div
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="px-4 h-4 bg-gray-200 rounded-full w-32"
                  />
                </div>
              </div>
            </div>

            {/* Form Fields Skeleton */}
            <div className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <motion.div
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="h-4 bg-gray-200 rounded w-24"
                />
                <motion.div
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                  className="h-10 bg-gray-200 rounded-lg"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <motion.div
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
                  className="h-4 bg-gray-200 rounded w-20"
                />
                <motion.div
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                  className="h-10 bg-gray-200 rounded-lg"
                />
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="flex justify-between items-center">
                <motion.div
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                  className="h-4 bg-gray-200 rounded w-24"
                />
                <motion.div
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                  className="h-4 bg-gray-200 rounded w-32"
                />
              </div>

              {/* Submit Button Skeleton */}
              <motion.div
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                className="h-11 bg-gray-300 rounded-lg"
              />
            </div>
          </CardContent>

          <CardFooter className="text-center">
            {/* Register Link Skeleton */}
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="h-4 bg-gray-200 rounded w-48 mx-auto"
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
          <p className="text-sm text-gray-600">Loading login form...</p>
        </motion.div>
      </motion.div>
    </Container>
  );
}
