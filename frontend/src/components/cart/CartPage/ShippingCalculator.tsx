'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import type { ShippingMethod } from '@/types/cart.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ShippingCalculatorProps {
  /**
   * Current cart subtotal
   */
  subtotal: number;

  /**
   * Selected shipping method
   */
  selectedMethod?: ShippingMethod;

  /**
   * Callback when shipping method is selected
   */
  onSelectMethod?: (method: ShippingMethod) => void;

  /**
   * Free shipping threshold
   */
  freeShippingThreshold?: number;

  /**
   * Start expanded or collapsed
   */
  defaultExpanded?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

interface CalculationResult {
  postalCode: string;
  city?: string;
  state?: string;
  methods: ShippingMethod[];
}

// ============================================================================
// MOCK DATA (Replace with API)
// ============================================================================

const MOCK_SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'standard',
    name: 'Standard Shipping',
    description: 'Delivery in 5-7 business days',
    carrier: 'India Post',
    serviceType: 'standard',
    estimatedDays: { min: 5, max: 7 },
    price: { amount: 50, currency: 'INR', formatted: '₹50' },
    isFree: false,
    isExpress: false,
    trackingAvailable: true,
  },
  {
    id: 'express',
    name: 'Express Shipping',
    description: 'Delivery in 2-3 business days',
    carrier: 'DHL Express',
    serviceType: 'express',
    estimatedDays: { min: 2, max: 3 },
    price: { amount: 150, currency: 'INR', formatted: '₹150' },
    isFree: false,
    isExpress: true,
    trackingAvailable: true,
  },
  {
    id: 'overnight',
    name: 'Overnight Delivery',
    description: 'Next business day delivery',
    carrier: 'FedEx',
    serviceType: 'overnight',
    estimatedDays: { min: 1, max: 1 },
    price: { amount: 300, currency: 'INR', formatted: '₹300' },
    isFree: false,
    isExpress: true,
    trackingAvailable: true,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const validatePostalCode = (code: string): boolean => {
  // Indian PIN code validation (6 digits)
  const pinRegex = /^[1-9][0-9]{5}$/;
  return pinRegex.test(code);
};

const getMockLocationData = (postalCode: string) => {
  // Mock location data based on postal code
  const firstDigit = postalCode.charAt(0);
  const locations: Record<string, { city: string; state: string }> = {
    '1': { city: 'New Delhi', state: 'Delhi' },
    '2': { city: 'Gurgaon', state: 'Haryana' },
    '3': { city: 'Jaipur', state: 'Rajasthan' },
    '4': { city: 'Hyderabad', state: 'Telangana' },
    '5': { city: 'Bangalore', state: 'Karnataka' },
    '6': { city: 'Mumbai', state: 'Maharashtra' },
    '7': { city: 'Kolkata', state: 'West Bengal' },
    '8': { city: 'Ahmedabad', state: 'Gujarat' },
    '9': { city: 'Lucknow', state: 'Uttar Pradesh' },
  };
  return locations[firstDigit] || { city: 'Unknown', state: 'Unknown' };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ShippingCalculator: React.FC<ShippingCalculatorProps> = ({
  subtotal,
  selectedMethod,
  onSelectMethod,
  freeShippingThreshold = 500,
  defaultExpanded = false,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [postalCode, setPostalCode] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle calculate shipping
  const handleCalculate = useCallback(async () => {
    if (!postalCode) {
      setError('Please enter a postal code');
      return;
    }

    if (!validatePostalCode(postalCode)) {
      setError('Please enter a valid 6-digit PIN code');
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const locationData = getMockLocationData(postalCode);

      // Apply free shipping if eligible
      const methods = MOCK_SHIPPING_METHODS.map(method => {
        if (subtotal >= freeShippingThreshold && method.id === 'standard') {
          return {
            ...method,
            price: { amount: 0, currency: 'INR' as const, formatted: 'FREE' },
            isFree: true,
          };
        }
        return method;
      });

      setResult({
        postalCode,
        city: locationData.city,
        state: locationData.state,
        methods,
      });
    } catch {
      setError('Failed to calculate shipping. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  }, [postalCode, subtotal, freeShippingThreshold]);

  // Handle method selection
  const handleSelectMethod = (method: ShippingMethod) => {
    if (onSelectMethod) {
      onSelectMethod(method);
    }
  };

  // Check if free shipping is available
  const isFreeShippingAvailable = subtotal >= freeShippingThreshold;

  return (
    <div className={cn('border border-gray-200 rounded-lg overflow-hidden', className)}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <TruckIcon className="h-5 w-5 text-gray-600" />
          <div className="text-left">
            <h3 className="text-sm font-semibold text-gray-900">
              Shipping Calculator
            </h3>
            <p className="text-xs text-gray-600">
              Estimate delivery time and cost
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUpIcon className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Free Shipping Banner */}
              {isFreeShippingAvailable && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm font-medium text-green-900">
                    Congratulations! You qualify for FREE standard shipping
                  </p>
                </div>
              )}

              {/* Postal Code Input */}
              <div className="space-y-2">
                <label htmlFor="postal-code" className="block text-sm font-medium text-gray-900">
                  Enter PIN Code
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="postal-code"
                      type="text"
                      value={postalCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setPostalCode(value);
                        setError(null);
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleCalculate();
                        }
                      }}
                      placeholder="Enter 6-digit PIN"
                      disabled={isCalculating}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    onClick={handleCalculate}
                    disabled={!postalCode || isCalculating}
                    variant="outline"
                    size="md"
                  >
                    {isCalculating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
                      </>
                    ) : (
                      'Check'
                    )}
                  </Button>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <ExclamationCircleIcon className="h-4 w-4 text-red-600 flex-shrink-0" />
                    <p className="text-xs text-red-900">{error}</p>
                  </div>
                )}
              </div>

              {/* Results */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  {/* Location Info */}
                  <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <MapPinIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-blue-900">
                        Delivering to: {result.city}, {result.state}
                      </p>
                      <p className="text-xs text-blue-700">
                        PIN: {result.postalCode}
                      </p>
                    </div>
                  </div>

                  {/* Shipping Methods */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">
                      Available Shipping Options
                    </h4>
                    {result.methods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => handleSelectMethod(method)}
                        className={cn(
                          'w-full p-3 border-2 rounded-lg text-left transition-all',
                          selectedMethod?.id === method.id
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="text-sm font-semibold text-gray-900">
                                {method.name}
                              </h5>
                              {method.isFree && (
                                <Badge variant="success" size="sm">
                                  FREE
                                </Badge>
                              )}
                              {method.isExpress && (
                                <Badge variant="gradient" size="sm">
                                  Fast
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mb-2">
                              {method.description}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <ClockIcon className="h-3 w-3" />
                                {method.estimatedDays.min === method.estimatedDays.max
                                  ? `${method.estimatedDays.min} day${method.estimatedDays.min > 1 ? 's' : ''}`
                                  : `${method.estimatedDays.min}-${method.estimatedDays.max} days`}
                              </span>
                              <span>•</span>
                              <span>{method.carrier}</span>
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <p className={cn(
                              'text-sm font-bold',
                              method.isFree ? 'text-green-600' : 'text-gray-900'
                            )}>
                              {method.price.formatted}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Help Text */}
              <p className="text-xs text-gray-500 text-center">
                Delivery times are estimates and may vary based on location
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShippingCalculator;
