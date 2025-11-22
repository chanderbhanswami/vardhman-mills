import { 
  ID, 
  Timestamp, 
  ImageAsset, 
  SEOData, 
  Status,
  PaginatedResponse 
} from './common.types';

// Re-export Brand from product.types for convenience
export type { Brand, SocialLink } from './product.types';

// Additional Brand-specific types
export interface BrandFilters {
  status?: Status;
  isVisible?: boolean;
  isFeatured?: boolean;
  hasProducts?: boolean;
  foundedYearRange?: {
    min: number;
    max: number;
  };
  search?: string;
  sortBy?: 'name' | 'created_at' | 'product_count' | 'founded_year';
  sortOrder?: 'asc' | 'desc';
}

export interface BrandListing {
  brands: PaginatedResponse<Brand>;
  filters: BrandFilterGroup[];
  sortOptions: BrandSortOption[];
  featuredBrands: Brand[];
}

export interface BrandFilterGroup {
  id: string;
  name: string;
  type: 'checkbox' | 'radio' | 'range';
  options: BrandFilterOption[];
  isCollapsed: boolean;
}

export interface BrandFilterOption {
  id: string;
  label: string;
  value: string | number;
  count: number;
  isSelected: boolean;
}

export interface BrandSortOption {
  value: string;
  label: string;
  field: string;
  order: 'asc' | 'desc';
}

export interface BrandDirectory {
  alphabeticalIndex: Record<string, Brand[]>;
  featuredBrands: Brand[];
  popularBrands: Brand[];
  newBrands: Brand[];
}

export interface BrandShowcase {
  brand: Brand;
  featuredProducts: Product[];
  collections: Collection[];
  brandStory: BrandStorySection[];
  testimonials: BrandTestimonial[];
  awards: BrandAward[];
}

export interface BrandStorySection {
  id: ID;
  title: string;
  content: string;
  image?: ImageAsset;
  video?: VideoAsset;
  order: number;
}

export interface BrandTestimonial {
  id: ID;
  brandId: ID;
  customerName: string;
  customerAvatar?: ImageAsset;
  content: string;
  rating: number;
  isVerified: boolean;
  createdAt: Timestamp;
}

export interface BrandAward {
  id: ID;
  brandId: ID;
  title: string;
  awardingBody: string;
  year: number;
  description?: string;
  certificate?: ImageAsset;
  verificationUrl?: string;
}

// For imports since they're referenced
interface Brand {
  id: ID;
  name: string;
  slug: string;
  description?: string;
  logo?: ImageAsset;
  bannerImage?: ImageAsset;
  brandGallery?: ImageAsset[];
  foundedYear?: number;
  headquarters?: string;
  website?: string;
  email?: string;
  phone?: string;
  socialLinks: SocialLink[];
  seo: SEOData;
  status: Status;
  isVisible: boolean;
  isFeatured: boolean;
  productCount: number;
  followersCount?: number;
  brandStory?: string;
  values?: string[];
  achievements?: string[];
  sortOrder: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface SocialLink {
  platform: 'facebook' | 'instagram' | 'twitter' | 'youtube' | 'linkedin' | 'pinterest';
  url: string;
  isActive: boolean;
}

interface Product {
  id: ID;
  name: string;
  // Add other necessary product fields as needed
}

interface Collection {
  id: ID;
  name: string;
  // Add other necessary collection fields as needed
}

interface VideoAsset {
  id: ID;
  url: string;
  title?: string;
}
