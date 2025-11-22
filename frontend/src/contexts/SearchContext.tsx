/**
 * Search Context - Vardhman Mills Frontend
 * Manages product search, filtering, and discovery
 */

'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { debounce } from 'lodash';
import toast from 'react-hot-toast';

// Types
interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  category: string;
  subcategory: string;
  brand: string;
  fabric: string;
  color: string[];
  size: string[];
  weight: number;
  gsm?: number;
  threadCount?: number;
  imageUrl: string;
  images: string[];
  inStock: boolean;
  stockQuantity: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface SearchFilters {
  query: string;
  category: string[];
  subcategory: string[];
  brand: string[];
  fabric: string[];
  color: string[];
  size: string[];
  priceRange: [number, number];
  inStock: boolean;
  onSale: boolean;
  rating: number;
  sortBy: 'relevance' | 'price-low' | 'price-high' | 'name-asc' | 'name-desc' | 'newest' | 'oldest' | 'rating';
  gsm?: [number, number];
  threadCount?: [number, number];
  weight?: [number, number];
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'query' | 'product' | 'category' | 'brand';
  count?: number;
  url?: string;
  imageUrl?: string;
}

interface SearchHistory {
  id: string;
  query: string;
  filters: Partial<SearchFilters>;
  timestamp: Date;
  resultCount: number;
}

interface SearchState {
  // Search data
  products: Product[];
  suggestions: SearchSuggestion[];
  history: SearchHistory[];
  
  // Current search
  currentQuery: string;
  currentFilters: SearchFilters;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalResults: number;
  pageSize: number;
  
  // UI state
  loading: boolean;
  error: string | null;
  showSuggestions: boolean;
  showFilters: boolean;
  
  // Facets (for dynamic filtering)
  availableFilters: {
    categories: Array<{ value: string; label: string; count: number }>;
    brands: Array<{ value: string; label: string; count: number }>;
    fabrics: Array<{ value: string; label: string; count: number }>;
    colors: Array<{ value: string; label: string; count: number }>;
    sizes: Array<{ value: string; label: string; count: number }>;
    priceRanges: Array<{ min: number; max: number; count: number }>;
  };
  
  // Advanced
  searchMode: 'simple' | 'advanced';
  lastUpdated: Date | null;
}

type SearchAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'SET_SUGGESTIONS'; payload: SearchSuggestion[] }
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<SearchFilters> }
  | { type: 'RESET_FILTERS' }
  | { type: 'SET_PAGINATION'; payload: { page: number; totalPages: number; totalResults: number } }
  | { type: 'SET_SHOW_SUGGESTIONS'; payload: boolean }
  | { type: 'SET_SHOW_FILTERS'; payload: boolean }
  | { type: 'ADD_TO_HISTORY'; payload: SearchHistory }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'SET_AVAILABLE_FILTERS'; payload: SearchState['availableFilters'] }
  | { type: 'SET_SEARCH_MODE'; payload: 'simple' | 'advanced' }
  | { type: 'CLEAR_SEARCH' };

interface SearchContextType {
  state: SearchState;
  
  // Search operations
  search: (query: string, filters?: Partial<SearchFilters>) => Promise<void>;
  clearSearch: () => void;
  loadMore: () => Promise<void>;
  
  // Query management
  setQuery: (query: string) => void;
  getSuggestions: (query: string) => Promise<void>;
  
  // Filter management
  setFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  toggleFilter: (filterType: keyof SearchFilters, value: string | number | boolean) => void;
  
  // History
  addToHistory: (query: string, filters: Partial<SearchFilters>, resultCount: number) => void;
  clearHistory: () => void;
  searchFromHistory: (historyItem: SearchHistory) => Promise<void>;
  
  // UI management
  setShowSuggestions: (show: boolean) => void;
  setShowFilters: (show: boolean) => void;
  setSearchMode: (mode: 'simple' | 'advanced') => void;
  
  // Pagination
  goToPage: (page: number) => Promise<void>;
  
  // Utility
  getProductById: (id: string) => Product | undefined;
  getSearchUrl: () => string;
  exportResults: (format: 'csv' | 'json') => void;
  
  // Analytics
  trackSearch: (query: string, resultCount: number) => void;
  trackClick: (productId: string, position: number) => void;
}

// Default filters
const defaultFilters: SearchFilters = {
  query: '',
  category: [],
  subcategory: [],
  brand: [],
  fabric: [],
  color: [],
  size: [],
  priceRange: [0, 10000],
  inStock: false,
  onSale: false,
  rating: 0,
  sortBy: 'relevance',
};

// Initial state
const initialState: SearchState = {
  products: [],
  suggestions: [],
  history: [],
  currentQuery: '',
  currentFilters: defaultFilters,
  currentPage: 1,
  totalPages: 0,
  totalResults: 0,
  pageSize: 24,
  loading: false,
  error: null,
  showSuggestions: false,
  showFilters: false,
  availableFilters: {
    categories: [],
    brands: [],
    fabrics: [],
    colors: [],
    sizes: [],
    priceRanges: [],
  },
  searchMode: 'simple',
  lastUpdated: null,
};

// Utility functions
const generateSearchId = (): string => {
  return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const buildSearchParams = (query: string, filters: Partial<SearchFilters>, page: number = 1): URLSearchParams => {
  const params = new URLSearchParams();
  
  if (query) params.set('q', query);
  if (page > 1) params.set('page', page.toString());
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value && key !== 'query') {
      if (Array.isArray(value) && value.length > 0) {
        params.set(key, value.join(','));
      } else if (typeof value === 'boolean' && value) {
        params.set(key, 'true');
      } else if (typeof value === 'number' && value > 0) {
        params.set(key, value.toString());
      } else if (typeof value === 'string' && value !== 'relevance') {
        params.set(key, value);
      }
    }
  });
  
  return params;
};

// Reducer
const searchReducer = (state: SearchState, action: SearchAction): SearchState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_PRODUCTS':
      return {
        ...state,
        products: action.payload,
        lastUpdated: new Date(),
        error: null,
      };
    
    case 'SET_SUGGESTIONS':
      return { ...state, suggestions: action.payload };
    
    case 'SET_QUERY':
      return { ...state, currentQuery: action.payload };
    
    case 'SET_FILTERS':
      return {
        ...state,
        currentFilters: { ...state.currentFilters, ...action.payload },
      };
    
    case 'RESET_FILTERS':
      return {
        ...state,
        currentFilters: { ...defaultFilters, query: state.currentQuery },
      };
    
    case 'SET_PAGINATION':
      return {
        ...state,
        currentPage: action.payload.page,
        totalPages: action.payload.totalPages,
        totalResults: action.payload.totalResults,
      };
    
    case 'SET_SHOW_SUGGESTIONS':
      return { ...state, showSuggestions: action.payload };
    
    case 'SET_SHOW_FILTERS':
      return { ...state, showFilters: action.payload };
    
    case 'ADD_TO_HISTORY': {
      const newHistory = [action.payload, ...state.history.slice(0, 49)]; // Keep last 50
      return { ...state, history: newHistory };
    }
    
    case 'CLEAR_HISTORY':
      return { ...state, history: [] };
    
    case 'SET_AVAILABLE_FILTERS':
      return { ...state, availableFilters: action.payload };
    
    case 'SET_SEARCH_MODE':
      return { ...state, searchMode: action.payload };
    
    case 'CLEAR_SEARCH':
      return {
        ...state,
        products: [],
        currentQuery: '',
        currentFilters: defaultFilters,
        currentPage: 1,
        totalPages: 0,
        totalResults: 0,
        suggestions: [],
        showSuggestions: false,
        error: null,
      };
    
    default:
      return state;
  }
};

// Context
const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Provider component
interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(searchReducer, initialState);
  
  // Load search history on mount
  useEffect(() => {
    loadHistory();
  }, []);
  
  // Debounced search function
  const debouncedSearch = debounce(async (query: string, filters: Partial<SearchFilters>) => {
    await performSearch(query, filters, 1);
  }, 300);
  
  const loadHistory = (): void => {
    try {
      const savedHistory = localStorage.getItem('search_history');
      if (savedHistory) {
        const history = JSON.parse(savedHistory).map((item: SearchHistory) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        history.forEach((item: SearchHistory) => {
          dispatch({ type: 'ADD_TO_HISTORY', payload: item });
        });
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  };
  
  const saveHistory = (history: SearchHistory[]): void => {
    try {
      localStorage.setItem('search_history', JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  };
  
  const performSearch = async (
    query: string,
    filters: Partial<SearchFilters> = {},
    page: number = 1
  ): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const searchParams = buildSearchParams(query, filters, page);
      const response = await fetch(`/api/search/products?${searchParams}`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      dispatch({ type: 'SET_PRODUCTS', payload: data.products });
      dispatch({ type: 'SET_PAGINATION', payload: {
        page: data.page,
        totalPages: data.totalPages,
        totalResults: data.totalResults,
      }});
      dispatch({ type: 'SET_AVAILABLE_FILTERS', payload: data.filters });
      
      // Add to history if it's a new search (page 1)
      if (page === 1 && query) {
        addToHistory(query, filters, data.totalResults);
      }
      
      // Track search analytics
      trackSearch(query, data.totalResults);
      
    } catch (error) {
      console.error('Search error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Search failed. Please try again.' });
      toast.error('Search failed');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  // Context methods
  const search = async (query: string, filters: Partial<SearchFilters> = {}): Promise<void> => {
    dispatch({ type: 'SET_QUERY', payload: query });
    dispatch({ type: 'SET_FILTERS', payload: filters });
    await performSearch(query, filters, 1);
  };
  
  const clearSearch = (): void => {
    dispatch({ type: 'CLEAR_SEARCH' });
  };
  
  const loadMore = async (): Promise<void> => {
    if (state.currentPage < state.totalPages) {
      await performSearch(state.currentQuery, state.currentFilters, state.currentPage + 1);
    }
  };
  
  const setQuery = (query: string): void => {
    dispatch({ type: 'SET_QUERY', payload: query });
    if (query) {
      debouncedSearch(query, state.currentFilters);
    }
  };
  
  const getSuggestions = async (query: string): Promise<void> => {
    if (!query || query.length < 2) {
      dispatch({ type: 'SET_SUGGESTIONS', payload: [] });
      return;
    }
    
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'SET_SUGGESTIONS', payload: data.suggestions });
      }
    } catch (error) {
      console.error('Failed to get suggestions:', error);
    }
  };
  
  const setFilters = (filters: Partial<SearchFilters>): void => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
    performSearch(state.currentQuery, { ...state.currentFilters, ...filters }, 1);
  };
  
  const resetFilters = (): void => {
    dispatch({ type: 'RESET_FILTERS' });
    performSearch(state.currentQuery, defaultFilters, 1);
  };
  
  const toggleFilter = (filterType: keyof SearchFilters, value: string | number | boolean): void => {
    const currentFilter = state.currentFilters[filterType];
    let newValue: unknown;
    
    if (Array.isArray(currentFilter)) {
      const stringValue = value.toString();
      newValue = (currentFilter as string[]).includes(stringValue)
        ? (currentFilter as string[]).filter(item => item !== stringValue)
        : [...(currentFilter as string[]), stringValue];
    } else if (typeof currentFilter === 'boolean') {
      newValue = !currentFilter;
    } else {
      newValue = value;
    }
    
    setFilters({ [filterType]: newValue } as Partial<SearchFilters>);
  };
  
  const addToHistory = (query: string, filters: Partial<SearchFilters>, resultCount: number): void => {
    const historyItem: SearchHistory = {
      id: generateSearchId(),
      query,
      filters,
      timestamp: new Date(),
      resultCount,
    };
    
    dispatch({ type: 'ADD_TO_HISTORY', payload: historyItem });
    saveHistory([historyItem, ...state.history]);
  };
  
  const clearHistory = (): void => {
    dispatch({ type: 'CLEAR_HISTORY' });
    localStorage.removeItem('search_history');
    toast.success('Search history cleared');
  };
  
  const searchFromHistory = async (historyItem: SearchHistory): Promise<void> => {
    await search(historyItem.query, historyItem.filters);
  };
  
  const setShowSuggestions = (show: boolean): void => {
    dispatch({ type: 'SET_SHOW_SUGGESTIONS', payload: show });
  };
  
  const setShowFilters = (show: boolean): void => {
    dispatch({ type: 'SET_SHOW_FILTERS', payload: show });
  };
  
  const setSearchMode = (mode: 'simple' | 'advanced'): void => {
    dispatch({ type: 'SET_SEARCH_MODE', payload: mode });
  };
  
  const goToPage = async (page: number): Promise<void> => {
    await performSearch(state.currentQuery, state.currentFilters, page);
  };
  
  const getProductById = (id: string): Product | undefined => {
    return state.products.find(product => product.id === id);
  };
  
  const getSearchUrl = (): string => {
    const params = buildSearchParams(state.currentQuery, state.currentFilters, state.currentPage);
    return `/search?${params.toString()}`;
  };
  
  const exportResults = (format: 'csv' | 'json'): void => {
    try {
      let content: string;
      let filename: string;
      let mimeType: string;
      
      if (format === 'csv') {
        const headers = ['Name', 'Price', 'Category', 'Brand', 'In Stock'];
        const rows = state.products.map(product => [
          product.name,
          product.price.toString(),
          product.category,
          product.brand,
          product.inStock ? 'Yes' : 'No',
        ]);
        
        content = [headers, ...rows].map(row => row.join(',')).join('\n');
        filename = `search-results-${Date.now()}.csv`;
        mimeType = 'text/csv';
      } else {
        content = JSON.stringify(state.products, null, 2);
        filename = `search-results-${Date.now()}.json`;
        mimeType = 'application/json';
      }
      
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Results exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Failed to export results:', error);
      toast.error('Failed to export results');
    }
  };
  
  const trackSearch = (query: string, resultCount: number): void => {
    // Analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'search', {
        search_term: query,
        result_count: resultCount,
      });
    }
  };
  
  const trackClick = (productId: string, position: number): void => {
    // Analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'select_item', {
        item_id: productId,
        position: position,
        search_term: state.currentQuery,
      });
    }
  };
  
  const contextValue: SearchContextType = {
    state,
    search,
    clearSearch,
    loadMore,
    setQuery,
    getSuggestions,
    setFilters,
    resetFilters,
    toggleFilter,
    addToHistory,
    clearHistory,
    searchFromHistory,
    setShowSuggestions,
    setShowFilters,
    setSearchMode,
    goToPage,
    getProductById,
    getSearchUrl,
    exportResults,
    trackSearch,
    trackClick,
  };
  
  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
};

// Hook
export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export default SearchContext;
export type { Product, SearchFilters, SearchSuggestion, SearchHistory, SearchState };