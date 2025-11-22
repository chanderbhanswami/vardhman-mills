import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '../auth/useAuth';

export interface Address {
  id: string;
  userId: string;
  type: 'home' | 'office' | 'billing' | 'shipping' | 'other';
  isDefault: boolean;
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
  alternatePhoneNumber?: string;
  email?: string;
  instructions?: string;
  landmark?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressData {
  type: 'home' | 'office' | 'billing' | 'shipping' | 'other';
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
  alternatePhoneNumber?: string;
  email?: string;
  instructions?: string;
  landmark?: string;
  isDefault?: boolean;
}

export interface UpdateAddressData extends Partial<CreateAddressData> {
  id: string;
}

export interface AddressFilters {
  type?: string;
  isDefault?: boolean;
  isVerified?: boolean;
  search?: string;
}

export interface UseAddressesOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useAddresses = (options: UseAddressesOptions = {}) => {
  const { autoRefresh = false, refreshInterval = 300000 } = options; // 5 minutes
  
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState<AddressFilters>({});

  // Fetch addresses
  const {
    data: addresses = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['addresses', user?.id, filters],
    queryFn: async (): Promise<Address[]> => {
      if (!isAuthenticated || !user) {
        return [];
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockAddresses: Address[] = [
        {
          id: 'addr_1',
          userId: user.id,
          type: 'home',
          isDefault: true,
          firstName: 'John',
          lastName: 'Doe',
          addressLine1: '123 Main Street',
          addressLine2: 'Apartment 4B',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001',
          country: 'India',
          phoneNumber: '+91 9876543210',
          email: 'john.doe@example.com',
          instructions: 'Ring the bell twice',
          landmark: 'Near City Mall',
          coordinates: {
            latitude: 19.0760,
            longitude: 72.8777,
          },
          isVerified: true,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'addr_2',
          userId: user.id,
          type: 'office',
          isDefault: false,
          firstName: 'John',
          lastName: 'Doe',
          company: 'Tech Solutions Inc.',
          addressLine1: '456 Business Park',
          city: 'Bangalore',
          state: 'Karnataka',
          postalCode: '560001',
          country: 'India',
          phoneNumber: '+91 9876543210',
          alternatePhoneNumber: '+91 8765432109',
          email: 'john.doe@techsolutions.com',
          landmark: 'Next to Metro Station',
          isVerified: false,
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'addr_3',
          userId: user.id,
          type: 'billing',
          isDefault: false,
          firstName: 'John',
          lastName: 'Doe',
          addressLine1: '789 Finance Street',
          city: 'Delhi',
          state: 'Delhi',
          postalCode: '110001',
          country: 'India',
          phoneNumber: '+91 9876543210',
          isVerified: true,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      // Apply filters
      let filteredAddresses = [...mockAddresses];

      if (filters.type) {
        filteredAddresses = filteredAddresses.filter(address => address.type === filters.type);
      }

      if (filters.isDefault !== undefined) {
        filteredAddresses = filteredAddresses.filter(address => address.isDefault === filters.isDefault);
      }

      if (filters.isVerified !== undefined) {
        filteredAddresses = filteredAddresses.filter(address => address.isVerified === filters.isVerified);
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredAddresses = filteredAddresses.filter(address => 
          address.firstName.toLowerCase().includes(searchLower) ||
          address.lastName.toLowerCase().includes(searchLower) ||
          address.addressLine1.toLowerCase().includes(searchLower) ||
          address.city.toLowerCase().includes(searchLower) ||
          address.state.toLowerCase().includes(searchLower) ||
          (address.company && address.company.toLowerCase().includes(searchLower))
        );
      }

      return filteredAddresses;
    },
    enabled: isAuthenticated && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  // Add address mutation
  const addAddressMutation = useMutation({
    mutationFn: async (addressData: CreateAddressData): Promise<Address> => {
      if (!isAuthenticated || !user) {
        throw new Error('You must be logged in to add an address');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newAddress: Address = {
        id: `addr_${Date.now()}`,
        userId: user.id,
        ...addressData,
        isDefault: addressData.isDefault ?? false,
        isVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return newAddress;
    },
    onSuccess: (newAddress) => {
      queryClient.setQueryData(['addresses', user?.id, filters], (old: Address[] = []) => {
        // If this is set as default, make all others non-default
        let updatedAddresses = old;
        if (newAddress.isDefault) {
          updatedAddresses = old.map(addr => ({ ...addr, isDefault: false }));
        }
        return [...updatedAddresses, newAddress];
      });
      
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address added successfully!', { duration: 3000, icon: '📍' });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to add address',
        { duration: 4000 }
      );
    },
  });

  // Update address mutation
  const updateAddressMutation = useMutation({
    mutationFn: async (addressData: UpdateAddressData): Promise<Address> => {
      if (!isAuthenticated || !user) {
        throw new Error('You must be logged in to update an address');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));

      const existingAddress = addresses.find(addr => addr.id === addressData.id);
      if (!existingAddress) {
        throw new Error('Address not found');
      }

      const updatedAddress: Address = {
        ...existingAddress,
        ...addressData,
        updatedAt: new Date().toISOString(),
      };

      return updatedAddress;
    },
    onSuccess: (updatedAddress) => {
      queryClient.setQueryData(['addresses', user?.id, filters], (old: Address[] = []) => {
        let updatedAddresses = old.map(addr => 
          addr.id === updatedAddress.id ? updatedAddress : addr
        );

        // If this is set as default, make all others non-default
        if (updatedAddress.isDefault) {
          updatedAddresses = updatedAddresses.map(addr => 
            addr.id !== updatedAddress.id ? { ...addr, isDefault: false } : addr
          );
        }

        return updatedAddresses;
      });
      
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address updated successfully!', { duration: 3000, icon: '✏️' });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update address',
        { duration: 4000 }
      );
    },
  });

  // Delete address mutation
  const deleteAddressMutation = useMutation({
    mutationFn: async (addressId: string): Promise<void> => {
      if (!isAuthenticated || !user) {
        throw new Error('You must be logged in to delete an address');
      }

      const addressToDelete = addresses.find(addr => addr.id === addressId);
      if (!addressToDelete) {
        throw new Error('Address not found');
      }

      if (addressToDelete.isDefault && addresses.length > 1) {
        throw new Error('Cannot delete default address. Please set another address as default first.');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
    },
    onSuccess: (_, addressId) => {
      queryClient.setQueryData(['addresses', user?.id, filters], (old: Address[] = []) => 
        old.filter(addr => addr.id !== addressId)
      );
      
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address deleted successfully!', { duration: 3000, icon: '🗑️' });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete address',
        { duration: 4000 }
      );
    },
  });

  // Set default address mutation
  const setDefaultAddressMutation = useMutation({
    mutationFn: async (addressId: string): Promise<void> => {
      if (!isAuthenticated || !user) {
        throw new Error('You must be logged in to set default address');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      console.log(`Setting address ${addressId} as default`);
    },
    onSuccess: (_, addressId) => {
      queryClient.setQueryData(['addresses', user?.id, filters], (old: Address[] = []) => 
        old.map(addr => ({
          ...addr,
          isDefault: addr.id === addressId,
          updatedAt: addr.id === addressId ? new Date().toISOString() : addr.updatedAt,
        }))
      );
      
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Default address updated!', { duration: 2000, icon: '⭐' });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to set default address',
        { duration: 4000 }
      );
    },
  });

  // Verify address mutation
  const verifyAddressMutation = useMutation({
    mutationFn: async (addressId: string): Promise<{ isValid: boolean; suggestions?: Address[] }> => {
      if (!isAuthenticated || !user) {
        throw new Error('You must be logged in to verify an address');
      }

      // Simulate API call with address verification service
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate validation result
      const isValid = Math.random() > 0.2; // 80% success rate
      
      return {
        isValid,
        suggestions: !isValid ? [
          // Mock suggestion
          addresses.find(addr => addr.id === addressId)!
        ] : undefined,
      };
    },
    onSuccess: (result, addressId) => {
      if (result.isValid) {
        queryClient.setQueryData(['addresses', user?.id, filters], (old: Address[] = []) => 
          old.map(addr => ({
            ...addr,
            isVerified: addr.id === addressId ? true : addr.isVerified,
            updatedAt: addr.id === addressId ? new Date().toISOString() : addr.updatedAt,
          }))
        );
        toast.success('Address verified successfully!', { duration: 3000, icon: '✅' });
      } else {
        toast.error('Address could not be verified. Please check the details.', { duration: 4000 });
      }
      
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to verify address',
        { duration: 4000 }
      );
    },
  });

  // Computed values
  const defaultAddress = useMemo(() => {
    return addresses.find(addr => addr.isDefault) || addresses[0] || null;
  }, [addresses]);

  const addressesByType = useMemo(() => {
    return addresses.reduce((acc, address) => {
      if (!acc[address.type]) {
        acc[address.type] = [];
      }
      acc[address.type].push(address);
      return acc;
    }, {} as Record<string, Address[]>);
  }, [addresses]);

  const verifiedAddresses = useMemo(() => {
    return addresses.filter(addr => addr.isVerified);
  }, [addresses]);

  const unverifiedAddresses = useMemo(() => {
    return addresses.filter(addr => !addr.isVerified);
  }, [addresses]);

  // Helper functions
  const getAddressById = useCallback((id: string): Address | null => {
    return addresses.find(addr => addr.id === id) || null;
  }, [addresses]);

  const getAddressesByType = useCallback((type: Address['type']): Address[] => {
    return addresses.filter(addr => addr.type === type);
  }, [addresses]);

  const formatAddress = useCallback((address: Address, includePhone = false): string => {
    const parts = [
      address.firstName && address.lastName ? `${address.firstName} ${address.lastName}` : '',
      address.company || '',
      address.addressLine1,
      address.addressLine2 || '',
      `${address.city}, ${address.state} ${address.postalCode}`,
      address.country,
    ].filter(Boolean);

    if (includePhone && address.phoneNumber) {
      parts.push(`Phone: ${address.phoneNumber}`);
    }

    return parts.join(', ');
  }, []);

  const isAddressComplete = useCallback((address: Partial<CreateAddressData>): boolean => {
    const requiredFields = ['firstName', 'lastName', 'addressLine1', 'city', 'state', 'postalCode', 'country'];
    return requiredFields.every(field => address[field as keyof CreateAddressData]);
  }, []);

  const validatePostalCode = useCallback((postalCode: string, country: string): boolean => {
    // Simple validation - in real app, use proper validation service
    const patterns: Record<string, RegExp> = {
      'India': /^\d{6}$/,
      'United States': /^\d{5}(-\d{4})?$/,
      'Canada': /^[A-Z]\d[A-Z] \d[A-Z]\d$/,
      'United Kingdom': /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/i,
    };

    const pattern = patterns[country];
    return pattern ? pattern.test(postalCode) : true;
  }, []);

  // Action functions
  const updateFilters = useCallback((newFilters: Partial<AddressFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const addAddress = useCallback(async (addressData: CreateAddressData) => {
    return addAddressMutation.mutateAsync(addressData);
  }, [addAddressMutation]);

  const updateAddress = useCallback(async (addressData: UpdateAddressData) => {
    return updateAddressMutation.mutateAsync(addressData);
  }, [updateAddressMutation]);

  const deleteAddress = useCallback(async (addressId: string) => {
    return deleteAddressMutation.mutateAsync(addressId);
  }, [deleteAddressMutation]);

  const setDefaultAddress = useCallback(async (addressId: string) => {
    return setDefaultAddressMutation.mutateAsync(addressId);
  }, [setDefaultAddressMutation]);

  const verifyAddress = useCallback(async (addressId: string) => {
    return verifyAddressMutation.mutateAsync(addressId);
  }, [verifyAddressMutation]);

  const refreshAddresses = useCallback(() => {
    return refetch();
  }, [refetch]);

  return {
    // Data
    addresses,
    defaultAddress,
    addressesByType,
    verifiedAddresses,
    unverifiedAddresses,
    filters,

    // State
    isLoading,
    isFetching,
    error,

    // Helpers
    getAddressById,
    getAddressesByType,
    formatAddress,
    isAddressComplete,
    validatePostalCode,

    // Actions
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    verifyAddress,
    updateFilters,
    clearFilters,
    refreshAddresses,

    // Loading states
    isAdding: addAddressMutation.isPending,
    isUpdating: updateAddressMutation.isPending,
    isDeleting: deleteAddressMutation.isPending,
    isSettingDefault: setDefaultAddressMutation.isPending,
    isVerifying: verifyAddressMutation.isPending,

    // Stats
    stats: {
      total: addresses.length,
      verified: verifiedAddresses.length,
      unverified: unverifiedAddresses.length,
      byType: Object.keys(addressesByType).reduce((acc, type) => {
        acc[type] = addressesByType[type].length;
        return acc;
      }, {} as Record<string, number>),
    },
  };
};

export default useAddresses;
