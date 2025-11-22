'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ClockIcon, 
  DocumentTextIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { LegalCardProps } from './index';
import { formatDate } from './index';

const LegalCard: React.FC<LegalCardProps> = ({
  title,
  description,
  lastUpdated,
  version,
  href,
  icon: Icon,
  category,
  className = ''
}) => {
  // Category-specific styling and icons
  const getCategoryConfig = () => {
    switch (category) {
      case 'policy':
        return {
          bgGradient: 'from-blue-50 to-indigo-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          badgeColor: 'bg-blue-100 text-blue-700',
          defaultIcon: ShieldCheckIcon
        };
      case 'terms':
        return {
          bgGradient: 'from-amber-50 to-orange-50',
          borderColor: 'border-amber-200',
          iconColor: 'text-amber-600',
          badgeColor: 'bg-amber-100 text-amber-700',
          defaultIcon: ExclamationTriangleIcon
        };
      case 'agreement':
        return {
          bgGradient: 'from-green-50 to-emerald-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          badgeColor: 'bg-green-100 text-green-700',
          defaultIcon: CheckCircleIcon
        };
      default:
        return {
          bgGradient: 'from-gray-50 to-slate-50',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600',
          badgeColor: 'bg-gray-100 text-gray-700',
          defaultIcon: DocumentTextIcon
        };
    }
  };

  const config = getCategoryConfig();
  const IconComponent = Icon || config.defaultIcon;

  // Using inline animations instead of variants to avoid TypeScript type conflicts

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className={`group ${className}`}
    >
      <Link href={href} className="block">
        <div className={`
          relative overflow-hidden rounded-xl border-2 ${config.borderColor}
          bg-gradient-to-br ${config.bgGradient}
          p-6 shadow-sm transition-all duration-300
          hover:shadow-lg hover:shadow-black/5
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        `}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent" />
            <svg className="absolute bottom-0 right-0 h-32 w-32" viewBox="0 0 100 100">
              <defs>
                <pattern id={`pattern-${category}`} patternUnits="userSpaceOnUse" width="10" height="10">
                  <circle cx="5" cy="5" r="1" fill="currentColor" fillOpacity="0.1" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill={`url(#pattern-${category})`} />
            </svg>
          </div>

          {/* Content */}
          <div className="relative">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <motion.div 
                initial={{ scale: 1, rotate: 0 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
                className={`p-3 rounded-lg bg-white/60 backdrop-blur-sm ${config.iconColor}`}
              >
                <IconComponent className="h-6 w-6" />
              </motion.div>

              {/* Category Badge */}
              <span className={`
                px-2 py-1 text-xs font-medium rounded-full
                ${config.badgeColor} capitalize
              `}>
                {category}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              {title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
              {description}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-white/50">
              {/* Last Updated */}
              <div className="flex items-center text-xs text-gray-500">
                <ClockIcon className="h-4 w-4 mr-1" />
                <span>Updated {formatDate(lastUpdated)}</span>
              </div>

              {/* Version */}
              <span className="text-xs font-medium text-gray-600 bg-white/60 px-2 py-1 rounded">
                v{version}
              </span>
            </div>

            {/* Hover Arrow */}
            <motion.div 
              className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity"
              initial={{ x: -10, opacity: 0 }}
              whileHover={{ x: 0, opacity: 1 }}
            >
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.div>
          </div>

          {/* Shine Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-700" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default LegalCard;
