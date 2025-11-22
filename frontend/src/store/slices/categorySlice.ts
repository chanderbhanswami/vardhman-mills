import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Category, Product, PaginationMeta } from '@/types';

// Category hierarchy interface
export interface CategoryHierarchy extends Category {
  children: CategoryHierarchy[];
  products?: Product[];
  breadcrumb: Category[];
}

// Category filters interface
export interface CategoryFilters {
  parentId?: string;
  level?: number;
  status?: 'active' | 'inactive';
  featured?: boolean;
  hasProducts?: boolean;
  sortBy?: 'name' | 'productCount' | 'createdAt' | 'sortOrder';
  sortOrder?: 'asc' | 'desc';
}

// Async thunks for category operations
export const fetchCategories = createAsyncThunk(
  'category/fetchCategories',
  async (params: {
    parentId?: string;
    level?: number;
    includeProducts?: boolean;
    filters?: CategoryFilters;
  } = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.parentId) queryParams.append('parentId', params.parentId);
    if (params.level !== undefined) queryParams.append('level', params.level.toString());
    if (params.includeProducts) queryParams.append('includeProducts', 'true');
    
    if (params.filters) {
      if (params.filters.status) queryParams.append('status', params.filters.status);
      if (params.filters.featured !== undefined) queryParams.append('featured', params.filters.featured.toString());
      if (params.filters.hasProducts !== undefined) queryParams.append('hasProducts', params.filters.hasProducts.toString());
      if (params.filters.sortBy) queryParams.append('sortBy', params.filters.sortBy);
      if (params.filters.sortOrder) queryParams.append('sortOrder', params.filters.sortOrder);
    }

    const response = await fetch(`/api/categories?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    return response.json();
  }
);

export const fetchCategoryById = createAsyncThunk(
  'category/fetchCategoryById',
  async (categoryId: string) => {
    const response = await fetch(`/api/categories/${categoryId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch category');
    }
    return response.json();
  }
);

export const fetchCategoryBySlug = createAsyncThunk(
  'category/fetchCategoryBySlug',
  async (slug: string) => {
    const response = await fetch(`/api/categories/slug/${slug}`);
    if (!response.ok) {
      throw new Error('Failed to fetch category');
    }
    return response.json();
  }
);

export const fetchCategoryHierarchy = createAsyncThunk(
  'category/fetchCategoryHierarchy',
  async () => {
    const response = await fetch('/api/categories/hierarchy');
    if (!response.ok) {
      throw new Error('Failed to fetch category hierarchy');
    }
    return response.json();
  }
);

export const fetchFeaturedCategories = createAsyncThunk(
  'category/fetchFeaturedCategories',
  async (limit: number = 8) => {
    const response = await fetch(`/api/categories/featured?limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch featured categories');
    }
    return response.json();
  }
);

export const fetchCategoryProducts = createAsyncThunk(
  'category/fetchCategoryProducts',
  async (params: {
    categoryId: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    filters?: Record<string, unknown>;
  }) => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(`/api/categories/${params.categoryId}/products?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch category products');
    }
    
    return response.json();
  }
);

export const searchCategories = createAsyncThunk(
  'category/searchCategories',
  async (params: { query: string; limit?: number }) => {
    const queryParams = new URLSearchParams();
    queryParams.append('q', params.query);
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(`/api/categories/search?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to search categories');
    }
    
    return response.json();
  }
);

interface CategoryState {
  // Categories
  categories: Category[];
  featuredCategories: Category[];
  categoryHierarchy: CategoryHierarchy[];
  currentCategory: Category | null;
  
  // Category products
  categoryProducts: Product[];
  productsPagination: PaginationMeta;
  
  // Navigation and breadcrumbs
  breadcrumbs: Category[];
  navigationPath: string[];
  
  // Search
  searchResults: Category[];
  searchQuery: string;
  
  // Filters and sorting
  filters: CategoryFilters;
  
  // Loading states
  isLoading: boolean;
  isLoadingCategory: boolean;
  isLoadingProducts: boolean;
  isSearching: boolean;
  
  // UI state
  expandedCategories: Set<string>;
  selectedLevel: number;
  showSubcategories: boolean;
  viewType: 'grid' | 'list' | 'tree';
  
  // Error handling
  error: string | null;
  categoryError: string | null;
  productsError: string | null;
  searchError: string | null;
  
  // Cache management
  lastFetch: number;
  categoryCache: Record<string, { category: Category; timestamp: number }>;
  hierarchyLastFetch: number;
}

const initialState: CategoryState = {
  categories: [],
  featuredCategories: [],
  categoryHierarchy: [],
  currentCategory: null,
  categoryProducts: [],
  productsPagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  breadcrumbs: [],
  navigationPath: [],
  searchResults: [],
  searchQuery: '',
  filters: {},
  isLoading: false,
  isLoadingCategory: false,
  isLoadingProducts: false,
  isSearching: false,
  expandedCategories: new Set<string>(),
  selectedLevel: 0,
  showSubcategories: true,
  viewType: 'grid',
  error: null,
  categoryError: null,
  productsError: null,
  searchError: null,
  lastFetch: 0,
  categoryCache: {},
  hierarchyLastFetch: 0,
};

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    // Filter management
    setFilters: (state, action: PayloadAction<CategoryFilters>) => {
      state.filters = action.payload;
    },
    
    clearFilters: (state) => {
      state.filters = {};
    },
    
    // Navigation and UI
    setBreadcrumbs: (state, action: PayloadAction<Category[]>) => {
      state.breadcrumbs = action.payload;
      state.navigationPath = action.payload.map(cat => cat.slug);
    },
    
    addToBreadcrumbs: (state, action: PayloadAction<Category>) => {
      const exists = state.breadcrumbs.find(cat => cat.id === action.payload.id);
      if (!exists) {
        state.breadcrumbs.push(action.payload);
        state.navigationPath.push(action.payload.slug);
      }
    },
    
    clearBreadcrumbs: (state) => {
      state.breadcrumbs = [];
      state.navigationPath = [];
    },
    
    // Expanded categories management
    toggleCategoryExpansion: (state, action: PayloadAction<string>) => {
      const categoryId = action.payload;
      if (state.expandedCategories.has(categoryId)) {
        state.expandedCategories.delete(categoryId);
      } else {
        state.expandedCategories.add(categoryId);
      }
    },
    
    expandCategory: (state, action: PayloadAction<string>) => {
      state.expandedCategories.add(action.payload);
    },
    
    collapseCategory: (state, action: PayloadAction<string>) => {
      state.expandedCategories.delete(action.payload);
    },
    
    expandAllCategories: (state) => {
      state.categories.forEach(category => {
        state.expandedCategories.add(category.id);
      });
    },
    
    collapseAllCategories: (state) => {
      state.expandedCategories.clear();
    },
    
    // View settings
    setSelectedLevel: (state, action: PayloadAction<number>) => {
      state.selectedLevel = action.payload;
    },
    
    setShowSubcategories: (state, action: PayloadAction<boolean>) => {
      state.showSubcategories = action.payload;
    },
    
    setViewType: (state, action: PayloadAction<'grid' | 'list' | 'tree'>) => {
      state.viewType = action.payload;
    },
    
    // Search
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchQuery = '';
    },
    
    // Category management
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
      state.categoryProducts = [];
      state.productsPagination = initialState.productsPagination;
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null;
      state.categoryError = null;
      state.productsError = null;
      state.searchError = null;
    },
    
    // Cache management
    invalidateCache: (state) => {
      state.lastFetch = 0;
      state.hierarchyLastFetch = 0;
      state.categoryCache = {};
    },
    
    invalidateCategoryCache: (state, action: PayloadAction<string>) => {
      delete state.categoryCache[action.payload];
    },
    
    // Set featured categories
    setFeaturedCategories: (state, action: PayloadAction<Category[]>) => {
      state.featuredCategories = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload.categories || action.payload.data || [];
        state.lastFetch = Date.now();
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch categories';
      });

    // Fetch category by ID
    builder
      .addCase(fetchCategoryById.pending, (state) => {
        state.isLoadingCategory = true;
        state.categoryError = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.isLoadingCategory = false;
        const category = action.payload.category || action.payload;
        state.currentCategory = category;
        
        // Cache the category
        if (category?.id) {
          state.categoryCache[category.id] = {
            category,
            timestamp: Date.now(),
          };
        }
        
        state.categoryError = null;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.isLoadingCategory = false;
        state.categoryError = action.error.message || 'Failed to fetch category';
      });

    // Fetch category by slug
    builder
      .addCase(fetchCategoryBySlug.pending, (state) => {
        state.isLoadingCategory = true;
        state.categoryError = null;
      })
      .addCase(fetchCategoryBySlug.fulfilled, (state, action) => {
        state.isLoadingCategory = false;
        const category = action.payload.category || action.payload;
        state.currentCategory = category;
        
        // Cache the category
        if (category?.id) {
          state.categoryCache[category.id] = {
            category,
            timestamp: Date.now(),
          };
        }
        
        state.categoryError = null;
      })
      .addCase(fetchCategoryBySlug.rejected, (state, action) => {
        state.isLoadingCategory = false;
        state.categoryError = action.error.message || 'Failed to fetch category';
      });

    // Fetch category hierarchy
    builder
      .addCase(fetchCategoryHierarchy.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategoryHierarchy.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categoryHierarchy = action.payload.hierarchy || action.payload.data || [];
        state.hierarchyLastFetch = Date.now();
        state.error = null;
      })
      .addCase(fetchCategoryHierarchy.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch category hierarchy';
      });

    // Fetch featured categories
    builder
      .addCase(fetchFeaturedCategories.fulfilled, (state, action) => {
        state.featuredCategories = action.payload.categories || action.payload.data || [];
      });

    // Fetch category products
    builder
      .addCase(fetchCategoryProducts.pending, (state) => {
        state.isLoadingProducts = true;
        state.productsError = null;
      })
      .addCase(fetchCategoryProducts.fulfilled, (state, action) => {
        state.isLoadingProducts = false;
        state.categoryProducts = action.payload.products || action.payload.data || [];
        state.productsPagination = action.payload.pagination || state.productsPagination;
        state.productsError = null;
      })
      .addCase(fetchCategoryProducts.rejected, (state, action) => {
        state.isLoadingProducts = false;
        state.productsError = action.error.message || 'Failed to fetch category products';
      });

    // Search categories
    builder
      .addCase(searchCategories.pending, (state) => {
        state.isSearching = true;
        state.searchError = null;
      })
      .addCase(searchCategories.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults = action.payload.categories || action.payload.data || [];
        state.searchError = null;
      })
      .addCase(searchCategories.rejected, (state, action) => {
        state.isSearching = false;
        state.searchError = action.error.message || 'Failed to search categories';
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setBreadcrumbs,
  addToBreadcrumbs,
  clearBreadcrumbs,
  toggleCategoryExpansion,
  expandCategory,
  collapseCategory,
  expandAllCategories,
  collapseAllCategories,
  setSelectedLevel,
  setShowSubcategories,
  setViewType,
  setSearchQuery,
  clearSearchResults,
  clearCurrentCategory,
  clearError,
  invalidateCache,
  invalidateCategoryCache,
  setFeaturedCategories,
} = categorySlice.actions;

// Selectors
export const selectCategories = (state: { category: CategoryState }) => state.category.categories;
export const selectFeaturedCategories = (state: { category: CategoryState }) => state.category.featuredCategories;
export const selectCategoryHierarchy = (state: { category: CategoryState }) => state.category.categoryHierarchy;
export const selectCurrentCategory = (state: { category: CategoryState }) => state.category.currentCategory;
export const selectCategoryProducts = (state: { category: CategoryState }) => state.category.categoryProducts;
export const selectProductsPagination = (state: { category: CategoryState }) => state.category.productsPagination;
export const selectBreadcrumbs = (state: { category: CategoryState }) => state.category.breadcrumbs;
export const selectNavigationPath = (state: { category: CategoryState }) => state.category.navigationPath;
export const selectSearchResults = (state: { category: CategoryState }) => state.category.searchResults;
export const selectCategoryLoading = (state: { category: CategoryState }) => state.category.isLoading;
export const selectCategoryError = (state: { category: CategoryState }) => state.category.error;
export const selectExpandedCategories = (state: { category: CategoryState }) => state.category.expandedCategories;
export const selectViewType = (state: { category: CategoryState }) => state.category.viewType;
export const selectFilters = (state: { category: CategoryState }) => state.category.filters;

// Complex selectors
export const selectCategoriesByLevel = (state: { category: CategoryState }, level: number) =>
  state.category.categories.filter(cat => cat.level === level);

export const selectRootCategories = (state: { category: CategoryState }) =>
  state.category.categories.filter(cat => cat.level === 0);

export const selectSubcategories = (state: { category: CategoryState }, parentId: string) =>
  state.category.categories.filter(cat => cat.parentId === parentId);

export const selectCategoryById = (state: { category: CategoryState }, categoryId: string) =>
  state.category.categories.find(cat => cat.id === categoryId) ||
  state.category.categoryCache[categoryId]?.category;

export const selectCategoryBySlug = (state: { category: CategoryState }, slug: string) =>
  state.category.categories.find(cat => cat.slug === slug);

export const selectCategoryStats = (state: { category: CategoryState }) => {
  const { categories } = state.category;
  
  return {
    totalCategories: categories.length,
    activeCategories: categories.filter(cat => cat.status === 'active').length,
    featuredCategories: categories.filter(cat => cat.isFeatured).length,
    categoriesWithProducts: categories.filter(cat => cat.productCount > 0).length,
    averageProductsPerCategory: categories.reduce((sum, cat) => sum + cat.productCount, 0) / categories.length || 0,
  };
};

export const selectFilteredCategories = (state: { category: CategoryState }) => {
  const { categories, filters } = state.category;
  
  return categories.filter(category => {
    // Parent filter
    if (filters.parentId !== undefined && category.parentId !== filters.parentId) return false;
    
    // Level filter
    if (filters.level !== undefined && category.level !== filters.level) return false;
    
    // Status filter
    if (filters.status && category.status !== filters.status) return false;
    
    // Featured filter
    if (filters.featured !== undefined && category.isFeatured !== filters.featured) return false;
    
    // Has products filter
    if (filters.hasProducts !== undefined) {
      const hasProducts = category.productCount > 0;
      if (hasProducts !== filters.hasProducts) return false;
    }
    
    return true;
  });
};

export default categorySlice.reducer;
