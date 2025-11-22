import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { categoryIds } = await request.json();

    if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
      return NextResponse.json({ error: 'Category IDs are required' }, { status: 400 });
    }

    // Call backend API for bulk delete
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/categories/admin/bulk-delete`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ categoryIds }),
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
    console.error('Bulk delete categories API error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to delete categories' 
    }, { status: 500 });
  }
}
