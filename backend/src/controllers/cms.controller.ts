import { Request, Response, NextFunction } from 'express';
import CMSPage from '../models/cms-page.model.js';
import CMSTemplate from '../models/cms-template.model.js';
import CMSMenu from '../models/cms-menu.model.js';
import CMSWidget from '../models/cms-widget.model.js';
import CMSSettings from '../models/cms-settings.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// ==================== CMS PAGES ====================

export const getPages = catchAsync(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    sort = '-createdAt',
    status,
    type,
    author,
    category,
    tag,
    search
  } = req.query;

  const filter: any = {};

  if (status) filter.status = status;
  if (type) filter.type = type;
  if (author) filter.author = author;
  if (category) filter.categories = category;
  if (tag) filter.tags = tag;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
      { excerpt: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await CMSPage.countDocuments(filter);

  const pages = await CMSPage.find(filter)
    .sort(sort as string)
    .skip(skip)
    .limit(Number(limit))
    .populate('author', 'firstName lastName email')
    .populate('editor', 'firstName lastName email');

  res.status(200).json({
    status: 'success',
    results: pages.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: { pages }
  });
});

export const getPageById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = await CMSPage.findById(req.params.id)
    .populate('author', 'firstName lastName email')
    .populate('editor', 'firstName lastName email')
    .populate('accessControl.users', 'firstName lastName email');

  if (!page) {
    return next(new AppError('Page not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { page }
  });
});

export const getPageBySlug = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { slug } = req.params;
  
  const page = await CMSPage.findOne({ slug })
    .populate('author', 'firstName lastName email');

  if (!page) {
    return next(new AppError('Page not found', 404));
  }

  // Check access control
  if (page.visibility === 'private') {
    if (!req.user || !page.accessControl.users?.includes(req.user._id as any)) {
      return next(new AppError('You do not have access to this page', 403));
    }
  }

  if (page.visibility === 'password') {
    const { password } = req.query;
    if (!password || password !== page.password) {
      return next(new AppError('Invalid password', 403));
    }
  }

  // Increment view count
  page.analytics.views += 1;
  page.analytics.lastViewedAt = new Date();
  await page.save();

  res.status(200).json({
    status: 'success',
    data: { page }
  });
});

export const createPage = catchAsync(async (req: Request, res: Response) => {
  const pageData = {
    ...req.body,
    author: req.user?._id
  };

  const page = await CMSPage.create(pageData);

  res.status(201).json({
    status: 'success',
    data: { page }
  });
});

export const updatePage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = await CMSPage.findById(req.params.id);

  if (!page) {
    return next(new AppError('Page not found', 404));
  }

  // Create version history entry
  if (page.version) {
    page.versionHistory?.push({
      version: page.version,
      createdAt: new Date(),
      createdBy: req.user?._id as any,
      changes: 'Updated via API'
    });
  }

  // Increment version
  page.version += 1;
  page.editor = req.user?._id as any;
  page.lastEditedAt = new Date();

  // Update fields
  Object.assign(page, req.body);

  await page.save();

  res.status(200).json({
    status: 'success',
    data: { page }
  });
});

export const deletePage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = await CMSPage.findByIdAndDelete(req.params.id);

  if (!page) {
    return next(new AppError('Page not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

export const publishPage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = await CMSPage.findById(req.params.id);

  if (!page) {
    return next(new AppError('Page not found', 404));
  }

  page.status = 'published';
  page.publishedAt = new Date();
  await page.save();

  res.status(200).json({
    status: 'success',
    data: { page }
  });
});

export const unpublishPage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = await CMSPage.findById(req.params.id);

  if (!page) {
    return next(new AppError('Page not found', 404));
  }

  page.status = 'draft';
  await page.save();

  res.status(200).json({
    status: 'success',
    data: { page }
  });
});

export const duplicatePage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const originalPage = await CMSPage.findById(req.params.id);

  if (!originalPage) {
    return next(new AppError('Page not found', 404));
  }

  const pageData: any = originalPage.toObject();
  delete pageData._id;
  delete pageData.createdAt;
  delete pageData.updatedAt;

  pageData.title = `${pageData.title} (Copy)`;
  pageData.slug = `${pageData.slug}-copy`;
  pageData.status = 'draft';
  pageData.author = req.user?._id as any;
  pageData.publishedAt = undefined;

  const newPage = await CMSPage.create(pageData);

  res.status(201).json({
    status: 'success',
    data: { page: newPage }
  });
});

export const getPageVersions = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = await CMSPage.findById(req.params.id);

  if (!page) {
    return next(new AppError('Page not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { 
      currentVersion: page.version,
      history: page.versionHistory 
    }
  });
});

export const restorePageVersion = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id, versionId } = req.params;

  const currentPage = await CMSPage.findById(id);
  if (!currentPage) {
    return next(new AppError('Page not found', 404));
  }

  const versionPage = await CMSPage.findById(versionId);
  if (!versionPage) {
    return next(new AppError('Version not found', 404));
  }

  // Save current version to history
  currentPage.versionHistory?.push({
    version: currentPage.version,
    createdAt: new Date(),
    createdBy: req.user?._id as any,
    changes: 'Restored from version ' + versionPage.version
  });

  // Restore from version
  Object.assign(currentPage, versionPage.toObject());
  currentPage._id = id as any;
  currentPage.version += 1;
  currentPage.editor = req.user?._id as any;
  currentPage.lastEditedAt = new Date();

  await currentPage.save();

  res.status(200).json({
    status: 'success',
    data: { page: currentPage }
  });
});

export const bulkUpdatePages = catchAsync(async (req: Request, res: Response) => {
  const { ids, updates } = req.body;

  const result = await CMSPage.updateMany(
    { _id: { $in: ids } },
    { $set: updates }
  );

  res.status(200).json({
    status: 'success',
    data: { 
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    }
  });
});

export const bulkDeletePages = catchAsync(async (req: Request, res: Response) => {
  const { ids } = req.body;

  const result = await CMSPage.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    status: 'success',
    data: { deletedCount: result.deletedCount }
  });
});

// ==================== CMS TEMPLATES ====================

export const getTemplates = catchAsync(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    sort = '-usageCount',
    status,
    type,
    category,
    search
  } = req.query;

  const filter: any = {};

  if (status) filter.status = status;
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await CMSTemplate.countDocuments(filter);

  const templates = await CMSTemplate.find(filter)
    .sort(sort as string)
    .skip(skip)
    .limit(Number(limit))
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  res.status(200).json({
    status: 'success',
    results: templates.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: { templates }
  });
});

export const getTemplateById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const template = await CMSTemplate.findById(req.params.id)
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  if (!template) {
    return next(new AppError('Template not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { template }
  });
});

export const createTemplate = catchAsync(async (req: Request, res: Response) => {
  const templateData = {
    ...req.body,
    createdBy: req.user?._id
  };

  const template = await CMSTemplate.create(templateData);

  res.status(201).json({
    status: 'success',
    data: { template }
  });
});

export const updateTemplate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const template = await CMSTemplate.findById(req.params.id);

  if (!template) {
    return next(new AppError('Template not found', 404));
  }

  template.updatedBy = req.user?._id as any;
  Object.assign(template, req.body);

  await template.save();

  res.status(200).json({
    status: 'success',
    data: { template }
  });
});

export const deleteTemplate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const template = await CMSTemplate.findByIdAndDelete(req.params.id);

  if (!template) {
    return next(new AppError('Template not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

export const duplicateTemplate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const originalTemplate = await CMSTemplate.findById(req.params.id);

  if (!originalTemplate) {
    return next(new AppError('Template not found', 404));
  }

  const templateData: any = originalTemplate.toObject();
  delete templateData._id;
  delete templateData.createdAt;
  delete templateData.updatedAt;

  templateData.name = `${templateData.name} (Copy)`;
  templateData.slug = `${templateData.slug}-copy`;
  templateData.createdBy = req.user?._id as any;
  templateData.usageCount = 0;

  const newTemplate = await CMSTemplate.create(templateData);

  res.status(201).json({
    status: 'success',
    data: { template: newTemplate }
  });
});

export const incrementTemplateUsage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const template = await CMSTemplate.findById(req.params.id);

  if (!template) {
    return next(new AppError('Template not found', 404));
  }

  template.usageCount += 1;
  template.lastUsedAt = new Date();
  await template.save();

  res.status(200).json({
    status: 'success',
    data: { template }
  });
});

// ==================== CMS MENUS ====================

export const getMenus = catchAsync(async (req: Request, res: Response) => {
  const { location, status } = req.query;

  const filter: any = {};
  if (location) filter.location = location;
  if (status) filter.status = status;

  const menus = await CMSMenu.find(filter)
    .sort('-createdAt')
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  res.status(200).json({
    status: 'success',
    results: menus.length,
    data: { menus }
  });
});

export const getMenuById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const menu = await CMSMenu.findById(req.params.id)
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  if (!menu) {
    return next(new AppError('Menu not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { menu }
  });
});

export const getMenuByLocation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { location } = req.params;

  const menu = await CMSMenu.findOne({ location, status: 'active' });

  if (!menu) {
    return next(new AppError('Menu not found for this location', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { menu }
  });
});

export const createMenu = catchAsync(async (req: Request, res: Response) => {
  const menuData = {
    ...req.body,
    createdBy: req.user?._id
  };

  const menu = await CMSMenu.create(menuData);

  res.status(201).json({
    status: 'success',
    data: { menu }
  });
});

export const updateMenu = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const menu = await CMSMenu.findById(req.params.id);

  if (!menu) {
    return next(new AppError('Menu not found', 404));
  }

  menu.updatedBy = req.user?._id as any;
  Object.assign(menu, req.body);

  await menu.save();

  res.status(200).json({
    status: 'success',
    data: { menu }
  });
});

export const deleteMenu = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const menu = await CMSMenu.findByIdAndDelete(req.params.id);

  if (!menu) {
    return next(new AppError('Menu not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// ==================== CMS WIDGETS ====================

export const getWidgets = catchAsync(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    sort = '-createdAt',
    status,
    type,
    position,
    isGlobal
  } = req.query;

  const filter: any = {};

  if (status) filter.status = status;
  if (type) filter.type = type;
  if (position) filter['settings.position'] = position;
  if (isGlobal !== undefined) filter.isGlobal = isGlobal === 'true';

  const skip = (Number(page) - 1) * Number(limit);
  const total = await CMSWidget.countDocuments(filter);

  const widgets = await CMSWidget.find(filter)
    .sort(sort as string)
    .skip(skip)
    .limit(Number(limit))
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  res.status(200).json({
    status: 'success',
    results: widgets.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: { widgets }
  });
});

export const getWidgetById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const widget = await CMSWidget.findById(req.params.id)
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  if (!widget) {
    return next(new AppError('Widget not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { widget }
  });
});

export const getWidgetsForPage = catchAsync(async (req: Request, res: Response) => {
  const { pageSlug } = req.params;

  const widgets = await CMSWidget.find({
    status: 'active',
    $or: [
      { isGlobal: true },
      { 'displayRules.pages': pageSlug }
    ]
  }).sort('settings.priority');

  res.status(200).json({
    status: 'success',
    results: widgets.length,
    data: { widgets }
  });
});

export const createWidget = catchAsync(async (req: Request, res: Response) => {
  const widgetData = {
    ...req.body,
    createdBy: req.user?._id
  };

  const widget = await CMSWidget.create(widgetData);

  res.status(201).json({
    status: 'success',
    data: { widget }
  });
});

export const updateWidget = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const widget = await CMSWidget.findById(req.params.id);

  if (!widget) {
    return next(new AppError('Widget not found', 404));
  }

  widget.updatedBy = req.user?._id as any;
  Object.assign(widget, req.body);

  await widget.save();

  res.status(200).json({
    status: 'success',
    data: { widget }
  });
});

export const deleteWidget = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const widget = await CMSWidget.findByIdAndDelete(req.params.id);

  if (!widget) {
    return next(new AppError('Widget not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

export const trackWidgetImpression = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const widget = await CMSWidget.findById(req.params.id);

  if (!widget) {
    return next(new AppError('Widget not found', 404));
  }

  widget.analytics.impressions += 1;
  await widget.save();

  res.status(200).json({
    status: 'success',
    data: { widget }
  });
});

export const trackWidgetClick = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const widget = await CMSWidget.findById(req.params.id);

  if (!widget) {
    return next(new AppError('Widget not found', 404));
  }

  widget.analytics.clicks += 1;
  
  // Calculate CTR
  if (widget.analytics.impressions > 0) {
    widget.analytics.ctr = (widget.analytics.clicks / widget.analytics.impressions) * 100;
  }

  await widget.save();

  res.status(200).json({
    status: 'success',
    data: { widget }
  });
});

// ==================== CMS SETTINGS ====================

export const getSettings = catchAsync(async (req: Request, res: Response) => {
  const settings = await CMSSettings.findOne();

  res.status(200).json({
    status: 'success',
    data: { settings }
  });
});

export const updateSettings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  let settings = await CMSSettings.findOne();

  if (!settings) {
    settings = await CMSSettings.create({
      ...req.body,
      updatedBy: req.user?._id
    });
  } else {
    settings.updatedBy = req.user?._id as any;
    Object.assign(settings, req.body);
    await settings.save();
  }

  res.status(200).json({
    status: 'success',
    data: { settings }
  });
});

// ==================== ANALYTICS ====================

export const getCMSAnalytics = catchAsync(async (req: Request, res: Response) => {
  const [
    totalPages,
    publishedPages,
    draftPages,
    totalTemplates,
    activeTemplates,
    totalMenus,
    totalWidgets,
    activeWidgets,
    topPages
  ] = await Promise.all([
    CMSPage.countDocuments(),
    CMSPage.countDocuments({ status: 'published' }),
    CMSPage.countDocuments({ status: 'draft' }),
    CMSTemplate.countDocuments(),
    CMSTemplate.countDocuments({ status: 'active' }),
    CMSMenu.countDocuments(),
    CMSWidget.countDocuments(),
    CMSWidget.countDocuments({ status: 'active' }),
    CMSPage.find({ status: 'published' })
      .sort('-analytics.views')
      .limit(10)
      .select('title slug analytics.views analytics.uniqueViews')
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      pages: {
        total: totalPages,
        published: publishedPages,
        draft: draftPages
      },
      templates: {
        total: totalTemplates,
        active: activeTemplates
      },
      menus: {
        total: totalMenus
      },
      widgets: {
        total: totalWidgets,
        active: activeWidgets
      },
      topPages
    }
  });
});

// ==================== SEO ====================

export const generateSitemap = catchAsync(async (req: Request, res: Response) => {
  const pages = await CMSPage.find({ 
    status: 'published',
    visibility: 'public'
  }).select('slug updatedAt');

  const sitemap = {
    pages: pages.map(page => ({
      url: `/${page.slug}`,
      lastModified: page.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8
    }))
  };

  res.status(200).json({
    status: 'success',
    data: { sitemap }
  });
});

export const generateRobotsTxt = catchAsync(async (req: Request, res: Response) => {
  const settings = await CMSSettings.findOne();

  const robotsTxt = `
User-agent: *
Allow: /

Sitemap: ${req.protocol}://${req.get('host')}/sitemap.xml
`.trim();

  res.status(200).json({
    status: 'success',
    data: { robotsTxt }
  });
});

export const getPageSEOPreview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = await CMSPage.findById(req.params.id);

  if (!page) {
    return next(new AppError('Page not found', 404));
  }

  const preview = {
    title: page.seo.metaTitle || page.title,
    description: page.seo.metaDescription || page.excerpt,
    url: `${req.protocol}://${req.get('host')}/${page.slug}`,
    image: page.seo.ogImage || page.featuredImage,
    canonicalUrl: page.seo.canonicalUrl
  };

  res.status(200).json({
    status: 'success',
    data: { preview }
  });
});

// ==================== MEDIA MANAGEMENT ====================

export const uploadMedia = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(new AppError('Please upload a file', 400));
  }

  // File upload handled by multer/cloudinary middleware
  const mediaUrl = (req.file as any).path;

  res.status(200).json({
    status: 'success',
    data: { 
      url: mediaUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    }
  });
});

export const deleteMedia = catchAsync(async (req: Request, res: Response) => {
  const { publicId } = req.params;

  // Delete from cloudinary or storage
  // Implementation depends on storage solution

  res.status(204).json({
    status: 'success',
    data: null
  });
});

export const getMediaLibrary = catchAsync(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 20,
    type,
    search
  } = req.query;

  // Implementation depends on storage solution
  // This is a placeholder

  res.status(200).json({
    status: 'success',
    data: { 
      media: [],
      total: 0,
      page: Number(page),
      pages: 0
    }
  });
});

export const optimizeImage = catchAsync(async (req: Request, res: Response) => {
  const { url, width, height, quality } = req.body;

  // Image optimization logic
  // Implementation depends on image processing solution

  res.status(200).json({
    status: 'success',
    data: { 
      optimizedUrl: url // Placeholder
    }
  });
});
