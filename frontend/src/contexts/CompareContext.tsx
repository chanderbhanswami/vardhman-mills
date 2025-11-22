/**
 * Compare Context - Vardhman Mills Frontend
 * Manages product comparison functionality
 */

'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';
// Types
interface CompareConfig {
  MAX_ITEMS: number;
  ATTRIBUTES_TO_COMPARE: string[];
}

const COMPARE_CONFIG: CompareConfig = {
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
};

// Types
interface CompareProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  rating: number;
  reviewCount: number;
  availability: 'in_stock' | 'out_of_stock' | 'pre_order';
  brand: string;
  category: string;
  sku: string;
  
  // Attributes for comparison
  material: string;
  weight: number;
  colors: string[];
  sizes: string[];
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  features: string[];
  certifications: string[];
  careInstructions: string[];
  origin: string;
  warranty?: string;
  
  // Additional metadata
  addedAt: Date;
}

interface ComparisonAttribute {
  key: string;
  label: string;
  type: 'text' | 'number' | 'array' | 'boolean' | 'price' | 'rating';
  unit?: string;
  important: boolean;
}

interface CompareState {
  products: CompareProduct[];
  loading: boolean;
  maxItems: number;
  attributes: ComparisonAttribute[];
  view: 'grid' | 'table';
  showOnlyDifferences: boolean;
  sortBy: 'name' | 'price' | 'rating' | 'added';
  sortOrder: 'asc' | 'desc';
}

type CompareAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_PRODUCT'; payload: CompareProduct }
  | { type: 'REMOVE_PRODUCT'; payload: string }
  | { type: 'CLEAR_ALL' }
  | { type: 'SET_VIEW'; payload: 'grid' | 'table' }
  | { type: 'TOGGLE_DIFFERENCES' }
  | { type: 'SET_SORT'; payload: { sortBy: string; sortOrder: 'asc' | 'desc' } }
  | { type: 'RESTORE_COMPARE'; payload: CompareProduct[] };

interface CompareContextType {
  state: CompareState;
  
  // Product operations
  addProduct: (productId: string) => Promise<void>;
  removeProduct: (productId: string) => void;
  clearAll: () => void;
  hasProduct: (productId: string) => boolean;
  getProductCount: () => number;
  canAddMore: () => boolean;
  
  // View operations
  setView: (view: 'grid' | 'table') => void;
  toggleShowDifferences: () => void;
  setSorting: (sortBy: string, sortOrder?: 'asc' | 'desc') => void;
  
  // Comparison operations
  getComparison: () => { attributes: ComparisonAttribute[]; products: CompareProduct[] };
  exportComparison: () => string;
  shareComparison: () => Promise<string>;
  
  // Utility operations
  getRecommendations: () => Promise<CompareProduct[]>;
  getMostCompared: () => Promise<CompareProduct[]>;
}

// Default comparison attributes
const defaultAttributes: ComparisonAttribute[] = [
  { key: 'name', label: 'Product Name', type: 'text', important: true },
  { key: 'price', label: 'Price', type: 'price', important: true },
  { key: 'rating', label: 'Rating', type: 'rating', important: true },
  { key: 'material', label: 'Material', type: 'text', important: true },
  { key: 'weight', label: 'Weight', type: 'number', unit: 'GSM', important: true },
  { key: 'colors', label: 'Available Colors', type: 'array', important: false },
  { key: 'sizes', label: 'Available Sizes', type: 'array', important: false },
  { key: 'brand', label: 'Brand', type: 'text', important: false },
  { key: 'availability', label: 'Availability', type: 'text', important: true },
  { key: 'features', label: 'Features', type: 'array', important: false },
  { key: 'certifications', label: 'Certifications', type: 'array', important: false },
  { key: 'careInstructions', label: 'Care Instructions', type: 'array', important: false },
  { key: 'origin', label: 'Origin', type: 'text', important: false },
  { key: 'warranty', label: 'Warranty', type: 'text', important: false },
];

// Initial state
const initialState: CompareState = {
  products: [],
  loading: false,
  maxItems: COMPARE_CONFIG.MAX_ITEMS,
  attributes: defaultAttributes,
  view: 'grid',
  showOnlyDifferences: false,
  sortBy: 'added',
  sortOrder: 'desc',
};

// Reducer
const compareReducer = (state: CompareState, action: CompareAction): CompareState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'ADD_PRODUCT':
      if (state.products.length >= state.maxItems) {
        toast.error(`Maximum ${state.maxItems} products can be compared`);
        return state;
      }
      
      if (state.products.some(p => p.id === action.payload.id)) {
        toast.error('Product already in comparison');
        return state;
      }
      
      return {
        ...state,
        products: [...state.products, { ...action.payload, addedAt: new Date() }],
      };
    
    case 'REMOVE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(p => p.id !== action.payload),
      };
    
    case 'CLEAR_ALL':
      return {
        ...state,
        products: [],
      };
    
    case 'SET_VIEW':
      return { ...state, view: action.payload };
    
    case 'TOGGLE_DIFFERENCES':
      return { ...state, showOnlyDifferences: !state.showOnlyDifferences };
    
    case 'SET_SORT':
      return {
        ...state,
        sortBy: action.payload.sortBy as 'name' | 'price' | 'rating' | 'added',
        sortOrder: action.payload.sortOrder,
      };
    
    case 'RESTORE_COMPARE':
      return {
        ...state,
        products: action.payload.slice(0, state.maxItems),
      };
    
    default:
      return state;
  }
};

// Context
const CompareContext = createContext<CompareContextType | undefined>(undefined);

// Provider component
interface CompareProviderProps {
  children: ReactNode;
}

export const CompareProvider: React.FC<CompareProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(compareReducer, initialState);
  
  // Load comparison from localStorage on mount
  useEffect(() => {
    try {
      const savedComparison = localStorage.getItem('vardhman_comparison');
      if (savedComparison) {
        const parsedComparison = JSON.parse(savedComparison);
        if (Array.isArray(parsedComparison) && parsedComparison.length > 0) {
          dispatch({ type: 'RESTORE_COMPARE', payload: parsedComparison });
        }
      }
    } catch (error) {
      console.error('Failed to load comparison from localStorage:', error);
    }
  }, []);
  
  // Save comparison to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('vardhman_comparison', JSON.stringify(state.products));
    } catch (error) {
      console.error('Failed to save comparison to localStorage:', error);
    }
  }, [state.products]);
  
  // Context methods
  const addProduct = async (productId: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Check if product is already in comparison
      if (state.products.some(p => p.id === productId)) {
        toast.error('Product already in comparison');
        return;
      }
      
      // Check maximum limit
      if (state.products.length >= state.maxItems) {
        toast.error(`Maximum ${state.maxItems} products can be compared`);
        return;
      }
      
      // Fetch product details
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product details');
      }
      
      const productData = await response.json();
      
      // Transform API response to CompareProduct
      const compareProduct: CompareProduct = {
        id: productData.id,
        name: productData.name,
        slug: productData.slug,
        price: productData.price,
        originalPrice: productData.originalPrice,
        discount: productData.discount,
        image: productData.images[0] || '/placeholder.jpg',
        rating: productData.rating || 0,
        reviewCount: productData.reviewCount || 0,
        availability: productData.inStock > 0 ? 'in_stock' : 'out_of_stock',
        brand: productData.brand || 'Vardhman Mills',
        category: productData.category.name,
        sku: productData.sku,
        material: productData.attributes?.material || 'Not specified',
        weight: productData.attributes?.weight || 0,
        colors: productData.variants?.map((v: { color?: string }) => v.color).filter(Boolean) || [],
        sizes: productData.variants?.map((v: { size?: string }) => v.size).filter(Boolean) || [],
        dimensions: productData.attributes?.dimensions,
        features: productData.features || [],
        certifications: productData.certifications || [],
        careInstructions: productData.careInstructions || [],
        origin: productData.attributes?.origin || 'India',
        warranty: productData.warranty,
        addedAt: new Date(),
      };
      
      dispatch({ type: 'ADD_PRODUCT', payload: compareProduct });
      toast.success(`${productData.name} added to comparison`);
    } catch (error) {
      console.error('Failed to add product to comparison:', error);
      toast.error('Failed to add product to comparison');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const removeProduct = (productId: string): void => {
    const product = state.products.find(p => p.id === productId);
    dispatch({ type: 'REMOVE_PRODUCT', payload: productId });
    if (product) {
      toast.success(`${product.name} removed from comparison`);
    }
  };
  
  const clearAll = (): void => {
    dispatch({ type: 'CLEAR_ALL' });
    toast.success('Comparison cleared');
  };
  
  const hasProduct = (productId: string): boolean => {
    return state.products.some(p => p.id === productId);
  };
  
  const getProductCount = (): number => state.products.length;
  
  const canAddMore = (): boolean => state.products.length < state.maxItems;
  
  const setView = (view: 'grid' | 'table'): void => {
    dispatch({ type: 'SET_VIEW', payload: view });
  };
  
  const toggleShowDifferences = (): void => {
    dispatch({ type: 'TOGGLE_DIFFERENCES' });
  };
  
  const setSorting = (sortBy: string, sortOrder: 'asc' | 'desc' = 'asc'): void => {
    dispatch({ type: 'SET_SORT', payload: { sortBy, sortOrder } });
  };
  
  const getComparison = () => {
    const sortedProducts = [...state.products];
    
    // Sort products
    sortedProducts.sort((a, b) => {
      let aValue: string | number | Date = a[state.sortBy as keyof CompareProduct] as string | number | Date;
      let bValue: string | number | Date = b[state.sortBy as keyof CompareProduct] as string | number | Date;
      
      if (state.sortBy === 'added') {
        aValue = new Date(a.addedAt).getTime();
        bValue = new Date(b.addedAt).getTime();
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (state.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    let attributes = state.attributes;
    
    // Filter attributes to show only differences if enabled
    if (state.showOnlyDifferences && state.products.length > 1) {
      attributes = state.attributes.filter(attr => {
        const values = state.products.map(p => p[attr.key as keyof CompareProduct]);
        const uniqueValues = new Set(values.map(v => JSON.stringify(v)));
        return uniqueValues.size > 1;
      });
    }
    
    return { attributes, products: sortedProducts };
  };
  
  const exportComparison = (): string => {
    const comparison = getComparison();
    const data = {
      products: comparison.products,
      attributes: comparison.attributes,
      exportedAt: new Date().toISOString(),
      source: 'Vardhman Mills',
    };
    
    return JSON.stringify(data, null, 2);
  };
  
  const shareComparison = async (): Promise<string> => {
    try {
      const comparisonData = {
        productIds: state.products.map(p => p.id),
        timestamp: Date.now(),
      };
      
      // Create a shareable link (in a real app, you'd save this to a backend)
      const encodedData = btoa(JSON.stringify(comparisonData));
      const shareUrl = `${window.location.origin}/compare?data=${encodedData}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Comparison link copied to clipboard');
      
      return shareUrl;
    } catch (error) {
      console.error('Failed to share comparison:', error);
      toast.error('Failed to create share link');
      throw error;
    }
  };
  
  const getRecommendations = async (): Promise<CompareProduct[]> => {
    try {
      if (state.products.length === 0) return [];
      
      const categoryIds = Array.from(new Set(state.products.map(p => p.category)));
      const response = await fetch('/api/products/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: categoryIds, excludeIds: state.products.map(p => p.id) }),
      });
      
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      
      const data = await response.json();
      return data.products || [];
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      return [];
    }
  };
  
  const getMostCompared = async (): Promise<CompareProduct[]> => {
    try {
      const response = await fetch('/api/products/most-compared');
      if (!response.ok) throw new Error('Failed to fetch most compared products');
      
      const data = await response.json();
      return data.products || [];
    } catch (error) {
      console.error('Failed to get most compared products:', error);
      return [];
    }
  };
  
  const contextValue: CompareContextType = {
    state,
    addProduct,
    removeProduct,
    clearAll,
    hasProduct,
    getProductCount,
    canAddMore,
    setView,
    toggleShowDifferences,
    setSorting,
    getComparison,
    exportComparison,
    shareComparison,
    getRecommendations,
    getMostCompared,
  };
  
  return (
    <CompareContext.Provider value={contextValue}>
      {children}
    </CompareContext.Provider>
  );
};

// Hook
export const useCompare = (): CompareContextType => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};

export default CompareContext;
export type { CompareProduct, ComparisonAttribute, CompareState };