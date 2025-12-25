import { Request, Response, NextFunction } from 'express';
import Notification from '../models/Notification.model.js';
import NotificationPreference from '../models/NotificationPreference.model.js';
import NotificationTemplate from '../models/NotificationTemplate.model.js';
import NotificationService from '../services/notification.service.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import mongoose from 'mongoose';

// ==================== CRUD OPERATIONS ====================

/**
 * Get user notifications with pagination and filtering
 * GET /api/notifications
 */
export const getUserNotifications = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)?._id;
  
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const unreadOnly = req.query.unreadOnly === 'true';
  const type = req.query.type as string;
  const priority = req.query.priority as string;
  
  const notifications = await Notification.getUserNotifications(userId, {
    page,
    limit,
    unreadOnly,
    type,
    priority
  });
  
  const unreadCount = await Notification.getUnreadCount(userId);
  
  res.status(200).json({
    success: true,
    data: {
      notifications,
      unreadCount,
      page,
      limit
    }
  });
});

/**
 * Get single notification
 * GET /api/notifications/:id
 */
export const getNotification = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = (req.user as any)?._id;
  
  const notification = await Notification.findOne({
    _id: id,
    user: userId
  });
  
  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: notification
  });
});

/**
 * Create notification (Admin)
 * POST /api/notifications
 */
export const createNotification = catchAsync(async (req: Request, res: Response) => {
  const notificationData = req.body;
  
  const notification = await Notification.create(notificationData);
  
  res.status(201).json({
    success: true,
    data: notification,
    message: 'Notification created successfully'
  });
});

/**
 * Update notification
 * PUT /api/notifications/:id
 */
export const updateNotification = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = (req.user as any)?._id;
  
  const notification = await Notification.findOneAndUpdate(
    { _id: id, user: userId },
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: notification,
    message: 'Notification updated successfully'
  });
});

/**
 * Delete notification
 * DELETE /api/notifications/:id
 */
export const deleteNotification = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = (req.user as any)?._id;
  
  const notification = await Notification.findOneAndDelete({
    _id: id,
    user: userId
  });
  
  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }
  
  res.status(200).json({
    success: true,
    message: 'Notification deleted successfully'
  });
});

// ==================== STATUS MANAGEMENT ====================

/**
 * Mark notification as read
 * PATCH /api/notifications/:id/read
 */
export const markAsRead = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = (req.user as any)?._id;
  
  const notification = await Notification.findOne({
    _id: id,
    user: userId
  });
  
  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }
  
  await notification.markAsRead();
  
  res.status(200).json({
    success: true,
    data: notification,
    message: 'Notification marked as read'
  });
});

/**
 * Mark notification as delivered
 * PATCH /api/notifications/:id/delivered
 */
export const markAsDelivered = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  
  const notification = await Notification.findById(id);
  
  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }
  
  await notification.markAsDelivered();
  
  res.status(200).json({
    success: true,
    data: notification,
    message: 'Notification marked as delivered'
  });
});

/**
 * Mark all notifications as read
 * PATCH /api/notifications/read-all
 */
export const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)?._id;
  
  await Notification.markAllAsRead(userId);
  
  res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
});

/**
 * Get unread count
 * GET /api/notifications/unread-count
 */
export const getUnreadCount = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)?._id;
  
  const count = await Notification.getUnreadCount(userId);
  
  res.status(200).json({
    success: true,
    data: { count }
  });
});

// ==================== PREFERENCES ====================

/**
 * Get user notification preferences
 * GET /api/notifications/preferences
 */
export const getPreferences = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)?._id;
  
  const preferences = await NotificationPreference.getOrCreatePreferences(userId);
  
  res.status(200).json({
    success: true,
    data: preferences
  });
});

/**
 * Update notification preferences
 * PUT /api/notifications/preferences
 */
export const updatePreferences = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)?._id;
  
  const preferences = await NotificationPreference.findOneAndUpdate(
    { user: userId },
    req.body,
    { new: true, runValidators: true, upsert: true }
  );
  
  res.status(200).json({
    success: true,
    data: preferences,
    message: 'Preferences updated successfully'
  });
});

/**
 * Reset preferences to defaults
 * POST /api/notifications/preferences/reset
 */
export const resetPreferences = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)?._id;
  
  await NotificationPreference.findOneAndDelete({ user: userId });
  const preferences = await NotificationPreference.getOrCreatePreferences(userId);
  
  res.status(200).json({
    success: true,
    data: preferences,
    message: 'Preferences reset to defaults'
  });
});

/**
 * Add FCM token
 * POST /api/notifications/preferences/fcm-token
 */
export const addFCMToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req.user as any)?._id;
  const { token } = req.body;
  
  if (!token) {
    return next(new AppError('FCM token is required', 400));
  }
  
  const preferences = await NotificationPreference.getOrCreatePreferences(userId);
  await preferences.addFCMToken(token);
  
  res.status(200).json({
    success: true,
    message: 'FCM token added successfully'
  });
});

/**
 * Remove FCM token
 * DELETE /api/notifications/preferences/fcm-token
 */
export const removeFCMToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req.user as any)?._id;
  const { token } = req.body;
  
  if (!token) {
    return next(new AppError('FCM token is required', 400));
  }
  
  const preferences = await NotificationPreference.findOne({ user: userId });
  
  if (preferences) {
    await preferences.removeFCMToken(token);
  }
  
  res.status(200).json({
    success: true,
    message: 'FCM token removed successfully'
  });
});

// ==================== TEMPLATES (ADMIN) ====================

/**
 * Get all templates
 * GET /api/notifications/templates
 */
export const getTemplates = catchAsync(async (req: Request, res: Response) => {
  const { type, category, active } = req.query;
  
  const filter: any = {};
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (active !== undefined) filter.isActive = active === 'true';
  
  const templates = await NotificationTemplate.find(filter)
    .sort({ type: 1, name: 1 });
  
  res.status(200).json({
    success: true,
    data: templates
  });
});

/**
 * Get single template
 * GET /api/notifications/templates/:id
 */
export const getTemplate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  
  const template = await NotificationTemplate.findById(id);
  
  if (!template) {
    return next(new AppError('Template not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: template
  });
});

/**
 * Create template
 * POST /api/notifications/templates
 */
export const createTemplate = catchAsync(async (req: Request, res: Response) => {
  const template = await NotificationTemplate.create(req.body);
  
  res.status(201).json({
    success: true,
    data: template,
    message: 'Template created successfully'
  });
});

/**
 * Update template
 * PUT /api/notifications/templates/:id
 */
export const updateTemplate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  
  // Increment version if content changed
  const template = await NotificationTemplate.findById(id);
  if (!template) {
    return next(new AppError('Template not found', 404));
  }
  
  if (req.body.channels) {
    req.body.version = template.version + 1;
  }
  
  const updatedTemplate = await NotificationTemplate.findByIdAndUpdate(
    id,
    req.body,
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    success: true,
    data: updatedTemplate,
    message: 'Template updated successfully'
  });
});

/**
 * Delete template
 * DELETE /api/notifications/templates/:id
 */
export const deleteTemplate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  
  const template = await NotificationTemplate.findByIdAndDelete(id);
  
  if (!template) {
    return next(new AppError('Template not found', 404));
  }
  
  res.status(200).json({
    success: true,
    message: 'Template deleted successfully'
  });
});

/**
 * Clone template
 * POST /api/notifications/templates/:id/clone
 */
export const cloneTemplate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { name } = req.body;
  
  if (!name) {
    return next(new AppError('New template name is required', 400));
  }
  
  const template = await NotificationTemplate.findById(id);
  
  if (!template) {
    return next(new AppError('Template not found', 404));
  }
  
  const cloned = await template.clone(name);
  
  res.status(201).json({
    success: true,
    data: cloned,
    message: 'Template cloned successfully'
  });
});

/**
 * Toggle template active status
 * PATCH /api/notifications/templates/:id/toggle
 */
export const toggleTemplateStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  
  const template = await NotificationTemplate.findById(id);
  
  if (!template) {
    return next(new AppError('Template not found', 404));
  }
  
  if (template.isActive) {
    await template.deactivate();
  } else {
    await template.activate();
  }
  
  res.status(200).json({
    success: true,
    data: template,
    message: `Template ${template.isActive ? 'activated' : 'deactivated'} successfully`
  });
});

// ==================== SENDING ====================

/**
 * Send notification
 * POST /api/notifications/send
 */
export const sendNotification = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId, type, channel, title, message, data, templateId, variables } = req.body;
  
  // Check if user exists
  if (!userId) {
    return next(new AppError('User ID is required', 400));
  }
  
  // Get user preferences
  const preferences = await NotificationPreference.getOrCreatePreferences(userId);
  
  // Check if notification can be sent
  if (!preferences.canSendNotification(type, channel)) {
    return next(new AppError('User has disabled this notification type/channel', 403));
  }
  
  let notificationData: any = {
    user: userId,
    type,
    channel,
    title,
    message,
    data
  };
  
  // Use template if provided
  if (templateId && variables) {
    const template = await NotificationTemplate.findById(templateId);
    if (!template) {
      return next(new AppError('Template not found', 404));
    }
    
    const rendered = template.render(channel, variables);
    notificationData = {
      ...notificationData,
      ...rendered,
      template: templateId
    };
  }
  
  // Create notification in database
  const notification = await Notification.create(notificationData);
  
  // Send via appropriate service
  if (channel === 'push' && preferences.fcmTokens.length > 0) {
    try {
      await NotificationService.sendToMultipleDevices(
        preferences.fcmTokens,
        {
          title: notification.title,
          body: notification.message,
          image: notification.image,
          data: notification.data || {}
        }
      );
      await notification.markAsDelivered();
    } catch (error: any) {
      await notification.markAsFailed(error.message);
    }
  }
  
  res.status(201).json({
    success: true,
    data: notification,
    message: 'Notification sent successfully'
  });
});

/**
 * Schedule notification
 * POST /api/notifications/schedule
 */
export const scheduleNotification = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId, type, channel, title, message, scheduledFor, data } = req.body;
  
  if (!scheduledFor) {
    return next(new AppError('Scheduled time is required', 400));
  }
  
  const notification = await Notification.create({
    user: userId,
    type,
    channel,
    title,
    message,
    scheduledFor: new Date(scheduledFor),
    data,
    status: 'pending'
  });
  
  res.status(201).json({
    success: true,
    data: notification,
    message: 'Notification scheduled successfully'
  });
});

/**
 * Send bulk notifications
 * POST /api/notifications/bulk
 */
export const sendBulkNotifications = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userIds, type, channel, title, message, data } = req.body;
  
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return next(new AppError('User IDs array is required', 400));
  }
  
  const notifications = await Promise.all(
    userIds.map(async (userId) => {
      const preferences = await NotificationPreference.getOrCreatePreferences(userId);
      
      if (preferences.canSendNotification(type, channel)) {
        return Notification.create({
          user: userId,
          type,
          channel,
          title,
          message,
          data
        });
      }
      return null;
    })
  );
  
  const sentNotifications = notifications.filter(n => n !== null);
  
  res.status(201).json({
    success: true,
    data: {
      total: userIds.length,
      sent: sentNotifications.length,
      skipped: userIds.length - sentNotifications.length
    },
    message: `${sentNotifications.length} notifications sent successfully`
  });
});

/**
 * Resend failed notifications
 * POST /api/notifications/:id/retry
 */
export const resendFailed = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  
  const notification = await Notification.findById(id);
  
  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }
  
  // Check if can retry - access virtual properly
  const canRetry = (notification as any).canRetry;
  if (!canRetry) {
    return next(new AppError('Notification cannot be retried', 400));
  }
  
  await notification.retry();
  
  res.status(200).json({
    success: true,
    data: notification,
    message: 'Notification queued for retry'
  });
});

// ==================== ANALYTICS (ADMIN) ====================

/**
 * Get notification stats
 * GET /api/notifications/stats
 */
export const getNotificationStats = catchAsync(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;
  
  const filter: any = {};
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate as string);
    if (endDate) filter.createdAt.$lte = new Date(endDate as string);
  }
  
  const stats = await Notification.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        sent: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
        delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
        read: { $sum: { $cond: ['$isRead', 1, 0] } },
        unread: { $sum: { $cond: ['$isRead', 0, 1] } }
      }
    }
  ]);
  
  res.status(200).json({
    success: true,
    data: stats[0] || {
      total: 0,
      pending: 0,
      sent: 0,
      delivered: 0,
      failed: 0,
      read: 0,
      unread: 0
    }
  });
});

/**
 * Get delivery rate
 * GET /api/notifications/analytics/delivery-rate
 */
export const getDeliveryRate = catchAsync(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;
  
  const filter: any = {};
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate as string);
    if (endDate) filter.createdAt.$lte = new Date(endDate as string);
  }
  
  const stats = await Notification.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } }
      }
    },
    {
      $project: {
        total: 1,
        delivered: 1,
        failed: 1,
        deliveryRate: {
          $cond: [
            { $eq: ['$total', 0] },
            0,
            { $multiply: [{ $divide: ['$delivered', '$total'] }, 100] }
          ]
        },
        failureRate: {
          $cond: [
            { $eq: ['$total', 0] },
            0,
            { $multiply: [{ $divide: ['$failed', '$total'] }, 100] }
          ]
        }
      }
    }
  ]);
  
  res.status(200).json({
    success: true,
    data: stats[0] || {
      total: 0,
      delivered: 0,
      failed: 0,
      deliveryRate: 0,
      failureRate: 0
    }
  });
});

/**
 * Get engagement metrics
 * GET /api/notifications/analytics/engagement
 */
export const getEngagementMetrics = catchAsync(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;
  
  const filter: any = {};
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate as string);
    if (endDate) filter.createdAt.$lte = new Date(endDate as string);
  }
  
  const stats = await Notification.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        read: { $sum: { $cond: ['$isRead', 1, 0] } },
        avgTimeToRead: {
          $avg: {
            $cond: [
              '$readAt',
              { $subtract: ['$readAt', '$createdAt'] },
              null
            ]
          }
        }
      }
    },
    {
      $project: {
        total: 1,
        read: 1,
        unread: { $subtract: ['$total', '$read'] },
        readRate: {
          $cond: [
            { $eq: ['$total', 0] },
            0,
            { $multiply: [{ $divide: ['$read', '$total'] }, 100] }
          ]
        },
        avgTimeToReadMinutes: {
          $cond: [
            '$avgTimeToRead',
            { $divide: ['$avgTimeToRead', 60000] },
            null
          ]
        }
      }
    }
  ]);
  
  res.status(200).json({
    success: true,
    data: stats[0] || {
      total: 0,
      read: 0,
      unread: 0,
      readRate: 0,
      avgTimeToReadMinutes: null
    }
  });
});

/**
 * Get channel performance
 * GET /api/notifications/analytics/channels
 */
export const getChannelPerformance = catchAsync(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;
  
  const filter: any = {};
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate as string);
    if (endDate) filter.createdAt.$lte = new Date(endDate as string);
  }
  
  const stats = await Notification.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$channel',
        total: { $sum: 1 },
        delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
        read: { $sum: { $cond: ['$isRead', 1, 0] } }
      }
    },
    {
      $project: {
        channel: '$_id',
        total: 1,
        delivered: 1,
        failed: 1,
        read: 1,
        deliveryRate: {
          $cond: [
            { $eq: ['$total', 0] },
            0,
            { $multiply: [{ $divide: ['$delivered', '$total'] }, 100] }
          ]
        },
        readRate: {
          $cond: [
            { $eq: ['$total', 0] },
            0,
            { $multiply: [{ $divide: ['$read', '$total'] }, 100] }
          ]
        }
      }
    },
    { $sort: { total: -1 } }
  ]);
  
  res.status(200).json({
    success: true,
    data: stats
  });
});

// ==================== SYSTEM (ADMIN) ====================

/**
 * Process pending notifications
 * POST /api/notifications/process-pending
 */
export const processPendingNotifications = catchAsync(async (req: Request, res: Response) => {
  const notifications = await Notification.getPendingNotifications();
  
  const results = {
    total: notifications.length,
    sent: 0,
    failed: 0
  };
  
  for (const notification of notifications) {
    try {
      // Get user preferences
      const preferences = await NotificationPreference.findOne({ user: notification.user });
      
      if (preferences && notification.channel === 'push' && preferences.fcmTokens.length > 0) {
        await NotificationService.sendToMultipleDevices(
          preferences.fcmTokens,
          {
            title: notification.title,
            body: notification.message,
            image: notification.image,
            data: notification.data || {}
          }
        );
        await notification.markAsDelivered();
        results.sent++;
      } else {
        notification.status = 'sent';
        await notification.save();
        results.sent++;
      }
    } catch (error: any) {
      await notification.markAsFailed(error.message);
      results.failed++;
    }
  }
  
  res.status(200).json({
    success: true,
    data: results,
    message: `Processed ${results.total} pending notifications`
  });
});

/**
 * Process scheduled notifications
 * POST /api/notifications/process-scheduled
 */
export const processScheduledNotifications = catchAsync(async (req: Request, res: Response) => {
  const notifications = await Notification.getScheduledNotifications();
  
  const results = {
    total: notifications.length,
    processed: 0
  };
  
  for (const notification of notifications) {
    notification.status = 'pending';
    await notification.save();
    results.processed++;
  }
  
  res.status(200).json({
    success: true,
    data: results,
    message: `Processed ${results.processed} scheduled notifications`
  });
});

/**
 * Cleanup expired notifications
 * POST /api/notifications/cleanup
 */
export const cleanupExpired = catchAsync(async (req: Request, res: Response) => {
  await Notification.cleanupExpired();
  
  res.status(200).json({
    success: true,
    message: 'Expired notifications cleaned up successfully'
  });
});
