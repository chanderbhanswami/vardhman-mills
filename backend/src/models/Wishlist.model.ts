import mongoose, { Document, Schema } from 'mongoose';

// Enums
export enum WishlistItemPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

// Interfaces
export interface IWishlistItem {
  product: mongoose.Types.ObjectId;
  addedAt: Date;
  priority: WishlistItemPriority;
  notes?: string;
  priceWhenAdded: number;
  notifyOnPriceChange: boolean;
  notifyOnStockAvailable: boolean;
}

export interface IWishlist extends Document {
  user: mongoose.Types.ObjectId;
  items: IWishlistItem[];
  name: string;
  description?: string;
  isDefault: boolean;
  isPublic: boolean;
  shareCode?: string;
  shareUrl?: string;
  allowCollaboration: boolean;
  expiresAt?: Date;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual properties
  itemCount: number;
  totalValue: number;
  
  // Methods
  addItem(productId: mongoose.Types.ObjectId, options?: Partial<IWishlistItem>): Promise<void>;
  removeItem(productId: mongoose.Types.ObjectId): Promise<boolean>;
  clearItems(): Promise<void>;
  hasItem(productId: mongoose.Types.ObjectId): boolean;
  generateShareCode(): Promise<string>;
}

// Schema
const wishlistItemSchema = new Schema<IWishlistItem>({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  priority: {
    type: String,
    enum: Object.values(WishlistItemPriority),
    default: WishlistItemPriority.MEDIUM
  },
  notes: {
    type: String,
    maxlength: 500
  },
  priceWhenAdded: {
    type: Number,
    required: true,
    min: 0
  },
  notifyOnPriceChange: {
    type: Boolean,
    default: false
  },
  notifyOnStockAvailable: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const wishlistSchema = new Schema<IWishlist>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: {
    type: [wishlistItemSchema],
    default: []
  },
  name: {
    type: String,
    default: 'My Wishlist',
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500,
    trim: true
  },
  isDefault: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  shareCode: {
    type: String,
    unique: true,
    sparse: true
  },
  shareUrl: String,
  allowCollaboration: {
    type: Boolean,
    default: false
  },
  expiresAt: Date,
  lastActivityAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
wishlistSchema.index({ user: 1, isDefault: 1 });
wishlistSchema.index({ shareCode: 1 }, { sparse: true });
wishlistSchema.index({ 'items.product': 1 });
wishlistSchema.index({ lastActivityAt: -1 });
wishlistSchema.index({ isPublic: 1, expiresAt: 1 });

// Virtuals
wishlistSchema.virtual('itemCount').get(function(this: IWishlist) {
  return this.items.length;
});

wishlistSchema.virtual('totalValue').get(function(this: IWishlist) {
  return this.items.reduce((sum, item) => sum + item.priceWhenAdded, 0);
});

// Methods
wishlistSchema.methods.addItem = async function(
  this: IWishlist,
  productId: mongoose.Types.ObjectId,
  options?: Partial<IWishlistItem>
): Promise<void> {
  // Check if item already exists
  const existingItemIndex = this.items.findIndex(
    item => item.product.toString() === productId.toString()
  );
  
  if (existingItemIndex > -1) {
    // Update existing item
    if (options?.priority) this.items[existingItemIndex].priority = options.priority;
    if (options?.notes) this.items[existingItemIndex].notes = options.notes;
    if (options?.notifyOnPriceChange !== undefined) {
      this.items[existingItemIndex].notifyOnPriceChange = options.notifyOnPriceChange;
    }
    if (options?.notifyOnStockAvailable !== undefined) {
      this.items[existingItemIndex].notifyOnStockAvailable = options.notifyOnStockAvailable;
    }
  } else {
    // Add new item
    const Product = mongoose.model('Product');
    const product = await Product.findById(productId).select('price');
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    this.items.push({
      product: productId,
      addedAt: new Date(),
      priority: options?.priority || WishlistItemPriority.MEDIUM,
      notes: options?.notes,
      priceWhenAdded: (product as any).price,
      notifyOnPriceChange: options?.notifyOnPriceChange || false,
      notifyOnStockAvailable: options?.notifyOnStockAvailable || false
    });
  }
  
  this.lastActivityAt = new Date();
  await this.save();
};

wishlistSchema.methods.removeItem = async function(
  this: IWishlist,
  productId: mongoose.Types.ObjectId
): Promise<boolean> {
  const initialLength = this.items.length;
  this.items = this.items.filter(
    item => item.product.toString() !== productId.toString()
  );
  
  if (this.items.length < initialLength) {
    this.lastActivityAt = new Date();
    await this.save();
    return true;
  }
  
  return false;
};

wishlistSchema.methods.clearItems = async function(this: IWishlist): Promise<void> {
  this.items = [];
  this.lastActivityAt = new Date();
  await this.save();
};

wishlistSchema.methods.hasItem = function(
  this: IWishlist,
  productId: mongoose.Types.ObjectId
): boolean {
  return this.items.some(
    item => item.product.toString() === productId.toString()
  );
};

wishlistSchema.methods.generateShareCode = async function(this: IWishlist): Promise<string> {
  if (this.shareCode) {
    return this.shareCode;
  }
  
  let code = '';
  let exists = true;
  
  while (exists) {
    code = Math.random().toString(36).substring(2, 10).toUpperCase();
    const existing = await mongoose.model('Wishlist').findOne({ shareCode: code });
    exists = !!existing;
  }
  
  this.shareCode = code;
  this.shareUrl = `${process.env.FRONTEND_URL}/wishlist/shared/${code}`;
  await this.save();
  
  return code;
};

// Static methods
wishlistSchema.statics.findByShareCode = async function(shareCode: string) {
  return this.findOne({ 
    shareCode, 
    isPublic: true,
    $or: [
      { expiresAt: { $gte: new Date() } },
      { expiresAt: { $exists: false } }
    ]
  });
};

// Hooks
wishlistSchema.pre('save', function(next) {
  // Update lastActivityAt
  if (this.isModified('items')) {
    this.lastActivityAt = new Date();
  }
  
  // Ensure only one default wishlist per user
  if (this.isModified('isDefault') && this.isDefault) {
    mongoose.model('Wishlist')
      .updateMany(
        { user: this.user, _id: { $ne: this._id } },
        { isDefault: false }
      )
      .exec();
  }
  
  next();
});

const Wishlist = mongoose.model<IWishlist>('Wishlist', wishlistSchema);
export default Wishlist;
