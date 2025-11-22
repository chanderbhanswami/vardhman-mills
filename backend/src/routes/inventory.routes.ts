import express from 'express';
import * as inventoryController from '../controllers/inventory.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = express.Router();

// ============================================
// PUBLIC ROUTES (Read-only access)
// ============================================

// Inventory items
router.get('/items', inventoryController.getInventoryItems);
router.get('/items/:id', inventoryController.getInventoryItemById);
router.get('/items/product/:productId', inventoryController.getInventoryByProduct);
router.get('/items/sku/:sku', inventoryController.getInventoryBySku);

// Stock movements
router.get('/movements', inventoryController.getStockMovements);
router.get('/movements/:id', inventoryController.getStockMovementById);

// Warehouses (read-only for public)
router.get('/warehouses', inventoryController.getWarehouses);
router.get('/warehouses/:id', inventoryController.getWarehouseById);

// Alerts (read-only for public)
router.get('/alerts', inventoryController.getInventoryAlerts);

// Statistics and reports (read-only for public)
router.get('/statistics', inventoryController.getInventoryStatistics);
router.get('/turnover-analysis', inventoryController.getTurnoverAnalysis);

// ============================================
// PROTECTED ROUTES (Require authentication)
// ============================================

// Protect all routes after this middleware
router.use(protect);

// ============================================
// INVENTORY MANAGEMENT (Admin/Manager only)
// ============================================

// Inventory items - Admin operations
router.post('/items', restrictTo('admin', 'manager'), inventoryController.createInventoryItem);
router.patch('/items/:id', restrictTo('admin', 'manager'), inventoryController.updateInventoryItem);
router.delete('/items/:id', restrictTo('admin', 'manager'), inventoryController.deleteInventoryItem);

// Stock management operations
router.post('/items/:id/adjust-stock', restrictTo('admin', 'manager', 'staff'), inventoryController.adjustStock);
router.post('/items/:id/reserve-stock', restrictTo('admin', 'manager', 'staff'), inventoryController.reserveStock);
router.post('/items/:id/release-reserved', restrictTo('admin', 'manager', 'staff'), inventoryController.releaseReservedStock);
router.post('/stock/transfer', restrictTo('admin', 'manager'), inventoryController.transferStock);

// ============================================
// WAREHOUSE MANAGEMENT (Admin only)
// ============================================

router.post('/warehouses', restrictTo('admin'), inventoryController.createWarehouse);
router.patch('/warehouses/:id', restrictTo('admin'), inventoryController.updateWarehouse);
router.delete('/warehouses/:id', restrictTo('admin'), inventoryController.deleteWarehouse);

// ============================================
// ALERTS MANAGEMENT (Admin/Manager only)
// ============================================

router.patch('/alerts/:id/acknowledge', restrictTo('admin', 'manager'), inventoryController.acknowledgeAlert);
router.post('/alerts/bulk-acknowledge', restrictTo('admin', 'manager'), inventoryController.bulkAcknowledgeAlerts);

// ============================================
// REPORTS & ANALYTICS (Admin/Manager only)
// ============================================

router.post('/reports/generate', restrictTo('admin', 'manager'), inventoryController.generateInventoryReport);

// ============================================
// BULK OPERATIONS (Admin only)
// ============================================

router.post('/bulk/update', restrictTo('admin'), inventoryController.bulkUpdateInventory);
router.post('/bulk/adjust-stock', restrictTo('admin', 'manager'), inventoryController.bulkStockAdjustment);

export default router;
