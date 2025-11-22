import { Request, Response, NextFunction } from 'express';
import User from '../models/User.model.js';
import Product from '../models/Product.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { AuthRequest } from '../types/index.js';

const filterObj = (obj: any, ...allowedFields: string[]) => {
  const newObj: any = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

export const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const query: any = {};
  
  if (req.query.search) {
    query.$or = [
      { firstName: { $regex: req.query.search, $options: 'i' } },
      { lastName: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  if (req.query.role) {
    query.role = req.query.role;
  }

  if (req.query.isActive !== undefined) {
    query.isActive = req.query.isActive === 'true';
  }

  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('-password');

  const total = await User.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: users.length,
    pagination: {
      page,
      pages: Math.ceil(total / limit),
      total
    },
    data: {
      users
    }
  });
});

export const getUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

export const updateMe = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /update-password.',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'firstName', 'lastName', 'email', 'mobile');
  
  if (req.file) filteredBody.avatar = req.file.path;

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user!.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

export const deleteMe = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  await User.findByIdAndUpdate(req.user!.id, { isActive: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

export const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Don't update password with this route
  const filteredBody = filterObj(req.body, 'firstName', 'lastName', 'email', 'mobile', 'role', 'isActive');

  const user = await User.findByIdAndUpdate(req.params.id, filteredBody, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

export const deleteUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Address management
export const addAddress = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const {
    type,
    firstName,
    lastName,
    addressLine1,
    addressLine2,
    city,
    state,
    pincode,
    country,
    mobile,
    isDefault
  } = req.body;

  const user = await User.findById(req.user!.id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // If this is set as default, make all other addresses non-default
  if (isDefault) {
    user.addresses.forEach(address => {
      address.isDefault = false;
    });
  }

  const newAddress = {
    type,
    firstName,
    lastName,
    addressLine1,
    addressLine2,
    city,
    state,
    pincode,
    country: country || 'India',
    mobile,
    isDefault: isDefault || user.addresses.length === 0 // First address is default
  };

  user.addresses.push(newAddress as any);
  await user.save();

  res.status(201).json({
    status: 'success',
    data: {
      address: user.addresses[user.addresses.length - 1]
    }
  });
});

export const updateAddress = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { addressId } = req.params;
  const {
    type,
    firstName,
    lastName,
    addressLine1,
    addressLine2,
    city,
    state,
    pincode,
    country,
    mobile,
    isDefault
  } = req.body;

  const user = await User.findById(req.user!.id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const address = user.addresses.find(addr => addr._id?.toString() === addressId);
  
  if (!address) {
    return next(new AppError('Address not found', 404));
  }

  // If this is set as default, make all other addresses non-default
  if (isDefault && !address.isDefault) {
    user.addresses.forEach(addr => {
      addr.isDefault = false;
    });
  }

  // Update address
  Object.assign(address, {
    type: type || address.type,
    firstName: firstName || address.firstName,
    lastName: lastName || address.lastName,
    addressLine1: addressLine1 || address.addressLine1,
    addressLine2: addressLine2 !== undefined ? addressLine2 : address.addressLine2,
    city: city || address.city,
    state: state || address.state,
    pincode: pincode || address.pincode,
    country: country || address.country,
    mobile: mobile || address.mobile,
    isDefault: isDefault !== undefined ? isDefault : address.isDefault
  });

  await user.save();

  res.status(200).json({
    status: 'success',
    data: {
      address
    }
  });
});

export const deleteAddress = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { addressId } = req.params;

  const user = await User.findById(req.user!.id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const addressIndex = user.addresses.findIndex(addr => addr._id?.toString() === addressId);
  
  if (addressIndex === -1) {
    return next(new AppError('Address not found', 404));
  }

  const wasDefault = user.addresses[addressIndex].isDefault;
  user.addresses.splice(addressIndex, 1);

  // If deleted address was default and there are other addresses, make first one default
  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Wishlist management
export const getWishlist = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user!.id).populate({
    path: 'wishlist',
    select: 'name slug images variants averageRating totalReviews',
    match: { isActive: true }
  });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    results: user.wishlist.length,
    data: {
      wishlist: user.wishlist
    }
  });
});

export const addToWishlist = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { productId } = req.params;

  const user = await User.findById(req.user!.id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Check if product is already in wishlist
  if (user.wishlist.includes(productId as any)) {
    return next(new AppError('Product already in wishlist', 400));
  }

  user.wishlist.push(productId as any);
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Product added to wishlist'
  });
});

export const removeFromWishlist = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { productId } = req.params;

  const user = await User.findById(req.user!.id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const wishlistIndex = user.wishlist.findIndex(id => id.toString() === productId);
  
  if (wishlistIndex === -1) {
    return next(new AppError('Product not in wishlist', 404));
  }

  user.wishlist.splice(wishlistIndex, 1);
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Product removed from wishlist'
  });
});

export const getMe = (req: AuthRequest, res: Response, next: NextFunction) => {
  req.params.id = req.user!.id;
  next();
};

// Get user statistics (admin)
export const getUserStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        verifiedUsers: {
          $sum: { $cond: [{ $eq: ['$isEmailVerified', true] }, 1, 0] }
        },
        adminUsers: {
          $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
        }
      }
    }
  ]);

  const recentUsers = await User.find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('firstName lastName email createdAt');

  res.status(200).json({
    status: 'success',
    data: {
      stats: stats[0] || {
        totalUsers: 0,
        activeUsers: 0,
        verifiedUsers: 0,
        adminUsers: 0
      },
      recentUsers
    }
  });
});

/**
 * @desc    Get user activity log
 * @route   GET /api/v1/users/me/activity
 * @access  Private
 */
export const getUserActivity = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  // Mock activity log (in production, store in separate ActivityLog model)
  const activities = [
    {
      id: '1',
      type: 'order_placed',
      description: 'Placed order #ORD-12345',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      metadata: { orderId: 'ORD-12345', amount: 2499 }
    },
    {
      id: '2',
      type: 'profile_updated',
      description: 'Updated profile information',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      metadata: { fields: ['email', 'mobile'] }
    },
    {
      id: '3',
      type: 'address_added',
      description: 'Added new shipping address',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      metadata: { addressType: 'home' }
    },
    {
      id: '4',
      type: 'review_posted',
      description: 'Posted a product review',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      metadata: { productId: 'prod_123', rating: 5 }
    },
    {
      id: '5',
      type: 'login',
      description: 'Logged in from Chrome on Windows',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      metadata: { browser: 'Chrome', os: 'Windows' }
    }
  ];

  res.status(200).json({
    status: 'success',
    count: activities.length,
    page,
    pages: Math.ceil(activities.length / limit),
    data: activities
  });
});

/**
 * @desc    Get user preferences
 * @route   GET /api/v1/users/me/preferences
 * @access  Private
 */
export const getUserPreferences = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user!.id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Mock preferences (in production, store in user model or separate Preferences model)
  const preferences = {
    notifications: {
      email: {
        orderUpdates: true,
        promotions: true,
        newsletters: false,
        productRecommendations: true
      },
      sms: {
        orderUpdates: true,
        promotions: false,
        deliveryUpdates: true
      },
      push: {
        orderUpdates: true,
        promotions: true,
        newArrivals: false
      }
    },
    privacy: {
      showProfile: false,
      showWishlist: false,
      showReviews: true,
      allowDataSharing: false
    },
    display: {
      language: 'en',
      currency: 'INR',
      theme: 'light',
      itemsPerPage: 12
    },
    shopping: {
      defaultAddress: user.defaultAddress,
      preferredPaymentMethod: 'card',
      saveCreditCards: true,
      autoApplyCoupons: true
    }
  };

  res.status(200).json({
    status: 'success',
    data: preferences
  });
});

/**
 * @desc    Update user preferences
 * @route   PATCH /api/v1/users/me/preferences
 * @access  Private
 */
export const updateUserPreferences = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user!.id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // In production, save preferences to database
  // For now, just return success with the updated preferences
  const updatedPreferences = {
    ...req.body,
    updatedAt: new Date()
  };

  res.status(200).json({
    status: 'success',
    message: 'Preferences updated successfully',
    data: updatedPreferences
  });
});

/**
 * @desc    Upload user avatar
 * @route   PATCH /api/v1/users/me/avatar
 * @access  Private
 */
export const uploadAvatar = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(new AppError('Please upload an image', 400));
  }

  const user = await User.findById(req.user!.id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Update user avatar
  user.avatar = req.file.path;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'Avatar uploaded successfully',
    data: {
      avatar: user.avatar
    }
  });
});

/**
 * @desc    Delete user account
 * @route   DELETE /api/v1/users/me
 * @access  Private
 */
export const deleteMyAccount = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { password, reason } = req.body;

  if (!password) {
    return next(new AppError('Please provide your password to confirm account deletion', 400));
  }

  const user = await User.findById(req.user!.id).select('+password');
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Verify password
  const isPasswordCorrect = await user.comparePassword(password);
  
  if (!isPasswordCorrect) {
    return next(new AppError('Incorrect password', 401));
  }

  // Soft delete: set account as inactive
  user.isActive = false;
  user.accountStatus = 'deleted';
  user.deletedAt = new Date();
  user.deletionReason = reason || 'User requested account deletion';
  
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'Account has been successfully deleted. We\'re sorry to see you go!'
  });
});

/**
 * @desc    Add payment method
 * @route   POST /api/v1/users/me/payment-methods
 * @access  Private
 */
export const addPaymentMethod = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { type, cardNumber, cardHolder, expiryMonth, expiryYear, upiId } = req.body;

  const user = await User.findById(req.user!.id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Mock payment method (in production, store securely with tokenization)
  const paymentMethod = {
    id: `pm_${Date.now()}`,
    type,
    ...(type === 'card' && {
      card: {
        last4: cardNumber.slice(-4),
        brand: 'visa', // Detect from card number
        cardHolder,
        expiryMonth,
        expiryYear
      }
    }),
    ...(type === 'upi' && {
      upi: { vpa: upiId }
    }),
    isDefault: !user.paymentMethods || user.paymentMethods.length === 0,
    addedAt: new Date()
  };

  // In production, save to user.paymentMethods array
  res.status(201).json({
    status: 'success',
    message: 'Payment method added successfully',
    data: paymentMethod
  });
});

/**
 * @desc    Get payment methods
 * @route   GET /api/v1/users/me/payment-methods
 * @access  Private
 */
export const getPaymentMethods = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user!.id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Mock payment methods
  const paymentMethods = [
    {
      id: 'pm_1',
      type: 'card',
      card: {
        last4: '4242',
        brand: 'visa',
        cardHolder: 'John Doe',
        expiryMonth: 12,
        expiryYear: 2025
      },
      isDefault: true,
      addedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'pm_2',
      type: 'upi',
      upi: {
        vpa: 'user@paytm'
      },
      isDefault: false,
      addedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    }
  ];

  res.status(200).json({
    status: 'success',
    count: paymentMethods.length,
    data: paymentMethods
  });
});

/**
 * @desc    Delete payment method
 * @route   DELETE /api/v1/users/me/payment-methods/:id
 * @access  Private
 */
export const deletePaymentMethod = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const user = await User.findById(req.user!.id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // In production, remove from user.paymentMethods array
  res.status(200).json({
    status: 'success',
    message: 'Payment method removed successfully'
  });
});