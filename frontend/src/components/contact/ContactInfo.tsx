'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Globe, 
  MessageCircle, 
  ExternalLink,
  Copy,
  Check,
  Users,
  Award,
  Shield,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface ContactInfoProps {
  className?: string;
  variant?: 'default' | 'compact' | 'detailed' | 'cards';
  showSocialLinks?: boolean;
  showBusinessHours?: boolean;
  showTeamInfo?: boolean;
  showCertifications?: boolean;
  showEmergencyContact?: boolean;
}

interface ContactDetail {
  id: string;
  type: 'phone' | 'email' | 'address' | 'website' | 'social';
  label: string;
  value: string;
  href?: string;
  icon: React.ReactNode;
  description?: string;
  availability?: string;
  isPrimary?: boolean;
}

interface BusinessHour {
  day: string;
  hours: string;
  isToday?: boolean;
  isOpen?: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone?: string;
  avatar?: string;
  availability: 'available' | 'busy' | 'away';
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
  icon: React.ReactNode;
  description: string;
}

const contactDetails: ContactDetail[] = [
  {
    id: 'phone-primary',
    type: 'phone',
    label: 'Primary Phone',
    value: '+91 98765 43210',
    href: 'tel:+919876543210',
    icon: <Phone className="w-5 h-5" />,
    description: 'Main customer service line',
    availability: '24/7 Support Available',
    isPrimary: true
  },
  {
    id: 'phone-sales',
    type: 'phone',
    label: 'Sales Department',
    value: '+91 98765 43211',
    href: 'tel:+919876543211',
    icon: <Phone className="w-5 h-5" />,
    description: 'For sales inquiries and quotes',
    availability: 'Mon-Fri 9AM-6PM'
  },
  {
    id: 'email-primary',
    type: 'email',
    label: 'General Inquiries',
    value: 'contact@vardhmanmills.com',
    href: 'mailto:contact@vardhmanmills.com',
    icon: <Mail className="w-5 h-5" />,
    description: 'For general questions and support',
    isPrimary: true
  },
  {
    id: 'email-sales',
    type: 'email',
    label: 'Sales Team',
    value: 'sales@vardhmanmills.com',
    href: 'mailto:sales@vardhmanmills.com',
    icon: <Mail className="w-5 h-5" />,
    description: 'For sales and partnership inquiries'
  },
  {
    id: 'address',
    type: 'address',
    label: 'Head Office',
    value: 'Vardhman Mills, Industrial Area, Sector 12, New Delhi, India 110025',
    href: 'https://maps.google.com/?q=Vardhman+Mills+Industrial+Area+New+Delhi',
    icon: <MapPin className="w-5 h-5" />,
    description: 'Our main manufacturing and office facility',
    isPrimary: true
  },
  {
    id: 'website',
    type: 'website',
    label: 'Website',
    value: 'www.vardhmanmills.com',
    href: 'https://www.vardhmanmills.com',
    icon: <Globe className="w-5 h-5" />,
    description: 'Visit our official website'
  },
  {
    id: 'whatsapp',
    type: 'social',
    label: 'WhatsApp',
    value: '+91 98765 43210',
    href: 'https://wa.me/919876543210',
    icon: <MessageCircle className="w-5 h-5" />,
    description: 'Quick support via WhatsApp',
    availability: 'Instant Response'
  }
];

const businessHours: BusinessHour[] = [
  { day: 'Monday', hours: '9:00 AM - 6:00 PM', isOpen: true },
  { day: 'Tuesday', hours: '9:00 AM - 6:00 PM', isOpen: true },
  { day: 'Wednesday', hours: '9:00 AM - 6:00 PM', isOpen: true },
  { day: 'Thursday', hours: '9:00 AM - 6:00 PM', isOpen: true },
  { day: 'Friday', hours: '9:00 AM - 6:00 PM', isOpen: true },
  { day: 'Saturday', hours: '10:00 AM - 4:00 PM', isOpen: true },
  { day: 'Sunday', hours: 'Closed', isOpen: false }
];

const teamMembers: TeamMember[] = [
  {
    id: 'john-doe',
    name: 'John Doe',
    position: 'Sales Manager',
    department: 'Sales',
    email: 'john.doe@vardhmanmills.com',
    phone: '+91 98765 43212',
    availability: 'available'
  },
  {
    id: 'jane-smith',
    name: 'Jane Smith',
    position: 'Customer Support Lead',
    department: 'Support',
    email: 'jane.smith@vardhmanmills.com',
    phone: '+91 98765 43213',
    availability: 'available'
  },
  {
    id: 'mike-wilson',
    name: 'Mike Wilson',
    position: 'Technical Specialist',
    department: 'Technical',
    email: 'mike.wilson@vardhmanmills.com',
    availability: 'busy'
  }
];

const certifications: Certification[] = [
  {
    id: 'iso-9001',
    name: 'ISO 9001:2015',
    issuer: 'International Organization for Standardization',
    year: '2023',
    icon: <Award className="w-5 h-5" />,
    description: 'Quality Management Systems'
  },
  {
    id: 'iso-14001',
    name: 'ISO 14001:2015',
    issuer: 'International Organization for Standardization',
    year: '2023',
    icon: <Shield className="w-5 h-5" />,
    description: 'Environmental Management Systems'
  },
  {
    id: 'oeko-tex',
    name: 'OEKO-TEX Standard 100',
    issuer: 'OEKO-TEX Association',
    year: '2024',
    icon: <Zap className="w-5 h-5" />,
    description: 'Textile Safety Certification'
  }
];

const ContactInfo: React.FC<ContactInfoProps> = ({
  className,
  variant = 'default',
  showBusinessHours = true,
  showTeamInfo = false,
  showCertifications = false,
  showEmergencyContact = true
}) => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const handleCopy = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(id);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy to clipboard');
    }
  }, []);

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'away':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  const isCurrentlyOpen = () => {
    const currentDay = getCurrentDay();
    const todaysHours = businessHours.find(h => h.day === currentDay);
    return todaysHours?.isOpen || false;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
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

  if (variant === 'compact') {
    return (
      <div className={cn('space-y-4', className)}>
        {contactDetails.filter(detail => detail.isPrimary).map((detail) => (
          <motion.div
            key={detail.id}
            variants={itemVariants}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="text-primary-600">{detail.icon}</div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{detail.label}</p>
              <a 
                href={detail.href}
                className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
              >
                {detail.value}
              </a>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleCopy(detail.value, detail.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {copiedItem === detail.id ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </motion.div>
        ))}
      </div>
    );
  }

  if (variant === 'cards') {
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}
      >
        {contactDetails.map((detail) => (
          <motion.div key={detail.id} variants={itemVariants}>
            <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-100 rounded-lg text-primary-600 group-hover:bg-primary-200 transition-colors">
                  {detail.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{detail.label}</h3>
                  <a 
                    href={detail.href}
                    className="text-primary-600 hover:text-primary-700 font-medium break-all"
                    target={detail.type === 'website' || detail.type === 'social' ? '_blank' : undefined}
                    rel={detail.type === 'website' || detail.type === 'social' ? 'noopener noreferrer' : undefined}
                  >
                    {detail.value}
                  </a>
                  {detail.description && (
                    <p className="text-sm text-gray-600 mt-2">{detail.description}</p>
                  )}
                  {detail.availability && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {detail.availability}
                    </Badge>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(detail.value, detail.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {copiedItem === detail.id ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn('space-y-8', className)}
    >
      {/* Main Contact Information */}
      <motion.div variants={itemVariants}>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Phone className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
              <p className="text-gray-600">Get in touch with our team</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {contactDetails.map((detail) => (
              <motion.div 
                key={detail.id}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-primary-600 mt-1">{detail.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">{detail.label}</h3>
                    {detail.isPrimary && (
                      <Badge variant="default" className="text-xs px-2 py-0.5">
                        Primary
                      </Badge>
                    )}
                  </div>
                  <a 
                    href={detail.href}
                    className="text-primary-600 hover:text-primary-700 font-medium break-all text-sm"
                    target={detail.type === 'website' || detail.type === 'social' ? '_blank' : undefined}
                    rel={detail.type === 'website' || detail.type === 'social' ? 'noopener noreferrer' : undefined}
                  >
                    {detail.value}
                    {(detail.type === 'website' || detail.type === 'social') && (
                      <ExternalLink className="w-3 h-3 inline ml-1" />
                    )}
                  </a>
                  {detail.description && (
                    <p className="text-xs text-gray-600 mt-1">{detail.description}</p>
                  )}
                  {detail.availability && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {detail.availability}
                    </Badge>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(detail.value, detail.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {copiedItem === detail.id ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Business Hours */}
      {showBusinessHours && (
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Business Hours</h2>
                  <p className="text-gray-600">When we are available</p>
                </div>
              </div>
              <Badge 
                variant={isCurrentlyOpen() ? 'success' : 'secondary'}
                className="flex items-center gap-2"
              >
                <div 
                  className={cn(
                    'w-2 h-2 rounded-full',
                    isCurrentlyOpen() ? 'bg-green-500' : 'bg-gray-400'
                  )}
                />
                {isCurrentlyOpen() ? 'Open Now' : 'Closed'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {businessHours.map((hour, index) => {
                const isToday = hour.day === getCurrentDay();
                return (
                  <div 
                    key={index}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg transition-colors',
                      isToday 
                        ? 'bg-primary-50 border border-primary-200' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    )}
                  >
                    <span className={cn(
                      'font-medium',
                      isToday ? 'text-primary-900' : 'text-gray-900'
                    )}>
                      {hour.day}
                      {isToday && <span className="text-xs ml-2">(Today)</span>}
                    </span>
                    <span className={cn(
                      'text-sm',
                      hour.isOpen 
                        ? (isToday ? 'text-primary-600 font-medium' : 'text-gray-600')
                        : 'text-red-600'
                    )}>
                      {hour.hours}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Team Information */}
      {showTeamInfo && (
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Our Team</h2>
                <p className="text-gray-600">Meet our dedicated professionals</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member) => (
                <div key={member.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar 
                        src={member.avatar}
                        alt={member.name}
                        className="w-12 h-12"
                      />
                      <div 
                        className={cn(
                          'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white',
                          getAvailabilityColor(member.availability)
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-600">{member.position}</p>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {member.department}
                      </Badge>
                      <div className="mt-2 space-y-1">
                        <a 
                          href={`mailto:${member.email}`}
                          className="block text-xs text-primary-600 hover:text-primary-700"
                        >
                          {member.email}
                        </a>
                        {member.phone && (
                          <a 
                            href={`tel:${member.phone.replace(/\s/g, '')}`}
                            className="block text-xs text-primary-600 hover:text-primary-700"
                          >
                            {member.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Certifications */}
      {showCertifications && (
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Certifications & Standards</h2>
                <p className="text-gray-600">Our commitment to quality and safety</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certifications.map((cert) => (
                <div key={cert.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="text-yellow-600 mt-1">{cert.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{cert.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{cert.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{cert.issuer}</span>
                        <Badge variant="secondary" className="text-xs">
                          {cert.year}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Emergency Contact */}
      {showEmergencyContact && (
        <motion.div variants={itemVariants}>
          <Card className="p-6 bg-red-50 border-red-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <Phone className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-red-900">Emergency Contact</h2>
                <p className="text-red-700">For urgent matters outside business hours</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-red-900">Emergency Hotline</p>
                <a 
                  href="tel:+919876543211"
                  className="text-red-600 hover:text-red-700 font-semibold text-lg"
                >
                  +91 98765 43211
                </a>
                <p className="text-sm text-red-700 mt-1">Available 24/7 for critical issues</p>
              </div>
              <Button
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-100"
                onClick={() => window.open('tel:+919876543211')}
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Now
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ContactInfo;