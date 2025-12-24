'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheckIcon, StarIcon } from '@heroicons/react/24/solid';

export interface CertificationBadgesProps {
  className?: string;
  variant?: 'default' | 'minimal' | 'grid';
  showLabels?: boolean;
}

interface Certification {
  name: string;
  logo?: string;
  description: string;
  verified: boolean;
  important?: boolean;
}

const certifications: Certification[] = [
  {
    name: 'ISO 9001:2015',
    description: 'Quality Management System',
    verified: true,
    important: true,
  },
  {
    name: 'OEKO-TEX Standard 100',
    description: 'Textile Safety Certification',
    verified: true,
    important: true,
  },
  {
    name: 'GOTS Certified',
    description: 'Global Organic Textile Standard',
    verified: true,
  },
  {
    name: 'BCI Cotton',
    description: 'Better Cotton Initiative',
    verified: true,
  },
  {
    name: 'WRAP Certified',
    description: 'Worldwide Responsible Accredited Production',
    verified: true,
  },
  {
    name: 'GRS Certified',
    description: 'Global Recycled Standard',
    verified: true,
  },
];

const CertificationBadges: React.FC<CertificationBadgesProps> = ({
  className = '',
  variant = 'default',
  showLabels = true,
}) => {
  const badgeVariants = {
    hover: {
      scale: 1.05,
      y: -2,
      transition: { duration: 0.2 }
    }
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
      transition: { duration: 0.3 }
    }
  };

  if (variant === 'minimal') {
    return (
      <div className={`${className}`}>
        <h4 className="text-sm font-semibold text-white mb-3">
          Certifications
        </h4>
        <div className="flex flex-wrap gap-2">
          {certifications.slice(0, 3).map((cert) => (
            <div
              key={cert.name}
              className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-300 bg-green-900/30 rounded-full"
            >
              <ShieldCheckIcon className="w-3 h-3 mr-1" />
              {cert.name}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <motion.div
        className={`${className}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {showLabels && (
          <h3 className="text-lg font-semibold text-white mb-6">
            Certifications & Standards
          </h3>
        )}

        <div className="grid grid-cols-2 gap-4">
          {certifications.map((cert) => (
            <motion.div
              key={cert.name}
              variants={itemVariants}
              whileHover="hover"
              className="group relative"
            >
              <div className={`
                p-4 rounded-lg border transition-all duration-200
                ${cert.important
                  ? 'border-green-700 bg-green-900/20'
                  : 'border-gray-700 bg-gray-800'
                }
                hover:shadow-md group-hover:border-green-600
              `}>
                <div className="flex items-start space-x-3">
                  <div className={`
                    flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                    ${cert.verified
                      ? 'bg-green-800 text-green-300'
                      : 'bg-gray-700 text-gray-400'
                    }
                  `}>
                    {cert.verified ? (
                      <ShieldCheckIcon className="w-4 h-4" />
                    ) : (
                      <StarIcon className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white">
                      {cert.name}
                      {cert.important && (
                        <span className="ml-1 px-1.5 py-0.5 text-xs font-bold text-white bg-blue-600 rounded-full">
                          Key
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 font-medium">
                      {cert.description}
                    </div>
                  </div>
                </div>

                {cert.verified && (
                  <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <div className={`${className}`}>
      {showLabels && (
        <h4 className="text-sm font-semibold text-white mb-4">
          Certifications & Standards
        </h4>
      )}

      <div className="space-y-3">
        {certifications.map((cert) => (
          <motion.div
            key={cert.name}
            variants={badgeVariants}
            whileHover="hover"
            className="group"
          >
            <div className={`
              flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200
              ${cert.important
                ? 'border-green-700 bg-green-900/20'
                : 'border-gray-700 bg-gray-800'
              }
              hover:shadow-sm group-hover:border-green-600
            `}>
              <div className={`
                flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center
                ${cert.verified
                  ? 'bg-green-800 text-green-300'
                  : 'bg-gray-700 text-gray-400'
                }
              `}>
                {cert.verified ? (
                  <ShieldCheckIcon className="w-3 h-3" />
                ) : (
                  <StarIcon className="w-3 h-3" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white">
                  {cert.name}
                  {cert.important && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs font-bold text-white bg-blue-600 rounded-full">
                      Priority
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400 font-medium">
                  {cert.description}
                </div>
              </div>

              {cert.verified && (
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Trust Score */}
      <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-blue-100">
            Trust Score
          </span>
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className="w-4 h-4 text-yellow-400" />
            ))}
            <span className="text-sm font-bold text-blue-100 ml-1">
              5.0
            </span>
          </div>
        </div>
        <p className="text-xs text-blue-300 mt-1 font-medium">
          Based on industry certifications and compliance standards
        </p>
      </div>
    </div>
  );
};

export default CertificationBadges;