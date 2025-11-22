import { 
  useMutation, 
  useQuery, 
  useQueryClient, 
  useInfiniteQuery
} from '@tanstack/react-query';
import { httpClient } from './client';
import { 
  ApiResponse, 
  ReviewMedia, 
  SearchParams
} from './types';

// ==================== INTERFACES ====================

export interface ReviewMediaDetailed extends ReviewMedia {
  review: {
    id: string;
    title: string;
    rating: number;
    user: {
      id: string;
      name: string;
      avatar?: string;
    };
    product: {
      id: string;
      name: string;
      image: string;
    };
  };
  metadata: {
    size: number;
    width?: number;
    height?: number;
    duration?: number; // for videos
    format: string;
    quality: 'low' | 'medium' | 'high' | 'ultra';
    encoding?: string;
    compression?: number;
  };
  analytics: {
    views: number;
    likes: number;
    shares: number;
    downloads: number;
    reports: number;
    engagementRate: number;
    averageViewTime?: number; // for videos
  };
  moderation: {
    status: 'pending' | 'approved' | 'rejected' | 'flagged';
    moderatedBy?: string;
    moderatedAt?: string;
    rejectionReason?: string;
    flags: MediaFlag[];
    autoModerationScore: number;
    humanReviewRequired: boolean;
  };
  optimization: {
    isOptimized: boolean;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    formats: MediaFormat[];
    thumbnails: MediaThumbnail[];
    optimizedAt?: string;
  };
  accessibility: {
    altText: string;
    caption?: string;
    transcript?: string; // for videos
    audioDescription?: string;
    colorContrast?: number;
    readabilityScore?: number;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
    structuredData?: Record<string, unknown>;
  };
  usage: {
    featured: boolean;
    showcaseOrder?: number;
    categories: string[];
    tags: string[];
    collections: string[];
  };
  storage: {
    provider: 'local' | 'cloudinary' | 's3' | 'gcs';
    bucket?: string;
    path: string;
    cdn: boolean;
    cdnUrl?: string;
    backupUrls: string[];
  };
  processing: {
    status: 'uploading' | 'processing' | 'completed' | 'failed';
    progress: number;
    tasks: ProcessingTask[];
    errors: string[];
    retryCount: number;
    maxRetries: number;
  };
  version: {
    current: number;
    history: MediaVersion[];
    rollbackEnabled: boolean;
  };
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaFlag {
  id: string;
  type: 'inappropriate' | 'spam' | 'copyright' | 'misleading' | 'quality' | 'other';
  reason: string;
  flaggedBy: string;
  flaggedAt: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'resolved' | 'dismissed';
  resolvedBy?: string;
  resolvedAt?: string;
  resolution?: string;
}

export interface MediaFormat {
  type: 'webp' | 'jpeg' | 'png' | 'avif' | 'mp4' | 'webm' | 'gif';
  quality: number;
  size: number;
  width?: number;
  height?: number;
  url: string;
  responsive: boolean;
  lazyLoad: boolean;
}

export interface MediaThumbnail {
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  width: number;
  height: number;
  url: string;
  quality: number;
  format: string;
}

export interface ProcessingTask {
  id: string;
  type: 'resize' | 'compress' | 'format_conversion' | 'thumbnail_generation' | 'optimization' | 'watermark';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface MediaVersion {
  version: number;
  url: string;
  changes: string[];
  createdBy: string;
  createdAt: string;
  metadata: Record<string, unknown>;
}

export interface ReviewMediaUpload {
  reviewId: string;
  files: File[];
  alt?: string;
  caption?: string;
  tags?: string[];
  category?: string;
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  autoOptimize?: boolean;
  generateThumbnails?: boolean;
  enableCDN?: boolean;
  watermark?: {
    enabled: boolean;
    position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'center';
    opacity: number;
    text?: string;
    image?: string;
  };
}

export interface ReviewMediaBulkAction {
  mediaIds: string[];
  action: 'approve' | 'reject' | 'delete' | 'optimize' | 'feature' | 'unfeature' | 'tag' | 'untag' | 'move';
  params?: Record<string, unknown>;
  reason?: string;
  notify?: boolean;
}

export interface ReviewMediaSearch extends SearchParams {
  reviewId?: string;
  productId?: string;
  userId?: string;
  type?: 'image' | 'video';
  status?: 'pending' | 'approved' | 'rejected' | 'flagged';
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  featured?: boolean;
  tags?: string[];
  category?: string;
  minSize?: number;
  maxSize?: number;
  minViews?: number;
  maxViews?: number;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'views' | 'likes' | 'size' | 'quality' | 'engagement';
  includeMetadata?: boolean;
  includeAnalytics?: boolean;
}

export interface MediaAnalytics {
  totalMedia: number;
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  totalDownloads: number;
  averageRating: number;
  storageUsed: number;
  bandwidthUsed: number;
  popularFormats: Array<{
    format: string;
    count: number;
    percentage: number;
  }>;
  qualityDistribution: Array<{
    quality: string;
    count: number;
    percentage: number;
  }>;
  engagementMetrics: {
    averageViewTime: number;
    bounceRate: number;
    interactionRate: number;
    shareRate: number;
  };
  performanceMetrics: {
    averageLoadTime: number;
    cacheHitRate: number;
    errorRate: number;
    optimizationSavings: number;
  };
  trendsData: Array<{
    date: string;
    uploads: number;
    views: number;
    engagement: number;
  }>;
}

export interface MediaTemplate {
  id: string;
  name: string;
  description: string;
  type: 'image' | 'video';
  settings: {
    dimensions: {
      width: number;
      height: number;
      aspectRatio: string;
    };
    quality: 'low' | 'medium' | 'high' | 'ultra';
    formats: string[];
    compression: number;
    optimization: boolean;
    watermark?: {
      enabled: boolean;
      position: string;
      opacity: number;
      text?: string;
      image?: string;
    };
    thumbnails: {
      generate: boolean;
      sizes: string[];
      quality: number;
    };
  };
  restrictions: {
    maxSize: number;
    allowedFormats: string[];
    minDimensions?: {
      width: number;
      height: number;
    };
    maxDimensions?: {
      width: number;
      height: number;
    };
  };
  usage: {
    category: string;
    tags: string[];
    defaultAlt: string;
    seoOptimized: boolean;
  };
  isActive: boolean;
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaCollection {
  id: string;
  name: string;
  description: string;
  type: 'manual' | 'smart';
  criteria?: {
    tags?: string[];
    category?: string;
    quality?: string;
    dateRange?: [string, string];
    userIds?: string[];
    productIds?: string[];
  };
  media: ReviewMediaDetailed[];
  mediaCount: number;
  totalSize: number;
  lastUpdated: string;
  shareSettings: {
    isPublic: boolean;
    shareUrl?: string;
    accessLevel: 'view' | 'download' | 'edit';
    expiresAt?: string;
  };
  analytics: {
    views: number;
    downloads: number;
    shares: number;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaModerationQueue {
  id: string;
  mediaId: string;
  media: ReviewMediaDetailed;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  flags: MediaFlag[];
  autoModerationResults: {
    score: number;
    tags: string[];
    concerns: string[];
    confidence: number;
  };
  humanReviewNotes?: string;
  estimatedReviewTime: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== API SERVICE CLASS ====================

export class ReviewMediaApiService {
  private readonly baseUrl = '/api/v1/review-media';

  // ==================== CRUD Operations ====================

  async getAll(params?: ReviewMediaSearch): Promise<ApiResponse<ReviewMediaDetailed[]>> {
    return httpClient.get(this.baseUrl, { params });
  }

  async getById(id: string, includeAnalytics = false): Promise<ApiResponse<ReviewMediaDetailed>> {
    return httpClient.get(`${this.baseUrl}/${id}`, { 
      params: { includeAnalytics } 
    });
  }

  async create(data: ReviewMediaUpload): Promise<ApiResponse<ReviewMediaDetailed[]>> {
    const formData = new FormData();
    
    // Add files
    data.files.forEach((file) => {
      formData.append(`files`, file);
    });
    
    // Add metadata
    formData.append('reviewId', data.reviewId);
    if (data.alt) formData.append('alt', data.alt);
    if (data.caption) formData.append('caption', data.caption);
    if (data.tags) formData.append('tags', JSON.stringify(data.tags));
    if (data.category) formData.append('category', data.category);
    if (data.quality) formData.append('quality', data.quality);
    if (data.autoOptimize !== undefined) formData.append('autoOptimize', String(data.autoOptimize));
    if (data.generateThumbnails !== undefined) formData.append('generateThumbnails', String(data.generateThumbnails));
    if (data.enableCDN !== undefined) formData.append('enableCDN', String(data.enableCDN));
    if (data.watermark) formData.append('watermark', JSON.stringify(data.watermark));

    return httpClient.upload(this.baseUrl, formData);
  }

  async update(id: string, data: Partial<ReviewMediaDetailed>): Promise<ApiResponse<ReviewMediaDetailed>> {
    return httpClient.put(`${this.baseUrl}/${id}`, data);
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return httpClient.delete(`${this.baseUrl}/${id}`);
  }

  async bulkDelete(ids: string[]): Promise<ApiResponse<{ deleted: string[]; failed: string[] }>> {
    return httpClient.post(`${this.baseUrl}/bulk-delete`, { ids });
  }

  // ==================== Media Processing ====================

  async optimize(id: string, options?: {
    quality?: 'low' | 'medium' | 'high' | 'ultra';
    formats?: string[];
    generateThumbnails?: boolean;
    preserveOriginal?: boolean;
  }): Promise<ApiResponse<ReviewMediaDetailed>> {
    return httpClient.post(`${this.baseUrl}/${id}/optimize`, options);
  }

  async bulkOptimize(ids: string[], options?: {
    quality?: 'low' | 'medium' | 'high' | 'ultra';
    formats?: string[];
    generateThumbnails?: boolean;
    preserveOriginal?: boolean;
  }): Promise<ApiResponse<{ processed: string[]; failed: string[] }>> {
    return httpClient.post(`${this.baseUrl}/bulk-optimize`, { ids, ...options });
  }

  async generateThumbnails(id: string, sizes?: string[]): Promise<ApiResponse<MediaThumbnail[]>> {
    return httpClient.post(`${this.baseUrl}/${id}/thumbnails`, { sizes });
  }

  async convertFormat(id: string, targetFormat: string, quality?: number): Promise<ApiResponse<ReviewMediaDetailed>> {
    return httpClient.post(`${this.baseUrl}/${id}/convert`, { targetFormat, quality });
  }

  async addWatermark(id: string, watermark: {
    position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'center';
    opacity: number;
    text?: string;
    image?: string;
  }): Promise<ApiResponse<ReviewMediaDetailed>> {
    return httpClient.post(`${this.baseUrl}/${id}/watermark`, watermark);
  }

  async removeWatermark(id: string): Promise<ApiResponse<ReviewMediaDetailed>> {
    return httpClient.delete(`${this.baseUrl}/${id}/watermark`);
  }

  // ==================== Moderation ====================

  async approve(id: string, reason?: string): Promise<ApiResponse<ReviewMediaDetailed>> {
    return httpClient.post(`${this.baseUrl}/${id}/approve`, { reason });
  }

  async reject(id: string, reason: string): Promise<ApiResponse<ReviewMediaDetailed>> {
    return httpClient.post(`${this.baseUrl}/${id}/reject`, { reason });
  }

  async flag(id: string, flag: {
    type: 'inappropriate' | 'spam' | 'copyright' | 'misleading' | 'quality' | 'other';
    reason: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<ApiResponse<ReviewMediaDetailed>> {
    return httpClient.post(`${this.baseUrl}/${id}/flag`, flag);
  }

  async unflag(id: string, flagId: string): Promise<ApiResponse<ReviewMediaDetailed>> {
    return httpClient.delete(`${this.baseUrl}/${id}/flags/${flagId}`);
  }

  async getModerationQueue(params?: {
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    assignedTo?: string;
    status?: 'pending' | 'in_review' | 'completed';
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<MediaModerationQueue[]>> {
    return httpClient.get(`${this.baseUrl}/moderation-queue`, { params });
  }

  async assignModerator(id: string, moderatorId: string): Promise<ApiResponse<MediaModerationQueue>> {
    return httpClient.post(`${this.baseUrl}/${id}/assign-moderator`, { moderatorId });
  }

  async bulkModerate(action: ReviewMediaBulkAction): Promise<ApiResponse<{ processed: string[]; failed: string[] }>> {
    return httpClient.post(`${this.baseUrl}/bulk-moderate`, action);
  }

  // ==================== Analytics & Reporting ====================

  async getAnalytics(params?: {
    period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
    includeComparison?: boolean;
  }): Promise<ApiResponse<MediaAnalytics>> {
    return httpClient.get(`${this.baseUrl}/analytics`, { params });
  }

  async getMediaStats(id: string): Promise<ApiResponse<{
    views: number;
    likes: number;
    shares: number;
    downloads: number;
    engagementRate: number;
    performance: {
      loadTime: number;
      errorRate: number;
      cacheHitRate: number;
    };
    trends: Array<{
      date: string;
      views: number;
      engagement: number;
    }>;
  }>> {
    return httpClient.get(`${this.baseUrl}/${id}/stats`);
  }

  async getPopularMedia(params?: {
    period?: 'day' | 'week' | 'month';
    limit?: number;
    type?: 'image' | 'video';
    category?: string;
  }): Promise<ApiResponse<ReviewMediaDetailed[]>> {
    return httpClient.get(`${this.baseUrl}/popular`, { params });
  }

  async getTrendingMedia(params?: {
    period?: 'day' | 'week' | 'month';
    limit?: number;
    type?: 'image' | 'video';
  }): Promise<ApiResponse<ReviewMediaDetailed[]>> {
    return httpClient.get(`${this.baseUrl}/trending`, { params });
  }

  // ==================== Media Management ====================

  async feature(id: string, order?: number): Promise<ApiResponse<ReviewMediaDetailed>> {
    return httpClient.post(`${this.baseUrl}/${id}/feature`, { order });
  }

  async unfeature(id: string): Promise<ApiResponse<ReviewMediaDetailed>> {
    return httpClient.delete(`${this.baseUrl}/${id}/feature`);
  }

  async addTags(id: string, tags: string[]): Promise<ApiResponse<ReviewMediaDetailed>> {
    return httpClient.post(`${this.baseUrl}/${id}/tags`, { tags });
  }

  async removeTags(id: string, tags: string[]): Promise<ApiResponse<ReviewMediaDetailed>> {
    return httpClient.delete(`${this.baseUrl}/${id}/tags`, { data: { tags } });
  }

  async updateCategory(id: string, category: string): Promise<ApiResponse<ReviewMediaDetailed>> {
    return httpClient.put(`${this.baseUrl}/${id}/category`, { category });
  }

  async duplicate(id: string, options?: {
    copyMetadata?: boolean;
    copyTags?: boolean;
    copyAnalytics?: boolean;
  }): Promise<ApiResponse<ReviewMediaDetailed>> {
    return httpClient.post(`${this.baseUrl}/${id}/duplicate`, options);
  }

  // ==================== Templates ====================

  async getTemplates(): Promise<ApiResponse<MediaTemplate[]>> {
    return httpClient.get(`${this.baseUrl}/templates`);
  }

  async createTemplate(data: Omit<MediaTemplate, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<MediaTemplate>> {
    return httpClient.post(`${this.baseUrl}/templates`, data);
  }

  async updateTemplate(id: string, data: Partial<MediaTemplate>): Promise<ApiResponse<MediaTemplate>> {
    return httpClient.put(`${this.baseUrl}/templates/${id}`, data);
  }

  async deleteTemplate(id: string): Promise<ApiResponse<void>> {
    return httpClient.delete(`${this.baseUrl}/templates/${id}`);
  }

  async applyTemplate(mediaId: string, templateId: string): Promise<ApiResponse<ReviewMediaDetailed>> {
    return httpClient.post(`${this.baseUrl}/${mediaId}/apply-template`, { templateId });
  }

  // ==================== Collections ====================

  async getCollections(): Promise<ApiResponse<MediaCollection[]>> {
    return httpClient.get(`${this.baseUrl}/collections`);
  }

  async createCollection(data: Omit<MediaCollection, 'id' | 'mediaCount' | 'totalSize' | 'lastUpdated' | 'analytics' | 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<MediaCollection>> {
    return httpClient.post(`${this.baseUrl}/collections`, data);
  }

  async updateCollection(id: string, data: Partial<MediaCollection>): Promise<ApiResponse<MediaCollection>> {
    return httpClient.put(`${this.baseUrl}/collections/${id}`, data);
  }

  async deleteCollection(id: string): Promise<ApiResponse<void>> {
    return httpClient.delete(`${this.baseUrl}/collections/${id}`);
  }

  async addToCollection(collectionId: string, mediaIds: string[]): Promise<ApiResponse<MediaCollection>> {
    return httpClient.post(`${this.baseUrl}/collections/${collectionId}/media`, { mediaIds });
  }

  async removeFromCollection(collectionId: string, mediaIds: string[]): Promise<ApiResponse<MediaCollection>> {
    return httpClient.delete(`${this.baseUrl}/collections/${collectionId}/media`, { data: { mediaIds } });
  }

  async shareCollection(id: string, settings: {
    isPublic: boolean;
    accessLevel: 'view' | 'download' | 'edit';
    expiresAt?: string;
  }): Promise<ApiResponse<{ shareUrl: string }>> {
    return httpClient.post(`${this.baseUrl}/collections/${id}/share`, settings);
  }

  // ==================== Utilities ====================

  async search(params: ReviewMediaSearch): Promise<ApiResponse<ReviewMediaDetailed[]>> {
    return httpClient.get(`${this.baseUrl}/search`, { params });
  }

  async getStorageUsage(): Promise<ApiResponse<{
    totalUsed: number;
    limit: number;
    breakdown: Array<{
      type: string;
      size: number;
      count: number;
      percentage: number;
    }>;
  }>> {
    return httpClient.get(`${this.baseUrl}/storage-usage`);
  }

  async exportData(params?: {
    format?: 'json' | 'csv' | 'xlsx';
    includeMetadata?: boolean;
    includeAnalytics?: boolean;
    dateRange?: [string, string];
    filters?: ReviewMediaSearch;
  }): Promise<ApiResponse<{ downloadUrl: string; expiresAt: string }>> {
    return httpClient.post(`${this.baseUrl}/export`, params);
  }

  async getRecentActivity(limit = 50): Promise<ApiResponse<Array<{
    id: string;
    type: 'upload' | 'update' | 'delete' | 'approve' | 'reject' | 'flag';
    mediaId: string;
    media: {
      id: string;
      type: string;
      url: string;
      alt: string;
    };
    user: {
      id: string;
      name: string;
      avatar?: string;
    };
    timestamp: string;
    metadata?: Record<string, unknown>;
  }>>> {
    return httpClient.get(`${this.baseUrl}/activity`, { params: { limit } });
  }
}

// Create service instance
export const reviewMediaApi = new ReviewMediaApiService();

// ==================== REACT QUERY HOOKS ====================

// Query Keys
export const reviewMediaKeys = {
  all: ['reviewMedia'] as const,
  lists: () => [...reviewMediaKeys.all, 'list'] as const,
  list: (params?: ReviewMediaSearch) => [...reviewMediaKeys.lists(), params] as const,
  details: () => [...reviewMediaKeys.all, 'detail'] as const,
  detail: (id: string) => [...reviewMediaKeys.details(), id] as const,
  analytics: (params?: unknown) => [...reviewMediaKeys.all, 'analytics', params] as const,
  templates: () => [...reviewMediaKeys.all, 'templates'] as const,
  collections: () => [...reviewMediaKeys.all, 'collections'] as const,
  moderation: () => [...reviewMediaKeys.all, 'moderation'] as const,
  popular: (params?: unknown) => [...reviewMediaKeys.all, 'popular', params] as const,
  trending: (params?: unknown) => [...reviewMediaKeys.all, 'trending', params] as const,
  search: (params: ReviewMediaSearch) => [...reviewMediaKeys.all, 'search', params] as const,
  activity: () => [...reviewMediaKeys.all, 'activity'] as const,
  storage: () => [...reviewMediaKeys.all, 'storage'] as const,
};

// ==================== Query Hooks ====================

export function useReviewMedia(params?: ReviewMediaSearch) {
  return useQuery({
    queryKey: reviewMediaKeys.list(params),
    queryFn: () => reviewMediaApi.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useReviewMediaInfinite(params?: ReviewMediaSearch) {
  return useInfiniteQuery({
    queryKey: reviewMediaKeys.list(params),
    queryFn: ({ pageParam = 1 }) => 
      reviewMediaApi.getAll({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta?.hasNextPage) {
        return (lastPage.meta.page || 1) + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}

export function useReviewMediaById(id: string, includeAnalytics = false) {
  return useQuery({
    queryKey: reviewMediaKeys.detail(id),
    queryFn: () => reviewMediaApi.getById(id, includeAnalytics),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useReviewMediaAnalytics(params?: {
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
  includeComparison?: boolean;
}) {
  return useQuery({
    queryKey: reviewMediaKeys.analytics(params),
    queryFn: () => reviewMediaApi.getAnalytics(params),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

export function useMediaTemplates() {
  return useQuery({
    queryKey: reviewMediaKeys.templates(),
    queryFn: () => reviewMediaApi.getTemplates(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useMediaCollections() {
  return useQuery({
    queryKey: reviewMediaKeys.collections(),
    queryFn: () => reviewMediaApi.getCollections(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useModerationQueue(params?: {
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  status?: 'pending' | 'in_review' | 'completed';
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: reviewMediaKeys.moderation(),
    queryFn: () => reviewMediaApi.getModerationQueue(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function usePopularMedia(params?: {
  period?: 'day' | 'week' | 'month';
  limit?: number;
  type?: 'image' | 'video';
  category?: string;
}) {
  return useQuery({
    queryKey: reviewMediaKeys.popular(params),
    queryFn: () => reviewMediaApi.getPopularMedia(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useTrendingMedia(params?: {
  period?: 'day' | 'week' | 'month';
  limit?: number;
  type?: 'image' | 'video';
}) {
  return useQuery({
    queryKey: reviewMediaKeys.trending(params),
    queryFn: () => reviewMediaApi.getTrendingMedia(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useSearchReviewMedia(params: ReviewMediaSearch) {
  return useQuery({
    queryKey: reviewMediaKeys.search(params),
    queryFn: () => reviewMediaApi.search(params),
    enabled: !!(params.q || params.tags?.length || params.category),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRecentActivity(limit = 50) {
  return useQuery({
    queryKey: reviewMediaKeys.activity(),
    queryFn: () => reviewMediaApi.getRecentActivity(limit),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useStorageUsage() {
  return useQuery({
    queryKey: reviewMediaKeys.storage(),
    queryFn: () => reviewMediaApi.getStorageUsage(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

// ==================== Mutation Hooks ====================

export function useUploadReviewMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReviewMediaUpload) => reviewMediaApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.analytics() });
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.activity() });
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.storage() });
    },
  });
}

export function useUpdateReviewMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ReviewMediaDetailed> }) =>
      reviewMediaApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.activity() });
    },
  });
}

export function useDeleteReviewMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reviewMediaApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.analytics() });
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.activity() });
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.storage() });
    },
  });
}

export function useBulkDeleteReviewMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => reviewMediaApi.bulkDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.analytics() });
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.activity() });
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.storage() });
    },
  });
}

export function useOptimizeMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, options }: { 
      id: string; 
      options?: {
        quality?: 'low' | 'medium' | 'high' | 'ultra';
        formats?: string[];
        generateThumbnails?: boolean;
        preserveOriginal?: boolean;
      };
    }) => reviewMediaApi.optimize(id, options),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.storage() });
    },
  });
}

export function useApproveMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      reviewMediaApi.approve(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.moderation() });
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.activity() });
    },
  });
}

export function useRejectMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      reviewMediaApi.reject(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.moderation() });
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.activity() });
    },
  });
}

export function useFlagMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, flag }: { 
      id: string; 
      flag: {
        type: 'inappropriate' | 'spam' | 'copyright' | 'misleading' | 'quality' | 'other';
        reason: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
      };
    }) => reviewMediaApi.flag(id, flag),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.moderation() });
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.activity() });
    },
  });
}

export function useBulkModerateMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (action: ReviewMediaBulkAction) => reviewMediaApi.bulkModerate(action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.moderation() });
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.activity() });
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.analytics() });
    },
  });
}

export function useFeatureMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, order }: { id: string; order?: number }) =>
      reviewMediaApi.feature(id, order),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.popular() });
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.activity() });
    },
  });
}

export function useCreateMediaTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<MediaTemplate, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>) =>
      reviewMediaApi.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.templates() });
    },
  });
}

export function useCreateMediaCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<MediaCollection, 'id' | 'mediaCount' | 'totalSize' | 'lastUpdated' | 'analytics' | 'createdBy' | 'createdAt' | 'updatedAt'>) =>
      reviewMediaApi.createCollection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewMediaKeys.collections() });
    },
  });
}

export function useExportMediaData() {
  return useMutation({
    mutationFn: (params?: {
      format?: 'json' | 'csv' | 'xlsx';
      includeMetadata?: boolean;
      includeAnalytics?: boolean;
      dateRange?: [string, string];
      filters?: ReviewMediaSearch;
    }) => reviewMediaApi.exportData(params),
  });
}

// Export all hooks as a convenience object
export const useReviewMediaApi = {
  // Queries
  useReviewMedia,
  useReviewMediaInfinite,
  useReviewMediaById,
  useReviewMediaAnalytics,
  useMediaTemplates,
  useMediaCollections,
  useModerationQueue,
  usePopularMedia,
  useTrendingMedia,
  useSearchReviewMedia,
  useRecentActivity,
  useStorageUsage,
  
  // Mutations
  useUploadReviewMedia,
  useUpdateReviewMedia,
  useDeleteReviewMedia,
  useBulkDeleteReviewMedia,
  useOptimizeMedia,
  useApproveMedia,
  useRejectMedia,
  useFlagMedia,
  useBulkModerateMedia,
  useFeatureMedia,
  useCreateMediaTemplate,
  useCreateMediaCollection,
  useExportMediaData,
};

export default reviewMediaApi;
