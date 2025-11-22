import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  variant: string; // variant ID
  name: string;
  image: string;
  price: number;
  quantity: number;
  total: number;
}

export interface IShippingAddress {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  mobile: string;
}

export interface IPaymentInfo {
  method: 'razorpay' | 'cod';
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  transactionId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paidAt?: Date;
  refundedAt?: Date;
  refundAmount?: number;
}

export interface IOrder extends Document {
  _id: string;
  orderNumber: string;
  user?: mongoose.Types.ObjectId;
  guestEmail?: string;
  guestMobile?: string;
  items: IOrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  paymentInfo: IPaymentInfo;
  shippingAddress: IShippingAddress;
  billingAddress: IShippingAddress;
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  couponCode?: string;
  couponDiscount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variant: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  total: {
    type: Number,
    required: true,
    min: 0
  }
});

const shippingAddressSchema = new Schema<IShippingAddress>({
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
    required: true,
    trim: true
  }
});

const paymentInfoSchema = new Schema<IPaymentInfo>({
  method: {
    type: String,
    enum: ['razorpay', 'cod'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: String,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  paidAt: Date,
  refundedAt: Date,
  refundAmount: {
    type: Number,
    min: 0
  }
});

const orderSchema = new Schema<IOrder>({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  guestEmail: {
    type: String,
    lowercase: true,
    trim: true
  },
  guestMobile: {
    type: String,
    trim: true
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  shippingCost: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  tax: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  discount: {
    type: Number,
    min: 0,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  paymentInfo: paymentInfoSchema,
  shippingAddress: shippingAddressSchema,
  billingAddress: shippingAddressSchema,
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  trackingNumber: {
    type: String,
    trim: true
  },
  estimatedDelivery: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  cancellationReason: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', function() {
  if (!this.orderNumber) {
    this.orderNumber = 'VM' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
});

export default mongoose.model<IOrder>('Order', orderSchema);