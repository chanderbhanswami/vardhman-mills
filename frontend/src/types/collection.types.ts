import { 
  ID, 
  Timestamp, 
  ImageAsset, 
  SEOData, 
  Status,
  PaginatedResponse 
} from './common.types';

// Re-export Collection from product.types for convenience
export type { Collection, CollectionRule } from './product.types';

// Additional Collection-specific types
export interface CollectionFilters {
  type?: 'manual' | 'automatic' | 'seasonal' | 'promotional';
  status?: Status;
  isVisible?: boolean;
  isFeatured?: boolean;
  hasProducts?: boolean;
  isActive?: boolean; // based on start/end dates
  search?: string;
  sortBy?: 'name' | 'created_at' | 'product_count' | 'start_date';
  sortOrder?: 'asc' | 'desc';
}

export interface CollectionListing {
  collections: PaginatedResponse<Collection>;
  filters: CollectionFilterGroup[];
  sortOptions: CollectionSortOption[];
  featuredCollections: Collection[];
  seasonalCollections: Collection[];
  promotionalCollections: Collection[];
}

export interface CollectionFilterGroup {
  id: string;
  name: string;
  type: 'checkbox' | 'radio' | 'range' | 'date';
  options: CollectionFilterOption[];
  isCollapsed: boolean;
}

export interface CollectionFilterOption {
  id: string;
  label: string;
  value: string | number;
  count: number;
  isSelected: boolean;
}

export interface CollectionSortOption {
  value: string;
  label: string;
  field: string;
  order: 'asc' | 'desc';
}

export interface CollectionShowcase {
  collection: Collection;
  products: Product[];
  relatedCollections: Collection[];
  collectionStory?: CollectionStorySection[];
}

export interface CollectionStorySection {
  id: ID;
  title: string;
  content: string;
  image?: ImageAsset;
  video?: VideoAsset;
  order: number;
}

export interface SeasonalCollection {
  collection: Collection;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  year: number;
  themeColor: string;
  moodBoard: ImageAsset[];
}

export interface PromotionalCollection {
  collection: Collection;
  promotionType: 'sale' | 'new_arrival' | 'limited_edition' | 'clearance' | 'exclusive';
  discountPercentage?: number;
  promocode?: string;
  urgencyText?: string;
}

export interface CollectionNavigation {
  featuredCollections: Collection[];
  seasonalCollections: SeasonalCollection[];
  promotionalCollections: PromotionalCollection[];
  popularCollections: Collection[];
}

export interface CollectionForm {
  name: string;
  slug: string;
  description?: string;
  type: 'manual' | 'automatic' | 'seasonal' | 'promotional';
  image?: File | ImageAsset;
  bannerImage?: File | ImageAsset;
  status: Status;
  isVisible: boolean;
  isFeatured: boolean;
  startDate?: string;
  endDate?: string;
  productIds?: ID[]; // for manual collections
  rules?: CollectionRule[]; // for automatic collections
  sortOrder: number;
  productSortOrder: 'created_desc' | 'created_asc' | 'price_desc' | 'price_asc' | 'name_asc' | 'name_desc' | 'manual';
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

// For imports since they're referenced
interface Collection {
  id: ID;
  name: string;
  slug: string;
  description?: string;
  type: 'manual' | 'automatic' | 'seasonal' | 'promotional';
  image?: ImageAsset;
  bannerImage?: ImageAsset;
  seo: SEOData;
  status: Status;
  isVisible: boolean;
  isFeatured: boolean;
  rules?: CollectionRule[];
  productIds?: ID[];
  startDate?: Timestamp;
  endDate?: Timestamp;
  productCount: number;
  sortOrder: number;
  productSortOrder: 'created_desc' | 'created_asc' | 'price_desc' | 'price_asc' | 'name_asc' | 'name_desc' | 'manual';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface CollectionRule {
  field: 'title' | 'price' | 'weight' | 'tag' | 'category' | 'brand' | 'inventory';
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than';
  value: string | number;
}

interface Product {
  id: ID;
  name: string;
  // Add other necessary product fields as needed
}

interface VideoAsset {
  id: ID;
  url: string;
  title?: string;
}
