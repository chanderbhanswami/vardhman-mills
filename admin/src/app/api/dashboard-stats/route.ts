import { NextRequest, NextResponse } from 'next/server';

interface OrderData {
  _id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Server-side API call to backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/dashboard/stats`, {
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
      stats: data.data.stats,
      recentOrders: data.data.recentOrders?.map((order: OrderData) => ({
        _id: order._id,
        orderNumber: order.orderNumber,
        customer: `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || order.user?.email || 'Unknown',
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
      })) || [],
      topProducts: [] // We'll need to implement this separately
    });
    
  } catch (error) {
    console.error('Dashboard stats API error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
