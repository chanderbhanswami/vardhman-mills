/**
 * Checkout Payment Page - Vardhman Mills Frontend
 * 
 * Payment method selection and processing with:
 * - Multiple payment gateways (Razorpay, UPI, Cards, Wallets, COD)
 * - Saved payment methods
 * - Security features
 * - Order summary
 * - Payment verification
 * 
 * @route /checkout/payment
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  WalletIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  LockClosedIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/auth/useAuth';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

type PaymentMethodType = 'card' | 'upi' | 'netbanking' | 'wallet' | 'cod';

interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  processingTime: string;
  fees?: string;
  recommended?: boolean;
  available: boolean;
}

interface SavedCard {
  id: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Address {
  firstName?: string;
  lastName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  phone?: string;
}

interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  shippingAddress: Address | null;
  billingAddress: Address | null;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'upi',
    type: 'upi',
    name: 'UPI',
    description: 'Pay using any UPI app',
    icon: DevicePhoneMobileIcon,
    processingTime: 'Instant',
    recommended: true,
    available: true,
  },
  {
    id: 'card',
    type: 'card',
    name: 'Credit/Debit Card',
    description: 'Visa, Mastercard, Amex, Rupay',
    icon: CreditCardIcon,
    processingTime: 'Instant',
    available: true,
  },
  {
    id: 'netbanking',
    type: 'netbanking',
    name: 'Net Banking',
    description: 'All major banks supported',
    icon: BanknotesIcon,
    processingTime: '5-10 minutes',
    available: true,
  },
  {
    id: 'wallet',
    type: 'wallet',
    name: 'Wallets',
    description: 'Paytm, PhonePe, Google Pay',
    icon: WalletIcon,
    processingTime: 'Instant',
    available: true,
  },
  {
    id: 'cod',
    type: 'cod',
    name: 'Cash on Delivery',
    description: 'Pay when you receive',
    icon: BanknotesIcon,
    processingTime: 'N/A',
    fees: '₹50',
    available: true,
  },
];

const BANKS = [
  { id: 'sbi', name: 'State Bank of India', icon: '🏦' },
  { id: 'hdfc', name: 'HDFC Bank', icon: '🏦' },
  { id: 'icici', name: 'ICICI Bank', icon: '🏦' },
  { id: 'axis', name: 'Axis Bank', icon: '🏦' },
  { id: 'pnb', name: 'Punjab National Bank', icon: '🏦' },
  { id: 'kotak', name: 'Kotak Mahindra Bank', icon: '🏦' },
];

const WALLETS = [
  { id: 'paytm', name: 'Paytm', icon: '💳' },
  { id: 'phonepe', name: 'PhonePe', icon: '💳' },
  { id: 'googlepay', name: 'Google Pay', icon: '💳' },
  { id: 'amazonpay', name: 'Amazon Pay', icon: '💳' },
];

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Payment page content wrapper
 */
function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  
  const orderId = searchParams?.get('orderId');
  const isRetry = searchParams?.get('retry') === 'true';
  const changeMethod = searchParams?.get('changeMethod') === 'true';

  // State
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | null>(null);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [selectedSavedCard, setSelectedSavedCard] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveCard, setSaveCard] = useState(false);

  // UPI state
  const [upiId, setUpiId] = useState('');

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Load order details
   */
  useEffect(() => {
    const loadOrderDetails = async () => {
      if (orderId) {
        try {
          // Load order from backend
          // const response = await orderApi.getOrder(orderId);
          // setOrder(response.data);
          
          // Mock data - map cart items to Order's CartItem type
          setOrder({
            id: orderId,
            items: (cart?.items || []).map(item => ({
              id: item.id,
              name: item.product?.name || 'Product',
              price: item.price?.amount || 0,
              quantity: item.quantity,
            })),
            subtotal: cart?.subtotal || 0,
            shipping: 100,
            tax: 200,
            discount: 0,
            total: (cart?.subtotal || 0) + 300,
            shippingAddress: null,
            billingAddress: null,
          });
        } catch (error) {
          console.error('Error loading order:', error);
          toast.error('Failed to load order details');
        }
      }
    };

    loadOrderDetails();
  }, [orderId, cart]);

  /**
   * Load saved cards
   */
  useEffect(() => {
    const loadSavedCards = async () => {
      if (user) {
        try {
          // Load saved cards from backend
          // const response = await paymentApi.getSavedCards();
          // setSavedCards(response.data);
          
          // Mock data
          setSavedCards([
            {
              id: 'card_1',
              last4: '4242',
              brand: 'Visa',
              expiryMonth: 12,
              expiryYear: 2025,
              isDefault: true,
            },
          ]);
        } catch (error) {
          console.error('Error loading saved cards:', error);
        }
      }
    };

    loadSavedCards();
  }, [user]);

  /**
   * Countdown timer
   */
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Handle payment method selection
   */
  const handleMethodSelect = (method: PaymentMethodType) => {
    setSelectedMethod(method);
    setSelectedBank(null);
    setSelectedWallet(null);
    setSelectedSavedCard(null);
  };

  /**
   * Handle pay now
   */
  const handlePayNow = async () => {
    if (!selectedMethod) {
      toast.error('Please select a payment method');
      return;
    }

    // Validate based on method
    if (selectedMethod === 'card') {
      if (!selectedSavedCard) {
        if (!cardNumber || !cardName || !expiryMonth || !expiryYear || !cvv) {
          toast.error('Please fill in all card details');
          return;
        }
      }
    } else if (selectedMethod === 'upi') {
      if (!upiId) {
        toast.error('Please enter your UPI ID');
        return;
      }
    } else if (selectedMethod === 'netbanking') {
      if (!selectedBank) {
        toast.error('Please select a bank');
        return;
      }
    } else if (selectedMethod === 'wallet') {
      if (!selectedWallet) {
        toast.error('Please select a wallet');
        return;
      }
    }

    setIsProcessing(true);

    try {
      // Process payment through payment gateway
      // const response = await paymentApi.processPayment({
      //   orderId,
      //   method: selectedMethod,
      //   details: { cardNumber, upiId, bank: selectedBank, wallet: selectedWallet },
      // });

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Clear cart
      await clearCart();

      // Redirect to success page
      toast.success('Payment successful!');
      router.push(`/checkout/success?orderId=${orderId || 'test123'}`);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
      router.push(`/checkout/failure?orderId=${orderId}&error=PAYMENT_FAILED`);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle back
   */
  const handleBack = () => {
    router.push('/checkout');
  };

  /**
   * Format time remaining
   */
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  /**
   * Render payment method details form
   */
  const renderPaymentDetails = () => {
    if (!selectedMethod) return null;

    switch (selectedMethod) {
      case 'card':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Saved Cards */}
            {savedCards.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Saved Cards</h4>
                <div className="space-y-2">
                  {savedCards.map((card) => (
                    <label
                      key={card.id}
                      className={cn(
                        'flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors',
                        selectedSavedCard === card.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="savedCard"
                          checked={selectedSavedCard === card.id}
                          onChange={() => setSelectedSavedCard(card.id)}
                          className="text-primary-600"
                        />
                        <div>
                          <div className="font-medium text-gray-900">
                            {card.brand} •••• {card.last4}
                          </div>
                          <div className="text-sm text-gray-600">
                            Expires {card.expiryMonth}/{card.expiryYear}
                          </div>
                        </div>
                      </div>
                      {card.isDefault && (
                        <Badge variant="default" size="sm">Default</Badge>
                      )}
                    </label>
                  ))}
                </div>
                <div className="mt-3 text-center">
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setSelectedSavedCard(null)}
                  >
                    Use a different card
                  </Button>
                </div>
              </div>
            )}

            {/* New Card Form */}
            {(!selectedSavedCard || savedCards.length === 0) && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    maxLength={19}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Month
                    </label>
                    <input
                      type="text"
                      placeholder="MM"
                      value={expiryMonth}
                      onChange={(e) => setExpiryMonth(e.target.value)}
                      maxLength={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year
                    </label>
                    <input
                      type="text"
                      placeholder="YY"
                      value={expiryYear}
                      onChange={(e) => setExpiryYear(e.target.value)}
                      maxLength={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="password"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      maxLength={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {user && (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={saveCard}
                      onChange={(e) => setSaveCard(e.target.checked)}
                      className="text-primary-600"
                    />
                    <span className="text-sm text-gray-700">
                      Save this card for future purchases
                    </span>
                  </label>
                )}
              </div>
            )}
          </motion.div>
        );

      case 'upi':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                UPI ID
              </label>
              <input
                type="text"
                placeholder="yourname@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="mt-2 text-sm text-gray-600">
                Enter your UPI ID or scan QR code from any UPI app
              </p>
            </div>
          </motion.div>
        );

      case 'netbanking':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h4 className="text-sm font-medium text-gray-900">Select Your Bank</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {BANKS.map((bank) => (
                <label
                  key={bank.id}
                  className={cn(
                    'flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors',
                    selectedBank === bank.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <input
                    type="radio"
                    name="bank"
                    checked={selectedBank === bank.id}
                    onChange={() => setSelectedBank(bank.id)}
                    className="text-primary-600"
                  />
                  <span className="text-2xl">{bank.icon}</span>
                  <span className="font-medium text-gray-900">{bank.name}</span>
                </label>
              ))}
            </div>
          </motion.div>
        );

      case 'wallet':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h4 className="text-sm font-medium text-gray-900">Select Wallet</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {WALLETS.map((wallet) => (
                <label
                  key={wallet.id}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors',
                    selectedWallet === wallet.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <input
                    type="radio"
                    name="wallet"
                    checked={selectedWallet === wallet.id}
                    onChange={() => setSelectedWallet(wallet.id)}
                    className="text-primary-600"
                  />
                  <span className="text-3xl">{wallet.icon}</span>
                  <span className="text-sm font-medium text-gray-900 text-center">
                    {wallet.name}
                  </span>
                </label>
              ))}
            </div>
          </motion.div>
        );

      case 'cod':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert>
              <InformationCircleIcon className="h-5 w-5" />
              <AlertDescription>
                <strong>Cash on Delivery</strong>
                <p className="mt-1 text-sm text-gray-600">
                  Pay ₹{order?.total ? (order.total + 50).toFixed(2) : '0.00'} (including ₹50 COD fee) 
                  when your order is delivered. Please keep the exact amount ready.
                </p>
              </AlertDescription>
            </Alert>
          </motion.div>
        );

      default:
        return null;
    }
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="link"
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Checkout
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payment</h1>
              <p className="text-gray-600 mt-1">
                Choose your preferred payment method
              </p>
            </div>
            {timeRemaining > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <ClockIcon className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Retry/Change Method Alert */}
        {(isRetry || changeMethod) && (
          <Alert className="mb-6">
            <InformationCircleIcon className="h-5 w-5" />
            <AlertDescription>
              {isRetry
                ? 'Your previous payment attempt failed. Please try again.'
                : 'Please select a different payment method to complete your order.'}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method Selection */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Select Payment Method
              </h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.id}
                    className={cn(
                      'flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all',
                      selectedMethod === method.type
                        ? 'border-primary-500 bg-primary-50 shadow-md'
                        : method.available
                        ? 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                    )}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={selectedMethod === method.type}
                        onChange={() => handleMethodSelect(method.type)}
                        disabled={!method.available}
                        className="text-primary-600"
                      />
                      <method.icon className="h-6 w-6 text-gray-700 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {method.name}
                          </span>
                          {method.recommended && (
                            <Badge variant="default" size="sm">Recommended</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {method.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {method.processingTime}
                        </p>
                        {method.fees && (
                          <p className="text-xs font-medium text-gray-700">
                            + {method.fees}
                          </p>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </Card>

            {/* Payment Details Form */}
            <AnimatePresence mode="wait">
              {selectedMethod && (
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Payment Details
                  </h2>
                  {renderPaymentDetails()}
                </Card>
              )}
            </AnimatePresence>

            {/* Security Features */}
            <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-2">
                <LockClosedIcon className="h-5 w-5 text-green-600" />
                <span>SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <span>PCI Compliant</span>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>₹{order?.subtotal.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span>₹{order?.shipping.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax</span>
                  <span>₹{order?.tax.toFixed(2) || '0.00'}</span>
                </div>
                {selectedMethod === 'cod' && (
                  <div className="flex justify-between text-gray-700">
                    <span>COD Fee</span>
                    <span>₹50.00</span>
                  </div>
                )}
                {order && order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{order.discount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between text-lg font-bold text-gray-900 mb-6">
                  <span>Total</span>
                  <span>
                    ₹{order
                      ? (order.total + (selectedMethod === 'cod' ? 50 : 0)).toFixed(2)
                      : '0.00'}
                  </span>
                </div>

                <Button
                  onClick={handlePayNow}
                  disabled={!selectedMethod || isProcessing}
                  size="lg"
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <LockClosedIcon className="h-5 w-5 mr-2" />
                      Pay Now
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CheckoutPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}
