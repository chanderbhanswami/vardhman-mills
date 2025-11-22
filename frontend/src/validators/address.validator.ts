/**
 * Address Validation Schema
 * 
 * Zod schema for validating address form data with
 * Indian address format rules and postal code validation.
 */

import { z } from 'zod';

// Phone number validation (Indian format)
const phoneRegex = /^[6-9]\d{9}$/;

// Pincode validation (6 digits)
const pincodeRegex = /^\d{6}$/;

// Name validation (letters, spaces, hyphens)
const nameRegex = /^[a-zA-Z\s\-'.]+$/;

export const addressSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .regex(nameRegex, 'Name can only contain letters, spaces, and hyphens')
    .trim(),
  
  phone: z
    .string()
    .regex(phoneRegex, 'Please enter a valid 10-digit Indian mobile number')
    .length(10, 'Phone number must be exactly 10 digits'),
  
  address: z
    .string()
    .min(10, 'Address must be at least 10 characters')
    .max(200, 'Address must not exceed 200 characters')
    .trim(),
  
  city: z
    .string()
    .min(2, 'City name must be at least 2 characters')
    .max(50, 'City name must not exceed 50 characters')
    .trim(),
  
  state: z
    .string()
    .min(2, 'State name must be at least 2 characters')
    .max(50, 'State name must not exceed 50 characters')
    .trim(),
  
  pincode: z
    .string()
    .regex(pincodeRegex, 'Pincode must be exactly 6 digits')
    .length(6, 'Pincode must be exactly 6 digits'),
  
  country: z
    .string()
    .min(2, 'Country name is required')
    .default('India'),
  
  type: z
    .enum(['home', 'work', 'other'], {
      message: 'Please select a valid address type',
    })
    .default('home'),
  
  landmark: z
    .string()
    .max(100, 'Landmark must not exceed 100 characters')
    .optional()
    .or(z.literal('')),
  
  deliveryInstructions: z
    .string()
    .max(250, 'Delivery instructions must not exceed 250 characters')
    .optional()
    .or(z.literal('')),
  
  isDefault: z
    .boolean()
    .default(false),
  
  coordinates: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    })
    .optional(),
});

// Export type inferred from schema
export type AddressFormValues = z.infer<typeof addressSchema>;

// Partial schema for address updates (all fields optional except id)
export const addressUpdateSchema = addressSchema.partial().extend({
  id: z.string().min(1, 'Address ID is required'),
});

export type AddressUpdateValues = z.infer<typeof addressUpdateSchema>;
