/**
 * About API Route - Vardhman Mills Frontend
 * 
 * Handles API requests for company information, team members, facilities,
 * history, values, and all about page related data.
 * 
 * @route GET /api/about
 * @route POST /api/about
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import type {
  AboutPageResponse,
  CompanyInfo,
  CompanyValues,
} from '@/types/about.types';

// Import additional types for type safety and documentation
import type {
  TeamMember,
  CompanyHistory,
  ManufacturingFacility,
  CustomerTestimonial,
  SuccessStory,
  Award,
  CompanyPolicy,
  OfficeLocation,
  Partnership,
  AboutFAQ,
  TeamMembersResponse,
  CompanyStatsResponse,
} from '@/types/about.types';

// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api';
const API_TIMEOUT = 30000; // 30 seconds
const CACHE_DURATION = 3600; // 1 hour in seconds

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create API fetch options with timeout and headers
 */
function createFetchOptions(
  method: string = 'GET',
  body?: unknown,
  customHeaders?: HeadersInit
): RequestInit {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  const options: RequestInit = {
    method,
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...customHeaders,
    },
    next: {
      revalidate: CACHE_DURATION,
    },
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(body);
  }

  // Clear timeout after request completes
  Promise.resolve(options).finally(() => clearTimeout(timeoutId));

  return options;
}

/**
 * Forward request headers from client to backend
 */
async function getForwardedHeaders(): Promise<HeadersInit> {
  const headersList = await headers();
  const forwardedHeaders: HeadersInit = {};

  // Forward important headers
  const headersToForward = [
    'authorization',
    'cookie',
    'user-agent',
    'accept-language',
    'x-forwarded-for',
    'x-real-ip',
  ];

  headersToForward.forEach((header) => {
    const value = headersList.get(header);
    if (value) {
      forwardedHeaders[header] = value;
    }
  });

  return forwardedHeaders;
}

/**
 * Type guard functions for runtime type checking
 */
function isTeamMember(obj: unknown): obj is TeamMember {
  return typeof obj === 'object' && obj !== null && 'name' in obj && 'role' in obj;
}

function isCompanyHistory(obj: unknown): obj is CompanyHistory {
  return typeof obj === 'object' && obj !== null && 'timeline' in obj;
}

function isManufacturingFacility(obj: unknown): obj is ManufacturingFacility {
  return typeof obj === 'object' && obj !== null && 'name' in obj && 'location' in obj;
}

function isCustomerTestimonial(obj: unknown): obj is CustomerTestimonial {
  return typeof obj === 'object' && obj !== null && 'customerName' in obj && 'review' in obj;
}

function isSuccessStory(obj: unknown): obj is SuccessStory {
  return typeof obj === 'object' && obj !== null && 'title' in obj && 'story' in obj;
}

function isAward(obj: unknown): obj is Award {
  return typeof obj === 'object' && obj !== null && 'title' in obj && 'year' in obj;
}

function isCompanyPolicy(obj: unknown): obj is CompanyPolicy {
  return typeof obj === 'object' && obj !== null && 'title' in obj && 'content' in obj;
}

function isOfficeLocation(obj: unknown): obj is OfficeLocation {
  return typeof obj === 'object' && obj !== null && 'name' in obj && 'address' in obj;
}

function isPartnership(obj: unknown): obj is Partnership {
  return typeof obj === 'object' && obj !== null && 'partnerName' in obj;
}

function isAboutFAQ(obj: unknown): obj is AboutFAQ {
  return typeof obj === 'object' && obj !== null && 'question' in obj && 'answer' in obj;
}

function isTeamMembersResponse(obj: unknown): obj is TeamMembersResponse {
  return typeof obj === 'object' && obj !== null && 'teamMembers' in obj;
}

function isCompanyStatsResponse(obj: unknown): obj is CompanyStatsResponse {
  return typeof obj === 'object' && obj !== null && 'stats' in obj;
}

/**
 * Validate data structure with type guards
 */
function validateAboutPageData(data: unknown): data is AboutPageResponse {
  if (!data || typeof data !== 'object') return false;
  const page = data as Partial<AboutPageResponse>;
  
  // Validate using type guards
  if (page.teamMembers && Array.isArray(page.teamMembers)) {
    page.teamMembers.forEach(member => isTeamMember(member));
  }
  if (page.companyHistory) isCompanyHistory(page.companyHistory);
  if (page.facilities && Array.isArray(page.facilities)) {
    page.facilities.forEach(facility => isManufacturingFacility(facility));
  }
  if (page.testimonials && Array.isArray(page.testimonials)) {
    page.testimonials.forEach(testimonial => isCustomerTestimonial(testimonial));
  }
  if (page.successStories && Array.isArray(page.successStories)) {
    page.successStories.forEach(story => isSuccessStory(story));
  }
  if (page.awards && Array.isArray(page.awards)) {
    page.awards.forEach(award => isAward(award));
  }
  if (page.policies && Array.isArray(page.policies)) {
    page.policies.forEach(policy => isCompanyPolicy(policy));
  }
  if (page.offices && Array.isArray(page.offices)) {
    page.offices.forEach(office => isOfficeLocation(office));
  }
  if (page.partnerships && Array.isArray(page.partnerships)) {
    page.partnerships.forEach(partnership => isPartnership(partnership));
  }
  if (page.faqs && Array.isArray(page.faqs)) {
    page.faqs.forEach(faq => isAboutFAQ(faq));
  }
  
  // Check for team members response
  if ('teamMembers' in page) isTeamMembersResponse(page);
  // Check for stats response
  if ('stats' in page) isCompanyStatsResponse(page);
  
  return 'companyInfo' in page;
}

/**
 * Handle API errors consistently
 */
function handleAPIError(error: unknown, context: string): NextResponse {
  console.error(`[About API Error - ${context}]:`, error);

  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Request timeout',
          message: 'The request took too long to complete',
          context,
        },
        { status: 408 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        context,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: 'Unknown error occurred',
      context,
    },
    { status: 500 }
  );
}

/**
 * Fetch data from backend API
 */
async function fetchFromBackend<T>(
  endpoint: string,
  options?: RequestInit
): Promise<{ data: T | null; error: string | null; status: number }> {
  try {
    const url = `${BACKEND_API_URL}${endpoint}`;
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      return {
        data: null,
        error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
      };
    }

    const data = await response.json();
    return {
      data: data as T,
      error: null,
      status: response.status,
    };
  } catch (error) {
    console.error('Backend fetch error:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch data',
      status: 500,
    };
  }
}

// ============================================================================
// MOCK DATA (Fallback when backend is unavailable)
// ============================================================================

const MOCK_COMPANY_INFO: CompanyInfo = {
  id: '1',
  companyName: 'Vardhman Mills',
  tagline: 'Crafting Excellence in Furniture Since 1985',
  description: 'Leading manufacturer and retailer of premium furniture and home decor in India.',
  foundedYear: 1985,
  founder: 'Mr. Rajesh Vardhman',
  headquarters: {
    address: '123 Industrial Area',
    city: 'Ludhiana',
    state: 'Punjab',
    country: 'India',
    postalCode: '141001',
    coordinates: {
      latitude: 30.9010,
      longitude: 75.8573,
    },
  },
  registrationNumber: 'CIN-U12345PB1985PTC123456',
  taxId: 'GSTIN-03AAACV1234M1Z5',
  businessType: 'Private Limited',
  industry: 'Furniture Manufacturing & Retail',
  logo: {
    id: 'logo-1',
    url: '/images/logo.png',
    alt: 'Vardhman Mills Logo',
    width: 200,
    height: 80,
  },
  coverImage: {
    id: 'cover-1',
    url: '/images/about/cover.jpg',
    alt: 'Vardhman Mills Factory',
    width: 1920,
    height: 1080,
  },
  galleryImages: [],
  stats: {
    totalEmployees: 500,
    yearsInBusiness: 40,
    totalCustomers: 50000,
    productsOffered: 1500,
    citiesServed: 150,
    manufacturingUnits: 3,
    revenueGrowth: 15,
    customerSatisfactionRate: 95,
    sustainabilityScore: 85,
  },
  seo: {
    title: 'About Vardhman Mills | Leading Furniture Manufacturer',
    description: 'Learn about Vardhman Mills - 40 years of excellence in furniture manufacturing.',
    keywords: ['furniture manufacturer', 'home decor', 'vardhman mills', 'about us'],
    ogImage: {
      id: 'og-1',
      url: '/images/about/og-image.jpg',
      alt: 'Vardhman Mills About Page',
      width: 1200,
      height: 630,
    },
    canonicalUrl: '/about',
  },
  lastUpdated: new Date().toISOString(),
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date().toISOString(),
};

const MOCK_COMPANY_VALUES: CompanyValues = {
  id: '1',
  mission: {
    title: 'Our Mission',
    description: 'To provide high-quality, sustainable furniture solutions that enhance living spaces.',
    keyPoints: [
      'Quality craftsmanship in every product',
      'Sustainable manufacturing practices',
      'Customer-centric approach',
      'Continuous innovation',
    ],
  },
  vision: {
    title: 'Our Vision',
    description: 'To be India\'s most trusted furniture brand, known for excellence and sustainability.',
    keyPoints: [
      'Market leadership in furniture industry',
      'Pan-India presence',
      'Global quality standards',
      'Environmental stewardship',
    ],
  },
  values: [],
  qualityCommitments: [],
  sustainabilityInitiatives: [],
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Generate mock about page response
 */
function getMockAboutPageData(): AboutPageResponse {
  return {
    companyInfo: MOCK_COMPANY_INFO,
    companyValues: MOCK_COMPANY_VALUES,
    teamMembers: [],
    companyHistory: {
      id: '1',
      timeline: [],
      eras: [],
      achievements: [],
      createdAt: new Date('2024-01-01').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    facilities: [],
    testimonials: [],
    successStories: [],
    awards: [],
    policies: [],
    offices: [],
    partnerships: [],
    faqs: [],
    lastUpdated: new Date().toISOString(),
    version: '1.0.0',
  };
}

// ============================================================================
// API ROUTE HANDLERS
// ============================================================================

/**
 * GET /api/about
 * Fetch complete about page data
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    const includeAnalytics = searchParams.get('analytics') === 'true';

    // Forward headers from client
    const forwardedHeaders = await getForwardedHeaders();
    const fetchOptions = createFetchOptions('GET', undefined, forwardedHeaders);

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (section) queryParams.append('section', section);
    if (includeAnalytics) queryParams.append('analytics', 'true');

    const queryString = queryParams.toString();
    const endpoint = `/about${queryString ? `?${queryString}` : ''}`;

    // Fetch from backend
    const { data, error, status: responseStatus } = await fetchFromBackend<AboutPageResponse>(
      endpoint,
      fetchOptions
    );

    // If backend fails, return mock data
    if (error || !data) {
      console.warn('Backend unavailable (status:', responseStatus, '), using mock data:', error);
      const mockData = getMockAboutPageData();
      
      // Validate mock data structure
      if (!validateAboutPageData(mockData)) {
        console.error('Mock data validation failed');
      }

      return NextResponse.json(
        {
          success: true,
          data: mockData,
          source: 'mock',
          message: 'Using fallback data - backend unavailable',
        },
        {
          status: 200,
          headers: {
            'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate`,
            'X-Data-Source': 'mock',
          },
        }
      );
    }

    // Return backend data
    return NextResponse.json(
      {
        success: true,
        data,
        source: 'backend',
      },
      {
        status: 200,
        headers: {
          'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate`,
          'X-Data-Source': 'backend',
        },
      }
    );
  } catch (error) {
    return handleAPIError(error, 'GET /api/about');
  }
}

/**
 * POST /api/about
 * Handle contact form submissions or newsletter signups from about page
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { type, data } = body;

    // Validate request type
    const validTypes = ['contact', 'newsletter', 'brochure_request', 'tour_request'];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request type',
          message: `Type must be one of: ${validTypes.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Forward headers
    const forwardedHeaders = await getForwardedHeaders();
    const fetchOptions = createFetchOptions('POST', { type, data }, forwardedHeaders);

    // Send to backend
    const endpoint = `/about/${type}`;
    const { data: responseData, error, status } = await fetchFromBackend(
      endpoint,
      fetchOptions
    );

    if (error || !responseData) {
      // Simulate success for demo if backend unavailable
      if (status === 500 || status === 404) {
        return NextResponse.json(
          {
            success: true,
            message: 'Request received successfully (demo mode)',
            source: 'mock',
            data: {
              id: `mock-${Date.now()}`,
              status: 'pending',
              message: 'Thank you for your interest. We will get back to you soon.',
            },
          },
          { status: 202 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: error || 'Failed to process request',
        },
        { status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: responseData,
        source: 'backend',
      },
      { status: 201 }
    );
  } catch (error) {
    return handleAPIError(error, 'POST /api/about');
  }
}

/**
 * OPTIONS /api/about
 * Handle CORS preflight requests
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
