/**
 * Cloudinary Utilities
 * Comprehensive utility functions for image transformations, optimizations, and management
 */

import { cloudinaryConfig, CloudinaryTransformation, CloudinaryUploadResponse } from './config';

/**
 * Image Optimization Options
 */
export interface ImageOptimizationOptions {
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'jpg' | 'png' | 'gif' | 'svg';
  fetchFormat?: 'auto' | 'webp' | 'jpg' | 'png' | 'gif';
  dpr?: 'auto' | number;
  progressive?: boolean;
  lossy?: boolean;
  flags?: string[];
}

/**
 * Responsive Image Options
 */
export interface ResponsiveImageOptions {
  breakpoints: number[];
  baseTransformation?: CloudinaryTransformation;
  formats?: string[];
  quality?: 'auto' | number;
  dpr?: 'auto' | number;
}

/**
 * Srcset Configuration
 */
export interface SrcsetConfig {
  widths: number[];
  transformation?: CloudinaryTransformation;
  format?: string;
  quality?: 'auto' | number;
}

/**
 * Image Analysis Result
 */
export interface ImageAnalysis {
  predominantColors?: Array<[string, number]>;
  faces?: Array<{ x: number; y: number; width: number; height: number }>;
  quality?: {
    focus: number;
    noise: number;
    contrast: number;
    brightness: number;
    saturation: number;
    colorfulness: number;
    resolution: number;
  };
  accessibility?: {
    distinctEdges: number;
    distinctColors: number;
    mostIndistinctPair: [string, string];
  };
  tags?: string[];
  categories?: Array<{ name: string; confidence: number }>;
}

/**
 * Video Processing Options
 */
export interface VideoProcessingOptions {
  width?: number;
  height?: number;
  crop?: 'scale' | 'fit' | 'fill' | 'limit' | 'pad';
  quality?: 'auto' | number;
  format?: 'mp4' | 'webm' | 'ogv' | 'flv';
  bitRate?: number;
  fps?: number;
  duration?: number;
  startOffset?: number;
  endOffset?: number;
  audioCodec?: 'aac' | 'mp3' | 'vorbis';
  videoCodec?: 'h264' | 'h265' | 'vp8' | 'vp9';
  keyframeInterval?: number;
  streaming?: boolean;
}

/**
 * Watermark Options
 */
export interface WatermarkOptions {
  type: 'text' | 'image';
  content: string; // Text content or image public_id
  position?: 'center' | 'north' | 'south' | 'east' | 'west' | 'north_east' | 'north_west' | 'south_east' | 'south_west';
  x?: number;
  y?: number;
  opacity?: number;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold';
  backgroundColor?: string;
  padding?: number;
  rotation?: number;
}

/**
 * Cloudinary Utils Class
 */
export class CloudinaryUtils {
  private static instance: CloudinaryUtils;

  private constructor() {}

  public static getInstance(): CloudinaryUtils {
    if (!CloudinaryUtils.instance) {
      CloudinaryUtils.instance = new CloudinaryUtils();
    }
    return CloudinaryUtils.instance;
  }

  /**
   * Build optimized image URL
   */
  public buildImageUrl(
    publicId: string,
    options: ImageOptimizationOptions & CloudinaryTransformation = {}
  ): string {
    const transformation: CloudinaryTransformation = {
      ...options,
      quality: options.quality || 'auto',
      format: options.format || 'auto',
      fetch_format: options.fetchFormat || 'auto',
      dpr: options.dpr || 'auto',
    };

    // Add progressive JPEG for better loading
    if (options.progressive !== false && (options.format === 'jpg' || !options.format)) {
      transformation.flags = [...(transformation.flags || []), 'progressive'];
    }

    // Add lossy WebP for better compression
    if (options.lossy && (options.format === 'webp' || !options.format)) {
      transformation.flags = [...(transformation.flags || []), 'lossy'];
    }

    return cloudinaryConfig.buildUrl(publicId, [transformation]);
  }

  /**
   * Generate responsive image URLs
   */
  public generateResponsiveImages(
    publicId: string,
    options: ResponsiveImageOptions
  ): Array<{ url: string; width: number; descriptor: string }> {
    const { breakpoints, baseTransformation = {}, formats = ['webp', 'jpg'], quality = 'auto', dpr = 'auto' } = options;
    const images: Array<{ url: string; width: number; descriptor: string }> = [];

    breakpoints.forEach(width => {
      formats.forEach(format => {
        const transformation: CloudinaryTransformation = {
          ...baseTransformation,
          width,
          crop: baseTransformation.crop || 'scale',
          quality,
          format: format as 'jpg' | 'png' | 'webp' | 'gif' | 'svg' | 'pdf' | 'auto',
          dpr,
        };

        const url = cloudinaryConfig.buildUrl(publicId, [transformation]);
        images.push({
          url,
          width,
          descriptor: `${width}w`,
        });
      });
    });

    return images;
  }

  /**
   * Generate srcset attribute
   */
  public generateSrcset(publicId: string, config: SrcsetConfig): string {
    const { widths, transformation = {}, format = 'auto', quality = 'auto' } = config;

    const srcsetEntries = widths.map(width => {
      const imgTransformation: CloudinaryTransformation = {
        ...transformation,
        width,
        crop: transformation.crop || 'scale',
        quality,
        format: format as 'jpg' | 'png' | 'webp' | 'gif' | 'svg' | 'pdf' | 'auto',
      };

      const url = cloudinaryConfig.buildUrl(publicId, [imgTransformation]);
      return `${url} ${width}w`;
    });

    return srcsetEntries.join(', ');
  }

  /**
   * Generate sizes attribute for responsive images
   */
  public generateSizesAttribute(breakpoints: Array<{ mediaQuery: string; size: string }>): string {
    const sizeEntries = breakpoints.map(bp => `${bp.mediaQuery} ${bp.size}`);
    return sizeEntries.join(', ');
  }

  /**
   * Create thumbnail variations
   */
  public createThumbnails(
    publicId: string,
    sizes: Array<{ name: string; width: number; height: number; crop?: string }>
  ): Record<string, string> {
    const thumbnails: Record<string, string> = {};

    sizes.forEach(size => {
      const transformation: CloudinaryTransformation = {
        width: size.width,
        height: size.height,
        crop: (size.crop as CloudinaryTransformation['crop']) || 'fill',
        quality: 'auto',
        format: 'webp',
      };

      thumbnails[size.name] = cloudinaryConfig.buildUrl(publicId, [transformation]);
    });

    return thumbnails;
  }

  /**
   * Apply image effects
   */
  public applyEffects(
    publicId: string,
    effects: Array<{
      type: 'blur' | 'brightness' | 'contrast' | 'saturation' | 'gamma' | 'hue' | 'vibrance' | 'sharpen' | 'unsharp_mask';
      value?: number;
    }>
  ): string {
    const transformations: CloudinaryTransformation[] = effects.map(effect => ({
      effect: effect.value !== undefined ? `${effect.type}:${effect.value}` : effect.type,
    }));

    return cloudinaryConfig.buildUrl(publicId, transformations);
  }

  /**
   * Apply artistic filters
   */
  public applyArtisticFilters(
    publicId: string,
    filters: Array<'sepia' | 'grayscale' | 'blackwhite' | 'negate' | 'oil_paint' | 'vignette' | 'pixelate' | 'blur_region'>
  ): string {
    const transformations: CloudinaryTransformation[] = filters.map(filter => ({
      effect: filter,
    }));

    return cloudinaryConfig.buildUrl(publicId, transformations);
  }

  /**
   * Add watermark to image
   */
  public addWatermark(publicId: string, watermark: WatermarkOptions): string {
    const transformation: CloudinaryTransformation = {
      gravity: watermark.position || 'south_east',
      x: watermark.x || 10,
      y: watermark.y || 10,
      opacity: watermark.opacity || 70,
    };

    if (watermark.type === 'text') {
      const fontFamily = watermark.fontFamily || 'arial';
      const fontSize = watermark.fontSize || 30;
      const fontWeight = watermark.fontWeight || 'bold';
      const color = watermark.color || 'white';
      
      transformation.overlay = `text:${fontFamily}_${fontSize}_${fontWeight}:${encodeURIComponent(watermark.content)}`;
      transformation.color = color;
      
      if (watermark.backgroundColor) {
        transformation.background = watermark.backgroundColor;
      }
    } else {
      transformation.overlay = watermark.content;
    }

    if (watermark.rotation) {
      transformation.angle = watermark.rotation;
    }

    return cloudinaryConfig.buildUrl(publicId, [transformation]);
  }

  /**
   * Generate placeholder images
   */
  public generatePlaceholders(
    publicId: string
  ): {
    blur: string;
    pixelated: string;
    lowQuality: string;
    traced: string;
    solid: string;
  } {
    return {
      blur: cloudinaryConfig.buildUrl(publicId, [
        { width: 50, height: 50, crop: 'scale', quality: 30, effect: 'blur:1000' }
      ]),
      pixelated: cloudinaryConfig.buildUrl(publicId, [
        { width: 20, height: 20, crop: 'scale', effect: 'pixelate:20' }
      ]),
      lowQuality: cloudinaryConfig.buildUrl(publicId, [
        { width: 100, height: 100, crop: 'scale', quality: 10 }
      ]),
      traced: cloudinaryConfig.buildUrl(publicId, [
        { width: 200, height: 200, crop: 'scale', effect: 'vectorize:3:0.5' }
      ]),
      solid: cloudinaryConfig.buildUrl(publicId, [
        { width: 1, height: 1, crop: 'scale', effect: 'blur:2000' }
      ]),
    };
  }

  /**
   * Auto-enhance image
   */
  public autoEnhance(publicId: string, options: {
    autoColor?: boolean;
    autoContrast?: boolean;
    autoBrightness?: boolean;
    enhance?: boolean;
    improve?: boolean;
  } = {}): string {
    const effects: string[] = [];

    if (options.autoColor !== false) effects.push('auto_color');
    if (options.autoContrast !== false) effects.push('auto_contrast');
    if (options.autoBrightness !== false) effects.push('auto_brightness');
    if (options.enhance) effects.push('enhance');
    if (options.improve) effects.push('improve');

    const transformations: CloudinaryTransformation[] = effects.map(effect => ({ effect }));

    return cloudinaryConfig.buildUrl(publicId, transformations);
  }

  /**
   * Convert image format
   */
  public convertFormat(
    publicId: string,
    targetFormat: 'jpg' | 'png' | 'webp' | 'gif' | 'pdf' | 'svg',
    options: {
      quality?: 'auto' | number;
      progressive?: boolean;
      lossy?: boolean;
    } = {}
  ): string {
    const transformation: CloudinaryTransformation = {
      format: targetFormat,
      quality: options.quality || 'auto',
    };

    const flags: string[] = [];
    if (options.progressive && targetFormat === 'jpg') flags.push('progressive');
    if (options.lossy && targetFormat === 'webp') flags.push('lossy');
    if (flags.length > 0) transformation.flags = flags;

    return cloudinaryConfig.buildUrl(publicId, [transformation]);
  }

  /**
   * Process video
   */
  public processVideo(publicId: string, options: VideoProcessingOptions): string {
    const transformation: CloudinaryTransformation = {};

    if (options.width) transformation.width = options.width;
    if (options.height) transformation.height = options.height;
    if (options.crop) transformation.crop = options.crop;
    if (options.quality) transformation.quality = options.quality;
    if (options.format) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (transformation as any).format = options.format;
    }

    // Video-specific transformations
    const videoFlags: string[] = [];
    if (options.streaming) videoFlags.push('streaming_attachment');
    if (videoFlags.length > 0) transformation.flags = videoFlags;

    // Duration and timing
    if (options.duration) {
      transformation['duration'] = options.duration;
    }
    if (options.startOffset) {
      transformation['start_offset'] = options.startOffset;
    }
    if (options.endOffset) {
      transformation['end_offset'] = options.endOffset;
    }

    // Audio/Video codecs
    if (options.audioCodec) {
      transformation['audio_codec'] = options.audioCodec;
    }
    if (options.videoCodec) {
      transformation['video_codec'] = options.videoCodec;
    }

    // Bitrate and FPS
    if (options.bitRate) {
      transformation['bit_rate'] = options.bitRate;
    }
    if (options.fps) {
      transformation['fps'] = options.fps;
    }

    return cloudinaryConfig.buildUrl(publicId, [transformation]);
  }

  /**
   * Generate video thumbnail
   */
  public generateVideoThumbnail(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      crop?: string;
      time?: number; // seconds into video
      format?: 'jpg' | 'png' | 'webp';
      quality?: 'auto' | number;
    } = {}
  ): string {
    const transformation: CloudinaryTransformation = {
      resource_type: 'video',
      width: options.width || 400,
      height: options.height || 300,
      crop: (options.crop as CloudinaryTransformation['crop']) || 'fill',
      format: options.format || 'jpg',
      quality: options.quality || 'auto',
    };

    if (options.time) {
      transformation['start_offset'] = `${options.time}s`;
    }

    return cloudinaryConfig.buildUrl(publicId, [transformation]);
  }

  /**
   * Extract image metadata
   */
  public extractMetadata(uploadResponse: CloudinaryUploadResponse): ImageAnalysis {
    const analysis: ImageAnalysis = {};

    // Colors
    if (uploadResponse.colors) {
      analysis.predominantColors = uploadResponse.colors;
    }

    // Faces
    if (uploadResponse.faces) {
      analysis.faces = uploadResponse.faces.map(face => ({
        x: face[0],
        y: face[1],
        width: face[2],
        height: face[3],
      }));
    }

    // Quality analysis
    if (uploadResponse.quality_analysis) {
      analysis.quality = uploadResponse.quality_analysis;
    }

    // Accessibility analysis
    if (uploadResponse.accessibility_analysis) {
      const accessibility = uploadResponse.accessibility_analysis.colorblind_accessibility_analysis;
      analysis.accessibility = {
        distinctEdges: accessibility.distinct_edges,
        distinctColors: accessibility.distinct_colors,
        mostIndistinctPair: accessibility.most_indistinct_pair,
      };
    }

    // Tags
    if (uploadResponse.tags) {
      analysis.tags = uploadResponse.tags;
    }

    return analysis;
  }

  /**
   * Generate responsive image component props
   */
  public generateResponsiveProps(
    publicId: string,
    options: {
      sizes: string;
      breakpoints: number[];
      baseWidth?: number;
      baseHeight?: number;
      crop?: string;
      alt?: string;
      loading?: 'lazy' | 'eager';
    }
  ): {
    src: string;
    srcSet: string;
    sizes: string;
    alt: string;
    loading: 'lazy' | 'eager';
    width?: number;
    height?: number;
  } {
    const { sizes, breakpoints, baseWidth, baseHeight, crop = 'scale', alt = '', loading = 'lazy' } = options;

    // Generate main source
    const mainTransformation: CloudinaryTransformation = {
      width: baseWidth || Math.max(...breakpoints),
      height: baseHeight,
      crop: crop as CloudinaryTransformation['crop'],
      quality: 'auto',
      format: 'auto',
      fetch_format: 'auto',
    };

    const src = cloudinaryConfig.buildUrl(publicId, [mainTransformation]);

    // Generate srcset
    const srcSet = this.generateSrcset(publicId, {
      widths: breakpoints,
      transformation: {
        height: baseHeight,
        crop: crop as CloudinaryTransformation['crop'],
      },
    });

    return {
      src,
      srcSet,
      sizes,
      alt,
      loading,
      width: baseWidth,
      height: baseHeight,
    };
  }

  /**
   * Generate social media image variants
   */
  public generateSocialVariants(publicId: string): Record<string, string> {
    const presets = cloudinaryConfig.getPresetTransformations();

    return {
      facebook: cloudinaryConfig.buildUrl(publicId, [{ width: 1200, height: 630, crop: 'fill', quality: 'auto', format: 'jpg' }]),
      twitter: cloudinaryConfig.buildUrl(publicId, [{ width: 1200, height: 675, crop: 'fill', quality: 'auto', format: 'jpg' }]),
      instagram: cloudinaryConfig.buildUrl(publicId, [presets.socialSquare]),
      linkedin: cloudinaryConfig.buildUrl(publicId, [{ width: 1200, height: 627, crop: 'fill', quality: 'auto', format: 'jpg' }]),
      pinterest: cloudinaryConfig.buildUrl(publicId, [{ width: 735, height: 1102, crop: 'fill', quality: 'auto', format: 'jpg' }]),
      whatsapp: cloudinaryConfig.buildUrl(publicId, [{ width: 400, height: 400, crop: 'fill', quality: 'auto', format: 'jpg' }]),
    };
  }

  /**
   * Generate image for different device densities
   */
  public generateDensityVariants(
    publicId: string,
    baseWidth: number,
    baseHeight?: number
  ): {
    '1x': string;
    '2x': string;
    '3x': string;
  } {
    const baseTransformation: CloudinaryTransformation = {
      width: baseWidth,
      height: baseHeight,
      crop: 'scale',
      quality: 'auto',
      format: 'auto',
    };

    return {
      '1x': cloudinaryConfig.buildUrl(publicId, [{ ...baseTransformation, dpr: 1 }]),
      '2x': cloudinaryConfig.buildUrl(publicId, [{ ...baseTransformation, dpr: 2 }]),
      '3x': cloudinaryConfig.buildUrl(publicId, [{ ...baseTransformation, dpr: 3 }]),
    };
  }

  /**
   * Generate progressive image loading sequence
   */
  public generateProgressiveLoading(publicId: string, targetWidth: number, targetHeight?: number): {
    placeholder: string;
    lowQuality: string;
    mediumQuality: string;
    highQuality: string;
  } {
    const baseTransformation = {
      width: targetWidth,
      height: targetHeight,
      crop: 'scale' as const,
    };

    return {
      placeholder: cloudinaryConfig.buildUrl(publicId, [
        { ...baseTransformation, width: Math.min(targetWidth, 50), quality: 10, effect: 'blur:1000' }
      ]),
      lowQuality: cloudinaryConfig.buildUrl(publicId, [
        { ...baseTransformation, quality: 30 }
      ]),
      mediumQuality: cloudinaryConfig.buildUrl(publicId, [
        { ...baseTransformation, quality: 60 }
      ]),
      highQuality: cloudinaryConfig.buildUrl(publicId, [
        { ...baseTransformation, quality: 'auto' }
      ]),
    };
  }

  /**
   * Parse Cloudinary URL to get public ID and transformations
   */
  public parseCloudinaryUrl(url: string): {
    publicId: string;
    transformations: string[];
    resourceType: string;
    version?: string;
  } | null {
    const cloudName = cloudinaryConfig.getConfig().cloudName;
    const regex = new RegExp(`https://res\\.cloudinary\\.com/${cloudName}/(image|video|raw)/upload/(?:v(\\d+)/)?(?:([^/]+)/)?(.+)`);
    const match = url.match(regex);

    if (!match) return null;

    return {
      resourceType: match[1],
      version: match[2],
      transformations: match[3] ? match[3].split('/') : [],
      publicId: match[4],
    };
  }

  /**
   * Generate transformation string from object
   */
  public transformationToString(transformation: CloudinaryTransformation): string {
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
   * Get image dominant color
   */
  public getDominantColor(publicId: string): Promise<string> {
    return new Promise((resolve) => {
      const analysisUrl = cloudinaryConfig.buildUrl(publicId, [
        { width: 1, height: 1, crop: 'scale', flags: ['getinfo'] }
      ]);

      fetch(analysisUrl)
        .then(response => response.json())
        .then(data => {
          if (data.colors && data.colors.length > 0) {
            resolve(data.colors[0][0]);
          } else {
            resolve('#cccccc'); // fallback color
          }
        })
        .catch(() => {
          resolve('#cccccc'); // fallback color
        });
    });
  }

  /**
   * Generate image color palette
   */
  public generateColorPalette(publicId: string, maxColors = 5): Promise<string[]> {
    return new Promise((resolve) => {
      const analysisUrl = cloudinaryConfig.buildUrl(publicId, [
        { width: 1, height: 1, crop: 'scale', flags: ['getinfo'] }
      ]);

      fetch(analysisUrl)
        .then(response => response.json())
        .then(data => {
          if (data.colors) {
            const colors = data.colors
              .slice(0, maxColors)
              .map((color: [string, number]) => color[0]);
            resolve(colors);
          } else {
            resolve(['#cccccc']); // fallback colors
          }
        })
        .catch(() => {
          resolve(['#cccccc']); // fallback colors
        });
    });
  }

  /**
   * Generate SEO-optimized alt text from image analysis
   */
  public generateAltText(analysis: ImageAnalysis, context?: string): string {
    const parts: string[] = [];

    if (context) {
      parts.push(context);
    }

    if (analysis.tags && analysis.tags.length > 0) {
      const relevantTags = analysis.tags
        .filter(tag => !['image', 'photo', 'picture'].includes(tag.toLowerCase()))
        .slice(0, 3);
      parts.push(...relevantTags);
    }

    if (analysis.categories && analysis.categories.length > 0) {
      const topCategory = analysis.categories[0];
      if (topCategory.confidence > 0.7) {
        parts.push(topCategory.name);
      }
    }

    return parts.join(' ').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim() || 'Image';
  }

  /**
   * Utility to check if image needs optimization
   */
  public needsOptimization(
    currentUrl: string,
    targetWidth?: number
  ): boolean {
    const parsed = this.parseCloudinaryUrl(currentUrl);
    if (!parsed) return true;

    const hasQualityOpt = parsed.transformations.some(t => t.includes('q_auto'));
    const hasFormatOpt = parsed.transformations.some(t => t.includes('f_auto'));
    const hasSizeOpt = targetWidth ? parsed.transformations.some(t => t.includes(`w_${targetWidth}`)) : true;

    return !(hasQualityOpt && hasFormatOpt && hasSizeOpt);
  }
}

// Export singleton instance
export const cloudinaryUtils = CloudinaryUtils.getInstance();

/**
 * Utility functions for common use cases
 */
export const imageUtils = {
  /**
   * Get optimized product image
   */
  getProductImage: (publicId: string, size: 'small' | 'medium' | 'large' | 'zoom' = 'medium') => {
    const sizes = {
      small: { width: 200, height: 200 },
      medium: { width: 400, height: 400 },
      large: { width: 800, height: 800 },
      zoom: { width: 1200, height: 1200 },
    };

    return cloudinaryUtils.buildImageUrl(publicId, {
      ...sizes[size],
      crop: 'fill',
      quality: 'auto',
      format: 'webp',
      fetchFormat: 'auto',
    });
  },

  /**
   * Get user avatar
   */
  getUserAvatar: (publicId: string, size: 'small' | 'medium' | 'large' = 'medium') => {
    const sizes = {
      small: { width: 50, height: 50 },
      medium: { width: 100, height: 100 },
      large: { width: 200, height: 200 },
    };

    return cloudinaryUtils.buildImageUrl(publicId, {
      ...sizes[size],
      crop: 'fill',
      gravity: 'face',
      quality: 'auto',
      format: 'webp',
    });
  },

  /**
   * Get blog post featured image
   */
  getBlogImage: (publicId: string, size: 'thumbnail' | 'featured' | 'hero' = 'featured') => {
    const sizes = {
      thumbnail: { width: 300, height: 200 },
      featured: { width: 800, height: 400 },
      hero: { width: 1200, height: 600 },
    };

    return cloudinaryUtils.buildImageUrl(publicId, {
      ...sizes[size],
      crop: 'fill',
      quality: 'auto',
      format: 'webp',
    });
  },

  /**
   * Get gallery image with lazy loading placeholder
   */
  getGalleryImage: (publicId: string) => {
    return {
      full: cloudinaryUtils.buildImageUrl(publicId, {
        width: 1000,
        height: 600,
        crop: 'fill',
        quality: 'auto',
        format: 'webp',
      }),
      thumbnail: cloudinaryUtils.buildImageUrl(publicId, {
        width: 300,
        height: 200,
        crop: 'fill',
        quality: 'auto',
        format: 'webp',
      }),
      placeholder: cloudinaryUtils.buildImageUrl(publicId, {
        width: 50,
        height: 30,
        crop: 'fill',
        quality: 10,
        effect: 'blur:1000',
      }),
    };
  },

  /**
   * Generate responsive image props for Next.js Image component
   */
  getResponsiveProps: (
    publicId: string,
    alt: string,
    sizes: string = '100vw'
  ) => {
    return cloudinaryUtils.generateResponsiveProps(publicId, {
      sizes,
      breakpoints: [400, 600, 800, 1000, 1200, 1400],
      baseWidth: 1200,
      alt,
      loading: 'lazy',
    });
  },

  /**
   * Get social sharing image
   */
  getSocialImage: (publicId: string, platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin') => {
    const variants = cloudinaryUtils.generateSocialVariants(publicId);
    return variants[platform];
  },
};

/**
 * Video utility functions
 */
export const videoUtils = {
  /**
   * Get video thumbnail
   */
  getVideoThumbnail: (publicId: string, time = 0) => {
    return cloudinaryUtils.generateVideoThumbnail(publicId, {
      width: 640,
      height: 360,
      time,
      format: 'webp',
      quality: 'auto',
    });
  },

  /**
   * Get optimized video
   */
  getOptimizedVideo: (publicId: string, quality: 'low' | 'medium' | 'high' = 'medium') => {
    const qualities = {
      low: { width: 640, height: 360, quality: 40 },
      medium: { width: 1280, height: 720, quality: 60 },
      high: { width: 1920, height: 1080, quality: 80 },
    };

    return cloudinaryUtils.processVideo(publicId, {
      ...qualities[quality],
      format: 'mp4',
      crop: 'scale',
    });
  },

  /**
   * Get video with multiple formats for browser compatibility
   */
  getVideoFormats: (publicId: string) => {
    return {
      mp4: cloudinaryUtils.processVideo(publicId, { format: 'mp4', quality: 'auto' }),
      webm: cloudinaryUtils.processVideo(publicId, { format: 'webm', quality: 'auto' }),
      ogv: cloudinaryUtils.processVideo(publicId, { format: 'ogv', quality: 'auto' }),
    };
  },
};

export default CloudinaryUtils;