/**
 * Image Utilities for Vardhman Mills Frontend
 * Comprehensive image processing and manipulation utilities
 */

// Image processing options interface
export interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number; // 0-1
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  resize?: {
    mode: 'contain' | 'cover' | 'fill' | 'inside' | 'outside';
    background?: string;
  };
  filters?: ImageFilter[];
  watermark?: {
    image: string | HTMLImageElement;
    position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    opacity?: number;
    scale?: number;
  };
  rotation?: number; // in degrees
  flip?: 'horizontal' | 'vertical' | 'both';
  blur?: number;
  brightness?: number; // -100 to 100
  contrast?: number; // -100 to 100
  saturation?: number; // -100 to 100
  hue?: number; // 0-360
  grayscale?: boolean;
  sepia?: boolean;
  invert?: boolean;
  pixelate?: number;
  noise?: number;
  vignette?: {
    strength: number;
    radius: number;
  };
}

// Image filter interface
export interface ImageFilter {
  type: 'blur' | 'sharpen' | 'emboss' | 'edge' | 'vintage' | 'lomo' | 'clarity';
  strength?: number;
}

// Image metadata interface
export interface ImageMetadata {
  width: number;
  height: number;
  aspectRatio: number;
  format: string;
  size: number;
  colorDepth: number;
  hasAlpha: boolean;
  dominantColors: string[];
  brightness: number;
  contrast: number;
  sharpness: number;
  exifData?: ExifData;
  histogram?: {
    red: number[];
    green: number[];
    blue: number[];
    alpha: number[];
  };
}

// EXIF data interface
export interface ExifData {
  make?: string;
  model?: string;
  dateTime?: string;
  orientation?: number;
  xResolution?: number;
  yResolution?: number;
  resolutionUnit?: number;
  software?: string;
  artist?: string;
  copyright?: string;
  exposureTime?: number;
  fNumber?: number;
  iso?: number;
  focalLength?: number;
  flash?: boolean;
  whiteBalance?: string;
  gps?: {
    latitude?: number;
    longitude?: number;
    altitude?: number;
  };
}

// Color analysis result interface
export interface ColorAnalysisResult {
  dominantColors: Array<{
    color: string;
    percentage: number;
    rgb: [number, number, number];
    hsl: [number, number, number];
  }>;
  averageColor: {
    color: string;
    rgb: [number, number, number];
    hsl: [number, number, number];
  };
  brightness: number;
  contrast: number;
  colorfulness: number;
  temperature: 'warm' | 'cool' | 'neutral';
  palette: string[];
}

// Image optimization result interface
export interface ImageOptimizationResult {
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  quality: number;
  format: string;
  blob: Blob;
  dataUrl: string;
  processingTime: number;
}

// Thumbnail generation options
export interface ThumbnailOptions {
  width: number;
  height: number;
  crop?: boolean;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  background?: string;
}

// Responsive image set options
export interface ResponsiveImageOptions {
  breakpoints: number[];
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  retina?: boolean;
}

// Responsive image set result
export interface ResponsiveImageSet {
  images: Array<{
    width: number;
    url: string;
    size: number;
  }>;
  srcset: string;
  sizes: string;
  fallback: string;
}

// Default processing options
export const DEFAULT_PROCESSING_OPTIONS: Partial<ImageProcessingOptions> = {
  quality: 0.8,
  format: 'jpeg',
  resize: {
    mode: 'contain',
    background: '#ffffff',
  },
  rotation: 0,
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
  grayscale: false,
  sepia: false,
  invert: false,
};

/**
 * Image Processing Service
 */
export class ImageProcessor {
  private static instance: ImageProcessor;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  static getInstance(): ImageProcessor {
    if (!ImageProcessor.instance) {
      ImageProcessor.instance = new ImageProcessor();
    }
    return ImageProcessor.instance;
  }

  /**
   * Process image with given options
   */
  async processImage(
    input: File | HTMLImageElement | ImageData | string,
    options: ImageProcessingOptions = {}
  ): Promise<ImageOptimizationResult> {
    const startTime = performance.now();
    const opts = { ...DEFAULT_PROCESSING_OPTIONS, ...options };

    // Load image
    const img = await this.loadImage(input);
    const originalSize = input instanceof File ? input.size : 0;

    // Set canvas dimensions
    const { width, height } = this.calculateDimensions(img, opts);
    this.canvas.width = width;
    this.canvas.height = height;

    // Clear canvas
    this.ctx.clearRect(0, 0, width, height);

    // Apply background if needed
    if (opts.resize?.background && opts.format !== 'png') {
      this.ctx.fillStyle = opts.resize.background;
      this.ctx.fillRect(0, 0, width, height);
    }

    // Apply transformations
    this.ctx.save();
    this.applyTransformations(img, opts, width, height);
    this.ctx.restore();

    // Apply filters
    if (opts.filters && opts.filters.length > 0) {
      await this.applyFilters(opts.filters);
    }

    // Apply post-processing effects
    await this.applyEffects(opts);

    // Apply watermark
    if (opts.watermark) {
      await this.applyWatermark(opts.watermark);
    }

    // Generate output
    const blob = await this.canvasToBlob(opts.format!, opts.quality!);
    const dataUrl = this.canvas.toDataURL(`image/${opts.format}`, opts.quality);
    const processingTime = performance.now() - startTime;

    return {
      originalSize,
      optimizedSize: blob.size,
      compressionRatio: originalSize > 0 ? blob.size / originalSize : 1,
      quality: opts.quality!,
      format: opts.format!,
      blob,
      dataUrl,
      processingTime,
    };
  }

  /**
   * Generate thumbnails
   */
  async generateThumbnail(
    input: File | HTMLImageElement | string,
    options: ThumbnailOptions
  ): Promise<Blob> {
    const processOptions: ImageProcessingOptions = {
      width: options.width,
      height: options.height,
      quality: options.quality || 0.8,
      format: options.format || 'jpeg',
      resize: {
        mode: options.crop ? 'cover' : 'contain',
        background: options.background || '#ffffff',
      },
    };

    const result = await this.processImage(input, processOptions);
    return result.blob;
  }

  /**
   * Generate responsive image set
   */
  async generateResponsiveSet(
    input: File | HTMLImageElement | string,
    options: ResponsiveImageOptions
  ): Promise<ResponsiveImageSet> {
    const img = await this.loadImage(input);
    const images: ResponsiveImageSet['images'] = [];
    const baseWidth = img.width;

    for (const breakpoint of options.breakpoints) {
      if (breakpoint <= baseWidth) {
        const processOptions: ImageProcessingOptions = {
          width: breakpoint,
          quality: options.quality || 0.8,
          format: options.format || 'jpeg',
          resize: { mode: 'contain' },
        };

        const result = await this.processImage(input, processOptions);
        const dataUrl = URL.createObjectURL(result.blob);

        images.push({
          width: breakpoint,
          url: dataUrl,
          size: result.optimizedSize,
        });

        // Generate retina version if enabled
        if (options.retina && breakpoint * 2 <= baseWidth) {
          const retinaOptions: ImageProcessingOptions = {
            width: breakpoint * 2,
            quality: options.quality || 0.8,
            format: options.format || 'jpeg',
            resize: { mode: 'contain' },
          };

          const retinaResult = await this.processImage(input, retinaOptions);
          const retinaDataUrl = URL.createObjectURL(retinaResult.blob);

          images.push({
            width: breakpoint * 2,
            url: retinaDataUrl,
            size: retinaResult.optimizedSize,
          });
        }
      }
    }

    // Sort by width
    images.sort((a, b) => a.width - b.width);

    // Generate srcset
    const srcset = images.map(img => `${img.url} ${img.width}w`).join(', ');

    // Generate sizes attribute
    const sizes = options.breakpoints
      .map((bp, index) => {
        if (index === options.breakpoints.length - 1) {
          return `${bp}px`;
        }
        return `(max-width: ${bp}px) ${bp}px`;
      })
      .join(', ');

    return {
      images,
      srcset,
      sizes,
      fallback: images[Math.floor(images.length / 2)]?.url || images[0]?.url || '',
    };
  }

  /**
   * Analyze image colors
   */
  async analyzeColors(input: File | HTMLImageElement | string): Promise<ColorAnalysisResult> {
    const img = await this.loadImage(input);
    
    // Set canvas to small size for performance
    const analysisSize = 100;
    this.canvas.width = analysisSize;
    this.canvas.height = analysisSize;
    
    this.ctx.drawImage(img, 0, 0, analysisSize, analysisSize);
    const imageData = this.ctx.getImageData(0, 0, analysisSize, analysisSize);
    const pixels = imageData.data;

    // Analyze colors
    const colorMap = new Map<string, number>();
    let totalR = 0, totalG = 0, totalB = 0;
    let brightness = 0;
    let pixelCount = 0;

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];

      if (a > 0) { // Skip transparent pixels
        const color = `rgb(${r},${g},${b})`;
        colorMap.set(color, (colorMap.get(color) || 0) + 1);

        totalR += r;
        totalG += g;
        totalB += b;
        brightness += (r * 0.299 + g * 0.587 + b * 0.114);
        pixelCount++;
      }
    }

    // Calculate average color
    const avgR = Math.round(totalR / pixelCount);
    const avgG = Math.round(totalG / pixelCount);
    const avgB = Math.round(totalB / pixelCount);
    const avgBrightness = brightness / pixelCount;

    // Get dominant colors
    const sortedColors = Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const dominantColors = sortedColors.map(([color, count]) => {
      const [r, g, b] = color.match(/\d+/g)!.map(Number);
      const percentage = (count / pixelCount) * 100;
      const hsl = this.rgbToHsl(r, g, b);

      return {
        color,
        percentage,
        rgb: [r, g, b] as [number, number, number],
        hsl: hsl as [number, number, number],
      };
    });

    // Determine temperature
    const temperature = avgR > avgB ? 'warm' : avgB > avgR ? 'cool' : 'neutral';

    // Generate palette
    const palette = dominantColors.map(c => c.color);

    // Calculate colorfulness
    const colorfulness = this.calculateColorfulness(dominantColors);

    return {
      dominantColors,
      averageColor: {
        color: `rgb(${avgR},${avgG},${avgB})`,
        rgb: [avgR, avgG, avgB],
        hsl: this.rgbToHsl(avgR, avgG, avgB) as [number, number, number],
      },
      brightness: avgBrightness,
      contrast: this.calculateContrast(dominantColors),
      colorfulness,
      temperature,
      palette,
    };
  }

  /**
   * Extract image metadata
   */
  async extractMetadata(input: File | HTMLImageElement | string): Promise<ImageMetadata> {
    const img = await this.loadImage(input);
    const colorAnalysis = await this.analyzeColors(img);

    // Set canvas for analysis
    this.canvas.width = img.width;
    this.canvas.height = img.height;
    this.ctx.drawImage(img, 0, 0);

    const imageData = this.ctx.getImageData(0, 0, img.width, img.height);
    const pixels = imageData.data;

    // Check for alpha channel
    let hasAlpha = false;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 255) {
        hasAlpha = true;
        break;
      }
    }

    // Calculate histogram
    const histogram = {
      red: new Array(256).fill(0),
      green: new Array(256).fill(0),
      blue: new Array(256).fill(0),
      alpha: new Array(256).fill(0),
    };

    for (let i = 0; i < pixels.length; i += 4) {
      histogram.red[pixels[i]]++;
      histogram.green[pixels[i + 1]]++;
      histogram.blue[pixels[i + 2]]++;
      histogram.alpha[pixels[i + 3]]++;
    }

    // Calculate sharpness (edge detection)
    const sharpness = this.calculateSharpness(imageData);

    // Extract EXIF data if input is a File
    let exifData: ExifData | undefined;
    if (input instanceof File) {
      try {
        exifData = await this.extractExifData(input);
      } catch (error) {
        console.warn('Failed to extract EXIF data:', error);
      }
    }

    return {
      width: img.width,
      height: img.height,
      aspectRatio: img.width / img.height,
      format: input instanceof File ? input.type.split('/')[1] : 'unknown',
      size: input instanceof File ? input.size : 0,
      colorDepth: hasAlpha ? 32 : 24,
      hasAlpha,
      dominantColors: colorAnalysis.palette,
      brightness: colorAnalysis.brightness,
      contrast: colorAnalysis.contrast,
      sharpness,
      exifData,
      histogram,
    };
  }

  /**
   * Optimize image for web
   */
  async optimizeForWeb(
    input: File | HTMLImageElement | string,
    targetSize?: number
  ): Promise<ImageOptimizationResult> {
    const img = await this.loadImage(input);
    let quality = 0.8;
    let format: 'jpeg' | 'webp' | 'avif' = 'jpeg';

    // Determine best format
    if (this.supportsWebP()) {
      format = 'webp';
    }
    if (this.supportsAVIF()) {
      format = 'avif';
    }

    // Calculate optimal dimensions
    const maxWidth = 1920;
    const maxHeight = 1080;
    let { width, height } = img;

    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    // Optimize quality based on target size
    if (targetSize) {
      const iterations = 5;
      for (let i = 0; i < iterations; i++) {
        const result = await this.processImage(input, {
          width,
          height,
          quality,
          format,
          resize: { mode: 'contain' },
        });

        if (result.optimizedSize <= targetSize || quality <= 0.1) {
          break;
        }

        quality *= 0.8;
      }
    }

    return this.processImage(input, {
      width,
      height,
      quality,
      format,
      resize: { mode: 'contain' },
    });
  }

  /**
   * Private helper methods
   */
  private async loadImage(input: File | HTMLImageElement | ImageData | string): Promise<HTMLImageElement> {
    if (input instanceof HTMLImageElement) {
      return input;
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));

      if (input instanceof File) {
        img.src = URL.createObjectURL(input);
      } else if (typeof input === 'string') {
        img.src = input;
      } else if (input instanceof ImageData) {
        // Convert ImageData to canvas then to data URL
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d')!;
        tempCanvas.width = input.width;
        tempCanvas.height = input.height;
        tempCtx.putImageData(input, 0, 0);
        img.src = tempCanvas.toDataURL();
      }
    });
  }

  private calculateDimensions(
    img: HTMLImageElement,
    options: ImageProcessingOptions
  ): { width: number; height: number } {
    let { width = img.width, height = img.height } = options;

    if (options.width && !options.height) {
      height = (img.height * options.width) / img.width;
    } else if (options.height && !options.width) {
      width = (img.width * options.height) / img.height;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  private applyTransformations(
    img: HTMLImageElement,
    options: ImageProcessingOptions,
    canvasWidth: number,
    canvasHeight: number
  ): void {
    const { rotation = 0, flip } = options;

    // Apply rotation
    if (rotation !== 0) {
      this.ctx.translate(canvasWidth / 2, canvasHeight / 2);
      this.ctx.rotate((rotation * Math.PI) / 180);
      this.ctx.translate(-canvasWidth / 2, -canvasHeight / 2);
    }

    // Apply flip
    if (flip) {
      let scaleX = 1;
      let scaleY = 1;
      let translateX = 0;
      let translateY = 0;

      if (flip === 'horizontal' || flip === 'both') {
        scaleX = -1;
        translateX = canvasWidth;
      }

      if (flip === 'vertical' || flip === 'both') {
        scaleY = -1;
        translateY = canvasHeight;
      }

      this.ctx.scale(scaleX, scaleY);
      this.ctx.translate(translateX, translateY);
    }

    // Draw image
    if (options.crop) {
      const { x, y, width, height } = options.crop;
      this.ctx.drawImage(
        img,
        x, y, width, height,
        0, 0, canvasWidth, canvasHeight
      );
    } else {
      this.ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
    }
  }

  private async applyFilters(filters: ImageFilter[]): Promise<void> {
    for (const filter of filters) {
      await this.applyFilter(filter);
    }
  }

  private async applyFilter(filter: ImageFilter): Promise<void> {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const pixels = imageData.data;

    const strength = filter.strength || 1;

    switch (filter.type) {
      case 'blur':
        this.applyBlurFilter(pixels, this.canvas.width, this.canvas.height, strength);
        break;
      case 'sharpen':
        this.applySharpenFilter(pixels, this.canvas.width, this.canvas.height, strength);
        break;
      case 'emboss':
        this.applyEmbossFilter(pixels, this.canvas.width, this.canvas.height);
        break;
      case 'edge':
        this.applyEdgeFilter(pixels, this.canvas.width, this.canvas.height);
        break;
      case 'vintage':
        this.applyVintageFilter(pixels);
        break;
      case 'lomo':
        this.applyLomoFilter(pixels);
        break;
      case 'clarity':
        this.applyClarityFilter(pixels, strength);
        break;
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  private async applyEffects(options: ImageProcessingOptions): Promise<void> {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const pixels = imageData.data;

    // Apply color adjustments
    if (options.brightness !== 0 || options.contrast !== 0 || options.saturation !== 0 || options.hue !== 0) {
      this.applyColorAdjustments(pixels, options);
    }

    // Apply grayscale
    if (options.grayscale) {
      this.applyGrayscale(pixels);
    }

    // Apply sepia
    if (options.sepia) {
      this.applySepia(pixels);
    }

    // Apply invert
    if (options.invert) {
      this.applyInvert(pixels);
    }

    // Apply pixelate
    if (options.pixelate && options.pixelate > 1) {
      this.applyPixelate(options.pixelate);
      return; // Pixelate replaces the image data
    }

    // Apply noise
    if (options.noise && options.noise > 0) {
      this.applyNoise(pixels, options.noise);
    }

    // Apply vignette
    if (options.vignette) {
      this.applyVignette(pixels, options.vignette);
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  private async applyWatermark(watermark: NonNullable<ImageProcessingOptions['watermark']>): Promise<void> {
    let watermarkImg: HTMLImageElement;

    if (typeof watermark.image === 'string') {
      watermarkImg = await this.loadImage(watermark.image);
    } else {
      watermarkImg = watermark.image;
    }

    const scale = watermark.scale || 0.2;
    const opacity = watermark.opacity || 0.5;
    const wmWidth = watermarkImg.width * scale;
    const wmHeight = watermarkImg.height * scale;

    // Calculate position
    let x: number, y: number;
    const margin = 20;

    switch (watermark.position) {
      case 'top-left':
        x = margin;
        y = margin;
        break;
      case 'top-right':
        x = this.canvas.width - wmWidth - margin;
        y = margin;
        break;
      case 'bottom-left':
        x = margin;
        y = this.canvas.height - wmHeight - margin;
        break;
      case 'bottom-right':
        x = this.canvas.width - wmWidth - margin;
        y = this.canvas.height - wmHeight - margin;
        break;
      case 'center':
      default:
        x = (this.canvas.width - wmWidth) / 2;
        y = (this.canvas.height - wmHeight) / 2;
        break;
    }

    // Apply watermark
    this.ctx.save();
    this.ctx.globalAlpha = opacity;
    this.ctx.drawImage(watermarkImg, x, y, wmWidth, wmHeight);
    this.ctx.restore();
  }

  private async canvasToBlob(format: string, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      this.canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        },
        `image/${format}`,
        quality
      );
    });
  }

  // Color utility methods
  private rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h: number, s: number;

    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }

      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  }

  private calculateColorfulness(colors: ColorAnalysisResult['dominantColors']): number {
    if (colors.length === 0) return 0;

    const variance = colors.reduce((sum, color) => {
      const [r, g, b] = color.rgb;
      const avg = (r + g + b) / 3;
      const colorVariance = Math.pow(r - avg, 2) + Math.pow(g - avg, 2) + Math.pow(b - avg, 2);
      return sum + colorVariance * color.percentage;
    }, 0) / 100;

    return Math.min(100, Math.sqrt(variance) / 100 * 100);
  }

  private calculateContrast(colors: ColorAnalysisResult['dominantColors']): number {
    if (colors.length < 2) return 0;

    let maxContrast = 0;
    for (let i = 0; i < colors.length - 1; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        const contrast = this.getContrastRatio(colors[i].rgb, colors[j].rgb);
        maxContrast = Math.max(maxContrast, contrast);
      }
    }

    return Math.min(100, (maxContrast - 1) * 25);
  }

  private getContrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
    const luminance1 = this.getLuminance(rgb1);
    const luminance2 = this.getLuminance(rgb2);
    const brighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    return (brighter + 0.05) / (darker + 0.05);
  }

  private getLuminance([r, g, b]: [number, number, number]): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  private calculateSharpness(imageData: ImageData): number {
    const pixels = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    let sharpness = 0;

    // Sobel edge detection
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        // Get surrounding pixels for edge detection
        
        // Get surrounding pixels
        const tl = pixels[((y-1) * width + (x-1)) * 4];
        const tm = pixels[((y-1) * width + x) * 4];
        const tr = pixels[((y-1) * width + (x+1)) * 4];
        const ml = pixels[(y * width + (x-1)) * 4];
        const mr = pixels[(y * width + (x+1)) * 4];
        const bl = pixels[((y+1) * width + (x-1)) * 4];
        const bm = pixels[((y+1) * width + x) * 4];
        const br = pixels[((y+1) * width + (x+1)) * 4];

        // Sobel X and Y
        const sobelX = (tr + 2 * mr + br) - (tl + 2 * ml + bl);
        const sobelY = (bl + 2 * bm + br) - (tl + 2 * tm + tr);
        
        sharpness += Math.sqrt(sobelX * sobelX + sobelY * sobelY);
      }
    }

    return sharpness / (width * height);
  }

  private async extractExifData(file: File): Promise<ExifData> {
    // This is a placeholder for EXIF extraction
    // In a real implementation, you would use a library like exif-js or piexifjs
    return {
      dateTime: new Date(file.lastModified).toISOString(),
    };
  }

  private supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  private supportsAVIF(): boolean {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
  }

  // Filter implementations (simplified versions)
  private applyBlurFilter(pixels: Uint8ClampedArray, width: number, height: number, strength: number): void {
    // Simple box blur implementation
    // Apply basic blur effect by averaging neighboring pixels
    const radius = Math.max(1, Math.floor(strength * 3));
    const tempPixels = new Uint8ClampedArray(pixels);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0, count = 0;
        
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const ny = y + dy;
            const nx = x + dx;
            
            if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
              const idx = (ny * width + nx) * 4;
              r += tempPixels[idx];
              g += tempPixels[idx + 1];
              b += tempPixels[idx + 2];
              count++;
            }
          }
        }
        
        const idx = (y * width + x) * 4;
        pixels[idx] = r / count;
        pixels[idx + 1] = g / count;
        pixels[idx + 2] = b / count;
      }
    }
  }

  private applySharpenFilter(pixels: Uint8ClampedArray, width: number, height: number, strength: number): void {
    // Unsharp mask implementation - simplified version
    const factor = 1 + strength;
    const tempPixels = new Uint8ClampedArray(pixels);
    
    // Apply basic sharpening kernel
    const kernel = [-1, -1, -1, -1, 9, -1, -1, -1, -1];
    const kernelWeight = strength;
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let r = 0, g = 0, b = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            const weight = kernel[(ky + 1) * 3 + (kx + 1)] * kernelWeight;
            r += tempPixels[idx] * weight;
            g += tempPixels[idx + 1] * weight;
            b += tempPixels[idx + 2] * weight;
          }
        }
        
        const idx = (y * width + x) * 4;
        pixels[idx] = Math.max(0, Math.min(255, r * factor));
        pixels[idx + 1] = Math.max(0, Math.min(255, g * factor));
        pixels[idx + 2] = Math.max(0, Math.min(255, b * factor));
      }
    }
  }

  private applyEmbossFilter(pixels: Uint8ClampedArray, width: number, height: number): void {
    // Emboss convolution filter
    const tempPixels = new Uint8ClampedArray(pixels);
    const kernel = [-2, -1, 0, -1, 1, 1, 0, 1, 2];
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let r = 0, g = 0, b = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            const weight = kernel[(ky + 1) * 3 + (kx + 1)];
            r += tempPixels[idx] * weight;
            g += tempPixels[idx + 1] * weight;
            b += tempPixels[idx + 2] * weight;
          }
        }
        
        const idx = (y * width + x) * 4;
        const gray = Math.max(0, Math.min(255, (r + g + b) / 3 + 128));
        pixels[idx] = gray;
        pixels[idx + 1] = gray;
        pixels[idx + 2] = gray;
      }
    }
  }

  private applyEdgeFilter(pixels: Uint8ClampedArray, width: number, height: number): void {
    // Edge detection filter using Sobel operator
    const tempPixels = new Uint8ClampedArray(pixels);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        // Sobel X kernel
        const gx = 
          -1 * tempPixels[((y - 1) * width + (x - 1)) * 4] +
          1 * tempPixels[((y - 1) * width + (x + 1)) * 4] +
          -2 * tempPixels[(y * width + (x - 1)) * 4] +
          2 * tempPixels[(y * width + (x + 1)) * 4] +
          -1 * tempPixels[((y + 1) * width + (x - 1)) * 4] +
          1 * tempPixels[((y + 1) * width + (x + 1)) * 4];
        
        // Sobel Y kernel
        const gy = 
          -1 * tempPixels[((y - 1) * width + (x - 1)) * 4] +
          -2 * tempPixels[((y - 1) * width + x) * 4] +
          -1 * tempPixels[((y - 1) * width + (x + 1)) * 4] +
          1 * tempPixels[((y + 1) * width + (x - 1)) * 4] +
          2 * tempPixels[((y + 1) * width + x) * 4] +
          1 * tempPixels[((y + 1) * width + (x + 1)) * 4];
        
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        const idx = (y * width + x) * 4;
        const value = Math.max(0, Math.min(255, magnitude));
        
        pixels[idx] = value;
        pixels[idx + 1] = value;
        pixels[idx + 2] = value;
      }
    }
  }

  private applyVintageFilter(pixels: Uint8ClampedArray): void {
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];

      pixels[i] = r * 0.393 + g * 0.769 + b * 0.189;
      pixels[i + 1] = r * 0.349 + g * 0.686 + b * 0.168;
      pixels[i + 2] = r * 0.272 + g * 0.534 + b * 0.131;
    }
  }

  private applyLomoFilter(pixels: Uint8ClampedArray): void {
    for (let i = 0; i < pixels.length; i += 4) {
      pixels[i] = Math.min(255, pixels[i] * 1.1);
      pixels[i + 1] = Math.min(255, pixels[i + 1] * 1.1);
      pixels[i + 2] = Math.min(255, pixels[i + 2] * 0.9);
    }
  }

  private applyClarityFilter(pixels: Uint8ClampedArray, strength: number): void {
    // Clarity enhancement
    for (let i = 0; i < pixels.length; i += 4) {
      const factor = 1 + (strength * 0.2);
      pixels[i] = Math.min(255, pixels[i] * factor);
      pixels[i + 1] = Math.min(255, pixels[i + 1] * factor);
      pixels[i + 2] = Math.min(255, pixels[i + 2] * factor);
    }
  }

  private applyColorAdjustments(pixels: Uint8ClampedArray, options: ImageProcessingOptions): void {
    const brightness = (options.brightness || 0) * 2.55;
    const contrast = (options.contrast || 0) / 100 + 1;

    for (let i = 0; i < pixels.length; i += 4) {
      // Brightness
      pixels[i] = Math.max(0, Math.min(255, pixels[i] + brightness));
      pixels[i + 1] = Math.max(0, Math.min(255, pixels[i + 1] + brightness));
      pixels[i + 2] = Math.max(0, Math.min(255, pixels[i + 2] + brightness));

      // Contrast
      pixels[i] = Math.max(0, Math.min(255, (pixels[i] - 128) * contrast + 128));
      pixels[i + 1] = Math.max(0, Math.min(255, (pixels[i + 1] - 128) * contrast + 128));
      pixels[i + 2] = Math.max(0, Math.min(255, (pixels[i + 2] - 128) * contrast + 128));
    }
  }

  private applyGrayscale(pixels: Uint8ClampedArray): void {
    for (let i = 0; i < pixels.length; i += 4) {
      const gray = pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114;
      pixels[i] = gray;
      pixels[i + 1] = gray;
      pixels[i + 2] = gray;
    }
  }

  private applySepia(pixels: Uint8ClampedArray): void {
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];

      pixels[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
      pixels[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
      pixels[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
    }
  }

  private applyInvert(pixels: Uint8ClampedArray): void {
    for (let i = 0; i < pixels.length; i += 4) {
      pixels[i] = 255 - pixels[i];
      pixels[i + 1] = 255 - pixels[i + 1];
      pixels[i + 2] = 255 - pixels[i + 2];
    }
  }

  private applyPixelate(size: number): void {
    // Get current image data for processing
    this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    
    for (let y = 0; y < this.canvas.height; y += size) {
      for (let x = 0; x < this.canvas.width; x += size) {
        const pixelData = this.ctx.getImageData(x, y, 1, 1).data;
        this.ctx.fillStyle = `rgba(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]}, ${pixelData[3] / 255})`;
        this.ctx.fillRect(x, y, size, size);
      }
    }
  }

  private applyNoise(pixels: Uint8ClampedArray, amount: number): void {
    for (let i = 0; i < pixels.length; i += 4) {
      const noise = (Math.random() - 0.5) * amount * 255;
      pixels[i] = Math.max(0, Math.min(255, pixels[i] + noise));
      pixels[i + 1] = Math.max(0, Math.min(255, pixels[i + 1] + noise));
      pixels[i + 2] = Math.max(0, Math.min(255, pixels[i + 2] + noise));
    }
  }

  private applyVignette(pixels: Uint8ClampedArray, vignette: NonNullable<ImageProcessingOptions['vignette']>): void {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

    for (let y = 0; y < this.canvas.height; y++) {
      for (let x = 0; x < this.canvas.width; x++) {
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        const vignetteFactor = Math.max(0, 1 - (distance / maxDistance) * vignette.strength);
        
        const i = (y * this.canvas.width + x) * 4;
        pixels[i] *= vignetteFactor;
        pixels[i + 1] *= vignetteFactor;
        pixels[i + 2] *= vignetteFactor;
      }
    }
  }
}

// Utility functions
export const ImageUtils = {
  /**
   * Convert bytes to human readable format
   */
  formatBytes: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Calculate compression ratio
   */
  calculateCompressionRatio: (originalSize: number, compressedSize: number): number => {
    return originalSize > 0 ? compressedSize / originalSize : 1;
  },

  /**
   * Get optimal dimensions for aspect ratio
   */
  getOptimalDimensions: (
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } => {
    const aspectRatio = originalWidth / originalHeight;
    let width = maxWidth;
    let height = width / aspectRatio;

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    return { width: Math.round(width), height: Math.round(height) };
  },

  /**
   * Generate progressive image sizes
   */
  generateProgressiveSizes: (maxWidth: number, steps: number = 5): number[] => {
    const sizes: number[] = [];
    const minWidth = 300;
    const step = (maxWidth - minWidth) / (steps - 1);

    for (let i = 0; i < steps; i++) {
      sizes.push(Math.round(minWidth + step * i));
    }

    return sizes;
  },

  /**
   * Detect if image is too small for processing
   */
  isTooSmall: (width: number, height: number, minSize: number = 100): boolean => {
    return width < minSize || height < minSize;
  },

  /**
   * Detect if image is too large for processing
   */
  isTooLarge: (width: number, height: number, maxSize: number = 4000): boolean => {
    return width > maxSize || height > maxSize;
  },

  /**
   * Calculate image aspect ratio category
   */
  getAspectRatioCategory: (aspectRatio: number): string => {
    if (Math.abs(aspectRatio - 1) < 0.1) return 'square';
    if (Math.abs(aspectRatio - 4/3) < 0.1) return 'standard';
    if (Math.abs(aspectRatio - 16/9) < 0.1) return 'widescreen';
    if (aspectRatio > 2) return 'panoramic';
    if (aspectRatio < 0.5) return 'portrait';
    return 'custom';
  },

  /**
   * Create image from canvas
   */
  canvasToImage: (canvas: HTMLCanvasElement): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to create image from canvas'));
      img.src = canvas.toDataURL();
    });
  },

  /**
   * Load image from various sources
   */
  loadImageFromSource: (source: string | File | Blob): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load image'));
      };

      if (typeof source === 'string') {
        img.src = source;
      } else {
        img.src = URL.createObjectURL(source);
      }
    });
  },

  /**
   * Batch process images
   */
  batchProcess: async (
    images: (File | HTMLImageElement | string)[],
    options: ImageProcessingOptions,
    onProgress?: (completed: number, total: number) => void
  ): Promise<ImageOptimizationResult[]> => {
    const processor = ImageProcessor.getInstance();
    const results: ImageOptimizationResult[] = [];

    for (let i = 0; i < images.length; i++) {
      try {
        const result = await processor.processImage(images[i], options);
        results.push(result);
        
        if (onProgress) {
          onProgress(i + 1, images.length);
        }
      } catch (error) {
        console.error(`Failed to process image ${i}:`, error);
        // Continue with other images
      }
    }

    return results;
  },
};

// Export singleton instance
export const imageProcessor = ImageProcessor.getInstance();

export default ImageProcessor;