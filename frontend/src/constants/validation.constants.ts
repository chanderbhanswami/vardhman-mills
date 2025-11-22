/**
 * Validation Constants - Vardhman Mills Frontend
 * Contains validation rules, patterns, and error messages
 */

// Regular Expressions
export const VALIDATION_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^[+]?[1-9]?[0-9]{7,15}$/,
  PHONE_INDIA: /^[+]?91[-\s]?[6-9]\d{9}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  ALPHABETIC: /^[a-zA-Z\s]+$/,
  NUMERIC: /^\d+$/,
  DECIMAL: /^\d+(\.\d{1,2})?$/,
  URL: /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  USERNAME: /^[a-zA-Z0-9_-]{3,20}$/,
  POSTAL_CODE: /^[0-9]{5,6}$/,
  POSTAL_CODE_INDIA: /^[1-9][0-9]{5}$/,
  GST_NUMBER: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  PAN_NUMBER: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  AADHAR_NUMBER: /^[2-9]{1}[0-9]{3}\s?[0-9]{4}\s?[0-9]{4}$/,
  CREDIT_CARD: /^[0-9]{13,19}$/,
  CVV: /^[0-9]{3,4}$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  IPV4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  MAC_ADDRESS: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
} as const;

// Field Lengths
export const FIELD_LENGTHS = {
  NAME: { min: 2, max: 50 },
  USERNAME: { min: 3, max: 20 },
  EMAIL: { min: 5, max: 254 },
  PASSWORD: { min: 8, max: 128 },
  PHONE: { min: 10, max: 15 },
  ADDRESS: { min: 10, max: 200 },
  CITY: { min: 2, max: 50 },
  STATE: { min: 2, max: 50 },
  COUNTRY: { min: 2, max: 50 },
  POSTAL_CODE: { min: 5, max: 10 },
  COMPANY: { min: 2, max: 100 },
  TITLE: { min: 5, max: 100 },
  DESCRIPTION: { min: 10, max: 1000 },
  REVIEW: { min: 10, max: 500 },
  MESSAGE: { min: 10, max: 2000 },
  PRODUCT_NAME: { min: 3, max: 100 },
  CATEGORY_NAME: { min: 2, max: 50 },
  TAG: { min: 2, max: 30 },
  COUPON_CODE: { min: 3, max: 20 },
} as const;

// Numeric Ranges
export const NUMERIC_RANGES = {
  AGE: { min: 13, max: 120 },
  PRICE: { min: 1, max: 1000000 },
  QUANTITY: { min: 1, max: 1000 },
  DISCOUNT_PERCENTAGE: { min: 0, max: 100 },
  RATING: { min: 1, max: 5 },
  WEIGHT: { min: 0.1, max: 10000 },
  YEAR: { min: 1900, max: new Date().getFullYear() + 10 },
  MONTH: { min: 1, max: 12 },
  DAY: { min: 1, max: 31 },
  HOUR: { min: 0, max: 23 },
  MINUTE: { min: 0, max: 59 },
  PERCENTAGE: { min: 0, max: 100 },
} as const;

// File Validation
export const FILE_VALIDATION = {
  IMAGE: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    MIN_DIMENSIONS: { width: 100, height: 100 },
    MAX_DIMENSIONS: { width: 4000, height: 4000 },
  },
  DOCUMENT: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['application/pdf', 'application/msword', 'text/plain'],
    ALLOWED_EXTENSIONS: ['.pdf', '.doc', '.docx', '.txt'],
  },
  AVATAR: {
    MAX_SIZE: 2 * 1024 * 1024, // 2MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png'],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png'],
    DIMENSIONS: { width: 400, height: 400 },
  },
} as const;

// Password Requirements
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL: true,
  SPECIAL_CHARACTERS: '@$!%*?&',
  NO_COMMON_PASSWORDS: true,
  NO_PERSONAL_INFO: true,
  STRENGTH_LEVELS: {
    WEAK: 0,
    FAIR: 1,
    GOOD: 2,
    STRONG: 3,
    VERY_STRONG: 4,
  },
} as const;

// Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_URL: 'Please enter a valid URL',
  INVALID_DATE: 'Please enter a valid date',
  MIN_LENGTH: 'Must be at least {min} characters',
  MAX_LENGTH: 'Must not exceed {max} characters',
  MIN_VALUE: 'Must be at least {min}',
  MAX_VALUE: 'Must not exceed {max}',
  PATTERN_MISMATCH: 'Invalid format',
  PASSWORDS_NO_MATCH: 'Passwords do not match',
  WEAK_PASSWORD: 'Password is too weak',
  FILE_TOO_LARGE: 'File size must be less than {size}',
  INVALID_FILE_TYPE: 'Invalid file type',
  INVALID_IMAGE_DIMENSIONS: 'Image dimensions must be {width}x{height}',
  TERMS_NOT_ACCEPTED: 'You must accept the terms and conditions',
  PRIVACY_NOT_ACCEPTED: 'You must accept the privacy policy',
  AGE_RESTRICTION: 'You must be at least 18 years old',
  ALREADY_EXISTS: 'This {field} already exists',
  NOT_FOUND: '{field} not found',
  OUT_OF_RANGE: 'Value must be between {min} and {max}',
  INVALID_CHARACTERS: 'Contains invalid characters',
  PROFANITY_DETECTED: 'Content contains inappropriate language',
  SPAM_DETECTED: 'Content appears to be spam',
} as const;

// Custom Validation Rules
export const CUSTOM_VALIDATION = {
  STRONG_PASSWORD: (value: string) => {
    const requirements = [
      /[a-z]/.test(value), // lowercase
      /[A-Z]/.test(value), // uppercase
      /\d/.test(value),     // number
      /[@$!%*?&]/.test(value), // special character
      value.length >= 8,    // min length
    ];
    return requirements.filter(Boolean).length >= 4;
  },
  
  NO_WHITESPACE: (value: string) => {
    return !/\s/.test(value);
  },
  
  FUTURE_DATE: (value: string) => {
    const date = new Date(value);
    return date > new Date();
  },
  
  PAST_DATE: (value: string) => {
    const date = new Date(value);
    return date < new Date();
  },
  
  BUSINESS_HOURS: (value: string) => {
    const hour = parseInt(value.split(':')[0]);
    return hour >= 9 && hour <= 17;
  },
  
  WEEKDAY_ONLY: (value: string) => {
    const date = new Date(value);
    const day = date.getDay();
    return day >= 1 && day <= 5; // Monday to Friday
  },
} as const;

// Sanitization Rules
export const SANITIZATION_RULES = {
  TRIM: true,
  LOWERCASE_EMAIL: true,
  REMOVE_SPECIAL_CHARS: false,
  ESCAPE_HTML: true,
  NORMALIZE_SPACES: true,
  REMOVE_PROFANITY: true,
  MAX_WORDS: {
    TITLE: 20,
    DESCRIPTION: 500,
    REVIEW: 200,
    MESSAGE: 1000,
  },
} as const;

// Form Validation Configuration
export const FORM_VALIDATION_CONFIG = {
  VALIDATE_ON_BLUR: true,
  VALIDATE_ON_CHANGE: false,
  VALIDATE_ON_SUBMIT: true,
  DEBOUNCE_DELAY: 300,
  SHOW_SUCCESS_STATE: true,
  FOCUS_ON_ERROR: true,
  SCROLL_TO_ERROR: true,
  CLEAR_ON_SUCCESS: false,
} as const;

// Common Validation Sets
export const VALIDATION_SETS = {
  USER_REGISTRATION: ['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'phone', 'terms'],
  USER_LOGIN: ['email', 'password'],
  PROFILE_UPDATE: ['firstName', 'lastName', 'phone', 'address'],
  CONTACT_FORM: ['name', 'email', 'subject', 'message'],
  PRODUCT_REVIEW: ['rating', 'title', 'review'],
  CHECKOUT: ['email', 'firstName', 'lastName', 'address', 'city', 'state', 'postalCode'],
  SHIPPING_ADDRESS: ['firstName', 'lastName', 'address', 'city', 'state', 'postalCode', 'country'],
  PAYMENT_CARD: ['cardNumber', 'expiryDate', 'cvv', 'cardholderName'],
} as const;

export type ValidationPatterns = typeof VALIDATION_PATTERNS;
export type FieldLengths = typeof FIELD_LENGTHS;
export type PasswordRequirements = typeof PASSWORD_REQUIREMENTS;
export type ValidationMessages = typeof VALIDATION_MESSAGES;