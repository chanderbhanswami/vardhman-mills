import { Router } from 'express';
import NotificationService from '../services/notification.service';
import { protect as authenticate, restrictTo } from '../middleware/auth.middleware';
import * as notificationController from '../controllers/notification.controller';

const router = Router();

/**
 * POST /api/notifications/send
 * Send notification to a single device
 */
router.post('/send', authenticate, async (req, res) => {
  try {
    const { token, title, body, data, image } = req.body;

    if (!token || !title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Token, title, and body are required',
      });
    }

    const messageId = await NotificationService.sendToDevice(token, {
      title,
      body,
      image,
      data,
    });

    return res.json({
      success: true,
      messageId,
      message: 'Notification sent successfully',
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/notifications/send-multiple
 * Send notification to multiple devices
 */
router.post('/send-multiple', authenticate, async (req, res) => {
  try {
    const { tokens, title, body, data, image } = req.body;

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tokens array is required',
      });
    }

    const result = await NotificationService.sendToMultipleDevices(tokens, {
      title,
      body,
      image,
      data,
    });

    return res.json({
      success: true,
      ...result,
      message: 'Notifications sent',
    });
  } catch (error) {
    console.error('Error sending multiple notifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send notifications',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/notifications/topic
 * Send notification to a topic
 */
router.post('/topic', authenticate, async (req, res) => {
  try {
    const { topic, title, body, data, image } = req.body;

    if (!topic || !title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Topic, title, and body are required',
      });
    }

    const messageId = await NotificationService.sendToTopic(topic, {
      title,
      body,
      image,
      data,
    });

    return res.json({
      success: true,
      messageId,
      message: 'Topic notification sent successfully',
    });
  } catch (error) {
    console.error('Error sending topic notification:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send topic notification',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/notifications/subscribe
 * Subscribe tokens to a topic
 */
router.post('/subscribe', authenticate, async (req, res) => {
  try {
    const { tokens, topic } = req.body;

    if (!tokens || !Array.isArray(tokens) || !topic) {
      return res.status(400).json({
        success: false,
        message: 'Tokens array and topic are required',
      });
    }

    await NotificationService.subscribeToTopic(tokens, topic);

    return res.json({
      success: true,
      message: `Successfully subscribed to topic: ${topic}`,
    });
  } catch (error) {
    console.error('Error subscribing to topic:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to subscribe to topic',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/notifications/unsubscribe
 * Unsubscribe tokens from a topic
 */
router.post('/unsubscribe', authenticate, async (req, res) => {
  try {
    const { tokens, topic } = req.body;

    if (!tokens || !Array.isArray(tokens) || !topic) {
      return res.status(400).json({
        success: false,
        message: 'Tokens array and topic are required',
      });
    }

    await NotificationService.unsubscribeFromTopic(tokens, topic);

    return res.json({
      success: true,
      message: `Successfully unsubscribed from topic: ${topic}`,
    });
  } catch (error) {
    console.error('Error unsubscribing from topic:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe from topic',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ==================== NEW DATABASE-BACKED ROUTES ====================

// CRUD Operations
router.get('/', authenticate, notificationController.getUserNotifications);
router.get('/unread-count', authenticate, notificationController.getUnreadCount);

// Preferences (MUST come before /:id to avoid route conflict)
router.get('/preferences/me', authenticate, notificationController.getPreferences);
router.put('/preferences/me', authenticate, notificationController.updatePreferences);
router.post('/preferences/reset', authenticate, notificationController.resetPreferences);
router.post('/preferences/fcm-token', authenticate, notificationController.addFCMToken);
router.delete('/preferences/fcm-token', authenticate, notificationController.removeFCMToken);

// Single notification by ID
router.get('/:id', authenticate, notificationController.getNotification);
router.post('/', authenticate, restrictTo('admin'), notificationController.createNotification);
router.put('/:id', authenticate, notificationController.updateNotification);
router.delete('/:id', authenticate, notificationController.deleteNotification);

// Status Management
router.patch('/read-all', authenticate, notificationController.markAllAsRead);
router.patch('/:id/read', authenticate, notificationController.markAsRead);
router.patch('/:id/delivered', authenticate, notificationController.markAsDelivered);

// Templates (Admin)
router.get('/templates/all', authenticate, restrictTo('admin'), notificationController.getTemplates);
router.get('/templates/:id', authenticate, restrictTo('admin'), notificationController.getTemplate);
router.post('/templates', authenticate, restrictTo('admin'), notificationController.createTemplate);
router.put('/templates/:id', authenticate, restrictTo('admin'), notificationController.updateTemplate);
router.delete('/templates/:id', authenticate, restrictTo('admin'), notificationController.deleteTemplate);
router.post('/templates/:id/clone', authenticate, restrictTo('admin'), notificationController.cloneTemplate);
router.patch('/templates/:id/toggle', authenticate, restrictTo('admin'), notificationController.toggleTemplateStatus);

// Sending
router.post('/send-notification', authenticate, restrictTo('admin'), notificationController.sendNotification);
router.post('/schedule', authenticate, restrictTo('admin'), notificationController.scheduleNotification);
router.post('/bulk', authenticate, restrictTo('admin'), notificationController.sendBulkNotifications);
router.post('/:id/retry', authenticate, restrictTo('admin'), notificationController.resendFailed);

// Analytics (Admin)
router.get('/stats/overview', authenticate, restrictTo('admin'), notificationController.getNotificationStats);
router.get('/analytics/delivery-rate', authenticate, restrictTo('admin'), notificationController.getDeliveryRate);
router.get('/analytics/engagement', authenticate, restrictTo('admin'), notificationController.getEngagementMetrics);
router.get('/analytics/channels', authenticate, restrictTo('admin'), notificationController.getChannelPerformance);

// System (Admin)
router.post('/process-pending', authenticate, restrictTo('admin'), notificationController.processPendingNotifications);
router.post('/process-scheduled', authenticate, restrictTo('admin'), notificationController.processScheduledNotifications);
router.post('/cleanup', authenticate, restrictTo('admin'), notificationController.cleanupExpired);

export default router;