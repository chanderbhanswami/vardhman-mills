'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export interface CustomerServiceProps {
  className?: string;
  title?: string;
  variant?: 'default' | 'minimal';
}

interface ServiceLink {
  label: string;
  href: string;
  icon: React.ElementType;
  description?: string;
  isActive?: boolean;
}

const serviceLinks: ServiceLink[] = [
  {
    label: 'Support Center',
    href: '/support',
    icon: QuestionMarkCircleIcon,
    description: '24/7 assistance',
    isActive: true,
  },
  {
    label: 'Live Chat',
    href: '/chat',
    icon: ChatBubbleLeftRightIcon,
    description: 'Instant help',
  },
  {
    label: 'Call Us',
    href: 'tel:+91-161-5039000',
    icon: PhoneIcon,
    description: '+91-161-5039000',
  },
  {
    label: 'Email Support',
    href: 'mailto:support@vardhmanmills.com',
    icon: EnvelopeIcon,
    description: 'Get detailed help',
  },
  {
    label: 'Documentation',
    href: '/docs',
    icon: DocumentTextIcon,
    description: 'Product guides',
  },
  {
    label: 'Quality Assurance',
    href: '/quality',
    icon: ShieldCheckIcon,
    description: 'Our guarantee',
  },
];

const CustomerService: React.FC<CustomerServiceProps> = ({
  className = '',
  title = 'Customer Service',
  variant = 'default',
}) => {
  const linkVariants = {
    hover: { 
      x: 4,
      transition: { type: 'tween' as const, duration: 0.2 }
    }
  };

  if (variant === 'minimal') {
    return (
      <div className={`${className}`}>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          {title}
        </h3>
        <div className="space-y-2">
          {serviceLinks.slice(0, 4).map((service) => {
            const Icon = service.icon;
            return (
              <Link
                key={service.href}
                href={service.href}
                className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
              >
                <Icon className="w-4 h-4 mr-2" />
                {service.label}
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        {title}
      </h3>
      
      <div className="space-y-4">
        {serviceLinks.map((service) => {
          const Icon = service.icon;
          return (
            <motion.div
              key={service.href}
              variants={linkVariants}
              whileHover="hover"
              className="group"
            >
              <Link
                href={service.href}
                className={`
                  flex items-start space-x-3 p-3 rounded-lg transition-all duration-200
                  ${service.isActive 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'
                  }
                `}
              >
                <div className={`
                  flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                  ${service.isActive 
                    ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-800 group-hover:text-blue-600 dark:group-hover:text-blue-300'
                  }
                  transition-all duration-200
                `}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className={`
                    text-sm font-medium transition-colors duration-200
                    ${service.isActive 
                      ? 'text-blue-900 dark:text-blue-100' 
                      : 'text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'
                    }
                  `}>
                    {service.label}
                    {service.isActive && (
                      <span className="ml-2 px-1.5 py-0.5 text-xs font-bold text-white bg-green-500 rounded-full">
                        Available
                      </span>
                    )}
                  </div>
                  {service.description && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {service.description}
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Service Hours */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Service Hours
        </h4>
        <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex justify-between">
            <span>Customer Support:</span>
            <span className="text-green-600 dark:text-green-400 font-medium">24/7 Available</span>
          </div>
          <div className="flex justify-between">
            <span>Phone Support:</span>
            <span>Mon-Sat: 9AM-6PM IST</span>
          </div>
          <div className="flex justify-between">
            <span>Live Chat:</span>
            <span className="text-green-600 dark:text-green-400 font-medium">Always Online</span>
          </div>
          <div className="flex justify-between">
            <span>Email Response:</span>
            <span>Within 2 hours</span>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div className="flex items-center">
          <PhoneIcon className="w-4 h-4 text-red-600 dark:text-red-400 mr-2" />
          <span className="text-sm font-medium text-red-900 dark:text-red-100">
            Emergency: +91-161-5039001
          </span>
        </div>
        <p className="text-xs text-red-700 dark:text-red-300 mt-1">
          For urgent production or delivery issues
        </p>
      </div>
    </div>
  );
};

export default CustomerService;