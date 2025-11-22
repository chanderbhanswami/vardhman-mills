import { Request, Response, NextFunction } from 'express';
import Logo from '../models/Logo.model.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

// ==================== CRUD OPERATIONS ====================

/**
 * Get all logos (Admin)
 * @route GET /api/v1/logos
 * @access Private/Admin
 */
export const getAllLogos = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    // Filters
    if (req.query.type) {
      query.type = req.query.type;
    }

    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }

    if (req.query.isPrimary !== undefined) {
      query.isPrimary = req.query.isPrimary === 'true';
    }

    // Tag filter
    if (req.query.tags) {
      const tags = (req.query.tags as string).split(',').map(t => t.trim().toLowerCase());
      query.tags = { $in: tags };
    }

    // Search
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { altText: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const [logos, total] = await Promise.all([
      Logo.find(query)
        .populate('uploadedBy', 'name email')
        .sort({ isPrimary: -1, isActive: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Logo.countDocuments(query)
    ]);

    res.status(200).json({
      status: 'success',
      results: logos.length,
      data: {
        logos,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  }
);

/**
 * Get single logo
 * @route GET /api/v1/logos/:id
 * @access Public
 */
export const getLogo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const logo = await Logo.findById(req.params.id)
      .populate('uploadedBy', 'name email')
      .populate('previousVersions');

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { logo }
    });
  }
);

/**
 * Create logo
 * @route POST /api/v1/logos
 * @access Private/Admin
 */
export const createLogo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    // Add uploader
    req.body.uploadedBy = req.user._id;

    // Validate file information
    if (!req.body.originalFile || !req.body.originalFile.url) {
      return next(new AppError('Original file information is required', 400));
    }

    const logo = await Logo.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { logo }
    });
  }
);

/**
 * Update logo
 * @route PUT /api/v1/logos/:id
 * @access Private/Admin
 */
export const updateLogo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Prevent updating certain fields
    delete req.body.uploadedBy;
    delete req.body.version;
    delete req.body.previousVersions;

    const logo = await Logo.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { logo }
    });
  }
);

/**
 * Delete logo
 * @route DELETE /api/v1/logos/:id
 * @access Private/Admin
 */
export const deleteLogo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const logo = await Logo.findById(req.params.id);

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    // Check if it's a primary logo
    if (logo.isPrimary) {
      return next(new AppError('Cannot delete primary logo. Set another logo as primary first.', 400));
    }

    await logo.deleteOne();

    res.status(204).json({
      status: 'success',
      data: null
    });
  }
);

// ==================== STATUS MANAGEMENT ====================

/**
 * Activate logo
 * @route POST /api/v1/logos/:id/activate
 * @access Private/Admin
 */
export const activateLogo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const logo = await Logo.findById(req.params.id);

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    await logo.activate();

    res.status(200).json({
      status: 'success',
      data: { logo }
    });
  }
);

/**
 * Deactivate logo
 * @route POST /api/v1/logos/:id/deactivate
 * @access Private/Admin
 */
export const deactivateLogo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const logo = await Logo.findById(req.params.id);

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    // Check if it's a primary logo
    if (logo.isPrimary) {
      return next(new AppError('Cannot deactivate primary logo. Set another logo as primary first.', 400));
    }

    await logo.deactivate();

    res.status(200).json({
      status: 'success',
      data: { logo }
    });
  }
);

/**
 * Set logo as primary
 * @route POST /api/v1/logos/:id/set-primary
 * @access Private/Admin
 */
export const setPrimaryLogo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const logo = await Logo.findById(req.params.id);

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    await logo.setPrimary();

    res.status(200).json({
      status: 'success',
      data: { logo }
    });
  }
);

// ==================== VARIANT MANAGEMENT ====================

/**
 * Add variant to logo
 * @route POST /api/v1/logos/:id/variants
 * @access Private/Admin
 */
export const addVariant = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const logo = await Logo.findById(req.params.id);

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    // Validate variant data
    const { name, url, width, height, size, format } = req.body;
    
    if (!name || !url || !width || !height || !size || !format) {
      return next(new AppError('Missing required variant fields', 400));
    }

    await logo.addVariant(req.body);

    res.status(200).json({
      status: 'success',
      data: { logo }
    });
  }
);

/**
 * Remove variant from logo
 * @route DELETE /api/v1/logos/:id/variants/:variantName
 * @access Private/Admin
 */
export const removeVariant = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const logo = await Logo.findById(req.params.id);

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    await logo.removeVariant(req.params.variantName);

    res.status(200).json({
      status: 'success',
      data: { logo }
    });
  }
);

/**
 * Get logo variants
 * @route GET /api/v1/logos/:id/variants
 * @access Public
 */
export const getVariants = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const logo = await Logo.findById(req.params.id).select('variants');

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      results: logo.variants.length,
      data: { variants: logo.variants }
    });
  }
);

// ==================== VERSION MANAGEMENT ====================

/**
 * Create new version of logo
 * @route POST /api/v1/logos/:id/versions
 * @access Private/Admin
 */
export const createVersion = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const logo = await Logo.findById(req.params.id);

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    // Validate new file data
    if (!req.body.originalFile || !req.body.originalFile.url) {
      return next(new AppError('New file information is required', 400));
    }

    await logo.createNewVersion(req.body.originalFile);

    res.status(200).json({
      status: 'success',
      data: { logo }
    });
  }
);

/**
 * Get version history
 * @route GET /api/v1/logos/:id/versions
 * @access Private/Admin
 */
export const getVersionHistory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const versions = await Logo.getLogoVersionHistory(req.params.id as any);

    res.status(200).json({
      status: 'success',
      results: versions.length,
      data: { versions }
    });
  }
);

/**
 * Revert to previous version
 * @route POST /api/v1/logos/:id/revert/:versionId
 * @access Private/Admin
 */
export const revertToVersion = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const currentLogo = await Logo.findById(req.params.id);
    const oldVersion = await Logo.findById(req.params.versionId);

    if (!currentLogo || !oldVersion) {
      return next(new AppError('Logo or version not found', 404));
    }

    // Create new version from old file
    await currentLogo.createNewVersion(oldVersion.originalFile);

    res.status(200).json({
      status: 'success',
      message: 'Logo reverted to previous version',
      data: { logo: currentLogo }
    });
  }
);

// ==================== PUBLIC ACCESS ====================

/**
 * Get active logo by type
 * @route GET /api/v1/logos/active/:type
 * @access Public
 */
export const getActiveLogo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const logo = await Logo.getActiveLogo(req.params.type);

    if (!logo) {
      return next(new AppError('No active logo found for this type', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { logo }
    });
  }
);

/**
 * Get all primary logos
 * @route GET /api/v1/logos/primary
 * @access Public
 */
export const getPrimaryLogos = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const logos = await Logo.getPrimaryLogos();

    res.status(200).json({
      status: 'success',
      results: logos.length,
      data: { logos }
    });
  }
);

/**
 * Get logos by type
 * @route GET /api/v1/logos/type/:type
 * @access Public
 */
export const getLogosByType = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const logos = await Logo.getLogosByType(req.params.type);

    res.status(200).json({
      status: 'success',
      results: logos.length,
      data: { logos }
    });
  }
);

// ==================== ANALYTICS & STATS ====================

/**
 * Get logo statistics
 * @route GET /api/v1/logos/stats/overview
 * @access Private/Admin
 */
export const getLogoStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const [
      total,
      active,
      byType,
      totalStorage,
      primaryLogos
    ] = await Promise.all([
      // Total logos
      Logo.countDocuments(),

      // Active logos
      Logo.countDocuments({ isActive: true }),

      // By type
      Logo.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            active: {
              $sum: { $cond: ['$isActive', 1, 0] }
            },
            primary: {
              $sum: { $cond: ['$isPrimary', 1, 0] }
            }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]),

      // Total storage (approximate)
      Logo.aggregate([
        {
          $project: {
            totalSize: {
              $add: [
                '$originalFile.size',
                { $sum: '$variants.size' }
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            totalBytes: { $sum: '$totalSize' }
          }
        }
      ]),

      // Primary logos count
      Logo.countDocuments({ isPrimary: true })
    ]);

    const storageBytes = totalStorage[0]?.totalBytes || 0;
    const storageMB = (storageBytes / (1024 * 1024)).toFixed(2);
    const storageGB = (storageBytes / (1024 * 1024 * 1024)).toFixed(2);

    res.status(200).json({
      status: 'success',
      data: {
        overview: {
          total,
          active,
          inactive: total - active,
          primaryLogos
        },
        byType,
        storage: {
          bytes: storageBytes,
          mb: storageMB,
          gb: storageGB
        }
      }
    });
  }
);

/**
 * Get logo usage report
 * @route GET /api/v1/logos/:id/usage
 * @access Private/Admin
 */
export const getLogoUsage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const logo = await Logo.findById(req.params.id).select('name type usageLocations variants');

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        name: logo.name,
        type: logo.type,
        usageLocations: logo.usageLocations,
        variantCount: logo.variants.length,
        variants: logo.variants.map((v: any) => ({
          name: v.name,
          format: v.format,
          dimensions: `${v.width}x${v.height}`,
          url: v.url
        }))
      }
    });
  }
);

// ==================== BULK OPERATIONS ====================

/**
 * Bulk update logos
 * @route POST /api/v1/logos/bulk-update
 * @access Private/Admin
 */
export const bulkUpdateLogos = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ids, updates } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return next(new AppError('Please provide logo IDs', 400));
    }

    if (!updates || typeof updates !== 'object') {
      return next(new AppError('Please provide updates', 400));
    }

    // Prevent updating protected fields
    delete updates.uploadedBy;
    delete updates.version;
    delete updates.previousVersions;

    const result = await Logo.updateMany(
      { _id: { $in: ids } },
      { $set: updates }
    );

    res.status(200).json({
      status: 'success',
      data: {
        modified: result.modifiedCount,
        message: `${result.modifiedCount} logo(s) updated successfully`
      }
    });
  }
);

/**
 * Bulk delete logos
 * @route POST /api/v1/logos/bulk-delete
 * @access Private/Admin
 */
export const bulkDeleteLogos = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return next(new AppError('Please provide logo IDs', 400));
    }

    // Check if any are primary
    const primaryCount = await Logo.countDocuments({
      _id: { $in: ids },
      isPrimary: true
    });

    if (primaryCount > 0) {
      return next(new AppError('Cannot delete primary logos. Set another logo as primary first.', 400));
    }

    const result = await Logo.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      status: 'success',
      data: {
        deleted: result.deletedCount,
        message: `${result.deletedCount} logo(s) deleted successfully`
      }
    });
  }
);

// ==================== SYSTEM OPERATIONS ====================

/**
 * Cleanup unused variants
 * @route POST /api/v1/logos/cleanup
 * @access Private/Admin
 */
export const cleanupUnusedVariants = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await Logo.cleanupUnusedVariants();

    res.status(200).json({
      status: 'success',
      message: 'Unused variants cleaned up successfully'
    });
  }
);

/**
 * Duplicate logo
 * @route POST /api/v1/logos/:id/duplicate
 * @access Private/Admin
 */
export const duplicateLogo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const original = await Logo.findById(req.params.id);

    if (!original) {
      return next(new AppError('Logo not found', 404));
    }

    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    // Create duplicate
    const duplicate = new Logo({
      ...original.toObject(),
      _id: undefined,
      name: `${original.name} (Copy)`,
      isPrimary: false,
      isActive: false,
      uploadedBy: req.user._id,
      previousVersions: [],
      version: 1,
      createdAt: undefined,
      updatedAt: undefined,
      activatedAt: undefined
    });

    await duplicate.save();

    res.status(201).json({
      status: 'success',
      data: { logo: duplicate }
    });
  }
);

export default {
  // CRUD
  getAllLogos,
  getLogo,
  createLogo,
  updateLogo,
  deleteLogo,

  // Status Management
  activateLogo,
  deactivateLogo,
  setPrimaryLogo,

  // Variant Management
  addVariant,
  removeVariant,
  getVariants,

  // Version Management
  createVersion,
  getVersionHistory,
  revertToVersion,

  // Public Access
  getActiveLogo,
  getPrimaryLogos,
  getLogosByType,

  // Analytics
  getLogoStats,
  getLogoUsage,

  // Bulk Operations
  bulkUpdateLogos,
  bulkDeleteLogos,

  // System Operations
  cleanupUnusedVariants,
  duplicateLogo
};
