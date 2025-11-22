/**
 * AddressCard Component
 * 
 * Displays address information in a card format with actions
 * for editing, deleting, and setting as default.
 * 
 * Features:
 * - Address display with formatting
 * - Default address indication
 * - Edit and delete actions
 * - Delivery type badges
 * - Address validation status
 * - Quick actions menu
 * - Responsive design
 * - Animation support
 * 
 * @component
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPinIcon,
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  CheckIcon,
  StarIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  HomeIcon,
  TruckIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import {
  MapPinIcon as MapPinSolidIcon,
  StarIcon as StarSolidIcon,
} from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { cn } from '@/lib/utils';
import { formatAddress } from '@/lib/format';
import { Address } from '@/types/user.types';

// Types
export interface AddressCardProps {
  /** Address data */
  address: Address;
  /** Is this the default address */
  isDefault?: boolean;
  /** Show actions */
  showActions?: boolean;
  /** Card variant */
  variant?: 'default' | 'compact' | 'detailed';
  /** Selection mode */
  selectable?: boolean;
  /** Selected state */
  isSelected?: boolean;
  /** Edit handler */
  onEdit?: (address: Address) => void;
  /** Delete handler */
  onDelete?: (addressId: string) => void;
  /** Set default handler */
  onSetDefault?: (addressId: string) => void;
  /** Select handler */
  onSelect?: (address: Address) => void;
  /** Additional CSS classes */
  className?: string;
}

interface AddressAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  handler: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

export const AddressCard: React.FC<AddressCardProps> = ({
  address,
  isDefault = false,
  showActions = true,
  variant = 'default',
  selectable = false,
  isSelected = false,
  onEdit,
  onDelete,
  onSetDefault,
  onSelect,
  className,
}) => {
  // State
  const [showDropdown, setShowDropdown] = useState(false);

  // Address type configuration
  const addressTypeConfig = {
    home: {
      label: 'Home',
      icon: HomeIcon,
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
    },
    work: {
      label: 'Work',
      icon: BuildingOfficeIcon,
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300',
    },
    other: {
      label: 'Other',
      icon: MapPinIcon,
      color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    },
  };

  // Get address type config
  const typeConfig = addressTypeConfig[address.type as keyof typeof addressTypeConfig] || addressTypeConfig.other;
  const TypeIcon = typeConfig.icon;

  // Actions configuration
  const actions: AddressAction[] = [
    {
      id: 'edit',
      label: 'Edit Address',
      icon: PencilIcon,
      handler: () => onEdit?.(address),
      disabled: !onEdit,
    },
    {
      id: 'setDefault',
      label: isDefault ? 'Default Address' : 'Set as Default',
      icon: isDefault ? CheckIcon : StarIcon,
      handler: () => !isDefault && onSetDefault?.(address.id),
      disabled: isDefault || !onSetDefault,
    },
    {
      id: 'delete',
      label: 'Delete Address',
      icon: TrashIcon,
      handler: () => onDelete?.(address.id),
      variant: 'danger',
      disabled: !onDelete || isDefault, // Prevent deleting default address
    },
  ];

  // Handlers
  const handleCardClick = () => {
    if (selectable && onSelect) {
      onSelect(address);
    }
  };

  const handleActionClick = (action: AddressAction, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!action.disabled) {
      action.handler();
      setShowDropdown(false);
    }
  };

  // Format full address
  const fullAddress = formatAddress(address, {
    multiline: false,
    includePhone: false,
    includeType: false,
    short: false,
  });

  // Delivery info
  const deliveryInfo = {
    isServiceable: address.isServiceable ?? true,
    estimatedDelivery: address.deliveryInstructions ? 'Special instructions' : '2-3 business days',
    lastUsed: address.lastUsedAt ? new Date(address.lastUsedAt) : null,
  };

  // Card classes
  const cardClasses = cn(
    'relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-200',
    {
      'p-4': variant === 'default',
      'p-3': variant === 'compact',
      'p-6': variant === 'detailed',
      'cursor-pointer hover:border-primary-300 hover:shadow-md': selectable,
      'border-primary-300 bg-primary-50 dark:bg-primary-900/10 dark:border-primary-700': isSelected,
      'border-primary-400 shadow-md': isDefault && !selectable,
      'hover:shadow-sm': !selectable && !isDefault,
    },
    className
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cardClasses}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Address Type */}
          <div className={cn('flex items-center gap-1 px-2 py-1 text-xs rounded-full', typeConfig.color)}>
            <TypeIcon className="w-3 h-3" />
            <span className="font-medium">{typeConfig.label}</span>
          </div>

          {/* Default Badge */}
          {isDefault && (
            <Badge variant="default" size="sm" className="gap-1">
              <StarSolidIcon className="w-3 h-3" />
              Default
            </Badge>
          )}

          {/* Selection Indicator */}
          {selectable && isSelected && (
            <div className="flex items-center justify-center w-5 h-5 bg-primary-600 rounded-full">
              <CheckIcon className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        {/* Actions Menu */}
        {showActions && !selectable && (
          <DropdownMenu
            trigger={
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown(!showDropdown);
                }}
              >
                <EllipsisVerticalIcon className="w-4 h-4" />
              </Button>
            }
            items={actions.map(action => ({
              key: action.id,
              label: action.label,
              icon: action.icon,
              onClick: () => handleActionClick(action, {} as React.MouseEvent),
              disabled: action.disabled,
              variant: action.variant as 'default' | 'danger',
            }))}
          />
        )}
      </div>

      {/* Address Details */}
      <div className="space-y-2">
        {/* Name */}
        {address.name && (
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {address.name}
          </div>
        )}

        {/* Full Address */}
        <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {fullAddress}
        </div>

        {/* Phone Number */}
        {address.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <PhoneIcon className="w-4 h-4" />
            <span>{address.phone}</span>
          </div>
        )}

        {/* Landmark */}
        {address.landmark && variant !== 'compact' && (
          <div className="text-sm text-gray-500 dark:text-gray-500">
            Near: {address.landmark}
          </div>
        )}

        {/* Delivery Instructions */}
        {address.deliveryInstructions && variant === 'detailed' && (
          <div className="text-sm text-gray-500 dark:text-gray-500 italic">
            &quot;{address.deliveryInstructions}&quot;
          </div>
        )}
      </div>

      {/* Footer Info */}
      {variant !== 'compact' && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            {/* Delivery Status */}
            <div className="flex items-center gap-4">
              {deliveryInfo.isServiceable ? (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <TruckIcon className="w-3 h-3" />
                  <span>Serviceable</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                  <TruckIcon className="w-3 h-3" />
                  <span>Not serviceable</span>
                </div>
              )}

              {deliveryInfo.lastUsed && (
                <div className="flex items-center gap-1">
                  <ClockIcon className="w-3 h-3" />
                  <span>
                    Last used: {deliveryInfo.lastUsed.toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* GPS Coordinates (if available) */}
            {address.coordinates && variant === 'detailed' && (
              <div className="flex items-center gap-1">
                <MapPinSolidIcon className="w-3 h-3" />
                <span className="font-mono">
                  {address.coordinates.latitude.toFixed(4)}, {address.coordinates.longitude.toFixed(4)}
                </span>
              </div>
            )}
          </div>

          {/* Estimated Delivery */}
          {variant === 'detailed' && deliveryInfo.isServiceable && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Estimated delivery: {deliveryInfo.estimatedDelivery}
            </div>
          )}
        </div>
      )}

      {/* Quick Actions (for compact variant) */}
      {variant === 'compact' && showActions && (
        <div className="mt-3 flex items-center gap-2">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(address);
              }}
              className="h-8 px-2"
            >
              <PencilIcon className="w-3 h-3 mr-1" />
              Edit
            </Button>
          )}

          {onSetDefault && !isDefault && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSetDefault(address.id);
              }}
              className="h-8 px-2"
            >
              <StarIcon className="w-3 h-3 mr-1" />
              Default
            </Button>
          )}
        </div>
      )}

      {/* Validation Status */}
      {address.isValidated === false && (
        <div className="absolute top-2 right-2">
          <Badge variant="destructive" size="sm">
            Unverified
          </Badge>
        </div>
      )}
    </motion.div>
  );
};

export default AddressCard;