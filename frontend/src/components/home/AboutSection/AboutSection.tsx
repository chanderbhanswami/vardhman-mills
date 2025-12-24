/**
 * AboutSection Component (Simplified)
 * 
 * Clean, minimal about section for the homepage.
 * Full details available on dedicated /about page.
 * 
 * @component
 */

'use client';

import React from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils/utils';

// ============================================================================
// TYPES
// ============================================================================

interface AboutSectionProps {
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const AboutSection: React.FC<AboutSectionProps> = ({ className }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <div ref={ref} className={cn('max-w-6xl mx-auto', className)}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
      >
        {/* Left: Image/Visual */}
        <div className="relative">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
            {/* Decorative Pattern */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-8xl font-bold text-blue-600/20">50+</div>
                <div className="text-lg font-medium text-blue-600/40">Years of Excellence</div>
              </div>
            </div>
            {/* Stats Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 via-black/40 to-transparent rounded-b-3xl">
              <div className="grid grid-cols-3 gap-4 text-white text-center">
                <div>
                  <div className="text-2xl font-bold">500+</div>
                  <div className="text-xs opacity-80">Products</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">100K+</div>
                  <div className="text-xs opacity-80">Customers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">50+</div>
                  <div className="text-xs opacity-80">Years</div>
                </div>
              </div>
            </div>
          </div>
          {/* Floating Badge */}
          <div className="absolute -top-4 -right-4 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
            Est. 1975
          </div>
        </div>

        {/* Right: Content */}
        <div className="space-y-6">
          <div>
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
              Our Story
            </span>
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2">
              A Legacy of Quality & Trust
            </h3>
          </div>

          <p className="text-gray-600 text-lg leading-relaxed mt-4">
            For over five decades, Vardhman Mills has been at the forefront of textile manufacturing,
            delivering premium quality fabrics and home textiles to customers across India and beyond.
          </p>

          <p className="text-gray-500 leading-relaxed">
            Our commitment to excellence, sustainable practices, and customer satisfaction has made
            us one of the most trusted names in the industry.
          </p>

          {/* Key Points */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-gray-700 font-medium">Premium Quality</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-gray-700 font-medium">50+ Years Legacy</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                </svg>
              </div>
              <span className="text-gray-700 font-medium">Pan-India Delivery</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <span className="text-gray-700 font-medium">5★ Customer Rating</span>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-4">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors group"
            >
              Learn more about us
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AboutSection;
