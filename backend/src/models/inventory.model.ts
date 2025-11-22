import mongoose, { Document, Schema } from 'mongoose';

// Inventory Item Interface
export interface IInventoryItem extends Document {
  productId: mongoose.Types.ObjectId;
  variantId?: mongoose.Types.ObjectId;
  sku: string;
  
  // Quantities
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  reorderLevel: number;
  reorderQuantity: number;
  
  // Cost & Value
  unitCost: number;
  totalValue: number;
  
  // Location
  location: {
    warehouseId: mongoose.Types.ObjectId;
    warehouseName: string;
    zone?: string;
    aisle?: string;
    shelf?: string;
    bin?: string;
  };
  
  // Supplier
  supplier?: {
    id?: mongoose.Types.ObjectId;
    name: string;
    contactInfo?: string;
  };
  
  // Status
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued' | 'damaged';
  trackingMethod: 'manual' | 'barcode' | 'rfid';
  
  // Batch Info
  batchInfo?: {
    batchNumber?: string;
    manufacturingDate?: Date;
    expiryDate?: Date;
    qualityGrade?: string;
  };
  
  // Last Movement
  lastStockMovement?: {
    type: string;
    quantity: number;
    reason?: string;
    timestamp: Date;
    userId?: mongoose.Types.ObjectId;
  };
  
  // Metadata
  notes?: string;
  tags?: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

// Stock Movement Interface
export interface IStockMovement extends Document {
  inventoryItemId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  sku: string;
  
  // Movement Details
  type: 'purchase' | 'sale' | 'return' | 'adjustment' | 'transfer' | 'damage' | 'loss' | 'found';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  
  // Location
  fromWarehouse?: mongoose.Types.ObjectId;
  toWarehouse?: mongoose.Types.ObjectId;
  
  // Financial
  unitCost?: number;
  totalCost?: number;
  
  // Reference
  referenceType?: 'order' | 'purchase_order' | 'transfer' | 'adjustment' | 'return';
  referenceId?: mongoose.Types.ObjectId;
  
  // Reason & Notes
  reason?: string;
  notes?: string;
  
  // User
  userId?: mongoose.Types.ObjectId;
  userName?: string;
  
  createdAt: Date;
}

// Warehouse Interface
export interface IWarehouse extends Document {
  name: string;
  code: string;
  type: 'main' | 'regional' | 'distribution' | 'retail' | 'storage';
  
  // Address
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
  };
  
  // Contact
  contactInfo?: {
    phone?: string;
    email?: string;
    managerName?: string;
  };
  
  // Capacity
  capacity: {
    maxItems?: number;
    currentItems: number;
    maxVolume?: number; // in cubic meters
    currentVolume: number;
    utilizationPercentage: number;
  };
  
  // Zones
  zones?: Array<{
    id: string;
    name: string;
    type: 'storage' | 'picking' | 'packing' | 'receiving' | 'shipping';
    capacity?: number;
    currentUsage: number;
  }>;
  
  // Operating Hours
  operatingHours?: {
    monday?: { open: string; close: string; };
    tuesday?: { open: string; close: string; };
    wednesday?: { open: string; close: string; };
    thursday?: { open: string; close: string; };
    friday?: { open: string; close: string; };
    saturday?: { open: string; close: string; };
    sunday?: { open: string; close: string; };
  };
  
  // Status
  isActive: boolean;
  isPrimary: boolean;
  
  // Metadata
  description?: string;
  tags?: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

// Inventory Alert Interface
export interface IInventoryAlert extends Document {
  type: 'low_stock' | 'out_of_stock' | 'expiry_warning' | 'reorder_point' | 'damaged_goods';
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  inventoryItemId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  sku: string;
  productName: string;
  
  warehouseId: mongoose.Types.ObjectId;
  warehouseName: string;
  
  message: string;
  currentQuantity: number;
  threshold?: number;
  
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledgedBy?: mongoose.Types.ObjectId;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

// Schemas
const inventoryItemSchema = new Schema<IInventoryItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    variantId: { type: Schema.Types.ObjectId, index: true },
    sku: { type: String, required: true, unique: true, trim: true, index: true },
    
    quantity: { type: Number, required: true, default: 0, min: 0 },
    reservedQuantity: { type: Number, default: 0, min: 0 },
    availableQuantity: { type: Number, default: 0, min: 0 },
    reorderLevel: { type: Number, default: 10, min: 0 },
    reorderQuantity: { type: Number, default: 50, min: 0 },
    
    unitCost: { type: Number, required: true, min: 0 },
    totalValue: { type: Number, default: 0, min: 0 },
    
    location: {
      warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true, index: true },
      warehouseName: { type: String, required: true },
      zone: String,
      aisle: String,
      shelf: String,
      bin: String
    },
    
    supplier: {
      id: Schema.Types.ObjectId,
      name: String,
      contactInfo: String
    },
    
    status: {
      type: String,
      enum: ['in_stock', 'low_stock', 'out_of_stock', 'discontinued', 'damaged'],
      default: 'in_stock',
      index: true
    },
    trackingMethod: {
      type: String,
      enum: ['manual', 'barcode', 'rfid'],
      default: 'manual'
    },
    
    batchInfo: {
      batchNumber: String,
      manufacturingDate: Date,
      expiryDate: Date,
      qualityGrade: String
    },
    
    lastStockMovement: {
      type: {
        type: String
      },
      quantity: Number,
      reason: String,
      timestamp: Date,
      userId: Schema.Types.ObjectId
    },
    
    notes: { type: String, maxlength: 1000 },
    tags: [{ type: String, trim: true, lowercase: true }]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const stockMovementSchema = new Schema<IStockMovement>(
  {
    inventoryItemId: { type: Schema.Types.ObjectId, ref: 'InventoryItem', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    sku: { type: String, required: true, index: true },
    
    type: {
      type: String,
      required: true,
      enum: ['purchase', 'sale', 'return', 'adjustment', 'transfer', 'damage', 'loss', 'found'],
      index: true
    },
    quantity: { type: Number, required: true },
    previousQuantity: { type: Number, required: true },
    newQuantity: { type: Number, required: true },
    
    fromWarehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', index: true },
    toWarehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', index: true },
    
    unitCost: Number,
    totalCost: Number,
    
    referenceType: {
      type: String,
      enum: ['order', 'purchase_order', 'transfer', 'adjustment', 'return']
    },
    referenceId: Schema.Types.ObjectId,
    
    reason: { type: String, maxlength: 500 },
    notes: { type: String, maxlength: 1000 },
    
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    userName: String
  },
  {
    timestamps: true
  }
);

const warehouseSchema = new Schema<IWarehouse>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    type: {
      type: String,
      required: true,
      enum: ['main', 'regional', 'distribution', 'retail', 'storage'],
      default: 'main'
    },
    
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true, index: true },
      state: { type: String, required: true, index: true },
      country: { type: String, required: true },
      postalCode: String
    },
    
    contactInfo: {
      phone: String,
      email: String,
      managerName: String
    },
    
    capacity: {
      maxItems: Number,
      currentItems: { type: Number, default: 0 },
      maxVolume: Number,
      currentVolume: { type: Number, default: 0 },
      utilizationPercentage: { type: Number, default: 0, min: 0, max: 100 }
    },
    
    zones: [{
      id: { type: String, required: true },
      name: { type: String, required: true },
      type: {
        type: String,
        enum: ['storage', 'picking', 'packing', 'receiving', 'shipping'],
        required: true
      },
      capacity: Number,
      currentUsage: { type: Number, default: 0 }
    }],
    
    operatingHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String }
    },
    
    isActive: { type: Boolean, default: true, index: true },
    isPrimary: { type: Boolean, default: false },
    
    description: { type: String, maxlength: 1000 },
    tags: [{ type: String, trim: true, lowercase: true }]
  },
  {
    timestamps: true
  }
);

const inventoryAlertSchema = new Schema<IInventoryAlert>(
  {
    type: {
      type: String,
      required: true,
      enum: ['low_stock', 'out_of_stock', 'expiry_warning', 'reorder_point', 'damaged_goods'],
      index: true
    },
    severity: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'critical'],
      index: true
    },
    
    inventoryItemId: { type: Schema.Types.ObjectId, ref: 'InventoryItem', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    sku: { type: String, required: true },
    productName: { type: String, required: true },
    
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    warehouseName: { type: String, required: true },
    
    message: { type: String, required: true },
    currentQuantity: { type: Number, required: true },
    threshold: Number,
    
    status: {
      type: String,
      enum: ['active', 'acknowledged', 'resolved'],
      default: 'active',
      index: true
    },
    acknowledgedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    acknowledgedAt: Date,
    resolvedAt: Date
  },
  {
    timestamps: true
  }
);

// Indexes
inventoryItemSchema.index({ productId: 1, 'location.warehouseId': 1 });
inventoryItemSchema.index({ status: 1, 'location.warehouseId': 1 });
inventoryItemSchema.index({ quantity: 1, reorderLevel: 1 });
inventoryItemSchema.index({ 'batchInfo.expiryDate': 1 });

stockMovementSchema.index({ type: 1, createdAt: -1 });
stockMovementSchema.index({ productId: 1, createdAt: -1 });
stockMovementSchema.index({ fromWarehouse: 1, toWarehouse: 1 });

warehouseSchema.index({ code: 1 });
warehouseSchema.index({ isActive: 1, isPrimary: 1 });

inventoryAlertSchema.index({ status: 1, severity: 1, createdAt: -1 });
inventoryAlertSchema.index({ warehouseId: 1, status: 1 });

// Pre-save hooks
inventoryItemSchema.pre('save', function(next) {
  this.availableQuantity = this.quantity - this.reservedQuantity;
  this.totalValue = this.quantity * this.unitCost;
  
  // Update status based on quantity
  if (this.quantity === 0) {
    this.status = 'out_of_stock';
  } else if (this.quantity <= this.reorderLevel) {
    this.status = 'low_stock';
  } else if (this.status === 'out_of_stock' || this.status === 'low_stock') {
    this.status = 'in_stock';
  }
  
  next();
});

// Virtuals
inventoryItemSchema.virtual('product', {
  ref: 'Product',
  localField: 'productId',
  foreignField: '_id',
  justOne: true
});

inventoryItemSchema.virtual('warehouse', {
  ref: 'Warehouse',
  localField: 'location.warehouseId',
  foreignField: '_id',
  justOne: true
});

// Models
export const InventoryItem = mongoose.model<IInventoryItem>('InventoryItem', inventoryItemSchema);
export const StockMovement = mongoose.model<IStockMovement>('StockMovement', stockMovementSchema);
export const Warehouse = mongoose.model<IWarehouse>('Warehouse', warehouseSchema);
export const InventoryAlert = mongoose.model<IInventoryAlert>('InventoryAlert', inventoryAlertSchema);
