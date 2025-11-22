'use client';

import React, { useState, useCallback } from 'react';
import {
  XMarkIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  TruckIcon,
  ReceiptRefundIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { TextArea } from '@/components/ui/TextArea';
import { Select } from '@/components/ui/Select';
import { toast } from 'react-hot-toast';
import type { Order } from '@/types/order.types';
import { ORDER_STATUS, CANCELLATION_REASONS, RETURN_REASONS } from '@/constants/order.constants';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface OrderActionsProps {
  order: Order;
  className?: string;
  onAction?: (action: string, data?: unknown) => void;
  onOrderUpdate?: (order: Order) => void;
}

type ActionType = 'cancel' | 'return' | 'exchange' | 'reorder' | 'support' | 'review' | null;

export const OrderActions: React.FC<OrderActionsProps> = ({
  order,
  className,
  onAction,
  onOrderUpdate,
}) => {
  const router = useRouter();
  const [activeAction, setActiveAction] = useState<ActionType>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelComments, setCancelComments] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [returnComments, setReturnComments] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [returnMethod, setReturnMethod] = useState<'refund' | 'exchange'>('refund');

  // Check if order can be cancelled
  const canCancelOrder =
    order.status === ORDER_STATUS.PENDING ||
    order.status === ORDER_STATUS.CONFIRMED ||
    order.status === ORDER_STATUS.PROCESSING;

  // Check if order can be returned
  const canReturnOrder = order.status === ORDER_STATUS.DELIVERED;

  // Check if order can be reviewed
  const canReviewOrder = order.status === ORDER_STATUS.DELIVERED;

  // Check if order can be reordered  
  const canReorder =
    order.status === ORDER_STATUS.DELIVERED ||
    order.status === ORDER_STATUS.CANCELLED;

  // Cancel Order
  const handleCancelOrder = useCallback(async () => {
    if (!cancelReason) {
      toast.error('Please select a cancellation reason');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/orders/${order.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: cancelReason,
          comments: cancelComments,
        }),
      });

      if (!response.ok) throw new Error('Failed to cancel order');

      const updatedOrder = await response.json();
      
      toast.success('Order cancelled successfully');
      onAction?.('cancel', { reason: cancelReason, comments: cancelComments });
      onOrderUpdate?.(updatedOrder.data);
      setActiveAction(null);
      setCancelReason('');
      setCancelComments('');
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [order.id, cancelReason, cancelComments, onAction, onOrderUpdate]);

  // Return Order
  const handleReturnOrder = useCallback(async () => {
    if (!returnReason) {
      toast.error('Please select a return reason');
      return;
    }

    if (selectedItems.length === 0) {
      toast.error('Please select items to return');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/orders/${order.id}/return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemIds: selectedItems,
          reason: returnReason,
          comments: returnComments,
          method: returnMethod,
        }),
      });

      if (!response.ok) throw new Error('Failed to initiate return');

      await response.json();
      
      toast.success('Return request submitted successfully');
      onAction?.('return', {
        itemIds: selectedItems,
        reason: returnReason,
        comments: returnComments,
        method: returnMethod,
      });
      setActiveAction(null);
      setReturnReason('');
      setReturnComments('');
      setSelectedItems([]);
    } catch (error) {
      console.error('Error returning order:', error);
      toast.error('Failed to submit return request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [order.id, returnReason, returnComments, selectedItems, returnMethod, onAction]);

  // Reorder
  const handleReorder = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/orders/${order.id}/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to reorder');

      toast.success('Items added to cart!');
      onAction?.('reorder');
      router.push('/cart');
    } catch (error) {
      console.error('Error reordering:', error);
      toast.error('Failed to reorder. Some items may be unavailable.');
    } finally {
      setIsLoading(false);
    }
  }, [order.id, onAction, router]);

  // Contact Support
  const handleContactSupport = useCallback(() => {
    onAction?.('support');
    router.push(`/help/contact?orderId=${order.id}`);
  }, [order.id, onAction, router]);

  // Leave Review
  const handleLeaveReview = useCallback(() => {
    onAction?.('review');
    router.push(`/orders/${order.id}/review`);
  }, [order.id, onAction, router]);

  // Track Order
  const handleTrackOrder = useCallback(() => {
    onAction?.('track');
    router.push(`/orders/${order.id}/tracking`);
  }, [order.id, onAction, router]);

  // Toggle item selection for return
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  return (
    <>
      <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Actions</h3>

        <div className="space-y-3">
          {/* Track Order */}
          {(order.status === ORDER_STATUS.CONFIRMED ||
            order.status === ORDER_STATUS.PROCESSING ||
            order.status === ORDER_STATUS.SHIPPED) && (
            <Button
              fullWidth
              variant="default"
              onClick={handleTrackOrder}
              leftIcon={<TruckIcon className="h-4 w-4" />}
            >
              Track Order
            </Button>
          )}

          {/* Cancel Order */}
          {canCancelOrder && (
            <Button
              fullWidth
              variant="destructive"
              onClick={() => setActiveAction('cancel')}
              leftIcon={<XMarkIcon className="h-4 w-4" />}
            >
              Cancel Order
            </Button>
          )}

          {/* Return Order */}
          {canReturnOrder && (
            <Button
              fullWidth
              variant="outline"
              onClick={() => setActiveAction('return')}
              leftIcon={<ReceiptRefundIcon className="h-4 w-4" />}
            >
              Return Order
            </Button>
          )}

          {/* Leave Review */}
          {canReviewOrder && (
            <Button
              fullWidth
              variant="outline"
              onClick={handleLeaveReview}
              leftIcon={<StarIcon className="h-4 w-4" />}
            >
              Leave Review
            </Button>
          )}

          {/* Reorder */}
          {canReorder && (
            <Button
              fullWidth
              variant="outline"
              onClick={handleReorder}
              disabled={isLoading}
              loading={isLoading}
              leftIcon={<ArrowPathIcon className="h-4 w-4" />}
            >
              Reorder
            </Button>
          )}

          {/* Contact Support */}
          <Button
            fullWidth
            variant="ghost"
            onClick={handleContactSupport}
            leftIcon={<ChatBubbleLeftRightIcon className="h-4 w-4" />}
          >
            Contact Support
          </Button>
        </div>

        {/* Helpful Information */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex gap-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">Need Help?</h4>
              <p className="text-xs text-blue-700">
                Our support team is available 24/7 to assist you with any questions or concerns.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      <Modal
        open={activeAction === 'cancel'}
        onClose={() => setActiveAction(null)}
        title="Cancel Order"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800">
                Are you sure you want to cancel this order? This action cannot be undone.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cancellation Reason *
            </label>
            <Select
              value={cancelReason}
              onValueChange={(value) => setCancelReason(value as string)}
              required
              options={[
                { value: '', label: 'Select a reason' },
                { value: CANCELLATION_REASONS.CHANGED_MIND, label: 'Changed my mind' },
                { value: CANCELLATION_REASONS.FOUND_BETTER_PRICE, label: 'Found a better price' },
                { value: CANCELLATION_REASONS.ORDERED_BY_MISTAKE, label: 'Ordered by mistake' },
                { value: CANCELLATION_REASONS.SHIPPING_TOO_SLOW, label: 'Shipping too slow' },
                { value: CANCELLATION_REASONS.PAYMENT_ISSUES, label: 'Payment issues' },
                { value: CANCELLATION_REASONS.OTHER, label: 'Other' },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Comments (Optional)
            </label>
            <TextArea
              value={cancelComments}
              onChange={(e) => setCancelComments(e.target.value)}
              placeholder="Tell us more about why you're cancelling..."
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              fullWidth
              variant="outline"
              onClick={() => setActiveAction(null)}
              disabled={isLoading}
            >
              Keep Order
            </Button>
            <Button
              fullWidth
              variant="destructive"
              onClick={handleCancelOrder}
              disabled={isLoading || !cancelReason}
              loading={isLoading}
            >
              Cancel Order
            </Button>
          </div>
        </div>
      </Modal>

      {/* Return Order Modal */}
      <Modal
        open={activeAction === 'return'}
        onClose={() => setActiveAction(null)}
        title="Return Order"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800">
                Returns are accepted within 30 days of delivery. Items must be in original
                condition with tags attached.
              </p>
            </div>
          </div>

          {/* Select Return Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Return Method *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setReturnMethod('refund')}
                className={cn(
                  'p-4 border-2 rounded-lg cursor-pointer transition-all',
                  returnMethod === 'refund'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="refund"
                    checked={returnMethod === 'refund'}
                    onChange={() => setReturnMethod('refund')}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="refund" className="ml-2 text-sm font-medium text-gray-900">
                    Refund
                  </label>
                </div>
                <p className="text-xs text-gray-600 mt-1 ml-6">
                  Get money back to your original payment method
                </p>
              </div>
              <div
                onClick={() => setReturnMethod('exchange')}
                className={cn(
                  'p-4 border-2 rounded-lg cursor-pointer transition-all',
                  returnMethod === 'exchange'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="exchange"
                    checked={returnMethod === 'exchange'}
                    onChange={() => setReturnMethod('exchange')}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="exchange" className="ml-2 text-sm font-medium text-gray-900">
                    Exchange
                  </label>
                </div>
                <p className="text-xs text-gray-600 mt-1 ml-6">
                  Exchange for a different size or color
                </p>
              </div>
            </div>
          </div>

          {/* Select Items */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Items to Return *
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleItemSelection(item.id)}
                  className={cn(
                    'p-3 border-2 rounded-lg cursor-pointer transition-all',
                    selectedItems.includes(item.id)
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleItemSelection(item.id)}
                      className="h-4 w-4 text-blue-600 rounded"
                      aria-label={`Select ${item.product?.name || 'item'} for return`}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {item.product?.name || 'Product'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity} • SKU: {item.product?.sku || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Return Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Return Reason *
            </label>
            <Select
              value={returnReason}
              onValueChange={(value) => setReturnReason(value as string)}
              options={[
                { value: '', label: 'Select a reason' },
                { value: RETURN_REASONS.DEFECTIVE, label: 'Defective or damaged' },
                { value: RETURN_REASONS.WRONG_SIZE, label: 'Wrong size' },
                { value: RETURN_REASONS.WRONG_COLOR, label: 'Wrong color' },
                { value: RETURN_REASONS.NOT_AS_DESCRIBED, label: 'Not as described' },
                { value: RETURN_REASONS.DAMAGED_IN_SHIPPING, label: 'Damaged in shipping' },
                { value: RETURN_REASONS.QUALITY_ISSUES, label: 'Quality issues' },
                { value: RETURN_REASONS.CHANGED_MIND, label: 'Changed my mind' },
                { value: RETURN_REASONS.OTHER, label: 'Other' },
              ]}
              required
            />
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Comments (Optional)
            </label>
            <TextArea
              value={returnComments}
              onChange={(e) => setReturnComments(e.target.value)}
              placeholder="Please provide more details about the return..."
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              fullWidth
              variant="outline"
              onClick={() => setActiveAction(null)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant="default"
              onClick={handleReturnOrder}
              disabled={isLoading || !returnReason || selectedItems.length === 0}
              loading={isLoading}
            >
              Submit Return Request
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default OrderActions;
