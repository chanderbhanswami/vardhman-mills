import { 
  ID, 
  Timestamp, 
  BaseEntity, 
  ImageAsset, 
  VideoAsset, 
  MediaGallery, 
  Price, 
  PriceRange, 
  SEOData, 
  Status, 
  StockInfo, 
  Rating,
  SortOrder,
  PaginatedResponse
} from './common.types';

// Re-export commonly used types
export type { ImageAsset, VideoAsset, MediaGallery, Price, ID, Timestamp, BaseEntity };

// Product Types
export interface Product extends BaseEntity {
  // Basic Information
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription?: string;
  
  // Categorization
  categoryId: ID;
  category: Category;
  subcategoryId?: ID;
  subcategory?: Category;
  brandId?: ID;
  brand?: Brand | string;
  collectionIds: ID[];
  collections: Collection[];
  
  // Pricing (supports both backend and frontend structures)
  price?: number; // Convenience property for quick price access (backend)
  pricing?: ProductPricing; // Frontend pricing structure
  
  // Variants (supports both structures)
  variants: ProductVariant[] | BackendProductVariant[];
  
  // Media
  media?: MediaGallery;
  image?: string; // Convenience property for quick image access
  images?: string[]; // Convenience property for image array
  
  // Product Details
  specifications?: ProductSpecification[] | Map<string, string>;
  features?: string[];
  materials?: Material[];
  colors?: ProductColor[];
  sizes?: ProductSize[];
  dimensions?: ProductDimensions;
  weight?: ProductWeight;
  
  // Inventory
  inventory?: StockInfo;
  stock?: number; // Convenience property for quick stock check
  
  // Marketing
  tags?: string[];
  keywords?: string[];
  seo?: SEOData;
  
  // Status and Visibility
  status?: Status;
  isPublished?: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestseller?: boolean;
  isOnSale?: boolean;
  isActive?: boolean; // Backend field
  
  // Dates
  launchDate?: Timestamp;
  publishedAt?: Timestamp;
  discontinuedAt?: Timestamp;
  
  // Reviews and Ratings
  rating?: Rating;
  reviewCount?: number;
  averageRating?: number; // Backend field
  totalReviews?: number; // Backend field
  
  // Additional Info
  careInstructions?: string[];
  warranty?: ProductWarranty;
  certifications?: ProductCertification[];
  
  // Variants (for products with multiple options)
  variantOptions?: VariantOption[];
  
  // Related Products
  relatedProductIds?: ID[];
  crossSellProductIds?: ID[];
  upsellProductIds?: ID[];
  
  // Admin Fields
  createdBy?: ID;
  updatedBy?: ID;
  adminNotes?: string;
}

// Backend Product Variant (from MongoDB)
export interface BackendProductVariant {
  _id?: string;
  size?: string;
  color?: string;
  material?: string;
  sku: string;
  price: number;
  comparePrice?: number;
  stock: number;
  images: string[];
  isActive: boolean;
}

export interface ProductVariant extends BaseEntity {
  productId: ID;
  name: string;
  sku: string;
  
  // Variant Options (e.g., color: red, size: large)
  options: VariantOptionValue[];
  
  // Convenience properties for common options
  color?: string;
  size?: string;
  material?: string;
  
  // Pricing (can override product pricing)
  pricing?: ProductPricing;
  
  // Media (can override product media)
  media?: MediaGallery;
  
  // Inventory
  inventory: StockInfo;
  
  // Status
  status: Status;
  isDefault: boolean;
  
  // Physical Properties
  dimensions?: ProductDimensions;
  weight?: ProductWeight;
  
  // Barcode/EAN
  barcode?: string;
  ean?: string;
}

export interface VariantOption {
  id: ID;
  name: string; // e.g., "Color", "Size"
  displayName: string;
  type: 'color' | 'size' | 'material' | 'pattern' | 'style' | 'text';
  values: VariantOptionValue[];
  isRequired: boolean;
  sortOrder: number;
}

export interface VariantOptionValue {
  id: ID;
  optionId: ID;
  value: string;
  displayValue: string;
  hexColor?: string; // for color options
  image?: ImageAsset; // for visual options
  sortOrder: number;
  isAvailable: boolean;
}

export interface ProductPricing {
  basePrice: Price;
  salePrice?: Price;
  compareAtPrice?: Price; // MSRP or original price
  costPrice?: Price; // for margin calculation
  
  // Bulk Pricing
  bulkPricing?: BulkPricingTier[];
  
  // Dynamic Pricing
  isDynamicPricing: boolean;
  priceRules?: PriceRule[];
  
  // Tax
  taxable: boolean;
  taxClassId?: ID;
  
  // Currency specific pricing
  currencyPrices?: CurrencyPrice[];
}

export interface BulkPricingTier {
  minQuantity: number;
  maxQuantity?: number;
  price: Price;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
}

export interface PriceRule {
  id: ID;
  name: string;
  type: 'customer_group' | 'quantity' | 'date_range' | 'geographic';
  conditions: PriceRuleCondition[];
  action: PriceRuleAction;
  priority: number;
  isActive: boolean;
}

export interface PriceRuleCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: string | number | string[];
}

export interface PriceRuleAction {
  type: 'fixed_discount' | 'percentage_discount' | 'fixed_price';
  value: number;
}

export interface CurrencyPrice {
  currency: string;
  price: number;
  salePrice?: number;
  compareAtPrice?: number;
}

export interface ProductSpecification {
  id: ID;
  name: string;
  value: string;
  unit?: string;
  group?: string;
  isHighlight: boolean;
  sortOrder: number;
}

export interface Material {
  id: ID;
  name: string;
  description?: string;
  percentage?: number;
  isSustainable?: boolean;
  careInstructions?: string[];
}

export interface ProductColor {
  id: ID;
  name: string;
  hexCode: string;
  image?: ImageAsset;
  isAvailable: boolean;
  sortOrder: number;
}

export interface ProductSize {
  id: ID;
  name: string;
  value: string;
  unit?: string;
  isAvailable: boolean;
  sortOrder: number;
  dimensions?: ProductDimensions;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'inch' | 'm' | 'ft';
}

export interface ProductWeight {
  value: number;
  unit: 'kg' | 'lb' | 'g' | 'oz';
}

export interface ProductWarranty {
  duration: number;
  unit: 'days' | 'months' | 'years';
  type: 'manufacturer' | 'seller' | 'extended';
  description: string;
  coverage: string[];
  terms?: string;
}

export interface ProductCertification {
  id: ID;
  name: string;
  certifyingBody: string;
  certificateNumber?: string;
  issuedDate?: Timestamp;
  expiryDate?: Timestamp;
  verificationUrl?: string;
  logo?: ImageAsset;
}

// Category Types
export interface Category extends BaseEntity {
  [key: string]: unknown; // Index signature for flexible category data
  name: string;
  slug: string;
  description?: string;
  parentId?: ID;
  parent?: Category;
  children: Category[];
  level: number;
  path: string; // breadcrumb path
  
  // Display
  image?: ImageAsset;
  icon?: string;
  bannerImage?: ImageAsset;
  
  // SEO
  seo: SEOData;
  
  // Status
  status: Status;
  isVisible: boolean;
  isFeatured: boolean;
  
  // Additional Status Flags
  isHot?: boolean;
  isNew?: boolean;
  
  // Product Count
  productCount: number;
  activeProductCount: number;
  
  // Stats
  viewCount?: number;
  
  // Tags for filtering
  tags?: string[];
  
  // Sort Order
  sortOrder: number;
  
  // Attributes (for filtering)
  attributeGroups: CategoryAttributeGroup[];
  
  // Admin
  createdBy: ID;
  updatedBy: ID;
}

export interface CategoryAttributeGroup {
  [key: string]: unknown; // Index signature for flexible attribute data
  id: ID;
  name: string;
  attributes: CategoryAttribute[];
  isFilterable: boolean;
  isSortable: boolean;
  displayType: 'list' | 'grid' | 'dropdown' | 'range';
  sortOrder: number;
}

export interface CategoryAttribute {
  id: ID;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'range';
  unit?: string;
  options?: string[];
  isRequired: boolean;
  isFilterable: boolean;
  isSortable: boolean;
  sortOrder: number;
}

// Brand Types
export interface Brand extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  
  // Media
  logo?: ImageAsset;
  bannerImage?: ImageAsset;
  brandGallery?: ImageAsset[];
  
  // Brand Information
  foundedYear?: number;
  headquarters?: string;
  website?: string;
  email?: string;
  phone?: string;
  
  // Additional Brand Properties
  awards?: number;
  rating?: number;
  origin?: string;
  isVerified?: boolean;
  
  // Social Media
  socialLinks: SocialLink[];
  
  // SEO
  seo: SEOData;
  
  // Status
  status: Status;
  isVisible: boolean;
  isFeatured: boolean;
  
  // Stats
  productCount: number;
  followersCount?: number;
  
  // Story and Values
  brandStory?: string;
  values?: string[];
  achievements?: string[];
  
  // Sort Order
  sortOrder: number;
}

export interface SocialLink {
  platform: 'facebook' | 'instagram' | 'twitter' | 'youtube' | 'linkedin' | 'pinterest';
  url: string;
  isActive: boolean;
}

// Collection Types
export interface Collection extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  type: 'manual' | 'automatic' | 'seasonal' | 'promotional';
  
  // Display
  image?: ImageAsset;
  bannerImage?: ImageAsset;
  
  // Tags for filtering and categorization
  tags?: string[];
  
  // SEO
  seo: SEOData;
  
  // Status and Visibility
  status: Status;
  isVisible: boolean;
  isFeatured: boolean;
  
  // Automatic Collection Rules (if type is automatic)
  rules?: CollectionRule[];
  
  // Manual Product Selection (if type is manual)
  productIds?: ID[];
  
  // Dates
  startDate?: Timestamp;
  endDate?: Timestamp;
  
  // Stats
  productCount: number;
  
  // Sort Order
  sortOrder: number;
  productSortOrder: 'created_desc' | 'created_asc' | 'price_desc' | 'price_asc' | 'name_asc' | 'name_desc' | 'manual';
}

export interface CollectionRule {
  field: 'title' | 'price' | 'weight' | 'tag' | 'category' | 'brand' | 'inventory';
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than';
  value: string | number;
}

// Search and Filtering
export interface ProductFilters {
  query?: string;
  categoryIds?: ID[];
  brandIds?: ID[];
  collectionIds?: ID[];
  priceRange?: PriceRange;
  colors?: string[];
  sizes?: string[];
  materials?: string[];
  ratings?: number[];
  availability?: 'in_stock' | 'out_of_stock' | 'all';
  tags?: string[];
  features?: string[];
  isOnSale?: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestseller?: boolean;
  sortBy?: ProductSortOption;
  page?: number;
  limit?: number;
}

export type ProductSortOption = 
  | 'relevance'
  | 'name_asc'
  | 'name_desc'
  | 'price_asc'
  | 'price_desc'
  | 'rating_desc'
  | 'review_count_desc'
  | 'created_desc'
  | 'created_asc'
  | 'updated_desc'
  | 'popularity'
  | 'bestselling';

export interface ProductSearchResult {
  products: PaginatedResponse<Product>;
  filters: ProductFilterGroup[];
  suggestions?: string[];
  relatedSearches?: string[];
  totalFound: number;
  searchTime: number;
}

export interface ProductFilterGroup {
  id: string;
  name: string;
  type: 'checkbox' | 'radio' | 'range' | 'color' | 'size';
  options: ProductFilterOption[];
  isCollapsed: boolean;
}

export interface ProductFilterOption {
  id: string;
  label: string;
  value: string | number;
  count: number;
  isSelected: boolean;
  color?: string; // for color filters
  image?: ImageAsset; // for visual filters
}

// Product Recommendations
export interface ProductRecommendation {
  type: 'related' | 'frequently_bought_together' | 'recently_viewed' | 'similar' | 'trending' | 'personalized';
  products: Product[];
  confidence: number;
  reason?: string;
}

// Product Comparison
export interface ProductComparison {
  products: Product[];
  attributes: ComparisonAttribute[];
}

export interface ComparisonAttribute {
  name: string;
  values: (string | number | boolean)[];
  type: 'text' | 'number' | 'boolean' | 'rating';
  unit?: string;
  isHighlight: boolean;
}

// Product Export/Import
export interface ProductExport {
  format: 'csv' | 'xlsx' | 'json' | 'xml';
  includeVariants: boolean;
  includeImages: boolean;
  includeInventory: boolean;
  includePricing: boolean;
  includeCategories: boolean;
  filters?: ProductFilters;
}

export interface ProductImport {
  file: File;
  format: 'csv' | 'xlsx' | 'json' | 'xml';
  mappings: ImportFieldMapping[];
  options: ImportOptions;
}

export interface ImportFieldMapping {
  sourceField: string;
  targetField: string;
  transform?: string;
  defaultValue?: string;
}

export interface ImportOptions {
  updateExisting: boolean;
  createNewCategories: boolean;
  createNewBrands: boolean;
  skipInvalidRows: boolean;
  validateInventory: boolean;
  publishAfterImport: boolean;
}

// Product Analytics
export interface ProductAnalytics {
  productId: ID;
  views: number;
  addToCartCount: number;
  purchaseCount: number;
  conversionRate: number;
  revenue: number;
  averageOrderValue: number;
  returnRate: number;
  period: 'day' | 'week' | 'month' | 'year';
  timestamp: Timestamp;
}

export interface CategoryAnalytics {
  categoryId: ID;
  views: number;
  products: number;
  revenue: number;
  topProducts: Array<{
    productId: ID;
    name: string;
    revenue: number;
  }>;
  period: 'day' | 'week' | 'month' | 'year';
  timestamp: Timestamp;
}

// Inventory Management
export interface InventoryAlert {
  id: ID;
  productId: ID;
  variantId?: ID;
  type: 'low_stock' | 'out_of_stock' | 'overstock' | 'negative_stock';
  threshold: number;
  currentQuantity: number;
  isActive: boolean;
  createdAt: Timestamp;
  resolvedAt?: Timestamp;
}

export interface StockMovement {
  id: ID;
  productId: ID;
  variantId?: ID;
  type: 'sale' | 'purchase' | 'adjustment' | 'return' | 'damaged' | 'transfer';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason?: string;
  reference?: string; // order ID, purchase order, etc.
  createdBy: ID;
  createdAt: Timestamp;
}

// Product Attributes (for Home Furnishing specific attributes)
export interface FurnishingAttributes {
  roomType?: ('living_room' | 'bedroom' | 'dining_room' | 'kitchen' | 'bathroom' | 'office' | 'outdoor')[];
  style?: 'modern' | 'traditional' | 'contemporary' | 'rustic' | 'industrial' | 'scandinavian' | 'bohemian' | 'minimalist';
  assemblyRequired?: boolean;
  assemblyTime?: number; // minutes
  careInstructions?: string[];
  seasonality?: 'spring' | 'summer' | 'autumn' | 'winter' | 'all_season';
  targetAudience?: 'men' | 'women' | 'kids' | 'unisex';
  occasion?: string[];
  pattern?: 'solid' | 'striped' | 'floral' | 'geometric' | 'abstract' | 'paisley' | 'checked';
  texture?: 'smooth' | 'rough' | 'soft' | 'hard' | 'glossy' | 'matte';
}

// ===== TYPE USAGE TO AVOID WARNINGS =====
export interface ProductTypeUsage {
  videoAsset: VideoAsset;
  sortOrder: SortOrder;
}
