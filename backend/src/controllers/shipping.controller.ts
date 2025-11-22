import { Request, Response, NextFunction } from 'express';
import { ShippingZone, ShippingMethod } from '../models/ShippingZone.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

/**
 * Calculate shipping rates
 */
export const calculateRates = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { destination, package: pkg } = req.body;

    if (!destination || !pkg) {
      return next(new AppError('Destination and package details are required', 400));
    }

    // Find matching zones
    const zones = await ShippingZone.findByLocation(
      destination.country,
      destination.state,
      destination.city,
      destination.zipcode
    );

    if (!zones || zones.length === 0) {
      res.status(200).json({
        status: 'success',
        data: {
          availableRates: [],
          message: 'No shipping zones found for this location'
        }
      });
      return;
    }

    // Get all methods for these zones
    const methodPromises = zones.map((zone: any) => 
      ShippingMethod.findByZone(zone._id.toString())
    );
    const methodsArrays = await Promise.all(methodPromises);
    const allMethods = methodsArrays.flat();

    // Calculate rates
    const rates = [];
    const errors = [];

    for (const method of allMethods) {
      try {
        const methodData = method as any;
        const rate = await ShippingMethod.calculateRate(methodData._id.toString(), {
          weight: pkg.weight,
          orderValue: pkg.value,
          itemCount: pkg.items?.length || 1
        });

        const estimatedDate = new Date();
        estimatedDate.setDate(estimatedDate.getDate() + methodData.deliveryEstimate.maxDays);

        rates.push({
          methodId: methodData._id,
          methodName: methodData.name,
          methodType: methodData.type,
          rate,
          currency: 'USD',
          deliveryEstimate: {
            minDays: methodData.deliveryEstimate.minDays,
            maxDays: methodData.deliveryEstimate.maxDays,
            estimatedDate: estimatedDate.toISOString()
          },
          features: {
            tracking: methodData.features.tracking,
            insurance: methodData.features.insurance,
            signature: methodData.features.signature
          }
        });
      } catch (error: any) {
        const methodData = method as any;
        errors.push({
          methodId: methodData._id,
          methodName: methodData.name,
          error: error.message
        });
      }
    }

    // Sort by rate
    rates.sort((a, b) => a.rate - b.rate);

    res.status(200).json({
      status: 'success',
      data: {
        availableRates: rates,
        recommendedRate: rates.length > 0 ? rates[0] : null,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  }
);

/**
 * Get all shipping zones
 */
export const getAllZones = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { status } = req.query;
    
    const query: any = {};
    if (status) query.status = status;

    const zones = await ShippingZone.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .lean();

    res.status(200).json({
      status: 'success',
      results: zones.length,
      data: {
        zones
      }
    });
  }
);

/**
 * Get shipping zone by ID
 */
export const getZone = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const zone = await ShippingZone.findById(id).lean();

    if (!zone) {
      return next(new AppError('Shipping zone not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        zone
      }
    });
  }
);

/**
 * Create shipping zone
 */
export const createZone = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const zone = await ShippingZone.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        zone
      }
    });
  }
);

/**
 * Update shipping zone
 */
export const updateZone = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const zone = await ShippingZone.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!zone) {
      return next(new AppError('Shipping zone not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        zone
      }
    });
  }
);

/**
 * Delete shipping zone
 */
export const deleteZone = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    // Check if zone has methods
    const methodCount = await ShippingMethod.countDocuments({ zoneId: id });
    if (methodCount > 0) {
      return next(new AppError('Cannot delete zone with active shipping methods', 400));
    }

    const zone = await ShippingZone.findByIdAndDelete(id);

    if (!zone) {
      return next(new AppError('Shipping zone not found', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  }
);

/**
 * Get all shipping methods
 */
export const getAllMethods = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { zoneId, status, type } = req.query;
    
    const query: any = {};
    if (zoneId) query.zoneId = zoneId;
    if (status) query.status = status;
    if (type) query.type = type;

    const methods = await ShippingMethod.find(query)
      .populate('zone', 'name status')
      .sort({ priority: -1, createdAt: -1 })
      .lean();

    res.status(200).json({
      status: 'success',
      results: methods.length,
      data: {
        methods
      }
    });
  }
);

/**
 * Get shipping method by ID
 */
export const getMethod = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const method = await ShippingMethod.findById(id)
      .populate('zone', 'name status')
      .lean();

    if (!method) {
      return next(new AppError('Shipping method not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        method
      }
    });
  }
);

/**
 * Create shipping method
 */
export const createMethod = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Verify zone exists
    const zone = await ShippingZone.findById(req.body.zoneId);
    if (!zone) {
      return next(new AppError('Shipping zone not found', 404));
    }

    const method = await ShippingMethod.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        method
      }
    });
  }
);

/**
 * Update shipping method
 */
export const updateMethod = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    // If zoneId is being updated, verify it exists
    if (req.body.zoneId) {
      const zone = await ShippingZone.findById(req.body.zoneId);
      if (!zone) {
        return next(new AppError('Shipping zone not found', 404));
      }
    }

    const method = await ShippingMethod.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!method) {
      return next(new AppError('Shipping method not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        method
      }
    });
  }
);

/**
 * Delete shipping method
 */
export const deleteMethod = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const method = await ShippingMethod.findByIdAndDelete(id);

    if (!method) {
      return next(new AppError('Shipping method not found', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  }
);

/**
 * Get methods by zone
 */
export const getMethodsByZone = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { zoneId } = req.params;

    const methods = await ShippingMethod.findByZone(zoneId);

    res.status(200).json({
      status: 'success',
      results: methods.length,
      data: {
        methods
      }
    });
  }
);

/**
 * Calculate single method rate
 */
export const calculateMethodRate = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { methodId } = req.params;
    const { weight, orderValue, itemCount } = req.body;

    if (!weight || !orderValue) {
      return next(new AppError('Weight and order value are required', 400));
    }

    try {
      const rate = await ShippingMethod.calculateRate(methodId, {
        weight,
        orderValue,
        itemCount: itemCount || 1
      });

      res.status(200).json({
        status: 'success',
        data: {
          rate,
          currency: 'USD'
        }
      });
    } catch (error: any) {
      return next(new AppError(error.message, 400));
    }
  }
);

/**
 * Get shipping statistics
 */
export const getShippingStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const [
      totalZones,
      activeZones,
      totalMethods,
      activeMethods,
      methodsByType
    ] = await Promise.all([
      ShippingZone.countDocuments(),
      ShippingZone.countDocuments({ status: 'active' }),
      ShippingMethod.countDocuments(),
      ShippingMethod.countDocuments({ status: 'active' }),
      ShippingMethod.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        zones: {
          total: totalZones,
          active: activeZones,
          inactive: totalZones - activeZones
        },
        methods: {
          total: totalMethods,
          active: activeMethods,
          inactive: totalMethods - activeMethods
        },
        methodsByType: methodsByType.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  }
);
