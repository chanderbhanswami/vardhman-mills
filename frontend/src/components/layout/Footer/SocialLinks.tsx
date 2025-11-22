'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export interface SocialLinksProps {
  className?: string;
  variant?: 'default' | 'minimal' | 'vertical' | 'horizontal';
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  showFollowerCount?: boolean;
}

interface SocialPlatform {
  name: string;
  url: string;
  icon: React.ElementType;
  followers?: string;
  color: string;
  hoverColor: string;
  description?: string;
}

interface SVGIconProps {
  className?: string;
  fill?: string;
  viewBox?: string;
  [key: string]: string | undefined;
}

// SVG icons
const SVGIcons = {
  Facebook: (props: SVGIconProps) => (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  Instagram: (props: SVGIconProps) => (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.39-3.44-1.177l.663-.663c.728.663 1.662.996 2.777.996.663 0 1.297-.195 1.896-.585.6-.39 1.177-.975 1.177-1.707 0-.975-.663-1.662-1.896-2.121l-.39-.156c-.39-.156-.663-.312-.663-.624 0-.39.273-.663.663-.663.39 0 .741.156 1.053.468l.663-.663c-.468-.468-1.131-.741-1.896-.741-.663 0-1.297.195-1.896.585-.6.39-1.177.975-1.177 1.707 0 .975.663 1.662 1.896 2.121l.39.156c.39.156.663.312.663.624 0 .39-.273.663-.663.663z"/>
    </svg>
  ),
  LinkedIn: (props: SVGIconProps) => (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ),
  Twitter: (props: SVGIconProps) => (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
    </svg>
  ),
  YouTube: (props: SVGIconProps) => (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  WhatsApp: (props: SVGIconProps) => (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
    </svg>
  ),
  Telegram: (props: SVGIconProps) => (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  ),
  Pinterest: (props: SVGIconProps) => (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.346-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378 0 0-.599 2.282-.744 2.84-.282 1.073-1.045 2.417-1.548 3.235 1.158.36 2.421.552 3.731.552 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
    </svg>
  ),
};

const socialPlatforms: SocialPlatform[] = [
  {
    name: 'Facebook',
    url: 'https://facebook.com/vardhmanmills',
    icon: SVGIcons.Facebook,
    followers: '125K',
    color: 'text-blue-600',
    hoverColor: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
    description: 'Follow for latest updates'
  },
  {
    name: 'Instagram',
    url: 'https://instagram.com/vardhmanmills',
    icon: SVGIcons.Instagram,
    followers: '89K',
    color: 'text-pink-600',
    hoverColor: 'hover:bg-pink-50 dark:hover:bg-pink-900/20',
    description: 'Behind the scenes content'
  },
  {
    name: 'LinkedIn',
    url: 'https://linkedin.com/company/vardhmanmills',
    icon: SVGIcons.LinkedIn,
    followers: '45K',
    color: 'text-blue-700',
    hoverColor: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
    description: 'Professional updates'
  },
  {
    name: 'Twitter',
    url: 'https://twitter.com/vardhmanmills',
    icon: SVGIcons.Twitter,
    followers: '67K',
    color: 'text-sky-500',
    hoverColor: 'hover:bg-sky-50 dark:hover:bg-sky-900/20',
    description: 'News and announcements'
  },
  {
    name: 'YouTube',
    url: 'https://youtube.com/vardhmanmills',
    icon: SVGIcons.YouTube,
    followers: '32K',
    color: 'text-red-600',
    hoverColor: 'hover:bg-red-50 dark:hover:bg-red-900/20',
    description: 'Manufacturing process videos'
  },
  {
    name: 'WhatsApp',
    url: 'https://wa.me/911615039000',
    icon: SVGIcons.WhatsApp,
    color: 'text-green-600',
    hoverColor: 'hover:bg-green-50 dark:hover:bg-green-900/20',
    description: 'Quick support'
  },
  {
    name: 'Telegram',
    url: 'https://t.me/vardhmanmills',
    icon: SVGIcons.Telegram,
    color: 'text-blue-500',
    hoverColor: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
    description: 'Instant updates'
  },
  {
    name: 'Pinterest',
    url: 'https://pinterest.com/vardhmanmills',
    icon: SVGIcons.Pinterest,
    followers: '12K',
    color: 'text-red-500',
    hoverColor: 'hover:bg-red-50 dark:hover:bg-red-900/20',
    description: 'Design inspiration'
  },
];

const SocialLinks: React.FC<SocialLinksProps> = ({
  className = '',
  variant = 'default',
  size = 'md',
  showLabels = false,
  showFollowerCount = false,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
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
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    },
    hover: {
      scale: 1.1,
      y: -2,
      transition: { duration: 0.2 }
    }
  };

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        {socialPlatforms.slice(0, 4).map((platform) => {
          const IconComponent = platform.icon || SVGIcons[platform.name as keyof typeof SVGIcons];
          return (
            <Link
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                ${sizeClasses[size]} flex items-center justify-center rounded-full
                bg-gray-100 dark:bg-gray-800 ${platform.color} ${platform.hoverColor}
                transition-all duration-200
              `}
              aria-label={platform.name}
            >
              <IconComponent className={iconSizes[size]} />
            </Link>
          );
        })}
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <motion.div
        className={`flex flex-wrap items-center gap-4 ${className}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {socialPlatforms.map((platform) => {
          const IconComponent = platform.icon || SVGIcons[platform.name as keyof typeof SVGIcons];
          return (
            <motion.div
              key={platform.name}
              variants={itemVariants}
              whileHover="hover"
            >
              <Link
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  flex items-center space-x-2 px-3 py-2 rounded-lg
                  bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                  ${platform.hoverColor} transition-all duration-200 group
                `}
              >
                <IconComponent className={`${iconSizes[size]} ${platform.color} group-hover:scale-110 transition-transform duration-200`} />
                {showLabels && (
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {platform.name}
                  </span>
                )}
                {showFollowerCount && platform.followers && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {platform.followers}
                  </span>
                )}
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    );
  }

  if (variant === 'vertical') {
    return (
      <motion.div
        className={`space-y-3 ${className}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {socialPlatforms.map((platform) => {
          const IconComponent = platform.icon || SVGIcons[platform.name as keyof typeof SVGIcons];
          return (
            <motion.div
              key={platform.name}
              variants={itemVariants}
              whileHover="hover"
            >
              <Link
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  flex items-center space-x-3 p-3 rounded-lg
                  bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                  ${platform.hoverColor} transition-all duration-200 group
                `}
              >
                <IconComponent className={`${iconSizes[size]} ${platform.color} group-hover:scale-110 transition-transform duration-200`} />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {platform.name}
                  </div>
                  {platform.description && (
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {platform.description}
                    </div>
                  )}
                </div>
                {showFollowerCount && platform.followers && (
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {platform.followers}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      followers
                    </div>
                  </div>
                )}
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    );
  }

  return (
    <div className={`${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Follow Us
      </h3>
      
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {socialPlatforms.map((platform) => {
          const IconComponent = platform.icon || SVGIcons[platform.name as keyof typeof SVGIcons];
          return (
            <motion.div
              key={platform.name}
              variants={itemVariants}
              whileHover="hover"
            >
              <Link
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  block p-4 rounded-lg text-center
                  bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                  ${platform.hoverColor} transition-all duration-200 group
                `}
              >
                <IconComponent className={`${iconSizes.lg} ${platform.color} mx-auto mb-2 group-hover:scale-110 transition-transform duration-200`} />
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  {platform.name}
                </div>
                {showFollowerCount && platform.followers && (
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {platform.followers} followers
                  </div>
                )}
                {platform.description && (
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {platform.description}
                  </div>
                )}
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Call to Action */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Stay Connected
        </h4>
        <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
          Follow us for the latest updates, behind-the-scenes content, and textile industry insights.
        </p>
        <div className="flex space-x-2">
          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
            #VardhmanMills #TextileInnovation #SustainableFashion
          </span>
        </div>
      </div>
    </div>
  );
};

export default SocialLinks;