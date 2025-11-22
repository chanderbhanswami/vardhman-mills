'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  PhoneIcon,
  GlobeAltIcon,
  DocumentDuplicateIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Tooltip } from '@/components/ui/Tooltip';
import { toast } from 'react-hot-toast';
import type { Order, OrderTracking as OrderTrackingType, TrackingEvent } from '@/types/order.types';
import { formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
// import dynamic from 'next/dynamic';

// Dynamically import map component (commented out - component not yet implemented)
// const TrackingMap = dynamic(() => import('@/components/common/TrackingMap'), {
//   ssr: false,
//   loading: () => (
//     <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
//       <Spinner size="lg" />
//     </div>
//   ),
// });

interface OrderTrackingProps {
  order: Order;
  tracking?: OrderTrackingType;
  className?: string;
  showMap?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const OrderTracking: React.FC<OrderTrackingProps> = ({
  order,
  tracking: initialTracking,
  className,
  showMap = true,
  autoRefresh = false,
  refreshInterval = 60000, // 1 minute
}) => {
  const [tracking, setTracking] = useState<OrderTrackingType | undefined>(initialTracking);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<TrackingEvent | null>(null);
  const [showMapView, setShowMapView] = useState(showMap);

  // Fetch tracking information
  const fetchTracking = useCallback(async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await fetch(`/api/orders/${order.id}/tracking`);
      if (!response.ok) throw new Error('Failed to fetch tracking');

      const data = await response.json();
      setTracking(data.data);
      setLastUpdated(new Date());
      
      if (refresh) {
        toast.success('Tracking information updated');
      }
    } catch (error) {
      console.error('Error fetching tracking:', error);
      if (refresh) {
        toast.error('Failed to update tracking information');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [order.id]);

  // Auto-refresh tracking
  useEffect(() => {
    if (!tracking && !isLoading) {
      fetchTracking();
    }

    if (autoRefresh && tracking) {
      const interval = setInterval(() => {
        fetchTracking(true);
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, tracking, isLoading, fetchTracking]);

  // Copy tracking number
  const handleCopyTrackingNumber = useCallback(async () => {
    if (tracking?.trackingNumber) {
      await navigator.clipboard.writeText(tracking.trackingNumber);
      toast.success('Tracking number copied!');
    }
  }, [tracking]);

  // Share tracking
  const handleShareTracking = useCallback(async () => {
    if (navigator.share && tracking) {
      try {
        await navigator.share({
          title: `Order Tracking - ${order.orderNumber}`,
          text: `Track your order: ${tracking.trackingNumber}`,
          url: window.location.href,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          await navigator.clipboard.writeText(window.location.href);
          toast.success('Tracking link copied to clipboard!');
        }
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Tracking link copied to clipboard!');
    }
  }, [tracking, order.orderNumber]);

  // Open carrier tracking page
  const handleOpenCarrierTracking = useCallback(() => {
    if (tracking?.carrier && tracking?.trackingNumber) {
      const carrierUrls: Record<string, string> = {
        fedex: `https://www.fedex.com/fedextrack/?tracknumbers=${tracking.trackingNumber}`,
        ups: `https://www.ups.com/track?tracknum=${tracking.trackingNumber}`,
        usps: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${tracking.trackingNumber}`,
        dhl: `https://www.dhl.com/en/express/tracking.html?AWB=${tracking.trackingNumber}`,
        bluedart: `https://www.bluedart.com/tracking/${tracking.trackingNumber}`,
        delhivery: `https://www.delhivery.com/track/package/${tracking.trackingNumber}`,
      };

      const url = carrierUrls[tracking.carrier.toLowerCase()] || '#';
      if (url !== '#') {
        window.open(url, '_blank');
      } else {
        toast.error('Carrier tracking page not available');
      }
    }
  }, [tracking]);

  // Get status icon and color
  const getStatusConfig = (status: string) => {
    const configs: Record<
      string,
      {
        icon: React.ElementType;
        color: string;
        bgColor: string;
        label: string;
      }
    > = {
      label_created: {
        icon: DocumentDuplicateIcon,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        label: 'Label Created',
      },
      pickup_scheduled: {
        icon: ClockIcon,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        label: 'Pickup Scheduled',
      },
      picked_up: {
        icon: CheckCircleIcon,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        label: 'Picked Up',
      },
      in_transit: {
        icon: TruckIcon,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        label: 'In Transit',
      },
      at_facility: {
        icon: BuildingStorefrontIcon,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        label: 'At Facility',
      },
      out_for_delivery: {
        icon: TruckIcon,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        label: 'Out for Delivery',
      },
      delivery_attempted: {
        icon: ExclamationCircleIcon,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        label: 'Delivery Attempted',
      },
      delivered: {
        icon: CheckCircleIcon,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        label: 'Delivered',
      },
      exception: {
        icon: ExclamationCircleIcon,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        label: 'Exception',
      },
      returned_to_sender: {
        icon: ArrowPathIcon,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        label: 'Returned to Sender',
      },
      lost: {
        icon: ExclamationCircleIcon,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        label: 'Lost',
      },
      damaged: {
        icon: ExclamationCircleIcon,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        label: 'Damaged',
      },
    };

    return (
      configs[status] || {
        icon: TruckIcon,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        label: status,
      }
    );
  };

  if (isLoading && !tracking) {
    return (
      <Card className={cn('p-8', className)}>
        <div className="flex flex-col items-center justify-center">
          <Spinner size="lg" />
          <p className="mt-4 text-sm text-gray-500">Loading tracking information...</p>
        </div>
      </Card>
    );
  }

  if (!tracking) {
    return (
      <Card className={cn('p-8 text-center', className)}>
        <TruckIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 mb-4">Tracking information not available yet</p>
        <Button onClick={() => fetchTracking()} variant="outline" size="sm">
          Refresh
        </Button>
      </Card>
    );
  }

  const currentStatusConfig = getStatusConfig(tracking.status);
  const CurrentStatusIcon = currentStatusConfig.icon;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Tracking Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Package Tracking</h3>
            
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Tracking Number:</span>
                <code className="text-sm font-mono font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                  {tracking.trackingNumber}
                </code>
                <Tooltip content="Copy tracking number">
                  <button
                    onClick={handleCopyTrackingNumber}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Copy tracking number"
                  >
                    <DocumentDuplicateIcon className="h-4 w-4" />
                  </button>
                </Tooltip>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Carrier:</span>
                <Badge variant="secondary" size="sm">
                  {tracking.carrier} - {tracking.service}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Tooltip content="Refresh tracking">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchTracking(true)}
                disabled={isRefreshing}
                leftIcon={<ArrowPathIcon className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />}
              />
            </Tooltip>
            <Tooltip content="Share tracking">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShareTracking}
                leftIcon={<ShareIcon className="h-4 w-4" />}
              />
            </Tooltip>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenCarrierTracking}
              leftIcon={<GlobeAltIcon className="h-4 w-4" />}
            >
              View on Carrier Site
            </Button>
          </div>
        </div>

        {/* Current Status */}
        <div className={cn('p-4 rounded-lg', currentStatusConfig.bgColor)}>
          <div className="flex items-center gap-4">
            <div className={cn('p-3 rounded-full', currentStatusConfig.bgColor)}>
              <CurrentStatusIcon className={cn('h-6 w-6', currentStatusConfig.color)} />
            </div>
            <div className="flex-1">
              <h4 className="text-base font-semibold text-gray-900">
                {currentStatusConfig.label}
              </h4>
              <p className="text-sm text-gray-600 mt-0.5">
                Last updated: {formatDate(tracking.lastUpdated, 'medium')}
              </p>
            </div>
            {tracking.estimatedDeliveryDate && (
              <div className="text-right">
                <p className="text-xs text-gray-500">Estimated Delivery</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatDate(tracking.estimatedDeliveryDate, 'medium')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Delivery Information */}
        {tracking.status === 'delivered' && tracking.actualDeliveryDate && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">
                  Delivered on {formatDate(tracking.actualDeliveryDate, 'full')}
                </p>
                {tracking.deliverySignature && (
                  <p className="text-xs text-green-700 mt-1">
                    Signed by: {tracking.deliverySignature}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Map View Toggle */}
      {showMap && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMapView(!showMapView)}
            leftIcon={<MapPinIcon className="h-4 w-4" />}
          >
            {showMapView ? 'Hide Map' : 'Show Map'}
          </Button>
        </div>
      )}

      {/* Tracking Map */}
      <AnimatePresence>
        {showMapView && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-4">
              {/* TrackingMap component not yet implemented */}
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Map view coming soon</p>
              </div>
              {/* <TrackingMap
                trackingNumber={tracking.trackingNumber}
                events={tracking.events}
                currentLocation={tracking.events[0]?.location}
                destination={order.shippingAddress}
              /> */}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tracking Timeline */}
      <Card className="p-6">
        <h4 className="text-base font-semibold text-gray-900 mb-6">Tracking History</h4>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

          {/* Timeline Events */}
          <div className="space-y-6">
            {tracking.events.map((event, index) => {
              const eventConfig = getStatusConfig(event.status);
              const EventIcon = eventConfig.icon;
              const isFirst = index === 0;

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative flex items-start gap-4"
                >
                  {/* Icon Circle */}
                  <div
                    className={cn(
                      'relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all',
                      isFirst
                        ? `${eventConfig.bgColor} border-current ring-4 ring-opacity-20`
                        : 'bg-white border-gray-300'
                    )}
                  >
                    <EventIcon
                      className={cn(
                        'h-6 w-6',
                        isFirst ? eventConfig.color : 'text-gray-400'
                      )}
                    />
                  </div>

                  {/* Event Content */}
                  <div
                    className={cn(
                      'flex-1 pb-6 cursor-pointer transition-all',
                      selectedEvent?.id === event.id && 'bg-gray-50 -m-2 p-2 rounded-lg'
                    )}
                    onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h5 className={cn('text-sm font-semibold', isFirst ? 'text-gray-900' : 'text-gray-700')}>
                        {event.description}
                      </h5>
                      <span className="text-xs text-gray-500 ml-4 whitespace-nowrap">
                        {formatDate(event.timestamp, 'short')}
                      </span>
                    </div>

                    {event.location && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <MapPinIcon className="h-3 w-3" />
                        <span>{event.location}</span>
                      </div>
                    )}

                    {event.facility && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <BuildingStorefrontIcon className="h-3 w-3" />
                        <span>{event.facility}</span>
                      </div>
                    )}

                    {selectedEvent?.id === event.id && event.nextExpectedEvent && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700"
                      >
                        <strong>Next Expected:</strong> {event.nextExpectedEvent}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Contact Information */}
      <Card className="p-4 bg-gray-50">
        <div className="flex items-start gap-3">
          <PhoneIcon className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="text-sm font-medium text-gray-900 mb-1">Need Help with Delivery?</h5>
            <p className="text-xs text-gray-600 mb-2">
              Contact our support team or the carrier directly for assistance
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="xs" onClick={() => window.location.href = '/help/contact'}>
                Contact Support
              </Button>
              <Button variant="outline" size="xs" onClick={handleOpenCarrierTracking}>
                Contact Carrier
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Last Updated */}
      <p className="text-xs text-gray-500 text-center">
        Last updated: {formatDate(lastUpdated, 'medium')}
      </p>
    </div>
  );
};

export default OrderTracking;
