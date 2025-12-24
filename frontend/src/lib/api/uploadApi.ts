/**
 * Upload import type {
  ApiResponse,
  PaginatedResponse,
} from './types';Client
 * Comprehensive file upload management system with advanced features
 */

import { httpClient } from './client';
import { endpoints } from './endpoints';
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import type {
  ApiResponse,
} from './types';

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

/**
 * File upload types
 */
export type FileUploadType = 
  | 'image' 
  | 'document' 
  | 'video' 
  | 'audio' 
  | 'archive' 
  | 'text'
  | 'other';

/**
 * Upload status
 */
export type UploadStatus = 
  | 'pending' 
  | 'uploading' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'cancelled';

/**
 * File upload interface
 */
export interface FileUpload {
  id: string;
  originalName: string;
  fileName: string;
  filePath: string;
  url: string;
  mimeType: string;
  size: number;
  type: FileUploadType;
  status: UploadStatus;
  progress: number;
  uploadedBy: string;
  uploadedAt: string;
  metadata: {
    width?: number;
    height?: number;
    duration?: number;
    bitrate?: number;
    codec?: string;
    dimensions?: string;
    colorSpace?: string;
    orientation?: number;
  };
  thumbnails?: Array<{
    size: string;
    url: string;
    width: number;
    height: number;
  }>;
  versions?: Array<{
    version: string;
    url: string;
    size: number;
    format: string;
    quality?: string;
  }>;
  tags: string[];
  category?: string;
  description?: string;
  altText?: string;
  isPublic: boolean;
  expiresAt?: string;
  downloadCount: number;
  lastDownloaded?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Upload configuration
 */
export interface UploadConfig {
  maxFileSize: number;
  maxTotalSize: number;
  allowedMimeTypes: string[];
  allowedExtensions: string[];
  enableCompression: boolean;
  compressionQuality: number;
  generateThumbnails: boolean;
  thumbnailSizes: Array<{
    name: string;
    width: number;
    height: number;
    crop: boolean;
  }>;
  enableWatermark: boolean;
  watermarkSettings: {
    text?: string;
    image?: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    opacity: number;
    size: number;
  };
  enableVirusScan: boolean;
  autoTagging: boolean;
  generateMetadata: boolean;
  enableVersioning: boolean;
  storageProvider: 'local' | 'aws-s3' | 'google-cloud' | 'azure-blob' | 'cloudinary';
  cdn: {
    enabled: boolean;
    baseUrl?: string;
    enableOptimization: boolean;
  };
}

/**
 * Upload progress callback
 */
export interface UploadProgress {
  uploadId: string;
  fileName: string;
  progress: number;
  loaded: number;
  total: number;
  speed: number;
  estimatedTime: number;
  status: UploadStatus;
  error?: string;
}

/**
 * Batch upload result
 */
export interface BatchUploadResult {
  successful: FileUpload[];
  failed: Array<{
    fileName: string;
    error: string;
    details?: string;
  }>;
  totalSize: number;
  uploadTime: number;
  compressionSavings?: number;
}

/**
 * Upload analytics
 */
export interface UploadAnalytics {
  overview: {
    totalFiles: number;
    totalSize: number;
    totalDownloads: number;
    storageUsed: number;
    storageQuota: number;
    averageFileSize: number;
  };
  byType: Array<{
    type: FileUploadType;
    count: number;
    size: number;
    percentage: number;
  }>;
  byMonth: Array<{
    month: string;
    uploads: number;
    size: number;
    downloads: number;
  }>;
  topFiles: Array<{
    file: FileUpload;
    downloads: number;
    views: number;
  }>;
  recentActivity: Array<{
    type: 'upload' | 'download' | 'delete';
    fileName: string;
    timestamp: string;
    user: string;
  }>;
  performance: {
    averageUploadTime: number;
    averageProcessingTime: number;
    successRate: number;
    errorRate: number;
  };
}

/**
 * Upload API Service Class
 */
export class UploadApiService {
  private baseUrl = '/uploads';

  // ============================================================================
  // FILE UPLOAD OPERATIONS
  // ============================================================================

  /**
   * Upload single file
   */
  async uploadFile(
    file: File,
    options?: {
      category?: string;
      tags?: string[];
      description?: string;
      altText?: string;
      isPublic?: boolean;
      generateThumbnails?: boolean;
      enableCompression?: boolean;
      onProgress?: (progress: UploadProgress) => void;
    }
  ): Promise<ApiResponse<FileUpload>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (key !== 'onProgress' && value !== undefined) {
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }
      });
    }

    return httpClient.post(endpoints.media.upload, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent: { loaded: number; total?: number }) => {
        if (options?.onProgress && progressEvent.total) {
          const progress: UploadProgress = {
            uploadId: Date.now().toString(),
            fileName: file.name,
            progress: Math.round((progressEvent.loaded * 100) / progressEvent.total),
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            speed: 0, // Would need additional calculation
            estimatedTime: 0, // Would need additional calculation
            status: 'uploading',
          };
          options.onProgress(progress);
        }
      },
    });
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: File[],
    options?: {
      category?: string;
      tags?: string[];
      isPublic?: boolean;
      generateThumbnails?: boolean;
      enableCompression?: boolean;
      onProgress?: (progress: UploadProgress) => void;
      onFileComplete?: (file: FileUpload) => void;
    }
  ): Promise<ApiResponse<BatchUploadResult>> {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });

    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (!['onProgress', 'onFileComplete'].includes(key) && value !== undefined) {
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }
      });
    }

    return httpClient.post(endpoints.media.uploadMultiple, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent: { loaded: number; total?: number }) => {
        if (options?.onProgress && progressEvent.total) {
          const progress: UploadProgress = {
            uploadId: Date.now().toString(),
            fileName: `${files.length} files`,
            progress: Math.round((progressEvent.loaded * 100) / progressEvent.total),
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            speed: 0,
            estimatedTime: 0,
            status: 'uploading',
          };
          options.onProgress(progress);
        }
      },
    });
  }

  /**
   * Upload from URL
   */
  async uploadFromUrl(
    url: string,
    options?: {
      fileName?: string;
      category?: string;
      tags?: string[];
      description?: string;
      isPublic?: boolean;
    }
  ): Promise<ApiResponse<FileUpload>> {
    return httpClient.post(endpoints.media.uploadFromUrl, {
      url,
      ...options,
    });
  }

  /**
   * Resume upload
   */
  async resumeUpload(
    uploadId: string,
    chunk: Blob,
    chunkIndex: number,
    totalChunks: number
  ): Promise<ApiResponse<{ completed: boolean; file?: FileUpload }>> {
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('chunkIndex', chunkIndex.toString());
    formData.append('totalChunks', totalChunks.toString());

    return httpClient.post(`${this.baseUrl}/resume/${uploadId}`, formData);
  }

  /**
   * Cancel upload
   */
  async cancelUpload(uploadId: string): Promise<ApiResponse<void>> {
    return httpClient.delete(`${this.baseUrl}/cancel/${uploadId}`);
  }

  // ============================================================================
  // FILE MANAGEMENT
  // ============================================================================

  /**
   * Get all uploads
   */
  async getUploads(params?: {
    page?: number;
    limit?: number;
    type?: FileUploadType;
    category?: string;
    tags?: string[];
    search?: string;
    sortBy?: 'createdAt' | 'size' | 'downloadCount' | 'name';
    sortOrder?: 'asc' | 'desc';
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<PaginatedResponse<FileUpload>>> {
    return httpClient.get(endpoints.media.list, { params });
  }

  /**
   * Get upload by ID
   */
  async getUpload(id: string): Promise<ApiResponse<FileUpload>> {
    return httpClient.get(endpoints.media.byId(id));
  }

  /**
   * Update upload metadata
   */
  async updateUpload(
    id: string,
    updates: Partial<Pick<FileUpload, 'tags' | 'category' | 'description' | 'altText' | 'isPublic'>>
  ): Promise<ApiResponse<FileUpload>> {
    return httpClient.put(endpoints.media.update(id), updates);
  }

  /**
   * Delete upload
   */
  async deleteUpload(id: string): Promise<ApiResponse<void>> {
    return httpClient.delete(endpoints.media.delete(id));
  }

  /**
   * Copy upload
   */
  async copyUpload(id: string, options?: {
    newName?: string;
    category?: string;
    tags?: string[];
  }): Promise<ApiResponse<FileUpload>> {
    return httpClient.post(endpoints.media.copy(id), options);
  }

  /**
   * Move upload
   */
  async moveUpload(id: string, targetPath: string): Promise<ApiResponse<FileUpload>> {
    return httpClient.put(endpoints.media.move(id), { targetPath });
  }

  // ============================================================================
  // IMAGE PROCESSING
  // ============================================================================

  /**
   * Resize image
   */
  async resizeImage(
    id: string,
    options: {
      width: number;
      height: number;
      crop?: boolean;
      quality?: number;
      format?: 'jpg' | 'png' | 'webp';
    }
  ): Promise<ApiResponse<FileUpload>> {
    return httpClient.post(endpoints.media.resize(id), options);
  }

  /**
   * Crop image
   */
  async cropImage(
    id: string,
    options: {
      x: number;
      y: number;
      width: number;
      height: number;
      quality?: number;
    }
  ): Promise<ApiResponse<FileUpload>> {
    return httpClient.post(endpoints.media.crop(id), options);
  }

  /**
   * Generate thumbnail
   */
  async generateThumbnail(
    id: string,
    size: string
  ): Promise<ApiResponse<{ url: string; width: number; height: number }>> {
    return httpClient.post(endpoints.media.thumbnail(id), { size });
  }

  /**
   * Optimize image
   */
  async optimizeImage(
    id: string,
    options?: {
      quality?: number;
      format?: 'jpg' | 'png' | 'webp';
      progressive?: boolean;
      stripMetadata?: boolean;
    }
  ): Promise<ApiResponse<FileUpload>> {
    return httpClient.post(endpoints.media.optimize(id), options);
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  /**
   * Delete multiple uploads
   */
  async deleteMultipleUploads(ids: string[]): Promise<ApiResponse<{
    deleted: string[];
    failed: Array<{ id: string; error: string }>;
  }>> {
    return httpClient.delete(endpoints.media.bulkDelete, { data: { ids } });
  }

  /**
   * Move multiple uploads
   */
  async moveMultipleUploads(ids: string[], targetPath: string): Promise<ApiResponse<{
    moved: string[];
    failed: Array<{ id: string; error: string }>;
  }>> {
    return httpClient.put(endpoints.media.bulkMove, { ids, targetPath });
  }

  /**
   * Update multiple uploads
   */
  async updateMultipleUploads(updates: Array<{
    id: string;
    data: Partial<Pick<FileUpload, 'tags' | 'category' | 'description' | 'isPublic'>>;
  }>): Promise<ApiResponse<{
    updated: string[];
    failed: Array<{ id: string; error: string }>;
  }>> {
    return httpClient.put(endpoints.media.bulkUpdate, { updates });
  }

  // ============================================================================
  // FOLDERS MANAGEMENT
  // ============================================================================

  /**
   * Get folders
   */
  async getFolders(parentId?: string): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    path: string;
    parentId?: string;
    fileCount: number;
    size: number;
    createdAt: string;
    updatedAt: string;
  }>>> {
    return httpClient.get(endpoints.media.folders, { params: { parentId } });
  }

  /**
   * Create folder
   */
  async createFolder(data: {
    name: string;
    parentId?: string;
    description?: string;
  }): Promise<ApiResponse<{
    id: string;
    name: string;
    path: string;
    parentId?: string;
  }>> {
    return httpClient.post(endpoints.media.createFolder, data);
  }

  /**
   * Update folder
   */
  async updateFolder(
    id: string,
    updates: {
      name?: string;
      description?: string;
    }
  ): Promise<ApiResponse<{
    id: string;
    name: string;
    path: string;
  }>> {
    return httpClient.put(endpoints.media.updateFolder(id), updates);
  }

  /**
   * Delete folder
   */
  async deleteFolder(id: string, force: boolean = false): Promise<ApiResponse<void>> {
    return httpClient.delete(endpoints.media.deleteFolder(id), { params: { force } });
  }

  // ============================================================================
  // SEARCH & ANALYTICS
  // ============================================================================

  /**
   * Search uploads
   */
  async searchUploads(params: {
    query: string;
    type?: FileUploadType;
    category?: string;
    tags?: string[];
    limit?: number;
  }): Promise<ApiResponse<FileUpload[]>> {
    return httpClient.get(endpoints.media.search, { params });
  }

  /**
   * Get recent uploads
   */
  async getRecentUploads(limit: number = 10): Promise<ApiResponse<FileUpload[]>> {
    return httpClient.get(endpoints.media.recent, { params: { limit } });
  }

  /**
   * Get upload statistics
   */
  async getUploadStatistics(): Promise<ApiResponse<{
    totalFiles: number;
    totalSize: number;
    storageUsed: number;
    storageQuota: number;
    filesByType: Array<{ type: FileUploadType; count: number; size: number }>;
    recentActivity: Array<{
      type: 'upload' | 'delete';
      fileName: string;
      timestamp: string;
    }>;
  }>> {
    return httpClient.get(endpoints.media.statistics);
  }

  /**
   * Get storage usage
   */
  async getStorageUsage(): Promise<ApiResponse<{
    used: number;
    quota: number;
    available: number;
    usageByType: Array<{ type: FileUploadType; size: number; percentage: number }>;
    usageByMonth: Array<{ month: string; size: number }>;
  }>> {
    return httpClient.get(endpoints.media.storageUsage);
  }

  /**
   * Get upload analytics
   */
  async getUploadAnalytics(period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<ApiResponse<UploadAnalytics>> {
    return httpClient.get(`${this.baseUrl}/analytics`, { params: { period } });
  }

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  /**
   * Get upload configuration
   */
  async getUploadConfig(): Promise<ApiResponse<UploadConfig>> {
    return httpClient.get(`${this.baseUrl}/config`);
  }

  /**
   * Update upload configuration
   */
  async updateUploadConfig(config: Partial<UploadConfig>): Promise<ApiResponse<UploadConfig>> {
    return httpClient.put(`${this.baseUrl}/config`, config);
  }

  /**
   * Validate file before upload
   */
  async validateFile(file: File): Promise<ApiResponse<{
    valid: boolean;
    errors: string[];
    warnings: string[];
    estimatedProcessingTime?: number;
  }>> {
    return httpClient.post(`${this.baseUrl}/validate`, {
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    });
  }

  // ============================================================================
  // CDN & OPTIMIZATION
  // ============================================================================

  /**
   * Generate signed URL
   */
  async generateSignedUrl(
    id: string,
    options?: {
      expiresIn?: number;
      permissions?: ('read' | 'write' | 'delete')[];
    }
  ): Promise<ApiResponse<{ url: string; expiresAt: string }>> {
    return httpClient.post(endpoints.media.signedUrl(id), options);
  }

  /**
   * Purge CDN cache
   */
  async purgeCdnCache(urls?: string[]): Promise<ApiResponse<{
    purged: string[];
    failed: string[];
  }>> {
    return httpClient.post(endpoints.media.purgeCdn, { urls });
  }

  /**
   * Get CDN statistics
   */
  async getCdnStats(): Promise<ApiResponse<{
    totalRequests: number;
    bandwidth: number;
    cacheHitRate: number;
    topFiles: Array<{ url: string; requests: number; bandwidth: number }>;
  }>> {
    return httpClient.get(endpoints.media.cdnStats);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get file type from MIME type
   */
  getFileType(mimeType: string): FileUploadType {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('text/')) return 'text';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('presentation')) return 'document';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return 'archive';
    return 'other';
  }

  /**
   * Format file size
   */
  formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Validate file type
   */
  isValidFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type) || 
           allowedTypes.some(type => type.endsWith('/*') && file.type.startsWith(type.slice(0, -1)));
  }

  /**
   * Validate file size
   */
  isValidFileSize(file: File, maxSize: number): boolean {
    return file.size <= maxSize;
  }
}

// Create service instance
export const uploadService = new UploadApiService();

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

/**
 * Cache keys for upload queries
 */
export const UPLOAD_CACHE_KEYS = {
  all: ['uploads'] as const,
  lists: () => [...UPLOAD_CACHE_KEYS.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...UPLOAD_CACHE_KEYS.lists(), filters] as const,
  details: () => [...UPLOAD_CACHE_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...UPLOAD_CACHE_KEYS.details(), id] as const,
  folders: () => [...UPLOAD_CACHE_KEYS.all, 'folders'] as const,
  statistics: () => [...UPLOAD_CACHE_KEYS.all, 'statistics'] as const,
  analytics: () => [...UPLOAD_CACHE_KEYS.all, 'analytics'] as const,
  config: () => [...UPLOAD_CACHE_KEYS.all, 'config'] as const,
};

/**
 * Get uploads
 */
export const useUploads = (
  params?: Parameters<typeof uploadService.getUploads>[0],
  options?: UseQueryOptions<ApiResponse<PaginatedResponse<FileUpload>>>
) => {
  return useQuery({
    queryKey: UPLOAD_CACHE_KEYS.list(params || {}),
    queryFn: () => uploadService.getUploads(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Get upload by ID
 */
export const useUpload = (
  id: string,
  options?: UseQueryOptions<ApiResponse<FileUpload>>
) => {
  return useQuery({
    queryKey: UPLOAD_CACHE_KEYS.detail(id),
    queryFn: () => uploadService.getUpload(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Get upload statistics
 */
export const useUploadStatistics = (options?: UseQueryOptions<ApiResponse<{
  totalFiles: number;
  totalSize: number;
  storageUsed: number;
  storageQuota: number;
  filesByType: Array<{ type: FileUploadType; count: number; size: number }>;
  recentActivity: Array<{
    type: 'upload' | 'delete';
    fileName: string;
    timestamp: string;
  }>;
}>>) => {
  return useQuery({
    queryKey: UPLOAD_CACHE_KEYS.statistics(),
    queryFn: () => uploadService.getUploadStatistics(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

/**
 * Get upload configuration
 */
export const useUploadConfig = (options?: UseQueryOptions<ApiResponse<UploadConfig>>) => {
  return useQuery({
    queryKey: UPLOAD_CACHE_KEYS.config(),
    queryFn: () => uploadService.getUploadConfig(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
};

/**
 * Upload file mutation
 */
export const useUploadFile = (options?: UseMutationOptions<
  ApiResponse<FileUpload>,
  Error,
  Parameters<typeof uploadService.uploadFile>[0] & { options?: Parameters<typeof uploadService.uploadFile>[1] }
>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ options: uploadOptions, ...file }) => 
      uploadService.uploadFile(file as File, uploadOptions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UPLOAD_CACHE_KEYS.all });
      toast.success('File uploaded successfully');
    },
    onError: (error) => {
      toast.error('Failed to upload file');
      console.error('Upload file error:', error);
    },
    ...options,
  });
};

/**
 * Upload multiple files mutation
 */
export const useUploadMultipleFiles = (options?: UseMutationOptions<
  ApiResponse<BatchUploadResult>,
  Error,
  { files: File[]; options?: Parameters<typeof uploadService.uploadMultipleFiles>[1] }
>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ files, options: uploadOptions }) => 
      uploadService.uploadMultipleFiles(files, uploadOptions),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: UPLOAD_CACHE_KEYS.all });
      const result = data.data;
      if (!result) return;
      const { successful, failed } = result;
      toast.success(`${successful.length} file${successful.length > 1 ? 's' : ''} uploaded successfully`);
      if (failed.length > 0) {
        toast.error(`${failed.length} file${failed.length > 1 ? 's' : ''} failed to upload`);
      }
    },
    onError: (error) => {
      toast.error('Failed to upload files');
      console.error('Upload multiple files error:', error);
    },
    ...options,
  });
};

/**
 * Delete upload mutation
 */
export const useDeleteUpload = (options?: UseMutationOptions<
  ApiResponse<void>,
  Error,
  string
>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => uploadService.deleteUpload(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UPLOAD_CACHE_KEYS.all });
      toast.success('File deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete file');
      console.error('Delete upload error:', error);
    },
    ...options,
  });
};

/**
 * Update upload mutation
 */
export const useUpdateUpload = (options?: UseMutationOptions<
  ApiResponse<FileUpload>,
  Error,
  { id: string; updates: Parameters<typeof uploadService.updateUpload>[1] }
>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }) => uploadService.updateUpload(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: UPLOAD_CACHE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: UPLOAD_CACHE_KEYS.detail(id) });
      toast.success('File updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update file');
      console.error('Update upload error:', error);
    },
    ...options,
  });
};

export default uploadService;
