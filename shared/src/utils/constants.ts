export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export const PAYMENT_METHODS = {
  RAZORPAY: 'razorpay',
  COD: 'cod',
} as const;

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

export const ADDRESS_TYPES = {
  HOME: 'home',
  WORK: 'work',
  OTHER: 'other',
} as const;

export const SORT_OPTIONS = {
  NEWEST: '-createdAt',
  OLDEST: 'createdAt',
  PRICE_LOW_HIGH: 'variants.price',
  PRICE_HIGH_LOW: '-variants.price',
  RATING_HIGH_LOW: '-averageRating',
  NAME_A_Z: 'name',
  NAME_Z_A: '-name',
} as const;

export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 12,
} as const;

export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  MAX_FILES: 10,
} as const;

export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters',
  PASSWORD_REQUIREMENTS: 'Password must contain uppercase, lowercase, number and special character',
  PASSWORDS_DONT_MATCH: "Passwords don't match",
  INVALID_PINCODE: 'Please enter a valid PIN code',
  INVALID_PRICE: 'Price must be a positive number',
  INSUFFICIENT_STOCK: 'Insufficient stock available',
} as const;

export const PRODUCT_CATEGORIES = {
  BED_LINEN: 'bed-linen',
  QUILTS: 'quilts',
  COMFORTERS: 'comforters',
  CUSHION_COVERS: 'cushion-covers',
} as const;

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
] as const;

export const SHIPPING_ZONES = {
  LOCAL: { name: 'Local', cost: 50, days: '1-2' },
  METRO: { name: 'Metro Cities', cost: 75, days: '2-3' },
  STANDARD: { name: 'Standard', cost: 99, days: '3-5' },
  EXPRESS: { name: 'Express', cost: 149, days: '1-2' },
} as const;

export const TAX_RATES = {
  GST: 0.18, // 18% GST
  CGST: 0.09, // 9% CGST
  SGST: 0.09, // 9% SGST
} as const;