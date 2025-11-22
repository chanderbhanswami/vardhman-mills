'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Facebook, Twitter, Linkedin, Mail, Link as LinkIcon, Check } from 'lucide-react';
import { Product } from '@/types/product.types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export interface SocialShareProps {
  product: Product;
  className?: string;
  variant?: 'default' | 'compact';
}

interface SharePlatform {
  name: string;
  icon: React.ReactNode;
  color: string;
  getUrl: (url: string, title: string) => string;
}

const SocialShare: React.FC<SocialShareProps> = ({
  product,
  className,
  variant = 'default',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const productUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/products/${product.slug}`
    : `https://example.com/products/${product.slug}`;

  const shareTitle = `Check out ${product.name}`;
  const shareText = product.shortDescription || product.name;

  const platforms: SharePlatform[] = [
    {
      name: 'Facebook',
      icon: <Facebook className="h-5 w-5" />,
      color: 'bg-primary-600 hover:bg-primary-700',
      getUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      name: 'Twitter',
      icon: <Twitter className="h-5 w-5" />,
      color: 'bg-sky-500 hover:bg-sky-600',
      getUrl: (url, title) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin className="h-5 w-5" />,
      color: 'bg-blue-700 hover:bg-blue-800',
      getUrl: (url) => `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}`,
    },
    {
      name: 'Email',
      icon: <Mail className="h-5 w-5" />,
      color: 'bg-gray-600 hover:bg-gray-700',
      getUrl: (url, title) => `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${shareText}\n\n${url}`)}`,
    },
  ];

  const handleShare = async (platform: SharePlatform) => {
    if (typeof window === 'undefined') return;

    const shareUrl = platform.getUrl(productUrl, shareTitle);
    window.open(shareUrl, '_blank', 'width=600,height=400');
    toast.success(`Sharing on ${platform.name}`);
  };

  const handleNativeShare = async () => {
    if (typeof window === 'undefined' || !navigator.share) {
      setIsOpen(!isOpen);
      return;
    }

    try {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: productUrl,
      });
      toast.success('Shared successfully');
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        setIsOpen(!isOpen);
      }
    }
  };

  const handleCopyLink = async () => {
    if (typeof window === 'undefined') return;

    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  if (variant === 'compact') {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={handleNativeShare}
        className={className}
        aria-label="Share product"
      >
        <Share2 className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="outline"
        onClick={handleNativeShare}
        className="flex items-center gap-2"
      >
        <Share2 className="h-4 w-4" />
        <span>Share</span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Share Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-4 space-y-3 z-50"
            >
              <h3 className="font-semibold text-gray-900">Share this product</h3>

              {/* Social Platforms */}
              <div className="grid grid-cols-2 gap-2">
                {platforms.map((platform) => (
                  <button
                    key={platform.name}
                    onClick={() => handleShare(platform)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-white transition-colors',
                      platform.color
                    )}
                  >
                    {platform.icon}
                    <span className="text-sm font-medium">{platform.name}</span>
                  </button>
                ))}
              </div>

              {/* Copy Link */}
              <div className="pt-3 border-t">
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <LinkIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SocialShare;
