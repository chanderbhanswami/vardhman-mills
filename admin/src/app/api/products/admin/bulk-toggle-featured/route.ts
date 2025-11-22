import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productIds, isFeatured } = await request.json();

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: 'Product IDs are required' }, { status: 400 });
    }

    if (typeof isFeatured !== 'boolean') {
      return NextResponse.json({ error: 'isFeatured must be a boolean value' }, { status: 400 });
    }

    // Call backend API for bulk featured toggle
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products/admin/bulk-toggle-featured`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productIds, isFeatured }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      status: 'success',
      message: data.message,
      data: data.data
    });
    
  } catch (error) {
    console.error('Bulk toggle product featured API error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to toggle product featured status' 
    }, { status: 500 });
  }
}
