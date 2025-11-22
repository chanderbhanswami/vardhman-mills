import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError.js';

// Custom validation middleware
export const validationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg).join(', ');
    return next(new AppError(errorMessages, 400));
  }
  next();
};

// Validate category parameter
export const validateCategory = [
  param('category')
    .isIn([
      'general',
      'profile', 
      'notifications',
      'security',
      'api',
      'localization',
      'payment',
      'shipping',
      'email',
      'store',
      'inventory',
      'analytics',
      'backup',
      'maintenance',
      'integrations'
    ])
    .withMessage('Invalid settings category'),
  validationMiddleware
];

// Validate setting key
export const validateSettingKey = [
  param('key')
    .isLength({ min: 1, max: 100 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Setting key must contain only alphanumeric characters, underscores, and hyphens'),
  validationMiddleware
];

// Validate single setting update
export const validateSingleSetting = [
  ...validateCategory,
  ...validateSettingKey,
  body('value')
    .exists()
    .withMessage('Setting value is required'),
  body('type')
    .optional()
    .isIn(['string', 'number', 'boolean', 'json', 'array'])
    .withMessage('Invalid setting type'),
  body('description')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Description must be a string with max 500 characters'),
  body('isGlobal')
    .optional()
    .isBoolean()
    .withMessage('isGlobal must be a boolean'),
  validationMiddleware
];

// Validate bulk settings update
export const validateSettings = [
  ...validateCategory,
  body('settings')
    .isObject()
    .withMessage('Settings must be an object')
    .custom((settings) => {
      // Validate each setting in the object
      for (const [key, value] of Object.entries(settings)) {
        if (typeof key !== 'string' || !key.match(/^[a-zA-Z0-9_-]+$/)) {
          throw new Error(`Invalid setting key: ${key}`);
        }
        
        const setting = value as any;
        if (!setting || typeof setting !== 'object' || setting.value === undefined) {
          throw new Error(`Invalid setting data for key: ${key}`);
        }
        
        if (setting.type && !['string', 'number', 'boolean', 'json', 'array'].includes(setting.type)) {
          throw new Error(`Invalid type for setting ${key}: ${setting.type}`);
        }
      }
      return true;
    }),
  validationMiddleware
];

// Validate settings import
export const validateImportSettings = [
  body('settings')
    .isArray()
    .withMessage('Settings must be an array')
    .custom((settings) => {
      for (let i = 0; i < settings.length; i++) {
        const setting = settings[i];
        
        if (!setting.category || !setting.key || setting.value === undefined) {
          throw new Error(`Invalid setting at index ${i}: category, key, and value are required`);
        }
        
        if (!['general', 'profile', 'notifications', 'security', 'api', 'localization', 'payment', 'shipping', 'email', 'store', 'inventory', 'analytics', 'backup', 'maintenance', 'integrations'].includes(setting.category)) {
          throw new Error(`Invalid category at index ${i}: ${setting.category}`);
        }
        
        if (typeof setting.key !== 'string' || !setting.key.match(/^[a-zA-Z0-9_-]+$/)) {
          throw new Error(`Invalid key at index ${i}: ${setting.key}`);
        }
        
        if (setting.type && !['string', 'number', 'boolean', 'json', 'array'].includes(setting.type)) {
          throw new Error(`Invalid type at index ${i}: ${setting.type}`);
        }
      }
      return true;
    }),
  body('overwrite')
    .optional()
    .isBoolean()
    .withMessage('overwrite must be a boolean'),
  validationMiddleware
];

// Validate query parameters
export const validateGetAllSettings = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000'),
  query('category')
    .optional()
    .isIn([
      'general',
      'profile', 
      'notifications',
      'security',
      'api',
      'localization',
      'payment',
      'shipping',
      'email',
      'store',
      'inventory',
      'analytics',
      'backup',
      'maintenance',
      'integrations'
    ])
    .withMessage('Invalid settings category'),
  query('isGlobal')
    .optional()
    .isBoolean()
    .withMessage('isGlobal must be a boolean'),
  validationMiddleware
];

// Specific setting validations
export const validateGeneralSettings = (settings: any) => {
  const validations: any = {};
  
  if (settings.site_name !== undefined) {
    if (typeof settings.site_name.value !== 'string' || settings.site_name.value.length < 1 || settings.site_name.value.length > 100) {
      validations.site_name = 'Site name must be a string between 1 and 100 characters';
    }
  }
  
  if (settings.contact_email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof settings.contact_email.value !== 'string' || !emailRegex.test(settings.contact_email.value)) {
      validations.contact_email = 'Contact email must be a valid email address';
    }
  }
  
  if (settings.phone_number !== undefined) {
    const phoneRegex = /^\+?[\d\s-()]+$/;
    if (typeof settings.phone_number.value !== 'string' || !phoneRegex.test(settings.phone_number.value)) {
      validations.phone_number = 'Phone number must be a valid phone number';
    }
  }
  
  if (settings.default_currency !== undefined) {
    const validCurrencies = ['INR', 'USD', 'EUR', 'GBP'];
    if (!validCurrencies.includes(settings.default_currency.value)) {
      validations.default_currency = `Currency must be one of: ${validCurrencies.join(', ')}`;
    }
  }
  
  return validations;
};

export const validateShippingSettings = (settings: any) => {
  const validations: any = {};
  
  // Validate shipping rates
  ['standard_rate', 'express_rate', 'overnight_rate', 'free_shipping_threshold'].forEach(key => {
    if (settings[key] !== undefined) {
      const value = Number(settings[key].value);
      if (isNaN(value) || value < 0) {
        validations[key] = `${key.replace('_', ' ')} must be a positive number`;
      }
    }
  });
  
  // Validate processing time
  if (settings.processing_time !== undefined) {
    const validTimes = ['1', '2-3', '5-7'];
    if (!validTimes.includes(settings.processing_time.value)) {
      validations.processing_time = `Processing time must be one of: ${validTimes.join(', ')}`;
    }
  }
  
  // Validate cutoff time
  if (settings.cutoff_time !== undefined) {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(settings.cutoff_time.value)) {
      validations.cutoff_time = 'Cutoff time must be in HH:MM format';
    }
  }
  
  return validations;
};

export const validatePaymentSettings = (settings: any) => {
  const validations: any = {};
  
  // Add payment-specific validations here
  if (settings.razorpay_key_id !== undefined) {
    if (typeof settings.razorpay_key_id.value !== 'string' || settings.razorpay_key_id.value.length < 10) {
      validations.razorpay_key_id = 'Razorpay key ID must be a valid string';
    }
  }
  
  return validations;
};
