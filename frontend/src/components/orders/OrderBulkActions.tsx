'use client';

import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { Order } from '@/types/cart.types';
import type { OrderStatus } from '@/types/cart.types';
import {
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  ArrowPathIcon,
  EnvelopeIcon,
  PrinterIcon,
  TagIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface OrderBulkActionsProps {
  selectedOrders: Order[];
  onAction: (action: string, orders: Order[]) => Promise<void>;
  onClearSelection?: () => void;
  className?: string;
}

interface BulkAction {
  id: string;
  label: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  description: string;
  requiresConfirmation: boolean;
  allowedStatuses?: OrderStatus[];
}

export const OrderBulkActions: React.FC<OrderBulkActionsProps> = ({
  selectedOrders,
  onAction,
  onClearSelection,
  className,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingAction, setPendingAction] = useState<BulkAction | null>(null);
  const [progress, setProgress] = useState(0);
  const [showDetails, setShowDetails] = useState(true);

  // Available bulk actions
  const bulkActions: BulkAction[] = [
    {
      id: 'mark_shipped',
      label: 'Mark as Shipped',
      icon: TruckIcon,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      description: 'Mark selected orders as shipped',
      requiresConfirmation: true,
      allowedStatuses: ['confirmed', 'processing'],
    },
    {
      id: 'mark_delivered',
      label: 'Mark as Delivered',
      icon: CheckCircleIcon,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
      description: 'Mark selected orders as delivered',
      requiresConfirmation: true,
      allowedStatuses: ['shipped', 'partially_shipped'],
    },
    {
      id: 'cancel_orders',
      label: 'Cancel Orders',
      icon: XCircleIcon,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
      description: 'Cancel selected orders',
      requiresConfirmation: true,
      allowedStatuses: ['pending', 'confirmed'],
    },
    {
      id: 'send_notification',
      label: 'Send Notification',
      icon: EnvelopeIcon,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
      description: 'Send email notification to customers',
      requiresConfirmation: false,
    },
    {
      id: 'print_invoices',
      label: 'Print Invoices',
      icon: PrinterIcon,
      iconColor: 'text-gray-600',
      iconBg: 'bg-gray-100',
      description: 'Print invoices for selected orders',
      requiresConfirmation: false,
    },
    {
      id: 'add_tags',
      label: 'Add Tags',
      icon: TagIcon,
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-100',
      description: 'Add tags to selected orders',
      requiresConfirmation: false,
    },
    {
      id: 'process_refunds',
      label: 'Process Refunds',
      icon: ArrowPathIcon,
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
      description: 'Process refunds for selected orders',
      requiresConfirmation: true,
      allowedStatuses: ['delivered', 'completed', 'cancelled'],
    },
  ];

  // Check if action is allowed for selected orders
  const isActionAllowed = (action: BulkAction): { allowed: boolean; reason?: string } => {
    if (selectedOrders.length === 0) {
      return { allowed: false, reason: 'No orders selected' };
    }

    if (!action.allowedStatuses) {
      return { allowed: true };
    }

    const invalidOrders = selectedOrders.filter(
      order => !action.allowedStatuses!.includes(order.status as OrderStatus)
    );

    if (invalidOrders.length > 0) {
      return {
        allowed: false,
        reason: `${invalidOrders.length} order(s) have invalid status for this action`,
      };
    }

    return { allowed: true };
  };

  // Handle action click
  const handleActionClick = (action: BulkAction) => {
    const { allowed, reason } = isActionAllowed(action);

    if (!allowed) {
      alert(reason);
      return;
    }

    if (action.requiresConfirmation) {
      setPendingAction(action);
      setShowConfirmation(true);
    } else {
      executeAction(action.id);
    }
  };

  // Execute bulk action
  const executeAction = useCallback(async (actionId: string) => {
    setIsProcessing(true);
    setCurrentAction(actionId);
    setProgress(0);
    setShowConfirmation(false);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Execute the action
      await onAction(actionId, selectedOrders);

      clearInterval(progressInterval);
      setProgress(100);

      // Reset after a delay
      setTimeout(() => {
        setIsProcessing(false);
        setCurrentAction(null);
        setProgress(0);
        setPendingAction(null);
      }, 1500);
    } catch (error) {
      console.error('Bulk action failed:', error);
      setIsProcessing(false);
      setCurrentAction(null);
      setProgress(0);
      setPendingAction(null);
    }
  }, [onAction, selectedOrders]);

  // Cancel confirmation
  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
    setPendingAction(null);
  };

  // Calculate order statistics
  const orderStats = {
    total: selectedOrders.length,
    byStatus: selectedOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    totalValue: selectedOrders.reduce((sum, order) => {
      const amount = typeof order.total === 'number' ? order.total : order.total.amount;
      return sum + amount;
    }, 0),
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Selected Orders Summary */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {selectedOrders.length} Order{selectedOrders.length !== 1 ? 's' : ''} Selected
              </p>
              <p className="text-xs text-gray-600">
                Total: ${orderStats.totalValue.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              leftIcon={showDetails ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
            {onClearSelection && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onClearSelection}
                leftIcon={<XCircleIcon className="h-4 w-4" />}
              >
                Clear Selection
              </Button>
            )}
          </div>
        </div>

        {/* Order Details */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs font-medium text-gray-700 mb-2">Status Breakdown:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(orderStats.byStatus).map(([status, count]) => (
                    <Badge key={status} variant="secondary">
                      {status}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Bulk Actions Grid */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Actions</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {bulkActions.map((action) => {
            const Icon = action.icon;
            const { allowed, reason } = isActionAllowed(action);
            const isActive = currentAction === action.id;

            return (
              <motion.button
                key={action.id}
                whileHover={allowed ? { scale: 1.02 } : {}}
                whileTap={allowed ? { scale: 0.98 } : {}}
                onClick={() => handleActionClick(action)}
                disabled={!allowed || isProcessing}
                className={cn(
                  'flex flex-col items-start gap-3 p-4 rounded-lg border-2 transition-all text-left',
                  allowed && !isProcessing
                    ? 'border-gray-200 hover:border-gray-300 bg-white cursor-pointer'
                    : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60',
                  isActive && 'border-blue-600 bg-blue-50'
                )}
              >
                <div className={cn('p-2 rounded-lg', action.iconBg)}>
                  <Icon className={cn('h-5 w-5', action.iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 mb-1">{action.label}</p>
                  <p className="text-xs text-gray-600 line-clamp-2">{action.description}</p>
                  {!allowed && reason && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <ExclamationTriangleIcon className="h-3 w-3" />
                      {reason}
                    </p>
                  )}
                  {isActive && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.3 }}
                          className="h-full bg-blue-600 rounded-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </Card>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && pendingAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={handleCancelConfirmation}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className={cn('p-3 rounded-lg flex-shrink-0', pendingAction.iconBg)}>
                  <pendingAction.icon className={cn('h-6 w-6', pendingAction.iconColor)} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Confirm {pendingAction.label}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Are you sure you want to {pendingAction.label.toLowerCase()} for {selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''}?
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleCancelConfirmation}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="lg"
                  onClick={() => executeAction(pendingAction.id)}
                  className="flex-1"
                >
                  Confirm
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing Indicator */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <Card className="p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <ClockIcon className="h-5 w-5 text-blue-600 animate-spin" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Processing...</p>
                  <p className="text-xs text-gray-600">{progress}% complete</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderBulkActions;
