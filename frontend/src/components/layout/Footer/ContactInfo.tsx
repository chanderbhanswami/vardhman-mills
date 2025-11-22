'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';

export interface ContactInfoProps {
  className?: string;
  variant?: 'default' | 'compact' | 'minimal';
  showTitle?: boolean;
}

const ContactInfo: React.FC<ContactInfoProps> = ({
  className = '',
  variant = 'default',
  showTitle = true,
}) => {
  const itemVariants = {
    hover: { x: 2, transition: { duration: 0.2 } }
  };

  const contactDetails = [
    {
      icon: MapPinIcon,
      label: 'Head Office',
      value: 'Vardhman Mills Ltd., Chandigarh Road, Ludhiana - 141010, Punjab, India',
      link: 'https://maps.google.com/?q=Vardhman+Mills+Ludhiana',
    },
    {
      icon: PhoneIcon,
      label: 'Phone',
      value: '+91-161-5039000',
      link: 'tel:+91-161-5039000',
    },
    {
      icon: EnvelopeIcon,
      label: 'Email',
      value: 'info@vardhmanmills.com',
      link: 'mailto:info@vardhmanmills.com',
    },
    {
      icon: ClockIcon,
      label: 'Business Hours',
      value: 'Mon-Sat: 9:00 AM - 6:00 PM IST',
      link: null,
    },
  ];

  if (variant === 'minimal') {
    return (
      <div className={`text-center ${className}`}>
        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <div>Vardhman Mills Ltd.</div>
          <div>Ludhiana, Punjab, India</div>
          <div>+91-161-5039000</div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`${className}`}>
        {showTitle && (
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Contact Information
          </h4>
        )}
        <div className="space-y-2">
          {contactDetails.map((detail, index) => {
            const Icon = detail.icon;
            const content = (
              <div className="flex items-start space-x-2 text-sm">
                <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-xs">
                    {detail.label}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-xs">
                    {detail.value}
                  </div>
                </div>
              </div>
            );

            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover="hover"
                className="group cursor-pointer"
              >
                {detail.link ? (
                  <a
                    href={detail.link}
                    target={detail.link.startsWith('http') ? '_blank' : undefined}
                    rel={detail.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="block hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                  >
                    {content}
                  </a>
                ) : (
                  <div>{content}</div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {showTitle && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Contact Information
        </h3>
      )}
      
      <div className="space-y-4">
        {contactDetails.map((detail, index) => {
          const Icon = detail.icon;
          const content = (
            <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  {detail.label}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {detail.value}
                </div>
              </div>
            </div>
          );

          return (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover="hover"
              className="group"
            >
              {detail.link ? (
                <a
                  href={detail.link}
                  target={detail.link.startsWith('http') ? '_blank' : undefined}
                  rel={detail.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="block border border-transparent hover:border-blue-200 dark:hover:border-blue-700 rounded-lg transition-all duration-200"
                >
                  {content}
                </a>
              ) : (
                <div className="border border-transparent rounded-lg">
                  {content}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Additional Contact Methods */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Get in Touch
        </h4>
        <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
          Ready to discuss your textile needs? Our team is here to help with custom solutions.
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href="/contact"
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200"
          >
            Contact Form
          </a>
          <a
            href="/quote"
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 border border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors duration-200"
          >
            Get Quote
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;