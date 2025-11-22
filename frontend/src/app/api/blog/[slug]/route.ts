import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// CONSTANTS
// ============================================================================

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api';
const CACHE_TIME = 600; // 10 minutes
const API_TIMEOUT = 10000;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface BlogRouteParams {
  params: Promise<{
    slug: string;
  }>;
}

interface SimpleBlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  publishedAt: string;
  readingTime: number;
}

interface RelatedPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: {
    id: string;
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  publishedAt: string;
  readingTime: number;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
}

interface Comment {
  id: string;
  postId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  likes: number;
  createdAt: string;
}

interface BlogPostWithRelated {
  post: SimpleBlogPost;
  relatedPosts: RelatedPost[];
  comments: Comment[];
  totalComments: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number = API_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_BLOG_DATA: Record<string, SimpleBlogPost> = {
  'choosing-perfect-furniture-home': {
    id: '1',
    slug: 'choosing-perfect-furniture-home',
    title: 'How to Choose the Perfect Furniture for Your Home',
    excerpt: 'A comprehensive guide to selecting furniture that matches your style, needs, and budget.',
    content: '<h2>Understanding Your Space</h2><p>Before purchasing furniture, measure your rooms carefully...</p><h2>Defining Your Style</h2><p>Your furniture should reflect your personal aesthetic...</p>',
    author: {
      id: 'author1',
      name: 'Priya Sharma',
      email: 'priya@vardhmanmills.com',
      avatar: '/images/authors/priya.jpg',
    },
    publishedAt: new Date('2024-03-15').toISOString(),
    readingTime: 8,
  },
  'sustainable-furniture-trends-2024': {
    id: '2',
    slug: 'sustainable-furniture-trends-2024',
    title: 'Sustainable Furniture Trends to Watch in 2024',
    excerpt: 'Discover the latest eco-friendly furniture trends shaping the industry this year.',
    content: '<h2>Recycled Materials</h2><p>More manufacturers are using recycled plastics and metals...</p>',
    author: {
      id: 'author2',
      name: 'Rahul Mehta',
      email: 'rahul@vardhmanmills.com',
      avatar: '/images/authors/rahul.jpg',
    },
    publishedAt: new Date('2024-03-20').toISOString(),
    readingTime: 6,
  },
};

const MOCK_COMMENTS: Record<string, Comment[]> = {
  '1': [
    {
      id: 'comment1',
      postId: '1',
      authorName: 'Anita Desai',
      authorEmail: 'anita@example.com',
      content: 'Great article! Very helpful tips for first-time furniture buyers.',
      likes: 12,
      createdAt: new Date('2024-03-16').toISOString(),
    },
    {
      id: 'comment2',
      postId: '1',
      authorName: 'Vikram Singh',
      authorEmail: 'vikram@example.com',
      content: 'The space planning section was exactly what I needed. Thank you!',
      likes: 8,
      createdAt: new Date('2024-03-17').toISOString(),
    },
  ],
  '2': [
    {
      id: 'comment3',
      postId: '2',
      authorName: 'Maya Patel',
      authorEmail: 'maya@example.com',
      content: 'Love seeing more focus on sustainability in furniture design!',
      likes: 15,
      createdAt: new Date('2024-03-21').toISOString(),
    },
  ],
};

const MOCK_RELATED_POSTS: Record<string, RelatedPost[]> = {
  '1': [
    {
      id: '2',
      slug: 'sustainable-furniture-trends-2024',
      title: 'Sustainable Furniture Trends to Watch in 2024',
      excerpt: 'Discover the latest eco-friendly furniture trends.',
      featuredImage: {
        id: 'img2',
        url: '/images/blog/sustainable-furniture.jpg',
        alt: 'Sustainable Furniture',
        width: 600,
        height: 400,
      },
      publishedAt: new Date('2024-03-20').toISOString(),
      readingTime: 6,
      author: {
        id: 'author2',
        name: 'Rahul Mehta',
        avatar: '/images/authors/rahul.jpg',
      },
    },
  ],
  '2': [
    {
      id: '1',
      slug: 'choosing-perfect-furniture-home',
      title: 'How to Choose the Perfect Furniture for Your Home',
      excerpt: 'A comprehensive guide to selecting furniture.',
      featuredImage: {
        id: 'img1',
        url: '/images/blog/furniture-guide.jpg',
        alt: 'Furniture Guide',
        width: 600,
        height: 400,
      },
      publishedAt: new Date('2024-03-15').toISOString(),
      readingTime: 8,
      author: {
        id: 'author1',
        name: 'Priya Sharma',
        avatar: '/images/authors/priya.jpg',
      },
    },
  ],
};

// ============================================================================
// API HANDLERS
// ============================================================================

/**
 * GET /api/blog/[slug]
 * Fetch single blog post with related content
 */
export async function GET(
  request: NextRequest,
  { params }: BlogRouteParams
): Promise<NextResponse> {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Blog post slug is required' },
        { status: 400 }
      );
    }

    // Try backend first
    try {
      const response = await fetchWithTimeout(
        `${BACKEND_URL}/blog/${slug}`,
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
    const post = MOCK_BLOG_DATA[slug];

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    const comments = MOCK_COMMENTS[post.id] || [];
    const relatedPosts = MOCK_RELATED_POSTS[post.id] || [];

    const responseData: BlogPostWithRelated = {
      post,
      relatedPosts,
      comments,
      totalComments: comments.length,
    };

    return NextResponse.json(
      {
        success: true,
        data: responseData,
        source: 'mock',
      },
      {
        headers: {
          'Cache-Control': `public, s-maxage=${CACHE_TIME}, stale-while-revalidate`,
        },
      }
    );
  } catch (error) {
    console.error('[Blog Slug API Error - GET]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch blog post',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/blog/[slug]
 * Update blog post (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: BlogRouteParams
): Promise<NextResponse> {
  try {
    const { slug } = await params;
    const body = await request.json();

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Blog post slug is required' },
        { status: 400 }
      );
    }

    // Validate slug format
    if (slug !== generateSlug(slug)) {
      return NextResponse.json(
        { success: false, error: 'Invalid slug format' },
        { status: 400 }
      );
    }

    // Try backend
    try {
      const response = await fetchWithTimeout(
        `${BACKEND_URL}/blog/${slug}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(
          { success: true, data, source: 'backend' }
        );
      }
    } catch (error) {
      console.warn('Backend unavailable:', error);
    }

    // Mock response
    const existingPost = MOCK_BLOG_DATA[slug];

    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    const updatedPost: SimpleBlogPost = {
      ...existingPost,
      ...body,
    };

    return NextResponse.json(
      {
        success: true,
        data: updatedPost,
        source: 'mock',
        message: 'Updated in demo mode',
      }
    );
  } catch (error) {
    console.error('[Blog Slug API Error - PUT]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update blog post',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/blog/[slug]
 * Delete blog post (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: BlogRouteParams
): Promise<NextResponse> {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Blog post slug is required' },
        { status: 400 }
      );
    }

    // Try backend
    try {
      const response = await fetchWithTimeout(
        `${BACKEND_URL}/blog/${slug}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(
          { success: true, data, source: 'backend' }
        );
      }
    } catch (error) {
      console.warn('Backend unavailable:', error);
    }

    // Mock response
    const existingPost = MOCK_BLOG_DATA[slug];

    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: { deleted: true, slug },
        source: 'mock',
        message: 'Deleted in demo mode',
      }
    );
  } catch (error) {
    console.error('[Blog Slug API Error - DELETE]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete blog post',
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/blog/[slug]
 * Return allowed methods
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
