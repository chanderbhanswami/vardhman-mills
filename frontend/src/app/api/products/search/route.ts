/**
 * Product Search API Route
 * 
 * Handles advanced product search with full-text search, fuzzy matching,
 * autocomplete, suggestions, filters, and search analytics.
 * 
 * @module api/products/search
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation schemas
const SearchProductsSchema = z.object({
  q: z.string().min(1, 'Search query is required').max(200),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  inStock: z.coerce.boolean().optional(),
  onSale: z.coerce.boolean().optional(),
  featured: z.coerce.boolean().optional(),
  tags: z.string().optional(),
  colors: z.string().optional(),
  sizes: z.string().optional(),
  sortBy: z.enum([
    'relevance',
    'newest',
    'price-low',
    'price-high',
    'rating',
    'popular',
    'discount',
  ]).default('relevance'),
  fuzzy: z.coerce.boolean().default(true),
  includeVariants: z.coerce.boolean().default(true),
  includeSuggestions: z.coerce.boolean().default(true),
  includeRelated: z.coerce.boolean().default(false),
});

const AutocompleteSchema = z.object({
  q: z.string().min(1).max(100),
  limit: z.coerce.number().int().positive().max(20).default(10),
  categories: z.string().optional(),
});

const SearchSuggestionsSchema = z.object({
  q: z.string().min(1).max(100),
  limit: z.coerce.number().int().positive().max(10).default(5),
});

// Types
interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

interface SearchProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  thumbnail: string;
  images: ProductImage[];
  sku: string;
  price: number;
  compareAtPrice: number | null;
  discount: number;
  category: string;
  categorySlug: string;
  subcategory: string | null;
  brand: string;
  brandSlug: string;
  tags: string[];
  averageRating: number;
  totalReviews: number;
  inStock: boolean;
  stock: number;
  variants: Array<{
    id: string;
    name: string;
    attributes: Record<string, string>;
  }>;
  featured: boolean;
  onSale: boolean;
  relevanceScore: number;
  matchedFields: string[];
}

interface SearchSuggestion {
  query: string;
  type: 'product' | 'category' | 'brand' | 'popular' | 'recent';
  count: number;
  category?: string;
}

interface SearchCorrection {
  original: string;
  corrected: string;
  confidence: number;
}

interface SearchFacet {
  field: string;
  values: Array<{
    value: string;
    count: number;
    selected: boolean;
  }>;
}

interface SearchMetrics {
  totalResults: number;
  searchTime: number;
  fuzzyMatchUsed: boolean;
  variantsIncluded: boolean;
  filtersApplied: number;
}

interface RelatedSearch {
  query: string;
  count: number;
}

interface SearchProductsResponse {
  success: boolean;
  data: {
    query: string;
    products: SearchProduct[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
    suggestions: SearchSuggestion[];
    corrections: SearchCorrection[];
    facets: SearchFacet[];
    relatedSearches: RelatedSearch[];
    metrics: SearchMetrics;
    filters: {
      categories: Array<{ value: string; label: string; count: number }>;
      brands: Array<{ value: string; label: string; count: number }>;
      priceRanges: Array<{ min: number; max: number; label: string; count: number }>;
      ratings: Array<{ rating: number; count: number }>;
    };
  };
  timestamp: string;
}

interface AutocompleteResult {
  text: string;
  type: 'product' | 'category' | 'brand' | 'keyword';
  category?: string;
  thumbnail?: string;
  count?: number;
}

interface AutocompleteResponse {
  success: boolean;
  data: {
    query: string;
    results: AutocompleteResult[];
    trending: string[];
  };
  timestamp: string;
}

interface SearchSuggestionsResponse {
  success: boolean;
  data: {
    suggestions: string[];
    trending: string[];
    recent: string[];
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
 * GET /api/products/search
 * 
 * Search products with advanced filtering and fuzzy matching
 * 
 * Query Parameters:
 * - q: Search query (required)
 * - page, limit: Pagination
 * - category, subcategory, brand: Filter parameters
 * - minPrice, maxPrice, minRating: Range filters
 * - inStock, onSale, featured: Boolean filters
 * - tags, colors, sizes: Multi-value filters (comma-separated)
 * - sortBy: Sort order (default: relevance)
 * - fuzzy: Enable fuzzy matching (default: true)
 * - includeVariants: Include product variants (default: true)
 * - includeSuggestions: Include search suggestions (default: true)
 * - includeRelated: Include related searches (default: false)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams: urlSearchParams } = new URL(request.url);
    const params = Object.fromEntries(urlSearchParams.entries());

    // Check if this is an autocomplete request
    if (params.autocomplete === 'true') {
      const validationResult = AutocompleteSchema.safeParse(params);

      if (!validationResult.success) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid autocomplete parameters',
              details: validationResult.error.flatten(),
            },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      const autocompleteParams = validationResult.data;

      // Get authentication (optional)
      const cookieStore = await cookies();
      const authToken = cookieStore.get('auth_token')?.value;
      const guestId = cookieStore.get('guest_id')?.value;

      // Build backend URL
      const backendUrl = new URL(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products/search/autocomplete`
      );

      Object.entries(autocompleteParams).forEach(([key, value]) => {
        if (value !== undefined) {
          backendUrl.searchParams.append(key, String(value));
        }
      });

      if (guestId) {
        backendUrl.searchParams.append('guestId', guestId);
      }

      // Prepare headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      // Fetch from backend
      const response = await fetch(backendUrl.toString(), {
        method: 'GET',
        headers,
        next: {
          revalidate: 300, // 5 minutes
          tags: ['search-autocomplete', `search-q-${autocompleteParams.q}`],
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'BACKEND_ERROR',
              message: errorData.message || 'Failed to fetch autocomplete results',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: response.status }
        );
      }

      const data = await response.json();

      const responseData: AutocompleteResponse = {
        success: true,
        data: {
          query: autocompleteParams.q,
          results: data.data?.results || data.results || [],
          trending: data.data?.trending || data.trending || [],
        },
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(responseData, {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      });
    }

    // Check if this is a suggestions request
    if (params.suggestions === 'true') {
      const validationResult = SearchSuggestionsSchema.safeParse(params);

      if (!validationResult.success) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid suggestions parameters',
              details: validationResult.error.flatten(),
            },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      const suggestionsParams = validationResult.data;

      // Get authentication (optional)
      const cookieStore = await cookies();
      const authToken = cookieStore.get('auth_token')?.value;
      const guestId = cookieStore.get('guest_id')?.value;

      // Build backend URL
      const backendUrl = new URL(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products/search/suggestions`
      );

      Object.entries(suggestionsParams).forEach(([key, value]) => {
        if (value !== undefined) {
          backendUrl.searchParams.append(key, String(value));
        }
      });

      if (guestId) {
        backendUrl.searchParams.append('guestId', guestId);
      }

      // Prepare headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      // Fetch from backend
      const response = await fetch(backendUrl.toString(), {
        method: 'GET',
        headers,
        next: {
          revalidate: 180, // 3 minutes
          tags: ['search-suggestions'],
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'BACKEND_ERROR',
              message: errorData.message || 'Failed to fetch suggestions',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: response.status }
        );
      }

      const data = await response.json();

      const responseData: SearchSuggestionsResponse = {
        success: true,
        data: {
          suggestions: data.data?.suggestions || data.suggestions || [],
          trending: data.data?.trending || data.trending || [],
          recent: data.data?.recent || data.recent || [],
        },
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(responseData, {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=360',
        },
      });
    }

    // Regular search
    const validationResult = SearchProductsSchema.safeParse(params);

    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid search parameters',
            details: validationResult.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const validatedParams = validationResult.data;

    // Get authentication (optional)
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    const guestId = cookieStore.get('guest_id')?.value;

    // Build backend URL
    const backendUrl = new URL(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products/search`
    );

    Object.entries(validatedParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        backendUrl.searchParams.append(key, String(value));
      }
    });

    if (guestId) {
      backendUrl.searchParams.append('guestId', guestId);
    }

    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    // Fetch from backend
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers,
      next: {
        revalidate: 300, // 5 minutes
        tags: ['search', `search-q-${validatedParams.q}`, `search-category-${validatedParams.category}`],
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: errorData.message || 'Failed to search products',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: SearchProductsResponse = {
      success: true,
      data: {
        query: validatedParams.q,
        products: data.data?.products || data.products || [],
        pagination: data.data?.pagination || data.pagination || {
          page: validatedParams.page,
          limit: validatedParams.limit,
          total: 0,
          totalPages: 0,
          hasMore: false,
        },
        suggestions: validatedParams.includeSuggestions 
          ? (data.data?.suggestions || data.suggestions || [])
          : [],
        corrections: data.data?.corrections || data.corrections || [],
        facets: data.data?.facets || data.facets || [],
        relatedSearches: validatedParams.includeRelated
          ? (data.data?.relatedSearches || data.relatedSearches || [])
          : [],
        metrics: data.data?.metrics || data.metrics || {
          totalResults: 0,
          searchTime: 0,
          fuzzyMatchUsed: false,
          variantsIncluded: validatedParams.includeVariants,
          filtersApplied: 0,
        },
        filters: data.data?.filters || data.filters || {
          categories: [],
          brands: [],
          priceRanges: [],
          ratings: [],
        },
      },
      timestamp: new Date().toISOString(),
    };

    // Track search (fire and forget)
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/analytics/search`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { Authorization: `Bearer ${authToken}` }),
        },
        body: JSON.stringify({
          query: validatedParams.q,
          resultsCount: responseData.data.pagination.total,
          filters: {
            category: validatedParams.category,
            brand: validatedParams.brand,
            priceRange: validatedParams.minPrice || validatedParams.maxPrice ? { min: validatedParams.minPrice, max: validatedParams.maxPrice } : null,
          },
          guestId,
          timestamp: new Date().toISOString(),
        }),
      }
    ).catch(() => {
      // Silently fail analytics tracking
    });

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Product Search API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while searching products',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products/search
 * 
 * Advanced search with complex filters (alternative to GET for complex queries)
 * 
 * Body:
 * {
 *   q: string,
 *   filters: {...},
 *   page: number,
 *   limit: number,
 *   sortBy: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body (use same schema as GET)
    const validationResult = SearchProductsSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid search parameters',
            details: validationResult.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const searchParams = validationResult.data;

    // Get authentication (optional)
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    const guestId = cookieStore.get('guest_id')?.value;

    // Build backend URL
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products/search`;

    // Prepare request body
    const requestBody = {
      ...searchParams,
      guestId,
      metadata: {
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                   request.headers.get('x-real-ip') ||
                   'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    };

    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    // Fetch from backend
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: errorData.message || 'Failed to search products',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: SearchProductsResponse = {
      success: true,
      data: {
        query: searchParams.q,
        products: data.data?.products || data.products || [],
        pagination: data.data?.pagination || data.pagination || {
          page: searchParams.page,
          limit: searchParams.limit,
          total: 0,
          totalPages: 0,
          hasMore: false,
        },
        suggestions: searchParams.includeSuggestions 
          ? (data.data?.suggestions || data.suggestions || [])
          : [],
        corrections: data.data?.corrections || data.corrections || [],
        facets: data.data?.facets || data.facets || [],
        relatedSearches: searchParams.includeRelated
          ? (data.data?.relatedSearches || data.relatedSearches || [])
          : [],
        metrics: data.data?.metrics || data.metrics || {
          totalResults: 0,
          searchTime: 0,
          fuzzyMatchUsed: false,
          variantsIncluded: searchParams.includeVariants,
          filtersApplied: 0,
        },
        filters: data.data?.filters || data.filters || {
          categories: [],
          brands: [],
          priceRanges: [],
          ratings: [],
        },
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Product Search POST API Error:', error);

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
          message: 'An unexpected error occurred while searching products',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
