// Core API Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface SearchParams extends PaginationParams {
  q?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  tags?: string[];
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  role: 'customer' | 'admin' | 'moderator';
  isVerified: boolean;
  preferences: UserPreferences;
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  language: string;
  currency: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isDefault: boolean;
  type: 'home' | 'work' | 'other';
}

// Auth Types
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  acceptTerms: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  sku: string;
  stock: number;
  images: ProductImage[];
  category: Category;
  brand: Brand;
  tags: string[];
  attributes: ProductAttribute[];
  variants: ProductVariant[];
  reviews: Review[];
  rating: {
    average: number;
    count: number;
  };
  seo: SEOData;
  status: 'active' | 'inactive' | 'draft';
  featured: boolean;
  isNew: boolean;
  isBestseller: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export interface ProductAttribute {
  name: string;
  value: string;
  group?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
  images: ProductImage[];
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  parent?: Category;
  children: Category[];
  products?: Product[];
  level: number;
  isActive: boolean;
  seo: SEOData;
  createdAt: string;
  updatedAt: string;
}

// Brand Types
export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  products?: Product[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Review Types
export interface Review {
  id: string;
  userId: string;
  user: {
    name: string;
    avatar?: string;
  };
  productId: string;
  rating: number;
  title: string;
  comment: string;
  images?: ReviewImage[];
  helpful: number;
  replies: ReviewReply[];
  isVerified: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface ReviewImage {
  id: string;
  url: string;
  alt?: string;
}

export interface ReviewReply {
  id: string;
  userId: string;
  user: {
    name: string;
    avatar?: string;
    role: string;
  };
  comment: string;
  createdAt: string;
}

export interface ReviewFormData {
  productId: string;
  rating: number;
  title: string;
  comment: string;
  images?: File[];
}

export interface ReviewMedia {
  id: string;
  reviewId: string;
  url: string;
  type: 'image' | 'video';
  alt?: string;
  order: number;
}

// Cart Types
export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  variantId?: string;
  variant?: ProductVariant;
  quantity: number;
  price: number;
  originalPrice?: number;
  discountAmount?: number;
  total: number;
  customizations?: Record<string, unknown>;
  addedAt: string;
  updatedAt: string;
  notes?: string;
  isGift?: boolean;
  giftMessage?: string;
  estimatedDelivery?: string;
  availability: {
    inStock: boolean;
    quantity: number;
    backorderDate?: string;
  };
}

export interface Cart {
  id: string;
  userId?: string;
  guestId?: string;
  sessionId?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  taxRate?: number;
  shipping: number;
  shippingMethod?: string;
  discount: number;
  total: number;
  currency: string;
  status: 'active' | 'abandoned' | 'merged' | 'converted';
  
  // Coupon Information
  coupons: Array<{
    id: string;
    code: string;
    discountAmount: number;
    discountType: 'percentage' | 'fixed';
    appliedAt: string;
  }>;
  
  // Shipping Information
  shippingAddress?: {
    id?: string;
    name: string;
    email?: string;
    phone?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  
  // Billing Information
  billingAddress?: {
    id?: string;
    name: string;
    email?: string;
    phone?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  
  // Cart Metadata
  metadata: {
    source?: 'web' | 'mobile' | 'api';
    device?: string;
    browser?: string;
    referrer?: string;
    utm?: {
      source?: string;
      medium?: string;
      campaign?: string;
      term?: string;
      content?: string;
    };
  };
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastActivity: string;
  abandonedAt?: string;
  recoveredAt?: string;
  
  // Totals Breakdown
  totals: {
    itemCount: number;
    uniqueItemCount: number;
    weight: number;
    originalSubtotal: number;
    subtotalAfterDiscounts: number;
    taxableAmount: number;
    shippingCost: number;
    totalDiscount: number;
    finalTotal: number;
  };
  
  // Validation Status
  validation?: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    lastValidated: string;
  };
  
  // Saved Cart Information
  savedCart?: {
    id: string;
    name: string;
    savedAt: string;
  };
  
  // Share Information
  shareInfo?: {
    shareId: string;
    shareUrl: string;
    sharedAt: string;
    expiresAt?: string;
    accessCount: number;
  };
}

// Order Types
export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user: User;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  paymentId?: string;
  couponCode?: string;
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  variantId?: string;
  variant?: ProductVariant;
  quantity: number;
  price: number;
  total: number;
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'refunded';

export type PaymentStatus = 
  | 'pending' 
  | 'completed' 
  | 'failed' 
  | 'refunded' 
  | 'cancelled';

export interface CheckoutFormData {
  shippingAddress: Omit<Address, 'id'>;
  billingAddress: Omit<Address, 'id'>;
  paymentMethod: string;
  notes?: string;
  couponCode?: string;
}

// Payment Types
export interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'upi' | 'wallet' | 'cod' | 'emi';
  icon: string;
  isActive: boolean;
  processingFee?: number;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

// Wishlist Types
export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  createdAt: string;
}

export interface Wishlist {
  id: string;
  userId: string;
  items: WishlistItem[];
  createdAt: string;
  updatedAt: string;
}

// Blog Types
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    bio?: string;
  };
  categories: BlogCategory[];
  tags: string[];
  seo: SEOData;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  color?: string;
  parentId?: string;
  posts?: BlogPost[];
  postCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Blog type alias for consistency
export type Blog = BlogPost;

// Blog Tag interface
export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  postCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Author interface
export interface Author {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    facebook?: string;
  };
  postCount?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Comment interface
export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  blogId: string;
  parentId?: string;
  replies?: Comment[];
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  isEdited: boolean;
  likes: number;
  createdAt: string;
  updatedAt: string;
}



// FAQ Types
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Contact Types
export interface ContactForm {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  category?: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  category?: string;
  status: 'new' | 'replied' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
}

// Newsletter Types
export interface NewsletterSubscription {
  email: string;
  name?: string;
  preferences?: string[];
}

export interface Newsletter {
  id: string;
  email: string;
  name?: string;
  isActive: boolean;
  preferences: string[];
  subscribedAt: string;
  unsubscribedAt?: string;
}

// Coupon Types
export interface Coupon {
  id: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed' | 'free_shipping' | 'buy_one_get_one';
  value: number;
  minAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  perUserLimit?: number;
  isActive: boolean;
  validFrom: string;
  validUntil: string;
  applicableProducts?: string[];
  applicableCategories?: string[];
  excludeProducts?: string[];
  excludeCategories?: string[];
  firstTimeOnly: boolean;
  stackable: boolean;
  autoApply: boolean;
  priority: number;
  usage: CouponUsage[];
  analytics: CouponAnalytics;
  campaignId?: string;
  targetAudience?: string[];
  conditions?: CouponCondition[];
  rewards?: CouponReward[];
  metadata: Record<string, unknown>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CouponUsage {
  id: string;
  couponId: string;
  userId: string;
  orderId: string;
  discountAmount: number;
  usedAt: string;
}

export interface CouponAnalytics {
  totalUses: number;
  uniqueUsers: number;
  totalDiscount: number;
  conversionRate: number;
  averageOrderValue: number;
  revenueImpact: number;
  usageByMonth: Array<{
    month: string;
    uses: number;
    discount: number;
    revenue: number;
  }>;
}

export interface CouponCondition {
  type: 'min_amount' | 'max_amount' | 'product_quantity' | 'user_segment' | 'day_of_week' | 'time_range';
  operator: 'equals' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'between';
  value: string | number | boolean | string[] | number[];
  field?: string;
}

export interface CouponReward {
  type: 'discount' | 'free_product' | 'free_shipping' | 'points';
  value: number;
  productId?: string;
  maxQuantity?: number;
}

export interface CouponTemplate {
  id: string;
  name: string;
  description: string;
  config: Partial<Coupon>;
  category: string;
  tags: string[];
  isPublic: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CouponCampaign {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  type: 'promotional' | 'seasonal' | 'loyalty' | 'acquisition' | 'retention';
  startDate: string;
  endDate: string;
  targetAudience: string[];
  coupons: string[];
  budget?: number;
  spent: number;
  goals: CampaignGoal[];
  performance: CampaignPerformance;
  settings: CampaignSettings;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignGoal {
  type: 'revenue' | 'usage' | 'new_customers' | 'retention';
  target: number;
  achieved: number;
  unit: string;
}

export interface CampaignPerformance {
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  cost: number;
  roi: number;
  ctr: number;
  conversionRate: number;
}

export interface CampaignSettings {
  autoOptimize: boolean;
  budgetAlert: boolean;
  budgetAlertThreshold: number;
  notifications: string[];
  trackingPixels: string[];
  customFields: Record<string, unknown>;
}

export interface CouponABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'completed' | 'cancelled';
  variants: CouponABTestVariant[];
  traffic: number;
  startDate: string;
  endDate: string;
  metrics: string[];
  results?: CouponABTestResults;
  settings: ABTestSettings;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CouponABTestVariant {
  id: string;
  name: string;
  couponId: string;
  trafficPercentage: number;
  isControl: boolean;
  performance: ABTestVariantPerformance;
}

export interface CouponABTestResults {
  winner?: string;
  confidence: number;
  uplift: number;
  significance: number;
  summary: string;
  recommendations: string[];
}

export interface ABTestVariantPerformance {
  impressions: number;
  uses: number;
  revenue: number;
  conversionRate: number;
  revenuePerUser: number;
}

export interface ABTestSettings {
  trafficSplit: 'equal' | 'weighted' | 'auto';
  minSampleSize: number;
  confidenceLevel: number;
  autoStop: boolean;
  autoStopThreshold: number;
}

// Gift Card Types
export interface GiftCard {
  id: string;
  code: string;
  amount: number;
  balance: number;
  recipientEmail?: string;
  recipientName?: string;
  senderName?: string;
  message?: string;
  status: 'active' | 'redeemed' | 'expired' | 'cancelled';
  validUntil: string;
  createdAt: string;
  updatedAt: string;
}

// Media Types
export interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  alt?: string;
  title?: string;
  description?: string;
  folder?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UploadResponse {
  id: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
}

// SEO Types
export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
}

// Analytics Types
export interface AnalyticsEvent {
  event: string;
  properties: Record<string, string | number | boolean>;
  userId?: string;
  sessionId?: string;
  timestamp: string;
}

// Site Configuration Types
export interface SiteConfig {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  logo: string;
  favicon: string;
  contactEmail: string;
  contactPhone: string;
  socialLinks: SocialLink[];
  seo: SEOData;
  features: {
    wishlist: boolean;
    reviews: boolean;
    coupons: boolean;
    giftCards: boolean;
    multiCurrency: boolean;
    multiLanguage: boolean;
  };
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  isActive: boolean;
  order: number;
}

// Header/Footer Configuration
export interface HeaderLogo {
  id: string;
  url: string;
  alt: string;
  width?: number;
  height?: number;
  link?: string;
}

export interface FooterLogo {
  id: string;
  url: string;
  alt: string;
  width?: number;
  height?: number;
  link?: string;
  position: 'left' | 'center' | 'right';
}

// Hero Section Types
export interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  mobileImage?: string;
  link?: string;
  buttonText?: string;
  position: 'left' | 'center' | 'right';
  overlay: boolean;
  isActive: boolean;
  order: number;
}

export interface Hero {
  id: string;
  slides: HeroSlide[];
  autoplay: boolean;
  autoplayDelay: number;
  showDots: boolean;
  showArrows: boolean;
  isActive: boolean;
}

// Announcement Types
export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'promotion';
  link?: string;
  buttonText?: string;
  isActive: boolean;
  showOnPages: string[];
  startDate?: string;
  endDate?: string;
  priority: number;
  dismissible: boolean;
  createdAt: string;
  updatedAt: string;
}

// About Page Types
export interface AboutSection {
  id: string;
  title: string;
  content: string;
  image?: string;
  order: number;
  isActive: boolean;
}

export interface About {
  id: string;
  title: string;
  subtitle?: string;
  sections: AboutSection[];
  seo: SEOData;
  updatedAt: string;
}

// Featured Content Types
export interface FeaturedProduct {
  id: string;
  productId: string;
  product: Product;
  order: number;
  isActive: boolean;
}

export interface FeaturedSection {
  id: string;
  title: string;
  subtitle?: string;
  type: 'products' | 'categories' | 'brands';
  items: (Product | Category | Brand)[];
  layout: 'grid' | 'carousel' | 'list';
  maxItems: number;
  isActive: boolean;
  order: number;
}

// Collection Types
export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  products: Product[];
  isActive: boolean;
  isFeatured: boolean;
  seo: SEOData;
  createdAt: string;
  updatedAt: string;
}

// Sale/Deal Types
export interface Deal {
  id: string;
  title: string;
  description?: string;
  type: 'percentage' | 'fixed' | 'bogo';
  value: number;
  products: Product[];
  categories: Category[];
  isActive: boolean;
  startDate: string;
  endDate: string;
  maxUses?: number;
  usedCount: number;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  name: string;
  description?: string;
  image?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  products: Product[];
  categories: Category[];
  isActive: boolean;
  startDate: string;
  endDate: string;
  seo: SEOData;
  createdAt: string;
  updatedAt: string;
}

// Error Types
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

// Upload Types
export interface FileUpload {
  file: File;
  folder?: string;
  alt?: string;
  title?: string;
  description?: string;
}

// Filters and Sorting
export interface ProductFilters {
  categories?: string[];
  brands?: string[];
  priceRange?: [number, number];
  rating?: number;
  inStock?: boolean;
  onSale?: boolean;
  isNew?: boolean;
  attributes?: Record<string, string[]>;
}

export interface SortOption {
  value: string;
  label: string;
  field: string;
  order: 'asc' | 'desc';
}

// New Arrival Types
export interface NewArrival {
  id: string;
  productId: string;
  product: Product;
  order: number;
  isActive: boolean;
  addedAt: string;
}

// Bestseller Types
export interface Bestseller {
  id: string;
  productId: string;
  product?: Product;
  order: number;
  isActive: boolean;
  salesCount: number;
  period: 'week' | 'month' | 'quarter' | 'year';
  rank?: number;
  revenue?: number;
  growth?: number;
  createdAt: string;
  updatedAt: string;
}

// Favorite Section Types
export interface FavoriteSection {
  id: string;
  name: string;
  type: 'products' | 'categories' | 'brands';
  items: (Product | Category | Brand)[];
  order: number;
  isActive: boolean;
}
