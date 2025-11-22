import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

export interface CompareProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  brand?: string;
  category: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  specifications: Record<string, string | number | boolean>;
  features: string[];
  addedAt: Date;
}

export interface CompareFilters {
  category?: string;
  priceRange?: { min: number; max: number };
  brand?: string[];
  inStockOnly?: boolean;
}

export interface CompareStats {
  totalProducts: number;
  categories: string[];
  priceRange: { min: number; max: number };
  averageRating: number;
  brandsCount: number;
}

export interface UseCompareOptions {
  maxProducts?: number;
  enableLocalStorage?: boolean;
  enableSync?: boolean;
  autoShowToast?: boolean;
}

export const useCompare = (options: UseCompareOptions = {}) => {
  const {
    maxProducts = 4,
    enableLocalStorage = true,
    enableSync = false,
    autoShowToast = true,
  } = options;



  // Local state
  const [filters, setFilters] = useState<CompareFilters>({});
  const [compareList, setCompareList] = useState<CompareProduct[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    if (enableLocalStorage) {
      try {
        const stored = localStorage.getItem('vardhman_compare');
        if (stored) {
          const parsed = JSON.parse(stored);
          setCompareList(parsed);
        }
      } catch (error) {
        console.error('Error loading compare list from localStorage:', error);
      }
    }
  }, [enableLocalStorage]);

  // Save to localStorage when compare list changes
  useEffect(() => {
    if (enableLocalStorage) {
      try {
        localStorage.setItem('vardhman_compare', JSON.stringify(compareList));
      } catch (error) {
        console.error('Error saving compare list to localStorage:', error);
      }
    }
  }, [compareList, enableLocalStorage]);

  // Compare products query
  const {
    data: serverCompareList,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['compare', 'list'],
    queryFn: async (): Promise<CompareProduct[]> => {
      if (!enableSync) return compareList;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Return mock data or sync with server
      return compareList;
    },
    enabled: enableSync,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Add to compare mutation
  const addToCompareMutation = useMutation({
    mutationFn: async (productId: string): Promise<CompareProduct> => {
      if (compareList.length >= maxProducts) {
        throw new Error(`Maximum ${maxProducts} products can be compared`);
      }

      if (compareList.some(p => p.id === productId)) {
        throw new Error('Product is already in compare list');
      }

      // Simulate API call to get product details
      await new Promise(resolve => setTimeout(resolve, 600));

      // Mock product data
      const mockProduct: CompareProduct = {
        id: productId,
        name: `Product ${Math.floor(Math.random() * 100)}`,
        slug: `product-${Math.floor(Math.random() * 100)}`,
        price: Math.floor(Math.random() * 5000) + 500,
        originalPrice: Math.floor(Math.random() * 6000) + 600,
        discount: Math.floor(Math.random() * 30) + 5,
        image: `/images/products/product-${Math.floor(Math.random() * 10) + 1}.jpg`,
        brand: ['Brand A', 'Brand B', 'Brand C'][Math.floor(Math.random() * 3)],
        category: ['Electronics', 'Clothing', 'Home'][Math.floor(Math.random() * 3)],
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
        reviewCount: Math.floor(Math.random() * 500) + 10,
        inStock: Math.random() > 0.1,
        specifications: {
          weight: `${Math.floor(Math.random() * 500) + 100}g`,
          dimensions: `${Math.floor(Math.random() * 20) + 10}cm x ${Math.floor(Math.random() * 20) + 10}cm`,
          material: ['Cotton', 'Plastic', 'Metal', 'Wood'][Math.floor(Math.random() * 4)],
          warranty: `${Math.floor(Math.random() * 24) + 1} months`,
        },
        features: [
          'High Quality',
          'Durable',
          'Eco-friendly',
          'Lightweight',
          'Easy to use',
        ].slice(0, Math.floor(Math.random() * 3) + 2),
        addedAt: new Date(),
      };

      return mockProduct;
    },
    onSuccess: (newProduct) => {
      setCompareList(prev => [...prev, newProduct]);
      
      if (autoShowToast) {
        toast.success(`${newProduct.name} added to compare`, {
          duration: 3000,
          icon: '⚖️',
        });
      }
    },
    onError: (error) => {
      if (autoShowToast) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to add product to compare',
          { duration: 4000 }
        );
      }
    },
  });

  // Remove from compare
  const removeFromCompare = useCallback(
    (productId: string) => {
      const product = compareList.find(p => p.id === productId);
      setCompareList(prev => prev.filter(p => p.id !== productId));
      
      if (autoShowToast && product) {
        toast.success(`${product.name} removed from compare`, {
          duration: 2000,
          icon: '🗑️',
        });
      }
    },
    [compareList, autoShowToast]
  );

  // Clear all from compare
  const clearCompare = useCallback(() => {
    setCompareList([]);
    
    if (autoShowToast) {
      toast.success('Compare list cleared', {
        duration: 2000,
        icon: '🧹',
      });
    }
  }, [autoShowToast]);

  // Add to compare
  const addToCompare = useCallback(
    async (productId: string) => {
      return addToCompareMutation.mutateAsync(productId);
    },
    [addToCompareMutation]
  );

  // Check if product is in compare
  const isInCompare = useCallback(
    (productId: string): boolean => {
      return compareList.some(p => p.id === productId);
    },
    [compareList]
  );

  // Toggle product in compare
  const toggleCompare = useCallback(
    async (productId: string) => {
      if (isInCompare(productId)) {
        removeFromCompare(productId);
      } else {
        await addToCompare(productId);
      }
    },
    [addToCompare, removeFromCompare, isInCompare]
  );

  // Get filtered compare list
  const filteredCompareList = useCallback(() => {
    return compareList.filter(product => {
      if (filters.category && product.category !== filters.category) return false;
      if (filters.brand && !filters.brand.includes(product.brand || '')) return false;
      if (filters.inStockOnly && !product.inStock) return false;
      if (filters.priceRange) {
        const { min, max } = filters.priceRange;
        if (product.price < min || product.price > max) return false;
      }
      return true;
    });
  }, [compareList, filters]);

  // Get compare statistics
  const getCompareStats = useCallback((): CompareStats => {
    const products = filteredCompareList();
    
    if (products.length === 0) {
      return {
        totalProducts: 0,
        categories: [],
        priceRange: { min: 0, max: 0 },
        averageRating: 0,
        brandsCount: 0,
      };
    }

    const categories = Array.from(new Set(products.map(p => p.category)));
    const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));
    const prices = products.map(p => p.price);
    const ratings = products.map(p => p.rating);

    return {
      totalProducts: products.length,
      categories,
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices),
      },
      averageRating: ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length,
      brandsCount: brands.length,
    };
  }, [filteredCompareList]);

  // Get common specifications
  const getCommonSpecifications = useCallback(() => {
    const products = filteredCompareList();
    if (products.length === 0) return [];

    const allSpecKeys = Array.from(
      new Set(products.flatMap(p => Object.keys(p.specifications)))
    );

    return allSpecKeys.map(key => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      values: products.map(p => ({
        productId: p.id,
        value: p.specifications[key] || '-',
      })),
    }));
  }, [filteredCompareList]);

  // Get price comparison
  const getPriceComparison = useCallback(() => {
    const products = filteredCompareList();
    if (products.length === 0) return null;

    const prices = products.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    return {
      cheapest: products.find(p => p.price === minPrice),
      mostExpensive: products.find(p => p.price === maxPrice),
      priceDifference: maxPrice - minPrice,
      averagePrice: prices.reduce((sum, price) => sum + price, 0) / prices.length,
    };
  }, [filteredCompareList]);

  // Apply filters
  const applyFilters = useCallback((newFilters: CompareFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Get available categories
  const getAvailableCategories = useCallback(() => {
    return Array.from(new Set(compareList.map(p => p.category)));
  }, [compareList]);

  // Get available brands
  const getAvailableBrands = useCallback(() => {
    return Array.from(new Set(compareList.map(p => p.brand).filter(Boolean)));
  }, [compareList]);

  return {
    // Data
    compareList: enableSync ? (serverCompareList || compareList) : compareList,
    filteredList: filteredCompareList(),
    
    // State
    isLoading,
    error,
    isEmpty: compareList.length === 0,
    count: compareList.length,
    maxReached: compareList.length >= maxProducts,
    
    // Actions
    addToCompare,
    removeFromCompare,
    toggleCompare,
    clearCompare,
    
    // Filters
    filters,
    applyFilters,
    clearFilters,
    
    // Utilities
    isInCompare,
    getCompareStats,
    getCommonSpecifications,
    getPriceComparison,
    getAvailableCategories,
    getAvailableBrands,
    
    // Mutation state
    isAdding: addToCompareMutation.isPending,
    addError: addToCompareMutation.error,
    
    // Refresh
    refresh: refetch,
  };
};

export default useCompare;
