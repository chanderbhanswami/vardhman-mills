import mongoose, { Document, Model, Schema } from 'mongoose';

// ==================== INTERFACES ====================

export interface IAddress extends Document {
  user: mongoose.Types.ObjectId;
  type: 'shipping' | 'billing' | 'both';
  isDefault: boolean;
  
  // Personal Info
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  alternatePhone?: string;
  
  // Address Details
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  
  // Verification & Metadata
  isVerified: boolean;
  verifiedAt?: Date;
  verificationMethod?: 'manual' | 'api' | 'otp';
  
  // Usage Tracking
  lastUsedAt?: Date;
  usageCount: number;
  
  // Additional Info
  label?: string; // e.g., "Home", "Office", "Parents' House"
  deliveryInstructions?: string;
  
  // Location (for future use - delivery radius, nearby stores, etc.)
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  
  // Soft Delete
  isActive: boolean;
  deletedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

interface IAddressMethods {
  /**
   * Format address as a single string
   */
  getFullAddress(): string;
  
  /**
   * Mark address as used
   */
  markAsUsed(): Promise<IAddress>;
  
  /**
   * Verify address
   */
  verify(method: 'manual' | 'api' | 'otp'): Promise<IAddress>;
  
  /**
   * Get formatted name
   */
  getFullName(): string;
}

interface IAddressModel extends Model<IAddress, {}, IAddressMethods> {
  /**
   * Get user's default address
   */
  getDefaultAddress(userId: mongoose.Types.ObjectId, type?: 'shipping' | 'billing'): Promise<IAddress | null>;
  
  /**
   * Set address as default (and unset others)
   */
  setAsDefault(addressId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<IAddress>;
  
  /**
   * Get user's addresses by type
   */
  getUserAddresses(userId: mongoose.Types.ObjectId, type?: string, includeInactive?: boolean): Promise<IAddress[]>;
  
  /**
   * Validate pincode format for country
   */
  validatePincode(pincode: string, country: string): boolean;
  
  /**
   * Get most used addresses
   */
  getMostUsedAddresses(userId: mongoose.Types.ObjectId, limit?: number): Promise<IAddress[]>;
}

// ==================== SCHEMA ====================

const addressSchema = new Schema<IAddress, IAddressModel, IAddressMethods>(
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
        values: ['shipping', 'billing', 'both'],
        message: 'Type must be either shipping, billing, or both'
      },
      default: 'both'
    },
    
    isDefault: {
      type: Boolean,
      default: false,
      index: true
    },
    
    // Personal Info
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      validate: {
        validator: function(v: string) {
          return /^[0-9]{10}$/.test(v.replace(/\D/g, ''));
        },
        message: 'Please provide a valid 10-digit phone number'
      }
    },
    
    alternatePhone: {
      type: String,
      validate: {
        validator: function(v: string) {
          if (!v) return true;
          return /^[0-9]{10}$/.test(v.replace(/\D/g, ''));
        },
        message: 'Please provide a valid 10-digit alternate phone number'
      }
    },
    
    // Address Details
    addressLine1: {
      type: String,
      required: [true, 'Address line 1 is required'],
      trim: true,
      maxlength: [200, 'Address line 1 cannot exceed 200 characters']
    },
    
    addressLine2: {
      type: String,
      trim: true,
      maxlength: [200, 'Address line 2 cannot exceed 200 characters']
    },
    
    landmark: {
      type: String,
      trim: true,
      maxlength: [100, 'Landmark cannot exceed 100 characters']
    },
    
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [100, 'City cannot exceed 100 characters'],
      index: true
    },
    
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      maxlength: [100, 'State cannot exceed 100 characters'],
      index: true
    },
    
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      default: 'India',
      maxlength: [100, 'Country cannot exceed 100 characters']
    },
    
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true,
      validate: {
        validator: function(v: string) {
          // Basic validation - 6 digits for India, customize as needed
          return /^[0-9]{6}$/.test(v);
        },
        message: 'Please provide a valid 6-digit pincode'
      },
      index: true
    },
    
    // Verification & Metadata
    isVerified: {
      type: Boolean,
      default: false,
      index: true
    },
    
    verifiedAt: Date,
    
    verificationMethod: {
      type: String,
      enum: ['manual', 'api', 'otp']
    },
    
    // Usage Tracking
    lastUsedAt: Date,
    
    usageCount: {
      type: Number,
      default: 0,
      min: 0
    },
    
    // Additional Info
    label: {
      type: String,
      trim: true,
      maxlength: [50, 'Label cannot exceed 50 characters']
    },
    
    deliveryInstructions: {
      type: String,
      trim: true,
      maxlength: [500, 'Delivery instructions cannot exceed 500 characters']
    },
    
    // Location
    coordinates: {
      latitude: {
        type: Number,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180
      }
    },
    
    // Soft Delete
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    
    deletedAt: Date
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ==================== INDEXES ====================

addressSchema.index({ user: 1, isDefault: 1 });
addressSchema.index({ user: 1, type: 1, isActive: 1 });
addressSchema.index({ user: 1, usageCount: -1 });
addressSchema.index({ pincode: 1, city: 1 });

// ==================== VIRTUALS ====================

addressSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

addressSchema.virtual('fullAddress').get(function() {
  const parts = [
    this.addressLine1,
    this.addressLine2,
    this.landmark,
    this.city,
    this.state,
    this.country,
    this.pincode
  ].filter(Boolean);
  
  return parts.join(', ');
});

// ==================== INSTANCE METHODS ====================

addressSchema.methods.getFullAddress = function(): string {
  const parts = [
    this.addressLine1,
    this.addressLine2,
    this.landmark,
    this.city,
    this.state,
    this.country,
    this.pincode
  ].filter(Boolean);
  
  return parts.join(', ');
};

addressSchema.methods.getFullName = function(): string {
  return `${this.firstName} ${this.lastName}`;
};

addressSchema.methods.markAsUsed = async function(): Promise<IAddress> {
  this.lastUsedAt = new Date();
  this.usageCount += 1;
  await this.save();
  return this;
};

addressSchema.methods.verify = async function(method: 'manual' | 'api' | 'otp'): Promise<IAddress> {
  this.isVerified = true;
  this.verifiedAt = new Date();
  this.verificationMethod = method;
  await this.save();
  return this;
};

// ==================== STATIC METHODS ====================

addressSchema.statics.getDefaultAddress = async function(
  userId: mongoose.Types.ObjectId,
  type?: 'shipping' | 'billing'
): Promise<IAddress | null> {
  const query: any = {
    user: userId,
    isDefault: true,
    isActive: true
  };
  
  if (type) {
    query.$or = [
      { type: type },
      { type: 'both' }
    ];
  }
  
  return this.findOne(query);
};

addressSchema.statics.setAsDefault = async function(
  addressId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId
): Promise<IAddress> {
  // Start session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Get the address to be set as default
    const address = await this.findOne({ _id: addressId, user: userId }).session(session);
    
    if (!address) {
      throw new Error('Address not found');
    }
    
    // Unset all other default addresses of same type for this user
    const query: any = {
      user: userId,
      _id: { $ne: addressId },
      isDefault: true,
      isActive: true
    };
    
    if (address.type !== 'both') {
      query.$or = [
        { type: address.type },
        { type: 'both' }
      ];
    }
    
    await this.updateMany(
      query,
      { $set: { isDefault: false } },
      { session }
    );
    
    // Set this address as default
    address.isDefault = true;
    await address.save({ session });
    
    await session.commitTransaction();
    return address;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

addressSchema.statics.getUserAddresses = async function(
  userId: mongoose.Types.ObjectId,
  type?: string,
  includeInactive = false
): Promise<IAddress[]> {
  const query: any = { user: userId };
  
  if (!includeInactive) {
    query.isActive = true;
  }
  
  if (type && type !== 'all') {
    query.$or = [
      { type: type },
      { type: 'both' }
    ];
  }
  
  return this.find(query).sort({ isDefault: -1, lastUsedAt: -1, createdAt: -1 });
};

addressSchema.statics.validatePincode = function(pincode: string, country: string): boolean {
  // Customize validation based on country
  if (country.toLowerCase() === 'india') {
    return /^[0-9]{6}$/.test(pincode);
  }
  
  // Add more country-specific validations as needed
  return true; // Default to true for other countries
};

addressSchema.statics.getMostUsedAddresses = async function(
  userId: mongoose.Types.ObjectId,
  limit = 5
): Promise<IAddress[]> {
  return this.find({
    user: userId,
    isActive: true,
    usageCount: { $gt: 0 }
  })
  .sort({ usageCount: -1, lastUsedAt: -1 })
  .limit(limit);
};

// ==================== MIDDLEWARE ====================

// Before save - ensure only one default address per type
addressSchema.pre('save', async function(next) {
  if (this.isModified('isDefault') && this.isDefault) {
    // Unset other default addresses
    const query: any = {
      user: this.user,
      _id: { $ne: this._id },
      isDefault: true,
      isActive: true
    };
    
    if (this.type !== 'both') {
      query.$or = [
        { type: this.type },
        { type: 'both' }
      ];
    }
    
    await Address.updateMany(query, { $set: { isDefault: false } });
  }
  
  next();
});

// Soft delete - use deleteOne middleware instead of deprecated 'remove'
addressSchema.pre('deleteOne', { document: true, query: false }, function(this: IAddress) {
  this.isActive = false;
  this.deletedAt = new Date();
});

// Also handle findOneAndDelete
addressSchema.pre('findOneAndDelete', async function() {
  const docToDelete = await this.model.findOne(this.getFilter());
  if (docToDelete) {
    docToDelete.isActive = false;
    docToDelete.deletedAt = new Date();
    await docToDelete.save();
  }
});

// ==================== MODEL ====================

const Address = mongoose.model<IAddress, IAddressModel>('Address', addressSchema);

export default Address;
