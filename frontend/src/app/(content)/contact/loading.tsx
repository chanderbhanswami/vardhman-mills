'use client';

import React from 'react';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Loading Component for Contact Page
 * Displays skeleton screens while content is being loaded
 * Provides optimal UX with proper loading states
 */
const ContactLoading: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Banner Skeleton */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-white rounded-full blur-xl animate-pulse" />
          <div className="absolute top-1/2 -left-8 w-24 h-24 bg-white rounded-full blur-lg animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-white rounded-full blur-2xl animate-pulse" />
        </div>

        <Container className="relative z-10 py-16">
          <div className="text-center">
            {/* Badge Skeleton */}
            <div className="inline-flex items-center justify-center mb-4">
              <Skeleton className="h-8 w-32 rounded-full bg-white/20" />
            </div>

            {/* Title Skeleton */}
            <Skeleton className="h-12 md:h-16 w-3/4 max-w-2xl mx-auto mb-6 bg-white/20 rounded-lg" />

            {/* Description Skeleton */}
            <div className="max-w-3xl mx-auto space-y-3">
              <Skeleton className="h-6 w-full bg-white/15 rounded" />
              <Skeleton className="h-6 w-5/6 mx-auto bg-white/15 rounded" />
            </div>
          </div>

          {/* Contact Info Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {[...Array(3)].map((_, index) => (
              <Card 
                key={index} 
                className="p-6 bg-white/10 backdrop-blur-sm border-white/20 animate-pulse"
              >
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg bg-white/20" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-5 w-24 bg-white/20 rounded" />
                    <Skeleton className="h-4 w-full bg-white/15 rounded" />
                    <Skeleton className="h-6 w-3/4 bg-white/15 rounded" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Main Content Skeleton */}
      <Container className="py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Form Skeleton */}
          <div className="lg:col-span-2">
            <Card className="p-6 md:p-8 animate-pulse">
              {/* Form Header */}
              <div className="text-center mb-8">
                <Skeleton className="h-8 w-48 mx-auto mb-4 bg-gray-200 rounded" />
                <Skeleton className="h-5 w-full max-w-2xl mx-auto mb-2 bg-gray-100 rounded" />
                <Skeleton className="h-5 w-3/4 max-w-xl mx-auto bg-gray-100 rounded" />
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(2)].map((_, index) => (
                    <div key={index} className="space-y-2">
                      <Skeleton className="h-5 w-24 bg-gray-200 rounded" />
                      <Skeleton className="h-12 w-full bg-gray-100 rounded-lg" />
                    </div>
                  ))}
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(2)].map((_, index) => (
                    <div key={index} className="space-y-2">
                      <Skeleton className="h-5 w-28 bg-gray-200 rounded" />
                      <Skeleton className="h-12 w-full bg-gray-100 rounded-lg" />
                    </div>
                  ))}
                </div>

                {/* Subject Field */}
                <div className="space-y-2">
                  <Skeleton className="h-5 w-20 bg-gray-200 rounded" />
                  <Skeleton className="h-12 w-full bg-gray-100 rounded-lg" />
                </div>

                {/* Dropdowns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="space-y-2">
                      <Skeleton className="h-5 w-24 bg-gray-200 rounded" />
                      <Skeleton className="h-12 w-full bg-gray-100 rounded-lg" />
                    </div>
                  ))}
                </div>

                {/* Message Field */}
                <div className="space-y-2">
                  <Skeleton className="h-5 w-20 bg-gray-200 rounded" />
                  <Skeleton className="h-32 w-full bg-gray-100 rounded-lg" />
                  <Skeleton className="h-1 w-full bg-gray-200 rounded" />
                </div>

                {/* Checkboxes */}
                <div className="space-y-3">
                  {[...Array(2)].map((_, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Skeleton className="h-5 w-5 rounded bg-gray-200 flex-shrink-0" />
                      <Skeleton className="h-4 w-full max-w-md bg-gray-100 rounded" />
                    </div>
                  ))}
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-end pt-6 border-t">
                  <Skeleton className="h-12 w-40 bg-primary-200 rounded-lg" />
                </div>
              </div>
            </Card>
          </div>

          {/* Contact Info Sidebar Skeleton */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 animate-pulse">
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-6">
                <Skeleton className="h-10 w-10 rounded-lg bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-40 bg-gray-200 rounded" />
                  <Skeleton className="h-4 w-32 bg-gray-100 rounded" />
                </div>
              </div>

              {/* Contact Items */}
              <div className="space-y-4">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Skeleton className="h-5 w-5 rounded bg-gray-200 flex-shrink-0 mt-1" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24 bg-gray-200 rounded" />
                        <Skeleton className="h-5 w-full bg-gray-100 rounded" />
                        <Skeleton className="h-3 w-3/4 bg-gray-100 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Business Hours Skeleton */}
            <Card className="p-6 animate-pulse">
              <div className="flex items-center gap-3 mb-6">
                <Skeleton className="h-10 w-10 rounded-lg bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-36 bg-gray-200 rounded" />
                  <Skeleton className="h-4 w-28 bg-gray-100 rounded" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full bg-gray-200" />
              </div>

              <div className="space-y-3">
                {[...Array(7)].map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <Skeleton className="h-4 w-20 bg-gray-200 rounded" />
                    <Skeleton className="h-4 w-32 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Map Section Skeleton */}
        <div className="mt-16 animate-pulse">
          <div className="text-center mb-8">
            <Skeleton className="h-8 w-48 mx-auto mb-4 bg-gray-200 rounded" />
            <Skeleton className="h-5 w-96 max-w-full mx-auto bg-gray-100 rounded" />
          </div>
          
          <Card className="overflow-hidden">
            <Skeleton className="h-96 w-full bg-gradient-to-br from-green-100 via-blue-50 to-green-100" />
          </Card>
        </div>
      </Container>

      {/* Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-1/3 right-10 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>
    </div>
  );
};

export default ContactLoading;
