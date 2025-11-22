/**
 * Our Team Page - Vardhman Mills Frontend
 * 
 * Leadership team, management, and key personnel page.
 * 
 * @module app/(content)/about/our-team/page
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserGroupIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  TrophyIcon,
  ArrowUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import {
  LinkedinIcon,
  TwitterIcon
} from 'lucide-react';

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
 * Team Member Interface
 */
interface TeamMember {
  id: string;
  name: string;
  position: string;
  department: string;
  category: 'leadership' | 'management' | 'advisory';
  bio: string;
  image: string;
  education?: string[];
  experience: string;
  achievements?: string[];
  email?: string;
  phone?: string;
  linkedin?: string;
  twitter?: string;
  specializations?: string[];
}

/**
 * Department Interface
 */
interface Department {
  id: string;
  name: string;
  description: string;
  teamSize: number;
}

/**
 * Our Team Page Component
 */
export default function OurTeamPage() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  // Team members data
  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Rajesh Sharma',
      position: 'Chief Executive Officer',
      department: 'Executive Leadership',
      category: 'leadership',
      bio: 'Rajesh brings over 25 years of experience in textile manufacturing and has been instrumental in transforming Vardhman Mills into a global leader.',
      image: '/images/team/ceo.jpg',
      education: [
        'MBA - Harvard Business School',
        'B.Tech Textile Engineering - IIT Delhi'
      ],
      experience: '25+ years',
      achievements: [
        'Led company to 300% revenue growth',
        'Expanded international operations to 30+ countries',
        'Pioneered sustainable manufacturing initiatives'
      ],
      email: 'rajesh.sharma@vardhmanmills.com',
      linkedin: 'https://linkedin.com/in/rajeshsharma',
      specializations: ['Strategic Planning', 'Business Development', 'Operations Management']
    },
    {
      id: '2',
      name: 'Priya Patel',
      position: 'Chief Financial Officer',
      department: 'Finance',
      category: 'leadership',
      bio: 'Priya oversees all financial operations and has been key in securing strategic investments for company growth.',
      image: '/images/team/cfo.jpg',
      education: [
        'CA - Institute of Chartered Accountants of India',
        'B.Com - Delhi University'
      ],
      experience: '20+ years',
      achievements: [
        'Successfully raised ₹500 crore in funding',
        'Improved profit margins by 15%',
        'Implemented financial automation systems'
      ],
      email: 'priya.patel@vardhmanmills.com',
      linkedin: 'https://linkedin.com/in/priyapatel',
      specializations: ['Financial Planning', 'Investment Strategy', 'Risk Management']
    },
    {
      id: '3',
      name: 'Amit Kumar',
      position: 'Chief Technology Officer',
      department: 'Technology',
      category: 'leadership',
      bio: 'Amit leads our digital transformation initiatives and oversees all technology operations.',
      image: '/images/team/cto.jpg',
      education: [
        'M.S. Computer Science - Stanford University',
        'B.Tech Computer Science - IIT Bombay'
      ],
      experience: '18+ years',
      achievements: [
        'Led Industry 4.0 transformation',
        'Implemented AI-powered quality control',
        'Built scalable e-commerce platform'
      ],
      email: 'amit.kumar@vardhmanmills.com',
      twitter: 'https://twitter.com/amitkumar',
      linkedin: 'https://linkedin.com/in/amitkumar',
      specializations: ['Digital Transformation', 'AI/ML', 'Cloud Architecture']
    },
    {
      id: '4',
      name: 'Dr. Sunita Mehta',
      position: 'Vice President - Research & Development',
      department: 'R&D',
      category: 'management',
      bio: 'Dr. Mehta heads our innovation center and has filed over 25 patents in textile technology.',
      image: '/images/team/vp-rd.jpg',
      education: [
        'Ph.D. Textile Technology - MIT',
        'M.Tech Textile Engineering - IIT Delhi'
      ],
      experience: '22+ years',
      achievements: [
        '25+ patents filed',
        'Developed eco-friendly fiber technology',
        'Published 40+ research papers'
      ],
      email: 'sunita.mehta@vardhmanmills.com',
      specializations: ['Textile Innovation', 'Sustainable Materials', 'Product Development']
    },
    {
      id: '5',
      name: 'Vikram Singh',
      position: 'Vice President - Manufacturing',
      department: 'Operations',
      category: 'management',
      bio: 'Vikram oversees all manufacturing operations across our facilities ensuring quality and efficiency.',
      image: '/images/team/vp-mfg.jpg',
      education: [
        'MBA - Operations Management',
        'B.Tech Mechanical Engineering'
      ],
      experience: '20+ years',
      achievements: [
        'Increased production efficiency by 35%',
        'Reduced waste by 50%',
        'Implemented lean manufacturing'
      ],
      email: 'vikram.singh@vardhmanmills.com',
      specializations: ['Operations Excellence', 'Quality Management', 'Lean Six Sigma']
    },
    {
      id: '6',
      name: 'Neha Gupta',
      position: 'Vice President - Marketing',
      department: 'Marketing',
      category: 'management',
      bio: 'Neha drives our brand strategy and marketing initiatives across all channels.',
      image: '/images/team/vp-marketing.jpg',
      education: [
        'MBA - Marketing',
        'B.A. Mass Communication'
      ],
      experience: '15+ years',
      achievements: [
        'Increased brand awareness by 200%',
        'Led successful digital campaigns',
        'Built social media presence to 1M+ followers'
      ],
      email: 'neha.gupta@vardhmanmills.com',
      twitter: 'https://twitter.com/nehagupta',
      linkedin: 'https://linkedin.com/in/nehagupta',
      specializations: ['Brand Strategy', 'Digital Marketing', 'Customer Engagement']
    },
    {
      id: '7',
      name: 'Arun Verma',
      position: 'Senior Advisor',
      department: 'Advisory Board',
      category: 'advisory',
      bio: 'Arun provides strategic guidance on business development and international expansion.',
      image: '/images/team/advisor-1.jpg',
      education: [
        'Ph.D. Business Administration',
        'MBA - INSEAD'
      ],
      experience: '30+ years',
      achievements: [
        'Former CEO of Fortune 500 company',
        'Board member of 5 companies',
        'Industry thought leader'
      ],
      specializations: ['Strategy', 'International Business', 'Corporate Governance']
    },
    {
      id: '8',
      name: 'Dr. Kavita Reddy',
      position: 'Sustainability Advisor',
      department: 'Advisory Board',
      category: 'advisory',
      bio: 'Dr. Reddy advises on environmental sustainability and corporate social responsibility.',
      image: '/images/team/advisor-2.jpg',
      education: [
        'Ph.D. Environmental Science',
        'M.Sc. Sustainability Studies'
      ],
      experience: '25+ years',
      achievements: [
        'UN Sustainability Award recipient',
        'Published author on green manufacturing',
        'Advisor to multiple Fortune 500 companies'
      ],
      specializations: ['Sustainability', 'ESG', 'Climate Action']
    }
  ];

  // Departments
  const departments: Department[] = [
    {
      id: '1',
      name: 'Executive Leadership',
      description: 'Strategic direction and overall company management',
      teamSize: 3
    },
    {
      id: '2',
      name: 'Operations',
      description: 'Manufacturing and production operations',
      teamSize: 250
    },
    {
      id: '3',
      name: 'Technology',
      description: 'Digital innovation and IT infrastructure',
      teamSize: 85
    },
    {
      id: '4',
      name: 'R&D',
      description: 'Research, development, and innovation',
      teamSize: 45
    },
    {
      id: '5',
      name: 'Sales & Marketing',
      description: 'Business development and brand management',
      teamSize: 120
    },
    {
      id: '6',
      name: 'Quality Control',
      description: 'Quality assurance and compliance',
      teamSize: 60
    }
  ];

  // Filter categories
  const categories = [
    { value: 'all', label: 'All Team' },
    { value: 'leadership', label: 'Leadership' },
    { value: 'management', label: 'Management' },
    { value: 'advisory', label: 'Advisory Board' }
  ];

  // Filtered team members
  const filteredTeam = selectedCategory === 'all' 
    ? teamMembers 
    : teamMembers.filter(member => member.category === selectedCategory);

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

  // Toggle member details
  const toggleMemberDetails = useCallback((memberId: string) => {
    setExpandedMember(prev => prev === memberId ? null : memberId);
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
        title={`Our Team - ${APP_INFO.NAME}`}
        description="Meet the leadership team and talented professionals behind Vardhman Mills. Learn about our executives, managers, and advisory board members."
        canonical={`${URLS.BASE}/about/our-team`}
      />

      {/* Main Content */}
      <main className="our-team-page">
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
              <span className="text-gray-900 font-medium">Our Team</span>
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
                <UserGroupIcon className="h-16 w-16 mx-auto mb-6" />
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  Meet Our Team
                </h1>
                <p className="text-xl md:text-2xl text-blue-100 mb-8">
                  Talented professionals driving innovation and excellence
                </p>
                <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                  <div>
                    <div className="text-4xl font-bold">5000+</div>
                    <div className="text-blue-200">Employees</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold">15+</div>
                    <div className="text-blue-200">Departments</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold">30+</div>
                    <div className="text-blue-200">Countries</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </Container>
        </section>

        {/* Team Overview */}
        <section className="py-16 bg-white">
          <Container>
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                A Team Built on Excellence
              </h2>
              <p className="text-lg text-gray-700">
                Our success is powered by a diverse team of talented individuals who bring passion, 
                expertise, and innovation to everything they do. From our executive leadership to our 
                frontline employees, every team member plays a crucial role in our journey.
              </p>
            </div>

            {/* Departments Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.map((dept, index) => (
                <motion.div
                  key={dept.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {dept.name}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm">
                      {dept.description}
                    </p>
                    <div className="flex items-center text-blue-600 font-medium">
                      <UserGroupIcon className="h-5 w-5 mr-2" />
                      {dept.teamSize} Team Members
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* Team Members Section */}
        <section className="py-16 bg-gray-50">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Leadership & Management
              </h2>
              <p className="text-xl text-gray-600">
                Meet the people leading our organization
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

            {/* Team Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTeam.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                    {/* Image */}
                    <div className="relative h-64 bg-gradient-to-br from-blue-100 to-indigo-100">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <UserGroupIcon className="h-24 w-24 text-blue-300" />
                      </div>
                      {member.category === 'leadership' && (
                        <Badge className="absolute top-4 right-4 bg-blue-600 text-white">
                          Leadership
                        </Badge>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {member.name}
                      </h3>
                      <p className="text-blue-600 font-medium mb-2">
                        {member.position}
                      </p>
                      <p className="text-sm text-gray-600 mb-4">
                        {member.department}
                      </p>
                      
                      <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                        {member.bio}
                      </p>

                      {/* Specializations */}
                      {member.specializations && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {member.specializations.slice(0, 2).map((spec, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Experience Badge */}
                      <div className="flex items-center text-sm text-gray-600 mb-4">
                        <BriefcaseIcon className="h-4 w-4 mr-2" />
                        {member.experience}
                      </div>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {expandedMember === member.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-t pt-4 mt-4 space-y-4"
                          >
                            {/* Education */}
                            {member.education && (
                              <div>
                                <div className="flex items-center text-sm font-semibold text-gray-900 mb-2">
                                  <AcademicCapIcon className="h-4 w-4 mr-2" />
                                  Education
                                </div>
                                <ul className="text-sm text-gray-700 space-y-1">
                                  {member.education.map((edu, idx) => (
                                    <li key={idx}>• {edu}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Achievements */}
                            {member.achievements && (
                              <div>
                                <div className="flex items-center text-sm font-semibold text-gray-900 mb-2">
                                  <TrophyIcon className="h-4 w-4 mr-2" />
                                  Key Achievements
                                </div>
                                <ul className="text-sm text-gray-700 space-y-1">
                                  {member.achievements.map((achievement, idx) => (
                                    <li key={idx}>• {achievement}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Contact */}
                            <div className="flex flex-wrap gap-2">
                              {member.email && (
                                <a 
                                  href={`mailto:${member.email}`}
                                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                                >
                                  <EnvelopeIcon className="h-4 w-4 mr-1" />
                                  Email
                                </a>
                              )}
                              {member.linkedin && (
                                <a 
                                  href={member.linkedin}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                                >
                                  <LinkedinIcon className="h-4 w-4 mr-1" />
                                  LinkedIn
                                </a>
                              )}
                              {member.twitter && (
                                <a 
                                  href={member.twitter}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                                >
                                  <TwitterIcon className="h-4 w-4 mr-1" />
                                  Twitter
                                </a>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Toggle Button */}
                      <button
                        onClick={() => toggleMemberDetails(member.id)}
                        className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center"
                      >
                        {expandedMember === member.id ? 'Show Less' : 'View Full Profile'}
                        <ChevronDownIcon className={`h-4 w-4 ml-1 transition-transform ${
                          expandedMember === member.id ? 'rotate-180' : ''
                        }`} />
                      </button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <Container>
            <div className="max-w-4xl mx-auto text-center">
              <TrophyIcon className="h-16 w-16 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Join Our Winning Team
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                We&apos;re always looking for talented individuals to join our team
              </p>
              <Link href="/about/careers">
                <Button size="lg" variant="secondary">
                  Explore Career Opportunities
                </Button>
              </Link>
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
