import { CallbacksOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { ExtendedSession, ExtendedJWT, ExtendedUser } from './types';
import { 
  shouldRefreshToken, 
  refreshAccessToken,
  createNextAuthJWT 
} from './jwt';

/**
 * NextAuth Callbacks Configuration
 * Handles JWT tokens, sessions, and user authentication flow
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const authCallbacks: CallbacksOptions<ExtendedUser, any> = {
  /**
   * JWT Callback
   * Handles JWT token creation and updates
   */
  async jwt({ token, user, account, profile, trigger, session }): Promise<ExtendedJWT> {
    // Initial sign in
    if (user && account) {
      const extendedUser: ExtendedUser = {
        id: user.id,
        email: user.email || '',
        name: user.name || '',
        image: user.image || undefined,
        provider: account.provider,
        providerId: account.providerAccountId,
        isVerified: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        role: (user as any)?.role || 'user',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        permissions: (user as any)?.permissions || [],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token: (user as any)?.token,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        refreshToken: (user as any)?.refreshToken,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        profile: (user as any)?.profile,
      };

      // Create JWT token
      const jwtToken = createNextAuthJWT(extendedUser);
      
      // Handle OAuth providers
      if (account.provider !== 'credentials') {
        try {
          // Call your backend API to handle OAuth login
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/oauth-signin`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              provider: account.provider,
              providerId: account.providerAccountId,
              email: user.email,
              name: user.name,
              image: user.image,
              accessToken: account.access_token,
              refreshToken: account.refresh_token,
              profile: profile,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            jwtToken.accessToken = data.token;
            jwtToken.user = data.user;
          }
        } catch (error) {
          console.error('OAuth signin error:', error);
        }
      }

      return jwtToken;
    }

    // Handle token refresh
    if (shouldRefreshToken(token as ExtendedJWT)) {
      try {
        const currentToken = token as ExtendedJWT;
        const refreshedTokens = await refreshAccessToken(currentToken.refreshToken || '');
        if (refreshedTokens) {
          return {
            ...token,
            accessToken: refreshedTokens.accessToken,
            refreshToken: refreshedTokens.refreshToken || token.refreshToken,
            accessTokenExpires: Math.floor(Date.now() / 1000) + 900, // 15 minutes
          } as ExtendedJWT;
        }
      } catch (error) {
        console.error('Token refresh error:', error);
        return {
          ...token,
          error: 'RefreshAccessTokenError',
        } as ExtendedJWT;
      }
    }

    // Handle session update
    if (trigger === 'update' && session) {
      return {
        ...token,
        ...session,
      } as ExtendedJWT;
    }

    return token as ExtendedJWT;
  },

  /**
   * Session Callback
   * Handles session object creation
   */
  async session({ session, token }): Promise<ExtendedSession> {
    const currentToken = token as ExtendedJWT;
    const extendedSession: ExtendedSession = {
      ...session,
      user: {
        id: token.sub || '',
        email: token.email || session.user?.email || '',
        name: token.name || session.user?.name || '',
        image: (token.picture || session.user?.image) || undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        role: (currentToken.user as any)?.role || 'user',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        isVerified: (currentToken.user as any)?.isVerified || false,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        permissions: (currentToken.user as any)?.permissions || [],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        profile: (currentToken.user as any)?.profile,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        provider: (currentToken.user as any)?.provider,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        providerId: (currentToken.user as any)?.providerId,
      },
      accessToken: currentToken.accessToken as string,
      refreshToken: currentToken.refreshToken as string,
      expires: session.expires,
    };

    // Add error to session if token refresh failed
    if (currentToken.error) {
      extendedSession.error = currentToken.error as string;
    }

    return extendedSession;
  },

  /**
   * Sign In Callback
   * Controls whether user is allowed to sign in
   */
  async signIn({ user, account, email }) {
    try {
      // Allow all OAuth providers
      if (account?.provider !== 'credentials') {
        return true;
      }

      // For credentials provider, user should already be validated
      if (account?.provider === 'credentials' && user) {
        return true;
      }

      // For email provider
      if (account?.provider === 'email' && email) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Sign in callback error:', error);
      return false;
    }
  },

  /**
   * Redirect Callback
   * Controls where user is redirected after sign in/out
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
};

/**
 * Handle user creation for OAuth providers
 */
export async function handleOAuthUserCreation(
  provider: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profile: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  account: any
): Promise<ExtendedUser | null> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/oauth-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider,
        providerId: account.providerAccountId,
        email: profile.email,
        name: profile.name,
        image: profile.image || profile.picture,
        profile: profile,
        accessToken: account.access_token,
        refreshToken: account.refresh_token,
      }),
    });

    if (!response.ok) {
      console.error('OAuth user creation failed');
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('OAuth user creation error:', error);
    return null;
  }
}

/**
 * Handle credentials validation
 */
export async function validateCredentials(
  credentials: Record<string, string>
): Promise<ExtendedUser | null> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Credentials validation error:', error);
    return null;
  }
}

/**
 * Handle account linking
 */
export async function linkAccount(
  user: ExtendedUser,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  account: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profile: any
): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/link-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        accessToken: account.access_token,
        refreshToken: account.refresh_token,
        profile: profile,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Account linking error:', error);
    return false;
  }
}

/**
 * Handle user session update
 */
export async function updateUserSession(
  userId: string,
  sessionData: Partial<ExtendedUser>
): Promise<ExtendedUser | null> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/update-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        ...sessionData,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Session update error:', error);
    return null;
  }
}

/**
 * Handle sign out cleanup
 */
export async function handleSignOut(token: JWT): Promise<void> {
  try {
    // Call your backend to handle sign out cleanup
    await fetch(`${process.env.NEXTAUTH_URL}/api/auth/signout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.accessToken}`,
      },
      body: JSON.stringify({
        userId: token.sub,
      }),
    });
  } catch (error) {
    console.error('Sign out cleanup error:', error);
  }
}

/**
 * Error handling for authentication callbacks
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function handleAuthError(error: any): string {
  console.error('Authentication error:', error);
  
  if (error.type === 'OAuthAccountNotLinked') {
    return 'This account is not linked. Please sign in with the same method you used before.';
  }
  
  if (error.type === 'CredentialsSignin') {
    return 'Invalid credentials. Please check your email and password.';
  }
  
  if (error.type === 'EmailSignin') {
    return 'Email sign in failed. Please try again.';
  }
  
  if (error.type === 'OAuthSignin' || error.type === 'OAuthCallback') {
    return 'OAuth authentication failed. Please try again.';
  }
  
  return 'An error occurred during authentication. Please try again.';
}

/**
 * Session validation helper
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isValidSession(session: any): session is ExtendedSession {
  return (
    session &&
    session.user &&
    session.user.id &&
    session.user.email &&
    session.accessToken &&
    !session.error
  );
}

/**
 * Token validation helper
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isValidToken(token: any): token is ExtendedJWT {
  return (
    token &&
    token.sub &&
    token.accessToken &&
    token.accessTokenExpires &&
    token.accessTokenExpires > Math.floor(Date.now() / 1000)
  );
}
