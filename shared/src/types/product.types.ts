export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  parentCategory?: Category;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
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
  images: string[];
  isActive: boolean;
}

export interface ProductReview {
  _id?: string;
  user: User;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  category: Category;
  subcategory?: Category;
  brand?: string;
  tags: string[];
  variants: ProductVariant[];
  images: string[];
  specifications: Record<string, string>;
  isActive: boolean;
  isFeatured: boolean;
  averageRating: number;
  totalReviews: number;
  reviews: ProductReview[];
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  search?: string;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  shortDescription?: string;
  category: string;
  subcategory?: string;
  brand?: string;
  tags?: string[];
  variants: Omit<ProductVariant, '_id'>[];
  specifications?: Record<string, string>;
  isFeatured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  isActive?: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  parentCategory?: string;
  sortOrder?: number;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  isActive?: boolean;
}