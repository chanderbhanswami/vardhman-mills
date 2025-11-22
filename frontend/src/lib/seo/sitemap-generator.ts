/**
 * Sitemap Generator for Vardhman Mills Frontend
 * Dynamic XML sitemap generation with advanced features
 */

// Sitemap URL interface
export interface SitemapUrl {
  loc: string; // URL location
  lastmod?: string; // Last modification date (ISO 8601)
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number; // Priority (0.0 to 1.0)
  images?: SitemapImage[];
  videos?: SitemapVideo[];
  news?: SitemapNews;
  mobile?: boolean;
  alternates?: SitemapAlternate[];
}

// Image sitemap interface
export interface SitemapImage {
  loc: string; // Image URL
  caption?: string;
  geoLocation?: string;
  title?: string;
  license?: string;
}

// Video sitemap interface
export interface SitemapVideo {
  thumbnailLoc: string;
  title: string;
  description: string;
  contentLoc?: string;
  playerLoc?: string;
  duration?: number; // In seconds
  expirationDate?: string;
  rating?: number; // 0.0 to 5.0
  viewCount?: number;
  publicationDate?: string;
  familyFriendly?: boolean;
  restriction?: {
    relationship: 'allow' | 'deny';
    countries: string[];
  };
  platform?: {
    relationship: 'allow' | 'deny';
    platforms: ('web' | 'mobile' | 'tv')[];
  };
  requiresSubscription?: boolean;
  uploader?: {
    name: string;
    info?: string;
  };
  live?: boolean;
  tags?: string[];
  category?: string;
}

// News sitemap interface
export interface SitemapNews {
  publication: {
    name: string;
    language: string;
  };
  publicationDate: string;
  title: string;
  keywords?: string;
  stockTickers?: string[];
}

// Alternate language interface
export interface SitemapAlternate {
  hreflang: string;
  href: string;
}

// Sitemap configuration
export interface SitemapConfig {
  baseUrl: string;
  defaultChangefreq?: SitemapUrl['changefreq'];
  defaultPriority?: number;
  includeImages?: boolean;
  includeVideos?: boolean;
  includeNews?: boolean;
  includeMobile?: boolean;
  includeAlternates?: boolean;
  maxUrlsPerSitemap?: number;
  compress?: boolean;
  pretty?: boolean;
  generateSitemapIndex?: boolean;
  sitemapIndexPath?: string;
  excludePatterns?: RegExp[];
  includePatterns?: RegExp[];
  customNamespaces?: Record<string, string>;
}

// Sitemap index entry
export interface SitemapIndexEntry {
  loc: string;
  lastmod?: string;
}

// Route data for sitemap generation
export interface RouteData {
  path: string;
  lastModified?: Date;
  changeFrequency?: SitemapUrl['changefreq'];
  priority?: number;
  images?: SitemapImage[];
  videos?: SitemapVideo[];
  news?: SitemapNews;
  alternates?: SitemapAlternate[];
}

// Default configuration
export const DEFAULT_SITEMAP_CONFIG: SitemapConfig = {
  baseUrl: 'https://vardhmantextiles.com',
  defaultChangefreq: 'weekly',
  defaultPriority: 0.5,
  includeImages: true,
  includeVideos: true,
  includeNews: false,
  includeMobile: true,
  includeAlternates: true,
  maxUrlsPerSitemap: 50000,
  compress: false,
  pretty: true,
  generateSitemapIndex: true,
  sitemapIndexPath: '/sitemap.xml',
  excludePatterns: [
    /\/admin\//,
    /\/api\//,
    /\/private\//,
    /\/auth\//,
    /\/checkout\//,
    /\/profile\//,
    /\/dashboard\//,
    /\/_next\//,
    /\.json$/,
    /\?.*$/,
  ],
  includePatterns: [
    /^\/$/,
    /^\/products\//,
    /^\/categories\//,
    /^\/about/,
    /^\/contact/,
    /^\/blog\//,
    /^\/news\//,
  ],
};

/**
 * Sitemap Generator Service
 */
export class SitemapGenerator {
  private static instance: SitemapGenerator;
  private config: SitemapConfig;

  private constructor(config: SitemapConfig = DEFAULT_SITEMAP_CONFIG) {
    this.config = { ...DEFAULT_SITEMAP_CONFIG, ...config };
  }

  static getInstance(config?: Partial<SitemapConfig>): SitemapGenerator {
    if (!SitemapGenerator.instance) {
      SitemapGenerator.instance = new SitemapGenerator(config as SitemapConfig);
    }
    return SitemapGenerator.instance;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SitemapConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Generate XML sitemap from URLs
   */
  generateSitemap(urls: SitemapUrl[]): string {
    const filteredUrls = this.filterUrls(urls);
    
    if (filteredUrls.length === 0) {
      return this.generateEmptySitemap();
    }

    const xmlLines: string[] = [
      '<?xml version="1.0" encoding="UTF-8"?>',
    ];

    // Add namespaces
    const namespaces = this.getNamespaces(filteredUrls);
    xmlLines.push(`<urlset ${namespaces}>`);

    // Add URLs
    filteredUrls.forEach(url => {
      xmlLines.push(this.generateUrlElement(url));
    });

    xmlLines.push('</urlset>');

    return this.formatXML(xmlLines.join('\n'));
  }

  /**
   * Generate sitemap index
   */
  generateSitemapIndex(sitemaps: SitemapIndexEntry[]): string {
    const xmlLines: string[] = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ];

    sitemaps.forEach(sitemap => {
      xmlLines.push('  <sitemap>');
      xmlLines.push(`    <loc>${this.escapeXml(sitemap.loc)}</loc>`);
      if (sitemap.lastmod) {
        xmlLines.push(`    <lastmod>${sitemap.lastmod}</lastmod>`);
      }
      xmlLines.push('  </sitemap>');
    });

    xmlLines.push('</sitemapindex>');

    return this.formatXML(xmlLines.join('\n'));
  }

  /**
   * Generate multiple sitemaps if URL count exceeds limit
   */
  generateMultipleSitemaps(urls: SitemapUrl[]): {
    sitemaps: Array<{ content: string; filename: string }>;
    index?: string;
  } {
    const filteredUrls = this.filterUrls(urls);
    const maxUrls = this.config.maxUrlsPerSitemap || 50000;

    if (filteredUrls.length <= maxUrls) {
      return {
        sitemaps: [{
          content: this.generateSitemap(filteredUrls),
          filename: 'sitemap.xml',
        }],
      };
    }

    // Split URLs into chunks
    const chunks: SitemapUrl[][] = [];
    for (let i = 0; i < filteredUrls.length; i += maxUrls) {
      chunks.push(filteredUrls.slice(i, i + maxUrls));
    }

    // Generate sitemaps
    const sitemaps = chunks.map((chunk, index) => ({
      content: this.generateSitemap(chunk),
      filename: `sitemap-${index + 1}.xml`,
    }));

    // Generate sitemap index if configured
    let index: string | undefined;
    if (this.config.generateSitemapIndex) {
      const indexEntries: SitemapIndexEntry[] = sitemaps.map(sitemap => ({
        loc: `${this.config.baseUrl}/${sitemap.filename}`,
        lastmod: new Date().toISOString(),
      }));

      index = this.generateSitemapIndex(indexEntries);
    }

    return { sitemaps, index };
  }

  /**
   * Generate sitemap from route data
   */
  generateFromRoutes(routes: RouteData[]): string {
    const urls: SitemapUrl[] = routes.map(route => this.routeToSitemapUrl(route));
    return this.generateSitemap(urls);
  }

  /**
   * Generate product sitemap
   */
  generateProductSitemap(products: Array<{
    slug: string;
    lastModified?: Date;
    images?: string[];
    category?: string;
    brand?: string;
    price?: number;
    inStock?: boolean;
  }>): string {
    const urls: SitemapUrl[] = products.map(product => ({
      loc: `${this.config.baseUrl}/products/${product.slug}`,
      lastmod: product.lastModified?.toISOString() || new Date().toISOString(),
      changefreq: product.inStock ? 'daily' : 'weekly',
      priority: 0.8,
      images: product.images?.map(image => ({
        loc: image,
        title: `${product.brand || ''} ${product.category || 'Product'}`.trim(),
      })),
    }));

    return this.generateSitemap(urls);
  }

  /**
   * Generate news sitemap
   */
  generateNewsSitemap(articles: Array<{
    slug: string;
    title: string;
    publishedAt: Date;
    keywords?: string[];
    language?: string;
  }>): string {
    const urls: SitemapUrl[] = articles
      .filter(article => {
        // News articles must be less than 2 days old
        const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
        return article.publishedAt > twoDaysAgo;
      })
      .map(article => ({
        loc: `${this.config.baseUrl}/news/${article.slug}`,
        lastmod: article.publishedAt.toISOString(),
        news: {
          publication: {
            name: 'Vardhman Mills',
            language: article.language || 'en',
          },
          publicationDate: article.publishedAt.toISOString(),
          title: article.title,
          keywords: article.keywords?.join(', '),
        },
      }));

    return this.generateSitemap(urls);
  }

  /**
   * Generate image sitemap
   */
  generateImageSitemap(images: Array<{
    pageUrl: string;
    imageUrl: string;
    caption?: string;
    title?: string;
    geoLocation?: string;
    license?: string;
  }>): string {
    // Group images by page URL
    const imagesByPage: Record<string, SitemapImage[]> = {};
    
    images.forEach(image => {
      if (!imagesByPage[image.pageUrl]) {
        imagesByPage[image.pageUrl] = [];
      }
      imagesByPage[image.pageUrl].push({
        loc: image.imageUrl,
        caption: image.caption,
        title: image.title,
        geoLocation: image.geoLocation,
        license: image.license,
      });
    });

    const urls: SitemapUrl[] = Object.entries(imagesByPage).map(([pageUrl, pageImages]) => ({
      loc: pageUrl,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.6,
      images: pageImages,
    }));

    return this.generateSitemap(urls);
  }

  /**
   * Generate video sitemap
   */
  generateVideoSitemap(videos: Array<{
    pageUrl: string;
    video: SitemapVideo;
  }>): string {
    // Group videos by page URL
    const videosByPage: Record<string, SitemapVideo[]> = {};
    
    videos.forEach(({ pageUrl, video }) => {
      if (!videosByPage[pageUrl]) {
        videosByPage[pageUrl] = [];
      }
      videosByPage[pageUrl].push(video);
    });

    const urls: SitemapUrl[] = Object.entries(videosByPage).map(([pageUrl, pageVideos]) => ({
      loc: pageUrl,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.7,
      videos: pageVideos,
    }));

    return this.generateSitemap(urls);
  }

  /**
   * Add URL to sitemap (placeholder for future implementation)
   */
  addUrl(url: SitemapUrl): void {
    // Implementation would depend on your chosen storage mechanism
    // For now, log the action
    console.log('Adding URL to sitemap:', url.loc);
  }

  /**
   * Remove URL from sitemap (placeholder for future implementation)
   */
  removeUrl(loc: string): void {
    // Implementation would depend on your chosen storage mechanism
    // For now, log the action
    console.log('Removing URL from sitemap:', loc);
  }

  /**
   * Validate sitemap XML
   */
  validateSitemap(xml: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic XML validation
    try {
      // Simple XML parsing check
      if (!xml.includes('<?xml version="1.0"')) {
        errors.push('Missing XML declaration');
      }

      if (!xml.includes('<urlset') && !xml.includes('<sitemapindex')) {
        errors.push('Missing root element (urlset or sitemapindex)');
      }

      // Check for required elements
      const urlMatches = xml.match(/<url>/g);
      const locMatches = xml.match(/<loc>/g);

      if (urlMatches && locMatches && urlMatches.length !== locMatches.length) {
        errors.push('Each <url> element must have a <loc> element');
      }

      // Check URL count
      if (urlMatches && urlMatches.length > 50000) {
        errors.push('Sitemap contains more than 50,000 URLs');
      }

      // Check file size (approximate)
      if (xml.length > 50 * 1024 * 1024) { // 50MB
        errors.push('Sitemap file size exceeds 50MB limit');
      }

    } catch (error) {
      errors.push(`XML parsing error: ${error}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get sitemap statistics
   */
  getStatistics(urls: SitemapUrl[]): {
    totalUrls: number;
    urlsByChangefreq: Record<string, number>;
    urlsByPriority: Record<string, number>;
    imagesCount: number;
    videosCount: number;
    newsCount: number;
    averagePriority: number;
    lastModified: string | null;
  } {
    const urlsByChangefreq: Record<string, number> = {};
    const urlsByPriority: Record<string, number> = {};
    let imagesCount = 0;
    let videosCount = 0;
    let newsCount = 0;
    let prioritySum = 0;
    let lastModified: string | null = null;

    urls.forEach(url => {
      // Count by changefreq
      const changefreq = url.changefreq || 'unknown';
      urlsByChangefreq[changefreq] = (urlsByChangefreq[changefreq] || 0) + 1;

      // Count by priority
      const priority = url.priority?.toString() || 'unknown';
      urlsByPriority[priority] = (urlsByPriority[priority] || 0) + 1;

      if (url.priority) prioritySum += url.priority;

      // Count media
      if (url.images) imagesCount += url.images.length;
      if (url.videos) videosCount += url.videos.length;
      if (url.news) newsCount++;

      // Track latest modification
      if (url.lastmod) {
        const modDate = new Date(url.lastmod);
        const isoString = modDate.toISOString();
        if (!lastModified || isoString > lastModified) {
          lastModified = isoString;
        }
      }
    });

    return {
      totalUrls: urls.length,
      urlsByChangefreq,
      urlsByPriority,
      imagesCount,
      videosCount,
      newsCount,
      averagePriority: urls.length > 0 ? prioritySum / urls.length : 0,
      lastModified,
    };
  }

  /**
   * Private helper methods
   */
  private filterUrls(urls: SitemapUrl[]): SitemapUrl[] {
    return urls.filter(url => {
      const path = new URL(url.loc).pathname;

      // Check exclude patterns
      if (this.config.excludePatterns) {
        for (const pattern of this.config.excludePatterns) {
          if (pattern.test(path)) {
            return false;
          }
        }
      }

      // Check include patterns
      if (this.config.includePatterns) {
        for (const pattern of this.config.includePatterns) {
          if (pattern.test(path)) {
            return true;
          }
        }
        return false;
      }

      return true;
    });
  }

  private routeToSitemapUrl(route: RouteData): SitemapUrl {
    return {
      loc: `${this.config.baseUrl}${route.path}`,
      lastmod: route.lastModified?.toISOString() || new Date().toISOString(),
      changefreq: route.changeFrequency || this.config.defaultChangefreq,
      priority: route.priority ?? this.config.defaultPriority,
      images: route.images,
      videos: route.videos,
      news: route.news,
      alternates: route.alternates,
    };
  }

  private getNamespaces(urls: SitemapUrl[]): string {
    const namespaces = ['xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'];

    // Check if we need image namespace
    if (this.config.includeImages && urls.some(url => url.images && url.images.length > 0)) {
      namespaces.push('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"');
    }

    // Check if we need video namespace
    if (this.config.includeVideos && urls.some(url => url.videos && url.videos.length > 0)) {
      namespaces.push('xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"');
    }

    // Check if we need news namespace
    if (this.config.includeNews && urls.some(url => url.news)) {
      namespaces.push('xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"');
    }

    // Check if we need mobile namespace
    if (this.config.includeMobile) {
      namespaces.push('xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"');
    }

    // Check if we need xhtml namespace
    if (this.config.includeAlternates && urls.some(url => url.alternates && url.alternates.length > 0)) {
      namespaces.push('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    }

    // Add custom namespaces
    if (this.config.customNamespaces) {
      Object.entries(this.config.customNamespaces).forEach(([prefix, uri]) => {
        namespaces.push(`xmlns:${prefix}="${uri}"`);
      });
    }

    return namespaces.join(' ');
  }

  private generateUrlElement(url: SitemapUrl): string {
    const indent = this.config.pretty ? '  ' : '';
    const lines: string[] = [];

    lines.push(`${indent}<url>`);
    lines.push(`${indent}  <loc>${this.escapeXml(url.loc)}</loc>`);

    if (url.lastmod) {
      lines.push(`${indent}  <lastmod>${url.lastmod}</lastmod>`);
    }

    if (url.changefreq) {
      lines.push(`${indent}  <changefreq>${url.changefreq}</changefreq>`);
    }

    if (url.priority !== undefined) {
      lines.push(`${indent}  <priority>${url.priority.toFixed(1)}</priority>`);
    }

    // Add mobile annotation
    if (url.mobile && this.config.includeMobile) {
      lines.push(`${indent}  <mobile:mobile/>`);
    }

    // Add alternate language links
    if (url.alternates && this.config.includeAlternates) {
      url.alternates.forEach(alternate => {
        lines.push(`${indent}  <xhtml:link rel="alternate" hreflang="${alternate.hreflang}" href="${this.escapeXml(alternate.href)}"/>`);
      });
    }

    // Add images
    if (url.images && this.config.includeImages) {
      url.images.forEach(image => {
        lines.push(`${indent}  <image:image>`);
        lines.push(`${indent}    <image:loc>${this.escapeXml(image.loc)}</image:loc>`);
        if (image.caption) lines.push(`${indent}    <image:caption>${this.escapeXml(image.caption)}</image:caption>`);
        if (image.geoLocation) lines.push(`${indent}    <image:geo_location>${this.escapeXml(image.geoLocation)}</image:geo_location>`);
        if (image.title) lines.push(`${indent}    <image:title>${this.escapeXml(image.title)}</image:title>`);
        if (image.license) lines.push(`${indent}    <image:license>${this.escapeXml(image.license)}</image:license>`);
        lines.push(`${indent}  </image:image>`);
      });
    }

    // Add videos
    if (url.videos && this.config.includeVideos) {
      url.videos.forEach(video => {
        lines.push(`${indent}  <video:video>`);
        lines.push(`${indent}    <video:thumbnail_loc>${this.escapeXml(video.thumbnailLoc)}</video:thumbnail_loc>`);
        lines.push(`${indent}    <video:title>${this.escapeXml(video.title)}</video:title>`);
        lines.push(`${indent}    <video:description>${this.escapeXml(video.description)}</video:description>`);
        
        if (video.contentLoc) lines.push(`${indent}    <video:content_loc>${this.escapeXml(video.contentLoc)}</video:content_loc>`);
        if (video.playerLoc) lines.push(`${indent}    <video:player_loc>${this.escapeXml(video.playerLoc)}</video:player_loc>`);
        if (video.duration) lines.push(`${indent}    <video:duration>${video.duration}</video:duration>`);
        if (video.expirationDate) lines.push(`${indent}    <video:expiration_date>${video.expirationDate}</video:expiration_date>`);
        if (video.rating) lines.push(`${indent}    <video:rating>${video.rating}</video:rating>`);
        if (video.viewCount) lines.push(`${indent}    <video:view_count>${video.viewCount}</video:view_count>`);
        if (video.publicationDate) lines.push(`${indent}    <video:publication_date>${video.publicationDate}</video:publication_date>`);
        if (video.familyFriendly !== undefined) lines.push(`${indent}    <video:family_friendly>${video.familyFriendly ? 'yes' : 'no'}</video:family_friendly>`);
        
        if (video.tags) {
          video.tags.forEach(tag => {
            lines.push(`${indent}    <video:tag>${this.escapeXml(tag)}</video:tag>`);
          });
        }
        
        if (video.category) lines.push(`${indent}    <video:category>${this.escapeXml(video.category)}</video:category>`);
        if (video.live !== undefined) lines.push(`${indent}    <video:live>${video.live ? 'yes' : 'no'}</video:live>`);
        
        lines.push(`${indent}  </video:video>`);
      });
    }

    // Add news
    if (url.news && this.config.includeNews) {
      lines.push(`${indent}  <news:news>`);
      lines.push(`${indent}    <news:publication>`);
      lines.push(`${indent}      <news:name>${this.escapeXml(url.news.publication.name)}</news:name>`);
      lines.push(`${indent}      <news:language>${url.news.publication.language}</news:language>`);
      lines.push(`${indent}    </news:publication>`);
      lines.push(`${indent}    <news:publication_date>${url.news.publicationDate}</news:publication_date>`);
      lines.push(`${indent}    <news:title>${this.escapeXml(url.news.title)}</news:title>`);
      if (url.news.keywords) lines.push(`${indent}    <news:keywords>${this.escapeXml(url.news.keywords)}</news:keywords>`);
      lines.push(`${indent}  </news:news>`);
    }

    lines.push(`${indent}</url>`);

    return lines.join('\n');
  }

  private escapeXml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private formatXML(xml: string): string {
    if (!this.config.pretty) {
      return xml;
    }

    // Basic XML formatting (you might want to use a proper XML formatter)
    return xml
      .replace(/></g, '>\n<')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
  }

  private generateEmptySitemap(): string {
    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      '</urlset>',
    ].join('\n');
  }
}

// Utility functions
export const SitemapUtils = {
  /**
   * Convert priority to valid range
   */
  normalizePriority: (priority: number): number => {
    return Math.max(0, Math.min(1, priority));
  },

  /**
   * Format date for sitemap
   */
  formatDate: (date: Date): string => {
    return date.toISOString();
  },

  /**
   * Get changefreq from last modified date
   */
  getChangefreqFromDate: (lastModified: Date): SitemapUrl['changefreq'] => {
    const now = new Date();
    const daysDiff = (now.getTime() - lastModified.getTime()) / (1000 * 60 * 60 * 24);

    if (daysDiff < 1) return 'hourly';
    if (daysDiff < 7) return 'daily';
    if (daysDiff < 30) return 'weekly';
    if (daysDiff < 365) return 'monthly';
    return 'yearly';
  },

  /**
   * Calculate priority based on page type and depth
   */
  calculatePriority: (path: string, pageType?: 'homepage' | 'category' | 'product' | 'article' | 'page'): number => {
    const depth = (path.match(/\//g) || []).length - 1;
    
    let basePriority = 0.5;
    
    switch (pageType) {
      case 'homepage':
        basePriority = 1.0;
        break;
      case 'category':
        basePriority = 0.8;
        break;
      case 'product':
        basePriority = 0.6;
        break;
      case 'article':
        basePriority = 0.4;
        break;
      default:
        basePriority = 0.5;
    }

    // Reduce priority based on depth
    const depthPenalty = depth * 0.1;
    return Math.max(0.1, basePriority - depthPenalty);
  },

  /**
   * Validate URL for sitemap inclusion
   */
  isValidUrl: (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  },

  /**
   * Generate robots.txt with sitemap reference
   */
  generateRobotsReference: (sitemapUrl: string): string => {
    return `Sitemap: ${sitemapUrl}`;
  },

  /**
   * Split large sitemaps
   */
  splitSitemap: (urls: SitemapUrl[], maxUrls: number = 50000): SitemapUrl[][] => {
    const chunks: SitemapUrl[][] = [];
    for (let i = 0; i < urls.length; i += maxUrls) {
      chunks.push(urls.slice(i, i + maxUrls));
    }
    return chunks;
  },

  /**
   * Merge multiple sitemap configurations
   */
  mergeConfigs: (...configs: Partial<SitemapConfig>[]): SitemapConfig => {
    return configs.reduce((merged, config) => ({ ...merged, ...config }), { ...DEFAULT_SITEMAP_CONFIG }) as SitemapConfig;
  },

  /**
   * Generate sitemap from file system routes
   */
  generateFromFileSystem: (
    routesDir: string,
    baseUrl: string,
    extensions: string[] = ['.tsx', '.ts', '.jsx', '.js']
  ): SitemapUrl[] => {
    // This would typically scan the file system
    // Implementation depends on your routing system (Next.js, etc.)
    console.log('Scanning routes:', routesDir, 'with base URL:', baseUrl, 'for extensions:', extensions);
    return [];
  },

  /**
   * Ping search engines about sitemap updates
   */
  pingSitemapUpdate: async (sitemapUrl: string): Promise<void> => {
    const searchEngines = [
      `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
      `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
    ];

    const promises = searchEngines.map(url => 
      fetch(url).catch(error => console.warn(`Failed to ping ${url}:`, error))
    );

    await Promise.allSettled(promises);
  },
};

// Export singleton instance
export const sitemapGenerator = SitemapGenerator.getInstance();

export default SitemapGenerator;