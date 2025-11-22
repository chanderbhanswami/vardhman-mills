'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Share, Copy, Check, Mail, MessageCircle, Facebook, Twitter, Linkedin, QrCode, Download, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Tooltip } from '@/components/ui/Tooltip';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

// Types
export interface SharePlatform {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  url: string;
  requiresText?: boolean;
}

export interface ShareData {
  url: string;
  title: string;
  description?: string;
  image?: string;
  hashtags?: string[];
  via?: string;
}

export interface BlogShareProps {
  postId: string;
  shareData: ShareData;
  className?: string;
  variant?: 'default' | 'compact' | 'floating' | 'detailed' | 'minimal' | 'dropdown';
  showLabels?: boolean;
  showCounts?: boolean;
  showCopyLink?: boolean;
  showQRCode?: boolean;
  showEmail?: boolean;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  onShare?: (platform: string, shareData: ShareData) => void;
  onCopyLink?: (url: string) => void;
  customPlatforms?: SharePlatform[];
  trackShares?: boolean;
  enableAnalytics?: boolean;
}

export const BlogShare: React.FC<BlogShareProps> = ({
  postId,
  shareData,
  className,
  variant = 'default',
  showLabels = true,
  showCounts = false,
  showCopyLink = true,
  showQRCode = false,
  showEmail = true,
  animated = true,
  size = 'md',
  orientation = 'horizontal',
  onShare,
  onCopyLink,
  customPlatforms,
  trackShares = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [shareCount, setShareCount] = useState<{ [key: string]: number }>({});
  const [isAnimating, setIsAnimating] = useState<{ [key: string]: boolean }>({});
  const [showQR, setShowQR] = useState(false);
  const [customText, setCustomText] = useState('');
  const [showCustomText, setShowCustomText] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Default platforms
  const defaultPlatforms: SharePlatform[] = [
    {
      id: 'twitter',
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-blue-400 hover:bg-blue-500',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.title)}${shareData.hashtags ? `&hashtags=${shareData.hashtags.join(',')}` : ''}${shareData.via ? `&via=${shareData.via}` : ''}`,
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`,
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-700 hover:bg-blue-800',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`,
    },
    {
      id: 'email',
      name: 'Email',
      icon: Mail,
      color: 'bg-gray-600 hover:bg-gray-700',
      url: `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(`${shareData.description || ''}\n\n${shareData.url}`)}`,
    },
    {
      id: 'sms',
      name: 'SMS',
      icon: MessageCircle,
      color: 'bg-green-600 hover:bg-green-700',
      url: `sms:?body=${encodeURIComponent(`${shareData.title}\n${shareData.url}`)}`,
    }
  ];

  const platforms = customPlatforms || defaultPlatforms.filter(platform => 
    showEmail ? true : platform.id !== 'email'
  );

  // Handle share click
  const handleShare = async (platform: SharePlatform) => {
    if (animated) {
      setIsAnimating(prev => ({ ...prev, [platform.id]: true }));
      setTimeout(() => {
        setIsAnimating(prev => ({ ...prev, [platform.id]: false }));
      }, 300);
    }

    // Track share if enabled
    if (trackShares) {
      setShareCount(prev => ({
        ...prev,
        [platform.id]: (prev[platform.id] || 0) + 1
      }));
    }

    // Use Web Share API if available
    if ('share' in navigator && platform.id === 'native') {
      try {
        await navigator.share({
          title: shareData.title,
          text: shareData.description,
          url: shareData.url
        });
        onShare?.(platform.id, shareData);
        return;
      } catch (error) {
        console.warn('Web Share API failed:', error);
      }
    }

    // Open share URL
    if (platform.url) {
      const finalUrl = showCustomText && customText 
        ? platform.url.replace(encodeURIComponent(shareData.title), encodeURIComponent(customText))
        : platform.url;
      
      window.open(finalUrl, '_blank', 'width=600,height=400');
      onShare?.(platform.id, shareData);
      
      toast.success(`Shared to ${platform.name}!`, {
        icon: React.createElement(platform.icon, { className: 'w-4 h-4' }),
        duration: 2000
      });
    }
  };

  // Handle copy link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareData.url);
      setCopiedLink(true);
      onCopyLink?.(shareData.url);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2000);
      } catch {
        toast.error('Failed to copy link');
      }
  };

  // Generate QR code URL
  const generateQRCode = () => {
    const qrData = encodeURIComponent(shareData.url);
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`;
  };

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          button: 'h-8 w-8 text-xs',
          icon: 'w-3 h-3',
          padding: 'p-1'
        };
      case 'lg':
        return {
          button: 'h-12 w-12 text-base',
          icon: 'w-6 h-6',
          padding: 'p-3'
        };
      default:
        return {
          button: 'h-10 w-10 text-sm',
          icon: 'w-4 h-4',
          padding: 'p-2'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  // Share button component
  const ShareButton = ({ platform }: { platform: SharePlatform }) => {
    const Icon = platform.icon;
    const count = shareCount[platform.id] || 0;

    return (
      <Tooltip content={`Share to ${platform.name}`}>
        <Button
          variant="outline"
          size={size}
          onClick={() => handleShare(platform)}
          className={cn(
            sizeClasses.button,
            'relative overflow-hidden transition-all duration-200',
            platform.color,
            'text-white border-0',
            'hover:scale-105'
          )}
        >
          <motion.div
            className="flex items-center justify-center"
            animate={isAnimating[platform.id] ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Icon className={sizeClasses.icon} />
          </motion.div>

          {/* Share count badge */}
          {showCounts && count > 0 && (
            <Badge 
              variant="outline"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs bg-red-500 text-white border-red-500"
            >
              {count > 99 ? '99+' : count}
            </Badge>
          )}

          {/* Animation overlay */}
          <AnimatePresence>
            {isAnimating[platform.id] && (
              <motion.div
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 rounded-full bg-white/20"
              />
            )}
          </AnimatePresence>
        </Button>
      </Tooltip>
    );
  };

  // Copy link button
  const CopyLinkButton = () => showCopyLink ? (
    <Tooltip content={copiedLink ? 'Copied!' : 'Copy link'}>
      <Button
        variant="outline"
        size={size}
        onClick={handleCopyLink}
        className={cn(
          sizeClasses.button,
          'bg-gray-600 hover:bg-gray-700 text-white border-0'
        )}
      >
        {copiedLink ? (
          <Check className={cn(sizeClasses.icon, 'text-green-400')} />
        ) : (
          <Copy className={sizeClasses.icon} />
        )}
      </Button>
    </Tooltip>
  ) : null;

  // QR Code modal
  const QRCodeModal = () => showQR ? (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={() => setShowQR(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Scan QR Code
          </h3>
          <div className="flex justify-center">
            <Image
              src={generateQRCode()}
              alt="QR Code"
              width={192}
              height={192}
              className="border rounded-lg"
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Scan with your phone to share this post
          </p>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                const link = document.createElement('a');
                link.href = generateQRCode();
                link.download = `qr-code-${postId}.png`;
                link.click();
              }}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" onClick={() => setShowQR(false)} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  ) : null;

  // Custom text input
  const CustomTextInput = () => showCustomText ? (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-2"
    >
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Custom message:
      </label>
      <Input
        value={customText}
        onChange={(e) => setCustomText(e.target.value)}
        placeholder={shareData.title}
        className="text-sm"
      />
    </motion.div>
  ) : null;

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center space-x-1', className)} ref={containerRef}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="h-8 px-2"
        >
          <Share className="w-4 h-4 mr-1" />
          Share
        </Button>
        {showCopyLink && <CopyLinkButton />}
      </div>
    );
  }

  // Minimal variant
  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center', className)} ref={containerRef}>
        <Button
          variant="ghost"
          size={size}
          onClick={() => setIsOpen(!isOpen)}
          className={sizeClasses.button}
        >
          <Share className={sizeClasses.icon} />
        </Button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center space-x-1 ml-2"
            >
              {platforms.slice(0, 3).map((platform) => (
                <ShareButton key={platform.id} platform={platform} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Floating variant
  if (variant === 'floating') {
    return (
      <>
        <motion.div
          ref={containerRef}
          className={cn(
            'fixed left-4 top-1/2 transform -translate-y-1/2 z-40',
            'bg-white dark:bg-gray-800 rounded-full shadow-lg border',
            'p-2 space-y-2',
            className
          )}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            variant="ghost"
            size={size}
            onClick={() => setIsOpen(!isOpen)}
            className={cn(sizeClasses.button, 'rounded-full')}
          >
            <Share className={sizeClasses.icon} />
          </Button>
          
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                {platforms.map((platform) => (
                  <ShareButton key={platform.id} platform={platform} />
                ))}
                <CopyLinkButton />
                {showQRCode && (
                  <Button
                    variant="outline"
                    size={size}
                    onClick={() => setShowQR(true)}
                    className={cn(sizeClasses.button, 'bg-purple-600 hover:bg-purple-700 text-white border-0')}
                  >
                    <QrCode className={sizeClasses.icon} />
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        <AnimatePresence>
          <QRCodeModal />
        </AnimatePresence>
      </>
    );
  }

  // Dropdown variant
  if (variant === 'dropdown') {
    return (
      <div className={cn('relative', className)} ref={dropdownRef}>
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2"
        >
          <Share className="w-4 h-4" />
          {showLabels && <span>Share</span>}
        </Button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-2 right-0 z-50 min-w-64"
            >
              <Card className="p-4 space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    Share this post
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCustomText(!showCustomText)}
                    className="h-6 w-6 p-0"
                  >
                    {showCustomText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>

                <AnimatePresence>
                  <CustomTextInput />
                </AnimatePresence>

                <div className="grid grid-cols-3 gap-2">
                  {platforms.map((platform) => (
                    <div key={platform.id} className="text-center">
                      <ShareButton platform={platform} />
                      {showLabels && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {platform.name}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {showCopyLink && (
                  <div className="border-t pt-3">
                    <div className="flex space-x-2">
                      <Input
                        value={shareData.url}
                        readOnly
                        className="text-sm"
                      />
                      <Button
                        variant="outline"
                        onClick={handleCopyLink}
                        className="px-3"
                      >
                        {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                {showQRCode && (
                  <Button
                    variant="outline"
                    onClick={() => setShowQR(true)}
                    className="w-full"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Show QR Code
                  </Button>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          <QRCodeModal />
        </AnimatePresence>
      </div>
    );
  }

  // Detailed variant
  if (variant === 'detailed') {
    return (
      <div className={cn('space-y-4', className)} ref={containerRef}>
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            Share this post
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCustomText(!showCustomText)}
          >
            <Eye className="w-4 h-4 mr-1" />
            Customize
          </Button>
        </div>

        <AnimatePresence>
          <CustomTextInput />
        </AnimatePresence>

        <div className={cn(
          'grid gap-3',
          orientation === 'vertical' ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3'
        )}>
          {platforms.map((platform) => (
            <div key={platform.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <ShareButton platform={platform} />
                <div className="text-right">
                  <p className="text-sm font-medium">{platform.name}</p>
                  {showCounts && shareCount[platform.id] > 0 && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {shareCount[platform.id]} shares
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {showCopyLink && (
          <div className="border-t pt-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Direct link:
            </label>
            <div className="flex space-x-2">
              <Input
                value={shareData.url}
                readOnly
                className="text-sm"
              />
              <CopyLinkButton />
            </div>
          </div>
        )}

        {showQRCode && (
          <Button
            variant="outline"
            onClick={() => setShowQR(true)}
            className="w-full"
          >
            <QrCode className="w-4 h-4 mr-2" />
            Generate QR Code
          </Button>
        )}

        <AnimatePresence>
          <QRCodeModal />
        </AnimatePresence>
      </div>
    );
  }

  // Default variant
  return (
    <div 
      className={cn(
        'flex items-center gap-2',
        orientation === 'vertical' && 'flex-col items-start',
        className
      )} 
      ref={containerRef}
    >
      {platforms.map((platform) => (
        <div 
          key={platform.id}
          className={cn(
            'flex items-center space-x-2',
            orientation === 'vertical' && 'w-full'
          )}
        >
          <ShareButton platform={platform} />
          {showLabels && orientation === 'vertical' && (
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {platform.name}
            </span>
          )}
        </div>
      ))}
      
      {showCopyLink && <CopyLinkButton />}
      
      {showQRCode && (
        <Button
          variant="outline"
          size={size}
          onClick={() => setShowQR(true)}
          className={cn(sizeClasses.button, 'bg-purple-600 hover:bg-purple-700 text-white border-0')}
        >
          <QrCode className={sizeClasses.icon} />
        </Button>
      )}

      <AnimatePresence>
        <QRCodeModal />
      </AnimatePresence>
    </div>
  );
};

export default BlogShare;
