'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TruckIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  MapPinIcon,
  PhoneIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';
import type { Order } from '@/types/cart.types';

interface TrackingInfoProps {
  order: Order;
  showMap?: boolean;
  className?: string;
}

export const TrackingInfo: React.FC<TrackingInfoProps> = ({
  order,
  showMap = false,
  className,
}) => {
  const [copied, setCopied] = useState(false);

  // Copy tracking number to clipboard
  const handleCopyTracking = async () => {
    if (order.trackingNumber) {
      try {
        await navigator.clipboard.writeText(order.trackingNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  // Get carrier info (mock data - in real app, this would come from backend)
  const getCarrierInfo = () => {
    // In a real app, this would be determined by order.shippingMethod or carrier data
    return {
      name: order.shippingMethod.name || 'Standard Shipping',
      website: 'https://example.com/track',
      phone: '1-800-EXAMPLE',
      logo: null,
    };
  };

  // Get fulfillment status badge
  const getFulfillmentBadge = () => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'Pending' },
      processing: { variant: 'warning' as const, label: 'Processing' },
      ready: { variant: 'info' as const, label: 'Ready to Ship' },
      shipped: { variant: 'success' as const, label: 'Shipped' },
      in_transit: { variant: 'info' as const, label: 'In Transit' },
      out_for_delivery: { variant: 'success' as const, label: 'Out for Delivery' },
      delivered: { variant: 'success' as const, label: 'Delivered' },
      failed: { variant: 'destructive' as const, label: 'Failed' },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled' },
      returned: { variant: 'secondary' as const, label: 'Returned' },
    };

    const config = statusConfig[order.fulfillmentStatus];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Format date
  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const carrierInfo = getCarrierInfo();

  return (
    <Card className={cn('p-6', className)}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-3">
              <TruckIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Tracking Information</h3>
              <p className="text-sm text-gray-600 mt-0.5">
                Track your shipment in real-time
              </p>
            </div>
          </div>
          {getFulfillmentBadge()}
        </div>

        {/* Tracking Number */}
        {order.trackingNumber && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Tracking Number
                </p>
                <p className="text-lg font-mono font-semibold text-gray-900">
                  {order.trackingNumber}
                </p>
              </div>
              <Tooltip content={copied ? 'Copied!' : 'Copy tracking number'}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyTracking}
                  leftIcon={copied ? <CheckCircleIcon className="h-4 w-4" /> : <DocumentDuplicateIcon className="h-4 w-4" />}
                >
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </Tooltip>
            </div>
          </div>
        )}

        {/* Carrier Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <TruckIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Carrier
              </p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {carrierInfo.name}
              </p>
              {order.shippingMethod.description && (
                <p className="text-xs text-gray-600 mt-0.5">
                  {order.shippingMethod.description}
                </p>
              )}
            </div>
          </div>

          {order.shippedAt && (
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shipped On
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {formatDate(order.shippedAt)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Estimated Delivery */}
        {order.estimatedDeliveryDate && (
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <MapPinIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {order.status === 'delivered' ? 'Delivered On' : 'Estimated Delivery'}
              </p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {order.status === 'delivered' && order.deliveredAt
                  ? formatDate(order.deliveredAt)
                  : formatDate(order.estimatedDeliveryDate)}
              </p>
              {order.status !== 'delivered' && (
                <p className="text-xs text-gray-600 mt-0.5">
                  Delivery estimate may vary based on location and carrier
                </p>
              )}
            </div>
          </div>
        )}

        {/* Delivery Address */}
        <div className="pt-4 border-t">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-orange-100 p-2">
              <MapPinIcon className="h-5 w-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Delivery Address
              </p>
              <div className="text-sm text-gray-900">
                <p className="font-medium">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                {order.shippingAddress.company && (
                  <p className="text-gray-600">{order.shippingAddress.company}</p>
                )}
                <p className="text-gray-600">
                  {order.shippingAddress.addressLine1}
                  {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                </p>
                <p className="text-gray-600">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </p>
                <p className="text-gray-600">{order.shippingAddress.country}</p>
                {order.shippingAddress.landmark && (
                  <p className="text-gray-600 mt-1">
                    Landmark: {order.shippingAddress.landmark}
                  </p>
                )}
                {order.shippingAddress.phone && (
                  <p className="text-gray-600 mt-1 flex items-center gap-1">
                    <PhoneIcon className="h-3.5 w-3.5" />
                    {order.shippingAddress.phone}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Carrier Contact */}
        <div className="pt-4 border-t flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <p className="text-sm text-gray-600">Need help with your shipment?</p>
          <div className="flex flex-wrap items-center gap-2">
            {carrierInfo.phone && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<PhoneIcon className="h-4 w-4" />}
                onClick={() => window.open(`tel:${carrierInfo.phone}`, '_self')}
              >
                Call Carrier
              </Button>
            )}
            {carrierInfo.website && order.trackingNumber && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<GlobeAltIcon className="h-4 w-4" />}
                onClick={() => window.open(`${carrierInfo.website}/${order.trackingNumber}`, '_blank')}
              >
                Track on Carrier Website
              </Button>
            )}
          </div>
        </div>

        {/* Map Placeholder */}
        {showMap && order.trackingNumber && (
          <div className="pt-4 border-t">
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Map integration coming soon
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Track your shipment location in real-time
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </Card>
  );
};
