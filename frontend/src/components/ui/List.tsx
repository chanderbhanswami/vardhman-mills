'use client';

import React, { forwardRef, useState, useCallback, useMemo } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRightIcon, 
  ChevronDownIcon,
  CheckIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';

// List variants
const listVariants = cva(
  'divide-y divide-gray-200',
  {
    variants: {
      variant: {
        default: 'bg-white',
        bordered: 'border border-gray-200 rounded-lg bg-white',
        card: 'bg-white rounded-lg shadow-sm border border-gray-200',
        flush: 'bg-transparent',
      },
      size: {
        sm: '[&>*]:py-2 [&>*]:px-3',
        md: '[&>*]:py-3 [&>*]:px-4',
        lg: '[&>*]:py-4 [&>*]:px-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const listItemVariants = cva(
  'flex items-center justify-between transition-colors',
  {
    variants: {
      interactive: {
        true: 'hover:bg-gray-50 cursor-pointer',
        false: '',
      },
      selected: {
        true: 'bg-blue-50 border-l-4 border-blue-500',
        false: '',
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed',
        false: '',
      },
    },
    defaultVariants: {
      interactive: false,
      selected: false,
      disabled: false,
    },
  }
);

// List Item Props
export interface ListItemProps extends VariantProps<typeof listItemVariants> {
  children: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  description?: React.ReactNode;
  metadata?: React.ReactNode;
  onClick?: () => void;
  onAction?: () => void;
  actionLabel?: string;
  expandable?: boolean;
  expanded?: boolean;
  onToggleExpand?: () => void;
  className?: string;
  contentClassName?: string;
}

// List Item Component
export const ListItem = forwardRef<HTMLDivElement, ListItemProps>(
  ({
    children,
    prefix,
    suffix,
    description,
    metadata,
    onClick,
    onAction,
    actionLabel = 'Action',
    expandable = false,
    expanded = false,
    onToggleExpand,
    interactive = !!onClick,
    selected = false,
    disabled = false,
    className,
    contentClassName,
    ...props
  }, ref) => {
    const [isExpanded, setIsExpanded] = useState(expanded);
    
    const handleClick = () => {
      if (disabled) return;
      
      if (expandable) {
        const newExpanded = !isExpanded;
        setIsExpanded(newExpanded);
        onToggleExpand?.();
      }
      
      onClick?.();
    };
    
    const handleAction = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!disabled) {
        onAction?.();
      }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    };
    
    const currentExpanded = onToggleExpand ? expanded : isExpanded;
    
    return (
      <div
        ref={ref}
        className={cn(
          listItemVariants({ interactive, selected, disabled }),
          className
        )}
        onClick={handleClick}
        onKeyDown={interactive ? handleKeyDown : undefined}
        tabIndex={interactive && !disabled ? 0 : undefined}
        {...(interactive ? { role: 'button' } : {})}
        {...(expandable ? (currentExpanded ? { 'aria-expanded': 'true' } : { 'aria-expanded': 'false' }) : {})}
        {...props}
      >
        <div className={cn('flex items-center flex-1 min-w-0', contentClassName)}>
          {/* Expand/Collapse Icon */}
          {expandable && (
            <div className="flex-shrink-0 mr-2">
              <motion.div
                animate={{ rotate: currentExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRightIcon className="w-4 h-4 text-gray-400" />
              </motion.div>
            </div>
          )}
          
          {/* Prefix */}
          {prefix && (
            <div className="flex-shrink-0 mr-3">
              {prefix}
            </div>
          )}
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                {typeof children === 'string' ? (
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {children}
                  </p>
                ) : (
                  children
                )}
                
                {description && (
                  <div className="mt-1 text-sm text-gray-500">
                    {description}
                  </div>
                )}
              </div>
              
              {metadata && (
                <div className="flex-shrink-0 ml-3 text-sm text-gray-400">
                  {metadata}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Suffix */}
        {suffix && (
          <div className="flex-shrink-0 ml-3">
            {suffix}
          </div>
        )}
        
        {/* Action Button */}
        {onAction && (
          <button
            onClick={handleAction}
            className="flex-shrink-0 ml-3 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={actionLabel}
          >
            <EllipsisHorizontalIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  }
);

ListItem.displayName = 'ListItem';

// Main List Props
export interface ListProps extends VariantProps<typeof listVariants> {
  children: React.ReactNode;
  selectable?: boolean;
  multiSelect?: boolean;
  selectedItems?: string[];
  onSelectionChange?: (selectedItems: string[]) => void;
  emptyState?: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
  className?: string;
}

// Main List Component
export const List = forwardRef<HTMLDivElement, ListProps>(
  ({
    children,
    selectable = false,
    multiSelect = false,
    selectedItems = [],
    onSelectionChange,
    emptyState,
    loading = false,
    loadingText = 'Loading...',
    variant = 'default',
    size = 'md',
    className,
    ...props
  }, ref) => {
    const [internalSelection, setInternalSelection] = useState<string[]>(selectedItems);
    
    const currentSelection = onSelectionChange ? selectedItems : internalSelection;
    
    const handleItemSelection = useCallback((itemId: string) => {
      let newSelection: string[];
      
      if (multiSelect) {
        if (currentSelection.includes(itemId)) {
          newSelection = currentSelection.filter(id => id !== itemId);
        } else {
          newSelection = [...currentSelection, itemId];
        }
      } else {
        newSelection = currentSelection.includes(itemId) ? [] : [itemId];
      }
      
      if (onSelectionChange) {
        onSelectionChange(newSelection);
      } else {
        setInternalSelection(newSelection);
      }
    }, [currentSelection, multiSelect, onSelectionChange]);
    
    // Enhance children with selection logic
    const enhancedChildren = useMemo(() => {
      return React.Children.map(children, (child, index) => {
        if (React.isValidElement(child) && child.type === ListItem) {
          const childElement = child as React.ReactElement<{id?: string; selected?: boolean; onClick?: () => void}>;
          const itemId = childElement.key || childElement.props?.id || String(index);
          const isSelected = currentSelection.includes(String(itemId));
          
          return React.cloneElement(childElement, {
            ...childElement.props,
            selected: selectable ? isSelected : childElement.props?.selected,
            onClick: selectable 
              ? () => {
                  handleItemSelection(String(itemId));
                  childElement.props?.onClick?.();
                }
              : childElement.props?.onClick,
          });
        }
        return child;
      });
    }, [children, currentSelection, selectable, handleItemSelection]);
    
    // Loading state
    if (loading) {
      return (
        <div className={cn(listVariants({ variant, size }), className)}>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3 text-gray-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500" />
              <span>{loadingText}</span>
            </div>
          </div>
        </div>
      );
    }
    
    // Empty state
    if (React.Children.count(children) === 0 && emptyState) {
      return (
        <div className={cn(listVariants({ variant, size }), className)}>
          <div className="py-8">
            {emptyState}
          </div>
        </div>
      );
    }
    
    return (
      <div
        ref={ref}
        className={cn(listVariants({ variant, size }), className)}
        {...(selectable ? { role: 'listbox' } : { role: 'list' })}
        {...(selectable && multiSelect ? { 'aria-multiselectable': 'true' } : { 'aria-multiselectable': 'false' })}
        {...props}
      >
        <AnimatePresence>
          {enhancedChildren}
        </AnimatePresence>
      </div>
    );
  }
);

List.displayName = 'List';

// Collapsible List Component
export interface CollapsibleListProps extends ListProps {
  defaultExpanded?: boolean;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
}

export const CollapsibleList = forwardRef<HTMLDivElement, CollapsibleListProps>(
  ({
    title,
    subtitle,
    icon,
    defaultExpanded = false,
    children,
    className,
    ...props
  }, ref) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    
    return (
      <div className={cn('border border-gray-200 rounded-lg overflow-hidden', className)}>
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        >
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex-shrink-0">
                {icon}
              </div>
            )}
            
            <div className="text-left">
              {title && (
                <div className="font-medium text-gray-900">
                  {title}
                </div>
              )}
              {subtitle && (
                <div className="text-sm text-gray-500">
                  {subtitle}
                </div>
              )}
            </div>
          </div>
          
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
          </motion.div>
        </button>
        
        {/* Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <List
                ref={ref}
                variant="flush"
                {...props}
              >
                {children}
              </List>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

CollapsibleList.displayName = 'CollapsibleList';

// Checklist Component
export interface ChecklistProps extends Omit<ListProps, 'selectable' | 'multiSelect'> {
  items: {
    id: string;
    label: React.ReactNode;
    checked?: boolean;
    disabled?: boolean;
  }[];
  onItemChange?: (itemId: string, checked: boolean) => void;
  showProgress?: boolean;
}

export const Checklist = forwardRef<HTMLDivElement, ChecklistProps>(
  ({
    items,
    onItemChange,
    showProgress = true,
    className,
    ...props
  }, ref) => {
    const checkedCount = items.filter(item => item.checked).length;
    const totalCount = items.length;
    const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;
    
    return (
      <div className={className}>
        {/* Progress indicator */}
        {showProgress && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{checkedCount} of {totalCount} completed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}
        
        {/* Checklist items */}
        <List ref={ref} {...props}>
          {items.map((item) => (
            <ListItem
              key={item.id}
              disabled={item.disabled}
              onClick={() => onItemChange?.(item.id, !item.checked)}
              prefix={
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={item.checked || false}
                    onChange={() => {}} // Handled by onClick
                    disabled={item.disabled}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    tabIndex={-1}
                    aria-label={`Checkbox for ${typeof item.label === 'string' ? item.label : 'item'}`}
                  />
                  {item.checked && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center text-white pointer-events-none"
                    >
                      <CheckIcon className="w-3 h-3" />
                    </motion.div>
                  )}
                </div>
              }
            >
              <span className={item.checked ? 'line-through text-gray-500' : ''}>
                {item.label}
              </span>
            </ListItem>
          ))}
        </List>
      </div>
    );
  }
);

Checklist.displayName = 'Checklist';

// Virtual List Component (for large datasets)
export interface VirtualListProps<T = unknown> extends Omit<ListProps, 'children'> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
}

export const VirtualList = forwardRef<HTMLDivElement, VirtualListProps<unknown>>(
  ({
    items,
    itemHeight,
    containerHeight,
    renderItem,
    overscan = 5,
    className,
    ...props
  }, ref) => {
    const [scrollTop, setScrollTop] = useState(0);
    
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );
    
    const paddingTop = visibleStart * itemHeight;
    const paddingBottom = (items.length - visibleEnd - 1) * itemHeight;
    
    const visibleItems = items.slice(
      Math.max(0, visibleStart - overscan),
      Math.min(items.length, visibleEnd + 1 + overscan)
    );
    
    return (
      <div
        ref={ref}
        className={cn('overflow-auto', className)}
        data-container-height={containerHeight}
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
        {...props}
      >
        <div data-padding-top={paddingTop} data-padding-bottom={paddingBottom}>
          <List variant="flush" {...props}>
            {visibleItems.map((item, index) => (
              <div key={visibleStart - overscan + index} data-item-height={itemHeight}>
                {renderItem(item, visibleStart - overscan + index)}
              </div>
            ))}
          </List>
        </div>
      </div>
    );
  }
);

VirtualList.displayName = 'VirtualList';

export default List;
