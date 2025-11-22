import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { LoginCredentials, AuthResponse } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Provider = any;

/**
 * Credentials authentication function
 * This should be replaced with your actual authentication logic
 */
async function authenticateCredentials(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    // In production, this should call your backend API
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Authentication failed',
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          name: `${data.user.firstName} ${data.user.lastName}`,
          image: data.user.avatar,
          role: data.user.role,
          isVerified: data.user.isVerified,
          permissions: data.user.permissions,
          profile: {
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            phone: data.user.phone,
            avatar: data.user.avatar,
          },
        },
        token: data.token,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
      },
    };
  } catch (error) {
    console.error('Credentials authentication error:', error);
    return {
      success: false,
      error: 'Authentication failed',
    };
  }
}

/**
 * OAuth user registration/login function
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleOAuthUser(provider: string, profile: any, account: any) {
  try {
    // In production, this should call your backend API to handle OAuth user
    const response = await fetch('/api/auth/oauth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider,
        providerId: profile.id || account.providerAccountId,
        email: profile.email,
        name: profile.name,
        image: profile.image || profile.picture,
        accessToken: account.access_token,
        refreshToken: account.refresh_token,
        profile: profile,
      }),
    });

    if (!response.ok) {
      console.error('OAuth user handling failed');
      return null;
    }

    const data = await response.json();
    return {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      image: data.user.image,
      role: data.user.role,
      isVerified: data.user.isVerified,
      permissions: data.user.permissions,
      token: data.token,
    };
  } catch (error) {
    console.error('OAuth user handling error:', error);
    return null;
  }
}

/**
 * NextAuth Providers Configuration
 */
export const authProviders: Provider[] = [
  // Google Provider
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    authorization: {
      params: {
        prompt: 'consent',
        access_type: 'offline',
        response_type: 'code',
        scope: 'openid email profile',
      },
    },
    profile(profile) {
      return {
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.picture,
        firstName: profile.given_name,
        lastName: profile.family_name,
        isVerified: profile.email_verified,
      };
    },
  }),

  // Facebook Provider
  FacebookProvider({
    clientId: process.env.FACEBOOK_CLIENT_ID!,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    authorization: {
      params: {
        scope: 'email public_profile',
      },
    },
    profile(profile) {
      return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        image: profile.picture?.data?.url,
        firstName: profile.first_name,
        lastName: profile.last_name,
      };
    },
  }),

  // GitHub Provider
  GitHubProvider({
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    authorization: {
      params: {
        scope: 'read:user user:email',
      },
    },
    profile(profile) {
      return {
        id: profile.id.toString(),
        name: profile.name || profile.login,
        email: profile.email,
        image: profile.avatar_url,
        username: profile.login,
      };
    },
  }),

  // Credentials Provider
  CredentialsProvider({
    id: 'credentials',
    name: 'Email and Password',
    credentials: {
      email: {
        label: 'Email',
        type: 'email',
        placeholder: 'Enter your email',
      },
      password: {
        label: 'Password',
        type: 'password',
        placeholder: 'Enter your password',
      },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error('Email and password are required');
      }

      const result = await authenticateCredentials({
        email: credentials.email,
        password: credentials.password,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Authentication failed');
      }

      return {
        id: result.data.user.id,
        email: result.data.user.email,
        name: result.data.user.name,
        image: result.data.user.image,
        role: result.data.user.role,
        isVerified: result.data.user.isVerified,
        permissions: result.data.user.permissions,
        token: result.data.token,
        refreshToken: result.data.refreshToken,
      };
    },
  }),
];

/**
 * Get provider configuration by ID
 */
export function getProviderById(providerId: string): Provider | undefined {
  return authProviders.find((provider) => provider.id === providerId);
}

/**
 * Get enabled providers
 */
export function getEnabledProviders(): Provider[] {
  return authProviders.filter((provider) => {
    switch (provider.id) {
      case 'google':
        return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
      case 'facebook':
        return !!(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET);
      case 'github':
        return !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
      case 'credentials':
        return true; // Always enabled
      default:
        return false;
    }
  });
}

/**
 * Check if provider is enabled
 */
export function isProviderEnabled(providerId: string): boolean {
  const provider = getProviderById(providerId);
  if (!provider) return false;

  return getEnabledProviders().some((p) => p.id === providerId);
}

/**
 * Get OAuth providers only
 */
export function getOAuthProviders(): Provider[] {
  return authProviders.filter((provider) => provider.id !== 'credentials');
}

/**
 * Provider display names
 */
export const PROVIDER_NAMES = {
  google: 'Google',
  facebook: 'Facebook',
  github: 'GitHub',
  credentials: 'Email & Password',
} as const;

/**
 * Provider icons (you can use these with your icon library)
 */
export const PROVIDER_ICONS = {
  google: 'FaGoogle',
  facebook: 'FaFacebook',
  github: 'FaGithub',
  credentials: 'FaEnvelope',
} as const;

/**
 * Provider colors
 */
export const PROVIDER_COLORS = {
  google: '#4285f4',
  facebook: '#1877f2',
  github: '#333',
  credentials: '#6b7280',
} as const;

/**
 * Get provider display info
 */
export function getProviderInfo(providerId: string) {
  return {
    name: PROVIDER_NAMES[providerId as keyof typeof PROVIDER_NAMES] || providerId,
    icon: PROVIDER_ICONS[providerId as keyof typeof PROVIDER_ICONS],
    color: PROVIDER_COLORS[providerId as keyof typeof PROVIDER_COLORS],
  };
}

/**
 * Custom provider for email/magic links (if needed)
 */
export function createEmailProvider() {
  return {
    id: 'email',
    name: 'Email',
    type: 'email' as const,
    server: {
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    },
    from: process.env.EMAIL_FROM,
    maxAge: 24 * 60 * 60, // 24 hours
  };
}

/**
 * Provider-specific error messages
 */
export const PROVIDER_ERROR_MESSAGES = {
  OAuthSignin: 'Error occurred during OAuth sign in',
  OAuthCallback: 'Error occurred during OAuth callback',
  OAuthProfile: 'Error occurred while fetching OAuth profile',
  EmailCreateAccount: 'Error occurred while creating email account',
  Callback: 'Error occurred during callback',
  OAuthAccountNotLinked: 'Account is not linked to any OAuth provider',
  EmailSignin: 'Error occurred during email sign in',
  CredentialsSignin: 'Invalid credentials provided',
  default: 'An error occurred during authentication',
} as const;

/**
 * Get error message for provider error
 */
export function getProviderErrorMessage(error: string): string {
  return PROVIDER_ERROR_MESSAGES[error as keyof typeof PROVIDER_ERROR_MESSAGES] || 
         PROVIDER_ERROR_MESSAGES.default;
}

export { handleOAuthUser };
