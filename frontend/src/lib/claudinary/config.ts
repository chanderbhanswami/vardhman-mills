/**
 * Cloudinary Configuration and Setup
 * Comprehensive configuration for Cloudinary integration
 */

import { v2 as cloudinary } from 'cloudinary';

/**
 * Cloudinary Environment Configuration
 */
export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  uploadPreset?: string;
  folder?: string;
  secure: boolean;
}

/**
 * Upload Options Interface
 */
export interface CloudinaryUploadOptions {
  folder?: string;
  public_id?: string;
  overwrite?: boolean;
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
  format?: string;
  quality?: 'auto' | number;
  transformation?: CloudinaryTransformation[];
  tags?: string[];
  context?: Record<string, string>;
  eager?: CloudinaryTransformation[];
  eager_async?: boolean;
  use_filename?: boolean;
  unique_filename?: boolean;
  invalidate?: boolean;
  notification_url?: string;
  eager_notification_url?: string;
  proxy?: string;
  return_delete_token?: boolean;
  allowed_formats?: string[];
  auto_tagging?: number;
  categorization?: string;
  detection?: string;
  similarity_search?: boolean;
  background_removal?: string;
  raw_convert?: string;
  ocr?: string;
  async?: boolean;
  backup?: boolean;
  exif?: boolean;
  colors?: boolean;
  image_metadata?: boolean;
  media_metadata?: boolean;
  phash?: boolean;
  faces?: boolean;
  quality_analysis?: boolean;
  accessibility_analysis?: boolean;
  cinemagraph_analysis?: boolean;
}

/**
 * Cloudinary Transformation Interface
 */
export interface CloudinaryTransformation {
  width?: number;
  height?: number;
  crop?: 'scale' | 'fit' | 'limit' | 'fill' | 'crop' | 'pad' | 'lpad' | 'mpad' | 'fill_pad' | 'thumbnail' | 'imagga_crop' | 'imagga_scale';
  gravity?: 'center' | 'north' | 'south' | 'east' | 'west' | 'north_east' | 'north_west' | 'south_east' | 'south_west' | 'face' | 'faces' | 'auto';
  quality?: 'auto' | number;
  format?: 'jpg' | 'png' | 'webp' | 'gif' | 'svg' | 'pdf' | 'auto';
  fetch_format?: 'auto' | 'jpg' | 'png' | 'webp' | 'gif';
  dpr?: 'auto' | number;
  flags?: string[];
  effect?: string;
  overlay?: string;
  underlay?: string;
  color?: string;
  background?: string;
  opacity?: number;
  radius?: number | string;
  border?: string;
  angle?: number;
  x?: number;
  y?: number;
  z?: number;
  if?: string;
  else?: string;
  end_if?: string;
  custom_function?: string;
  [key: string]: unknown;
}

/**
 * Cloudinary Response Interface
 */
export interface CloudinaryUploadResponse {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder?: string;
  access_mode: string;
  original_filename: string;
  eager?: Array<{
    transformation: string;
    width: number;
    height: number;
    bytes: number;
    format: string;
    url: string;
    secure_url: string;
  }>;
  context?: Record<string, string>;
  metadata?: Record<string, unknown>;
  colors?: Array<[string, number]>;
  predominant?: {
    google?: Array<[string, number]>;
    cloudinary?: Array<[string, number]>;
  };
  phash?: string;
  faces?: Array<Array<number>>;
  quality_analysis?: {
    focus: number;
    noise: number;
    contrast: number;
    brightness: number;
    saturation: number;
    colorfulness: number;
    resolution: number;
  };
  accessibility_analysis?: {
    colorblind_accessibility_analysis: {
      distinct_edges: number;
      distinct_colors: number;
      most_indistinct_pair: [string, string];
    };
  };
  cinemagraph_analysis?: {
    cinemagraph_score: number;
  };
  delete_token?: string;
}

/**
 * Cloudinary Error Interface
 */
export interface CloudinaryError {
  message: string;
  name: string;
  http_code: number;
  error?: {
    message: string;
  };
}

/**
 * Cloudinary Configuration Class
 */
export class CloudinaryConfigManager {
  private static instance: CloudinaryConfigManager;
  private config: CloudinaryConfig;
  private isInitialized = false;

  private constructor() {
    this.config = this.loadConfigFromEnv();
    this.validateConfig();
  }

  public static getInstance(): CloudinaryConfigManager {
    if (!CloudinaryConfigManager.instance) {
      CloudinaryConfigManager.instance = new CloudinaryConfigManager();
    }
    return CloudinaryConfigManager.instance;
  }

  /**
   * Load configuration from environment variables
   */
  private loadConfigFromEnv(): CloudinaryConfig {
    return {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
      apiKey: process.env.CLOUDINARY_API_KEY || '',
      apiSecret: process.env.CLOUDINARY_API_SECRET || '',
      uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'vardhman_uploads',
      folder: process.env.CLOUDINARY_FOLDER || 'vardhman_mills',
      secure: true,
    };
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    const { cloudName, apiKey, apiSecret } = this.config;

    if (!cloudName) {
      throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is required');
    }

    if (!apiKey) {
      console.warn('CLOUDINARY_API_KEY is missing - server-side operations will not work');
    }

    if (!apiSecret) {
      console.warn('CLOUDINARY_API_SECRET is missing - server-side operations will not work');
    }
  }

  /**
   * Initialize Cloudinary SDK
   */
  public initialize(): void {
    if (this.isInitialized) {
      return;
    }

    const { cloudName, apiKey, apiSecret, secure } = this.config;

    // Configure Cloudinary (server-side only)
    if (typeof window === 'undefined' && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure,
      });
    }

    this.isInitialized = true;
  }

  /**
   * Get configuration
   */
  public getConfig(): CloudinaryConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  public updateConfig(updates: Partial<CloudinaryConfig>): void {
    this.config = { ...this.config, ...updates };
    this.isInitialized = false;
    this.initialize();
  }

  /**
   * Get client-safe configuration (no secrets)
   */
  public getClientConfig(): Pick<CloudinaryConfig, 'cloudName' | 'uploadPreset' | 'folder' | 'secure'> {
    const { cloudName, uploadPreset, folder, secure } = this.config;
    return { cloudName, uploadPreset, folder, secure };
  }

  /**
   * Check if configuration is complete
   */
  public isConfigured(): boolean {
    const { cloudName, apiKey, apiSecret } = this.config;
    return !!(cloudName && apiKey && apiSecret);
  }

  /**
   * Check if client-side uploads are configured
   */
  public isClientConfigured(): boolean {
    const { cloudName, uploadPreset } = this.config;
    return !!(cloudName && uploadPreset);
  }

  /**
   * Get Cloudinary SDK instance (server-side only)
   */
  public getSDK() {
    if (typeof window !== 'undefined') {
      throw new Error('Cloudinary SDK is only available on server-side');
    }

    this.initialize();
    return cloudinary;
  }

  /**
   * Generate signed upload parameters
   */
  public generateSignedParams(options: CloudinaryUploadOptions = {}): {
    timestamp: number;
    signature: string;
    api_key: string;
    cloud_name: string;
    [key: string]: unknown;
  } {
    if (typeof window !== 'undefined') {
      throw new Error('Signed uploads can only be generated server-side');
    }

    this.initialize();
    
    const timestamp = Math.round(Date.now() / 1000);
    const params = {
      timestamp,
      ...options,
    };

    // Remove undefined values
    Object.keys(params).forEach(key => {
      if (params[key as keyof typeof params] === undefined) {
        delete params[key as keyof typeof params];
      }
    });

    const signature = cloudinary.utils.api_sign_request(params, this.config.apiSecret);

    return {
      ...params,
      signature,
      api_key: this.config.apiKey,
      cloud_name: this.config.cloudName,
    };
  }

  /**
   * Build Cloudinary URL
   */
  public buildUrl(publicId: string, transformations: CloudinaryTransformation[] = []): string {
    const { cloudName, secure } = this.config;
    const protocol = secure ? 'https' : 'http';
    const baseUrl = `${protocol}://res.cloudinary.com/${cloudName}`;

    if (transformations.length === 0) {
      return `${baseUrl}/image/upload/${publicId}`;
    }

    const transformationString = transformations
      .map(t => this.buildTransformationString(t))
      .join('/');

    return `${baseUrl}/image/upload/${transformationString}/${publicId}`;
  }

  /**
   * Build transformation string
   */
  private buildTransformationString(transformation: CloudinaryTransformation): string {
    const params: string[] = [];

    Object.entries(transformation).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          params.push(`${key}_${value.join(':')}`);
        } else {
          params.push(`${key}_${value}`);
        }
      }
    });

    return params.join(',');
  }

  /**
   * Get preset transformations for common use cases
   */
  public getPresetTransformations() {
    return {
      // Thumbnails
      thumbnail: { width: 150, height: 150, crop: 'fill' as const, quality: 'auto' as const },
      thumbnailSmall: { width: 100, height: 100, crop: 'fill' as const, quality: 'auto' as const },
      thumbnailLarge: { width: 300, height: 300, crop: 'fill' as const, quality: 'auto' as const },

      // Profile images
      avatar: { width: 200, height: 200, crop: 'fill' as const, gravity: 'face' as const, quality: 'auto' as const, format: 'jpg' as const },
      avatarSmall: { width: 50, height: 50, crop: 'fill' as const, gravity: 'face' as const, quality: 'auto' as const, format: 'jpg' as const },
      avatarLarge: { width: 400, height: 400, crop: 'fill' as const, gravity: 'face' as const, quality: 'auto' as const, format: 'jpg' as const },

      // Product images
      productMain: { width: 800, height: 800, crop: 'fit' as const, quality: 'auto' as const, format: 'webp' as const },
      productThumb: { width: 200, height: 200, crop: 'fill' as const, quality: 'auto' as const, format: 'webp' as const },
      productZoom: { width: 1200, height: 1200, crop: 'fit' as const, quality: 'auto' as const, format: 'webp' as const },

      // Gallery images
      galleryMain: { width: 1000, height: 600, crop: 'fill' as const, quality: 'auto' as const, format: 'webp' as const },
      galleryThumb: { width: 300, height: 200, crop: 'fill' as const, quality: 'auto' as const, format: 'webp' as const },

      // Blog/content images
      blogFeatured: { width: 800, height: 400, crop: 'fill' as const, quality: 'auto' as const, format: 'webp' as const },
      blogInline: { width: 600, height: 300, crop: 'fit' as const, quality: 'auto' as const, format: 'webp' as const },

      // Banner/hero images
      bannerDesktop: { width: 1920, height: 600, crop: 'fill' as const, quality: 'auto' as const, format: 'webp' as const },
      bannerMobile: { width: 768, height: 400, crop: 'fill' as const, quality: 'auto' as const, format: 'webp' as const },

      // Social media
      socialSquare: { width: 1080, height: 1080, crop: 'fill' as const, quality: 'auto' as const, format: 'jpg' as const },
      socialLandscape: { width: 1200, height: 630, crop: 'fill' as const, quality: 'auto' as const, format: 'jpg' as const },

      // Responsive
      responsive: {
        breakpoints: [400, 600, 800, 1000, 1200, 1400],
        transformation: { quality: 'auto' as const, format: 'webp' as const, crop: 'scale' as const },
      },

      // Quality variations
      highQuality: { quality: 90, format: 'jpg' as const },
      mediumQuality: { quality: 'auto' as const, format: 'webp' as const },
      lowQuality: { quality: 50, format: 'jpg' as const },

      // Effects
      grayscale: { effect: 'grayscale' },
      sepia: { effect: 'sepia' },
      blur: { effect: 'blur:300' },
      sharpen: { effect: 'sharpen' },
      brightness: { effect: 'brightness:20' },
      contrast: { effect: 'contrast:20' },
      saturation: { effect: 'saturation:20' },
      
      // Auto enhancements
      autoEnhance: { effect: 'auto_color', quality: 'auto' as const },
      autoContrast: { effect: 'auto_contrast' },
      autoColor: { effect: 'auto_color' },
      autoBrightness: { effect: 'auto_brightness' },

      // Overlays and watermarks
      watermark: {
        overlay: 'text:arial_30_bold:Vardhman Mills',
        gravity: 'south_east' as const,
        x: 10,
        y: 10,
        opacity: 70,
        color: 'white',
      },
    };
  }

  /**
   * Get configuration status
   */
  public getStatus(): {
    isConfigured: boolean;
    isClientConfigured: boolean;
    missingEnvVars: string[];
    capabilities: {
      serverSideUpload: boolean;
      clientSideUpload: boolean;
      transformations: boolean;
      signedUploads: boolean;
    };
  } {
    const { cloudName, apiKey, apiSecret, uploadPreset } = this.config;
    const missingEnvVars: string[] = [];

    if (!cloudName) missingEnvVars.push('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME');
    if (!apiKey) missingEnvVars.push('CLOUDINARY_API_KEY');
    if (!apiSecret) missingEnvVars.push('CLOUDINARY_API_SECRET');
    if (!uploadPreset) missingEnvVars.push('NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET');

    return {
      isConfigured: this.isConfigured(),
      isClientConfigured: this.isClientConfigured(),
      missingEnvVars,
      capabilities: {
        serverSideUpload: !!(cloudName && apiKey && apiSecret),
        clientSideUpload: !!(cloudName && uploadPreset),
        transformations: !!cloudName,
        signedUploads: !!(cloudName && apiKey && apiSecret),
      },
    };
  }
}

// Export singleton instance
export const cloudinaryConfig = CloudinaryConfigManager.getInstance();

/**
 * Environment Variables Documentation
 */
export const REQUIRED_ENV_VARS = {
  // Required for all functionality
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: 'Your Cloudinary cloud name (found in dashboard)',
  
  // Required for server-side operations
  CLOUDINARY_API_KEY: 'Your Cloudinary API key (found in dashboard)',
  CLOUDINARY_API_SECRET: 'Your Cloudinary API secret (found in dashboard)',
  
  // Required for client-side uploads
  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: 'Upload preset name for unsigned uploads',
  
  // Optional
  CLOUDINARY_FOLDER: 'Default folder for uploads (optional)',
} as const;

/**
 * Setup Instructions
 */
export const SETUP_INSTRUCTIONS = `
To set up Cloudinary integration:

1. Create a Cloudinary account at https://cloudinary.com
2. Get your credentials from the dashboard
3. Add these environment variables to your .env.local:

   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   CLOUDINARY_FOLDER=vardhman_mills

4. Create an upload preset in your Cloudinary dashboard:
   - Go to Settings > Upload
   - Create a new unsigned upload preset
   - Configure allowed formats, transformations, etc.
   - Use the preset name in NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

5. Initialize the configuration in your app:
   import { cloudinaryConfig } from '@/lib/cloudinary/config';
   cloudinaryConfig.initialize();
`;

export default CloudinaryConfigManager;