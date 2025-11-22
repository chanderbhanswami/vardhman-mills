import { NextAuthOptions } from 'next-auth';
import { authProviders } from './providers';
import { authCallbacks } from './callbacks';

/**
 * NextAuth Configuration
 * Main configuration file for NextAuth.js authentication
 */
export const authOptions: NextAuthOptions = {
  // Configure authentication providers
  providers: authProviders,

  // Configure authentication callbacks
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callbacks: authCallbacks as any,

  // JWT Configuration
  jwt: {
    // JWT expiration time (15 minutes)
    maxAge: 15 * 60, // 15 minutes
    
    // JWT secret (fallback to NEXTAUTH_SECRET)
    secret: process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET,
  },

  // Session Configuration
  session: {
    // Use JWT for session management
    strategy: 'jwt',
    
    // Session expiration time (7 days)
    maxAge: 7 * 24 * 60 * 60, // 7 days
    
    // Update session age on sign in
    updateAge: 24 * 60 * 60, // 1 day
  },

  // Pages Configuration
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user',
  },

  // Events Configuration
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log('User signed in:', {
        userId: user.id,
        email: user.email,
        provider: account?.provider,
        isNewUser,
      });

      // Track sign in event
      if (process.env.NODE_ENV === 'production') {
        try {
          await fetch(`${process.env.NEXTAUTH_URL}/api/analytics/signin`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              provider: account?.provider,
              isNewUser,
              timestamp: new Date().toISOString(),
            }),
          });
        } catch (error) {
          console.error('Failed to track signin event:', error);
        }
      }
    },

    async signOut({ session, token }) {
      console.log('User signed out:', {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userId: (session?.user as any)?.id || token?.sub,
      });

      // Track sign out event
      if (process.env.NODE_ENV === 'production') {
        try {
          await fetch(`${process.env.NEXTAUTH_URL}/api/analytics/signout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              userId: (session?.user as any)?.id || token?.sub,
              timestamp: new Date().toISOString(),
            }),
          });
        } catch (error) {
          console.error('Failed to track signout event:', error);
        }
      }
    },

    async createUser({ user }) {
      console.log('New user created:', {
        userId: user.id,
        email: user.email,
      });

      // Welcome new user
      try {
        await fetch(`${process.env.NEXTAUTH_URL}/api/users/welcome`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            email: user.email,
            name: user.name,
          }),
        });
      } catch (error) {
        console.error('Failed to send welcome message:', error);
      }
    },

    async updateUser({ user }) {
      console.log('User updated:', {
        userId: user.id,
        email: user.email,
      });
    },

    async linkAccount({ user, account }) {
      console.log('Account linked:', {
        userId: user.id,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
      });
    },

    async session({ session, token }) {
      // Session accessed event (can be used for analytics)
      if (process.env.NODE_ENV === 'development') {
        console.log('Session accessed:', {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          userId: (session.user as any)?.id || token?.sub,
          expires: session.expires,
        });
      }
    },
  },

  // Database Configuration (if using database adapter)
  // database: process.env.DATABASE_URL,

  // Adapter Configuration (if using database)
  // adapter: PrismaAdapter(prisma),

  // Security Configuration
  useSecureCookies: process.env.NODE_ENV === 'production',
  
  // Cookie Configuration
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token' 
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' 
          ? process.env.COOKIE_DOMAIN 
          : undefined,
      },
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.callback-url' 
        : 'next-auth.callback-url',
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' 
          ? process.env.COOKIE_DOMAIN 
          : undefined,
      },
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Host-next-auth.csrf-token' 
        : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  // Debug Configuration
  debug: process.env.NODE_ENV === 'development',

  // Logger Configuration
  logger: {
    error(code, metadata) {
      console.error('NextAuth Error:', code, metadata);
    },
    warn(code) {
      console.warn('NextAuth Warning:', code);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === 'development') {
        console.debug('NextAuth Debug:', code, metadata);
      }
    },
  },

  // Theme Configuration
  theme: {
    colorScheme: 'auto', // "auto" | "dark" | "light"
    brandColor: '#000000', // Hex color code
    logo: '/logo.png', // Absolute URL to image
    buttonText: '#ffffff', // Hex color code
  },

  // Secret Configuration
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Authentication helper functions
 */
export const AuthHelpers = {
  /**
   * Get authentication URL for provider
   */
  getAuthUrl(provider: string, callbackUrl?: string): string {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const callback = callbackUrl ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : '';
    return `${baseUrl}/api/auth/signin/${provider}?${callback}`;
  },

  /**
   * Get sign out URL
   */
  getSignOutUrl(callbackUrl?: string): string {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const callback = callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : '';
    return `${baseUrl}/api/auth/signout${callback}`;
  },

  /**
   * Check if provider is OAuth
   */
  isOAuthProvider(provider: string): boolean {
    const oauthProviders = ['google', 'facebook', 'github', 'linkedin'];
    return oauthProviders.includes(provider.toLowerCase());
  },

  /**
   * Get provider display name
   */
  getProviderDisplayName(provider: string): string {
    const displayNames: Record<string, string> = {
      google: 'Google',
      facebook: 'Facebook',
      github: 'GitHub',
      linkedin: 'LinkedIn',
      credentials: 'Email & Password',
      email: 'Email',
    };
    
    return displayNames[provider.toLowerCase()] || provider;
  },

  /**
   * Get provider icon
   */
  getProviderIcon(provider: string): string {
    const icons: Record<string, string> = {
      google: '🔍',
      facebook: '📘',
      github: '🐙',
      linkedin: '💼',
      credentials: '🔐',
      email: '📧',
    };
    
    return icons[provider.toLowerCase()] || '🔑';
  },
};

/**
 * Environment validation
 */
export function validateAuthEnvironment(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required environment variables
  if (!process.env.NEXTAUTH_SECRET) {
    errors.push('NEXTAUTH_SECRET is required');
  }

  if (!process.env.NEXTAUTH_URL) {
    warnings.push('NEXTAUTH_URL is not set, using default');
  }

  // OAuth provider validation
  const providers = ['GOOGLE', 'FACEBOOK', 'GITHUB', 'LINKEDIN'];
  providers.forEach(provider => {
    const clientId = process.env[`${provider}_CLIENT_ID`];
    const clientSecret = process.env[`${provider}_CLIENT_SECRET`];
    
    if (clientId && !clientSecret) {
      errors.push(`${provider}_CLIENT_SECRET is required when ${provider}_CLIENT_ID is set`);
    } else if (!clientId && clientSecret) {
      warnings.push(`${provider}_CLIENT_ID is not set but ${provider}_CLIENT_SECRET is provided`);
    }
  });

  // JWT secret validation
  if (!process.env.JWT_SECRET && !process.env.NEXTAUTH_SECRET) {
    errors.push('Either JWT_SECRET or NEXTAUTH_SECRET must be set');
  }

  // Production-specific validation
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.NEXTAUTH_URL?.startsWith('https://')) {
      errors.push('NEXTAUTH_URL must use HTTPS in production');
    }
    
    if (!process.env.COOKIE_DOMAIN) {
      warnings.push('COOKIE_DOMAIN is not set for production');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Validate environment on import
const validation = validateAuthEnvironment();
if (!validation.isValid) {
  console.error('Authentication environment validation failed:', validation.errors);
}

if (validation.warnings.length > 0) {
  console.warn('Authentication environment warnings:', validation.warnings);
}

export default authOptions;
