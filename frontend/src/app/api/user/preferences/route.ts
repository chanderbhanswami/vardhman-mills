/**
 * User Preferences API Route
 * 
 * Manages user preferences and settings:
 * - Display preferences (theme, language, currency)
 * - Shopping preferences (size, color, brand preferences)
 * - Privacy settings
 * - Communication preferences
 * - Accessibility settings
 * 
 * @module api/user/preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation schemas
const preferencesSchema = z.object({
  // Display preferences
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  language: z.string().min(2).max(10).optional(),
  currency: z.string().length(3).optional(),
  dateFormat: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']).optional(),
  timeFormat: z.enum(['12h', '24h']).optional(),
  timezone: z.string().optional(),
  
  // Shopping preferences
  defaultShippingAddressId: z.string().optional(),
  defaultBillingAddressId: z.string().optional(),
  defaultPaymentMethodId: z.string().optional(),
  preferredSize: z.object({
    tops: z.string().optional(),
    bottoms: z.string().optional(),
    shoes: z.string().optional(),
    dresses: z.string().optional(),
  }).optional(),
  preferredColors: z.array(z.string()).optional(),
  preferredBrands: z.array(z.string()).optional(),
  preferredCategories: z.array(z.string()).optional(),
  budgetRange: z.object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional(),
  }).optional(),
  
  // Privacy settings
  showProfilePublicly: z.boolean().optional(),
  showOrderHistory: z.boolean().optional(),
  showWishlist: z.boolean().optional(),
  showReviews: z.boolean().optional(),
  allowPersonalization: z.boolean().optional(),
  allowDataCollection: z.boolean().optional(),
  allowThirdPartySharing: z.boolean().optional(),
  
  // Communication preferences
  emailMarketing: z.boolean().optional(),
  smsMarketing: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  phoneCallMarketing: z.boolean().optional(),
  
  // Accessibility settings
  largeText: z.boolean().optional(),
  highContrast: z.boolean().optional(),
  reduceMotion: z.boolean().optional(),
  screenReaderOptimized: z.boolean().optional(),
  keyboardNavigation: z.boolean().optional(),
  
  // Shopping behavior
  saveCartItems: z.boolean().optional(),
  autoApplyCoupons: z.boolean().optional(),
  showRecommendations: z.boolean().optional(),
  showRecentlyViewed: z.boolean().optional(),
  defaultSortOrder: z.enum([
    'popularity',
    'price-low-high',
    'price-high-low',
    'newest',
    'rating',
    'discount'
  ]).optional(),
  itemsPerPage: z.number().min(12).max(100).optional(),
  
  // Other preferences
  rememberFilters: z.boolean().optional(),
  showOnSaleOnly: z.boolean().optional(),
  showInStockOnly: z.boolean().optional(),
  autoPlayVideos: z.boolean().optional(),
  showImagePreviews: z.boolean().optional(),
});

// Types
interface UserPreferences {
  userId: string;
  
  // Display preferences
  theme: 'light' | 'dark' | 'auto';
  language: string;
  currency: string;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  timezone: string;
  
  // Shopping preferences
  defaultShippingAddressId?: string;
  defaultBillingAddressId?: string;
  defaultPaymentMethodId?: string;
  preferredSize?: {
    tops?: string;
    bottoms?: string;
    shoes?: string;
    dresses?: string;
  };
  preferredColors?: string[];
  preferredBrands?: string[];
  preferredCategories?: string[];
  budgetRange?: {
    min?: number;
    max?: number;
  };
  
  // Privacy settings
  showProfilePublicly: boolean;
  showOrderHistory: boolean;
  showWishlist: boolean;
  showReviews: boolean;
  allowPersonalization: boolean;
  allowDataCollection: boolean;
  allowThirdPartySharing: boolean;
  
  // Communication preferences
  emailMarketing: boolean;
  smsMarketing: boolean;
  pushNotifications: boolean;
  phoneCallMarketing: boolean;
  
  // Accessibility settings
  largeText: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
  screenReaderOptimized: boolean;
  keyboardNavigation: boolean;
  
  // Shopping behavior
  saveCartItems: boolean;
  autoApplyCoupons: boolean;
  showRecommendations: boolean;
  showRecentlyViewed: boolean;
  defaultSortOrder: 'popularity' | 'price-low-high' | 'price-high-low' | 'newest' | 'rating' | 'discount';
  itemsPerPage: number;
  
  // Other preferences
  rememberFilters: boolean;
  showOnSaleOnly: boolean;
  showInStockOnly: boolean;
  autoPlayVideos: boolean;
  showImagePreviews: boolean;
  
  createdAt: string;
  updatedAt: string;
}

interface PreferencesResponse {
  success: boolean;
  data: {
    preferences: UserPreferences;
    defaults?: Partial<UserPreferences>;
    message?: string;
  };
  timestamp: string;
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

/**
 * GET /api/user/preferences
 * 
 * Get user preferences
 * 
 * Query Parameters:
 * - category: Filter by preference category (display, shopping, privacy, communication, accessibility, behavior)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required to view preferences',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // Build query string
    const queryParams = new URLSearchParams();
    if (category) queryParams.append('category', category);

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/user/preferences${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'FETCH_FAILED',
            message: errorData.message || 'Failed to fetch preferences',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: PreferencesResponse = {
      success: true,
      data: {
        preferences: data.data?.preferences || data.preferences,
        defaults: data.data?.defaults,
      },
      timestamp: new Date().toISOString(),
    };

    // Set theme cookie for server-side rendering
    if (data.data?.preferences?.theme) {
      const cookieStore = await cookies();
      cookieStore.set('theme', data.data.preferences.theme, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60, // 1 year
      });
    }

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Get Preferences API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching preferences',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/preferences
 * 
 * Update user preferences (partial update)
 * 
 * Body: Partial preferences object (see preferencesSchema)
 */
export async function PATCH(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required to update preferences',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    
    let validatedData;
    try {
      validatedData = preferencesSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid preferences data',
              details: error.issues,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/user/preferences`;
    
    const response = await fetch(backendUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: errorData.message || 'Failed to update preferences',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: PreferencesResponse = {
      success: true,
      data: {
        preferences: data.data?.preferences || data.preferences,
        message: 'Preferences updated successfully',
      },
      timestamp: new Date().toISOString(),
    };

    // Update theme cookie if changed
    if (validatedData.theme) {
      const cookieStore = await cookies();
      cookieStore.set('theme', validatedData.theme, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60, // 1 year
      });
    }

    // Update language cookie if changed
    if (validatedData.language) {
      const cookieStore = await cookies();
      cookieStore.set('language', validatedData.language, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60, // 1 year
      });
    }

    // Update currency cookie if changed
    if (validatedData.currency) {
      const cookieStore = await cookies();
      cookieStore.set('currency', validatedData.currency, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60, // 1 year
      });
    }

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Update Preferences API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while updating preferences',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/preferences
 * 
 * Reset preferences to defaults
 * 
 * Body:
 * - category: Category to reset (optional, resets all if not provided)
 * - confirm: Confirmation flag (required)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const postCookieStore = await cookies();
    const authToken = postCookieStore.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required to reset preferences',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { category, confirm } = body;

    if (!confirm) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'CONFIRMATION_REQUIRED',
            message: 'Confirmation required to reset preferences',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/user/preferences/reset`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ category, confirm }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'RESET_FAILED',
            message: errorData.message || 'Failed to reset preferences',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: PreferencesResponse = {
      success: true,
      data: {
        preferences: data.data?.preferences || data.preferences,
        message: category 
          ? `${category} preferences reset to defaults successfully`
          : 'All preferences reset to defaults successfully',
      },
      timestamp: new Date().toISOString(),
    };

    // Clear preference cookies
    const cookieStore = await cookies();
    cookieStore.delete('theme');
    cookieStore.delete('language');
    cookieStore.delete('currency');

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Reset Preferences API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while resetting preferences',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/preferences
 * 
 * Export preferences data (GDPR compliance)
 * Returns preferences data for download
 */
export async function DELETE(request: NextRequest) {
  try {
    // Log export request for analytics
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    console.log('Preferences export requested:', {
      timestamp: new Date().toISOString(),
      userAgent,
    });
    
    // Check authentication
    const deleteCookieStore = await cookies();
    const authToken = deleteCookieStore.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required to export preferences',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/user/preferences/export`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'EXPORT_FAILED',
            message: errorData.message || 'Failed to export preferences',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(
      {
        success: true,
        data: {
          preferences: data.data?.preferences || data.preferences,
          exportedAt: new Date().toISOString(),
          format: 'json',
          message: 'Preferences exported successfully',
        },
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Content-Disposition': `attachment; filename="preferences-${Date.now()}.json"`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Export Preferences API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while exporting preferences',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
