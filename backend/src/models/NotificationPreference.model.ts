import mongoose, { Document, Schema } from 'mongoose';

// ==================== INTERFACES ====================

export interface INotificationPreference extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  
  // Channel preferences
  channels: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  
  // Type preferences
  types: {
    order: {
      enabled: boolean;
      channels: string[];
    };
    product: {
      enabled: boolean;
      channels: string[];
    };
    promotion: {
      enabled: boolean;
      channels: string[];
    };
    account: {
      enabled: boolean;
      channels: string[];
    };
    system: {
      enabled: boolean;
      channels: string[];
    };
  };
  
  // Quiet hours
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:MM format
    endTime: string;   // HH:MM format
    timezone: string;
  };
  
  // Frequency limits
  frequency: {
    maxPerDay: number;
    maxPerHour: number;
  };
  
  // Device tokens
  fcmTokens: string[];
  emailVerified: boolean;
  phoneVerified: boolean;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  canSendNotification(type: string, channel: string): boolean;
  isInQuietHours(): boolean;
  addFCMToken(token: string): Promise<this>;
  removeFCMToken(token: string): Promise<this>;
}

export interface INotificationPreferenceModel extends mongoose.Model<INotificationPreference> {
  getOrCreatePreferences(userId: mongoose.Types.ObjectId): Promise<INotificationPreference>;
}

// ==================== SCHEMA ====================

const notificationPreferenceSchema = new Schema<INotificationPreference>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      unique: true,
      index: true
    },
    
    // Channel preferences
    channels: {
      inApp: {
        type: Boolean,
        default: true
      },
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    
    // Type preferences
    types: {
      order: {
        enabled: {
          type: Boolean,
          default: true
        },
        channels: [{
          type: String,
          enum: ['in-app', 'email', 'sms', 'push']
        }]
      },
      product: {
        enabled: {
          type: Boolean,
          default: true
        },
        channels: [{
          type: String,
          enum: ['in-app', 'email', 'sms', 'push']
        }]
      },
      promotion: {
        enabled: {
          type: Boolean,
          default: true
        },
        channels: [{
          type: String,
          enum: ['in-app', 'email', 'sms', 'push']
        }]
      },
      account: {
        enabled: {
          type: Boolean,
          default: true
        },
        channels: [{
          type: String,
          enum: ['in-app', 'email', 'sms', 'push']
        }]
      },
      system: {
        enabled: {
          type: Boolean,
          default: true
        },
        channels: [{
          type: String,
          enum: ['in-app', 'email', 'sms', 'push']
        }]
      }
    },
    
    // Quiet hours
    quietHours: {
      enabled: {
        type: Boolean,
        default: false
      },
      startTime: {
        type: String,
        default: '22:00',
        match: /^([01]\d|2[0-3]):([0-5]\d)$/
      },
      endTime: {
        type: String,
        default: '08:00',
        match: /^([01]\d|2[0-3]):([0-5]\d)$/
      },
      timezone: {
        type: String,
        default: 'Asia/Kolkata'
      }
    },
    
    // Frequency limits
    frequency: {
      maxPerDay: {
        type: Number,
        default: 50,
        min: [1, 'Max per day must be at least 1']
      },
      maxPerHour: {
        type: Number,
        default: 10,
        min: [1, 'Max per hour must be at least 1']
      }
    },
    
    // Device tokens
    fcmTokens: [{
      type: String,
      trim: true
    }],
    emailVerified: {
      type: Boolean,
      default: false
    },
    phoneVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ==================== INDEXES ====================

notificationPreferenceSchema.index({ user: 1 }, { unique: true });

// ==================== INSTANCE METHODS ====================

/**
 * Check if notification can be sent
 */
notificationPreferenceSchema.methods.canSendNotification = function(
  type: string,
  channel: string
): boolean {
  // Check if channel is globally enabled
  const channelKey = channel.replace('-', '') as keyof typeof this.channels;
  if (!this.channels[channelKey]) {
    return false;
  }
  
  // Check if type is enabled
  const typePreference = this.types[type as keyof typeof this.types];
  if (!typePreference || !typePreference.enabled) {
    return false;
  }
  
  // Check if channel is enabled for this type
  if (typePreference.channels.length > 0 && !typePreference.channels.includes(channel)) {
    return false;
  }
  
  // Check quiet hours
  if (this.isInQuietHours() && channel !== 'in-app') {
    return false;
  }
  
  return true;
};

/**
 * Check if current time is in quiet hours
 */
notificationPreferenceSchema.methods.isInQuietHours = function(): boolean {
  if (!this.quietHours.enabled) {
    return false;
  }
  
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const start = this.quietHours.startTime;
  const end = this.quietHours.endTime;
  
  // Handle overnight quiet hours (e.g., 22:00 to 08:00)
  if (start > end) {
    return currentTime >= start || currentTime <= end;
  }
  
  return currentTime >= start && currentTime <= end;
};

/**
 * Add FCM token
 */
notificationPreferenceSchema.methods.addFCMToken = async function(token: string): Promise<any> {
  if (!this.fcmTokens.includes(token)) {
    this.fcmTokens.push(token);
    await this.save();
  }
  return this as any;
};

/**
 * Remove FCM token
 */
notificationPreferenceSchema.methods.removeFCMToken = async function(token: string): Promise<any> {
  this.fcmTokens = this.fcmTokens.filter((t: string) => t !== token);
  await this.save();
  return this as any;
};

// ==================== STATIC METHODS ====================

/**
 * Get or create preferences for a user
 */
notificationPreferenceSchema.statics.getOrCreatePreferences = async function(
  userId: mongoose.Types.ObjectId
): Promise<INotificationPreference> {
  let preferences = await this.findOne({ user: userId });
  
  if (!preferences) {
    preferences = await this.create({
      user: userId,
      channels: {
        inApp: true,
        email: true,
        sms: false,
        push: true
      },
      types: {
        order: {
          enabled: true,
          channels: ['in-app', 'email', 'push']
        },
        product: {
          enabled: true,
          channels: ['in-app', 'push']
        },
        promotion: {
          enabled: true,
          channels: ['in-app', 'email']
        },
        account: {
          enabled: true,
          channels: ['in-app', 'email']
        },
        system: {
          enabled: true,
          channels: ['in-app', 'email']
        }
      }
    });
  }
  
  return preferences;
};

// ==================== MODEL ====================

const NotificationPreference = mongoose.model<INotificationPreference, INotificationPreferenceModel>(
  'NotificationPreference',
  notificationPreferenceSchema
);

export default NotificationPreference;
