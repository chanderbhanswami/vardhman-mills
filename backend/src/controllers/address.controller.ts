import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Address from '../models/Address.model.js';
import User from '../models/User.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// ==================== ADDRESS CRUD ====================

/**
 * Get all addresses for the authenticated user
 * GET /api/v1/addresses
 */
export const getAddresses = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.user?._id as unknown as mongoose.Types.ObjectId;
  const { type, includeInactive } = req.query;

  const addresses = await Address.getUserAddresses(
    userId,
    type as string,
    includeInactive === 'true'
  );

  res.status(200).json({
    status: 'success',
    results: addresses.length,
    data: { addresses }
  });
});

/**
 * Get a single address by ID
 * GET /api/v1/addresses/:id
 */
export const getAddress = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?._id;

  const address = await Address.findOne({ _id: id, user: userId });

  if (!address) {
    return next(new AppError('Address not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { address }
  });
});

/**
 * Create a new address
 * POST /api/v1/addresses
 */
export const createAddress = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.user?._id;

  // Add user to address data
  const addressData = {
    ...req.body,
    user: userId
  };

  // Validate pincode
  if (addressData.pincode && addressData.country) {
    const isValidPincode = Address.validatePincode(addressData.pincode, addressData.country);
    if (!isValidPincode) {
      return next(new AppError('Invalid pincode format for the specified country', 400));
    }
  }

  // If this is the first address or isDefault is true, set as default
  const existingAddresses = await Address.countDocuments({ user: userId, isActive: true });
  if (existingAddresses === 0 || addressData.isDefault === true) {
    addressData.isDefault = true;
  }

  const address = await Address.create(addressData);

  res.status(201).json({
    status: 'success',
    data: { address }
  });
});

/**
 * Update an address
 * PATCH /api/v1/addresses/:id
 */
export const updateAddress = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?._id;

  // Don't allow updating user field
  delete req.body.user;

  // Validate pincode if being updated
  if (req.body.pincode && req.body.country) {
    const isValidPincode = Address.validatePincode(req.body.pincode, req.body.country);
    if (!isValidPincode) {
      return next(new AppError('Invalid pincode format for the specified country', 400));
    }
  }

  const address = await Address.findOneAndUpdate(
    { _id: id, user: userId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!address) {
    return next(new AppError('Address not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { address }
  });
});

/**
 * Delete an address (soft delete)
 * DELETE /api/v1/addresses/:id
 */
export const deleteAddress = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?._id;

  const address = await Address.findOne({ _id: id, user: userId });

  if (!address) {
    return next(new AppError('Address not found', 404));
  }

  // Check if this is the default address
  const isDefault = address.isDefault;

  // Soft delete
  address.isActive = false;
  address.deletedAt = new Date();
  await address.save();

  // If this was the default address, set another address as default
  if (isDefault) {
    const nextAddress = await Address.findOne({
      user: userId,
      isActive: true,
      _id: { $ne: id }
    }).sort({ lastUsedAt: -1, createdAt: -1 });

    if (nextAddress) {
      nextAddress.isDefault = true;
      await nextAddress.save();
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'Address deleted successfully'
  });
});

// ==================== DEFAULT ADDRESS OPERATIONS ====================

/**
 * Get default address
 * GET /api/v1/addresses/default
 */
export const getDefaultAddress = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.user?._id as unknown as mongoose.Types.ObjectId;
  const { type } = req.query;

  const address = await Address.getDefaultAddress(
    userId,
    type as 'shipping' | 'billing'
  );

  if (!address) {
    return next(new AppError('No default address found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { address }
  });
});

/**
 * Set an address as default
 * PATCH /api/v1/addresses/:id/set-default
 */
export const setDefaultAddress = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?._id as unknown as mongoose.Types.ObjectId;

  // Verify address belongs to user
  const address = await Address.findOne({ _id: id, user: userId, isActive: true });

  if (!address) {
    return next(new AppError('Address not found', 404));
  }

  // Set as default using the static method
  const updatedAddress = await Address.setAsDefault(
    new mongoose.Types.ObjectId(id),
    userId
  );

  res.status(200).json({
    status: 'success',
    data: { address: updatedAddress }
  });
});

// ==================== ADDRESS VERIFICATION ====================

/**
 * Verify an address
 * POST /api/v1/addresses/:id/verify
 */
export const verifyAddress = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?._id;
  const { method = 'manual' } = req.body;

  const address = await Address.findOne({ _id: id, user: userId });

  if (!address) {
    return next(new AppError('Address not found', 404));
  }

  // Verify the address
  await address.verify(method);

  res.status(200).json({
    status: 'success',
    data: { address }
  });
});

/**
 * Validate address format
 * POST /api/v1/addresses/validate
 */
export const validateAddress = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { pincode, country, addressLine1, city, state } = req.body;

  const errors: string[] = [];

  // Validate required fields
  if (!addressLine1) errors.push('Address line 1 is required');
  if (!city) errors.push('City is required');
  if (!state) errors.push('State is required');
  if (!country) errors.push('Country is required');
  if (!pincode) errors.push('Pincode is required');

  // Validate pincode format
  if (pincode && country) {
    const isValidPincode = Address.validatePincode(pincode, country);
    if (!isValidPincode) {
      errors.push('Invalid pincode format for the specified country');
    }
  }

  const isValid = errors.length === 0;

  res.status(200).json({
    status: 'success',
    data: {
      isValid,
      errors: errors.length > 0 ? errors : undefined
    }
  });
});

// ==================== USAGE STATISTICS ====================

/**
 * Get most used addresses
 * GET /api/v1/addresses/most-used
 */
export const getMostUsedAddresses = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.user?._id as unknown as mongoose.Types.ObjectId;
  const limit = parseInt(req.query.limit as string) || 5;

  const addresses = await Address.getMostUsedAddresses(userId, limit);

  res.status(200).json({
    status: 'success',
    results: addresses.length,
    data: { addresses }
  });
});

/**
 * Mark address as used
 * POST /api/v1/addresses/:id/mark-used
 */
export const markAddressAsUsed = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?._id;

  const address = await Address.findOne({ _id: id, user: userId });

  if (!address) {
    return next(new AppError('Address not found', 404));
  }

  await address.markAsUsed();

  res.status(200).json({
    status: 'success',
    data: { address }
  });
});

// ==================== BULK OPERATIONS ====================

/**
 * Bulk create addresses
 * POST /api/v1/addresses/bulk
 */
export const bulkCreateAddresses = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.user?._id;
  const { addresses } = req.body;

  if (!Array.isArray(addresses) || addresses.length === 0) {
    return next(new AppError('Please provide an array of addresses', 400));
  }

  // Add user ID to each address
  const addressesWithUser = addresses.map(addr => ({
    ...addr,
    user: userId
  }));

  // Validate pincodes
  for (const addr of addressesWithUser) {
    if (addr.pincode && addr.country) {
      const isValidPincode = Address.validatePincode(addr.pincode, addr.country);
      if (!isValidPincode) {
        return next(new AppError(`Invalid pincode format for ${addr.label || 'one of the addresses'}`, 400));
      }
    }
  }

  const createdAddresses = await Address.insertMany(addressesWithUser);

  res.status(201).json({
    status: 'success',
    results: createdAddresses.length,
    data: { addresses: createdAddresses }
  });
});

/**
 * Bulk delete addresses
 * DELETE /api/v1/addresses/bulk
 */
export const bulkDeleteAddresses = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.user?._id;
  const { addressIds } = req.body;

  if (!Array.isArray(addressIds) || addressIds.length === 0) {
    return next(new AppError('Please provide an array of address IDs', 400));
  }

  // Soft delete multiple addresses
  const result = await Address.updateMany(
    {
      _id: { $in: addressIds },
      user: userId
    },
    {
      isActive: false,
      deletedAt: new Date()
    }
  );

  res.status(200).json({
    status: 'success',
    message: `${result.modifiedCount} addresses deleted successfully`,
    data: {
      deletedCount: result.modifiedCount
    }
  });
});

// ==================== SEARCH & FILTER ====================

/**
 * Search addresses
 * GET /api/v1/addresses/search
 */
export const searchAddresses = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.user?._id;
  const { q, city, state, pincode, type } = req.query;

  const query: any = {
    user: userId,
    isActive: true
  };

  // Text search
  if (q) {
    query.$or = [
      { label: { $regex: q, $options: 'i' } },
      { addressLine1: { $regex: q, $options: 'i' } },
      { addressLine2: { $regex: q, $options: 'i' } },
      { city: { $regex: q, $options: 'i' } },
      { state: { $regex: q, $options: 'i' } },
      { landmark: { $regex: q, $options: 'i' } }
    ];
  }

  // Filter by city
  if (city) {
    query.city = { $regex: city, $options: 'i' };
  }

  // Filter by state
  if (state) {
    query.state = { $regex: state, $options: 'i' };
  }

  // Filter by pincode
  if (pincode) {
    query.pincode = pincode;
  }

  // Filter by type
  if (type && type !== 'all') {
    query.$or = [
      { type: type },
      { type: 'both' }
    ];
  }

  const addresses = await Address.find(query).sort({ isDefault: -1, lastUsedAt: -1 });

  res.status(200).json({
    status: 'success',
    results: addresses.length,
    data: { addresses }
  });
});

/**
 * Get addresses by location (city/state/pincode)
 * GET /api/v1/addresses/by-location
 */
export const getAddressesByLocation = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.user?._id;
  const { city, state, pincode } = req.query;

  if (!city && !state && !pincode) {
    return next(new AppError('Please provide at least one location parameter', 400));
  }

  const query: any = {
    user: userId,
    isActive: true
  };

  if (city) query.city = { $regex: city, $options: 'i' };
  if (state) query.state = { $regex: state, $options: 'i' };
  if (pincode) query.pincode = pincode;

  const addresses = await Address.find(query).sort({ isDefault: -1, lastUsedAt: -1 });

  res.status(200).json({
    status: 'success',
    results: addresses.length,
    data: { addresses }
  });
});

// ==================== ADDRESS SUGGESTIONS ====================

/**
 * Get address suggestions based on partial input
 * GET /api/v1/addresses/suggestions
 */
export const getAddressSuggestions = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.user?._id;
  const { field, value } = req.query;

  if (!field || !value) {
    return next(new AppError('Please provide field and value parameters', 400));
  }

  const validFields = ['city', 'state', 'pincode', 'landmark'];
  if (!validFields.includes(field as string)) {
    return next(new AppError('Invalid field. Allowed fields: city, state, pincode, landmark', 400));
  }

  // Get unique values for the specified field
  const suggestions = await Address.distinct(field as string, {
    user: userId,
    isActive: true,
    [field as string]: { $regex: value, $options: 'i' }
  });

  res.status(200).json({
    status: 'success',
    results: suggestions.length,
    data: { suggestions }
  });
});

// ==================== ADDRESS ANALYTICS ====================

/**
 * Get address statistics for user
 * GET /api/v1/addresses/stats
 */
export const getAddressStats = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.user?._id as unknown as mongoose.Types.ObjectId;

  const [totalAddresses, verifiedAddresses, defaultAddresses, addressesByType] = await Promise.all([
    Address.countDocuments({ user: userId, isActive: true }),
    Address.countDocuments({ user: userId, isActive: true, isVerified: true }),
    Address.countDocuments({ user: userId, isActive: true, isDefault: true }),
    Address.aggregate([
      { $match: { user: userId, isActive: true } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ])
  ]);

  const mostUsed = await Address.getMostUsedAddresses(userId, 3);

  res.status(200).json({
    status: 'success',
    data: {
      totalAddresses,
      verifiedAddresses,
      defaultAddresses,
      addressesByType,
      mostUsedAddresses: mostUsed
    }
  });
});

/**
 * Get addresses by city (grouped)
 * GET /api/v1/addresses/group-by-city
 */
export const getAddressesByCity = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.user?._id;

  const addressesByCity = await Address.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId as string),
        isActive: true
      }
    },
    {
      $group: {
        _id: '$city',
        count: { $sum: 1 },
        addresses: {
          $push: {
            _id: '$_id',
            label: '$label',
            addressLine1: '$addressLine1',
            pincode: '$pincode',
            isDefault: '$isDefault'
          }
        }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  res.status(200).json({
    status: 'success',
    results: addressesByCity.length,
    data: { addressesByCity }
  });
});

// ==================== ADMIN OPERATIONS ====================

/**
 * Get all addresses (admin only)
 * GET /api/v1/addresses/admin/all
 */
export const getAllAddresses = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const { verified, type, city, state } = req.query;

  const query: any = {};

  if (verified !== undefined) {
    query.isVerified = verified === 'true';
  }

  if (type) {
    query.type = type;
  }

  if (city) {
    query.city = { $regex: city, $options: 'i' };
  }

  if (state) {
    query.state = { $regex: state, $options: 'i' };
  }

  const [addresses, total] = await Promise.all([
    Address.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Address.countDocuments(query)
  ]);

  res.status(200).json({
    status: 'success',
    results: addresses.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: { addresses }
  });
});

/**
 * Get address analytics (admin only)
 * GET /api/v1/addresses/admin/analytics
 */
export const getAddressAnalytics = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const [
    totalAddresses,
    verifiedAddresses,
    addressesByType,
    topCities,
    topStates,
    recentAddresses
  ] = await Promise.all([
    Address.countDocuments({ isActive: true }),
    Address.countDocuments({ isActive: true, isVerified: true }),
    Address.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]),
    Address.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    Address.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$state', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    Address.find({ isActive: true })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      overview: {
        totalAddresses,
        verifiedAddresses,
        verificationRate: totalAddresses > 0 ? ((verifiedAddresses / totalAddresses) * 100).toFixed(2) : 0
      },
      addressesByType,
      topCities,
      topStates,
      recentAddresses
    }
  });
});

/**
 * Verify multiple addresses (admin only)
 * POST /api/v1/addresses/admin/verify-bulk
 */
export const bulkVerifyAddresses = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { addressIds, method = 'manual' } = req.body;

  if (!Array.isArray(addressIds) || addressIds.length === 0) {
    return next(new AppError('Please provide an array of address IDs', 400));
  }

  const result = await Address.updateMany(
    { _id: { $in: addressIds } },
    {
      isVerified: true,
      verifiedAt: new Date(),
      verificationMethod: method
    }
  );

  res.status(200).json({
    status: 'success',
    message: `${result.modifiedCount} addresses verified successfully`,
    data: {
      verifiedCount: result.modifiedCount
    }
  });
});
