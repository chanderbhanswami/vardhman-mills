/**
 * AuthGuard Component - Vardhman Mills Frontend
 * 
 * Protects routes by checking authentication status and redirecting
 * unauthenticated users to login page.
 */

'use client';

import React, { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// Types
interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRoles?: string[];
  requireVerifiedEmail?: boolean;
  fallbackUrl?: string;
  loadingComponent?: ReactNode;
  unauthorizedComponent?: ReactNode;
  redirectTo?: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isEmailVerified: boolean;
  permissions?: string[];
}

// Loading component
const DefaultLoadingComponent = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="inline-block"
      >
        <Loader2 className="h-8 w-8 text-blue-600" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-4 text-gray-600"
      >
        Verifying authentication...
      </motion.p>
    </div>
  </div>
);

// Unauthorized component
const DefaultUnauthorizedComponent = ({ 
  message = "You don't have permission to access this page." 
}: { 
  message?: string 
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center max-w-md mx-auto px-6"
    >
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.history.back()}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors"
        >
          Go Back
        </motion.button>
      </div>
    </motion.div>
  </div>
);

/**
 * AuthGuard Component
 * 
 * Provides authentication and authorization protection for routes.
 * Supports role-based access control, email verification requirements,
 * and custom fallback components.
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  requiredRoles = [],
  requireVerifiedEmail = false,
  fallbackUrl = '/auth/login',
  loadingComponent,
  unauthorizedComponent,
  redirectTo
}) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  const user = session?.user as User | undefined;

  useEffect(() => {
    // Don't redirect if we're still loading
    if (status === 'loading') return;

    // If authentication is not required, allow access
    if (!requireAuth) return;

    // If no session and auth is required, redirect to login
    if (!session) {
      const currentPath = pathname ? encodeURIComponent(pathname) : '';
      const loginUrl = `${fallbackUrl}?redirect=${currentPath}`;
      
      toast.error('Please log in to access this page');
      router.push(loginUrl);
      return;
    }

    // Check email verification if required
    if (requireVerifiedEmail && !user?.isEmailVerified) {
      toast.error('Please verify your email address');
      router.push('/auth/verify-email');
      return;
    }

    // Check role requirements
    if (requiredRoles.length > 0 && user?.role) {
      const hasRequiredRole = requiredRoles.includes(user.role);
      if (!hasRequiredRole) {
        toast.error('You don\'t have permission to access this page');
        router.push(redirectTo || '/dashboard');
        return;
      }
    }
  }, [
    session, 
    status, 
    requireAuth, 
    requiredRoles, 
    requireVerifiedEmail, 
    fallbackUrl, 
    redirectTo,
    router, 
    pathname, 
    user
  ]);

  // Show loading while checking auth status
  if (status === 'loading') {
    return loadingComponent || <DefaultLoadingComponent />;
  }

  // If auth is not required, render children
  if (!requireAuth) {
    return <>{children}</>;
  }

  // If no session and auth is required, show loading (redirect will happen)
  if (!session) {
    return loadingComponent || <DefaultLoadingComponent />;
  }

  // Check email verification
  if (requireVerifiedEmail && !user?.isEmailVerified) {
    return unauthorizedComponent || (
      <DefaultUnauthorizedComponent 
        message="Please verify your email address to access this page." 
      />
    );
  }

  // Check role requirements
  if (requiredRoles.length > 0 && user?.role) {
    const hasRequiredRole = requiredRoles.includes(user.role);
    if (!hasRequiredRole) {
      return unauthorizedComponent || (
        <DefaultUnauthorizedComponent 
          message={`This page requires ${requiredRoles.join(' or ')} role access.`}
        />
      );
    }
  }

  // All checks passed, render children
  return <>{children}</>;
};

/**
 * Higher-order component for protecting pages
 */
export const withAuthGuard = <P extends object>(
  Component: React.ComponentType<P>,
  guardProps?: Omit<AuthGuardProps, 'children'>
) => {
  const ProtectedComponent = (props: P) => (
    <AuthGuard {...guardProps}>
      <Component {...props} />
    </AuthGuard>
  );
  
  ProtectedComponent.displayName = `withAuthGuard(${Component.displayName || Component.name})`;
  
  return ProtectedComponent;
};

/**
 * Hook for checking authentication status and permissions
 */
export const useAuthGuard = () => {
  const { data: session, status } = useSession();
  const user = session?.user as User | undefined;

  const checkPermission = (requiredRoles: string[]): boolean => {
    if (!user?.role) return false;
    return requiredRoles.includes(user.role);
  };

  const checkEmailVerification = (): boolean => {
    return user?.isEmailVerified || false;
  };

  const isAuthenticated = status === 'authenticated' && !!session;
  const isLoading = status === 'loading';

  return {
    user,
    isAuthenticated,
    isLoading,
    checkPermission,
    checkEmailVerification,
    session,
    status
  };
};

// Export types
export type { AuthGuardProps, User };

export default AuthGuard;
