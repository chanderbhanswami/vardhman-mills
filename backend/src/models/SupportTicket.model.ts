import mongoose, { Document, Schema, Model } from 'mongoose';

// ==================== INTERFACES ====================

export interface ISupportTicketMessage {
  _id: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  senderType: 'user' | 'admin';
  message: string;
  attachments?: string[];
  isInternal: boolean;
  createdAt: Date;
}

export interface ISupportTicket extends Document {
  _id: mongoose.Types.ObjectId;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'waiting-customer' | 'resolved' | 'closed';
  user: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  messages: ISupportTicketMessage[];
  attachments: string[];
  tags: string[];
  relatedOrder?: mongoose.Types.ObjectId;
  relatedProduct?: mongoose.Types.ObjectId;
  satisfactionRating?: number;
  satisfactionFeedback?: string;
  resolvedAt?: Date;
  closedAt?: Date;
  firstResponseAt?: Date;
  lastResponseAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Virtuals
  responseTime?: number;
  resolutionTime?: number;
  isOverdue: boolean;

  // Instance Methods
  addMessage(senderId: mongoose.Types.ObjectId, senderType: 'user' | 'admin', message: string, attachments?: string[], isInternal?: boolean): Promise<this>;
  assignToAgent(agentId: mongoose.Types.ObjectId): Promise<this>;
  changeStatus(newStatus: string): Promise<this>;
  changePriority(newPriority: string): Promise<this>;
  resolve(): Promise<this>;
  close(): Promise<this>;
  reopen(): Promise<this>;
  rateSatisfaction(rating: number, feedback?: string): Promise<this>;
}

export interface ISupportTicketModel extends Model<ISupportTicket> {
  // Static Methods
  generateTicketNumber(): Promise<string>;
  getByUser(userId: string): Promise<ISupportTicket[]>;
  getByStatus(status: string): Promise<ISupportTicket[]>;
  getByPriority(priority: string): Promise<ISupportTicket[]>;
  getByCategory(category: string): Promise<ISupportTicket[]>;
  getAssignedToAgent(agentId: string): Promise<ISupportTicket[]>;
  getOverdueTickets(): Promise<ISupportTicket[]>;
  getTicketStats(startDate?: Date, endDate?: Date): Promise<any>;
}

// ==================== MESSAGE SCHEMA ====================

const messageSchema = new Schema<ISupportTicketMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    senderType: {
      type: String,
      enum: ['user', 'admin'],
      required: true
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [5000, 'Message cannot exceed 5000 characters']
    },
    attachments: [
      {
        type: String
      }
    ],
    isInternal: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// ==================== TICKET SCHEMA ====================

const supportTicketSchema = new Schema<ISupportTicket, ISupportTicketModel>(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'general',
          'order-issue',
          'product-inquiry',
          'shipping',
          'return-refund',
          'payment',
          'account',
          'technical',
          'complaint',
          'feedback',
          'other'
        ],
        message: '{VALUE} is not a valid category'
      },
      default: 'general',
      index: true
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'urgent'],
        message: '{VALUE} is not a valid priority'
      },
      default: 'medium',
      index: true
    },
    status: {
      type: String,
      enum: {
        values: ['open', 'in-progress', 'waiting-customer', 'resolved', 'closed'],
        message: '{VALUE} is not a valid status'
      },
      default: 'open',
      index: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    messages: [messageSchema],
    attachments: [
      {
        type: String
      }
    ],
    tags: [
      {
        type: String,
        lowercase: true,
        trim: true
      }
    ],
    relatedOrder: {
      type: Schema.Types.ObjectId,
      ref: 'Order'
    },
    relatedProduct: {
      type: Schema.Types.ObjectId,
      ref: 'Product'
    },
    satisfactionRating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    satisfactionFeedback: {
      type: String,
      maxlength: [1000, 'Feedback cannot exceed 1000 characters']
    },
    resolvedAt: {
      type: Date
    },
    closedAt: {
      type: Date
    },
    firstResponseAt: {
      type: Date
    },
    lastResponseAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ==================== INDEXES ====================

supportTicketSchema.index({ user: 1, status: 1 });
supportTicketSchema.index({ assignedTo: 1, status: 1 });
supportTicketSchema.index({ status: 1, priority: -1, createdAt: -1 });
supportTicketSchema.index({ category: 1, status: 1 });
supportTicketSchema.index({ createdAt: -1 });
supportTicketSchema.index({ ticketNumber: 1 }, { unique: true });

// ==================== VIRTUALS ====================

/**
 * Calculate response time (first response) in hours
 */
supportTicketSchema.virtual('responseTime').get(function (this: ISupportTicket) {
  if (!this.firstResponseAt) return undefined;
  return Math.round(
    (this.firstResponseAt.getTime() - this.createdAt.getTime()) / (1000 * 60 * 60)
  );
});

/**
 * Calculate resolution time in hours
 */
supportTicketSchema.virtual('resolutionTime').get(function (this: ISupportTicket) {
  if (!this.resolvedAt) return undefined;
  return Math.round(
    (this.resolvedAt.getTime() - this.createdAt.getTime()) / (1000 * 60 * 60)
  );
});

/**
 * Check if ticket is overdue (open/in-progress for more than 48 hours)
 */
supportTicketSchema.virtual('isOverdue').get(function (this: ISupportTicket) {
  if (this.status === 'resolved' || this.status === 'closed') {
    return false;
  }
  const hoursOpen = (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60);
  const threshold = this.priority === 'urgent' ? 4 : this.priority === 'high' ? 12 : 48;
  return hoursOpen > threshold;
});

// ==================== INSTANCE METHODS ====================

/**
 * Add a message to the ticket
 */
supportTicketSchema.methods.addMessage = async function (
  senderId: mongoose.Types.ObjectId,
  senderType: 'user' | 'admin',
  message: string,
  attachments: string[] = [],
  isInternal: boolean = false
): Promise<ISupportTicket> {
  this.messages.push({
    sender: senderId,
    senderType,
    message,
    attachments,
    isInternal,
    createdAt: new Date()
  } as ISupportTicketMessage);

  // Update response times
  if (senderType === 'admin') {
    if (!this.firstResponseAt) {
      this.firstResponseAt = new Date();
    }
    this.lastResponseAt = new Date();
  }

  return await this.save();
};

/**
 * Assign ticket to an agent
 */
supportTicketSchema.methods.assignToAgent = async function (
  agentId: mongoose.Types.ObjectId
): Promise<ISupportTicket> {
  this.assignedTo = agentId;
  if (this.status === 'open') {
    this.status = 'in-progress';
  }
  return await this.save();
};

/**
 * Change ticket status
 */
supportTicketSchema.methods.changeStatus = async function (
  newStatus: string
): Promise<ISupportTicket> {
  this.status = newStatus as any;
  
  if (newStatus === 'resolved') {
    this.resolvedAt = new Date();
  } else if (newStatus === 'closed') {
    this.closedAt = new Date();
    if (!this.resolvedAt) {
      this.resolvedAt = new Date();
    }
  }
  
  return await this.save();
};

/**
 * Change ticket priority
 */
supportTicketSchema.methods.changePriority = async function (
  newPriority: string
): Promise<ISupportTicket> {
  this.priority = newPriority as any;
  return await this.save();
};

/**
 * Resolve ticket
 */
supportTicketSchema.methods.resolve = async function (): Promise<ISupportTicket> {
  this.status = 'resolved';
  this.resolvedAt = new Date();
  return await this.save();
};

/**
 * Close ticket
 */
supportTicketSchema.methods.close = async function (): Promise<ISupportTicket> {
  this.status = 'closed';
  this.closedAt = new Date();
  if (!this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  return await this.save();
};

/**
 * Reopen ticket
 */
supportTicketSchema.methods.reopen = async function (): Promise<ISupportTicket> {
  this.status = 'open';
  this.resolvedAt = undefined;
  this.closedAt = undefined;
  return await this.save();
};

/**
 * Rate satisfaction
 */
supportTicketSchema.methods.rateSatisfaction = async function (
  rating: number,
  feedback?: string
): Promise<ISupportTicket> {
  this.satisfactionRating = rating;
  if (feedback) {
    this.satisfactionFeedback = feedback;
  }
  return await this.save();
};

// ==================== STATIC METHODS ====================

/**
 * Generate unique ticket number
 */
supportTicketSchema.statics.generateTicketNumber = async function (): Promise<string> {
  const prefix = 'TKT';
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  
  // Get count of tickets created today
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const count = await this.countDocuments({
    createdAt: { $gte: startOfDay }
  });
  
  const sequence = (count + 1).toString().padStart(4, '0');
  return `${prefix}${year}${month}${sequence}`;
};

/**
 * Get tickets by user
 */
supportTicketSchema.statics.getByUser = async function (
  userId: string
): Promise<ISupportTicket[]> {
  return await this.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate('assignedTo', 'name email')
    .lean();
};

/**
 * Get tickets by status
 */
supportTicketSchema.statics.getByStatus = async function (
  status: string
): Promise<ISupportTicket[]> {
  return await this.find({ status })
    .sort({ priority: -1, createdAt: -1 })
    .populate('user', 'name email')
    .populate('assignedTo', 'name email')
    .lean();
};

/**
 * Get tickets by priority
 */
supportTicketSchema.statics.getByPriority = async function (
  priority: string
): Promise<ISupportTicket[]> {
  return await this.find({ priority, status: { $nin: ['resolved', 'closed'] } })
    .sort({ createdAt: -1 })
    .populate('user', 'name email')
    .populate('assignedTo', 'name email')
    .lean();
};

/**
 * Get tickets by category
 */
supportTicketSchema.statics.getByCategory = async function (
  category: string
): Promise<ISupportTicket[]> {
  return await this.find({ category })
    .sort({ createdAt: -1 })
    .populate('user', 'name email')
    .lean();
};

/**
 * Get tickets assigned to agent
 */
supportTicketSchema.statics.getAssignedToAgent = async function (
  agentId: string
): Promise<ISupportTicket[]> {
  return await this.find({
    assignedTo: agentId,
    status: { $nin: ['resolved', 'closed'] }
  })
    .sort({ priority: -1, createdAt: -1 })
    .populate('user', 'name email')
    .lean();
};

/**
 * Get overdue tickets
 */
supportTicketSchema.statics.getOverdueTickets = async function (): Promise<
  ISupportTicket[]
> {
  const now = new Date();
  
  return await this.find({
    status: { $in: ['open', 'in-progress', 'waiting-customer'] },
    $or: [
      {
        priority: 'urgent',
        createdAt: { $lt: new Date(now.getTime() - 4 * 60 * 60 * 1000) }
      },
      {
        priority: 'high',
        createdAt: { $lt: new Date(now.getTime() - 12 * 60 * 60 * 1000) }
      },
      {
        priority: { $in: ['medium', 'low'] },
        createdAt: { $lt: new Date(now.getTime() - 48 * 60 * 60 * 1000) }
      }
    ]
  })
    .sort({ priority: -1, createdAt: 1 })
    .populate('user', 'name email')
    .populate('assignedTo', 'name email');
};

/**
 * Get ticket statistics
 */
supportTicketSchema.statics.getTicketStats = async function (
  startDate?: Date,
  endDate?: Date
): Promise<any> {
  const dateFilter: any = {};
  if (startDate) dateFilter.$gte = startDate;
  if (endDate) dateFilter.$lte = endDate;
  
  const matchStage = Object.keys(dateFilter).length > 0
    ? { createdAt: dateFilter }
    : {};

  const [
    statusStats,
    priorityStats,
    categoryStats,
    satisfactionStats,
    avgResponseTime,
    avgResolutionTime
  ] = await Promise.all([
    // Status distribution
    this.aggregate([
      { $match: matchStage },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    
    // Priority distribution
    this.aggregate([
      { $match: matchStage },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    
    // Category distribution
    this.aggregate([
      { $match: matchStage },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    
    // Satisfaction ratings
    this.aggregate([
      {
        $match: {
          ...matchStage,
          satisfactionRating: { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$satisfactionRating' },
          totalRatings: { $sum: 1 },
          ratings: { $push: '$satisfactionRating' }
        }
      }
    ]),
    
    // Average response time
    this.aggregate([
      {
        $match: {
          ...matchStage,
          firstResponseAt: { $exists: true }
        }
      },
      {
        $project: {
          responseTime: {
            $divide: [
              { $subtract: ['$firstResponseAt', '$createdAt'] },
              3600000
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$responseTime' }
        }
      }
    ]),
    
    // Average resolution time
    this.aggregate([
      {
        $match: {
          ...matchStage,
          resolvedAt: { $exists: true }
        }
      },
      {
        $project: {
          resolutionTime: {
            $divide: [
              { $subtract: ['$resolvedAt', '$createdAt'] },
              3600000
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgResolutionTime: { $avg: '$resolutionTime' }
        }
      }
    ])
  ]);

  return {
    byStatus: statusStats,
    byPriority: priorityStats,
    byCategory: categoryStats,
    satisfaction: satisfactionStats[0] || { avgRating: 0, totalRatings: 0 },
    avgResponseTime: avgResponseTime[0]?.avgResponseTime || 0,
    avgResolutionTime: avgResolutionTime[0]?.avgResolutionTime || 0
  };
};

// ==================== MIDDLEWARE ====================

/**
 * Pre-save: Normalize tags
 */
supportTicketSchema.pre('save', function (next) {
  if (this.isModified('tags') && Array.isArray((this as any).tags)) {
    (this as any).tags = (this as any).tags.map((tag: string) =>
      tag.toLowerCase().trim()
    );
  }
  next();
});

// ==================== MODEL ====================

const SupportTicket = mongoose.model<ISupportTicket, ISupportTicketModel>(
  'SupportTicket',
  supportTicketSchema
);

export default SupportTicket;
