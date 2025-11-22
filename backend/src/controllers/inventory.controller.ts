import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import {
  InventoryItem,
  StockMovement,
  Warehouse,
  InventoryAlert
} from '../models/inventory.model';
import Product from '../models/Product.model';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { AuthRequest } from '../types';

// ============================================
// INVENTORY ITEMS
// ============================================

// Get all inventory items
export const getInventoryItems = catchAsync(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 50,
    sort = '-createdAt',
    status,
    warehouseId,
    productId,
    sku,
    minQuantity,
    maxQuantity,
    lowStock
  } = req.query;

  const query: any = {};

  if (status) query.status = status;
  if (warehouseId) query['location.warehouseId'] = warehouseId;
  if (productId) query.productId = productId;
  if (sku) query.sku = { $regex: sku, $options: 'i' };
  if (minQuantity || maxQuantity) {
    query.quantity = {};
    if (minQuantity) query.quantity.$gte = Number(minQuantity);
    if (maxQuantity) query.quantity.$lte = Number(maxQuantity);
  }
  if (lowStock === 'true') {
    query.$expr = { $lte: ['$quantity', '$reorderLevel'] };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    InventoryItem.find(query)
      .populate('productId', 'name images category')
      .populate('location.warehouseId', 'name code')
      .sort(sort as string)
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    InventoryItem.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: items.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: items
  });
});

// Get inventory item by ID
export const getInventoryItemById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const item = await InventoryItem.findById(req.params.id)
    .populate('productId', 'name images category brand')
    .populate('location.warehouseId', 'name code address')
    .lean();

  if (!item) {
    return next(new AppError('Inventory item not found', 404));
  }

  res.status(200).json({
    success: true,
    data: item
  });
});

// Get inventory by product
export const getInventoryByProduct = catchAsync(async (req: Request, res: Response) => {
  const items = await InventoryItem.find({ productId: req.params.productId })
    .populate('location.warehouseId', 'name code')
    .lean();

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAvailable = items.reduce((sum, item) => sum + item.availableQuantity, 0);
  const totalReserved = items.reduce((sum, item) => sum + item.reservedQuantity, 0);

  res.status(200).json({
    success: true,
    count: items.length,
    summary: {
      totalQuantity,
      totalAvailable,
      totalReserved
    },
    data: items
  });
});

// Get inventory by SKU
export const getInventoryBySku = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const item = await InventoryItem.findOne({ sku: req.params.sku })
    .populate('productId', 'name images category brand')
    .populate('location.warehouseId', 'name code address')
    .lean();

  if (!item) {
    return next(new AppError('Inventory item not found', 404));
  }

  res.status(200).json({
    success: true,
    data: item
  });
});

// Create inventory item
export const createInventoryItem = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Check if SKU already exists
  const existingItem = await InventoryItem.findOne({ sku: req.body.sku });
  if (existingItem) {
    return next(new AppError('SKU already exists', 400));
  }

  // Verify product exists
  const product = await Product.findById(req.body.productId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Verify warehouse exists
  const warehouse = await Warehouse.findById(req.body.location.warehouseId);
  if (!warehouse) {
    return next(new AppError('Warehouse not found', 404));
  }

  req.body.location.warehouseName = warehouse.name;

  const item = await InventoryItem.create(req.body);

  // Create initial stock movement
  await StockMovement.create({
    inventoryItemId: item._id,
    productId: item.productId,
    sku: item.sku,
    type: 'adjustment',
    quantity: item.quantity,
    previousQuantity: 0,
    newQuantity: item.quantity,
    toWarehouse: item.location.warehouseId,
    reason: 'Initial stock',
    userId: req.user?._id,
    userName: req.user?.firstName
  });

  res.status(201).json({
    success: true,
    message: 'Inventory item created successfully',
    data: item
  });
});

// Update inventory item
export const updateInventoryItem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const item = await InventoryItem.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!item) {
    return next(new AppError('Inventory item not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Inventory item updated successfully',
    data: item
  });
});

// Delete inventory item
export const deleteInventoryItem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const item = await InventoryItem.findById(req.params.id);

  if (!item) {
    return next(new AppError('Inventory item not found', 404));
  }

  if (item.quantity > 0) {
    return next(new AppError('Cannot delete inventory item with stock. Adjust stock to 0 first.', 400));
  }

  await item.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Inventory item deleted successfully'
  });
});

// ============================================
// STOCK MANAGEMENT
// ============================================

// Adjust stock
export const adjustStock = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { quantity, reason, notes } = req.body;

  if (!quantity || quantity === 0) {
    return next(new AppError('Quantity is required and must not be zero', 400));
  }

  const item = await InventoryItem.findById(req.params.id);
  if (!item) {
    return next(new AppError('Inventory item not found', 404));
  }

  const previousQuantity = item.quantity;
  const newQuantity = previousQuantity + quantity;

  if (newQuantity < 0) {
    return next(new AppError('Insufficient stock for this adjustment', 400));
  }

  item.quantity = newQuantity;
  item.lastStockMovement = {
    type: 'adjustment',
    quantity,
    reason,
    timestamp: new Date(),
    userId: req.user?._id as any
  };
  await item.save();

  // Create stock movement record
  await StockMovement.create({
    inventoryItemId: item._id,
    productId: item.productId,
    sku: item.sku,
    type: 'adjustment',
    quantity: Math.abs(quantity),
    previousQuantity,
    newQuantity,
    toWarehouse: item.location.warehouseId,
    reason,
    notes,
    userId: req.user?._id as any,
    userName: req.user?.firstName
  });

  // Check and create alerts if needed
  await checkAndCreateAlerts(item);

  res.status(200).json({
    success: true,
    message: 'Stock adjusted successfully',
    data: {
      previousQuantity,
      adjustment: quantity,
      newQuantity,
      availableQuantity: item.availableQuantity,
      status: item.status
    }
  });
});

// Reserve stock
export const reserveStock = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { quantity, orderId, notes } = req.body;

  if (!quantity || quantity <= 0) {
    return next(new AppError('Quantity must be greater than zero', 400));
  }

  const item = await InventoryItem.findById(req.params.id);
  if (!item) {
    return next(new AppError('Inventory item not found', 404));
  }

  if (item.availableQuantity < quantity) {
    return next(new AppError(`Insufficient available stock. Available: ${item.availableQuantity}`, 400));
  }

  item.reservedQuantity += quantity;
  await item.save();

  // Create stock movement record
  await StockMovement.create({
    inventoryItemId: item._id,
    productId: item.productId,
    sku: item.sku,
    type: 'adjustment',
    quantity,
    previousQuantity: item.quantity,
    newQuantity: item.quantity,
    reason: 'Stock reservation',
    notes: notes || `Reserved for order: ${orderId}`,
    referenceType: 'order',
    referenceId: orderId,
    userId: req.user?._id as any,
    userName: req.user?.firstName
  });

  res.status(200).json({
    success: true,
    message: 'Stock reserved successfully',
    data: {
      quantity: item.quantity,
      reservedQuantity: item.reservedQuantity,
      availableQuantity: item.availableQuantity
    }
  });
});

// Release reserved stock
export const releaseReservedStock = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { quantity, reason, notes } = req.body;

  if (!quantity || quantity <= 0) {
    return next(new AppError('Quantity must be greater than zero', 400));
  }

  const item = await InventoryItem.findById(req.params.id);
  if (!item) {
    return next(new AppError('Inventory item not found', 404));
  }

  if (item.reservedQuantity < quantity) {
    return next(new AppError(`Cannot release more than reserved. Reserved: ${item.reservedQuantity}`, 400));
  }

  item.reservedQuantity -= quantity;
  await item.save();

  // Create stock movement record
  await StockMovement.create({
    inventoryItemId: item._id,
    productId: item.productId,
    sku: item.sku,
    type: 'adjustment',
    quantity,
    previousQuantity: item.quantity,
    newQuantity: item.quantity,
    reason: reason || 'Reserved stock released',
    notes,
    userId: req.user?._id as any,
    userName: req.user?.firstName
  });

  res.status(200).json({
    success: true,
    message: 'Reserved stock released successfully',
    data: {
      quantity: item.quantity,
      reservedQuantity: item.reservedQuantity,
      availableQuantity: item.availableQuantity
    }
  });
});

// Transfer stock
export const transferStock = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { fromItemId, toWarehouseId, quantity, reason, notes } = req.body;

  if (!quantity || quantity <= 0) {
    return next(new AppError('Quantity must be greater than zero', 400));
  }

  const fromItem = await InventoryItem.findById(fromItemId);
  if (!fromItem) {
    return next(new AppError('Source inventory item not found', 404));
  }

  if (fromItem.availableQuantity < quantity) {
    return next(new AppError('Insufficient available stock for transfer', 400));
  }

  const toWarehouse = await Warehouse.findById(toWarehouseId);
  if (!toWarehouse) {
    return next(new AppError('Destination warehouse not found', 404));
  }

  // Find or create destination inventory item
  let toItem = await InventoryItem.findOne({
    productId: fromItem.productId,
    variantId: fromItem.variantId,
    'location.warehouseId': toWarehouseId
  });

  if (!toItem) {
    // Create new inventory item at destination
    toItem = await InventoryItem.create({
      productId: fromItem.productId,
      variantId: fromItem.variantId,
      sku: `${fromItem.sku}-${toWarehouse.code}`,
      quantity: 0,
      reservedQuantity: 0,
      unitCost: fromItem.unitCost,
      reorderLevel: fromItem.reorderLevel,
      reorderQuantity: fromItem.reorderQuantity,
      location: {
        warehouseId: toWarehouse._id,
        warehouseName: toWarehouse.name
      },
      trackingMethod: fromItem.trackingMethod,
      status: 'in_stock'
    });
  }

  // Update quantities
  fromItem.quantity -= quantity;
  await fromItem.save();

  toItem.quantity += quantity;
  await toItem.save();

  // Create stock movement records
  await StockMovement.create([
    {
      inventoryItemId: fromItem._id,
      productId: fromItem.productId,
      sku: fromItem.sku,
      type: 'transfer',
      quantity: -quantity,
      previousQuantity: fromItem.quantity + quantity,
      newQuantity: fromItem.quantity,
      fromWarehouse: fromItem.location.warehouseId,
      toWarehouse: toWarehouse._id,
      reason: reason || 'Stock transfer',
      notes,
      userId: req.user?._id as any,
      userName: req.user?.firstName
    },
    {
      inventoryItemId: toItem._id,
      productId: toItem.productId,
      sku: toItem.sku,
      type: 'transfer',
      quantity,
      previousQuantity: toItem.quantity - quantity,
      newQuantity: toItem.quantity,
      fromWarehouse: fromItem.location.warehouseId,
      toWarehouse: toWarehouse._id,
      reason: reason || 'Stock transfer',
      notes,
      userId: req.user?._id as any,
      userName: req.user?.firstName
    }
  ]);

  // Check alerts for both items
  await Promise.all([
    checkAndCreateAlerts(fromItem),
    checkAndCreateAlerts(toItem)
  ]);

  res.status(200).json({
    success: true,
    message: 'Stock transferred successfully',
    data: {
      from: {
        warehouseName: fromItem.location.warehouseName,
        newQuantity: fromItem.quantity,
        availableQuantity: fromItem.availableQuantity
      },
      to: {
        warehouseName: toItem.location.warehouseName,
        newQuantity: toItem.quantity,
        availableQuantity: toItem.availableQuantity
      },
      transferredQuantity: quantity
    }
  });
});

// ============================================
// STOCK MOVEMENTS
// ============================================

// Get stock movements
export const getStockMovements = catchAsync(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 50,
    type,
    productId,
    warehouseId,
    startDate,
    endDate
  } = req.query;

  const query: any = {};

  if (type) query.type = type;
  if (productId) query.productId = productId;
  if (warehouseId) {
    query.$or = [
      { fromWarehouse: warehouseId },
      { toWarehouse: warehouseId }
    ];
  }
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate as string);
    if (endDate) query.createdAt.$lte = new Date(endDate as string);
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [movements, total] = await Promise.all([
    StockMovement.find(query)
      .populate('productId', 'name images')
      .populate('fromWarehouse', 'name code')
      .populate('toWarehouse', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    StockMovement.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: movements.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: movements
  });
});

// Get stock movement by ID
export const getStockMovementById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const movement = await StockMovement.findById(req.params.id)
    .populate('productId', 'name images category brand')
    .populate('inventoryItemId')
    .populate('fromWarehouse', 'name code address')
    .populate('toWarehouse', 'name code address')
    .populate('userId', 'name email')
    .lean();

  if (!movement) {
    return next(new AppError('Stock movement not found', 404));
  }

  res.status(200).json({
    success: true,
    data: movement
  });
});

// Helper function to check and create alerts
async function checkAndCreateAlerts(item: any) {
  const product = await Product.findById(item.productId).select('name').lean();
  if (!product) return;

  // Check for out of stock
  if (item.quantity === 0) {
    await InventoryAlert.findOneAndUpdate(
      {
        inventoryItemId: item._id,
        type: 'out_of_stock',
        status: 'active'
      },
      {
        inventoryItemId: item._id,
        productId: item.productId,
        sku: item.sku,
        productName: product.name,
        warehouseId: item.location.warehouseId,
        warehouseName: item.location.warehouseName,
        type: 'out_of_stock',
        severity: 'critical',
        message: `${product.name} is out of stock at ${item.location.warehouseName}`,
        currentQuantity: item.quantity,
        threshold: 0,
        status: 'active'
      },
      { upsert: true, new: true }
    );
  }
  // Check for low stock
  else if (item.quantity <= item.reorderLevel) {
    await InventoryAlert.findOneAndUpdate(
      {
        inventoryItemId: item._id,
        type: 'low_stock',
        status: 'active'
      },
      {
        inventoryItemId: item._id,
        productId: item.productId,
        sku: item.sku,
        productName: product.name,
        warehouseId: item.location.warehouseId,
        warehouseName: item.location.warehouseName,
        type: 'low_stock',
        severity: item.quantity <= item.reorderLevel / 2 ? 'high' : 'medium',
        message: `${product.name} is running low at ${item.location.warehouseName}. Current: ${item.quantity}, Reorder Level: ${item.reorderLevel}`,
        currentQuantity: item.quantity,
        threshold: item.reorderLevel,
        status: 'active'
      },
      { upsert: true, new: true }
    );
  } else {
    // Resolve existing alerts if stock is now sufficient
    await InventoryAlert.updateMany(
      {
        inventoryItemId: item._id,
        type: { $in: ['low_stock', 'out_of_stock'] },
        status: 'active'
      },
      {
        status: 'resolved',
        resolvedAt: new Date()
      }
    );
  }

  // Check for expiry warnings (if batch info exists)
  if (item.batchInfo?.expiryDate) {
    const daysUntilExpiry = Math.ceil((item.batchInfo.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
      await InventoryAlert.findOneAndUpdate(
        {
          inventoryItemId: item._id,
          type: 'expiry_warning',
          status: 'active'
        },
        {
          inventoryItemId: item._id,
          productId: item.productId,
          sku: item.sku,
          productName: product.name,
          warehouseId: item.location.warehouseId,
          warehouseName: item.location.warehouseName,
          type: 'expiry_warning',
          severity: daysUntilExpiry <= 7 ? 'high' : 'medium',
          message: `${product.name} (Batch: ${item.batchInfo.batchNumber}) expires in ${daysUntilExpiry} days`,
          currentQuantity: item.quantity,
          status: 'active'
        },
        { upsert: true, new: true }
      );
    }
  }
}

// ============================================
// WAREHOUSES
// ============================================

// Get all warehouses
export const getWarehouses = catchAsync(async (req: Request, res: Response) => {
  const { isActive, type } = req.query;

  const query: any = {};
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (type) query.type = type;

  const warehouses = await Warehouse.find(query).sort({ isPrimary: -1, name: 1 }).lean();

  res.status(200).json({
    success: true,
    count: warehouses.length,
    data: warehouses
  });
});

// Get warehouse by ID
export const getWarehouseById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const warehouse = await Warehouse.findById(req.params.id).lean();

  if (!warehouse) {
    return next(new AppError('Warehouse not found', 404));
  }

  // Get inventory summary for this warehouse
  const inventorySummary = await InventoryItem.aggregate([
    { $match: { 'location.warehouseId': warehouse._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        totalValue: { $sum: '$totalValue' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      ...warehouse,
      inventorySummary
    }
  });
});

// Create warehouse
export const createWarehouse = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Check if code already exists
  const existingWarehouse = await Warehouse.findOne({ code: req.body.code });
  if (existingWarehouse) {
    return next(new AppError('Warehouse code already exists', 400));
  }

  const warehouse = await Warehouse.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Warehouse created successfully',
    data: warehouse
  });
});

// Update warehouse
export const updateWarehouse = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const warehouse = await Warehouse.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!warehouse) {
    return next(new AppError('Warehouse not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Warehouse updated successfully',
    data: warehouse
  });
});

// Delete warehouse
export const deleteWarehouse = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const warehouse = await Warehouse.findById(req.params.id);

  if (!warehouse) {
    return next(new AppError('Warehouse not found', 404));
  }

  // Check if warehouse has inventory
  const inventoryCount = await InventoryItem.countDocuments({
    'location.warehouseId': warehouse._id
  });

  if (inventoryCount > 0) {
    return next(new AppError('Cannot delete warehouse with existing inventory', 400));
  }

  await warehouse.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Warehouse deleted successfully'
  });
});

// ============================================
// INVENTORY ALERTS
// ============================================

// Get inventory alerts
export const getInventoryAlerts = catchAsync(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 50,
    status = 'active',
    type,
    severity,
    warehouseId
  } = req.query;

  const query: any = {};
  if (status) query.status = status;
  if (type) query.type = type;
  if (severity) query.severity = severity;
  if (warehouseId) query.warehouseId = warehouseId;

  const skip = (Number(page) - 1) * Number(limit);

  const [alerts, total] = await Promise.all([
    InventoryAlert.find(query)
      .populate('inventoryItemId')
      .populate('productId', 'name images')
      .populate('warehouseId', 'name code')
      .sort({ severity: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    InventoryAlert.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: alerts.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: alerts
  });
});

// Acknowledge alert
export const acknowledgeAlert = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const alert = await InventoryAlert.findById(req.params.id);

  if (!alert) {
    return next(new AppError('Alert not found', 404));
  }

  if (alert.status !== 'active') {
    return next(new AppError('Alert is already acknowledged or resolved', 400));
  }

  alert.status = 'acknowledged';
  alert.acknowledgedBy = req.user?._id as any;
  alert.acknowledgedAt = new Date();
  await alert.save();

  res.status(200).json({
    success: true,
    message: 'Alert acknowledged successfully',
    data: alert
  });
});

// Bulk acknowledge alerts
export const bulkAcknowledgeAlerts = catchAsync(async (req: AuthRequest, res: Response) => {
  const { alertIds } = req.body;

  if (!alertIds || !Array.isArray(alertIds) || alertIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Alert IDs array is required'
    });
  }

  const result = await InventoryAlert.updateMany(
    {
      _id: { $in: alertIds },
      status: 'active'
    },
    {
      status: 'acknowledged',
      acknowledgedBy: req.user?._id,
      acknowledgedAt: new Date()
    }
  );

  return res.status(200).json({
    success: true,
    message: `${result.modifiedCount} alerts acknowledged successfully`,
    data: {
      acknowledged: result.modifiedCount
    }
  });
});

// ============================================
// ANALYTICS & REPORTS
// ============================================

// Get inventory statistics
export const getInventoryStatistics = catchAsync(async (req: Request, res: Response) => {
  const { warehouseId, startDate, endDate } = req.query;

  const matchStage: any = {};
  if (warehouseId) matchStage['location.warehouseId'] = warehouseId;

  const [
    totalStats,
    statusBreakdown,
    warehouseBreakdown,
    lowStockItems,
    expiringItems,
    movementStats
  ] = await Promise.all([
    // Total inventory statistics
    InventoryItem.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalReserved: { $sum: '$reservedQuantity' },
          totalAvailable: { $sum: '$availableQuantity' },
          totalValue: { $sum: '$totalValue' }
        }
      }
    ]),

    // Status breakdown
    InventoryItem.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: '$totalValue' }
        }
      }
    ]),

    // Warehouse breakdown
    InventoryItem.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$location.warehouseId',
          warehouseName: { $first: '$location.warehouseName' },
          itemCount: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: '$totalValue' }
        }
      },
      { $sort: { totalValue: -1 } }
    ]),

    // Low stock items count
    InventoryItem.countDocuments({
      ...matchStage,
      $expr: { $lte: ['$quantity', '$reorderLevel'] }
    }),

    // Expiring items count (next 30 days)
    InventoryItem.countDocuments({
      ...matchStage,
      'batchInfo.expiryDate': {
        $gte: new Date(),
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    }),

    // Stock movement statistics
    StockMovement.aggregate([
      {
        $match: {
          ...(startDate && { createdAt: { $gte: new Date(startDate as string) } }),
          ...(endDate && { createdAt: { $lte: new Date(endDate as string) } })
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalCost: { $sum: '$totalCost' }
        }
      }
    ])
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: totalStats[0] || {
        totalItems: 0,
        totalQuantity: 0,
        totalReserved: 0,
        totalAvailable: 0,
        totalValue: 0
      },
      statusBreakdown,
      warehouseBreakdown,
      alerts: {
        lowStockItems,
        expiringItems
      },
      movements: movementStats
    }
  });
});

// Generate inventory report
export const generateInventoryReport = catchAsync(async (req: Request, res: Response) => {
  const { reportType, warehouseId, startDate, endDate } = req.body;

  let reportData: any = {};

  switch (reportType) {
    case 'valuation':
      reportData = await generateValuationReport(warehouseId);
      break;
    case 'turnover':
      reportData = await generateTurnoverReport(warehouseId, startDate, endDate);
      break;
    case 'abc_analysis':
      reportData = await generateABCAnalysis(warehouseId);
      break;
    case 'stock_status':
      reportData = await generateStockStatusReport(warehouseId);
      break;
    default:
      return res.status(400).json({
        success: false,
        message: 'Invalid report type. Available types: valuation, turnover, abc_analysis, stock_status'
      });
  }

  return res.status(200).json({
    success: true,
    reportType,
    generatedAt: new Date(),
    data: reportData
  });
});

// Get turnover analysis
export const getTurnoverAnalysis = catchAsync(async (req: Request, res: Response) => {
  const { warehouseId, period = '30' } = req.query;

  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - Number(period));

  const matchStage: any = {
    createdAt: { $gte: daysAgo },
    type: { $in: ['sale', 'purchase'] }
  };

  if (warehouseId) {
    matchStage.$or = [
      { fromWarehouse: warehouseId },
      { toWarehouse: warehouseId }
    ];
  }

  const turnoverData = await StockMovement.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$productId',
        sales: {
          $sum: {
            $cond: [{ $eq: ['$type', 'sale'] }, '$quantity', 0]
          }
        },
        purchases: {
          $sum: {
            $cond: [{ $eq: ['$type', 'purchase'] }, '$quantity', 0]
          }
        },
        totalValue: { $sum: '$totalCost' }
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $lookup: {
        from: 'inventoryitems',
        let: { productId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$productId', '$$productId'] },
              ...(warehouseId && { 'location.warehouseId': warehouseId })
            }
          },
          {
            $group: {
              _id: null,
              currentStock: { $sum: '$quantity' }
            }
          }
        ],
        as: 'inventory'
      }
    },
    {
      $project: {
        productId: '$_id',
        productName: '$product.name',
        sku: '$product.sku',
        sales: 1,
        purchases: 1,
        currentStock: { $ifNull: [{ $arrayElemAt: ['$inventory.currentStock', 0] }, 0] },
        totalValue: 1,
        turnoverRate: {
          $cond: [
            { $gt: [{ $arrayElemAt: ['$inventory.currentStock', 0] }, 0] },
            {
              $divide: [
                '$sales',
                { $arrayElemAt: ['$inventory.currentStock', 0] }
              ]
            },
            0
          ]
        }
      }
    },
    { $sort: { turnoverRate: -1 } }
  ]);

  // Classify products
  const fastMoving = turnoverData.filter(item => item.turnoverRate >= 2);
  const slowMoving = turnoverData.filter(item => item.turnoverRate < 2 && item.turnoverRate > 0);
  const deadStock = turnoverData.filter(item => item.sales === 0 && item.currentStock > 0);

  res.status(200).json({
    success: true,
    period: `Last ${period} days`,
    data: {
      fastMoving: {
        count: fastMoving.length,
        items: fastMoving
      },
      slowMoving: {
        count: slowMoving.length,
        items: slowMoving
      },
      deadStock: {
        count: deadStock.length,
        items: deadStock
      }
    }
  });
});

// ============================================
// BULK OPERATIONS
// ============================================

// Bulk update inventory
export const bulkUpdateInventory = catchAsync(async (req: AuthRequest, res: Response) => {
  const { updates } = req.body;

  if (!updates || !Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Updates array is required'
    });
  }

  const results = {
    success: 0,
    failed: 0,
    errors: [] as any[]
  };

  for (const update of updates) {
    try {
      const { id, ...updateData } = update;
      await InventoryItem.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
      });
      results.success++;
    } catch (error: any) {
      results.failed++;
      results.errors.push({
        id: update.id,
        error: error.message
      });
    }
  }

  return res.status(200).json({
    success: true,
    message: `Bulk update completed. Success: ${results.success}, Failed: ${results.failed}`,
    data: results
  });
});

// Bulk stock adjustment
export const bulkStockAdjustment = catchAsync(async (req: AuthRequest, res: Response) => {
  const { adjustments } = req.body;

  if (!adjustments || !Array.isArray(adjustments) || adjustments.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Adjustments array is required'
    });
  }

  const results = {
    success: 0,
    failed: 0,
    errors: [] as any[]
  };

  for (const adjustment of adjustments) {
    try {
      const { itemId, quantity, reason, notes } = adjustment;

      const item = await InventoryItem.findById(itemId);
      if (!item) {
        throw new Error('Inventory item not found');
      }

      const previousQuantity = item.quantity;
      const newQuantity = previousQuantity + quantity;

      if (newQuantity < 0) {
        throw new Error('Insufficient stock');
      }

      item.quantity = newQuantity;
      item.lastStockMovement = {
        type: 'adjustment',
        quantity,
        reason,
        timestamp: new Date(),
        userId: req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : undefined
      };
      await item.save();

      await StockMovement.create({
        inventoryItemId: item._id,
        productId: item.productId,
        sku: item.sku,
        type: 'adjustment',
        quantity: Math.abs(quantity),
        previousQuantity,
        newQuantity,
        toWarehouse: item.location.warehouseId,
        reason,
        notes,
        userId: req.user?._id as any,
        userName: req.user?.firstName
      });

      await checkAndCreateAlerts(item);

      results.success++;
    } catch (error: any) {
      results.failed++;
      results.errors.push({
        itemId: adjustment.itemId,
        error: error.message
      });
    }
  }

  return res.status(200).json({
    success: true,
    message: `Bulk adjustment completed. Success: ${results.success}, Failed: ${results.failed}`,
    data: results
  });
});

// ============================================
// HELPER FUNCTIONS FOR REPORTS
// ============================================

async function generateValuationReport(warehouseId?: string) {
  const matchStage: any = {};
  if (warehouseId) matchStage['location.warehouseId'] = warehouseId;

  const valuation = await InventoryItem.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        itemCount: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        totalValue: { $sum: '$totalValue' }
      }
    },
    { $sort: { totalValue: -1 } }
  ]);

  const grandTotal = valuation.reduce((sum, item) => sum + item.totalValue, 0);

  return {
    valuation,
    grandTotal,
    currency: 'INR'
  };
}

async function generateTurnoverReport(warehouseId?: string, startDate?: string, endDate?: string) {
  const matchStage: any = {};
  if (startDate) matchStage.createdAt = { $gte: new Date(startDate) };
  if (endDate) matchStage.createdAt = { ...matchStage.createdAt, $lte: new Date(endDate) };
  if (warehouseId) {
    matchStage.$or = [
      { fromWarehouse: warehouseId },
      { toWarehouse: warehouseId }
    ];
  }

  const turnover = await StockMovement.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          type: '$type',
          productId: '$productId'
        },
        totalQuantity: { $sum: '$quantity' },
        totalValue: { $sum: '$totalCost' },
        count: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id.productId',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $project: {
        type: '$_id.type',
        productName: '$product.name',
        sku: '$product.sku',
        totalQuantity: 1,
        totalValue: 1,
        transactionCount: '$count'
      }
    },
    { $sort: { totalValue: -1 } }
  ]);

  return turnover;
}

async function generateABCAnalysis(warehouseId?: string) {
  const matchStage: any = {};
  if (warehouseId) matchStage['location.warehouseId'] = warehouseId;

  const items = await InventoryItem.find(matchStage)
    .populate('productId', 'name category')
    .select('productId sku quantity totalValue')
    .sort({ totalValue: -1 })
    .lean();

  const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0);
  let cumulativeValue = 0;

  const classified = items.map(item => {
    cumulativeValue += item.totalValue;
    const cumulativePercentage = (cumulativeValue / totalValue) * 100;

    let category = 'C';
    if (cumulativePercentage <= 80) category = 'A';
    else if (cumulativePercentage <= 95) category = 'B';

    return {
      ...item,
      category,
      valuePercentage: (item.totalValue / totalValue) * 100,
      cumulativePercentage
    };
  });

  const summary = {
    A: classified.filter(item => item.category === 'A').length,
    B: classified.filter(item => item.category === 'B').length,
    C: classified.filter(item => item.category === 'C').length
  };

  return {
    items: classified,
    summary,
    totalValue
  };
}

async function generateStockStatusReport(warehouseId?: string) {
  const matchStage: any = {};
  if (warehouseId) matchStage['location.warehouseId'] = warehouseId;

  const [inStock, lowStock, outOfStock, expiringSoon] = await Promise.all([
    InventoryItem.countDocuments({ ...matchStage, status: 'in_stock' }),
    InventoryItem.countDocuments({
      ...matchStage,
      $expr: { $lte: ['$quantity', '$reorderLevel'] },
      quantity: { $gt: 0 }
    }),
    InventoryItem.countDocuments({ ...matchStage, status: 'out_of_stock' }),
    InventoryItem.countDocuments({
      ...matchStage,
      'batchInfo.expiryDate': {
        $gte: new Date(),
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    })
  ]);

  const detailedItems = await InventoryItem.find(matchStage)
    .populate('productId', 'name images category')
    .populate('location.warehouseId', 'name code')
    .select('productId sku quantity reservedQuantity availableQuantity status reorderLevel totalValue')
    .sort({ status: 1, quantity: 1 })
    .lean();

  return {
    summary: {
      inStock,
      lowStock,
      outOfStock,
      expiringSoon
    },
    items: detailedItems
  };
}
