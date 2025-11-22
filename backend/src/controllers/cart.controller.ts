import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Cart from '../models/Cart.model.js';
import Product from '../models/Product.model.js';
import Coupon from '../models/Coupon.model.js';
import Wishlist from '../models/Wishlist.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// ==================== CORE CART OPERATIONS ====================

/**
 * Get user's active cart or guest cart
 * GET /api/v1/cart?cartId=xxx
 */
export const getCart = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { cartId } = req.query;
  const userId = req.user?._id;

  let cart;

  if (cartId) {
    // Get specific cart by ID
    cart = await Cart.findById(cartId)
      .populate('items.product', 'name slug price discount stock images category')
      .populate('appliedCoupons', 'code discount discountType');
  } else if (userId) {
    // Get user's active cart
    cart = await Cart.findOne({ user: userId, isActive: true })
      .populate('items.product', 'name slug price discount stock images category')
      .populate('appliedCoupons', 'code discount discountType');
  } else {
    // No cart ID or user ID provided
    res.status(200).json({
      status: 'success',
      data: {
        cart: null,
        items: [],
        totals: {
          subtotal: 0,
          discount: 0,
          tax: 0,
          shipping: 0,
          total: 0
        },
        summary: {
          itemCount: 0,
          uniqueItemCount: 0
        }
      }
    });
    return;
  }

  if (!cart) {
    res.status(200).json({
      status: 'success',
      data: {
        cart: null,
        items: [],
        totals: {
          subtotal: 0,
          discount: 0,
          tax: 0,
          shipping: 0,
          total: 0
        },
        summary: {
          itemCount: 0,
          uniqueItemCount: 0
        }
      }
    });
    return;
  }

  res.status(200).json({
    status: 'success',
    data: {
      cart,
      items: cart.items,
      totals: {
        subtotal: cart.subtotal,
        discount: cart.discount,
        tax: cart.tax,
        shipping: cart.shipping,
        total: cart.total
      },
      summary: {
        itemCount: cart.itemCount,
        uniqueItemCount: cart.uniqueItemCount
      }
    }
  });
});

/**
 * Create new cart (supports guest carts)
 * POST /api/v1/cart
 */
export const createCart = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { guestCartId } = req.body;
  const userId = req.user?._id;

  // Check if user already has an active cart
  if (userId) {
    let existingCart = await Cart.findOne({ user: userId, isActive: true });
    
    if (existingCart) {
      // If guest cart provided, merge it
      if (guestCartId) {
        const guestCart = await Cart.findOne({ guestId: guestCartId, isActive: true });
        if (guestCart) {
          await existingCart.mergeCarts(guestCart);
          await existingCart.populate('items.product', 'name slug price discount stock images');
        }
      }
      
      res.status(200).json({
        status: 'success',
        data: { cart: existingCart }
      });
      return;
    }
  }

  // Create new cart
  const cartData: any = {
    items: [],
    isActive: true
  };

  if (userId) {
    cartData.user = userId;
  } else {
    // Generate guest ID
    cartData.guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    cartData.ipAddress = req.ip;
    cartData.userAgent = req.get('user-agent');
  }

  const cart = await Cart.create(cartData);

  res.status(201).json({
    status: 'success',
    data: { cart }
  });
});

/**
 * Clear all items from cart
 * DELETE /api/v1/cart/clear
 */
export const clearCart = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { cartId } = req.query;
  const userId = req.user?._id;

  let cart;

  if (cartId) {
    cart = await Cart.findById(cartId);
  } else if (userId) {
    cart = await Cart.findOne({ user: userId, isActive: true });
  }

  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  await cart.clearItems();

  res.status(200).json({
    status: 'success',
    message: 'Cart cleared successfully',
    data: { cart }
  });
});

/**
 * Validate cart items (stock, price, availability)
 * POST /api/v1/cart/validate
 */
export const validateCart = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { cartId } = req.query;
  const userId = req.user?._id;

  let cart;

  if (cartId) {
    cart = await Cart.findById(cartId).populate('items.product');
  } else if (userId) {
    cart = await Cart.findOne({ user: userId, isActive: true }).populate('items.product');
  }

  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  const errors: any[] = [];
  const warnings: any[] = [];
  const updatedItems: any[] = [];

  for (const item of cart.items) {
    const product = item.product as any;
    
    if (!product) {
      errors.push({
        itemId: item.product.toString(),
        type: 'availability',
        message: 'Product no longer available',
        currentValue: null,
        requiredValue: null
      });
      continue;
    }

    // Check stock
    if (product.stock < item.quantity) {
      if (product.stock === 0) {
        errors.push({
          itemId: item.product.toString(),
          type: 'stock',
          message: 'Product out of stock',
          currentValue: 0,
          requiredValue: item.quantity
        });
      } else {
        warnings.push({
          itemId: item.product.toString(),
          type: 'stock_low',
          message: `Only ${product.stock} items available`,
          currentValue: product.stock,
          requiredValue: item.quantity
        });
      }
    }

    // Check price changes
    if (product.price !== item.price) {
      warnings.push({
        itemId: item.product.toString(),
        type: 'price_change',
        message: `Price changed from ₹${item.price} to ₹${product.price}`,
        currentValue: product.price,
        requiredValue: item.price
      });
      
      // Update item price
      item.price = product.price;
      item.total = item.quantity * (product.price - item.discount);
      updatedItems.push(item);
    }

    // Check if product is active
    if (!product.isActive) {
      errors.push({
        itemId: item.product.toString(),
        type: 'availability',
        message: 'Product is no longer available',
        currentValue: false,
        requiredValue: true
      });
    }
  }

  // Save updated items
  if (updatedItems.length > 0) {
    await cart.calculateTotals();
    await cart.save();
  }

  const isValid = errors.length === 0;

  res.status(200).json({
    status: 'success',
    data: {
      isValid,
      errors,
      warnings,
      updatedItems
    }
  });
});

/**
 * Sync guest cart with user cart (on login)
 * POST /api/v1/cart/sync-guest
 */
export const syncGuestCart = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { guestCartId } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    return next(new AppError('User must be authenticated', 401));
  }

  if (!guestCartId) {
    return next(new AppError('Guest cart ID is required', 400));
  }

  // Find guest cart
  const guestCart = await Cart.findOne({ guestId: guestCartId, isActive: true });
  
  if (!guestCart || guestCart.items.length === 0) {
    return res.status(200).json({
      status: 'success',
      message: 'No guest cart to sync',
      data: { cart: null }
    });
  }

  // Find or create user cart
  let userCart = await Cart.findOne({ user: userId, isActive: true });
  
  if (!userCart) {
    userCart = await Cart.create({
      user: userId,
      items: [],
      isActive: true
    });
  }

  // Merge carts
  await userCart.mergeCarts(guestCart);
  await userCart.populate('items.product', 'name slug price discount stock images');

  res.status(200).json({
    status: 'success',
    message: 'Guest cart synced successfully',
    data: { cart: userCart }
  });
});

// ==================== ITEM OPERATIONS ====================

/**
 * Add item to cart
 * POST /api/v1/cart/items
 */
export const addItem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { productId, variantId, quantity, customizations, guestCartId } = req.body;
  const userId = req.user?._id;

  if (!productId) {
    return next(new AppError('Product ID is required', 400));
  }

  if (!quantity || quantity < 1) {
    return next(new AppError('Quantity must be at least 1', 400));
  }

  // Validate product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Check stock
  if ((product as any).stock < quantity) {
    return next(new AppError('Insufficient stock', 400));
  }

  // Find or create cart
  let cart;
  if (userId) {
    cart = await Cart.findOne({ user: userId, isActive: true });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [], isActive: true });
    }
  } else if (guestCartId) {
    cart = await Cart.findOne({ guestId: guestCartId, isActive: true });
    if (!cart) {
      cart = await Cart.create({
        guestId: guestCartId,
        items: [],
        isActive: true,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
    }
  } else {
    return next(new AppError('Cart ID or user authentication required', 400));
  }

  // Add item to cart
  await cart.addItem(new mongoose.Types.ObjectId(productId), quantity, {
    variantId,
    customizations
  });

  await cart.populate('items.product', 'name slug price discount stock images');

  res.status(200).json({
    status: 'success',
    message: 'Item added to cart',
    data: { cart }
  });
});

/**
 * Update cart item
 * PUT /api/v1/cart/items/:itemId
 */
export const updateItem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { itemId } = req.params;
  const { quantity, customizations } = req.body;
  const userId = req.user?._id;

  if (!quantity || quantity < 0) {
    return next(new AppError('Valid quantity is required', 400));
  }

  const cart = await Cart.findOne({ user: userId, isActive: true });
  
  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  // Find item
  const item = cart.items.find(i => i.product.toString() === itemId);
  
  if (!item) {
    return next(new AppError('Item not found in cart', 404));
  }

  // Update item
  if (customizations) {
    item.customizations = customizations;
  }

  await cart.updateItem(new mongoose.Types.ObjectId(itemId), quantity);
  await cart.populate('items.product', 'name slug price discount stock images');

  res.status(200).json({
    status: 'success',
    message: 'Item updated successfully',
    data: { cart }
  });
});

/**
 * Remove item from cart
 * DELETE /api/v1/cart/items/:itemId
 */
export const removeItem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { itemId } = req.params;
  const userId = req.user?._id;

  const cart = await Cart.findOne({ user: userId, isActive: true });
  
  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  const removed = await cart.removeItem(new mongoose.Types.ObjectId(itemId));
  
  if (!removed) {
    return next(new AppError('Item not found in cart', 404));
  }

  await cart.populate('items.product', 'name slug price discount stock images');

  res.status(200).json({
    status: 'success',
    message: 'Item removed from cart',
    data: { cart }
  });
});

/**
 * Move item from cart to wishlist
 * POST /api/v1/cart/items/:itemId/move-to-wishlist
 */
export const moveToWishlist = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { itemId } = req.params;
  const userId = req.user?._id;

  if (!userId) {
    return next(new AppError('User must be authenticated', 401));
  }

  // Get cart
  const cart = await Cart.findOne({ user: userId, isActive: true });
  
  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  // Find item
  const item = cart.items.find(i => i.product.toString() === itemId);
  
  if (!item) {
    return next(new AppError('Item not found in cart', 404));
  }

  // Find or create wishlist
  let wishlist = await Wishlist.findOne({ user: userId, isDefault: true });
  
  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: userId,
      name: 'My Wishlist',
      items: [],
      isDefault: true
    });
  }

  // Add to wishlist
  await wishlist.addItem(item.product, {
    notes: 'Moved from cart'
  });

  // Remove from cart
  await cart.removeItem(item.product);

  res.status(200).json({
    status: 'success',
    message: 'Item moved to wishlist',
    data: {
      cart,
      wishlist
    }
  });
});

/**
 * Move item from wishlist to cart
 * POST /api/v1/cart/items/from-wishlist/:wishlistItemId
 */
export const moveFromWishlist = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { wishlistItemId } = req.params;
  const { quantity = 1 } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    return next(new AppError('User must be authenticated', 401));
  }

  // Get wishlist
  const wishlist = await Wishlist.findOne({ user: userId, isDefault: true });
  
  if (!wishlist) {
    return next(new AppError('Wishlist not found', 404));
  }

  // Find item in wishlist
  const wishlistItem = wishlist.items.find((item: any) => 
    item.product.toString() === wishlistItemId
  );
  
  if (!wishlistItem) {
    return next(new AppError('Item not found in wishlist', 404));
  }

  // Find or create cart
  let cart = await Cart.findOne({ user: userId, isActive: true });
  
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [], isActive: true });
  }

  // Add to cart
  await cart.addItem((wishlistItem as any).product, quantity);

  // Remove from wishlist
  await wishlist.removeItem((wishlistItem as any).product);

  await cart.populate('items.product', 'name slug price discount stock images');

  res.status(200).json({
    status: 'success',
    message: 'Item moved to cart',
    data: {
      cart,
      wishlist
    }
  });
});

/**
 * Add multiple items to cart
 * POST /api/v1/cart/items/bulk/add
 */
export const addMultipleItems = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { items } = req.body;
  const userId = req.user?._id;

  if (!Array.isArray(items) || items.length === 0) {
    return next(new AppError('Items array is required', 400));
  }

  // Find or create cart
  let cart = await Cart.findOne({ user: userId, isActive: true });
  
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [], isActive: true });
  }

  const results = {
    added: 0,
    failed: 0,
    errors: [] as any[]
  };

  // Add each item
  for (const item of items) {
    try {
      await cart.addItem(
        new mongoose.Types.ObjectId(item.productId),
        item.quantity || 1,
        {
          variantId: item.variantId,
          customizations: item.customizations
        }
      );
      results.added++;
    } catch (error: any) {
      results.failed++;
      results.errors.push({
        productId: item.productId,
        error: error.message
      });
    }
  }

  await cart.populate('items.product', 'name slug price discount stock images');

  res.status(200).json({
    status: 'success',
    message: `${results.added} items added, ${results.failed} failed`,
    data: {
      cart,
      results
    }
  });
});

/**
 * Update multiple items
 * PUT /api/v1/cart/items/bulk/update
 */
export const updateMultipleItems = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { updates } = req.body;
  const userId = req.user?._id;

  if (!Array.isArray(updates) || updates.length === 0) {
    return next(new AppError('Updates array is required', 400));
  }

  const cart = await Cart.findOne({ user: userId, isActive: true });
  
  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  const results = {
    updated: 0,
    failed: 0,
    errors: [] as any[]
  };

  for (const update of updates) {
    try {
      const success = await cart.updateItem(
        new mongoose.Types.ObjectId(update.itemId),
        update.quantity
      );
      
      if (success) {
        results.updated++;
      } else {
        results.failed++;
        results.errors.push({
          itemId: update.itemId,
          error: 'Item not found'
        });
      }
    } catch (error: any) {
      results.failed++;
      results.errors.push({
        itemId: update.itemId,
        error: error.message
      });
    }
  }

  await cart.populate('items.product', 'name slug price discount stock images');

  res.status(200).json({
    status: 'success',
    message: `${results.updated} items updated, ${results.failed} failed`,
    data: {
      cart,
      results
    }
  });
});

/**
 * Remove multiple items
 * DELETE /api/v1/cart/items/bulk/remove
 */
export const removeMultipleItems = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { itemIds } = req.body;
  const userId = req.user?._id;

  if (!Array.isArray(itemIds) || itemIds.length === 0) {
    return next(new AppError('Item IDs array is required', 400));
  }

  const cart = await Cart.findOne({ user: userId, isActive: true });
  
  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  let removed = 0;

  for (const itemId of itemIds) {
    const success = await cart.removeItem(new mongoose.Types.ObjectId(itemId));
    if (success) removed++;
  }

  await cart.populate('items.product', 'name slug price discount stock images');

  res.status(200).json({
    status: 'success',
    message: `${removed} items removed`,
    data: { cart }
  });
});

/**
 * Increase item quantity
 * POST /api/v1/cart/items/:itemId/increase
 */
export const increaseQuantity = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { itemId } = req.params;
  const { amount = 1 } = req.body;
  const userId = req.user?._id;

  const cart = await Cart.findOne({ user: userId, isActive: true });
  
  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  const item = cart.items.find(i => i.product.toString() === itemId);
  
  if (!item) {
    return next(new AppError('Item not found in cart', 404));
  }

  await cart.updateItem(new mongoose.Types.ObjectId(itemId), item.quantity + amount);
  await cart.populate('items.product', 'name slug price discount stock images');

  res.status(200).json({
    status: 'success',
    message: 'Quantity increased',
    data: { cart }
  });
});

/**
 * Decrease item quantity
 * POST /api/v1/cart/items/:itemId/decrease
 */
export const decreaseQuantity = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { itemId } = req.params;
  const { amount = 1 } = req.body;
  const userId = req.user?._id;

  const cart = await Cart.findOne({ user: userId, isActive: true });
  
  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  const item = cart.items.find(i => i.product.toString() === itemId);
  
  if (!item) {
    return next(new AppError('Item not found in cart', 404));
  }

  const newQuantity = Math.max(0, item.quantity - amount);
  
  await cart.updateItem(new mongoose.Types.ObjectId(itemId), newQuantity);
  await cart.populate('items.product', 'name slug price discount stock images');

  res.status(200).json({
    status: 'success',
    message: newQuantity === 0 ? 'Item removed from cart' : 'Quantity decreased',
    data: { cart }
  });
});

/**
 * Set exact item quantity
 * PUT /api/v1/cart/items/:itemId/quantity
 */
export const setQuantity = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { itemId } = req.params;
  const { quantity } = req.body;
  const userId = req.user?._id;

  if (quantity === undefined || quantity < 0) {
    return next(new AppError('Valid quantity is required', 400));
  }

  const cart = await Cart.findOne({ user: userId, isActive: true });
  
  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  await cart.updateItem(new mongoose.Types.ObjectId(itemId), quantity);
  await cart.populate('items.product', 'name slug price discount stock images');

  res.status(200).json({
    status: 'success',
    message: quantity === 0 ? 'Item removed from cart' : 'Quantity updated',
    data: { cart }
  });
});

// ==================== COUPON OPERATIONS ====================

/**
 * Apply coupon to cart
 * POST /api/v1/cart/coupons
 */
export const applyCoupon = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { code, cartId } = req.body;
  const userId = req.user?._id;

  if (!code) {
    return next(new AppError('Coupon code is required', 400));
  }

  // Find coupon
  const coupon = await Coupon.findOne({ code, isActive: true });
  
  if (!coupon) {
    return next(new AppError('Invalid coupon code', 404));
  }

  // Validate coupon
  const isValid = await (coupon as any).validateCoupon(userId);
  
  if (!isValid) {
    return next(new AppError('Coupon is not valid for use', 400));
  }

  // Get cart
  let cart;
  if (cartId) {
    cart = await Cart.findById(cartId);
  } else if (userId) {
    cart = await Cart.findOne({ user: userId, isActive: true });
  }

  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  // Check minimum order value
  if (cart.subtotal < (coupon as any).minimumOrderValue) {
    return next(new AppError(
      `Minimum order value of ₹${(coupon as any).minimumOrderValue} required`,
      400
    ));
  }

  // Apply coupon
  await cart.applyCoupon(coupon._id as mongoose.Types.ObjectId);

  // Calculate discount
  let discount = 0;
  if ((coupon as any).discountType === 'percentage') {
    discount = (cart.subtotal * (coupon as any).discount) / 100;
    if ((coupon as any).maxDiscount) {
      discount = Math.min(discount, (coupon as any).maxDiscount);
    }
  } else {
    discount = (coupon as any).discount;
  }

  cart.couponDiscount = discount;
  await cart.calculateTotals();
  await cart.save();

  await cart.populate('items.product', 'name slug price discount stock images');
  await cart.populate('appliedCoupons', 'code discount discountType');

  res.status(200).json({
    status: 'success',
    message: 'Coupon applied successfully',
    data: {
      cart,
      discount
    }
  });
});

/**
 * Remove coupon from cart
 * DELETE /api/v1/cart/coupons/:couponId
 */
export const removeCoupon = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { couponId } = req.params;
  const userId = req.user?._id;

  const cart = await Cart.findOne({ user: userId, isActive: true });
  
  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  await cart.removeCoupon(new mongoose.Types.ObjectId(couponId));

  await cart.populate('items.product', 'name slug price discount stock images');

  res.status(200).json({
    status: 'success',
    message: 'Coupon removed successfully',
    data: { cart }
  });
});

/**
 * Validate coupon for cart
 * POST /api/v1/cart/coupons/validate
 */
export const validateCoupon = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { code, cartId } = req.body;
  const userId = req.user?._id;

  if (!code) {
    return next(new AppError('Coupon code is required', 400));
  }

  // Find coupon
  const coupon = await Coupon.findOne({ code, isActive: true });
  
  if (!coupon) {
    return res.status(200).json({
      status: 'success',
      data: {
        isValid: false,
        reason: 'Invalid coupon code'
      }
    });
  }

  // Validate coupon
  const isValid = await (coupon as any).validateCoupon(userId);
  
  if (!isValid) {
    return res.status(200).json({
      status: 'success',
      data: {
        isValid: false,
        reason: 'Coupon is not valid for use'
      }
    });
  }

  // Get cart
  let cart;
  if (cartId) {
    cart = await Cart.findById(cartId);
  } else if (userId) {
    cart = await Cart.findOne({ user: userId, isActive: true });
  }

  if (!cart) {
    return res.status(200).json({
      status: 'success',
      data: {
        isValid: false,
        reason: 'Cart not found'
      }
    });
  }

  // Check minimum order value
  if (cart.subtotal < (coupon as any).minimumOrderValue) {
    return res.status(200).json({
      status: 'success',
      data: {
        isValid: false,
        reason: `Minimum order value of ₹${(coupon as any).minimumOrderValue} required`,
        currentValue: cart.subtotal,
        requiredValue: (coupon as any).minimumOrderValue
      }
    });
  }

  // Calculate potential discount
  let discount = 0;
  if ((coupon as any).discountType === 'percentage') {
    discount = (cart.subtotal * (coupon as any).discount) / 100;
    if ((coupon as any).maxDiscount) {
      discount = Math.min(discount, (coupon as any).maxDiscount);
    }
  } else {
    discount = (coupon as any).discount;
  }

  res.status(200).json({
    status: 'success',
    data: {
      isValid: true,
      coupon: {
        code: (coupon as any).code,
        discount: (coupon as any).discount,
        discountType: (coupon as any).discountType
      },
      potentialDiscount: discount
    }
  });
});

// ==================== SAVED CART OPERATIONS ====================

/**
 * Get user's saved carts
 * GET /api/v1/cart/saved
 */
export const getSavedCarts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const query = { user: userId, isSaved: true };

  const [carts, total] = await Promise.all([
    Cart.find(query)
      .populate('items.product', 'name slug price discount stock images')
      .sort('-savedAt')
      .skip(skip)
      .limit(limit),
    Cart.countDocuments(query)
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      carts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
});

/**
 * Save current cart
 * POST /api/v1/cart/save
 */
export const saveCart = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name, cartId } = req.body;
  const userId = req.user?._id;

  if (!name) {
    return next(new AppError('Cart name is required', 400));
  }

  // Get cart
  let cart;
  if (cartId) {
    cart = await Cart.findById(cartId);
  } else {
    cart = await Cart.findOne({ user: userId, isActive: true });
  }

  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  if (cart.items.length === 0) {
    return next(new AppError('Cannot save empty cart', 400));
  }

  // Create saved cart (clone)
  const savedCart = new Cart({
    user: userId,
    items: cart.items,
    subtotal: cart.subtotal,
    discount: cart.discount,
    tax: cart.tax,
    shipping: cart.shipping,
    total: cart.total,
    isSaved: true,
    savedName: name,
    savedAt: new Date(),
    isActive: false
  });

  await savedCart.save();

  res.status(201).json({
    status: 'success',
    message: 'Cart saved successfully',
    data: { cart: savedCart }
  });
});

/**
 * Restore saved cart
 * POST /api/v1/cart/saved/:id/restore
 */
export const restoreSavedCart = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { replaceCart = false } = req.body;
  const userId = req.user?._id;

  // Find saved cart
  const savedCart = await Cart.findOne({ _id: id, user: userId, isSaved: true });
  
  if (!savedCart) {
    return next(new AppError('Saved cart not found', 404));
  }

  // Get current active cart
  let activeCart = await Cart.findOne({ user: userId, isActive: true });

  if (!activeCart) {
    // Create new active cart from saved cart
    activeCart = new Cart({
      user: userId,
      items: savedCart.items,
      isActive: true
    });
  } else if (replaceCart) {
    // Replace active cart items
    activeCart.items = savedCart.items;
  } else {
    // Merge saved cart with active cart
    await activeCart.mergeCarts(savedCart);
  }

  await activeCart.calculateTotals();
  await activeCart.save();
  await activeCart.populate('items.product', 'name slug price discount stock images');

  res.status(200).json({
    status: 'success',
    message: 'Cart restored successfully',
    data: { cart: activeCart }
  });
});

/**
 * Delete saved cart
 * DELETE /api/v1/cart/saved/:id
 */
export const deleteSavedCart = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?._id;

  const cart = await Cart.findOneAndDelete({ _id: id, user: userId, isSaved: true });
  
  if (!cart) {
    return next(new AppError('Saved cart not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Saved cart deleted successfully'
  });
});

// ==================== RECOMMENDATIONS ====================

/**
 * Get cart recommendations
 * GET /api/v1/cart/recommendations
 */
export const getRecommendations = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.user?._id;
  const limit = parseInt(req.query.limit as string) || 10;

  const cart = await Cart.findOne({ user: userId, isActive: true }).populate('items.product');
  
  if (!cart || cart.items.length === 0) {
    res.status(200).json({
      status: 'success',
      data: {
        frequentlyBoughtTogether: [],
        recommendedProducts: [],
        upsellProducts: [],
        crossSellProducts: []
      }
    });
    return;
  }

  // Get categories from cart items
  const categories = [...new Set(cart.items.map((item: any) => item.product.category))];
  
  // Get recommended products
  const recommended = await Product.find({
    category: { $in: categories },
    _id: { $nin: cart.items.map(item => item.product) },
    isActive: true,
    stock: { $gt: 0 }
  })
  .sort('-rating -soldCount')
  .limit(limit);

  // Get upsell products (higher price)
  const maxPrice = Math.max(...cart.items.map((item: any) => item.product.price));
  const upsell = await Product.find({
    category: { $in: categories },
    price: { $gt: maxPrice },
    isActive: true,
    stock: { $gt: 0 }
  })
  .sort('price')
  .limit(limit);

  res.status(200).json({
    status: 'success',
    data: {
      frequentlyBoughtTogether: recommended.slice(0, 5),
      recommendedProducts: recommended,
      upsellProducts: upsell,
      crossSellProducts: recommended.slice(5, 10)
    }
  });
});

/**
 * Get cart analytics (admin)
 * GET /api/v1/cart/analytics
 */
export const getCartAnalytics = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { dateFrom, dateTo } = req.query;

  const dateFilter: any = {};
  if (dateFrom) dateFilter.$gte = new Date(dateFrom as string);
  if (dateTo) dateFilter.$lte = new Date(dateTo as string);

  const query: any = {};
  if (Object.keys(dateFilter).length > 0) {
    query.createdAt = dateFilter;
  }

  const [totalCarts, activeCarts, convertedCarts] = await Promise.all([
    Cart.countDocuments(query),
    Cart.countDocuments({ ...query, isActive: true }),
    Cart.countDocuments({ ...query, isActive: false, isMerged: false })
  ]);

  const abandonedCarts = totalCarts - activeCarts - convertedCarts;
  const conversionRate = totalCarts > 0 ? (convertedCarts / totalCarts) * 100 : 0;
  const abandonmentRate = totalCarts > 0 ? (abandonedCarts / totalCarts) * 100 : 0;

  // Get average cart value
  const carts = await Cart.find(query).select('total');
  const averageCartValue = carts.length > 0 
    ? carts.reduce((sum, cart) => sum + cart.total, 0) / carts.length 
    : 0;

  res.status(200).json({
    status: 'success',
    data: {
      abandonmentRate,
      averageCartValue,
      conversionRate,
      cartMetrics: {
        totalCarts,
        activeCarts,
        abandonedCarts,
        convertedCarts
      }
    }
  });
});

/**
 * Quick add to cart
 * POST /api/v1/cart/quick-add
 */
export const quickAdd = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { productId, quantity = 1, variantId } = req.body;
  const userId = req.user?._id;

  if (!productId) {
    return next(new AppError('Product ID is required', 400));
  }

  // Find or create cart
  let cart = await Cart.findOne({ user: userId, isActive: true });
  
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [], isActive: true });
  }

  // Add item
  await cart.addItem(new mongoose.Types.ObjectId(productId), quantity, { variantId });
  await cart.populate('items.product', 'name slug price discount stock images');

  const addedItem = cart.items.find(item => item.product._id.toString() === productId);

  res.status(200).json({
    status: 'success',
    data: {
      added: true,
      item: addedItem,
      cartSummary: {
        itemCount: cart.itemCount,
        total: cart.total
      }
    }
  });
});

/**
 * Calculate shipping for cart
 * POST /api/v1/cart/calculate-shipping
 */
export const calculateShipping = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { cartId, pincode, cartItems } = req.body;
  const userId = req.user?._id;

  if (!pincode) {
    return next(new AppError('Pincode is required', 400));
  }

  // Get cart
  let cart;
  if (cartId) {
    cart = await Cart.findById(cartId).populate('items.product');
  } else if (userId) {
    cart = await Cart.findOne({ user: userId, isActive: true }).populate('items.product');
  }

  // If no cart, use cartItems from request
  let items = cart?.items || cartItems || [];
  
  if (items.length === 0) {
    return next(new AppError('No items in cart', 400));
  }

  // Calculate total weight and dimensions
  let totalWeight = 0;
  let totalValue = 0;
  
  for (const item of items) {
    const product = item.product;
    totalWeight += (product.weight || 500) * item.quantity; // Default 500g per item
    totalValue += item.price * item.quantity;
  }

  // Mock shipping carriers with rates
  const carriers = [
    {
      id: 'delhivery',
      name: 'Delhivery',
      logo: 'https://example.com/delhivery-logo.png',
      estimatedDelivery: '3-5 business days',
      cost: totalWeight > 5000 ? 150 : 80,
      codAvailable: true,
      codCharge: 50,
      trackingAvailable: true,
      features: ['Free returns', 'Real-time tracking']
    },
    {
      id: 'bluedart',
      name: 'Blue Dart',
      logo: 'https://example.com/bluedart-logo.png',
      estimatedDelivery: '2-4 business days',
      cost: totalWeight > 5000 ? 180 : 100,
      codAvailable: true,
      codCharge: 60,
      trackingAvailable: true,
      features: ['Express delivery', 'Insurance covered']
    },
    {
      id: 'dtdc',
      name: 'DTDC',
      logo: 'https://example.com/dtdc-logo.png',
      estimatedDelivery: '4-6 business days',
      cost: totalWeight > 5000 ? 120 : 60,
      codAvailable: true,
      codCharge: 40,
      trackingAvailable: true,
      features: ['Economy shipping', 'Reliable service']
    },
    {
      id: 'xpressbees',
      name: 'Xpressbees',
      logo: 'https://example.com/xpressbees-logo.png',
      estimatedDelivery: '3-5 business days',
      cost: totalWeight > 5000 ? 140 : 75,
      codAvailable: true,
      codCharge: 45,
      trackingAvailable: true,
      features: ['Fast delivery', 'COD available']
    }
  ];

  // Check if free shipping is applicable
  const freeShippingThreshold = 999;
  const isFreeShipping = totalValue >= freeShippingThreshold;

  // Apply free shipping if threshold met
  if (isFreeShipping) {
    carriers.forEach(carrier => {
      carrier.cost = 0;
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      pincode,
      totalWeight: `${totalWeight}g`,
      totalValue,
      freeShippingThreshold,
      isFreeShipping,
      carriers,
      recommended: carriers[0], // Recommend cheapest/fastest
      metadata: {
        itemCount: items.length,
        serviceability: 'available' // Mock - in production, check actual serviceability
      }
    }
  });
});
