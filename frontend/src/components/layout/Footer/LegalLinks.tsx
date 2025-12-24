'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export interface LegalLinksProps {
  className?: string;
  variant?: 'horizontal' | 'vertical';
  showIcons?: boolean;
}

interface LegalLink {
  label: string;
  href: string;
  isImportant?: boolean;
}

const legalLinks: LegalLink[] = [
  { label: 'Privacy Policy', href: '/privacy', isImportant: true },
  { label: 'Terms of Service', href: '/terms', isImportant: true },
  { label: 'Cookie Policy', href: '/cookies' },
  { label: 'Return Policy', href: '/returns' },
  { label: 'Shipping Policy', href: '/shipping' },
  { label: 'Refund Policy', href: '/refunds' },
  { label: 'Compliance', href: '/compliance' },
  { label: 'GDPR', href: '/gdpr' },
];

const LegalLinks: React.FC<LegalLinksProps> = ({
  className = '',
  variant = 'horizontal',
  showIcons = false,
}) => {
  const linkVariants = {
    hover: {
      y: -1,
      transition: { duration: 0.2 }
    }
  };

  if (variant === 'vertical') {
    return (
      <div className={`space-y-2 ${className}`}>
        {legalLinks.map((link) => (
          <motion.div
            key={link.href}
            variants={linkVariants}
            whileHover="hover"
          >
            <Link
              href={link.href}
              className={`
                block text-sm transition-colors duration-200
                ${link.isImportant
                  ? 'text-white font-bold hover:text-blue-400'
                  : 'text-gray-400 hover:text-white font-medium'
                }
              `}
            >
              {showIcons && link.isImportant && (
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              )}
              {link.label}
            </Link>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-x-6 gap-y-2 ${className}`}>
      {legalLinks.map((link, index) => (
        <motion.div
          key={link.href}
          variants={linkVariants}
          whileHover="hover"
          className="relative"
        >
          <Link
            href={link.href}
            className={`
              text-sm transition-colors duration-200
              ${link.isImportant
                ? 'text-white font-bold hover:text-blue-400'
                : 'text-gray-400 hover:text-white font-medium'
              }
            `}
          >
            {link.label}
            {link.isImportant && (
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            )}
          </Link>

          {/* Separator */}
          {index < legalLinks.length - 1 && variant === 'horizontal' && (
            <span className="absolute -right-3 top-1/2 transform -translate-y-1/2 text-gray-600">
              •
            </span>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default LegalLinks;