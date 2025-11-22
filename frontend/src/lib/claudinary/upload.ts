/**
 * Cloudinary Upload Service
 * Comprehensive file upload functionality with progress tracking, validation, and optimization
 */

import { cloudinaryConfig, CloudinaryUploadOptions, CloudinaryUploadResponse, CloudinaryError, CloudinaryTransformation } from './config';

/**
 * Upload Progress Interface
 */
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  stage: 'preparing' | 'uploading' | 'processing' | 'complete' | 'error';
  message?: string;
}

/**
 * Upload Result Interface
 */
export interface UploadResult {
  success: boolean;
  data?: CloudinaryUploadResponse;
  error?: CloudinaryError | Error;
  url?: string;
  secureUrl?: string;
  publicId?: string;
  metadata?: {
    size: number;
    format: string;
    width?: number;
    height?: number;
    duration?: number;
    resourceType: string;
  };
}

/**
 * Batch Upload Result Interface
 */
export interface BatchUploadResult {
  success: boolean;
  results: UploadResult[];
  failed: Array<{ file: File; error: Error }>;
  successCount: number;
  failureCount: number;
  totalSize: number;
}

/**
 * File Validation Options
 */
export interface FileValidationOptions {
  maxSize?: number; // in bytes
  minSize?: number; // in bytes
  allowedTypes?: string[];
  allowedExtensions?: string[];
  maxWidth?: number;
  maxHeight?: number;
  minWidth?: number;
  minHeight?: number;
  aspectRatio?: { min?: number; max?: number };
  validateDimensions?: boolean;
}

/**
 * Upload Configuration Interface
 */
export interface UploadConfig extends CloudinaryUploadOptions {
  validation?: FileValidationOptions;
  onProgress?: (progress: UploadProgress) => void;
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: CloudinaryError | Error) => void;
  transformations?: CloudinaryTransformation[];
  generateThumbnails?: boolean;
  thumbnailSizes?: Array<{ width: number; height: number; name: string }>;
  optimizeForWeb?: boolean;
  preserveOriginal?: boolean;
  metadata?: Record<string, string>;
  tags?: string[];
  autoTag?: boolean;
  generateAltText?: boolean;
  detectObjects?: boolean;
  moderationAnalysis?: boolean;
}

/**
 * Cloudinary Upload Service Class
 */
export class CloudinaryUploadService {
  private static instance: CloudinaryUploadService;
  private activeUploads = new Map<string, XMLHttpRequest>();
  private uploadQueue: Array<{ id: string; file: File; config: UploadConfig }> = [];
  private isProcessingQueue = false;
  private maxConcurrentUploads = 3;
  private defaultValidation: FileValidationOptions = {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.webm'],
    validateDimensions: false,
  };

  private constructor() {
    this.initializeService();
  }

  public static getInstance(): CloudinaryUploadService {
    if (!CloudinaryUploadService.instance) {
      CloudinaryUploadService.instance = new CloudinaryUploadService();
    }
    return CloudinaryUploadService.instance;
  }

  /**
   * Initialize the upload service
   */
  private initializeService(): void {
    // Check if Cloudinary is configured
    if (!cloudinaryConfig.isClientConfigured()) {
      console.warn('Cloudinary is not properly configured for client-side uploads');
    }
  }

  /**
   * Upload a single file
   */
  public async uploadFile(file: File, config: UploadConfig = {}): Promise<UploadResult> {
    const uploadId = this.generateUploadId();
    
    try {
      // Validate file
      const validation = await this.validateFile(file, config.validation);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Notify upload start
      config.onProgress?.({
        loaded: 0,
        total: file.size,
        percentage: 0,
        stage: 'preparing',
        message: 'Preparing upload...'
      });

      // Prepare upload data
      const uploadData = await this.prepareUploadData(file, config);

      // Perform upload
      const result = await this.performUpload(uploadId, uploadData, config);

      // Process successful upload
      if (result.success && result.data) {
        config.onSuccess?.(result);
        
        // Generate thumbnails if requested
        if (config.generateThumbnails && result.data.resource_type === 'image') {
          await this.generateThumbnails(result.data.public_id, config.thumbnailSizes);
        }
      }

      return result;
    } catch (error) {
      const uploadError = error as CloudinaryError | Error;
      const result: UploadResult = {
        success: false,
        error: uploadError,
      };
      
      config.onError?.(uploadError);
      return result;
    } finally {
      this.activeUploads.delete(uploadId);
    }
  }

  /**
   * Upload multiple files with batch processing
   */
  public async uploadFiles(files: File[], config: UploadConfig = {}): Promise<BatchUploadResult> {
    const results: UploadResult[] = [];
    const failed: Array<{ file: File; error: Error }> = [];
    let totalSize = 0;

    // Calculate total size
    files.forEach(file => {
      totalSize += file.size;
    });

    // Process files in batches
    const batches = this.createBatches(files, this.maxConcurrentUploads);
    
    for (const batch of batches) {
      const batchPromises = batch.map(async (file) => {
        const fileConfig = {
          ...config,
          onProgress: (progress: UploadProgress) => {
            // Aggregate progress for batch
            config.onProgress?.({
              ...progress,
              message: `Uploading ${file.name}...`
            });
          }
        };

        try {
          const result = await this.uploadFile(file, fileConfig);
          results.push(result);
          return result;
        } catch (error) {
          const uploadError = error as Error;
          failed.push({ file, error: uploadError });
          results.push({
            success: false,
            error: uploadError,
          });
          return null;
        }
      });

      await Promise.allSettled(batchPromises);
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = failed.length;

    return {
      success: failureCount === 0,
      results,
      failed,
      successCount,
      failureCount,
      totalSize,
    };
  }

  /**
   * Upload with signed parameters (server-side generation required)
   */
  public async uploadSigned(file: File, signedParams: Record<string, unknown>, config: UploadConfig = {}): Promise<UploadResult> {
    const uploadId = this.generateUploadId();
    
    try {
      const validation = await this.validateFile(file, config.validation);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const formData = new FormData();
      formData.append('file', file);
      
      // Add signed parameters
      Object.entries(signedParams).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      // Add additional options
      if (config.tags) {
        formData.append('tags', config.tags.join(','));
      }
      if (config.context) {
        formData.append('context', Object.entries(config.context).map(([k, v]) => `${k}=${v}`).join('|'));
      }

      const result = await this.performUpload(uploadId, formData, config);
      return result;
    } catch (error) {
      const uploadError = error as CloudinaryError | Error;
      return {
        success: false,
        error: uploadError,
      };
    } finally {
      this.activeUploads.delete(uploadId);
    }
  }

  /**
   * Upload from URL
   */
  public async uploadFromUrl(url: string, config: UploadConfig = {}): Promise<UploadResult> {
    try {
      const clientConfig = cloudinaryConfig.getClientConfig();
      const formData = new FormData();
      
      formData.append('file', url);
      formData.append('upload_preset', clientConfig.uploadPreset || '');
      
      if (config.folder || clientConfig.folder) {
        formData.append('folder', config.folder || clientConfig.folder || '');
      }

      const uploadUrl = `https://api.cloudinary.com/v1_1/${clientConfig.cloudName}/image/upload`;
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Upload failed');
      }

      const data: CloudinaryUploadResponse = await response.json();
      
      return {
        success: true,
        data,
        url: data.url,
        secureUrl: data.secure_url,
        publicId: data.public_id,
        metadata: {
          size: data.bytes,
          format: data.format,
          width: data.width,
          height: data.height,
          resourceType: data.resource_type,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Upload with transformations
   */
  public async uploadWithTransformation(
    file: File, 
    transformations: CloudinaryTransformation[], 
    config: UploadConfig = {}
  ): Promise<UploadResult> {
    const enhancedConfig = {
      ...config,
      eager: transformations,
      eager_async: false,
    };

    return this.uploadFile(file, enhancedConfig);
  }

  /**
   * Cancel upload by ID
   */
  public cancelUpload(uploadId: string): boolean {
    const xhr = this.activeUploads.get(uploadId);
    if (xhr) {
      xhr.abort();
      this.activeUploads.delete(uploadId);
      return true;
    }
    return false;
  }

  /**
   * Cancel all active uploads
   */
  public cancelAllUploads(): void {
    this.activeUploads.forEach((xhr) => {
      xhr.abort();
    });
    this.activeUploads.clear();
    this.uploadQueue = [];
  }

  /**
   * Get active upload count
   */
  public getActiveUploadCount(): number {
    return this.activeUploads.size;
  }

  /**
   * Get upload queue length
   */
  public getQueueLength(): number {
    return this.uploadQueue.length;
  }

  /**
   * Validate file before upload
   */
  private async validateFile(file: File, validation?: FileValidationOptions): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const rules = { ...this.defaultValidation, ...validation };
    const errors: string[] = [];

    // Check file size
    if (rules.maxSize && file.size > rules.maxSize) {
      errors.push(`File size (${this.formatFileSize(file.size)}) exceeds maximum allowed size (${this.formatFileSize(rules.maxSize)})`);
    }
    if (rules.minSize && file.size < rules.minSize) {
      errors.push(`File size (${this.formatFileSize(file.size)}) is below minimum required size (${this.formatFileSize(rules.minSize)})`);
    }

    // Check file type
    if (rules.allowedTypes && !rules.allowedTypes.includes(file.type)) {
      errors.push(`File type '${file.type}' is not allowed. Allowed types: ${rules.allowedTypes.join(', ')}`);
    }

    // Check file extension
    if (rules.allowedExtensions) {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!rules.allowedExtensions.includes(fileExtension)) {
        errors.push(`File extension '${fileExtension}' is not allowed. Allowed extensions: ${rules.allowedExtensions.join(', ')}`);
      }
    }

    // Check image dimensions if required
    if (rules.validateDimensions && file.type.startsWith('image/')) {
      try {
        const dimensions = await this.getImageDimensions(file);
        
        if (rules.maxWidth && dimensions.width > rules.maxWidth) {
          errors.push(`Image width (${dimensions.width}px) exceeds maximum allowed width (${rules.maxWidth}px)`);
        }
        if (rules.maxHeight && dimensions.height > rules.maxHeight) {
          errors.push(`Image height (${dimensions.height}px) exceeds maximum allowed height (${rules.maxHeight}px)`);
        }
        if (rules.minWidth && dimensions.width < rules.minWidth) {
          errors.push(`Image width (${dimensions.width}px) is below minimum required width (${rules.minWidth}px)`);
        }
        if (rules.minHeight && dimensions.height < rules.minHeight) {
          errors.push(`Image height (${dimensions.height}px) is below minimum required height (${rules.minHeight}px)`);
        }

        // Check aspect ratio
        if (rules.aspectRatio) {
          const aspectRatio = dimensions.width / dimensions.height;
          if (rules.aspectRatio.min && aspectRatio < rules.aspectRatio.min) {
            errors.push(`Image aspect ratio (${aspectRatio.toFixed(2)}) is below minimum required ratio (${rules.aspectRatio.min})`);
          }
          if (rules.aspectRatio.max && aspectRatio > rules.aspectRatio.max) {
            errors.push(`Image aspect ratio (${aspectRatio.toFixed(2)}) exceeds maximum allowed ratio (${rules.aspectRatio.max})`);
          }
        }
      } catch {
        errors.push('Unable to validate image dimensions');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Prepare upload data
   */
  private async prepareUploadData(file: File, config: UploadConfig): Promise<FormData> {
    const clientConfig = cloudinaryConfig.getClientConfig();
    const formData = new FormData();
    
    formData.append('file', file);
    formData.append('upload_preset', clientConfig.uploadPreset || '');
    
    // Add folder
    if (config.folder || clientConfig.folder) {
      formData.append('folder', config.folder || clientConfig.folder || '');
    }

    // Add public_id if specified
    if (config.public_id) {
      formData.append('public_id', config.public_id);
    }

    // Add resource type
    if (config.resource_type) {
      formData.append('resource_type', config.resource_type);
    }

    // Add tags
    if (config.tags) {
      formData.append('tags', config.tags.join(','));
    }

    // Add context/metadata
    if (config.context) {
      formData.append('context', Object.entries(config.context).map(([k, v]) => `${k}=${v}`).join('|'));
    }

    // Add transformations
    if (config.transformation && config.transformation.length > 0) {
      formData.append('transformation', JSON.stringify(config.transformation));
    }

    // Add eager transformations
    if (config.eager && config.eager.length > 0) {
      formData.append('eager', JSON.stringify(config.eager));
    }

    // Add quality setting
    if (config.quality) {
      formData.append('quality', String(config.quality));
    }

    // Add format
    if (config.format) {
      formData.append('format', config.format);
    }

    // Add overwrite flag
    if (config.overwrite !== undefined) {
      formData.append('overwrite', String(config.overwrite));
    }

    // Add auto-tagging
    if (config.autoTag || config.auto_tagging) {
      formData.append('auto_tagging', String(config.auto_tagging || 0.7));
    }

    // Add content analysis features
    if (config.detectObjects || config.detection) {
      formData.append('detection', config.detection || 'adv_face,coco');
    }

    if (config.generateAltText || config.ocr) {
      formData.append('ocr', config.ocr || 'adv_ocr');
    }

    if (config.moderationAnalysis) {
      formData.append('moderation', 'aws_rek:suggestive:nudity:explicit');
    }

    // Add analysis flags
    const analysisFlags = [];
    if (config.colors !== false) analysisFlags.push('colors');
    if (config.faces !== false) analysisFlags.push('faces');
    if (config.quality_analysis !== false) analysisFlags.push('quality_analysis');
    if (config.accessibility_analysis !== false) analysisFlags.push('accessibility_analysis');
    
    if (analysisFlags.length > 0) {
      formData.append('image_metadata', 'true');
    }

    return formData;
  }

  /**
   * Perform the actual upload
   */
  private async performUpload(
    uploadId: string, 
    formData: FormData, 
    config: UploadConfig
  ): Promise<UploadResult> {
    return new Promise((resolve) => {
      const clientConfig = cloudinaryConfig.getClientConfig();
      const uploadUrl = `https://api.cloudinary.com/v1_1/${clientConfig.cloudName}/upload`;
      
      const xhr = new XMLHttpRequest();
      this.activeUploads.set(uploadId, xhr);

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress: UploadProgress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
            stage: 'uploading',
            message: `Uploading... ${Math.round((event.loaded / event.total) * 100)}%`
          };
          config.onProgress?.(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data: CloudinaryUploadResponse = JSON.parse(xhr.responseText);
            
            config.onProgress?.({
              loaded: data.bytes,
              total: data.bytes,
              percentage: 100,
              stage: 'complete',
              message: 'Upload complete!'
            });

            resolve({
              success: true,
              data,
              url: data.url,
              secureUrl: data.secure_url,
              publicId: data.public_id,
              metadata: {
                size: data.bytes,
                format: data.format,
                width: data.width,
                height: data.height,
                resourceType: data.resource_type,
              },
            });
          } catch {
            resolve({
              success: false,
              error: new Error('Failed to parse upload response'),
            });
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            resolve({
              success: false,
              error: {
                message: errorData.error?.message || 'Upload failed',
                name: 'CloudinaryError',
                http_code: xhr.status,
                error: errorData.error,
              } as CloudinaryError,
            });
          } catch {
            resolve({
              success: false,
              error: new Error(`Upload failed with status ${xhr.status}`),
            });
          }
        }
      });

      xhr.addEventListener('error', () => {
        config.onProgress?.({
          loaded: 0,
          total: 0,
          percentage: 0,
          stage: 'error',
          message: 'Upload failed due to network error'
        });

        resolve({
          success: false,
          error: new Error('Network error during upload'),
        });
      });

      xhr.addEventListener('abort', () => {
        resolve({
          success: false,
          error: new Error('Upload cancelled'),
        });
      });

      xhr.open('POST', uploadUrl);
      xhr.send(formData);
    });
  }

  /**
   * Generate thumbnails for uploaded image
   */
  private async generateThumbnails(
    publicId: string, 
    sizes?: Array<{ width: number; height: number; name: string }>
  ): Promise<string[]> {
    const defaultSizes = [
      { width: 150, height: 150, name: 'thumb' },
      { width: 300, height: 300, name: 'medium' },
      { width: 600, height: 600, name: 'large' },
    ];

    const thumbnailSizes = sizes || defaultSizes;
    const urls: string[] = [];

    thumbnailSizes.forEach(size => {
      const transformation: CloudinaryTransformation = {
        width: size.width,
        height: size.height,
        crop: 'fill',
        quality: 'auto',
        format: 'webp',
      };

      const url = cloudinaryConfig.buildUrl(publicId, [transformation]);
      urls.push(url);
    });

    return urls;
  }

  /**
   * Get image dimensions
   */
  private getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('File is not an image'));
        return;
      }

      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  }

  /**
   * Create batches for parallel processing
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Generate unique upload ID
   */
  private generateUploadId(): string {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get upload presets for common scenarios
   */
  public getUploadPresets() {
    return {
      // Profile/Avatar uploads
      avatar: {
        validation: {
          maxSize: 5 * 1024 * 1024, // 5MB
          allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
          maxWidth: 2000,
          maxHeight: 2000,
          validateDimensions: true,
        },
        transformation: [{ width: 400, height: 400, crop: 'fill' as const, gravity: 'face' as const, quality: 'auto' as const }],
        generateThumbnails: true,
        thumbnailSizes: [
          { width: 50, height: 50, name: 'small' },
          { width: 100, height: 100, name: 'medium' },
          { width: 200, height: 200, name: 'large' },
        ],
        tags: ['avatar', 'profile'],
        optimizeForWeb: true,
      },

      // Product images
      product: {
        validation: {
          maxSize: 10 * 1024 * 1024, // 10MB
          allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
          minWidth: 300,
          minHeight: 300,
          validateDimensions: true,
        },
        transformation: [{ width: 800, height: 800, crop: 'fit' as const, quality: 'auto' as const, format: 'webp' as const }],
        generateThumbnails: true,
        thumbnailSizes: [
          { width: 150, height: 150, name: 'thumb' },
          { width: 300, height: 300, name: 'medium' },
          { width: 600, height: 600, name: 'large' },
        ],
        tags: ['product'],
        detectObjects: true,
        autoTag: true,
        optimizeForWeb: true,
      },

      // Gallery/Blog images
      gallery: {
        validation: {
          maxSize: 15 * 1024 * 1024, // 15MB
          allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        },
        transformation: [{ width: 1200, height: 800, crop: 'fit' as const, quality: 'auto' as const, format: 'webp' as const }],
        tags: ['gallery'],
        generateAltText: true,
        optimizeForWeb: true,
      },

      // Documents
      document: {
        validation: {
          maxSize: 50 * 1024 * 1024, // 50MB
          allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
          allowedExtensions: ['.pdf', '.doc', '.docx'],
        },
        resource_type: 'raw' as const,
        tags: ['document'],
      },

      // Videos
      video: {
        validation: {
          maxSize: 100 * 1024 * 1024, // 100MB
          allowedTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
          allowedExtensions: ['.mp4', '.webm', '.mov'],
        },
        resource_type: 'video' as const,
        transformation: [{ width: 1280, height: 720, crop: 'scale' as const, quality: 'auto' as const }],
        tags: ['video'],
      },
    };
  }

  /**
   * Helper method to upload with preset configuration
   */
  public async uploadWithPreset(
    file: File, 
    presetName: keyof ReturnType<typeof this.getUploadPresets>,
    additionalConfig: Partial<UploadConfig> = {}
  ): Promise<UploadResult> {
    const presets = this.getUploadPresets();
    const preset = presets[presetName];
    
    if (!preset) {
      throw new Error(`Upload preset '${presetName}' not found`);
    }

    const config = {
      ...preset,
      ...additionalConfig,
      validation: {
        ...preset.validation,
        ...additionalConfig.validation,
      },
    };

    return this.uploadFile(file, config);
  }
}

// Export singleton instance
export const uploadService = CloudinaryUploadService.getInstance();

/**
 * Utility functions for common upload scenarios
 */
export const uploadUtils = {
  /**
   * Upload user avatar
   */
  uploadAvatar: (file: File, userId: string, onProgress?: (progress: UploadProgress) => void) => {
    return uploadService.uploadWithPreset(file, 'avatar', {
      public_id: `users/${userId}/avatar`,
      overwrite: true,
      onProgress,
    });
  },

  /**
   * Upload product image
   */
  uploadProductImage: (file: File, productId: string, onProgress?: (progress: UploadProgress) => void) => {
    return uploadService.uploadWithPreset(file, 'product', {
      folder: `products/${productId}`,
      onProgress,
    });
  },

  /**
   * Upload gallery image
   */
  uploadGalleryImage: (file: File, albumId?: string, onProgress?: (progress: UploadProgress) => void) => {
    return uploadService.uploadWithPreset(file, 'gallery', {
      folder: albumId ? `gallery/${albumId}` : 'gallery',
      onProgress,
    });
  },

  /**
   * Upload document
   */
  uploadDocument: (file: File, category?: string, onProgress?: (progress: UploadProgress) => void) => {
    return uploadService.uploadWithPreset(file, 'document', {
      folder: category ? `documents/${category}` : 'documents',
      onProgress,
    });
  },

  /**
   * Upload video
   */
  uploadVideo: (file: File, category?: string, onProgress?: (progress: UploadProgress) => void) => {
    return uploadService.uploadWithPreset(file, 'video', {
      folder: category ? `videos/${category}` : 'videos',
      onProgress,
    });
  },

  /**
   * Batch upload with progress aggregation
   */
  batchUpload: async (
    files: File[],
    preset: keyof ReturnType<typeof uploadService.getUploadPresets>,
    onProgress?: (overallProgress: { completed: number; total: number; percentage: number }) => void
  ) => {
    let completed = 0;
    const total = files.length;

    const results = await Promise.allSettled(
      files.map(file => 
        uploadService.uploadWithPreset(file, preset, {
          onProgress: () => {
            // Individual file progress can be tracked here if needed
          },
          onSuccess: () => {
            completed++;
            onProgress?.({
              completed,
              total,
              percentage: Math.round((completed / total) * 100)
            });
          }
        })
      )
    );

    return results.map((result, index) => ({
      file: files[index],
      result: result.status === 'fulfilled' ? result.value : { success: false, error: result.reason }
    }));
  }
};

export default CloudinaryUploadService;