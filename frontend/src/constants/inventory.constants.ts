/**
 * Inventory Constants - Vardhman Mills Frontend
 * Constants for inventory and stock management
 */

// Stock Status
export const STOCK_STATUS = {
  IN_STOCK: 'in_stock',
  OUT_OF_STOCK: 'out_of_stock',
  LOW_STOCK: 'low_stock',
  PRE_ORDER: 'pre_order',
  DISCONTINUED: 'discontinued',
  RESERVED: 'reserved',
} as const;

// Inventory Tracking
export const INVENTORY_TRACKING = {
  TRACK_QUANTITY: 'track_quantity',
  TRACK_SERIALS: 'track_serials',
  TRACK_BATCHES: 'track_batches',
  NO_TRACKING: 'no_tracking',
} as const;

// Stock Alerts
export const STOCK_ALERTS = {
  LOW_STOCK_THRESHOLD: 10,
  OUT_OF_STOCK_THRESHOLD: 0,
  REORDER_THRESHOLD: 5,
  OVERSTOCK_THRESHOLD: 1000,
} as const;

// Warehouse Locations
export const WAREHOUSE_LOCATIONS = {
  MAIN: 'main_warehouse',
  SECONDARY: 'secondary_warehouse',
  RETAIL: 'retail_store',
  ONLINE: 'online_fulfillment',
  TEMPORARY: 'temporary_storage',
} as const;

// Inventory Movement Types
export const MOVEMENT_TYPES = {
  PURCHASE: 'purchase',
  SALE: 'sale',
  RETURN: 'return',
  TRANSFER: 'transfer',
  ADJUSTMENT: 'adjustment',
  DAMAGE: 'damage',
  LOSS: 'loss',
  RECOUNT: 'recount',
} as const;

// Inventory Status
export const INVENTORY_STATUS = {
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  DAMAGED: 'damaged',
  QUARANTINE: 'quarantine',
  RETURNED: 'returned',
  EXPIRED: 'expired',
} as const;

export type StockStatus = typeof STOCK_STATUS;
export type InventoryTracking = typeof INVENTORY_TRACKING;
export type WarehouseLocations = typeof WAREHOUSE_LOCATIONS;
export type MovementTypes = typeof MOVEMENT_TYPES;
export type InventoryStatus = typeof INVENTORY_STATUS;