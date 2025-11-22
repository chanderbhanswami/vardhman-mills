
export interface SearchQuery {
  q: string;
  filters?: ProductFilter;
  suggestions?: boolean;
  autocomplete?: boolean;
}

export interface SearchResult {
  query: string;
  products: Product[];
  categories: Category[];
  brands: Brand[];
  suggestions: SearchSuggestion[];
  totalResults: number;
  searchTime: number;
  filters: SearchFilters;
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SearchSuggestion {
  text: string;
  type: 'product' | 'category' | 'brand' | 'query';
  count?: number;
  image?: string;
}

export interface SearchFilters {
  categories: FilterOption[];
  brands: FilterOption[];
  colors: FilterOption[];
  sizes: FilterOption[];
  materials: FilterOption[];
  priceRanges: PriceRange[];
  ratings: FilterOption[];
  availability: FilterOption[];
}

export interface FilterOption {
  id: string;
  name: string;
  count: number;
  isSelected: boolean;
}

export interface PriceRange {
  min: number;
  max: number;
  count: number;
  isSelected: boolean;
}

export interface SearchHistory {
  id: string;
  query: string;
  resultsCount: number;
  searchedAt: Date;
}

export interface PopularSearch {
  query: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
}

export interface SearchAnalytics {
  topQueries: PopularSearch[];
  noResultQueries: string[];
  categoryTrends: {
    category: string;
    searches: number;
    growth: number;
  }[];
  userSearchHistory: SearchHistory[];
}
