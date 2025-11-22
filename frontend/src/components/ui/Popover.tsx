'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Popover variants
const popoverVariants = cva(
  'z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none',
  {
    variants: {
      side: {
        top: 'animate-in slide-in-from-bottom-2',
        right: 'animate-in slide-in-from-left-2',
        bottom: 'animate-in slide-in-from-top-2',
        left: 'animate-in slide-in-from-right-2',
      },
      align: {
        start: '',
        center: '',
        end: '',
      },
    },
    defaultVariants: {
      side: 'bottom',
      align: 'center',
    },
  }
);

// Types
export interface PopoverProps {
  children: React.ReactNode;
  trigger?: React.ReactNode;
  content?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
  avoidCollisions?: boolean;
  collisionPadding?: number;
  arrowPadding?: number;
  sticky?: 'partial' | 'always';
  hideWhenDetached?: boolean;
  className?: string;
  contentClassName?: string;
}

// Context
interface PopoverContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
  contentRef: React.RefObject<HTMLDivElement>;
}

const PopoverContext = createContext<PopoverContextType | null>(null);

const usePopoverContext = () => {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error('Popover components must be used within Popover');
  }
  return context;
};

// Position hook
const usePopoverPosition = (
  triggerRef: React.RefObject<HTMLButtonElement>,
  contentRef: React.RefObject<HTMLDivElement>,
  open: boolean,
  side: 'top' | 'right' | 'bottom' | 'left' = 'bottom',
  align: 'start' | 'center' | 'end' = 'center',
  sideOffset: number = 4,
  alignOffset: number = 0,
  avoidCollisions: boolean = true
) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [actualSide, setActualSide] = useState(side);

  useEffect(() => {
    if (!open || !triggerRef.current || !contentRef.current) return;

    const updatePosition = () => {
      if (!triggerRef.current || !contentRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();
      const viewport = { width: window.innerWidth, height: window.innerHeight };

      let x = 0;
      let y = 0;
      let currentSide = side;

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
      if (avoidCollisions) {
        const padding = 8;

        if (y < padding) {
          if (side === 'top') {
            y = triggerRect.bottom + sideOffset;
            currentSide = 'bottom';
          } else {
            y = padding;
          }
        } else if (y + contentRect.height > viewport.height - padding) {
          if (side === 'bottom') {
            y = triggerRect.top - contentRect.height - sideOffset;
            currentSide = 'top';
          } else {
            y = viewport.height - contentRect.height - padding;
          }
        }

        if (x < padding) {
          x = padding;
        } else if (x + contentRect.width > viewport.width - padding) {
          x = viewport.width - contentRect.width - padding;
        }
      }

      setPosition({ x, y });
      setActualSide(currentSide);
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, side, align, sideOffset, alignOffset, avoidCollisions, triggerRef, contentRef]);

  return { position, actualSide };
};

// Main Popover component
export const Popover: React.FC<PopoverProps> = ({
  children,
  trigger,
  content,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  modal = false,
  side = 'bottom',
  sideOffset = 4,
  align = 'center',
  alignOffset = 0,
  avoidCollisions = true,
  className,
  contentClassName,
}) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  }, [controlledOpen, onOpenChange]);

  const { position, actualSide } = usePopoverPosition(
    triggerRef as React.RefObject<HTMLButtonElement>,
    contentRef as React.RefObject<HTMLDivElement>,
    open,
    side,
    align,
    sideOffset,
    alignOffset,
    avoidCollisions
  );

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

  // Close on escape
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

  const contextValue: PopoverContextType = {
    open,
    setOpen: handleOpenChange,
    triggerRef: triggerRef as React.RefObject<HTMLButtonElement>,
    contentRef: contentRef as React.RefObject<HTMLDivElement>,
  };

  return (
    <PopoverContext.Provider value={contextValue}>
      <div className={cn('relative', className)}>
        {trigger ? (
          <div onClick={() => handleOpenChange(!open)}>
            {trigger}
          </div>
        ) : (
          <PopoverTrigger />
        )}

        <AnimatePresence>
          {open && (
            <>
              {modal && (
                <div className="fixed inset-0 z-40 bg-black/20" />
              )}
              
              <motion.div
                ref={contentRef}
                className={cn(
                  popoverVariants({ side: actualSide, align }),
                  'fixed z-50',
                  contentClassName
                )}
                style={{
                  left: position.x,
                  top: position.y,
                }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.1 }}
              >
                {content || children}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </PopoverContext.Provider>
  );
};

// Popover Trigger
export interface PopoverTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ className, children, asChild = false, ...props }, ref) => {
    const Component = asChild ? 'span' : 'button';
    const { open, setOpen, triggerRef } = usePopoverContext();
    const finalRef = ref || triggerRef;

    const handleClick = () => {
      setOpen(!open);
    };

    return (
      <Component
        ref={finalRef}
        type={asChild ? undefined : "button"}
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          'hover:bg-accent hover:text-accent-foreground',
          className
        )}
        onClick={handleClick}
        {...{ 'aria-expanded': open ? 'true' : 'false' }}
        aria-haspopup="dialog"
        {...props}
      >
        {children}
      </Component>
    );
  }
);

PopoverTrigger.displayName = 'PopoverTrigger';

// Popover Content
export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  alignOffset?: number;
  forceMount?: boolean;
}

export const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, children, ...props }, ref) => {
    const { contentRef } = usePopoverContext();
    const finalRef = ref || contentRef;

    return (
      <div
        ref={finalRef}
        className={cn(popoverVariants(), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

PopoverContent.displayName = 'PopoverContent';

// Simple popover with built-in trigger
export interface SimplePopoverProps extends Omit<PopoverProps, 'trigger'> {
  triggerText?: string;
  triggerVariant?: 'default' | 'outline' | 'ghost';
}

export const SimplePopover: React.FC<SimplePopoverProps> = ({
  triggerText = 'Open',
  triggerVariant = 'outline',
  children,
  ...props
}) => {
  const triggerClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  };

  return (
    <Popover
      {...props}
      trigger={
        <button
          type="button"
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            triggerClasses[triggerVariant]
          )}
        >
          {triggerText}
        </button>
      }
    >
      {children}
    </Popover>
  );
};

// Confirmation popover
export interface ConfirmPopoverProps {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  trigger?: React.ReactNode;
  destructive?: boolean;
}

export const ConfirmPopover: React.FC<ConfirmPopoverProps> = ({
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  trigger,
  destructive = false,
}) => {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm?.();
    setOpen(false);
  };

  const handleCancel = () => {
    onCancel?.();
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      contentClassName="w-80"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium leading-none">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            className="px-3 py-2 text-sm border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md"
            onClick={handleCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={cn(
              'px-3 py-2 text-sm rounded-md',
              destructive 
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Popover>
  );
};

Popover.displayName = 'Popover';
SimplePopover.displayName = 'SimplePopover';
ConfirmPopover.displayName = 'ConfirmPopover';

export default Popover;
