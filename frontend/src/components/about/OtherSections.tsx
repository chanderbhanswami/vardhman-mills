"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Award, 
  Building, 
  Heart, 
  Leaf, 
  Target,
  ChevronRight,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Clock,
  Star,
  ArrowRight,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { 
  CompanyValues, 
  ManufacturingFacility, 
  CustomerTestimonial, 
  Award as AwardType,
  OfficeLocation
} from '@/types/about.types';

interface OtherSectionsProps {
  companyValues: CompanyValues;
  facilities: ManufacturingFacility[];
  testimonials: CustomerTestimonial[];
  awards: AwardType[];
  offices: OfficeLocation[];
  className?: string;
}

const OtherSections: React.FC<OtherSectionsProps> = ({
  companyValues,
  facilities,
  testimonials,
  awards,
  offices,
  className = ""
}) => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);

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

  const featuredTestimonials = testimonials.filter(t => t.isFeatured).slice(0, 5);
  const featuredAwards = awards.filter(a => a.isFeatured).slice(0, 6);
  const sustainabilityInitiatives = companyValues.sustainabilityInitiatives.slice(0, 4);

  return (
    <div className={`py-16 lg:py-24 ${className}`}>
      {/* Values, Mission & Vision Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-6">
              <Target className="w-8 h-8" />
            </motion.div>
            <motion.h2 variants={itemVariants} className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Our Values & Mission
            </motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles, vision, and values that guide everything we do
            </motion.p>
          </motion.div>

          {/* Mission & Vision Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Mission */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
                <div className="flex items-center mb-4">
                  {companyValues.mission.icon && (
                    <Image
                      src={companyValues.mission.icon.url}
                      alt="Mission Icon"
                      width={48}
                      height={48}
                      className="mr-4"
                    />
                  )}
                  <h3 className="text-2xl font-bold">{companyValues.mission.title}</h3>
                </div>
              </div>
              <div className="p-8">
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  {companyValues.mission.description}
                </p>
                <ul className="space-y-3">
                  {companyValues.mission.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Vision */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-8 text-white">
                <div className="flex items-center mb-4">
                  {companyValues.vision.icon && (
                    <Image
                      src={companyValues.vision.icon.url}
                      alt="Vision Icon"
                      width={48}
                      height={48}
                      className="mr-4"
                    />
                  )}
                  <h3 className="text-2xl font-bold">{companyValues.vision.title}</h3>
                </div>
              </div>
              <div className="p-8">
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  {companyValues.vision.description}
                </p>
                <ul className="space-y-3">
                  {companyValues.vision.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start">
                      <Star className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Core Values */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {companyValues.values.map((value) => (
              <motion.div
                key={value.id}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white rounded-xl shadow-lg p-6 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Image
                    src={value.icon.url}
                    alt={value.icon.alt || value.title}
                    width={32}
                    height={32}
                    className="text-white"
                  />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Manufacturing Facilities Section */}
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center justify-center w-16 h-16 bg-green-600 text-white rounded-full mb-6">
              <Building className="w-8 h-8" />
            </motion.div>
            <motion.h2 variants={itemVariants} className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Our Facilities
            </motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-gray-600 max-w-3xl mx-auto">
              State-of-the-art manufacturing facilities equipped with latest technology
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {facilities.slice(0, 3).map((facility) => (
              <motion.div
                key={facility.id}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden cursor-pointer"
                onClick={() => setSelectedFacility(selectedFacility === facility.id ? null : facility.id)}
              >
                {/* Facility Image */}
                {facility.images.length > 0 && (
                  <div className="h-48 relative">
                    <Image
                      src={facility.images[0].url}
                      alt={facility.images[0].alt || facility.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {facility.type}
                    </div>
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{facility.name}</h3>
                  <div className="flex items-center text-gray-600 text-sm mb-4">
                    <MapPin className="w-4 h-4 mr-2" />
                    {facility.address.city}, {facility.address.state}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {(facility.totalArea / 1000).toFixed(1)}K
                      </div>
                      <div className="text-xs text-gray-500">sq ft</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {facility.totalEmployees}
                      </div>
                      <div className="text-xs text-gray-500">Employees</div>
                    </div>
                  </div>

                  {/* Expandable Content */}
                  {selectedFacility === facility.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-200 pt-4 space-y-4"
                    >
                      {/* Production Capacity */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Production Capacity</h4>
                        <div className="space-y-2">
                          {facility.productionCapacity.slice(0, 2).map((capacity, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-gray-600">{capacity.productType}</span>
                              <span className="font-medium">
                                {capacity.dailyCapacity} {capacity.unit}/day
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Certifications */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Certifications</h4>
                        <div className="flex flex-wrap gap-2">
                          {facility.certifications.slice(0, 3).map((cert, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
                            >
                              {cert.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <button className="w-full mt-4 flex items-center justify-center text-green-600 font-medium hover:text-green-700 transition-colors">
                    {selectedFacility === facility.id ? 'Show Less' : 'View Details'}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Testimonials Section */}
      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 text-white rounded-full mb-6">
              <Heart className="w-8 h-8" />
            </motion.div>
            <motion.h2 variants={itemVariants} className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from our valued customers about their experience with us
            </motion.p>
          </motion.div>

          {/* Featured Testimonial */}
          {featuredTestimonials.length > 0 && (
            <motion.div
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 mb-12"
            >
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                {/* Customer Image */}
                {featuredTestimonials[activeTestimonial].customerImage && (
                  <div className="flex-shrink-0">
                    <Image
                      src={featuredTestimonials[activeTestimonial].customerImage!.url}
                      alt={featuredTestimonials[activeTestimonial].customerName}
                      width={120}
                      height={120}
                      className="rounded-full object-cover"
                    />
                  </div>
                )}

                {/* Testimonial Content */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-5 h-5 ${
                          i < featuredTestimonials[activeTestimonial].rating 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <blockquote className="text-xl lg:text-2xl text-gray-700 mb-6 leading-relaxed">
                    &ldquo;{featuredTestimonials[activeTestimonial].content}&rdquo;
                  </blockquote>
                  
                  <div>
                    <div className="font-bold text-gray-900 text-lg">
                      {featuredTestimonials[activeTestimonial].customerName}
                    </div>
                    {featuredTestimonials[activeTestimonial].customerTitle && (
                      <div className="text-purple-600 font-medium">
                        {featuredTestimonials[activeTestimonial].customerTitle}
                      </div>
                    )}
                    {featuredTestimonials[activeTestimonial].companyName && (
                      <div className="text-gray-600">
                        {featuredTestimonials[activeTestimonial].companyName}
                      </div>
                    )}
                    <div className="text-gray-500 text-sm">
                      {featuredTestimonials[activeTestimonial].location}
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial Navigation */}
              {featuredTestimonials.length > 1 && (
                <div className="flex justify-center mt-8 space-x-2">
                  {featuredTestimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTestimonial(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        activeTestimonial === index 
                          ? 'bg-purple-600 scale-125' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`View testimonial ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Additional Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.filter(t => !t.isFeatured).slice(0, 6).map((testimonial) => (
              <motion.div
                key={testimonial.id}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ y: -3 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${
                        i < testimonial.rating 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                
                <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                  &ldquo;{testimonial.content.length > 150 
                    ? `${testimonial.content.substring(0, 150)}...` 
                    : testimonial.content}&rdquo;
                </p>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="font-semibold text-gray-900 text-sm">
                    {testimonial.customerName}
                  </div>
                  {testimonial.companyName && (
                    <div className="text-gray-600 text-xs">
                      {testimonial.companyName}
                    </div>
                  )}
                  <div className="text-gray-500 text-xs">
                    {testimonial.location}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards & Recognition Section */}
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center justify-center w-16 h-16 bg-yellow-600 text-white rounded-full mb-6">
              <Award className="w-8 h-8" />
            </motion.div>
            <motion.h2 variants={itemVariants} className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Awards & Recognition
            </motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-gray-600 max-w-3xl mx-auto">
              Industry recognition and awards that showcase our commitment to excellence
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredAwards.map((award) => (
              <motion.div
                key={award.id}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
              >
                {/* Award Header */}
                <div className={`p-6 text-white ${
                  award.significance === 'International' ? 'bg-gradient-to-r from-purple-600 to-pink-600' :
                  award.significance === 'National' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' :
                  award.significance === 'Regional' ? 'bg-gradient-to-r from-green-600 to-teal-600' :
                  'bg-gradient-to-r from-gray-600 to-gray-700'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <Award className="w-8 h-8" />
                    <span className="text-xs font-medium opacity-90">
                      {award.significance}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{award.title}</h3>
                  <p className="text-sm opacity-90">
                    {award.awardedBy.name}
                  </p>
                </div>

                {/* Award Content */}
                <div className="p-6">
                  <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                    {award.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>
                      {new Date(award.awardDate).getFullYear()}
                    </span>
                    <span className="capitalize">
                      {award.category.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  </div>

                  {/* Award Criteria */}
                  {award.criteria.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Criteria</h4>
                      <ul className="space-y-1">
                        {award.criteria.slice(0, 3).map((criterion, idx) => (
                          <li key={idx} className="flex items-start text-xs text-gray-600">
                            <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            {criterion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {award.verificationUrl && (
                    <a
                      href={award.verificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Verify Award
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sustainability Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center justify-center w-16 h-16 bg-green-600 text-white rounded-full mb-6">
              <Leaf className="w-8 h-8" />
            </motion.div>
            <motion.h2 variants={itemVariants} className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Sustainability Initiatives
            </motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our commitment to environmental responsibility and sustainable practices
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sustainabilityInitiatives.map((initiative) => (
              <motion.div
                key={initiative.id}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                {/* Initiative Image */}
                {initiative.image && (
                  <div className="h-48 relative">
                    <Image
                      src={initiative.image.url}
                      alt={initiative.image.alt || initiative.title}
                      fill
                      className="object-cover"
                    />
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium text-white ${
                      initiative.status === 'Active' ? 'bg-green-600' :
                      initiative.status === 'Completed' ? 'bg-blue-600' :
                      'bg-yellow-600'
                    }`}>
                      {initiative.status}
                    </div>
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {initiative.title}
                  </h3>
                  
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {initiative.description}
                  </p>

                  <div className="bg-green-50 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-green-900 mb-2">Environmental Impact</h4>
                    <p className="text-green-800 text-sm">{initiative.impact}</p>
                  </div>

                  {/* Metrics */}
                  {initiative.metrics && initiative.metrics.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      {initiative.metrics.slice(0, 2).map((metric, idx) => (
                        <div key={idx} className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {metric.value}
                          </div>
                          <div className="text-xs text-gray-600">
                            {metric.metric} ({metric.unit})
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <span>Started: {new Date(initiative.startDate).getFullYear()}</span>
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>{initiative.status}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Offices Section */}
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 text-white rounded-full mb-6">
              <MapPin className="w-8 h-8" />
            </motion.div>
            <motion.h2 variants={itemVariants} className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Our Locations
            </motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find us at our offices and facilities across different locations
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {offices.filter(office => office.showOnContactPage).slice(0, 6).map((office) => (
              <motion.div
                key={office.id}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{office.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      office.type === 'Head Office' ? 'bg-blue-100 text-blue-800' :
                      office.type === 'Branch Office' ? 'bg-green-100 text-green-800' :
                      office.type === 'Manufacturing Unit' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {office.type}
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                      <div className="text-sm text-gray-600">
                        <div>{office.address.line1}</div>
                        <div>{office.address.city}, {office.address.state} {office.address.postalCode}</div>
                        <div>{office.address.country}</div>
                      </div>
                    </div>

                    {office.phone.length > 0 && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-3" />
                        <a 
                          href={`tel:${office.phone[0]}`}
                          className="text-sm text-indigo-600 hover:text-indigo-700"
                        >
                          {office.phone[0]}
                        </a>
                      </div>
                    )}

                    {office.email.length > 0 && (
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-3" />
                        <a 
                          href={`mailto:${office.email[0]}`}
                          className="text-sm text-indigo-600 hover:text-indigo-700"
                        >
                          {office.email[0]}
                        </a>
                      </div>
                    )}

                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-600">
                        Mon-Fri: {office.operatingHours.monday.openTime} - {office.operatingHours.monday.closeTime}
                      </span>
                    </div>
                  </div>

                  {/* Services */}
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Services</h4>
                    <div className="flex flex-wrap gap-1">
                      {office.servicesOffered.slice(0, 3).map((service, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {service}
                        </span>
                      ))}
                      {office.servicesOffered.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          +{office.servicesOffered.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact CTA */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="mt-16 text-center"
          >
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl shadow-xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Ready to Connect?</h3>
              <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
                Have questions about our company, products, or services? We&apos;d love to hear from you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-indigo-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Contact Us
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link 
                  href="/products"
                  className="inline-flex items-center justify-center px-6 py-3 border border-white/20 text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
                >
                  View Products
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default OtherSections;
