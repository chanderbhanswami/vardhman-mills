'use client';

import React, { useState } from 'react';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CreditCardIcon,
  TruckIcon,
  CalendarDaysIcon,
  ClockIcon,
  TagIcon,
  CurrencyDollarIcon,
  IdentificationIcon,
  BuildingStorefrontIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/Badge';
import { Divider } from '@/components/ui/Divider';
import { Card } from '@/components/ui/Card';
import { Tooltip } from '@/components/ui/Tooltip';
import type { Order } from '@/types/order.types';
import { formatCurrency, formatDate, formatPhoneNumber } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { PAYMENT_STATUS } from '@/constants/order.constants';
import type { Price } from '@/types/common.types';

// Helper to get numeric amount from Price object
const getPriceAmount = (price: Price | number): number => {
  if (typeof price === 'number') return price;
  return price.amount;
};

interface OrderInfoProps {
  order: Order;
  className?: string;
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
  className?: string;
  copyable?: boolean;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value, className, copyable }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (typeof value === 'string') {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={cn('flex items-start gap-3', className)}>
      <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900 break-words">{value}</p>
          {copyable && (
            <button
              onClick={handleCopy}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const OrderInfo: React.FC<OrderInfoProps> = ({ order, className }) => {
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case PAYMENT_STATUS.PAID:
        return 'success';
      case PAYMENT_STATUS.PENDING:
      case PAYMENT_STATUS.PROCESSING:
        return 'warning';
      case PAYMENT_STATUS.FAILED:
      case PAYMENT_STATUS.CANCELLED:
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Order Summary Card */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <IdentificationIcon className="h-5 w-5 text-gray-600" />
          Order Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem
            icon={<TagIcon className="h-4 w-4 text-gray-600" />}
            label="Order Number"
            value={order.orderNumber}
            copyable
          />

          <InfoItem
            icon={<CalendarDaysIcon className="h-4 w-4 text-gray-600" />}
            label="Order Date"
            value={formatDate(order.createdAt, 'medium')}
          />

          <InfoItem
            icon={<CurrencyDollarIcon className="h-4 w-4 text-gray-600" />}
            label="Total Amount"
            value={formatCurrency(getPriceAmount(order.total))}
          />

          <InfoItem
            icon={<ClockIcon className="h-4 w-4 text-gray-600" />}
            label="Last Updated"
            value={formatDate(order.updatedAt, 'medium')}
          />

          {order.estimatedDeliveryDate && (
            <InfoItem
              icon={<TruckIcon className="h-4 w-4 text-gray-600" />}
              label="Estimated Delivery"
              value={formatDate(order.estimatedDeliveryDate, 'short')}
            />
          )}

          {order.deliveredAt && (
            <InfoItem
              icon={<TruckIcon className="h-4 w-4 text-green-600" />}
              label="Delivered On"
              value={formatDate(order.deliveredAt, 'medium')}
            />
          )}
        </div>
      </Card>

      {/* Customer Information Card */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <UserIcon className="h-5 w-5 text-gray-600" />
          Customer Information
        </h3>

        <div className="space-y-4">
          <InfoItem
            icon={<UserIcon className="h-4 w-4 text-gray-600" />}
            label="Name"
            value={
              order.user?.firstName && order.user?.lastName
                ? `${order.user.firstName} ${order.user.lastName}`
                : `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
            }
          />

          {order.user?.email && (
            <InfoItem
              icon={<EnvelopeIcon className="h-4 w-4 text-gray-600" />}
              label="Email"
              value={order.user.email}
              copyable
            />
          )}

          {order.user?.phone && (
            <InfoItem
              icon={<PhoneIcon className="h-4 w-4 text-gray-600" />}
              label="Phone"
              value={formatPhoneNumber(order.user.phone)}
              copyable
            />
          )}

          {order.user?.id && (
            <InfoItem
              icon={<IdentificationIcon className="h-4 w-4 text-gray-600" />}
              label="Customer ID"
              value={order.user.id}
              copyable
            />
          )}
        </div>
      </Card>

      {/* Shipping Address Card */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPinIcon className="h-5 w-5 text-gray-600" />
          Shipping Address
        </h3>

        {order.shippingAddress ? (
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900 mb-2">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {order.shippingAddress.addressLine1}
                <br />
                {order.shippingAddress.addressLine2 && (
                  <>
                    {order.shippingAddress.addressLine2}
                    <br />
                  </>
                )}
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.postalCode}
                <br />
                {order.shippingAddress.country}
              </p>
              {order.shippingAddress.phone && (
                <p className="text-sm text-gray-600 mt-2">
                  <PhoneIcon className="h-3.5 w-3.5 inline mr-1" />
                  {formatPhoneNumber(order.shippingAddress.phone)}
                </p>
              )}
            </div>

            {order.shippingMethod && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <TruckIcon className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    {order.shippingMethod.name}
                  </span>
                </div>
                <span className="text-sm text-blue-700">
                  {getPriceAmount(order.shippingMethod.price) > 0
                    ? formatCurrency(getPriceAmount(order.shippingMethod.price))
                    : 'FREE'}
                </span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No shipping address provided</p>
        )}
      </Card>

      {/* Billing Address Card */}
      {order.billingAddress && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BuildingStorefrontIcon className="h-5 w-5 text-gray-600" />
            Billing Address
          </h3>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900 mb-2">
              {order.billingAddress.firstName} {order.billingAddress.lastName}
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              {order.billingAddress.addressLine1}
              <br />
              {order.billingAddress.addressLine2 && (
                <>
                  {order.billingAddress.addressLine2}
                  <br />
                </>
              )}
              {order.billingAddress.city}, {order.billingAddress.state}{' '}
              {order.billingAddress.postalCode}
              <br />
              {order.billingAddress.country}
            </p>
            {order.billingAddress.phone && (
              <p className="text-sm text-gray-600 mt-2">
                <PhoneIcon className="h-3.5 w-3.5 inline mr-1" />
                {formatPhoneNumber(order.billingAddress.phone)}
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Payment Information Card */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCardIcon className="h-5 w-5 text-gray-600" />
          Payment Information
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Payment Method</span>
            <div className="flex items-center gap-2">
              <CreditCardIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-900 capitalize">
                              <p className="text-sm text-gray-600">
                {order.paymentMethod?.provider || order.paymentMethod?.type || 'N/A'}
              </p>
              </span>
            </div>
          </div>

          <Divider />

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Payment Status</span>
            <Badge
              variant={
                getPaymentStatusColor(order.paymentStatus as string) as
                  | 'default'
                  | 'success'
                  | 'warning'
                  | 'destructive'
                  | 'info'
              }
              size="sm"
            >
              {order.paymentStatus?.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          {order.paymentIntentId && (
            <>
              <Divider />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Payment ID</span>
                <Tooltip content="Click to copy">
                  <button
                    onClick={() => navigator.clipboard.writeText(order.paymentIntentId!)}
                    className="text-sm font-mono text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    {order.paymentIntentId.substring(0, 20)}...
                  </button>
                </Tooltip>
              </div>
            </>
          )}

          {order.transactionId && (
            <>
              <Divider />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Transaction ID</span>
                <span className="text-sm font-mono text-gray-900">{order.transactionId}</span>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Additional Information Card */}
      {order.customerNotes && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <GlobeAltIcon className="h-5 w-5 text-gray-600" />
            Additional Information
          </h3>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Customer Notes</p>
              <p className="text-sm text-gray-900 p-3 bg-gray-50 rounded-lg">
                {order.customerNotes}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Order Tags */}
      {order.tags && order.tags.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {order.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default OrderInfo;
