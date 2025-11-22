// Base utility types and shared interfaces

export type ID = string;

export type Timestamp = string | Date;

export type Status = 'active' | 'inactive' | 'pending' | 'suspended' | 'deleted';

export type SortOrder = 'asc' | 'desc';

export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';

export type Language = 'en' | 'hi';

export type Theme = 'light' | 'dark' | 'system';

// Image and Media Types
export interface ImageAsset {
  id: ID;
  url: string;
  alt: string;
  title?: string;
  width?: number;
  height?: number;
  format?: 'jpg' | 'jpeg' | 'png' | 'webp' | 'avif' | 'svg';
  size?: number; // in bytes
  cloudinaryId?: string;
  blurDataURL?: string;
  priority?: boolean;
}

export interface VideoAsset {
  id: ID;
  url: string;
  title?: string;
  thumbnail?: ImageAsset;
  duration?: number; // in seconds
  format?: 'mp4' | 'webm' | 'ogg';
  size?: number; // in bytes
  cloudinaryId?: string;
}

export interface MediaGallery {
  images: ImageAsset[];
  videos?: VideoAsset[];
  primaryImage?: ImageAsset;
}

// Location and Address Types
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  id: ID;
  type: 'home' | 'work' | 'office' | 'other';
  label?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  address: string;
  addressLine1?: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  postalCode?: string;
  country: string;
  landmark?: string;
  phone?: string;
  email?: string;
  coordinates?: Coordinates;
  isDefault: boolean;
  isValidated?: boolean;
  isServiceable?: boolean;
  deliveryInstructions?: string;
  lastUsedAt?: Timestamp;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Pagination and Filtering
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface SortOption {
  field: string;
  order: SortOrder;
  label: string;
}

export interface FilterOption {
  id: ID;
  label: string;
  value: string | number | boolean;
  count?: number;
  isSelected?: boolean;
}

export interface FilterGroup {
  id: ID;
  label: string;
  type: 'checkbox' | 'radio' | 'range' | 'select' | 'search';
  options: FilterOption[];
  isCollapsible?: boolean;
  isExpanded?: boolean;
}

export interface SearchFilters {
  query?: string;
  categories?: ID[];
  brands?: ID[];
  priceRange?: {
    min: number;
    max: number;
  };
  ratings?: number[];
  availability?: 'in_stock' | 'out_of_stock' | 'all';
  sortBy?: string;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}

// Price and Money
export interface Price {
  amount: number;
  currency: Currency;
  formatted: string;
}

export interface PriceRange {
  min: Price;
  max: Price;
}

// SEO and Meta
export interface SEOData {
  [key: string]: unknown; // Index signature for flexible SEO data
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: ImageAsset;
  ogType?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: ImageAsset;
  structuredData?: Record<string, unknown>;
  noIndex?: boolean;
  noFollow?: boolean;
}

// API Response Types
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: APIError;
  meta?: Record<string, unknown>;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  field?: string;
  statusCode?: number;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Audit and Tracking
export interface AuditLog {
  id: ID;
  action: string;
  entityType: string;
  entityId: ID;
  userId?: ID;
  timestamp: Timestamp;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface BaseEntity {
  id: ID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  version?: number;
  isDeleted?: boolean;
}

// Form and Validation
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'date' | 'time' | 'datetime-local';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  validation?: ValidationRule[];
  options?: SelectOption[];
  multiple?: boolean;
  accept?: string; // for file inputs
  min?: number | string;
  max?: number | string;
  step?: number;
  rows?: number; // for textarea
  cols?: number; // for textarea
}

export interface ValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'pattern' | 'custom';
  value?: unknown;
  message: string;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}

// Component Props Base Types
export interface ComponentWithChildren {
  children?: React.ReactNode;
}

export interface ComponentWithClassName {
  className?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

export interface AsyncState<T> extends LoadingState {
  data?: T | null;
}

// Notification and Toast
export interface Toast {
  id: ID;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  actions?: ToastAction[];
  dismissible?: boolean;
}

export interface ToastAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'destructive';
}

// Rating and Review Common Types
export interface Rating {
  average: number;
  count: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

// Inventory and Stock
export interface StockInfo {
  quantity: number;
  isInStock: boolean;
  isLowStock: boolean;
  lowStockThreshold: number;
  reservedQuantity?: number;
  availableQuantity: number;
  backorderAllowed: boolean;
  estimatedRestockDate?: Timestamp;
}

// Analytics and Tracking
export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, unknown>;
  userId?: ID;
  sessionId?: string;
  timestamp: Timestamp;
}

// Feature Flags
export interface FeatureFlag {
  key: string;
  enabled: boolean;
  rolloutPercentage?: number;
  conditions?: Record<string, unknown>;
}

// App Configuration
export interface AppConfig {
  name: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  apiBaseUrl: string;
  cdnBaseUrl: string;
  features: Record<string, FeatureFlag>;
  analytics: {
    googleAnalyticsId?: string;
    facebookPixelId?: string;
    hotjarId?: string;
  };
  social: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
    pinterest?: string;
  };
  contact: {
    email: string;
    phone: string;
    address: Address;
    supportHours: string;
  };
  legal: {
    privacyPolicyUrl: string;
    termsOfServiceUrl: string;
    returnPolicyUrl: string;
    shippingPolicyUrl: string;
  };
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type ValueOf<T> = T[keyof T];

export type KeyOf<T> = keyof T;

export type NonEmptyArray<T> = [T, ...T[]];

export type Flatten<T> = T extends (infer U)[] ? U : T;

// Event Types
export interface BaseEvent {
  type: string;
  timestamp: Timestamp;
  source: string;
}

export interface UserEvent extends BaseEvent {
  userId: ID;
  sessionId: string;
}

// Webhook Types
export interface WebhookPayload {
  event: string;
  data: Record<string, unknown>;
  timestamp: Timestamp;
  signature?: string;
}

// Cache Types
export interface CacheEntry<T> {
  data: T;
  timestamp: Timestamp;
  expiresAt: Timestamp;
  tags?: string[];
}

// File Upload Types
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface FileUpload {
  file: File;
  progress: UploadProgress;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  result?: ImageAsset | VideoAsset;
}

// Permission and Role Types (Basic)
export type Permission = string;

export type Role = string;

// Session and Device Types
export interface DeviceInfo {
  userAgent: string;
  platform: string;
  browser: string;
  version: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenResolution?: string;
  timezone?: string;
  language?: string;
}

export interface SessionInfo {
  id: string;
  userId?: ID;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
  startTime: Timestamp;
  lastActivity: Timestamp;
  isActive: boolean;
}
