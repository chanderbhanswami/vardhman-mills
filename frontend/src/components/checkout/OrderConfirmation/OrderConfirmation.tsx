'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  TruckIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CreditCardIcon,
  CalendarIcon,
  PrinterIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  ArrowRightIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ClockIcon,
  TagIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  BanknotesIcon,
  InformationCircleIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  GiftIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { OrderSummary } from '../OrderSummary/OrderSummary';
import type { Order, OrderItem } from '@/types/cart.types';
import type { OrderTracking, OrderTimeline } from '@/types/order.types';

interface OrderConfirmationProps {
  order: Order;
  tracking?: OrderTracking;
  timeline?: OrderTimeline;
  onDownloadInvoice?: () => void;
  onPrint?: () => void;
  onShare?: () => void;
  onContinueShopping?: () => void;
  onTrackOrder?: () => void;
  showRecommendations?: boolean;
  className?: string;
}

interface TimelineStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  icon: React.ComponentType<{ className?: string }>;
  timestamp?: Date;
}

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  order,
  tracking,
  timeline,
  onDownloadInvoice,
  onPrint,
  onShare,
  onContinueShopping,
  onTrackOrder,
  showRecommendations = true,
  className = ''
}) => {
  const router = useRouter();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [emailSubscribed, setEmailSubscribed] = useState(true);
  const [smsSubscribed, setSmsSubscribed] = useState(false);
  
  // Confetti animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      // Confetti effect trigger
      console.log('🎉 Order confirmed!');
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle download invoice
  const handleDownloadInvoice = async () => {
    if (!onDownloadInvoice) return;
    
    setIsDownloading(true);
    try {
      await onDownloadInvoice();
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      toast.error('Failed to download invoice');
      console.error('Download error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle print
  const handlePrint = () => {
    setIsPrinting(true);
    try {
      if (onPrint) {
        onPrint();
      } else {
        window.print();
      }
      toast.success('Print dialog opened');
    } catch (error) {
      toast.error('Failed to print');
      console.error('Print error:', error);
    } finally {
      setIsPrinting(false);
    }
  };

  // Handle share
  const handleShare = async () => {
    setIsSharing(true);
    try {
      if (onShare) {
        await onShare();
      } else if (navigator.share) {
        await navigator.share({
          title: `Order #${order.orderNumber}`,
          text: `My order from Vardhman Mills - Order #${order.orderNumber}`,
          url: window.location.href
        });
      }
      toast.success('Order shared successfully');
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        toast.error('Failed to share order');
        console.error('Share error:', error);
      }
    } finally {
      setIsSharing(false);
    }
  };

  // Handle copy order number
  const handleCopyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(order.orderNumber);
      setCopiedToClipboard(true);
      toast.success('Order number copied to clipboard');
      setTimeout(() => setCopiedToClipboard(false), 3000);
    } catch (error) {
      toast.error('Failed to copy order number');
      console.error('Copy error:', error);
    }
  };

  // Calculate estimated delivery date
  const getEstimatedDelivery = (): Date => {
    if (tracking?.estimatedDeliveryDate) {
      return new Date(tracking.estimatedDeliveryDate);
    }
    if (order.estimatedDeliveryDate) {
      return new Date(order.estimatedDeliveryDate);
    }
    // Default: 7 days from now
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
  };

  // Format date
  const formatDate = (date: Date | string): string => {
    return new Intl.DateTimeFormat('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };

  // Get payment method display
  const getPaymentMethodDisplay = (): string => {
    const method = order.paymentMethod;
    if (!method) return 'Unknown';
    
    const typeMap: Record<string, string> = {
      credit_card: 'Credit Card',
      debit_card: 'Debit Card',
      digital_wallet: 'Digital Wallet',
      bank_transfer: 'Bank Transfer',
      cash_on_delivery: 'Cash on Delivery',
      emi: 'EMI',
      gift_card: 'Gift Card'
    };

    return typeMap[method.type] || method.type.replace(/_/g, ' ').toUpperCase();
  };

  // Build timeline steps
  const timelineSteps: TimelineStep[] = [
    {
      id: 'placed',
      title: 'Order Placed',
      description: 'Your order has been confirmed',
      status: 'completed',
      icon: CheckCircleIcon,
      timestamp: order.createdAt ? new Date(order.createdAt) : undefined
    },
    {
      id: 'confirmed',
      title: 'Order Confirmed',
      description: 'Payment verified and order processing',
      status: ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status) ? 'completed' : 'current',
      icon: DocumentTextIcon,
      timestamp: order.confirmedAt ? new Date(order.confirmedAt) : undefined
    },
    {
      id: 'processing',
      title: 'Processing',
      description: 'Your order is being prepared',
      status: ['processing', 'shipped', 'delivered'].includes(order.status) ? 'completed' : order.status === 'confirmed' ? 'current' : 'pending',
      icon: BuildingOfficeIcon
    },
    {
      id: 'shipped',
      title: 'Shipped',
      description: 'Your order is on the way',
      status: ['shipped', 'delivered'].includes(order.status) ? 'completed' : order.status === 'processing' ? 'current' : 'pending',
      icon: TruckIcon,
      timestamp: order.shippedAt ? new Date(order.shippedAt) : undefined
    },
    {
      id: 'delivered',
      title: 'Delivered',
      description: 'Your order has been delivered',
      status: order.status === 'delivered' ? 'completed' : order.status === 'shipped' ? 'current' : 'pending',
      icon: GiftIcon,
      timestamp: order.deliveredAt ? new Date(order.deliveredAt) : undefined
    }
  ];

  const estimatedDelivery = getEstimatedDelivery();
  const customerEmail = order.user?.email || order.shippingAddress?.email || 'your email';

  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-6 shadow-lg"
          >
            <CheckCircleIcon className="h-12 w-12 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Order Confirmed! 🎉
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-600 mb-6"
          >
            Thank you for your purchase. Your order has been received and is being processed.
          </motion.p>

          {/* Order Number */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-3 bg-white px-6 py-4 rounded-xl shadow-md border-2 border-green-200"
          >
            <span className="text-gray-600 font-medium">Order Number:</span>
            <button
              onClick={handleCopyOrderNumber}
              className="flex items-center gap-2 text-2xl font-bold text-green-600 hover:text-green-700 transition-colors"
            >
              #{order.orderNumber}
              <Tooltip content={copiedToClipboard ? 'Copied!' : 'Click to copy'}>
                <DocumentTextIcon className="h-6 w-6" />
              </Tooltip>
            </button>
            {copiedToClipboard && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm text-green-600"
              >
                ✓ Copied
              </motion.span>
            )}
          </motion.div>

          {/* Confirmation Email Notice */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-sm text-gray-600 flex items-center justify-center gap-2"
          >
            <EnvelopeIcon className="h-5 w-5" />
            A confirmation email has been sent to <span className="font-semibold text-gray-900">{customerEmail}</span>
          </motion.p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          <Button
            variant="gradient"
            size="lg"
            onClick={onTrackOrder || (() => router.push(`/orders/${order.id}`))}
            className="shadow-lg"
          >
            <TruckIcon className="h-5 w-5 mr-2" />
            Track Order
          </Button>

          {onDownloadInvoice && (
            <Button
              variant="outline"
              size="lg"
              onClick={handleDownloadInvoice}
              disabled={isDownloading}
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              {isDownloading ? 'Downloading...' : 'Download Invoice'}
            </Button>
          )}

          <Button
            variant="outline"
            size="lg"
            onClick={handlePrint}
            disabled={isPrinting}
          >
            <PrinterIcon className="h-5 w-5 mr-2" />
            Print
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={handleShare}
            disabled={isSharing}
          >
            <ShareIcon className="h-5 w-5 mr-2" />
            Share
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <ClockIcon className="h-6 w-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Order Timeline</h2>
                </div>

                <div className="space-y-6">
                  {timelineSteps.map((step, index) => (
                    <div key={step.id} className="flex gap-4">
                      {/* Icon Column */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`
                            w-12 h-12 rounded-full flex items-center justify-center transition-all
                            ${step.status === 'completed' ? 'bg-green-100 text-green-600' : ''}
                            ${step.status === 'current' ? 'bg-blue-100 text-blue-600 ring-4 ring-blue-200 animate-pulse' : ''}
                            ${step.status === 'pending' ? 'bg-gray-100 text-gray-400' : ''}
                          `}
                        >
                          <step.icon className="h-6 w-6" />
                        </div>
                        {index < timelineSteps.length - 1 && (
                          <div
                            className={`
                              w-0.5 h-16 mt-2 transition-colors
                              ${step.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'}
                            `}
                          />
                        )}
                      </div>

                      {/* Content Column */}
                      <div className="flex-1 pb-8">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className={`
                              text-lg font-semibold transition-colors
                              ${step.status === 'completed' ? 'text-green-600' : ''}
                              ${step.status === 'current' ? 'text-blue-600' : ''}
                              ${step.status === 'pending' ? 'text-gray-400' : ''}
                            `}>
                              {step.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                            {step.timestamp && (
                              <p className="text-xs text-gray-500 mt-2">
                                {new Intl.DateTimeFormat('en-IN', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }).format(step.timestamp)}
                              </p>
                            )}
                          </div>
                          {step.status === 'completed' && (
                            <CheckCircleIcon className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Estimated Delivery */}
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Estimated Delivery</p>
                      <p className="text-lg font-bold text-gray-900">{formatDate(estimatedDelivery)}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Order Summary Component */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <OrderSummary
                order={order}
                items={order.items}
                context="confirmation"
                editable={false}
                compact={false}
              />
            </motion.div>

            {/* Shipping & Billing Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Shipping Address */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MapPinIcon className="h-6 w-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Shipping Address</h3>
                </div>
                <div className="text-gray-700 space-y-1">
                  <p className="font-medium">
                    {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                  </p>
                  <p>{order.shippingAddress?.addressLine1}</p>
                  {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                  <p>
                    {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
                  </p>
                  <p>{order.shippingAddress?.country}</p>
                  {order.shippingAddress?.phone && (
                    <p className="flex items-center gap-2 mt-2 text-sm">
                      <PhoneIcon className="h-4 w-4" />
                      {order.shippingAddress.phone}
                    </p>
                  )}
                </div>
              </Card>

              {/* Billing Address */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCardIcon className="h-6 w-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Billing Address</h3>
                </div>
                <div className="text-gray-700 space-y-1">
                  {order.billingAddress && order.billingAddress.id !== order.shippingAddress?.id ? (
                    <>
                      <p className="font-medium">
                        {order.billingAddress.firstName} {order.billingAddress.lastName}
                      </p>
                      <p>{order.billingAddress.addressLine1}</p>
                      {order.billingAddress.addressLine2 && <p>{order.billingAddress.addressLine2}</p>}
                      <p>
                        {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.postalCode}
                      </p>
                      <p>{order.billingAddress.country}</p>
                    </>
                  ) : (
                    <p className="text-gray-600 italic">Same as shipping address</p>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1 }}
              className="sticky top-8 space-y-6"
            >
              {/* Payment Method */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Information</h2>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <BanknotesIcon className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Payment Method</span>
                  </div>
                  <p className="text-gray-900 font-semibold">{getPaymentMethodDisplay()}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant={order.paymentStatus === 'paid' ? 'success' : 'warning'}
                      size="sm"
                    >
                      {order.paymentStatus === 'paid' ? '✓ Paid' : order.paymentStatus.toUpperCase()}
                    </Badge>
                    {order.paymentStatus === 'paid' && order.createdAt && (
                      <span className="text-xs text-gray-500">
                        on {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {order.transactionId && (
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Transaction ID:</span> {order.transactionId}
                  </div>
                )}
              </Card>

              {/* Need Help */}
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Need Help?</h3>
                </div>
                <p className="text-sm text-gray-700 mb-4">
                  Our customer support team is here to assist you with any questions.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-center">
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    Call Support
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-center">
                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                    Email Support
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-center">
                    <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                    Live Chat
                  </Button>
                </div>
              </Card>

              {/* Notifications */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <InformationCircleIcon className="h-6 w-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Stay Updated</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Get real-time updates about your order
                </p>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailSubscribed}
                      onChange={(e) => setEmailSubscribed(e.target.checked)}
                      className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Email notifications</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={smsSubscribed}
                      onChange={(e) => setSmsSubscribed(e.target.checked)}
                      className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">SMS notifications</span>
                  </label>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Continue Shopping */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="text-center"
        >
          <Button
            variant="gradient"
            size="lg"
            onClick={onContinueShopping || (() => router.push('/products'))}
            className="shadow-lg"
          >
            Continue Shopping
            <ArrowRightIcon className="h-5 w-5 ml-2" />
          </Button>
        </motion.div>

        {/* Recommendations */}
        {showRecommendations && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="mt-12"
          >
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <SparklesIcon className="h-6 w-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">You Might Also Like</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Based on your recent purchase, here are some products we think you will love
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="bg-gray-100 rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                    <div className="w-full aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-3 flex items-center justify-center">
                      <HeartIcon className="h-12 w-12 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">Product {item}</p>
                    <p className="text-xs text-gray-600 mt-1">₹999</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Security Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 text-sm text-gray-600">
            <ShieldCheckIcon className="h-5 w-5 text-green-600" />
            <span>Your order is secure and protected</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
