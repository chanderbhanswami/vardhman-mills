import { HttpClient } from './client';
import { endpoints } from './endpoints';
import { 
  User, 
  Address, 
  ApiResponse, 
  PaginationParams,
  SearchParams 
} from './types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CACHE_KEYS } from './config';
import { buildPaginationParams, buildSearchParams } from './utils';

/**
 * User API Service
 * Handles user profile management, preferences, addresses, and admin operations
 */

class UserApiService {
  private client: HttpClient;

  constructor() {
    this.client = new HttpClient();
  }

  // Get current user profile
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.client.get<User>(endpoints.users.profile);
  }

  // Update user profile
  async updateProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
    return this.client.put<User>(endpoints.users.profile, updates);
  }

  // Update profile avatar
  async updateAvatar(avatar: File): Promise<ApiResponse<{ avatarUrl: string }>> {
    const formData = new FormData();
    formData.append('avatar', avatar);
    
    return this.client.post<{ avatarUrl: string }>(endpoints.users.avatar, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Remove avatar
  async removeAvatar(): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(endpoints.users.avatar);
  }

  // Change password
  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>(endpoints.users.changePassword, passwordData);
  }

  // Update email
  async updateEmail(newEmail: string, password: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>(endpoints.users.changeEmail, {
      newEmail,
      password,
    });
  }

  // Verify email change
  async verifyEmailChange(token: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>(endpoints.users.verifyEmail, { token });
  }

  // Get user addresses
  async getAddresses(): Promise<ApiResponse<Address[]>> {
    return this.client.get<Address[]>(endpoints.users.addresses.list);
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

  // Get user preferences
  async getPreferences(): Promise<ApiResponse<{
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
      marketing: boolean;
      orderUpdates: boolean;
      productRecommendations: boolean;
    };
    privacy: {
      profileVisibility: 'public' | 'private';
      showPurchaseHistory: boolean;
      allowRecommendations: boolean;
    };
    language: string;
    currency: string;
    timezone: string;
  }>> {
    return this.client.get<{
      notifications: {
        email: boolean;
        sms: boolean;
        push: boolean;
        marketing: boolean;
        orderUpdates: boolean;
        productRecommendations: boolean;
      };
      privacy: {
        profileVisibility: 'public' | 'private';
        showPurchaseHistory: boolean;
        allowRecommendations: boolean;
      };
      language: string;
      currency: string;
      timezone: string;
    }>(endpoints.users.preferences);
  }

  // Update user preferences
  async updatePreferences(preferences: {
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
      marketing?: boolean;
      orderUpdates?: boolean;
      productRecommendations?: boolean;
    };
    privacy?: {
      profileVisibility?: 'public' | 'private';
      showPurchaseHistory?: boolean;
      allowRecommendations?: boolean;
    };
    language?: string;
    currency?: string;
    timezone?: string;
  }): Promise<ApiResponse<{ message: string }>> {
    return this.client.put<{ message: string }>(endpoints.users.preferences, preferences);
  }

  // Get user activity log
  async getActivityLog(params?: PaginationParams): Promise<ApiResponse<Array<{
    id: string;
    action: string;
    description: string;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
  }>>> {
    const queryParams = buildPaginationParams(params || {});
    return this.client.get<Array<{
      id: string;
      action: string;
      description: string;
      ipAddress: string;
      userAgent: string;
      createdAt: string;
    }>>(endpoints.users.activity, { params: queryParams });
  }

  // Get active sessions
  async getActiveSessions(): Promise<ApiResponse<Array<{
    id: string;
    deviceInfo: string;
    ipAddress: string;
    location: string;
    isCurrent: boolean;
    lastActive: string;
    createdAt: string;
  }>>> {
    return this.client.get<Array<{
      id: string;
      deviceInfo: string;
      ipAddress: string;
      location: string;
      isCurrent: boolean;
      lastActive: string;
      createdAt: string;
    }>>(endpoints.users.sessions);
  }

  // Revoke session
  async revokeSession(sessionId: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(endpoints.users.revokeSession(sessionId));
  }

  // Revoke all sessions except current
  async revokeAllSessions(): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>(endpoints.users.revokeAllSessions);
  }

  // Enable two-factor authentication
  async enableTwoFactor(): Promise<ApiResponse<{
    qrCodeUrl: string;
    backupCodes: string[];
    secret: string;
  }>> {
    return this.client.post<{
      qrCodeUrl: string;
      backupCodes: string[];
      secret: string;
    }>(endpoints.users.twoFactor.enable);
  }

  // Verify two-factor setup
  async verifyTwoFactor(token: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>(endpoints.users.twoFactor.verify, { token });
  }

  // Disable two-factor authentication
  async disableTwoFactor(password: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>(endpoints.users.twoFactor.disable, { password });
  }

  // Regenerate backup codes
  async regenerateBackupCodes(): Promise<ApiResponse<{ backupCodes: string[] }>> {
    return this.client.post<{ backupCodes: string[] }>(endpoints.users.twoFactor.regenerateCodes);
  }

  // Export user data (GDPR compliance)
  async exportUserData(): Promise<ApiResponse<{
    exportId: string;
    estimatedTime: string;
  }>> {
    return this.client.post<{
      exportId: string;
      estimatedTime: string;
    }>(endpoints.users.exportData);
  }

  // Check export status
  async getExportStatus(exportId: string): Promise<ApiResponse<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    downloadUrl?: string;
    expiresAt?: string;
  }>> {
    return this.client.get<{
      status: 'pending' | 'processing' | 'completed' | 'failed';
      progress: number;
      downloadUrl?: string;
      expiresAt?: string;
    }>(endpoints.users.exportStatus(exportId));
  }

  // Request account deletion
  async requestAccountDeletion(reason: string, password: string): Promise<ApiResponse<{
    deletionId: string;
    scheduledDate: string;
  }>> {
    return this.client.post<{
      deletionId: string;
      scheduledDate: string;
    }>(endpoints.users.deleteAccount, { reason, password });
  }

  // Cancel account deletion
  async cancelAccountDeletion(): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>(endpoints.users.cancelDeletion);
  }

  // Admin Operations

  // Get all users (Admin)
  async getAllUsers(params?: SearchParams & PaginationParams & {
    role?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<User[]>> {
    const queryParams = {
      ...buildSearchParams(params || {}),
      ...buildPaginationParams(params || {}),
      ...(params?.role && { role: params.role }),
      ...(params?.status && { status: params.status }),
      ...(params?.dateFrom && { dateFrom: params.dateFrom }),
      ...(params?.dateTo && { dateTo: params.dateTo }),
    };
    
    return this.client.get<User[]>(endpoints.users.admin.list, { params: queryParams });
  }

  // Get user by ID (Admin)
  async getUserById(userId: string): Promise<ApiResponse<User>> {
    return this.client.get<User>(endpoints.users.admin.byId(userId));
  }

  // Update user (Admin)
  async updateUser(userId: string, updates: Partial<User>): Promise<ApiResponse<User>> {
    return this.client.put<User>(endpoints.users.admin.update(userId), updates);
  }

  // Update user status (Admin)
  async updateUserStatus(userId: string, status: 'active' | 'inactive' | 'banned', reason?: string): Promise<ApiResponse<User>> {
    return this.client.post<User>(endpoints.users.admin.updateStatus(userId), { status, reason });
  }

  // Reset user password (Admin)
  async resetUserPassword(userId: string): Promise<ApiResponse<{ temporaryPassword: string }>> {
    return this.client.post<{ temporaryPassword: string }>(endpoints.users.admin.resetPassword(userId));
  }

  // Update user role (Admin)
  async updateUserRole(userId: string, role: string): Promise<ApiResponse<User>> {
    return this.client.post<User>(endpoints.users.admin.updateRole(userId), { role });
  }

  // Get user statistics (Admin)
  async getUserStatistics(period?: string): Promise<ApiResponse<{
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
    usersByRole: Record<string, number>;
    usersByStatus: Record<string, number>;
    registrationsByDay: Array<{ date: string; count: number }>;
    topCountries: Array<{ country: string; count: number }>;
    averageSessionDuration: number;
  }>> {
    const params = period ? { period } : {};
    return this.client.get<{
      totalUsers: number;
      newUsers: number;
      activeUsers: number;
      usersByRole: Record<string, number>;
      usersByStatus: Record<string, number>;
      registrationsByDay: Array<{ date: string; count: number }>;
      topCountries: Array<{ country: string; count: number }>;
      averageSessionDuration: number;
    }>(endpoints.users.admin.statistics, { params });
  }

  // Bulk update users (Admin)
  async bulkUpdateUsers(userIds: string[], updates: {
    status?: 'active' | 'inactive' | 'banned';
    role?: string;
  }): Promise<ApiResponse<{ updated: number; failed: string[] }>> {
    return this.client.post<{ updated: number; failed: string[] }>(endpoints.users.admin.bulkUpdate, {
      userIds,
      updates,
    });
  }

  // Export users (Admin)
  async exportUsers(params?: {
    format?: 'csv' | 'xlsx' | 'json';
    role?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<Blob>> {
    return this.client.get<Blob>(endpoints.users.admin.export, {
      params: params || {},
      responseType: 'blob',
    });
  }

  // Send notification to user (Admin)
  async sendNotification(userId: string, notification: {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    actionUrl?: string;
  }): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>(endpoints.users.admin.sendNotification(userId), notification);
  }

  // Impersonate user (Admin)
  async impersonateUser(userId: string): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.client.post<{ token: string; user: User }>(endpoints.users.admin.impersonate(userId));
  }

  // Stop impersonation (Admin)
  async stopImpersonation(): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>(endpoints.users.admin.stopImpersonation);
  }
}

// Create service instance
const userApiService = new UserApiService();

// React Query Hooks

// User Profile Hooks
export const useCurrentUser = () => {
  return useQuery({
    queryKey: [CACHE_KEYS.CURRENT_USER],
    queryFn: () => userApiService.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUserAddresses = () => {
  return useQuery({
    queryKey: [CACHE_KEYS.USER_ADDRESSES],
    queryFn: () => userApiService.getAddresses(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUserPreferences = () => {
  return useQuery({
    queryKey: [CACHE_KEYS.USER_PREFERENCES],
    queryFn: () => userApiService.getPreferences(),
    staleTime: 10 * 60 * 1000,
  });
};

export const useUserActivityLog = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['user', 'activity', params],
    queryFn: () => userApiService.getActivityLog(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useActiveSessions = () => {
  return useQuery({
    queryKey: ['user', 'sessions'],
    queryFn: () => userApiService.getActiveSessions(),
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useExportStatus = (exportId: string) => {
  return useQuery({
    queryKey: ['user', 'export', exportId],
    queryFn: () => userApiService.getExportStatus(exportId),
    enabled: !!exportId,
    refetchInterval: 5000, // Poll every 5 seconds
    staleTime: 0,
  });
};

// Admin Hooks
export const useAllUsers = (params?: SearchParams & PaginationParams & {
  role?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useQuery({
    queryKey: ['users', 'admin', 'list', params],
    queryFn: () => userApiService.getAllUsers(params),
    staleTime: 30 * 1000, // 30 seconds for admin data
  });
};

export const useUserById = (userId: string) => {
  return useQuery({
    queryKey: ['users', 'admin', 'detail', userId],
    queryFn: () => userApiService.getUserById(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useUserStatistics = (period?: string) => {
  return useQuery({
    queryKey: ['users', 'admin', 'statistics', period],
    queryFn: () => userApiService.getUserStatistics(period),
    staleTime: 5 * 60 * 1000,
  });
};

// Mutation Hooks
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updates: Partial<User>) => userApiService.updateProfile(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CURRENT_USER] });
    },
  });
};

export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (avatar: File) => userApiService.updateAvatar(avatar),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CURRENT_USER] });
    },
  });
};

export const useRemoveAvatar = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => userApiService.removeAvatar(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CURRENT_USER] });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (passwordData: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }) => userApiService.changePassword(passwordData),
  });
};

export const useUpdateEmail = () => {
  return useMutation({
    mutationFn: ({ newEmail, password }: { newEmail: string; password: string }) => 
      userApiService.updateEmail(newEmail, password),
  });
};

export const useVerifyEmailChange = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (token: string) => userApiService.verifyEmailChange(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CURRENT_USER] });
    },
  });
};

// Address Mutations
export const useAddAddress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (address: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => 
      userApiService.addAddress(address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.USER_ADDRESSES] });
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ addressId, updates }: { addressId: string; updates: Partial<Address> }) => 
      userApiService.updateAddress(addressId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.USER_ADDRESSES] });
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (addressId: string) => userApiService.deleteAddress(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.USER_ADDRESSES] });
    },
  });
};

export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ addressId, type }: { addressId: string; type: 'shipping' | 'billing' }) => 
      userApiService.setDefaultAddress(addressId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.USER_ADDRESSES] });
    },
  });
};

// Preferences Mutations
export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (preferences: {
      notifications?: {
        email?: boolean;
        sms?: boolean;
        push?: boolean;
        marketing?: boolean;
        orderUpdates?: boolean;
        productRecommendations?: boolean;
      };
      privacy?: {
        profileVisibility?: 'public' | 'private';
        showPurchaseHistory?: boolean;
        allowRecommendations?: boolean;
      };
      language?: string;
      currency?: string;
      timezone?: string;
    }) => userApiService.updatePreferences(preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.USER_PREFERENCES] });
    },
  });
};

// Security Mutations
export const useRevokeSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sessionId: string) => userApiService.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'sessions'] });
    },
  });
};

export const useRevokeAllSessions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => userApiService.revokeAllSessions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'sessions'] });
    },
  });
};

export const useEnableTwoFactor = () => {
  return useMutation({
    mutationFn: () => userApiService.enableTwoFactor(),
  });
};

export const useVerifyTwoFactor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (token: string) => userApiService.verifyTwoFactor(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CURRENT_USER] });
    },
  });
};

export const useDisableTwoFactor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (password: string) => userApiService.disableTwoFactor(password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CURRENT_USER] });
    },
  });
};

// Data Export Mutations
export const useExportUserData = () => {
  return useMutation({
    mutationFn: () => userApiService.exportUserData(),
  });
};

export const useRequestAccountDeletion = () => {
  return useMutation({
    mutationFn: ({ reason, password }: { reason: string; password: string }) => 
      userApiService.requestAccountDeletion(reason, password),
  });
};

export const useCancelAccountDeletion = () => {
  return useMutation({
    mutationFn: () => userApiService.cancelAccountDeletion(),
  });
};

// Admin Mutation Hooks
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: Partial<User> }) => 
      userApiService.updateUser(userId, updates),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['users', 'admin'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'admin', 'detail', userId] });
    },
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, status, reason }: { 
      userId: string; 
      status: 'active' | 'inactive' | 'banned'; 
      reason?: string; 
    }) => userApiService.updateUserStatus(userId, status, reason),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['users', 'admin'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'admin', 'detail', userId] });
    },
  });
};

export const useResetUserPassword = () => {
  return useMutation({
    mutationFn: (userId: string) => userApiService.resetUserPassword(userId),
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) => 
      userApiService.updateUserRole(userId, role),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['users', 'admin'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'admin', 'detail', userId] });
    },
  });
};

export const useBulkUpdateUsers = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userIds, updates }: {
      userIds: string[];
      updates: {
        status?: 'active' | 'inactive' | 'banned';
        role?: string;
      };
    }) => userApiService.bulkUpdateUsers(userIds, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'admin'] });
    },
  });
};

export const useSendNotification = () => {
  return useMutation({
    mutationFn: ({ userId, notification }: {
      userId: string;
      notification: {
        title: string;
        message: string;
        type: 'info' | 'warning' | 'success' | 'error';
        actionUrl?: string;
      };
    }) => userApiService.sendNotification(userId, notification),
  });
};

export const useImpersonateUser = () => {
  return useMutation({
    mutationFn: (userId: string) => userApiService.impersonateUser(userId),
  });
};

export const useStopImpersonation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => userApiService.stopImpersonation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CURRENT_USER] });
    },
  });
};

export default userApiService;
