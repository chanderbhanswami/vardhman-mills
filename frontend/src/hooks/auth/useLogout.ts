import { useCallback, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import useAuth from './useAuth';

export interface LogoutOptions {
  everywhere?: boolean; // Logout from all devices
  showToast?: boolean;
  redirectTo?: string;
  clearLocalData?: boolean;
}

export interface LogoutState {
  isLoggingOut: boolean;
  isLoggingOutEverywhere: boolean;
  error: string | null;
}

export const useLogout = () => {
  const auth = useAuth();
  
  const [logoutState, setLogoutState] = useState<LogoutState>({
    isLoggingOut: false,
    isLoggingOutEverywhere: false,
    error: null,
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async (options: LogoutOptions = {}) => {
      // Call the logout method from useAuth
      if (options.everywhere) {
        setLogoutState(prev => ({ ...prev, isLoggingOutEverywhere: true }));
      } else {
        setLogoutState(prev => ({ ...prev, isLoggingOut: true }));
      }

      // The actual logout will be handled by useAuth
      auth.logout();
      
      return { success: true };
    },
    onSuccess: (data, variables) => {
      setLogoutState({
        isLoggingOut: false,
        isLoggingOutEverywhere: false,
        error: null,
      });

      if (variables && variables.showToast !== false) {
        const message = variables.everywhere 
          ? 'Successfully logged out from all devices'
          : 'Successfully logged out';
        toast.success(message);
      }

      // Redirect if specified
      if (variables && variables.redirectTo && typeof window !== 'undefined') {
        window.location.href = variables.redirectTo;
      }
    },
    onError: (error: Error) => {
      setLogoutState(prev => ({
        ...prev,
        isLoggingOut: false,
        isLoggingOutEverywhere: false,
        error: error.message,
      }));

      toast.error(error.message || 'Logout failed');
    },
  });

  // Logout function
  const logout = useCallback((options: LogoutOptions = {}) => {
    logoutMutation.mutate(options);
  }, [logoutMutation]);

  // Quick logout (no confirmation)
  const quickLogout = useCallback(() => {
    logout({ showToast: true });
  }, [logout]);

  // Logout everywhere
  const logoutEverywhere = useCallback(() => {
    logout({ everywhere: true, showToast: true });
  }, [logout]);

  // Silent logout (no toast)
  const silentLogout = useCallback(() => {
    logout({ showToast: false });
  }, [logout]);

  return {
    // State
    ...logoutState,
    
    // Actions
    logout,
    quickLogout,
    logoutEverywhere,
    silentLogout,
    
    // Auth state
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
  };
};

export default useLogout;
