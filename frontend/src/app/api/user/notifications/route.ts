/**
 * User Notifications API Route
 * 
 * Manages user notifications and alerts.
 * Supports push notifications, in-app notifications,
 * email notifications, SMS notifications, and notification preferences.
 * 
 * @module api/user/notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation schemas
const updatePreferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  orderUpdates: z.boolean().optional(),
  promotions: z.boolean().optional(),
  newsletter: z.boolean().optional(),
  productUpdates: z.boolean().optional(),
  priceDropAlerts: z.boolean().optional(),
  backInStockAlerts: z.boolean().optional(),
  wishlistUpdates: z.boolean().optional(),
  reviewReminders: z.boolean().optional(),
  accountActivity: z.boolean().optional(),
  securityAlerts: z.boolean().optional(),
  frequency: z.enum(['realtime', 'daily', 'weekly', 'monthly']).optional(),
  quietHours: z.object({
    enabled: z.boolean(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  }).optional(),
});

const markAsReadSchema = z.object({
  notificationIds: z.array(z.string()).min(1, 'At least one notification ID is required'),
  markAll: z.boolean().optional().default(false),
});

const deviceTokenSchema = z.object({
  token: z.string().min(1, 'Device token is required'),
  platform: z.enum(['ios', 'android', 'web']),
  deviceName: z.string().optional(),
  deviceModel: z.string().optional(),
});

// Types
type NotificationType = 
  | 'order_placed'
  | 'order_confirmed'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_cancelled'
  | 'order_refunded'
  | 'payment_received'
  | 'payment_failed'
  | 'price_drop'
  | 'back_in_stock'
  | 'wishlist_sale'
  | 'review_request'
  | 'review_response'
  | 'account_created'
  | 'password_changed'
  | 'security_alert'
  | 'promotion'
  | 'newsletter'
  | 'system';

type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  actionUrl?: string;
  actionText?: string;
  imageUrl?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  expiresAt?: string;
}

interface NotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  newsletter: boolean;
  productUpdates: boolean;
  priceDropAlerts: boolean;
  backInStockAlerts: boolean;
  wishlistUpdates: boolean;
  reviewReminders: boolean;
  accountActivity: boolean;
  securityAlerts: boolean;
  frequency: 'realtime' | 'daily' | 'weekly' | 'monthly';
  quietHours?: {
    enabled: boolean;
    startTime?: string;
    endTime?: string;
  };
  updatedAt: string;
}

interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    unreadCount: number;
    total: number;
    hasMore: boolean;
    page: number;
    limit: number;
  };
  timestamp: string;
}

interface PreferencesResponse {
  success: boolean;
  data: {
    preferences: NotificationPreferences;
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
 * GET /api/user/notifications
 * 
 * Get user notifications
 * 
 * Query Parameters:
 * - type: Filter by notification type
 * - isRead: Filter by read status (true/false)
 * - priority: Filter by priority (low, medium, high, urgent)
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20)
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
            message: 'Authentication required to view notifications',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const isRead = searchParams.get('isRead');
    const priority = searchParams.get('priority');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Build query string
    const queryParams = new URLSearchParams();
    if (type) queryParams.append('type', type);
    if (isRead !== null) queryParams.append('isRead', isRead || 'false');
    if (priority) queryParams.append('priority', priority);
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/user/notifications?${queryParams.toString()}`;
    
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
            message: errorData.message || 'Failed to fetch notifications',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: NotificationsResponse = {
      success: true,
      data: {
        notifications: data.data?.notifications || [],
        unreadCount: data.data?.unreadCount || 0,
        total: data.data?.total || 0,
        hasMore: data.data?.hasMore || false,
        page: data.data?.page || page,
        limit: data.data?.limit || limit,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Get Notifications API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching notifications',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/notifications
 * 
 * Update notifications (mark as read) or preferences
 * 
 * Body for marking as read:
 * - notificationIds: Array of notification IDs
 * - markAll: Boolean to mark all as read (optional)
 * 
 * Body for updating preferences:
 * - preferences: Notification preferences object
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
            message: 'Authentication required to update notifications',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Check if updating preferences
    if (body.preferences) {
      let validatedData;
      try {
        validatedData = updatePreferencesSchema.parse(body.preferences);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return NextResponse.json<ErrorResponse>(
            {
              success: false,
              error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid notification preferences',
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
      const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/user/notifications/preferences`;
      
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
              code: 'UPDATE_PREFERENCES_FAILED',
              message: errorData.message || 'Failed to update notification preferences',
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
          message: 'Notification preferences updated successfully',
        },
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(responseData, { status: 200 });
    }

    // Mark as read operation
    let validatedData;
    try {
      validatedData = markAsReadSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid data for marking notifications as read',
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
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/user/notifications/read`;
    
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
            code: 'MARK_READ_FAILED',
            message: errorData.message || 'Failed to mark notifications as read',
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
          markedCount: data.data?.markedCount || validatedData.notificationIds.length,
          message: `${data.data?.markedCount || validatedData.notificationIds.length} notification(s) marked as read`,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update Notifications API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while updating notifications',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/notifications
 * 
 * Register device for push notifications
 * 
 * Body:
 * - token: Device token (required)
 * - platform: Platform (ios, android, web)
 * - deviceName: Device name (optional)
 * - deviceModel: Device model (optional)
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
            message: 'Authentication required to register device',
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
      validatedData = deviceTokenSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid device token data',
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
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/user/notifications/device`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
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
            code: 'REGISTER_DEVICE_FAILED',
            message: errorData.message || 'Failed to register device',
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
          device: data.data?.device || data.device,
          message: 'Device registered for push notifications successfully',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register Device API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while registering device',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/notifications
 * 
 * Delete notification(s) or unregister device
 * 
 * Body:
 * - notificationIds: Array of notification IDs (for deleting notifications)
 * OR
 * - deviceToken: Device token (for unregistering device)
 * - deleteAll: Boolean to delete all notifications (optional)
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
            message: 'Authentication required to delete notifications',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { notificationIds, deviceToken, deleteAll = false } = body;

    // Check if unregistering device
    if (deviceToken) {
      const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/user/notifications/device`;
      
      const response = await fetch(backendUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ deviceToken }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'UNREGISTER_DEVICE_FAILED',
              message: errorData.message || 'Failed to unregister device',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: response.status }
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: {
            message: 'Device unregistered successfully',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    // Delete notifications
    if (!notificationIds && !deleteAll) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'notificationIds array or deleteAll flag is required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/user/notifications`;
    
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ notificationIds, deleteAll }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'DELETE_FAILED',
            message: errorData.message || 'Failed to delete notifications',
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
          deleted: data.data?.deleted || (notificationIds?.length || 0),
          message: deleteAll 
            ? 'All notifications deleted successfully'
            : `${data.data?.deleted || notificationIds?.length || 0} notification(s) deleted successfully`,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete Notifications API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while deleting notifications',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
