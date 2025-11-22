import mongoose, { Document, Schema } from 'mongoose';

// Company Information
export interface ICompanyInfo extends Document {
  name: string;
  description?: string;
  foundedYear?: number;
  founderName?: string;
  headquarters?: string;
  employeeCount?: string;
  industry?: string;
  specialization?: string[];
  certifications?: string[];
  tagline?: string;
  vision?: string;
  mission?: string;
  values?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// History Entry
export interface IHistoryEntry extends Document {
  year: number;
  title: string;
  description: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Team Member
export interface ITeamMember extends Document {
  name: string;
  designation: string;
  department?: string;
  bio?: string;
  image?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  twitter?: string;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  joinedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Award/Certification
export interface IAward extends Document {
  title: string;
  description?: string;
  issuedBy: string;
  issuedDate: Date;
  category: 'award' | 'certification' | 'recognition' | 'achievement';
  image?: string;
  certificateUrl?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Company Location
export interface ILocation extends Document {
  name: string;
  type: 'headquarters' | 'office' | 'factory' | 'warehouse' | 'showroom' | 'branch';
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
  };
  phone?: string;
  email?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  operatingHours?: {
    monday?: { open: string; close: string; };
    tuesday?: { open: string; close: string; };
    wednesday?: { open: string; close: string; };
    thursday?: { open: string; close: string; };
    friday?: { open: string; close: string; };
    saturday?: { open: string; close: string; };
    sunday?: { open: string; close: string; };
  };
  image?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Company Statistics
export interface ICompanyStats extends Document {
  totalProducts?: number;
  totalCustomers?: number;
  totalOrders?: number;
  yearsOfExperience?: number;
  countriesServed?: number;
  teamSize?: number;
  factoriesCount?: number;
  productionCapacity?: string;
  customStats?: Map<string, string | number>;
  updatedAt: Date;
}

// Schemas
const companyInfoSchema = new Schema<ICompanyInfo>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, maxlength: 5000 },
    foundedYear: { type: Number, min: 1800, max: new Date().getFullYear() },
    founderName: { type: String, trim: true },
    headquarters: { type: String, trim: true },
    employeeCount: { type: String, trim: true },
    industry: { type: String, trim: true },
    specialization: [{ type: String, trim: true }],
    certifications: [{ type: String, trim: true }],
    tagline: { type: String, trim: true, maxlength: 200 },
    vision: { type: String, trim: true, maxlength: 2000 },
    mission: { type: String, trim: true, maxlength: 2000 },
    values: [{ type: String, trim: true }]
  },
  { timestamps: true }
);

const historyEntrySchema = new Schema<IHistoryEntry>(
  {
    year: { type: Number, required: true, min: 1800, max: new Date().getFullYear() + 10 },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    image: { type: String, trim: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const teamMemberSchema = new Schema<ITeamMember>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    designation: { type: String, required: true, trim: true, maxlength: 100 },
    department: { type: String, trim: true, maxlength: 100 },
    bio: { type: String, trim: true, maxlength: 1000 },
    image: { type: String, trim: true },
    email: { 
      type: String, 
      trim: true, 
      lowercase: true,
      validate: {
        validator: function(v: string) {
          if (!v) return true;
          return /^\S+@\S+\.\S+$/.test(v);
        },
        message: 'Invalid email address'
      }
    },
    phone: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    twitter: { type: String, trim: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    joinedDate: { type: Date }
  },
  { timestamps: true }
);

const awardSchema = new Schema<IAward>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 1000 },
    issuedBy: { type: String, required: true, trim: true, maxlength: 200 },
    issuedDate: { type: Date, required: true },
    category: { 
      type: String, 
      required: true, 
      enum: ['award', 'certification', 'recognition', 'achievement'],
      default: 'award'
    },
    image: { type: String, trim: true },
    certificateUrl: { type: String, trim: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const locationSchema = new Schema<ILocation>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    type: { 
      type: String, 
      required: true,
      enum: ['headquarters', 'office', 'factory', 'warehouse', 'showroom', 'branch'],
      default: 'office'
    },
    address: {
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
      postalCode: { type: String, trim: true }
    },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    coordinates: {
      lat: { type: Number, min: -90, max: 90 },
      lng: { type: Number, min: -180, max: 180 }
    },
    operatingHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String }
    },
    image: { type: String, trim: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const companyStatsSchema = new Schema<ICompanyStats>(
  {
    totalProducts: { type: Number, min: 0 },
    totalCustomers: { type: Number, min: 0 },
    totalOrders: { type: Number, min: 0 },
    yearsOfExperience: { type: Number, min: 0 },
    countriesServed: { type: Number, min: 0 },
    teamSize: { type: Number, min: 0 },
    factoriesCount: { type: Number, min: 0 },
    productionCapacity: { type: String, trim: true },
    customStats: {
      type: Map,
      of: Schema.Types.Mixed
    }
  },
  { timestamps: true }
);

// Indexes
historyEntrySchema.index({ year: -1, sortOrder: 1 });
teamMemberSchema.index({ sortOrder: 1, name: 1 });
teamMemberSchema.index({ isFeatured: 1, isActive: 1 });
awardSchema.index({ issuedDate: -1, sortOrder: 1 });
awardSchema.index({ category: 1, isActive: 1 });
locationSchema.index({ type: 1, isActive: 1 });
locationSchema.index({ 'address.city': 1, 'address.state': 1 });

// Models
export const CompanyInfo = mongoose.model<ICompanyInfo>('CompanyInfo', companyInfoSchema);
export const HistoryEntry = mongoose.model<IHistoryEntry>('HistoryEntry', historyEntrySchema);
export const TeamMember = mongoose.model<ITeamMember>('TeamMember', teamMemberSchema);
export const Award = mongoose.model<IAward>('Award', awardSchema);
export const CompanyLocation = mongoose.model<ILocation>('CompanyLocation', locationSchema);
export const CompanyStats = mongoose.model<ICompanyStats>('CompanyStats', companyStatsSchema);
