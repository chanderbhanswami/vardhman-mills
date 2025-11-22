'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

// Types
export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export interface AccordionProps {
  items: AccordionItem[];
  type?: 'single' | 'multiple';
  collapsible?: boolean;
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  className?: string;
  itemClassName?: string;
  triggerClassName?: string;
  contentClassName?: string;
  iconPosition?: 'left' | 'right';
  animated?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'bordered' | 'filled' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

// Accordion Context
interface AccordionContextType {
  openItems: string[];
  toggleItem: (itemId: string) => void;
  type: 'single' | 'multiple';
  animated: boolean;
}

const AccordionContext = React.createContext<AccordionContextType | null>(null);

const useAccordion = () => {
  const context = React.useContext(AccordionContext);
  if (!context) {
    throw new Error('useAccordion must be used within an Accordion');
  }
  return context;
};

// Accordion Item Component
interface AccordionItemComponentProps {
  item: AccordionItem;
  iconPosition: 'left' | 'right';
  triggerClassName?: string;
  contentClassName?: string;
  variant: 'default' | 'bordered' | 'filled' | 'ghost';
  size: 'sm' | 'md' | 'lg';
}

const AccordionItemComponent: React.FC<AccordionItemComponentProps> = ({
  item,
  iconPosition,
  triggerClassName,
  contentClassName,
  variant,
  size,
}) => {
  const { openItems, toggleItem, animated } = useAccordion();
  const isOpen = openItems.includes(item.id);
  const contentRef = useRef<HTMLDivElement>(null);

  const variantStyles = {
    default: 'border-b border-gray-200 last:border-b-0',
    bordered: 'border border-gray-200 rounded-lg mb-2 last:mb-0',
    filled: 'bg-gray-50 rounded-lg mb-2 last:mb-0',
    ghost: 'mb-2 last:mb-0',
  };

  const sizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const paddingStyles = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const iconSizeStyles = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const handleToggle = () => {
    if (!item.disabled) {
      toggleItem(item.id);
    }
  };

  const contentVariants = {
    closed: { 
      height: 0, 
      opacity: 0
    },
    open: { 
      height: 'auto', 
      opacity: 1
    },
  };

  const iconVariants = {
    closed: { 
      rotate: iconPosition === 'right' ? 0 : -90
    },
    open: { 
      rotate: iconPosition === 'right' ? 180 : 0
    },
  };

  const Icon = iconPosition === 'right' ? ChevronDownIcon : ChevronRightIcon;

  return (
    <div
      className={cn(
        variantStyles[variant],
        item.className,
        item.disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <button
        type="button"
        onClick={handleToggle}
        disabled={item.disabled}
        className={cn(
          'w-full flex items-center justify-between text-left transition-colors duration-200',
          paddingStyles[size],
          sizeStyles[size],
          'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          iconPosition === 'left' && 'flex-row-reverse justify-end gap-3',
          item.disabled && 'cursor-not-allowed',
          triggerClassName
        )}
        {...(isOpen !== undefined && { 'aria-expanded': isOpen })}
        {...(item.id && { 'aria-controls': `accordion-content-${item.id}` })}
      >
        <span className="font-medium flex-1">{item.title}</span>
        {animated ? (
          <motion.div
            variants={iconVariants}
            animate={isOpen ? 'open' : 'closed'}
            transition={{ duration: 0.2 }}
          >
            <Icon className={cn(iconSizeStyles[size], 'text-gray-500')} />
          </motion.div>
        ) : (
          <Icon 
            className={cn(
              iconSizeStyles[size], 
              'text-gray-500 transition-transform duration-200',
              isOpen && iconPosition === 'right' && 'rotate-180',
              isOpen && iconPosition === 'left' && 'rotate-90'
            )} 
          />
        )}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            ref={contentRef}
            id={`accordion-content-${item.id}`}
            variants={animated ? contentVariants : undefined}
            initial={animated ? 'closed' : undefined}
            animate={animated ? 'open' : undefined}
            exit={animated ? 'closed' : undefined}
            className="overflow-hidden"
          >
            <div
              className={cn(
                paddingStyles[size],
                'pt-0 text-gray-600',
                contentClassName
              )}
            >
              {item.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Main Accordion Component
export const Accordion: React.FC<AccordionProps> = ({
  items,
  type = 'single',
  collapsible = true,
  defaultValue,
  value,
  onValueChange,
  className,
  itemClassName,
  triggerClassName,
  contentClassName,
  iconPosition = 'right',
  animated = true,
  disabled = false,
  variant = 'default',
  size = 'md',
}) => {
  // State management for controlled/uncontrolled behavior
  const [internalOpenItems, setInternalOpenItems] = useState<string[]>(() => {
    if (defaultValue) {
      return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
    }
    return [];
  });

  const openItems = value ? (Array.isArray(value) ? value : [value]) : internalOpenItems;

  const toggleItem = (itemId: string) => {
    if (disabled) return;

    let newOpenItems: string[];

    if (type === 'single') {
      if (openItems.includes(itemId)) {
        newOpenItems = collapsible ? [] : [itemId];
      } else {
        newOpenItems = [itemId];
      }
    } else {
      if (openItems.includes(itemId)) {
        newOpenItems = openItems.filter(id => id !== itemId);
      } else {
        newOpenItems = [...openItems, itemId];
      }
    }

    if (!value) {
      setInternalOpenItems(newOpenItems);
    }

    if (onValueChange) {
      if (type === 'single') {
        onValueChange(newOpenItems.length > 0 ? newOpenItems[0] : '');
      } else {
        onValueChange(newOpenItems);
      }
    }
  };

  const contextValue: AccordionContextType = {
    openItems,
    toggleItem,
    type,
    animated,
  };

  return (
    <AccordionContext.Provider value={contextValue}>
      <div
        className={cn(
          'w-full',
          disabled && 'pointer-events-none opacity-50',
          className
        )}
      >
        {items.map((item) => (
          <AccordionItemComponent
            key={item.id}
            item={{
              ...item,
              className: cn(itemClassName, item.className),
            }}
            iconPosition={iconPosition}
            triggerClassName={triggerClassName}
            contentClassName={contentClassName}
            variant={variant}
            size={size}
          />
        ))}
      </div>
    </AccordionContext.Provider>
  );
};

// Compound component exports for advanced usage
export const AccordionItem = AccordionItemComponent;

// Hook for accessing accordion state
export { useAccordion };

// Default export
export default Accordion;
