/**
 * RegisterForm Component - Vardhman Mills Frontend
 * 
 * Complete user registration form with comprehensive validation,
 * social registration options, and email verification.
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  AlertCircle,
  Phone,
  Building
} from 'lucide-react';
import toast from 'react-hot-toast';
import { GoogleLogin } from './GoogleLogin';
import { FacebookLogin } from './FacebookLogin';

// Import UI components for better consistency and maintainability
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Container } from '../ui/Container';

// Validation schema
const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number and special character'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^\+?[\d\s\-\(\)]{10,15}$/.test(val), {
      message: 'Please enter a valid phone number'
    }),
  company: z
    .string()
    .optional(),
  acceptTerms: z
    .boolean()
    .refine(val => val === true, {
      message: 'You must accept the terms and conditions'
    }),
  acceptMarketing: z
    .boolean()
    .optional()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

type RegisterFormData = z.infer<typeof registerSchema>;

// Types
interface RegisterFormProps {
  className?: string;
  onSuccess?: (user: { id: string; email: string; name?: string } | null) => void;
  onError?: (error: string) => void;
  redirectTo?: string;
  showSocialLogin?: boolean;
  showCompanyField?: boolean;
  showPhoneField?: boolean;
  title?: string;
  subtitle?: string;
}

interface RegisterState {
  isLoading: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  passwordStrength: number;
}

/**
 * Password strength calculation
 */
const calculatePasswordStrength = (password: string): number => {
  let strength = 0;
  
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;
  if (/[a-z]/.test(password)) strength += 20;
  if (/[A-Z]/.test(password)) strength += 20;
  if (/\d/.test(password)) strength += 20;
  if (/[@$!%*?&]/.test(password)) strength += 10;
  
  return Math.min(strength, 100);
};

/**
 * Password strength indicator
 */
const PasswordStrengthIndicator: React.FC<{ 
  password: string;
  className?: string;
}> = ({ password, className = '' }) => {
  const strength = calculatePasswordStrength(password);
  
  const getStrengthLabel = () => {
    if (strength < 40) return { label: 'Weak', color: 'red' };
    if (strength < 70) return { label: 'Medium', color: 'yellow' };
    return { label: 'Strong', color: 'green' };
  };
  
  const { label, color } = getStrengthLabel();
  
  if (!password) return null;
  
  return (
    <div className={`mt-2 ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">Password strength</span>
        <span className={`text-xs font-medium ${
          color === 'red' ? 'text-red-600' :
          color === 'yellow' ? 'text-yellow-600' : 'text-green-600'
        }`}>
          {label}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${strength}%` }}
          transition={{ duration: 0.3 }}
          className={`h-2 rounded-full ${
            color === 'red' ? 'bg-red-500' :
            color === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'
          }`}
        />
      </div>
    </div>
  );
};

/**
 * RegisterForm Component
 * 
 * Comprehensive registration form with validation,
 * password strength checking, and social registration.
 */
export const RegisterForm: React.FC<RegisterFormProps> = ({
  className = '',
  onSuccess,
  onError,
  redirectTo = '/verify-email',
  showSocialLogin = true,
  showCompanyField = false,
  showPhoneField = false,
  title = 'Create Account',
  subtitle = 'Sign up for your new account'
}) => {
  const router = useRouter();
  
  const [state, setState] = useState<RegisterState>({
    isLoading: false,
    showPassword: false,
    showConfirmPassword: false,
    passwordStrength: 0
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setError,
    clearErrors
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      acceptTerms: false,
      acceptMarketing: false
    }
  });

  const watchedPassword = watch('password', '');

  /**
   * Handle form submission
   */
  const onSubmit = async (data: RegisterFormData) => {
    setState(prev => ({ ...prev, isLoading: true }));
    clearErrors();

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          phone: data.phone,
          company: data.company,
          acceptMarketing: data.acceptMarketing
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      toast.success('Account created successfully! Please check your email for verification.');
      
      onSuccess?.(result.user);

      // Redirect to email verification
      router.push(`${redirectTo}?email=${encodeURIComponent(data.email)}`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      
      // Handle specific error types
      if (errorMessage.includes('Email already exists')) {
        setError('email', { message: 'An account with this email already exists' });
      } else if (errorMessage.includes('Invalid email')) {
        setError('email', { message: 'Please enter a valid email address' });
      } else if (errorMessage.includes('Password too weak')) {
        setError('password', { message: 'Please choose a stronger password' });
      }

      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
    setState(prev => ({ 
      ...prev, 
      [field === 'password' ? 'showPassword' : 'showConfirmPassword']: 
        !prev[field === 'password' ? 'showPassword' : 'showConfirmPassword']
    }));
  };

  /**
   * Handle social registration success
   */
  const handleSocialSuccess = () => {
    onSuccess?.(null);
  };

  /**
   * Handle social registration error
   */
  const handleSocialError = (error: string) => {
    toast.error(`Social registration failed: ${error}`);
    onError?.(error);
  };

  return (
    <Container size="md" centered className={className}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card variant="elevated" size="lg" className="shadow-xl">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <UserPlus className="w-8 h-8 text-blue-600" />
            </motion.div>
            
            <CardTitle className="text-3xl font-bold mb-2">{title}</CardTitle>
            <CardDescription className="text-gray-600">{subtitle}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">

        {/* Social Registration */}
        {showSocialLogin && (
          <div className="mb-8">
            <div className="grid grid-cols-2 gap-4">
              <GoogleLogin
                variant="outline"
                size="md"
                fullWidth
                onSuccess={handleSocialSuccess}
                onError={handleSocialError}
                redirectTo={redirectTo}
              >
                Google
              </GoogleLogin>
              <FacebookLogin
                variant="outline"
                size="md"
                fullWidth
                onSuccess={handleSocialSuccess}
                onError={handleSocialError}
                redirectTo={redirectTo}
              >
                Facebook
              </FacebookLogin>
            </div>
            
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or register with email</span>
              </div>
            </div>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <Input
                {...register('firstName')}
                id="firstName"
                type="text"
                placeholder="First name"
                leftIcon={<User className="h-5 w-5" />}
                disabled={state.isLoading}
                status={errors.firstName ? 'error' : 'default'}
                className="w-full"
              />
              <AnimatePresence>
                {errors.firstName && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2 text-sm text-red-600 flex items-center"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.firstName.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <Input
                {...register('lastName')}
                id="lastName"
                type="text"
                placeholder="Last name"
                leftIcon={<User className="h-5 w-5" />}
                disabled={state.isLoading}
                status={errors.lastName ? 'error' : 'default'}
                className="w-full"
              />
              <AnimatePresence>
                {errors.lastName && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2 text-sm text-red-600 flex items-center"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.lastName.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <Input
              {...register('email')}
              id="email"
              type="email"
              placeholder="Enter your email"
              leftIcon={<Mail className="h-5 w-5" />}
              disabled={state.isLoading}
              status={errors.email ? 'error' : 'default'}
              className="w-full"
            />
            <AnimatePresence>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-2 text-sm text-red-600 flex items-center"
                >
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Phone Field (Optional) */}
          {showPhoneField && (
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-gray-500">(Optional)</span>
              </label>
              <Input
                {...register('phone')}
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                leftIcon={<Phone className="h-5 w-5" />}
                disabled={state.isLoading}
                status={errors.phone ? 'error' : 'default'}
                className="w-full"
              />
              <AnimatePresence>
                {errors.phone && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2 text-sm text-red-600 flex items-center"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.phone.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Company Field (Optional) */}
          {showCompanyField && (
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                Company <span className="text-gray-500">(Optional)</span>
              </label>
              <Input
                {...register('company')}
                id="company"
                type="text"
                placeholder="Company name"
                leftIcon={<Building className="h-5 w-5" />}
                disabled={state.isLoading}
                className="w-full"
              />
            </div>
          )}

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <Input
              {...register('password')}
              id="password"
              type={state.showPassword ? 'text' : 'password'}
              placeholder="Create password"
              leftIcon={<Lock className="h-5 w-5" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('password')}
                  disabled={state.isLoading}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {state.showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              }
              disabled={state.isLoading}
              status={errors.password ? 'error' : 'default'}
              className="w-full"
            />
            
            <PasswordStrengthIndicator password={watchedPassword} />
            
            <AnimatePresence>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-2 text-sm text-red-600 flex items-center"
                >
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.password.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <Input
              {...register('confirmPassword')}
              id="confirmPassword"
              type={state.showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm password"
              leftIcon={<Lock className="h-5 w-5" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                  disabled={state.isLoading}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {state.showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              }
              disabled={state.isLoading}
              status={errors.confirmPassword ? 'error' : 'default'}
              className="w-full"
            />
            <AnimatePresence>
              {errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-2 text-sm text-red-600 flex items-center"
                >
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.confirmPassword.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Terms and Conditions */}
          <div className="space-y-4">
            <div>
              <div className="flex items-start">
                <input
                  {...register('acceptTerms')}
                  id="acceptTerms"
                  type="checkbox"
                  disabled={state.isLoading}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                />
                <label htmlFor="acceptTerms" className="ml-2 text-sm text-gray-600">
                  I agree to the{' '}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-700 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-700 hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              <AnimatePresence>
                {errors.acceptTerms && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2 text-sm text-red-600 flex items-center"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.acceptTerms.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-start">
              <input
                {...register('acceptMarketing')}
                id="acceptMarketing"
                type="checkbox"
                disabled={state.isLoading}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
              />
              <label htmlFor="acceptMarketing" className="ml-2 text-sm text-gray-600">
                I would like to receive marketing communications and updates
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            fullWidth
            disabled={!isValid || state.isLoading}
            loading={state.isLoading}
            loadingText="Creating account..."
            leftIcon={!state.isLoading ? <UserPlus className="w-5 h-5" /> : undefined}
            animated
            variant={isValid && !state.isLoading ? 'default' : 'secondary'}
          >
            Create Account
          </Button>
        </form>

          </CardContent>

          {/* Login Link */}
          <CardFooter className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Sign in instead
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </Container>
  );
};

/**
 * Hook for registration functionality
 */
export const useRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    company?: string;
    acceptMarketing?: boolean;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return { success: true, user: data.user };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };

    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    isLoading,
    error,
    clearError: () => setError(null)
  };
};

// Export types
export type { RegisterFormProps, RegisterState, RegisterFormData };

export default RegisterForm;
