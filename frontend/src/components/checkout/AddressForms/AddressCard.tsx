'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  PhoneIcon,
  CheckCircleIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
} from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { UserAddress } from '@/types/address.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface AddressCardProps {
  /**
   * Address data
   */
  address: UserAddress;

  /**
   * Whether this address is selected
   */
  isSelected?: boolean;

  /**
   * Whether card is selectable
   */
  selectable?: boolean;

  /**
   * Whether to show action buttons
   */
  showActions?: boolean;

  /**
   * Whether to show verification badge
   */
  showVerification?: boolean;

  /**
   * Callback when address is selected
   */
  onSelect?: (addressId: string) => void;

  /**
   * Callback when edit is clicked
   */
  onEdit?: (address: UserAddress) => void;

  /**
   * Callback when delete is clicked
   */
  onDelete?: (addressId: string) => void;

  /**
   * Callback when set as default is clicked
   */
  onSetDefault?: (addressId: string) => void;

  /**
   * Compact mode
   */
  compact?: boolean;

  /**
   * Show phone number
   */
  showPhone?: boolean;

  /**
   * Show delivery instructions
   */
  showInstructions?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get address type icon
 */
const getAddressTypeIcon = (type: UserAddress['type']) => {
  switch (type) {
    case 'home':
      return HomeIcon;
    case 'office':
    case 'business':
      return BuildingOfficeIcon;
    default:
      return MapPinIcon;
  }
};

/**
 * Get address type label
 */
const getAddressTypeLabel = (type: UserAddress['type']): string => {
  const labels: Record<UserAddress['type'], string> = {
    home: 'Home',
    office: 'Office',
    apartment: 'Apartment',
    business: 'Business',
    po_box: 'P.O. Box',
    hotel: 'Hotel',
    other: 'Other',
  };
  return labels[type] || 'Address';
};

/**
 * Format full name
 */
const formatFullName = (address: UserAddress): string => {
  return `${address.firstName} ${address.lastName}`.trim();
};

/**
 * Format address for display
 */
const formatAddress = (address: UserAddress): string[] => {
  const lines: string[] = [];

  if (address.company) {
    lines.push(address.company);
  }

  lines.push(address.addressLine1);

  if (address.addressLine2) {
    lines.push(address.addressLine2);
  }

  if (address.landmark) {
    lines.push(`Landmark: ${address.landmark}`);
  }

  lines.push(`${address.city}, ${address.state} ${address.postalCode}`);

  lines.push(address.country);

  return lines;
};

/**
 * Get validation status color
 */
const getValidationStatusColor = (status: UserAddress['validationStatus']): string => {
  const colors: Record<UserAddress['validationStatus'], string> = {
    valid: 'text-green-600 bg-green-50',
    invalid: 'text-red-600 bg-red-50',
    unverified: 'text-gray-600 bg-gray-50',
    requires_correction: 'text-yellow-600 bg-yellow-50',
    delivery_failed: 'text-red-600 bg-red-50',
  };
  return colors[status] || 'text-gray-600 bg-gray-50';
};

/**
 * Get validation status label
 */
const getValidationStatusLabel = (status: UserAddress['validationStatus']): string => {
  const labels: Record<UserAddress['validationStatus'], string> = {
    valid: 'Verified',
    invalid: 'Invalid',
    unverified: 'Unverified',
    requires_correction: 'Needs Correction',
    delivery_failed: 'Delivery Failed',
  };
  return labels[status] || 'Unknown';
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * AddressCard Component
 * 
 * Display card for a user address with selection, editing, and actions.
 * Features:
 * - Address type icon and label
 * - Full contact information
 * - Formatted address display
 * - Phone number (optional)
 * - Delivery instructions (optional)
 * - Default badge
 * - Verification badge
 * - Selectable with radio button
 * - Edit and delete actions
 * - Set as default action
 * - Compact mode
 * - Selected state styling
 * - Hover effects
 * - Responsive design
 * 
 * @example
 * ```tsx
 * <AddressCard
 *   address={userAddress}
 *   isSelected={selectedId === address.id}
 *   selectable={true}
 *   showActions={true}
 *   onSelect={handleSelect}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   onSetDefault={handleSetDefault}
 * />
 * ```
 */
export const AddressCard: React.FC<AddressCardProps> = ({
  address,
  isSelected = false,
  selectable = false,
  showActions = false,
  showVerification = true,
  onSelect,
  onEdit,
  onDelete,
  onSetDefault,
  compact = false,
  showPhone = true,
  showInstructions = true,
  className,
}) => {
  const TypeIcon = getAddressTypeIcon(address.type);
  const addressLines = formatAddress(address);
  const fullName = formatFullName(address);

  const handleCardClick = () => {
    if (selectable && onSelect) {
      onSelect(address.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(address);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(address.id);
    }
  };

  const handleSetDefault = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSetDefault) {
      onSetDefault(address.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        onClick={handleCardClick}
        className={cn(
          'relative p-4 transition-all duration-200',
          selectable && 'cursor-pointer hover:shadow-md',
          isSelected && 'ring-2 ring-primary-500 shadow-md',
          !isSelected && selectable && 'hover:border-primary-300',
          compact && 'p-3',
          className
        )}
      >
        {/* Selection Radio Button */}
        {selectable && (
          <div className="absolute top-4 right-4">
            <div
              className={cn(
                'h-5 w-5 rounded-full border-2 transition-all',
                isSelected
                  ? 'border-primary-600 bg-primary-600'
                  : 'border-gray-300 bg-white'
              )}
            >
              {isSelected && (
                <CheckCircleIconSolid className="h-full w-full text-white" />
              )}
            </div>
          </div>
        )}

        {/* Default Badge */}
        {address.isDefault && (
          <div className="absolute top-4 left-4">
            <Badge variant="default" className="flex items-center gap-1">
              <StarIconSolid className="h-3 w-3" />
              Default
            </Badge>
          </div>
        )}

        <div className={cn('space-y-3', (address.isDefault || selectable) && 'mt-6')}>
          {/* Header: Type Icon and Label */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <TypeIcon className="h-5 w-5 text-gray-500" />
              <div>
                <h3 className={cn('font-semibold text-gray-900', compact && 'text-sm')}>
                  {address.label || getAddressTypeLabel(address.type)}
                </h3>
                {!compact && (
                  <p className="text-sm text-gray-500">{getAddressTypeLabel(address.type)}</p>
                )}
              </div>
            </div>

            {/* Verification Badge */}
            {showVerification && address.isVerified && (
              <Badge
                variant="success"
                className={cn(
                  'flex items-center gap-1',
                  compact && 'text-xs px-2 py-0.5'
                )}
              >
                <CheckCircleIcon className="h-3 w-3" />
                Verified
              </Badge>
            )}
          </div>

          {/* Name and Company */}
          <div>
            <p className={cn('font-medium text-gray-900', compact && 'text-sm')}>{fullName}</p>
            {address.company && (
              <p className={cn('text-gray-600', compact ? 'text-xs' : 'text-sm')}>
                {address.company}
              </p>
            )}
          </div>

          {/* Address Lines */}
          <div className={cn('text-gray-700', compact ? 'text-xs' : 'text-sm')}>
            {addressLines.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>

          {/* Phone Number */}
          {showPhone && address.phone && (
            <div className="flex items-center gap-2 text-gray-700">
              <PhoneIcon className="h-4 w-4 text-gray-400" />
              <span className={cn(compact ? 'text-xs' : 'text-sm')}>{address.phone}</span>
            </div>
          )}

          {/* Email */}
          {address.email && (
            <div className={cn('text-gray-600', compact ? 'text-xs' : 'text-sm')}>
              <span>Email: {address.email}</span>
            </div>
          )}

          {/* Delivery Instructions */}
          {showInstructions && address.deliveryInstructions && (
            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-600 mb-1">Delivery Instructions:</p>
              <p className="text-xs text-gray-700">{address.deliveryInstructions}</p>
            </div>
          )}

          {/* Special Instructions */}
          {showInstructions && address.specialInstructions && (
            <div className={!address.deliveryInstructions ? 'pt-2 border-t border-gray-200' : ''}>
              <p className="text-xs font-medium text-gray-600 mb-1">Special Instructions:</p>
              <p className="text-xs text-gray-700">{address.specialInstructions}</p>
            </div>
          )}

          {/* Validation Status (if not verified) */}
          {showVerification && !address.isVerified && address.validationStatus !== 'unverified' && (
            <div className="pt-2 border-t border-gray-200">
              <Badge
                className={cn(
                  'text-xs',
                  getValidationStatusColor(address.validationStatus)
                )}
              >
                {getValidationStatusLabel(address.validationStatus)}
              </Badge>
              {address.validationNotes && (
                <p className="text-xs text-gray-600 mt-1">{address.validationNotes}</p>
              )}
            </div>
          )}

          {/* Usage Stats */}
          {!compact && address.usageCount > 0 && (
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Used {address.usageCount} times</span>
              {address.lastUsedAt && (
                <span>
                  Last used: {new Date(address.lastUsedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {showActions && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
              {/* Set as Default Button */}
              {!address.isDefault && onSetDefault && (
                <Button
                  onClick={handleSetDefault}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <StarIcon className="h-4 w-4" />
                  Set as Default
                </Button>
              )}

              {/* Edit Button */}
              {onEdit && (
                <Button
                  onClick={handleEdit}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <PencilIcon className="h-4 w-4" />
                  Edit
                </Button>
              )}

              {/* Delete Button */}
              {onDelete && (
                <Button
                  onClick={handleDelete}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default AddressCard;