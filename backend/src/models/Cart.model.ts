import mongoose, { Document, Schema } from 'mongoose';

// Interfaces
export interface ICartItem {
  product: mongoose.Types.ObjectId;
  variantId?: string;
  quantity: number;
  price: number; // Price at time of adding
  discount: number;
  total: number;
  customizations?: Record<string, any>;
  addedAt: Date;
}

export interface ICart extends Document {
  user?: mongoose.Types.ObjectId;
  guestId?: string;
  items: ICartItem[];
  
  // Totals
  subtotal: number;
  discount: number;
  tax: number;
  taxRate: number;
  shipping: number;
  total: number;
  
  // Coupons & Discounts
  appliedCoupons: mongoose.Types.ObjectId[];
  couponDiscount: number;
  
  // Metadata
  isActive: boolean;
  isMerged: boolean;
  lastActivityAt: Date;
  expiresAt?: Date;
  
  // Guest cart info
  ipAddress?: string;
  userAgent?: string;
  
  // Saved cart info
  isSaved: boolean;
  savedName?: string;
  savedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual properties
  itemCount: number;
  uniqueItemCount: number;
  isEmpty: boolean;
  
  // Methods
  addItem(productId: mongoose.Types.ObjectId, quantity: number, options?: Partial<ICartItem>): Promise<void>;
  updateItem(productId: mongoose.Types.ObjectId, quantity: number): Promise<boolean>;
  removeItem(productId: mongoose.Types.ObjectId): Promise<boolean>;
  clearItems(): Promise<void>;
  hasItem(productId: mongoose.Types.ObjectId): boolean;
  calculateTotals(): Promise<void>;
  mergeCarts(otherCart: ICart): Promise<void>;
  applyCoupon(couponId: mongoose.Types.ObjectId): Promise<void>;
  removeCoupon(couponId: mongoose.Types.ObjectId): Promise<void>;
  validateItems(): Promise<boolean>;
}

// Schema
const cartItemSchema = new Schema<ICartItem>({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variantId: String,
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    required: true,
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
  customizations: Schema.Types.Mixed,
  addedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const cartSchema = new Schema<ICart>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    sparse: true
  },
  guestId: {
    type: String,
    sparse: true
  },
  items: {
    type: [cartItemSchema],
    default: []
  },
  subtotal: {
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  taxRate: {
    type: Number,
    default: 0.18, // 18% GST
    min: 0,
    max: 1
  },
  shipping: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    default: 0,
    min: 0
  },
  appliedCoupons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon'
  }],
  couponDiscount: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isMerged: {
    type: Boolean,
    default: false
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date,
  ipAddress: String,
  userAgent: String,
  isSaved: {
    type: Boolean,
    default: false
  },
  savedName: String,
  savedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
cartSchema.index({ user: 1, isActive: 1 });
cartSchema.index({ guestId: 1, isActive: 1 });
cartSchema.index({ lastActivityAt: -1 });
cartSchema.index({ expiresAt: 1 }, { sparse: true });
cartSchema.index({ 'items.product': 1 });
cartSchema.index({ isSaved: 1, user: 1 });

// Virtuals
cartSchema.virtual('itemCount').get(function(this: ICart) {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

cartSchema.virtual('uniqueItemCount').get(function(this: ICart) {
  return this.items.length;
});

cartSchema.virtual('isEmpty').get(function(this: ICart) {
  return this.items.length === 0;
});

// Methods
cartSchema.methods.addItem = async function(
  this: ICart,
  productId: mongoose.Types.ObjectId,
  quantity: number,
  options?: Partial<ICartItem>
): Promise<void> {
  // Check if item already exists
  const existingItemIndex = this.items.findIndex(
    item => item.product.toString() === productId.toString() && 
            (!options?.variantId || item.variantId === options.variantId)
  );
  
  // Get product details
  const Product = mongoose.model('Product');
  const product = await Product.findById(productId).select('price discount stock');
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  const price = (product as any).price;
  const discount = (product as any).discount || 0;
  const stock = (product as any).stock || 0;
  
  if (stock < quantity) {
    throw new Error('Insufficient stock');
  }
  
  if (existingItemIndex > -1) {
    // Update existing item
    const newQuantity = this.items[existingItemIndex].quantity + quantity;
    if (stock < newQuantity) {
      throw new Error('Insufficient stock');
    }
    this.items[existingItemIndex].quantity = newQuantity;
    this.items[existingItemIndex].total = newQuantity * (price - discount);
  } else {
    // Add new item
    this.items.push({
      product: productId,
      variantId: options?.variantId,
      quantity,
      price,
      discount,
      total: quantity * (price - discount),
      customizations: options?.customizations,
      addedAt: new Date()
    });
  }
  
  this.lastActivityAt = new Date();
  await this.calculateTotals();
  await this.save();
};

cartSchema.methods.updateItem = async function(
  this: ICart,
  productId: mongoose.Types.ObjectId,
  quantity: number
): Promise<boolean> {
  const itemIndex = this.items.findIndex(
    item => item.product.toString() === productId.toString()
  );
  
  if (itemIndex === -1) return false;
  
  if (quantity <= 0) {
    this.items.splice(itemIndex, 1);
  } else {
    // Validate stock
    const Product = mongoose.model('Product');
    const product = await Product.findById(productId).select('stock');
    
    if (product && (product as any).stock < quantity) {
      throw new Error('Insufficient stock');
    }
    
    this.items[itemIndex].quantity = quantity;
    this.items[itemIndex].total = quantity * (this.items[itemIndex].price - this.items[itemIndex].discount);
  }
  
  this.lastActivityAt = new Date();
  await this.calculateTotals();
  await this.save();
  return true;
};

cartSchema.methods.removeItem = async function(
  this: ICart,
  productId: mongoose.Types.ObjectId
): Promise<boolean> {
  const initialLength = this.items.length;
  this.items = this.items.filter(
    item => item.product.toString() !== productId.toString()
  );
  
  if (this.items.length < initialLength) {
    this.lastActivityAt = new Date();
    await this.calculateTotals();
    await this.save();
    return true;
  }
  
  return false;
};

cartSchema.methods.clearItems = async function(this: ICart): Promise<void> {
  this.items = [];
  this.appliedCoupons = [];
  this.lastActivityAt = new Date();
  await this.calculateTotals();
  await this.save();
};

cartSchema.methods.hasItem = function(
  this: ICart,
  productId: mongoose.Types.ObjectId
): boolean {
  return this.items.some(
    item => item.product.toString() === productId.toString()
  );
};

cartSchema.methods.calculateTotals = async function(this: ICart): Promise<void> {
  // Calculate subtotal
  this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
  
  // Calculate item discounts
  this.discount = this.items.reduce((sum, item) => sum + (item.discount * item.quantity), 0);
  
  // Calculate shipping (free shipping above 999)
  this.shipping = this.subtotal >= 999 ? 0 : 50;
  
  // Calculate tax (on subtotal - discount + shipping)
  const taxableAmount = this.subtotal - this.discount + this.shipping;
  this.tax = taxableAmount * this.taxRate;
  
  // Calculate total
  this.total = this.subtotal - this.discount - this.couponDiscount + this.shipping + this.tax;
  this.total = Math.max(0, this.total); // Ensure total is not negative
};

cartSchema.methods.mergeCarts = async function(
  this: ICart,
  otherCart: ICart
): Promise<void> {
  if (!otherCart || otherCart.items.length === 0) return;
  
  // Merge items from other cart
  for (const otherItem of otherCart.items) {
    const existingItemIndex = this.items.findIndex(
      item => item.product.toString() === otherItem.product.toString() &&
              item.variantId === otherItem.variantId
    );
    
    if (existingItemIndex > -1) {
      // Merge quantities
      this.items[existingItemIndex].quantity += otherItem.quantity;
      this.items[existingItemIndex].total = 
        this.items[existingItemIndex].quantity * 
        (this.items[existingItemIndex].price - this.items[existingItemIndex].discount);
    } else {
      // Add new item
      this.items.push(otherItem);
    }
  }
  
  this.isMerged = true;
  this.lastActivityAt = new Date();
  await this.calculateTotals();
  await this.save();
  
  // Mark other cart as inactive
  otherCart.isActive = false;
  await otherCart.save();
};

cartSchema.methods.applyCoupon = async function(
  this: ICart,
  couponId: mongoose.Types.ObjectId
): Promise<void> {
  // Check if coupon already applied
  if (this.appliedCoupons.some(c => c.toString() === couponId.toString())) {
    return;
  }
  
  this.appliedCoupons.push(couponId);
  
  // Recalculate coupon discount (this would be done in the controller with coupon logic)
  await this.calculateTotals();
  await this.save();
};

cartSchema.methods.removeCoupon = async function(
  this: ICart,
  couponId: mongoose.Types.ObjectId
): Promise<void> {
  this.appliedCoupons = this.appliedCoupons.filter(
    c => c.toString() !== couponId.toString()
  );
  
  this.couponDiscount = 0;
  await this.calculateTotals();
  await this.save();
};

cartSchema.methods.validateItems = async function(this: ICart): Promise<boolean> {
  const Product = mongoose.model('Product');
  let isValid = true;
  
  for (const item of this.items) {
    const product = await Product.findById(item.product).select('stock price isActive');
    
    if (!product || !(product as any).isActive) {
      isValid = false;
      continue;
    }
    
    if ((product as any).stock < item.quantity) {
      isValid = false;
    }
  }
  
  return isValid;
};

// Hooks
cartSchema.pre('save', function(next) {
  // Update lastActivityAt
  if (this.isModified('items') || this.isModified('appliedCoupons')) {
    this.lastActivityAt = new Date();
  }
  
  // Set expiry for guest carts (30 days)
  if (!this.user && !this.expiresAt) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    this.expiresAt = expiryDate;
  }
  
  next();
});

const Cart = mongoose.model<ICart>('Cart', cartSchema);
export default Cart;
