import { Request, Response, NextFunction } from 'express';
import Order from '../models/Order.model.js';
import Product from '../models/Product.model.js';
import User from '../models/User.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { AuthRequest } from '../types/index.js';
import { sendEmail } from '../services/email.service.js';
import razorpay from '../config/razorpay.js';

export const createOrder = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const {
    items,
    shippingAddress,
    billingAddress,
    paymentMethod,
    guestEmail,
    guestMobile,
    notes
  } = req.body;

  // Validate items and calculate totals
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);

    if (!product) {
      return next(new AppError(`Product with ID ${item.product} not found`, 404));
    }

    const variant = product.variants.find(v => v._id?.toString() === item.variant);

    if (!variant) {
      return next(new AppError(`Variant not found for product ${product.name}`, 404));
    }

    if (variant.stock < item.quantity) {
      return next(new AppError(`Insufficient stock for ${product.name}. Available: ${variant.stock}`, 400));
    }

    const itemTotal = variant.price * item.quantity;
    subtotal += itemTotal;

    orderItems.push({
      product: item.product,
      variant: item.variant,
      name: product.name,
      image: variant.images[0] || product.images[0] || '',
      price: variant.price,
      quantity: item.quantity,
      total: itemTotal
    });
  }

  // Calculate shipping and tax
  const shippingCost = subtotal >= 1000 ? 0 : 99; // Free shipping over ₹1000
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + shippingCost + tax;

  // Create order
  const orderData: any = {
    orderNumber: 'VM' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase(),
    items: orderItems,
    subtotal,
    shippingCost,
    tax,
    total,
    shippingAddress,
    billingAddress,
    notes,
    paymentInfo: {
      method: paymentMethod,
      status: paymentMethod === 'cod' ? 'pending' : 'pending'
    }
  };

  if (req.user) {
    orderData.user = req.user._id;
  } else {
    orderData.guestEmail = guestEmail;
    orderData.guestMobile = guestMobile;
  }

  const order = await Order.create(orderData);

  // Update product stock and sales count
  for (const item of items) {
    const product = await Product.findById(item.product);
    const variant = product!.variants.find(v => v._id?.toString() === item.variant);
    variant!.stock -= item.quantity;

    // Increment sales count
    product!.salesCount = (product!.salesCount || 0) + item.quantity;

    await product!.save();
  }

  // Create Razorpay order if payment method is razorpay
  if (paymentMethod === 'razorpay') {
    if (!razorpay) {
      return next(new AppError('Payment service is not available', 503));
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100), // Convert to paise
      currency: 'INR',
      receipt: order.orderNumber,
      payment_capture: true
    });

    order.paymentInfo.razorpayOrderId = razorpayOrder.id;
    await order.save();
  }

  // Send order confirmation email
  try {
    const emailTo = req.user?.email || guestEmail;
    if (emailTo) {
      await sendEmail({
        email: emailTo,
        subject: `Order Confirmation - ${order.orderNumber}`,
        html: `
          <h1>Order Confirmed!</h1>
          <p>Dear ${req.user?.firstName || shippingAddress.firstName},</p>
          <p>Your order has been successfully placed!</p>
          <h3>Order Details:</h3>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Total Amount:</strong> ₹${total.toFixed(2)}</p>
          <p><strong>Payment Method:</strong> ${paymentMethod.toUpperCase()}</p>
          <p>You can track your order using the order number on our website.</p>
          <p>Thank you for shopping with Vardhman Mills!</p>
        `
      });
    }
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
  }

  res.status(201).json({
    status: 'success',
    data: {
      order
    }
  });
});

export const getMyOrders = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const orders = await Order.find({ user: req.user!._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('items.product', 'name slug');

  const total = await Order.countDocuments({ user: req.user!._id });

  res.status(200).json({
    status: 'success',
    results: orders.length,
    pagination: {
      page,
      pages: Math.ceil(total / limit),
      total
    },
    data: {
      orders
    }
  });
});

export const getOrder = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const query: any = { _id: req.params.id };

  // If not admin, restrict to user's own orders or guest orders with email
  if (req.user?.role !== 'admin') {
    if (req.user) {
      query.user = req.user._id;
    } else if (req.query.email) {
      query.guestEmail = req.query.email;
    } else {
      return next(new AppError('Access denied', 403));
    }
  }

  const order = await Order.findOne(query)
    .populate('items.product', 'name slug')
    .populate('user', 'firstName lastName email');

  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

export const trackOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { orderNumber, email } = req.query;

  if (!orderNumber) {
    return next(new AppError('Order number is required', 400));
  }

  const query: any = { orderNumber };

  if (email) {
    query.$or = [
      { guestEmail: email },
      { 'user.email': email }
    ];
  }

  const order = await Order.findOne(query)
    .populate('user', 'firstName lastName email')
    .select('orderNumber status createdAt estimatedDelivery deliveredAt trackingNumber');

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Check if email matches (for guest orders)
  if (order.guestEmail && email && order.guestEmail !== email) {
    return next(new AppError('Invalid email for this order', 400));
  }

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

export const updateOrderStatus = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { status, trackingNumber, estimatedDelivery, cancellationReason } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  const updateData: any = { status };

  if (trackingNumber) updateData.trackingNumber = trackingNumber;
  if (estimatedDelivery) updateData.estimatedDelivery = new Date(estimatedDelivery);

  if (status === 'delivered') {
    updateData.deliveredAt = new Date();
  }

  if (status === 'cancelled') {
    updateData.cancelledAt = new Date();
    if (cancellationReason) updateData.cancellationReason = cancellationReason;

    // Restore stock and decrement sales count
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        const variant = product.variants.find(v => v._id?.toString() === item.variant);
        if (variant) {
          variant.stock += item.quantity;
          // Decrement sales count
          product.salesCount = Math.max(0, (product.salesCount || 0) - item.quantity);
          await product.save();
        }
      }
    }
  }

  const updatedOrder = await Order.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  });

  // Send status update email
  try {
    const emailTo = order.user ?
      (await User.findById(order.user))?.email : order.guestEmail;

    if (emailTo) {
      await sendEmail({
        email: emailTo,
        subject: `Order ${status.charAt(0).toUpperCase() + status.slice(1)} - ${order.orderNumber}`,
        html: `
          <h1>Order Status Update</h1>
          <p>Your order #${order.orderNumber} status has been updated to: <strong>${status.toUpperCase()}</strong></p>
          ${trackingNumber ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ''}
          ${estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${new Date(estimatedDelivery).toLocaleDateString()}</p>` : ''}
          ${status === 'cancelled' && cancellationReason ? `<p><strong>Cancellation Reason:</strong> ${cancellationReason}</p>` : ''}
          <p>Thank you for shopping with Vardhman Mills!</p>
        `
      });
    }
  } catch (error) {
    console.error('Error sending status update email:', error);
  }

  res.status(200).json({
    status: 'success',
    data: {
      order: updatedOrder
    }
  });
});

export const cancelOrder = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { reason } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Check if user owns the order (for non-admin users)
  if (req.user?.role !== 'admin' && order.user?.toString() !== req.user?._id.toString()) {
    return next(new AppError('You can only cancel your own orders', 403));
  }

  // Check if order can be cancelled
  if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
    return next(new AppError('This order cannot be cancelled', 400));
  }

  // Restore stock and decrement sales count
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (product) {
      const variant = product.variants.find(v => v._id?.toString() === item.variant);
      if (variant) {
        variant.stock += item.quantity;
        // Decrement sales count
        product.salesCount = Math.max(0, (product.salesCount || 0) - item.quantity);
        await product.save();
      }
    }
  }

  order.status = 'cancelled';
  order.cancelledAt = new Date();
  if (reason) order.cancellationReason = reason;

  await order.save();

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

// Admin routes
export const getAllOrders = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const query: any = {};

  if (req.query.status) {
    query.status = req.query.status;
  }

  if (req.query.user) {
    query.user = req.query.user;
  }

  if (req.query.startDate || req.query.endDate) {
    query.createdAt = {};
    if (req.query.startDate) query.createdAt.$gte = new Date(req.query.startDate as string);
    if (req.query.endDate) query.createdAt.$lte = new Date(req.query.endDate as string);
  }

  if (req.query.search) {
    query.$or = [
      { orderNumber: { $regex: req.query.search, $options: 'i' } },
      { guestEmail: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const orders = await Order.find(query)
    .populate('user', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: orders.length,
    pagination: {
      page,
      pages: Math.ceil(total / limit),
      total
    },
    data: {
      orders
    }
  });
});

export const getOrderStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const stats = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$total' },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        confirmedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
        },
        shippedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] }
        },
        deliveredOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats: stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        confirmedOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0
      }
    }
  });
});

// Bulk operations
export const bulkDeleteOrders = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { orderIds } = req.body;

  if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
    return next(new AppError('Order IDs are required', 400));
  }

  // Delete from database
  const result = await Order.deleteMany({ _id: { $in: orderIds } });

  res.status(200).json({
    status: 'success',
    message: `Successfully deleted ${result.deletedCount} orders`,
    data: {
      deletedCount: result.deletedCount
    }
  });
});

export const bulkUpdateOrderStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { orderIds, status } = req.body;

  if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
    return next(new AppError('Order IDs are required', 400));
  }

  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
  if (!validStatuses.includes(status)) {
    return next(new AppError('Invalid order status', 400));
  }

  const result = await Order.updateMany(
    { _id: { $in: orderIds } },
    {
      status,
      updatedAt: new Date()
    }
  );

  res.status(200).json({
    status: 'success',
    message: `Successfully updated ${result.modifiedCount} orders to ${status}`,
    data: {
      modifiedCount: result.modifiedCount
    }
  });
});

/**
 * @desc    Generate invoice for order
 * @route   GET /api/v1/orders/:id/invoice
 * @access  Private
 */
export const generateInvoice = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const order = await Order.findById(id).populate('items.product', 'name');

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Check if user owns the order or is admin
  if (order.user && order.user.toString() !== req.user!.id && req.user!.role !== 'admin') {
    return next(new AppError('You do not have permission to access this order', 403));
  }

  const user = order.user ? await User.findById(order.user) : null;

  if (!user) {
    return next(new AppError('User information required for invoice generation', 404));
  }

  const invoiceService = (await import('../services/invoice.service.js')).default;
  const invoicePath = await invoiceService.generateInvoice({ order, user });

  res.status(200).json({
    status: 'success',
    message: 'Invoice generated successfully',
    data: {
      invoicePath,
      fileName: invoicePath.split('/').pop()
    }
  });
});

/**
 * @desc    Download invoice for order
 * @route   GET /api/v1/orders/:id/invoice/download
 * @access  Private
 */
export const downloadInvoice = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const order = await Order.findById(id).populate('items.product', 'name');

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Check if user owns the order or is admin
  if (order.user && order.user.toString() !== req.user!.id && req.user!.role !== 'admin') {
    return next(new AppError('You do not have permission to access this order', 403));
  }

  const user = order.user ? await User.findById(order.user) : null;

  if (!user) {
    return next(new AppError('User information required for invoice generation', 404));
  }

  const invoiceService = (await import('../services/invoice.service.js')).default;
  const invoicePath = await invoiceService.generateInvoice({ order, user });

  res.download(invoicePath, `invoice-${order.orderNumber}.pdf`, (err) => {
    if (err) {
      return next(new AppError('Error downloading invoice', 500));
    }
  });
});

/**
 * @desc    Email invoice for order
 * @route   POST /api/v1/orders/:id/invoice/email
 * @access  Private
 */
export const emailInvoice = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const order = await Order.findById(id).populate('items.product', 'name');

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Check if user owns the order or is admin
  if (order.user && order.user.toString() !== req.user!.id && req.user!.role !== 'admin') {
    return next(new AppError('You do not have permission to access this order', 403));
  }

  const user = order.user ? await User.findById(order.user) : null;

  if (!user) {
    return next(new AppError('User information required for invoice generation', 404));
  }

  const invoiceService = (await import('../services/invoice.service.js')).default;
  const invoicePath = await invoiceService.generateInvoice({ order, user });

  await invoiceService.emailInvoice({ order, user }, invoicePath);

  res.status(200).json({
    status: 'success',
    message: `Invoice has been sent to ${user.email}`
  });
});