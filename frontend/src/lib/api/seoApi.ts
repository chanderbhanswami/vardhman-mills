import { HttpClient } from './client';
import { endpoints } from './endpoints';
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { ApiResponse, PaginationParams } from './types';

// Paginated Response Type
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Types
export interface SEOSettings {
  id: string;
  siteTitle: string;
  siteDescription: string;
  defaultKeywords: string[];
  robotsContent: string;
  sitemapEnabled: boolean;
  openGraphEnabled: boolean;
  twitterCardsEnabled: boolean;
  structuredDataEnabled: boolean;
  canonicalUrlsEnabled: boolean;
  hreflangEnabled: boolean;
  metaRobotsDefault: string;
  socialShareImages: {
    facebook: string;
    twitter: string;
    linkedin: string;
  };
  analytics: {
    googleAnalyticsId?: string;
    googleTagManagerId?: string;
    facebookPixelId?: string;
    hotjarId?: string;
  };
  verification: {
    googleSiteVerification?: string;
    bingSiteVerification?: string;
    yandexVerification?: string;
    pinterestVerification?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PageSEO {
  id: string;
  pageId: string;
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  canonicalUrl?: string;
  metaRobots?: string;
  structuredData?: Record<string, unknown>;
  hreflang?: Array<{
    hreflang: string;
    href: string;
  }>;
  priority?: number;
  changeFreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  lastModified?: string;
  isIndexed: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SitemapEntry {
  id: string;
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  images?: Array<{
    loc: string;
    title?: string;
    caption?: string;
  }>;
  videos?: Array<{
    loc: string;
    title: string;
    description: string;
    thumbnailLoc: string;
    duration?: number;
  }>;
  alternates?: Array<{
    hreflang: string;
    href: string;
  }>;
}

export interface Sitemap {
  id: string;
  type: 'index' | 'pages' | 'products' | 'categories' | 'blog' | 'news' | 'images' | 'videos';
  url: string;
  entries: SitemapEntry[];
  lastGenerated: string;
  size: number;
  compressed: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RobotsRule {
  userAgent: string;
  allow: string[];
  disallow: string[];
  crawlDelay?: number;
}

export interface RobotsTxt {
  id: string;
  content: string;
  rules: RobotsRule[];
  sitemaps: string[];
  host?: string;
  lastModified: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SEOAuditItem {
  type: 'error' | 'warning' | 'info' | 'success';
  category: 'meta' | 'content' | 'technical' | 'performance' | 'accessibility' | 'best-practices';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
  url?: string;
  element?: string;
  value?: string;
  expected?: string;
  resources?: string[];
}

export interface SEOAudit {
  id: string;
  url: string;
  score: number;
  items: SEOAuditItem[];
  performance: {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    firstInputDelay: number;
    cumulativeLayoutShift: number;
    totalBlockingTime: number;
  };
  accessibility: {
    score: number;
    issues: number;
  };
  bestPractices: {
    score: number;
    issues: number;
  };
  seo: {
    score: number;
    issues: number;
  };
  metadata: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
    canonicalUrl?: string;
    robots?: string;
  };
  technicalSEO: {
    hasH1: boolean;
    hasMetaDescription: boolean;
    hasCanonical: boolean;
    hasRobots: boolean;
    hasOpenGraph: boolean;
    hasTwitterCards: boolean;
    hasStructuredData: boolean;
    mobileOptimized: boolean;
    httpsEnabled: boolean;
    compressionEnabled: boolean;
    cachingEnabled: boolean;
  };
  contentAnalysis: {
    wordCount: number;
    readabilityScore: number;
    keywordDensity: Record<string, number>;
    headingStructure: Array<{
      level: number;
      text: string;
    }>;
    imageOptimization: {
      total: number;
      withAlt: number;
      optimized: number;
    };
    linkAnalysis: {
      internal: number;
      external: number;
      broken: number;
    };
  };
  auditedAt: string;
  createdAt: string;
}

export interface SchemaMarkup {
  id: string;
  type: 'Organization' | 'LocalBusiness' | 'Product' | 'Article' | 'Event' | 'Recipe' | 'FAQ' | 'BreadcrumbList' | 'Review' | 'Rating';
  name: string;
  schema: Record<string, unknown>;
  pages: string[];
  isGlobal: boolean;
  isActive: boolean;
  validationStatus: 'valid' | 'invalid' | 'warning';
  validationErrors: string[];
  lastValidated: string;
  createdAt: string;
  updatedAt: string;
}

export interface MetaTag {
  id: string;
  name?: string;
  property?: string;
  content: string;
  httpEquiv?: string;
  charset?: string;
  pages: string[];
  isGlobal: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RedirectRule {
  id: string;
  sourceUrl: string;
  targetUrl: string;
  statusCode: 301 | 302 | 307 | 308;
  isActive: boolean;
  isRegex: boolean;
  preserveQuery: boolean;
  notes?: string;
  hits: number;
  lastHit?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SEOAnalytics {
  overview: {
    totalPages: number;
    indexedPages: number;
    errors: number;
    warnings: number;
    avgScore: number;
    lastAudit: string;
  };
  performance: {
    avgLoadTime: number;
    mobileScore: number;
    desktopScore: number;
    coreWebVitals: {
      lcp: number;
      fid: number;
      cls: number;
    };
  };
  content: {
    totalWords: number;
    avgWordsPerPage: number;
    avgReadabilityScore: number;
    duplicateContent: number;
    missingMetaDesc: number;
    missingTitles: number;
  };
  technical: {
    httpsPages: number;
    mobileOptimized: number;
    structuredData: number;
    canonicalUrls: number;
    redirects: number;
    brokenLinks: number;
  };
  trends: Array<{
    date: string;
    score: number;
    indexedPages: number;
    errors: number;
    warnings: number;
  }>;
}

export interface CreateSEOSettingsRequest {
  siteTitle: string;
  siteDescription: string;
  defaultKeywords?: string[];
  robotsContent?: string;
  sitemapEnabled?: boolean;
  openGraphEnabled?: boolean;
  twitterCardsEnabled?: boolean;
  structuredDataEnabled?: boolean;
  canonicalUrlsEnabled?: boolean;
  hreflangEnabled?: boolean;
  metaRobotsDefault?: string;
  socialShareImages?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };
  analytics?: {
    googleAnalyticsId?: string;
    googleTagManagerId?: string;
    facebookPixelId?: string;
    hotjarId?: string;
  };
  verification?: {
    googleSiteVerification?: string;
    bingSiteVerification?: string;
    yandexVerification?: string;
    pinterestVerification?: string;
  };
}

export type UpdateSEOSettingsRequest = Partial<CreateSEOSettingsRequest>;

export interface CreatePageSEORequest {
  pageId: string;
  title: string;
  description: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  canonicalUrl?: string;
  metaRobots?: string;
  structuredData?: Record<string, unknown>;
  hreflang?: Array<{
    hreflang: string;
    href: string;
  }>;
  priority?: number;
  changeFreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  isIndexed?: boolean;
  isActive?: boolean;
}

export type UpdatePageSEORequest = Partial<CreatePageSEORequest>;

export interface GenerateSitemapRequest {
  types?: string[];
  includeImages?: boolean;
  includeVideos?: boolean;
  includeAlternates?: boolean;
  compress?: boolean;
}

export interface CreateSchemaMarkupRequest {
  type: 'Organization' | 'LocalBusiness' | 'Product' | 'Article' | 'Event' | 'Recipe' | 'FAQ' | 'BreadcrumbList' | 'Review' | 'Rating';
  name: string;
  schema: Record<string, unknown>;
  pages?: string[];
  isGlobal?: boolean;
  isActive?: boolean;
}

export type UpdateSchemaMarkupRequest = Partial<CreateSchemaMarkupRequest>;

export interface CreateMetaTagRequest {
  name?: string;
  property?: string;
  content: string;
  httpEquiv?: string;
  charset?: string;
  pages?: string[];
  isGlobal?: boolean;
  isActive?: boolean;
}

export type UpdateMetaTagRequest = Partial<CreateMetaTagRequest>;

export interface CreateRedirectRuleRequest {
  sourceUrl: string;
  targetUrl: string;
  statusCode?: 301 | 302 | 307 | 308;
  isActive?: boolean;
  isRegex?: boolean;
  preserveQuery?: boolean;
  notes?: string;
}

export type UpdateRedirectRuleRequest = Partial<CreateRedirectRuleRequest>;

export interface AuditPageRequest {
  url: string;
  mobile?: boolean;
  includeContent?: boolean;
  includePerformance?: boolean;
  includeAccessibility?: boolean;
  includeBestPractices?: boolean;
}

export interface BulkAuditRequest {
  urls: string[];
  mobile?: boolean;
  includeContent?: boolean;
  includePerformance?: boolean;
  includeAccessibility?: boolean;
  includeBestPractices?: boolean;
}

class SEOApiClient {
  private client: HttpClient;

  constructor() {
    this.client = new HttpClient();
  }

  // SEO Settings
  async getSEOSettings(): Promise<ApiResponse<SEOSettings>> {
    return this.client.get(endpoints.seo.settings.get);
  }

  async updateSEOSettings(data: UpdateSEOSettingsRequest): Promise<ApiResponse<SEOSettings>> {
    return this.client.put(endpoints.seo.settings.update, data);
  }

  // Page SEO
  async getPagesSEO(params?: PaginationParams & {
    pageId?: string;
    isIndexed?: boolean;
    isActive?: boolean;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<PageSEO>>> {
    return this.client.get(endpoints.seo.pages.list, { params });
  }

  async getPageSEO(id: string): Promise<ApiResponse<PageSEO>> {
    return this.client.get(endpoints.seo.pages.byId(id));
  }

  async getPageSEOByPage(pageId: string): Promise<ApiResponse<PageSEO>> {
    return this.client.get(endpoints.seo.pages.byPage(pageId));
  }

  async createPageSEO(data: CreatePageSEORequest): Promise<ApiResponse<PageSEO>> {
    return this.client.post(endpoints.seo.pages.create, data);
  }

  async updatePageSEO(id: string, data: UpdatePageSEORequest): Promise<ApiResponse<PageSEO>> {
    return this.client.put(endpoints.seo.pages.update(id), data);
  }

  async deletePageSEO(id: string): Promise<ApiResponse<void>> {
    return this.client.delete(endpoints.seo.pages.delete(id));
  }

  async bulkUpdatePagesSEO(data: {
    ids: string[];
    updates: UpdatePageSEORequest;
  }): Promise<ApiResponse<PageSEO[]>> {
    return this.client.put(endpoints.seo.pages.bulkUpdate, data);
  }

  async generatePageSEO(pageId: string): Promise<ApiResponse<PageSEO>> {
    return this.client.post(endpoints.seo.pages.generate(pageId));
  }

  // Sitemaps
  async getSitemaps(params?: PaginationParams & {
    type?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<PaginatedResponse<Sitemap>>> {
    return this.client.get(endpoints.seo.sitemaps.list, { params });
  }

  async getSitemap(id: string): Promise<ApiResponse<Sitemap>> {
    return this.client.get(endpoints.seo.sitemaps.byId(id));
  }

  async generateSitemap(data?: GenerateSitemapRequest): Promise<ApiResponse<Sitemap[]>> {
    return this.client.post(endpoints.seo.sitemaps.generate, data);
  }

  async updateSitemap(id: string, data: {
    isActive?: boolean;
    entries?: SitemapEntry[];
  }): Promise<ApiResponse<Sitemap>> {
    return this.client.put(endpoints.seo.sitemaps.update(id), data);
  }

  async deleteSitemap(id: string): Promise<ApiResponse<void>> {
    return this.client.delete(endpoints.seo.sitemaps.delete(id));
  }

  async downloadSitemap(id: string): Promise<ApiResponse<Blob>> {
    return this.client.get(endpoints.seo.sitemaps.download(id), {
      responseType: 'blob'
    });
  }

  async validateSitemap(id: string): Promise<ApiResponse<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }>> {
    return this.client.post(endpoints.seo.sitemaps.validate(id));
  }

  async submitSitemap(id: string): Promise<ApiResponse<{
    submitted: boolean;
    searchEngines: string[];
    errors: string[];
  }>> {
    return this.client.post(endpoints.seo.sitemaps.submit(id));
  }

  // Robots.txt
  async getRobotsTxt(): Promise<ApiResponse<RobotsTxt>> {
    return this.client.get(endpoints.seo.robots.get);
  }

  async updateRobotsTxt(data: {
    content?: string;
    rules?: RobotsRule[];
    sitemaps?: string[];
    host?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<RobotsTxt>> {
    return this.client.put(endpoints.seo.robots.update, data);
  }

  async validateRobotsTxt(): Promise<ApiResponse<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  }>> {
    return this.client.post(endpoints.seo.robots.validate);
  }

  async testRobotsTxt(data: {
    userAgent: string;
    url: string;
  }): Promise<ApiResponse<{
    allowed: boolean;
    rule: string;
    crawlDelay?: number;
  }>> {
    return this.client.post(endpoints.seo.robots.test, data);
  }

  // Audits
  async getAudits(params?: PaginationParams & {
    url?: string;
    minScore?: number;
    maxScore?: number;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<PaginatedResponse<SEOAudit>>> {
    return this.client.get(endpoints.seo.audits.list, { params });
  }

  async getAudit(id: string): Promise<ApiResponse<SEOAudit>> {
    return this.client.get(endpoints.seo.audits.byId(id));
  }

  async auditPage(data: AuditPageRequest): Promise<ApiResponse<SEOAudit>> {
    return this.client.post(endpoints.seo.audits.create, data);
  }

  async bulkAuditPages(data: BulkAuditRequest): Promise<ApiResponse<SEOAudit[]>> {
    return this.client.post(endpoints.seo.audits.bulk, data);
  }

  async deleteAudit(id: string): Promise<ApiResponse<void>> {
    return this.client.delete(endpoints.seo.audits.delete(id));
  }

  async exportAudit(id: string, format: 'pdf' | 'xlsx' | 'csv'): Promise<ApiResponse<Blob>> {
    return this.client.get(endpoints.seo.audits.export(id), {
      params: { format },
      responseType: 'blob'
    });
  }

  // Schema Markup
  async getSchemaMarkups(params?: PaginationParams & {
    type?: string;
    isGlobal?: boolean;
    isActive?: boolean;
    validationStatus?: string;
  }): Promise<ApiResponse<PaginatedResponse<SchemaMarkup>>> {
    return this.client.get(endpoints.seo.schema.list, { params });
  }

  async getSchemaMarkup(id: string): Promise<ApiResponse<SchemaMarkup>> {
    return this.client.get(endpoints.seo.schema.byId(id));
  }

  async createSchemaMarkup(data: CreateSchemaMarkupRequest): Promise<ApiResponse<SchemaMarkup>> {
    return this.client.post(endpoints.seo.schema.create, data);
  }

  async updateSchemaMarkup(id: string, data: UpdateSchemaMarkupRequest): Promise<ApiResponse<SchemaMarkup>> {
    return this.client.put(endpoints.seo.schema.update(id), data);
  }

  async deleteSchemaMarkup(id: string): Promise<ApiResponse<void>> {
    return this.client.delete(endpoints.seo.schema.delete(id));
  }

  async validateSchemaMarkup(id: string): Promise<ApiResponse<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    schema: Record<string, unknown>;
  }>> {
    return this.client.post(endpoints.seo.schema.validate(id));
  }

  async generateSchemaMarkup(data: {
    type: string;
    pageUrl: string;
    autoGenerate?: boolean;
  }): Promise<ApiResponse<SchemaMarkup>> {
    return this.client.post(endpoints.seo.schema.generate, data);
  }

  // Meta Tags
  async getMetaTags(params?: PaginationParams & {
    isGlobal?: boolean;
    isActive?: boolean;
    pageId?: string;
  }): Promise<ApiResponse<PaginatedResponse<MetaTag>>> {
    return this.client.get(endpoints.seo.meta.list, { params });
  }

  async getMetaTag(id: string): Promise<ApiResponse<MetaTag>> {
    return this.client.get(endpoints.seo.meta.byId(id));
  }

  async createMetaTag(data: CreateMetaTagRequest): Promise<ApiResponse<MetaTag>> {
    return this.client.post(endpoints.seo.meta.create, data);
  }

  async updateMetaTag(id: string, data: UpdateMetaTagRequest): Promise<ApiResponse<MetaTag>> {
    return this.client.put(endpoints.seo.meta.update(id), data);
  }

  async deleteMetaTag(id: string): Promise<ApiResponse<void>> {
    return this.client.delete(endpoints.seo.meta.delete(id));
  }

  async bulkCreateMetaTags(data: CreateMetaTagRequest[]): Promise<ApiResponse<MetaTag[]>> {
    return this.client.post(endpoints.seo.meta.bulkCreate, data);
  }

  // Redirects
  async getRedirectRules(params?: PaginationParams & {
    isActive?: boolean;
    statusCode?: number;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<RedirectRule>>> {
    return this.client.get(endpoints.seo.redirects.list, { params });
  }

  async getRedirectRule(id: string): Promise<ApiResponse<RedirectRule>> {
    return this.client.get(endpoints.seo.redirects.byId(id));
  }

  async createRedirectRule(data: CreateRedirectRuleRequest): Promise<ApiResponse<RedirectRule>> {
    return this.client.post(endpoints.seo.redirects.create, data);
  }

  async updateRedirectRule(id: string, data: UpdateRedirectRuleRequest): Promise<ApiResponse<RedirectRule>> {
    return this.client.put(endpoints.seo.redirects.update(id), data);
  }

  async deleteRedirectRule(id: string): Promise<ApiResponse<void>> {
    return this.client.delete(endpoints.seo.redirects.delete(id));
  }

  async testRedirectRule(id: string, url: string): Promise<ApiResponse<{
    matches: boolean;
    targetUrl: string;
    statusCode: number;
  }>> {
    return this.client.post(endpoints.seo.redirects.test(id), { url });
  }

  async bulkCreateRedirectRules(data: CreateRedirectRuleRequest[]): Promise<ApiResponse<RedirectRule[]>> {
    return this.client.post(endpoints.seo.redirects.bulkCreate, data);
  }

  async importRedirectRules(file: File): Promise<ApiResponse<{
    imported: number;
    errors: string[];
    duplicates: number;
  }>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.client.post(endpoints.seo.redirects.import, formData);
  }

  // Analytics
  async getSEOAnalytics(params?: {
    dateFrom?: string;
    dateTo?: string;
    granularity?: 'hour' | 'day' | 'week' | 'month';
  }): Promise<ApiResponse<SEOAnalytics>> {
    return this.client.get(endpoints.seo.analytics.overview, { params });
  }

  async getKeywordRankings(params?: {
    keywords?: string[];
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<Array<{
    keyword: string;
    position: number;
    url: string;
    searchVolume: number;
    difficulty: number;
    lastUpdated: string;
  }>>> {
    return this.client.get(endpoints.seo.analytics.keywords, { params });
  }

  async getBacklinks(params?: PaginationParams & {
    domain?: string;
    type?: 'follow' | 'nofollow';
    status?: 'active' | 'lost' | 'new';
  }): Promise<ApiResponse<PaginatedResponse<{
    id: string;
    sourceUrl: string;
    targetUrl: string;
    anchorText: string;
    domain: string;
    domainRating: number;
    isFollow: boolean;
    status: 'active' | 'lost' | 'new';
    firstSeen: string;
    lastSeen: string;
  }>>> {
    return this.client.get(endpoints.seo.analytics.backlinks, { params });
  }

  async getCompetitorAnalysis(domain: string): Promise<ApiResponse<{
    domain: string;
    competitors: Array<{
      domain: string;
      similarity: number;
      organicKeywords: number;
      organicTraffic: number;
      paidKeywords: number;
      paidTraffic: number;
      backlinks: number;
      domainRating: number;
    }>;
    opportunities: Array<{
      keyword: string;
      competitorPosition: number;
      ourPosition: number;
      searchVolume: number;
      difficulty: number;
      opportunity: number;
    }>;
  }>> {
    return this.client.get(endpoints.seo.analytics.competitors(domain));
  }

  // Tools
  async analyzeKeywords(keywords: string[]): Promise<ApiResponse<Array<{
    keyword: string;
    searchVolume: number;
    difficulty: number;
    competition: number;
    cpc: number;
    trends: Array<{
      date: string;
      volume: number;
    }>;
    relatedKeywords: string[];
  }>>> {
    return this.client.post(endpoints.seo.tools.keywords, { keywords });
  }

  async checkBrokenLinks(url: string): Promise<ApiResponse<{
    url: string;
    brokenLinks: Array<{
      url: string;
      statusCode: number;
      errorMessage: string;
      sourcePages: string[];
    }>;
    checkedLinks: number;
    timestamp: string;
  }>> {
    return this.client.post(endpoints.seo.tools.brokenLinks, { url });
  }

  async analyzePageSpeed(url: string, device: 'mobile' | 'desktop' = 'desktop'): Promise<ApiResponse<{
    url: string;
    device: string;
    score: number;
    metrics: {
      firstContentfulPaint: number;
      largestContentfulPaint: number;
      firstInputDelay: number;
      cumulativeLayoutShift: number;
      totalBlockingTime: number;
      speedIndex: number;
    };
    opportunities: Array<{
      title: string;
      description: string;
      savings: number;
      impact: 'high' | 'medium' | 'low';
    }>;
    diagnostics: Array<{
      title: string;
      description: string;
      impact: 'high' | 'medium' | 'low';
    }>;
    timestamp: string;
  }>> {
    return this.client.post(endpoints.seo.tools.pageSpeed, { url, device });
  }

  async analyzeSERPFeatures(keyword: string, location?: string): Promise<ApiResponse<{
    keyword: string;
    location?: string;
    features: Array<{
      type: 'featured_snippet' | 'knowledge_panel' | 'local_pack' | 'images' | 'videos' | 'shopping' | 'people_also_ask' | 'related_searches';
      present: boolean;
      position?: number;
      content?: string;
    }>;
    organicResults: Array<{
      position: number;
      url: string;
      title: string;
      description: string;
      domain: string;
    }>;
    timestamp: string;
  }>> {
    return this.client.post(endpoints.seo.tools.serpFeatures, { keyword, location });
  }

  async generateContentIdeas(data: {
    topic: string;
    keywords?: string[];
    contentType?: 'blog' | 'product' | 'category' | 'landing';
    targetAudience?: string;
    competitors?: string[];
  }): Promise<ApiResponse<{
    topic: string;
    ideas: Array<{
      title: string;
      description: string;
      keywords: string[];
      difficulty: number;
      searchVolume: number;
      contentType: string;
      outline: string[];
      relatedTopics: string[];
    }>;
    gapAnalysis: Array<{
      keyword: string;
      searchVolume: number;
      difficulty: number;
      competitorCoverage: number;
      opportunity: number;
    }>;
  }>> {
    return this.client.post(endpoints.seo.tools.contentIdeas, data);
  }
}

export const seoApi = new SEOApiClient();

// React Query Hooks

// SEO Settings Hooks
export const useSEOSettings = (options?: UseQueryOptions<ApiResponse<SEOSettings>>) => {
  return useQuery({
    queryKey: ['seo', 'settings'],
    queryFn: () => seoApi.getSEOSettings(),
    ...options,
  });
};

export const useUpdateSEOSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateSEOSettingsRequest) => seoApi.updateSEOSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo', 'settings'] });
    },
  });
};

// Page SEO Hooks
export const usePagesSEO = (
  params?: PaginationParams & {
    pageId?: string;
    isIndexed?: boolean;
    isActive?: boolean;
    search?: string;
  },
  options?: UseQueryOptions<ApiResponse<PaginatedResponse<PageSEO>>>
) => {
  return useQuery({
    queryKey: ['seo', 'pages', params],
    queryFn: () => seoApi.getPagesSEO(params),
    ...options,
  });
};

export const usePageSEO = (id: string, options?: UseQueryOptions<ApiResponse<PageSEO>>) => {
  return useQuery({
    queryKey: ['seo', 'pages', id],
    queryFn: () => seoApi.getPageSEO(id),
    enabled: !!id,
    ...options,
  });
};

export const usePageSEOByPage = (pageId: string, options?: UseQueryOptions<ApiResponse<PageSEO>>) => {
  return useQuery({
    queryKey: ['seo', 'pages', 'by-page', pageId],
    queryFn: () => seoApi.getPageSEOByPage(pageId),
    enabled: !!pageId,
    ...options,
  });
};

export const useCreatePageSEO = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreatePageSEORequest) => seoApi.createPageSEO(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['seo', 'pages'] });
      if (response.data) {
        queryClient.setQueryData(['seo', 'pages', response.data.id], response);
        queryClient.setQueryData(['seo', 'pages', 'by-page', response.data.pageId], response);
      }
    },
  });
};

export const useUpdatePageSEO = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePageSEORequest }) => 
      seoApi.updatePageSEO(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['seo', 'pages'] });
      if (response.data) {
        queryClient.setQueryData(['seo', 'pages', id], response);
        queryClient.setQueryData(['seo', 'pages', 'by-page', response.data.pageId], response);
      }
    },
  });
};

export const useDeletePageSEO = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => seoApi.deletePageSEO(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['seo', 'pages'] });
      queryClient.removeQueries({ queryKey: ['seo', 'pages', id] });
    },
  });
};

export const useBulkUpdatePagesSEO = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { ids: string[]; updates: UpdatePageSEORequest }) => 
      seoApi.bulkUpdatePagesSEO(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo', 'pages'] });
    },
  });
};

export const useGeneratePageSEO = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (pageId: string) => seoApi.generatePageSEO(pageId),
    onSuccess: (response, pageId) => {
      queryClient.invalidateQueries({ queryKey: ['seo', 'pages'] });
      if (response.data) {
        queryClient.setQueryData(['seo', 'pages', response.data.id], response);
        queryClient.setQueryData(['seo', 'pages', 'by-page', pageId], response);
      }
    },
  });
};

// Sitemap Hooks
export const useSitemaps = (
  params?: PaginationParams & {
    type?: string;
    isActive?: boolean;
  },
  options?: UseQueryOptions<ApiResponse<PaginatedResponse<Sitemap>>>
) => {
  return useQuery({
    queryKey: ['seo', 'sitemaps', params],
    queryFn: () => seoApi.getSitemaps(params),
    ...options,
  });
};

export const useSitemap = (id: string, options?: UseQueryOptions<ApiResponse<Sitemap>>) => {
  return useQuery({
    queryKey: ['seo', 'sitemaps', id],
    queryFn: () => seoApi.getSitemap(id),
    enabled: !!id,
    ...options,
  });
};

export const useGenerateSitemap = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data?: GenerateSitemapRequest) => seoApi.generateSitemap(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo', 'sitemaps'] });
    },
  });
};

export const useUpdateSitemap = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: { isActive?: boolean; entries?: SitemapEntry[] } 
    }) => seoApi.updateSitemap(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['seo', 'sitemaps'] });
      queryClient.setQueryData(['seo', 'sitemaps', id], response);
    },
  });
};

export const useDeleteSitemap = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => seoApi.deleteSitemap(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['seo', 'sitemaps'] });
      queryClient.removeQueries({ queryKey: ['seo', 'sitemaps', id] });
    },
  });
};

export const useValidateSitemap = () => {
  return useMutation({
    mutationFn: (id: string) => seoApi.validateSitemap(id),
  });
};

export const useSubmitSitemap = () => {
  return useMutation({
    mutationFn: (id: string) => seoApi.submitSitemap(id),
  });
};

// Robots.txt Hooks
export const useRobotsTxt = (options?: UseQueryOptions<ApiResponse<RobotsTxt>>) => {
  return useQuery({
    queryKey: ['seo', 'robots'],
    queryFn: () => seoApi.getRobotsTxt(),
    ...options,
  });
};

export const useUpdateRobotsTxt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      content?: string;
      rules?: RobotsRule[];
      sitemaps?: string[];
      host?: string;
      isActive?: boolean;
    }) => seoApi.updateRobotsTxt(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo', 'robots'] });
    },
  });
};

export const useValidateRobotsTxt = () => {
  return useMutation({
    mutationFn: () => seoApi.validateRobotsTxt(),
  });
};

export const useTestRobotsTxt = () => {
  return useMutation({
    mutationFn: (data: { userAgent: string; url: string }) => seoApi.testRobotsTxt(data),
  });
};

// Audit Hooks
export const useAudits = (
  params?: PaginationParams & {
    url?: string;
    minScore?: number;
    maxScore?: number;
    dateFrom?: string;
    dateTo?: string;
  },
  options?: UseQueryOptions<ApiResponse<PaginatedResponse<SEOAudit>>>
) => {
  return useQuery({
    queryKey: ['seo', 'audits', params],
    queryFn: () => seoApi.getAudits(params),
    ...options,
  });
};

export const useAudit = (id: string, options?: UseQueryOptions<ApiResponse<SEOAudit>>) => {
  return useQuery({
    queryKey: ['seo', 'audits', id],
    queryFn: () => seoApi.getAudit(id),
    enabled: !!id,
    ...options,
  });
};

export const useAuditPage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: AuditPageRequest) => seoApi.auditPage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo', 'audits'] });
    },
  });
};

export const useBulkAuditPages = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: BulkAuditRequest) => seoApi.bulkAuditPages(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo', 'audits'] });
    },
  });
};

export const useDeleteAudit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => seoApi.deleteAudit(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['seo', 'audits'] });
      queryClient.removeQueries({ queryKey: ['seo', 'audits', id] });
    },
  });
};

// Schema Markup Hooks
export const useSchemaMarkups = (
  params?: PaginationParams & {
    type?: string;
    isGlobal?: boolean;
    isActive?: boolean;
    validationStatus?: string;
  },
  options?: UseQueryOptions<ApiResponse<PaginatedResponse<SchemaMarkup>>>
) => {
  return useQuery({
    queryKey: ['seo', 'schema', params],
    queryFn: () => seoApi.getSchemaMarkups(params),
    ...options,
  });
};

export const useSchemaMarkup = (id: string, options?: UseQueryOptions<ApiResponse<SchemaMarkup>>) => {
  return useQuery({
    queryKey: ['seo', 'schema', id],
    queryFn: () => seoApi.getSchemaMarkup(id),
    enabled: !!id,
    ...options,
  });
};

export const useCreateSchemaMarkup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateSchemaMarkupRequest) => seoApi.createSchemaMarkup(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['seo', 'schema'] });
      if (response.data) {
        queryClient.setQueryData(['seo', 'schema', response.data.id], response);
      }
    },
  });
};

export const useUpdateSchemaMarkup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSchemaMarkupRequest }) => 
      seoApi.updateSchemaMarkup(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['seo', 'schema'] });
      queryClient.setQueryData(['seo', 'schema', id], response);
    },
  });
};

export const useDeleteSchemaMarkup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => seoApi.deleteSchemaMarkup(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['seo', 'schema'] });
      queryClient.removeQueries({ queryKey: ['seo', 'schema', id] });
    },
  });
};

export const useValidateSchemaMarkup = () => {
  return useMutation({
    mutationFn: (id: string) => seoApi.validateSchemaMarkup(id),
  });
};

export const useGenerateSchemaMarkup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      type: string;
      pageUrl: string;
      autoGenerate?: boolean;
    }) => seoApi.generateSchemaMarkup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo', 'schema'] });
    },
  });
};

// Meta Tags Hooks
export const useMetaTags = (
  params?: PaginationParams & {
    isGlobal?: boolean;
    isActive?: boolean;
    pageId?: string;
  },
  options?: UseQueryOptions<ApiResponse<PaginatedResponse<MetaTag>>>
) => {
  return useQuery({
    queryKey: ['seo', 'meta', params],
    queryFn: () => seoApi.getMetaTags(params),
    ...options,
  });
};

export const useMetaTag = (id: string, options?: UseQueryOptions<ApiResponse<MetaTag>>) => {
  return useQuery({
    queryKey: ['seo', 'meta', id],
    queryFn: () => seoApi.getMetaTag(id),
    enabled: !!id,
    ...options,
  });
};

export const useCreateMetaTag = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateMetaTagRequest) => seoApi.createMetaTag(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['seo', 'meta'] });
      if (response.data) {
        queryClient.setQueryData(['seo', 'meta', response.data.id], response);
      }
    },
  });
};

export const useUpdateMetaTag = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMetaTagRequest }) => 
      seoApi.updateMetaTag(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['seo', 'meta'] });
      queryClient.setQueryData(['seo', 'meta', id], response);
    },
  });
};

export const useDeleteMetaTag = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => seoApi.deleteMetaTag(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['seo', 'meta'] });
      queryClient.removeQueries({ queryKey: ['seo', 'meta', id] });
    },
  });
};

export const useBulkCreateMetaTags = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateMetaTagRequest[]) => seoApi.bulkCreateMetaTags(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo', 'meta'] });
    },
  });
};

// Redirect Rules Hooks
export const useRedirectRules = (
  params?: PaginationParams & {
    isActive?: boolean;
    statusCode?: number;
    search?: string;
  },
  options?: UseQueryOptions<ApiResponse<PaginatedResponse<RedirectRule>>>
) => {
  return useQuery({
    queryKey: ['seo', 'redirects', params],
    queryFn: () => seoApi.getRedirectRules(params),
    ...options,
  });
};

export const useRedirectRule = (id: string, options?: UseQueryOptions<ApiResponse<RedirectRule>>) => {
  return useQuery({
    queryKey: ['seo', 'redirects', id],
    queryFn: () => seoApi.getRedirectRule(id),
    enabled: !!id,
    ...options,
  });
};

export const useCreateRedirectRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateRedirectRuleRequest) => seoApi.createRedirectRule(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['seo', 'redirects'] });
      if (response.data) {
        queryClient.setQueryData(['seo', 'redirects', response.data.id], response);
      }
    },
  });
};

export const useUpdateRedirectRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRedirectRuleRequest }) => 
      seoApi.updateRedirectRule(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['seo', 'redirects'] });
      queryClient.setQueryData(['seo', 'redirects', id], response);
    },
  });
};

export const useDeleteRedirectRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => seoApi.deleteRedirectRule(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['seo', 'redirects'] });
      queryClient.removeQueries({ queryKey: ['seo', 'redirects', id] });
    },
  });
};

export const useTestRedirectRule = () => {
  return useMutation({
    mutationFn: ({ id, url }: { id: string; url: string }) => 
      seoApi.testRedirectRule(id, url),
  });
};

export const useBulkCreateRedirectRules = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateRedirectRuleRequest[]) => seoApi.bulkCreateRedirectRules(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo', 'redirects'] });
    },
  });
};

export const useImportRedirectRules = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file: File) => seoApi.importRedirectRules(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo', 'redirects'] });
    },
  });
};

// Analytics Hooks
export const useSEOAnalytics = (
  params?: {
    dateFrom?: string;
    dateTo?: string;
    granularity?: 'hour' | 'day' | 'week' | 'month';
  },
  options?: UseQueryOptions<ApiResponse<SEOAnalytics>>
) => {
  return useQuery({
    queryKey: ['seo', 'analytics', 'overview', params],
    queryFn: () => seoApi.getSEOAnalytics(params),
    ...options,
  });
};

export const useKeywordRankings = (
  params?: {
    keywords?: string[];
    dateFrom?: string;
    dateTo?: string;
  },
  options?: UseQueryOptions<ApiResponse<Array<{
    keyword: string;
    position: number;
    url: string;
    searchVolume: number;
    difficulty: number;
    lastUpdated: string;
  }>>>
) => {
  return useQuery({
    queryKey: ['seo', 'analytics', 'keywords', params],
    queryFn: () => seoApi.getKeywordRankings(params),
    ...options,
  });
};

export const useBacklinks = (
  params?: PaginationParams & {
    domain?: string;
    type?: 'follow' | 'nofollow';
    status?: 'active' | 'lost' | 'new';
  },
  options?: UseQueryOptions<ApiResponse<PaginatedResponse<{
    id: string;
    sourceUrl: string;
    targetUrl: string;
    anchorText: string;
    domain: string;
    domainRating: number;
    isFollow: boolean;
    status: 'active' | 'lost' | 'new';
    firstSeen: string;
    lastSeen: string;
  }>>>
) => {
  return useQuery({
    queryKey: ['seo', 'analytics', 'backlinks', params],
    queryFn: () => seoApi.getBacklinks(params),
    ...options,
  });
};

export const useCompetitorAnalysis = (domain: string, options?: UseQueryOptions<ApiResponse<{
  domain: string;
  competitors: Array<{
    domain: string;
    similarity: number;
    organicKeywords: number;
    organicTraffic: number;
    paidKeywords: number;
    paidTraffic: number;
    backlinks: number;
    domainRating: number;
  }>;
  opportunities: Array<{
    keyword: string;
    competitorPosition: number;
    ourPosition: number;
    searchVolume: number;
    difficulty: number;
    opportunity: number;
  }>;
}>>) => {
  return useQuery({
    queryKey: ['seo', 'analytics', 'competitors', domain],
    queryFn: () => seoApi.getCompetitorAnalysis(domain),
    enabled: !!domain,
    ...options,
  });
};

// Tools Hooks
export const useAnalyzeKeywords = () => {
  return useMutation({
    mutationFn: (keywords: string[]) => seoApi.analyzeKeywords(keywords),
  });
};

export const useCheckBrokenLinks = () => {
  return useMutation({
    mutationFn: (url: string) => seoApi.checkBrokenLinks(url),
  });
};

export const useAnalyzePageSpeed = () => {
  return useMutation({
    mutationFn: ({ url, device }: { url: string; device?: 'mobile' | 'desktop' }) => 
      seoApi.analyzePageSpeed(url, device),
  });
};

export const useAnalyzeSERPFeatures = () => {
  return useMutation({
    mutationFn: ({ keyword, location }: { keyword: string; location?: string }) => 
      seoApi.analyzeSERPFeatures(keyword, location),
  });
};

export const useGenerateContentIdeas = () => {
  return useMutation({
    mutationFn: (data: {
      topic: string;
      keywords?: string[];
      contentType?: 'blog' | 'product' | 'category' | 'landing';
      targetAudience?: string;
      competitors?: string[];
    }) => seoApi.generateContentIdeas(data),
  });
};
