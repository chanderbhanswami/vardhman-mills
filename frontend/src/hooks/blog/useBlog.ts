import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    bio?: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  status: 'draft' | 'published' | 'archived';
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  readTime: number;
  views: number;
  likes: number;
  comments: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
  createdAt: string;
}

export interface BlogComment {
  id: string;
  postId: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  status: 'pending' | 'approved' | 'spam';
  parentId?: string;
  replies?: BlogComment[];
  createdAt: string;
  updatedAt: string;
}

export interface BlogFilters {
  category?: string;
  tags?: string[];
  author?: string;
  status?: BlogPost['status'];
  search?: string;
  featured?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: 'createdAt' | 'publishedAt' | 'title' | 'views' | 'likes';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const BLOG_QUERY_KEYS = {
  posts: ['blog', 'posts'],
  post: (id: string) => ['blog', 'post', id],
  categories: ['blog', 'categories'],
  category: (id: string) => ['blog', 'category', id],
  tags: ['blog', 'tags'],
  tag: (id: string) => ['blog', 'tag', id],
  comments: (postId: string) => ['blog', 'comments', postId],
  search: (query: string) => ['blog', 'search', query],
  popular: ['blog', 'popular'],
  recent: ['blog', 'recent'],
  featured: ['blog', 'featured'],
} as const;

export const useBlog = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<BlogFilters>({});
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    limit: 10,
    sortBy: 'publishedAt',
    sortOrder: 'desc',
  });

  // Fetch all posts with filtering and pagination
  const {
    data: postsResponse,
    isLoading: postsLoading,
    error: postsError,
    refetch: refetchPosts,
  } = useQuery<PaginatedResponse<BlogPost>>({
    queryKey: [...BLOG_QUERY_KEYS.posts, filters, pagination],
    queryFn: async () => {
      // Mock API call - replace with actual API
      const mockPosts: BlogPost[] = [
        {
          id: '1',
          title: 'The Future of Textile Manufacturing',
          slug: 'future-textile-manufacturing',
          excerpt: 'Exploring innovative technologies and sustainable practices in modern textile production.',
          content: 'Full article content here...',
          featuredImage: '/images/blog/textile-future.jpg',
          author: {
            id: 'author-1',
            name: 'Dr. Sarah Mills',
            avatar: '/images/authors/sarah.jpg',
            bio: 'Textile industry expert with 15 years of experience.',
          },
          category: {
            id: 'cat-1',
            name: 'Industry News',
            slug: 'industry-news',
          },
          tags: [
            { id: 'tag-1', name: 'Innovation', slug: 'innovation' },
            { id: 'tag-2', name: 'Technology', slug: 'technology' },
          ],
          status: 'published',
          publishedAt: '2024-01-15T10:00:00Z',
          createdAt: '2024-01-10T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          readTime: 8,
          views: 1250,
          likes: 45,
          comments: 12,
          seoTitle: 'The Future of Textile Manufacturing - Vardhman Mills',
          seoDescription: 'Discover the latest innovations and sustainable practices shaping the future of textile manufacturing industry.',
          seoKeywords: ['textile', 'manufacturing', 'innovation', 'sustainability'],
        },
      ];

      // Apply filters and pagination (mock)
      let filteredPosts = [...mockPosts];

      if (filters.category) {
        filteredPosts = filteredPosts.filter(post => post.category.slug === filters.category);
      }

      if (filters.search) {
        const search = filters.search.toLowerCase();
        filteredPosts = filteredPosts.filter(post =>
          post.title.toLowerCase().includes(search) ||
          post.excerpt.toLowerCase().includes(search) ||
          post.content.toLowerCase().includes(search)
        );
      }

      const startIndex = (pagination.page - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

      return {
        data: paginatedPosts,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: filteredPosts.length,
          pages: Math.ceil(filteredPosts.length / pagination.limit),
          hasNext: endIndex < filteredPosts.length,
          hasPrev: pagination.page > 1,
        },
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Fetch single post by ID or slug
  const usePost = (identifier: string) => {
    return useQuery<BlogPost>({
      queryKey: BLOG_QUERY_KEYS.post(identifier),
      queryFn: async (): Promise<BlogPost> => {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Return mock post or throw error if not found
        if (identifier === '1' || identifier === 'future-textile-manufacturing') {
          const post = postsResponse?.data[0];
          if (!post) {
            throw new Error('Post not found');
          }
          return post;
        }
        
        throw new Error('Post not found');
      },
      enabled: !!identifier,
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  // Fetch categories
  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery<BlogCategory[]>({
    queryKey: BLOG_QUERY_KEYS.categories,
    queryFn: async () => {
      // Mock categories
      return [
        {
          id: 'cat-1',
          name: 'Industry News',
          slug: 'industry-news',
          description: 'Latest news and updates from the textile industry.',
          postCount: 15,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T00:00:00Z',
        },
        {
          id: 'cat-2',
          name: 'Sustainability',
          slug: 'sustainability',
          description: 'Articles about sustainable practices in textile manufacturing.',
          postCount: 8,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-10T00:00:00Z',
        },
      ];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Fetch tags
  const {
    data: tags,
    isLoading: tagsLoading,
    error: tagsError,
  } = useQuery<BlogTag[]>({
    queryKey: BLOG_QUERY_KEYS.tags,
    queryFn: async () => {
      // Mock tags
      return [
        { id: 'tag-1', name: 'Innovation', slug: 'innovation', postCount: 12, createdAt: '2024-01-01T00:00:00Z' },
        { id: 'tag-2', name: 'Technology', slug: 'technology', postCount: 8, createdAt: '2024-01-01T00:00:00Z' },
        { id: 'tag-3', name: 'Sustainability', slug: 'sustainability', postCount: 6, createdAt: '2024-01-01T00:00:00Z' },
      ];
    },
    staleTime: 30 * 60 * 1000,
  });

  // Search posts
  const searchPosts = useCallback(async (query: string) => {
    if (!query.trim()) return { data: [], pagination: null };

    try {
      const response = await queryClient.fetchQuery({
        queryKey: BLOG_QUERY_KEYS.search(query),
        queryFn: async () => {
          // Mock search
          const allPosts = postsResponse?.data || [];
          const searchResults = allPosts.filter(post =>
            post.title.toLowerCase().includes(query.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(query.toLowerCase())
          );
          
          return {
            data: searchResults,
            pagination: {
              page: 1,
              limit: searchResults.length,
              total: searchResults.length,
              pages: 1,
              hasNext: false,
              hasPrev: false,
            },
          };
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
      });

      return response;
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
      return { data: [], pagination: null };
    }
  }, [queryClient, postsResponse?.data]);

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'likes' | 'comments'>) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newPost: BlogPost = {
        ...postData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 0,
        likes: 0,
        comments: 0,
      };

      return { success: true, data: newPost };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLOG_QUERY_KEYS.posts });
      toast.success('Post created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create post');
    },
  });

  // Update post mutation
  const updatePostMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<BlogPost> }) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { success: true, data: { id, ...updates } };
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: BLOG_QUERY_KEYS.posts });
      queryClient.invalidateQueries({ queryKey: BLOG_QUERY_KEYS.post(id) });
      toast.success('Post updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update post');
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      // Mock API call - id would be used in real implementation
      console.log('Deleting post:', id);
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLOG_QUERY_KEYS.posts });
      toast.success('Post deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete post');
    },
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      // Mock API call - postId would be used in real implementation
      console.log('Liking post:', postId);
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true, liked: true };
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: BLOG_QUERY_KEYS.post(postId) });
      queryClient.invalidateQueries({ queryKey: BLOG_QUERY_KEYS.posts });
      toast.success('Post liked!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to like post');
    },
  });

  // Filter and pagination functions
  const updateFilters = useCallback((newFilters: Partial<BlogFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when filters change
  }, []);

  const updatePagination = useCallback((newPagination: Partial<PaginationParams>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
    setPagination({
      page: 1,
      limit: 10,
      sortBy: 'publishedAt',
      sortOrder: 'desc',
    });
  }, []);

  // Computed values
  const posts = useMemo(() => postsResponse?.data || [], [postsResponse?.data]);
  const paginationInfo = useMemo(() => postsResponse?.pagination || null, [postsResponse?.pagination]);
  
  const isLoading = postsLoading || categoriesLoading || tagsLoading;
  const hasError = postsError || categoriesError || tagsError;

  const totalPosts = paginationInfo?.total || 0;
  const hasNextPage = paginationInfo?.hasNext || false;
  const hasPrevPage = paginationInfo?.hasPrev || false;

  // Navigation functions
  const goToPage = useCallback((page: number) => {
    updatePagination({ page });
  }, [updatePagination]);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      updatePagination({ page: pagination.page + 1 });
    }
  }, [hasNextPage, pagination.page, updatePagination]);

  const prevPage = useCallback(() => {
    if (hasPrevPage) {
      updatePagination({ page: pagination.page - 1 });
    }
  }, [hasPrevPage, pagination.page, updatePagination]);

  return {
    // Data
    posts,
    categories: categories || [],
    tags: tags || [],
    
    // Loading states
    isLoading,
    postsLoading,
    categoriesLoading,
    tagsLoading,
    
    // Error states
    error: hasError,
    postsError,
    categoriesError,
    tagsError,
    
    // Pagination
    pagination: paginationInfo,
    currentPage: pagination.page,
    totalPosts,
    hasNextPage,
    hasPrevPage,
    
    // Filters
    filters,
    
    // Actions
    searchPosts,
    updateFilters,
    updatePagination,
    resetFilters,
    goToPage,
    nextPage,
    prevPage,
    refetchPosts,
    
    // Mutations
    createPost: createPostMutation.mutateAsync,
    updatePost: updatePostMutation.mutateAsync,
    deletePost: deletePostMutation.mutateAsync,
    likePost: likePostMutation.mutateAsync,
    
    // Mutation states
    isCreating: createPostMutation.isPending,
    isUpdating: updatePostMutation.isPending,
    isDeleting: deletePostMutation.isPending,
    isLiking: likePostMutation.isPending,
    
    // Utilities
    usePost,
  };
};

export default useBlog;
