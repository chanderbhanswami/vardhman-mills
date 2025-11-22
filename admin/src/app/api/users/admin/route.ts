import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Build query parameters
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(search && { search }),
      ...(status && { status }),
    });

    // Fetch from backend API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/users?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      status: 'success',
      customers: data.data?.customers || data.data || [],
      pagination: data.pagination || {
        currentPage: parseInt(page),
        totalPages: data.pagination?.pages || 1,
        totalItems: data.pagination?.total || 0,
        itemsPerPage: parseInt(limit),
        hasNext: parseInt(page) < (data.pagination?.pages || 1),
        hasPrev: parseInt(page) > 1,
      },
      total: data.pagination?.total || 0,
      totalPages: data.pagination?.pages || 1,
    });
    
  } catch (error) {
    console.error('Users API error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
