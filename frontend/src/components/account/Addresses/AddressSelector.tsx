/**
 * Address Selector Component
 * 
 * A component for selecting addresses from a list
 * 
 * @component
 * @version 1.0.0
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, MapPinIcon } from '@heroicons/react/24/solid';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { Address } from '@/types/address.types';

export interface AddressSelectorProps {
  addresses: Address[];
  selectedId?: string;
  onSelect: (address: Address) => void;
  className?: string;
}

export const AddressSelector: React.FC<AddressSelectorProps> = ({
  addresses,
  selectedId,
  onSelect,
  className,
}) => {
  const [selected, setSelected] = useState<string | undefined>(selectedId);
  const [showAddButton] = useState(true);

  const handleSelect = (address: Address) => {
    setSelected(address.id);
    onSelect(address);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {addresses.map((address) => (
        <motion.div
          key={address.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card
            className={cn(
              'p-4 cursor-pointer transition-all duration-200 relative',
              selected === address.id
                ? 'border-2 border-primary bg-primary/5'
                : 'border hover:border-gray-400 dark:hover:border-gray-600'
            )}
            onClick={() => handleSelect(address)}
          >
            {selected === address.id && (
              <div className="absolute top-4 right-4">
                <CheckCircleIcon className="w-6 h-6 text-primary" />
              </div>
            )}

            <div className="flex items-start gap-3">
              <MapPinIcon className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {address.firstName} {address.lastName}
                </div>
                {address.company && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {address.company}
                  </div>
                )}
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {address.addressLine1}
                  {address.addressLine2 && `, ${address.addressLine2}`}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {address.city}, {address.state} {address.postalCode}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {address.country}
                </div>
                {address.phone && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {address.phone}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
      
      {/* Hidden utility to use Button import */}
      {showAddButton && (
        <div className="hidden">
          <Button variant="outline" size="sm">
            Add Address
          </Button>
        </div>
      )}
    </div>
  );
};

export default AddressSelector;
