'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, MessageCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface ContactBannerProps {
  className?: string;
  variant?: 'default' | 'hero' | 'minimal' | 'gradient';
  showQuickContact?: boolean;
  showBusinessHours?: boolean;
  showSocialLinks?: boolean;
  backgroundImage?: string;
  overlayOpacity?: number;
}

interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  businessHours: {
    weekdays: string;
    weekends: string;
    holidays: string;
  };
  emergency?: string;
}

interface SocialLink {
  name: string;
  url: string;
  icon: React.ReactNode;
  color: string;
}

const contactInfo: ContactInfo = {
  phone: '+91 98765 43210',
  email: 'contact@vardhmanmills.com',
  address: 'Vardhman Mills, Industrial Area, New Delhi, India 110025',
  businessHours: {
    weekdays: 'Monday - Friday: 9:00 AM - 6:00 PM',
    weekends: 'Saturday: 10:00 AM - 4:00 PM',
    holidays: 'Sunday: Closed'
  },
  emergency: '+91 98765 43211'
};

const socialLinks: SocialLink[] = [
  {
    name: 'WhatsApp',
    url: 'https://wa.me/919876543210',
    icon: <MessageCircle className="w-5 h-5" />,
    color: 'bg-green-500 hover:bg-green-600'
  },
  {
    name: 'Phone',
    url: 'tel:+919876543210',
    icon: <Phone className="w-5 h-5" />,
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    name: 'Email',
    url: 'mailto:contact@vardhmanmills.com',
    icon: <Mail className="w-5 h-5" />,
    color: 'bg-red-500 hover:bg-red-600'
  }
];

const ContactBanner: React.FC<ContactBannerProps> = ({
  className,
  variant = 'default',
  showQuickContact = true,
  showBusinessHours = true,
  showSocialLinks = true,
  backgroundImage,
  overlayOpacity = 0.7
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'hero':
        return 'bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white min-h-[60vh]';
      case 'minimal':
        return 'bg-gray-50 border-b';
      case 'gradient':
        return 'bg-gradient-to-r from-blue-600 to-purple-600 text-white';
      default:
        return 'bg-primary-600 text-white';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section
      className={cn(
        'relative overflow-hidden',
        getVariantClasses(),
        backgroundImage && 'bg-cover bg-center',
        className
      )}
    >
      {/* Background Overlay */}
      {backgroundImage && (
        <div className={cn(
          'absolute inset-0 bg-black',
          overlayOpacity === 0.7 ? 'opacity-70' :
          overlayOpacity === 0.5 ? 'opacity-50' :
          overlayOpacity === 0.3 ? 'opacity-30' :
          'opacity-60'
        )} />
      )}

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        <div className="absolute top-1/2 -left-8 w-24 h-24 bg-white/5 rounded-full blur-lg" />
        <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
      </div>

      <Container className="relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={cn(
            'py-16',
            variant === 'hero' ? 'py-24' : 'py-12',
            variant === 'minimal' ? 'py-8' : ''
          )}
        >
          {/* Main Header */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-4"
            >
              <Badge 
                variant="secondary" 
                className={cn(
                  'text-sm px-4 py-2',
                  variant === 'minimal' ? 'bg-primary-100 text-primary-700' : 'bg-white/20 text-white'
                )}
              >
                Get in Touch
              </Badge>
            </motion.div>
            
            <motion.h1 
              className={cn(
                'text-4xl md:text-6xl font-bold mb-6',
                variant === 'minimal' ? 'text-gray-900' : 'text-white'
              )}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Contact{' '}
              <span className={cn(
                'bg-gradient-to-r bg-clip-text text-transparent',
                variant === 'minimal' 
                  ? 'from-primary-600 to-purple-600'
                  : 'from-yellow-400 to-orange-400'
              )}>
                Vardhman Mills
              </span>
            </motion.h1>
            
            <motion.p 
              className={cn(
                'text-xl max-w-3xl mx-auto leading-relaxed',
                variant === 'minimal' ? 'text-gray-600' : 'text-white/90'
              )}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              We&apos;re here to help you with all your textile needs. Reach out to us through any of the channels below,
              and our expert team will get back to you promptly.
            </motion.p>
          </motion.div>

          {/* Contact Information Grid */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
          >
            {/* Phone Card */}
            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className={cn(
                'p-6 h-full transition-all duration-300',
                variant === 'minimal' 
                  ? 'bg-white border shadow-md hover:shadow-lg'
                  : 'bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20'
              )}>
                <div className="flex items-start gap-4">
                  <div className={cn(
                    'p-3 rounded-lg',
                    variant === 'minimal' ? 'bg-primary-100' : 'bg-white/20'
                  )}>
                    <Phone className={cn(
                      'w-6 h-6',
                      variant === 'minimal' ? 'text-primary-600' : 'text-white'
                    )} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">Call Us</h3>
                    <p className="text-sm opacity-90 mb-3">
                      Speak directly with our team
                    </p>
                    <div className="space-y-1">
                      <a 
                        href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                        className="block hover:underline font-mono"
                      >
                        {contactInfo.phone}
                      </a>
                      {contactInfo.emergency && (
                        <a 
                          href={`tel:${contactInfo.emergency.replace(/\s/g, '')}`}
                          className="block text-sm opacity-75 hover:underline font-mono"
                        >
                          Emergency: {contactInfo.emergency}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Email Card */}
            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className={cn(
                'p-6 h-full transition-all duration-300',
                variant === 'minimal' 
                  ? 'bg-white border shadow-md hover:shadow-lg'
                  : 'bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20'
              )}>
                <div className="flex items-start gap-4">
                  <div className={cn(
                    'p-3 rounded-lg',
                    variant === 'minimal' ? 'bg-blue-100' : 'bg-white/20'
                  )}>
                    <Mail className={cn(
                      'w-6 h-6',
                      variant === 'minimal' ? 'text-blue-600' : 'text-white'
                    )} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">Email Us</h3>
                    <p className="text-sm opacity-90 mb-3">
                      Send us your inquiries
                    </p>
                    <a 
                      href={`mailto:${contactInfo.email}`}
                      className="block hover:underline font-mono break-all"
                    >
                      {contactInfo.email}
                    </a>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Location Card */}
            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="md:col-span-2 lg:col-span-1"
            >
              <Card className={cn(
                'p-6 h-full transition-all duration-300',
                variant === 'minimal' 
                  ? 'bg-white border shadow-md hover:shadow-lg'
                  : 'bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20'
              )}>
                <div className="flex items-start gap-4">
                  <div className={cn(
                    'p-3 rounded-lg',
                    variant === 'minimal' ? 'bg-green-100' : 'bg-white/20'
                  )}>
                    <MapPin className={cn(
                      'w-6 h-6',
                      variant === 'minimal' ? 'text-green-600' : 'text-white'
                    )} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">Visit Us</h3>
                    <p className="text-sm opacity-90 mb-3">
                      Come to our facility
                    </p>
                    <address className="not-italic leading-relaxed">
                      {contactInfo.address}
                    </address>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>

          {/* Business Hours */}
          {showBusinessHours && (
            <motion.div variants={itemVariants} className="mb-8">
              <Card className={cn(
                'p-6',
                variant === 'minimal' 
                  ? 'bg-white border shadow-md'
                  : 'bg-white/10 backdrop-blur-sm border-white/20 text-white'
              )}>
                <div className="flex items-start gap-4">
                  <div className={cn(
                    'p-3 rounded-lg',
                    variant === 'minimal' ? 'bg-purple-100' : 'bg-white/20'
                  )}>
                    <Clock className={cn(
                      'w-6 h-6',
                      variant === 'minimal' ? 'text-purple-600' : 'text-white'
                    )} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-4">Business Hours</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="font-medium mb-1">Weekdays</p>
                        <p className="text-sm opacity-90">{contactInfo.businessHours.weekdays}</p>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Weekend</p>
                        <p className="text-sm opacity-90">{contactInfo.businessHours.weekends}</p>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Holidays</p>
                        <p className="text-sm opacity-90">{contactInfo.businessHours.holidays}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Quick Contact Actions */}
          {showQuickContact && (
            <motion.div 
              variants={itemVariants}
              className="text-center"
            >
              <h3 className={cn(
                'text-xl font-semibold mb-6',
                variant === 'minimal' ? 'text-gray-900' : 'text-white'
              )}>
                Quick Contact
              </h3>
              <div className="flex flex-wrap justify-center gap-4">
                {showSocialLinks && socialLinks.map((link, index) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="secondary"
                      size="lg"
                      className={cn(
                        'text-white border-none transition-all duration-300',
                        link.color,
                        variant === 'minimal' && 'text-white'
                      )}
                      onClick={() => window.open(link.url, '_blank')}
                    >
                      {link.icon}
                      <span className="ml-2">{link.name}</span>
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </Container>
    </section>
  );
};

export default ContactBanner;