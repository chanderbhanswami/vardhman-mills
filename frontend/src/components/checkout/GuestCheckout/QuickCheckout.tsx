'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserIcon,
  MapPinIcon,
  CreditCardIcon,
  TruckIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { toast } from 'react-hot-toast';
import type { CartItem } from '@/types/cart.types';

interface QuickCheckoutProps {
  cartItems: CartItem[];
  onOrderComplete?: (orderId: string) => void;
  onSwitchToFullCheckout?: () => void;
}

interface QuickCheckoutFormData {
  // Contact
  fullName: string;
  email: string;
  phone: string;
  
  // Address
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  
  // Payment
  paymentMethod: 'card' | 'upi' | 'cod';
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  upiId?: string;
  
  // Options
  agreedToTerms: boolean;
}

const SHIPPING_METHODS = [
  { id: 'standard', name: 'Standard', days: '5-7 days', price: 0 },
  { id: 'express', name: 'Express', days: '2-3 days', price: 150 },
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Puducherry'
];

export const QuickCheckout: React.FC<QuickCheckoutProps> = ({
  cartItems,
  onOrderComplete,
  onSwitchToFullCheckout
}) => {
  const [formData, setFormData] = useState<QuickCheckoutFormData>({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    postalCode: '',
    paymentMethod: 'upi',
    agreedToTerms: false
  });

  const [selectedShipping, setSelectedShipping] = useState('standard');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Load from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem('quickCheckout_data');
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    }
  }, []);

  // Save to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('quickCheckout_data', JSON.stringify(formData));
  }, [formData]);

  // Handle input change
  const handleChange = (field: keyof QuickCheckoutFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validation
  const validateField = (field: keyof QuickCheckoutFormData): string => {
    const value = formData[field];

    switch (field) {
      case 'fullName':
        if (!value || (value as string).trim().length < 2) return 'Name must be at least 2 characters';
        if (!/^[a-zA-Z\s]+$/.test(value as string)) return 'Name can only contain letters';
        break;
      
      case 'email':
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value as string)) return 'Invalid email format';
        break;
      
      case 'phone':
        if (!value) return 'Phone is required';
        if (!/^[6-9]\d{9}$/.test(value as string)) return 'Invalid Indian phone number';
        break;
      
      case 'addressLine1':
        if (!value || (value as string).trim().length < 5) return 'Address must be at least 5 characters';
        break;
      
      case 'city':
        if (!value || (value as string).trim().length < 2) return 'City is required';
        break;
      
      case 'state':
        if (!value) return 'State is required';
        break;
      
      case 'postalCode':
        if (!value) return 'Postal code is required';
        if (!/^[1-9][0-9]{5}$/.test(value as string)) return 'Invalid postal code';
        break;
      
      case 'cardNumber':
        if (formData.paymentMethod === 'card' && !value) return 'Card number is required';
        if (formData.paymentMethod === 'card' && !/^\d{16}$/.test((value as string).replace(/\s/g, ''))) {
          return 'Card number must be 16 digits';
        }
        break;
      
      case 'expiryDate':
        if (formData.paymentMethod === 'card' && !value) return 'Expiry date is required';
        break;
      
      case 'cvv':
        if (formData.paymentMethod === 'card' && !value) return 'CVV is required';
        if (formData.paymentMethod === 'card' && !/^\d{3,4}$/.test(value as string)) {
          return 'CVV must be 3-4 digits';
        }
        break;
      
      case 'upiId':
        if (formData.paymentMethod === 'upi' && !value) return 'UPI ID is required';
        if (formData.paymentMethod === 'upi' && !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(value as string)) {
          return 'Invalid UPI ID format';
        }
        break;
      
      case 'agreedToTerms':
        if (!value) return 'You must agree to terms and conditions';
        break;
    }

    return '';
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const fieldsToValidate: (keyof QuickCheckoutFormData)[] = [
      'fullName', 'email', 'phone', 'addressLine1', 'city', 'state', 'postalCode'
    ];

    if (formData.paymentMethod === 'card') {
      fieldsToValidate.push('cardNumber', 'expiryDate', 'cvv');
    } else if (formData.paymentMethod === 'upi') {
      fieldsToValidate.push('upiId');
    }

    fieldsToValidate.push('agreedToTerms');

    fieldsToValidate.forEach(field => {
      const error = validateField(field);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    setTouched(Object.fromEntries(fieldsToValidate.map(f => [f, true])));

    return Object.keys(newErrors).length === 0;
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.totalPrice?.amount || 0), 0);
  const shippingCost = SHIPPING_METHODS.find(m => m.id === selectedShipping)?.price || 0;
  const tax = subtotal * 0.18;
  const total = subtotal + shippingCost + tax;

  // Handle order placement
  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      toast.error('Please fix all errors before proceeding');
      return;
    }

    setIsProcessing(true);

    try {
      const [firstName, ...lastNameParts] = formData.fullName.trim().split(' ');
      const lastName = lastNameParts.join(' ') || firstName;

      const orderData = {
        customer: {
          firstName,
          lastName,
          email: formData.email,
          phone: formData.phone
        },
        address: {
          addressLine1: formData.addressLine1,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: 'India'
        },
        shippingMethod: selectedShipping,
        paymentMethod: formData.paymentMethod,
        items: cartItems,
        quickCheckout: true
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) throw new Error('Failed to place order');

      const result = await response.json();
      const orderId = result.orderId || result.id;

      // Clear saved data
      sessionStorage.removeItem('quickCheckout_data');

      toast.success('Order placed successfully!');

      if (onOrderComplete && orderId) {
        onOrderComplete(orderId);
      }
    } catch (error) {
      console.error('Order placement error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <SparklesIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Quick Checkout
            </h1>
          </div>
          <p className="text-gray-600 flex items-center justify-center gap-2">
            <ClockIcon className="h-5 w-5" />
            Complete your purchase in under 2 minutes
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Info */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <UserIcon className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    type="text"
                    label="Full Name *"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    error={touched.fullName ? errors.fullName : undefined}
                  />
                </div>
                
                <Input
                  type="email"
                  label="Email *"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  error={touched.email ? errors.email : undefined}
                />
                
                <Input
                  type="tel"
                  label="Phone *"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  error={touched.phone ? errors.phone : undefined}
                  maxLength={10}
                />
              </div>
            </Card>

            {/* Delivery Address */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <MapPinIcon className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Delivery Address</h2>
              </div>
              
              <div className="space-y-4">
                <Input
                  type="text"
                  label="Address Line *"
                  placeholder="House No, Street, Area"
                  value={formData.addressLine1}
                  onChange={(e) => handleChange('addressLine1', e.target.value)}
                  error={touched.addressLine1 ? errors.addressLine1 : undefined}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="text"
                    label="City *"
                    placeholder="Mumbai"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    error={touched.city ? errors.city : undefined}
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <select
                      value={formData.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                      aria-label="Select State"
                      className={`
                        w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${touched.state && errors.state ? 'border-red-500' : 'border-gray-300'}
                      `}
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                    {touched.state && errors.state && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <ExclamationCircleIcon className="h-4 w-4" />
                        {errors.state}
                      </p>
                    )}
                  </div>
                </div>
                
                <Input
                  type="text"
                  label="Postal Code *"
                  placeholder="400001"
                  value={formData.postalCode}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  error={touched.postalCode ? errors.postalCode : undefined}
                  maxLength={6}
                />
              </div>
            </Card>

            {/* Shipping Method */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <TruckIcon className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Shipping Method</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SHIPPING_METHODS.map(method => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedShipping(method.id)}
                    className={`
                      p-4 border-2 rounded-lg text-left transition-all
                      ${selectedShipping === method.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">{method.name}</span>
                      {selectedShipping === method.id && (
                        <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{method.days}</p>
                    <p className="text-lg font-bold text-gray-900 mt-2">
                      {method.price === 0 ? 'FREE' : `₹${method.price}`}
                    </p>
                  </button>
                ))}
              </div>
            </Card>

            {/* Payment Method */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <CreditCardIcon className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>
              </div>
              
              {/* Payment Tabs */}
              <div className="flex gap-2 mb-6">
                {[
                  { id: 'upi', label: 'UPI' },
                  { id: 'card', label: 'Card' },
                  { id: 'cod', label: 'Cash on Delivery' }
                ].map(method => (
                  <button
                    key={method.id}
                    onClick={() => handleChange('paymentMethod', method.id)}
                    className={`
                      px-6 py-2 rounded-lg font-medium transition-colors
                      ${formData.paymentMethod === method.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    {method.label}
                  </button>
                ))}
              </div>

              {/* Payment Fields */}
              {formData.paymentMethod === 'upi' && (
                <Input
                  type="text"
                  label="UPI ID *"
                  placeholder="yourname@upi"
                  value={formData.upiId || ''}
                  onChange={(e) => handleChange('upiId', e.target.value)}
                  error={touched.upiId ? errors.upiId : undefined}
                />
              )}

              {formData.paymentMethod === 'card' && (
                <div className="space-y-4">
                  <Input
                    type="text"
                    label="Card Number *"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
                      handleChange('cardNumber', value);
                    }}
                    error={touched.cardNumber ? errors.cardNumber : undefined}
                    maxLength={19}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="text"
                      label="Expiry Date *"
                      placeholder="MM/YY"
                      value={formData.expiryDate || ''}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length >= 2) {
                          value = value.slice(0, 2) + '/' + value.slice(2, 4);
                        }
                        handleChange('expiryDate', value);
                      }}
                      error={touched.expiryDate ? errors.expiryDate : undefined}
                      maxLength={5}
                    />
                    
                    <Input
                      type="text"
                      label="CVV *"
                      placeholder="123"
                      value={formData.cvv || ''}
                      onChange={(e) => handleChange('cvv', e.target.value.replace(/\D/g, ''))}
                      error={touched.cvv ? errors.cvv : undefined}
                      maxLength={4}
                    />
                  </div>
                </div>
              )}

              {formData.paymentMethod === 'cod' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    ₹50 COD charges will be applied. Pay at the time of delivery.
                  </p>
                </div>
              )}
            </Card>

            {/* Terms */}
            <Card className="p-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreedToTerms}
                  onChange={(e) => handleChange('agreedToTerms', e.target.checked)}
                  className="mt-1 h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  I agree to the <a href="/terms" className="text-blue-600 hover:underline">Terms & Conditions</a> and{' '}
                  <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a> *
                </span>
              </label>
              {touched.agreedToTerms && errors.agreedToTerms && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1 ml-8">
                  <ExclamationCircleIcon className="h-4 w-4" />
                  {errors.agreedToTerms}
                </p>
              )}
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="gradient"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? 'Processing...' : `Place Order • ₹${total.toLocaleString('en-IN')}`}
              </Button>
              
              {onSwitchToFullCheckout && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={onSwitchToFullCheckout}
                  className="sm:w-auto"
                >
                  Need More Options?
                </Button>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map(item => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    {item.product && (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                          <span className="text-2xl">📦</span>
                        </div>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product?.name || 'Product'}
                      </p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {item.totalPrice?.formatted || '₹0'}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-gray-900">
                    {shippingCost === 0 ? 'FREE' : `₹${shippingCost.toLocaleString('en-IN')}`}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (18%)</span>
                  <span className="font-medium text-gray-900">₹{tax.toLocaleString('en-IN')}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-blue-600">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                  <span>Secure & encrypted payment</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickCheckout;
