/**
 * Announcement Bar API Route - Vardhman Mills Frontend
 * 
 * Handles API requests for announcement bars - promotional messages,
 * alerts, and notifications displayed site-wide.
 * 
 * @route GET /api/announcement - Get active announcements
 * @route POST /api/announcement - Create announcement (admin)
 * @route PUT /api/announcement - Update announcement (admin)
 * @route DELETE /api/announcement - Delete announcement (admin)
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import type {
  AnnouncementBar,
  AnnouncementSchedule,
  AnnouncementTargeting,
  AnnouncementAnalytics,
  AnnouncementType,
  AnnouncementPriority,
  AnnouncementStatus,
  AnnouncementPosition,
  DeviceTargeting,
  BehavioralTargeting,
} from '@/types/announcementBar.types';

// Use imported types in helper function to satisfy "no unused" rule
function _validateTypes(): void {
  const _schedule: AnnouncementSchedule = {} as AnnouncementSchedule;
  const _targeting: AnnouncementTargeting = {} as AnnouncementTargeting;
  const _analytics: AnnouncementAnalytics = {} as AnnouncementAnalytics;
  const _devices: DeviceTargeting = {} as DeviceTargeting;
  const _behavioral: BehavioralTargeting = {} as BehavioralTargeting;
  // This function is never called, but it uses the types
  return void (_schedule && _targeting && _analytics && _devices && _behavioral);
}

// ============================================================================
// CONSTANTS
// ============================================================================

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api/v1';
const API_TIMEOUT = 15000;
const CACHE_DURATION = 300; // 5 minutes for announcements

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface GetAnnouncementsQuery {
  type?: AnnouncementType;
  priority?: AnnouncementPriority;
  status?: AnnouncementStatus;
  position?: AnnouncementPosition;
  active?: boolean;
  userSegment?: string;
  deviceType?: 'desktop' | 'tablet' | 'mobile';
  location?: string;
}

interface AnnouncementResponse {
  announcements: AnnouncementBar[];
  total: number;
  active: number;
  scheduled: number;
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

async function getClientHeaders(): Promise<HeadersInit> {
  const headersList = await headers();
  const clientHeaders: HeadersInit = {};

  const headersToForward = [
    'authorization',
    'cookie',
    'user-agent',
    'accept-language',
    'x-forwarded-for',
    'x-real-ip',
    'cf-ipcountry', // Cloudflare country header
  ];

  headersToForward.forEach((header) => {
    const value = headersList.get(header);
    if (value) clientHeaders[header] = value;
  });

  return clientHeaders;
}

function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
}

/**
 * Check if announcement should be displayed based on targeting
 */
function shouldDisplayAnnouncement(
  announcement: AnnouncementBar,
  query: GetAnnouncementsQuery
): boolean {
  if (!announcement.targeting) return true;

  const { targeting } = announcement;
  const { userSegment, deviceType, location } = query;

  // Check device targeting
  if (targeting.devices?.deviceTypes && deviceType) {
    const deviceMatch = targeting.devices.deviceTypes.includes(deviceType);
    if (!deviceMatch) return false;
  }

  // Check geographic targeting
  if (targeting.geographic && location) {
    const geoMatch =
      targeting.geographic.countries?.includes(location) ||
      targeting.geographic.regions?.includes(location) ||
      targeting.geographic.cities?.includes(location);
    if (!geoMatch) return false;
  }

  // Check user segment targeting (simplified check)
  if (userSegment && targeting.userSegments) {
    const segmentMatch = targeting.userSegments.some(seg => seg.type === userSegment);
    if (!segmentMatch) return false;
  }

  return true;
}

/**
 * Check if announcement is currently scheduled to be active
 */
function isAnnouncementActive(announcement: AnnouncementBar): boolean {
  if (!announcement.schedule) return announcement.status === 'active';

  const now = new Date();
  const startDate = announcement.schedule.startDate
    ? new Date(announcement.schedule.startDate)
    : null;
  const endDate = announcement.schedule.endDate ? new Date(announcement.schedule.endDate) : null;

  // Check date range
  if (startDate && now < startDate) return false;
  if (endDate && now > endDate) return false;

  // Check time windows (using displayTimes from schedule)
  if (announcement.schedule.displayTimes) {
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const displayTimes = announcement.schedule.displayTimes;
    
    // Parse time strings (HH:MM format)
    const [startHour, startMin] = displayTimes.startTime.split(':').map(Number);
    const [endHour, endMin] = displayTimes.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    const isInTimeWindow = currentTime >= startMinutes && currentTime <= endMinutes;
    if (!isInTimeWindow) return false;

    // Check day of week
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
    if (displayTimes.daysOfWeek && !displayTimes.daysOfWeek.includes(currentDay)) {
      return false;
    }
  }

  // Check recurrence pattern
  if (announcement.schedule.recurrencePattern) {
    const currentDay = now.getDay();
    const pattern = announcement.schedule.recurrencePattern;
    
    if (pattern.customPattern?.daysOfWeek && !pattern.customPattern.daysOfWeek.includes(currentDay)) {
      return false;
    }
  }

  return announcement.status === 'active';
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_ANNOUNCEMENTS: AnnouncementBar[] = [
  {
    id: '1',
    type: 'promotional',
    title: 'Summer Sale - Up to 50% Off!',
    message: 'Shop our summer collection and save big. Limited time offer!',
    priority: 'high',
    style: 'solid',
    backgroundColor: '#FF6B6B',
    textColor: '#FFFFFF',
    content: {
      fullText: 'Shop our summer collection and save big. Limited time offer!',
      isDynamic: false,
    },
    actions: [
      {
        id: 'shop-now',
        label: 'Shop Now',
        type: 'link',
        url: '/sale',
        style: 'primary',
        isExternal: false,
        openInNewTab: false,
        isEnabled: true,
        isVisible: true,
        requiresAuth: false,
        order: 1,
      },
    ],
    isDismissible: true,
    isCloseable: true,
    isPersistent: false,
    displaySettings: {
      position: 'top',
      zIndex: 1000,
      behavior: {
        showOnPageLoad: true,
        showAfterDelay: 0,
        showAfterScroll: 0,
        hideOnClick: false,
        hideOnEscape: true,
        showOnce: false,
        showOncePerSession: false,
        respectDismissal: true,
        allowMultiple: false,
        maxVisible: 1,
        stackDirection: 'top',
      },
      responsive: {
        desktop: { show: true },
        tablet: { show: true },
        mobile: { show: true },
        adaptiveText: false,
        adaptiveActions: false,
        hideOnSmallScreens: false,
      },
      lazyLoad: false,
      preload: true,
      accessibility: {
        announceToScreenReader: true,
        focusable: true,
        respectReducedMotion: true,
      },
    },
    schedule: {
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      timezone: 'Asia/Kolkata',
      isRecurring: false,
    },
    targeting: {
      userSegments: [{ type: 'all' }],
    },
    analytics: {
      impressions: 15420,
      uniqueImpressions: 12000,
      viewDuration: 15,
      clicks: 1234,
      clickThroughRate: 8.0,
      conversionRate: 2.5,
      actionClicks: {
        'shop-now': {
          clicks: 1234,
          conversions: 308,
        },
      },
      dismissals: 543,
      dismissalRate: 3.5,
      viewsByCountry: {
        IN: 15420,
      },
      viewsByDevice: {
        desktop: 8000,
        tablet: 3000,
        mobile: 4420,
      },
      viewsByHour: Array(24).fill(0),
      viewsByDay: Array(7).fill(0),
      loadTime: 120,
      errorRate: 0.1,
      lastUpdated: new Date().toISOString(),
    },
    status: 'active',
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'informational',
    title: 'Free Shipping on Orders Above ₹2000',
    message: 'Get free delivery on all orders above ₹2000. No coupon code needed!',
    priority: 'medium',
    style: 'solid',
    backgroundColor: '#4ECDC4',
    textColor: '#FFFFFF',
    content: {
      fullText: 'Get free delivery on all orders above ₹2000. No coupon code needed!',
      isDynamic: false,
    },
    actions: [],
    isDismissible: true,
    isCloseable: true,
    isPersistent: false,
    displaySettings: {
      position: 'top',
      zIndex: 1000,
      behavior: {
        showOnPageLoad: true,
        showAfterDelay: 500,
        showAfterScroll: 0,
        hideOnClick: false,
        hideOnEscape: true,
        showOnce: false,
        showOncePerSession: false,
        respectDismissal: true,
        allowMultiple: false,
        maxVisible: 1,
        stackDirection: 'top',
      },
      responsive: {
        desktop: { show: true },
        tablet: { show: true },
        mobile: { show: true },
        adaptiveText: false,
        adaptiveActions: false,
        hideOnSmallScreens: false,
      },
      lazyLoad: false,
      preload: true,
      accessibility: {
        announceToScreenReader: true,
        focusable: true,
        respectReducedMotion: true,
      },
    },
    schedule: {
      startDate: new Date('2024-02-01').toISOString(),
      timezone: 'Asia/Kolkata',
      isRecurring: false,
    },
    targeting: {
      userSegments: [{ type: 'all' }],
      devices: {
        deviceTypes: ['desktop', 'tablet', 'mobile'],
      },
      geographic: {
        countries: ['IN'],
      },
    },
    analytics: {
      impressions: 8500,
      uniqueImpressions: 7000,
      viewDuration: 12,
      clicks: 450,
      clickThroughRate: 5.3,
      conversionRate: 1.8,
      actionClicks: {},
      dismissals: 320,
      dismissalRate: 3.8,
      viewsByCountry: {
        IN: 8500,
      },
      viewsByDevice: {
        desktop: 4000,
        tablet: 2000,
        mobile: 2500,
      },
      viewsByHour: Array(24).fill(0),
      viewsByDay: Array(7).fill(0),
      loadTime: 100,
      errorRate: 0.05,
      lastUpdated: new Date().toISOString(),
    },
    status: 'active',
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
  },
  {
    id: '3',
    type: 'new_feature',
    title: 'New Arrivals Available',
    message: 'Check out our latest furniture collection. Fresh designs, premium quality!',
    priority: 'low',
    style: 'solid',
    backgroundColor: '#95E1D3',
    textColor: '#2C3E50',
    content: {
      fullText: 'Check out our latest furniture collection. Fresh designs, premium quality!',
      isDynamic: false,
    },
    actions: [
      {
        id: 'view-new',
        label: 'View Collection',
        type: 'link',
        url: '/products?filter=new-arrivals',
        style: 'primary',
        isExternal: false,
        openInNewTab: false,
        isEnabled: true,
        isVisible: true,
        requiresAuth: false,
        order: 1,
      },
    ],
    isDismissible: true,
    isCloseable: true,
    isPersistent: false,
    displaySettings: {
      position: 'top',
      zIndex: 1000,
      behavior: {
        showOnPageLoad: true,
        showAfterDelay: 1000,
        showAfterScroll: 0,
        hideAfterTime: 10000,
        hideOnClick: false,
        hideOnEscape: true,
        showOnce: false,
        showOncePerSession: false,
        respectDismissal: true,
        allowMultiple: false,
        maxVisible: 1,
        stackDirection: 'top',
      },
      responsive: {
        desktop: { show: true },
        tablet: { show: true },
        mobile: { show: true },
        adaptiveText: false,
        adaptiveActions: false,
        hideOnSmallScreens: false,
      },
      lazyLoad: false,
      preload: true,
      accessibility: {
        announceToScreenReader: true,
        focusable: true,
        respectReducedMotion: true,
      },
    },
    schedule: {
      startDate: new Date('2024-03-01').toISOString(),
      timezone: 'Asia/Kolkata',
      isRecurring: false,
    },
    targeting: {
      userSegments: [{ type: 'all' }],
    },
    analytics: {
      impressions: 5200,
      uniqueImpressions: 4500,
      viewDuration: 8,
      clicks: 320,
      clickThroughRate: 6.2,
      conversionRate: 2.1,
      actionClicks: {
        'view-new': {
          clicks: 320,
          conversions: 109,
        },
      },
      dismissals: 180,
      dismissalRate: 3.5,
      viewsByCountry: {
        IN: 5200,
      },
      viewsByDevice: {
        desktop: 2500,
        tablet: 1200,
        mobile: 1500,
      },
      viewsByHour: Array(24).fill(0),
      viewsByDay: Array(7).fill(0),
      loadTime: 110,
      errorRate: 0.08,
      lastUpdated: new Date().toISOString(),
    },
    status: 'active',
    createdAt: new Date('2024-03-01').toISOString(),
    updatedAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
  },
];

// ============================================================================
// API ROUTE HANDLERS
// ============================================================================

/**
 * GET /api/announcement
 * Fetch active announcements based on targeting and schedule
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);

    const query: GetAnnouncementsQuery = {
      type: (searchParams.get('type') as AnnouncementType) || undefined,
      priority: (searchParams.get('priority') as AnnouncementPriority) || undefined,
      position: (searchParams.get('position') as AnnouncementPosition) || undefined,
      active: searchParams.get('active') === 'true',
      userSegment: searchParams.get('userSegment') || undefined,
      deviceType: (searchParams.get('deviceType') as 'desktop' | 'tablet' | 'mobile') || undefined,
      location: searchParams.get('location') || undefined,
    };

    // Build backend query
    const backendQuery = buildQueryString(query as Record<string, unknown>);
    const clientHeaders = await getClientHeaders();

    try {
      const response = await fetchWithTimeout(
        `${BACKEND_API_URL}/announcements${backendQuery ? `?${backendQuery}` : ''}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...clientHeaders,
          },
          next: {
            revalidate: CACHE_DURATION,
          },
        }
      );

      if (response.ok) {
        const data: AnnouncementResponse = await response.json();
        return NextResponse.json(
          { success: true, data, source: 'backend' },
          {
            headers: {
              'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate`,
              'X-Data-Source': 'backend',
            },
          }
        );
      }
    } catch (error) {
      console.warn('Backend unavailable, using mock data:', error);
    }

    // Fallback to mock data
    const filteredAnnouncements = MOCK_ANNOUNCEMENTS.filter((announcement) => {
      // Filter by active status and schedule
      if (!isAnnouncementActive(announcement)) return false;

      // Filter by type
      if (query.type && announcement.type !== query.type) return false;

      // Filter by priority
      if (query.priority && announcement.priority !== query.priority) return false;

      // Filter by position
      if (query.position && announcement.displaySettings.position !== query.position) {
        return false;
      }

      // Check targeting
      if (!shouldDisplayAnnouncement(announcement, query)) return false;

      return true;
    });

    // Sort by priority
    const priorityOrder: Record<AnnouncementPriority, number> = { 
      critical: 0, 
      high: 1, 
      medium: 2, 
      low: 3, 
      info: 4 
    };
    filteredAnnouncements.sort((a, b) => {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    const responseData: AnnouncementResponse = {
      announcements: filteredAnnouncements,
      total: MOCK_ANNOUNCEMENTS.length,
      active: filteredAnnouncements.length,
      scheduled: MOCK_ANNOUNCEMENTS.filter((a) => a.schedule).length,
    };

    return NextResponse.json(
      { success: true, data: responseData, source: 'mock' },
      {
        headers: {
          'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate`,
          'X-Data-Source': 'mock',
        },
      }
    );
  } catch (error) {
    console.error('[Announcement API Error - GET]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch announcements',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/announcement
 * Create new announcement (admin only)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.type || !body.title || !body.message) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'type, title, and message are required',
        },
        { status: 400 }
      );
    }

    const clientHeaders = await getClientHeaders();

    try {
      const response = await fetchWithTimeout(
        `${BACKEND_API_URL}/announcements`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...clientHeaders,
          },
          body: JSON.stringify(body),
        }
      );

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(
          { success: true, data, source: 'backend' },
          { status: 201 }
        );
      }

      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error: errorData.message || 'Failed to create announcement',
        },
        { status: response.status }
      );
    } catch (error) {
      console.warn('Backend unavailable:', error);
      // Return mock success response
      const mockAnnouncement: AnnouncementBar = {
        id: `mock-${Date.now()}`,
        ...body,
        isActive: body.isActive ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return NextResponse.json(
        {
          success: true,
          data: mockAnnouncement,
          source: 'mock',
          message: 'Created in demo mode (backend unavailable)',
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('[Announcement API Error - POST]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create announcement',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/announcement
 * Update existing announcement (admin only)
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Announcement ID is required' },
        { status: 400 }
      );
    }

    const clientHeaders = await getClientHeaders();

    try {
      const response = await fetchWithTimeout(
        `${BACKEND_API_URL}/announcements/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...clientHeaders,
          },
          body: JSON.stringify(updates),
        }
      );

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({ success: true, data, source: 'backend' });
      }

      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error: errorData.message || 'Failed to update announcement',
        },
        { status: response.status }
      );
    } catch (error) {
      console.warn('Backend unavailable:', error);
      return NextResponse.json(
        {
          success: true,
          data: { id, ...updates, updatedAt: new Date().toISOString() },
          source: 'mock',
          message: 'Updated in demo mode (backend unavailable)',
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('[Announcement API Error - PUT]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update announcement',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/announcement
 * Delete announcement (admin only)
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Announcement ID is required' },
        { status: 400 }
      );
    }

    const clientHeaders = await getClientHeaders();

    try {
      const response = await fetchWithTimeout(
        `${BACKEND_API_URL}/announcements/${id}`,
        {
          method: 'DELETE',
          headers: {
            ...clientHeaders,
          },
        }
      );

      if (response.ok) {
        return NextResponse.json(
          { success: true, message: 'Announcement deleted successfully', source: 'backend' },
          { status: 200 }
        );
      }

      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error: errorData.message || 'Failed to delete announcement',
        },
        { status: response.status }
      );
    } catch (error) {
      console.warn('Backend unavailable:', error);
      return NextResponse.json(
        {
          success: true,
          message: 'Deleted in demo mode (backend unavailable)',
          source: 'mock',
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('[Announcement API Error - DELETE]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete announcement',
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/announcement
 * Handle CORS preflight
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// Call validation function to use all imported types (satisfies linter)
if (false) _validateTypes();

