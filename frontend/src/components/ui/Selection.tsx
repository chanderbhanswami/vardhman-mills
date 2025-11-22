'use client';

import React, { 
  useState, 
  useCallback, 
  forwardRef,
  createContext,
  useContext
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import Image from 'next/image';

// Selection Context
interface SelectionContextType {
  selectedItems: string[];
  onSelectionChange: (items: string[]) => void;
  selectionMode: 'single' | 'multiple';
  disabled?: boolean;
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

const useSelectionContext = () => {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('Selection components must be used within a SelectionProvider');
  }
  return context;
};

// Selection variants
const selectionVariants = cva(
  'relative select-none',
  {
    variants: {
      variant: {
        default: '',
        bordered: 'border border-border rounded-md',
        filled: 'bg-muted/50 rounded-md',
        ghost: ''
      },
      size: {
        sm: 'text-sm',
        default: 'text-base',
        lg: 'text-lg'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

// Selection item variants
const itemVariants = cva(
  'flex items-center gap-3 p-2 cursor-pointer transition-all rounded-md',
  {
    variants: {
      variant: {
        default: 'hover:bg-accent/50',
        bordered: 'border border-transparent hover:border-border hover:bg-accent/30',
        filled: 'bg-background hover:bg-accent/50',
        ghost: 'hover:bg-accent/30'
      },
      state: {
        default: '',
        selected: 'bg-primary/10 text-primary border-primary/30',
        disabled: 'opacity-50 cursor-not-allowed pointer-events-none'
      },
      size: {
        sm: 'p-1 text-sm',
        default: 'p-2 text-base',
        lg: 'p-3 text-lg'
      }
    },
    defaultVariants: {
      variant: 'default',
      state: 'default',
      size: 'default'
    }
  }
);

// Selection Item Props
export interface SelectionItemProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
    VariantProps<typeof itemVariants> {
  value: string;
  label?: string;
  description?: string;
  icon?: React.ReactNode;
  avatar?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
  showCheckbox?: boolean;
  children?: React.ReactNode;
}

// Selection Item Component
export const SelectionItem = forwardRef<HTMLDivElement, SelectionItemProps>(
  ({
    className,
    value,
    label,
    description,
    icon,
    avatar,
    badge,
    disabled: itemDisabled,
    showCheckbox = true,
    children,
    variant,
    size,
    onClick,
    ...props
  }, ref) => {
    const { selectedItems, onSelectionChange, selectionMode, disabled: contextDisabled } = useSelectionContext();
    
    const isSelected = selectedItems.includes(value);
    const isDisabled = contextDisabled || itemDisabled;

    const handleClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
      if (isDisabled) return;

      let newSelection: string[];
      
      if (selectionMode === 'single') {
        newSelection = isSelected ? [] : [value];
      } else {
        if (isSelected) {
          newSelection = selectedItems.filter(id => id !== value);
        } else {
          newSelection = [...selectedItems, value];
        }
      }
      
      onSelectionChange(newSelection);
      onClick?.(event);
    }, [isSelected, isDisabled, selectedItems, onSelectionChange, selectionMode, value, onClick]);

    return (
      <motion.div
        ref={ref}
        className={cn(
          itemVariants({ 
            variant, 
            size, 
            state: isDisabled ? 'disabled' : isSelected ? 'selected' : 'default'
          }),
          className
        )}
        onClick={handleClick}
        role="option"
        aria-selected={isSelected}
        aria-disabled={isDisabled}
        tabIndex={isDisabled ? -1 : 0}
        whileHover={!isDisabled ? { scale: 1.02 } : {}}
        whileTap={!isDisabled ? { scale: 0.98 } : {}}
        style={props.style}
        id={props.id}
        onMouseEnter={props.onMouseEnter}
        onMouseLeave={props.onMouseLeave}
        onKeyDown={props.onKeyDown}
      >
        {/* Checkbox/Radio indicator */}
        {showCheckbox && (
          <div className="flex-shrink-0">
            {selectionMode === 'single' ? (
              <div className={cn(
                'w-4 h-4 rounded-full border-2 border-border flex items-center justify-center',
                isSelected && 'border-primary bg-primary'
              )}>
                {isSelected && (
                  <motion.div
                    className="w-2 h-2 bg-primary-foreground rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </div>
            ) : (
              <div className={cn(
                'w-4 h-4 border-2 border-border rounded flex items-center justify-center transition-colors',
                isSelected && 'border-primary bg-primary'
              )}>
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      <CheckIcon className="w-3 h-3 text-primary-foreground" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* Avatar */}
        {avatar && (
          <div className="flex-shrink-0">
            {avatar}
          </div>
        )}

        {/* Icon */}
        {icon && !avatar && (
          <div className="flex-shrink-0 text-muted-foreground">
            {icon}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {children ? (
            children
          ) : (
            <div>
              <div className="flex items-center gap-2">
                {label && (
                  <span className="font-medium truncate">
                    {label}
                  </span>
                )}
                {badge && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                    {badge}
                  </span>
                )}
              </div>
              {description && (
                <p className="text-sm text-muted-foreground mt-0.5 truncate">
                  {description}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Selection indicator */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              className="flex-shrink-0 text-primary"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <CheckIcon className="w-4 h-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

SelectionItem.displayName = 'SelectionItem';

// Selection Container Props
export interface SelectionProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof selectionVariants> {
  selectedItems?: string[];
  defaultSelectedItems?: string[];
  onSelectionChange?: (items: string[]) => void;
  selectionMode?: 'single' | 'multiple';
  disabled?: boolean;
  max?: number;
  min?: number;
  allowEmpty?: boolean;
}

// Main Selection Container
export const Selection = forwardRef<HTMLDivElement, SelectionProps>(
  ({
    className,
    children,
    selectedItems,
    defaultSelectedItems = [],
    onSelectionChange,
    selectionMode = 'multiple',
    disabled = false,
    max,
    min,
    allowEmpty = true,
    variant,
    size,
    ...props
  }, ref) => {
    const [internalSelected, setInternalSelected] = useState<string[]>(defaultSelectedItems);
    
    const currentSelected = selectedItems !== undefined ? selectedItems : internalSelected;

    const handleSelectionChange = useCallback((items: string[]) => {
      // Apply constraints
      let newItems = [...items];
      
      // Apply max constraint
      if (max !== undefined && newItems.length > max) {
        newItems = newItems.slice(0, max);
      }
      
      // Apply min constraint
      if (min !== undefined && newItems.length < min) {
        return; // Don't allow selection below minimum
      }
      
      // Apply allowEmpty constraint
      if (!allowEmpty && newItems.length === 0 && currentSelected.length > 0) {
        return; // Don't allow empty selection if not allowed
      }

      if (selectedItems === undefined) {
        setInternalSelected(newItems);
      }
      onSelectionChange?.(newItems);
    }, [selectedItems, onSelectionChange, max, min, allowEmpty, currentSelected.length]);

    return (
      <SelectionContext.Provider
        value={{
          selectedItems: currentSelected,
          onSelectionChange: handleSelectionChange,
          selectionMode,
          disabled
        }}
      >
        <div
          ref={ref}
          className={cn(selectionVariants({ variant, size }), className)}
          role="group"
          aria-label="Selection list"
          {...(disabled !== undefined && { 'aria-disabled': disabled ? 'true' : 'false' })}
          {...props}
        >
          {children}
        </div>
      </SelectionContext.Provider>
    );
  }
);

Selection.displayName = 'Selection';

// Selection Group (for organizing items)
export interface SelectionGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  description?: string;
}

export const SelectionGroup = forwardRef<HTMLDivElement, SelectionGroupProps>(
  ({ className, children, label, description, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-1', className)} {...props}>
        {(label || description) && (
          <div className="px-2 py-1">
            {label && (
              <div className="text-sm font-medium text-foreground">
                {label}
              </div>
            )}
            {description && (
              <div className="text-xs text-muted-foreground">
                {description}
              </div>
            )}
          </div>
        )}
        <div className="space-y-0.5">
          {children}
        </div>
      </div>
    );
  }
);

SelectionGroup.displayName = 'SelectionGroup';

// Selection Actions (for bulk actions)
export interface SelectionActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedCount?: number;
  totalCount?: number;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  onDeleteSelected?: () => void;
  actions?: React.ReactNode;
}

export const SelectionActions = forwardRef<HTMLDivElement, SelectionActionsProps>(
  ({
    className,
    selectedCount = 0,
    totalCount = 0,
    onSelectAll,
    onClearSelection,
    onDeleteSelected,
    actions,
    ...props
  }, ref) => {
    const hasSelection = selectedCount > 0;
    const isAllSelected = selectedCount === totalCount && totalCount > 0;

    return (
      <AnimatePresence>
        {hasSelection && (
          <motion.div
            ref={ref}
            className={cn(
              'flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-md',
              className
            )}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            {...Object.fromEntries(Object.entries(props).filter(([key]) => !['onDrag', 'onDragStart', 'onDragEnd'].includes(key)))}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {selectedCount} of {totalCount} selected
              </span>
              
              {onSelectAll && !isAllSelected && (
                <button
                  onClick={onSelectAll}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  Select all
                </button>
              )}
              
              {onClearSelection && (
                <button
                  onClick={onClearSelection}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Clear selection
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {actions}
              
              {onDeleteSelected && (
                <button
                  onClick={onDeleteSelected}
                  className="inline-flex items-center gap-1 px-2 py-1 text-sm text-destructive hover:bg-destructive/10 rounded transition-colors"
                >
                  <XMarkIcon className="w-3 h-3" />
                  Delete
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

SelectionActions.displayName = 'SelectionActions';

// Preset Selection Lists
export interface SimpleSelectionProps extends SelectionProps {
  items: {
    value: string;
    label: string;
    description?: string;
    icon?: React.ReactNode;
    disabled?: boolean;
  }[];
}

export const SimpleSelection = forwardRef<HTMLDivElement, SimpleSelectionProps>(
  ({ items, ...props }, ref) => {
    return (
      <Selection ref={ref} {...props}>
        {items.map((item) => (
          <SelectionItem
            key={item.value}
            value={item.value}
            label={item.label}
            description={item.description}
            icon={item.icon}
            disabled={item.disabled}
          />
        ))}
      </Selection>
    );
  }
);

SimpleSelection.displayName = 'SimpleSelection';

// Card Selection
export interface CardSelectionProps extends SelectionProps {
  items: {
    value: string;
    title: string;
    description?: string;
    image?: string;
    badge?: string | number;
    disabled?: boolean;
  }[];
}

export const CardSelection = forwardRef<HTMLDivElement, CardSelectionProps>(
  ({ items, className, ...props }, ref) => {
    return (
      <Selection ref={ref} className={cn('grid gap-3', className)} variant="bordered" {...props}>
        {items.map((item) => (
          <SelectionItem
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className="p-4"
            showCheckbox={false}
          >
            <div className="w-full">
              {item.image && (
                <div className="mb-3 relative w-full h-32">
                  <Image 
                    src={item.image} 
                    alt={item.title} 
                    fill 
                    className="object-cover rounded" 
                  />
                </div>
              )}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{item.title}</h3>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                  )}
                </div>
                {item.badge && (
                  <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                    {item.badge}
                  </span>
                )}
              </div>
            </div>
          </SelectionItem>
        ))}
      </Selection>
    );
  }
);

CardSelection.displayName = 'CardSelection';

export default Selection;

