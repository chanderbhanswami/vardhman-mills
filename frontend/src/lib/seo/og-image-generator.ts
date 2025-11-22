/**
 * Open Graph Image Generator for Vardhman Mills Frontend
 * Generates dynamic OG images and social media graphics
 */

// Image generation interfaces
export interface OGImageOptions {
  title: string;
  subtitle?: string;
  description?: string;
  brand?: string;
  logo?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  template?: OGTemplate;
  dimensions?: ImageDimensions;
  format?: 'png' | 'jpg' | 'webp';
  quality?: number;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface OGTemplate {
  name: string;
  layout: 'standard' | 'hero' | 'minimal' | 'product' | 'article' | 'event';
  fontFamily?: string;
  fontSize?: {
    title: number;
    subtitle: number;
    description: number;
  };
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  logoPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  logoSize?: number;
}

export interface GeneratedImage {
  url: string;
  width: number;
  height: number;
  format: string;
  size: number;
  generatedAt: Date;
  cacheKey: string;
}

export interface SocialImageVariant {
  platform: 'facebook' | 'twitter' | 'linkedin' | 'instagram' | 'pinterest';
  dimensions: ImageDimensions;
  image: GeneratedImage;
}

export interface ImageGenerationResult {
  primary: GeneratedImage;
  variants: SocialImageVariant[];
  metadata: ImageMetadata;
}

export interface ImageMetadata {
  title: string;
  alt: string;
  tags: string[];
  generatedFor: string;
  template: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
  };
}

// Predefined templates
export const OG_TEMPLATES: Record<string, OGTemplate> = {
  standard: {
    name: 'Standard',
    layout: 'standard',
    fontFamily: 'Inter, sans-serif',
    fontSize: {
      title: 48,
      subtitle: 32,
      description: 24,
    },
    padding: {
      top: 60,
      right: 60,
      bottom: 60,
      left: 60,
    },
    logoPosition: 'top-left',
    logoSize: 80,
  },
  hero: {
    name: 'Hero',
    layout: 'hero',
    fontFamily: 'Inter, sans-serif',
    fontSize: {
      title: 56,
      subtitle: 36,
      description: 28,
    },
    padding: {
      top: 80,
      right: 80,
      bottom: 80,
      left: 80,
    },
    logoPosition: 'bottom-right',
    logoSize: 100,
  },
  minimal: {
    name: 'Minimal',
    layout: 'minimal',
    fontFamily: 'Inter, sans-serif',
    fontSize: {
      title: 42,
      subtitle: 28,
      description: 20,
    },
    padding: {
      top: 40,
      right: 40,
      bottom: 40,
      left: 40,
    },
    logoPosition: 'center',
    logoSize: 60,
  },
  product: {
    name: 'Product',
    layout: 'product',
    fontFamily: 'Inter, sans-serif',
    fontSize: {
      title: 44,
      subtitle: 30,
      description: 22,
    },
    padding: {
      top: 50,
      right: 50,
      bottom: 50,
      left: 50,
    },
    logoPosition: 'top-right',
    logoSize: 70,
  },
  article: {
    name: 'Article',
    layout: 'article',
    fontFamily: 'Inter, sans-serif',
    fontSize: {
      title: 40,
      subtitle: 26,
      description: 18,
    },
    padding: {
      top: 45,
      right: 45,
      bottom: 45,
      left: 45,
    },
    logoPosition: 'bottom-left',
    logoSize: 65,
  },
};

// Social platform dimensions
export const SOCIAL_DIMENSIONS: Record<string, ImageDimensions> = {
  'og:image': { width: 1200, height: 630 },
  'twitter:image': { width: 1200, height: 600 },
  'linkedin:image': { width: 1200, height: 627 },
  'facebook:image': { width: 1200, height: 630 },
  'instagram:image': { width: 1080, height: 1080 },
  'pinterest:image': { width: 1000, height: 1500 },
};

/**
 * Open Graph Image Generator Service
 */
export class OGImageGenerator {
  private static instance: OGImageGenerator;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private imageCache: Map<string, GeneratedImage> = new Map();

  private constructor() {
    this.initializeCanvas();
  }

  static getInstance(): OGImageGenerator {
    if (!OGImageGenerator.instance) {
      OGImageGenerator.instance = new OGImageGenerator();
    }
    return OGImageGenerator.instance;
  }

  /**
   * Generate Open Graph image
   */
  async generateOGImage(options: OGImageOptions): Promise<ImageGenerationResult> {
    const cacheKey = this.generateCacheKey(options);
    
    // Check cache first
    if (this.imageCache.has(cacheKey)) {
      const cachedImage = this.imageCache.get(cacheKey)!;
      return {
        primary: cachedImage,
        variants: await this.generateVariants(options),
        metadata: this.generateMetadata(options),
      };
    }

    const image = await this.createImage(options);
    this.imageCache.set(cacheKey, image);

    return {
      primary: image,
      variants: await this.generateVariants(options),
      metadata: this.generateMetadata(options),
    };
  }

  /**
   * Generate images for multiple social platforms
   */
  async generateSocialVariants(options: OGImageOptions): Promise<SocialImageVariant[]> {
    const variants: SocialImageVariant[] = [];
    const platforms: Array<keyof typeof SOCIAL_DIMENSIONS> = [
      'og:image',
      'twitter:image',
      'linkedin:image',
      'facebook:image',
    ];

    for (const platform of platforms) {
      const dimensions = SOCIAL_DIMENSIONS[platform];
      const variantOptions: OGImageOptions = {
        ...options,
        dimensions,
      };

      const image = await this.createImage(variantOptions);
      variants.push({
        platform: platform.split(':')[0] as SocialImageVariant['platform'],
        dimensions,
        image,
      });
    }

    return variants;
  }

  /**
   * Generate image from URL or page data
   */
  async generateFromPage(url: string, pageData?: Partial<OGImageOptions>): Promise<ImageGenerationResult> {
    let options: OGImageOptions;

    if (pageData) {
      options = {
        title: pageData.title || 'Vardhman Mills',
        subtitle: pageData.subtitle,
        description: pageData.description,
        brand: 'Vardhman Mills',
        ...pageData,
      };
    } else {
      // Extract page data from URL
      options = await this.extractPageData(url);
    }

    return this.generateOGImage(options);
  }

  /**
   * Generate batch images
   */
  async generateBatch(imageOptions: OGImageOptions[]): Promise<ImageGenerationResult[]> {
    const results = await Promise.all(
      imageOptions.map(options => this.generateOGImage(options))
    );
    return results;
  }

  /**
   * Get cached image
   */
  getCachedImage(cacheKey: string): GeneratedImage | null {
    return this.imageCache.get(cacheKey) || null;
  }

  /**
   * Clear image cache
   */
  clearCache(): void {
    this.imageCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.imageCache.size,
      keys: Array.from(this.imageCache.keys()),
    };
  }

  /**
   * Private methods
   */
  private initializeCanvas(): void {
    if (typeof document !== 'undefined') {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
    }
  }

  private async createImage(options: OGImageOptions): Promise<GeneratedImage> {
    if (!this.canvas || !this.ctx) {
      throw new Error('Canvas not initialized');
    }

    const dimensions = options.dimensions || SOCIAL_DIMENSIONS['og:image'];
    const template = options.template || OG_TEMPLATES.standard;

    // Set canvas dimensions
    this.canvas.width = dimensions.width;
    this.canvas.height = dimensions.height;

    // Clear canvas
    this.ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Draw background
    await this.drawBackground(options);

    // Draw content based on template
    await this.drawContent(options, template);

    // Draw logo if provided
    if (options.logo) {
      await this.drawLogo(options.logo, template);
    }

    // Convert to image
    const dataUrl = this.canvas.toDataURL(`image/${options.format || 'png'}`, options.quality || 0.9);
    const blob = await this.dataUrlToBlob(dataUrl);

    return {
      url: dataUrl,
      width: dimensions.width,
      height: dimensions.height,
      format: options.format || 'png',
      size: blob.size,
      generatedAt: new Date(),
      cacheKey: this.generateCacheKey(options),
    };
  }

  private async drawBackground(options: OGImageOptions): Promise<void> {
    if (!this.ctx || !this.canvas) return;

    if (options.backgroundImage) {
      // Draw background image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      return new Promise((resolve) => {
        img.onload = () => {
          this.ctx!.drawImage(img, 0, 0, this.canvas!.width, this.canvas!.height);
          
          // Add overlay if needed
          if (options.backgroundColor) {
            this.ctx!.fillStyle = options.backgroundColor;
            this.ctx!.globalAlpha = 0.7;
            this.ctx!.fillRect(0, 0, this.canvas!.width, this.canvas!.height);
            this.ctx!.globalAlpha = 1;
          }
          resolve();
        };
        img.onerror = () => {
          // Fallback to solid color
          this.drawSolidBackground(options.backgroundColor || '#ffffff');
          resolve();
        };
        img.src = options.backgroundImage!;
      });
    } else {
      // Draw solid background
      this.drawSolidBackground(options.backgroundColor || '#ffffff');
    }
  }

  private drawSolidBackground(color: string): void {
    if (!this.ctx || !this.canvas) return;

    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private async drawContent(options: OGImageOptions, template: OGTemplate): Promise<void> {
    if (!this.ctx || !this.canvas) return;

    const padding = template.padding || { top: 60, right: 60, bottom: 60, left: 60 };
    const textColor = options.textColor || '#000000';
    const accentColor = options.accentColor || '#007bff';

    // Calculate content area
    const contentWidth = this.canvas.width - padding.left - padding.right;
    let currentY = padding.top;

    // Set font properties
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';

    // Draw title
    if (options.title) {
      this.ctx.fillStyle = textColor;
      this.ctx.font = `bold ${template.fontSize?.title || 48}px ${template.fontFamily || 'Arial, sans-serif'}`;
      
      const titleLines = this.wrapText(options.title, contentWidth, template.fontSize?.title || 48);
      titleLines.forEach((line) => {
        this.ctx!.fillText(line, padding.left, currentY);
        currentY += (template.fontSize?.title || 48) * 1.2;
      });
      
      currentY += 20; // Space after title
    }

    // Draw subtitle
    if (options.subtitle) {
      this.ctx.fillStyle = accentColor;
      this.ctx.font = `${template.fontSize?.subtitle || 32}px ${template.fontFamily || 'Arial, sans-serif'}`;
      
      const subtitleLines = this.wrapText(options.subtitle, contentWidth, template.fontSize?.subtitle || 32);
      subtitleLines.forEach((line) => {
        this.ctx!.fillText(line, padding.left, currentY);
        currentY += (template.fontSize?.subtitle || 32) * 1.2;
      });
      
      currentY += 15; // Space after subtitle
    }

    // Draw description
    if (options.description && currentY < this.canvas.height - padding.bottom - 100) {
      this.ctx.fillStyle = textColor;
      this.ctx.globalAlpha = 0.8;
      this.ctx.font = `${template.fontSize?.description || 24}px ${template.fontFamily || 'Arial, sans-serif'}`;
      
      const descriptionLines = this.wrapText(options.description, contentWidth, template.fontSize?.description || 24);
      const maxDescriptionLines = Math.floor((this.canvas.height - currentY - padding.bottom - 50) / ((template.fontSize?.description || 24) * 1.2));
      
      descriptionLines.slice(0, maxDescriptionLines).forEach((line) => {
        this.ctx!.fillText(line, padding.left, currentY);
        currentY += (template.fontSize?.description || 24) * 1.2;
      });
      
      this.ctx.globalAlpha = 1;
    }

    // Draw brand
    if (options.brand && template.layout !== 'minimal') {
      this.ctx.fillStyle = textColor;
      this.ctx.globalAlpha = 0.6;
      this.ctx.font = `20px ${template.fontFamily || 'Arial, sans-serif'}`;
      this.ctx.textAlign = 'right';
      this.ctx.fillText(options.brand, this.canvas.width - padding.right, this.canvas.height - padding.bottom - 25);
      this.ctx.globalAlpha = 1;
      this.ctx.textAlign = 'left';
    }
  }

  private async drawLogo(logoUrl: string, template: OGTemplate): Promise<void> {
    if (!this.ctx || !this.canvas) return;

    const logoSize = template.logoSize || 80;
    const img = new Image();
    img.crossOrigin = 'anonymous';

    return new Promise((resolve) => {
      img.onload = () => {
        let x: number, y: number;

        // Position logo based on template
        switch (template.logoPosition) {
          case 'top-left':
            x = 40;
            y = 40;
            break;
          case 'top-right':
            x = this.canvas!.width - logoSize - 40;
            y = 40;
            break;
          case 'bottom-left':
            x = 40;
            y = this.canvas!.height - logoSize - 40;
            break;
          case 'bottom-right':
            x = this.canvas!.width - logoSize - 40;
            y = this.canvas!.height - logoSize - 40;
            break;
          case 'center':
          default:
            x = (this.canvas!.width - logoSize) / 2;
            y = (this.canvas!.height - logoSize) / 2;
            break;
        }

        this.ctx!.drawImage(img, x, y, logoSize, logoSize);
        resolve();
      };
      img.onerror = () => resolve(); // Continue without logo if it fails to load
      img.src = logoUrl;
    });
  }

  private wrapText(text: string, maxWidth: number, fontSize: number): string[] {
    if (!this.ctx) return [text];

    // Set font size for accurate text measurement
    this.ctx.font = `${fontSize}px Inter, sans-serif`;

    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = this.ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  private async generateVariants(options: OGImageOptions): Promise<SocialImageVariant[]> {
    // Generate common social media variants
    return this.generateSocialVariants(options);
  }

  private generateMetadata(options: OGImageOptions): ImageMetadata {
    return {
      title: options.title,
      alt: `${options.title} - ${options.brand || 'Vardhman Mills'}`,
      tags: [
        'og-image',
        'social-media',
        options.template?.name.toLowerCase() || 'standard',
      ],
      generatedFor: options.brand || 'Vardhman Mills',
      template: options.template?.name || 'Standard',
      colors: {
        primary: options.textColor || '#000000',
        secondary: options.accentColor || '#007bff',
        background: options.backgroundColor || '#ffffff',
      },
    };
  }

  private generateCacheKey(options: OGImageOptions): string {
    const keyData = {
      title: options.title,
      subtitle: options.subtitle,
      description: options.description,
      template: options.template?.name,
      dimensions: options.dimensions,
      colors: {
        bg: options.backgroundColor,
        text: options.textColor,
        accent: options.accentColor,
      },
    };
    
    return btoa(JSON.stringify(keyData)).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  }

  private async extractPageData(url: string): Promise<OGImageOptions> {
    // In a real implementation, this would fetch and parse the page
    // For now, return default options based on URL
    const isProductPage = url.includes('/product');
    const isAboutPage = url.includes('/about');
    
    return {
      title: isProductPage ? 'Our Products' : isAboutPage ? 'About Us' : 'Vardhman Mills',
      subtitle: 'Excellence in Textiles',
      description: 'Leading manufacturer of premium textile products',
      brand: 'Vardhman Mills',
      backgroundColor: '#f8f9fa',
      textColor: '#212529',
      accentColor: '#007bff',
      template: isProductPage ? OG_TEMPLATES.product : OG_TEMPLATES.standard,
    };
  }

  private async dataUrlToBlob(dataUrl: string): Promise<Blob> {
    const response = await fetch(dataUrl);
    return response.blob();
  }
}

// Utility functions
export const OGImageUtils = {
  /**
   * Generate meta tags for generated images
   */
  generateMetaTags: (result: ImageGenerationResult): Record<string, string> => {
    const tags: Record<string, string> = {
      'og:image': result.primary.url,
      'og:image:width': result.primary.width.toString(),
      'og:image:height': result.primary.height.toString(),
      'og:image:alt': result.metadata.alt,
      'og:image:type': `image/${result.primary.format}`,
    };

    // Add platform-specific variants
    result.variants.forEach(variant => {
      const platform = variant.platform;
      tags[`${platform}:image`] = variant.image.url;
      tags[`${platform}:image:width`] = variant.image.width.toString();
      tags[`${platform}:image:height`] = variant.image.height.toString();
    });

    return tags;
  },

  /**
   * Validate image dimensions
   */
  validateDimensions: (dimensions: ImageDimensions, platform?: string): boolean => {
    if (platform && SOCIAL_DIMENSIONS[`${platform}:image`]) {
      const required = SOCIAL_DIMENSIONS[`${platform}:image`];
      return dimensions.width === required.width && dimensions.height === required.height;
    }

    // General validation
    return dimensions.width >= 600 && 
           dimensions.height >= 315 && 
           dimensions.width <= 2400 && 
           dimensions.height <= 1260;
  },

  /**
   * Get recommended dimensions for platform
   */
  getRecommendedDimensions: (platform: string): ImageDimensions => {
    return SOCIAL_DIMENSIONS[`${platform}:image`] || SOCIAL_DIMENSIONS['og:image'];
  },

  /**
   * Calculate aspect ratio
   */
  calculateAspectRatio: (dimensions: ImageDimensions): number => {
    return dimensions.width / dimensions.height;
  },

  /**
   * Generate image filename
   */
  generateFilename: (options: OGImageOptions): string => {
    const slug = options.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    const timestamp = Date.now();
    const format = options.format || 'png';
    
    return `og-${slug}-${timestamp}.${format}`;
  },
};

// Export singleton instance
export const ogImageGenerator = OGImageGenerator.getInstance();

export default OGImageGenerator;