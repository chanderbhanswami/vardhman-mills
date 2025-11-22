/**
 * General Image Upload API Route
 * 
 * Handles generic image uploads for various purposes:
 * - Product images
 * - Review images
 * - Support ticket attachments
 * - Blog post images
 * - Gallery images
 * 
 * Implements comprehensive validation, optimization, and security checks.
 * 
 * @module api/upload/image
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES_PER_REQUEST = 10;
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/bmp',
];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.bmp'];

// Upload context types
type UploadContext = 
  | 'product' 
  | 'review' 
  | 'support' 
  | 'blog' 
  | 'gallery' 
  | 'profile' 
  | 'category' 
  | 'brand'
  | 'other';

// Types
interface UploadedImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  mediumUrl: string;
  largeUrl: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  dimensions: {
    width: number;
    height: number;
  };
  context: UploadContext;
  contextId?: string;
  uploadedBy: string;
  uploadedAt: string;
  metadata?: Record<string, unknown>;
}

interface MultipleUploadResponse {
  success: boolean;
  data: {
    images: UploadedImage[];
    failed: Array<{
      filename: string;
      error: string;
    }>;
    summary: {
      total: number;
      successful: number;
      failed: number;
    };
    message: string;
  };
  timestamp: string;
}

interface SingleUploadResponse {
  success: boolean;
  data: {
    image: UploadedImage;
    message: string;
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

// Validation schema for query parameters
const uploadParamsSchema = z.object({
  context: z.enum([
    'product',
    'review',
    'support',
    'blog',
    'gallery',
    'profile',
    'category',
    'brand',
    'other',
  ]).optional().default('other'),
  contextId: z.string().optional(),
  optimize: z.enum(['true', 'false']).optional().default('true'),
  watermark: z.enum(['true', 'false']).optional().default('false'),
  generateThumbnails: z.enum(['true', 'false']).optional().default('true'),
});

/**
 * Validate file type
 */
function isValidFileType(file: File): boolean {
  return ALLOWED_FILE_TYPES.includes(file.type);
}

/**
 * Validate file extension
 */
function isValidExtension(filename: string): boolean {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return ALLOWED_EXTENSIONS.includes(extension);
}

/**
 * Generate unique filename
 */
function generateFilename(originalFilename: string, context: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
  return `${context}-${timestamp}-${random}${extension}`;
}

/**
 * POST /api/upload/image
 * 
 * Upload single or multiple images
 * 
 * Query Parameters:
 * - context: Upload context (product, review, support, blog, gallery, profile, category, brand, other)
 * - contextId: Optional ID related to the context (e.g., product ID, review ID)
 * - optimize: Whether to optimize images (true/false, default: true)
 * - watermark: Whether to add watermark (true/false, default: false)
 * - generateThumbnails: Whether to generate thumbnails (true/false, default: true)
 * 
 * FormData:
 * - files: Image file(s) (required, can be single or multiple)
 * - alt: Alt text for images (optional, JSON string for multiple)
 * - title: Title for images (optional, JSON string for multiple)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    const guestSessionId = cookieStore.get('guest_session_id')?.value;

    if (!authToken && !guestSessionId) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication or guest session required to upload images',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const params = uploadParamsSchema.parse({
      context: searchParams.get('context') || undefined,
      contextId: searchParams.get('contextId') || undefined,
      optimize: searchParams.get('optimize') || undefined,
      watermark: searchParams.get('watermark') || undefined,
      generateThumbnails: searchParams.get('generateThumbnails') || undefined,
    });

    // Parse multipart form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (files.length === 0) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'No files provided',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    if (files.length > MAX_FILES_PER_REQUEST) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'TOO_MANY_FILES',
            message: `Maximum ${MAX_FILES_PER_REQUEST} files allowed per request`,
            details: {
              filesCount: files.length,
              maxFiles: MAX_FILES_PER_REQUEST,
            },
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Validate each file
    const validationErrors: Array<{ filename: string; error: string }> = [];

    for (const file of files) {
      // Validate file type
      if (!isValidFileType(file)) {
        validationErrors.push({
          filename: file.name,
          error: `Invalid file type: ${file.type}. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`,
        });
        continue;
      }

      // Validate file extension
      if (!isValidExtension(file.name)) {
        validationErrors.push({
          filename: file.name,
          error: `Invalid file extension. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`,
        });
        continue;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        validationErrors.push({
          filename: file.name,
          error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        });
        continue;
      }
    }

    if (validationErrors.length === files.length) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'ALL_FILES_INVALID',
            message: 'All files failed validation',
            details: validationErrors,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Get optional metadata
    const altTexts = formData.get('alt') as string | null;
    const titles = formData.get('title') as string | null;

    let altTextArray: string[] = [];
    let titleArray: string[] = [];

    try {
      if (altTexts) {
        altTextArray = JSON.parse(altTexts);
      }
      if (titles) {
        titleArray = JSON.parse(titles);
      }
    } catch (parseError) {
      // If parsing fails, treat as single value
      console.warn('Failed to parse metadata:', parseError instanceof Error ? parseError.message : 'Unknown error');
      if (altTexts) altTextArray = [altTexts];
      if (titles) titleArray = [titles];
    }

    // Create FormData for backend
    const backendFormData = new FormData();

    // Add files with generated filenames for tracking
    files.forEach((file, index) => {
      const generatedName = generateFilename(file.name, params.context);
      console.log(`File ${index + 1}: ${file.name} -> ${generatedName}`);
      backendFormData.append('files', file);
    });

    // Add metadata
    const metadata = {
      context: params.context,
      contextId: params.contextId,
      optimize: params.optimize === 'true',
      watermark: params.watermark === 'true',
      generateThumbnails: params.generateThumbnails === 'true',
      altTexts: altTextArray,
      titles: titleArray,
      uploadedBy: authToken ? 'user' : 'guest',
      guestSessionId: guestSessionId || undefined,
      uploadedAt: new Date().toISOString(),
    };
    backendFormData.append('metadata', JSON.stringify(metadata));

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/upload/image`;
    
    const headers: HeadersInit = {
      // Don't set Content-Type - browser will set it with boundary for multipart/form-data
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: backendFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 413) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'PAYLOAD_TOO_LARGE',
              message: 'Total file size exceeds server limits',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 413 }
        );
      }

      if (response.status === 415) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'UNSUPPORTED_MEDIA_TYPE',
              message: 'Unsupported media type',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 415 }
        );
      }

      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UPLOAD_FAILED',
            message: errorData.message || 'Failed to upload images',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Handle single vs multiple uploads
    if (files.length === 1 && validationErrors.length === 0) {
      const responseData: SingleUploadResponse = {
        success: true,
        data: {
          image: data.data?.images?.[0] || data.data?.image || data.image,
          message: 'Image uploaded successfully',
        },
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(responseData, { status: 201 });
    } else {
      const responseData: MultipleUploadResponse = {
        success: true,
        data: {
          images: data.data?.images || [],
          failed: [...validationErrors, ...(data.data?.failed || [])],
          summary: {
            total: files.length,
            successful: (data.data?.images?.length || 0),
            failed: validationErrors.length + (data.data?.failed?.length || 0),
          },
          message: `${data.data?.images?.length || 0} of ${files.length} images uploaded successfully`,
        },
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(responseData, { status: 201 });
    }
  } catch (error) {
    console.error('Image Upload API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while uploading images',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/upload/image
 * 
 * Get uploaded images by context
 * 
 * Query Parameters:
 * - context: Upload context (required)
 * - contextId: Context ID (optional)
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    const guestSessionId = cookieStore.get('guest_session_id')?.value;

    if (!authToken && !guestSessionId) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication or guest session required to view images',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const context = searchParams.get('context');
    const contextId = searchParams.get('contextId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Build query string
    const queryParams = new URLSearchParams();
    if (context) queryParams.append('context', context);
    if (contextId) queryParams.append('contextId', contextId);
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/upload/image?${queryParams.toString()}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'FETCH_FAILED',
            message: errorData.message || 'Failed to fetch images',
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
        data: data.data || data,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Get Images API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching images',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/upload/image
 * 
 * Delete uploaded image(s)
 * 
 * Body:
 * - imageIds: Array of image IDs to delete
 * - permanent: Whether to permanently delete (default: false, soft delete)
 */
export async function DELETE(request: NextRequest) {
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
            message: 'Authentication required to delete images',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { imageIds, permanent = false } = body;

    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'imageIds array is required and must not be empty',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/upload/image`;
    
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ imageIds, permanent }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'DELETE_FAILED',
            message: errorData.message || 'Failed to delete images',
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
          deleted: data.data?.deleted || imageIds.length,
          message: `${data.data?.deleted || imageIds.length} image(s) deleted successfully`,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete Images API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while deleting images',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
