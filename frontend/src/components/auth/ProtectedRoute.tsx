/**
 * ProtectedRoute Component - Vardhman Mills Frontend
 * 
 * Higher-order component and wrapper for protecting routes
 * based on authentication status and user roles.
 */

'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, AlertCircle, Loader2 } from 'lucide-react';

// Types
interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  permissions?: string[];
  emailVerified?: boolean;
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Require authentication */
  requireAuth?: boolean;
  /** Required user roles */
  requiredRoles?: string[];
  /** Required permissions */
  requiredPermissions?: string[];
  /** Require email verification */
  requireEmailVerification?: boolean;
  /** Redirect URL for unauthenticated users */
  redirectTo?: string;
  /** Redirect URL for unauthorized users */
  unauthorizedRedirect?: string;
  /** Custom loading component */
  loadingComponent?: React.ReactNode;
  /** Custom unauthorized component */
  unauthorizedComponent?: React.ReactNode;
  /** Custom unverified email component */
  unverifiedEmailComponent?: React.ReactNode;
  /** Fallback redirect */
  fallbackRedirect?: string;
}

interface RouteConfig {
  path: string;
  requireAuth?: boolean;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  requireEmailVerification?: boolean;
  redirectTo?: string;
}

// Route configurations
const ROUTE_CONFIGS: Record<string, RouteConfig> = {
  '/dashboard': {
    path: '/dashboard',
    requireAuth: true,
    requireEmailVerification: true
  },
  '/admin': {
    path: '/admin',
    requireAuth: true,
    requiredRoles: ['admin'],
    requireEmailVerification: true
  },
  '/profile': {
    path: '/profile',
    requireAuth: true,
    requireEmailVerification: true
  },
  '/settings': {
    path: '/settings',
    requireAuth: true,
    requireEmailVerification: true
  },
  '/orders': {
    path: '/orders',
    requireAuth: true,
    requireEmailVerification: true
  }
};

/**
 * Default loading component
 */
const DefaultLoadingComponent: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center"
    >
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading...</h3>
      <p className="text-gray-600">Please wait while we verify your access</p>
    </motion.div>
  </div>
);

/**
 * Default unauthorized component
 */
const DefaultUnauthorizedComponent: React.FC<{ 
  message?: string; 
  onBack?: () => void 
}> = ({ 
  message = "You don't have permission to access this page", 
  onBack 
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md w-full text-center"
    >
      <div className="bg-white rounded-2xl shadow-xl px-8 py-10">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-red-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-8">{message}</p>
        
        <div className="space-y-4">
          {onBack && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onBack}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Go Back
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.href = '/'}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Return Home
          </motion.button>
        </div>
      </div>
    </motion.div>
  </div>
);

/**
 * Default unverified email component
 */
const DefaultUnverifiedEmailComponent: React.FC<{
  email?: string;
  onResendVerification?: () => void;
}> = ({ email, onResendVerification }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md w-full text-center"
    >
      <div className="bg-white rounded-2xl shadow-xl px-8 py-10">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-yellow-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Verification Required</h2>
        <p className="text-gray-600 mb-2">
          Please verify your email address to continue.
        </p>
        {email && (
          <p className="text-sm text-gray-500 mb-8">
            We sent a verification link to <strong>{email}</strong>
          </p>
        )}
        
        <div className="space-y-4">
          {onResendVerification && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onResendVerification}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Resend Verification Email
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.href = '/auth/logout'}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Sign Out
          </motion.button>
        </div>
      </div>
    </motion.div>
  </div>
);

/**
 * ProtectedRoute Component
 * 
 * Wraps components that require authentication or specific permissions.
 * Handles loading states, authentication checks, and redirects.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requiredRoles = [],
  requiredPermissions = [],
  requireEmailVerification = false,
  redirectTo = '/auth/login',
  // unauthorizedRedirect = '/unauthorized', // Currently unused
  loadingComponent,
  unauthorizedComponent,
  unverifiedEmailComponent
  // fallbackRedirect = '/' // Currently unused
}) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Show loading state
  if (status === 'loading') {
    return loadingComponent || <DefaultLoadingComponent />;
  }

  // Check authentication requirement
  if (requireAuth && status === 'unauthenticated') {
    const currentPath = window.location.pathname;
    const loginUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
    router.push(loginUrl);
    return loadingComponent || <DefaultLoadingComponent />;
  }

  // If authentication is not required, render children
  if (!requireAuth) {
    return <>{children}</>;
  }

  // At this point, user must be authenticated
  const user = session?.user as User;

  // Check email verification requirement
  if (requireEmailVerification && !user?.emailVerified) {
    const handleResendVerification = async () => {
      try {
        const response = await fetch('/api/auth/resend-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email })
        });

        if (response.ok) {
          alert('Verification email sent!');
        } else {
          alert('Failed to send verification email');
        }
      } catch {
        alert('Error sending verification email');
      }
    };

    return (
      unverifiedEmailComponent || 
      <DefaultUnverifiedEmailComponent 
        email={user?.email}
        onResendVerification={handleResendVerification}
      />
    );
  }

  // Check role requirements
  if (requiredRoles.length > 0) {
    const userRole = user?.role;
    const hasRequiredRole = userRole && requiredRoles.includes(userRole);
    
    if (!hasRequiredRole) {
      const handleBack = () => router.back();
      
      return (
        unauthorizedComponent || 
        <DefaultUnauthorizedComponent 
          message={`This page requires ${requiredRoles.join(' or ')} access`}
          onBack={handleBack}
        />
      );
    }
  }

  // Check permission requirements
  if (requiredPermissions.length > 0) {
    const userPermissions = user?.permissions || [];
    const hasAllPermissions = requiredPermissions.every(
      permission => userPermissions.includes(permission)
    );
    
    if (!hasAllPermissions) {
      const missingPermissions = requiredPermissions.filter(
        permission => !userPermissions.includes(permission)
      );
      
      const handleBack = () => router.back();
      
      return (
        unauthorizedComponent || 
        <DefaultUnauthorizedComponent 
          message={`Missing required permissions: ${missingPermissions.join(', ')}`}
          onBack={handleBack}
        />
      );
    }
  }

  // All checks passed, render children
  return <>{children}</>;
};

/**
 * Higher-order component for protecting routes
 */
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) {
  const ProtectedComponent: React.FC<P> = (props) => {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };

  ProtectedComponent.displayName = `withProtectedRoute(${Component.displayName || Component.name})`;

  return ProtectedComponent;
}

/**
 * Hook for checking user permissions
 */
export const usePermissions = () => {
  const { data: session, status } = useSession();
  const user = session?.user as User;

  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  const hasRoles = (roles: string[]): boolean => {
    return user?.role ? roles.includes(user.role) : false;
  };

  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) || false;
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    const userPermissions = user?.permissions || [];
    return permissions.every(permission => userPermissions.includes(permission));
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    const userPermissions = user?.permissions || [];
    return permissions.some(permission => userPermissions.includes(permission));
  };

  const isAuthenticated = status === 'authenticated';
  const isEmailVerified = user?.emailVerified || false;

  return {
    user,
    isAuthenticated,
    isEmailVerified,
    hasRole,
    hasRoles,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    isLoading: status === 'loading'
  };
};

/**
 * Route protection utility
 */
export const createProtectedRoute = (config: RouteConfig) => {
  return (Component: React.ComponentType) => {
    return withProtectedRoute(Component, {
      requireAuth: config.requireAuth,
      requiredRoles: config.requiredRoles,
      requiredPermissions: config.requiredPermissions,
      requireEmailVerification: config.requireEmailVerification,
      redirectTo: config.redirectTo
    });
  };
};

/**
 * Get route configuration by path
 */
export const getRouteConfig = (path: string): RouteConfig | null => {
  return ROUTE_CONFIGS[path] || null;
};

/**
 * Check if current route requires protection
 */
export const isProtectedRoute = (path: string): boolean => {
  const config = getRouteConfig(path);
  return config?.requireAuth || false;
};

/**
 * Conditional render component based on permissions
 */
export const PermissionGate: React.FC<{
  children: React.ReactNode;
  roles?: string[];
  permissions?: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}> = ({
  children,
  roles = [],
  permissions = [],
  requireAll = true,
  fallback = null
}) => {
  const { hasRoles, hasAllPermissions, hasAnyPermission } = usePermissions();

  // Check roles
  if (roles.length > 0 && !hasRoles(roles)) {
    return <>{fallback}</>;
  }

  // Check permissions
  if (permissions.length > 0) {
    const hasPerms = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
    
    if (!hasPerms) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

// Export types
export type { 
  ProtectedRouteProps, 
  User,
  RouteConfig 
};

export default ProtectedRoute;
