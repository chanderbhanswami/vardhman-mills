import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PaginationMeta } from '@/types';

// Blog post interface
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  images: string[];
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
  tags: string[];
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  readTime: number; // in minutes
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isFeatured: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

// Blog category interface
export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  postCount: number;
  isActive: boolean;
  createdAt: string;
}

// Blog comment interface
export interface BlogComment {
  id: string;
  postId: string;
  parentId?: string;
  author: {
    id?: string;
    name: string;
    email: string;
    avatar?: string;
  };
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  likeCount: number;
  isLiked: boolean;
  replies?: BlogComment[];
  createdAt: string;
  updatedAt: string;
}

// Blog filters interface
export interface BlogFilters {
  category?: string;
  tags?: string[];
  author?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  status?: 'draft' | 'published' | 'scheduled' | 'archived';
  featured?: boolean;
  sortBy?: 'latest' | 'oldest' | 'popular' | 'trending' | 'title';
  search?: string;
}

// Async thunks for blog operations
export const fetchBlogPosts = createAsyncThunk(
  'blog/fetchBlogPosts',
  async (params: {
    page?: number;
    limit?: number;
    filters?: BlogFilters;
  } = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    if (params.filters) {
      if (params.filters.category) queryParams.append('category', params.filters.category);
      if (params.filters.tags?.length) queryParams.append('tags', params.filters.tags.join(','));
      if (params.filters.author) queryParams.append('author', params.filters.author);
      if (params.filters.search) queryParams.append('search', params.filters.search);
      if (params.filters.sortBy) queryParams.append('sortBy', params.filters.sortBy);
      if (params.filters.featured !== undefined) queryParams.append('featured', params.filters.featured.toString());
      if (params.filters.status) queryParams.append('status', params.filters.status);
    }

    const response = await fetch(`/api/blog/posts?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch blog posts');
    }
    
    return response.json();
  }
);

export const fetchBlogPostBySlug = createAsyncThunk(
  'blog/fetchBlogPostBySlug',
  async (slug: string) => {
    const response = await fetch(`/api/blog/posts/${slug}`);
    if (!response.ok) {
      throw new Error('Failed to fetch blog post');
    }
    return response.json();
  }
);

export const fetchFeaturedPosts = createAsyncThunk(
  'blog/fetchFeaturedPosts',
  async (limit: number = 5) => {
    const response = await fetch(`/api/blog/posts/featured?limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch featured posts');
    }
    return response.json();
  }
);

export const fetchRelatedPosts = createAsyncThunk(
  'blog/fetchRelatedPosts',
  async (params: { postId: string; limit?: number }) => {
    const response = await fetch(`/api/blog/posts/${params.postId}/related?limit=${params.limit || 4}`);
    if (!response.ok) {
      throw new Error('Failed to fetch related posts');
    }
    return response.json();
  }
);

export const fetchBlogCategories = createAsyncThunk(
  'blog/fetchBlogCategories',
  async () => {
    const response = await fetch('/api/blog/categories');
    if (!response.ok) {
      throw new Error('Failed to fetch blog categories');
    }
    return response.json();
  }
);

export const fetchBlogComments = createAsyncThunk(
  'blog/fetchBlogComments',
  async (params: { postId: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    const response = await fetch(`/api/blog/posts/${params.postId}/comments?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }
    return response.json();
  }
);

export const addBlogComment = createAsyncThunk(
  'blog/addBlogComment',
  async (params: {
    postId: string;
    parentId?: string;
    name: string;
    email: string;
    content: string;
  }) => {
    const response = await fetch(`/api/blog/posts/${params.postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parentId: params.parentId,
        name: params.name,
        email: params.email,
        content: params.content,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add comment');
    }
    return response.json();
  }
);

export const likeBlogPost = createAsyncThunk(
  'blog/likeBlogPost',
  async (postId: string) => {
    const response = await fetch(`/api/blog/posts/${postId}/like`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to like post');
    }
    return response.json();
  }
);

export const unlikeBlogPost = createAsyncThunk(
  'blog/unlikeBlogPost',
  async (postId: string) => {
    const response = await fetch(`/api/blog/posts/${postId}/like`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to unlike post');
    }
    return response.json();
  }
);

interface BlogState {
  // Posts
  posts: BlogPost[];
  featuredPosts: BlogPost[];
  relatedPosts: BlogPost[];
  currentPost: BlogPost | null;
  
  // Categories and tags
  categories: BlogCategory[];
  popularTags: string[];
  
  // Comments
  comments: BlogComment[];
  commentsPagination: PaginationMeta;
  
  // Pagination and filters
  pagination: PaginationMeta;
  filters: BlogFilters;
  
  // Loading states
  isLoading: boolean;
  isLoadingPost: boolean;
  isLoadingComments: boolean;
  isSubmittingComment: boolean;
  
  // UI state
  selectedCategory: string | null;
  searchQuery: string;
  viewMode: 'grid' | 'list';
  
  // Error handling
  error: string | null;
  postError: string | null;
  commentError: string | null;
  
  // Cache management
  lastFetch: number;
  cacheExpiry: number;
}

const initialState: BlogState = {
  posts: [],
  featuredPosts: [],
  relatedPosts: [],
  currentPost: null,
  categories: [],
  popularTags: [],
  comments: [],
  commentsPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  filters: {},
  isLoading: false,
  isLoadingPost: false,
  isLoadingComments: false,
  isSubmittingComment: false,
  selectedCategory: null,
  searchQuery: '',
  viewMode: 'grid',
  error: null,
  postError: null,
  commentError: null,
  lastFetch: 0,
  cacheExpiry: 5 * 60 * 1000, // 5 minutes
};

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    // Filter management
    setFilters: (state, action: PayloadAction<BlogFilters>) => {
      state.filters = action.payload;
    },
    
    clearFilters: (state) => {
      state.filters = {};
      state.selectedCategory = null;
      state.searchQuery = '';
    },
    
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
      if (action.payload) {
        state.filters.category = action.payload;
      } else {
        delete state.filters.category;
      }
    },
    
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.filters.search = action.payload;
    },
    
    setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.viewMode = action.payload;
    },
    
    // Post management
    clearCurrentPost: (state) => {
      state.currentPost = null;
      state.comments = [];
      state.relatedPosts = [];
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null;
      state.postError = null;
      state.commentError = null;
    },
    
    // Cache management
    invalidateCache: (state) => {
      state.lastFetch = 0;
    },
    
    // Set popular tags
    setPopularTags: (state, action: PayloadAction<string[]>) => {
      state.popularTags = action.payload;
    },
    
    // Update post like status
    updatePostLike: (state, action: PayloadAction<{ postId: string; isLiked: boolean; likeCount: number }>) => {
      const { postId, isLiked, likeCount } = action.payload;
      
      // Update in posts array
      const postIndex = state.posts.findIndex(post => post.id === postId);
      if (postIndex !== -1) {
        state.posts[postIndex].isLiked = isLiked;
        state.posts[postIndex].likeCount = likeCount;
      }
      
      // Update current post if it matches
      if (state.currentPost?.id === postId) {
        state.currentPost.isLiked = isLiked;
        state.currentPost.likeCount = likeCount;
      }
      
      // Update in featured posts
      const featuredIndex = state.featuredPosts.findIndex(post => post.id === postId);
      if (featuredIndex !== -1) {
        state.featuredPosts[featuredIndex].isLiked = isLiked;
        state.featuredPosts[featuredIndex].likeCount = likeCount;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch blog posts
    builder
      .addCase(fetchBlogPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBlogPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload.posts || action.payload.data || [];
        state.pagination = action.payload.pagination || state.pagination;
        state.lastFetch = Date.now();
        state.error = null;
      })
      .addCase(fetchBlogPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch blog posts';
      });

    // Fetch blog post by slug
    builder
      .addCase(fetchBlogPostBySlug.pending, (state) => {
        state.isLoadingPost = true;
        state.postError = null;
      })
      .addCase(fetchBlogPostBySlug.fulfilled, (state, action) => {
        state.isLoadingPost = false;
        state.currentPost = action.payload.post || action.payload;
        state.postError = null;
      })
      .addCase(fetchBlogPostBySlug.rejected, (state, action) => {
        state.isLoadingPost = false;
        state.postError = action.error.message || 'Failed to fetch blog post';
      });

    // Fetch featured posts
    builder
      .addCase(fetchFeaturedPosts.fulfilled, (state, action) => {
        state.featuredPosts = action.payload.posts || action.payload.data || [];
      });

    // Fetch related posts
    builder
      .addCase(fetchRelatedPosts.fulfilled, (state, action) => {
        state.relatedPosts = action.payload.posts || action.payload.data || [];
      });

    // Fetch blog categories
    builder
      .addCase(fetchBlogCategories.fulfilled, (state, action) => {
        state.categories = action.payload.categories || action.payload.data || [];
      });

    // Fetch blog comments
    builder
      .addCase(fetchBlogComments.pending, (state) => {
        state.isLoadingComments = true;
        state.commentError = null;
      })
      .addCase(fetchBlogComments.fulfilled, (state, action) => {
        state.isLoadingComments = false;
        state.comments = action.payload.comments || [];
        state.commentsPagination = action.payload.pagination || state.commentsPagination;
        state.commentError = null;
      })
      .addCase(fetchBlogComments.rejected, (state, action) => {
        state.isLoadingComments = false;
        state.commentError = action.error.message || 'Failed to fetch comments';
      });

    // Add blog comment
    builder
      .addCase(addBlogComment.pending, (state) => {
        state.isSubmittingComment = true;
        state.commentError = null;
      })
      .addCase(addBlogComment.fulfilled, (state, action) => {
        state.isSubmittingComment = false;
        if (action.payload.comment) {
          state.comments.unshift(action.payload.comment);
          // Update comment count in current post
          if (state.currentPost) {
            state.currentPost.commentCount += 1;
          }
        }
        state.commentError = null;
      })
      .addCase(addBlogComment.rejected, (state, action) => {
        state.isSubmittingComment = false;
        state.commentError = action.error.message || 'Failed to add comment';
      });

    // Like blog post
    builder
      .addCase(likeBlogPost.fulfilled, (state, action) => {
        if (action.payload.postId) {
          blogSlice.caseReducers.updatePostLike(state, {
            type: 'blog/updatePostLike',
            payload: {
              postId: action.payload.postId,
              isLiked: true,
              likeCount: action.payload.likeCount,
            },
          });
        }
      });

    // Unlike blog post
    builder
      .addCase(unlikeBlogPost.fulfilled, (state, action) => {
        if (action.payload.postId) {
          blogSlice.caseReducers.updatePostLike(state, {
            type: 'blog/updatePostLike',
            payload: {
              postId: action.payload.postId,
              isLiked: false,
              likeCount: action.payload.likeCount,
            },
          });
        }
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setSelectedCategory,
  setSearchQuery,
  setViewMode,
  clearCurrentPost,
  clearError,
  invalidateCache,
  setPopularTags,
  updatePostLike,
} = blogSlice.actions;

// Selectors
export const selectBlogPosts = (state: { blog: BlogState }) => state.blog.posts;
export const selectFeaturedPosts = (state: { blog: BlogState }) => state.blog.featuredPosts;
export const selectRelatedPosts = (state: { blog: BlogState }) => state.blog.relatedPosts;
export const selectCurrentPost = (state: { blog: BlogState }) => state.blog.currentPost;
export const selectBlogCategories = (state: { blog: BlogState }) => state.blog.categories;
export const selectBlogComments = (state: { blog: BlogState }) => state.blog.comments;
export const selectBlogLoading = (state: { blog: BlogState }) => state.blog.isLoading;
export const selectBlogError = (state: { blog: BlogState }) => state.blog.error;
export const selectBlogFilters = (state: { blog: BlogState }) => state.blog.filters;
export const selectBlogPagination = (state: { blog: BlogState }) => state.blog.pagination;
export const selectSelectedCategory = (state: { blog: BlogState }) => state.blog.selectedCategory;
export const selectSearchQuery = (state: { blog: BlogState }) => state.blog.searchQuery;
export const selectViewMode = (state: { blog: BlogState }) => state.blog.viewMode;
export const selectPopularTags = (state: { blog: BlogState }) => state.blog.popularTags;

// Complex selectors
export const selectFilteredPosts = (state: { blog: BlogState }) => {
  const { posts, filters } = state.blog;
  
  return posts.filter(post => {
    // Category filter
    if (filters.category && post.category.slug !== filters.category) return false;
    
    // Tags filter
    if (filters.tags?.length && !filters.tags.some(tag => post.tags.includes(tag))) return false;
    
    // Author filter
    if (filters.author && post.author.id !== filters.author) return false;
    
    // Featured filter
    if (filters.featured !== undefined && post.isFeatured !== filters.featured) return false;
    
    // Status filter
    if (filters.status && post.status !== filters.status) return false;
    
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        post.title.toLowerCase().includes(searchTerm) ||
        post.excerpt.toLowerCase().includes(searchTerm) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    
    return true;
  });
};

export const selectBlogStats = (state: { blog: BlogState }) => {
  const { posts } = state.blog;
  
  return {
    totalPosts: posts.length,
    publishedPosts: posts.filter(p => p.status === 'published').length,
    featuredPosts: posts.filter(p => p.isFeatured).length,
    totalViews: posts.reduce((sum, p) => sum + p.viewCount, 0),
    totalLikes: posts.reduce((sum, p) => sum + p.likeCount, 0),
    averageReadTime: posts.reduce((sum, p) => sum + p.readTime, 0) / posts.length || 0,
  };
};

export default blogSlice.reducer;
