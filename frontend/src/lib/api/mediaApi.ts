import { HttpClient } from './client';
import { endpoints } from './endpoints';
import { 
  ApiResponse, 
  PaginationParams,
  SearchParams 
} from './types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { buildPaginationParams, buildSearchParams } from './utils';

/**
 * Media API Service
 * Handles file uploads, media management, and digital asset organization
 */

interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  caption?: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'other';
  folder?: string;
  tags: string[];
  metadata: {
    width?: number;
    height?: number;
    duration?: number;
    fileExtension: string;
    isPublic: boolean;
    [key: string]: unknown;
  };
  uploadedBy: string;
  uploadedAt: string;
  updatedAt: string;
}

interface MediaFolder {
  id: string;
  name: string;
  path: string;
  parentId?: string;
  isPublic: boolean;
  fileCount: number;
  size: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  children?: MediaFolder[];
}

interface MediaStats {
  totalFiles: number;
  totalSize: number;
  filesByType: Record<string, number>;
  recentUploads: number;
  publicFiles: number;
  privateFiles: number;
  storageUsed: number;
  storageLimit: number;
}

interface UploadProgress {
  fileId: string;
  filename: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string;
}

class MediaApiService {
  private client: HttpClient;

  constructor() {
    this.client = new HttpClient();
  }

  // File Retrieval

  // Get media files
  async getMediaFiles(params?: SearchParams & PaginationParams & {
    type?: 'image' | 'video' | 'audio' | 'document' | 'other';
    folderId?: string;
    tags?: string[];
    mimeType?: string;
    sizeRange?: {
      min: number;
      max: number;
    };
    dateRange?: {
      start: string;
      end: string;
    };
    isPublic?: boolean;
    sortBy?: 'name' | 'size' | 'date' | 'type';
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<MediaFile[]>> {
    const queryParams = {
      ...buildSearchParams(params || {}),
      ...buildPaginationParams(params || {}),
      ...(params?.type && { type: params.type }),
      ...(params?.folderId && { folderId: params.folderId }),
      ...(params?.tags && { tags: params.tags.join(',') }),
      ...(params?.mimeType && { mimeType: params.mimeType }),
      ...(params?.sizeRange && {
        minSize: params.sizeRange.min,
        maxSize: params.sizeRange.max,
      }),
      ...(params?.dateRange && {
        startDate: params.dateRange.start,
        endDate: params.dateRange.end,
      }),
      ...(params?.isPublic !== undefined && { isPublic: params.isPublic }),
      ...(params?.sortBy && { sortBy: params.sortBy }),
      ...(params?.sortOrder && { sortOrder: params.sortOrder }),
    };
    
    return this.client.get<MediaFile[]>(endpoints.media.files, { params: queryParams });
  }

  // Get media file by ID
  async getMediaFileById(fileId: string): Promise<ApiResponse<MediaFile>> {
    return this.client.get<MediaFile>(endpoints.media.byId(fileId));
  }

  // Get media folders
  async getMediaFolders(params?: {
    parentId?: string;
    includeFiles?: boolean;
  }): Promise<ApiResponse<MediaFolder[]>> {
    const queryParams = {
      ...(params?.parentId && { parentId: params.parentId }),
      ...(params?.includeFiles !== undefined && { includeFiles: params.includeFiles }),
    };
    
    return this.client.get<MediaFolder[]>(endpoints.media.folders, { params: queryParams });
  }

  // Get folder by ID
  async getFolderById(folderId: string): Promise<ApiResponse<MediaFolder>> {
    return this.client.get<MediaFolder>(endpoints.media.folderById(folderId));
  }

  // Get recent uploads
  async getRecentUploads(limit?: number): Promise<ApiResponse<MediaFile[]>> {
    const params = limit ? { limit } : {};
    return this.client.get<MediaFile[]>(endpoints.media.recent, { params });
  }

  // Search media
  async searchMedia(params: SearchParams & PaginationParams & {
    type?: 'image' | 'video' | 'audio' | 'document' | 'other';
    tags?: string[];
  }): Promise<ApiResponse<MediaFile[]>> {
    const queryParams = {
      ...buildSearchParams(params),
      ...buildPaginationParams(params),
      ...(params.type && { type: params.type }),
      ...(params.tags && { tags: params.tags.join(',') }),
    };
    
    return this.client.get<MediaFile[]>(endpoints.media.search, { params: queryParams });
  }

  // File Upload & Management

  // Upload single file
  async uploadFile(file: File, options?: {
    folderId?: string;
    alt?: string;
    caption?: string;
    tags?: string[];
    isPublic?: boolean;
    generateThumbnail?: boolean;
  }): Promise<ApiResponse<MediaFile>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });
    }
    
    return this.client.post<MediaFile>(endpoints.media.upload, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Upload multiple files
  async uploadMultipleFiles(files: File[], options?: {
    folderId?: string;
    isPublic?: boolean;
    generateThumbnails?: boolean;
    onProgress?: (progress: UploadProgress[]) => void;
  }): Promise<ApiResponse<MediaFile[]>> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && key !== 'onProgress') {
          formData.append(key, String(value));
        }
      });
    }
    
    return this.client.post<MediaFile[]>(endpoints.media.uploadMultiple, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: options?.onProgress ? (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
        const uploadProgress = files.map((file, index) => ({
          fileId: `temp-${index}`,
          filename: file.name,
          progress,
          status: 'uploading' as const,
        }));
        options.onProgress?.(uploadProgress);
      } : undefined,
    });
  }

  // Upload from URL
  async uploadFromUrl(url: string, options?: {
    filename?: string;
    folderId?: string;
    alt?: string;
    caption?: string;
    tags?: string[];
    isPublic?: boolean;
  }): Promise<ApiResponse<MediaFile>> {
    return this.client.post<MediaFile>(endpoints.media.uploadFromUrl, {
      url,
      ...options,
    });
  }

  // Update file metadata
  async updateFileMetadata(fileId: string, updates: {
    filename?: string;
    alt?: string;
    caption?: string;
    tags?: string[];
    isPublic?: boolean;
    folderId?: string;
  }): Promise<ApiResponse<MediaFile>> {
    return this.client.put<MediaFile>(endpoints.media.update(fileId), updates);
  }

  // Delete file
  async deleteFile(fileId: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(endpoints.media.delete(fileId));
  }

  // Copy file
  async copyFile(fileId: string, options?: {
    folderId?: string;
    filename?: string;
  }): Promise<ApiResponse<MediaFile>> {
    return this.client.post<MediaFile>(endpoints.media.copy(fileId), options || {});
  }

  // Move file
  async moveFile(fileId: string, folderId?: string): Promise<ApiResponse<MediaFile>> {
    return this.client.put<MediaFile>(endpoints.media.move(fileId), { folderId });
  }

  // Folder Management

  // Create folder
  async createFolder(folderData: {
    name: string;
    parentId?: string;
    isPublic?: boolean;
  }): Promise<ApiResponse<MediaFolder>> {
    return this.client.post<MediaFolder>(endpoints.media.createFolder, folderData);
  }

  // Update folder
  async updateFolder(folderId: string, updates: {
    name?: string;
    isPublic?: boolean;
  }): Promise<ApiResponse<MediaFolder>> {
    return this.client.put<MediaFolder>(endpoints.media.updateFolder(folderId), updates);
  }

  // Delete folder
  async deleteFolder(folderId: string, options?: {
    deleteFiles?: boolean;
    moveTo?: string;
  }): Promise<ApiResponse<{ message: string }>> {
    const params = options ? {
      ...(options.deleteFiles !== undefined && { deleteFiles: options.deleteFiles }),
      ...(options.moveTo && { moveTo: options.moveTo }),
    } : {};
    
    return this.client.delete<{ message: string }>(endpoints.media.deleteFolder(folderId), { params });
  }

  // Image Processing

  // Resize image
  async resizeImage(fileId: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
    maintainAspectRatio?: boolean;
  }): Promise<ApiResponse<MediaFile>> {
    return this.client.post<MediaFile>(endpoints.media.resize(fileId), options);
  }

  // Crop image
  async cropImage(fileId: string, options: {
    x: number;
    y: number;
    width: number;
    height: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
  }): Promise<ApiResponse<MediaFile>> {
    return this.client.post<MediaFile>(endpoints.media.crop(fileId), options);
  }

  // Generate thumbnail
  async generateThumbnail(fileId: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
  }): Promise<ApiResponse<{
    thumbnailUrl: string;
  }>> {
    return this.client.post<{
      thumbnailUrl: string;
    }>(endpoints.media.thumbnail(fileId), options || {});
  }

  // Optimize image
  async optimizeImage(fileId: string, options?: {
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
    progressive?: boolean;
  }): Promise<ApiResponse<MediaFile>> {
    return this.client.post<MediaFile>(endpoints.media.optimize(fileId), options || {});
  }

  // Media Analytics

  // Get media statistics
  async getMediaStatistics(): Promise<ApiResponse<MediaStats>> {
    return this.client.get<MediaStats>(endpoints.media.statistics);
  }

  // Get file usage
  async getFileUsage(fileId: string): Promise<ApiResponse<Array<{
    type: 'product' | 'blog' | 'page' | 'other';
    id: string;
    title: string;
    url: string;
  }>>> {
    return this.client.get<Array<{
      type: 'product' | 'blog' | 'page' | 'other';
      id: string;
      title: string;
      url: string;
    }>>(endpoints.media.usage(fileId));
  }

  // Get storage usage
  async getStorageUsage(): Promise<ApiResponse<{
    totalUsed: number;
    totalLimit: number;
    usageByType: Record<string, number>;
    usageByFolder: Array<{
      folderId: string;
      folderName: string;
      size: number;
      fileCount: number;
    }>;
    recentUsage: Array<{
      date: string;
      size: number;
      uploads: number;
    }>;
  }>> {
    return this.client.get<{
      totalUsed: number;
      totalLimit: number;
      usageByType: Record<string, number>;
      usageByFolder: Array<{
        folderId: string;
        folderName: string;
        size: number;
        fileCount: number;
      }>;
      recentUsage: Array<{
        date: string;
        size: number;
        uploads: number;
      }>;
    }>(endpoints.media.storageUsage);
  }

  // Bulk Operations

  // Bulk delete files
  async bulkDeleteFiles(fileIds: string[]): Promise<ApiResponse<{
    message: string;
    deletedCount: number;
    errors: Array<{
      fileId: string;
      error: string;
    }>;
  }>> {
    return this.client.delete<{
      message: string;
      deletedCount: number;
      errors: Array<{
        fileId: string;
        error: string;
      }>;
    }>(endpoints.media.bulkDelete, {
      data: { fileIds },
    });
  }

  // Bulk move files
  async bulkMoveFiles(fileIds: string[], folderId?: string): Promise<ApiResponse<{
    message: string;
    movedCount: number;
    errors: Array<{
      fileId: string;
      error: string;
    }>;
  }>> {
    return this.client.put<{
      message: string;
      movedCount: number;
      errors: Array<{
        fileId: string;
        error: string;
      }>;
    }>(endpoints.media.bulkMove, {
      fileIds,
      folderId,
    });
  }

  // Bulk update metadata
  async bulkUpdateMetadata(fileIds: string[], updates: {
    tags?: string[];
    isPublic?: boolean;
    alt?: string;
  }): Promise<ApiResponse<{
    message: string;
    updatedCount: number;
    errors: Array<{
      fileId: string;
      error: string;
    }>;
  }>> {
    return this.client.put<{
      message: string;
      updatedCount: number;
      errors: Array<{
        fileId: string;
        error: string;
      }>;
    }>(endpoints.media.bulkUpdate, {
      fileIds,
      updates,
    });
  }

  // CDN & Delivery

  // Generate signed URL
  async generateSignedUrl(fileId: string, options?: {
    expiresIn?: number;
    download?: boolean;
  }): Promise<ApiResponse<{
    signedUrl: string;
    expiresAt: string;
  }>> {
    return this.client.post<{
      signedUrl: string;
      expiresAt: string;
    }>(endpoints.media.signedUrl(fileId), options || {});
  }

  // Purge CDN cache
  async purgeCdnCache(fileIds: string[]): Promise<ApiResponse<{
    message: string;
    purgedCount: number;
  }>> {
    return this.client.post<{
      message: string;
      purgedCount: number;
    }>(endpoints.media.purgeCdn, { fileIds });
  }

  // Get CDN statistics
  async getCdnStatistics(params?: {
    dateRange?: {
      start: string;
      end: string;
    };
  }): Promise<ApiResponse<{
    totalRequests: number;
    bandwidth: number;
    cacheHitRatio: number;
    topFiles: Array<{
      fileId: string;
      filename: string;
      requests: number;
      bandwidth: number;
    }>;
    regionStats: Record<string, {
      requests: number;
      bandwidth: number;
    }>;
  }>> {
    const queryParams = {
      ...(params?.dateRange && {
        startDate: params.dateRange.start,
        endDate: params.dateRange.end,
      }),
    };
    
    return this.client.get<{
      totalRequests: number;
      bandwidth: number;
      cacheHitRatio: number;
      topFiles: Array<{
        fileId: string;
        filename: string;
        requests: number;
        bandwidth: number;
      }>;
      regionStats: Record<string, {
        requests: number;
        bandwidth: number;
      }>;
    }>(endpoints.media.cdnStats, { params: queryParams });
  }
}

// Create service instance
const mediaApiService = new MediaApiService();

// React Query Hooks

// File Retrieval
export const useMediaFiles = (params?: SearchParams & PaginationParams & {
  type?: 'image' | 'video' | 'audio' | 'document' | 'other';
  folderId?: string;
  tags?: string[];
  mimeType?: string;
  sizeRange?: {
    min: number;
    max: number;
  };
  dateRange?: {
    start: string;
    end: string;
  };
  isPublic?: boolean;
  sortBy?: 'name' | 'size' | 'date' | 'type';
  sortOrder?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: ['media', 'files', params],
    queryFn: () => mediaApiService.getMediaFiles(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useMediaFile = (fileId: string) => {
  return useQuery({
    queryKey: ['media', 'file', fileId],
    queryFn: () => mediaApiService.getMediaFileById(fileId),
    enabled: !!fileId,
    staleTime: 10 * 60 * 1000,
  });
};

export const useMediaFolders = (params?: {
  parentId?: string;
  includeFiles?: boolean;
}) => {
  return useQuery({
    queryKey: ['media', 'folders', params],
    queryFn: () => mediaApiService.getMediaFolders(params),
    staleTime: 15 * 60 * 1000,
  });
};

export const useFolder = (folderId: string) => {
  return useQuery({
    queryKey: ['media', 'folder', folderId],
    queryFn: () => mediaApiService.getFolderById(folderId),
    enabled: !!folderId,
    staleTime: 15 * 60 * 1000,
  });
};

export const useRecentUploads = (limit?: number) => {
  return useQuery({
    queryKey: ['media', 'recent', limit],
    queryFn: () => mediaApiService.getRecentUploads(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useSearchMedia = (params: SearchParams & PaginationParams & {
  type?: 'image' | 'video' | 'audio' | 'document' | 'other';
  tags?: string[];
}) => {
  return useQuery({
    queryKey: ['media', 'search', params],
    queryFn: () => mediaApiService.searchMedia(params),
    enabled: !!params.q,
    staleTime: 5 * 60 * 1000,
  });
};

// Analytics
export const useMediaStatistics = () => {
  return useQuery({
    queryKey: ['media', 'statistics'],
    queryFn: () => mediaApiService.getMediaStatistics(),
    staleTime: 15 * 60 * 1000,
  });
};

export const useFileUsage = (fileId: string) => {
  return useQuery({
    queryKey: ['media', 'usage', fileId],
    queryFn: () => mediaApiService.getFileUsage(fileId),
    enabled: !!fileId,
    staleTime: 30 * 60 * 1000,
  });
};

export const useStorageUsage = () => {
  return useQuery({
    queryKey: ['media', 'storage-usage'],
    queryFn: () => mediaApiService.getStorageUsage(),
    staleTime: 10 * 60 * 1000,
  });
};

export const useCdnStatistics = (params?: {
  dateRange?: {
    start: string;
    end: string;
  };
}) => {
  return useQuery({
    queryKey: ['media', 'cdn-stats', params],
    queryFn: () => mediaApiService.getCdnStatistics(params),
    staleTime: 15 * 60 * 1000,
  });
};

// Mutation Hooks

// File Upload & Management
export const useUploadFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ file, options }: {
      file: File;
      options?: {
        folderId?: string;
        alt?: string;
        caption?: string;
        tags?: string[];
        isPublic?: boolean;
        generateThumbnail?: boolean;
      };
    }) => mediaApiService.uploadFile(file, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
};

export const useUploadMultipleFiles = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ files, options }: {
      files: File[];
      options?: {
        folderId?: string;
        isPublic?: boolean;
        generateThumbnails?: boolean;
        onProgress?: (progress: UploadProgress[]) => void;
      };
    }) => mediaApiService.uploadMultipleFiles(files, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
};

export const useUploadFromUrl = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ url, options }: {
      url: string;
      options?: {
        filename?: string;
        folderId?: string;
        alt?: string;
        caption?: string;
        tags?: string[];
        isPublic?: boolean;
      };
    }) => mediaApiService.uploadFromUrl(url, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
};

export const useUpdateFileMetadata = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ fileId, updates }: {
      fileId: string;
      updates: {
        filename?: string;
        alt?: string;
        caption?: string;
        tags?: string[];
        isPublic?: boolean;
        folderId?: string;
      };
    }) => mediaApiService.updateFileMetadata(fileId, updates),
    onSuccess: (_, { fileId }) => {
      queryClient.invalidateQueries({ queryKey: ['media', 'file', fileId] });
      queryClient.invalidateQueries({ queryKey: ['media', 'files'] });
    },
  });
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (fileId: string) => mediaApiService.deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
};

export const useCopyFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ fileId, options }: {
      fileId: string;
      options?: {
        folderId?: string;
        filename?: string;
      };
    }) => mediaApiService.copyFile(fileId, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
};

export const useMoveFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ fileId, folderId }: {
      fileId: string;
      folderId?: string;
    }) => mediaApiService.moveFile(fileId, folderId),
    onSuccess: (_, { fileId }) => {
      queryClient.invalidateQueries({ queryKey: ['media', 'file', fileId] });
      queryClient.invalidateQueries({ queryKey: ['media', 'files'] });
    },
  });
};

// Folder Management
export const useCreateFolder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (folderData: {
      name: string;
      parentId?: string;
      isPublic?: boolean;
    }) => mediaApiService.createFolder(folderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media', 'folders'] });
    },
  });
};

export const useUpdateFolder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ folderId, updates }: {
      folderId: string;
      updates: {
        name?: string;
        isPublic?: boolean;
      };
    }) => mediaApiService.updateFolder(folderId, updates),
    onSuccess: (_, { folderId }) => {
      queryClient.invalidateQueries({ queryKey: ['media', 'folder', folderId] });
      queryClient.invalidateQueries({ queryKey: ['media', 'folders'] });
    },
  });
};

export const useDeleteFolder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ folderId, options }: {
      folderId: string;
      options?: {
        deleteFiles?: boolean;
        moveTo?: string;
      };
    }) => mediaApiService.deleteFolder(folderId, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
};

// Image Processing
export const useResizeImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ fileId, options }: {
      fileId: string;
      options: {
        width?: number;
        height?: number;
        quality?: number;
        format?: 'jpeg' | 'png' | 'webp';
        maintainAspectRatio?: boolean;
      };
    }) => mediaApiService.resizeImage(fileId, options),
    onSuccess: (_, { fileId }) => {
      queryClient.invalidateQueries({ queryKey: ['media', 'file', fileId] });
    },
  });
};

export const useCropImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ fileId, options }: {
      fileId: string;
      options: {
        x: number;
        y: number;
        width: number;
        height: number;
        quality?: number;
        format?: 'jpeg' | 'png' | 'webp';
      };
    }) => mediaApiService.cropImage(fileId, options),
    onSuccess: (_, { fileId }) => {
      queryClient.invalidateQueries({ queryKey: ['media', 'file', fileId] });
    },
  });
};

export const useGenerateThumbnail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ fileId, options }: {
      fileId: string;
      options?: {
        width?: number;
        height?: number;
        quality?: number;
      };
    }) => mediaApiService.generateThumbnail(fileId, options),
    onSuccess: (_, { fileId }) => {
      queryClient.invalidateQueries({ queryKey: ['media', 'file', fileId] });
    },
  });
};

export const useOptimizeImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ fileId, options }: {
      fileId: string;
      options?: {
        quality?: number;
        format?: 'jpeg' | 'png' | 'webp';
        progressive?: boolean;
      };
    }) => mediaApiService.optimizeImage(fileId, options),
    onSuccess: (_, { fileId }) => {
      queryClient.invalidateQueries({ queryKey: ['media', 'file', fileId] });
    },
  });
};

// Bulk Operations
export const useBulkDeleteFiles = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (fileIds: string[]) => mediaApiService.bulkDeleteFiles(fileIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
};

export const useBulkMoveFiles = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ fileIds, folderId }: {
      fileIds: string[];
      folderId?: string;
    }) => mediaApiService.bulkMoveFiles(fileIds, folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
};

export const useBulkUpdateMetadata = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ fileIds, updates }: {
      fileIds: string[];
      updates: {
        tags?: string[];
        isPublic?: boolean;
        alt?: string;
      };
    }) => mediaApiService.bulkUpdateMetadata(fileIds, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
};

// CDN & Delivery
export const useGenerateSignedUrl = () => {
  return useMutation({
    mutationFn: ({ fileId, options }: {
      fileId: string;
      options?: {
        expiresIn?: number;
        download?: boolean;
      };
    }) => mediaApiService.generateSignedUrl(fileId, options),
  });
};

export const usePurgeCdnCache = () => {
  return useMutation({
    mutationFn: (fileIds: string[]) => mediaApiService.purgeCdnCache(fileIds),
  });
};

export default mediaApiService;
