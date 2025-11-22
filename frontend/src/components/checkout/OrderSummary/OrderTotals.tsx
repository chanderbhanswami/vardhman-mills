'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  InformationCircleIcon,
  TagIcon,
  TruckIcon,
  ReceiptPercentIcon,
  BanknotesIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { Tooltip } from '@/components/ui/Tooltip';
import { Badge } from '@/components/ui/Badge';
import type { Price, Currency } from '@/types/common.types';

export interface OrderTaxBreakdown {
  name: string;
  type: 'cgst' | 'sgst' | 'igst' | 'vat' | 'sales_tax' | 'service_tax';
  rate: number;
  amount: Price;
  taxableAmount: Price;
}

export interface AdditionalCharge {
  name: string;
  amount: Price;
  description?: string;
}

interface OrderTotalsProps {
  subtotal: Price;
  shipping: Price;
  tax: Price;
  discount: Price;
  total: Price;
  taxBreakdown?: OrderTaxBreakdown[];
  additionalCharges?: AdditionalCharge[];
  showDetails?: boolean;
  currency?: Currency;
  itemCount?: number;
  freeShippingThreshold?: number;
  className?: string;
}

export const OrderTotals: React.FC<OrderTotalsProps> = ({
  subtotal,
  shipping,
  tax,
  discount,
  total,
  taxBreakdown = [],
  additionalCharges = [],
  showDetails = false,
  currency = 'INR',
  itemCount,
  freeShippingThreshold,
  className = ''
}) => {
  const [expanded, setExpanded] = useState(showDetails);
  const [taxExpanded, setTaxExpanded] = useState(false);

  // Calculate total savings
  const totalSavings = discount.amount;

  // Calculate percentage saved
  const originalTotal = subtotal.amount + shipping.amount + tax.amount;
  const percentageSaved = originalTotal > 0 ? (totalSavings / originalTotal) * 100 : 0;

  // Calculate progress to free shipping
  const progressToFreeShipping = freeShippingThreshold && shipping.amount > 0
    ? (subtotal.amount / freeShippingThreshold) * 100
    : 0;

  const amountNeededForFreeShipping = freeShippingThreshold && shipping.amount > 0
    ? Math.max(0, freeShippingThreshold - subtotal.amount)
    : 0;

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Get tax type display name
  const getTaxTypeName = (type: OrderTaxBreakdown['type']): string => {
    const names: Record<OrderTaxBreakdown['type'], string> = {
      cgst: 'CGST',
      sgst: 'SGST',
      igst: 'IGST',
      vat: 'VAT',
      sales_tax: 'Sales Tax',
      service_tax: 'Service Tax'
    };
    return names[type];
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="p-6 space-y-4">
        {/* Subtotal */}
        <div className="flex items-center justify-between text-gray-700">
          <div className="flex items-center gap-2">
            <span className="font-medium">Subtotal</span>
            {itemCount !== undefined && (
              <span className="text-sm text-gray-500">({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
            )}
          </div>
          <span className="font-semibold">{subtotal.formatted}</span>
        </div>

        {/* Discount */}
        {discount.amount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between text-green-600"
          >
            <div className="flex items-center gap-2">
              <TagIcon className="h-5 w-5" />
              <span className="font-medium">Discount</span>
            </div>
            <span className="font-semibold">-{discount.formatted}</span>
          </motion.div>
        )}

        {/* Shipping */}
        <div className="flex items-center justify-between text-gray-700">
          <div className="flex items-center gap-2">
            <TruckIcon className="h-5 w-5" />
            <span className="font-medium">Shipping</span>
            {shipping.amount === 0 && (
              <Badge variant="success" size="sm">FREE</Badge>
            )}
          </div>
          <span className="font-semibold">
            {shipping.amount === 0 ? 'FREE' : shipping.formatted}
          </span>
        </div>

        {/* Free Shipping Progress */}
        {freeShippingThreshold && shipping.amount > 0 && progressToFreeShipping < 100 && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2 mb-2">
              <InformationCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-900">
                  Add {formatCurrency(amountNeededForFreeShipping)} more for FREE shipping!
                </p>
              </div>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progressToFreeShipping, 100)}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
              />
            </div>
          </div>
        )}

        {/* Tax */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-gray-700">
            <div className="flex items-center gap-2">
              <ReceiptPercentIcon className="h-5 w-5" />
              <span className="font-medium">Tax (GST)</span>
              {taxBreakdown.length > 0 && (
                <button
                  onClick={() => setTaxExpanded(!taxExpanded)}
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Tooltip content={taxExpanded ? 'Hide details' : 'Show details'}>
                    {taxExpanded ? (
                      <ChevronUpIcon className="h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4" />
                    )}
                  </Tooltip>
                </button>
              )}
            </div>
            <span className="font-semibold">{tax.formatted}</span>
          </div>

          {/* Tax Breakdown */}
          <AnimatePresence>
            {taxExpanded && taxBreakdown.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="pl-7 space-y-2 text-sm"
              >
                {taxBreakdown.map((taxItem, index) => (
                  <div key={index} className="flex items-center justify-between text-gray-600">
                    <div className="flex items-center gap-2">
                      <span>{getTaxTypeName(taxItem.type)}</span>
                      <Badge variant="outline" size="sm">
                        {taxItem.rate}%
                      </Badge>
                      <Tooltip content={`On ${taxItem.taxableAmount.formatted}`}>
                        <InformationCircleIcon className="h-3.5 w-3.5 text-gray-400" />
                      </Tooltip>
                    </div>
                    <span className="font-medium">{taxItem.amount.formatted}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Additional Charges */}
        {additionalCharges.length > 0 && (
          <div className="space-y-2">
            {additionalCharges.map((charge, index) => (
              <div key={index} className="flex items-center justify-between text-gray-700">
                <div className="flex items-center gap-2">
                  <BanknotesIcon className="h-5 w-5" />
                  <span className="font-medium">{charge.name}</span>
                  {charge.description && (
                    <Tooltip content={charge.description}>
                      <InformationCircleIcon className="h-4 w-4 text-gray-400" />
                    </Tooltip>
                  )}
                </div>
                <span className="font-semibold">{charge.amount.formatted}</span>
              </div>
            ))}
          </div>
        )}

        {/* Detailed Breakdown Toggle */}
        {(taxBreakdown.length > 0 || additionalCharges.length > 0) && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            {expanded ? (
              <>
                Hide detailed breakdown
                <ChevronUpIcon className="h-4 w-4" />
              </>
            ) : (
              <>
                View detailed breakdown
                <ChevronDownIcon className="h-4 w-4" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Total Section */}
      <div className="border-t border-gray-200 bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        {/* Price Comparison */}
        {discount.amount > 0 && (
          <div className="flex items-center justify-between text-gray-600 mb-2">
            <span className="text-sm">Original Total</span>
            <span className="text-sm line-through">{formatCurrency(originalTotal)}</span>
          </div>
        )}

        {/* Final Total */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xl font-bold text-gray-900">Total</span>
          <div className="text-right">
            <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {total.formatted}
            </span>
            <p className="text-xs text-gray-600 mt-1">Inclusive of all taxes</p>
          </div>
        </div>

        {/* Savings Summary */}
        {totalSavings > 0 && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">You&apos;re saving</p>
                  <p className="text-xs text-gray-600">
                    {percentageSaved > 0 && `${percentageSaved.toFixed(1)}% off`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  {discount.formatted}
                </p>
                <p className="text-xs text-green-700">Total Savings</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Additional Info */}
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
          <div className="flex items-start gap-2 text-xs text-gray-600">
            <InformationCircleIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p>Prices shown are final and include all applicable taxes</p>
          </div>
          {shipping.amount === 0 && (
            <div className="flex items-start gap-2 text-xs text-green-700">
              <TruckIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>Congratulations! You&apos;ve qualified for FREE shipping</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTotals;
