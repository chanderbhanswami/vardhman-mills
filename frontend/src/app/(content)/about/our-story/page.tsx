/**
 * Our Story Page - Vardhman Mills Frontend
 * 
 * Company history, milestones, journey, and achievements page.
 * 
 * @module app/(content)/about/our-story/page
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarIcon,
  TrophyIcon,
  SparklesIcon,
  RocketLaunchIcon,
  HeartIcon,
  GlobeAltIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  ArrowUpIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

// Common Components
import {
  SEOHead,
  BackToTop,
  LoadingSpinner
} from '@/components/common';

// UI Components
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';

// Constants
import { APP_INFO, URLS } from '@/constants/app.constants';

/**
 * Timeline Event Interface
 */
interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  category: 'milestone' | 'expansion' | 'achievement' | 'innovation';
  image?: string;
  highlights?: string[];
}

/**
 * Company Value Interface
 */
interface CompanyValue {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

/**
 * Our Story Page Component
 */
export default function OurStoryPage() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Company timeline events
  const timelineEvents: TimelineEvent[] = [
    {
      id: '1',
      year: '1962',
      title: 'The Beginning',
      description: 'Vardhman Mills was founded with a vision to revolutionize India\'s textile industry.',
      category: 'milestone',
      highlights: [
        'Established first manufacturing unit',
        'Started with 50 employees',
        'Initial production capacity of 10 tons/day'
      ]
    },
    {
      id: '2',
      year: '1975',
      title: 'First Major Expansion',
      description: 'Expanded operations with a new state-of-the-art manufacturing facility in Punjab.',
      category: 'expansion',
      highlights: [
        'Doubled production capacity',
        'Introduced modern machinery',
        'Created 200+ new jobs'
      ]
    },
    {
      id: '3',
      year: '1985',
      title: 'Quality Excellence Award',
      description: 'Received national recognition for quality and innovation in textile manufacturing.',
      category: 'achievement',
      highlights: [
        'First company in sector to win National Quality Award',
        'ISO 9001 certification',
        'Export excellence recognition'
      ]
    },
    {
      id: '4',
      year: '1995',
      title: 'International Expansion',
      description: 'Began exporting products to international markets, establishing global presence.',
      category: 'expansion',
      highlights: [
        'Entered 15 international markets',
        'Established overseas partnerships',
        'Revenue increased by 300%'
      ]
    },
    {
      id: '5',
      year: '2005',
      title: 'Innovation Center Launch',
      description: 'Opened dedicated R&D center for textile innovation and sustainable manufacturing.',
      category: 'innovation',
      highlights: [
        'Investment of ₹50 crore in R&D',
        'Developed 25+ patents',
        'Pioneered eco-friendly processes'
      ]
    },
    {
      id: '6',
      year: '2010',
      title: 'Sustainability Initiative',
      description: 'Launched comprehensive sustainability program to reduce environmental impact.',
      category: 'milestone',
      highlights: [
        'Reduced carbon emissions by 40%',
        'Implemented zero-waste manufacturing',
        'Renewable energy adoption'
      ]
    },
    {
      id: '7',
      year: '2015',
      title: 'Digital Transformation',
      description: 'Embraced Industry 4.0 technologies to modernize operations.',
      category: 'innovation',
      highlights: [
        'Automated production lines',
        'AI-powered quality control',
        'IoT-enabled supply chain'
      ]
    },
    {
      id: '8',
      year: '2020',
      title: 'Pandemic Response',
      description: 'Adapted quickly to produce essential medical textiles during COVID-19.',
      category: 'achievement',
      highlights: [
        'Produced 10 million masks',
        'Supplied to frontline workers',
        'Maintained 100% employee safety'
      ]
    },
    {
      id: '9',
      year: '2023',
      title: 'E-commerce Platform Launch',
      description: 'Launched comprehensive digital platform for direct-to-consumer sales.',
      category: 'innovation',
      highlights: [
        'Online presence in 100+ cities',
        'Mobile-first experience',
        'Seamless customer journey'
      ]
    },
    {
      id: '10',
      year: '2025',
      title: 'Vision 2030',
      description: 'Announced ambitious growth plan focusing on sustainability and innovation.',
      category: 'milestone',
      highlights: [
        'Target: Carbon neutral by 2030',
        'Investment of ₹1000 crore',
        'Creation of 5000+ jobs'
      ]
    }
  ];

  // Company values
  const companyValues: CompanyValue[] = [
    {
      id: '1',
      title: 'Quality First',
      description: 'Uncompromising commitment to delivering the highest quality products.',
      icon: TrophyIcon
    },
    {
      id: '2',
      title: 'Innovation',
      description: 'Continuously pushing boundaries through research and development.',
      icon: SparklesIcon
    },
    {
      id: '3',
      title: 'Sustainability',
      description: 'Responsible manufacturing practices that protect our environment.',
      icon: GlobeAltIcon
    },
    {
      id: '4',
      title: 'Customer Focus',
      description: 'Building lasting relationships through exceptional service.',
      icon: HeartIcon
    },
    {
      id: '5',
      title: 'People Power',
      description: 'Investing in our employees\' growth and well-being.',
      icon: UserGroupIcon
    },
    {
      id: '6',
      title: 'Excellence',
      description: 'Striving for excellence in everything we do.',
      icon: RocketLaunchIcon
    }
  ];

  // Filter categories
  const categories = [
    { value: 'all', label: 'All Events' },
    { value: 'milestone', label: 'Milestones' },
    { value: 'expansion', label: 'Expansions' },
    { value: 'achievement', label: 'Achievements' },
    { value: 'innovation', label: 'Innovations' }
  ];

  // Filtered timeline
  const filteredTimeline = selectedCategory === 'all' 
    ? timelineEvents 
    : timelineEvents.filter(event => event.category === selectedCategory);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Get category badge color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'milestone': return 'bg-blue-100 text-blue-800';
      case 'expansion': return 'bg-green-100 text-green-800';
      case 'achievement': return 'bg-purple-100 text-purple-800';
      case 'innovation': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
        title={`Our Story - ${APP_INFO.NAME}`}
        description="Discover the journey of Vardhman Mills from a small textile manufacturer to India's leading textile company. Learn about our history, milestones, and achievements."
        canonical={`${URLS.BASE}/about/our-story`}
      />

      {/* Main Content */}
      <main className="our-story-page">
        {/* Breadcrumb */}
        <section className="bg-white border-b">
          <Container className="py-4">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-blue-600 transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href="/about" className="hover:text-blue-600 transition-colors">
                About
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Our Story</span>
            </nav>
          </Container>
        </section>

        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <Container>
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <CalendarIcon className="h-16 w-16 mx-auto mb-6" />
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  Our Journey Through Time
                </h1>
                <p className="text-xl md:text-2xl text-blue-100 mb-8">
                  Over 60 years of excellence, innovation, and commitment to quality
                </p>
                <div className="flex items-center justify-center gap-8 text-center">
                  <div>
                    <div className="text-4xl font-bold">1962</div>
                    <div className="text-blue-200">Founded</div>
                  </div>
                  <ChevronRightIcon className="h-8 w-8" />
                  <div>
                    <div className="text-4xl font-bold">60+</div>
                    <div className="text-blue-200">Years</div>
                  </div>
                  <ChevronRightIcon className="h-8 w-8" />
                  <div>
                    <div className="text-4xl font-bold">2025</div>
                    <div className="text-blue-200">Today</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </Container>
        </section>

        {/* Company Overview */}
        <section className="py-16 bg-white">
          <Container>
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  From Humble Beginnings to Industry Leader
                </h2>
                <div className="text-lg text-gray-700 space-y-4 text-left">
                  <p>
                    Founded in 1962, {APP_INFO.NAME} began as a small textile manufacturing unit with a big vision - to revolutionize India&apos;s textile industry through quality, innovation, and sustainable practices.
                  </p>
                  <p>
                    What started with just 50 employees and a single manufacturing unit has grown into one of India&apos;s most respected textile companies, employing over 5,000 people across multiple facilities and serving customers worldwide.
                  </p>
                  <p>
                    Our journey has been marked by continuous innovation, strategic expansion, and an unwavering commitment to excellence. From pioneering eco-friendly manufacturing processes to embracing cutting-edge technology, we&apos;ve always stayed ahead of the curve.
                  </p>
                  <p>
                    Today, we stand proud as a testament to what vision, hard work, and dedication can achieve. But our story doesn&apos;t end here - we&apos;re just getting started.
                  </p>
                </div>
              </motion.div>
            </div>
          </Container>
        </section>

        {/* Timeline Section */}
        <section className="py-16 bg-gray-50">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our Milestones
              </h2>
              <p className="text-xl text-gray-600">
                Key moments that shaped our journey
              </p>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {categories.map(category => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* Timeline */}
            <div className="relative">
              {/* Vertical Line */}
              <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-blue-600 to-indigo-600" />

              <div className="space-y-12">
                {filteredTimeline.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative flex items-center ${
                      index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                    }`}
                  >
                    {/* Content */}
                    <div className="w-full md:w-5/12">
                      <Card className="p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="text-2xl font-bold text-blue-600">{event.year}</div>
                          <Badge className={getCategoryColor(event.category)}>
                            {event.category}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          {event.title}
                        </h3>
                        <p className="text-gray-700 mb-4">{event.description}</p>
                        {event.highlights && (
                          <ul className="space-y-2">
                            {event.highlights.map((highlight, idx) => (
                              <li key={idx} className="flex items-start text-sm text-gray-600">
                                <ChevronRightIcon className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                                {highlight}
                              </li>
                            ))}
                          </ul>
                        )}
                      </Card>
                    </div>

                    {/* Timeline Dot */}
                    <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-12 h-12 bg-blue-600 rounded-full items-center justify-center z-10 border-4 border-white shadow-lg">
                      <CalendarIcon className="h-6 w-6 text-white" />
                    </div>

                    {/* Spacer */}
                    <div className="hidden md:block w-5/12" />
                  </motion.div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* Company Values */}
        <section className="py-16 bg-white">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our Core Values
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {companyValues.map((value, index) => {
                const IconComponent = value.icon;
                return (
                  <motion.div
                    key={value.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6 h-full text-center hover:shadow-lg transition-shadow">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full mb-4">
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {value.title}
                      </h3>
                      <p className="text-gray-600">
                        {value.description}
                      </p>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </Container>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <Container>
            <div className="max-w-4xl mx-auto text-center">
              <BuildingOffice2Icon className="h-16 w-16 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Be Part of Our Story
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join us on our journey to shape the future of textile manufacturing
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/about/careers">
                  <Button size="lg" variant="secondary">
                    Explore Careers
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="text-white border-white hover:bg-white/10"
                  >
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </main>

      {/* Back to Top */}
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

      <BackToTop />
    </>
  );
}
