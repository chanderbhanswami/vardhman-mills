'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  TruckIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface OrderEmptyProps {
  variant?: 'no-orders' | 'no-results' | 'no-filtered' | 'error' | 'loading';
  title?: string;
  message?: string;
  showActions?: boolean;
  onClearFilters?: () => void;
  onRetry?: () => void;
  className?: string;
}

const variantConfig = {
  'no-orders': {
    icon: ShoppingBagIcon,
    defaultTitle: 'No Orders Yet',
    defaultMessage: 'You haven\'t placed any orders yet. Start shopping to see your order history here.',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    showShopButton: true,
    showClearButton: false,
  },
  'no-results': {
    icon: MagnifyingGlassIcon,
    defaultTitle: 'No Orders Found',
    defaultMessage: 'We couldn\'t find any orders matching your search. Try different keywords or check your spelling.',
    iconColor: 'text-gray-600',
    iconBg: 'bg-gray-100',
    showShopButton: false,
    showClearButton: false,
  },
  'no-filtered': {
    icon: FunnelIcon,
    defaultTitle: 'No Orders Match Your Filters',
    defaultMessage: 'Try adjusting your filters to see more results. You can clear all filters to view all orders.',
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
    showShopButton: false,
    showClearButton: true,
  },
  'error': {
    icon: ExclamationCircleIcon,
    defaultTitle: 'Unable to Load Orders',
    defaultMessage: 'We encountered an error while loading your orders. Please try again or contact support if the problem persists.',
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
    showShopButton: false,
    showClearButton: false,
  },
  'loading': {
    icon: ClockIcon,
    defaultTitle: 'Loading Orders',
    defaultMessage: 'Please wait while we fetch your order history...',
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-100',
    showShopButton: false,
    showClearButton: false,
  },
};

export const OrderEmpty: React.FC<OrderEmptyProps> = ({
  variant = 'no-orders',
  title,
  message,
  showActions = true,
  onClearFilters,
  onRetry,
  className,
}) => {
  const router = useRouter();
  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleShopNow = () => {
    router.push('/products');
  };

  const handleViewAllOrders = () => {
    router.push('/orders');
  };

  const handleClearFilters = () => {
    if (onClearFilters) {
      onClearFilters();
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  // Suggestions based on variant
  const getSuggestions = () => {
    switch (variant) {
      case 'no-orders':
        return [
          { icon: ShoppingBagIcon, text: 'Browse our latest products', action: () => router.push('/products') },
          { icon: TruckIcon, text: 'Free shipping on orders over $50', action: null },
          { icon: CheckCircleIcon, text: 'Easy returns within 30 days', action: null },
        ];
      case 'no-results':
        return [
          { icon: MagnifyingGlassIcon, text: 'Check your spelling and try again', action: null },
          { icon: ClockIcon, text: 'Search by order number or date', action: null },
          { icon: ArrowPathIcon, text: 'View all your orders', action: handleViewAllOrders },
        ];
      case 'no-filtered':
        return [
          { icon: FunnelIcon, text: 'Clear all filters', action: handleClearFilters },
          { icon: ClockIcon, text: 'Try a different date range', action: null },
          { icon: ArrowPathIcon, text: 'View all orders', action: handleViewAllOrders },
        ];
      case 'error':
        return [
          { icon: ArrowPathIcon, text: 'Retry loading orders', action: handleRetry },
          { icon: ClockIcon, text: 'Check your internet connection', action: null },
          { icon: ExclamationCircleIcon, text: 'Contact support if issue persists', action: () => router.push('/help/contact') },
        ];
      default:
        return [];
    }
  };

  const suggestions = getSuggestions();

  return (
    <Card className={cn('p-8 sm:p-12', className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-2xl mx-auto"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className={cn(
            'inline-flex items-center justify-center w-20 h-20 rounded-full mb-6',
            config.iconBg
          )}
        >
          <Icon className={cn('h-10 w-10', config.iconColor)} />
        </motion.div>

        {/* Title */}
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-gray-900 mb-3"
        >
          {title || config.defaultTitle}
        </motion.h3>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-base text-gray-600 mb-8 leading-relaxed"
        >
          {message || config.defaultMessage}
        </motion.p>

        {/* Actions */}
        {showActions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 justify-center mb-8"
          >
            {variant === 'error' && onRetry && (
              <Button
                variant="default"
                size="lg"
                onClick={handleRetry}
                leftIcon={<ArrowPathIcon className="h-5 w-5" />}
              >
                Try Again
              </Button>
            )}

            {config.showShopButton && (
              <Button
                variant="default"
                size="lg"
                onClick={handleShopNow}
                leftIcon={<ShoppingBagIcon className="h-5 w-5" />}
              >
                Start Shopping
              </Button>
            )}

            {config.showClearButton && onClearFilters && (
              <Button
                variant="default"
                size="lg"
                onClick={handleClearFilters}
                leftIcon={<FunnelIcon className="h-5 w-5" />}
              >
                Clear Filters
              </Button>
            )}

            {variant !== 'no-orders' && variant !== 'error' && (
              <Button
                variant="secondary"
                size="lg"
                onClick={handleViewAllOrders}
              >
                View All Orders
              </Button>
            )}
          </motion.div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t"
          >
            {suggestions.map((suggestion, index) => {
              const SuggestionIcon = suggestion.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  onClick={suggestion.action || undefined}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-lg',
                    suggestion.action && 'cursor-pointer hover:bg-gray-50 transition-colors'
                  )}
                >
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <SuggestionIcon className="h-5 w-5 text-gray-600" />
                  </div>
                  <p className="text-sm text-gray-700 text-center">
                    {suggestion.text}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Additional Help Text */}
        {variant === 'no-orders' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 text-sm text-gray-500"
          >
            Need help finding something? Contact our{' '}
            <button
              onClick={() => router.push('/help/contact')}
              className="text-blue-600 hover:text-blue-700 font-medium underline"
            >
              customer support team
            </button>
          </motion.p>
        )}
      </motion.div>
    </Card>
  );
};

export default OrderEmpty;
