'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardIcon,
  EnvelopeIcon,
  PrinterIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

export interface SharePlatform {
  name: string;
  url: string;
  icon?: React.ReactNode;
  color?: string;
  backgroundColor?: string;
}

export interface ShareButtonsProps {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  hashtags?: string[];
  via?: string;
  className?: string;
  variant?: 'icons' | 'buttons' | 'floating' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  shape?: 'square' | 'rounded' | 'circle';
  showLabels?: boolean;
  showCounts?: boolean;
  platforms?: string[];
  customPlatforms?: SharePlatform[];
  onShare?: (platform: string, url: string) => void;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({
  url,
  title = '',
  description = '',
  hashtags = [],
  via = '',
  className = '',
  variant = 'icons',
  size = 'md',
  shape = 'rounded',
  showLabels = false,
  showCounts = false,
  platforms = ['facebook', 'twitter', 'linkedin', 'whatsapp', 'email', 'copy'],
  customPlatforms = [],
  onShare,
}) => {
  const [copied, setCopied] = useState(false);
  const [counts] = useState<Record<string, number>>({});

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const hashtagString = hashtags.map(tag => tag.replace('#', '')).join(',');

  const defaultPlatforms: Record<string, SharePlatform> = {
    facebook: {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
      color: '#1877f2',
      backgroundColor: '#1877f2',
      icon: (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    twitter: {
      name: 'Twitter',
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}${via ? `&via=${via}` : ''}${hashtagString ? `&hashtags=${hashtagString}` : ''}`,
      color: '#1da1f2',
      backgroundColor: '#1da1f2',
      icon: (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
      ),
    },
    linkedin: {
      name: 'LinkedIn',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
      color: '#0077b5',
      backgroundColor: '#0077b5',
      icon: (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
    whatsapp: {
      name: 'WhatsApp',
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: '#25d366',
      backgroundColor: '#25d366',
      icon: (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.89 3.488" />
        </svg>
      ),
    },
    reddit: {
      name: 'Reddit',
      url: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      color: '#ff4500',
      backgroundColor: '#ff4500',
      icon: (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
        </svg>
      ),
    },
    telegram: {
      name: 'Telegram',
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      color: '#0088cc',
      backgroundColor: '#0088cc',
      icon: (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      ),
    },
    email: {
      name: 'Email',
      url: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
      color: '#34495e',
      backgroundColor: '#34495e',
      icon: <EnvelopeIcon />,
    },
    copy: {
      name: 'Copy Link',
      url: url,
      color: '#6b7280',
      backgroundColor: '#6b7280',
      icon: copied ? <CheckIcon /> : <ClipboardIcon />,
    },
    print: {
      name: 'Print',
      url: 'print',
      color: '#4b5563',
      backgroundColor: '#4b5563',
      icon: <PrinterIcon />,
    },
  };

  const handleShare = async (platform: string, shareUrl: string) => {
    onShare?.(platform, shareUrl);

    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
      return;
    }

    if (platform === 'print') {
      window.print();
      return;
    }

    // Open share URL in new window
    const width = 550;
    const height = 450;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    window.open(
      shareUrl,
      'share',
      `width=${width},height=${height},left=${left},top=${top},toolbar=0,menubar=0,location=0,status=0,scrollbars=1,resizable=1`
    );
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };

  const shapeClasses = {
    square: 'rounded-none',
    rounded: 'rounded-lg',
    circle: 'rounded-full',
  };

  const variantStyles = {
    icons: 'inline-flex',
    buttons: 'inline-flex',
    floating: 'fixed right-4 top-1/2 transform -translate-y-1/2 flex-col',
    minimal: 'inline-flex',
  };

  const allPlatforms = [...platforms.map(p => defaultPlatforms[p]).filter(Boolean), ...customPlatforms];

  const renderButton = (platform: SharePlatform, index: number) => {
    const isActive = platform.name === 'Copy Link' && copied;
    
    return (
      <motion.button
        key={`${platform.name}-${index}`}
        onClick={() => handleShare(platform.name.toLowerCase().replace(' ', ''), platform.url)}
        className={`
          ${sizeClasses[size]} ${shapeClasses[shape]}
          ${variant === 'minimal' ? 'text-gray-600 hover:text-gray-800' : 'text-white'}
          ${variant === 'buttons' ? 'px-4 py-2 w-auto h-auto' : ''}
          transition-all duration-200 flex items-center justify-center gap-2
          ${variant !== 'minimal' ? 'shadow-lg hover:shadow-xl' : 'hover:bg-gray-100'}
          ${className}
        `}
        style={{
          backgroundColor: variant === 'minimal' ? 'transparent' : platform.backgroundColor,
          color: variant === 'minimal' ? platform.color : 'white',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          backgroundColor: isActive ? '#10b981' : platform.backgroundColor,
        }}
        title={platform.name}
        aria-label={`Share on ${platform.name}`}
      >
        <span className={variant === 'buttons' && !showLabels ? sizeClasses[size].split(' ')[0] : 'w-5 h-5'}>
          {platform.icon}
        </span>
        {(showLabels || variant === 'buttons') && (
          <span className={variant === 'buttons' ? '' : 'sr-only'}>
            {platform.name}
          </span>
        )}
        {showCounts && counts[platform.name] && (
          <span className="text-xs opacity-75">
            {counts[platform.name]}
          </span>
        )}
      </motion.button>
    );
  };

  if (variant === 'floating') {
    return (
      <div className={`${variantStyles[variant]} space-y-2 z-50`}>
        <AnimatePresence>
          {allPlatforms.map((platform, index) => (
            <motion.div
              key={`${platform.name}-${index}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
            >
              {renderButton(platform, index)}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={`${variantStyles[variant]} gap-2 ${className}`}>
      {allPlatforms.map((platform, index) => renderButton(platform, index))}
    </div>
  );
};

export default ShareButtons;