/**
 * About Page Loading Component - Vardhman Mills Frontend
 * 
 * Comprehensive loading skeleton for the about page with animated placeholders
 * matching the actual page structure.
 * 
 * @module app/(content)/about/loading
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LoadingSpinner } from '@/components/common';

/**
 * About Page Loading Skeleton
 */
export default function AboutLoading() {
  return (
    <div className="about-loading min-h-screen bg-gray-50">
      {/* Breadcrumb Skeleton */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="h-4 bg-gray-200 rounded w-16"
            />
            <div className="text-gray-400">/</div>
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
              className="h-4 bg-gray-200 rounded w-24"
            />
          </div>
        </div>
      </section>

      {/* Hero Image Skeleton */}
      <section className="relative">
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="h-96 md:h-[500px] bg-gray-300"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner size="xl" color="blue" variant="spinner" />
          </div>
        </motion.div>

        {/* Hero Controls Skeleton */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {[1, 2, 3, 4].map((item, index) => (
            <motion.div
              key={item}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.1
              }}
              className="h-2 w-8 bg-white/50 rounded-full"
            />
          ))}
        </div>
      </section>

      {/* Company Introduction Skeleton */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Title Skeleton */}
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="h-12 bg-gray-200 rounded-lg w-3/4 mx-auto mb-6"
            />

            {/* Tagline Skeleton */}
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
              className="h-8 bg-gray-200 rounded-lg w-2/3 mx-auto mb-8"
            />

            {/* Description Skeleton */}
            <div className="space-y-3 mb-12">
              {[1, 2, 3].map((item, index) => (
                <motion.div
                  key={item}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.2 + index * 0.1
                  }}
                  className="h-4 bg-gray-200 rounded w-full"
                />
              ))}
            </div>

            {/* Stats Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
              {[1, 2, 3, 4].map((item, index) => (
                <motion.div
                  key={item}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5 + index * 0.1
                  }}
                  className="text-center"
                >
                  <div className="h-12 bg-gray-200 rounded-lg w-24 mx-auto mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-32 mx-auto" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CEO Message Skeleton */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* CEO Image Skeleton */}
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="h-96 bg-gray-300 rounded-2xl"
            />

            {/* CEO Message Content Skeleton */}
            <div className="space-y-6">
              <motion.div
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="h-8 bg-gray-200 rounded-lg w-3/4"
              />
              <motion.div
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
                className="h-6 bg-gray-200 rounded w-1/2"
              />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((item, index) => (
                  <motion.div
                    key={item}
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.2 + index * 0.1
                    }}
                    className="h-4 bg-gray-200 rounded"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Skeleton */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Title Skeleton */}
          <div className="text-center mb-12">
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="h-10 bg-gray-200 rounded-lg w-64 mx-auto mb-4"
            />
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
              className="h-6 bg-gray-200 rounded-lg w-96 mx-auto"
            />
          </div>

          {/* Timeline Items Skeleton */}
          <div className="space-y-8">
            {[1, 2, 3, 4].map((item, index) => (
              <motion.div
                key={item}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.1
                }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-gray-300 rounded-full" />
                </div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-24 mb-2" />
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values & Mission Skeleton */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="h-10 bg-gray-200 rounded-lg w-64 mx-auto mb-4"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item, index) => (
              <motion.div
                key={item}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.1
                }}
                className="bg-white rounded-xl p-8"
              >
                <div className="h-16 w-16 bg-gray-300 rounded-full mx-auto mb-4" />
                <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-3" />
                <div className="space-y-2">
                  {[1, 2, 3].map(line => (
                    <div key={line} className="h-4 bg-gray-200 rounded" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities Skeleton */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="h-10 bg-gray-200 rounded-lg w-72 mx-auto mb-4"
            />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((item, index) => (
              <motion.div
                key={item}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.1
                }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="h-48 bg-gray-300" />
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Skeleton */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="h-10 bg-gray-200 rounded-lg w-64 mx-auto"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[1, 2].map((item, index) => (
              <motion.div
                key={item}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.1
                }}
                className="bg-white rounded-xl p-8 shadow-lg"
              >
                <div className="flex items-center mb-4">
                  <div className="h-16 w-16 bg-gray-300 rounded-full mr-4" />
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-24" />
                  </div>
                </div>
                <div className="space-y-2">
                  {[1, 2, 3].map(line => (
                    <div key={line} className="h-4 bg-gray-200 rounded" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards Skeleton */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="h-10 bg-gray-200 rounded-lg w-56 mx-auto"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item, index) => (
              <motion.div
                key={item}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.1
                }}
                className="bg-gray-100 rounded-lg p-6 text-center"
              >
                <div className="h-20 w-20 bg-gray-300 rounded-full mx-auto mb-3" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Skeleton */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="h-10 bg-white/20 rounded-lg w-2/3 mx-auto mb-6"
          />
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
            className="h-6 bg-white/20 rounded-lg w-3/4 mx-auto mb-8"
          />
          <div className="flex justify-center gap-4">
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
              className="h-12 bg-white/30 rounded-lg w-40"
            />
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              className="h-12 bg-white/30 rounded-lg w-40"
            />
          </div>
        </div>
      </section>

      {/* Loading Text */}
      <div className="text-center py-8">
        <LoadingSpinner size="lg" color="blue" variant="dots" />
        <p className="text-gray-600 mt-4 text-sm">Loading company information...</p>
      </div>
    </div>
  );
}
