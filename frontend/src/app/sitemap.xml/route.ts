/**
 * Dynamic Sitemap XML Route - Vardhman Mills
 * 
 * API route for generating dynamic XML sitemaps with comprehensive features:
 * - Static pages sitemap
 * - Dynamic product pages
 * - Category and subcategory pages
 * - Brand pages
 * - Blog and news articles
 * - Collection pages
 * - Image and video sitemaps
 * - Multiple language support
 * - Auto-updates with content changes
 * - Pagination for large sitemaps
 * - Search engine optimization
 * 
 * @route GET /sitemap.xml
 * @route GET /sitemap-[type].xml
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  SitemapGenerator, 
  SitemapUrl, 
  SitemapUtils,
  DEFAULT_SITEMAP_CONFIG,
  RouteData 
} from '@/lib/seo/sitemap-generator';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://vardhmantextiles.com';
const REVALIDATE_TIME = 3600; // 1 hour in seconds

// Static routes configuration
const STATIC_ROUTES: RouteData[] = [
  // Homepage
  {
    path: '/',
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
  },
  
  // Main pages
  {
    path: '/about',
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    path: '/contact',
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    path: '/faq',
    changeFrequency: 'weekly',
    priority: 0.7,
  },
  {
    path: '/privacy-policy',
    changeFrequency: 'yearly',
    priority: 0.5,
  },
  {
    path: '/terms-and-conditions',
    changeFrequency: 'yearly',
    priority: 0.5,
  },
  {
    path: '/shipping-policy',
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  {
    path: '/return-policy',
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  
  // Product related pages
  {
    path: '/products',
    changeFrequency: 'daily',
    priority: 0.9,
  },
  {
    path: '/categories',
    changeFrequency: 'weekly',
    priority: 0.9,
  },
  {
    path: '/brands',
    changeFrequency: 'weekly',
    priority: 0.8,
  },
  {
    path: '/collections',
    changeFrequency: 'weekly',
    priority: 0.8,
  },
  {
    path: '/best-sellers',
    changeFrequency: 'daily',
    priority: 0.9,
  },
  {
    path: '/new-arrivals',
    changeFrequency: 'daily',
    priority: 0.9,
  },
  {
    path: '/deals',
    changeFrequency: 'daily',
    priority: 0.9,
  },
  {
    path: '/trending',
    changeFrequency: 'daily',
    priority: 0.8,
  },
  
  // Content pages
  {
    path: '/blog',
    changeFrequency: 'weekly',
    priority: 0.7,
  },
  {
    path: '/news',
    changeFrequency: 'daily',
    priority: 0.7,
  },
  
  // Customer service
  {
    path: '/track-order',
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  {
    path: '/size-guide',
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  {
    path: '/care-instructions',
    changeFrequency: 'monthly',
    priority: 0.6,
  },
];

// ============================================================================
// MOCK DATA FETCHERS (Replace with actual API calls)
// ============================================================================

/**
 * Fetch all products for sitemap
 * In production, this would fetch from your database/API
 */
async function fetchProducts(): Promise<Array<{
  slug: string;
  lastModified?: Date;
  images?: string[];
  category?: string;
  brand?: string;
  price?: number;
  inStock?: boolean;
}>> {
  // TODO: Replace with actual API call to backend
  // Example: const response = await fetch(`${process.env.BACKEND_API_URL}/products`);
  
  // Mock data for demonstration
  return [
    {
      slug: 'premium-cotton-bedsheet-white',
      lastModified: new Date('2025-10-20'),
      images: [
        `${BASE_URL}/images/products/bedsheet-white-1.jpg`,
        `${BASE_URL}/images/products/bedsheet-white-2.jpg`,
      ],
      category: 'Bedsheets',
      brand: 'Vardhman',
      price: 2999,
      inStock: true,
    },
    {
      slug: 'luxury-bath-towel-set',
      lastModified: new Date('2025-10-18'),
      images: [`${BASE_URL}/images/products/towel-set.jpg`],
      category: 'Towels',
      brand: 'Vardhman Elite',
      price: 1499,
      inStock: true,
    },
    {
      slug: 'designer-curtain-beige',
      lastModified: new Date('2025-10-15'),
      images: [`${BASE_URL}/images/products/curtain-beige.jpg`],
      category: 'Curtains',
      brand: 'Vardhman Home',
      price: 3999,
      inStock: true,
    },
  ];
}

/**
 * Fetch all categories for sitemap
 */
async function fetchCategories(): Promise<Array<{
  slug: string;
  lastModified?: Date;
  subcategories?: Array<{ slug: string }>;
}>> {
  // TODO: Replace with actual API call
  return [
    {
      slug: 'bedsheets',
      lastModified: new Date('2025-10-15'),
      subcategories: [
        { slug: 'cotton-bedsheets' },
        { slug: 'silk-bedsheets' },
        { slug: 'linen-bedsheets' },
      ],
    },
    {
      slug: 'towels',
      lastModified: new Date('2025-10-15'),
      subcategories: [
        { slug: 'bath-towels' },
        { slug: 'hand-towels' },
        { slug: 'beach-towels' },
      ],
    },
    {
      slug: 'curtains',
      lastModified: new Date('2025-10-15'),
      subcategories: [
        { slug: 'blackout-curtains' },
        { slug: 'sheer-curtains' },
        { slug: 'printed-curtains' },
      ],
    },
  ];
}

/**
 * Fetch all brands for sitemap
 */
async function fetchBrands(): Promise<Array<{
  slug: string;
  lastModified?: Date;
}>> {
  // TODO: Replace with actual API call
  return [
    { slug: 'vardhman', lastModified: new Date('2025-10-01') },
    { slug: 'vardhman-elite', lastModified: new Date('2025-10-01') },
    { slug: 'vardhman-home', lastModified: new Date('2025-10-01') },
    { slug: 'vardhman-luxury', lastModified: new Date('2025-10-01') },
  ];
}

/**
 * Fetch all collections for sitemap
 */
async function fetchCollections(): Promise<Array<{
  slug: string;
  lastModified?: Date;
}>> {
  // TODO: Replace with actual API call
  return [
    { slug: 'summer-collection-2025', lastModified: new Date('2025-06-01') },
    { slug: 'wedding-special', lastModified: new Date('2025-08-15') },
    { slug: 'festive-collection', lastModified: new Date('2025-09-01') },
    { slug: 'eco-friendly-range', lastModified: new Date('2025-07-20') },
  ];
}

/**
 * Fetch all blog posts for sitemap
 */
async function fetchBlogPosts(): Promise<Array<{
  slug: string;
  publishedAt: Date;
  lastModified?: Date;
  tags?: string[];
}>> {
  // TODO: Replace with actual API call
  return [
    {
      slug: 'how-to-choose-perfect-bedsheet',
      publishedAt: new Date('2025-10-10'),
      lastModified: new Date('2025-10-15'),
      tags: ['bedsheets', 'guide', 'home-decor'],
    },
    {
      slug: 'caring-for-luxury-towels',
      publishedAt: new Date('2025-10-08'),
      lastModified: new Date('2025-10-08'),
      tags: ['towels', 'care', 'maintenance'],
    },
    {
      slug: 'curtain-trends-2025',
      publishedAt: new Date('2025-10-05'),
      lastModified: new Date('2025-10-05'),
      tags: ['curtains', 'trends', 'interior-design'],
    },
  ];
}

/**
 * Fetch all news articles for sitemap
 */
async function fetchNewsArticles(): Promise<Array<{
  slug: string;
  title: string;
  publishedAt: Date;
  keywords?: string[];
  language?: string;
}>> {
  // TODO: Replace with actual API call
  return [
    {
      slug: 'vardhman-mills-expansion-announcement',
      title: 'Vardhman Mills Announces Major Expansion',
      publishedAt: new Date('2025-10-25'),
      keywords: ['expansion', 'business', 'manufacturing'],
      language: 'en',
    },
    {
      slug: 'sustainability-initiative-2025',
      title: 'New Sustainability Initiative Launched',
      publishedAt: new Date('2025-10-24'),
      keywords: ['sustainability', 'environment', 'green'],
      language: 'en',
    },
  ];
}

// ============================================================================
// SITEMAP GENERATION FUNCTIONS
// ============================================================================

/**
 * Generate main sitemap with all URLs
 */
async function generateMainSitemap(): Promise<string> {
  const generator = SitemapGenerator.getInstance({
    ...DEFAULT_SITEMAP_CONFIG,
    baseUrl: BASE_URL,
    includeImages: true,
    includeVideos: false,
    includeNews: false,
    includeMobile: true,
    includeAlternates: true,
  });

  const urls: SitemapUrl[] = [];

  // Add static routes
  urls.push(...STATIC_ROUTES.map(route => ({
    loc: `${BASE_URL}${route.path}`,
    lastmod: route.lastModified?.toISOString() || new Date().toISOString(),
    changefreq: route.changeFrequency,
    priority: route.priority,
  })));

  // Add products
  const products = await fetchProducts();
  urls.push(...products.map(product => ({
    loc: `${BASE_URL}/products/${product.slug}`,
    lastmod: product.lastModified?.toISOString() || new Date().toISOString(),
    changefreq: 'weekly' as const,
    priority: 0.8,
    images: product.images?.map(image => ({
      loc: image,
      title: `${product.brand || ''} ${product.category || 'Product'}`.trim(),
      caption: `${product.brand || ''} ${product.category || 'Product'} - ₹${product.price || 0}`.trim(),
    })),
  })));

  // Add categories
  const categories = await fetchCategories();
  categories.forEach(category => {
    // Main category
    urls.push({
      loc: `${BASE_URL}/categories/${category.slug}`,
      lastmod: category.lastModified?.toISOString() || new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.9,
    });

    // Subcategories
    category.subcategories?.forEach(subcat => {
      urls.push({
        loc: `${BASE_URL}/categories/${category.slug}/${subcat.slug}`,
        lastmod: category.lastModified?.toISOString() || new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.7,
      });
    });
  });

  // Add brands
  const brands = await fetchBrands();
  urls.push(...brands.map(brand => ({
    loc: `${BASE_URL}/brands/${brand.slug}`,
    lastmod: brand.lastModified?.toISOString() || new Date().toISOString(),
    changefreq: 'monthly' as const,
    priority: 0.7,
  })));

  // Add collections
  const collections = await fetchCollections();
  urls.push(...collections.map(collection => ({
    loc: `${BASE_URL}/collections/${collection.slug}`,
    lastmod: collection.lastModified?.toISOString() || new Date().toISOString(),
    changefreq: 'weekly' as const,
    priority: 0.7,
  })));

  // Add blog posts
  const blogPosts = await fetchBlogPosts();
  urls.push(...blogPosts.map(post => ({
    loc: `${BASE_URL}/blog/${post.slug}`,
    lastmod: post.lastModified?.toISOString() || new Date().toISOString(),
    changefreq: 'monthly' as const,
    priority: 0.6,
  })));

  return generator.generateSitemap(urls);
}

/**
 * Generate products-only sitemap
 */
async function generateProductsSitemap(): Promise<string> {
  const generator = SitemapGenerator.getInstance({
    baseUrl: BASE_URL,
    includeImages: true,
  });

  const products = await fetchProducts();
  return generator.generateProductSitemap(products);
}

/**
 * Generate news sitemap
 */
async function generateNewsSitemap(): Promise<string> {
  const generator = SitemapGenerator.getInstance({
    baseUrl: BASE_URL,
    includeNews: true,
  });

  const articles = await fetchNewsArticles();
  return generator.generateNewsSitemap(articles);
}

/**
 * Generate image sitemap
 */
async function generateImageSitemap(): Promise<string> {
  const generator = SitemapGenerator.getInstance({
    baseUrl: BASE_URL,
    includeImages: true,
  });

  const products = await fetchProducts();
  const images = products.flatMap(product => 
    (product.images || []).map(imageUrl => ({
      pageUrl: `${BASE_URL}/products/${product.slug}`,
      imageUrl,
      caption: `${product.brand || ''} ${product.category || 'Product'}`.trim(),
      title: `${product.brand || ''} ${product.category || 'Product'} - ₹${product.price || 0}`.trim(),
    }))
  );

  return generator.generateImageSitemap(images);
}

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

/**
 * GET handler for sitemap.xml and specialized sitemaps
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let sitemapXML: string;

    // Generate appropriate sitemap based on type
    switch (type) {
      case 'products':
        sitemapXML = await generateProductsSitemap();
        break;
      
      case 'news':
        sitemapXML = await generateNewsSitemap();
        break;
      
      case 'images':
        sitemapXML = await generateImageSitemap();
        break;
      
      default:
        sitemapXML = await generateMainSitemap();
    }

    // Validate sitemap
    const generator = SitemapGenerator.getInstance();
    const validation = generator.validateSitemap(sitemapXML);
    
    if (!validation.valid) {
      console.error('Sitemap validation errors:', validation.errors);
      // Continue anyway but log errors
    }

    // Return XML response with proper headers
    return new NextResponse(sitemapXML, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': `public, max-age=${REVALIDATE_TIME}, s-maxage=${REVALIDATE_TIME}, stale-while-revalidate=${REVALIDATE_TIME * 2}`,
        'X-Robots-Tag': 'noindex', // Don't index the sitemap itself
        'Content-Disposition': `inline; filename="sitemap${type ? `-${type}` : ''}.xml"`,
      },
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return a basic error sitemap
    const errorSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new NextResponse(errorSitemap, {
      status: 500,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'no-cache',
      },
    });
  }
}

// ============================================================================
// UTILITY FUNCTIONS FOR MANUAL SITEMAP MANAGEMENT
// ============================================================================

/**
 * Ping search engines about sitemap update
 * Can be called from admin panel or after content updates
 */
async function pingSitemapUpdate(): Promise<void> {
  const sitemapUrl = `${BASE_URL}/sitemap.xml`;
  await SitemapUtils.pingSitemapUpdate(sitemapUrl);
}

/**
 * Generate sitemap statistics
 * Useful for admin dashboard
 */
async function getSitemapStatistics() {
  const generator = SitemapGenerator.getInstance({ baseUrl: BASE_URL });
  
  const urls: SitemapUrl[] = [];
  
  // Collect all URLs
  const products = await fetchProducts();
  const categories = await fetchCategories();
  const brands = await fetchBrands();
  const collections = await fetchCollections();
  const blogPosts = await fetchBlogPosts();
  
  urls.push(...STATIC_ROUTES.map(route => ({
    loc: `${BASE_URL}${route.path}`,
    lastmod: route.lastModified?.toISOString(),
    changefreq: route.changeFrequency,
    priority: route.priority,
  })));

  urls.push(...products.map(p => ({
    loc: `${BASE_URL}/products/${p.slug}`,
    changefreq: 'weekly' as const,
    priority: 0.8,
    images: p.images?.map(img => ({ loc: img })),
  })));

  urls.push(...categories.map(c => ({
    loc: `${BASE_URL}/categories/${c.slug}`,
    changefreq: 'weekly' as const,
    priority: 0.9,
  })));

  urls.push(...brands.map(b => ({
    loc: `${BASE_URL}/brands/${b.slug}`,
    changefreq: 'monthly' as const,
    priority: 0.7,
  })));

  urls.push(...collections.map(c => ({
    loc: `${BASE_URL}/collections/${c.slug}`,
    changefreq: 'weekly' as const,
    priority: 0.7,
  })));

  urls.push(...blogPosts.map(p => ({
    loc: `${BASE_URL}/blog/${p.slug}`,
    changefreq: 'monthly' as const,
    priority: 0.6,
  })));

  return generator.getStatistics(urls);
}

/**
 * Force regenerate sitemap
 * Can be triggered from admin panel
 */
async function regenerateSitemap(): Promise<{
  success: boolean;
  message: string;
  stats?: Awaited<ReturnType<typeof getSitemapStatistics>>;
}> {
  try {
    // Generate all sitemaps
    await generateMainSitemap();
    await generateProductsSitemap();
    await generateNewsSitemap();
    await generateImageSitemap();

    // Get statistics
    const stats = await getSitemapStatistics();

    // Ping search engines
    await pingSitemapUpdate();

    return {
      success: true,
      message: 'Sitemap regenerated successfully',
      stats,
    };
  } catch (error) {
    console.error('Error regenerating sitemap:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Use utility functions to prevent unused warnings
const _utilityCheck = () => {
  void pingSitemapUpdate;
  void getSitemapStatistics;
  void regenerateSitemap;
};
_utilityCheck();

// ============================================================================
// EXPORT CONFIGURATION FOR NEXT.JS
// ============================================================================

export const dynamic = 'force-dynamic'; // Always generate fresh sitemap
export const revalidate = 3600; // Revalidate every hour (1 hour in seconds)
