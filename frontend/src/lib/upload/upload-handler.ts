/**
 * Upload Handler for Vardhman Mills Frontend
 * Comprehensive upload orchestration with progress tracking and error handling
 */

import { CloudinaryService } from './cloudinary';

// Create cloudinary service instance
const cloudinaryService = CloudinaryService.getInstance();
import { FileValidator } from './file-validation';
import { imageProcessor, ImageProcessor, ImageProcessingOptions, ResponsiveImageOptions } from './image-utils';

// Upload configuration interface
export interface UploadConfig {
  maxFileSize?: number; // in bytes
  maxFiles?: number;
  allowedTypes?: string[];
  folder?: string;
  transformations?: ImageProcessingOptions;
  generateThumbnails?: boolean;
  generateResponsive?: boolean;
  responsiveOptions?: ResponsiveImageOptions;
  quality?: number;
  autoOptimize?: boolean;
  validateContent?: boolean;
  enableProgress?: boolean;
  enablePreview?: boolean;
  retryAttempts?: number;
  chunkSize?: number; // for chunked uploads
  enableResumable?: boolean;
}

// Upload progress interface
export interface UploadProgress {
  fileId: string;
  fileName: string;
  loaded: number;
  total: number;
  percentage: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error' | 'cancelled';
  stage: 'validation' | 'upload' | 'processing' | 'transformation' | 'optimization' | 'complete';
  error?: string;
  estimatedTimeRemaining?: number;
  bytesPerSecond?: number;
  startTime: number;
  lastUpdateTime: number;
}

// Upload result interface
export interface UploadResult {
  fileId: string;
  fileName: string;
  originalUrl: string;
  optimizedUrl?: string;
  thumbnailUrl?: string;
  responsiveUrls?: { [key: string]: string };
  metadata: {
    size: number;
    type: string;
    dimensions?: { width: number; height: number };
    format?: string;
    colorProfile?: string;
    duration?: number; // for videos
  };
  transformations?: string[];
  compressionRatio?: number;
  uploadTime: number;
  publicId: string;
  secureUrl: string;
  tags?: string[];
  folder?: string;
}

// Batch upload result interface
export interface BatchUploadResult {
  successful: UploadResult[];
  failed: Array<{
    fileName: string;
    error: string;
    fileId: string;
  }>;
  totalFiles: number;
  successfulCount: number;
  failedCount: number;
  totalSize: number;
  uploadTime: number;
  averageSpeed: number;
}

// Upload error interface
export interface IUploadError extends Error {
  code: string;
  fileId?: string;
  fileName?: string;
  details?: Record<string, unknown>;
  retryable: boolean;
}

// Default upload configuration
export const DEFAULT_UPLOAD_CONFIG: UploadConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 10,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'],
  folder: 'uploads',
  quality: 0.8,
  autoOptimize: true,
  validateContent: true,
  enableProgress: true,
  enablePreview: true,
  retryAttempts: 3,
  chunkSize: 1024 * 1024, // 1MB chunks
  enableResumable: false,
  generateThumbnails: true,
  generateResponsive: true,
  responsiveOptions: {
    breakpoints: [320, 640, 1024, 1440, 1920],
    quality: 0.8,
    format: 'webp',
    retina: true,
  },
};

/**
 * Main Upload Handler Class
 */
export class UploadHandler {
  private static instance: UploadHandler;
  private config: UploadConfig;
  private validator: FileValidator;
  private processor: ImageProcessor;
  private progressCallbacks: Map<string, (progress: UploadProgress) => void> = new Map();
  private uploadQueue: Map<string, Promise<UploadResult>> = new Map();
  private abortControllers: Map<string, AbortController> = new Map();

  private constructor(config: UploadConfig = {}) {
    this.config = { ...DEFAULT_UPLOAD_CONFIG, ...config };
    this.validator = FileValidator.getInstance();
    this.processor = imageProcessor;
  }

  static getInstance(config?: UploadConfig): UploadHandler {
    if (!UploadHandler.instance) {
      UploadHandler.instance = new UploadHandler(config);
    }
    return UploadHandler.instance;
  }

  /**
   * Upload single file
   */
  async uploadFile(
    file: File,
    options: Partial<UploadConfig> = {},
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    const fileId = this.generateFileId();
    const config = { ...this.config, ...options };
    const abortController = new AbortController();
    
    this.abortControllers.set(fileId, abortController);
    
    if (onProgress) {
      this.progressCallbacks.set(fileId, onProgress);
    }

    const progress: UploadProgress = {
      fileId,
      fileName: file.name,
      loaded: 0,
      total: file.size,
      percentage: 0,
      status: 'pending',
      stage: 'validation',
      startTime: Date.now(),
      lastUpdateTime: Date.now(),
    };

    try {
      this.updateProgress(progress);

      // Step 1: Validate file
      progress.stage = 'validation';
      progress.status = 'uploading';
      this.updateProgress(progress);

      const validationResult = await this.validator.validateFile(file);
      if (!validationResult.isValid) {
        throw new UploadError(
          `Validation failed: ${validationResult.errors.join(', ')}`,
          'VALIDATION_ERROR',
          fileId,
          file.name,
          { errors: validationResult.errors },
          false
        );
      }

      // Step 2: Pre-process if needed
      let processedFile = file;
      if (config.autoOptimize && this.isImage(file)) {
        progress.stage = 'processing';
        this.updateProgress(progress);

        const optimizationResult = await this.processor.optimizeForWeb(file);
        processedFile = new File([optimizationResult.blob], file.name, {
          type: optimizationResult.blob.type,
          lastModified: file.lastModified,
        });
      }

      // Step 3: Upload to Cloudinary
      progress.stage = 'upload';
      this.updateProgress(progress);

      const uploadResult = await this.uploadToCloudinary(
        processedFile,
        config,
        fileId,
        abortController.signal
      );

      // Step 4: Generate additional variants
      if (config.generateThumbnails || config.generateResponsive) {
        progress.stage = 'transformation';
        this.updateProgress(progress);

        await this.generateVariants(uploadResult, config);
      }

      // Step 5: Complete
      progress.stage = 'complete';
      progress.status = 'completed';
      progress.percentage = 100;
      progress.loaded = progress.total;
      this.updateProgress(progress);

      // Cleanup
      this.cleanup(fileId);

      return uploadResult;

    } catch (error) {
      progress.status = 'error';
      progress.error = error instanceof Error ? error.message : 'Unknown error';
      this.updateProgress(progress);
      this.cleanup(fileId);
      throw error;
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: FileList | File[],
    options: Partial<UploadConfig> = {},
    onProgress?: (progress: UploadProgress[]) => void,
    onBatchProgress?: (completed: number, total: number) => void
  ): Promise<BatchUploadResult> {
    const config = { ...this.config, ...options };
    const fileArray = Array.from(files);
    const startTime = Date.now();
    
    // Validate file count
    if (fileArray.length > config.maxFiles!) {
      throw new UploadError(
        `Too many files. Maximum allowed: ${config.maxFiles}`,
        'TOO_MANY_FILES',
        undefined,
        undefined,
        { maxFiles: config.maxFiles, provided: fileArray.length },
        false
      );
    }

    const progressMap = new Map<string, UploadProgress>();
    const results: { successful: UploadResult[]; failed: Array<{ fileName: string; error: string; fileId: string }> } = {
      successful: [],
      failed: [],
    };

    // Track overall progress
    const updateOverallProgress = () => {
      if (onProgress) {
        onProgress(Array.from(progressMap.values()));
      }
      if (onBatchProgress) {
        const completed = results.successful.length + results.failed.length;
        onBatchProgress(completed, fileArray.length);
      }
    };

    // Upload files concurrently (with limit)
    const concurrencyLimit = 3;
    const chunks = this.chunkArray(fileArray, concurrencyLimit);
    
    for (const chunk of chunks) {
      const chunkPromises = chunk.map(async (file) => {
        const fileId = this.generateFileId();
        
        try {
          const result = await this.uploadFile(file, config, (progress) => {
            progressMap.set(fileId, progress);
            updateOverallProgress();
          });
          
          results.successful.push(result);
        } catch (error) {
          results.failed.push({
            fileName: file.name,
            error: error instanceof Error ? error.message : 'Unknown error',
            fileId,
          });
        }
      });

      await Promise.all(chunkPromises);
    }

    // Calculate final statistics
    const totalSize = fileArray.reduce((sum, file) => sum + file.size, 0);
    const uploadTime = Date.now() - startTime;
    const averageSpeed = totalSize / (uploadTime / 1000); // bytes per second

    return {
      successful: results.successful,
      failed: results.failed,
      totalFiles: fileArray.length,
      successfulCount: results.successful.length,
      failedCount: results.failed.length,
      totalSize,
      uploadTime,
      averageSpeed,
    };
  }

  /**
   * Upload with drag and drop support
   */
  async uploadFromDrop(
    dataTransfer: DataTransfer,
    options: Partial<UploadConfig> = {},
    onProgress?: (progress: UploadProgress[]) => void
  ): Promise<BatchUploadResult> {
    const files = await this.extractFilesFromDataTransfer(dataTransfer);
    return this.uploadFiles(files, options, onProgress);
  }

  /**
   * Upload from URL
   */
  async uploadFromUrl(
    url: string,
    fileName?: string,
    options: Partial<UploadConfig> = {},
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    const config = { ...this.config, ...options };
    const fileId = this.generateFileId();

    try {
      // Fetch file from URL
      const response = await fetch(url);
      if (!response.ok) {
        throw new UploadError(
          `Failed to fetch file from URL: ${response.statusText}`,
          'FETCH_ERROR',
          fileId,
          fileName,
          { status: response.status, statusText: response.statusText },
          true
        );
      }

      const blob = await response.blob();
      const file = new File([blob], fileName || this.extractFileNameFromUrl(url), {
        type: blob.type,
      });

      return this.uploadFile(file, config, onProgress);

    } catch (error) {
      throw new UploadError(
        `Failed to upload from URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'URL_UPLOAD_ERROR',
        fileId,
        fileName,
        error instanceof Error ? { message: error.message, stack: error.stack } : { error: String(error) },
        true
      );
    }
  }

  /**
   * Cancel upload
   */
  cancelUpload(fileId: string): void {
    const abortController = this.abortControllers.get(fileId);
    if (abortController) {
      abortController.abort();
      this.cleanup(fileId);
    }
  }

  /**
   * Cancel all uploads
   */
  cancelAllUploads(): void {
    Array.from(this.abortControllers.keys()).forEach(fileId => {
      this.cancelUpload(fileId);
    });
  }

  /**
   * Get upload status
   */
  getUploadStatus(fileId: string): UploadProgress | null {
    // This would typically retrieve from a status store
    // For now, check if upload is still in progress
    if (this.abortControllers.has(fileId)) {
      return {
        fileId,
        fileName: 'unknown',
        loaded: 0,
        total: 0,
        percentage: 0,
        status: 'uploading',
        stage: 'upload',
        startTime: Date.now(),
      } as UploadProgress;
    }
    return null;
  }

  /**
   * Resume upload (for chunked uploads)
   */
  async resumeUpload(fileId: string): Promise<UploadResult> {
    // Implementation for resumable uploads
    // Check if the upload exists and can be resumed
    if (!this.abortControllers.has(fileId)) {
      throw new Error(`Upload with fileId ${fileId} not found or cannot be resumed`);
    }
    
    throw new Error(`Resumable uploads for fileId ${fileId} not implemented yet`);
  }

  /**
   * Generate preview for file
   */
  async generatePreview(file: File): Promise<string> {
    if (this.isImage(file)) {
      return this.generateImagePreview(file);
    } else if (this.isVideo(file)) {
      return this.generateVideoPreview(file);
    } else {
      return this.generateFileIcon(file);
    }
  }

  /**
   * Validate files before upload
   */
  async validateFiles(files: FileList | File[]): Promise<Array<{ file: File; valid: boolean; errors: string[] }>> {
    const fileArray = Array.from(files);
    const results = [];

    for (const file of fileArray) {
      const validationResult = await this.validator.validateFile(file);
      results.push({
        file,
        valid: validationResult.isValid,
        errors: validationResult.errors,
      });
    }

    return results;
  }

  /**
   * Private helper methods
   */
  private async uploadToCloudinary(
    file: File,
    config: UploadConfig,
    fileId: string,
    signal: AbortSignal
  ): Promise<UploadResult> {
    const uploadOptions = {
      folder: config.folder,
      quality: config.quality,
      format: 'auto',
      fetch_format: 'auto',
      flags: 'progressive',
      ...(this.isImage(file) && {
        eager: [
          { width: 300, height: 300, crop: 'fill', quality: 'auto' }, // thumbnail
          { width: 1920, quality: 'auto', fetch_format: 'auto' }, // optimized
        ],
      }),
    };

    // Create FormData for upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'default');
    Object.entries(uploadOptions).forEach(([key, value]) => {
      formData.append(key, JSON.stringify(value));
    });

    // Upload with progress tracking
    const xhr = new XMLHttpRequest();
    
    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = this.progressCallbacks.get(fileId);
          if (progress) {
            const currentTime = Date.now();
            const progressData: UploadProgress = {
              fileId,
              fileName: file.name,
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100),
              status: 'uploading',
              stage: 'upload',
              startTime: Date.now(),
              lastUpdateTime: currentTime,
              bytesPerSecond: event.loaded / ((currentTime - Date.now()) / 1000),
            };
            progress(progressData);
          }
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(this.parseCloudinaryResponse(response, file));
          } catch (error) {
            reject(new UploadError(
              'Failed to parse upload response',
              'PARSE_ERROR',
              fileId,
              file.name,
              error instanceof Error ? { message: error.message, stack: error.stack } : { error: String(error) },
              false
            ));
          }
        } else {
          reject(new UploadError(
            `Upload failed with status ${xhr.status}`,
            'UPLOAD_ERROR',
            fileId,
            file.name,
            { status: xhr.status, response: xhr.responseText },
            xhr.status >= 500
          ));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new UploadError(
          'Network error during upload',
          'NETWORK_ERROR',
          fileId,
          file.name,
          undefined,
          true
        ));
      });

      signal.addEventListener('abort', () => {
        xhr.abort();
        reject(new UploadError(
          'Upload cancelled',
          'CANCELLED',
          fileId,
          file.name,
          undefined,
          false
        ));
      });

      xhr.open('POST', `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`);
      xhr.send(formData);
    });
  }

  private parseCloudinaryResponse(response: Record<string, unknown>, originalFile: File): UploadResult {
    const eager = Array.isArray(response.eager) ? response.eager : [];
    const width = typeof response.width === 'number' ? response.width : 0;
    const height = typeof response.height === 'number' ? response.height : 0;
    
    return {
      fileId: this.generateFileId(),
      fileName: originalFile.name,
      originalUrl: String(response.secure_url || ''),
      optimizedUrl: eager[1]?.secure_url ? String(eager[1].secure_url) : undefined,
      thumbnailUrl: eager[0]?.secure_url ? String(eager[0].secure_url) : undefined,
      metadata: {
        size: typeof response.bytes === 'number' ? response.bytes : originalFile.size,
        type: String(response.resource_type || 'auto'),
        dimensions: width && height ? { width, height } : undefined,
        format: response.format ? String(response.format) : undefined,
        duration: typeof response.duration === 'number' ? response.duration : undefined,
      },
      uploadTime: Date.now(),
      publicId: String(response.public_id || ''),
      secureUrl: String(response.secure_url || ''),
      tags: Array.isArray(response.tags) ? response.tags.map(String) : [],
      folder: response.folder ? String(response.folder) : undefined,
    };
  }

  private async generateVariants(result: UploadResult, config: UploadConfig): Promise<void> {
    // Generate responsive images if enabled
    if (config.generateResponsive && config.responsiveOptions && this.isImage({ type: result.metadata.type } as File)) {
      try {
        const responsiveUrls: { [key: string]: string } = {};
        
        for (const breakpoint of config.responsiveOptions.breakpoints) {
          const transformedUrl = cloudinaryService.generateUrl(result.publicId, {
            width: breakpoint,
            quality: config.responsiveOptions.quality || 'auto',
            format: config.responsiveOptions.format || 'auto',
            crop: 'scale',
          });
          responsiveUrls[`${breakpoint}w`] = transformedUrl;
          
          // Generate retina version if enabled
          if (config.responsiveOptions.retina) {
            const retinaUrl = cloudinaryService.generateUrl(result.publicId, {
              width: breakpoint * 2,
              quality: config.responsiveOptions.quality || 'auto',
              format: config.responsiveOptions.format || 'auto',
              crop: 'scale',
            });
            responsiveUrls[`${breakpoint * 2}w`] = retinaUrl;
          }
        }
        
        result.responsiveUrls = responsiveUrls;
      } catch (error) {
        console.warn('Failed to generate responsive variants:', error);
      }
    }
  }

  private async generateImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to generate preview'));
      reader.readAsDataURL(file);
    });
  }

  private async generateVideoPreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      video.addEventListener('loadedmetadata', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        video.currentTime = 1; // Seek to 1 second
      });

      video.addEventListener('seeked', () => {
        ctx.drawImage(video, 0, 0);
        resolve(canvas.toDataURL());
        URL.revokeObjectURL(video.src);
      });

      video.addEventListener('error', () => {
        reject(new Error('Failed to generate video preview'));
        URL.revokeObjectURL(video.src);
      });

      video.src = URL.createObjectURL(file);
    });
  }

  private generateFileIcon(file: File): string {
    // Return a data URL for a file type icon
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 200;
    canvas.height = 200;
    
    // Draw a simple file icon
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, 0, 200, 200);
    ctx.fillStyle = '#64748b';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(file.type.split('/')[1]?.toUpperCase() || 'FILE', 100, 100);
    ctx.fillText(file.name, 100, 130);
    
    return canvas.toDataURL();
  }

  private async extractFilesFromDataTransfer(dataTransfer: DataTransfer): Promise<File[]> {
    const files: File[] = [];
    
    // Handle files
    if (dataTransfer.files.length > 0) {
      files.push(...Array.from(dataTransfer.files));
    }
    
    // Handle directory drops (if supported)
    if (dataTransfer.items) {
      for (const item of Array.from(dataTransfer.items)) {
        if (item.kind === 'file') {
          const entry = item.webkitGetAsEntry?.();
          if (entry) {
            const extractedFiles = await this.extractFilesFromEntry(entry);
            files.push(...extractedFiles);
          }
        }
      }
    }
    
    return files;
  }

  private async extractFilesFromEntry(entry: FileSystemEntry): Promise<File[]> {
    const files: File[] = [];
    
    if (entry.isFile) {
      const file = await new Promise<File>((resolve, reject) => {
        (entry as FileSystemFileEntry).file(resolve, reject);
      });
      files.push(file);
    } else if (entry.isDirectory) {
      const dirReader = (entry as FileSystemDirectoryEntry).createReader();
      const entries = await new Promise<FileSystemEntry[]>((resolve, reject) => {
        dirReader.readEntries(resolve, reject);
      });
      
      for (const childEntry of entries) {
        const childFiles = await this.extractFilesFromEntry(childEntry);
        files.push(...childFiles);
      }
    }
    
    return files;
  }

  private extractFileNameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      return pathname.split('/').pop() || 'download';
    } catch {
      return 'download';
    }
  }

  private generateFileId(): string {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private updateProgress(progress: UploadProgress): void {
    const callback = this.progressCallbacks.get(progress.fileId);
    if (callback) {
      callback(progress);
    }
  }

  private cleanup(fileId: string): void {
    this.progressCallbacks.delete(fileId);
    this.uploadQueue.delete(fileId);
    this.abortControllers.delete(fileId);
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private isImage(file: File): boolean {
    return file.type.startsWith('image/');
  }

  private isVideo(file: File): boolean {
    return file.type.startsWith('video/');
  }
}

// Custom error class
export class UploadError extends Error implements IUploadError {
  code: string;
  fileId?: string;
  fileName?: string;
  details?: Record<string, unknown>;
  retryable: boolean;

  constructor(
    message: string,
    code: string,
    fileId?: string,
    fileName?: string,
    details?: Record<string, unknown>,
    retryable: boolean = false
  ) {
    super(message);
    this.name = 'UploadError';
    this.code = code;
    this.fileId = fileId;
    this.fileName = fileName;
    this.details = details;
    this.retryable = retryable;
  }
}

// React hook for upload functionality
export const useUpload = (config?: Partial<UploadConfig>) => {
  const uploadHandler = UploadHandler.getInstance(config);
  
  return {
    uploadFile: uploadHandler.uploadFile.bind(uploadHandler),
    uploadFiles: uploadHandler.uploadFiles.bind(uploadHandler),
    uploadFromDrop: uploadHandler.uploadFromDrop.bind(uploadHandler),
    uploadFromUrl: uploadHandler.uploadFromUrl.bind(uploadHandler),
    cancelUpload: uploadHandler.cancelUpload.bind(uploadHandler),
    cancelAllUploads: uploadHandler.cancelAllUploads.bind(uploadHandler),
    generatePreview: uploadHandler.generatePreview.bind(uploadHandler),
    validateFiles: uploadHandler.validateFiles.bind(uploadHandler),
    getUploadStatus: uploadHandler.getUploadStatus.bind(uploadHandler),
  };
};

// Utility functions
export const UploadUtils = {
  /**
   * Format upload speed
   */
  formatSpeed: (bytesPerSecond: number): string => {
    const units = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    let size = bytesPerSecond;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  },

  /**
   * Format time remaining
   */
  formatTimeRemaining: (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    } else if (seconds < 3600) {
      return `${Math.round(seconds / 60)}m`;
    } else {
      return `${Math.round(seconds / 3600)}h`;
    }
  },

  /**
   * Calculate ETA
   */
  calculateETA: (loaded: number, total: number, bytesPerSecond: number): number => {
    const remaining = total - loaded;
    return remaining / bytesPerSecond;
  },

  /**
   * Get file icon class
   */
  getFileIconClass: (fileType: string): string => {
    if (fileType.startsWith('image/')) return 'file-image';
    if (fileType.startsWith('video/')) return 'file-video';
    if (fileType.startsWith('audio/')) return 'file-audio';
    if (fileType.includes('pdf')) return 'file-pdf';
    if (fileType.includes('word')) return 'file-word';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'file-excel';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'file-powerpoint';
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) return 'file-archive';
    return 'file-generic';
  },

  /**
   * Generate upload summary
   */
  generateUploadSummary: (result: BatchUploadResult): string => {
    const { successfulCount, failedCount, totalFiles, totalSize, uploadTime, averageSpeed } = result;
    
    return [
      `Uploaded ${successfulCount}/${totalFiles} files successfully`,
      failedCount > 0 ? `${failedCount} files failed` : '',
      `Total size: ${UploadUtils.formatBytes(totalSize)}`,
      `Upload time: ${UploadUtils.formatTimeRemaining(uploadTime / 1000)}`,
      `Average speed: ${UploadUtils.formatSpeed(averageSpeed)}`,
    ].filter(Boolean).join('\n');
  },

  /**
   * Format bytes
   */
  formatBytes: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Check if file type is supported
   */
  isFileTypeSupported: (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });
  },

  /**
   * Get optimal chunk size based on file size
   */
  getOptimalChunkSize: (fileSize: number): number => {
    if (fileSize < 10 * 1024 * 1024) return 1024 * 1024; // 1MB for small files
    if (fileSize < 100 * 1024 * 1024) return 5 * 1024 * 1024; // 5MB for medium files
    return 10 * 1024 * 1024; // 10MB for large files
  },
};

// Export singleton instance
export const uploadHandler = UploadHandler.getInstance();

export default UploadHandler;