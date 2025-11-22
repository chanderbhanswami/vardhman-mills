/**
 * Hero Section API Route
 * 
 * Handles hero section content management including banners, sliders,
 * and promotional content. Supports scheduling, A/B testing, and analytics.
 * Includes device-specific content and personalization.
 * 
 * @module api/hero
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schemas
const HeroQuerySchema = z.object({
  section: z.enum(['main', 'secondary', 'promotional', 'featured']).optional(),
  device: z.enum(['desktop', 'tablet', 'mobile']).optional(),
  location: z.enum(['home', 'category', 'product']).optional(),
  active: z.coerce.boolean().optional(),
  scheduled: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

const CreateHeroSchema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().max(500).optional(),
  description: z.string().max(1000).optional(),
  section: z.enum(['main', 'secondary', 'promotional', 'featured']),
  location: z.enum(['home', 'category', 'product']),
  images: z.object({
    desktop: z.string().url(),
    tablet: z.string().url().optional(),
    mobile: z.string().url().optional(),
  }),
  video: z.object({
    url: z.string().url(),
    thumbnail: z.string().url(),
    autoplay: z.boolean().default(false),
  }).optional(),
  cta: z.object({
    text: z.string().min(1).max(50),
    url: z.string().url(),
    style: z.enum(['primary', 'secondary', 'outline', 'link']).default('primary'),
    openInNewTab: z.boolean().default(false),
  }).optional(),
  secondaryCta: z.object({
    text: z.string().min(1).max(50),
    url: z.string().url(),
    style: z.enum(['primary', 'secondary', 'outline', 'link']).default('secondary'),
    openInNewTab: z.boolean().default(false),
  }).optional(),
  overlay: z.object({
    color: z.string(),
    opacity: z.number().min(0).max(1),
  }).optional(),
  textColor: z.string().default('#ffffff'),
  textAlignment: z.enum(['left', 'center', 'right']).default('left'),
  textPosition: z.enum(['top-left', 'top-center', 'top-right', 'middle-left', 'middle-center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right']).default('middle-left'),
  priority: z.number().int().min(0).default(0),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
  badge: z.object({
    text: z.string().max(50),
    color: z.string(),
    position: z.enum(['top-left', 'top-right', 'bottom-left', 'bottom-right']),
  }).optional(),
  animation: z.object({
    type: z.enum(['fade', 'slide', 'zoom', 'none']).default('fade'),
    duration: z.number().min(0).max(5000).default(500),
    delay: z.number().min(0).max(5000).default(0),
  }).optional(),
  targetAudience: z.object({
    segments: z.array(z.enum(['all', 'new', 'returning', 'vip', 'cart-abandoners'])).default(['all']),
    customUserIds: z.array(z.string().uuid()).optional(),
  }).optional(),
  abTest: z.object({
    enabled: z.boolean().default(false),
    variantName: z.string().max(50).optional(),
    trafficPercentage: z.number().min(0).max(100).default(50),
  }).optional(),
});

// Types
interface HeroItem {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  section: 'main' | 'secondary' | 'promotional' | 'featured';
  location: 'home' | 'category' | 'product';
  images: {
    desktop: string;
    tablet: string | null;
    mobile: string | null;
  };
  video: {
    url: string;
    thumbnail: string;
    autoplay: boolean;
  } | null;
  cta: {
    text: string;
    url: string;
    style: 'primary' | 'secondary' | 'outline' | 'link';
    openInNewTab: boolean;
  } | null;
  secondaryCta: {
    text: string;
    url: string;
    style: 'primary' | 'secondary' | 'outline' | 'link';
    openInNewTab: boolean;
  } | null;
  overlay: {
    color: string;
    opacity: number;
  } | null;
  textColor: string;
  textAlignment: 'left' | 'center' | 'right';
  textPosition: string;
  priority: number;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  isScheduled: boolean;
  isExpired: boolean;
  badge: {
    text: string;
    color: string;
    position: string;
  } | null;
  animation: {
    type: 'fade' | 'slide' | 'zoom' | 'none';
    duration: number;
    delay: number;
  };
  targetAudience: {
    segments: string[];
    customUserIds: string[] | null;
  };
  abTest: {
    enabled: boolean;
    variantName: string | null;
    trafficPercentage: number;
  };
  analytics: {
    impressions: number;
    clicks: number;
    ctr: number;
    conversions: number;
    conversionRate: number;
    averageTimeViewed: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface HeroSlider {
  id: string;
  name: string;
  items: HeroItem[];
  settings: {
    autoplay: boolean;
    autoplayDelay: number;
    loop: boolean;
    showNavigation: boolean;
    showPagination: boolean;
    transitionSpeed: number;
    pauseOnHover: boolean;
  };
  isActive: boolean;
}

interface HeroResponse {
  success: boolean;
  data: {
    heroes: HeroItem[];
    sliders: HeroSlider[];
    sections: {
      main: HeroItem[];
      secondary: HeroItem[];
      promotional: HeroItem[];
      featured: HeroItem[];
    };
    activeSlider: HeroSlider | null;
    personalizedContent: boolean;
    metadata: {
      totalActive: number;
      totalScheduled: number;
      lastUpdated: string;
      cacheExpiry: string;
    };
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
 * GET /api/hero
 * 
 * Retrieves hero section content
 * 
 * Query Parameters:
 * - section: Filter by section (main, secondary, promotional, featured)
 * - device: Filter by device type (desktop, tablet, mobile)
 * - location: Filter by location (home, category, product)
 * - active: Show only active content
 * - scheduled: Include scheduled content
 * - limit: Maximum items to return (default: 10, max: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validationResult = HeroQuerySchema.safeParse(params);

    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: validationResult.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const queryParams = validationResult.data;

    // Build backend URL with query parameters
    const backendUrl = new URL(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/hero`
    );

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined) {
        backendUrl.searchParams.append(key, String(value));
      }
    });

    // Get user preferences for personalization
    const userPreferences = request.cookies.get('user_preferences')?.value;
    const userSegment = request.cookies.get('user_segment')?.value;
    const authToken = request.cookies.get('auth_token')?.value;

    if (userPreferences) {
      backendUrl.searchParams.append('preferences', userPreferences);
    }
    if (userSegment) {
      backendUrl.searchParams.append('segment', userSegment);
    }

    // Get device type from user-agent if not specified
    if (!queryParams.device) {
      const userAgent = request.headers.get('user-agent') || '';
      let detectedDevice = 'desktop';
      
      if (/mobile/i.test(userAgent)) {
        detectedDevice = 'mobile';
      } else if (/tablet|ipad/i.test(userAgent)) {
        detectedDevice = 'tablet';
      }
      
      backendUrl.searchParams.append('device', detectedDevice);
    }

    // Fetch from backend
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Dynamic cache based on content type
    let revalidateTime = 300; // 5 minutes default
    if (queryParams.section === 'promotional') {
      revalidateTime = 60; // 1 minute for promotions
    } else if (queryParams.section === 'featured') {
      revalidateTime = 600; // 10 minutes for featured
    }

    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers,
      next: {
        revalidate: revalidateTime,
        tags: [
          'hero',
          queryParams.section ? `hero-${queryParams.section}` : 'hero-all',
          queryParams.location ? `hero-loc-${queryParams.location}` : '',
        ].filter(Boolean),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: errorData.message || 'Failed to fetch hero content',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: HeroResponse = {
      success: true,
      data: {
        heroes: data.data?.heroes || data.heroes || [],
        sliders: data.data?.sliders || data.sliders || [],
        sections: data.data?.sections || data.sections || {
          main: [],
          secondary: [],
          promotional: [],
          featured: [],
        },
        activeSlider: data.data?.activeSlider || data.activeSlider || null,
        personalizedContent: !!authToken || !!userPreferences || !!userSegment,
        metadata: {
          totalActive: data.data?.metadata?.totalActive || 0,
          totalScheduled: data.data?.metadata?.totalScheduled || 0,
          lastUpdated: data.data?.metadata?.lastUpdated || new Date().toISOString(),
          cacheExpiry: new Date(Date.now() + revalidateTime * 1000).toISOString(),
        },
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': `public, s-maxage=${revalidateTime}, stale-while-revalidate=${revalidateTime * 2}`,
        'CDN-Cache-Control': `public, s-maxage=${revalidateTime}`,
        'Vercel-CDN-Cache-Control': `public, s-maxage=${revalidateTime}`,
      },
    });
  } catch (error) {
    console.error('Hero API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching hero content',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/hero
 * 
 * Creates new hero content (Admin only)
 * 
 * Body: CreateHeroSchema
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication (Admin only)
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required to create hero content',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = CreateHeroSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid hero content data',
            details: validationResult.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const heroData = validationResult.data;

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/hero`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(heroData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 403) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'You do not have permission to create hero content',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 403 }
        );
      }

      if (response.status === 409) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'HERO_EXISTS',
              message: 'A hero with similar configuration already exists',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 409 }
        );
      }

      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: errorData.message || 'Failed to create hero content',
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
          hero: data.data?.hero || data.hero,
          message: 'Hero content created successfully',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create Hero API Error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'INVALID_JSON',
            message: 'Invalid JSON in request body',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while creating hero content',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/hero
 * 
 * Bulk update hero items (Admin only)
 * 
 * Body: { ids: string[], updates: Partial<CreateHeroSchema> }
 */
export async function PATCH(request: NextRequest) {
  try {
    // Check authentication (Admin only)
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required to update hero content',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid or missing IDs array',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/hero/bulk`;
    
    const response = await fetch(backendUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 403) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'You do not have permission to update hero content',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 403 }
        );
      }

      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: errorData.message || 'Failed to update hero content',
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
          updatedCount: data.data?.updatedCount || body.ids.length,
          message: 'Hero content updated successfully',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update Hero API Error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'INVALID_JSON',
            message: 'Invalid JSON in request body',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while updating hero content',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/hero
 * 
 * Bulk delete hero items (Admin only)
 * 
 * Body: { ids: string[] }
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication (Admin only)
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required to delete hero content',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid or missing IDs array',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/hero/bulk`;
    
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 403) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'You do not have permission to delete hero content',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 403 }
        );
      }

      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: errorData.message || 'Failed to delete hero content',
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
          deletedCount: data.data?.deletedCount || body.ids.length,
          message: 'Hero content deleted successfully',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete Hero API Error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'INVALID_JSON',
            message: 'Invalid JSON in request body',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while deleting hero content',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
