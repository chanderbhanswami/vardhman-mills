'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { cn } from '@/lib/utils';

// Import all contact components
import ContactBanner from './ContactBanner';
import ContactForm from './ContactForm';
import ContactInfo from './ContactInfo';
import ContactMap from './ContactMap';

interface ContactPageProps {
  className?: string;
  variant?: 'default' | 'minimal' | 'comprehensive';
  showBanner?: boolean;
  showForm?: boolean;
  showInfo?: boolean;
  showMap?: boolean;
  bannerVariant?: 'default' | 'hero' | 'minimal' | 'gradient';
  formVariant?: 'default' | 'minimal' | 'detailed' | 'wizard';
  infoVariant?: 'default' | 'compact' | 'detailed' | 'cards';
  mapVariant?: 'default' | 'minimal' | 'detailed';
}

interface ContactSectionProps {
  className?: string;
  children?: React.ReactNode;
  title?: string;
  description?: string;
  id?: string;
}

// Individual component exports for modular usage
export { default as ContactBanner } from './ContactBanner';
export { default as ContactForm } from './ContactForm';
export { default as ContactInfo } from './ContactInfo';
export { default as ContactMap } from './ContactMap';

// Section wrapper component
const ContactSection: React.FC<ContactSectionProps> = ({
  className,
  children,
  title,
  description,
  id
}) => {
  return (
    <section id={id} className={cn('py-12', className)}>
      <Container>
        {(title || description) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {description}
              </p>
            )}
          </motion.div>
        )}
        {children}
      </Container>
    </section>
  );
};

// Main contact page component
const ContactPage: React.FC<ContactPageProps> = ({
  className,
  variant = 'default',
  showBanner = true,
  showForm = true,
  showInfo = true,
  showMap = true,
  bannerVariant = 'default',
  formVariant = 'default',
  infoVariant = 'default',
  mapVariant = 'default'
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
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

  if (variant === 'minimal') {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={cn('min-h-screen', className)}
      >
        {showBanner && (
          <motion.div variants={sectionVariants}>
            <ContactBanner 
              variant="minimal" 
              showQuickContact={false}
              showBusinessHours={false}
            />
          </motion.div>
        )}
        
        <Container className="py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {showForm && (
              <motion.div variants={sectionVariants}>
                <ContactForm variant="minimal" showAttachments={false} />
              </motion.div>
            )}
            
            {showInfo && (
              <motion.div variants={sectionVariants}>
                <ContactInfo variant="compact" showTeamInfo={false} />
              </motion.div>
            )}
          </div>
        </Container>
      </motion.div>
    );
  }

  if (variant === 'comprehensive') {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={cn('min-h-screen', className)}
      >
        {showBanner && (
          <motion.div variants={sectionVariants}>
            <ContactBanner 
              variant={bannerVariant}
              showQuickContact={true}
              showBusinessHours={true}
              showSocialLinks={true}
            />
          </motion.div>
        )}

        {showForm && (
          <ContactSection
            id="contact-form"
            title="Get in Touch"
            description="Fill out the form below and we'll respond within 24 hours. For urgent matters, please call us directly."
            className="bg-gray-50"
          >
            <motion.div variants={sectionVariants}>
              <ContactForm 
                variant={formVariant}
                showAttachments={true}
                showBudgetFields={true}
                showCompanyFields={true}
              />
            </motion.div>
          </ContactSection>
        )}

        {showInfo && (
          <ContactSection
            id="contact-info"
            title="Contact Information"
            description="Multiple ways to reach us and learn more about our services and locations."
          >
            <motion.div variants={sectionVariants}>
              <ContactInfo 
                variant={infoVariant}
                showTeamInfo={true}
                showCertifications={true}
                showBusinessHours={true}
                showEmergencyContact={true}
              />
            </motion.div>
          </ContactSection>
        )}

        {showMap && (
          <ContactSection
            id="location-map"
            title="Find Our Locations"
            description="Visit us at any of our convenient locations or use the interactive map to get directions."
            className="bg-gray-50"
          >
            <motion.div variants={sectionVariants}>
              <ContactMap 
                variant={mapVariant}
                showDirections={true}
                showNearbyLandmarks={true}
                showTransportInfo={true}
                height={500}
              />
            </motion.div>
          </ContactSection>
        )}
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn('min-h-screen', className)}
    >
      {showBanner && (
        <motion.div variants={sectionVariants}>
          <ContactBanner variant={bannerVariant} />
        </motion.div>
      )}

      <Container className="py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Contact Form */}
          {showForm && (
            <motion.div variants={sectionVariants} className="lg:col-span-2">
              <ContactForm variant={formVariant} />
            </motion.div>
          )}

          {/* Contact Information Sidebar */}
          {showInfo && (
            <motion.div variants={sectionVariants} className="lg:col-span-1">
              <div className="sticky top-8">
                <ContactInfo variant="compact" />
              </div>
            </motion.div>
          )}
        </div>

        {/* Map Section */}
        {showMap && (
          <motion.div variants={sectionVariants} className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Visit Our Locations
              </h2>
              <p className="text-gray-600">
                Find us on the map and get directions to our facilities
              </p>
            </div>
            <ContactMap variant={mapVariant} />
          </motion.div>
        )}
      </Container>
    </motion.div>
  );
};

// Export section component
export { ContactSection };

// Default export
export default ContactPage;