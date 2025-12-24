import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/api';
import { Brand } from '@/lib/api/types';

export interface BrandFilters {
    isActive?: boolean;
    isFeatured?: boolean;
    search?: string;
}

export const useBrands = (initialFilters: BrandFilters = {}) => {
    const [filters, setFilters] = useState<BrandFilters>(initialFilters);

    const {
        data: brands = [],
        isLoading,
        error,
        refetch
    } = useQuery<Brand[]>({
        queryKey: ['brands', filters],
        queryFn: async () => {
            try {
                const response = await api.getBrands({
                    isActive: 'true',
                    ...(filters.search && { search: filters.search }),
                    ...(filters.isFeatured !== undefined && { isFeatured: String(filters.isFeatured) })
                });

                // Brand controller returns { success: true, data: Brand[] }
                if (response.data && Array.isArray(response.data)) {
                    return response.data;
                }
                return [];
            } catch (err) {
                console.error('Failed to fetch brands:', err);
                return [];
            }
        },
        staleTime: 5 * 60 * 1000,
    });

    const updateFilters = useCallback((newFilters: Partial<BrandFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    return {
        brands,
        isLoading,
        error,
        refetch,
        filters,
        updateFilters
    };
};

export default useBrands;
