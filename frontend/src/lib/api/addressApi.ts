import { HttpClient } from './client';
import { endpoints } from './endpoints';
import { 
  Address, 
  ApiResponse, 
  PaginationParams,
  SearchParams 
} from './types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CACHE_KEYS } from './config';
import { buildPaginationParams, buildSearchParams } from './utils';

/**
 * Address API Service
 * Handles address management, validation, and address book operations
 */

class AddressApiService {
  private client: HttpClient;

  constructor() {
    this.client = new HttpClient();
  }

  // Get user addresses
  async getUserAddresses(): Promise<ApiResponse<Address[]>> {
    return this.client.get<Address[]>(endpoints.users.addresses.list);
  }

  // Get address by ID
  async getAddressById(addressId: string): Promise<ApiResponse<Address>> {
    return this.client.get<Address>(endpoints.addresses.byId(addressId));
  }

  // Add new address
  async addAddress(address: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Address>> {
    return this.client.post<Address>(endpoints.users.addresses.create, address);
  }

  // Update address
  async updateAddress(addressId: string, updates: Partial<Address>): Promise<ApiResponse<Address>> {
    return this.client.put<Address>(endpoints.users.addresses.update(addressId), updates);
  }

  // Delete address
  async deleteAddress(addressId: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(endpoints.users.addresses.delete(addressId));
  }

  // Set default address
  async setDefaultAddress(addressId: string, type: 'shipping' | 'billing'): Promise<ApiResponse<Address>> {
    return this.client.post<Address>(endpoints.users.addresses.setDefault(addressId), { type });
  }

  // Validate address
  async validateAddress(address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }): Promise<ApiResponse<{
    isValid: boolean;
    suggestions?: Array<{
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      confidence: number;
    }>;
    standardized?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    errors?: string[];
  }>> {
    return this.client.post<{
      isValid: boolean;
      suggestions?: Array<{
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        confidence: number;
      }>;
      standardized?: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
      };
      errors?: string[];
    }>(endpoints.addresses.validate, address);
  }

  // Get address suggestions (autocomplete)
  async getAddressSuggestions(query: string, country?: string): Promise<ApiResponse<Array<{
    description: string;
    placeId: string;
    mainText: string;
    secondaryText: string;
    types: string[];
  }>>> {
    const params = { query, ...(country && { country }) };
    return this.client.get<Array<{
      description: string;
      placeId: string;
      mainText: string;
      secondaryText: string;
      types: string[];
    }>>(endpoints.addresses.suggestions, { params });
  }

  // Get address details from place ID
  async getAddressFromPlaceId(placeId: string): Promise<ApiResponse<{
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    latitude?: number;
    longitude?: number;
    formattedAddress: string;
  }>> {
    return this.client.get<{
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      latitude?: number;
      longitude?: number;
      formattedAddress: string;
    }>(endpoints.addresses.fromPlaceId(placeId));
  }

  // Calculate distance between addresses
  async calculateDistance(fromAddressId: string, toAddressId: string): Promise<ApiResponse<{
    distance: number;
    duration: number;
    unit: 'km' | 'miles';
  }>> {
    return this.client.post<{
      distance: number;
      duration: number;
      unit: 'km' | 'miles';
    }>(endpoints.addresses.distance, {
      fromAddressId,
      toAddressId,
    });
  }

  // Get shipping zones for address
  async getShippingZones(addressId: string): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    shippingMethods: Array<{
      id: string;
      name: string;
      cost: number;
      estimatedDays: number;
    }>;
  }>>> {
    return this.client.get<Array<{
      id: string;
      name: string;
      shippingMethods: Array<{
        id: string;
        name: string;
        cost: number;
        estimatedDays: number;
      }>;
    }>>(endpoints.addresses.shippingZones(addressId));
  }

  // Check address serviceability
  async checkServiceability(addressId: string): Promise<ApiResponse<{
    serviceable: boolean;
    restrictions?: string[];
    estimatedDeliveryDays?: number;
    availableServices: Array<{
      type: 'standard' | 'express' | 'overnight';
      available: boolean;
      cost?: number;
      estimatedDays?: number;
    }>;
  }>> {
    return this.client.get<{
      serviceable: boolean;
      restrictions?: string[];
      estimatedDeliveryDays?: number;
      availableServices: Array<{
        type: 'standard' | 'express' | 'overnight';
        available: boolean;
        cost?: number;
        estimatedDays?: number;
      }>;
    }>(endpoints.addresses.serviceability(addressId));
  }

  // Get nearby landmarks
  async getNearbyLandmarks(addressId: string, radius: number = 1): Promise<ApiResponse<Array<{
    name: string;
    type: string;
    distance: number;
    address: string;
  }>>> {
    return this.client.get<Array<{
      name: string;
      type: string;
      distance: number;
      address: string;
    }>>(endpoints.addresses.landmarks(addressId), {
      params: { radius },
    });
  }

  // Bulk validate addresses
  async bulkValidateAddresses(addresses: Array<{
    id?: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }>): Promise<ApiResponse<Array<{
    id?: string;
    isValid: boolean;
    errors?: string[];
    standardized?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  }>>> {
    return this.client.post<Array<{
      id?: string;
      isValid: boolean;
      errors?: string[];
      standardized?: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
      };
    }>>(endpoints.addresses.bulkValidate, { addresses });
  }

  // Import addresses from file
  async importAddresses(file: File, format: 'csv' | 'xlsx'): Promise<ApiResponse<{
    importId: string;
    totalRows: number;
    validRows: number;
    invalidRows: number;
    errors?: Array<{
      row: number;
      errors: string[];
    }>;
  }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);

    return this.client.post<{
      importId: string;
      totalRows: number;
      validRows: number;
      invalidRows: number;
      errors?: Array<{
        row: number;
        errors: string[];
      }>;
    }>(endpoints.addresses.import, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Export addresses
  async exportAddresses(format: 'csv' | 'xlsx' | 'json' = 'csv'): Promise<ApiResponse<Blob>> {
    return this.client.get<Blob>(endpoints.addresses.export, {
      params: { format },
      responseType: 'blob',
    });
  }

  // Admin Operations

  // Get all addresses (Admin)
  async getAllAddresses(params?: SearchParams & PaginationParams & {
    userId?: string;
    country?: string;
    state?: string;
    city?: string;
  }): Promise<ApiResponse<Address[]>> {
    const queryParams = {
      ...buildSearchParams(params || {}),
      ...buildPaginationParams(params || {}),
      ...(params?.userId && { userId: params.userId }),
      ...(params?.country && { country: params.country }),
      ...(params?.state && { state: params.state }),
      ...(params?.city && { city: params.city }),
    };
    
    return this.client.get<Address[]>(endpoints.addresses.admin.list, { params: queryParams });
  }

  // Update address (Admin)
  async adminUpdateAddress(addressId: string, updates: Partial<Address>): Promise<ApiResponse<Address>> {
    return this.client.put<Address>(endpoints.addresses.admin.update(addressId), updates);
  }

  // Delete address (Admin)
  async adminDeleteAddress(addressId: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(endpoints.addresses.admin.delete(addressId));
  }

  // Get address statistics (Admin)
  async getAddressStatistics(): Promise<ApiResponse<{
    totalAddresses: number;
    addressesByCountry: Record<string, number>;
    addressesByState: Record<string, number>;
    mostUsedCities: Array<{ city: string; count: number }>;
    validationStats: {
      totalValidated: number;
      validPercentage: number;
      invalidPercentage: number;
    };
  }>> {
    return this.client.get<{
      totalAddresses: number;
      addressesByCountry: Record<string, number>;
      addressesByState: Record<string, number>;
      mostUsedCities: Array<{ city: string; count: number }>;
      validationStats: {
        totalValidated: number;
        validPercentage: number;
        invalidPercentage: number;
      };
    }>(endpoints.addresses.admin.statistics);
  }

  // Bulk operations (Admin)
  async bulkUpdateAddresses(addressIds: string[], updates: Partial<Address>): Promise<ApiResponse<{
    updated: number;
    failed: string[];
  }>> {
    return this.client.post<{
      updated: number;
      failed: string[];
    }>(endpoints.addresses.admin.bulkUpdate, {
      addressIds,
      updates,
    });
  }

  async bulkDeleteAddresses(addressIds: string[]): Promise<ApiResponse<{
    deleted: number;
    failed: string[];
  }>> {
    return this.client.post<{
      deleted: number;
      failed: string[];
    }>(endpoints.addresses.admin.bulkDelete, { addressIds });
  }
}

// Create service instance
const addressApiService = new AddressApiService();

// React Query Hooks

// User Address Hooks
export const useUserAddresses = () => {
  return useQuery({
    queryKey: [CACHE_KEYS.USER_ADDRESSES],
    queryFn: () => addressApiService.getUserAddresses(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useAddress = (addressId: string) => {
  return useQuery({
    queryKey: [CACHE_KEYS.USER_ADDRESSES, 'detail', addressId],
    queryFn: () => addressApiService.getAddressById(addressId),
    enabled: !!addressId,
    staleTime: 10 * 60 * 1000,
  });
};

export const useAddressSuggestions = (query: string, country?: string) => {
  return useQuery({
    queryKey: ['addresses', 'suggestions', query, country],
    queryFn: () => addressApiService.getAddressSuggestions(query, country),
    enabled: query.length >= 3, // Only search when query is at least 3 characters
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAddressFromPlaceId = (placeId: string) => {
  return useQuery({
    queryKey: ['addresses', 'place-details', placeId],
    queryFn: () => addressApiService.getAddressFromPlaceId(placeId),
    enabled: !!placeId,
    staleTime: 30 * 60 * 1000, // 30 minutes - place details don't change often
  });
};

export const useShippingZones = (addressId: string) => {
  return useQuery({
    queryKey: ['addresses', 'shipping-zones', addressId],
    queryFn: () => addressApiService.getShippingZones(addressId),
    enabled: !!addressId,
    staleTime: 10 * 60 * 1000,
  });
};

export const useAddressServiceability = (addressId: string) => {
  return useQuery({
    queryKey: ['addresses', 'serviceability', addressId],
    queryFn: () => addressApiService.checkServiceability(addressId),
    enabled: !!addressId,
    staleTime: 10 * 60 * 1000,
  });
};

export const useNearbyLandmarks = (addressId: string, radius: number = 1) => {
  return useQuery({
    queryKey: ['addresses', 'landmarks', addressId, radius],
    queryFn: () => addressApiService.getNearbyLandmarks(addressId, radius),
    enabled: !!addressId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Admin Hooks
export const useAllAddresses = (params?: SearchParams & PaginationParams & {
  userId?: string;
  country?: string;
  state?: string;
  city?: string;
}) => {
  return useQuery({
    queryKey: ['addresses', 'admin', 'list', params],
    queryFn: () => addressApiService.getAllAddresses(params),
    staleTime: 2 * 60 * 1000, // 2 minutes for admin data
  });
};

export const useAddressStatistics = () => {
  return useQuery({
    queryKey: ['addresses', 'admin', 'statistics'],
    queryFn: () => addressApiService.getAddressStatistics(),
    staleTime: 10 * 60 * 1000,
  });
};

// Mutation Hooks

// Address CRUD
export const useAddAddress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (address: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => 
      addressApiService.addAddress(address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.USER_ADDRESSES] });
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ addressId, updates }: { addressId: string; updates: Partial<Address> }) => 
      addressApiService.updateAddress(addressId, updates),
    onSuccess: (_, { addressId }) => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.USER_ADDRESSES] });
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.USER_ADDRESSES, 'detail', addressId] });
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (addressId: string) => addressApiService.deleteAddress(addressId),
    onSuccess: (_, addressId) => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.USER_ADDRESSES] });
      queryClient.removeQueries({ queryKey: [CACHE_KEYS.USER_ADDRESSES, 'detail', addressId] });
    },
  });
};

export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ addressId, type }: { addressId: string; type: 'shipping' | 'billing' }) => 
      addressApiService.setDefaultAddress(addressId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.USER_ADDRESSES] });
    },
  });
};

// Address Validation
export const useValidateAddress = () => {
  return useMutation({
    mutationFn: (address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    }) => addressApiService.validateAddress(address),
  });
};

export const useBulkValidateAddresses = () => {
  return useMutation({
    mutationFn: (addresses: Array<{
      id?: string;
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    }>) => addressApiService.bulkValidateAddresses(addresses),
  });
};

// Distance Calculation
export const useCalculateDistance = () => {
  return useMutation({
    mutationFn: ({ fromAddressId, toAddressId }: { fromAddressId: string; toAddressId: string }) => 
      addressApiService.calculateDistance(fromAddressId, toAddressId),
  });
};

// Import/Export
export const useImportAddresses = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ file, format }: { file: File; format: 'csv' | 'xlsx' }) => 
      addressApiService.importAddresses(file, format),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.USER_ADDRESSES] });
    },
  });
};

export const useExportAddresses = () => {
  return useMutation({
    mutationFn: (format: 'csv' | 'xlsx' | 'json' = 'csv') => 
      addressApiService.exportAddresses(format),
  });
};

// Admin Mutations
export const useAdminUpdateAddress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ addressId, updates }: { addressId: string; updates: Partial<Address> }) => 
      addressApiService.adminUpdateAddress(addressId, updates),
    onSuccess: (_, { addressId }) => {
      queryClient.invalidateQueries({ queryKey: ['addresses', 'admin'] });
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.USER_ADDRESSES, 'detail', addressId] });
    },
  });
};

export const useAdminDeleteAddress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (addressId: string) => addressApiService.adminDeleteAddress(addressId),
    onSuccess: (_, addressId) => {
      queryClient.invalidateQueries({ queryKey: ['addresses', 'admin'] });
      queryClient.removeQueries({ queryKey: [CACHE_KEYS.USER_ADDRESSES, 'detail', addressId] });
    },
  });
};

export const useBulkUpdateAddresses = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ addressIds, updates }: { addressIds: string[]; updates: Partial<Address> }) => 
      addressApiService.bulkUpdateAddresses(addressIds, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses', 'admin'] });
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.USER_ADDRESSES] });
    },
  });
};

export const useBulkDeleteAddresses = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (addressIds: string[]) => addressApiService.bulkDeleteAddresses(addressIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses', 'admin'] });
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.USER_ADDRESSES] });
    },
  });
};

export default addressApiService;