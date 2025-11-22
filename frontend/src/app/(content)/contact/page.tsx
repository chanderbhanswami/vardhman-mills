'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';

// Dynamically import heavy components for better performance
const DynamicContactBanner = dynamic(
  () => import('@/components/contact/ContactBanner'),
  {
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
    ssr: true
  }
);

const DynamicContactForm = dynamic(
  () => import('@/components/contact/ContactForm'),
  {
    loading: () => <div className="h-screen bg-gray-100 animate-pulse rounded-lg" />,
    ssr: true
  }
);

const DynamicContactInfo = dynamic(
  () => import('@/components/contact/ContactInfo'),
  {
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
    ssr: true
  }
);

const DynamicContactMap = dynamic(
  () => import('@/components/contact/ContactMap'),
  {
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
    ssr: true
  }
);

/**
 * Contact Page Component
 * 
 * Comprehensive contact page with:
 * - SEO optimization with metadata
 * - Interactive contact form with validation
 * - Multiple contact methods (phone, email, address)
 * - Business hours display
 * - Interactive map with locations
 * - Responsive design for all devices
 * - Loading states and error handling
 * - Accessibility features
 */

// Page metadata for SEO
// Metadata removed (cannot be exported from client components)
// JSON-LD structured data for SEO
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact Vardhman Mills',
  description: 'Contact page for Vardhman Mills - leading textile manufacturer',
  mainEntity: {
    '@type': 'Organization',
    name: 'Vardhman Mills',
    url: 'https://www.vardhmanmills.com',
    logo: 'https://www.vardhmanmills.com/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-98765-43210',
      contactType: 'Customer Service',
      email: 'contact@vardhmanmills.com',
      areaServed: 'IN',
      availableLanguage: ['en', 'hi']
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Industrial Area, Sector 12',
      addressLocality: 'New Delhi',
      addressRegion: 'Delhi',
      postalCode: '110025',
      addressCountry: 'IN'
    },
    sameAs: [
      'https://www.facebook.com/vardhmanmills',
      'https://www.instagram.com/vardhmanmills',
      'https://www.linkedin.com/company/vardhmanmills',
      'https://twitter.com/vardhmanmills'
    ]
  }
};

// Animation variants
const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.2
    }
  }
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut' as const
    }
  }
};

/**
 * Main Contact Page Component
 */
const Contact: React.FC = () => {
  // Handle form submission
  const handleFormSubmit = async (data: Record<string, unknown>) => {
    try {
      // Submit contact form data to API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to submit contact form');
      }

      const result = await response.json();
      console.log('Form submitted successfully:', result);
      
      // You can add success notification here
      return result;
    } catch (error) {
      console.error('Error submitting contact form:', error);
      throw error;
    }
  };

  return (
    <>
      {/* Main Content */}
      <motion.main
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="min-h-screen bg-gradient-to-b from-gray-50 to-white"
      >
        {/* Hero Banner Section */}
        <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse" />}>
          <motion.section variants={sectionVariants}>
            <DynamicContactBanner
              variant="hero"
              showQuickContact={true}
              showBusinessHours={true}
              showSocialLinks={true}
            />
          </motion.section>
        </Suspense>

        {/* Main Contact Form and Info Section */}
        <Container className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Form - Takes 2/3 width on large screens */}
            <Suspense fallback={<div className="lg:col-span-2 h-screen bg-gray-100 animate-pulse rounded-lg" />}>
              <motion.div 
                variants={sectionVariants}
                className="lg:col-span-2"
              >
                <DynamicContactForm
                  variant="detailed"
                  showAttachments={true}
                  showBudgetFields={true}
                  showCompanyFields={true}
                  onSubmit={handleFormSubmit}
                  maxFileSize={5 * 1024 * 1024} // 5MB
                  allowedFileTypes={['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png']}
                />
              </motion.div>
            </Suspense>

            {/* Contact Information Sidebar - Takes 1/3 width */}
            <Suspense fallback={<div className="lg:col-span-1 h-96 bg-gray-100 animate-pulse rounded-lg" />}>
              <motion.div 
                variants={sectionVariants}
                className="lg:col-span-1"
              >
                <DynamicContactInfo
                  variant="detailed"
                  showBusinessHours={true}
                  showTeamInfo={false}
                  showCertifications={false}
                  showEmergencyContact={true}
                />
              </motion.div>
            </Suspense>
          </div>

          {/* Interactive Map Section */}
          <Suspense fallback={<div className="mt-16 h-96 bg-gray-100 animate-pulse rounded-lg" />}>
            <motion.div 
              variants={sectionVariants}
              className="mt-16"
            >
              <div className="text-center mb-8">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                >
                  Find Our <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">Locations</span>
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-lg text-gray-600 max-w-3xl mx-auto"
                >
                  Visit us at any of our convenient locations or use the interactive map to get directions.
                </motion.p>
              </div>

              <DynamicContactMap
                variant="detailed"
                showDirections={true}
                showNearbyLandmarks={true}
                showTransportInfo={true}
                height={500}
                interactive={true}
              />
            </motion.div>
          </Suspense>
        </Container>

        {/* Additional Information Section */}
        <motion.section 
          variants={sectionVariants}
          className="bg-gradient-to-r from-primary-600 to-purple-600 text-white py-16"
        >
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-3"
              >
                <div className="text-5xl font-bold">24/7</div>
                <h3 className="text-xl font-semibold">Available Support</h3>
                <p className="text-white/90">
                  Round-the-clock customer support for urgent inquiries
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="space-y-3"
              >
                <div className="text-5xl font-bold">&lt;24h</div>
                <h3 className="text-xl font-semibold">Response Time</h3>
                <p className="text-white/90">
                  We respond to all inquiries within 24 business hours
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-3"
              >
                <div className="text-5xl font-bold">50+</div>
                <h3 className="text-xl font-semibold">Years Experience</h3>
                <p className="text-white/90">
                  Trusted textile partner for over five decades
                </p>
              </motion.div>
            </div>
          </Container>
        </motion.section>

        {/* FAQ Quick Links Section */}
        <motion.section 
          variants={sectionVariants}
          className="py-16 bg-gray-50"
        >
          <Container>
            <div className="text-center mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
              >
                Have Questions?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-gray-600 max-w-3xl mx-auto mb-8"
              >
                Check out our comprehensive FAQ section for quick answers to common questions.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <a
                  href="/faq"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <span>Visit FAQ Section</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </motion.div>
            </div>

            {/* Quick FAQ Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Products', count: 25, icon: '📦' },
                { title: 'Shipping', count: 18, icon: '🚚' },
                { title: 'Returns', count: 12, icon: '↩️' },
                { title: 'Support', count: 30, icon: '💬' }
              ].map((category, index) => (
                <motion.a
                  key={category.title}
                  href={`/faq#${category.title.toLowerCase()}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 text-center group"
                >
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-gray-600">
                    {category.count} articles
                  </p>
                </motion.a>
              ))}
            </div>
          </Container>
        </motion.section>

        {/* Trust Indicators Section */}
        <motion.section 
          variants={sectionVariants}
          className="py-16"
        >
          <Container>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: '🔒', title: 'Secure', description: 'SSL Encrypted' },
                { icon: '✓', title: 'Certified', description: 'ISO 9001:2015' },
                { icon: '🌟', title: 'Rated', description: '4.8/5 Stars' },
                { icon: '🏆', title: 'Award Winning', description: 'Industry Leader' }
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl mb-2">{item.icon}</div>
                  <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </Container>
        </motion.section>
      </motion.main>

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-1/3 right-10 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>
    </>
  );
};

export default Contact;
