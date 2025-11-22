'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Reorder, AnimatePresence } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { 
  Bars3Icon, 
  ChevronUpIcon, 
  ChevronDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';

// Ordering variants
const orderingVariants = cva(
  'relative w-full bg-background border rounded-lg',
  {
    variants: {
      size: {
        sm: 'text-sm',
        default: 'text-base',
        lg: 'text-lg',
      },
      variant: {
        default: 'border-border',
        outline: 'border-input',
        ghost: 'border-transparent',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
);

const orderItemVariants = cva(
  'flex items-center gap-3 p-3 cursor-move select-none transition-colors',
  {
    variants: {
      state: {
        default: 'bg-background hover:bg-accent/50',
        active: 'bg-accent text-accent-foreground',
        disabled: 'opacity-50 cursor-not-allowed',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  }
);

// Types
export interface OrderItem {
  id: string | number;
  label: string;
  value?: unknown;
  disabled?: boolean;
  icon?: React.ReactNode;
  metadata?: {
    description?: string;
    [key: string]: unknown;
  };
}

export interface OrderingProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'>,
    VariantProps<typeof orderingVariants> {
  items: OrderItem[];
  value?: (string | number)[];
  defaultValue?: (string | number)[];
  onOrderChange?: (orderedIds: (string | number)[], orderedItems: OrderItem[]) => void;
  showDragHandle?: boolean;
  showOrderControls?: boolean;
  showResetButton?: boolean;
  disabled?: boolean;
  orientation?: 'vertical' | 'horizontal';
  dragConstraints?: boolean;
  animateLayoutChanges?: boolean;
}

// Main Ordering component
export const Ordering = React.forwardRef<HTMLDivElement, OrderingProps>(
  ({
    className,
    items: initialItems,
    value,
    defaultValue,
    onOrderChange,
    showDragHandle = true,
    showOrderControls = false,
    showResetButton = false,
    disabled = false,
    orientation = 'vertical',
    dragConstraints = false,
    animateLayoutChanges = true,
    size = 'default',
    variant = 'default',
    ...props
  }, ref) => {
    const [items, setItems] = useState(() => {
      if (value || defaultValue) {
        const orderIds = value || defaultValue || [];
        return orderIds
          .map(id => initialItems.find(item => item.id === id))
          .filter(Boolean) as OrderItem[];
      }
      return initialItems;
    });

    const [activeItem, setActiveItem] = useState<string | number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Update items when value prop changes
    useEffect(() => {
      if (value) {
        const orderedItems = value
          .map(id => initialItems.find(item => item.id === id))
          .filter(Boolean) as OrderItem[];
        setItems(orderedItems);
      }
    }, [value, initialItems]);

    // Handle reorder
    const handleReorder = React.useCallback((newItems: OrderItem[]) => {
      setItems(newItems);
      const orderedIds = newItems.map(item => item.id);
      onOrderChange?.(orderedIds, newItems);
    }, [onOrderChange]);

    // Move item up
    const moveUp = React.useCallback((index: number) => {
      if (index > 0) {
        const newItems = [...items];
        [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
        handleReorder(newItems);
      }
    }, [items, handleReorder]);

    // Move item down
    const moveDown = React.useCallback((index: number) => {
      if (index < items.length - 1) {
        const newItems = [...items];
        [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
        handleReorder(newItems);
      }
    }, [items, handleReorder]);

    // Reset to original order
    const resetOrder = React.useCallback(() => {
      setItems(initialItems);
      const orderedIds = initialItems.map(item => item.id);
      onOrderChange?.(orderedIds, initialItems);
    }, [initialItems, onOrderChange]);

    // Move to top
    const moveToTop = React.useCallback((index: number) => {
      const newItems = [...items];
      const item = newItems.splice(index, 1)[0];
      newItems.unshift(item);
      handleReorder(newItems);
    }, [items, handleReorder]);

    // Move to bottom
    const moveToBottom = React.useCallback((index: number) => {
      const newItems = [...items];
      const item = newItems.splice(index, 1)[0];
      newItems.push(item);
      handleReorder(newItems);
    }, [items, handleReorder]);

    return (
      <div
        ref={ref}
        className={cn(orderingVariants({ size, variant }), className)}
        {...props}
      >
        {/* Header with controls */}
        {(showResetButton || showOrderControls) && (
          <div className="flex items-center justify-between p-3 border-b">
            <span className="text-sm font-medium text-muted-foreground">
              {items.length} item{items.length !== 1 ? 's' : ''}
            </span>
            
            <div className="flex items-center gap-2">
              {showResetButton && (
                <button
                  type="button"
                  className={cn(
                    'px-3 py-1 text-xs rounded-md border transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                    disabled && 'opacity-50 cursor-not-allowed'
                  )}
                  onClick={resetOrder}
                  disabled={disabled}
                >
                  Reset Order
                </button>
              )}
            </div>
          </div>
        )}

        {/* Reorderable list */}
        <div ref={containerRef} className="relative">
          <Reorder.Group
            axis={orientation === 'vertical' ? 'y' : 'x'}
            values={items}
            onReorder={handleReorder}
            className={cn(
              'space-y-1 p-1',
              orientation === 'horizontal' && 'flex space-y-0 space-x-1'
            )}
            layoutScroll
          >
            <AnimatePresence>
              {items.map((item, index) => (
                <Reorder.Item
                  key={item.id}
                  value={item}
                  id={`item-${item.id}`}
                  drag={!disabled && !item.disabled}
                  dragConstraints={dragConstraints ? containerRef : undefined}
                  dragElastic={0.1}
                  onDragStart={() => setActiveItem(item.id)}
                  onDragEnd={() => setActiveItem(null)}
                  className={cn(
                    orderItemVariants({
                      state: item.disabled 
                        ? 'disabled' 
                        : activeItem === item.id 
                        ? 'active' 
                        : 'default'
                    })
                  )}
                  whileDrag={{ 
                    scale: 1.02, 
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  layout={animateLayoutChanges ? true : undefined}
                  transition={{ duration: 0.2 }}
                >
                  {/* Drag handle */}
                  {showDragHandle && (
                    <div className="flex-shrink-0 p-1 cursor-grab active:cursor-grabbing">
                      <Bars3Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}

                  {/* Item icon */}
                  {item.icon && (
                    <div className="flex-shrink-0">
                      {item.icon}
                    </div>
                  )}

                  {/* Item content */}
                  <div className="flex-1 min-w-0">
                    <span className="block truncate font-medium">
                      {item.label}
                    </span>
                    {item.metadata?.description && (
                      <span className="block text-sm text-muted-foreground truncate">
                        {item.metadata.description}
                      </span>
                    )}
                  </div>

                  {/* Order controls */}
                  {showOrderControls && !disabled && !item.disabled && (
                    <div className="flex-shrink-0 flex items-center">
                      <div className="flex flex-col">
                        <button
                          type="button"
                          className={cn(
                            'p-1 rounded hover:bg-accent/50 transition-colors',
                            index === 0 && 'opacity-50 cursor-not-allowed'
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            moveUp(index);
                          }}
                          disabled={index === 0}
                          aria-label="Move up"
                        >
                          <ChevronUpIcon className="h-3 w-3" />
                        </button>
                        
                        <button
                          type="button"
                          className={cn(
                            'p-1 rounded hover:bg-accent/50 transition-colors',
                            index === items.length - 1 && 'opacity-50 cursor-not-allowed'
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            moveDown(index);
                          }}
                          disabled={index === items.length - 1}
                          aria-label="Move down"
                        >
                          <ChevronDownIcon className="h-3 w-3" />
                        </button>
                      </div>
                      
                      {/* Additional controls dropdown */}
                      <div className="relative ml-1">
                        <button
                          type="button"
                          className="p-1 rounded hover:bg-accent/50 transition-colors group"
                          aria-label="More options"
                        >
                          <EllipsisVerticalIcon className="h-3 w-3" />
                        </button>
                        
                        {/* Dropdown menu (simplified) */}
                        <div className="absolute right-0 top-full mt-1 w-32 bg-popover border rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-10">
                          <button
                            type="button"
                            className="flex w-full items-center px-3 py-2 text-sm hover:bg-accent/50 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveToTop(index);
                            }}
                          >
                            <ArrowUpIcon className="h-3 w-3 mr-2" />
                            Move to top
                          </button>
                          
                          <button
                            type="button"
                            className="flex w-full items-center px-3 py-2 text-sm hover:bg-accent/50 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveToBottom(index);
                            }}
                          >
                            <ArrowDownIcon className="h-3 w-3 mr-2" />
                            Move to bottom
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>
        </div>
      </div>
    );
  }
);

Ordering.displayName = 'Ordering';

// Simple ordering component with minimal features
export interface SimpleOrderingProps extends Omit<OrderingProps, 'showDragHandle' | 'showOrderControls'> {
  placeholder?: string;
}

export const SimpleOrdering = React.forwardRef<HTMLDivElement, SimpleOrderingProps>(
  ({ ...props }, ref) => {
    return (
      <Ordering
        ref={ref}
        showDragHandle={true}
        showOrderControls={false}
        showResetButton={false}
        {...props}
      />
    );
  }
);

SimpleOrdering.displayName = 'SimpleOrdering';

// Advanced ordering with all features enabled
export interface AdvancedOrderingProps extends OrderingProps {
  title?: string;
  description?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export const AdvancedOrdering = React.forwardRef<HTMLDivElement, AdvancedOrderingProps>(
  ({ 
    title,
    description,
    searchable = false,
    searchPlaceholder = 'Search items...',
    className,
    items: originalItems,
    ...props 
  }, ref) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredItems, setFilteredItems] = useState(originalItems);

    // Filter items based on search
    useEffect(() => {
      if (!searchTerm) {
        setFilteredItems(originalItems);
        return;
      }

      const filtered = originalItems.filter(item =>
        item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.metadata?.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
    }, [searchTerm, originalItems]);

    return (
      <div className={cn('space-y-4', className)}>
        {/* Header */}
        {(title || description) && (
          <div>
            {title && (
              <h3 className="text-lg font-semibold">{title}</h3>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        )}

        {/* Search */}
        {searchable && (
          <div className="relative">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                'w-full px-3 py-2 text-sm bg-background border rounded-md',
                'placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
              )}
            />
          </div>
        )}

        {/* Ordering component */}
        <Ordering
          ref={ref}
          items={filteredItems}
          showDragHandle={true}
          showOrderControls={true}
          showResetButton={true}
          {...props}
        />
      </div>
    );
  }
);

AdvancedOrdering.displayName = 'AdvancedOrdering';

// Horizontal ordering variant
export const HorizontalOrdering = React.forwardRef<HTMLDivElement, OrderingProps>(
  ({ orientation = 'horizontal', className, ...props }, ref) => {
    return (
      <Ordering
        ref={ref}
        orientation={orientation}
        className={cn('border-0', className)}
        {...props}
      />
    );
  }
);

HorizontalOrdering.displayName = 'HorizontalOrdering';

export default Ordering;
