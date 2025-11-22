/**
 * Cloudinary Configuration
 * Comprehensive image and media management configuration
 * @module config/cloudinary
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CloudinaryConfig {
  enabled: boolean;
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  uploadPreset: string;
  folder: string;
  upload: UploadConfig;
  transformations: TransformationsConfig;
  optimization: OptimizationConfig;
  delivery: DeliveryConfig;
  video: VideoConfig;
  limits: CloudinaryLimits;
}

export interface UploadConfig {
  maxFileSize: number; // in bytes
  maxFiles: number;
  allowedFormats: string[];
  resourceTypes: ResourceType[];
  tags: string[];
  autoTagging: boolean;
  categorization: boolean;
  detection: DetectionConfig;
}

export type ResourceType = 'image' | 'video' | 'raw' | 'auto';

export interface DetectionConfig {
  faces: boolean;
  objects: boolean;
  colors: boolean;
  quality: boolean;
  accessibility: boolean;
}

export interface TransformationsConfig {
  quality: QualityPresets;
  formats: FormatPresets;
  responsive: ResponsivePresets;
  effects: EffectsPresets;
  overlays: OverlayConfig;
}

export interface QualityPresets {
  thumbnail: number;
  preview: number;
  standard: number;
  high: number;
  original: number;
}

export interface FormatPresets {
  auto: boolean;
  webp: boolean;
  avif: boolean;
  jpg: boolean;
  png: boolean;
}

export interface ResponsivePresets {
  mobile: ImageTransformation;
  tablet: ImageTransformation;
  desktop: ImageTransformation;
  widescreen: ImageTransformation;
}

export interface ImageTransformation {
  width?: number;
  height?: number;
  crop?: 'scale' | 'fit' | 'fill' | 'crop' | 'thumb' | 'pad';
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
  quality?: number | 'auto' | string;
  format?: string;
  dpr?: number;
}

export interface EffectsPresets {
  blur: number;
  sharpen: number;
  brightness: number;
  contrast: number;
  saturation: number;
  grayscale: boolean;
  sepia: boolean;
  pixelate: number;
}

export interface OverlayConfig {
  watermark: {
    enabled: boolean;
    publicId: string;
    opacity: number;
    gravity: string;
    x: number;
    y: number;
  };
  logo: {
    enabled: boolean;
    publicId: string;
    width: number;
    gravity: string;
  };
}

export interface OptimizationConfig {
  autoFormat: boolean;
  autoQuality: boolean;
  fetchFormat: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  compression: 'lossy' | 'lossless';
  stripMetadata: boolean;
  progressive: boolean;
  lazyLoading: boolean;
}

export interface DeliveryConfig {
  secure: boolean;
  cdn: {
    enabled: boolean;
    subdomain: string;
    privateCDN: boolean;
  };
  caching: {
    maxAge: number;
    sMaxAge: number;
    staleWhileRevalidate: number;
  };
  signed: {
    enabled: boolean;
    duration: number;
  };
}

export interface VideoConfig {
  enabled: boolean;
  maxFileSize: number;
  maxDuration: number;
  allowedFormats: string[];
  transformations: VideoTransformations;
  streaming: StreamingConfig;
}

export interface VideoTransformations {
  quality: 'auto' | 'low' | 'medium' | 'high' | 'best';
  format: string;
  codec: string;
  bitRate: string;
  audioCodec: string;
  audioBitRate: string;
}

export interface StreamingConfig {
  enabled: boolean;
  adaptive: boolean;
  profiles: string[];
}

export interface CloudinaryLimits {
  upload: {
    maxSize: number;
    maxWidth: number;
    maxHeight: number;
    maxFiles: number;
  };
  bandwidth: {
    monthly: number;
    daily: number;
  };
  storage: {
    total: number;
    images: number;
    videos: number;
  };
}

// ============================================================================
// IMAGE SIZE PRESETS
// ============================================================================

export interface ImageSizePreset {
  width: number;
  height?: number;
  crop?: string;
  quality?: number | string;
}

export const imageSizePresets = {
  // Product Images
  productThumbnail: { width: 150, height: 150, crop: 'fill', quality: 'auto' },
  productCard: { width: 300, height: 400, crop: 'fill', quality: 'auto' },
  productDetail: { width: 800, height: 1000, crop: 'fit', quality: 'auto:best' },
  productZoom: { width: 1600, height: 2000, crop: 'fit', quality: 'auto:best' },
  productGallery: { width: 600, height: 800, crop: 'fill', quality: 'auto' },

  // Category Images
  categoryCard: { width: 400, height: 300, crop: 'fill', quality: 'auto' },
  categoryBanner: { width: 1920, height: 600, crop: 'fill', quality: 'auto' },
  categoryIcon: { width: 100, height: 100, crop: 'fill', quality: 'auto' },

  // User Content
  avatar: { width: 200, height: 200, crop: 'fill', quality: 'auto' },
  avatarSmall: { width: 50, height: 50, crop: 'fill', quality: 'auto' },
  avatarLarge: { width: 400, height: 400, crop: 'fill', quality: 'auto' },

  // Banners & Hero Images
  heroBanner: { width: 1920, height: 800, crop: 'fill', quality: 'auto:best' },
  heroBannerMobile: { width: 768, height: 600, crop: 'fill', quality: 'auto' },
  promoBanner: { width: 1200, height: 400, crop: 'fill', quality: 'auto' },
  sideBanner: { width: 400, height: 600, crop: 'fill', quality: 'auto' },

  // Blog & Content
  blogThumbnail: { width: 400, height: 300, crop: 'fill', quality: 'auto' },
  blogHero: { width: 1200, height: 600, crop: 'fill', quality: 'auto' },
  blogInline: { width: 800, height: 500, crop: 'fit', quality: 'auto' },

  // Social Media
  og: { width: 1200, height: 630, crop: 'fill', quality: 'auto' },
  twitter: { width: 1200, height: 675, crop: 'fill', quality: 'auto' },
  pinterest: { width: 1000, height: 1500, crop: 'fill', quality: 'auto' },

  // Thumbnails
  microThumbnail: { width: 50, height: 50, crop: 'thumb', quality: 'auto' },
  smallThumbnail: { width: 100, height: 100, crop: 'thumb', quality: 'auto' },
  mediumThumbnail: { width: 200, height: 200, crop: 'thumb', quality: 'auto' },
  largeThumbnail: { width: 400, height: 400, crop: 'thumb', quality: 'auto' },
} as const;

// ============================================================================
// ENVIRONMENT VARIABLES
// ============================================================================

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'vardhman-mills';
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '';
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || '';
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'vardhman_default';
const CLOUDINARY_FOLDER = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || 'vardhman';
const ENABLE_CLOUDINARY = process.env.NEXT_PUBLIC_ENABLE_CLOUDINARY === 'true';

// ============================================================================
// MAIN CONFIGURATION
// ============================================================================

export const cloudinaryConfig: CloudinaryConfig = {
  enabled: ENABLE_CLOUDINARY,
  cloudName: CLOUDINARY_CLOUD_NAME,
  apiKey: CLOUDINARY_API_KEY,
  apiSecret: CLOUDINARY_API_SECRET,
  uploadPreset: CLOUDINARY_UPLOAD_PRESET,
  folder: CLOUDINARY_FOLDER,

  // Upload Configuration
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 10,
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'svg'],
    resourceTypes: ['image', 'video', 'raw', 'auto'],
    tags: ['vardhman', 'product', 'user-generated'],
    autoTagging: true,
    categorization: true,
    detection: {
      faces: true,
      objects: true,
      colors: true,
      quality: true,
      accessibility: true,
    },
  },

  // Transformation Presets
  transformations: {
    quality: {
      thumbnail: 60,
      preview: 75,
      standard: 85,
      high: 90,
      original: 100,
    },
    formats: {
      auto: true,
      webp: true,
      avif: true,
      jpg: true,
      png: true,
    },
    responsive: {
      mobile: {
        width: 640,
        crop: 'scale',
        quality: 'auto',
        format: 'auto',
        dpr: 2,
      },
      tablet: {
        width: 1024,
        crop: 'scale',
        quality: 'auto',
        format: 'auto',
        dpr: 2,
      },
      desktop: {
        width: 1920,
        crop: 'scale',
        quality: 'auto',
        format: 'auto',
        dpr: 1,
      },
      widescreen: {
        width: 2560,
        crop: 'scale',
        quality: 'auto',
        format: 'auto',
        dpr: 1,
      },
    },
    effects: {
      blur: 0,
      sharpen: 0,
      brightness: 0,
      contrast: 0,
      saturation: 0,
      grayscale: false,
      sepia: false,
      pixelate: 0,
    },
    overlays: {
      watermark: {
        enabled: false,
        publicId: 'vardhman/watermark',
        opacity: 30,
        gravity: 'south_east',
        x: 10,
        y: 10,
      },
      logo: {
        enabled: false,
        publicId: 'vardhman/logo',
        width: 100,
        gravity: 'north_west',
      },
    },
  },

  // Optimization Configuration
  optimization: {
    autoFormat: true,
    autoQuality: true,
    fetchFormat: 'auto',
    compression: 'lossy',
    stripMetadata: true,
    progressive: true,
    lazyLoading: true,
  },

  // Delivery Configuration
  delivery: {
    secure: true,
    cdn: {
      enabled: true,
      subdomain: 'res',
      privateCDN: false,
    },
    caching: {
      maxAge: 31536000, // 1 year
      sMaxAge: 31536000,
      staleWhileRevalidate: 86400, // 1 day
    },
    signed: {
      enabled: false,
      duration: 3600, // 1 hour
    },
  },

  // Video Configuration
  video: {
    enabled: true,
    maxFileSize: 100 * 1024 * 1024, // 100MB
    maxDuration: 300, // 5 minutes
    allowedFormats: ['mp4', 'webm', 'mov', 'avi'],
    transformations: {
      quality: 'auto',
      format: 'mp4',
      codec: 'h264',
      bitRate: '1m',
      audioCodec: 'aac',
      audioBitRate: '128k',
    },
    streaming: {
      enabled: true,
      adaptive: true,
      profiles: ['hd', 'sd', 'ld'],
    },
  },

  // Limits Configuration
  limits: {
    upload: {
      maxSize: 10 * 1024 * 1024, // 10MB
      maxWidth: 4000,
      maxHeight: 4000,
      maxFiles: 10,
    },
    bandwidth: {
      monthly: 25 * 1024 * 1024 * 1024, // 25GB
      daily: 1 * 1024 * 1024 * 1024, // 1GB
    },
    storage: {
      total: 25 * 1024 * 1024 * 1024, // 25GB
      images: 20 * 1024 * 1024 * 1024, // 20GB
      videos: 5 * 1024 * 1024 * 1024, // 5GB
    },
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate Cloudinary URL with transformations
 */
export const getCloudinaryUrl = (
  publicId: string,
  transformations?: Partial<ImageTransformation>
): string => {
  if (!cloudinaryConfig.enabled || !publicId) {
    return publicId;
  }

  const baseUrl = `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload`;
  const transforms: string[] = [];

  if (transformations) {
    if (transformations.width) transforms.push(`w_${transformations.width}`);
    if (transformations.height) transforms.push(`h_${transformations.height}`);
    if (transformations.crop) transforms.push(`c_${transformations.crop}`);
    if (transformations.quality) transforms.push(`q_${transformations.quality}`);
    if (transformations.format) transforms.push(`f_${transformations.format}`);
    if (transformations.gravity) transforms.push(`g_${transformations.gravity}`);
    if (transformations.dpr) transforms.push(`dpr_${transformations.dpr}`);
  }

  // Add default optimizations
  if (cloudinaryConfig.optimization.autoFormat && !transformations?.format) {
    transforms.push('f_auto');
  }
  if (cloudinaryConfig.optimization.autoQuality && !transformations?.quality) {
    transforms.push('q_auto');
  }

  const transformString = transforms.length > 0 ? `${transforms.join(',')}/` : '';
  return `${baseUrl}/${transformString}${publicId}`;
};

/**
 * Get preset image URL
 */
export const getPresetImageUrl = (
  publicId: string,
  preset: keyof typeof imageSizePresets
): string => {
  const presetConfig = imageSizePresets[preset];
  return getCloudinaryUrl(publicId, presetConfig);
};

/**
 * Get responsive image srcset
 */
export const getResponsiveSrcSet = (publicId: string, sizes: number[]): string => {
  return sizes
    .map(size => {
      const url = getCloudinaryUrl(publicId, { width: size, quality: 'auto' });
      return `${url} ${size}w`;
    })
    .join(', ');
};

/**
 * Get video URL with transformations
 */
export const getVideoUrl = (publicId: string, format?: string): string => {
  if (!cloudinaryConfig.enabled || !cloudinaryConfig.video.enabled) {
    return publicId;
  }

  const baseUrl = `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/video/upload`;
  const transforms = [
    `q_${cloudinaryConfig.video.transformations.quality}`,
    `f_${format || cloudinaryConfig.video.transformations.format}`,
  ];

  return `${baseUrl}/${transforms.join(',')}/v1/${publicId}`;
};

/**
 * Get optimized thumbnail URL
 */
export const getThumbnailUrl = (
  publicId: string,
  size: 'micro' | 'small' | 'medium' | 'large' = 'medium'
): string => {
  const presetMap = {
    micro: 'microThumbnail',
    small: 'smallThumbnail',
    medium: 'mediumThumbnail',
    large: 'largeThumbnail',
  } as const;

  return getPresetImageUrl(publicId, presetMap[size]);
};

/**
 * Get product image URL
 */
export const getProductImageUrl = (
  publicId: string,
  variant: 'thumbnail' | 'card' | 'detail' | 'zoom' | 'gallery' = 'card'
): string => {
  const presetMap = {
    thumbnail: 'productThumbnail',
    card: 'productCard',
    detail: 'productDetail',
    zoom: 'productZoom',
    gallery: 'productGallery',
  } as const;

  return getPresetImageUrl(publicId, presetMap[variant]);
};

/**
 * Get avatar URL
 */
export const getAvatarUrl = (
  publicId: string,
  size: 'small' | 'medium' | 'large' = 'medium'
): string => {
  const presetMap = {
    small: 'avatarSmall',
    medium: 'avatar',
    large: 'avatarLarge',
  } as const;

  return getPresetImageUrl(publicId, presetMap[size]);
};

/**
 * Generate upload signature (server-side only)
 */
export const generateUploadSignature = (
  paramsToSign: Record<string, string | number>
): string => {
  if (typeof window !== 'undefined') {
    throw new Error('generateUploadSignature should only be called server-side');
  }

  // Dynamic import for Node.js crypto module
  const crypto = eval('require')('crypto');
  const sortedParams = Object.keys(paramsToSign)
    .sort()
    .map(key => `${key}=${paramsToSign[key]}`)
    .join('&');

  return crypto
    .createHash('sha256')
    .update(sortedParams + cloudinaryConfig.apiSecret)
    .digest('hex');
};

/**
 * Validate file before upload
 */
export const validateFile = (
  file: File,
  type: 'image' | 'video' = 'image'
): { valid: boolean; error?: string } => {
  const config = type === 'image' ? cloudinaryConfig.upload : cloudinaryConfig.video;

  // Check file size
  if (file.size > config.maxFileSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${config.maxFileSize / (1024 * 1024)}MB`,
    };
  }

  // Check file format
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension && !config.allowedFormats.includes(extension)) {
    return {
      valid: false,
      error: `File format .${extension} is not allowed. Allowed formats: ${config.allowedFormats.join(', ')}`,
    };
  }

  return { valid: true };
};

/**
 * Get upload widget configuration
 */
export const getUploadWidgetConfig = (options?: {
  folder?: string;
  tags?: string[];
  maxFiles?: number;
  resourceType?: ResourceType;
}) => ({
  cloudName: cloudinaryConfig.cloudName,
  uploadPreset: cloudinaryConfig.uploadPreset,
  folder: options?.folder || cloudinaryConfig.folder,
  tags: options?.tags || cloudinaryConfig.upload.tags,
  multiple: (options?.maxFiles || 1) > 1,
  maxFiles: options?.maxFiles || cloudinaryConfig.upload.maxFiles,
  resourceType: options?.resourceType || 'auto',
  clientAllowedFormats: cloudinaryConfig.upload.allowedFormats,
  maxFileSize: cloudinaryConfig.upload.maxFileSize,
  maxImageWidth: cloudinaryConfig.limits.upload.maxWidth,
  maxImageHeight: cloudinaryConfig.limits.upload.maxHeight,
  cropping: true,
  croppingAspectRatio: 1,
  croppingShowDimensions: true,
  showSkipCropButton: true,
  sources: ['local', 'url', 'camera'],
  autoMinimize: true,
  styles: {
    palette: {
      window: '#FFFFFF',
      windowBorder: '#E5E7EB',
      tabIcon: '#1F2937',
      menuIcons: '#6B7280',
      textDark: '#1F2937',
      textLight: '#FFFFFF',
      link: '#3B82F6',
      action: '#3B82F6',
      inactiveTabIcon: '#9CA3AF',
      error: '#EF4444',
      inProgress: '#3B82F6',
      complete: '#10B981',
      sourceBg: '#F9FAFB',
    },
  },
});

/**
 * Check if Cloudinary is configured
 */
export const isCloudinaryConfigured = (): boolean => {
  return !!(
    cloudinaryConfig.enabled &&
    cloudinaryConfig.cloudName &&
    cloudinaryConfig.apiKey &&
    cloudinaryConfig.uploadPreset
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default cloudinaryConfig;

export {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
  CLOUDINARY_FOLDER,
};
