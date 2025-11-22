// Common types
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  shortDescription?: string;
  category: Category;
  brand?: string;
  images: string[];
  variants: ProductVariant[];
  specifications?: Record<string, string>;
  tags?: string[];
  isFeatured: boolean;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
  averageRating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  _id?: string;
  size?: string;
  color?: string;
  material?: string;
  sku: string;
  price: number;
  comparePrice?: number;
  stock: number;
  isActive: boolean;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentCategory?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: User;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  notes?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
  price: number;
}

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface Review {
  _id: string;
  user: User;
  product: string;
  rating: number;
  title: string;
  comment: string;
  isVerified: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  usersGrowth: number;
  productsGrowth: number;
  recentOrders: Order[];
  topProducts: Array<{
    product: Product;
    sales: number;
    revenue: number;
  }>;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Form types
export interface ProductFormData {
  name: string;
  description: string;
  shortDescription?: string;
  category: string;
  brand?: string;
  tags?: string;
  isFeatured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  variants: ProductVariant[];
  specifications?: Record<string, string>;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  parentCategory?: string;
  isActive: boolean;
  image?: File;
}

// Filter and search types
export interface ProductFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  search?: string;
  sortBy?: 'name' | 'price' | 'createdAt' | 'averageRating';
  sortOrder?: 'asc' | 'desc';
}

export interface OrderFilters {
  status?: string;
  paymentStatus?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: 'createdAt' | 'total' | 'orderNumber';
  sortOrder?: 'asc' | 'desc';
}

export interface UserFilters {
  role?: string;
  isActive?: boolean;
  search?: string;
  sortBy?: 'firstName' | 'email' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Settings types
export type SettingValue = string | number | boolean | Record<string, unknown> | unknown[];

export interface Setting {
  _id: string;
  category: string;
  key: string;
  value: SettingValue;
  type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  description?: string;
  userId?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SettingsFormData {
  [key: string]: SettingValue;
}

export interface SettingsCategory {
  category: string;
  settings: Record<string, SettingValue>;
}
