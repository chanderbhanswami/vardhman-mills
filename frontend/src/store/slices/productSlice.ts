import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product, ProductFilters, PaginationMeta } from '@/types';

// Async thunks for product operations
export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  async (params: {
    page?: number;
    limit?: number;
    category?: string;
    filters?: ProductFilters;
    sort?: string;
    search?: string;
  } = {}) => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.category) queryParams.append('category', params.category);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.search) queryParams.append('search', params.search);

    // Add filter parameters
    if (params.filters) {
      if (params.filters.priceRange?.min) queryParams.append('minPrice', params.filters.priceRange.min.amount.toString());
      if (params.filters.priceRange?.max) queryParams.append('maxPrice', params.filters.priceRange.max.amount.toString());
      if (params.filters.colors?.length) queryParams.append('colors', params.filters.colors.join(','));
      if (params.filters.sizes?.length) queryParams.append('sizes', params.filters.sizes.join(','));
      if (params.filters.brandIds?.length) queryParams.append('brands', params.filters.brandIds.join(','));
      if (params.filters.ratings?.length) queryParams.append('rating', params.filters.ratings.join(','));
    }

    const response = await fetch(`/api/products?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    return response.json();
  }
);

export const fetchProductById = createAsyncThunk(
  'product/fetchProductById',
  async (productId: string) => {
    const response = await fetch(`/api/products/${productId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }
    return response.json();
  }
);

export const fetchRelatedProducts = createAsyncThunk(
  'product/fetchRelatedProducts',
  async (params: { productId: string; limit?: number }) => {
    const response = await fetch(`/api/products/${params.productId}/related?limit=${params.limit || 4}`);
    if (!response.ok) {
      throw new Error('Failed to fetch related products');
    }
    return response.json();
  }
);

export const fetchProductReviews = createAsyncThunk(
  'product/fetchProductReviews',
  async (params: { productId: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(`/api/products/${params.productId}/reviews?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch product reviews');
    }
    return response.json();
  }
);

export const addProductReview = createAsyncThunk(
  'product/addProductReview',
  async (params: { productId: string; rating: number; comment: string; title?: string }) => {
    const response = await fetch(`/api/products/${params.productId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rating: params.rating,
        comment: params.comment,
        title: params.title,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to add review');
    }
    return response.json();
  }
);

export const fetchBestSellers = createAsyncThunk(
  'product/fetchBestSellers',
  async (params: {
    page?: number;
    limit?: number;
    period?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: string;
    inStock?: boolean;
  } = {}) => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.period) queryParams.append('period', params.period);
    if (params.category) queryParams.append('category', params.category);
    if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.inStock !== undefined) queryParams.append('inStock', params.inStock.toString());

    const response = await fetch(`/api/bestsellers?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch best sellers');
    }

    return response.json();
  }
);

interface ProductState {
  // Product lists
  products: Product[];
  featuredProducts: Product[];
  relatedProducts: Product[];

  // Current product details
  currentProduct: Product | null;
  currentProductReviews: {
    reviews: Array<{
      id: string;
      rating: number;
      comment: string;
      userName: string;
      createdAt: string;
    }>;
    pagination: PaginationMeta;
    averageRating: number;
    totalReviews: number;
  };

  // Loading states
  isLoading: boolean;
  isLoadingProduct: boolean;
  isLoadingReviews: boolean;
  isSubmittingReview: boolean;

  // Pagination and filters
  pagination: PaginationMeta;
  filters: ProductFilters;
  sortBy: string;
  searchQuery: string;

  // UI state
  viewMode: 'grid' | 'list';
  selectedFilters: {
    category?: string;
    priceRange?: [number, number];
    colors: string[];
    sizes: string[];
    brands: string[];
    rating?: number;
  };

  // Error handling
  error: string | null;
  productError: string | null;
  reviewError: string | null;

  // Cache management
  lastFetch: number;
  cacheExpiry: number;
}

const initialState: ProductState = {
  products: [],
  featuredProducts: [],
  relatedProducts: [],
  currentProduct: null,
  currentProductReviews: {
    reviews: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
    averageRating: 0,
    totalReviews: 0,
  },
  isLoading: false,
  isLoadingProduct: false,
  isLoadingReviews: false,
  isSubmittingReview: false,
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  filters: {},
  sortBy: 'featured',
  searchQuery: '',
  viewMode: 'grid',
  selectedFilters: {
    colors: [],
    sizes: [],
    brands: [],
  },
  error: null,
  productError: null,
  reviewError: null,
  lastFetch: 0,
  cacheExpiry: 5 * 60 * 1000, // 5 minutes
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    // Filter management
    setFilters: (state, action: PayloadAction<ProductFilters>) => {
      state.filters = action.payload;
    },

    clearFilters: (state) => {
      state.filters = {};
      state.selectedFilters = {
        colors: [],
        sizes: [],
        brands: [],
      };
    },

    setSelectedFilters: (state, action: PayloadAction<Partial<ProductState['selectedFilters']>>) => {
      state.selectedFilters = { ...state.selectedFilters, ...action.payload };
    },

    // Search and sort
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    setSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload;
    },

    // UI state
    setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.viewMode = action.payload;
    },

    // Product management
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
      state.currentProductReviews = {
        reviews: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
        averageRating: 0,
        totalReviews: 0,
      };
    },

    // Error handling
    clearError: (state) => {
      state.error = null;
      state.productError = null;
      state.reviewError = null;
    },

    // Cache management
    invalidateCache: (state) => {
      state.lastFetch = 0;
    },

    // Featured products
    setFeaturedProducts: (state, action: PayloadAction<Product[]>) => {
      state.featuredProducts = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch products
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.products || action.payload.data || [];
        state.pagination = action.payload.pagination || state.pagination;
        state.lastFetch = Date.now();
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch products';
      });

    // Fetch product by ID
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.isLoadingProduct = true;
        state.productError = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoadingProduct = false;
        state.currentProduct = action.payload.product || action.payload;
        state.productError = null;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoadingProduct = false;
        state.productError = action.error.message || 'Failed to fetch product';
      });

    // Fetch related products
    builder
      .addCase(fetchRelatedProducts.pending, () => {
        // Don't set loading state for related products to avoid UI flicker
      })
      .addCase(fetchRelatedProducts.fulfilled, (state, action) => {
        state.relatedProducts = action.payload.products || action.payload.data || [];
      })
      .addCase(fetchRelatedProducts.rejected, (state) => {
        // Silently fail for related products
        state.relatedProducts = [];
      });

    // Fetch product reviews
    builder
      .addCase(fetchProductReviews.pending, (state) => {
        state.isLoadingReviews = true;
        state.reviewError = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.isLoadingReviews = false;
        state.currentProductReviews = {
          reviews: action.payload.reviews || [],
          pagination: action.payload.pagination || state.currentProductReviews.pagination,
          averageRating: action.payload.averageRating || 0,
          totalReviews: action.payload.totalReviews || 0,
        };
        state.reviewError = null;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.isLoadingReviews = false;
        state.reviewError = action.error.message || 'Failed to fetch reviews';
      });

    // Add product review
    builder
      .addCase(addProductReview.pending, (state) => {
        state.isSubmittingReview = true;
        state.reviewError = null;
      })
      .addCase(addProductReview.fulfilled, (state, action) => {
        state.isSubmittingReview = false;
        // Add the new review to the beginning of the reviews array
        state.currentProductReviews.reviews.unshift(action.payload.review);
        state.currentProductReviews.totalReviews += 1;
        // Recalculate average rating
        const totalRating = state.currentProductReviews.reviews.reduce((sum, review) => sum + review.rating, 0);
        state.currentProductReviews.averageRating = totalRating / state.currentProductReviews.reviews.length;
        state.reviewError = null;
      })
      .addCase(addProductReview.rejected, (state, action) => {
        state.isSubmittingReview = false;
        state.reviewError = action.error.message || 'Failed to add review';
      });

    // Fetch best sellers
    builder
      .addCase(fetchBestSellers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBestSellers.fulfilled, (state, action) => {
        state.isLoading = false;
        // Map products to ensure they are treated as best sellers if needed, 
        // but primarily just populate the products list
        state.products = (action.payload.data?.products || []).map((p: Product) => ({
          ...p,
          isBestseller: true // Ensure client-side filtering works if kept
        }));
        state.pagination = action.payload.data?.pagination || state.pagination;
        state.lastFetch = Date.now();
        state.error = null;
      })
      .addCase(fetchBestSellers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch best sellers';
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setSelectedFilters,
  setSearchQuery,
  setSortBy,
  setViewMode,
  clearCurrentProduct,
  clearError,
  invalidateCache,
  setFeaturedProducts,
} = productSlice.actions;

// Selectors
export const selectProducts = (state: { product: ProductState }) => state.product.products;
export const selectFeaturedProducts = (state: { product: ProductState }) => state.product.featuredProducts;
export const selectRelatedProducts = (state: { product: ProductState }) => state.product.relatedProducts;
export const selectCurrentProduct = (state: { product: ProductState }) => state.product.currentProduct;
export const selectCurrentProductReviews = (state: { product: ProductState }) => state.product.currentProductReviews;
export const selectProductLoading = (state: { product: ProductState }) => state.product.isLoading;
export const selectProductError = (state: { product: ProductState }) => state.product.error;
export const selectProductFilters = (state: { product: ProductState }) => state.product.filters;
export const selectSelectedFilters = (state: { product: ProductState }) => state.product.selectedFilters;
export const selectProductPagination = (state: { product: ProductState }) => state.product.pagination;
export const selectViewMode = (state: { product: ProductState }) => state.product.viewMode;
export const selectSortBy = (state: { product: ProductState }) => state.product.sortBy;
export const selectSearchQuery = (state: { product: ProductState }) => state.product.searchQuery;

// Complex selectors
export const selectFilteredProducts = (state: { product: ProductState }) => {
  const { products, selectedFilters } = state.product;

  return products.filter(product => {
    // Price range filter
    if (selectedFilters.priceRange) {
      const [min, max] = selectedFilters.priceRange;
      const price = product.variants?.[0]?.pricing?.basePrice?.amount || product.pricing?.basePrice?.amount || 0;
      if (price < min || price > max) return false;
    }

    // Color filter
    if (selectedFilters.colors.length > 0) {
      const productColors = product.colors?.map(c => c.name) || [];
      if (!selectedFilters.colors.some(color => productColors.includes(color))) return false;
    }

    // Size filter
    if (selectedFilters.sizes.length > 0) {
      const productSizes = product.sizes?.map(s => s.name) || [];
      if (!selectedFilters.sizes.some(size => productSizes.includes(size))) return false;
    }

    // Brand filter
    if (selectedFilters.brands.length > 0) {
      const brandName = typeof product.brand === 'string' ? product.brand : product.brand?.name || '';
      if (!selectedFilters.brands.includes(brandName)) return false;
    }

    // Rating filter
    if (selectedFilters.rating) {
      const avgRating = typeof product.rating === 'number' ? product.rating : product.rating?.average || 0;
      if (avgRating < selectedFilters.rating) return false;
    }

    return true;
  });
};

export const selectProductStats = (state: { product: ProductState }) => {
  const { products } = state.product;

  return {
    totalProducts: products.length,
    averagePrice: products.reduce((sum, p) => {
      const price = p.variants?.[0]?.pricing?.basePrice?.amount || p.pricing?.basePrice?.amount || 0;
      return sum + price;
    }, 0) / products.length || 0,
    averageRating: products.reduce((sum, p) => {
      const rating = typeof p.rating === 'number' ? p.rating : p.rating?.average || 0;
      return sum + rating;
    }, 0) / products.length || 0,
    inStockCount: products.filter(p => p.inventory?.isInStock).length,
    featuredCount: products.filter(p => p.isFeatured).length,
  };
};

export default productSlice.reducer;
