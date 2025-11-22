import { BaseEntity, ID, Timestamp, ImageAsset, PaginatedResponse, APIResponse } from './common.types';

// Header Logo Types - Simple types for admin CRUD operations

// ===== CORE TYPES =====
export type HeaderLogoStatus = 'active' | 'inactive' | 'draft';

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

// ===== MAIN HEADER LOGO ENTITY =====
export interface HeaderLogo extends BaseEntity {
  id: ID;
  name: string;
  description?: string;
  image: ImageAsset;
  altText: string;
  status: HeaderLogoStatus;
  
  // Display Properties
  width: number;
  height: number;
  link?: string;
  openInNewTab: boolean;
  
  // Priority for display order
  displayOrder: number;
  isDefault: boolean;
  
  // Responsive variants
  mobileImage?: ImageAsset;
  tabletImage?: ImageAsset;
  
  // SEO
  title?: string;
  
  // User Management
  createdBy: ID;
  updatedBy: ID;
  
  // Timeline
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ===== CONFIGURATION =====
export interface HeaderLogoConfig {
  id: ID;
  maxWidth: number;
  maxHeight: number;
  allowedFormats: string[];
  maxFileSize: number; // in bytes
  defaultLink?: string;
  showTitle: boolean;
  enableResponsive: boolean;
  
  // Timeline
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ===== REQUEST/RESPONSE INTERFACES =====
export interface CreateHeaderLogoRequest {
  name: string;
  description?: string;
  image: ImageAsset;
  altText: string;
  status: HeaderLogoStatus;
  width: number;
  height: number;
  link?: string;
  openInNewTab: boolean;
  displayOrder: number;
  isDefault: boolean;
  mobileImage?: ImageAsset;
  tabletImage?: ImageAsset;
  title?: string;
}

export type UpdateHeaderLogoRequest = Partial<CreateHeaderLogoRequest>;

export interface HeaderLogoQueryParams extends PaginationParams, SortParams, FilterParams {
  status?: HeaderLogoStatus;
  isDefault?: boolean;
}

export type HeaderLogoResponse = APIResponse<HeaderLogo>;
export type HeaderLogoListResponse = APIResponse<PaginatedResponse<HeaderLogo>>;
export type HeaderLogoConfigResponse = APIResponse<HeaderLogoConfig>;

// ===== HOOKS & STATE MANAGEMENT =====
export interface UseHeaderLogoHook {
  headerLogos: HeaderLogo[];
  currentLogo: HeaderLogo | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  createHeaderLogo: (data: CreateHeaderLogoRequest) => Promise<HeaderLogo>;
  updateHeaderLogo: (id: ID, data: UpdateHeaderLogoRequest) => Promise<HeaderLogo>;
  deleteHeaderLogo: (id: ID) => Promise<void>;
  setDefaultLogo: (id: ID) => Promise<void>;
  fetchHeaderLogos: (params?: HeaderLogoQueryParams) => Promise<void>;
  fetchHeaderLogo: (id: ID) => Promise<void>;
}

// ===== COMPONENT PROPS =====
export interface HeaderLogoComponentProps {
  logo?: HeaderLogo;
  className?: string;
  showTitle?: boolean;
  responsive?: boolean;
}

export interface HeaderLogoManagerProps {
  onLogoSelect?: (logo: HeaderLogo) => void;
  onLogoCreate?: (logo: HeaderLogo) => void;
  onLogoUpdate?: (logo: HeaderLogo) => void;
  onLogoDelete?: (id: ID) => void;
}
