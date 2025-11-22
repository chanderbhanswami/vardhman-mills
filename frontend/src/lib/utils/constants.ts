export const SITE_CONFIG = {
  name: 'Vardhman Mills',
  description: 'Premium home furnishing since 1983',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  ogImage: '/images/og-image.jpg',
  links: {
    facebook: 'https://facebook.com/vardhmanmills',
    instagram: 'https://instagram.com/vardhmanmills',
    twitter: 'https://twitter.com/vardhmanmills',
  },
};

export const PRODUCT_CATEGORIES = [
  {
    name: 'Bed Linen',
    slug: 'bed-linen',
    description: 'Premium bed sheets, pillowcases, and covers',
  },
  {
    name: 'Quilts',
    slug: 'quilts',
    description: 'Comfortable quilts for all seasons',
  },
  {
    name: 'Comforters',
    slug: 'comforters',
    description: 'Cozy comforters and duvets',
  },
  {
    name: 'Cushion Covers',
    slug: 'cushion-covers',
    description: 'Decorative cushion covers and pillows',
  },
];

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
} as const;

export const PAYMENT_METHODS = {
  RAZORPAY: 'razorpay',
  COD: 'cod',
} as const;

export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 12,
};

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
];

// Additional useful constants
export const SHIPPING_METHODS = {
  STANDARD: 'standard',
  EXPRESS: 'express',
  OVERNIGHT: 'overnight',
} as const;

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
} as const;

export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  NAME_MAX_LENGTH: 100,
  PHONE_LENGTH: 10,
  PINCODE_LENGTH: 6,
} as const;

export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  PRODUCTS: '/api/products',
  ORDERS: '/api/orders',
  USERS: '/api/users',
  CATEGORIES: '/api/categories',
  CART: '/api/cart',
  WISHLIST: '/api/wishlist',
  REVIEWS: '/api/reviews',
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
} as const;

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logout successful!',
  REGISTRATION_SUCCESS: 'Registration successful!',
  PROFILE_UPDATE_SUCCESS: 'Profile updated successfully!',
  ORDER_PLACED_SUCCESS: 'Order placed successfully!',
  REVIEW_ADDED_SUCCESS: 'Review added successfully!',
} as const;

export const PRODUCT_SIZES = [
  'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL',
  'Single', 'Double', 'Queen', 'King', 'Super King',
  '12x18', '16x24', '18x27', '20x30',
] as const;

export const COLORS = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#000000' },
  { name: 'Red', hex: '#FF0000' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Green', hex: '#008000' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Pink', hex: '#FFC0CB' },
  { name: 'Purple', hex: '#800080' },
  { name: 'Orange', hex: '#FFA500' },
  { name: 'Brown', hex: '#A52A2A' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Navy', hex: '#000080' },
  { name: 'Maroon', hex: '#800000' },
  { name: 'Teal', hex: '#008080' },
  { name: 'Olive', hex: '#808000' },
] as const;

export const FABRIC_TYPES = [
  'Cotton',
  'Silk',
  'Linen',
  'Polyester',
  'Microfiber',
  'Satin',
  'Flannel',
  'Jersey',
  'Bamboo',
  'Tencel',
] as const;

export const THREAD_COUNTS = [
  180, 200, 250, 300, 400, 500, 600, 800, 1000, 1200
] as const;

export const SORT_OPTIONS = [
  { label: 'Popular', value: 'popular' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Rating: High to Low', value: 'rating_desc' },
  { label: 'Name: A to Z', value: 'name_asc' },
  { label: 'Name: Z to A', value: 'name_desc' },
] as const;

export const FILTER_RANGES = {
  PRICE: [
    { label: 'Under ₹500', value: { min: 0, max: 500 } },
    { label: '₹500 - ₹1000', value: { min: 500, max: 1000 } },
    { label: '₹1000 - ₹2000', value: { min: 1000, max: 2000 } },
    { label: '₹2000 - ₹5000', value: { min: 2000, max: 5000 } },
    { label: 'Above ₹5000', value: { min: 5000, max: Infinity } },
  ],
  RATING: [
    { label: '4 Stars & Above', value: 4 },
    { label: '3 Stars & Above', value: 3 },
    { label: '2 Stars & Above', value: 2 },
    { label: '1 Star & Above', value: 1 },
  ],
} as const;

export const CURRENCY = {
  CODE: 'INR',
  SYMBOL: '₹',
  LOCALE: 'en-IN',
} as const;

export const TAX_RATES = {
  GST: 18, // 18% GST
  CGST: 9, // 9% CGST
  SGST: 9, // 9% SGST
  IGST: 18, // 18% IGST (for interstate)
} as const;

export const SHIPPING_CONFIG = {
  FREE_SHIPPING_THRESHOLD: 1000,
  LOCAL_SHIPPING_COST: 50,
  METRO_SHIPPING_COST: 75,
  DEFAULT_SHIPPING_COST: 99,
  EXPRESS_SHIPPING_MULTIPLIER: 2,
  OVERNIGHT_SHIPPING_MULTIPLIER: 3,
} as const;

export const DATE_FORMATS = {
  DISPLAY: 'DD MMM YYYY',
  FULL: 'DD MMMM YYYY, hh:mm A',
  SHORT: 'DD/MM/YYYY',
  ISO: 'YYYY-MM-DD',
  TIME: 'hh:mm A',
} as const;

export const REGEX_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^[6-9]\d{9}$/,
  PINCODE: /^[1-9][0-9]{5}$/,
  PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  GST: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  AADHAAR: /^\d{12}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
} as const;

export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  CART_DATA: 'cart_data',
  WISHLIST_DATA: 'wishlist_data',
  RECENT_SEARCHES: 'recent_searches',
  VIEWED_PRODUCTS: 'viewed_products',
  THEME_PREFERENCE: 'theme_preference',
  LANGUAGE_PREFERENCE: 'language_preference',
} as const;

export const SESSION_STORAGE_KEYS = {
  CHECKOUT_DATA: 'checkout_data',
  SEARCH_FILTERS: 'search_filters',
  FORM_DATA: 'form_data',
} as const;

export const IMAGE_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  THUMBNAIL_SIZE: { width: 150, height: 150 },
  MEDIUM_SIZE: { width: 400, height: 400 },
  LARGE_SIZE: { width: 800, height: 800 },
} as const;

export const SOCIAL_MEDIA_LINKS = {
  FACEBOOK: 'https://facebook.com/vardhmanmills',
  INSTAGRAM: 'https://instagram.com/vardhmanmills',
  TWITTER: 'https://twitter.com/vardhmanmills',
  YOUTUBE: 'https://youtube.com/vardhmanmills',
  PINTEREST: 'https://pinterest.com/vardhmanmills',
  LINKEDIN: 'https://linkedin.com/company/vardhmanmills',
} as const;

export const CONTACT_INFO = {
  PHONE: '+91-9876543210',
  EMAIL: 'info@vardhmanmills.com',
  ADDRESS: '123 Textile Street, Mumbai, Maharashtra 400001',
  WORKING_HOURS: 'Mon-Fri: 9:00 AM - 6:00 PM',
  SUPPORT_EMAIL: 'support@vardhmanmills.com',
  BUSINESS_EMAIL: 'business@vardhmanmills.com',
} as const;