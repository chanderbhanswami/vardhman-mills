import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware() {
    // Add any additional middleware logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to login page without authentication
        if (req.nextUrl.pathname === '/login') {
          return true;
        }
        
        // Check if user has admin role for protected routes
        const hasValidToken = !!token;
        const hasAdminRole = token?.role === 'admin';
        
        return hasValidToken && hasAdminRole;
      },
    },
  }
);

export const config = {
  matcher: [
    // Protect all routes except login, api routes, static files
    '/((?!api|login|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};
