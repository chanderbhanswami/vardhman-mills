import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product, Category, PaginationMeta } from '@/types';

// Search result interfaces
export interface SearchResult {
  products: Product[];
  categories: Category[];
  suggestions: string[];
  totalResults: number;
  searchTime: number;
  facets: SearchFacets;
}

export interface SearchFacets {
  categories: Array<{
    id: string;
    name: string;
    count: number;
  }>;
  priceRanges: Array<{
    min: number;
    max: number;
    count: number;
    label: string;
  }>;
  brands: Array<{
    name: string;
    count: number;
  }>;
  ratings: Array<{
    rating: number;
    count: number;
  }>;
  availability: Array<{
    status: 'in_stock' | 'out_of_stock' | 'on_sale';
    count: number;
  }>;
  attributes: Record<string, Array<{
    value: string;
    count: number;
  }>>;
}

// Search filters interface
export interface SearchFilters {
  categories?: string[];
  brands?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  availability?: ('in_stock' | 'out_of_stock' | 'on_sale')[];
  attributes?: Record<string, string[]>;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popularity';
  dateRange?: {
    start?: string;
    end?: string;
  };
}

// Search suggestion interface
export interface SearchSuggestion {
  query: string;
  type: 'product' | 'category' | 'brand' | 'query';
  count: number;
  image?: string;
  category?: string;
}

// Recent search interface
export interface RecentSearch {
  query: string;
  timestamp: number;
  results: number;
  filters?: SearchFilters;
}

// Popular search interface
export interface PopularSearch {
  query: string;
  count: number;
  trending: boolean;
}

// Search analytics interface
export interface SearchAnalytics {
  query: string;
  timestamp: number;
  results: number;
  clickedProducts: string[];
  filters: SearchFilters;
  sessionId: string;
}

// Async thunks for search operations
export const searchProducts = createAsyncThunk(
  'search/searchProducts',
  async (params: {
    query: string;
    page?: number;
    limit?: number;
    filters?: SearchFilters;
    includeCategories?: boolean;
    includeSuggestions?: boolean;
  }) => {
    const queryParams = new URLSearchParams();

    queryParams.append('q', params.query);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.includeCategories) queryParams.append('includeCategories', 'true');
    if (params.includeSuggestions) queryParams.append('includeSuggestions', 'true');

    if (params.filters) {
      if (params.filters.categories?.length) {
        queryParams.append('categories', params.filters.categories.join(','));
      }
      if (params.filters.brands?.length) {
        queryParams.append('brands', params.filters.brands.join(','));
      }
      if (params.filters.priceRange) {
        queryParams.append('minPrice', params.filters.priceRange.min.toString());
        queryParams.append('maxPrice', params.filters.priceRange.max.toString());
      }
      if (params.filters.rating) {
        queryParams.append('rating', params.filters.rating.toString());
      }
      if (params.filters.availability?.length) {
        queryParams.append('availability', params.filters.availability.join(','));
      }
      if (params.filters.sortBy) {
        queryParams.append('sortBy', params.filters.sortBy);
      }
      if (params.filters.attributes) {
        Object.entries(params.filters.attributes).forEach(([key, values]) => {
          if (values.length) {
            queryParams.append(`attr_${key}`, values.join(','));
          }
        });
      }
    }

    const response = await fetch(`/api/search?${queryParams}`);
    if (!response.ok) {
      throw new Error('Search failed');
    }

    const result = await response.json();

    // Store search analytics
    if (params.query.trim()) {
      const analytics: SearchAnalytics = {
        query: params.query,
        timestamp: Date.now(),
        results: result.totalResults || 0,
        clickedProducts: [],
        filters: params.filters || {},
        sessionId: sessionStorage.getItem('sessionId') || 'anonymous',
      };

      // Store in localStorage for analytics
      const existingAnalytics = JSON.parse(localStorage.getItem('searchAnalytics') || '[]');
      existingAnalytics.push(analytics);

      // Keep only last 100 searches
      if (existingAnalytics.length > 100) {
        existingAnalytics.splice(0, existingAnalytics.length - 100);
      }

      localStorage.setItem('searchAnalytics', JSON.stringify(existingAnalytics));
    }

    return result;
  }
);

export const fetchSearchSuggestions = createAsyncThunk(
  'search/fetchSearchSuggestions',
  async (query: string) => {
    if (!query.trim()) return { suggestions: [] };

    const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch suggestions');
    }

    return response.json();
  }
);

export const fetchPopularSearches = createAsyncThunk(
  'search/fetchPopularSearches',
  async (limit: number = 10) => {
    const response = await fetch(`/api/search/popular?limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch popular searches');
    }

    return response.json();
  }
);

export const fetchTrendingSearches = createAsyncThunk(
  'search/fetchTrendingSearches',
  async (limit: number = 5) => {
    const response = await fetch(`/api/search/trending?limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch trending searches');
    }

    return response.json();
  }
);

export const fetchSearchFacets = createAsyncThunk(
  'search/fetchSearchFacets',
  async (query: string) => {
    const response = await fetch(`/api/search/facets?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch search facets');
    }

    return response.json();
  }
);

export const trackSearchClick = createAsyncThunk(
  'search/trackSearchClick',
  async (params: {
    query: string;
    productId: string;
    position: number;
  }) => {
    const response = await fetch('/api/search/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Failed to track search click');
    }

    return response.json();
  }
);

interface SearchState {
  // Search results
  results: SearchResult | null;
  suggestions: SearchSuggestion[];
  popularSearches: PopularSearch[];
  trendingSearches: PopularSearch[];

  // Current search
  query: string;
  lastQuery: string;
  filters: SearchFilters;

  // Recent searches
  recentSearches: RecentSearch[];

  // Pagination
  pagination: PaginationMeta;

  // Loading states
  isSearching: boolean;
  isLoadingSuggestions: boolean;
  isLoadingFacets: boolean;

  // UI state
  showSuggestions: boolean;
  showFilters: boolean;
  selectedSuggestionIndex: number;
  searchInputFocused: boolean;

  // Search history and analytics
  searchHistory: RecentSearch[];
  searchAnalytics: SearchAnalytics[];

  // Auto-complete and suggestions
  autoCompleteEnabled: boolean;
  suggestionDelay: number;
  suggestionMinLength: number;

  // Advanced search
  advancedSearchVisible: boolean;
  searchMode: 'simple' | 'advanced' | 'visual';

  // Error handling
  error: string | null;
  suggestionError: string | null;

  // Performance metrics
  lastSearchTime: number;
  averageSearchTime: number;
  searchCount: number;

  // Cache
  resultsCache: Record<string, { result: SearchResult; timestamp: number; filters: SearchFilters }>;
  suggestionCache: Record<string, { suggestions: SearchSuggestion[]; timestamp: number }>;
  cacheExpiry: number;
}

const initialState: SearchState = {
  results: null,
  suggestions: [],
  popularSearches: [],
  trendingSearches: [],
  query: '',
  lastQuery: '',
  filters: {
    sortBy: 'relevance',
  },
  recentSearches: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('recentSearches') || '[]') : [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  isSearching: false,
  isLoadingSuggestions: false,
  isLoadingFacets: false,
  showSuggestions: false,
  showFilters: false,
  selectedSuggestionIndex: -1,
  searchInputFocused: false,
  searchHistory: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('searchHistory') || '[]') : [],
  searchAnalytics: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('searchAnalytics') || '[]') : [],
  autoCompleteEnabled: true,
  suggestionDelay: 300,
  suggestionMinLength: 2,
  advancedSearchVisible: false,
  searchMode: 'simple',
  error: null,
  suggestionError: null,
  lastSearchTime: 0,
  averageSearchTime: 0,
  searchCount: 0,
  resultsCache: {},
  suggestionCache: {},
  cacheExpiry: 5 * 60 * 1000, // 5 minutes
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    // Query management
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },

    clearQuery: (state) => {
      state.query = '';
      state.results = null;
      state.suggestions = [];
    },

    // Filter management
    setFilters: (state, action: PayloadAction<SearchFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    clearFilters: (state) => {
      state.filters = { sortBy: 'relevance' };
    },

    updateFilter: (state, action: PayloadAction<{ key: keyof SearchFilters; value: unknown }>) => {
      const { key, value } = action.payload;
      if (value === null || value === undefined) {
        delete state.filters[key];
      } else {
        state.filters[key] = value as never;
      }
    },

    // Suggestion management
    setShowSuggestions: (state, action: PayloadAction<boolean>) => {
      state.showSuggestions = action.payload;
    },

    setSelectedSuggestionIndex: (state, action: PayloadAction<number>) => {
      state.selectedSuggestionIndex = action.payload;
    },

    selectNextSuggestion: (state) => {
      if (state.selectedSuggestionIndex < state.suggestions.length - 1) {
        state.selectedSuggestionIndex += 1;
      } else {
        state.selectedSuggestionIndex = 0;
      }
    },

    selectPreviousSuggestion: (state) => {
      if (state.selectedSuggestionIndex > 0) {
        state.selectedSuggestionIndex -= 1;
      } else {
        state.selectedSuggestionIndex = state.suggestions.length - 1;
      }
    },

    // UI state
    setSearchInputFocused: (state, action: PayloadAction<boolean>) => {
      state.searchInputFocused = action.payload;
      if (!action.payload) {
        state.showSuggestions = false;
        state.selectedSuggestionIndex = -1;
      }
    },

    setShowFilters: (state, action: PayloadAction<boolean>) => {
      state.showFilters = action.payload;
    },

    toggleFilters: (state) => {
      state.showFilters = !state.showFilters;
    },

    setAdvancedSearchVisible: (state, action: PayloadAction<boolean>) => {
      state.advancedSearchVisible = action.payload;
    },

    setSearchMode: (state, action: PayloadAction<'simple' | 'advanced' | 'visual'>) => {
      state.searchMode = action.payload;
    },

    // Recent searches
    addRecentSearch: (state, action: PayloadAction<RecentSearch>) => {
      // Remove if already exists
      state.recentSearches = state.recentSearches.filter(
        search => search.query !== action.payload.query
      );

      // Add to beginning
      state.recentSearches.unshift(action.payload);

      // Keep only last 20
      if (state.recentSearches.length > 20) {
        state.recentSearches = state.recentSearches.slice(0, 20);
      }

      // Persist to localStorage (SSR-safe)
      if (typeof window !== 'undefined') {
        localStorage.setItem('recentSearches', JSON.stringify(state.recentSearches));
      }
    },

    removeRecentSearch: (state, action: PayloadAction<string>) => {
      state.recentSearches = state.recentSearches.filter(
        search => search.query !== action.payload
      );
      if (typeof window !== 'undefined') {
        localStorage.setItem('recentSearches', JSON.stringify(state.recentSearches));
      }
    },

    clearRecentSearches: (state) => {
      state.recentSearches = [];
      if (typeof window !== 'undefined') {
        localStorage.removeItem('recentSearches');
      }
    },

    // Search analytics
    addSearchAnalytics: (state, action: PayloadAction<SearchAnalytics>) => {
      state.searchAnalytics.push(action.payload);

      // Keep only last 100
      if (state.searchAnalytics.length > 100) {
        state.searchAnalytics = state.searchAnalytics.slice(-100);
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('searchAnalytics', JSON.stringify(state.searchAnalytics));
      }
    },

    updateSearchAnalytics: (state, action: PayloadAction<{ query: string; productId: string }>) => {
      const { query, productId } = action.payload;
      const analytics = state.searchAnalytics.find(
        item => item.query === query && Math.abs(item.timestamp - Date.now()) < 60000
      );

      if (analytics) {
        analytics.clickedProducts.push(productId);
        if (typeof window !== 'undefined') {
          localStorage.setItem('searchAnalytics', JSON.stringify(state.searchAnalytics));
        }
      }
    },

    // Settings
    setAutoCompleteEnabled: (state, action: PayloadAction<boolean>) => {
      state.autoCompleteEnabled = action.payload;
    },

    setSuggestionDelay: (state, action: PayloadAction<number>) => {
      state.suggestionDelay = action.payload;
    },

    setSuggestionMinLength: (state, action: PayloadAction<number>) => {
      state.suggestionMinLength = action.payload;
    },

    // Error handling
    clearError: (state) => {
      state.error = null;
      state.suggestionError = null;
    },

    // Cache management
    invalidateCache: (state) => {
      state.resultsCache = {};
      state.suggestionCache = {};
    },

    cleanupCache: (state) => {
      const now = Date.now();

      // Clean results cache
      Object.keys(state.resultsCache).forEach(key => {
        if (now - state.resultsCache[key].timestamp > state.cacheExpiry) {
          delete state.resultsCache[key];
        }
      });

      // Clean suggestion cache
      Object.keys(state.suggestionCache).forEach(key => {
        if (now - state.suggestionCache[key].timestamp > state.cacheExpiry) {
          delete state.suggestionCache[key];
        }
      });
    },

    // Performance tracking
    updateSearchMetrics: (state, action: PayloadAction<{ searchTime: number }>) => {
      const { searchTime } = action.payload;
      state.lastSearchTime = searchTime;
      state.searchCount += 1;

      // Calculate average search time
      state.averageSearchTime =
        (state.averageSearchTime * (state.searchCount - 1) + searchTime) / state.searchCount;
    },
  },
  extraReducers: (builder) => {
    // Search products
    builder
      .addCase(searchProducts.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.isSearching = false;
        state.results = action.payload;
        state.lastQuery = state.query;
        state.pagination = action.payload.pagination || state.pagination;

        // Cache results
        const cacheKey = `${state.query}_${JSON.stringify(state.filters)}`;
        state.resultsCache[cacheKey] = {
          result: action.payload,
          timestamp: Date.now(),
          filters: { ...state.filters },
        };

        // Add to recent searches if query is not empty
        if (state.query.trim()) {
          const recentSearch: RecentSearch = {
            query: state.query,
            timestamp: Date.now(),
            results: action.payload.totalResults || 0,
            filters: { ...state.filters },
          };

          // Use the reducer to add recent search
          searchSlice.caseReducers.addRecentSearch(state, {
            type: 'search/addRecentSearch',
            payload: recentSearch,
          } as PayloadAction<RecentSearch>);
        }

        state.error = null;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.error.message || 'Search failed';
      });

    // Fetch suggestions
    builder
      .addCase(fetchSearchSuggestions.pending, (state) => {
        state.isLoadingSuggestions = true;
        state.suggestionError = null;
      })
      .addCase(fetchSearchSuggestions.fulfilled, (state, action) => {
        state.isLoadingSuggestions = false;
        state.suggestions = action.payload.suggestions || [];

        // Cache suggestions
        if (state.query) {
          state.suggestionCache[state.query] = {
            suggestions: state.suggestions,
            timestamp: Date.now(),
          };
        }

        state.suggestionError = null;
      })
      .addCase(fetchSearchSuggestions.rejected, (state, action) => {
        state.isLoadingSuggestions = false;
        state.suggestionError = action.error.message || 'Failed to fetch suggestions';
      });

    // Fetch popular searches
    builder
      .addCase(fetchPopularSearches.fulfilled, (state, action) => {
        state.popularSearches = action.payload.searches || action.payload.data || [];
      });

    // Fetch trending searches
    builder
      .addCase(fetchTrendingSearches.fulfilled, (state, action) => {
        state.trendingSearches = action.payload.searches || action.payload.data || [];
      });

    // Fetch search facets
    builder
      .addCase(fetchSearchFacets.pending, (state) => {
        state.isLoadingFacets = true;
      })
      .addCase(fetchSearchFacets.fulfilled, (state, action) => {
        state.isLoadingFacets = false;
        if (state.results) {
          state.results.facets = action.payload.facets || action.payload;
        }
      })
      .addCase(fetchSearchFacets.rejected, (state, action) => {
        state.isLoadingFacets = false;
        state.error = action.error.message || 'Failed to fetch search facets';
      });

    // Track search click
    builder
      .addCase(trackSearchClick.fulfilled, (state, action) => {
        const { query, productId } = action.meta.arg;
        searchSlice.caseReducers.updateSearchAnalytics(state, {
          type: 'search/updateSearchAnalytics',
          payload: { query, productId },
        } as PayloadAction<{ query: string; productId: string }>);
      });
  },
});

export const {
  setQuery,
  clearQuery,
  setFilters,
  clearFilters,
  updateFilter,
  setShowSuggestions,
  setSelectedSuggestionIndex,
  selectNextSuggestion,
  selectPreviousSuggestion,
  setSearchInputFocused,
  setShowFilters,
  toggleFilters,
  setAdvancedSearchVisible,
  setSearchMode,
  addRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
  addSearchAnalytics,
  updateSearchAnalytics,
  setAutoCompleteEnabled,
  setSuggestionDelay,
  setSuggestionMinLength,
  clearError,
  invalidateCache,
  cleanupCache,
  updateSearchMetrics,
} = searchSlice.actions;

// Selectors
export const selectSearchResults = (state: { search: SearchState }) => state.search.results;
export const selectSearchQuery = (state: { search: SearchState }) => state.search.query;
export const selectSearchFilters = (state: { search: SearchState }) => state.search.filters;
export const selectSearchSuggestions = (state: { search: SearchState }) => state.search.suggestions;
export const selectSearchLoading = (state: { search: SearchState }) => state.search.isSearching;
export const selectSearchError = (state: { search: SearchState }) => state.search.error;
export const selectRecentSearches = (state: { search: SearchState }) => state.search.recentSearches;
export const selectPopularSearches = (state: { search: SearchState }) => state.search.popularSearches;
export const selectTrendingSearches = (state: { search: SearchState }) => state.search.trendingSearches;
export const selectShowSuggestions = (state: { search: SearchState }) => state.search.showSuggestions;
export const selectSelectedSuggestionIndex = (state: { search: SearchState }) => state.search.selectedSuggestionIndex;
export const selectSearchPagination = (state: { search: SearchState }) => state.search.pagination;

// Complex selectors
export const selectSearchProducts = (state: { search: SearchState }) =>
  state.search.results?.products || [];

export const selectSearchCategories = (state: { search: SearchState }) =>
  state.search.results?.categories || [];

export const selectSearchFacets = (state: { search: SearchState }) =>
  state.search.results?.facets;

export const selectSearchStats = (state: { search: SearchState }) => ({
  totalResults: state.search.results?.totalResults || 0,
  searchTime: state.search.results?.searchTime || 0,
  lastSearchTime: state.search.lastSearchTime,
  averageSearchTime: state.search.averageSearchTime,
  searchCount: state.search.searchCount,
});

export const selectHasActiveFilters = (state: { search: SearchState }) => {
  const filters = state.search.filters;
  return Boolean(
    filters.categories?.length ||
    filters.brands?.length ||
    filters.priceRange ||
    filters.rating ||
    filters.availability?.length ||
    (filters.attributes && Object.keys(filters.attributes).length > 0) ||
    (filters.sortBy && filters.sortBy !== 'relevance')
  );
};

export const selectCachedSuggestions = (state: { search: SearchState }, query: string) => {
  const cached = state.search.suggestionCache[query];
  if (cached && Date.now() - cached.timestamp < state.search.cacheExpiry) {
    return cached.suggestions;
  }
  return null;
};

export const selectCachedResults = (state: { search: SearchState }, query: string, filters: SearchFilters) => {
  const cacheKey = `${query}_${JSON.stringify(filters)}`;
  const cached = state.search.resultsCache[cacheKey];
  if (cached && Date.now() - cached.timestamp < state.search.cacheExpiry) {
    return cached.result;
  }
  return null;
};

export default searchSlice.reducer;
