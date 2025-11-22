/**
 * General Validators for Vardhman Mills Frontend
 * Utility functions for common validation scenarios
 */

import { validationHelpers } from './common';
import { customValidators } from './custom-validators';

// Email validation utilities
export const emailValidators = {
  // Basic email validation
  basic: (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  // Strong email validation
  strong: (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  },

  // Check if email domain exists (simplified check)
  domainExists: async (email: string): Promise<boolean> => {
    try {
      const domain = email.split('@')[1];
      if (!domain) return false;

      // This would typically involve DNS lookup in a real application
      // For now, we'll simulate with a basic check
      const commonDomains = [
        'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
        'rediffmail.com', 'ymail.com', 'aol.com', 'icloud.com'
      ];
      
      return commonDomains.includes(domain.toLowerCase()) || domain.includes('.');
    } catch {
      return false;
    }
  },

  // Check for disposable email addresses
  isDisposable: (email: string): boolean => {
    const disposableDomains = [
      '10minutemail.com', 'temp-mail.org', 'guerrillamail.com',
      'throwaway.email', 'mailinator.com', 'tempmail.net'
    ];
    
    const domain = email.split('@')[1]?.toLowerCase();
    return disposableDomains.includes(domain || '');
  },
};

// Password validation utilities
export const passwordValidators = {
  // Check password strength
  strength: (password: string): {
    score: number;
    level: 'weak' | 'fair' | 'good' | 'strong';
    feedback: string[];
  } => {
    const result = validationHelpers.checkPasswordStrength(password);
    
    let level: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
    if (result.score >= 4) level = 'strong';
    else if (result.score >= 3) level = 'good';
    else if (result.score >= 2) level = 'fair';

    return {
      score: result.score,
      level,
      feedback: result.feedback,
    };
  },

  // Check for common passwords
  isCommon: (password: string): boolean => {
    const commonPasswords = [
      'password', '123456', '12345678', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey',
      'dragon', 'master', 'hello', 'login', 'princess'
    ];
    
    return commonPasswords.includes(password.toLowerCase());
  },

  // Check if password contains personal information
  containsPersonalInfo: (password: string, personalInfo: {
    name?: string;
    email?: string;
    phone?: string;
    birthDate?: Date;
  }): boolean => {
    const lowerPassword = password.toLowerCase();
    
    if (personalInfo.name && lowerPassword.includes(personalInfo.name.toLowerCase())) {
      return true;
    }
    
    if (personalInfo.email) {
      const emailParts = personalInfo.email.toLowerCase().split('@')[0];
      if (lowerPassword.includes(emailParts)) return true;
    }
    
    if (personalInfo.phone && lowerPassword.includes(personalInfo.phone.replace(/\D/g, ''))) {
      return true;
    }
    
    if (personalInfo.birthDate) {
      const year = personalInfo.birthDate.getFullYear().toString();
      const month = (personalInfo.birthDate.getMonth() + 1).toString().padStart(2, '0');
      const day = personalInfo.birthDate.getDate().toString().padStart(2, '0');
      
      if (lowerPassword.includes(year) || lowerPassword.includes(month + day)) {
        return true;
      }
    }
    
    return false;
  },
};

// Text validation utilities
export const textValidators = {
  // Check for profanity (basic implementation)
  containsProfanity: (text: string): boolean => {
    const profanityWords = [
      // Add appropriate words based on your requirements
      'spam', 'fake', 'scam', 'hate'
    ];
    
    const lowerText = text.toLowerCase();
    return profanityWords.some(word => lowerText.includes(word));
  },

  // Check text quality
  quality: (text: string): {
    score: number;
    issues: string[];
  } => {
    const issues: string[] = [];
    let score = 100;

    // Check length
    if (text.length < 10) {
      issues.push('Text is too short');
      score -= 20;
    }

    // Check for repeated characters
    if (/(.)\1{3,}/.test(text)) {
      issues.push('Contains too many repeated characters');
      score -= 15;
    }

    // Check for all caps
    if (text === text.toUpperCase() && text.length > 10) {
      issues.push('Avoid writing in all capitals');
      score -= 10;
    }

    // Check for proper sentences
    if (!/[.!?]$/.test(text.trim())) {
      issues.push('Should end with proper punctuation');
      score -= 5;
    }

    return {
      score: Math.max(0, score),
      issues,
    };
  },

  // Check for spam patterns
  isSpam: (text: string): boolean => {
    const spamPatterns = [
      /click here/i,
      /buy now/i,
      /limited time/i,
      /free money/i,
      /guaranteed/i,
      /urgent/i,
      /winner/i,
      /congratulations/i,
    ];

    return spamPatterns.some(pattern => pattern.test(text));
  },
};

// File validation utilities
export const fileValidators = {
  // Validate image file
  image: (file: File): {
    isValid: boolean;
    errors: string[];
  } => {
    const errors: string[] = [];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      errors.push('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
    }

    if (file.size > maxSize) {
      errors.push('File size too large. Maximum size is 5MB.');
    }

    if (file.size === 0) {
      errors.push('File is empty.');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Validate document file
  document: (file: File): {
    isValid: boolean;
    errors: string[];
  } => {
    const errors: string[] = [];
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      errors.push('Invalid file type. Only PDF, Word, and text documents are allowed.');
    }

    if (file.size > maxSize) {
      errors.push('File size too large. Maximum size is 10MB.');
    }

    if (file.size === 0) {
      errors.push('File is empty.');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Validate multiple files
  multiple: (
    files: File[],
    options: {
      maxFiles?: number;
      maxTotalSize?: number;
      allowedTypes?: string[];
    } = {}
  ): {
    isValid: boolean;
    errors: string[];
  } => {
    const errors: string[] = [];
    const {
      maxFiles = 10,
      maxTotalSize = 50 * 1024 * 1024, // 50MB
      allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
    } = options;

    if (files.length === 0) {
      errors.push('No files selected.');
      return { isValid: false, errors };
    }

    if (files.length > maxFiles) {
      errors.push(`Too many files. Maximum ${maxFiles} files allowed.`);
    }

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > maxTotalSize) {
      errors.push(`Total file size too large. Maximum ${Math.round(maxTotalSize / (1024 * 1024))}MB allowed.`);
    }

    files.forEach((file, index) => {
      if (!allowedTypes.includes(file.type)) {
        errors.push(`File ${index + 1}: Invalid file type.`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

// URL validation utilities
export const urlValidators = {
  // Basic URL validation
  basic: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // Check if URL is accessible
  isAccessible: async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
      return response.ok;
    } catch {
      return false;
    }
  },

  // Check if URL is safe (basic implementation)
  isSafe: (url: string): boolean => {
    const suspiciousDomains = [
      'bit.ly', 'tinyurl.com', 'short.link', 'ow.ly'
    ];
    
    try {
      const urlObj = new URL(url);
      return !suspiciousDomains.includes(urlObj.hostname);
    } catch {
      return false;
    }
  },

  // Validate social media URLs
  socialMedia: {
    facebook: (url: string): boolean => customValidators.validateSocialMediaURL(url, 'facebook'),
    instagram: (url: string): boolean => customValidators.validateSocialMediaURL(url, 'instagram'),
    twitter: (url: string): boolean => customValidators.validateSocialMediaURL(url, 'twitter'),
    linkedin: (url: string): boolean => customValidators.validateSocialMediaURL(url, 'linkedin'),
    youtube: (url: string): boolean => customValidators.validateSocialMediaURL(url, 'youtube'),
  },
};

// Date validation utilities
export const dateValidators = {
  // Check if date is in the past
  isPast: (date: Date): boolean => {
    return date < new Date();
  },

  // Check if date is in the future
  isFuture: (date: Date): boolean => {
    return date > new Date();
  },

  // Check if date is within range
  isInRange: (date: Date, startDate: Date, endDate: Date): boolean => {
    return date >= startDate && date <= endDate;
  },

  // Check if person is adult
  isAdult: (birthDate: Date): boolean => {
    return validationHelpers.isAdult(birthDate);
  },

  // Check if date is a business day
  isBusinessDay: (date: Date): boolean => {
    const day = date.getDay();
    return day !== 0 && day !== 6; // Not Sunday (0) or Saturday (6)
  },

  // Check if date is a holiday (basic Indian holidays)
  isHoliday: (date: Date): boolean => {
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // Basic Indian national holidays
    const holidays = [
      { month: 1, day: 26 }, // Republic Day
      { month: 8, day: 15 }, // Independence Day
      { month: 10, day: 2 },  // Gandhi Jayanti
    ];

    return holidays.some(holiday => holiday.month === month && holiday.day === day);
  },
};

// Number validation utilities
export const numberValidators = {
  // Check if number is within range
  inRange: (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
  },

  // Check if number is positive
  isPositive: (value: number): boolean => {
    return value > 0;
  },

  // Check if number is negative
  isNegative: (value: number): boolean => {
    return value < 0;
  },

  // Check if number is integer
  isInteger: (value: number): boolean => {
    return Number.isInteger(value);
  },

  // Check if number is decimal
  isDecimal: (value: number): boolean => {
    return !Number.isInteger(value);
  },

  // Validate Indian currency amount
  indianCurrency: (amount: number): boolean => {
    return amount >= 0 && amount <= 99999999.99; // Up to 9.99 crores
  },

  // Validate percentage
  percentage: (value: number): boolean => {
    return value >= 0 && value <= 100;
  },
};

// Comprehensive validation function
export const validate = {
  email: emailValidators,
  password: passwordValidators,
  text: textValidators,
  file: fileValidators,
  url: urlValidators,
  date: dateValidators,
  number: numberValidators,

  // Composite validators
  required: (value: unknown): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  },

  optional: (value: unknown, validator: (val: NonNullable<typeof value>) => boolean): boolean => {
    if (value === null || value === undefined || value === '') return true;
    return validator(value as NonNullable<typeof value>);
  },

  all: (value: unknown, validators: Array<(val: unknown) => boolean>): boolean => {
    return validators.every(validator => validator(value));
  },

  any: (value: unknown, validators: Array<(val: unknown) => boolean>): boolean => {
    return validators.some(validator => validator(value));
  },
};

const validatorsExport = {
  emailValidators,
  passwordValidators,
  textValidators,
  fileValidators,
  urlValidators,
  dateValidators,
  numberValidators,
  validate,
};

export default validatorsExport;
