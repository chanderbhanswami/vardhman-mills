/**
 * Next Sitemap Configuration
 * 
 * Generates sitemaps for better SEO
 * Run: npm run postbuild (automatically runs after build)
 * 
 * @see https://github.com/iamvishnusankar/next-sitemap
 */

import type { IConfig } from 'next-sitemap';

const config: IConfig = {
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://vardhmantextiles.com',
  generateRobotsTxt: false, // We have a custom robots.txt
  generateIndexSitemap: true,
  sitemapSize: 7000,
  changefreq: 'daily',
  priority: 0.7,
  
  // Output directory
  outDir: './public',
  
  // Exclude these paths from sitemap
  exclude: [
    '/admin',
    '/admin/*',
    '/api/*',
    '/account',
    '/account/*',
    '/checkout',
    '/checkout/*',
    '/cart',
    '/wishlist',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/404',
    '/500',
    '/error',
    '/offline',
    '/server-sitemap.xml',
    '/server-sitemap-index.xml',
  ],
  
  // Custom transformation for each URL
  transform: async (config, path) => {
    // Custom priority and changefreq based on path
    let priority = config.priority;
    let changefreq = config.changefreq;
    
    // Homepage - highest priority
    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    }
    
    // Product pages - high priority
    else if (path.startsWith('/products/')) {
      priority = 0.9;
      changefreq = 'weekly';
    }
    
    // Category pages - high priority
    else if (path.startsWith('/categories/')) {
      priority = 0.8;
      changefreq = 'weekly';
    }
    
    // Brand pages - medium-high priority
    else if (path.startsWith('/brands/')) {
      priority = 0.7;
      changefreq = 'weekly';
    }
    
    // Collection pages - medium-high priority
    else if (path.startsWith('/collections/')) {
      priority = 0.7;
      changefreq = 'weekly';
    }
    
    // Blog pages - medium priority
    else if (path.startsWith('/blog/')) {
      priority = 0.6;
      changefreq = 'monthly';
    }
    
    // Static pages - medium-low priority
    else if (
      path.startsWith('/about') ||
      path.startsWith('/contact') ||
      path.startsWith('/faq') ||
      path.startsWith('/privacy') ||
      path.startsWith('/terms')
    ) {
      priority = 0.5;
      changefreq = 'monthly';
    }
    
    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
      alternateRefs: [
        {
          href: `https://vardhmantextiles.com${path}`,
          hreflang: 'en-IN',
        },
        {
          href: `https://vardhmantextiles.com/hi${path}`,
          hreflang: 'hi-IN',
        },
      ],
    };
  },
  
  // Additional paths to include (dynamic routes)
  additionalPaths: async () => {
    // You can fetch and return additional paths here
    // Example: const products = await fetchProducts();
    // Return array of paths to include in sitemap
    return [];
  },
  
  // Robots.txt entries
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/account', '/checkout', '/cart'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        crawlDelay: 0,
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        crawlDelay: 1,
      },
    ],
    additionalSitemaps: [
      'https://vardhmantextiles.com/server-sitemap.xml',
      'https://vardhmantextiles.com/products-sitemap.xml',
      'https://vardhmantextiles.com/categories-sitemap.xml',
      'https://vardhmantextiles.com/brands-sitemap.xml',
      'https://vardhmantextiles.com/blog-sitemap.xml',
    ],
  },
};

export default config;
