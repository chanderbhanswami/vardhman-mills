/**
 * NextAuth.js Authentication Route
 * 
 * Handles authentication with multiple providers (credentials, OAuth),
 * JWT/session management, callbacks, and authentication flows.
 * 
 * @module api/auth/[...nextauth]
 */

import NextAuth, { NextAuthOptions, Session, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { z } from 'zod';

// Validation schemas
const CredentialsSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  remember: z.boolean().optional(),
});

// Extended types for NextAuth
interface ExtendedUser extends User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'seller';
  emailVerified: boolean;
  image?: string;
  phone?: string;
  accessToken?: string;
  refreshToken?: string;
}

interface ExtendedJWT extends JWT {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'seller';
  emailVerified: boolean;
  image?: string;
  phone?: string;
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
}

interface ExtendedSession extends Session {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin' | 'seller';
    emailVerified: boolean;
    image?: string;
    phone?: string;
    accessToken?: string;
  };
  accessToken?: string;
  error?: string;
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(token: ExtendedJWT): Promise<ExtendedJWT> {
  try {
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/refresh`;

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: token.refreshToken,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to refresh token');
    }

    return {
      ...token,
      accessToken: data.data?.accessToken || data.accessToken,
      accessTokenExpires: Date.now() + (data.data?.expiresIn || 3600) * 1000,
      refreshToken: data.data?.refreshToken || token.refreshToken,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);

    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

/**
 * NextAuth configuration options
 */
const authOptions: NextAuthOptions = {
  providers: [
    // Credentials Provider (Email/Password)
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'your@email.com' },
        password: { label: 'Password', type: 'password' },
        remember: { label: 'Remember me', type: 'checkbox' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email and password are required');
          }

          // Validate credentials
          const validationResult = CredentialsSchema.safeParse(credentials);

          if (!validationResult.success) {
            throw new Error('Invalid credentials format');
          }

          const { email, password, remember } = validationResult.data;

          // Authenticate with backend
          const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/login`;

          const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              password,
              remember: remember || false,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Authentication failed');
          }

          const userData = data.data || data;

          // Return user object
          return {
            id: userData.user?.id || userData.id,
            email: userData.user?.email || userData.email,
            name: userData.user?.name || userData.name,
            role: userData.user?.role || userData.role || 'user',
            emailVerified: userData.user?.emailVerified || userData.emailVerified || false,
            image: userData.user?.image || userData.image || null,
            phone: userData.user?.phone || userData.phone || null,
            accessToken: userData.accessToken || userData.token,
            refreshToken: userData.refreshToken,
          } as ExtendedUser;
        } catch (error) {
          console.error('Authorization error:', error);
          throw error;
        }
      },
    }),

    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
          name: profile.name,
          image: profile.picture,
          role: 'user',
          emailVerified: profile.email_verified,
        };
      },
    }),

    // GitHub OAuth Provider
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      profile(profile) {
        return {
          id: profile.id.toString(),
          email: profile.email,
          name: profile.name || profile.login,
          image: profile.avatar_url,
          role: 'user',
          emailVerified: Boolean(profile.email),
        };
      },
    }),
  ],

  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/welcome',
  },

  callbacks: {
    /**
     * JWT Callback - Called whenever JWT is created or updated
     */
    async jwt({ token, user, account, trigger, session }): Promise<ExtendedJWT> {
      // Initial sign in
      if (account && user) {
        const extendedUser = user as ExtendedUser;

        // OAuth provider
        if (account.provider !== 'credentials') {
          try {
            // Register/login OAuth user with backend
            const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/oauth`;

            const response = await fetch(backendUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                provider: account.provider,
                providerId: account.providerAccountId,
                email: extendedUser.email,
                name: extendedUser.name,
                image: extendedUser.image,
                accessToken: account.access_token,
                refreshToken: account.refresh_token,
                expiresAt: account.expires_at,
              }),
            });

            const data = await response.json();

            if (response.ok) {
              const userData = data.data || data;

              return {
                ...token,
                id: userData.user?.id || extendedUser.id,
                email: userData.user?.email || extendedUser.email,
                name: userData.user?.name || extendedUser.name,
                role: userData.user?.role || 'user',
                emailVerified: userData.user?.emailVerified || true,
                image: userData.user?.image || extendedUser.image,
                phone: userData.user?.phone,
                accessToken: userData.accessToken || account.access_token,
                refreshToken: userData.refreshToken || account.refresh_token,
                accessTokenExpires: Date.now() + (userData.expiresIn || 3600) * 1000,
              } as ExtendedJWT;
            }
          } catch (error) {
            console.error('OAuth backend registration error:', error);
          }
        }

        // Credentials provider
        return {
          ...token,
          id: extendedUser.id,
          email: extendedUser.email,
          name: extendedUser.name,
          role: extendedUser.role,
          emailVerified: extendedUser.emailVerified,
          image: extendedUser.image,
          phone: extendedUser.phone,
          accessToken: extendedUser.accessToken,
          refreshToken: extendedUser.refreshToken,
          accessTokenExpires: Date.now() + 3600 * 1000, // 1 hour
        } as ExtendedJWT;
      }

      // Update session trigger (for profile updates)
      if (trigger === 'update' && session) {
        return {
          ...token,
          ...session.user,
        } as ExtendedJWT;
      }

      const extendedToken = token as ExtendedJWT;

      // Return previous token if access token has not expired
      if (extendedToken.accessTokenExpires && Date.now() < extendedToken.accessTokenExpires) {
        return extendedToken;
      }

      // Access token has expired, refresh it
      if (extendedToken.refreshToken) {
        return refreshAccessToken(extendedToken);
      }

      return extendedToken;
    },

    /**
     * Session Callback - Called whenever session is checked
     */
    async session({ session, token }): Promise<ExtendedSession> {
      const extendedToken = token as ExtendedJWT;

      return {
        ...session,
        user: {
          id: extendedToken.id,
          email: extendedToken.email,
          name: extendedToken.name,
          role: extendedToken.role,
          emailVerified: extendedToken.emailVerified,
          image: extendedToken.image,
          phone: extendedToken.phone,
          accessToken: extendedToken.accessToken,
        },
        accessToken: extendedToken.accessToken,
        error: extendedToken.error,
      } as ExtendedSession;
    },

    /**
     * Sign In Callback - Control if user is allowed to sign in
     */
    async signIn({ user, account, profile, email, credentials }) {
      try {
        // Log authentication attempt details
        const authDetails = {
          provider: account?.provider,
          hasProfile: Boolean(profile),
          hasEmail: Boolean(email || user.email),
          hasCredentials: Boolean(credentials),
        };

        console.log('Sign in attempt:', authDetails);

        // Check if email is verified for credentials login
        if (account?.provider === 'credentials') {
          const extendedUser = user as ExtendedUser;

          // Allow login even if email not verified, but flag it
          if (!extendedUser.emailVerified) {
            console.warn(`User ${extendedUser.email} logging in with unverified email`);
          }

          // Track credentials login attempt
          if (credentials && extendedUser.id) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/analytics/auth/login-attempt`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: extendedUser.id,
                provider: 'credentials',
                timestamp: new Date().toISOString(),
              }),
            }).catch(() => {
              // Silent fail for analytics
            });
          }

          return true;
        }

        // OAuth providers
        if (account?.provider === 'google' || account?.provider === 'github') {
          // Verify email exists
          if (!user.email) {
            console.error('OAuth login failed: No email provided');
            return false;
          }

          // Log OAuth profile data
          if (profile) {
            console.log(`OAuth profile received for ${user.email}`);
          }

          return true;
        }

        return true;
      } catch (error) {
        console.error('Sign in callback error:', error);
        return false;
      }
    },

    /**
     * Redirect Callback - Control where user is redirected after login
     */
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }

      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) {
        return url;
      }

      return baseUrl;
    },
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`User signed in: ${user.email} via ${account?.provider}`);

      // Log profile data if available
      if (profile) {
        console.log(`Profile data received for ${user.email}`);
      }

      if (isNewUser) {
        console.log(`New user registered: ${user.email}`);

        // Send welcome email (fire and forget)
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/email/welcome`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            name: user.name,
          }),
        }).catch((error) => {
          console.error('Failed to send welcome email:', error);
        });
      }

      // Track sign-in event (fire and forget)
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/analytics/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          provider: account?.provider,
          isNewUser,
          timestamp: new Date().toISOString(),
        }),
      }).catch((error) => {
        console.error('Failed to track sign-in event:', error);
      });
    },

    async signOut({ token, session }) {
      const extendedToken = token as ExtendedJWT;

      console.log(`User signed out: ${extendedToken?.email}`);

      // Log session details if available
      if (session) {
        console.log('Session cleared for user');
      }

      // Track sign-out event (fire and forget)
      if (extendedToken?.id) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/analytics/auth/signout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: extendedToken.id,
            timestamp: new Date().toISOString(),
          }),
        }).catch((error) => {
          console.error('Failed to track sign-out event:', error);
        });
      }
    },

    async createUser({ user }) {
      console.log(`User created: ${user.email}`);
    },

    async updateUser({ user }) {
      console.log(`User updated: ${user.email}`);
    },

    async linkAccount({ user, account, profile }) {
      console.log(`Account linked: ${account.provider} for ${user.email}`);

      // Log profile information
      if (profile) {
        console.log(`Profile linked for provider: ${account.provider}`);
      }
    },

    async session({ session, token }) {
      // Session is being accessed
      // Can be used for analytics or logging
      const extendedToken = token as ExtendedJWT;

      if (extendedToken?.id && session?.user) {
        // Track session access (optional, can be used for activity monitoring)
        // Uncomment if needed:
        // console.log(`Session accessed for user: ${session.user.email}`);
      }
    },
  },

  debug: process.env.NODE_ENV === 'development',

  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-this-in-production',
};

// Export NextAuth handler
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
