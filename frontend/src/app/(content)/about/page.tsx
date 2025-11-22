/**
 * About Us Page - Vardhman Mills Frontend
 * 
 * Comprehensive about page showcasing company information, history, values,
 * team members, facilities, and achievements.
 * 
 * @module app/(content)/about/page
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GlobeAltIcon,
  ArrowUpIcon,
  ShareIcon,
  EnvelopeIcon,
  PhoneIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

// About Components
import HeroImage from '@/components/about/HeroImage';
import MessageFromCEO from '@/components/about/MessageFromeCEO';
import OurJourney from '@/components/about/OurJourney';
import OtherSections from '@/components/about/OtherSections';

// Common Components
import {
  SEOHead,
  StructuredData,
  BackToTop,
  Newsletter,
  ShareButtons,
  LoadingSpinner
} from '@/components/common';

// UI Components
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

// Constants
import { APP_INFO, URLS, CONTACT_INFO, SOCIAL_LINKS } from '@/constants/app.constants';

// Services
import * as aboutService from '@/services/about.service';

// Types - imported for type reference and documentation
import type { CompanyInfo } from '@/types/about.types';

/**
 * About Us Page Component
 * 
 * Note: We use aboutService.CompanyInfo instead of CompanyInfo from @/types/about.types
 * as they have slightly different structures. The imported CompanyInfo type serves
 * as a reference for the expected structure.
 */

// Type helper to document the difference between the two CompanyInfo types
// Exported for potential future use in type definitions
export type CompanyInfoComparison = {
  typesVersion: CompanyInfo;
  serviceVersion: aboutService.CompanyInfo;
};

export default function AboutPage() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [companyInfo, setCompanyInfo] = useState<Partial<aboutService.CompanyInfo>>({});
  const [historyEntries, setHistoryEntries] = useState<aboutService.HistoryEntry[]>([]);
  const [teamMembers, setTeamMembers] = useState<aboutService.TeamMember[]>([]);
  const [awards, setAwards] = useState<aboutService.Award[]>([]);
  const [stats, setStats] = useState<aboutService.CompanyStats | null>(null);

  // Scroll handler for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Simulate data loading
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch all data from API in parallel
        const [company, history, team, awardsList, statistics] = await Promise.all([
          aboutService.getCompanyInfo().catch(() => null),
          aboutService.getHistoryEntries().catch(() => []),
          aboutService.getFeaturedTeam().catch(() => []),
          aboutService.getAwards().catch(() => []),
          aboutService.getCompanyStats().catch(() => null),
        ]);

        // Set state with fetched data or fallback values
        if (company) {
          setCompanyInfo(company);
        }
        if (history) {
          setHistoryEntries(history);
        }
        if (team) {
          setTeamMembers(team);
        }
        if (awardsList) {
          setAwards(awardsList);
        }
        if (statistics) {
          setStats(statistics);
        }
      } catch (error) {
        console.error('Error loading about data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Scroll to top handler
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  // Newsletter subscription handler
  const handleNewsletterSubscribe = useCallback(async (email: string): Promise<boolean> => {
    try {
      // In production, call API:
      // const response = await fetch('/api/newsletter/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });
      // return response.ok;
      
      console.log('Newsletter subscription:', email);
      return true;
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      return false;
    }
  }, []);

  // Share page handler
  const handleShare = useCallback(() => {
    const shareData = {
      title: `About ${APP_INFO.NAME}`,
      text: APP_INFO.DESCRIPTION,
      url: `${URLS.BASE}/about`
    };

    if (navigator.share) {
      navigator.share(shareData).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareData.url);
      alert('Link copied to clipboard!');
    }
  }, []);

  // Organization structured data for SEO
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization' as const,
    name: companyInfo.companyName || APP_INFO.NAME,
    url: URLS.BASE,
    logo: `${URLS.BASE}/logo.png`,
    description: companyInfo.description || APP_INFO.DESCRIPTION,
    foundingDate: companyInfo.foundedYear?.toString() || '1962',
    founder: {
      '@type': 'Person',
      name: companyInfo.founderName || 'Founder Name'
    },
    address: {
      '@type': 'PostalAddress' as const,
      streetAddress: (typeof companyInfo.headquarters === 'string' ? '' : companyInfo.headquarters) || '',
      addressLocality: CONTACT_INFO.ADDRESS.CITY,
      addressRegion: CONTACT_INFO.ADDRESS.STATE,
      postalCode: CONTACT_INFO.ADDRESS.POSTAL_CODE,
      addressCountry: CONTACT_INFO.ADDRESS.COUNTRY
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: CONTACT_INFO.PHONE,
      contactType: 'Customer Service',
      email: CONTACT_INFO.EMAIL
    },
    sameAs: Object.values(SOCIAL_LINKS)
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" color="blue" />
      </div>
    );
  }

  return (
    <>
      {/* SEO Head */}
      <SEOHead
        title={`About Us - ${companyInfo.companyName}`}
        description={companyInfo.description}
        canonical={`${URLS.BASE}/about`}
      />

      {/* Structured Data */}
      <StructuredData data={organizationSchema} />

      {/* Main Content */}
      <main className="about-page">
        {/* Breadcrumb */}
        <section className="bg-white border-b">
          <Container className="py-4">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-blue-600 transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">About Us</span>
            </nav>
          </Container>
        </section>

        {/* Hero Section with Company Images */}
        <Suspense fallback={<LoadingSpinner size="xl" />}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <HeroImage companyInfo={companyInfo as any} />
        </Suspense>

        {/* Company Introduction */}
        <section className="py-16 bg-white">
          <Container>
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {companyInfo.tagline || "Excellence in Textile Manufacturing Since 1962"}
              </h1>
              <p className="text-xl text-gray-700 leading-relaxed mb-8">
                {companyInfo.description || APP_INFO.DESCRIPTION}
              </p>

              {/* Company Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {companyInfo.stats?.yearsInBusiness || (new Date().getFullYear() - 1962)}+
                  </div>
                  <div className="text-gray-600">Years of Excellence</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {companyInfo.stats?.totalEmployees?.toLocaleString() || '5,000'}+
                  </div>
                  <div className="text-gray-600">Employees</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {(stats?.totalCustomers || companyInfo.stats?.happyCustomers || 10000).toLocaleString()}+
                  </div>
                  <div className="text-gray-600">Happy Customers</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    <GlobeAltIcon className="h-12 w-12 mx-auto" />
                  </div>
                  <div className="text-gray-600">Global Presence</div>
                </motion.div>
              </div>
            </div>
          </Container>
        </section>

        {/* CEO Message Section */}
        <Suspense fallback={<LoadingSpinner size="xl" />}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <MessageFromCEO companyInfo={companyInfo as any} />
        </Suspense>

        {/* Company Journey Timeline */}
        <Suspense fallback={<LoadingSpinner size="xl" />}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <OurJourney companyHistory={historyEntries as any} />
        </Suspense>

        {/* Other Sections (Values, Facilities, Testimonials, Awards, etc.) */}
        <Suspense fallback={<LoadingSpinner size="xl" />}>
          {/* eslint-disable @typescript-eslint/no-explicit-any */}
          <OtherSections 
            companyValues={{} as any}
            facilities={[] as any}
            testimonials={[] as any}
            awards={awards as any}
            offices={[] as any}
          />
          {/* eslint-enable @typescript-eslint/no-explicit-any */}
        </Suspense>

        {/* Team Members Section - Future Enhancement */}
        {teamMembers.length > 0 && (
          <section className="py-16 bg-gray-50 dark:bg-gray-900">
            <Container>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold">Our Leadership Team</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Meet the people driving our success
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {teamMembers.map((member) => (
                  <div key={member._id} className="text-center">
                    <div className="mb-4">
                      <div className="w-32 h-32 mx-auto rounded-full bg-gray-200 dark:bg-gray-700" />
                    </div>
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{member.designation}</p>
                  </div>
                ))}
              </div>
            </Container>
          </section>
        )}

        {/* Newsletter Section */}
        <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
          <Container>
            <div className="max-w-2xl mx-auto">
              <Newsletter
                variant="card"
                size="lg"
                title="Stay Connected"
                subtitle="Subscribe to receive the latest news, updates, and stories from Vardhman Mills."
                showBenefits={true}
                benefits={[
                  'Company news and updates',
                  'Industry insights and trends',
                  'Career opportunities',
                  'Exclusive announcements'
                ]}
                onSubscribe={handleNewsletterSubscribe}
              />
            </div>
          </Container>
        </section>

        {/* Contact CTA Section */}
        <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <Container>
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-6">
                Ready to Work with Us?
              </h2>
              <p className="text-xl mb-8 text-blue-100">
                Whether you&apos;re looking for business partnerships, career opportunities, 
                or have questions about our products and services, we&apos;re here to help.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="min-w-[200px]"
                  >
                    <EnvelopeIcon className="h-5 w-5 mr-2" />
                    Contact Us
                  </Button>
                </Link>
                
                <Link href="/careers">
                  <Button
                    size="lg"
                    variant="outline"
                    className="min-w-[200px] text-white border-white hover:bg-white/10"
                  >
                    <UsersIcon className="h-5 w-5 mr-2" />
                    View Careers
                  </Button>
                </Link>
              </div>

              {/* Contact Information */}
              <div className="mt-12 pt-8 border-t border-white/20">
                <div className="grid md:grid-cols-2 gap-6 text-left max-w-2xl mx-auto">
                  <div className="flex items-start">
                    <PhoneIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold mb-1">Phone</div>
                      <a 
                        href={`tel:${CONTACT_INFO.PHONE}`}
                        className="text-blue-100 hover:text-white transition-colors"
                      >
                        {CONTACT_INFO.PHONE}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <EnvelopeIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold mb-1">Email</div>
                      <a 
                        href={`mailto:${CONTACT_INFO.EMAIL}`}
                        className="text-blue-100 hover:text-white transition-colors"
                      >
                        {CONTACT_INFO.EMAIL}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Share Section */}
        <section className="py-8 bg-gray-50 border-t">
          <Container>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-gray-600">
                Share this page with your network
              </div>
              
              <div className="flex items-center gap-4">
                <ShareButtons
                  url={`${URLS.BASE}/about`}
                  title={`About ${APP_INFO.NAME}`}
                  description={APP_INFO.DESCRIPTION}
                  hashtags={['VardhmanMills', 'TextileIndustry']}
                />
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="ml-2"
                >
                  <ShareIcon className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </Container>
        </section>
      </main>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <button
              onClick={scrollToTop}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-colors"
              aria-label="Back to top"
            >
              <ArrowUpIcon className="h-6 w-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BackToTop Component Alternative */}
      <BackToTop />
    </>
  );
}
