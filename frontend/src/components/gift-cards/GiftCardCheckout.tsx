'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import {
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  GiftIcon,
  CheckCircleIcon,
  UserIcon,
  EnvelopeIcon,
  CalendarIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { Checkbox } from '../ui/Checkbox';
import { toast } from 'react-hot-toast';

// Types from gift card types file
type OrderData = {
  template: GiftCardTemplate | undefined;
  amount: number;
  quantity: number;
  recipient: Recipient;
  deliveryOption: DeliveryOption;
  paymentMethod: PaymentMethod | undefined;
  promoCode: string;
  promoDiscount: number;
  scheduledDate: Date | undefined;
  giftWrap: boolean;
  total: number;
};

// Animation variants
const containerVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  },
  exit: { opacity: 0 }
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3
    }
  },
  exit: { opacity: 0, y: -20 }
};

const slideVariants = {
  initial: { x: 300, opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1,
    transition: {
      duration: 0.4
    }
  },
  exit: { 
    x: -300, 
    opacity: 0,
    transition: {
      duration: 0.3
    }
  }
};

// Interfaces
interface GiftCardTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  minAmount: number;
  maxAmount: number;
  denominations: number[];
  customAmountAllowed: boolean;
  tags: string[];
  popularity: number;
  rating: number;
  reviewCount: number;
  features: string[];
  expiryMonths: number;
  brand: {
    name: string;
    logo: string;
    website: string;
  };
}

interface Recipient {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'netbanking' | 'wallet' | 'emi';
  name: string;
  icon: React.ReactNode;
  description: string;
  processingFee: number;
  instantDelivery: boolean;
}

interface DeliveryOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  price: number;
  estimatedTime: string;
  features: string[];
}

interface GiftCardCheckoutProps {
  templates?: GiftCardTemplate[];
  selectedTemplate?: GiftCardTemplate;
  initialAmount?: number;
  allowCustomAmount?: boolean;
  showQuantity?: boolean;
  maxQuantity?: number;
  showDeliveryOptions?: boolean;
  showRecipientForm?: boolean;
  showPaymentMethods?: boolean;
  showOrderSummary?: boolean;
  showPromoCode?: boolean;
  showGiftWrap?: boolean;
  showScheduleDelivery?: boolean;
  enableBulkPurchase?: boolean;
  onTemplateSelect?: (template: GiftCardTemplate) => void;
  onAmountChange?: (amount: number) => void;
  onQuantityChange?: (quantity: number) => void;
  onRecipientChange?: (recipient: Recipient) => void;
  onPaymentMethodSelect?: (method: PaymentMethod) => void;
  onDeliveryOptionSelect?: (option: DeliveryOption) => void;
  onPromoCodeApply?: (code: string) => void;
  onScheduleDelivery?: (date: Date) => void;
  onCheckout?: (orderData: OrderData) => void;
  onCancel?: () => void;
  className?: string;
  children?: React.ReactNode;
}

// Sample data
const sampleTemplates: GiftCardTemplate[] = [
  {
    id: 'amazon',
    name: 'Amazon Gift Card',
    description: 'Shop for millions of products on Amazon',
    category: 'E-commerce',
    image: '/images/gift-cards/amazon.png',
    minAmount: 100,
    maxAmount: 10000,
    denominations: [100, 250, 500, 1000, 2000, 5000],
    customAmountAllowed: true,
    tags: ['popular', 'trending', 'electronics'],
    popularity: 95,
    rating: 4.8,
    reviewCount: 12450,
    features: ['No expiry', 'Instant delivery', 'Wide acceptance'],
    expiryMonths: 0,
    brand: {
      name: 'Amazon',
      logo: '/images/brands/amazon-logo.png',
      website: 'https://amazon.in'
    }
  },
  {
    id: 'flipkart',
    name: 'Flipkart Gift Card',
    description: 'India\'s leading online shopping platform',
    category: 'E-commerce',
    image: '/images/gift-cards/flipkart.png',
    minAmount: 100,
    maxAmount: 10000,
    denominations: [100, 250, 500, 1000, 2000, 5000],
    customAmountAllowed: true,
    tags: ['popular', 'fashion', 'electronics'],
    popularity: 90,
    rating: 4.7,
    reviewCount: 8950,
    features: ['1 year validity', 'Instant delivery', 'No fees'],
    expiryMonths: 12,
    brand: {
      name: 'Flipkart',
      logo: '/images/brands/flipkart-logo.png',
      website: 'https://flipkart.com'
    }
  }
];

const paymentMethods: PaymentMethod[] = [
  {
    id: 'card',
    type: 'card',
    name: 'Credit/Debit Card',
    icon: <CreditCardIcon className="w-5 h-5" />,
    description: 'Visa, Mastercard, RuPay, Amex',
    processingFee: 0,
    instantDelivery: true
  },
  {
    id: 'upi',
    type: 'upi',
    name: 'UPI',
    icon: <DevicePhoneMobileIcon className="w-5 h-5" />,
    description: 'Pay using any UPI app',
    processingFee: 0,
    instantDelivery: true
  },
  {
    id: 'netbanking',
    type: 'netbanking',
    name: 'Net Banking',
    icon: <BanknotesIcon className="w-5 h-5" />,
    description: 'Direct bank transfer',
    processingFee: 0,
    instantDelivery: true
  },
  {
    id: 'wallet',
    type: 'wallet',
    name: 'Digital Wallet',
    icon: <DevicePhoneMobileIcon className="w-5 h-5" />,
    description: 'Paytm, PhonePe, Google Pay',
    processingFee: 0,
    instantDelivery: true
  }
];

const deliveryOptions: DeliveryOption[] = [
  {
    id: 'instant',
    name: 'Instant Delivery',
    description: 'Delivered immediately via email/SMS',
    icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
    price: 0,
    estimatedTime: 'Immediate',
    features: ['Email delivery', 'SMS delivery', 'Instant activation']
  },
  {
    id: 'scheduled',
    name: 'Scheduled Delivery',
    description: 'Choose a specific date and time',
    icon: <CalendarIcon className="w-5 h-5 text-blue-500" />,
    price: 0,
    estimatedTime: 'As scheduled',
    features: ['Email delivery', 'SMS delivery', 'Date selection']
  },
  {
    id: 'physical',
    name: 'Physical Card',
    description: 'Premium physical gift card by post',
    icon: <GiftIcon className="w-5 h-5 text-purple-500" />,
    price: 50,
    estimatedTime: '3-5 business days',
    features: ['Premium packaging', 'Greeting card', 'Tracking']
  }
];

// Helper functions
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

const calculateTotal = (amount: number, quantity: number, deliveryFee: number, processingFee: number, discount: number = 0): number => {
  const subtotal = amount * quantity;
  const fees = deliveryFee + processingFee;
  return subtotal + fees - discount;
};

// Main component
const GiftCardCheckout: React.FC<GiftCardCheckoutProps> = ({
  templates = sampleTemplates,
  selectedTemplate,
  initialAmount = 500,
  allowCustomAmount = true,
  showQuantity = true,
  maxQuantity = 10,
  showRecipientForm = true,
  showOrderSummary = true,
  showPromoCode = true,
  showGiftWrap = true,
  showScheduleDelivery = true,
  onTemplateSelect,
  onAmountChange,
  onQuantityChange,
  onRecipientChange,
  onPaymentMethodSelect,
  onDeliveryOptionSelect,
  onPromoCodeApply,
  onScheduleDelivery,
  onCheckout,
  onCancel,
  className,
  children
}) => {
  // State
  const [currentStep, setCurrentStep] = useState(0);
  const [template, setTemplate] = useState<GiftCardTemplate | undefined>(selectedTemplate || templates[0]);
  const [amount, setAmount] = useState(initialAmount);
  const [customAmount, setCustomAmount] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [recipient, setRecipient] = useState<Recipient>({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | undefined>();
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState<DeliveryOption>(deliveryOptions[0]);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  const [giftWrap, setGiftWrap] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Steps configuration
  const steps = [
    {
      id: 'template',
      title: 'Choose Gift Card',
      description: 'Select the perfect gift card',
      icon: <GiftIcon className="w-5 h-5" />
    },
    {
      id: 'amount',
      title: 'Select Amount',
      description: 'Choose gift card value',
      icon: <CurrencyDollarIcon className="w-5 h-5" />
    },
    {
      id: 'recipient',
      title: 'Recipient Details',
      description: 'Who is this gift for?',
      icon: <UserIcon className="w-5 h-5" />
    },
    {
      id: 'delivery',
      title: 'Delivery Options',
      description: 'How should we deliver?',
      icon: <EnvelopeIcon className="w-5 h-5" />
    },
    {
      id: 'payment',
      title: 'Payment',
      description: 'Complete your purchase',
      icon: <CreditCardIcon className="w-5 h-5" />
    }
  ];

  // Effects
  useEffect(() => {
    if (template && onTemplateSelect) {
      onTemplateSelect(template);
    }
  }, [template, onTemplateSelect]);

  useEffect(() => {
    if (onAmountChange) {
      onAmountChange(amount);
    }
  }, [amount, onAmountChange]);

  useEffect(() => {
    if (onQuantityChange) {
      onQuantityChange(quantity);
    }
  }, [quantity, onQuantityChange]);

  useEffect(() => {
    if (onRecipientChange) {
      onRecipientChange(recipient);
    }
  }, [recipient, onRecipientChange]);

  // Handlers
  const handleTemplateSelect = useCallback((selectedTemplate: GiftCardTemplate) => {
    setTemplate(selectedTemplate);
    // Reset amount if it's outside the new template's range
    if (amount < selectedTemplate.minAmount || amount > selectedTemplate.maxAmount) {
      setAmount(selectedTemplate.denominations[0] || selectedTemplate.minAmount);
    }
  }, [amount]);

  const handleAmountSelect = useCallback((selectedAmount: number) => {
    setAmount(selectedAmount);
    setCustomAmount('');
  }, []);

  const handleCustomAmountChange = useCallback((value: string) => {
    setCustomAmount(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && template) {
      if (numValue >= template.minAmount && numValue <= template.maxAmount) {
        setAmount(numValue);
        setErrors(prev => ({ ...prev, amount: '' }));
      } else {
        setErrors(prev => ({ 
          ...prev, 
          amount: `Amount must be between ${formatCurrency(template.minAmount)} and ${formatCurrency(template.maxAmount)}` 
        }));
      }
    }
  }, [template]);

  const handleQuantityChange = useCallback((change: number) => {
    const newQuantity = Math.max(1, Math.min(maxQuantity, quantity + change));
    setQuantity(newQuantity);
  }, [quantity, maxQuantity]);

  const handleRecipientUpdate = useCallback((field: keyof Recipient, value: string) => {
    setRecipient(prev => ({ ...prev, [field]: value }));
    // Clear related errors
    setErrors(prev => ({ ...prev, [field]: '' }));
  }, []);

  const handlePaymentMethodSelect = useCallback((method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    if (onPaymentMethodSelect) {
      onPaymentMethodSelect(method);
    }
  }, [onPaymentMethodSelect]);

  const handleDeliveryOptionSelect = useCallback((option: DeliveryOption) => {
    setSelectedDeliveryOption(option);
    if (onDeliveryOptionSelect) {
      onDeliveryOptionSelect(option);
    }
  }, [onDeliveryOptionSelect]);

  const handlePromoCodeApply = useCallback(() => {
    if (!promoCode.trim()) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      // Mock validation
      const validCodes = ['SAVE10', 'WELCOME20', 'GIFT15'];
      if (validCodes.includes(promoCode.toUpperCase())) {
        const discount = amount * quantity * 0.1; // 10% discount
        setPromoDiscount(discount);
        toast.success('Promo code applied successfully!');
        if (onPromoCodeApply) {
          onPromoCodeApply(promoCode);
        }
      } else {
        toast.error('Invalid promo code');
        setPromoDiscount(0);
      }
      setIsLoading(false);
    }, 1000);
  }, [promoCode, amount, quantity, onPromoCodeApply]);

  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Template selection
        if (!template) {
          newErrors.template = 'Please select a gift card';
        }
        break;

      case 1: // Amount selection
        if (!amount || amount < (template?.minAmount || 0) || amount > (template?.maxAmount || 0)) {
          newErrors.amount = 'Please select a valid amount';
        }
        break;

      case 2: // Recipient details
        if (showRecipientForm) {
          if (!recipient.name.trim()) {
            newErrors.name = 'Recipient name is required';
          }
          if (!recipient.email.trim()) {
            newErrors.email = 'Recipient email is required';
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient.email)) {
            newErrors.email = 'Please enter a valid email address';
          }
        }
        break;

      case 3: // Delivery options
        if (!selectedDeliveryOption) {
          newErrors.delivery = 'Please select a delivery option';
        }
        break;

      case 4: // Payment
        if (!selectedPaymentMethod) {
          newErrors.payment = 'Please select a payment method';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [template, amount, recipient, selectedDeliveryOption, selectedPaymentMethod, showRecipientForm]);

  const handleNextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(steps.length - 1, prev + 1));
    }
  }, [currentStep, validateStep, steps.length]);

  const handlePreviousStep = useCallback(() => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  }, []);

  const handleCheckout = useCallback(() => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    
    const orderData = {
      template,
      amount,
      quantity,
      recipient,
      deliveryOption: selectedDeliveryOption,
      paymentMethod: selectedPaymentMethod,
      promoCode,
      promoDiscount,
      scheduledDate,
      giftWrap,
      total: calculateTotal(
        amount, 
        quantity, 
        selectedDeliveryOption.price, 
        selectedPaymentMethod?.processingFee || 0, 
        promoDiscount
      )
    };

    // Simulate checkout process
    setTimeout(() => {
      setIsLoading(false);
      if (onCheckout) {
        onCheckout(orderData);
      } else {
        toast.success('Gift card purchased successfully!');
      }
    }, 2000);
  }, [
    currentStep, 
    validateStep, 
    template, 
    amount, 
    quantity, 
    recipient, 
    selectedDeliveryOption, 
    selectedPaymentMethod, 
    promoCode, 
    promoDiscount, 
    scheduledDate, 
    giftWrap, 
    onCheckout
  ]);

  // Calculate totals
  const subtotal = amount * quantity;
  const deliveryFee = selectedDeliveryOption.price;
  const processingFee = selectedPaymentMethod?.processingFee || 0;
  const total = calculateTotal(amount, quantity, deliveryFee, processingFee, promoDiscount);

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Template Selection
        return (
          <motion.div
            key="template-step"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Choose Your Gift Card
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Select from our popular gift card collection
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((templateItem) => (
                <motion.div
                  key={templateItem.id}
                  layoutId={`template-${templateItem.id}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={clsx(
                      'p-4 cursor-pointer transition-all duration-200',
                      template?.id === templateItem.id
                        ? 'ring-2 ring-blue-500 border-blue-500'
                        : 'hover:border-gray-300 dark:hover:border-gray-600'
                    )}
                    onClick={() => handleTemplateSelect(templateItem)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={templateItem.image}
                        alt={templateItem.name}
                        className="w-full h-full object-cover"
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                          (e.target as HTMLImageElement).src = '/images/gift-cards/default.png';
                        }}
                      />
                        {templateItem.tags.includes('popular') && (
                          <Badge
                            variant="destructive"
                            size="sm"
                            className="absolute -top-1 -right-1 text-xs"
                          >
                            Popular
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {templateItem.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {templateItem.description}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                              <span className="text-yellow-400">★</span>
                              <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                                {templateItem.rating} ({templateItem.reviewCount})
                              </span>
                            </div>
                          </div>
                          
                          <Badge variant="secondary" size="sm">
                            {templateItem.category}
                          </Badge>
                        </div>
                        
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          {formatCurrency(templateItem.minAmount)} - {formatCurrency(templateItem.maxAmount)}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
            
            {errors.template && (
              <p className="text-red-500 text-sm">{errors.template}</p>
            )}
          </motion.div>
        );

      case 1: // Amount Selection
        return (
          <motion.div
            key="amount-step"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Select Amount
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Choose the value for your {template?.name}
              </p>
            </div>

            {template && (
              <Card className="p-6">
                <div className="text-center mb-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={template.image}
                    alt={template.name}
                    className="w-20 h-20 object-cover rounded-lg mx-auto mb-4"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      (e.target as HTMLImageElement).src = '/images/gift-cards/default.png';
                    }}
                  />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {template.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {formatCurrency(template.minAmount)} - {formatCurrency(template.maxAmount)}
                  </p>
                </div>

                {/* Predefined Denominations */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {template.denominations.map((denomination) => (
                    <Button
                      key={denomination}
                      variant={amount === denomination ? "default" : "outline"}
                      className="h-12"
                      onClick={() => handleAmountSelect(denomination)}
                    >
                      {formatCurrency(denomination)}
                    </Button>
                  ))}
                </div>

                {/* Custom Amount */}
                {template.customAmountAllowed && allowCustomAmount && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">or</span>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Enter Custom Amount
                      </label>
                      <Input
                        type="number"
                        placeholder={`Min ${formatCurrency(template.minAmount)}`}
                        value={customAmount}
                        onChange={(e) => handleCustomAmountChange(e.target.value)}
                        min={template.minAmount}
                        max={template.maxAmount}
                        className="text-center text-lg font-semibold"
                      />
                    </div>
                  </div>
                )}

                {/* Quantity Selector */}
                {showQuantity && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Quantity
                    </label>
                    <div className="flex items-center justify-center space-x-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                      >
                        <MinusIcon className="w-4 h-4" />
                      </Button>
                      
                      <span className="text-lg font-semibold w-16 text-center">
                        {quantity}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= maxQuantity}
                      >
                        <PlusIcon className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="text-center mt-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Total: {formatCurrency(amount * quantity)}
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            )}
            
            {errors.amount && (
              <p className="text-red-500 text-sm text-center">{errors.amount}</p>
            )}
          </motion.div>
        );

      case 2: // Recipient Details
        return (
          <motion.div
            key="recipient-step"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Recipient Details
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Who is this gift card for?
              </p>
            </div>

            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Recipient Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter recipient name"
                    value={recipient.name}
                    onChange={(e) => handleRecipientUpdate('name', e.target.value)}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={recipient.email}
                    onChange={(e) => handleRecipientUpdate('email', e.target.value)}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number (Optional)
                  </label>
                  <Input
                    type="tel"
                    placeholder="Enter phone number"
                    value={recipient.phone}
                    onChange={(e) => handleRecipientUpdate('phone', e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Personal Message (Optional)
                  </label>
                  <TextArea
                    placeholder="Write a personal message..."
                    value={recipient.message}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleRecipientUpdate('message', e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {recipient.message.length}/500 characters
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        );

      case 3: // Delivery Options
        return (
          <motion.div
            key="delivery-step"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Delivery Options
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                How would you like to receive your gift card?
              </p>
            </div>

            <div className="space-y-4">
              {deliveryOptions.map((option) => (
                <Card
                  key={option.id}
                  className={clsx(
                    'p-4 cursor-pointer transition-all duration-200',
                    selectedDeliveryOption.id === option.id
                      ? 'ring-2 ring-blue-500 border-blue-500'
                      : 'hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                  onClick={() => handleDeliveryOptionSelect(option)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {option.icon}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {option.name}
                        </h3>
                        <div className="text-right">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {option.price === 0 ? 'Free' : formatCurrency(option.price)}
                          </span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {option.estimatedTime}
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {option.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {option.features.map((feature, index) => (
                          <Badge key={index} variant="secondary" size="sm">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Schedule Delivery */}
            {showScheduleDelivery && selectedDeliveryOption.id === 'scheduled' && (
              <Card className="p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Schedule Delivery
                </h4>
                <Input
                  type="datetime-local"
                  value={scheduledDate ? format(scheduledDate, "yyyy-MM-dd'T'HH:mm") : ''}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    setScheduledDate(date);
                    if (onScheduleDelivery) {
                      onScheduleDelivery(date);
                    }
                  }}
                  min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                />
              </Card>
            )}

            {/* Gift Wrap Option */}
            {showGiftWrap && selectedDeliveryOption.id === 'physical' && (
              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={giftWrap}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGiftWrap(e.target.checked)}
                  />
                  <div>
                    <label className="font-medium text-gray-900 dark:text-white">
                      Premium Gift Wrapping
                    </label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Beautiful gift box with ribbon (+₹25)
                    </p>
                  </div>
                </div>
              </Card>
            )}
            
            {errors.delivery && (
              <p className="text-red-500 text-sm">{errors.delivery}</p>
            )}
          </motion.div>
        );

      case 4: // Payment
        return (
          <motion.div
            key="payment-step"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Payment Method
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Choose your preferred payment option
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.map((method) => (
                <Card
                  key={method.id}
                  className={clsx(
                    'p-4 cursor-pointer transition-all duration-200',
                    selectedPaymentMethod?.id === method.id
                      ? 'ring-2 ring-blue-500 border-blue-500'
                      : 'hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                  onClick={() => handlePaymentMethodSelect(method)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {method.icon}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {method.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {method.description}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          {method.instantDelivery && (
                            <Badge variant="success" size="sm">
                              Instant
                            </Badge>
                          )}
                          {method.processingFee === 0 && (
                            <Badge variant="secondary" size="sm">
                              No Fees
                            </Badge>
                          )}
                        </div>
                        
                        {method.processingFee > 0 && (
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            +{formatCurrency(method.processingFee)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Promo Code */}
            {showPromoCode && (
              <Card className="p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Promo Code
                </h4>
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={handlePromoCodeApply}
                    disabled={!promoCode.trim() || isLoading}
                  >
                    {isLoading ? 'Applying...' : 'Apply'}
                  </Button>
                </div>
                
                {promoDiscount > 0 && (
                  <div className="mt-2 flex items-center text-green-600">
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      Promo code applied! You saved {formatCurrency(promoDiscount)}
                    </span>
                  </div>
                )}
              </Card>
            )}
            
            {errors.payment && (
              <p className="text-red-500 text-sm">{errors.payment}</p>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={clsx('max-w-4xl mx-auto', className)}>
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="space-y-8"
      >
        {/* Progress Steps */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={clsx(
                    'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200',
                    index <= currentStep
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
                  )}
                >
                  {index < currentStep ? (
                    <CheckCircleIcon className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                </div>
                
                <div className="ml-3 hidden md:block">
                  <h4
                    className={clsx(
                      'text-sm font-medium',
                      index <= currentStep
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-400'
                    )}
                  >
                    {step.title}
                  </h4>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                
                {index < steps.length - 1 && (
                  <div
                    className={clsx(
                      'h-0.5 w-16 mx-4 transition-all duration-200',
                      index < currentStep
                        ? 'bg-blue-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {renderStepContent()}
        </AnimatePresence>

        {/* Order Summary */}
        {showOrderSummary && template && (
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {template.name} × {quantity}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                
                {deliveryFee > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Delivery Fee
                    </span>
                    <span className="font-medium">
                      {formatCurrency(deliveryFee)}
                    </span>
                  </div>
                )}
                
                {processingFee > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Processing Fee
                    </span>
                    <span className="font-medium">
                      {formatCurrency(processingFee)}
                    </span>
                  </div>
                )}
                
                {promoDiscount > 0 && (
                  <div className="flex items-center justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">
                      -{formatCurrency(promoDiscount)}
                    </span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between space-x-4">
            <div className="flex space-x-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePreviousStep}
                  disabled={isLoading}
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}
              
              {onCancel && (
                <Button
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              )}
            </div>

            <div>
              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={handleNextStep}
                  disabled={isLoading}
                >
                  Next
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShieldCheckIcon className="w-4 h-4 mr-2" />
                      Complete Purchase - {formatCurrency(total)}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {children}
      </motion.div>
    </div>
  );
};

export default GiftCardCheckout;
