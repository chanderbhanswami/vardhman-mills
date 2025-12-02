/**
 * Avatar Upload API Route
 * 
 * Handles user avatar/profile picture uploads.
 * Supports image validation, optimization, and cloud storage.
 * Implements file size limits, format validation, and security checks.
 * 
 * @module api/upload/avatar
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

// Types
interface UploadedAvatar {
  id: string;
  url: string;
  thumbnailUrl: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  dimensions: {
    width: number;
    height: number;
  };
  userId: string;
  uploadedAt: string;
}

interface AvatarUploadResponse {
  success: boolean;
  data: {
    avatar: UploadedAvatar;
    previousAvatar: {
      id: string;
      url: string;
      deletedAt: string;
    } | null;
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
function generateFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
  return `avatar-${timestamp}-${random}${extension}`;
}

/**
 * POST /api/upload/avatar
 * 
 * Upload user avatar/profile picture
 * 
 * FormData:
 * - file: Image file (required)
 * - crop: Crop coordinates (optional, JSON string)
 * - rotation: Rotation angle (optional)
 */
export async function POST(request: NextRequest) {
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
            message: 'Authentication required to upload avatar',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'No file provided',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!isValidFileType(file)) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: `Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`,
            details: {
              receivedType: file.type,
              allowedTypes: ALLOWED_FILE_TYPES,
            },
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Validate file extension
    if (!isValidExtension(file.name)) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'INVALID_FILE_EXTENSION',
            message: `Invalid file extension. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`,
            details: {
              filename: file.name,
              allowedExtensions: ALLOWED_EXTENSIONS,
            },
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
            details: {
              fileSize: file.size,
              maxSize: MAX_FILE_SIZE,
              fileSizeMB: (file.size / (1024 * 1024)).toFixed(2),
              maxSizeMB: MAX_FILE_SIZE / (1024 * 1024),
            },
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Get optional crop and rotation data
    const cropData = formData.get('crop') as string | null;
    const rotation = formData.get('rotation') as string | null;

    // Generate unique filename for tracking
    const generatedFilename = generateFilename(file.name);
    console.log('Uploading avatar:', file.name, '-> Generated:', generatedFilename);

    // Parse crop data if provided
    let crop = null;
    if (cropData) {
      try {
        crop = z.object({
          x: z.number(),
          y: z.number(),
          width: z.number(),
          height: z.number(),
        }).parse(JSON.parse(cropData));
      } catch (error) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'INVALID_CROP_DATA',
              message: 'Invalid crop data format',
              details: error instanceof Error ? error.message : 'Unknown error',
            },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
    }

    // Create FormData for backend
    const backendFormData = new FormData();
    backendFormData.append('file', file);
    
    if (crop) {
      backendFormData.append('crop', JSON.stringify(crop));
    }
    
    if (rotation) {
      backendFormData.append('rotation', rotation);
    }

    // Add metadata
    const metadata = {
      originalFilename: file.name,
      mimeType: file.type,
      size: file.size,
      uploadedBy: 'user',
      uploadedAt: new Date().toISOString(),
    };
    backendFormData.append('metadata', JSON.stringify(metadata));

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/upload/avatar`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        // Don't set Content-Type - browser will set it with boundary for multipart/form-data
      },
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
              message: 'File size exceeds server limits',
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
            message: errorData.message || 'Failed to upload avatar',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: AvatarUploadResponse = {
      success: true,
      data: {
        avatar: data.data?.avatar || data.avatar,
        previousAvatar: data.data?.previousAvatar || null,
        message: 'Avatar uploaded successfully',
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error('Avatar Upload API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while uploading avatar',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/upload/avatar
 * 
 * Delete user avatar (revert to default)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Log deletion request for audit trail
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    console.log('Avatar deletion requested:', {
      timestamp: new Date().toISOString(),
      userAgent,
    });

    // Check authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required to delete avatar',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/upload/avatar`;
    
    const response = await fetch(backendUrl, {
      method: 'DELETE',
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
            code: 'DELETE_FAILED',
            message: errorData.message || 'Failed to delete avatar',
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
          defaultAvatar: data.data?.defaultAvatar || null,
          message: 'Avatar deleted successfully',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete Avatar API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while deleting avatar',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/upload/avatar
 * 
 * Get user's current avatar
 */
export async function GET(request: NextRequest) {
  try {
    // Log request for analytics
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    console.log('Avatar fetch requested:', {
      timestamp: new Date().toISOString(),
      userAgent,
    });

    // Check authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required to get avatar',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/upload/avatar`;
    
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
            message: errorData.message || 'Failed to fetch avatar',
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
    console.error('Get Avatar API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching avatar',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

