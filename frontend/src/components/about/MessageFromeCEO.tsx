"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Quote, Play, Pause, Volume2, VolumeX, ExternalLink, Mail, Phone, Linkedin } from 'lucide-react';
import { CompanyInfo } from '@/types/about.types';

// Import UI components for better consistency and maintainability
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Container } from '../ui/Container';

interface MessageFromCEOProps {
  companyInfo: CompanyInfo;
  className?: string;
}

interface CEOMessage {
  message: string;
  personalNote?: string;
  videoMessage?: {
    url: string;
    thumbnail: string;
    duration: number;
  };
  audioMessage?: {
    url: string;
    duration: number;
  };
}

interface CEOProfile {
  name: string;
  title: string;
  image: string;
  bio: string;
  experience: string;
  achievements: string[];
  education: string[];
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    email?: string;
    phone?: string;
  };
  quote: string;
}

const MessageFromCEO: React.FC<MessageFromCEOProps> = ({
  companyInfo,
  className = ""
}) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);
  const [activeTab, setActiveTab] = useState<'message' | 'bio' | 'achievements'>('message');

  // Mock CEO data - In real app, this would come from props or API
  const ceoProfile: CEOProfile = {
    name: "Rajesh Vardhman",
    title: "Chief Executive Officer & Founder",
    image: "/images/ceo-profile.jpg",
    bio: "With over 25 years of experience in the textile industry, Rajesh Vardhman has led Vardhman Mills to become one of India's premier textile manufacturers. His vision for sustainable manufacturing and innovation has transformed the company into a global leader in premium fabrics and textiles.",
    experience: "25+ Years in Textile Industry",
    achievements: [
      "Transformed Vardhman Mills into a global textile leader",
      "Pioneered sustainable manufacturing practices in the industry",
      "Established partnerships with leading international brands",
      "Recipient of Textile Excellence Award 2023",
      "Featured in Forbes India's Top 100 Entrepreneurs",
      "Led company's digital transformation initiatives"
    ],
    education: [
      "MBA in Business Administration - IIM Ahmedabad",
      "B.Tech in Textile Engineering - IIT Delhi",
      "Executive Program in Leadership - Harvard Business School"
    ],
    socialLinks: {
      linkedin: "https://linkedin.com/in/rajesh-vardhman",
      email: "ceo@vardhmanmills.com",
      phone: "+91-98765-43210"
    },
    quote: "Our commitment to quality and innovation has been the cornerstone of our success for over two decades."
  };

  const ceoMessage: CEOMessage = {
    message: "Dear Valued Customers and Partners, As we continue our journey of excellence in textile manufacturing, I am proud to reflect on how far we've come. At Vardhman Mills, we don't just manufacture fabrics; we weave dreams, create lasting relationships, and build a sustainable future. Our commitment to quality, innovation, and environmental responsibility has always been at the heart of everything we do. Today, we stand as a testament to what can be achieved when tradition meets innovation, when craftsmanship meets technology, and when passion meets purpose. Thank you for being part of our incredible journey.",
    personalNote: "Looking ahead, I am excited about the opportunities that lie before us. Together, we will continue to set new standards in the textile industry.",
    videoMessage: {
      url: "/videos/ceo-message.mp4",
      thumbnail: "/images/ceo-video-thumbnail.jpg",
      duration: 180
    },
    audioMessage: {
      url: "/audio/ceo-message.mp3",
      duration: 120
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.6
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const handleVideoPlay = () => {
    setIsVideoPlaying(!isVideoPlaying);
    if (isAudioPlaying) setIsAudioPlaying(false);
  };

  const handleAudioPlay = () => {
    setIsAudioPlaying(!isAudioPlaying);
    if (isVideoPlaying) setIsVideoPlaying(false);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <section className={`py-16 lg:py-24 bg-gradient-to-br from-slate-50 to-blue-50 ${className}`}>
      <Container size="xl" centered>
        {/* Section Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-6"
          >
            <Quote className="w-8 h-8" />
          </motion.div>
          <motion.h2
            variants={itemVariants}
            className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
          >
            Message from Our CEO
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            A personal message from our leadership about our vision, values, and commitment to excellence
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* CEO Profile Card */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            <Card variant="elevated" size="lg" className="overflow-hidden">
              {/* Profile Header */}
              <div className="relative">
                <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-700"></div>
                <div className="absolute -bottom-16 left-8">
                  <div className="relative">
                    <Image
                      src={ceoProfile.image}
                      alt={ceoProfile.name}
                      width={128}
                      height={128}
                      className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                </div>
              </div>

              <CardContent className="pt-20 pb-8">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-1">
                    {ceoProfile.name}
                  </CardTitle>
                  <CardDescription className="text-blue-600 font-medium mb-3">
                    {ceoProfile.title}
                  </CardDescription>
                  <p className="text-gray-600 text-sm">
                    {ceoProfile.experience}
                  </p>
                </CardHeader>

              {/* Navigation Tabs */}
              <div className="flex border-b border-gray-200 mb-6">
                {['message', 'bio', 'achievements'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as typeof activeTab)}
                    className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                      activeTab === tab
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="space-y-4">
                {activeTab === 'message' && (
                  <motion.div
                    key="message"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <blockquote className="text-gray-700 italic mb-4">
                      &ldquo;{ceoProfile.quote}&rdquo;
                    </blockquote>
                    
                    {/* Media Controls */}
                    <div className="space-y-3">
                      {/* Video Message */}
                      {ceoMessage.videoMessage && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={handleVideoPlay}
                              className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                            >
                              {isVideoPlaying ? (
                                <Pause className="w-5 h-5" />
                              ) : (
                                <Play className="w-5 h-5 ml-0.5" />
                              )}
                            </button>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Video Message
                              </p>
                              <p className="text-xs text-gray-500">
                                Duration: {formatDuration(ceoMessage.videoMessage.duration)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setIsMuted(!isMuted)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {isMuted ? (
                              <VolumeX className="w-5 h-5" />
                            ) : (
                              <Volume2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      )}

                      {/* Audio Message */}
                      {ceoMessage.audioMessage && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={handleAudioPlay}
                              className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transition-colors"
                            >
                              {isAudioPlaying ? (
                                <Pause className="w-5 h-5" />
                              ) : (
                                <Play className="w-5 h-5 ml-0.5" />
                              )}
                            </button>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Audio Message
                              </p>
                              <p className="text-xs text-gray-500">
                                Duration: {formatDuration(ceoMessage.audioMessage.duration)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'bio' && (
                  <motion.div
                    key="bio"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <p className="text-gray-700 leading-relaxed">
                      {showFullBio ? ceoProfile.bio : `${ceoProfile.bio.substring(0, 200)}...`}
                    </p>
                    <button
                      onClick={() => setShowFullBio(!showFullBio)}
                      className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
                    >
                      {showFullBio ? 'Show Less' : 'Read More'}
                    </button>

                    {/* Education */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Education</h4>
                      <ul className="space-y-1">
                        {ceoProfile.education.map((edu, index) => (
                          <li key={index} className="text-sm text-gray-600">
                            • {edu}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'achievements' && (
                  <motion.div
                    key="achievements"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ul className="space-y-3">
                      {ceoProfile.achievements.map((achievement, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-gray-700 text-sm">{achievement}</p>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>

              {/* Social Links */}
              <CardFooter className="pt-6 border-t border-gray-200">
                <div className="flex space-x-4">
                  {ceoProfile.socialLinks.linkedin && (
                    <a
                      href={ceoProfile.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      aria-label="LinkedIn Profile"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  {ceoProfile.socialLinks.email && (
                    <a
                      href={`mailto:${ceoProfile.socialLinks.email}`}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      aria-label="Send Email"
                    >
                      <Mail className="w-5 h-5" />
                    </a>
                  )}
                  {ceoProfile.socialLinks.phone && (
                    <a
                      href={`tel:${ceoProfile.socialLinks.phone}`}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      aria-label="Call"
                    >
                      <Phone className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </CardFooter>
              </CardContent>
            </Card>
          </motion.div>

          {/* CEO Message Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="space-y-8"
          >
            {/* Main Message */}
            <motion.div variants={itemVariants}>
              <Card variant="elevated" size="lg">
                <CardHeader>
                  <div className="flex items-center">
                    <Quote className="w-8 h-8 text-blue-600 mr-3" />
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      CEO&apos;s Message
                    </CardTitle>
                  </div>
                </CardHeader>
                
                <CardContent className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {ceoMessage.message}
                  </p>
                  
                  {ceoMessage.personalNote && (
                    <div className="border-l-4 border-blue-600 pl-6 bg-blue-50 p-4 rounded-r-lg">
                      <p className="text-gray-800 font-medium italic">
                        {ceoMessage.personalNote}
                      </p>
                    </div>
                  )}

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{ceoProfile.name}</p>
                        <p className="text-blue-600 text-sm">{ceoProfile.title}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-500 text-sm">
                          {companyInfo.companyName}
                        </p>
                        <p className="text-gray-400 text-xs">
                          Established {companyInfo.foundedYear}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Company Vision Alignment */}
            <motion.div variants={itemVariants}>
              <Card variant="glass" size="lg" className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white mb-4">Our Commitment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Quality Excellence</h4>
                      <p className="text-blue-100 text-sm">
                        Maintaining the highest standards in every product we create
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Innovation</h4>
                      <p className="text-blue-100 text-sm">
                        Pioneering new technologies and sustainable practices
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Customer Focus</h4>
                      <p className="text-blue-100 text-sm">
                        Building lasting relationships through exceptional service
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Sustainability</h4>
                      <p className="text-blue-100 text-sm">
                        Creating a positive impact on our environment and community
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Call to Action */}
            <motion.div variants={itemVariants}>
              <Card variant="elevated" size="lg">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Connect with Our Leadership
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Have questions or want to learn more about our vision? We&apos;d love to hear from you.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      asChild
                      size="lg"
                      leftIcon={<Mail className="w-5 h-5" />}
                    >
                      <a href={`mailto:${ceoProfile.socialLinks.email}`}>
                        Send Message
                      </a>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      leftIcon={<ExternalLink className="w-5 h-5" />}
                    >
                      <Link href="/contact">
                        Contact Us
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
};

export default MessageFromCEO;
