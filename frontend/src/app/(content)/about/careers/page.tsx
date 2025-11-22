/**
 * Careers Page - Vardhman Mills Frontend
 * 
 * Job listings, company culture, benefits, and career opportunities page.
 * 
 * @module app/(content)/about/careers/page
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BriefcaseIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  HeartIcon,
  SparklesIcon,
  UserGroupIcon,
  TrophyIcon,
  RocketLaunchIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline';

// Common Components
import {
  SEOHead,
  BackToTop,
  Newsletter,
  LoadingSpinner
} from '@/components/common';

// UI Components
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';

// Constants
import { APP_INFO, URLS, CONTACT_INFO } from '@/constants/app.constants';

/**
 * Job Opening Interface
 */
interface JobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  experience: string;
  salary?: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  postedDate: string;
}

/**
 * Benefit Interface
 */
interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

/**
 * Careers Page Component
 */
export default function CareersPage() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  // Mock job openings data
  const jobOpenings: JobOpening[] = [
    {
      id: '1',
      title: 'Senior Software Engineer',
      department: 'Technology',
      location: 'Mumbai, Maharashtra',
      type: 'Full-time',
      experience: '5-8 years',
      salary: '₹15-25 LPA',
      description: 'Join our technology team to build innovative solutions for textile manufacturing.',
      requirements: [
        'Bachelor\'s degree in Computer Science or related field',
        '5+ years of experience in software development',
        'Strong knowledge of React, Node.js, and TypeScript',
        'Experience with cloud platforms (AWS/Azure)',
        'Excellent problem-solving skills'
      ],
      responsibilities: [
        'Design and develop scalable web applications',
        'Lead technical discussions and code reviews',
        'Mentor junior developers',
        'Collaborate with cross-functional teams'
      ],
      postedDate: '2025-10-10'
    },
    {
      id: '2',
      title: 'Production Manager',
      department: 'Manufacturing',
      location: 'Ludhiana, Punjab',
      type: 'Full-time',
      experience: '8-12 years',
      salary: '₹18-30 LPA',
      description: 'Oversee production operations and ensure quality standards.',
      requirements: [
        'Bachelor\'s degree in Textile Engineering or related field',
        '8+ years in textile manufacturing',
        'Strong leadership and management skills',
        'Knowledge of quality control processes',
        'Excellent communication skills'
      ],
      responsibilities: [
        'Manage daily production operations',
        'Ensure quality standards are met',
        'Optimize production efficiency',
        'Lead and develop production team'
      ],
      postedDate: '2025-10-08'
    },
    {
      id: '3',
      title: 'Marketing Specialist',
      department: 'Marketing',
      location: 'Delhi NCR',
      type: 'Full-time',
      experience: '3-5 years',
      salary: '₹8-15 LPA',
      description: 'Drive marketing initiatives and brand awareness campaigns.',
      requirements: [
        'Bachelor\'s degree in Marketing or related field',
        '3+ years of marketing experience',
        'Strong digital marketing skills',
        'Experience with SEO, SEM, and social media',
        'Creative thinking and analytical skills'
      ],
      responsibilities: [
        'Develop and execute marketing campaigns',
        'Manage social media presence',
        'Analyze marketing metrics and ROI',
        'Collaborate with sales and product teams'
      ],
      postedDate: '2025-10-05'
    },
    {
      id: '4',
      title: 'Quality Assurance Engineer',
      department: 'Quality Control',
      location: 'Mumbai, Maharashtra',
      type: 'Full-time',
      experience: '2-4 years',
      salary: '₹6-12 LPA',
      description: 'Ensure product quality through rigorous testing and quality control.',
      requirements: [
        'Bachelor\'s degree in Textile Technology or related field',
        '2+ years in quality assurance',
        'Knowledge of quality standards and testing methods',
        'Attention to detail',
        'Good analytical skills'
      ],
      responsibilities: [
        'Conduct quality inspections and testing',
        'Document quality issues and track resolutions',
        'Implement quality improvement initiatives',
        'Train production staff on quality standards'
      ],
      postedDate: '2025-10-01'
    },
    {
      id: '5',
      title: 'Business Development Manager',
      department: 'Sales',
      location: 'Bangalore, Karnataka',
      type: 'Full-time',
      experience: '5-8 years',
      salary: '₹12-20 LPA',
      description: 'Drive business growth and develop strategic partnerships.',
      requirements: [
        'MBA or equivalent degree',
        '5+ years in business development or sales',
        'Strong negotiation and communication skills',
        'Experience in B2B sales',
        'Proven track record of meeting targets'
      ],
      responsibilities: [
        'Identify and pursue new business opportunities',
        'Build and maintain client relationships',
        'Negotiate contracts and close deals',
        'Develop sales strategies and forecasts'
      ],
      postedDate: '2025-09-28'
    },
    {
      id: '6',
      title: 'Software Development Intern',
      department: 'Technology',
      location: 'Remote',
      type: 'Internship',
      experience: '0-1 year',
      salary: '₹15-25k/month',
      description: 'Learn and grow with our technology team as a software development intern.',
      requirements: [
        'Currently pursuing Bachelor\'s degree in Computer Science',
        'Basic knowledge of programming languages',
        'Eagerness to learn new technologies',
        'Good problem-solving skills',
        'Strong communication skills'
      ],
      responsibilities: [
        'Assist in software development projects',
        'Write clean, maintainable code',
        'Participate in team meetings and discussions',
        'Learn from senior developers'
      ],
      postedDate: '2025-09-25'
    }
  ];

  // Company benefits
  const benefits: Benefit[] = [
    {
      id: '1',
      title: 'Competitive Salary',
      description: 'Industry-leading compensation packages with regular performance reviews.',
      icon: CurrencyDollarIcon
    },
    {
      id: '2',
      title: 'Health Insurance',
      description: 'Comprehensive medical insurance for you and your family.',
      icon: HeartIcon
    },
    {
      id: '3',
      title: 'Learning & Development',
      description: 'Continuous learning opportunities, training programs, and skill development.',
      icon: AcademicCapIcon
    },
    {
      id: '4',
      title: 'Work-Life Balance',
      description: 'Flexible working hours and remote work options to maintain work-life balance.',
      icon: SparklesIcon
    },
    {
      id: '5',
      title: 'Team Culture',
      description: 'Collaborative and inclusive work environment with diverse teams.',
      icon: UserGroupIcon
    },
    {
      id: '6',
      title: 'Career Growth',
      description: 'Clear career paths with opportunities for advancement and leadership roles.',
      icon: RocketLaunchIcon
    }
  ];

  // Get unique departments and locations
  const departments = ['All', ...Array.from(new Set(jobOpenings.map(job => job.department)))];
  const locations = ['All', ...Array.from(new Set(jobOpenings.map(job => job.location)))];

  // Filter jobs based on search and filters
  const filteredJobs = jobOpenings.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === 'All' || job.department === selectedDepartment;
    const matchesLocation = selectedLocation === 'All' || job.location === selectedLocation;
    
    return matchesSearch && matchesDepartment && matchesLocation;
  });

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

  // Toggle job expansion
  const toggleJobExpansion = useCallback((jobId: string) => {
    setExpandedJob(prev => prev === jobId ? null : jobId);
  }, []);

  // Handle job application
  const handleApply = useCallback((jobId: string) => {
    // In production, this would navigate to application form or open modal
    console.log('Apply for job:', jobId);
    alert('Application form coming soon! Please send your resume to careers@vardhmanmills.com');
  }, []);

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
        title={`Careers - Join ${APP_INFO.NAME}`}
        description="Explore career opportunities at Vardhman Mills. Join our team and be part of India's leading textile manufacturing company."
        canonical={`${URLS.BASE}/about/careers`}
      />

      {/* Main Content */}
      <main className="careers-page">
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
              <span className="text-gray-900 font-medium">Careers</span>
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
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  Build Your Career with Us
                </h1>
                <p className="text-xl md:text-2xl text-blue-100 mb-8">
                  Join a team that values innovation, excellence, and growth
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => document.getElementById('job-openings')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    View Open Positions
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-white border-white hover:bg-white/10"
                  >
                    Learn About Culture
                  </Button>
                </div>
              </motion.div>
            </div>
          </Container>
        </section>

        {/* Why Join Us Section */}
        <section className="py-16 bg-white">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Join {APP_INFO.NAME}?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We offer more than just a job - we offer a career path with endless possibilities
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <motion.div
                    key={benefit.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <IconComponent className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {benefit.title}
                          </h3>
                          <p className="text-gray-600">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </Container>
        </section>

        {/* Job Openings Section */}
        <section id="job-openings" className="py-16 bg-gray-50">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Current Openings
              </h2>
              <p className="text-xl text-gray-600">
                Find your perfect role from {jobOpenings.length} available positions
              </p>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="grid md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Department Filter */}
                <div className="relative">
                  <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    aria-label="Filter by department"
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    aria-label="Filter by location"
                  >
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Job Listings */}
            <div className="space-y-4">
              {filteredJobs.length === 0 ? (
                <Card className="p-12 text-center">
                  <BriefcaseIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No jobs found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search or filters
                  </p>
                </Card>
              ) : (
                filteredJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                {job.title}
                              </h3>
                              <div className="flex flex-wrap gap-2 mb-3">
                                <Badge variant="secondary">{job.department}</Badge>
                                <Badge variant="outline">{job.type}</Badge>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center">
                              <MapPinIcon className="h-4 w-4 mr-1" />
                              {job.location}
                            </div>
                            <div className="flex items-center">
                              <ClockIcon className="h-4 w-4 mr-1" />
                              {job.experience}
                            </div>
                            {job.salary && (
                              <div className="flex items-center">
                                <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                                {job.salary}
                              </div>
                            )}
                          </div>

                          <p className="text-gray-700 mb-4">{job.description}</p>

                          {/* Expanded Details */}
                          <AnimatePresence>
                            {expandedJob === job.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="border-t pt-4 mt-4"
                              >
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">
                                      Requirements:
                                    </h4>
                                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                                      {job.requirements.map((req, idx) => (
                                        <li key={idx}>{req}</li>
                                      ))}
                                    </ul>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">
                                      Responsibilities:
                                    </h4>
                                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                                      {job.responsibilities.map((resp, idx) => (
                                        <li key={idx}>{resp}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="flex md:flex-col gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApply(job.id)}
                            className="whitespace-nowrap"
                          >
                            Apply Now
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleJobExpansion(job.id)}
                            className="whitespace-nowrap"
                          >
                            {expandedJob === job.id ? 'Show Less' : 'View Details'}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </Container>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-white">
          <Container>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-12 text-center text-white">
              <TrophyIcon className="h-16 w-16 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Don&apos;t See Your Role?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                We&apos;re always looking for talented individuals. Send us your resume and we&apos;ll keep you in mind for future opportunities.
              </p>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => window.location.href = `mailto:${CONTACT_INFO.EMAIL}`}
              >
                Send Your Resume
              </Button>
            </div>
          </Container>
        </section>

        {/* Newsletter */}
        <section className="py-16 bg-gray-50">
          <Container>
            <div className="max-w-2xl mx-auto">
              <Newsletter
                variant="card"
                size="lg"
                title="Stay Updated on Job Openings"
                subtitle="Subscribe to receive notifications about new career opportunities."
                showBenefits={false}
              />
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
