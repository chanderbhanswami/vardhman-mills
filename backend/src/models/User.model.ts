import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface IUser extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  mobile?: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  avatar?: string;
  addresses: IAddress[];
  defaultAddress?: string;
  wishlist: mongoose.Types.ObjectId[];
  paymentMethods?: IPaymentMethod[];
  isActive: boolean;
  accountStatus?: 'active' | 'suspended' | 'deleted';
  deletedAt?: Date;
  deletionReason?: string;
  lastLoginAt?: Date;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  googleId?: string;
  facebookId?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  createPasswordResetToken(): string;
  createEmailVerificationToken(): string;
}

export interface IAddress {
  _id?: string;
  type: 'home' | 'work' | 'other';
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  mobile?: string;
  isDefault: boolean;
}

export interface IPaymentMethod {
  _id?: string;
  type: 'card' | 'upi' | 'netbanking';
  card?: {
    last4: string;
    brand: string;
    cardHolder: string;
    expiryMonth: number;
    expiryYear: number;
  };
  upi?: {
    vpa: string;
  };
  netbanking?: {
    bank: string;
  };
  isDefault: boolean;
  addedAt: Date;
}

const addressSchema = new Schema<IAddress>({
  type: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'home'
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  addressLine1: {
    type: String,
    required: true,
    trim: true
  },
  addressLine2: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  pincode: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    default: 'India',
    trim: true
  },
  mobile: {
    type: String,
    trim: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
});

const paymentMethodSchema = new Schema<IPaymentMethod>({
  type: {
    type: String,
    enum: ['card', 'upi', 'netbanking'],
    required: true
  },
  card: {
    last4: String,
    brand: String,
    cardHolder: String,
    expiryMonth: Number,
    expiryYear: Number
  },
  upi: {
    vpa: String
  },
  netbanking: {
    bank: String
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new Schema<IUser>({
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    minlength: 8,
    select: false
  },
  mobile: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: String
  },
  addresses: [addressSchema],
  defaultAddress: {
    type: String
  },
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  paymentMethods: [paymentMethodSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'deleted'],
    default: 'active'
  },
  deletedAt: {
    type: Date
  },
  deletionReason: {
    type: String
  },
  lastLoginAt: {
    type: Date
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  googleId: String,
  facebookId: String
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create password reset token
userSchema.methods.createPasswordResetToken = function(): string {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Create email verification token
userSchema.methods.createEmailVerificationToken = function(): string {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return verificationToken;
};

export default mongoose.model<IUser>('User', userSchema);