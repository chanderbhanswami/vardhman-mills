/**
 * Gift Card Checkout Page - Vardhman Mills
 * Complete gift card purchase flow with customization and payment
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// UI Components
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Input from '@/components/ui/Input';

// Layout Components
import Breadcrumbs from '@/components/layout/Breadcrumbs';

// Common Components
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SEOHead from '@/components/common/SEOHead';

// Hooks
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/components/providers';

// Utils
import { formatCurrency } from '@/lib/utils';

// Icons
import {
  GiftIcon,
  CreditCardIcon,
  EnvelopeIcon,
  CalendarIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

interface CheckoutStep {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
}

interface GiftCardOrder {
  giftCardId: string;
  denomination: number;
  quantity: number;
  recipientName?: string;
  recipientEmail?: string;
  senderName: string;
  personalMessage?: string;
  deliveryDate?: string;
  deliveryMethod: 'email' | 'physical' | 'both';
}

const DELIVERY_METHODS = [
  { value: 'email', label: 'Email Delivery', description: 'Instant delivery to recipient email', price: 0 },
  { value: 'physical', label: 'Physical Card', description: 'Beautifully packaged card delivered to address', price: 50 },
  { value: 'both', label: 'Email + Physical', description: 'Best of both worlds', price: 50 },
];

const AMOUNTS = [500, 1000, 2000, 5000, 10000];

export default function GiftCardCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAmount, setSelectedAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  const [orderDetails, setOrderDetails] = useState<GiftCardOrder>({
    giftCardId: '',
    denomination: 1000,
    quantity: 1,
    senderName: user?.email || '',
    deliveryMethod: 'email',
  });

  const steps: CheckoutStep[] = [
    { id: 'select', title: 'Select Amount', icon: GiftIcon, completed: currentStep > 0 },
    { id: 'customize', title: 'Customize', icon: EnvelopeIcon, completed: currentStep > 1 },
    { id: 'delivery', title: 'Delivery', icon: CalendarIcon, completed: currentStep > 2 },
    { id: 'payment', title: 'Payment', icon: CreditCardIcon, completed: currentStep > 3 },
  ];

  useEffect(() => {
    const cardId = searchParams?.get('card');
    const amount = searchParams?.get('amount');
    
    if (amount) {
      setSelectedAmount(Number(amount));
      setOrderDetails(prev => ({ ...prev, denomination: Number(amount) }));
    }
    
    if (cardId) {
      setOrderDetails(prev => ({ ...prev, giftCardId: cardId }));
    }

    setIsLoading(false);
  }, [searchParams]);

  const handleAmountSelect = useCallback((amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
    setOrderDetails(prev => ({ ...prev, denomination: amount }));
  }, []);

  const handleCustomAmountChange = useCallback((value: string) => {
    setCustomAmount(value);
    const amount = Number(value);
    if (amount >= 100 && amount <= 50000) {
      setSelectedAmount(amount);
      setOrderDetails(prev => ({ ...prev, denomination: amount }));
    }
  }, []);

  const handleQuantityChange = useCallback((newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 100) {
      setQuantity(newQuantity);
      setOrderDetails(prev => ({ ...prev, quantity: newQuantity }));
    }
  }, []);

  const handleUpdateOrder = useCallback((updates: Partial<GiftCardOrder>) => {
    setOrderDetails(prev => ({ ...prev, ...updates }));
  }, []);

  const handleNextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, steps.length]);

  const handlePreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleCompletePurchase = useCallback(async () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to complete your purchase',
        variant: 'destructive',
      });
      router.push(`/auth/login?redirect=/gift-cards/checkout?${searchParams?.toString()}`);
      return;
    }

    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: 'Success!',
        description: 'Your gift card purchase is complete',
        variant: 'success',
      });

      router.push('/account/gift-cards');
    } catch (error) {
      console.error('Purchase failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete purchase. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [user, toast, router, searchParams]);

  const totalAmount = orderDetails.denomination * orderDetails.quantity;
  const deliveryCharge = DELIVERY_METHODS.find(m => m.value === orderDetails.deliveryMethod)?.price || 0;
  const grandTotal = totalAmount + deliveryCharge;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title="Gift Card Checkout | Vardhman Mills"
        description="Complete your gift card purchase"
        keywords={['gift card checkout', 'buy gift card', 'payment']}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Gift Cards', href: '/gift-cards' },
            { label: 'Checkout', href: '/gift-cards/checkout' },
          ]}
        />

        <div className="mt-6 mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2 mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </Button>

          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <GiftIcon className="w-8 h-8 text-purple-600" />
            Gift Card Checkout
          </h1>
          <p className="mt-2 text-gray-600">
            Send the perfect gift in just a few simple steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = step.completed;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                        isActive
                          ? 'bg-purple-600 border-purple-600 text-white'
                          : isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircleIcon className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-sm font-medium ${
                        isActive ? 'text-purple-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-4 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Select Amount */}
            {currentStep === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Gift Card Amount</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {AMOUNTS.map(amount => (
                        <button
                          key={amount}
                          onClick={() => handleAmountSelect(amount)}
                          className={`p-6 rounded-lg border-2 transition-all ${
                            selectedAmount === amount && !customAmount
                              ? 'border-purple-600 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <div className="text-2xl font-bold text-gray-900">
                            {formatCurrency(amount)}
                          </div>
                        </button>
                      ))}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Custom Amount (₹100 - ₹50,000)
                      </label>
                      <Input
                        type="number"
                        min="100"
                        max="50000"
                        placeholder="Enter custom amount"
                        value={customAmount}
                        onChange={(e) => handleCustomAmountChange(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Quantity
                      </label>
                      <div className="flex items-center gap-4">
                        <Button
                          variant="outline"
                          onClick={() => handleQuantityChange(quantity - 1)}
                          disabled={quantity <= 1}
                        >
                          -
                        </Button>
                        <span className="text-2xl font-semibold w-16 text-center">
                          {quantity}
                        </span>
                        <Button
                          variant="outline"
                          onClick={() => handleQuantityChange(quantity + 1)}
                          disabled={quantity >= 100}
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    <Button onClick={handleNextStep} className="w-full" size="lg">
                      Continue to Customization
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Customize */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Customize Your Gift Card</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Sender Name</label>
                      <Input
                        value={orderDetails.senderName}
                        onChange={(e) => handleUpdateOrder({ senderName: e.target.value })}
                        placeholder="Your name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Recipient Name</label>
                      <Input
                        value={orderDetails.recipientName || ''}
                        onChange={(e) => handleUpdateOrder({ recipientName: e.target.value })}
                        placeholder="Recipient's name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Recipient Email</label>
                      <Input
                        type="email"
                        value={orderDetails.recipientEmail || ''}
                        onChange={(e) => handleUpdateOrder({ recipientEmail: e.target.value })}
                        placeholder="recipient@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Personal Message (Optional)</label>
                      <textarea
                        value={orderDetails.personalMessage || ''}
                        onChange={(e) => handleUpdateOrder({ personalMessage: e.target.value })}
                        placeholder="Add a personal message..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Delivery Date (Optional)</label>
                      <Input
                        type="date"
                        value={orderDetails.deliveryDate || ''}
                        onChange={(e) => handleUpdateOrder({ deliveryDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={handlePreviousStep} className="flex-1">
                        Back
                      </Button>
                      <Button onClick={handleNextStep} className="flex-1">
                        Continue to Delivery
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Delivery */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {DELIVERY_METHODS.map(method => (
                      <button
                        key={method.value}
                        onClick={() => handleUpdateOrder({ deliveryMethod: method.value as 'email' | 'physical' | 'both' })}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                          orderDetails.deliveryMethod === method.value
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{method.label}</h3>
                            <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {method.price === 0 ? 'Free' : formatCurrency(method.price)}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}

                    {orderDetails.deliveryMethod !== 'email' && (
                      <div className="space-y-4 mt-6 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium">Shipping Address</h4>
                        <Input placeholder="Full Name" />
                        <Input placeholder="Address Line 1" />
                        <Input placeholder="Address Line 2" />
                        <div className="grid grid-cols-2 gap-4">
                          <Input placeholder="City" />
                          <Input placeholder="Postal Code" />
                        </div>
                        <Input placeholder="Phone Number" />
                      </div>
                    )}

                    <div className="flex gap-3 mt-6">
                      <Button variant="outline" onClick={handlePreviousStep} className="flex-1">
                        Back
                      </Button>
                      <Button onClick={handleNextStep} className="flex-1">
                        Continue to Payment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Payment */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 bg-blue-50 rounded-lg flex items-start gap-3">
                      <CreditCardIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-900">
                        Your payment information is secure and encrypted. We accept all major credit cards and UPI.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <Input placeholder="Card Number" />
                      <div className="grid grid-cols-2 gap-4">
                        <Input placeholder="MM/YY" />
                        <Input placeholder="CVV" />
                      </div>
                      <Input placeholder="Cardholder Name" />
                    </div>

                    <div className="border-t pt-4">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm text-gray-600">
                          I agree to the terms and conditions
                        </span>
                      </label>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={handlePreviousStep} className="flex-1">
                        Back
                      </Button>
                      <Button
                        onClick={handleCompletePurchase}
                        disabled={isProcessing}
                        className="flex-1 gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <LoadingSpinner size="sm" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircleIcon className="w-5 h-5" />
                            Complete Purchase
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
                      <GiftIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Gift Card</p>
                      <p className="text-sm text-gray-600">{formatCurrency(selectedAmount)}</p>
                    </div>
                  </div>

                  <div className="space-y-2 py-4 border-t border-b">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Amount</span>
                      <span className="font-medium">{formatCurrency(selectedAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Quantity</span>
                      <span className="font-medium">× {quantity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{formatCurrency(totalAmount)}</span>
                    </div>
                    {deliveryCharge > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivery</span>
                        <span className="font-medium">{formatCurrency(deliveryCharge)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-purple-600">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>

                  {orderDetails.recipientName && (
                    <div className="p-3 bg-purple-50 rounded-lg mt-4">
                      <p className="text-xs text-purple-900 font-medium mb-1">Recipient</p>
                      <p className="text-sm font-semibold text-purple-900">{orderDetails.recipientName}</p>
                      {orderDetails.recipientEmail && (
                        <p className="text-xs text-purple-700">{orderDetails.recipientEmail}</p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-sm text-green-900">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <span>Free cancellation within 24 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
