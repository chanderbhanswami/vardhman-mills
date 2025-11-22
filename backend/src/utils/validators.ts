import { z } from 'zod';

// User validation schemas
export const userRegistrationSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain uppercase, lowercase, number and special character'),
  mobile: z.string().optional()
});

// Address validation schema
export const addressSchema = z.object({
  type: z.enum(['home', 'work', 'other']).default('home'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  addressLine1: z.string().min(1, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(1, 'Pincode is required'),
  country: z.string().default('India'),
  mobile: z.string().optional(),
  isDefault: z.boolean().default(false)
});

// Product validation schema
export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  description: z.string().min(1, 'Description is required').max(5000),
  shortDescription: z.string().max(500).optional(),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  brand: z.string().max(100).optional(),
  tags: z.array(z.string()).default([]),
  variants: z.array(z.object({
    size: z.string().optional(),
    color: z.string().optional(),
    material: z.string().optional(),
    sku: z.string().min(1, 'SKU is required'),
    price: z.number().min(0, 'Price must be positive'),
    comparePrice: z.number().min(0).optional(),
    stock: z.number().min(0, 'Stock cannot be negative').default(0),
    images: z.array(z.string()).default([]),
    isActive: z.boolean().default(true)
  })).min(1, 'At least one variant is required'),
  isFeatured: z.boolean().default(false),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional()
});

// Order validation schema
export const orderSchema = z.object({
  items: z.array(z.object({
    product: z.string().min(1, 'Product ID is required'),
    variant: z.string().min(1, 'Variant ID is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1')
  })).min(1, 'At least one item is required'),
  shippingAddress: addressSchema,
  billingAddress: addressSchema,
  paymentMethod: z.enum(['razorpay', 'cod']),
  guestEmail: z.string().email().optional(),
  guestMobile: z.string().optional(),
  notes: z.string().max(500).optional()
});

// Review validation schema
export const reviewSchema = z.object({
  rating: z.number().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
  comment: z.string().min(1, 'Comment is required').max(1000, 'Comment too long')
});