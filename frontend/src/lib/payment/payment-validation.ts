/**
 * Payment Validation for Vardhman Mills Frontend
 * Comprehensive validation for payment data and processes
 */

import { z } from 'zod';

// Card validation schemas
export const cardNumberSchema = z.string()
  .min(13, 'Card number must be at least 13 digits')
  .max(19, 'Card number cannot exceed 19 digits')
  .regex(/^\d+$/, 'Card number must contain only digits')
  .refine((val) => luhnCheck(val), 'Invalid card number');

export const cardExpirySchema = z.string()
  .regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, 'Invalid expiry format (MM/YY)')
  .refine((val) => {
    const matches = val.replace('/', '').match(/.{1,2}/g);
    if (!matches || matches.length !== 2) return false;
    const [month, year] = matches;
    const expiry = new Date(2000 + parseInt(year, 10), parseInt(month, 10) - 1);
    return expiry > new Date();
  }, 'Card has expired');

export const cvvSchema = z.string()
  .min(3, 'CVV must be at least 3 digits')
  .max(4, 'CVV cannot exceed 4 digits')
  .regex(/^\d+$/, 'CVV must contain only digits');

export const cardHolderNameSchema = z.string()
  .min(2, 'Cardholder name must be at least 2 characters')
  .max(50, 'Cardholder name cannot exceed 50 characters')
  .regex(/^[a-zA-Z\s]+$/, 'Cardholder name must contain only letters and spaces');

// UPI validation
export const upiIdSchema = z.string()
  .regex(/^[a-zA-Z0-9.-]{2,256}@[a-zA-Z]{2,64}$/, 'Invalid UPI ID format');

// Phone number validation
export const phoneNumberSchema = z.string()
  .regex(/^(\+91)?[6-9]\d{9}$/, 'Invalid phone number format');

// Bank account validation
export const accountNumberSchema = z.string()
  .min(9, 'Account number must be at least 9 digits')
  .max(18, 'Account number cannot exceed 18 digits')
  .regex(/^\d+$/, 'Account number must contain only digits');

export const ifscCodeSchema = z.string()
  .length(11, 'IFSC code must be exactly 11 characters')
  .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format');

// Amount validation
export const amountSchema = z.number()
  .positive('Amount must be positive')
  .max(1000000, 'Amount cannot exceed ₹10,00,000')
  .refine((val) => val >= 1, 'Minimum amount is ₹1')
  .refine((val) => Number.isFinite(val), 'Invalid amount');

// Address validation
export const addressSchema = z.object({
  street: z.string().min(5, 'Street address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  zipCode: z.string().regex(/^\d{6}$/, 'Invalid ZIP code format'),
  country: z.string().min(2, 'Country is required'),
});

// Complete payment validation schemas
export const cardPaymentSchema = z.object({
  cardNumber: cardNumberSchema,
  expiryDate: cardExpirySchema,
  cvv: cvvSchema,
  cardHolderName: cardHolderNameSchema,
  amount: amountSchema,
  billingAddress: addressSchema,
});

export const upiPaymentSchema = z.object({
  upiId: upiIdSchema,
  amount: amountSchema,
});

export const netBankingSchema = z.object({
  bankCode: z.string().min(2, 'Bank selection is required'),
  amount: amountSchema,
});

export const walletPaymentSchema = z.object({
  walletType: z.enum(['paytm', 'phonepe', 'amazonpay', 'googlepay']),
  amount: amountSchema,
});

export const codPaymentSchema = z.object({
  amount: amountSchema.max(10000, 'COD not available for orders above ₹10,000'),
  deliveryAddress: addressSchema,
});

// Validation utility class
export class PaymentValidator {
  /**
   * Luhn algorithm for card number validation
   */
  static luhnCheck(cardNumber: string): boolean {
    return luhnCheck(cardNumber);
  }

  /**
   * Validate card number and identify card type
   */
  static validateCardNumber(cardNumber: string): {
    isValid: boolean;
    cardType: string;
    error?: string;
  } {
    const cleaned = cardNumber.replace(/\s/g, '');
    
    try {
      cardNumberSchema.parse(cleaned);
      const cardType = this.identifyCardType(cleaned);
      return { isValid: true, cardType };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { 
          isValid: false, 
          cardType: 'unknown',
          error: error.issues[0]?.message || 'Invalid card number'
        };
      }
      return { isValid: false, cardType: 'unknown', error: 'Invalid card number' };
    }
  }

  /**
   * Identify card type from card number
   */
  static identifyCardType(cardNumber: string): string {
    const patterns = {
      visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
      mastercard: /^5[1-5][0-9]{14}$/,
      amex: /^3[47][0-9]{13}$/,
      discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
      rupay: /^6[0-9]{15}$/,
      diners: /^3[0689][0-9]{11}$/,
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(cardNumber)) {
        return type;
      }
    }

    return 'unknown';
  }

  /**
   * Validate card expiry
   */
  static validateCardExpiry(expiry: string): {
    isValid: boolean;
    error?: string;
  } {
    try {
      cardExpirySchema.parse(expiry);
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { 
          isValid: false, 
          error: error.issues[0]?.message || 'Invalid expiry date'
        };
      }
      return { isValid: false, error: 'Invalid expiry date' };
    }
  }

  /**
   * Validate CVV
   */
  static validateCVV(cvv: string, cardType: string = 'visa'): {
    isValid: boolean;
    error?: string;
  } {
    try {
      // American Express CVV is 4 digits, others are 3
      const expectedLength = cardType === 'amex' ? 4 : 3;
      
      if (cvv.length !== expectedLength) {
        return { 
          isValid: false, 
          error: `CVV must be ${expectedLength} digits for ${cardType}` 
        };
      }

      cvvSchema.parse(cvv);
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { 
          isValid: false, 
          error: error.issues[0]?.message || 'Invalid CVV'
        };
      }
      return { isValid: false, error: 'Invalid CVV' };
    }
  }

  /**
   * Validate UPI ID
   */
  static validateUpiId(upiId: string): {
    isValid: boolean;
    provider?: string;
    error?: string;
  } {
    try {
      upiIdSchema.parse(upiId);
      const provider = this.identifyUpiProvider(upiId);
      return { isValid: true, provider };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { 
          isValid: false, 
          error: error.issues[0]?.message || 'Invalid UPI ID'
        };
      }
      return { isValid: false, error: 'Invalid UPI ID' };
    }
  }

  /**
   * Identify UPI provider from UPI ID
   */
  static identifyUpiProvider(upiId: string): string {
    const domain = upiId.split('@')[1]?.toLowerCase();
    
    const providers: Record<string, string> = {
      'paytm': 'Paytm',
      'ybl': 'PhonePe',
      'apl': 'Amazon Pay',
      'okaxis': 'Google Pay',
      'okicici': 'Google Pay',
      'okhdfcbank': 'HDFC Bank',
      'oksbi': 'SBI Pay',
      'axl': 'Axis Bank',
      'upi': 'Generic UPI',
    };

    return providers[domain] || 'Unknown Provider';
  }

  /**
   * Validate phone number
   */
  static validatePhoneNumber(phone: string): {
    isValid: boolean;
    formatted?: string;
    error?: string;
  } {
    try {
      phoneNumberSchema.parse(phone);
      const formatted = this.formatPhoneNumber(phone);
      return { isValid: true, formatted };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { 
          isValid: false, 
          error: error.issues[0]?.message || 'Invalid phone number'
        };
      }
      return { isValid: false, error: 'Invalid phone number' };
    }
  }

  /**
   * Format phone number
   */
  static formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      return `+91${cleaned}`;
    }
    
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return `+${cleaned}`;
    }
    
    return phone;
  }

  /**
   * Validate bank account details
   */
  static validateBankAccount(accountNumber: string, ifscCode: string): {
    isValid: boolean;
    bankName?: string;
    error?: string;
  } {
    try {
      accountNumberSchema.parse(accountNumber);
      ifscCodeSchema.parse(ifscCode);
      
      const bankName = this.getBankNameFromIFSC(ifscCode);
      return { isValid: true, bankName };
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { 
          isValid: false, 
          error: error.issues[0]?.message || 'Invalid bank details'
        };
      }
      return { isValid: false, error: 'Invalid bank details' };
    }
  }

  /**
   * Get bank name from IFSC code
   */
  static getBankNameFromIFSC(ifscCode: string): string {
    const bankCodes: Record<string, string> = {
      'SBIN': 'State Bank of India',
      'HDFC': 'HDFC Bank',
      'ICIC': 'ICICI Bank',
      'AXIS': 'Axis Bank',
      'KKBK': 'Kotak Mahindra Bank',
      'YESB': 'Yes Bank',
      'INDB': 'IndusInd Bank',
      'FDRL': 'Federal Bank',
      'IOBA': 'Indian Overseas Bank',
      'PUNB': 'Punjab National Bank',
    };

    const bankCode = ifscCode.substring(0, 4);
    return bankCodes[bankCode] || 'Unknown Bank';
  }

  /**
   * Validate payment amount for specific method
   */
  static validatePaymentAmount(
    amount: number, 
    paymentMethod: string
  ): {
    isValid: boolean;
    error?: string;
  } {
    try {
      amountSchema.parse(amount);

      // Method-specific validations
      const limits = {
        cod: { min: 1, max: 10000 },
        upi: { min: 1, max: 100000 },
        card: { min: 1, max: 500000 },
        netbanking: { min: 1, max: 1000000 },
        wallet: { min: 1, max: 50000 },
        emi: { min: 5000, max: 500000 },
      };

      const limit = limits[paymentMethod as keyof typeof limits];
      
      if (limit) {
        if (amount < limit.min) {
          return { 
            isValid: false, 
            error: `Minimum amount for ${paymentMethod} is ₹${limit.min}` 
          };
        }
        
        if (amount > limit.max) {
          return { 
            isValid: false, 
            error: `Maximum amount for ${paymentMethod} is ₹${limit.max}` 
          };
        }
      }

      return { isValid: true };
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { 
          isValid: false, 
          error: error.issues[0]?.message || 'Invalid amount'
        };
      }
      return { isValid: false, error: 'Invalid amount' };
    }
  }

  /**
   * Validate complete payment data
   */
  static validatePaymentData(
    paymentMethod: string, 
    data: Record<string, unknown>
  ): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    try {
      switch (paymentMethod) {
        case 'card':
          cardPaymentSchema.parse(data);
          break;
        case 'upi':
          upiPaymentSchema.parse(data);
          break;
        case 'netbanking':
          netBankingSchema.parse(data);
          break;
        case 'wallet':
          walletPaymentSchema.parse(data);
          break;
        case 'cod':
          codPaymentSchema.parse(data);
          break;
        default:
          errors.push('Unsupported payment method');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.push(...error.issues.map((issue: z.ZodIssue) => 
          `${issue.path.join('.')}: ${issue.message}`
        ));
      } else {
        errors.push('Invalid payment data');
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Check if payment method is available for amount
   */
  static isPaymentMethodAvailable(
    paymentMethod: string, 
    amount: number
  ): boolean {
    const validation = this.validatePaymentAmount(amount, paymentMethod);
    return validation.isValid;
  }

  /**
   * Get available payment methods for amount
   */
  static getAvailablePaymentMethods(amount: number): string[] {
    const methods = ['card', 'upi', 'netbanking', 'wallet', 'emi', 'cod'];
    
    return methods.filter(method => 
      this.isPaymentMethodAvailable(method, amount)
    );
  }
}

// Luhn algorithm implementation
function luhnCheck(cardNumber: string): boolean {
  let sum = 0;
  let alternate = false;
  
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let n = parseInt(cardNumber.charAt(i), 10);
    
    if (alternate) {
      n *= 2;
      if (n > 9) {
        n = (n % 10) + 1;
      }
    }
    
    sum += n;
    alternate = !alternate;
  }
  
  return sum % 10 === 0;
}

export default PaymentValidator;