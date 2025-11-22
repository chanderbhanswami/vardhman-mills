import mongoose, { Document, Schema } from 'mongoose';

// ==================== INTERFACES ====================

export interface INotificationTemplate extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  type: 'order' | 'product' | 'promotion' | 'account' | 'system' | 'custom';
  
  // Multi-channel content
  channels: {
    inApp?: {
      title: string;
      message: string;
      icon?: string;
      image?: string;
      link?: string;
    };
    email?: {
      subject: string;
      html: string;
      text?: string;
    };
    sms?: {
      message: string;
    };
    push?: {
      title: string;
      body: string;
      icon?: string;
      image?: string;
      badge?: number;
    };
  };
  
  // Variables
  variables: string[];
  
  // Status
  isActive: boolean;
  version: number;
  
  // Metadata
  category?: string;
  tags?: string[];
  
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  render(channel: string, variables: Record<string, any>): any;
  clone(newName: string): Promise<INotificationTemplate>;
  activate(): Promise<this>;
  deactivate(): Promise<this>;
}

export interface INotificationTemplateModel extends mongoose.Model<INotificationTemplate> {
  getActiveTemplates(): Promise<INotificationTemplate[]>;
  getByType(type: string): Promise<INotificationTemplate[]>;
  getByCategory(category: string): Promise<INotificationTemplate[]>;
}

// ==================== SCHEMA ====================

const notificationTemplateSchema = new Schema<INotificationTemplate>(
  {
    name: {
      type: String,
      required: [true, 'Template name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Template name cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    type: {
      type: String,
      required: [true, 'Template type is required'],
      enum: {
        values: ['order', 'product', 'promotion', 'account', 'system', 'custom'],
        message: '{VALUE} is not a valid template type'
      },
      index: true
    },
    
    // Multi-channel content
    channels: {
      inApp: {
        title: {
          type: String,
          maxlength: [200, 'In-app title cannot exceed 200 characters']
        },
        message: {
          type: String,
          maxlength: [1000, 'In-app message cannot exceed 1000 characters']
        },
        icon: String,
        image: String,
        link: String
      },
      email: {
        subject: {
          type: String,
          maxlength: [200, 'Email subject cannot exceed 200 characters']
        },
        html: String,
        text: String
      },
      sms: {
        message: {
          type: String,
          maxlength: [160, 'SMS message cannot exceed 160 characters']
        }
      },
      push: {
        title: {
          type: String,
          maxlength: [65, 'Push title cannot exceed 65 characters']
        },
        body: {
          type: String,
          maxlength: [240, 'Push body cannot exceed 240 characters']
        },
        icon: String,
        image: String,
        badge: Number
      }
    },
    
    // Variables
    variables: [{
      type: String,
      trim: true
    }],
    
    // Status
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    version: {
      type: Number,
      default: 1,
      min: [1, 'Version must be at least 1']
    },
    
    // Metadata
    category: {
      type: String,
      trim: true,
      index: true
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ==================== INDEXES ====================

notificationTemplateSchema.index({ type: 1, isActive: 1 });
notificationTemplateSchema.index({ category: 1, isActive: 1 });
notificationTemplateSchema.index({ tags: 1 });

// ==================== INSTANCE METHODS ====================

/**
 * Render template with variables
 */
notificationTemplateSchema.methods.render = function(
  channel: string,
  variables: Record<string, any> = {}
): any {
  const channelKey = channel.replace('-', '') as keyof typeof this.channels;
  const content = this.channels[channelKey];
  
  if (!content) {
    throw new Error(`Channel ${channel} not configured for this template`);
  }
  
  // Replace variables in content
  const replaceVariables = (text: string): string => {
    return text.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
      return variables[variable] !== undefined ? String(variables[variable]) : match;
    });
  };
  
  // Clone content to avoid modifying original
  const rendered = JSON.parse(JSON.stringify(content));
  
  // Replace variables based on channel
  if (channelKey === 'inApp') {
    if (rendered.title) rendered.title = replaceVariables(rendered.title);
    if (rendered.message) rendered.message = replaceVariables(rendered.message);
    if (rendered.link) rendered.link = replaceVariables(rendered.link);
  } else if (channelKey === 'email') {
    if (rendered.subject) rendered.subject = replaceVariables(rendered.subject);
    if (rendered.html) rendered.html = replaceVariables(rendered.html);
    if (rendered.text) rendered.text = replaceVariables(rendered.text);
  } else if (channelKey === 'sms') {
    if (rendered.message) rendered.message = replaceVariables(rendered.message);
  } else if (channelKey === 'push') {
    if (rendered.title) rendered.title = replaceVariables(rendered.title);
    if (rendered.body) rendered.body = replaceVariables(rendered.body);
  }
  
  return rendered;
};

/**
 * Clone template with new name
 */
notificationTemplateSchema.methods.clone = async function(newName: string): Promise<INotificationTemplate> {
  const cloned = new (this.constructor as any)({
    name: newName,
    description: `Cloned from ${this.name}`,
    type: this.type,
    channels: this.channels,
    variables: this.variables,
    category: this.category,
    tags: this.tags,
    isActive: false,
    version: 1
  });
  
  return await cloned.save();
};

/**
 * Activate template
 */
notificationTemplateSchema.methods.activate = async function(): Promise<any> {
  this.isActive = true;
  await this.save();
  return this as any;
};

/**
 * Deactivate template
 */
notificationTemplateSchema.methods.deactivate = async function(): Promise<any> {
  this.isActive = false;
  await this.save();
  return this as any;
};

// ==================== STATIC METHODS ====================

/**
 * Get all active templates
 */
notificationTemplateSchema.statics.getActiveTemplates = async function(): Promise<INotificationTemplate[]> {
  return await this.find({ isActive: true })
    .sort({ type: 1, name: 1 })
    .lean();
};

/**
 * Get templates by type
 */
notificationTemplateSchema.statics.getByType = async function(type: string): Promise<INotificationTemplate[]> {
  return await this.find({ type, isActive: true })
    .sort({ name: 1 })
    .lean();
};

/**
 * Get templates by category
 */
notificationTemplateSchema.statics.getByCategory = async function(category: string): Promise<INotificationTemplate[]> {
  return await this.find({ category, isActive: true })
    .sort({ name: 1 })
    .lean();
};

// ==================== VIRTUALS ====================

/**
 * Get available channels
 */
notificationTemplateSchema.virtual('availableChannels').get(function() {
  const channels: string[] = [];
  
  if (this.channels.inApp?.title && this.channels.inApp?.message) {
    channels.push('in-app');
  }
  if (this.channels.email?.subject && this.channels.email?.html) {
    channels.push('email');
  }
  if (this.channels.sms?.message) {
    channels.push('sms');
  }
  if (this.channels.push?.title && this.channels.push?.body) {
    channels.push('push');
  }
  
  return channels;
});

// ==================== MODEL ====================

const NotificationTemplate = mongoose.model<INotificationTemplate, INotificationTemplateModel>(
  'NotificationTemplate',
  notificationTemplateSchema
);

export default NotificationTemplate;
