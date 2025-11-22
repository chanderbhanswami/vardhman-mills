import { HttpClient } from './client';
import { endpoints } from './endpoints';
import { 
  User, 
  ApiResponse
} from './types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CACHE_KEYS } from './config';

/**
 * Authentication API Service
 * Handles user authentication, registration, password reset, and session management
 */

class AuthApiService {
  private client: HttpClient;

  constructor() {
    this.client = new HttpClient();
  }

  // User Registration
  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    phoneNumber?: string;
    acceptTerms: boolean;
    acceptMarketing?: boolean;
  }): Promise<ApiResponse<{
    user: User;
    token: string;
    refreshToken: string;
    expiresIn: number;
  }>> {
    return this.client.post<{
      user: User;
      token: string;
      refreshToken: string;
      expiresIn: number;
    }>(endpoints.auth.register, userData);
  }

  // User Login
  async login(credentials: {
    email: string;
    password: string;
    rememberMe?: boolean;
    twoFactorCode?: string;
  }): Promise<ApiResponse<{
    user: User;
    token: string;
    refreshToken: string;
    expiresIn: number;
    requiresTwoFactor?: boolean;
    twoFactorToken?: string;
  }>> {
    return this.client.post<{
      user: User;
      token: string;
      refreshToken: string;
      expiresIn: number;
      requiresTwoFactor?: boolean;
      twoFactorToken?: string;
    }>(endpoints.auth.login, credentials);
  }

  // Admin Login
  async adminLogin(credentials: {
    email: string;
    password: string;
    twoFactorCode?: string;
  }): Promise<ApiResponse<{
    user: User;
    token: string;
    refreshToken: string;
    expiresIn: number;
    requiresTwoFactor?: boolean;
    twoFactorToken?: string;
  }>> {
    return this.client.post<{
      user: User;
      token: string;
      refreshToken: string;
      expiresIn: number;
      requiresTwoFactor?: boolean;
      twoFactorToken?: string;
    }>(endpoints.auth.adminLogin, credentials);
  }

  // Social Login (Google, Facebook, etc.)
  async socialLogin(provider: string, token: string): Promise<ApiResponse<{
    user: User;
    token: string;
    refreshToken: string;
    expiresIn: number;
    isNewUser: boolean;
  }>> {
    return this.client.post<{
      user: User;
      token: string;
      refreshToken: string;
      expiresIn: number;
      isNewUser: boolean;
    }>(endpoints.auth.socialLogin(provider), { token });
  }

  // Logout
  async logout(): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>(endpoints.auth.logout);
  }

  // Refresh Token
  async refreshToken(refreshToken: string): Promise<ApiResponse<{
    token: string;
    refreshToken: string;
    expiresIn: number;
  }>> {
    return this.client.post<{
      token: string;
      refreshToken: string;
      expiresIn: number;
    }>(endpoints.auth.refresh, { refreshToken });
  }

  // Verify Email
  async verifyEmail(token: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>(endpoints.auth.verifyEmail, { token });
  }

  // Resend Verification Email
  async resendVerification(email: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>(endpoints.auth.resendVerification, { email });
  }

  // Forgot Password
  async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>(endpoints.auth.forgotPassword, { email });
  }

  // Reset Password
  async resetPassword(resetData: {
    token: string;
    password: string;
    confirmPassword: string;
  }): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>(endpoints.auth.resetPassword, resetData);
  }

  // Validate Reset Token
  async validateResetToken(token: string): Promise<ApiResponse<{
    valid: boolean;
    email?: string;
    expiresAt?: string;
  }>> {
    return this.client.get<{
      valid: boolean;
      email?: string;
      expiresAt?: string;
    }>(endpoints.auth.validateResetToken(token));
  }

  // Two-Factor Authentication Login
  async verifyTwoFactor(twoFactorData: {
    twoFactorToken: string;
    code: string;
    rememberDevice?: boolean;
  }): Promise<ApiResponse<{
    user: User;
    token: string;
    refreshToken: string;
    expiresIn: number;
  }>> {
    return this.client.post<{
      user: User;
      token: string;
      refreshToken: string;
      expiresIn: number;
    }>(endpoints.auth.twoFactor.verify, twoFactorData);
  }

  // Use Backup Code for Two-Factor
  async useTwoFactorBackup(backupData: {
    twoFactorToken: string;
    backupCode: string;
  }): Promise<ApiResponse<{
    user: User;
    token: string;
    refreshToken: string;
    expiresIn: number;
  }>> {
    return this.client.post<{
      user: User;
      token: string;
      refreshToken: string;
      expiresIn: number;
    }>(endpoints.auth.twoFactor.backup, backupData);
  }

  // Check Authentication Status
  async checkAuthStatus(): Promise<ApiResponse<{
    isAuthenticated: boolean;
    user?: User;
    tokenExpiry?: string;
  }>> {
    return this.client.get<{
      isAuthenticated: boolean;
      user?: User;
      tokenExpiry?: string;
    }>(endpoints.auth.me);
  }

  // Get Current User (same as checkAuthStatus but cleaner for user profile)
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.client.get<User>(endpoints.auth.me);
  }

  // Update Session Activity
  async updateActivity(): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>(endpoints.auth.activity);
  }

  // Guest to User Conversion
  async convertGuestToUser(conversionData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    phoneNumber?: string;
    guestToken?: string;
  }): Promise<ApiResponse<{
    user: User;
    token: string;
    refreshToken: string;
    expiresIn: number;
  }>> {
    return this.client.post<{
      user: User;
      token: string;
      refreshToken: string;
      expiresIn: number;
    }>(endpoints.auth.convertGuest, conversionData);
  }

  // Generate Guest Token
  async generateGuestToken(): Promise<ApiResponse<{ 
    guestToken: string; 
    expiresIn: number; 
  }>> {
    return this.client.post<{ 
      guestToken: string; 
      expiresIn: number; 
    }>(endpoints.auth.guest);
  }

  // Password Strength Check
  async checkPasswordStrength(password: string): Promise<ApiResponse<{
    score: number;
    feedback: string[];
    isStrong: boolean;
  }>> {
    return this.client.post<{
      score: number;
      feedback: string[];
      isStrong: boolean;
    }>(endpoints.auth.passwordStrength, { password });
  }

  // Check Email Availability
  async checkEmailAvailability(email: string): Promise<ApiResponse<{
    available: boolean;
    suggestions?: string[];
  }>> {
    return this.client.post<{
      available: boolean;
      suggestions?: string[];
    }>(endpoints.auth.checkEmail, { email });
  }

  // Get Account Recovery Options
  async getRecoveryOptions(email: string): Promise<ApiResponse<{
    options: Array<{
      type: 'email' | 'phone' | 'security_questions';
      masked: string;
      available: boolean;
    }>;
  }>> {
    return this.client.post<{
      options: Array<{
        type: 'email' | 'phone' | 'security_questions';
        masked: string;
        available: boolean;
      }>;
    }>(endpoints.auth.recoveryOptions, { email });
  }

  // Device Management
  async getTrustedDevices(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    type: string;
    lastUsed: string;
    location: string;
    isCurrent: boolean;
  }>>> {
    return this.client.get<Array<{
      id: string;
      name: string;
      type: string;
      lastUsed: string;
      location: string;
      isCurrent: boolean;
    }>>(endpoints.auth.devices);
  }

  // Remove Trusted Device
  async removeTrustedDevice(deviceId: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(endpoints.auth.removeDevice(deviceId));
  }

  // Clear All Trusted Devices
  async clearAllTrustedDevices(): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>(endpoints.auth.clearDevices);
  }

  // Session Management
  async getAllSessions(): Promise<ApiResponse<Array<{
    id: string;
    deviceInfo: string;
    ipAddress: string;
    location: string;
    userAgent: string;
    isCurrent: boolean;
    lastActive: string;
    createdAt: string;
  }>>> {
    return this.client.get<Array<{
      id: string;
      deviceInfo: string;
      ipAddress: string;
      location: string;
      userAgent: string;
      isCurrent: boolean;
      lastActive: string;
      createdAt: string;
    }>>(endpoints.auth.sessions);
  }

  // Terminate Session
  async terminateSession(sessionId: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(endpoints.auth.terminateSession(sessionId));
  }

  // Terminate All Sessions
  async terminateAllSessions(): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>(endpoints.auth.terminateAllSessions);
  }

  // Account Lockout Status
  async getAccountLockoutStatus(email: string): Promise<ApiResponse<{
    isLocked: boolean;
    lockoutExpiry?: string;
    attemptCount: number;
    maxAttempts: number;
  }>> {
    return this.client.post<{
      isLocked: boolean;
      lockoutExpiry?: string;
      attemptCount: number;
      maxAttempts: number;
    }>(endpoints.auth.lockoutStatus, { email });
  }

  // Admin Operations
  
  // Admin: Get Authentication Statistics
  async getAuthStatistics(period?: string): Promise<ApiResponse<{
    totalUsers: number;
    activeUsers: number;
    newRegistrations: number;
    loginAttempts: number;
    successfulLogins: number;
    failedLogins: number;
    lockedAccounts: number;
    twoFactorEnabled: number;
    socialLogins: Record<string, number>;
    loginsByDay: Array<{ date: string; count: number }>;
    registrationsByDay: Array<{ date: string; count: number }>;
  }>> {
    const params = period ? { period } : {};
    return this.client.get<{
      totalUsers: number;
      activeUsers: number;
      newRegistrations: number;
      loginAttempts: number;
      successfulLogins: number;
      failedLogins: number;
      lockedAccounts: number;
      twoFactorEnabled: number;
      socialLogins: Record<string, number>;
      loginsByDay: Array<{ date: string; count: number }>;
      registrationsByDay: Array<{ date: string; count: number }>;
    }>(endpoints.auth.admin.statistics, { params });
  }

  // Admin: Unlock Account
  async unlockAccount(userId: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>(endpoints.auth.admin.unlockAccount(userId));
  }

  // Admin: Force Logout User
  async forceLogoutUser(userId: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>(endpoints.auth.admin.forceLogout(userId));
  }

  // Admin: Reset User Password
  async adminResetPassword(userId: string, sendEmail: boolean = true): Promise<ApiResponse<{
    temporaryPassword?: string;
    message: string;
  }>> {
    return this.client.post<{
      temporaryPassword?: string;
      message: string;
    }>(endpoints.auth.admin.resetPassword(userId), { sendEmail });
  }

  // Admin: Disable Two-Factor
  async adminDisableTwoFactor(userId: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>(endpoints.auth.admin.disableTwoFactor(userId));
  }
}

// Create service instance
const authApiService = new AuthApiService();

// React Query Hooks

// Authentication Status
export const useAuth = () => {
  return useQuery({
    queryKey: [CACHE_KEYS.CURRENT_USER],
    queryFn: () => authApiService.checkAuthStatus(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry auth failures
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: [CACHE_KEYS.CURRENT_USER, 'profile'],
    queryFn: () => authApiService.getCurrentUser(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
};

// Device Management
export const useTrustedDevices = () => {
  return useQuery({
    queryKey: ['auth', 'devices'],
    queryFn: () => authApiService.getTrustedDevices(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useAuthSessions = () => {
  return useQuery({
    queryKey: ['auth', 'sessions'],
    queryFn: () => authApiService.getAllSessions(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Admin Hooks
export const useAuthStatistics = (period?: string) => {
  return useQuery({
    queryKey: ['auth', 'admin', 'statistics', period],
    queryFn: () => authApiService.getAuthStatistics(period),
    staleTime: 5 * 60 * 1000,
  });
};

// Mutation Hooks

// Registration & Login
export const useRegister = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      confirmPassword: string;
      phoneNumber?: string;
      acceptTerms: boolean;
      acceptMarketing?: boolean;
    }) => authApiService.register(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CURRENT_USER] });
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (credentials: {
      email: string;
      password: string;
      rememberMe?: boolean;
      twoFactorCode?: string;
    }) => authApiService.login(credentials),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CURRENT_USER] });
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CART] });
    },
  });
};

export const useAdminLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (credentials: {
      email: string;
      password: string;
      twoFactorCode?: string;
    }) => authApiService.adminLogin(credentials),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CURRENT_USER] });
    },
  });
};

export const useSocialLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ provider, token }: { provider: string; token: string }) => 
      authApiService.socialLogin(provider, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CURRENT_USER] });
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CART] });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => authApiService.logout(),
    onSuccess: () => {
      queryClient.clear(); // Clear all cached data on logout
    },
  });
};

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: (refreshToken: string) => authApiService.refreshToken(refreshToken),
  });
};

// Email Verification
export const useVerifyEmail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (token: string) => authApiService.verifyEmail(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CURRENT_USER] });
    },
  });
};

export const useResendVerification = () => {
  return useMutation({
    mutationFn: (email: string) => authApiService.resendVerification(email),
  });
};

// Password Reset
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => authApiService.forgotPassword(email),
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (resetData: {
      token: string;
      password: string;
      confirmPassword: string;
    }) => authApiService.resetPassword(resetData),
  });
};

export const useValidateResetToken = (token: string) => {
  return useQuery({
    queryKey: ['auth', 'validate-reset-token', token],
    queryFn: () => authApiService.validateResetToken(token),
    enabled: !!token,
    staleTime: 0, // Always fresh
    retry: false,
  });
};

// Two-Factor Authentication
export const useVerifyTwoFactor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (twoFactorData: {
      twoFactorToken: string;
      code: string;
      rememberDevice?: boolean;
    }) => authApiService.verifyTwoFactor(twoFactorData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CURRENT_USER] });
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CART] });
    },
  });
};

export const useTwoFactorBackup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (backupData: {
      twoFactorToken: string;
      backupCode: string;
    }) => authApiService.useTwoFactorBackup(backupData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CURRENT_USER] });
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CART] });
    },
  });
};

// Guest Conversion
export const useConvertGuestToUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (conversionData: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      confirmPassword: string;
      phoneNumber?: string;
      guestToken?: string;
    }) => authApiService.convertGuestToUser(conversionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CURRENT_USER] });
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CART] });
    },
  });
};

export const useGenerateGuestToken = () => {
  return useMutation({
    mutationFn: () => authApiService.generateGuestToken(),
  });
};

// Utility Hooks
export const useCheckPasswordStrength = () => {
  return useMutation({
    mutationFn: (password: string) => authApiService.checkPasswordStrength(password),
  });
};

export const useCheckEmailAvailability = () => {
  return useMutation({
    mutationFn: (email: string) => authApiService.checkEmailAvailability(email),
  });
};

export const useGetRecoveryOptions = () => {
  return useMutation({
    mutationFn: (email: string) => authApiService.getRecoveryOptions(email),
  });
};

export const useGetAccountLockoutStatus = () => {
  return useMutation({
    mutationFn: (email: string) => authApiService.getAccountLockoutStatus(email),
  });
};

// Device Management Mutations
export const useRemoveTrustedDevice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (deviceId: string) => authApiService.removeTrustedDevice(deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'devices'] });
    },
  });
};

export const useClearAllTrustedDevices = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => authApiService.clearAllTrustedDevices(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'devices'] });
    },
  });
};

// Session Management Mutations
export const useTerminateSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sessionId: string) => authApiService.terminateSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'sessions'] });
    },
  });
};

export const useTerminateAllSessions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => authApiService.terminateAllSessions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'sessions'] });
      queryClient.clear(); // Clear all data as all sessions are terminated
    },
  });
};

// Admin Mutation Hooks
export const useUnlockAccount = () => {
  return useMutation({
    mutationFn: (userId: string) => authApiService.unlockAccount(userId),
  });
};

export const useForceLogoutUser = () => {
  return useMutation({
    mutationFn: (userId: string) => authApiService.forceLogoutUser(userId),
  });
};

export const useAdminResetPassword = () => {
  return useMutation({
    mutationFn: ({ userId, sendEmail }: { userId: string; sendEmail?: boolean }) => 
      authApiService.adminResetPassword(userId, sendEmail),
  });
};

export const useAdminDisableTwoFactor = () => {
  return useMutation({
    mutationFn: (userId: string) => authApiService.adminDisableTwoFactor(userId),
  });
};

export default authApiService;
