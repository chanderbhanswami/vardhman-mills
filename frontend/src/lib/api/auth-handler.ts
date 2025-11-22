import { httpClient } from './client';
import { endpoints } from './endpoints';
import { ApiResponse, AuthResponse, LoginFormData, RegisterFormData, User } from './types';
import { handleApiError } from './error-handler';

/**
 * Authentication Handler
 * Manages user authentication, token handling, and auth-related operations
 */

export class AuthHandler {
  private user: User | null = null;
  private token: string | null = null;
  private refreshToken: string | null = null;
  private authListeners: ((user: User | null) => void)[] = [];

  constructor() {
    this.loadAuthFromStorage();
  }

  /**
   * Load authentication data from localStorage
   */
  private loadAuthFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('accessToken');
        const storedRefreshToken = localStorage.getItem('refreshToken');

        if (storedUser && storedToken) {
          this.user = JSON.parse(storedUser);
          this.token = storedToken;
          this.refreshToken = storedRefreshToken;
          httpClient.setToken(storedToken, storedRefreshToken || undefined);
        }
      } catch (error) {
        console.error('Failed to load auth from storage:', error);
        this.clearAuth();
      }
    }
  }

  /**
   * Save authentication data to localStorage
   */
  private saveAuthToStorage(user: User, token: string, refreshToken?: string): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('accessToken', token);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
      } catch (error) {
        console.error('Failed to save auth to storage:', error);
      }
    }
  }

  /**
   * Clear authentication data from localStorage
   */
  private clearAuthFromStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  /**
   * Set authentication data
   */
  private setAuth(user: User, token: string, refreshToken?: string): void {
    this.user = user;
    this.token = token;
    this.refreshToken = refreshToken || null;
    
    httpClient.setToken(token, refreshToken);
    this.saveAuthToStorage(user, token, refreshToken);
    this.notifyAuthListeners(user);
  }

  /**
   * Clear authentication data
   */
  private clearAuth(): void {
    this.user = null;
    this.token = null;
    this.refreshToken = null;
    
    httpClient.clearToken();
    this.clearAuthFromStorage();
    this.notifyAuthListeners(null);
  }

  /**
   * Notify auth state change listeners
   */
  private notifyAuthListeners(user: User | null): void {
    this.authListeners.forEach(callback => {
      try {
        callback(user);
      } catch (error) {
        console.error('Auth listener error:', error);
      }
    });
  }

  /**
   * Register a new user
   */
  public async register(userData: RegisterFormData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await httpClient.post<AuthResponse>(endpoints.auth.register, userData);
      
      if (response.data) {
        this.setAuth(response.data.user, response.data.token, response.data.refreshToken);
      }
      
      return response;
    } catch (error) {
      throw handleApiError(error, {
        context: { action: 'register', email: userData.email }
      });
    }
  }

  /**
   * Login user
   */
  public async login(credentials: LoginFormData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await httpClient.post<AuthResponse>(endpoints.auth.login, credentials);
      
      if (response.data) {
        this.setAuth(response.data.user, response.data.token, response.data.refreshToken);
      }
      
      return response;
    } catch (error) {
      throw handleApiError(error, {
        context: { action: 'login', email: credentials.email }
      });
    }
  }

  /**
   * Logout user
   */
  public async logout(): Promise<void> {
    try {
      if (this.token) {
        await httpClient.post(endpoints.auth.logout);
      }
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      this.clearAuth();
    }
  }

  /**
   * Refresh authentication token
   */
  public async refreshAuthToken(): Promise<ApiResponse<AuthResponse>> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await httpClient.post<AuthResponse>(endpoints.auth.refresh, {
        refreshToken: this.refreshToken
      });

      if (response.data) {
        this.setAuth(response.data.user, response.data.token, response.data.refreshToken);
      }

      return response;
    } catch (error) {
      this.clearAuth();
      throw handleApiError(error, {
        context: { action: 'refresh_token' }
      });
    }
  }

  /**
   * Forgot password
   */
  public async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    try {
      return await httpClient.post<{ message: string }>(endpoints.auth.forgotPassword, { email });
    } catch (error) {
      throw handleApiError(error, {
        context: { action: 'forgot_password', email }
      });
    }
  }

  /**
   * Reset password
   */
  public async resetPassword(
    token: string, 
    password: string
  ): Promise<ApiResponse<{ message: string }>> {
    try {
      return await httpClient.post<{ message: string }>(endpoints.auth.resetPassword, {
        token,
        password
      });
    } catch (error) {
      throw handleApiError(error, {
        context: { action: 'reset_password' }
      });
    }
  }

  /**
   * Update password
   */
  public async updatePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<{ message: string }>> {
    try {
      return await httpClient.post<{ message: string }>(endpoints.auth.updatePassword, {
        currentPassword,
        newPassword
      });
    } catch (error) {
      throw handleApiError(error, {
        context: { action: 'update_password' }
      });
    }
  }

  /**
   * Verify email address
   */
  public async verifyEmail(token: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await httpClient.post<{ message: string }>(endpoints.auth.verifyEmail, { token });
      
      // Refresh user data after email verification
      if (this.isAuthenticated()) {
        await this.refreshUserData();
      }
      
      return response;
    } catch (error) {
      throw handleApiError(error, {
        context: { action: 'verify_email' }
      });
    }
  }

  /**
   * Resend email verification
   */
  public async resendVerification(): Promise<ApiResponse<{ message: string }>> {
    try {
      return await httpClient.post<{ message: string }>(endpoints.auth.resendVerification);
    } catch (error) {
      throw handleApiError(error, {
        context: { action: 'resend_verification' }
      });
    }
  }

  /**
   * Check if email exists
   */
  public async checkEmail(email: string): Promise<ApiResponse<{ exists: boolean }>> {
    try {
      return await httpClient.post<{ exists: boolean }>(endpoints.auth.checkEmail, { email });
    } catch (error) {
      throw handleApiError(error, {
        context: { action: 'check_email', email }
      });
    }
  }

  /**
   * Social authentication (Google)
   */
  public async loginWithGoogle(token: string): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await httpClient.post<AuthResponse>(endpoints.auth.googleAuth, { token });
      
      if (response.data) {
        this.setAuth(response.data.user, response.data.token, response.data.refreshToken);
      }
      
      return response;
    } catch (error) {
      throw handleApiError(error, {
        context: { action: 'google_login' }
      });
    }
  }

  /**
   * Social authentication (Facebook)
   */
  public async loginWithFacebook(token: string): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await httpClient.post<AuthResponse>(endpoints.auth.facebookAuth, { token });
      
      if (response.data) {
        this.setAuth(response.data.user, response.data.token, response.data.refreshToken);
      }
      
      return response;
    } catch (error) {
      throw handleApiError(error, {
        context: { action: 'facebook_login' }
      });
    }
  }

  /**
   * Refresh user data
   */
  public async refreshUserData(): Promise<User | null> {
    if (!this.isAuthenticated()) {
      return null;
    }

    try {
      const response = await httpClient.get<User>(endpoints.users.me);
      
      if (response.data) {
        this.user = response.data;
        this.saveAuthToStorage(response.data, this.token!, this.refreshToken || undefined);
        this.notifyAuthListeners(response.data);
      }
      
      return response.data || null;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      return this.user;
    }
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return !!(this.user && this.token);
  }

  /**
   * Get current user
   */
  public getCurrentUser(): User | null {
    return this.user;
  }

  /**
   * Get current token
   */
  public getToken(): string | null {
    return this.token;
  }

  /**
   * Get refresh token
   */
  public getRefreshToken(): string | null {
    return this.refreshToken;
  }

  /**
   * Check if user has specific role
   */
  public hasRole(role: string): boolean {
    return this.user?.role === role;
  }

  /**
   * Check if user is admin
   */
  public isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Check if user is moderator
   */
  public isModerator(): boolean {
    return this.hasRole('moderator') || this.isAdmin();
  }

  /**
   * Check if user email is verified
   */
  public isEmailVerified(): boolean {
    return this.user?.isVerified || false;
  }

  /**
   * Add auth state change listener
   */
  public onAuthStateChange(callback: (user: User | null) => void): () => void {
    this.authListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.authListeners.indexOf(callback);
      if (index > -1) {
        this.authListeners.splice(index, 1);
      }
    };
  }

  /**
   * Remove all auth state change listeners
   */
  public clearAuthListeners(): void {
    this.authListeners = [];
  }

  /**
   * Force refresh of authentication state
   */
  public async refreshAuth(): Promise<void> {
    if (this.token) {
      try {
        await this.refreshUserData();
      } catch (error) {
        console.error('Failed to refresh auth:', error);
        this.clearAuth();
      }
    }
  }

  /**
   * Get authentication headers for manual requests
   */
  public getAuthHeaders(): Record<string, string> {
    if (this.token) {
      return {
        'Authorization': `Bearer ${this.token}`
      };
    }
    return {};
  }

  /**
   * Validate token expiration (basic check)
   */
  public isTokenExpired(): boolean {
    if (!this.token) return true;

    try {
      // Basic JWT payload extraction (without verification)
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      return payload.exp ? payload.exp < currentTime : false;
    } catch (error) {
      console.error('Failed to parse token:', error);
      return true;
    }
  }

  /**
   * Auto-refresh token if needed
   */
  public async ensureValidToken(): Promise<string | null> {
    if (!this.token) return null;

    if (this.isTokenExpired() && this.refreshToken) {
      try {
        await this.refreshAuthToken();
        return this.token;
      } catch (error) {
        console.error('Failed to refresh token:', error);
        this.clearAuth();
        return null;
      }
    }

    return this.token;
  }
}

// Create and export singleton instance
export const authHandler = new AuthHandler();

// Export hooks for React components
export const useAuth = () => {
  return {
    user: authHandler.getCurrentUser(),
    token: authHandler.getToken(),
    isAuthenticated: authHandler.isAuthenticated(),
    isEmailVerified: authHandler.isEmailVerified(),
    hasRole: authHandler.hasRole.bind(authHandler),
    isAdmin: authHandler.isAdmin.bind(authHandler),
    isModerator: authHandler.isModerator.bind(authHandler),
    login: authHandler.login.bind(authHandler),
    register: authHandler.register.bind(authHandler),
    logout: authHandler.logout.bind(authHandler),
    refreshAuth: authHandler.refreshAuth.bind(authHandler),
    onAuthStateChange: authHandler.onAuthStateChange.bind(authHandler),
  };
};

export default authHandler;
