/**
 * Form Validation Utilities for Vardhman Mills Frontend
 * React Hook Form integration and form-specific validation logic
 */

import { z } from 'zod';
import { useForm, UseFormReturn, FieldErrors, FieldValues, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';

// Form validation hook with enhanced features
export function useFormValidation<T extends FieldValues>(
  schema: z.ZodType<T>,
  options?: {
    mode?: 'onChange' | 'onBlur' | 'onSubmit' | 'onTouched' | 'all';
    reValidateMode?: 'onChange' | 'onBlur' | 'onSubmit';
    defaultValues?: T;
    shouldFocusError?: boolean;
  }
) {
  const form = useForm<T>({
    // @ts-expect-error - Zod resolver type mismatch is a known issue
    resolver: zodResolver(schema),
    mode: options?.mode || 'onChange',
    reValidateMode: options?.reValidateMode || 'onChange',
    // @ts-expect-error - Default values type mismatch
    defaultValues: options?.defaultValues,
    shouldFocusError: options?.shouldFocusError ?? true,
  });

  const submitWithValidation = (onValid: (data: T) => void | Promise<void>) => {
    return async (data: T) => {
      try {
        form.clearErrors();
        await onValid(data);
      } catch (error) {
        handleFormErrors(error, form.setError);
      }
    };
  };

  return {
    ...form,
    isSubmitting: form.formState.isSubmitting,
    submitWithValidation,
  };
}

// Form error handler
export function handleFormErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormReturn<T>['setError']
): void {
  if (error instanceof z.ZodError) {
    // Handle Zod validation errors
    error.issues.forEach((err) => {
      const fieldName = err.path.join('.') as Path<T>;
      setError(fieldName, {
        type: 'manual',
        message: err.message,
      });
    });
  } else if (typeof error === 'object' && error !== null && 'fieldErrors' in error) {
    // Handle backend validation errors
    const fieldErrors = (error as { fieldErrors: Record<string, string[]> }).fieldErrors;
    Object.entries(fieldErrors).forEach(([field, messages]) => {
      setError(field as Path<T>, {
        type: 'manual',
        message: messages[0] || 'Invalid value',
      });
    });
  } else if (typeof error === 'object' && error !== null && 'message' in error) {
    // Handle general errors
    toast.error((error as { message: string }).message);
  } else {
    // Handle unknown errors
    toast.error('An unexpected error occurred');
  }
}

// Form field validation states
export function getFieldValidationState(
  fieldName: string,
  errors: FieldErrors,
  touchedFields: Record<string, boolean> = {}
): {
  isError: boolean;
  isValid: boolean;
  errorMessage?: string;
} {
  const error = errors[fieldName];
  const isTouched = touchedFields[fieldName];

  return {
    isError: !!error,
    isValid: isTouched && !error,
    errorMessage: error?.message as string | undefined,
  };
}

// Form validation utilities
export const formValidationUtils = {
  // Check if form has any errors
  hasErrors: (errors: FieldErrors): boolean => {
    return Object.keys(errors).length > 0;
  },

  // Get first error message
  getFirstError: (errors: FieldErrors): string | undefined => {
    const firstErrorKey = Object.keys(errors)[0];
    return firstErrorKey ? (errors[firstErrorKey]?.message as string) : undefined;
  },

  // Count number of errors
  getErrorCount: (errors: FieldErrors): number => {
    return Object.keys(errors).length;
  },

  // Get all error messages
  getAllErrors: (errors: FieldErrors): string[] => {
    return Object.values(errors)
      .map(error => error?.message as string)
      .filter(Boolean);
  },

  // Check if specific field is dirty
  isFieldDirty: (fieldName: string, dirtyFields: Record<string, boolean>): boolean => {
    return !!dirtyFields[fieldName];
  },

  // Check if form is dirty
  isFormDirty: (dirtyFields: Record<string, boolean>): boolean => {
    return Object.keys(dirtyFields).length > 0;
  },

  // Reset form with confirmation
  resetWithConfirmation: (
    reset: () => void,
    isDirty: boolean,
    message = 'Are you sure you want to reset the form? All unsaved changes will be lost.'
  ): void => {
    if (!isDirty) {
      reset();
      return;
    }

    if (confirm(message)) {
      reset();
    }
  },

  // Format validation errors for display
  formatErrors: (errors: FieldErrors): Record<string, string> => {
    const formatted: Record<string, string> = {};
    Object.entries(errors).forEach(([field, error]) => {
      formatted[field] = error?.message as string || 'Invalid value';
    });
    return formatted;
  },

  // Create field props for form inputs
  createFieldProps: (
    name: string,
    register: UseFormReturn['register'],
    errors: FieldErrors,
    options?: {
      required?: boolean;
      disabled?: boolean;
      placeholder?: string;
    }
  ) => ({
    ...register(name),
    error: !!errors[name],
    helperText: errors[name]?.message as string,
    required: options?.required,
    disabled: options?.disabled,
    placeholder: options?.placeholder,
  }),
};

// Validation middleware for forms
export const validationMiddleware = {
  // Pre-submit validation
  preSubmitValidation: <T>(
    data: T,
    schema?: z.ZodType<T>
  ): { isValid: boolean; errors?: z.ZodError } => {
    if (!schema) return { isValid: true };

    try {
      schema.parse(data);
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { isValid: false, errors: error };
      }
      return { isValid: false };
    }
  },

  // Async field validation
  asyncFieldValidation: async <T>(
    value: T,
    validator: (value: T) => Promise<boolean>,
    errorMessage: string
  ): Promise<boolean | string> => {
    try {
      const isValid = await validator(value);
      return isValid || errorMessage;
    } catch {
      return errorMessage;
    }
  },

  // Cross-field validation
  crossFieldValidation: <T extends Record<string, unknown>>(
    data: T,
    validations: Array<{
      fields: (keyof T)[];
      validator: (values: unknown[]) => boolean;
      errorMessage: string;
      errorField: keyof T;
    }>
  ): Array<{ field: keyof T; message: string }> => {
    const errors: Array<{ field: keyof T; message: string }> = [];

    validations.forEach(({ fields, validator, errorMessage, errorField }) => {
      const values = fields.map(field => data[field]);
      if (!validator(values)) {
        errors.push({ field: errorField, message: errorMessage });
      }
    });

    return errors;
  },

  // Conditional validation
  conditionalValidation: <T>(
    value: T,
    condition: boolean,
    validator: z.ZodType<T>,
    errorMessage?: string
  ): boolean | string => {
    if (!condition) return true;

    try {
      validator.parse(value);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return errorMessage || error.issues[0]?.message || 'Invalid value';
      }
      return errorMessage || 'Invalid value';
    }
  },
};

// Form step validation for multi-step forms
export class MultiStepFormValidator<T extends Record<string, unknown>> {
  private schemas: Map<number, z.ZodType<unknown>> = new Map();
  private currentStep = 0;
  private formData: Partial<T> = {};

  constructor(private totalSteps: number) {}

  // Set schema for a specific step
  setStepSchema(step: number, schema: z.ZodType<unknown>): void {
    this.schemas.set(step, schema);
  }

  // Validate current step
  validateCurrentStep(data: Partial<T>): { isValid: boolean; errors?: z.ZodError } {
    const schema = this.schemas.get(this.currentStep);
    if (!schema) return { isValid: true };

    return validationMiddleware.preSubmitValidation(data, schema);
  }

  // Move to next step
  nextStep(): boolean {
    if (this.currentStep < this.totalSteps - 1) {
      this.currentStep++;
      return true;
    }
    return false;
  }

  // Move to previous step
  previousStep(): boolean {
    if (this.currentStep > 0) {
      this.currentStep--;
      return true;
    }
    return false;
  }

  // Go to specific step
  goToStep(step: number): boolean {
    if (step >= 0 && step < this.totalSteps) {
      this.currentStep = step;
      return true;
    }
    return false;
  }

  // Get current step
  getCurrentStep(): number {
    return this.currentStep;
  }

  // Check if on last step
  isLastStep(): boolean {
    return this.currentStep === this.totalSteps - 1;
  }

  // Check if on first step
  isFirstStep(): boolean {
    return this.currentStep === 0;
  }

  // Update form data
  updateFormData(stepData: Partial<T>): void {
    this.formData = { ...this.formData, ...stepData };
  }

  // Get complete form data
  getFormData(): Partial<T> {
    return this.formData;
  }

  // Validate all steps
  validateAllSteps(): { isValid: boolean; stepErrors: Map<number, z.ZodError> } {
    const stepErrors = new Map<number, z.ZodError>();
    let isValid = true;

    for (let step = 0; step < this.totalSteps; step++) {
      const schema = this.schemas.get(step);
      if (schema) {
        const result = validationMiddleware.preSubmitValidation(this.formData, schema);
        if (!result.isValid && result.errors) {
          stepErrors.set(step, result.errors);
          isValid = false;
        }
      }
    }

    return { isValid, stepErrors };
  }

  // Reset validator
  reset(): void {
    this.currentStep = 0;
    this.formData = {};
  }
}

// Form validation helper for React components
export function createFormValidationHelper<T extends FieldValues>(
  schema: z.ZodType<T>
) {
  return {
    schema,
    useValidation: (options?: Parameters<typeof useFormValidation<T>>[1]) => 
      useFormValidation(schema, options),
    validate: (data: T) => {
      try {
        schema.parse(data);
        return { success: true, data };
      } catch (error) {
        return { success: false, error };
      }
    },
  };
}

// Common form validation schemas for reuse
export const commonFormSchemas = {
  // Contact form
  contact: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    subject: z.string().min(5, 'Subject must be at least 5 characters'),
    message: z.string().min(10, 'Message must be at least 10 characters'),
  }),

  // Newsletter subscription
  newsletter: z.object({
    email: z.string().email('Invalid email address'),
    preferences: z.array(z.string()).optional(),
    frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  }),

  // Search form
  search: z.object({
    query: z.string().min(1, 'Search query is required'),
    category: z.string().optional(),
    sortBy: z.enum(['relevance', 'price-low', 'price-high', 'newest']).optional(),
    priceMin: z.number().min(0).optional(),
    priceMax: z.number().min(0).optional(),
  }),

  // Filter form
  filter: z.object({
    categories: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    priceRange: z.object({
      min: z.number().min(0),
      max: z.number().min(0),
    }).optional(),
    availability: z.boolean().optional(),
    rating: z.number().min(1).max(5).optional(),
  }),
};

// Export validation utilities
const formValidationExport = {
  useFormValidation,
  handleFormErrors,
  getFieldValidationState,
  formValidationUtils,
  validationMiddleware,
  MultiStepFormValidator,
  createFormValidationHelper,
  commonFormSchemas,
};

export default formValidationExport;
