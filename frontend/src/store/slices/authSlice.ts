import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UserTypes } from '@/types';

// Enhanced Auth Interfaces
interface AuthSession {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  ipAddress: string;
  location?: string;
  lastActiveAt: string;
  expiresAt: string;
  isActive: boolean;
}

interface TwoFactorAuth {
  isEnabled: boolean;
  method: 'sms' | 'email' | 'authenticator';
  backupCodes: string[];
  qrCodeUrl?: string;
  secret?: string;
}

interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'password_change' | 'email_change' | 'suspicious_activity' | 'device_added';
  description: string;
  ipAddress: string;
  location?: string;
  userAgent: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

interface LoginAttempt {
  id: string;
  email: string;
  ipAddress: string;
  success: boolean;
  timestamp: string;
  failureReason?: string;
  location?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  refreshExpiresIn: number;
}

interface SocialProvider {
  provider: 'google' | 'facebook' | 'apple' | 'twitter' | 'github';
  connected: boolean;
  email?: string;
  connectedAt?: string;
  lastUsedAt?: string;
}

interface AccountVerification {
  email: {
    verified: boolean;
    verifiedAt?: string;
    pendingEmail?: string;
    verificationSentAt?: string;
  };
  phone: {
    verified: boolean;
    verifiedAt?: string;
    pendingPhone?: string;
    verificationSentAt?: string;
  };
}

interface PasswordSecurity {
  lastChanged: string;
  strength: 'weak' | 'fair' | 'good' | 'strong';
  requiresChange: boolean;
  expiresAt?: string;
  history: string[];
}

interface AuthState {
  // Core Authentication
  user: UserTypes.User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Session Management
  currentSession: AuthSession | null;
  activeSessions: AuthSession[];
  sessionTimeout: number; // minutes
  sessionWarning: boolean;
  
  // Security Features
  twoFactor: TwoFactorAuth;
  trustedDevices: Array<{
    id: string;
    name: string;
    fingerprint: string;
    addedAt: string;
    lastUsedAt: string;
  }>;
  
  // Login Security
  loginAttempts: LoginAttempt[];
  isAccountLocked: boolean;
  lockoutExpiresAt?: string;
  maxLoginAttempts: number;
  lockoutDuration: number; // minutes
  
  // Password & Security
  passwordSecurity: PasswordSecurity | null;
  securityEvents: SecurityEvent[];
  
  // Account Status
  verification: AccountVerification;
  isActive: boolean;
  isSuspended: boolean;
  suspensionReason?: string;
  
  // Social Logins
  socialProviders: SocialProvider[];
  
  // Remember Me & Persistence
  rememberMe: boolean;
  autoLogin: boolean;
  
  // Registration & Onboarding
  registrationStep: 'idle' | 'details' | 'verification' | 'complete';
  onboardingCompleted: boolean;
  
  // User Preferences
  loginPreferences: {
    defaultLoginMethod: 'email' | 'phone' | 'social';
    requireTwoFactor: boolean;
    sessionDuration: number;
    logoutOnClose: boolean;
    notifySecurityEvents: boolean;
  };
  
  // UI State
  loginModalOpen: boolean;
  registerModalOpen: boolean;
  forgotPasswordModalOpen: boolean;
  twoFactorModalOpen: boolean;
  
  // Guest User Support
  guestSession: {
    id: string;
    cartId?: string;
    wishlistId?: string;
    preferences?: Record<string, unknown>;
    createdAt: string;
  } | null;
  
  // Account Recovery
  passwordReset: {
    isActive: boolean;
    email?: string;
    tokenSent: boolean;
    expiresAt?: string;
  };
  
  // Permissions and Roles
  permissions: string[];
  roles: string[];
  
  // Analytics
  loginStats: {
    lastLogin: string;
    loginCount: number;
    averageSessionDuration: number;
    preferredDevice: string;
    preferredLocation: string;
  } | null;
}

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  currentSession: null,
  activeSessions: [],
  sessionTimeout: 30,
  sessionWarning: false,
  twoFactor: {
    isEnabled: false,
    method: 'email',
    backupCodes: [],
  },
  trustedDevices: [],
  loginAttempts: [],
  isAccountLocked: false,
  maxLoginAttempts: 5,
  lockoutDuration: 15,
  passwordSecurity: null,
  securityEvents: [],
  verification: {
    email: { verified: false },
    phone: { verified: false },
  },
  isActive: true,
  isSuspended: false,
  socialProviders: [
    { provider: 'google', connected: false },
    { provider: 'facebook', connected: false },
    { provider: 'apple', connected: false },
    { provider: 'twitter', connected: false },
    { provider: 'github', connected: false },
  ],
  rememberMe: false,
  autoLogin: false,
  registrationStep: 'idle',
  onboardingCompleted: false,
  loginPreferences: {
    defaultLoginMethod: 'email',
    requireTwoFactor: false,
    sessionDuration: 60,
    logoutOnClose: false,
    notifySecurityEvents: true,
  },
  loginModalOpen: false,
  registerModalOpen: false,
  forgotPasswordModalOpen: false,
  twoFactorModalOpen: false,
  guestSession: null,
  passwordReset: {
    isActive: false,
    tokenSent: false,
  },
  permissions: [],
  roles: [],
  loginStats: null,
};

// Async Thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: {
    email: string;
    password: string;
    rememberMe?: boolean;
    twoFactorCode?: string;
    deviceFingerprint?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    acceptTerms: boolean;
    acceptMarketing?: boolean;
    referralCode?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Registration failed');
    }
  }
);

export const socialLogin = createAsyncThunk(
  'auth/socialLogin',
  async (data: {
    provider: 'google' | 'facebook' | 'apple' | 'twitter' | 'github';
    token: string;
    email?: string;
    name?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/social-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Social login failed');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Social login failed');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const refreshToken = state.auth.tokens?.refreshToken;
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      
      if (!response.ok) {
        throw new Error('Token refresh failed');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Token refresh failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (params: { allDevices?: boolean } = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.tokens?.accessToken;
      
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(params),
      });
      
      return { success: true };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Logout failed');
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Email verification failed');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Email verification failed');
    }
  }
);

export const requestPasswordReset = createAsyncThunk(
  'auth/requestPasswordReset',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Password reset request failed');
      }
      
      return { email };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Password reset request failed');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (data: {
    token: string;
    newPassword: string;
    confirmPassword: string;
  }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Password reset failed');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Password reset failed');
    }
  }
);

export const enable2FA = createAsyncThunk(
  'auth/enable2FA',
  async (data: {
    method: 'sms' | 'email' | 'authenticator';
    code: string;
  }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/enable-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '2FA setup failed');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '2FA setup failed');
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.tokens?.accessToken;
      
      const response = await fetch('/api/auth/profile', {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (updates: Partial<UserTypes.User>, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.tokens?.accessToken;
      
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Profile update failed');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Profile update failed');
    }
  }
);

export const fetchActiveSessions = createAsyncThunk(
  'auth/fetchActiveSessions',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.tokens?.accessToken;
      
      const response = await fetch('/api/auth/sessions', {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch sessions');
    }
  }
);

export const terminateSession = createAsyncThunk(
  'auth/terminateSession',
  async (sessionId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.tokens?.accessToken;
      
      const response = await fetch(`/api/auth/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to terminate session');
      }
      
      return sessionId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to terminate session');
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.tokens?.accessToken;
      
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Password change failed');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Password change failed');
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Legacy compatibility
    setCredentials: (state, action: PayloadAction<{ user: UserTypes.User; token: string }>) => {
      state.user = action.payload.user;
      state.tokens = {
        accessToken: action.payload.token,
        refreshToken: '',
        tokenType: 'Bearer',
        expiresIn: 3600,
        refreshExpiresIn: 86400,
      };
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
    
    setUser: (state, action: PayloadAction<UserTypes.User>) => {
      state.user = action.payload;
    },
    
    logout: (state) => {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.currentSession = null;
      state.guestSession = null;
      state.error = null;
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    // Enhanced functionality
    setTokens: (state, action: PayloadAction<AuthTokens>) => {
      state.tokens = action.payload;
      state.isAuthenticated = true;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    setSessionWarning: (state, action: PayloadAction<boolean>) => {
      state.sessionWarning = action.payload;
    },
    
    updateSessionTimeout: (state, action: PayloadAction<number>) => {
      state.sessionTimeout = action.payload;
    },
    
    setAccountLocked: (state, action: PayloadAction<{ locked: boolean; expiresAt?: string }>) => {
      state.isAccountLocked = action.payload.locked;
      state.lockoutExpiresAt = action.payload.expiresAt;
    },
    
    addLoginAttempt: (state, action: PayloadAction<LoginAttempt>) => {
      state.loginAttempts.unshift(action.payload);
      // Keep only last 10 attempts
      if (state.loginAttempts.length > 10) {
        state.loginAttempts = state.loginAttempts.slice(0, 10);
      }
    },
    
    addSecurityEvent: (state, action: PayloadAction<SecurityEvent>) => {
      state.securityEvents.unshift(action.payload);
      // Keep only last 50 events
      if (state.securityEvents.length > 50) {
        state.securityEvents = state.securityEvents.slice(0, 50);
      }
    },
    
    updateVerification: (state, action: PayloadAction<Partial<AccountVerification>>) => {
      state.verification = { ...state.verification, ...action.payload };
    },
    
    connectSocialProvider: (state, action: PayloadAction<{
      provider: SocialProvider['provider'];
      email?: string;
      connectedAt: string;
    }>) => {
      const providerIndex = state.socialProviders.findIndex(p => p.provider === action.payload.provider);
      if (providerIndex >= 0) {
        state.socialProviders[providerIndex] = {
          ...state.socialProviders[providerIndex],
          connected: true,
          email: action.payload.email,
          connectedAt: action.payload.connectedAt,
          lastUsedAt: action.payload.connectedAt,
        };
      }
    },
    
    disconnectSocialProvider: (state, action: PayloadAction<SocialProvider['provider']>) => {
      const providerIndex = state.socialProviders.findIndex(p => p.provider === action.payload);
      if (providerIndex >= 0) {
        state.socialProviders[providerIndex] = {
          ...state.socialProviders[providerIndex],
          connected: false,
          email: undefined,
          connectedAt: undefined,
          lastUsedAt: undefined,
        };
      }
    },
    
    setRegistrationStep: (state, action: PayloadAction<AuthState['registrationStep']>) => {
      state.registrationStep = action.payload;
    },
    
    setOnboardingCompleted: (state, action: PayloadAction<boolean>) => {
      state.onboardingCompleted = action.payload;
    },
    
    updateLoginPreferences: (state, action: PayloadAction<Partial<AuthState['loginPreferences']>>) => {
      state.loginPreferences = { ...state.loginPreferences, ...action.payload };
    },
    
    // Modal controls
    setLoginModalOpen: (state, action: PayloadAction<boolean>) => {
      state.loginModalOpen = action.payload;
    },
    
    setRegisterModalOpen: (state, action: PayloadAction<boolean>) => {
      state.registerModalOpen = action.payload;
    },
    
    setForgotPasswordModalOpen: (state, action: PayloadAction<boolean>) => {
      state.forgotPasswordModalOpen = action.payload;
    },
    
    setTwoFactorModalOpen: (state, action: PayloadAction<boolean>) => {
      state.twoFactorModalOpen = action.payload;
    },
    
    // Guest session
    createGuestSession: (state) => {
      state.guestSession = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
    },
    
    updateGuestSession: (state, action: PayloadAction<Partial<NonNullable<AuthState['guestSession']>>>) => {
      if (state.guestSession) {
        state.guestSession = { ...state.guestSession, ...action.payload };
      }
    },
    
    clearGuestSession: (state) => {
      state.guestSession = null;
    },
    
    // Password reset
    setPasswordResetActive: (state, action: PayloadAction<{
      email: string;
      expiresAt: string;
    }>) => {
      state.passwordReset = {
        isActive: true,
        email: action.payload.email,
        tokenSent: true,
        expiresAt: action.payload.expiresAt,
      };
    },
    
    clearPasswordReset: (state) => {
      state.passwordReset = {
        isActive: false,
        tokenSent: false,
      };
    },
    
    // Permissions and roles
    setPermissions: (state, action: PayloadAction<string[]>) => {
      state.permissions = action.payload;
    },
    
    setRoles: (state, action: PayloadAction<string[]>) => {
      state.roles = action.payload;
    },
    
    // Trusted devices
    addTrustedDevice: (state, action: PayloadAction<{
      id: string;
      name: string;
      fingerprint: string;
    }>) => {
      const now = new Date().toISOString();
      state.trustedDevices.push({
        ...action.payload,
        addedAt: now,
        lastUsedAt: now,
      });
    },
    
    removeTrustedDevice: (state, action: PayloadAction<string>) => {
      state.trustedDevices = state.trustedDevices.filter(device => device.id !== action.payload);
    },
    
    updateTrustedDeviceLastUsed: (state, action: PayloadAction<string>) => {
      const device = state.trustedDevices.find(d => d.id === action.payload);
      if (device) {
        device.lastUsedAt = new Date().toISOString();
      }
    },
    
    // Two-factor authentication
    update2FA: (state, action: PayloadAction<Partial<TwoFactorAuth>>) => {
      state.twoFactor = { ...state.twoFactor, ...action.payload };
    },
    
    // Account suspension
    setSuspended: (state, action: PayloadAction<{ suspended: boolean; reason?: string }>) => {
      state.isSuspended = action.payload.suspended;
      state.suspensionReason = action.payload.reason;
      if (action.payload.suspended) {
        state.isActive = false;
      }
    },
    
    // Remember me
    setRememberMe: (state, action: PayloadAction<boolean>) => {
      state.rememberMe = action.payload;
    },
    
    setAutoLogin: (state, action: PayloadAction<boolean>) => {
      state.autoLogin = action.payload;
    },
  },
  
  extraReducers: (builder) => {
    // Login user
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.currentSession = action.payload.session;
        state.rememberMe = action.payload.rememberMe || false;
        state.verification = action.payload.verification || state.verification;
        state.permissions = action.payload.permissions || [];
        state.roles = action.payload.roles || [];
        state.loginStats = action.payload.loginStats || null;
        
        // Add login attempt
        state.loginAttempts.unshift({
          id: Date.now().toString(),
          email: action.payload.user.email,
          ipAddress: action.payload.session?.ipAddress || '',
          success: true,
          timestamp: new Date().toISOString(),
        });
        
        // Reset lockout
        state.isAccountLocked = false;
        state.lockoutExpiresAt = undefined;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        
        // Handle account lockout
        if (action.payload === 'Account locked') {
          state.isAccountLocked = true;
          state.lockoutExpiresAt = new Date(Date.now() + state.lockoutDuration * 60000).toISOString();
        }
      })
    
    // Register user
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.registrationStep = 'details';
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.requiresVerification) {
          state.registrationStep = 'verification';
          state.verification.email.verificationSentAt = new Date().toISOString();
        } else {
          state.user = action.payload.user;
          state.tokens = action.payload.tokens;
          state.isAuthenticated = true;
          state.registrationStep = 'complete';
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.registrationStep = 'idle';
      })
    
    // Social login
      .addCase(socialLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(socialLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.currentSession = action.payload.session;
        
        // Update social provider
        const providerIndex = state.socialProviders.findIndex(p => p.provider === action.payload.provider);
        if (providerIndex >= 0) {
          state.socialProviders[providerIndex] = {
            ...state.socialProviders[providerIndex],
            connected: true,
            email: action.payload.user.email,
            lastUsedAt: new Date().toISOString(),
          };
        }
      })
      .addCase(socialLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
    
    // Refresh token
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.tokens = action.payload.tokens;
        state.user = action.payload.user || state.user;
      })
      .addCase(refreshToken.rejected, (state) => {
        // Token refresh failed, logout user
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
        state.currentSession = null;
        state.error = 'Session expired. Please login again.';
      })
    
    // Logout user
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
        state.currentSession = null;
        state.activeSessions = [];
        state.guestSession = null;
        state.sessionWarning = false;
        state.error = null;
      })
    
    // Verify email
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.verification.email.verified = true;
        state.verification.email.verifiedAt = new Date().toISOString();
        state.verification.email.pendingEmail = undefined;
        if (action.payload.user) {
          state.user = action.payload.user;
        }
        if (state.registrationStep === 'verification') {
          state.registrationStep = 'complete';
        }
      })
    
    // Request password reset
      .addCase(requestPasswordReset.fulfilled, (state, action) => {
        state.passwordReset = {
          isActive: true,
          email: action.payload.email,
          tokenSent: true,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
        };
        state.forgotPasswordModalOpen = false;
      })
    
    // Reset password
      .addCase(resetPassword.fulfilled, (state) => {
        state.passwordReset = {
          isActive: false,
          tokenSent: false,
        };
        state.passwordSecurity = {
          ...state.passwordSecurity!,
          lastChanged: new Date().toISOString(),
          requiresChange: false,
        };
      })
    
    // Enable 2FA
      .addCase(enable2FA.fulfilled, (state, action) => {
        state.twoFactor = {
          isEnabled: true,
          method: action.payload.method,
          backupCodes: action.payload.backupCodes,
          qrCodeUrl: action.payload.qrCodeUrl,
          secret: action.payload.secret,
        };
        state.twoFactorModalOpen = false;
      })
    
    // Fetch user profile
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.verification = action.payload.verification || state.verification;
        state.permissions = action.payload.permissions || [];
        state.roles = action.payload.roles || [];
      })
    
    // Update profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        if (state.user) {
          state.user = { ...state.user, ...action.payload };
        }
      })
    
    // Fetch active sessions
      .addCase(fetchActiveSessions.fulfilled, (state, action) => {
        state.activeSessions = action.payload.sessions;
      })
    
    // Terminate session
      .addCase(terminateSession.fulfilled, (state, action) => {
        state.activeSessions = state.activeSessions.filter(s => s.id !== action.payload);
      })
    
    // Change password
      .addCase(changePassword.fulfilled, (state) => {
        state.passwordSecurity = {
          ...state.passwordSecurity!,
          lastChanged: new Date().toISOString(),
          requiresChange: false,
        };
        
        // Add security event
        state.securityEvents.unshift({
          id: Date.now().toString(),
          type: 'password_change',
          description: 'Password changed successfully',
          ipAddress: '',
          timestamp: new Date().toISOString(),
          severity: 'low',
          userAgent: navigator.userAgent,
        });
      });
  },
});

export const {
  setCredentials,
  setUser,
  logout,
  setLoading,
  setTokens,
  setError,
  clearError,
  setSessionWarning,
  updateSessionTimeout,
  setAccountLocked,
  addLoginAttempt,
  addSecurityEvent,
  updateVerification,
  connectSocialProvider,
  disconnectSocialProvider,
  setRegistrationStep,
  setOnboardingCompleted,
  updateLoginPreferences,
  setLoginModalOpen,
  setRegisterModalOpen,
  setForgotPasswordModalOpen,
  setTwoFactorModalOpen,
  createGuestSession,
  updateGuestSession,
  clearGuestSession,
  setPasswordResetActive,
  clearPasswordReset,
  setPermissions,
  setRoles,
  addTrustedDevice,
  removeTrustedDevice,
  updateTrustedDeviceLastUsed,
  update2FA,
  setSuspended,
  setRememberMe,
  setAutoLogin,
} = authSlice.actions;

export default authSlice.reducer;