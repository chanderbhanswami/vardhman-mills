import { Request, Response, NextFunction } from 'express';
import Announcement from '../models/Announcement.model.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

// ==================== CRUD OPERATIONS ====================

/**
 * Get all announcements (Admin)
 * @route GET /api/v1/announcements
 * @access Private/Admin
 */
export const getAllAnnouncements = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
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

    if (req.query.isPaused !== undefined) {
      query.isPaused = req.query.isPaused === 'true';
    }

    if (req.query.position) {
      query.position = req.query.position;
    }

    // Date filters
    if (req.query.startDateFrom) {
      query.startDate = { $gte: new Date(req.query.startDateFrom as string) };
    }

    if (req.query.endDateTo) {
      query.endDate = { $lte: new Date(req.query.endDateTo as string) };
    }

    // Search
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { message: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const [announcements, total] = await Promise.all([
      Announcement.find(query)
        .populate('createdBy', 'name email')
        .sort({ priority: -1, displayOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Announcement.countDocuments(query)
    ]);

    res.status(200).json({
      status: 'success',
      results: announcements.length,
      data: {
        announcements,
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
 * Get single announcement
 * @route GET /api/v1/announcements/:id
 * @access Private/Admin
 */
export const getAnnouncement = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const announcement = await Announcement.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!announcement) {
      return next(new AppError('Announcement not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { announcement }
    });
  }
);

/**
 * Create announcement
 * @route POST /api/v1/announcements
 * @access Private/Admin
 */
export const createAnnouncement = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Add creator
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }
    
    req.body.createdBy = req.user._id;

    // Validate dates
    if (req.body.endDate && new Date(req.body.endDate) <= new Date(req.body.startDate)) {
      return next(new AppError('End date must be after start date', 400));
    }

    const announcement = await Announcement.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { announcement }
    });
  }
);

/**
 * Update announcement
 * @route PUT /api/v1/announcements/:id
 * @access Private/Admin
 */
export const updateAnnouncement = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Prevent updating creator
    delete req.body.createdBy;

    // Validate dates if provided
    if (req.body.startDate && req.body.endDate) {
      if (new Date(req.body.endDate) <= new Date(req.body.startDate)) {
        return next(new AppError('End date must be after start date', 400));
      }
    }

    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!announcement) {
      return next(new AppError('Announcement not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { announcement }
    });
  }
);

/**
 * Delete announcement
 * @route DELETE /api/v1/announcements/:id
 * @access Private/Admin
 */
export const deleteAnnouncement = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
      return next(new AppError('Announcement not found', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  }
);

// ==================== STATUS MANAGEMENT ====================

/**
 * Activate announcement
 * @route POST /api/v1/announcements/:id/activate
 * @access Private/Admin
 */
export const activateAnnouncement = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return next(new AppError('Announcement not found', 404));
    }

    await announcement.activate();

    res.status(200).json({
      status: 'success',
      data: { announcement }
    });
  }
);

/**
 * Deactivate announcement
 * @route POST /api/v1/announcements/:id/deactivate
 * @access Private/Admin
 */
export const deactivateAnnouncement = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return next(new AppError('Announcement not found', 404));
    }

    await announcement.deactivate();

    res.status(200).json({
      status: 'success',
      data: { announcement }
    });
  }
);

/**
 * Pause announcement
 * @route POST /api/v1/announcements/:id/pause
 * @access Private/Admin
 */
export const pauseAnnouncement = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return next(new AppError('Announcement not found', 404));
    }

    await announcement.pause();

    res.status(200).json({
      status: 'success',
      data: { announcement }
    });
  }
);

/**
 * Resume announcement
 * @route POST /api/v1/announcements/:id/resume
 * @access Private/Admin
 */
export const resumeAnnouncement = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return next(new AppError('Announcement not found', 404));
    }

    await announcement.resume();

    res.status(200).json({
      status: 'success',
      data: { announcement }
    });
  }
);

/**
 * Bulk activate/deactivate announcements
 * @route POST /api/v1/announcements/bulk-status
 * @access Private/Admin
 */
export const bulkUpdateStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ids, action } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return next(new AppError('Please provide announcement IDs', 400));
    }

    if (!['activate', 'deactivate', 'pause', 'resume'].includes(action)) {
      return next(new AppError('Invalid action', 400));
    }

    const updateData: any = {};
    if (action === 'activate') {
      updateData.isActive = true;
      updateData.isPaused = false;
    } else if (action === 'deactivate') {
      updateData.isActive = false;
    } else if (action === 'pause') {
      updateData.isPaused = true;
    } else if (action === 'resume') {
      updateData.isPaused = false;
    }

    const result = await Announcement.updateMany(
      { _id: { $in: ids } },
      { $set: updateData }
    );

    res.status(200).json({
      status: 'success',
      data: {
        modified: result.modifiedCount,
        message: `${result.modifiedCount} announcement(s) ${action}d successfully`
      }
    });
  }
);

// ==================== PUBLIC ACCESS ====================

/**
 * Get active announcements for users
 * @route GET /api/v1/announcements/active
 * @access Public
 */
export const getActiveAnnouncements = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const options: any = {};

    // Type filter
    if (req.query.type) {
      options.type = req.query.type;
    }

    // Position filter
    if (req.query.position) {
      options.position = req.query.position;
    }

    const announcements = await Announcement.getActiveAnnouncements(options);

    res.status(200).json({
      status: 'success',
      results: announcements.length,
      data: { announcements }
    });
  }
);

/**
 * Get announcements for specific page
 * @route GET /api/v1/announcements/page/:page
 * @access Public
 */
export const getAnnouncementsForPage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = req.params.page;

    const options: any = {};
    if (req.query.position) {
      options.position = req.query.position;
    }

    const announcements = await Announcement.getAnnouncementsForPage(page, options);

    res.status(200).json({
      status: 'success',
      results: announcements.length,
      data: { announcements }
    });
  }
);

/**
 * Get scheduled announcements (upcoming)
 * @route GET /api/v1/announcements/scheduled
 * @access Private/Admin
 */
export const getScheduledAnnouncements = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const announcements = await Announcement.getScheduledAnnouncements();

    res.status(200).json({
      status: 'success',
      results: announcements.length,
      data: { announcements }
    });
  }
);

// ==================== ANALYTICS ====================

/**
 * Track announcement view
 * @route POST /api/v1/announcements/:id/view
 * @access Public
 */
export const trackView = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return next(new AppError('Announcement not found', 404));
    }

    await announcement.incrementViews();

    res.status(200).json({
      status: 'success',
      data: { views: announcement.views }
    });
  }
);

/**
 * Track announcement click
 * @route POST /api/v1/announcements/:id/click
 * @access Public
 */
export const trackClick = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return next(new AppError('Announcement not found', 404));
    }

    await announcement.incrementClicks();

    res.status(200).json({
      status: 'success',
      data: { clicks: announcement.clicks }
    });
  }
);

/**
 * Track announcement dismissal
 * @route POST /api/v1/announcements/:id/dismiss
 * @access Public
 */
export const trackDismissal = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return next(new AppError('Announcement not found', 404));
    }

    await announcement.incrementDismissals();

    res.status(200).json({
      status: 'success',
      data: { dismissals: announcement.dismissals }
    });
  }
);

/**
 * Get announcement statistics
 * @route GET /api/v1/announcements/stats/overview
 * @access Private/Admin
 */
export const getAnnouncementStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const [
      total,
      active,
      scheduled,
      expired,
      paused,
      byType,
      topPerforming
    ] = await Promise.all([
      // Total announcements
      Announcement.countDocuments(),

      // Active announcements
      Announcement.countDocuments({
        isActive: true,
        isPaused: false,
        startDate: { $lte: new Date() },
        $or: [
          { endDate: { $exists: false } },
          { endDate: null },
          { endDate: { $gte: new Date() } }
        ]
      }),

      // Scheduled announcements
      Announcement.countDocuments({
        isActive: true,
        startDate: { $gt: new Date() }
      }),

      // Expired announcements
      Announcement.countDocuments({
        endDate: { $lt: new Date() }
      }),

      // Paused announcements
      Announcement.countDocuments({ isPaused: true }),

      // By type
      Announcement.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            totalViews: { $sum: '$views' },
            totalClicks: { $sum: '$clicks' }
          }
        }
      ]),

      // Top performing (by CTR)
      Announcement.find({ views: { $gt: 0 } })
        .select('title type views clicks dismissals')
        .sort({ clicks: -1 })
        .limit(10)
        .lean()
    ]);

    // Calculate overall stats
    const allAnnouncements: any = await Announcement.find().select('views clicks dismissals').lean();
    const totalViews = allAnnouncements.reduce((sum: number, a: any) => sum + a.views, 0);
    const totalClicks = allAnnouncements.reduce((sum: number, a: any) => sum + a.clicks, 0);
    const totalDismissals = allAnnouncements.reduce((sum: number, a: any) => sum + a.dismissals, 0);

    res.status(200).json({
      status: 'success',
      data: {
        overview: {
          total,
          active,
          scheduled,
          expired,
          paused,
          inactive: total - active - scheduled
        },
        engagement: {
          totalViews,
          totalClicks,
          totalDismissals,
          averageCTR: totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : 0,
          averageDismissalRate: totalViews > 0 ? ((totalDismissals / totalViews) * 100).toFixed(2) : 0
        },
        byType,
        topPerforming: topPerforming.map((a: any) => ({
          ...a,
          ctr: a.views > 0 ? ((a.clicks / a.views) * 100).toFixed(2) : 0,
          dismissalRate: a.views > 0 ? ((a.dismissals / a.views) * 100).toFixed(2) : 0
        }))
      }
    });
  }
);

/**
 * Get announcement performance metrics
 * @route GET /api/v1/announcements/:id/metrics
 * @access Private/Admin
 */
export const getAnnouncementMetrics = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return next(new AppError('Announcement not found', 404));
    }

    const metrics = {
      views: announcement.views,
      clicks: announcement.clicks,
      dismissals: announcement.dismissals,
      ctr: announcement.views > 0 ? ((announcement.clicks / announcement.views) * 100).toFixed(2) : 0,
      dismissalRate: announcement.views > 0 ? ((announcement.dismissals / announcement.views) * 100).toFixed(2) : 0,
      engagementRate: announcement.views > 0 
        ? (((announcement.clicks + announcement.dismissals) / announcement.views) * 100).toFixed(2) 
        : 0,
      status: announcement.isCurrentlyActive() ? 'active' : 'inactive',
      daysActive: announcement.startDate <= new Date() 
        ? Math.floor((new Date().getTime() - announcement.startDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0,
      daysRemaining: announcement.endDate && announcement.endDate > new Date()
        ? Math.ceil((announcement.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : null
    };

    res.status(200).json({
      status: 'success',
      data: { metrics }
    });
  }
);

// ==================== SYSTEM OPERATIONS ====================

/**
 * Cleanup expired announcements
 * @route POST /api/v1/announcements/cleanup
 * @access Private/Admin
 */
export const cleanupExpiredAnnouncements = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await Announcement.deactivateExpired();

    // Optionally delete old expired announcements
    const deleteOld = req.query.deleteOld === 'true';
    let deleted = 0;

    if (deleteOld) {
      const daysOld = parseInt(req.query.daysOld as string) || 90;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await Announcement.deleteMany({
        isActive: false,
        endDate: { $lt: cutoffDate }
      });

      deleted = result.deletedCount || 0;
    }

    res.status(200).json({
      status: 'success',
      data: {
        message: 'Expired announcements cleaned up successfully',
        deleted
      }
    });
  }
);

/**
 * Duplicate announcement
 * @route POST /api/v1/announcements/:id/duplicate
 * @access Private/Admin
 */
export const duplicateAnnouncement = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const original = await Announcement.findById(req.params.id);

    if (!original) {
      return next(new AppError('Announcement not found', 404));
    }
    
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    // Create duplicate
    const duplicate = new Announcement({
      ...original.toObject(),
      _id: undefined,
      title: `${original.title} (Copy)`,
      isActive: false,
      isPaused: false,
      views: 0,
      clicks: 0,
      dismissals: 0,
      createdBy: req.user._id,
      createdAt: undefined,
      updatedAt: undefined
    });

    await duplicate.save();

    res.status(201).json({
      status: 'success',
      data: { announcement: duplicate }
    });
  }
);

export default {
  // CRUD
  getAllAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,

  // Status Management
  activateAnnouncement,
  deactivateAnnouncement,
  pauseAnnouncement,
  resumeAnnouncement,
  bulkUpdateStatus,

  // Public Access
  getActiveAnnouncements,
  getAnnouncementsForPage,
  getScheduledAnnouncements,

  // Analytics
  trackView,
  trackClick,
  trackDismissal,
  getAnnouncementStats,
  getAnnouncementMetrics,

  // System Operations
  cleanupExpiredAnnouncements,
  duplicateAnnouncement
};
