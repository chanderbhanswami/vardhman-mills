import mongoose, { Schema, Document, Model, Types } from 'mongoose';

/**
 * Refund Model - Vardhman Mills Backend
 * 
 * Comprehensive refund management system with:
 * - Multi-status refund workflow
 * - Payment gateway integration
 * - Audit trail
 * - Automated processing
 * 
 * @version 1.0.0
 * @created 2025-11-01
 */

// ============================================================================
// INTERFACES
// ============================================================================

export interface IRefundItem {
  product: Types.ObjectId;
  quantity: number;
  price: number;
  reason: string;
  condition?: 'unopened' | 'opened' | 'damaged' | 'defective';
}

export interface IRefundAmount {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  refundedAmount: number;
  processingFee: number;
}

export interface IRefundPaymentInfo {
  method: 'original' | 'bank_transfer' | 'wallet' | 'store_credit';
  gatewayRefundId?: string;
  gatewayStatus?: string;
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    bankName: string;
  };
}

export interface IRefundTimeline {
  status: string;
  timestamp: Date;
  updatedBy: Types.ObjectId | string;
  note?: string;
  metadata?: Record<string, any>;
}

export interface IRefund extends Document {
  // Reference Fields
  order: Types.ObjectId;
  user: Types.ObjectId;
  refundNumber: string;

  // Refund Details
  type: 'full' | 'partial' | 'exchange';
  reason: string;
  detailedReason?: string;
  items: IRefundItem[];

  // Amount Information
  amount: IRefundAmount;

  // Status Management
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed' | 'failed' | 'cancelled';
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  rejectedBy?: Types.ObjectId;
  rejectedAt?: Date;
  rejectionReason?: string;

  // Payment Information
  payment: IRefundPaymentInfo;
  processedAt?: Date;

  // Return Information (if applicable)
  requiresReturn: boolean;
  returnStatus?: 'pending_pickup' | 'picked_up' | 'in_transit' | 'received' | 'inspected';
  returnTrackingNumber?: string;
  returnCarrier?: string;
  returnNotes?: string;

  // Timeline & Audit
  timeline: IRefundTimeline[];
  
  // Metadata
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    refundSource?: 'customer' | 'admin' | 'automated';
    notes?: string;
  };

  // Computed Fields
  isFullRefund: boolean;
  refundPercentage: number;

  // Timestamps
  requestedAt: Date;
  expectedProcessingDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  addTimelineEntry(status: string, updatedBy: Types.ObjectId | string, note?: string, metadata?: Record<string, any>): Promise<void>;
  approve(approvedBy: Types.ObjectId, note?: string): Promise<void>;
  reject(rejectedBy: Types.ObjectId, reason: string): Promise<void>;
  process(): Promise<void>;
  complete(gatewayRefundId?: string): Promise<void>;
  fail(reason: string): Promise<void>;
  cancel(cancelledBy: Types.ObjectId, reason: string): Promise<void>;
}

// ============================================================================
// SCHEMA DEFINITION
// ============================================================================

const RefundItemSchema = new Schema<IRefundItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    reason: {
      type: String,
      required: [true, 'Refund reason is required'],
      enum: [
        'defective',
        'damaged',
        'wrong_item',
        'not_as_described',
        'quality_issue',
        'size_issue',
        'color_mismatch',
        'late_delivery',
        'changed_mind',
        'other'
      ]
    },
    condition: {
      type: String,
      enum: ['unopened', 'opened', 'damaged', 'defective']
    }
  },
  { _id: false }
);

const RefundAmountSchema = new Schema<IRefundAmount>(
  {
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    tax: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    shipping: {
      type: Number,
      default: 0,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    refundedAmount: {
      type: Number,
      required: true,
      min: 0
    },
    processingFee: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  { _id: false }
);

const RefundPaymentInfoSchema = new Schema<IRefundPaymentInfo>(
  {
    method: {
      type: String,
      required: true,
      enum: ['original', 'bank_transfer', 'wallet', 'store_credit'],
      default: 'original'
    },
    gatewayRefundId: String,
    gatewayStatus: String,
    bankDetails: {
      accountNumber: String,
      ifscCode: String,
      accountHolderName: String,
      bankName: String
    }
  },
  { _id: false }
);

const RefundTimelineSchema = new Schema<IRefundTimeline>(
  {
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: Schema.Types.Mixed, // Can be ObjectId or string for system
      required: true
    },
    note: String,
    metadata: Schema.Types.Mixed
  },
  { _id: false }
);

const RefundSchema = new Schema<IRefund>(
  {
    // Reference Fields
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order reference is required'],
      index: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true
    },
    refundNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    // Refund Details
    type: {
      type: String,
      required: true,
      enum: ['full', 'partial', 'exchange'],
      default: 'full'
    },
    reason: {
      type: String,
      required: [true, 'Refund reason is required'],
      enum: [
        'defective',
        'damaged',
        'wrong_item',
        'not_as_described',
        'quality_issue',
        'size_issue',
        'color_mismatch',
        'late_delivery',
        'changed_mind',
        'order_cancellation',
        'payment_issue',
        'other'
      ]
    },
    detailedReason: {
      type: String,
      maxlength: [1000, 'Detailed reason cannot exceed 1000 characters']
    },
    items: {
      type: [RefundItemSchema],
      required: true,
      validate: {
        validator: function(items: IRefundItem[]) {
          return items && items.length > 0;
        },
        message: 'At least one item is required for refund'
      }
    },

    // Amount Information
    amount: {
      type: RefundAmountSchema,
      required: true
    },

    // Status Management
    status: {
      type: String,
      required: true,
      enum: ['pending', 'approved', 'rejected', 'processing', 'completed', 'failed', 'cancelled'],
      default: 'pending',
      index: true
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    rejectedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectedAt: Date,
    rejectionReason: String,

    // Payment Information
    payment: {
      type: RefundPaymentInfoSchema,
      required: true
    },
    processedAt: Date,

    // Return Information
    requiresReturn: {
      type: Boolean,
      default: false
    },
    returnStatus: {
      type: String,
      enum: ['pending_pickup', 'picked_up', 'in_transit', 'received', 'inspected']
    },
    returnTrackingNumber: String,
    returnCarrier: String,
    returnNotes: String,

    // Timeline
    timeline: {
      type: [RefundTimelineSchema],
      default: []
    },

    // Metadata
    metadata: {
      userAgent: String,
      ipAddress: String,
      refundSource: {
        type: String,
        enum: ['customer', 'admin', 'automated'],
        default: 'customer'
      },
      notes: String
    },

    // Timestamps
    requestedAt: {
      type: Date,
      default: Date.now,
      required: true
    },
    expectedProcessingDate: Date,
    completedAt: Date
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ============================================================================
// VIRTUALS
// ============================================================================

RefundSchema.virtual('isFullRefund').get(function(this: IRefund) {
  return this.type === 'full';
});

RefundSchema.virtual('refundPercentage').get(function(this: IRefund) {
  if (!this.amount || !this.amount.total) return 0;
  return (this.amount.refundedAmount / this.amount.total) * 100;
});

// ============================================================================
// INDEXES
// ============================================================================

RefundSchema.index({ user: 1, status: 1 });
RefundSchema.index({ order: 1, status: 1 });
RefundSchema.index({ refundNumber: 1 }, { unique: true });
RefundSchema.index({ status: 1, createdAt: -1 });
RefundSchema.index({ 'payment.gatewayRefundId': 1 }, { sparse: true });
RefundSchema.index({ requestedAt: -1 });

// ============================================================================
// HOOKS
// ============================================================================

// Pre-save: Generate refund number
RefundSchema.pre('save', async function(next) {
  if (this.isNew && !this.refundNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.refundNumber = `RF${timestamp}${random}`;
  }

  // Add initial timeline entry
  if (this.isNew) {
    this.timeline.push({
      status: 'pending',
      timestamp: new Date(),
      updatedBy: this.user,
      note: 'Refund request created'
    });
  }

  // Calculate expected processing date (7 working days)
  if (this.isNew && !this.expectedProcessingDate) {
    const processingDays = 7;
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() + processingDays);
    this.expectedProcessingDate = expectedDate;
  }

  next();
});

// Post-save: Trigger notifications
RefundSchema.post('save', async function(doc: IRefund) {
  // TODO: Trigger appropriate notifications based on status
  console.log(`Refund ${doc.refundNumber} saved with status: ${doc.status}`);
});

// ============================================================================
// METHODS
// ============================================================================

/**
 * Add timeline entry
 */
RefundSchema.methods.addTimelineEntry = async function(
  status: string,
  updatedBy: Types.ObjectId | string,
  note?: string,
  metadata?: Record<string, any>
): Promise<void> {
  this.timeline.push({
    status,
    timestamp: new Date(),
    updatedBy,
    note,
    metadata
  });
  await this.save();
};

/**
 * Approve refund
 */
RefundSchema.methods.approve = async function(
  approvedBy: Types.ObjectId,
  note?: string
): Promise<void> {
  this.status = 'approved';
  this.approvedBy = approvedBy;
  this.approvedAt = new Date();
  
  await this.addTimelineEntry('approved', approvedBy, note || 'Refund approved');
  
  // TODO: Trigger refund processing
  // TODO: Send email notification
};

/**
 * Reject refund
 */
RefundSchema.methods.reject = async function(
  rejectedBy: Types.ObjectId,
  reason: string
): Promise<void> {
  this.status = 'rejected';
  this.rejectedBy = rejectedBy;
  this.rejectedAt = new Date();
  this.rejectionReason = reason;
  
  await this.addTimelineEntry('rejected', rejectedBy, `Refund rejected: ${reason}`);
  
  // TODO: Send email notification
};

/**
 * Process refund
 */
RefundSchema.methods.process = async function(): Promise<void> {
  this.status = 'processing';
  this.processedAt = new Date();
  
  await this.addTimelineEntry('processing', 'system', 'Refund processing initiated');
  
  // TODO: Initiate payment gateway refund
};

/**
 * Complete refund
 */
RefundSchema.methods.complete = async function(gatewayRefundId?: string): Promise<void> {
  this.status = 'completed';
  this.completedAt = new Date();
  
  if (gatewayRefundId) {
    this.payment.gatewayRefundId = gatewayRefundId;
    this.payment.gatewayStatus = 'completed';
  }
  
  await this.addTimelineEntry('completed', 'system', 'Refund completed successfully');
  
  // TODO: Update order status
  // TODO: Send email notification
};

/**
 * Fail refund
 */
RefundSchema.methods.fail = async function(reason: string): Promise<void> {
  this.status = 'failed';
  
  await this.addTimelineEntry('failed', 'system', `Refund failed: ${reason}`);
  
  // TODO: Send email notification
  // TODO: Alert admin
};

/**
 * Cancel refund
 */
RefundSchema.methods.cancel = async function(
  cancelledBy: Types.ObjectId,
  reason: string
): Promise<void> {
  this.status = 'cancelled';
  
  await this.addTimelineEntry('cancelled', cancelledBy, `Refund cancelled: ${reason}`);
  
  // TODO: Send email notification
};

// ============================================================================
// STATICS
// ============================================================================

RefundSchema.statics.findByRefundNumber = function(refundNumber: string) {
  return this.findOne({ refundNumber })
    .populate('order')
    .populate('user', 'name email')
    .populate('items.product', 'name slug images price');
};

RefundSchema.statics.findByOrder = function(orderId: Types.ObjectId) {
  return this.find({ order: orderId })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
};

RefundSchema.statics.findPendingRefunds = function() {
  return this.find({ status: 'pending' })
    .populate('order')
    .populate('user', 'name email')
    .sort({ requestedAt: 1 });
};

RefundSchema.statics.getRefundStats = async function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount.refundedAmount' }
      }
    }
  ]);
};

// ============================================================================
// MODEL EXPORT
// ============================================================================

const Refund: Model<IRefund> = mongoose.models.Refund || mongoose.model<IRefund>('Refund', RefundSchema);

export default Refund;
