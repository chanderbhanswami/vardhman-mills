/**
 * Dynamic OpenGraph Image for Blog Posts
 * 
 * @module app/(content)/blog/[...slug]/opengraph-image
 */

import { ImageResponse } from 'next/og';
import { blogApi } from '@/lib/api/blog';

export const runtime = 'edge';

export const alt = 'Vardhman Mills Blog Post';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

/**
 * Generate OpenGraph Image
 */
export default async function Image({ params }: { params: { slug: string[] } }) {
  const slug = params.slug.join('/');

  try {
    const blogData = await blogApi.getBlogBySlug(slug);
    const post = blogData?.data;

    if (!post) {
      return new ImageResponse(
        (
          <div
            style={{
              fontSize: 48,
              background: 'linear-gradient(to bottom right, #1e3a8a, #1e40af)',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            Post Not Found
          </div>
        ),
        { ...size }
      );
    }

    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(to bottom right, #1e3a8a, #3b82f6)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: '60px',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {/* Title */}
          <div
            style={{
              fontSize: 64,
              fontWeight: 'bold',
              color: 'white',
              lineHeight: 1.2,
              maxHeight: '400px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {post.title}
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {/* Author */}
              <div
                style={{
                  fontSize: 24,
                  color: 'rgba(255, 255, 255, 0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <span>{post.author.name}</span>
              </div>
            </div>

            {/* Brand */}
            <div
              style={{
                fontSize: 28,
                fontWeight: 'bold',
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                padding: '12px 24px',
                borderRadius: '8px',
              }}
            >
              Vardhman Mills
            </div>
          </div>
        </div>
      ),
      { ...size }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: 'linear-gradient(to bottom right, #1e3a8a, #1e40af)',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          Vardhman Mills Blog
        </div>
      ),
      { ...size }
    );
  }
}
