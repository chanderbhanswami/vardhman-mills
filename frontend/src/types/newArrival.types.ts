import { BaseEntity, ID, Timestamp, ImageAsset, PaginatedResponse, APIResponse, APIError } from './common.types';

// New Arrival Types - Simple types for home page new arrivals section

// ===== CORE TYPES =====
export type ArrivalStatus = 'active' | 'inactive' | 'scheduled' | 'expired';
export type ProductCategory = 'clothing' | 'accessories' | 'footwear' | 'bags' | 'jewelry' | 'electronics' | 'home' | 'beauty' | 'sports' | 'books' | 'other';
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

// ===== MAIN NEW ARRIVAL ENTITY =====
export interface NewArrival extends BaseEntity {
  id: ID;
  productId: ID;
  title: string;
  description?: string;
  category: ProductCategory;
  status: ArrivalStatus;
  
  // Display Information
  displayOrder: number;
  isFeature: boolean;
  isTrending: boolean;
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
  arrivalDate: Timestamp;
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

// ===== DISPLAY CONFIGURATION =====
export interface NewArrivalSection {
  id: ID;
  title: string;
  subtitle?: string;
  displayType: DisplayType;
  maxItems: number;
  showViewAll: boolean;
  
  // Filtering
  categories: ProductCategory[];
  excludeCategories?: ProductCategory[];
  onlyFeatured: boolean;
  onlyTrending: boolean;
  
  // Sorting
  sortBy: 'arrival_date' | 'display_order' | 'price' | 'popularity' | 'name';
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
export interface NewArrivalAnalytics {
  id: ID;
  period: 'daily' | 'weekly' | 'monthly';
  date: Timestamp;
  
  // Section Performance
  sectionViews: number;
  sectionClicks: number;
  
  // Product Performance
  topProducts: ProductPerformance[];
  categoryBreakdown: CategoryPerformance[];
  
  // User Behavior
  averageTimeSpent: number;
  interactionRate: number;
  clickThroughRate: number;
  conversionRate: number;
  
  // Device Breakdown
  deviceBreakdown: {
    desktop: number;
    tablet: number;
    mobile: number;
  };
}

export interface ProductPerformance {
  productId: ID;
  productName: string;
  views: number;
  clicks: number;
  addToCartCount: number;
  conversionRate: number;
}

export interface CategoryPerformance {
  category: ProductCategory;
  productCount: number;
  totalViews: number;
  totalClicks: number;
  averageConversion: number;
}

// ===== REQUEST/RESPONSE INTERFACES =====
export interface CreateNewArrivalRequest {
  productId: ID;
  displayOrder?: number;
  isFeature?: boolean;
  isTrending?: boolean;
  badge?: string;
  displayStartDate: Timestamp;
  displayEndDate?: Timestamp;
  tags?: string[];
  customFields?: Record<string, unknown>;
}

export interface UpdateNewArrivalRequest {
  displayOrder?: number;
  isFeature?: boolean;
  isTrending?: boolean;
  badge?: string;
  status?: ArrivalStatus;
  displayStartDate?: Timestamp;
  displayEndDate?: Timestamp;
  tags?: string[];
  customFields?: Record<string, unknown>;
}

export interface NewArrivalQueryParams extends PaginationParams, SortParams, FilterParams {
  category?: ProductCategory[];
  status?: ArrivalStatus[];
  isFeature?: boolean;
  isTrending?: boolean;
  dateRange?: {
    start: Timestamp;
    end: Timestamp;
  };
}

export type NewArrivalResponse = APIResponse<NewArrival>;
export type NewArrivalListResponse = APIResponse<PaginatedResponse<NewArrival>>;
export type NewArrivalAnalyticsResponse = APIResponse<NewArrivalAnalytics>;

// ===== HOOKS & STATE MANAGEMENT =====
export interface UseNewArrivalHook {
  newArrivals: NewArrival[];
  isLoading: boolean;
  error: APIError | null;
  
  // Actions
  fetchNewArrivals: (params?: NewArrivalQueryParams) => Promise<void>;
  createNewArrival: (data: CreateNewArrivalRequest) => Promise<void>;
  updateNewArrival: (id: ID, data: UpdateNewArrivalRequest) => Promise<void>;
  deleteNewArrival: (id: ID) => Promise<void>;
  
  // Analytics
  trackView: (id: ID) => void;
  trackClick: (id: ID) => void;
  trackAddToCart: (id: ID) => void;
  
  // Bulk Operations
  bulkUpdate: (ids: ID[], data: UpdateNewArrivalRequest) => Promise<void>;
  bulkDelete: (ids: ID[]) => Promise<void>;
}

export interface UseNewArrivalSectionHook {
  section: NewArrivalSection | null;
  products: NewArrival[];
  isLoading: boolean;
  error: APIError | null;
  
  // Actions
  fetchSection: () => Promise<void>;
  updateSection: (data: Partial<NewArrivalSection>) => Promise<void>;
  
  // Product Actions
  addProduct: (productId: ID) => Promise<void>;
  removeProduct: (productId: ID) => Promise<void>;
  reorderProducts: (productIds: ID[]) => Promise<void>;
  
  // Analytics
  fetchAnalytics: (period: string) => Promise<void>;
}

// ===== COMPONENT PROPS =====
export interface NewArrivalSectionProps {
  sectionId?: ID;
  title?: string;
  subtitle?: string;
  displayType?: DisplayType;
  maxItems?: number;
  categories?: ProductCategory[];
  showViewAll?: boolean;
  showPrices?: boolean;
  showAddToCart?: boolean;
  className?: string;
  onProductClick?: (product: NewArrival) => void;
  onAddToCart?: (product: NewArrival) => void;
}

export interface NewArrivalCardProps {
  product: NewArrival;
  showPrice?: boolean;
  showDiscount?: boolean;
  showBadge?: boolean;
  showQuickView?: boolean;
  showAddToCart?: boolean;
  onClick?: (product: NewArrival) => void;
  onAddToCart?: (product: NewArrival) => void;
  onQuickView?: (product: NewArrival) => void;
  className?: string;
}

export interface NewArrivalManagerProps {
  onProductSelect: (products: NewArrival[]) => void;
  selectedProducts?: ID[];
  categories?: ProductCategory[];
  maxSelections?: number;
  allowMultiple?: boolean;
  className?: string;
}
