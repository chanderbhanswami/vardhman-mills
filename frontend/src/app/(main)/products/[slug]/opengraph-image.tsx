/**
 * Product OpenGraph Image - Vardhman Mills
 * Dynamic OG image generation for product pages
 * 
 * Note: Inline styles are required for Next.js ImageResponse API
 */

import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Product Image';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

interface Props {
  params: {
    slug: string;
  };
}

export default async function Image({ params }: Props) {
  const { slug } = params;

  // In production, fetch actual product data
  // For now, using mock data
  const productName = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Inline styles are required for Next.js ImageResponse API
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          padding: '80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '60px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              marginBottom: '20px',
              textAlign: 'center',
              lineHeight: 1.2,
            }}
          >
            {productName}
          </div>
          <div
            style={{
              fontSize: 32,
              opacity: 0.9,
              marginBottom: '40px',
            }}
          >
            Premium Quality Bedsheets
          </div>
          <div
            style={{
              fontSize: 28,
              background: 'white',
              color: '#667eea',
              padding: '15px 40px',
              borderRadius: '10px',
              fontWeight: 'bold',
            }}
          >
            Vardhman Mills
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
