'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  Share2, 
  Copy, 
  Mail,
  MessageCircle,
  Twitter,
  Facebook,
  Linkedin,
  Link as LinkIcon,
  QrCode,
  Download,
  X,
  Check,
  Smartphone,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { Card } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { useToast } from '../../../../hooks/useToast';
import { cn } from '@/lib/utils';

// Types
export interface ShareData {
  url: string;
  title: string;
  description?: string;
  image?: string;
  hashtags?: string[];
  via?: string;
}

export interface ShareButtonProps {
  reviewId: string;
  
  // Content to share
  url?: string;
  title?: string;
  description?: string;
  image?: string;
  hashtags?: string[];
  
  // Appearance
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'outline' | 'secondary';
  showText?: boolean;
  showCount?: boolean;
  className?: string;
  
  // Behavior
  disabled?: boolean;
  customShareText?: string;
  enableNativeShare?: boolean;
  enableQRCode?: boolean;
  enableShortUrl?: boolean;
  enableAnalytics?: boolean;
  
  // Modal settings
  modalTitle?: string;
  modalSize?: 'sm' | 'md' | 'lg';
  showSocialIcons?: boolean;
  showAdvancedOptions?: boolean;
  
  // Sharing platforms
  enabledPlatforms?: string[];
  
  // Callbacks
  onShare?: (platform: string, data: ShareData) => void;
  onShareSuccess?: (platform: string, data: ShareData) => void;
  onShareError?: (platform: string, error: Error) => void;
  onCopySuccess?: (url: string) => void;
  onModalOpen?: () => void;
  onModalClose?: () => void;
  
  // API
  analyticsEndpoint?: string;
  shortUrlEndpoint?: string;
  
  // Customization
  shareTextTemplate?: string;
  customPlatforms?: Array<{
    name: string;
    icon: React.ReactNode;
    shareUrl: string;
    color: string;
  }>;
}

// Share platform configurations
const SHARE_PLATFORMS = {
  twitter: {
    name: 'Twitter',
    icon: Twitter,
    color: 'bg-blue-400 hover:bg-blue-500',
    shareUrl: (data: ShareData) => 
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(data.title)}&url=${encodeURIComponent(data.url)}${data.hashtags ? `&hashtags=${data.hashtags.join(',')}` : ''}${data.via ? `&via=${data.via}` : ''}`
  },
  facebook: {
    name: 'Facebook',
    icon: Facebook,
    color: 'bg-blue-600 hover:bg-blue-700',
    shareUrl: (data: ShareData) => 
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}&quote=${encodeURIComponent(data.title)}`
  },
  linkedin: {
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'bg-blue-700 hover:bg-blue-800',
    shareUrl: (data: ShareData) => 
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.url)}&title=${encodeURIComponent(data.title)}${data.description ? `&summary=${encodeURIComponent(data.description)}` : ''}`
  },
  whatsapp: {
    name: 'WhatsApp',
    icon: MessageCircle,
    color: 'bg-green-500 hover:bg-green-600',
    shareUrl: (data: ShareData) => 
      `https://wa.me/?text=${encodeURIComponent(data.title + ' ' + data.url)}`
  },
  email: {
    name: 'Email',
    icon: Mail,
    color: 'bg-gray-600 hover:bg-gray-700',
    shareUrl: (data: ShareData) => 
      `mailto:?subject=${encodeURIComponent(data.title)}&body=${encodeURIComponent(data.description || '')}%0A%0A${encodeURIComponent(data.url)}`
  }
};

const ShareButton: React.FC<ShareButtonProps> = ({
  reviewId,
  url = window.location.href,
  title = document.title,
  description = 'Check out this review',
  image,
  hashtags = [],
  size = 'md',
  variant = 'ghost',
  showText = true,
  showCount = false,
  className,
  disabled = false,
  customShareText = 'Share',
  enableNativeShare = true,
  enableQRCode = false,
  enableShortUrl = false,
  enableAnalytics = true,
  modalTitle = 'Share Review',
  modalSize = 'md',
  showSocialIcons = true,
  showAdvancedOptions = false,
  enabledPlatforms = ['twitter', 'facebook', 'linkedin', 'whatsapp', 'email'],
  onShare,
  onShareSuccess,
  onShareError,
  onCopySuccess,
  onModalOpen,
  onModalClose,
  analyticsEndpoint = '/api/analytics/share',
  shortUrlEndpoint = '/api/short-url',
  shareTextTemplate = '{title} {url}',
  customPlatforms = []
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [isGeneratingShortUrl, setIsGeneratingShortUrl] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [shareCount, setShareCount] = useState(0);
  const [includeDescription, setIncludeDescription] = useState(true);
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [customMessage, setCustomMessage] = useState('');

  const { toast } = useToast();

  // Generate share data
  const getShareData = React.useCallback((): ShareData => {
    const shareUrl = shortUrl || url;
    let shareTitle = title;
    
    if (customMessage) {
      shareTitle = shareTextTemplate
        .replace('{title}', customMessage)
        .replace('{url}', shareUrl);
    } else {
      shareTitle = shareTextTemplate
        .replace('{title}', title)
        .replace('{url}', shareUrl);
    }

    return {
      url: shareUrl,
      title: shareTitle,
      description: includeDescription ? description : undefined,
      image,
      hashtags: includeHashtags ? hashtags : undefined,
      via: 'VardhmanMills'
    };
  }, [url, title, description, image, hashtags, shortUrl, customMessage, shareTextTemplate, includeDescription, includeHashtags]);

  // Check if native sharing is supported
  const isNativeShareSupported = React.useMemo(() => {
    return enableNativeShare && typeof navigator !== 'undefined' && 'share' in navigator;
  }, [enableNativeShare]);

  // Track analytics
  const trackShare = async (platform: string, data: ShareData) => {
    if (!enableAnalytics) return;

    try {
      await fetch(analyticsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewId,
          platform,
          url: data.url,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to track share:', error);
    }
  };

  // Generate short URL
  const generateShortUrl = async () => {
    if (!enableShortUrl || shortUrl) return;

    setIsGeneratingShortUrl(true);
    try {
      const response = await fetch(shortUrlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, reviewId })
      });

      if (response.ok) {
        const data = await response.json();
        setShortUrl(data.shortUrl);
      }
    } catch (error) {
      console.error('Failed to generate short URL:', error);
    } finally {
      setIsGeneratingShortUrl(false);
    }
  };

  // Generate QR code
  const generateQRCode = async () => {
    if (!enableQRCode || qrCodeUrl) return;

    const shareUrl = shortUrl || url;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
    setQrCodeUrl(qrUrl);
  };

  // Handle share button click
  const handleShareClick = async () => {
    if (disabled) return;

    const shareData = getShareData();

    // Try native share first if supported and enabled
    if (isNativeShareSupported) {
      try {
        await navigator.share({
          title: shareData.title,
          text: shareData.description,
          url: shareData.url
        });

        trackShare('native', shareData);
        onShare?.('native', shareData);
        onShareSuccess?.('native', shareData);
        return;
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Native share failed:', error);
        }
      }
    }

    // Fallback to modal
    setShowShareModal(true);
    onModalOpen?.();

    // Generate additional content if needed
    if (enableShortUrl) {
      generateShortUrl();
    }
    if (enableQRCode) {
      generateQRCode();
    }
  };

  // Handle platform share
  const handlePlatformShare = async (platform: string) => {
    const shareData = getShareData();
    
    try {
      const platformConfig = SHARE_PLATFORMS[platform as keyof typeof SHARE_PLATFORMS];
      if (platformConfig) {
        const shareUrl = platformConfig.shareUrl(shareData);
        window.open(shareUrl, '_blank', 'width=600,height=400');
      }

      await trackShare(platform, shareData);
      setShareCount(prev => prev + 1);
      
      toast({
        title: 'Shared Successfully',
        description: `Review shared on ${platformConfig?.name || platform}`,
        variant: 'success'
      });

      onShare?.(platform, shareData);
      onShareSuccess?.(platform, shareData);

    } catch (error) {
      console.error(`Failed to share on ${platform}:`, error);
      
      toast({
        title: 'Share Failed',
        description: 'Failed to share the review',
        variant: 'error'
      });

      onShareError?.(platform, error instanceof Error ? error : new Error('Share failed'));
    }
  };

  // Copy URL to clipboard
  const copyToClipboard = async () => {
    const shareData = getShareData();
    
    try {
      await navigator.clipboard.writeText(shareData.url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);

      toast({
        title: 'Link Copied',
        description: 'Review link copied to clipboard',
        variant: 'success'
      });

      await trackShare('copy', shareData);
      onCopySuccess?.(shareData.url);

    } catch (error) {
      console.error('Failed to copy URL:', error);
      
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy link to clipboard',
        variant: 'error'
      });
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowShareModal(false);
    setCustomMessage('');
    onModalClose?.();
  };

  // Render platform buttons
  const renderPlatformButtons = () => {
    const allPlatforms = [
      ...enabledPlatforms.map(platform => ({
        key: platform,
        ...SHARE_PLATFORMS[platform as keyof typeof SHARE_PLATFORMS]
      })),
      ...customPlatforms.map(platform => ({
        key: platform.name.toLowerCase(),
        ...platform
      }))
    ];

    return (
      <div className="grid grid-cols-2 gap-3">
        {allPlatforms.map((platform) => {
          const IconComponent = platform.icon as React.ElementType;
          return (
            <Button
              key={platform.key}
              variant="outline"
              onClick={() => handlePlatformShare(platform.key)}
              className={cn(
                "flex items-center justify-center gap-2 h-12",
                "transition-all duration-200 hover:scale-105",
                "border-gray-200 hover:border-gray-300"
              )}
            >
              <IconComponent className="w-5 h-5" />
              <span className="font-medium">{platform.name}</span>
            </Button>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <Tooltip content="Share this review">
        <Button
          variant={variant}
          size={size}
          onClick={handleShareClick}
          disabled={disabled}
          className={cn(
            "transition-all duration-200",
            "hover:scale-105 active:scale-95",
            "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            className
          )}
          aria-label="Share review"
        >
          <motion.div
            whileHover={{ rotate: 15 }}
            whileTap={{ rotate: -15 }}
            transition={{ duration: 0.2 }}
          >
            <Share2 className="w-4 h-4" />
          </motion.div>
          
          {showText && (
            <span className="ml-2">{customShareText}</span>
          )}
          
          {showCount && shareCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {shareCount}
            </Badge>
          )}
        </Button>
      </Tooltip>

      {/* Share Modal */}
      {showShareModal && (
        <Modal
          open={showShareModal}
          onClose={handleModalClose}
          className={cn(
            modalSize === 'sm' && 'max-w-md',
            modalSize === 'md' && 'max-w-lg',
            modalSize === 'lg' && 'max-w-2xl'
          )}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">{modalTitle}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleModalClose}
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Copy Link Section */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Copy Link</span>
                {shortUrl && (
                  <Badge variant="secondary" className="text-xs">Short URL</Badge>
                )}
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={shortUrl || url}
                  readOnly
                  className="flex-1"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <Button
                  variant="outline"
                  onClick={copyToClipboard}
                  className="px-3"
                >
                  {copiedUrl ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {enableShortUrl && !shortUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generateShortUrl}
                  disabled={isGeneratingShortUrl}
                  className="text-sm"
                >
                  {isGeneratingShortUrl ? 'Generating...' : 'Generate short URL'}
                </Button>
              )}
            </div>

            {/* Social Sharing */}
            {showSocialIcons && (
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Share on Social Media</span>
                </div>
                {renderPlatformButtons()}
              </div>
            )}

            {/* QR Code */}
            {enableQRCode && qrCodeUrl && (
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">QR Code</span>
                </div>
                <Card className="p-4 text-center">
                  <Image
                    src={qrCodeUrl}
                    alt="QR Code"
                    className="mx-auto mb-3"
                    width={150}
                    height={150}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = qrCodeUrl;
                      link.download = `review-${reviewId}-qr.png`;
                      link.click();
                    }}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download QR
                  </Button>
                </Card>
              </div>
            )}

            {/* Advanced Options */}
            {showAdvancedOptions && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-medium text-gray-900">Share Options</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Include description</span>
                    <Switch
                      checked={includeDescription}
                      onCheckedChange={setIncludeDescription}
                    />
                  </div>
                  
                  {hashtags.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Include hashtags</span>
                      <Switch
                        checked={includeHashtags}
                        onCheckedChange={setIncludeHashtags}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Custom message</label>
                    <Input
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Add a custom message..."
                      maxLength={280}
                    />
                    <p className="text-xs text-gray-500">
                      {customMessage.length}/280 characters
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Native Share Button */}
            {isNativeShareSupported && (
              <div className="mt-6 pt-4 border-t">
                <Button
                  onClick={handleShareClick}
                  className="w-full"
                  variant="outline"
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  Use Device Share
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
};

export default ShareButton;