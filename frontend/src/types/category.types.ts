import { 
  ID, 
  ImageAsset, 
  Status,
  PaginatedResponse 
} from './common.types';
import type { Product, Category, CategoryAttribute, CategoryAttributeGroup } from './product.types';

// Re-export Category from product.types for convenience
export type { Category, CategoryAttribute, CategoryAttributeGroup } from './product.types';

// Additional Category-specific types
export interface CategoryTree {
  category: Category;
  children: CategoryTree[];
  productCount: number;
  depth: number;
}

export interface CategoryNavigation {
  mainCategories: Category[];
  featuredCategories: Category[];
  megaMenuData: MegaMenuCategory[];
}

export interface MegaMenuCategory {
  category: Category;
  subcategories: Category[];
  featuredProducts: Product[];
  promotionalBanner?: ImageAsset;
  ctaButton?: {
    text: string;
    url: string;
  };
}

export interface CategoryFilters {
  parentId?: ID;
  level?: number;
  status?: Status;
  isVisible?: boolean;
  isFeatured?: boolean;
  hasProducts?: boolean;
  sortBy?: 'name' | 'created_at' | 'sort_order' | 'product_count';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface CategoryStats {
  totalCategories: number;
  activeCategories: number;
  categoriesWithProducts: number;
  averageProductsPerCategory: number;
  deepestLevel: number;
  topCategoriesByProducts: Array<{
    categoryId: ID;
    name: string;
    productCount: number;
  }>;
}

export interface CategoryBreadcrumb {
  id: ID;
  name: string;
  slug: string;
  url: string;
}

export interface CategorySidebar {
  categories: Category[];
  filters: CategoryFilterGroup[];
  isCollapsible: boolean;
  defaultExpanded: boolean;
}

export interface CategoryFilterGroup {
  id: string;
  name: string;
  type: 'checkbox' | 'radio' | 'range';
  options: CategoryFilterOption[];
  isCollapsed: boolean;
}

export interface CategoryFilterOption {
  id: string;
  label: string;
  value: string | number;
  count: number;
  isSelected: boolean;
}

export interface CategoryListing {
  categories: PaginatedResponse<Category>;
  breadcrumbs: CategoryBreadcrumb[];
  filters: CategoryFilterGroup[];
  sortOptions: CategorySortOption[];
}

export interface CategorySortOption {
  value: string;
  label: string;
  field: string;
  order: 'asc' | 'desc';
}

// Category Management for Admin
export interface CategoryForm {
  name: string;
  slug: string;
  description?: string;
  parentId?: ID;
  image?: File | ImageAsset;
  icon?: string;
  bannerImage?: File | ImageAsset;
  status: Status;
  isVisible: boolean;
  isFeatured: boolean;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

export interface CategoryBulkAction {
  action: 'activate' | 'deactivate' | 'delete' | 'move' | 'update_sort_order';
  categoryIds: ID[];
  targetParentId?: ID; // for move action
  sortOrders?: number[]; // for update_sort_order action
}

export interface CategoryImport {
  file: File;
  format: 'csv' | 'xlsx' | 'json';
  mapping: CategoryFieldMapping[];
  options: CategoryImportOptions;
}

export interface CategoryFieldMapping {
  sourceField: string;
  targetField: keyof Category;
  transform?: string;
  defaultValue?: string;
}

export interface CategoryImportOptions {
  updateExisting: boolean;
  createHierarchy: boolean;
  skipInvalidRows: boolean;
  preserveOrder: boolean;
}

// ===== TYPE USAGE TO AVOID WARNINGS =====
export interface CategoryTypeUsage {
  categoryAttribute: CategoryAttribute;
  categoryAttributeGroup: CategoryAttributeGroup;
}
