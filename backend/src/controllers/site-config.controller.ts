import { Request, Response, NextFunction } from 'express';
import SiteConfig from '../models/site-config.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

/**
 * Get site configuration
 * @route GET /api/v1/site-config
 * @access Public
 */
export const getSiteConfig = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const config = await SiteConfig.findOne({ isActive: true });

  if (!config) {
    return next(new AppError('Site configuration not found', 404));
  }

  // Remove sensitive data for public access
  const publicConfig: any = config.toObject();
  if (!req.user || req.user.role !== 'admin') {
    delete publicConfig.apiKeys;
    delete publicConfig.email;
  }

  res.status(200).json({
    success: true,
    data: publicConfig
  });
});

/**
 * Get public site configuration (limited fields)
 * @route GET /api/v1/site-config/public
 * @access Public
 */
export const getPublicSiteConfig = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const config = await SiteConfig.findOne({ isActive: true }).select(
    'siteName tagline description logo favicon contact socialMedia businessHours seo.metaTitle seo.metaDescription seo.metaKeywords seo.ogImage features payment.currency payment.currencySymbol payment.freeShippingThreshold legal theme footer'
  );

  if (!config) {
    return next(new AppError('Site configuration not found', 404));
  }

  res.status(200).json({
    success: true,
    data: config
  });
});

/**
 * Create site configuration
 * @route POST /api/v1/site-config
 * @access Private (Admin)
 */
export const createSiteConfig = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Check if config already exists
  const existingConfig = await SiteConfig.findOne({ isActive: true });
  if (existingConfig) {
    return next(new AppError('Site configuration already exists. Use update instead.', 400));
  }

  const config = await SiteConfig.create({
    ...req.body,
    updatedBy: req.user?._id
  });

  res.status(201).json({
    success: true,
    data: config
  });
});

/**
 * Update site configuration
 * @route PATCH /api/v1/site-config
 * @access Private (Admin)
 */
export const updateSiteConfig = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const config = await SiteConfig.findOne({ isActive: true });

  if (!config) {
    return next(new AppError('Site configuration not found', 404));
  }

  // Update fields
  Object.assign(config, req.body);
  config.updatedBy = req.user?._id as any;
  await config.save();

  res.status(200).json({
    success: true,
    data: config
  });
});

/**
 * Update specific section of site configuration
 * @route PATCH /api/v1/site-config/:section
 * @access Private (Admin)
 */
export const updateSiteConfigSection = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { section } = req.params;
  const validSections = ['contact', 'socialMedia', 'businessHours', 'seo', 'features', 'payment', 'email', 'maintenance', 'legal', 'scripts', 'apiKeys', 'theme', 'footer', 'notifications'];

  if (!validSections.includes(section)) {
    return next(new AppError(`Invalid section: ${section}`, 400));
  }

  const config = await SiteConfig.findOne({ isActive: true });

  if (!config) {
    return next(new AppError('Site configuration not found', 404));
  }

  // Update specific section
  (config as any)[section] = { ...(config as any)[section], ...req.body };
  config.updatedBy = req.user?._id as any;
  await config.save();

  res.status(200).json({
    success: true,
    data: config
  });
});

/**
 * Get social media links
 * @route GET /api/v1/site-config/social
 * @access Public
 */
export const getSocialMedia = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const config = await SiteConfig.findOne({ isActive: true }).select('socialMedia');

  if (!config) {
    return next(new AppError('Site configuration not found', 404));
  }

  res.status(200).json({
    success: true,
    data: config.socialMedia
  });
});

/**
 * Update social media links
 * @route PATCH /api/v1/site-config/social
 * @access Private (Admin)
 */
export const updateSocialMedia = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const config = await SiteConfig.findOne({ isActive: true });

  if (!config) {
    return next(new AppError('Site configuration not found', 404));
  }

  config.socialMedia = { ...config.socialMedia, ...req.body };
  config.updatedBy = req.user?._id as any;
  await config.save();

  res.status(200).json({
    success: true,
    data: config.socialMedia
  });
});

/**
 * Get maintenance mode status
 * @route GET /api/v1/site-config/maintenance
 * @access Public
 */
export const getMaintenanceStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const config = await SiteConfig.findOne({ isActive: true }).select('maintenance');

  if (!config) {
    return next(new AppError('Site configuration not found', 404));
  }

  res.status(200).json({
    success: true,
    data: config.maintenance
  });
});

/**
 * Toggle maintenance mode
 * @route PATCH /api/v1/site-config/maintenance/toggle
 * @access Private (Admin)
 */
export const toggleMaintenanceMode = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const config = await SiteConfig.findOne({ isActive: true });

  if (!config) {
    return next(new AppError('Site configuration not found', 404));
  }

  config.maintenance.enabled = !config.maintenance.enabled;
  config.updatedBy = req.user?._id as any;
  await config.save();

  res.status(200).json({
    success: true,
    data: {
      maintenanceEnabled: config.maintenance.enabled,
      message: config.maintenance.message
    }
  });
});

/**
 * Get SEO settings
 * @route GET /api/v1/site-config/seo
 * @access Public
 */
export const getSEOSettings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const config = await SiteConfig.findOne({ isActive: true }).select('seo');

  if (!config) {
    return next(new AppError('Site configuration not found', 404));
  }

  res.status(200).json({
    success: true,
    data: config.seo
  });
});

/**
 * Update SEO settings
 * @route PATCH /api/v1/site-config/seo
 * @access Private (Admin)
 */
export const updateSEOSettings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const config = await SiteConfig.findOne({ isActive: true });

  if (!config) {
    return next(new AppError('Site configuration not found', 404));
  }

  config.seo = { ...config.seo, ...req.body };
  config.updatedBy = req.user?._id as any;
  await config.save();

  res.status(200).json({
    success: true,
    data: config.seo
  });
});

/**
 * Get payment settings
 * @route GET /api/v1/site-config/payment
 * @access Public
 */
export const getPaymentSettings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const config = await SiteConfig.findOne({ isActive: true }).select('payment');

  if (!config) {
    return next(new AppError('Site configuration not found', 404));
  }

  res.status(200).json({
    success: true,
    data: config.payment
  });
});

/**
 * Update payment settings
 * @route PATCH /api/v1/site-config/payment
 * @access Private (Admin)
 */
export const updatePaymentSettings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const config = await SiteConfig.findOne({ isActive: true });

  if (!config) {
    return next(new AppError('Site configuration not found', 404));
  }

  config.payment = { ...config.payment, ...req.body };
  config.updatedBy = req.user?._id as any;
  await config.save();

  res.status(200).json({
    success: true,
    data: config.payment
  });
});

/**
 * Get theme settings
 * @route GET /api/v1/site-config/theme
 * @access Public
 */
export const getThemeSettings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const config = await SiteConfig.findOne({ isActive: true }).select('theme');

  if (!config) {
    return next(new AppError('Site configuration not found', 404));
  }

  res.status(200).json({
    success: true,
    data: config.theme
  });
});

/**
 * Update theme settings
 * @route PATCH /api/v1/site-config/theme
 * @access Private (Admin)
 */
export const updateThemeSettings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const config = await SiteConfig.findOne({ isActive: true });

  if (!config) {
    return next(new AppError('Site configuration not found', 404));
  }

  config.theme = { ...config.theme, ...req.body };
  config.updatedBy = req.user?._id as any;
  await config.save();

  res.status(200).json({
    success: true,
    data: config.theme
  });
});

/**
 * Delete site configuration
 * @route DELETE /api/v1/site-config
 * @access Private (Admin)
 */
export const deleteSiteConfig = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const config = await SiteConfig.findOne({ isActive: true });

  if (!config) {
    return next(new AppError('Site configuration not found', 404));
  }

  await config.deleteOne();

  res.status(204).json({
    success: true,
    data: null
  });
});
