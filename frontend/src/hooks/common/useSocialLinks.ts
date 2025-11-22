import { useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';

export interface SocialShareData {
  url: string;
  title?: string;
  description?: string;
  hashtags?: string[];
  via?: string;
  image?: string;
  author?: string;
}

export interface SocialPlatform {
  name: string;
  baseUrl: string;
  generateUrl: (data: SocialShareData) => string;
  icon?: string;
  color?: string;
}

export interface SocialLinksOptions {
  trackingEnabled?: boolean;
  onShare?: (platform: string, data: SocialShareData) => void;
  onError?: (error: Error, platform: string) => void;
}

export interface SocialLinksReturn {
  platforms: Record<string, SocialPlatform>;
  generateShareUrl: (platform: string, data: SocialShareData) => string;
  openShare: (platform: string, data: SocialShareData, newWindow?: boolean) => void;
  copyShareUrl: (platform: string, data: SocialShareData) => Promise<boolean>;
  shareNative: (data: SocialShareData) => Promise<boolean>;
  canShareNative: boolean;
}

const socialPlatforms: Record<string, SocialPlatform> = {
  facebook: {
    name: 'Facebook',
    baseUrl: 'https://www.facebook.com/sharer/sharer.php',
    generateUrl: (data) => {
      const params = new URLSearchParams();
      params.append('u', data.url);
      if (data.title) params.append('title', data.title);
      if (data.description) params.append('description', data.description);
      return `${socialPlatforms.facebook.baseUrl}?${params.toString()}`;
    },
    color: '#1877F2',
  },
  twitter: {
    name: 'Twitter',
    baseUrl: 'https://twitter.com/intent/tweet',
    generateUrl: (data) => {
      const params = new URLSearchParams();
      params.append('url', data.url);
      if (data.title) params.append('text', data.title);
      if (data.via) params.append('via', data.via);
      if (data.hashtags?.length) {
        params.append('hashtags', data.hashtags.join(','));
      }
      return `${socialPlatforms.twitter.baseUrl}?${params.toString()}`;
    },
    color: '#1DA1F2',
  },
  linkedin: {
    name: 'LinkedIn',
    baseUrl: 'https://www.linkedin.com/sharing/share-offsite',
    generateUrl: (data) => {
      const params = new URLSearchParams();
      params.append('url', data.url);
      if (data.title) params.append('title', data.title);
      if (data.description) params.append('summary', data.description);
      return `${socialPlatforms.linkedin.baseUrl}?${params.toString()}`;
    },
    color: '#0A66C2',
  },
  whatsapp: {
    name: 'WhatsApp',
    baseUrl: 'https://wa.me',
    generateUrl: (data) => {
      const text = [data.title, data.description, data.url]
        .filter(Boolean)
        .join(' - ');
      return `${socialPlatforms.whatsapp.baseUrl}?text=${encodeURIComponent(text)}`;
    },
    color: '#25D366',
  },
  telegram: {
    name: 'Telegram',
    baseUrl: 'https://t.me/share/url',
    generateUrl: (data) => {
      const params = new URLSearchParams();
      params.append('url', data.url);
      if (data.title) params.append('text', data.title);
      return `${socialPlatforms.telegram.baseUrl}?${params.toString()}`;
    },
    color: '#0088CC',
  },
  reddit: {
    name: 'Reddit',
    baseUrl: 'https://reddit.com/submit',
    generateUrl: (data) => {
      const params = new URLSearchParams();
      params.append('url', data.url);
      if (data.title) params.append('title', data.title);
      return `${socialPlatforms.reddit.baseUrl}?${params.toString()}`;
    },
    color: '#FF4500',
  },
  pinterest: {
    name: 'Pinterest',
    baseUrl: 'https://pinterest.com/pin/create/button',
    generateUrl: (data) => {
      const params = new URLSearchParams();
      params.append('url', data.url);
      if (data.title) params.append('description', data.title);
      if (data.image) params.append('media', data.image);
      return `${socialPlatforms.pinterest.baseUrl}?${params.toString()}`;
    },
    color: '#E60023',
  },
  email: {
    name: 'Email',
    baseUrl: 'mailto:',
    generateUrl: (data) => {
      const params = new URLSearchParams();
      if (data.title) params.append('subject', data.title);
      const body = [data.description, data.url].filter(Boolean).join('\n\n');
      if (body) params.append('body', body);
      return `${socialPlatforms.email.baseUrl}?${params.toString()}`;
    },
    color: '#EA4335',
  },
};

export const useSocialLinks = (options: SocialLinksOptions = {}): SocialLinksReturn => {
  const { trackingEnabled = false, onShare, onError } = options;

  const canShareNative = useMemo(() => {
    return typeof navigator !== 'undefined' && 'share' in navigator;
  }, []);

  const generateShareUrl = useCallback(
    (platform: string, data: SocialShareData): string => {
      const socialPlatform = socialPlatforms[platform];
      
      if (!socialPlatform) {
        throw new Error(`Unknown social platform: ${platform}`);
      }

      try {
        return socialPlatform.generateUrl(data);
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to generate share URL');
        onError?.(err, platform);
        throw err;
      }
    },
    [onError]
  );

  const openShare = useCallback(
    (platform: string, data: SocialShareData, newWindow = true) => {
      try {
        const shareUrl = generateShareUrl(platform, data);
        
        if (trackingEnabled) {
          onShare?.(platform, data);
        }

        if (newWindow) {
          const windowFeatures = 'width=600,height=400,scrollbars=yes,resizable=yes';
          window.open(shareUrl, '_blank', windowFeatures);
        } else {
          window.location.href = shareUrl;
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to open share');
        onError?.(err, platform);
        toast.error(`Failed to share on ${platform}`);
      }
    },
    [generateShareUrl, trackingEnabled, onShare, onError]
  );

  const copyShareUrl = useCallback(
    async (platform: string, data: SocialShareData): Promise<boolean> => {
      try {
        const shareUrl = generateShareUrl(platform, data);
        
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(shareUrl);
        } else {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = shareUrl;
          textArea.style.position = 'fixed';
          textArea.style.opacity = '0';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }

        toast.success('Share URL copied to clipboard!');
        
        if (trackingEnabled) {
          onShare?.('copy', data);
        }
        
        return true;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to copy share URL');
        onError?.(err, platform);
        toast.error('Failed to copy share URL');
        return false;
      }
    },
    [generateShareUrl, trackingEnabled, onShare, onError]
  );

  const shareNative = useCallback(
    async (data: SocialShareData): Promise<boolean> => {
      if (!canShareNative) {
        const error = new Error('Native sharing is not supported');
        onError?.(error, 'native');
        return false;
      }

      try {
        await navigator.share({
          title: data.title,
          text: data.description,
          url: data.url,
        });
        
        if (trackingEnabled) {
          onShare?.('native', data);
        }
        
        return true;
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          const err = error instanceof Error ? error : new Error('Native sharing failed');
          onError?.(err, 'native');
          toast.error('Failed to share');
        }
        return false;
      }
    },
    [canShareNative, trackingEnabled, onShare, onError]
  );

  return {
    platforms: socialPlatforms,
    generateShareUrl,
    openShare,
    copyShareUrl,
    shareNative,
    canShareNative,
  };
};

// Specialized hooks
export const useSocialShare = (data: SocialShareData, options?: SocialLinksOptions) => {
  const socialLinks = useSocialLinks(options);
  
  const shareOn = useCallback(
    (platform: string, newWindow = true) => {
      socialLinks.openShare(platform, data, newWindow);
    },
    [socialLinks, data]
  );

  const copyLink = useCallback(
    (platform = 'direct') => {
      if (platform === 'direct') {
        return socialLinks.copyShareUrl('email', data); // Use email as fallback
      }
      return socialLinks.copyShareUrl(platform, data);
    },
    [socialLinks, data]
  );

  const shareNatively = useCallback(() => {
    return socialLinks.shareNative(data);
  }, [socialLinks, data]);

  return {
    ...socialLinks,
    shareOn,
    copyLink,
    shareNatively,
  };
};

export default useSocialLinks;
