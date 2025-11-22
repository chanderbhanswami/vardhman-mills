/**
 * User Addresses API Route
 * 
 * Manages user addresses for shipping and billing.
 * Supports CRUD operations, default address management,
 * address validation, and address book functionality.
 * 
 * @module api/user/addresses
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation schemas
const addressSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  company: z.string().max(100).optional(),
  addressLine1: z.string().min(1, 'Address line 1 is required').max(200),
  addressLine2: z.string().max(200).optional(),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  postalCode: z.string().min(1, 'Postal code is required').max(20),
  country: z.string().min(1, 'Country is required').max(100),
  phone: z.string().min(10, 'Valid phone number is required').max(20),
  alternatePhone: z.string().max(20).optional(),
  email: z.string().email('Valid email is required').optional(),
  addressType: z.enum(['home', 'work', 'other']).default('home'),
  isDefault: z.boolean().default(false),
  isDefaultShipping: z.boolean().default(false),
  isDefaultBilling: z.boolean().default(false),
  label: z.string().max(50).optional(),
  landmark: z.string().max(200).optional(),
  instructions: z.string().max(500).optional(),
});

const updateAddressSchema = addressSchema.partial().extend({
  addressId: z.string().min(1, 'Address ID is required'),
});

const setDefaultSchema = z.object({
  addressId: z.string().min(1, 'Address ID is required'),
  type: z.enum(['shipping', 'billing', 'both']).default('both'),
});

// Types
interface Address {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  addressType: 'home' | 'work' | 'other';
  isDefault: boolean;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
  label?: string;
  landmark?: string;
  instructions?: string;
  isVerified: boolean;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface AddressesResponse {
  success: boolean;
  data: {
    addresses: Address[];
    defaultShipping?: Address;
    defaultBilling?: Address;
    total: number;
  };
  timestamp: string;
}

interface SingleAddressResponse {
  success: boolean;
  data: {
    address: Address;
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
 * GET /api/user/addresses
 * 
 * Get all user addresses
 * 
 * Query Parameters:
 * - type: Filter by address type (home, work, other)
 * - includeArchived: Include archived addresses (default: false)
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
            message: 'Authentication required to view addresses',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const includeArchived = searchParams.get('includeArchived') === 'true';

    // Build query string
    const queryParams = new URLSearchParams();
    if (type) queryParams.append('type', type);
    if (includeArchived) queryParams.append('includeArchived', 'true');

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/user/addresses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
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
            message: errorData.message || 'Failed to fetch addresses',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: AddressesResponse = {
      success: true,
      data: {
        addresses: data.data?.addresses || [],
        defaultShipping: data.data?.defaultShipping,
        defaultBilling: data.data?.defaultBilling,
        total: data.data?.total || data.data?.addresses?.length || 0,
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
    console.error('Get Addresses API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching addresses',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/addresses
 * 
 * Add new address or update existing
 * 
 * Body: Address data (see addressSchema)
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
            message: 'Authentication required to add address',
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
      validatedData = addressSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid address data',
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
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/user/addresses`;
    
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

      if (response.status === 409) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'ADDRESS_ALREADY_EXISTS',
              message: 'An identical address already exists',
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
            code: 'ADD_FAILED',
            message: errorData.message || 'Failed to add address',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: SingleAddressResponse = {
      success: true,
      data: {
        address: data.data?.address || data.address,
        message: 'Address added successfully',
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error('Add Address API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while adding address',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/addresses
 * 
 * Update existing address or set default
 * 
 * Body:
 * - addressId: Address ID (required)
 * - ...other address fields to update
 * OR
 * - addressId: Address ID (required)
 * - type: 'shipping' | 'billing' | 'both' (for setting default)
 * - setAsDefault: true (flag to indicate default setting operation)
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
            message: 'Authentication required to update address',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Check if this is a set default operation
    if (body.setAsDefault === true) {
      let validatedData;
      try {
        validatedData = setDefaultSchema.parse(body);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return NextResponse.json<ErrorResponse>(
            {
              success: false,
              error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid data for setting default address',
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
      const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/user/addresses/default`;
      
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
              code: 'SET_DEFAULT_FAILED',
              message: errorData.message || 'Failed to set default address',
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
            address: data.data?.address || data.address,
            message: `Default ${validatedData.type} address set successfully`,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    // Regular update operation
    let validatedData;
    try {
      validatedData = updateAddressSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid address data',
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
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/user/addresses`;
    
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

      if (response.status === 404) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'ADDRESS_NOT_FOUND',
              message: 'Address not found',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 404 }
        );
      }

      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: errorData.message || 'Failed to update address',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: SingleAddressResponse = {
      success: true,
      data: {
        address: data.data?.address || data.address,
        message: 'Address updated successfully',
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Update Address API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while updating address',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/addresses
 * 
 * Delete address(es)
 * 
 * Body:
 * - addressId: Single address ID (string)
 * OR
 * - addressIds: Multiple address IDs (array)
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
            message: 'Authentication required to delete address',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { addressId, addressIds, permanent = false } = body;

    if (!addressId && (!addressIds || !Array.isArray(addressIds) || addressIds.length === 0)) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'addressId or addressIds array is required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const idsToDelete = addressId ? [addressId] : addressIds;

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/user/addresses`;
    
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ addressIds: idsToDelete, permanent }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 404) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'ADDRESS_NOT_FOUND',
              message: 'One or more addresses not found',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 404 }
        );
      }

      if (response.status === 409) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'CANNOT_DELETE_DEFAULT',
              message: 'Cannot delete default address. Please set another address as default first.',
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
            code: 'DELETE_FAILED',
            message: errorData.message || 'Failed to delete address',
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
          deleted: data.data?.deleted || idsToDelete.length,
          message: `${data.data?.deleted || idsToDelete.length} address(es) deleted successfully`,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete Address API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while deleting address',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
