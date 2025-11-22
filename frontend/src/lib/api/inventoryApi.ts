import { HttpClient } from './client';
import { endpoints } from './endpoints';
import { 
  ApiResponse, 
  PaginationParams,
  SearchParams 
} from './types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { buildPaginationParams, buildSearchParams } from './utils';

/**
 * Inventory API Service
 * Handles stock management, warehouse operations, and inventory tracking
 */

interface InventoryItem {
  id: string;
  productId: string;
  variantId?: string;
  sku: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  reorderLevel: number;
  reorderQuantity: number;
  unitCost: number;
  totalValue: number;
  location: {
    warehouseId: string;
    warehouseName: string;
    zone?: string;
    aisle?: string;
    shelf?: string;
    bin?: string;
  };
  supplier?: {
    id: string;
    name: string;
    contactInfo: {
      email: string;
      phone: string;
    };
  };
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued' | 'damaged';
  trackingMethod: 'manual' | 'barcode' | 'rfid';
  batchInfo?: {
    batchNumber: string;
    manufacturingDate: string;
    expiryDate?: string;
    qualityGrade?: string;
  };
  lastStockMovement: {
    type: 'in' | 'out' | 'adjustment' | 'transfer';
    quantity: number;
    reason: string;
    timestamp: string;
    userId: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface StockMovement {
  id: string;
  inventoryItemId: string;
  type: 'in' | 'out' | 'adjustment' | 'transfer' | 'reservation' | 'release';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  reference?: {
    type: 'order' | 'purchase' | 'transfer' | 'adjustment' | 'return';
    id: string;
  };
  notes?: string;
  userId: string;
  timestamp: string;
}

interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  contactInfo: {
    manager: string;
    email: string;
    phone: string;
  };
  capacity: {
    maxItems: number;
    currentItems: number;
    maxVolume: number;
    currentVolume: number;
  };
  zones: Array<{
    id: string;
    name: string;
    type: 'receiving' | 'storage' | 'picking' | 'shipping' | 'returns';
    capacity: number;
    currentUsage: number;
  }>;
  operatingHours: {
    monday: { open: string; close: string; };
    tuesday: { open: string; close: string; };
    wednesday: { open: string; close: string; };
    thursday: { open: string; close: string; };
    friday: { open: string; close: string; };
    saturday: { open: string; close: string; };
    sunday: { open: string; close: string; };
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface InventoryAlert {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'expiry_warning' | 'damaged_goods' | 'reorder_point';
  inventoryItemId: string;
  productId: string;
  sku: string;
  productName: string;
  currentQuantity: number;
  threshold?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  createdAt: string;
}

interface InventoryReport {
  id: string;
  type: 'stock_valuation' | 'movement_summary' | 'abc_analysis' | 'aging_report' | 'turnover_analysis';
  parameters: {
    dateRange: {
      start: string;
      end: string;
    };
    warehouseIds?: string[];
    categoryIds?: string[];
    productIds?: string[];
  };
  data: {
    summary: Record<string, unknown>;
    details: Array<Record<string, unknown>>;
    charts?: Array<{
      type: string;
      data: Record<string, unknown>;
    }>;
  };
  generatedAt: string;
  generatedBy: string;
}

class InventoryApiService {
  private client: HttpClient;

  constructor() {
    this.client = new HttpClient();
  }

  // Inventory Items

  // Get inventory items
  async getInventoryItems(params?: SearchParams & PaginationParams & {
    warehouseId?: string;
    productId?: string;
    status?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued' | 'damaged';
    lowStock?: boolean;
    outOfStock?: boolean;
    sortBy?: 'quantity' | 'sku' | 'value' | 'lastMovement';
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<InventoryItem[]>> {
    const queryParams = {
      ...buildSearchParams(params || {}),
      ...buildPaginationParams(params || {}),
      ...(params?.warehouseId && { warehouseId: params.warehouseId }),
      ...(params?.productId && { productId: params.productId }),
      ...(params?.status && { status: params.status }),
      ...(params?.lowStock !== undefined && { lowStock: params.lowStock }),
      ...(params?.outOfStock !== undefined && { outOfStock: params.outOfStock }),
      ...(params?.sortBy && { sortBy: params.sortBy }),
      ...(params?.sortOrder && { sortOrder: params.sortOrder }),
    };
    
    return this.client.get<InventoryItem[]>(endpoints.inventory.items, { params: queryParams });
  }

  // Get inventory item by ID
  async getInventoryItemById(itemId: string): Promise<ApiResponse<InventoryItem>> {
    return this.client.get<InventoryItem>(endpoints.inventory.itemById(itemId));
  }

  // Get inventory by product ID
  async getInventoryByProduct(productId: string): Promise<ApiResponse<InventoryItem[]>> {
    return this.client.get<InventoryItem[]>(endpoints.inventory.byProduct(productId), {
      params: { productId },
    });
  }

  // Get inventory by SKU
  async getInventoryBySku(sku: string): Promise<ApiResponse<InventoryItem>> {
    return this.client.get<InventoryItem>(endpoints.inventory.bySku(sku));
  }

  // Create inventory item
  async createInventoryItem(itemData: {
    productId: string;
    variantId?: string;
    sku: string;
    quantity: number;
    reorderLevel: number;
    reorderQuantity: number;
    unitCost: number;
    warehouseId: string;
    location?: {
      zone?: string;
      aisle?: string;
      shelf?: string;
      bin?: string;
    };
    supplier?: {
      id: string;
      name: string;
      contactInfo: {
        email: string;
        phone: string;
      };
    };
    trackingMethod?: 'manual' | 'barcode' | 'rfid';
    batchInfo?: {
      batchNumber: string;
      manufacturingDate: string;
      expiryDate?: string;
      qualityGrade?: string;
    };
  }): Promise<ApiResponse<InventoryItem>> {
    return this.client.post<InventoryItem>(endpoints.inventory.create, itemData);
  }

  // Update inventory item
  async updateInventoryItem(itemId: string, updates: {
    reorderLevel?: number;
    reorderQuantity?: number;
    unitCost?: number;
    location?: {
      zone?: string;
      aisle?: string;
      shelf?: string;
      bin?: string;
    };
    supplier?: {
      id: string;
      name: string;
      contactInfo: {
        email: string;
        phone: string;
      };
    };
    trackingMethod?: 'manual' | 'barcode' | 'rfid';
    status?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued' | 'damaged';
  }): Promise<ApiResponse<InventoryItem>> {
    return this.client.put<InventoryItem>(endpoints.inventory.update(itemId), updates);
  }

  // Delete inventory item
  async deleteInventoryItem(itemId: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(endpoints.inventory.delete(itemId));
  }

  // Stock Management

  // Adjust stock
  async adjustStock(itemId: string, adjustmentData: {
    quantity: number;
    type: 'increase' | 'decrease' | 'set';
    reason: string;
    notes?: string;
    reference?: {
      type: 'order' | 'purchase' | 'transfer' | 'adjustment' | 'return';
      id: string;
    };
  }): Promise<ApiResponse<{
    inventoryItem: InventoryItem;
    movement: StockMovement;
  }>> {
    return this.client.post<{
      inventoryItem: InventoryItem;
      movement: StockMovement;
    }>(endpoints.inventory.adjustStock(itemId), adjustmentData);
  }

  // Reserve stock
  async reserveStock(itemId: string, reservationData: {
    quantity: number;
    reason: string;
    reference?: {
      type: 'order' | 'transfer';
      id: string;
    };
    expiresAt?: string;
  }): Promise<ApiResponse<{
    reservationId: string;
    inventoryItem: InventoryItem;
    movement: StockMovement;
  }>> {
    return this.client.post<{
      reservationId: string;
      inventoryItem: InventoryItem;
      movement: StockMovement;
    }>(endpoints.inventory.reserveStock(itemId), reservationData);
  }

  // Release reserved stock
  async releaseReservedStock(itemId: string, reservationId: string): Promise<ApiResponse<{
    inventoryItem: InventoryItem;
    movement: StockMovement;
  }>> {
    return this.client.post<{
      inventoryItem: InventoryItem;
      movement: StockMovement;
    }>(endpoints.inventory.releaseStock(itemId), { reservationId });
  }

  // Transfer stock between warehouses
  async transferStock(transferData: {
    fromItemId: string;
    toWarehouseId: string;
    quantity: number;
    reason: string;
    notes?: string;
    toLocation?: {
      zone?: string;
      aisle?: string;
      shelf?: string;
      bin?: string;
    };
  }): Promise<ApiResponse<{
    fromItem: InventoryItem;
    toItem: InventoryItem;
    movements: StockMovement[];
  }>> {
    return this.client.post<{
      fromItem: InventoryItem;
      toItem: InventoryItem;
      movements: StockMovement[];
    }>(endpoints.inventory.transfer, transferData);
  }

  // Stock Movements

  // Get stock movements
  async getStockMovements(params?: SearchParams & PaginationParams & {
    inventoryItemId?: string;
    productId?: string;
    type?: 'in' | 'out' | 'adjustment' | 'transfer' | 'reservation' | 'release';
    dateRange?: {
      start: string;
      end: string;
    };
    userId?: string;
    sortBy?: 'timestamp' | 'quantity' | 'type';
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<StockMovement[]>> {
    const queryParams = {
      ...buildSearchParams(params || {}),
      ...buildPaginationParams(params || {}),
      ...(params?.inventoryItemId && { inventoryItemId: params.inventoryItemId }),
      ...(params?.productId && { productId: params.productId }),
      ...(params?.type && { type: params.type }),
      ...(params?.dateRange && {
        startDate: params.dateRange.start,
        endDate: params.dateRange.end,
      }),
      ...(params?.userId && { userId: params.userId }),
      ...(params?.sortBy && { sortBy: params.sortBy }),
      ...(params?.sortOrder && { sortOrder: params.sortOrder }),
    };
    
    return this.client.get<StockMovement[]>(endpoints.inventory.movements, { params: queryParams });
  }

  // Get movement by ID
  async getMovementById(movementId: string): Promise<ApiResponse<StockMovement>> {
    return this.client.get<StockMovement>(endpoints.inventory.movementById(movementId));
  }

  // Warehouses

  // Get warehouses
  async getWarehouses(params?: {
    isActive?: boolean;
    hasCapacity?: boolean;
  }): Promise<ApiResponse<Warehouse[]>> {
    const queryParams = {
      ...(params?.isActive !== undefined && { isActive: params.isActive }),
      ...(params?.hasCapacity !== undefined && { hasCapacity: params.hasCapacity }),
    };
    
    return this.client.get<Warehouse[]>(endpoints.inventory.warehouses, { params: queryParams });
  }

  // Get warehouse by ID
  async getWarehouseById(warehouseId: string): Promise<ApiResponse<Warehouse>> {
    return this.client.get<Warehouse>(endpoints.inventory.warehouseById(warehouseId));
  }

  // Create warehouse
  async createWarehouse(warehouseData: {
    name: string;
    code: string;
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    contactInfo: {
      manager: string;
      email: string;
      phone: string;
    };
    capacity: {
      maxItems: number;
      maxVolume: number;
    };
    zones?: Array<{
      name: string;
      type: 'receiving' | 'storage' | 'picking' | 'shipping' | 'returns';
      capacity: number;
    }>;
    operatingHours: {
      monday: { open: string; close: string; };
      tuesday: { open: string; close: string; };
      wednesday: { open: string; close: string; };
      thursday: { open: string; close: string; };
      friday: { open: string; close: string; };
      saturday: { open: string; close: string; };
      sunday: { open: string; close: string; };
    };
  }): Promise<ApiResponse<Warehouse>> {
    return this.client.post<Warehouse>(endpoints.inventory.createWarehouse, warehouseData);
  }

  // Update warehouse
  async updateWarehouse(warehouseId: string, updates: {
    name?: string;
    code?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    contactInfo?: {
      manager: string;
      email: string;
      phone: string;
    };
    capacity?: {
      maxItems: number;
      maxVolume: number;
    };
    operatingHours?: {
      monday: { open: string; close: string; };
      tuesday: { open: string; close: string; };
      wednesday: { open: string; close: string; };
      thursday: { open: string; close: string; };
      friday: { open: string; close: string; };
      saturday: { open: string; close: string; };
      sunday: { open: string; close: string; };
    };
    isActive?: boolean;
  }): Promise<ApiResponse<Warehouse>> {
    return this.client.put<Warehouse>(endpoints.inventory.updateWarehouse(warehouseId), updates);
  }

  // Delete warehouse
  async deleteWarehouse(warehouseId: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(endpoints.inventory.deleteWarehouse(warehouseId));
  }

  // Alerts & Notifications

  // Get inventory alerts
  async getInventoryAlerts(params?: {
    type?: 'low_stock' | 'out_of_stock' | 'expiry_warning' | 'damaged_goods' | 'reorder_point';
    severity?: 'low' | 'medium' | 'high' | 'critical';
    acknowledged?: boolean;
    warehouseId?: string;
  } & PaginationParams): Promise<ApiResponse<InventoryAlert[]>> {
    const queryParams = {
      ...buildPaginationParams(params || {}),
      ...(params?.type && { type: params.type }),
      ...(params?.severity && { severity: params.severity }),
      ...(params?.acknowledged !== undefined && { acknowledged: params.acknowledged }),
      ...(params?.warehouseId && { warehouseId: params.warehouseId }),
    };
    
    return this.client.get<InventoryAlert[]>(endpoints.inventory.alerts, { params: queryParams });
  }

  // Acknowledge alert
  async acknowledgeAlert(alertId: string): Promise<ApiResponse<InventoryAlert>> {
    return this.client.put<InventoryAlert>(endpoints.inventory.acknowledgeAlert(alertId), {});
  }

  // Bulk acknowledge alerts
  async bulkAcknowledgeAlerts(alertIds: string[]): Promise<ApiResponse<{
    acknowledgedCount: number;
    alerts: InventoryAlert[];
  }>> {
    return this.client.put<{
      acknowledgedCount: number;
      alerts: InventoryAlert[];
    }>(endpoints.inventory.bulkAcknowledge, { alertIds });
  }

  // Analytics & Reports

  // Get inventory statistics
  async getInventoryStatistics(params?: {
    warehouseId?: string;
    dateRange?: {
      start: string;
      end: string;
    };
  }): Promise<ApiResponse<{
    totalItems: number;
    totalValue: number;
    inStockItems: number;
    lowStockItems: number;
    outOfStockItems: number;
    averageTurnover: number;
    topMovingProducts: Array<{
      productId: string;
      productName: string;
      sku: string;
      quantity: number;
      movements: number;
    }>;
    slowMovingProducts: Array<{
      productId: string;
      productName: string;
      sku: string;
      quantity: number;
      lastMovement: string;
    }>;
    warehouseUtilization: Array<{
      warehouseId: string;
      warehouseName: string;
      capacity: number;
      used: number;
      utilization: number;
    }>;
  }>> {
    const queryParams = {
      ...(params?.warehouseId && { warehouseId: params.warehouseId }),
      ...(params?.dateRange && {
        startDate: params.dateRange.start,
        endDate: params.dateRange.end,
      }),
    };
    
    return this.client.get<{
      totalItems: number;
      totalValue: number;
      inStockItems: number;
      lowStockItems: number;
      outOfStockItems: number;
      averageTurnover: number;
      topMovingProducts: Array<{
        productId: string;
        productName: string;
        sku: string;
        quantity: number;
        movements: number;
      }>;
      slowMovingProducts: Array<{
        productId: string;
        productName: string;
        sku: string;
        quantity: number;
        lastMovement: string;
      }>;
      warehouseUtilization: Array<{
        warehouseId: string;
        warehouseName: string;
        capacity: number;
        used: number;
        utilization: number;
      }>;
    }>(endpoints.inventory.statistics, { params: queryParams });
  }

  // Generate inventory report
  async generateInventoryReport(reportData: {
    type: 'stock_valuation' | 'movement_summary' | 'abc_analysis' | 'aging_report' | 'turnover_analysis';
    parameters: {
      dateRange: {
        start: string;
        end: string;
      };
      warehouseIds?: string[];
      categoryIds?: string[];
      productIds?: string[];
    };
    format?: 'json' | 'csv' | 'pdf';
  }): Promise<ApiResponse<InventoryReport>> {
    return this.client.post<InventoryReport>(endpoints.inventory.generateReport, reportData);
  }

  // Get report by ID
  async getReportById(reportId: string): Promise<ApiResponse<InventoryReport>> {
    return this.client.get<InventoryReport>(endpoints.inventory.reportById(reportId));
  }

  // Get turnover analysis
  async getTurnoverAnalysis(params?: {
    warehouseId?: string;
    categoryId?: string;
    dateRange?: {
      start: string;
      end: string;
    };
  }): Promise<ApiResponse<Array<{
    productId: string;
    productName: string;
    sku: string;
    averageStock: number;
    totalSold: number;
    turnoverRatio: number;
    daysToSellInventory: number;
    classification: 'fast' | 'medium' | 'slow' | 'dead';
  }>>> {
    const queryParams = {
      ...(params?.warehouseId && { warehouseId: params.warehouseId }),
      ...(params?.categoryId && { categoryId: params.categoryId }),
      ...(params?.dateRange && {
        startDate: params.dateRange.start,
        endDate: params.dateRange.end,
      }),
    };
    
    return this.client.get<Array<{
      productId: string;
      productName: string;
      sku: string;
      averageStock: number;
      totalSold: number;
      turnoverRatio: number;
      daysToSellInventory: number;
      classification: 'fast' | 'medium' | 'slow' | 'dead';
    }>>(endpoints.inventory.turnoverAnalysis, { params: queryParams });
  }

  // Bulk Operations

  // Bulk update inventory
  async bulkUpdateInventory(updates: Array<{
    itemId: string;
    updates: {
      reorderLevel?: number;
      reorderQuantity?: number;
      unitCost?: number;
      status?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued' | 'damaged';
    };
  }>): Promise<ApiResponse<{
    updatedCount: number;
    errors: Array<{
      itemId: string;
      error: string;
    }>;
  }>> {
    return this.client.put<{
      updatedCount: number;
      errors: Array<{
        itemId: string;
        error: string;
      }>;
    }>(endpoints.inventory.bulkUpdate, { updates });
  }

  // Bulk stock adjustment
  async bulkStockAdjustment(adjustments: Array<{
    itemId: string;
    quantity: number;
    type: 'increase' | 'decrease' | 'set';
    reason: string;
    notes?: string;
  }>): Promise<ApiResponse<{
    processedCount: number;
    movements: StockMovement[];
    errors: Array<{
      itemId: string;
      error: string;
    }>;
  }>> {
    return this.client.post<{
      processedCount: number;
      movements: StockMovement[];
      errors: Array<{
        itemId: string;
        error: string;
      }>;
    }>(endpoints.inventory.bulkAdjustment, { adjustments });
  }
}

// Create service instance
const inventoryApiService = new InventoryApiService();

// React Query Hooks

// Inventory Items
export const useInventoryItems = (params?: SearchParams & PaginationParams & {
  warehouseId?: string;
  productId?: string;
  status?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued' | 'damaged';
  lowStock?: boolean;
  outOfStock?: boolean;
  sortBy?: 'quantity' | 'sku' | 'value' | 'lastMovement';
  sortOrder?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: ['inventory', 'items', params],
    queryFn: () => inventoryApiService.getInventoryItems(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useInventoryItem = (itemId: string) => {
  return useQuery({
    queryKey: ['inventory', 'item', itemId],
    queryFn: () => inventoryApiService.getInventoryItemById(itemId),
    enabled: !!itemId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useInventoryByProduct = (productId: string) => {
  return useQuery({
    queryKey: ['inventory', 'product', productId],
    queryFn: () => inventoryApiService.getInventoryByProduct(productId),
    enabled: !!productId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useInventoryBySku = (sku: string) => {
  return useQuery({
    queryKey: ['inventory', 'sku', sku],
    queryFn: () => inventoryApiService.getInventoryBySku(sku),
    enabled: !!sku,
    staleTime: 2 * 60 * 1000,
  });
};

// Stock Movements
export const useStockMovements = (params?: SearchParams & PaginationParams & {
  inventoryItemId?: string;
  productId?: string;
  type?: 'in' | 'out' | 'adjustment' | 'transfer' | 'reservation' | 'release';
  dateRange?: {
    start: string;
    end: string;
  };
  userId?: string;
  sortBy?: 'timestamp' | 'quantity' | 'type';
  sortOrder?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: ['inventory', 'movements', params],
    queryFn: () => inventoryApiService.getStockMovements(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useMovement = (movementId: string) => {
  return useQuery({
    queryKey: ['inventory', 'movement', movementId],
    queryFn: () => inventoryApiService.getMovementById(movementId),
    enabled: !!movementId,
    staleTime: 10 * 60 * 1000,
  });
};

// Warehouses
export const useWarehouses = (params?: {
  isActive?: boolean;
  hasCapacity?: boolean;
}) => {
  return useQuery({
    queryKey: ['inventory', 'warehouses', params],
    queryFn: () => inventoryApiService.getWarehouses(params),
    staleTime: 30 * 60 * 1000,
  });
};

export const useWarehouse = (warehouseId: string) => {
  return useQuery({
    queryKey: ['inventory', 'warehouse', warehouseId],
    queryFn: () => inventoryApiService.getWarehouseById(warehouseId),
    enabled: !!warehouseId,
    staleTime: 30 * 60 * 1000,
  });
};

// Alerts
export const useInventoryAlerts = (params?: {
  type?: 'low_stock' | 'out_of_stock' | 'expiry_warning' | 'damaged_goods' | 'reorder_point';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  acknowledged?: boolean;
  warehouseId?: string;
} & PaginationParams) => {
  return useQuery({
    queryKey: ['inventory', 'alerts', params],
    queryFn: () => inventoryApiService.getInventoryAlerts(params),
    staleTime: 1 * 60 * 1000, // 1 minute for alerts
  });
};

// Analytics
export const useInventoryStatistics = (params?: {
  warehouseId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}) => {
  return useQuery({
    queryKey: ['inventory', 'statistics', params],
    queryFn: () => inventoryApiService.getInventoryStatistics(params),
    staleTime: 15 * 60 * 1000,
  });
};

export const useInventoryReport = (reportId: string) => {
  return useQuery({
    queryKey: ['inventory', 'report', reportId],
    queryFn: () => inventoryApiService.getReportById(reportId),
    enabled: !!reportId,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useTurnoverAnalysis = (params?: {
  warehouseId?: string;
  categoryId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}) => {
  return useQuery({
    queryKey: ['inventory', 'turnover', params],
    queryFn: () => inventoryApiService.getTurnoverAnalysis(params),
    staleTime: 30 * 60 * 1000,
  });
};

// Mutation Hooks

// Inventory Management
export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (itemData: {
      productId: string;
      variantId?: string;
      sku: string;
      quantity: number;
      reorderLevel: number;
      reorderQuantity: number;
      unitCost: number;
      warehouseId: string;
      location?: {
        zone?: string;
        aisle?: string;
        shelf?: string;
        bin?: string;
      };
      supplier?: {
        id: string;
        name: string;
        contactInfo: {
          email: string;
          phone: string;
        };
      };
      trackingMethod?: 'manual' | 'barcode' | 'rfid';
      batchInfo?: {
        batchNumber: string;
        manufacturingDate: string;
        expiryDate?: string;
        qualityGrade?: string;
      };
    }) => inventoryApiService.createInventoryItem(itemData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ itemId, updates }: {
      itemId: string;
      updates: {
        reorderLevel?: number;
        reorderQuantity?: number;
        unitCost?: number;
        location?: {
          zone?: string;
          aisle?: string;
          shelf?: string;
          bin?: string;
        };
        supplier?: {
          id: string;
          name: string;
          contactInfo: {
            email: string;
            phone: string;
          };
        };
        trackingMethod?: 'manual' | 'barcode' | 'rfid';
        status?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued' | 'damaged';
      };
    }) => inventoryApiService.updateInventoryItem(itemId, updates),
    onSuccess: (_, { itemId }) => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'item', itemId] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'items'] });
    },
  });
};

export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (itemId: string) => inventoryApiService.deleteInventoryItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};

// Stock Management
export const useAdjustStock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ itemId, adjustmentData }: {
      itemId: string;
      adjustmentData: {
        quantity: number;
        type: 'increase' | 'decrease' | 'set';
        reason: string;
        notes?: string;
        reference?: {
          type: 'order' | 'purchase' | 'transfer' | 'adjustment' | 'return';
          id: string;
        };
      };
    }) => inventoryApiService.adjustStock(itemId, adjustmentData),
    onSuccess: (_, { itemId }) => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'item', itemId] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'movements'] });
    },
  });
};

export const useReserveStock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ itemId, reservationData }: {
      itemId: string;
      reservationData: {
        quantity: number;
        reason: string;
        reference?: {
          type: 'order' | 'transfer';
          id: string;
        };
        expiresAt?: string;
      };
    }) => inventoryApiService.reserveStock(itemId, reservationData),
    onSuccess: (_, { itemId }) => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'item', itemId] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'movements'] });
    },
  });
};

export const useReleaseReservedStock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ itemId, reservationId }: {
      itemId: string;
      reservationId: string;
    }) => inventoryApiService.releaseReservedStock(itemId, reservationId),
    onSuccess: (_, { itemId }) => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'item', itemId] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'movements'] });
    },
  });
};

export const useTransferStock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (transferData: {
      fromItemId: string;
      toWarehouseId: string;
      quantity: number;
      reason: string;
      notes?: string;
      toLocation?: {
        zone?: string;
        aisle?: string;
        shelf?: string;
        bin?: string;
      };
    }) => inventoryApiService.transferStock(transferData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};

// Warehouse Management
export const useCreateWarehouse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (warehouseData: {
      name: string;
      code: string;
      address: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
      };
      contactInfo: {
        manager: string;
        email: string;
        phone: string;
      };
      capacity: {
        maxItems: number;
        maxVolume: number;
      };
      zones?: Array<{
        name: string;
        type: 'receiving' | 'storage' | 'picking' | 'shipping' | 'returns';
        capacity: number;
      }>;
      operatingHours: {
        monday: { open: string; close: string; };
        tuesday: { open: string; close: string; };
        wednesday: { open: string; close: string; };
        thursday: { open: string; close: string; };
        friday: { open: string; close: string; };
        saturday: { open: string; close: string; };
        sunday: { open: string; close: string; };
      };
    }) => inventoryApiService.createWarehouse(warehouseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'warehouses'] });
    },
  });
};

export const useUpdateWarehouse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ warehouseId, updates }: {
      warehouseId: string;
      updates: {
        name?: string;
        code?: string;
        address?: {
          street: string;
          city: string;
          state: string;
          postalCode: string;
          country: string;
        };
        contactInfo?: {
          manager: string;
          email: string;
          phone: string;
        };
        capacity?: {
          maxItems: number;
          maxVolume: number;
        };
        operatingHours?: {
          monday: { open: string; close: string; };
          tuesday: { open: string; close: string; };
          wednesday: { open: string; close: string; };
          thursday: { open: string; close: string; };
          friday: { open: string; close: string; };
          saturday: { open: string; close: string; };
          sunday: { open: string; close: string; };
        };
        isActive?: boolean;
      };
    }) => inventoryApiService.updateWarehouse(warehouseId, updates),
    onSuccess: (_, { warehouseId }) => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'warehouse', warehouseId] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'warehouses'] });
    },
  });
};

export const useDeleteWarehouse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (warehouseId: string) => inventoryApiService.deleteWarehouse(warehouseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'warehouses'] });
    },
  });
};

// Alert Management
export const useAcknowledgeAlert = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (alertId: string) => inventoryApiService.acknowledgeAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'alerts'] });
    },
  });
};

export const useBulkAcknowledgeAlerts = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (alertIds: string[]) => inventoryApiService.bulkAcknowledgeAlerts(alertIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'alerts'] });
    },
  });
};

// Reports
export const useGenerateInventoryReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (reportData: {
      type: 'stock_valuation' | 'movement_summary' | 'abc_analysis' | 'aging_report' | 'turnover_analysis';
      parameters: {
        dateRange: {
          start: string;
          end: string;
        };
        warehouseIds?: string[];
        categoryIds?: string[];
        productIds?: string[];
      };
      format?: 'json' | 'csv' | 'pdf';
    }) => inventoryApiService.generateInventoryReport(reportData),
    onSuccess: (data) => {
      if (data?.data?.id) {
        queryClient.setQueryData(['inventory', 'report', data.data.id], data);
      }
    },
  });
};

// Bulk Operations
export const useBulkUpdateInventory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updates: Array<{
      itemId: string;
      updates: {
        reorderLevel?: number;
        reorderQuantity?: number;
        unitCost?: number;
        status?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued' | 'damaged';
      };
    }>) => inventoryApiService.bulkUpdateInventory(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};

export const useBulkStockAdjustment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (adjustments: Array<{
      itemId: string;
      quantity: number;
      type: 'increase' | 'decrease' | 'set';
      reason: string;
      notes?: string;
    }>) => inventoryApiService.bulkStockAdjustment(adjustments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};

export default inventoryApiService;