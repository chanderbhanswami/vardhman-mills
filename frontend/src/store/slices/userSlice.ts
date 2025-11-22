import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types/user.types';
import { PaginationMeta } from '@/types';

// Enhanced user interface
export interface UserProfile {
  // Basic User properties
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  avatar?: string;
  createdAt: string;
  
  // Additional profile properties
  addresses: Address[];
  preferences: UserPreferences;
  socialConnections: SocialConnection[];
  activityLog: ActivityLogEntry[];
  paymentMethods: PaymentMethod[];
  subscriptions: Subscription[];
}

// Address interface
export interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// User preferences interface
export interface UserPreferences {
  language: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  notifications: {
    email: {
      orderUpdates: boolean;
      promotions: boolean;
      newsletter: boolean;
      priceAlerts: boolean;
      stockAlerts: boolean;
      reviews: boolean;
    };
    push: {
      orderUpdates: boolean;
      promotions: boolean;
      priceAlerts: boolean;
      stockAlerts: boolean;
    };
    sms: {
      orderUpdates: boolean;
      promotions: boolean;
    };
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showActivityStatus: boolean;
    allowDataCollection: boolean;
    allowPersonalizedAds: boolean;
  };
  shopping: {
    defaultShippingAddress?: string;
    defaultBillingAddress?: string;
    defaultPaymentMethod?: string;
    saveShippingInfo: boolean;
    savePaymentInfo: boolean;
    autoApplyCoupons: boolean;
  };
}

// Social connection interface
export interface SocialConnection {
  provider: 'google' | 'facebook' | 'twitter' | 'apple' | 'github';
  providerId: string;
  email?: string;
  name?: string;
  avatar?: string;
  connected: boolean;
  connectedAt: string;
}

// Activity log interface
export interface ActivityLogEntry {
  id: string;
  type: 'login' | 'logout' | 'order' | 'review' | 'wishlist' | 'profile_update' | 'password_change';
  description: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

// Payment method interface
export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'digital_wallet';
  name: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  brand?: string;
  isDefault: boolean;
  createdAt: string;
}

// Subscription interface
export interface Subscription {
  id: string;
  type: 'newsletter' | 'premium' | 'notifications' | 'catalog';
  status: 'active' | 'inactive' | 'paused';
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
  preferences?: Record<string, unknown>;
}

// User filters interface
export interface UserFilters {
  status?: 'active' | 'inactive' | 'suspended';
  role?: string[];
  registrationDate?: {
    start: string;
    end: string;
  };
  lastActivity?: {
    start: string;
    end: string;
  };
  sortBy?: 'name' | 'email' | 'registrationDate' | 'lastActivity';
  sortOrder?: 'asc' | 'desc';
}

// Async thunks for user operations
export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (userId?: string) => {
    const url = userId ? `/api/users/${userId}` : '/api/user/profile';
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    return response.json();
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (profileData: Partial<UserProfile>) => {
    const response = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update profile');
    }
    
    return response.json();
  }
);

export const changePassword = createAsyncThunk(
  'user/changePassword',
  async (passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    const response = await fetch('/api/user/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(passwordData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to change password');
    }
    
    return response.json();
  }
);

export const addAddress = createAsyncThunk(
  'user/addAddress',
  async (addressData: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await fetch('/api/user/addresses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(addressData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add address');
    }
    
    return response.json();
  }
);

export const updateAddress = createAsyncThunk(
  'user/updateAddress',
  async (params: { addressId: string; addressData: Partial<Address> }) => {
    const response = await fetch(`/api/user/addresses/${params.addressId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params.addressData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update address');
    }
    
    return response.json();
  }
);

export const deleteAddress = createAsyncThunk(
  'user/deleteAddress',
  async (addressId: string) => {
    const response = await fetch(`/api/user/addresses/${addressId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete address');
    }
    
    return { addressId };
  }
);

export const addPaymentMethod = createAsyncThunk(
  'user/addPaymentMethod',
  async (paymentData: Omit<PaymentMethod, 'id' | 'createdAt'>) => {
    const response = await fetch('/api/user/payment-methods', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add payment method');
    }
    
    return response.json();
  }
);

export const deletePaymentMethod = createAsyncThunk(
  'user/deletePaymentMethod',
  async (paymentMethodId: string) => {
    const response = await fetch(`/api/user/payment-methods/${paymentMethodId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete payment method');
    }
    
    return { paymentMethodId };
  }
);

export const connectSocialAccount = createAsyncThunk(
  'user/connectSocialAccount',
  async (connectionData: {
    provider: SocialConnection['provider'];
    authCode: string;
  }) => {
    const response = await fetch('/api/user/social/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(connectionData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to connect social account');
    }
    
    return response.json();
  }
);

export const disconnectSocialAccount = createAsyncThunk(
  'user/disconnectSocialAccount',
  async (provider: SocialConnection['provider']) => {
    const response = await fetch(`/api/user/social/disconnect/${provider}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to disconnect social account');
    }
    
    return { provider };
  }
);

export const updatePreferences = createAsyncThunk(
  'user/updatePreferences',
  async (preferences: Partial<UserPreferences>) => {
    const response = await fetch('/api/user/preferences', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update preferences');
    }
    
    return response.json();
  }
);

export const fetchActivityLog = createAsyncThunk(
  'user/fetchActivityLog',
  async (params: { page?: number; limit?: number } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(`/api/user/activity?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch activity log');
    }
    
    return response.json();
  }
);

export const deleteAccount = createAsyncThunk(
  'user/deleteAccount',
  async (confirmation: { password: string; reason?: string }) => {
    const response = await fetch('/api/user/delete-account', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(confirmation),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete account');
    }
    
    return response.json();
  }
);

export const uploadAvatar = createAsyncThunk(
  'user/uploadAvatar',
  async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch('/api/user/avatar', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload avatar');
    }
    
    return response.json();
  }
);

interface UserState {
  // Current user
  profile: UserProfile | null;
  isAuthenticated: boolean;
  
  // User management (for admin)
  users: User[];
  pagination: PaginationMeta;
  filters: UserFilters;
  
  // Activity and history
  activityLog: ActivityLogEntry[];
  activityPagination: PaginationMeta;
  
  // Loading states
  isLoading: boolean;
  isUpdatingProfile: boolean;
  isChangingPassword: boolean;
  isUploadingAvatar: boolean;
  isLoadingActivity: boolean;
  isDeletingAccount: boolean;
  
  // Error states
  error: string | null;
  profileError: string | null;
  passwordError: string | null;
  uploadError: string | null;
  
  // UI states
  showProfileSettings: boolean;
  showAddressForm: boolean;
  showPaymentForm: boolean;
  editingAddress: string | null;
  
  // Session and security
  sessionExpiry: number | null;
  lastActivity: number;
  securityAlerts: Array<{
    id: string;
    type: 'password_change' | 'login_location' | 'new_device' | 'suspicious_activity';
    message: string;
    timestamp: number;
    acknowledged: boolean;
  }>;
  
  // Cache
  lastProfileFetch: number;
  profileCache: Record<string, { user: UserProfile; timestamp: number }>;
}

const initialState: UserState = {
  profile: null,
  isAuthenticated: false,
  users: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  filters: {
    sortBy: 'registrationDate',
    sortOrder: 'desc',
  },
  activityLog: [],
  activityPagination: {
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  isLoading: false,
  isUpdatingProfile: false,
  isChangingPassword: false,
  isUploadingAvatar: false,
  isLoadingActivity: false,
  isDeletingAccount: false,
  error: null,
  profileError: null,
  passwordError: null,
  uploadError: null,
  showProfileSettings: false,
  showAddressForm: false,
  showPaymentForm: false,
  editingAddress: null,
  sessionExpiry: null,
  lastActivity: Date.now(),
  securityAlerts: [],
  lastProfileFetch: 0,
  profileCache: {},
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Authentication
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
      if (!action.payload) {
        state.profile = null;
        state.sessionExpiry = null;
      }
    },
    
    setSessionExpiry: (state, action: PayloadAction<number>) => {
      state.sessionExpiry = action.payload;
    },
    
    updateLastActivity: (state) => {
      state.lastActivity = Date.now();
    },
    
    // Profile management
    updateProfileField: (state, action: PayloadAction<{ field: keyof UserProfile; value: unknown }>) => {
      if (state.profile) {
        const { field, value } = action.payload;
        (state.profile as Record<string, unknown>)[field] = value;
      }
    },
    
    // Address management
    setEditingAddress: (state, action: PayloadAction<string | null>) => {
      state.editingAddress = action.payload;
    },
    
    setDefaultAddress: (state, action: PayloadAction<string>) => {
      if (state.profile?.addresses) {
        state.profile.addresses.forEach(address => {
          address.isDefault = address.id === action.payload;
        });
      }
    },
    
    // Payment method management
    setDefaultPaymentMethod: (state, action: PayloadAction<string>) => {
      if (state.profile?.paymentMethods) {
        state.profile.paymentMethods.forEach(method => {
          method.isDefault = method.id === action.payload;
        });
      }
    },
    
    // UI state management
    setShowProfileSettings: (state, action: PayloadAction<boolean>) => {
      state.showProfileSettings = action.payload;
    },
    
    setShowAddressForm: (state, action: PayloadAction<boolean>) => {
      state.showAddressForm = action.payload;
    },
    
    setShowPaymentForm: (state, action: PayloadAction<boolean>) => {
      state.showPaymentForm = action.payload;
    },
    
    toggleProfileSettings: (state) => {
      state.showProfileSettings = !state.showProfileSettings;
    },
    
    // Filter management
    setUserFilters: (state, action: PayloadAction<UserFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearUserFilters: (state) => {
      state.filters = {
        sortBy: 'registrationDate',
        sortOrder: 'desc',
      };
    },
    
    // Clear user data (logout)
    clearUser: (state) => {
      state.profile = null;
      state.isAuthenticated = false;
      state.sessionExpiry = null;
      state.lastActivity = 0;
      state.activityLog = [];
      state.securityAlerts = [];
      state.isLoading = false;
      state.error = null;
    },
    
    // Security alerts
    addSecurityAlert: (state, action: PayloadAction<{
      type: UserState['securityAlerts'][0]['type'];
      message: string;
    }>) => {
      const alert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        acknowledged: false,
        ...action.payload,
      };
      state.securityAlerts.unshift(alert);
      
      // Keep only last 20 alerts
      if (state.securityAlerts.length > 20) {
        state.securityAlerts = state.securityAlerts.slice(0, 20);
      }
    },
    
    acknowledgeSecurityAlert: (state, action: PayloadAction<string>) => {
      const alert = state.securityAlerts.find(a => a.id === action.payload);
      if (alert) {
        alert.acknowledged = true;
      }
    },
    
    clearSecurityAlerts: (state) => {
      state.securityAlerts = [];
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null;
      state.profileError = null;
      state.passwordError = null;
      state.uploadError = null;
    },
    
    // Cache management
    invalidateProfileCache: (state) => {
      state.lastProfileFetch = 0;
      state.profileCache = {};
    },
    
    // Activity log
    addActivityLogEntry: (state, action: PayloadAction<ActivityLogEntry>) => {
      state.activityLog.unshift(action.payload);
      
      // Keep only last 100 entries
      if (state.activityLog.length > 100) {
        state.activityLog = state.activityLog.slice(0, 100);
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch user profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.profileError = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        const userProfile = action.payload.user || action.payload;
        state.profile = userProfile;
        state.isAuthenticated = true;
        state.lastProfileFetch = Date.now();
        
        // Cache the profile
        if (userProfile?.id) {
          state.profileCache[userProfile.id] = {
            user: userProfile,
            timestamp: Date.now(),
          };
        }
        
        state.profileError = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.profileError = action.error.message || 'Failed to fetch user profile';
      });

    // Update user profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.isUpdatingProfile = true;
        state.profileError = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isUpdatingProfile = false;
        const updatedProfile = action.payload.user || action.payload;
        
        if (state.profile) {
          state.profile = { ...state.profile, ...updatedProfile };
        }
        
        state.profileError = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isUpdatingProfile = false;
        state.profileError = action.error.message || 'Failed to update profile';
      });

    // Change password
    builder
      .addCase(changePassword.pending, (state) => {
        state.isChangingPassword = true;
        state.passwordError = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isChangingPassword = false;
        state.passwordError = null;
        
        // Add security alert
        const alert = {
          id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'password_change' as const,
          message: 'Your password was successfully changed',
          timestamp: Date.now(),
          acknowledged: false,
        };
        state.securityAlerts.unshift(alert);
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isChangingPassword = false;
        state.passwordError = action.error.message || 'Failed to change password';
      });

    // Add address
    builder
      .addCase(addAddress.fulfilled, (state, action) => {
        const newAddress = action.payload.address || action.payload;
        if (state.profile) {
          state.profile.addresses = state.profile.addresses || [];
          state.profile.addresses.push(newAddress);
        }
        state.showAddressForm = false;
      });

    // Update address
    builder
      .addCase(updateAddress.fulfilled, (state, action) => {
        const updatedAddress = action.payload.address || action.payload;
        if (state.profile?.addresses) {
          const index = state.profile.addresses.findIndex(
            addr => addr.id === updatedAddress.id
          );
          if (index !== -1) {
            state.profile.addresses[index] = { ...state.profile.addresses[index], ...updatedAddress };
          }
        }
        state.editingAddress = null;
      });

    // Delete address
    builder
      .addCase(deleteAddress.fulfilled, (state, action) => {
        const { addressId } = action.payload;
        if (state.profile?.addresses) {
          state.profile.addresses = state.profile.addresses.filter(
            addr => addr.id !== addressId
          );
        }
      });

    // Add payment method
    builder
      .addCase(addPaymentMethod.fulfilled, (state, action) => {
        const newPaymentMethod = action.payload.paymentMethod || action.payload;
        if (state.profile) {
          state.profile.paymentMethods = state.profile.paymentMethods || [];
          state.profile.paymentMethods.push(newPaymentMethod);
        }
        state.showPaymentForm = false;
      });

    // Delete payment method
    builder
      .addCase(deletePaymentMethod.fulfilled, (state, action) => {
        const { paymentMethodId } = action.payload;
        if (state.profile?.paymentMethods) {
          state.profile.paymentMethods = state.profile.paymentMethods.filter(
            method => method.id !== paymentMethodId
          );
        }
      });

    // Connect social account
    builder
      .addCase(connectSocialAccount.fulfilled, (state, action) => {
        const connection = action.payload.connection || action.payload;
        if (state.profile) {
          state.profile.socialConnections = state.profile.socialConnections || [];
          const existingIndex = state.profile.socialConnections.findIndex(
            conn => conn.provider === connection.provider
          );
          
          if (existingIndex !== -1) {
            state.profile.socialConnections[existingIndex] = connection;
          } else {
            state.profile.socialConnections.push(connection);
          }
        }
      });

    // Disconnect social account
    builder
      .addCase(disconnectSocialAccount.fulfilled, (state, action) => {
        const { provider } = action.payload;
        if (state.profile?.socialConnections) {
          const connection = state.profile.socialConnections.find(
            conn => conn.provider === provider
          );
          if (connection) {
            connection.connected = false;
          }
        }
      });

    // Update preferences
    builder
      .addCase(updatePreferences.fulfilled, (state, action) => {
        const updatedPreferences = action.payload.preferences || action.payload;
        if (state.profile) {
          state.profile.preferences = { ...state.profile.preferences, ...updatedPreferences };
        }
      });

    // Fetch activity log
    builder
      .addCase(fetchActivityLog.pending, (state) => {
        state.isLoadingActivity = true;
      })
      .addCase(fetchActivityLog.fulfilled, (state, action) => {
        state.isLoadingActivity = false;
        state.activityLog = action.payload.activities || action.payload.data || [];
        state.activityPagination = action.payload.pagination || state.activityPagination;
      })
      .addCase(fetchActivityLog.rejected, (state, action) => {
        state.isLoadingActivity = false;
        state.error = action.error.message || 'Failed to fetch activity log';
      });

    // Upload avatar
    builder
      .addCase(uploadAvatar.pending, (state) => {
        state.isUploadingAvatar = true;
        state.uploadError = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.isUploadingAvatar = false;
        const { avatarUrl } = action.payload;
        
        if (state.profile) {
          state.profile.avatar = avatarUrl;
        }
        
        state.uploadError = null;
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.isUploadingAvatar = false;
        state.uploadError = action.error.message || 'Failed to upload avatar';
      });

    // Delete account
    builder
      .addCase(deleteAccount.pending, (state) => {
        state.isDeletingAccount = true;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.isDeletingAccount = false;
        state.profile = null;
        state.isAuthenticated = false;
        state.sessionExpiry = null;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.isDeletingAccount = false;
        state.error = action.error.message || 'Failed to delete account';
      });
  },
});

export const {
  setAuthenticated,
  setSessionExpiry,
  updateLastActivity,
  updateProfileField,
  setEditingAddress,
  setDefaultAddress,
  setDefaultPaymentMethod,
  setShowProfileSettings,
  setShowAddressForm,
  setShowPaymentForm,
  toggleProfileSettings,
  setUserFilters,
  clearUserFilters,
  clearUser,
  addSecurityAlert,
  acknowledgeSecurityAlert,
  clearSecurityAlerts,
  clearError,
  invalidateProfileCache,
  addActivityLogEntry,
} = userSlice.actions;

// Selectors
export const selectUserProfile = (state: { user: UserState }) => state.user.profile;
export const selectIsAuthenticated = (state: { user: UserState }) => state.user.isAuthenticated;
export const selectUserAddresses = (state: { user: UserState }) => state.user.profile?.addresses || [];
export const selectUserPaymentMethods = (state: { user: UserState }) => state.user.profile?.paymentMethods || [];
export const selectUserPreferences = (state: { user: UserState }) => state.user.profile?.preferences;
export const selectUserLoyaltyProgram = (state: { user: UserState }) => state.user.profile?.loyaltyProgram;
export const selectActivityLog = (state: { user: UserState }) => state.user.activityLog;
export const selectSecurityAlerts = (state: { user: UserState }) => state.user.securityAlerts;
export const selectUserLoading = (state: { user: UserState }) => state.user.isLoading;
export const selectUserError = (state: { user: UserState }) => state.user.error;

// Complex selectors
export const selectDefaultAddress = (state: { user: UserState }) =>
  state.user.profile?.addresses?.find(addr => addr.isDefault);

export const selectDefaultPaymentMethod = (state: { user: UserState }) =>
  state.user.profile?.paymentMethods?.find(method => method.isDefault);

export const selectSocialConnections = (state: { user: UserState }) =>
  state.user.profile?.socialConnections || [];

export const selectConnectedSocialAccounts = (state: { user: UserState }) =>
  state.user.profile?.socialConnections?.filter(conn => conn.connected) || [];

export const selectUnacknowledgedSecurityAlerts = (state: { user: UserState }) =>
  state.user.securityAlerts.filter(alert => !alert.acknowledged);

export const selectUserStats = (state: { user: UserState }) => {
  const profile = state.user.profile;
  if (!profile) return null;

  return {
    totalAddresses: profile.addresses?.length || 0,
    totalPaymentMethods: profile.paymentMethods?.length || 0,
    totalSocialConnections: profile.socialConnections?.filter(conn => conn.connected).length || 0,
    loyaltyPoints: profile.loyaltyProgram?.points || 0,
    loyaltyTier: profile.loyaltyProgram?.tier || 'bronze',
    memberSince: profile.createdAt,
    lastActivity: state.user.lastActivity,
  };
};

export const selectSessionStatus = (state: { user: UserState }) => {
  const { sessionExpiry, lastActivity } = state.user;
  const now = Date.now();
  
  return {
    isExpired: sessionExpiry ? now > sessionExpiry : false,
    timeUntilExpiry: sessionExpiry ? Math.max(0, sessionExpiry - now) : null,
    timeSinceLastActivity: now - lastActivity,
    isActive: (now - lastActivity) < 5 * 60 * 1000, // Active if activity within last 5 minutes
  };
};

export default userSlice.reducer;
