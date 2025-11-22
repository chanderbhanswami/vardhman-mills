import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    console.log('Token:', token ? 'Present' : 'Missing');
    console.log('Backend URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/products/all`;
    console.log('Calling:', backendUrl);

    // Fetch from backend API
    const response = await fetch(backendUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Backend response status:', response.status);
    console.log('Backend response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Backend error response:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Backend response data keys:', Object.keys(data));
    console.log('Products count:', data.data?.products?.length || 0);
    
    return NextResponse.json({
      message: 'Test successful',
      backendData: data,
      productsCount: data.data?.products?.length || 0
    });
    
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
