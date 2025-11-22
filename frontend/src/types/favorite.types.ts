import {
  ID,
  Timestamp,
  BaseEntity,
  ImageAsset,
  PaginatedResponse,
  APIResponse
} from './common.types';

// Our Favorite Types - Home page section for showcasing curated products

// ===== CORE TYPES =====
export type FavoriteStatus = 'active' | 'inactive' | 'scheduled' | 'expired';
export type FavoriteCategory = 'clothing' | 'accessories' | 'footwear' | 'bags' | 'jewelry' | 'electronics' | 'home' | 'beauty' | 'sports' | 'books' | 'other';
export type DisplayType = 'grid' | 'carousel' | 'list' | 'featured';

// ===== BASIC INTERFACES =====
export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

export interface SortParams {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: unknown;
}

// ===== MAIN FAVORITE ENTITY =====
export interface Favorite extends BaseEntity {
  id: ID;
  productId: ID;
  title: string;
  description?: string;
  category: FavoriteCategory;
  status: FavoriteStatus;
  
  // Display Information
  displayOrder: number;
  isFeatured: boolean;
  isEditorsPick: boolean;
  badge?: string;
  
  // Product Details
  price: number;
  originalPrice?: number;
  discount?: number;
  currency: string;
  
  // Media
  images: ImageAsset[];
  thumbnail: ImageAsset;
  
  // Dates
  selectedDate: Timestamp;
  displayStartDate: Timestamp;
  displayEndDate?: Timestamp;
  
  // Analytics
  viewCount: number;
  clickCount: number;
  addToCartCount: number;
  
  // SEO & Marketing
  tags: string[];
  keywords: string[];
  metaTitle?: string;
  metaDescription?: string;
  
  // User Management
  createdBy: ID;
  updatedBy: ID;
  
  // Timeline
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Custom Fields
  customFields: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

// ===== FAVORITE COLLECTION =====
export interface FavoriteCollection extends BaseEntity {
  id: ID;
  name: string;
  description?: string;
  slug: string;
  
  // Display Properties
  coverImage?: ImageAsset;
  bannerImage?: ImageAsset;
  color?: string;
  icon?: string;
  
  // Content
  favorites: Favorite[];
  favoriteCount: number;
  displayType: DisplayType;
  maxItems: number;
  
  // Filtering
  categories: FavoriteCategory[];
  excludeCategories?: FavoriteCategory[];
  onlyFeatured: boolean;
  onlyEditorsPicks: boolean;
  
  // Sorting
  sortBy: 'selected_date' | 'display_order' | 'price' | 'popularity' | 'name';
  sortOrder: 'asc' | 'desc';
  
  // Display Settings
  showPrices: boolean;
  showDiscounts: boolean;
  showBadges: boolean;
  showQuickView: boolean;
  showAddToCart: boolean;
  
  // Responsive
  itemsPerRow: {
    desktop: number;
    tablet: number;
    mobile: number;
  };
  
  // Status
  status: FavoriteStatus;
  isActive: boolean;
  
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  
  // Timeline
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ===== SECTION CONFIGURATION =====
export interface FavoriteSection {
  id: ID;
  title: string;
  subtitle?: string;
  description?: string;
  displayType: DisplayType;
  maxItems: number;
  showViewAll: boolean;
  
  // Filtering
  categories: FavoriteCategory[];
  excludeCategories?: FavoriteCategory[];
  onlyFeatured: boolean;
  onlyEditorsPicks: boolean;
  
  // Sorting
  sortBy: 'selected_date' | 'display_order' | 'price' | 'popularity' | 'name';
  sortOrder: 'asc' | 'desc';
  
  // Display Settings
  showPrices: boolean;
  showDiscounts: boolean;
  showBadges: boolean;
  showQuickView: boolean;
  showAddToCart: boolean;
  
  // Responsive
  itemsPerRow: {
    desktop: number;
    tablet: number;
    mobile: number;
  };
  
  // Analytics
  trackViews: boolean;
  trackClicks: boolean;
  
  // Status
  isActive: boolean;
  
  // Timeline
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ===== ANALYTICS =====
export interface FavoriteAnalytics {
  id: ID;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: Timestamp;
  endDate: Timestamp;
  
  // Performance Metrics
  totalViews: number;
  totalClicks: number;
  totalAddToCarts: number;
  conversionRate: number;
  clickThroughRate: number;
  
  // Product Performance
  topPerformingProducts: ProductPerformance[];
  categoryPerformance: CategoryPerformance[];
  
  // User Engagement
  uniqueViewers: number;
  repeatViewers: number;
  avgTimeSpent: number;
  bounceRate: number;
  
  // Device Analytics
  deviceBreakdown: Record<string, number>;
  browserBreakdown: Record<string, number>;
  
  // Geographic Analytics
  countryBreakdown: Record<string, number>;
  cityBreakdown: Record<string, number>;
  
  // Time Analytics
  hourlyBreakdown: Record<string, number>;
  dailyBreakdown: Record<string, number>;
  
  // Timeline
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ProductPerformance {
  productId: ID;
  productName: string;
  views: number;
  clicks: number;
  addToCarts: number;
  conversionRate: number;
}

export interface CategoryPerformance {
  category: FavoriteCategory;
  count: number;
  views: number;
  clicks: number;
  conversionRate: number;
}

// ===== REQUEST/RESPONSE INTERFACES =====
export interface CreateFavoriteRequest {
  productId: ID;
  title: string;
  description?: string;
  category: FavoriteCategory;
  status: FavoriteStatus;
  displayOrder: number;
  isFeatured: boolean;
  isEditorsPick: boolean;
  badge?: string;
  selectedDate: Timestamp;
  displayStartDate: Timestamp;
  displayEndDate?: Timestamp;
  tags?: string[];
  keywords?: string[];
  metaTitle?: string;
  metaDescription?: string;
}

export type UpdateFavoriteRequest = Partial<CreateFavoriteRequest>;

export interface FavoriteQueryParams extends PaginationParams, SortParams, FilterParams {
  status?: FavoriteStatus;
  category?: FavoriteCategory;
  isFeatured?: boolean;
  isEditorsPick?: boolean;
  dateRange?: {
    start: Timestamp;
    end: Timestamp;
  };
}

export interface CreateFavoriteCollectionRequest {
  name: string;
  description?: string;
  slug: string;
  displayType: DisplayType;
  maxItems: number;
  categories: FavoriteCategory[];
  onlyFeatured: boolean;
  onlyEditorsPicks: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  showPrices: boolean;
  showDiscounts: boolean;
  showBadges: boolean;
  itemsPerRow: {
    desktop: number;
    tablet: number;
    mobile: number;
  };
}

export type UpdateFavoriteCollectionRequest = Partial<CreateFavoriteCollectionRequest>;

export type FavoriteResponse = APIResponse<Favorite>;
export type FavoriteListResponse = APIResponse<PaginatedResponse<Favorite>>;
export type FavoriteCollectionResponse = APIResponse<FavoriteCollection>;
export type FavoriteAnalyticsResponse = APIResponse<FavoriteAnalytics>;

// ===== HOOKS & STATE MANAGEMENT =====
export interface UseFavoriteHook {
  favorites: Favorite[];
  loading: boolean;
  error: string | null;
  
  // Actions
  createFavorite: (data: CreateFavoriteRequest) => Promise<Favorite>;
  updateFavorite: (id: ID, data: UpdateFavoriteRequest) => Promise<Favorite>;
  deleteFavorite: (id: ID) => Promise<void>;
  fetchFavorites: (params?: FavoriteQueryParams) => Promise<void>;
  fetchFavorite: (id: ID) => Promise<void>;
  reorderFavorites: (favoriteIds: ID[]) => Promise<void>;
}

export interface UseFavoriteSectionHook {
  section: FavoriteSection | null;
  favorites: Favorite[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchSection: () => Promise<void>;
  updateSection: (data: Partial<FavoriteSection>) => Promise<void>;
  refreshFavorites: () => Promise<void>;
  trackView: (favoriteId: ID) => Promise<void>;
  trackClick: (favoriteId: ID) => Promise<void>;
}

// ===== COMPONENT PROPS =====
export interface FavoriteSectionProps {
  sectionId?: ID;
  title?: string;
  subtitle?: string;
  displayType?: DisplayType;
  maxItems?: number;
  showViewAll?: boolean;
  categories?: FavoriteCategory[];
  className?: string;
  onFavoriteClick?: (favorite: Favorite) => void;
  onViewAllClick?: () => void;
}

export interface FavoriteCardProps {
  favorite: Favorite;
  showPrice?: boolean;
  showDiscount?: boolean;
  showBadge?: boolean;
  showQuickView?: boolean;
  showAddToCart?: boolean;
  layout?: 'card' | 'list' | 'minimal';
  className?: string;
  onClick?: () => void;
  onAddToCart?: () => void;
}

export interface FavoriteManagerProps {
  onFavoriteSelect?: (favorite: Favorite) => void;
  onFavoriteCreate?: (favorite: Favorite) => void;
  onFavoriteUpdate?: (favorite: Favorite) => void;
  onFavoriteDelete?: (id: ID) => void;
  onFavoriteReorder?: (favoriteIds: ID[]) => void;
}
