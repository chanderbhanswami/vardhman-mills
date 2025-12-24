import React from 'react';

// ProductFilters Components
export { default as AvailabilityFilter } from './AvailabilityFilter';
export type { AvailabilityFilterProps } from './AvailabilityFilter';

export { default as BrandFilter } from './BrandFilter';
export type { BrandFilterProps, BrandOption } from './BrandFilter';

export { default as CategoryFilter } from './CategoryFilter';
export type { CategoryFilterProps, CategoryOption } from './CategoryFilter';

export { default as ColorFilter } from './ColorFilter';
export type { ColorFilterProps, ColorOption } from './ColorFilter';

export { default as RatingFilter } from './RatingFilter';
export type { RatingFilterProps, RatingOption } from './RatingFilter';

export { default as SizeFilter } from './SizeFilter';
export type { SizeFilterProps, SizeOption } from './SizeFilter';

export { default as ThreadCountFilter } from './ThreadCountFilter';
export type { ThreadCountFilterProps, ThreadCountRange } from './ThreadCountFilter';

export { default as PriceFilter } from './PriceFilter';
export type { PriceFilterProps, PriceRange } from './PriceFilter';

export { default as MaterialFilter } from './MaterialFilter';
export type { MaterialFilterProps, MaterialOption } from './MaterialFilter';

export { default as ArrivalFilter } from './ArrivalFilter';
export type { ArrivalFilterProps, ArrivalPeriod } from './ArrivalFilter';

export { default as PatternFilter } from './PatternFilter';
export type { PatternFilterProps, Pattern } from './PatternFilter';

export { default as OccasionFilter } from './OccasionFilter';
export type { OccasionFilterProps, Occasion } from './OccasionFilter';

export { default as DiscountFilter } from './DiscountFilter';
export type { DiscountFilterProps, DiscountOption } from './DiscountFilter';

// Utility types for filter management
export interface FilterGroup {
  id: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
  isCollapsed?: boolean;
}

export interface FilterState {
  availability: 'in_stock' | 'out_of_stock' | 'all';
  brandIds: string[];
  categoryIds: string[];
  colors: string[];
  ratings: number[];
  sizes: string[];
  threadCount: { min: number; max: number };
  priceRange: { min: number; max: number };
  materials: string[];
  arrivalPeriod: 'today' | 'week' | 'month' | 'quarter' | 'all';
  patterns: string[];
  occasions: string[];
  discount: number | null;
}

export interface FilterConfig {
  showAvailability?: boolean;
  showBrands?: boolean;
  showCategories?: boolean;
  showColors?: boolean;
  showRatings?: boolean;
  showSizes?: boolean;
  showThreadCount?: boolean;
  showPrice?: boolean;
  showMaterials?: boolean;
  showArrivals?: boolean;
  showPatterns?: boolean;
  showOccasions?: boolean;
  showDiscount?: boolean;
}

export const defaultFilterState: FilterState = {
  availability: 'all',
  brandIds: [],
  categoryIds: [],
  colors: [],
  ratings: [],
  sizes: [],
  threadCount: { min: 0, max: 1000 },
  priceRange: { min: 0, max: 100000 },
  materials: [],
  arrivalPeriod: 'all',
  patterns: [],
  occasions: [],
  discount: null,
};

export const defaultFilterConfig: FilterConfig = {
  showAvailability: true,
  showBrands: true,
  showCategories: true,
  showColors: true,
  showRatings: true,
  showSizes: true,
  showThreadCount: true,
  showPrice: true,
  showMaterials: true,
  showArrivals: true,
  showPatterns: true,
  showOccasions: true,
  showDiscount: true,
};
