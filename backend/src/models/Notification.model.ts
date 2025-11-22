import mongoose, { Document, Schema } from 'mongoose';

// ==================== INTERFACES ====================

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  type: 'order' | 'product' | 'promotion' | 'account' | 'system' | 'custom';
  channel: 'in-app' | 'email' | 'sms' | 'push';
  
  // Content
  title: string;
  message: string;
  icon?: string;
  image?: string;
  link?: string;
  
  // Context data
  data?: Record<string, any>;
  relatedId?: mongoose.Types.ObjectId;
  relatedModel?: string;
  
  // Status
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  isRead: boolean;
  readAt?: Date;
  
  // Scheduling
  scheduledFor?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  
  // Priority
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Template
  template?: string;
  
  // Error tracking
  error?: string;
  retryCount: number;
  maxRetries: number;
  
  // Actions
  actions?: Array<{
    label: string;
    action: string;
    style?: 'primary' | 'secondary' | 'danger';
  }>;
  
  // Expiry
  expiresAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  markAsRead(): Promise<this>;
  markAsDelivered(): Promise<this>;
  markAsFailed(error: string): Promise<this>;
  retry(): Promise<this>;
}

export interface INotificationModel extends mongoose.Model<INotification> {
  getUserNotifications(userId: mongoose.Types.ObjectId, options?: any): Promise<INotification[]>;
  getUnreadCount(userId: mongoose.Types.ObjectId): Promise<number>;
  markAllAsRead(userId: mongoose.Types.ObjectId): Promise<void>;
  getPendingNotifications(): Promise<INotification[]>;
  getScheduledNotifications(): Promise<INotification[]>;
  cleanupExpired(): Promise<void>;
}

// ==================== SCHEMA ====================

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true
    },
    type: {
      type: String,
      enum: {
        values: ['order', 'product', 'promotion', 'account', 'system', 'custom'],
        message: 'Invalid notification type'
      },
      required: [true, 'Notification type is required'],
      index: true
    },
    channel: {
      type: String,
      enum: {
        values: ['in-app', 'email', 'sms', 'push'],
        message: 'Invalid channel'
      },
      required: [true, 'Channel is required'],
      index: true
    },
    
    // Content
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    icon: {
      type: String,
      trim: true
    },
    image: {
      type: String,
      trim: true
    },
    link: {
      type: String,
      trim: true
    },
    
    // Context data
    data: {
      type: Schema.Types.Mixed,
      default: {}
    },
    relatedId: {
      type: Schema.Types.ObjectId
    },
    relatedModel: {
      type: String,
      trim: true
    },
    
    // Status
    status: {
      type: String,
      enum: {
        values: ['pending', 'sent', 'delivered', 'failed', 'read'],
        message: 'Invalid status'
      },
      default: 'pending',
      index: true
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    readAt: {
      type: Date
    },
    
    // Scheduling
    scheduledFor: {
      type: Date,
      index: true
    },
    sentAt: {
      type: Date
    },
    deliveredAt: {
      type: Date
    },
    
    // Priority
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'urgent'],
        message: 'Invalid priority'
      },
      default: 'medium',
      index: true
    },
    
    // Template
    template: {
      type: String,
      trim: true
    },
    
    // Error tracking
    error: {
      type: String,
      trim: true
    },
    retryCount: {
      type: Number,
      default: 0,
      min: [0, 'Retry count cannot be negative']
    },
    maxRetries: {
      type: Number,
      default: 3,
      min: [0, 'Max retries cannot be negative']
    },
    
    // Actions
    actions: [{
      label: {
        type: String,
        required: true,
        trim: true
      },
      action: {
        type: String,
        required: true,
        trim: true
      },
      style: {
        type: String,
        enum: ['primary', 'secondary', 'danger'],
        default: 'primary'
      }
    }],
    
    // Expiry
    expiresAt: {
      type: Date,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ==================== INDEXES ====================

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ status: 1, scheduledFor: 1 });
notificationSchema.index({ type: 1, user: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ==================== VIRTUALS ====================

notificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

notificationSchema.virtual('canRetry').get(function() {
  return this.status === 'failed' && this.retryCount < this.maxRetries;
});

// ==================== INSTANCE METHODS ====================

/**
 * Mark notification as read
 */
notificationSchema.methods.markAsRead = async function(): Promise<any> {
  this.isRead = true;
  this.readAt = new Date();
  if (this.status === 'delivered') {
    this.status = 'read';
  }
  await this.save();
  return this as any;
};

/**
 * Mark notification as delivered
 */
notificationSchema.methods.markAsDelivered = async function(): Promise<any> {
  this.status = 'delivered';
  this.deliveredAt = new Date();
  if (!this.sentAt) {
    this.sentAt = new Date();
  }
  await this.save();
  return this as any;
};

/**
 * Mark notification as failed
 */
notificationSchema.methods.markAsFailed = async function(error: string): Promise<any> {
  this.status = 'failed';
  this.error = error;
  this.retryCount += 1;
  await this.save();
  return this as any;
};

/**
 * Retry sending notification
 */
notificationSchema.methods.retry = async function(): Promise<any> {
  if (!this.canRetry) {
    throw new Error('Cannot retry: max retries reached or notification is not failed');
  }
  
  this.status = 'pending';
  this.error = undefined;
  await this.save();
  return this as any;
};

// ==================== STATIC METHODS ====================

/**
 * Get user notifications with filtering
 */
notificationSchema.statics.getUserNotifications = async function(
  userId: mongoose.Types.ObjectId,
  options: any = {}
): Promise<INotification[]> {
  const {
    page = 1,
    limit = 20,
    unreadOnly = false,
    type,
    priority
  } = options;
  
  const query: any = {
    user: userId,
    expiresAt: { $gt: new Date() }
  };
  
  if (unreadOnly) {
    query.isRead = false;
  }
  
  if (type) {
    query.type = type;
  }
  
  if (priority) {
    query.priority = priority;
  }
  
  return this.find(query)
    .sort('-priority -createdAt')
    .skip((page - 1) * limit)
    .limit(limit);
};

/**
 * Get unread notification count
 */
notificationSchema.statics.getUnreadCount = async function(
  userId: mongoose.Types.ObjectId
): Promise<number> {
  return this.countDocuments({
    user: userId,
    isRead: false,
    expiresAt: { $gt: new Date() }
  });
};

/**
 * Mark all notifications as read
 */
notificationSchema.statics.markAllAsRead = async function(
  userId: mongoose.Types.ObjectId
): Promise<void> {
  await this.updateMany(
    { user: userId, isRead: false },
    { isRead: true, readAt: new Date(), status: 'read' }
  );
};

/**
 * Get pending notifications to send
 */
notificationSchema.statics.getPendingNotifications = async function(): Promise<INotification[]> {
  return this.find({
    status: 'pending',
    $or: [
      { scheduledFor: { $exists: false } },
      { scheduledFor: { $lte: new Date() } }
    ],
    expiresAt: { $gt: new Date() }
  })
    .sort('priority -createdAt')
    .limit(100)
    .populate('user', 'name email phone fcmTokens');
};

/**
 * Get scheduled notifications
 */
notificationSchema.statics.getScheduledNotifications = async function(): Promise<INotification[]> {
  return this.find({
    status: 'pending',
    scheduledFor: { $exists: true, $lte: new Date() },
    expiresAt: { $gt: new Date() }
  })
    .sort('scheduledFor')
    .populate('user', 'name email phone fcmTokens');
};

/**
 * Cleanup expired notifications
 */
notificationSchema.statics.cleanupExpired = async function(): Promise<void> {
  await this.deleteMany({
    expiresAt: { $lte: new Date() }
  });
};

// ==================== HOOKS ====================

notificationSchema.pre('save', function(next) {
  // Set default expiry if not provided (30 days)
  if (!this.expiresAt) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    this.expiresAt = expiryDate;
  }
  
  // Set default icon based on type if not provided
  if (!this.icon) {
    switch (this.type) {
      case 'order':
        this.icon = '📦';
        break;
      case 'product':
        this.icon = '🛍️';
        break;
      case 'promotion':
        this.icon = '🎉';
        break;
      case 'account':
        this.icon = '👤';
        break;
      case 'system':
        this.icon = '⚙️';
        break;
      default:
        this.icon = '🔔';
    }
  }
  
  next();
});

// ==================== MODEL ====================

const Notification = mongoose.model<INotification, INotificationModel>('Notification', notificationSchema);

export default Notification;
