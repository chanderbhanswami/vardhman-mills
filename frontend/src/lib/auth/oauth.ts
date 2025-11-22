import { OAuthProviderData, ExtendedUser, AuthResponse } from './types';

/**
 * OAuth Provider Configuration
 */
export const OAUTH_PROVIDERS = {
  google: {
    name: 'Google',
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    scope: ['openid', 'email', 'profile'],
    endpoints: {
      authorization: 'https://accounts.google.com/o/oauth2/v2/auth',
      token: 'https://oauth2.googleapis.com/token',
      userinfo: 'https://www.googleapis.com/oauth2/v2/userinfo',
    },
  },
  facebook: {
    name: 'Facebook',
    clientId: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    scope: ['email', 'public_profile'],
    endpoints: {
      authorization: 'https://www.facebook.com/v18.0/dialog/oauth',
      token: 'https://graph.facebook.com/v18.0/oauth/access_token',
      userinfo: 'https://graph.facebook.com/me',
    },
  },
  github: {
    name: 'GitHub',
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    scope: ['user:email', 'read:user'],
    endpoints: {
      authorization: 'https://github.com/login/oauth/authorize',
      token: 'https://github.com/login/oauth/access_token',
      userinfo: 'https://api.github.com/user',
    },
  },
  linkedin: {
    name: 'LinkedIn',
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    scope: ['r_liteprofile', 'r_emailaddress'],
    endpoints: {
      authorization: 'https://www.linkedin.com/oauth/v2/authorization',
      token: 'https://www.linkedin.com/oauth/v2/accessToken',
      userinfo: 'https://api.linkedin.com/v2/people/~',
    },
  },
} as const;

/**
 * Google OAuth Profile
 */
export interface GoogleProfile {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

/**
 * Facebook OAuth Profile
 */
export interface FacebookProfile {
  id: string;
  name: string;
  email: string;
  first_name: string;
  last_name: string;
  picture: {
    data: {
      height: number;
      is_silhouette: boolean;
      url: string;
      width: number;
    };
  };
}

/**
 * GitHub OAuth Profile
 */
export interface GitHubProfile {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
  bio: string;
  company: string;
  location: string;
  blog: string;
  public_repos: number;
  followers: number;
  following: number;
}

/**
 * LinkedIn OAuth Profile
 */
export interface LinkedInProfile {
  id: string;
  firstName: {
    localized: Record<string, string>;
    preferredLocale: {
      country: string;
      language: string;
    };
  };
  lastName: {
    localized: Record<string, string>;
    preferredLocale: {
      country: string;
      language: string;
    };
  };
  profilePicture: {
    'displayImage~': {
      elements: Array<{
        identifiers: Array<{
          identifier: string;
        }>;
      }>;
    };
  };
}

/**
 * Process Google OAuth profile
 */
export function processGoogleProfile(profile: GoogleProfile, accessToken: string): OAuthProviderData {
  return {
    provider: 'google',
    providerId: profile.id,
    email: profile.email,
    name: profile.name,
    image: profile.picture,
    accessToken,
    profile: {
      ...profile,
      firstName: profile.given_name,
      lastName: profile.family_name,
      isEmailVerified: profile.verified_email,
    },
  };
}

/**
 * Process Facebook OAuth profile
 */
export function processFacebookProfile(profile: FacebookProfile, accessToken: string): OAuthProviderData {
  return {
    provider: 'facebook',
    providerId: profile.id,
    email: profile.email,
    name: profile.name,
    image: profile.picture?.data?.url,
    accessToken,
    profile: {
      ...profile,
      firstName: profile.first_name,
      lastName: profile.last_name,
    },
  };
}

/**
 * Process GitHub OAuth profile
 */
export function processGitHubProfile(profile: GitHubProfile, accessToken: string): OAuthProviderData {
  return {
    provider: 'github',
    providerId: profile.id.toString(),
    email: profile.email,
    name: profile.name || profile.login,
    image: profile.avatar_url,
    accessToken,
    profile: {
      ...profile,
      username: profile.login,
    },
  };
}

/**
 * Process LinkedIn OAuth profile
 */
export function processLinkedInProfile(profile: LinkedInProfile, accessToken: string, email?: string): OAuthProviderData {
  const firstName = Object.values(profile.firstName.localized)[0] || '';
  const lastName = Object.values(profile.lastName.localized)[0] || '';
  const name = `${firstName} ${lastName}`.trim();
  
  let image = '';
  if (profile.profilePicture?.['displayImage~']?.elements?.length > 0) {
    image = profile.profilePicture['displayImage~'].elements[0]?.identifiers?.[0]?.identifier || '';
  }

  return {
    provider: 'linkedin',
    providerId: profile.id,
    email: email || '',
    name,
    image,
    accessToken,
    profile: {
      ...profile,
      firstName,
      lastName,
    },
  };
}

/**
 * Convert OAuth data to ExtendedUser
 */
export function oauthToUser(oauthData: OAuthProviderData): ExtendedUser {
  const nameParts = oauthData.name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return {
    id: `${oauthData.provider}_${oauthData.providerId}`,
    email: oauthData.email,
    name: oauthData.name,
    image: oauthData.image,
    provider: oauthData.provider,
    providerId: oauthData.providerId,
    isVerified: true, // OAuth accounts are considered verified
    profile: {
      firstName,
      lastName,
      avatar: oauthData.image,
    },
  };
}

/**
 * Validate OAuth state parameter
 */
export function validateOAuthState(state: string, expectedState: string): boolean {
  return state === expectedState;
}

/**
 * Generate OAuth state parameter
 */
export function generateOAuthState(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Build OAuth authorization URL
 */
export function buildOAuthUrl(
  provider: keyof typeof OAUTH_PROVIDERS,
  redirectUri: string,
  state: string
): string {
  const config = OAUTH_PROVIDERS[provider];
  if (!config.clientId) {
    throw new Error(`OAuth client ID not configured for ${provider}`);
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    scope: config.scope.join(' '),
    response_type: 'code',
    state,
  });

  // Provider-specific parameters
  if (provider === 'google') {
    params.append('access_type', 'offline');
    params.append('prompt', 'consent');
  }

  if (provider === 'facebook') {
    params.append('display', 'popup');
  }

  return `${config.endpoints.authorization}?${params.toString()}`;
}

/**
 * Exchange OAuth code for tokens
 */
export async function exchangeOAuthCode(
  provider: keyof typeof OAUTH_PROVIDERS,
  code: string,
  redirectUri: string
): Promise<{ accessToken: string; refreshToken?: string }> {
  const config = OAUTH_PROVIDERS[provider];
  
  if (!config.clientId || !config.clientSecret) {
    throw new Error(`OAuth credentials not configured for ${provider}`);
  }

  const tokenData = {
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  };

  const response = await fetch(config.endpoints.token, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: new URLSearchParams(tokenData),
  });

  if (!response.ok) {
    throw new Error(`OAuth token exchange failed for ${provider}`);
  }

  const tokens = await response.json();
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
  };
}

/**
 * Fetch user profile from OAuth provider
 */
export async function fetchOAuthProfile(
  provider: keyof typeof OAUTH_PROVIDERS,
  accessToken: string
): Promise<OAuthProviderData> {
  const config = OAUTH_PROVIDERS[provider];
  let url = config.endpoints.userinfo;
  
  // Provider-specific URL modifications
  if (provider === 'facebook') {
    url += '?fields=id,name,email,first_name,last_name,picture';
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${provider} profile`);
  }

  const profile = await response.json();

  // Process profile based on provider
  switch (provider) {
    case 'google':
      return processGoogleProfile(profile as GoogleProfile, accessToken);
    case 'facebook':
      return processFacebookProfile(profile as FacebookProfile, accessToken);
    case 'github':
      return processGitHubProfile(profile as GitHubProfile, accessToken);
    case 'linkedin':
      // LinkedIn requires a separate call for email
      const emailResponse = await fetch('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });
      const emailData = await emailResponse.json();
      const email = emailData.elements?.[0]?.['handle~']?.emailAddress || '';
      return processLinkedInProfile(profile as LinkedInProfile, accessToken, email);
    default:
      throw new Error(`Unsupported OAuth provider: ${provider}`);
  }
}

/**
 * Handle OAuth authentication flow
 */
export async function handleOAuthAuth(
  provider: keyof typeof OAUTH_PROVIDERS,
  code: string,
  redirectUri: string
): Promise<AuthResponse> {
  try {
    // Exchange code for tokens
    const tokens = await exchangeOAuthCode(provider, code, redirectUri);
    
    // Fetch user profile
    const oauthData = await fetchOAuthProfile(provider, tokens.accessToken);
    
    // Convert to user object
    const user = oauthToUser(oauthData);
    
    // Here you would typically:
    // 1. Check if user exists in your database
    // 2. Create new user or update existing one
    // 3. Generate your own JWT tokens
    
    return {
      success: true,
      data: {
        user,
        token: tokens.accessToken, // In production, generate your own JWT
        refreshToken: tokens.refreshToken,
      },
    };
  } catch (error) {
    console.error(`OAuth authentication failed for ${provider}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'OAuth authentication failed',
    };
  }
}

/**
 * Refresh OAuth access token
 */
export async function refreshOAuthToken(
  provider: keyof typeof OAUTH_PROVIDERS,
  refreshToken: string
): Promise<{ accessToken: string; refreshToken?: string } | null> {
  const config = OAUTH_PROVIDERS[provider];
  
  if (!config.clientId || !config.clientSecret) {
    throw new Error(`OAuth credentials not configured for ${provider}`);
  }

  try {
    const tokenData = {
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    };

    const response = await fetch(config.endpoints.token, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams(tokenData),
    });

    if (!response.ok) {
      return null;
    }

    const tokens = await response.json();
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || refreshToken,
    };
  } catch (error) {
    console.error(`OAuth token refresh failed for ${provider}:`, error);
    return null;
  }
}

/**
 * Revoke OAuth access token
 */
export async function revokeOAuthToken(
  provider: keyof typeof OAUTH_PROVIDERS,
  token: string
): Promise<boolean> {
  try {
    let revokeUrl = '';
    
    switch (provider) {
      case 'google':
        revokeUrl = `https://oauth2.googleapis.com/revoke?token=${token}`;
        break;
      case 'facebook':
        revokeUrl = `https://graph.facebook.com/me/permissions?access_token=${token}`;
        break;
      case 'github':
        // GitHub doesn't have a public revoke endpoint
        return true;
      case 'linkedin':
        // LinkedIn uses POST to revoke
        const response = await fetch('https://www.linkedin.com/oauth/v2/revoke', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            token,
            client_id: OAUTH_PROVIDERS.linkedin.clientId!,
            client_secret: OAUTH_PROVIDERS.linkedin.clientSecret!,
          }),
        });
        return response.ok;
      default:
        return false;
    }

    const response = await fetch(revokeUrl, {
      method: provider === 'facebook' ? 'DELETE' : 'POST',
    });

    return response.ok;
  } catch (error) {
    console.error(`OAuth token revocation failed for ${provider}:`, error);
    return false;
  }
}

/**
 * Check if OAuth provider is configured
 */
export function isOAuthProviderConfigured(provider: keyof typeof OAUTH_PROVIDERS): boolean {
  const config = OAUTH_PROVIDERS[provider];
  return !!(config.clientId && config.clientSecret);
}

/**
 * Get configured OAuth providers
 */
export function getConfiguredOAuthProviders(): Array<keyof typeof OAUTH_PROVIDERS> {
  return Object.keys(OAUTH_PROVIDERS).filter((provider) =>
    isOAuthProviderConfigured(provider as keyof typeof OAUTH_PROVIDERS)
  ) as Array<keyof typeof OAUTH_PROVIDERS>;
}
