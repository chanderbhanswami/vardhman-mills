import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Shipping Zone Interface
 */
export interface IShippingZone extends Document {
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  priority: number;

  // Location criteria
  locations: Array<{
    type: 'country' | 'state' | 'city' | 'zipcode';
    values: string[];
    exclude?: boolean;
  }>;

  // Conditions
  conditions?: Array<{
    type: 'order_weight' | 'order_value' | 'item_count';
    operator: 'equals' | 'greater_than' | 'less_than' | 'between';
    value: number | number[];
  }>;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Shipping Method Interface
 */
export interface IShippingMethod extends Document {
  zoneId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  type: 'flat_rate' | 'free' | 'calculated' | 'pickup' | 'express';
  status: 'active' | 'inactive';
  priority: number;

  // Rate calculation
  rateCalculation: {
    method: 'fixed' | 'weight_based' | 'price_based';
    baseRate: number;
    
    weightRates?: Array<{
      minWeight: number;
      maxWeight?: number;
      rate: number;
    }>;
    
    priceRates?: Array<{
      minPrice: number;
      maxPrice?: number;
      rate: number;
      percentage?: number;
    }>;
  };

  // Delivery estimates
  deliveryEstimate: {
    minDays: number;
    maxDays: number;
    businessDaysOnly: boolean;
  };

  // Requirements
  requirements: {
    minOrderValue?: number;
    maxOrderValue?: number;
    minWeight?: number;
    maxWeight?: number;
  };

  // Features
  features: {
    tracking: boolean;
    insurance: boolean;
    signature: boolean;
  };

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Shipping Zone Model Interface
 */
export interface IShippingZoneModel extends Model<IShippingZone> {
  findActiveZones(): Promise<IShippingZone[]>;
  findByLocation(country: string, state?: string, city?: string, zipcode?: string): Promise<IShippingZone[]>;
}

/**
 * Shipping Method Model Interface
 */
export interface IShippingMethodModel extends Model<IShippingMethod> {
  findByZone(zoneId: string): Promise<IShippingMethod[]>;
  calculateRate(methodId: string, params: {
    weight: number;
    orderValue: number;
    itemCount: number;
  }): Promise<number>;
}

/**
 * Shipping Zone Schema
 */
const shippingZoneSchema = new Schema<IShippingZone, IShippingZoneModel>(
  {
    name: {
      type: String,
      required: [true, 'Zone name is required'],
      maxlength: [100, 'Zone name must not exceed 100 characters'],
      unique: true
    },
    description: {
      type: String,
      maxlength: [500, 'Description must not exceed 500 characters']
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true
    },
    priority: {
      type: Number,
      default: 0,
      min: 0
    },

    // Location criteria
    locations: [{
      type: {
        type: String,
        enum: ['country', 'state', 'city', 'zipcode'],
        required: true
      },
      values: {
        type: [String],
        required: true
      },
      exclude: {
        type: Boolean,
        default: false
      }
    }],

    // Conditions
    conditions: [{
      type: {
        type: String,
        enum: ['order_weight', 'order_value', 'item_count']
      },
      operator: {
        type: String,
        enum: ['equals', 'greater_than', 'less_than', 'between']
      },
      value: Schema.Types.Mixed
    }]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
shippingZoneSchema.index({ status: 1, priority: -1 });
shippingZoneSchema.index({ 'locations.type': 1, 'locations.values': 1 });

/**
 * Find active zones
 */
shippingZoneSchema.statics.findActiveZones = async function (): Promise<any[]> {
  return await this.find({ status: 'active' })
    .sort({ priority: -1, createdAt: 1 })
    .lean();
};

/**
 * Find zones by location
 */
shippingZoneSchema.statics.findByLocation = async function (
  country: string,
  state?: string,
  city?: string,
  zipcode?: string
): Promise<any[]> {
  const query: any = {
    status: 'active',
    $or: [
      { 'locations.type': 'country', 'locations.values': country, 'locations.exclude': { $ne: true } }
    ]
  };

  if (state) {
    query.$or.push({ 'locations.type': 'state', 'locations.values': state, 'locations.exclude': { $ne: true } });
  }

  if (city) {
    query.$or.push({ 'locations.type': 'city', 'locations.values': city, 'locations.exclude': { $ne: true } });
  }

  if (zipcode) {
    query.$or.push({ 'locations.type': 'zipcode', 'locations.values': zipcode, 'locations.exclude': { $ne: true } });
  }

  return await this.find(query)
    .sort({ priority: -1, createdAt: 1 })
    .lean();
};

/**
 * Shipping Method Schema
 */
const shippingMethodSchema = new Schema<IShippingMethod, IShippingMethodModel>(
  {
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ShippingZone',
      required: [true, 'Zone ID is required'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Method name is required'],
      maxlength: [100, 'Method name must not exceed 100 characters']
    },
    description: {
      type: String,
      maxlength: [500, 'Description must not exceed 500 characters']
    },
    type: {
      type: String,
      enum: ['flat_rate', 'free', 'calculated', 'pickup', 'express'],
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true
    },
    priority: {
      type: Number,
      default: 0,
      min: 0
    },

    // Rate calculation
    rateCalculation: {
      method: {
        type: String,
        enum: ['fixed', 'weight_based', 'price_based'],
        required: true
      },
      baseRate: {
        type: Number,
        required: true,
        min: 0
      },
      
      weightRates: [{
        minWeight: {
          type: Number,
          required: true,
          min: 0
        },
        maxWeight: Number,
        rate: {
          type: Number,
          required: true,
          min: 0
        }
      }],
      
      priceRates: [{
        minPrice: {
          type: Number,
          required: true,
          min: 0
        },
        maxPrice: Number,
        rate: {
          type: Number,
          required: true,
          min: 0
        },
        percentage: Number
      }]
    },

    // Delivery estimates
    deliveryEstimate: {
      minDays: {
        type: Number,
        required: true,
        min: 0
      },
      maxDays: {
        type: Number,
        required: true,
        min: 0
      },
      businessDaysOnly: {
        type: Boolean,
        default: true
      }
    },

    // Requirements
    requirements: {
      minOrderValue: Number,
      maxOrderValue: Number,
      minWeight: Number,
      maxWeight: Number
    },

    // Features
    features: {
      tracking: {
        type: Boolean,
        default: false
      },
      insurance: {
        type: Boolean,
        default: false
      },
      signature: {
        type: Boolean,
        default: false
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
shippingMethodSchema.index({ zoneId: 1, status: 1, priority: -1 });
shippingMethodSchema.index({ type: 1, status: 1 });

// Virtual for zone
shippingMethodSchema.virtual('zone', {
  ref: 'ShippingZone',
  localField: 'zoneId',
  foreignField: '_id',
  justOne: true
});

/**
 * Find methods by zone
 */
shippingMethodSchema.statics.findByZone = async function (zoneId: string): Promise<any[]> {
  return await this.find({
    zoneId,
    status: 'active'
  })
    .sort({ priority: -1, createdAt: 1 })
    .lean();
};

/**
 * Calculate shipping rate
 */
shippingMethodSchema.statics.calculateRate = async function (
  methodId: string,
  params: { weight: number; orderValue: number; itemCount: number }
): Promise<number> {
  const method = await this.findById(methodId);

  if (!method || method.status !== 'active') {
    throw new Error('Shipping method not available');
  }

  const { rateCalculation, requirements, type } = method;

  // Check requirements
  if (requirements.minOrderValue && params.orderValue < requirements.minOrderValue) {
    throw new Error(`Minimum order value is ${requirements.minOrderValue}`);
  }
  if (requirements.maxOrderValue && params.orderValue > requirements.maxOrderValue) {
    throw new Error(`Maximum order value is ${requirements.maxOrderValue}`);
  }
  if (requirements.minWeight && params.weight < requirements.minWeight) {
    throw new Error(`Minimum weight is ${requirements.minWeight}`);
  }
  if (requirements.maxWeight && params.weight > requirements.maxWeight) {
    throw new Error(`Maximum weight is ${requirements.maxWeight}`);
  }

  // Free shipping
  if (type === 'free') {
    return 0;
  }

  // Calculate rate based on method
  let rate = rateCalculation.baseRate;

  if (rateCalculation.method === 'weight_based' && rateCalculation.weightRates) {
    const weightRate = rateCalculation.weightRates.find((r: any) => {
      return params.weight >= r.minWeight && (!r.maxWeight || params.weight <= r.maxWeight);
    });
    if (weightRate) {
      rate = weightRate.rate;
    }
  }

  if (rateCalculation.method === 'price_based' && rateCalculation.priceRates) {
    const priceRate = rateCalculation.priceRates.find((r: any) => {
      return params.orderValue >= r.minPrice && (!r.maxPrice || params.orderValue <= r.maxPrice);
    });
    if (priceRate) {
      rate = priceRate.rate;
      if (priceRate.percentage) {
        rate += (params.orderValue * priceRate.percentage) / 100;
      }
    }
  }

  return Math.round(rate * 100) / 100; // Round to 2 decimals
};

// Create the models
export const ShippingZone = mongoose.model<IShippingZone, IShippingZoneModel>(
  'ShippingZone',
  shippingZoneSchema
);

export const ShippingMethod = mongoose.model<IShippingMethod, IShippingMethodModel>(
  'ShippingMethod',
  shippingMethodSchema
);
