import mongoose, { Document, Schema } from 'mongoose';

// Enums
export enum GiftCardStatus {
  ACTIVE = 'active',
  REDEEMED = 'redeemed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  PENDING = 'pending'
}

export enum GiftCardType {
  DIGITAL = 'digital',
  PHYSICAL = 'physical',
  HYBRID = 'hybrid'
}

export enum DeliveryMethod {
  EMAIL = 'email',
  SMS = 'sms',
  PHYSICAL_MAIL = 'physical_mail',
  IN_STORE_PICKUP = 'in_store_pickup',
  DIGITAL_DOWNLOAD = 'digital_download'
}

export enum TransactionType {
  PURCHASE = 'purchase',
  REDEMPTION = 'redemption',
  REFUND = 'refund',
  ADJUSTMENT = 'adjustment'
}

// Interfaces
export interface IGiftCardTransaction {
  type: TransactionType;
  amount: number;
  orderId?: mongoose.Types.ObjectId;
  description?: string;
  timestamp: Date;
  userId?: mongoose.Types.ObjectId;
  ipAddress?: string;
  userAgent?: string;
}

export interface IGiftCardDesign {
  designId: string;
  templateId?: string;
  imageUrl: string;
  backgroundColor?: string;
  textColor?: string;
  customization?: Record<string, any>;
}

export interface IGiftCard extends Document {
  code: string; // Unique gift card code
  status: GiftCardStatus;
  type: GiftCardType;
  
  // Amounts
  originalAmount: number;
  currentBalance: number;
  currency: string;
  
  // Parties
  purchasedBy: mongoose.Types.ObjectId; // User who purchased
  recipientEmail?: string;
  recipientName?: string;
  recipientMobile?: string;
  senderName: string;
  senderEmail: string;
  
  // Design & Personalization
  design: IGiftCardDesign;
  personalMessage?: string;
  
  // Delivery
  deliveryMethod: DeliveryMethod;
  deliveryDate?: Date;
  deliveredAt?: Date;
  isPhysical: boolean;
  shippingAddress?: string;
  trackingNumber?: string;
  
  // Validity
  purchasedAt: Date;
  activatedAt?: Date;
  expiresAt?: Date;
  lastUsedAt?: Date;
  
  // Transactions
  transactions: IGiftCardTransaction[];
  totalRedeemed: number;
  redemptionCount: number;
  
  // Restrictions
  minOrderAmount?: number;
  applicableCategories?: mongoose.Types.ObjectId[];
  applicableProducts?: mongoose.Types.ObjectId[];
  restrictions?: string[];
  
  // Metadata
  isRefundable: boolean;
  isTransferable: boolean;
  maxRedemptionsPerDay?: number;
  notes?: string;
  
  // Payment
  paymentId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual properties
  isValid: boolean;
  isExpired: boolean;
  remainingAmount: number;
  
  // Methods
  canRedeem(amount: number, userId?: mongoose.Types.ObjectId): Promise<boolean>;
  redeem(amount: number, orderId: mongoose.Types.ObjectId, userId?: mongoose.Types.ObjectId, description?: string): Promise<void>;
  checkBalance(): number;
  addTransaction(transaction: IGiftCardTransaction): Promise<void>;
}

// Schema
const giftCardTransactionSchema = new Schema<IGiftCardTransaction>({
  type: {
    type: String,
    enum: Object.values(TransactionType),
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  description: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ipAddress: String,
  userAgent: String
}, { _id: false });

const giftCardDesignSchema = new Schema<IGiftCardDesign>({
  designId: {
    type: String,
    required: true
  },
  templateId: String,
  imageUrl: {
    type: String,
    required: true
  },
  backgroundColor: String,
  textColor: String,
  customization: Schema.Types.Mixed
}, { _id: false });

const giftCardSchema = new Schema<IGiftCard>({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    minlength: 10,
    maxlength: 20
  },
  status: {
    type: String,
    enum: Object.values(GiftCardStatus),
    default: GiftCardStatus.PENDING
  },
  type: {
    type: String,
    enum: Object.values(GiftCardType),
    default: GiftCardType.DIGITAL
  },
  originalAmount: {
    type: Number,
    required: true,
    min: 100,
    max: 50000
  },
  currentBalance: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  purchasedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientEmail: {
    type: String,
    lowercase: true,
    trim: true
  },
  recipientName: {
    type: String,
    trim: true
  },
  recipientMobile: {
    type: String,
    trim: true
  },
  senderName: {
    type: String,
    required: true,
    trim: true
  },
  senderEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  design: {
    type: giftCardDesignSchema,
    required: true
  },
  personalMessage: {
    type: String,
    maxlength: 500
  },
  deliveryMethod: {
    type: String,
    enum: Object.values(DeliveryMethod),
    required: true
  },
  deliveryDate: Date,
  deliveredAt: Date,
  isPhysical: {
    type: Boolean,
    default: false
  },
  shippingAddress: String,
  trackingNumber: String,
  purchasedAt: {
    type: Date,
    default: Date.now
  },
  activatedAt: Date,
  expiresAt: Date,
  lastUsedAt: Date,
  transactions: {
    type: [giftCardTransactionSchema],
    default: []
  },
  totalRedeemed: {
    type: Number,
    default: 0,
    min: 0
  },
  redemptionCount: {
    type: Number,
    default: 0,
    min: 0
  },
  minOrderAmount: {
    type: Number,
    min: 0
  },
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  restrictions: [String],
  isRefundable: {
    type: Boolean,
    default: false
  },
  isTransferable: {
    type: Boolean,
    default: true
  },
  maxRedemptionsPerDay: Number,
  notes: String,
  paymentId: String,
  razorpayOrderId: String,
  razorpayPaymentId: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
giftCardSchema.index({ code: 1 }, { unique: true });
giftCardSchema.index({ purchasedBy: 1, status: 1 });
giftCardSchema.index({ recipientEmail: 1 });
giftCardSchema.index({ status: 1, expiresAt: 1 });
giftCardSchema.index({ createdAt: -1 });

// Virtuals
giftCardSchema.virtual('isValid').get(function(this: IGiftCard) {
  if (this.status !== GiftCardStatus.ACTIVE) return false;
  if (this.currentBalance <= 0) return false;
  if (this.expiresAt && new Date() > this.expiresAt) return false;
  return true;
});

giftCardSchema.virtual('isExpired').get(function(this: IGiftCard) {
  return this.expiresAt ? new Date() > this.expiresAt : false;
});

giftCardSchema.virtual('remainingAmount').get(function(this: IGiftCard) {
  return this.currentBalance;
});

// Methods
giftCardSchema.methods.canRedeem = async function(
  this: IGiftCard,
  amount: number,
  userId?: mongoose.Types.ObjectId
): Promise<boolean> {
  // Check if gift card is valid
  if (!this.isValid) return false;
  
  // Check if amount is available
  if (amount > this.currentBalance) return false;
  
  // Check minimum order amount
  if (this.minOrderAmount && amount < this.minOrderAmount) return false;
  
  // Check daily redemption limit
  if (this.maxRedemptionsPerDay) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayRedemptions = this.transactions.filter(t => 
      t.type === TransactionType.REDEMPTION &&
      t.timestamp >= today
    ).length;
    
    if (todayRedemptions >= this.maxRedemptionsPerDay) return false;
  }
  
  return true;
};

giftCardSchema.methods.redeem = async function(
  this: IGiftCard,
  amount: number,
  orderId: mongoose.Types.ObjectId,
  userId?: mongoose.Types.ObjectId,
  description?: string
): Promise<void> {
  const canRedeem = await this.canRedeem(amount, userId);
  
  if (!canRedeem) {
    throw new Error('Cannot redeem gift card');
  }
  
  // Add transaction
  const transaction: IGiftCardTransaction = {
    type: TransactionType.REDEMPTION,
    amount: -amount, // Negative for redemption
    orderId,
    userId,
    description: description || 'Gift card redemption',
    timestamp: new Date()
  };
  
  this.transactions.push(transaction);
  this.currentBalance -= amount;
  this.totalRedeemed += amount;
  this.redemptionCount += 1;
  this.lastUsedAt = new Date();
  
  // Update status if fully redeemed
  if (this.currentBalance === 0) {
    this.status = GiftCardStatus.REDEEMED;
  }
  
  await this.save();
};

giftCardSchema.methods.checkBalance = function(this: IGiftCard): number {
  return this.currentBalance;
};

giftCardSchema.methods.addTransaction = async function(
  this: IGiftCard,
  transaction: IGiftCardTransaction
): Promise<void> {
  this.transactions.push(transaction);
  
  // Update balance based on transaction type
  if (transaction.type === TransactionType.REDEMPTION) {
    this.currentBalance += transaction.amount; // amount is negative for redemptions
    this.totalRedeemed += Math.abs(transaction.amount);
    this.redemptionCount += 1;
  } else if (transaction.type === TransactionType.REFUND) {
    this.currentBalance += Math.abs(transaction.amount);
    this.totalRedeemed -= Math.abs(transaction.amount);
  }
  
  await this.save();
};

// Static methods
giftCardSchema.statics.generateUniqueCode = async function(prefix = 'GC'): Promise<string> {
  let code: string;
  let exists = true;
  
  while (exists) {
    const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    code = `${prefix}${timestamp}${randomPart}`.substring(0, 16);
    
    const existing = await this.findOne({ code });
    exists = !!existing;
  }
  
  return code!;
};

// Hooks
giftCardSchema.pre('save', function(next) {
  // Set activated date when status changes to active
  if (this.isModified('status') && this.status === GiftCardStatus.ACTIVE && !this.activatedAt) {
    this.activatedAt = new Date();
  }
  
  // Set expired status if past expiry date
  if (this.expiresAt && new Date() > this.expiresAt && this.status === GiftCardStatus.ACTIVE) {
    this.status = GiftCardStatus.EXPIRED;
  }
  
  // Ensure current balance doesn't exceed original amount
  if (this.currentBalance > this.originalAmount) {
    this.currentBalance = this.originalAmount;
  }
  
  next();
});

const GiftCard = mongoose.model<IGiftCard>('GiftCard', giftCardSchema);
export default GiftCard;
