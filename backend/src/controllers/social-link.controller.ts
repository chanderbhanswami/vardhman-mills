/**
 * Social Link Controller
 * Handles all social media link operations with analytics and tracking
 */

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import SocialLink, { ISocialLink, SocialPlatform, DisplayLocation } from '../models/social-link.model';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

// ============================================================================
// PUBLIC ENDPOINTS
// ============================================================================

/**
 * Get all social links (Public)
 * @route GET /api/v1/social-links
 * @access Public
 */
export const getSocialLinks = catchAsync(async (req: Request, res: Response) => {
  const {
    platform,
    location,
    group,
    isActive,
    isVerified,
    sortBy = 'displayOrder',
    order = 'asc',
    page = 1,
    limit = 50,
    search
  } = req.query;

  // Build query
  const query: any = {};

  if (platform) query.platform = platform;
  if (location) query.displayLocation = location;
  if (group) query.group = group;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (isVerified !== undefined) query.isVerified = isVerified === 'true';

  // Add search
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } }
    ];
  }

  // Build sort
  const sortOptions: any = {};
  sortOptions[sortBy as string] = order === 'desc' ? -1 : 1;

  // Execute query with pagination
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [links, total] = await Promise.all([
    SocialLink.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate('group', 'name description')
      .lean(),
    SocialLink.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: links.length,
    total,
    totalPages: Math.ceil(total / limitNum),
    currentPage: pageNum,
    data: links
  });
});

/**
 * Get social link by ID (Public)
 * @route GET /api/v1/social-links/:id
 * @access Public
 */
export const getSocialLinkById = catchAsync(async (req: Request, res: Response) => {
  const link = await SocialLink.findById(req.params.id)
    .populate('group', 'name description')
    .lean();

  if (!link) {
    throw new AppError('Social link not found', 404);
  }

  res.status(200).json({
    success: true,
    data: link
  });
});

/**
 * Get social links by location (Public)
 * @route GET /api/v1/social-links/location/:location
 * @access Public
 */
export const getSocialLinksByLocation = catchAsync(async (req: Request, res: Response) => {
  const { location } = req.params;

  const links = await SocialLink.find({
    displayLocation: location,
    isActive: true
  })
    .sort({ displayOrder: 1 })
    .populate('group', 'name description')
    .lean();

  res.status(200).json({
    success: true,
    count: links.length,
    data: links
  });
});

/**
 * Get social links by platform (Public)
 * @route GET /api/v1/social-links/platform/:platform
 * @access Public
 */
export const getSocialLinksByPlatform = catchAsync(async (req: Request, res: Response) => {
  const { platform } = req.params;

  const links = await SocialLink.find({
    platform: platform as SocialPlatform,
    isActive: true
  })
    .sort({ displayOrder: 1 })
    .populate('group', 'name description')
    .lean();

  res.status(200).json({
    success: true,
    count: links.length,
    data: links
  });
});

/**
 * Get active social links (Public)
 * @route GET /api/v1/social-links/active
 * @access Public
 */
export const getActiveSocialLinks = catchAsync(async (req: Request, res: Response) => {
  const links = await SocialLink.find({ isActive: true })
    .sort({ displayOrder: 1 })
    .populate('group', 'name description')
    .lean();

  res.status(200).json({
    success: true,
    count: links.length,
    data: links
  });
});

/**
 * Get popular social links (Public)
 * @route GET /api/v1/social-links/popular
 * @access Public
 */
export const getPopularSocialLinks = catchAsync(async (req: Request, res: Response) => {
  const { limit = 10 } = req.query;

  const links = await SocialLink.find({
    isActive: true,
    'analytics.clicks': { $gte: 100 }
  })
    .sort({ 'analytics.clicks': -1 })
    .limit(parseInt(limit as string))
    .populate('group', 'name description')
    .lean();

  res.status(200).json({
    success: true,
    count: links.length,
    data: links
  });
});

/**
 * Track social link click (Public)
 * @route POST /api/v1/social-links/track/:id
 * @access Public
 */
export const trackSocialLinkClick = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { referrer, userAgent, country, city, device, ipAddress } = req.body;

  const link = await SocialLink.findById(id);

  if (!link) {
    throw new AppError('Social link not found', 404);
  }

  if (!link.tracking.enabled) {
    res.status(200).json({
      success: true,
      message: 'Tracking is disabled for this link'
    });
    return;
  }

  // Add click to history
  link.tracking.clickHistory.push({
    timestamp: new Date(),
    referrer,
    userAgent: userAgent || req.headers['user-agent'] || 'Unknown',
    country,
    city,
    device,
    ipAddress: ipAddress || req.ip
  } as any);

  // Update analytics
  link.analytics.clicks += 1;
  link.analytics.lastClickedAt = new Date();

  // Update time-based analytics
  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const clicksToday = link.tracking.clickHistory.filter(
    click => click.timestamp >= todayStart
  ).length;

  const clicksThisWeek = link.tracking.clickHistory.filter(
    click => click.timestamp >= weekStart
  ).length;

  const clicksThisMonth = link.tracking.clickHistory.filter(
    click => click.timestamp >= monthStart
  ).length;

  link.analytics.clicksToday = clicksToday;
  link.analytics.clicksThisWeek = clicksThisWeek;
  link.analytics.clicksThisMonth = clicksThisMonth;

  // Calculate unique clicks (based on IP address)
  const uniqueIPs = new Set(link.tracking.clickHistory.map(click => click.ipAddress).filter(Boolean));
  link.analytics.uniqueClicks = uniqueIPs.size;

  await link.save();

  res.status(200).json({
    success: true,
    message: 'Click tracked successfully',
    data: {
      clicks: link.analytics.clicks,
      clicksToday: link.analytics.clicksToday,
      clicksThisWeek: link.analytics.clicksThisWeek,
      clicksThisMonth: link.analytics.clicksThisMonth
    }
  });
});

// ============================================================================
// ADMIN ENDPOINTS
// ============================================================================

/**
 * Create social link (Admin)
 * @route POST /api/v1/social-links
 * @access Private/Admin
 */
export const createSocialLink = catchAsync(async (req: Request, res: Response) => {
  // Check for duplicate platform+url combination
  const existingLink = await SocialLink.findOne({
    platform: req.body.platform,
    url: req.body.url
  });

  if (existingLink) {
    throw new AppError('A social link with this platform and URL already exists', 400);
  }

  // Add creator info
  if (req.user) {
    req.body.lastModifiedBy = new mongoose.Types.ObjectId(req.user._id);
  }

  const link = await SocialLink.create(req.body);

  res.status(201).json({
    success: true,
    data: link
  });
});

/**
 * Update social link (Admin)
 * @route PATCH /api/v1/social-links/:id
 * @access Private/Admin
 */
export const updateSocialLink = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Check for duplicate if platform or url is being updated
  if (req.body.platform || req.body.url) {
    const existingLink = await SocialLink.findOne({
      _id: { $ne: id },
      platform: req.body.platform,
      url: req.body.url
    });

    if (existingLink) {
      throw new AppError('A social link with this platform and URL already exists', 400);
    }
  }

  // Add modifier info
  if (req.user) {
    req.body.lastModifiedBy = new mongoose.Types.ObjectId(req.user._id);
  }

  const link = await SocialLink.findByIdAndUpdate(
    id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!link) {
    throw new AppError('Social link not found', 404);
  }

  res.status(200).json({
    success: true,
    data: link
  });
});

/**
 * Delete social link (Admin)
 * @route DELETE /api/v1/social-links/:id
 * @access Private/Admin
 */
export const deleteSocialLink = catchAsync(async (req: Request, res: Response) => {
  const link = await SocialLink.findByIdAndDelete(req.params.id);

  if (!link) {
    throw new AppError('Social link not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Social link deleted successfully'
  });
});

/**
 * Get social link analytics (Admin)
 * @route GET /api/v1/social-links/analytics/overview
 * @access Private/Admin
 */
export const getSocialLinkAnalytics = catchAsync(async (req: Request, res: Response) => {
  const analytics = await SocialLink.aggregate([
    {
      $facet: {
        // Overall statistics
        overview: [
          {
            $group: {
              _id: null,
              totalLinks: { $sum: 1 },
              activeLinks: {
                $sum: { $cond: ['$isActive', 1, 0] }
              },
              verifiedLinks: {
                $sum: { $cond: ['$isVerified', 1, 0] }
              },
              totalClicks: { $sum: '$analytics.clicks' },
              totalUniqueClicks: { $sum: '$analytics.uniqueClicks' },
              averageClicksPerLink: { $avg: '$analytics.clicks' }
            }
          }
        ],

        // Platform distribution
        platformDistribution: [
          {
            $group: {
              _id: '$platform',
              count: { $sum: 1 },
              totalClicks: { $sum: '$analytics.clicks' },
              averageClicks: { $avg: '$analytics.clicks' }
            }
          },
          { $sort: { totalClicks: -1 } }
        ],

        // Location distribution
        locationDistribution: [
          { $unwind: '$displayLocation' },
          {
            $group: {
              _id: '$displayLocation',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } }
        ],

        // Top performers
        topPerformers: [
          { $match: { isActive: true } },
          { $sort: { 'analytics.clicks': -1 } },
          { $limit: 10 },
          {
            $project: {
              title: 1,
              platform: 1,
              url: 1,
              clicks: '$analytics.clicks',
              uniqueClicks: '$analytics.uniqueClicks',
              clickThroughRate: {
                $cond: [
                  { $gt: ['$analytics.clicks', 0] },
                  {
                    $multiply: [
                      { $divide: ['$analytics.uniqueClicks', '$analytics.clicks'] },
                      100
                    ]
                  },
                  0
                ]
              }
            }
          }
        ],

        // Click trends (last 30 days)
        clickTrends: [
          { $unwind: '$tracking.clickHistory' },
          {
            $match: {
              'tracking.clickHistory.timestamp': {
                $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$tracking.clickHistory.timestamp'
                }
              },
              clicks: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ],

        // Device distribution
        deviceDistribution: [
          { $unwind: '$tracking.clickHistory' },
          {
            $group: {
              _id: '$tracking.clickHistory.device',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } }
        ],

        // Geographic distribution
        geographicDistribution: [
          { $unwind: '$tracking.clickHistory' },
          {
            $match: { 'tracking.clickHistory.country': { $exists: true, $ne: null } }
          },
          {
            $group: {
              _id: '$tracking.clickHistory.country',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } },
          { $limit: 20 }
        ]
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: analytics[0]
  });
});

/**
 * Verify social link accessibility (Admin)
 * @route POST /api/v1/social-links/verify/:id
 * @access Private/Admin
 */
export const verifySocialLink = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const link = await SocialLink.findById(id);

  if (!link) {
    throw new AppError('Social link not found', 404);
  }

  // Skip verification for email and phone
  if (link.platform === 'email' || link.platform === 'phone') {
    link.verification.isVerified = true;
    link.verification.verifiedAt = new Date();
    link.verification.lastChecked = new Date();
    await link.save();

    res.status(200).json({
      success: true,
      message: 'Social link verified (email/phone)',
      data: link
    });
    return;
  }

  try {
    // Attempt to fetch the URL
    const startTime = Date.now();
    const response = await fetch(link.url, {
      method: 'HEAD',
      redirect: 'follow'
    });
    const responseTime = Date.now() - startTime;

    link.verification.isVerified = response.ok;
    link.verification.verifiedAt = new Date();
    link.verification.lastChecked = new Date();
    link.verification.isAccessible = response.ok;
    link.verification.statusCode = response.status;
    link.verification.responseTime = responseTime;
    link.verification.verificationError = response.ok ? undefined : `HTTP ${response.status} ${response.statusText}`;

    await link.save();

    res.status(200).json({
      success: true,
      message: response.ok ? 'Social link verified successfully' : 'Social link verification failed',
      data: link
    });
  } catch (error: any) {
    link.verification.isVerified = false;
    link.verification.lastChecked = new Date();
    link.verification.isAccessible = false;
    link.verification.verificationError = error.message;

    await link.save();

    res.status(200).json({
      success: true,
      message: 'Social link verification failed',
      data: link
    });
  }
});

/**
 * Bulk verify all social links (Admin)
 * @route POST /api/v1/social-links/verify-all
 * @access Private/Admin
 */
export const verifyAllSocialLinks = catchAsync(async (req: Request, res: Response) => {
  const links = await SocialLink.find({ isActive: true });

  const results = await Promise.allSettled(
    links.map(async (link) => {
      if (link.platform === 'email' || link.platform === 'phone') {
        link.verification.isVerified = true;
        link.verification.verifiedAt = new Date();
        link.verification.lastChecked = new Date();
        await link.save();
        return { id: link._id, status: 'verified', reason: 'email/phone' };
      }

      try {
        const startTime = Date.now();
        const response = await fetch(link.url, {
          method: 'HEAD',
          redirect: 'follow'
        });
        const responseTime = Date.now() - startTime;

        link.verification.isVerified = response.ok;
        link.verification.verifiedAt = new Date();
        link.verification.lastChecked = new Date();
        link.verification.isAccessible = response.ok;
        link.verification.statusCode = response.status;
        link.verification.responseTime = responseTime;
        link.verification.verificationError = response.ok ? undefined : `HTTP ${response.status}`;

        await link.save();

        return { id: link._id, status: response.ok ? 'verified' : 'failed', statusCode: response.status };
      } catch (error: any) {
        link.verification.isVerified = false;
        link.verification.lastChecked = new Date();
        link.verification.isAccessible = false;
        link.verification.verificationError = error.message;

        await link.save();

        return { id: link._id, status: 'error', error: error.message };
      }
    })
  );

  const summary = {
    total: results.length,
    verified: results.filter(r => r.status === 'fulfilled' && (r.value as any).status === 'verified').length,
    failed: results.filter(r => r.status === 'fulfilled' && (r.value as any).status === 'failed').length,
    errors: results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && (r.value as any).status === 'error')).length
  };

  res.status(200).json({
    success: true,
    message: 'Bulk verification completed',
    summary,
    results: results.map(r => r.status === 'fulfilled' ? r.value : { status: 'error', reason: (r as any).reason })
  });
});

/**
 * Reorder social links (Admin)
 * @route PATCH /api/v1/social-links/reorder
 * @access Private/Admin
 */
export const reorderSocialLinks = catchAsync(async (req: Request, res: Response) => {
  const { links } = req.body; // Array of { id, displayOrder }

  if (!Array.isArray(links) || links.length === 0) {
    throw new AppError('Please provide an array of links with id and displayOrder', 400);
  }

  // Bulk update display orders
  const bulkOps = links.map((link: { id: string; displayOrder: number }) => ({
    updateOne: {
      filter: { _id: link.id },
      update: { $set: { displayOrder: link.displayOrder } }
    }
  }));

  await SocialLink.bulkWrite(bulkOps);

  res.status(200).json({
    success: true,
    message: 'Social links reordered successfully',
    count: links.length
  });
});

/**
 * Bulk update social links (Admin)
 * @route PATCH /api/v1/social-links/bulk-update
 * @access Private/Admin
 */
export const bulkUpdateSocialLinks = catchAsync(async (req: Request, res: Response) => {
  const { ids, updates } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError('Please provide an array of social link IDs', 400);
  }

  if (!updates || Object.keys(updates).length === 0) {
    throw new AppError('Please provide updates to apply', 400);
  }

  // Add modifier info
  if (req.user) {
    updates.lastModifiedBy = new mongoose.Types.ObjectId(req.user._id);
  }

  const result = await SocialLink.updateMany(
    { _id: { $in: ids } },
    { $set: updates }
  );

  res.status(200).json({
    success: true,
    message: 'Social links updated successfully',
    modifiedCount: result.modifiedCount
  });
});

/**
 * Bulk delete social links (Admin)
 * @route DELETE /api/v1/social-links/bulk-delete
 * @access Private/Admin
 */
export const bulkDeleteSocialLinks = catchAsync(async (req: Request, res: Response) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError('Please provide an array of social link IDs to delete', 400);
  }

  const result = await SocialLink.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    message: 'Social links deleted successfully',
    deletedCount: result.deletedCount
  });
});

/**
 * Reset social link analytics (Admin)
 * @route POST /api/v1/social-links/reset-analytics/:id
 * @access Private/Admin
 */
export const resetSocialLinkAnalytics = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const link = await SocialLink.findByIdAndUpdate(
    id,
    {
      $set: {
        'analytics.clicks': 0,
        'analytics.uniqueClicks': 0,
        'analytics.clicksThisMonth': 0,
        'analytics.clicksThisWeek': 0,
        'analytics.clicksToday': 0,
        'analytics.averageClicksPerDay': 0,
        'analytics.lastClickedAt': null,
        'tracking.clickHistory': []
      }
    },
    { new: true }
  );

  if (!link) {
    throw new AppError('Social link not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Analytics reset successfully',
    data: link
  });
});

/**
 * Export social links data (Admin)
 * @route GET /api/v1/social-links/export
 * @access Private/Admin
 */
export const exportSocialLinks = catchAsync(async (req: Request, res: Response) => {
  const { format = 'json' } = req.query;

  const links = await SocialLink.find()
    .populate('group', 'name description')
    .lean();

  if (format === 'csv') {
    // Convert to CSV format
    const csvHeader = 'ID,Platform,Title,URL,Is Active,Clicks,Display Order\n';
    const csvRows = links.map(link => 
      `${link._id},${link.platform},${link.title},${link.url},${link.isActive},${link.analytics.clicks},${link.displayOrder}`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=social-links.csv');
    res.status(200).send(csvHeader + csvRows);
  } else {
    // JSON format
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=social-links.json');
    res.status(200).json({
      success: true,
      count: links.length,
      data: links,
      exportedAt: new Date()
    });
  }
});
