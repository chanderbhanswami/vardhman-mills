import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  children?: Category[];
  level: number;
  isActive: boolean;
  sortOrder: number;
  image?: string;
  icon?: string;
  color?: string;
  metaTitle?: string;
  metaDescription?: string;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryTree extends Category {
  children: CategoryTree[];
  path: string[];
  breadcrumb: string[];
}

export interface CategoryFilters {
  parentId?: string;
  level?: number;
  isActive?: boolean;
  search?: string;
  hasProducts?: boolean;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
  sortOrder?: number;
  image?: string;
  icon?: string;
  color?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface CategoryStats {
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
  topLevelCategories: number;
  categoriesWithProducts: number;
  categoriesWithoutProducts: number;
  averageProductsPerCategory: number;
  mostPopularCategory: Category | null;
  recentlyAddedCategories: Category[];
}

const CATEGORY_QUERY_KEYS = {
  all: ['categories'],
  lists: () => [...CATEGORY_QUERY_KEYS.all, 'list'],
  list: (filters: CategoryFilters) => [...CATEGORY_QUERY_KEYS.lists(), filters],
  details: () => [...CATEGORY_QUERY_KEYS.all, 'detail'],
  detail: (id: string) => [...CATEGORY_QUERY_KEYS.details(), id],
  tree: () => [...CATEGORY_QUERY_KEYS.all, 'tree'],
  stats: () => [...CATEGORY_QUERY_KEYS.all, 'stats'],
  search: (query: string) => [...CATEGORY_QUERY_KEYS.all, 'search', query],
  breadcrumb: (id: string) => [...CATEGORY_QUERY_KEYS.all, 'breadcrumb', id],
} as const;

export const useCategories = (initialFilters: CategoryFilters = {}) => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<CategoryFilters>(initialFilters);

  // Generate mock categories data
  const generateMockCategories = (): Category[] => {
    return [
      {
        id: '1',
        name: 'Fabrics',
        slug: 'fabrics',
        description: 'High-quality fabrics for various applications',
        level: 0,
        isActive: true,
        sortOrder: 1,
        image: '/images/categories/fabrics.jpg',
        icon: 'fabric-icon',
        color: '#3B82F6',
        metaTitle: 'Premium Fabrics - Vardhman Mills',
        metaDescription: 'Discover our extensive collection of premium fabrics for all your textile needs.',
        productCount: 156,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
      },
      {
        id: '2',
        name: 'Cotton Fabrics',
        slug: 'cotton-fabrics',
        description: 'Premium cotton fabrics in various weights and weaves',
        parentId: '1',
        level: 1,
        isActive: true,
        sortOrder: 1,
        image: '/images/categories/cotton.jpg',
        color: '#10B981',
        productCount: 89,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-10T15:20:00Z',
      },
      {
        id: '3',
        name: 'Synthetic Fabrics',
        slug: 'synthetic-fabrics',
        description: 'Durable synthetic fabrics for industrial and commercial use',
        parentId: '1',
        level: 1,
        isActive: true,
        sortOrder: 2,
        image: '/images/categories/synthetic.jpg',
        color: '#F59E0B',
        productCount: 67,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-12T09:45:00Z',
      },
      {
        id: '4',
        name: 'Yarn',
        slug: 'yarn',
        description: 'Quality yarn products for textile manufacturing',
        level: 0,
        isActive: true,
        sortOrder: 2,
        image: '/images/categories/yarn.jpg',
        icon: 'yarn-icon',
        color: '#EF4444',
        metaTitle: 'Premium Yarn Products - Vardhman Mills',
        metaDescription: 'High-quality yarn products for all your textile manufacturing needs.',
        productCount: 234,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-14T11:15:00Z',
      },
      {
        id: '5',
        name: 'Cotton Yarn',
        slug: 'cotton-yarn',
        description: 'Pure cotton yarn in various counts',
        parentId: '4',
        level: 1,
        isActive: true,
        sortOrder: 1,
        productCount: 145,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-08T14:30:00Z',
      },
      {
        id: '6',
        name: 'Blended Yarn',
        slug: 'blended-yarn',
        description: 'High-quality blended yarn combinations',
        parentId: '4',
        level: 1,
        isActive: true,
        sortOrder: 2,
        productCount: 89,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-11T16:45:00Z',
      },
      {
        id: '7',
        name: 'Accessories',
        slug: 'accessories',
        description: 'Textile accessories and components',
        level: 0,
        isActive: false,
        sortOrder: 3,
        productCount: 23,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-05T13:20:00Z',
      },
    ];
  };

  // Fetch all categories with filters
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useQuery<Category[]>({
    queryKey: CATEGORY_QUERY_KEYS.list(filters),
    queryFn: async (): Promise<Category[]> => {
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let mockCategories = generateMockCategories();

      // Apply filters
      if (filters.parentId !== undefined) {
        mockCategories = mockCategories.filter(cat => cat.parentId === filters.parentId);
      }

      if (filters.level !== undefined) {
        mockCategories = mockCategories.filter(cat => cat.level === filters.level);
      }

      if (filters.isActive !== undefined) {
        mockCategories = mockCategories.filter(cat => cat.isActive === filters.isActive);
      }

      if (filters.hasProducts !== undefined) {
        const hasProducts = filters.hasProducts;
        mockCategories = mockCategories.filter(cat => 
          hasProducts ? cat.productCount > 0 : cat.productCount === 0
        );
      }

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        mockCategories = mockCategories.filter(cat => 
          cat.name.toLowerCase().includes(searchTerm) ||
          cat.description?.toLowerCase().includes(searchTerm) ||
          cat.slug.toLowerCase().includes(searchTerm)
        );
      }

      return mockCategories.sort((a, b) => a.sortOrder - b.sortOrder);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Fetch single category
  const useCategory = (id: string) => {
    return useQuery<Category>({
      queryKey: CATEGORY_QUERY_KEYS.detail(id),
      queryFn: async (): Promise<Category> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const category = generateMockCategories().find(cat => cat.id === id);
        if (!category) {
          throw new Error('Category not found');
        }
        
        return category;
      },
      enabled: !!id,
      staleTime: 10 * 60 * 1000,
    });
  };

  // Build category tree
  const {
    data: categoryTree = [],
    isLoading: treeLoading,
  } = useQuery<CategoryTree[]>({
    queryKey: CATEGORY_QUERY_KEYS.tree(),
    queryFn: async (): Promise<CategoryTree[]> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const allCategories = generateMockCategories();
      
      // Build tree structure
      const buildTree = (parentId?: string, level = 0): CategoryTree[] => {
        return allCategories
          .filter(cat => cat.parentId === parentId)
          .map(cat => {
            const children = buildTree(cat.id, level + 1);
            const path = parentId 
              ? [...(allCategories.find(p => p.id === parentId)?.name ? [allCategories.find(p => p.id === parentId)!.name] : []), cat.name]
              : [cat.name];
            
            return {
              ...cat,
              children,
              path,
              breadcrumb: path,
            };
          })
          .sort((a, b) => a.sortOrder - b.sortOrder);
      };

      return buildTree();
    },
    staleTime: 10 * 60 * 1000,
  });

  // Category statistics
  const {
    data: stats,
    isLoading: statsLoading,
  } = useQuery<CategoryStats>({
    queryKey: CATEGORY_QUERY_KEYS.stats(),
    queryFn: async (): Promise<CategoryStats> => {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const allCategories = generateMockCategories();
      const activeCategories = allCategories.filter(cat => cat.isActive);
      const topLevelCategories = allCategories.filter(cat => cat.level === 0);
      const categoriesWithProducts = allCategories.filter(cat => cat.productCount > 0);
      
      const totalProducts = allCategories.reduce((sum, cat) => sum + cat.productCount, 0);
      const avgProducts = allCategories.length > 0 ? totalProducts / allCategories.length : 0;
      
      const mostPopular = allCategories.reduce((max, cat) => 
        cat.productCount > (max?.productCount || 0) ? cat : max, null as Category | null
      );
      
      const recent = [...allCategories]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      return {
        totalCategories: allCategories.length,
        activeCategories: activeCategories.length,
        inactiveCategories: allCategories.length - activeCategories.length,
        topLevelCategories: topLevelCategories.length,
        categoriesWithProducts: categoriesWithProducts.length,
        categoriesWithoutProducts: allCategories.length - categoriesWithProducts.length,
        averageProductsPerCategory: Math.round(avgProducts * 100) / 100,
        mostPopularCategory: mostPopular,
        recentlyAddedCategories: recent,
      };
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: CategoryFormData): Promise<Category> => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCategory: Category = {
        id: Date.now().toString(),
        ...categoryData,
        isActive: categoryData.isActive ?? true,
        level: categoryData.parentId ? 1 : 0, // Simplified level calculation
        sortOrder: categoryData.sortOrder || 999,
        productCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return newCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.all });
      toast.success('Category created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create category');
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CategoryFormData> }): Promise<Category> => {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const existingCategory = generateMockCategories().find(cat => cat.id === id);
      if (!existingCategory) {
        throw new Error('Category not found');
      }

      const updatedCategory: Category = {
        ...existingCategory,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      return updatedCategory;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.detail(id) });
      toast.success('Category updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update category');
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const category = generateMockCategories().find(cat => cat.id === id);
      if (!category) {
        throw new Error('Category not found');
      }

      // Check if category has children or products
      const hasChildren = generateMockCategories().some(cat => cat.parentId === id);
      if (hasChildren) {
        throw new Error('Cannot delete category with subcategories');
      }

      if (category.productCount > 0) {
        throw new Error('Cannot delete category with products');
      }

      console.log('Deleting category:', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.all });
      toast.success('Category deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete category');
    },
  });

  // Reorder categories mutation
  const reorderCategoriesMutation = useMutation({
    mutationFn: async (categoryOrders: Array<{ id: string; sortOrder: number }>): Promise<void> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Reordering categories:', categoryOrders);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.all });
      toast.success('Categories reordered successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reorder categories');
    },
  });

  // Search categories
  const searchCategories = useCallback(async (searchTerm: string): Promise<Category[]> => {
    if (!searchTerm.trim()) return [];

    try {
      const results = await queryClient.fetchQuery({
        queryKey: CATEGORY_QUERY_KEYS.search(searchTerm),
        queryFn: async (): Promise<Category[]> => {
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const allCategories = generateMockCategories();
          const search = searchTerm.toLowerCase();
          
          return allCategories.filter(cat =>
            cat.name.toLowerCase().includes(search) ||
            cat.description?.toLowerCase().includes(search) ||
            cat.slug.toLowerCase().includes(search)
          );
        },
        staleTime: 2 * 60 * 1000,
      });

      return results;
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
      return [];
    }
  }, [queryClient]);

  // Get category breadcrumb
  const getCategoryBreadcrumb = useCallback(async (categoryId: string): Promise<Category[]> => {
    try {
      const breadcrumb = await queryClient.fetchQuery({
        queryKey: CATEGORY_QUERY_KEYS.breadcrumb(categoryId),
        queryFn: async (): Promise<Category[]> => {
          await new Promise(resolve => setTimeout(resolve, 200));
          
          const allCategories = generateMockCategories();
          const buildBreadcrumb = (id: string): Category[] => {
            const category = allCategories.find(cat => cat.id === id);
            if (!category) return [];
            
            const parent = category.parentId 
              ? buildBreadcrumb(category.parentId)
              : [];
            
            return [...parent, category];
          };

          return buildBreadcrumb(categoryId);
        },
        staleTime: 10 * 60 * 1000,
      });

      return breadcrumb;
    } catch (error) {
      console.error('Breadcrumb error:', error);
      return [];
    }
  }, [queryClient]);

  // Filter and utility functions
  const updateFilters = useCallback((newFilters: Partial<CategoryFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  const getTopLevelCategories = useCallback(() => {
    return categories.filter(cat => cat.level === 0);
  }, [categories]);

  const getSubcategories = useCallback((parentId: string) => {
    return categories.filter(cat => cat.parentId === parentId);
  }, [categories]);

  const getActiveCategories = useCallback(() => {
    return categories.filter(cat => cat.isActive);
  }, [categories]);

  // Computed values
  const isLoading = categoriesLoading || treeLoading || statsLoading;
  const hasError = categoriesError;

  const topLevelCategories = useMemo(() => 
    categories.filter(cat => cat.level === 0), 
    [categories]
  );

  const activeCategories = useMemo(() => 
    categories.filter(cat => cat.isActive), 
    [categories]
  );

  const totalProducts = useMemo(() => 
    categories.reduce((sum, cat) => sum + cat.productCount, 0),
    [categories]
  );

  return {
    // Data
    categories,
    categoryTree,
    topLevelCategories,
    activeCategories,
    stats,
    
    // Loading states
    isLoading,
    categoriesLoading,
    treeLoading,
    statsLoading,
    
    // Error states
    error: hasError,
    categoriesError,
    
    // Filters
    filters,
    
    // Computed values
    totalProducts,
    
    // Actions
    updateFilters,
    resetFilters,
    searchCategories,
    getCategoryBreadcrumb,
    refetchCategories,
    
    // Category operations
    createCategory: createCategoryMutation.mutateAsync,
    updateCategory: updateCategoryMutation.mutateAsync,
    deleteCategory: deleteCategoryMutation.mutateAsync,
    reorderCategories: reorderCategoriesMutation.mutateAsync,
    
    // Mutation states
    isCreating: createCategoryMutation.isPending,
    isUpdating: updateCategoryMutation.isPending,
    isDeleting: deleteCategoryMutation.isPending,
    isReordering: reorderCategoriesMutation.isPending,
    
    // Utility functions
    getTopLevelCategories,
    getSubcategories,
    getActiveCategories,
    useCategory,
  };
};

export default useCategories;