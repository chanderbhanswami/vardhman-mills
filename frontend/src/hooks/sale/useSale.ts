import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '../auth/useAuth';

export interface Sale {
  id: string;
  title: string;
  description: string;
  type: 'percentage' | 'fixed' | 'bogo' | 'flash' | 'clearance';
  value: number; // percentage or fixed amount
  startDate: string;
  endDate: string;
  isActive: boolean;
  bannerImage?: string;
  backgroundColor?: string;
  textColor?: string;
  conditions: {
    minOrderValue?: number;
    maxDiscount?: number;
    applicableCategories?: string[];
    excludedProducts?: string[];
    userTypes?: ('all' | 'new' | 'returning' | 'vip')[];
    usageLimit?: number;
    usagePerUser?: number;
  };
  priority: number;
  createdAt: string;
  updatedAt: string;
  stats?: {
    totalOrders: number;
    totalRevenue: number;
    totalSavings: number;
    conversionRate: number;
  };
}

export interface SaleFilters {
  status?: 'active' | 'upcoming' | 'expired' | 'all';
  type?: Sale['type'] | 'all';
  sortBy?: 'newest' | 'oldest' | 'priority' | 'endingSoon' | 'value';
  search?: string;
  category?: string;
}

export interface UseSaleOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  includeStats?: boolean;
  preloadImages?: boolean;
}

export const useSale = (options: UseSaleOptions = {}) => {
  const {
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
    includeStats = true,
  } = options;

  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Local state
  const [filters, setFilters] = useState<SaleFilters>({
    status: 'active',
    type: 'all',
    sortBy: 'priority',
    search: '',
  });

  // Fetch sales data
  const {
    data: salesData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['sales', { filters, includeStats }],
    queryFn: async (): Promise<Sale[]> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const mockSales: Sale[] = [
        {
          id: 'sale_1',
          title: 'Summer Flash Sale',
          description: 'Limited time offer on summer collection',
          type: 'percentage',
          value: 25,
          startDate: yesterday.toISOString(),
          endDate: tomorrow.toISOString(),
          isActive: true,
          bannerImage: '/images/sales/summer-flash.jpg',
          backgroundColor: '#ff6b6b',
          textColor: '#ffffff',
          conditions: {
            minOrderValue: 1000,
            maxDiscount: 5000,
            applicableCategories: ['clothing', 'accessories'],
            userTypes: ['all'],
            usageLimit: 1000,
            usagePerUser: 1,
          },
          priority: 1,
          createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
          stats: includeStats ? {
            totalOrders: 324,
            totalRevenue: 1250000,
            totalSavings: 312500,
            conversionRate: 12.5,
          } : undefined,
        },
        {
          id: 'sale_2',
          title: 'Buy One Get One Free',
          description: 'BOGO offer on selected items',
          type: 'bogo',
          value: 50,
          startDate: now.toISOString(),
          endDate: nextWeek.toISOString(),
          isActive: true,
          bannerImage: '/images/sales/bogo-offer.jpg',
          backgroundColor: '#4ecdc4',
          textColor: '#ffffff',
          conditions: {
            applicableCategories: ['shoes'],
            userTypes: ['all'],
            usagePerUser: 3,
          },
          priority: 2,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          stats: includeStats ? {
            totalOrders: 89,
            totalRevenue: 445000,
            totalSavings: 222500,
            conversionRate: 8.7,
          } : undefined,
        },
        {
          id: 'sale_3',
          title: 'New Year Mega Sale',
          description: 'Start the year with amazing discounts',
          type: 'percentage',
          value: 40,
          startDate: new Date(2025, 0, 1).toISOString(), // January 1, 2025
          endDate: new Date(2025, 0, 7).toISOString(),   // January 7, 2025
          isActive: false,
          bannerImage: '/images/sales/new-year-mega.jpg',
          backgroundColor: '#ffeaa7',
          textColor: '#2d3436',
          conditions: {
            minOrderValue: 2000,
            maxDiscount: 10000,
            userTypes: ['all'],
            usageLimit: 5000,
            usagePerUser: 1,
          },
          priority: 3,
          createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          stats: includeStats ? {
            totalOrders: 0,
            totalRevenue: 0,
            totalSavings: 0,
            conversionRate: 0,
          } : undefined,
        },
      ];

      // Apply filters
      let filteredSales = [...mockSales];

      // Filter by status
      if (filters.status && filters.status !== 'all') {
        const currentTime = now.getTime();
        filteredSales = filteredSales.filter(sale => {
          const startTime = new Date(sale.startDate).getTime();
          const endTime = new Date(sale.endDate).getTime();
          
          switch (filters.status) {
            case 'active':
              return sale.isActive && currentTime >= startTime && currentTime <= endTime;
            case 'upcoming':
              return currentTime < startTime;
            case 'expired':
              return currentTime > endTime;
            default:
              return true;
          }
        });
      }

      // Filter by type
      if (filters.type && filters.type !== 'all') {
        filteredSales = filteredSales.filter(sale => sale.type === filters.type);
      }

      // Filter by search
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredSales = filteredSales.filter(sale => 
          sale.title.toLowerCase().includes(searchLower) ||
          sale.description.toLowerCase().includes(searchLower)
        );
      }

      // Filter by category
      if (filters.category) {
        filteredSales = filteredSales.filter(sale => 
          sale.conditions.applicableCategories?.includes(filters.category!) ||
          !sale.conditions.applicableCategories
        );
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'oldest':
          filteredSales.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          break;
        case 'priority':
          filteredSales.sort((a, b) => a.priority - b.priority);
          break;
        case 'endingSoon':
          filteredSales.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
          break;
        case 'value':
          filteredSales.sort((a, b) => b.value - a.value);
          break;
        case 'newest':
        default:
          filteredSales.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
      }

      return filteredSales;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  // Subscribe to sale mutation (for admin users)
  const subscribeSaleMutation = useMutation({
    mutationFn: async (saleId: string): Promise<void> => {
      if (!isAuthenticated) {
        throw new Error('You must be logged in to subscribe to sale notifications');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log(`Subscribing to sale ${saleId} notifications`);
    },
    onSuccess: () => {
      toast.success('Successfully subscribed to sale notifications!', {
        duration: 3000,
        icon: '🔔',
      });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to subscribe to notifications',
        { duration: 3000 }
      );
    },
  });

  // Toggle sale status mutation (for admin users)
  const toggleSaleMutation = useMutation({
    mutationFn: async ({ saleId, isActive }: { saleId: string; isActive: boolean }): Promise<void> => {
      if (!isAuthenticated || user?.role !== 'admin') {
        throw new Error('You do not have permission to modify sales');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log(`${isActive ? 'Activating' : 'Deactivating'} sale ${saleId}`);
    },
    onSuccess: (_, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast.success(`Sale ${isActive ? 'activated' : 'deactivated'} successfully!`, {
        duration: 3000,
      });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update sale status',
        { duration: 3000 }
      );
    },
  });

  // Computed values
  const activeSales = useMemo(() => {
    return salesData?.filter(sale => {
      const now = new Date().getTime();
      const startTime = new Date(sale.startDate).getTime();
      const endTime = new Date(sale.endDate).getTime();
      return sale.isActive && now >= startTime && now <= endTime;
    }) || [];
  }, [salesData]);

  const upcomingSales = useMemo(() => {
    const now = new Date().getTime();
    return salesData?.filter(sale => {
      const startTime = new Date(sale.startDate).getTime();
      return now < startTime;
    }) || [];
  }, [salesData]);

  const expiredSales = useMemo(() => {
    const now = new Date().getTime();
    return salesData?.filter(sale => {
      const endTime = new Date(sale.endDate).getTime();
      return now > endTime;
    }) || [];
  }, [salesData]);

  const bestSale = useMemo(() => {
    return activeSales.reduce((best, current) => {
      if (!best) return current;
      return current.value > best.value ? current : best;
    }, null as Sale | null);
  }, [activeSales]);

  // Helper functions
  const getSaleById = useCallback((saleId: string): Sale | null => {
    return salesData?.find(sale => sale.id === saleId) || null;
  }, [salesData]);

  const getSalesByType = useCallback((type: Sale['type']): Sale[] => {
    return salesData?.filter(sale => sale.type === type) || [];
  }, [salesData]);

  const isSaleActive = useCallback((sale: Sale): boolean => {
    const now = new Date().getTime();
    const startTime = new Date(sale.startDate).getTime();
    const endTime = new Date(sale.endDate).getTime();
    return sale.isActive && now >= startTime && now <= endTime;
  }, []);

  const getTimeRemaining = useCallback((sale: Sale): { days: number; hours: number; minutes: number; seconds: number } | null => {
    const now = new Date().getTime();
    const endTime = new Date(sale.endDate).getTime();
    
    if (now >= endTime) return null;
    
    const timeLeft = endTime - now;
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds };
  }, []);

  const calculateDiscount = useCallback((sale: Sale, orderValue: number): number => {
    if (!isSaleActive(sale)) return 0;
    
    const { minOrderValue = 0, maxDiscount = Infinity } = sale.conditions;
    
    if (orderValue < minOrderValue) return 0;
    
    let discount = 0;
    
    switch (sale.type) {
      case 'percentage':
        discount = (orderValue * sale.value) / 100;
        break;
      case 'fixed':
        discount = sale.value;
        break;
      case 'bogo':
        // Simplified BOGO calculation (50% of order value)
        discount = orderValue * 0.5;
        break;
      default:
        discount = 0;
    }
    
    return Math.min(discount, maxDiscount);
  }, [isSaleActive]);

  const canUserUseSale = useCallback((sale: Sale, userType: 'new' | 'returning' | 'vip' = 'returning'): boolean => {
    const { userTypes = ['all'] } = sale.conditions;
    return userTypes.includes('all') || userTypes.includes(userType);
  }, []);

  // Actions
  const updateFilters = useCallback((newFilters: Partial<SaleFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const subscribToSale = useCallback(async (saleId: string) => {
    return subscribeSaleMutation.mutateAsync(saleId);
  }, [subscribeSaleMutation]);

  const toggleSaleStatus = useCallback(async (saleId: string, isActive: boolean) => {
    return toggleSaleMutation.mutateAsync({ saleId, isActive });
  }, [toggleSaleMutation]);

  const refreshSales = useCallback(() => {
    return refetch();
  }, [refetch]);

  return {
    // Data
    sales: salesData || [],
    activeSales,
    upcomingSales,
    expiredSales,
    bestSale,
    filters,
    
    // State
    isLoading,
    isFetching,
    error,
    
    // Helpers
    getSaleById,
    getSalesByType,
    isSaleActive,
    getTimeRemaining,
    calculateDiscount,
    canUserUseSale,
    
    // Actions
    updateFilters,
    subscribToSale,
    toggleSaleStatus,
    refreshSales,
    
    // Stats
    stats: {
      totalActive: activeSales.length,
      totalUpcoming: upcomingSales.length,
      totalExpired: expiredSales.length,
      totalSales: salesData?.length || 0,
      avgDiscount: activeSales.length > 0 
        ? activeSales.reduce((sum, sale) => sum + sale.value, 0) / activeSales.length 
        : 0,
    },
    
    // Loading states
    isSubscribing: subscribeSaleMutation.isPending,
    isTogglingSale: toggleSaleMutation.isPending,
    
    // Errors
    subscribeError: subscribeSaleMutation.error,
    toggleError: toggleSaleMutation.error,
  };
};

export default useSale;
