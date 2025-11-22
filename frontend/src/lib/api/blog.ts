import { HttpClient } from './client';
import { endpoints } from './endpoints';
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { ApiResponse, PaginationParams, Blog, BlogCategory, BlogTag, Author, Comment } from './types';

// Paginated Response Type
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CreateBlogRequest {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  categoryId?: string;
  tags?: string[];
  authorId?: string;
  status?: 'draft' | 'published' | 'archived' | 'scheduled';
  publishedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  isFeatured?: boolean;
  readTime?: number;
  allowComments?: boolean;
  metadata?: Record<string, unknown>;
}

export type UpdateBlogRequest = Partial<CreateBlogRequest>;

export interface BlogFilters {
  status?: 'draft' | 'published' | 'archived' | 'scheduled';
  categoryId?: string;
  authorId?: string;
  tags?: string[];
  isFeatured?: boolean;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: 'createdAt' | 'publishedAt' | 'title' | 'views' | 'likes';
  sortOrder?: 'asc' | 'desc';
}

export interface BlogAnalytics {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  averageReadTime: number;
  engagementRate: number;
  topPosts: Array<{
    id: string;
    title: string;
    views: number;
    likes: number;
    comments: number;
    engagementScore: number;
  }>;
  categoryDistribution: Array<{
    categoryId: string;
    categoryName: string;
    postCount: number;
    percentage: number;
  }>;
  authorPerformance: Array<{
    authorId: string;
    authorName: string;
    postCount: number;
    totalViews: number;
    averageEngagement: number;
  }>;
  trafficSources: Array<{
    source: string;
    visits: number;
    percentage: number;
  }>;
  dailyStats: Array<{
    date: string;
    views: number;
    likes: number;
    comments: number;
    newPosts: number;
  }>;
}

export interface BlogSEOData {
  id: string;
  title: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  readabilityScore: number;
  keywordDensity: number;
  internalLinks: number;
  externalLinks: number;
  wordCount: number;
  recommendations: string[];
}

class BlogApiClient {
  private client: HttpClient;

  constructor() {
    this.client = new HttpClient();
  }

  // CRUD Operations
  async getBlogs(params?: PaginationParams & BlogFilters): Promise<ApiResponse<PaginatedResponse<Blog>>> {
    return this.client.get(endpoints.blog.list, { params });
  }

  async getBlog(id: string): Promise<ApiResponse<Blog>> {
    return this.client.get(endpoints.blog.byId(id));
  }

  async getBlogBySlug(slug: string): Promise<ApiResponse<Blog>> {
    return this.client.get(endpoints.blog.bySlug(slug));
  }

  async getPublishedBlogs(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Blog>>> {
    return this.client.get(endpoints.blog.published, { params });
  }

  async getFeaturedBlogs(params?: { limit?: number }): Promise<ApiResponse<Blog[]>> {
    return this.client.get(endpoints.blog.featured, { params });
  }

  async createBlog(data: CreateBlogRequest): Promise<ApiResponse<Blog>> {
    return this.client.post(endpoints.blog.create, data);
  }

  async updateBlog(id: string, data: UpdateBlogRequest): Promise<ApiResponse<Blog>> {
    return this.client.put(endpoints.blog.update(id), data);
  }

  async deleteBlog(id: string): Promise<ApiResponse<void>> {
    return this.client.delete(endpoints.blog.delete(id));
  }

  async duplicateBlog(id: string): Promise<ApiResponse<Blog>> {
    return this.client.post(endpoints.blog.duplicate(id));
  }

  // Bulk Operations
  async bulkCreateBlogs(data: CreateBlogRequest[]): Promise<ApiResponse<Blog[]>> {
    return this.client.post(endpoints.blog.bulkCreate, { items: data });
  }

  async bulkUpdateBlogs(data: {
    ids: string[];
    updates: UpdateBlogRequest;
  }): Promise<ApiResponse<Blog[]>> {
    return this.client.put(endpoints.blog.bulkUpdate, data);
  }

  async bulkDeleteBlogs(ids: string[]): Promise<ApiResponse<void>> {
    return this.client.delete(endpoints.blog.bulkDelete, { data: { ids } });
  }

  async bulkPublishBlogs(ids: string[]): Promise<ApiResponse<Blog[]>> {
    return this.client.post(endpoints.blog.bulkPublish, { ids });
  }

  async bulkArchiveBlogs(ids: string[]): Promise<ApiResponse<Blog[]>> {
    return this.client.post(endpoints.blog.bulkArchive, { ids });
  }

  // Status Management
  async publishBlog(id: string, publishedAt?: string): Promise<ApiResponse<Blog>> {
    return this.client.patch(endpoints.blog.publish(id), { publishedAt });
  }

  async unpublishBlog(id: string): Promise<ApiResponse<Blog>> {
    return this.client.patch(endpoints.blog.unpublish(id));
  }

  async archiveBlog(id: string): Promise<ApiResponse<Blog>> {
    return this.client.patch(endpoints.blog.archive(id));
  }

  async scheduleBlog(id: string, publishedAt: string): Promise<ApiResponse<Blog>> {
    return this.client.patch(endpoints.blog.schedule(id), { publishedAt });
  }

  async toggleFeatured(id: string): Promise<ApiResponse<Blog>> {
    return this.client.patch(endpoints.blog.toggleFeatured(id));
  }

  // Categories
  async getCategories(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<BlogCategory>>> {
    return this.client.get(endpoints.blog.categories.list, { params });
  }

  async getCategory(id: string): Promise<ApiResponse<BlogCategory>> {
    return this.client.get(endpoints.blog.categories.byId(id));
  }

  async createCategory(data: {
    name: string;
    slug?: string;
    description?: string;
    color?: string;
    parentId?: string;
  }): Promise<ApiResponse<BlogCategory>> {
    return this.client.post(endpoints.blog.categories.create, data);
  }

  async updateCategory(id: string, data: {
    name?: string;
    slug?: string;
    description?: string;
    color?: string;
    parentId?: string;
  }): Promise<ApiResponse<BlogCategory>> {
    return this.client.put(endpoints.blog.categories.update(id), data);
  }

  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    return this.client.delete(endpoints.blog.categories.delete(id));
  }

  async getBlogsByCategory(categoryId: string, params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Blog>>> {
    return this.client.get(endpoints.blog.byCategory(categoryId), { params });
  }

  // Tags
  async getTags(params?: PaginationParams & { search?: string }): Promise<ApiResponse<PaginatedResponse<BlogTag>>> {
    return this.client.get(endpoints.blog.tags.list, { params });
  }

  async getTag(id: string): Promise<ApiResponse<BlogTag>> {
    return this.client.get(endpoints.blog.tags.byId(id));
  }

  async createTag(data: {
    name: string;
    slug?: string;
    color?: string;
    description?: string;
  }): Promise<ApiResponse<BlogTag>> {
    return this.client.post(endpoints.blog.tags.create, data);
  }

  async updateTag(id: string, data: {
    name?: string;
    slug?: string;
    color?: string;
    description?: string;
  }): Promise<ApiResponse<BlogTag>> {
    return this.client.put(endpoints.blog.tags.update(id), data);
  }

  async deleteTag(id: string): Promise<ApiResponse<void>> {
    return this.client.delete(endpoints.blog.tags.delete(id));
  }

  async getBlogsByTag(tagId: string, params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Blog>>> {
    return this.client.get(endpoints.blog.byTag(tagId), { params });
  }

  // Authors
  async getAuthors(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Author>>> {
    return this.client.get(endpoints.blog.authors.list, { params });
  }

  async getAuthor(id: string): Promise<ApiResponse<Author>> {
    return this.client.get(endpoints.blog.authors.byId(id));
  }

  async getBlogsByAuthor(authorId: string, params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Blog>>> {
    return this.client.get(endpoints.blog.byAuthor(authorId), { params });
  }

  // Comments
  async getComments(blogId: string, params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Comment>>> {
    return this.client.get(endpoints.blog.comments.byBlog(blogId), { params });
  }

  async createComment(blogId: string, data: {
    content: string;
    parentId?: string;
  }): Promise<ApiResponse<Comment>> {
    return this.client.post(endpoints.blog.comments.create(blogId), data);
  }

  async updateComment(id: string, data: {
    content: string;
  }): Promise<ApiResponse<Comment>> {
    return this.client.put(endpoints.blog.comments.update(id), data);
  }

  async deleteComment(id: string): Promise<ApiResponse<void>> {
    return this.client.delete(endpoints.blog.comments.delete(id));
  }

  async approveComment(id: string): Promise<ApiResponse<Comment>> {
    return this.client.patch(endpoints.blog.comments.approve(id));
  }

  async rejectComment(id: string): Promise<ApiResponse<Comment>> {
    return this.client.patch(endpoints.blog.comments.reject(id));
  }

  // Engagement
  async likeBlog(id: string): Promise<ApiResponse<{ liked: boolean; likesCount: number }>> {
    return this.client.post(endpoints.blog.like(id));
  }

  async unlikeBlog(id: string): Promise<ApiResponse<{ liked: boolean; likesCount: number }>> {
    return this.client.delete(endpoints.blog.unlike(id));
  }

  async viewBlog(id: string): Promise<ApiResponse<{ viewsCount: number }>> {
    return this.client.post(endpoints.blog.view(id));
  }

  async shareBlog(id: string, platform: string): Promise<ApiResponse<{ sharesCount: number }>> {
    return this.client.post(endpoints.blog.share(id), { platform });
  }

  // Search and Filtering
  async searchBlogs(query: string, params?: PaginationParams & {
    categoryId?: string;
    tags?: string[];
    authorId?: string;
  }): Promise<ApiResponse<PaginatedResponse<Blog>>> {
    return this.client.get(endpoints.blog.search, { 
      params: { 
        query, 
        ...params 
      } 
    });
  }

  async getRelatedBlogs(id: string, limit?: number): Promise<ApiResponse<Blog[]>> {
    return this.client.get(endpoints.blog.related(id), { params: { limit } });
  }

  async getPopularBlogs(params?: {
    period?: 'day' | 'week' | 'month' | 'year';
    limit?: number;
  }): Promise<ApiResponse<Blog[]>> {
    return this.client.get(endpoints.blog.popular, { params });
  }

  async getRecentBlogs(limit?: number): Promise<ApiResponse<Blog[]>> {
    return this.client.get(endpoints.blog.recent, { params: { limit } });
  }

  // Analytics
  async getBlogAnalytics(params?: {
    dateFrom?: string;
    dateTo?: string;
    categoryId?: string;
    authorId?: string;
  }): Promise<ApiResponse<BlogAnalytics>> {
    return this.client.get(endpoints.blog.analytics, { params });
  }

  async getBlogStats(id: string): Promise<ApiResponse<{
    views: number;
    likes: number;
    shares: number;
    comments: number;
    readTime: number;
    engagementRate: number;
    bounceRate: number;
    timeOnPage: number;
  }>> {
    return this.client.get(endpoints.blog.stats(id));
  }

  async getTrendingTopics(params?: {
    period?: 'day' | 'week' | 'month';
    limit?: number;
  }): Promise<ApiResponse<Array<{
    topic: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
    percentage: number;
  }>>> {
    return this.client.get(endpoints.blog.trending, { params });
  }

  // SEO
  async getBlogSEO(id: string): Promise<ApiResponse<BlogSEOData>> {
    return this.client.get(endpoints.blog.seo(id));
  }

  async analyzeBlogSEO(id: string): Promise<ApiResponse<{
    score: number;
    issues: Array<{
      type: 'error' | 'warning' | 'info';
      message: string;
      suggestion: string;
    }>;
    recommendations: string[];
  }>> {
    return this.client.post(endpoints.blog.analyzeSEO(id));
  }

  async optimizeBlogSEO(id: string, data: {
    targetKeywords?: string[];
    seoTitle?: string;
    seoDescription?: string;
    autoOptimize?: boolean;
  }): Promise<ApiResponse<Blog>> {
    return this.client.put(endpoints.blog.optimizeSEO(id), data);
  }

  // Content Management
  async uploadImage(file: File): Promise<ApiResponse<{
    url: string;
    alt?: string;
    caption?: string;
  }>> {
    const formData = new FormData();
    formData.append('image', file);
    return this.client.post(endpoints.blog.uploadImage, formData);
  }

  async generateSlug(title: string): Promise<ApiResponse<{ slug: string }>> {
    return this.client.post(endpoints.blog.generateSlug, { title });
  }

  async previewBlog(id: string): Promise<ApiResponse<Blog>> {
    return this.client.get(endpoints.blog.preview(id));
  }

  async saveAsDraft(id: string, data: UpdateBlogRequest): Promise<ApiResponse<Blog>> {
    return this.client.put(endpoints.blog.saveAsDraft(id), data);
  }

  // Export/Import
  async exportBlogs(format: 'csv' | 'xlsx' | 'json' | 'markdown', filters?: BlogFilters): Promise<ApiResponse<Blob>> {
    return this.client.get(endpoints.blog.export, {
      params: { format, ...filters },
      responseType: 'blob'
    });
  }

  async importBlogs(file: File): Promise<ApiResponse<{
    imported: number;
    updated: number;
    errors: string[];
    duplicates: number;
  }>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.client.post(endpoints.blog.import, formData);
  }

  // Content Generation (AI)
  async generateContent(data: {
    topic: string;
    keywords?: string[];
    tone?: 'formal' | 'casual' | 'professional' | 'friendly';
    length?: 'short' | 'medium' | 'long';
    format?: 'article' | 'guide' | 'tutorial' | 'listicle';
  }): Promise<ApiResponse<{
    title: string;
    content: string;
    excerpt: string;
    suggestedTags: string[];
    seoKeywords: string[];
  }>> {
    return this.client.post(endpoints.blog.generateContent, data);
  }

  async improveBlog(id: string, improvements: string[]): Promise<ApiResponse<{
    improvedContent: string;
    suggestions: string[];
    readabilityScore: number;
  }>> {
    return this.client.post(endpoints.blog.improve(id), { improvements });
  }

  // Newsletter Integration
  async addToNewsletter(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.client.post(endpoints.blog.addToNewsletter(id));
  }

  async removeFromNewsletter(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.client.delete(endpoints.blog.removeFromNewsletter(id));
  }

  // RSS Feed
  async getRSSFeed(): Promise<ApiResponse<string>> {
    return this.client.get(endpoints.blog.rss, { responseType: 'text' });
  }

  // Sitemap
  async getSitemap(): Promise<ApiResponse<string>> {
    return this.client.get(endpoints.blog.sitemap, { responseType: 'text' });
  }
}

export const blogApi = new BlogApiClient();

// React Query Hooks

// Basic CRUD Hooks
export const useBlogs = (
  params?: PaginationParams & BlogFilters,
  options?: UseQueryOptions<ApiResponse<PaginatedResponse<Blog>>>
) => {
  return useQuery({
    queryKey: ['blogs', params],
    queryFn: () => blogApi.getBlogs(params),
    ...options,
  });
};

export const useBlog = (id: string, options?: UseQueryOptions<ApiResponse<Blog>>) => {
  return useQuery({
    queryKey: ['blogs', id],
    queryFn: () => blogApi.getBlog(id),
    enabled: !!id,
    ...options,
  });
};

export const useBlogBySlug = (slug: string, options?: UseQueryOptions<ApiResponse<Blog>>) => {
  return useQuery({
    queryKey: ['blogs', 'by-slug', slug],
    queryFn: () => blogApi.getBlogBySlug(slug),
    enabled: !!slug,
    ...options,
  });
};

export const usePublishedBlogs = (
  params?: PaginationParams,
  options?: UseQueryOptions<ApiResponse<PaginatedResponse<Blog>>>
) => {
  return useQuery({
    queryKey: ['blogs', 'published', params],
    queryFn: () => blogApi.getPublishedBlogs(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export const useFeaturedBlogs = (
  params?: { limit?: number },
  options?: UseQueryOptions<ApiResponse<Blog[]>>
) => {
  return useQuery({
    queryKey: ['blogs', 'featured', params],
    queryFn: () => blogApi.getFeaturedBlogs(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

export const useCreateBlog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateBlogRequest) => blogApi.createBlog(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      if (response.data) {
        queryClient.setQueryData(['blogs', response.data.id], response);
      }
    },
  });
};

export const useUpdateBlog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBlogRequest }) => 
      blogApi.updateBlog(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.setQueryData(['blogs', id], response);
    },
  });
};

export const useDeleteBlog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => blogApi.deleteBlog(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.removeQueries({ queryKey: ['blogs', id] });
    },
  });
};

export const useDuplicateBlog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => blogApi.duplicateBlog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });
};

// Bulk Operations Hooks
export const useBulkCreateBlogs = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateBlogRequest[]) => blogApi.bulkCreateBlogs(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });
};

export const useBulkUpdateBlogs = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ ids, updates }: { ids: string[]; updates: UpdateBlogRequest }) => 
      blogApi.bulkUpdateBlogs({ ids, updates }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });
};

export const useBulkDeleteBlogs = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ids: string[]) => blogApi.bulkDeleteBlogs(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });
};

export const useBulkPublishBlogs = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ids: string[]) => blogApi.bulkPublishBlogs(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });
};

export const useBulkArchiveBlogs = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ids: string[]) => blogApi.bulkArchiveBlogs(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });
};

// Status Management Hooks
export const usePublishBlog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, publishedAt }: { id: string; publishedAt?: string }) => 
      blogApi.publishBlog(id, publishedAt),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.setQueryData(['blogs', id], response);
    },
  });
};

export const useUnpublishBlog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => blogApi.unpublishBlog(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.setQueryData(['blogs', id], response);
    },
  });
};

export const useArchiveBlog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => blogApi.archiveBlog(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.setQueryData(['blogs', id], response);
    },
  });
};

export const useScheduleBlog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, publishedAt }: { id: string; publishedAt: string }) => 
      blogApi.scheduleBlog(id, publishedAt),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.setQueryData(['blogs', id], response);
    },
  });
};

export const useToggleFeatured = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => blogApi.toggleFeatured(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.setQueryData(['blogs', id], response);
    },
  });
};

// Categories Hooks
export const useBlogCategories = (
  params?: PaginationParams,
  options?: UseQueryOptions<ApiResponse<PaginatedResponse<BlogCategory>>>
) => {
  return useQuery({
    queryKey: ['blog-categories', params],
    queryFn: () => blogApi.getCategories(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

export const useBlogCategory = (id: string, options?: UseQueryOptions<ApiResponse<BlogCategory>>) => {
  return useQuery({
    queryKey: ['blog-categories', id],
    queryFn: () => blogApi.getCategory(id),
    enabled: !!id,
    ...options,
  });
};

export const useBlogsByCategory = (
  categoryId: string,
  params?: PaginationParams,
  options?: UseQueryOptions<ApiResponse<PaginatedResponse<Blog>>>
) => {
  return useQuery({
    queryKey: ['blogs', 'by-category', categoryId, params],
    queryFn: () => blogApi.getBlogsByCategory(categoryId, params),
    enabled: !!categoryId,
    ...options,
  });
};

export const useCreateBlogCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      name: string;
      slug?: string;
      description?: string;
      color?: string;
      parentId?: string;
    }) => blogApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-categories'] });
    },
  });
};

export const useUpdateBlogCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: {
        name?: string;
        slug?: string;
        description?: string;
        color?: string;
        parentId?: string;
      }
    }) => blogApi.updateCategory(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['blog-categories'] });
      queryClient.setQueryData(['blog-categories', id], response);
    },
  });
};

export const useDeleteBlogCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => blogApi.deleteCategory(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['blog-categories'] });
      queryClient.removeQueries({ queryKey: ['blog-categories', id] });
    },
  });
};

// Tags Hooks
export const useBlogTags = (
  params?: PaginationParams & { search?: string },
  options?: UseQueryOptions<ApiResponse<PaginatedResponse<BlogTag>>>
) => {
  return useQuery({
    queryKey: ['blog-tags', params],
    queryFn: () => blogApi.getTags(params),
    staleTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  });
};

export const useBlogTag = (id: string, options?: UseQueryOptions<ApiResponse<BlogTag>>) => {
  return useQuery({
    queryKey: ['blog-tags', id],
    queryFn: () => blogApi.getTag(id),
    enabled: !!id,
    ...options,
  });
};

export const useBlogsByTag = (
  tagId: string,
  params?: PaginationParams,
  options?: UseQueryOptions<ApiResponse<PaginatedResponse<Blog>>>
) => {
  return useQuery({
    queryKey: ['blogs', 'by-tag', tagId, params],
    queryFn: () => blogApi.getBlogsByTag(tagId, params),
    enabled: !!tagId,
    ...options,
  });
};

// Authors Hooks
export const useBlogAuthors = (
  params?: PaginationParams,
  options?: UseQueryOptions<ApiResponse<PaginatedResponse<Author>>>
) => {
  return useQuery({
    queryKey: ['blog-authors', params],
    queryFn: () => blogApi.getAuthors(params),
    staleTime: 20 * 60 * 1000, // 20 minutes
    ...options,
  });
};

export const useBlogAuthor = (id: string, options?: UseQueryOptions<ApiResponse<Author>>) => {
  return useQuery({
    queryKey: ['blog-authors', id],
    queryFn: () => blogApi.getAuthor(id),
    enabled: !!id,
    ...options,
  });
};

export const useBlogsByAuthor = (
  authorId: string,
  params?: PaginationParams,
  options?: UseQueryOptions<ApiResponse<PaginatedResponse<Blog>>>
) => {
  return useQuery({
    queryKey: ['blogs', 'by-author', authorId, params],
    queryFn: () => blogApi.getBlogsByAuthor(authorId, params),
    enabled: !!authorId,
    ...options,
  });
};

// Comments Hooks
export const useBlogComments = (
  blogId: string,
  params?: PaginationParams,
  options?: UseQueryOptions<ApiResponse<PaginatedResponse<Comment>>>
) => {
  return useQuery({
    queryKey: ['blog-comments', blogId, params],
    queryFn: () => blogApi.getComments(blogId, params),
    enabled: !!blogId,
    ...options,
  });
};

export const useCreateBlogComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ blogId, data }: { 
      blogId: string; 
      data: {
        content: string;
        parentId?: string;
      }
    }) => blogApi.createComment(blogId, data),
    onSuccess: (_, { blogId }) => {
      queryClient.invalidateQueries({ queryKey: ['blog-comments', blogId] });
    },
  });
};

// Engagement Hooks
export const useLikeBlog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => blogApi.likeBlog(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['blogs', id] });
    },
  });
};

export const useUnlikeBlog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => blogApi.unlikeBlog(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['blogs', id] });
    },
  });
};

export const useViewBlog = () => {
  return useMutation({
    mutationFn: (id: string) => blogApi.viewBlog(id),
  });
};

export const useShareBlog = () => {
  return useMutation({
    mutationFn: ({ id, platform }: { id: string; platform: string }) => 
      blogApi.shareBlog(id, platform),
  });
};

// Search and Filtering Hooks
export const useSearchBlogs = (
  query: string,
  params?: PaginationParams & {
    categoryId?: string;
    tags?: string[];
    authorId?: string;
  },
  options?: UseQueryOptions<ApiResponse<PaginatedResponse<Blog>>>
) => {
  return useQuery({
    queryKey: ['blogs', 'search', query, params],
    queryFn: () => blogApi.searchBlogs(query, params),
    enabled: !!query && query.length > 2,
    ...options,
  });
};

export const useRelatedBlogs = (
  id: string,
  limit?: number,
  options?: UseQueryOptions<ApiResponse<Blog[]>>
) => {
  return useQuery({
    queryKey: ['blogs', 'related', id, limit],
    queryFn: () => blogApi.getRelatedBlogs(id, limit),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

export const usePopularBlogs = (
  params?: {
    period?: 'day' | 'week' | 'month' | 'year';
    limit?: number;
  },
  options?: UseQueryOptions<ApiResponse<Blog[]>>
) => {
  return useQuery({
    queryKey: ['blogs', 'popular', params],
    queryFn: () => blogApi.getPopularBlogs(params),
    staleTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
};

export const useRecentBlogs = (
  limit?: number,
  options?: UseQueryOptions<ApiResponse<Blog[]>>
) => {
  return useQuery({
    queryKey: ['blogs', 'recent', limit],
    queryFn: () => blogApi.getRecentBlogs(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Analytics Hooks
export const useBlogAnalytics = (
  params?: {
    dateFrom?: string;
    dateTo?: string;
    categoryId?: string;
    authorId?: string;
  },
  options?: UseQueryOptions<ApiResponse<BlogAnalytics>>
) => {
  return useQuery({
    queryKey: ['blog-analytics', params],
    queryFn: () => blogApi.getBlogAnalytics(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

export const useBlogStats = (
  id: string,
  options?: UseQueryOptions<ApiResponse<{
    views: number;
    likes: number;
    shares: number;
    comments: number;
    readTime: number;
    engagementRate: number;
    bounceRate: number;
    timeOnPage: number;
  }>>
) => {
  return useQuery({
    queryKey: ['blogs', 'stats', id],
    queryFn: () => blogApi.getBlogStats(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export const useTrendingTopics = (
  params?: {
    period?: 'day' | 'week' | 'month';
    limit?: number;
  },
  options?: UseQueryOptions<ApiResponse<Array<{
    topic: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
    percentage: number;
  }>>>
) => {
  return useQuery({
    queryKey: ['blog-trending', params],
    queryFn: () => blogApi.getTrendingTopics(params),
    staleTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
};

// SEO Hooks
export const useBlogSEO = (
  id: string,
  options?: UseQueryOptions<ApiResponse<BlogSEOData>>
) => {
  return useQuery({
    queryKey: ['blogs', 'seo', id],
    queryFn: () => blogApi.getBlogSEO(id),
    enabled: !!id,
    staleTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  });
};

export const useAnalyzeBlogSEO = () => {
  return useMutation({
    mutationFn: (id: string) => blogApi.analyzeBlogSEO(id),
  });
};

export const useOptimizeBlogSEO = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: {
        targetKeywords?: string[];
        seoTitle?: string;
        seoDescription?: string;
        autoOptimize?: boolean;
      }
    }) => blogApi.optimizeBlogSEO(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['blogs', id] });
      queryClient.invalidateQueries({ queryKey: ['blogs', 'seo', id] });
    },
  });
};

// Content Management Hooks
export const useUploadBlogImage = () => {
  return useMutation({
    mutationFn: (file: File) => blogApi.uploadImage(file),
  });
};

export const useGenerateSlug = () => {
  return useMutation({
    mutationFn: (title: string) => blogApi.generateSlug(title),
  });
};

export const usePreviewBlog = (
  id: string,
  options?: UseQueryOptions<ApiResponse<Blog>>
) => {
  return useQuery({
    queryKey: ['blogs', 'preview', id],
    queryFn: () => blogApi.previewBlog(id),
    enabled: !!id,
    ...options,
  });
};

export const useSaveAsDraft = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBlogRequest }) => 
      blogApi.saveAsDraft(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.setQueryData(['blogs', id], response);
    },
  });
};

// Export/Import Hooks
export const useExportBlogs = () => {
  return useMutation({
    mutationFn: ({ format, filters }: { 
      format: 'csv' | 'xlsx' | 'json' | 'markdown'; 
      filters?: BlogFilters 
    }) => blogApi.exportBlogs(format, filters),
  });
};

export const useImportBlogs = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file: File) => blogApi.importBlogs(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });
};

// Content Generation Hooks
export const useGenerateContent = () => {
  return useMutation({
    mutationFn: (data: {
      topic: string;
      keywords?: string[];
      tone?: 'formal' | 'casual' | 'professional' | 'friendly';
      length?: 'short' | 'medium' | 'long';
      format?: 'article' | 'guide' | 'tutorial' | 'listicle';
    }) => blogApi.generateContent(data),
  });
};

export const useImproveBlog = () => {
  return useMutation({
    mutationFn: ({ id, improvements }: { id: string; improvements: string[] }) => 
      blogApi.improveBlog(id, improvements),
  });
};

// RSS and Sitemap Hooks
export const useRSSFeed = (options?: UseQueryOptions<ApiResponse<string>>) => {
  return useQuery({
    queryKey: ['blog-rss'],
    queryFn: () => blogApi.getRSSFeed(),
    staleTime: 60 * 60 * 1000, // 1 hour
    ...options,
  });
};

export const useBlogSitemap = (options?: UseQueryOptions<ApiResponse<string>>) => {
  return useQuery({
    queryKey: ['blog-sitemap'],
    queryFn: () => blogApi.getSitemap(),
    staleTime: 60 * 60 * 1000, // 1 hour
    ...options,
  });
};
