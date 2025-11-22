
import { Request, Response, NextFunction } from 'express';
import User from '../models/User.model.js';
import Order from '../models/Order.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import { AuthRequest } from '../types/index.js';

export const getAllCustomers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const query: any = { role: 'user' };
  
  if (req.query.search) {
    query.$or = [
      { firstName: { $regex: req.query.search, $options: 'i' } },
      { lastName: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  if (req.query.status) {
    query.isActive = req.query.status === 'active';
  }

  const customers = await User.find(query)
    .select('-password -passwordResetToken -passwordResetExpires')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Get order statistics for each customer
  const customersWithStats = await Promise.all(
    customers.map(async (customer) => {
      const orderStats = await Order.aggregate([
        { $match: { user: customer._id } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: '$total' },
            lastOrderDate: { $max: '$createdAt' }
          }
        }
      ]);

      const stats = orderStats[0] || { totalOrders: 0, totalSpent: 0, lastOrderDate: null };

      return {
        ...customer.toObject(),
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent,
        lastOrderDate: stats.lastOrderDate
      };
    })
  );

  const total = await User.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: customersWithStats.length,
    pagination: {
      page,
      pages: Math.ceil(total / limit),
      total
    },
    data: {
      customers: customersWithStats
    }
  });
});

export const getCustomer = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const customer = await User.findById(req.params.id)
    .select('-password -passwordResetToken -passwordResetExpires');

  if (!customer) {
    return next(new AppError('Customer not found', 404));
  }

  // Get customer's order statistics
  const orderStats = await Order.aggregate([
    { $match: { user: customer._id } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: '$total' },
        lastOrderDate: { $max: '$createdAt' }
      }
    }
  ]);

  const stats = orderStats[0] || { totalOrders: 0, totalSpent: 0, lastOrderDate: null };

  // Get recent orders
  const recentOrders = await Order.find({ user: customer._id })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('orderNumber total status createdAt');

  res.status(200).json({
    status: 'success',
    data: {
      customer: {
        ...customer.toObject(),
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent,
        lastOrderDate: stats.lastOrderDate,
        recentOrders
      }
    }
  });
});

export const createCustomer = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const {
    firstName,
    lastName,
    email,
    password,
    mobile,
    role = 'user',
    isActive = true,
    isEmailVerified = false,
    dateOfBirth,
    gender,
    addresses
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User with this email already exists', 400));
  }

  // Handle avatar upload
  let avatar = '';
  if (req.file) {
    try {
      const result = await uploadToCloudinary(req.file.buffer, 'users');
      avatar = result.secure_url;
    } catch (error) {
      return next(new AppError('Failed to upload avatar', 500));
    }
  }

  // Parse addresses if provided as string
  let parsedAddresses = [];
  if (addresses) {
    try {
      parsedAddresses = typeof addresses === 'string' ? JSON.parse(addresses) : addresses;
    } catch (error) {
      return next(new AppError('Invalid addresses format', 400));
    }
  }

  // Create new user
  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password,
    mobile,
    role,
    isActive,
    isEmailVerified,
    avatar,
    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
    gender,
    addresses: parsedAddresses
  });

  // Remove password from response
  const { password: _, ...userResponse } = newUser.toObject();

  res.status(201).json({
    status: 'success',
    data: {
      user: userResponse
    }
  });
});

export const updateCustomer = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const {
    firstName,
    lastName,
    email,
    mobile,
    role,
    isActive,
    isEmailVerified,
    dateOfBirth,
    gender,
    addresses
  } = req.body;

  const customer = await User.findById(req.params.id);

  if (!customer) {
    return next(new AppError('Customer not found', 404));
  }

  // Check if email is being changed and if it already exists
  if (email && email !== customer.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('User with this email already exists', 400));
    }
  }

  // Handle avatar upload
  let avatar = customer.avatar;
  if (req.file) {
    try {
      // Delete old avatar if exists
      if (customer.avatar) {
        try {
          const publicId = customer.avatar.split('/').pop()?.split('.')[0];
          if (publicId) {
            await deleteFromCloudinary(publicId);
          }
        } catch (error) {
          console.log('Failed to delete old avatar:', error);
        }
      }

      // Upload new avatar
      const result = await uploadToCloudinary(req.file.buffer, 'users');
      avatar = result.secure_url;
    } catch (error) {
      return next(new AppError('Failed to upload avatar', 500));
    }
  }

  // Parse addresses if provided as string
  let parsedAddresses = customer.addresses;
  if (addresses !== undefined) {
    try {
      parsedAddresses = typeof addresses === 'string' ? JSON.parse(addresses) : addresses;
    } catch (error) {
      return next(new AppError('Invalid addresses format', 400));
    }
  }

  // Update user
  const updatedCustomer = await User.findByIdAndUpdate(
    req.params.id,
    {
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
      ...(email !== undefined && { email }),
      ...(mobile !== undefined && { mobile }),
      ...(role !== undefined && { role }),
      ...(isActive !== undefined && { isActive }),
      ...(isEmailVerified !== undefined && { isEmailVerified }),
      ...(dateOfBirth !== undefined && { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null }),
      ...(gender !== undefined && { gender }),
      ...(avatar !== customer.avatar && { avatar }),
      ...(parsedAddresses !== customer.addresses && { addresses: parsedAddresses })
    },
    {
      new: true,
      runValidators: true
    }
  ).select('-password -passwordResetToken -passwordResetExpires');

  res.status(200).json({
    status: 'success',
    data: {
      customer: updatedCustomer
    }
  });
});

export const deleteCustomer = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const customer = await User.findById(req.params.id);

  if (!customer) {
    return next(new AppError('Customer not found', 404));
  }

  // Check if customer has orders
  const orderCount = await Order.countDocuments({ user: customer._id });
  
  if (orderCount > 0) {
    return next(new AppError('Cannot delete customer with existing orders. Deactivate instead.', 400));
  }

  // Delete avatar from Cloudinary if exists
  if (customer.avatar) {
    try {
      const publicId = customer.avatar.split('/').pop()?.split('.')[0];
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    } catch (error) {
      console.log('Failed to delete avatar from Cloudinary:', error);
      // Continue with user deletion even if avatar deletion fails
    }
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

export const getCustomerStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const totalCustomers = await User.countDocuments({ role: 'user' });
  const activeCustomers = await User.countDocuments({ role: 'user', isActive: true });
  const verifiedCustomers = await User.countDocuments({ role: 'user', isEmailVerified: true });
  
  // New customers this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const newCustomersThisMonth = await User.countDocuments({
    role: 'user',
    createdAt: { $gte: startOfMonth }
  });

  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        totalCustomers,
        activeCustomers,
        verifiedCustomers,
        newCustomersThisMonth
      }
    }
  });
});
