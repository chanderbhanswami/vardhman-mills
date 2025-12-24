import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api/api';

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

  // Fetch all categories
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useQuery<Category[]>({
    queryKey: CATEGORY_QUERY_KEYS.list(filters),
    queryFn: async (): Promise<Category[]> => {
      try {
        const response = await api.getCategories();
        const data = response.data as { categories: Category[] } | undefined;

        if (data && data.categories) {
          let allCategories = data.categories;

          // Apply client-side filters if needed, or rely on backend parameters if we passed them.
          // Since backend returns all, we filter here for search/etc if the backend didn't handle it yet
          // But wait, backend `getAllCategories` does NOT take filters! 
          // So we MUST filter on client side as before, or update backend.
          // The previous mock implementation filtered extensively.
          // For now, I will perform client-side filtering on the returned list to match previous behavior

          if (filters.parentId !== undefined) {
            allCategories = allCategories.filter(cat => cat.parentId === filters.parentId);
          }

          if (filters.level !== undefined) {
            allCategories = allCategories.filter(cat => cat.level === filters.level);
          }

          if (filters.isActive !== undefined) {
            allCategories = allCategories.filter(cat => cat.isActive === filters.isActive);
          }

          if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            allCategories = allCategories.filter(cat =>
              cat.name.toLowerCase().includes(searchTerm) ||
              cat.description?.toLowerCase().includes(searchTerm) ||
              cat.slug.toLowerCase().includes(searchTerm)
            );
          }

          return allCategories.sort((a, b) => a.sortOrder - b.sortOrder);
        }
        return [];
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch single category
  const useCategory = (id: string) => {
    return useQuery<Category>({
      queryKey: CATEGORY_QUERY_KEYS.detail(id),
      queryFn: async (): Promise<Category> => {
        const category = categories.find(cat => cat.id === id);
        if (!category) {
          throw new Error('Category not found');
        }

        return category;
      },
      enabled: !!id && categories.length > 0,
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

      const allCategories = categories;

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

      const allCategories = categories;
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

      const existingCategory = categories.find(cat => cat.id === id);
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

      const category = categories.find(cat => cat.id === id);
      if (!category) {
        throw new Error('Category not found');
      }

      // Check if category has children or products
      const hasChildren = categories.some(cat => cat.parentId === id);
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

          const allCategories = categories;
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

          const allCategories = categories;
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