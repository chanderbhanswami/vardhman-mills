'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useClickOutside } from '@/hooks/common/useClickOutside';

export interface DropdownMenuItem {
  key: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  destructive?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  align?: 'start' | 'end' | 'center';
  className?: string;
  onOpenChange?: (open: boolean) => void;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  items,
  align = 'start',
  className,
  onOpenChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  // useClickOutside hook returns a ref when provided a handler and options
  const dropdownRef = useClickOutside<HTMLDivElement>(
    () => {
      setIsOpen(false);
      onOpenChange?.(false);
    },
    { enabled: isOpen }
  );

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onOpenChange?.(newState);
  };

  const handleItemClick = (item: DropdownMenuItem) => {
    if (!item.disabled) {
      item.onClick?.();
      setIsOpen(false);
      onOpenChange?.(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={handleToggle}>
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className={clsx(
              'absolute z-50 mt-1 min-w-48 bg-white rounded-md shadow-lg border border-gray-200',
              'focus:outline-none',
              align === 'start' && 'left-0',
              align === 'end' && 'right-0',
              align === 'center' && 'left-1/2 transform -translate-x-1/2',
              className
            )}
          >
            <div className="py-1">
              {items.map((item) => {
                const IconComponent = item.icon;
                
                return (
                  <button
                    key={item.key}
                    className={clsx(
                      'w-full flex items-center px-4 py-2 text-sm text-left',
                      'hover:bg-gray-100 transition-colors',
                      item.destructive && 'text-red-600 hover:bg-red-50',
                      item.disabled && 'text-gray-400 cursor-not-allowed hover:bg-transparent'
                    )}
                    onClick={() => handleItemClick(item)}
                    disabled={item.disabled}
                  >
                    {IconComponent && (
                      <IconComponent className="w-4 h-4 mr-3" />
                    )}
                    {item.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DropdownMenu;