export interface OrderItem {
  product: string;
  variant: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  total: number;
}

export interface ShippingAddress {
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

export interface PaymentInfo {
  method: 'razorpay' | 'cod';
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  transactionId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paidAt?: Date;
  refundedAt?: Date;
  refundAmount?: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user?: User;
  guestEmail?: string;
  guestMobile?: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  paymentInfo: PaymentInfo;
  shippingAddress: ShippingAddress;
  billingAddress: ShippingAddress;
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderRequest {
  items: Array<{
    product: string;
    variant: string;
    quantity: number;
  }>;
  shippingAddress: ShippingAddress;
  billingAddress: ShippingAddress;
  paymentMethod: 'razorpay' | 'cod';
  guestEmail?: string;
  guestMobile?: string;
  notes?: string;
}

export interface UpdateOrderStatusRequest {
  status: Order['status'];
  trackingNumber?: string;
  estimatedDelivery?: Date;
  cancellationReason?: string;
}

export interface TrackOrderRequest {
  orderNumber: string;
  email?: string;
}