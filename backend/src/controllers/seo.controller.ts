/**
 * SEO Controller
 * Comprehensive SEO management with settings, pages, sitemaps, robots.txt, schema markup, meta tags, redirects, audits
 */

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import {
  SEOSettings,
  PageSEO,
  Sitemap,
  RobotsTxt,
  SchemaMarkup,
  MetaTag,
  RedirectRule,
  SEOAudit,
  ISEOSettings,
  IPageSEO,
  ISitemap,
  IRobotsTxt,
  ISchemaMarkup,
  IMetaTag,
  IRedirectRule,
  ISEOAudit
} from '../models/seo.model';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

// ============================================================================
// SEO SETTINGS ENDPOINTS
// ============================================================================

/**
 * Get SEO settings (Public/Admin)
 * @route GET /api/v1/seo/settings
 * @access Public
 */
export const getSEOSettings = catchAsync(async (req: Request, res: Response) => {
  let settings = await SEOSettings.findOne().lean();

  // If no settings exist, create default ones
  if (!settings) {
    const newSettings = await SEOSettings.create({
      siteTitle: 'Vardhman Mills',
      siteDescription: 'Premium textile and fabric manufacturer',
      defaultKeywords: ['textile', 'fabric', 'manufacturing'],
      robotsContent: 'index, follow',
      sitemapEnabled: true,
      openGraphEnabled: true,
      twitterCardsEnabled: true,
      structuredDataEnabled: true,
      canonicalUrlsEnabled: true,
      hreflangEnabled: false,
      metaRobotsDefault: 'index, follow'
    });
    settings = newSettings.toObject() as any;
  }

  res.status(200).json({
    success: true,
    data: settings
  });
});

/**
 * Update SEO settings (Admin)
 * @route PATCH /api/v1/seo/settings
 * @access Private/Admin
 */
export const updateSEOSettings = catchAsync(async (req: Request, res: Response) => {
  let settings = await SEOSettings.findOne();

  if (!settings) {
    settings = await SEOSettings.create(req.body);
  } else {
    Object.assign(settings, req.body);
    await settings.save();
  }

  res.status(200).json({
    success: true,
    data: settings
  });
});

// ============================================================================
// PAGE SEO ENDPOINTS
// ============================================================================

/**
 * Get all page SEO configurations (Admin)
 * @route GET /api/v1/seo/pages
 * @access Private/Admin
 */
export const getPagesSEO = catchAsync(async (req: Request, res: Response) => {
  const {
    pageType,
    isIndexed,
    isActive,
    search,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    order = 'desc'
  } = req.query;

  const query: any = {};

  if (pageType) query.pageType = pageType;
  if (isIndexed !== undefined) query.isIndexed = isIndexed === 'true';
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { pageId: { $regex: search, $options: 'i' } }
    ];
  }

  const sortOptions: any = {};
  sortOptions[sortBy as string] = order === 'desc' ? -1 : 1;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [pages, total] = await Promise.all([
    PageSEO.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    PageSEO.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: pages.length,
    total,
    totalPages: Math.ceil(total / limitNum),
    currentPage: pageNum,
    data: pages
  });
});

/**
 * Get page SEO by ID (Public)
 * @route GET /api/v1/seo/pages/:id
 * @access Public
 */
export const getPageSEO = catchAsync(async (req: Request, res: Response) => {
  const page = await PageSEO.findById(req.params.id).lean();

  if (!page) {
    throw new AppError('Page SEO not found', 404);
  }

  res.status(200).json({
    success: true,
    data: page
  });
});

/**
 * Get page SEO by page ID (Public)
 * @route GET /api/v1/seo/pages/by-page/:pageId
 * @access Public
 */
export const getPageSEOByPage = catchAsync(async (req: Request, res: Response) => {
  const page = await PageSEO.findOne({ pageId: req.params.pageId }).lean();

  if (!page) {
    throw new AppError('Page SEO not found', 404);
  }

  res.status(200).json({
    success: true,
    data: page
  });
});

/**
 * Create page SEO (Admin)
 * @route POST /api/v1/seo/pages
 * @access Private/Admin
 */
export const createPageSEO = catchAsync(async (req: Request, res: Response) => {
  // Check for duplicate pageId
  const existing = await PageSEO.findOne({ pageId: req.body.pageId });
  if (existing) {
    throw new AppError('Page SEO already exists for this pageId', 400);
  }

  const page = await PageSEO.create(req.body);

  res.status(201).json({
    success: true,
    data: page
  });
});

/**
 * Update page SEO (Admin)
 * @route PATCH /api/v1/seo/pages/:id
 * @access Private/Admin
 */
export const updatePageSEO = catchAsync(async (req: Request, res: Response) => {
  const page = await PageSEO.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!page) {
    throw new AppError('Page SEO not found', 404);
  }

  res.status(200).json({
    success: true,
    data: page
  });
});

/**
 * Delete page SEO (Admin)
 * @route DELETE /api/v1/seo/pages/:id
 * @access Private/Admin
 */
export const deletePageSEO = catchAsync(async (req: Request, res: Response) => {
  const page = await PageSEO.findByIdAndDelete(req.params.id);

  if (!page) {
    throw new AppError('Page SEO not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Page SEO deleted successfully'
  });
});

/**
 * Bulk update pages SEO (Admin)
 * @route PATCH /api/v1/seo/pages/bulk-update
 * @access Private/Admin
 */
export const bulkUpdatePagesSEO = catchAsync(async (req: Request, res: Response) => {
  const { ids, updates } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError('Please provide an array of page IDs', 400);
  }

  const result = await PageSEO.updateMany(
    { _id: { $in: ids } },
    { $set: updates }
  );

  res.status(200).json({
    success: true,
    message: 'Pages SEO updated successfully',
    modifiedCount: result.modifiedCount
  });
});

/**
 * Generate page SEO automatically (Admin)
 * @route POST /api/v1/seo/pages/generate/:pageId
 * @access Private/Admin
 */
export const generatePageSEO = catchAsync(async (req: Request, res: Response) => {
  const { pageId } = req.params;
  const { title, content, keywords } = req.body;

  // Check if already exists
  let page = await PageSEO.findOne({ pageId });

  if (page) {
    throw new AppError('Page SEO already exists. Use update instead.', 400);
  }

  // Generate SEO from content
  const description = content ? content.substring(0, 160) : '';
  const autoKeywords = keywords || [];

  page = await PageSEO.create({
    pageId,
    title: title || 'Page Title',
    description,
    keywords: autoKeywords,
    ogTitle: title,
    ogDescription: description,
    twitterTitle: title,
    twitterDescription: description,
    isIndexed: true,
    isActive: true
  });

  res.status(201).json({
    success: true,
    data: page
  });
});

// ============================================================================
// SITEMAP ENDPOINTS
// ============================================================================

/**
 * Get all sitemaps (Public)
 * @route GET /api/v1/seo/sitemaps
 * @access Public
 */
export const getSitemaps = catchAsync(async (req: Request, res: Response) => {
  const {
    type,
    isActive,
    page = 1,
    limit = 20
  } = req.query;

  const query: any = {};
  if (type) query.type = type;
  if (isActive !== undefined) query.isActive = isActive === 'true';

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [sitemaps, total] = await Promise.all([
    Sitemap.find(query)
      .sort({ lastGenerated: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Sitemap.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: sitemaps.length,
    total,
    totalPages: Math.ceil(total / limitNum),
    currentPage: pageNum,
    data: sitemaps
  });
});

/**
 * Get sitemap by ID (Public)
 * @route GET /api/v1/seo/sitemaps/:id
 * @access Public
 */
export const getSitemap = catchAsync(async (req: Request, res: Response) => {
  const sitemap = await Sitemap.findById(req.params.id).lean();

  if (!sitemap) {
    throw new AppError('Sitemap not found', 404);
  }

  res.status(200).json({
    success: true,
    data: sitemap
  });
});

/**
 * Generate sitemap (Admin)
 * @route POST /api/v1/seo/sitemaps/generate
 * @access Private/Admin
 */
export const generateSitemap = catchAsync(async (req: Request, res: Response) => {
  const { type = 'pages', includeImages = false, includeVideos = false } = req.body;

  // Get all pages SEO
  const pages = await PageSEO.find({ isActive: true, isIndexed: true }).lean();

  const entries = pages.map(page => ({
    loc: page.canonicalUrl || `/${page.pageId}`,
    lastmod: page.lastModified || new Date(),
    changefreq: page.changeFreq || 'weekly',
    priority: page.priority || 0.5,
    images: includeImages ? [] : undefined,
    videos: includeVideos ? [] : undefined
  }));

  const sitemap = await Sitemap.create({
    type,
    url: `/sitemap-${type}.xml`,
    entries,
    lastGenerated: new Date(),
    size: entries.length,
    compressed: false,
    isActive: true
  });

  res.status(201).json({
    success: true,
    data: sitemap
  });
});

/**
 * Update sitemap (Admin)
 * @route PATCH /api/v1/seo/sitemaps/:id
 * @access Private/Admin
 */
export const updateSitemap = catchAsync(async (req: Request, res: Response) => {
  const sitemap = await Sitemap.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!sitemap) {
    throw new AppError('Sitemap not found', 404);
  }

  res.status(200).json({
    success: true,
    data: sitemap
  });
});

/**
 * Delete sitemap (Admin)
 * @route DELETE /api/v1/seo/sitemaps/:id
 * @access Private/Admin
 */
export const deleteSitemap = catchAsync(async (req: Request, res: Response) => {
  const sitemap = await Sitemap.findByIdAndDelete(req.params.id);

  if (!sitemap) {
    throw new AppError('Sitemap not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Sitemap deleted successfully'
  });
});

/**
 * Download sitemap XML (Public)
 * @route GET /api/v1/seo/sitemaps/:id/download
 * @access Public
 */
export const downloadSitemap = catchAsync(async (req: Request, res: Response) => {
  const sitemap = await Sitemap.findById(req.params.id);

  if (!sitemap) {
    throw new AppError('Sitemap not found', 404);
  }

  // Generate XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  sitemap.entries.forEach(entry => {
    xml += '  <url>\n';
    xml += `    <loc>${entry.loc}</loc>\n`;
    xml += `    <lastmod>${entry.lastmod.toISOString()}</lastmod>\n`;
    xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
    xml += `    <priority>${entry.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>';

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Content-Disposition', `attachment; filename=sitemap-${sitemap.type}.xml`);
  res.status(200).send(xml);
});

/**
 * Validate sitemap (Admin)
 * @route POST /api/v1/seo/sitemaps/:id/validate
 * @access Private/Admin
 */
export const validateSitemap = catchAsync(async (req: Request, res: Response) => {
  const sitemap = await Sitemap.findById(req.params.id);

  if (!sitemap) {
    throw new AppError('Sitemap not found', 404);
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate entries
  if (sitemap.entries.length === 0) {
    errors.push('Sitemap has no entries');
  }

  if (sitemap.entries.length > 50000) {
    errors.push('Sitemap exceeds 50,000 URL limit');
  }

  sitemap.entries.forEach((entry, index) => {
    if (!entry.loc) {
      errors.push(`Entry ${index + 1}: Missing location URL`);
    }
    if (entry.priority < 0 || entry.priority > 1) {
      errors.push(`Entry ${index + 1}: Priority must be between 0 and 1`);
    }
  });

  const isValid = errors.length === 0;

  res.status(200).json({
    success: true,
    data: {
      isValid,
      errors,
      warnings,
      entryCount: sitemap.entries.length
    }
  });
});

/**
 * Submit sitemap to search engines (Admin)
 * @route POST /api/v1/seo/sitemaps/:id/submit
 * @access Private/Admin
 */
export const submitSitemap = catchAsync(async (req: Request, res: Response) => {
  const sitemap = await Sitemap.findById(req.params.id);

  if (!sitemap) {
    throw new AppError('Sitemap not found', 404);
  }

  // In production, this would ping search engines
  // For now, return mock success
  const results = {
    google: { submitted: true, status: 'pending' },
    bing: { submitted: true, status: 'pending' }
  };

  res.status(200).json({
    success: true,
    message: 'Sitemap submitted to search engines',
    data: results
  });
});

// ============================================================================
// ROBOTS.TXT ENDPOINTS
// ============================================================================

/**
 * Get robots.txt (Public)
 * @route GET /api/v1/seo/robots
 * @access Public
 */
export const getRobotsTxt = catchAsync(async (req: Request, res: Response) => {
  let robots = await RobotsTxt.findOne({ isActive: true }).lean();

  if (!robots) {
    // Create default robots.txt
    const newRobots = await RobotsTxt.create({
      content: 'User-agent: *\nAllow: /',
      rules: [{
        userAgent: '*',
        allow: ['/'],
        disallow: []
      }],
      sitemaps: ['/sitemap.xml'],
      isActive: true
    });
    robots = newRobots.toObject() as any;
  }

  res.status(200).json({
    success: true,
    data: robots
  });
});

/**
 * Update robots.txt (Admin)
 * @route PATCH /api/v1/seo/robots
 * @access Private/Admin
 */
export const updateRobotsTxt = catchAsync(async (req: Request, res: Response) => {
  let robots = await RobotsTxt.findOne();

  if (!robots) {
    robots = await RobotsTxt.create(req.body);
  } else {
    Object.assign(robots, req.body);
    await robots.save();
  }

  res.status(200).json({
    success: true,
    data: robots
  });
});

/**
 * Validate robots.txt (Admin)
 * @route POST /api/v1/seo/robots/validate
 * @access Private/Admin
 */
export const validateRobotsTxt = catchAsync(async (req: Request, res: Response) => {
  const robots = await RobotsTxt.findOne({ isActive: true });

  if (!robots) {
    throw new AppError('Robots.txt not found', 404);
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate content
  if (!robots.content || robots.content.trim().length === 0) {
    errors.push('Robots.txt content is empty');
  }

  // Validate rules
  if (!robots.rules || robots.rules.length === 0) {
    warnings.push('No rules defined');
  }

  const isValid = errors.length === 0;

  res.status(200).json({
    success: true,
    data: {
      isValid,
      errors,
      warnings
    }
  });
});

/**
 * Test robots.txt rule (Admin)
 * @route POST /api/v1/seo/robots/test
 * @access Private/Admin
 */
export const testRobotsTxt = catchAsync(async (req: Request, res: Response) => {
  const { url, userAgent = '*' } = req.body;

  if (!url) {
    throw new AppError('Please provide a URL to test', 400);
  }

  const robots = await RobotsTxt.findOne({ isActive: true });

  if (!robots) {
    throw new AppError('Robots.txt not found', 404);
  }

  // Find matching rule
  const rule = robots.rules.find(r => r.userAgent === userAgent || r.userAgent === '*');

  let isAllowed = true;
  let matchedRule = 'No specific rule';

  if (rule) {
    // Check disallow first
    const isDisallowed = rule.disallow?.some(pattern => url.startsWith(pattern));
    if (isDisallowed) {
      isAllowed = false;
      matchedRule = 'Disallow rule';
    }

    // Check allow (overrides disallow)
    const isExplicitlyAllowed = rule.allow?.some(pattern => url.startsWith(pattern));
    if (isExplicitlyAllowed) {
      isAllowed = true;
      matchedRule = 'Allow rule';
    }
  }

  res.status(200).json({
    success: true,
    data: {
      url,
      userAgent,
      isAllowed,
      matchedRule
    }
  });
});

// ============================================================================
// SCHEMA MARKUP ENDPOINTS
// ============================================================================

/**
 * Get all schema markups (Admin)
 * @route GET /api/v1/seo/schema-markups
 * @access Private/Admin
 */
export const getSchemaMarkups = catchAsync(async (req: Request, res: Response) => {
  const {
    type,
    pageId,
    isActive,
    page = 1,
    limit = 20
  } = req.query;

  const query: any = {};
  if (type) query.type = type;
  if (pageId) query.pageId = pageId;
  if (isActive !== undefined) query.isActive = isActive === 'true';

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [schemas, total] = await Promise.all([
    SchemaMarkup.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    SchemaMarkup.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: schemas.length,
    total,
    totalPages: Math.ceil(total / limitNum),
    currentPage: pageNum,
    data: schemas
  });
});

/**
 * Get schema markup by ID (Public)
 * @route GET /api/v1/seo/schema-markups/:id
 * @access Public
 */
export const getSchemaMarkup = catchAsync(async (req: Request, res: Response) => {
  const schema = await SchemaMarkup.findById(req.params.id).lean();

  if (!schema) {
    throw new AppError('Schema markup not found', 404);
  }

  res.status(200).json({
    success: true,
    data: schema
  });
});

/**
 * Create schema markup (Admin)
 * @route POST /api/v1/seo/schema-markups
 * @access Private/Admin
 */
export const createSchemaMarkup = catchAsync(async (req: Request, res: Response) => {
  const schema = await SchemaMarkup.create(req.body);

  res.status(201).json({
    success: true,
    data: schema
  });
});

/**
 * Update schema markup (Admin)
 * @route PATCH /api/v1/seo/schema-markups/:id
 * @access Private/Admin
 */
export const updateSchemaMarkup = catchAsync(async (req: Request, res: Response) => {
  const schema = await SchemaMarkup.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!schema) {
    throw new AppError('Schema markup not found', 404);
  }

  res.status(200).json({
    success: true,
    data: schema
  });
});

/**
 * Delete schema markup (Admin)
 * @route DELETE /api/v1/seo/schema-markups/:id
 * @access Private/Admin
 */
export const deleteSchemaMarkup = catchAsync(async (req: Request, res: Response) => {
  const schema = await SchemaMarkup.findByIdAndDelete(req.params.id);

  if (!schema) {
    throw new AppError('Schema markup not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Schema markup deleted successfully'
  });
});

/**
 * Validate schema markup (Admin)
 * @route POST /api/v1/seo/schema-markups/:id/validate
 * @access Private/Admin
 */
export const validateSchemaMarkup = catchAsync(async (req: Request, res: Response) => {
  const schema = await SchemaMarkup.findById(req.params.id);

  if (!schema) {
    throw new AppError('Schema markup not found', 404);
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic validation
  if (!schema.schemaData || Object.keys(schema.schemaData).length === 0) {
    errors.push('Schema data is empty');
  }

  if (schema.schemaData && !schema.schemaData['@context']) {
    warnings.push('Missing @context property (recommended: http://schema.org)');
  }

  if (schema.schemaData && !schema.schemaData['@type']) {
    errors.push('Missing required @type property');
  }

  const isValid = errors.length === 0;

  res.status(200).json({
    success: true,
    data: {
      isValid,
      errors,
      warnings
    }
  });
});

/**
 * Generate schema markup from data (Admin)
 * @route POST /api/v1/seo/schema-markups/generate
 * @access Private/Admin
 */
export const generateSchemaMarkup = catchAsync(async (req: Request, res: Response) => {
  const { type, pageId, data } = req.body;

  if (!type || !data) {
    throw new AppError('Please provide type and data', 400);
  }

  // Auto-add @context if missing
  if (!data['@context']) {
    data['@context'] = 'http://schema.org';
  }

  // Auto-add @type if missing
  if (!data['@type']) {
    data['@type'] = type;
  }

  const schema = await SchemaMarkup.create({
    pageId,
    type,
    name: data.name || `${type} Schema`,
    data,
    isActive: true
  });

  res.status(201).json({
    success: true,
    data: schema
  });
});

// ============================================================================
// META TAG ENDPOINTS
// ============================================================================

/**
 * Get all meta tags (Admin)
 * @route GET /api/v1/seo/meta-tags
 * @access Private/Admin
 */
export const getMetaTags = catchAsync(async (req: Request, res: Response) => {
  const {
    pageId,
    isActive,
    page = 1,
    limit = 20
  } = req.query;

  const query: any = {};
  if (pageId) query.pageId = pageId;
  if (isActive !== undefined) query.isActive = isActive === 'true';

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [metaTags, total] = await Promise.all([
    MetaTag.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    MetaTag.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: metaTags.length,
    total,
    totalPages: Math.ceil(total / limitNum),
    currentPage: pageNum,
    data: metaTags
  });
});

/**
 * Get meta tag by ID (Public)
 * @route GET /api/v1/seo/meta-tags/:id
 * @access Public
 */
export const getMetaTag = catchAsync(async (req: Request, res: Response) => {
  const metaTag = await MetaTag.findById(req.params.id).lean();

  if (!metaTag) {
    throw new AppError('Meta tag not found', 404);
  }

  res.status(200).json({
    success: true,
    data: metaTag
  });
});

/**
 * Create meta tag (Admin)
 * @route POST /api/v1/seo/meta-tags
 * @access Private/Admin
 */
export const createMetaTag = catchAsync(async (req: Request, res: Response) => {
  const metaTag = await MetaTag.create(req.body);

  res.status(201).json({
    success: true,
    data: metaTag
  });
});

/**
 * Update meta tag (Admin)
 * @route PATCH /api/v1/seo/meta-tags/:id
 * @access Private/Admin
 */
export const updateMetaTag = catchAsync(async (req: Request, res: Response) => {
  const metaTag = await MetaTag.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!metaTag) {
    throw new AppError('Meta tag not found', 404);
  }

  res.status(200).json({
    success: true,
    data: metaTag
  });
});

/**
 * Delete meta tag (Admin)
 * @route DELETE /api/v1/seo/meta-tags/:id
 * @access Private/Admin
 */
export const deleteMetaTag = catchAsync(async (req: Request, res: Response) => {
  const metaTag = await MetaTag.findByIdAndDelete(req.params.id);

  if (!metaTag) {
    throw new AppError('Meta tag not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Meta tag deleted successfully'
  });
});

/**
 * Bulk create meta tags (Admin)
 * @route POST /api/v1/seo/meta-tags/bulk-create
 * @access Private/Admin
 */
export const bulkCreateMetaTags = catchAsync(async (req: Request, res: Response) => {
  const { metaTags } = req.body;

  if (!Array.isArray(metaTags) || metaTags.length === 0) {
    throw new AppError('Please provide an array of meta tags', 400);
  }

  const created = await MetaTag.insertMany(metaTags);

  res.status(201).json({
    success: true,
    count: created.length,
    data: created
  });
});

// ============================================================================
// REDIRECT RULE ENDPOINTS
// ============================================================================

/**
 * Get all redirect rules (Admin)
 * @route GET /api/v1/seo/redirect-rules
 * @access Private/Admin
 */
export const getRedirectRules = catchAsync(async (req: Request, res: Response) => {
  const {
    statusCode,
    isActive,
    matchType,
    page = 1,
    limit = 20
  } = req.query;

  const query: any = {};
  if (statusCode) query.statusCode = parseInt(statusCode as string);
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (matchType) query.matchType = matchType;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [rules, total] = await Promise.all([
    RedirectRule.find(query)
      .sort({ hitCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    RedirectRule.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: rules.length,
    total,
    totalPages: Math.ceil(total / limitNum),
    currentPage: pageNum,
    data: rules
  });
});

/**
 * Get redirect rule by ID (Admin)
 * @route GET /api/v1/seo/redirect-rules/:id
 * @access Private/Admin
 */
export const getRedirectRule = catchAsync(async (req: Request, res: Response) => {
  const rule = await RedirectRule.findById(req.params.id).lean();

  if (!rule) {
    throw new AppError('Redirect rule not found', 404);
  }

  res.status(200).json({
    success: true,
    data: rule
  });
});

/**
 * Create redirect rule (Admin)
 * @route POST /api/v1/seo/redirect-rules
 * @access Private/Admin
 */
export const createRedirectRule = catchAsync(async (req: Request, res: Response) => {
  // Check for duplicate source URL
  const existing = await RedirectRule.findOne({ sourceUrl: req.body.sourceUrl });
  if (existing) {
    throw new AppError('Redirect rule already exists for this source URL', 400);
  }

  const rule = await RedirectRule.create(req.body);

  res.status(201).json({
    success: true,
    data: rule
  });
});

/**
 * Update redirect rule (Admin)
 * @route PATCH /api/v1/seo/redirect-rules/:id
 * @access Private/Admin
 */
export const updateRedirectRule = catchAsync(async (req: Request, res: Response) => {
  const rule = await RedirectRule.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!rule) {
    throw new AppError('Redirect rule not found', 404);
  }

  res.status(200).json({
    success: true,
    data: rule
  });
});

/**
 * Delete redirect rule (Admin)
 * @route DELETE /api/v1/seo/redirect-rules/:id
 * @access Private/Admin
 */
export const deleteRedirectRule = catchAsync(async (req: Request, res: Response) => {
  const rule = await RedirectRule.findByIdAndDelete(req.params.id);

  if (!rule) {
    throw new AppError('Redirect rule not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Redirect rule deleted successfully'
  });
});

/**
 * Test redirect rule (Admin)
 * @route POST /api/v1/seo/redirect-rules/:id/test
 * @access Private/Admin
 */
export const testRedirectRule = catchAsync(async (req: Request, res: Response) => {
  const { url } = req.body;
  const rule = await RedirectRule.findById(req.params.id);

  if (!rule) {
    throw new AppError('Redirect rule not found', 404);
  }

  let matches = false;
  let redirectUrl = rule.targetUrl;

  if (rule.isRegex) {
    // Regex matching
    try {
      const regex = new RegExp(rule.sourceUrl);
      matches = regex.test(url);
      if (matches) {
        redirectUrl = url.replace(regex, rule.targetUrl);
      }
    } catch (error) {
      throw new AppError('Invalid regex pattern', 400);
    }
  } else {
    // Exact matching
    matches = url === rule.sourceUrl;
    if (matches && rule.preserveQuery) {
      const urlParts = url.split('?');
      if (urlParts.length > 1) {
        redirectUrl = `${rule.targetUrl}?${urlParts[1]}`;
      }
    }
  }

  res.status(200).json({
    success: true,
    data: {
      url,
      matches,
      redirectUrl: matches ? redirectUrl : null,
      statusCode: matches ? rule.statusCode : null
    }
  });
});

/**
 * Bulk create redirect rules (Admin)
 * @route POST /api/v1/seo/redirect-rules/bulk-create
 * @access Private/Admin
 */
export const bulkCreateRedirectRules = catchAsync(async (req: Request, res: Response) => {
  const { rules } = req.body;

  if (!Array.isArray(rules) || rules.length === 0) {
    throw new AppError('Please provide an array of redirect rules', 400);
  }

  const created = await RedirectRule.insertMany(rules, { ordered: false });

  res.status(201).json({
    success: true,
    count: created.length,
    data: created
  });
});

/**
 * Import redirect rules from CSV (Admin)
 * @route POST /api/v1/seo/redirect-rules/import
 * @access Private/Admin
 */
export const importRedirectRules = catchAsync(async (req: Request, res: Response) => {
  const { rules } = req.body; // Pre-parsed CSV data

  if (!Array.isArray(rules) || rules.length === 0) {
    throw new AppError('No valid rules found in import data', 400);
  }

  const created = await RedirectRule.insertMany(rules, { ordered: false });

  res.status(201).json({
    success: true,
    message: 'Redirect rules imported successfully',
    count: created.length,
    data: created
  });
});

// ============================================================================
// SEO AUDIT ENDPOINTS
// ============================================================================

/**
 * Get all audits (Admin)
 * @route GET /api/v1/seo/audits
 * @access Private/Admin
 */
export const getAudits = catchAsync(async (req: Request, res: Response) => {
  const {
    url,
    minScore,
    maxScore,
    page = 1,
    limit = 20
  } = req.query;

  const query: any = {};
  if (url) query.url = { $regex: url, $options: 'i' };
  if (minScore) query.score = { $gte: parseInt(minScore as string) };
  if (maxScore) query.score = { ...query.score, $lte: parseInt(maxScore as string) };

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [audits, total] = await Promise.all([
    SEOAudit.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    SEOAudit.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: audits.length,
    total,
    totalPages: Math.ceil(total / limitNum),
    currentPage: pageNum,
    data: audits
  });
});

/**
 * Get audit by ID (Admin)
 * @route GET /api/v1/seo/audits/:id
 * @access Private/Admin
 */
export const getAudit = catchAsync(async (req: Request, res: Response) => {
  const audit = await SEOAudit.findById(req.params.id).lean();

  if (!audit) {
    throw new AppError('Audit not found', 404);
  }

  res.status(200).json({
    success: true,
    data: audit
  });
});

/**
 * Audit a page (Admin)
 * @route POST /api/v1/seo/audits
 * @access Private/Admin
 */
export const auditPage = catchAsync(async (req: Request, res: Response) => {
  const { url } = req.body;

  if (!url) {
    throw new AppError('Please provide a URL to audit', 400);
  }

  // Mock audit data (in production, use Lighthouse or similar)
  const audit = await SEOAudit.create({
    url,
    score: 85,
    items: [
      {
        type: 'success',
        category: 'meta',
        title: 'Meta description present',
        description: 'Page has a meta description',
        impact: 'low',
        recommendation: 'Keep meta description under 160 characters'
      }
    ],
    performance: {
      firstContentfulPaint: 1.5,
      largestContentfulPaint: 2.5,
      firstInputDelay: 100,
      cumulativeLayoutShift: 0.1,
      totalBlockingTime: 150
    },
    accessibility: { score: 90, issues: 2 },
    bestPractices: { score: 85, issues: 3 },
    seo: { score: 88, issues: 1 },
    metadata: {
      title: 'Page Title',
      description: 'Page description'
    },
    technicalSEO: {
      hasH1: true,
      hasMetaDescription: true,
      hasCanonical: true,
      hasRobots: true,
      hasOpenGraph: true,
      hasTwitterCards: true,
      hasStructuredData: false,
      mobileOptimized: true,
      httpsEnabled: true,
      responseTime: 200,
      pageSize: 1024,
      requestCount: 25
    }
  });

  res.status(201).json({
    success: true,
    data: audit
  });
});

/**
 * Bulk audit pages (Admin)
 * @route POST /api/v1/seo/audits/bulk
 * @access Private/Admin
 */
export const bulkAuditPages = catchAsync(async (req: Request, res: Response) => {
  const { urls } = req.body;

  if (!Array.isArray(urls) || urls.length === 0) {
    throw new AppError('Please provide an array of URLs', 400);
  }

  // Mock audits (in production, queue them for processing)
  const audits = await Promise.all(
    urls.map((url: string) =>
      SEOAudit.create({
        url,
        score: Math.floor(Math.random() * 30) + 70, // 70-100
        items: [],
        performance: {
          firstContentfulPaint: 1.5,
          largestContentfulPaint: 2.5,
          firstInputDelay: 100,
          cumulativeLayoutShift: 0.1,
          totalBlockingTime: 150
        },
        accessibility: { score: 85, issues: 2 },
        bestPractices: { score: 80, issues: 3 },
        seo: { score: 85, issues: 1 },
        metadata: {},
        technicalSEO: {
          hasH1: true,
          hasMetaDescription: true,
          hasCanonical: true,
          hasRobots: true,
          hasOpenGraph: false,
          hasTwitterCards: false,
          hasStructuredData: false,
          mobileOptimized: true,
          httpsEnabled: true,
          responseTime: 200,
          pageSize: 1024,
          requestCount: 25
        }
      })
    )
  );

  res.status(201).json({
    success: true,
    count: audits.length,
    data: audits
  });
});

/**
 * Delete audit (Admin)
 * @route DELETE /api/v1/seo/audits/:id
 * @access Private/Admin
 */
export const deleteAudit = catchAsync(async (req: Request, res: Response) => {
  const audit = await SEOAudit.findByIdAndDelete(req.params.id);

  if (!audit) {
    throw new AppError('Audit not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Audit deleted successfully'
  });
});

/**
 * Export audit report (Admin)
 * @route GET /api/v1/seo/audits/:id/export
 * @access Private/Admin
 */
export const exportAudit = catchAsync(async (req: Request, res: Response) => {
  const { format = 'json' } = req.query;
  const audit = await SEOAudit.findById(req.params.id).lean();

  if (!audit) {
    throw new AppError('Audit not found', 404);
  }

  if (format === 'csv') {
    // Simple CSV export
    const csv = 'URL,Score,Performance,Accessibility,Best Practices,SEO\n' +
      `${audit.url},${audit.score},${audit.performance.firstContentfulPaint},${audit.accessibility.score},${audit.bestPractices.score},${audit.seo.score}`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=audit-report.csv');
    res.status(200).send(csv);
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=audit-report.json');
    res.status(200).json({
      success: true,
      data: audit
    });
  }
});

// ============================================================================
// SEO ANALYTICS ENDPOINTS
// ============================================================================

/**
 * Get SEO analytics overview (Admin)
 * @route GET /api/v1/seo/analytics
 * @access Private/Admin
 */
export const getSEOAnalytics = catchAsync(async (req: Request, res: Response) => {
  const [
    totalPages,
    indexedPages,
    totalSitemaps,
    totalRedirects,
    totalSchemas,
    avgAuditScore
  ] = await Promise.all([
    PageSEO.countDocuments(),
    PageSEO.countDocuments({ isIndexed: true, isActive: true }),
    Sitemap.countDocuments({ isActive: true }),
    RedirectRule.countDocuments({ isActive: true }),
    SchemaMarkup.countDocuments({ isActive: true }),
    SEOAudit.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$score' } } }
    ])
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalPages,
      indexedPages,
      notIndexedPages: totalPages - indexedPages,
      totalSitemaps,
      totalRedirects,
      totalSchemas,
      averageAuditScore: avgAuditScore[0]?.avgScore || 0
    }
  });
});
