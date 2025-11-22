/**
 * GuestGuard Component - Vardhman Mills Frontend
 * 
 * Protects routes by redirecting authenticated users away from guest-only pages
 * (like login, register, forgot password, etc.)
 */

'use client';

import React, { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle } from 'lucide-react';

// Types
interface GuestGuardProps {
  children: ReactNode;
  redirectTo?: string;
  loadingComponent?: ReactNode;
  message?: string;
  allowPartialAuth?: boolean; // Allow users who are logged in but not fully verified
}

interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isEmailVerified?: boolean;
  role?: string;
}

// Loading component for guest guard
const DefaultGuestLoadingComponent = () => (
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
        Checking authentication status...
      </motion.p>
    </div>
  </div>
);

// Redirect component
const RedirectComponent = ({ 
  message = "You're already logged in! Redirecting..." 
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
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Already Authenticated</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex items-center justify-center">
          <Loader2 className="h-5 w-5 text-blue-600 animate-spin mr-2" />
          <span className="text-blue-600">Redirecting...</span>
        </div>
      </div>
    </motion.div>
  </div>
);

/**
 * GuestGuard Component
 * 
 * Protects guest-only routes by redirecting authenticated users.
 * Useful for login, register, forgot password pages where 
 * authenticated users shouldn't have access.
 */
export const GuestGuard: React.FC<GuestGuardProps> = ({
  children,
  redirectTo = '/dashboard',
  loadingComponent,
  message = "You're already logged in! Redirecting...",
  allowPartialAuth = false
}) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while loading
    if (status === 'loading') return;

    // If user is authenticated, redirect them
    if (session) {
      // Check if we should allow partially authenticated users
      if (allowPartialAuth) {
        const user = session.user as SessionUser;
        // Allow if user exists but email is not verified
        if (user && !user.isEmailVerified) {
          return; // Don't redirect, allow access
        }
      }

      // Redirect authenticated users
      router.push(redirectTo);
    }
  }, [session, status, router, redirectTo, allowPartialAuth]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return loadingComponent || <DefaultGuestLoadingComponent />;
  }

  // If authenticated and we don't allow partial auth, show redirect message
  if (session && !allowPartialAuth) {
    return <RedirectComponent message={message} />;
  }

  // If authenticated but we allow partial auth, check verification status
  if (session && allowPartialAuth) {
    const user = session.user as SessionUser;
    if (user?.isEmailVerified) {
      return <RedirectComponent message={message} />;
    }
  }

  // User is not authenticated or is allowed partial access, show children
  return <>{children}</>;
};

/**
 * Higher-order component for protecting guest-only pages
 */
export const withGuestGuard = <P extends object>(
  Component: React.ComponentType<P>,
  guardProps?: Omit<GuestGuardProps, 'children'>
) => {
  const ProtectedComponent = (props: P) => (
    <GuestGuard {...guardProps}>
      <Component {...props} />
    </GuestGuard>
  );
  
  ProtectedComponent.displayName = `withGuestGuard(${Component.displayName || Component.name})`;
  
  return ProtectedComponent;
};

/**
 * Hook for checking guest status
 */
export const useGuestGuard = () => {
  const { data: session, status } = useSession();

  const isGuest = status === 'unauthenticated' || !session;
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated' && !!session;

  const shouldRedirect = (allowPartialAuth = false) => {
    if (!session) return false;
    
    if (allowPartialAuth) {
      const user = session.user as SessionUser;
      return user?.isEmailVerified;
    }
    
    return true;
  };

  return {
    isGuest,
    isAuthenticated,
    isLoading,
    shouldRedirect,
    session,
    status
  };
};

/**
 * Auth Route Wrapper Component
 * 
 * Combines AuthGuard and GuestGuard logic for flexible routing
 */
interface AuthRouteWrapperProps {
  children: ReactNode;
  requireAuth?: boolean;
  guestOnly?: boolean;
  redirectTo?: string;
  allowPartialAuth?: boolean;
  loadingComponent?: ReactNode;
}

export const AuthRouteWrapper: React.FC<AuthRouteWrapperProps> = ({
  children,
  guestOnly = false,
  redirectTo,
  allowPartialAuth = false,
  loadingComponent
}) => {
  // If both are specified, prioritize guest-only
  if (guestOnly) {
    return (
      <GuestGuard
        redirectTo={redirectTo}
        allowPartialAuth={allowPartialAuth}
        loadingComponent={loadingComponent}
      >
        {children}
      </GuestGuard>
    );
  }

  // If requireAuth is true, we'd need to import and use AuthGuard
  // For now, just return children if no specific guard is needed
  return <>{children}</>;
};

/**
 * Route protection configuration
 */
export const ROUTE_CONFIG = {
  // Guest-only routes (redirect authenticated users)
  GUEST_ONLY: [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password'
  ],
  
  // Routes that allow partial authentication (unverified users)
  PARTIAL_AUTH_ALLOWED: [
    '/auth/verify-email',
    '/auth/resend-verification'
  ],
  
  // Protected routes (require full authentication)
  PROTECTED: [
    '/dashboard',
    '/profile',
    '/orders',
    '/wishlist',
    '/settings'
  ],
  
  // Admin routes (require specific roles)
  ADMIN: [
    '/admin',
    '/admin/dashboard',
    '/admin/users',
    '/admin/products'
  ]
} as const;

/**
 * Helper function to check if a route should be guest-only
 */
export const isGuestOnlyRoute = (pathname: string): boolean => {
  return ROUTE_CONFIG.GUEST_ONLY.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
};

/**
 * Helper function to check if partial auth is allowed
 */
export const isPartialAuthAllowed = (pathname: string): boolean => {
  return ROUTE_CONFIG.PARTIAL_AUTH_ALLOWED.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
};

/**
 * Helper function to check if a route is protected
 */
export const isProtectedRoute = (pathname: string): boolean => {
  return ROUTE_CONFIG.PROTECTED.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
};

/**
 * Helper function to check if a route requires admin access
 */
export const isAdminRoute = (pathname: string): boolean => {
  return ROUTE_CONFIG.ADMIN.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
};

// Export types
export type { GuestGuardProps, AuthRouteWrapperProps };

export default GuestGuard;
