'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export interface PaymentMethodsProps {
  className?: string;
  variant?: 'default' | 'minimal' | 'icons-only';
  showTitle?: boolean;
  showSecurityBadge?: boolean;
}

interface PaymentMethod {
  name: string;
  icon?: string;
  iconComponent?: React.ElementType;
  type: 'card' | 'wallet' | 'bank' | 'crypto';
  popular?: boolean;
  secure?: boolean;
}

const paymentMethods: PaymentMethod[] = [
  {
    name: 'Visa',
    icon: '/payment-icons/visa.svg',
    type: 'card',
    popular: true,
    secure: true,
  },
  {
    name: 'Mastercard',
    icon: '/payment-icons/mastercard.svg',
    type: 'card',
    popular: true,
    secure: true,
  },
  {
    name: 'American Express',
    icon: '/payment-icons/amex.svg',
    type: 'card',
    secure: true,
  },
  {
    name: 'PayPal',
    icon: '/payment-icons/paypal.svg',
    type: 'wallet',
    popular: true,
    secure: true,
  },
  {
    name: 'Razorpay',
    icon: '/payment-icons/razorpay.svg',
    type: 'wallet',
    popular: true,
    secure: true,
  },
  {
    name: 'UPI',
    iconComponent: DevicePhoneMobileIcon,
    type: 'wallet',
    popular: true,
    secure: true,
  },
  {
    name: 'Net Banking',
    iconComponent: BanknotesIcon,
    type: 'bank',
    secure: true,
  },
  {
    name: 'Credit Card',
    iconComponent: CreditCardIcon,
    type: 'card',
    secure: true,
  },
];

const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  className = '',
  variant = 'default',
  showTitle = true,
  showSecurityBadge = true,
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 }
    },
    hover: {
      scale: 1.05,
      y: -2,
      transition: { duration: 0.2 }
    }
  };

  if (variant === 'minimal') {
    return (
      <div className={`${className}`}>
        {showTitle && (
          <h4 className="text-sm font-semibold text-white mb-3">
            Payment Methods
          </h4>
        )}
        <div className="flex flex-wrap gap-2">
          {paymentMethods.slice(0, 4).map((method) => (
            <div
              key={method.name}
              className="flex items-center justify-center w-12 h-8 bg-gray-800 border border-gray-700 rounded-md"
              title={method.name}
            >
              {method.icon ? (
                <Image
                  src={method.icon}
                  alt={method.name}
                  width={24}
                  height={16}
                  className="object-contain"
                />
              ) : method.iconComponent ? (
                <method.iconComponent className="w-4 h-4 text-gray-400" />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'icons-only') {
    return (
      <motion.div
        className={`flex flex-wrap gap-3 ${className}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {paymentMethods.map((method) => (
          <motion.div
            key={method.name}
            variants={itemVariants}
            whileHover="hover"
            className={`
              relative flex items-center justify-center w-14 h-10 
              bg-gray-800 border border-gray-700 
              rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200
              ${method.popular ? 'ring-1 ring-blue-800' : ''}
            `}
            title={method.name}
          >
            {method.icon ? (
              <Image
                src={method.icon}
                alt={method.name}
                width={28}
                height={20}
                className="object-contain"
              />
            ) : method.iconComponent ? (
              <method.iconComponent className="w-5 h-5 text-gray-400" />
            ) : null}

            {method.popular && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
            )}

            {method.secure && (
              <div className="absolute -bottom-1 -right-1">
                <ShieldCheckIcon className="w-3 h-3 text-green-500" />
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <div className={`${className}`}>
      {showTitle && (
        <h3 className="text-lg font-semibold text-white mb-6">
          Accepted Payment Methods
        </h3>
      )}

      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Payment Icons Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
          {paymentMethods.map((method) => (
            <motion.div
              key={method.name}
              variants={itemVariants}
              whileHover="hover"
              className={`
                relative flex items-center justify-center h-12 
                bg-gray-800 border border-gray-700 
                rounded-lg shadow-sm hover:shadow-md transition-all duration-200
                ${method.popular ? 'ring-2 ring-blue-800' : ''}
              `}
              title={method.name}
            >
              {method.icon ? (
                <Image
                  src={method.icon}
                  alt={method.name}
                  width={32}
                  height={24}
                  className="object-contain"
                />
              ) : method.iconComponent ? (
                <method.iconComponent className="w-6 h-6 text-gray-400" />
              ) : null}

              {method.popular && (
                <div className="absolute -top-1 -right-1 px-1 py-0.5 text-xs font-bold text-white bg-blue-500 rounded-full">
                  ★
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Payment Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-900/20 rounded-lg">
            <CreditCardIcon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-blue-100 mb-1">
              Credit & Debit Cards
            </h4>
            <p className="text-xs text-blue-300 font-medium">
              All major cards accepted
            </p>
          </div>

          <div className="text-center p-4 bg-green-900/20 rounded-lg">
            <DevicePhoneMobileIcon className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-green-100 mb-1">
              Digital Wallets
            </h4>
            <p className="text-xs text-green-300 font-medium">
              UPI, PayPal, Razorpay
            </p>
          </div>

          <div className="text-center p-4 bg-purple-900/20 rounded-lg">
            <BanknotesIcon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-purple-100 mb-1">
              Bank Transfer
            </h4>
            <p className="text-xs text-purple-300 font-medium">
              Net banking & RTGS
            </p>
          </div>

          <div className="text-center p-4 bg-orange-900/20 rounded-lg">
            <ShieldCheckIcon className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-orange-100 mb-1">
              Secure Payments
            </h4>
            <p className="text-xs text-orange-300 font-medium">
              256-bit SSL encryption
            </p>
          </div>
        </div>

        {/* Security Badge */}
        {showSecurityBadge && (
          <div className="flex items-center justify-center p-4 bg-gray-800 border border-gray-700 rounded-lg shadow-sm">
            <ShieldCheckIcon className="w-6 h-6 text-green-500 mr-3" />
            <div>
              <h4 className="text-sm font-semibold text-white">
                100% Secure Payments
              </h4>
              <p className="text-xs text-gray-400 font-medium">
                Your payment information is encrypted and secure
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentMethods;