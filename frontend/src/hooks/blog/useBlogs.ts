import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import useApi from '../api/useApi';
import type { BlogPost, BlogCategory, BlogTag, BlogFilters, PaginationParams } from './useBlog';

export interface BlogsFilters extends BlogFilters {
  authorId?: string;
  categoryId?: string;
  tagIds?: string[];
  featured?: boolean;
  published?: boolean;
  trending?: boolean;
  recent?: boolean;
}

export interface BlogsSort {
  field: 'createdAt' | 'publishedAt' | 'title' | 'views' | 'likes' | 'comments';
  direction: 'asc' | 'desc';
}

export interface BlogsResponse {
  posts: BlogPost[];
  categories: BlogCategory[];
  tags: BlogTag[];
  authors: Array<{
    id: string;
    name: string;
    avatar?: string;
    postCount: number;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats: {
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
  };
}

export interface CreateBlogData {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  featuredImage?: File;
  categoryId: string;
  tagIds: string[];
  status: 'draft' | 'published';
  publishedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

export interface UseBlogsOptions {
  enabled?: boolean;
  initialFilters?: BlogsFilters;
  initialSort?: BlogsSort;
  enableInfiniteQuery?: boolean;
  enableRealtime?: boolean;
  cacheTime?: number;
  staleTime?: number;
}

const QUERY_KEYS = {
  blogs: ['blogs'] as const,
  blogsPaginated: (filters: BlogsFilters, pagination: PaginationParams) => 
    ['blogs', 'paginated', filters, pagination] as const,
  blogsInfinite: (filters: BlogsFilters, sort: BlogsSort) => 
    ['blogs', 'infinite', filters, sort] as const,
  blogCategories: ['blogs', 'categories'] as const,
  blogTags: ['blogs', 'tags'] as const,
  blogAuthors: ['blogs', 'authors'] as const,
  blogStats: ['blogs', 'stats'] as const,
  trendingBlogs: ['blogs', 'trending'] as const,
  featuredBlogs: ['blogs', 'featured'] as const,
  recentBlogs: ['blogs', 'recent'] as const,
} as const;

export const useBlogs = (options: UseBlogsOptions = {}) => {
  const {
    enabled = true,
    initialFilters = {},
    initialSort = { field: 'publishedAt', direction: 'desc' },
    enableInfiniteQuery = false,
    enableRealtime = false,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    staleTime = 2 * 60 * 1000, // 2 minutes
  } = options;

  const api = useApi();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<BlogsFilters>(initialFilters);
  const [sort, setSort] = useState<BlogsSort>(initialSort);
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    limit: 12,
    sortBy: initialSort.field as "createdAt" | "publishedAt" | "title" | "views" | "likes",
    sortOrder: initialSort.direction,
  });

  // Build query parameters
  const buildQueryParams = useCallback((
    currentFilters: BlogsFilters, 
    currentPagination: PaginationParams
  ) => {
    const params = new URLSearchParams();
    
    if (currentPagination.page) params.append('page', currentPagination.page.toString());
    if (currentPagination.limit) params.append('limit', currentPagination.limit.toString());
    if (currentPagination.sortBy) params.append('sortBy', currentPagination.sortBy);
    if (currentPagination.sortOrder) params.append('sortOrder', currentPagination.sortOrder);
    
    if (currentFilters.search) params.append('search', currentFilters.search);
    if (currentFilters.category) params.append('category', currentFilters.category);
    if (currentFilters.author) params.append('author', currentFilters.author);
    if (currentFilters.status) params.append('status', currentFilters.status);
    if (currentFilters.featured !== undefined) params.append('featured', currentFilters.featured.toString());
    if (currentFilters.dateFrom) params.append('dateFrom', currentFilters.dateFrom);
    if (currentFilters.dateTo) params.append('dateTo', currentFilters.dateTo);
    
    if (currentFilters.tags && currentFilters.tags.length > 0) {
      currentFilters.tags.forEach(tag => params.append('tags[]', tag));
    }
    
    if (currentFilters.tagIds && currentFilters.tagIds.length > 0) {
      currentFilters.tagIds.forEach(tagId => params.append('tagIds[]', tagId));
    }

    return params.toString();
  }, []);

  // Paginated blogs query
  const blogsQuery = useQuery({
    queryKey: QUERY_KEYS.blogsPaginated(filters, pagination),
    queryFn: async (): Promise<BlogsResponse> => {
      const queryParams = buildQueryParams(filters, pagination);
      const response = await api.get<BlogsResponse>(`/blogs?${queryParams}`);
      return response || {
        posts: [],
        categories: [],
        tags: [],
        authors: [],
        pagination: { page: 1, limit: 12, total: 0, pages: 0, hasNext: false, hasPrev: false },
        stats: { totalPosts: 0, publishedPosts: 0, draftPosts: 0, totalViews: 0, totalLikes: 0, totalComments: 0 }
      };
    },
    enabled: enabled && !enableInfiniteQuery,
    staleTime,
    gcTime: cacheTime,
  });

  // Infinite blogs query
  const infiniteBlogsQuery = useInfiniteQuery({
    queryKey: QUERY_KEYS.blogsInfinite(filters, sort),
    queryFn: async ({ pageParam = 1 }) => {
      const currentPagination = { ...pagination, page: pageParam };
      const queryParams = buildQueryParams(filters, currentPagination);
      const response = await api.get<BlogsResponse>(`/blogs?${queryParams}`);
      return response;
    },
    getNextPageParam: (lastPage) => {
      return lastPage?.pagination?.hasNext ? lastPage.pagination.page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: enabled && enableInfiniteQuery,
    staleTime,
    gcTime: cacheTime,
  });

  // Blog categories query
  const categoriesQuery = useQuery({
    queryKey: QUERY_KEYS.blogCategories,
    queryFn: async () => {
      const response = await api.get<{ categories: BlogCategory[] }>('/blogs/categories');
      return response?.categories || [];
    },
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Blog tags query
  const tagsQuery = useQuery({
    queryKey: QUERY_KEYS.blogTags,
    queryFn: async () => {
      const response = await api.get<{ tags: BlogTag[] }>('/blogs/tags');
      return response?.tags || [];
    },
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Blog authors query
  const authorsQuery = useQuery({
    queryKey: QUERY_KEYS.blogAuthors,
    queryFn: async () => {
      const response = await api.get<{ 
        authors: Array<{
          id: string;
          name: string;
          avatar?: string;
          postCount: number;
          bio?: string;
        }> 
      }>('/blogs/authors');
      return response?.authors || [];
    },
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Trending blogs query
  const trendingQuery = useQuery({
    queryKey: QUERY_KEYS.trendingBlogs,
    queryFn: async () => {
      const response = await api.get<{ posts: BlogPost[] }>('/blogs/trending?limit=5');
      return response?.posts || [];
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Featured blogs query
  const featuredQuery = useQuery({
    queryKey: QUERY_KEYS.featuredBlogs,
    queryFn: async () => {
      const response = await api.get<{ posts: BlogPost[] }>('/blogs/featured?limit=3');
      return response?.posts || [];
    },
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Recent blogs query
  const recentQuery = useQuery({
    queryKey: QUERY_KEYS.recentBlogs,
    queryFn: async () => {
      const response = await api.get<{ posts: BlogPost[] }>('/blogs/recent?limit=5');
      return response?.posts || [];
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Create blog mutation
  const createBlogMutation = useMutation({
    mutationFn: async (data: CreateBlogData) => {
      const formData = new FormData();
      
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'featuredImage' && value instanceof File) {
          formData.append(key, value);
        } else if (key === 'tagIds' && Array.isArray(value)) {
          value.forEach((tagId, index) => {
            formData.append(`tagIds[${index}]`, tagId);
          });
        } else if (key === 'seoKeywords' && Array.isArray(value)) {
          value.forEach((keyword, index) => {
            formData.append(`seoKeywords[${index}]`, keyword);
          });
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      const response = await api.post<{ post: BlogPost }>('/blogs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response?.post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.blogs });
      toast.success('Blog post created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create blog post');
    },
  });

  // Bulk operations
  const bulkDeleteMutation = useMutation({
    mutationFn: async (postIds: string[]) => {
      const response = await api.post('/blogs/bulk-delete', { postIds });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.blogs });
      toast.success('Selected posts deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete selected posts');
    },
  });

  const bulkUpdateStatusMutation = useMutation({
    mutationFn: async ({ postIds, status }: { postIds: string[]; status: BlogPost['status'] }) => {
      const response = await api.put('/blogs/bulk/status', { postIds, status });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.blogs });
      toast.success('Posts status updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update posts status');
    },
  });

  // Filter and sort functions
  const updateFilters = useCallback((newFilters: Partial<BlogsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  const updateSort = useCallback((newSort: Partial<BlogsSort>) => {
    const updatedSort = { ...sort, ...newSort };
    setSort(updatedSort);
    setPagination(prev => ({ 
      ...prev, 
      page: 1, 
      sortBy: updatedSort.field as "createdAt" | "publishedAt" | "title" | "views" | "likes", 
      sortOrder: updatedSort.direction 
    }));
  }, [sort]);

  const updatePagination = useCallback((newPagination: Partial<PaginationParams>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const goToPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const changePageSize = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  // Search function
  const search = useCallback((query: string) => {
    updateFilters({ search: query });
  }, [updateFilters]);

  // Filter by category
  const filterByCategory = useCallback((categoryId: string) => {
    updateFilters({ categoryId });
  }, [updateFilters]);

  // Filter by author
  const filterByAuthor = useCallback((authorId: string) => {
    updateFilters({ authorId });
  }, [updateFilters]);

  // Filter by tags
  const filterByTags = useCallback((tagIds: string[]) => {
    updateFilters({ tagIds });
  }, [updateFilters]);

  // Computed values
  const currentData = enableInfiniteQuery 
    ? infiniteBlogsQuery.data?.pages.flatMap(page => page?.posts || []) || []
    : blogsQuery.data?.posts || [];

  const currentPagination = enableInfiniteQuery
    ? infiniteBlogsQuery.data?.pages[infiniteBlogsQuery.data.pages.length - 1]?.pagination
    : blogsQuery.data?.pagination;

  const stats = blogsQuery.data?.stats || {
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0
  };

  const isLoading = enableInfiniteQuery ? infiniteBlogsQuery.isLoading : blogsQuery.isLoading;
  const error = enableInfiniteQuery ? infiniteBlogsQuery.error : blogsQuery.error;

  // Real-time updates
  useEffect(() => {
    if (enableRealtime) {
      const interval = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.blogs });
      }, 30 * 1000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [enableRealtime, queryClient]);

  return {
    // Data
    posts: currentData,
    categories: categoriesQuery.data || [],
    tags: tagsQuery.data || [],
    authors: authorsQuery.data || [],
    trending: trendingQuery.data || [],
    featured: featuredQuery.data || [],
    recent: recentQuery.data || [],
    pagination: currentPagination,
    stats,

    // Loading states
    isLoading,
    isLoadingCategories: categoriesQuery.isLoading,
    isLoadingTags: tagsQuery.isLoading,
    isLoadingAuthors: authorsQuery.isLoading,
    isLoadingTrending: trendingQuery.isLoading,
    isLoadingFeatured: featuredQuery.isLoading,
    isLoadingRecent: recentQuery.isLoading,

    // Infinite query specific
    hasNextPage: infiniteBlogsQuery.hasNextPage,
    isFetchingNextPage: infiniteBlogsQuery.isFetchingNextPage,
    fetchNextPage: infiniteBlogsQuery.fetchNextPage,

    // Error states
    error,
    categoriesError: categoriesQuery.error,
    tagsError: tagsQuery.error,
    authorsError: authorsQuery.error,

    // Mutation states
    isCreating: createBlogMutation.isPending,
    isBulkDeleting: bulkDeleteMutation.isPending,
    isBulkUpdating: bulkUpdateStatusMutation.isPending,

    // Actions
    createBlog: createBlogMutation.mutate,
    bulkDelete: bulkDeleteMutation.mutate,
    bulkUpdateStatus: bulkUpdateStatusMutation.mutate,

    // Filter and pagination
    filters,
    sort,
    updateFilters,
    updateSort,
    updatePagination,
    clearFilters,
    goToPage,
    changePageSize,
    search,
    filterByCategory,
    filterByAuthor,
    filterByTags,

    // Refetch functions
    refetch: enableInfiniteQuery ? infiniteBlogsQuery.refetch : blogsQuery.refetch,
    refetchCategories: categoriesQuery.refetch,
    refetchTags: tagsQuery.refetch,
    refetchAuthors: authorsQuery.refetch,
    refetchTrending: trendingQuery.refetch,
    refetchFeatured: featuredQuery.refetch,
    refetchRecent: recentQuery.refetch,
  };
};

export default useBlogs;
