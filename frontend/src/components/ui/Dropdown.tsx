'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { ChevronDownIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Dropdown variants
const dropdownVariants = cva(
  'relative inline-block text-left',
  {
    variants: {
      size: {
        sm: 'text-xs',
        default: 'text-sm',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const dropdownTriggerVariants = cva(
  'inline-flex w-full justify-between items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-input hover:bg-accent hover:text-accent-foreground',
        outline: 'border-2 border-input hover:bg-accent hover:text-accent-foreground',
        ghost: 'border-transparent bg-transparent hover:bg-accent hover:text-accent-foreground',
        filled: 'border-transparent bg-muted hover:bg-muted/80',
      },
      size: {
        sm: 'h-8 px-2 text-xs',
        default: 'h-10 px-3 text-sm',
        lg: 'h-12 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const dropdownContentVariants = cva(
  'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
  {
    variants: {
      align: {
        start: '',
        center: '',
        end: '',
      },
      side: {
        top: 'mb-1',
        right: 'ml-1',
        bottom: 'mt-1',
        left: 'mr-1',
      },
    },
    defaultVariants: {
      align: 'center',
      side: 'bottom',
    },
  }
);

const dropdownItemVariants = cva(
  'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  {
    variants: {
      variant: {
        default: '',
        destructive: 'text-destructive focus:bg-destructive focus:text-destructive-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// Types
export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
  shortcut?: string;
  divider?: boolean;
}

export interface DropdownProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
    VariantProps<typeof dropdownVariants> {
  options?: DropdownOption[];
  trigger?: React.ReactNode;
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  closeOnSelect?: boolean;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  alignOffset?: number;
  modal?: boolean;
}

// Context
interface DropdownContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  value?: string | string[];
  onValueChange?: (value: string) => void;
  options: DropdownOption[];
  multiple: boolean;
  closeOnSelect: boolean;
  triggerRef: React.RefObject<HTMLButtonElement>;
  contentRef: React.RefObject<HTMLDivElement>;
}

const DropdownContext = createContext<DropdownContextType | null>(null);

const useDropdownContext = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('Dropdown components must be used within Dropdown');
  }
  return context;
};

// Hook for dropdown positioning
const useDropdownPosition = (
  triggerRef: React.RefObject<HTMLButtonElement>,
  contentRef: React.RefObject<HTMLDivElement>,
  open: boolean,
  side: 'top' | 'right' | 'bottom' | 'left' = 'bottom',
  align: 'start' | 'center' | 'end' = 'start',
  sideOffset: number = 4,
  alignOffset: number = 0
) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!open || !triggerRef.current || !contentRef.current) return;

    const updatePosition = () => {
      const triggerRect = triggerRef.current!.getBoundingClientRect();
      const contentRect = contentRef.current!.getBoundingClientRect();
      const viewport = { width: window.innerWidth, height: window.innerHeight };

      let x = 0;
      let y = 0;

      // Calculate base position
      switch (side) {
        case 'top':
          x = triggerRect.left;
          y = triggerRect.top - contentRect.height - sideOffset;
          break;
        case 'bottom':
          x = triggerRect.left;
          y = triggerRect.bottom + sideOffset;
          break;
        case 'left':
          x = triggerRect.left - contentRect.width - sideOffset;
          y = triggerRect.top;
          break;
        case 'right':
          x = triggerRect.right + sideOffset;
          y = triggerRect.top;
          break;
      }

      // Handle alignment
      if (side === 'top' || side === 'bottom') {
        switch (align) {
          case 'center':
            x = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
            break;
          case 'end':
            x = triggerRect.right - contentRect.width;
            break;
        }
        x += alignOffset;
      } else {
        switch (align) {
          case 'center':
            y = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
            break;
          case 'end':
            y = triggerRect.bottom - contentRect.height;
            break;
        }
        y += alignOffset;
      }

      // Collision detection
      const padding = 8;
      if (x < padding) x = padding;
      if (y < padding) y = padding;
      if (x + contentRect.width > viewport.width - padding) {
        x = viewport.width - contentRect.width - padding;
      }
      if (y + contentRect.height > viewport.height - padding) {
        y = viewport.height - contentRect.height - padding;
      }

      setPosition({ x, y });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [open, side, align, sideOffset, alignOffset, triggerRef, contentRef]);

  return position;
};

// Main Dropdown component
export const Dropdown: React.FC<DropdownProps> = ({
  children,
  options = [],
  // trigger prop reserved for custom trigger elements
  placeholder = 'Select option',
  value,
  onValueChange,
  onOpenChange,
  disabled = false,
  multiple = false,
  searchable = false,
  clearable = false,
  closeOnSelect = true,
  side = 'bottom',
  align = 'start',
  sideOffset = 4,
  alignOffset = 0,
  modal = false,
  size = 'default',
  className,
  ...props
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [internalValue, setInternalValue] = useState<string | string[]>(
    multiple ? [] : ''
  );
  
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const currentValue = value !== undefined ? value : internalValue;
  
  const filteredOptions = searchable && searchQuery
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
    if (!newOpen) {
      setSearchQuery('');
    }
  }, [onOpenChange]);

  const handleValueChange = (newValue: string) => {
    let updatedValue: string | string[];

    if (multiple) {
      const arrayValue = Array.isArray(currentValue) ? currentValue : [];
      updatedValue = arrayValue.includes(newValue)
        ? arrayValue.filter(v => v !== newValue)
        : [...arrayValue, newValue];
    } else {
      updatedValue = newValue;
      if (closeOnSelect) {
        handleOpenChange(false);
      }
    }

    if (value === undefined) {
      setInternalValue(updatedValue);
    }
    
    onValueChange?.(Array.isArray(updatedValue) ? updatedValue.join(',') : updatedValue);
  };

  const position = useDropdownPosition(
    triggerRef as React.RefObject<HTMLButtonElement>,
    contentRef as React.RefObject<HTMLDivElement>,
    open,
    side,
    align,
    sideOffset,
    alignOffset
  );

  const contextValue: DropdownContextType = {
    open,
    setOpen: handleOpenChange,
    value: currentValue,
    onValueChange: handleValueChange,
    options: filteredOptions,
    multiple,
    closeOnSelect,
    triggerRef: triggerRef as React.RefObject<HTMLButtonElement>,
    contentRef: contentRef as React.RefObject<HTMLDivElement>,
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        contentRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        !contentRef.current.contains(event.target as Node)
      ) {
        handleOpenChange(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, handleOpenChange]);

  // Close on escape key
  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, handleOpenChange]);

  const selectedOption = options.find(opt => opt.value === currentValue);
  const selectedOptions = multiple && Array.isArray(currentValue) 
    ? options.filter(opt => currentValue.includes(opt.value))
    : [];

  return (
    <DropdownContext.Provider value={contextValue}>
      <div className={cn(dropdownVariants({ size }), className)} {...props}>
        {/* Trigger */}
        <button
          ref={triggerRef}
          type="button"
          className={cn(
            dropdownTriggerVariants({ size }),
            disabled && 'cursor-not-allowed opacity-50'
          )}
          onClick={() => !disabled && handleOpenChange(!open)}
          disabled={disabled}
          {...{ 'aria-expanded': open ? 'true' : 'false' }}
          aria-haspopup="listbox"
        >
          <span className="flex-1 text-left truncate">
            {multiple && selectedOptions.length > 0
              ? `${selectedOptions.length} selected`
              : selectedOption?.label || placeholder
            }
          </span>
          
          <div className="flex items-center space-x-1">
            {clearable && (selectedOption || selectedOptions.length > 0) && (
              <button
                type="button"
                title="Clear selection"
                className="flex h-4 w-4 items-center justify-center rounded hover:bg-accent"
                onClick={(e) => {
                  e.stopPropagation();
                  handleValueChange(multiple ? '' : '');
                }}
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            )}
            <ChevronDownIcon 
              className={cn(
                'h-4 w-4 transition-transform',
                open && 'rotate-180'
              )} 
            />
          </div>
        </button>

        {/* Content */}
        <AnimatePresence>
          {open && (
            <>
              {modal && (
                <div className="fixed inset-0 z-40 bg-transparent" />
              )}
              
              <motion.div
                ref={contentRef}
                className={cn(
                  dropdownContentVariants({ side, align }),
                  'fixed w-full min-w-[200px] max-h-[300px] overflow-auto'
                )}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.1 }}
                style={{
                  left: position.x,
                  top: position.y,
                  minWidth: triggerRef.current?.offsetWidth,
                }}
              >
                {searchable && (
                  <div className="p-1">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-input rounded focus:outline-none focus:ring-1 focus:ring-ring"
                      autoFocus
                    />
                  </div>
                )}

                <div className="py-1">
                  {filteredOptions.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No options found
                    </div>
                  ) : (
                    filteredOptions.map((option, index) => (
                      <React.Fragment key={option.value}>
                        {option.divider && index > 0 && (
                          <hr className="my-1 border-border" />
                        )}
                        <DropdownItem option={option} />
                      </React.Fragment>
                    ))
                  )}
                </div>

                {children}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </DropdownContext.Provider>
  );
};

// Dropdown Item component
interface DropdownItemProps {
  option: DropdownOption;
}

const DropdownItem: React.FC<DropdownItemProps> = ({ option }) => {
  const { onValueChange, value, multiple } = useDropdownContext();

  const isSelected = multiple 
    ? Array.isArray(value) && value.includes(option.value)
    : value === option.value;

  const handleClick = () => {
    if (!option.disabled) {
      onValueChange?.(option.value);
    }
  };

  return (
    <div
      className={cn(
        dropdownItemVariants(),
        option.disabled && 'opacity-50 cursor-not-allowed',
        isSelected && 'bg-accent text-accent-foreground'
      )}
      onClick={handleClick}
    >
      {multiple && (
        <span className="flex h-3.5 w-3.5 items-center justify-center mr-2">
          {isSelected && <CheckIcon className="h-3 w-3" />}
        </span>
      )}
      
      {option.icon && (
        <span className="mr-2 h-4 w-4">{option.icon}</span>
      )}
      
      <div className="flex-1">
        <div className="text-sm">{option.label}</div>
        {option.description && (
          <div className="text-xs text-muted-foreground">
            {option.description}
          </div>
        )}
      </div>
      
      {option.shortcut && (
        <span className="ml-auto text-xs text-muted-foreground">
          {option.shortcut}
        </span>
      )}
    </div>
  );
};

// Simple dropdown with preset options
export interface SimpleDropdownProps extends Omit<DropdownProps, 'options'> {
  items: string[] | { label: string; value: string }[];
}

export const SimpleDropdown: React.FC<SimpleDropdownProps> = ({
  items,
  ...props
}) => {
  const options: DropdownOption[] = items.map(item => 
    typeof item === 'string' 
      ? { value: item, label: item }
      : { value: item.value, label: item.label }
  );

  return <Dropdown {...props} options={options} />;
};

Dropdown.displayName = 'Dropdown';
SimpleDropdown.displayName = 'SimpleDropdown';

export default Dropdown;
