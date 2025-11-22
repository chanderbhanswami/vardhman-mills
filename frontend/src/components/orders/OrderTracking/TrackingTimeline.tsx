'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
  ArrowDownTrayIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';
import type { Order } from '@/types/cart.types';

interface TrackingEvent {
  id: string;
  status: string;
  message: string;
  location?: string;
  timestamp: Date;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  details?: string;
}

interface TrackingTimelineProps {
  order: Order;
  showExport?: boolean;
  showDetails?: boolean;
  maxEvents?: number;
  className?: string;
}

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({
  order,
  showExport = true,
  showDetails = true,
  maxEvents = 10,
  className,
}) => {
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  // Toggle event details
  const toggleEventDetails = (eventId: string) => {
    setExpandedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  // Format date and time
  const formatDateTime = (date: Date | string): { date: string; time: string } => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return {
      date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    };
  };

  // Generate timeline events from order data
  const generateTimelineEvents = (): TrackingEvent[] => {
    const events: TrackingEvent[] = [];

    // Delivered
    if (order.deliveredAt) {
      events.push({
        id: 'delivered',
        status: 'Delivered',
        message: 'Package delivered successfully',
        location: `${order.shippingAddress.city}, ${order.shippingAddress.state}`,
        timestamp: new Date(order.deliveredAt),
        icon: CheckCircleIcon,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        details: order.actualDeliveryDate ? 'Delivered on time' : undefined,
      });
    }

    // Out for Delivery
    if (order.fulfillmentStatus === 'out_for_delivery') {
      const outForDeliveryTime = order.shippedAt ? new Date(new Date(order.shippedAt).getTime() + 2 * 24 * 60 * 60 * 1000) : new Date();
      events.push({
        id: 'out_for_delivery',
        status: 'Out for Delivery',
        message: 'Package is out for delivery',
        location: `${order.shippingAddress.city}, ${order.shippingAddress.state}`,
        timestamp: outForDeliveryTime,
        icon: TruckIcon,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        details: 'Expected delivery today',
      });
    }

    // In Transit
    if (order.fulfillmentStatus === 'in_transit' || order.fulfillmentStatus === 'shipped') {
      const inTransitTime = order.shippedAt ? new Date(new Date(order.shippedAt).getTime() + 1 * 24 * 60 * 60 * 1000) : new Date();
      events.push({
        id: 'in_transit',
        status: 'In Transit',
        message: 'Package is on the way',
        location: 'Distribution Center',
        timestamp: inTransitTime,
        icon: TruckIcon,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        details: order.trackingNumber ? `Tracking: ${order.trackingNumber}` : undefined,
      });
    }

    // Shipped
    if (order.shippedAt) {
      events.push({
        id: 'shipped',
        status: 'Shipped',
        message: 'Package shipped from warehouse',
        location: 'Fulfillment Center',
        timestamp: new Date(order.shippedAt),
        icon: TruckIcon,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        details: order.shippingMethod.name ? `Via ${order.shippingMethod.name}` : undefined,
      });
    }

    // Processing
    if (order.confirmedAt) {
      const processingTime = order.shippedAt 
        ? new Date(new Date(order.shippedAt).getTime() - 1 * 24 * 60 * 60 * 1000)
        : new Date(new Date(order.confirmedAt).getTime() + 12 * 60 * 60 * 1000);
      
      events.push({
        id: 'processing',
        status: 'Processing',
        message: 'Order is being prepared',
        location: 'Warehouse',
        timestamp: processingTime,
        icon: BuildingStorefrontIcon,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        details: `${order.items.length} items being packed`,
      });
    }

    // Confirmed
    if (order.confirmedAt) {
      events.push({
        id: 'confirmed',
        status: 'Confirmed',
        message: 'Order confirmed and payment received',
        timestamp: new Date(order.confirmedAt),
        icon: CheckCircleIcon,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        details: order.paymentMethod.type ? `Paid via ${order.paymentMethod.type}` : 'Payment confirmed',
      });
    }

    // Placed
    events.push({
      id: 'placed',
      status: 'Order Placed',
      message: 'Order successfully placed',
      timestamp: new Date(order.createdAt),
      icon: ClockIcon,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      details: `Order #${order.orderNumber}`,
    });

    // Cancelled
    if (order.cancelledAt) {
      events.push({
        id: 'cancelled',
        status: 'Cancelled',
        message: 'Order was cancelled',
        timestamp: new Date(order.cancelledAt),
        icon: MapPinIcon,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        details: 'Order processing stopped',
      });
    }

    // Sort by timestamp (newest first)
    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  // Export timeline
  const handleExportTimeline = () => {
    const events = generateTimelineEvents();
    const content = events.map(event => {
      const { date, time } = formatDateTime(event.timestamp);
      return `${date} ${time} - ${event.status}: ${event.message}${event.location ? ` (${event.location})` : ''}`;
    }).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-${order.orderNumber}-timeline.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const timelineEvents = generateTimelineEvents();
  const displayedEvents = showAll ? timelineEvents : timelineEvents.slice(0, maxEvents);
  const hasMoreEvents = timelineEvents.length > maxEvents;

  return (
    <Card className={cn('p-6', className)}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Tracking Timeline</h3>
            <p className="text-sm text-gray-600 mt-0.5">
              {timelineEvents.length} event{timelineEvents.length !== 1 ? 's' : ''} recorded
            </p>
          </div>
          {showExport && (
            <Tooltip content="Export timeline">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportTimeline}
                leftIcon={<ArrowDownTrayIcon className="h-4 w-4" />}
              >
                Export
              </Button>
            </Tooltip>
          )}
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

          {/* Events */}
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {displayedEvents.map((event, index) => {
                const { date, time } = formatDateTime(event.timestamp);
                const isExpanded = expandedEvents.has(event.id);
                const hasDetails = !!event.details || showDetails;

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="relative pl-16"
                  >
                    {/* Icon */}
                    <div className={cn('absolute left-3 -translate-x-1/2 rounded-full p-2', event.bgColor)}>
                      <event.icon className={cn('h-5 w-5', event.color)} />
                    </div>

                    {/* Content */}
                    <div className={cn(
                      'bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors',
                      hasDetails && 'cursor-pointer'
                    )}
                    onClick={() => hasDetails && toggleEventDetails(event.id)}
                    >
                      {/* Event Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" size="sm">
                              {event.status}
                            </Badge>
                            {index === 0 && (
                              <Badge variant="info" size="sm">
                                Latest
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-900">{event.message}</p>
                          {event.location && (
                            <div className="flex items-center gap-1 mt-1">
                              <MapPinIcon className="h-3.5 w-3.5 text-gray-400" />
                              <p className="text-xs text-gray-600">{event.location}</p>
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{date}</p>
                          <p className="text-xs text-gray-600 mt-0.5">{time}</p>
                        </div>
                      </div>

                      {/* Expandable Details */}
                      {hasDetails && (
                        <motion.div
                          initial={false}
                          animate={{ height: isExpanded ? 'auto' : 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          {isExpanded && event.details && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-sm text-gray-600">{event.details}</p>
                            </div>
                          )}
                        </motion.div>
                      )}

                      {/* Expand indicator */}
                      {hasDetails && (
                        <div className="flex justify-center mt-2">
                          {isExpanded ? (
                            <ChevronUpIcon className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Show More/Less */}
        {hasMoreEvents && (
          <div className="flex justify-center pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              rightIcon={showAll ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
            >
              {showAll ? 'Show Less' : `Show ${timelineEvents.length - maxEvents} More Events`}
            </Button>
          </div>
        )}

        {/* Real-time updates notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <ClockIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900">Real-time Tracking</p>
              <p className="text-blue-700 mt-1">
                Timeline updates automatically as your package moves. Check back for the latest status.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </Card>
  );
};
