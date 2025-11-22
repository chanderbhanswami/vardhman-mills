/**
 * Product Constants - Vardhman Mills Frontend
 * Contains product-related configuration and constants
 */

// Product Categories
export const PRODUCT_CATEGORIES = {
  COTTON: {
    id: 'cotton',
    name: 'Cotton',
    description: 'Premium cotton fabrics',
    subcategories: ['organic-cotton', 'combed-cotton', 'ring-spun-cotton'],
  },
  POLYESTER: {
    id: 'polyester',
    name: 'Polyester',
    description: 'High-quality polyester fabrics',
    subcategories: ['recycled-polyester', 'micro-polyester', 'textured-polyester'],
  },
  BLENDS: {
    id: 'blends',
    name: 'Blends',
    description: 'Cotton-polyester and other blends',
    subcategories: ['cotton-poly', 'cotton-modal', 'tri-blend'],
  },
  WOOL: {
    id: 'wool',
    name: 'Wool',
    description: 'Natural wool fabrics',
    subcategories: ['merino-wool', 'cashmere', 'alpaca'],
  },
  SILK: {
    id: 'silk',
    name: 'Silk',
    description: 'Luxury silk fabrics',
    subcategories: ['mulberry-silk', 'tussar-silk', 'art-silk'],
  },
} as const;

// Product Status
export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DRAFT: 'draft',
  OUT_OF_STOCK: 'out_of_stock',
  DISCONTINUED: 'discontinued',
  COMING_SOON: 'coming_soon',
} as const;

// Stock Status
export const STOCK_STATUS = {
  IN_STOCK: 'in_stock',
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock',
  PRE_ORDER: 'pre_order',
  BACKORDER: 'backorder',
} as const;

// Product Types
export const PRODUCT_TYPES = {
  SIMPLE: 'simple',
  VARIABLE: 'variable',
  GROUPED: 'grouped',
  EXTERNAL: 'external',
  DIGITAL: 'digital',
} as const;

// Fabric Weights (GSM)
export const FABRIC_WEIGHTS = {
  LIGHT: { min: 120, max: 160, label: 'Light Weight (120-160 GSM)' },
  MEDIUM: { min: 160, max: 200, label: 'Medium Weight (160-200 GSM)' },
  HEAVY: { min: 200, max: 250, label: 'Heavy Weight (200-250 GSM)' },
  EXTRA_HEAVY: { min: 250, max: 350, label: 'Extra Heavy (250-350+ GSM)' },
} as const;

// Colors
export const PRODUCT_COLORS = {
  WHITE: { name: 'White', hex: '#FFFFFF', code: 'WHT' },
  BLACK: { name: 'Black', hex: '#000000', code: 'BLK' },
  RED: { name: 'Red', hex: '#FF0000', code: 'RED' },
  BLUE: { name: 'Blue', hex: '#0000FF', code: 'BLU' },
  GREEN: { name: 'Green', hex: '#008000', code: 'GRN' },
  YELLOW: { name: 'Yellow', hex: '#FFFF00', code: 'YEL' },
  ORANGE: { name: 'Orange', hex: '#FFA500', code: 'ORG' },
  PURPLE: { name: 'Purple', hex: '#800080', code: 'PUR' },
  PINK: { name: 'Pink', hex: '#FFC0CB', code: 'PNK' },
  BROWN: { name: 'Brown', hex: '#A52A2A', code: 'BRN' },
  GRAY: { name: 'Gray', hex: '#808080', code: 'GRY' },
  NAVY: { name: 'Navy', hex: '#000080', code: 'NVY' },
} as const;

// Sizes
export const PRODUCT_SIZES = {
  XS: { name: 'Extra Small', order: 1 },
  S: { name: 'Small', order: 2 },
  M: { name: 'Medium', order: 3 },
  L: { name: 'Large', order: 4 },
  XL: { name: 'Extra Large', order: 5 },
  XXL: { name: '2X Large', order: 6 },
  XXXL: { name: '3X Large', order: 7 },
} as const;

// Product Filters
export const PRODUCT_FILTERS = {
  PRICE_RANGES: [
    { min: 0, max: 500, label: '₹0 - ₹500' },
    { min: 500, max: 1000, label: '₹500 - ₹1,000' },
    { min: 1000, max: 2000, label: '₹1,000 - ₹2,000' },
    { min: 2000, max: 5000, label: '₹2,000 - ₹5,000' },
    { min: 5000, max: null, label: '₹5,000+' },
  ],
  SORT_OPTIONS: [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_low_high', label: 'Price: Low to High' },
    { value: 'price_high_low', label: 'Price: High to Low' },
    { value: 'popularity', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'name_a_z', label: 'Name: A to Z' },
    { value: 'name_z_a', label: 'Name: Z to A' },
  ],
} as const;

// Product Attributes
export const PRODUCT_ATTRIBUTES = {
  MATERIAL: 'material',
  WEIGHT: 'weight',
  COLOR: 'color',
  SIZE: 'size',
  PATTERN: 'pattern',
  TEXTURE: 'texture',
  FINISH: 'finish',
  CARE_INSTRUCTIONS: 'care_instructions',
  ORIGIN: 'origin',
  CERTIFICATION: 'certification',
} as const;

// Quality Certifications
export const QUALITY_CERTIFICATIONS = {
  OEKO_TEX: 'OEKO-TEX Standard 100',
  GOTS: 'Global Organic Textile Standard',
  BCI: 'Better Cotton Initiative',
  CRADLE_TO_CRADLE: 'Cradle to Cradle Certified',
  ISO_9001: 'ISO 9001:2015',
  ISO_14001: 'ISO 14001:2015',
} as const;

// Product Limits
export const PRODUCT_LIMITS = {
  MAX_IMAGES: 10,
  MAX_VARIANTS: 50,
  MAX_TAGS: 20,
  MAX_DESCRIPTION_LENGTH: 5000,
  MIN_PRICE: 1,
  MAX_PRICE: 100000,
  LOW_STOCK_THRESHOLD: 10,
} as const;

// Image Configuration
export const IMAGE_CONFIG = {
  ALLOWED_FORMATS: ['jpg', 'jpeg', 'png', 'webp'],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  DIMENSIONS: {
    THUMBNAIL: { width: 150, height: 150 },
    SMALL: { width: 300, height: 300 },
    MEDIUM: { width: 600, height: 600 },
    LARGE: { width: 1200, height: 1200 },
  },
  QUALITY: 85,
} as const;

// Review Configuration
export const REVIEW_CONFIG = {
  MIN_RATING: 1,
  MAX_RATING: 5,
  MAX_REVIEW_LENGTH: 1000,
  MIN_REVIEW_LENGTH: 10,
  REQUIRE_PURCHASE: true,
  ALLOW_IMAGES: true,
  MAX_REVIEW_IMAGES: 5,
} as const;

// Wishlist Configuration
export const WISHLIST_CONFIG = {
  MAX_ITEMS: 100,
  NOTIFICATION_ON_PRICE_DROP: true,
  NOTIFICATION_ON_STOCK: true,
  SHARE_ENABLED: true,
} as const;

// Compare Configuration
export const COMPARE_CONFIG = {
  MAX_ITEMS: 4,
  ATTRIBUTES_TO_COMPARE: [
    'material',
    'weight',
    'price',
    'rating',
    'availability',
    'colors',
    'sizes',
  ],
} as const;

// Recently Viewed
export const RECENTLY_VIEWED_CONFIG = {
  MAX_ITEMS: 20,
  EXPIRE_DAYS: 30,
  SHOW_ON_PRODUCT_PAGE: true,
  SHOW_ON_HOMEPAGE: true,
} as const;

// Related Products
export const RELATED_PRODUCTS_CONFIG = {
  MAX_ITEMS: 8,
  ALGORITHM: 'collaborative_filtering', // or 'content_based'
  INCLUDE_CROSS_CATEGORY: false,
} as const;

export type ProductStatus = typeof PRODUCT_STATUS;
export type StockStatus = typeof STOCK_STATUS;
export type ProductTypes = typeof PRODUCT_TYPES;
export type ProductAttributes = typeof PRODUCT_ATTRIBUTES;