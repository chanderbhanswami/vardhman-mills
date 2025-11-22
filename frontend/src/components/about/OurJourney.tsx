"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, useInView, Variants } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Award, 
  TrendingUp, 
  Lightbulb, 
  Building, 
  Globe,
  ChevronLeft,
  ChevronRight,
  Search
} from 'lucide-react';
import { CompanyHistory } from '@/types/about.types';

interface OurJourneyProps {
  companyHistory: CompanyHistory;
  className?: string;
}

type TimelineFilter = 'all' | 'founding' | 'product' | 'expansion' | 'award' | 'innovation';

const OurJourney: React.FC<OurJourneyProps> = ({
  companyHistory,
  className = ""
}) => {
  const [selectedFilter, setSelectedFilter] = useState<TimelineFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const [currentEra, setCurrentEra] = useState(0);
  const [viewMode, setViewMode] = useState<'timeline' | 'eras' | 'achievements'>('timeline');
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  // Filter milestones based on selected filter and search term
  const filteredMilestones = companyHistory.timeline.filter(milestone => {
    const matchesFilter = selectedFilter === 'all' || 
      milestone.category.toLowerCase().includes(selectedFilter.toLowerCase());
    const matchesSearch = milestone.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      milestone.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Sort milestones by year
  const sortedMilestones = [...filteredMilestones].sort((a, b) => a.year - b.year);

  const filterOptions = [
    { value: 'all' as const, label: 'All Events', icon: Globe, color: 'gray' },
    { value: 'founding' as const, label: 'Founding', icon: Building, color: 'blue' },
    { value: 'product' as const, label: 'Products', icon: Lightbulb, color: 'green' },
    { value: 'expansion' as const, label: 'Expansion', icon: TrendingUp, color: 'purple' },
    { value: 'award' as const, label: 'Awards', icon: Award, color: 'yellow' },
    { value: 'innovation' as const, label: 'Innovation', icon: Lightbulb, color: 'red' }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'founding': return Building;
      case 'product launch': return Lightbulb;
      case 'expansion': return TrendingUp;
      case 'award': return Award;
      case 'innovation': return Lightbulb;
      case 'partnership': return Users;
      default: return MapPin;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'founding': return 'bg-blue-500';
      case 'product launch': return 'bg-green-500';
      case 'expansion': return 'bg-purple-500';
      case 'award': return 'bg-yellow-500';
      case 'innovation': return 'bg-red-500';
      case 'partnership': return 'bg-indigo-500';
      default: return 'bg-gray-500';
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

  const timelineVariants: Variants = {
    hidden: { scaleY: 0 },
    visible: {
      scaleY: 1,
      transition: {
        duration: 1.5,
        ease: [0.4, 0.0, 0.2, 1] // Use valid easing array
      }
    }
  };

  return (
    <section className={`py-16 lg:py-24 bg-gray-50 ${className}`} ref={containerRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center mb-16"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-6">
            <Calendar className="w-8 h-8" />
          </motion.div>
          <motion.h2 variants={itemVariants} className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Our Journey
          </motion.h2>
          <motion.p variants={itemVariants} className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Discover the milestones, achievements, and pivotal moments that have shaped our company&apos;s remarkable journey over the years.
          </motion.p>

          {/* View Mode Toggle */}
          <motion.div variants={itemVariants} className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-sm border">
              {['timeline', 'eras', 'achievements'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as typeof viewMode)}
                  className={`px-6 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                    viewMode === mode
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Controls */}
        {viewMode === 'timeline' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="mb-12"
          >
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              {/* Search */}
              <motion.div variants={itemVariants} className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search milestones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </motion.div>

              {/* Filter Buttons */}
              <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
                {filterOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setSelectedFilter(option.value)}
                      className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedFilter === option.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                      }`}
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      {option.label}
                    </button>
                  );
                })}
              </motion.div>
            </div>
            
            {/* Results Count */}
            <motion.div variants={itemVariants} className="mt-4 text-center">
              <p className="text-gray-600">
                Showing {sortedMilestones.length} of {companyHistory.timeline.length} milestones
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* Content Based on View Mode */}
        {viewMode === 'timeline' && (
          <div className="relative">
            {/* Timeline Line */}
            <motion.div
              variants={timelineVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="absolute left-8 top-0 bottom-0 w-0.5 bg-blue-200 origin-top"
            />

            {/* Timeline Items */}
            <div className="space-y-12">
              {sortedMilestones.map((milestone, index) => {
                const IconComponent = getCategoryIcon(milestone.category);
                const isSelected = selectedMilestone === milestone.id;

                return (
                  <motion.div
                    key={milestone.id}
                    variants={itemVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className={`relative pl-20 ${
                      index % 2 === 0 ? 'lg:pl-20 lg:pr-0' : 'lg:pl-0 lg:pr-20 lg:ml-auto lg:max-w-2xl'
                    }`}
                  >
                    {/* Timeline Node */}
                    <div className={`absolute left-6 w-6 h-6 rounded-full border-4 border-white shadow-md ${getCategoryColor(milestone.category)} ${
                      index % 2 === 0 ? 'lg:left-6' : 'lg:-right-3'
                    }`}>
                      <div className="absolute inset-0 rounded-full bg-white flex items-center justify-center">
                        <IconComponent className="w-3 h-3 text-gray-600" />
                      </div>
                    </div>

                    {/* Content Card */}
                    <motion.div
                      className={`bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 ${
                        isSelected ? 'ring-2 ring-blue-500 shadow-xl' : 'hover:shadow-xl'
                      }`}
                      whileHover={{ y: -2 }}
                      onClick={() => setSelectedMilestone(isSelected ? null : milestone.id)}
                    >
                      {/* Card Header */}
                      <div className="p-6 pb-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-2xl font-bold text-blue-600">
                            {milestone.year}
                            {milestone.month && `, ${new Date(0, milestone.month - 1).toLocaleString('default', { month: 'long' })}`}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            milestone.significance === 'High' 
                              ? 'bg-red-100 text-red-800' 
                              : milestone.significance === 'Medium' 
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {milestone.significance} Impact
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {milestone.title}
                        </h3>

                        <p className="text-gray-600 leading-relaxed">
                          {milestone.description}
                        </p>

                        {milestone.location && (
                          <div className="flex items-center mt-3 text-gray-500">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span className="text-sm">{milestone.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Expandable Content */}
                      {isSelected && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-gray-200 p-6"
                        >
                          {/* Impact */}
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-900 mb-2">Impact</h4>
                            <p className="text-gray-700 text-sm">{milestone.impact}</p>
                          </div>

                          {/* Key Figures */}
                          {milestone.keyFigures && milestone.keyFigures.length > 0 && (
                            <div className="mb-4">
                              <h4 className="font-semibold text-gray-900 mb-2">Key Figures</h4>
                              <div className="flex flex-wrap gap-2">
                                {milestone.keyFigures.map((figure, idx) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                  >
                                    {figure}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Image */}
                          {milestone.image && (
                            <div className="mt-4">
                              <Image
                                src={milestone.image.url}
                                alt={milestone.image.alt || milestone.title}
                                width={400}
                                height={200}
                                className="w-full h-48 object-cover rounded-lg"
                              />
                            </div>
                          )}
                        </motion.div>
                      )}
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === 'eras' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="space-y-8"
          >
            {/* Era Navigation */}
            <div className="flex items-center justify-center mb-12">
              <button
                onClick={() => setCurrentEra(Math.max(0, currentEra - 1))}
                disabled={currentEra === 0}
                className="p-2 rounded-full bg-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                aria-label="Previous era"
                title="Previous era"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <div className="mx-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900">
                  {companyHistory.eras[currentEra]?.name || "Era"}
                </h3>
                <p className="text-gray-600">
                  {companyHistory.eras[currentEra]?.startYear} - {companyHistory.eras[currentEra]?.endYear || "Present"}
                </p>
              </div>
              
              <button
                onClick={() => setCurrentEra(Math.min(companyHistory.eras.length - 1, currentEra + 1))}
                disabled={currentEra >= companyHistory.eras.length - 1}
                className="p-2 rounded-full bg-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                aria-label="Next era"
                title="Next era"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Era Content */}
            {companyHistory.eras[currentEra] && (
              <motion.div
                key={currentEra}
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-xl overflow-hidden"
              >
                {/* Era Image */}
                {companyHistory.eras[currentEra].image && (
                  <div className="h-64 relative">
                    <Image
                      src={companyHistory.eras[currentEra].image!.url}
                      alt={companyHistory.eras[currentEra].image!.alt || companyHistory.eras[currentEra].name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                )}

                <div className="p-8">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    {companyHistory.eras[currentEra].name}
                  </h3>
                  
                  <p className="text-gray-700 text-lg leading-relaxed mb-6">
                    {companyHistory.eras[currentEra].description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Key Characteristics */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Key Characteristics</h4>
                      <ul className="space-y-2">
                        {companyHistory.eras[currentEra].keyCharacteristics.map((char, idx) => (
                          <li key={idx} className="flex items-start">
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{char}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Major Achievements */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Major Achievements</h4>
                      <ul className="space-y-2">
                        {companyHistory.eras[currentEra].majorAchievements.map((achievement, idx) => (
                          <li key={idx} className="flex items-start">
                            <Award className="w-4 h-4 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Challenges */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Challenges Overcome</h4>
                      <ul className="space-y-2">
                        {companyHistory.eras[currentEra].challenges.map((challenge, idx) => (
                          <li key={idx} className="flex items-start">
                            <div className="w-4 h-4 border-2 border-red-600 rounded-full mt-0.5 mr-3 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{challenge}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Era Timeline */}
            <div className="flex justify-center">
              <div className="flex space-x-2">
                {companyHistory.eras.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentEra(idx)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      idx === currentEra ? 'bg-blue-600 scale-125' : 'bg-gray-300'
                    }`}
                    aria-label={`Go to era ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {viewMode === 'achievements' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {companyHistory.achievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                {/* Achievement Header */}
                <div className={`p-6 ${
                  achievement.significance === 'International' ? 'bg-gradient-to-r from-purple-600 to-blue-600' :
                  achievement.significance === 'National' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' :
                  achievement.significance === 'Regional' ? 'bg-gradient-to-r from-green-600 to-teal-600' :
                  'bg-gradient-to-r from-gray-600 to-gray-700'
                } text-white`}>
                  <div className="flex items-center justify-between mb-3">
                    <Award className="w-8 h-8" />
                    <span className="text-xs font-medium opacity-90">
                      {achievement.significance}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{achievement.title}</h3>
                  <p className="text-sm opacity-90">
                    Awarded by {achievement.awardedBy}
                  </p>
                </div>

                {/* Achievement Content */}
                <div className="p-6">
                  <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                    {achievement.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {new Date(achievement.date).getFullYear()}
                    </span>
                    <span className="capitalize">
                      {achievement.category.replace('_', ' ')}
                    </span>
                  </div>

                  {achievement.verificationUrl && (
                    <a
                      href={achievement.verificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Verify Achievement
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Journey Statistics */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mt-20 bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl shadow-xl text-white p-8"
        >
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-2">Journey by Numbers</h3>
            <p className="text-blue-100">Key metrics from our remarkable journey</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <motion.div variants={itemVariants} className="text-center">
              <div className="text-4xl font-bold mb-2">
                {companyHistory.timeline.length}
              </div>
              <div className="text-blue-100 text-sm">Milestones</div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="text-center">
              <div className="text-4xl font-bold mb-2">
                {companyHistory.eras.length}
              </div>
              <div className="text-blue-100 text-sm">Eras</div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="text-center">
              <div className="text-4xl font-bold mb-2">
                {companyHistory.achievements.length}
              </div>
              <div className="text-blue-100 text-sm">Achievements</div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="text-center">
              <div className="text-4xl font-bold mb-2">
                {new Date().getFullYear() - Math.min(...companyHistory.timeline.map(m => m.year))}+
              </div>
              <div className="text-blue-100 text-sm">Years</div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default OurJourney;
