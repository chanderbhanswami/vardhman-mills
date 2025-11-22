import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISettings extends Document {
  category: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  isGlobal: boolean;
  userId?: mongoose.Types.ObjectId;
  description?: string;
  defaultValue?: any;
  createdAt: Date;
  updatedAt: Date;
  formattedValue: any;
}

export interface ISettingsModel extends Model<ISettings> {
  getValue(category: string, key: string, userId?: mongoose.Types.ObjectId): Promise<any>;
  setValue(category: string, key: string, value: any, options?: {
    type?: string;
    description?: string;
    userId?: mongoose.Types.ObjectId;
    isGlobal?: boolean;
  }): Promise<ISettings>;
  getCategorySettings(category: string, userId?: mongoose.Types.ObjectId): Promise<ISettings[]>;
}

const settingsSchema = new Schema<ISettings>(
  {
    category: {
      type: String,
      required: [true, 'Settings category is required'],
      enum: [
        'general',
        'profile', 
        'notifications',
        'security',
        'api',
        'localization',
        'payment',
        'shipping',
        'email',
        'store',
        'inventory',
        'analytics',
        'backup',
        'maintenance',
        'integrations'
      ]
    },
    key: {
      type: String,
      required: [true, 'Settings key is required'],
      trim: true
    },
    value: {
      type: Schema.Types.Mixed,
      required: [true, 'Settings value is required']
    },
    type: {
      type: String,
      enum: ['string', 'number', 'boolean', 'json', 'array'],
      default: 'string'
    },
    isGlobal: {
      type: Boolean,
      default: true,
      description: 'If true, applies to entire system. If false, user-specific setting'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: function() {
        return !this.isGlobal;
      }
    },
    description: {
      type: String,
      trim: true
    },
    defaultValue: {
      type: Schema.Types.Mixed
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound index for efficient queries
settingsSchema.index({ category: 1, key: 1, isGlobal: 1 });
settingsSchema.index({ category: 1, userId: 1 });

// Ensure unique settings per category/key combination
settingsSchema.index(
  { category: 1, key: 1, userId: 1 },
  { 
    unique: true,
    partialFilterExpression: { isGlobal: false }
  }
);

settingsSchema.index(
  { category: 1, key: 1 },
  { 
    unique: true,
    partialFilterExpression: { isGlobal: true }
  }
);

// Static method to get setting value
settingsSchema.statics.getValue = async function(
  category: string, 
  key: string, 
  userId?: string
) {
  let setting;
  
  // Try user-specific first if userId provided
  if (userId) {
    setting = await this.findOne({ category, key, userId, isGlobal: false });
  }
  
  // Fall back to global setting
  if (!setting) {
    setting = await this.findOne({ category, key, isGlobal: true });
  }
  
  return setting?.value || setting?.defaultValue || null;
};

// Static method to set setting value
settingsSchema.statics.setValue = async function(
  category: string,
  key: string,
  value: any,
  options: {
    userId?: string;
    type?: string;
    description?: string;
    isGlobal?: boolean;
  } = {}
) {
  const { userId, type = 'string', description, isGlobal = !userId } = options;
  
  const filter: any = { category, key, isGlobal };
  if (!isGlobal && userId) {
    filter.userId = userId;
  }
  
  return await this.findOneAndUpdate(
    filter,
    { 
      value, 
      type, 
      description,
      ...(userId && !isGlobal && { userId })
    },
    { 
      upsert: true, 
      new: true, 
      runValidators: true 
    }
  );
};

// Static method to get all settings for a category
settingsSchema.statics.getCategorySettings = async function(
  category: string,
  userId?: string
) {
  console.log('🔍 Settings.getCategorySettings called with:', { category, userId });
  const query: any = { category };
  
  if (userId) {
    // Get both user-specific and global settings
    console.log('🔍 Getting user-specific and global settings for user:', userId);
    const userSettings = await this.find({ category, userId, isGlobal: false });
    const globalSettings = await this.find({ category, isGlobal: true });
    
    console.log('🔍 Found userSettings:', userSettings.length, 'globalSettings:', globalSettings.length);
    
    // Merge settings, user-specific takes precedence
    const settingsMap = new Map();
    
    globalSettings.forEach((setting: ISettings) => {
      settingsMap.set(setting.key, setting);
    });
    
    userSettings.forEach((setting: ISettings) => {
      settingsMap.set(setting.key, setting);
    });
    
    const result = Array.from(settingsMap.values());
    console.log('🔍 Returning merged settings:', result.length);
    return result;
  } else {
    console.log('🔍 Getting global settings for category:', category);
    const result = await this.find({ category, isGlobal: true });
    console.log('🔍 Found global settings:', result.length);
    return result;
  }
};

// Virtual for formatted value based on type
settingsSchema.virtual('formattedValue').get(function() {
  switch (this.type) {
    case 'number':
      return Number(this.value);
    case 'boolean':
      return Boolean(this.value);
    case 'json':
      return typeof this.value === 'string' ? JSON.parse(this.value) : this.value;
    case 'array':
      return Array.isArray(this.value) ? this.value : [this.value];
    default:
      return String(this.value);
  }
});

const Settings = mongoose.model<ISettings, ISettingsModel>('Settings', settingsSchema);
export default Settings;
