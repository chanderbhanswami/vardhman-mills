/**
 * Validation Utilities
 * Comprehensive form validation and data validation functions
 */

// Types
export interface ValidationResult {
  isValid: boolean;
  message?: string;
  errors?: string[];
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  email?: boolean;
  url?: boolean;
  phone?: boolean;
  custom?: (value: unknown) => boolean | string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  touchedFields: string[];
}

/**
 * Check if value is empty
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Validate required field
 */
export function validateRequired(value: unknown): ValidationResult {
  const isValid = !isEmpty(value);
  return {
    isValid,
    message: isValid ? undefined : 'This field is required'
  };
}

/**
 * Validate string length
 */
export function validateLength(
  value: string, 
  min?: number, 
  max?: number
): ValidationResult {
  if (typeof value !== 'string') {
    return { isValid: false, message: 'Value must be a string' };
  }

  const length = value.length;

  if (min !== undefined && length < min) {
    return {
      isValid: false,
      message: `Must be at least ${min} characters long`
    };
  }

  if (max !== undefined && length > max) {
    return {
      isValid: false,
      message: `Must be no more than ${max} characters long`
    };
  }

  return { isValid: true };
}

/**
 * Validate numeric range
 */
export function validateRange(
  value: number, 
  min?: number, 
  max?: number
): ValidationResult {
  if (typeof value !== 'number' || isNaN(value)) {
    return { isValid: false, message: 'Value must be a number' };
  }

  if (min !== undefined && value < min) {
    return {
      isValid: false,
      message: `Must be at least ${min}`
    };
  }

  if (max !== undefined && value > max) {
    return {
      isValid: false,
      message: `Must be no more than ${max}`
    };
  }

  return { isValid: true };
}

/**
 * Validate email address
 */
export function validateEmail(email: string): ValidationResult {
  if (typeof email !== 'string') {
    return { isValid: false, message: 'Email must be a string' };
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const isValid = emailRegex.test(email.trim());

  return {
    isValid,
    message: isValid ? undefined : 'Please enter a valid email address'
  };
}

/**
 * Validate URL
 */
export function validateURL(url: string): ValidationResult {
  if (typeof url !== 'string') {
    return { isValid: false, message: 'URL must be a string' };
  }

  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, message: 'Please enter a valid URL' };
  }
}

/**
 * Validate phone number (supports multiple formats)
 */
export function validatePhone(phone: string): ValidationResult {
  if (typeof phone !== 'string') {
    return { isValid: false, message: 'Phone number must be a string' };
  }

  // Remove all non-digit characters for validation
  const digits = phone.replace(/\D/g, '');

  // Check for common phone number patterns
  const phonePatterns = [
    /^\d{10}$/, // 1234567890
    /^\d{11}$/, // 11234567890 (with country code)
    /^\+\d{10,15}$/, // +1234567890 (international)
  ];

  const originalPatterns = [
    /^\(\d{3}\)\s?\d{3}-?\d{4}$/, // (123) 456-7890
    /^\d{3}-\d{3}-\d{4}$/, // 123-456-7890
    /^\d{3}\.\d{3}\.\d{4}$/, // 123.456.7890
    /^\+\d{1,3}\s?\d{3,4}\s?\d{3,4}\s?\d{3,4}$/, // International formats
  ];

  const isValidDigits = phonePatterns.some(pattern => pattern.test(digits));
  const isValidFormat = originalPatterns.some(pattern => pattern.test(phone));

  const isValid = isValidDigits || isValidFormat;

  return {
    isValid,
    message: isValid ? undefined : 'Please enter a valid phone number'
  };
}

/**
 * Validate Indian phone number
 */
export function validateIndianPhone(phone: string): ValidationResult {
  if (typeof phone !== 'string') {
    return { isValid: false, message: 'Phone number must be a string' };
  }

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Indian mobile numbers: 10 digits starting with 6-9
  // Or with country code: +91 followed by 10 digits
  const patterns = [
    /^[6-9]\d{9}$/, // 10 digits starting with 6-9
    /^91[6-9]\d{9}$/, // With country code 91
    /^\+91[6-9]\d{9}$/, // With +91 country code
  ];

  const isValid = patterns.some(pattern => pattern.test(digits)) || 
                  patterns.some(pattern => pattern.test(phone));

  return {
    isValid,
    message: isValid ? undefined : 'Please enter a valid Indian phone number'
  };
}

/**
 * Validate password strength
 */
export function validatePassword(
  password: string,
  options: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
  } = {}
): ValidationResult {
  if (typeof password !== 'string') {
    return { isValid: false, message: 'Password must be a string' };
  }

  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true
  } = options;

  const errors: string[] = [];

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    message: errors.length > 0 ? errors[0] : undefined,
    errors
  };
}

/**
 * Validate credit card number using Luhn algorithm
 */
export function validateCreditCard(cardNumber: string): ValidationResult {
  if (typeof cardNumber !== 'string') {
    return { isValid: false, message: 'Card number must be a string' };
  }

  // Remove spaces and dashes
  const digits = cardNumber.replace(/[\s-]/g, '');

  // Check if all characters are digits
  if (!/^\d+$/.test(digits)) {
    return { isValid: false, message: 'Card number must contain only digits' };
  }

  // Check length (13-19 digits for most cards)
  if (digits.length < 13 || digits.length > 19) {
    return { isValid: false, message: 'Card number must be 13-19 digits long' };
  }

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  const isValid = sum % 10 === 0;

  return {
    isValid,
    message: isValid ? undefined : 'Please enter a valid credit card number'
  };
}

/**
 * Validate date string
 */
export function validateDate(
  dateString: string,
  format?: 'ISO' | 'US' | 'EU'
): ValidationResult {
  if (typeof dateString !== 'string') {
    return { isValid: false, message: 'Date must be a string' };
  }

  let datePattern: RegExp;
  let parsedDate: Date;

  switch (format) {
    case 'ISO':
      datePattern = /^\d{4}-\d{2}-\d{2}$/;
      if (!datePattern.test(dateString)) {
        return { isValid: false, message: 'Date must be in YYYY-MM-DD format' };
      }
      parsedDate = new Date(dateString);
      break;

    case 'US':
      datePattern = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12]\d|3[01])\/\d{4}$/;
      if (!datePattern.test(dateString)) {
        return { isValid: false, message: 'Date must be in MM/DD/YYYY format' };
      }
      parsedDate = new Date(dateString);
      break;

    case 'EU':
      datePattern = /^(0?[1-9]|[12]\d|3[01])\/(0?[1-9]|1[0-2])\/\d{4}$/;
      if (!datePattern.test(dateString)) {
        return { isValid: false, message: 'Date must be in DD/MM/YYYY format' };
      }
      // Rearrange for proper parsing
      const [day, month, year] = dateString.split('/');
      parsedDate = new Date(`${month}/${day}/${year}`);
      break;

    default:
      parsedDate = new Date(dateString);
      break;
  }

  const isValid = !isNaN(parsedDate.getTime());

  return {
    isValid,
    message: isValid ? undefined : 'Please enter a valid date'
  };
}

/**
 * Validate age based on date of birth
 */
export function validateAge(
  dateOfBirth: string | Date,
  minAge?: number,
  maxAge?: number
): ValidationResult {
  let birthDate: Date;

  if (typeof dateOfBirth === 'string') {
    birthDate = new Date(dateOfBirth);
  } else {
    birthDate = dateOfBirth;
  }

  if (isNaN(birthDate.getTime())) {
    return { isValid: false, message: 'Please enter a valid date of birth' };
  }

  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // Adjust age if birthday hasn't occurred this year
  const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
    ? age - 1 
    : age;

  if (minAge !== undefined && actualAge < minAge) {
    return {
      isValid: false,
      message: `Must be at least ${minAge} years old`
    };
  }

  if (maxAge !== undefined && actualAge > maxAge) {
    return {
      isValid: false,
      message: `Must be no more than ${maxAge} years old`
    };
  }

  return { isValid: true };
}

/**
 * Validate postal code for different countries
 */
export function validatePostalCode(
  postalCode: string,
  country: 'US' | 'CA' | 'UK' | 'IN' | 'AU' = 'US'
): ValidationResult {
  if (typeof postalCode !== 'string') {
    return { isValid: false, message: 'Postal code must be a string' };
  }

  const patterns: Record<string, RegExp> = {
    US: /^\d{5}(-\d{4})?$/, // 12345 or 12345-6789
    CA: /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/, // A1A 1A1
    UK: /^[A-Za-z]{1,2}\d{1,2}[A-Za-z]?\s?\d[A-Za-z]{2}$/, // SW1A 1AA
    IN: /^\d{6}$/, // 123456
    AU: /^\d{4}$/, // 1234
  };

  const pattern = patterns[country];
  const isValid = pattern.test(postalCode.trim());

  return {
    isValid,
    message: isValid ? undefined : `Please enter a valid ${country} postal code`
  };
}

/**
 * Validate Indian PAN number
 */
export function validatePAN(pan: string): ValidationResult {
  if (typeof pan !== 'string') {
    return { isValid: false, message: 'PAN must be a string' };
  }

  // PAN format: ABCDE1234F (5 letters, 4 digits, 1 letter)
  const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  const isValid = panPattern.test(pan.toUpperCase());

  return {
    isValid,
    message: isValid ? undefined : 'Please enter a valid PAN number (e.g., ABCDE1234F)'
  };
}

/**
 * Validate Indian Aadhaar number
 */
export function validateAadhaar(aadhaar: string): ValidationResult {
  if (typeof aadhaar !== 'string') {
    return { isValid: false, message: 'Aadhaar must be a string' };
  }

  // Remove spaces and dashes
  const digits = aadhaar.replace(/[\s-]/g, '');

  // Aadhaar is 12 digits
  if (!/^\d{12}$/.test(digits)) {
    return { isValid: false, message: 'Aadhaar must be 12 digits' };
  }

  // Verhoeff algorithm for Aadhaar validation
  const verhoeffTable = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
  ];

  const permutationTable = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
  ];

  let checksum = 0;
  const reversedDigits = digits.split('').reverse();

  for (let i = 0; i < reversedDigits.length; i++) {
    const digit = parseInt(reversedDigits[i], 10);
    checksum = verhoeffTable[checksum][permutationTable[i % 8][digit]];
  }

  const isValid = checksum === 0;

  return {
    isValid,
    message: isValid ? undefined : 'Please enter a valid Aadhaar number'
  };
}

/**
 * Validate GST number
 */
export function validateGST(gst: string): ValidationResult {
  if (typeof gst !== 'string') {
    return { isValid: false, message: 'GST must be a string' };
  }

  // GST format: 15 characters (2 state code + 10 PAN + 1 entity + 1 Z/Y + 1 checksum)
  const gstPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
  const isValid = gstPattern.test(gst.toUpperCase());

  return {
    isValid,
    message: isValid ? undefined : 'Please enter a valid GST number'
  };
}

/**
 * Generic validation function using rules
 */
export function validate(value: unknown, rules: ValidationRule): ValidationResult {
  // Required validation
  if (rules.required) {
    const requiredResult = validateRequired(value);
    if (!requiredResult.isValid) return requiredResult;
  }

  // If value is empty and not required, skip other validations
  if (isEmpty(value) && !rules.required) {
    return { isValid: true };
  }

  // String validations
  if (typeof value === 'string') {
    if (rules.minLength !== undefined || rules.maxLength !== undefined) {
      const lengthResult = validateLength(value, rules.minLength, rules.maxLength);
      if (!lengthResult.isValid) return lengthResult;
    }

    if (rules.email) {
      const emailResult = validateEmail(value);
      if (!emailResult.isValid) return emailResult;
    }

    if (rules.url) {
      const urlResult = validateURL(value);
      if (!urlResult.isValid) return urlResult;
    }

    if (rules.phone) {
      const phoneResult = validatePhone(value);
      if (!phoneResult.isValid) return phoneResult;
    }

    if (rules.pattern) {
      const isValid = rules.pattern.test(value);
      if (!isValid) {
        return { isValid: false, message: 'Value does not match the required pattern' };
      }
    }
  }

  // Number validations
  if (typeof value === 'number') {
    if (rules.min !== undefined || rules.max !== undefined) {
      const rangeResult = validateRange(value, rules.min, rules.max);
      if (!rangeResult.isValid) return rangeResult;
    }
  }

  // Custom validation
  if (rules.custom) {
    const customResult = rules.custom(value);
    if (typeof customResult === 'string') {
      return { isValid: false, message: customResult };
    }
    if (!customResult) {
      return { isValid: false, message: 'Value failed custom validation' };
    }
  }

  return { isValid: true };
}

/**
 * Validate entire form
 */
export function validateForm(
  formData: Record<string, unknown>,
  validationRules: Record<string, ValidationRule>
): FormValidationResult {
  const errors: Record<string, string> = {};
  const touchedFields: string[] = [];

  Object.entries(validationRules).forEach(([field, rules]) => {
    const value = formData[field];
    const result = validate(value, rules);
    
    if (!result.isValid && result.message) {
      errors[field] = result.message;
      touchedFields.push(field);
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    touchedFields
  };
}

// Alias export for compatibility
export const validatePattern = (value: string, pattern: RegExp, message?: string): ValidationResult => {
  const isValid = pattern.test(value);
  return {
    isValid: isValid,
    message: isValid ? undefined : (message || 'Pattern validation failed')
  };
};

/**
 * Validation utilities collection
 */
export const validators = {
  isEmpty,
  validateRequired,
  validateLength,
  validateRange,
  validateEmail,
  validateURL,
  validatePhone,
  validateIndianPhone,
  validatePassword,
  validateCreditCard,
  validateDate,
  validateAge,
  validatePostalCode,
  validatePAN,
  validateAadhaar,
  validateGST,
  validatePattern,
  validate,
  validateForm
};

// Export default
const validationUtilities = {
  isEmpty,
  validateRequired,
  validateLength,
  validateRange,
  validateEmail,
  validateURL,
  validatePhone,
  validateIndianPhone,
  validatePassword,
  validateCreditCard,
  validateDate,
  validateAge,
  validatePostalCode,
  validatePAN,
  validateAadhaar,
  validateGST,
  validate,
  validateForm,
  validators
};

export default validationUtilities;
