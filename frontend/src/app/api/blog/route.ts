/**
 * Blog API Route - Vardhman Mills Frontend
 * 
 * Handles API requests for blog posts list with filtering,
 * search, pagination, and sorting.
 * 
 * @route GET /api/blog - List blog posts
 * @route POST /api/blog - Create blog post (admin)
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import type { BlogPost } from '@/types/blog.types';

// ============================================================================
// CONSTANTS
// ============================================================================

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api/v1';
const CACHE_TIME = 600; // 10 minutes

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_BLOG_POSTS: Partial<BlogPost>[] = [
  {
    id: '1',
    slug: 'choosing-perfect-furniture-home',
    title: 'How to Choose the Perfect Furniture for Your Home',
    excerpt: 'A comprehensive guide to selecting furniture that matches your style and needs.',
    content: '<p>Full blog content here...</p>',
    status: 'published',
    readingTime: 8,
    publishedAt: new Date('2024-03-15').toISOString(),
    createdAt: new Date('2024-03-10').toISOString(),
    updatedAt: new Date('2024-03-15').toISOString(),
  },
  {
    id: '2',
    slug: 'sustainable-furniture-trends-2024',
    title: 'Sustainable Furniture Trends to Watch in 2024',
    excerpt: 'Discover the latest eco-friendly furniture trends shaping the industry.',
    content: '<p>Full content about sustainable furniture...</p>',
    status: 'published',
    readingTime: 6,
    publishedAt: new Date('2024-03-20').toISOString(),
    createdAt: new Date('2024-03-18').toISOString(),
    updatedAt: new Date('2024-03-20').toISOString(),
  },
];

// ============================================================================
// API HANDLERS
// ============================================================================

/**
 * GET /api/blog
 * Fetch blog posts with filtering and pagination
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const author = searchParams.get('author');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'latest';
    const featured = searchParams.get('featured') === 'true';

    // Build query string for backend
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort,
    });

    if (category) queryParams.append('category', category);
    if (tag) queryParams.append('tag', tag);
    if (author) queryParams.append('author', author);
    if (search) queryParams.append('search', search);
    if (featured) queryParams.append('featured', 'true');

    // Try backend first
    try {
      const response = await fetch(
        `${BACKEND_URL}/blog?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          next: { revalidate: CACHE_TIME },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(
          { success: true, data, source: 'backend' },
          {
            headers: {
              'Cache-Control': `public, s-maxage=${CACHE_TIME}, stale-while-revalidate`,
            },
          }
        );
      }
    } catch (error) {
      console.warn('Backend unavailable, using mock data:', error);
    }

    // Fallback to mock data
    let filtered = [...MOCK_BLOG_POSTS];

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          (post.title?.toLowerCase().includes(searchLower) || false) ||
          (post.excerpt?.toLowerCase().includes(searchLower) || false)
      );
    }

    if (featured) {
      filtered = filtered.filter((post) => post.settings?.isFeatured);
    }

    if (category) {
      filtered = filtered.filter((post) =>
        post.categories?.some((cat) => cat.slug === category)
      );
    }

    if (tag) {
      filtered = filtered.filter((post) =>
        post.tags?.some((t) => t.slug === tag)
      );
    }

    if (author) {
      filtered = filtered.filter((post) => post.author?.id === author);
    }

    // Sort
    switch (sort) {
      case 'latest':
        filtered.sort((a, b) => {
          const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
          const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case 'popular':
        filtered.sort((a, b) => (b.engagement?.views || 0) - (a.engagement?.views || 0));
        break;
      case 'trending':
        filtered.sort((a, b) => (b.engagement?.likes || 0) - (a.engagement?.likes || 0));
        break;
    }

    // Paginate
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const posts = filtered.slice(offset, offset + limit);

    return NextResponse.json(
      {
        success: true,
        data: {
          posts,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasMore: page < totalPages,
          },
        },
        source: 'mock',
      },
      {
        headers: {
          'Cache-Control': `public, s-maxage=${CACHE_TIME}, stale-while-revalidate`,
        },
      }
    );
  } catch (error) {
    console.error('[Blog API Error - GET]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch blog posts',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/blog
 * Create new blog post (admin only)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.content) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Try backend
    try {
      const response = await fetch(`${BACKEND_URL}/blog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(
          { success: true, data, source: 'backend' },
          { status: 201 }
        );
      }
    } catch (error) {
      console.warn('Backend unavailable:', error);
    }

    // Mock response
    const mockPost: Partial<BlogPost> = {
      id: `mock-${Date.now()}`,
      ...body,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: mockPost,
        source: 'mock',
        message: 'Created in demo mode',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Blog API Error - POST]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create blog post',
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/blog
 * Handle CORS preflight
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

